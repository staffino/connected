import { Callable } from '../types';

export default function buildCallableMap(callables: Callable[]): Map<string, Callable> {
  const map = new Map<string, Callable[]>();
  for (const callable of callables) {
    const key = callable.property ? `${callable.name}.${callable.property}` : callable.name;
    if (map.has(key)) {
      map.get(key)!.push(callable);
    } else {
      map.set(key, [callable]);
    }
  }

  const collision = Array.from(map.values()).find(group => group.length !== 1);
  if (collision) {
    const name = collision[0].property ?
      `${collision[0].name}.${collision[0].property}` : collision[0].name;
    throw new TypeError(`Name conflicts found for "${name}". Definitions found in ${collision.map(c => c.file).join(', ')}`);
  }

  return new Map(Array.from(map.keys()).map(key => ([key, map.get(key)![0]])));
}

export type BuildCallableMap = typeof buildCallableMap;
