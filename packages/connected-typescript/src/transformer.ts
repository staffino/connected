import * as ts from 'typescript';
import { flatten } from 'array-flatten';
import minimatch from 'minimatch';

type Options = {
  generateMeta?: boolean;
  pattern?: string | RegExp;
};

type FunctionDefinition = {
  kind: 'function';
  name: string;
  default: boolean;
};
type Members = {
  name: string;
  group?: string;
};
type ClassDefinition = {
  kind: 'class';
  name: string;
  default: boolean;
  members: Members[];
};
type Definition = FunctionDefinition | ClassDefinition;

function extractMemberGroup(
  decorators: readonly ts.Decorator[] | undefined
): string | undefined {
  return (
    decorators &&
    decorators
      .map((decorator) => {
        if (
          ts.isCallExpression(decorator.expression) &&
          ts.isIdentifier(decorator.expression.expression) &&
          decorator.expression.expression.escapedText === 'group' &&
          'length' in decorator.expression.arguments &&
          decorator.expression.arguments.length >= 1 &&
          ts.isStringLiteral(decorator.expression.arguments[0])
        ) {
          return (decorator.expression.arguments[0] as ts.StringLiteral).text;
        }
        return undefined;
      })
      .find((group) => !!group)
  );
}

function extractMembers(members: ts.NodeArray<ts.ClassElement>): Members[] {
  return members
    .filter(ts.isMethodDeclaration)
    .filter((method) => {
      const modifiers =
        method.modifiers?.map((modifier) => modifier.kind) ?? [];
      return (
        modifiers.indexOf(ts.SyntaxKind.StaticKeyword) === -1 &&
        modifiers.indexOf(ts.SyntaxKind.AbstractKeyword) === -1 &&
        modifiers.indexOf(ts.SyntaxKind.PrivateKeyword) === -1
      );
    })
    .map((method) => {
      // method.decorators.
      if (method.name && 'text' in method.name) {
        return {
          name: method.name?.text ?? '',
          group: extractMemberGroup(ts.getDecorators(method)),
        };
      }
      return { name: '' };
    })
    .filter(({ name }) => name.length > 0);
}

class Transformer {
  private definitions: Definition[] = [];

  readonly f: ts.NodeFactory;

  constructor(
    private readonly context: ts.TransformationContext,
    // eslint-disable-next-line no-unused-vars
    private readonly options: Options = { generateMeta: true }
  ) {
    this.f = context.factory;
  }

  transformSource(sourceFile: ts.SourceFile): ts.SourceFile {
    if (this.options.pattern) {
      if (
        typeof this.options.pattern === 'string' &&
        !minimatch(sourceFile.fileName, this.options.pattern, {
          matchBase: true,
        })
      ) {
        return sourceFile;
      }
      if (
        typeof this.options.pattern === 'object' &&
        'test' in this.options.pattern &&
        !this.options.pattern.test(sourceFile.fileName)
      ) {
        return sourceFile;
      }
    }
    return ts.visitNode(sourceFile, this.visitor) as ts.SourceFile;
  }

  visitor = (node: ts.Node): ts.Node => {
    if (ts.isClassDeclaration(node)) {
      const modifiers = node.modifiers?.map((modifier) => modifier.kind) ?? [];
      const exported = modifiers.indexOf(ts.SyntaxKind.ExportKeyword) !== -1;
      const isDefault = modifiers.indexOf(ts.SyntaxKind.DefaultKeyword) !== -1;

      if (isDefault && exported && !node.name?.text) {
        // TODO: emit proper warning
        console.warn('Default class has no name.');
      }

      if (
        node.name?.text &&
        exported &&
        modifiers.indexOf(ts.SyntaxKind.AbstractKeyword) === -1
      ) {
        const definition: ClassDefinition = {
          kind: 'class',
          name: node.name?.text,
          default: isDefault,
          members: extractMembers(node.members),
        };
        this.definitions.push(definition);
      }
    }
    if (ts.isFunctionDeclaration(node)) {
      const modifiers = node.modifiers?.map((modifier) => modifier.kind) ?? [];
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
        ...this.definitions.map((definition) =>
          this.generateDefinitions(definition, this.options)
        ),
      ]);

