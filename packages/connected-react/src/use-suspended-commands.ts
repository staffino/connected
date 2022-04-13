import { CommandBuilder, Newable } from './types';
import useInstanceWithSuspendedCommands from './use-instance-with-suspended-commands';

export default function useSuspendedCommands<
  C extends Newable<T>,
  T extends object = InstanceType<C>
>(
  klass: C,
  ...args: ConstructorParameters<C> | []
): CommandBuilder<C, T, true> {
  const [, commands] = useInstanceWithSuspendedCommands(klass, ...args);
  return commands;
}
