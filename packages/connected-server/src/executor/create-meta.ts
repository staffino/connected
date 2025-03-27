import type { Callable } from './types.js';

export default function createMeta(callable: Callable) {
  const fn = callable.property
    ? callable.fn.prototype[callable.property]
    : callable.fn;
  const name = callable.property
    ? `${callable.name}.${callable.property}`
    : callable.name;
  Object.defineProperty(fn, 'meta', { value: { name } });
}

export type CreateMeta = typeof createMeta;
