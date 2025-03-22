import { describe, expect, it } from 'vitest';
import Middleware from './middleware.js';

describe('Middleware', () => {
  it('returns unchanged args if no handlers', async () => {
    const request = {};
    const middleware = new Middleware();
    await new Promise((resolve) => middleware.go(resolve, request));
    expect(request).toEqual({});
  });

  it('invokes sync handler', async () => {
    const request = {};
    const middleware = new Middleware();
    middleware.use((next, request) => {
      request.x = 1;
      next();
    });
    await new Promise((resolve) => middleware.go(resolve, request));
    expect(request).toEqual({ x: 1 });
  });

  it('invokes handlers in order', async () => {
    const request = {};
    const middleware = new Middleware();
    middleware.use((next, request) => {
      request.x = 1;
      next();
    });
    middleware.use((next, request) => {
      request.x = 2;
      next();
    });
    await new Promise((resolve) => middleware.go(resolve, request));
    expect(request).toEqual({ x: 2 });
  });

  it('invokes async handler', async () => {
    const request = {};
    const middleware = new Middleware();
    middleware.use((next, request) => {
      setTimeout(() => {
        request.x = 1;
        next();
      }, 100);
    });
    await new Promise((resolve) => middleware.go(resolve, request));
    expect(request).toEqual({ x: 1 });
  });

  it('returns no error', async () => {
    const request = {};
    const middleware = new Middleware();
    middleware.use((next) => next());
    const error = await new Promise((resolve) =>
      middleware.go(resolve, request)
    );
    expect(error).toBeUndefined();
  });

  it('catches error', async () => {
    const request = {};
    const middleware = new Middleware();
    middleware.use(() => {
      throw 1;
    });
    const error = await new Promise((resolve) =>
      middleware.go(resolve, request)
    );
    expect(error).toEqual(1);
  });

  it('processes callback error', async () => {
    const request = {};
    const middleware = new Middleware();
    middleware.use((next) => next(1));
    const error = await new Promise((resolve) =>
      middleware.go(resolve, request)
    );
    expect(error).toEqual(1);
  });

  it('no error handlers called in normal flow', async () => {
    const request = {};
    const middleware = new Middleware();
    middleware.use((next) => next());
    middleware.useErrorHandler((error, next, request) => {
      request.x = 1;
      next(error);
    });
    const error = await new Promise((resolve) =>
      middleware.go(resolve, request)
    );
    expect(request).toEqual({});
    expect(error).toBeUndefined();
  });

  it('propagates the error by callback', async () => {
    const request = {};
    const middleware = new Middleware();
    middleware.use((next) => next(1));
    middleware.useErrorHandler((error, next) => next(error + 1));
    const error = await new Promise((resolve) =>
      middleware.go(resolve, request)
    );
    expect(error).toEqual(2);
  });

  it('propagates the thrown error', async () => {
    const request = {};
    const middleware = new Middleware();
    middleware.use(() => {
      throw 1;
    });
    middleware.useErrorHandler((error, next) => next(error + 1));
    const error = await new Promise((resolve) =>
      middleware.go(resolve, request)
    );
    expect(error).toEqual(2);
  });

  it('skips normal handlers if error', async () => {
    const request = {};
    const middleware = new Middleware();
    middleware.use((next) => next(1));
    middleware.use((next, request) => {
      request.x = 1;
      next();
    });
    const error = await new Promise((resolve) =>
      middleware.go(resolve, request)
    );
    expect(error).toEqual(1);
    expect(request).toEqual({});
  });
});
