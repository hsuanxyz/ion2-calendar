import * as ts from 'typescript';
import { NgEntryPoint } from './ng-package-format/entry-point';
import { NgPackage } from './ng-package-format/package';
import { CliArguments } from './commands/build.command';
import { TsConfig } from './ts/tsconfig';
/**
 * Builds a package for given project arguments.
 *
 * @deprecated Will be removed in v3
 */
export declare function createNgPackage(opts: CliArguments): Promise<void>;
/**
 * Build artefacts generated for an entry point (Angular library).
 *
 * The artefacts include distribution-ready 'binaries' as well as temporary files and
 * intermediate build output.
 *
 * @deprecated No longer used. Will be removed in v3.
 */
export declare class NgArtefacts {
    /** Directory for temporary files */
    readonly stageDir: string;
    /** Directory for build output */
    readonly outDir: string;
    private _extras;
    constructor(entryPoint: NgEntryPoint, pkg: NgPackage);
    extras<T>(key: string): T;
    extras<T>(key: string, value: T): any;
    tsConfig: TsConfig;
    tsSources: ts.TransformationResult<ts.SourceFile>;
    template(file: string): string;
    template(file: string, content: string): any;
    templates(): string[];
    stylesheet(file: string): string;
    stylesheet(file: string, content: string): any;
    stylesheets(): string[];
    es2015EntryFile: string;
    typingsEntryFile: string;
    fesm15BundleFile: string;
    fesm5BundleFile: string;
    umdBundleFile: string;
    aotBundleFile: string;
}
/**
 * `BuildStep` is deprecated.
 * See the architectural re-write for a [transformation pipeline](./docs/transformation-pipeline.md).
 *
 * @deprecated Will be removed in v3.
 */
export interface BuildStep {
    ({}: {
        artefacts: NgArtefacts;
        entryPoint: NgEntryPoint;
        pkg: NgPackage;
    }): void | any | Promise<void | any>;
}
