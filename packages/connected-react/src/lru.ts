import tinyLru, { Lru as TinyLru } from 'tiny-lru';

export default class Lru<T> {
  private lru: TinyLru<{ value: T; ttl?: Date }>;

  constructor(maxSize: number = 500) {
    this.lru = tinyLru(maxSize);
  }

  public has(key: string): boolean {
    const entry = this.lru.get(key);
    if (!entry) {
      return false;
    }
    if (entry.ttl && entry.ttl < new Date()) {
      this.delete(key);
      return false;
    }
    return true;
  }

  public get(key: string): T|undefined {
    const entry = this.lru.get(key);
    if (!entry) {
      return undefined;
    }
    if (entry.ttl && entry.ttl < new Date()) {
      this.delete(key);
      return undefined;
    }
    return entry.value;
  }

  public set(key: string, value: T, ttl?: number): this {
    function addMs(milliseconds: number) {
      const t = new Date();
      t.setMilliseconds(t.getMilliseconds() + milliseconds);
      return t;
    }
    this.lru.set(key, { value, ttl: ttl ? addMs(ttl) : undefined });

    return this;
  }

  public clear(): this {
    this.lru.clear();
    return this;
  }

  public delete(key: string): this {
    this.lru.delete(key);
    return this;
  }
}
