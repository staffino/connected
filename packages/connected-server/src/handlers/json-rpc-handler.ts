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
import { IHandler, SerializableValue } from '../types';

type IncommingMessage = import('http').IncomingMessage;
type ServerResponse = import('http').ServerResponse;

const jsonParser = json();

type InvokeCallback = (
  name: string,
  parameters: SerializableValue[],
  constructorParameters?: SerializableValue[],
) => Promise<SerializableValue>;

export default class JsonRpcHandler implements IHandler {
  process(
    request: IncommingMessage,
    response: ServerResponse,
    invoke: InvokeCallback,
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
        return this.processRequest(message.payload, request, response, invoke);
      }
      if (message.type === 'batch') {
        return this.processBatch(message.payload, request, response, invoke);
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
    return !!contentType && contentType.indexOf('application/json') === 0;
  }

  private processRequest(
    payload: RequestPayload,
    request: IncommingMessage,
    response: ServerResponse,
    invoke: InvokeCallback,
  ): Promise<void> {

    return this.calculateResponse(payload, invoke)
      .then(rpcResponse => response.end(JSON.stringify(rpcResponse)));
  }

  private processBatch(
    payload: (Request | Notification | ParserError)[],
    request: IncommingMessage,
    response: ServerResponse,
    invoke: InvokeCallback,
  ): Promise<void> {
    return Promise.all(
      payload
        .filter(request => request instanceof ParserError || request.type === 'request')
        .map((request) => {
          if (request instanceof ParserError) {
            return Promise.resolve(request.rpcError);
          }
          if (request.type === 'request') {
            return this.calculateResponse(request.payload, invoke);
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
    payload: RequestPayload, invoke: InvokeCallback,
  ): Promise<ResponsePayload | ErrorPayload> {
    const { id, method, params: { parameters, constructorParameters } }  = payload;
    if (!Array.isArray(parameters)) {
      return Promise.resolve(createError(
        id, { code: -32602, message: 'Parameters must by an array of serializable values.' }));
    }
    if (constructorParameters !== undefined && !Array.isArray(constructorParameters)) {
      return Promise.resolve(createError(
        id, { code: -32602, message: 'Constructor parameters must by an array of serializable values.' }));
    }
    return invoke(method, parameters, constructorParameters)
      .then(result => createResponse(id, result))
      .catch((error) => {
        if (error instanceof ParserError) {
          return error.rpcError;
        }
        return createError(id, { code: -32603, message: error.message });
      });
  }
}
