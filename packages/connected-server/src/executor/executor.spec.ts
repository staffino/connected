import { describe, expect, it } from 'vitest';
import Executor from './executor.js';
import type { Callable, CallableMap } from './types.js';

class A {
  constructor(private c1: string = '') {}

  m1(a1 = '') {
    return `m1.${a1}.${this.c1}`;
  }

  async m2(a1 = '') {
    return `m2.${a1}.${this.c1}`;
  }
}
const f1 = (a1 = '') => `f1.${a1}`;
const f2 = async (a1 = '') => `f2.${a1}`;

const callableMap: CallableMap = new Map<string, Callable>([
  ['f1', { name: 'f1', fn: f1 }],
  ['f2', { name: 'f2', fn: f2 }],
  ['A.m1', { name: 'A', fn: A, property: 'm1' }],
  ['A.m2', { name: 'A', fn: A, property: 'm2' }],
]);

describe('Executor', () => {
  it('executes sync function without parameters', async () => {
    const executor = new Executor(callableMap);
    const value = await executor.execute('f1', []);
    expect(value).toBe('f1.');
  });

  it('executes sync function with a parameter', async () => {
    const executor = new Executor(callableMap);
    const value = await executor.execute('f1', ['a1']);
    expect(value).toBe('f1.a1');
  });

  it('executes async function without parameters', async () => {
    const executor = new Executor(callableMap);
    const value = await executor.execute('f2', []);
    expect(value).toBe('f2.');
  });

  it('executes async function with a parameter', async () => {
    const executor = new Executor(callableMap);
    const value = await executor.execute('f2', ['a1']);
    expect(value).toBe('f2.a1');
  });

  it('executes sync method without parameters', async () => {
    const executor = new Executor(callableMap);
    const value = await executor.execute('A.m1', []);
    expect(value).toBe('m1..');
  });

  it('executes sync method with a parameter', async () => {
    const executor = new Executor(callableMap);
    const value = await executor.execute('A.m1', ['a1']);
    expect(value).toBe('m1.a1.');
  });

  it('executes async method without parameters', async () => {
    const executor = new Executor(callableMap);
    const value = await executor.execute('A.m2', []);
    expect(value).toBe('m2..');
  });

  it('executes async method with a parameter', async () => {
    const executor = new Executor(callableMap);
    const value = await executor.execute('A.m2', ['a1']);
    expect(value).toBe('m2.a1.');
  });

  it('executes sync method without parameters and constructor parameter', async () => {
    const executor = new Executor(callableMap);
    const value = await executor.execute('A.m1', [], ['c1']);
    expect(value).toBe('m1..c1');
  });

  it('executes sync method with a parameter and constructor parameter', async () => {
    const executor = new Executor(callableMap);
    const value = await executor.execute('A.m1', ['a1'], ['c1']);
    expect(value).toBe('m1.a1.c1');
  });

  it('executes async method without parameters and constructor parameter', async () => {
    const executor = new Executor(callableMap);
    const value = await executor.execute('A.m2', [], ['c1']);
    expect(value).toBe('m2..c1');
  });

  it('executes async method with a parameter and constructor parameter', async () => {
    const executor = new Executor(callableMap);
    const value = await executor.execute('A.m2', ['a1'], ['c1']);
    expect(value).toBe('m2.a1.c1');
  });
});
