import * as ts from 'typescript';
import { flatten } from 'array-flatten';
import minimatch from 'minimatch';

type Options = {
  generateMeta?: boolean;
  pattern?: string|RegExp;
};

export default function transform(options?: Options): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (sourceFile: ts.SourceFile) => {
      return new Transformer(context, options).transformSource(sourceFile);
    };
  };
}

type FunctionDefinition = {
  kind: 'function';
  name: string;
  default: boolean;
};
type ClassDefinition = {
  kind: 'class';
  name: string;
  default: boolean;
  members: string[];
};
type Definition = FunctionDefinition | ClassDefinition;

class Transformer {

  private definitions: Definition[] = [];

  constructor(
    private context: ts.TransformationContext,
    private options: Options = { generateMeta: true },
  ) {
  }

  transformSource(sourceFile: ts.SourceFile) {
    if (this.options.pattern) {
      if (typeof this.options.pattern === 'string' &&
        !minimatch(sourceFile.fileName, this.options.pattern, { matchBase: true })) {

        return sourceFile;
      }
      if (typeof this.options.pattern === 'object' &&
        'test' in this.options.pattern &&
        !this.options.pattern.test(sourceFile.fileName)) {

        return sourceFile;
      }
    }
    return ts.visitNode(sourceFile, this.visitor);
  }

  visitor = (node: ts.Node): ts.Node => {
    if (ts.isClassDeclaration(node)) {
      const modifiers = node.modifiers?.map(modifier => modifier.kind) ?? [];
      const exported = modifiers.indexOf(ts.SyntaxKind.ExportKeyword) !== -1;
      const isDefault = modifiers.indexOf(ts.SyntaxKind.DefaultKeyword) !== -1;

      if (isDefault && exported && !node.name?.text) {
        // TODO: emit proper warning
        console.warn('Default class has no name.');
      }

      if (node.name?.text &&
        exported &&
        modifiers.indexOf(ts.SyntaxKind.AbstractKeyword) === -1) {
        const definition: ClassDefinition = {
          kind: 'class',
          name: node.name?.text,
          default: isDefault,
          members: this.extractMembers(node.members),
        };
        this.definitions.push(definition);
      }
    }
    if (ts.isFunctionDeclaration(node)) {
      const modifiers = node.modifiers?.map(modifier => modifier.kind) ?? [];
      const exported = modifiers.indexOf(ts.SyntaxKind.ExportKeyword) !== -1;
      const isDefault = modifiers.indexOf(ts.SyntaxKind.DefaultKeyword) !== -1;

      if (isDefault && exported && !node.name?.text) {
        // TODO: emit proper warning
        console.warn('Default function has no name.');
      }
      if (exported && node.name?.text) {
        const definition: FunctionDefinition = {
          kind: 'function',
          name: node.name?.text,
          default: isDefault,
        };
        this.definitions.push(definition);
      }
    }
    if (ts.isSourceFile(node)) {
      const source = ts.visitEachChild(node, this.visitor, this.context);
      const flattenedStatements = flatten([
        ...this.generateImports(),
        ...this.definitions.map(definition => this.generateDefinitions(definition, this.options)),
      ]);

      return ts.updateSourceFileNode(
        source,
        ts.setTextRange(ts.createNodeArray(flattenedStatements), source.statements),
      );
    }

    return node;
  }

  private extractMembers(members: ts.NodeArray<ts.ClassElement>): string[] {
    return members
      .filter(member => ts.isMethodDeclaration(member))
      .filter((method) => {
        const modifiers = method.modifiers?.map(modifier => modifier.kind) ?? [];
        return modifiers.indexOf(ts.SyntaxKind.StaticKeyword) === -1 &&
          modifiers.indexOf(ts.SyntaxKind.AbstractKeyword) === -1 &&
          modifiers.indexOf(ts.SyntaxKind.PrivateKeyword) === -1;
      }).map((method) => {
        if (method.name && 'text' in method.name) {
          return method.name?.text ?? '';
        }
        return '';
      }).filter(name => name.length > 0);
  }

  /**
   * Generates imports:
   *   import { Client } from '@connected/client';
   */
  private generateImports() {
    return [
      ts.createImportDeclaration(
        undefined,
        undefined,
        ts.createImportClause(
          ts.createIdentifier('Client'),
          undefined,
        ),
        ts.createStringLiteral('@connected/client'),
      )];
  }

  generateDefinitions(definition: Definition, options: Options) {
    switch (definition.kind) {
      case 'function':
        return this.generateFunctionDefinition(definition, options);

      case 'class':
        return this.generateClassDefinition(definition, options);

      default:
        return [];
    }
  }