      return this.f.updateSourceFile(
        source,
        ts.setTextRange(
          this.f.createNodeArray(flattenedStatements),
          source.statements
        )
      );
    }

    return node;
  };

  /**
   * Generates imports:
   *   import { Client } from '@connected/client';
   */
  private generateImports() {
    return [
      this.f.createImportDeclaration(
        undefined,
        this.f.createImportClause(
          false,
          this.f.createIdentifier('Client'),
          undefined
        ),
        this.f.createStringLiteral('@connected/client')
      ),
    ];
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
  private generateFunctionDefinition(
    definition: FunctionDefinition,
    options: Options
  ) {
    const { module } = this.context.getCompilerOptions();

    const modifiers: ts.Modifier[] = [
      this.f.createModifier(ts.SyntaxKind.ExportKeyword),
    ];
    if (definition.default) {
      modifiers.push(this.f.createModifier(ts.SyntaxKind.DefaultKeyword));
    }

    const definitions: ts.Statement[] = [
      this.f.createFunctionDeclaration(
        modifiers,
        undefined,
        this.f.createIdentifier(definition.name),
        undefined,
        [
          this.f.createParameterDeclaration(
            undefined,
            this.f.createToken(ts.SyntaxKind.DotDotDotToken),
            this.f.createIdentifier('args'),
            undefined,
            undefined,
          ),
        ],
        undefined,
        // function body
        this.f.createBlock(
          [
            this.f.createReturnStatement(
              this.f.createCallExpression(
                this.f.createPropertyAccessExpression(
                  module === ts.ModuleKind.CommonJS
                    ? this.f.createPropertyAccessExpression(
                      this.f.createIdentifier('client_1'),
                      this.f.createIdentifier('default')
                    )
                    : this.f.createIdentifier('Client'),
                  this.f.createIdentifier('execute')
                ),
                undefined,
                [
                  this.f.createStringLiteral(definition.name),
                  this.f.createIdentifier('args'),
                ]
              )
            ),
          ],
          true
        )
      ),
    ];

    if (options.generateMeta !== false) {
      definitions.push(
        this.f.createExpressionStatement(
          this.f.createCallExpression(
            this.f.createPropertyAccessExpression(
              this.f.createIdentifier('Object'),
              this.f.createIdentifier('defineProperty')
            ),
            undefined,
            [
              this.f.createIdentifier(definition.name),
              this.f.createStringLiteral('meta'),
              this.f.createObjectLiteralExpression(
                [
                  this.f.createPropertyAssignment(
                    this.f.createIdentifier('value'),
                    this.f.createObjectLiteralExpression(
                      [
                        this.f.createPropertyAssignment(
                          this.f.createIdentifier('name'),
                          this.f.createStringLiteral(definition.name)
                        ),
                      ],
                      false
                    )
                  ),
                ],
                false
              ),
            ]
          )
        )
      );
    }

    return definitions;
  }

  generateClassDefinition(definition: ClassDefinition, options: Options) {
    const statements: ts.Statement[] = [];

    const modifiers: ts.Modifier[] = [
      this.f.createModifier(ts.SyntaxKind.ExportKeyword),
    ];
    if (definition.default) {
      modifiers.push(this.f.createModifier(ts.SyntaxKind.DefaultKeyword));
    }

    // 1. generate class declaration
    statements.push(
      this.f.createClassDeclaration(
        modifiers,
        this.f.createIdentifier(definition.name),
        undefined,
        undefined,
        [
          this.generateClassConstructor(),
          ...definition.members.map(({ name, group }) =>
            this.generateClassMethod(definition.name, name, group)
          ),
        ]
      )
    );

    // 2. generate metadata
    if (options.generateMeta !== false) {
      for (let i = 0; i < definition.members.length; i += 1) {
        const member = definition.members[i];
        statements.push(
          this.f.createExpressionStatement(
            this.f.createCallExpression(
              this.f.createPropertyAccessExpression(
                this.f.createIdentifier('Object'),
                this.f.createIdentifier('defineProperty')
              ),
              undefined,
              [
                this.f.createPropertyAccessExpression(
                  this.f.createPropertyAccessExpression(
                    this.f.createIdentifier(definition.name),
                    this.f.createIdentifier('prototype')
                  ),
                  this.f.createIdentifier(member.name)
                ),
                this.f.createStringLiteral('meta'),
                this.f.createObjectLiteralExpression(
                  [
                    this.f.createPropertyAssignment(
                      this.f.createIdentifier('value'),
                      this.f.createObjectLiteralExpression(
                        [
                          this.f.createPropertyAssignment(
                            this.f.createIdentifier('name'),
                            this.f.createStringLiteral(
                              `${definition.name}.${member.name}`
                            )
                          ),
                          ...(member.group
                            ? [
                              this.f.createPropertyAssignment(
                                this.f.createIdentifier('group'),
                                this.f.createStringLiteral(member.group)
                              ),
                            ]
                            : []),
                        ],
                        false
                      )
                    ),
                  ],
                  false
                ),
              ]
            )
          )
        );
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
    return this.f.createConstructorDeclaration(
      undefined,
      [
        this.f.createParameterDeclaration(
          [
            this.f.createModifier(ts.SyntaxKind.PrivateKeyword),
            this.f.createModifier(ts.SyntaxKind.ReadonlyKeyword)
          ],
          this.f.createToken(ts.SyntaxKind.DotDotDotToken),
          this.f.createIdentifier('constructorParameters'),
          undefined,
          this.f.createArrayTypeNode(this.f.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)),
          undefined
        ),
      ],
      this.f.createBlock([], true)
    );
  }

  /**
   * Generates class method:
   *   methodName(...args) {
   *     return Client.execute('ClassName.methodName', args, this?.constructorParameters);
   *   }
   */
  private generateClassMethod(
    className: string,
    methodName: string,
    group?: string
  ) {
    const { module } = this.context.getCompilerOptions();

    return this.f.createMethodDeclaration(
      undefined,
      undefined,
      this.f.createIdentifier(methodName),
      undefined,
      undefined,
      [
        this.f.createParameterDeclaration(
          undefined,
          this.f.createToken(ts.SyntaxKind.DotDotDotToken),
          this.f.createIdentifier('args'),
          undefined,
          undefined,
          undefined
        ),
      ],
      undefined,
      this.f.createBlock(
        [
          this.f.createReturnStatement(
            this.f.createCallExpression(
              this.f.createPropertyAccessExpression(
                module === ts.ModuleKind.CommonJS
                  ? this.f.createPropertyAccessExpression(
                    this.f.createIdentifier('client_1'),
                    this.f.createIdentifier('default')
                  )
                  : this.f.createIdentifier('Client'),
                this.f.createIdentifier('execute')
              ),
              undefined,
              [
                this.f.createStringLiteral(`${className}.${methodName}`),
                this.f.createIdentifier('args'),
                this.f.createPropertyAccessChain(
                  this.f.createThis(),
                  this.f.createToken(ts.SyntaxKind.QuestionDotToken),
                  this.f.createIdentifier('constructorParameters')
                ),
                group
                  ? this.f.createStringLiteral(group)
                  : (undefined as unknown as ts.Expression),
              ].filter(Boolean)
            )
          ),
        ],
        true
      )
    );
  }
}

export default function transform(
  options?: Options
): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> =>
    (sourceFile: ts.SourceFile) =>
      new Transformer(context, options).transformSource(sourceFile);
}
