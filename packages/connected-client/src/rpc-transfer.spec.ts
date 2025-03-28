import { beforeEach, describe, expect, it, vi } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';
import RpcTransfer from './rpc-transfer.js';

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

let uuidValue = 0;
vi.mock('uuid/v4.js', () => ({
  default: () => {
    uuidValue += 1;
    return uuidValue.toString();
  },
}));

describe('RpcTransfer', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    uuidValue = 0;
  });

  it('has default url option', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify([{ jsonrpc: '2.0', result: '1', id: '1' }])
    );
    const transfer = new RpcTransfer('http://localhost/rpc');
    const result = await transfer.request('a', { _name: 'b', params: {} });
    expect(result).toBe('1');
    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost/rpc');
  });

  it('accepts string as url option', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify([{ jsonrpc: '2.0', result: '1', id: '1' }])
    );
    const transfer = new RpcTransfer('http://localhost/rpc2');
    const result = await transfer.request('a', { _name: 'b', params: {} });
    expect(result).toBe('1');
    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost/rpc2');
  });

  it('accepts options.url', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify([{ jsonrpc: '2.0', result: '1', id: '1' }])
    );
    const transfer = new RpcTransfer({ url: 'http://localhost/rpc3' });
    const result = await transfer.request('a', { _name: 'b', params: {} });
    expect(result).toBe('1');
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
    const transfer = new RpcTransfer('http://localhost/rpc');
    const [r1, r2] = await Promise.all([
      transfer.request('a', { _name: 'aX', params: {} }),
      transfer.request('b', { _name: 'bX', params: {} }),
    ]);
    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(r1).toBe('1');
    expect(r2).toBe('10');
  });

  it('handles success', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify([{ jsonrpc: '2.0', result: '10', id: '1' }])
    );
    const transfer = new RpcTransfer('http://localhost/rpc');
    const result = await transfer.request('a', { _name: 'b', params: {} });
    expect(result).toBe('10');
  });

  it('handles function error', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify([
        { jsonrpc: '2.0', error: { code: 409, message: 'Conflict' }, id: '1' },
      ])
    );
    const transfer = new RpcTransfer('http://localhost/rpc');
    await expect(
      transfer.request('a', { _name: 'b', params: {} })
    ).rejects.toThrow('Conflict');
  });

  it('handles transport error', async () => {
    fetchMock.mockRejectOnce(new Error('Transport error'));
    const transfer = new RpcTransfer('http://localhost/rpc');
    await expect(
      transfer.request('a', { _name: 'b', params: {} })
    ).rejects.toThrow('Transport');
  });

  it('handles invalid response', async () => {
    fetchMock.mockResponseOnce('x'); // a totally screwed-up response
    const transfer = new RpcTransfer('http://localhost/rpc');
    await expect(
      transfer.request('a', { _name: 'b', params: {} })
    ).rejects.toThrow();
  });

  it('handles invalid request', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify([
        { jsonrpc: '2.0', id: null }, // no id present in the response (simulates invalid request)
      ])
    );
    const transfer = new RpcTransfer('http://localhost/rpc');
    await expect(
      transfer.request('a', { _name: 'b', params: {} })
    ).rejects.toThrow();
  });

  it('handles request groups', async () => {
    fetchMock.mockResponses(
      JSON.stringify([{ jsonrpc: '2.0', result: '1', id: '1' }]),
      JSON.stringify([{ jsonrpc: '2.0', result: '10', id: '2' }])
    );
    const transfer = new RpcTransfer('http://localhost/rpc');
    const [r1, r2] = await Promise.all([
      transfer.request('a', { _name: 'aX', params: {} }),
      transfer.request('b', { _name: 'bX', params: {} }, 'post'),
    ]);
    expect(fetchMock.mock.calls.length).toEqual(2);
    expect(r1).toBe('1');
    expect(r2).toBe('10');
  });

  it('uses custom headers', async () => {
    fetchMock.mockResponseOnce((request) =>
      Promise.resolve(
        JSON.stringify([
          {
            jsonrpc: '2.0',
            result: request.headers.get('x-application-id'),
            id: '1',
          },
        ])
      )
    );
    const transfer = new RpcTransfer({
      url: 'http://localhost/rpc',
      headers: { 'x-application-id': '@connected' },
    });
    const result = await transfer.request('a', { _name: 'b', params: {} });
    expect(result).toBe('@connected');
  });
});
