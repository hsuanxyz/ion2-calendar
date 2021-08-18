/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/compiler-cli/src/ngcc/src/packages/entry_point" />
/**
 * An object containing paths to the entry-points for each format.
 */
export interface EntryPointPaths {
    esm5?: string;
    fesm5?: string;
    esm2015?: string;
    fesm2015?: string;
    umd?: string;
}
/**
 * The possible values for the format of an entry-point.
 */
export declare type EntryPointFormat = keyof (EntryPointPaths);
/**
 * An object containing information about an entry-point, including paths
 * to each of the possible entry-point formats.
 */
export interface EntryPoint extends EntryPointPaths {
    /** The name of the package (e.g. `@angular/core`). */
    name: string;
    /** The path to the package that contains this entry-point. */
    package: string;
    /** The path to this entry point. */
    path: string;
    /** The path to a typings (.d.ts) file for this entry-point. */
    typings: string;
}
/**
 * Try to get an entry point from the given path.
 * @param packagePath the absolute path to the containing npm package
 * @param entryPointPath the absolute path to the potential entry point.
 * @returns Info about the entry point if it is valid, `null` otherwise.
 */
export declare function getEntryPointInfo(packagePath: string, entryPointPath: string): EntryPoint | null;
