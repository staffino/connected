import { useContext } from 'react';
import { Newable } from './types';
import ConnectedContext from './connected-context';

export default function useInstance<T>(klass: Newable<T>, ...args: any[]): T {
  const { factory } = useContext(ConnectedContext);
  return factory(klass, ...args);
}
