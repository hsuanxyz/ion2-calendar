/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/compiler-cli/src/ngtsc/shims/src/summary_generator" />
import * as ts from 'typescript';
import { ShimGenerator } from './host';
export declare class SummaryGenerator implements ShimGenerator {
    private map;
    private constructor();
    getSummaryFileNames(): string[];
    recognize(fileName: string): boolean;
    generate(genFilePath: string, readFile: (fileName: string) => ts.SourceFile | null): ts.SourceFile | null;
    static forRootFiles(files: ReadonlyArray<string>): SummaryGenerator;
}
