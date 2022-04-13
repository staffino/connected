import React, { useCallback, useMemo, useReducer } from 'react';
import md5 from 'md5';
import stringify from 'fast-json-stable-stringify';
import ConnectedContext from './connected-context';
import { SerializableValue } from './types';

function cacheKeyFn(
  fn: Function,
  params: readonly SerializableValue[],
  meta?: any
) {
  const { meta: functionMeta, ...functionProperties } = fn as any;
  const combinedMeta = functionMeta ?? meta;
  if (!combinedMeta) {
    console.warn(
      `Function ${fn.name} has no associated meta. Make sure your transpiler is configured correctly.`
    );
  }
  const name = combinedMeta?.name ?? fn.name;
  return md5(stringify([name, functionProperties, ...params]));
}

function addMilliseconds(milliseconds: number, date?: Date) {
  const t = date ?? new Date();
  t.setMilliseconds(t.getMilliseconds() + milliseconds);
  return t;
}

export default function useCallResolver() {
  const { cache, dataTtl, errorTtl } = React.useContext(ConnectedContext);
  const [, forceReload] = useReducer((x) => x + 1, 0);
  const tryFetchData = useCallback(
    (cacheKey, fn, args) => {
      let result;
      try {
        result = fn(...args);
      } catch (error) {
        cache.set(cacheKey, { error, ttl: addMilliseconds(errorTtl) });
        throw error;
      }

      const entry = cache.get(cacheKey);
      if (result instanceof Promise) {
        result
          .then((data) => {
            cache.set(cacheKey, { data, ttl: addMilliseconds(dataTtl) });
          })
          .catch((error) => {
            cache.set(cacheKey, { error, ttl: addMilliseconds(errorTtl) });
          });
        if (entry?.data !== undefined) {
          // we are not throwing promise, so we need to refresh once we update the data
          result.finally(forceReload);
          return entry.data;
        }
        throw result;
      }
      return result;
    },
    [cache, forceReload]
  );
  return useMemo(
    () => (fn: Function, args: any[], meta?: any) => {
      if (typeof fn !== 'function') {
        throw new TypeError(`${fn} is not a function`);
      }
      const cacheKey: string = cacheKeyFn(fn, args, meta);
      const entry = cache.get(cacheKey);
      if (entry) {
        if (entry.ttl < new Date()) {
          return tryFetchData(cacheKey, fn, args);
        }
        if (entry.error) {
          throw entry.error;
        }
        return entry.data as SerializableValue;
      }
      return tryFetchData(cacheKey, fn, args);
    },
    [cache, tryFetchData]
  );
}
