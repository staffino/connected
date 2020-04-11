import readFile from '../spec/read-file';
import transpile from '../spec/transpile';
import { getTransformerPlugin } from '../src';

/** Removes last empty line from string. */
function rTrim(s: string): string {
  return s.endsWith('\n') ? s.trimRight() : s;
}

describe('Transformer', () => {

  it.each([
    'named-function',
    'default-function',
    'async-function',
    'non-exported-function',
    'nested-function',

    'named-class',
    'default-class',
    'sync-class',
    'static-method',

    'imports',
    'statements',

    'wild-west',
  ])('transforms %s correctly', async (file) => {
    const result = await transpile(`./files/${file}.input.js`, getTransformerPlugin());
    const test = rTrim(await readFile(`./files/${file}.output.js`));
    expect(result).toEqual(test);
  });

  it('transforms named-function correctly', async () => {
    const result = await transpile('./files/named-function.input.js', getTransformerPlugin());
    const test = rTrim(await readFile('./files/named-function.output.js'));
    expect(result).toEqual(test);
  });

  it('transforms named-function correctly', async () => {
    const result = await transpile('./files/sync-class.input.js', getTransformerPlugin());
    const test = rTrim(await readFile('./files/sync-class.output.js'));
    expect(result).toEqual(test);
  });

  it('transpiles file matching pattern', async () => {
    const result = await transpile(
      './files/wild-west.input.js', getTransformerPlugin({ pattern: '*.js' }));
    const test = rTrim(await readFile('./files/wild-west.output.js'));
    expect(result).toEqual(test);
  });

  it('skips file not matching pattern', async () => {
    const result = await transpile(
      './files/wild-west.input.js', getTransformerPlugin({ pattern: 'test.js' }));
    const test = rTrim(await readFile('./files/wild-west.skipped.output.js'));
    expect(result).toEqual(test);
  });

  it('transpiles file matching RegExp', async () => {
    const result = await transpile(
      './files/wild-west.input.js', getTransformerPlugin({ pattern: /\.js$/ }));
    const test = rTrim(await readFile('./files/wild-west.output.js'));
    expect(result).toEqual(test);
  });

  it('skips file not matching RegExp', async () => {
    const result = await transpile(
      './files/wild-west.input.js', getTransformerPlugin({ pattern: /\.ts$/ }));
    const test = rTrim(await readFile('./files/wild-west.skipped.output.js'));
    expect(result).toEqual(test);
  });
});
