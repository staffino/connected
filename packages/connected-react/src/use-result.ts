import {
  Command,
  FunctionKeys,
  Newable,
  SafeReturnType,
  SerializableFunction,
} from './types.js';
import useCallResolver from './use-call-resolver.js';

export default function useResult<M extends FunctionKeys<T>, T extends object>(
  command: Command<M, Newable<T>, T>
): Awaited<SafeReturnType<T[M]>>;

export default function useResult<F extends SerializableFunction>(
  fn: F
): Awaited<ReturnType<F>>;

export default function useResult<
  F extends SerializableFunction,
  P extends Parameters<F>
>(fn: F, ...args: P): Awaited<ReturnType<F>>;

export default function useResult<
  F extends SerializableFunction,
  P extends Parameters<F>,
  T extends object
>(
  fnOrCommand: F | Command<FunctionKeys<T>, Newable<T>, T>,
  ...args: P
): Awaited<ReturnType<F>> {
  const callResolver = useCallResolver();
  return callResolver(fnOrCommand, args);
}
