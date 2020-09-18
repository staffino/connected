import {
  Command, FunctionKeys, Newable, SerializableFunction, StripPromise,
} from './types';
import useCallResolver from './use-call-resolver';

export default function useResult<
  M extends FunctionKeys<T>,
  T extends object,
>(command: Command<M, Newable<T>, T>): StripPromise<ReturnType<T[M]>>;

export default function useResult<
  F extends SerializableFunction,
>(fn: F): StripPromise<ReturnType<F>>;

export default function useResult<
  F extends SerializableFunction,
  P extends Parameters<F>,
>(fn: F, ...args: P): StripPromise<ReturnType<F>>;

export default function useResult<
  F extends SerializableFunction,
  P extends Parameters<F>,
  T extends object,
>(
  fnOrCommand: F | Command<FunctionKeys<T>, Newable<T>, T>,
  ...args: P
) {
  const callResolver = useCallResolver();
  return callResolver(fnOrCommand, args);
}
