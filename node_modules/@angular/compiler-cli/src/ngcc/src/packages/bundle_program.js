(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngcc/src/packages/bundle_program", ["require", "exports", "tslib", "canonical-path", "fs", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var canonical_path_1 = require("canonical-path");
    var fs_1 = require("fs");
    var ts = require("typescript");
    /**
     * Create a bundle program.
     */
    function makeBundleProgram(isCore, path, r3FileName, options, host) {
        var r3SymbolsPath = isCore ? findR3SymbolsPath(canonical_path_1.dirname(path), r3FileName) : null;
        var rootPaths = r3SymbolsPath ? [path, r3SymbolsPath] : [path];
        var program = ts.createProgram(rootPaths, options, host);
        var file = program.getSourceFile(path);
        var r3SymbolsFile = r3SymbolsPath && program.getSourceFile(r3SymbolsPath) || null;
        return { program: program, path: path, file: file, r3SymbolsPath: r3SymbolsPath, r3SymbolsFile: r3SymbolsFile };
    }
    exports.makeBundleProgram = makeBundleProgram;
    /**
     * Search the given directory hierarchy to find the path to the `r3_symbols` file.
     */
    function findR3SymbolsPath(directory, filename) {
        var e_1, _a;
        var r3SymbolsFilePath = canonical_path_1.resolve(directory, filename);
        if (fs_1.existsSync(r3SymbolsFilePath)) {
            return r3SymbolsFilePath;
        }
        var subDirectories = fs_1.readdirSync(directory)
            // Not interested in hidden files
            .filter(function (p) { return !p.startsWith('.'); })
            // Ignore node_modules
            .filter(function (p) { return p !== 'node_modules'; })
            // Only interested in directories (and only those that are not symlinks)
            .filter(function (p) {
            var stat = fs_1.lstatSync(canonical_path_1.resolve(directory, p));
            return stat.isDirectory() && !stat.isSymbolicLink();
        });
        try {
            for (var subDirectories_1 = tslib_1.__values(subDirectories), subDirectories_1_1 = subDirectories_1.next(); !subDirectories_1_1.done; subDirectories_1_1 = subDirectories_1.next()) {
                var subDirectory = subDirectories_1_1.value;
                var r3SymbolsFilePath_1 = findR3SymbolsPath(canonical_path_1.resolve(directory, subDirectory), filename);
                if (r3SymbolsFilePath_1) {
                    return r3SymbolsFilePath_1;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (subDirectories_1_1 && !subDirectories_1_1.done && (_a = subDirectories_1.return)) _a.call(subDirectories_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
    }
    exports.findR3SymbolsPath = findR3SymbolsPath;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlX3Byb2dyYW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25nY2Mvc3JjL3BhY2thZ2VzL2J1bmRsZV9wcm9ncmFtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILGlEQUFnRDtJQUNoRCx5QkFBc0Q7SUFDdEQsK0JBQWlDO0lBa0JqQzs7T0FFRztJQUNILFNBQWdCLGlCQUFpQixDQUM3QixNQUFlLEVBQUUsSUFBWSxFQUFFLFVBQWtCLEVBQUUsT0FBMkIsRUFDOUUsSUFBcUI7UUFDdkIsSUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyx3QkFBTyxDQUFDLElBQUksQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDbkYsSUFBTSxTQUFTLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRSxJQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDM0QsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUcsQ0FBQztRQUMzQyxJQUFNLGFBQWEsR0FBRyxhQUFhLElBQUksT0FBTyxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsSUFBSSxJQUFJLENBQUM7UUFFcEYsT0FBTyxFQUFDLE9BQU8sU0FBQSxFQUFFLElBQUksTUFBQSxFQUFFLElBQUksTUFBQSxFQUFFLGFBQWEsZUFBQSxFQUFFLGFBQWEsZUFBQSxFQUFDLENBQUM7SUFDN0QsQ0FBQztJQVZELDhDQVVDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixpQkFBaUIsQ0FBQyxTQUFpQixFQUFFLFFBQWdCOztRQUNuRSxJQUFNLGlCQUFpQixHQUFHLHdCQUFPLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZELElBQUksZUFBVSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7WUFDakMsT0FBTyxpQkFBaUIsQ0FBQztTQUMxQjtRQUVELElBQU0sY0FBYyxHQUNoQixnQkFBVyxDQUFDLFNBQVMsQ0FBQztZQUNsQixpQ0FBaUM7YUFDaEMsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFsQixDQUFrQixDQUFDO1lBQ2hDLHNCQUFzQjthQUNyQixNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLEtBQUssY0FBYyxFQUFwQixDQUFvQixDQUFDO1lBQ2xDLHdFQUF3RTthQUN2RSxNQUFNLENBQUMsVUFBQSxDQUFDO1lBQ1AsSUFBTSxJQUFJLEdBQUcsY0FBUyxDQUFDLHdCQUFPLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUMsT0FBTyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdEQsQ0FBQyxDQUFDLENBQUM7O1lBRVgsS0FBMkIsSUFBQSxtQkFBQSxpQkFBQSxjQUFjLENBQUEsOENBQUEsMEVBQUU7Z0JBQXRDLElBQU0sWUFBWSwyQkFBQTtnQkFDckIsSUFBTSxtQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQyx3QkFBTyxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDMUYsSUFBSSxtQkFBaUIsRUFBRTtvQkFDckIsT0FBTyxtQkFBaUIsQ0FBQztpQkFDMUI7YUFDRjs7Ozs7Ozs7O1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBMUJELDhDQTBCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7ZGlybmFtZSwgcmVzb2x2ZX0gZnJvbSAnY2Fub25pY2FsLXBhdGgnO1xuaW1wb3J0IHtleGlzdHNTeW5jLCBsc3RhdFN5bmMsIHJlYWRkaXJTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuLyoqXG4qIEFuIGVudHJ5IHBvaW50IGJ1bmRsZSBjb250YWlucyBvbmUgb3IgdHdvIHByb2dyYW1zLCBlLmcuIGBzcmNgIGFuZCBgZHRzYCxcbiogdGhhdCBhcmUgY29tcGlsZWQgdmlhIFR5cGVTY3JpcHQuXG4qXG4qIFRvIGFpZCB3aXRoIHByb2Nlc3NpbmcgdGhlIHByb2dyYW0sIHRoaXMgaW50ZXJmYWNlIGV4cG9zZXMgdGhlIHByb2dyYW0gaXRzZWxmLFxuKiBhcyB3ZWxsIGFzIHBhdGggYW5kIFRTIGZpbGUgb2YgdGhlIGVudHJ5LXBvaW50IHRvIHRoZSBwcm9ncmFtIGFuZCB0aGUgcjNTeW1ib2xzXG4qIGZpbGUsIGlmIGFwcHJvcHJpYXRlLlxuKi9cbmV4cG9ydCBpbnRlcmZhY2UgQnVuZGxlUHJvZ3JhbSB7XG4gIHByb2dyYW06IHRzLlByb2dyYW07XG4gIHBhdGg6IHN0cmluZztcbiAgZmlsZTogdHMuU291cmNlRmlsZTtcbiAgcjNTeW1ib2xzUGF0aDogc3RyaW5nfG51bGw7XG4gIHIzU3ltYm9sc0ZpbGU6IHRzLlNvdXJjZUZpbGV8bnVsbDtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBidW5kbGUgcHJvZ3JhbS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1ha2VCdW5kbGVQcm9ncmFtKFxuICAgIGlzQ29yZTogYm9vbGVhbiwgcGF0aDogc3RyaW5nLCByM0ZpbGVOYW1lOiBzdHJpbmcsIG9wdGlvbnM6IHRzLkNvbXBpbGVyT3B0aW9ucyxcbiAgICBob3N0OiB0cy5Db21waWxlckhvc3QpOiBCdW5kbGVQcm9ncmFtIHtcbiAgY29uc3QgcjNTeW1ib2xzUGF0aCA9IGlzQ29yZSA/IGZpbmRSM1N5bWJvbHNQYXRoKGRpcm5hbWUocGF0aCksIHIzRmlsZU5hbWUpIDogbnVsbDtcbiAgY29uc3Qgcm9vdFBhdGhzID0gcjNTeW1ib2xzUGF0aCA/IFtwYXRoLCByM1N5bWJvbHNQYXRoXSA6IFtwYXRoXTtcbiAgY29uc3QgcHJvZ3JhbSA9IHRzLmNyZWF0ZVByb2dyYW0ocm9vdFBhdGhzLCBvcHRpb25zLCBob3N0KTtcbiAgY29uc3QgZmlsZSA9IHByb2dyYW0uZ2V0U291cmNlRmlsZShwYXRoKSAhO1xuICBjb25zdCByM1N5bWJvbHNGaWxlID0gcjNTeW1ib2xzUGF0aCAmJiBwcm9ncmFtLmdldFNvdXJjZUZpbGUocjNTeW1ib2xzUGF0aCkgfHwgbnVsbDtcblxuICByZXR1cm4ge3Byb2dyYW0sIHBhdGgsIGZpbGUsIHIzU3ltYm9sc1BhdGgsIHIzU3ltYm9sc0ZpbGV9O1xufVxuXG4vKipcbiAqIFNlYXJjaCB0aGUgZ2l2ZW4gZGlyZWN0b3J5IGhpZXJhcmNoeSB0byBmaW5kIHRoZSBwYXRoIHRvIHRoZSBgcjNfc3ltYm9sc2AgZmlsZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRSM1N5bWJvbHNQYXRoKGRpcmVjdG9yeTogc3RyaW5nLCBmaWxlbmFtZTogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICBjb25zdCByM1N5bWJvbHNGaWxlUGF0aCA9IHJlc29sdmUoZGlyZWN0b3J5LCBmaWxlbmFtZSk7XG4gIGlmIChleGlzdHNTeW5jKHIzU3ltYm9sc0ZpbGVQYXRoKSkge1xuICAgIHJldHVybiByM1N5bWJvbHNGaWxlUGF0aDtcbiAgfVxuXG4gIGNvbnN0IHN1YkRpcmVjdG9yaWVzID1cbiAgICAgIHJlYWRkaXJTeW5jKGRpcmVjdG9yeSlcbiAgICAgICAgICAvLyBOb3QgaW50ZXJlc3RlZCBpbiBoaWRkZW4gZmlsZXNcbiAgICAgICAgICAuZmlsdGVyKHAgPT4gIXAuc3RhcnRzV2l0aCgnLicpKVxuICAgICAgICAgIC8vIElnbm9yZSBub2RlX21vZHVsZXNcbiAgICAgICAgICAuZmlsdGVyKHAgPT4gcCAhPT0gJ25vZGVfbW9kdWxlcycpXG4gICAgICAgICAgLy8gT25seSBpbnRlcmVzdGVkIGluIGRpcmVjdG9yaWVzIChhbmQgb25seSB0aG9zZSB0aGF0IGFyZSBub3Qgc3ltbGlua3MpXG4gICAgICAgICAgLmZpbHRlcihwID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXQgPSBsc3RhdFN5bmMocmVzb2x2ZShkaXJlY3RvcnksIHApKTtcbiAgICAgICAgICAgIHJldHVybiBzdGF0LmlzRGlyZWN0b3J5KCkgJiYgIXN0YXQuaXNTeW1ib2xpY0xpbmsoKTtcbiAgICAgICAgICB9KTtcblxuICBmb3IgKGNvbnN0IHN1YkRpcmVjdG9yeSBvZiBzdWJEaXJlY3Rvcmllcykge1xuICAgIGNvbnN0IHIzU3ltYm9sc0ZpbGVQYXRoID0gZmluZFIzU3ltYm9sc1BhdGgocmVzb2x2ZShkaXJlY3RvcnksIHN1YkRpcmVjdG9yeSwgKSwgZmlsZW5hbWUpO1xuICAgIGlmIChyM1N5bWJvbHNGaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIHIzU3ltYm9sc0ZpbGVQYXRoO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuIl19