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
        define("@angular/compiler-cli/src/ngtsc/annotations/src/references_registry", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * This registry does nothing, since ngtsc does not currently need
     * this functionality.
     * The ngcc tool implements a working version for its purposes.
     */
    var NoopReferencesRegistry = /** @class */ (function () {
        function NoopReferencesRegistry() {
        }
        NoopReferencesRegistry.prototype.add = function () {
            var references = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                references[_i] = arguments[_i];
            }
        };
        NoopReferencesRegistry.prototype.getDeclarationMap = function () { return new Map(); };
        return NoopReferencesRegistry;
    }());
    exports.NoopReferencesRegistry = NoopReferencesRegistry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmZXJlbmNlc19yZWdpc3RyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvYW5ub3RhdGlvbnMvc3JjL3JlZmVyZW5jZXNfcmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUF3Qkg7Ozs7T0FJRztJQUNIO1FBQUE7UUFHQSxDQUFDO1FBRkMsb0NBQUcsR0FBSDtZQUFJLG9CQUEwQztpQkFBMUMsVUFBMEMsRUFBMUMscUJBQTBDLEVBQTFDLElBQTBDO2dCQUExQywrQkFBMEM7O1FBQVMsQ0FBQztRQUN4RCxrREFBaUIsR0FBakIsY0FBdUQsT0FBTyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM1RSw2QkFBQztJQUFELENBQUMsQUFIRCxJQUdDO0lBSFksd0RBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7RGVjbGFyYXRpb259IGZyb20gJy4uLy4uL2hvc3QnO1xuaW1wb3J0IHtSZWZlcmVuY2V9IGZyb20gJy4uLy4uL21ldGFkYXRhJztcblxuLyoqXG4gKiBJbXBsZW1lbnQgdGhpcyBpbnRlcmZhY2UgaWYgeW91IHdhbnQgRGVjb3JhdG9ySGFuZGxlcnMgdG8gcmVnaXN0ZXJcbiAqIHJlZmVyZW5jZXMgdGhhdCB0aGV5IGZpbmQgaW4gdGhlaXIgYW5hbHlzaXMgb2YgdGhlIGNvZGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVmZXJlbmNlc1JlZ2lzdHJ5IHtcbiAgLyoqXG4gICAqIFJlZ2lzdGVyIG9uZSBvciBtb3JlIHJlZmVyZW5jZXMgaW4gdGhlIHJlZ2lzdHJ5LlxuICAgKiBPbmx5IGBSZXNvbHZlUmVmZXJlbmNlYCByZWZlcmVuY2VzIGFyZSBzdG9yZWQuIE90aGVyIHR5cGVzIGFyZSBpZ25vcmVkLlxuICAgKiBAcGFyYW0gcmVmZXJlbmNlcyBBIGNvbGxlY3Rpb24gb2YgcmVmZXJlbmNlcyB0byByZWdpc3Rlci5cbiAgICovXG4gIGFkZCguLi5yZWZlcmVuY2VzOiBSZWZlcmVuY2U8dHMuRGVjbGFyYXRpb24+W10pOiB2b2lkO1xuICAvKipcbiAgICogQ3JlYXRlIGFuZCByZXR1cm4gYSBtYXBwaW5nIGZvciB0aGUgcmVnaXN0ZXJlZCByZXNvbHZlZCByZWZlcmVuY2VzLlxuICAgKiBAcmV0dXJucyBBIG1hcCBvZiByZWZlcmVuY2UgaWRlbnRpZmllcnMgdG8gcmVmZXJlbmNlIGRlY2xhcmF0aW9ucy5cbiAgICovXG4gIGdldERlY2xhcmF0aW9uTWFwKCk6IE1hcDx0cy5JZGVudGlmaWVyLCBEZWNsYXJhdGlvbj47XG59XG5cbi8qKlxuICogVGhpcyByZWdpc3RyeSBkb2VzIG5vdGhpbmcsIHNpbmNlIG5ndHNjIGRvZXMgbm90IGN1cnJlbnRseSBuZWVkXG4gKiB0aGlzIGZ1bmN0aW9uYWxpdHkuXG4gKiBUaGUgbmdjYyB0b29sIGltcGxlbWVudHMgYSB3b3JraW5nIHZlcnNpb24gZm9yIGl0cyBwdXJwb3Nlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIE5vb3BSZWZlcmVuY2VzUmVnaXN0cnkgaW1wbGVtZW50cyBSZWZlcmVuY2VzUmVnaXN0cnkge1xuICBhZGQoLi4ucmVmZXJlbmNlczogUmVmZXJlbmNlPHRzLkRlY2xhcmF0aW9uPltdKTogdm9pZCB7fVxuICBnZXREZWNsYXJhdGlvbk1hcCgpOiBNYXA8dHMuSWRlbnRpZmllciwgRGVjbGFyYXRpb24+IHsgcmV0dXJuIG5ldyBNYXAoKTsgfVxufSJdfQ==