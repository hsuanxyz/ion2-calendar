/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/compiler-cli/src/ngtsc/shims/src/host" />
import * as ts from 'typescript';
export interface ShimGenerator {
    /**
     * Returns `true` if this generator is intended to handle the given file.
     */
    recognize(fileName: string): boolean;
    /**
     * Generate a shim's `ts.SourceFile` for the given original file.
     *
     * `readFile` is a function which allows the generator to look up the contents of existing source
     * files. It returns null if the requested file doesn't exist.
     *
     * If `generate` returns null, then the shim generator declines to generate the file after all.
     */
    generate(genFileName: string, readFile: (fileName: string) => ts.SourceFile | null): ts.SourceFile | null;
}
/**
 * A wrapper around a `ts.CompilerHost` which supports generated files.
 */
export declare class GeneratedShimsHostWrapper implements ts.CompilerHost {
    private delegate;
    private shimGenerators;
    constructor(delegate: ts.CompilerHost, shimGenerators: ShimGenerator[]);
    resolveTypeReferenceDirectives?: (names: string[], containingFile: string) => ts.ResolvedTypeReferenceDirective[];
    directoryExists?: (directoryName: string) => boolean;
    getSourceFile(fileName: string, languageVersion: ts.ScriptTarget, onError?: ((message: string) => void) | undefined, shouldCreateNewSourceFile?: boolean | undefined): ts.SourceFile | undefined;
    getDefaultLibFileName(options: ts.CompilerOptions): string;
    writeFile(fileName: string, data: string, writeByteOrderMark: boolean, onError: ((message: string) => void) | undefined, sourceFiles: ReadonlyArray<ts.SourceFile>): void;
    getCurrentDirectory(): string;
    getDirectories(path: string): string[];
    getCanonicalFileName(fileName: string): string;
    useCaseSensitiveFileNames(): boolean;
    getNewLine(): string;
    fileExists(fileName: string): boolean;
    readFile(fileName: string): string | undefined;
}
