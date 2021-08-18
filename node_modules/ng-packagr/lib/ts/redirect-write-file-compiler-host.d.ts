import * as ts from 'typescript';
/**
 * Returns a TypeScript compiler host that redirects `writeFile` output to the given `outDir`.
 *
 * @param compilerHost Original compiler host
 * @param baseDir Project base directory
 * @param outDir Target directory
 */
export declare function redirectWriteFileCompilerHost(compilerHost: ts.CompilerHost, baseDir: string, outDir: string): ts.CompilerHost;
