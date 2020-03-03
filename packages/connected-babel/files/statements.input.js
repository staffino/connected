import * as events from 'events';

const emitter = new events.EventEmitter();
emitter.on('error', (...args) => {
  console.log('Error', ...args);
});
