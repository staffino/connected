import { describe, expect, it } from 'vitest';
import group from './group.js';

class A {
  // @ts-ignore
  @group('post') a() {
    return 42;
  }
}

describe(group, () => {
  it('does nothing', () => {
    const a = new A();
    expect(a.a()).toBe(42);
  });
});
