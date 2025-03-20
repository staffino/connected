declare module 'array-find' {
  export default function find<T>(
    array: T[],
    callback: (element: T, index: number, array: T[]) => boolean
  );
}
