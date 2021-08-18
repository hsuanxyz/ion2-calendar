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
        define("@angular/compiler-cli/src/ngtsc/util/src/path", ["require", "exports", "path"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <reference types="node" />
    var path = require("path");
    var TS_DTS_JS_EXTENSION = /(?:\.d)?\.ts$|\.js$/;
    function relativePathBetween(from, to) {
        var relative = path.posix.relative(path.dirname(from), to).replace(TS_DTS_JS_EXTENSION, '');
        if (relative === '') {
            return null;
        }
        // path.relative() does not include the leading './'.
        if (!relative.startsWith('.')) {
            relative = "./" + relative;
        }
        return relative;
    }
    exports.relativePathBetween = relativePathBetween;
    function normalizeSeparators(path) {
        // TODO: normalize path only for OS that need it.
        return path.replace(/\\/g, '/');
    }
    exports.normalizeSeparators = normalizeSeparators;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdXRpbC9zcmMvcGF0aC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILDhCQUE4QjtJQUU5QiwyQkFBNkI7SUFFN0IsSUFBTSxtQkFBbUIsR0FBRyxxQkFBcUIsQ0FBQztJQUVsRCxTQUFnQixtQkFBbUIsQ0FBQyxJQUFZLEVBQUUsRUFBVTtRQUMxRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUU1RixJQUFJLFFBQVEsS0FBSyxFQUFFLEVBQUU7WUFDbkIsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELHFEQUFxRDtRQUNyRCxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUM3QixRQUFRLEdBQUcsT0FBSyxRQUFVLENBQUM7U0FDNUI7UUFFRCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBYkQsa0RBYUM7SUFFRCxTQUFnQixtQkFBbUIsQ0FBQyxJQUFZO1FBQzlDLGlEQUFpRDtRQUNqRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFIRCxrREFHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJub2RlXCIgLz5cblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuY29uc3QgVFNfRFRTX0pTX0VYVEVOU0lPTiA9IC8oPzpcXC5kKT9cXC50cyR8XFwuanMkLztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlbGF0aXZlUGF0aEJldHdlZW4oZnJvbTogc3RyaW5nLCB0bzogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICBsZXQgcmVsYXRpdmUgPSBwYXRoLnBvc2l4LnJlbGF0aXZlKHBhdGguZGlybmFtZShmcm9tKSwgdG8pLnJlcGxhY2UoVFNfRFRTX0pTX0VYVEVOU0lPTiwgJycpO1xuXG4gIGlmIChyZWxhdGl2ZSA9PT0gJycpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIHBhdGgucmVsYXRpdmUoKSBkb2VzIG5vdCBpbmNsdWRlIHRoZSBsZWFkaW5nICcuLycuXG4gIGlmICghcmVsYXRpdmUuc3RhcnRzV2l0aCgnLicpKSB7XG4gICAgcmVsYXRpdmUgPSBgLi8ke3JlbGF0aXZlfWA7XG4gIH1cblxuICByZXR1cm4gcmVsYXRpdmU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVTZXBhcmF0b3JzKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIC8vIFRPRE86IG5vcm1hbGl6ZSBwYXRoIG9ubHkgZm9yIE9TIHRoYXQgbmVlZCBpdC5cbiAgcmV0dXJuIHBhdGgucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xufVxuIl19