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
  initialData: Record<string, SerializableValue>|undefined,
  ttl: number): Record<string, CacheItem>|undefined {
  if (!initialData) {
    return undefined;
  }
  // calculate ttl
  const t = new Date();
  t.setMilliseconds(t.getMilliseconds() + ttl);

  const result: Record<string, CacheItem> = {};
  for (const i in initialData) {
    if (initialData.hasOwnProperty(i)) {
      result[i] = {
        ttl: t,
        data: initialData[i],
      }
    }
  }
  return result;
}

const ConnectedProvider = ({
  maxCacheSize,
  dataTtl,
  errorTtl,

  factory,
  initialCacheData,
  onCacheUpdate,

  children,
}: Props) => {
  const handleCacheUpdate = useCallback(
    (action, key, value) => {
      if (onCacheUpdate && action === 'set' && value.hasOwnProperty('data')) {
        onCacheUpdate(key, value.data);
      }
    },
    [onCacheUpdate]);
  const { current: cache } = useRef(
    new Lru<CacheItem>(
      prepareInitialData(initialCacheData, dataTtl!),
      maxCacheSize,
      handleCacheUpdate));

  return React.createElement(
    ConnectedContext.Provider,
    {
      value: {
        cache,
        dataTtl: dataTtl!,
        errorTtl: errorTtl!,
        factory: factory!,
      } },
    children,
  );
};

ConnectedProvider.defaultProps = {
  maxCacheSize: 500,
  dataTtl: 60 * 1000,
  errorTtl: 5 * 1000,

  initialCacheData: {},
  factory: <T>(klass: Newable<T>, ...args: any[]) => new klass(args),
};

export default ConnectedProvider;
