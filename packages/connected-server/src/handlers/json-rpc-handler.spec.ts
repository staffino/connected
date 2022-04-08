import MockReq from 'mock-req';
import MockRes from 'mock-res';
import JsonRpcHandler from './json-rpc-handler';

function createRequestMock(data: any) {
  const requestData = JSON.stringify(data);
  const request = new MockReq({
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'content-length': requestData.length,
    },
  });
  request.write(requestData);
  request.end();
  return request;
}

function createBatchRpcMock(
  count: number,
  name: string,
  parameters: any[],
  constructorParameters?: any[]
) {
  const data = [...Array(count ?? 1)].map((value, index) => ({
    method: 'execute',
    id: 1 + index,
    jsonrpc: '2.0',
    params: { name, parameters, constructorParameters },
  }));
  return createRequestMock(data);
}

function createRpcMock(
  name: string,
  parameters: any[],
  constructorParameters?: any[]
) {
  return createRequestMock({
    method: 'execute',
    id: 1,
    jsonrpc: '2.0',
    params: { name, parameters, constructorParameters },
  });
}

describe('JsonRpcHandler', () => {
  it('returns error for invalid json', async () => {
    const handler = new JsonRpcHandler();
    const request = new MockReq({ method: 'POST' });
    const response = new MockRes();
    await handler.process(request, response, null);
    // eslint-disable-next-line no-underscore-dangle
    expect(response._getJSON()).toMatchObject({
      jsonrpc: '2.0',
      error: { code: -32603, message: 'Internal error' },
      id: null,
    });
  });

  it('evaluates single successfully', async () => {
    const handler = new JsonRpcHandler();
    const request = createRpcMock('add', [1, 2]);
    const response = new MockRes();
    const executor = { execute: jest.fn().mockResolvedValueOnce(3) };
    await handler.process(request, response, executor);
    // eslint-disable-next-line no-underscore-dangle
    expect(response._getJSON()).toMatchObject({
      jsonrpc: '2.0',
      result: 3,
      id: 1,
    });
  });

  it('evaluates single error', async () => {
    const handler = new JsonRpcHandler();
    const request = createRpcMock('add', [1, 2]);
    const response = new MockRes();
    const executor = {
      execute: jest.fn().mockRejectedValueOnce(new Error('internal')),
    };
    await handler.process(request, response, executor);
    // eslint-disable-next-line no-underscore-dangle
    expect(response._getJSON()).toMatchObject({
      jsonrpc: '2.0',
      error: { message: 'internal' },
      id: 1,
    });
  });

  it('evaluates batch successfully', async () => {
    const handler = new JsonRpcHandler();
    const request = createBatchRpcMock(2, 'add', [1, 2]);
    const response = new MockRes();
    const executor = {
      execute: jest.fn().mockResolvedValueOnce(3).mockResolvedValueOnce(5),
    };
    await handler.process(request, response, executor);
    // eslint-disable-next-line no-underscore-dangle
    expect(response._getJSON()).toMatchObject([
      { jsonrpc: '2.0', result: 3, id: 1 },
      { jsonrpc: '2.0', result: 5, id: 2 },
    ]);
  });

  it('evaluates batch error', async () => {
    const handler = new JsonRpcHandler();
    const request = createBatchRpcMock(2, 'add', [1, 2]);
    const response = new MockRes();
    const executor = {
      execute: jest
        .fn()
        .mockRejectedValueOnce(new Error('r1'))
        .mockRejectedValueOnce(new Error('r2')),
    };
    await handler.process(request, response, executor);
    // eslint-disable-next-line no-underscore-dangle
    expect(response._getJSON()).toMatchObject([
      { jsonrpc: '2.0', error: { message: 'r1' }, id: 1 },
      { jsonrpc: '2.0', error: { message: 'r2' }, id: 2 },
    ]);
  });

  it('evaluates mixed batch', async () => {
    const handler = new JsonRpcHandler();
    const request = createBatchRpcMock(2, 'add', [1, 2]);
    const response = new MockRes();
    const executor = {
      execute: jest
        .fn()
        .mockResolvedValueOnce(3)
        .mockRejectedValueOnce(new Error('r2')),
    };
    await handler.process(request, response, executor);
    // eslint-disable-next-line no-underscore-dangle
    expect(response._getJSON()).toMatchObject([
      { jsonrpc: '2.0', result: 3, id: 1 },
      { jsonrpc: '2.0', error: { message: 'r2' }, id: 2 },
    ]);
  });

  it('evaluates batch with input errors', async () => {
    const handler = new JsonRpcHandler();
    const request = createRequestMock([
      {
        method: 'execute',
        id: 1,
        jsonrpc: '2.0',
        params: { name: 'add', parameters: [1, 2] },
      },
      // 1.0
      {
        method: 'execute',
        id: 2,
        jsonrpc: '1.0',
        params: { name: 'add', parameters: [1, 2] },
      },
      // notification
      {
        method: 'execute',
        jsonrpc: '1.0',
        params: { name: 'add', parameters: [1, 2] },
      },
      { method: 'execute', id: 3, jsonrpc: '2.0', params: 1 }, // invalid params
      { method: '', id: 4, jsonrpc: '2.0', params: 1 }, // invalid method name
      { method: 'execute', id: 5, jsonrpc: '2.0' }, // missing params
      { jsonrpc: '2.0', params: { name: 'add', parameters: [1, 2] } }, // no method
    ]);
    const response = new MockRes();
    const executor = { execute: jest.fn().mockResolvedValue(3) };
    await handler.process(request, response, executor);
    // eslint-disable-next-line no-underscore-dangle
    expect(response._getJSON()).toMatchObject([
      { jsonrpc: '2.0', result: 3, id: 1 },
      {
        jsonrpc: '2.0',
        error: { message: 'Internal error', code: -32603 },
        id: 2,
      },
      {
        jsonrpc: '2.0',
        error: { message: 'Internal error', code: -32603 },
        id: null,
      },
      {
        jsonrpc: '2.0',
        error: { message: 'Invalid Request', code: -32600 },
        id: 3,
      },
      {
        jsonrpc: '2.0',
        error: { message: 'Invalid Request', code: -32600 },
        id: 4,
      },
      {
        jsonrpc: '2.0',
        error: { message: 'Function name must be specified.', code: -32602 },
        id: 5,
      },
      {
        jsonrpc: '2.0',
        error: { message: 'Invalid Request', code: -32600 },
        id: null,
      },
    ]);
  });
});