  /**
   * Generates function:
   *   export [default] function functionName(...args) {
   *     return Client.execute('functionName', args);
   *   }
   */
  private generateFunctionDefinition(definition: FunctionDefinition, options: Options) {
    const { module } = this.context.getCompilerOptions();

    const modifiers: ts.Modifier[] = [ts.createModifier(ts.SyntaxKind.ExportKeyword)];
    if (definition.default) {
      modifiers.push(ts.createModifier(ts.SyntaxKind.DefaultKeyword));
    }

    const definitions: ts.Statement[] = [
      ts.createFunctionDeclaration(
        undefined,
        modifiers,
        undefined,
        ts.createIdentifier(definition.name),
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
                module === ts.ModuleKind.CommonJS ?
                  ts.createPropertyAccess(
                    ts.createIdentifier('client_1'),
                    ts.createIdentifier('default'),
                  ) :
                  ts.createIdentifier('Client'),
                ts.createIdentifier('execute'),
              ),
              undefined,
              [
                ts.createStringLiteral(definition.name),
                ts.createIdentifier('args'),
              ],
            ),
          ),
          ],
          true,
        )),
    ];

    if (options.generateMeta !== false) {
      definitions.push(
        ts.createExpressionStatement(ts.createCall(
          ts.createPropertyAccess(
            ts.createIdentifier('Object'),
            ts.createIdentifier('defineProperty'),
          ),
          undefined,
          [
            ts.createIdentifier(definition.name),
            ts.createStringLiteral('meta'),
            ts.createObjectLiteral(
              [ts.createPropertyAssignment(
                ts.createIdentifier('value'),
                ts.createObjectLiteral(
                  [ts.createPropertyAssignment(
                    ts.createIdentifier('name'),
                    ts.createStringLiteral(definition.name),
                  )],
                  false,
                ),
              )],
              false,
            ),
          ],
        )));
    }

    return definitions;
  }

  generateClassDefinition(definition: ClassDefinition, options: Options) {
    const statements: ts.Statement[] = [];

    const modifiers: ts.Modifier[] = [ts.createModifier(ts.SyntaxKind.ExportKeyword)];
    if (definition.default) {
      modifiers.push(ts.createModifier(ts.SyntaxKind.DefaultKeyword));
    }

    // 1. generate class declaration
    statements.push(
      ts.createClassDeclaration(
        undefined,
        modifiers,
        ts.createIdentifier(definition.name),
        undefined,
        undefined,
        [
          this.generateClassConstructor(),
          ...definition.members.map(
            methodName => this.generateClassMethod(definition.name, methodName)),
        ],
      ));

    // 2. generate metadata
    if (options.generateMeta !== false) {
      for (let i = 0; i < definition.members.length; i += 1) {
        const methodName = definition.members[i];
        statements.push(
          ts.createExpressionStatement(ts.createCall(
            ts.createPropertyAccess(
              ts.createIdentifier('Object'),
              ts.createIdentifier('defineProperty'),
            ),
            undefined,
            [
              ts.createPropertyAccess(
                ts.createPropertyAccess(
                  ts.createIdentifier(definition.name),
                  ts.createIdentifier('prototype'),
                ),
                ts.createIdentifier(methodName),
              ),
              ts.createStringLiteral('meta'),
              ts.createObjectLiteral(
                [ts.createPropertyAssignment(
                  ts.createIdentifier('value'),
                  ts.createObjectLiteral(
                    [ts.createPropertyAssignment(
                      ts.createIdentifier('name'),
                      ts.createStringLiteral(`${definition.name}.${methodName}`),
                    )],
                    false,
                  ),
                )],
                false,
              ),
            ],
          )));
      }
    }

    return statements;
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
        [
          ts.createExpressionStatement(
            ts.createBinary(
              ts.createPropertyAccess(
                ts.createThis(),
                ts.createIdentifier('constructorParameters'),
              ),
              ts.createToken(ts.SyntaxKind.EqualsToken),
              ts.createIdentifier('args'),
            )),
        ],
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
    const { module } = this.context.getCompilerOptions();

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
            module === ts.ModuleKind.CommonJS ?
              ts.createPropertyAccess(
                ts.createIdentifier('client_1'),
                ts.createIdentifier('default'),
              ) :
              ts.createIdentifier('Client'),
            ts.createIdentifier('execute'),
          ),
          undefined,
          [
            ts.createStringLiteral(`${className}.${methodName}`),
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
}
