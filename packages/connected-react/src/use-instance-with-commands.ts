import { useContext } from 'react';
import { CommandBuilder, Newable } from './types';
import ConnectedContext from './connected-context';
import buildCommands from './build-commands';

export default function useInstanceWithCommands<
  C extends Newable<T>,
  T extends object = InstanceType<C>,
  A extends unknown[] = ConstructorParameters<C> | []
>(klass: C, ...args: A): [T, CommandBuilder<C, T>] {
  const { factory } = useContext(ConnectedContext);
  const instance = factory(klass, ...args);
  const commands = buildCommands<T, C>(
    instance,
    args,
    (fn: Function, parameters: any[]) => fn(...parameters)
  );
  return [instance, commands];
}
