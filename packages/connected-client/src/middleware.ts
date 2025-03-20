type HandlerType = 'Normal' | 'Error';

type TypedHandler = {
  type: HandlerType;
  handler: (next: Function, ...args: any[]) => void;
};
type NormalHandler = (next: Function, ...args: any[]) => void;
type ErrorHandler = (error: any, next: Function, ...args: any[]) => void;

export default class Middleware {
  handlers: TypedHandler[] = [];

  use(handler: NormalHandler) {
    this.handlers.push({ handler, type: 'Normal' });
  }

  useErrorHandler(handler: ErrorHandler) {
    this.handlers.push({ handler, type: 'Error' });
  }

  go(done: Function, ...args: any[]) {
    this.processHandlers(this.handlers, done, args, undefined);
  }

  private processHandlers(
    handlers: TypedHandler[],
    done: Function,
    args: any[],
    error: any
  ) {
    const [handler, ...tail] = handlers;
    if (!handler) {
      done(error);
      return;
    }
    const next = (error: any) => this.processHandlers(tail, done, args, error);
    try {
      const skipHandler = !!error !== (handler.type === 'Error');
      if (skipHandler) {
        next(error);
      } else if (error) {
        handler.handler(error, next, ...args);
      } else {
        handler.handler(next, ...args);
      }
    } catch (error) {
      next(error);
    }
  }
}
