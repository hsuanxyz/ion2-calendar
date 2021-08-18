/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/compiler-cli/src/ngtsc/shims/src/flat_index_generator" />
import * as ts from 'typescript';
import { ShimGenerator } from './host';
export declare class FlatIndexGenerator implements ShimGenerator {
    readonly entryPoint: string;
    readonly moduleName: string | null;
    readonly flatIndexPath: string;
    private constructor();
    static forRootFiles(flatIndexPath: string, files: ReadonlyArray<string>, moduleName: string | null): FlatIndexGenerator | null;
    recognize(fileName: string): boolean;
    generate(): ts.SourceFile;
}
