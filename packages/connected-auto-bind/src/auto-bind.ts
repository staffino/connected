export default function autoBind<T extends any>(instance: T) {
  const prototype = Object.getPrototypeOf(instance);
  const properties = Object.getOwnPropertyNames(prototype);
  for (let i = 0; i < properties.length; i += 1) {
    const property = properties[i];
    const existingMethod = instance[property];
    if (property !== 'constructor' && typeof existingMethod === 'function') {
      const method = existingMethod.bind(instance);
      if (existingMethod.hasOwnProperty('meta')) {
        Object.defineProperty(method, 'meta', { value: existingMethod.meta });
      }
      instance[property] = method;
    }
  }
}
