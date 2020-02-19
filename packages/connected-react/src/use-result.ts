import React from 'react';
import md5 from 'md5';

import {
  Request0,
  Request1,
  Request10,
  Request2,
  Request3,
  Request4,
  Request5,
  Request6,
  Request7,
  Request8,
  Request9,
  SerializableValue,
} from './types';
import ConnectedContext from './connected-context';

function cacheKeyFn(fn: Function, params: readonly SerializableValue[]) {
  const { meta } = fn as any;
  if (!meta) {
    console.warn(`Function ${fn.name} has no associated meta. Make sure your transpiler is configured correctly.`);
  }
  const name = meta?.name ?? fn.name;
  return md5(`${name}.${JSON.stringify(params)}`);
}

export default function useResult<
  R extends SerializableValue,
>(fn: () => R|Promise<R>): R;
export default function useResult<
  R extends SerializableValue,
  T1 extends SerializableValue,
>(fn: (a1: T1) => R|Promise<R>, a1: T1): R;
export default function useResult<
  R extends SerializableValue,
  T1 extends SerializableValue,
  T2 extends SerializableValue,
>(fn: (a1: T1, a2: T2) => R|Promise<R>, a1: T1, a2: T2): R;
export default function useResult<
  R extends SerializableValue,
  T1 extends SerializableValue,
  T2 extends SerializableValue,
  T3 extends SerializableValue,
>(fn: (a1: T1, a2: T2, a3: T3) => R|Promise<R>, a1: T1, a2: T2, a3: T3): R;
export default function useResult<
  R extends SerializableValue,
  T1 extends SerializableValue,
  T2 extends SerializableValue,
  T3 extends SerializableValue,
  T4 extends SerializableValue,
>(fn: (
  a1: T1, a2: T2, a3: T3, a4: T4) => R|Promise<R>,
  a1: T1, a2: T2, a3: T3, a4: T4,
): R;
export default function useResult<
  R extends SerializableValue,
  T1 extends SerializableValue,
  T2 extends SerializableValue,
  T3 extends SerializableValue,
  T4 extends SerializableValue,
  T5 extends SerializableValue,
>(fn: (
  a1: T1, a2: T2, a3: T3, a4: T4, a5: T5) => R|Promise<R>,
  a1: T1, a2: T2, a3: T3, a4: T4, a5: T5,
): R;
export default function useResult<
  R extends SerializableValue,
  T1 extends SerializableValue,
  T2 extends SerializableValue,
  T3 extends SerializableValue,
  T4 extends SerializableValue,
  T5 extends SerializableValue,
  T6 extends SerializableValue,
>(fn: (
  a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6) => R|Promise<R>,
  a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6,
): R;
export default function useResult<
  R extends SerializableValue,
  T1 extends SerializableValue,
  T2 extends SerializableValue,
  T3 extends SerializableValue,
  T4 extends SerializableValue,
  T5 extends SerializableValue,
  T6 extends SerializableValue,
  T7 extends SerializableValue,
>(fn: (
  a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7) => R|Promise<R>,
  a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7,
): R;
export default function useResult<
  R extends SerializableValue,
  T1 extends SerializableValue,
  T2 extends SerializableValue,
  T3 extends SerializableValue,
  T4 extends SerializableValue,
  T5 extends SerializableValue,
  T6 extends SerializableValue,
  T7 extends SerializableValue,
  T8 extends SerializableValue,
>(fn: (
  a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7, a8: T8) => R|Promise<R>,
  a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7, a8: T8,
): R;
export default function useResult<
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
>(fn: (
  a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7, a8: T8, a9: T9) => R|Promise<R>,
  a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7, a8: T8, a9: T9,
): R;
export default function useResult<
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
>(fn: (
  a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7, a8: T8, a9: T9, a10: T10) => R|Promise<R>,
  a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7, a8: T8, a9: T9, a10: T10,
): R;

export default function useResult<R extends SerializableValue>(
  request: Request0<R>,
): R;
export default function useResult<
  R extends SerializableValue,
  T1 extends SerializableValue,
>(
  request: Request1<R, T1>,
): R;
export default function useResult<
  R extends SerializableValue,
  T1 extends SerializableValue,
  T2 extends SerializableValue,
