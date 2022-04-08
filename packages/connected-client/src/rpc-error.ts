import type { JSONRPCErrorLike } from 'jayson';

export default class RpcError extends Error {
  readonly code: number;

  constructor(error: JSONRPCErrorLike) {
    super(error.message);
    this.code = 'code' in error ? error.code : 0;
  }
}
