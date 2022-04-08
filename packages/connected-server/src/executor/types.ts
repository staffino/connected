import { SerializableValue } from '../types';

type Newable<T> = { new (...args: any[]): T };

export interface IExecutor {
  execute(
    name: string,
    parameters: SerializableValue[],
    constructorParameters?: SerializableValue[]
  ): Promise<SerializableValue>;
}

export interface ExecutorOptions {
  factory?<T>(klass: Newable<T>, ...args: any[]): T;
}

export interface ExecutorBuilderOptions extends ExecutorOptions {
  createMeta?: boolean;
}

export interface ExecutorBuilderScanDirOptions extends ExecutorBuilderOptions {
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
