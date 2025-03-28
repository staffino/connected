import EventEmitter from 'events';
import type { ExecutorBuilderScanDirOptions, IExecutor } from './types.js';
import ExecutorBuilderImplementation from './builder-implementation.js';
import resolveRoot from './resolve-root.js';
import resolveFiles from './resolve-files.js';
import importModule from './import-module.js';
import extractCallable from './extract-callable.js';
import createMeta from './create-meta.js';
import buildCallableMap from './build-callabale-map.js';

export default class ExecutorBuilder extends EventEmitter {
  private implementation = new ExecutorBuilderImplementation(
    resolveRoot,
    resolveFiles,
    importModule,
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
