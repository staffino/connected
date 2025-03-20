import buildCallableMap from './build-callabale-map';

describe('buildCallableMap', () => {
  it('returns callable map', () => {
    const f = () => 0;
    const collection = [
      { name: 'a', fn: f },
      { name: 'b', fn: f },
      { name: 'A', property: 'x', fn: f },
      { name: 'A', property: 'y', fn: f },
      { name: 'A', fn: f },
      { name: 'B', property: 'x', fn: f },
      { name: 'B', property: 'y', fn: f },
      { name: 'B', fn: f },
    ];
    const map = buildCallableMap(collection);
    expect(Array.from(map.keys())).toMatchObject([
      'a',
      'b',
      'A.x',
      'A.y',
      'A',
      'B.x',
      'B.y',
      'B',
    ]);
  });

  it('throws if collision', () => {
    const f = () => 0;
    const collection = [
      { name: 'A', fn: f },
      { name: 'A', fn: f },
      { name: 'A', property: 'x', fn: f },
      { name: 'A', property: 'x', fn: f },
    ];
    expect(() => buildCallableMap(collection)).toThrowError(TypeError);
  });
});
