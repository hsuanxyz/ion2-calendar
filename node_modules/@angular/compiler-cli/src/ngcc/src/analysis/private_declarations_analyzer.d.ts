/// <amd-module name="@angular/compiler-cli/src/ngcc/src/analysis/private_declarations_analyzer" />
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import { ReferencesRegistry } from '../../../ngtsc/annotations';
import { NgccReflectionHost } from '../host/ngcc_host';
export interface ExportInfo {
    identifier: string;
    from: string;
    dtsFrom?: string | null;
}
export declare type PrivateDeclarationsAnalyses = ExportInfo[];
/**
 * This class will analyze a program to find all the declared classes
 * (i.e. on an NgModule) that are not publicly exported via an entry-point.
 */
export declare class PrivateDeclarationsAnalyzer {
    private host;
    private referencesRegistry;
    constructor(host: NgccReflectionHost, referencesRegistry: ReferencesRegistry);
    analyzeProgram(program: ts.Program): PrivateDeclarationsAnalyses;
    private getRootFiles;
    private getPrivateDeclarations;
}
