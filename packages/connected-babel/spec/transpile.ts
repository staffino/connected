import * as babel from '@babel/core';
import readFile from './read-file';
import { TransformerPlugin } from '../src';

export default async function transpile(
  fileName: string,
  transformer: TransformerPlugin,
): Promise<string> {
  const sourceFile = await readFile(fileName);
  const options = {
    ast: true,
    filename: fileName,
    plugins: [
      [transformer.transformer, transformer.options],
    ],
  };
  const output = babel.transform(sourceFile, options);
  return output?.code;
}
