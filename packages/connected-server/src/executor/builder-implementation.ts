import EventEmitter from 'events';
import { ExecutorBuilderScanDirOptions, IExecutor } from './types';
import { ResolveRoot } from './resolve-root';
import { ResolveFiles } from './resolve-files';
import { RequireFile } from './require-file';
import { ExtractCallable } from './extract-callable';
import { CreateMeta } from './create-meta';
import { BuildCallableMap } from './build-callabale-map';
import Executor from './executor';

export default class ExecutorBuilderImplementation extends EventEmitter {
  constructor(
    private readonly resolveRoot: ResolveRoot,
    private readonly resolveFiles: ResolveFiles,
    private readonly requireFile: RequireFile,
    private readonly extractCallable: ExtractCallable,
    private readonly createMeta: CreateMeta,
    private readonly buildCallableMap: BuildCallableMap
  ) {
    super();
  }

  scanDir(
    dirOrOptions?: ExecutorBuilderScanDirOptions | string
  ): Promise<IExecutor> {
    let options: ExecutorBuilderScanDirOptions = {};
    if (typeof dirOrOptions === 'object') {
      options = dirOrOptions;
    } else if (typeof dirOrOptions === 'string') {
      options.dir = dirOrOptions;
    }
    if (!options.dir && !options.root) {
      options.dir = process.cwd();
    }
    if (!options.pattern) {
      options.pattern = __filename.match(/\.ts$/)
        ? '*.server.ts'
        : '*.server.js';
    }
    if (!options.ignore) {
      options.ignore = 'node_modules';
    }
    const { factory } = options;

    return Promise.resolve()
      .then(() => {
        if (options.root) {
          return Promise.resolve(options.root);
        }
        return this.resolveRoot(options.dir!);
      })
      .then((root) =>
        this.resolveFiles(options.pattern!, {
          root,
          ignore: options.ignore,
          matchBase: true,
        })
      )
      .then((files) => files.map((file) => this.requireFile(file)))
      .then((exports) =>
        exports
          .map((e) => this.extractCallable(e))
          .reduce((acc, val) => acc.concat(val), [])
      )
      .then((callables) => {
        callables.forEach((callable) => {
          if (options.createMeta !== false) {
            this.createMeta(callable);
          }
          this.emit('callableFound', callable);
        });
        return this.buildCallableMap(callables);
      })
      .then((callableMap) => new Executor(callableMap, { factory }));
  }
}
