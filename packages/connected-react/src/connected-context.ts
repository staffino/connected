import React from 'react';
import Lru from './lru';
import { CacheItem, Newable } from './types';

// tslint:disable-next-line:variable-name
const ConnectedContext = React.createContext({
  cache: new Lru<CacheItem>(100),
  dataTtl: 60 * 1000,
  errorTtl: 5 * 1000,
  factory: <T>(klass: Newable<T>, ...args: any[]) => new klass(...args),
});
export default ConnectedContext;
