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
        define("@angular/compiler-cli/src/transformers/util", ["require", "exports", "@angular/compiler", "path", "typescript", "@angular/compiler-cli/src/transformers/api"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const compiler_1 = require("@angular/compiler");
    const path = require("path");
    const ts = require("typescript");
    const api_1 = require("@angular/compiler-cli/src/transformers/api");
    exports.GENERATED_FILES = /(.*?)\.(ngfactory|shim\.ngstyle|ngstyle|ngsummary)\.(js|d\.ts|ts)$/;
    exports.DTS = /\.d\.ts$/;
    exports.TS = /^(?!.*\.d\.ts$).*\.ts$/;
    // Note: This is an internal property in TypeScript. Use it only for assertions and tests.
    function tsStructureIsReused(program) {
        return program.structureIsReused;
    }
    exports.tsStructureIsReused = tsStructureIsReused;
    function error(msg) {
        throw new Error(`Internal error: ${msg}`);
    }
    exports.error = error;
    function userError(msg) {
        throw compiler_1.syntaxError(msg);
    }
    exports.userError = userError;
    function createMessageDiagnostic(messageText) {
        return {
            file: undefined,
            start: undefined,
            length: undefined,
            category: ts.DiagnosticCategory.Message, messageText,
            code: api_1.DEFAULT_ERROR_CODE,
            source: api_1.SOURCE,
        };
    }
    exports.createMessageDiagnostic = createMessageDiagnostic;
    function isInRootDir(fileName, options) {
        return !options.rootDir || pathStartsWithPrefix(options.rootDir, fileName);
    }
    exports.isInRootDir = isInRootDir;
    function relativeToRootDirs(filePath, rootDirs) {
        if (!filePath)
            return filePath;
        for (const dir of rootDirs || []) {
            const rel = pathStartsWithPrefix(dir, filePath);
            if (rel) {
                return rel;
            }
        }
        return filePath;
    }
    exports.relativeToRootDirs = relativeToRootDirs;
    function pathStartsWithPrefix(prefix, fullPath) {
        const rel = path.relative(prefix, fullPath);
        return rel.startsWith('..') ? null : rel;
    }
    /**
     * Converts a ng.Diagnostic into a ts.Diagnostic.
     * This looses some information, and also uses an incomplete object as `file`.
     *
     * I.e. only use this where the API allows only a ts.Diagnostic.
     */
    function ngToTsDiagnostic(ng) {
        let file;
        let start;
        let length;
        if (ng.span) {
            // Note: We can't use a real ts.SourceFile,
            // but we can at least mirror the properties `fileName` and `text`, which
            // are mostly used for error reporting.
            file = { fileName: ng.span.start.file.url, text: ng.span.start.file.content };
            start = ng.span.start.offset;
            length = ng.span.end.offset - start;
        }
        return {
            file,
            messageText: ng.messageText,
            category: ng.category,
            code: ng.code, start, length,
        };
    }
    exports.ngToTsDiagnostic = ngToTsDiagnostic;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvdHJhbnNmb3JtZXJzL3V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSCxnREFBOEM7SUFDOUMsNkJBQTZCO0lBQzdCLGlDQUFpQztJQUVqQyxvRUFBOEU7SUFFakUsUUFBQSxlQUFlLEdBQUcsb0VBQW9FLENBQUM7SUFDdkYsUUFBQSxHQUFHLEdBQUcsVUFBVSxDQUFDO0lBQ2pCLFFBQUEsRUFBRSxHQUFHLHdCQUF3QixDQUFDO0lBSTNDLDBGQUEwRjtJQUMxRixTQUFnQixtQkFBbUIsQ0FBQyxPQUFtQjtRQUNyRCxPQUFRLE9BQWUsQ0FBQyxpQkFBaUIsQ0FBQztJQUM1QyxDQUFDO0lBRkQsa0RBRUM7SUFFRCxTQUFnQixLQUFLLENBQUMsR0FBVztRQUMvQixNQUFNLElBQUksS0FBSyxDQUFDLG1CQUFtQixHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFGRCxzQkFFQztJQUVELFNBQWdCLFNBQVMsQ0FBQyxHQUFXO1FBQ25DLE1BQU0sc0JBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRkQsOEJBRUM7SUFFRCxTQUFnQix1QkFBdUIsQ0FBQyxXQUFtQjtRQUN6RCxPQUFPO1lBQ0wsSUFBSSxFQUFFLFNBQVM7WUFDZixLQUFLLEVBQUUsU0FBUztZQUNoQixNQUFNLEVBQUUsU0FBUztZQUNqQixRQUFRLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxXQUFXO1lBQ3BELElBQUksRUFBRSx3QkFBa0I7WUFDeEIsTUFBTSxFQUFFLFlBQU07U0FDZixDQUFDO0lBQ0osQ0FBQztJQVRELDBEQVNDO0lBRUQsU0FBZ0IsV0FBVyxDQUFDLFFBQWdCLEVBQUUsT0FBd0I7UUFDcEUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLElBQUksb0JBQW9CLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBRkQsa0NBRUM7SUFFRCxTQUFnQixrQkFBa0IsQ0FBQyxRQUFnQixFQUFFLFFBQWtCO1FBQ3JFLElBQUksQ0FBQyxRQUFRO1lBQUUsT0FBTyxRQUFRLENBQUM7UUFDL0IsS0FBSyxNQUFNLEdBQUcsSUFBSSxRQUFRLElBQUksRUFBRSxFQUFFO1lBQ2hDLE1BQU0sR0FBRyxHQUFHLG9CQUFvQixDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNoRCxJQUFJLEdBQUcsRUFBRTtnQkFDUCxPQUFPLEdBQUcsQ0FBQzthQUNaO1NBQ0Y7UUFDRCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBVEQsZ0RBU0M7SUFFRCxTQUFTLG9CQUFvQixDQUFDLE1BQWMsRUFBRSxRQUFnQjtRQUM1RCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM1QyxPQUFPLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0lBQzNDLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILFNBQWdCLGdCQUFnQixDQUFDLEVBQWM7UUFDN0MsSUFBSSxJQUE2QixDQUFDO1FBQ2xDLElBQUksS0FBdUIsQ0FBQztRQUM1QixJQUFJLE1BQXdCLENBQUM7UUFDN0IsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFO1lBQ1gsMkNBQTJDO1lBQzNDLHlFQUF5RTtZQUN6RSx1Q0FBdUM7WUFDdkMsSUFBSSxHQUFHLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQW1CLENBQUM7WUFDL0YsS0FBSyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUM3QixNQUFNLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztTQUNyQztRQUNELE9BQU87WUFDTCxJQUFJO1lBQ0osV0FBVyxFQUFFLEVBQUUsQ0FBQyxXQUFXO1lBQzNCLFFBQVEsRUFBRSxFQUFFLENBQUMsUUFBUTtZQUNyQixJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTTtTQUM3QixDQUFDO0lBQ0osQ0FBQztJQWxCRCw0Q0FrQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7c3ludGF4RXJyb3J9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtDb21waWxlck9wdGlvbnMsIERFRkFVTFRfRVJST1JfQ09ERSwgRGlhZ25vc3RpYywgU09VUkNFfSBmcm9tICcuL2FwaSc7XG5cbmV4cG9ydCBjb25zdCBHRU5FUkFURURfRklMRVMgPSAvKC4qPylcXC4obmdmYWN0b3J5fHNoaW1cXC5uZ3N0eWxlfG5nc3R5bGV8bmdzdW1tYXJ5KVxcLihqc3xkXFwudHN8dHMpJC87XG5leHBvcnQgY29uc3QgRFRTID0gL1xcLmRcXC50cyQvO1xuZXhwb3J0IGNvbnN0IFRTID0gL14oPyEuKlxcLmRcXC50cyQpLipcXC50cyQvO1xuXG5leHBvcnQgY29uc3QgZW51bSBTdHJ1Y3R1cmVJc1JldXNlZCB7Tm90ID0gMCwgU2FmZU1vZHVsZXMgPSAxLCBDb21wbGV0ZWx5ID0gMn1cblxuLy8gTm90ZTogVGhpcyBpcyBhbiBpbnRlcm5hbCBwcm9wZXJ0eSBpbiBUeXBlU2NyaXB0LiBVc2UgaXQgb25seSBmb3IgYXNzZXJ0aW9ucyBhbmQgdGVzdHMuXG5leHBvcnQgZnVuY3Rpb24gdHNTdHJ1Y3R1cmVJc1JldXNlZChwcm9ncmFtOiB0cy5Qcm9ncmFtKTogU3RydWN0dXJlSXNSZXVzZWQge1xuICByZXR1cm4gKHByb2dyYW0gYXMgYW55KS5zdHJ1Y3R1cmVJc1JldXNlZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVycm9yKG1zZzogc3RyaW5nKTogbmV2ZXIge1xuICB0aHJvdyBuZXcgRXJyb3IoYEludGVybmFsIGVycm9yOiAke21zZ31gKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZXJFcnJvcihtc2c6IHN0cmluZyk6IG5ldmVyIHtcbiAgdGhyb3cgc3ludGF4RXJyb3IobXNnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1lc3NhZ2VEaWFnbm9zdGljKG1lc3NhZ2VUZXh0OiBzdHJpbmcpOiB0cy5EaWFnbm9zdGljJkRpYWdub3N0aWMge1xuICByZXR1cm4ge1xuICAgIGZpbGU6IHVuZGVmaW5lZCxcbiAgICBzdGFydDogdW5kZWZpbmVkLFxuICAgIGxlbmd0aDogdW5kZWZpbmVkLFxuICAgIGNhdGVnb3J5OiB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuTWVzc2FnZSwgbWVzc2FnZVRleHQsXG4gICAgY29kZTogREVGQVVMVF9FUlJPUl9DT0RFLFxuICAgIHNvdXJjZTogU09VUkNFLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNJblJvb3REaXIoZmlsZU5hbWU6IHN0cmluZywgb3B0aW9uczogQ29tcGlsZXJPcHRpb25zKSB7XG4gIHJldHVybiAhb3B0aW9ucy5yb290RGlyIHx8IHBhdGhTdGFydHNXaXRoUHJlZml4KG9wdGlvbnMucm9vdERpciwgZmlsZU5hbWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVsYXRpdmVUb1Jvb3REaXJzKGZpbGVQYXRoOiBzdHJpbmcsIHJvb3REaXJzOiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gIGlmICghZmlsZVBhdGgpIHJldHVybiBmaWxlUGF0aDtcbiAgZm9yIChjb25zdCBkaXIgb2Ygcm9vdERpcnMgfHwgW10pIHtcbiAgICBjb25zdCByZWwgPSBwYXRoU3RhcnRzV2l0aFByZWZpeChkaXIsIGZpbGVQYXRoKTtcbiAgICBpZiAocmVsKSB7XG4gICAgICByZXR1cm4gcmVsO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmlsZVBhdGg7XG59XG5cbmZ1bmN0aW9uIHBhdGhTdGFydHNXaXRoUHJlZml4KHByZWZpeDogc3RyaW5nLCBmdWxsUGF0aDogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICBjb25zdCByZWwgPSBwYXRoLnJlbGF0aXZlKHByZWZpeCwgZnVsbFBhdGgpO1xuICByZXR1cm4gcmVsLnN0YXJ0c1dpdGgoJy4uJykgPyBudWxsIDogcmVsO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgbmcuRGlhZ25vc3RpYyBpbnRvIGEgdHMuRGlhZ25vc3RpYy5cbiAqIFRoaXMgbG9vc2VzIHNvbWUgaW5mb3JtYXRpb24sIGFuZCBhbHNvIHVzZXMgYW4gaW5jb21wbGV0ZSBvYmplY3QgYXMgYGZpbGVgLlxuICpcbiAqIEkuZS4gb25seSB1c2UgdGhpcyB3aGVyZSB0aGUgQVBJIGFsbG93cyBvbmx5IGEgdHMuRGlhZ25vc3RpYy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5nVG9Uc0RpYWdub3N0aWMobmc6IERpYWdub3N0aWMpOiB0cy5EaWFnbm9zdGljIHtcbiAgbGV0IGZpbGU6IHRzLlNvdXJjZUZpbGV8dW5kZWZpbmVkO1xuICBsZXQgc3RhcnQ6IG51bWJlcnx1bmRlZmluZWQ7XG4gIGxldCBsZW5ndGg6IG51bWJlcnx1bmRlZmluZWQ7XG4gIGlmIChuZy5zcGFuKSB7XG4gICAgLy8gTm90ZTogV2UgY2FuJ3QgdXNlIGEgcmVhbCB0cy5Tb3VyY2VGaWxlLFxuICAgIC8vIGJ1dCB3ZSBjYW4gYXQgbGVhc3QgbWlycm9yIHRoZSBwcm9wZXJ0aWVzIGBmaWxlTmFtZWAgYW5kIGB0ZXh0YCwgd2hpY2hcbiAgICAvLyBhcmUgbW9zdGx5IHVzZWQgZm9yIGVycm9yIHJlcG9ydGluZy5cbiAgICBmaWxlID0geyBmaWxlTmFtZTogbmcuc3Bhbi5zdGFydC5maWxlLnVybCwgdGV4dDogbmcuc3Bhbi5zdGFydC5maWxlLmNvbnRlbnQgfSBhcyB0cy5Tb3VyY2VGaWxlO1xuICAgIHN0YXJ0ID0gbmcuc3Bhbi5zdGFydC5vZmZzZXQ7XG4gICAgbGVuZ3RoID0gbmcuc3Bhbi5lbmQub2Zmc2V0IC0gc3RhcnQ7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBmaWxlLFxuICAgIG1lc3NhZ2VUZXh0OiBuZy5tZXNzYWdlVGV4dCxcbiAgICBjYXRlZ29yeTogbmcuY2F0ZWdvcnksXG4gICAgY29kZTogbmcuY29kZSwgc3RhcnQsIGxlbmd0aCxcbiAgfTtcbn1cbiJdfQ==