(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngcc/src/main", ["require", "exports", "canonical-path", "yargs", "@angular/compiler-cli/src/ngcc/src/packages/build_marker", "@angular/compiler-cli/src/ngcc/src/packages/dependency_host", "@angular/compiler-cli/src/ngcc/src/packages/dependency_resolver", "@angular/compiler-cli/src/ngcc/src/packages/entry_point_bundle", "@angular/compiler-cli/src/ngcc/src/packages/entry_point_finder", "@angular/compiler-cli/src/ngcc/src/packages/transformer"], factory);
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
    var path = require("canonical-path");
    var yargs = require("yargs");
    var build_marker_1 = require("@angular/compiler-cli/src/ngcc/src/packages/build_marker");
    var dependency_host_1 = require("@angular/compiler-cli/src/ngcc/src/packages/dependency_host");
    var dependency_resolver_1 = require("@angular/compiler-cli/src/ngcc/src/packages/dependency_resolver");
    var entry_point_bundle_1 = require("@angular/compiler-cli/src/ngcc/src/packages/entry_point_bundle");
    var entry_point_finder_1 = require("@angular/compiler-cli/src/ngcc/src/packages/entry_point_finder");
    var transformer_1 = require("@angular/compiler-cli/src/ngcc/src/packages/transformer");
    function mainNgcc(args) {
        var options = yargs
            .option('s', {
            alias: 'source',
            describe: 'A path to the root folder to compile.',
            default: './node_modules'
        })
            .option('f', {
            alias: 'formats',
            array: true,
            describe: 'An array of formats to compile.',
            default: ['fesm2015', 'esm2015', 'fesm5', 'esm5']
        })
            .option('t', {
            alias: 'target',
            describe: 'A path to a root folder where the compiled files will be written.',
            defaultDescription: 'The `source` folder.'
        })
            .help()
            .parse(args);
        var sourcePath = path.resolve(options['s']);
        var formats = options['f'];
        var targetPath = options['t'] || sourcePath;
        var transformer = new transformer_1.Transformer(sourcePath, targetPath);
        var host = new dependency_host_1.DependencyHost();
        var resolver = new dependency_resolver_1.DependencyResolver(host);
        var finder = new entry_point_finder_1.EntryPointFinder(resolver);
        try {
            var entryPoints = finder.findEntryPoints(sourcePath).entryPoints;
            entryPoints.forEach(function (entryPoint) {
                // Are we compiling the Angular core?
                var isCore = entryPoint.name === '@angular/core';
                // We transform the d.ts typings files while transforming one of the formats.
                // This variable decides with which of the available formats to do this transform.
                // It is marginally faster to process via the flat file if available.
                var dtsTransformFormat = entryPoint.fesm2015 ? 'fesm2015' : 'esm2015';
                formats.forEach(function (format) {
                    if (build_marker_1.checkMarkerFile(entryPoint, format)) {
                        console.warn("Skipping " + entryPoint.name + " : " + format + " (already built).");
                        return;
                    }
                    var bundle = entry_point_bundle_1.makeEntryPointBundle(entryPoint, isCore, format, format === dtsTransformFormat);
                    if (bundle === null) {
                        console.warn("Skipping " + entryPoint.name + " : " + format + " (no entry point file for this format).");
                    }
                    else {
                        transformer.transform(entryPoint, isCore, bundle);
                    }
                    // Write the built-with-ngcc marker
                    build_marker_1.writeMarkerFile(entryPoint, format);
                });
            });
        }
        catch (e) {
            console.error(e.stack);
            return 1;
        }
        return 0;
    }
    exports.mainNgcc = mainNgcc;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmdjYy9zcmMvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILHFDQUF1QztJQUN2Qyw2QkFBK0I7SUFFL0IseUZBQXlFO0lBQ3pFLCtGQUEwRDtJQUMxRCx1R0FBa0U7SUFFbEUscUdBQW1FO0lBQ25FLHFHQUErRDtJQUMvRCx1RkFBbUQ7SUFFbkQsU0FBZ0IsUUFBUSxDQUFDLElBQWM7UUFDckMsSUFBTSxPQUFPLEdBQ1QsS0FBSzthQUNBLE1BQU0sQ0FBQyxHQUFHLEVBQUU7WUFDWCxLQUFLLEVBQUUsUUFBUTtZQUNmLFFBQVEsRUFBRSx1Q0FBdUM7WUFDakQsT0FBTyxFQUFFLGdCQUFnQjtTQUMxQixDQUFDO2FBQ0QsTUFBTSxDQUFDLEdBQUcsRUFBRTtZQUNYLEtBQUssRUFBRSxTQUFTO1lBQ2hCLEtBQUssRUFBRSxJQUFJO1lBQ1gsUUFBUSxFQUFFLGlDQUFpQztZQUMzQyxPQUFPLEVBQUUsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUM7U0FDbEQsQ0FBQzthQUNELE1BQU0sQ0FBQyxHQUFHLEVBQUU7WUFDWCxLQUFLLEVBQUUsUUFBUTtZQUNmLFFBQVEsRUFBRSxtRUFBbUU7WUFDN0Usa0JBQWtCLEVBQUUsc0JBQXNCO1NBQzNDLENBQUM7YUFDRCxJQUFJLEVBQUU7YUFDTixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFckIsSUFBTSxVQUFVLEdBQVcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN0RCxJQUFNLE9BQU8sR0FBdUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pELElBQU0sVUFBVSxHQUFXLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxVQUFVLENBQUM7UUFFdEQsSUFBTSxXQUFXLEdBQUcsSUFBSSx5QkFBVyxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUM1RCxJQUFNLElBQUksR0FBRyxJQUFJLGdDQUFjLEVBQUUsQ0FBQztRQUNsQyxJQUFNLFFBQVEsR0FBRyxJQUFJLHdDQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlDLElBQU0sTUFBTSxHQUFHLElBQUkscUNBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFOUMsSUFBSTtZQUNLLElBQUEsNERBQVcsQ0FBdUM7WUFDekQsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFBLFVBQVU7Z0JBRTVCLHFDQUFxQztnQkFDckMsSUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLElBQUksS0FBSyxlQUFlLENBQUM7Z0JBRW5ELDZFQUE2RTtnQkFDN0Usa0ZBQWtGO2dCQUNsRixxRUFBcUU7Z0JBQ3JFLElBQU0sa0JBQWtCLEdBQXFCLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUUxRixPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUEsTUFBTTtvQkFDcEIsSUFBSSw4QkFBZSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDdkMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFZLFVBQVUsQ0FBQyxJQUFJLFdBQU0sTUFBTSxzQkFBbUIsQ0FBQyxDQUFDO3dCQUN6RSxPQUFPO3FCQUNSO29CQUVELElBQU0sTUFBTSxHQUNSLHlDQUFvQixDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sS0FBSyxrQkFBa0IsQ0FBQyxDQUFDO29CQUNwRixJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7d0JBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQ1IsY0FBWSxVQUFVLENBQUMsSUFBSSxXQUFNLE1BQU0sNENBQXlDLENBQUMsQ0FBQztxQkFDdkY7eUJBQU07d0JBQ0wsV0FBVyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO3FCQUNuRDtvQkFFRCxtQ0FBbUM7b0JBQ25DLDhCQUFlLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUN0QyxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1NBQ0o7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZCLE9BQU8sQ0FBQyxDQUFDO1NBQ1Y7UUFFRCxPQUFPLENBQUMsQ0FBQztJQUNYLENBQUM7SUFwRUQsNEJBb0VDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdjYW5vbmljYWwtcGF0aCc7XG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7Y2hlY2tNYXJrZXJGaWxlLCB3cml0ZU1hcmtlckZpbGV9IGZyb20gJy4vcGFja2FnZXMvYnVpbGRfbWFya2VyJztcbmltcG9ydCB7RGVwZW5kZW5jeUhvc3R9IGZyb20gJy4vcGFja2FnZXMvZGVwZW5kZW5jeV9ob3N0JztcbmltcG9ydCB7RGVwZW5kZW5jeVJlc29sdmVyfSBmcm9tICcuL3BhY2thZ2VzL2RlcGVuZGVuY3lfcmVzb2x2ZXInO1xuaW1wb3J0IHtFbnRyeVBvaW50Rm9ybWF0fSBmcm9tICcuL3BhY2thZ2VzL2VudHJ5X3BvaW50JztcbmltcG9ydCB7bWFrZUVudHJ5UG9pbnRCdW5kbGV9IGZyb20gJy4vcGFja2FnZXMvZW50cnlfcG9pbnRfYnVuZGxlJztcbmltcG9ydCB7RW50cnlQb2ludEZpbmRlcn0gZnJvbSAnLi9wYWNrYWdlcy9lbnRyeV9wb2ludF9maW5kZXInO1xuaW1wb3J0IHtUcmFuc2Zvcm1lcn0gZnJvbSAnLi9wYWNrYWdlcy90cmFuc2Zvcm1lcic7XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWluTmdjYyhhcmdzOiBzdHJpbmdbXSk6IG51bWJlciB7XG4gIGNvbnN0IG9wdGlvbnMgPVxuICAgICAgeWFyZ3NcbiAgICAgICAgICAub3B0aW9uKCdzJywge1xuICAgICAgICAgICAgYWxpYXM6ICdzb3VyY2UnLFxuICAgICAgICAgICAgZGVzY3JpYmU6ICdBIHBhdGggdG8gdGhlIHJvb3QgZm9sZGVyIHRvIGNvbXBpbGUuJyxcbiAgICAgICAgICAgIGRlZmF1bHQ6ICcuL25vZGVfbW9kdWxlcydcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5vcHRpb24oJ2YnLCB7XG4gICAgICAgICAgICBhbGlhczogJ2Zvcm1hdHMnLFxuICAgICAgICAgICAgYXJyYXk6IHRydWUsXG4gICAgICAgICAgICBkZXNjcmliZTogJ0FuIGFycmF5IG9mIGZvcm1hdHMgdG8gY29tcGlsZS4nLFxuICAgICAgICAgICAgZGVmYXVsdDogWydmZXNtMjAxNScsICdlc20yMDE1JywgJ2Zlc201JywgJ2VzbTUnXVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLm9wdGlvbigndCcsIHtcbiAgICAgICAgICAgIGFsaWFzOiAndGFyZ2V0JyxcbiAgICAgICAgICAgIGRlc2NyaWJlOiAnQSBwYXRoIHRvIGEgcm9vdCBmb2xkZXIgd2hlcmUgdGhlIGNvbXBpbGVkIGZpbGVzIHdpbGwgYmUgd3JpdHRlbi4nLFxuICAgICAgICAgICAgZGVmYXVsdERlc2NyaXB0aW9uOiAnVGhlIGBzb3VyY2VgIGZvbGRlci4nXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuaGVscCgpXG4gICAgICAgICAgLnBhcnNlKGFyZ3MpO1xuXG4gIGNvbnN0IHNvdXJjZVBhdGg6IHN0cmluZyA9IHBhdGgucmVzb2x2ZShvcHRpb25zWydzJ10pO1xuICBjb25zdCBmb3JtYXRzOiBFbnRyeVBvaW50Rm9ybWF0W10gPSBvcHRpb25zWydmJ107XG4gIGNvbnN0IHRhcmdldFBhdGg6IHN0cmluZyA9IG9wdGlvbnNbJ3QnXSB8fCBzb3VyY2VQYXRoO1xuXG4gIGNvbnN0IHRyYW5zZm9ybWVyID0gbmV3IFRyYW5zZm9ybWVyKHNvdXJjZVBhdGgsIHRhcmdldFBhdGgpO1xuICBjb25zdCBob3N0ID0gbmV3IERlcGVuZGVuY3lIb3N0KCk7XG4gIGNvbnN0IHJlc29sdmVyID0gbmV3IERlcGVuZGVuY3lSZXNvbHZlcihob3N0KTtcbiAgY29uc3QgZmluZGVyID0gbmV3IEVudHJ5UG9pbnRGaW5kZXIocmVzb2x2ZXIpO1xuXG4gIHRyeSB7XG4gICAgY29uc3Qge2VudHJ5UG9pbnRzfSA9IGZpbmRlci5maW5kRW50cnlQb2ludHMoc291cmNlUGF0aCk7XG4gICAgZW50cnlQb2ludHMuZm9yRWFjaChlbnRyeVBvaW50ID0+IHtcblxuICAgICAgLy8gQXJlIHdlIGNvbXBpbGluZyB0aGUgQW5ndWxhciBjb3JlP1xuICAgICAgY29uc3QgaXNDb3JlID0gZW50cnlQb2ludC5uYW1lID09PSAnQGFuZ3VsYXIvY29yZSc7XG5cbiAgICAgIC8vIFdlIHRyYW5zZm9ybSB0aGUgZC50cyB0eXBpbmdzIGZpbGVzIHdoaWxlIHRyYW5zZm9ybWluZyBvbmUgb2YgdGhlIGZvcm1hdHMuXG4gICAgICAvLyBUaGlzIHZhcmlhYmxlIGRlY2lkZXMgd2l0aCB3aGljaCBvZiB0aGUgYXZhaWxhYmxlIGZvcm1hdHMgdG8gZG8gdGhpcyB0cmFuc2Zvcm0uXG4gICAgICAvLyBJdCBpcyBtYXJnaW5hbGx5IGZhc3RlciB0byBwcm9jZXNzIHZpYSB0aGUgZmxhdCBmaWxlIGlmIGF2YWlsYWJsZS5cbiAgICAgIGNvbnN0IGR0c1RyYW5zZm9ybUZvcm1hdDogRW50cnlQb2ludEZvcm1hdCA9IGVudHJ5UG9pbnQuZmVzbTIwMTUgPyAnZmVzbTIwMTUnIDogJ2VzbTIwMTUnO1xuXG4gICAgICBmb3JtYXRzLmZvckVhY2goZm9ybWF0ID0+IHtcbiAgICAgICAgaWYgKGNoZWNrTWFya2VyRmlsZShlbnRyeVBvaW50LCBmb3JtYXQpKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKGBTa2lwcGluZyAke2VudHJ5UG9pbnQubmFtZX0gOiAke2Zvcm1hdH0gKGFscmVhZHkgYnVpbHQpLmApO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJ1bmRsZSA9XG4gICAgICAgICAgICBtYWtlRW50cnlQb2ludEJ1bmRsZShlbnRyeVBvaW50LCBpc0NvcmUsIGZvcm1hdCwgZm9ybWF0ID09PSBkdHNUcmFuc2Zvcm1Gb3JtYXQpO1xuICAgICAgICBpZiAoYnVuZGxlID09PSBudWxsKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICBgU2tpcHBpbmcgJHtlbnRyeVBvaW50Lm5hbWV9IDogJHtmb3JtYXR9IChubyBlbnRyeSBwb2ludCBmaWxlIGZvciB0aGlzIGZvcm1hdCkuYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdHJhbnNmb3JtZXIudHJhbnNmb3JtKGVudHJ5UG9pbnQsIGlzQ29yZSwgYnVuZGxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdyaXRlIHRoZSBidWlsdC13aXRoLW5nY2MgbWFya2VyXG4gICAgICAgIHdyaXRlTWFya2VyRmlsZShlbnRyeVBvaW50LCBmb3JtYXQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGUuc3RhY2spO1xuICAgIHJldHVybiAxO1xuICB9XG5cbiAgcmV0dXJuIDA7XG59XG4iXX0=