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
        define("@angular/compiler-cli/src/diagnostics/typescript_symbols", ["require", "exports", "fs", "path", "typescript", "@angular/compiler-cli/src/diagnostics/symbols", "@angular/compiler-cli/src/diagnostics/typescript_version"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const fs = require("fs");
    const path = require("path");
    const ts = require("typescript");
    const symbols_1 = require("@angular/compiler-cli/src/diagnostics/symbols");
    const typescript_version_1 = require("@angular/compiler-cli/src/diagnostics/typescript_version");
    // In TypeScript 2.1 these flags moved
    // These helpers work for both 2.0 and 2.1.
    const isPrivate = ts.ModifierFlags ?
        ((node) => !!(ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Private)) :
        ((node) => !!(node.flags & ts.NodeFlags.Private));
    const isReferenceType = ts.ObjectFlags ?
        ((type) => !!(type.flags & ts.TypeFlags.Object &&
            type.objectFlags & ts.ObjectFlags.Reference)) :
        ((type) => !!(type.flags & ts.TypeFlags.Reference));
    function getSymbolQuery(program, checker, source, fetchPipes) {
        return new TypeScriptSymbolQuery(program, checker, source, fetchPipes);
    }
    exports.getSymbolQuery = getSymbolQuery;
    function getClassMembers(program, checker, staticSymbol) {
        const declaration = getClassFromStaticSymbol(program, staticSymbol);
        if (declaration) {
            const type = checker.getTypeAtLocation(declaration);
            const node = program.getSourceFile(staticSymbol.filePath);
            if (node) {
                return new TypeWrapper(type, { node, program, checker }).members();
            }
        }
    }
    exports.getClassMembers = getClassMembers;
    function getClassMembersFromDeclaration(program, checker, source, declaration) {
        const type = checker.getTypeAtLocation(declaration);
        return new TypeWrapper(type, { node: source, program, checker }).members();
    }
    exports.getClassMembersFromDeclaration = getClassMembersFromDeclaration;
    function getClassFromStaticSymbol(program, type) {
        const source = program.getSourceFile(type.filePath);
        if (source) {
            return ts.forEachChild(source, child => {
                if (child.kind === ts.SyntaxKind.ClassDeclaration) {
                    const classDeclaration = child;
                    if (classDeclaration.name != null && classDeclaration.name.text === type.name) {
                        return classDeclaration;
                    }
                }
            });
        }
        return undefined;
    }
    exports.getClassFromStaticSymbol = getClassFromStaticSymbol;
    function getPipesTable(source, program, checker, pipes) {
        return new PipesTable(pipes, { program, checker, node: source });
    }
    exports.getPipesTable = getPipesTable;
    class TypeScriptSymbolQuery {
        constructor(program, checker, source, fetchPipes) {
            this.program = program;
            this.checker = checker;
            this.source = source;
            this.fetchPipes = fetchPipes;
            this.typeCache = new Map();
        }
        getTypeKind(symbol) { return typeKindOf(this.getTsTypeOf(symbol)); }
        getBuiltinType(kind) {
            let result = this.typeCache.get(kind);
            if (!result) {
                const type = getBuiltinTypeFromTs(kind, { checker: this.checker, node: this.source, program: this.program });
                result =
                    new TypeWrapper(type, { program: this.program, checker: this.checker, node: this.source });
                this.typeCache.set(kind, result);
            }
            return result;
        }
        getTypeUnion(...types) {
            // No API exists so return any if the types are not all the same type.
            let result = undefined;
            if (types.length) {
                result = types[0];
                for (let i = 1; i < types.length; i++) {
                    if (types[i] != result) {
                        result = undefined;
                        break;
                    }
                }
            }
            return result || this.getBuiltinType(symbols_1.BuiltinType.Any);
        }
        getArrayType(type) { return this.getBuiltinType(symbols_1.BuiltinType.Any); }
        getElementType(type) {
            if (type instanceof TypeWrapper) {
                const elementType = getTypeParameterOf(type.tsType, 'Array');
                if (elementType) {
                    return new TypeWrapper(elementType, type.context);
                }
            }
        }
        getNonNullableType(symbol) {
            if (symbol instanceof TypeWrapper && (typeof this.checker.getNonNullableType == 'function')) {
                const tsType = symbol.tsType;
                const nonNullableType = this.checker.getNonNullableType(tsType);
                if (nonNullableType != tsType) {
                    return new TypeWrapper(nonNullableType, symbol.context);
                }
                else if (nonNullableType == tsType) {
                    return symbol;
                }
            }
            return this.getBuiltinType(symbols_1.BuiltinType.Any);
        }
        getPipes() {
            let result = this.pipesCache;
            if (!result) {
                result = this.pipesCache = this.fetchPipes();
            }
            return result;
        }
        getTemplateContext(type) {
            const context = { node: this.source, program: this.program, checker: this.checker };
            const typeSymbol = findClassSymbolInContext(type, context);
            if (typeSymbol) {
                const contextType = this.getTemplateRefContextType(typeSymbol);
                if (contextType)
                    return new SymbolWrapper(contextType, context).members();
            }
        }
        getTypeSymbol(type) {
            const context = { node: this.source, program: this.program, checker: this.checker };
            const typeSymbol = findClassSymbolInContext(type, context);
            return typeSymbol && new SymbolWrapper(typeSymbol, context);
        }
        createSymbolTable(symbols) {
            const result = new MapSymbolTable();
            result.addAll(symbols.map(s => new DeclaredSymbol(s)));
            return result;
        }
        mergeSymbolTable(symbolTables) {
            const result = new MapSymbolTable();
            for (const symbolTable of symbolTables) {
                result.addAll(symbolTable.values());
            }
            return result;
        }
        getSpanAt(line, column) {
            return spanAt(this.source, line, column);
        }
        getTemplateRefContextType(typeSymbol) {
            const type = this.checker.getTypeOfSymbolAtLocation(typeSymbol, this.source);
            const constructor = type.symbol && type.symbol.members &&
                getFromSymbolTable(type.symbol.members, '__constructor');
            if (constructor) {
                const constructorDeclaration = constructor.declarations[0];
                for (const parameter of constructorDeclaration.parameters) {
                    const type = this.checker.getTypeAtLocation(parameter.type);
                    if (type.symbol.name == 'TemplateRef' && isReferenceType(type)) {
                        const typeReference = type;
                        if (typeReference.typeArguments && typeReference.typeArguments.length === 1) {
                            return typeReference.typeArguments[0].symbol;
                        }
                    }
                }
            }
        }
        getTsTypeOf(symbol) {
            const type = this.getTypeWrapper(symbol);
            return type && type.tsType;
        }
        getTypeWrapper(symbol) {
            let type = undefined;
            if (symbol instanceof TypeWrapper) {
                type = symbol;
            }
            else if (symbol.type instanceof TypeWrapper) {
                type = symbol.type;
            }
            return type;
        }
    }
    function typeCallable(type) {
        const signatures = type.getCallSignatures();
        return signatures && signatures.length != 0;
    }
    function signaturesOf(type, context) {
        return type.getCallSignatures().map(s => new SignatureWrapper(s, context));
    }
    function selectSignature(type, context, types) {
        // TODO: Do a better job of selecting the right signature.
        const signatures = type.getCallSignatures();
        return signatures.length ? new SignatureWrapper(signatures[0], context) : undefined;
    }
    class TypeWrapper {
        constructor(tsType, context) {
            this.tsType = tsType;
            this.context = context;
            this.kind = 'type';
            this.language = 'typescript';
            this.type = undefined;
            this.container = undefined;
            this.public = true;
            if (!tsType) {
                throw Error('Internal: null type');
            }
        }
        get name() {
            const symbol = this.tsType.symbol;
            return (symbol && symbol.name) || '<anonymous>';
        }
        get callable() { return typeCallable(this.tsType); }
        get nullable() {
            return this.context.checker.getNonNullableType(this.tsType) != this.tsType;
        }
        get definition() {
            const symbol = this.tsType.getSymbol();
            return symbol ? definitionFromTsSymbol(symbol) : undefined;
        }
        members() {
            return new SymbolTableWrapper(this.tsType.getProperties(), this.context);
        }
        signatures() { return signaturesOf(this.tsType, this.context); }
        selectSignature(types) {
            return selectSignature(this.tsType, this.context, types);
        }
        indexed(argument) { return undefined; }
    }
    class SymbolWrapper {
        constructor(symbol, context) {
            this.context = context;
            this.nullable = false;
            this.language = 'typescript';
            this.symbol = symbol && context && (symbol.flags & ts.SymbolFlags.Alias) ?
                context.checker.getAliasedSymbol(symbol) :
                symbol;
        }
        get name() { return this.symbol.name; }
        get kind() { return this.callable ? 'method' : 'property'; }
        get type() { return new TypeWrapper(this.tsType, this.context); }
        get container() { return getContainerOf(this.symbol, this.context); }
        get public() {
            // Symbols that are not explicitly made private are public.
            return !isSymbolPrivate(this.symbol);
        }
        get callable() { return typeCallable(this.tsType); }
        get definition() { return definitionFromTsSymbol(this.symbol); }
        members() {
            if (!this._members) {
                if ((this.symbol.flags & (ts.SymbolFlags.Class | ts.SymbolFlags.Interface)) != 0) {
                    const declaredType = this.context.checker.getDeclaredTypeOfSymbol(this.symbol);
                    const typeWrapper = new TypeWrapper(declaredType, this.context);
                    this._members = typeWrapper.members();
                }
                else {
                    this._members = new SymbolTableWrapper(this.symbol.members, this.context);
                }
            }
            return this._members;
        }
        signatures() { return signaturesOf(this.tsType, this.context); }
        selectSignature(types) {
            return selectSignature(this.tsType, this.context, types);
        }
        indexed(argument) { return undefined; }
        get tsType() {
            let type = this._tsType;
            if (!type) {
                type = this._tsType =
                    this.context.checker.getTypeOfSymbolAtLocation(this.symbol, this.context.node);
            }
            return type;
        }
    }
    class DeclaredSymbol {
        constructor(declaration) {
            this.declaration = declaration;
            this.language = 'ng-template';
            this.nullable = false;
            this.public = true;
        }
        get name() { return this.declaration.name; }
        get kind() { return this.declaration.kind; }
        get container() { return undefined; }
        get type() { return this.declaration.type; }
        get callable() { return this.declaration.type.callable; }
        get definition() { return this.declaration.definition; }
        members() { return this.declaration.type.members(); }
        signatures() { return this.declaration.type.signatures(); }
        selectSignature(types) {
            return this.declaration.type.selectSignature(types);
        }
        indexed(argument) { return undefined; }
    }
    class SignatureWrapper {
        constructor(signature, context) {
            this.signature = signature;
            this.context = context;
        }
        get arguments() {
            return new SymbolTableWrapper(this.signature.getParameters(), this.context);
        }
        get result() { return new TypeWrapper(this.signature.getReturnType(), this.context); }
    }
    class SignatureResultOverride {
        constructor(signature, resultType) {
            this.signature = signature;
            this.resultType = resultType;
        }
        get arguments() { return this.signature.arguments; }
        get result() { return this.resultType; }
    }
    /**
     * Indicates the lower bound TypeScript version supporting `SymbolTable` as an ES6 `Map`.
     * For lower versions, `SymbolTable` is implemented as a dictionary
     */
    const MIN_TS_VERSION_SUPPORTING_MAP = '2.2';
    exports.toSymbolTableFactory = (tsVersion) => (symbols) => {
        if (typescript_version_1.isVersionBetween(tsVersion, MIN_TS_VERSION_SUPPORTING_MAP)) {
            // ∀ Typescript version >= 2.2, `SymbolTable` is implemented as an ES6 `Map`
            const result = new Map();
            for (const symbol of symbols) {
                result.set(symbol.name, symbol);
            }
            // First, tell the compiler that `result` is of type `any`. Then, use a second type assertion
            // to `ts.SymbolTable`.
            // Otherwise, `Map<string, ts.Symbol>` and `ts.SymbolTable` will be considered as incompatible
            // types by the compiler
            return result;
        }
        // ∀ Typescript version < 2.2, `SymbolTable` is implemented as a dictionary
        const result = {};
        for (const symbol of symbols) {
            result[symbol.name] = symbol;
        }
        return result;
    };
    function toSymbols(symbolTable) {
        if (!symbolTable)
            return [];
        const table = symbolTable;
        if (typeof table.values === 'function') {
            return Array.from(table.values());
        }
        const result = [];
        const own = typeof table.hasOwnProperty === 'function' ?
            (name) => table.hasOwnProperty(name) :
            (name) => !!table[name];
        for (const name in table) {
            if (own(name)) {
                result.push(table[name]);
            }
        }
        return result;
    }
    class SymbolTableWrapper {
        constructor(symbols, context) {
            this.context = context;
            symbols = symbols || [];
            if (Array.isArray(symbols)) {
                this.symbols = symbols;
                const toSymbolTable = exports.toSymbolTableFactory(ts.version);
                this.symbolTable = toSymbolTable(symbols);
            }
            else {
                this.symbols = toSymbols(symbols);
                this.symbolTable = symbols;
            }
        }
        get size() { return this.symbols.length; }
        get(key) {
            const symbol = getFromSymbolTable(this.symbolTable, key);
            return symbol ? new SymbolWrapper(symbol, this.context) : undefined;
        }
        has(key) {
            const table = this.symbolTable;
            return (typeof table.has === 'function') ? table.has(key) : table[key] != null;
        }
        values() { return this.symbols.map(s => new SymbolWrapper(s, this.context)); }
    }
    class MapSymbolTable {
        constructor() {
            this.map = new Map();
            this._values = [];
        }
        get size() { return this.map.size; }
        get(key) { return this.map.get(key); }
        add(symbol) {
            if (this.map.has(symbol.name)) {
                const previous = this.map.get(symbol.name);
                this._values[this._values.indexOf(previous)] = symbol;
            }
            this.map.set(symbol.name, symbol);
            this._values.push(symbol);
        }
        addAll(symbols) {
            for (const symbol of symbols) {
                this.add(symbol);
            }
        }
        has(key) { return this.map.has(key); }
        values() {
            // Switch to this.map.values once iterables are supported by the target language.
            return this._values;
        }
    }
    class PipesTable {
        constructor(pipes, context) {
            this.pipes = pipes;
            this.context = context;
        }
        get size() { return this.pipes.length; }
        get(key) {
            const pipe = this.pipes.find(pipe => pipe.name == key);
            if (pipe) {
                return new PipeSymbol(pipe, this.context);
            }
        }
        has(key) { return this.pipes.find(pipe => pipe.name == key) != null; }
        values() { return this.pipes.map(pipe => new PipeSymbol(pipe, this.context)); }
    }
    // This matches .d.ts files that look like ".../<package-name>/<package-name>.d.ts",
    const INDEX_PATTERN = /[\\/]([^\\/]+)[\\/]\1\.d\.ts$/;
    class PipeSymbol {
        constructor(pipe, context) {
            this.pipe = pipe;
            this.context = context;
            this.kind = 'pipe';
            this.language = 'typescript';
            this.container = undefined;
            this.callable = true;
            this.nullable = false;
            this.public = true;
        }
        get name() { return this.pipe.name; }
        get type() { return new TypeWrapper(this.tsType, this.context); }
        get definition() {
            const symbol = this.tsType.getSymbol();
            return symbol ? definitionFromTsSymbol(symbol) : undefined;
        }
        members() { return EmptyTable.instance; }
        signatures() { return signaturesOf(this.tsType, this.context); }
        selectSignature(types) {
            let signature = selectSignature(this.tsType, this.context, types);
            if (types.length == 1) {
                const parameterType = types[0];
                if (parameterType instanceof TypeWrapper) {
                    let resultType = undefined;
                    switch (this.name) {
                        case 'async':
                            switch (parameterType.name) {
                                case 'Observable':
                                case 'Promise':
                                case 'EventEmitter':
                                    resultType = getTypeParameterOf(parameterType.tsType, parameterType.name);
                                    break;
                                default:
                                    resultType = getBuiltinTypeFromTs(symbols_1.BuiltinType.Any, this.context);
                                    break;
                            }
                            break;
                        case 'slice':
                            resultType = getTypeParameterOf(parameterType.tsType, 'Array');
                            break;
                    }
                    if (resultType) {
                        signature = new SignatureResultOverride(signature, new TypeWrapper(resultType, parameterType.context));
                    }
                }
            }
            return signature;
        }
        indexed(argument) { return undefined; }
        get tsType() {
            let type = this._tsType;
            if (!type) {
                const classSymbol = this.findClassSymbol(this.pipe.type.reference);
                if (classSymbol) {
                    type = this._tsType = this.findTransformMethodType(classSymbol);
                }
                if (!type) {
                    type = this._tsType = getBuiltinTypeFromTs(symbols_1.BuiltinType.Any, this.context);
                }
            }
            return type;
        }
        findClassSymbol(type) {
            return findClassSymbolInContext(type, this.context);
        }
        findTransformMethodType(classSymbol) {
            const classType = this.context.checker.getDeclaredTypeOfSymbol(classSymbol);
            if (classType) {
                const transform = classType.getProperty('transform');
                if (transform) {
                    return this.context.checker.getTypeOfSymbolAtLocation(transform, this.context.node);
                }
            }
        }
    }
    function findClassSymbolInContext(type, context) {
        let sourceFile = context.program.getSourceFile(type.filePath);
        if (!sourceFile) {
            // This handles a case where an <packageName>/index.d.ts and a <packageName>/<packageName>.d.ts
            // are in the same directory. If we are looking for <packageName>/<packageName> and didn't
            // find it, look for <packageName>/index.d.ts as the program might have found that instead.
            const p = type.filePath;
            const m = p.match(INDEX_PATTERN);
            if (m) {
                const indexVersion = path.join(path.dirname(p), 'index.d.ts');
                sourceFile = context.program.getSourceFile(indexVersion);
            }
        }
        if (sourceFile) {
            const moduleSymbol = sourceFile.module || sourceFile.symbol;
            const exports = context.checker.getExportsOfModule(moduleSymbol);
            return (exports || []).find(symbol => symbol.name == type.name);
        }
    }
    class EmptyTable {
        constructor() {
            this.size = 0;
        }
        get(key) { return undefined; }
        has(key) { return false; }
        values() { return []; }
    }
    EmptyTable.instance = new EmptyTable();
    function findTsConfig(fileName) {
        let dir = path.dirname(fileName);
        while (fs.existsSync(dir)) {
            const candidate = path.join(dir, 'tsconfig.json');
            if (fs.existsSync(candidate))
                return candidate;
            const parentDir = path.dirname(dir);
            if (parentDir === dir)
                break;
            dir = parentDir;
        }
    }
    function isBindingPattern(node) {
        return !!node && (node.kind === ts.SyntaxKind.ArrayBindingPattern ||
            node.kind === ts.SyntaxKind.ObjectBindingPattern);
    }
    function walkUpBindingElementsAndPatterns(node) {
        while (node && (node.kind === ts.SyntaxKind.BindingElement || isBindingPattern(node))) {
            node = node.parent;
        }
        return node;
    }
    function getCombinedNodeFlags(node) {
        node = walkUpBindingElementsAndPatterns(node);
        let flags = node.flags;
        if (node.kind === ts.SyntaxKind.VariableDeclaration) {
            node = node.parent;
        }
        if (node && node.kind === ts.SyntaxKind.VariableDeclarationList) {
            flags |= node.flags;
            node = node.parent;
        }
        if (node && node.kind === ts.SyntaxKind.VariableStatement) {
            flags |= node.flags;
        }
        return flags;
    }
    function isSymbolPrivate(s) {
        return !!s.valueDeclaration && isPrivate(s.valueDeclaration);
    }
    function getBuiltinTypeFromTs(kind, context) {
        let type;
        const checker = context.checker;
        const node = context.node;
        switch (kind) {
            case symbols_1.BuiltinType.Any:
                type = checker.getTypeAtLocation(setParents({
                    kind: ts.SyntaxKind.AsExpression,
                    expression: { kind: ts.SyntaxKind.TrueKeyword },
                    type: { kind: ts.SyntaxKind.AnyKeyword }
                }, node));
                break;
            case symbols_1.BuiltinType.Boolean:
                type =
                    checker.getTypeAtLocation(setParents({ kind: ts.SyntaxKind.TrueKeyword }, node));
                break;
            case symbols_1.BuiltinType.Null:
                type =
                    checker.getTypeAtLocation(setParents({ kind: ts.SyntaxKind.NullKeyword }, node));
                break;
            case symbols_1.BuiltinType.Number:
                const numeric = {
                    kind: ts.SyntaxKind.NumericLiteral,
                    text: node.getText(),
                };
                setParents({ kind: ts.SyntaxKind.ExpressionStatement, expression: numeric }, node);
                type = checker.getTypeAtLocation(numeric);
                break;
            case symbols_1.BuiltinType.String:
                type = checker.getTypeAtLocation(setParents({
                    kind: ts.SyntaxKind.NoSubstitutionTemplateLiteral,
                    text: node.getText(),
                }, node));
                break;
            case symbols_1.BuiltinType.Undefined:
                type = checker.getTypeAtLocation(setParents({
                    kind: ts.SyntaxKind.VoidExpression,
                    expression: { kind: ts.SyntaxKind.NumericLiteral }
                }, node));
                break;
            default:
                throw new Error(`Internal error, unhandled literal kind ${kind}:${symbols_1.BuiltinType[kind]}`);
        }
        return type;
    }
    function setParents(node, parent) {
        node.parent = parent;
        ts.forEachChild(node, child => setParents(child, node));
        return node;
    }
    function spanOf(node) {
        return { start: node.getStart(), end: node.getEnd() };
    }
    function shrink(span, offset) {
        if (offset == null)
            offset = 1;
        return { start: span.start + offset, end: span.end - offset };
    }
    function spanAt(sourceFile, line, column) {
        if (line != null && column != null) {
            const position = ts.getPositionOfLineAndCharacter(sourceFile, line, column);
            const findChild = function findChild(node) {
                if (node.kind > ts.SyntaxKind.LastToken && node.pos <= position && node.end > position) {
                    const betterNode = ts.forEachChild(node, findChild);
                    return betterNode || node;
                }
            };
            const node = ts.forEachChild(sourceFile, findChild);
            if (node) {
                return { start: node.getStart(), end: node.getEnd() };
            }
        }
    }
    function definitionFromTsSymbol(symbol) {
        const declarations = symbol.declarations;
        if (declarations) {
            return declarations.map(declaration => {
                const sourceFile = declaration.getSourceFile();
                return {
                    fileName: sourceFile.fileName,
                    span: { start: declaration.getStart(), end: declaration.getEnd() }
                };
            });
        }
    }
    function parentDeclarationOf(node) {
        while (node) {
            switch (node.kind) {
                case ts.SyntaxKind.ClassDeclaration:
                case ts.SyntaxKind.InterfaceDeclaration:
                    return node;
                case ts.SyntaxKind.SourceFile:
                    return undefined;
            }
            node = node.parent;
        }
    }
    function getContainerOf(symbol, context) {
        if (symbol.getFlags() & ts.SymbolFlags.ClassMember && symbol.declarations) {
            for (const declaration of symbol.declarations) {
                const parent = parentDeclarationOf(declaration);
                if (parent) {
                    const type = context.checker.getTypeAtLocation(parent);
                    if (type) {
                        return new TypeWrapper(type, context);
                    }
                }
            }
        }
    }
    function getTypeParameterOf(type, name) {
        if (type && type.symbol && type.symbol.name == name) {
            const typeArguments = type.typeArguments;
            if (typeArguments && typeArguments.length <= 1) {
                return typeArguments[0];
            }
        }
    }
    function typeKindOf(type) {
        if (type) {
            if (type.flags & ts.TypeFlags.Any) {
                return symbols_1.BuiltinType.Any;
            }
            else if (type.flags & (ts.TypeFlags.String | ts.TypeFlags.StringLike | ts.TypeFlags.StringLiteral)) {
                return symbols_1.BuiltinType.String;
            }
            else if (type.flags & (ts.TypeFlags.Number | ts.TypeFlags.NumberLike)) {
                return symbols_1.BuiltinType.Number;
            }
            else if (type.flags & (ts.TypeFlags.Undefined)) {
                return symbols_1.BuiltinType.Undefined;
            }
            else if (type.flags & (ts.TypeFlags.Null)) {
                return symbols_1.BuiltinType.Null;
            }
            else if (type.flags & ts.TypeFlags.Union) {
                // If all the constituent types of a union are the same kind, it is also that kind.
                let candidate = null;
                const unionType = type;
                if (unionType.types.length > 0) {
                    candidate = typeKindOf(unionType.types[0]);
                    for (const subType of unionType.types) {
                        if (candidate != typeKindOf(subType)) {
                            return symbols_1.BuiltinType.Other;
                        }
                    }
                }
                if (candidate != null) {
                    return candidate;
                }
            }
            else if (type.flags & ts.TypeFlags.TypeParameter) {
                return symbols_1.BuiltinType.Unbound;
            }
        }
        return symbols_1.BuiltinType.Other;
    }
    function getFromSymbolTable(symbolTable, key) {
        const table = symbolTable;
        let symbol;
        if (typeof table.get === 'function') {
            // TS 2.2 uses a Map
            symbol = table.get(key);
        }
        else {
            // TS pre-2.2 uses an object
            symbol = table[key];
        }
        return symbol;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdF9zeW1ib2xzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9kaWFnbm9zdGljcy90eXBlc2NyaXB0X3N5bWJvbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFHSCx5QkFBeUI7SUFDekIsNkJBQTZCO0lBQzdCLGlDQUFpQztJQUVqQywyRUFBMEo7SUFDMUosaUdBQXNEO0lBRXRELHNDQUFzQztJQUN0QywyQ0FBMkM7SUFDM0MsTUFBTSxTQUFTLEdBQUksRUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxJQUFhLEVBQUUsRUFBRSxDQUNkLENBQUMsQ0FBQyxDQUFFLEVBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsR0FBSSxFQUFVLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxRixDQUFDLENBQUMsSUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFJLEVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUV4RSxNQUFNLGVBQWUsR0FBSSxFQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDN0MsQ0FBQyxDQUFDLElBQWEsRUFBRSxFQUFFLENBQ2QsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBSSxFQUFVLENBQUMsU0FBUyxDQUFDLE1BQU07WUFDeEMsSUFBWSxDQUFDLFdBQVcsR0FBSSxFQUFVLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6RSxDQUFDLENBQUMsSUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFJLEVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENB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TUFBMkIsQ0FBQztRQUVoQyxJQUFJLE9BQU8sS0FBSyxDQUFDLEdBQUcsS0FBSyxVQUFVLEVBQUU7WUFDbkMsb0JBQW9CO1lBQ3BCLE1BQU0sR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3pCO2FBQU07WUFDTCw0QkFBNEI7WUFDNUIsTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNyQjtRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QW90U3VtbWFyeVJlc29sdmVyLCBDb21waWxlTWV0YWRhdGFSZXNvbHZlciwgQ29tcGlsZVBpcGVTdW1tYXJ5LCBDb21waWxlckNvbmZpZywgREVGQVVMVF9JTlRFUlBPTEFUSU9OX0NPTkZJRywgRGlyZWN0aXZlTm9ybWFsaXplciwgRGlyZWN0aXZlUmVzb2x2ZXIsIERvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeSwgSHRtbFBhcnNlciwgSW50ZXJwb2xhdGlvbkNvbmZpZywgTmdBbmFseXplZE1vZHVsZXMsIE5nTW9kdWxlUmVzb2x2ZXIsIFBhcnNlVHJlZVJlc3VsdCwgUGlwZVJlc29sdmVyLCBSZXNvdXJjZUxvYWRlciwgU3RhdGljUmVmbGVjdG9yLCBTdGF0aWNTeW1ib2wsIFN0YXRpY1N5bWJvbENhY2hlLCBTdGF0aWNTeW1ib2xSZXNvbHZlciwgU3VtbWFyeVJlc29sdmVyfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7QnVpbHRpblR5cGUsIERlY2xhcmF0aW9uS2luZCwgRGVmaW5pdGlvbiwgUGlwZUluZm8sIFBpcGVzLCBTaWduYXR1cmUsIFNwYW4sIFN5bWJvbCwgU3ltYm9sRGVjbGFyYXRpb24sIFN5bWJvbFF1ZXJ5LCBTeW1ib2xUYWJsZX0gZnJvbSAnLi9zeW1ib2xzJztcbmltcG9ydCB7aXNWZXJzaW9uQmV0d2Vlbn0gZnJvbSAnLi90eXBlc2NyaXB0X3ZlcnNpb24nO1xuXG4vLyBJbiBUeXBlU2NyaXB0IDIuMSB0aGVzZSBmbGFncyBtb3ZlZFxuLy8gVGhlc2UgaGVscGVycyB3b3JrIGZvciBib3RoIDIuMCBhbmQgMi4xLlxuY29uc3QgaXNQcml2YXRlID0gKHRzIGFzIGFueSkuTW9kaWZpZXJGbGFncyA/XG4gICAgKChub2RlOiB0cy5Ob2RlKSA9PlxuICAgICAgICAgISEoKHRzIGFzIGFueSkuZ2V0Q29tYmluZWRNb2RpZmllckZsYWdzKG5vZGUpICYgKHRzIGFzIGFueSkuTW9kaWZpZXJGbGFncy5Qcml2YXRlKSkgOlxuICAgICgobm9kZTogdHMuTm9kZSkgPT4gISEobm9kZS5mbGFncyAmICh0cyBhcyBhbnkpLk5vZGVGbGFncy5Qcml2YXRlKSk7XG5cbmNvbnN0IGlzUmVmZXJlbmNlVHlwZSA9ICh0cyBhcyBhbnkpLk9iamVjdEZsYWdzID9cbiAgICAoKHR5cGU6IHRzLlR5cGUpID0+XG4gICAgICAgICAhISh0eXBlLmZsYWdzICYgKHRzIGFzIGFueSkuVHlwZUZsYWdzLk9iamVjdCAmJlxuICAgICAgICAgICAgKHR5cGUgYXMgYW55KS5vYmplY3RGbGFncyAmICh0cyBhcyBhbnkpLk9iamVjdEZsYWdzLlJlZmVyZW5jZSkpIDpcbiAgICAoKHR5cGU6IHRzLlR5cGUpID0+ICEhKHR5cGUuZmxhZ3MgJiAodHMgYXMgYW55KS5UeXBlRmxhZ3MuUmVmZXJlbmNlKSk7XG5cbmludGVyZmFjZSBUeXBlQ29udGV4dCB7XG4gIG5vZGU6IHRzLk5vZGU7XG4gIHByb2dyYW06IHRzLlByb2dyYW07XG4gIGNoZWNrZXI6IHRzLlR5cGVDaGVja2VyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3ltYm9sUXVlcnkoXG4gICAgcHJvZ3JhbTogdHMuUHJvZ3JhbSwgY2hlY2tlcjogdHMuVHlwZUNoZWNrZXIsIHNvdXJjZTogdHMuU291cmNlRmlsZSxcbiAgICBmZXRjaFBpcGVzOiAoKSA9PiBTeW1ib2xUYWJsZSk6IFN5bWJvbFF1ZXJ5IHtcbiAgcmV0dXJuIG5ldyBUeXBlU2NyaXB0U3ltYm9sUXVlcnkocHJvZ3JhbSwgY2hlY2tlciwgc291cmNlLCBmZXRjaFBpcGVzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENsYXNzTWVtYmVycyhcbiAgICBwcm9ncmFtOiB0cy5Qcm9ncmFtLCBjaGVja2VyOiB0cy5UeXBlQ2hlY2tlciwgc3RhdGljU3ltYm9sOiBTdGF0aWNTeW1ib2wpOiBTeW1ib2xUYWJsZXxcbiAgICB1bmRlZmluZWQge1xuICBjb25zdCBkZWNsYXJhdGlvbiA9IGdldENsYXNzRnJvbVN0YXRpY1N5bWJvbChwcm9ncmFtLCBzdGF0aWNTeW1ib2wpO1xuICBpZiAoZGVjbGFyYXRpb24pIHtcbiAgICBjb25zdCB0eXBlID0gY2hlY2tlci5nZXRUeXBlQXRMb2NhdGlvbihkZWNsYXJhdGlvbik7XG4gICAgY29uc3Qgbm9kZSA9IHByb2dyYW0uZ2V0U291cmNlRmlsZShzdGF0aWNTeW1ib2wuZmlsZVBhdGgpO1xuICAgIGlmIChub2RlKSB7XG4gICAgICByZXR1cm4gbmV3IFR5cGVXcmFwcGVyKHR5cGUsIHtub2RlLCBwcm9ncmFtLCBjaGVja2VyfSkubWVtYmVycygpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2xhc3NNZW1iZXJzRnJvbURlY2xhcmF0aW9uKFxuICAgIHByb2dyYW06IHRzLlByb2dyYW0sIGNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLCBzb3VyY2U6IHRzLlNvdXJjZUZpbGUsXG4gICAgZGVjbGFyYXRpb246IHRzLkNsYXNzRGVjbGFyYXRpb24pIHtcbiAgY29uc3QgdHlwZSA9IGNoZWNrZXIuZ2V0VHlwZUF0TG9jYXRpb24oZGVjbGFyYXRpb24pO1xuICByZXR1cm4gbmV3IFR5cGVXcmFwcGVyKHR5cGUsIHtub2RlOiBzb3VyY2UsIHByb2dyYW0sIGNoZWNrZXJ9KS5tZW1iZXJzKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDbGFzc0Zyb21TdGF0aWNTeW1ib2woXG4gICAgcHJvZ3JhbTogdHMuUHJvZ3JhbSwgdHlwZTogU3RhdGljU3ltYm9sKTogdHMuQ2xhc3NEZWNsYXJhdGlvbnx1bmRlZmluZWQge1xuICBjb25zdCBzb3VyY2UgPSBwcm9ncmFtLmdldFNvdXJjZUZpbGUodHlwZS5maWxlUGF0aCk7XG4gIGlmIChzb3VyY2UpIHtcbiAgICByZXR1cm4gdHMuZm9yRWFjaENoaWxkKHNvdXJjZSwgY2hpbGQgPT4ge1xuICAgICAgaWYgKGNoaWxkLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuQ2xhc3NEZWNsYXJhdGlvbikge1xuICAgICAgICBjb25zdCBjbGFzc0RlY2xhcmF0aW9uID0gY2hpbGQgYXMgdHMuQ2xhc3NEZWNsYXJhdGlvbjtcbiAgICAgICAgaWYgKGNsYXNzRGVjbGFyYXRpb24ubmFtZSAhPSBudWxsICYmIGNsYXNzRGVjbGFyYXRpb24ubmFtZS50ZXh0ID09PSB0eXBlLm5hbWUpIHtcbiAgICAgICAgICByZXR1cm4gY2xhc3NEZWNsYXJhdGlvbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pIGFzKHRzLkNsYXNzRGVjbGFyYXRpb24gfCB1bmRlZmluZWQpO1xuICB9XG5cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBpcGVzVGFibGUoXG4gICAgc291cmNlOiB0cy5Tb3VyY2VGaWxlLCBwcm9ncmFtOiB0cy5Qcm9ncmFtLCBjaGVja2VyOiB0cy5UeXBlQ2hlY2tlcixcbiAgICBwaXBlczogQ29tcGlsZVBpcGVTdW1tYXJ5W10pOiBTeW1ib2xUYWJsZSB7XG4gIHJldHVybiBuZXcgUGlwZXNUYWJsZShwaXBlcywge3Byb2dyYW0sIGNoZWNrZXIsIG5vZGU6IHNvdXJjZX0pO1xufVxuXG5jbGFzcyBUeXBlU2NyaXB0U3ltYm9sUXVlcnkgaW1wbGVtZW50cyBTeW1ib2xRdWVyeSB7XG4gIHByaXZhdGUgdHlwZUNhY2hlID0gbmV3IE1hcDxCdWlsdGluVHlwZSwgU3ltYm9sPigpO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBwaXBlc0NhY2hlICE6IFN5bWJvbFRhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBwcm9ncmFtOiB0cy5Qcm9ncmFtLCBwcml2YXRlIGNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLCBwcml2YXRlIHNvdXJjZTogdHMuU291cmNlRmlsZSxcbiAgICAgIHByaXZhdGUgZmV0Y2hQaXBlczogKCkgPT4gU3ltYm9sVGFibGUpIHt9XG5cbiAgZ2V0VHlwZUtpbmQoc3ltYm9sOiBTeW1ib2wpOiBCdWlsdGluVHlwZSB7IHJldHVybiB0eXBlS2luZE9mKHRoaXMuZ2V0VHNUeXBlT2Yoc3ltYm9sKSk7IH1cblxuICBnZXRCdWlsdGluVHlwZShraW5kOiBCdWlsdGluVHlwZSk6IFN5bWJvbCB7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMudHlwZUNhY2hlLmdldChraW5kKTtcbiAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgY29uc3QgdHlwZSA9IGdldEJ1aWx0aW5UeXBlRnJvbVRzKFxuICAgICAgICAgIGtpbmQsIHtjaGVja2VyOiB0aGlzLmNoZWNrZXIsIG5vZGU6IHRoaXMuc291cmNlLCBwcm9ncmFtOiB0aGlzLnByb2dyYW19KTtcbiAgICAgIHJlc3VsdCA9XG4gICAgICAgICAgbmV3IFR5cGVXcmFwcGVyKHR5cGUsIHtwcm9ncmFtOiB0aGlzLnByb2dyYW0sIGNoZWNrZXI6IHRoaXMuY2hlY2tlciwgbm9kZTogdGhpcy5zb3VyY2V9KTtcbiAgICAgIHRoaXMudHlwZUNhY2hlLnNldChraW5kLCByZXN1bHQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZ2V0VHlwZVVuaW9uKC4uLnR5cGVzOiBTeW1ib2xbXSk6IFN5bWJvbCB7XG4gICAgLy8gTm8gQVBJIGV4aXN0cyBzbyByZXR1cm4gYW55IGlmIHRoZSB0eXBlcyBhcmUgbm90IGFsbCB0aGUgc2FtZSB0eXBlLlxuICAgIGxldCByZXN1bHQ6IFN5bWJvbHx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgaWYgKHR5cGVzLmxlbmd0aCkge1xuICAgICAgcmVzdWx0ID0gdHlwZXNbMF07XG4gICAgICBmb3IgKGxldCBpID0gMTsgaSA8IHR5cGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh0eXBlc1tpXSAhPSByZXN1bHQpIHtcbiAgICAgICAgICByZXN1bHQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdCB8fCB0aGlzLmdldEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlLkFueSk7XG4gIH1cblxuICBnZXRBcnJheVR5cGUodHlwZTogU3ltYm9sKTogU3ltYm9sIHsgcmV0dXJuIHRoaXMuZ2V0QnVpbHRpblR5cGUoQnVpbHRpblR5cGUuQW55KTsgfVxuXG4gIGdldEVsZW1lbnRUeXBlKHR5cGU6IFN5bWJvbCk6IFN5bWJvbHx1bmRlZmluZWQge1xuICAgIGlmICh0eXBlIGluc3RhbmNlb2YgVHlwZVdyYXBwZXIpIHtcbiAgICAgIGNvbnN0IGVsZW1lbnRUeXBlID0gZ2V0VHlwZVBhcmFtZXRlck9mKHR5cGUudHNUeXBlLCAnQXJyYXknKTtcbiAgICAgIGlmIChlbGVtZW50VHlwZSkge1xuICAgICAgICByZXR1cm4gbmV3IFR5cGVXcmFwcGVyKGVsZW1lbnRUeXBlLCB0eXBlLmNvbnRleHQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldE5vbk51bGxhYmxlVHlwZShzeW1ib2w6IFN5bWJvbCk6IFN5bWJvbCB7XG4gICAgaWYgKHN5bWJvbCBpbnN0YW5jZW9mIFR5cGVXcmFwcGVyICYmICh0eXBlb2YgdGhpcy5jaGVja2VyLmdldE5vbk51bGxhYmxlVHlwZSA9PSAnZnVuY3Rpb24nKSkge1xuICAgICAgY29uc3QgdHNUeXBlID0gc3ltYm9sLnRzVHlwZTtcbiAgICAgIGNvbnN0IG5vbk51bGxhYmxlVHlwZSA9IHRoaXMuY2hlY2tlci5nZXROb25OdWxsYWJsZVR5cGUodHNUeXBlKTtcbiAgICAgIGlmIChub25OdWxsYWJsZVR5cGUgIT0gdHNUeXBlKSB7XG4gICAgICAgIHJldHVybiBuZXcgVHlwZVdyYXBwZXIobm9uTnVsbGFibGVUeXBlLCBzeW1ib2wuY29udGV4dCk7XG4gICAgICB9IGVsc2UgaWYgKG5vbk51bGxhYmxlVHlwZSA9PSB0c1R5cGUpIHtcbiAgICAgICAgcmV0dXJuIHN5bWJvbDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ2V0QnVpbHRpblR5cGUoQnVpbHRpblR5cGUuQW55KTtcbiAgfVxuXG4gIGdldFBpcGVzKCk6IFN5bWJvbFRhYmxlIHtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy5waXBlc0NhY2hlO1xuICAgIGlmICghcmVzdWx0KSB7XG4gICAgICByZXN1bHQgPSB0aGlzLnBpcGVzQ2FjaGUgPSB0aGlzLmZldGNoUGlwZXMoKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGdldFRlbXBsYXRlQ29udGV4dCh0eXBlOiBTdGF0aWNTeW1ib2wpOiBTeW1ib2xUYWJsZXx1bmRlZmluZWQge1xuICAgIGNvbnN0IGNvbnRleHQ6IFR5cGVDb250ZXh0ID0ge25vZGU6IHRoaXMuc291cmNlLCBwcm9ncmFtOiB0aGlzLnByb2dyYW0sIGNoZWNrZXI6IHRoaXMuY2hlY2tlcn07XG4gICAgY29uc3QgdHlwZVN5bWJvbCA9IGZpbmRDbGFzc1N5bWJvbEluQ29udGV4dCh0eXBlLCBjb250ZXh0KTtcbiAgICBpZiAodHlwZVN5bWJvbCkge1xuICAgICAgY29uc3QgY29udGV4dFR5cGUgPSB0aGlzLmdldFRlbXBsYXRlUmVmQ29udGV4dFR5cGUodHlwZVN5bWJvbCk7XG4gICAgICBpZiAoY29udGV4dFR5cGUpIHJldHVybiBuZXcgU3ltYm9sV3JhcHBlcihjb250ZXh0VHlwZSwgY29udGV4dCkubWVtYmVycygpO1xuICAgIH1cbiAgfVxuXG4gIGdldFR5cGVTeW1ib2wodHlwZTogU3RhdGljU3ltYm9sKTogU3ltYm9sfHVuZGVmaW5lZCB7XG4gICAgY29uc3QgY29udGV4dDogVHlwZUNvbnRleHQgPSB7bm9kZTogdGhpcy5zb3VyY2UsIHByb2dyYW06IHRoaXMucHJvZ3JhbSwgY2hlY2tlcjogdGhpcy5jaGVja2VyfTtcbiAgICBjb25zdCB0eXBlU3ltYm9sID0gZmluZENsYXNzU3ltYm9sSW5Db250ZXh0KHR5cGUsIGNvbnRleHQpO1xuICAgIHJldHVybiB0eXBlU3ltYm9sICYmIG5ldyBTeW1ib2xXcmFwcGVyKHR5cGVTeW1ib2wsIGNvbnRleHQpO1xuICB9XG5cbiAgY3JlYXRlU3ltYm9sVGFibGUoc3ltYm9sczogU3ltYm9sRGVjbGFyYXRpb25bXSk6IFN5bWJvbFRhYmxlIHtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgTWFwU3ltYm9sVGFibGUoKTtcbiAgICByZXN1bHQuYWRkQWxsKHN5bWJvbHMubWFwKHMgPT4gbmV3IERlY2xhcmVkU3ltYm9sKHMpKSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIG1lcmdlU3ltYm9sVGFibGUoc3ltYm9sVGFibGVzOiBTeW1ib2xUYWJsZVtdKTogU3ltYm9sVGFibGUge1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBNYXBTeW1ib2xUYWJsZSgpO1xuICAgIGZvciAoY29uc3Qgc3ltYm9sVGFibGUgb2Ygc3ltYm9sVGFibGVzKSB7XG4gICAgICByZXN1bHQuYWRkQWxsKHN5bWJvbFRhYmxlLnZhbHVlcygpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGdldFNwYW5BdChsaW5lOiBudW1iZXIsIGNvbHVtbjogbnVtYmVyKTogU3Bhbnx1bmRlZmluZWQge1xuICAgIHJldHVybiBzcGFuQXQodGhpcy5zb3VyY2UsIGxpbmUsIGNvbHVtbik7XG4gIH1cblxuICBwcml2YXRlIGdldFRlbXBsYXRlUmVmQ29udGV4dFR5cGUodHlwZVN5bWJvbDogdHMuU3ltYm9sKTogdHMuU3ltYm9sfHVuZGVmaW5lZCB7XG4gICAgY29uc3QgdHlwZSA9IHRoaXMuY2hlY2tlci5nZXRUeXBlT2ZTeW1ib2xBdExvY2F0aW9uKHR5cGVTeW1ib2wsIHRoaXMuc291cmNlKTtcbiAgICBjb25zdCBjb25zdHJ1Y3RvciA9IHR5cGUuc3ltYm9sICYmIHR5cGUuc3ltYm9sLm1lbWJlcnMgJiZcbiAgICAgICAgZ2V0RnJvbVN5bWJvbFRhYmxlKHR5cGUuc3ltYm9sLm1lbWJlcnMgISwgJ19fY29uc3RydWN0b3InKTtcblxuICAgIGlmIChjb25zdHJ1Y3Rvcikge1xuICAgICAgY29uc3QgY29uc3RydWN0b3JEZWNsYXJhdGlvbiA9IGNvbnN0cnVjdG9yLmRlY2xhcmF0aW9ucyAhWzBdIGFzIHRzLkNvbnN0cnVjdG9yVHlwZU5vZGU7XG4gICAgICBmb3IgKGNvbnN0IHBhcmFtZXRlciBvZiBjb25zdHJ1Y3RvckRlY2xhcmF0aW9uLnBhcmFtZXRlcnMpIHtcbiAgICAgICAgY29uc3QgdHlwZSA9IHRoaXMuY2hlY2tlci5nZXRUeXBlQXRMb2NhdGlvbihwYXJhbWV0ZXIudHlwZSAhKTtcbiAgICAgICAgaWYgKHR5cGUuc3ltYm9sICEubmFtZSA9PSAnVGVtcGxhdGVSZWYnICYmIGlzUmVmZXJlbmNlVHlwZSh0eXBlKSkge1xuICAgICAgICAgIGNvbnN0IHR5cGVSZWZlcmVuY2UgPSB0eXBlIGFzIHRzLlR5cGVSZWZlcmVuY2U7XG4gICAgICAgICAgaWYgKHR5cGVSZWZlcmVuY2UudHlwZUFyZ3VtZW50cyAmJiB0eXBlUmVmZXJlbmNlLnR5cGVBcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gdHlwZVJlZmVyZW5jZS50eXBlQXJndW1lbnRzWzBdLnN5bWJvbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldFRzVHlwZU9mKHN5bWJvbDogU3ltYm9sKTogdHMuVHlwZXx1bmRlZmluZWQge1xuICAgIGNvbnN0IHR5cGUgPSB0aGlzLmdldFR5cGVXcmFwcGVyKHN5bWJvbCk7XG4gICAgcmV0dXJuIHR5cGUgJiYgdHlwZS50c1R5cGU7XG4gIH1cblxuICBwcml2YXRlIGdldFR5cGVXcmFwcGVyKHN5bWJvbDogU3ltYm9sKTogVHlwZVdyYXBwZXJ8dW5kZWZpbmVkIHtcbiAgICBsZXQgdHlwZTogVHlwZVdyYXBwZXJ8dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGlmIChzeW1ib2wgaW5zdGFuY2VvZiBUeXBlV3JhcHBlcikge1xuICAgICAgdHlwZSA9IHN5bWJvbDtcbiAgICB9IGVsc2UgaWYgKHN5bWJvbC50eXBlIGluc3RhbmNlb2YgVHlwZVdyYXBwZXIpIHtcbiAgICAgIHR5cGUgPSBzeW1ib2wudHlwZTtcbiAgICB9XG4gICAgcmV0dXJuIHR5cGU7XG4gIH1cbn1cblxuZnVuY3Rpb24gdHlwZUNhbGxhYmxlKHR5cGU6IHRzLlR5cGUpOiBib29sZWFuIHtcbiAgY29uc3Qgc2lnbmF0dXJlcyA9IHR5cGUuZ2V0Q2FsbFNpZ25hdHVyZXMoKTtcbiAgcmV0dXJuIHNpZ25hdHVyZXMgJiYgc2lnbmF0dXJlcy5sZW5ndGggIT0gMDtcbn1cblxuZnVuY3Rpb24gc2lnbmF0dXJlc09mKHR5cGU6IHRzLlR5cGUsIGNvbnRleHQ6IFR5cGVDb250ZXh0KTogU2lnbmF0dXJlW10ge1xuICByZXR1cm4gdHlwZS5nZXRDYWxsU2lnbmF0dXJlcygpLm1hcChzID0+IG5ldyBTaWduYXR1cmVXcmFwcGVyKHMsIGNvbnRleHQpKTtcbn1cblxuZnVuY3Rpb24gc2VsZWN0U2lnbmF0dXJlKHR5cGU6IHRzLlR5cGUsIGNvbnRleHQ6IFR5cGVDb250ZXh0LCB0eXBlczogU3ltYm9sW10pOiBTaWduYXR1cmV8XG4gICAgdW5kZWZpbmVkIHtcbiAgLy8gVE9ETzogRG8gYSBiZXR0ZXIgam9iIG9mIHNlbGVjdGluZyB0aGUgcmlnaHQgc2lnbmF0dXJlLlxuICBjb25zdCBzaWduYXR1cmVzID0gdHlwZS5nZXRDYWxsU2lnbmF0dXJlcygpO1xuICByZXR1cm4gc2lnbmF0dXJlcy5sZW5ndGggPyBuZXcgU2lnbmF0dXJlV3JhcHBlcihzaWduYXR1cmVzWzBdLCBjb250ZXh0KSA6IHVuZGVmaW5lZDtcbn1cblxuY2xhc3MgVHlwZVdyYXBwZXIgaW1wbGVtZW50cyBTeW1ib2wge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdHNUeXBlOiB0cy5UeXBlLCBwdWJsaWMgY29udGV4dDogVHlwZUNvbnRleHQpIHtcbiAgICBpZiAoIXRzVHlwZSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0ludGVybmFsOiBudWxsIHR5cGUnKTtcbiAgICB9XG4gIH1cblxuICBnZXQgbmFtZSgpOiBzdHJpbmcge1xuICAgIGNvbnN0IHN5bWJvbCA9IHRoaXMudHNUeXBlLnN5bWJvbDtcbiAgICByZXR1cm4gKHN5bWJvbCAmJiBzeW1ib2wubmFtZSkgfHwgJzxhbm9ueW1vdXM+JztcbiAgfVxuXG4gIHB1YmxpYyByZWFkb25seSBraW5kOiBEZWNsYXJhdGlvbktpbmQgPSAndHlwZSc7XG5cbiAgcHVibGljIHJlYWRvbmx5IGxhbmd1YWdlOiBzdHJpbmcgPSAndHlwZXNjcmlwdCc7XG5cbiAgcHVibGljIHJlYWRvbmx5IHR5cGU6IFN5bWJvbHx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgcHVibGljIHJlYWRvbmx5IGNvbnRhaW5lcjogU3ltYm9sfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICBwdWJsaWMgcmVhZG9ubHkgcHVibGljOiBib29sZWFuID0gdHJ1ZTtcblxuICBnZXQgY2FsbGFibGUoKTogYm9vbGVhbiB7IHJldHVybiB0eXBlQ2FsbGFibGUodGhpcy50c1R5cGUpOyB9XG5cbiAgZ2V0IG51bGxhYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNvbnRleHQuY2hlY2tlci5nZXROb25OdWxsYWJsZVR5cGUodGhpcy50c1R5cGUpICE9IHRoaXMudHNUeXBlO1xuICB9XG5cbiAgZ2V0IGRlZmluaXRpb24oKTogRGVmaW5pdGlvbnx1bmRlZmluZWQge1xuICAgIGNvbnN0IHN5bWJvbCA9IHRoaXMudHNUeXBlLmdldFN5bWJvbCgpO1xuICAgIHJldHVybiBzeW1ib2wgPyBkZWZpbml0aW9uRnJvbVRzU3ltYm9sKHN5bWJvbCkgOiB1bmRlZmluZWQ7XG4gIH1cblxuICBtZW1iZXJzKCk6IFN5bWJvbFRhYmxlIHtcbiAgICByZXR1cm4gbmV3IFN5bWJvbFRhYmxlV3JhcHBlcih0aGlzLnRzVHlwZS5nZXRQcm9wZXJ0aWVzKCksIHRoaXMuY29udGV4dCk7XG4gIH1cblxuICBzaWduYXR1cmVzKCk6IFNpZ25hdHVyZVtdIHsgcmV0dXJuIHNpZ25hdHVyZXNPZih0aGlzLnRzVHlwZSwgdGhpcy5jb250ZXh0KTsgfVxuXG4gIHNlbGVjdFNpZ25hdHVyZSh0eXBlczogU3ltYm9sW10pOiBTaWduYXR1cmV8dW5kZWZpbmVkIHtcbiAgICByZXR1cm4gc2VsZWN0U2lnbmF0dXJlKHRoaXMudHNUeXBlLCB0aGlzLmNvbnRleHQsIHR5cGVzKTtcbiAgfVxuXG4gIGluZGV4ZWQoYXJndW1lbnQ6IFN5bWJvbCk6IFN5bWJvbHx1bmRlZmluZWQgeyByZXR1cm4gdW5kZWZpbmVkOyB9XG59XG5cbmNsYXNzIFN5bWJvbFdyYXBwZXIgaW1wbGVtZW50cyBTeW1ib2wge1xuICBwcml2YXRlIHN5bWJvbDogdHMuU3ltYm9sO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfdHNUeXBlICE6IHRzLlR5cGU7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9tZW1iZXJzICE6IFN5bWJvbFRhYmxlO1xuXG4gIHB1YmxpYyByZWFkb25seSBudWxsYWJsZTogYm9vbGVhbiA9IGZhbHNlO1xuICBwdWJsaWMgcmVhZG9ubHkgbGFuZ3VhZ2U6IHN0cmluZyA9ICd0eXBlc2NyaXB0JztcblxuICBjb25zdHJ1Y3RvcihzeW1ib2w6IHRzLlN5bWJvbCwgcHJpdmF0ZSBjb250ZXh0OiBUeXBlQ29udGV4dCkge1xuICAgIHRoaXMuc3ltYm9sID0gc3ltYm9sICYmIGNvbnRleHQgJiYgKHN5bWJvbC5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLkFsaWFzKSA/XG4gICAgICAgIGNvbnRleHQuY2hlY2tlci5nZXRBbGlhc2VkU3ltYm9sKHN5bWJvbCkgOlxuICAgICAgICBzeW1ib2w7XG4gIH1cblxuICBnZXQgbmFtZSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5zeW1ib2wubmFtZTsgfVxuXG4gIGdldCBraW5kKCk6IERlY2xhcmF0aW9uS2luZCB7IHJldHVybiB0aGlzLmNhbGxhYmxlID8gJ21ldGhvZCcgOiAncHJvcGVydHknOyB9XG5cbiAgZ2V0IHR5cGUoKTogU3ltYm9sfHVuZGVmaW5lZCB7IHJldHVybiBuZXcgVHlwZVdyYXBwZXIodGhpcy50c1R5cGUsIHRoaXMuY29udGV4dCk7IH1cblxuICBnZXQgY29udGFpbmVyKCk6IFN5bWJvbHx1bmRlZmluZWQgeyByZXR1cm4gZ2V0Q29udGFpbmVyT2YodGhpcy5zeW1ib2wsIHRoaXMuY29udGV4dCk7IH1cblxuICBnZXQgcHVibGljKCk6IGJvb2xlYW4ge1xuICAgIC8vIFN5bWJvbHMgdGhhdCBhcmUgbm90IGV4cGxpY2l0bHkgbWFkZSBwcml2YXRlIGFyZSBwdWJsaWMuXG4gICAgcmV0dXJuICFpc1N5bWJvbFByaXZhdGUodGhpcy5zeW1ib2wpO1xuICB9XG5cbiAgZ2V0IGNhbGxhYmxlKCk6IGJvb2xlYW4geyByZXR1cm4gdHlwZUNhbGxhYmxlKHRoaXMudHNUeXBlKTsgfVxuXG4gIGdldCBkZWZpbml0aW9uKCk6IERlZmluaXRpb24geyByZXR1cm4gZGVmaW5pdGlvbkZyb21Uc1N5bWJvbCh0aGlzLnN5bWJvbCk7IH1cblxuICBtZW1iZXJzKCk6IFN5bWJvbFRhYmxlIHtcbiAgICBpZiAoIXRoaXMuX21lbWJlcnMpIHtcbiAgICAgIGlmICgodGhpcy5zeW1ib2wuZmxhZ3MgJiAodHMuU3ltYm9sRmxhZ3MuQ2xhc3MgfCB0cy5TeW1ib2xGbGFncy5JbnRlcmZhY2UpKSAhPSAwKSB7XG4gICAgICAgIGNvbnN0IGRlY2xhcmVkVHlwZSA9IHRoaXMuY29udGV4dC5jaGVja2VyLmdldERlY2xhcmVkVHlwZU9mU3ltYm9sKHRoaXMuc3ltYm9sKTtcbiAgICAgICAgY29uc3QgdHlwZVdyYXBwZXIgPSBuZXcgVHlwZVdyYXBwZXIoZGVjbGFyZWRUeXBlLCB0aGlzLmNvbnRleHQpO1xuICAgICAgICB0aGlzLl9tZW1iZXJzID0gdHlwZVdyYXBwZXIubWVtYmVycygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fbWVtYmVycyA9IG5ldyBTeW1ib2xUYWJsZVdyYXBwZXIodGhpcy5zeW1ib2wubWVtYmVycyAhLCB0aGlzLmNvbnRleHQpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fbWVtYmVycztcbiAgfVxuXG4gIHNpZ25hdHVyZXMoKTogU2lnbmF0dXJlW10geyByZXR1cm4gc2lnbmF0dXJlc09mKHRoaXMudHNUeXBlLCB0aGlzLmNvbnRleHQpOyB9XG5cbiAgc2VsZWN0U2lnbmF0dXJlKHR5cGVzOiBTeW1ib2xbXSk6IFNpZ25hdHVyZXx1bmRlZmluZWQge1xuICAgIHJldHVybiBzZWxlY3RTaWduYXR1cmUodGhpcy50c1R5cGUsIHRoaXMuY29udGV4dCwgdHlwZXMpO1xuICB9XG5cbiAgaW5kZXhlZChhcmd1bWVudDogU3ltYm9sKTogU3ltYm9sfHVuZGVmaW5lZCB7IHJldHVybiB1bmRlZmluZWQ7IH1cblxuICBwcml2YXRlIGdldCB0c1R5cGUoKTogdHMuVHlwZSB7XG4gICAgbGV0IHR5cGUgPSB0aGlzLl90c1R5cGU7XG4gICAgaWYgKCF0eXBlKSB7XG4gICAgICB0eXBlID0gdGhpcy5fdHNUeXBlID1cbiAgICAgICAgICB0aGlzLmNvbnRleHQuY2hlY2tlci5nZXRUeXBlT2ZTeW1ib2xBdExvY2F0aW9uKHRoaXMuc3ltYm9sLCB0aGlzLmNvbnRleHQubm9kZSk7XG4gICAgfVxuICAgIHJldHVybiB0eXBlO1xuICB9XG59XG5cbmNsYXNzIERlY2xhcmVkU3ltYm9sIGltcGxlbWVudHMgU3ltYm9sIHtcbiAgcHVibGljIHJlYWRvbmx5IGxhbmd1YWdlOiBzdHJpbmcgPSAnbmctdGVtcGxhdGUnO1xuXG4gIHB1YmxpYyByZWFkb25seSBudWxsYWJsZTogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIHB1YmxpYyByZWFkb25seSBwdWJsaWM6IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZGVjbGFyYXRpb246IFN5bWJvbERlY2xhcmF0aW9uKSB7fVxuXG4gIGdldCBuYW1lKCkgeyByZXR1cm4gdGhpcy5kZWNsYXJhdGlvbi5uYW1lOyB9XG5cbiAgZ2V0IGtpbmQoKSB7IHJldHVybiB0aGlzLmRlY2xhcmF0aW9uLmtpbmQ7IH1cblxuICBnZXQgY29udGFpbmVyKCk6IFN5bWJvbHx1bmRlZmluZWQgeyByZXR1cm4gdW5kZWZpbmVkOyB9XG5cbiAgZ2V0IHR5cGUoKSB7IHJldHVybiB0aGlzLmRlY2xhcmF0aW9uLnR5cGU7IH1cblxuICBnZXQgY2FsbGFibGUoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmRlY2xhcmF0aW9uLnR5cGUuY2FsbGFibGU7IH1cblxuXG4gIGdldCBkZWZpbml0aW9uKCk6IERlZmluaXRpb24geyByZXR1cm4gdGhpcy5kZWNsYXJhdGlvbi5kZWZpbml0aW9uOyB9XG5cbiAgbWVtYmVycygpOiBTeW1ib2xUYWJsZSB7IHJldHVybiB0aGlzLmRlY2xhcmF0aW9uLnR5cGUubWVtYmVycygpOyB9XG5cbiAgc2lnbmF0dXJlcygpOiBTaWduYXR1cmVbXSB7IHJldHVybiB0aGlzLmRlY2xhcmF0aW9uLnR5cGUuc2lnbmF0dXJlcygpOyB9XG5cbiAgc2VsZWN0U2lnbmF0dXJlKHR5cGVzOiBTeW1ib2xbXSk6IFNpZ25hdHVyZXx1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmRlY2xhcmF0aW9uLnR5cGUuc2VsZWN0U2lnbmF0dXJlKHR5cGVzKTtcbiAgfVxuXG4gIGluZGV4ZWQoYXJndW1lbnQ6IFN5bWJvbCk6IFN5bWJvbHx1bmRlZmluZWQgeyByZXR1cm4gdW5kZWZpbmVkOyB9XG59XG5cbmNsYXNzIFNpZ25hdHVyZVdyYXBwZXIgaW1wbGVtZW50cyBTaWduYXR1cmUge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHNpZ25hdHVyZTogdHMuU2lnbmF0dXJlLCBwcml2YXRlIGNvbnRleHQ6IFR5cGVDb250ZXh0KSB7fVxuXG4gIGdldCBhcmd1bWVudHMoKTogU3ltYm9sVGFibGUge1xuICAgIHJldHVybiBuZXcgU3ltYm9sVGFibGVXcmFwcGVyKHRoaXMuc2lnbmF0dXJlLmdldFBhcmFtZXRlcnMoKSwgdGhpcy5jb250ZXh0KTtcbiAgfVxuXG4gIGdldCByZXN1bHQoKTogU3ltYm9sIHsgcmV0dXJuIG5ldyBUeXBlV3JhcHBlcih0aGlzLnNpZ25hdHVyZS5nZXRSZXR1cm5UeXBlKCksIHRoaXMuY29udGV4dCk7IH1cbn1cblxuY2xhc3MgU2lnbmF0dXJlUmVzdWx0T3ZlcnJpZGUgaW1wbGVtZW50cyBTaWduYXR1cmUge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHNpZ25hdHVyZTogU2lnbmF0dXJlLCBwcml2YXRlIHJlc3VsdFR5cGU6IFN5bWJvbCkge31cblxuICBnZXQgYXJndW1lbnRzKCk6IFN5bWJvbFRhYmxlIHsgcmV0dXJuIHRoaXMuc2lnbmF0dXJlLmFyZ3VtZW50czsgfVxuXG4gIGdldCByZXN1bHQoKTogU3ltYm9sIHsgcmV0dXJuIHRoaXMucmVzdWx0VHlwZTsgfVxufVxuXG4vKipcbiAqIEluZGljYXRlcyB0aGUgbG93ZXIgYm91bmQgVHlwZVNjcmlwdCB2ZXJzaW9uIHN1cHBvcnRpbmcgYFN5bWJvbFRhYmxlYCBhcyBhbiBFUzYgYE1hcGAuXG4gKiBGb3IgbG93ZXIgdmVyc2lvbnMsIGBTeW1ib2xUYWJsZWAgaXMgaW1wbGVtZW50ZWQgYXMgYSBkaWN0aW9uYXJ5XG4gKi9cbmNvbnN0IE1JTl9UU19WRVJTSU9OX1NVUFBPUlRJTkdfTUFQID0gJzIuMic7XG5cbmV4cG9ydCBjb25zdCB0b1N5bWJvbFRhYmxlRmFjdG9yeSA9ICh0c1ZlcnNpb246IHN0cmluZykgPT4gKHN5bWJvbHM6IHRzLlN5bWJvbFtdKSA9PiB7XG4gIGlmIChpc1ZlcnNpb25CZXR3ZWVuKHRzVmVyc2lvbiwgTUlOX1RTX1ZFUlNJT05fU1VQUE9SVElOR19NQVApKSB7XG4gICAgLy8g4oiAIFR5cGVzY3JpcHQgdmVyc2lvbiA+PSAyLjIsIGBTeW1ib2xUYWJsZWAgaXMgaW1wbGVtZW50ZWQgYXMgYW4gRVM2IGBNYXBgXG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IE1hcDxzdHJpbmcsIHRzLlN5bWJvbD4oKTtcbiAgICBmb3IgKGNvbnN0IHN5bWJvbCBvZiBzeW1ib2xzKSB7XG4gICAgICByZXN1bHQuc2V0KHN5bWJvbC5uYW1lLCBzeW1ib2wpO1xuICAgIH1cbiAgICAvLyBGaXJzdCwgdGVsbCB0aGUgY29tcGlsZXIgdGhhdCBgcmVzdWx0YCBpcyBvZiB0eXBlIGBhbnlgLiBUaGVuLCB1c2UgYSBzZWNvbmQgdHlwZSBhc3NlcnRpb25cbiAgICAvLyB0byBgdHMuU3ltYm9sVGFibGVgLlxuICAgIC8vIE90aGVyd2lzZSwgYE1hcDxzdHJpbmcsIHRzLlN5bWJvbD5gIGFuZCBgdHMuU3ltYm9sVGFibGVgIHdpbGwgYmUgY29uc2lkZXJlZCBhcyBpbmNvbXBhdGlibGVcbiAgICAvLyB0eXBlcyBieSB0aGUgY29tcGlsZXJcbiAgICByZXR1cm4gPHRzLlN5bWJvbFRhYmxlPig8YW55PnJlc3VsdCk7XG4gIH1cblxuICAvLyDiiIAgVHlwZXNjcmlwdCB2ZXJzaW9uIDwgMi4yLCBgU3ltYm9sVGFibGVgIGlzIGltcGxlbWVudGVkIGFzIGEgZGljdGlvbmFyeVxuICBjb25zdCByZXN1bHQ6IHtbbmFtZTogc3RyaW5nXTogdHMuU3ltYm9sfSA9IHt9O1xuICBmb3IgKGNvbnN0IHN5bWJvbCBvZiBzeW1ib2xzKSB7XG4gICAgcmVzdWx0W3N5bWJvbC5uYW1lXSA9IHN5bWJvbDtcbiAgfVxuICByZXR1cm4gPHRzLlN5bWJvbFRhYmxlPig8YW55PnJlc3VsdCk7XG59O1xuXG5mdW5jdGlvbiB0b1N5bWJvbHMoc3ltYm9sVGFibGU6IHRzLlN5bWJvbFRhYmxlIHwgdW5kZWZpbmVkKTogdHMuU3ltYm9sW10ge1xuICBpZiAoIXN5bWJvbFRhYmxlKSByZXR1cm4gW107XG5cbiAgY29uc3QgdGFibGUgPSBzeW1ib2xUYWJsZSBhcyBhbnk7XG5cbiAgaWYgKHR5cGVvZiB0YWJsZS52YWx1ZXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0YWJsZS52YWx1ZXMoKSkgYXMgdHMuU3ltYm9sW107XG4gIH1cblxuICBjb25zdCByZXN1bHQ6IHRzLlN5bWJvbFtdID0gW107XG5cbiAgY29uc3Qgb3duID0gdHlwZW9mIHRhYmxlLmhhc093blByb3BlcnR5ID09PSAnZnVuY3Rpb24nID9cbiAgICAgIChuYW1lOiBzdHJpbmcpID0+IHRhYmxlLmhhc093blByb3BlcnR5KG5hbWUpIDpcbiAgICAgIChuYW1lOiBzdHJpbmcpID0+ICEhdGFibGVbbmFtZV07XG5cbiAgZm9yIChjb25zdCBuYW1lIGluIHRhYmxlKSB7XG4gICAgaWYgKG93bihuYW1lKSkge1xuICAgICAgcmVzdWx0LnB1c2godGFibGVbbmFtZV0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5jbGFzcyBTeW1ib2xUYWJsZVdyYXBwZXIgaW1wbGVtZW50cyBTeW1ib2xUYWJsZSB7XG4gIHByaXZhdGUgc3ltYm9sczogdHMuU3ltYm9sW107XG4gIHByaXZhdGUgc3ltYm9sVGFibGU6IHRzLlN5bWJvbFRhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHN5bWJvbHM6IHRzLlN5bWJvbFRhYmxlfHRzLlN5bWJvbFtdfHVuZGVmaW5lZCwgcHJpdmF0ZSBjb250ZXh0OiBUeXBlQ29udGV4dCkge1xuICAgIHN5bWJvbHMgPSBzeW1ib2xzIHx8IFtdO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc3ltYm9scykpIHtcbiAgICAgIHRoaXMuc3ltYm9scyA9IHN5bWJvbHM7XG4gICAgICBjb25zdCB0b1N5bWJvbFRhYmxlID0gdG9TeW1ib2xUYWJsZUZhY3RvcnkodHMudmVyc2lvbik7XG4gICAgICB0aGlzLnN5bWJvbFRhYmxlID0gdG9TeW1ib2xUYWJsZShzeW1ib2xzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zeW1ib2xzID0gdG9TeW1ib2xzKHN5bWJvbHMpO1xuICAgICAgdGhpcy5zeW1ib2xUYWJsZSA9IHN5bWJvbHM7XG4gICAgfVxuICB9XG5cbiAgZ2V0IHNpemUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuc3ltYm9scy5sZW5ndGg7IH1cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBTeW1ib2x8dW5kZWZpbmVkIHtcbiAgICBjb25zdCBzeW1ib2wgPSBnZXRGcm9tU3ltYm9sVGFibGUodGhpcy5zeW1ib2xUYWJsZSwga2V5KTtcbiAgICByZXR1cm4gc3ltYm9sID8gbmV3IFN5bWJvbFdyYXBwZXIoc3ltYm9sLCB0aGlzLmNvbnRleHQpIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgaGFzKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgdGFibGU6IGFueSA9IHRoaXMuc3ltYm9sVGFibGU7XG4gICAgcmV0dXJuICh0eXBlb2YgdGFibGUuaGFzID09PSAnZnVuY3Rpb24nKSA/IHRhYmxlLmhhcyhrZXkpIDogdGFibGVba2V5XSAhPSBudWxsO1xuICB9XG5cbiAgdmFsdWVzKCk6IFN5bWJvbFtdIHsgcmV0dXJuIHRoaXMuc3ltYm9scy5tYXAocyA9PiBuZXcgU3ltYm9sV3JhcHBlcihzLCB0aGlzLmNvbnRleHQpKTsgfVxufVxuXG5jbGFzcyBNYXBTeW1ib2xUYWJsZSBpbXBsZW1lbnRzIFN5bWJvbFRhYmxlIHtcbiAgcHJpdmF0ZSBtYXAgPSBuZXcgTWFwPHN0cmluZywgU3ltYm9sPigpO1xuICBwcml2YXRlIF92YWx1ZXM6IFN5bWJvbFtdID0gW107XG5cbiAgZ2V0IHNpemUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMubWFwLnNpemU7IH1cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBTeW1ib2x8dW5kZWZpbmVkIHsgcmV0dXJuIHRoaXMubWFwLmdldChrZXkpOyB9XG5cbiAgYWRkKHN5bWJvbDogU3ltYm9sKSB7XG4gICAgaWYgKHRoaXMubWFwLmhhcyhzeW1ib2wubmFtZSkpIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzID0gdGhpcy5tYXAuZ2V0KHN5bWJvbC5uYW1lKSAhO1xuICAgICAgdGhpcy5fdmFsdWVzW3RoaXMuX3ZhbHVlcy5pbmRleE9mKHByZXZpb3VzKV0gPSBzeW1ib2w7XG4gICAgfVxuICAgIHRoaXMubWFwLnNldChzeW1ib2wubmFtZSwgc3ltYm9sKTtcbiAgICB0aGlzLl92YWx1ZXMucHVzaChzeW1ib2wpO1xuICB9XG5cbiAgYWRkQWxsKHN5bWJvbHM6IFN5bWJvbFtdKSB7XG4gICAgZm9yIChjb25zdCBzeW1ib2wgb2Ygc3ltYm9scykge1xuICAgICAgdGhpcy5hZGQoc3ltYm9sKTtcbiAgICB9XG4gIH1cblxuICBoYXMoa2V5OiBzdHJpbmcpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMubWFwLmhhcyhrZXkpOyB9XG5cbiAgdmFsdWVzKCk6IFN5bWJvbFtdIHtcbiAgICAvLyBTd2l0Y2ggdG8gdGhpcy5tYXAudmFsdWVzIG9uY2UgaXRlcmFibGVzIGFyZSBzdXBwb3J0ZWQgYnkgdGhlIHRhcmdldCBsYW5ndWFnZS5cbiAgICByZXR1cm4gdGhpcy5fdmFsdWVzO1xuICB9XG59XG5cbmNsYXNzIFBpcGVzVGFibGUgaW1wbGVtZW50cyBTeW1ib2xUYWJsZSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcGlwZXM6IENvbXBpbGVQaXBlU3VtbWFyeVtdLCBwcml2YXRlIGNvbnRleHQ6IFR5cGVDb250ZXh0KSB7fVxuXG4gIGdldCBzaXplKCkgeyByZXR1cm4gdGhpcy5waXBlcy5sZW5ndGg7IH1cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBTeW1ib2x8dW5kZWZpbmVkIHtcbiAgICBjb25zdCBwaXBlID0gdGhpcy5waXBlcy5maW5kKHBpcGUgPT4gcGlwZS5uYW1lID09IGtleSk7XG4gICAgaWYgKHBpcGUpIHtcbiAgICAgIHJldHVybiBuZXcgUGlwZVN5bWJvbChwaXBlLCB0aGlzLmNvbnRleHQpO1xuICAgIH1cbiAgfVxuXG4gIGhhcyhrZXk6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5waXBlcy5maW5kKHBpcGUgPT4gcGlwZS5uYW1lID09IGtleSkgIT0gbnVsbDsgfVxuXG4gIHZhbHVlcygpOiBTeW1ib2xbXSB7IHJldHVybiB0aGlzLnBpcGVzLm1hcChwaXBlID0+IG5ldyBQaXBlU3ltYm9sKHBpcGUsIHRoaXMuY29udGV4dCkpOyB9XG59XG5cbi8vIFRoaXMgbWF0Y2hlcyAuZC50cyBmaWxlcyB0aGF0IGxvb2sgbGlrZSBcIi4uLi88cGFja2FnZS1uYW1lPi88cGFja2FnZS1uYW1lPi5kLnRzXCIsXG5jb25zdCBJTkRFWF9QQVRURVJOID0gL1tcXFxcL10oW15cXFxcL10rKVtcXFxcL11cXDFcXC5kXFwudHMkLztcblxuY2xhc3MgUGlwZVN5bWJvbCBpbXBsZW1lbnRzIFN5bWJvbCB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF90c1R5cGUgITogdHMuVHlwZTtcbiAgcHVibGljIHJlYWRvbmx5IGtpbmQ6IERlY2xhcmF0aW9uS2luZCA9ICdwaXBlJztcbiAgcHVibGljIHJlYWRvbmx5IGxhbmd1YWdlOiBzdHJpbmcgPSAndHlwZXNjcmlwdCc7XG4gIHB1YmxpYyByZWFkb25seSBjb250YWluZXI6IFN5bWJvbHx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIHB1YmxpYyByZWFkb25seSBjYWxsYWJsZTogYm9vbGVhbiA9IHRydWU7XG4gIHB1YmxpYyByZWFkb25seSBudWxsYWJsZTogYm9vbGVhbiA9IGZhbHNlO1xuICBwdWJsaWMgcmVhZG9ubHkgcHVibGljOiBib29sZWFuID0gdHJ1ZTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHBpcGU6IENvbXBpbGVQaXBlU3VtbWFyeSwgcHJpdmF0ZSBjb250ZXh0OiBUeXBlQ29udGV4dCkge31cblxuICBnZXQgbmFtZSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5waXBlLm5hbWU7IH1cblxuICBnZXQgdHlwZSgpOiBTeW1ib2x8dW5kZWZpbmVkIHsgcmV0dXJuIG5ldyBUeXBlV3JhcHBlcih0aGlzLnRzVHlwZSwgdGhpcy5jb250ZXh0KTsgfVxuXG4gIGdldCBkZWZpbml0aW9uKCk6IERlZmluaXRpb258dW5kZWZpbmVkIHtcbiAgICBjb25zdCBzeW1ib2wgPSB0aGlzLnRzVHlwZS5nZXRTeW1ib2woKTtcbiAgICByZXR1cm4gc3ltYm9sID8gZGVmaW5pdGlvbkZyb21Uc1N5bWJvbChzeW1ib2wpIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgbWVtYmVycygpOiBTeW1ib2xUYWJsZSB7IHJldHVybiBFbXB0eVRhYmxlLmluc3RhbmNlOyB9XG5cbiAgc2lnbmF0dXJlcygpOiBTaWduYXR1cmVbXSB7IHJldHVybiBzaWduYXR1cmVzT2YodGhpcy50c1R5cGUsIHRoaXMuY29udGV4dCk7IH1cblxuICBzZWxlY3RTaWduYXR1cmUodHlwZXM6IFN5bWJvbFtdKTogU2lnbmF0dXJlfHVuZGVmaW5lZCB7XG4gICAgbGV0IHNpZ25hdHVyZSA9IHNlbGVjdFNpZ25hdHVyZSh0aGlzLnRzVHlwZSwgdGhpcy5jb250ZXh0LCB0eXBlcykgITtcbiAgICBpZiAodHlwZXMubGVuZ3RoID09IDEpIHtcbiAgICAgIGNvbnN0IHBhcmFtZXRlclR5cGUgPSB0eXBlc1swXTtcbiAgICAgIGlmIChwYXJhbWV0ZXJUeXBlIGluc3RhbmNlb2YgVHlwZVdyYXBwZXIpIHtcbiAgICAgICAgbGV0IHJlc3VsdFR5cGU6IHRzLlR5cGV8dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgICAgICBzd2l0Y2ggKHRoaXMubmFtZSkge1xuICAgICAgICAgIGNhc2UgJ2FzeW5jJzpcbiAgICAgICAgICAgIHN3aXRjaCAocGFyYW1ldGVyVHlwZS5uYW1lKSB7XG4gICAgICAgICAgICAgIGNhc2UgJ09ic2VydmFibGUnOlxuICAgICAgICAgICAgICBjYXNlICdQcm9taXNlJzpcbiAgICAgICAgICAgICAgY2FzZSAnRXZlbnRFbWl0dGVyJzpcbiAgICAgICAgICAgICAgICByZXN1bHRUeXBlID0gZ2V0VHlwZVBhcmFtZXRlck9mKHBhcmFtZXRlclR5cGUudHNUeXBlLCBwYXJhbWV0ZXJUeXBlLm5hbWUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJlc3VsdFR5cGUgPSBnZXRCdWlsdGluVHlwZUZyb21UcyhCdWlsdGluVHlwZS5BbnksIHRoaXMuY29udGV4dCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdzbGljZSc6XG4gICAgICAgICAgICByZXN1bHRUeXBlID0gZ2V0VHlwZVBhcmFtZXRlck9mKHBhcmFtZXRlclR5cGUudHNUeXBlLCAnQXJyYXknKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXN1bHRUeXBlKSB7XG4gICAgICAgICAgc2lnbmF0dXJlID0gbmV3IFNpZ25hdHVyZVJlc3VsdE92ZXJyaWRlKFxuICAgICAgICAgICAgICBzaWduYXR1cmUsIG5ldyBUeXBlV3JhcHBlcihyZXN1bHRUeXBlLCBwYXJhbWV0ZXJUeXBlLmNvbnRleHQpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc2lnbmF0dXJlO1xuICB9XG5cbiAgaW5kZXhlZChhcmd1bWVudDogU3ltYm9sKTogU3ltYm9sfHVuZGVmaW5lZCB7IHJldHVybiB1bmRlZmluZWQ7IH1cblxuICBwcml2YXRlIGdldCB0c1R5cGUoKTogdHMuVHlwZSB7XG4gICAgbGV0IHR5cGUgPSB0aGlzLl90c1R5cGU7XG4gICAgaWYgKCF0eXBlKSB7XG4gICAgICBjb25zdCBjbGFzc1N5bWJvbCA9IHRoaXMuZmluZENsYXNzU3ltYm9sKHRoaXMucGlwZS50eXBlLnJlZmVyZW5jZSk7XG4gICAgICBpZiAoY2xhc3NTeW1ib2wpIHtcbiAgICAgICAgdHlwZSA9IHRoaXMuX3RzVHlwZSA9IHRoaXMuZmluZFRyYW5zZm9ybU1ldGhvZFR5cGUoY2xhc3NTeW1ib2wpICE7XG4gICAgICB9XG4gICAgICBpZiAoIXR5cGUpIHtcbiAgICAgICAgdHlwZSA9IHRoaXMuX3RzVHlwZSA9IGdldEJ1aWx0aW5UeXBlRnJvbVRzKEJ1aWx0aW5UeXBlLkFueSwgdGhpcy5jb250ZXh0KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHR5cGU7XG4gIH1cblxuICBwcml2YXRlIGZpbmRDbGFzc1N5bWJvbCh0eXBlOiBTdGF0aWNTeW1ib2wpOiB0cy5TeW1ib2x8dW5kZWZpbmVkIHtcbiAgICByZXR1cm4gZmluZENsYXNzU3ltYm9sSW5Db250ZXh0KHR5cGUsIHRoaXMuY29udGV4dCk7XG4gIH1cblxuICBwcml2YXRlIGZpbmRUcmFuc2Zvcm1NZXRob2RUeXBlKGNsYXNzU3ltYm9sOiB0cy5TeW1ib2wpOiB0cy5UeXBlfHVuZGVmaW5lZCB7XG4gICAgY29uc3QgY2xhc3NUeXBlID0gdGhpcy5jb250ZXh0LmNoZWNrZXIuZ2V0RGVjbGFyZWRUeXBlT2ZTeW1ib2woY2xhc3NTeW1ib2wpO1xuICAgIGlmIChjbGFzc1R5cGUpIHtcbiAgICAgIGNvbnN0IHRyYW5zZm9ybSA9IGNsYXNzVHlwZS5nZXRQcm9wZXJ0eSgndHJhbnNmb3JtJyk7XG4gICAgICBpZiAodHJhbnNmb3JtKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRleHQuY2hlY2tlci5nZXRUeXBlT2ZTeW1ib2xBdExvY2F0aW9uKHRyYW5zZm9ybSwgdGhpcy5jb250ZXh0Lm5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBmaW5kQ2xhc3NTeW1ib2xJbkNvbnRleHQodHlwZTogU3RhdGljU3ltYm9sLCBjb250ZXh0OiBUeXBlQ29udGV4dCk6IHRzLlN5bWJvbHx1bmRlZmluZWQge1xuICBsZXQgc291cmNlRmlsZSA9IGNvbnRleHQucHJvZ3JhbS5nZXRTb3VyY2VGaWxlKHR5cGUuZmlsZVBhdGgpO1xuICBpZiAoIXNvdXJjZUZpbGUpIHtcbiAgICAvLyBUaGlzIGhhbmRsZXMgYSBjYXNlIHdoZXJlIGFuIDxwYWNrYWdlTmFtZT4vaW5kZXguZC50cyBhbmQgYSA8cGFja2FnZU5hbWU+LzxwYWNrYWdlTmFtZT4uZC50c1xuICAgIC8vIGFyZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuIElmIHdlIGFyZSBsb29raW5nIGZvciA8cGFja2FnZU5hbWU+LzxwYWNrYWdlTmFtZT4gYW5kIGRpZG4ndFxuICAgIC8vIGZpbmQgaXQsIGxvb2sgZm9yIDxwYWNrYWdlTmFtZT4vaW5kZXguZC50cyBhcyB0aGUgcHJvZ3JhbSBtaWdodCBoYXZlIGZvdW5kIHRoYXQgaW5zdGVhZC5cbiAgICBjb25zdCBwID0gdHlwZS5maWxlUGF0aCBhcyBzdHJpbmc7XG4gICAgY29uc3QgbSA9IHAubWF0Y2goSU5ERVhfUEFUVEVSTik7XG4gICAgaWYgKG0pIHtcbiAgICAgIGNvbnN0IGluZGV4VmVyc2lvbiA9IHBhdGguam9pbihwYXRoLmRpcm5hbWUocCksICdpbmRleC5kLnRzJyk7XG4gICAgICBzb3VyY2VGaWxlID0gY29udGV4dC5wcm9ncmFtLmdldFNvdXJjZUZpbGUoaW5kZXhWZXJzaW9uKTtcbiAgICB9XG4gIH1cbiAgaWYgKHNvdXJjZUZpbGUpIHtcbiAgICBjb25zdCBtb2R1bGVTeW1ib2wgPSAoc291cmNlRmlsZSBhcyBhbnkpLm1vZHVsZSB8fCAoc291cmNlRmlsZSBhcyBhbnkpLnN5bWJvbDtcbiAgICBjb25zdCBleHBvcnRzID0gY29udGV4dC5jaGVja2VyLmdldEV4cG9ydHNPZk1vZHVsZShtb2R1bGVTeW1ib2wpO1xuICAgIHJldHVybiAoZXhwb3J0cyB8fCBbXSkuZmluZChzeW1ib2wgPT4gc3ltYm9sLm5hbWUgPT0gdHlwZS5uYW1lKTtcbiAgfVxufVxuXG5jbGFzcyBFbXB0eVRhYmxlIGltcGxlbWVudHMgU3ltYm9sVGFibGUge1xuICBwdWJsaWMgcmVhZG9ubHkgc2l6ZTogbnVtYmVyID0gMDtcbiAgZ2V0KGtleTogc3RyaW5nKTogU3ltYm9sfHVuZGVmaW5lZCB7IHJldHVybiB1bmRlZmluZWQ7IH1cbiAgaGFzKGtleTogc3RyaW5nKTogYm9vbGVhbiB7IHJldHVybiBmYWxzZTsgfVxuICB2YWx1ZXMoKTogU3ltYm9sW10geyByZXR1cm4gW107IH1cbiAgc3RhdGljIGluc3RhbmNlID0gbmV3IEVtcHR5VGFibGUoKTtcbn1cblxuZnVuY3Rpb24gZmluZFRzQ29uZmlnKGZpbGVOYW1lOiBzdHJpbmcpOiBzdHJpbmd8dW5kZWZpbmVkIHtcbiAgbGV0IGRpciA9IHBhdGguZGlybmFtZShmaWxlTmFtZSk7XG4gIHdoaWxlIChmcy5leGlzdHNTeW5jKGRpcikpIHtcbiAgICBjb25zdCBjYW5kaWRhdGUgPSBwYXRoLmpvaW4oZGlyLCAndHNjb25maWcuanNvbicpO1xuICAgIGlmIChmcy5leGlzdHNTeW5jKGNhbmRpZGF0ZSkpIHJldHVybiBjYW5kaWRhdGU7XG4gICAgY29uc3QgcGFyZW50RGlyID0gcGF0aC5kaXJuYW1lKGRpcik7XG4gICAgaWYgKHBhcmVudERpciA9PT0gZGlyKSBicmVhaztcbiAgICBkaXIgPSBwYXJlbnREaXI7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNCaW5kaW5nUGF0dGVybihub2RlOiB0cy5Ob2RlKTogbm9kZSBpcyB0cy5CaW5kaW5nUGF0dGVybiB7XG4gIHJldHVybiAhIW5vZGUgJiYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5BcnJheUJpbmRpbmdQYXR0ZXJuIHx8XG4gICAgICAgICAgICAgICAgICAgIG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5PYmplY3RCaW5kaW5nUGF0dGVybik7XG59XG5cbmZ1bmN0aW9uIHdhbGtVcEJpbmRpbmdFbGVtZW50c0FuZFBhdHRlcm5zKG5vZGU6IHRzLk5vZGUpOiB0cy5Ob2RlIHtcbiAgd2hpbGUgKG5vZGUgJiYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5CaW5kaW5nRWxlbWVudCB8fCBpc0JpbmRpbmdQYXR0ZXJuKG5vZGUpKSkge1xuICAgIG5vZGUgPSBub2RlLnBhcmVudCAhO1xuICB9XG5cbiAgcmV0dXJuIG5vZGU7XG59XG5cbmZ1bmN0aW9uIGdldENvbWJpbmVkTm9kZUZsYWdzKG5vZGU6IHRzLk5vZGUpOiB0cy5Ob2RlRmxhZ3Mge1xuICBub2RlID0gd2Fsa1VwQmluZGluZ0VsZW1lbnRzQW5kUGF0dGVybnMobm9kZSk7XG5cbiAgbGV0IGZsYWdzID0gbm9kZS5mbGFncztcbiAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5WYXJpYWJsZURlY2xhcmF0aW9uKSB7XG4gICAgbm9kZSA9IG5vZGUucGFyZW50ICE7XG4gIH1cblxuICBpZiAobm9kZSAmJiBub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuVmFyaWFibGVEZWNsYXJhdGlvbkxpc3QpIHtcbiAgICBmbGFncyB8PSBub2RlLmZsYWdzO1xuICAgIG5vZGUgPSBub2RlLnBhcmVudCAhO1xuICB9XG5cbiAgaWYgKG5vZGUgJiYgbm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLlZhcmlhYmxlU3RhdGVtZW50KSB7XG4gICAgZmxhZ3MgfD0gbm9kZS5mbGFncztcbiAgfVxuXG4gIHJldHVybiBmbGFncztcbn1cblxuZnVuY3Rpb24gaXNTeW1ib2xQcml2YXRlKHM6IHRzLlN5bWJvbCk6IGJvb2xlYW4ge1xuICByZXR1cm4gISFzLnZhbHVlRGVjbGFyYXRpb24gJiYgaXNQcml2YXRlKHMudmFsdWVEZWNsYXJhdGlvbik7XG59XG5cbmZ1bmN0aW9uIGdldEJ1aWx0aW5UeXBlRnJvbVRzKGtpbmQ6IEJ1aWx0aW5UeXBlLCBjb250ZXh0OiBUeXBlQ29udGV4dCk6IHRzLlR5cGUge1xuICBsZXQgdHlwZTogdHMuVHlwZTtcbiAgY29uc3QgY2hlY2tlciA9IGNvbnRleHQuY2hlY2tlcjtcbiAgY29uc3Qgbm9kZSA9IGNvbnRleHQubm9kZTtcbiAgc3dpdGNoIChraW5kKSB7XG4gICAgY2FzZSBCdWlsdGluVHlwZS5Bbnk6XG4gICAgICB0eXBlID0gY2hlY2tlci5nZXRUeXBlQXRMb2NhdGlvbihzZXRQYXJlbnRzKFxuICAgICAgICAgIDx0cy5Ob2RlPjxhbnk+e1xuICAgICAgICAgICAga2luZDogdHMuU3ludGF4S2luZC5Bc0V4cHJlc3Npb24sXG4gICAgICAgICAgICBleHByZXNzaW9uOiA8dHMuTm9kZT57a2luZDogdHMuU3ludGF4S2luZC5UcnVlS2V5d29yZH0sXG4gICAgICAgICAgICB0eXBlOiA8dHMuTm9kZT57a2luZDogdHMuU3ludGF4S2luZC5BbnlLZXl3b3JkfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgbm9kZSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBCdWlsdGluVHlwZS5Cb29sZWFuOlxuICAgICAgdHlwZSA9XG4gICAgICAgICAgY2hlY2tlci5nZXRUeXBlQXRMb2NhdGlvbihzZXRQYXJlbnRzKDx0cy5Ob2RlPntraW5kOiB0cy5TeW50YXhLaW5kLlRydWVLZXl3b3JkfSwgbm9kZSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBCdWlsdGluVHlwZS5OdWxsOlxuICAgICAgdHlwZSA9XG4gICAgICAgICAgY2hlY2tlci5nZXRUeXBlQXRMb2NhdGlvbihzZXRQYXJlbnRzKDx0cy5Ob2RlPntraW5kOiB0cy5TeW50YXhLaW5kLk51bGxLZXl3b3JkfSwgbm9kZSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBCdWlsdGluVHlwZS5OdW1iZXI6XG4gICAgICBjb25zdCBudW1lcmljID0gPHRzLkxpdGVyYWxMaWtlTm9kZT57XG4gICAgICAgIGtpbmQ6IHRzLlN5bnRheEtpbmQuTnVtZXJpY0xpdGVyYWwsXG4gICAgICAgIHRleHQ6IG5vZGUuZ2V0VGV4dCgpLFxuICAgICAgfTtcbiAgICAgIHNldFBhcmVudHMoPGFueT57a2luZDogdHMuU3ludGF4S2luZC5FeHByZXNzaW9uU3RhdGVtZW50LCBleHByZXNzaW9uOiBudW1lcmljfSwgbm9kZSk7XG4gICAgICB0eXBlID0gY2hlY2tlci5nZXRUeXBlQXRMb2NhdGlvbihudW1lcmljKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgQnVpbHRpblR5cGUuU3RyaW5nOlxuICAgICAgdHlwZSA9IGNoZWNrZXIuZ2V0VHlwZUF0TG9jYXRpb24oc2V0UGFyZW50cyhcbiAgICAgICAgICA8dHMuTGl0ZXJhbExpa2VOb2RlPntcbiAgICAgICAgICAgIGtpbmQ6IHRzLlN5bnRheEtpbmQuTm9TdWJzdGl0dXRpb25UZW1wbGF0ZUxpdGVyYWwsXG4gICAgICAgICAgICB0ZXh0OiBub2RlLmdldFRleHQoKSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIG5vZGUpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgQnVpbHRpblR5cGUuVW5kZWZpbmVkOlxuICAgICAgdHlwZSA9IGNoZWNrZXIuZ2V0VHlwZUF0TG9jYXRpb24oc2V0UGFyZW50cyhcbiAgICAgICAgICA8dHMuTm9kZT48YW55PntcbiAgICAgICAgICAgIGtpbmQ6IHRzLlN5bnRheEtpbmQuVm9pZEV4cHJlc3Npb24sXG4gICAgICAgICAgICBleHByZXNzaW9uOiA8dHMuTm9kZT57a2luZDogdHMuU3ludGF4S2luZC5OdW1lcmljTGl0ZXJhbH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIG5vZGUpKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludGVybmFsIGVycm9yLCB1bmhhbmRsZWQgbGl0ZXJhbCBraW5kICR7a2luZH06JHtCdWlsdGluVHlwZVtraW5kXX1gKTtcbiAgfVxuICByZXR1cm4gdHlwZTtcbn1cblxuZnVuY3Rpb24gc2V0UGFyZW50czxUIGV4dGVuZHMgdHMuTm9kZT4obm9kZTogVCwgcGFyZW50OiB0cy5Ob2RlKTogVCB7XG4gIG5vZGUucGFyZW50ID0gcGFyZW50O1xuICB0cy5mb3JFYWNoQ2hpbGQobm9kZSwgY2hpbGQgPT4gc2V0UGFyZW50cyhjaGlsZCwgbm9kZSkpO1xuICByZXR1cm4gbm9kZTtcbn1cblxuZnVuY3Rpb24gc3Bhbk9mKG5vZGU6IHRzLk5vZGUpOiBTcGFuIHtcbiAgcmV0dXJuIHtzdGFydDogbm9kZS5nZXRTdGFydCgpLCBlbmQ6IG5vZGUuZ2V0RW5kKCl9O1xufVxuXG5mdW5jdGlvbiBzaHJpbmsoc3BhbjogU3Bhbiwgb2Zmc2V0PzogbnVtYmVyKSB7XG4gIGlmIChvZmZzZXQgPT0gbnVsbCkgb2Zmc2V0ID0gMTtcbiAgcmV0dXJuIHtzdGFydDogc3Bhbi5zdGFydCArIG9mZnNldCwgZW5kOiBzcGFuLmVuZCAtIG9mZnNldH07XG59XG5cbmZ1bmN0aW9uIHNwYW5BdChzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBsaW5lOiBudW1iZXIsIGNvbHVtbjogbnVtYmVyKTogU3Bhbnx1bmRlZmluZWQge1xuICBpZiAobGluZSAhPSBudWxsICYmIGNvbHVtbiAhPSBudWxsKSB7XG4gICAgY29uc3QgcG9zaXRpb24gPSB0cy5nZXRQb3NpdGlvbk9mTGluZUFuZENoYXJhY3Rlcihzb3VyY2VGaWxlLCBsaW5lLCBjb2x1bW4pO1xuICAgIGNvbnN0IGZpbmRDaGlsZCA9IGZ1bmN0aW9uIGZpbmRDaGlsZChub2RlOiB0cy5Ob2RlKTogdHMuTm9kZSB8IHVuZGVmaW5lZCB7XG4gICAgICBpZiAobm9kZS5raW5kID4gdHMuU3ludGF4S2luZC5MYXN0VG9rZW4gJiYgbm9kZS5wb3MgPD0gcG9zaXRpb24gJiYgbm9kZS5lbmQgPiBwb3NpdGlvbikge1xuICAgICAgICBjb25zdCBiZXR0ZXJOb2RlID0gdHMuZm9yRWFjaENoaWxkKG5vZGUsIGZpbmRDaGlsZCk7XG4gICAgICAgIHJldHVybiBiZXR0ZXJOb2RlIHx8IG5vZGU7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IG5vZGUgPSB0cy5mb3JFYWNoQ2hpbGQoc291cmNlRmlsZSwgZmluZENoaWxkKTtcbiAgICBpZiAobm9kZSkge1xuICAgICAgcmV0dXJuIHtzdGFydDogbm9kZS5nZXRTdGFydCgpLCBlbmQ6IG5vZGUuZ2V0RW5kKCl9O1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBkZWZpbml0aW9uRnJvbVRzU3ltYm9sKHN5bWJvbDogdHMuU3ltYm9sKTogRGVmaW5pdGlvbiB7XG4gIGNvbnN0IGRlY2xhcmF0aW9ucyA9IHN5bWJvbC5kZWNsYXJhdGlvbnM7XG4gIGlmIChkZWNsYXJhdGlvbnMpIHtcbiAgICByZXR1cm4gZGVjbGFyYXRpb25zLm1hcChkZWNsYXJhdGlvbiA9PiB7XG4gICAgICBjb25zdCBzb3VyY2VGaWxlID0gZGVjbGFyYXRpb24uZ2V0U291cmNlRmlsZSgpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZmlsZU5hbWU6IHNvdXJjZUZpbGUuZmlsZU5hbWUsXG4gICAgICAgIHNwYW46IHtzdGFydDogZGVjbGFyYXRpb24uZ2V0U3RhcnQoKSwgZW5kOiBkZWNsYXJhdGlvbi5nZXRFbmQoKX1cbiAgICAgIH07XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcGFyZW50RGVjbGFyYXRpb25PZihub2RlOiB0cy5Ob2RlKTogdHMuTm9kZXx1bmRlZmluZWQge1xuICB3aGlsZSAobm9kZSkge1xuICAgIHN3aXRjaCAobm9kZS5raW5kKSB7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xhc3NEZWNsYXJhdGlvbjpcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5JbnRlcmZhY2VEZWNsYXJhdGlvbjpcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU291cmNlRmlsZTpcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgbm9kZSA9IG5vZGUucGFyZW50ICE7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0Q29udGFpbmVyT2Yoc3ltYm9sOiB0cy5TeW1ib2wsIGNvbnRleHQ6IFR5cGVDb250ZXh0KTogU3ltYm9sfHVuZGVmaW5lZCB7XG4gIGlmIChzeW1ib2wuZ2V0RmxhZ3MoKSAmIHRzLlN5bWJvbEZsYWdzLkNsYXNzTWVtYmVyICYmIHN5bWJvbC5kZWNsYXJhdGlvbnMpIHtcbiAgICBmb3IgKGNvbnN0IGRlY2xhcmF0aW9uIG9mIHN5bWJvbC5kZWNsYXJhdGlvbnMpIHtcbiAgICAgIGNvbnN0IHBhcmVudCA9IHBhcmVudERlY2xhcmF0aW9uT2YoZGVjbGFyYXRpb24pO1xuICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICBjb25zdCB0eXBlID0gY29udGV4dC5jaGVja2VyLmdldFR5cGVBdExvY2F0aW9uKHBhcmVudCk7XG4gICAgICAgIGlmICh0eXBlKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBUeXBlV3JhcHBlcih0eXBlLCBjb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRUeXBlUGFyYW1ldGVyT2YodHlwZTogdHMuVHlwZSwgbmFtZTogc3RyaW5nKTogdHMuVHlwZXx1bmRlZmluZWQge1xuICBpZiAodHlwZSAmJiB0eXBlLnN5bWJvbCAmJiB0eXBlLnN5bWJvbC5uYW1lID09IG5hbWUpIHtcbiAgICBjb25zdCB0eXBlQXJndW1lbnRzOiB0cy5UeXBlW10gPSAodHlwZSBhcyBhbnkpLnR5cGVBcmd1bWVudHM7XG4gICAgaWYgKHR5cGVBcmd1bWVudHMgJiYgdHlwZUFyZ3VtZW50cy5sZW5ndGggPD0gMSkge1xuICAgICAgcmV0dXJuIHR5cGVBcmd1bWVudHNbMF07XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHR5cGVLaW5kT2YodHlwZTogdHMuVHlwZSB8IHVuZGVmaW5lZCk6IEJ1aWx0aW5UeXBlIHtcbiAgaWYgKHR5cGUpIHtcbiAgICBpZiAodHlwZS5mbGFncyAmIHRzLlR5cGVGbGFncy5BbnkpIHtcbiAgICAgIHJldHVybiBCdWlsdGluVHlwZS5Bbnk7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgICAgdHlwZS5mbGFncyAmICh0cy5UeXBlRmxhZ3MuU3RyaW5nIHwgdHMuVHlwZUZsYWdzLlN0cmluZ0xpa2UgfCB0cy5UeXBlRmxhZ3MuU3RyaW5nTGl0ZXJhbCkpIHtcbiAgICAgIHJldHVybiBCdWlsdGluVHlwZS5TdHJpbmc7XG4gICAgfSBlbHNlIGlmICh0eXBlLmZsYWdzICYgKHRzLlR5cGVGbGFncy5OdW1iZXIgfCB0cy5UeXBlRmxhZ3MuTnVtYmVyTGlrZSkpIHtcbiAgICAgIHJldHVybiBCdWlsdGluVHlwZS5OdW1iZXI7XG4gICAgfSBlbHNlIGlmICh0eXBlLmZsYWdzICYgKHRzLlR5cGVGbGFncy5VbmRlZmluZWQpKSB7XG4gICAgICByZXR1cm4gQnVpbHRpblR5cGUuVW5kZWZpbmVkO1xuICAgIH0gZWxzZSBpZiAodHlwZS5mbGFncyAmICh0cy5UeXBlRmxhZ3MuTnVsbCkpIHtcbiAgICAgIHJldHVybiBCdWlsdGluVHlwZS5OdWxsO1xuICAgIH0gZWxzZSBpZiAodHlwZS5mbGFncyAmIHRzLlR5cGVGbGFncy5Vbmlvbikge1xuICAgICAgLy8gSWYgYWxsIHRoZSBjb25zdGl0dWVudCB0eXBlcyBvZiBhIHVuaW9uIGFyZSB0aGUgc2FtZSBraW5kLCBpdCBpcyBhbHNvIHRoYXQga2luZC5cbiAgICAgIGxldCBjYW5kaWRhdGU6IEJ1aWx0aW5UeXBlfG51bGwgPSBudWxsO1xuICAgICAgY29uc3QgdW5pb25UeXBlID0gdHlwZSBhcyB0cy5VbmlvblR5cGU7XG4gICAgICBpZiAodW5pb25UeXBlLnR5cGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY2FuZGlkYXRlID0gdHlwZUtpbmRPZih1bmlvblR5cGUudHlwZXNbMF0pO1xuICAgICAgICBmb3IgKGNvbnN0IHN1YlR5cGUgb2YgdW5pb25UeXBlLnR5cGVzKSB7XG4gICAgICAgICAgaWYgKGNhbmRpZGF0ZSAhPSB0eXBlS2luZE9mKHN1YlR5cGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gQnVpbHRpblR5cGUuT3RoZXI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoY2FuZGlkYXRlICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGUuZmxhZ3MgJiB0cy5UeXBlRmxhZ3MuVHlwZVBhcmFtZXRlcikge1xuICAgICAgcmV0dXJuIEJ1aWx0aW5UeXBlLlVuYm91bmQ7XG4gICAgfVxuICB9XG4gIHJldHVybiBCdWlsdGluVHlwZS5PdGhlcjtcbn1cblxuXG5cbmZ1bmN0aW9uIGdldEZyb21TeW1ib2xUYWJsZShzeW1ib2xUYWJsZTogdHMuU3ltYm9sVGFibGUsIGtleTogc3RyaW5nKTogdHMuU3ltYm9sfHVuZGVmaW5lZCB7XG4gIGNvbnN0IHRhYmxlID0gc3ltYm9sVGFibGUgYXMgYW55O1xuICBsZXQgc3ltYm9sOiB0cy5TeW1ib2x8dW5kZWZpbmVkO1xuXG4gIGlmICh0eXBlb2YgdGFibGUuZ2V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gVFMgMi4yIHVzZXMgYSBNYXBcbiAgICBzeW1ib2wgPSB0YWJsZS5nZXQoa2V5KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBUUyBwcmUtMi4yIHVzZXMgYW4gb2JqZWN0XG4gICAgc3ltYm9sID0gdGFibGVba2V5XTtcbiAgfVxuXG4gIHJldHVybiBzeW1ib2w7XG59XG4iXX0=