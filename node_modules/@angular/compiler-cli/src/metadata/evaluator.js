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
        define("@angular/compiler-cli/src/metadata/evaluator", ["require", "exports", "typescript", "@angular/compiler-cli/src/metadata/schema"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ts = require("typescript");
    const schema_1 = require("@angular/compiler-cli/src/metadata/schema");
    // In TypeScript 2.1 the spread element kind was renamed.
    const spreadElementSyntaxKind = ts.SyntaxKind.SpreadElement || ts.SyntaxKind.SpreadElementExpression;
    function isMethodCallOf(callExpression, memberName) {
        const expression = callExpression.expression;
        if (expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
            const propertyAccessExpression = expression;
            const name = propertyAccessExpression.name;
            if (name.kind == ts.SyntaxKind.Identifier) {
                return name.text === memberName;
            }
        }
        return false;
    }
    function isCallOf(callExpression, ident) {
        const expression = callExpression.expression;
        if (expression.kind === ts.SyntaxKind.Identifier) {
            const identifier = expression;
            return identifier.text === ident;
        }
        return false;
    }
    /* @internal */
    function recordMapEntry(entry, node, nodeMap, sourceFile) {
        if (!nodeMap.has(entry)) {
            nodeMap.set(entry, node);
            if (node && (schema_1.isMetadataImportedSymbolReferenceExpression(entry) ||
                schema_1.isMetadataImportDefaultReference(entry)) &&
                entry.line == null) {
                const info = sourceInfo(node, sourceFile);
                if (info.line != null)
                    entry.line = info.line;
                if (info.character != null)
                    entry.character = info.character;
            }
        }
        return entry;
    }
    exports.recordMapEntry = recordMapEntry;
    /**
     * ts.forEachChild stops iterating children when the callback return a truthy value.
     * This method inverts this to implement an `every` style iterator. It will return
     * true if every call to `cb` returns `true`.
     */
    function everyNodeChild(node, cb) {
        return !ts.forEachChild(node, node => !cb(node));
    }
    function isPrimitive(value) {
        return Object(value) !== value;
    }
    exports.isPrimitive = isPrimitive;
    function isDefined(obj) {
        return obj !== undefined;
    }
    function getSourceFileOfNode(node) {
        while (node && node.kind != ts.SyntaxKind.SourceFile) {
            node = node.parent;
        }
        return node;
    }
    /* @internal */
    function sourceInfo(node, sourceFile) {
        if (node) {
            sourceFile = sourceFile || getSourceFileOfNode(node);
            if (sourceFile) {
                return ts.getLineAndCharacterOfPosition(sourceFile, node.getStart(sourceFile));
            }
        }
        return {};
    }
    exports.sourceInfo = sourceInfo;
    /* @internal */
    function errorSymbol(message, node, context, sourceFile) {
        const result = Object.assign({ __symbolic: 'error', message }, sourceInfo(node, sourceFile));
        if (context) {
            result.context = context;
        }
        return result;
    }
    exports.errorSymbol = errorSymbol;
    /**
     * Produce a symbolic representation of an expression folding values into their final value when
     * possible.
     */
    class Evaluator {
        constructor(symbols, nodeMap, options = {}, recordExport) {
            this.symbols = symbols;
            this.nodeMap = nodeMap;
            this.options = options;
            this.recordExport = recordExport;
        }
        nameOf(node) {
            if (node && node.kind == ts.SyntaxKind.Identifier) {
                return node.text;
            }
            const result = node && this.evaluateNode(node);
            if (schema_1.isMetadataError(result) || typeof result === 'string') {
                return result;
            }
            else {
                return errorSymbol('Name expected', node, { received: (node && node.getText()) || '<missing>' });
            }
        }
        /**
         * Returns true if the expression represented by `node` can be folded into a literal expression.
         *
         * For example, a literal is always foldable. This means that literal expressions such as `1.2`
         * `"Some value"` `true` `false` are foldable.
         *
         * - An object literal is foldable if all the properties in the literal are foldable.
         * - An array literal is foldable if all the elements are foldable.
         * - A call is foldable if it is a call to a Array.prototype.concat or a call to CONST_EXPR.
         * - A property access is foldable if the object is foldable.
         * - A array index is foldable if index expression is foldable and the array is foldable.
         * - Binary operator expressions are foldable if the left and right expressions are foldable and
         *   it is one of '+', '-', '*', '/', '%', '||', and '&&'.
         * - An identifier is foldable if a value can be found for its symbol in the evaluator symbol
         *   table.
         */
        isFoldable(node) {
            return this.isFoldableWorker(node, new Map());
        }
        isFoldableWorker(node, folding) {
            if (node) {
                switch (node.kind) {
                    case ts.SyntaxKind.ObjectLiteralExpression:
                        return everyNodeChild(node, child => {
                            if (child.kind === ts.SyntaxKind.PropertyAssignment) {
                                const propertyAssignment = child;
                                return this.isFoldableWorker(propertyAssignment.initializer, folding);
                            }
                            return false;
                        });
                    case ts.SyntaxKind.ArrayLiteralExpression:
                        return everyNodeChild(node, child => this.isFoldableWorker(child, folding));
                    case ts.SyntaxKind.CallExpression:
                        const callExpression = node;
                        // We can fold a <array>.concat(<v>).
                        if (isMethodCallOf(callExpression, 'concat') &&
                            arrayOrEmpty(callExpression.arguments).length === 1) {
                            const arrayNode = callExpression.expression.expression;
                            if (this.isFoldableWorker(arrayNode, folding) &&
                                this.isFoldableWorker(callExpression.arguments[0], folding)) {
                                // It needs to be an array.
                                const arrayValue = this.evaluateNode(arrayNode);
                                if (arrayValue && Array.isArray(arrayValue)) {
                                    return true;
                                }
                            }
                        }
                        // We can fold a call to CONST_EXPR
                        if (isCallOf(callExpression, 'CONST_EXPR') &&
                            arrayOrEmpty(callExpression.arguments).length === 1)
                            return this.isFoldableWorker(callExpression.arguments[0], folding);
                        return false;
                    case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
                    case ts.SyntaxKind.StringLiteral:
                    case ts.SyntaxKind.NumericLiteral:
                    case ts.SyntaxKind.NullKeyword:
                    case ts.SyntaxKind.TrueKeyword:
                    case ts.SyntaxKind.FalseKeyword:
                    case ts.SyntaxKind.TemplateHead:
                    case ts.SyntaxKind.TemplateMiddle:
                    case ts.SyntaxKind.TemplateTail:
                        return true;
                    case ts.SyntaxKind.ParenthesizedExpression:
                        const parenthesizedExpression = node;
                        return this.isFoldableWorker(parenthesizedExpression.expression, folding);
                    case ts.SyntaxKind.BinaryExpression:
                        const binaryExpression = node;
                        switch (binaryExpression.operatorToken.kind) {
                            case ts.SyntaxKind.PlusToken:
                            case ts.SyntaxKind.MinusToken:
                            case ts.SyntaxKind.AsteriskToken:
                            case ts.SyntaxKind.SlashToken:
                            case ts.SyntaxKind.PercentToken:
                            case ts.SyntaxKind.AmpersandAmpersandToken:
                            case ts.SyntaxKind.BarBarToken:
                                return this.isFoldableWorker(binaryExpression.left, folding) &&
                                    this.isFoldableWorker(binaryExpression.right, folding);
                            default:
                                return false;
                        }
                    case ts.SyntaxKind.PropertyAccessExpression:
                        const propertyAccessExpression = node;
                        return this.isFoldableWorker(propertyAccessExpression.expression, folding);
                    case ts.SyntaxKind.ElementAccessExpression:
                        const elementAccessExpression = node;
                        return this.isFoldableWorker(elementAccessExpression.expression, folding) &&
                            this.isFoldableWorker(elementAccessExpression.argumentExpression, folding);
                    case ts.SyntaxKind.Identifier:
                        let identifier = node;
                        let reference = this.symbols.resolve(identifier.text);
                        if (reference !== undefined && isPrimitive(reference)) {
                            return true;
                        }
                        break;
                    case ts.SyntaxKind.TemplateExpression:
                        const templateExpression = node;
                        return templateExpression.templateSpans.every(span => this.isFoldableWorker(span.expression, folding));
                }
            }
            return false;
        }
        /**
         * Produce a JSON serialiable object representing `node`. The foldable values in the expression
         * tree are folded. For example, a node representing `1 + 2` is folded into `3`.
         */
        evaluateNode(node, preferReference) {
            const t = this;
            let error;
            function recordEntry(entry, node) {
                if (t.options.substituteExpression) {
                    const newEntry = t.options.substituteExpression(entry, node);
                    if (t.recordExport && newEntry != entry && schema_1.isMetadataGlobalReferenceExpression(newEntry)) {
                        t.recordExport(newEntry.name, entry);
                    }
                    entry = newEntry;
                }
                return recordMapEntry(entry, node, t.nodeMap);
            }
            function isFoldableError(value) {
                return !t.options.verboseInvalidExpression && schema_1.isMetadataError(value);
            }
            const resolveName = (name, preferReference) => {
                const reference = this.symbols.resolve(name, preferReference);
                if (reference === undefined) {
                    // Encode as a global reference. StaticReflector will check the reference.
                    return recordEntry({ __symbolic: 'reference', name }, node);
                }
                if (reference && schema_1.isMetadataSymbolicReferenceExpression(reference)) {
                    return recordEntry(Object.assign({}, reference), node);
                }
                return reference;
            };
            switch (node.kind) {
                case ts.SyntaxKind.ObjectLiteralExpression:
                    let obj = {};
                    let quoted = [];
                    ts.forEachChild(node, child => {
                        switch (child.kind) {
                            case ts.SyntaxKind.ShorthandPropertyAssignment:
                            case ts.SyntaxKind.PropertyAssignment:
                                const assignment = child;
                                if (assignment.name.kind == ts.SyntaxKind.StringLiteral) {
                                    const name = assignment.name.text;
                                    quoted.push(name);
                                }
                                const propertyName = this.nameOf(assignment.name);
                                if (isFoldableError(propertyName)) {
                                    error = propertyName;
                                    return true;
                                }
                                const propertyValue = isPropertyAssignment(assignment) ?
                                    this.evaluateNode(assignment.initializer, /* preferReference */ true) :
                                    resolveName(propertyName, /* preferReference */ true);
                                if (isFoldableError(propertyValue)) {
                                    error = propertyValue;
                                    return true; // Stop the forEachChild.
                                }
                                else {
                                    obj[propertyName] = isPropertyAssignment(assignment) ?
                                        recordEntry(propertyValue, assignment.initializer) :
                                        propertyValue;
                                }
                        }
                    });
                    if (error)
                        return error;
                    if (this.options.quotedNames && quoted.length) {
                        obj['$quoted$'] = quoted;
                    }
                    return recordEntry(obj, node);
                case ts.SyntaxKind.ArrayLiteralExpression:
                    let arr = [];
                    ts.forEachChild(node, child => {
                        const value = this.evaluateNode(child, /* preferReference */ true);
                        // Check for error
                        if (isFoldableError(value)) {
                            error = value;
                            return true; // Stop the forEachChild.
                        }
                        // Handle spread expressions
                        if (schema_1.isMetadataSymbolicSpreadExpression(value)) {
                            if (Array.isArray(value.expression)) {
                                for (const spreadValue of value.expression) {
                                    arr.push(spreadValue);
                                }
                                return;
                            }
                        }
                        arr.push(value);
                    });
                    if (error)
                        return error;
                    return recordEntry(arr, node);
                case spreadElementSyntaxKind:
                    let spreadExpression = this.evaluateNode(node.expression);
                    return recordEntry({ __symbolic: 'spread', expression: spreadExpression }, node);
                case ts.SyntaxKind.CallExpression:
                    const callExpression = node;
                    if (isCallOf(callExpression, 'forwardRef') &&
                        arrayOrEmpty(callExpression.arguments).length === 1) {
                        const firstArgument = callExpression.arguments[0];
                        if (firstArgument.kind == ts.SyntaxKind.ArrowFunction) {
                            const arrowFunction = firstArgument;
                            return recordEntry(this.evaluateNode(arrowFunction.body), node);
                        }
                    }
                    const args = arrayOrEmpty(callExpression.arguments).map(arg => this.evaluateNode(arg));
                    if (this.isFoldable(callExpression)) {
                        if (isMethodCallOf(callExpression, 'concat')) {
                            const arrayValue = this.evaluateNode(callExpression.expression.expression);
                            if (isFoldableError(arrayValue))
                                return arrayValue;
                            return arrayValue.concat(args[0]);
                        }
                    }
                    // Always fold a CONST_EXPR even if the argument is not foldable.
                    if (isCallOf(callExpression, 'CONST_EXPR') &&
                        arrayOrEmpty(callExpression.arguments).length === 1) {
                        return recordEntry(args[0], node);
                    }
                    const expression = this.evaluateNode(callExpression.expression);
                    if (isFoldableError(expression)) {
                        return recordEntry(expression, node);
                    }
                    let result = { __symbolic: 'call', expression: expression };
                    if (args && args.length) {
                        result.arguments = args;
                    }
                    return recordEntry(result, node);
                case ts.SyntaxKind.NewExpression:
                    const newExpression = node;
                    const newArgs = arrayOrEmpty(newExpression.arguments).map(arg => this.evaluateNode(arg));
                    const newTarget = this.evaluateNode(newExpression.expression);
                    if (schema_1.isMetadataError(newTarget)) {
                        return recordEntry(newTarget, node);
                    }
                    const call = { __symbolic: 'new', expression: newTarget };
                    if (newArgs.length) {
                        call.arguments = newArgs;
                    }
                    return recordEntry(call, node);
                case ts.SyntaxKind.PropertyAccessExpression: {
                    const propertyAccessExpression = node;
                    const expression = this.evaluateNode(propertyAccessExpression.expression);
                    if (isFoldableError(expression)) {
                        return recordEntry(expression, node);
                    }
                    const member = this.nameOf(propertyAccessExpression.name);
                    if (isFoldableError(member)) {
                        return recordEntry(member, node);
                    }
                    if (expression && this.isFoldable(propertyAccessExpression.expression))
                        return expression[member];
                    if (schema_1.isMetadataModuleReferenceExpression(expression)) {
                        // A select into a module reference and be converted into a reference to the symbol
                        // in the module
                        return recordEntry({ __symbolic: 'reference', module: expression.module, name: member }, node);
                    }
                    return recordEntry({ __symbolic: 'select', expression, member }, node);
                }
                case ts.SyntaxKind.ElementAccessExpression: {
                    const elementAccessExpression = node;
                    const expression = this.evaluateNode(elementAccessExpression.expression);
                    if (isFoldableError(expression)) {
                        return recordEntry(expression, node);
                    }
                    if (!elementAccessExpression.argumentExpression) {
                        return recordEntry(errorSymbol('Expression form not supported', node), node);
                    }
                    const index = this.evaluateNode(elementAccessExpression.argumentExpression);
                    if (isFoldableError(expression)) {
                        return recordEntry(expression, node);
                    }
                    if (this.isFoldable(elementAccessExpression.expression) &&
                        this.isFoldable(elementAccessExpression.argumentExpression))
                        return expression[index];
                    return recordEntry({ __symbolic: 'index', expression, index }, node);
                }
                case ts.SyntaxKind.Identifier:
                    const identifier = node;
                    const name = identifier.text;
                    return resolveName(name, preferReference);
                case ts.SyntaxKind.TypeReference:
                    const typeReferenceNode = node;
                    const typeNameNode = typeReferenceNode.typeName;
                    const getReference = node => {
                        if (typeNameNode.kind === ts.SyntaxKind.QualifiedName) {
                            const qualifiedName = node;
                            const left = this.evaluateNode(qualifiedName.left);
                            if (schema_1.isMetadataModuleReferenceExpression(left)) {
                                return recordEntry({
                                    __symbolic: 'reference',
                                    module: left.module,
                                    name: qualifiedName.right.text
                                }, node);
                            }
                            // Record a type reference to a declared type as a select.
                            return { __symbolic: 'select', expression: left, member: qualifiedName.right.text };
                        }
                        else {
                            const identifier = typeNameNode;
                            const symbol = this.symbols.resolve(identifier.text);
                            if (isFoldableError(symbol) || schema_1.isMetadataSymbolicReferenceExpression(symbol)) {
                                return recordEntry(symbol, node);
                            }
                            return recordEntry(errorSymbol('Could not resolve type', node, { typeName: identifier.text }), node);
                        }
                    };
                    const typeReference = getReference(typeNameNode);
                    if (isFoldableError(typeReference)) {
                        return recordEntry(typeReference, node);
                    }
                    if (!schema_1.isMetadataModuleReferenceExpression(typeReference) &&
                        typeReferenceNode.typeArguments && typeReferenceNode.typeArguments.length) {
                        const args = typeReferenceNode.typeArguments.map(element => this.evaluateNode(element));
                        // TODO: Remove typecast when upgraded to 2.0 as it will be correctly inferred.
                        // Some versions of 1.9 do not infer this correctly.
                        typeReference.arguments = args;
                    }
                    return recordEntry(typeReference, node);
                case ts.SyntaxKind.UnionType:
                    const unionType = node;
                    // Remove null and undefined from the list of unions.
                    const references = unionType.types
                        .filter(n => n.kind != ts.SyntaxKind.NullKeyword &&
                        n.kind != ts.SyntaxKind.UndefinedKeyword)
                        .map(n => this.evaluateNode(n));
                    // The remmaining reference must be the same. If two have type arguments consider them
                    // different even if the type arguments are the same.
                    let candidate = null;
                    for (let i = 0; i < references.length; i++) {
                        const reference = references[i];
                        if (schema_1.isMetadataSymbolicReferenceExpression(reference)) {
                            if (candidate) {
                                if (reference.name == candidate.name &&
                                    reference.module == candidate.module && !reference.arguments) {
                                    candidate = reference;
                                }
                            }
                            else {
                                candidate = reference;
                            }
                        }
                        else {
                            return reference;
                        }
                    }
                    if (candidate)
                        return candidate;
                    break;
                case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
                case ts.SyntaxKind.StringLiteral:
                case ts.SyntaxKind.TemplateHead:
                case ts.SyntaxKind.TemplateTail:
                case ts.SyntaxKind.TemplateMiddle:
                    return node.text;
                case ts.SyntaxKind.NumericLiteral:
                    return parseFloat(node.text);
                case ts.SyntaxKind.AnyKeyword:
                    return recordEntry({ __symbolic: 'reference', name: 'any' }, node);
                case ts.SyntaxKind.StringKeyword:
                    return recordEntry({ __symbolic: 'reference', name: 'string' }, node);
                case ts.SyntaxKind.NumberKeyword:
                    return recordEntry({ __symbolic: 'reference', name: 'number' }, node);
                case ts.SyntaxKind.BooleanKeyword:
                    return recordEntry({ __symbolic: 'reference', name: 'boolean' }, node);
                case ts.SyntaxKind.ArrayType:
                    const arrayTypeNode = node;
                    return recordEntry({
                        __symbolic: 'reference',
                        name: 'Array',
                        arguments: [this.evaluateNode(arrayTypeNode.elementType)]
                    }, node);
                case ts.SyntaxKind.NullKeyword:
                    return null;
                case ts.SyntaxKind.TrueKeyword:
                    return true;
                case ts.SyntaxKind.FalseKeyword:
                    return false;
                case ts.SyntaxKind.ParenthesizedExpression:
                    const parenthesizedExpression = node;
                    return this.evaluateNode(parenthesizedExpression.expression);
                case ts.SyntaxKind.TypeAssertionExpression:
                    const typeAssertion = node;
                    return this.evaluateNode(typeAssertion.expression);
                case ts.SyntaxKind.PrefixUnaryExpression:
                    const prefixUnaryExpression = node;
                    const operand = this.evaluateNode(prefixUnaryExpression.operand);
                    if (isDefined(operand) && isPrimitive(operand)) {
                        switch (prefixUnaryExpression.operator) {
                            case ts.SyntaxKind.PlusToken:
                                return +operand;
                            case ts.SyntaxKind.MinusToken:
                                return -operand;
                            case ts.SyntaxKind.TildeToken:
                                return ~operand;
                            case ts.SyntaxKind.ExclamationToken:
                                return !operand;
                        }
                    }
                    let operatorText;
                    switch (prefixUnaryExpression.operator) {
                        case ts.SyntaxKind.PlusToken:
                            operatorText = '+';
                            break;
                        case ts.SyntaxKind.MinusToken:
                            operatorText = '-';
                            break;
                        case ts.SyntaxKind.TildeToken:
                            operatorText = '~';
                            break;
                        case ts.SyntaxKind.ExclamationToken:
                            operatorText = '!';
                            break;
                        default:
                            return undefined;
                    }
                    return recordEntry({ __symbolic: 'pre', operator: operatorText, operand: operand }, node);
                case ts.SyntaxKind.BinaryExpression:
                    const binaryExpression = node;
                    const left = this.evaluateNode(binaryExpression.left);
                    const right = this.evaluateNode(binaryExpression.right);
                    if (isDefined(left) && isDefined(right)) {
                        if (isPrimitive(left) && isPrimitive(right))
                            switch (binaryExpression.operatorToken.kind) {
                                case ts.SyntaxKind.BarBarToken:
                                    return left || right;
                                case ts.SyntaxKind.AmpersandAmpersandToken:
                                    return left && right;
                                case ts.SyntaxKind.AmpersandToken:
                                    return left & right;
                                case ts.SyntaxKind.BarToken:
                                    return left | right;
                                case ts.SyntaxKind.CaretToken:
                                    return left ^ right;
                                case ts.SyntaxKind.EqualsEqualsToken:
                                    return left == right;
                                case ts.SyntaxKind.ExclamationEqualsToken:
                                    return left != right;
                                case ts.SyntaxKind.EqualsEqualsEqualsToken:
                                    return left === right;
                                case ts.SyntaxKind.ExclamationEqualsEqualsToken:
                                    return left !== right;
                                case ts.SyntaxKind.LessThanToken:
                                    return left < right;
                                case ts.SyntaxKind.GreaterThanToken:
                                    return left > right;
                                case ts.SyntaxKind.LessThanEqualsToken:
                                    return left <= right;
                                case ts.SyntaxKind.GreaterThanEqualsToken:
                                    return left >= right;
                                case ts.SyntaxKind.LessThanLessThanToken:
                                    return left << right;
                                case ts.SyntaxKind.GreaterThanGreaterThanToken:
                                    return left >> right;
                                case ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken:
                                    return left >>> right;
                                case ts.SyntaxKind.PlusToken:
                                    return left + right;
                                case ts.SyntaxKind.MinusToken:
                                    return left - right;
                                case ts.SyntaxKind.AsteriskToken:
                                    return left * right;
                                case ts.SyntaxKind.SlashToken:
                                    return left / right;
                                case ts.SyntaxKind.PercentToken:
                                    return left % right;
                            }
                        return recordEntry({
                            __symbolic: 'binop',
                            operator: binaryExpression.operatorToken.getText(),
                            left: left,
                            right: right
                        }, node);
                    }
                    break;
                case ts.SyntaxKind.ConditionalExpression:
                    const conditionalExpression = node;
                    const condition = this.evaluateNode(conditionalExpression.condition);
                    const thenExpression = this.evaluateNode(conditionalExpression.whenTrue);
                    const elseExpression = this.evaluateNode(conditionalExpression.whenFalse);
                    if (isPrimitive(condition)) {
                        return condition ? thenExpression : elseExpression;
                    }
                    return recordEntry({ __symbolic: 'if', condition, thenExpression, elseExpression }, node);
                case ts.SyntaxKind.FunctionExpression:
                case ts.SyntaxKind.ArrowFunction:
                    return recordEntry(errorSymbol('Lambda not supported', node), node);
                case ts.SyntaxKind.TaggedTemplateExpression:
                    return recordEntry(errorSymbol('Tagged template expressions are not supported in metadata', node), node);
                case ts.SyntaxKind.TemplateExpression:
                    const templateExpression = node;
                    if (this.isFoldable(node)) {
                        return templateExpression.templateSpans.reduce((previous, current) => previous + this.evaluateNode(current.expression) +
                            this.evaluateNode(current.literal), this.evaluateNode(templateExpression.head));
                    }
                    else {
                        return templateExpression.templateSpans.reduce((previous, current) => {
                            const expr = this.evaluateNode(current.expression);
                            const literal = this.evaluateNode(current.literal);
                            if (isFoldableError(expr))
                                return expr;
                            if (isFoldableError(literal))
                                return literal;
                            if (typeof previous === 'string' && typeof expr === 'string' &&
                                typeof literal === 'string') {
                                return previous + expr + literal;
                            }
                            let result = expr;
                            if (previous !== '') {
                                result = { __symbolic: 'binop', operator: '+', left: previous, right: expr };
                            }
                            if (literal != '') {
                                result = { __symbolic: 'binop', operator: '+', left: result, right: literal };
                            }
                            return result;
                        }, this.evaluateNode(templateExpression.head));
                    }
                case ts.SyntaxKind.AsExpression:
                    const asExpression = node;
                    return this.evaluateNode(asExpression.expression);
                case ts.SyntaxKind.ClassExpression:
                    return { __symbolic: 'class' };
            }
            return recordEntry(errorSymbol('Expression form not supported', node), node);
        }
    }
    exports.Evaluator = Evaluator;
    function isPropertyAssignment(node) {
        return node.kind == ts.SyntaxKind.PropertyAssignment;
    }
    const empty = ts.createNodeArray();
    function arrayOrEmpty(v) {
        return v || empty;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZhbHVhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9tZXRhZGF0YS9ldmFsdWF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSCxpQ0FBaUM7SUFHakMsc0VBQXFkO0lBS3JkLHlEQUF5RDtJQUN6RCxNQUFNLHVCQUF1QixHQUN4QixFQUFFLENBQUMsVUFBa0IsQ0FBQyxhQUFhLElBQUssRUFBRSxDQUFDLFVBQWtCLENBQUMsdUJBQXVCLENBQUM7SUFFM0YsU0FBUyxjQUFjLENBQUMsY0FBaUMsRUFBRSxVQUFrQjtRQUMzRSxNQUFNLFVBQVUsR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDO1FBQzdDLElBQUksVUFBVSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLHdCQUF3QixFQUFFO1lBQzlELE1BQU0sd0JBQXdCLEdBQWdDLFVBQVUsQ0FBQztZQUN6RSxNQUFNLElBQUksR0FBRyx3QkFBd0IsQ0FBQyxJQUFJLENBQUM7WUFDM0MsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFO2dCQUN6QyxPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFDO2FBQ2pDO1NBQ0Y7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxTQUFTLFFBQVEsQ0FBQyxjQUFpQyxFQUFFLEtBQWE7UUFDaEUsTUFBTSxVQUFVLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQztRQUM3QyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUU7WUFDaEQsTUFBTSxVQUFVLEdBQWtCLFVBQVUsQ0FBQztZQUM3QyxPQUFPLFVBQVUsQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDO1NBQ2xDO1FBQ0QsT0FBTyxL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K0JBQStCLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDL0UsQ0FBQztLQUNGO0lBampCRCw4QkFpakJDO0lBRUQsU0FBUyxvQkFBb0IsQ0FBQyxJQUFhO1FBQ3pDLE9BQU8sSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDO0lBQ3ZELENBQUM7SUFFRCxNQUFNLEtBQUssR0FBRyxFQUFFLENBQUMsZUFBZSxFQUFPLENBQUM7SUFFeEMsU0FBUyxZQUFZLENBQW9CLENBQTZCO1FBQ3BFLE9BQU8sQ0FBQyxJQUFJLEtBQUssQ0FBQztJQUNwQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtDb2xsZWN0b3JPcHRpb25zfSBmcm9tICcuL2NvbGxlY3Rvcic7XG5pbXBvcnQge0NsYXNzTWV0YWRhdGEsIEZ1bmN0aW9uTWV0YWRhdGEsIEludGVyZmFjZU1ldGFkYXRhLCBNZXRhZGF0YUVudHJ5LCBNZXRhZGF0YUVycm9yLCBNZXRhZGF0YUltcG9ydGVkU3ltYm9sUmVmZXJlbmNlRXhwcmVzc2lvbiwgTWV0YWRhdGFTb3VyY2VMb2NhdGlvbkluZm8sIE1ldGFkYXRhU3ltYm9saWNDYWxsRXhwcmVzc2lvbiwgTWV0YWRhdGFWYWx1ZSwgaXNNZXRhZGF0YUVycm9yLCBpc01ldGFkYXRhR2xvYmFsUmVmZXJlbmNlRXhwcmVzc2lvbiwgaXNNZXRhZGF0YUltcG9ydERlZmF1bHRSZWZlcmVuY2UsIGlzTWV0YWRhdGFJbXBvcnRlZFN5bWJvbFJlZmVyZW5jZUV4cHJlc3Npb24sIGlzTWV0YWRhdGFNb2R1bGVSZWZlcmVuY2VFeHByZXNzaW9uLCBpc01ldGFkYXRhU3ltYm9saWNSZWZlcmVuY2VFeHByZXNzaW9uLCBpc01ldGFkYXRhU3ltYm9saWNTcHJlYWRFeHByZXNzaW9ufSBmcm9tICcuL3NjaGVtYSc7XG5pbXBvcnQge1N5bWJvbHN9IGZyb20gJy4vc3ltYm9scyc7XG5cblxuXG4vLyBJbiBUeXBlU2NyaXB0IDIuMSB0aGUgc3ByZWFkIGVsZW1lbnQga2luZCB3YXMgcmVuYW1lZC5cbmNvbnN0IHNwcmVhZEVsZW1lbnRTeW50YXhLaW5kOiB0cy5TeW50YXhLaW5kID1cbiAgICAodHMuU3ludGF4S2luZCBhcyBhbnkpLlNwcmVhZEVsZW1lbnQgfHwgKHRzLlN5bnRheEtpbmQgYXMgYW55KS5TcHJlYWRFbGVtZW50RXhwcmVzc2lvbjtcblxuZnVuY3Rpb24gaXNNZXRob2RDYWxsT2YoY2FsbEV4cHJlc3Npb246IHRzLkNhbGxFeHByZXNzaW9uLCBtZW1iZXJOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgZXhwcmVzc2lvbiA9IGNhbGxFeHByZXNzaW9uLmV4cHJlc3Npb247XG4gIGlmIChleHByZXNzaW9uLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKSB7XG4gICAgY29uc3QgcHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uID0gPHRzLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbj5leHByZXNzaW9uO1xuICAgIGNvbnN0IG5hbWUgPSBwcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24ubmFtZTtcbiAgICBpZiAobmFtZS5raW5kID09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgICAgcmV0dXJuIG5hbWUudGV4dCA9PT0gbWVtYmVyTmFtZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBpc0NhbGxPZihjYWxsRXhwcmVzc2lvbjogdHMuQ2FsbEV4cHJlc3Npb24sIGlkZW50OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgZXhwcmVzc2lvbiA9IGNhbGxFeHByZXNzaW9uLmV4cHJlc3Npb247XG4gIGlmIChleHByZXNzaW9uLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgIGNvbnN0IGlkZW50aWZpZXIgPSA8dHMuSWRlbnRpZmllcj5leHByZXNzaW9uO1xuICAgIHJldHVybiBpZGVudGlmaWVyLnRleHQgPT09IGlkZW50O1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyogQGludGVybmFsICovXG5leHBvcnQgZnVuY3Rpb24gcmVjb3JkTWFwRW50cnk8VCBleHRlbmRzIE1ldGFkYXRhRW50cnk+KFxuICAgIGVudHJ5OiBULCBub2RlOiB0cy5Ob2RlLFxuICAgIG5vZGVNYXA6IE1hcDxNZXRhZGF0YVZhbHVlfENsYXNzTWV0YWRhdGF8SW50ZXJmYWNlTWV0YWRhdGF8RnVuY3Rpb25NZXRhZGF0YSwgdHMuTm9kZT4sXG4gICAgc291cmNlRmlsZT86IHRzLlNvdXJjZUZpbGUpIHtcbiAgaWYgKCFub2RlTWFwLmhhcyhlbnRyeSkpIHtcbiAgICBub2RlTWFwLnNldChlbnRyeSwgbm9kZSk7XG4gICAgaWYgKG5vZGUgJiYgKGlzTWV0YWRhdGFJbXBvcnRlZFN5bWJvbFJlZmVyZW5jZUV4cHJlc3Npb24oZW50cnkpIHx8XG4gICAgICAgICAgICAgICAgIGlzTWV0YWRhdGFJbXBvcnREZWZhdWx0UmVmZXJlbmNlKGVudHJ5KSkgJiZcbiAgICAgICAgZW50cnkubGluZSA9PSBudWxsKSB7XG4gICAgICBjb25zdCBpbmZvID0gc291cmNlSW5mbyhub2RlLCBzb3VyY2VGaWxlKTtcbiAgICAgIGlmIChpbmZvLmxpbmUgIT0gbnVsbCkgZW50cnkubGluZSA9IGluZm8ubGluZTtcbiAgICAgIGlmIChpbmZvLmNoYXJhY3RlciAhPSBudWxsKSBlbnRyeS5jaGFyYWN0ZXIgPSBpbmZvLmNoYXJhY3RlcjtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGVudHJ5O1xufVxuXG4vKipcbiAqIHRzLmZvckVhY2hDaGlsZCBzdG9wcyBpdGVyYXRpbmcgY2hpbGRyZW4gd2hlbiB0aGUgY2FsbGJhY2sgcmV0dXJuIGEgdHJ1dGh5IHZhbHVlLlxuICogVGhpcyBtZXRob2QgaW52ZXJ0cyB0aGlzIHRvIGltcGxlbWVudCBhbiBgZXZlcnlgIHN0eWxlIGl0ZXJhdG9yLiBJdCB3aWxsIHJldHVyblxuICogdHJ1ZSBpZiBldmVyeSBjYWxsIHRvIGBjYmAgcmV0dXJucyBgdHJ1ZWAuXG4gKi9cbmZ1bmN0aW9uIGV2ZXJ5Tm9kZUNoaWxkKG5vZGU6IHRzLk5vZGUsIGNiOiAobm9kZTogdHMuTm9kZSkgPT4gYm9vbGVhbikge1xuICByZXR1cm4gIXRzLmZvckVhY2hDaGlsZChub2RlLCBub2RlID0+ICFjYihub2RlKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1ByaW1pdGl2ZSh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBPYmplY3QodmFsdWUpICE9PSB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gaXNEZWZpbmVkKG9iajogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBvYmogIT09IHVuZGVmaW5lZDtcbn1cblxuLy8gaW1wb3J0IHtwcm9wZXJ0eU5hbWUgYXMgbmFtZX0gZnJvbSAncGxhY2UnXG4vLyBpbXBvcnQge25hbWV9IGZyb20gJ3BsYWNlJ1xuZXhwb3J0IGludGVyZmFjZSBJbXBvcnRTcGVjaWZpZXJNZXRhZGF0YSB7XG4gIG5hbWU6IHN0cmluZztcbiAgcHJvcGVydHlOYW1lPzogc3RyaW5nO1xufVxuZXhwb3J0IGludGVyZmFjZSBJbXBvcnRNZXRhZGF0YSB7XG4gIGRlZmF1bHROYW1lPzogc3RyaW5nOyAgICAgICAgICAgICAgICAgICAgICAvLyBpbXBvcnQgZCBmcm9tICdwbGFjZSdcbiAgbmFtZXNwYWNlPzogc3RyaW5nOyAgICAgICAgICAgICAgICAgICAgICAgIC8vIGltcG9ydCAqIGFzIGQgZnJvbSAncGxhY2UnXG4gIG5hbWVkSW1wb3J0cz86IEltcG9ydFNwZWNpZmllck1ldGFkYXRhW107ICAvLyBpbXBvcnQge2F9IGZyb20gJ3BsYWNlJ1xuICBmcm9tOiBzdHJpbmc7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZnJvbSAncGxhY2UnXG59XG5cblxuZnVuY3Rpb24gZ2V0U291cmNlRmlsZU9mTm9kZShub2RlOiB0cy5Ob2RlIHwgdW5kZWZpbmVkKTogdHMuU291cmNlRmlsZSB7XG4gIHdoaWxlIChub2RlICYmIG5vZGUua2luZCAhPSB0cy5TeW50YXhLaW5kLlNvdXJjZUZpbGUpIHtcbiAgICBub2RlID0gbm9kZS5wYXJlbnQ7XG4gIH1cbiAgcmV0dXJuIDx0cy5Tb3VyY2VGaWxlPm5vZGU7XG59XG5cbi8qIEBpbnRlcm5hbCAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNvdXJjZUluZm8oXG4gICAgbm9kZTogdHMuTm9kZSB8IHVuZGVmaW5lZCwgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSB8IHVuZGVmaW5lZCk6IE1ldGFkYXRhU291cmNlTG9jYXRpb25JbmZvIHtcbiAgaWYgKG5vZGUpIHtcbiAgICBzb3VyY2VGaWxlID0gc291cmNlRmlsZSB8fCBnZXRTb3VyY2VGaWxlT2ZOb2RlKG5vZGUpO1xuICAgIGlmIChzb3VyY2VGaWxlKSB7XG4gICAgICByZXR1cm4gdHMuZ2V0TGluZUFuZENoYXJhY3Rlck9mUG9zaXRpb24oc291cmNlRmlsZSwgbm9kZS5nZXRTdGFydChzb3VyY2VGaWxlKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiB7fTtcbn1cblxuLyogQGludGVybmFsICovXG5leHBvcnQgZnVuY3Rpb24gZXJyb3JTeW1ib2woXG4gICAgbWVzc2FnZTogc3RyaW5nLCBub2RlPzogdHMuTm9kZSwgY29udGV4dD86IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBzb3VyY2VGaWxlPzogdHMuU291cmNlRmlsZSk6IE1ldGFkYXRhRXJyb3Ige1xuICBjb25zdCByZXN1bHQ6IE1ldGFkYXRhRXJyb3IgPSB7X19zeW1ib2xpYzogJ2Vycm9yJywgbWVzc2FnZSwgLi4uc291cmNlSW5mbyhub2RlLCBzb3VyY2VGaWxlKX07XG4gIGlmIChjb250ZXh0KSB7XG4gICAgcmVzdWx0LmNvbnRleHQgPSBjb250ZXh0O1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogUHJvZHVjZSBhIHN5bWJvbGljIHJlcHJlc2VudGF0aW9uIG9mIGFuIGV4cHJlc3Npb24gZm9sZGluZyB2YWx1ZXMgaW50byB0aGVpciBmaW5hbCB2YWx1ZSB3aGVuXG4gKiBwb3NzaWJsZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEV2YWx1YXRvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBzeW1ib2xzOiBTeW1ib2xzLCBwcml2YXRlIG5vZGVNYXA6IE1hcDxNZXRhZGF0YUVudHJ5LCB0cy5Ob2RlPixcbiAgICAgIHByaXZhdGUgb3B0aW9uczogQ29sbGVjdG9yT3B0aW9ucyA9IHt9LFxuICAgICAgcHJpdmF0ZSByZWNvcmRFeHBvcnQ/OiAobmFtZTogc3RyaW5nLCB2YWx1ZTogTWV0YWRhdGFWYWx1ZSkgPT4gdm9pZCkge31cblxuICBuYW1lT2Yobm9kZTogdHMuTm9kZXx1bmRlZmluZWQpOiBzdHJpbmd8TWV0YWRhdGFFcnJvciB7XG4gICAgaWYgKG5vZGUgJiYgbm9kZS5raW5kID09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgICAgcmV0dXJuICg8dHMuSWRlbnRpZmllcj5ub2RlKS50ZXh0O1xuICAgIH1cbiAgICBjb25zdCByZXN1bHQgPSBub2RlICYmIHRoaXMuZXZhbHVhdGVOb2RlKG5vZGUpO1xuICAgIGlmIChpc01ldGFkYXRhRXJyb3IocmVzdWx0KSB8fCB0eXBlb2YgcmVzdWx0ID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGVycm9yU3ltYm9sKFxuICAgICAgICAgICdOYW1lIGV4cGVjdGVkJywgbm9kZSwge3JlY2VpdmVkOiAobm9kZSAmJiBub2RlLmdldFRleHQoKSkgfHwgJzxtaXNzaW5nPid9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBleHByZXNzaW9uIHJlcHJlc2VudGVkIGJ5IGBub2RlYCBjYW4gYmUgZm9sZGVkIGludG8gYSBsaXRlcmFsIGV4cHJlc3Npb24uXG4gICAqXG4gICAqIEZvciBleGFtcGxlLCBhIGxpdGVyYWwgaXMgYWx3YXlzIGZvbGRhYmxlLiBUaGlzIG1lYW5zIHRoYXQgbGl0ZXJhbCBleHByZXNzaW9ucyBzdWNoIGFzIGAxLjJgXG4gICAqIGBcIlNvbWUgdmFsdWVcImAgYHRydWVgIGBmYWxzZWAgYXJlIGZvbGRhYmxlLlxuICAgKlxuICAgKiAtIEFuIG9iamVjdCBsaXRlcmFsIGlzIGZvbGRhYmxlIGlmIGFsbCB0aGUgcHJvcGVydGllcyBpbiB0aGUgbGl0ZXJhbCBhcmUgZm9sZGFibGUuXG4gICAqIC0gQW4gYXJyYXkgbGl0ZXJhbCBpcyBmb2xkYWJsZSBpZiBhbGwgdGhlIGVsZW1lbnRzIGFyZSBmb2xkYWJsZS5cbiAgICogLSBBIGNhbGwgaXMgZm9sZGFibGUgaWYgaXQgaXMgYSBjYWxsIHRvIGEgQXJyYXkucHJvdG90eXBlLmNvbmNhdCBvciBhIGNhbGwgdG8gQ09OU1RfRVhQUi5cbiAgICogLSBBIHByb3BlcnR5IGFjY2VzcyBpcyBmb2xkYWJsZSBpZiB0aGUgb2JqZWN0IGlzIGZvbGRhYmxlLlxuICAgKiAtIEEgYXJyYXkgaW5kZXggaXMgZm9sZGFibGUgaWYgaW5kZXggZXhwcmVzc2lvbiBpcyBmb2xkYWJsZSBhbmQgdGhlIGFycmF5IGlzIGZvbGRhYmxlLlxuICAgKiAtIEJpbmFyeSBvcGVyYXRvciBleHByZXNzaW9ucyBhcmUgZm9sZGFibGUgaWYgdGhlIGxlZnQgYW5kIHJpZ2h0IGV4cHJlc3Npb25zIGFyZSBmb2xkYWJsZSBhbmRcbiAgICogICBpdCBpcyBvbmUgb2YgJysnLCAnLScsICcqJywgJy8nLCAnJScsICd8fCcsIGFuZCAnJiYnLlxuICAgKiAtIEFuIGlkZW50aWZpZXIgaXMgZm9sZGFibGUgaWYgYSB2YWx1ZSBjYW4gYmUgZm91bmQgZm9yIGl0cyBzeW1ib2wgaW4gdGhlIGV2YWx1YXRvciBzeW1ib2xcbiAgICogICB0YWJsZS5cbiAgICovXG4gIHB1YmxpYyBpc0ZvbGRhYmxlKG5vZGU6IHRzLk5vZGUpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0ZvbGRhYmxlV29ya2VyKG5vZGUsIG5ldyBNYXA8dHMuTm9kZSwgYm9vbGVhbj4oKSk7XG4gIH1cblxuICBwcml2YXRlIGlzRm9sZGFibGVXb3JrZXIobm9kZTogdHMuTm9kZXx1bmRlZmluZWQsIGZvbGRpbmc6IE1hcDx0cy5Ob2RlLCBib29sZWFuPik6IGJvb2xlYW4ge1xuICAgIGlmIChub2RlKSB7XG4gICAgICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb246XG4gICAgICAgICAgcmV0dXJuIGV2ZXJ5Tm9kZUNoaWxkKG5vZGUsIGNoaWxkID0+IHtcbiAgICAgICAgICAgIGlmIChjaGlsZC5raW5kID09PSB0cy5TeW50YXhLaW5kLlByb3BlcnR5QXNzaWdubWVudCkge1xuICAgICAgICAgICAgICBjb25zdCBwcm9wZXJ0eUFzc2lnbm1lbnQgPSA8dHMuUHJvcGVydHlBc3NpZ25tZW50PmNoaWxkO1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pc0ZvbGRhYmxlV29ya2VyKHByb3BlcnR5QXNzaWdubWVudC5pbml0aWFsaXplciwgZm9sZGluZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfSk7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5BcnJheUxpdGVyYWxFeHByZXNzaW9uOlxuICAgICAgICAgIHJldHVybiBldmVyeU5vZGVDaGlsZChub2RlLCBjaGlsZCA9PiB0aGlzLmlzRm9sZGFibGVXb3JrZXIoY2hpbGQsIGZvbGRpbmcpKTtcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNhbGxFeHByZXNzaW9uOlxuICAgICAgICAgIGNvbnN0IGNhbGxFeHByZXNzaW9uID0gPHRzLkNhbGxFeHByZXNzaW9uPm5vZGU7XG4gICAgICAgICAgLy8gV2UgY2FuIGZvbGQgYSA8YXJyYXk+LmNvbmNhdCg8dj4pLlxuICAgICAgICAgIGlmIChpc01ldGhvZENhbGxPZihjYWxsRXhwcmVzc2lvbiwgJ2NvbmNhdCcpICYmXG4gICAgICAgICAgICAgIGFycmF5T3JFbXB0eShjYWxsRXhwcmVzc2lvbi5hcmd1bWVudHMpLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgY29uc3QgYXJyYXlOb2RlID0gKDx0cy5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24+Y2FsbEV4cHJlc3Npb24uZXhwcmVzc2lvbikuZXhwcmVzc2lvbjtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzRm9sZGFibGVXb3JrZXIoYXJyYXlOb2RlLCBmb2xkaW5nKSAmJlxuICAgICAgICAgICAgICAgIHRoaXMuaXNGb2xkYWJsZVdvcmtlcihjYWxsRXhwcmVzc2lvbi5hcmd1bWVudHNbMF0sIGZvbGRpbmcpKSB7XG4gICAgICAgICAgICAgIC8vIEl0IG5lZWRzIHRvIGJlIGFuIGFycmF5LlxuICAgICAgICAgICAgICBjb25zdCBhcnJheVZhbHVlID0gdGhpcy5ldmFsdWF0ZU5vZGUoYXJyYXlOb2RlKTtcbiAgICAgICAgICAgICAgaWYgKGFycmF5VmFsdWUgJiYgQXJyYXkuaXNBcnJheShhcnJheVZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gV2UgY2FuIGZvbGQgYSBjYWxsIHRvIENPTlNUX0VYUFJcbiAgICAgICAgICBpZiAoaXNDYWxsT2YoY2FsbEV4cHJlc3Npb24sICdDT05TVF9FWFBSJykgJiZcbiAgICAgICAgICAgICAgYXJyYXlPckVtcHR5KGNhbGxFeHByZXNzaW9uLmFyZ3VtZW50cykubGVuZ3RoID09PSAxKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaXNGb2xkYWJsZVdvcmtlcihjYWxsRXhwcmVzc2lvbi5hcmd1bWVudHNbMF0sIGZvbGRpbmcpO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk5vU3Vic3RpdHV0aW9uVGVtcGxhdGVMaXRlcmFsOlxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbDpcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk51bWVyaWNMaXRlcmFsOlxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTnVsbEtleXdvcmQ6XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5UcnVlS2V5d29yZDpcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZhbHNlS2V5d29yZDpcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlRlbXBsYXRlSGVhZDpcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlRlbXBsYXRlTWlkZGxlOlxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVGVtcGxhdGVUYWlsOlxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUGFyZW50aGVzaXplZEV4cHJlc3Npb246XG4gICAgICAgICAgY29uc3QgcGFyZW50aGVzaXplZEV4cHJlc3Npb24gPSA8dHMuUGFyZW50aGVzaXplZEV4cHJlc3Npb24+bm9kZTtcbiAgICAgICAgICByZXR1cm4gdGhpcy5pc0ZvbGRhYmxlV29ya2VyKHBhcmVudGhlc2l6ZWRFeHByZXNzaW9uLmV4cHJlc3Npb24sIGZvbGRpbmcpO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQmluYXJ5RXhwcmVzc2lvbjpcbiAgICAgICAgICBjb25zdCBiaW5hcnlFeHByZXNzaW9uID0gPHRzLkJpbmFyeUV4cHJlc3Npb24+bm9kZTtcbiAgICAgICAgICBzd2l0Y2ggKGJpbmFyeUV4cHJlc3Npb24ub3BlcmF0b3JUb2tlbi5raW5kKSB7XG4gICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUGx1c1Rva2VuOlxuICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk1pbnVzVG9rZW46XG4gICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQXN0ZXJpc2tUb2tlbjpcbiAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5TbGFzaFRva2VuOlxuICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlBlcmNlbnRUb2tlbjpcbiAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5BbXBlcnNhbmRBbXBlcnNhbmRUb2tlbjpcbiAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5CYXJCYXJUb2tlbjpcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaXNGb2xkYWJsZVdvcmtlcihiaW5hcnlFeHByZXNzaW9uLmxlZnQsIGZvbGRpbmcpICYmXG4gICAgICAgICAgICAgICAgICB0aGlzLmlzRm9sZGFibGVXb3JrZXIoYmluYXJ5RXhwcmVzc2lvbi5yaWdodCwgZm9sZGluZyk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uOlxuICAgICAgICAgIGNvbnN0IHByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbiA9IDx0cy5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24+bm9kZTtcbiAgICAgICAgICByZXR1cm4gdGhpcy5pc0ZvbGRhYmxlV29ya2VyKHByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbi5leHByZXNzaW9uLCBmb2xkaW5nKTtcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkVsZW1lbnRBY2Nlc3NFeHByZXNzaW9uOlxuICAgICAgICAgIGNvbnN0IGVsZW1lbnRBY2Nlc3NFeHByZXNzaW9uID0gPHRzLkVsZW1lbnRBY2Nlc3NFeHByZXNzaW9uPm5vZGU7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuaXNGb2xkYWJsZVdvcmtlcihlbGVtZW50QWNjZXNzRXhwcmVzc2lvbi5leHByZXNzaW9uLCBmb2xkaW5nKSAmJlxuICAgICAgICAgICAgICB0aGlzLmlzRm9sZGFibGVXb3JrZXIoZWxlbWVudEFjY2Vzc0V4cHJlc3Npb24uYXJndW1lbnRFeHByZXNzaW9uLCBmb2xkaW5nKTtcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXI6XG4gICAgICAgICAgbGV0IGlkZW50aWZpZXIgPSA8dHMuSWRlbnRpZmllcj5ub2RlO1xuICAgICAgICAgIGxldCByZWZlcmVuY2UgPSB0aGlzLnN5bWJvbHMucmVzb2x2ZShpZGVudGlmaWVyLnRleHQpO1xuICAgICAgICAgIGlmIChyZWZlcmVuY2UgIT09IHVuZGVmaW5lZCAmJiBpc1ByaW1pdGl2ZShyZWZlcmVuY2UpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5UZW1wbGF0ZUV4cHJlc3Npb246XG4gICAgICAgICAgY29uc3QgdGVtcGxhdGVFeHByZXNzaW9uID0gPHRzLlRlbXBsYXRlRXhwcmVzc2lvbj5ub2RlO1xuICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZUV4cHJlc3Npb24udGVtcGxhdGVTcGFucy5ldmVyeShcbiAgICAgICAgICAgICAgc3BhbiA9PiB0aGlzLmlzRm9sZGFibGVXb3JrZXIoc3Bhbi5leHByZXNzaW9uLCBmb2xkaW5nKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9kdWNlIGEgSlNPTiBzZXJpYWxpYWJsZSBvYmplY3QgcmVwcmVzZW50aW5nIGBub2RlYC4gVGhlIGZvbGRhYmxlIHZhbHVlcyBpbiB0aGUgZXhwcmVzc2lvblxuICAgKiB0cmVlIGFyZSBmb2xkZWQuIEZvciBleGFtcGxlLCBhIG5vZGUgcmVwcmVzZW50aW5nIGAxICsgMmAgaXMgZm9sZGVkIGludG8gYDNgLlxuICAgKi9cbiAgcHVibGljIGV2YWx1YXRlTm9kZShub2RlOiB0cy5Ob2RlLCBwcmVmZXJSZWZlcmVuY2U/OiBib29sZWFuKTogTWV0YWRhdGFWYWx1ZSB7XG4gICAgY29uc3QgdCA9IHRoaXM7XG4gICAgbGV0IGVycm9yOiBNZXRhZGF0YUVycm9yfHVuZGVmaW5lZDtcblxuICAgIGZ1bmN0aW9uIHJlY29yZEVudHJ5KGVudHJ5OiBNZXRhZGF0YVZhbHVlLCBub2RlOiB0cy5Ob2RlKTogTWV0YWRhdGFWYWx1ZSB7XG4gICAgICBpZiAodC5vcHRpb25zLnN1YnN0aXR1dGVFeHByZXNzaW9uKSB7XG4gICAgICAgIGNvbnN0IG5ld0VudHJ5ID0gdC5vcHRpb25zLnN1YnN0aXR1dGVFeHByZXNzaW9uKGVudHJ5LCBub2RlKTtcbiAgICAgICAgaWYgKHQucmVjb3JkRXhwb3J0ICYmIG5ld0VudHJ5ICE9IGVudHJ5ICYmIGlzTWV0YWRhdGFHbG9iYWxSZWZlcmVuY2VFeHByZXNzaW9uKG5ld0VudHJ5KSkge1xuICAgICAgICAgIHQucmVjb3JkRXhwb3J0KG5ld0VudHJ5Lm5hbWUsIGVudHJ5KTtcbiAgICAgICAgfVxuICAgICAgICBlbnRyeSA9IG5ld0VudHJ5O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlY29yZE1hcEVudHJ5KGVudHJ5LCBub2RlLCB0Lm5vZGVNYXApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzRm9sZGFibGVFcnJvcih2YWx1ZTogYW55KTogdmFsdWUgaXMgTWV0YWRhdGFFcnJvciB7XG4gICAgICByZXR1cm4gIXQub3B0aW9ucy52ZXJib3NlSW52YWxpZEV4cHJlc3Npb24gJiYgaXNNZXRhZGF0YUVycm9yKHZhbHVlKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXNvbHZlTmFtZSA9IChuYW1lOiBzdHJpbmcsIHByZWZlclJlZmVyZW5jZT86IGJvb2xlYW4pOiBNZXRhZGF0YVZhbHVlID0+IHtcbiAgICAgIGNvbnN0IHJlZmVyZW5jZSA9IHRoaXMuc3ltYm9scy5yZXNvbHZlKG5hbWUsIHByZWZlclJlZmVyZW5jZSk7XG4gICAgICBpZiAocmVmZXJlbmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gRW5jb2RlIGFzIGEgZ2xvYmFsIHJlZmVyZW5jZS4gU3RhdGljUmVmbGVjdG9yIHdpbGwgY2hlY2sgdGhlIHJlZmVyZW5jZS5cbiAgICAgICAgcmV0dXJuIHJlY29yZEVudHJ5KHtfX3N5bWJvbGljOiAncmVmZXJlbmNlJywgbmFtZX0sIG5vZGUpO1xuICAgICAgfVxuICAgICAgaWYgKHJlZmVyZW5jZSAmJiBpc01ldGFkYXRhU3ltYm9saWNSZWZlcmVuY2VFeHByZXNzaW9uKHJlZmVyZW5jZSkpIHtcbiAgICAgICAgcmV0dXJuIHJlY29yZEVudHJ5KHsuLi5yZWZlcmVuY2V9LCBub2RlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZWZlcmVuY2U7XG4gICAgfTtcblxuICAgIHN3aXRjaCAobm9kZS5raW5kKSB7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb246XG4gICAgICAgIGxldCBvYmo6IHtbbmFtZTogc3RyaW5nXTogYW55fSA9IHt9O1xuICAgICAgICBsZXQgcXVvdGVkOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICB0cy5mb3JFYWNoQ2hpbGQobm9kZSwgY2hpbGQgPT4ge1xuICAgICAgICAgIHN3aXRjaCAoY2hpbGQua2luZCkge1xuICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlNob3J0aGFuZFByb3BlcnR5QXNzaWdubWVudDpcbiAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Qcm9wZXJ0eUFzc2lnbm1lbnQ6XG4gICAgICAgICAgICAgIGNvbnN0IGFzc2lnbm1lbnQgPSA8dHMuUHJvcGVydHlBc3NpZ25tZW50fHRzLlNob3J0aGFuZFByb3BlcnR5QXNzaWdubWVudD5jaGlsZDtcbiAgICAgICAgICAgICAgaWYgKGFzc2lnbm1lbnQubmFtZS5raW5kID09IHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSAoYXNzaWdubWVudC5uYW1lIGFzIHRzLlN0cmluZ0xpdGVyYWwpLnRleHQ7XG4gICAgICAgICAgICAgICAgcXVvdGVkLnB1c2gobmFtZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QgcHJvcGVydHlOYW1lID0gdGhpcy5uYW1lT2YoYXNzaWdubWVudC5uYW1lKTtcbiAgICAgICAgICAgICAgaWYgKGlzRm9sZGFibGVFcnJvcihwcm9wZXJ0eU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgZXJyb3IgPSBwcm9wZXJ0eU5hbWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QgcHJvcGVydHlWYWx1ZSA9IGlzUHJvcGVydHlBc3NpZ25tZW50KGFzc2lnbm1lbnQpID9cbiAgICAgICAgICAgICAgICAgIHRoaXMuZXZhbHVhdGVOb2RlKGFzc2lnbm1lbnQuaW5pdGlhbGl6ZXIsIC8qIHByZWZlclJlZmVyZW5jZSAqLyB0cnVlKSA6XG4gICAgICAgICAgICAgICAgICByZXNvbHZlTmFtZShwcm9wZXJ0eU5hbWUsIC8qIHByZWZlclJlZmVyZW5jZSAqLyB0cnVlKTtcbiAgICAgICAgICAgICAgaWYgKGlzRm9sZGFibGVFcnJvcihwcm9wZXJ0eVZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGVycm9yID0gcHJvcGVydHlWYWx1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTsgIC8vIFN0b3AgdGhlIGZvckVhY2hDaGlsZC5cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvYmpbPHN0cmluZz5wcm9wZXJ0eU5hbWVdID0gaXNQcm9wZXJ0eUFzc2lnbm1lbnQoYXNzaWdubWVudCkgP1xuICAgICAgICAgICAgICAgICAgICByZWNvcmRFbnRyeShwcm9wZXJ0eVZhbHVlLCBhc3NpZ25tZW50LmluaXRpYWxpemVyKSA6XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5VmFsdWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoZXJyb3IpIHJldHVybiBlcnJvcjtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5xdW90ZWROYW1lcyAmJiBxdW90ZWQubGVuZ3RoKSB7XG4gICAgICAgICAgb2JqWyckcXVvdGVkJCddID0gcXVvdGVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZWNvcmRFbnRyeShvYmosIG5vZGUpO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkFycmF5TGl0ZXJhbEV4cHJlc3Npb246XG4gICAgICAgIGxldCBhcnI6IE1ldGFkYXRhVmFsdWVbXSA9IFtdO1xuICAgICAgICB0cy5mb3JFYWNoQ2hpbGQobm9kZSwgY2hpbGQgPT4ge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5ldmFsdWF0ZU5vZGUoY2hpbGQsIC8qIHByZWZlclJlZmVyZW5jZSAqLyB0cnVlKTtcblxuICAgICAgICAgIC8vIENoZWNrIGZvciBlcnJvclxuICAgICAgICAgIGlmIChpc0ZvbGRhYmxlRXJyb3IodmFsdWUpKSB7XG4gICAgICAgICAgICBlcnJvciA9IHZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7ICAvLyBTdG9wIHRoZSBmb3JFYWNoQ2hpbGQuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSGFuZGxlIHNwcmVhZCBleHByZXNzaW9uc1xuICAgICAgICAgIGlmIChpc01ldGFkYXRhU3ltYm9saWNTcHJlYWRFeHByZXNzaW9uKHZhbHVlKSkge1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUuZXhwcmVzc2lvbikpIHtcbiAgICAgICAgICAgICAgZm9yIChjb25zdCBzcHJlYWRWYWx1ZSBvZiB2YWx1ZS5leHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgYXJyLnB1c2goc3ByZWFkVmFsdWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBhcnIucHVzaCh2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoZXJyb3IpIHJldHVybiBlcnJvcjtcbiAgICAgICAgcmV0dXJuIHJlY29yZEVudHJ5KGFyciwgbm9kZSk7XG4gICAgICBjYXNlIHNwcmVhZEVsZW1lbnRTeW50YXhLaW5kOlxuICAgICAgICBsZXQgc3ByZWFkRXhwcmVzc2lvbiA9IHRoaXMuZXZhbHVhdGVOb2RlKChub2RlIGFzIGFueSkuZXhwcmVzc2lvbik7XG4gICAgICAgIHJldHVybiByZWNvcmRFbnRyeSh7X19zeW1ib2xpYzogJ3NwcmVhZCcsIGV4cHJlc3Npb246IHNwcmVhZEV4cHJlc3Npb259LCBub2RlKTtcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5DYWxsRXhwcmVzc2lvbjpcbiAgICAgICAgY29uc3QgY2FsbEV4cHJlc3Npb24gPSA8dHMuQ2FsbEV4cHJlc3Npb24+bm9kZTtcbiAgICAgICAgaWYgKGlzQ2FsbE9mKGNhbGxFeHByZXNzaW9uLCAnZm9yd2FyZFJlZicpICYmXG4gICAgICAgICAgICBhcnJheU9yRW1wdHkoY2FsbEV4cHJlc3Npb24uYXJndW1lbnRzKS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICBjb25zdCBmaXJzdEFyZ3VtZW50ID0gY2FsbEV4cHJlc3Npb24uYXJndW1lbnRzWzBdO1xuICAgICAgICAgIGlmIChmaXJzdEFyZ3VtZW50LmtpbmQgPT0gdHMuU3ludGF4S2luZC5BcnJvd0Z1bmN0aW9uKSB7XG4gICAgICAgICAgICBjb25zdCBhcnJvd0Z1bmN0aW9uID0gPHRzLkFycm93RnVuY3Rpb24+Zmlyc3RBcmd1bWVudDtcbiAgICAgICAgICAgIHJldHVybiByZWNvcmRFbnRyeSh0aGlzLmV2YWx1YXRlTm9kZShhcnJvd0Z1bmN0aW9uLmJvZHkpLCBub2RlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYXJncyA9IGFycmF5T3JFbXB0eShjYWxsRXhwcmVzc2lvbi5hcmd1bWVudHMpLm1hcChhcmcgPT4gdGhpcy5ldmFsdWF0ZU5vZGUoYXJnKSk7XG4gICAgICAgIGlmICh0aGlzLmlzRm9sZGFibGUoY2FsbEV4cHJlc3Npb24pKSB7XG4gICAgICAgICAgaWYgKGlzTWV0aG9kQ2FsbE9mKGNhbGxFeHByZXNzaW9uLCAnY29uY2F0JykpIHtcbiAgICAgICAgICAgIGNvbnN0IGFycmF5VmFsdWUgPSA8TWV0YWRhdGFWYWx1ZVtdPnRoaXMuZXZhbHVhdGVOb2RlKFxuICAgICAgICAgICAgICAgICg8dHMuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uPmNhbGxFeHByZXNzaW9uLmV4cHJlc3Npb24pLmV4cHJlc3Npb24pO1xuICAgICAgICAgICAgaWYgKGlzRm9sZGFibGVFcnJvcihhcnJheVZhbHVlKSkgcmV0dXJuIGFycmF5VmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gYXJyYXlWYWx1ZS5jb25jYXQoYXJnc1swXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEFsd2F5cyBmb2xkIGEgQ09OU1RfRVhQUiBldmVuIGlmIHRoZSBhcmd1bWVudCBpcyBub3QgZm9sZGFibGUuXG4gICAgICAgIGlmIChpc0NhbGxPZihjYWxsRXhwcmVzc2lvbiwgJ0NPTlNUX0VYUFInKSAmJlxuICAgICAgICAgICAgYXJyYXlPckVtcHR5KGNhbGxFeHByZXNzaW9uLmFyZ3VtZW50cykubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIHJlY29yZEVudHJ5KGFyZ3NbMF0sIG5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGV4cHJlc3Npb24gPSB0aGlzLmV2YWx1YXRlTm9kZShjYWxsRXhwcmVzc2lvbi5leHByZXNzaW9uKTtcbiAgICAgICAgaWYgKGlzRm9sZGFibGVFcnJvcihleHByZXNzaW9uKSkge1xuICAgICAgICAgIHJldHVybiByZWNvcmRFbnRyeShleHByZXNzaW9uLCBub2RlKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcmVzdWx0OiBNZXRhZGF0YVN5bWJvbGljQ2FsbEV4cHJlc3Npb24gPSB7X19zeW1ib2xpYzogJ2NhbGwnLCBleHByZXNzaW9uOiBleHByZXNzaW9ufTtcbiAgICAgICAgaWYgKGFyZ3MgJiYgYXJncy5sZW5ndGgpIHtcbiAgICAgICAgICByZXN1bHQuYXJndW1lbnRzID0gYXJncztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVjb3JkRW50cnkocmVzdWx0LCBub2RlKTtcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5OZXdFeHByZXNzaW9uOlxuICAgICAgICBjb25zdCBuZXdFeHByZXNzaW9uID0gPHRzLk5ld0V4cHJlc3Npb24+bm9kZTtcbiAgICAgICAgY29uc3QgbmV3QXJncyA9IGFycmF5T3JFbXB0eShuZXdFeHByZXNzaW9uLmFyZ3VtZW50cykubWFwKGFyZyA9PiB0aGlzLmV2YWx1YXRlTm9kZShhcmcpKTtcbiAgICAgICAgY29uc3QgbmV3VGFyZ2V0ID0gdGhpcy5ldmFsdWF0ZU5vZGUobmV3RXhwcmVzc2lvbi5leHByZXNzaW9uKTtcbiAgICAgICAgaWYgKGlzTWV0YWRhdGFFcnJvcihuZXdUYXJnZXQpKSB7XG4gICAgICAgICAgcmV0dXJuIHJlY29yZEVudHJ5KG5ld1RhcmdldCwgbm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2FsbDogTWV0YWRhdGFTeW1ib2xpY0NhbGxFeHByZXNzaW9uID0ge19fc3ltYm9saWM6ICduZXcnLCBleHByZXNzaW9uOiBuZXdUYXJnZXR9O1xuICAgICAgICBpZiAobmV3QXJncy5sZW5ndGgpIHtcbiAgICAgICAgICBjYWxsLmFyZ3VtZW50cyA9IG5ld0FyZ3M7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlY29yZEVudHJ5KGNhbGwsIG5vZGUpO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbjoge1xuICAgICAgICBjb25zdCBwcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24gPSA8dHMuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uPm5vZGU7XG4gICAgICAgIGNvbnN0IGV4cHJlc3Npb24gPSB0aGlzLmV2YWx1YXRlTm9kZShwcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24uZXhwcmVzc2lvbik7XG4gICAgICAgIGlmIChpc0ZvbGRhYmxlRXJyb3IoZXhwcmVzc2lvbikpIHtcbiAgICAgICAgICByZXR1cm4gcmVjb3JkRW50cnkoZXhwcmVzc2lvbiwgbm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWVtYmVyID0gdGhpcy5uYW1lT2YocHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uLm5hbWUpO1xuICAgICAgICBpZiAoaXNGb2xkYWJsZUVycm9yKG1lbWJlcikpIHtcbiAgICAgICAgICByZXR1cm4gcmVjb3JkRW50cnkobWVtYmVyLCBub2RlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXhwcmVzc2lvbiAmJiB0aGlzLmlzRm9sZGFibGUocHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uLmV4cHJlc3Npb24pKVxuICAgICAgICAgIHJldHVybiAoPGFueT5leHByZXNzaW9uKVs8c3RyaW5nPm1lbWJlcl07XG4gICAgICAgIGlmIChpc01ldGFkYXRhTW9kdWxlUmVmZXJlbmNlRXhwcmVzc2lvbihleHByZXNzaW9uKSkge1xuICAgICAgICAgIC8vIEEgc2VsZWN0IGludG8gYSBtb2R1bGUgcmVmZXJlbmNlIGFuZCBiZSBjb252ZXJ0ZWQgaW50byBhIHJlZmVyZW5jZSB0byB0aGUgc3ltYm9sXG4gICAgICAgICAgLy8gaW4gdGhlIG1vZHVsZVxuICAgICAgICAgIHJldHVybiByZWNvcmRFbnRyeShcbiAgICAgICAgICAgICAge19fc3ltYm9saWM6ICdyZWZlcmVuY2UnLCBtb2R1bGU6IGV4cHJlc3Npb24ubW9kdWxlLCBuYW1lOiBtZW1iZXJ9LCBub2RlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVjb3JkRW50cnkoe19fc3ltYm9saWM6ICdzZWxlY3QnLCBleHByZXNzaW9uLCBtZW1iZXJ9LCBub2RlKTtcbiAgICAgIH1cbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5FbGVtZW50QWNjZXNzRXhwcmVzc2lvbjoge1xuICAgICAgICBjb25zdCBlbGVtZW50QWNjZXNzRXhwcmVzc2lvbiA9IDx0cy5FbGVtZW50QWNjZXNzRXhwcmVzc2lvbj5ub2RlO1xuICAgICAgICBjb25zdCBleHByZXNzaW9uID0gdGhpcy5ldmFsdWF0ZU5vZGUoZWxlbWVudEFjY2Vzc0V4cHJlc3Npb24uZXhwcmVzc2lvbik7XG4gICAgICAgIGlmIChpc0ZvbGRhYmxlRXJyb3IoZXhwcmVzc2lvbikpIHtcbiAgICAgICAgICByZXR1cm4gcmVjb3JkRW50cnkoZXhwcmVzc2lvbiwgbm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFlbGVtZW50QWNjZXNzRXhwcmVzc2lvbi5hcmd1bWVudEV4cHJlc3Npb24pIHtcbiAgICAgICAgICByZXR1cm4gcmVjb3JkRW50cnkoZXJyb3JTeW1ib2woJ0V4cHJlc3Npb24gZm9ybSBub3Qgc3VwcG9ydGVkJywgbm9kZSksIG5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5ldmFsdWF0ZU5vZGUoZWxlbWVudEFjY2Vzc0V4cHJlc3Npb24uYXJndW1lbnRFeHByZXNzaW9uKTtcbiAgICAgICAgaWYgKGlzRm9sZGFibGVFcnJvcihleHByZXNzaW9uKSkge1xuICAgICAgICAgIHJldHVybiByZWNvcmRFbnRyeShleHByZXNzaW9uLCBub2RlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pc0ZvbGRhYmxlKGVsZW1lbnRBY2Nlc3NFeHByZXNzaW9uLmV4cHJlc3Npb24pICYmXG4gICAgICAgICAgICB0aGlzLmlzRm9sZGFibGUoZWxlbWVudEFjY2Vzc0V4cHJlc3Npb24uYXJndW1lbnRFeHByZXNzaW9uKSlcbiAgICAgICAgICByZXR1cm4gKDxhbnk+ZXhwcmVzc2lvbilbPHN0cmluZ3xudW1iZXI+aW5kZXhdO1xuICAgICAgICByZXR1cm4gcmVjb3JkRW50cnkoe19fc3ltYm9saWM6ICdpbmRleCcsIGV4cHJlc3Npb24sIGluZGV4fSwgbm9kZSk7XG4gICAgICB9XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcjpcbiAgICAgICAgY29uc3QgaWRlbnRpZmllciA9IDx0cy5JZGVudGlmaWVyPm5vZGU7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBpZGVudGlmaWVyLnRleHQ7XG4gICAgICAgIHJldHVybiByZXNvbHZlTmFtZShuYW1lLCBwcmVmZXJSZWZlcmVuY2UpO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlR5cGVSZWZlcmVuY2U6XG4gICAgICAgIGNvbnN0IHR5cGVSZWZlcmVuY2VOb2RlID0gPHRzLlR5cGVSZWZlcmVuY2VOb2RlPm5vZGU7XG4gICAgICAgIGNvbnN0IHR5cGVOYW1lTm9kZSA9IHR5cGVSZWZlcmVuY2VOb2RlLnR5cGVOYW1lO1xuICAgICAgICBjb25zdCBnZXRSZWZlcmVuY2U6ICh0eXBlTmFtZU5vZGU6IHRzLklkZW50aWZpZXIgfCB0cy5RdWFsaWZpZWROYW1lKSA9PiBNZXRhZGF0YVZhbHVlID1cbiAgICAgICAgICAgIG5vZGUgPT4ge1xuICAgICAgICAgICAgICBpZiAodHlwZU5hbWVOb2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUXVhbGlmaWVkTmFtZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHF1YWxpZmllZE5hbWUgPSA8dHMuUXVhbGlmaWVkTmFtZT5ub2RlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxlZnQgPSB0aGlzLmV2YWx1YXRlTm9kZShxdWFsaWZpZWROYW1lLmxlZnQpO1xuICAgICAgICAgICAgICAgIGlmIChpc01ldGFkYXRhTW9kdWxlUmVmZXJlbmNlRXhwcmVzc2lvbihsZWZ0KSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlY29yZEVudHJ5KFxuICAgICAgICAgICAgICAgICAgICAgIDxNZXRhZGF0YUltcG9ydGVkU3ltYm9sUmVmZXJlbmNlRXhwcmVzc2lvbj57XG4gICAgICAgICAgICAgICAgICAgICAgICBfX3N5bWJvbGljOiAncmVmZXJlbmNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZTogbGVmdC5tb2R1bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBxdWFsaWZpZWROYW1lLnJpZ2h0LnRleHRcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIG5vZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBSZWNvcmQgYSB0eXBlIHJlZmVyZW5jZSB0byBhIGRlY2xhcmVkIHR5cGUgYXMgYSBzZWxlY3QuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtfX3N5bWJvbGljOiAnc2VsZWN0JywgZXhwcmVzc2lvbjogbGVmdCwgbWVtYmVyOiBxdWFsaWZpZWROYW1lLnJpZ2h0LnRleHR9O1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkZW50aWZpZXIgPSA8dHMuSWRlbnRpZmllcj50eXBlTmFtZU5vZGU7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3ltYm9sID0gdGhpcy5zeW1ib2xzLnJlc29sdmUoaWRlbnRpZmllci50ZXh0KTtcbiAgICAgICAgICAgICAgICBpZiAoaXNGb2xkYWJsZUVycm9yKHN5bWJvbCkgfHwgaXNNZXRhZGF0YVN5bWJvbGljUmVmZXJlbmNlRXhwcmVzc2lvbihzeW1ib2wpKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVjb3JkRW50cnkoc3ltYm9sLCBub2RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlY29yZEVudHJ5KFxuICAgICAgICAgICAgICAgICAgICBlcnJvclN5bWJvbCgnQ291bGQgbm90IHJlc29sdmUgdHlwZScsIG5vZGUsIHt0eXBlTmFtZTogaWRlbnRpZmllci50ZXh0fSksIG5vZGUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICBjb25zdCB0eXBlUmVmZXJlbmNlID0gZ2V0UmVmZXJlbmNlKHR5cGVOYW1lTm9kZSk7XG4gICAgICAgIGlmIChpc0ZvbGRhYmxlRXJyb3IodHlwZVJlZmVyZW5jZSkpIHtcbiAgICAgICAgICByZXR1cm4gcmVjb3JkRW50cnkodHlwZVJlZmVyZW5jZSwgbm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc01ldGFkYXRhTW9kdWxlUmVmZXJlbmNlRXhwcmVzc2lvbih0eXBlUmVmZXJlbmNlKSAmJlxuICAgICAgICAgICAgdHlwZVJlZmVyZW5jZU5vZGUudHlwZUFyZ3VtZW50cyAmJiB0eXBlUmVmZXJlbmNlTm9kZS50eXBlQXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgIGNvbnN0IGFyZ3MgPSB0eXBlUmVmZXJlbmNlTm9kZS50eXBlQXJndW1lbnRzLm1hcChlbGVtZW50ID0+IHRoaXMuZXZhbHVhdGVOb2RlKGVsZW1lbnQpKTtcbiAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgdHlwZWNhc3Qgd2hlbiB1cGdyYWRlZCB0byAyLjAgYXMgaXQgd2lsbCBiZSBjb3JyZWN0bHkgaW5mZXJyZWQuXG4gICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiAxLjkgZG8gbm90IGluZmVyIHRoaXMgY29ycmVjdGx5LlxuICAgICAgICAgICg8TWV0YWRhdGFJbXBvcnRlZFN5bWJvbFJlZmVyZW5jZUV4cHJlc3Npb24+dHlwZVJlZmVyZW5jZSkuYXJndW1lbnRzID0gYXJncztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVjb3JkRW50cnkodHlwZVJlZmVyZW5jZSwgbm9kZSk7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVW5pb25UeXBlOlxuICAgICAgICBjb25zdCB1bmlvblR5cGUgPSA8dHMuVW5pb25UeXBlTm9kZT5ub2RlO1xuXG4gICAgICAgIC8vIFJlbW92ZSBudWxsIGFuZCB1bmRlZmluZWQgZnJvbSB0aGUgbGlzdCBvZiB1bmlvbnMuXG4gICAgICAgIGNvbnN0IHJlZmVyZW5jZXMgPSB1bmlvblR5cGUudHlwZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuID0+IG4ua2luZCAhPSB0cy5TeW50YXhLaW5kLk51bGxLZXl3b3JkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuLmtpbmQgIT0gdHMuU3ludGF4S2luZC5VbmRlZmluZWRLZXl3b3JkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAobiA9PiB0aGlzLmV2YWx1YXRlTm9kZShuKSk7XG5cbiAgICAgICAgLy8gVGhlIHJlbW1haW5pbmcgcmVmZXJlbmNlIG11c3QgYmUgdGhlIHNhbWUuIElmIHR3byBoYXZlIHR5cGUgYXJndW1lbnRzIGNvbnNpZGVyIHRoZW1cbiAgICAgICAgLy8gZGlmZmVyZW50IGV2ZW4gaWYgdGhlIHR5cGUgYXJndW1lbnRzIGFyZSB0aGUgc2FtZS5cbiAgICAgICAgbGV0IGNhbmRpZGF0ZTogYW55ID0gbnVsbDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZWZlcmVuY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgcmVmZXJlbmNlID0gcmVmZXJlbmNlc1tpXTtcbiAgICAgICAgICBpZiAoaXNNZXRhZGF0YVN5bWJvbGljUmVmZXJlbmNlRXhwcmVzc2lvbihyZWZlcmVuY2UpKSB7XG4gICAgICAgICAgICBpZiAoY2FuZGlkYXRlKSB7XG4gICAgICAgICAgICAgIGlmICgocmVmZXJlbmNlIGFzIGFueSkubmFtZSA9PSBjYW5kaWRhdGUubmFtZSAmJlxuICAgICAgICAgICAgICAgICAgKHJlZmVyZW5jZSBhcyBhbnkpLm1vZHVsZSA9PSBjYW5kaWRhdGUubW9kdWxlICYmICEocmVmZXJlbmNlIGFzIGFueSkuYXJndW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgY2FuZGlkYXRlID0gcmVmZXJlbmNlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjYW5kaWRhdGUgPSByZWZlcmVuY2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiByZWZlcmVuY2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjYW5kaWRhdGUpIHJldHVybiBjYW5kaWRhdGU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk5vU3Vic3RpdHV0aW9uVGVtcGxhdGVMaXRlcmFsOlxuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWw6XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVGVtcGxhdGVIZWFkOlxuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlRlbXBsYXRlVGFpbDpcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5UZW1wbGF0ZU1pZGRsZTpcbiAgICAgICAgcmV0dXJuICg8dHMuTGl0ZXJhbExpa2VOb2RlPm5vZGUpLnRleHQ7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTnVtZXJpY0xpdGVyYWw6XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KCg8dHMuTGl0ZXJhbEV4cHJlc3Npb24+bm9kZSkudGV4dCk7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQW55S2V5d29yZDpcbiAgICAgICAgcmV0dXJuIHJlY29yZEVudHJ5KHtfX3N5bWJvbGljOiAncmVmZXJlbmNlJywgbmFtZTogJ2FueSd9LCBub2RlKTtcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5TdHJpbmdLZXl3b3JkOlxuICAgICAgICByZXR1cm4gcmVjb3JkRW50cnkoe19fc3ltYm9saWM6ICdyZWZlcmVuY2UnLCBuYW1lOiAnc3RyaW5nJ30sIG5vZGUpO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk51bWJlcktleXdvcmQ6XG4gICAgICAgIHJldHVybiByZWNvcmRFbnRyeSh7X19zeW1ib2xpYzogJ3JlZmVyZW5jZScsIG5hbWU6ICdudW1iZXInfSwgbm9kZSk7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQm9vbGVhbktleXdvcmQ6XG4gICAgICAgIHJldHVybiByZWNvcmRFbnRyeSh7X19zeW1ib2xpYzogJ3JlZmVyZW5jZScsIG5hbWU6ICdib29sZWFuJ30sIG5vZGUpO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkFycmF5VHlwZTpcbiAgICAgICAgY29uc3QgYXJyYXlUeXBlTm9kZSA9IDx0cy5BcnJheVR5cGVOb2RlPm5vZGU7XG4gICAgICAgIHJldHVybiByZWNvcmRFbnRyeShcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgX19zeW1ib2xpYzogJ3JlZmVyZW5jZScsXG4gICAgICAgICAgICAgIG5hbWU6ICdBcnJheScsXG4gICAgICAgICAgICAgIGFyZ3VtZW50czogW3RoaXMuZXZhbHVhdGVOb2RlKGFycmF5VHlwZU5vZGUuZWxlbWVudFR5cGUpXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG5vZGUpO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk51bGxLZXl3b3JkOlxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5UcnVlS2V5d29yZDpcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRmFsc2VLZXl3b3JkOlxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUGFyZW50aGVzaXplZEV4cHJlc3Npb246XG4gICAgICAgIGNvbnN0IHBhcmVudGhlc2l6ZWRFeHByZXNzaW9uID0gPHRzLlBhcmVudGhlc2l6ZWRFeHByZXNzaW9uPm5vZGU7XG4gICAgICAgIHJldHVybiB0aGlzLmV2YWx1YXRlTm9kZShwYXJlbnRoZXNpemVkRXhwcmVzc2lvbi5leHByZXNzaW9uKTtcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5UeXBlQXNzZXJ0aW9uRXhwcmVzc2lvbjpcbiAgICAgICAgY29uc3QgdHlwZUFzc2VydGlvbiA9IDx0cy5UeXBlQXNzZXJ0aW9uPm5vZGU7XG4gICAgICAgIHJldHVybiB0aGlzLmV2YWx1YXRlTm9kZSh0eXBlQXNzZXJ0aW9uLmV4cHJlc3Npb24pO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlByZWZpeFVuYXJ5RXhwcmVzc2lvbjpcbiAgICAgICAgY29uc3QgcHJlZml4VW5hcnlFeHByZXNzaW9uID0gPHRzLlByZWZpeFVuYXJ5RXhwcmVzc2lvbj5ub2RlO1xuICAgICAgICBjb25zdCBvcGVyYW5kID0gdGhpcy5ldmFsdWF0ZU5vZGUocHJlZml4VW5hcnlFeHByZXNzaW9uLm9wZXJhbmQpO1xuICAgICAgICBpZiAoaXNEZWZpbmVkKG9wZXJhbmQpICYmIGlzUHJpbWl0aXZlKG9wZXJhbmQpKSB7XG4gICAgICAgICAgc3dpdGNoIChwcmVmaXhVbmFyeUV4cHJlc3Npb24ub3BlcmF0b3IpIHtcbiAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5QbHVzVG9rZW46XG4gICAgICAgICAgICAgIHJldHVybiArKG9wZXJhbmQgYXMgYW55KTtcbiAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5NaW51c1Rva2VuOlxuICAgICAgICAgICAgICByZXR1cm4gLShvcGVyYW5kIGFzIGFueSk7XG4gICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVGlsZGVUb2tlbjpcbiAgICAgICAgICAgICAgcmV0dXJuIH4ob3BlcmFuZCBhcyBhbnkpO1xuICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkV4Y2xhbWF0aW9uVG9rZW46XG4gICAgICAgICAgICAgIHJldHVybiAhb3BlcmFuZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG9wZXJhdG9yVGV4dDogc3RyaW5nO1xuICAgICAgICBzd2l0Y2ggKHByZWZpeFVuYXJ5RXhwcmVzc2lvbi5vcGVyYXRvcikge1xuICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5QbHVzVG9rZW46XG4gICAgICAgICAgICBvcGVyYXRvclRleHQgPSAnKyc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTWludXNUb2tlbjpcbiAgICAgICAgICAgIG9wZXJhdG9yVGV4dCA9ICctJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5UaWxkZVRva2VuOlxuICAgICAgICAgICAgb3BlcmF0b3JUZXh0ID0gJ34nO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkV4Y2xhbWF0aW9uVG9rZW46XG4gICAgICAgICAgICBvcGVyYXRvclRleHQgPSAnISc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVjb3JkRW50cnkoe19fc3ltYm9saWM6ICdwcmUnLCBvcGVyYXRvcjogb3BlcmF0b3JUZXh0LCBvcGVyYW5kOiBvcGVyYW5kfSwgbm9kZSk7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQmluYXJ5RXhwcmVzc2lvbjpcbiAgICAgICAgY29uc3QgYmluYXJ5RXhwcmVzc2lvbiA9IDx0cy5CaW5hcnlFeHByZXNzaW9uPm5vZGU7XG4gICAgICAgIGNvbnN0IGxlZnQgPSB0aGlzLmV2YWx1YXRlTm9kZShiaW5hcnlFeHByZXNzaW9uLmxlZnQpO1xuICAgICAgICBjb25zdCByaWdodCA9IHRoaXMuZXZhbHVhdGVOb2RlKGJpbmFyeUV4cHJlc3Npb24ucmlnaHQpO1xuICAgICAgICBpZiAoaXNEZWZpbmVkKGxlZnQpICYmIGlzRGVmaW5lZChyaWdodCkpIHtcbiAgICAgICAgICBpZiAoaXNQcmltaXRpdmUobGVmdCkgJiYgaXNQcmltaXRpdmUocmlnaHQpKVxuICAgICAgICAgICAgc3dpdGNoIChiaW5hcnlFeHByZXNzaW9uLm9wZXJhdG9yVG9rZW4ua2luZCkge1xuICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQmFyQmFyVG9rZW46XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxhbnk+bGVmdCB8fCA8YW55PnJpZ2h0O1xuICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQW1wZXJzYW5kQW1wZXJzYW5kVG9rZW46XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxhbnk+bGVmdCAmJiA8YW55PnJpZ2h0O1xuICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQW1wZXJzYW5kVG9rZW46XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxhbnk+bGVmdCAmIDxhbnk+cmlnaHQ7XG4gICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5CYXJUb2tlbjpcbiAgICAgICAgICAgICAgICByZXR1cm4gPGFueT5sZWZ0IHwgPGFueT5yaWdodDtcbiAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNhcmV0VG9rZW46XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxhbnk+bGVmdCBeIDxhbnk+cmlnaHQ7XG4gICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5FcXVhbHNFcXVhbHNUb2tlbjpcbiAgICAgICAgICAgICAgICByZXR1cm4gPGFueT5sZWZ0ID09IDxhbnk+cmlnaHQ7XG4gICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5FeGNsYW1hdGlvbkVxdWFsc1Rva2VuOlxuICAgICAgICAgICAgICAgIHJldHVybiA8YW55PmxlZnQgIT0gPGFueT5yaWdodDtcbiAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkVxdWFsc0VxdWFsc0VxdWFsc1Rva2VuOlxuICAgICAgICAgICAgICAgIHJldHVybiA8YW55PmxlZnQgPT09IDxhbnk+cmlnaHQ7XG4gICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5FeGNsYW1hdGlvbkVxdWFsc0VxdWFsc1Rva2VuOlxuICAgICAgICAgICAgICAgIHJldHVybiA8YW55PmxlZnQgIT09IDxhbnk+cmlnaHQ7XG4gICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5MZXNzVGhhblRva2VuOlxuICAgICAgICAgICAgICAgIHJldHVybiA8YW55PmxlZnQgPCA8YW55PnJpZ2h0O1xuICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuR3JlYXRlclRoYW5Ub2tlbjpcbiAgICAgICAgICAgICAgICByZXR1cm4gPGFueT5sZWZ0ID4gPGFueT5yaWdodDtcbiAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkxlc3NUaGFuRXF1YWxzVG9rZW46XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxhbnk+bGVmdCA8PSA8YW55PnJpZ2h0O1xuICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuR3JlYXRlclRoYW5FcXVhbHNUb2tlbjpcbiAgICAgICAgICAgICAgICByZXR1cm4gPGFueT5sZWZ0ID49IDxhbnk+cmlnaHQ7XG4gICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5MZXNzVGhhbkxlc3NUaGFuVG9rZW46XG4gICAgICAgICAgICAgICAgcmV0dXJuICg8YW55PmxlZnQpIDw8ICg8YW55PnJpZ2h0KTtcbiAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkdyZWF0ZXJUaGFuR3JlYXRlclRoYW5Ub2tlbjpcbiAgICAgICAgICAgICAgICByZXR1cm4gPGFueT5sZWZ0ID4+IDxhbnk+cmlnaHQ7XG4gICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5HcmVhdGVyVGhhbkdyZWF0ZXJUaGFuR3JlYXRlclRoYW5Ub2tlbjpcbiAgICAgICAgICAgICAgICByZXR1cm4gPGFueT5sZWZ0ID4+PiA8YW55PnJpZ2h0O1xuICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUGx1c1Rva2VuOlxuICAgICAgICAgICAgICAgIHJldHVybiA8YW55PmxlZnQgKyA8YW55PnJpZ2h0O1xuICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTWludXNUb2tlbjpcbiAgICAgICAgICAgICAgICByZXR1cm4gPGFueT5sZWZ0IC0gPGFueT5yaWdodDtcbiAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkFzdGVyaXNrVG9rZW46XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxhbnk+bGVmdCAqIDxhbnk+cmlnaHQ7XG4gICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5TbGFzaFRva2VuOlxuICAgICAgICAgICAgICAgIHJldHVybiA8YW55PmxlZnQgLyA8YW55PnJpZ2h0O1xuICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUGVyY2VudFRva2VuOlxuICAgICAgICAgICAgICAgIHJldHVybiA8YW55PmxlZnQgJSA8YW55PnJpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZWNvcmRFbnRyeShcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF9fc3ltYm9saWM6ICdiaW5vcCcsXG4gICAgICAgICAgICAgICAgb3BlcmF0b3I6IGJpbmFyeUV4cHJlc3Npb24ub3BlcmF0b3JUb2tlbi5nZXRUZXh0KCksXG4gICAgICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgICAgICByaWdodDogcmlnaHRcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgbm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ29uZGl0aW9uYWxFeHByZXNzaW9uOlxuICAgICAgICBjb25zdCBjb25kaXRpb25hbEV4cHJlc3Npb24gPSA8dHMuQ29uZGl0aW9uYWxFeHByZXNzaW9uPm5vZGU7XG4gICAgICAgIGNvbnN0IGNvbmRpdGlvbiA9IHRoaXMuZXZhbHVhdGVOb2RlKGNvbmRpdGlvbmFsRXhwcmVzc2lvbi5jb25kaXRpb24pO1xuICAgICAgICBjb25zdCB0aGVuRXhwcmVzc2lvbiA9IHRoaXMuZXZhbHVhdGVOb2RlKGNvbmRpdGlvbmFsRXhwcmVzc2lvbi53aGVuVHJ1ZSk7XG4gICAgICAgIGNvbnN0IGVsc2VFeHByZXNzaW9uID0gdGhpcy5ldmFsdWF0ZU5vZGUoY29uZGl0aW9uYWxFeHByZXNzaW9uLndoZW5GYWxzZSk7XG4gICAgICAgIGlmIChpc1ByaW1pdGl2ZShjb25kaXRpb24pKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbmRpdGlvbiA/IHRoZW5FeHByZXNzaW9uIDogZWxzZUV4cHJlc3Npb247XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlY29yZEVudHJ5KHtfX3N5bWJvbGljOiAnaWYnLCBjb25kaXRpb24sIHRoZW5FeHByZXNzaW9uLCBlbHNlRXhwcmVzc2lvbn0sIG5vZGUpO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZ1bmN0aW9uRXhwcmVzc2lvbjpcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5BcnJvd0Z1bmN0aW9uOlxuICAgICAgICByZXR1cm4gcmVjb3JkRW50cnkoZXJyb3JTeW1ib2woJ0xhbWJkYSBub3Qgc3VwcG9ydGVkJywgbm9kZSksIG5vZGUpO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbjpcbiAgICAgICAgcmV0dXJuIHJlY29yZEVudHJ5KFxuICAgICAgICAgICAgZXJyb3JTeW1ib2woJ1RhZ2dlZCB0ZW1wbGF0ZSBleHByZXNzaW9ucyBhcmUgbm90IHN1cHBvcnRlZCBpbiBtZXRhZGF0YScsIG5vZGUpLCBub2RlKTtcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5UZW1wbGF0ZUV4cHJlc3Npb246XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlRXhwcmVzc2lvbiA9IDx0cy5UZW1wbGF0ZUV4cHJlc3Npb24+bm9kZTtcbiAgICAgICAgaWYgKHRoaXMuaXNGb2xkYWJsZShub2RlKSkge1xuICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZUV4cHJlc3Npb24udGVtcGxhdGVTcGFucy5yZWR1Y2UoXG4gICAgICAgICAgICAgIChwcmV2aW91cywgY3VycmVudCkgPT4gcHJldmlvdXMgKyA8c3RyaW5nPnRoaXMuZXZhbHVhdGVOb2RlKGN1cnJlbnQuZXhwcmVzc2lvbikgK1xuICAgICAgICAgICAgICAgICAgPHN0cmluZz50aGlzLmV2YWx1YXRlTm9kZShjdXJyZW50LmxpdGVyYWwpLFxuICAgICAgICAgICAgICB0aGlzLmV2YWx1YXRlTm9kZSh0ZW1wbGF0ZUV4cHJlc3Npb24uaGVhZCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZUV4cHJlc3Npb24udGVtcGxhdGVTcGFucy5yZWR1Y2UoKHByZXZpb3VzLCBjdXJyZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBleHByID0gdGhpcy5ldmFsdWF0ZU5vZGUoY3VycmVudC5leHByZXNzaW9uKTtcbiAgICAgICAgICAgIGNvbnN0IGxpdGVyYWwgPSB0aGlzLmV2YWx1YXRlTm9kZShjdXJyZW50LmxpdGVyYWwpO1xuICAgICAgICAgICAgaWYgKGlzRm9sZGFibGVFcnJvcihleHByKSkgcmV0dXJuIGV4cHI7XG4gICAgICAgICAgICBpZiAoaXNGb2xkYWJsZUVycm9yKGxpdGVyYWwpKSByZXR1cm4gbGl0ZXJhbDtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJldmlvdXMgPT09ICdzdHJpbmcnICYmIHR5cGVvZiBleHByID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZiBsaXRlcmFsID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICByZXR1cm4gcHJldmlvdXMgKyBleHByICsgbGl0ZXJhbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBleHByO1xuICAgICAgICAgICAgaWYgKHByZXZpb3VzICE9PSAnJykge1xuICAgICAgICAgICAgICByZXN1bHQgPSB7X19zeW1ib2xpYzogJ2Jpbm9wJywgb3BlcmF0b3I6ICcrJywgbGVmdDogcHJldmlvdXMsIHJpZ2h0OiBleHByfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsaXRlcmFsICE9ICcnKSB7XG4gICAgICAgICAgICAgIHJlc3VsdCA9IHtfX3N5bWJvbGljOiAnYmlub3AnLCBvcGVyYXRvcjogJysnLCBsZWZ0OiByZXN1bHQsIHJpZ2h0OiBsaXRlcmFsfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfSwgdGhpcy5ldmFsdWF0ZU5vZGUodGVtcGxhdGVFeHByZXNzaW9uLmhlYWQpKTtcbiAgICAgICAgfVxuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkFzRXhwcmVzc2lvbjpcbiAgICAgICAgY29uc3QgYXNFeHByZXNzaW9uID0gPHRzLkFzRXhwcmVzc2lvbj5ub2RlO1xuICAgICAgICByZXR1cm4gdGhpcy5ldmFsdWF0ZU5vZGUoYXNFeHByZXNzaW9uLmV4cHJlc3Npb24pO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNsYXNzRXhwcmVzc2lvbjpcbiAgICAgICAgcmV0dXJuIHtfX3N5bWJvbGljOiAnY2xhc3MnfTtcbiAgICB9XG4gICAgcmV0dXJuIHJlY29yZEVudHJ5KGVycm9yU3ltYm9sKCdFeHByZXNzaW9uIGZvcm0gbm90IHN1cHBvcnRlZCcsIG5vZGUpLCBub2RlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1Byb3BlcnR5QXNzaWdubWVudChub2RlOiB0cy5Ob2RlKTogbm9kZSBpcyB0cy5Qcm9wZXJ0eUFzc2lnbm1lbnQge1xuICByZXR1cm4gbm9kZS5raW5kID09IHRzLlN5bnRheEtpbmQuUHJvcGVydHlBc3NpZ25tZW50O1xufVxuXG5jb25zdCBlbXB0eSA9IHRzLmNyZWF0ZU5vZGVBcnJheTxhbnk+KCk7XG5cbmZ1bmN0aW9uIGFycmF5T3JFbXB0eTxUIGV4dGVuZHMgdHMuTm9kZT4odjogdHMuTm9kZUFycmF5PFQ+fCB1bmRlZmluZWQpOiB0cy5Ob2RlQXJyYXk8VD4ge1xuICByZXR1cm4gdiB8fCBlbXB0eTtcbn0iXX0=