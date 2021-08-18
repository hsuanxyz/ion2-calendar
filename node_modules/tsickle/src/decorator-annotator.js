/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
        define("tsickle/src/decorator-annotator", ["require", "exports", "tsickle/src/decorators", "tsickle/src/rewriter", "tsickle/src/type-translator", "tsickle/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var decorators_1 = require("tsickle/src/decorators");
    var rewriter_1 = require("tsickle/src/rewriter");
    var type_translator_1 = require("tsickle/src/type-translator");
    var ts = require("tsickle/src/typescript");
    function shouldLower(decorator, typeChecker) {
        try {
            for (var _a = __values(decorators_1.getDecoratorDeclarations(decorator, typeChecker)), _b = _a.next(); !_b.done; _b = _a.next()) {
                var d = _b.value;
                // TODO(lucassloan):
                // Switch to the TS JSDoc parser in the future to avoid false positives here.
                // For example using '@Annotation' in a true comment.
                // However, a new TS API would be needed, track at
                // https://github.com/Microsoft/TypeScript/issues/7393.
                var commentNode = d;
                // Not handling PropertyAccess expressions here, because they are
                // filtered earlier.
                if (commentNode.kind === ts.SyntaxKind.VariableDeclaration) {
                    if (!commentNode.parent)
                        continue;
                    commentNode = commentNode.parent;
                }
                // Go up one more level to VariableDeclarationStatement, where usually
                // the comment lives. If the declaration has an 'export', the
                // VDList.getFullText will not contain the comment.
                if (commentNode.kind === ts.SyntaxKind.VariableDeclarationList) {
                    if (!commentNode.parent)
                        continue;
                    commentNode = commentNode.parent;
                }
                var range = ts.getLeadingCommentRanges(commentNode.getFullText(), 0);
                if (!range)
                    continue;
                try {
                    for (var range_1 = __values(range), range_1_1 = range_1.next(); !range_1_1.done; range_1_1 = range_1.next()) {
                        var _c = range_1_1.value, pos = _c.pos, end = _c.end;
                        var jsDocText = commentNode.getFullText().substring(pos, end);
                        if (jsDocText.includes('@Annotation'))
                            return true;
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (range_1_1 && !range_1_1.done && (_d = range_1.return)) _d.call(range_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return false;
        var e_2, _e, e_1, _d;
    }
    exports.shouldLower = shouldLower;
    // DecoratorClassVisitor rewrites a single "class Foo {...}" declaration.
    // It's its own object because we collect decorators on the class and the ctor
    // separately for each class we encounter.
    var DecoratorClassVisitor = /** @class */ (function () {
        function DecoratorClassVisitor(typeChecker, rewriter, classDecl, importedNames) {
            this.typeChecker = typeChecker;
            this.rewriter = rewriter;
            this.classDecl = classDecl;
            this.importedNames = importedNames;
            if (classDecl.decorators) {
                var toLower = this.decoratorsToLower(classDecl);
                if (toLower.length > 0)
                    this.decorators = toLower;
            }
        }
        /**
         * Determines whether the given decorator should be re-written as an annotation.
         */
        DecoratorClassVisitor.prototype.decoratorsToLower = function (n) {
            var _this = this;
            if (n.decorators) {
                return n.decorators.filter(function (d) { return shouldLower(d, _this.typeChecker); });
            }
            return [];
        };
        /**
         * gatherConstructor grabs the parameter list and decorators off the class
         * constructor, and emits nothing.
         */
        DecoratorClassVisitor.prototype.gatherConstructor = function (ctor) {
            var ctorParameters = [];
            var hasDecoratedParam = false;
            try {
                for (var _a = __values(ctor.parameters), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var param = _b.value;
                    var ctorParam = { type: null, decorators: null };
                    if (param.decorators) {
                        ctorParam.decorators = this.decoratorsToLower(param);
                        hasDecoratedParam = hasDecoratedParam || ctorParam.decorators.length > 0;
                    }
                    if (param.type) {
                        // param has a type provided, e.g. "foo: Bar".
                        // Verify that "Bar" is a value (e.g. a constructor) and not just a type.
                        var sym = this.typeChecker.getTypeAtLocation(param.type).getSymbol();
                        if (sym && (sym.flags & ts.SymbolFlags.Value)) {
                            ctorParam.type = param.type;
                        }
                    }
                    ctorParameters.push(ctorParam);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_3) throw e_3.error; }
            }
            // Use the ctor parameter metadata only if the class or the ctor was decorated.
            if (this.decorators || hasDecoratedParam) {
                this.ctorParameters = ctorParameters;
            }
            var e_3, _c;
        };
        /**
         * gatherMethod grabs the decorators off a class method and emits nothing.
         */
        DecoratorClassVisitor.prototype.gatherMethodOrProperty = function (method) {
            if (!method.decorators)
                return;
            if (!method.name || method.name.kind !== ts.SyntaxKind.Identifier) {
                // Method has a weird name, e.g.
                //   [Symbol.foo]() {...}
                this.rewriter.error(method, 'cannot process decorators on strangely named method');
                return;
            }
            var name = method.name.text;
            var decorators = this.decoratorsToLower(method);
            if (decorators.length === 0)
                return;
            if (!this.propDecorators)
                this.propDecorators = new Map();
            this.propDecorators.set(name, decorators);
        };
        /**
         * For lowering decorators, we need to refer to constructor types.
         * So we start with the identifiers that represent these types.
         * However, TypeScript does not allow us to emit them in a value position
         * as it associated different symbol information with it.
         *
         * This method looks for the place where the value that is associated to
         * the type is defined and returns that identifier instead.
         *
         * This might be simplified when https://github.com/Microsoft/TypeScript/issues/17516 is solved.
         */
        DecoratorClassVisitor.prototype.getValueIdentifierForType = function (typeSymbol, typeNode) {
            var valueDeclaration = typeSymbol.valueDeclaration;
            if (!valueDeclaration)
                return null;
            var valueName = valueDeclaration.name;
            if (!valueName || valueName.kind !== ts.SyntaxKind.Identifier) {
                return null;
            }
            if (valueName.getSourceFile() === this.rewriter.file) {
                return valueName;
            }
            // Need to look at the first identifier only
            // to ignore generics.
            var firstIdentifierInType = firstIdentifierInSubtree(typeNode);
            if (firstIdentifierInType) {
                try {
                    for (var _a = __values(this.importedNames), _b = _a.next(); !_b.done; _b = _a.next()) {
                        var _c = _b.value, name_1 = _c.name, declarationNames = _c.declarationNames;
                        if (firstIdentifierInType.text === name_1.text &&
                            declarationNames.some(function (d) { return d === valueName; })) {
                            return name_1;
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
            return null;
            var e_4, _d;
        };
        DecoratorClassVisitor.prototype.beforeProcessNode = function (node) {
            switch (node.kind) {
                case ts.SyntaxKind.Constructor:
                    this.gatherConstructor(node);
                    break;
                case ts.SyntaxKind.PropertyDeclaration:
                case ts.SyntaxKind.SetAccessor:
                case ts.SyntaxKind.GetAccessor:
                case ts.SyntaxKind.MethodDeclaration:
                    this.gatherMethodOrProperty(node);
                    break;
                default:
            }
        };
        /**
         * Checks if the decorator is on a class, as opposed to a field or an
         * argument.
         */
        DecoratorClassVisitor.prototype.isClassDecorator = function (decorator) {
            return decorator.parent !== undefined &&
                decorator.parent.kind === ts.SyntaxKind.ClassDeclaration;
        };
        DecoratorClassVisitor.prototype.maybeProcessDecorator = function (node, start) {
            // Only strip field and argument decorators, the class decoration
            // downlevel transformer will strip class decorations
            if (shouldLower(node, this.typeChecker) && !this.isClassDecorator(node)) {
                // Return true to signal that this node should not be emitted,
                // but still emit the whitespace *before* the node.
                if (!start) {
                    start = node.getFullStart();
                }
                this.rewriter.writeRange(node, start, node.getStart());
                return true;
            }
            return false;
        };
        DecoratorClassVisitor.prototype.foundDecorators = function () {
            return !!(this.decorators || this.ctorParameters || this.propDecorators);
        };
        /**
         * emits the types for the various gathered metadata to be used
         * in the tsickle type annotations helper.
         */
        DecoratorClassVisitor.prototype.emitMetadataTypeAnnotationsHelpers = function () {
            if (!this.classDecl.name)
                return;
            var className = rewriter_1.getIdentifierText(this.classDecl.name);
            if (this.decorators) {
                this.rewriter.emit("/** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */\n");
                this.rewriter.emit(className + ".decorators;\n");
            }
            if (this.decorators || this.ctorParameters) {
                this.rewriter.emit("/**\n");
                this.rewriter.emit(" * @nocollapse\n");
                this.rewriter.emit(" * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}\n");
                this.rewriter.emit(" */\n");
                this.rewriter.emit(className + ".ctorParameters;\n");
            }
            if (this.propDecorators) {
                this.rewriter.emit("/** @type {!Object<string,!Array<{type: !Function, args: (undefined|!Array<?>)}>>} */\n");
                this.rewriter.emit(className + ".propDecorators;\n");
            }
        };
        /**
         * emitMetadata emits the various gathered metadata, as static fields.
         */
        DecoratorClassVisitor.prototype.emitMetadataAsStaticProperties = function () {
            var decoratorInvocations = '{type: Function, args?: any[]}[]';
            if (this.decorators || this.ctorParameters) {
                this.rewriter.emit("/** @nocollapse */\n");
            }
            if (this.ctorParameters) {
                // ctorParameters may contain forward references in the type: field, so wrap in a function
                // closure
                this.rewriter.emit("static ctorParameters: () => ({type: any, decorators?: " + decoratorInvocations +
                    "}|null)[] = () => [\n");
                try {
                    for (var _a = __values(this.ctorParameters || []), _b = _a.next(); !_b.done; _b = _a.next()) {
                        var param = _b.value;
                        if (!param.type && !param.decorators) {
                            this.rewriter.emit('null,\n');
                            continue;
                        }
                        this.rewriter.emit("{type: ");
                        if (!param.type) {
                            this.rewriter.emit("undefined");
                        }
                        else {
                            // For transformer mode, tsickle must emit not only the string referring to the type,
                            // but also create a source mapping, so that TypeScript can later recognize that the
                            // symbol is used in a value position, so that TypeScript emits an import for the
                            // symbol.
                            // The code below and in getValueIdentifierForType finds the value node corresponding to
                            // the type and emits that symbol if possible. This causes a source mapping to the value,
                            // which then allows later transformers in the pipeline to do the correct module
                            // rewriting. Note that we cannot use param.type as the emit node directly (not even just
                            // for mapping), because that is marked as a type use of the node, not a value use, so it
                            // doesn't get updated as an export.
                            var sym = this.typeChecker.getTypeAtLocation(param.type).getSymbol();
                            var emitNode = this.getValueIdentifierForType(sym, param.type);
                            if (emitNode) {
                                this.rewriter.writeRange(emitNode, emitNode.getStart(), emitNode.getEnd());
                            }
                            else {
                                var typeStr = new type_translator_1.TypeTranslator(this.typeChecker, param.type)
                                    .symbolToString(sym, /* useFqn */ true);
                                this.rewriter.emit(typeStr);
                            }
                        }
                        this.rewriter.emit(", ");
                        if (param.decorators) {
                            this.rewriter.emit('decorators: [');
                            try {
                                for (var _c = __values(param.decorators), _d = _c.next(); !_d.done; _d = _c.next()) {
                                    var decorator = _d.value;
                                    this.emitDecorator(decorator);
                                    this.rewriter.emit(', ');
                                }
                            }
                            catch (e_5_1) { e_5 = { error: e_5_1 }; }
                            finally {
                                try {
                                    if (_d && !_d.done && (_e = _c.return)) _e.call(_c);
                                }
                                finally { if (e_5) throw e_5.error; }
                            }
                            this.rewriter.emit(']');
                        }
                        this.rewriter.emit('},\n');
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_f = _a.return)) _f.call(_a);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
                this.rewriter.emit("];\n");
            }
            if (this.propDecorators) {
                this.rewriter.emit("static propDecorators: {[key: string]: " + decoratorInvocations + "} = {\n");
                try {
                    for (var _g = __values(this.propDecorators.keys()), _h = _g.next(); !_h.done; _h = _g.next()) {
                        var name_2 = _h.value;
                        this.rewriter.emit("\"" + name_2 + "\": [");
                        try {
                            for (var _j = __values(this.propDecorators.get(name_2)), _k = _j.next(); !_k.done; _k = _j.next()) {
                                var decorator = _k.value;
                                this.emitDecorator(decorator);
                                this.rewriter.emit(',');
                            }
                        }
                        catch (e_7_1) { e_7 = { error: e_7_1 }; }
                        finally {
                            try {
                                if (_k && !_k.done && (_l = _j.return)) _l.call(_j);
                            }
                            finally { if (e_7) throw e_7.error; }
                        }
                        this.rewriter.emit('],\n');
                    }
                }
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (_h && !_h.done && (_m = _g.return)) _m.call(_g);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
                this.rewriter.emit('};\n');
            }
            var e_6, _f, e_5, _e, e_8, _m, e_7, _l;
        };
        DecoratorClassVisitor.prototype.emitDecorator = function (decorator) {
            this.rewriter.emit('{ type: ');
            var expr = decorator.expression;
            switch (expr.kind) {
                case ts.SyntaxKind.Identifier:
                    // The decorator was a plain @Foo.
                    this.rewriter.visit(expr);
                    break;
                case ts.SyntaxKind.CallExpression:
                    // The decorator was a call, like @Foo(bar).
                    var call = expr;
                    this.rewriter.visit(call.expression);
                    if (call.arguments.length) {
                        this.rewriter.emit(', args: [');
                        try {
                            for (var _a = __values(call.arguments), _b = _a.next(); !_b.done; _b = _a.next()) {
                                var arg = _b.value;
                                this.rewriter.writeNodeFrom(arg, arg.getStart());
                                this.rewriter.emit(', ');
                            }
                        }
                        catch (e_9_1) { e_9 = { error: e_9_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                            }
                            finally { if (e_9) throw e_9.error; }
                        }
                        this.rewriter.emit(']');
                    }
                    break;
                default:
                    this.rewriter.errorUnimplementedKind(expr, 'gathering metadata');
                    this.rewriter.emit('undefined');
            }
            this.rewriter.emit(' }');
            var e_9, _c;
        };
        return DecoratorClassVisitor;
    }());
    exports.DecoratorClassVisitor = DecoratorClassVisitor;
    var DecoratorRewriter = /** @class */ (function (_super) {
        __extends(DecoratorRewriter, _super);
        function DecoratorRewriter(typeChecker, sourceFile, sourceMapper) {
            var _this = _super.call(this, sourceFile, sourceMapper) || this;
            _this.typeChecker = typeChecker;
            _this.importedNames = [];
            return _this;
        }
        DecoratorRewriter.prototype.process = function () {
            this.visit(this.file);
            return this.getOutput();
        };
        DecoratorRewriter.prototype.maybeProcess = function (node) {
            if (this.currentDecoratorConverter) {
                this.currentDecoratorConverter.beforeProcessNode(node);
            }
            switch (node.kind) {
                case ts.SyntaxKind.ImportDeclaration:
                    (_a = this.importedNames).push.apply(_a, __spread(collectImportedNames(this.typeChecker, node)));
                    return false;
                case ts.SyntaxKind.Decorator:
                    return this.currentDecoratorConverter &&
                        this.currentDecoratorConverter.maybeProcessDecorator(node);
                case ts.SyntaxKind.ClassDeclaration:
                    var oldDecoratorConverter = this.currentDecoratorConverter;
                    this.currentDecoratorConverter = new DecoratorClassVisitor(this.typeChecker, this, node, this.importedNames);
                    this.writeLeadingTrivia(node);
                    visitClassContentIncludingDecorators(node, this, this.currentDecoratorConverter);
                    this.currentDecoratorConverter = oldDecoratorConverter;
                    return true;
                default:
                    return false;
            }
            var _a;
        };
        return DecoratorRewriter;
    }(rewriter_1.Rewriter));
    /**
     * Returns the first identifier in the node tree starting at node
     * in a depth first order.
     *
     * @param node The node to start with
     * @return The first identifier if one was found.
     */
    function firstIdentifierInSubtree(node) {
        if (node.kind === ts.SyntaxKind.Identifier) {
            return node;
        }
        return ts.forEachChild(node, firstIdentifierInSubtree);
    }
    /**
     * Collect the Identifiers used as named bindings in the given import declaration
     * with their Symbol.
     * This is needed later on to find an identifier that represents the value
     * of an imported type identifier.
     */
    function collectImportedNames(typeChecker, decl) {
        var importedNames = [];
        var importClause = decl.importClause;
        if (!importClause) {
            return importedNames;
        }
        var names = [];
        if (importClause.name) {
            names.push(importClause.name);
        }
        if (importClause.namedBindings &&
            importClause.namedBindings.kind === ts.SyntaxKind.NamedImports) {
            var namedImports = importClause.namedBindings;
            names.push.apply(names, __spread(namedImports.elements.map(function (e) { return e.name; })));
        }
        try {
            for (var names_1 = __values(names), names_1_1 = names_1.next(); !names_1_1.done; names_1_1 = names_1.next()) {
                var name_3 = names_1_1.value;
                var symbol = typeChecker.getSymbolAtLocation(name_3);
                if (symbol.flags & ts.SymbolFlags.Alias) {
                    symbol = typeChecker.getAliasedSymbol(symbol);
                }
                var declarationNames = [];
                if (symbol.declarations) {
                    try {
                        for (var _a = __values(symbol.declarations), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var d = _b.value;
                            var decl_1 = d;
                            if (decl_1.name && decl_1.name.kind === ts.SyntaxKind.Identifier) {
                                declarationNames.push(decl_1.name);
                            }
                        }
                    }
                    catch (e_10_1) { e_10 = { error: e_10_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_10) throw e_10.error; }
                    }
                }
                if (symbol.declarations) {
                    importedNames.push({ name: name_3, declarationNames: declarationNames });
                }
            }
        }
        catch (e_11_1) { e_11 = { error: e_11_1 }; }
        finally {
            try {
                if (names_1_1 && !names_1_1.done && (_d = names_1.return)) _d.call(names_1);
            }
            finally { if (e_11) throw e_11.error; }
        }
        return importedNames;
        var e_11, _d, e_10, _c;
    }
    exports.collectImportedNames = collectImportedNames;
    function visitClassContentIncludingDecorators(classDecl, rewriter, decoratorVisitor) {
        if (rewriter.file.text[classDecl.getEnd() - 1] !== '}') {
            rewriter.error(classDecl, 'unexpected class terminator');
            return;
        }
        rewriter.writeNodeFrom(classDecl, classDecl.getStart(), classDecl.getEnd() - 1);
        // At this point, we've emitted up through the final child of the class, so all that
        // remains is the trailing whitespace and closing curly brace.
        // The final character owned by the class node should always be a '}',
        // or we somehow got the AST wrong and should report an error.
        // (Any whitespace or semicolon following the '}' will be part of the next Node.)
        if (decoratorVisitor) {
            decoratorVisitor.emitMetadataAsStaticProperties();
        }
        rewriter.writeRange(classDecl, classDecl.getEnd() - 1, classDecl.getEnd());
    }
    exports.visitClassContentIncludingDecorators = visitClassContentIncludingDecorators;
    function convertDecorators(typeChecker, sourceFile, sourceMapper) {
        return new DecoratorRewriter(typeChecker, sourceFile, sourceMapper).process();
    }
    exports.convertDecorators = convertDecorators;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdG9yLWFubm90YXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9kZWNvcmF0b3ItYW5ub3RhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUlILHFEQUFzRDtJQUN0RCxpREFBdUQ7SUFFdkQsK0RBQWlEO0lBQ2pELDJDQUFtQztJQWdCbkMscUJBQTRCLFNBQXVCLEVBQUUsV0FBMkI7O1lBQzlFLEdBQUcsQ0FBQyxDQUFZLElBQUEsS0FBQSxTQUFBLHFDQUF3QixDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQSxnQkFBQTtnQkFBM0QsSUFBTSxDQUFDLFdBQUE7Z0JBQ1Ysb0JBQW9CO2dCQUNwQiw2RUFBNkU7Z0JBQzdFLHFEQUFxRDtnQkFDckQsa0RBQWtEO2dCQUNsRCx1REFBdUQ7Z0JBQ3ZELElBQUksV0FBVyxHQUFZLENBQUMsQ0FBQztnQkFDN0IsaUVBQWlFO2dCQUNqRSxvQkFBb0I7Z0JBQ3BCLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7b0JBQzNELEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQzt3QkFBQyxRQUFRLENBQUM7b0JBQ2xDLFdBQVcsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO2dCQUNuQyxDQUFDO2dCQUNELHNFQUFzRTtnQkFDdEUsNkRBQTZEO2dCQUM3RCxtREFBbUQ7Z0JBQ25ELEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7b0JBQy9ELEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQzt3QkFBQyxRQUFRLENBQUM7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aWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtTb3VyY2VNYXBHZW5lcmF0b3J9IGZyb20gJ3NvdXJjZS1tYXAnO1xuXG5pbXBvcnQge2dldERlY29yYXRvckRlY2xhcmF0aW9uc30gZnJvbSAnLi9kZWNvcmF0b3JzJztcbmltcG9ydCB7Z2V0SWRlbnRpZmllclRleHQsIFJld3JpdGVyfSBmcm9tICcuL3Jld3JpdGVyJztcbmltcG9ydCB7U291cmNlTWFwcGVyfSBmcm9tICcuL3NvdXJjZV9tYXBfdXRpbHMnO1xuaW1wb3J0IHtUeXBlVHJhbnNsYXRvcn0gZnJvbSAnLi90eXBlLXRyYW5zbGF0b3InO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAnLi90eXBlc2NyaXB0JztcblxuLyoqXG4gKiBDb25zdHJ1Y3RvclBhcmFtZXRlcnMgYXJlIGdhdGhlcmVkIGZyb20gY29uc3RydWN0b3JzLCBzbyB0aGF0IHRoZWlyIHR5cGUgaW5mb3JtYXRpb24gYW5kXG4gKiBkZWNvcmF0b3JzIGNhbiBsYXRlciBiZSBlbWl0dGVkIGFzIGFuIGFubm90YXRpb24uXG4gKi9cbmludGVyZmFjZSBDb25zdHJ1Y3RvclBhcmFtZXRlciB7XG4gIC8qKlxuICAgKiBUaGUgdHlwZSBkZWNsYXJhdGlvbiBmb3IgdGhlIHBhcmFtZXRlci4gT25seSBzZXQgaWYgdGhlIHR5cGUgaXMgYSB2YWx1ZSAoZS5nLiBhIGNsYXNzLCBub3QgYW5cbiAgICogaW50ZXJmYWNlKS5cbiAgICovXG4gIHR5cGU6IHRzLlR5cGVOb2RlfG51bGw7XG4gIC8qKiBUaGUgbGlzdCBvZiBkZWNvcmF0b3JzIGZvdW5kIG9uIHRoZSBwYXJhbWV0ZXIsIG51bGwgaWYgbm9uZS4gKi9cbiAgZGVjb3JhdG9yczogdHMuRGVjb3JhdG9yW118bnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3VsZExvd2VyKGRlY29yYXRvcjogdHMuRGVjb3JhdG9yLCB0eXBlQ2hlY2tlcjogdHMuVHlwZUNoZWNrZXIpIHtcbiAgZm9yIChjb25zdCBkIG9mIGdldERlY29yYXRvckRlY2xhcmF0aW9ucyhkZWNvcmF0b3IsIHR5cGVDaGVja2VyKSkge1xuICAgIC8vIFRPRE8obHVjYXNzbG9hbik6XG4gICAgLy8gU3dpdGNoIHRvIHRoZSBUUyBKU0RvYyBwYXJzZXIgaW4gdGhlIGZ1dHVyZSB0byBhdm9pZCBmYWxzZSBwb3NpdGl2ZXMgaGVyZS5cbiAgICAvLyBGb3IgZXhhbXBsZSB1c2luZyAnQEFubm90YXRpb24nIGluIGEgdHJ1ZSBjb21tZW50LlxuICAgIC8vIEhvd2V2ZXIsIGEgbmV3IFRTIEFQSSB3b3VsZCBiZSBuZWVkZWQsIHRyYWNrIGF0XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy83MzkzLlxuICAgIGxldCBjb21tZW50Tm9kZTogdHMuTm9kZSA9IGQ7XG4gICAgLy8gTm90IGhhbmRsaW5nIFByb3BlcnR5QWNjZXNzIGV4cHJlc3Npb25zIGhlcmUsIGJlY2F1c2UgdGhleSBhcmVcbiAgICAvLyBmaWx0ZXJlZCBlYXJsaWVyLlxuICAgIGlmIChjb21tZW50Tm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLlZhcmlhYmxlRGVjbGFyYXRpb24pIHtcbiAgICAgIGlmICghY29tbWVudE5vZGUucGFyZW50KSBjb250aW51ZTtcbiAgICAgIGNvbW1lbnROb2RlID0gY29tbWVudE5vZGUucGFyZW50O1xuICAgIH1cbiAgICAvLyBHbyB1cCBvbmUgbW9yZSBsZXZlbCB0byBWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50LCB3aGVyZSB1c3VhbGx5XG4gICAgLy8gdGhlIGNvbW1lbnQgbGl2ZXMuIElmIHRoZSBkZWNsYXJhdGlvbiBoYXMgYW4gJ2V4cG9ydCcsIHRoZVxuICAgIC8vIFZETGlzdC5nZXRGdWxsVGV4dCB3aWxsIG5vdCBjb250YWluIHRoZSBjb21tZW50LlxuICAgIGlmIChjb21tZW50Tm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLlZhcmlhYmxlRGVjbGFyYXRpb25MaXN0KSB7XG4gICAgICBpZiAoIWNvbW1lbnROb2RlLnBhcmVudCkgY29udGludWU7XG4gICAgICBjb21tZW50Tm9kZSA9IGNvbW1lbnROb2RlLnBhcmVudDtcbiAgICB9XG4gICAgY29uc3QgcmFuZ2UgPSB0cy5nZXRMZWFkaW5nQ29tbWVudFJhbmdlcyhjb21tZW50Tm9kZS5nZXRGdWxsVGV4dCgpLCAwKTtcbiAgICBpZiAoIXJhbmdlKSBjb250aW51ZTtcbiAgICBmb3IgKGNvbnN0IHtwb3MsIGVuZH0gb2YgcmFuZ2UpIHtcbiAgICAgIGNvbnN0IGpzRG9jVGV4dCA9IGNvbW1lbnROb2RlLmdldEZ1bGxUZXh0KCkuc3Vic3RyaW5nKHBvcywgZW5kKTtcbiAgICAgIGlmIChqc0RvY1RleHQuaW5jbHVkZXMoJ0BBbm5vdGF0aW9uJykpIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8vIERlY29yYXRvckNsYXNzVmlzaXRvciByZXdyaXRlcyBhIHNpbmdsZSBcImNsYXNzIEZvbyB7Li4ufVwiIGRlY2xhcmF0aW9uLlxuLy8gSXQncyBpdHMgb3duIG9iamVjdCBiZWNhdXNlIHdlIGNvbGxlY3QgZGVjb3JhdG9ycyBvbiB0aGUgY2xhc3MgYW5kIHRoZSBjdG9yXG4vLyBzZXBhcmF0ZWx5IGZvciBlYWNoIGNsYXNzIHdlIGVuY291bnRlci5cbmV4cG9ydCBjbGFzcyBEZWNvcmF0b3JDbGFzc1Zpc2l0b3Ige1xuICAvKiogRGVjb3JhdG9ycyBvbiB0aGUgY2xhc3MgaXRzZWxmLiAqL1xuICBwcml2YXRlIGRlY29yYXRvcnM6IHRzLkRlY29yYXRvcltdO1xuICAvKiogVGhlIGNvbnN0cnVjdG9yIHBhcmFtZXRlciBsaXN0IGFuZCBkZWNvcmF0b3JzIG9uIGVhY2ggcGFyYW0uICovXG4gIHByaXZhdGUgY3RvclBhcmFtZXRlcnM6IENvbnN0cnVjdG9yUGFyYW1ldGVyW107XG4gIC8qKiBQZXItbWV0aG9kIGRlY29yYXRvcnMuICovXG4gIHByaXZhdGUgcHJvcERlY29yYXRvcnM6IE1hcDxzdHJpbmcsIHRzLkRlY29yYXRvcltdPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgdHlwZUNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLCBwcml2YXRlIHJld3JpdGVyOiBSZXdyaXRlcixcbiAgICAgIHByaXZhdGUgY2xhc3NEZWNsOiB0cy5DbGFzc0RlY2xhcmF0aW9uLFxuICAgICAgcHJpdmF0ZSBpbXBvcnRlZE5hbWVzOiBBcnJheTx7bmFtZTogdHMuSWRlbnRpZmllciwgZGVjbGFyYXRpb25OYW1lczogdHMuSWRlbnRpZmllcltdfT4pIHtcbiAgICBpZiAoY2xhc3NEZWNsLmRlY29yYXRvcnMpIHtcbiAgICAgIGNvbnN0IHRvTG93ZXIgPSB0aGlzLmRlY29yYXRvcnNUb0xvd2VyKGNsYXNzRGVjbCk7XG4gICAgICBpZiAodG9Mb3dlci5sZW5ndGggPiAwKSB0aGlzLmRlY29yYXRvcnMgPSB0b0xvd2VyO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGdpdmVuIGRlY29yYXRvciBzaG91bGQgYmUgcmUtd3JpdHRlbiBhcyBhbiBhbm5vdGF0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBkZWNvcmF0b3JzVG9Mb3dlcihuOiB0cy5Ob2RlKTogdHMuRGVjb3JhdG9yW10ge1xuICAgIGlmIChuLmRlY29yYXRvcnMpIHtcbiAgICAgIHJldHVybiBuLmRlY29yYXRvcnMuZmlsdGVyKChkKSA9PiBzaG91bGRMb3dlcihkLCB0aGlzLnR5cGVDaGVja2VyKSk7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBnYXRoZXJDb25zdHJ1Y3RvciBncmFicyB0aGUgcGFyYW1ldGVyIGxpc3QgYW5kIGRlY29yYXRvcnMgb2ZmIHRoZSBjbGFzc1xuICAgKiBjb25zdHJ1Y3RvciwgYW5kIGVtaXRzIG5vdGhpbmcuXG4gICAqL1xuICBwcml2YXRlIGdhdGhlckNvbnN0cnVjdG9yKGN0b3I6IHRzLkNvbnN0cnVjdG9yRGVjbGFyYXRpb24pIHtcbiAgICBjb25zdCBjdG9yUGFyYW1ldGVyczogQ29uc3RydWN0b3JQYXJhbWV0ZXJbXSA9IFtdO1xuICAgIGxldCBoYXNEZWNvcmF0ZWRQYXJhbSA9IGZhbHNlO1xuICAgIGZvciAoY29uc3QgcGFyYW0gb2YgY3Rvci5wYXJhbWV0ZXJzKSB7XG4gICAgICBjb25zdCBjdG9yUGFyYW06IENvbnN0cnVjdG9yUGFyYW1ldGVyID0ge3R5cGU6IG51bGwsIGRlY29yYXRvcnM6IG51bGx9O1xuICAgICAgaWYgKHBhcmFtLmRlY29yYXRvcnMpIHtcbiAgICAgICAgY3RvclBhcmFtLmRlY29yYXRvcnMgPSB0aGlzLmRlY29yYXRvcnNUb0xvd2VyKHBhcmFtKTtcbiAgICAgICAgaGFzRGVjb3JhdGVkUGFyYW0gPSBoYXNEZWNvcmF0ZWRQYXJhbSB8fCBjdG9yUGFyYW0uZGVjb3JhdG9ycy5sZW5ndGggPiAwO1xuICAgICAgfVxuICAgICAgaWYgKHBhcmFtLnR5cGUpIHtcbiAgICAgICAgLy8gcGFyYW0gaGFzIGEgdHlwZSBwcm92aWRlZCwgZS5nLiBcImZvbzogQmFyXCIuXG4gICAgICAgIC8vIFZlcmlmeSB0aGF0IFwiQmFyXCIgaXMgYSB2YWx1ZSAoZS5nLiBhIGNvbnN0cnVjdG9yKSBhbmQgbm90IGp1c3QgYSB0eXBlLlxuICAgICAgICBjb25zdCBzeW0gPSB0aGlzLnR5cGVDaGVja2VyLmdldFR5cGVBdExvY2F0aW9uKHBhcmFtLnR5cGUpLmdldFN5bWJvbCgpO1xuICAgICAgICBpZiAoc3ltICYmIChzeW0uZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5WYWx1ZSkpIHtcbiAgICAgICAgICBjdG9yUGFyYW0udHlwZSA9IHBhcmFtLnR5cGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGN0b3JQYXJhbWV0ZXJzLnB1c2goY3RvclBhcmFtKTtcbiAgICB9XG5cbiAgICAvLyBVc2UgdGhlIGN0b3IgcGFyYW1ldGVyIG1ldGFkYXRhIG9ubHkgaWYgdGhlIGNsYXNzIG9yIHRoZSBjdG9yIHdhcyBkZWNvcmF0ZWQuXG4gICAgaWYgKHRoaXMuZGVjb3JhdG9ycyB8fCBoYXNEZWNvcmF0ZWRQYXJhbSkge1xuICAgICAgdGhpcy5jdG9yUGFyYW1ldGVycyA9IGN0b3JQYXJhbWV0ZXJzO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBnYXRoZXJNZXRob2QgZ3JhYnMgdGhlIGRlY29yYXRvcnMgb2ZmIGEgY2xhc3MgbWV0aG9kIGFuZCBlbWl0cyBub3RoaW5nLlxuICAgKi9cbiAgcHJpdmF0ZSBnYXRoZXJNZXRob2RPclByb3BlcnR5KG1ldGhvZDogdHMuTmFtZWREZWNsYXJhdGlvbikge1xuICAgIGlmICghbWV0aG9kLmRlY29yYXRvcnMpIHJldHVybjtcbiAgICBpZiAoIW1ldGhvZC5uYW1lIHx8IG1ldGhvZC5uYW1lLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgICAgLy8gTWV0aG9kIGhhcyBhIHdlaXJkIG5hbWUsIGUuZy5cbiAgICAgIC8vICAgW1N5bWJvbC5mb29dKCkgey4uLn1cbiAgICAgIHRoaXMucmV3cml0ZXIuZXJyb3IobWV0aG9kLCAnY2Fubm90IHByb2Nlc3MgZGVjb3JhdG9ycyBvbiBzdHJhbmdlbHkgbmFtZWQgbWV0aG9kJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbmFtZSA9IChtZXRob2QubmFtZSBhcyB0cy5JZGVudGlmaWVyKS50ZXh0O1xuICAgIGNvbnN0IGRlY29yYXRvcnM6IHRzLkRlY29yYXRvcltdID0gdGhpcy5kZWNvcmF0b3JzVG9Mb3dlcihtZXRob2QpO1xuICAgIGlmIChkZWNvcmF0b3JzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgIGlmICghdGhpcy5wcm9wRGVjb3JhdG9ycykgdGhpcy5wcm9wRGVjb3JhdG9ycyA9IG5ldyBNYXA8c3RyaW5nLCB0cy5EZWNvcmF0b3JbXT4oKTtcbiAgICB0aGlzLnByb3BEZWNvcmF0b3JzLnNldChuYW1lLCBkZWNvcmF0b3JzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgbG93ZXJpbmcgZGVjb3JhdG9ycywgd2UgbmVlZCB0byByZWZlciB0byBjb25zdHJ1Y3RvciB0eXBlcy5cbiAgICogU28gd2Ugc3RhcnQgd2l0aCB0aGUgaWRlbnRpZmllcnMgdGhhdCByZXByZXNlbnQgdGhlc2UgdHlwZXMuXG4gICAqIEhvd2V2ZXIsIFR5cGVTY3JpcHQgZG9lcyBub3QgYWxsb3cgdXMgdG8gZW1pdCB0aGVtIGluIGEgdmFsdWUgcG9zaXRpb25cbiAgICogYXMgaXQgYXNzb2NpYXRlZCBkaWZmZXJlbnQgc3ltYm9sIGluZm9ybWF0aW9uIHdpdGggaXQuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIGxvb2tzIGZvciB0aGUgcGxhY2Ugd2hlcmUgdGhlIHZhbHVlIHRoYXQgaXMgYXNzb2NpYXRlZCB0b1xuICAgKiB0aGUgdHlwZSBpcyBkZWZpbmVkIGFuZCByZXR1cm5zIHRoYXQgaWRlbnRpZmllciBpbnN0ZWFkLlxuICAgKlxuICAgKiBUaGlzIG1pZ2h0IGJlIHNpbXBsaWZpZWQgd2hlbiBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzE3NTE2IGlzIHNvbHZlZC5cbiAgICovXG4gIHByaXZhdGUgZ2V0VmFsdWVJZGVudGlmaWVyRm9yVHlwZSh0eXBlU3ltYm9sOiB0cy5TeW1ib2wsIHR5cGVOb2RlOiB0cy5UeXBlTm9kZSk6IHRzLklkZW50aWZpZXJcbiAgICAgIHxudWxsIHtcbiAgICBjb25zdCB2YWx1ZURlY2xhcmF0aW9uID0gdHlwZVN5bWJvbC52YWx1ZURlY2xhcmF0aW9uIGFzIHRzLk5hbWVkRGVjbGFyYXRpb247XG4gICAgaWYgKCF2YWx1ZURlY2xhcmF0aW9uKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCB2YWx1ZU5hbWUgPSB2YWx1ZURlY2xhcmF0aW9uLm5hbWU7XG4gICAgaWYgKCF2YWx1ZU5hbWUgfHwgdmFsdWVOYW1lLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmICh2YWx1ZU5hbWUuZ2V0U291cmNlRmlsZSgpID09PSB0aGlzLnJld3JpdGVyLmZpbGUpIHtcbiAgICAgIHJldHVybiB2YWx1ZU5hbWU7XG4gICAgfVxuICAgIC8vIE5lZWQgdG8gbG9vayBhdCB0aGUgZmlyc3QgaWRlbnRpZmllciBvbmx5XG4gICAgLy8gdG8gaWdub3JlIGdlbmVyaWNzLlxuICAgIGNvbnN0IGZpcnN0SWRlbnRpZmllckluVHlwZSA9IGZpcnN0SWRlbnRpZmllckluU3VidHJlZSh0eXBlTm9kZSk7XG4gICAgaWYgKGZpcnN0SWRlbnRpZmllckluVHlwZSkge1xuICAgICAgZm9yIChjb25zdCB7bmFtZSwgZGVjbGFyYXRpb25OYW1lc30gb2YgdGhpcy5pbXBvcnRlZE5hbWVzKSB7XG4gICAgICAgIGlmIChmaXJzdElkZW50aWZpZXJJblR5cGUudGV4dCA9PT0gbmFtZS50ZXh0ICYmXG4gICAgICAgICAgICBkZWNsYXJhdGlvbk5hbWVzLnNvbWUoZCA9PiBkID09PSB2YWx1ZU5hbWUpKSB7XG4gICAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBiZWZvcmVQcm9jZXNzTm9kZShub2RlOiB0cy5Ob2RlKSB7XG4gICAgc3dpdGNoIChub2RlLmtpbmQpIHtcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Db25zdHJ1Y3RvcjpcbiAgICAgICAgdGhpcy5nYXRoZXJDb25zdHJ1Y3Rvcihub2RlIGFzIHRzLkNvbnN0cnVjdG9yRGVjbGFyYXRpb24pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Qcm9wZXJ0eURlY2xhcmF0aW9uOlxuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlNldEFjY2Vzc29yOlxuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkdldEFjY2Vzc29yOlxuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk1ldGhvZERlY2xhcmF0aW9uOlxuICAgICAgICB0aGlzLmdhdGhlck1ldGhvZE9yUHJvcGVydHkobm9kZSBhcyB0cy5EZWNsYXJhdGlvbik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBkZWNvcmF0b3IgaXMgb24gYSBjbGFzcywgYXMgb3Bwb3NlZCB0byBhIGZpZWxkIG9yIGFuXG4gICAqIGFyZ3VtZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBpc0NsYXNzRGVjb3JhdG9yKGRlY29yYXRvcjogdHMuRGVjb3JhdG9yKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGRlY29yYXRvci5wYXJlbnQgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICBkZWNvcmF0b3IucGFyZW50LmtpbmQgPT09IHRzLlN5bnRheEtpbmQuQ2xhc3NEZWNsYXJhdGlvbjtcbiAgfVxuXG4gIG1heWJlUHJvY2Vzc0RlY29yYXRvcihub2RlOiB0cy5EZWNvcmF0b3IsIHN0YXJ0PzogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgLy8gT25seSBzdHJpcCBmaWVsZCBhbmQgYXJndW1lbnQgZGVjb3JhdG9ycywgdGhlIGNsYXNzIGRlY29yYXRpb25cbiAgICAvLyBkb3dubGV2ZWwgdHJhbnNmb3JtZXIgd2lsbCBzdHJpcCBjbGFzcyBkZWNvcmF0aW9uc1xuICAgIGlmIChzaG91bGRMb3dlcihub2RlLCB0aGlzLnR5cGVDaGVja2VyKSAmJiAhdGhpcy5pc0NsYXNzRGVjb3JhdG9yKG5vZGUpKSB7XG4gICAgICAvLyBSZXR1cm4gdHJ1ZSB0byBzaWduYWwgdGhhdCB0aGlzIG5vZGUgc2hvdWxkIG5vdCBiZSBlbWl0dGVkLFxuICAgICAgLy8gYnV0IHN0aWxsIGVtaXQgdGhlIHdoaXRlc3BhY2UgKmJlZm9yZSogdGhlIG5vZGUuXG4gICAgICBpZiAoIXN0YXJ0KSB7XG4gICAgICAgIHN0YXJ0ID0gbm9kZS5nZXRGdWxsU3RhcnQoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmV3cml0ZXIud3JpdGVSYW5nZShub2RlLCBzdGFydCwgbm9kZS5nZXRTdGFydCgpKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmb3VuZERlY29yYXRvcnMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhKHRoaXMuZGVjb3JhdG9ycyB8fCB0aGlzLmN0b3JQYXJhbWV0ZXJzIHx8IHRoaXMucHJvcERlY29yYXRvcnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIGVtaXRzIHRoZSB0eXBlcyBmb3IgdGhlIHZhcmlvdXMgZ2F0aGVyZWQgbWV0YWRhdGEgdG8gYmUgdXNlZFxuICAgKiBpbiB0aGUgdHNpY2tsZSB0eXBlIGFubm90YXRpb25zIGhlbHBlci5cbiAgICovXG4gIGVtaXRNZXRhZGF0YVR5cGVBbm5vdGF0aW9uc0hlbHBlcnMoKSB7XG4gICAgaWYgKCF0aGlzLmNsYXNzRGVjbC5uYW1lKSByZXR1cm47XG4gICAgY29uc3QgY2xhc3NOYW1lID0gZ2V0SWRlbnRpZmllclRleHQodGhpcy5jbGFzc0RlY2wubmFtZSk7XG4gICAgaWYgKHRoaXMuZGVjb3JhdG9ycykge1xuICAgICAgdGhpcy5yZXdyaXRlci5lbWl0KGAvKiogQHR5cGUgeyFBcnJheTx7dHlwZTogIUZ1bmN0aW9uLCBhcmdzOiAodW5kZWZpbmVkfCFBcnJheTw/Pil9Pn0gKi9cXG5gKTtcbiAgICAgIHRoaXMucmV3cml0ZXIuZW1pdChgJHtjbGFzc05hbWV9LmRlY29yYXRvcnM7XFxuYCk7XG4gICAgfVxuICAgIGlmICh0aGlzLmRlY29yYXRvcnMgfHwgdGhpcy5jdG9yUGFyYW1ldGVycykge1xuICAgICAgdGhpcy5yZXdyaXRlci5lbWl0KGAvKipcXG5gKTtcbiAgICAgIHRoaXMucmV3cml0ZXIuZW1pdChgICogQG5vY29sbGFwc2VcXG5gKTtcbiAgICAgIHRoaXMucmV3cml0ZXIuZW1pdChcbiAgICAgICAgICBgICogQHR5cGUge2Z1bmN0aW9uKCk6ICFBcnJheTwobnVsbHx7dHlwZTogPywgZGVjb3JhdG9yczogKHVuZGVmaW5lZHwhQXJyYXk8e3R5cGU6ICFGdW5jdGlvbiwgYXJnczogKHVuZGVmaW5lZHwhQXJyYXk8Pz4pfT4pfSk+fVxcbmApO1xuICAgICAgdGhpcy5yZXdyaXRlci5lbWl0KGAgKi9cXG5gKTtcbiAgICAgIHRoaXMucmV3cml0ZXIuZW1pdChgJHtjbGFzc05hbWV9LmN0b3JQYXJhbWV0ZXJzO1xcbmApO1xuICAgIH1cbiAgICBpZiAodGhpcy5wcm9wRGVjb3JhdG9ycykge1xuICAgICAgdGhpcy5yZXdyaXRlci5lbWl0KFxuICAgICAgICAgIGAvKiogQHR5cGUgeyFPYmplY3Q8c3RyaW5nLCFBcnJheTx7dHlwZTogIUZ1bmN0aW9uLCBhcmdzOiAodW5kZWZpbmVkfCFBcnJheTw/Pil9Pj59ICovXFxuYCk7XG4gICAgICB0aGlzLnJld3JpdGVyLmVtaXQoYCR7Y2xhc3NOYW1lfS5wcm9wRGVjb3JhdG9ycztcXG5gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogZW1pdE1ldGFkYXRhIGVtaXRzIHRoZSB2YXJpb3VzIGdhdGhlcmVkIG1ldGFkYXRhLCBhcyBzdGF0aWMgZmllbGRzLlxuICAgKi9cbiAgZW1pdE1ldGFkYXRhQXNTdGF0aWNQcm9wZXJ0aWVzKCkge1xuICAgIGNvbnN0IGRlY29yYXRvckludm9jYXRpb25zID0gJ3t0eXBlOiBGdW5jdGlvbiwgYXJncz86IGFueVtdfVtdJztcblxuICAgIGlmICh0aGlzLmRlY29yYXRvcnMgfHwgdGhpcy5jdG9yUGFyYW1ldGVycykge1xuICAgICAgdGhpcy5yZXdyaXRlci5lbWl0KGAvKiogQG5vY29sbGFwc2UgKi9cXG5gKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jdG9yUGFyYW1ldGVycykge1xuICAgICAgLy8gY3RvclBhcmFtZXRlcnMgbWF5IGNvbnRhaW4gZm9yd2FyZCByZWZlcmVuY2VzIGluIHRoZSB0eXBlOiBmaWVsZCwgc28gd3JhcCBpbiBhIGZ1bmN0aW9uXG4gICAgICAvLyBjbG9zdXJlXG4gICAgICB0aGlzLnJld3JpdGVyLmVtaXQoXG4gICAgICAgICAgYHN0YXRpYyBjdG9yUGFyYW1ldGVyczogKCkgPT4gKHt0eXBlOiBhbnksIGRlY29yYXRvcnM/OiBgICsgZGVjb3JhdG9ySW52b2NhdGlvbnMgK1xuICAgICAgICAgIGB9fG51bGwpW10gPSAoKSA9PiBbXFxuYCk7XG4gICAgICBmb3IgKGNvbnN0IHBhcmFtIG9mIHRoaXMuY3RvclBhcmFtZXRlcnMgfHwgW10pIHtcbiAgICAgICAgaWYgKCFwYXJhbS50eXBlICYmICFwYXJhbS5kZWNvcmF0b3JzKSB7XG4gICAgICAgICAgdGhpcy5yZXdyaXRlci5lbWl0KCdudWxsLFxcbicpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmV3cml0ZXIuZW1pdChge3R5cGU6IGApO1xuICAgICAgICBpZiAoIXBhcmFtLnR5cGUpIHtcbiAgICAgICAgICB0aGlzLnJld3JpdGVyLmVtaXQoYHVuZGVmaW5lZGApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEZvciB0cmFuc2Zvcm1lciBtb2RlLCB0c2lja2xlIG11c3QgZW1pdCBub3Qgb25seSB0aGUgc3RyaW5nIHJlZmVycmluZyB0byB0aGUgdHlwZSxcbiAgICAgICAgICAvLyBidXQgYWxzbyBjcmVhdGUgYSBzb3VyY2UgbWFwcGluZywgc28gdGhhdCBUeXBlU2NyaXB0IGNhbiBsYXRlciByZWNvZ25pemUgdGhhdCB0aGVcbiAgICAgICAgICAvLyBzeW1ib2wgaXMgdXNlZCBpbiBhIHZhbHVlIHBvc2l0aW9uLCBzbyB0aGF0IFR5cGVTY3JpcHQgZW1pdHMgYW4gaW1wb3J0IGZvciB0aGVcbiAgICAgICAgICAvLyBzeW1ib2wuXG4gICAgICAgICAgLy8gVGhlIGNvZGUgYmVsb3cgYW5kIGluIGdldFZhbHVlSWRlbnRpZmllckZvclR5cGUgZmluZHMgdGhlIHZhbHVlIG5vZGUgY29ycmVzcG9uZGluZyB0b1xuICAgICAgICAgIC8vIHRoZSB0eXBlIGFuZCBlbWl0cyB0aGF0IHN5bWJvbCBpZiBwb3NzaWJsZS4gVGhpcyBjYXVzZXMgYSBzb3VyY2UgbWFwcGluZyB0byB0aGUgdmFsdWUsXG4gICAgICAgICAgLy8gd2hpY2ggdGhlbiBhbGxvd3MgbGF0ZXIgdHJhbnNmb3JtZXJzIGluIHRoZSBwaXBlbGluZSB0byBkbyB0aGUgY29ycmVjdCBtb2R1bGVcbiAgICAgICAgICAvLyByZXdyaXRpbmcuIE5vdGUgdGhhdCB3ZSBjYW5ub3QgdXNlIHBhcmFtLnR5cGUgYXMgdGhlIGVtaXQgbm9kZSBkaXJlY3RseSAobm90IGV2ZW4ganVzdFxuICAgICAgICAgIC8vIGZvciBtYXBwaW5nKSwgYmVjYXVzZSB0aGF0IGlzIG1hcmtlZCBhcyBhIHR5cGUgdXNlIG9mIHRoZSBub2RlLCBub3QgYSB2YWx1ZSB1c2UsIHNvIGl0XG4gICAgICAgICAgLy8gZG9lc24ndCBnZXQgdXBkYXRlZCBhcyBhbiBleHBvcnQuXG4gICAgICAgICAgY29uc3Qgc3ltID0gdGhpcy50eXBlQ2hlY2tlci5nZXRUeXBlQXRMb2NhdGlvbihwYXJhbS50eXBlKS5nZXRTeW1ib2woKSE7XG4gICAgICAgICAgY29uc3QgZW1pdE5vZGUgPSB0aGlzLmdldFZhbHVlSWRlbnRpZmllckZvclR5cGUoc3ltLCBwYXJhbS50eXBlKTtcbiAgICAgICAgICBpZiAoZW1pdE5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMucmV3cml0ZXIud3JpdGVSYW5nZShlbWl0Tm9kZSwgZW1pdE5vZGUuZ2V0U3RhcnQoKSwgZW1pdE5vZGUuZ2V0RW5kKCkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB0eXBlU3RyID0gbmV3IFR5cGVUcmFuc2xhdG9yKHRoaXMudHlwZUNoZWNrZXIsIHBhcmFtLnR5cGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zeW1ib2xUb1N0cmluZyhzeW0sIC8qIHVzZUZxbiAqLyB0cnVlKTtcbiAgICAgICAgICAgIHRoaXMucmV3cml0ZXIuZW1pdCh0eXBlU3RyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZXdyaXRlci5lbWl0KGAsIGApO1xuICAgICAgICBpZiAocGFyYW0uZGVjb3JhdG9ycykge1xuICAgICAgICAgIHRoaXMucmV3cml0ZXIuZW1pdCgnZGVjb3JhdG9yczogWycpO1xuICAgICAgICAgIGZvciAoY29uc3QgZGVjb3JhdG9yIG9mIHBhcmFtLmRlY29yYXRvcnMpIHtcbiAgICAgICAgICAgIHRoaXMuZW1pdERlY29yYXRvcihkZWNvcmF0b3IpO1xuICAgICAgICAgICAgdGhpcy5yZXdyaXRlci5lbWl0KCcsICcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnJld3JpdGVyLmVtaXQoJ10nKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJld3JpdGVyLmVtaXQoJ30sXFxuJyk7XG4gICAgICB9XG4gICAgICB0aGlzLnJld3JpdGVyLmVtaXQoYF07XFxuYCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucHJvcERlY29yYXRvcnMpIHtcbiAgICAgIHRoaXMucmV3cml0ZXIuZW1pdChcbiAgICAgICAgICBgc3RhdGljIHByb3BEZWNvcmF0b3JzOiB7W2tleTogc3RyaW5nXTogYCArIGRlY29yYXRvckludm9jYXRpb25zICsgYH0gPSB7XFxuYCk7XG4gICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgdGhpcy5wcm9wRGVjb3JhdG9ycy5rZXlzKCkpIHtcbiAgICAgICAgdGhpcy5yZXdyaXRlci5lbWl0KGBcIiR7bmFtZX1cIjogW2ApO1xuXG4gICAgICAgIGZvciAoY29uc3QgZGVjb3JhdG9yIG9mIHRoaXMucHJvcERlY29yYXRvcnMuZ2V0KG5hbWUpISkge1xuICAgICAgICAgIHRoaXMuZW1pdERlY29yYXRvcihkZWNvcmF0b3IpO1xuICAgICAgICAgIHRoaXMucmV3cml0ZXIuZW1pdCgnLCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmV3cml0ZXIuZW1pdCgnXSxcXG4nKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmV3cml0ZXIuZW1pdCgnfTtcXG4nKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGVtaXREZWNvcmF0b3IoZGVjb3JhdG9yOiB0cy5EZWNvcmF0b3IpIHtcbiAgICB0aGlzLnJld3JpdGVyLmVtaXQoJ3sgdHlwZTogJyk7XG4gICAgY29uc3QgZXhwciA9IGRlY29yYXRvci5leHByZXNzaW9uO1xuICAgIHN3aXRjaCAoZXhwci5raW5kKSB7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcjpcbiAgICAgICAgLy8gVGhlIGRlY29yYXRvciB3YXMgYSBwbGFpbiBARm9vLlxuICAgICAgICB0aGlzLnJld3JpdGVyLnZpc2l0KGV4cHIpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5DYWxsRXhwcmVzc2lvbjpcbiAgICAgICAgLy8gVGhlIGRlY29yYXRvciB3YXMgYSBjYWxsLCBsaWtlIEBGb28oYmFyKS5cbiAgICAgICAgY29uc3QgY2FsbCA9IGV4cHIgYXMgdHMuQ2FsbEV4cHJlc3Npb247XG4gICAgICAgIHRoaXMucmV3cml0ZXIudmlzaXQoY2FsbC5leHByZXNzaW9uKTtcbiAgICAgICAgaWYgKGNhbGwuYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMucmV3cml0ZXIuZW1pdCgnLCBhcmdzOiBbJyk7XG4gICAgICAgICAgZm9yIChjb25zdCBhcmcgb2YgY2FsbC5hcmd1bWVudHMpIHtcbiAgICAgICAgICAgIHRoaXMucmV3cml0ZXIud3JpdGVOb2RlRnJvbShhcmcsIGFyZy5nZXRTdGFydCgpKTtcbiAgICAgICAgICAgIHRoaXMucmV3cml0ZXIuZW1pdCgnLCAnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5yZXdyaXRlci5lbWl0KCddJyk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aGlzLnJld3JpdGVyLmVycm9yVW5pbXBsZW1lbnRlZEtpbmQoZXhwciwgJ2dhdGhlcmluZyBtZXRhZGF0YScpO1xuICAgICAgICB0aGlzLnJld3JpdGVyLmVtaXQoJ3VuZGVmaW5lZCcpO1xuICAgIH1cbiAgICB0aGlzLnJld3JpdGVyLmVtaXQoJyB9Jyk7XG4gIH1cbn1cblxuY2xhc3MgRGVjb3JhdG9yUmV3cml0ZXIgZXh0ZW5kcyBSZXdyaXRlciB7XG4gIHByaXZhdGUgY3VycmVudERlY29yYXRvckNvbnZlcnRlcjogRGVjb3JhdG9yQ2xhc3NWaXNpdG9yO1xuICBwcml2YXRlIGltcG9ydGVkTmFtZXM6IEFycmF5PHtuYW1lOiB0cy5JZGVudGlmaWVyLCBkZWNsYXJhdGlvbk5hbWVzOiB0cy5JZGVudGlmaWVyW119PiA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSB0eXBlQ2hlY2tlcjogdHMuVHlwZUNoZWNrZXIsIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIHNvdXJjZU1hcHBlcjogU291cmNlTWFwcGVyKSB7XG4gICAgc3VwZXIoc291cmNlRmlsZSwgc291cmNlTWFwcGVyKTtcbiAgfVxuXG4gIHByb2Nlc3MoKToge291dHB1dDogc3RyaW5nLCBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdfSB7XG4gICAgdGhpcy52aXNpdCh0aGlzLmZpbGUpO1xuICAgIHJldHVybiB0aGlzLmdldE91dHB1dCgpO1xuICB9XG5cbiAgcHJvdGVjdGVkIG1heWJlUHJvY2Vzcyhub2RlOiB0cy5Ob2RlKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuY3VycmVudERlY29yYXRvckNvbnZlcnRlcikge1xuICAgICAgdGhpcy5jdXJyZW50RGVjb3JhdG9yQ29udmVydGVyLmJlZm9yZVByb2Nlc3NOb2RlKG5vZGUpO1xuICAgIH1cbiAgICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkltcG9ydERlY2xhcmF0aW9uOlxuICAgICAgICB0aGlzLmltcG9ydGVkTmFtZXMucHVzaChcbiAgICAgICAgICAgIC4uLmNvbGxlY3RJbXBvcnRlZE5hbWVzKHRoaXMudHlwZUNoZWNrZXIsIG5vZGUgYXMgdHMuSW1wb3J0RGVjbGFyYXRpb24pKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkRlY29yYXRvcjpcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudERlY29yYXRvckNvbnZlcnRlciAmJlxuICAgICAgICAgICAgdGhpcy5jdXJyZW50RGVjb3JhdG9yQ29udmVydGVyLm1heWJlUHJvY2Vzc0RlY29yYXRvcihub2RlIGFzIHRzLkRlY29yYXRvcik7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xhc3NEZWNsYXJhdGlvbjpcbiAgICAgICAgY29uc3Qgb2xkRGVjb3JhdG9yQ29udmVydGVyID0gdGhpcy5jdXJyZW50RGVjb3JhdG9yQ29udmVydGVyO1xuICAgICAgICB0aGlzLmN1cnJlbnREZWNvcmF0b3JDb252ZXJ0ZXIgPSBuZXcgRGVjb3JhdG9yQ2xhc3NWaXNpdG9yKFxuICAgICAgICAgICAgdGhpcy50eXBlQ2hlY2tlciwgdGhpcywgbm9kZSBhcyB0cy5DbGFzc0RlY2xhcmF0aW9uLCB0aGlzLmltcG9ydGVkTmFtZXMpO1xuICAgICAgICB0aGlzLndyaXRlTGVhZGluZ1RyaXZpYShub2RlKTtcbiAgICAgICAgdmlzaXRDbGFzc0NvbnRlbnRJbmNsdWRpbmdEZWNvcmF0b3JzKFxuICAgICAgICAgICAgbm9kZSBhcyB0cy5DbGFzc0RlY2xhcmF0aW9uLCB0aGlzLCB0aGlzLmN1cnJlbnREZWNvcmF0b3JDb252ZXJ0ZXIpO1xuICAgICAgICB0aGlzLmN1cnJlbnREZWNvcmF0b3JDb252ZXJ0ZXIgPSBvbGREZWNvcmF0b3JDb252ZXJ0ZXI7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGZpcnN0IGlkZW50aWZpZXIgaW4gdGhlIG5vZGUgdHJlZSBzdGFydGluZyBhdCBub2RlXG4gKiBpbiBhIGRlcHRoIGZpcnN0IG9yZGVyLlxuICpcbiAqIEBwYXJhbSBub2RlIFRoZSBub2RlIHRvIHN0YXJ0IHdpdGhcbiAqIEByZXR1cm4gVGhlIGZpcnN0IGlkZW50aWZpZXIgaWYgb25lIHdhcyBmb3VuZC5cbiAqL1xuZnVuY3Rpb24gZmlyc3RJZGVudGlmaWVySW5TdWJ0cmVlKG5vZGU6IHRzLk5vZGUpOiB0cy5JZGVudGlmaWVyfHVuZGVmaW5lZCB7XG4gIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgIHJldHVybiBub2RlIGFzIHRzLklkZW50aWZpZXI7XG4gIH1cbiAgcmV0dXJuIHRzLmZvckVhY2hDaGlsZChub2RlLCBmaXJzdElkZW50aWZpZXJJblN1YnRyZWUpO1xufVxuXG4vKipcbiAqIENvbGxlY3QgdGhlIElkZW50aWZpZXJzIHVzZWQgYXMgbmFtZWQgYmluZGluZ3MgaW4gdGhlIGdpdmVuIGltcG9ydCBkZWNsYXJhdGlvblxuICogd2l0aCB0aGVpciBTeW1ib2wuXG4gKiBUaGlzIGlzIG5lZWRlZCBsYXRlciBvbiB0byBmaW5kIGFuIGlkZW50aWZpZXIgdGhhdCByZXByZXNlbnRzIHRoZSB2YWx1ZVxuICogb2YgYW4gaW1wb3J0ZWQgdHlwZSBpZGVudGlmaWVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29sbGVjdEltcG9ydGVkTmFtZXModHlwZUNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLCBkZWNsOiB0cy5JbXBvcnREZWNsYXJhdGlvbik6XG4gICAgQXJyYXk8e25hbWU6IHRzLklkZW50aWZpZXIsIGRlY2xhcmF0aW9uTmFtZXM6IHRzLklkZW50aWZpZXJbXX0+IHtcbiAgY29uc3QgaW1wb3J0ZWROYW1lczogQXJyYXk8e25hbWU6IHRzLklkZW50aWZpZXIsIGRlY2xhcmF0aW9uTmFtZXM6IHRzLklkZW50aWZpZXJbXX0+ID0gW107XG4gIGNvbnN0IGltcG9ydENsYXVzZSA9IGRlY2wuaW1wb3J0Q2xhdXNlO1xuICBpZiAoIWltcG9ydENsYXVzZSkge1xuICAgIHJldHVybiBpbXBvcnRlZE5hbWVzO1xuICB9XG4gIGNvbnN0IG5hbWVzOiB0cy5JZGVudGlmaWVyW10gPSBbXTtcbiAgaWYgKGltcG9ydENsYXVzZS5uYW1lKSB7XG4gICAgbmFtZXMucHVzaChpbXBvcnRDbGF1c2UubmFtZSk7XG4gIH1cbiAgaWYgKGltcG9ydENsYXVzZS5uYW1lZEJpbmRpbmdzICYmXG4gICAgICBpbXBvcnRDbGF1c2UubmFtZWRCaW5kaW5ncy5raW5kID09PSB0cy5TeW50YXhLaW5kLk5hbWVkSW1wb3J0cykge1xuICAgIGNvbnN0IG5hbWVkSW1wb3J0cyA9IGltcG9ydENsYXVzZS5uYW1lZEJpbmRpbmdzIGFzIHRzLk5hbWVkSW1wb3J0cztcbiAgICBuYW1lcy5wdXNoKC4uLm5hbWVkSW1wb3J0cy5lbGVtZW50cy5tYXAoZSA9PiBlLm5hbWUpKTtcbiAgfVxuICBmb3IgKGNvbnN0IG5hbWUgb2YgbmFtZXMpIHtcbiAgICBsZXQgc3ltYm9sID0gdHlwZUNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbihuYW1lKSE7XG4gICAgaWYgKHN5bWJvbC5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLkFsaWFzKSB7XG4gICAgICBzeW1ib2wgPSB0eXBlQ2hlY2tlci5nZXRBbGlhc2VkU3ltYm9sKHN5bWJvbCk7XG4gICAgfVxuICAgIGNvbnN0IGRlY2xhcmF0aW9uTmFtZXM6IHRzLklkZW50aWZpZXJbXSA9IFtdO1xuICAgIGlmIChzeW1ib2wuZGVjbGFyYXRpb25zKSB7XG4gICAgICBmb3IgKGNvbnN0IGQgb2Ygc3ltYm9sLmRlY2xhcmF0aW9ucykge1xuICAgICAgICBjb25zdCBkZWNsID0gZCBhcyB0cy5OYW1lZERlY2xhcmF0aW9uO1xuICAgICAgICBpZiAoZGVjbC5uYW1lICYmIGRlY2wubmFtZS5raW5kID09PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIpIHtcbiAgICAgICAgICBkZWNsYXJhdGlvbk5hbWVzLnB1c2goZGVjbC5uYW1lIGFzIHRzLklkZW50aWZpZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzeW1ib2wuZGVjbGFyYXRpb25zKSB7XG4gICAgICBpbXBvcnRlZE5hbWVzLnB1c2goe25hbWUsIGRlY2xhcmF0aW9uTmFtZXN9KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGltcG9ydGVkTmFtZXM7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0Q2xhc3NDb250ZW50SW5jbHVkaW5nRGVjb3JhdG9ycyhcbiAgICBjbGFzc0RlY2w6IHRzLkNsYXNzRGVjbGFyYXRpb24sIHJld3JpdGVyOiBSZXdyaXRlciwgZGVjb3JhdG9yVmlzaXRvcj86IERlY29yYXRvckNsYXNzVmlzaXRvcikge1xuICBpZiAocmV3cml0ZXIuZmlsZS50ZXh0W2NsYXNzRGVjbC5nZXRFbmQoKSAtIDFdICE9PSAnfScpIHtcbiAgICByZXdyaXRlci5lcnJvcihjbGFzc0RlY2wsICd1bmV4cGVjdGVkIGNsYXNzIHRlcm1pbmF0b3InKTtcbiAgICByZXR1cm47XG4gIH1cbiAgcmV3cml0ZXIud3JpdGVOb2RlRnJvbShjbGFzc0RlY2wsIGNsYXNzRGVjbC5nZXRTdGFydCgpLCBjbGFzc0RlY2wuZ2V0RW5kKCkgLSAxKTtcbiAgLy8gQXQgdGhpcyBwb2ludCwgd2UndmUgZW1pdHRlZCB1cCB0aHJvdWdoIHRoZSBmaW5hbCBjaGlsZCBvZiB0aGUgY2xhc3MsIHNvIGFsbCB0aGF0XG4gIC8vIHJlbWFpbnMgaXMgdGhlIHRyYWlsaW5nIHdoaXRlc3BhY2UgYW5kIGNsb3NpbmcgY3VybHkgYnJhY2UuXG4gIC8vIFRoZSBmaW5hbCBjaGFyYWN0ZXIgb3duZWQgYnkgdGhlIGNsYXNzIG5vZGUgc2hvdWxkIGFsd2F5cyBiZSBhICd9JyxcbiAgLy8gb3Igd2Ugc29tZWhvdyBnb3QgdGhlIEFTVCB3cm9uZyBhbmQgc2hvdWxkIHJlcG9ydCBhbiBlcnJvci5cbiAgLy8gKEFueSB3aGl0ZXNwYWNlIG9yIHNlbWljb2xvbiBmb2xsb3dpbmcgdGhlICd9JyB3aWxsIGJlIHBhcnQgb2YgdGhlIG5leHQgTm9kZS4pXG4gIGlmIChkZWNvcmF0b3JWaXNpdG9yKSB7XG4gICAgZGVjb3JhdG9yVmlzaXRvci5lbWl0TWV0YWRhdGFBc1N0YXRpY1Byb3BlcnRpZXMoKTtcbiAgfVxuICByZXdyaXRlci53cml0ZVJhbmdlKGNsYXNzRGVjbCwgY2xhc3NEZWNsLmdldEVuZCgpIC0gMSwgY2xhc3NEZWNsLmdldEVuZCgpKTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gY29udmVydERlY29yYXRvcnMoXG4gICAgdHlwZUNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLCBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLFxuICAgIHNvdXJjZU1hcHBlcjogU291cmNlTWFwcGVyKToge291dHB1dDogc3RyaW5nLCBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdfSB7XG4gIHJldHVybiBuZXcgRGVjb3JhdG9yUmV3cml0ZXIodHlwZUNoZWNrZXIsIHNvdXJjZUZpbGUsIHNvdXJjZU1hcHBlcikucHJvY2VzcygpO1xufVxuIl19