import { describe, expect, it } from 'vitest';
import readFile from './spec/read-file.js';
import transpile from './spec/transpile.js';
import transformer from './transformer.js';

describe('Transformer', () => {
  it.each([
    'named-function',
    'default-function',
    'async-function',
    'non-exported-function',
    'nested-function',

    'named-class',
    'default-class',
    'private-method',
    'static-method',
    'abstract-method',
    'group-decorator',

    'imports',
    'statements',

    'wild-west',
  ])('transforms %s correctly', async (file) => {
    const result = await transpile(`./files/${file}.input.ts`, transformer());
    const test = await readFile(`./files/${file}.output.js`);
    expect(result).toEqual(test);
  });

  it('transpiles file matching pattern', async () => {
    const result = await transpile(
      './files/wild-west.input.ts',
      transformer({ pattern: '*.ts' })
    );
    const test = await readFile('./files/wild-west.output.js');
    expect(result).toEqual(test);
  });

  it('skips file not matching pattern', async () => {
    const result = await transpile(
      './files/wild-west.input.ts',
      transformer({ pattern: 'test.ts' })
    );
    const test = await readFile('./files/wild-west.skipped.output.js');
    expect(result).toEqual(test);
  });

  it('transpiles file matching RegExp', async () => {
    const result = await transpile(
      './files/wild-west.input.ts',
      transformer({ pattern: /\.ts$/ })
    );
    const test = await readFile('./files/wild-west.output.js');
    expect(result).toEqual(test);
  });

  it('skips file not matching RegExp', async () => {
    const result = await transpile(
      './files/wild-west.input.ts',
      transformer({ pattern: /\.js$/ })
    );
    const test = await readFile('./files/wild-west.skipped.output.js');
    expect(result).toEqual(test);
  });
});
