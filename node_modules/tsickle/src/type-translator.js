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
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/type-translator", ["require", "exports", "path", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var path = require("path");
    var ts = require("typescript");
    /**
     * Determines if fileName refers to a builtin lib.d.ts file.
     * This is a terrible hack but it mirrors a similar thing done in Clutz.
     */
    function isBuiltinLibDTS(fileName) {
        return fileName.match(/\blib\.(?:[^/]+\.)?d\.ts$/) != null;
    }
    exports.isBuiltinLibDTS = isBuiltinLibDTS;
    /**
     * @return True if the named type is considered compatible with the Closure-defined
     *     type of the same name, e.g. "Array".  Note that we don't actually enforce
     *     that the types are actually compatible, but mostly just hope that they are due
     *     to being derived from the same HTML specs.
     */
    function isClosureProvidedType(symbol) {
        return symbol.declarations != null &&
            symbol.declarations.some(function (n) { return isBuiltinLibDTS(n.getSourceFile().fileName); });
    }
    function typeToDebugString(type) {
        var debugString = "flags:0x" + type.flags.toString(16);
        if (type.aliasSymbol) {
            debugString += " alias:" + symbolToDebugString(type.aliasSymbol);
        }
        if (type.aliasTypeArguments) {
            debugString += " aliasArgs:<" + type.aliasTypeArguments.map(typeToDebugString).join(',') + ">";
        }
        // Just the unique flags (powers of two). Declared in src/compiler/types.ts.
        var basicTypes = [
            ts.TypeFlags.Any, ts.TypeFlags.String, ts.TypeFlags.Number,
            ts.TypeFlags.Boolean, ts.TypeFlags.Enum, ts.TypeFlags.StringLiteral,
            ts.TypeFlags.NumberLiteral, ts.TypeFlags.BooleanLiteral, ts.TypeFlags.EnumLiteral,
            ts.TypeFlags.ESSymbol, ts.TypeFlags.Void, ts.TypeFlags.Undefined,
            ts.TypeFlags.Null, ts.TypeFlags.Never, ts.TypeFlags.TypeParameter,
            ts.TypeFlags.Object, ts.TypeFlags.Union, ts.TypeFlags.Intersection,
            ts.TypeFlags.Index, ts.TypeFlags.IndexedAccess, ts.TypeFlags.NonPrimitive,
        ];
        try {
            for (var basicTypes_1 = __values(basicTypes), basicTypes_1_1 = basicTypes_1.next(); !basicTypes_1_1.done; basicTypes_1_1 = basicTypes_1.next()) {
                var flag = basicTypes_1_1.value;
                if ((type.flags & flag) !== 0) {
                    debugString += " " + ts.TypeFlags[flag];
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (basicTypes_1_1 && !basicTypes_1_1.done && (_a = basicTypes_1.return)) _a.call(basicTypes_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (type.flags === ts.TypeFlags.Object) {
            var objType = type;
            // Just the unique flags (powers of two). Declared in src/compiler/types.ts.
            var objectFlags = [
                ts.ObjectFlags.Class,
                ts.ObjectFlags.Interface,
                ts.ObjectFlags.Reference,
                ts.ObjectFlags.Tuple,
                ts.ObjectFlags.Anonymous,
                ts.ObjectFlags.Mapped,
                ts.ObjectFlags.Instantiated,
                ts.ObjectFlags.ObjectLiteral,
                ts.ObjectFlags.EvolvingArray,
                ts.ObjectFlags.ObjectLiteralPatternWithComputedProperties,
            ];
            try {
                for (var objectFlags_1 = __values(objectFlags), objectFlags_1_1 = objectFlags_1.next(); !objectFlags_1_1.done; objectFlags_1_1 = objectFlags_1.next()) {
                    var flag = objectFlags_1_1.value;
                    if ((objType.objectFlags & flag) !== 0) {
                        debugString += " object:" + ts.ObjectFlags[flag];
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (objectFlags_1_1 && !objectFlags_1_1.done && (_b = objectFlags_1.return)) _b.call(objectFlags_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        if (type.symbol && type.symbol.name !== '__type') {
            debugString += " symbol.name:" + JSON.stringify(type.symbol.name);
        }
        if (type.pattern) {
            debugString += " destructuring:true";
        }
        return "{type " + debugString + "}";
        var e_1, _a, e_2, _b;
    }
    exports.typeToDebugString = typeToDebugString;
    function symbolToDebugString(sym) {
        var debugString = JSON.stringify(sym.name) + " flags:0x" + sym.flags.toString(16);
        // Just the unique flags (powers of two). Declared in src/compiler/types.ts.
        var symbolFlags = [
            ts.SymbolFlags.FunctionScopedVariable,
            ts.SymbolFlags.BlockScopedVariable,
            ts.SymbolFlags.Property,
            ts.SymbolFlags.EnumMember,
            ts.SymbolFlags.Function,
            ts.SymbolFlags.Class,
            ts.SymbolFlags.Interface,
            ts.SymbolFlags.ConstEnum,
            ts.SymbolFlags.RegularEnum,
            ts.SymbolFlags.ValueModule,
            ts.SymbolFlags.NamespaceModule,
            ts.SymbolFlags.TypeLiteral,
            ts.SymbolFlags.ObjectLiteral,
            ts.SymbolFlags.Method,
            ts.SymbolFlags.Constructor,
            ts.SymbolFlags.GetAccessor,
            ts.SymbolFlags.SetAccessor,
            ts.SymbolFlags.Signature,
            ts.SymbolFlags.TypeParameter,
            ts.SymbolFlags.TypeAlias,
            ts.SymbolFlags.ExportValue,
            ts.SymbolFlags.Alias,
            ts.SymbolFlags.Prototype,
            ts.SymbolFlags.ExportStar,
            ts.SymbolFlags.Optional,
            ts.SymbolFlags.Transient,
        ];
        try {
            for (var symbolFlags_1 = __values(symbolFlags), symbolFlags_1_1 = symbolFlags_1.next(); !symbolFlags_1_1.done; symbolFlags_1_1 = symbolFlags_1.next()) {
                var flag = symbolFlags_1_1.value;
                if ((sym.flags & flag) !== 0) {
                    debugString += " " + ts.SymbolFlags[flag];
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (symbolFlags_1_1 && !symbolFlags_1_1.done && (_a = symbolFlags_1.return)) _a.call(symbolFlags_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return debugString;
        var e_3, _a;
    }
    exports.symbolToDebugString = symbolToDebugString;
    /** TypeTranslator translates TypeScript types to Closure types. */
    var TypeTranslator = /** @class */ (function () {
        /**
         * @param node is the source AST ts.Node the type comes from.  This is used
         *     in some cases (e.g. anonymous types) for looking up field names.
         * @param pathBlackList is a set of paths that should never get typed;
         *     any reference to symbols defined in these paths should by typed
         *     as {?}.
         * @param symbolsToAliasedNames a mapping from symbols (`Foo`) to a name in scope they should be
         *     emitted as (e.g. `tsickle_forward_declare_1.Foo`). Can be augmented during type
         *     translation, e.g. to blacklist a symbol.
         */
        function TypeTranslator(typeChecker, node, pathBlackList, symbolsToAliasedNames, ensureSymbolDeclared) {
            if (symbolsToAliasedNames === void 0) { symbolsToAliasedNames = new Map(); }
            if (ensureSymbolDeclared === void 0) { ensureSymbolDeclared = function () { }; }
            this.typeChecker = typeChecker;
            this.node = node;
            this.pathBlackList = pathBlackList;
            this.symbolsToAliasedNames = symbolsToAliasedNames;
            this.ensureSymbolDeclared = ensureSymbolDeclared;
            /**
             * A list of type literals we've encountered while emitting; used to avoid getting stuck in
             * recursive types.
             */
            this.seenAnonymousTypes = new Set();
            /**
             * Whether to write types suitable for an \@externs file. Externs types must not refer to
             * non-externs types (i.e. non ambient types) and need to use fully qualified names.
             */
            this.isForExterns = false;
            // Normalize paths to not break checks on Windows.
            if (this.pathBlackList != null) {
                this.pathBlackList =
                    new Set(Array.from(this.pathBlackList.values()).map(function (p) { return path.normalize(p); }));
            }
        }
        /**
         * Converts a ts.Symbol to a string.
         * Other approaches that don't work:
         * - TypeChecker.typeToString translates Array as T[].
         * - TypeChecker.symbolToString emits types without their namespace,
         *   and doesn't let you pass the flag to control that.
         * @param useFqn whether to scope the name using its fully qualified name. Closure's template
         *     arguments are always scoped to the class containing them, where TypeScript's template args
         *     would be fully qualified. I.e. this flag is false for generic types.
         */
        TypeTranslator.prototype.symbolToString = function (sym, useFqn) {
            if (useFqn && this.isForExterns) {
                // For regular type emit, we can use TypeScript's naming rules, as they match Closure's name
                // scoping rules. However when emitting externs files for ambients, naming rules change. As
                // Closure doesn't support externs modules, all names must be global and use global fully
                // qualified names. The code below uses TypeScript to convert a symbol to a full qualified
                // name and then emits that.
                var fqn = this.typeChecker.getFullyQualifiedName(sym);
                if (fqn.startsWith("\"") || fqn.startsWith("'")) {
                    // Quoted FQNs mean the name is from a module, e.g. `'path/to/module'.some.qualified.Name`.
                    // tsickle generally re-scopes names in modules that are moved to externs into the global
                    // namespace. That does not quite match TS' semantics where ambient types from modules are
                    // local. However value declarations that are local to modules but not defined do not make
                    // sense if not global, e.g. "declare class X {}; new X();" cannot work unless `X` is
                    // actually a global.
                    // So this code strips the module path from the type and uses the FQN as a global.
                    fqn = fqn.replace(/^["'][^"']+['"]\./, '');
                }
                // Declarations in module can re-open global types using "declare global { ... }". The fqn
                // then contains the prefix "global." here. As we're mapping to global types, just strip the
                // prefix.
                var isInGlobal = (sym.declarations || []).some(function (d) {
                    var current = d;
                    while (current) {
                        if (current.flags & ts.NodeFlags.GlobalAugmentation)
                            return true;
                        current = current.parent;
                    }
                    return false;
                });
                if (isInGlobal) {
                    fqn = fqn.replace(/^global\./, '');
                }
                return this.stripClutzNamespace(fqn);
            }
            // TypeScript resolves e.g. union types to their members, which can include symbols not declared
            // in the current scope. Ensure that all symbols found this way are actually declared.
            // This must happen before the alias check below, it might introduce a new alias for the symbol.
            if ((sym.flags & ts.SymbolFlags.TypeParameter) === 0)
                this.ensureSymbolDeclared(sym);
            var symAlias = sym;
            if (symAlias.flags & ts.SymbolFlags.Alias) {
                symAlias = this.typeChecker.getAliasedSymbol(symAlias);
            }
            var alias = this.symbolsToAliasedNames.get(symAlias);
            if (alias)
                return alias;
            // This follows getSingleLineStringWriter in the TypeScript compiler.
            var str = '';
            var writeText = function (text) { return str += text; };
            var doNothing = function () {
                return;
            };
            var builder = this.typeChecker.getSymbolDisplayBuilder();
            var writer = {
                writeKeyword: writeText,
                writeOperator: writeText,
                writePunctuation: writeText,
                writeSpace: writeText,
                writeStringLiteral: writeText,
                writeParameter: writeText,
                writeProperty: writeText,
                writeSymbol: writeText,
                writeLine: doNothing,
                increaseIndent: doNothing,
                decreaseIndent: doNothing,
                clear: doNothing,
                trackSymbol: function (symbol, enclosingDeclaration, meaning) {
                    return;
                },
                reportInaccessibleThisError: doNothing,
                reportPrivateInBaseOfClassExpression: doNothing,
            };
            builder.buildSymbolDisplay(sym, writer, this.node);
            return this.stripClutzNamespace(str);
        };
        // Clutz (https://github.com/angular/clutz) emits global type symbols hidden in a special
        // ಠ_ಠ.clutz namespace. While most code seen by Tsickle will only ever see local aliases, Clutz
        // symbols can be written by users directly in code, and they can appear by dereferencing
        // TypeAliases. The code below simply strips the prefix, the remaining type name then matches
        // Closure's type.
        TypeTranslator.prototype.stripClutzNamespace = function (name) {
            if (name.startsWith('ಠ_ಠ.clutz.'))
                return name.substring('ಠ_ಠ.clutz.'.length);
            return name;
        };
        TypeTranslator.prototype.translate = function (type, resolveAlias) {
            // NOTE: Though type.flags has the name "flags", it usually can only be one
            // of the enum options at a time (except for unions of literal types, e.g. unions of boolean
            // values, string values, enum values). This switch handles all the cases in the ts.TypeFlags
            // enum in the order they occur.
            if (resolveAlias === void 0) { resolveAlias = false; }
            // NOTE: Some TypeFlags are marked "internal" in the d.ts but still show up in the value of
            // type.flags. This mask limits the flag checks to the ones in the public API. "lastFlag" here
            // is the last flag handled in this switch statement, and should be kept in sync with
            // typescript.d.ts.
            // NonPrimitive occurs on its own on the lower case "object" type. Special case to "!Object".
            if (type.flags === ts.TypeFlags.NonPrimitive)
                return '!Object';
            // Avoid infinite loops on recursive type literals.
            // It would be nice to just emit the name of the recursive type here (in type.aliasSymbol
            // below), but Closure Compiler does not allow recursive type definitions.
            if (this.seenAnonymousTypes.has(type))
                return '?';
            // If type is an alias, e.g. from type X = A|B, then always emit the alias, not the underlying
            // union type, as the alias is the user visible, imported symbol.
            if (!resolveAlias && type.aliasSymbol) {
                return this.symbolToString(type.aliasSymbol, /* useFqn */ true);
            }
            var isAmbient = false;
            var isNamespace = false;
            var isModule = false;
            if (type.symbol) {
                try {
                    for (var _a = __values(type.symbol.declarations || []), _b = _a.next(); !_b.done; _b = _a.next()) {
                        var decl = _b.value;
                        if (ts.isExternalModule(decl.getSourceFile()))
                            isModule = true;
                        var current = decl;
                        while (current) {
                            if (ts.getCombinedModifierFlags(current) & ts.ModifierFlags.Ambient)
                                isAmbient = true;
                            if (current.kind === ts.SyntaxKind.ModuleDeclaration)
                                isNamespace = true;
                            current = current.parent;
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
            // tsickle cannot generate types for non-ambient namespaces.
            if (isNamespace && !isAmbient)
                return '?';
            // Types in externs cannot reference types from external modules.
            // However ambient types in modules get moved to externs, too, so type references work and we
            // can emit a precise type.
            if (this.isForExterns && isModule && !isAmbient)
                return '?';
            var lastFlag = ts.TypeFlags.IndexedAccess;
            var mask = (lastFlag << 1) - 1;
            switch (type.flags & mask) {
                case ts.TypeFlags.Any:
                    return '?';
                case ts.TypeFlags.String:
                case ts.TypeFlags.StringLiteral:
                    return 'string';
                case ts.TypeFlags.Number:
                case ts.TypeFlags.NumberLiteral:
                    return 'number';
                case ts.TypeFlags.Boolean:
                case ts.TypeFlags.BooleanLiteral:
                    // See the note in translateUnion about booleans.
                    return 'boolean';
                case ts.TypeFlags.Enum:
                    if (!type.symbol) {
                        this.warn("EnumType without a symbol");
                        return '?';
                    }
                    return this.symbolToString(type.symbol, true);
                case ts.TypeFlags.ESSymbol:
                    // NOTE: currently this is just a typedef for {?}, shrug.
                    // https://github.com/google/closure-compiler/blob/55cf43ee31e80d89d7087af65b5542aa63987874/externs/es3.js#L34
                    return 'symbol';
                case ts.TypeFlags.Void:
                    return 'void';
                case ts.TypeFlags.Undefined:
                    return 'undefined';
                case ts.TypeFlags.Null:
                    return 'null';
                case ts.TypeFlags.Never:
                    this.warn("should not emit a 'never' type");
                    return '?';
                case ts.TypeFlags.TypeParameter:
                    // This is e.g. the T in a type like Foo<T>.
                    if (!type.symbol) {
                        this.warn("TypeParameter without a symbol"); // should not happen (tm)
                        return '?';
                    }
                    // In Closure Compiler, type parameters *are* scoped to their containing class.
                    var useFqn = false;
                    return this.symbolToString(type.symbol, useFqn);
                case ts.TypeFlags.Object:
                    return this.translateObject(type);
                case ts.TypeFlags.Union:
                    return this.translateUnion(type);
                case ts.TypeFlags.Intersection:
                case ts.TypeFlags.Index:
                case ts.TypeFlags.IndexedAccess:
                    // TODO(ts2.1): handle these special types.
                    this.warn("unhandled type flags: " + ts.TypeFlags[type.flags]);
                    return '?';
                default:
                    // Handle cases where multiple flags are set.
                    // Types with literal members are represented as
                    //   ts.TypeFlags.Union | [literal member]
                    // E.g. an enum typed value is a union type with the enum's members as its members. A
                    // boolean type is a union type with 'true' and 'false' as its members.
                    // Note also that in a more complex union, e.g. boolean|number, then it's a union of three
                    // things (true|false|number) and ts.TypeFlags.Boolean doesn't show up at all.
                    if (type.flags & ts.TypeFlags.Union) {
                        return this.translateUnion(type);
                    }
                    if (type.flags & ts.TypeFlags.EnumLiteral) {
                        return this.translateEnumLiteral(type);
                    }
                    // The switch statement should have been exhaustive.
                    throw new Error("unknown type flags " + type.flags + " on " + typeToDebugString(type));
            }
            var e_4, _c;
        };
        TypeTranslator.prototype.translateUnion = function (type) {
            var _this = this;
            var parts = type.types.map(function (t) { return _this.translate(t); });
            // Union types that include literals (e.g. boolean, enum) can end up repeating the same Closure
            // type. For example: true | boolean will be translated to boolean | boolean.
            // Remove duplicates to produce types that read better.
            parts = parts.filter(function (el, idx) { return parts.indexOf(el) === idx; });
            return parts.length === 1 ? parts[0] : "(" + parts.join('|') + ")";
        };
        TypeTranslator.prototype.translateEnumLiteral = function (type) {
            // Suppose you had:
            //   enum EnumType { MEMBER }
            // then the type of "EnumType.MEMBER" is an enum literal (the thing passed to this function)
            // and it has type flags that include
            //   ts.TypeFlags.NumberLiteral | ts.TypeFlags.EnumLiteral
            //
            // Closure Compiler doesn't support literals in types, so this code must not emit
            // "EnumType.MEMBER", but rather "EnumType".
            var enumLiteralBaseType = this.typeChecker.getBaseTypeOfLiteralType(type);
            if (!enumLiteralBaseType.symbol) {
                this.warn("EnumLiteralType without a symbol");
                return '?';
            }
            return this.symbolToString(enumLiteralBaseType.symbol, true);
        };
        // translateObject translates a ts.ObjectType, which is the type of all
        // object-like things in TS, such as classes and interfaces.
        TypeTranslator.prototype.translateObject = function (type) {
            var _this = this;
            if (type.symbol && this.isBlackListed(type.symbol))
                return '?';
            // NOTE: objectFlags is an enum, but a given type can have multiple flags.
            // Array<string> is both ts.ObjectFlags.Reference and ts.ObjectFlags.Interface.
            if (type.objectFlags & ts.ObjectFlags.Class) {
                if (!type.symbol) {
                    this.warn('class has no symbol');
                    return '?';
                }
                return '!' + this.symbolToString(type.symbol, /* useFqn */ true);
            }
            else if (type.objectFlags & ts.ObjectFlags.Interface) {
                // Note: ts.InterfaceType has a typeParameters field, but that
                // specifies the parameters that the interface type *expects*
                // when it's used, and should not be transformed to the output.
                // E.g. a type like Array<number> is a TypeReference to the
                // InterfaceType "Array", but the "number" type parameter is
                // part of the outer TypeReference, not a typeParameter on
                // the InterfaceType.
                if (!type.symbol) {
                    this.warn('interface has no symbol');
                    return '?';
                }
                if (type.symbol.flags & ts.SymbolFlags.Value) {
                    // The symbol is both a type and a value.
                    // For user-defined types in this state, we don't have a Closure name
                    // for the type.  See the type_and_value test.
                    if (!isClosureProvidedType(type.symbol)) {
                        this.warn("type/symbol conflict for " + type.symbol.name + ", using {?} for now");
                        return '?';
                    }
                }
                return '!' + this.symbolToString(type.symbol, /* useFqn */ true);
            }
            else if (type.objectFlags & ts.ObjectFlags.Reference) {
                // A reference to another type, e.g. Array<number> refers to Array.
                // Emit the referenced type and any type arguments.
                var referenceType = type;
                // A tuple is a ReferenceType where the target is flagged Tuple and the
                // typeArguments are the tuple arguments.  Just treat it as a mystery
                // array, because Closure doesn't understand tuples.
                if (referenceType.target.objectFlags & ts.ObjectFlags.Tuple) {
                    return '!Array<?>';
                }
                var typeStr = '';
                if (referenceType.target === referenceType) {
                    // We get into an infinite loop here if the inner reference is
                    // the same as the outer; this can occur when this function
                    // fails to translate a more specific type before getting to
                    // this point.
                    throw new Error("reference loop in " + typeToDebugString(referenceType) + " " + referenceType.flags);
                }
                typeStr += this.translate(referenceType.target);
                // Translate can return '?' for a number of situations, e.g. type/value conflicts.
                // `?<?>` is illegal syntax in Closure Compiler, so just return `?` here.
                if (typeStr === '?')
                    return '?';
                if (referenceType.typeArguments) {
                    var params = referenceType.typeArguments.map(function (t) { return _this.translate(t); });
                    typeStr += "<" + params.join(', ') + ">";
                }
                return typeStr;
            }
            else if (type.objectFlags & ts.ObjectFlags.Anonymous) {
                if (!type.symbol) {
                    // This comes up when generating code for an arrow function as passed
                    // to a generic function.  The passed-in type is tagged as anonymous
                    // and has no properties so it's hard to figure out what to generate.
                    // Just avoid it for now so we don't crash.
                    this.warn('anonymous type has no symbol');
                    return '?';
                }
                if (type.symbol.flags & ts.SymbolFlags.Function ||
                    type.symbol.flags & ts.SymbolFlags.Method) {
                    var sigs = this.typeChecker.getSignaturesOfType(type, ts.SignatureKind.Call);
                    if (sigs.length === 1) {
                        return this.signatureToClosure(sigs[0]);
                    }
                    this.warn('unhandled anonymous type with multiple call signatures');
                    return '?';
                }
                else {
                    return this.translateAnonymousType(type);
                }
            }
            /*
            TODO(ts2.1): more unhandled object type flags:
              Tuple
              Mapped
              Instantiated
              ObjectLiteral
              EvolvingArray
              ObjectLiteralPatternWithComputedProperties
            */
            this.warn("unhandled type " + typeToDebugString(type));
            return '?';
        };
        /**
         * translateAnonymousType translates a ts.TypeFlags.ObjectType that is also
         * ts.ObjectFlags.Anonymous. That is, this type's symbol does not have a name. This is the
         * anonymous type encountered in e.g.
         *     let x: {a: number};
         * But also the inferred type in:
         *     let x = {a: 1};  // type of x is {a: number}, as above
         */
        TypeTranslator.prototype.translateAnonymousType = function (type) {
            this.seenAnonymousTypes.add(type);
            // Gather up all the named fields and whether the object is also callable.
            var callable = false;
            var indexable = false;
            var fields = [];
            if (!type.symbol || !type.symbol.members) {
                this.warn('anonymous type has no symbol');
                return '?';
            }
            // special-case construct signatures.
            var ctors = type.getConstructSignatures();
            if (ctors.length) {
                // TODO(martinprobst): this does not support additional properties defined on constructors
                // (not expressible in Closure), nor multiple constructors (same).
                if (!ctors[0].declaration) {
                    this.warn('unhandled anonymous type with constructor signature but no declaration');
                    return '?';
                }
                var params = this.convertParams(ctors[0], ctors[0].declaration.parameters);
                var paramsStr = params.length ? (', ' + params.join(', ')) : '';
                var constructedType = this.translate(ctors[0].getReturnType());
                // In the specific case of the "new" in a function, it appears that
                //   function(new: !Bar)
                // fails to parse, while
                //   function(new: (!Bar))
                // parses in the way you'd expect.
                // It appears from testing that Closure ignores the ! anyway and just
                // assumes the result will be non-null in either case.  (To be pedantic,
                // it's possible to return null from a ctor it seems like a bad idea.)
                return "function(new: (" + constructedType + ")" + paramsStr + "): ?";
            }
            try {
                // members is an ES6 map, but the .d.ts defining it defined their own map
                // type, so typescript doesn't believe that .keys() is iterable
                // tslint:disable-next-line:no-any
                for (var _a = __values(type.symbol.members.keys()), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var field = _b.value;
                    switch (field) {
                        case '__call':
                            callable = true;
                            break;
                        case '__index':
                            indexable = true;
                            break;
                        default:
                            var member = type.symbol.members.get(field);
                            // optional members are handled by the type including |undefined in a union type.
                            var memberType = this.translate(this.typeChecker.getTypeOfSymbolAtLocation(member, this.node));
                            fields.push(field + ": " + memberType);
                            break;
                    }
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_5) throw e_5.error; }
            }
            // Try to special-case plain key-value objects and functions.
            if (fields.length === 0) {
                if (callable && !indexable) {
                    // A function type.
                    var sigs = this.typeChecker.getSignaturesOfType(type, ts.SignatureKind.Call);
                    if (sigs.length === 1) {
                        return this.signatureToClosure(sigs[0]);
                    }
                }
                else if (indexable && !callable) {
                    // A plain key-value map type.
                    var keyType = 'string';
                    var valType = this.typeChecker.getIndexTypeOfType(type, ts.IndexKind.String);
                    if (!valType) {
                        keyType = 'number';
                        valType = this.typeChecker.getIndexTypeOfType(type, ts.IndexKind.Number);
                    }
                    if (!valType) {
                        this.warn('unknown index key type');
                        return "!Object<?,?>";
                    }
                    return "!Object<" + keyType + "," + this.translate(valType) + ">";
                }
                else if (!callable && !indexable) {
                    // Special-case the empty object {} because Closure doesn't like it.
                    // TODO(evanm): revisit this if it is a problem.
                    return '!Object';
                }
            }
            if (!callable && !indexable) {
                // Not callable, not indexable; implies a plain object with fields in it.
                return "{" + fields.join(', ') + "}";
            }
            this.warn('unhandled anonymous type');
            return '?';
            var e_5, _c;
        };
        /** Converts a ts.Signature (function signature) to a Closure function type. */
        TypeTranslator.prototype.signatureToClosure = function (sig) {
            // TODO(martinprobst): Consider harmonizing some overlap with emitFunctionType in tsickle.ts.
            this.blacklistTypeParameters(this.symbolsToAliasedNames, sig.declaration.typeParameters);
            var typeStr = "function(";
            var paramDecls = sig.declaration.parameters;
            var maybeThisParam = paramDecls[0];
            // Oddly, the this type shows up in paramDecls, but not in the type's parameters.
            // Handle it here and then pass paramDecls down without its first element.
            if (maybeThisParam && maybeThisParam.name.getText() === 'this') {
                if (maybeThisParam.type) {
                    var thisType = this.typeChecker.getTypeAtLocation(maybeThisParam.type);
                    typeStr += "this: (" + this.translate(thisType) + ")";
                    if (paramDecls.length > 1)
                        typeStr += ', ';
                }
                else {
                    this.warn('this type without type');
                }
                paramDecls = paramDecls.slice(1);
            }
            var params = this.convertParams(sig, paramDecls);
            typeStr += params.join(', ') + ")";
            var retType = this.translate(this.typeChecker.getReturnTypeOfSignature(sig));
            if (retType) {
                typeStr += ": " + retType;
            }
            return typeStr;
        };
        /**
         * Converts parameters for the given signature. Takes parameter declarations as those might not
         * match the signature parameters (e.g. there might be an additional this parameter). This
         * difference is handled by the caller, as is converting the "this" parameter.
         */
        TypeTranslator.prototype.convertParams = function (sig, paramDecls) {
            var paramTypes = [];
            // The Signature itself does not include information on optional and var arg parameters.
            // Use its declaration to recover that information.
            var decl = sig.declaration;
            for (var i = 0; i < sig.parameters.length; i++) {
                var param = sig.parameters[i];
                var paramDecl = paramDecls[i];
                var optional = !!paramDecl.questionToken;
                var varArgs = !!paramDecl.dotDotDotToken;
                var paramType = this.typeChecker.getTypeOfSymbolAtLocation(param, this.node);
                if (varArgs) {
                    var typeRef = paramType;
                    paramType = typeRef.typeArguments[0];
                }
                var typeStr = this.translate(paramType);
                if (varArgs)
                    typeStr = '...' + typeStr;
                if (optional)
                    typeStr = typeStr + '=';
                paramTypes.push(typeStr);
            }
            return paramTypes;
        };
        TypeTranslator.prototype.warn = function (msg) {
            // By default, warn() does nothing.  The caller will overwrite this
            // if it wants different behavior.
        };
        /** @return true if sym should always have type {?}. */
        TypeTranslator.prototype.isBlackListed = function (symbol) {
            if (this.pathBlackList === undefined)
                return false;
            var pathBlackList = this.pathBlackList;
            // Some builtin types, such as {}, get represented by a symbol that has no declarations.
            if (symbol.declarations === undefined)
                return false;
            return symbol.declarations.every(function (n) {
                var fileName = path.normalize(n.getSourceFile().fileName);
                return pathBlackList.has(fileName);
            });
        };
        /**
         * Closure doesn not support type parameters for function types, i.e. generic function types.
         * Blacklist the symbols declared by them and emit a ? for the types.
         *
         * This mutates the given blacklist map. The map's scope is one file, and symbols are
         * unique objects, so this should neither lead to excessive memory consumption nor introduce
         * errors.
         *
         * @param blacklist a map to store the blacklisted symbols in, with a value of '?'. In practice,
         *     this is always === this.symbolsToAliasedNames, but we're passing it explicitly to make it
         *    clear that the map is mutated (in particular when used from outside the class).
         * @param decls the declarations whose symbols should be blacklisted.
         */
        TypeTranslator.prototype.blacklistTypeParameters = function (blacklist, decls) {
            if (!decls || !decls.length)
                return;
            try {
                for (var decls_1 = __values(decls), decls_1_1 = decls_1.next(); !decls_1_1.done; decls_1_1 = decls_1.next()) {
                    var tpd = decls_1_1.value;
                    var sym = this.typeChecker.getSymbolAtLocation(tpd.name);
                    if (!sym) {
                        this.warn("type parameter with no symbol");
                        continue;
                    }
                    this.symbolsToAliasedNames.set(sym, '?');
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (decls_1_1 && !decls_1_1.done && (_a = decls_1.return)) _a.call(decls_1);
                }
                finally { if (e_6) throw e_6.error; }
            }
            var e_6, _a;
        };
        return TypeTranslator;
    }());
    exports.TypeTranslator = TypeTranslator;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZS10cmFuc2xhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3R5cGUtdHJhbnNsYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFSCwyQkFBNkI7SUFDN0IsK0JBQWlDO0lBR2pDOzs7T0FHRztJQUNILHlCQUFnQyxRQUFnQjtRQUM5QyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLElBQUksQ0FBQztJQUM3RCxDQUFDO0lBRkQsMENBRUM7SUFFRDs7Ozs7T0FLRztJQUNILCtCQUErQixNQUFpQjtRQUM5QyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksSUFBSSxJQUFJO1lBQzlCLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsZUFBZSxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBM0MsQ0FBMkMsQ0FBQyxDQUFDO0lBQ2pGLENBQUM7SUFFRCwyQkFBa0MsSUFBYTtRQUM3QyxJQUFJLFdBQVcsR0FBRyxhQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBRyxDQUFDO1FBRXZELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLFdBQVcsSUFBSSxZQUFVLG1CQUFtQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUcsQ0FBQztRQUNuRSxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUM1QixXQUFXLElBQUksaUJBQWUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBRyxDQUFDO1FBQzVGLENBQUM7UUFFRCw0RUFBNEU7UUFDNUUsSUFBTSxVQUFVLEdBQW1CO1lBQ2pDLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFZLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFVLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTTtZQUM1RSxFQUFFLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBUSxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksRUFBWSxFQUFFLENBQUMsU0FBUyxDQUFDLGFBQWE7WUFDbkYsRUFBRSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxXQUFXO1lBQ2pGLEVBQUUsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFZLEVBQUUsQ0FBQyxTQUFTLENBQUMsU0FBUztZQUMvRSxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksRUFBVyxFQUFFLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBVyxFQUFFLENBQUMsU0FBUyxDQUFDLGFBQWE7WUFDbkYsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQVMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQVcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxZQUFZO1lBQ2xGLEVBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFVLEVBQUUsQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsWUFBWTtTQUNuRixDQUFDOztZQUNGLEdBQUcsQ0FBQyxDQUFlLElBQUEsZUFBQSxTQUFBLFVBQVUsQ0FBQSxzQ0FBQTtnQkFBeEIsSUFBTSxJQUFJLHVCQUFBO2dCQUNiLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM5QixXQUFXLElBQUksTUFBSSxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBRyxDQUFDO2dCQUMxQyxDQUFDO2FBQ0Y7Ozs7Ozs7OztRQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLElBQU0sT0FBTyxHQUFHLElBQXFCLENBQUM7WUFDdEMsNEVBQTRFO1lBQzVFLElBQU0sV0FBVyxHQUFxQjtnQkFDcEMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLO2dCQUNwQixFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVM7Z0JBQ3hCLEVBQUUsQ0FBQyxXQUFXLENBQUMsU0FBUztnQkFDeEIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLO2dCQUNwQixFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVM7Z0JBQ3hCLEVBQUUsQ0FBQyxXQUFXLENBQUMsTUFBTTtnQkFDckIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxZQUFZO2dCQUMzQixFQUFFLENBQUMsV0FBVyxDQUFDLGFBQWE7Z0JBQzVCLEVBQUUsQ0FBQyxXQUFXLENBQUMsYUFBYTtnQkFDNUIsRUFBRSxDQUFDLFdBQVcsQ0FBQywwQ0FBMEM7YUFDMUQsQ0FBQzs7Z0JBQ0YsR0FBRyxDQUFDLENBQWUsSUFBQSxnQkFBQSxTQUFBLFdBQVcsQ0FBQSx3Q0FBQTtvQkFBekIsSUFBTSxJQUFJLHdCQUFBO29CQUNiLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUN2QyxXQUFXLElBQUksYUFBVyxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBRyxDQUFDO29CQUNuRCxDQUFDO2lCQUNGOzs7Ozs7Ozs7UUFDSCxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2pELFdBQVcsSUFBSSxrQkFBZ0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBRyxDQUFDO1FBQ3BFLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNqQixXQUFXLElBQUkscUJBQXFCLENBQUM7UUFDdkMsQ0FBQztRQUVELE1BQU0sQ0FBQyxXQUFTLFdBQVcsTUFBRyxDQUFDOztJQUNqQyxDQUFDO0lBekRELDhDQXlEQztJQUVELDZCQUFvQyxHQUFjO1FBQ2hELElBQUksV0FBVyxHQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBWSxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUcsQ0FBQztRQUVsRiw0RUFBNEU7UUFDNUUsSUFBTSxXQUFXLEdBQUc7WUFDbEIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxzQkFBc0I7WUFDckMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUI7WUFDbEMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRO1lBQ3ZCLEVBQUUsQ0FBQyxXQUFXLENBQUMsVUFBVTtZQUN6QixFQUFFLENBQUMsV0FBVyxDQUFDLFFBQVE7WUFDdkIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLO1lBQ3BCLEVBQUUsQ0FBQyxXQUFXLENBQUMsU0FBUztZQUN4QixFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVM7WUFDeEIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxXQUFXO1lBQzFCLEVBQUUsQ0FBQyxXQUFXLENBQUMsV0FBVztZQUMxQixFQUFFLENBQUMsV0FBVyxDQUFDLGVBQWU7WUFDOUIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxXQUFXO1lBQzFCLEVBQUUsQ0FBQyxXQUFXLENBQUMsYUFBYTtZQUM1QixFQUFFLENBQUMsV0FBVyxDQUFDLE1BQU07WUFDckIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxXQUFXO1lBQzFCLEVBQUUsQ0FBQyxXQUFXLENBQUMsV0FBVztZQUMxQixFQUFFLENBQUMsV0FBVyxDQUFDLFdBQVc7WUFDMUIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxTQUFTO1lBQ3hCLEVBQUUsQ0FBQyxXQUFXLENBQUMsYUFBYTtZQUM1QixFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVM7WUFDeEIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxXQUFXO1lBQzFCLEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSztZQUNwQixFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVM7WUFDeEIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxVQUFVO1lBQ3pCLEVBQUUsQ0FBQyxXQUFXLENBQUMsUUFBUTtZQUN2QixFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVM7U0FDekIsQ0FBQzs7WUFDRixHQUFHLENBQUMsQ0FBZSxJQUFBLGdCQUFBLFNBQUEsV0FBVyxDQUFBLHdDQUFBO2dCQUF6QixJQUFNLElBQUksd0JBQUE7Z0JBQ2IsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzdCLFdBQVcsSUFBSSxNQUFJLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFHLENBQUM7Z0JBQzVDLENBQUM7YUFDRjs7Ozs7Ozs7O1FBRUQsTUFBTSxDQUFDLFdBQVcsQ0FBQzs7SUFDckIsQ0FBQztJQXZDRCxrREF1Q0M7SUFFRCxtRUFBbUU7SUFDbkU7UUFhRTs7Ozs7Ozs7O1dBU0c7UUFDSCx3QkFDcUIsV0FBMkIsRUFBbUIsSUFBYSxFQUMzRCxhQUEyQixFQUMzQixxQkFBb0QsRUFDcEQsb0JBQXlEO1lBRHpELHNDQUFBLEVBQUEsNEJBQTRCLEdBQUcsRUFBcUI7WUFDcEQscUNBQUEsRUFBQSxxQ0FBd0QsQ0FBQztZQUh6RCxnQkFBVyxHQUFYLFdBQVcsQ0FBZ0I7WUFBbUIsU0FBSSxHQUFKLElBQUksQ0FBUztZQUMzRCxrQkFBYSxHQUFiLGFBQWEsQ0FBYztZQUMzQiwwQkFBcUIsR0FBckIscUJBQXFCLENBQStCO1lBQ3BELHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBcUM7WUExQjlFOzs7ZUFHRztZQUNjLHVCQUFrQixHQUFHLElBQUksR0FBRyxFQUFXLENBQUM7WUFFekQ7OztlQUdHO1lBQ0gsaUJBQVksR0FBRyxLQUFLLENBQUM7WUFpQm5CLGtEQUFrRDtZQUNsRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxhQUFhO29CQUNkLElBQUksR0FBRyxDQUFTLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQWpCLENBQWlCLENBQUMsQ0FBQyxDQUFDO1lBQzNGLENBQUM7UUFDSCxDQUFDO1FBRUQ7Ozs7Ozs7OztXQVNHO1FBQ0ksdUNBQWMsR0FBckIsVUFBc0IsR0FBYyxFQUFFLE1BQWU7WUFDbkQsRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUNoQyw0RkFBNEY7Z0JBQzVGLDJGQUEyRjtnQkFDM0YseUZBQXlGO2dCQUN6RiwwRkFBMEY7Z0JBQzFGLDRCQUE0QjtnQkFDNUIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdEQsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDL0MsMkZBQTJGO29CQUMzRix5RkFBeUY7b0JBQ3pGLDBGQUEwRjtvQkFDMUYsMEZBQTBGO29CQUMxRixxRkFBcUY7b0JBQ3JGLHFCQUFxQjtvQkFDckIsa0ZBQWtGO29CQUNsRixHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDN0MsQ0FBQztnQkFDRCwwRkFBMEY7Z0JBQzFGLDRGQUE0RjtnQkFDNUYsVUFBVTtnQkFDVixJQUFNLFVBQVUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxZQUFZLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQztvQkFDaEQsSUFBSSxPQUFPLEdBQXNCLENBQUMsQ0FBQztvQkFDbkMsT0FBTyxPQUFPLEVBQUUsQ0FBQzt3QkFDZixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUM7NEJBQUMsTUFBTSxDQUFDLElBQUksQ0FBQzt3QkFDakUsT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7b0JBQzNCLENBQUM7b0JBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFDZixDQUFDLENBQUMsQ0FBQztnQkFDSCxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO29CQUNmLEdBQUcsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDckMsQ0FBQztnQkFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZDLENBQUM7WUFDRCxnR0FBZ0c7WUFDaEcsc0ZBQXNGO1lBQ3RGLGdHQUFnRztZQUNoRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRXJGLElBQUksUUFBUSxHQUFHLEdBQUcsQ0FBQztZQUNuQixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDMUMsUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDekQsQ0FBQztZQUNELElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdkQsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDO2dCQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFFeEIscUVBQXFFO1lBQ3JFLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUNiLElBQU0sU0FBUyxHQUFHLFVBQUMsSUFBWSxJQUFLLE9BQUEsR0FBRyxJQUFJLElBQUksRUFBWCxDQUFXLENBQUM7WUFDaEQsSUFBTSxTQUFTLEdBQUc7Z0JBQ2hCLE1BQU0sQ0FBQztZQUNULENBQUMsQ0FBQztZQUVGLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUMzRCxJQUFNLE1BQU0sR0FBb0I7Z0JBQzlCLFlBQVksRUFBRSxTQUFTO2dCQUN2QixhQUFhLEVBQUUsU0FBUztnQkFDeEIsZ0JBQWdCLEVBQUUsU0FBUztnQkFDM0IsVUFBVSxFQUFFLFNBQVM7Z0JBQ3JCLGtCQUFrQixFQUFFLFNBQVM7Z0JBQzdCLGNBQWMsRUFBRSxTQUFTO2dCQUN6QixhQUFhLEVBQUUsU0FBUztnQkFDeEIsV0FBVyxFQUFFLFNBQVM7Z0JBQ3RCLFNBQVMsRUFBRSxTQUFTO2dCQUNwQixjQUFjLEVBQUUsU0FBUztnQkFDekIsY0FBYyxFQUFFLFNBQVM7Z0JBQ3pCLEtBQUssRUFBRSxTQUFTO2dCQUNoQixXQUFXLFlBQUMsTUFBaUIsRUFBRSxvQkFBOEIsRUFBRSxPQUF3QjtvQkFDckYsTUFBTSxDQUFDO2dCQUNULENBQUM7Z0JBQ0QsMkJBQTJCLEVBQUUsU0FBUztnQkFDdEMsb0NBQW9DLEVBQUUsU0FBUzthQUNoRCxDQUFDO1lBQ0YsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25ELE1BQU0sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUVELHlGQUF5RjtRQUN6RiwrRkFBK0Y7UUFDL0YseUZBQXlGO1FBQ3pGLDZGQUE2RjtRQUM3RixrQkFBa0I7UUFDViw0Q0FBbUIsR0FBM0IsVUFBNEIsSUFBWTtZQUN0QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5RSxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELGtDQUFTLEdBQVQsVUFBVSxJQUFhLEVBQUUsWUFBb0I7WUFDM0MsMkVBQTJFO1lBQzNFLDRGQUE0RjtZQUM1Riw2RkFBNkY7WUFDN0YsZ0NBQWdDO1lBSlQsNkJBQUEsRUFBQSxvQkFBb0I7WUFNM0MsMkZBQTJGO1lBQzNGLDhGQUE4RjtZQUM5RixxRkFBcUY7WUFDckYsbUJBQW1CO1lBRW5CLDZGQUE2RjtZQUM3RixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLEVBQUUsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDO2dCQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7WUFFL0QsbURBQW1EO1lBQ25ELHlGQUF5RjtZQUN6RiwwRUFBMEU7WUFDMUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFBQyxNQUFNLENBQUMsR0FBRyxDQUFDO1lBRWxELDhGQUE4RjtZQUM5RixpRUFBaUU7WUFDakUsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xFLENBQUM7WUFFRCxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFDdEIsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBQ3hCLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztZQUNyQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzs7b0JBQ2hCLEdBQUcsQ0FBQyxDQUFlLElBQUEsS0FBQSxTQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQSxnQkFBQTt3QkFBNUMsSUFBTSxJQUFJLFdBQUE7d0JBQ2IsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDOzRCQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7d0JBQy9ELElBQUksT0FBTyxHQUFzQixJQUFJLENBQUM7d0JBQ3RDLE9BQU8sT0FBTyxFQUFFLENBQUM7NEJBQ2YsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO2dDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7NEJBQ3RGLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQztnQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDOzRCQUN6RSxPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQzt3QkFDM0IsQ0FBQztxQkFDRjs7Ozs7Ozs7O1lBQ0gsQ0FBQztZQUVELDREQUE0RDtZQUM1RCxFQUFFLENBQUMsQ0FBQyxXQUFXLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztZQUUxQyxpRUFBaUU7WUFDakUsNkZBQTZGO1lBQzdGLDJCQUEyQjtZQUMzQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLFFBQVEsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFBQyxNQUFNLENBQUMsR0FBRyxDQUFDO1lBRTVELElBQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDO1lBQzVDLElBQU0sSUFBSSxHQUFHLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNqQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLEtBQUssRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHO29CQUNuQixNQUFNLENBQUMsR0FBRyxDQUFDO2dCQUNiLEtBQUssRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7Z0JBQ3pCLEtBQUssRUFBRSxDQUFDLFNBQVMsQ0FBQyxhQUFhO29CQUM3QixNQUFNLENBQUMsUUFBUSxDQUFDO2dCQUNsQixLQUFLLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO2dCQUN6QixLQUFLLEVBQUUsQ0FBQyxTQUFTLENBQUMsYUFBYTtvQkFDN0IsTUFBTSxDQUFDLFFBQVEsQ0FBQztnQkFDbEIsS0FBSyxFQUFFLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQztnQkFDMUIsS0FBSyxFQUFFLENBQUMsU0FBUyxDQUFDLGNBQWM7b0JBQzlCLGlEQUFpRDtvQkFDakQsTUFBTSxDQUFDLFNBQVMsQ0FBQztnQkFDbkIsS0FBSyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUk7b0JBQ3BCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7d0JBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQzt3QkFDdkMsTUFBTSxDQUFDLEdBQUcsQ0FBQztvQkFDYixDQUFDO29CQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ2hELEtBQUssRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRO29CQUN4Qix5REFBeUQ7b0JBQ3pELDhHQUE4RztvQkFDOUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztnQkFDbEIsS0FBSyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUk7b0JBQ3BCLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQ2hCLEtBQUssRUFBRSxDQUFDLFNBQVMsQ0FBQyxTQUFTO29CQUN6QixNQUFNLENBQUMsV0FBVyxDQUFDO2dCQUNyQixLQUFLLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSTtvQkFDcEIsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDaEIsS0FBSyxFQUFFLENBQUMsU0FBUyxDQUFDLEtBQUs7b0JBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztvQkFDNUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztnQkFDYixLQUFLLEVBQUUsQ0FBQyxTQUFTLENBQUMsYUFBYTtvQkFDN0IsNENBQTRDO29CQUM1QyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO3dCQUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBRSx5QkFBeUI7d0JBQ3ZFLE1BQU0sQ0FBQyxHQUFHLENBQUM7b0JBQ2IsQ0FBQztvQkFDRCwrRUFBK0U7b0JBQy9FLElBQU0sTUFBTSxHQUFHLEtBQUssQ0FBQztvQkFDckIsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDbEQsS0FBSyxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQU07b0JBQ3RCLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQXFCLENBQUMsQ0FBQztnQkFDckQsS0FBSyxFQUFFLENBQUMsU0FBUyxDQUFDLEtBQUs7b0JBQ3JCLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQW9CLENBQUMsQ0FBQztnQkFDbkQsS0FBSyxFQUFFLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQztnQkFDL0IsS0FBSyxFQUFFLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztnQkFDeEIsS0FBSyxFQUFFLENBQUMsU0FBUyxDQUFDLGFBQWE7b0JBQzdCLDJDQUEyQztvQkFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQywyQkFBeUIsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFHLENBQUMsQ0FBQztvQkFDL0QsTUFBTSxDQUFDLEdBQUcsQ0FBQztnQkFDYjtvQkFDRSw2Q0FBNkM7b0JBRTdDLGdEQUFnRDtvQkFDaEQsMENBQTBDO29CQUMxQyxxRkFBcUY7b0JBQ3JGLHVFQUF1RTtvQkFDdkUsMEZBQTBGO29CQUMxRiw4RUFBOEU7b0JBQzlFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO3dCQUNwQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFvQixDQUFDLENBQUM7b0JBQ25ELENBQUM7b0JBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7d0JBQzFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3pDLENBQUM7b0JBRUQsb0RBQW9EO29CQUNwRCxNQUFNLElBQUksS0FBSyxDQUFDLHdCQUFzQixJQUFJLENBQUMsS0FBSyxZQUFPLGlCQUFpQixDQUFDLElBQUksQ0FBRyxDQUFDLENBQUM7WUFDdEYsQ0FBQzs7UUFDSCxDQUFDO1FBRU8sdUNBQWMsR0FBdEIsVUFBdUIsSUFBa0I7WUFBekMsaUJBT0M7WUFOQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLEtBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQWpCLENBQWlCLENBQUMsQ0FBQztZQUNuRCwrRkFBK0Y7WUFDL0YsNkVBQTZFO1lBQzdFLHVEQUF1RDtZQUN2RCxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFDLEVBQUUsRUFBRSxHQUFHLElBQUssT0FBQSxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsRUFBekIsQ0FBeUIsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQUcsQ0FBQztRQUNoRSxDQUFDO1FBRU8sNkNBQW9CLEdBQTVCLFVBQTZCLElBQWE7WUFDeEMsbUJBQW1CO1lBQ25CLDZCQUE2QjtZQUM3Qiw0RkFBNEY7WUFDNUYscUNBQXFDO1lBQ3JDLDBEQUEwRDtZQUMxRCxFQUFFO1lBQ0YsaUZBQWlGO1lBQ2pGLDRDQUE0QztZQUU1QyxJQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNoQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLENBQUM7Z0JBQzlDLE1BQU0sQ0FBQyxHQUFHLENBQUM7WUFDYixDQUFDO1lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQy9ELENBQUM7UUFFRCx1RUFBdUU7UUFDdkUsNERBQTREO1FBQ3BELHdDQUFlLEdBQXZCLFVBQXdCLElBQW1CO1lBQTNDLGlCQWtHQztZQWpHQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7WUFFL0QsMEVBQTBFO1lBQzFFLCtFQUErRTtZQUUvRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDNUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO29CQUNqQyxNQUFNLENBQUMsR0FBRyxDQUFDO2dCQUNiLENBQUM7Z0JBQ0QsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25FLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZELDhEQUE4RDtnQkFDOUQsNkRBQTZEO2dCQUM3RCwrREFBK0Q7Z0JBQy9ELDJEQUEyRDtnQkFDM0QsNERBQTREO2dCQUM1RCwwREFBMEQ7Z0JBQzFELHFCQUFxQjtnQkFDckIsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO29CQUNyQyxNQUFNLENBQUMsR0FBRyxDQUFDO2dCQUNiLENBQUM7Z0JBQ0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUM3Qyx5Q0FBeUM7b0JBQ3pDLHFFQUFxRTtvQkFDckUsOENBQThDO29CQUM5QyxFQUFFLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3hDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQTRCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSx3QkFBcUIsQ0FBQyxDQUFDO3dCQUM3RSxNQUFNLENBQUMsR0FBRyxDQUFDO29CQUNiLENBQUM7Z0JBQ0gsQ0FBQztnQkFDRCxNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkUsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDdkQsbUVBQW1FO2dCQUNuRSxtREFBbUQ7Z0JBQ25ELElBQU0sYUFBYSxHQUFHLElBQXdCLENBQUM7Z0JBRS9DLHVFQUF1RTtnQkFDdkUscUVBQXFFO2dCQUNyRSxvREFBb0Q7Z0JBQ3BELEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDNUQsTUFBTSxDQUFDLFdBQVcsQ0FBQztnQkFDckIsQ0FBQztnQkFFRCxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7Z0JBQ2pCLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxNQUFNLEtBQUssYUFBYSxDQUFDLENBQUMsQ0FBQztvQkFDM0MsOERBQThEO29CQUM5RCwyREFBMkQ7b0JBQzNELDREQUE0RDtvQkFDNUQsY0FBYztvQkFDZCxNQUFNLElBQUksS0FBSyxDQUNYLHVCQUFxQixpQkFBaUIsQ0FBQyxhQUFhLENBQUMsU0FBSSxhQUFhLENBQUMsS0FBTyxDQUFDLENBQUM7Z0JBQ3RGLENBQUM7Z0JBQ0QsT0FBTyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNoRCxrRkFBa0Y7Z0JBQ2xGLHlFQUF5RTtnQkFDekUsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLEdBQUcsQ0FBQztvQkFBQyxNQUFNLENBQUMsR0FBRyxDQUFDO2dCQUNoQyxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztvQkFDaEMsSUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxLQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFqQixDQUFpQixDQUFDLENBQUM7b0JBQ3ZFLE9BQU8sSUFBSSxNQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQUcsQ0FBQztnQkFDdEMsQ0FBQztnQkFDRCxNQUFNLENBQUMsT0FBTyxDQUFDO1lBQ2pCLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQ2pCLHFFQUFxRTtvQkFDckUsb0VBQW9FO29CQUNwRSxxRUFBcUU7b0JBQ3JFLDJDQUEyQztvQkFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO29CQUMxQyxNQUFNLENBQUMsR0FBRyxDQUFDO2dCQUNiLENBQUM7Z0JBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRO29CQUMzQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQzlDLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQy9FLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDdEIsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDMUMsQ0FBQztvQkFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLHdEQUF3RCxDQUFDLENBQUM7b0JBQ3BFLE1BQU0sQ0FBQyxHQUFHLENBQUM7Z0JBQ2IsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDTixNQUFNLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMzQyxDQUFDO1lBQ0gsQ0FBQztZQUVEOzs7Ozs7OztjQVFFO1lBQ0YsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBa0IsaUJBQWlCLENBQUMsSUFBSSxDQUFHLENBQUMsQ0FBQztZQUN2RCxNQUFNLENBQUMsR0FBRyxDQUFDO1FBQ2IsQ0FBQztRQUVEOzs7Ozs7O1dBT0c7UUFDSywrQ0FBc0IsR0FBOUIsVUFBK0IsSUFBYTtZQUMxQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xDLDBFQUEwRTtZQUMxRSxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7WUFDckIsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ3RCLElBQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztZQUM1QixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQztnQkFDMUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztZQUNiLENBQUM7WUFFRCxxQ0FBcUM7WUFDckMsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7WUFDNUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ2pCLDBGQUEwRjtnQkFDMUYsa0VBQWtFO2dCQUVsRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO29CQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLHdFQUF3RSxDQUFDLENBQUM7b0JBQ3BGLE1BQU0sQ0FBQyxHQUFHLENBQUM7Z0JBQ2IsQ0FBQztnQkFDRCxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUM3RSxJQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDbEUsSUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztnQkFDakUsbUVBQW1FO2dCQUNuRSx3QkFBd0I7Z0JBQ3hCLHdCQUF3QjtnQkFDeEIsMEJBQTBCO2dCQUMxQixrQ0FBa0M7Z0JBQ2xDLHFFQUFxRTtnQkFDckUsd0VBQXdFO2dCQUN4RSxzRUFBc0U7Z0JBQ3RFLE1BQU0sQ0FBQyxvQkFBa0IsZUFBZSxTQUFJLFNBQVMsU0FBTSxDQUFDO1lBQzlELENBQUM7O2dCQUVELHlFQUF5RTtnQkFDekUsK0RBQStEO2dCQUMvRCxrQ0FBa0M7Z0JBQ2xDLEdBQUcsQ0FBQyxDQUFnQixJQUFBLEtBQUEsU0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQVUsQ0FBQSxnQkFBQTtvQkFBbEQsSUFBTSxLQUFLLFdBQUE7b0JBQ2QsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzt3QkFDZCxLQUFLLFFBQVE7NEJBQ1gsUUFBUSxHQUFHLElBQUksQ0FBQzs0QkFDaEIsS0FBSyxDQUFDO3dCQUNSLEtBQUssU0FBUzs0QkFDWixTQUFTLEdBQUcsSUFBSSxDQUFDOzRCQUNqQixLQUFLLENBQUM7d0JBQ1I7NEJBQ0UsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBRSxDQUFDOzRCQUMvQyxpRkFBaUY7NEJBQ2pGLElBQU0sVUFBVSxHQUNaLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7NEJBQ2xGLE1BQU0sQ0FBQyxJQUFJLENBQUksS0FBSyxVQUFLLFVBQVksQ0FBQyxDQUFDOzRCQUN2QyxLQUFLLENBQUM7b0JBQ1YsQ0FBQztpQkFDRjs7Ozs7Ozs7O1lBRUQsNkRBQTZEO1lBQzdELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEIsRUFBRSxDQUFDLENBQUMsUUFBUSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDM0IsbUJBQW1CO29CQUNuQixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUMvRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3RCLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzFDLENBQUM7Z0JBQ0gsQ0FBQztnQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztvQkFDbEMsOEJBQThCO29CQUM5QixJQUFJLE9BQU8sR0FBRyxRQUFRLENBQUM7b0JBQ3ZCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQzdFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzt3QkFDYixPQUFPLEdBQUcsUUFBUSxDQUFDO3dCQUNuQixPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDM0UsQ0FBQztvQkFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7d0JBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO3dCQUNwQyxNQUFNLENBQUMsY0FBYyxDQUFDO29CQUN4QixDQUFDO29CQUNELE1BQU0sQ0FBQyxhQUFXLE9BQU8sU0FBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFHLENBQUM7Z0JBQzFELENBQUM7Z0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDbkMsb0VBQW9FO29CQUNwRSxnREFBZ0Q7b0JBQ2hELE1BQU0sQ0FBQyxTQUFTLENBQUM7Z0JBQ25CLENBQUM7WUFDSCxDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUM1Qix5RUFBeUU7Z0JBQ3pFLE1BQU0sQ0FBQyxNQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQUcsQ0FBQztZQUNsQyxDQUFDO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxHQUFHLENBQUM7O1FBQ2IsQ0FBQztRQUVELCtFQUErRTtRQUN2RSwyQ0FBa0IsR0FBMUIsVUFBMkIsR0FBaUI7WUFDMUMsNkZBQTZGO1lBRTdGLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsR0FBRyxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUV6RixJQUFJLE9BQU8sR0FBRyxXQUFXLENBQUM7WUFFMUIsSUFBSSxVQUFVLEdBQTJDLEdBQUcsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDO1lBQ3BGLElBQU0sY0FBYyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQyxpRkFBaUY7WUFDakYsMEVBQTBFO1lBQzFFLEVBQUUsQ0FBQyxDQUFDLGNBQWMsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQy9ELEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUN4QixJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDekUsT0FBTyxJQUFJLFlBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBRyxDQUFDO29CQUNqRCxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQzt3QkFBQyxPQUFPLElBQUksSUFBSSxDQUFDO2dCQUM3QyxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLElBQUksQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztnQkFDdEMsQ0FBQztnQkFDRCxVQUFVLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQyxDQUFDO1lBRUQsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDbkQsT0FBTyxJQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQUcsQ0FBQztZQUVuQyxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNaLE9BQU8sSUFBSSxPQUFLLE9BQVMsQ0FBQztZQUM1QixDQUFDO1lBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUNqQixDQUFDO1FBRUQ7Ozs7V0FJRztRQUNLLHNDQUFhLEdBQXJCLFVBQXNCLEdBQWlCLEVBQUUsVUFBa0Q7WUFFekYsSUFBTSxVQUFVLEdBQWEsRUFBRSxDQUFDO1lBQ2hDLHdGQUF3RjtZQUN4RixtREFBbUQ7WUFDbkQsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQztZQUM3QixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQy9DLElBQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRWhDLElBQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEMsSUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUM7Z0JBQzNDLElBQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDO2dCQUMzQyxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLHlCQUF5QixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzdFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQ1osSUFBTSxPQUFPLEdBQUcsU0FBNkIsQ0FBQztvQkFDOUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxhQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hDLENBQUM7Z0JBQ0QsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDeEMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDO29CQUFDLE9BQU8sR0FBRyxLQUFLLEdBQUcsT0FBTyxDQUFDO2dCQUN2QyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUM7b0JBQUMsT0FBTyxHQUFHLE9BQU8sR0FBRyxHQUFHLENBQUM7Z0JBQ3RDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDM0IsQ0FBQztZQUNELE1BQU0sQ0FBQyxVQUFVLENBQUM7UUFDcEIsQ0FBQztRQUVELDZCQUFJLEdBQUosVUFBSyxHQUFXO1lBQ2QsbUVBQW1FO1lBQ25FLGtDQUFrQztRQUNwQyxDQUFDO1FBRUQsdURBQXVEO1FBQ3ZELHNDQUFhLEdBQWIsVUFBYyxNQUFpQjtZQUM3QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxLQUFLLFNBQVMsQ0FBQztnQkFBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQ25ELElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDekMsd0ZBQXdGO1lBQ3hGLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEtBQUssU0FBUyxDQUFDO2dCQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDcEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLFVBQUEsQ0FBQztnQkFDaEMsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzVELE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3JDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVEOzs7Ozs7Ozs7Ozs7V0FZRztRQUNILGdEQUF1QixHQUF2QixVQUNJLFNBQWlDLEVBQ2pDLEtBQTBEO1lBQzVELEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztnQkFBQyxNQUFNLENBQUM7O2dCQUNwQyxHQUFHLENBQUMsQ0FBYyxJQUFBLFVBQUEsU0FBQSxLQUFLLENBQUEsNEJBQUE7b0JBQWxCLElBQU0sR0FBRyxrQkFBQTtvQkFDWixJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDM0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUNULElBQUksQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsQ0FBQzt3QkFDM0MsUUFBUSxDQUFDO29CQUNYLENBQUM7b0JBQ0QsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7aUJBQzFDOzs7Ozs7Ozs7O1FBQ0gsQ0FBQztRQUNILHFCQUFDO0lBQUQsQ0FBQyxBQWhsQkQsSUFnbEJDO0lBaGxCWSx3Q0FBYyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtnZXRJZGVudGlmaWVyVGV4dH0gZnJvbSAnLi9yZXdyaXRlcic7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiBmaWxlTmFtZSByZWZlcnMgdG8gYSBidWlsdGluIGxpYi5kLnRzIGZpbGUuXG4gKiBUaGlzIGlzIGEgdGVycmlibGUgaGFjayBidXQgaXQgbWlycm9ycyBhIHNpbWlsYXIgdGhpbmcgZG9uZSBpbiBDbHV0ei5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQnVpbHRpbkxpYkRUUyhmaWxlTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBmaWxlTmFtZS5tYXRjaCgvXFxibGliXFwuKD86W14vXStcXC4pP2RcXC50cyQvKSAhPSBudWxsO1xufVxuXG4vKipcbiAqIEByZXR1cm4gVHJ1ZSBpZiB0aGUgbmFtZWQgdHlwZSBpcyBjb25zaWRlcmVkIGNvbXBhdGlibGUgd2l0aCB0aGUgQ2xvc3VyZS1kZWZpbmVkXG4gKiAgICAgdHlwZSBvZiB0aGUgc2FtZSBuYW1lLCBlLmcuIFwiQXJyYXlcIi4gIE5vdGUgdGhhdCB3ZSBkb24ndCBhY3R1YWxseSBlbmZvcmNlXG4gKiAgICAgdGhhdCB0aGUgdHlwZXMgYXJlIGFjdHVhbGx5IGNvbXBhdGlibGUsIGJ1dCBtb3N0bHkganVzdCBob3BlIHRoYXQgdGhleSBhcmUgZHVlXG4gKiAgICAgdG8gYmVpbmcgZGVyaXZlZCBmcm9tIHRoZSBzYW1lIEhUTUwgc3BlY3MuXG4gKi9cbmZ1bmN0aW9uIGlzQ2xvc3VyZVByb3ZpZGVkVHlwZShzeW1ib2w6IHRzLlN5bWJvbCk6IGJvb2xlYW4ge1xuICByZXR1cm4gc3ltYm9sLmRlY2xhcmF0aW9ucyAhPSBudWxsICYmXG4gICAgICBzeW1ib2wuZGVjbGFyYXRpb25zLnNvbWUobiA9PiBpc0J1aWx0aW5MaWJEVFMobi5nZXRTb3VyY2VGaWxlKCkuZmlsZU5hbWUpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHR5cGVUb0RlYnVnU3RyaW5nKHR5cGU6IHRzLlR5cGUpOiBzdHJpbmcge1xuICBsZXQgZGVidWdTdHJpbmcgPSBgZmxhZ3M6MHgke3R5cGUuZmxhZ3MudG9TdHJpbmcoMTYpfWA7XG5cbiAgaWYgKHR5cGUuYWxpYXNTeW1ib2wpIHtcbiAgICBkZWJ1Z1N0cmluZyArPSBgIGFsaWFzOiR7c3ltYm9sVG9EZWJ1Z1N0cmluZyh0eXBlLmFsaWFzU3ltYm9sKX1gO1xuICB9XG4gIGlmICh0eXBlLmFsaWFzVHlwZUFyZ3VtZW50cykge1xuICAgIGRlYnVnU3RyaW5nICs9IGAgYWxpYXNBcmdzOjwke3R5cGUuYWxpYXNUeXBlQXJndW1lbnRzLm1hcCh0eXBlVG9EZWJ1Z1N0cmluZykuam9pbignLCcpfT5gO1xuICB9XG5cbiAgLy8gSnVzdCB0aGUgdW5pcXVlIGZsYWdzIChwb3dlcnMgb2YgdHdvKS4gRGVjbGFyZWQgaW4gc3JjL2NvbXBpbGVyL3R5cGVzLnRzLlxuICBjb25zdCBiYXNpY1R5cGVzOiB0cy5UeXBlRmxhZ3NbXSA9IFtcbiAgICB0cy5UeXBlRmxhZ3MuQW55LCAgICAgICAgICAgdHMuVHlwZUZsYWdzLlN0cmluZywgICAgICAgICB0cy5UeXBlRmxhZ3MuTnVtYmVyLFxuICAgIHRzLlR5cGVGbGFncy5Cb29sZWFuLCAgICAgICB0cy5UeXBlRmxhZ3MuRW51bSwgICAgICAgICAgIHRzLlR5cGVGbGFncy5TdHJpbmdMaXRlcmFsLFxuICAgIHRzLlR5cGVGbGFncy5OdW1iZXJMaXRlcmFsLCB0cy5UeXBlRmxhZ3MuQm9vbGVhbkxpdGVyYWwsIHRzLlR5cGVGbGFncy5FbnVtTGl0ZXJhbCxcbiAgICB0cy5UeXBlRmxhZ3MuRVNTeW1ib2wsICAgICAgdHMuVHlwZUZsYWdzLlZvaWQsICAgICAgICAgICB0cy5UeXBlRmxhZ3MuVW5kZWZpbmVkLFxuICAgIHRzLlR5cGVGbGFncy5OdWxsLCAgICAgICAgICB0cy5UeXBlRmxhZ3MuTmV2ZXIsICAgICAgICAgIHRzLlR5cGVGbGFncy5UeXBlUGFyYW1ldGVyLFxuICAgIHRzLlR5cGVGbGFncy5PYmplY3QsICAgICAgICB0cy5UeXBlRmxhZ3MuVW5pb24sICAgICAgICAgIHRzLlR5cGVGbGFncy5JbnRlcnNlY3Rpb24sXG4gICAgdHMuVHlwZUZsYWdzLkluZGV4LCAgICAgICAgIHRzLlR5cGVGbGFncy5JbmRleGVkQWNjZXNzLCAgdHMuVHlwZUZsYWdzLk5vblByaW1pdGl2ZSxcbiAgXTtcbiAgZm9yIChjb25zdCBmbGFnIG9mIGJhc2ljVHlwZXMpIHtcbiAgICBpZiAoKHR5cGUuZmxhZ3MgJiBmbGFnKSAhPT0gMCkge1xuICAgICAgZGVidWdTdHJpbmcgKz0gYCAke3RzLlR5cGVGbGFnc1tmbGFnXX1gO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0eXBlLmZsYWdzID09PSB0cy5UeXBlRmxhZ3MuT2JqZWN0KSB7XG4gICAgY29uc3Qgb2JqVHlwZSA9IHR5cGUgYXMgdHMuT2JqZWN0VHlwZTtcbiAgICAvLyBKdXN0IHRoZSB1bmlxdWUgZmxhZ3MgKHBvd2VycyBvZiB0d28pLiBEZWNsYXJlZCBpbiBzcmMvY29tcGlsZXIvdHlwZXMudHMuXG4gICAgY29uc3Qgb2JqZWN0RmxhZ3M6IHRzLk9iamVjdEZsYWdzW10gPSBbXG4gICAgICB0cy5PYmplY3RGbGFncy5DbGFzcyxcbiAgICAgIHRzLk9iamVjdEZsYWdzLkludGVyZmFjZSxcbiAgICAgIHRzLk9iamVjdEZsYWdzLlJlZmVyZW5jZSxcbiAgICAgIHRzLk9iamVjdEZsYWdzLlR1cGxlLFxuICAgICAgdHMuT2JqZWN0RmxhZ3MuQW5vbnltb3VzLFxuICAgICAgdHMuT2JqZWN0RmxhZ3MuTWFwcGVkLFxuICAgICAgdHMuT2JqZWN0RmxhZ3MuSW5zdGFudGlhdGVkLFxuICAgICAgdHMuT2JqZWN0RmxhZ3MuT2JqZWN0TGl0ZXJhbCxcbiAgICAgIHRzLk9iamVjdEZsYWdzLkV2b2x2aW5nQXJyYXksXG4gICAgICB0cy5PYmplY3RGbGFncy5PYmplY3RMaXRlcmFsUGF0dGVybldpdGhDb21wdXRlZFByb3BlcnRpZXMsXG4gICAgXTtcbiAgICBmb3IgKGNvbnN0IGZsYWcgb2Ygb2JqZWN0RmxhZ3MpIHtcbiAgICAgIGlmICgob2JqVHlwZS5vYmplY3RGbGFncyAmIGZsYWcpICE9PSAwKSB7XG4gICAgICAgIGRlYnVnU3RyaW5nICs9IGAgb2JqZWN0OiR7dHMuT2JqZWN0RmxhZ3NbZmxhZ119YDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAodHlwZS5zeW1ib2wgJiYgdHlwZS5zeW1ib2wubmFtZSAhPT0gJ19fdHlwZScpIHtcbiAgICBkZWJ1Z1N0cmluZyArPSBgIHN5bWJvbC5uYW1lOiR7SlNPTi5zdHJpbmdpZnkodHlwZS5zeW1ib2wubmFtZSl9YDtcbiAgfVxuXG4gIGlmICh0eXBlLnBhdHRlcm4pIHtcbiAgICBkZWJ1Z1N0cmluZyArPSBgIGRlc3RydWN0dXJpbmc6dHJ1ZWA7XG4gIH1cblxuICByZXR1cm4gYHt0eXBlICR7ZGVidWdTdHJpbmd9fWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzeW1ib2xUb0RlYnVnU3RyaW5nKHN5bTogdHMuU3ltYm9sKTogc3RyaW5nIHtcbiAgbGV0IGRlYnVnU3RyaW5nID0gYCR7SlNPTi5zdHJpbmdpZnkoc3ltLm5hbWUpfSBmbGFnczoweCR7c3ltLmZsYWdzLnRvU3RyaW5nKDE2KX1gO1xuXG4gIC8vIEp1c3QgdGhlIHVuaXF1ZSBmbGFncyAocG93ZXJzIG9mIHR3bykuIERlY2xhcmVkIGluIHNyYy9jb21waWxlci90eXBlcy50cy5cbiAgY29uc3Qgc3ltYm9sRmxhZ3MgPSBbXG4gICAgdHMuU3ltYm9sRmxhZ3MuRnVuY3Rpb25TY29wZWRWYXJpYWJsZSxcbiAgICB0cy5TeW1ib2xGbGFncy5CbG9ja1Njb3BlZFZhcmlhYmxlLFxuICAgIHRzLlN5bWJvbEZsYWdzLlByb3BlcnR5LFxuICAgIHRzLlN5bWJvbEZsYWdzLkVudW1NZW1iZXIsXG4gICAgdHMuU3ltYm9sRmxhZ3MuRnVuY3Rpb24sXG4gICAgdHMuU3ltYm9sRmxhZ3MuQ2xhc3MsXG4gICAgdHMuU3ltYm9sRmxhZ3MuSW50ZXJmYWNlLFxuICAgIHRzLlN5bWJvbEZsYWdzLkNvbnN0RW51bSxcbiAgICB0cy5TeW1ib2xGbGFncy5SZWd1bGFyRW51bSxcbiAgICB0cy5TeW1ib2xGbGFncy5WYWx1ZU1vZHVsZSxcbiAgICB0cy5TeW1ib2xGbGFncy5OYW1lc3BhY2VNb2R1bGUsXG4gICAgdHMuU3ltYm9sRmxhZ3MuVHlwZUxpdGVyYWwsXG4gICAgdHMuU3ltYm9sRmxhZ3MuT2JqZWN0TGl0ZXJhbCxcbiAgICB0cy5TeW1ib2xGbGFncy5NZXRob2QsXG4gICAgdHMuU3ltYm9sRmxhZ3MuQ29uc3RydWN0b3IsXG4gICAgdHMuU3ltYm9sRmxhZ3MuR2V0QWNjZXNzb3IsXG4gICAgdHMuU3ltYm9sRmxhZ3MuU2V0QWNjZXNzb3IsXG4gICAgdHMuU3ltYm9sRmxhZ3MuU2lnbmF0dXJlLFxuICAgIHRzLlN5bWJvbEZsYWdzLlR5cGVQYXJhbWV0ZXIsXG4gICAgdHMuU3ltYm9sRmxhZ3MuVHlwZUFsaWFzLFxuICAgIHRzLlN5bWJvbEZsYWdzLkV4cG9ydFZhbHVlLFxuICAgIHRzLlN5bWJvbEZsYWdzLkFsaWFzLFxuICAgIHRzLlN5bWJvbEZsYWdzLlByb3RvdHlwZSxcbiAgICB0cy5TeW1ib2xGbGFncy5FeHBvcnRTdGFyLFxuICAgIHRzLlN5bWJvbEZsYWdzLk9wdGlvbmFsLFxuICAgIHRzLlN5bWJvbEZsYWdzLlRyYW5zaWVudCxcbiAgXTtcbiAgZm9yIChjb25zdCBmbGFnIG9mIHN5bWJvbEZsYWdzKSB7XG4gICAgaWYgKChzeW0uZmxhZ3MgJiBmbGFnKSAhPT0gMCkge1xuICAgICAgZGVidWdTdHJpbmcgKz0gYCAke3RzLlN5bWJvbEZsYWdzW2ZsYWddfWA7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRlYnVnU3RyaW5nO1xufVxuXG4vKiogVHlwZVRyYW5zbGF0b3IgdHJhbnNsYXRlcyBUeXBlU2NyaXB0IHR5cGVzIHRvIENsb3N1cmUgdHlwZXMuICovXG5leHBvcnQgY2xhc3MgVHlwZVRyYW5zbGF0b3Ige1xuICAvKipcbiAgICogQSBsaXN0IG9mIHR5cGUgbGl0ZXJhbHMgd2UndmUgZW5jb3VudGVyZWQgd2hpbGUgZW1pdHRpbmc7IHVzZWQgdG8gYXZvaWQgZ2V0dGluZyBzdHVjayBpblxuICAgKiByZWN1cnNpdmUgdHlwZXMuXG4gICAqL1xuICBwcml2YXRlIHJlYWRvbmx5IHNlZW5Bbm9ueW1vdXNUeXBlcyA9IG5ldyBTZXQ8dHMuVHlwZT4oKTtcblxuICAvKipcbiAgICogV2hldGhlciB0byB3cml0ZSB0eXBlcyBzdWl0YWJsZSBmb3IgYW4gXFxAZXh0ZXJucyBmaWxlLiBFeHRlcm5zIHR5cGVzIG11c3Qgbm90IHJlZmVyIHRvXG4gICAqIG5vbi1leHRlcm5zIHR5cGVzIChpLmUuIG5vbiBhbWJpZW50IHR5cGVzKSBhbmQgbmVlZCB0byB1c2UgZnVsbHkgcXVhbGlmaWVkIG5hbWVzLlxuICAgKi9cbiAgaXNGb3JFeHRlcm5zID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBub2RlIGlzIHRoZSBzb3VyY2UgQVNUIHRzLk5vZGUgdGhlIHR5cGUgY29tZXMgZnJvbS4gIFRoaXMgaXMgdXNlZFxuICAgKiAgICAgaW4gc29tZSBjYXNlcyAoZS5nLiBhbm9ueW1vdXMgdHlwZXMpIGZvciBsb29raW5nIHVwIGZpZWxkIG5hbWVzLlxuICAgKiBAcGFyYW0gcGF0aEJsYWNrTGlzdCBpcyBhIHNldCBvZiBwYXRocyB0aGF0IHNob3VsZCBuZXZlciBnZXQgdHlwZWQ7XG4gICAqICAgICBhbnkgcmVmZXJlbmNlIHRvIHN5bWJvbHMgZGVmaW5lZCBpbiB0aGVzZSBwYXRocyBzaG91bGQgYnkgdHlwZWRcbiAgICogICAgIGFzIHs/fS5cbiAgICogQHBhcmFtIHN5bWJvbHNUb0FsaWFzZWROYW1lcyBhIG1hcHBpbmcgZnJvbSBzeW1ib2xzIChgRm9vYCkgdG8gYSBuYW1lIGluIHNjb3BlIHRoZXkgc2hvdWxkIGJlXG4gICAqICAgICBlbWl0dGVkIGFzIChlLmcuIGB0c2lja2xlX2ZvcndhcmRfZGVjbGFyZV8xLkZvb2ApLiBDYW4gYmUgYXVnbWVudGVkIGR1cmluZyB0eXBlXG4gICAqICAgICB0cmFuc2xhdGlvbiwgZS5nLiB0byBibGFja2xpc3QgYSBzeW1ib2wuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgdHlwZUNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLCBwcml2YXRlIHJlYWRvbmx5IG5vZGU6IHRzLk5vZGUsXG4gICAgICBwcml2YXRlIHJlYWRvbmx5IHBhdGhCbGFja0xpc3Q/OiBTZXQ8c3RyaW5nPixcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgc3ltYm9sc1RvQWxpYXNlZE5hbWVzID0gbmV3IE1hcDx0cy5TeW1ib2wsIHN0cmluZz4oKSxcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgZW5zdXJlU3ltYm9sRGVjbGFyZWQ6IChzeW06IHRzLlN5bWJvbCkgPT4gdm9pZCA9ICgpID0+IHt9KSB7XG4gICAgLy8gTm9ybWFsaXplIHBhdGhzIHRvIG5vdCBicmVhayBjaGVja3Mgb24gV2luZG93cy5cbiAgICBpZiAodGhpcy5wYXRoQmxhY2tMaXN0ICE9IG51bGwpIHtcbiAgICAgIHRoaXMucGF0aEJsYWNrTGlzdCA9XG4gICAgICAgICAgbmV3IFNldDxzdHJpbmc+KEFycmF5LmZyb20odGhpcy5wYXRoQmxhY2tMaXN0LnZhbHVlcygpKS5tYXAocCA9PiBwYXRoLm5vcm1hbGl6ZShwKSkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIHRzLlN5bWJvbCB0byBhIHN0cmluZy5cbiAgICogT3RoZXIgYXBwcm9hY2hlcyB0aGF0IGRvbid0IHdvcms6XG4gICAqIC0gVHlwZUNoZWNrZXIudHlwZVRvU3RyaW5nIHRyYW5zbGF0ZXMgQXJyYXkgYXMgVFtdLlxuICAgKiAtIFR5cGVDaGVja2VyLnN5bWJvbFRvU3RyaW5nIGVtaXRzIHR5cGVzIHdpdGhvdXQgdGhlaXIgbmFtZXNwYWNlLFxuICAgKiAgIGFuZCBkb2Vzbid0IGxldCB5b3UgcGFzcyB0aGUgZmxhZyB0byBjb250cm9sIHRoYXQuXG4gICAqIEBwYXJhbSB1c2VGcW4gd2hldGhlciB0byBzY29wZSB0aGUgbmFtZSB1c2luZyBpdHMgZnVsbHkgcXVhbGlmaWVkIG5hbWUuIENsb3N1cmUncyB0ZW1wbGF0ZVxuICAgKiAgICAgYXJndW1lbnRzIGFyZSBhbHdheXMgc2NvcGVkIHRvIHRoZSBjbGFzcyBjb250YWluaW5nIHRoZW0sIHdoZXJlIFR5cGVTY3JpcHQncyB0ZW1wbGF0ZSBhcmdzXG4gICAqICAgICB3b3VsZCBiZSBmdWxseSBxdWFsaWZpZWQuIEkuZS4gdGhpcyBmbGFnIGlzIGZhbHNlIGZvciBnZW5lcmljIHR5cGVzLlxuICAgKi9cbiAgcHVibGljIHN5bWJvbFRvU3RyaW5nKHN5bTogdHMuU3ltYm9sLCB1c2VGcW46IGJvb2xlYW4pOiBzdHJpbmcge1xuICAgIGlmICh1c2VGcW4gJiYgdGhpcy5pc0ZvckV4dGVybnMpIHtcbiAgICAgIC8vIEZvciByZWd1bGFyIHR5cGUgZW1pdCwgd2UgY2FuIHVzZSBUeXBlU2NyaXB0J3MgbmFtaW5nIHJ1bGVzLCBhcyB0aGV5IG1hdGNoIENsb3N1cmUncyBuYW1lXG4gICAgICAvLyBzY29waW5nIHJ1bGVzLiBIb3dldmVyIHdoZW4gZW1pdHRpbmcgZXh0ZXJucyBmaWxlcyBmb3IgYW1iaWVudHMsIG5hbWluZyBydWxlcyBjaGFuZ2UuIEFzXG4gICAgICAvLyBDbG9zdXJlIGRvZXNuJ3Qgc3VwcG9ydCBleHRlcm5zIG1vZHVsZXMsIGFsbCBuYW1lcyBtdXN0IGJlIGdsb2JhbCBhbmQgdXNlIGdsb2JhbCBmdWxseVxuICAgICAgLy8gcXVhbGlmaWVkIG5hbWVzLiBUaGUgY29kZSBiZWxvdyB1c2VzIFR5cGVTY3JpcHQgdG8gY29udmVydCBhIHN5bWJvbCB0byBhIGZ1bGwgcXVhbGlmaWVkXG4gICAgICAvLyBuYW1lIGFuZCB0aGVuIGVtaXRzIHRoYXQuXG4gICAgICBsZXQgZnFuID0gdGhpcy50eXBlQ2hlY2tlci5nZXRGdWxseVF1YWxpZmllZE5hbWUoc3ltKTtcbiAgICAgIGlmIChmcW4uc3RhcnRzV2l0aChgXCJgKSB8fCBmcW4uc3RhcnRzV2l0aChgJ2ApKSB7XG4gICAgICAgIC8vIFF1b3RlZCBGUU5zIG1lYW4gdGhlIG5hbWUgaXMgZnJvbSBhIG1vZHVsZSwgZS5nLiBgJ3BhdGgvdG8vbW9kdWxlJy5zb21lLnF1YWxpZmllZC5OYW1lYC5cbiAgICAgICAgLy8gdHNpY2tsZSBnZW5lcmFsbHkgcmUtc2NvcGVzIG5hbWVzIGluIG1vZHVsZXMgdGhhdCBhcmUgbW92ZWQgdG8gZXh0ZXJucyBpbnRvIHRoZSBnbG9iYWxcbiAgICAgICAgLy8gbmFtZXNwYWNlLiBUaGF0IGRvZXMgbm90IHF1aXRlIG1hdGNoIFRTJyBzZW1hbnRpY3Mgd2hlcmUgYW1iaWVudCB0eXBlcyBmcm9tIG1vZHVsZXMgYXJlXG4gICAgICAgIC8vIGxvY2FsLiBIb3dldmVyIHZhbHVlIGRlY2xhcmF0aW9ucyB0aGF0IGFyZSBsb2NhbCB0byBtb2R1bGVzIGJ1dCBub3QgZGVmaW5lZCBkbyBub3QgbWFrZVxuICAgICAgICAvLyBzZW5zZSBpZiBub3QgZ2xvYmFsLCBlLmcuIFwiZGVjbGFyZSBjbGFzcyBYIHt9OyBuZXcgWCgpO1wiIGNhbm5vdCB3b3JrIHVubGVzcyBgWGAgaXNcbiAgICAgICAgLy8gYWN0dWFsbHkgYSBnbG9iYWwuXG4gICAgICAgIC8vIFNvIHRoaXMgY29kZSBzdHJpcHMgdGhlIG1vZHVsZSBwYXRoIGZyb20gdGhlIHR5cGUgYW5kIHVzZXMgdGhlIEZRTiBhcyBhIGdsb2JhbC5cbiAgICAgICAgZnFuID0gZnFuLnJlcGxhY2UoL15bXCInXVteXCInXStbJ1wiXVxcLi8sICcnKTtcbiAgICAgIH1cbiAgICAgIC8vIERlY2xhcmF0aW9ucyBpbiBtb2R1bGUgY2FuIHJlLW9wZW4gZ2xvYmFsIHR5cGVzIHVzaW5nIFwiZGVjbGFyZSBnbG9iYWwgeyAuLi4gfVwiLiBUaGUgZnFuXG4gICAgICAvLyB0aGVuIGNvbnRhaW5zIHRoZSBwcmVmaXggXCJnbG9iYWwuXCIgaGVyZS4gQXMgd2UncmUgbWFwcGluZyB0byBnbG9iYWwgdHlwZXMsIGp1c3Qgc3RyaXAgdGhlXG4gICAgICAvLyBwcmVmaXguXG4gICAgICBjb25zdCBpc0luR2xvYmFsID0gKHN5bS5kZWNsYXJhdGlvbnMgfHwgW10pLnNvbWUoZCA9PiB7XG4gICAgICAgIGxldCBjdXJyZW50OiB0cy5Ob2RlfHVuZGVmaW5lZCA9IGQ7XG4gICAgICAgIHdoaWxlIChjdXJyZW50KSB7XG4gICAgICAgICAgaWYgKGN1cnJlbnQuZmxhZ3MgJiB0cy5Ob2RlRmxhZ3MuR2xvYmFsQXVnbWVudGF0aW9uKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSk7XG4gICAgICBpZiAoaXNJbkdsb2JhbCkge1xuICAgICAgICBmcW4gPSBmcW4ucmVwbGFjZSgvXmdsb2JhbFxcLi8sICcnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnN0cmlwQ2x1dHpOYW1lc3BhY2UoZnFuKTtcbiAgICB9XG4gICAgLy8gVHlwZVNjcmlwdCByZXNvbHZlcyBlLmcuIHVuaW9uIHR5cGVzIHRvIHRoZWlyIG1lbWJlcnMsIHdoaWNoIGNhbiBpbmNsdWRlIHN5bWJvbHMgbm90IGRlY2xhcmVkXG4gICAgLy8gaW4gdGhlIGN1cnJlbnQgc2NvcGUuIEVuc3VyZSB0aGF0IGFsbCBzeW1ib2xzIGZvdW5kIHRoaXMgd2F5IGFyZSBhY3R1YWxseSBkZWNsYXJlZC5cbiAgICAvLyBUaGlzIG11c3QgaGFwcGVuIGJlZm9yZSB0aGUgYWxpYXMgY2hlY2sgYmVsb3csIGl0IG1pZ2h0IGludHJvZHVjZSBhIG5ldyBhbGlhcyBmb3IgdGhlIHN5bWJvbC5cbiAgICBpZiAoKHN5bS5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLlR5cGVQYXJhbWV0ZXIpID09PSAwKSB0aGlzLmVuc3VyZVN5bWJvbERlY2xhcmVkKHN5bSk7XG5cbiAgICBsZXQgc3ltQWxpYXMgPSBzeW07XG4gICAgaWYgKHN5bUFsaWFzLmZsYWdzICYgdHMuU3ltYm9sRmxhZ3MuQWxpYXMpIHtcbiAgICAgIHN5bUFsaWFzID0gdGhpcy50eXBlQ2hlY2tlci5nZXRBbGlhc2VkU3ltYm9sKHN5bUFsaWFzKTtcbiAgICB9XG4gICAgY29uc3QgYWxpYXMgPSB0aGlzLnN5bWJvbHNUb0FsaWFzZWROYW1lcy5nZXQoc3ltQWxpYXMpO1xuICAgIGlmIChhbGlhcykgcmV0dXJuIGFsaWFzO1xuXG4gICAgLy8gVGhpcyBmb2xsb3dzIGdldFNpbmdsZUxpbmVTdHJpbmdXcml0ZXIgaW4gdGhlIFR5cGVTY3JpcHQgY29tcGlsZXIuXG4gICAgbGV0IHN0ciA9ICcnO1xuICAgIGNvbnN0IHdyaXRlVGV4dCA9ICh0ZXh0OiBzdHJpbmcpID0+IHN0ciArPSB0ZXh0O1xuICAgIGNvbnN0IGRvTm90aGluZyA9ICgpID0+IHtcbiAgICAgIHJldHVybjtcbiAgICB9O1xuXG4gICAgY29uc3QgYnVpbGRlciA9IHRoaXMudHlwZUNoZWNrZXIuZ2V0U3ltYm9sRGlzcGxheUJ1aWxkZXIoKTtcbiAgICBjb25zdCB3cml0ZXI6IHRzLlN5bWJvbFdyaXRlciA9IHtcbiAgICAgIHdyaXRlS2V5d29yZDogd3JpdGVUZXh0LFxuICAgICAgd3JpdGVPcGVyYXRvcjogd3JpdGVUZXh0LFxuICAgICAgd3JpdGVQdW5jdHVhdGlvbjogd3JpdGVUZXh0LFxuICAgICAgd3JpdGVTcGFjZTogd3JpdGVUZXh0LFxuICAgICAgd3JpdGVTdHJpbmdMaXRlcmFsOiB3cml0ZVRleHQsXG4gICAgICB3cml0ZVBhcmFtZXRlcjogd3JpdGVUZXh0LFxuICAgICAgd3JpdGVQcm9wZXJ0eTogd3JpdGVUZXh0LFxuICAgICAgd3JpdGVTeW1ib2w6IHdyaXRlVGV4dCxcbiAgICAgIHdyaXRlTGluZTogZG9Ob3RoaW5nLFxuICAgICAgaW5jcmVhc2VJbmRlbnQ6IGRvTm90aGluZyxcbiAgICAgIGRlY3JlYXNlSW5kZW50OiBkb05vdGhpbmcsXG4gICAgICBjbGVhcjogZG9Ob3RoaW5nLFxuICAgICAgdHJhY2tTeW1ib2woc3ltYm9sOiB0cy5TeW1ib2wsIGVuY2xvc2luZ0RlY2xhcmF0aW9uPzogdHMuTm9kZSwgbWVhbmluZz86IHRzLlN5bWJvbEZsYWdzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0sXG4gICAgICByZXBvcnRJbmFjY2Vzc2libGVUaGlzRXJyb3I6IGRvTm90aGluZyxcbiAgICAgIHJlcG9ydFByaXZhdGVJbkJhc2VPZkNsYXNzRXhwcmVzc2lvbjogZG9Ob3RoaW5nLFxuICAgIH07XG4gICAgYnVpbGRlci5idWlsZFN5bWJvbERpc3BsYXkoc3ltLCB3cml0ZXIsIHRoaXMubm9kZSk7XG4gICAgcmV0dXJuIHRoaXMuc3RyaXBDbHV0ek5hbWVzcGFjZShzdHIpO1xuICB9XG5cbiAgLy8gQ2x1dHogKGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NsdXR6KSBlbWl0cyBnbG9iYWwgdHlwZSBzeW1ib2xzIGhpZGRlbiBpbiBhIHNwZWNpYWxcbiAgLy8g4LKgX+CyoC5jbHV0eiBuYW1lc3BhY2UuIFdoaWxlIG1vc3QgY29kZSBzZWVuIGJ5IFRzaWNrbGUgd2lsbCBvbmx5IGV2ZXIgc2VlIGxvY2FsIGFsaWFzZXMsIENsdXR6XG4gIC8vIHN5bWJvbHMgY2FuIGJlIHdyaXR0ZW4gYnkgdXNlcnMgZGlyZWN0bHkgaW4gY29kZSwgYW5kIHRoZXkgY2FuIGFwcGVhciBieSBkZXJlZmVyZW5jaW5nXG4gIC8vIFR5cGVBbGlhc2VzLiBUaGUgY29kZSBiZWxvdyBzaW1wbHkgc3RyaXBzIHRoZSBwcmVmaXgsIHRoZSByZW1haW5pbmcgdHlwZSBuYW1lIHRoZW4gbWF0Y2hlc1xuICAvLyBDbG9zdXJlJ3MgdHlwZS5cbiAgcHJpdmF0ZSBzdHJpcENsdXR6TmFtZXNwYWNlKG5hbWU6IHN0cmluZykge1xuICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoJ+CyoF/gsqAuY2x1dHouJykpIHJldHVybiBuYW1lLnN1YnN0cmluZygn4LKgX+CyoC5jbHV0ei4nLmxlbmd0aCk7XG4gICAgcmV0dXJuIG5hbWU7XG4gIH1cblxuICB0cmFuc2xhdGUodHlwZTogdHMuVHlwZSwgcmVzb2x2ZUFsaWFzID0gZmFsc2UpOiBzdHJpbmcge1xuICAgIC8vIE5PVEU6IFRob3VnaCB0eXBlLmZsYWdzIGhhcyB0aGUgbmFtZSBcImZsYWdzXCIsIGl0IHVzdWFsbHkgY2FuIG9ubHkgYmUgb25lXG4gICAgLy8gb2YgdGhlIGVudW0gb3B0aW9ucyBhdCBhIHRpbWUgKGV4Y2VwdCBmb3IgdW5pb25zIG9mIGxpdGVyYWwgdHlwZXMsIGUuZy4gdW5pb25zIG9mIGJvb2xlYW5cbiAgICAvLyB2YWx1ZXMsIHN0cmluZyB2YWx1ZXMsIGVudW0gdmFsdWVzKS4gVGhpcyBzd2l0Y2ggaGFuZGxlcyBhbGwgdGhlIGNhc2VzIGluIHRoZSB0cy5UeXBlRmxhZ3NcbiAgICAvLyBlbnVtIGluIHRoZSBvcmRlciB0aGV5IG9jY3VyLlxuXG4gICAgLy8gTk9URTogU29tZSBUeXBlRmxhZ3MgYXJlIG1hcmtlZCBcImludGVybmFsXCIgaW4gdGhlIGQudHMgYnV0IHN0aWxsIHNob3cgdXAgaW4gdGhlIHZhbHVlIG9mXG4gICAgLy8gdHlwZS5mbGFncy4gVGhpcyBtYXNrIGxpbWl0cyB0aGUgZmxhZyBjaGVja3MgdG8gdGhlIG9uZXMgaW4gdGhlIHB1YmxpYyBBUEkuIFwibGFzdEZsYWdcIiBoZXJlXG4gICAgLy8gaXMgdGhlIGxhc3QgZmxhZyBoYW5kbGVkIGluIHRoaXMgc3dpdGNoIHN0YXRlbWVudCwgYW5kIHNob3VsZCBiZSBrZXB0IGluIHN5bmMgd2l0aFxuICAgIC8vIHR5cGVzY3JpcHQuZC50cy5cblxuICAgIC8vIE5vblByaW1pdGl2ZSBvY2N1cnMgb24gaXRzIG93biBvbiB0aGUgbG93ZXIgY2FzZSBcIm9iamVjdFwiIHR5cGUuIFNwZWNpYWwgY2FzZSB0byBcIiFPYmplY3RcIi5cbiAgICBpZiAodHlwZS5mbGFncyA9PT0gdHMuVHlwZUZsYWdzLk5vblByaW1pdGl2ZSkgcmV0dXJuICchT2JqZWN0JztcblxuICAgIC8vIEF2b2lkIGluZmluaXRlIGxvb3BzIG9uIHJlY3Vyc2l2ZSB0eXBlIGxpdGVyYWxzLlxuICAgIC8vIEl0IHdvdWxkIGJlIG5pY2UgdG8ganVzdCBlbWl0IHRoZSBuYW1lIG9mIHRoZSByZWN1cnNpdmUgdHlwZSBoZXJlIChpbiB0eXBlLmFsaWFzU3ltYm9sXG4gICAgLy8gYmVsb3cpLCBidXQgQ2xvc3VyZSBDb21waWxlciBkb2VzIG5vdCBhbGxvdyByZWN1cnNpdmUgdHlwZSBkZWZpbml0aW9ucy5cbiAgICBpZiAodGhpcy5zZWVuQW5vbnltb3VzVHlwZXMuaGFzKHR5cGUpKSByZXR1cm4gJz8nO1xuXG4gICAgLy8gSWYgdHlwZSBpcyBhbiBhbGlhcywgZS5nLiBmcm9tIHR5cGUgWCA9IEF8QiwgdGhlbiBhbHdheXMgZW1pdCB0aGUgYWxpYXMsIG5vdCB0aGUgdW5kZXJseWluZ1xuICAgIC8vIHVuaW9uIHR5cGUsIGFzIHRoZSBhbGlhcyBpcyB0aGUgdXNlciB2aXNpYmxlLCBpbXBvcnRlZCBzeW1ib2wuXG4gICAgaWYgKCFyZXNvbHZlQWxpYXMgJiYgdHlwZS5hbGlhc1N5bWJvbCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3ltYm9sVG9TdHJpbmcodHlwZS5hbGlhc1N5bWJvbCwgLyogdXNlRnFuICovIHRydWUpO1xuICAgIH1cblxuICAgIGxldCBpc0FtYmllbnQgPSBmYWxzZTtcbiAgICBsZXQgaXNOYW1lc3BhY2UgPSBmYWxzZTtcbiAgICBsZXQgaXNNb2R1bGUgPSBmYWxzZTtcbiAgICBpZiAodHlwZS5zeW1ib2wpIHtcbiAgICAgIGZvciAoY29uc3QgZGVjbCBvZiB0eXBlLnN5bWJvbC5kZWNsYXJhdGlvbnMgfHwgW10pIHtcbiAgICAgICAgaWYgKHRzLmlzRXh0ZXJuYWxNb2R1bGUoZGVjbC5nZXRTb3VyY2VGaWxlKCkpKSBpc01vZHVsZSA9IHRydWU7XG4gICAgICAgIGxldCBjdXJyZW50OiB0cy5Ob2RlfHVuZGVmaW5lZCA9IGRlY2w7XG4gICAgICAgIHdoaWxlIChjdXJyZW50KSB7XG4gICAgICAgICAgaWYgKHRzLmdldENvbWJpbmVkTW9kaWZpZXJGbGFncyhjdXJyZW50KSAmIHRzLk1vZGlmaWVyRmxhZ3MuQW1iaWVudCkgaXNBbWJpZW50ID0gdHJ1ZTtcbiAgICAgICAgICBpZiAoY3VycmVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLk1vZHVsZURlY2xhcmF0aW9uKSBpc05hbWVzcGFjZSA9IHRydWU7XG4gICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gdHNpY2tsZSBjYW5ub3QgZ2VuZXJhdGUgdHlwZXMgZm9yIG5vbi1hbWJpZW50IG5hbWVzcGFjZXMuXG4gICAgaWYgKGlzTmFtZXNwYWNlICYmICFpc0FtYmllbnQpIHJldHVybiAnPyc7XG5cbiAgICAvLyBUeXBlcyBpbiBleHRlcm5zIGNhbm5vdCByZWZlcmVuY2UgdHlwZXMgZnJvbSBleHRlcm5hbCBtb2R1bGVzLlxuICAgIC8vIEhvd2V2ZXIgYW1iaWVudCB0eXBlcyBpbiBtb2R1bGVzIGdldCBtb3ZlZCB0byBleHRlcm5zLCB0b28sIHNvIHR5cGUgcmVmZXJlbmNlcyB3b3JrIGFuZCB3ZVxuICAgIC8vIGNhbiBlbWl0IGEgcHJlY2lzZSB0eXBlLlxuICAgIGlmICh0aGlzLmlzRm9yRXh0ZXJucyAmJiBpc01vZHVsZSAmJiAhaXNBbWJpZW50KSByZXR1cm4gJz8nO1xuXG4gICAgY29uc3QgbGFzdEZsYWcgPSB0cy5UeXBlRmxhZ3MuSW5kZXhlZEFjY2VzcztcbiAgICBjb25zdCBtYXNrID0gKGxhc3RGbGFnIDw8IDEpIC0gMTtcbiAgICBzd2l0Y2ggKHR5cGUuZmxhZ3MgJiBtYXNrKSB7XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5Bbnk6XG4gICAgICAgIHJldHVybiAnPyc7XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5TdHJpbmc6XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5TdHJpbmdMaXRlcmFsOlxuICAgICAgICByZXR1cm4gJ3N0cmluZyc7XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5OdW1iZXI6XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5OdW1iZXJMaXRlcmFsOlxuICAgICAgICByZXR1cm4gJ251bWJlcic7XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5Cb29sZWFuOlxuICAgICAgY2FzZSB0cy5UeXBlRmxhZ3MuQm9vbGVhbkxpdGVyYWw6XG4gICAgICAgIC8vIFNlZSB0aGUgbm90ZSBpbiB0cmFuc2xhdGVVbmlvbiBhYm91dCBib29sZWFucy5cbiAgICAgICAgcmV0dXJuICdib29sZWFuJztcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLkVudW06XG4gICAgICAgIGlmICghdHlwZS5zeW1ib2wpIHtcbiAgICAgICAgICB0aGlzLndhcm4oYEVudW1UeXBlIHdpdGhvdXQgYSBzeW1ib2xgKTtcbiAgICAgICAgICByZXR1cm4gJz8nO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnN5bWJvbFRvU3RyaW5nKHR5cGUuc3ltYm9sLCB0cnVlKTtcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLkVTU3ltYm9sOlxuICAgICAgICAvLyBOT1RFOiBjdXJyZW50bHkgdGhpcyBpcyBqdXN0IGEgdHlwZWRlZiBmb3Igez99LCBzaHJ1Zy5cbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS9jbG9zdXJlLWNvbXBpbGVyL2Jsb2IvNTVjZjQzZWUzMWU4MGQ4OWQ3MDg3YWY2NWI1NTQyYWE2Mzk4Nzg3NC9leHRlcm5zL2VzMy5qcyNMMzRcbiAgICAgICAgcmV0dXJuICdzeW1ib2wnO1xuICAgICAgY2FzZSB0cy5UeXBlRmxhZ3MuVm9pZDpcbiAgICAgICAgcmV0dXJuICd2b2lkJztcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLlVuZGVmaW5lZDpcbiAgICAgICAgcmV0dXJuICd1bmRlZmluZWQnO1xuICAgICAgY2FzZSB0cy5UeXBlRmxhZ3MuTnVsbDpcbiAgICAgICAgcmV0dXJuICdudWxsJztcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLk5ldmVyOlxuICAgICAgICB0aGlzLndhcm4oYHNob3VsZCBub3QgZW1pdCBhICduZXZlcicgdHlwZWApO1xuICAgICAgICByZXR1cm4gJz8nO1xuICAgICAgY2FzZSB0cy5UeXBlRmxhZ3MuVHlwZVBhcmFtZXRlcjpcbiAgICAgICAgLy8gVGhpcyBpcyBlLmcuIHRoZSBUIGluIGEgdHlwZSBsaWtlIEZvbzxUPi5cbiAgICAgICAgaWYgKCF0eXBlLnN5bWJvbCkge1xuICAgICAgICAgIHRoaXMud2FybihgVHlwZVBhcmFtZXRlciB3aXRob3V0IGEgc3ltYm9sYCk7ICAvLyBzaG91bGQgbm90IGhhcHBlbiAodG0pXG4gICAgICAgICAgcmV0dXJuICc/JztcbiAgICAgICAgfVxuICAgICAgICAvLyBJbiBDbG9zdXJlIENvbXBpbGVyLCB0eXBlIHBhcmFtZXRlcnMgKmFyZSogc2NvcGVkIHRvIHRoZWlyIGNvbnRhaW5pbmcgY2xhc3MuXG4gICAgICAgIGNvbnN0IHVzZUZxbiA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gdGhpcy5zeW1ib2xUb1N0cmluZyh0eXBlLnN5bWJvbCwgdXNlRnFuKTtcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLk9iamVjdDpcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNsYXRlT2JqZWN0KHR5cGUgYXMgdHMuT2JqZWN0VHlwZSk7XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5VbmlvbjpcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNsYXRlVW5pb24odHlwZSBhcyB0cy5VbmlvblR5cGUpO1xuICAgICAgY2FzZSB0cy5UeXBlRmxhZ3MuSW50ZXJzZWN0aW9uOlxuICAgICAgY2FzZSB0cy5UeXBlRmxhZ3MuSW5kZXg6XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5JbmRleGVkQWNjZXNzOlxuICAgICAgICAvLyBUT0RPKHRzMi4xKTogaGFuZGxlIHRoZXNlIHNwZWNpYWwgdHlwZXMuXG4gICAgICAgIHRoaXMud2FybihgdW5oYW5kbGVkIHR5cGUgZmxhZ3M6ICR7dHMuVHlwZUZsYWdzW3R5cGUuZmxhZ3NdfWApO1xuICAgICAgICByZXR1cm4gJz8nO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gSGFuZGxlIGNhc2VzIHdoZXJlIG11bHRpcGxlIGZsYWdzIGFyZSBzZXQuXG5cbiAgICAgICAgLy8gVHlwZXMgd2l0aCBsaXRlcmFsIG1lbWJlcnMgYXJlIHJlcHJlc2VudGVkIGFzXG4gICAgICAgIC8vICAgdHMuVHlwZUZsYWdzLlVuaW9uIHwgW2xpdGVyYWwgbWVtYmVyXVxuICAgICAgICAvLyBFLmcuIGFuIGVudW0gdHlwZWQgdmFsdWUgaXMgYSB1bmlvbiB0eXBlIHdpdGggdGhlIGVudW0ncyBtZW1iZXJzIGFzIGl0cyBtZW1iZXJzLiBBXG4gICAgICAgIC8vIGJvb2xlYW4gdHlwZSBpcyBhIHVuaW9uIHR5cGUgd2l0aCAndHJ1ZScgYW5kICdmYWxzZScgYXMgaXRzIG1lbWJlcnMuXG4gICAgICAgIC8vIE5vdGUgYWxzbyB0aGF0IGluIGEgbW9yZSBjb21wbGV4IHVuaW9uLCBlLmcuIGJvb2xlYW58bnVtYmVyLCB0aGVuIGl0J3MgYSB1bmlvbiBvZiB0aHJlZVxuICAgICAgICAvLyB0aGluZ3MgKHRydWV8ZmFsc2V8bnVtYmVyKSBhbmQgdHMuVHlwZUZsYWdzLkJvb2xlYW4gZG9lc24ndCBzaG93IHVwIGF0IGFsbC5cbiAgICAgICAgaWYgKHR5cGUuZmxhZ3MgJiB0cy5UeXBlRmxhZ3MuVW5pb24pIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy50cmFuc2xhdGVVbmlvbih0eXBlIGFzIHRzLlVuaW9uVHlwZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZS5mbGFncyAmIHRzLlR5cGVGbGFncy5FbnVtTGl0ZXJhbCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnRyYW5zbGF0ZUVudW1MaXRlcmFsKHR5cGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIHN3aXRjaCBzdGF0ZW1lbnQgc2hvdWxkIGhhdmUgYmVlbiBleGhhdXN0aXZlLlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHVua25vd24gdHlwZSBmbGFncyAke3R5cGUuZmxhZ3N9IG9uICR7dHlwZVRvRGVidWdTdHJpbmcodHlwZSl9YCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSB0cmFuc2xhdGVVbmlvbih0eXBlOiB0cy5VbmlvblR5cGUpOiBzdHJpbmcge1xuICAgIGxldCBwYXJ0cyA9IHR5cGUudHlwZXMubWFwKHQgPT4gdGhpcy50cmFuc2xhdGUodCkpO1xuICAgIC8vIFVuaW9uIHR5cGVzIHRoYXQgaW5jbHVkZSBsaXRlcmFscyAoZS5nLiBib29sZWFuLCBlbnVtKSBjYW4gZW5kIHVwIHJlcGVhdGluZyB0aGUgc2FtZSBDbG9zdXJlXG4gICAgLy8gdHlwZS4gRm9yIGV4YW1wbGU6IHRydWUgfCBib29sZWFuIHdpbGwgYmUgdHJhbnNsYXRlZCB0byBib29sZWFuIHwgYm9vbGVhbi5cbiAgICAvLyBSZW1vdmUgZHVwbGljYXRlcyB0byBwcm9kdWNlIHR5cGVzIHRoYXQgcmVhZCBiZXR0ZXIuXG4gICAgcGFydHMgPSBwYXJ0cy5maWx0ZXIoKGVsLCBpZHgpID0+IHBhcnRzLmluZGV4T2YoZWwpID09PSBpZHgpO1xuICAgIHJldHVybiBwYXJ0cy5sZW5ndGggPT09IDEgPyBwYXJ0c1swXSA6IGAoJHtwYXJ0cy5qb2luKCd8Jyl9KWA7XG4gIH1cblxuICBwcml2YXRlIHRyYW5zbGF0ZUVudW1MaXRlcmFsKHR5cGU6IHRzLlR5cGUpOiBzdHJpbmcge1xuICAgIC8vIFN1cHBvc2UgeW91IGhhZDpcbiAgICAvLyAgIGVudW0gRW51bVR5cGUgeyBNRU1CRVIgfVxuICAgIC8vIHRoZW4gdGhlIHR5cGUgb2YgXCJFbnVtVHlwZS5NRU1CRVJcIiBpcyBhbiBlbnVtIGxpdGVyYWwgKHRoZSB0aGluZyBwYXNzZWQgdG8gdGhpcyBmdW5jdGlvbilcbiAgICAvLyBhbmQgaXQgaGFzIHR5cGUgZmxhZ3MgdGhhdCBpbmNsdWRlXG4gICAgLy8gICB0cy5UeXBlRmxhZ3MuTnVtYmVyTGl0ZXJhbCB8IHRzLlR5cGVGbGFncy5FbnVtTGl0ZXJhbFxuICAgIC8vXG4gICAgLy8gQ2xvc3VyZSBDb21waWxlciBkb2Vzbid0IHN1cHBvcnQgbGl0ZXJhbHMgaW4gdHlwZXMsIHNvIHRoaXMgY29kZSBtdXN0IG5vdCBlbWl0XG4gICAgLy8gXCJFbnVtVHlwZS5NRU1CRVJcIiwgYnV0IHJhdGhlciBcIkVudW1UeXBlXCIuXG5cbiAgICBjb25zdCBlbnVtTGl0ZXJhbEJhc2VUeXBlID0gdGhpcy50eXBlQ2hlY2tlci5nZXRCYXNlVHlwZU9mTGl0ZXJhbFR5cGUodHlwZSk7XG4gICAgaWYgKCFlbnVtTGl0ZXJhbEJhc2VUeXBlLnN5bWJvbCkge1xuICAgICAgdGhpcy53YXJuKGBFbnVtTGl0ZXJhbFR5cGUgd2l0aG91dCBhIHN5bWJvbGApO1xuICAgICAgcmV0dXJuICc/JztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc3ltYm9sVG9TdHJpbmcoZW51bUxpdGVyYWxCYXNlVHlwZS5zeW1ib2wsIHRydWUpO1xuICB9XG5cbiAgLy8gdHJhbnNsYXRlT2JqZWN0IHRyYW5zbGF0ZXMgYSB0cy5PYmplY3RUeXBlLCB3aGljaCBpcyB0aGUgdHlwZSBvZiBhbGxcbiAgLy8gb2JqZWN0LWxpa2UgdGhpbmdzIGluIFRTLCBzdWNoIGFzIGNsYXNzZXMgYW5kIGludGVyZmFjZXMuXG4gIHByaXZhdGUgdHJhbnNsYXRlT2JqZWN0KHR5cGU6IHRzLk9iamVjdFR5cGUpOiBzdHJpbmcge1xuICAgIGlmICh0eXBlLnN5bWJvbCAmJiB0aGlzLmlzQmxhY2tMaXN0ZWQodHlwZS5zeW1ib2wpKSByZXR1cm4gJz8nO1xuXG4gICAgLy8gTk9URTogb2JqZWN0RmxhZ3MgaXMgYW4gZW51bSwgYnV0IGEgZ2l2ZW4gdHlwZSBjYW4gaGF2ZSBtdWx0aXBsZSBmbGFncy5cbiAgICAvLyBBcnJheTxzdHJpbmc+IGlzIGJvdGggdHMuT2JqZWN0RmxhZ3MuUmVmZXJlbmNlIGFuZCB0cy5PYmplY3RGbGFncy5JbnRlcmZhY2UuXG5cbiAgICBpZiAodHlwZS5vYmplY3RGbGFncyAmIHRzLk9iamVjdEZsYWdzLkNsYXNzKSB7XG4gICAgICBpZiAoIXR5cGUuc3ltYm9sKSB7XG4gICAgICAgIHRoaXMud2FybignY2xhc3MgaGFzIG5vIHN5bWJvbCcpO1xuICAgICAgICByZXR1cm4gJz8nO1xuICAgICAgfVxuICAgICAgcmV0dXJuICchJyArIHRoaXMuc3ltYm9sVG9TdHJpbmcodHlwZS5zeW1ib2wsIC8qIHVzZUZxbiAqLyB0cnVlKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUub2JqZWN0RmxhZ3MgJiB0cy5PYmplY3RGbGFncy5JbnRlcmZhY2UpIHtcbiAgICAgIC8vIE5vdGU6IHRzLkludGVyZmFjZVR5cGUgaGFzIGEgdHlwZVBhcmFtZXRlcnMgZmllbGQsIGJ1dCB0aGF0XG4gICAgICAvLyBzcGVjaWZpZXMgdGhlIHBhcmFtZXRlcnMgdGhhdCB0aGUgaW50ZXJmYWNlIHR5cGUgKmV4cGVjdHMqXG4gICAgICAvLyB3aGVuIGl0J3MgdXNlZCwgYW5kIHNob3VsZCBub3QgYmUgdHJhbnNmb3JtZWQgdG8gdGhlIG91dHB1dC5cbiAgICAgIC8vIEUuZy4gYSB0eXBlIGxpa2UgQXJyYXk8bnVtYmVyPiBpcyBhIFR5cGVSZWZlcmVuY2UgdG8gdGhlXG4gICAgICAvLyBJbnRlcmZhY2VUeXBlIFwiQXJyYXlcIiwgYnV0IHRoZSBcIm51bWJlclwiIHR5cGUgcGFyYW1ldGVyIGlzXG4gICAgICAvLyBwYXJ0IG9mIHRoZSBvdXRlciBUeXBlUmVmZXJlbmNlLCBub3QgYSB0eXBlUGFyYW1ldGVyIG9uXG4gICAgICAvLyB0aGUgSW50ZXJmYWNlVHlwZS5cbiAgICAgIGlmICghdHlwZS5zeW1ib2wpIHtcbiAgICAgICAgdGhpcy53YXJuKCdpbnRlcmZhY2UgaGFzIG5vIHN5bWJvbCcpO1xuICAgICAgICByZXR1cm4gJz8nO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGUuc3ltYm9sLmZsYWdzICYgdHMuU3ltYm9sRmxhZ3MuVmFsdWUpIHtcbiAgICAgICAgLy8gVGhlIHN5bWJvbCBpcyBib3RoIGEgdHlwZSBhbmQgYSB2YWx1ZS5cbiAgICAgICAgLy8gRm9yIHVzZXItZGVmaW5lZCB0eXBlcyBpbiB0aGlzIHN0YXRlLCB3ZSBkb24ndCBoYXZlIGEgQ2xvc3VyZSBuYW1lXG4gICAgICAgIC8vIGZvciB0aGUgdHlwZS4gIFNlZSB0aGUgdHlwZV9hbmRfdmFsdWUgdGVzdC5cbiAgICAgICAgaWYgKCFpc0Nsb3N1cmVQcm92aWRlZFR5cGUodHlwZS5zeW1ib2wpKSB7XG4gICAgICAgICAgdGhpcy53YXJuKGB0eXBlL3N5bWJvbCBjb25mbGljdCBmb3IgJHt0eXBlLnN5bWJvbC5uYW1lfSwgdXNpbmcgez99IGZvciBub3dgKTtcbiAgICAgICAgICByZXR1cm4gJz8nO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gJyEnICsgdGhpcy5zeW1ib2xUb1N0cmluZyh0eXBlLnN5bWJvbCwgLyogdXNlRnFuICovIHRydWUpO1xuICAgIH0gZWxzZSBpZiAodHlwZS5vYmplY3RGbGFncyAmIHRzLk9iamVjdEZsYWdzLlJlZmVyZW5jZSkge1xuICAgICAgLy8gQSByZWZlcmVuY2UgdG8gYW5vdGhlciB0eXBlLCBlLmcuIEFycmF5PG51bWJlcj4gcmVmZXJzIHRvIEFycmF5LlxuICAgICAgLy8gRW1pdCB0aGUgcmVmZXJlbmNlZCB0eXBlIGFuZCBhbnkgdHlwZSBhcmd1bWVudHMuXG4gICAgICBjb25zdCByZWZlcmVuY2VUeXBlID0gdHlwZSBhcyB0cy5UeXBlUmVmZXJlbmNlO1xuXG4gICAgICAvLyBBIHR1cGxlIGlzIGEgUmVmZXJlbmNlVHlwZSB3aGVyZSB0aGUgdGFyZ2V0IGlzIGZsYWdnZWQgVHVwbGUgYW5kIHRoZVxuICAgICAgLy8gdHlwZUFyZ3VtZW50cyBhcmUgdGhlIHR1cGxlIGFyZ3VtZW50cy4gIEp1c3QgdHJlYXQgaXQgYXMgYSBteXN0ZXJ5XG4gICAgICAvLyBhcnJheSwgYmVjYXVzZSBDbG9zdXJlIGRvZXNuJ3QgdW5kZXJzdGFuZCB0dXBsZXMuXG4gICAgICBpZiAocmVmZXJlbmNlVHlwZS50YXJnZXQub2JqZWN0RmxhZ3MgJiB0cy5PYmplY3RGbGFncy5UdXBsZSkge1xuICAgICAgICByZXR1cm4gJyFBcnJheTw/Pic7XG4gICAgICB9XG5cbiAgICAgIGxldCB0eXBlU3RyID0gJyc7XG4gICAgICBpZiAocmVmZXJlbmNlVHlwZS50YXJnZXQgPT09IHJlZmVyZW5jZVR5cGUpIHtcbiAgICAgICAgLy8gV2UgZ2V0IGludG8gYW4gaW5maW5pdGUgbG9vcCBoZXJlIGlmIHRoZSBpbm5lciByZWZlcmVuY2UgaXNcbiAgICAgICAgLy8gdGhlIHNhbWUgYXMgdGhlIG91dGVyOyB0aGlzIGNhbiBvY2N1ciB3aGVuIHRoaXMgZnVuY3Rpb25cbiAgICAgICAgLy8gZmFpbHMgdG8gdHJhbnNsYXRlIGEgbW9yZSBzcGVjaWZpYyB0eXBlIGJlZm9yZSBnZXR0aW5nIHRvXG4gICAgICAgIC8vIHRoaXMgcG9pbnQuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGByZWZlcmVuY2UgbG9vcCBpbiAke3R5cGVUb0RlYnVnU3RyaW5nKHJlZmVyZW5jZVR5cGUpfSAke3JlZmVyZW5jZVR5cGUuZmxhZ3N9YCk7XG4gICAgICB9XG4gICAgICB0eXBlU3RyICs9IHRoaXMudHJhbnNsYXRlKHJlZmVyZW5jZVR5cGUudGFyZ2V0KTtcbiAgICAgIC8vIFRyYW5zbGF0ZSBjYW4gcmV0dXJuICc/JyBmb3IgYSBudW1iZXIgb2Ygc2l0dWF0aW9ucywgZS5nLiB0eXBlL3ZhbHVlIGNvbmZsaWN0cy5cbiAgICAgIC8vIGA/PD8+YCBpcyBpbGxlZ2FsIHN5bnRheCBpbiBDbG9zdXJlIENvbXBpbGVyLCBzbyBqdXN0IHJldHVybiBgP2AgaGVyZS5cbiAgICAgIGlmICh0eXBlU3RyID09PSAnPycpIHJldHVybiAnPyc7XG4gICAgICBpZiAocmVmZXJlbmNlVHlwZS50eXBlQXJndW1lbnRzKSB7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IHJlZmVyZW5jZVR5cGUudHlwZUFyZ3VtZW50cy5tYXAodCA9PiB0aGlzLnRyYW5zbGF0ZSh0KSk7XG4gICAgICAgIHR5cGVTdHIgKz0gYDwke3BhcmFtcy5qb2luKCcsICcpfT5gO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHR5cGVTdHI7XG4gICAgfSBlbHNlIGlmICh0eXBlLm9iamVjdEZsYWdzICYgdHMuT2JqZWN0RmxhZ3MuQW5vbnltb3VzKSB7XG4gICAgICBpZiAoIXR5cGUuc3ltYm9sKSB7XG4gICAgICAgIC8vIFRoaXMgY29tZXMgdXAgd2hlbiBnZW5lcmF0aW5nIGNvZGUgZm9yIGFuIGFycm93IGZ1bmN0aW9uIGFzIHBhc3NlZFxuICAgICAgICAvLyB0byBhIGdlbmVyaWMgZnVuY3Rpb24uICBUaGUgcGFzc2VkLWluIHR5cGUgaXMgdGFnZ2VkIGFzIGFub255bW91c1xuICAgICAgICAvLyBhbmQgaGFzIG5vIHByb3BlcnRpZXMgc28gaXQncyBoYXJkIHRvIGZpZ3VyZSBvdXQgd2hhdCB0byBnZW5lcmF0ZS5cbiAgICAgICAgLy8gSnVzdCBhdm9pZCBpdCBmb3Igbm93IHNvIHdlIGRvbid0IGNyYXNoLlxuICAgICAgICB0aGlzLndhcm4oJ2Fub255bW91cyB0eXBlIGhhcyBubyBzeW1ib2wnKTtcbiAgICAgICAgcmV0dXJuICc/JztcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGUuc3ltYm9sLmZsYWdzICYgdHMuU3ltYm9sRmxhZ3MuRnVuY3Rpb24gfHxcbiAgICAgICAgICB0eXBlLnN5bWJvbC5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLk1ldGhvZCkge1xuICAgICAgICBjb25zdCBzaWdzID0gdGhpcy50eXBlQ2hlY2tlci5nZXRTaWduYXR1cmVzT2ZUeXBlKHR5cGUsIHRzLlNpZ25hdHVyZUtpbmQuQ2FsbCk7XG4gICAgICAgIGlmIChzaWdzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnNpZ25hdHVyZVRvQ2xvc3VyZShzaWdzWzBdKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLndhcm4oJ3VuaGFuZGxlZCBhbm9ueW1vdXMgdHlwZSB3aXRoIG11bHRpcGxlIGNhbGwgc2lnbmF0dXJlcycpO1xuICAgICAgICByZXR1cm4gJz8nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNsYXRlQW5vbnltb3VzVHlwZSh0eXBlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKlxuICAgIFRPRE8odHMyLjEpOiBtb3JlIHVuaGFuZGxlZCBvYmplY3QgdHlwZSBmbGFnczpcbiAgICAgIFR1cGxlXG4gICAgICBNYXBwZWRcbiAgICAgIEluc3RhbnRpYXRlZFxuICAgICAgT2JqZWN0TGl0ZXJhbFxuICAgICAgRXZvbHZpbmdBcnJheVxuICAgICAgT2JqZWN0TGl0ZXJhbFBhdHRlcm5XaXRoQ29tcHV0ZWRQcm9wZXJ0aWVzXG4gICAgKi9cbiAgICB0aGlzLndhcm4oYHVuaGFuZGxlZCB0eXBlICR7dHlwZVRvRGVidWdTdHJpbmcodHlwZSl9YCk7XG4gICAgcmV0dXJuICc/JztcbiAgfVxuXG4gIC8qKlxuICAgKiB0cmFuc2xhdGVBbm9ueW1vdXNUeXBlIHRyYW5zbGF0ZXMgYSB0cy5UeXBlRmxhZ3MuT2JqZWN0VHlwZSB0aGF0IGlzIGFsc29cbiAgICogdHMuT2JqZWN0RmxhZ3MuQW5vbnltb3VzLiBUaGF0IGlzLCB0aGlzIHR5cGUncyBzeW1ib2wgZG9lcyBub3QgaGF2ZSBhIG5hbWUuIFRoaXMgaXMgdGhlXG4gICAqIGFub255bW91cyB0eXBlIGVuY291bnRlcmVkIGluIGUuZy5cbiAgICogICAgIGxldCB4OiB7YTogbnVtYmVyfTtcbiAgICogQnV0IGFsc28gdGhlIGluZmVycmVkIHR5cGUgaW46XG4gICAqICAgICBsZXQgeCA9IHthOiAxfTsgIC8vIHR5cGUgb2YgeCBpcyB7YTogbnVtYmVyfSwgYXMgYWJvdmVcbiAgICovXG4gIHByaXZhdGUgdHJhbnNsYXRlQW5vbnltb3VzVHlwZSh0eXBlOiB0cy5UeXBlKTogc3RyaW5nIHtcbiAgICB0aGlzLnNlZW5Bbm9ueW1vdXNUeXBlcy5hZGQodHlwZSk7XG4gICAgLy8gR2F0aGVyIHVwIGFsbCB0aGUgbmFtZWQgZmllbGRzIGFuZCB3aGV0aGVyIHRoZSBvYmplY3QgaXMgYWxzbyBjYWxsYWJsZS5cbiAgICBsZXQgY2FsbGFibGUgPSBmYWxzZTtcbiAgICBsZXQgaW5kZXhhYmxlID0gZmFsc2U7XG4gICAgY29uc3QgZmllbGRzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGlmICghdHlwZS5zeW1ib2wgfHwgIXR5cGUuc3ltYm9sLm1lbWJlcnMpIHtcbiAgICAgIHRoaXMud2FybignYW5vbnltb3VzIHR5cGUgaGFzIG5vIHN5bWJvbCcpO1xuICAgICAgcmV0dXJuICc/JztcbiAgICB9XG5cbiAgICAvLyBzcGVjaWFsLWNhc2UgY29uc3RydWN0IHNpZ25hdHVyZXMuXG4gICAgY29uc3QgY3RvcnMgPSB0eXBlLmdldENvbnN0cnVjdFNpZ25hdHVyZXMoKTtcbiAgICBpZiAoY3RvcnMubGVuZ3RoKSB7XG4gICAgICAvLyBUT0RPKG1hcnRpbnByb2JzdCk6IHRoaXMgZG9lcyBub3Qgc3VwcG9ydCBhZGRpdGlvbmFsIHByb3BlcnRpZXMgZGVmaW5lZCBvbiBjb25zdHJ1Y3RvcnNcbiAgICAgIC8vIChub3QgZXhwcmVzc2libGUgaW4gQ2xvc3VyZSksIG5vciBtdWx0aXBsZSBjb25zdHJ1Y3RvcnMgKHNhbWUpLlxuXG4gICAgICBpZiAoIWN0b3JzWzBdLmRlY2xhcmF0aW9uKSB7XG4gICAgICAgIHRoaXMud2FybigndW5oYW5kbGVkIGFub255bW91cyB0eXBlIHdpdGggY29uc3RydWN0b3Igc2lnbmF0dXJlIGJ1dCBubyBkZWNsYXJhdGlvbicpO1xuICAgICAgICByZXR1cm4gJz8nO1xuICAgICAgfVxuICAgICAgY29uc3QgcGFyYW1zID0gdGhpcy5jb252ZXJ0UGFyYW1zKGN0b3JzWzBdLCBjdG9yc1swXS5kZWNsYXJhdGlvbi5wYXJhbWV0ZXJzKTtcbiAgICAgIGNvbnN0IHBhcmFtc1N0ciA9IHBhcmFtcy5sZW5ndGggPyAoJywgJyArIHBhcmFtcy5qb2luKCcsICcpKSA6ICcnO1xuICAgICAgY29uc3QgY29uc3RydWN0ZWRUeXBlID0gdGhpcy50cmFuc2xhdGUoY3RvcnNbMF0uZ2V0UmV0dXJuVHlwZSgpKTtcbiAgICAgIC8vIEluIHRoZSBzcGVjaWZpYyBjYXNlIG9mIHRoZSBcIm5ld1wiIGluIGEgZnVuY3Rpb24sIGl0IGFwcGVhcnMgdGhhdFxuICAgICAgLy8gICBmdW5jdGlvbihuZXc6ICFCYXIpXG4gICAgICAvLyBmYWlscyB0byBwYXJzZSwgd2hpbGVcbiAgICAgIC8vICAgZnVuY3Rpb24obmV3OiAoIUJhcikpXG4gICAgICAvLyBwYXJzZXMgaW4gdGhlIHdheSB5b3UnZCBleHBlY3QuXG4gICAgICAvLyBJdCBhcHBlYXJzIGZyb20gdGVzdGluZyB0aGF0IENsb3N1cmUgaWdub3JlcyB0aGUgISBhbnl3YXkgYW5kIGp1c3RcbiAgICAgIC8vIGFzc3VtZXMgdGhlIHJlc3VsdCB3aWxsIGJlIG5vbi1udWxsIGluIGVpdGhlciBjYXNlLiAgKFRvIGJlIHBlZGFudGljLFxuICAgICAgLy8gaXQncyBwb3NzaWJsZSB0byByZXR1cm4gbnVsbCBmcm9tIGEgY3RvciBpdCBzZWVtcyBsaWtlIGEgYmFkIGlkZWEuKVxuICAgICAgcmV0dXJuIGBmdW5jdGlvbihuZXc6ICgke2NvbnN0cnVjdGVkVHlwZX0pJHtwYXJhbXNTdHJ9KTogP2A7XG4gICAgfVxuXG4gICAgLy8gbWVtYmVycyBpcyBhbiBFUzYgbWFwLCBidXQgdGhlIC5kLnRzIGRlZmluaW5nIGl0IGRlZmluZWQgdGhlaXIgb3duIG1hcFxuICAgIC8vIHR5cGUsIHNvIHR5cGVzY3JpcHQgZG9lc24ndCBiZWxpZXZlIHRoYXQgLmtleXMoKSBpcyBpdGVyYWJsZVxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICBmb3IgKGNvbnN0IGZpZWxkIG9mICh0eXBlLnN5bWJvbC5tZW1iZXJzLmtleXMoKSBhcyBhbnkpKSB7XG4gICAgICBzd2l0Y2ggKGZpZWxkKSB7XG4gICAgICAgIGNhc2UgJ19fY2FsbCc6XG4gICAgICAgICAgY2FsbGFibGUgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdfX2luZGV4JzpcbiAgICAgICAgICBpbmRleGFibGUgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGNvbnN0IG1lbWJlciA9IHR5cGUuc3ltYm9sLm1lbWJlcnMuZ2V0KGZpZWxkKSE7XG4gICAgICAgICAgLy8gb3B0aW9uYWwgbWVtYmVycyBhcmUgaGFuZGxlZCBieSB0aGUgdHlwZSBpbmNsdWRpbmcgfHVuZGVmaW5lZCBpbiBhIHVuaW9uIHR5cGUuXG4gICAgICAgICAgY29uc3QgbWVtYmVyVHlwZSA9XG4gICAgICAgICAgICAgIHRoaXMudHJhbnNsYXRlKHRoaXMudHlwZUNoZWNrZXIuZ2V0VHlwZU9mU3ltYm9sQXRMb2NhdGlvbihtZW1iZXIsIHRoaXMubm9kZSkpO1xuICAgICAgICAgIGZpZWxkcy5wdXNoKGAke2ZpZWxkfTogJHttZW1iZXJUeXBlfWApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRyeSB0byBzcGVjaWFsLWNhc2UgcGxhaW4ga2V5LXZhbHVlIG9iamVjdHMgYW5kIGZ1bmN0aW9ucy5cbiAgICBpZiAoZmllbGRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgaWYgKGNhbGxhYmxlICYmICFpbmRleGFibGUpIHtcbiAgICAgICAgLy8gQSBmdW5jdGlvbiB0eXBlLlxuICAgICAgICBjb25zdCBzaWdzID0gdGhpcy50eXBlQ2hlY2tlci5nZXRTaWduYXR1cmVzT2ZUeXBlKHR5cGUsIHRzLlNpZ25hdHVyZUtpbmQuQ2FsbCk7XG4gICAgICAgIGlmIChzaWdzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnNpZ25hdHVyZVRvQ2xvc3VyZShzaWdzWzBdKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChpbmRleGFibGUgJiYgIWNhbGxhYmxlKSB7XG4gICAgICAgIC8vIEEgcGxhaW4ga2V5LXZhbHVlIG1hcCB0eXBlLlxuICAgICAgICBsZXQga2V5VHlwZSA9ICdzdHJpbmcnO1xuICAgICAgICBsZXQgdmFsVHlwZSA9IHRoaXMudHlwZUNoZWNrZXIuZ2V0SW5kZXhUeXBlT2ZUeXBlKHR5cGUsIHRzLkluZGV4S2luZC5TdHJpbmcpO1xuICAgICAgICBpZiAoIXZhbFR5cGUpIHtcbiAgICAgICAgICBrZXlUeXBlID0gJ251bWJlcic7XG4gICAgICAgICAgdmFsVHlwZSA9IHRoaXMudHlwZUNoZWNrZXIuZ2V0SW5kZXhUeXBlT2ZUeXBlKHR5cGUsIHRzLkluZGV4S2luZC5OdW1iZXIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdmFsVHlwZSkge1xuICAgICAgICAgIHRoaXMud2FybigndW5rbm93biBpbmRleCBrZXkgdHlwZScpO1xuICAgICAgICAgIHJldHVybiBgIU9iamVjdDw/LD8+YDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYCFPYmplY3Q8JHtrZXlUeXBlfSwke3RoaXMudHJhbnNsYXRlKHZhbFR5cGUpfT5gO1xuICAgICAgfSBlbHNlIGlmICghY2FsbGFibGUgJiYgIWluZGV4YWJsZSkge1xuICAgICAgICAvLyBTcGVjaWFsLWNhc2UgdGhlIGVtcHR5IG9iamVjdCB7fSBiZWNhdXNlIENsb3N1cmUgZG9lc24ndCBsaWtlIGl0LlxuICAgICAgICAvLyBUT0RPKGV2YW5tKTogcmV2aXNpdCB0aGlzIGlmIGl0IGlzIGEgcHJvYmxlbS5cbiAgICAgICAgcmV0dXJuICchT2JqZWN0JztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWNhbGxhYmxlICYmICFpbmRleGFibGUpIHtcbiAgICAgIC8vIE5vdCBjYWxsYWJsZSwgbm90IGluZGV4YWJsZTsgaW1wbGllcyBhIHBsYWluIG9iamVjdCB3aXRoIGZpZWxkcyBpbiBpdC5cbiAgICAgIHJldHVybiBgeyR7ZmllbGRzLmpvaW4oJywgJyl9fWA7XG4gICAgfVxuXG4gICAgdGhpcy53YXJuKCd1bmhhbmRsZWQgYW5vbnltb3VzIHR5cGUnKTtcbiAgICByZXR1cm4gJz8nO1xuICB9XG5cbiAgLyoqIENvbnZlcnRzIGEgdHMuU2lnbmF0dXJlIChmdW5jdGlvbiBzaWduYXR1cmUpIHRvIGEgQ2xvc3VyZSBmdW5jdGlvbiB0eXBlLiAqL1xuICBwcml2YXRlIHNpZ25hdHVyZVRvQ2xvc3VyZShzaWc6IHRzLlNpZ25hdHVyZSk6IHN0cmluZyB7XG4gICAgLy8gVE9ETyhtYXJ0aW5wcm9ic3QpOiBDb25zaWRlciBoYXJtb25pemluZyBzb21lIG92ZXJsYXAgd2l0aCBlbWl0RnVuY3Rpb25UeXBlIGluIHRzaWNrbGUudHMuXG5cbiAgICB0aGlzLmJsYWNrbGlzdFR5cGVQYXJhbWV0ZXJzKHRoaXMuc3ltYm9sc1RvQWxpYXNlZE5hbWVzLCBzaWcuZGVjbGFyYXRpb24udHlwZVBhcmFtZXRlcnMpO1xuXG4gICAgbGV0IHR5cGVTdHIgPSBgZnVuY3Rpb24oYDtcblxuICAgIGxldCBwYXJhbURlY2xzOiBSZWFkb25seUFycmF5PHRzLlBhcmFtZXRlckRlY2xhcmF0aW9uPiA9IHNpZy5kZWNsYXJhdGlvbi5wYXJhbWV0ZXJzO1xuICAgIGNvbnN0IG1heWJlVGhpc1BhcmFtID0gcGFyYW1EZWNsc1swXTtcbiAgICAvLyBPZGRseSwgdGhlIHRoaXMgdHlwZSBzaG93cyB1cCBpbiBwYXJhbURlY2xzLCBidXQgbm90IGluIHRoZSB0eXBlJ3MgcGFyYW1ldGVycy5cbiAgICAvLyBIYW5kbGUgaXQgaGVyZSBhbmQgdGhlbiBwYXNzIHBhcmFtRGVjbHMgZG93biB3aXRob3V0IGl0cyBmaXJzdCBlbGVtZW50LlxuICAgIGlmIChtYXliZVRoaXNQYXJhbSAmJiBtYXliZVRoaXNQYXJhbS5uYW1lLmdldFRleHQoKSA9PT0gJ3RoaXMnKSB7XG4gICAgICBpZiAobWF5YmVUaGlzUGFyYW0udHlwZSkge1xuICAgICAgICBjb25zdCB0aGlzVHlwZSA9IHRoaXMudHlwZUNoZWNrZXIuZ2V0VHlwZUF0TG9jYXRpb24obWF5YmVUaGlzUGFyYW0udHlwZSk7XG4gICAgICAgIHR5cGVTdHIgKz0gYHRoaXM6ICgke3RoaXMudHJhbnNsYXRlKHRoaXNUeXBlKX0pYDtcbiAgICAgICAgaWYgKHBhcmFtRGVjbHMubGVuZ3RoID4gMSkgdHlwZVN0ciArPSAnLCAnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy53YXJuKCd0aGlzIHR5cGUgd2l0aG91dCB0eXBlJyk7XG4gICAgICB9XG4gICAgICBwYXJhbURlY2xzID0gcGFyYW1EZWNscy5zbGljZSgxKTtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJhbXMgPSB0aGlzLmNvbnZlcnRQYXJhbXMoc2lnLCBwYXJhbURlY2xzKTtcbiAgICB0eXBlU3RyICs9IGAke3BhcmFtcy5qb2luKCcsICcpfSlgO1xuXG4gICAgY29uc3QgcmV0VHlwZSA9IHRoaXMudHJhbnNsYXRlKHRoaXMudHlwZUNoZWNrZXIuZ2V0UmV0dXJuVHlwZU9mU2lnbmF0dXJlKHNpZykpO1xuICAgIGlmIChyZXRUeXBlKSB7XG4gICAgICB0eXBlU3RyICs9IGA6ICR7cmV0VHlwZX1gO1xuICAgIH1cblxuICAgIHJldHVybiB0eXBlU3RyO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHBhcmFtZXRlcnMgZm9yIHRoZSBnaXZlbiBzaWduYXR1cmUuIFRha2VzIHBhcmFtZXRlciBkZWNsYXJhdGlvbnMgYXMgdGhvc2UgbWlnaHQgbm90XG4gICAqIG1hdGNoIHRoZSBzaWduYXR1cmUgcGFyYW1ldGVycyAoZS5nLiB0aGVyZSBtaWdodCBiZSBhbiBhZGRpdGlvbmFsIHRoaXMgcGFyYW1ldGVyKS4gVGhpc1xuICAgKiBkaWZmZXJlbmNlIGlzIGhhbmRsZWQgYnkgdGhlIGNhbGxlciwgYXMgaXMgY29udmVydGluZyB0aGUgXCJ0aGlzXCIgcGFyYW1ldGVyLlxuICAgKi9cbiAgcHJpdmF0ZSBjb252ZXJ0UGFyYW1zKHNpZzogdHMuU2lnbmF0dXJlLCBwYXJhbURlY2xzOiBSZWFkb25seUFycmF5PHRzLlBhcmFtZXRlckRlY2xhcmF0aW9uPik6XG4gICAgICBzdHJpbmdbXSB7XG4gICAgY29uc3QgcGFyYW1UeXBlczogc3RyaW5nW10gPSBbXTtcbiAgICAvLyBUaGUgU2lnbmF0dXJlIGl0c2VsZiBkb2VzIG5vdCBpbmNsdWRlIGluZm9ybWF0aW9uIG9uIG9wdGlvbmFsIGFuZCB2YXIgYXJnIHBhcmFtZXRlcnMuXG4gICAgLy8gVXNlIGl0cyBkZWNsYXJhdGlvbiB0byByZWNvdmVyIHRoYXQgaW5mb3JtYXRpb24uXG4gICAgY29uc3QgZGVjbCA9IHNpZy5kZWNsYXJhdGlvbjtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNpZy5wYXJhbWV0ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBwYXJhbSA9IHNpZy5wYXJhbWV0ZXJzW2ldO1xuXG4gICAgICBjb25zdCBwYXJhbURlY2wgPSBwYXJhbURlY2xzW2ldO1xuICAgICAgY29uc3Qgb3B0aW9uYWwgPSAhIXBhcmFtRGVjbC5xdWVzdGlvblRva2VuO1xuICAgICAgY29uc3QgdmFyQXJncyA9ICEhcGFyYW1EZWNsLmRvdERvdERvdFRva2VuO1xuICAgICAgbGV0IHBhcmFtVHlwZSA9IHRoaXMudHlwZUNoZWNrZXIuZ2V0VHlwZU9mU3ltYm9sQXRMb2NhdGlvbihwYXJhbSwgdGhpcy5ub2RlKTtcbiAgICAgIGlmICh2YXJBcmdzKSB7XG4gICAgICAgIGNvbnN0IHR5cGVSZWYgPSBwYXJhbVR5cGUgYXMgdHMuVHlwZVJlZmVyZW5jZTtcbiAgICAgICAgcGFyYW1UeXBlID0gdHlwZVJlZi50eXBlQXJndW1lbnRzIVswXTtcbiAgICAgIH1cbiAgICAgIGxldCB0eXBlU3RyID0gdGhpcy50cmFuc2xhdGUocGFyYW1UeXBlKTtcbiAgICAgIGlmICh2YXJBcmdzKSB0eXBlU3RyID0gJy4uLicgKyB0eXBlU3RyO1xuICAgICAgaWYgKG9wdGlvbmFsKSB0eXBlU3RyID0gdHlwZVN0ciArICc9JztcbiAgICAgIHBhcmFtVHlwZXMucHVzaCh0eXBlU3RyKTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcmFtVHlwZXM7XG4gIH1cblxuICB3YXJuKG1zZzogc3RyaW5nKSB7XG4gICAgLy8gQnkgZGVmYXVsdCwgd2FybigpIGRvZXMgbm90aGluZy4gIFRoZSBjYWxsZXIgd2lsbCBvdmVyd3JpdGUgdGhpc1xuICAgIC8vIGlmIGl0IHdhbnRzIGRpZmZlcmVudCBiZWhhdmlvci5cbiAgfVxuXG4gIC8qKiBAcmV0dXJuIHRydWUgaWYgc3ltIHNob3VsZCBhbHdheXMgaGF2ZSB0eXBlIHs/fS4gKi9cbiAgaXNCbGFja0xpc3RlZChzeW1ib2w6IHRzLlN5bWJvbCk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLnBhdGhCbGFja0xpc3QgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IHBhdGhCbGFja0xpc3QgPSB0aGlzLnBhdGhCbGFja0xpc3Q7XG4gICAgLy8gU29tZSBidWlsdGluIHR5cGVzLCBzdWNoIGFzIHt9LCBnZXQgcmVwcmVzZW50ZWQgYnkgYSBzeW1ib2wgdGhhdCBoYXMgbm8gZGVjbGFyYXRpb25zLlxuICAgIGlmIChzeW1ib2wuZGVjbGFyYXRpb25zID09PSB1bmRlZmluZWQpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gc3ltYm9sLmRlY2xhcmF0aW9ucy5ldmVyeShuID0+IHtcbiAgICAgIGNvbnN0IGZpbGVOYW1lID0gcGF0aC5ub3JtYWxpemUobi5nZXRTb3VyY2VGaWxlKCkuZmlsZU5hbWUpO1xuICAgICAgcmV0dXJuIHBhdGhCbGFja0xpc3QuaGFzKGZpbGVOYW1lKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zdXJlIGRvZXNuIG5vdCBzdXBwb3J0IHR5cGUgcGFyYW1ldGVycyBmb3IgZnVuY3Rpb24gdHlwZXMsIGkuZS4gZ2VuZXJpYyBmdW5jdGlvbiB0eXBlcy5cbiAgICogQmxhY2tsaXN0IHRoZSBzeW1ib2xzIGRlY2xhcmVkIGJ5IHRoZW0gYW5kIGVtaXQgYSA/IGZvciB0aGUgdHlwZXMuXG4gICAqXG4gICAqIFRoaXMgbXV0YXRlcyB0aGUgZ2l2ZW4gYmxhY2tsaXN0IG1hcC4gVGhlIG1hcCdzIHNjb3BlIGlzIG9uZSBmaWxlLCBhbmQgc3ltYm9scyBhcmVcbiAgICogdW5pcXVlIG9iamVjdHMsIHNvIHRoaXMgc2hvdWxkIG5laXRoZXIgbGVhZCB0byBleGNlc3NpdmUgbWVtb3J5IGNvbnN1bXB0aW9uIG5vciBpbnRyb2R1Y2VcbiAgICogZXJyb3JzLlxuICAgKlxuICAgKiBAcGFyYW0gYmxhY2tsaXN0IGEgbWFwIHRvIHN0b3JlIHRoZSBibGFja2xpc3RlZCBzeW1ib2xzIGluLCB3aXRoIGEgdmFsdWUgb2YgJz8nLiBJbiBwcmFjdGljZSxcbiAgICogICAgIHRoaXMgaXMgYWx3YXlzID09PSB0aGlzLnN5bWJvbHNUb0FsaWFzZWROYW1lcywgYnV0IHdlJ3JlIHBhc3NpbmcgaXQgZXhwbGljaXRseSB0byBtYWtlIGl0XG4gICAqICAgIGNsZWFyIHRoYXQgdGhlIG1hcCBpcyBtdXRhdGVkIChpbiBwYXJ0aWN1bGFyIHdoZW4gdXNlZCBmcm9tIG91dHNpZGUgdGhlIGNsYXNzKS5cbiAgICogQHBhcmFtIGRlY2xzIHRoZSBkZWNsYXJhdGlvbnMgd2hvc2Ugc3ltYm9scyBzaG91bGQgYmUgYmxhY2tsaXN0ZWQuXG4gICAqL1xuICBibGFja2xpc3RUeXBlUGFyYW1ldGVycyhcbiAgICAgIGJsYWNrbGlzdDogTWFwPHRzLlN5bWJvbCwgc3RyaW5nPixcbiAgICAgIGRlY2xzOiB0cy5Ob2RlQXJyYXk8dHMuVHlwZVBhcmFtZXRlckRlY2xhcmF0aW9uPnx1bmRlZmluZWQpIHtcbiAgICBpZiAoIWRlY2xzIHx8ICFkZWNscy5sZW5ndGgpIHJldHVybjtcbiAgICBmb3IgKGNvbnN0IHRwZCBvZiBkZWNscykge1xuICAgICAgY29uc3Qgc3ltID0gdGhpcy50eXBlQ2hlY2tlci5nZXRTeW1ib2xBdExvY2F0aW9uKHRwZC5uYW1lKTtcbiAgICAgIGlmICghc3ltKSB7XG4gICAgICAgIHRoaXMud2FybihgdHlwZSBwYXJhbWV0ZXIgd2l0aCBubyBzeW1ib2xgKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICB0aGlzLnN5bWJvbHNUb0FsaWFzZWROYW1lcy5zZXQoc3ltLCAnPycpO1xuICAgIH1cbiAgfVxufVxuIl19