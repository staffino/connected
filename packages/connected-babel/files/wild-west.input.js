import * as events from 'events';

class PrivateEventEmitter extends events.EventEmitter {

  constructor() {
    super();
    this.on('error', this.listen);
  }

  async listen(...args) {
    console.log('Error', ...args);
  }
}

const emitter = new PrivateEventEmitter();

export default class EventEmitterProvider {

  constructor(prefix = 'DATA') {
  }

  invokeError(error) {
    emitter.emit(`Error[${this.prefix}]`, error);
  }

  async notifyError(error) {
    const response = await fetch({ body: JSON.stringify(error) });
    if (response.status >= 200 && response.status < 300) {
      emitter.emit('data', response.body);
    } else {
      emitter.emit('error', this.formatError(response.body.toString()));
    }
  }

  formatError(body) {
    return new Error(body);
  }
}

export function factory(prefix) {
  return new EventEmitterProvider(prefix);
}
