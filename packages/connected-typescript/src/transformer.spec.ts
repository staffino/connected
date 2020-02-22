import readFile from '../spec/read-file';
import transpile from '../spec/transpile';
import transformer from './transformer';

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

    'imports',
    'statements',

    'wild-west',
  ])('transforms %s correctly', async (file) => {
    const result = await transpile(`./files/${file}.input.ts`, transformer());
    const test = await readFile(`./files/${file}.output.js`);
    expect(result).toEqual(test);
  });

});
