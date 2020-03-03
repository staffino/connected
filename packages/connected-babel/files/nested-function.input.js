export function hostFunction(a, b, c) {
  function nestedFunction(x) {
    return x;
  }
  return nestedFunction('abc');
}
