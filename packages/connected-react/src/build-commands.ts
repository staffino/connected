import { CommandBuilder, Newable } from './types';

export function buildCommands<
  T extends object,
  C extends Newable<T> = Newable<T>,
  StripPromise extends boolean = false,
  >(
  instance: T, constructorParameters: any[], resolver: Function,
): CommandBuilder<C, T, StripPromise> {
  const commands: any = {};
  const anInstance: any = instance;
  const prototype = Object.getPrototypeOf(instance);
  const properties = Object.getOwnPropertyNames(prototype);
  for (let i = 0; i < properties.length; i += 1) {
    const property = properties[i];
    const existingMethod = anInstance[property];
    if (property !== 'constructor' && typeof existingMethod === 'function') {
      commands[property] = (...parameters: any[]) => {
        const fn = () => resolver(
          existingMethod.bind(instance), parameters, existingMethod.meta);
        fn.parameters = parameters;
        fn.constructorParameters = constructorParameters;
        fn.meta = existingMethod.meta;

        return fn;
      };
    }
  }
  return commands;
}
