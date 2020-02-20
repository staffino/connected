export default function autoBind<T extends any>(instance: T) {
  const prototype = Object.getPrototypeOf(instance);
  for (const i in prototype) {
    if (prototype.hasOwnProperty(i)) {
      const existingMethod: any = instance[i];
      if (typeof existingMethod === 'function') {
        const method = existingMethod.bind(instance);
        if (existingMethod.hasOwnProperty('meta')) {
          Object.defineProperty(method, 'meta', { value: existingMethod.meta });
        }
        instance[i] = method;
      }
    }
  }
}
