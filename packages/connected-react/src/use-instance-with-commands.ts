import { CommandBuilder, Newable } from './types';
import { useContext } from 'react';
import ConnectedContext from './connected-context';

export default function useInstanceWithCommands<
  C extends Newable<T>,
  T extends object = InstanceType<C>,
  >(
  klass: C, ...args: any[]
): [T, CommandBuilder<C, T>];
export default function useInstanceWithCommands<
  C extends Newable<T>,
  T extends object = InstanceType<C>,
>(
  klass: C, ...args: ConstructorParameters<C>
): [T, CommandBuilder<C, T>] {
  const { factory } = useContext(ConnectedContext);
  const instance = factory(klass, ...args);
  const commands = buildCommands<T, C>(instance, args);
  return [instance, commands];
}

function buildCommands<
  T extends object,
  C extends Newable<T> = Newable<T>,
>(
  instance: T, constructorParameters: any[],
): CommandBuilder<C, T> {
  const commands: any = {};
  const anInstance: any = instance;
  const prototype = Object.getPrototypeOf(instance);
  const properties = Object.getOwnPropertyNames(prototype);
  for (let i = 0; i < properties.length; i += 1) {
    const property = properties[i];
    const existingMethod = anInstance[property];
    if (property !== 'constructor' && typeof existingMethod === 'function') {
      commands[property] = (...parameters: any[]) => ({
        instance,
        parameters,
        constructorParameters,
        method: existingMethod,
        meta: existingMethod.meta,
      });
    }
  }
  return commands;
}
