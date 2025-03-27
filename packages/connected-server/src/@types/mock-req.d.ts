declare module 'mock-req' {
  import { IncomingMessage } from 'http';

  export type Options = {
    method?: string;
    url?: string;
    headers?: { [key: string]: string | number };
  };

  export default class MockReq extends IncomingMessage {
    constructor(options?: Options);

    write(data: string | object | Buffer);

    end();
  }
}
