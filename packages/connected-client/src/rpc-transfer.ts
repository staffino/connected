/*
 * Copyright (c) 2019 Staffino, s.r.o. - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Created by Martin Komara, September 2019
 */
import find from 'array-find';
import arrayFrom from 'array-from';
import arrayFlat from 'array.prototype.flat';
import uuid from 'uuid/v4';
import DataLoader from 'dataloader';
import JaysonBrowserClient from 'jayson/lib/client/browser';
import type {
  JSONRPCErrorLike,
  JSONRPCIDLike,
  JSONRPCRequest,
  JSONRPCResultLike,
} from 'jayson';
import { SerializableValue } from './types';
import RpcError from './rpc-error';

type CallRequest = {
  id: string;
  procName: string;
  group?: string;
  params: Record<string, unknown>;
};

export type RpcTransferOptions = {
  url?: string;
};

type ResolveType = (value: unknown) => void;
function calculateClientResponse(
  resolve: ResolveType,
  err: Error,
  results?: Array<JSONRPCResultLike>
): void;
function calculateClientResponse(
  resolve: ResolveType,
  err: JSONRPCErrorLike,
  errors?: Array<JSONRPCErrorLike>,
  results?: Array<JSONRPCResultLike>
): void {
  resolve({ err, errors, successes: results });
}

export default class RpcTransfer {
  private readonly rpcClient: JaysonBrowserClient;

  private readonly dataLoader: DataLoader<CallRequest, JSONRPCResultLike>;

  constructor(urlOrOptions?: string | RpcTransferOptions) {
    let url = '/rpc';
    if (typeof urlOrOptions === 'string') {
      url = urlOrOptions;
    } else if (typeof urlOrOptions === 'object' && urlOrOptions.url) {
      url = urlOrOptions.url;
    }

    function serverRequester(
      request: string,
      callback: (error: Error | null, data?: string) => void
    ) {
      const options = {
        method: 'POST',
        body: request,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      fetch(url, options)
        .then((res) => res.text())
        .then((text) => callback(null, text))
        .catch((error) => callback(error));
    }

    this.rpcClient = new JaysonBrowserClient(serverRequester, {});

    this.dataLoader = new DataLoader<object, JSONRPCResultLike>(
      this.batchRequest.bind(this),
      { cacheKeyFn: (key) => key.id }
    );
  }

  request(
    procName: string,
    params: Record<string, unknown>,
    group?: string
  ): Promise<SerializableValue> {
    return this.dataLoader.load({ procName, group, params, id: uuid() });
  }

  private buildRequestGroups(requests: CallRequest[]): Array<JSONRPCRequest[]> {
    const groups = new Map<string, JSONRPCRequest[]>();
    requests.forEach((request) => {
      const group = request.group || 'default';
      const rpcRequest = this.rpcClient.request(
        request.procName,
        request.params,
        request.id
      );
      if (groups.has(group)) {
        groups.get(group)?.push(rpcRequest);
      } else {
        groups.set(group, [rpcRequest]);
      }
    });
    return arrayFrom(groups.values());
  }

  private callRpcMethod(
    requests: JSONRPCRequest[]
  ): Promise<Array<[JSONRPCIDLike, Error | JSONRPCResultLike]>> {
    return new Promise((resolve) => {
      const callback = calculateClientResponse.bind(null, resolve);
      this.rpcClient.request(requests, callback);
    }).then(
      ({
        err,
        errors,
        successes,
      }: {
        err: Error | null;
        errors: JSONRPCErrorLike[];
        successes: JSONRPCResultLike[];
      }) => {
        if (err) {
          return requests.map((request) => [request.id!, err]);
        }
        return requests.map((request) => {
          // check in errors first
          const errorResult = find(
            errors,
            (error) => !!error && (error as any).id === request.id
          );
          if (errorResult) {
            return [request.id!, new RpcError(errorResult.error)];
          }
          const success = find(successes, (s) => !!s && s.id === request.id);
          if (success) {
            return [request.id!, success.result];
          }

          // neither success nor error was found - this may happen if invalid
          // id is provided, throw an error
          return [request.id!, new Error('Message id missing in the response')];
        });
      }
    );
  }

  private batchRequest(
    requests: CallRequest[]
  ): Promise<(SerializableValue | Error)[]> {
    const requestGroups = this.buildRequestGroups(requests);
    return Promise.all(requestGroups.map((rs) => this.callRpcMethod(rs)))
      .then((groups) => arrayFlat(groups, 1))
      .then((entries) => new Map(entries))
      .then((map) => requests.map(({ id }) => map.get(id)));
  }
}
