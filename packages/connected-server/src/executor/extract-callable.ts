import { Callable } from './types';
import buildCallableMap from './build-callabale-map';

function createCallableCollection(fn: Function, file?: string, overrideName?: string): Callable[] {
  const name = overrideName || fn.name;
  const properties = Object.getOwnPropertyNames(fn.prototype || {})
    .filter(property => property !== 'constructor' && typeof fn.prototype[property] === 'function')
    .map(property => ({ fn, property, file, name }));

  return [...properties, { fn, file, name }];
}

export default function extractCallable(
  exports: object|Function, file?: string,
): Callable[] {
  const e: any = exports;
  // Build named exports. There won't be collisions yet
  const named = Object.keys(e)
    .filter(name => typeof e[name] === 'function' && name !== 'default')
    .map(name => createCallableCollection(e[name], file, name))
    .reduce((acc, val) => acc.concat(val), []); // flatten

  if (e.default || typeof e === 'function') {
    const defaultExport = e.default || e;
    const def = createCallableCollection(defaultExport, file);
    const result = [...named, ...def];
    try {
      buildCallableMap(result);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new TypeError(
          `Default export name conflicts with one of the named exports in ${file}`);
      }
      throw error;
    }
    return result;
  }

  return named;
}

export type ExtractCallable = typeof extractCallable;
