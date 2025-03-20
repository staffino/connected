import EventEmitter from 'events';
import { ExecutorBuilderScanDirOptions, IExecutor } from './types';
import ExecutorBuilderImplementation from './builder-implementation';
import resolveRoot from './resolve-root';
import resolveFiles from './resolve-files';
import requireFile from './require-file';
import extractCallable from './extract-callable';
import createMeta from './create-meta';
import buildCallableMap from './build-callabale-map';

export default class ExecutorBuilder extends EventEmitter {
  private implementation = new ExecutorBuilderImplementation(
    resolveRoot,
    resolveFiles,
    requireFile,
    extractCallable,
    createMeta,
    buildCallableMap
  );

  constructor() {
    super();
    this.implementation.on('callableFound', (...args) =>
      this.emit('callableFound', ...args)
    );
  }

  scanDir(
    dirOrOptions?: ExecutorBuilderScanDirOptions | string
  ): Promise<IExecutor> {
    return this.implementation.scanDir(dirOrOptions);
  }

  static scanDir(
    dirOrOptions?: ExecutorBuilderScanDirOptions | string
  ): Promise<IExecutor> {
    return new ExecutorBuilder().scanDir(dirOrOptions);
  }
}
