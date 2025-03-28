import { useContext } from 'react';
import type { CommandBuilder, Newable } from './types.js';
import ConnectedContext from './connected-context.js';
import buildCommands from './build-commands.js';

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
