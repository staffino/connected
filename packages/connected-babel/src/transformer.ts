import babel from '@babel/core';
import t from '@babel/types';
import { Visitor, NodePath } from '@babel/traverse';
import { flatten } from 'array-flatten';
import minimatch from 'minimatch';

type Babel = {
  types: typeof t;
};

export type Options = {
  autoBind?: boolean;
  generateMeta?: boolean;
  pattern?: string | RegExp;
};

export type TransformerPlugin = {
  transformer: Function,
  options: Options | undefined,
};

type ClassesFunctionsMeta =
  t.ExportDefaultDeclaration | t.ExportNamedDeclaration | t.ExpressionStatement;

export function getTransformerPlugin(options?: Options): TransformerPlugin {
  return {
    transformer: transform,
    options: {
      ...options,
      autoBind: options?.autoBind !== false,
      generateMeta: options?.generateMeta !== false,
    },
  };
}

export default function transform(babel: Babel, options: Options): { visitor: Visitor<Options> } {

  const transformer = new Transformer(babel, options);

  return {

    visitor: {
      // tslint:disable-next-line:function-name
      ClassDeclaration(path: NodePath): void {
        const parent = path.parentPath;

        const isExported: boolean = parent.isExportNamedDeclaration() ||
          parent.isExportDefaultDeclaration();
        const isDefault: boolean = parent.isExportDefaultDeclaration();
        const isAbstract: boolean = path.is('abstract');

        const name: string | null = 'id' in path.node ? path.node.id.name : null;

        if (isDefault && isExported && !name) {
          // TODO: emit proper warning
          console.warn('Default class has no name.');
        }

        if (name && isExported && !isAbstract) {
          const members: babel.Node[] = 'body' in path.node ? path.node.body?.body : null;
          const definition: ClassDefinition = {
            name,
            kind: 'class',
            default: isDefault,
            members: transformer.extractClassMembers(members),
          };
          transformer.addDefinition(definition);
        }
      },

      // tslint:disable-next-line:function-name
      FunctionDeclaration(path: NodePath): void {
        const parent = path.parentPath;

        const isExported: boolean = parent.isExportNamedDeclaration() ||
          parent.isExportDefaultDeclaration();
        const isDefault: boolean = parent.isExportDefaultDeclaration();

        const name: string | null = 'id' in path.node ? path.node.id.name : null;

        if (isDefault && isExported && !name) {
          // TODO: emit proper warning
          console.warn('Default function has no name.');
        }

        if (name && isExported) {
          const definition: FunctionDefinition = {
            name,
            kind: 'function',
            default: isDefault,
          };
          transformer.addDefinition(definition);
        }
      },

      Program: {
        enter(path: NodePath, state: any) {
          if (!transformer.canBeTransformed(state.filename)) {
            path.skip();
          }
        },

        exit(path: NodePath) {
          const flattenedStatements = flatten([
            ...transformer.generateImports(transformer.getOptions(), transformer.getDefinitions()),
            ...transformer.getDefinitions().map((definition: any) => {
              return transformer.generateDefinitions(definition, transformer.getOptions());
            }),
          ]);

          if ('body' in path.node) {
            path.node.body = flattenedStatements;
          }
        },
      },
    },
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

  private t: typeof t;
  private definitions: Definition[];

  constructor(private readonly babel: Babel, private readonly options: Options) {
    this.t = babel.types;
    this.definitions = [];
  }

  getOptions(): Options {
    return this.options;
  }

  getDefinitions(): Definition[] {
    return this.definitions;
  }

  addDefinition(def: Definition): void {
    this.definitions.push(def);
  }

  canBeTransformed(fileName: string): boolean {
    if (this.options.pattern) {
      if (typeof this.options.pattern === 'string' &&
        !minimatch(fileName, this.options.pattern, { matchBase: true })) {

        return false;
      }
      if (typeof this.options.pattern === 'object' &&
        'test' in this.options.pattern && !this.options.pattern.test(fileName)) {

        return false;
      }
    }
    return true;
  }

  /**
   * Extracts class methods, which are:
   *   - not static
   *   - not abstract
   *   - not private
   *   - named
   */
  extractClassMembers(members: babel.Node[]): string[] {
    return members
      .filter((member: babel.Node) => member.type === 'ClassMethod' && member.kind === 'method')
      .filter((method: babel.Node) => !('static' in method && method.static) &&
        !('abstract' in method && method.abstract) &&
        !('accessibility' in method && method.accessibility === 'private'),
      ).map(
        function (method: babel.Node) {
          const name = 'key' in method && this.t.isIdentifier(method.key) && method.key?.name;
          return name ?? '';
        },
        this,
      ).filter(name => name.length > 0);
  }

  /**
   * Generates imports:
   *   import Client from '@connected/client';
   *   import autoBind from '@connected/auto-bind';
   */
  generateImports(options: Options, definitions: Definition[]): t.ImportDeclaration[] {
    const imports: t.ImportDeclaration[] = [
      this.t.importDeclaration(
        [this.t.importDefaultSpecifier(this.t.identifier('Client'))],
        this.t.stringLiteral('@connected/client'),
      ),
    ];

    if (
      options.autoBind !== false &&
      definitions.find(definition => definition.kind === 'class')
    ) {
      imports.push(
        this.t.importDeclaration(
          [this.t.importDefaultSpecifier(this.t.identifier('autoBind'))],
          this.t.stringLiteral('@connected/auto-bind'),
        ),
      );
    }

    return imports;
  }

  /**
   * Generates function and class definitions.
   */
  generateDefinitions(definition: Definition, options: Options): ClassesFunctionsMeta[] {
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
   *
   * together with its metadata:
   *   Object.defineProperty(functionName, 'meta', { value: { name: 'functionName' } });
   */
  private generateFunctionDefinition(
    definition: FunctionDefinition, options: Options): ClassesFunctionsMeta[] {

    const definitions = [];

    // const { module } = this.context.getCompilerOptions();

    // 1. generate function declaration
    const functionDeclaration: t.FunctionDeclaration =
      this.t.functionDeclaration(
        // function name and arguments
        this.t.identifier(definition.name),
        [this.t.restElement(this.t.identifier('args'))],
        // function body
        this.t.blockStatement([
          this.t.returnStatement(
            this.t.callExpression(
              this.t.memberExpression(
                this.t.identifier('Client'),
                this.t.identifier('execute'),
                false,
              ),
              [
                this.t.stringLiteral(definition.name),
                this.t.identifier('args'),
              ],
            ),
          ),
        ]),
        false,
      );

    definitions.push(
      definition.default ?
        this.t.exportDefaultDeclaration(functionDeclaration) : // exported default named
        this.t.exportNamedDeclaration(functionDeclaration),    // exported named
    );

    // 2. generate function metadata
    if (options.generateMeta !== false) {
      definitions.push(
        this.t.expressionStatement(
          this.t.callExpression(
            this.t.memberExpression(
              this.t.identifier('Object'),
              this.t.identifier('defineProperty'),
              false,
            ),
            [
              this.t.identifier(definition.name),
              this.t.stringLiteral('meta'),
              this.t.objectExpression([
                this.t.objectProperty(
                  this.t.identifier('value'),
                  this.t.objectExpression(
                    [
                      this.t.objectProperty(
                        this.t.identifier('name'),
                        this.t.stringLiteral(definition.name),
                        false,
                        false,
                      ),
                    ],
                  ),
                  false,
                  false,
                ),
              ]),
            ],
          ),
        ),
      );
    }

    return definitions;
  }

  /**
   * Generates class:
   *   export [default] class ClassName {
   *     constructor(...args) {
   *       this.constructorParameters = args;
   *       autoBind(this);
   *     }
   *     methodName(...args) {
   *       return Client.execute('ClassName.methodName', args, this?.constructorParameters);
   *     }
   *   }
   *
   * together with its methods' metadata:
   *   Object.defineProperty(
   *     ClassName.prototype.methodName, "meta", { value: { name: "ClassName.methodName" } }
   *   );
   */
  private generateClassDefinition(
    definition: ClassDefinition, options: Options): ClassesFunctionsMeta[] {

    const statements: ClassesFunctionsMeta[] = [];

    // 1. generate class declaration
    const classDeclaration: t.ClassDeclaration =
      this.t.classDeclaration(
        this.t.identifier(definition.name),
        null,
        this.t.classBody([
          this.generateClassConstructor(options),
          ...definition.members.map(methodName =>
            this.generateClassMethod(definition.name, methodName)),
        ]),
        null,
      );

    statements.push(
      definition.default ?
        this.t.exportDefaultDeclaration(classDeclaration) : // exported default named
        this.t.exportNamedDeclaration(classDeclaration),    // exported named
    );

    // 2. generate methods' metadata
    if (options.generateMeta !== false) {
      for (const methodName of definition.members) {
        statements.push(
          this.t.expressionStatement(
            this.t.callExpression(
              this.t.memberExpression(
                this.t.identifier('Object'),
                this.t.identifier('defineProperty'),
                false,
              ),
              [
                this.t.memberExpression(
                  this.t.memberExpression(
                    this.t.identifier(definition.name),
                    this.t.identifier('prototype'),
                    false,
                  ),
                  this.t.identifier(methodName),
                  false,
                ),
                this.t.stringLiteral('meta'),
                this.t.objectExpression([
                  this.t.objectProperty(
                    this.t.identifier('value'),
                    this.t.objectExpression([
                      this.t.objectProperty(
                        this.t.identifier('name'),
                        this.t.stringLiteral(`${definition.name}.${methodName}`),
                        false,
                        false,
                      ),
                    ]),
                    false,
                    false,
                 ),
                ]),
              ],
            ),
          ),
        );
      }
    }

    return statements;
  }

  /**
   * Generates class constructor:
   *   constructor(...args) {
   *     this.constructorParameters = args;
   *     autoBind(this);
   *   }
   */
  private generateClassConstructor(options: Options): t.ClassMethod {
    return this.t.classMethod(
      'constructor',
      this.t.identifier('constructor'),
      [this.t.restElement(this.t.identifier('args'))],
      this.t.blockStatement([
        this.t.expressionStatement(
          this.t.assignmentExpression(
            '=',
            this.t.memberExpression(
              this.t.thisExpression(),
              this.t.identifier('constructorParameters'),
              false,
            ),
            this.t.identifier('args'),
          ),
        ),
        ...(
          options.autoBind === false ?
            [] :
            [
              this.t.expressionStatement(
                this.t.callExpression(this.t.identifier('autoBind'), [this.t.thisExpression()]),
              ),
            ]
        ),
      ]),
    );
  }

  /**
   * Generates class method:
   *   methodName(...args) {
   *     return Client.execute(
   *       'ClassName.methodName', args, this ? this.constructorParameters : null);
   *   }
   */
  private generateClassMethod(className: string, methodName: string): t.ClassMethod {
    return this.t.classMethod(
      'method',
      this.t.identifier(methodName),
      [this.t.restElement(this.t.identifier('args'))],
      this.t.blockStatement([
        this.t.returnStatement(
          this.t.callExpression(
            this.t.memberExpression(
              this.t.identifier('Client'), this.t.identifier('execute'), false,
            ),
            [
              this.t.stringLiteral(`${className}.${methodName}`),
              this.t.identifier('args'),
              this.t.conditionalExpression(
                this.t.thisExpression(),
                this.t.memberExpression(
                  this.t.thisExpression(), this.t.identifier('constructorParameters'), false,
                ),
                this.t.nullLiteral(),
              ),
            ],
          ),
        ),
      ]),
    );
  }
}
