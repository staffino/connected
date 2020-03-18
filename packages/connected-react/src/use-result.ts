import React from 'react';
import md5 from 'md5';
import {
  Command, FunctionKeys, Newable, SerializableFunction, SerializableValue, StripPromise,
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

type UseResultOptions = {
  cacheKey?: string;
};

export default function useResult<
  M extends FunctionKeys<T>,
  T extends object,
>(command: Command<M, Newable<T>, T>, options?: UseResultOptions): StripPromise<ReturnType<T[M]>>;

export default function useResult<
  F extends SerializableFunction,
>(fn: F): StripPromise<ReturnType<F>>;

export default function useResult<
  F extends SerializableFunction,
  P extends Parameters<F>,
>(fn: F, ...args: P): StripPromise<ReturnType<F>>;

export default function useResult<
  F extends SerializableFunction,
  P extends Parameters<F>,
  T extends object,
>(
  fnOrCommand: F | Command<FunctionKeys<T>, Newable<T>, T>,
  ...args: P
) {
  const { cache, dataTtl, errorTtl } = React.useContext(ConnectedContext);
  let fn: Function;
  let parameters: any[];
  let cacheKey: string;
  if (typeof fnOrCommand === 'function') {
    fn = fnOrCommand;
    parameters = args;
    cacheKey = cacheKeyFn(fn, parameters);
  } else {
    const method: Function = fnOrCommand.method as any;
    fn = method.bind(fnOrCommand.instance);
    parameters = fnOrCommand.parameters;
    const options = args[0] as UseResultOptions;
    cacheKey = options?.cacheKey ?? cacheKeyFn(fn, parameters);
  }
  if (typeof fn !== 'function') {
    throw new TypeError(`${fn} is not a function`);
  }

  const entry = cache.get(cacheKey);
  if (entry) {
    if (entry.error) {
      throw entry.error;
    }
    return entry.data as SerializableValue;
  }
  const data = fn(...parameters);
  if (data instanceof Promise) {
    throw data.then((data) => {
      cache.set(cacheKey, { data }, dataTtl);
    }).catch((error) => {
      cache.set(cacheKey, { error }, errorTtl);
    });
  }
  return data;
}
