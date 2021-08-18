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
        define("@angular/compiler-cli/src/ngcc/src/rendering/ngcc_import_manager", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/translator"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var translator_1 = require("@angular/compiler-cli/src/ngtsc/translator");
    var NgccImportManager = /** @class */ (function (_super) {
        tslib_1.__extends(NgccImportManager, _super);
        function NgccImportManager(isFlat, isCore, prefix) {
            var _this = _super.call(this, isCore, prefix) || this;
            _this.isFlat = isFlat;
            return _this;
        }
        NgccImportManager.prototype.generateNamedImport = function (moduleName, symbol) {
            if (this.isFlat && this.isCore && moduleName === '@angular/core') {
                return { moduleImport: null, symbol: this.rewriteSymbol(moduleName, symbol) };
            }
            return _super.prototype.generateNamedImport.call(this, moduleName, symbol);
        };
        return NgccImportManager;
    }(translator_1.ImportManager));
    exports.NgccImportManager = NgccImportManager;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdjY19pbXBvcnRfbWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmdjYy9zcmMvcmVuZGVyaW5nL25nY2NfaW1wb3J0X21hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgseUVBQXdEO0lBRXhEO1FBQXVDLDZDQUFhO1FBQ2xELDJCQUFvQixNQUFlLEVBQUUsTUFBZSxFQUFFLE1BQWU7WUFBckUsWUFBeUUsa0JBQU0sTUFBTSxFQUFFLE1BQU0sQ0FBQyxTQUFHO1lBQTdFLFlBQU0sR0FBTixNQUFNLENBQVM7O1FBQTZELENBQUM7UUFFakcsK0NBQW1CLEdBQW5CLFVBQW9CLFVBQWtCLEVBQUUsTUFBYztZQUVwRCxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxVQUFVLEtBQUssZUFBZSxFQUFFO2dCQUNoRSxPQUFPLEVBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLEVBQUMsQ0FBQzthQUM3RTtZQUNELE9BQU8saUJBQU0sbUJBQW1CLFlBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFDSCx3QkFBQztJQUFELENBQUMsQUFWRCxDQUF1QywwQkFBYSxHQVVuRDtJQVZZLDhDQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIlxuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0ltcG9ydE1hbmFnZXJ9IGZyb20gJy4uLy4uLy4uL25ndHNjL3RyYW5zbGF0b3InO1xuXG5leHBvcnQgY2xhc3MgTmdjY0ltcG9ydE1hbmFnZXIgZXh0ZW5kcyBJbXBvcnRNYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBpc0ZsYXQ6IGJvb2xlYW4sIGlzQ29yZTogYm9vbGVhbiwgcHJlZml4Pzogc3RyaW5nKSB7IHN1cGVyKGlzQ29yZSwgcHJlZml4KTsgfVxuXG4gIGdlbmVyYXRlTmFtZWRJbXBvcnQobW9kdWxlTmFtZTogc3RyaW5nLCBzeW1ib2w6IHN0cmluZyk6XG4gICAgICB7bW9kdWxlSW1wb3J0OiBzdHJpbmcgfCBudWxsLCBzeW1ib2w6IHN0cmluZ30ge1xuICAgIGlmICh0aGlzLmlzRmxhdCAmJiB0aGlzLmlzQ29yZSAmJiBtb2R1bGVOYW1lID09PSAnQGFuZ3VsYXIvY29yZScpIHtcbiAgICAgIHJldHVybiB7bW9kdWxlSW1wb3J0OiBudWxsLCBzeW1ib2w6IHRoaXMucmV3cml0ZVN5bWJvbChtb2R1bGVOYW1lLCBzeW1ib2wpfTtcbiAgICB9XG4gICAgcmV0dXJuIHN1cGVyLmdlbmVyYXRlTmFtZWRJbXBvcnQobW9kdWxlTmFtZSwgc3ltYm9sKTtcbiAgfVxufVxuIl19