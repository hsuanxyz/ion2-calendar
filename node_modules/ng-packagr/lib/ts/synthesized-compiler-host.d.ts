import * as ts from 'typescript';
/**
 * Creates a TypeScript {@link CompilerHost} that reads source files from a collection. Should
 * a source file include synthesized source text replacements, i.e., the source file is a
 * {@link SynthesizedSourceFile}, it will apply source text replacements.
 *
 * @param sourceFiles A collection of TypeScript source files
 * @param compilerOptions Compiler options
 */
export declare function createCompilerHostForSynthesizedSourceFiles(sourceFiles: ts.SourceFile[], compilerOptions: ts.CompilerOptions): ts.CompilerHost;
