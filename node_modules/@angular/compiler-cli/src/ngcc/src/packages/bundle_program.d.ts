/// <amd-module name="@angular/compiler-cli/src/ngcc/src/packages/bundle_program" />
import * as ts from 'typescript';
/**
* An entry point bundle contains one or two programs, e.g. `src` and `dts`,
* that are compiled via TypeScript.
*
* To aid with processing the program, this interface exposes the program itself,
* as well as path and TS file of the entry-point to the program and the r3Symbols
* file, if appropriate.
*/
export interface BundleProgram {
    program: ts.Program;
    path: string;
    file: ts.SourceFile;
    r3SymbolsPath: string | null;
    r3SymbolsFile: ts.SourceFile | null;
}
/**
 * Create a bundle program.
 */
export declare function makeBundleProgram(isCore: boolean, path: string, r3FileName: string, options: ts.CompilerOptions, host: ts.CompilerHost): BundleProgram;
/**
 * Search the given directory hierarchy to find the path to the `r3_symbols` file.
 */
export declare function findR3SymbolsPath(directory: string, filename: string): string | null;
