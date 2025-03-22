declare module 'json-rpc-msg' {
  export interface RequestPayload {
    id: string;
    method: string;
    params: { [key: string]: any };
  }
  export interface Request {
    type: 'request';
    payload: RequestPayload;
  }
  export interface Notification {
    type: 'notification';
    payload: {
      method: string;
      params: object;
    };
  }
  export interface Batch {
    type: 'batch';
    payload: (Request | Notification | ParserError)[];
  }

  export class ParserError extends Error {
    rpcError: ErrorPayload;
  }

  export function parseMessage(
    message: string | object | object[]
  ): Request | Notification | Batch | ParserError;

  export type ResponsePayload = {
    id: number | string;
    result: any;
  };
  export function createResponse(
    id: string | number,
    result: any
  ): ResponsePayload;

  export type ErrorPayload = {
    id: number | string;
    error: {
      code: number;
      message?: string;
    };
    data: any;
  };
  export function createError(
    id: string | number | null,
    code: number | { code: number; message?: string },
    details?: any
  ): ErrorPayload;
}
