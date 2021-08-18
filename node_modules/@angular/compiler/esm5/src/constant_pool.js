/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import * as o from './output/output_ast';
import { error } from './util';
var CONSTANT_PREFIX = '_c';
/**
 * Context to use when producing a key.
 *
 * This ensures we see the constant not the reference variable when producing
 * a key.
 */
var KEY_CONTEXT = {};
/**
 * A node that is a place-holder that allows the node to be replaced when the actual
 * node is known.
 *
 * This allows the constant pool to change an expression from a direct reference to
 * a constant to a shared constant. It returns a fix-up node that is later allowed to
 * change the referenced expression.
 */
var FixupExpression = /** @class */ (function (_super) {
    tslib_1.__extends(FixupExpression, _super);
    function FixupExpression(resolved) {
        var _this = _super.call(this, resolved.type) || this;
        _this.resolved = resolved;
        _this.original = resolved;
        return _this;
    }
    FixupExpression.prototype.visitExpression = function (visitor, context) {
        if (context === KEY_CONTEXT) {
            // When producing a key we want to traverse the constant not the
            // variable used to refer to it.
            return this.original.visitExpression(visitor, context);
        }
        else {
            return this.resolved.visitExpression(visitor, context);
        }
    };
    FixupExpression.prototype.isEquivalent = function (e) {
        return e instanceof FixupExpression && this.resolved.isEquivalent(e.resolved);
    };
    FixupExpression.prototype.isConstant = function () { return true; };
    FixupExpression.prototype.fixup = function (expression) {
        this.resolved = expression;
        this.shared = true;
    };
    return FixupExpression;
}(o.Expression));
/**
 * A constant pool allows a code emitter to share constant in an output context.
 *
 * The constant pool also supports sharing access to ivy definitions references.
 */
