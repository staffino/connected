import EventEmitter from 'events';
import { ExecutorBuilderScanDirOptions, IExecutor } from './types';
import { ResolveRoot } from './resolve-root';
import { ResolveFiles } from './resolve-files';
import { RequireFile } from './require-file';
import { ExtractCallable } from './extract-callable';
import { BuildCallableMap } from './build-callabale-map';
import Executor from './executor';

export default class ExecutorBuilderImplementation extends EventEmitter {

  constructor(
    private readonly resolveRoot: ResolveRoot,
    private readonly resolveFiles: ResolveFiles,
    private readonly requireFile: RequireFile,
    private readonly extractCallable: ExtractCallable,
    private readonly buildCallableMap: BuildCallableMap,
  ) {
    super();
  }

  scanDir(dirOrOptions?: ExecutorBuilderScanDirOptions|string): Promise<IExecutor> {
    let options: ExecutorBuilderScanDirOptions = {};
    if (dirOrOptions === undefined) {
      options.dir = process.cwd();
    } else if (typeof dirOrOptions === 'string') {
      options.dir = dirOrOptions;
    } else {
      options = dirOrOptions;
    }
    if (!options.pattern) {
      options.pattern = '*.server.ts';
    }
    if (!options.ignore) {
      options.ignore = 'node_modules';
    }
    const { instanceBuilder } = options;

    return Promise.resolve()
      .then(() => {
        if (options.root) {
          return Promise.resolve(options.root);
        }
        return this.resolveRoot(options.dir!);
      })
      .then(root => this.resolveFiles(options.pattern!, { root, ignore: options.ignore }))
      .then(files => files.map(file => this.requireFile(file)))
      .then(exports => exports.map(
        e => this.extractCallable(e)).reduce((acc, val) => acc.concat(val), []))
      .then((callables) => {
        callables.forEach(callable => this.emit('callableFound', callable));
        return this.buildCallableMap(callables);
      })
      .then(callableMap => new Executor(callableMap, { instanceBuilder }));
  }
}
