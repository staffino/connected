import compile from '../spec/compiler';
import readFile from '../spec/read-file';
import { default as transformer } from './transformer';

describe('ServerASTTransformer', () => {

  it('transforms sync named function', async () => {
    const output = await compile('./files/sync-named-function.input.ts', transformer({ type: 'function' }));
    const expected = await readFile('./files/sync-named-function.output.js');
    expect(output).toBe(expected);
  });

  it('transforms sync class', async () => {
    const output = await compile('./files/sync-class.input.ts', transformer({ type: 'class' }));
    const expected = await readFile('./files/sync-class.output.js');
    expect(output).toBe(expected);
  });

});
