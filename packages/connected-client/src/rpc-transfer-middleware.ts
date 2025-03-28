import RpcTransfer, { type RpcTransferOptions } from './rpc-transfer.js';
import type { Request, Response, NextFunction } from './types.js';

export default function rpcTransferMiddleware(
  urlOrOptions?: string | RpcTransferOptions
) {
  const client = new RpcTransfer(urlOrOptions);

  return (request: Request, response: Response, next: NextFunction) => {
    // TODO: configurable execute function name
    return client
      .request(
        'execute',
        {
          name: request.name,
          parameters: request.parameters,
          constructorParameters: request.constructorParameters,
        },
        request.group
      )
      .then((result) => {
        response.result = result;
        next();
      })
      .catch((error) => next(error));
  };
}
