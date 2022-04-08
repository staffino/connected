import Middleware from './middleware';
import { NextFunction, Request, Response, SerializableValue } from './types';

type RequestHandler = (
  request: Request,
  response: Response,
  next: NextFunction
) => void;
type ErrorRequestHandler = (
  error: Error | null,
  request: Request,
  response: Response,
  next: NextFunction
) => void;
type Handler = RequestHandler | ErrorRequestHandler;

export default class Client {
  private static instance: Client = new Client();

  private middleware = new Middleware();

  public use(...handlers: Handler[]) {
    for (let i = 0; i < handlers.length; i += 1) {
      const handler = handlers[i] as any;
      if (
        typeof handler !== 'function' ||
        (handler.length !== 3 && handler.length !== 4)
      ) {
        throw new TypeError('use() needs a middleware function');
      }

      if (handler.length === 3) {
        this.middleware.use((next, request, response) =>
          handler(request, response, next)
        );
      } else {
        this.middleware.useErrorHandler((error, next, request, response) =>
          handler(error, request, response, next)
        );
      }
    }
  }

  public execute(
    name: string,
    parameters: SerializableValue[],
    constructorParameters?: SerializableValue[],
    group?: string
  ): Promise<SerializableValue> {
    const request: Request = { name, parameters, constructorParameters, group };
    const response: Response = { result: null };

    return new Promise((done) => {
      this.middleware.go(done, request, response);
    }).then((error) => (error ? Promise.reject(error) : response.result));
  }

  public static use(...handlers: Handler[]) {
    return Client.instance.use(...handlers);
  }

  public static execute(
    name: string,
    parameters: SerializableValue[],
    constructorParameters?: SerializableValue[]
  ) {
    return Client.instance.execute(name, parameters, constructorParameters);
  }
}
