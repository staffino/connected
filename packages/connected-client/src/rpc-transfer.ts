/*
 * Copyright (c) 2019 Staffino, s.r.o. - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Created by Martin Komara, September 2019
 */
import find from 'array-find';
import uuid from 'uuid/v4.js';
import DataLoader from 'dataloader';
import JaysonBrowserClient from 'jayson/lib/client/browser/index.js';
import type {
  JSONRPCErrorLike,
  JSONRPCRequest,
  JSONRPCResultLike,
} from 'jayson';
import type { SerializableValue } from './types.js';
import RpcError from './rpc-error.js';

export type RpcTransferOptions = {
  url?: string;
  headers?: Record<string, string>;
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
    DataLoader<JSONRPCRequest, JSONRPCResultLike>
  >();

  constructor(urlOrOptions?: string | RpcTransferOptions) {
    let url = '/rpc';
    let headers = {};
    if (typeof urlOrOptions === 'string') {
      url = urlOrOptions;
    } else if (typeof urlOrOptions === 'object') {
      url = urlOrOptions.url ?? url;
      headers = urlOrOptions.headers ?? {};
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
          ...headers,
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
    return this.findDataLoader(group)!.load(
      this.rpcClient.request(procName, params, uuid())
    );
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
