/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngcc/src/packages/dependency_resolver", ["require", "exports", "tslib", "dependency-graph"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var dependency_graph_1 = require("dependency-graph");
    /**
     * A class that resolves dependencies between entry-points.
     */
    var DependencyResolver = /** @class */ (function () {
        function DependencyResolver(host) {
            this.host = host;
        }
        /**
         * Sort the array of entry points so that the dependant entry points always come later than
         * their dependencies in the array.
         * @param entryPoints An array entry points to sort.
         * @returns the result of sorting the entry points.
         */
        DependencyResolver.prototype.sortEntryPointsByDependency = function (entryPoints) {
            var _this = this;
            var invalidEntryPoints = [];
            var ignoredDependencies = [];
            var graph = new dependency_graph_1.DepGraph();
            // Add the entry ponts to the graph as nodes
            entryPoints.forEach(function (entryPoint) { return graph.addNode(entryPoint.path, entryPoint); });
            // Now add the dependencies between them
            entryPoints.forEach(function (entryPoint) {
                var entryPointPath = entryPoint.fesm2015 || entryPoint.esm2015;
                if (!entryPointPath) {
                    throw new Error("ESM2015 format (flat and non-flat) missing in '" + entryPoint.path + "' entry-point.");
                }
                var dependencies = new Set();
                var missing = new Set();
                var deepImports = new Set();
                _this.host.computeDependencies(entryPointPath, dependencies, missing, deepImports);
                if (missing.size > 0) {
                    // This entry point has dependencies that are missing
                    // so remove it from the graph.
                    removeNodes(entryPoint, Array.from(missing));
                }
                else {
                    dependencies.forEach(function (dependencyPath) {
                        if (graph.hasNode(dependencyPath)) {
                            // The dependency path maps to an entry point that exists in the graph
                            // so add the dependency.
                            graph.addDependency(entryPoint.path, dependencyPath);
                        }
                        else if (invalidEntryPoints.some(function (i) { return i.entryPoint.path === dependencyPath; })) {
                            // The dependency path maps to an entry-point that was previously removed
                            // from the graph, so remove this entry-point as well.
                            removeNodes(entryPoint, [dependencyPath]);
                        }
                        else {
                            // The dependency path points to a package that ngcc does not care about.
                            ignoredDependencies.push({ entryPoint: entryPoint, dependencyPath: dependencyPath });
                        }
                    });
                }
                if (deepImports.size) {
                    var imports = Array.from(deepImports).map(function (i) { return "'" + i + "'"; }).join(', ');
                    console.warn("Entry point '" + entryPoint.name + "' contains deep imports into " + imports + ". " +
                        "This is probably not a problem, but may cause the compilation of entry points to be out of order.");
                }
            });
            // The map now only holds entry-points that ngcc cares about and whose dependencies
            // (direct and transitive) all exist.
            return {
                entryPoints: graph.overallOrder().map(function (path) { return graph.getNodeData(path); }),
                invalidEntryPoints: invalidEntryPoints,
                ignoredDependencies: ignoredDependencies
            };
            function removeNodes(entryPoint, missingDependencies) {
                var nodesToRemove = tslib_1.__spread([entryPoint.path], graph.dependantsOf(entryPoint.path));
                nodesToRemove.forEach(function (node) {
                    invalidEntryPoints.push({ entryPoint: graph.getNodeData(node), missingDependencies: missingDependencies });
                    graph.removeNode(node);
                });
            }
        };
        return DependencyResolver;
    }());
    exports.DependencyResolver = DependencyResolver;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwZW5kZW5jeV9yZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmdjYy9zcmMvcGFja2FnZXMvZGVwZW5kZW5jeV9yZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCxxREFBMEM7SUFvRDFDOztPQUVHO0lBQ0g7UUFDRSw0QkFBb0IsSUFBb0I7WUFBcEIsU0FBSSxHQUFKLElBQUksQ0FBZ0I7UUFBRyxDQUFDO1FBQzVDOzs7OztXQUtHO1FBQ0gsd0RBQTJCLEdBQTNCLFVBQTRCLFdBQXlCO1lBQXJELGlCQWlFQztZQWhFQyxJQUFNLGtCQUFrQixHQUF3QixFQUFFLENBQUM7WUFDbkQsSUFBTSxtQkFBbUIsR0FBd0IsRUFBRSxDQUFDO1lBQ3BELElBQU0sS0FBSyxHQUFHLElBQUksMkJBQVEsRUFBYyxDQUFDO1lBRXpDLDRDQUE0QztZQUM1QyxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQUEsVUFBVSxJQUFJLE9BQUEsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxFQUExQyxDQUEwQyxDQUFDLENBQUM7WUFFOUUsd0NBQXdDO1lBQ3hDLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBQSxVQUFVO2dCQUM1QixJQUFNLGNBQWMsR0FBRyxVQUFVLENBQUMsUUFBUSxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUM7Z0JBQ2pFLElBQUksQ0FBQyxjQUFjLEVBQUU7b0JBQ25CLE1BQU0sSUFBSSxLQUFLLENBQ1gsb0RBQWtELFVBQVUsQ0FBQyxJQUFJLG1CQUFnQixDQUFDLENBQUM7aUJBQ3hGO2dCQUVELElBQU0sWUFBWSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7Z0JBQ3ZDLElBQU0sT0FBTyxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7Z0JBQ2xDLElBQU0sV0FBVyxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7Z0JBQ3RDLEtBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBRWxGLElBQUksT0FBTyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUU7b0JBQ3BCLHFEQUFxRDtvQkFDckQsK0JBQStCO29CQUMvQixXQUFXLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztpQkFDOUM7cUJBQU07b0JBQ0wsWUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFBLGNBQWM7d0JBQ2pDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsRUFBRTs0QkFDakMsc0VBQXNFOzRCQUN0RSx5QkFBeUI7NEJBQ3pCLEtBQUssQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQzt5QkFDdEQ7NkJBQU0sSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxjQUFjLEVBQXBDLENBQW9DLENBQUMsRUFBRTs0QkFDN0UseUVBQXlFOzRCQUN6RSxzREFBc0Q7NEJBQ3RELFdBQVcsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO3lCQUMzQzs2QkFBTTs0QkFDTCx5RUFBeUU7NEJBQ3pFLG1CQUFtQixDQUFDLElBQUksQ0FBQyxFQUFDLFVBQVUsWUFBQSxFQUFFLGNBQWMsZ0JBQUEsRUFBQyxDQUFDLENBQUM7eUJBQ3hEO29CQUNILENBQUMsQ0FBQyxDQUFDO2lCQUNKO2dCQUVELElBQUksV0FBVyxDQUFDLElBQUksRUFBRTtvQkFDcEIsSUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxNQUFJLENBQUMsTUFBRyxFQUFSLENBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDdEUsT0FBTyxDQUFDLElBQUksQ0FDUixrQkFBZ0IsVUFBVSxDQUFDLElBQUkscUNBQWdDLE9BQU8sT0FBSTt3QkFDMUUsbUdBQW1HLENBQUMsQ0FBQztpQkFDMUc7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUVILG1GQUFtRjtZQUNuRixxQ0FBcUM7WUFDckMsT0FBTztnQkFDTCxXQUFXLEVBQUUsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQXZCLENBQXVCLENBQUM7Z0JBQ3RFLGtCQUFrQixvQkFBQTtnQkFDbEIsbUJBQW1CLHFCQUFBO2FBQ3BCLENBQUM7WUFFRixTQUFTLFdBQVcsQ0FBQyxVQUFzQixFQUFFLG1CQUE2QjtnQkFDeEUsSUFBTSxhQUFhLHFCQUFJLFVBQVUsQ0FBQyxJQUFJLEdBQUssS0FBSyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDaEYsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUk7b0JBQ3hCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLG1CQUFtQixxQkFBQSxFQUFDLENBQUMsQ0FBQztvQkFDcEYsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDekIsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDO1FBQ0gsQ0FBQztRQUNILHlCQUFDO0lBQUQsQ0FBQyxBQTFFRCxJQTBFQztJQTFFWSxnREFBa0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGVwR3JhcGh9IGZyb20gJ2RlcGVuZGVuY3ktZ3JhcGgnO1xuaW1wb3J0IHtEZXBlbmRlbmN5SG9zdH0gZnJvbSAnLi9kZXBlbmRlbmN5X2hvc3QnO1xuaW1wb3J0IHtFbnRyeVBvaW50fSBmcm9tICcuL2VudHJ5X3BvaW50JztcblxuXG4vKipcbiAqIEhvbGRzIGluZm9ybWF0aW9uIGFib3V0IGVudHJ5IHBvaW50cyB0aGF0IGFyZSByZW1vdmVkIGJlY2F1c2VcbiAqIHRoZXkgaGF2ZSBkZXBlbmRlbmNpZXMgdGhhdCBhcmUgbWlzc2luZyAoZGlyZWN0bHkgb3IgdHJhbnNpdGl2ZWx5KS5cbiAqXG4gKiBUaGlzIG1pZ2h0IG5vdCBiZSBhbiBlcnJvciwgYmVjYXVzZSBzdWNoIGFuIGVudHJ5IHBvaW50IG1pZ2h0IG5vdCBhY3R1YWxseSBiZSB1c2VkXG4gKiBpbiB0aGUgYXBwbGljYXRpb24uIElmIGl0IGlzIHVzZWQgdGhlbiB0aGUgYG5nY2AgYXBwbGljYXRpb24gY29tcGlsYXRpb24gd291bGRcbiAqIGZhaWwgYWxzbywgc28gd2UgZG9uJ3QgbmVlZCBuZ2NjIHRvIGNhdGNoIHRoaXMuXG4gKlxuICogRm9yIGV4YW1wbGUsIGNvbnNpZGVyIGFuIGFwcGxpY2F0aW9uIHRoYXQgdXNlcyB0aGUgYEBhbmd1bGFyL3JvdXRlcmAgcGFja2FnZS5cbiAqIFRoaXMgcGFja2FnZSBpbmNsdWRlcyBhbiBlbnRyeS1wb2ludCBjYWxsZWQgYEBhbmd1bGFyL3JvdXRlci91cGdyYWRlYCwgd2hpY2ggaGFzIGEgZGVwZW5kZW5jeVxuICogb24gdGhlIGBAYW5ndWxhci91cGdyYWRlYCBwYWNrYWdlLlxuICogSWYgdGhlIGFwcGxpY2F0aW9uIG5ldmVyIHVzZXMgY29kZSBmcm9tIGBAYW5ndWxhci9yb3V0ZXIvdXBncmFkZWAgdGhlbiB0aGVyZSBpcyBubyBuZWVkIGZvclxuICogYEBhbmd1bGFyL3VwZ3JhZGVgIHRvIGJlIGluc3RhbGxlZC5cbiAqIEluIHRoaXMgY2FzZSB0aGUgbmdjYyB0b29sIHNob3VsZCBqdXN0IGlnbm9yZSB0aGUgYEBhbmd1bGFyL3JvdXRlci91cGdyYWRlYCBlbmQtcG9pbnQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSW52YWxpZEVudHJ5UG9pbnQge1xuICBlbnRyeVBvaW50OiBFbnRyeVBvaW50O1xuICBtaXNzaW5nRGVwZW5kZW5jaWVzOiBzdHJpbmdbXTtcbn1cblxuLyoqXG4gKiBIb2xkcyBpbmZvcm1hdGlvbiBhYm91dCBkZXBlbmRlbmNpZXMgb2YgYW4gZW50cnktcG9pbnQgdGhhdCBkbyBub3QgbmVlZCB0byBiZSBwcm9jZXNzZWRcbiAqIGJ5IHRoZSBuZ2NjIHRvb2wuXG4gKlxuICogRm9yIGV4YW1wbGUsIHRoZSBgcnhqc2AgcGFja2FnZSBkb2VzIG5vdCBjb250YWluIGFueSBBbmd1bGFyIGRlY29yYXRvcnMgdGhhdCBuZWVkIHRvIGJlXG4gKiBjb21waWxlZCBhbmQgc28gdGhpcyBjYW4gYmUgc2FmZWx5IGlnbm9yZWQgYnkgbmdjYy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJZ25vcmVkRGVwZW5kZW5jeSB7XG4gIGVudHJ5UG9pbnQ6IEVudHJ5UG9pbnQ7XG4gIGRlcGVuZGVuY3lQYXRoOiBzdHJpbmc7XG59XG5cbi8qKlxuICogVGhlIHJlc3VsdCBvZiBzb3J0aW5nIHRoZSBlbnRyeS1wb2ludHMgYnkgdGhlaXIgZGVwZW5kZW5jaWVzLlxuICpcbiAqIFRoZSBgZW50cnlQb2ludHNgIGFycmF5IHdpbGwgYmUgb3JkZXJlZCBzbyB0aGF0IG5vIGVudHJ5IHBvaW50IGRlcGVuZHMgdXBvbiBhbiBlbnRyeSBwb2ludCB0aGF0XG4gKiBhcHBlYXJzIGxhdGVyIGluIHRoZSBhcnJheS5cbiAqXG4gKiBTb21lIGVudHJ5IHBvaW50cyBvciB0aGVpciBkZXBlbmRlbmNpZXMgbWF5IGJlIGhhdmUgYmVlbiBpZ25vcmVkLiBUaGVzZSBhcmUgY2FwdHVyZWQgZm9yXG4gKiBkaWFnbm9zdGljIHB1cnBvc2VzIGluIGBpbnZhbGlkRW50cnlQb2ludHNgIGFuZCBgaWdub3JlZERlcGVuZGVuY2llc2AgcmVzcGVjdGl2ZWx5LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNvcnRlZEVudHJ5UG9pbnRzSW5mbyB7XG4gIGVudHJ5UG9pbnRzOiBFbnRyeVBvaW50W107XG4gIGludmFsaWRFbnRyeVBvaW50czogSW52YWxpZEVudHJ5UG9pbnRbXTtcbiAgaWdub3JlZERlcGVuZGVuY2llczogSWdub3JlZERlcGVuZGVuY3lbXTtcbn1cblxuLyoqXG4gKiBBIGNsYXNzIHRoYXQgcmVzb2x2ZXMgZGVwZW5kZW5jaWVzIGJldHdlZW4gZW50cnktcG9pbnRzLlxuICovXG5leHBvcnQgY2xhc3MgRGVwZW5kZW5jeVJlc29sdmVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBob3N0OiBEZXBlbmRlbmN5SG9zdCkge31cbiAgLyoqXG4gICAqIFNvcnQgdGhlIGFycmF5IG9mIGVudHJ5IHBvaW50cyBzbyB0aGF0IHRoZSBkZXBlbmRhbnQgZW50cnkgcG9pbnRzIGFsd2F5cyBjb21lIGxhdGVyIHRoYW5cbiAgICogdGhlaXIgZGVwZW5kZW5jaWVzIGluIHRoZSBhcnJheS5cbiAgICogQHBhcmFtIGVudHJ5UG9pbnRzIEFuIGFycmF5IGVudHJ5IHBvaW50cyB0byBzb3J0LlxuICAgKiBAcmV0dXJucyB0aGUgcmVzdWx0IG9mIHNvcnRpbmcgdGhlIGVudHJ5IHBvaW50cy5cbiAgICovXG4gIHNvcnRFbnRyeVBvaW50c0J5RGVwZW5kZW5jeShlbnRyeVBvaW50czogRW50cnlQb2ludFtdKTogU29ydGVkRW50cnlQb2ludHNJbmZvIHtcbiAgICBjb25zdCBpbnZhbGlkRW50cnlQb2ludHM6IEludmFsaWRFbnRyeVBvaW50W10gPSBbXTtcbiAgICBjb25zdCBpZ25vcmVkRGVwZW5kZW5jaWVzOiBJZ25vcmVkRGVwZW5kZW5jeVtdID0gW107XG4gICAgY29uc3QgZ3JhcGggPSBuZXcgRGVwR3JhcGg8RW50cnlQb2ludD4oKTtcblxuICAgIC8vIEFkZCB0aGUgZW50cnkgcG9udHMgdG8gdGhlIGdyYXBoIGFzIG5vZGVzXG4gICAgZW50cnlQb2ludHMuZm9yRWFjaChlbnRyeVBvaW50ID0+IGdyYXBoLmFkZE5vZGUoZW50cnlQb2ludC5wYXRoLCBlbnRyeVBvaW50KSk7XG5cbiAgICAvLyBOb3cgYWRkIHRoZSBkZXBlbmRlbmNpZXMgYmV0d2VlbiB0aGVtXG4gICAgZW50cnlQb2ludHMuZm9yRWFjaChlbnRyeVBvaW50ID0+IHtcbiAgICAgIGNvbnN0IGVudHJ5UG9pbnRQYXRoID0gZW50cnlQb2ludC5mZXNtMjAxNSB8fCBlbnRyeVBvaW50LmVzbTIwMTU7XG4gICAgICBpZiAoIWVudHJ5UG9pbnRQYXRoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBFU00yMDE1IGZvcm1hdCAoZmxhdCBhbmQgbm9uLWZsYXQpIG1pc3NpbmcgaW4gJyR7ZW50cnlQb2ludC5wYXRofScgZW50cnktcG9pbnQuYCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgY29uc3QgbWlzc2luZyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgY29uc3QgZGVlcEltcG9ydHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgIHRoaXMuaG9zdC5jb21wdXRlRGVwZW5kZW5jaWVzKGVudHJ5UG9pbnRQYXRoLCBkZXBlbmRlbmNpZXMsIG1pc3NpbmcsIGRlZXBJbXBvcnRzKTtcblxuICAgICAgaWYgKG1pc3Npbmcuc2l6ZSA+IDApIHtcbiAgICAgICAgLy8gVGhpcyBlbnRyeSBwb2ludCBoYXMgZGVwZW5kZW5jaWVzIHRoYXQgYXJlIG1pc3NpbmdcbiAgICAgICAgLy8gc28gcmVtb3ZlIGl0IGZyb20gdGhlIGdyYXBoLlxuICAgICAgICByZW1vdmVOb2RlcyhlbnRyeVBvaW50LCBBcnJheS5mcm9tKG1pc3NpbmcpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlcGVuZGVuY2llcy5mb3JFYWNoKGRlcGVuZGVuY3lQYXRoID0+IHtcbiAgICAgICAgICBpZiAoZ3JhcGguaGFzTm9kZShkZXBlbmRlbmN5UGF0aCkpIHtcbiAgICAgICAgICAgIC8vIFRoZSBkZXBlbmRlbmN5IHBhdGggbWFwcyB0byBhbiBlbnRyeSBwb2ludCB0aGF0IGV4aXN0cyBpbiB0aGUgZ3JhcGhcbiAgICAgICAgICAgIC8vIHNvIGFkZCB0aGUgZGVwZW5kZW5jeS5cbiAgICAgICAgICAgIGdyYXBoLmFkZERlcGVuZGVuY3koZW50cnlQb2ludC5wYXRoLCBkZXBlbmRlbmN5UGF0aCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChpbnZhbGlkRW50cnlQb2ludHMuc29tZShpID0+IGkuZW50cnlQb2ludC5wYXRoID09PSBkZXBlbmRlbmN5UGF0aCkpIHtcbiAgICAgICAgICAgIC8vIFRoZSBkZXBlbmRlbmN5IHBhdGggbWFwcyB0byBhbiBlbnRyeS1wb2ludCB0aGF0IHdhcyBwcmV2aW91c2x5IHJlbW92ZWRcbiAgICAgICAgICAgIC8vIGZyb20gdGhlIGdyYXBoLCBzbyByZW1vdmUgdGhpcyBlbnRyeS1wb2ludCBhcyB3ZWxsLlxuICAgICAgICAgICAgcmVtb3ZlTm9kZXMoZW50cnlQb2ludCwgW2RlcGVuZGVuY3lQYXRoXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRoZSBkZXBlbmRlbmN5IHBhdGggcG9pbnRzIHRvIGEgcGFja2FnZSB0aGF0IG5nY2MgZG9lcyBub3QgY2FyZSBhYm91dC5cbiAgICAgICAgICAgIGlnbm9yZWREZXBlbmRlbmNpZXMucHVzaCh7ZW50cnlQb2ludCwgZGVwZW5kZW5jeVBhdGh9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGVlcEltcG9ydHMuc2l6ZSkge1xuICAgICAgICBjb25zdCBpbXBvcnRzID0gQXJyYXkuZnJvbShkZWVwSW1wb3J0cykubWFwKGkgPT4gYCcke2l9J2ApLmpvaW4oJywgJyk7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgIGBFbnRyeSBwb2ludCAnJHtlbnRyeVBvaW50Lm5hbWV9JyBjb250YWlucyBkZWVwIGltcG9ydHMgaW50byAke2ltcG9ydHN9LiBgICtcbiAgICAgICAgICAgIGBUaGlzIGlzIHByb2JhYmx5IG5vdCBhIHByb2JsZW0sIGJ1dCBtYXkgY2F1c2UgdGhlIGNvbXBpbGF0aW9uIG9mIGVudHJ5IHBvaW50cyB0byBiZSBvdXQgb2Ygb3JkZXIuYCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBUaGUgbWFwIG5vdyBvbmx5IGhvbGRzIGVudHJ5LXBvaW50cyB0aGF0IG5nY2MgY2FyZXMgYWJvdXQgYW5kIHdob3NlIGRlcGVuZGVuY2llc1xuICAgIC8vIChkaXJlY3QgYW5kIHRyYW5zaXRpdmUpIGFsbCBleGlzdC5cbiAgICByZXR1cm4ge1xuICAgICAgZW50cnlQb2ludHM6IGdyYXBoLm92ZXJhbGxPcmRlcigpLm1hcChwYXRoID0+IGdyYXBoLmdldE5vZGVEYXRhKHBhdGgpKSxcbiAgICAgIGludmFsaWRFbnRyeVBvaW50cyxcbiAgICAgIGlnbm9yZWREZXBlbmRlbmNpZXNcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gcmVtb3ZlTm9kZXMoZW50cnlQb2ludDogRW50cnlQb2ludCwgbWlzc2luZ0RlcGVuZGVuY2llczogc3RyaW5nW10pIHtcbiAgICAgIGNvbnN0IG5vZGVzVG9SZW1vdmUgPSBbZW50cnlQb2ludC5wYXRoLCAuLi5ncmFwaC5kZXBlbmRhbnRzT2YoZW50cnlQb2ludC5wYXRoKV07XG4gICAgICBub2Rlc1RvUmVtb3ZlLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgIGludmFsaWRFbnRyeVBvaW50cy5wdXNoKHtlbnRyeVBvaW50OiBncmFwaC5nZXROb2RlRGF0YShub2RlKSwgbWlzc2luZ0RlcGVuZGVuY2llc30pO1xuICAgICAgICBncmFwaC5yZW1vdmVOb2RlKG5vZGUpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG4iXX0=