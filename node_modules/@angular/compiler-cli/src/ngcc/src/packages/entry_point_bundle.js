(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngcc/src/packages/entry_point_bundle", ["require", "exports", "typescript", "@angular/compiler-cli/src/ngcc/src/packages/bundle_program"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ts = require("typescript");
    var bundle_program_1 = require("@angular/compiler-cli/src/ngcc/src/packages/bundle_program");
    /**
     * Get an object that describes a formatted bundle for an entry-point.
     * @param entryPoint The entry-point that contains the bundle.
     * @param format The format of the bundle.
     * @param transformDts True if processing this bundle should also process its `.d.ts` files.
     */
    function makeEntryPointBundle(entryPoint, isCore, format, transformDts) {
        // Bail out if the entry-point does not have this format.
        var path = entryPoint[format];
        if (!path) {
            return null;
        }
        // Create the TS program and necessary helpers.
        var options = {
            allowJs: true,
            maxNodeModuleJsDepth: Infinity,
            rootDir: entryPoint.path,
        };
        var host = ts.createCompilerHost(options);
        var rootDirs = [entryPoint.path];
        // Create the bundle programs, as necessary.
        var src = bundle_program_1.makeBundleProgram(isCore, path, 'r3_symbols.js', options, host);
        var dts = transformDts ?
            bundle_program_1.makeBundleProgram(isCore, entryPoint.typings, 'r3_symbols.d.ts', options, host) :
            null;
        var isFlat = src.r3SymbolsFile === null;
        return { format: format, rootDirs: rootDirs, isFlat: isFlat, src: src, dts: dts };
    }
    exports.makeEntryPointBundle = makeEntryPointBundle;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlfcG9pbnRfYnVuZGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ2NjL3NyYy9wYWNrYWdlcy9lbnRyeV9wb2ludF9idW5kbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCwrQkFBaUM7SUFFakMsNkZBQWtFO0lBZ0JsRTs7Ozs7T0FLRztJQUNILFNBQWdCLG9CQUFvQixDQUNoQyxVQUFzQixFQUFFLE1BQWUsRUFBRSxNQUF3QixFQUNqRSxZQUFxQjtRQUN2Qix5REFBeUQ7UUFDekQsSUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVCxPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsK0NBQStDO1FBQy9DLElBQU0sT0FBTyxHQUF1QjtZQUNsQyxPQUFPLEVBQUUsSUFBSTtZQUNiLG9CQUFvQixFQUFFLFFBQVE7WUFDOUIsT0FBTyxFQUFFLFVBQVUsQ0FBQyxJQUFJO1NBQ3pCLENBQUM7UUFDRixJQUFNLElBQUksR0FBRyxFQUFFLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDNUMsSUFBTSxRQUFRLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFbkMsNENBQTRDO1FBQzVDLElBQU0sR0FBRyxHQUFHLGtDQUFpQixDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1RSxJQUFNLEdBQUcsR0FBRyxZQUFZLENBQUMsQ0FBQztZQUN0QixrQ0FBaUIsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNqRixJQUFJLENBQUM7UUFDVCxJQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsYUFBYSxLQUFLLElBQUksQ0FBQztRQUUxQyxPQUFPLEVBQUMsTUFBTSxRQUFBLEVBQUUsUUFBUSxVQUFBLEVBQUUsTUFBTSxRQUFBLEVBQUUsR0FBRyxLQUFBLEVBQUUsR0FBRyxLQUFBLEVBQUMsQ0FBQztJQUM5QyxDQUFDO0lBMUJELG9EQTBCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0J1bmRsZVByb2dyYW0sIG1ha2VCdW5kbGVQcm9ncmFtfSBmcm9tICcuL2J1bmRsZV9wcm9ncmFtJztcbmltcG9ydCB7RW50cnlQb2ludCwgRW50cnlQb2ludEZvcm1hdH0gZnJvbSAnLi9lbnRyeV9wb2ludCc7XG5cblxuLyoqXG4gKiBBIGJ1bmRsZSBvZiBmaWxlcyBhbmQgcGF0aHMgKGFuZCBUUyBwcm9ncmFtcykgdGhhdCBjb3JyZXNwb25kIHRvIGEgcGFydGljdWxhclxuICogZm9ybWF0IG9mIGEgcGFja2FnZSBlbnRyeS1wb2ludC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFbnRyeVBvaW50QnVuZGxlIHtcbiAgZm9ybWF0OiBFbnRyeVBvaW50Rm9ybWF0O1xuICBpc0ZsYXQ6IGJvb2xlYW47XG4gIHJvb3REaXJzOiBzdHJpbmdbXTtcbiAgc3JjOiBCdW5kbGVQcm9ncmFtO1xuICBkdHM6IEJ1bmRsZVByb2dyYW18bnVsbDtcbn1cblxuLyoqXG4gKiBHZXQgYW4gb2JqZWN0IHRoYXQgZGVzY3JpYmVzIGEgZm9ybWF0dGVkIGJ1bmRsZSBmb3IgYW4gZW50cnktcG9pbnQuXG4gKiBAcGFyYW0gZW50cnlQb2ludCBUaGUgZW50cnktcG9pbnQgdGhhdCBjb250YWlucyB0aGUgYnVuZGxlLlxuICogQHBhcmFtIGZvcm1hdCBUaGUgZm9ybWF0IG9mIHRoZSBidW5kbGUuXG4gKiBAcGFyYW0gdHJhbnNmb3JtRHRzIFRydWUgaWYgcHJvY2Vzc2luZyB0aGlzIGJ1bmRsZSBzaG91bGQgYWxzbyBwcm9jZXNzIGl0cyBgLmQudHNgIGZpbGVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFrZUVudHJ5UG9pbnRCdW5kbGUoXG4gICAgZW50cnlQb2ludDogRW50cnlQb2ludCwgaXNDb3JlOiBib29sZWFuLCBmb3JtYXQ6IEVudHJ5UG9pbnRGb3JtYXQsXG4gICAgdHJhbnNmb3JtRHRzOiBib29sZWFuKTogRW50cnlQb2ludEJ1bmRsZXxudWxsIHtcbiAgLy8gQmFpbCBvdXQgaWYgdGhlIGVudHJ5LXBvaW50IGRvZXMgbm90IGhhdmUgdGhpcyBmb3JtYXQuXG4gIGNvbnN0IHBhdGggPSBlbnRyeVBvaW50W2Zvcm1hdF07XG4gIGlmICghcGF0aCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gQ3JlYXRlIHRoZSBUUyBwcm9ncmFtIGFuZCBuZWNlc3NhcnkgaGVscGVycy5cbiAgY29uc3Qgb3B0aW9uczogdHMuQ29tcGlsZXJPcHRpb25zID0ge1xuICAgIGFsbG93SnM6IHRydWUsXG4gICAgbWF4Tm9kZU1vZHVsZUpzRGVwdGg6IEluZmluaXR5LFxuICAgIHJvb3REaXI6IGVudHJ5UG9pbnQucGF0aCxcbiAgfTtcbiAgY29uc3QgaG9zdCA9IHRzLmNyZWF0ZUNvbXBpbGVySG9zdChvcHRpb25zKTtcbiAgY29uc3Qgcm9vdERpcnMgPSBbZW50cnlQb2ludC5wYXRoXTtcblxuICAvLyBDcmVhdGUgdGhlIGJ1bmRsZSBwcm9ncmFtcywgYXMgbmVjZXNzYXJ5LlxuICBjb25zdCBzcmMgPSBtYWtlQnVuZGxlUHJvZ3JhbShpc0NvcmUsIHBhdGgsICdyM19zeW1ib2xzLmpzJywgb3B0aW9ucywgaG9zdCk7XG4gIGNvbnN0IGR0cyA9IHRyYW5zZm9ybUR0cyA/XG4gICAgICBtYWtlQnVuZGxlUHJvZ3JhbShpc0NvcmUsIGVudHJ5UG9pbnQudHlwaW5ncywgJ3IzX3N5bWJvbHMuZC50cycsIG9wdGlvbnMsIGhvc3QpIDpcbiAgICAgIG51bGw7XG4gIGNvbnN0IGlzRmxhdCA9IHNyYy5yM1N5bWJvbHNGaWxlID09PSBudWxsO1xuXG4gIHJldHVybiB7Zm9ybWF0LCByb290RGlycywgaXNGbGF0LCBzcmMsIGR0c307XG59XG4iXX0=