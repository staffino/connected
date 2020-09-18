import React, { useMemo } from 'react';
import ConnectedContext from './connected-context';
import { SerializableValue } from './types';
import md5 from 'md5';
import stringify from "fast-json-stable-stringify";

function cacheKeyFn(fn: Function, params: readonly SerializableValue[]) {
  const { meta, ...functionProperties } = fn as any;
  if (!meta) {
    console.warn(`Function ${fn.name} has no associated meta. Make sure your transpiler is configured correctly.`);
  }
  const name = meta?.name ?? fn.name;
  return md5(stringify([name, functionProperties, ...params]));
}

export default function useCallResolver() {
  const { cache, dataTtl, errorTtl } = React.useContext(ConnectedContext);
  return useMemo(
    () => (fn: Function, args: any[]) => {
      if (typeof fn !== 'function') {
        throw new TypeError(`${fn} is not a function`);
      }
      const cacheKey: string = cacheKeyFn(fn, args);
      const entry = cache.get(cacheKey);
      if (entry) {
        if (entry.error) {
          throw entry.error;
        }
        return entry.data as SerializableValue;
      }
      const data = fn(...args);
      if (data instanceof Promise) {
        throw data.then((data) => {
          cache.set(cacheKey, { data }, dataTtl);
        }).catch((error) => {
          cache.set(cacheKey, { error }, errorTtl);
        });
      }
      return data;
    },
    [cache]);
}
