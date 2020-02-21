import * as ts from 'typescript';
import { CJS_CONFIG } from './options';

export default async function compile(
  file: string,
  transformer: ts.TransformerFactory<ts.SourceFile> | ts.CustomTransformerFactory,
): Promise<string> {

  // const host: ts.ParseConfigFileHost = ts.sys as any;
  // // Fix after https://github.com/Microsoft/TypeScript/issues/18217
  // host.onUnRecoverableConfigFileDiagnostic = printDiagnostic;
  // const parsedCmd = ts.getParsedCommandLineOfConfigFile('./tsconfig.json', undefined, host);
  // host.onUnRecoverableConfigFileDiagnostic = undefined;

  const program = ts.createProgram({
    rootNames: [file],
    options: CJS_CONFIG,
  });

  let output = undefined;

  const emitResult = program.emit(
    undefined,
    (fileName, content) => {
      // ts.sys.writeFile(fileName, `/* @generated */${ts.sys.newLine}${content}`);
      output = content;
    },
    undefined,
    undefined,
    {
      before: [transformer],
      after: [],
      afterDeclarations: [],
    },
  );

  ts.getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics)
    .forEach((diagnostic) => {
      let msg = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      if (diagnostic.file) {
        const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        msg = `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${msg}`;
      }
      console.error(msg);
    });

  const exitCode = emitResult.emitSkipped ? 1 : 0;
  if (exitCode) {
    throw new Error(`Failed to compile wit exit code ${exitCode}.`);
  }
  // const input = readFile(file);

  return output;
}
