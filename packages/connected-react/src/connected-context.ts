import React from 'react';
import Lru from './lru';
import { SerializableValue } from './types';

type CacheEntry = {
  error?: Error;
  data?: SerializableValue;
};
// tslint:disable-next-line:variable-name
const ConnectedContext = React.createContext({ cache: new Lru<CacheEntry>(100) });
export default ConnectedContext;
