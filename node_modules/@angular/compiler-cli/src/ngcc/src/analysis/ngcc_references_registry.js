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
        define("@angular/compiler-cli/src/ngcc/src/analysis/ngcc_references_registry", ["require", "exports", "@angular/compiler-cli/src/ngtsc/metadata", "@angular/compiler-cli/src/ngcc/src/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var metadata_1 = require("@angular/compiler-cli/src/ngtsc/metadata");
    var utils_1 = require("@angular/compiler-cli/src/ngcc/src/utils");
    /**
     * This is a place for DecoratorHandlers to register references that they
     * find in their analysis of the code.
     *
     * This registry is used to ensure that these references are publicly exported
     * from libraries that are compiled by ngcc.
     */
    var NgccReferencesRegistry = /** @class */ (function () {
        function NgccReferencesRegistry(host) {
            this.host = host;
            this.map = new Map();
        }
        /**
         * Register one or more references in the registry.
         * Only `ResolveReference` references are stored. Other types are ignored.
         * @param references A collection of references to register.
         */
        NgccReferencesRegistry.prototype.add = function () {
            var _this = this;
            var references = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                references[_i] = arguments[_i];
            }
            references.forEach(function (ref) {
                // Only store resolved references. We are not interested in literals.
                if (ref instanceof metadata_1.ResolvedReference && utils_1.hasNameIdentifier(ref.node)) {
                    var declaration = _this.host.getDeclarationOfIdentifier(ref.node.name);
                    if (declaration && utils_1.hasNameIdentifier(declaration.node)) {
                        _this.map.set(declaration.node.name, declaration);
                    }
                }
            });
        };
        /**
         * Create and return a mapping for the registered resolved references.
         * @returns A map of reference identifiers to reference declarations.
         */
        NgccReferencesRegistry.prototype.getDeclarationMap = function () { return this.map; };
        return NgccReferencesRegistry;
    }());
    exports.NgccReferencesRegistry = NgccReferencesRegistry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdjY19yZWZlcmVuY2VzX3JlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ2NjL3NyYy9hbmFseXNpcy9uZ2NjX3JlZmVyZW5jZXNfcmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFLSCxxRUFBcUU7SUFDckUsa0VBQTJDO0lBRTNDOzs7Ozs7T0FNRztJQUNIO1FBR0UsZ0NBQW9CLElBQW9CO1lBQXBCLFNBQUksR0FBSixJQUFJLENBQWdCO1lBRmhDLFFBQUcsR0FBRyxJQUFJLEdBQUcsRUFBOEIsQ0FBQztRQUVULENBQUM7UUFFNUM7Ozs7V0FJRztRQUNILG9DQUFHLEdBQUg7WUFBQSxpQkFVQztZQVZHLG9CQUEwQztpQkFBMUMsVUFBMEMsRUFBMUMscUJBQTBDLEVBQTFDLElBQTBDO2dCQUExQywrQkFBMEM7O1lBQzVDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHO2dCQUNwQixxRUFBcUU7Z0JBQ3JFLElBQUksR0FBRyxZQUFZLDRCQUFpQixJQUFJLHlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDbkUsSUFBTSxXQUFXLEdBQUcsS0FBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN4RSxJQUFJLFdBQVcsSUFBSSx5QkFBaUIsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7d0JBQ3RELEtBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO3FCQUNsRDtpQkFDRjtZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVEOzs7V0FHRztRQUNILGtEQUFpQixHQUFqQixjQUF1RCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzNFLDZCQUFDO0lBQUQsQ0FBQyxBQTNCRCxJQTJCQztJQTNCWSx3REFBc0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtSZWZlcmVuY2VzUmVnaXN0cnl9IGZyb20gJy4uLy4uLy4uL25ndHNjL2Fubm90YXRpb25zJztcbmltcG9ydCB7RGVjbGFyYXRpb24sIFJlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi8uLi8uLi9uZ3RzYy9ob3N0JztcbmltcG9ydCB7UmVmZXJlbmNlLCBSZXNvbHZlZFJlZmVyZW5jZX0gZnJvbSAnLi4vLi4vLi4vbmd0c2MvbWV0YWRhdGEnO1xuaW1wb3J0IHtoYXNOYW1lSWRlbnRpZmllcn0gZnJvbSAnLi4vdXRpbHMnO1xuXG4vKipcbiAqIFRoaXMgaXMgYSBwbGFjZSBmb3IgRGVjb3JhdG9ySGFuZGxlcnMgdG8gcmVnaXN0ZXIgcmVmZXJlbmNlcyB0aGF0IHRoZXlcbiAqIGZpbmQgaW4gdGhlaXIgYW5hbHlzaXMgb2YgdGhlIGNvZGUuXG4gKlxuICogVGhpcyByZWdpc3RyeSBpcyB1c2VkIHRvIGVuc3VyZSB0aGF0IHRoZXNlIHJlZmVyZW5jZXMgYXJlIHB1YmxpY2x5IGV4cG9ydGVkXG4gKiBmcm9tIGxpYnJhcmllcyB0aGF0IGFyZSBjb21waWxlZCBieSBuZ2NjLlxuICovXG5leHBvcnQgY2xhc3MgTmdjY1JlZmVyZW5jZXNSZWdpc3RyeSBpbXBsZW1lbnRzIFJlZmVyZW5jZXNSZWdpc3RyeSB7XG4gIHByaXZhdGUgbWFwID0gbmV3IE1hcDx0cy5JZGVudGlmaWVyLCBEZWNsYXJhdGlvbj4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGhvc3Q6IFJlZmxlY3Rpb25Ib3N0KSB7fVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBvbmUgb3IgbW9yZSByZWZlcmVuY2VzIGluIHRoZSByZWdpc3RyeS5cbiAgICogT25seSBgUmVzb2x2ZVJlZmVyZW5jZWAgcmVmZXJlbmNlcyBhcmUgc3RvcmVkLiBPdGhlciB0eXBlcyBhcmUgaWdub3JlZC5cbiAgICogQHBhcmFtIHJlZmVyZW5jZXMgQSBjb2xsZWN0aW9uIG9mIHJlZmVyZW5jZXMgdG8gcmVnaXN0ZXIuXG4gICAqL1xuICBhZGQoLi4ucmVmZXJlbmNlczogUmVmZXJlbmNlPHRzLkRlY2xhcmF0aW9uPltdKTogdm9pZCB7XG4gICAgcmVmZXJlbmNlcy5mb3JFYWNoKHJlZiA9PiB7XG4gICAgICAvLyBPbmx5IHN0b3JlIHJlc29sdmVkIHJlZmVyZW5jZXMuIFdlIGFyZSBub3QgaW50ZXJlc3RlZCBpbiBsaXRlcmFscy5cbiAgICAgIGlmIChyZWYgaW5zdGFuY2VvZiBSZXNvbHZlZFJlZmVyZW5jZSAmJiBoYXNOYW1lSWRlbnRpZmllcihyZWYubm9kZSkpIHtcbiAgICAgICAgY29uc3QgZGVjbGFyYXRpb24gPSB0aGlzLmhvc3QuZ2V0RGVjbGFyYXRpb25PZklkZW50aWZpZXIocmVmLm5vZGUubmFtZSk7XG4gICAgICAgIGlmIChkZWNsYXJhdGlvbiAmJiBoYXNOYW1lSWRlbnRpZmllcihkZWNsYXJhdGlvbi5ub2RlKSkge1xuICAgICAgICAgIHRoaXMubWFwLnNldChkZWNsYXJhdGlvbi5ub2RlLm5hbWUsIGRlY2xhcmF0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhbmQgcmV0dXJuIGEgbWFwcGluZyBmb3IgdGhlIHJlZ2lzdGVyZWQgcmVzb2x2ZWQgcmVmZXJlbmNlcy5cbiAgICogQHJldHVybnMgQSBtYXAgb2YgcmVmZXJlbmNlIGlkZW50aWZpZXJzIHRvIHJlZmVyZW5jZSBkZWNsYXJhdGlvbnMuXG4gICAqL1xuICBnZXREZWNsYXJhdGlvbk1hcCgpOiBNYXA8dHMuSWRlbnRpZmllciwgRGVjbGFyYXRpb24+IHsgcmV0dXJuIHRoaXMubWFwOyB9XG59XG4iXX0=