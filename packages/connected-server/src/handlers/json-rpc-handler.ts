import {
  createError,
  createResponse,
  ErrorPayload,
  Notification,
  parseMessage,
  ParserError,
  Request,
  RequestPayload,
  ResponsePayload,
} from 'json-rpc-msg';
import { json } from 'body-parser';
import { IHandler, IExecutor } from '../types';

type IncommingMessage = import('http').IncomingMessage;
type ServerResponse = import('http').ServerResponse;

const jsonParser = json();

export default class JsonRpcHandler implements IHandler {
  process(
    request: IncommingMessage,
    response: ServerResponse,
    executor: IExecutor,
  ): Promise<void> {

    return new Promise((resolve, reject) => {
      jsonParser(request, response, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve((request as any).body);
        }
      });
    })
    .then((text: string) => parseMessage(text))
    .then((message) => {
      if (message instanceof ParserError) {
        response.end(JSON.stringify(message.rpcError));
        return;
      }
      if (message.type === 'request') {
        return this.processRequest(message.payload, response, executor);
      }
      if (message.type === 'batch') {
        return this.processBatch(message.payload, response, executor);
      }

      // notification ... not sure what to do yet
      return Promise.resolve();
    }).catch((error) => {
      if (error instanceof ParserError) {
        response.end(JSON.stringify(error.rpcError));
      }
    });
  }

  canHandle(request: IncommingMessage): boolean {
    const contentType = request.headers['content-type'];
    return contentType?.indexOf('application/json') === 0;
  }

  private processRequest(
    payload: RequestPayload,
    response: ServerResponse,
    executor: IExecutor,
  ): Promise<void> {
    return this.calculateResponse(payload, executor)
      .then(rpcResponse => response.end(JSON.stringify(rpcResponse)));
  }

  private processBatch(
    payload: (Request | Notification | ParserError)[],
    response: ServerResponse,
    executor: IExecutor,
  ): Promise<void> {
    return Promise.all(
      payload
        .filter(request => request instanceof ParserError || request.type === 'request')
        .map((request) => {
          if (request instanceof ParserError) {
            return Promise.resolve(request.rpcError);
          }
          if (request.type === 'request') {
            return this.calculateResponse(request.payload, executor);
          }
          // notification - this won't happen because we filtered notifications above
          return Promise.resolve(createError(
            null, { code: -32600, message: 'Notifications are not yet supported' }));
        }),
    ).then((responses) => {
      response.end(JSON.stringify(responses));
    }).catch(error => console.error(error));
  }

  private calculateResponse(
    payload: RequestPayload, executor: IExecutor,
  ): Promise<ResponsePayload | ErrorPayload> {
    const {
      id,
      params: {
        name, parameters, constructorParameters,
      } = { name: undefined, parameters: undefined, constructorParameters: undefined }}  = payload;

    if (!name) {
      return Promise.resolve(createError(
        id, { code: -32602, message: 'Function name must be specified.' }));
    }
    if (!Array.isArray(parameters)) {
      return Promise.resolve(createError(
        id, { code: -32602, message: 'Parameters must by an array of serializable values.' }));
    }
    if (constructorParameters !== undefined && !Array.isArray(constructorParameters)) {
      return Promise.resolve(createError(
        id, { code: -32602, message: 'Constructor parameters must by an array of serializable values.' }));
    }
    return executor.execute(name, parameters, constructorParameters)
      .then(result => result ?? null)
      .then(result => createResponse(id, result))
      .catch((error) => {
        if (error instanceof ParserError) {
          return error.rpcError;
        }
        return createError(id, { code: -32603, message: error.message });
      });
  }
}
