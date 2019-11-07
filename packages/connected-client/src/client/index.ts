import Middleware from '../middleware';

type SerializableValue =
  null | string | number | boolean | Date |
  { [key: string]: SerializableValue } |
  SerializableValue[];

type NextFunction = (error?: any) => void;

type Request = {
  name: string;
  parameters: SerializableValue[];
  constructorParameters?: SerializableValue[];
};

type Response = {
  data?: SerializableValue;
  error?: any;
};

type RequestHandler = (request: Request, response: Response, next: NextFunction) => void;
type ErrorRequestHandler = (
  error: any, request: Request, response: Response, next: NextFunction,
) => void;
type Handler = RequestHandler | ErrorRequestHandler;

export default class Client {
  private static global: Client = new Client();
  private middleware = new Middleware();

  public use(...handlers: Handler[]) {
    for (let i = 0; i < handlers.length; i += 1) {
      const handler = handlers[i] as any;
      if (typeof handler !== 'function' ||
        handler.length !== 3 &&
        handler.length !== 4) {
        throw new TypeError('use() needs a middleware function');
      }

      if (handler.length === 3) {
        this.middleware.use((next, request, response) => handler(request, response, next));
      } else {
        this.middleware.useErrorHandler(
          (error, next, request, response) => handler(error, request, response, next));
      }
    }
  }
  public execute(
    name: string,
    parameters: SerializableValue[],
    constructorParameters?: SerializableValue[]): Promise<SerializableValue> {
    const request: Request = { name, parameters, constructorParameters };
    const response: Response = {};

    return new Promise((done) => {
      this.middleware.go(done, request, response);
    });
  }

  public static use(...handlers: Handler[]) {
    return Client.global.use(...handlers);
  }

  public static execute(
    name: string,
    parameters: SerializableValue[],
    constructorParameters?: SerializableValue[]) {

    return Client.global.execute(name, parameters, constructorParameters);
  }
}
