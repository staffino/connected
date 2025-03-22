import type { CommandBuilder, Newable } from './types.js';
import useInstanceWithCommands from './use-instance-with-commands.js';

export default function useCommands<
  C extends Newable<T>,
  T extends object = InstanceType<C>
>(klass: C, ...args: ConstructorParameters<C> | []): CommandBuilder<C, T> {
  const [, commands] = useInstanceWithCommands<C, T>(klass, ...args);
  return commands;
}