>(
  request: Request2<R, T1, T2>,
): R;
export default function useResult<
  R extends SerializableValue,
  T1 extends SerializableValue,
  T2 extends SerializableValue,
  T3 extends SerializableValue,
>(
  request: Request3<R, T1, T2, T3>,
): R;
export default function useResult<
  R extends SerializableValue,
  T1 extends SerializableValue,
  T2 extends SerializableValue,
  T3 extends SerializableValue,
  T4 extends SerializableValue,
>(
  request: Request4<R, T1, T2, T3, T4>,
): R;
export default function useResult<
  R extends SerializableValue,
  T1 extends SerializableValue,
  T2 extends SerializableValue,
  T3 extends SerializableValue,
  T4 extends SerializableValue,
  T5 extends SerializableValue,
>(
  request: Request5<R, T1, T2, T3, T4, T5>,
): R;
export default function useResult<
  R extends SerializableValue,
  T1 extends SerializableValue,
  T2 extends SerializableValue,
  T3 extends SerializableValue,
  T4 extends SerializableValue,
  T5 extends SerializableValue,
  T6 extends SerializableValue,
>(
  request: Request6<R, T1, T2, T3, T4, T5, T6>,
): R;
export default function useResult<
  R extends SerializableValue,
  T1 extends SerializableValue,
  T2 extends SerializableValue,
  T3 extends SerializableValue,
  T4 extends SerializableValue,
  T5 extends SerializableValue,
  T6 extends SerializableValue,
  T7 extends SerializableValue,
>(
  request: Request7<R, T1, T2, T3, T4, T5, T6, T7>,
): R;
export default function useResult<
  R extends SerializableValue,
  T1 extends SerializableValue,
  T2 extends SerializableValue,
  T3 extends SerializableValue,
  T4 extends SerializableValue,
  T5 extends SerializableValue,
  T6 extends SerializableValue,
  T7 extends SerializableValue,
  T8 extends SerializableValue,
>(
  request: Request8<R, T1, T2, T3, T4, T5, T6, T7, T8>,
): R;
export default function useResult<
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
>(
  request: Request9<R, T1, T2, T3, T4, T5, T6, T7, T8, T9>,
): R;
export default function useResult<
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
>(
  request: Request10<R, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>,
): R;

export default function useResult<
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
>(
  fnOrRequest: ((...args: SerializableValue[]) => R) |
    Request0<R> |
    Request1<R, T1> |
    Request2<R, T1, T2> |
    Request3<R, T1, T2, T3> |
    Request4<R, T1, T2, T3, T4> |
    Request5<R, T1, T2, T3, T4, T5> |
    Request6<R, T1, T2, T3, T4, T5, T6> |
    Request7<R, T1, T2, T3, T4, T5, T6, T7> |
    Request8<R, T1, T2, T3, T4, T5, T6, T7, T8> |
    Request9<R, T1, T2, T3, T4, T5, T6, T7, T8, T9> |
    Request10<R, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>,
  ...args: ReadonlyArray<SerializableValue>
): R {
  const { cache } = React.useContext(ConnectedContext);
  const fn: Function = typeof fnOrRequest === 'object' ?
    fnOrRequest.fn : fnOrRequest;
  if (typeof fn !== 'function') {
    throw new TypeError(`${fn} is not a function`);
  }
  const parameters = typeof fnOrRequest === 'object' ?
    fnOrRequest.parameters ?? [] : args;
  const cacheKey = (typeof fnOrRequest === 'object' ? fnOrRequest.cacheKey : undefined) ??
    cacheKeyFn(fn, parameters);

  const entry = cache.get(cacheKey);
  if (entry) {
    if (entry.error) {
      throw entry.error;
    }
    return entry.data as R;
  }
  const data = fn(...parameters);
  if (data instanceof Promise) {
    throw data.then((data) => {
      cache.set(cacheKey, { data }, 60 * 1000); // TODO: get this configuration from config
    }).catch((error) => {
      cache.set(cacheKey, { error }, 60 * 1000); // TODO: get this configuration from config
    });
  }
  return data;
}
