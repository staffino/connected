import { Newable } from './types';
import useInstanceWithCommands from './use-instance-with-commands';

export default function useInstance<
  C extends Newable<T>,
  T extends object = InstanceType<C>
  >(
  klass: C, ...args: any[]
): T;
export default function useInstance<
  C extends Newable<T>,
  T extends object = InstanceType<C>,
>(
  klass: C, ...args: ConstructorParameters<C>
): T {
  const [instance] = useInstanceWithCommands<C, T>(klass, ...args);
  return instance;
}
