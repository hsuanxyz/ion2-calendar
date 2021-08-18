/// <amd-module name="@angular/compiler-cli/src/ngcc/src/analysis/module_with_providers_analyzer" />
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import { ReferencesRegistry } from '../../../ngtsc/annotations';
import { Declaration } from '../../../ngtsc/host';
import { NgccReflectionHost } from '../host/ngcc_host';
export interface ModuleWithProvidersInfo {
    /**
     * The declaration (in the .d.ts file) of the function that returns
     * a `ModuleWithProviders object, but has a signature that needs
     * a type parameter adding.
     */
    declaration: ts.MethodDeclaration | ts.FunctionDeclaration;
    /**
     * The NgModule class declaration (in the .d.ts file) to add as a type parameter.
     */
    ngModule: Declaration;
}
export declare type ModuleWithProvidersAnalyses = Map<ts.SourceFile, ModuleWithProvidersInfo[]>;
export declare const ModuleWithProvidersAnalyses: MapConstructor;
export declare class ModuleWithProvidersAnalyzer {
    private host;
    private referencesRegistry;
    constructor(host: NgccReflectionHost, referencesRegistry: ReferencesRegistry);
    analyzeProgram(program: ts.Program): ModuleWithProvidersAnalyses;
    private getRootFiles;
    private getDtsDeclaration;
}
