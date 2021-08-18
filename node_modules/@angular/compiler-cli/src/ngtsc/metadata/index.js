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
        define("@angular/compiler-cli/src/ngtsc/metadata", ["require", "exports", "@angular/compiler-cli/src/ngtsc/metadata/src/reflector", "@angular/compiler-cli/src/ngtsc/metadata/src/resolver"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <reference types="node" />
    var reflector_1 = require("@angular/compiler-cli/src/ngtsc/metadata/src/reflector");
    exports.TypeScriptReflectionHost = reflector_1.TypeScriptReflectionHost;
    exports.filterToMembersWithDecorator = reflector_1.filterToMembersWithDecorator;
    exports.findMember = reflector_1.findMember;
    exports.reflectObjectLiteral = reflector_1.reflectObjectLiteral;
    exports.reflectTypeEntityToDeclaration = reflector_1.reflectTypeEntityToDeclaration;
    exports.typeNodeToValueExpr = reflector_1.typeNodeToValueExpr;
    var resolver_1 = require("@angular/compiler-cli/src/ngtsc/metadata/src/resolver");
    exports.AbsoluteReference = resolver_1.AbsoluteReference;
    exports.EnumValue = resolver_1.EnumValue;
    exports.ImportMode = resolver_1.ImportMode;
    exports.Reference = resolver_1.Reference;
    exports.ResolvedReference = resolver_1.ResolvedReference;
    exports.isDynamicValue = resolver_1.isDynamicValue;
    exports.staticallyResolve = resolver_1.staticallyResolve;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL21ldGFkYXRhL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBRUgsOEJBQThCO0lBRTlCLG9GQUE4SztJQUF0SywrQ0FBQSx3QkFBd0IsQ0FBQTtJQUFFLG1EQUFBLDRCQUE0QixDQUFBO0lBQUUsaUNBQUEsVUFBVSxDQUFBO0lBQUUsMkNBQUEsb0JBQW9CLENBQUE7SUFBRSxxREFBQSw4QkFBOEIsQ0FBQTtJQUFFLDBDQUFBLG1CQUFtQixDQUFBO0lBQ3JKLGtGQUF3SjtJQUFoSix1Q0FBQSxpQkFBaUIsQ0FBQTtJQUFFLCtCQUFBLFNBQVMsQ0FBQTtJQUFFLGdDQUFBLFVBQVUsQ0FBQTtJQUFFLCtCQUFBLFNBQVMsQ0FBQTtJQUFFLHVDQUFBLGlCQUFpQixDQUFBO0lBQWlCLG9DQUFBLGNBQWMsQ0FBQTtJQUFFLHVDQUFBLGlCQUFpQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vLy8gPHJlZmVyZW5jZSB0eXBlcz1cIm5vZGVcIiAvPlxuXG5leHBvcnQge1R5cGVTY3JpcHRSZWZsZWN0aW9uSG9zdCwgZmlsdGVyVG9NZW1iZXJzV2l0aERlY29yYXRvciwgZmluZE1lbWJlciwgcmVmbGVjdE9iamVjdExpdGVyYWwsIHJlZmxlY3RUeXBlRW50aXR5VG9EZWNsYXJhdGlvbiwgdHlwZU5vZGVUb1ZhbHVlRXhwcn0gZnJvbSAnLi9zcmMvcmVmbGVjdG9yJztcbmV4cG9ydCB7QWJzb2x1dGVSZWZlcmVuY2UsIEVudW1WYWx1ZSwgSW1wb3J0TW9kZSwgUmVmZXJlbmNlLCBSZXNvbHZlZFJlZmVyZW5jZSwgUmVzb2x2ZWRWYWx1ZSwgaXNEeW5hbWljVmFsdWUsIHN0YXRpY2FsbHlSZXNvbHZlfSBmcm9tICcuL3NyYy9yZXNvbHZlcic7XG4iXX0=