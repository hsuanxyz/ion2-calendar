/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/compiler-cli/src/ngtsc/shims/src/factory_generator" />
import * as ts from 'typescript';
import { ShimGenerator } from './host';
/**
 * Generates ts.SourceFiles which contain variable declarations for NgFactories for every exported
 * class of an input ts.SourceFile.
 */
export declare class FactoryGenerator implements ShimGenerator {
    private map;
    private constructor();
    readonly factoryFileMap: Map<string, string>;
    recognize(fileName: string): boolean;
    generate(genFilePath: string, readFile: (fileName: string) => ts.SourceFile | null): ts.SourceFile | null;
    static forRootFiles(files: ReadonlyArray<string>): FactoryGenerator;
}
export interface FactoryInfo {
    sourceFilePath: string;
    moduleSymbolNames: Set<string>;
}
export declare function generatedFactoryTransform(factoryMap: Map<string, FactoryInfo>, coreImportsFrom: ts.SourceFile | null): ts.TransformerFactory<ts.SourceFile>;
