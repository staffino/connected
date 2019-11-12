declare module 'jayson/lib/client/browser' {
  type HttpResponseCallback = (error?: any, data?: string) => void;
  type HttpRequester = (message: string, callback: HttpResponseCallback) => void;
  type ClientOptions = {
    reviver?: Function;
    replacer?: Function;
    generator?: Function;
    version?: number;
  };
  export default class ClientBrowser {
    constructor(httpCallback: HttpRequester, options?: ClientOptions = {});

    request(procName: string, params: { [name: string]: any }, callback: Function);
    request(procName: string, params: { [name: string]: any }, id: string);
    request(
      requests: object[], callback: Function,
    ): Promise<{err: any, errors: any, successes: any}>;
  }
}
