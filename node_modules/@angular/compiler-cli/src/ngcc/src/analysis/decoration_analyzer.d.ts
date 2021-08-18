/// <amd-module name="@angular/compiler-cli/src/ngcc/src/analysis/decoration_analyzer" />
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ConstantPool } from '@angular/compiler';
import * as ts from 'typescript';
import { ReferencesRegistry, ResourceLoader, SelectorScopeRegistry } from '../../../ngtsc/annotations';
import { CompileResult, DecoratorHandler } from '../../../ngtsc/transform';
import { DecoratedClass } from '../host/decorated_class';
import { NgccReflectionHost } from '../host/ngcc_host';
export interface AnalyzedFile {
    sourceFile: ts.SourceFile;
    analyzedClasses: AnalyzedClass[];
}
export interface AnalyzedClass extends DecoratedClass {
    diagnostics?: ts.Diagnostic[];
    handler: DecoratorHandler<any, any>;
    analysis: any;
}
export interface CompiledClass extends AnalyzedClass {
    compilation: CompileResult[];
}
export interface CompiledFile {
    compiledClasses: CompiledClass[];
    sourceFile: ts.SourceFile;
    constantPool: ConstantPool;
}
export declare type DecorationAnalyses = Map<ts.SourceFile, CompiledFile>;
export declare const DecorationAnalyses: MapConstructor;
export interface MatchingHandler<A, M> {
    handler: DecoratorHandler<A, M>;
    match: M;
}
/**
 * `ResourceLoader` which directly uses the filesystem to resolve resources synchronously.
 */
export declare class FileResourceLoader implements ResourceLoader {
    load(url: string, containingFile: string): string;
}
/**
 * This Analyzer will analyze the files that have decorated classes that need to be transformed.
 */
export declare class DecorationAnalyzer {
    private typeChecker;
    private host;
    private referencesRegistry;
    private rootDirs;
    private isCore;
    resourceLoader: FileResourceLoader;
    scopeRegistry: SelectorScopeRegistry;
    handlers: DecoratorHandler<any, any>[];
    constructor(typeChecker: ts.TypeChecker, host: NgccReflectionHost, referencesRegistry: ReferencesRegistry, rootDirs: string[], isCore: boolean);
    /**
     * Analyze a program to find all the decorated files should be transformed.
     * @param program The program whose files should be analysed.
     * @returns a map of the source files to the analysis for those files.
     */
    analyzeProgram(program: ts.Program): DecorationAnalyses;
    protected analyzeFile(sourceFile: ts.SourceFile): AnalyzedFile | undefined;
    protected analyzeClass(clazz: DecoratedClass): AnalyzedClass | null;
    protected compileFile(analyzedFile: AnalyzedFile): CompiledFile;
    protected compileClass(clazz: AnalyzedClass, constantPool: ConstantPool): CompileResult[];
}
