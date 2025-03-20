import { beforeEach, describe, expect, it, vi } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';
import middleware from './rpc-transfer-middleware.js';
import { Request } from './types.js';

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

let uuidValue = 0;
vi.mock('uuid/v4.js', () => ({
  default: () => {
    uuidValue += 1;
    return uuidValue.toString();
  },
}));

describe('RpcTransferMiddleware', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    uuidValue = 0;
  });

  it('has default url option', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify([{ jsonrpc: '2.0', result: '1', id: '1' }])
    );
    const m = middleware('http://localhost/rpc');
    const req: Request = { name: 'a', parameters: [] };
    const res: any = {};
    await new Promise((resolve) => m(req, res, resolve));
    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost/rpc');
  });

  it('accepts string as url option', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify([{ jsonrpc: '2.0', result: '2', id: '1' }])
    );
    const m = middleware('http://localhost/rpc2');
    const req: Request = { name: 'b', parameters: [] };
    const res: any = {};
    await new Promise((resolve) => m(req, res, resolve));
    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost/rpc2');
  });

  it('accepts options.url', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify([{ jsonrpc: '2.0', result: '1', id: '1' }])
    );
    const m = middleware({ url: 'http://localhost/rpc3' });
    const req: Request = { name: 'b', parameters: [] };
    const res: any = {};
    await new Promise((resolve) => m(req, res, resolve));
    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost/rpc3');
  });

  it('batches requests', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify([
        { jsonrpc: '2.0', result: '1', id: '1' },
        { jsonrpc: '2.0', result: '10', id: '2' },
      ])
    );
    const m = middleware('http://localhost/rpc');
    const req1: Request = { name: 'a', parameters: [] };
    const res1: any = {};
    const req2: Request = { name: 'b', parameters: [] };
    const res2: any = {};
    await Promise.all([
      new Promise((resolve) => m(req1, res1, resolve)),
      new Promise((resolve) => m(req2, res2, resolve)),
    ]);
    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(res1.result).toBe('1');
    expect(res2.result).toBe('10');
  });

  it('handles success', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify([{ jsonrpc: '2.0', result: '10', id: '1' }])
    );
    const m = middleware('http://localhost/rpc');
    const req: Request = { name: 'a', parameters: [] };
    const res: any = {};
    await new Promise((resolve) => m(req, res, resolve));
    expect(res.result).toBe('10');
  });

  it('handlers function error', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify([
        { jsonrpc: '2.0', error: { code: 409, message: 'Conflict' }, id: '1' },
      ])
    );
    const m = middleware('http://localhost/rpc');
    const req: Request = { name: 'a', parameters: [] };
    const res: any = {};
    const error = await new Promise((resolve) => m(req, res, resolve));
    expect(error).toBeInstanceOf(Error);
    expect(String(error)).toContain('Conflict');
  });

  it('handlers transport error', async () => {
    fetchMock.mockRejectOnce(new Error('Transport error'));
    const m = middleware('http://localhost/rpc');
    const req: Request = { name: 'a', parameters: [] };
    const res: any = {};
    const error = await new Promise((resolve) => m(req, res, resolve));
    expect(error).toBeInstanceOf(Error);
    expect(String(error)).toContain('Transport');
  });
});
