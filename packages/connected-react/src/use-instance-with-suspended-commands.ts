import { useContext } from 'react';
import type { CommandBuilder, Newable } from './types.js';
import ConnectedContext from './connected-context.js';
import useCallResolver from './use-call-resolver.js';
import buildCommands from './build-commands.js';

export default function useInstanceWithSuspendedCommands<
  C extends Newable<T>,
  T extends object = InstanceType<C>,
  A extends unknown[] = ConstructorParameters<C> | []
>(klass: C, ...args: A): [T, CommandBuilder<C, T, true>] {
  const { factory } = useContext(ConnectedContext);
  const resolver = useCallResolver();
  const instance = factory(klass, ...args);
  const commands = buildCommands<T, C, true>(instance, args, resolver);
  return [instance, commands];
}
