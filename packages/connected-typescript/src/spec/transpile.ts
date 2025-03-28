import * as ts from 'typescript';
import { CJS_CONFIG } from './options.js';
import readFile from './read-file.js';

export default async function transpile(
  file: string,
  transformer:
    | ts.TransformerFactory<ts.SourceFile>
    | ts.CustomTransformerFactory
): Promise<string> {
  const source = await readFile(file);
  const output = ts.transpileModule(source, {
    compilerOptions: CJS_CONFIG,
    transformers: {
      before: [transformer],
    },
  });

  return output.outputText;
}
