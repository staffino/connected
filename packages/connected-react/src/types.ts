export type SerializableValue =
  null | string | number | boolean | Date |
  { [key: string]: SerializableValue } |
  SerializableValue[];

interface RequestBase {
  cacheKey?: string;
  cacheInvalidationKeys?: string|string[];
}
export interface Request0<R extends SerializableValue> extends RequestBase {
  fn: () => R|Promise<R>;
  parameters?: [];
}
export interface Request1<
  R extends SerializableValue,
  T1 extends SerializableValue,
> extends RequestBase {
  fn: (a1: T1) => R|Promise<R>;
  parameters: [T1];
}
export interface Request2<
  R extends SerializableValue,
  T1 extends SerializableValue,
  T2 extends SerializableValue,
> extends RequestBase {
  fn: (a1: T1, a2: T2) => R|Promise<R>;
  parameters: [T1, T2];
}
export interface Request3<
  R extends SerializableValue,
  T1 extends SerializableValue,
  T2 extends SerializableValue,
  T3 extends SerializableValue,
> extends RequestBase {
  fn: (a1: T1, a2: T2, a3: T3) => R|Promise<R>;
  parameters: [T1, T2, T3];
}
export interface Request4<
  R extends SerializableValue,
  T1 extends SerializableValue,
  T2 extends SerializableValue,
  T3 extends SerializableValue,
  T4 extends SerializableValue,
> extends RequestBase {
  fn: (a1: T1, a2: T2, a3: T3, a4: T4) => R|Promise<R>;
  parameters: [T1, T2, T3, T4];
}
export interface Request5<
  R extends SerializableValue,
  T1 extends SerializableValue,
  T2 extends SerializableValue,
  T3 extends SerializableValue,
  T4 extends SerializableValue,
  T5 extends SerializableValue,
> extends RequestBase {
  fn: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5) => R|Promise<R>;
  parameters: [T1, T2, T3, T4, T5];
}
export interface Request6<
  R extends SerializableValue,
  T1 extends SerializableValue,
  T2 extends SerializableValue,
  T3 extends SerializableValue,
  T4 extends SerializableValue,
  T5 extends SerializableValue,
  T6 extends SerializableValue,
> extends RequestBase {
  fn: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6) => R|Promise<R>;
  parameters: [T1, T2, T3, T4, T5, T6];
}
export interface Request7<
  R extends SerializableValue,
  T1 extends SerializableValue,
  T2 extends SerializableValue,
  T3 extends SerializableValue,
  T4 extends SerializableValue,
  T5 extends SerializableValue,
  T6 extends SerializableValue,
  T7 extends SerializableValue,
> extends RequestBase {
  fn: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7) => R|Promise<R>;
  parameters: [T1, T2, T3, T4, T5, T6, T7];
}
export interface Request8<
  R extends SerializableValue,
  T1 extends SerializableValue,
  T2 extends SerializableValue,
  T3 extends SerializableValue,
  T4 extends SerializableValue,
  T5 extends SerializableValue,
  T6 extends SerializableValue,
  T7 extends SerializableValue,
  T8 extends SerializableValue,
> extends RequestBase {
  fn: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7, a8: T8) => R|Promise<R>;
  parameters: [T1, T2, T3, T4, T5, T6, T7, T8];
}
export interface Request9<
  R extends SerializableValue,
  T1 extends SerializableValue,
  T2 extends SerializableValue,
  T3 extends SerializableValue,
  T4 extends SerializableValue,
  T5 extends SerializableValue,
  T6 extends SerializableValue,
  T7 extends SerializableValue,
  T8 extends SerializableValue,
  T9 extends SerializableValue,
> extends RequestBase {
  fn: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7, a8: T8, a9: T9) => R|Promise<R>;
  parameters: [T1, T2, T3, T4, T5, T6, T7, T8, T9];
}
export interface Request10<
  R extends SerializableValue,
  T1 extends SerializableValue,
  T2 extends SerializableValue,
  T3 extends SerializableValue,
  T4 extends SerializableValue,
  T5 extends SerializableValue,
  T6 extends SerializableValue,
  T7 extends SerializableValue,
  T8 extends SerializableValue,
  T9 extends SerializableValue,
  T10 extends SerializableValue,
> extends RequestBase {
  fn: (
    a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7, a8: T8, a9: T9, a10: T10,
  ) => R|Promise<R>;
  parameters: [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10];
}

export type CacheItem = {
  error?: Error;
  data?: SerializableValue;
};

export type Newable<T> = { new(...args: any[]): T };
