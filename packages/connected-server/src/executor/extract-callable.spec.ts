import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import extractCallable from './extract-callable.js';

const __filename = fileURLToPath(import.meta.url);

class A {
  x1() {}
}
const named = () => 0;

describe('extractCallable', () => {
  it('extracts default es fn', () => {
    const exported = extractCallable(named, __filename);
    expect(exported).toHaveLength(1);
    expect(exported[0].fn).toBe(named);
    expect(exported[0].name).toBe('named');
  });

  it('extracts default cjs fn', () => {
    const exported = extractCallable({ default: named }, __filename);
    expect(exported).toHaveLength(1);
    expect(exported[0].fn).toBe(named);
    expect(exported[0].name).toBe('named');
  });

  it('extracts named fns', () => {
    const exported = extractCallable({ a: () => 0, b: () => 1 });
    expect(exported).toHaveLength(2);
    expect(exported[0].name).toBe('a');
    expect(exported[1].name).toBe('b');
  });

  it('extracts default es class', () => {
    const exported = extractCallable(A, __filename);
    expect(exported).toHaveLength(2);
    expect(exported[0].fn).toBe(A);
    expect(exported[0].name).toBe('A');
    expect(exported[0].property).toBe('x1');
    expect(exported[1].fn).toBe(A);
    expect(exported[1].name).toBe('A');
  });

  it('extracts default cjs class', () => {
    const exported = extractCallable({ default: A }, __filename);
    expect(exported).toHaveLength(2);
    expect(exported[1].fn).toBe(A);
    expect(exported[1].name).toBe('A');
    expect(exported[0].fn).toBe(A);
    expect(exported[0].name).toBe('A');
    expect(exported[0].property).toBe('x1');
  });

  it('extracts named classes', () => {
    const exported = extractCallable({ A, B: A });
    expect(exported).toHaveLength(4);
    expect(exported[0].fn).toBe(A);
    expect(exported[0].name).toBe('A');
    expect(exported[0].property).toBe('x1');
    expect(exported[1].fn).toBe(A);
    expect(exported[1].name).toBe('A');
    expect(exported[1].property).toBe(undefined);
    expect(exported[2].fn).toBe(A);
    expect(exported[2].name).toBe('B');
    expect(exported[2].property).toBe('x1');
    expect(exported[3].fn).toBe(A);
    expect(exported[3].name).toBe('B');
    expect(exported[3].property).toBe(undefined);
  });

  it('extracts mixed (function)', () => {
    const f = () => 0;
    f.a = named;
    f.B = A;
    const exported = extractCallable(f);
    expect(exported).toHaveLength(4);
    expect(exported[0].name).toBe('a');
    expect(exported[0].fn).toBe(named);
    expect(exported[1].name).toBe('B');
    expect(exported[1].fn).toBe(A);
    expect(exported[1].property).toBe('x1');
    expect(exported[2].name).toBe('B');
    expect(exported[2].fn).toBe(A);
    expect(exported[3].name).toBe('f');
    expect(exported[3].fn).toBe(f);
  });

  it('extracts mixed (object)', () => {
    const f = () => 0;
    f.a = named;
    f.B = A;
    const exported = extractCallable({ a: named, B: A });
    expect(exported).toHaveLength(3);
    expect(exported[0].name).toBe('a');
    expect(exported[0].fn).toBe(named);
    expect(exported[1].name).toBe('B');
    expect(exported[1].fn).toBe(A);
    expect(exported[1].property).toBe('x1');
    expect(exported[2].name).toBe('B');
    expect(exported[2].fn).toBe(A);
  });

  it('checks for conflicts', () => {
    expect(() => extractCallable({ named: A, default: named })).toThrowError(
      TypeError
    );
  });
});
