import tinyLru, { type Lru as TinyLru } from 'tiny-lru';

interface EventListener<T> {
  (action: string, key?: string, value?: T): void;
}

export default class Lru<T> {
  private readonly lru: TinyLru<T>;

  constructor(
    initialData?: Record<string, T>,
    maxSize?: number,
    private readonly eventListener?: EventListener<T>
  ) {
    this.lru = tinyLru(maxSize || 500);
    if (initialData) {
      const keys = Object.keys(initialData);
      keys.forEach((key) => {
        this.set(key, initialData[key]);
      });
    }
  }

  public has(key: string): boolean {
    return !!this.get(key);
  }

  public get(key: string): T | undefined {
    return this.lru.get(key);
  }

  public set(key: string, value: T): this {
    this.lru.set(key, value);
    this.eventListener?.('set', key, value);

    return this;
  }

  public clear(): this {
    this.lru.clear();
    this.eventListener?.('clear');
    return this;
  }

  public delete(key: string): this {
    this.lru.delete(key);
    this.eventListener?.('delete', key);
    return this;
  }

  public isEmpty(): boolean {
    const { size } = this.lru as any; // no interface for size?
    return size === 0;
  }
}
