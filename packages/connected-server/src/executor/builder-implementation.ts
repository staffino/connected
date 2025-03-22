import EventEmitter from 'events';
import type { ExecutorBuilderScanDirOptions, IExecutor } from './types.js';
import type { ResolveRoot } from './resolve-root.js';
import type { ResolveFiles } from './resolve-files.js';
import type { ImportModule } from './import-module.js';
import type { ExtractCallable } from './extract-callable.js';
import type { CreateMeta } from './create-meta.js';
import type { BuildCallableMap } from './build-callabale-map.js';
import Executor from './executor.js';

export default class ExecutorBuilderImplementation extends EventEmitter {
  constructor(
    private readonly resolveRoot: ResolveRoot,
    private readonly resolveFiles: ResolveFiles,
    private readonly importModule: ImportModule,
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
      options.pattern = import.meta.filename.match(/\.ts$/)
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
      .then((files) =>
        Promise.all(files.map((file) => this.importModule(file)))
      )
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
