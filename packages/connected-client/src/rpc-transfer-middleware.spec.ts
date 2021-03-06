import middleware from './rpc-transfer-middleware';
import { Request } from './types';

let uuidValue = 0;
jest.mock('uuid/v4', () => {
  return () => {
    uuidValue += 1;
    return uuidValue.toString();
  };
});

describe('RpcTransferMiddleware', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    uuidValue = 0;
  });

  it('has default url option', async () => {
    fetchMock.mockResponseOnce(JSON.stringify([
      { jsonrpc: '2.0', result: '1', id: '1' },
    ]));
    const m = middleware();
    const req: Request = { name: 'a', parameters: [] };
    const res: any = {};
    await new Promise(resolve => m(req, res, resolve));
    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(fetchMock.mock.calls[0][0]).toBe('/rpc');
  });

  it('accepts string as url option', async () => {
    fetchMock.mockResponseOnce(JSON.stringify([
      { jsonrpc: '2.0', result: '2', id: '1' },
    ]));
    const m = middleware('/rpc2');
    const req: Request = { name: 'b', parameters: [] };
    const res: any = {};
    await new Promise(resolve => m(req, res, resolve));
    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(fetchMock.mock.calls[0][0]).toBe('/rpc2');
  });

  it('accepts options.url', async () => {
    fetchMock.mockResponseOnce(JSON.stringify([
      { jsonrpc: '2.0', result: '1', id: '1' },
    ]));
    const m = middleware({ url: '/rpc3' });
    const req: Request = { name: 'b', parameters: [] };
    const res: any = {};
    await new Promise(resolve => m(req, res, resolve));
    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(fetchMock.mock.calls[0][0]).toBe('/rpc3');
  });

  it('batches requests', async () => {
    fetchMock.mockResponseOnce(JSON.stringify([
      { jsonrpc: '2.0', result: '1', id: '1' },
      { jsonrpc: '2.0', result: '10', id: '2' },
    ]));
    const m = middleware();
    const req1: Request = { name: 'a', parameters: [] };
    const res1: any = {};
    const req2: Request = { name: 'b', parameters: [] };
    const res2: any = {};
    await Promise.all([
      new Promise(resolve => m(req1, res1, resolve)),
      new Promise(resolve => m(req2, res2, resolve)),
    ]);
    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(res1.result).toBe('1');
    expect(res2.result).toBe('10');
  });

  it('handles success', async () => {
    fetchMock.mockResponseOnce(JSON.stringify([
      { jsonrpc: '2.0', result: '10', id: '1' },
    ]));
    const m = middleware();
    const req: Request = { name: 'a', parameters: [] };
    const res: any = {};
    await new Promise(resolve => m(req, res, resolve));
    expect(res.result).toBe('10');
  });

  it('handlers function error', async () => {
    fetchMock.mockResponseOnce(JSON.stringify([
      { jsonrpc: '2.0', error: { code: 409, message: 'Conflict' }, id: '1' },
    ]));
    const m = middleware();
    const req: Request = { name: 'a', parameters: [] };
    const res: any = {};
    const error = await new Promise(resolve => m(req, res, resolve));
    expect(error).toBeInstanceOf(Error);
    expect(error.toString()).toContain('Conflict');
  });

  it('handlers transport error', async () => {
    fetchMock.mockRejectOnce(new Error('Transport error'));
    const m = middleware();
    const req: Request = { name: 'a', parameters: [] };
    const res: any = {};
    const error = await new Promise(resolve => m(req, res, resolve));
    expect(error).toBeInstanceOf(Error);
    expect(error.toString()).toContain('Transport');
  });
});
