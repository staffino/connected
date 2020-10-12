import Lru from './lru';

describe('Lru', () => {
  describe('new', () => {
    it('uses max size parameter', () => {
      const lru = new Lru({}, 2);
      lru.set('a', 1);
      lru.set('b', 2);
      lru.set('c', 3);
      expect(lru.get('b')).toEqual(2);
      expect(lru.get('c')).toEqual(3);
      expect(lru.get('a')).not.toBeDefined();
    });

    it('uses initial data parameter', () => {
      const lru = new Lru({ a: 1, b: 2 }, 500);
      expect(lru.get('a')).toEqual(1);
      expect(lru.get('b')).toEqual(2);
    });
  });

  describe('#has', () => {
    it('returns false for non-existent key', () => {
      const lru = new Lru();
      expect(lru.has('key')).toBe(false);
    });
    it('returns true for existing key', () => {
      const lru = new Lru();
      lru.set('key', 1);
      expect(lru.has('key')).toBe(true);
    });
  });

  describe('#get', () => {
    it('returns undefined for non-existent key', () => {
      const lru = new Lru();
      expect(lru.get('key')).toBe(undefined);
    });
    it('returns correct object for existing key', () => {
      const lru = new Lru();
      lru.set('key1', 1);
      lru.set('key2', 2);
      expect(lru.get('key1')).toBe(1);
      expect(lru.get('key2')).toBe(2);
    });
  });

  describe('#set', () => {
    it('sets object for key', () => {
      const lru = new Lru();
      lru.set('key', 1);
      expect(lru.get('key')).toBe(1);
    });

    it('overwrites object for key', () => {
      const lru = new Lru();
      lru.set('key', 1);
      lru.set('key', 2);
      expect(lru.get('key')).toBe(2);
    });

    it('evicts old key', () => {
      const lru = new Lru(undefined, 2);
      lru.set('key1', 1);
      lru.set('key2', 2);
      lru.set('key3', 3);
      expect(lru.get('key1')).toBe(undefined);
      expect(lru.get('key2')).toBe(2);
      expect(lru.get('key3')).toBe(3);
    });

    it('emits event', () => {
      const handler = jest.fn();
      const lru = new Lru();
      lru.on('set', handler);
      lru.set('key1', 1);
      lru.set('key2', 2);
      expect(handler).toHaveBeenCalledTimes(2);
    });
  });

  describe('#clear', () => {
    it('clears all items', () => {
      const lru = new Lru();
      lru.set('key1', 1);
      lru.set('key2', 2);
      lru.clear();
      expect(lru.has('key1')).toBe(false);
      expect(lru.has('key2')).toBe(false);
    });
  });

  describe('#delete', () => {
    it('removes item by key', () => {
      const lru = new Lru();
      lru.set('key1', 1);
      lru.set('key2', 2);
      lru.delete('key1');
      expect(lru.has('key1')).toBe(false);
      expect(lru.has('key2')).toBe(true);
    });
  });

  describe('#isEmpty', () => {
    it('is empty for new cache', () => {
      const lru = new Lru();
      expect(lru.isEmpty()).toBe(true);
    });

    it('is not empty after adding an item', () => {
      const lru = new Lru();
      lru.set('key1', 1);
      expect(lru.isEmpty()).toBe(false);
    });

    it('is empty after clear', () => {
      const lru = new Lru();
      lru.clear();
      expect(lru.isEmpty()).toBe(true);
    });

    it('is empty removing last item', () => {
      const lru = new Lru();
      lru.set('key1', 1);
      lru.delete('key1');
      expect(lru.isEmpty()).toBe(true);
    });
  });
});
