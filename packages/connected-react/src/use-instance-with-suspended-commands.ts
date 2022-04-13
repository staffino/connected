import { useContext } from 'react';
import { CommandBuilder, Newable } from './types';
import ConnectedContext from './connected-context';
import useCallResolver from './use-call-resolver';
import buildCommands from './build-commands';

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
