import ExecutorBuilderImplementation from './builder-implementation';

describe('ExecutorBuilderImplementation', () => {
  describe('#scanDir', () => {
    it('uses default values if no parameters are given', async () => {
      const resolveRoot = jest.fn(async dir => '/root');
      const resolveFiles = jest.fn(async (pattern, options) => []);
      const requireFile = jest.fn();
      const extractCallable = jest.fn();
      const createMeta = jest.fn();
      const buildCallableMap = jest.fn();

      const builder = new ExecutorBuilderImplementation(
        resolveRoot,
        resolveFiles,
        requireFile,
        extractCallable,
        createMeta,
        buildCallableMap,
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
      const resolveRoot = jest.fn();
      const resolveFiles = jest.fn(async (pattern, options) => ['file1']);
      const requireFile = jest.fn();
      const extractCallable = jest.fn();
      const createMeta = jest.fn();
      const buildCallableMap = jest.fn(() => new Map([['f1', { fn: () => 0, name: 'f1' }]]));

      const builder = new ExecutorBuilderImplementation(
        resolveRoot,
        resolveFiles,
        requireFile,
        extractCallable,
        createMeta,
        buildCallableMap,
      );
      const executor: any = await builder.scanDir();
      expect(executor.callableMap.get('f1')).toMatchObject({ name: 'f1' });
    });

    it('emits event when found a callable', async () => {
      const resolveRoot = jest.fn();
      const resolveFiles = jest.fn(async (pattern, options) => ['file1']);
      const requireFile = jest.fn();
      const extractCallable = jest.fn(file => [{ fn: () => 0, name: 'f1' }]);
      const createMeta = jest.fn();
      const buildCallableMap = jest.fn();

      const eventSink = jest.fn();

      const builder = new ExecutorBuilderImplementation(
        resolveRoot,
        resolveFiles,
        requireFile,
        extractCallable,
        createMeta,
        buildCallableMap,
      );
      builder.on('callableFound', eventSink);
      await builder.scanDir();
      expect(eventSink.mock.calls.length).toBe(1);
      expect(eventSink.mock.calls[0][0]).toMatchObject({ name: 'f1' });
    });

    it('passes options to executor', async () => {
      const resolveRoot = jest.fn();
      const resolveFiles = jest.fn(async (pattern, options) => []);
      const requireFile = jest.fn();
      const extractCallable = jest.fn();
      const createMeta = jest.fn();
      const buildCallableMap = jest.fn();

      const builder = new ExecutorBuilderImplementation(
        resolveRoot,
        resolveFiles,
        requireFile,
        extractCallable,
        createMeta,
        buildCallableMap,
      );
      const instanceBuilder = (): null => null;
      const executor: any = await builder.scanDir({ factory: instanceBuilder });
      expect(executor.options.instanceBuilder).toBe(instanceBuilder);
    });
  });
});
