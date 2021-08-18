/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/class_decorator_downlevel_transformer", ["require", "exports", "tsickle/src/decorator-annotator", "tsickle/src/transformer_util", "tsickle/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var decorator_annotator_1 = require("tsickle/src/decorator-annotator");
    var transformer_util_1 = require("tsickle/src/transformer_util");
    var ts = require("tsickle/src/typescript");
    /**
     * Creates the AST for the decorator field type annotation, which has the form
     * { type: Function, args?: any[] }[]
     */
    function createClassDecoratorType() {
        var typeElements = [];
        typeElements.push(ts.createPropertySignature(undefined, 'type', undefined, ts.createTypeReferenceNode(ts.createIdentifier('Function'), undefined), undefined));
        typeElements.push(ts.createPropertySignature(undefined, 'args', ts.createToken(ts.SyntaxKind.QuestionToken), ts.createArrayTypeNode(ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)), undefined));
        return ts.createArrayTypeNode(ts.createTypeLiteralNode(typeElements));
    }
    /**
     * Extracts the type of the decorator, as well as all the arguments passed to
     * the decorator.  Returns an AST with the form
     * { type: decorator, args: [arg1, arg2] }
     */
    function extractMetadataFromSingleDecorator(decorator, diagnostics) {
        var metadataProperties = [];
        var expr = decorator.expression;
        switch (expr.kind) {
            case ts.SyntaxKind.Identifier:
                // The decorator was a plain @Foo.
                metadataProperties.push(ts.createPropertyAssignment('type', expr));
                break;
            case ts.SyntaxKind.CallExpression:
                // The decorator was a call, like @Foo(bar).
                var call = expr;
                metadataProperties.push(ts.createPropertyAssignment('type', call.expression));
                if (call.arguments.length) {
                    var args = [];
                    try {
                        for (var _a = __values(call.arguments), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var arg = _b.value;
                            args.push(arg);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    var argsArrayLiteral = ts.createArrayLiteral(args);
                    argsArrayLiteral.elements.hasTrailingComma = true;
                    metadataProperties.push(ts.createPropertyAssignment('args', argsArrayLiteral));
                }
                break;
            default:
                diagnostics.push({
                    file: decorator.getSourceFile(),
                    start: decorator.getStart(),
                    length: decorator.getEnd() - decorator.getStart(),
                    messageText: ts.SyntaxKind[decorator.kind] + " not implemented in gathering decorator metadata",
                    category: ts.DiagnosticCategory.Error,
                    code: 0,
                });
                break;
        }
        return ts.createObjectLiteral(metadataProperties);
        var e_1, _c;
    }
    /**
     * Takes a list of decorator metadata object ASTs and produces an AST for a
     * static class property of an array of those metadata objects.
     */
    function createDecoratorClassProperty(decoratorList) {
        var modifier = ts.createToken(ts.SyntaxKind.StaticKeyword);
        var type = createClassDecoratorType();
        var initializer = ts.createArrayLiteral(decoratorList, true);
        initializer.elements.hasTrailingComma = true;
        return ts.createProperty(undefined, [modifier], 'decorators', undefined, type, initializer);
    }
    function isNameEqual(classMember, name) {
        if (classMember.name === undefined) {
            return false;
        }
        var id = classMember.name;
        return id.text === name;
    }
    /**
     * Inserts the decorator metadata property in the place that the old
     * decorator-annotator visitor would put it, so the unit tests don't have to
     * change.
     * TODO(lucassloan): remove this when all 3 properties are put in via
     * transformers
     */
    function insertBeforeDecoratorProperties(classMembers, decoratorMetadata) {
        var insertionPoint = classMembers.findIndex(function (m) { return isNameEqual(m, 'ctorParameters') || isNameEqual(m, 'propDecorators'); });
        if (insertionPoint === -1) {
            insertionPoint = classMembers.length; // Insert at end of list
        }
        var members = __spread(classMembers.slice(0, insertionPoint), [
            decoratorMetadata
        ], classMembers.slice(insertionPoint));
        return ts.setTextRange(ts.createNodeArray(members, classMembers.hasTrailingComma), classMembers);
    }
    function classDecoratorDownlevelTransformer(typeChecker, diagnostics) {
        return function (context) {
            var visitor = function (node) {
                switch (node.kind) {
                    case ts.SyntaxKind.ClassDeclaration:
                        var cd = transformer_util_1.visitEachChild(node, visitor, context);
                        var decorators = cd.decorators;
                        if (decorators === undefined || decorators.length === 0)
                            return cd;
                        var decoratorList = [];
                        var decoratorsToKeep = [];
                        try {
                            for (var decorators_1 = __values(decorators), decorators_1_1 = decorators_1.next(); !decorators_1_1.done; decorators_1_1 = decorators_1.next()) {
                                var decorator = decorators_1_1.value;
                                if (decorator_annotator_1.shouldLower(decorator, typeChecker)) {
                                    decoratorList.push(extractMetadataFromSingleDecorator(decorator, diagnostics));
                                }
                                else {
                                    decoratorsToKeep.push(decorator);
                                }
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (decorators_1_1 && !decorators_1_1.done && (_a = decorators_1.return)) _a.call(decorators_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        if (decoratorList.length === 0)
                            return cd;
                        var newClassDeclaration = ts.getMutableClone(cd);
                        newClassDeclaration.members = insertBeforeDecoratorProperties(newClassDeclaration.members, createDecoratorClassProperty(decoratorList));
                        newClassDeclaration.decorators =
                            decoratorsToKeep.length ? ts.createNodeArray(decoratorsToKeep) : undefined;
                        return newClassDeclaration;
                    default:
                        return transformer_util_1.visitEachChild(node, visitor, context);
                }
                var e_2, _a;
            };
            return function (sf) { return visitor(sf); };
        };
    }
    exports.classDecoratorDownlevelTransformer = classDecoratorDownlevelTransformer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3NfZGVjb3JhdG9yX2Rvd25sZXZlbF90cmFuc2Zvcm1lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGFzc19kZWNvcmF0b3JfZG93bmxldmVsX3RyYW5zZm9ybWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRUgsdUVBQWtEO0lBQ2xELGlFQUFrRDtJQUNsRCwyQ0FBbUM7SUFFbkM7OztPQUdHO0lBQ0g7UUFDRSxJQUFNLFlBQVksR0FBcUIsRUFBRSxDQUFDO1FBQzFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLHVCQUF1QixDQUN4QyxTQUFTLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFDNUIsRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsRUFBRSxTQUFTLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3hGLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLHVCQUF1QixDQUN4QyxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsRUFDOUQsRUFBRSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUM1RixNQUFNLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsNENBQTRDLFNBQXVCLEVBQUUsV0FBNEI7UUFDL0YsSUFBTSxrQkFBa0IsR0FBa0MsRUFBRSxDQUFDO1FBQzdELElBQU0sSUFB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QyxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUNsRCxDQUFDOztZQUNILENBQUMsQ0FBQztZQUVGLE1BQU0sQ0FBQyxVQUFDLEVBQWlCLElBQUssT0FBQSxPQUFPLENBQUMsRUFBRSxDQUFrQixFQUE1QixDQUE0QixDQUFDO1FBQzdELENBQUMsQ0FBQztJQUNKLENBQUM7SUF4Q0QsZ0ZBd0NDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3Nob3VsZExvd2VyfSBmcm9tICcuL2RlY29yYXRvci1hbm5vdGF0b3InO1xuaW1wb3J0IHt2aXNpdEVhY2hDaGlsZH0gZnJvbSAnLi90cmFuc2Zvcm1lcl91dGlsJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJy4vdHlwZXNjcmlwdCc7XG5cbi8qKlxuICogQ3JlYXRlcyB0aGUgQVNUIGZvciB0aGUgZGVjb3JhdG9yIGZpZWxkIHR5cGUgYW5ub3RhdGlvbiwgd2hpY2ggaGFzIHRoZSBmb3JtXG4gKiB7IHR5cGU6IEZ1bmN0aW9uLCBhcmdzPzogYW55W10gfVtdXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUNsYXNzRGVjb3JhdG9yVHlwZSgpIHtcbiAgY29uc3QgdHlwZUVsZW1lbnRzOiB0cy5UeXBlRWxlbWVudFtdID0gW107XG4gIHR5cGVFbGVtZW50cy5wdXNoKHRzLmNyZWF0ZVByb3BlcnR5U2lnbmF0dXJlKFxuICAgICAgdW5kZWZpbmVkLCAndHlwZScsIHVuZGVmaW5lZCxcbiAgICAgIHRzLmNyZWF0ZVR5cGVSZWZlcmVuY2VOb2RlKHRzLmNyZWF0ZUlkZW50aWZpZXIoJ0Z1bmN0aW9uJyksIHVuZGVmaW5lZCksIHVuZGVmaW5lZCkpO1xuICB0eXBlRWxlbWVudHMucHVzaCh0cy5jcmVhdGVQcm9wZXJ0eVNpZ25hdHVyZShcbiAgICAgIHVuZGVmaW5lZCwgJ2FyZ3MnLCB0cy5jcmVhdGVUb2tlbih0cy5TeW50YXhLaW5kLlF1ZXN0aW9uVG9rZW4pLFxuICAgICAgdHMuY3JlYXRlQXJyYXlUeXBlTm9kZSh0cy5jcmVhdGVLZXl3b3JkVHlwZU5vZGUodHMuU3ludGF4S2luZC5BbnlLZXl3b3JkKSksIHVuZGVmaW5lZCkpO1xuICByZXR1cm4gdHMuY3JlYXRlQXJyYXlUeXBlTm9kZSh0cy5jcmVhdGVUeXBlTGl0ZXJhbE5vZGUodHlwZUVsZW1lbnRzKSk7XG59XG5cbi8qKlxuICogRXh0cmFjdHMgdGhlIHR5cGUgb2YgdGhlIGRlY29yYXRvciwgYXMgd2VsbCBhcyBhbGwgdGhlIGFyZ3VtZW50cyBwYXNzZWQgdG9cbiAqIHRoZSBkZWNvcmF0b3IuICBSZXR1cm5zIGFuIEFTVCB3aXRoIHRoZSBmb3JtXG4gKiB7IHR5cGU6IGRlY29yYXRvciwgYXJnczogW2FyZzEsIGFyZzJdIH1cbiAqL1xuZnVuY3Rpb24gZXh0cmFjdE1ldGFkYXRhRnJvbVNpbmdsZURlY29yYXRvcihkZWNvcmF0b3I6IHRzLkRlY29yYXRvciwgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXSkge1xuICBjb25zdCBtZXRhZGF0YVByb3BlcnRpZXM6IHRzLk9iamVjdExpdGVyYWxFbGVtZW50TGlrZVtdID0gW107XG4gIGNvbnN0IGV4cHIgPSBkZWNvcmF0b3IuZXhwcmVzc2lvbjtcbiAgc3dpdGNoIChleHByLmtpbmQpIHtcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcjpcbiAgICAgIC8vIFRoZSBkZWNvcmF0b3Igd2FzIGEgcGxhaW4gQEZvby5cbiAgICAgIG1ldGFkYXRhUHJvcGVydGllcy5wdXNoKHRzLmNyZWF0ZVByb3BlcnR5QXNzaWdubWVudCgndHlwZScsIGV4cHIpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgdHMuU3ludGF4S2luZC5DYWxsRXhwcmVzc2lvbjpcbiAgICAgIC8vIFRoZSBkZWNvcmF0b3Igd2FzIGEgY2FsbCwgbGlrZSBARm9vKGJhcikuXG4gICAgICBjb25zdCBjYWxsID0gZXhwciBhcyB0cy5DYWxsRXhwcmVzc2lvbjtcbiAgICAgIG1ldGFkYXRhUHJvcGVydGllcy5wdXNoKHRzLmNyZWF0ZVByb3BlcnR5QXNzaWdubWVudCgndHlwZScsIGNhbGwuZXhwcmVzc2lvbikpO1xuICAgICAgaWYgKGNhbGwuYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBhcmdzOiB0cy5FeHByZXNzaW9uW10gPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBhcmcgb2YgY2FsbC5hcmd1bWVudHMpIHtcbiAgICAgICAgICBhcmdzLnB1c2goYXJnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhcmdzQXJyYXlMaXRlcmFsID0gdHMuY3JlYXRlQXJyYXlMaXRlcmFsKGFyZ3MpO1xuICAgICAgICBhcmdzQXJyYXlMaXRlcmFsLmVsZW1lbnRzLmhhc1RyYWlsaW5nQ29tbWEgPSB0cnVlO1xuICAgICAgICBtZXRhZGF0YVByb3BlcnRpZXMucHVzaCh0cy5jcmVhdGVQcm9wZXJ0eUFzc2lnbm1lbnQoJ2FyZ3MnLCBhcmdzQXJyYXlMaXRlcmFsKSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgZGlhZ25vc3RpY3MucHVzaCh7XG4gICAgICAgIGZpbGU6IGRlY29yYXRvci5nZXRTb3VyY2VGaWxlKCksXG4gICAgICAgIHN0YXJ0OiBkZWNvcmF0b3IuZ2V0U3RhcnQoKSxcbiAgICAgICAgbGVuZ3RoOiBkZWNvcmF0b3IuZ2V0RW5kKCkgLSBkZWNvcmF0b3IuZ2V0U3RhcnQoKSxcbiAgICAgICAgbWVzc2FnZVRleHQ6XG4gICAgICAgICAgICBgJHt0cy5TeW50YXhLaW5kW2RlY29yYXRvci5raW5kXX0gbm90IGltcGxlbWVudGVkIGluIGdhdGhlcmluZyBkZWNvcmF0b3IgbWV0YWRhdGFgLFxuICAgICAgICBjYXRlZ29yeTogdHMuRGlhZ25vc3RpY0NhdGVnb3J5LkVycm9yLFxuICAgICAgICBjb2RlOiAwLFxuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgfVxuICByZXR1cm4gdHMuY3JlYXRlT2JqZWN0TGl0ZXJhbChtZXRhZGF0YVByb3BlcnRpZXMpO1xufVxuXG4vKipcbiAqIFRha2VzIGEgbGlzdCBvZiBkZWNvcmF0b3IgbWV0YWRhdGEgb2JqZWN0IEFTVHMgYW5kIHByb2R1Y2VzIGFuIEFTVCBmb3IgYVxuICogc3RhdGljIGNsYXNzIHByb3BlcnR5IG9mIGFuIGFycmF5IG9mIHRob3NlIG1ldGFkYXRhIG9iamVjdHMuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZURlY29yYXRvckNsYXNzUHJvcGVydHkoZGVjb3JhdG9yTGlzdDogdHMuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb25bXSkge1xuICBjb25zdCBtb2RpZmllciA9IHRzLmNyZWF0ZVRva2VuKHRzLlN5bnRheEtpbmQuU3RhdGljS2V5d29yZCk7XG4gIGNvbnN0IHR5cGUgPSBjcmVhdGVDbGFzc0RlY29yYXRvclR5cGUoKTtcbiAgY29uc3QgaW5pdGlhbGl6ZXIgPSB0cy5jcmVhdGVBcnJheUxpdGVyYWwoZGVjb3JhdG9yTGlzdCwgdHJ1ZSk7XG4gIGluaXRpYWxpemVyLmVsZW1lbnRzLmhhc1RyYWlsaW5nQ29tbWEgPSB0cnVlO1xuICByZXR1cm4gdHMuY3JlYXRlUHJvcGVydHkodW5kZWZpbmVkLCBbbW9kaWZpZXJdLCAnZGVjb3JhdG9ycycsIHVuZGVmaW5lZCwgdHlwZSwgaW5pdGlhbGl6ZXIpO1xufVxuXG5mdW5jdGlvbiBpc05hbWVFcXVhbChjbGFzc01lbWJlcjogdHMuQ2xhc3NFbGVtZW50LCBuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKGNsYXNzTWVtYmVyLm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBjb25zdCBpZCA9IGNsYXNzTWVtYmVyLm5hbWUgYXMgdHMuSWRlbnRpZmllcjtcbiAgcmV0dXJuIGlkLnRleHQgPT09IG5hbWU7XG59XG5cbi8qKlxuICogSW5zZXJ0cyB0aGUgZGVjb3JhdG9yIG1ldGFkYXRhIHByb3BlcnR5IGluIHRoZSBwbGFjZSB0aGF0IHRoZSBvbGRcbiAqIGRlY29yYXRvci1hbm5vdGF0b3IgdmlzaXRvciB3b3VsZCBwdXQgaXQsIHNvIHRoZSB1bml0IHRlc3RzIGRvbid0IGhhdmUgdG9cbiAqIGNoYW5nZS5cbiAqIFRPRE8obHVjYXNzbG9hbik6IHJlbW92ZSB0aGlzIHdoZW4gYWxsIDMgcHJvcGVydGllcyBhcmUgcHV0IGluIHZpYVxuICogdHJhbnNmb3JtZXJzXG4gKi9cbmZ1bmN0aW9uIGluc2VydEJlZm9yZURlY29yYXRvclByb3BlcnRpZXMoXG4gICAgY2xhc3NNZW1iZXJzOiB0cy5Ob2RlQXJyYXk8dHMuQ2xhc3NFbGVtZW50PixcbiAgICBkZWNvcmF0b3JNZXRhZGF0YTogdHMuUHJvcGVydHlEZWNsYXJhdGlvbik6IHRzLk5vZGVBcnJheTx0cy5DbGFzc0VsZW1lbnQ+IHtcbiAgbGV0IGluc2VydGlvblBvaW50ID0gY2xhc3NNZW1iZXJzLmZpbmRJbmRleChcbiAgICAgIG0gPT4gaXNOYW1lRXF1YWwobSwgJ2N0b3JQYXJhbWV0ZXJzJykgfHwgaXNOYW1lRXF1YWwobSwgJ3Byb3BEZWNvcmF0b3JzJykpO1xuICBpZiAoaW5zZXJ0aW9uUG9pbnQgPT09IC0xKSB7XG4gICAgaW5zZXJ0aW9uUG9pbnQgPSBjbGFzc01lbWJlcnMubGVuZ3RoOyAgLy8gSW5zZXJ0IGF0IGVuZCBvZiBsaXN0XG4gIH1cbiAgY29uc3QgbWVtYmVycyA9IFtcbiAgICAuLi5jbGFzc01lbWJlcnMuc2xpY2UoMCwgaW5zZXJ0aW9uUG9pbnQpLCBkZWNvcmF0b3JNZXRhZGF0YSxcbiAgICAuLi5jbGFzc01lbWJlcnMuc2xpY2UoaW5zZXJ0aW9uUG9pbnQpXG4gIF07XG4gIHJldHVybiB0cy5zZXRUZXh0UmFuZ2UodHMuY3JlYXRlTm9kZUFycmF5KG1lbWJlcnMsIGNsYXNzTWVtYmVycy5oYXNUcmFpbGluZ0NvbW1hKSwgY2xhc3NNZW1iZXJzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsYXNzRGVjb3JhdG9yRG93bmxldmVsVHJhbnNmb3JtZXIoXG4gICAgdHlwZUNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLCBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdKTpcbiAgICAoY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0KSA9PiB0cy5UcmFuc2Zvcm1lcjx0cy5Tb3VyY2VGaWxlPiB7XG4gIHJldHVybiAoY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0KSA9PiB7XG4gICAgY29uc3QgdmlzaXRvcjogdHMuVmlzaXRvciA9IChub2RlOiB0cy5Ob2RlKTogdHMuTm9kZSA9PiB7XG4gICAgICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xhc3NEZWNsYXJhdGlvbjpcbiAgICAgICAgICBjb25zdCBjZCA9IHZpc2l0RWFjaENoaWxkKG5vZGUsIHZpc2l0b3IsIGNvbnRleHQpIGFzIHRzLkNsYXNzRGVjbGFyYXRpb247XG4gICAgICAgICAgY29uc3QgZGVjb3JhdG9ycyA9IGNkLmRlY29yYXRvcnM7XG5cbiAgICAgICAgICBpZiAoZGVjb3JhdG9ycyA9PT0gdW5kZWZpbmVkIHx8IGRlY29yYXRvcnMubGVuZ3RoID09PSAwKSByZXR1cm4gY2Q7XG5cbiAgICAgICAgICBjb25zdCBkZWNvcmF0b3JMaXN0ID0gW107XG4gICAgICAgICAgY29uc3QgZGVjb3JhdG9yc1RvS2VlcDogdHMuRGVjb3JhdG9yW10gPSBbXTtcbiAgICAgICAgICBmb3IgKGNvbnN0IGRlY29yYXRvciBvZiBkZWNvcmF0b3JzKSB7XG4gICAgICAgICAgICBpZiAoc2hvdWxkTG93ZXIoZGVjb3JhdG9yLCB0eXBlQ2hlY2tlcikpIHtcbiAgICAgICAgICAgICAgZGVjb3JhdG9yTGlzdC5wdXNoKGV4dHJhY3RNZXRhZGF0YUZyb21TaW5nbGVEZWNvcmF0b3IoZGVjb3JhdG9yLCBkaWFnbm9zdGljcykpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZGVjb3JhdG9yc1RvS2VlcC5wdXNoKGRlY29yYXRvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGRlY29yYXRvckxpc3QubGVuZ3RoID09PSAwKSByZXR1cm4gY2Q7XG5cbiAgICAgICAgICBjb25zdCBuZXdDbGFzc0RlY2xhcmF0aW9uID0gdHMuZ2V0TXV0YWJsZUNsb25lKGNkKTtcblxuICAgICAgICAgIG5ld0NsYXNzRGVjbGFyYXRpb24ubWVtYmVycyA9IGluc2VydEJlZm9yZURlY29yYXRvclByb3BlcnRpZXMoXG4gICAgICAgICAgICAgIG5ld0NsYXNzRGVjbGFyYXRpb24ubWVtYmVycywgY3JlYXRlRGVjb3JhdG9yQ2xhc3NQcm9wZXJ0eShkZWNvcmF0b3JMaXN0KSk7XG5cbiAgICAgICAgICBuZXdDbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnMgPVxuICAgICAgICAgICAgICBkZWNvcmF0b3JzVG9LZWVwLmxlbmd0aCA/IHRzLmNyZWF0ZU5vZGVBcnJheShkZWNvcmF0b3JzVG9LZWVwKSA6IHVuZGVmaW5lZDtcblxuICAgICAgICAgIHJldHVybiBuZXdDbGFzc0RlY2xhcmF0aW9uO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiB2aXNpdEVhY2hDaGlsZChub2RlLCB2aXNpdG9yLCBjb250ZXh0KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIChzZjogdHMuU291cmNlRmlsZSkgPT4gdmlzaXRvcihzZikgYXMgdHMuU291cmNlRmlsZTtcbiAgfTtcbn1cbiJdfQ==