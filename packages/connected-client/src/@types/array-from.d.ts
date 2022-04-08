declare module 'array-from' {
  export default function arrayFrom<T>(
    array: ArrayLike<T> | Iterator<T> | string
  ): T[];
}
