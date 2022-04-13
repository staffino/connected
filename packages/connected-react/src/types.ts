export type SerializableValue =
  | null
  | string
  | number
  | boolean
  | Date
  | { [key: string]: SerializableValue }
  | SerializableValue[];

export type SerializableFunction = (
  ...args: SerializableValue[]
) => SerializableValue | Promise<SerializableValue>;

export type CacheItem = {
  error?: Error;
  data?: SerializableValue;
  ttl: Date;
};

export type Newable<T> = { new (...args: any[]): T };

type ConditionallyStripPromise<
  Condition extends boolean,
  Type
> = Condition extends true ? Awaited<Type> : Type;

// https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts
type NonUndefined<A> = A extends undefined ? never : A;
export type FunctionKeys<T extends object> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T]-?: NonUndefined<T[K]> extends Function ? K : never;
}[keyof T];

export type SafeReturnType<M> = M extends (...args: any) => any
  ? ReturnType<M>
  : unknown;

export type SafeParameters<M> = M extends (...args: any) => any
  ? Parameters<M>
  : unknown[];

export type CommandBuilder<
  C extends Newable<T>,
  T extends object = InstanceType<C>,
  StripPromise extends boolean = false
> = {
  [M in FunctionKeys<T>]: (
    ...args: SafeParameters<T[M]>
  ) => Command<M, C, T, StripPromise>;
};
export interface Command<
  M extends FunctionKeys<T>,
  C extends Newable<T>,
  T extends object = InstanceType<C>,
  StripPromise extends boolean = false
> {
  (): ConditionallyStripPromise<StripPromise, SafeReturnType<T[M]>>;
  parameters: SafeParameters<T[M]>;
  constructorParameters: ConstructorParameters<C>;
  meta?: Meta;
}

export type Meta = {
  name: string;
};

export type ResolverFunction<T extends any[], R> = (
  fn: (...args: T) => R,
  parameters: T,
  meta?: Meta
) => R;
