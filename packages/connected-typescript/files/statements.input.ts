import * as events from 'events';

const emitter = new events.EventEmitter();
emitter.on('error', (...args: any[]) => {
  console.log('Error', ...args);
});
