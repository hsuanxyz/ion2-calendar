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
        define("tsickle/src/util", ["require", "exports", "path", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // toArray is a temporary function to help in the use of
    // ES6 maps and sets when running on node 4, which doesn't
    // support Iterators completely.
    var path = require("path");
    var ts = require("typescript");
    /**
     * Constructs a new ts.CompilerHost that overlays sources in substituteSource
     * over another ts.CompilerHost.
     *
     * @param substituteSource A map of source file name -> overlay source text.
     */
    function createSourceReplacingCompilerHost(substituteSource, delegate) {
        return {
            getSourceFile: getSourceFile,
            getCancellationToken: delegate.getCancellationToken,
            getDefaultLibFileName: delegate.getDefaultLibFileName,
            writeFile: delegate.writeFile,
            getCurrentDirectory: delegate.getCurrentDirectory,
            getCanonicalFileName: delegate.getCanonicalFileName,
            useCaseSensitiveFileNames: delegate.useCaseSensitiveFileNames,
            getNewLine: delegate.getNewLine,
            fileExists: delegate.fileExists,
            readFile: delegate.readFile,
            directoryExists: delegate.directoryExists,
            getDirectories: delegate.getDirectories,
        };
        function getSourceFile(fileName, languageVersion, onError) {
            var path = ts.sys.resolvePath(fileName);
            var sourceText = substituteSource.get(path);
            if (sourceText !== undefined) {
                return ts.createSourceFile(fileName, sourceText, languageVersion);
            }
            return delegate.getSourceFile(path, languageVersion, onError);
        }
    }
    exports.createSourceReplacingCompilerHost = createSourceReplacingCompilerHost;
    /**
     * Returns the input string with line endings normalized to '\n'.
     */
    function normalizeLineEndings(input) {
        return input.replace(/\r\n/g, '\n');
    }
    exports.normalizeLineEndings = normalizeLineEndings;
    /** @return true if node has the specified modifier flag set. */
    function hasModifierFlag(node, flag) {
        return (ts.getCombinedModifierFlags(node) & flag) !== 0;
    }
    exports.hasModifierFlag = hasModifierFlag;
    function isDtsFileName(fileName) {
        return /\.d\.ts$/.test(fileName);
    }
    exports.isDtsFileName = isDtsFileName;
    /**
     * Determine the lowest-level common parent directory of the given list of files.
     */
    function getCommonParentDirectory(fileNames) {
        var pathSplitter = /[\/\\]+/;
        var commonParent = fileNames[0].split(pathSplitter);
        for (var i = 1; i < fileNames.length; i++) {
            var thisPath = fileNames[i].split(pathSplitter);
            var j = 0;
            while (thisPath[j] === commonParent[j]) {
                j++;
            }
            commonParent.length = j; // Truncate without copying the array
        }
        if (commonParent.length === 0) {
            return '/';
        }
        else {
            return commonParent.join(path.sep);
        }
    }
    exports.getCommonParentDirectory = getCommonParentDirectory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBRUgsd0RBQXdEO0lBQ3hELDBEQUEwRDtJQUMxRCxnQ0FBZ0M7SUFFaEMsMkJBQTZCO0lBQzdCLCtCQUFpQztJQUVqQzs7Ozs7T0FLRztJQUNILDJDQUNJLGdCQUFxQyxFQUFFLFFBQXlCO1FBQ2xFLE1BQU0sQ0FBQztZQUNMLGFBQWEsZUFBQTtZQUNiLG9CQUFvQixFQUFFLFFBQVEsQ0FBQyxvQkFBb0I7WUFDbkQscUJBQXFCLEVBQUUsUUFBUSxDQUFDLHFCQUFxQjtZQUNyRCxTQUFTLEVBQUUsUUFBUSxDQUFDLFNBQVM7WUFDN0IsbUJBQW1CLEVBQUUsUUFBUSxDQUFDLG1CQUFtQjtZQUNqRCxvQkFBb0IsRUFBRSxRQUFRLENBQUMsb0JBQW9CO1lBQ25ELHlCQUF5QixFQUFFLFFBQVEsQ0FBQyx5QkFBeUI7WUFDN0QsVUFBVSxFQUFFLFFBQVEsQ0FBQyxVQUFVO1lBQy9CLFVBQVUsRUFBRSxRQUFRLENBQUMsVUFBVTtZQUMvQixRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVE7WUFDM0IsZUFBZSxFQUFFLFFBQVEsQ0FBQyxlQUFlO1lBQ3pDLGNBQWMsRUFBRSxRQUFRLENBQUMsY0FBYztTQUN4QyxDQUFDO1FBRUYsdUJBQ0ksUUFBZ0IsRUFBRSxlQUFnQyxFQUNsRCxPQUFtQztZQUNyQyxJQUFNLElBQUksR0FBVyxFQUFFLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNsRCxJQUFNLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDOUMsRUFBRSxDQUFDLENBQUMsVUFBVSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdCLE1BQU0sQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUNwRSxDQUFDO1lBQ0QsTUFBTSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNoRSxDQUFDO0lBQ0gsQ0FBQztJQTNCRCw4RUEyQkM7SUFFRDs7T0FFRztJQUNILDhCQUFxQyxLQUFhO1FBQ2hELE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRkQsb0RBRUM7SUFFRCxnRUFBZ0U7SUFDaEUseUJBQWdDLElBQWEsRUFBRSxJQUFzQjtRQUNuRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFGRCwwQ0FFQztJQUVELHVCQUE4QixRQUFnQjtRQUM1QyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRkQsc0NBRUM7SUFFRDs7T0FFRztJQUNILGtDQUF5QyxTQUFtQjtRQUMxRCxJQUFNLFlBQVksR0FBRyxTQUFTLENBQUM7UUFDL0IsSUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN0RCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUMxQyxJQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2xELElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNWLE9BQU8sUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUN2QyxDQUFDLEVBQUUsQ0FBQztZQUNOLENBQUM7WUFDRCxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFFLHFDQUFxQztRQUNqRSxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFDYixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckMsQ0FBQztJQUNILENBQUM7SUFoQkQsNERBZ0JDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vLyB0b0FycmF5IGlzIGEgdGVtcG9yYXJ5IGZ1bmN0aW9uIHRvIGhlbHAgaW4gdGhlIHVzZSBvZlxuLy8gRVM2IG1hcHMgYW5kIHNldHMgd2hlbiBydW5uaW5nIG9uIG5vZGUgNCwgd2hpY2ggZG9lc24ndFxuLy8gc3VwcG9ydCBJdGVyYXRvcnMgY29tcGxldGVseS5cblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBuZXcgdHMuQ29tcGlsZXJIb3N0IHRoYXQgb3ZlcmxheXMgc291cmNlcyBpbiBzdWJzdGl0dXRlU291cmNlXG4gKiBvdmVyIGFub3RoZXIgdHMuQ29tcGlsZXJIb3N0LlxuICpcbiAqIEBwYXJhbSBzdWJzdGl0dXRlU291cmNlIEEgbWFwIG9mIHNvdXJjZSBmaWxlIG5hbWUgLT4gb3ZlcmxheSBzb3VyY2UgdGV4dC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNvdXJjZVJlcGxhY2luZ0NvbXBpbGVySG9zdChcbiAgICBzdWJzdGl0dXRlU291cmNlOiBNYXA8c3RyaW5nLCBzdHJpbmc+LCBkZWxlZ2F0ZTogdHMuQ29tcGlsZXJIb3N0KTogdHMuQ29tcGlsZXJIb3N0IHtcbiAgcmV0dXJuIHtcbiAgICBnZXRTb3VyY2VGaWxlLFxuICAgIGdldENhbmNlbGxhdGlvblRva2VuOiBkZWxlZ2F0ZS5nZXRDYW5jZWxsYXRpb25Ub2tlbixcbiAgICBnZXREZWZhdWx0TGliRmlsZU5hbWU6IGRlbGVnYXRlLmdldERlZmF1bHRMaWJGaWxlTmFtZSxcbiAgICB3cml0ZUZpbGU6IGRlbGVnYXRlLndyaXRlRmlsZSxcbiAgICBnZXRDdXJyZW50RGlyZWN0b3J5OiBkZWxlZ2F0ZS5nZXRDdXJyZW50RGlyZWN0b3J5LFxuICAgIGdldENhbm9uaWNhbEZpbGVOYW1lOiBkZWxlZ2F0ZS5nZXRDYW5vbmljYWxGaWxlTmFtZSxcbiAgICB1c2VDYXNlU2Vuc2l0aXZlRmlsZU5hbWVzOiBkZWxlZ2F0ZS51c2VDYXNlU2Vuc2l0aXZlRmlsZU5hbWVzLFxuICAgIGdldE5ld0xpbmU6IGRlbGVnYXRlLmdldE5ld0xpbmUsXG4gICAgZmlsZUV4aXN0czogZGVsZWdhdGUuZmlsZUV4aXN0cyxcbiAgICByZWFkRmlsZTogZGVsZWdhdGUucmVhZEZpbGUsXG4gICAgZGlyZWN0b3J5RXhpc3RzOiBkZWxlZ2F0ZS5kaXJlY3RvcnlFeGlzdHMsXG4gICAgZ2V0RGlyZWN0b3JpZXM6IGRlbGVnYXRlLmdldERpcmVjdG9yaWVzLFxuICB9O1xuXG4gIGZ1bmN0aW9uIGdldFNvdXJjZUZpbGUoXG4gICAgICBmaWxlTmFtZTogc3RyaW5nLCBsYW5ndWFnZVZlcnNpb246IHRzLlNjcmlwdFRhcmdldCxcbiAgICAgIG9uRXJyb3I/OiAobWVzc2FnZTogc3RyaW5nKSA9PiB2b2lkKTogdHMuU291cmNlRmlsZXx1bmRlZmluZWQge1xuICAgIGNvbnN0IHBhdGg6IHN0cmluZyA9IHRzLnN5cy5yZXNvbHZlUGF0aChmaWxlTmFtZSk7XG4gICAgY29uc3Qgc291cmNlVGV4dCA9IHN1YnN0aXR1dGVTb3VyY2UuZ2V0KHBhdGgpO1xuICAgIGlmIChzb3VyY2VUZXh0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0cy5jcmVhdGVTb3VyY2VGaWxlKGZpbGVOYW1lLCBzb3VyY2VUZXh0LCBsYW5ndWFnZVZlcnNpb24pO1xuICAgIH1cbiAgICByZXR1cm4gZGVsZWdhdGUuZ2V0U291cmNlRmlsZShwYXRoLCBsYW5ndWFnZVZlcnNpb24sIG9uRXJyb3IpO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgaW5wdXQgc3RyaW5nIHdpdGggbGluZSBlbmRpbmdzIG5vcm1hbGl6ZWQgdG8gJ1xcbicuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVMaW5lRW5kaW5ncyhpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGlucHV0LnJlcGxhY2UoL1xcclxcbi9nLCAnXFxuJyk7XG59XG5cbi8qKiBAcmV0dXJuIHRydWUgaWYgbm9kZSBoYXMgdGhlIHNwZWNpZmllZCBtb2RpZmllciBmbGFnIHNldC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNNb2RpZmllckZsYWcobm9kZTogdHMuTm9kZSwgZmxhZzogdHMuTW9kaWZpZXJGbGFncyk6IGJvb2xlYW4ge1xuICByZXR1cm4gKHRzLmdldENvbWJpbmVkTW9kaWZpZXJGbGFncyhub2RlKSAmIGZsYWcpICE9PSAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEdHNGaWxlTmFtZShmaWxlTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiAvXFwuZFxcLnRzJC8udGVzdChmaWxlTmFtZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIHRoZSBsb3dlc3QtbGV2ZWwgY29tbW9uIHBhcmVudCBkaXJlY3Rvcnkgb2YgdGhlIGdpdmVuIGxpc3Qgb2YgZmlsZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb21tb25QYXJlbnREaXJlY3RvcnkoZmlsZU5hbWVzOiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gIGNvbnN0IHBhdGhTcGxpdHRlciA9IC9bXFwvXFxcXF0rLztcbiAgY29uc3QgY29tbW9uUGFyZW50ID0gZmlsZU5hbWVzWzBdLnNwbGl0KHBhdGhTcGxpdHRlcik7XG4gIGZvciAobGV0IGkgPSAxOyBpIDwgZmlsZU5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgdGhpc1BhdGggPSBmaWxlTmFtZXNbaV0uc3BsaXQocGF0aFNwbGl0dGVyKTtcbiAgICBsZXQgaiA9IDA7XG4gICAgd2hpbGUgKHRoaXNQYXRoW2pdID09PSBjb21tb25QYXJlbnRbal0pIHtcbiAgICAgIGorKztcbiAgICB9XG4gICAgY29tbW9uUGFyZW50Lmxlbmd0aCA9IGo7ICAvLyBUcnVuY2F0ZSB3aXRob3V0IGNvcHlpbmcgdGhlIGFycmF5XG4gIH1cbiAgaWYgKGNvbW1vblBhcmVudC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gJy8nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjb21tb25QYXJlbnQuam9pbihwYXRoLnNlcCk7XG4gIH1cbn1cbiJdfQ==