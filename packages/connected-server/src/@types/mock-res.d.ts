declare module 'mock-res' {

  import { ServerResponse } from 'http';

  export default class MockRes extends ServerResponse {
    constructor(done?: Function);

    // tslint:disable-next-line:function-name
    _getString(): string;

    // tslint:disable-next-line:function-name
    _getJSON(): object;
  }
}
