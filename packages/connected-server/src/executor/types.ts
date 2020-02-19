import { SerializableValue } from '../types';

type Newable<T> = { new(...args: any[]): T };

export interface IExecutor {
  execute(
    name: string,
    parameters: SerializableValue[],
    constructorParameters?: SerializableValue[],
  ): Promise<SerializableValue>;
}

export interface ExecutorOptions {
  instanceBuilder?<T>(klass: Newable<T>, ...args: any[]): T;
}

export interface ExecutorBuilderScanDirOptions extends ExecutorOptions {
  root?: string;
  dir?: string;
  pattern?: string;
  ignore?: string;
}

export type Callable = {
  fn: Function;
  name: string;
  property?: string;
  file?: string;
};

export type CallableMap = Map<string, Callable>;
