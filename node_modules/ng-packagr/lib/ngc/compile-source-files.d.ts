import * as ts from 'typescript';
import { TsConfig } from '../ts/tsconfig';
export declare function compileSourceFiles(sourceFiles: ts.SourceFile[], tsConfig: TsConfig, outDir?: string): Promise<{
    js: string;
    metadata: string;
    typings: string;
}>;
