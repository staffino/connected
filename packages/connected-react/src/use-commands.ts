import { CommandBuilder, Newable } from './types';
import useInstanceWithCommands from './use-instance-with-commands';

export default function useCommands<
  C extends Newable<T>,
  T extends object = InstanceType<C>,
>(
  klass: C, ...args: ConstructorParameters<C>|[]
): CommandBuilder<C, T> {
  const [, commands] = useInstanceWithCommands(klass, ...args);
  return commands;
}
