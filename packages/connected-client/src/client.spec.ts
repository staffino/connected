import { describe, expect, it, vi } from 'vitest';
import Client from './client.js';
import Middleware from './middleware.js';

describe('Client static interface', () => {
  it('uses middleware', async () => {
    const middleware = vi.fn((_request, _response, next) => next());
    (Client as any).instance.middleware = new Middleware();
    Client.use(middleware);
    await Client.execute('fn', []);
    expect(middleware.mock.calls.length).toBe(1);
  });

  it('throws error if invalid middleware', async () => {
    const middleware: any = vi.fn((_invalid, _number, _of, _parameters, next) =>
      next()
    );
    (Client as any).instance.middleware = new Middleware();
    expect(() => Client.use(middleware)).toThrow(TypeError);
  });

  it('throws if there is an error', async () => {
    (Client as any).instance.middleware = new Middleware();
    Client.use((_request: any, _response: any, next: (error?: Error) => void) =>
      next(new Error('abc'))
    );
    await expect(Client.execute('fn', [])).rejects.toThrow('abc');
  });

  it('returns data if success', async () => {
    (Client as any).instance.middleware = new Middleware();
    Client.use(
      (_request: any, response: any, next: (error?: Error) => void) => {
        response.result = 10;
        next();
      }
    );
    await expect(Client.execute('fn', [])).resolves.toBe(10);
  });

  it('calls error middleware', async () => {
    const middleware = vi.fn((error, _request, _response, next) => next(error));
    (Client as any).instance.middleware = new Middleware();
    Client.use((_request: any, _response: any, next: (error?: Error) => void) =>
      next(new Error('abc'))
    );
    Client.use(middleware);
    await expect(Client.execute('fn', [])).rejects.toThrow('abc');
    expect(middleware.mock.calls.length).toBe(1);
    expect(middleware.mock.calls[0][0]).toBeInstanceOf(Error);
  });
});

describe('Client instance interface', () => {
  it('uses middleware', async () => {
    const middleware = vi.fn((_request, _response, next) => next());
    const client = new Client();
    client.use(middleware);
    await client.execute('fn', []);
    expect(middleware.mock.calls.length).toBe(1);
  });

  it('throws error if invalid middleware', async () => {
    const middleware: any = vi.fn((_invalid, _number, _of, _parameters, next) =>
      next()
    );
    const client = new Client();
    expect(() => client.use(middleware)).toThrow(TypeError);
  });

  it('throws if there is an error', async () => {
    const client = new Client();
    client.use((_request: any, _response: any, next: (error?: Error) => void) =>
      next(new Error('abc'))
    );
    await expect(client.execute('fn', [])).rejects.toThrow('abc');
  });

  it('returns data if success', async () => {
    const client = new Client();
    client.use(
      (_request: any, response: any, next: (error?: Error) => void) => {
        response.result = 10;
        next();
      }
    );
    await expect(client.execute('fn', [])).resolves.toBe(10);
  });

  it('calls error middleware', async () => {
    const middleware = vi.fn((error, _request, _response, next) => next(error));
    const client = new Client();
    client.use((_request: any, _response: any, next: (error?: Error) => void) =>
      next(new Error('abc'))
    );
    client.use(middleware);
    await expect(client.execute('fn', [])).rejects.toThrow('abc');
    expect(middleware.mock.calls.length).toBe(1);
    expect(middleware.mock.calls[0][0]).toBeInstanceOf(Error);
  });
});
