import Lru from './lru';

describe('Lru', () => {
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
    it('returns false for expired key', () => {
      const lru = new Lru();
      lru.set('key', 1, -1000);
      expect(lru.has('key')).toBe(false);
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
    it('returns undefined for expired key', () => {
      const lru = new Lru();
      lru.set('key', 1, -1000);
      expect(lru.get('key')).toBe(undefined);
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
      const lru = new Lru(2);
      lru.set('key1', 1);
      lru.set('key2', 2);
      lru.set('key3', 3);
      expect(lru.get('key1')).toBe(undefined);
      expect(lru.get('key2')).toBe(2);
      expect(lru.get('key3')).toBe(3);
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
});
