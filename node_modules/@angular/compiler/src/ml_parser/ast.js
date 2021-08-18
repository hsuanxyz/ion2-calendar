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
        define("@angular/compiler/src/ml_parser/ast", ["require", "exports", "tslib", "@angular/compiler/src/ast_path"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var ast_path_1 = require("@angular/compiler/src/ast_path");
    var Text = /** @class */ (function () {
        function Text(value, sourceSpan, i18n) {
            this.value = value;
            this.sourceSpan = sourceSpan;
            this.i18n = i18n;
        }
        Text.prototype.visit = function (visitor, context) { return visitor.visitText(this, context); };
        return Text;
    }());
    exports.Text = Text;
    var Expansion = /** @class */ (function () {
        function Expansion(switchValue, type, cases, sourceSpan, switchValueSourceSpan, i18n) {
            this.switchValue = switchValue;
            this.type = type;
            this.cases = cases;
            this.sourceSpan = sourceSpan;
            this.switchValueSourceSpan = switchValueSourceSpan;
            this.i18n = i18n;
        }
        Expansion.prototype.visit = function (visitor, context) { return visitor.visitExpansion(this, context); };
        return Expansion;
    }());
    exports.Expansion = Expansion;
    var ExpansionCase = /** @class */ (function () {
        function ExpansionCase(value, expression, sourceSpan, valueSourceSpan, expSourceSpan) {
            this.value = value;
            this.expression = expression;
            this.sourceSpan = sourceSpan;
            this.valueSourceSpan = valueSourceSpan;
            this.expSourceSpan = expSourceSpan;
        }
        ExpansionCase.prototype.visit = function (visitor, context) { return visitor.visitExpansionCase(this, context); };
        return ExpansionCase;
    }());
    exports.ExpansionCase = ExpansionCase;
    var Attribute = /** @class */ (function () {
        function Attribute(name, value, sourceSpan, valueSpan, i18n) {
            this.name = name;
            this.value = value;
            this.sourceSpan = sourceSpan;
            this.valueSpan = valueSpan;
            this.i18n = i18n;
        }
        Attribute.prototype.visit = function (visitor, context) { return visitor.visitAttribute(this, context); };
        return Attribute;
    }());
    exports.Attribute = Attribute;
    var Element = /** @class */ (function () {
        function Element(name, attrs, children, sourceSpan, startSourceSpan, endSourceSpan, i18n) {
            if (startSourceSpan === void 0) { startSourceSpan = null; }
            if (endSourceSpan === void 0) { endSourceSpan = null; }
            this.name = name;
            this.attrs = attrs;
            this.children = children;
            this.sourceSpan = sourceSpan;
            this.startSourceSpan = startSourceSpan;
            this.endSourceSpan = endSourceSpan;
            this.i18n = i18n;
        }
        Element.prototype.visit = function (visitor, context) { return visitor.visitElement(this, context); };
        return Element;
    }());
    exports.Element = Element;
    var Comment = /** @class */ (function () {
        function Comment(value, sourceSpan) {
            this.value = value;
            this.sourceSpan = sourceSpan;
        }
        Comment.prototype.visit = function (visitor, context) { return visitor.visitComment(this, context); };
        return Comment;
    }());
    exports.Comment = Comment;
    function visitAll(visitor, nodes, context) {
        if (context === void 0) { context = null; }
        var result = [];
        var visit = visitor.visit ?
            function (ast) { return visitor.visit(ast, context) || ast.visit(visitor, context); } :
            function (ast) { return ast.visit(visitor, context); };
        nodes.forEach(function (ast) {
            var astResult = visit(ast);
            if (astResult) {
                result.push(astResult);
            }
        });
        return result;
    }
    exports.visitAll = visitAll;
    var RecursiveVisitor = /** @class */ (function () {
        function RecursiveVisitor() {
        }
        RecursiveVisitor.prototype.visitElement = function (ast, context) {
            this.visitChildren(context, function (visit) {
                visit(ast.attrs);
                visit(ast.children);
            });
        };
        RecursiveVisitor.prototype.visitAttribute = function (ast, context) { };
        RecursiveVisitor.prototype.visitText = function (ast, context) { };
        RecursiveVisitor.prototype.visitComment = function (ast, context) { };
        RecursiveVisitor.prototype.visitExpansion = function (ast, context) {
            return this.visitChildren(context, function (visit) { visit(ast.cases); });
        };
        RecursiveVisitor.prototype.visitExpansionCase = function (ast, context) { };
        RecursiveVisitor.prototype.visitChildren = function (context, cb) {
            var results = [];
            var t = this;
            function visit(children) {
                if (children)
                    results.push(visitAll(t, children, context));
            }
            cb(visit);
            return [].concat.apply([], results);
        };
        return RecursiveVisitor;
    }());
    exports.RecursiveVisitor = RecursiveVisitor;
    function spanOf(ast) {
        var start = ast.sourceSpan.start.offset;
        var end = ast.sourceSpan.end.offset;
        if (ast instanceof Element) {
            if (ast.endSourceSpan) {
                end = ast.endSourceSpan.end.offset;
            }
            else if (ast.children && ast.children.length) {
                end = spanOf(ast.children[ast.children.length - 1]).end;
            }
        }
        return { start: start, end: end };
    }
    function findNode(nodes, position) {
        var path = [];
        var visitor = new /** @class */ (function (_super) {
            tslib_1.__extends(class_1, _super);
            function class_1() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_1.prototype.visit = function (ast, context) {
                var span = spanOf(ast);
                if (span.start <= position && position < span.end) {
                    path.push(ast);
                }
                else {
                    // Returning a value here will result in the children being skipped.
                    return true;
                }
            };
            return class_1;
        }(RecursiveVisitor));
        visitAll(visitor, nodes);
        return new ast_path_1.AstPath(path, position);
    }
    exports.findNode = findNode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN0LmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvY29tcGlsZXIvc3JjL21sX3BhcnNlci9hc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsMkRBQW9DO0lBU3BDO1FBQ0UsY0FBbUIsS0FBYSxFQUFTLFVBQTJCLEVBQVMsSUFBYztZQUF4RSxVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQVMsZUFBVSxHQUFWLFVBQVUsQ0FBaUI7WUFBUyxTQUFJLEdBQUosSUFBSSxDQUFVO1FBQUcsQ0FBQztRQUMvRixvQkFBSyxHQUFMLFVBQU0sT0FBZ0IsRUFBRSxPQUFZLElBQVMsT0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekYsV0FBQztJQUFELENBQUMsQUFIRCxJQUdDO0lBSFksb0JBQUk7SUFLakI7UUFDRSxtQkFDVyxXQUFtQixFQUFTLElBQVksRUFBUyxLQUFzQixFQUN2RSxVQUEyQixFQUFTLHFCQUFzQyxFQUMxRSxJQUFjO1lBRmQsZ0JBQVcsR0FBWCxXQUFXLENBQVE7WUFBUyxTQUFJLEdBQUosSUFBSSxDQUFRO1lBQVMsVUFBSyxHQUFMLEtBQUssQ0FBaUI7WUFDdkUsZUFBVSxHQUFWLFVBQVUsQ0FBaUI7WUFBUywwQkFBcUIsR0FBckIscUJBQXFCLENBQWlCO1lBQzFFLFNBQUksR0FBSixJQUFJLENBQVU7UUFBRyxDQUFDO1FBQzdCLHlCQUFLLEdBQUwsVUFBTSxPQUFnQixFQUFFLE9BQVksSUFBUyxPQUFPLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5RixnQkFBQztJQUFELENBQUMsQUFORCxJQU1DO0lBTlksOEJBQVM7SUFRdEI7UUFDRSx1QkFDVyxLQUFhLEVBQVMsVUFBa0IsRUFBUyxVQUEyQixFQUM1RSxlQUFnQyxFQUFTLGFB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LENBQUM7Z0JBQ3pCLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxRQUFRLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQ2pELElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ2hCO3FCQUFNO29CQUNMLG9FQUFvRTtvQkFDcEUsT0FBTyxJQUFJLENBQUM7aUJBQ2I7WUFDSCxDQUFDO1lBQ0gsY0FBQztRQUFELENBQUMsQUFWbUIsQ0FBYyxnQkFBZ0IsRUFVakQsQ0FBQztRQUVGLFFBQVEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFekIsT0FBTyxJQUFJLGtCQUFPLENBQU8sSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFsQkQsNEJBa0JDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FzdFBhdGh9IGZyb20gJy4uL2FzdF9wYXRoJztcbmltcG9ydCB7QVNUIGFzIEkxOG5BU1R9IGZyb20gJy4uL2kxOG4vaTE4bl9hc3QnO1xuaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4uL3BhcnNlX3V0aWwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE5vZGUge1xuICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW47XG4gIHZpc2l0KHZpc2l0b3I6IFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueTtcbn1cblxuZXhwb3J0IGNsYXNzIFRleHQgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IocHVibGljIHZhbHVlOiBzdHJpbmcsIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIHB1YmxpYyBpMThuPzogSTE4bkFTVCkge31cbiAgdmlzaXQodmlzaXRvcjogVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIHZpc2l0b3IudmlzaXRUZXh0KHRoaXMsIGNvbnRleHQpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBFeHBhbnNpb24gaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgc3dpdGNoVmFsdWU6IHN0cmluZywgcHVibGljIHR5cGU6IHN0cmluZywgcHVibGljIGNhc2VzOiBFeHBhbnNpb25DYXNlW10sXG4gICAgICBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLCBwdWJsaWMgc3dpdGNoVmFsdWVTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICBwdWJsaWMgaTE4bj86IEkxOG5BU1QpIHt9XG4gIHZpc2l0KHZpc2l0b3I6IFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiB2aXNpdG9yLnZpc2l0RXhwYW5zaW9uKHRoaXMsIGNvbnRleHQpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBFeHBhbnNpb25DYXNlIGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIHZhbHVlOiBzdHJpbmcsIHB1YmxpYyBleHByZXNzaW9uOiBOb2RlW10sIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICBwdWJsaWMgdmFsdWVTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIHB1YmxpYyBleHBTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG5cbiAgdmlzaXQodmlzaXRvcjogVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIHZpc2l0b3IudmlzaXRFeHBhbnNpb25DYXNlKHRoaXMsIGNvbnRleHQpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBBdHRyaWJ1dGUgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgdmFsdWU6IHN0cmluZywgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgIHB1YmxpYyB2YWx1ZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4sIHB1YmxpYyBpMThuPzogSTE4bkFTVCkge31cbiAgdmlzaXQodmlzaXRvcjogVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIHZpc2l0b3IudmlzaXRBdHRyaWJ1dGUodGhpcywgY29udGV4dCk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIEVsZW1lbnQgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgYXR0cnM6IEF0dHJpYnV0ZVtdLCBwdWJsaWMgY2hpbGRyZW46IE5vZGVbXSxcbiAgICAgIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIHB1YmxpYyBzdGFydFNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsID0gbnVsbCxcbiAgICAgIHB1YmxpYyBlbmRTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW58bnVsbCA9IG51bGwsIHB1YmxpYyBpMThuPzogSTE4bkFTVCkge31cbiAgdmlzaXQodmlzaXRvcjogVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIHZpc2l0b3IudmlzaXRFbGVtZW50KHRoaXMsIGNvbnRleHQpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb21tZW50IGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2YWx1ZTogc3RyaW5nfG51bGwsIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG4gIHZpc2l0KHZpc2l0b3I6IFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiB2aXNpdG9yLnZpc2l0Q29tbWVudCh0aGlzLCBjb250ZXh0KTsgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFZpc2l0b3Ige1xuICAvLyBSZXR1cm5pbmcgYSB0cnV0aHkgdmFsdWUgZnJvbSBgdmlzaXQoKWAgd2lsbCBwcmV2ZW50IGB2aXNpdEFsbCgpYCBmcm9tIHRoZSBjYWxsIHRvIHRoZSB0eXBlZFxuICAvLyBtZXRob2QgYW5kIHJlc3VsdCByZXR1cm5lZCB3aWxsIGJlY29tZSB0aGUgcmVzdWx0IGluY2x1ZGVkIGluIGB2aXNpdEFsbCgpYHMgcmVzdWx0IGFycmF5LlxuICB2aXNpdD8obm9kZTogTm9kZSwgY29udGV4dDogYW55KTogYW55O1xuXG4gIHZpc2l0RWxlbWVudChlbGVtZW50OiBFbGVtZW50LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0QXR0cmlidXRlKGF0dHJpYnV0ZTogQXR0cmlidXRlLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0VGV4dCh0ZXh0OiBUZXh0LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0Q29tbWVudChjb21tZW50OiBDb21tZW50LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0RXhwYW5zaW9uKGV4cGFuc2lvbjogRXhwYW5zaW9uLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0RXhwYW5zaW9uQ2FzZShleHBhbnNpb25DYXNlOiBFeHBhbnNpb25DYXNlLCBjb250ZXh0OiBhbnkpOiBhbnk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2aXNpdEFsbCh2aXNpdG9yOiBWaXNpdG9yLCBub2RlczogTm9kZVtdLCBjb250ZXh0OiBhbnkgPSBudWxsKTogYW55W10ge1xuICBjb25zdCByZXN1bHQ6IGFueVtdID0gW107XG5cbiAgY29uc3QgdmlzaXQgPSB2aXNpdG9yLnZpc2l0ID9cbiAgICAgIChhc3Q6IE5vZGUpID0+IHZpc2l0b3IudmlzaXQgIShhc3QsIGNvbnRleHQpIHx8IGFzdC52aXNpdCh2aXNpdG9yLCBjb250ZXh0KSA6XG4gICAgICAoYXN0OiBOb2RlKSA9PiBhc3QudmlzaXQodmlzaXRvciwgY29udGV4dCk7XG4gIG5vZGVzLmZvckVhY2goYXN0ID0+IHtcbiAgICBjb25zdCBhc3RSZXN1bHQgPSB2aXNpdChhc3QpO1xuICAgIGlmIChhc3RSZXN1bHQpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGFzdFJlc3VsdCk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGNsYXNzIFJlY3Vyc2l2ZVZpc2l0b3IgaW1wbGVtZW50cyBWaXNpdG9yIHtcbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIHZpc2l0RWxlbWVudChhc3Q6IEVsZW1lbnQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdGhpcy52aXNpdENoaWxkcmVuKGNvbnRleHQsIHZpc2l0ID0+IHtcbiAgICAgIHZpc2l0KGFzdC5hdHRycyk7XG4gICAgICB2aXNpdChhc3QuY2hpbGRyZW4pO1xuICAgIH0pO1xuICB9XG5cbiAgdmlzaXRBdHRyaWJ1dGUoYXN0OiBBdHRyaWJ1dGUsIGNvbnRleHQ6IGFueSk6IGFueSB7fVxuICB2aXNpdFRleHQoYXN0OiBUZXh0LCBjb250ZXh0OiBhbnkpOiBhbnkge31cbiAgdmlzaXRDb21tZW50KGFzdDogQ29tbWVudCwgY29udGV4dDogYW55KTogYW55IHt9XG5cbiAgdmlzaXRFeHBhbnNpb24oYXN0OiBFeHBhbnNpb24sIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMudmlzaXRDaGlsZHJlbihjb250ZXh0LCB2aXNpdCA9PiB7IHZpc2l0KGFzdC5jYXNlcyk7IH0pO1xuICB9XG5cbiAgdmlzaXRFeHBhbnNpb25DYXNlKGFzdDogRXhwYW5zaW9uQ2FzZSwgY29udGV4dDogYW55KTogYW55IHt9XG5cbiAgcHJpdmF0ZSB2aXNpdENoaWxkcmVuPFQgZXh0ZW5kcyBOb2RlPihcbiAgICAgIGNvbnRleHQ6IGFueSwgY2I6ICh2aXNpdDogKDxWIGV4dGVuZHMgTm9kZT4oY2hpbGRyZW46IFZbXXx1bmRlZmluZWQpID0+IHZvaWQpKSA9PiB2b2lkKSB7XG4gICAgbGV0IHJlc3VsdHM6IGFueVtdW10gPSBbXTtcbiAgICBsZXQgdCA9IHRoaXM7XG4gICAgZnVuY3Rpb24gdmlzaXQ8VCBleHRlbmRzIE5vZGU+KGNoaWxkcmVuOiBUW10gfCB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChjaGlsZHJlbikgcmVzdWx0cy5wdXNoKHZpc2l0QWxsKHQsIGNoaWxkcmVuLCBjb250ZXh0KSk7XG4gICAgfVxuICAgIGNiKHZpc2l0KTtcbiAgICByZXR1cm4gW10uY29uY2F0LmFwcGx5KFtdLCByZXN1bHRzKTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBIdG1sQXN0UGF0aCA9IEFzdFBhdGg8Tm9kZT47XG5cbmZ1bmN0aW9uIHNwYW5PZihhc3Q6IE5vZGUpIHtcbiAgY29uc3Qgc3RhcnQgPSBhc3Quc291cmNlU3Bhbi5zdGFydC5vZmZzZXQ7XG4gIGxldCBlbmQgPSBhc3Quc291cmNlU3Bhbi5lbmQub2Zmc2V0O1xuICBpZiAoYXN0IGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgIGlmIChhc3QuZW5kU291cmNlU3Bhbikge1xuICAgICAgZW5kID0gYXN0LmVuZFNvdXJjZVNwYW4uZW5kLm9mZnNldDtcbiAgICB9IGVsc2UgaWYgKGFzdC5jaGlsZHJlbiAmJiBhc3QuY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICBlbmQgPSBzcGFuT2YoYXN0LmNoaWxkcmVuW2FzdC5jaGlsZHJlbi5sZW5ndGggLSAxXSkuZW5kO1xuICAgIH1cbiAgfVxuICByZXR1cm4ge3N0YXJ0LCBlbmR9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZE5vZGUobm9kZXM6IE5vZGVbXSwgcG9zaXRpb246IG51bWJlcik6IEh0bWxBc3RQYXRoIHtcbiAgY29uc3QgcGF0aDogTm9kZVtdID0gW107XG5cbiAgY29uc3QgdmlzaXRvciA9IG5ldyBjbGFzcyBleHRlbmRzIFJlY3Vyc2l2ZVZpc2l0b3Ige1xuICAgIHZpc2l0KGFzdDogTm9kZSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICAgIGNvbnN0IHNwYW4gPSBzcGFuT2YoYXN0KTtcbiAgICAgIGlmIChzcGFuLnN0YXJ0IDw9IHBvc2l0aW9uICYmIHBvc2l0aW9uIDwgc3Bhbi5lbmQpIHtcbiAgICAgICAgcGF0aC5wdXNoKGFzdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBSZXR1cm5pbmcgYSB2YWx1ZSBoZXJlIHdpbGwgcmVzdWx0IGluIHRoZSBjaGlsZHJlbiBiZWluZyBza2lwcGVkLlxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgdmlzaXRBbGwodmlzaXRvciwgbm9kZXMpO1xuXG4gIHJldHVybiBuZXcgQXN0UGF0aDxOb2RlPihwYXRoLCBwb3NpdGlvbik7XG59Il19