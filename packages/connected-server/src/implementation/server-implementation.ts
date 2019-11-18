import { Callable, IServer, ServerOptions } from '../types';
import { ResolveRoot } from './resolve-root';
import { ResolveFiles } from './resolve-files';
import { RequireFile } from './require-file';
import { ExtractCallable } from './extract-callable';
import { BuildCallableMap } from './build-callabale-map';

export default class ServerImplementation<Request, Response> implements IServer<Request, Response> {
  private readonly options: ServerOptions;
  private callableMap: Map<string, Callable> = new Map();

  constructor(
    dirOrOptions: string | ServerOptions | undefined,
    private readonly resolveRoot: ResolveRoot,
    private readonly resolveFiles: ResolveFiles,
    private readonly requireFile: RequireFile,
    private readonly extractCallable: ExtractCallable,
    private readonly buildCallableMap: BuildCallableMap,
  ) {
    if (dirOrOptions === undefined) {
      this.options = { dir: process.cwd() };
    } else if (typeof dirOrOptions === 'string') {
      this.options = { dir: dirOrOptions };
    } else {
      this.options = dirOrOptions;
    }
    if (!this.options.ignore) {
      this.options.ignore = 'node_modules';
    }
    if (!this.options.codecs || this.options.codecs.length === 0) {
      this.options.codecs = [new JsonRpcCodec<Request, Response>()];
    }
  }

  build(): Promise<void> {
    return Promise.resolve()
    .then(() => {
      if (this.options.root) {
        return Promise.resolve(this.options.root);
      }
      return this.resolveRoot(this.options.dir!);
    })
    .then(root => this.resolveFiles(root, this.options.pattern!))
    .then(files => files.map(file => this.requireFile(file)))
    .then(exports => exports.map(
      e => this.extractCallable(e)).reduce((acc, val) => acc.concat(val), []))
    .then((callables) => {
      this.callableMap = this.buildCallableMap(callables);
    });
  }

  process(_request: Request, _response: Response): Promise<void> {
    return Promise.resolve();
  }
}
