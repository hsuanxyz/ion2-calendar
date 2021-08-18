/// <amd-module name="@angular/compiler-cli/src/ngcc/src/rendering/esm_renderer" />
import MagicString from 'magic-string';
import * as ts from 'typescript';
import { NgccReflectionHost, SwitchableVariableDeclaration } from '../host/ngcc_host';
import { CompiledClass } from '../analysis/decoration_analyzer';
import { RedundantDecoratorMap, Renderer } from './renderer';
import { EntryPointBundle } from '../packages/entry_point_bundle';
export declare class EsmRenderer extends Renderer {
    constructor(host: NgccReflectionHost, isCore: boolean, bundle: EntryPointBundle, sourcePath: string, targetPath: string);
    /**
     *  Add the imports at the top of the file
     */
    addImports(output: MagicString, imports: {
        name: string;
        as: string;
    }[]): void;
    addExports(output: MagicString, entryPointBasePath: string, exports: {
        identifier: string;
        from: string;
    }[]): void;
    addConstants(output: MagicString, constants: string, file: ts.SourceFile): void;
    /**
     * Add the definitions to each decorated class
     */
    addDefinitions(output: MagicString, compiledClass: CompiledClass, definitions: string): void;
    /**
     * Remove static decorator properties from classes
     */
    removeDecorators(output: MagicString, decoratorsToRemove: RedundantDecoratorMap): void;
    rewriteSwitchableDeclarations(outputText: MagicString, sourceFile: ts.SourceFile, declarations: SwitchableVariableDeclaration[]): void;
}
