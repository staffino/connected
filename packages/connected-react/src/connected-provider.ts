import React, { useCallback, useRef } from 'react';
import { CacheItem, SerializableValue, Newable } from './types';
import Lru from './lru';
import ConnectedContext from './connected-context';

type Props = {
  maxCacheSize?: number;
  dataTtl?: number;
  errorTtl?: number;

  factory?: <T>(klass: Newable<T>, ...args: any[]) => T;
  initialCacheData?: { [name: string]: SerializableValue };
  onCacheUpdate?: (key: string, value: SerializableValue) => void;

  children?: JSX.Element;
};

function prepareInitialData(
  initialData: Record<string, SerializableValue> | undefined,
  ttl: number
): Record<string, CacheItem> | undefined {
  if (!initialData) {
    return undefined;
  }
  // calculate ttl
  const t = new Date();
  t.setMilliseconds(t.getMilliseconds() + ttl);

  const result: Record<string, CacheItem> = {};
  const keys = Object.keys(initialData);
  keys.forEach((key) => {
    result[key] = {
      ttl: t,
      data: initialData[key],
    };
  });
  return result;
}

function ConnectedProvider({
  maxCacheSize = 500,
  dataTtl = 60 * 1000,
  errorTtl = 5 * 1000,

  factory = <T>(klass: Newable<T>, ...args: any[]) => new klass(args),
  initialCacheData = {},
  onCacheUpdate,

  children,
}: Props) {
  const handleCacheUpdate = useCallback(
    (action: 'set' | 'delete', key: string, value: any) => {
      if (onCacheUpdate && action === 'set' && 'data' in value) {
        onCacheUpdate(key, value.data);
      }
    },
    [onCacheUpdate]
  );
  const { current: cache } = useRef(
    new Lru<CacheItem>(
      prepareInitialData(initialCacheData, dataTtl!),
      maxCacheSize,
      handleCacheUpdate
    )
  );

  return React.createElement(
    ConnectedContext.Provider,
    {
      value: {
        cache,
        dataTtl: dataTtl!,
        errorTtl: errorTtl!,
        factory: factory!,
      },
    },
    children
  );
}

export default ConnectedProvider;
