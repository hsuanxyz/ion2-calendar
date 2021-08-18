/// <amd-module name="@angular/compiler-cli/src/ngcc/src/packages/entry_point_bundle" />
import { BundleProgram } from './bundle_program';
import { EntryPoint, EntryPointFormat } from './entry_point';
/**
 * A bundle of files and paths (and TS programs) that correspond to a particular
 * format of a package entry-point.
 */
export interface EntryPointBundle {
    format: EntryPointFormat;
    isFlat: boolean;
    rootDirs: string[];
    src: BundleProgram;
    dts: BundleProgram | null;
}
/**
 * Get an object that describes a formatted bundle for an entry-point.
 * @param entryPoint The entry-point that contains the bundle.
 * @param format The format of the bundle.
 * @param transformDts True if processing this bundle should also process its `.d.ts` files.
 */
export declare function makeEntryPointBundle(entryPoint: EntryPoint, isCore: boolean, format: EntryPointFormat, transformDts: boolean): EntryPointBundle | null;
