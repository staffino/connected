import createMeta  from './create-meta';

class A { m1() {} }
function f1() {}

describe('createMeta', () => {
  it('creates meta for a method', () => {
    createMeta({ fn: A, name: 'A', property: 'm1' });
    expect((A.prototype.m1 as any).meta).toMatchObject({ name: 'A.m1' });
  });

  it('creates meta for a function', () => {
    createMeta({ fn: f1, name: 'f1' });
    expect((f1 as any).meta).toMatchObject({ name: 'f1' });
  });
});
