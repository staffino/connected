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

// tslint:disable-next-line:variable-name
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
    (key, value) => {
      if (onCacheUpdate && value.data) {
        onCacheUpdate(key, value.data);
      }
    },
    [onCacheUpdate]);
  const { current: cache } = useRef(new Lru<CacheItem>(maxCacheSize));

  if (cache.isEmpty() && initialCacheData) {
    for (const i in initialCacheData) {
      if (initialCacheData.hasOwnProperty(i)) {
        cache.set(i, { data: initialCacheData[i] }, dataTtl);
      }
    }
  }
  if (cache.listenerCount('set') === 0) {
    cache.on('set', handleCacheUpdate);
  }

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
