import MockReq from 'mock-req';
import MockRes from 'mock-res';
import JsonRpcHandler from './json-rpc-handler';

function createRequestMock(
  method: string, parameters: any[], constructorParameters?: any[],
) {
  return createBatchMock(1, method, parameters, constructorParameters);
}

function createBatchMock(
  count: number = 1,
  method: string,
  parameters: any[],
  constructorParameters?: any[],
) {
  const data = [...Array(count)].map((value, index) =>
    ({ method, id: 1 + index, jsonrpc: '2.0', params: { parameters, constructorParameters } }));
  const requestData = JSON.stringify(count === 1 ? data[0] : data);
  const request = new MockReq(
    { method: 'POST',
      headers: {
        'content-type': 'application/json',
        'content-length': requestData.length,
      } });
  request.write(requestData);
  request.end();
  return request;
}

describe('JsonRpcHandler', () => {
  it('returns error for invalid json', async () => {
    const handler = new JsonRpcHandler();
    const request = new MockReq({ method: 'POST' });
    const response = new MockRes();
    await handler.process(request, response, null);
    // await expect(handler.process(request, response, invoke)).rejects.toThrowError();
    expect(response._getJSON()).toMatchObject(
      { jsonrpc: '2.0', error: { code: -32603, message: 'Internal error' }, id: null });
  });

  it('evaluates single successfully', async () => {
    const handler = new JsonRpcHandler();
    const request = createRequestMock('add', [1, 2]);
    const response = new MockRes();
    const invoke = jest.fn().mockResolvedValueOnce(3);
    await handler.process(request, response, invoke);
    expect(response._getJSON()).toMatchObject(
      { jsonrpc: '2.0', result: 3, id: 1 });
  });

  it('evaluates single error', async () => {
    const handler = new JsonRpcHandler();
    const request = createRequestMock('add', [1, 2]);
    const response = new MockRes();
    const invoke = jest.fn().mockRejectedValueOnce(new Error('internal'));
    await handler.process(request, response, invoke);
    expect(response._getJSON()).toMatchObject(
      { jsonrpc: '2.0', error: { message: 'internal' }, id: 1 });
  });

  it('evaluates batch successfully', async () => {
    const handler = new JsonRpcHandler();
    const request = createBatchMock(2, 'add', [1, 2]);
    const response = new MockRes();
    const invoke = jest.fn()
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(5);
    await handler.process(request, response, invoke);
    expect(response._getJSON()).toMatchObject([
      { jsonrpc: '2.0', result: 3, id: 1 },
      { jsonrpc: '2.0', result: 5, id: 2 },
    ]);
  });

  it('evaluates batch error', async () => {
    const handler = new JsonRpcHandler();
    const request = createBatchMock(2, 'add', [1, 2]);
    const response = new MockRes();
    const invoke = jest.fn()
      .mockRejectedValueOnce(new Error('r1'))
      .mockRejectedValueOnce(new Error('r2'));
    await handler.process(request, response, invoke);
    expect(response._getJSON()).toMatchObject([
      { jsonrpc: '2.0', error: { message: 'r1' }, id: 1 },
      { jsonrpc: '2.0', error: { message: 'r2' }, id: 2 },
    ]);
  });

  it('evaluates mixed batch', async () => {
    const handler = new JsonRpcHandler();
    const request = createBatchMock(2, 'add', [1, 2]);
    const response = new MockRes();
    const invoke = jest.fn()
    .mockResolvedValueOnce(3)
    .mockRejectedValueOnce(new Error('r2'));
    await handler.process(request, response, invoke);
    expect(response._getJSON()).toMatchObject([
      { jsonrpc: '2.0', result: 3, id: 1 },
      { jsonrpc: '2.0', error: { message: 'r2' }, id: 2 },
    ]);
  });
});
