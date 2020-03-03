import * as fs from 'fs';
import * as ts from 'typescript';

const redisClient = ['process.env.REDIS_CLIENT_URL'];

// comment like this - transpile or not to transpile? that's a question!

export class ExportedClass {
  constructor(a) {
    this.someVariable = a;
  }

  async classAsyncNamedMethod(a, b, c) {
    this.classNamedMethod(5);
    return await new Promise((resolve => this.someVariable));
  }

  classNamedMethod(d) {
    console.log('something');
    redisClient.push('lala');
  }

  static classStaticNamedMethod(d) {
    console.log('something');
    redisClient.push('lala');
  }
}

export default class ExportedDefaultClass {
  doAnything() {
    this.a = '.......';
    console.log(this.a);
  }
}

class NotExportedClass {
  doSomething() {
    this.c = '.......';
    console.log(this.c);
  }
}

export function namedFunction(a, b, c) {
  return 5;
}
