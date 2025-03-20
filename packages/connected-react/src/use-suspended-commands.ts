import { CommandBuilder, Newable } from './types.js';
import useInstanceWithSuspendedCommands from './use-instance-with-suspended-commands.js';

export default function useSuspendedCommands<
  C extends Newable<T>,
  T extends object = InstanceType<C>
>(
  klass: C,
  ...args: ConstructorParameters<C> | []
): CommandBuilder<C, T, true> {
  const [, commands] = useInstanceWithSuspendedCommands<C, T>(klass, ...args);
  return commands;
}
