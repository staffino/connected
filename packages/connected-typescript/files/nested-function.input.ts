export function hostFunction(a: string, b: number, c: any) {
  function nestedFunction(x: string) {
    return x;
  }
  return nestedFunction('abc');
}
