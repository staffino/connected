import * as fs from 'fs';
import * as ts from 'typescript';

const redisClient: string[] = [process.env.REDIS_CLIENT_URL];

// comment like this - transpile or not to transpile? that's a question!

export class ExportedClass {
  private someVariable: string;

  constructor(a: string) {
    this.someVariable = a;
  }

  async classNamedMethod(a: string, b: number, c: typeof fs): Promise<string> {
    this.privateClassMethod(5);
    return await new Promise<string>((resolve => this.someVariable));
  }

  private privateClassMethod(d: number): void {
    console.log('something');
    redisClient.push('lala');
  }
}

export default class ExportedDefaultClass {
  private a: string;

  doAnything() {
    this.a = '.......';
    console.log(this.a);
  }
}

class NotExportedClass {
  private c: string;

  doSomething() {
    this.c = '.......';
    console.log(this.c);
  }
}

export function namedFunction(a: string, b: number, c: typeof fs) {
  return 5;
}
