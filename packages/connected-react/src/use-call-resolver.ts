import React, { useCallback, useReducer, startTransition } from 'react';
import md5 from 'md5';
import stringify from 'fast-json-stable-stringify';
import ConnectedContext from './connected-context';
import {
  Command,
  Meta,
  SerializableFunction,
  SerializableValue,
} from './types';
import ErrorHandlerContext from './error-handler-context';

type SerializableFunctionWithMeta = SerializableFunction & { meta?: Meta };

function cacheKeyFn(
  fn: SerializableFunction,
  params: readonly SerializableValue[],
  meta?: Meta
) {
  const { meta: functionMeta, ...functionProperties } =
    fn as SerializableFunctionWithMeta;
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
  const { onError: handleError } = React.useContext(ErrorHandlerContext);
  const [, forceReload] = useReducer((x) => x + 1, 0);
  const tryFetchData = useCallback(
    (cacheKey: string, fn: (...args: any[]) => any, args: any[], stalledData: any) => {
      let result;
      try {
        result = fn(...args);
      } catch (error) {
        cache.set(cacheKey, { error, ttl: addMilliseconds(errorTtl) });
        result = handleError(error, stalledData);
      }

      const entry = cache.get(cacheKey);
      if (result instanceof Promise) {
        result
          .then((data) => {
            cache.set(cacheKey, { data, ttl: addMilliseconds(dataTtl) });
          })
          .catch((error) => {
            cache.set(cacheKey, {
              error,
              data: stalledData,
              ttl: addMilliseconds(errorTtl),
            });
          });
        if (entry?.data !== undefined) {
          // we are not throwing promise, so we need to refresh once we update the data
          result.finally(() => {
            startTransition(() => { forceReload(); })
          });
          return entry.data;
        }
        throw result; // throwing promise to suspend
      }
      return result;
    },
    [cache, dataTtl, errorTtl, handleError]
  );
  return useCallback(
    (
      fn: SerializableFunction | Command<never, never>,
      args: SerializableValue[],
      meta?: Meta
    ) => {
      if (typeof fn !== 'function') {
        throw new TypeError(`${fn} is not a function`);
      }
      const cacheKey: string = cacheKeyFn(fn, args, meta);
      const entry = cache.get(cacheKey);
      if (entry) {
        if (entry.ttl < new Date()) {
          return tryFetchData(cacheKey, fn, args, entry.data);
        }
        if (entry.error) {
          return handleError(entry.error, entry.data);
        }
        return entry.data as SerializableValue;
      }
      return tryFetchData(cacheKey, fn, args, undefined);
    },
    [cache, handleError, tryFetchData]
  );
}
