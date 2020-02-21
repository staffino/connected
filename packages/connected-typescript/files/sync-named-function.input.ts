import * as fs from 'fs';
import * as ts from 'typescript';

fs.chmod('./test.ts', 'w+', () => void 0);

const someConstant = 'redis';
let someVariable: string = 'blabla';

// comment like this - transpile or not to transpile? that's a question!

// export default function (a: string, b: number, c: typeof fs) {
//   return someVariable;
// };

function privateFunction(a: string, b: number, c: typeof fs) {
  const cls = new ExportedClass(a);
  return cls.classNamedMethod(a, b, c);
}

export function namedFunction(a: string, b: number, c: typeof fs) {
  return someConstant;
}

export default async function namedDefaultAsyncFunction(a: string, b: number, c: typeof fs) {
  return privateFunction(a, b, c);
}

export class ExportedClass {
  constructor(a: string) {
    someVariable = a;
  }

  classNamedMethod(a: string, b: number, c: typeof fs): Promise<string> {
    return new Promise<string>(null);
  }
}
