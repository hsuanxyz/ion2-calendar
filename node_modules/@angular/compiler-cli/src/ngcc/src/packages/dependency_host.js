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
        define("@angular/compiler-cli/src/ngcc/src/packages/dependency_host", ["require", "exports", "canonical-path", "fs", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var path = require("canonical-path");
    var fs = require("fs");
    var ts = require("typescript");
    /**
     * Helper functions for computing dependencies.
     */
    var DependencyHost = /** @class */ (function () {
        function DependencyHost() {
        }
        /**
         * Get a list of the resolved paths to all the dependencies of this entry point.
         * @param from An absolute path to the file whose dependencies we want to get.
         * @param resolved A set that will have the absolute paths of resolved entry points added to it.
         * @param missing A set that will have the dependencies that could not be found added to it.
         * @param deepImports A set that will have the import paths that exist but cannot be mapped to
         * entry-points, i.e. deep-imports.
         * @param internal A set that is used to track internal dependencies to prevent getting stuck in a
         * circular dependency loop.
         */
        DependencyHost.prototype.computeDependencies = function (from, resolved, missing, deepImports, internal) {
            var _this = this;
            if (internal === void 0) { internal = new Set(); }
            var fromContents = fs.readFileSync(from, 'utf8');
            if (!this.hasImportOrReexportStatements(fromContents)) {
                return;
            }
            // Parse the source into a TypeScript AST and then walk it looking for imports and re-exports.
            var sf = ts.createSourceFile(from, fromContents, ts.ScriptTarget.ES2015, false, ts.ScriptKind.JS);
            sf.statements
                // filter out statements that are not imports or reexports
                .filter(this.isStringImportOrReexport)
                // Grab the id of the module that is being imported
                .map(function (stmt) { return stmt.moduleSpecifier.text; })
                // Resolve this module id into an absolute path
                .forEach(function (importPath) {
                if (importPath.startsWith('.')) {
                    // This is an internal import so follow it
                    var internalDependency = _this.resolveInternal(from, importPath);
                    // Avoid circular dependencies
                    if (!internal.has(internalDependency)) {
                        internal.add(internalDependency);
                        _this.computeDependencies(internalDependency, resolved, missing, deepImports, internal);
                    }
                }
                else {
                    var resolvedEntryPoint = _this.tryResolveEntryPoint(from, importPath);
                    if (resolvedEntryPoint !== null) {
                        resolved.add(resolvedEntryPoint);
                    }
                    else {
                        // If the import could not be resolved as entry point, it either does not exist
                        // at all or is a deep import.
                        var deeplyImportedFile = _this.tryResolve(from, importPath);
                        if (deeplyImportedFile !== null) {
                            deepImports.add(importPath);
                        }
                        else {
                            missing.add(importPath);
                        }
                    }
                }
            });
        };
        /**
         * Resolve an internal module import.
         * @param from the absolute file path from where to start trying to resolve this module
         * @param to the module specifier of the internal dependency to resolve
         * @returns the resolved path to the import.
         */
        DependencyHost.prototype.resolveInternal = function (from, to) {
            var fromDirectory = path.dirname(from);
            // `fromDirectory` is absolute so we don't need to worry about telling `require.resolve`
            // about it - unlike `tryResolve` below.
            return require.resolve(path.resolve(fromDirectory, to));
        };
        /**
         * We don't want to resolve external dependencies directly because if it is a path to a
         * sub-entry-point (e.g. @angular/animations/browser rather than @angular/animations)
         * then `require.resolve()` may return a path to a UMD bundle, which may actually live
         * in the folder containing the sub-entry-point
         * (e.g. @angular/animations/bundles/animations-browser.umd.js).
         *
         * Instead we try to resolve it as a package, which is what we would need anyway for it to be
         * compilable by ngcc.
         *
         * If `to` is actually a path to a file then this will fail, which is what we want.
         *
         * @param from the file path from where to start trying to resolve this module
         * @param to the module specifier of the dependency to resolve
         * @returns the resolved path to the entry point directory of the import or null
         * if it cannot be resolved.
         */
        DependencyHost.prototype.tryResolveEntryPoint = function (from, to) {
            var entryPoint = this.tryResolve(from, to + "/package.json");
            return entryPoint && path.dirname(entryPoint);
        };
        /**
         * Resolve the absolute path of a module from a particular starting point.
         *
         * @param from the file path from where to start trying to resolve this module
         * @param to the module specifier of the dependency to resolve
         * @returns an absolute path to the entry-point of the dependency or null if it could not be
         * resolved.
         */
        DependencyHost.prototype.tryResolve = function (from, to) {
            try {
                return require.resolve(to, { paths: [from] });
            }
            catch (e) {
                return null;
            }
        };
        /**
         * Check whether the given statement is an import with a string literal module specifier.
         * @param stmt the statement node to check.
         * @returns true if the statement is an import with a string literal module specifier.
         */
        DependencyHost.prototype.isStringImportOrReexport = function (stmt) {
            return ts.isImportDeclaration(stmt) ||
                ts.isExportDeclaration(stmt) && !!stmt.moduleSpecifier &&
                    ts.isStringLiteral(stmt.moduleSpecifier);
        };
        /**
         * Check whether a source file needs to be parsed for imports.
         * This is a performance short-circuit, which saves us from creating
         * a TypeScript AST unnecessarily.
         *
         * @param source The content of the source file to check.
         *
         * @returns false if there are definitely no import or re-export statements
         * in this file, true otherwise.
         */
        DependencyHost.prototype.hasImportOrReexportStatements = function (source) {
            return /(import|export)\s.+from/.test(source);
        };
        return DependencyHost;
    }());
    exports.DependencyHost = DependencyHost;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwZW5kZW5jeV9ob3N0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ2NjL3NyYy9wYWNrYWdlcy9kZXBlbmRlbmN5X2hvc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSCxxQ0FBdUM7SUFDdkMsdUJBQXlCO0lBQ3pCLCtCQUFpQztJQUVqQzs7T0FFRztJQUNIO1FBQUE7UUFvSUEsQ0FBQztRQW5JQzs7Ozs7Ozs7O1dBU0c7UUFDSCw0Q0FBbUIsR0FBbkIsVUFDSSxJQUFZLEVBQUUsUUFBcUIsRUFBRSxPQUFvQixFQUFFLFdBQXdCLEVBQ25GLFFBQWlDO1lBRnJDLGlCQTJDQztZQXpDRyx5QkFBQSxFQUFBLGVBQTRCLEdBQUcsRUFBRTtZQUNuQyxJQUFNLFlBQVksR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUNyRCxPQUFPO2FBQ1I7WUFFRCw4RkFBOEY7WUFDOUYsSUFBTSxFQUFFLEdBQ0osRUFBRSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDN0YsRUFBRSxDQUFDLFVBQVU7Z0JBQ1QsMERBQTBEO2lCQUN6RCxNQUFNLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDO2dCQUN0QyxtREFBbUQ7aUJBQ2xELEdBQUcsQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUF6QixDQUF5QixDQUFDO2dCQUN2QywrQ0FBK0M7aUJBQzlDLE9BQU8sQ0FB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Q0FBYyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdjYW5vbmljYWwtcGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb25zIGZvciBjb21wdXRpbmcgZGVwZW5kZW5jaWVzLlxuICovXG5leHBvcnQgY2xhc3MgRGVwZW5kZW5jeUhvc3Qge1xuICAvKipcbiAgICogR2V0IGEgbGlzdCBvZiB0aGUgcmVzb2x2ZWQgcGF0aHMgdG8gYWxsIHRoZSBkZXBlbmRlbmNpZXMgb2YgdGhpcyBlbnRyeSBwb2ludC5cbiAgICogQHBhcmFtIGZyb20gQW4gYWJzb2x1dGUgcGF0aCB0byB0aGUgZmlsZSB3aG9zZSBkZXBlbmRlbmNpZXMgd2Ugd2FudCB0byBnZXQuXG4gICAqIEBwYXJhbSByZXNvbHZlZCBBIHNldCB0aGF0IHdpbGwgaGF2ZSB0aGUgYWJzb2x1dGUgcGF0aHMgb2YgcmVzb2x2ZWQgZW50cnkgcG9pbnRzIGFkZGVkIHRvIGl0LlxuICAgKiBAcGFyYW0gbWlzc2luZyBBIHNldCB0aGF0IHdpbGwgaGF2ZSB0aGUgZGVwZW5kZW5jaWVzIHRoYXQgY291bGQgbm90IGJlIGZvdW5kIGFkZGVkIHRvIGl0LlxuICAgKiBAcGFyYW0gZGVlcEltcG9ydHMgQSBzZXQgdGhhdCB3aWxsIGhhdmUgdGhlIGltcG9ydCBwYXRocyB0aGF0IGV4aXN0IGJ1dCBjYW5ub3QgYmUgbWFwcGVkIHRvXG4gICAqIGVudHJ5LXBvaW50cywgaS5lLiBkZWVwLWltcG9ydHMuXG4gICAqIEBwYXJhbSBpbnRlcm5hbCBBIHNldCB0aGF0IGlzIHVzZWQgdG8gdHJhY2sgaW50ZXJuYWwgZGVwZW5kZW5jaWVzIHRvIHByZXZlbnQgZ2V0dGluZyBzdHVjayBpbiBhXG4gICAqIGNpcmN1bGFyIGRlcGVuZGVuY3kgbG9vcC5cbiAgICovXG4gIGNvbXB1dGVEZXBlbmRlbmNpZXMoXG4gICAgICBmcm9tOiBzdHJpbmcsIHJlc29sdmVkOiBTZXQ8c3RyaW5nPiwgbWlzc2luZzogU2V0PHN0cmluZz4sIGRlZXBJbXBvcnRzOiBTZXQ8c3RyaW5nPixcbiAgICAgIGludGVybmFsOiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoKSk6IHZvaWQge1xuICAgIGNvbnN0IGZyb21Db250ZW50cyA9IGZzLnJlYWRGaWxlU3luYyhmcm9tLCAndXRmOCcpO1xuICAgIGlmICghdGhpcy5oYXNJbXBvcnRPclJlZXhwb3J0U3RhdGVtZW50cyhmcm9tQ29udGVudHMpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUGFyc2UgdGhlIHNvdXJjZSBpbnRvIGEgVHlwZVNjcmlwdCBBU1QgYW5kIHRoZW4gd2FsayBpdCBsb29raW5nIGZvciBpbXBvcnRzIGFuZCByZS1leHBvcnRzLlxuICAgIGNvbnN0IHNmID1cbiAgICAgICAgdHMuY3JlYXRlU291cmNlRmlsZShmcm9tLCBmcm9tQ29udGVudHMsIHRzLlNjcmlwdFRhcmdldC5FUzIwMTUsIGZhbHNlLCB0cy5TY3JpcHRLaW5kLkpTKTtcbiAgICBzZi5zdGF0ZW1lbnRzXG4gICAgICAgIC8vIGZpbHRlciBvdXQgc3RhdGVtZW50cyB0aGF0IGFyZSBub3QgaW1wb3J0cyBvciByZWV4cG9ydHNcbiAgICAgICAgLmZpbHRlcih0aGlzLmlzU3RyaW5nSW1wb3J0T3JSZWV4cG9ydClcbiAgICAgICAgLy8gR3JhYiB0aGUgaWQgb2YgdGhlIG1vZHVsZSB0aGF0IGlzIGJlaW5nIGltcG9ydGVkXG4gICAgICAgIC5tYXAoc3RtdCA9PiBzdG10Lm1vZHVsZVNwZWNpZmllci50ZXh0KVxuICAgICAgICAvLyBSZXNvbHZlIHRoaXMgbW9kdWxlIGlkIGludG8gYW4gYWJzb2x1dGUgcGF0aFxuICAgICAgICAuZm9yRWFjaChpbXBvcnRQYXRoID0+IHtcbiAgICAgICAgICBpZiAoaW1wb3J0UGF0aC5zdGFydHNXaXRoKCcuJykpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgaXMgYW4gaW50ZXJuYWwgaW1wb3J0IHNvIGZvbGxvdyBpdFxuICAgICAgICAgICAgY29uc3QgaW50ZXJuYWxEZXBlbmRlbmN5ID0gdGhpcy5yZXNvbHZlSW50ZXJuYWwoZnJvbSwgaW1wb3J0UGF0aCk7XG4gICAgICAgICAgICAvLyBBdm9pZCBjaXJjdWxhciBkZXBlbmRlbmNpZXNcbiAgICAgICAgICAgIGlmICghaW50ZXJuYWwuaGFzKGludGVybmFsRGVwZW5kZW5jeSkpIHtcbiAgICAgICAgICAgICAgaW50ZXJuYWwuYWRkKGludGVybmFsRGVwZW5kZW5jeSk7XG4gICAgICAgICAgICAgIHRoaXMuY29tcHV0ZURlcGVuZGVuY2llcyhcbiAgICAgICAgICAgICAgICAgIGludGVybmFsRGVwZW5kZW5jeSwgcmVzb2x2ZWQsIG1pc3NpbmcsIGRlZXBJbXBvcnRzLCBpbnRlcm5hbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc29sdmVkRW50cnlQb2ludCA9IHRoaXMudHJ5UmVzb2x2ZUVudHJ5UG9pbnQoZnJvbSwgaW1wb3J0UGF0aCk7XG4gICAgICAgICAgICBpZiAocmVzb2x2ZWRFbnRyeVBvaW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIHJlc29sdmVkLmFkZChyZXNvbHZlZEVudHJ5UG9pbnQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gSWYgdGhlIGltcG9ydCBjb3VsZCBub3QgYmUgcmVzb2x2ZWQgYXMgZW50cnkgcG9pbnQsIGl0IGVpdGhlciBkb2VzIG5vdCBleGlzdFxuICAgICAgICAgICAgICAvLyBhdCBhbGwgb3IgaXMgYSBkZWVwIGltcG9ydC5cbiAgICAgICAgICAgICAgY29uc3QgZGVlcGx5SW1wb3J0ZWRGaWxlID0gdGhpcy50cnlSZXNvbHZlKGZyb20sIGltcG9ydFBhdGgpO1xuICAgICAgICAgICAgICBpZiAoZGVlcGx5SW1wb3J0ZWRGaWxlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZGVlcEltcG9ydHMuYWRkKGltcG9ydFBhdGgpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1pc3NpbmcuYWRkKGltcG9ydFBhdGgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlIGFuIGludGVybmFsIG1vZHVsZSBpbXBvcnQuXG4gICAqIEBwYXJhbSBmcm9tIHRoZSBhYnNvbHV0ZSBmaWxlIHBhdGggZnJvbSB3aGVyZSB0byBzdGFydCB0cnlpbmcgdG8gcmVzb2x2ZSB0aGlzIG1vZHVsZVxuICAgKiBAcGFyYW0gdG8gdGhlIG1vZHVsZSBzcGVjaWZpZXIgb2YgdGhlIGludGVybmFsIGRlcGVuZGVuY3kgdG8gcmVzb2x2ZVxuICAgKiBAcmV0dXJucyB0aGUgcmVzb2x2ZWQgcGF0aCB0byB0aGUgaW1wb3J0LlxuICAgKi9cbiAgcmVzb2x2ZUludGVybmFsKGZyb206IHN0cmluZywgdG86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgZnJvbURpcmVjdG9yeSA9IHBhdGguZGlybmFtZShmcm9tKTtcbiAgICAvLyBgZnJvbURpcmVjdG9yeWAgaXMgYWJzb2x1dGUgc28gd2UgZG9uJ3QgbmVlZCB0byB3b3JyeSBhYm91dCB0ZWxsaW5nIGByZXF1aXJlLnJlc29sdmVgXG4gICAgLy8gYWJvdXQgaXQgLSB1bmxpa2UgYHRyeVJlc29sdmVgIGJlbG93LlxuICAgIHJldHVybiByZXF1aXJlLnJlc29sdmUocGF0aC5yZXNvbHZlKGZyb21EaXJlY3RvcnksIHRvKSk7XG4gIH1cblxuICAvKipcbiAgICogV2UgZG9uJ3Qgd2FudCB0byByZXNvbHZlIGV4dGVybmFsIGRlcGVuZGVuY2llcyBkaXJlY3RseSBiZWNhdXNlIGlmIGl0IGlzIGEgcGF0aCB0byBhXG4gICAqIHN1Yi1lbnRyeS1wb2ludCAoZS5nLiBAYW5ndWxhci9hbmltYXRpb25zL2Jyb3dzZXIgcmF0aGVyIHRoYW4gQGFuZ3VsYXIvYW5pbWF0aW9ucylcbiAgICogdGhlbiBgcmVxdWlyZS5yZXNvbHZlKClgIG1heSByZXR1cm4gYSBwYXRoIHRvIGEgVU1EIGJ1bmRsZSwgd2hpY2ggbWF5IGFjdHVhbGx5IGxpdmVcbiAgICogaW4gdGhlIGZvbGRlciBjb250YWluaW5nIHRoZSBzdWItZW50cnktcG9pbnRcbiAgICogKGUuZy4gQGFuZ3VsYXIvYW5pbWF0aW9ucy9idW5kbGVzL2FuaW1hdGlvbnMtYnJvd3Nlci51bWQuanMpLlxuICAgKlxuICAgKiBJbnN0ZWFkIHdlIHRyeSB0byByZXNvbHZlIGl0IGFzIGEgcGFja2FnZSwgd2hpY2ggaXMgd2hhdCB3ZSB3b3VsZCBuZWVkIGFueXdheSBmb3IgaXQgdG8gYmVcbiAgICogY29tcGlsYWJsZSBieSBuZ2NjLlxuICAgKlxuICAgKiBJZiBgdG9gIGlzIGFjdHVhbGx5IGEgcGF0aCB0byBhIGZpbGUgdGhlbiB0aGlzIHdpbGwgZmFpbCwgd2hpY2ggaXMgd2hhdCB3ZSB3YW50LlxuICAgKlxuICAgKiBAcGFyYW0gZnJvbSB0aGUgZmlsZSBwYXRoIGZyb20gd2hlcmUgdG8gc3RhcnQgdHJ5aW5nIHRvIHJlc29sdmUgdGhpcyBtb2R1bGVcbiAgICogQHBhcmFtIHRvIHRoZSBtb2R1bGUgc3BlY2lmaWVyIG9mIHRoZSBkZXBlbmRlbmN5IHRvIHJlc29sdmVcbiAgICogQHJldHVybnMgdGhlIHJlc29sdmVkIHBhdGggdG8gdGhlIGVudHJ5IHBvaW50IGRpcmVjdG9yeSBvZiB0aGUgaW1wb3J0IG9yIG51bGxcbiAgICogaWYgaXQgY2Fubm90IGJlIHJlc29sdmVkLlxuICAgKi9cbiAgdHJ5UmVzb2x2ZUVudHJ5UG9pbnQoZnJvbTogc3RyaW5nLCB0bzogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICAgIGNvbnN0IGVudHJ5UG9pbnQgPSB0aGlzLnRyeVJlc29sdmUoZnJvbSwgYCR7dG99L3BhY2thZ2UuanNvbmApO1xuICAgIHJldHVybiBlbnRyeVBvaW50ICYmIHBhdGguZGlybmFtZShlbnRyeVBvaW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlIHRoZSBhYnNvbHV0ZSBwYXRoIG9mIGEgbW9kdWxlIGZyb20gYSBwYXJ0aWN1bGFyIHN0YXJ0aW5nIHBvaW50LlxuICAgKlxuICAgKiBAcGFyYW0gZnJvbSB0aGUgZmlsZSBwYXRoIGZyb20gd2hlcmUgdG8gc3RhcnQgdHJ5aW5nIHRvIHJlc29sdmUgdGhpcyBtb2R1bGVcbiAgICogQHBhcmFtIHRvIHRoZSBtb2R1bGUgc3BlY2lmaWVyIG9mIHRoZSBkZXBlbmRlbmN5IHRvIHJlc29sdmVcbiAgICogQHJldHVybnMgYW4gYWJzb2x1dGUgcGF0aCB0byB0aGUgZW50cnktcG9pbnQgb2YgdGhlIGRlcGVuZGVuY3kgb3IgbnVsbCBpZiBpdCBjb3VsZCBub3QgYmVcbiAgICogcmVzb2x2ZWQuXG4gICAqL1xuICB0cnlSZXNvbHZlKGZyb206IHN0cmluZywgdG86IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHJlcXVpcmUucmVzb2x2ZSh0bywge3BhdGhzOiBbZnJvbV19KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGUgZ2l2ZW4gc3RhdGVtZW50IGlzIGFuIGltcG9ydCB3aXRoIGEgc3RyaW5nIGxpdGVyYWwgbW9kdWxlIHNwZWNpZmllci5cbiAgICogQHBhcmFtIHN0bXQgdGhlIHN0YXRlbWVudCBub2RlIHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyB0cnVlIGlmIHRoZSBzdGF0ZW1lbnQgaXMgYW4gaW1wb3J0IHdpdGggYSBzdHJpbmcgbGl0ZXJhbCBtb2R1bGUgc3BlY2lmaWVyLlxuICAgKi9cbiAgaXNTdHJpbmdJbXBvcnRPclJlZXhwb3J0KHN0bXQ6IHRzLlN0YXRlbWVudCk6IHN0bXQgaXMgdHMuSW1wb3J0RGVjbGFyYXRpb24mXG4gICAgICB7bW9kdWxlU3BlY2lmaWVyOiB0cy5TdHJpbmdMaXRlcmFsfSB7XG4gICAgcmV0dXJuIHRzLmlzSW1wb3J0RGVjbGFyYXRpb24oc3RtdCkgfHxcbiAgICAgICAgdHMuaXNFeHBvcnREZWNsYXJhdGlvbihzdG10KSAmJiAhIXN0bXQubW9kdWxlU3BlY2lmaWVyICYmXG4gICAgICAgIHRzLmlzU3RyaW5nTGl0ZXJhbChzdG10Lm1vZHVsZVNwZWNpZmllcik7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciBhIHNvdXJjZSBmaWxlIG5lZWRzIHRvIGJlIHBhcnNlZCBmb3IgaW1wb3J0cy5cbiAgICogVGhpcyBpcyBhIHBlcmZvcm1hbmNlIHNob3J0LWNpcmN1aXQsIHdoaWNoIHNhdmVzIHVzIGZyb20gY3JlYXRpbmdcbiAgICogYSBUeXBlU2NyaXB0IEFTVCB1bm5lY2Vzc2FyaWx5LlxuICAgKlxuICAgKiBAcGFyYW0gc291cmNlIFRoZSBjb250ZW50IG9mIHRoZSBzb3VyY2UgZmlsZSB0byBjaGVjay5cbiAgICpcbiAgICogQHJldHVybnMgZmFsc2UgaWYgdGhlcmUgYXJlIGRlZmluaXRlbHkgbm8gaW1wb3J0IG9yIHJlLWV4cG9ydCBzdGF0ZW1lbnRzXG4gICAqIGluIHRoaXMgZmlsZSwgdHJ1ZSBvdGhlcndpc2UuXG4gICAqL1xuICBoYXNJbXBvcnRPclJlZXhwb3J0U3RhdGVtZW50cyhzb3VyY2U6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAvKGltcG9ydHxleHBvcnQpXFxzLitmcm9tLy50ZXN0KHNvdXJjZSk7XG4gIH1cbn1cbiJdfQ==