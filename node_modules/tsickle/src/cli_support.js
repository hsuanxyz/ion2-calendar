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
        define("tsickle/src/cli_support", ["require", "exports", "path"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var path = require("path");
    // Postprocess generated JS.
    function pathToModuleName(rootModulePath, context, fileName) {
        fileName = fileName.replace(/\.[tj]s$/, '');
        if (fileName[0] === '.') {
            // './foo' or '../foo'.
            // Resolve the path against the dirname of the current module.
            fileName = path.join(path.dirname(context), fileName);
        }
        // Ensure consistency by naming all modules after their absolute paths
        fileName = path.resolve(fileName);
        if (rootModulePath) {
            fileName = path.relative(rootModulePath, fileName);
        }
        // Replace characters not supported by goog.module.
        var moduleName = fileName.replace(/\/|\\/g, '.').replace(/^[^a-zA-Z_$]/, '_').replace(/[^a-zA-Z0-9._$]/g, '_');
        return moduleName;
    }
    exports.pathToModuleName = pathToModuleName;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpX3N1cHBvcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY2xpX3N1cHBvcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSCwyQkFBNkI7SUFFN0IsNEJBQTRCO0lBQzVCLDBCQUNJLGNBQXNCLEVBQUUsT0FBZSxFQUFFLFFBQWdCO1FBQzNELFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUU1QyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN4Qix1QkFBdUI7WUFDdkIsOERBQThEO1lBQzlELFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUVELHNFQUFzRTtRQUN0RSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVsQyxFQUFFLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQ25CLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRUQsbURBQW1EO1FBQ25ELElBQU0sVUFBVSxHQUNaLFFBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRWxHLE1BQU0sQ0FBQyxVQUFVLENBQUM7SUFDcEIsQ0FBQztJQXRCRCw0Q0FzQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbi8vIFBvc3Rwcm9jZXNzIGdlbmVyYXRlZCBKUy5cbmV4cG9ydCBmdW5jdGlvbiBwYXRoVG9Nb2R1bGVOYW1lKFxuICAgIHJvb3RNb2R1bGVQYXRoOiBzdHJpbmcsIGNvbnRleHQ6IHN0cmluZywgZmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIGZpbGVOYW1lID0gZmlsZU5hbWUucmVwbGFjZSgvXFwuW3RqXXMkLywgJycpO1xuXG4gIGlmIChmaWxlTmFtZVswXSA9PT0gJy4nKSB7XG4gICAgLy8gJy4vZm9vJyBvciAnLi4vZm9vJy5cbiAgICAvLyBSZXNvbHZlIHRoZSBwYXRoIGFnYWluc3QgdGhlIGRpcm5hbWUgb2YgdGhlIGN1cnJlbnQgbW9kdWxlLlxuICAgIGZpbGVOYW1lID0gcGF0aC5qb2luKHBhdGguZGlybmFtZShjb250ZXh0KSwgZmlsZU5hbWUpO1xuICB9XG5cbiAgLy8gRW5zdXJlIGNvbnNpc3RlbmN5IGJ5IG5hbWluZyBhbGwgbW9kdWxlcyBhZnRlciB0aGVpciBhYnNvbHV0ZSBwYXRoc1xuICBmaWxlTmFtZSA9IHBhdGgucmVzb2x2ZShmaWxlTmFtZSk7XG5cbiAgaWYgKHJvb3RNb2R1bGVQYXRoKSB7XG4gICAgZmlsZU5hbWUgPSBwYXRoLnJlbGF0aXZlKHJvb3RNb2R1bGVQYXRoLCBmaWxlTmFtZSk7XG4gIH1cblxuICAvLyBSZXBsYWNlIGNoYXJhY3RlcnMgbm90IHN1cHBvcnRlZCBieSBnb29nLm1vZHVsZS5cbiAgY29uc3QgbW9kdWxlTmFtZSA9XG4gICAgICBmaWxlTmFtZS5yZXBsYWNlKC9cXC98XFxcXC9nLCAnLicpLnJlcGxhY2UoL15bXmEtekEtWl8kXS8sICdfJykucmVwbGFjZSgvW15hLXpBLVowLTkuXyRdL2csICdfJyk7XG5cbiAgcmV0dXJuIG1vZHVsZU5hbWU7XG59XG4iXX0=