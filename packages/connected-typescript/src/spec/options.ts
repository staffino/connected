import * as ts from 'typescript';

export const CJS_CONFIG: ts.CompilerOptions = {
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  baseUrl: '.',
  target: ts.ScriptTarget.Latest,
  // experimentalDecorators: true,
  // jsx: ts.JsxEmit.React,
  // noEmitOnError: false,
  // noUnusedLocals: true,
  // noUnusedParameters: true,
  // stripInternal: true,
  // declaration: true,
};
