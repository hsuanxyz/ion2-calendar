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
        define("@angular/compiler/src/render3/view/i18n/serializer", ["require", "exports", "@angular/compiler/src/render3/view/i18n/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require("@angular/compiler/src/render3/view/i18n/util");
    var formatPh = function (value) { return "{$" + util_1.formatI18nPlaceholderName(value) + "}"; };
    /**
     * This visitor walks over i18n tree and generates its string representation,
     * including ICUs and placeholders in {$PLACEHOLDER} format.
     */
    var SerializerVisitor = /** @class */ (function () {
        function SerializerVisitor() {
        }
        SerializerVisitor.prototype.visitText = function (text, context) { return text.value; };
        SerializerVisitor.prototype.visitContainer = function (container, context) {
            var _this = this;
            return container.children.map(function (child) { return child.visit(_this); }).join('');
        };
        SerializerVisitor.prototype.visitIcu = function (icu, context) {
            var _this = this;
            var strCases = Object.keys(icu.cases).map(function (k) { return k + " {" + icu.cases[k].visit(_this) + "}"; });
            return "{" + icu.expressionPlaceholder + ", " + icu.type + ", " + strCases.join(' ') + "}";
        };
        SerializerVisitor.prototype.visitTagPlaceholder = function (ph, context) {
            var _this = this;
            return ph.isVoid ?
                formatPh(ph.startName) :
                "" + formatPh(ph.startName) + ph.children.map(function (child) { return child.visit(_this); }).join('') + formatPh(ph.closeName);
        };
        SerializerVisitor.prototype.visitPlaceholder = function (ph, context) { return formatPh(ph.name); };
        SerializerVisitor.prototype.visitIcuPlaceholder = function (ph, context) { return formatPh(ph.name); };
        return SerializerVisitor;
    }());
    var serializerVisitor = new SerializerVisitor();
    function getSerializedI18nContent(message) {
        return message.nodes.map(function (node) { return node.visit(serializerVisitor, null); }).join('');
    }
    exports.getSerializedI18nContent = getSerializedI18nContent;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWFsaXplci5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2NvbXBpbGVyL3NyYy9yZW5kZXIzL3ZpZXcvaTE4bi9zZXJpYWxpemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBSUgscUVBQWlEO0lBRWpELElBQU0sUUFBUSxHQUFHLFVBQUMsS0FBYSxJQUFhLE9BQUEsT0FBSyxnQ0FBeUIsQ0FBQyxLQUFLLENBQUMsTUFBRyxFQUF4QyxDQUF3QyxDQUFDO0lBRXJGOzs7T0FHRztJQUNIO1FBQUE7UUFzQkEsQ0FBQztRQXJCQyxxQ0FBUyxHQUFULFVBQVUsSUFBZSxFQUFFLE9BQVksSUFBUyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRXBFLDBDQUFjLEdBQWQsVUFBZSxTQUF5QixFQUFFLE9BQVk7WUFBdEQsaUJBRUM7WUFEQyxPQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFJLENBQUMsRUFBakIsQ0FBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNyRSxDQUFDO1FBRUQsb0NBQVEsR0FBUixVQUFTLEdBQWEsRUFBRSxPQUFZO1lBQXBDLGlCQUlDO1lBSEMsSUFBTSxRQUFRLEdBQ1YsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUMsQ0FBUyxJQUFLLE9BQUcsQ0FBQyxVQUFLLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUksQ0FBQyxNQUFHLEVBQXBDLENBQW9DLENBQUMsQ0FBQztZQUNwRixPQUFPLE1BQUksR0FBRyxDQUFDLHFCQUFxQixVQUFLLEdBQUcsQ0FBQyxJQUFJLFVBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBRyxDQUFDO1FBQzlFLENBQUM7UUFFRCwrQ0FBbUIsR0FBbkIsVUFBb0IsRUFBdUIsRUFBRSxPQUFZO1lBQXpELGlCQUlDO1lBSEMsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ2QsUUFBUSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixLQUFHLFFBQVEsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUksQ0FBQyxFQUFqQixDQUFpQixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFHLENBQUM7UUFDbEgsQ0FBQztRQUVELDRDQUFnQixHQUFoQixVQUFpQixFQUFvQixFQUFFLE9BQVksSUFBUyxPQUFPLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXZGLCtDQUFtQixHQUFuQixVQUFvQixFQUF1QixFQUFFLE9BQWEsSUFBUyxPQUFPLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hHLHdCQUFDO0lBQUQsQ0FBQyxBQXRCRCxJQXNCQztJQUVELElBQU0saUJBQWlCLEdBQUcsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO0lBRWxELFNBQWdCLHdCQUF3QixDQUFDLE9BQXFCO1FBQzVELE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxFQUFuQyxDQUFtQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2pGLENBQUM7SUFGRCw0REFFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaTE4biBmcm9tICcuLi8uLi8uLi9pMThuL2kxOG5fYXN0JztcblxuaW1wb3J0IHtmb3JtYXRJMThuUGxhY2Vob2xkZXJOYW1lfSBmcm9tICcuL3V0aWwnO1xuXG5jb25zdCBmb3JtYXRQaCA9ICh2YWx1ZTogc3RyaW5nKTogc3RyaW5nID0+IGB7JCR7Zm9ybWF0STE4blBsYWNlaG9sZGVyTmFtZSh2YWx1ZSl9fWA7XG5cbi8qKlxuICogVGhpcyB2aXNpdG9yIHdhbGtzIG92ZXIgaTE4biB0cmVlIGFuZCBnZW5lcmF0ZXMgaXRzIHN0cmluZyByZXByZXNlbnRhdGlvbixcbiAqIGluY2x1ZGluZyBJQ1VzIGFuZCBwbGFjZWhvbGRlcnMgaW4geyRQTEFDRUhPTERFUn0gZm9ybWF0LlxuICovXG5jbGFzcyBTZXJpYWxpemVyVmlzaXRvciBpbXBsZW1lbnRzIGkxOG4uVmlzaXRvciB7XG4gIHZpc2l0VGV4dCh0ZXh0OiBpMThuLlRleHQsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiB0ZXh0LnZhbHVlOyB9XG5cbiAgdmlzaXRDb250YWluZXIoY29udGFpbmVyOiBpMThuLkNvbnRhaW5lciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gY29udGFpbmVyLmNoaWxkcmVuLm1hcChjaGlsZCA9PiBjaGlsZC52aXNpdCh0aGlzKSkuam9pbignJyk7XG4gIH1cblxuICB2aXNpdEljdShpY3U6IGkxOG4uSWN1LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGNvbnN0IHN0ckNhc2VzID1cbiAgICAgICAgT2JqZWN0LmtleXMoaWN1LmNhc2VzKS5tYXAoKGs6IHN0cmluZykgPT4gYCR7a30geyR7aWN1LmNhc2VzW2tdLnZpc2l0KHRoaXMpfX1gKTtcbiAgICByZXR1cm4gYHske2ljdS5leHByZXNzaW9uUGxhY2Vob2xkZXJ9LCAke2ljdS50eXBlfSwgJHtzdHJDYXNlcy5qb2luKCcgJyl9fWA7XG4gIH1cblxuICB2aXNpdFRhZ1BsYWNlaG9sZGVyKHBoOiBpMThuLlRhZ1BsYWNlaG9sZGVyLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBwaC5pc1ZvaWQgP1xuICAgICAgICBmb3JtYXRQaChwaC5zdGFydE5hbWUpIDpcbiAgICAgICAgYCR7Zm9ybWF0UGgocGguc3RhcnROYW1lKX0ke3BoLmNoaWxkcmVuLm1hcChjaGlsZCA9PiBjaGlsZC52aXNpdCh0aGlzKSkuam9pbignJyl9JHtmb3JtYXRQaChwaC5jbG9zZU5hbWUpfWA7XG4gIH1cblxuICB2aXNpdFBsYWNlaG9sZGVyKHBoOiBpMThuLlBsYWNlaG9sZGVyLCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gZm9ybWF0UGgocGgubmFtZSk7IH1cblxuICB2aXNpdEljdVBsYWNlaG9sZGVyKHBoOiBpMThuLkljdVBsYWNlaG9sZGVyLCBjb250ZXh0PzogYW55KTogYW55IHsgcmV0dXJuIGZvcm1hdFBoKHBoLm5hbWUpOyB9XG59XG5cbmNvbnN0IHNlcmlhbGl6ZXJWaXNpdG9yID0gbmV3IFNlcmlhbGl6ZXJWaXNpdG9yKCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZXJpYWxpemVkSTE4bkNvbnRlbnQobWVzc2FnZTogaTE4bi5NZXNzYWdlKTogc3RyaW5nIHtcbiAgcmV0dXJuIG1lc3NhZ2Uubm9kZXMubWFwKG5vZGUgPT4gbm9kZS52aXNpdChzZXJpYWxpemVyVmlzaXRvciwgbnVsbCkpLmpvaW4oJycpO1xufSJdfQ==