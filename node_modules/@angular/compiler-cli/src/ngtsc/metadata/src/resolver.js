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
        define("@angular/compiler-cli/src/ngtsc/metadata/src/resolver", ["require", "exports", "tslib", "@angular/compiler", "path", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    /**
     * resolver.ts implements partial computation of expressions, resolving expressions to static
     * values where possible and returning a `DynamicValue` signal when not.
     */
    var compiler_1 = require("@angular/compiler");
    var path = require("path");
    var ts = require("typescript");
    var TS_DTS_JS_EXTENSION = /(?:\.d)?\.ts$|\.js$/;
    /**
     * Represents a value which cannot be determined statically.
     *
     * Use `isDynamicValue` to determine whether a `ResolvedValue` is a `DynamicValue`.
     */
    var DynamicValue = /** @class */ (function () {
        function DynamicValue() {
            /**
             * This is needed so the "is DynamicValue" assertion of `isDynamicValue` actually has meaning.
             *
             * Otherwise, "is DynamicValue" is akin to "is {}" which doesn't trigger narrowing.
             */
            this._isDynamic = true;
        }
        return DynamicValue;
    }());
    exports.DynamicValue = DynamicValue;
    /**
     * An internal flyweight for `DynamicValue`. Eventually the dynamic value will carry information
     * on the location of the node that could not be statically computed.
     */
    var DYNAMIC_VALUE = new DynamicValue();
    /**
     * Used to test whether a `ResolvedValue` is a `DynamicValue`.
     */
    function isDynamicValue(value) {
        return value === DYNAMIC_VALUE;
    }
    exports.isDynamicValue = isDynamicValue;
    /**
     * A value member of an enumeration.
     *
     * Contains a `Reference` to the enumeration itself, and the name of the referenced member.
     */
    var EnumValue = /** @class */ (function () {
        function EnumValue(enumRef, name) {
            this.enumRef = enumRef;
            this.name = name;
        }
        return EnumValue;
    }());
    exports.EnumValue = EnumValue;
    /**
     * An implementation of a builtin function, such as `Array.prototype.slice`.
     */
    var BuiltinFn = /** @class */ (function () {
        function BuiltinFn() {
        }
        return BuiltinFn;
    }());
    exports.BuiltinFn = BuiltinFn;
    var ArraySliceBuiltinFn = /** @class */ (function (_super) {
        tslib_1.__extends(ArraySliceBuiltinFn, _super);
        function ArraySliceBuiltinFn(lhs) {
            var _this = _super.call(this) || this;
            _this.lhs = lhs;
            return _this;
        }
        ArraySliceBuiltinFn.prototype.evaluate = function (args) {
            if (args.length === 0) {
                return this.lhs;
            }
            else {
                return DYNAMIC_VALUE;
            }
        };
        return ArraySliceBuiltinFn;
    }(BuiltinFn));
    var ImportMode;
    (function (ImportMode) {
        ImportMode[ImportMode["UseExistingImport"] = 0] = "UseExistingImport";
        ImportMode[ImportMode["ForceNewImport"] = 1] = "ForceNewImport";
    })(ImportMode = exports.ImportMode || (exports.ImportMode = {}));
    /**
     * A reference to a `ts.Node`.
     *
     * For example, if an expression evaluates to a function or class definition, it will be returned
     * as a `Reference` (assuming references are allowed in evaluation).
     */
    var Reference = /** @class */ (function () {
        function Reference(node) {
            this.node = node;
        }
        return Reference;
    }());
    exports.Reference = Reference;
    /**
     * A reference to a node only, without any ability to get an `Expression` representing that node.
     *
     * This is used for returning references to things like method declarations, which are not directly
     * referenceable.
     */
    var NodeReference = /** @class */ (function (_super) {
        tslib_1.__extends(NodeReference, _super);
        function NodeReference(node, moduleName) {
            var _this = _super.call(this, node) || this;
            _this.moduleName = moduleName;
            return _this;
        }
        NodeReference.prototype.toExpression = function (context) { return null; };
        NodeReference.prototype.addIdentifier = function (identifier) { };
        return NodeReference;
    }(Reference));
    exports.NodeReference = NodeReference;
    /**
     * A reference to a node which has a `ts.Identifier` and can be resolved to an `Expression`.
     *
     * Imports generated by `ResolvedReference`s are always relative.
     */
    var ResolvedReference = /** @class */ (function (_super) {
        tslib_1.__extends(ResolvedReference, _super);
        function ResolvedReference(node, primaryIdentifier) {
            var _this = _super.call(this, node) || this;
            _this.primaryIdentifier = primaryIdentifier;
            _this.identifiers = [];
            _this.expressable = true;
            return _this;
        }
        ResolvedReference.prototype.toExpression = function (context, importMode) {
            if (importMode === void 0) { importMode = ImportMode.UseExistingImport; }
            var localIdentifier = pickIdentifier(context, this.primaryIdentifier, this.identifiers, importMode);
            if (localIdentifier !== null) {
                return new compiler_1.WrappedNodeExpr(localIdentifier);
            }
            else {
                // Relative import from context -> this.node.getSourceFile().
                // TODO(alxhub): investigate the impact of multiple source roots here.
                // TODO(alxhub): investigate the need to map such paths via the Host for proper g3 support.
                var relative = path.posix.relative(path.dirname(context.fileName), this.node.getSourceFile().fileName)
                    .replace(TS_DTS_JS_EXTENSION, '');
                // path.relative() does not include the leading './'.
                if (!relative.startsWith('.')) {
                    relative = "./" + relative;
                }
                // path.relative() returns the empty string (converted to './' above) if the two paths are the
                // same.
                if (relative === './') {
                    // Same file after all.
                    return new compiler_1.WrappedNodeExpr(this.primaryIdentifier);
                }
                else {
                    return new compiler_1.ExternalExpr(new compiler_1.ExternalReference(relative, this.primaryIdentifier.text));
                }
            }
        };
        ResolvedReference.prototype.addIdentifier = function (identifier) { this.identifiers.push(identifier); };
        return ResolvedReference;
    }(Reference));
    exports.ResolvedReference = ResolvedReference;
    /**
     * A reference to a node which has a `ts.Identifer` and an expected absolute module name.
     *
     * An `AbsoluteReference` can be resolved to an `Expression`, and if that expression is an import
     * the module specifier will be an absolute module name, not a relative path.
     */
    var AbsoluteReference = /** @class */ (function (_super) {
        tslib_1.__extends(AbsoluteReference, _super);
        function AbsoluteReference(node, primaryIdentifier, moduleName, symbolName) {
            var _this = _super.call(this, node) || this;
            _this.primaryIdentifier = primaryIdentifier;
            _this.moduleName = moduleName;
            _this.symbolName = symbolName;
            _this.identifiers = [];
            _this.expressable = true;
            return _this;
        }
        AbsoluteReference.prototype.toExpression = function (context, importMode) {
            if (importMode === void 0) { importMode = ImportMode.UseExistingImport; }
            var localIdentifier = pickIdentifier(context, this.primaryIdentifier, this.identifiers, importMode);
            if (localIdentifier !== null) {
                return new compiler_1.WrappedNodeExpr(localIdentifier);
            }
            else {
                return new compiler_1.ExternalExpr(new compiler_1.ExternalReference(this.moduleName, this.symbolName));
            }
        };
        AbsoluteReference.prototype.addIdentifier = function (identifier) { this.identifiers.push(identifier); };
        return AbsoluteReference;
    }(Reference));
    exports.AbsoluteReference = AbsoluteReference;
    function pickIdentifier(context, primary, secondaries, mode) {
        context = ts.getOriginalNode(context);
        if (ts.getOriginalNode(primary).getSourceFile() === context) {
            return primary;
        }
        else if (mode === ImportMode.UseExistingImport) {
            return secondaries.find(function (id) { return ts.getOriginalNode(id).getSourceFile() === context; }) || null;
        }
        else {
            return null;
        }
    }
    /**
     * Statically resolve the given `ts.Expression` into a `ResolvedValue`.
     *
     * @param node the expression to statically resolve if possible
     * @param checker a `ts.TypeChecker` used to understand the expression
     * @param foreignFunctionResolver a function which will be used whenever a "foreign function" is
     * encountered. A foreign function is a function which has no body - usually the result of calling
     * a function declared in another library's .d.ts file. In these cases, the foreignFunctionResolver
     * will be called with the function's declaration, and can optionally return a `ts.Expression`
     * (possibly extracted from the foreign function's type signature) which will be used as the result
     * of the call.
     * @returns a `ResolvedValue` representing the resolved value
     */
    function staticallyResolve(node, host, checker, foreignFunctionResolver) {
        return new StaticInterpreter(host, checker).visit(node, {
            absoluteModuleName: null,
            scope: new Map(), foreignFunctionResolver: foreignFunctionResolver,
        });
    }
    exports.staticallyResolve = staticallyResolve;
    function literalBinaryOp(op) {
        return { op: op, literal: true };
    }
    function referenceBinaryOp(op) {
        return { op: op, literal: false };
    }
    var BINARY_OPERATORS = new Map([
        [ts.SyntaxKind.PlusToken, literalBinaryOp(function (a, b) { return a + b; })],
        [ts.SyntaxKind.MinusToken, literalBinaryOp(function (a, b) { return a - b; })],
        [ts.SyntaxKind.AsteriskToken, literalBinaryOp(function (a, b) { return a * b; })],
        [ts.SyntaxKind.SlashToken, literalBinaryOp(function (a, b) { return a / b; })],
        [ts.SyntaxKind.PercentToken, literalBinaryOp(function (a, b) { return a % b; })],
        [ts.SyntaxKind.AmpersandToken, literalBinaryOp(function (a, b) { return a & b; })],
        [ts.SyntaxKind.BarToken, literalBinaryOp(function (a, b) { return a | b; })],
        [ts.SyntaxKind.CaretToken, literalBinaryOp(function (a, b) { return a ^ b; })],
        [ts.SyntaxKind.LessThanToken, literalBinaryOp(function (a, b) { return a < b; })],
        [ts.SyntaxKind.LessThanEqualsToken, literalBinaryOp(function (a, b) { return a <= b; })],
        [ts.SyntaxKind.GreaterThanToken, literalBinaryOp(function (a, b) { return a > b; })],
        [ts.SyntaxKind.GreaterThanEqualsToken, literalBinaryOp(function (a, b) { return a >= b; })],
        [ts.SyntaxKind.LessThanLessThanToken, literalBinaryOp(function (a, b) { return a << b; })],
        [ts.SyntaxKind.GreaterThanGreaterThanToken, literalBinaryOp(function (a, b) { return a >> b; })],
        [ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken, literalBinaryOp(function (a, b) { return a >>> b; })],
        [ts.SyntaxKind.AsteriskAsteriskToken, literalBinaryOp(function (a, b) { return Math.pow(a, b); })],
        [ts.SyntaxKind.AmpersandAmpersandToken, referenceBinaryOp(function (a, b) { return a && b; })],
        [ts.SyntaxKind.BarBarToken, referenceBinaryOp(function (a, b) { return a || b; })]
    ]);
    var UNARY_OPERATORS = new Map([
        [ts.SyntaxKind.TildeToken, function (a) { return ~a; }], [ts.SyntaxKind.MinusToken, function (a) { return -a; }],
        [ts.SyntaxKind.PlusToken, function (a) { return +a; }], [ts.SyntaxKind.ExclamationToken, function (a) { return !a; }]
    ]);
    var StaticInterpreter = /** @class */ (function () {
        function StaticInterpreter(host, checker) {
            this.host = host;
            this.checker = checker;
        }
        StaticInterpreter.prototype.visit = function (node, context) {
            return this.visitExpression(node, context);
        };
        StaticInterpreter.prototype.visitExpression = function (node, context) {
            if (node.kind === ts.SyntaxKind.TrueKeyword) {
                return true;
            }
            else if (node.kind === ts.SyntaxKind.FalseKeyword) {
                return false;
            }
            else if (ts.isStringLiteral(node)) {
                return node.text;
            }
            else if (ts.isNoSubstitutionTemplateLiteral(node)) {
                return node.text;
            }
            else if (ts.isTemplateExpression(node)) {
                return this.visitTemplateExpression(node, context);
            }
            else if (ts.isNumericLiteral(node)) {
                return parseFloat(node.text);
            }
            else if (ts.isObjectLiteralExpression(node)) {
                return this.visitObjectLiteralExpression(node, context);
            }
            else if (ts.isIdentifier(node)) {
                return this.visitIdentifier(node, context);
            }
            else if (ts.isPropertyAccessExpression(node)) {
                return this.visitPropertyAccessExpression(node, context);
            }
            else if (ts.isCallExpression(node)) {
                return this.visitCallExpression(node, context);
            }
            else if (ts.isConditionalExpression(node)) {
                return this.visitConditionalExpression(node, context);
            }
            else if (ts.isPrefixUnaryExpression(node)) {
                return this.visitPrefixUnaryExpression(node, context);
            }
            else if (ts.isBinaryExpression(node)) {
                return this.visitBinaryExpression(node, context);
            }
            else if (ts.isArrayLiteralExpression(node)) {
                return this.visitArrayLiteralExpression(node, context);
            }
            else if (ts.isParenthesizedExpression(node)) {
                return this.visitParenthesizedExpression(node, context);
            }
            else if (ts.isElementAccessExpression(node)) {
                return this.visitElementAccessExpression(node, context);
            }
            else if (ts.isAsExpression(node)) {
                return this.visitExpression(node.expression, context);
            }
            else if (ts.isNonNullExpression(node)) {
                return this.visitExpression(node.expression, context);
            }
            else if (this.host.isClass(node)) {
                return this.visitDeclaration(node, context);
            }
            else {
                return DYNAMIC_VALUE;
            }
        };
        StaticInterpreter.prototype.visitArrayLiteralExpression = function (node, context) {
            var array = [];
            for (var i = 0; i < node.elements.length; i++) {
                var element = node.elements[i];
                if (ts.isSpreadElement(element)) {
                    var spread = this.visitExpression(element.expression, context);
                    if (isDynamicValue(spread)) {
                        return DYNAMIC_VALUE;
                    }
                    if (!Array.isArray(spread)) {
                        throw new Error("Unexpected value in spread expression: " + spread);
                    }
                    array.push.apply(array, tslib_1.__spread(spread));
                }
                else {
                    var result = this.visitExpression(element, context);
                    if (isDynamicValue(result)) {
                        return DYNAMIC_VALUE;
                    }
                    array.push(result);
                }
            }
            return array;
        };
        StaticInterpreter.prototype.visitObjectLiteralExpression = function (node, context) {
            var map = new Map();
            for (var i = 0; i < node.properties.length; i++) {
                var property = node.properties[i];
                if (ts.isPropertyAssignment(property)) {
                    var name_1 = this.stringNameFromPropertyName(property.name, context);
                    // Check whether the name can be determined statically.
                    if (name_1 === undefined) {
                        return DYNAMIC_VALUE;
                    }
                    map.set(name_1, this.visitExpression(property.initializer, context));
                }
                else if (ts.isShorthandPropertyAssignment(property)) {
                    var symbol = this.checker.getShorthandAssignmentValueSymbol(property);
                    if (symbol === undefined || symbol.valueDeclaration === undefined) {
                        return DYNAMIC_VALUE;
                    }
                    map.set(property.name.text, this.visitDeclaration(symbol.valueDeclaration, context));
                }
                else if (ts.isSpreadAssignment(property)) {
                    var spread = this.visitExpression(property.expression, context);
                    if (isDynamicValue(spread)) {
                        return DYNAMIC_VALUE;
                    }
                    if (!(spread instanceof Map)) {
                        throw new Error("Unexpected value in spread assignment: " + spread);
                    }
                    spread.forEach(function (value, key) { return map.set(key, value); });
                }
                else {
                    return DYNAMIC_VALUE;
                }
            }
            return map;
        };
        StaticInterpreter.prototype.visitTemplateExpression = function (node, context) {
            var pieces = [node.head.text];
            for (var i = 0; i < node.templateSpans.length; i++) {
                var span = node.templateSpans[i];
                var value = this.visit(span.expression, context);
                if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ||
                    value == null) {
                    pieces.push("" + value);
                }
                else {
                    return DYNAMIC_VALUE;
                }
                pieces.push(span.literal.text);
            }
            return pieces.join('');
        };
        StaticInterpreter.prototype.visitIdentifier = function (node, context) {
            var decl = this.host.getDeclarationOfIdentifier(node);
            if (decl === null) {
                return DYNAMIC_VALUE;
            }
            var result = this.visitDeclaration(decl.node, tslib_1.__assign({}, context, { absoluteModuleName: decl.viaModule || context.absoluteModuleName }));
            if (result instanceof Reference) {
                result.addIdentifier(node);
            }
            return result;
        };
        StaticInterpreter.prototype.visitDeclaration = function (node, context) {
            if (this.host.isClass(node)) {
                return this.getReference(node, context);
            }
            else if (ts.isVariableDeclaration(node)) {
                return this.visitVariableDeclaration(node, context);
            }
            else if (ts.isParameter(node) && context.scope.has(node)) {
                return context.scope.get(node);
            }
            else if (ts.isExportAssignment(node)) {
                return this.visitExpression(node.expression, context);
            }
            else if (ts.isEnumDeclaration(node)) {
                return this.visitEnumDeclaration(node, context);
            }
            else if (ts.isSourceFile(node)) {
                return this.visitSourceFile(node, context);
            }
            else {
                return this.getReference(node, context);
            }
        };
        StaticInterpreter.prototype.visitVariableDeclaration = function (node, context) {
            var value = this.host.getVariableValue(node);
            if (value !== null) {
                return this.visitExpression(value, context);
            }
            else if (isVariableDeclarationDeclared(node)) {
                return this.getReference(node, context);
            }
            else {
                return undefined;
            }
        };
        StaticInterpreter.prototype.visitEnumDeclaration = function (node, context) {
            var _this = this;
            var enumRef = this.getReference(node, context);
            var map = new Map();
            node.members.forEach(function (member) {
                var name = _this.stringNameFromPropertyName(member.name, context);
                if (name !== undefined) {
                    map.set(name, new EnumValue(enumRef, name));
                }
            });
            return map;
        };
        StaticInterpreter.prototype.visitElementAccessExpression = function (node, context) {
            var lhs = this.visitExpression(node.expression, context);
            if (node.argumentExpression === undefined) {
                throw new Error("Expected argument in ElementAccessExpression");
            }
            if (isDynamicValue(lhs)) {
                return DYNAMIC_VALUE;
            }
            var rhs = this.visitExpression(node.argumentExpression, context);
            if (isDynamicValue(rhs)) {
                return DYNAMIC_VALUE;
            }
            if (typeof rhs !== 'string' && typeof rhs !== 'number') {
                throw new Error("ElementAccessExpression index should be string or number, got " + typeof rhs + ": " + rhs);
            }
            return this.accessHelper(lhs, rhs, context);
        };
        StaticInterpreter.prototype.visitPropertyAccessExpression = function (node, context) {
            var lhs = this.visitExpression(node.expression, context);
            var rhs = node.name.text;
            // TODO: handle reference to class declaration.
            if (isDynamicValue(lhs)) {
                return DYNAMIC_VALUE;
            }
            return this.accessHelper(lhs, rhs, context);
        };
        StaticInterpreter.prototype.visitSourceFile = function (node, context) {
            var _this = this;
            var declarations = this.host.getExportsOfModule(node);
            if (declarations === null) {
                return DYNAMIC_VALUE;
            }
            var map = new Map();
            declarations.forEach(function (decl, name) {
                var value = _this.visitDeclaration(decl.node, tslib_1.__assign({}, context, { absoluteModuleName: decl.viaModule || context.absoluteModuleName }));
                map.set(name, value);
            });
            return map;
        };
        StaticInterpreter.prototype.accessHelper = function (lhs, rhs, context) {
            var strIndex = "" + rhs;
            if (lhs instanceof Map) {
                if (lhs.has(strIndex)) {
                    return lhs.get(strIndex);
                }
                else {
                    throw new Error("Invalid map access: [" + Array.from(lhs.keys()) + "] dot " + rhs);
                }
            }
            else if (Array.isArray(lhs)) {
                if (rhs === 'length') {
                    return lhs.length;
                }
                else if (rhs === 'slice') {
                    return new ArraySliceBuiltinFn(lhs);
                }
                if (typeof rhs !== 'number' || !Number.isInteger(rhs)) {
                    return DYNAMIC_VALUE;
                }
                if (rhs < 0 || rhs >= lhs.length) {
                    throw new Error("Index out of bounds: " + rhs + " vs " + lhs.length);
                }
                return lhs[rhs];
            }
            else if (lhs instanceof Reference) {
                var ref = lhs.node;
                if (this.host.isClass(ref)) {
                    var absoluteModuleName = context.absoluteModuleName;
                    if (lhs instanceof NodeReference || lhs instanceof AbsoluteReference) {
                        absoluteModuleName = lhs.moduleName || absoluteModuleName;
                    }
                    var value = undefined;
                    var member = this.host.getMembersOfClass(ref).find(function (member) { return member.isStatic && member.name === strIndex; });
                    if (member !== undefined) {
                        if (member.value !== null) {
                            value = this.visitExpression(member.value, context);
                        }
                        else if (member.implementation !== null) {
                            value = new NodeReference(member.implementation, absoluteModuleName);
                        }
                        else if (member.node) {
                            value = new NodeReference(member.node, absoluteModuleName);
                        }
                    }
                    return value;
                }
            }
            throw new Error("Invalid dot property access: " + lhs + " dot " + rhs);
        };
        StaticInterpreter.prototype.visitCallExpression = function (node, context) {
            var _this = this;
            var lhs = this.visitExpression(node.expression, context);
            if (isDynamicValue(lhs)) {
                return DYNAMIC_VALUE;
            }
            // If the call refers to a builtin function, attempt to evaluate the function.
            if (lhs instanceof BuiltinFn) {
                return lhs.evaluate(node.arguments.map(function (arg) { return _this.visitExpression(arg, context); }));
            }
            if (!(lhs instanceof Reference)) {
                throw new Error("attempting to call something that is not a function: " + lhs);
            }
            else if (!isFunctionOrMethodReference(lhs)) {
                throw new Error("calling something that is not a function declaration? " + ts.SyntaxKind[lhs.node.kind] + " (" + node.getText() + ")");
            }
            var fn = this.host.getDefinitionOfFunction(lhs.node);
            // If the function is foreign (declared through a d.ts file), attempt to resolve it with the
            // foreignFunctionResolver, if one is specified.
            if (fn.body === null) {
                var expr = null;
                if (context.foreignFunctionResolver) {
                    expr = context.foreignFunctionResolver(lhs, node.arguments);
                }
                if (expr === null) {
                    throw new Error("could not resolve foreign function declaration: " + node.getSourceFile().fileName + " " + lhs.node.name.text);
                }
                // If the function is declared in a different file, resolve the foreign function expression
                // using the absolute module name of that file (if any).
                var absoluteModuleName = context.absoluteModuleName;
                if (lhs instanceof NodeReference || lhs instanceof AbsoluteReference) {
                    absoluteModuleName = lhs.moduleName || absoluteModuleName;
                }
                return this.visitExpression(expr, tslib_1.__assign({}, context, { absoluteModuleName: absoluteModuleName }));
            }
            var body = fn.body;
            if (body.length !== 1 || !ts.isReturnStatement(body[0])) {
                throw new Error('Function body must have a single return statement only.');
            }
            var ret = body[0];
            var newScope = new Map();
            fn.parameters.forEach(function (param, index) {
                var value = undefined;
                if (index < node.arguments.length) {
                    var arg = node.arguments[index];
                    value = _this.visitExpression(arg, context);
                }
                if (value === undefined && param.initializer !== null) {
                    value = _this.visitExpression(param.initializer, context);
                }
                newScope.set(param.node, value);
            });
            return ret.expression !== undefined ?
                this.visitExpression(ret.expression, tslib_1.__assign({}, context, { scope: newScope })) :
                undefined;
        };
        StaticInterpreter.prototype.visitConditionalExpression = function (node, context) {
            var condition = this.visitExpression(node.condition, context);
            if (isDynamicValue(condition)) {
                return condition;
            }
            if (condition) {
                return this.visitExpression(node.whenTrue, context);
            }
            else {
                return this.visitExpression(node.whenFalse, context);
            }
        };
        StaticInterpreter.prototype.visitPrefixUnaryExpression = function (node, context) {
            var operatorKind = node.operator;
            if (!UNARY_OPERATORS.has(operatorKind)) {
                throw new Error("Unsupported prefix unary operator: " + ts.SyntaxKind[operatorKind]);
            }
            var op = UNARY_OPERATORS.get(operatorKind);
            var value = this.visitExpression(node.operand, context);
            return isDynamicValue(value) ? DYNAMIC_VALUE : op(value);
        };
        StaticInterpreter.prototype.visitBinaryExpression = function (node, context) {
            var tokenKind = node.operatorToken.kind;
            if (!BINARY_OPERATORS.has(tokenKind)) {
                throw new Error("Unsupported binary operator: " + ts.SyntaxKind[tokenKind]);
            }
            var opRecord = BINARY_OPERATORS.get(tokenKind);
            var lhs, rhs;
            if (opRecord.literal) {
                lhs = literal(this.visitExpression(node.left, context));
                rhs = literal(this.visitExpression(node.right, context));
            }
            else {
                lhs = this.visitExpression(node.left, context);
                rhs = this.visitExpression(node.right, context);
            }
            return isDynamicValue(lhs) || isDynamicValue(rhs) ? DYNAMIC_VALUE : opRecord.op(lhs, rhs);
        };
        StaticInterpreter.prototype.visitParenthesizedExpression = function (node, context) {
            return this.visitExpression(node.expression, context);
        };
        StaticInterpreter.prototype.stringNameFromPropertyName = function (node, context) {
            if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) {
                return node.text;
            }
            else { // ts.ComputedPropertyName
                var literal_1 = this.visitExpression(node.expression, context);
                return typeof literal_1 === 'string' ? literal_1 : undefined;
            }
        };
        StaticInterpreter.prototype.getReference = function (node, context) {
            var id = identifierOfDeclaration(node);
            if (id === undefined) {
                throw new Error("Don't know how to refer to " + ts.SyntaxKind[node.kind]);
            }
            if (context.absoluteModuleName !== null) {
                // TODO(alxhub): investigate whether this can get symbol names wrong in the event of
                // re-exports under different names.
                return new AbsoluteReference(node, id, context.absoluteModuleName, id.text);
            }
            else {
                return new ResolvedReference(node, id);
            }
        };
        return StaticInterpreter;
    }());
    function isFunctionOrMethodReference(ref) {
        return ts.isFunctionDeclaration(ref.node) || ts.isMethodDeclaration(ref.node) ||
            ts.isFunctionExpression(ref.node);
    }
    function literal(value) {
        if (value === null || value === undefined || typeof value === 'string' ||
            typeof value === 'number' || typeof value === 'boolean') {
            return value;
        }
        if (isDynamicValue(value)) {
            return DYNAMIC_VALUE;
        }
        throw new Error("Value " + value + " is not literal and cannot be used in this context.");
    }
    function identifierOfDeclaration(decl) {
        if (ts.isClassDeclaration(decl)) {
            return decl.name;
        }
        else if (ts.isEnumDeclaration(decl)) {
            return decl.name;
        }
        else if (ts.isFunctionDeclaration(decl)) {
            return decl.name;
        }
        else if (ts.isVariableDeclaration(decl) && ts.isIdentifier(decl.name)) {
            return decl.name;
        }
        else if (ts.isShorthandPropertyAssignment(decl)) {
            return decl.name;
        }
        else {
            return undefined;
        }
    }
    function isVariableDeclarationDeclared(node) {
        if (node.parent === undefined || !ts.isVariableDeclarationList(node.parent)) {
            return false;
        }
        var declList = node.parent;
        if (declList.parent === undefined || !ts.isVariableStatement(declList.parent)) {
            return false;
        }
        var varStmt = declList.parent;
        return varStmt.modifiers !== undefined &&
            varStmt.modifiers.some(function (mod) { return mod.kind === ts.SyntaxKind.DeclareKeyword; });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL21ldGFkYXRhL3NyYy9yZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSDs7O09BR0c7SUFFSCw4Q0FBK0Y7SUFDL0YsMkJBQTZCO0lBQzdCLCtCQUFpQztJQUlqQyxJQUFNLG1CQUFtQixHQUFHLHFCQUFxQixDQUFDO0lBRWxEOzs7O09BSUc7SUFDSDtRQUFBO1lBQ0U7Ozs7ZUFJRztZQUNLLGVBQVUsR0FBRyxJQUFJLENBQUM7UUFDNUIsQ0FBQztRQUFELG1CQUFDO0lBQUQsQ0FBQyxBQVBELElBT0M7SUFQWSxvQ0FBWTtJQVN6Qjs7O09BR0c7SUFDSCxJQUFNLGFBQWEsR0FBaUIsSUFBSSxZQUFZLEVBQUUsQ0FBQztJQUV2RDs7T0FFRztJQUNILFNBQWdCLGNBQWMsQ0FBQyxLQUFVO1FBQ3ZDLE9BQU8sS0FBSyxLQUFLLGFBQWEsQ0FBQztJQUNqQyxDQUFDO0lBRkQsd0NBRUM7SUE0QkQ7Ozs7T0FJRztJQUNIO1FBQ0UsbUJBQXFCLE9BQXNDLEVBQVcsSUFBWTtZQUE3RCxZQUFPLEdBQVAsT0FBTyxDQUErQjtZQUFXLFNBQUksR0FBSixJQUFJLENBQVE7UUFBRyxDQUFDO1FBQ3hGLGdCQUFDO0lBQUQsQ0FBQyxBQUZELElBRUM7SUFGWSw4QkFBUztJQUl0Qjs7T0FFRztJQUNIO1FBQUE7UUFBOEYsQ0FBQztRQUFELGdCQUFDO0lBQUQsQ0FBQyxBQUEvRixJQUErRjtJQUF6RSw4QkFBUztJQUUvQjtRQUFrQywrQ0FBUztRQUN6Qyw2QkFBb0IsR0FBdUI7WUFBM0MsWUFBK0MsaUJBQU8sU0FBRztZQUFyQyxTQUFHLEdBQUgsR0FBRyxDQUFvQjs7UUFBYSxDQUFDO1FBRXpELHNDQUFRLEdBQVIsVUFBUyxJQUF3QjtZ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QyxFQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxlQUFlLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxHQUFHLENBQUMsRUFBTCxDQUFLLENBQUMsQ0FBQztRQUMzRCxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLGVBQWUsQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxDQUFDLEdBQUcsQ0FBQyxFQUFMLENBQUssQ0FBQyxDQUFDO1FBQzVELENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsZUFBZSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLENBQUMsR0FBRyxDQUFDLEVBQUwsQ0FBSyxDQUFDLENBQUM7UUFDL0QsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxlQUFlLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxHQUFHLENBQUMsRUFBTCxDQUFLLENBQUMsQ0FBQztRQUM1RCxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLGVBQWUsQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxDQUFDLEdBQUcsQ0FBQyxFQUFMLENBQUssQ0FBQyxDQUFDO1FBQzlELENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsZUFBZSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLENBQUMsR0FBRyxDQUFDLEVBQUwsQ0FBSyxDQUFDLENBQUM7UUFDaEUsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxlQUFlLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxHQUFHLENBQUMsRUFBTCxDQUFLLENBQUMsQ0FBQztRQUMxRCxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLGVBQWUsQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxDQUFDLEdBQUcsQ0FBQyxF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QUFTLENBQUM7U0FDbEI7SUFDSCxDQUFDO0lBRUQsU0FBUyw2QkFBNkIsQ0FBQyxJQUE0QjtRQUNqRSxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLENBQUMsRUFBRSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUMzRSxPQUFPLEtBQUssQ0FBQztTQUNkO1FBQ0QsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUM3QixJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUM3RSxPQUFPLEtBQUssQ0FBQztTQUNkO1FBQ0QsSUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztRQUNoQyxPQUFPLE9BQU8sQ0FBQyxTQUFTLEtBQUssU0FBUztZQUNsQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLEdBQUcsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQXpDLENBQXlDLENBQUMsQ0FBQztJQUMvRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIHJlc29sdmVyLnRzIGltcGxlbWVudHMgcGFydGlhbCBjb21wdXRhdGlvbiBvZiBleHByZXNzaW9ucywgcmVzb2x2aW5nIGV4cHJlc3Npb25zIHRvIHN0YXRpY1xuICogdmFsdWVzIHdoZXJlIHBvc3NpYmxlIGFuZCByZXR1cm5pbmcgYSBgRHluYW1pY1ZhbHVlYCBzaWduYWwgd2hlbiBub3QuXG4gKi9cblxuaW1wb3J0IHtFeHByZXNzaW9uLCBFeHRlcm5hbEV4cHIsIEV4dGVybmFsUmVmZXJlbmNlLCBXcmFwcGVkTm9kZUV4cHJ9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtDbGFzc01lbWJlcktpbmQsIFJlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi8uLi9ob3N0JztcblxuY29uc3QgVFNfRFRTX0pTX0VYVEVOU0lPTiA9IC8oPzpcXC5kKT9cXC50cyR8XFwuanMkLztcblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgdmFsdWUgd2hpY2ggY2Fubm90IGJlIGRldGVybWluZWQgc3RhdGljYWxseS5cbiAqXG4gKiBVc2UgYGlzRHluYW1pY1ZhbHVlYCB0byBkZXRlcm1pbmUgd2hldGhlciBhIGBSZXNvbHZlZFZhbHVlYCBpcyBhIGBEeW5hbWljVmFsdWVgLlxuICovXG5leHBvcnQgY2xhc3MgRHluYW1pY1ZhbHVlIHtcbiAgLyoqXG4gICAqIFRoaXMgaXMgbmVlZGVkIHNvIHRoZSBcImlzIER5bmFtaWNWYWx1ZVwiIGFzc2VydGlvbiBvZiBgaXNEeW5hbWljVmFsdWVgIGFjdHVhbGx5IGhhcyBtZWFuaW5nLlxuICAgKlxuICAgKiBPdGhlcndpc2UsIFwiaXMgRHluYW1pY1ZhbHVlXCIgaXMgYWtpbiB0byBcImlzIHt9XCIgd2hpY2ggZG9lc24ndCB0cmlnZ2VyIG5hcnJvd2luZy5cbiAgICovXG4gIHByaXZhdGUgX2lzRHluYW1pYyA9IHRydWU7XG59XG5cbi8qKlxuICogQW4gaW50ZXJuYWwgZmx5d2VpZ2h0IGZvciBgRHluYW1pY1ZhbHVlYC4gRXZlbnR1YWxseSB0aGUgZHluYW1pYyB2YWx1ZSB3aWxsIGNhcnJ5IGluZm9ybWF0aW9uXG4gKiBvbiB0aGUgbG9jYXRpb24gb2YgdGhlIG5vZGUgdGhhdCBjb3VsZCBub3QgYmUgc3RhdGljYWxseSBjb21wdXRlZC5cbiAqL1xuY29uc3QgRFlOQU1JQ19WQUxVRTogRHluYW1pY1ZhbHVlID0gbmV3IER5bmFtaWNWYWx1ZSgpO1xuXG4vKipcbiAqIFVzZWQgdG8gdGVzdCB3aGV0aGVyIGEgYFJlc29sdmVkVmFsdWVgIGlzIGEgYER5bmFtaWNWYWx1ZWAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0R5bmFtaWNWYWx1ZSh2YWx1ZTogYW55KTogdmFsdWUgaXMgRHluYW1pY1ZhbHVlIHtcbiAgcmV0dXJuIHZhbHVlID09PSBEWU5BTUlDX1ZBTFVFO1xufVxuXG4vKipcbiAqIEEgdmFsdWUgcmVzdWx0aW5nIGZyb20gc3RhdGljIHJlc29sdXRpb24uXG4gKlxuICogVGhpcyBjb3VsZCBiZSBhIHByaW1pdGl2ZSwgY29sbGVjdGlvbiB0eXBlLCByZWZlcmVuY2UgdG8gYSBgdHMuTm9kZWAgdGhhdCBkZWNsYXJlcyBhXG4gKiBub24tcHJpbWl0aXZlIHZhbHVlLCBvciBhIHNwZWNpYWwgYER5bmFtaWNWYWx1ZWAgdHlwZSB3aGljaCBpbmRpY2F0ZXMgdGhlIHZhbHVlIHdhcyBub3RcbiAqIGF2YWlsYWJsZSBzdGF0aWNhbGx5LlxuICovXG5leHBvcnQgdHlwZSBSZXNvbHZlZFZhbHVlID0gbnVtYmVyIHwgYm9vbGVhbiB8IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQgfCBSZWZlcmVuY2UgfCBFbnVtVmFsdWUgfFxuICAgIFJlc29sdmVkVmFsdWVBcnJheSB8IFJlc29sdmVkVmFsdWVNYXAgfCBCdWlsdGluRm4gfCBEeW5hbWljVmFsdWU7XG5cbi8qKlxuICogQW4gYXJyYXkgb2YgYFJlc29sdmVkVmFsdWVgcy5cbiAqXG4gKiBUaGlzIGlzIGEgcmVpZmllZCB0eXBlIHRvIGFsbG93IHRoZSBjaXJjdWxhciByZWZlcmVuY2Ugb2YgYFJlc29sdmVkVmFsdWVgIC0+IGBSZXNvbHZlZFZhbHVlQXJyYXlgXG4gKiAtPlxuICogYFJlc29sdmVkVmFsdWVgLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlc29sdmVkVmFsdWVBcnJheSBleHRlbmRzIEFycmF5PFJlc29sdmVkVmFsdWU+IHt9XG5cbi8qKlxuICogQSBtYXAgb2Ygc3RyaW5ncyB0byBgUmVzb2x2ZWRWYWx1ZWBzLlxuICpcbiAqIFRoaXMgaXMgYSByZWlmaWVkIHR5cGUgdG8gYWxsb3cgdGhlIGNpcmN1bGFyIHJlZmVyZW5jZSBvZiBgUmVzb2x2ZWRWYWx1ZWAgLT4gYFJlc29sdmVkVmFsdWVNYXBgIC0+XG4gKiBgUmVzb2x2ZWRWYWx1ZWAuXG4gKi8gZXhwb3J0IGludGVyZmFjZSBSZXNvbHZlZFZhbHVlTWFwIGV4dGVuZHMgTWFwPHN0cmluZywgUmVzb2x2ZWRWYWx1ZT4ge31cblxuLyoqXG4gKiBBIHZhbHVlIG1lbWJlciBvZiBhbiBlbnVtZXJhdGlvbi5cbiAqXG4gKiBDb250YWlucyBhIGBSZWZlcmVuY2VgIHRvIHRoZSBlbnVtZXJhdGlvbiBpdHNlbGYsIGFuZCB0aGUgbmFtZSBvZiB0aGUgcmVmZXJlbmNlZCBtZW1iZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBFbnVtVmFsdWUge1xuICBjb25zdHJ1Y3RvcihyZWFkb25seSBlbnVtUmVmOiBSZWZlcmVuY2U8dHMuRW51bURlY2xhcmF0aW9uPiwgcmVhZG9ubHkgbmFtZTogc3RyaW5nKSB7fVxufVxuXG4vKipcbiAqIEFuIGltcGxlbWVudGF0aW9uIG9mIGEgYnVpbHRpbiBmdW5jdGlvbiwgc3VjaCBhcyBgQXJyYXkucHJvdG90eXBlLnNsaWNlYC5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJ1aWx0aW5GbiB7IGFic3RyYWN0IGV2YWx1YXRlKGFyZ3M6IFJlc29sdmVkVmFsdWVBcnJheSk6IFJlc29sdmVkVmFsdWU7IH1cblxuY2xhc3MgQXJyYXlTbGljZUJ1aWx0aW5GbiBleHRlbmRzIEJ1aWx0aW5GbiB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbGhzOiBSZXNvbHZlZFZhbHVlQXJyYXkpIHsgc3VwZXIoKTsgfVxuXG4gIGV2YWx1YXRlKGFyZ3M6IFJlc29sdmVkVmFsdWVBcnJheSk6IFJlc29sdmVkVmFsdWUge1xuICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRoaXMubGhzO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gRFlOQU1JQ19WQUxVRTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBUcmFja3MgdGhlIHNjb3BlIG9mIGEgZnVuY3Rpb24gYm9keSwgd2hpY2ggaW5jbHVkZXMgYFJlc29sdmVkVmFsdWVgcyBmb3IgdGhlIHBhcmFtZXRlcnMgb2YgdGhhdFxuICogYm9keS5cbiAqL1xudHlwZSBTY29wZSA9IE1hcDx0cy5QYXJhbWV0ZXJEZWNsYXJhdGlvbiwgUmVzb2x2ZWRWYWx1ZT47XG5cbmV4cG9ydCBlbnVtIEltcG9ydE1vZGUge1xuICBVc2VFeGlzdGluZ0ltcG9ydCxcbiAgRm9yY2VOZXdJbXBvcnQsXG59XG5cbi8qKlxuICogQSByZWZlcmVuY2UgdG8gYSBgdHMuTm9kZWAuXG4gKlxuICogRm9yIGV4YW1wbGUsIGlmIGFuIGV4cHJlc3Npb24gZXZhbHVhdGVzIHRvIGEgZnVuY3Rpb24gb3IgY2xhc3MgZGVmaW5pdGlvbiwgaXQgd2lsbCBiZSByZXR1cm5lZFxuICogYXMgYSBgUmVmZXJlbmNlYCAoYXNzdW1pbmcgcmVmZXJlbmNlcyBhcmUgYWxsb3dlZCBpbiBldmFsdWF0aW9uKS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlZmVyZW5jZTxUIGV4dGVuZHMgdHMuTm9kZSA9IHRzLk5vZGU+IHtcbiAgY29uc3RydWN0b3IocmVhZG9ubHkgbm9kZTogVCkge31cblxuICAvKipcbiAgICogV2hldGhlciBhbiBgRXhwcmVzc2lvbmAgY2FuIGJlIGdlbmVyYXRlZCB3aGljaCByZWZlcmVuY2VzIHRoZSBub2RlLlxuICAgKi9cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHJlYWRvbmx5IGV4cHJlc3NhYmxlICE6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGFuIGBFeHByZXNzaW9uYCByZXByZXNlbnRpbmcgdGhpcyB0eXBlLCBpbiB0aGUgY29udGV4dCBvZiB0aGUgZ2l2ZW4gU291cmNlRmlsZS5cbiAgICpcbiAgICogVGhpcyBjb3VsZCBiZSBhIGxvY2FsIHZhcmlhYmxlIHJlZmVyZW5jZSwgaWYgdGhlIHN5bWJvbCBpcyBpbXBvcnRlZCwgb3IgaXQgY291bGQgYmUgYSBuZXdcbiAgICogaW1wb3J0IGlmIG5lZWRlZC5cbiAgICovXG4gIGFic3RyYWN0IHRvRXhwcmVzc2lvbihjb250ZXh0OiB0cy5Tb3VyY2VGaWxlLCBpbXBvcnRNb2RlPzogSW1wb3J0TW9kZSk6IEV4cHJlc3Npb258bnVsbDtcblxuICBhYnN0cmFjdCBhZGRJZGVudGlmaWVyKGlkZW50aWZpZXI6IHRzLklkZW50aWZpZXIpOiB2b2lkO1xufVxuXG4vKipcbiAqIEEgcmVmZXJlbmNlIHRvIGEgbm9kZSBvbmx5LCB3aXRob3V0IGFueSBhYmlsaXR5IHRvIGdldCBhbiBgRXhwcmVzc2lvbmAgcmVwcmVzZW50aW5nIHRoYXQgbm9kZS5cbiAqXG4gKiBUaGlzIGlzIHVzZWQgZm9yIHJldHVybmluZyByZWZlcmVuY2VzIHRvIHRoaW5ncyBsaWtlIG1ldGhvZCBkZWNsYXJhdGlvbnMsIHdoaWNoIGFyZSBub3QgZGlyZWN0bHlcbiAqIHJlZmVyZW5jZWFibGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBOb2RlUmVmZXJlbmNlPFQgZXh0ZW5kcyB0cy5Ob2RlID0gdHMuTm9kZT4gZXh0ZW5kcyBSZWZlcmVuY2U8VD4ge1xuICBjb25zdHJ1Y3Rvcihub2RlOiBULCByZWFkb25seSBtb2R1bGVOYW1lOiBzdHJpbmd8bnVsbCkgeyBzdXBlcihub2RlKTsgfVxuXG4gIHRvRXhwcmVzc2lvbihjb250ZXh0OiB0cy5Tb3VyY2VGaWxlKTogbnVsbCB7IHJldHVybiBudWxsOyB9XG5cbiAgYWRkSWRlbnRpZmllcihpZGVudGlmaWVyOiB0cy5JZGVudGlmaWVyKTogdm9pZCB7fVxufVxuXG4vKipcbiAqIEEgcmVmZXJlbmNlIHRvIGEgbm9kZSB3aGljaCBoYXMgYSBgdHMuSWRlbnRpZmllcmAgYW5kIGNhbiBiZSByZXNvbHZlZCB0byBhbiBgRXhwcmVzc2lvbmAuXG4gKlxuICogSW1wb3J0cyBnZW5lcmF0ZWQgYnkgYFJlc29sdmVkUmVmZXJlbmNlYHMgYXJlIGFsd2F5cyByZWxhdGl2ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFJlc29sdmVkUmVmZXJlbmNlPFQgZXh0ZW5kcyB0cy5Ob2RlID0gdHMuTm9kZT4gZXh0ZW5kcyBSZWZlcmVuY2U8VD4ge1xuICBwcm90ZWN0ZWQgaWRlbnRpZmllcnM6IHRzLklkZW50aWZpZXJbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKG5vZGU6IFQsIHByb3RlY3RlZCBwcmltYXJ5SWRlbnRpZmllcjogdHMuSWRlbnRpZmllcikgeyBzdXBlcihub2RlKTsgfVxuXG4gIHJlYWRvbmx5IGV4cHJlc3NhYmxlID0gdHJ1ZTtcblxuICB0b0V4cHJlc3Npb24oY29udGV4dDogdHMuU291cmNlRmlsZSwgaW1wb3J0TW9kZTogSW1wb3J0TW9kZSA9IEltcG9ydE1vZGUuVXNlRXhpc3RpbmdJbXBvcnQpOlxuICAgICAgRXhwcmVzc2lvbiB7XG4gICAgY29uc3QgbG9jYWxJZGVudGlmaWVyID1cbiAgICAgICAgcGlja0lkZW50aWZpZXIoY29udGV4dCwgdGhpcy5wcmltYXJ5SWRlbnRpZmllciwgdGhpcy5pZGVudGlmaWVycywgaW1wb3J0TW9kZSk7XG4gICAgaWYgKGxvY2FsSWRlbnRpZmllciAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG5ldyBXcmFwcGVkTm9kZUV4cHIobG9jYWxJZGVudGlmaWVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUmVsYXRpdmUgaW1wb3J0IGZyb20gY29udGV4dCAtPiB0aGlzLm5vZGUuZ2V0U291cmNlRmlsZSgpLlxuICAgICAgLy8gVE9ETyhhbHhodWIpOiBpbnZlc3RpZ2F0ZSB0aGUgaW1wYWN0IG9mIG11bHRpcGxlIHNvdXJjZSByb290cyBoZXJlLlxuICAgICAgLy8gVE9ETyhhbHhodWIpOiBpbnZlc3RpZ2F0ZSB0aGUgbmVlZCB0byBtYXAgc3VjaCBwYXRocyB2aWEgdGhlIEhvc3QgZm9yIHByb3BlciBnMyBzdXBwb3J0LlxuICAgICAgbGV0IHJlbGF0aXZlID1cbiAgICAgICAgICBwYXRoLnBvc2l4LnJlbGF0aXZlKHBhdGguZGlybmFtZShjb250ZXh0LmZpbGVOYW1lKSwgdGhpcy5ub2RlLmdldFNvdXJjZUZpbGUoKS5maWxlTmFtZSlcbiAgICAgICAgICAgICAgLnJlcGxhY2UoVFNfRFRTX0pTX0VYVEVOU0lPTiwgJycpO1xuXG4gICAgICAvLyBwYXRoLnJlbGF0aXZlKCkgZG9lcyBub3QgaW5jbHVkZSB0aGUgbGVhZGluZyAnLi8nLlxuICAgICAgaWYgKCFyZWxhdGl2ZS5zdGFydHNXaXRoKCcuJykpIHtcbiAgICAgICAgcmVsYXRpdmUgPSBgLi8ke3JlbGF0aXZlfWA7XG4gICAgICB9XG5cbiAgICAgIC8vIHBhdGgucmVsYXRpdmUoKSByZXR1cm5zIHRoZSBlbXB0eSBzdHJpbmcgKGNvbnZlcnRlZCB0byAnLi8nIGFib3ZlKSBpZiB0aGUgdHdvIHBhdGhzIGFyZSB0aGVcbiAgICAgIC8vIHNhbWUuXG4gICAgICBpZiAocmVsYXRpdmUgPT09ICcuLycpIHtcbiAgICAgICAgLy8gU2FtZSBmaWxlIGFmdGVyIGFsbC5cbiAgICAgICAgcmV0dXJuIG5ldyBXcmFwcGVkTm9kZUV4cHIodGhpcy5wcmltYXJ5SWRlbnRpZmllcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IEV4dGVybmFsRXhwcihuZXcgRXh0ZXJuYWxSZWZlcmVuY2UocmVsYXRpdmUsIHRoaXMucHJpbWFyeUlkZW50aWZpZXIudGV4dCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFkZElkZW50aWZpZXIoaWRlbnRpZmllcjogdHMuSWRlbnRpZmllcik6IHZvaWQgeyB0aGlzLmlkZW50aWZpZXJzLnB1c2goaWRlbnRpZmllcik7IH1cbn1cblxuLyoqXG4gKiBBIHJlZmVyZW5jZSB0byBhIG5vZGUgd2hpY2ggaGFzIGEgYHRzLklkZW50aWZlcmAgYW5kIGFuIGV4cGVjdGVkIGFic29sdXRlIG1vZHVsZSBuYW1lLlxuICpcbiAqIEFuIGBBYnNvbHV0ZVJlZmVyZW5jZWAgY2FuIGJlIHJlc29sdmVkIHRvIGFuIGBFeHByZXNzaW9uYCwgYW5kIGlmIHRoYXQgZXhwcmVzc2lvbiBpcyBhbiBpbXBvcnRcbiAqIHRoZSBtb2R1bGUgc3BlY2lmaWVyIHdpbGwgYmUgYW4gYWJzb2x1dGUgbW9kdWxlIG5hbWUsIG5vdCBhIHJlbGF0aXZlIHBhdGguXG4gKi9cbmV4cG9ydCBjbGFzcyBBYnNvbHV0ZVJlZmVyZW5jZTxUIGV4dGVuZHMgdHMuTm9kZT4gZXh0ZW5kcyBSZWZlcmVuY2U8VD4ge1xuICBwcml2YXRlIGlkZW50aWZpZXJzOiB0cy5JZGVudGlmaWVyW10gPSBbXTtcbiAgY29uc3RydWN0b3IoXG4gICAgICBub2RlOiBULCBwcml2YXRlIHByaW1hcnlJZGVudGlmaWVyOiB0cy5JZGVudGlmaWVyLCByZWFkb25seSBtb2R1bGVOYW1lOiBzdHJpbmcsXG4gICAgICByZWFkb25seSBzeW1ib2xOYW1lOiBzdHJpbmcpIHtcbiAgICBzdXBlcihub2RlKTtcbiAgfVxuXG4gIHJlYWRvbmx5IGV4cHJlc3NhYmxlID0gdHJ1ZTtcblxuICB0b0V4cHJlc3Npb24oY29udGV4dDogdHMuU291cmNlRmlsZSwgaW1wb3J0TW9kZTogSW1wb3J0TW9kZSA9IEltcG9ydE1vZGUuVXNlRXhpc3RpbmdJbXBvcnQpOlxuICAgICAgRXhwcmVzc2lvbiB7XG4gICAgY29uc3QgbG9jYWxJZGVudGlmaWVyID1cbiAgICAgICAgcGlja0lkZW50aWZpZXIoY29udGV4dCwgdGhpcy5wcmltYXJ5SWRlbnRpZmllciwgdGhpcy5pZGVudGlmaWVycywgaW1wb3J0TW9kZSk7XG4gICAgaWYgKGxvY2FsSWRlbnRpZmllciAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG5ldyBXcmFwcGVkTm9kZUV4cHIobG9jYWxJZGVudGlmaWVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBFeHRlcm5hbEV4cHIobmV3IEV4dGVybmFsUmVmZXJlbmNlKHRoaXMubW9kdWxlTmFtZSwgdGhpcy5zeW1ib2xOYW1lKSk7XG4gICAgfVxuICB9XG5cbiAgYWRkSWRlbnRpZmllcihpZGVudGlmaWVyOiB0cy5JZGVudGlmaWVyKTogdm9pZCB7IHRoaXMuaWRlbnRpZmllcnMucHVzaChpZGVudGlmaWVyKTsgfVxufVxuXG5mdW5jdGlvbiBwaWNrSWRlbnRpZmllcihcbiAgICBjb250ZXh0OiB0cy5Tb3VyY2VGaWxlLCBwcmltYXJ5OiB0cy5JZGVudGlmaWVyLCBzZWNvbmRhcmllczogdHMuSWRlbnRpZmllcltdLFxuICAgIG1vZGU6IEltcG9ydE1vZGUpOiB0cy5JZGVudGlmaWVyfG51bGwge1xuICBjb250ZXh0ID0gdHMuZ2V0T3JpZ2luYWxOb2RlKGNvbnRleHQpIGFzIHRzLlNvdXJjZUZpbGU7XG5cbiAgaWYgKHRzLmdldE9yaWdpbmFsTm9kZShwcmltYXJ5KS5nZXRTb3VyY2VGaWxlKCkgPT09IGNvbnRleHQpIHtcbiAgICByZXR1cm4gcHJpbWFyeTtcbiAgfSBlbHNlIGlmIChtb2RlID09PSBJbXBvcnRNb2RlLlVzZUV4aXN0aW5nSW1wb3J0KSB7XG4gICAgcmV0dXJuIHNlY29uZGFyaWVzLmZpbmQoaWQgPT4gdHMuZ2V0T3JpZ2luYWxOb2RlKGlkKS5nZXRTb3VyY2VGaWxlKCkgPT09IGNvbnRleHQpIHx8IG51bGw7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBTdGF0aWNhbGx5IHJlc29sdmUgdGhlIGdpdmVuIGB0cy5FeHByZXNzaW9uYCBpbnRvIGEgYFJlc29sdmVkVmFsdWVgLlxuICpcbiAqIEBwYXJhbSBub2RlIHRoZSBleHByZXNzaW9uIHRvIHN0YXRpY2FsbHkgcmVzb2x2ZSBpZiBwb3NzaWJsZVxuICogQHBhcmFtIGNoZWNrZXIgYSBgdHMuVHlwZUNoZWNrZXJgIHVzZWQgdG8gdW5kZXJzdGFuZCB0aGUgZXhwcmVzc2lvblxuICogQHBhcmFtIGZvcmVpZ25GdW5jdGlvblJlc29sdmVyIGEgZnVuY3Rpb24gd2hpY2ggd2lsbCBiZSB1c2VkIHdoZW5ldmVyIGEgXCJmb3JlaWduIGZ1bmN0aW9uXCIgaXNcbiAqIGVuY291bnRlcmVkLiBBIGZvcmVpZ24gZnVuY3Rpb24gaXMgYSBmdW5jdGlvbiB3aGljaCBoYXMgbm8gYm9keSAtIHVzdWFsbHkgdGhlIHJlc3VsdCBvZiBjYWxsaW5nXG4gKiBhIGZ1bmN0aW9uIGRlY2xhcmVkIGluIGFub3RoZXIgbGlicmFyeSdzIC5kLnRzIGZpbGUuIEluIHRoZXNlIGNhc2VzLCB0aGUgZm9yZWlnbkZ1bmN0aW9uUmVzb2x2ZXJcbiAqIHdpbGwgYmUgY2FsbGVkIHdpdGggdGhlIGZ1bmN0aW9uJ3MgZGVjbGFyYXRpb24sIGFuZCBjYW4gb3B0aW9uYWxseSByZXR1cm4gYSBgdHMuRXhwcmVzc2lvbmBcbiAqIChwb3NzaWJseSBleHRyYWN0ZWQgZnJvbSB0aGUgZm9yZWlnbiBmdW5jdGlvbidzIHR5cGUgc2lnbmF0dXJlKSB3aGljaCB3aWxsIGJlIHVzZWQgYXMgdGhlIHJlc3VsdFxuICogb2YgdGhlIGNhbGwuXG4gKiBAcmV0dXJucyBhIGBSZXNvbHZlZFZhbHVlYCByZXByZXNlbnRpbmcgdGhlIHJlc29sdmVkIHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGF0aWNhbGx5UmVzb2x2ZShcbiAgICBub2RlOiB0cy5FeHByZXNzaW9uLCBob3N0OiBSZWZsZWN0aW9uSG9zdCwgY2hlY2tlcjogdHMuVHlwZUNoZWNrZXIsXG4gICAgZm9yZWlnbkZ1bmN0aW9uUmVzb2x2ZXI/OlxuICAgICAgICAobm9kZTogUmVmZXJlbmNlPHRzLkZ1bmN0aW9uRGVjbGFyYXRpb258dHMuTWV0aG9kRGVjbGFyYXRpb24+LCBhcmdzOiB0cy5FeHByZXNzaW9uW10pID0+XG4gICAgICAgICAgICB0cy5FeHByZXNzaW9uIHwgbnVsbCk6IFJlc29sdmVkVmFsdWUge1xuICByZXR1cm4gbmV3IFN0YXRpY0ludGVycHJldGVyKGhvc3QsIGNoZWNrZXIpLnZpc2l0KG5vZGUsIHtcbiAgICBhYnNvbHV0ZU1vZHVsZU5hbWU6IG51bGwsXG4gICAgc2NvcGU6IG5ldyBNYXA8dHMuUGFyYW1ldGVyRGVjbGFyYXRpb24sIFJlc29sdmVkVmFsdWU+KCksIGZvcmVpZ25GdW5jdGlvblJlc29sdmVyLFxuICB9KTtcbn1cblxuaW50ZXJmYWNlIEJpbmFyeU9wZXJhdG9yRGVmIHtcbiAgbGl0ZXJhbDogYm9vbGVhbjtcbiAgb3A6IChhOiBhbnksIGI6IGFueSkgPT4gUmVzb2x2ZWRWYWx1ZTtcbn1cblxuZnVuY3Rpb24gbGl0ZXJhbEJpbmFyeU9wKG9wOiAoYTogYW55LCBiOiBhbnkpID0+IGFueSk6IEJpbmFyeU9wZXJhdG9yRGVmIHtcbiAgcmV0dXJuIHtvcCwgbGl0ZXJhbDogdHJ1ZX07XG59XG5cbmZ1bmN0aW9uIHJlZmVyZW5jZUJpbmFyeU9wKG9wOiAoYTogYW55LCBiOiBhbnkpID0+IGFueSk6IEJpbmFyeU9wZXJhdG9yRGVmIHtcbiAgcmV0dXJuIHtvcCwgbGl0ZXJhbDogZmFsc2V9O1xufVxuXG5jb25zdCBCSU5BUllfT1BFUkFUT1JTID0gbmV3IE1hcDx0cy5TeW50YXhLaW5kLCBCaW5hcnlPcGVyYXRvckRlZj4oW1xuICBbdHMuU3ludGF4S2luZC5QbHVzVG9rZW4sIGxpdGVyYWxCaW5hcnlPcCgoYSwgYikgPT4gYSArIGIpXSxcbiAgW3RzLlN5bnRheEtpbmQuTWludXNUb2tlbiwgbGl0ZXJhbEJpbmFyeU9wKChhLCBiKSA9PiBhIC0gYildLFxuICBbdHMuU3ludGF4S2luZC5Bc3Rlcmlza1Rva2VuLCBsaXRlcmFsQmluYXJ5T3AoKGEsIGIpID0+IGEgKiBiKV0sXG4gIFt0cy5TeW50YXhLaW5kLlNsYXNoVG9rZW4sIGxpdGVyYWxCaW5hcnlPcCgoYSwgYikgPT4gYSAvIGIpXSxcbiAgW3RzLlN5bnRheEtpbmQuUGVyY2VudFRva2VuLCBsaXRlcmFsQmluYXJ5T3AoKGEsIGIpID0+IGEgJSBiKV0sXG4gIFt0cy5TeW50YXhLaW5kLkFtcGVyc2FuZFRva2VuLCBsaXRlcmFsQmluYXJ5T3AoKGEsIGIpID0+IGEgJiBiKV0sXG4gIFt0cy5TeW50YXhLaW5kLkJhclRva2VuLCBsaXRlcmFsQmluYXJ5T3AoKGEsIGIpID0+IGEgfCBiKV0sXG4gIFt0cy5TeW50YXhLaW5kLkNhcmV0VG9rZW4sIGxpdGVyYWxCaW5hcnlPcCgoYSwgYikgPT4gYSBeIGIpXSxcbiAgW3RzLlN5bnRheEtpbmQuTGVzc1RoYW5Ub2tlbiwgbGl0ZXJhbEJpbmFyeU9wKChhLCBiKSA9PiBhIDwgYildLFxuICBbdHMuU3ludGF4S2luZC5MZXNzVGhhbkVxdWFsc1Rva2VuLCBsaXRlcmFsQmluYXJ5T3AoKGEsIGIpID0+IGEgPD0gYildLFxuICBbdHMuU3ludGF4S2luZC5HcmVhdGVyVGhhblRva2VuLCBsaXRlcmFsQmluYXJ5T3AoKGEsIGIpID0+IGEgPiBiKV0sXG4gIFt0cy5TeW50YXhLaW5kLkdyZWF0ZXJUaGFuRXF1YWxzVG9rZW4sIGxpdGVyYWxCaW5hcnlPcCgoYSwgYikgPT4gYSA+PSBiKV0sXG4gIFt0cy5TeW50YXhLaW5kLkxlc3NUaGFuTGVzc1RoYW5Ub2tlbiwgbGl0ZXJhbEJpbmFyeU9wKChhLCBiKSA9PiBhIDw8IGIpXSxcbiAgW3RzLlN5bnRheEtpbmQuR3JlYXRlclRoYW5HcmVhdGVyVGhhblRva2VuLCBsaXRlcmFsQmluYXJ5T3AoKGEsIGIpID0+IGEgPj4gYildLFxuICBbdHMuU3ludGF4S2luZC5HcmVhdGVyVGhhbkdyZWF0ZXJUaGFuR3JlYXRlclRoYW5Ub2tlbiwgbGl0ZXJhbEJpbmFyeU9wKChhLCBiKSA9PiBhID4+PiBiKV0sXG4gIFt0cy5TeW50YXhLaW5kLkFzdGVyaXNrQXN0ZXJpc2tUb2tlbiwgbGl0ZXJhbEJpbmFyeU9wKChhLCBiKSA9PiBNYXRoLnBvdyhhLCBiKSldLFxuICBbdHMuU3ludGF4S2luZC5BbXBlcnNhbmRBbXBlcnNhbmRUb2tlbiwgcmVmZXJlbmNlQmluYXJ5T3AoKGEsIGIpID0+IGEgJiYgYildLFxuICBbdHMuU3ludGF4S2luZC5CYXJCYXJUb2tlbiwgcmVmZXJlbmNlQmluYXJ5T3AoKGEsIGIpID0+IGEgfHwgYildXG5dKTtcblxuY29uc3QgVU5BUllfT1BFUkFUT1JTID0gbmV3IE1hcDx0cy5TeW50YXhLaW5kLCAoYTogYW55KSA9PiBhbnk+KFtcbiAgW3RzLlN5bnRheEtpbmQuVGlsZGVUb2tlbiwgYSA9PiB+YV0sIFt0cy5TeW50YXhLaW5kLk1pbnVzVG9rZW4sIGEgPT4gLWFdLFxuICBbdHMuU3ludGF4S2luZC5QbHVzVG9rZW4sIGEgPT4gK2FdLCBbdHMuU3ludGF4S2luZC5FeGNsYW1hdGlvblRva2VuLCBhID0+ICFhXVxuXSk7XG5cbmludGVyZmFjZSBDb250ZXh0IHtcbiAgYWJzb2x1dGVNb2R1bGVOYW1lOiBzdHJpbmd8bnVsbDtcbiAgc2NvcGU6IFNjb3BlO1xuICBmb3JlaWduRnVuY3Rpb25SZXNvbHZlcj9cbiAgICAgIChyZWY6IFJlZmVyZW5jZTx0cy5GdW5jdGlvbkRlY2xhcmF0aW9ufHRzLk1ldGhvZERlY2xhcmF0aW9ufHRzLkZ1bmN0aW9uRXhwcmVzc2lvbj4sXG4gICAgICAgYXJnczogUmVhZG9ubHlBcnJheTx0cy5FeHByZXNzaW9uPik6IHRzLkV4cHJlc3Npb258bnVsbDtcbn1cblxuY2xhc3MgU3RhdGljSW50ZXJwcmV0ZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGhvc3Q6IFJlZmxlY3Rpb25Ib3N0LCBwcml2YXRlIGNoZWNrZXI6IHRzLlR5cGVDaGVja2VyKSB7fVxuXG4gIHZpc2l0KG5vZGU6IHRzLkV4cHJlc3Npb24sIGNvbnRleHQ6IENvbnRleHQpOiBSZXNvbHZlZFZhbHVlIHtcbiAgICByZXR1cm4gdGhpcy52aXNpdEV4cHJlc3Npb24obm9kZSwgY29udGV4dCk7XG4gIH1cblxuICBwcml2YXRlIHZpc2l0RXhwcmVzc2lvbihub2RlOiB0cy5FeHByZXNzaW9uLCBjb250ZXh0OiBDb250ZXh0KTogUmVzb2x2ZWRWYWx1ZSB7XG4gICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5UcnVlS2V5d29yZCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRmFsc2VLZXl3b3JkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmICh0cy5pc1N0cmluZ0xpdGVyYWwobm9kZSkpIHtcbiAgICAgIHJldHVybiBub2RlLnRleHQ7XG4gICAgfSBlbHNlIGlmICh0cy5pc05vU3Vic3RpdHV0aW9uVGVtcGxhdGVMaXRlcmFsKG5vZGUpKSB7XG4gICAgICByZXR1cm4gbm9kZS50ZXh0O1xuICAgIH0gZWxzZSBpZiAodHMuaXNUZW1wbGF0ZUV4cHJlc3Npb24obm9kZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0VGVtcGxhdGVFeHByZXNzaW9uKG5vZGUsIGNvbnRleHQpO1xuICAgIH0gZWxzZSBpZiAodHMuaXNOdW1lcmljTGl0ZXJhbChub2RlKSkge1xuICAgICAgcmV0dXJuIHBhcnNlRmxvYXQobm9kZS50ZXh0KTtcbiAgICB9IGVsc2UgaWYgKHRzLmlzT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24obm9kZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0T2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24obm9kZSwgY29udGV4dCk7XG4gICAgfSBlbHNlIGlmICh0cy5pc0lkZW50aWZpZXIobm9kZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0SWRlbnRpZmllcihub2RlLCBjb250ZXh0KTtcbiAgICB9IGVsc2UgaWYgKHRzLmlzUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKG5vZGUpKSB7XG4gICAgICByZXR1cm4gdGhpcy52aXNpdFByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbihub2RlLCBjb250ZXh0KTtcbiAgICB9IGVsc2UgaWYgKHRzLmlzQ2FsbEV4cHJlc3Npb24obm9kZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0Q2FsbEV4cHJlc3Npb24obm9kZSwgY29udGV4dCk7XG4gICAgfSBlbHNlIGlmICh0cy5pc0NvbmRpdGlvbmFsRXhwcmVzc2lvbihub2RlKSkge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaXRDb25kaXRpb25hbEV4cHJlc3Npb24obm9kZSwgY29udGV4dCk7XG4gICAgfSBlbHNlIGlmICh0cy5pc1ByZWZpeFVuYXJ5RXhwcmVzc2lvbihub2RlKSkge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaXRQcmVmaXhVbmFyeUV4cHJlc3Npb24obm9kZSwgY29udGV4dCk7XG4gICAgfSBlbHNlIGlmICh0cy5pc0JpbmFyeUV4cHJlc3Npb24obm9kZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0QmluYXJ5RXhwcmVzc2lvbihub2RlLCBjb250ZXh0KTtcbiAgICB9IGVsc2UgaWYgKHRzLmlzQXJyYXlMaXRlcmFsRXhwcmVzc2lvbihub2RlKSkge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaXRBcnJheUxpdGVyYWxFeHByZXNzaW9uKG5vZGUsIGNvbnRleHQpO1xuICAgIH0gZWxzZSBpZiAodHMuaXNQYXJlbnRoZXNpemVkRXhwcmVzc2lvbihub2RlKSkge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaXRQYXJlbnRoZXNpemVkRXhwcmVzc2lvbihub2RlLCBjb250ZXh0KTtcbiAgICB9IGVsc2UgaWYgKHRzLmlzRWxlbWVudEFjY2Vzc0V4cHJlc3Npb24obm9kZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0RWxlbWVudEFjY2Vzc0V4cHJlc3Npb24obm9kZSwgY29udGV4dCk7XG4gICAgfSBlbHNlIGlmICh0cy5pc0FzRXhwcmVzc2lvbihub2RlKSkge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaXRFeHByZXNzaW9uKG5vZGUuZXhwcmVzc2lvbiwgY29udGV4dCk7XG4gICAgfSBlbHNlIGlmICh0cy5pc05vbk51bGxFeHByZXNzaW9uKG5vZGUpKSB7XG4gICAgICByZXR1cm4gdGhpcy52aXNpdEV4cHJlc3Npb24obm9kZS5leHByZXNzaW9uLCBjb250ZXh0KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaG9zdC5pc0NsYXNzKG5vZGUpKSB7XG4gICAgICByZXR1cm4gdGhpcy52aXNpdERlY2xhcmF0aW9uKG5vZGUsIGNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gRFlOQU1JQ19WQUxVRTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHZpc2l0QXJyYXlMaXRlcmFsRXhwcmVzc2lvbihub2RlOiB0cy5BcnJheUxpdGVyYWxFeHByZXNzaW9uLCBjb250ZXh0OiBDb250ZXh0KTpcbiAgICAgIFJlc29sdmVkVmFsdWUge1xuICAgIGNvbnN0IGFycmF5OiBSZXNvbHZlZFZhbHVlQXJyYXkgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBub2RlLmVsZW1lbnRzW2ldO1xuICAgICAgaWYgKHRzLmlzU3ByZWFkRWxlbWVudChlbGVtZW50KSkge1xuICAgICAgICBjb25zdCBzcHJlYWQgPSB0aGlzLnZpc2l0RXhwcmVzc2lvbihlbGVtZW50LmV4cHJlc3Npb24sIGNvbnRleHQpO1xuICAgICAgICBpZiAoaXNEeW5hbWljVmFsdWUoc3ByZWFkKSkge1xuICAgICAgICAgIHJldHVybiBEWU5BTUlDX1ZBTFVFO1xuICAgICAgICB9XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShzcHJlYWQpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmV4cGVjdGVkIHZhbHVlIGluIHNwcmVhZCBleHByZXNzaW9uOiAke3NwcmVhZH1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFycmF5LnB1c2goLi4uc3ByZWFkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMudmlzaXRFeHByZXNzaW9uKGVsZW1lbnQsIGNvbnRleHQpO1xuICAgICAgICBpZiAoaXNEeW5hbWljVmFsdWUocmVzdWx0KSkge1xuICAgICAgICAgIHJldHVybiBEWU5BTUlDX1ZBTFVFO1xuICAgICAgICB9XG5cbiAgICAgICAgYXJyYXkucHVzaChyZXN1bHQpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXk7XG4gIH1cblxuICBwcml2YXRlIHZpc2l0T2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24obm9kZTogdHMuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24sIGNvbnRleHQ6IENvbnRleHQpOlxuICAgICAgUmVzb2x2ZWRWYWx1ZSB7XG4gICAgY29uc3QgbWFwOiBSZXNvbHZlZFZhbHVlTWFwID0gbmV3IE1hcDxzdHJpbmcsIFJlc29sdmVkVmFsdWU+KCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLnByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHByb3BlcnR5ID0gbm9kZS5wcm9wZXJ0aWVzW2ldO1xuICAgICAgaWYgKHRzLmlzUHJvcGVydHlBc3NpZ25tZW50KHByb3BlcnR5KSkge1xuICAgICAgICBjb25zdCBuYW1lID0gdGhpcy5zdHJpbmdOYW1lRnJvbVByb3BlcnR5TmFtZShwcm9wZXJ0eS5uYW1lLCBjb250ZXh0KTtcblxuICAgICAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSBuYW1lIGNhbiBiZSBkZXRlcm1pbmVkIHN0YXRpY2FsbHkuXG4gICAgICAgIGlmIChuYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICByZXR1cm4gRFlOQU1JQ19WQUxVRTtcbiAgICAgICAgfVxuXG4gICAgICAgIG1hcC5zZXQobmFtZSwgdGhpcy52aXNpdEV4cHJlc3Npb24ocHJvcGVydHkuaW5pdGlhbGl6ZXIsIGNvbnRleHQpKTtcbiAgICAgIH0gZWxzZSBpZiAodHMuaXNTaG9ydGhhbmRQcm9wZXJ0eUFzc2lnbm1lbnQocHJvcGVydHkpKSB7XG4gICAgICAgIGNvbnN0IHN5bWJvbCA9IHRoaXMuY2hlY2tlci5nZXRTaG9ydGhhbmRBc3NpZ25tZW50VmFsdWVTeW1ib2wocHJvcGVydHkpO1xuICAgICAgICBpZiAoc3ltYm9sID09PSB1bmRlZmluZWQgfHwgc3ltYm9sLnZhbHVlRGVjbGFyYXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHJldHVybiBEWU5BTUlDX1ZBTFVFO1xuICAgICAgICB9XG4gICAgICAgIG1hcC5zZXQocHJvcGVydHkubmFtZS50ZXh0LCB0aGlzLnZpc2l0RGVjbGFyYXRpb24oc3ltYm9sLnZhbHVlRGVjbGFyYXRpb24sIGNvbnRleHQpKTtcbiAgICAgIH0gZWxzZSBpZiAodHMuaXNTcHJlYWRBc3NpZ25tZW50KHByb3BlcnR5KSkge1xuICAgICAgICBjb25zdCBzcHJlYWQgPSB0aGlzLnZpc2l0RXhwcmVzc2lvbihwcm9wZXJ0eS5leHByZXNzaW9uLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKGlzRHluYW1pY1ZhbHVlKHNwcmVhZCkpIHtcbiAgICAgICAgICByZXR1cm4gRFlOQU1JQ19WQUxVRTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShzcHJlYWQgaW5zdGFuY2VvZiBNYXApKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmV4cGVjdGVkIHZhbHVlIGluIHNwcmVhZCBhc3NpZ25tZW50OiAke3NwcmVhZH1gKTtcbiAgICAgICAgfVxuICAgICAgICBzcHJlYWQuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4gbWFwLnNldChrZXksIHZhbHVlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gRFlOQU1JQ19WQUxVRTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1hcDtcbiAgfVxuXG4gIHByaXZhdGUgdmlzaXRUZW1wbGF0ZUV4cHJlc3Npb24obm9kZTogdHMuVGVtcGxhdGVFeHByZXNzaW9uLCBjb250ZXh0OiBDb250ZXh0KTogUmVzb2x2ZWRWYWx1ZSB7XG4gICAgY29uc3QgcGllY2VzOiBzdHJpbmdbXSA9IFtub2RlLmhlYWQudGV4dF07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLnRlbXBsYXRlU3BhbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHNwYW4gPSBub2RlLnRlbXBsYXRlU3BhbnNbaV07XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmlzaXQoc3Bhbi5leHByZXNzaW9uLCBjb250ZXh0KTtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgfHwgdHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgICB2YWx1ZSA9PSBudWxsKSB7XG4gICAgICAgIHBpZWNlcy5wdXNoKGAke3ZhbHVlfWApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIERZTkFNSUNfVkFMVUU7XG4gICAgICB9XG4gICAgICBwaWVjZXMucHVzaChzcGFuLmxpdGVyYWwudGV4dCk7XG4gICAgfVxuICAgIHJldHVybiBwaWVjZXMuam9pbignJyk7XG4gIH1cblxuICBwcml2YXRlIHZpc2l0SWRlbnRpZmllcihub2RlOiB0cy5JZGVudGlmaWVyLCBjb250ZXh0OiBDb250ZXh0KTogUmVzb2x2ZWRWYWx1ZSB7XG4gICAgY29uc3QgZGVjbCA9IHRoaXMuaG9zdC5nZXREZWNsYXJhdGlvbk9mSWRlbnRpZmllcihub2RlKTtcbiAgICBpZiAoZGVjbCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIERZTkFNSUNfVkFMVUU7XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMudmlzaXREZWNsYXJhdGlvbihcbiAgICAgICAgZGVjbC5ub2RlLCB7Li4uY29udGV4dCwgYWJzb2x1dGVNb2R1bGVOYW1lOiBkZWNsLnZpYU1vZHVsZSB8fCBjb250ZXh0LmFic29sdXRlTW9kdWxlTmFtZX0pO1xuICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBSZWZlcmVuY2UpIHtcbiAgICAgIHJlc3VsdC5hZGRJZGVudGlmaWVyKG5vZGUpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSB2aXNpdERlY2xhcmF0aW9uKG5vZGU6IHRzLkRlY2xhcmF0aW9uLCBjb250ZXh0OiBDb250ZXh0KTogUmVzb2x2ZWRWYWx1ZSB7XG4gICAgaWYgKHRoaXMuaG9zdC5pc0NsYXNzKG5vZGUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRSZWZlcmVuY2Uobm9kZSwgY29udGV4dCk7XG4gICAgfSBlbHNlIGlmICh0cy5pc1ZhcmlhYmxlRGVjbGFyYXRpb24obm9kZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0VmFyaWFibGVEZWNsYXJhdGlvbihub2RlLCBjb250ZXh0KTtcbiAgICB9IGVsc2UgaWYgKHRzLmlzUGFyYW1ldGVyKG5vZGUpICYmIGNvbnRleHQuc2NvcGUuaGFzKG5vZGUpKSB7XG4gICAgICByZXR1cm4gY29udGV4dC5zY29wZS5nZXQobm9kZSkgITtcbiAgICB9IGVsc2UgaWYgKHRzLmlzRXhwb3J0QXNzaWdubWVudChub2RlKSkge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaXRFeHByZXNzaW9uKG5vZGUuZXhwcmVzc2lvbiwgY29udGV4dCk7XG4gICAgfSBlbHNlIGlmICh0cy5pc0VudW1EZWNsYXJhdGlvbihub2RlKSkge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaXRFbnVtRGVjbGFyYXRpb24obm9kZSwgY29udGV4dCk7XG4gICAgfSBlbHNlIGlmICh0cy5pc1NvdXJjZUZpbGUobm9kZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0U291cmNlRmlsZShub2RlLCBjb250ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVmZXJlbmNlKG5vZGUsIGNvbnRleHQpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgdmlzaXRWYXJpYWJsZURlY2xhcmF0aW9uKG5vZGU6IHRzLlZhcmlhYmxlRGVjbGFyYXRpb24sIGNvbnRleHQ6IENvbnRleHQpOiBSZXNvbHZlZFZhbHVlIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMuaG9zdC5nZXRWYXJpYWJsZVZhbHVlKG5vZGUpO1xuICAgIGlmICh2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaXRFeHByZXNzaW9uKHZhbHVlLCBjb250ZXh0KTtcbiAgICB9IGVsc2UgaWYgKGlzVmFyaWFibGVEZWNsYXJhdGlvbkRlY2xhcmVkKG5vZGUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRSZWZlcmVuY2Uobm9kZSwgY29udGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSB2aXNpdEVudW1EZWNsYXJhdGlvbihub2RlOiB0cy5FbnVtRGVjbGFyYXRpb24sIGNvbnRleHQ6IENvbnRleHQpOiBSZXNvbHZlZFZhbHVlIHtcbiAgICBjb25zdCBlbnVtUmVmID0gdGhpcy5nZXRSZWZlcmVuY2Uobm9kZSwgY29udGV4dCkgYXMgUmVmZXJlbmNlPHRzLkVudW1EZWNsYXJhdGlvbj47XG4gICAgY29uc3QgbWFwID0gbmV3IE1hcDxzdHJpbmcsIEVudW1WYWx1ZT4oKTtcbiAgICBub2RlLm1lbWJlcnMuZm9yRWFjaChtZW1iZXIgPT4ge1xuICAgICAgY29uc3QgbmFtZSA9IHRoaXMuc3RyaW5nTmFtZUZyb21Qcm9wZXJ0eU5hbWUobWVtYmVyLm5hbWUsIGNvbnRleHQpO1xuICAgICAgaWYgKG5hbWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBtYXAuc2V0KG5hbWUsIG5ldyBFbnVtVmFsdWUoZW51bVJlZiwgbmFtZSkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBtYXA7XG4gIH1cblxuICBwcml2YXRlIHZpc2l0RWxlbWVudEFjY2Vzc0V4cHJlc3Npb24obm9kZTogdHMuRWxlbWVudEFjY2Vzc0V4cHJlc3Npb24sIGNvbnRleHQ6IENvbnRleHQpOlxuICAgICAgUmVzb2x2ZWRWYWx1ZSB7XG4gICAgY29uc3QgbGhzID0gdGhpcy52aXNpdEV4cHJlc3Npb24obm9kZS5leHByZXNzaW9uLCBjb250ZXh0KTtcbiAgICBpZiAobm9kZS5hcmd1bWVudEV4cHJlc3Npb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBhcmd1bWVudCBpbiBFbGVtZW50QWNjZXNzRXhwcmVzc2lvbmApO1xuICAgIH1cbiAgICBpZiAoaXNEeW5hbWljVmFsdWUobGhzKSkge1xuICAgICAgcmV0dXJuIERZTkFNSUNfVkFMVUU7XG4gICAgfVxuICAgIGNvbnN0IHJocyA9IHRoaXMudmlzaXRFeHByZXNzaW9uKG5vZGUuYXJndW1lbnRFeHByZXNzaW9uLCBjb250ZXh0KTtcbiAgICBpZiAoaXNEeW5hbWljVmFsdWUocmhzKSkge1xuICAgICAgcmV0dXJuIERZTkFNSUNfVkFMVUU7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgcmhzICE9PSAnc3RyaW5nJyAmJiB0eXBlb2YgcmhzICE9PSAnbnVtYmVyJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBFbGVtZW50QWNjZXNzRXhwcmVzc2lvbiBpbmRleCBzaG91bGQgYmUgc3RyaW5nIG9yIG51bWJlciwgZ290ICR7dHlwZW9mIHJoc306ICR7cmhzfWApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmFjY2Vzc0hlbHBlcihsaHMsIHJocywgY29udGV4dCk7XG4gIH1cblxuICBwcml2YXRlIHZpc2l0UHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKG5vZGU6IHRzLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbiwgY29udGV4dDogQ29udGV4dCk6XG4gICAgICBSZXNvbHZlZFZhbHVlIHtcbiAgICBjb25zdCBsaHMgPSB0aGlzLnZpc2l0RXhwcmVzc2lvbihub2RlLmV4cHJlc3Npb24sIGNvbnRleHQpO1xuICAgIGNvbnN0IHJocyA9IG5vZGUubmFtZS50ZXh0O1xuICAgIC8vIFRPRE86IGhhbmRsZSByZWZlcmVuY2UgdG8gY2xhc3MgZGVjbGFyYXRpb24uXG4gICAgaWYgKGlzRHluYW1pY1ZhbHVlKGxocykpIHtcbiAgICAgIHJldHVybiBEWU5BTUlDX1ZBTFVFO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmFjY2Vzc0hlbHBlcihsaHMsIHJocywgY29udGV4dCk7XG4gIH1cblxuICBwcml2YXRlIHZpc2l0U291cmNlRmlsZShub2RlOiB0cy5Tb3VyY2VGaWxlLCBjb250ZXh0OiBDb250ZXh0KTogUmVzb2x2ZWRWYWx1ZSB7XG4gICAgY29uc3QgZGVjbGFyYXRpb25zID0gdGhpcy5ob3N0LmdldEV4cG9ydHNPZk1vZHVsZShub2RlKTtcbiAgICBpZiAoZGVjbGFyYXRpb25zID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gRFlOQU1JQ19WQUxVRTtcbiAgICB9XG4gICAgY29uc3QgbWFwID0gbmV3IE1hcDxzdHJpbmcsIFJlc29sdmVkVmFsdWU+KCk7XG4gICAgZGVjbGFyYXRpb25zLmZvckVhY2goKGRlY2wsIG5hbWUpID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aXNpdERlY2xhcmF0aW9uKGRlY2wubm9kZSwge1xuICAgICAgICAuLi5jb250ZXh0LFxuICAgICAgICBhYnNvbHV0ZU1vZHVsZU5hbWU6IGRlY2wudmlhTW9kdWxlIHx8IGNvbnRleHQuYWJzb2x1dGVNb2R1bGVOYW1lLFxuICAgICAgfSk7XG4gICAgICBtYXAuc2V0KG5hbWUsIHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gbWFwO1xuICB9XG5cbiAgcHJpdmF0ZSBhY2Nlc3NIZWxwZXIobGhzOiBSZXNvbHZlZFZhbHVlLCByaHM6IHN0cmluZ3xudW1iZXIsIGNvbnRleHQ6IENvbnRleHQpOiBSZXNvbHZlZFZhbHVlIHtcbiAgICBjb25zdCBzdHJJbmRleCA9IGAke3Joc31gO1xuICAgIGlmIChsaHMgaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgIGlmIChsaHMuaGFzKHN0ckluZGV4KSkge1xuICAgICAgICByZXR1cm4gbGhzLmdldChzdHJJbmRleCkgITtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBtYXAgYWNjZXNzOiBbJHtBcnJheS5mcm9tKGxocy5rZXlzKCkpfV0gZG90ICR7cmhzfWApO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShsaHMpKSB7XG4gICAgICBpZiAocmhzID09PSAnbGVuZ3RoJykge1xuICAgICAgICByZXR1cm4gbGhzLmxlbmd0aDtcbiAgICAgIH0gZWxzZSBpZiAocmhzID09PSAnc2xpY2UnKSB7XG4gICAgICAgIHJldHVybiBuZXcgQXJyYXlTbGljZUJ1aWx0aW5GbihsaHMpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiByaHMgIT09ICdudW1iZXInIHx8ICFOdW1iZXIuaXNJbnRlZ2VyKHJocykpIHtcbiAgICAgICAgcmV0dXJuIERZTkFNSUNfVkFMVUU7XG4gICAgICB9XG4gICAgICBpZiAocmhzIDwgMCB8fCByaHMgPj0gbGhzLmxlbmd0aCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEluZGV4IG91dCBvZiBib3VuZHM6ICR7cmhzfSB2cyAke2xocy5sZW5ndGh9YCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbGhzW3Joc107XG4gICAgfSBlbHNlIGlmIChsaHMgaW5zdGFuY2VvZiBSZWZlcmVuY2UpIHtcbiAgICAgIGNvbnN0IHJlZiA9IGxocy5ub2RlO1xuICAgICAgaWYgKHRoaXMuaG9zdC5pc0NsYXNzKHJlZikpIHtcbiAgICAgICAgbGV0IGFic29sdXRlTW9kdWxlTmFtZSA9IGNvbnRleHQuYWJzb2x1dGVNb2R1bGVOYW1lO1xuICAgICAgICBpZiAobGhzIGluc3RhbmNlb2YgTm9kZVJlZmVyZW5jZSB8fCBsaHMgaW5zdGFuY2VvZiBBYnNvbHV0ZVJlZmVyZW5jZSkge1xuICAgICAgICAgIGFic29sdXRlTW9kdWxlTmFtZSA9IGxocy5tb2R1bGVOYW1lIHx8IGFic29sdXRlTW9kdWxlTmFtZTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdmFsdWU6IFJlc29sdmVkVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IG1lbWJlciA9IHRoaXMuaG9zdC5nZXRNZW1iZXJzT2ZDbGFzcyhyZWYpLmZpbmQoXG4gICAgICAgICAgICBtZW1iZXIgPT4gbWVtYmVyLmlzU3RhdGljICYmIG1lbWJlci5uYW1lID09PSBzdHJJbmRleCk7XG4gICAgICAgIGlmIChtZW1iZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmIChtZW1iZXIudmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy52aXNpdEV4cHJlc3Npb24obWVtYmVyLnZhbHVlLCBjb250ZXh0KTtcbiAgICAgICAgICB9IGVsc2UgaWYgKG1lbWJlci5pbXBsZW1lbnRhdGlvbiAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdmFsdWUgPSBuZXcgTm9kZVJlZmVyZW5jZShtZW1iZXIuaW1wbGVtZW50YXRpb24sIGFic29sdXRlTW9kdWxlTmFtZSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChtZW1iZXIubm9kZSkge1xuICAgICAgICAgICAgdmFsdWUgPSBuZXcgTm9kZVJlZmVyZW5jZShtZW1iZXIubm9kZSwgYWJzb2x1dGVNb2R1bGVOYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgZG90IHByb3BlcnR5IGFjY2VzczogJHtsaHN9IGRvdCAke3Joc31gKTtcbiAgfVxuXG4gIHByaXZhdGUgdmlzaXRDYWxsRXhwcmVzc2lvbihub2RlOiB0cy5DYWxsRXhwcmVzc2lvbiwgY29udGV4dDogQ29udGV4dCk6IFJlc29sdmVkVmFsdWUge1xuICAgIGNvbnN0IGxocyA9IHRoaXMudmlzaXRFeHByZXNzaW9uKG5vZGUuZXhwcmVzc2lvbiwgY29udGV4dCk7XG4gICAgaWYgKGlzRHluYW1pY1ZhbHVlKGxocykpIHtcbiAgICAgIHJldHVybiBEWU5BTUlDX1ZBTFVFO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBjYWxsIHJlZmVycyB0byBhIGJ1aWx0aW4gZnVuY3Rpb24sIGF0dGVtcHQgdG8gZXZhbHVhdGUgdGhlIGZ1bmN0aW9uLlxuICAgIGlmIChsaHMgaW5zdGFuY2VvZiBCdWlsdGluRm4pIHtcbiAgICAgIHJldHVybiBsaHMuZXZhbHVhdGUobm9kZS5hcmd1bWVudHMubWFwKGFyZyA9PiB0aGlzLnZpc2l0RXhwcmVzc2lvbihhcmcsIGNvbnRleHQpKSk7XG4gICAgfVxuXG4gICAgaWYgKCEobGhzIGluc3RhbmNlb2YgUmVmZXJlbmNlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBhdHRlbXB0aW5nIHRvIGNhbGwgc29tZXRoaW5nIHRoYXQgaXMgbm90IGEgZnVuY3Rpb246ICR7bGhzfWApO1xuICAgIH0gZWxzZSBpZiAoIWlzRnVuY3Rpb25Pck1ldGhvZFJlZmVyZW5jZShsaHMpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYGNhbGxpbmcgc29tZXRoaW5nIHRoYXQgaXMgbm90IGEgZnVuY3Rpb24gZGVjbGFyYXRpb24/ICR7dHMuU3ludGF4S2luZFtsaHMubm9kZS5raW5kXX0gKCR7bm9kZS5nZXRUZXh0KCl9KWApO1xuICAgIH1cblxuICAgIGNvbnN0IGZuID0gdGhpcy5ob3N0LmdldERlZmluaXRpb25PZkZ1bmN0aW9uKGxocy5ub2RlKTtcblxuICAgIC8vIElmIHRoZSBmdW5jdGlvbiBpcyBmb3JlaWduIChkZWNsYXJlZCB0aHJvdWdoIGEgZC50cyBmaWxlKSwgYXR0ZW1wdCB0byByZXNvbHZlIGl0IHdpdGggdGhlXG4gICAgLy8gZm9yZWlnbkZ1bmN0aW9uUmVzb2x2ZXIsIGlmIG9uZSBpcyBzcGVjaWZpZWQuXG4gICAgaWYgKGZuLmJvZHkgPT09IG51bGwpIHtcbiAgICAgIGxldCBleHByOiB0cy5FeHByZXNzaW9ufG51bGwgPSBudWxsO1xuICAgICAgaWYgKGNvbnRleHQuZm9yZWlnbkZ1bmN0aW9uUmVzb2x2ZXIpIHtcbiAgICAgICAgZXhwciA9IGNvbnRleHQuZm9yZWlnbkZ1bmN0aW9uUmVzb2x2ZXIobGhzLCBub2RlLmFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgICBpZiAoZXhwciA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgY291bGQgbm90IHJlc29sdmUgZm9yZWlnbiBmdW5jdGlvbiBkZWNsYXJhdGlvbjogJHtub2RlLmdldFNvdXJjZUZpbGUoKS5maWxlTmFtZX0gJHsobGhzLm5vZGUubmFtZSBhcyB0cy5JZGVudGlmaWVyKS50ZXh0fWApO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGUgZnVuY3Rpb24gaXMgZGVjbGFyZWQgaW4gYSBkaWZmZXJlbnQgZmlsZSwgcmVzb2x2ZSB0aGUgZm9yZWlnbiBmdW5jdGlvbiBleHByZXNzaW9uXG4gICAgICAvLyB1c2luZyB0aGUgYWJzb2x1dGUgbW9kdWxlIG5hbWUgb2YgdGhhdCBmaWxlIChpZiBhbnkpLlxuICAgICAgbGV0IGFic29sdXRlTW9kdWxlTmFtZTogc3RyaW5nfG51bGwgPSBjb250ZXh0LmFic29sdXRlTW9kdWxlTmFtZTtcbiAgICAgIGlmIChsaHMgaW5zdGFuY2VvZiBOb2RlUmVmZXJlbmNlIHx8IGxocyBpbnN0YW5jZW9mIEFic29sdXRlUmVmZXJlbmNlKSB7XG4gICAgICAgIGFic29sdXRlTW9kdWxlTmFtZSA9IGxocy5tb2R1bGVOYW1lIHx8IGFic29sdXRlTW9kdWxlTmFtZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMudmlzaXRFeHByZXNzaW9uKGV4cHIsIHsuLi5jb250ZXh0LCBhYnNvbHV0ZU1vZHVsZU5hbWV9KTtcbiAgICB9XG5cbiAgICBjb25zdCBib2R5ID0gZm4uYm9keTtcbiAgICBpZiAoYm9keS5sZW5ndGggIT09IDEgfHwgIXRzLmlzUmV0dXJuU3RhdGVtZW50KGJvZHlbMF0pKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Z1bmN0aW9uIGJvZHkgbXVzdCBoYXZlIGEgc2luZ2xlIHJldHVybiBzdGF0ZW1lbnQgb25seS4nKTtcbiAgICB9XG4gICAgY29uc3QgcmV0ID0gYm9keVswXSBhcyB0cy5SZXR1cm5TdGF0ZW1lbnQ7XG5cbiAgICBjb25zdCBuZXdTY29wZTogU2NvcGUgPSBuZXcgTWFwPHRzLlBhcmFtZXRlckRlY2xhcmF0aW9uLCBSZXNvbHZlZFZhbHVlPigpO1xuICAgIGZuLnBhcmFtZXRlcnMuZm9yRWFjaCgocGFyYW0sIGluZGV4KSA9PiB7XG4gICAgICBsZXQgdmFsdWU6IFJlc29sdmVkVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICBpZiAoaW5kZXggPCBub2RlLmFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgYXJnID0gbm9kZS5hcmd1bWVudHNbaW5kZXhdO1xuICAgICAgICB2YWx1ZSA9IHRoaXMudmlzaXRFeHByZXNzaW9uKGFyZywgY29udGV4dCk7XG4gICAgICB9XG4gICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCAmJiBwYXJhbS5pbml0aWFsaXplciAhPT0gbnVsbCkge1xuICAgICAgICB2YWx1ZSA9IHRoaXMudmlzaXRFeHByZXNzaW9uKHBhcmFtLmluaXRpYWxpemVyLCBjb250ZXh0KTtcbiAgICAgIH1cbiAgICAgIG5ld1Njb3BlLnNldChwYXJhbS5ub2RlLCB2YWx1ZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmV0LmV4cHJlc3Npb24gIT09IHVuZGVmaW5lZCA/XG4gICAgICAgIHRoaXMudmlzaXRFeHByZXNzaW9uKHJldC5leHByZXNzaW9uLCB7Li4uY29udGV4dCwgc2NvcGU6IG5ld1Njb3BlfSkgOlxuICAgICAgICB1bmRlZmluZWQ7XG4gIH1cblxuICBwcml2YXRlIHZpc2l0Q29uZGl0aW9uYWxFeHByZXNzaW9uKG5vZGU6IHRzLkNvbmRpdGlvbmFsRXhwcmVzc2lvbiwgY29udGV4dDogQ29udGV4dCk6XG4gICAgICBSZXNvbHZlZFZhbHVlIHtcbiAgICBjb25zdCBjb25kaXRpb24gPSB0aGlzLnZpc2l0RXhwcmVzc2lvbihub2RlLmNvbmRpdGlvbiwgY29udGV4dCk7XG4gICAgaWYgKGlzRHluYW1pY1ZhbHVlKGNvbmRpdGlvbikpIHtcbiAgICAgIHJldHVybiBjb25kaXRpb247XG4gICAgfVxuXG4gICAgaWYgKGNvbmRpdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaXRFeHByZXNzaW9uKG5vZGUud2hlblRydWUsIGNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy52aXNpdEV4cHJlc3Npb24obm9kZS53aGVuRmFsc2UsIGNvbnRleHQpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgdmlzaXRQcmVmaXhVbmFyeUV4cHJlc3Npb24obm9kZTogdHMuUHJlZml4VW5hcnlFeHByZXNzaW9uLCBjb250ZXh0OiBDb250ZXh0KTpcbiAgICAgIFJlc29sdmVkVmFsdWUge1xuICAgIGNvbnN0IG9wZXJhdG9yS2luZCA9IG5vZGUub3BlcmF0b3I7XG4gICAgaWYgKCFVTkFSWV9PUEVSQVRPUlMuaGFzKG9wZXJhdG9yS2luZCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgcHJlZml4IHVuYXJ5IG9wZXJhdG9yOiAke3RzLlN5bnRheEtpbmRbb3BlcmF0b3JLaW5kXX1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBvcCA9IFVOQVJZX09QRVJBVE9SUy5nZXQob3BlcmF0b3JLaW5kKSAhO1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aXNpdEV4cHJlc3Npb24obm9kZS5vcGVyYW5kLCBjb250ZXh0KTtcbiAgICByZXR1cm4gaXNEeW5hbWljVmFsdWUodmFsdWUpID8gRFlOQU1JQ19WQUxVRSA6IG9wKHZhbHVlKTtcbiAgfVxuXG4gIHByaXZhdGUgdmlzaXRCaW5hcnlFeHByZXNzaW9uKG5vZGU6IHRzLkJpbmFyeUV4cHJlc3Npb24sIGNvbnRleHQ6IENvbnRleHQpOiBSZXNvbHZlZFZhbHVlIHtcbiAgICBjb25zdCB0b2tlbktpbmQgPSBub2RlLm9wZXJhdG9yVG9rZW4ua2luZDtcbiAgICBpZiAoIUJJTkFSWV9PUEVSQVRPUlMuaGFzKHRva2VuS2luZCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgYmluYXJ5IG9wZXJhdG9yOiAke3RzLlN5bnRheEtpbmRbdG9rZW5LaW5kXX1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBvcFJlY29yZCA9IEJJTkFSWV9PUEVSQVRPUlMuZ2V0KHRva2VuS2luZCkgITtcbiAgICBsZXQgbGhzOiBSZXNvbHZlZFZhbHVlLCByaHM6IFJlc29sdmVkVmFsdWU7XG4gICAgaWYgKG9wUmVjb3JkLmxpdGVyYWwpIHtcbiAgICAgIGxocyA9IGxpdGVyYWwodGhpcy52aXNpdEV4cHJlc3Npb24obm9kZS5sZWZ0LCBjb250ZXh0KSk7XG4gICAgICByaHMgPSBsaXRlcmFsKHRoaXMudmlzaXRFeHByZXNzaW9uKG5vZGUucmlnaHQsIGNvbnRleHQpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGhzID0gdGhpcy52aXNpdEV4cHJlc3Npb24obm9kZS5sZWZ0LCBjb250ZXh0KTtcbiAgICAgIHJocyA9IHRoaXMudmlzaXRFeHByZXNzaW9uKG5vZGUucmlnaHQsIGNvbnRleHQpO1xuICAgIH1cblxuICAgIHJldHVybiBpc0R5bmFtaWNWYWx1ZShsaHMpIHx8IGlzRHluYW1pY1ZhbHVlKHJocykgPyBEWU5BTUlDX1ZBTFVFIDogb3BSZWNvcmQub3AobGhzLCByaHMpO1xuICB9XG5cbiAgcHJpdmF0ZSB2aXNpdFBhcmVudGhlc2l6ZWRFeHByZXNzaW9uKG5vZGU6IHRzLlBhcmVudGhlc2l6ZWRFeHByZXNzaW9uLCBjb250ZXh0OiBDb250ZXh0KTpcbiAgICAgIFJlc29sdmVkVmFsdWUge1xuICAgIHJldHVybiB0aGlzLnZpc2l0RXhwcmVzc2lvbihub2RlLmV4cHJlc3Npb24sIGNvbnRleHQpO1xuICB9XG5cbiAgcHJpdmF0ZSBzdHJpbmdOYW1lRnJvbVByb3BlcnR5TmFtZShub2RlOiB0cy5Qcm9wZXJ0eU5hbWUsIGNvbnRleHQ6IENvbnRleHQpOiBzdHJpbmd8dW5kZWZpbmVkIHtcbiAgICBpZiAodHMuaXNJZGVudGlmaWVyKG5vZGUpIHx8IHRzLmlzU3RyaW5nTGl0ZXJhbChub2RlKSB8fCB0cy5pc051bWVyaWNMaXRlcmFsKG5vZGUpKSB7XG4gICAgICByZXR1cm4gbm9kZS50ZXh0O1xuICAgIH0gZWxzZSB7ICAvLyB0cy5Db21wdXRlZFByb3BlcnR5TmFtZVxuICAgICAgY29uc3QgbGl0ZXJhbCA9IHRoaXMudmlzaXRFeHByZXNzaW9uKG5vZGUuZXhwcmVzc2lvbiwgY29udGV4dCk7XG4gICAgICByZXR1cm4gdHlwZW9mIGxpdGVyYWwgPT09ICdzdHJpbmcnID8gbGl0ZXJhbCA6IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldFJlZmVyZW5jZShub2RlOiB0cy5EZWNsYXJhdGlvbiwgY29udGV4dDogQ29udGV4dCk6IFJlZmVyZW5jZSB7XG4gICAgY29uc3QgaWQgPSBpZGVudGlmaWVyT2ZEZWNsYXJhdGlvbihub2RlKTtcbiAgICBpZiAoaWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBEb24ndCBrbm93IGhvdyB0byByZWZlciB0byAke3RzLlN5bnRheEtpbmRbbm9kZS5raW5kXX1gKTtcbiAgICB9XG4gICAgaWYgKGNvbnRleHQuYWJzb2x1dGVNb2R1bGVOYW1lICE9PSBudWxsKSB7XG4gICAgICAvLyBUT0RPKGFseGh1Yik6IGludmVzdGlnYXRlIHdoZXRoZXIgdGhpcyBjYW4gZ2V0IHN5bWJvbCBuYW1lcyB3cm9uZyBpbiB0aGUgZXZlbnQgb2ZcbiAgICAgIC8vIHJlLWV4cG9ydHMgdW5kZXIgZGlmZmVyZW50IG5hbWVzLlxuICAgICAgcmV0dXJuIG5ldyBBYnNvbHV0ZVJlZmVyZW5jZShub2RlLCBpZCwgY29udGV4dC5hYnNvbHV0ZU1vZHVsZU5hbWUsIGlkLnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFJlc29sdmVkUmVmZXJlbmNlKG5vZGUsIGlkKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNGdW5jdGlvbk9yTWV0aG9kUmVmZXJlbmNlKHJlZjogUmVmZXJlbmNlPHRzLk5vZGU+KTpcbiAgICByZWYgaXMgUmVmZXJlbmNlPHRzLkZ1bmN0aW9uRGVjbGFyYXRpb258dHMuTWV0aG9kRGVjbGFyYXRpb258dHMuRnVuY3Rpb25FeHByZXNzaW9uPiB7XG4gIHJldHVybiB0cy5pc0Z1bmN0aW9uRGVjbGFyYXRpb24ocmVmLm5vZGUpIHx8IHRzLmlzTWV0aG9kRGVjbGFyYXRpb24ocmVmLm5vZGUpIHx8XG4gICAgICB0cy5pc0Z1bmN0aW9uRXhwcmVzc2lvbihyZWYubm9kZSk7XG59XG5cbmZ1bmN0aW9uIGxpdGVyYWwodmFsdWU6IFJlc29sdmVkVmFsdWUpOiBhbnkge1xuICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8XG4gICAgICB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGlmIChpc0R5bmFtaWNWYWx1ZSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gRFlOQU1JQ19WQUxVRTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoYFZhbHVlICR7dmFsdWV9IGlzIG5vdCBsaXRlcmFsIGFuZCBjYW5ub3QgYmUgdXNlZCBpbiB0aGlzIGNvbnRleHQuYCk7XG59XG5cbmZ1bmN0aW9uIGlkZW50aWZpZXJPZkRlY2xhcmF0aW9uKGRlY2w6IHRzLkRlY2xhcmF0aW9uKTogdHMuSWRlbnRpZmllcnx1bmRlZmluZWQge1xuICBpZiAodHMuaXNDbGFzc0RlY2xhcmF0aW9uKGRlY2wpKSB7XG4gICAgcmV0dXJuIGRlY2wubmFtZTtcbiAgfSBlbHNlIGlmICh0cy5pc0VudW1EZWNsYXJhdGlvbihkZWNsKSkge1xuICAgIHJldHVybiBkZWNsLm5hbWU7XG4gIH0gZWxzZSBpZiAodHMuaXNGdW5jdGlvbkRlY2xhcmF0aW9uKGRlY2wpKSB7XG4gICAgcmV0dXJuIGRlY2wubmFtZTtcbiAgfSBlbHNlIGlmICh0cy5pc1ZhcmlhYmxlRGVjbGFyYXRpb24oZGVjbCkgJiYgdHMuaXNJZGVudGlmaWVyKGRlY2wubmFtZSkpIHtcbiAgICByZXR1cm4gZGVjbC5uYW1lO1xuICB9IGVsc2UgaWYgKHRzLmlzU2hvcnRoYW5kUHJvcGVydHlBc3NpZ25tZW50KGRlY2wpKSB7XG4gICAgcmV0dXJuIGRlY2wubmFtZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzVmFyaWFibGVEZWNsYXJhdGlvbkRlY2xhcmVkKG5vZGU6IHRzLlZhcmlhYmxlRGVjbGFyYXRpb24pOiBib29sZWFuIHtcbiAgaWYgKG5vZGUucGFyZW50ID09PSB1bmRlZmluZWQgfHwgIXRzLmlzVmFyaWFibGVEZWNsYXJhdGlvbkxpc3Qobm9kZS5wYXJlbnQpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNvbnN0IGRlY2xMaXN0ID0gbm9kZS5wYXJlbnQ7XG4gIGlmIChkZWNsTGlzdC5wYXJlbnQgPT09IHVuZGVmaW5lZCB8fCAhdHMuaXNWYXJpYWJsZVN0YXRlbWVudChkZWNsTGlzdC5wYXJlbnQpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNvbnN0IHZhclN0bXQgPSBkZWNsTGlzdC5wYXJlbnQ7XG4gIHJldHVybiB2YXJTdG10Lm1vZGlmaWVycyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICB2YXJTdG10Lm1vZGlmaWVycy5zb21lKG1vZCA9PiBtb2Qua2luZCA9PT0gdHMuU3ludGF4S2luZC5EZWNsYXJlS2V5d29yZCk7XG59XG4iXX0=