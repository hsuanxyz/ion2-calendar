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
        define("@angular/compiler-cli/src/ngcc/src/packages/entry_point", ["require", "exports", "canonical-path", "fs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var path = require("canonical-path");
    var fs = require("fs");
    /**
     * Parses the JSON from a package.json file.
     * @param packageJsonPath the absolute path to the package.json file.
     * @returns JSON from the package.json file if it is valid, `null` otherwise.
     */
    function loadEntryPointPackage(packageJsonPath) {
        try {
            return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        }
        catch (e) {
            // We may have run into a package.json with unexpected symbols
            console.warn("Failed to read entry point info from " + packageJsonPath + " with error " + e + ".");
            return null;
        }
    }
    /**
     * Try to get an entry point from the given path.
     * @param packagePath the absolute path to the containing npm package
     * @param entryPointPath the absolute path to the potential entry point.
     * @returns Info about the entry point if it is valid, `null` otherwise.
     */
    function getEntryPointInfo(packagePath, entryPointPath) {
        var packageJsonPath = path.resolve(entryPointPath, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            return null;
        }
        var entryPointPackageJson = loadEntryPointPackage(packageJsonPath);
        if (!entryPointPackageJson) {
            return null;
        }
        // If there is `esm2015` then `es2015` will be FESM2015, otherwise ESM2015.
        // If there is `esm5` then `module` will be FESM5, otherwise it will be ESM5.
        var name = entryPointPackageJson.name, modulePath = entryPointPackageJson.module, types = entryPointPackageJson.types, _a = entryPointPackageJson.typings, typings = _a === void 0 ? types : _a, // synonymous
        es2015 = entryPointPackageJson.es2015, _b = entryPointPackageJson.fesm2015, fesm2015 = _b === void 0 ? es2015 : _b, // synonymous
        _c = entryPointPackageJson.fesm5, // synonymous
        fesm5 = _c === void 0 ? modulePath : _c, // synonymous
        esm2015 = entryPointPackageJson.esm2015, esm5 = entryPointPackageJson.esm5, main = entryPointPackageJson.main;
        // Minimum requirement is that we have typings and one of esm2015 or fesm2015 formats.
        if (!typings || !(fesm2015 || esm2015)) {
            return null;
        }
        // Also there must exist a `metadata.json` file next to the typings entry-point.
        var metadataPath = path.resolve(entryPointPath, typings.replace(/\.d\.ts$/, '') + '.metadata.json');
        if (!fs.existsSync(metadataPath)) {
            return null;
        }
        var entryPointInfo = {
            name: name,
            package: packagePath,
            path: entryPointPath,
            typings: path.resolve(entryPointPath, typings),
        };
        if (esm2015) {
            entryPointInfo.esm2015 = path.resolve(entryPointPath, esm2015);
        }
        if (fesm2015) {
            entryPointInfo.fesm2015 = path.resolve(entryPointPath, fesm2015);
        }
        if (fesm5) {
            entryPointInfo.fesm5 = path.resolve(entryPointPath, fesm5);
        }
        if (esm5) {
            entryPointInfo.esm5 = path.resolve(entryPointPath, esm5);
        }
        if (main) {
            entryPointInfo.umd = path.resolve(entryPointPath, main);
        }
        return entryPointInfo;
    }
    exports.getEntryPointInfo = getEntryPointInfo;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlfcG9pbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25nY2Mvc3JjL3BhY2thZ2VzL2VudHJ5X3BvaW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBRUgscUNBQXVDO0lBQ3ZDLHVCQUF5QjtJQWtEekI7Ozs7T0FJRztJQUNILFNBQVMscUJBQXFCLENBQUMsZUFBdUI7UUFDcEQsSUFBSTtZQUNGLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1NBQzdEO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDViw4REFBOEQ7WUFDOUQsT0FBTyxDQUFDLElBQUksQ0FBQywwQ0FBd0MsZUFBZSxvQkFBZSxDQUFDLE1BQUcsQ0FBQyxDQUFDO1lBQ3pGLE9BQU8sSUFBSSxDQUFDO1NBQ2I7SUFDSCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxTQUFnQixpQkFBaUIsQ0FBQyxXQUFtQixFQUFFLGNBQXNCO1FBQzNFLElBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ3JFLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxFQUFFO1lBQ25DLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxJQUFNLHFCQUFxQixHQUFHLHFCQUFxQixDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3JFLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtZQUMxQixPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsMkVBQTJFO1FBQzNFLDZFQUE2RTtRQUUzRSxJQUFBLGlDQUFJLEVBQ0oseUNBQWtCLEVBQ2xCLG1DQUFLLEVBQ0wsa0NBQWUsRUFBZixvQ0FBZSxFQUFHLGFBQWE7UUFDL0IscUNBQU0sRUFDTixtQ0FBaUIsRUFBakIsc0NBQWlCLEVBQUksYUFBYTtRQUNsQyxnQ0FBa0IsRUFERyxhQUFhO1FBQ2xDLHVDQUFrQixFQUFHLGFBQWE7UUFDbEMsdUNBQU8sRUFDUCxpQ0FBSSxFQUNKLGlDQUFJLENBQ29CO1FBQzFCLHNGQUFzRjtRQUN0RixJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxRQUFRLElBQUksT0FBTyxDQUFDLEVBQUU7WUFDdEMsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELGdGQUFnRjtRQUNoRixJQUFNLFlBQVksR0FDZCxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3JGLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQ2hDLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxJQUFNLGNBQWMsR0FBZTtZQUNqQyxJQUFJLE1BQUE7WUFDSixPQUFPLEVBQUUsV0FBVztZQUNwQixJQUFJLEVBQUUsY0FBYztZQUNwQixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDO1NBQy9DLENBQUM7UUFFRixJQUFJLE9BQU8sRUFBRTtZQUNYLGNBQWMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDaEU7UUFDRCxJQUFJLFFBQVEsRUFBRTtZQUNaLGNBQWMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDbEU7UUFDRCxJQUFJLEtBQUssRUFBRTtZQUNULGNBQWMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDNUQ7UUFDRCxJQUFJLElBQUksRUFBRTtZQUNSLGNBQWMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDMUQ7UUFDRCxJQUFJLElBQUksRUFBRTtZQUNSLGNBQWMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDekQ7UUFFRCxPQUFPLGNBQWMsQ0FBQztJQUN4QixDQUFDO0lBN0RELDhDQTZEQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdjYW5vbmljYWwtcGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5cblxuLyoqXG4gKiBBbiBvYmplY3QgY29udGFpbmluZyBwYXRocyB0byB0aGUgZW50cnktcG9pbnRzIGZvciBlYWNoIGZvcm1hdC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFbnRyeVBvaW50UGF0aHMge1xuICBlc201Pzogc3RyaW5nO1xuICBmZXNtNT86IHN0cmluZztcbiAgZXNtMjAxNT86IHN0cmluZztcbiAgZmVzbTIwMTU/OiBzdHJpbmc7XG4gIHVtZD86IHN0cmluZztcbn1cblxuLyoqXG4gKiBUaGUgcG9zc2libGUgdmFsdWVzIGZvciB0aGUgZm9ybWF0IG9mIGFuIGVudHJ5LXBvaW50LlxuICovXG5leHBvcnQgdHlwZSBFbnRyeVBvaW50Rm9ybWF0ID0ga2V5b2YoRW50cnlQb2ludFBhdGhzKTtcblxuLyoqXG4gKiBBbiBvYmplY3QgY29udGFpbmluZyBpbmZvcm1hdGlvbiBhYm91dCBhbiBlbnRyeS1wb2ludCwgaW5jbHVkaW5nIHBhdGhzXG4gKiB0byBlYWNoIG9mIHRoZSBwb3NzaWJsZSBlbnRyeS1wb2ludCBmb3JtYXRzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEVudHJ5UG9pbnQgZXh0ZW5kcyBFbnRyeVBvaW50UGF0aHMge1xuICAvKiogVGhlIG5hbWUgb2YgdGhlIHBhY2thZ2UgKGUuZy4gYEBhbmd1bGFyL2NvcmVgKS4gKi9cbiAgbmFtZTogc3RyaW5nO1xuICAvKiogVGhlIHBhdGggdG8gdGhlIHBhY2thZ2UgdGhhdCBjb250YWlucyB0aGlzIGVudHJ5LXBvaW50LiAqL1xuICBwYWNrYWdlOiBzdHJpbmc7XG4gIC8qKiBUaGUgcGF0aCB0byB0aGlzIGVudHJ5IHBvaW50LiAqL1xuICBwYXRoOiBzdHJpbmc7XG4gIC8qKiBUaGUgcGF0aCB0byBhIHR5cGluZ3MgKC5kLnRzKSBmaWxlIGZvciB0aGlzIGVudHJ5LXBvaW50LiAqL1xuICB0eXBpbmdzOiBzdHJpbmc7XG59XG5cbi8qKlxuICogVGhlIHByb3BlcnRpZXMgdGhhdCBtYXkgYmUgbG9hZGVkIGZyb20gdGhlIGBwYWNrYWdlLmpzb25gIGZpbGUuXG4gKi9cbmludGVyZmFjZSBFbnRyeVBvaW50UGFja2FnZUpzb24ge1xuICBuYW1lOiBzdHJpbmc7XG4gIGZlc20yMDE1Pzogc3RyaW5nO1xuICBmZXNtNT86IHN0cmluZztcbiAgZXMyMDE1Pzogc3RyaW5nOyAgLy8gaWYgZXhpc3RzIHRoZW4gaXQgaXMgYWN0dWFsbHkgRkVTTTIwMTVcbiAgZXNtMjAxNT86IHN0cmluZztcbiAgZXNtNT86IHN0cmluZztcbiAgbWFpbj86IHN0cmluZzsgICAgIC8vIFVNRFxuICBtb2R1bGU/OiBzdHJpbmc7ICAgLy8gaWYgZXhpc3RzIHRoZW4gaXQgaXMgYWN0dWFsbHkgRkVTTTVcbiAgdHlwZXM/OiBzdHJpbmc7ICAgIC8vIFN5bm9ueW1vdXMgdG8gYHR5cGluZ3NgIHByb3BlcnR5IC0gc2VlIGh0dHBzOi8vYml0Lmx5LzJPZ1dwMkhcbiAgdHlwaW5ncz86IHN0cmluZzsgIC8vIFR5cGVTY3JpcHQgLmQudHMgZmlsZXNcbn1cblxuLyoqXG4gKiBQYXJzZXMgdGhlIEpTT04gZnJvbSBhIHBhY2thZ2UuanNvbiBmaWxlLlxuICogQHBhcmFtIHBhY2thZ2VKc29uUGF0aCB0aGUgYWJzb2x1dGUgcGF0aCB0byB0aGUgcGFja2FnZS5qc29uIGZpbGUuXG4gKiBAcmV0dXJucyBKU09OIGZyb20gdGhlIHBhY2thZ2UuanNvbiBmaWxlIGlmIGl0IGlzIHZhbGlkLCBgbnVsbGAgb3RoZXJ3aXNlLlxuICovXG5mdW5jdGlvbiBsb2FkRW50cnlQb2ludFBhY2thZ2UocGFja2FnZUpzb25QYXRoOiBzdHJpbmcpOiBFbnRyeVBvaW50UGFja2FnZUpzb258bnVsbCB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBhY2thZ2VKc29uUGF0aCwgJ3V0ZjgnKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBXZSBtYXkgaGF2ZSBydW4gaW50byBhIHBhY2thZ2UuanNvbiB3aXRoIHVuZXhwZWN0ZWQgc3ltYm9sc1xuICAgIGNvbnNvbGUud2FybihgRmFpbGVkIHRvIHJlYWQgZW50cnkgcG9pbnQgaW5mbyBmcm9tICR7cGFja2FnZUpzb25QYXRofSB3aXRoIGVycm9yICR7ZX0uYCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBUcnkgdG8gZ2V0IGFuIGVudHJ5IHBvaW50IGZyb20gdGhlIGdpdmVuIHBhdGguXG4gKiBAcGFyYW0gcGFja2FnZVBhdGggdGhlIGFic29sdXRlIHBhdGggdG8gdGhlIGNvbnRhaW5pbmcgbnBtIHBhY2thZ2VcbiAqIEBwYXJhbSBlbnRyeVBvaW50UGF0aCB0aGUgYWJzb2x1dGUgcGF0aCB0byB0aGUgcG90ZW50aWFsIGVudHJ5IHBvaW50LlxuICogQHJldHVybnMgSW5mbyBhYm91dCB0aGUgZW50cnkgcG9pbnQgaWYgaXQgaXMgdmFsaWQsIGBudWxsYCBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbnRyeVBvaW50SW5mbyhwYWNrYWdlUGF0aDogc3RyaW5nLCBlbnRyeVBvaW50UGF0aDogc3RyaW5nKTogRW50cnlQb2ludHxudWxsIHtcbiAgY29uc3QgcGFja2FnZUpzb25QYXRoID0gcGF0aC5yZXNvbHZlKGVudHJ5UG9pbnRQYXRoLCAncGFja2FnZS5qc29uJyk7XG4gIGlmICghZnMuZXhpc3RzU3luYyhwYWNrYWdlSnNvblBhdGgpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBlbnRyeVBvaW50UGFja2FnZUpzb24gPSBsb2FkRW50cnlQb2ludFBhY2thZ2UocGFja2FnZUpzb25QYXRoKTtcbiAgaWYgKCFlbnRyeVBvaW50UGFja2FnZUpzb24pIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIElmIHRoZXJlIGlzIGBlc20yMDE1YCB0aGVuIGBlczIwMTVgIHdpbGwgYmUgRkVTTTIwMTUsIG90aGVyd2lzZSBFU00yMDE1LlxuICAvLyBJZiB0aGVyZSBpcyBgZXNtNWAgdGhlbiBgbW9kdWxlYCB3aWxsIGJlIEZFU001LCBvdGhlcndpc2UgaXQgd2lsbCBiZSBFU001LlxuICBjb25zdCB7XG4gICAgbmFtZSxcbiAgICBtb2R1bGU6IG1vZHVsZVBhdGgsXG4gICAgdHlwZXMsXG4gICAgdHlwaW5ncyA9IHR5cGVzLCAgLy8gc3lub255bW91c1xuICAgIGVzMjAxNSxcbiAgICBmZXNtMjAxNSA9IGVzMjAxNSwgICAvLyBzeW5vbnltb3VzXG4gICAgZmVzbTUgPSBtb2R1bGVQYXRoLCAgLy8gc3lub255bW91c1xuICAgIGVzbTIwMTUsXG4gICAgZXNtNSxcbiAgICBtYWluXG4gIH0gPSBlbnRyeVBvaW50UGFja2FnZUpzb247XG4gIC8vIE1pbmltdW0gcmVxdWlyZW1lbnQgaXMgdGhhdCB3ZSBoYXZlIHR5cGluZ3MgYW5kIG9uZSBvZiBlc20yMDE1IG9yIGZlc20yMDE1IGZvcm1hdHMuXG4gIGlmICghdHlwaW5ncyB8fCAhKGZlc20yMDE1IHx8IGVzbTIwMTUpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBBbHNvIHRoZXJlIG11c3QgZXhpc3QgYSBgbWV0YWRhdGEuanNvbmAgZmlsZSBuZXh0IHRvIHRoZSB0eXBpbmdzIGVudHJ5LXBvaW50LlxuICBjb25zdCBtZXRhZGF0YVBhdGggPVxuICAgICAgcGF0aC5yZXNvbHZlKGVudHJ5UG9pbnRQYXRoLCB0eXBpbmdzLnJlcGxhY2UoL1xcLmRcXC50cyQvLCAnJykgKyAnLm1ldGFkYXRhLmpzb24nKTtcbiAgaWYgKCFmcy5leGlzdHNTeW5jKG1ldGFkYXRhUGF0aCkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IGVudHJ5UG9pbnRJbmZvOiBFbnRyeVBvaW50ID0ge1xuICAgIG5hbWUsXG4gICAgcGFja2FnZTogcGFja2FnZVBhdGgsXG4gICAgcGF0aDogZW50cnlQb2ludFBhdGgsXG4gICAgdHlwaW5nczogcGF0aC5yZXNvbHZlKGVudHJ5UG9pbnRQYXRoLCB0eXBpbmdzKSxcbiAgfTtcblxuICBpZiAoZXNtMjAxNSkge1xuICAgIGVudHJ5UG9pbnRJbmZvLmVzbTIwMTUgPSBwYXRoLnJlc29sdmUoZW50cnlQb2ludFBhdGgsIGVzbTIwMTUpO1xuICB9XG4gIGlmIChmZXNtMjAxNSkge1xuICAgIGVudHJ5UG9pbnRJbmZvLmZlc20yMDE1ID0gcGF0aC5yZXNvbHZlKGVudHJ5UG9pbnRQYXRoLCBmZXNtMjAxNSk7XG4gIH1cbiAgaWYgKGZlc201KSB7XG4gICAgZW50cnlQb2ludEluZm8uZmVzbTUgPSBwYXRoLnJlc29sdmUoZW50cnlQb2ludFBhdGgsIGZlc201KTtcbiAgfVxuICBpZiAoZXNtNSkge1xuICAgIGVudHJ5UG9pbnRJbmZvLmVzbTUgPSBwYXRoLnJlc29sdmUoZW50cnlQb2ludFBhdGgsIGVzbTUpO1xuICB9XG4gIGlmIChtYWluKSB7XG4gICAgZW50cnlQb2ludEluZm8udW1kID0gcGF0aC5yZXNvbHZlKGVudHJ5UG9pbnRQYXRoLCBtYWluKTtcbiAgfVxuXG4gIHJldHVybiBlbnRyeVBvaW50SW5mbztcbn1cbiJdfQ==