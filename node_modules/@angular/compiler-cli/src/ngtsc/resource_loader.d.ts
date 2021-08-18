/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/compiler-cli/src/ngtsc/resource_loader" />
import * as ts from 'typescript';
import { ResourceLoader } from './annotations';
/**
 * `ResourceLoader` which delegates to a `CompilerHost` resource loading method.
 */
export declare class HostResourceLoader implements ResourceLoader {
    private resolver;
    private loader;
    private cache;
    private fetching;
    constructor(resolver: (file: string, basePath: string) => string | null, loader: (url: string) => string | Promise<string>);
    preload(file: string, containingFile: string): Promise<void> | undefined;
    load(file: string, containingFile: string): string;
}
/**
 * `ResourceLoader` which directly uses the filesystem to resolve resources synchronously.
 */
export declare class FileResourceLoader implements ResourceLoader {
    private host;
    private options;
    constructor(host: ts.CompilerHost, options: ts.CompilerOptions);
    load(file: string, containingFile: string): string;
}
