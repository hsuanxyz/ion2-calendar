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
        define("@angular/compiler-cli/src/ngtsc/shims", ["require", "exports", "@angular/compiler-cli/src/ngtsc/shims/src/factory_generator", "@angular/compiler-cli/src/ngtsc/shims/src/flat_index_generator", "@angular/compiler-cli/src/ngtsc/shims/src/host", "@angular/compiler-cli/src/ngtsc/shims/src/summary_generator"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <reference types="node" />
    var factory_generator_1 = require("@angular/compiler-cli/src/ngtsc/shims/src/factory_generator");
    exports.FactoryGenerator = factory_generator_1.FactoryGenerator;
    exports.generatedFactoryTransform = factory_generator_1.generatedFactoryTransform;
    var flat_index_generator_1 = require("@angular/compiler-cli/src/ngtsc/shims/src/flat_index_generator");
    exports.FlatIndexGenerator = flat_index_generator_1.FlatIndexGenerator;
    var host_1 = require("@angular/compiler-cli/src/ngtsc/shims/src/host");
    exports.GeneratedShimsHostWrapper = host_1.GeneratedShimsHostWrapper;
    var summary_generator_1 = require("@angular/compiler-cli/src/ngtsc/shims/src/summary_generator");
    exports.SummaryGenerator = summary_generator_1.SummaryGenerator;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3NoaW1zL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBRUgsOEJBQThCO0lBRTlCLGlHQUFpRztJQUF6RiwrQ0FBQSxnQkFBZ0IsQ0FBQTtJQUFlLHdEQUFBLHlCQUF5QixDQUFBO0lBQ2hFLHVHQUE4RDtJQUF0RCxvREFBQSxrQkFBa0IsQ0FBQTtJQUMxQix1RUFBb0U7SUFBNUQsMkNBQUEseUJBQXlCLENBQUE7SUFDakMsaUdBQXlEO0lBQWpELCtDQUFBLGdCQUFnQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vLy8gPHJlZmVyZW5jZSB0eXBlcz1cIm5vZGVcIiAvPlxuXG5leHBvcnQge0ZhY3RvcnlHZW5lcmF0b3IsIEZhY3RvcnlJbmZvLCBnZW5lcmF0ZWRGYWN0b3J5VHJhbnNmb3JtfSBmcm9tICcuL3NyYy9mYWN0b3J5X2dlbmVyYXRvcic7XG5leHBvcnQge0ZsYXRJbmRleEdlbmVyYXRvcn0gZnJvbSAnLi9zcmMvZmxhdF9pbmRleF9nZW5lcmF0b3InO1xuZXhwb3J0IHtHZW5lcmF0ZWRTaGltc0hvc3RXcmFwcGVyLCBTaGltR2VuZXJhdG9yfSBmcm9tICcuL3NyYy9ob3N0JztcbmV4cG9ydCB7U3VtbWFyeUdlbmVyYXRvcn0gZnJvbSAnLi9zcmMvc3VtbWFyeV9nZW5lcmF0b3InO1xuIl19