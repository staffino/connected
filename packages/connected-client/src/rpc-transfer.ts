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
import { SerializableValue } from './types';

type CallRequest = {
  id: string;
  procName: string;
  params: { [name: string]: any };
};

export type RpcTransferOptions = {
  url?: string;
};

export default class RpcTransfer {
  private readonly rpcClient: JaysonBrowserClient;
  private readonly dataLoader: DataLoader<CallRequest, any>;

  constructor(urlOrOptions?: string | RpcTransferOptions) {
    let url = '/rpc';
    if (typeof urlOrOptions === 'string') {
      url = urlOrOptions;
    } else if (typeof urlOrOptions === 'object' && urlOrOptions.url) {
      url = urlOrOptions.url;
    }
    const serverRequester = function (request: string, callback: Function) {
      const options = {
        method: 'POST',
        body: request,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      fetch(url, options)
        .then(res => res.text())
        .then(text => callback(null, text))
        .catch(error => callback(error));
    };
    this.rpcClient = new JaysonBrowserClient(serverRequester, {});

    this.dataLoader = new DataLoader<object, any>(
      this.batchRequest.bind(this),
      { cacheKeyFn: key => key.id });
  }

  request(procName: string, params: { [name: string]: any}): Promise<SerializableValue> {
    return this.dataLoader.load({ procName, params, id: uuid() });
  }

  private batchRequest(requests: CallRequest[]): Promise<(SerializableValue|Error)[]> {
    const clientRequests = requests.map(
      request => this.rpcClient.request(request.procName, request.params, request.id));

    return new Promise((resolve) => {
      return this.rpcClient.request(
        clientRequests,
        (err: any, errors: any[], successes: SerializableValue) =>
          resolve({ err, errors, successes }));
    }).then((result: { err: any, errors: any[], successes: any[] }) => {
      if (result.err) {
        return requests.map(() => result.err);
      }
      return requests.map(
        (request) => {
          // check in errors first
          const errorResult = find(result.errors, error => !!error && error.id === request.id);
          if (errorResult) {
            return new Error(errorResult.error.message);
          }
          const success = find(result.successes, success => !!success && success.id === request.id);
          if (success) {
            return success.result;
          }

          // neither success nor error was found - this may happen if invalid
          // id is provided, throw an error
          return new Error('Message id missing in the response');
        });
    });
  }
}
