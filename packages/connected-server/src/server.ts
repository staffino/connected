import { IServer, ServerOptions } from './types';
import ServerImplementation from './implementation/server-implementation';

export default class Server<Request, Response> implements IServer<Request, Response> {

  private implementation: IServer<Request, Response>;

  constructor(dirOrOptions: string | ServerOptions) {
    this.implementation = new ServerImplementation(
      dirOrOptions,

    );
  }

  build(): Promise<void> {
    return this.implementation.build();
  }

  process(request: Request, response: Response): Promise<void> {
    return this.implementation.process(request, response);
  }
}
