import * as ts from 'typescript';
import { TsConfig } from '../ts/tsconfig';
export declare function transformSourceFiles(source: TsConfig | ts.TransformationResult<ts.SourceFile>, transformers: ts.TransformerFactory<ts.SourceFile>[]): ts.TransformationResult<ts.SourceFile>;