var ConstantPool = /** @class */ (function () {
    function ConstantPool() {
        this.statements = [];
        this.literals = new Map();
        this.literalFactories = new Map();
        this.injectorDefinitions = new Map();
        this.directiveDefinitions = new Map();
        this.componentDefinitions = new Map();
        this.pipeDefinitions = new Map();
        this.nextNameIndex = 0;
    }
    ConstantPool.prototype.getConstLiteral = function (literal, forceShared) {
        if (literal instanceof o.LiteralExpr || literal instanceof FixupExpression) {
            // Do no put simple literals into the constant pool or try to produce a constant for a
            // reference to a constant.
            return literal;
        }
        var key = this.keyOf(literal);
        var fixup = this.literals.get(key);
        var newValue = false;
        if (!fixup) {
            fixup = new FixupExpression(literal);
            this.literals.set(key, fixup);
            newValue = true;
        }
        if ((!newValue && !fixup.shared) || (newValue && forceShared)) {
            // Replace the expression with a variable
            var name_1 = this.freshName();
            this.statements.push(o.variable(name_1).set(literal).toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
            fixup.fixup(o.variable(name_1));
        }
        return fixup;
    };
    ConstantPool.prototype.getDefinition = function (type, kind, ctx, forceShared) {
        if (forceShared === void 0) { forceShared = false; }
        var definitions = this.definitionsOf(kind);
        var fixup = definitions.get(type);
        var newValue = false;
        if (!fixup) {
            var property = this.propertyNameOf(kind);
            fixup = new FixupExpression(ctx.importExpr(type).prop(property));
            definitions.set(type, fixup);
            newValue = true;
        }
        if ((!newValue && !fixup.shared) || (newValue && forceShared)) {
            var name_2 = this.freshName();
            this.statements.push(o.variable(name_2).set(fixup.resolved).toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
            fixup.fixup(o.variable(name_2));
        }
        return fixup;
    };
    ConstantPool.prototype.getLiteralFactory = function (literal) {
        // Create a pure function that builds an array of a mix of constant  and variable expressions
        if (literal instanceof o.LiteralArrayExpr) {
            var argumentsForKey = literal.entries.map(function (e) { return e.isConstant() ? e : o.literal(null); });
            var key = this.keyOf(o.literalArr(argumentsForKey));
            return this._getLiteralFactory(key, literal.entries, function (entries) { return o.literalArr(entries); });
        }
        else {
            var expressionForKey = o.literalMap(literal.entries.map(function (e) { return ({
                key: e.key,
                value: e.value.isConstant() ? e.value : o.literal(null),
                quoted: e.quoted
            }); }));
            var key = this.keyOf(expressionForKey);
            return this._getLiteralFactory(key, literal.entries.map(function (e) { return e.value; }), function (entries) { return o.literalMap(entries.map(function (value, index) { return ({
                key: literal.entries[index].key,
                value: value,
                quoted: literal.entries[index].quoted
            }); })); });
        }
    };
    ConstantPool.prototype._getLiteralFactory = function (key, values, resultMap) {
        var _this = this;
        var literalFactory = this.literalFactories.get(key);
        var literalFactoryArguments = values.filter((function (e) { return !e.isConstant(); }));
        if (!literalFactory) {
            var resultExpressions = values.map(function (e, index) { return e.isConstant() ? _this.getConstLiteral(e, true) : o.variable("a" + index); });
            var parameters = resultExpressions.filter(isVariable).map(function (e) { return new o.FnParam(e.name, o.DYNAMIC_TYPE); });
            var pureFunctionDeclaration = o.fn(parameters, [new o.ReturnStatement(resultMap(resultExpressions))], o.INFERRED_TYPE);
            var name_3 = this.freshName();
            this.statements.push(o.variable(name_3).set(pureFunctionDeclaration).toDeclStmt(o.INFERRED_TYPE, [
                o.StmtModifier.Final
            ]));
            literalFactory = o.variable(name_3);
            this.literalFactories.set(key, literalFactory);
        }
        return { literalFactory: literalFactory, literalFactoryArguments: literalFactoryArguments };
    };
    /**
     * Produce a unique name.
     *
     * The name might be unique among different prefixes if any of the prefixes end in
     * a digit so the prefix should be a constant string (not based on user input) and
     * must not end in a digit.
     */
    ConstantPool.prototype.uniqueName = function (prefix) { return "" + prefix + this.nextNameIndex++; };
    ConstantPool.prototype.definitionsOf = function (kind) {
        switch (kind) {
            case 2 /* Component */:
                return this.componentDefinitions;
            case 1 /* Directive */:
                return this.directiveDefinitions;
            case 0 /* Injector */:
                return this.injectorDefinitions;
            case 3 /* Pipe */:
                return this.pipeDefinitions;
        }
        error("Unknown definition kind " + kind);
        return this.componentDefinitions;
    };
    ConstantPool.prototype.propertyNameOf = function (kind) {
        switch (kind) {
            case 2 /* Component */:
                return 'ngComponentDef';
            case 1 /* Directive */:
                return 'ngDirectiveDef';
            case 0 /* Injector */:
                return 'ngInjectorDef';
            case 3 /* Pipe */:
                return 'ngPipeDef';
        }
        error("Unknown definition kind " + kind);
        return '<unknown>';
    };
    ConstantPool.prototype.freshName = function () { return this.uniqueName(CONSTANT_PREFIX); };
    ConstantPool.prototype.keyOf = function (expression) {
        return expression.visitExpression(new KeyVisitor(), KEY_CONTEXT);
    };
    return ConstantPool;
}());
export { ConstantPool };
/**
 * Visitor used to determine if 2 expressions are equivalent and can be shared in the
 * `ConstantPool`.
 *
 * When the id (string) generated by the visitor is equal, expressions are considered equivalent.
 */
var KeyVisitor = /** @class */ (function () {
    function KeyVisitor() {
        this.visitWrappedNodeExpr = invalid;
        this.visitWriteVarExpr = invalid;
        this.visitWriteKeyExpr = invalid;
        this.visitWritePropExpr = invalid;
        this.visitInvokeMethodExpr = invalid;
        this.visitInvokeFunctionExpr = invalid;
        this.visitInstantiateExpr = invalid;
        this.visitConditionalExpr = invalid;
        this.visitNotExpr = invalid;
        this.visitAssertNotNullExpr = invalid;
        this.visitCastExpr = invalid;
        this.visitFunctionExpr = invalid;
        this.visitBinaryOperatorExpr = invalid;
        this.visitReadPropExpr = invalid;
        this.visitReadKeyExpr = invalid;
        this.visitCommaExpr = invalid;
    }
    KeyVisitor.prototype.visitLiteralExpr = function (ast) {
        return "" + (typeof ast.value === 'string' ? '"' + ast.value + '"' : ast.value);
    };
    KeyVisitor.prototype.visitLiteralArrayExpr = function (ast, context) {
        var _this = this;
        return "[" + ast.entries.map(function (entry) { return entry.visitExpression(_this, context); }).join(',') + "]";
    };
    KeyVisitor.prototype.visitLiteralMapExpr = function (ast, context) {
        var _this = this;
        var mapKey = function (entry) {
            var quote = entry.quoted ? '"' : '';
            return "" + quote + entry.key + quote;
        };
        var mapEntry = function (entry) {
            return mapKey(entry) + ":" + entry.value.visitExpression(_this, context);
        };
        return "{" + ast.entries.map(mapEntry).join(',');
    };
    KeyVisitor.prototype.visitExternalExpr = function (ast) {
        return ast.value.moduleName ? "EX:" + ast.value.moduleName + ":" + ast.value.name :
            "EX:" + ast.value.runtime.name;
    };
    KeyVisitor.prototype.visitReadVarExpr = function (node) { return "VAR:" + node.name; };
    KeyVisitor.prototype.visitTypeofExpr = function (node, context) {
        return "TYPEOF:" + node.expr.visitExpression(this, context);
    };
    return KeyVisitor;
}());
function invalid(arg) {
    throw new Error("Invalid state: Visitor " + this.constructor.name + " doesn't handle " + arg.constructor.name);
}
function isVariable(e) {
    return e instanceof o.ReadVarExpr;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRfcG9vbC5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2NvbXBpbGVyL3NyYy9jb25zdGFudF9wb29sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEtBQUssQ0FBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3pDLE9BQU8sRUFBZ0IsS0FBSyxFQUFDLE1BQU0sUUFBUSxDQUFDO0FBRTVDLElBQU0sZUFBZSxHQUFHLElBQUksQ0FBQztBQUk3Qjs7Ozs7R0FLRztBQUNILElBQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUV2Qjs7Ozs7OztHQU9HO0FBQ0g7SUFBOEIsMkNBQVk7SUFNeEMseUJBQW1CLFFBQXNCO1FBQXpDLFlBQ0Usa0JBQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxTQUVyQjtRQUhrQixjQUFRLEdBQVIsUUFBUSxDQUFjO1FBRXZDLEtBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDOztJQUMzQixDQUFDO0lBRUQseUNBQWUsR0FBZixVQUFnQixPQUE0QixFQUFFLE9BQVk7UUFDeEQsSUFBSSxPQUFPLEtBQUssV0FBVyxFQUFFO1lBQzNCLGdFQUFnRTtZQUNoRSxnQ0FBZ0M7WUFDaEMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDeEQ7YUFBTTtZQUNMLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ3hEO0lBQ0gsQ0FBQztJQUVELHNDQUFZLEdBQVosVUFBYSxDQUFlO1FBQzFCLE9BQU8sQ0FBQyxZQUFZLGVBQWUsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDaEYsQ0FBQztJQUVELG9DQUFVLEdBQVYsY0FBZSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7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QUM7SUFDL0QsQ0FBQztJQUVELHFDQUFnQixHQUFoQixVQUFpQixJQUFtQixJQUFJLE9BQU8sU0FBTyxJQUFJLENBQUMsSUFBTSxDQUFDLENBQUMsQ0FBQztJQUVwRSxvQ0FBZSxHQUFmLFVBQWdCLElBQWtCLEVBQUUsT0FBWTtRQUM5QyxPQUFPLFlBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBRyxDQUFDO0lBQzlELENBQUM7SUFrQkgsaUJBQUM7QUFBRCxDQUFDLEFBOUNELElBOENDO0FBRUQsU0FBUyxPQUFPLENBQUksR0FBK0I7SUFDakQsTUFBTSxJQUFJLEtBQUssQ0FDWCw0QkFBMEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLHdCQUFtQixHQUFHLENBQUMsV0FBVyxDQUFDLElBQU0sQ0FBQyxDQUFDO0FBQ2hHLENBQUM7QUFFRCxTQUFTLFVBQVUsQ0FBQyxDQUFlO0lBQ2pDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxXQUFXLENBQUM7QUFDcEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgbyBmcm9tICcuL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7T3V0cHV0Q29udGV4dCwgZXJyb3J9IGZyb20gJy4vdXRpbCc7XG5cbmNvbnN0IENPTlNUQU5UX1BSRUZJWCA9ICdfYyc7XG5cbmV4cG9ydCBjb25zdCBlbnVtIERlZmluaXRpb25LaW5kIHtJbmplY3RvciwgRGlyZWN0aXZlLCBDb21wb25lbnQsIFBpcGV9XG5cbi8qKlxuICogQ29udGV4dCB0byB1c2Ugd2hlbiBwcm9kdWNpbmcgYSBrZXkuXG4gKlxuICogVGhpcyBlbnN1cmVzIHdlIHNlZSB0aGUgY29uc3RhbnQgbm90IHRoZSByZWZlcmVuY2UgdmFyaWFibGUgd2hlbiBwcm9kdWNpbmdcbiAqIGEga2V5LlxuICovXG5jb25zdCBLRVlfQ09OVEVYVCA9IHt9O1xuXG4vKipcbiAqIEEgbm9kZSB0aGF0IGlzIGEgcGxhY2UtaG9sZGVyIHRoYXQgYWxsb3dzIHRoZSBub2RlIHRvIGJlIHJlcGxhY2VkIHdoZW4gdGhlIGFjdHVhbFxuICogbm9kZSBpcyBrbm93bi5cbiAqXG4gKiBUaGlzIGFsbG93cyB0aGUgY29uc3RhbnQgcG9vbCB0byBjaGFuZ2UgYW4gZXhwcmVzc2lvbiBmcm9tIGEgZGlyZWN0IHJlZmVyZW5jZSB0b1xuICogYSBjb25zdGFudCB0byBhIHNoYXJlZCBjb25zdGFudC4gSXQgcmV0dXJucyBhIGZpeC11cCBub2RlIHRoYXQgaXMgbGF0ZXIgYWxsb3dlZCB0b1xuICogY2hhbmdlIHRoZSByZWZlcmVuY2VkIGV4cHJlc3Npb24uXG4gKi9cbmNsYXNzIEZpeHVwRXhwcmVzc2lvbiBleHRlbmRzIG8uRXhwcmVzc2lvbiB7XG4gIHByaXZhdGUgb3JpZ2luYWw6IG8uRXhwcmVzc2lvbjtcblxuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgc2hhcmVkICE6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocHVibGljIHJlc29sdmVkOiBvLkV4cHJlc3Npb24pIHtcbiAgICBzdXBlcihyZXNvbHZlZC50eXBlKTtcbiAgICB0aGlzLm9yaWdpbmFsID0gcmVzb2x2ZWQ7XG4gIH1cblxuICB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogby5FeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBpZiAoY29udGV4dCA9PT0gS0VZX0NPTlRFWFQpIHtcbiAgICAgIC8vIFdoZW4gcHJvZHVjaW5nIGEga2V5IHdlIHdhbnQgdG8gdHJhdmVyc2UgdGhlIGNvbnN0YW50IG5vdCB0aGVcbiAgICAgIC8vIHZhcmlhYmxlIHVzZWQgdG8gcmVmZXIgdG8gaXQuXG4gICAgICByZXR1cm4gdGhpcy5vcmlnaW5hbC52aXNpdEV4cHJlc3Npb24odmlzaXRvciwgY29udGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnJlc29sdmVkLnZpc2l0RXhwcmVzc2lvbih2aXNpdG9yLCBjb250ZXh0KTtcbiAgICB9XG4gIH1cblxuICBpc0VxdWl2YWxlbnQoZTogby5FeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGUgaW5zdGFuY2VvZiBGaXh1cEV4cHJlc3Npb24gJiYgdGhpcy5yZXNvbHZlZC5pc0VxdWl2YWxlbnQoZS5yZXNvbHZlZCk7XG4gIH1cblxuICBpc0NvbnN0YW50KCkgeyByZXR1cm4gdHJ1ZTsgfVxuXG4gIGZpeHVwKGV4cHJlc3Npb246IG8uRXhwcmVzc2lvbikge1xuICAgIHRoaXMucmVzb2x2ZWQgPSBleHByZXNzaW9uO1xuICAgIHRoaXMuc2hhcmVkID0gdHJ1ZTtcbiAgfVxufVxuXG4vKipcbiAqIEEgY29uc3RhbnQgcG9vbCBhbGxvd3MgYSBjb2RlIGVtaXR0ZXIgdG8gc2hhcmUgY29uc3RhbnQgaW4gYW4gb3V0cHV0IGNvbnRleHQuXG4gKlxuICogVGhlIGNvbnN0YW50IHBvb2wgYWxzbyBzdXBwb3J0cyBzaGFyaW5nIGFjY2VzcyB0byBpdnkgZGVmaW5pdGlvbnMgcmVmZXJlbmNlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbnN0YW50UG9vbCB7XG4gIHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10gPSBbXTtcbiAgcHJpdmF0ZSBsaXRlcmFscyA9IG5ldyBNYXA8c3RyaW5nLCBGaXh1cEV4cHJlc3Npb24+KCk7XG4gIHByaXZhdGUgbGl0ZXJhbEZhY3RvcmllcyA9IG5ldyBNYXA8c3RyaW5nLCBvLkV4cHJlc3Npb24+KCk7XG4gIHByaXZhdGUgaW5qZWN0b3JEZWZpbml0aW9ucyA9IG5ldyBNYXA8YW55LCBGaXh1cEV4cHJlc3Npb24+KCk7XG4gIHByaXZhdGUgZGlyZWN0aXZlRGVmaW5pdGlvbnMgPSBuZXcgTWFwPGFueSwgRml4dXBFeHByZXNzaW9uPigpO1xuICBwcml2YXRlIGNvbXBvbmVudERlZmluaXRpb25zID0gbmV3IE1hcDxhbnksIEZpeHVwRXhwcmVzc2lvbj4oKTtcbiAgcHJpdmF0ZSBwaXBlRGVmaW5pdGlvbnMgPSBuZXcgTWFwPGFueSwgRml4dXBFeHByZXNzaW9uPigpO1xuXG4gIHByaXZhdGUgbmV4dE5hbWVJbmRleCA9IDA7XG5cbiAgZ2V0Q29uc3RMaXRlcmFsKGxpdGVyYWw6IG8uRXhwcmVzc2lvbiwgZm9yY2VTaGFyZWQ/OiBib29sZWFuKTogby5FeHByZXNzaW9uIHtcbiAgICBpZiAobGl0ZXJhbCBpbnN0YW5jZW9mIG8uTGl0ZXJhbEV4cHIgfHwgbGl0ZXJhbCBpbnN0YW5jZW9mIEZpeHVwRXhwcmVzc2lvbikge1xuICAgICAgLy8gRG8gbm8gcHV0IHNpbXBsZSBsaXRlcmFscyBpbnRvIHRoZSBjb25zdGFudCBwb29sIG9yIHRyeSB0byBwcm9kdWNlIGEgY29uc3RhbnQgZm9yIGFcbiAgICAgIC8vIHJlZmVyZW5jZSB0byBhIGNvbnN0YW50LlxuICAgICAgcmV0dXJuIGxpdGVyYWw7XG4gICAgfVxuICAgIGNvbnN0IGtleSA9IHRoaXMua2V5T2YobGl0ZXJhbCk7XG4gICAgbGV0IGZpeHVwID0gdGhpcy5saXRlcmFscy5nZXQoa2V5KTtcbiAgICBsZXQgbmV3VmFsdWUgPSBmYWxzZTtcbiAgICBpZiAoIWZpeHVwKSB7XG4gICAgICBmaXh1cCA9IG5ldyBGaXh1cEV4cHJlc3Npb24obGl0ZXJhbCk7XG4gICAgICB0aGlzLmxpdGVyYWxzLnNldChrZXksIGZpeHVwKTtcbiAgICAgIG5ld1ZhbHVlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoKCFuZXdWYWx1ZSAmJiAhZml4dXAuc2hhcmVkKSB8fCAobmV3VmFsdWUgJiYgZm9yY2VTaGFyZWQpKSB7XG4gICAgICAvLyBSZXBsYWNlIHRoZSBleHByZXNzaW9uIHdpdGggYSB2YXJpYWJsZVxuICAgICAgY29uc3QgbmFtZSA9IHRoaXMuZnJlc2hOYW1lKCk7XG4gICAgICB0aGlzLnN0YXRlbWVudHMucHVzaChcbiAgICAgICAgICBvLnZhcmlhYmxlKG5hbWUpLnNldChsaXRlcmFsKS50b0RlY2xTdG10KG8uSU5GRVJSRURfVFlQRSwgW28uU3RtdE1vZGlmaWVyLkZpbmFsXSkpO1xuICAgICAgZml4dXAuZml4dXAoby52YXJpYWJsZShuYW1lKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpeHVwO1xuICB9XG5cbiAgZ2V0RGVmaW5pdGlvbih0eXBlOiBhbnksIGtpbmQ6IERlZmluaXRpb25LaW5kLCBjdHg6IE91dHB1dENvbnRleHQsIGZvcmNlU2hhcmVkOiBib29sZWFuID0gZmFsc2UpOlxuICAgICAgby5FeHByZXNzaW9uIHtcbiAgICBjb25zdCBkZWZpbml0aW9ucyA9IHRoaXMuZGVmaW5pdGlvbnNPZihraW5kKTtcbiAgICBsZXQgZml4dXAgPSBkZWZpbml0aW9ucy5nZXQodHlwZSk7XG4gICAgbGV0IG5ld1ZhbHVlID0gZmFsc2U7XG4gICAgaWYgKCFmaXh1cCkge1xuICAgICAgY29uc3QgcHJvcGVydHkgPSB0aGlzLnByb3BlcnR5TmFtZU9mKGtpbmQpO1xuICAgICAgZml4dXAgPSBuZXcgRml4dXBFeHByZXNzaW9uKGN0eC5pbXBvcnRFeHByKHR5cGUpLnByb3AocHJvcGVydHkpKTtcbiAgICAgIGRlZmluaXRpb25zLnNldCh0eXBlLCBmaXh1cCk7XG4gICAgICBuZXdWYWx1ZSA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKCghbmV3VmFsdWUgJiYgIWZpeHVwLnNoYXJlZCkgfHwgKG5ld1ZhbHVlICYmIGZvcmNlU2hhcmVkKSkge1xuICAgICAgY29uc3QgbmFtZSA9IHRoaXMuZnJlc2hOYW1lKCk7XG4gICAgICB0aGlzLnN0YXRlbWVudHMucHVzaChcbiAgICAgICAgICBvLnZhcmlhYmxlKG5hbWUpLnNldChmaXh1cC5yZXNvbHZlZCkudG9EZWNsU3RtdChvLklORkVSUkVEX1RZUEUsIFtvLlN0bXRNb2RpZmllci5GaW5hbF0pKTtcbiAgICAgIGZpeHVwLmZpeHVwKG8udmFyaWFibGUobmFtZSkpO1xuICAgIH1cbiAgICByZXR1cm4gZml4dXA7XG4gIH1cblxuICBnZXRMaXRlcmFsRmFjdG9yeShsaXRlcmFsOiBvLkxpdGVyYWxBcnJheUV4cHJ8by5MaXRlcmFsTWFwRXhwcik6XG4gICAgICB7bGl0ZXJhbEZhY3Rvcnk6IG8uRXhwcmVzc2lvbiwgbGl0ZXJhbEZhY3RvcnlBcmd1bWVudHM6IG8uRXhwcmVzc2lvbltdfSB7XG4gICAgLy8gQ3JlYXRlIGEgcHVyZSBmdW5jdGlvbiB0aGF0IGJ1aWxkcyBhbiBhcnJheSBvZiBhIG1peCBvZiBjb25zdGFudCAgYW5kIHZhcmlhYmxlIGV4cHJlc3Npb25zXG4gICAgaWYgKGxpdGVyYWwgaW5zdGFuY2VvZiBvLkxpdGVyYWxBcnJheUV4cHIpIHtcbiAgICAgIGNvbnN0IGFyZ3VtZW50c0ZvcktleSA9IGxpdGVyYWwuZW50cmllcy5tYXAoZSA9PiBlLmlzQ29uc3RhbnQoKSA/IGUgOiBvLmxpdGVyYWwobnVsbCkpO1xuICAgICAgY29uc3Qga2V5ID0gdGhpcy5rZXlPZihvLmxpdGVyYWxBcnIoYXJndW1lbnRzRm9yS2V5KSk7XG4gICAgICByZXR1cm4gdGhpcy5fZ2V0TGl0ZXJhbEZhY3Rvcnkoa2V5LCBsaXRlcmFsLmVudHJpZXMsIGVudHJpZXMgPT4gby5saXRlcmFsQXJyKGVudHJpZXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZXhwcmVzc2lvbkZvcktleSA9IG8ubGl0ZXJhbE1hcChcbiAgICAgICAgICBsaXRlcmFsLmVudHJpZXMubWFwKGUgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBlLmtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGUudmFsdWUuaXNDb25zdGFudCgpID8gZS52YWx1ZSA6IG8ubGl0ZXJhbChudWxsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVvdGVkOiBlLnF1b3RlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpKTtcbiAgICAgIGNvbnN0IGtleSA9IHRoaXMua2V5T2YoZXhwcmVzc2lvbkZvcktleSk7XG4gICAgICByZXR1cm4gdGhpcy5fZ2V0TGl0ZXJhbEZhY3RvcnkoXG4gICAgICAgICAga2V5LCBsaXRlcmFsLmVudHJpZXMubWFwKGUgPT4gZS52YWx1ZSksXG4gICAgICAgICAgZW50cmllcyA9PiBvLmxpdGVyYWxNYXAoZW50cmllcy5tYXAoKHZhbHVlLCBpbmRleCkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogbGl0ZXJhbC5lbnRyaWVzW2luZGV4XS5rZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1b3RlZDogbGl0ZXJhbC5lbnRyaWVzW2luZGV4XS5xdW90ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSkpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9nZXRMaXRlcmFsRmFjdG9yeShcbiAgICAgIGtleTogc3RyaW5nLCB2YWx1ZXM6IG8uRXhwcmVzc2lvbltdLCByZXN1bHRNYXA6IChwYXJhbWV0ZXJzOiBvLkV4cHJlc3Npb25bXSkgPT4gby5FeHByZXNzaW9uKTpcbiAgICAgIHtsaXRlcmFsRmFjdG9yeTogby5FeHByZXNzaW9uLCBsaXRlcmFsRmFjdG9yeUFyZ3VtZW50czogby5FeHByZXNzaW9uW119IHtcbiAgICBsZXQgbGl0ZXJhbEZhY3RvcnkgPSB0aGlzLmxpdGVyYWxGYWN0b3JpZXMuZ2V0KGtleSk7XG4gICAgY29uc3QgbGl0ZXJhbEZhY3RvcnlBcmd1bWVudHMgPSB2YWx1ZXMuZmlsdGVyKChlID0+ICFlLmlzQ29uc3RhbnQoKSkpO1xuICAgIGlmICghbGl0ZXJhbEZhY3RvcnkpIHtcbiAgICAgIGNvbnN0IHJlc3VsdEV4cHJlc3Npb25zID0gdmFsdWVzLm1hcChcbiAgICAgICAgICAoZSwgaW5kZXgpID0+IGUuaXNDb25zdGFudCgpID8gdGhpcy5nZXRDb25zdExpdGVyYWwoZSwgdHJ1ZSkgOiBvLnZhcmlhYmxlKGBhJHtpbmRleH1gKSk7XG4gICAgICBjb25zdCBwYXJhbWV0ZXJzID1cbiAgICAgICAgICByZXN1bHRFeHByZXNzaW9ucy5maWx0ZXIoaXNWYXJpYWJsZSkubWFwKGUgPT4gbmV3IG8uRm5QYXJhbShlLm5hbWUgISwgby5EWU5BTUlDX1RZUEUpKTtcbiAgICAgIGNvbnN0IHB1cmVGdW5jdGlvbkRlY2xhcmF0aW9uID1cbiAgICAgICAgICBvLmZuKHBhcmFtZXRlcnMsIFtuZXcgby5SZXR1cm5TdGF0ZW1lbnQocmVzdWx0TWFwKHJlc3VsdEV4cHJlc3Npb25zKSldLCBvLklORkVSUkVEX1RZUEUpO1xuICAgICAgY29uc3QgbmFtZSA9IHRoaXMuZnJlc2hOYW1lKCk7XG4gICAgICB0aGlzLnN0YXRlbWVudHMucHVzaChcbiAgICAgICAgICBvLnZhcmlhYmxlKG5hbWUpLnNldChwdXJlRnVuY3Rpb25EZWNsYXJhdGlvbikudG9EZWNsU3RtdChvLklORkVSUkVEX1RZUEUsIFtcbiAgICAgICAgICAgIG8uU3RtdE1vZGlmaWVyLkZpbmFsXG4gICAgICAgICAgXSkpO1xuICAgICAgbGl0ZXJhbEZhY3RvcnkgPSBvLnZhcmlhYmxlKG5hbWUpO1xuICAgICAgdGhpcy5saXRlcmFsRmFjdG9yaWVzLnNldChrZXksIGxpdGVyYWxGYWN0b3J5KTtcbiAgICB9XG4gICAgcmV0dXJuIHtsaXRlcmFsRmFjdG9yeSwgbGl0ZXJhbEZhY3RvcnlBcmd1bWVudHN9O1xuICB9XG5cbiAgLyoqXG4gICAqIFByb2R1Y2UgYSB1bmlxdWUgbmFtZS5cbiAgICpcbiAgICogVGhlIG5hbWUgbWlnaHQgYmUgdW5pcXVlIGFtb25nIGRpZmZlcmVudCBwcmVmaXhlcyBpZiBhbnkgb2YgdGhlIHByZWZpeGVzIGVuZCBpblxuICAgKiBhIGRpZ2l0IHNvIHRoZSBwcmVmaXggc2hvdWxkIGJlIGEgY29uc3RhbnQgc3RyaW5nIChub3QgYmFzZWQgb24gdXNlciBpbnB1dCkgYW5kXG4gICAqIG11c3Qgbm90IGVuZCBpbiBhIGRpZ2l0LlxuICAgKi9cbiAgdW5pcXVlTmFtZShwcmVmaXg6IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiBgJHtwcmVmaXh9JHt0aGlzLm5leHROYW1lSW5kZXgrK31gOyB9XG5cbiAgcHJpdmF0ZSBkZWZpbml0aW9uc09mKGtpbmQ6IERlZmluaXRpb25LaW5kKTogTWFwPGFueSwgRml4dXBFeHByZXNzaW9uPiB7XG4gICAgc3dpdGNoIChraW5kKSB7XG4gICAgICBjYXNlIERlZmluaXRpb25LaW5kLkNvbXBvbmVudDpcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50RGVmaW5pdGlvbnM7XG4gICAgICBjYXNlIERlZmluaXRpb25LaW5kLkRpcmVjdGl2ZTpcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlyZWN0aXZlRGVmaW5pdGlvbnM7XG4gICAgICBjYXNlIERlZmluaXRpb25LaW5kLkluamVjdG9yOlxuICAgICAgICByZXR1cm4gdGhpcy5pbmplY3RvckRlZmluaXRpb25zO1xuICAgICAgY2FzZSBEZWZpbml0aW9uS2luZC5QaXBlOlxuICAgICAgICByZXR1cm4gdGhpcy5waXBlRGVmaW5pdGlvbnM7XG4gICAgfVxuICAgIGVycm9yKGBVbmtub3duIGRlZmluaXRpb24ga2luZCAke2tpbmR9YCk7XG4gICAgcmV0dXJuIHRoaXMuY29tcG9uZW50RGVmaW5pdGlvbnM7XG4gIH1cblxuICBwdWJsaWMgcHJvcGVydHlOYW1lT2Yoa2luZDogRGVmaW5pdGlvbktpbmQpOiBzdHJpbmcge1xuICAgIHN3aXRjaCAoa2luZCkge1xuICAgICAgY2FzZSBEZWZpbml0aW9uS2luZC5Db21wb25lbnQ6XG4gICAgICAgIHJldHVybiAnbmdDb21wb25lbnREZWYnO1xuICAgICAgY2FzZSBEZWZpbml0aW9uS2luZC5EaXJlY3RpdmU6XG4gICAgICAgIHJldHVybiAnbmdEaXJlY3RpdmVEZWYnO1xuICAgICAgY2FzZSBEZWZpbml0aW9uS2luZC5JbmplY3RvcjpcbiAgICAgICAgcmV0dXJuICduZ0luamVjdG9yRGVmJztcbiAgICAgIGNhc2UgRGVmaW5pdGlvbktpbmQuUGlwZTpcbiAgICAgICAgcmV0dXJuICduZ1BpcGVEZWYnO1xuICAgIH1cbiAgICBlcnJvcihgVW5rbm93biBkZWZpbml0aW9uIGtpbmQgJHtraW5kfWApO1xuICAgIHJldHVybiAnPHVua25vd24+JztcbiAgfVxuXG4gIHByaXZhdGUgZnJlc2hOYW1lKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLnVuaXF1ZU5hbWUoQ09OU1RBTlRfUFJFRklYKTsgfVxuXG4gIHByaXZhdGUga2V5T2YoZXhwcmVzc2lvbjogby5FeHByZXNzaW9uKSB7XG4gICAgcmV0dXJuIGV4cHJlc3Npb24udmlzaXRFeHByZXNzaW9uKG5ldyBLZXlWaXNpdG9yKCksIEtFWV9DT05URVhUKTtcbiAgfVxufVxuXG4vKipcbiAqIFZpc2l0b3IgdXNlZCB0byBkZXRlcm1pbmUgaWYgMiBleHByZXNzaW9ucyBhcmUgZXF1aXZhbGVudCBhbmQgY2FuIGJlIHNoYXJlZCBpbiB0aGVcbiAqIGBDb25zdGFudFBvb2xgLlxuICpcbiAqIFdoZW4gdGhlIGlkIChzdHJpbmcpIGdlbmVyYXRlZCBieSB0aGUgdmlzaXRvciBpcyBlcXVhbCwgZXhwcmVzc2lvbnMgYXJlIGNvbnNpZGVyZWQgZXF1aXZhbGVudC5cbiAqL1xuY2xhc3MgS2V5VmlzaXRvciBpbXBsZW1lbnRzIG8uRXhwcmVzc2lvblZpc2l0b3Ige1xuICB2aXNpdExpdGVyYWxFeHByKGFzdDogby5MaXRlcmFsRXhwcik6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3R5cGVvZiBhc3QudmFsdWUgPT09ICdzdHJpbmcnID8gJ1wiJyArIGFzdC52YWx1ZSArICdcIicgOiBhc3QudmFsdWV9YDtcbiAgfVxuXG4gIHZpc2l0TGl0ZXJhbEFycmF5RXhwcihhc3Q6IG8uTGl0ZXJhbEFycmF5RXhwciwgY29udGV4dDogb2JqZWN0KTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFske2FzdC5lbnRyaWVzLm1hcChlbnRyeSA9PiBlbnRyeS52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCkpLmpvaW4oJywnKX1dYDtcbiAgfVxuXG4gIHZpc2l0TGl0ZXJhbE1hcEV4cHIoYXN0OiBvLkxpdGVyYWxNYXBFeHByLCBjb250ZXh0OiBvYmplY3QpOiBzdHJpbmcge1xuICAgIGNvbnN0IG1hcEtleSA9IChlbnRyeTogby5MaXRlcmFsTWFwRW50cnkpID0+IHtcbiAgICAgIGNvbnN0IHF1b3RlID0gZW50cnkucXVvdGVkID8gJ1wiJyA6ICcnO1xuICAgICAgcmV0dXJuIGAke3F1b3RlfSR7ZW50cnkua2V5fSR7cXVvdGV9YDtcbiAgICB9O1xuICAgIGNvbnN0IG1hcEVudHJ5ID0gKGVudHJ5OiBvLkxpdGVyYWxNYXBFbnRyeSkgPT5cbiAgICAgICAgYCR7bWFwS2V5KGVudHJ5KX06JHtlbnRyeS52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCl9YDtcbiAgICByZXR1cm4gYHske2FzdC5lbnRyaWVzLm1hcChtYXBFbnRyeSkuam9pbignLCcpfWA7XG4gIH1cblxuICB2aXNpdEV4dGVybmFsRXhwcihhc3Q6IG8uRXh0ZXJuYWxFeHByKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYXN0LnZhbHVlLm1vZHVsZU5hbWUgPyBgRVg6JHthc3QudmFsdWUubW9kdWxlTmFtZX06JHthc3QudmFsdWUubmFtZX1gIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgRVg6JHthc3QudmFsdWUucnVudGltZS5uYW1lfWA7XG4gIH1cblxuICB2aXNpdFJlYWRWYXJFeHByKG5vZGU6IG8uUmVhZFZhckV4cHIpIHsgcmV0dXJuIGBWQVI6JHtub2RlLm5hbWV9YDsgfVxuXG4gIHZpc2l0VHlwZW9mRXhwcihub2RlOiBvLlR5cGVvZkV4cHIsIGNvbnRleHQ6IGFueSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBUWVBFT0Y6JHtub2RlLmV4cHIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpfWA7XG4gIH1cblxuICB2aXNpdFdyYXBwZWROb2RlRXhwciA9IGludmFsaWQ7XG4gIHZpc2l0V3JpdGVWYXJFeHByID0gaW52YWxpZDtcbiAgdmlzaXRXcml0ZUtleUV4cHIgPSBpbnZhbGlkO1xuICB2aXNpdFdyaXRlUHJvcEV4cHIgPSBpbnZhbGlkO1xuICB2aXNpdEludm9rZU1ldGhvZEV4cHIgPSBpbnZhbGlkO1xuICB2aXNpdEludm9rZUZ1bmN0aW9uRXhwciA9IGludmFsaWQ7XG4gIHZpc2l0SW5zdGFudGlhdGVFeHByID0gaW52YWxpZDtcbiAgdmlzaXRDb25kaXRpb25hbEV4cHIgPSBpbnZhbGlkO1xuICB2aXNpdE5vdEV4cHIgPSBpbnZhbGlkO1xuICB2aXNpdEFzc2VydE5vdE51bGxFeHByID0gaW52YWxpZDtcbiAgdmlzaXRDYXN0RXhwciA9IGludmFsaWQ7XG4gIHZpc2l0RnVuY3Rpb25FeHByID0gaW52YWxpZDtcbiAgdmlzaXRCaW5hcnlPcGVyYXRvckV4cHIgPSBpbnZhbGlkO1xuICB2aXNpdFJlYWRQcm9wRXhwciA9IGludmFsaWQ7XG4gIHZpc2l0UmVhZEtleUV4cHIgPSBpbnZhbGlkO1xuICB2aXNpdENvbW1hRXhwciA9IGludmFsaWQ7XG59XG5cbmZ1bmN0aW9uIGludmFsaWQ8VD4oYXJnOiBvLkV4cHJlc3Npb24gfCBvLlN0YXRlbWVudCk6IG5ldmVyIHtcbiAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYEludmFsaWQgc3RhdGU6IFZpc2l0b3IgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IGRvZXNuJ3QgaGFuZGxlICR7YXJnLmNvbnN0cnVjdG9yLm5hbWV9YCk7XG59XG5cbmZ1bmN0aW9uIGlzVmFyaWFibGUoZTogby5FeHByZXNzaW9uKTogZSBpcyBvLlJlYWRWYXJFeHByIHtcbiAgcmV0dXJuIGUgaW5zdGFuY2VvZiBvLlJlYWRWYXJFeHByO1xufSJdfQ==