import { Newable } from './types';
import useInstanceWithCommands from './use-instance-with-commands';

export default function useInstance<
  T extends object,
  C extends Newable<T> = Newable<T>,
>(
  klass: C, ...args: any[]
): T;
export default function useInstance<
  T extends object,
  C extends Newable<T> = Newable<T>,
>(
  klass: C, ...args: ConstructorParameters<C>
): T {
  const [instance] = useInstanceWithCommands<T>(klass, ...args);
  return instance;
}
