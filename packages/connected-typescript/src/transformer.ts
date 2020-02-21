import * as ts from 'typescript';

export default function transform(options: any): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (sourceFile: ts.SourceFile) => {
      return new Transformer().transformNode(context, sourceFile, options);
    };
  };
}

class Transformer {

  private clientImportAdded: boolean;
  private functions: string[];
  private classes: string[];
  private errorLog: ts.SourceFile;
  private printer: ts.Printer;

  constructor() {
    this.clientImportAdded = false;
    this.functions = [];
    this.classes = [];

    this.errorLog = ts.createSourceFile(
      './files/error-log.ts',
      '',
      ts.ScriptTarget.Latest,
      false,
      ts.ScriptKind.TS,
    );

    this.printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  }

  transformNode(
    context: ts.TransformationContext,
    sourceFile: ts.SourceFile,
    options: any,
  ) {
    let visitor;
    if (options && options.type) {
      switch (options.type) {
        case 'function': { visitor = this.transformFunctionsVisitor(context); break; }
        case 'class': { visitor = this.transformClassesVisitor(context); break; }
        default: { console.log('Not supported type of transformation.'); break; }
      }
    }
    return ts.visitNode(sourceFile, visitor);
  }

  /**
   * Transform rules:
   *
   * - import { Client } from ‘@connected/client’; is added as the only import
   * - only exported classes are transpiled, other functions, classes and all other code is removed
   * - classes without name are not transpiled, a warning is displayed
   * - class methods that are explicitly marked as private are not transpiled and are removed
   *
   * Output will look as follows:
   *
   * import { Client } from '@connected/client';
   * export [default] class Provider(...args) {
   *   constructor(...args) {
   *     this.constructorParameters = args;
   *   }
   *   xyz(...args) {
   *     return Client.execute('Provider.xyz', args, this?.constructorParameters);
   *   }
   * }
   *
   * @param context   transformation context
   */
  private transformClassesVisitor(context: ts.TransformationContext): ts.Visitor {

    const visitor: ts.Visitor = (node: ts.Node): ts.Node => {

      // imports
      if (ts.isImportDeclaration(node)) {
        if (this.clientImportAdded) {
          return ts.createNotEmittedStatement(node);
        }
        // import { Client } from '@connected/client';
        this.clientImportAdded = true;
        return this.generateImport();
      }

      // classes
      if (ts.isClassDeclaration(node)) {
        const className = node && node.name && node.name.text;
        if (!className) {
          const warning = this.printer.printNode(ts.EmitHint.Unspecified, node, this.errorLog);
          console.warn(
            `The following classes without a name has not been transpiled: \n \n ${ warning }`,
          );
        } else {
          this.classes.push(className);

          const modifiers = [];
          if (node.modifiers) {
            const kinds: ts.SyntaxKind[] = node.modifiers.map(modifier => modifier.kind);

            // do not transpile any not exported class
            if (kinds.indexOf(ts.SyntaxKind.ExportKeyword) === -1) {
              return ts.createNotEmittedStatement(node);
            }

            modifiers.push(ts.createModifier(ts.SyntaxKind.ExportKeyword));
            if (kinds.indexOf(ts.SyntaxKind.DefaultKeyword) !== -1) {
              modifiers.push(ts.createModifier(ts.SyntaxKind.DefaultKeyword));
            }

            // class methods
            const transpiledMethods: ts.MethodDeclaration[] = [];
            const methods = (node as ts.ClassDeclaration).members.filter(
              member => ts.isMethodDeclaration(member),
            );
            for (const method of methods) {
              const methodName = method.name && method.name.text;
              const modifiers = method.modifiers && method.modifiers.map(modifier => modifier.kind);
              // do not transpile any private class method
              if (!method.modifiers ||
                modifiers && modifiers.indexOf(ts.SyntaxKind.PrivateKeyword) === -1) {
                transpiledMethods.push(this.generateClassMethod(className, methodName));
              }
            }

            return ts.createClassDeclaration(
              undefined,
              modifiers,
              ts.createIdentifier(className),
              undefined,
              undefined,
              [
                this.generateClassConstructor(),
                ...transpiledMethods,
              ],
            );
          }
        }
      }

      // any other statement, all of them are supposed to be omitted
      if (!ts.isSourceFile(node)) {
        return ts.createNotEmittedStatement(node);
      }

      return ts.visitEachChild(node, visitor, context);
    };

    return visitor;
  }

