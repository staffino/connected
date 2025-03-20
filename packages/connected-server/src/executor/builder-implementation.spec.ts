import { describe, expect, it, vi } from 'vitest';
import ExecutorBuilderImplementation from './builder-implementation.js';

describe('ExecutorBuilderImplementation', () => {
  describe('#scanDir', () => {
    it('uses default values if no parameters are given', async () => {
      const resolveRoot = vi.fn(async (_dir) => '/root');
      const resolveFiles = vi.fn(async (_pattern, _options) => []);
      const requireFile = vi.fn();
      const extractCallable = vi.fn();
      const createMeta = vi.fn();
      const buildCallableMap = vi.fn();

      const builder = new ExecutorBuilderImplementation(
        resolveRoot,
        resolveFiles,
        requireFile,
        extractCallable,
        createMeta,
        buildCallableMap
      );
      await builder.scanDir();
      expect(resolveFiles.mock.calls.length).toBe(1);
      expect(resolveFiles.mock.calls[0][0]).toBe('*.server.ts');
      expect(resolveFiles.mock.calls[0][1]).toMatchObject({
        root: '/root',
        ignore: 'node_modules',
      });
      expect(resolveRoot.mock.calls.length).toBe(1);
    });

    it('passes call map to executor', async () => {
      const resolveRoot = vi.fn();
      const resolveFiles = vi.fn(async (_pattern, _options) => ['file1']);
      const requireFile = vi.fn();
      const extractCallable = vi.fn();
      const createMeta = vi.fn();
      const buildCallableMap = vi.fn(
        () => new Map([['f1', { fn: () => 0, name: 'f1' }]])
      );

      const builder = new ExecutorBuilderImplementation(
        resolveRoot,
        resolveFiles,
        requireFile,
        extractCallable,
        createMeta,
        buildCallableMap
      );
      const executor: any = await builder.scanDir();
      expect(executor.callableMap.get('f1')).toMatchObject({ name: 'f1' });
    });

    it('emits event when found a callable', async () => {
      const resolveRoot = vi.fn();
      const resolveFiles = vi.fn(async (_pattern, _options) => ['file1']);
      const requireFile = vi.fn();
      const extractCallable = vi.fn((_file) => [{ fn: () => 0, name: 'f1' }]);
      const createMeta = vi.fn();
      const buildCallableMap = vi.fn();

      const eventSink = vi.fn();

      const builder = new ExecutorBuilderImplementation(
        resolveRoot,
        resolveFiles,
        requireFile,
        extractCallable,
        createMeta,
        buildCallableMap
      );
      builder.on('callableFound', eventSink);
      await builder.scanDir();
      expect(eventSink.mock.calls.length).toBe(1);
      expect(eventSink.mock.calls[0][0]).toMatchObject({ name: 'f1' });
    });

    it('passes options to executor', async () => {
      const resolveRoot = vi.fn();
      const resolveFiles = vi.fn(async (_pattern, _options) => []);
      const requireFile = vi.fn();
      const extractCallable = vi.fn();
      const createMeta = vi.fn();
      const buildCallableMap = vi.fn();

      const builder = new ExecutorBuilderImplementation(
        resolveRoot,
        resolveFiles,
        requireFile,
        extractCallable,
        createMeta,
        buildCallableMap
      );
      const factory = (): null => null;
      // @ts-expect-error TODO: fix it
      const executor: any = await builder.scanDir({ factory });
      expect(executor.options.factory).toBe(factory);
    });
  });
});
