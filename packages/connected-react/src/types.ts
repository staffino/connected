export type SerializableValue =
  null | string | number | boolean | Date |
  { [key: string]: SerializableValue } |
  SerializableValue[];

export type SerializableFunction =
  (...args: SerializableValue[]) => SerializableValue | Promise<SerializableValue>;

export type CacheItem = {
  error?: Error;
  data?: SerializableValue;
};

export type Newable<T> = { new(...args: any[]): T };

export type StripPromise<T> = T extends Promise<infer R> ? R : T;

// https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts
type NonUndefined<A> = A extends undefined ? never : A;
export type FunctionKeys<T extends object> = {
  [K in keyof T]-?: NonUndefined<T[K]> extends Function ? K : never;
}[keyof T];

export type CommandBuilder<
  C extends Newable<T>,
  T extends object = InstanceType<C>,
> = {
  [M in FunctionKeys<T>]: (...args: Parameters<T[M]>) => Command<M, C, T>;
};
export type Command<
  M extends FunctionKeys<T>,
  C extends Newable<T>,
  T extends object = InstanceType<C>,
> = {
  instance: T;
  method: T[M];
  parameters: Parameters<T[M]>;
  constructorParameters: ConstructorParameters<C>;
  meta?: Meta;
};

export type Meta = {
  name: string;
};
