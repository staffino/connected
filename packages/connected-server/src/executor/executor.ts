import { CallableMap, ExecutorOptions, IExecutor } from './types';
import { SerializableValue } from '../types';

type Newable<T> = { new (...args: any[]): T };

export default class Executor implements IExecutor {
  constructor(
    private callableMap: CallableMap,
    private options: ExecutorOptions = {}
  ) {
    if (!this.options.factory) {
      this.options.factory = <T>(klass: Newable<T>, ...args: any[]) =>
        new klass(...args);
    }
  }

  execute(
    name: string,
    parameters: SerializableValue[],
    constructorParameters?: SerializableValue[]
  ): Promise<SerializableValue> {
    const callable = this.callableMap.get(name);
    if (!callable) {
      return Promise.reject(new TypeError(`Function ${name} was not found.`));
    }
    if (typeof callable.fn !== 'function') {
      if (callable.property) {
        return Promise.reject(
          new TypeError(`Class ${callable.name} was not found.`)
        );
      }
      return Promise.reject(new TypeError(`Function ${name} was not found.`));
    }
    if (!callable.property) {
      // just an ordinary function
      return Promise.resolve(callable.fn(...parameters));
    }

    // class method
    const instance: { [name: string]: Function } = this.options.factory!(
      callable.fn as any,
      ...(constructorParameters || [])
    );
    if (!instance) {
      return Promise.reject(
        new TypeError(`Unable to create an instance of class ${callable.name}.`)
      );
    }
    const method = instance[callable.property];
    if (typeof method !== 'function') {
      return Promise.reject(
        new TypeError(
          `Unable to find method ${callable.name}.${callable.property}`
        )
      );
    }
    return Promise.resolve(method.call(instance, ...parameters));
  }
}
