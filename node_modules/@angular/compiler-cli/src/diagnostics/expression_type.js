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
        define("@angular/compiler-cli/src/diagnostics/expression_type", ["require", "exports", "@angular/compiler", "@angular/compiler-cli/src/diagnostics/symbols"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const compiler_1 = require("@angular/compiler");
    const symbols_1 = require("@angular/compiler-cli/src/diagnostics/symbols");
    var DiagnosticKind;
    (function (DiagnosticKind) {
        DiagnosticKind[DiagnosticKind["Error"] = 0] = "Error";
        DiagnosticKind[DiagnosticKind["Warning"] = 1] = "Warning";
    })(DiagnosticKind = exports.DiagnosticKind || (exports.DiagnosticKind = {}));
    class TypeDiagnostic {
        constructor(kind, message, ast) {
            this.kind = kind;
            this.message = message;
            this.ast = ast;
        }
    }
    exports.TypeDiagnostic = TypeDiagnostic;
    // AstType calculatetype of the ast given AST element.
    class AstType {
        constructor(scope, query, context) {
            this.scope = scope;
            this.query = query;
            this.context = context;
        }
        getType(ast) { return ast.visit(this); }
        getDiagnostics(ast) {
            this.diagnostics = [];
            const type = ast.visit(this);
            if (this.context.event && type.callable) {
                this.reportWarning('Unexpected callable expression. Expected a method call', ast);
            }
            return this.diagnostics;
        }
        visitBinary(ast) {
            // Treat undefined and null as other.
            function normalize(kind, other) {
                switch (kind) {
                    case symbols_1.BuiltinType.Undefined:
                    case symbols_1.BuiltinType.Null:
                        return normalize(other, symbols_1.BuiltinType.Other);
                }
                return kind;
            }
            const getType = (ast, operation) => {
                const type = this.getType(ast);
                if (type.nullable) {
                    switch (operation) {
                        case '&&':
                        case '||':
                        case '==':
                        case '!=':
                        case '===':
                        case '!==':
                            // Nullable allowed.
                            break;
                        default:
                            this.reportError(`The expression might be null`, ast);
                            break;
                    }
                    return this.query.getNonNullableType(type);
                }
                return type;
            };
            const leftType = getType(ast.left, ast.operation);
            const rightType = getType(ast.right, ast.operation);
            const leftRawKind = this.query.getTypeKind(leftType);
            const rightRawKind = this.query.getTypeKind(rightType);
            const leftKind = normalize(leftRawKind, rightRawKind);
            const rightKind = normalize(rightRawKind, leftRawKind);
            // The following swtich implements operator typing similar to the
            // type production tables in the TypeScript specification.
            // https://github.com/Microsoft/TypeScript/blob/v1.8.10/doc/spec.md#4.19
            const operKind = leftKind << 8 | rightKind;
            switch (ast.operation) {
                case '*':
                case '/':
                case '%':
                case '-':
                case '<<':
                case '>>':
                case '>>>':
                case '&':
                case '^':
                case '|':
                    switch (operKind) {
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Number:
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.Number:
                            return this.query.getBuiltinType(symbols_1.BuiltinType.Number);
                        default:
                            let errorAst = ast.left;
                            switch (leftKind) {
                                case symbols_1.BuiltinType.Any:
                                case symbols_1.BuiltinType.Number:
                                    errorAst = ast.right;
                                    break;
                            }
                            return this.reportError('Expected a numeric type', errorAst);
                    }
                case '+':
                    switch (operKind) {
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Boolean:
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Number:
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Other:
                        case symbols_1.BuiltinType.Boolean << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Other << 8 | symbols_1.BuiltinType.Any:
                            return this.anyType;
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.String:
                        case symbols_1.BuiltinType.Boolean << 8 | symbols_1.BuiltinType.String:
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.String:
                        case symbols_1.BuiltinType.String << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.String << 8 | symbols_1.BuiltinType.Boolean:
                        case symbols_1.BuiltinType.String << 8 | symbols_1.BuiltinType.Number:
                        case symbols_1.BuiltinType.String << 8 | symbols_1.BuiltinType.String:
                        case symbols_1.BuiltinType.String << 8 | symbols_1.BuiltinType.Other:
                        case symbols_1.BuiltinType.Other << 8 | symbols_1.BuiltinType.String:
                            return this.query.getBuiltinType(symbols_1.BuiltinType.String);
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.Number:
                            return this.query.getBuiltinType(symbols_1.BuiltinType.Number);
                        case symbols_1.BuiltinType.Boolean << 8 | symbols_1.BuiltinType.Number:
                        case symbols_1.BuiltinType.Other << 8 | symbols_1.BuiltinType.Number:
                            return this.reportError('Expected a number type', ast.left);
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.Boolean:
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.Other:
                            return this.reportError('Expected a number type', ast.right);
                        default:
                            return this.reportError('Expected operands to be a string or number type', ast);
                    }
                case '>':
                case '<':
                case '<=':
                case '>=':
                case '==':
                case '!=':
                case '===':
                case '!==':
                    switch (operKind) {
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Boolean:
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Number:
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.String:
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Other:
                        case symbols_1.BuiltinType.Boolean << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Boolean << 8 | symbols_1.BuiltinType.Boolean:
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.Number:
                        case symbols_1.BuiltinType.String << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.String << 8 | symbols_1.BuiltinType.String:
                        case symbols_1.BuiltinType.Other << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Other << 8 | symbols_1.BuiltinType.Other:
                            return this.query.getBuiltinType(symbols_1.BuiltinType.Boolean);
                        default:
                            return this.reportError('Expected the operants to be of similar type or any', ast);
                    }
                case '&&':
                    return rightType;
                case '||':
                    return this.query.getTypeUnion(leftType, rightType);
            }
            return this.reportError(`Unrecognized operator ${ast.operation}`, ast);
        }
        visitChain(ast) {
            if (this.diagnostics) {
                // If we are producing diagnostics, visit the children
                compiler_1.visitAstChildren(ast, this);
            }
            // The type of a chain is always undefined.
            return this.query.getBuiltinType(symbols_1.BuiltinType.Undefined);
        }
        visitConditional(ast) {
            // The type of a conditional is the union of the true and false conditions.
            if (this.diagnostics) {
                compiler_1.visitAstChildren(ast, this);
            }
            return this.query.getTypeUnion(this.getType(ast.trueExp), this.getType(ast.falseExp));
        }
        visitFunctionCall(ast) {
            // The type of a function call is the return type of the selected signature.
            // The signature is selected based on the types of the arguments. Angular doesn't
            // support contextual typing of arguments so this is simpler than TypeScript's
            // version.
            const args = ast.args.map(arg => this.getType(arg));
            const target = this.getType(ast.target);
            if (!target || !target.callable)
                return this.reportError('Call target is not callable', ast);
            const signature = target.selectSignature(args);
            if (signature)
                return signature.result;
            // TODO: Consider a better error message here.
            return this.reportError('Unable no compatible signature found for call', ast);
        }
        visitImplicitReceiver(ast) {
            const _this = this;
            // Return a pseudo-symbol for the implicit receiver.
            // The members of the implicit receiver are what is defined by the
            // scope passed into this class.
            return {
                name: '$implict',
                kind: 'component',
                language: 'ng-template',
                type: undefined,
                container: undefined,
                callable: false,
                nullable: false,
                public: true,
                definition: undefined,
                members() { return _this.scope; },
                signatures() { return []; },
                selectSignature(types) { return undefined; },
                indexed(argument) { return undefined; }
            };
        }
        visitInterpolation(ast) {
            // If we are producing diagnostics, visit the children.
            if (this.diagnostics) {
                compiler_1.visitAstChildren(ast, this);
            }
            return this.undefinedType;
        }
        visitKeyedRead(ast) {
            const targetType = this.getType(ast.obj);
            const keyType = this.getType(ast.key);
            const result = targetType.indexed(keyType);
            return result || this.anyType;
        }
        visitKeyedWrite(ast) {
            // The write of a type is the type of the value being written.
            return this.getType(ast.value);
        }
        visitLiteralArray(ast) {
            // A type literal is an array type of the union of the elements
            return this.query.getArrayType(this.query.getTypeUnion(...ast.expressions.map(element => this.getType(element))));
        }
        visitLiteralMap(ast) {
            // If we are producing diagnostics, visit the children
            if (this.diagnostics) {
                compiler_1.visitAstChildren(ast, this);
            }
            // TODO: Return a composite type.
            return this.anyType;
        }
        visitLiteralPrimitive(ast) {
            // The type of a literal primitive depends on the value of the literal.
            switch (ast.value) {
                case true:
                case false:
                    return this.query.getBuiltinType(symbols_1.BuiltinType.Boolean);
                case null:
                    return this.query.getBuiltinType(symbols_1.BuiltinType.Null);
                case undefined:
                    return this.query.getBuiltinType(symbols_1.BuiltinType.Undefined);
                default:
                    switch (typeof ast.value) {
                        case 'string':
                            return this.query.getBuiltinType(symbols_1.BuiltinType.String);
                        case 'number':
                            return this.query.getBuiltinType(symbols_1.BuiltinType.Number);
                        default:
                            return this.reportError('Unrecognized primitive', ast);
                    }
            }
        }
        visitMethodCall(ast) {
            return this.resolveMethodCall(this.getType(ast.receiver), ast);
        }
        visitPipe(ast) {
            // The type of a pipe node is the return type of the pipe's transform method. The table returned
            // by getPipes() is expected to contain symbols with the corresponding transform method type.
            const pipe = this.query.getPipes().get(ast.name);
            if (!pipe)
                return this.reportError(`No pipe by the name ${ast.name} found`, ast);
            const expType = this.getType(ast.exp);
            const signature = pipe.selectSignature([expType].concat(ast.args.map(arg => this.getType(arg))));
            if (!signature)
                return this.reportError('Unable to resolve signature for pipe invocation', ast);
            return signature.result;
        }
        visitPrefixNot(ast) {
            // The type of a prefix ! is always boolean.
            return this.query.getBuiltinType(symbols_1.BuiltinType.Boolean);
        }
        visitNonNullAssert(ast) {
            const expressionType = this.getType(ast.expression);
            return this.query.getNonNullableType(expressionType);
        }
        visitPropertyRead(ast) {
            return this.resolvePropertyRead(this.getType(ast.receiver), ast);
        }
        visitPropertyWrite(ast) {
            // The type of a write is the type of the value being written.
            return this.getType(ast.value);
        }
        visitQuote(ast) {
            // The type of a quoted expression is any.
            return this.query.getBuiltinType(symbols_1.BuiltinType.Any);
        }
        visitSafeMethodCall(ast) {
            return this.resolveMethodCall(this.query.getNonNullableType(this.getType(ast.receiver)), ast);
        }
        visitSafePropertyRead(ast) {
            return this.resolvePropertyRead(this.query.getNonNullableType(this.getType(ast.receiver)), ast);
        }
        get anyType() {
            let result = this._anyType;
            if (!result) {
                result = this._anyType = this.query.getBuiltinType(symbols_1.BuiltinType.Any);
            }
            return result;
        }
        get undefinedType() {
            let result = this._undefinedType;
            if (!result) {
                result = this._undefinedType = this.query.getBuiltinType(symbols_1.BuiltinType.Undefined);
            }
            return result;
        }
        resolveMethodCall(receiverType, ast) {
            if (this.isAny(receiverType)) {
                return this.anyType;
            }
            // The type of a method is the selected methods result type.
            const method = receiverType.members().get(ast.name);
            if (!method)
                return this.reportError(`Unknown method '${ast.name}'`, ast);
            if (!method.type)
                return this.reportError(`Could not find a type for '${ast.name}'`, ast);
            if (!method.type.callable)
                return this.reportError(`Member '${ast.name}' is not callable`, ast);
            const signature = method.type.selectSignature(ast.args.map(arg => this.getType(arg)));
            if (!signature)
                return this.reportError(`Unable to resolve signature for call of method ${ast.name}`, ast);
            return signature.result;
        }
        resolvePropertyRead(receiverType, ast) {
            if (this.isAny(receiverType)) {
                return this.anyType;
            }
            // The type of a property read is the seelcted member's type.
            const member = receiverType.members().get(ast.name);
            if (!member) {
                let receiverInfo = receiverType.name;
                if (receiverInfo == '$implict') {
                    receiverInfo =
                        'The component declaration, template variable declarations, and element references do';
                }
                else if (receiverType.nullable) {
                    return this.reportError(`The expression might be null`, ast.receiver);
                }
                else {
                    receiverInfo = `'${receiverInfo}' does`;
                }
                return this.reportError(`Identifier '${ast.name}' is not defined. ${receiverInfo} not contain such a member`, ast);
            }
            if (!member.public) {
                let receiverInfo = receiverType.name;
                if (receiverInfo == '$implict') {
                    receiverInfo = 'the component';
                }
                else {
                    receiverInfo = `'${receiverInfo}'`;
                }
                this.reportWarning(`Identifier '${ast.name}' refers to a private member of ${receiverInfo}`, ast);
            }
            return member.type;
        }
        reportError(message, ast) {
            if (this.diagnostics) {
                this.diagnostics.push(new TypeDiagnostic(DiagnosticKind.Error, message, ast));
            }
            return this.anyType;
        }
        reportWarning(message, ast) {
            if (this.diagnostics) {
                this.diagnostics.push(new TypeDiagnostic(DiagnosticKind.Warning, message, ast));
            }
            return this.anyType;
        }
        isAny(symbol) {
            return !symbol || this.query.getTypeKind(symbol) == symbols_1.BuiltinType.Any ||
                (!!symbol.type && this.isAny(symbol.type));
        }
    }
    exports.AstType = AstType;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwcmVzc2lvbl90eXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9kaWFnbm9zdGljcy9leHByZXNzaW9uX3R5cGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSCxnREFBMlU7SUFFM1UsMkVBQXlGO0lBSXpGLElBQVksY0FHWDtJQUhELFdBQVksY0FBYztRQUN4QixxREFBSyxDQUFBO1FBQ0wseURBQU8sQ0FBQTtJQUNULENBQUMsRUFIVyxjQUFjLEdBQWQsc0JBQWMsS0FBZCxzQkFBYyxRQUd6QjtJQUVELE1BQWEsY0FBYztRQUN6QixZQUFtQixJQUFvQixFQUFTLE9BQWUsRUFBUyxHQUFRO1lBQTdELFNBQUksR0FBSixJQUFJLENBQWdCO1lBQVMsWUFBTyxHQUFQLE9BQU8sQ0FBUTtZQUFTLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFBRyxDQUFDO0tBQ3JGO0lBRkQsd0NBRUM7SUFFRCxzREFBc0Q7SUFDdEQsTUFBYSxPQUFPO1FBSWxCLFlBQ1ksS0FBa0IsRUFBVSxLQUFrQixFQUM5QyxPQUFxQztZQURyQyxVQUFLLEdBQUwsS0FBSyxDQUFhO1lBQVUsVUFBSyxHQUFMLEtBQUssQ0FBYTtZQUM5QyxZQUFPLEdBQVAsT0FBTyxDQUE4QjtRQUFHLENBQUM7UUFFckQsT0FBTyxDQUFDLEdBQVEsSUFBWSxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXJELGNBQWMsQ0FBQyxHQUFRO1lBQ3JCLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1lBQ3RCLE1BQU0sSUFBSSxHQUFXLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO2dC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QUMsTUFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLHFCQUFXLENBQUMsR0FBRztnQkFDL0QsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2pELENBQUM7S0FDRjtJQWpaRCwwQkFpWkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QVNULCBBc3RWaXNpdG9yLCBCaW5hcnksIEJpbmRpbmdQaXBlLCBDaGFpbiwgQ29uZGl0aW9uYWwsIEZ1bmN0aW9uQ2FsbCwgSW1wbGljaXRSZWNlaXZlciwgSW50ZXJwb2xhdGlvbiwgS2V5ZWRSZWFkLCBLZXllZFdyaXRlLCBMaXRlcmFsQXJyYXksIExpdGVyYWxNYXAsIExpdGVyYWxQcmltaXRpdmUsIE1ldGhvZENhbGwsIE5vbk51bGxBc3NlcnQsIFByZWZpeE5vdCwgUHJvcGVydHlSZWFkLCBQcm9wZXJ0eVdyaXRlLCBRdW90ZSwgU2FmZU1ldGhvZENhbGwsIFNhZmVQcm9wZXJ0eVJlYWQsIHZpc2l0QXN0Q2hpbGRyZW59IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcblxuaW1wb3J0IHtCdWlsdGluVHlwZSwgU2lnbmF0dXJlLCBTcGFuLCBTeW1ib2wsIFN5bWJvbFF1ZXJ5LCBTeW1ib2xUYWJsZX0gZnJvbSAnLi9zeW1ib2xzJztcblxuZXhwb3J0IGludGVyZmFjZSBFeHByZXNzaW9uRGlhZ25vc3RpY3NDb250ZXh0IHsgZXZlbnQ/OiBib29sZWFuOyB9XG5cbmV4cG9ydCBlbnVtIERpYWdub3N0aWNLaW5kIHtcbiAgRXJyb3IsXG4gIFdhcm5pbmcsXG59XG5cbmV4cG9ydCBjbGFzcyBUeXBlRGlhZ25vc3RpYyB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBraW5kOiBEaWFnbm9zdGljS2luZCwgcHVibGljIG1lc3NhZ2U6IHN0cmluZywgcHVibGljIGFzdDogQVNUKSB7fVxufVxuXG4vLyBBc3RUeXBlIGNhbGN1bGF0ZXR5cGUgb2YgdGhlIGFzdCBnaXZlbiBBU1QgZWxlbWVudC5cbmV4cG9ydCBjbGFzcyBBc3RUeXBlIGltcGxlbWVudHMgQXN0VmlzaXRvciB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwdWJsaWMgZGlhZ25vc3RpY3MgITogVHlwZURpYWdub3N0aWNbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgc2NvcGU6IFN5bWJvbFRhYmxlLCBwcml2YXRlIHF1ZXJ5OiBTeW1ib2xRdWVyeSxcbiAgICAgIHByaXZhdGUgY29udGV4dDogRXhwcmVzc2lvbkRpYWdub3N0aWNzQ29udGV4dCkge31cblxuICBnZXRUeXBlKGFzdDogQVNUKTogU3ltYm9sIHsgcmV0dXJuIGFzdC52aXNpdCh0aGlzKTsgfVxuXG4gIGdldERpYWdub3N0aWNzKGFzdDogQVNUKTogVHlwZURpYWdub3N0aWNbXSB7XG4gICAgdGhpcy5kaWFnbm9zdGljcyA9IFtdO1xuICAgIGNvbnN0IHR5cGU6IFN5bWJvbCA9IGFzdC52aXNpdCh0aGlzKTtcbiAgICBpZiAodGhpcy5jb250ZXh0LmV2ZW50ICYmIHR5cGUuY2FsbGFibGUpIHtcbiAgICAgIHRoaXMucmVwb3J0V2FybmluZygnVW5leHBlY3RlZCBjYWxsYWJsZSBleHByZXNzaW9uLiBFeHBlY3RlZCBhIG1ldGhvZCBjYWxsJywgYXN0KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZGlhZ25vc3RpY3M7XG4gIH1cblxuICB2aXNpdEJpbmFyeShhc3Q6IEJpbmFyeSk6IFN5bWJvbCB7XG4gICAgLy8gVHJlYXQgdW5kZWZpbmVkIGFuZCBudWxsIGFzIG90aGVyLlxuICAgIGZ1bmN0aW9uIG5vcm1hbGl6ZShraW5kOiBCdWlsdGluVHlwZSwgb3RoZXI6IEJ1aWx0aW5UeXBlKTogQnVpbHRpblR5cGUge1xuICAgICAgc3dpdGNoIChraW5kKSB7XG4gICAgICAgIGNhc2UgQnVpbHRpblR5cGUuVW5kZWZpbmVkOlxuICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLk51bGw6XG4gICAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZShvdGhlciwgQnVpbHRpblR5cGUuT3RoZXIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGtpbmQ7XG4gICAgfVxuXG4gICAgY29uc3QgZ2V0VHlwZSA9IChhc3Q6IEFTVCwgb3BlcmF0aW9uOiBzdHJpbmcpOiBTeW1ib2wgPT4ge1xuICAgICAgY29uc3QgdHlwZSA9IHRoaXMuZ2V0VHlwZShhc3QpO1xuICAgICAgaWYgKHR5cGUubnVsbGFibGUpIHtcbiAgICAgICAgc3dpdGNoIChvcGVyYXRpb24pIHtcbiAgICAgICAgICBjYXNlICcmJic6XG4gICAgICAgICAgY2FzZSAnfHwnOlxuICAgICAgICAgIGNhc2UgJz09JzpcbiAgICAgICAgICBjYXNlICchPSc6XG4gICAgICAgICAgY2FzZSAnPT09JzpcbiAgICAgICAgICBjYXNlICchPT0nOlxuICAgICAgICAgICAgLy8gTnVsbGFibGUgYWxsb3dlZC5cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aGlzLnJlcG9ydEVycm9yKGBUaGUgZXhwcmVzc2lvbiBtaWdodCBiZSBudWxsYCwgYXN0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5LmdldE5vbk51bGxhYmxlVHlwZSh0eXBlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0eXBlO1xuICAgIH07XG5cbiAgICBjb25zdCBsZWZ0VHlwZSA9IGdldFR5cGUoYXN0LmxlZnQsIGFzdC5vcGVyYXRpb24pO1xuICAgIGNvbnN0IHJpZ2h0VHlwZSA9IGdldFR5cGUoYXN0LnJpZ2h0LCBhc3Qub3BlcmF0aW9uKTtcbiAgICBjb25zdCBsZWZ0UmF3S2luZCA9IHRoaXMucXVlcnkuZ2V0VHlwZUtpbmQobGVmdFR5cGUpO1xuICAgIGNvbnN0IHJpZ2h0UmF3S2luZCA9IHRoaXMucXVlcnkuZ2V0VHlwZUtpbmQocmlnaHRUeXBlKTtcbiAgICBjb25zdCBsZWZ0S2luZCA9IG5vcm1hbGl6ZShsZWZ0UmF3S2luZCwgcmlnaHRSYXdLaW5kKTtcbiAgICBjb25zdCByaWdodEtpbmQgPSBub3JtYWxpemUocmlnaHRSYXdLaW5kLCBsZWZ0UmF3S2luZCk7XG5cbiAgICAvLyBUaGUgZm9sbG93aW5nIHN3dGljaCBpbXBsZW1lbnRzIG9wZXJhdG9yIHR5cGluZyBzaW1pbGFyIHRvIHRoZVxuICAgIC8vIHR5cGUgcHJvZHVjdGlvbiB0YWJsZXMgaW4gdGhlIFR5cGVTY3JpcHQgc3BlY2lmaWNhdGlvbi5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvYmxvYi92MS44LjEwL2RvYy9zcGVjLm1kIzQuMTlcbiAgICBjb25zdCBvcGVyS2luZCA9IGxlZnRLaW5kIDw8IDggfCByaWdodEtpbmQ7XG4gICAgc3dpdGNoIChhc3Qub3BlcmF0aW9uKSB7XG4gICAgICBjYXNlICcqJzpcbiAgICAgIGNhc2UgJy8nOlxuICAgICAgY2FzZSAnJSc6XG4gICAgICBjYXNlICctJzpcbiAgICAgIGNhc2UgJzw8JzpcbiAgICAgIGNhc2UgJz4+JzpcbiAgICAgIGNhc2UgJz4+Pic6XG4gICAgICBjYXNlICcmJzpcbiAgICAgIGNhc2UgJ14nOlxuICAgICAgY2FzZSAnfCc6XG4gICAgICAgIHN3aXRjaCAob3BlcktpbmQpIHtcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLkFueSA8PCA4IHwgQnVpbHRpblR5cGUuQW55OlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuTnVtYmVyIDw8IDggfCBCdWlsdGluVHlwZS5Bbnk6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5BbnkgPDwgOCB8IEJ1aWx0aW5UeXBlLk51bWJlcjpcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLk51bWJlciA8PCA4IHwgQnVpbHRpblR5cGUuTnVtYmVyOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucXVlcnkuZ2V0QnVpbHRpblR5cGUoQnVpbHRpblR5cGUuTnVtYmVyKTtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGV0IGVycm9yQXN0ID0gYXN0LmxlZnQ7XG4gICAgICAgICAgICBzd2l0Y2ggKGxlZnRLaW5kKSB7XG4gICAgICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuQW55OlxuICAgICAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLk51bWJlcjpcbiAgICAgICAgICAgICAgICBlcnJvckFzdCA9IGFzdC5yaWdodDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlcG9ydEVycm9yKCdFeHBlY3RlZCBhIG51bWVyaWMgdHlwZScsIGVycm9yQXN0KTtcbiAgICAgICAgfVxuICAgICAgY2FzZSAnKyc6XG4gICAgICAgIHN3aXRjaCAob3BlcktpbmQpIHtcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLkFueSA8PCA4IHwgQnVpbHRpblR5cGUuQW55OlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuQW55IDw8IDggfCBCdWlsdGluVHlwZS5Cb29sZWFuOlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuQW55IDw8IDggfCBCdWlsdGluVHlwZS5OdW1iZXI6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5BbnkgPDwgOCB8IEJ1aWx0aW5UeXBlLk90aGVyOlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuQm9vbGVhbiA8PCA4IHwgQnVpbHRpblR5cGUuQW55OlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuTnVtYmVyIDw8IDggfCBCdWlsdGluVHlwZS5Bbnk6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5PdGhlciA8PCA4IHwgQnVpbHRpblR5cGUuQW55OlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYW55VHlwZTtcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLkFueSA8PCA4IHwgQnVpbHRpblR5cGUuU3RyaW5nOlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuQm9vbGVhbiA8PCA4IHwgQnVpbHRpblR5cGUuU3RyaW5nOlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuTnVtYmVyIDw8IDggfCBCdWlsdGluVHlwZS5TdHJpbmc6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5TdHJpbmcgPDwgOCB8IEJ1aWx0aW5UeXBlLkFueTpcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLlN0cmluZyA8PCA4IHwgQnVpbHRpblR5cGUuQm9vbGVhbjpcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLlN0cmluZyA8PCA4IHwgQnVpbHRpblR5cGUuTnVtYmVyOlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuU3RyaW5nIDw8IDggfCBCdWlsdGluVHlwZS5TdHJpbmc6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5TdHJpbmcgPDwgOCB8IEJ1aWx0aW5UeXBlLk90aGVyOlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuT3RoZXIgPDwgOCB8IEJ1aWx0aW5UeXBlLlN0cmluZzpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5LmdldEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlLlN0cmluZyk7XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5OdW1iZXIgPDwgOCB8IEJ1aWx0aW5UeXBlLk51bWJlcjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5LmdldEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlLk51bWJlcik7XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5Cb29sZWFuIDw8IDggfCBCdWlsdGluVHlwZS5OdW1iZXI6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5PdGhlciA8PCA4IHwgQnVpbHRpblR5cGUuTnVtYmVyOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVwb3J0RXJyb3IoJ0V4cGVjdGVkIGEgbnVtYmVyIHR5cGUnLCBhc3QubGVmdCk7XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5OdW1iZXIgPDwgOCB8IEJ1aWx0aW5UeXBlLkJvb2xlYW46XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5OdW1iZXIgPDwgOCB8IEJ1aWx0aW5UeXBlLk90aGVyOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVwb3J0RXJyb3IoJ0V4cGVjdGVkIGEgbnVtYmVyIHR5cGUnLCBhc3QucmlnaHQpO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXBvcnRFcnJvcignRXhwZWN0ZWQgb3BlcmFuZHMgdG8gYmUgYSBzdHJpbmcgb3IgbnVtYmVyIHR5cGUnLCBhc3QpO1xuICAgICAgICB9XG4gICAgICBjYXNlICc+JzpcbiAgICAgIGNhc2UgJzwnOlxuICAgICAgY2FzZSAnPD0nOlxuICAgICAgY2FzZSAnPj0nOlxuICAgICAgY2FzZSAnPT0nOlxuICAgICAgY2FzZSAnIT0nOlxuICAgICAgY2FzZSAnPT09JzpcbiAgICAgIGNhc2UgJyE9PSc6XG4gICAgICAgIHN3aXRjaCAob3BlcktpbmQpIHtcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLkFueSA8PCA4IHwgQnVpbHRpblR5cGUuQW55OlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuQW55IDw8IDggfCBCdWlsdGluVHlwZS5Cb29sZWFuOlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuQW55IDw8IDggfCBCdWlsdGluVHlwZS5OdW1iZXI6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5BbnkgPDwgOCB8IEJ1aWx0aW5UeXBlLlN0cmluZzpcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLkFueSA8PCA4IHwgQnVpbHRpblR5cGUuT3RoZXI6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5Cb29sZWFuIDw8IDggfCBCdWlsdGluVHlwZS5Bbnk6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5Cb29sZWFuIDw8IDggfCBCdWlsdGluVHlwZS5Cb29sZWFuOlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuTnVtYmVyIDw8IDggfCBCdWlsdGluVHlwZS5Bbnk6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5OdW1iZXIgPDwgOCB8IEJ1aWx0aW5UeXBlLk51bWJlcjpcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLlN0cmluZyA8PCA4IHwgQnVpbHRpblR5cGUuQW55OlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuU3RyaW5nIDw8IDggfCBCdWlsdGluVHlwZS5TdHJpbmc6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5PdGhlciA8PCA4IHwgQnVpbHRpblR5cGUuQW55OlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuT3RoZXIgPDwgOCB8IEJ1aWx0aW5UeXBlLk90aGVyOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucXVlcnkuZ2V0QnVpbHRpblR5cGUoQnVpbHRpblR5cGUuQm9vbGVhbik7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlcG9ydEVycm9yKCdFeHBlY3RlZCB0aGUgb3BlcmFudHMgdG8gYmUgb2Ygc2ltaWxhciB0eXBlIG9yIGFueScsIGFzdCk7XG4gICAgICAgIH1cbiAgICAgIGNhc2UgJyYmJzpcbiAgICAgICAgcmV0dXJuIHJpZ2h0VHlwZTtcbiAgICAgIGNhc2UgJ3x8JzpcbiAgICAgICAgcmV0dXJuIHRoaXMucXVlcnkuZ2V0VHlwZVVuaW9uKGxlZnRUeXBlLCByaWdodFR5cGUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnJlcG9ydEVycm9yKGBVbnJlY29nbml6ZWQgb3BlcmF0b3IgJHthc3Qub3BlcmF0aW9ufWAsIGFzdCk7XG4gIH1cblxuICB2aXNpdENoYWluKGFzdDogQ2hhaW4pIHtcbiAgICBpZiAodGhpcy5kaWFnbm9zdGljcykge1xuICAgICAgLy8gSWYgd2UgYXJlIHByb2R1Y2luZyBkaWFnbm9zdGljcywgdmlzaXQgdGhlIGNoaWxkcmVuXG4gICAgICB2aXNpdEFzdENoaWxkcmVuKGFzdCwgdGhpcyk7XG4gICAgfVxuICAgIC8vIFRoZSB0eXBlIG9mIGEgY2hhaW4gaXMgYWx3YXlzIHVuZGVmaW5lZC5cbiAgICByZXR1cm4gdGhpcy5xdWVyeS5nZXRCdWlsdGluVHlwZShCdWlsdGluVHlwZS5VbmRlZmluZWQpO1xuICB9XG5cbiAgdmlzaXRDb25kaXRpb25hbChhc3Q6IENvbmRpdGlvbmFsKSB7XG4gICAgLy8gVGhlIHR5cGUgb2YgYSBjb25kaXRpb25hbCBpcyB0aGUgdW5pb24gb2YgdGhlIHRydWUgYW5kIGZhbHNlIGNvbmRpdGlvbnMuXG4gICAgaWYgKHRoaXMuZGlhZ25vc3RpY3MpIHtcbiAgICAgIHZpc2l0QXN0Q2hpbGRyZW4oYXN0LCB0aGlzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucXVlcnkuZ2V0VHlwZVVuaW9uKHRoaXMuZ2V0VHlwZShhc3QudHJ1ZUV4cCksIHRoaXMuZ2V0VHlwZShhc3QuZmFsc2VFeHApKTtcbiAgfVxuXG4gIHZpc2l0RnVuY3Rpb25DYWxsKGFzdDogRnVuY3Rpb25DYWxsKSB7XG4gICAgLy8gVGhlIHR5cGUgb2YgYSBmdW5jdGlvbiBjYWxsIGlzIHRoZSByZXR1cm4gdHlwZSBvZiB0aGUgc2VsZWN0ZWQgc2lnbmF0dXJlLlxuICAgIC8vIFRoZSBzaWduYXR1cmUgaXMgc2VsZWN0ZWQgYmFzZWQgb24gdGhlIHR5cGVzIG9mIHRoZSBhcmd1bWVudHMuIEFuZ3VsYXIgZG9lc24ndFxuICAgIC8vIHN1cHBvcnQgY29udGV4dHVhbCB0eXBpbmcgb2YgYXJndW1lbnRzIHNvIHRoaXMgaXMgc2ltcGxlciB0aGFuIFR5cGVTY3JpcHQnc1xuICAgIC8vIHZlcnNpb24uXG4gICAgY29uc3QgYXJncyA9IGFzdC5hcmdzLm1hcChhcmcgPT4gdGhpcy5nZXRUeXBlKGFyZykpO1xuICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuZ2V0VHlwZShhc3QudGFyZ2V0ICEpO1xuICAgIGlmICghdGFyZ2V0IHx8ICF0YXJnZXQuY2FsbGFibGUpIHJldHVybiB0aGlzLnJlcG9ydEVycm9yKCdDYWxsIHRhcmdldCBpcyBub3QgY2FsbGFibGUnLCBhc3QpO1xuICAgIGNvbnN0IHNpZ25hdHVyZSA9IHRhcmdldC5zZWxlY3RTaWduYXR1cmUoYXJncyk7XG4gICAgaWYgKHNpZ25hdHVyZSkgcmV0dXJuIHNpZ25hdHVyZS5yZXN1bHQ7XG4gICAgLy8gVE9ETzogQ29uc2lkZXIgYSBiZXR0ZXIgZXJyb3IgbWVzc2FnZSBoZXJlLlxuICAgIHJldHVybiB0aGlzLnJlcG9ydEVycm9yKCdVbmFibGUgbm8gY29tcGF0aWJsZSBzaWduYXR1cmUgZm91bmQgZm9yIGNhbGwnLCBhc3QpO1xuICB9XG5cbiAgdmlzaXRJbXBsaWNpdFJlY2VpdmVyKGFzdDogSW1wbGljaXRSZWNlaXZlcik6IFN5bWJvbCB7XG4gICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgIC8vIFJldHVybiBhIHBzZXVkby1zeW1ib2wgZm9yIHRoZSBpbXBsaWNpdCByZWNlaXZlci5cbiAgICAvLyBUaGUgbWVtYmVycyBvZiB0aGUgaW1wbGljaXQgcmVjZWl2ZXIgYXJlIHdoYXQgaXMgZGVmaW5lZCBieSB0aGVcbiAgICAvLyBzY29wZSBwYXNzZWQgaW50byB0aGlzIGNsYXNzLlxuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAnJGltcGxpY3QnLFxuICAgICAga2luZDogJ2NvbXBvbmVudCcsXG4gICAgICBsYW5ndWFnZTogJ25nLXRlbXBsYXRlJyxcbiAgICAgIHR5cGU6IHVuZGVmaW5lZCxcbiAgICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgICAgY2FsbGFibGU6IGZhbHNlLFxuICAgICAgbnVsbGFibGU6IGZhbHNlLFxuICAgICAgcHVibGljOiB0cnVlLFxuICAgICAgZGVmaW5pdGlvbjogdW5kZWZpbmVkLFxuICAgICAgbWVtYmVycygpOiBTeW1ib2xUYWJsZXtyZXR1cm4gX3RoaXMuc2NvcGU7fSxcbiAgICAgIHNpZ25hdHVyZXMoKTogU2lnbmF0dXJlW117cmV0dXJuIFtdO30sXG4gICAgICBzZWxlY3RTaWduYXR1cmUodHlwZXMpOiBTaWduYXR1cmUgfCB1bmRlZmluZWR7cmV0dXJuIHVuZGVmaW5lZDt9LFxuICAgICAgaW5kZXhlZChhcmd1bWVudCk6IFN5bWJvbCB8IHVuZGVmaW5lZHtyZXR1cm4gdW5kZWZpbmVkO31cbiAgICB9O1xuICB9XG5cbiAgdmlzaXRJbnRlcnBvbGF0aW9uKGFzdDogSW50ZXJwb2xhdGlvbik6IFN5bWJvbCB7XG4gICAgLy8gSWYgd2UgYXJlIHByb2R1Y2luZyBkaWFnbm9zdGljcywgdmlzaXQgdGhlIGNoaWxkcmVuLlxuICAgIGlmICh0aGlzLmRpYWdub3N0aWNzKSB7XG4gICAgICB2aXNpdEFzdENoaWxkcmVuKGFzdCwgdGhpcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnVuZGVmaW5lZFR5cGU7XG4gIH1cblxuICB2aXNpdEtleWVkUmVhZChhc3Q6IEtleWVkUmVhZCk6IFN5bWJvbCB7XG4gICAgY29uc3QgdGFyZ2V0VHlwZSA9IHRoaXMuZ2V0VHlwZShhc3Qub2JqKTtcbiAgICBjb25zdCBrZXlUeXBlID0gdGhpcy5nZXRUeXBlKGFzdC5rZXkpO1xuICAgIGNvbnN0IHJlc3VsdCA9IHRhcmdldFR5cGUuaW5kZXhlZChrZXlUeXBlKTtcbiAgICByZXR1cm4gcmVzdWx0IHx8IHRoaXMuYW55VHlwZTtcbiAgfVxuXG4gIHZpc2l0S2V5ZWRXcml0ZShhc3Q6IEtleWVkV3JpdGUpOiBTeW1ib2wge1xuICAgIC8vIFRoZSB3cml0ZSBvZiBhIHR5cGUgaXMgdGhlIHR5cGUgb2YgdGhlIHZhbHVlIGJlaW5nIHdyaXR0ZW4uXG4gICAgcmV0dXJuIHRoaXMuZ2V0VHlwZShhc3QudmFsdWUpO1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsQXJyYXkoYXN0OiBMaXRlcmFsQXJyYXkpOiBTeW1ib2wge1xuICAgIC8vIEEgdHlwZSBsaXRlcmFsIGlzIGFuIGFycmF5IHR5cGUgb2YgdGhlIHVuaW9uIG9mIHRoZSBlbGVtZW50c1xuICAgIHJldHVybiB0aGlzLnF1ZXJ5LmdldEFycmF5VHlwZShcbiAgICAgICAgdGhpcy5xdWVyeS5nZXRUeXBlVW5pb24oLi4uYXN0LmV4cHJlc3Npb25zLm1hcChlbGVtZW50ID0+IHRoaXMuZ2V0VHlwZShlbGVtZW50KSkpKTtcbiAgfVxuXG4gIHZpc2l0TGl0ZXJhbE1hcChhc3Q6IExpdGVyYWxNYXApOiBTeW1ib2wge1xuICAgIC8vIElmIHdlIGFyZSBwcm9kdWNpbmcgZGlhZ25vc3RpY3MsIHZpc2l0IHRoZSBjaGlsZHJlblxuICAgIGlmICh0aGlzLmRpYWdub3N0aWNzKSB7XG4gICAgICB2aXNpdEFzdENoaWxkcmVuKGFzdCwgdGhpcyk7XG4gICAgfVxuICAgIC8vIFRPRE86IFJldHVybiBhIGNvbXBvc2l0ZSB0eXBlLlxuICAgIHJldHVybiB0aGlzLmFueVR5cGU7XG4gIH1cblxuICB2aXNpdExpdGVyYWxQcmltaXRpdmUoYXN0OiBMaXRlcmFsUHJpbWl0aXZlKSB7XG4gICAgLy8gVGhlIHR5cGUgb2YgYSBsaXRlcmFsIHByaW1pdGl2ZSBkZXBlbmRzIG9uIHRoZSB2YWx1ZSBvZiB0aGUgbGl0ZXJhbC5cbiAgICBzd2l0Y2ggKGFzdC52YWx1ZSkge1xuICAgICAgY2FzZSB0cnVlOlxuICAgICAgY2FzZSBmYWxzZTpcbiAgICAgICAgcmV0dXJuIHRoaXMucXVlcnkuZ2V0QnVpbHRpblR5cGUoQnVpbHRpblR5cGUuQm9vbGVhbik7XG4gICAgICBjYXNlIG51bGw6XG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5LmdldEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlLk51bGwpO1xuICAgICAgY2FzZSB1bmRlZmluZWQ6XG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5LmdldEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlLlVuZGVmaW5lZCk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBzd2l0Y2ggKHR5cGVvZiBhc3QudmFsdWUpIHtcbiAgICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucXVlcnkuZ2V0QnVpbHRpblR5cGUoQnVpbHRpblR5cGUuU3RyaW5nKTtcbiAgICAgICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucXVlcnkuZ2V0QnVpbHRpblR5cGUoQnVpbHRpblR5cGUuTnVtYmVyKTtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVwb3J0RXJyb3IoJ1VucmVjb2duaXplZCBwcmltaXRpdmUnLCBhc3QpO1xuICAgICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmlzaXRNZXRob2RDYWxsKGFzdDogTWV0aG9kQ2FsbCkge1xuICAgIHJldHVybiB0aGlzLnJlc29sdmVNZXRob2RDYWxsKHRoaXMuZ2V0VHlwZShhc3QucmVjZWl2ZXIpLCBhc3QpO1xuICB9XG5cbiAgdmlzaXRQaXBlKGFzdDogQmluZGluZ1BpcGUpIHtcbiAgICAvLyBUaGUgdHlwZSBvZiBhIHBpcGUgbm9kZSBpcyB0aGUgcmV0dXJuIHR5cGUgb2YgdGhlIHBpcGUncyB0cmFuc2Zvcm0gbWV0aG9kLiBUaGUgdGFibGUgcmV0dXJuZWRcbiAgICAvLyBieSBnZXRQaXBlcygpIGlzIGV4cGVjdGVkIHRvIGNvbnRhaW4gc3ltYm9scyB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIHRyYW5zZm9ybSBtZXRob2QgdHlwZS5cbiAgICBjb25zdCBwaXBlID0gdGhpcy5xdWVyeS5nZXRQaXBlcygpLmdldChhc3QubmFtZSk7XG4gICAgaWYgKCFwaXBlKSByZXR1cm4gdGhpcy5yZXBvcnRFcnJvcihgTm8gcGlwZSBieSB0aGUgbmFtZSAke2FzdC5uYW1lfSBmb3VuZGAsIGFzdCk7XG4gICAgY29uc3QgZXhwVHlwZSA9IHRoaXMuZ2V0VHlwZShhc3QuZXhwKTtcbiAgICBjb25zdCBzaWduYXR1cmUgPVxuICAgICAgICBwaXBlLnNlbGVjdFNpZ25hdHVyZShbZXhwVHlwZV0uY29uY2F0KGFzdC5hcmdzLm1hcChhcmcgPT4gdGhpcy5nZXRUeXBlKGFyZykpKSk7XG4gICAgaWYgKCFzaWduYXR1cmUpIHJldHVybiB0aGlzLnJlcG9ydEVycm9yKCdVbmFibGUgdG8gcmVzb2x2ZSBzaWduYXR1cmUgZm9yIHBpcGUgaW52b2NhdGlvbicsIGFzdCk7XG4gICAgcmV0dXJuIHNpZ25hdHVyZS5yZXN1bHQ7XG4gIH1cblxuICB2aXNpdFByZWZpeE5vdChhc3Q6IFByZWZpeE5vdCkge1xuICAgIC8vIFRoZSB0eXBlIG9mIGEgcHJlZml4ICEgaXMgYWx3YXlzIGJvb2xlYW4uXG4gICAgcmV0dXJuIHRoaXMucXVlcnkuZ2V0QnVpbHRpblR5cGUoQnVpbHRpblR5cGUuQm9vbGVhbik7XG4gIH1cblxuICB2aXNpdE5vbk51bGxBc3NlcnQoYXN0OiBOb25OdWxsQXNzZXJ0KSB7XG4gICAgY29uc3QgZXhwcmVzc2lvblR5cGUgPSB0aGlzLmdldFR5cGUoYXN0LmV4cHJlc3Npb24pO1xuICAgIHJldHVybiB0aGlzLnF1ZXJ5LmdldE5vbk51bGxhYmxlVHlwZShleHByZXNzaW9uVHlwZSk7XG4gIH1cblxuICB2aXNpdFByb3BlcnR5UmVhZChhc3Q6IFByb3BlcnR5UmVhZCkge1xuICAgIHJldHVybiB0aGlzLnJlc29sdmVQcm9wZXJ0eVJlYWQodGhpcy5nZXRUeXBlKGFzdC5yZWNlaXZlciksIGFzdCk7XG4gIH1cblxuICB2aXNpdFByb3BlcnR5V3JpdGUoYXN0OiBQcm9wZXJ0eVdyaXRlKSB7XG4gICAgLy8gVGhlIHR5cGUgb2YgYSB3cml0ZSBpcyB0aGUgdHlwZSBvZiB0aGUgdmFsdWUgYmVpbmcgd3JpdHRlbi5cbiAgICByZXR1cm4gdGhpcy5nZXRUeXBlKGFzdC52YWx1ZSk7XG4gIH1cblxuICB2aXNpdFF1b3RlKGFzdDogUXVvdGUpIHtcbiAgICAvLyBUaGUgdHlwZSBvZiBhIHF1b3RlZCBleHByZXNzaW9uIGlzIGFueS5cbiAgICByZXR1cm4gdGhpcy5xdWVyeS5nZXRCdWlsdGluVHlwZShCdWlsdGluVHlwZS5BbnkpO1xuICB9XG5cbiAgdmlzaXRTYWZlTWV0aG9kQ2FsbChhc3Q6IFNhZmVNZXRob2RDYWxsKSB7XG4gICAgcmV0dXJuIHRoaXMucmVzb2x2ZU1ldGhvZENhbGwodGhpcy5xdWVyeS5nZXROb25OdWxsYWJsZVR5cGUodGhpcy5nZXRUeXBlKGFzdC5yZWNlaXZlcikpLCBhc3QpO1xuICB9XG5cbiAgdmlzaXRTYWZlUHJvcGVydHlSZWFkKGFzdDogU2FmZVByb3BlcnR5UmVhZCkge1xuICAgIHJldHVybiB0aGlzLnJlc29sdmVQcm9wZXJ0eVJlYWQodGhpcy5xdWVyeS5nZXROb25OdWxsYWJsZVR5cGUodGhpcy5nZXRUeXBlKGFzdC5yZWNlaXZlcikpLCBhc3QpO1xuICB9XG5cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX2FueVR5cGUgITogU3ltYm9sO1xuICBwcml2YXRlIGdldCBhbnlUeXBlKCk6IFN5bWJvbCB7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMuX2FueVR5cGU7XG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuX2FueVR5cGUgPSB0aGlzLnF1ZXJ5LmdldEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlLkFueSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfdW5kZWZpbmVkVHlwZSAhOiBTeW1ib2w7XG4gIHByaXZhdGUgZ2V0IHVuZGVmaW5lZFR5cGUoKTogU3ltYm9sIHtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy5fdW5kZWZpbmVkVHlwZTtcbiAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgcmVzdWx0ID0gdGhpcy5fdW5kZWZpbmVkVHlwZSA9IHRoaXMucXVlcnkuZ2V0QnVpbHRpblR5cGUoQnVpbHRpblR5cGUuVW5kZWZpbmVkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgcmVzb2x2ZU1ldGhvZENhbGwocmVjZWl2ZXJUeXBlOiBTeW1ib2wsIGFzdDogU2FmZU1ldGhvZENhbGx8TWV0aG9kQ2FsbCkge1xuICAgIGlmICh0aGlzLmlzQW55KHJlY2VpdmVyVHlwZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmFueVR5cGU7XG4gICAgfVxuXG4gICAgLy8gVGhlIHR5cGUgb2YgYSBtZXRob2QgaXMgdGhlIHNlbGVjdGVkIG1ldGhvZHMgcmVzdWx0IHR5cGUuXG4gICAgY29uc3QgbWV0aG9kID0gcmVjZWl2ZXJUeXBlLm1lbWJlcnMoKS5nZXQoYXN0Lm5hbWUpO1xuICAgIGlmICghbWV0aG9kKSByZXR1cm4gdGhpcy5yZXBvcnRFcnJvcihgVW5rbm93biBtZXRob2QgJyR7YXN0Lm5hbWV9J2AsIGFzdCk7XG4gICAgaWYgKCFtZXRob2QudHlwZSkgcmV0dXJuIHRoaXMucmVwb3J0RXJyb3IoYENvdWxkIG5vdCBmaW5kIGEgdHlwZSBmb3IgJyR7YXN0Lm5hbWV9J2AsIGFzdCk7XG4gICAgaWYgKCFtZXRob2QudHlwZS5jYWxsYWJsZSkgcmV0dXJuIHRoaXMucmVwb3J0RXJyb3IoYE1lbWJlciAnJHthc3QubmFtZX0nIGlzIG5vdCBjYWxsYWJsZWAsIGFzdCk7XG4gICAgY29uc3Qgc2lnbmF0dXJlID0gbWV0aG9kLnR5cGUuc2VsZWN0U2lnbmF0dXJlKGFzdC5hcmdzLm1hcChhcmcgPT4gdGhpcy5nZXRUeXBlKGFyZykpKTtcbiAgICBpZiAoIXNpZ25hdHVyZSlcbiAgICAgIHJldHVybiB0aGlzLnJlcG9ydEVycm9yKGBVbmFibGUgdG8gcmVzb2x2ZSBzaWduYXR1cmUgZm9yIGNhbGwgb2YgbWV0aG9kICR7YXN0Lm5hbWV9YCwgYXN0KTtcbiAgICByZXR1cm4gc2lnbmF0dXJlLnJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgcmVzb2x2ZVByb3BlcnR5UmVhZChyZWNlaXZlclR5cGU6IFN5bWJvbCwgYXN0OiBTYWZlUHJvcGVydHlSZWFkfFByb3BlcnR5UmVhZCkge1xuICAgIGlmICh0aGlzLmlzQW55KHJlY2VpdmVyVHlwZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmFueVR5cGU7XG4gICAgfVxuXG4gICAgLy8gVGhlIHR5cGUgb2YgYSBwcm9wZXJ0eSByZWFkIGlzIHRoZSBzZWVsY3RlZCBtZW1iZXIncyB0eXBlLlxuICAgIGNvbnN0IG1lbWJlciA9IHJlY2VpdmVyVHlwZS5tZW1iZXJzKCkuZ2V0KGFzdC5uYW1lKTtcbiAgICBpZiAoIW1lbWJlcikge1xuICAgICAgbGV0IHJlY2VpdmVySW5mbyA9IHJlY2VpdmVyVHlwZS5uYW1lO1xuICAgICAgaWYgKHJlY2VpdmVySW5mbyA9PSAnJGltcGxpY3QnKSB7XG4gICAgICAgIHJlY2VpdmVySW5mbyA9XG4gICAgICAgICAgICAnVGhlIGNvbXBvbmVudCBkZWNsYXJhdGlvbiwgdGVtcGxhdGUgdmFyaWFibGUgZGVjbGFyYXRpb25zLCBhbmQgZWxlbWVudCByZWZlcmVuY2VzIGRvJztcbiAgICAgIH0gZWxzZSBpZiAocmVjZWl2ZXJUeXBlLm51bGxhYmxlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlcG9ydEVycm9yKGBUaGUgZXhwcmVzc2lvbiBtaWdodCBiZSBudWxsYCwgYXN0LnJlY2VpdmVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlY2VpdmVySW5mbyA9IGAnJHtyZWNlaXZlckluZm99JyBkb2VzYDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnJlcG9ydEVycm9yKFxuICAgICAgICAgIGBJZGVudGlmaWVyICcke2FzdC5uYW1lfScgaXMgbm90IGRlZmluZWQuICR7cmVjZWl2ZXJJbmZvfSBub3QgY29udGFpbiBzdWNoIGEgbWVtYmVyYCxcbiAgICAgICAgICBhc3QpO1xuICAgIH1cbiAgICBpZiAoIW1lbWJlci5wdWJsaWMpIHtcbiAgICAgIGxldCByZWNlaXZlckluZm8gPSByZWNlaXZlclR5cGUubmFtZTtcbiAgICAgIGlmIChyZWNlaXZlckluZm8gPT0gJyRpbXBsaWN0Jykge1xuICAgICAgICByZWNlaXZlckluZm8gPSAndGhlIGNvbXBvbmVudCc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZWNlaXZlckluZm8gPSBgJyR7cmVjZWl2ZXJJbmZvfSdgO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXBvcnRXYXJuaW5nKFxuICAgICAgICAgIGBJZGVudGlmaWVyICcke2FzdC5uYW1lfScgcmVmZXJzIHRvIGEgcHJpdmF0ZSBtZW1iZXIgb2YgJHtyZWNlaXZlckluZm99YCwgYXN0KTtcbiAgICB9XG4gICAgcmV0dXJuIG1lbWJlci50eXBlO1xuICB9XG5cbiAgcHJpdmF0ZSByZXBvcnRFcnJvcihtZXNzYWdlOiBzdHJpbmcsIGFzdDogQVNUKTogU3ltYm9sIHtcbiAgICBpZiAodGhpcy5kaWFnbm9zdGljcykge1xuICAgICAgdGhpcy5kaWFnbm9zdGljcy5wdXNoKG5ldyBUeXBlRGlhZ25vc3RpYyhEaWFnbm9zdGljS2luZC5FcnJvciwgbWVzc2FnZSwgYXN0KSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmFueVR5cGU7XG4gIH1cblxuICBwcml2YXRlIHJlcG9ydFdhcm5pbmcobWVzc2FnZTogc3RyaW5nLCBhc3Q6IEFTVCk6IFN5bWJvbCB7XG4gICAgaWYgKHRoaXMuZGlhZ25vc3RpY3MpIHtcbiAgICAgIHRoaXMuZGlhZ25vc3RpY3MucHVzaChuZXcgVHlwZURpYWdub3N0aWMoRGlhZ25vc3RpY0tpbmQuV2FybmluZywgbWVzc2FnZSwgYXN0KSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmFueVR5cGU7XG4gIH1cblxuICBwcml2YXRlIGlzQW55KHN5bWJvbDogU3ltYm9sKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICFzeW1ib2wgfHwgdGhpcy5xdWVyeS5nZXRUeXBlS2luZChzeW1ib2wpID09IEJ1aWx0aW5UeXBlLkFueSB8fFxuICAgICAgICAoISFzeW1ib2wudHlwZSAmJiB0aGlzLmlzQW55KHN5bWJvbC50eXBlKSk7XG4gIH1cbn0iXX0=