  /**
   * Transform rules:
   *
   * - import { Client } from ‘@connected/client’; is added as the only import
   * - only exported functions are transpiled, other functions and all other code is removed
   * - functions without a name are not transpiled, a warning is displayed
   * - async is removed from the function signature (if present)
   *
   * Output will look as follows:
   *
   * import { Client } from '@connected/client';
   * export [default] function xyz(...args) {
   *   return Client.execute('xyz', args);
   * }
   *
   * @param context   transformation context
   */
  private transformFunctionsVisitor(context: ts.TransformationContext): ts.Visitor {

    const visitor: ts.Visitor = (node: ts.Node): ts.Node => {

      // imports
      if (ts.isImportDeclaration(node)) {
        if (this.clientImportAdded) {
          return ts.createNotEmittedStatement(node);
        }
        // import { Client } from '@connected/client';
        this.clientImportAdded = true;
        return this.generateImport();
      }

      // functions
      if (ts.isFunctionDeclaration(node)) {
        const name = node && node.name && node.name.text;
        if (!name) {
          const warning = this.printer.printNode(ts.EmitHint.Unspecified, node, this.errorLog);
          console.warn(
            `The following functions without a name has not been transpiled: \n \n ${ warning }`,
          );
        } else {
          this.functions.push(name);

          if (node.modifiers) {
            const kinds: ts.SyntaxKind[] = node.modifiers.map(modifier => modifier.kind);
            // do not transpile any not exported function
            if (kinds.indexOf(ts.SyntaxKind.ExportKeyword) === -1) {
              return ts.createNotEmittedStatement(node);
            }
            return this.generateFunction(name, kinds);
          }
        }
      }

      // any other statement, all of them are supposed to be omitted
      if (!ts.isSourceFile(node)) {
        return ts.createNotEmittedStatement(node);
      }

      return ts.visitEachChild(node, visitor, context);
    };

    return visitor;
  }

  /**
   * Generates import:
   *   import { Client } from '@connected/client';
   */
  private generateImport() {
    return ts.createImportDeclaration(
      undefined,
      undefined,
      ts.createImportClause(
        undefined,
        ts.createNamedImports(
          [ts.createImportSpecifier(
            undefined,
            ts.createIdentifier('Client'),
          )],
        ),
      ),
      ts.createStringLiteral('@connected/client'),
    );
  }

  /**
   * Generates class constructor:
   *   constructor(...args) {
   *     this.constructorParameters = args;
   *   }
   */
  private generateClassConstructor() {
    return ts.createConstructor(
      undefined,
      undefined,
      [ts.createParameter(
        undefined,
        undefined,
        ts.createToken(ts.SyntaxKind.DotDotDotToken),
        ts.createIdentifier('args'),
        undefined,
        undefined,
        undefined,
      )],
      ts.createBlock(
        [ts.createExpressionStatement(
          ts.createBinary(
            ts.createPropertyAccess(
              ts.createThis(),
              ts.createIdentifier('constructorParameters'),
            ),
            ts.createToken(ts.SyntaxKind.EqualsToken),
            ts.createIdentifier('args'),
          ),
        )],
        true,
      ),
    );
  }

  /**
   * Generates class method:
   *   methodName(...args) {
   *     return Client.execute('ClassName.methodName', args, this?.constructorParameters);
   *   }
   */
  private generateClassMethod(className: string, methodName: string) {
    return ts.createMethod(
      undefined,
      undefined,
      undefined,
      ts.createIdentifier(methodName),
      undefined,
      undefined,
      [ts.createParameter(
        undefined,
        undefined,
        ts.createToken(ts.SyntaxKind.DotDotDotToken),
        ts.createIdentifier('args'),
        undefined,
        undefined,
        undefined,
      )],
      undefined,
      ts.createBlock(
        [ts.createReturn(ts.createCall(
          ts.createPropertyAccess(
            ts.createIdentifier('Client'),
            ts.createIdentifier('execute'),
          ),
          undefined,
          [
            ts.createStringLiteral(`${className}${methodName}`),
            ts.createIdentifier('args'),
            ts.createPropertyAccessChain(
              ts.createThis(),
              ts.createToken(ts.SyntaxKind.QuestionDotToken),
              ts.createIdentifier('constructorParameters'),
            ),
          ],
        ))],
        true,
      ),
    );
  }

  /**
   * Generates function:
   *   export [default] function functionName(...args) {
   *     return Client.execute('functionName', args);
   *   }
   */
  private generateFunction(name: string, mods: ts.SyntaxKind[]) {

    const modifiers = [];
    modifiers.push(ts.createModifier(ts.SyntaxKind.ExportKeyword));
    if (mods.indexOf(ts.SyntaxKind.DefaultKeyword) !== -1) {
      modifiers.push(ts.createModifier(ts.SyntaxKind.DefaultKeyword));
    }

    return ts.createFunctionDeclaration(
      undefined,
      modifiers,
      undefined,
      ts.createIdentifier(name),
      undefined,
      [ts.createParameter(
        undefined,
        undefined,
        ts.createToken(ts.SyntaxKind.DotDotDotToken),
        ts.createIdentifier('args'),
        undefined,
        undefined,
        undefined,
      )],
      undefined,
      // function body
      ts.createBlock(
        [ts.createReturn(
          ts.createCall(
            ts.createPropertyAccess(
              ts.createIdentifier('Client'),
              ts.createIdentifier('execute'),
            ),
            undefined,
            [
              ts.createStringLiteral(name),
              ts.createIdentifier('args'),
            ],
          ),
        ),
        ],
        true,
      ),
    );
  }
}
