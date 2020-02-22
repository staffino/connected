import * as events from 'events';

class PrivateEventEmitter extends events.EventEmitter {

  constructor() {
    super();
    this.on('error', this.listen);
  }

  async listen(...args: any[]) {
    console.log('Error', ...args);
  }
}

const emitter = new PrivateEventEmitter();

export default class EventEmitterProvider {

  constructor(private prefix: string = 'DATA') {
  }

  invokeError(error: Error) {
    emitter.emit(`Error[${this.prefix}]`, error);
  }

  async notifyError(error: Error) {
    const response = await fetch({ body: JSON.stringify(error) } as any);
    if (response.status >= 200 && response.status < 300) {
      emitter.emit('data', response.body);
    } else {
      emitter.emit('error', this.formatError(response.body.toString()));
    }
  }

  private formatError(body: string): Error {
    return new Error(body);
  }
}

export function factory(prefix: string) {
  return new EventEmitterProvider(prefix);
}
