import React, { useCallback, useEffect, useRef } from 'react';
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
  const { current: cache } = useRef(new Lru<CacheItem>(maxCacheSize));
  const handleCacheUpdate = useCallback(
    (key, value) => {
      if (onCacheUpdate) {
        onCacheUpdate(key, value);
      }
    },
    [cache]);
  useEffect(
    () => {
      for (const i in initialCacheData) {
        if (initialCacheData.hasOwnProperty(i)) {
          cache.set(i, { data: initialCacheData[i] }, dataTtl);
        }
      }
      cache.on('set', handleCacheUpdate);

      return () => {
        cache.off('set', handleCacheUpdate);
      };
    },
    [cache]);

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
