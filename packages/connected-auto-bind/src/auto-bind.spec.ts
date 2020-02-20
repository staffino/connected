import autoBind from './auto-bind';

class A {
  x = 3.14;
  constructor() {
    autoBind(this);
  }
  m1() { return this.x; }
}
Object.defineProperty(A.prototype.m1, 'meta', { value: { name: 'A.m1' } });

describe('autoBind', () => {
  it('auto binds all methods', () => {
    const a = new A();
    expect(a.m1()).toBe(3.14);
  });

  it('preserves meta', () => {
    const a = new A();
    expect((a.m1 as any).meta.name).toBe('A.m1');
  });
});
