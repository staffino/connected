import Client from './client';
import Middleware from './middleware';

describe('Client static interface', () => {

  it('uses middleware', async () => {
    const middleware = jest.fn((request, response, next) => next());
    (Client as any).instance.middleware = new Middleware();
    Client.use(middleware);
    await Client.execute('fn', []);
    expect(middleware.mock.calls.length).toBe(1);
  });

  it('throws if there is an error', async () => {
    (Client as any).instance.middleware = new Middleware();
    Client.use((request: any, response: any, next: Function) => next(new Error('abc')));
    await expect(Client.execute('fn', [])).rejects.toThrow('abc');
  });

  it('returns data if success', async () => {
    (Client as any).instance.middleware = new Middleware();
    Client.use((request: any, response: any, next: Function) => { response.result = 10; next(); });
    await expect(Client.execute('fn', [])).resolves.toBe(10);
  });
});

describe('Client instance interface', () => {
  it('uses middleware', async () => {
    const middleware = jest.fn((request, response, next) => next());
    const client = new Client();
    client.use(middleware);
    await client.execute('fn', []);
    expect(middleware.mock.calls.length).toBe(1);
  });

  it('throws if there is an error', async () => {
    const client = new Client();
    client.use((request: any, response: any, next: Function) => next(new Error('abc')));
    await expect(client.execute('fn', [])).rejects.toThrow('abc');
  });

  it('returns data if success', async () => {
    const client = new Client();
    client.use((request: any, response: any, next: Function) => { response.result = 10; next(); });
    await expect(client.execute('fn', [])).resolves.toBe(10);
  });
});
