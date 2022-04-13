/*
 * Copyright (c) 2019 Staffino, s.r.o. - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Created by Martin Komara, September 2019
 */
import find from 'array-find';
import uuid from 'uuid/v4';
import DataLoader from 'dataloader';
import JaysonBrowserClient from 'jayson/lib/client/browser';
import type {
  JSONRPCErrorLike,
  JSONRPCRequest,
  JSONRPCResultLike,
} from 'jayson';
import { SerializableValue } from './types';
import RpcError from './rpc-error';

type CallRequest = {
  id: string;
  procName: string;
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

  private readonly dataLoaderMap = new Map<
    string,
    DataLoader<CallRequest, JSONRPCResultLike>
  >();

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
  }

  findDataLoader(group = 'default') {
    if (this.dataLoaderMap.has(group)) {
      return this.dataLoaderMap.get(group);
    }
    const dataLoader = new DataLoader<object, JSONRPCResultLike>(
      (requests: JSONRPCRequest[]) => this.batchRequest(requests),
      { cacheKeyFn: (key) => key.id }
    );
    this.dataLoaderMap.set(group, dataLoader);
    return dataLoader;
  }

  request(
    procName: string,
    params: Record<string, unknown>,
    group?: string
  ): Promise<SerializableValue> {
    return this.findDataLoader(group)!.load({
      procName,
      params,
      id: uuid(),
    });
  }

  private batchRequest(
    requests: JSONRPCRequest[]
  ): Promise<(SerializableValue | Error)[]> {
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
          return requests.map(() => err);
        }
        return requests.map((request) => {
          // check in errors first
          const errorResult = find(
            errors,
            (error) => !!error && (error as any).id === request.id
          );
          if (errorResult) {
            return new RpcError(errorResult.error);
          }
          const success = find(successes, (s) => !!s && s.id === request.id);
          if (success) {
            return success.result;
          }

          // neither success nor error was found - this may happen if invalid
          // id is provided, throw an error
          return new Error('Message id missing in the response');
        });
      }
    );
  }
}
