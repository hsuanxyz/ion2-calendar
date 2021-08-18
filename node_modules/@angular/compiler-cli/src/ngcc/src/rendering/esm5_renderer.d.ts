/// <amd-module name="@angular/compiler-cli/src/ngcc/src/rendering/esm5_renderer" />
import MagicString from 'magic-string';
import { NgccReflectionHost } from '../host/ngcc_host';
import { CompiledClass } from '../analysis/decoration_analyzer';
import { EsmRenderer } from './esm_renderer';
import { EntryPointBundle } from '../packages/entry_point_bundle';
export declare class Esm5Renderer extends EsmRenderer {
    constructor(host: NgccReflectionHost, isCore: boolean, bundle: EntryPointBundle, sourcePath: string, targetPath: string);
    /**
     * Add the definitions to each decorated class
     */
    addDefinitions(output: MagicString, compiledClass: CompiledClass, definitions: string): void;
}
