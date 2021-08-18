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
        define("@angular/compiler-cli/src/ngtsc/annotations/src/selector_scope", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/metadata", "@angular/compiler-cli/src/ngtsc/metadata/src/reflector", "@angular/compiler-cli/src/ngtsc/annotations/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var metadata_1 = require("@angular/compiler-cli/src/ngtsc/metadata");
    var reflector_1 = require("@angular/compiler-cli/src/ngtsc/metadata/src/reflector");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/util");
    /**
     * Registry which records and correlates static analysis information of Angular types.
     *
     * Once a compilation unit's information is fed into the SelectorScopeRegistry, it can be asked to
     * produce transitive `CompilationScope`s for components.
     */
    var SelectorScopeRegistry = /** @class */ (function () {
        function SelectorScopeRegistry(checker, reflector) {
            this.checker = checker;
            this.reflector = reflector;
            /**
             *  Map of modules declared in the current compilation unit to their (local) metadata.
             */
            this._moduleToData = new Map();
            /**
             * Map of modules to their cached `CompilationScope`s.
             */
            this._compilationScopeCache = new Map();
            /**
             * Map of components/directives to their metadata.
             */
            this._directiveToMetadata = new Map();
            /**
             * Map of pipes to their name.
             */
            this._pipeToName = new Map();
            /**
             * Map of components/directives/pipes to their module.
             */
            this._declararedTypeToModule = new Map();
        }
        /**
         * Register a module's metadata with the registry.
         */
        SelectorScopeRegistry.prototype.registerModule = function (node, data) {
            var _this = this;
            node = ts.getOriginalNode(node);
            if (this._moduleToData.has(node)) {
                throw new Error("Module already registered: " + reflector_1.reflectNameOfDeclaration(node));
            }
            this._moduleToData.set(node, data);
            // Register all of the module's declarations in the context map as belonging to this module.
            data.declarations.forEach(function (decl) {
                _this._declararedTypeToModule.set(ts.getOriginalNode(decl.node), node);
            });
        };
        /**
         * Register the metadata of a component or directive with the registry.
         */
        SelectorScopeRegistry.prototype.registerDirective = function (node, metadata) {
            node = ts.getOriginalNode(node);
            if (this._directiveToMetadata.has(node)) {
                throw new Error("Selector already registered: " + reflector_1.reflectNameOfDeclaration(node) + " " + metadata.selector);
            }
            this._directiveToMetadata.set(node, metadata);
        };
        /**
         * Register the name of a pipe with the registry.
         */
        SelectorScopeRegistry.prototype.registerPipe = function (node, name) {
            node = ts.getOriginalNode(node);
            this._pipeToName.set(node, name);
        };
        SelectorScopeRegistry.prototype.lookupCompilationScopeAsRefs = function (node) {
            var e_1, _a;
            node = ts.getOriginalNode(node);
            // If the component has no associated module, then it has no compilation scope.
            if (!this._declararedTypeToModule.has(node)) {
                return null;
            }
            var module = this._declararedTypeToModule.get(node);
            // Compilation scope computation is somewhat expensive, so it's cached. Check the cache for
            // the module.
            if (this._compilationScopeCache.has(module)) {
                // The compilation scope was cached.
                var scope_1 = this._compilationScopeCache.get(module);
                // The scope as cached is in terms of References, not Expressions. Converting between them
                // requires knowledge of the context file (in this case, the component node's source file).
                return scope_1;
            }
            // This is the first time the scope for this module is being computed.
            var directives = [];
            var pipes = new Map();
            // Tracks which declarations already appear in the `CompilationScope`.
            var seenSet = new Set();
            try {
                // Process the declaration scope of the module, and lookup the selector of every declared type.
                // The initial value of ngModuleImportedFrom is 'null' which signifies that the NgModule
                // was not imported from a .d.ts source.
                for (var _b = tslib_1.__values(this.lookupScopesOrDie(module, /* ngModuleImportedFrom */ null)
                    .compilation), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var ref = _c.value;
                    var node_1 = ts.getOriginalNode(ref.node);
                    // Track whether this `ts.Declaration` has been seen before.
                    if (seenSet.has(node_1)) {
                        continue;
                    }
                    else {
                        seenSet.add(node_1);
                    }
                    // Either the node represents a directive or a pipe. Look for both.
                    var metadata = this.lookupDirectiveMetadata(ref);
                    // Only directives/components with selectors get added to the scope.
                    if (metadata !== null) {
                        directives.push(tslib_1.__assign({}, metadata, { directive: ref }));
                    }
                    else {
                        var name_1 = this.lookupPipeName(node_1);
                        if (name_1 !== null) {
                            pipes.set(name_1, ref);
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var scope = { directives: directives, pipes: pipes };
            // Many components may be compiled in the same scope, so cache it.
            this._compilationScopeCache.set(node, scope);
            // Convert References to Expressions in the context of the component's source file.
            return scope;
        };
        /**
         * Produce the compilation scope of a component, which is determined by the module that declares
         * it.
         */
        SelectorScopeRegistry.prototype.lookupCompilationScope = function (node) {
            var scope = this.lookupCompilationScopeAsRefs(node);
            return scope !== null ? convertScopeToExpressions(scope, node) : null;
        };
        SelectorScopeRegistry.prototype.lookupScopesOrDie = function (node, ngModuleImportedFrom) {
            var result = this.lookupScopes(node, ngModuleImportedFrom);
            if (result === null) {
                throw new Error("Module not found: " + reflector_1.reflectNameOfDeclaration(node));
            }
            return result;
        };
        /**
         * Lookup `SelectorScopes` for a given module.
         *
         * This function assumes that if the given module was imported from an absolute path
         * (`ngModuleImportedFrom`) then all of its declarations are exported at that same path, as well
         * as imports and exports from other modules that are relatively imported.
         */
        SelectorScopeRegistry.prototype.lookupScopes = function (node, ngModuleImportedFrom) {
            var _this = this;
            var data = null;
            // Either this module was analyzed directly, or has a precompiled ngModuleDef.
            if (this._moduleToData.has(node)) {
                // The module was analyzed before, and thus its data is available.
                data = this._moduleToData.get(node);
            }
            else {
                // The module wasn't analyzed before, and probably has a precompiled ngModuleDef with a type
                // annotation that specifies the needed metadata.
                data = this._readModuleDataFromCompiledClass(node, ngModuleImportedFrom);
                // Note that data here could still be null, if the class didn't have a precompiled
                // ngModuleDef.
            }
            if (data === null) {
                return null;
            }
            return {
                compilation: tslib_1.__spread(data.declarations, flatten(data.imports.map(function (ref) { return _this.lookupScopesOrDie(ref.node, absoluteModuleName(ref))
                    .exported; })), flatten(data.exports
                    .map(function (ref) { return _this.lookupScopes(ref.node, absoluteModuleName(ref)); })
                    .filter(function (scope) { return scope !== null; })
                    .map(function (scope) { return scope.exported; }))),
                exported: flatten(data.exports.map(function (ref) {
                    var scope = _this.lookupScopes(ref.node, absoluteModuleName(ref));
                    if (scope !== null) {
                        return scope.exported;
                    }
                    else {
                        return [ref];
                    }
                })),
            };
        };
        /**
         * Lookup the metadata of a component or directive class.
         *
         * Potentially this class is declared in a .d.ts file or otherwise has a manually created
         * ngComponentDef/ngDirectiveDef. In this case, the type metadata of that definition is read
         * to determine the metadata.
         */
        SelectorScopeRegistry.prototype.lookupDirectiveMetadata = function (ref) {
            var node = ts.getOriginalNode(ref.node);
            if (this._directiveToMetadata.has(node)) {
                return this._directiveToMetadata.get(node);
            }
            else {
                return this._readMetadataFromCompiledClass(ref);
            }
        };
        SelectorScopeRegistry.prototype.lookupPipeName = function (node) {
            if (this._pipeToName.has(node)) {
                return this._pipeToName.get(node);
            }
            else {
                return this._readNameFromCompiledClass(node);
            }
        };
        /**
         * Read the metadata from a class that has already been compiled somehow (either it's in a .d.ts
         * file, or in a .ts file with a handwritten definition).
         *
         * @param clazz the class of interest
         * @param ngModuleImportedFrom module specifier of the import path to assume for all declarations
         * stemming from this module.
         */
        SelectorScopeRegistry.prototype._readModuleDataFromCompiledClass = function (clazz, ngModuleImportedFrom) {
            // This operation is explicitly not memoized, as it depends on `ngModuleImportedFrom`.
            // TODO(alxhub): investigate caching of .d.ts module metadata.
            var ngModuleDef = this.reflector.getMembersOfClass(clazz).find(function (member) { return member.name === 'ngModuleDef' && member.isStatic; });
            if (ngModuleDef === undefined) {
                return null;
            }
            else if (
            // Validate that the shape of the ngModuleDef type is correct.
            ngModuleDef.type === null || !ts.isTypeReferenceNode(ngModuleDef.type) ||
                ngModuleDef.type.typeArguments === undefined ||
                ngModuleDef.type.typeArguments.length !== 4) {
                return null;
            }
            // Read the ModuleData out of the type arguments.
            var _a = tslib_1.__read(ngModuleDef.type.typeArguments, 4), _ = _a[0], declarationMetadata = _a[1], importMetadata = _a[2], exportMetadata = _a[3];
            return {
                declarations: this._extractReferencesFromType(declarationMetadata, ngModuleImportedFrom),
                exports: this._extractReferencesFromType(exportMetadata, ngModuleImportedFrom),
                imports: this._extractReferencesFromType(importMetadata, ngModuleImportedFrom),
            };
        };
        /**
         * Get the selector from type metadata for a class with a precompiled ngComponentDef or
         * ngDirectiveDef.
         */
        SelectorScopeRegistry.prototype._readMetadataFromCompiledClass = function (ref) {
            var clazz = ts.getOriginalNode(ref.node);
            var def = this.reflector.getMembersOfClass(clazz).find(function (field) {
                return field.isStatic && (field.name === 'ngComponentDef' || field.name === 'ngDirectiveDef');
            });
            if (def === undefined) {
                // No definition could be found.
                return null;
            }
            else if (def.type === null || !ts.isTypeReferenceNode(def.type) ||
                def.type.typeArguments === undefined || def.type.typeArguments.length < 2) {
                // The type metadata was the wrong shape.
                return null;
            }
            var selector = readStringType(def.type.typeArguments[1]);
            if (selector === null) {
                return null;
            }
            return tslib_1.__assign({ ref: ref, name: clazz.name.text, directive: ref, isComponent: def.name === 'ngComponentDef', selector: selector, exportAs: readStringType(def.type.typeArguments[2]), inputs: readStringMapType(def.type.typeArguments[3]), outputs: readStringMapType(def.type.typeArguments[4]), queries: readStringArrayType(def.type.typeArguments[5]) }, util_1.extractDirectiveGuards(clazz, this.reflector));
        };
        /**
         * Get the selector from type metadata for a class with a precompiled ngComponentDef or
         * ngDirectiveDef.
         */
        SelectorScopeRegistry.prototype._readNameFromCompiledClass = function (clazz) {
            var def = this.reflector.getMembersOfClass(clazz).find(function (field) { return field.isStatic && field.name === 'ngPipeDef'; });
            if (def === undefined) {
                // No definition could be found.
                return null;
            }
            else if (def.type === null || !ts.isTypeReferenceNode(def.type) ||
                def.type.typeArguments === undefined || def.type.typeArguments.length < 2) {
                // The type metadata was the wrong shape.
                return null;
            }
            var type = def.type.typeArguments[1];
            if (!ts.isLiteralTypeNode(type) || !ts.isStringLiteral(type.literal)) {
                // The type metadata was the wrong type.
                return null;
            }
            return type.literal.text;
        };
        /**
         * Process a `TypeNode` which is a tuple of references to other types, and return `Reference`s to
         * them.
         *
         * This operation assumes that these types should be imported from `ngModuleImportedFrom` unless
         * they themselves were imported from another absolute path.
         */
        SelectorScopeRegistry.prototype._extractReferencesFromType = function (def, ngModuleImportedFrom) {
            var _this = this;
            if (!ts.isTupleTypeNode(def)) {
                return [];
            }
            return def.elementTypes.map(function (element) {
                if (!ts.isTypeQueryNode(element)) {
                    throw new Error("Expected TypeQueryNode");
                }
                var type = element.exprName;
                if (ngModuleImportedFrom !== null) {
                    var _a = metadata_1.reflectTypeEntityToDeclaration(type, _this.checker), node = _a.node, from = _a.from;
                    var moduleName = (from !== null && !from.startsWith('.') ? from : ngModuleImportedFrom);
                    var id = reflector_1.reflectIdentifierOfDeclaration(node);
                    return new metadata_1.AbsoluteReference(node, id, moduleName, id.text);
                }
                else {
                    var node = metadata_1.reflectTypeEntityToDeclaration(type, _this.checker).node;
                    var id = reflector_1.reflectIdentifierOfDeclaration(node);
                    return new metadata_1.ResolvedReference(node, id);
                }
            });
        };
        return SelectorScopeRegistry;
    }());
    exports.SelectorScopeRegistry = SelectorScopeRegistry;
    function flatten(array) {
        return array.reduce(function (accum, subArray) {
            accum.push.apply(accum, tslib_1.__spread(subArray));
            return accum;
        }, []);
    }
    function absoluteModuleName(ref) {
        if (!(ref instanceof metadata_1.AbsoluteReference)) {
            return null;
        }
        return ref.moduleName;
    }
    function convertDirectiveReferenceList(input, context) {
        return input.map(function (meta) {
            var directive = meta.directive.toExpression(context);
            if (directive === null) {
                throw new Error("Could not write expression to reference " + meta.directive.node);
            }
            return tslib_1.__assign({}, meta, { directive: directive });
        });
    }
    function convertPipeReferenceMap(map, context) {
        var newMap = new Map();
        map.forEach(function (meta, selector) {
            var pipe = meta.toExpression(context);
            if (pipe === null) {
                throw new Error("Could not write expression to reference " + meta.node);
            }
            newMap.set(selector, pipe);
        });
        return newMap;
    }
    function convertScopeToExpressions(scope, context) {
        var sourceContext = ts.getOriginalNode(context).getSourceFile();
        var directives = convertDirectiveReferenceList(scope.directives, sourceContext);
        var pipes = convertPipeReferenceMap(scope.pipes, sourceContext);
        var declPointer = maybeUnwrapNameOfDeclaration(context);
        var containsForwardDecls = false;
        directives.forEach(function (meta) {
            containsForwardDecls = containsForwardDecls ||
                isExpressionForwardReference(meta.directive, declPointer, sourceContext);
        });
        !containsForwardDecls && pipes.forEach(function (expr) {
            containsForwardDecls =
                containsForwardDecls || isExpressionForwardReference(expr, declPointer, sourceContext);
        });
        return { directives: directives, pipes: pipes, containsForwardDecls: containsForwardDecls };
    }
    function isExpressionForwardReference(expr, context, contextSource) {
        if (isWrappedTsNodeExpr(expr)) {
            var node = ts.getOriginalNode(expr.node);
            return node.getSourceFile() === contextSource && context.pos < node.pos;
        }
        return false;
    }
    function isWrappedTsNodeExpr(expr) {
        return expr instanceof compiler_1.WrappedNodeExpr;
    }
    function maybeUnwrapNameOfDeclaration(decl) {
        if ((ts.isClassDeclaration(decl) || ts.isVariableDeclaration(decl)) && decl.name !== undefined &&
            ts.isIdentifier(decl.name)) {
            return decl.name;
        }
        return decl;
    }
    function readStringType(type) {
        if (!ts.isLiteralTypeNode(type) || !ts.isStringLiteral(type.literal)) {
            return null;
        }
        return type.literal.text;
    }
    function readStringMapType(type) {
        if (!ts.isTypeLiteralNode(type)) {
            return {};
        }
        var obj = {};
        type.members.forEach(function (member) {
            if (!ts.isPropertySignature(member) || member.type === undefined || member.name === undefined ||
                !ts.isStringLiteral(member.name)) {
                return;
            }
            var value = readStringType(member.type);
            if (value === null) {
                return null;
            }
            obj[member.name.text] = value;
        });
        return obj;
    }
    function readStringArrayType(type) {
        if (!ts.isTupleTypeNode(type)) {
            return [];
        }
        var res = [];
        type.elementTypes.forEach(function (el) {
            if (!ts.isLiteralTypeNode(el) || !ts.isStringLiteral(el.literal)) {
                return;
            }
            res.push(el.literal.text);
        });
        return res;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0b3Jfc2NvcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2Fubm90YXRpb25zL3NyYy9zZWxlY3Rvcl9zY29wZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw4Q0FBK0Y7SUFDL0YsK0JBQWlDO0lBR2pDLHFFQUErRztJQUMvRyxvRkFBc0c7SUFHdEcsNkVBQThDO0lBNEM5Qzs7Ozs7T0FLRztJQUNIO1FBMEJFLCtCQUFvQixPQUF1QixFQUFVLFNBQXlCO1lBQTFELFlBQU8sR0FBUCxPQUFPLENBQWdCO1lBQVUsY0FBUyxHQUFULFNBQVMsQ0FBZ0I7WUF6QjlFOztlQUVHO1lBQ0ssa0JBQWEsR0FBRyxJQUFJLEdBQUcsRUFBOEIsQ0FBQztZQUU5RDs7ZUFFRztZQUNLLDJCQUFzQixHQUFHLElBQUksR0FBRyxFQUErQyxDQUFDO1lBRXhGOztlQUVHO1lBQ0sseUJBQW9CLEdBQUcsSUFBSSxHQUFHLEVBQTZDLENBQUM7WUFFcEY7O2VBRUc7WUFDSyxnQkFBVyxHQUFHLElBQUksR0FBRyxFQUEwQixDQUFDO1lBRXhEOztlQUVHO1lBQ0ssNEJBQXVCLEdBQUcsSUFBSSxHQUFHLEVBQWtDLENBQUM7UUFFSyxDQUFDO1FBRWxGOztXQUVHO1FBQ0gsOENBQWMsR0FBZCxVQUFlLElBQW9CLEVBQUUsSUFBZ0I7WUFBckQsaUJBWUM7WUFYQyxJQUFJLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQW1CLENBQUM7WUFFbEQsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDaEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBOEIsb0NBQXdCLENBQUMsSUFBSSxDQUFHLENBQUMsQ0FBQzthQUNqRjtZQUNELElBQUksQ0FBQyxhQUFh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QUFPO2FBQ1I7WUFDRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RXhwcmVzc2lvbiwgRXh0ZXJuYWxFeHByLCBFeHRlcm5hbFJlZmVyZW5jZSwgV3JhcHBlZE5vZGVFeHByfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtSZWZsZWN0aW9uSG9zdH0gZnJvbSAnLi4vLi4vaG9zdCc7XG5pbXBvcnQge0Fic29sdXRlUmVmZXJlbmNlLCBSZWZlcmVuY2UsIFJlc29sdmVkUmVmZXJlbmNlLCByZWZsZWN0VHlwZUVudGl0eVRvRGVjbGFyYXRpb259IGZyb20gJy4uLy4uL21ldGFkYXRhJztcbmltcG9ydCB7cmVmbGVjdElkZW50aWZpZXJPZkRlY2xhcmF0aW9uLCByZWZsZWN0TmFtZU9mRGVjbGFyYXRpb259IGZyb20gJy4uLy4uL21ldGFkYXRhL3NyYy9yZWZsZWN0b3InO1xuaW1wb3J0IHtUeXBlQ2hlY2thYmxlRGlyZWN0aXZlTWV0YX0gZnJvbSAnLi4vLi4vdHlwZWNoZWNrJztcblxuaW1wb3J0IHtleHRyYWN0RGlyZWN0aXZlR3VhcmRzfSBmcm9tICcuL3V0aWwnO1xuXG5cbi8qKlxuICogTWV0YWRhdGEgZXh0cmFjdGVkIGZvciBhIGdpdmVuIE5nTW9kdWxlIHRoYXQgY2FuIGJlIHVzZWQgdG8gY29tcHV0ZSBzZWxlY3RvciBzY29wZXMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTW9kdWxlRGF0YSB7XG4gIGRlY2xhcmF0aW9uczogUmVmZXJlbmNlPHRzLkRlY2xhcmF0aW9uPltdO1xuICBpbXBvcnRzOiBSZWZlcmVuY2U8dHMuRGVjbGFyYXRpb24+W107XG4gIGV4cG9ydHM6IFJlZmVyZW5jZTx0cy5EZWNsYXJhdGlvbj5bXTtcbn1cblxuLyoqXG4gKiBUcmFuc2l0aXZlbHkgZXhwYW5kZWQgbWFwcyBvZiBkaXJlY3RpdmVzIGFuZCBwaXBlcyB2aXNpYmxlIHRvIGEgY29tcG9uZW50IGJlaW5nIGNvbXBpbGVkIGluIHRoZVxuICogY29udGV4dCBvZiBzb21lIG1vZHVsZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21waWxhdGlvblNjb3BlPFQ+IHtcbiAgZGlyZWN0aXZlczogU2NvcGVEaXJlY3RpdmU8VD5bXTtcbiAgcGlwZXM6IE1hcDxzdHJpbmcsIFQ+O1xuICBjb250YWluc0ZvcndhcmREZWNscz86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2NvcGVEaXJlY3RpdmU8VD4gZXh0ZW5kcyBUeXBlQ2hlY2thYmxlRGlyZWN0aXZlTWV0YSB7XG4gIHNlbGVjdG9yOiBzdHJpbmc7XG4gIGRpcmVjdGl2ZTogVDtcbn1cblxuLyoqXG4gKiBCb3RoIHRyYW5zaXRpdmVseSBleHBhbmRlZCBzY29wZXMgZm9yIGEgZ2l2ZW4gTmdNb2R1bGUuXG4gKi9cbmludGVyZmFjZSBTZWxlY3RvclNjb3BlcyB7XG4gIC8qKlxuICAgKiBTZXQgb2YgY29tcG9uZW50cywgZGlyZWN0aXZlcywgYW5kIHBpcGVzIHZpc2libGUgdG8gYWxsIGNvbXBvbmVudHMgYmVpbmcgY29tcGlsZWQgaW4gdGhlXG4gICAqIGNvbnRleHQgb2Ygc29tZSBtb2R1bGUuXG4gICAqL1xuICBjb21waWxhdGlvbjogUmVmZXJlbmNlPHRzLkRlY2xhcmF0aW9uPltdO1xuXG4gIC8qKlxuICAgKiBTZXQgb2YgY29tcG9uZW50cywgZGlyZWN0aXZlcywgYW5kIHBpcGVzIGFkZGVkIHRvIHRoZSBjb21waWxhdGlvbiBzY29wZSBvZiBhbnkgbW9kdWxlIGltcG9ydGluZ1xuICAgKiBzb21lIG1vZHVsZS5cbiAgICovXG4gIGV4cG9ydGVkOiBSZWZlcmVuY2U8dHMuRGVjbGFyYXRpb24+W107XG59XG5cbi8qKlxuICogUmVnaXN0cnkgd2hpY2ggcmVjb3JkcyBhbmQgY29ycmVsYXRlcyBzdGF0aWMgYW5hbHlzaXMgaW5mb3JtYXRpb24gb2YgQW5ndWxhciB0eXBlcy5cbiAqXG4gKiBPbmNlIGEgY29tcGlsYXRpb24gdW5pdCdzIGluZm9ybWF0aW9uIGlzIGZlZCBpbnRvIHRoZSBTZWxlY3RvclNjb3BlUmVnaXN0cnksIGl0IGNhbiBiZSBhc2tlZCB0b1xuICogcHJvZHVjZSB0cmFuc2l0aXZlIGBDb21waWxhdGlvblNjb3BlYHMgZm9yIGNvbXBvbmVudHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBTZWxlY3RvclNjb3BlUmVnaXN0cnkge1xuICAvKipcbiAgICogIE1hcCBvZiBtb2R1bGVzIGRlY2xhcmVkIGluIHRoZSBjdXJyZW50IGNvbXBpbGF0aW9uIHVuaXQgdG8gdGhlaXIgKGxvY2FsKSBtZXRhZGF0YS5cbiAgICovXG4gIHByaXZhdGUgX21vZHVsZVRvRGF0YSA9IG5ldyBNYXA8dHMuRGVjbGFyYXRpb24sIE1vZHVsZURhdGE+KCk7XG5cbiAgLyoqXG4gICAqIE1hcCBvZiBtb2R1bGVzIHRvIHRoZWlyIGNhY2hlZCBgQ29tcGlsYXRpb25TY29wZWBzLlxuICAgKi9cbiAgcHJpdmF0ZSBfY29tcGlsYXRpb25TY29wZUNhY2hlID0gbmV3IE1hcDx0cy5EZWNsYXJhdGlvbiwgQ29tcGlsYXRpb25TY29wZTxSZWZlcmVuY2U+PigpO1xuXG4gIC8qKlxuICAgKiBNYXAgb2YgY29tcG9uZW50cy9kaXJlY3RpdmVzIHRvIHRoZWlyIG1ldGFkYXRhLlxuICAgKi9cbiAgcHJpdmF0ZSBfZGlyZWN0aXZlVG9NZXRhZGF0YSA9IG5ldyBNYXA8dHMuRGVjbGFyYXRpb24sIFNjb3BlRGlyZWN0aXZlPFJlZmVyZW5jZT4+KCk7XG5cbiAgLyoqXG4gICAqIE1hcCBvZiBwaXBlcyB0byB0aGVpciBuYW1lLlxuICAgKi9cbiAgcHJpdmF0ZSBfcGlwZVRvTmFtZSA9IG5ldyBNYXA8dHMuRGVjbGFyYXRpb24sIHN0cmluZz4oKTtcblxuICAvKipcbiAgICogTWFwIG9mIGNvbXBvbmVudHMvZGlyZWN0aXZlcy9waXBlcyB0byB0aGVpciBtb2R1bGUuXG4gICAqL1xuICBwcml2YXRlIF9kZWNsYXJhcmVkVHlwZVRvTW9kdWxlID0gbmV3IE1hcDx0cy5EZWNsYXJhdGlvbiwgdHMuRGVjbGFyYXRpb24+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjaGVja2VyOiB0cy5UeXBlQ2hlY2tlciwgcHJpdmF0ZSByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0KSB7fVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIG1vZHVsZSdzIG1ldGFkYXRhIHdpdGggdGhlIHJlZ2lzdHJ5LlxuICAgKi9cbiAgcmVnaXN0ZXJNb2R1bGUobm9kZTogdHMuRGVjbGFyYXRpb24sIGRhdGE6IE1vZHVsZURhdGEpOiB2b2lkIHtcbiAgICBub2RlID0gdHMuZ2V0T3JpZ2luYWxOb2RlKG5vZGUpIGFzIHRzLkRlY2xhcmF0aW9uO1xuXG4gICAgaWYgKHRoaXMuX21vZHVsZVRvRGF0YS5oYXMobm9kZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTW9kdWxlIGFscmVhZHkgcmVnaXN0ZXJlZDogJHtyZWZsZWN0TmFtZU9mRGVjbGFyYXRpb24obm9kZSl9YCk7XG4gICAgfVxuICAgIHRoaXMuX21vZHVsZVRvRGF0YS5zZXQobm9kZSwgZGF0YSk7XG5cbiAgICAvLyBSZWdpc3RlciBhbGwgb2YgdGhlIG1vZHVsZSdzIGRlY2xhcmF0aW9ucyBpbiB0aGUgY29udGV4dCBtYXAgYXMgYmVsb25naW5nIHRvIHRoaXMgbW9kdWxlLlxuICAgIGRhdGEuZGVjbGFyYXRpb25zLmZvckVhY2goZGVjbCA9PiB7XG4gICAgICB0aGlzLl9kZWNsYXJhcmVkVHlwZVRvTW9kdWxlLnNldCh0cy5nZXRPcmlnaW5hbE5vZGUoZGVjbC5ub2RlKSBhcyB0cy5EZWNsYXJhdGlvbiwgbm9kZSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgdGhlIG1ldGFkYXRhIG9mIGEgY29tcG9uZW50IG9yIGRpcmVjdGl2ZSB3aXRoIHRoZSByZWdpc3RyeS5cbiAgICovXG4gIHJlZ2lzdGVyRGlyZWN0aXZlKG5vZGU6IHRzLkRlY2xhcmF0aW9uLCBtZXRhZGF0YTogU2NvcGVEaXJlY3RpdmU8UmVmZXJlbmNlPik6IHZvaWQge1xuICAgIG5vZGUgPSB0cy5nZXRPcmlnaW5hbE5vZGUobm9kZSkgYXMgdHMuRGVjbGFyYXRpb247XG5cbiAgICBpZiAodGhpcy5fZGlyZWN0aXZlVG9NZXRhZGF0YS5oYXMobm9kZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgU2VsZWN0b3IgYWxyZWFkeSByZWdpc3RlcmVkOiAke3JlZmxlY3ROYW1lT2ZEZWNsYXJhdGlvbihub2RlKX0gJHttZXRhZGF0YS5zZWxlY3Rvcn1gKTtcbiAgICB9XG4gICAgdGhpcy5fZGlyZWN0aXZlVG9NZXRhZGF0YS5zZXQobm9kZSwgbWV0YWRhdGEpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIHRoZSBuYW1lIG9mIGEgcGlwZSB3aXRoIHRoZSByZWdpc3RyeS5cbiAgICovXG4gIHJlZ2lzdGVyUGlwZShub2RlOiB0cy5EZWNsYXJhdGlvbiwgbmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgbm9kZSA9IHRzLmdldE9yaWdpbmFsTm9kZShub2RlKSBhcyB0cy5EZWNsYXJhdGlvbjtcblxuICAgIHRoaXMuX3BpcGVUb05hbWUuc2V0KG5vZGUsIG5hbWUpO1xuICB9XG5cbiAgbG9va3VwQ29tcGlsYXRpb25TY29wZUFzUmVmcyhub2RlOiB0cy5EZWNsYXJhdGlvbik6IENvbXBpbGF0aW9uU2NvcGU8UmVmZXJlbmNlPnxudWxsIHtcbiAgICBub2RlID0gdHMuZ2V0T3JpZ2luYWxOb2RlKG5vZGUpIGFzIHRzLkRlY2xhcmF0aW9uO1xuXG4gICAgLy8gSWYgdGhlIGNvbXBvbmVudCBoYXMgbm8gYXNzb2NpYXRlZCBtb2R1bGUsIHRoZW4gaXQgaGFzIG5vIGNvbXBpbGF0aW9uIHNjb3BlLlxuICAgIGlmICghdGhpcy5fZGVjbGFyYXJlZFR5cGVUb01vZHVsZS5oYXMobm9kZSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IG1vZHVsZSA9IHRoaXMuX2RlY2xhcmFyZWRUeXBlVG9Nb2R1bGUuZ2V0KG5vZGUpICE7XG5cbiAgICAvLyBDb21waWxhdGlvbiBzY29wZSBjb21wdXRhdGlvbiBpcyBzb21ld2hhdCBleHBlbnNpdmUsIHNvIGl0J3MgY2FjaGVkLiBDaGVjayB0aGUgY2FjaGUgZm9yXG4gICAgLy8gdGhlIG1vZHVsZS5cbiAgICBpZiAodGhpcy5fY29tcGlsYXRpb25TY29wZUNhY2hlLmhhcyhtb2R1bGUpKSB7XG4gICAgICAvLyBUaGUgY29tcGlsYXRpb24gc2NvcGUgd2FzIGNhY2hlZC5cbiAgICAgIGNvbnN0IHNjb3BlID0gdGhpcy5fY29tcGlsYXRpb25TY29wZUNhY2hlLmdldChtb2R1bGUpICE7XG5cbiAgICAgIC8vIFRoZSBzY29wZSBhcyBjYWNoZWQgaXMgaW4gdGVybXMgb2YgUmVmZXJlbmNlcywgbm90IEV4cHJlc3Npb25zLiBDb252ZXJ0aW5nIGJldHdlZW4gdGhlbVxuICAgICAgLy8gcmVxdWlyZXMga25vd2xlZGdlIG9mIHRoZSBjb250ZXh0IGZpbGUgKGluIHRoaXMgY2FzZSwgdGhlIGNvbXBvbmVudCBub2RlJ3Mgc291cmNlIGZpbGUpLlxuICAgICAgcmV0dXJuIHNjb3BlO1xuICAgIH1cblxuICAgIC8vIFRoaXMgaXMgdGhlIGZpcnN0IHRpbWUgdGhlIHNjb3BlIGZvciB0aGlzIG1vZHVsZSBpcyBiZWluZyBjb21wdXRlZC5cbiAgICBjb25zdCBkaXJlY3RpdmVzOiBTY29wZURpcmVjdGl2ZTxSZWZlcmVuY2U8dHMuRGVjbGFyYXRpb24+PltdID0gW107XG4gICAgY29uc3QgcGlwZXMgPSBuZXcgTWFwPHN0cmluZywgUmVmZXJlbmNlPHRzLkRlY2xhcmF0aW9uPj4oKTtcblxuICAgIC8vIFRyYWNrcyB3aGljaCBkZWNsYXJhdGlvbnMgYWxyZWFkeSBhcHBlYXIgaW4gdGhlIGBDb21waWxhdGlvblNjb3BlYC5cbiAgICBjb25zdCBzZWVuU2V0ID0gbmV3IFNldDx0cy5EZWNsYXJhdGlvbj4oKTtcblxuICAgIC8vIFByb2Nlc3MgdGhlIGRlY2xhcmF0aW9uIHNjb3BlIG9mIHRoZSBtb2R1bGUsIGFuZCBsb29rdXAgdGhlIHNlbGVjdG9yIG9mIGV2ZXJ5IGRlY2xhcmVkIHR5cGUuXG4gICAgLy8gVGhlIGluaXRpYWwgdmFsdWUgb2YgbmdNb2R1bGVJbXBvcnRlZEZyb20gaXMgJ251bGwnIHdoaWNoIHNpZ25pZmllcyB0aGF0IHRoZSBOZ01vZHVsZVxuICAgIC8vIHdhcyBub3QgaW1wb3J0ZWQgZnJvbSBhIC5kLnRzIHNvdXJjZS5cbiAgICBmb3IgKGNvbnN0IHJlZiBvZiB0aGlzLmxvb2t1cFNjb3Blc09yRGllKG1vZHVsZSAhLCAvKiBuZ01vZHVsZUltcG9ydGVkRnJvbSAqLyBudWxsKVxuICAgICAgICAgICAgIC5jb21waWxhdGlvbikge1xuICAgICAgY29uc3Qgbm9kZSA9IHRzLmdldE9yaWdpbmFsTm9kZShyZWYubm9kZSkgYXMgdHMuRGVjbGFyYXRpb247XG5cbiAgICAgIC8vIFRyYWNrIHdoZXRoZXIgdGhpcyBgdHMuRGVjbGFyYXRpb25gIGhhcyBiZWVuIHNlZW4gYmVmb3JlLlxuICAgICAgaWYgKHNlZW5TZXQuaGFzKG5vZGUpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VlblNldC5hZGQobm9kZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEVpdGhlciB0aGUgbm9kZSByZXByZXNlbnRzIGEgZGlyZWN0aXZlIG9yIGEgcGlwZS4gTG9vayBmb3IgYm90aC5cbiAgICAgIGNvbnN0IG1ldGFkYXRhID0gdGhpcy5sb29rdXBEaXJlY3RpdmVNZXRhZGF0YShyZWYpO1xuICAgICAgLy8gT25seSBkaXJlY3RpdmVzL2NvbXBvbmVudHMgd2l0aCBzZWxlY3RvcnMgZ2V0IGFkZGVkIHRvIHRoZSBzY29wZS5cbiAgICAgIGlmIChtZXRhZGF0YSAhPT0gbnVsbCkge1xuICAgICAgICBkaXJlY3RpdmVzLnB1c2goey4uLm1ldGFkYXRhLCBkaXJlY3RpdmU6IHJlZn0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IHRoaXMubG9va3VwUGlwZU5hbWUobm9kZSk7XG4gICAgICAgIGlmIChuYW1lICE9PSBudWxsKSB7XG4gICAgICAgICAgcGlwZXMuc2V0KG5hbWUsIHJlZik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBzY29wZTogQ29tcGlsYXRpb25TY29wZTxSZWZlcmVuY2U+ID0ge2RpcmVjdGl2ZXMsIHBpcGVzfTtcblxuICAgIC8vIE1hbnkgY29tcG9uZW50cyBtYXkgYmUgY29tcGlsZWQgaW4gdGhlIHNhbWUgc2NvcGUsIHNvIGNhY2hlIGl0LlxuICAgIHRoaXMuX2NvbXBpbGF0aW9uU2NvcGVDYWNoZS5zZXQobm9kZSwgc2NvcGUpO1xuXG4gICAgLy8gQ29udmVydCBSZWZlcmVuY2VzIHRvIEV4cHJlc3Npb25zIGluIHRoZSBjb250ZXh0IG9mIHRoZSBjb21wb25lbnQncyBzb3VyY2UgZmlsZS5cbiAgICByZXR1cm4gc2NvcGU7XG4gIH1cblxuICAvKipcbiAgICogUHJvZHVjZSB0aGUgY29tcGlsYXRpb24gc2NvcGUgb2YgYSBjb21wb25lbnQsIHdoaWNoIGlzIGRldGVybWluZWQgYnkgdGhlIG1vZHVsZSB0aGF0IGRlY2xhcmVzXG4gICAqIGl0LlxuICAgKi9cbiAgbG9va3VwQ29tcGlsYXRpb25TY29wZShub2RlOiB0cy5EZWNsYXJhdGlvbik6IENvbXBpbGF0aW9uU2NvcGU8RXhwcmVzc2lvbj58bnVsbCB7XG4gICAgY29uc3Qgc2NvcGUgPSB0aGlzLmxvb2t1cENvbXBpbGF0aW9uU2NvcGVBc1JlZnMobm9kZSk7XG4gICAgcmV0dXJuIHNjb3BlICE9PSBudWxsID8gY29udmVydFNjb3BlVG9FeHByZXNzaW9ucyhzY29wZSwgbm9kZSkgOiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBsb29rdXBTY29wZXNPckRpZShub2RlOiB0cy5EZWNsYXJhdGlvbiwgbmdNb2R1bGVJbXBvcnRlZEZyb206IHN0cmluZ3xudWxsKTpcbiAgICAgIFNlbGVjdG9yU2NvcGVzIHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmxvb2t1cFNjb3Blcyhub2RlLCBuZ01vZHVsZUltcG9ydGVkRnJvbSk7XG4gICAgaWYgKHJlc3VsdCA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBNb2R1bGUgbm90IGZvdW5kOiAke3JlZmxlY3ROYW1lT2ZEZWNsYXJhdGlvbihub2RlKX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb29rdXAgYFNlbGVjdG9yU2NvcGVzYCBmb3IgYSBnaXZlbiBtb2R1bGUuXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gYXNzdW1lcyB0aGF0IGlmIHRoZSBnaXZlbiBtb2R1bGUgd2FzIGltcG9ydGVkIGZyb20gYW4gYWJzb2x1dGUgcGF0aFxuICAgKiAoYG5nTW9kdWxlSW1wb3J0ZWRGcm9tYCkgdGhlbiBhbGwgb2YgaXRzIGRlY2xhcmF0aW9ucyBhcmUgZXhwb3J0ZWQgYXQgdGhhdCBzYW1lIHBhdGgsIGFzIHdlbGxcbiAgICogYXMgaW1wb3J0cyBhbmQgZXhwb3J0cyBmcm9tIG90aGVyIG1vZHVsZXMgdGhhdCBhcmUgcmVsYXRpdmVseSBpbXBvcnRlZC5cbiAgICovXG4gIHByaXZhdGUgbG9va3VwU2NvcGVzKG5vZGU6IHRzLkRlY2xhcmF0aW9uLCBuZ01vZHVsZUltcG9ydGVkRnJvbTogc3RyaW5nfG51bGwpOiBTZWxlY3RvclNjb3Blc1xuICAgICAgfG51bGwge1xuICAgIGxldCBkYXRhOiBNb2R1bGVEYXRhfG51bGwgPSBudWxsO1xuXG4gICAgLy8gRWl0aGVyIHRoaXMgbW9kdWxlIHdhcyBhbmFseXplZCBkaXJlY3RseSwgb3IgaGFzIGEgcHJlY29tcGlsZWQgbmdNb2R1bGVEZWYuXG4gICAgaWYgKHRoaXMuX21vZHVsZVRvRGF0YS5oYXMobm9kZSkpIHtcbiAgICAgIC8vIFRoZSBtb2R1bGUgd2FzIGFuYWx5emVkIGJlZm9yZSwgYW5kIHRodXMgaXRzIGRhdGEgaXMgYXZhaWxhYmxlLlxuICAgICAgZGF0YSA9IHRoaXMuX21vZHVsZVRvRGF0YS5nZXQobm9kZSkgITtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIG1vZHVsZSB3YXNuJ3QgYW5hbHl6ZWQgYmVmb3JlLCBhbmQgcHJvYmFibHkgaGFzIGEgcHJlY29tcGlsZWQgbmdNb2R1bGVEZWYgd2l0aCBhIHR5cGVcbiAgICAgIC8vIGFubm90YXRpb24gdGhhdCBzcGVjaWZpZXMgdGhlIG5lZWRlZCBtZXRhZGF0YS5cbiAgICAgIGRhdGEgPSB0aGlzLl9yZWFkTW9kdWxlRGF0YUZyb21Db21waWxlZENsYXNzKG5vZGUsIG5nTW9kdWxlSW1wb3J0ZWRGcm9tKTtcbiAgICAgIC8vIE5vdGUgdGhhdCBkYXRhIGhlcmUgY291bGQgc3RpbGwgYmUgbnVsbCwgaWYgdGhlIGNsYXNzIGRpZG4ndCBoYXZlIGEgcHJlY29tcGlsZWRcbiAgICAgIC8vIG5nTW9kdWxlRGVmLlxuICAgIH1cblxuICAgIGlmIChkYXRhID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgY29tcGlsYXRpb246IFtcbiAgICAgICAgLi4uZGF0YS5kZWNsYXJhdGlvbnMsXG4gICAgICAgIC8vIEV4cGFuZCBpbXBvcnRzIHRvIHRoZSBleHBvcnRlZCBzY29wZSBvZiB0aG9zZSBpbXBvcnRzLlxuICAgICAgICAuLi5mbGF0dGVuKGRhdGEuaW1wb3J0cy5tYXAoXG4gICAgICAgICAgICByZWYgPT4gdGhpcy5sb29rdXBTY29wZXNPckRpZShyZWYubm9kZSBhcyB0cy5EZWNsYXJhdGlvbiwgYWJzb2x1dGVNb2R1bGVOYW1lKHJlZikpXG4gICAgICAgICAgICAgICAgICAgICAgIC5leHBvcnRlZCkpLFxuICAgICAgICAvLyBBbmQgaW5jbHVkZSB0aGUgY29tcGlsYXRpb24gc2NvcGUgb2YgZXhwb3J0ZWQgbW9kdWxlcy5cbiAgICAgICAgLi4uZmxhdHRlbihcbiAgICAgICAgICAgIGRhdGEuZXhwb3J0c1xuICAgICAgICAgICAgICAgIC5tYXAocmVmID0+IHRoaXMubG9va3VwU2NvcGVzKHJlZi5ub2RlIGFzIHRzLkRlY2xhcmF0aW9uLCBhYnNvbHV0ZU1vZHVsZU5hbWUocmVmKSkpXG4gICAgICAgICAgICAgICAgLmZpbHRlcigoc2NvcGU6IFNlbGVjdG9yU2NvcGVzIHwgbnVsbCk6IHNjb3BlIGlzIFNlbGVjdG9yU2NvcGVzID0+IHNjb3BlICE9PSBudWxsKVxuICAgICAgICAgICAgICAgIC5tYXAoc2NvcGUgPT4gc2NvcGUuZXhwb3J0ZWQpKVxuICAgICAgXSxcbiAgICAgIGV4cG9ydGVkOiBmbGF0dGVuKGRhdGEuZXhwb3J0cy5tYXAocmVmID0+IHtcbiAgICAgICAgY29uc3Qgc2NvcGUgPSB0aGlzLmxvb2t1cFNjb3BlcyhyZWYubm9kZSBhcyB0cy5EZWNsYXJhdGlvbiwgYWJzb2x1dGVNb2R1bGVOYW1lKHJlZikpO1xuICAgICAgICBpZiAoc2NvcGUgIT09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gc2NvcGUuZXhwb3J0ZWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFtyZWZdO1xuICAgICAgICB9XG4gICAgICB9KSksXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb29rdXAgdGhlIG1ldGFkYXRhIG9mIGEgY29tcG9uZW50IG9yIGRpcmVjdGl2ZSBjbGFzcy5cbiAgICpcbiAgICogUG90ZW50aWFsbHkgdGhpcyBjbGFzcyBpcyBkZWNsYXJlZCBpbiBhIC5kLnRzIGZpbGUgb3Igb3RoZXJ3aXNlIGhhcyBhIG1hbnVhbGx5IGNyZWF0ZWRcbiAgICogbmdDb21wb25lbnREZWYvbmdEaXJlY3RpdmVEZWYuIEluIHRoaXMgY2FzZSwgdGhlIHR5cGUgbWV0YWRhdGEgb2YgdGhhdCBkZWZpbml0aW9uIGlzIHJlYWRcbiAgICogdG8gZGV0ZXJtaW5lIHRoZSBtZXRhZGF0YS5cbiAgICovXG4gIHByaXZhdGUgbG9va3VwRGlyZWN0aXZlTWV0YWRhdGEocmVmOiBSZWZlcmVuY2U8dHMuRGVjbGFyYXRpb24+KTogU2NvcGVEaXJlY3RpdmU8UmVmZXJlbmNlPnxudWxsIHtcbiAgICBjb25zdCBub2RlID0gdHMuZ2V0T3JpZ2luYWxOb2RlKHJlZi5ub2RlKSBhcyB0cy5EZWNsYXJhdGlvbjtcbiAgICBpZiAodGhpcy5fZGlyZWN0aXZlVG9NZXRhZGF0YS5oYXMobm9kZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9kaXJlY3RpdmVUb01ldGFkYXRhLmdldChub2RlKSAhO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVhZE1ldGFkYXRhRnJvbUNvbXBpbGVkQ2xhc3MocmVmIGFzIFJlZmVyZW5jZTx0cy5DbGFzc0RlY2xhcmF0aW9uPik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBsb29rdXBQaXBlTmFtZShub2RlOiB0cy5EZWNsYXJhdGlvbik6IHN0cmluZ3xudWxsIHtcbiAgICBpZiAodGhpcy5fcGlwZVRvTmFtZS5oYXMobm9kZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9waXBlVG9OYW1lLmdldChub2RlKSAhO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVhZE5hbWVGcm9tQ29tcGlsZWRDbGFzcyhub2RlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVhZCB0aGUgbWV0YWRhdGEgZnJvbSBhIGNsYXNzIHRoYXQgaGFzIGFscmVhZHkgYmVlbiBjb21waWxlZCBzb21laG93IChlaXRoZXIgaXQncyBpbiBhIC5kLnRzXG4gICAqIGZpbGUsIG9yIGluIGEgLnRzIGZpbGUgd2l0aCBhIGhhbmR3cml0dGVuIGRlZmluaXRpb24pLlxuICAgKlxuICAgKiBAcGFyYW0gY2xhenogdGhlIGNsYXNzIG9mIGludGVyZXN0XG4gICAqIEBwYXJhbSBuZ01vZHVsZUltcG9ydGVkRnJvbSBtb2R1bGUgc3BlY2lmaWVyIG9mIHRoZSBpbXBvcnQgcGF0aCB0byBhc3N1bWUgZm9yIGFsbCBkZWNsYXJhdGlvbnNcbiAgICogc3RlbW1pbmcgZnJvbSB0aGlzIG1vZHVsZS5cbiAgICovXG4gIHByaXZhdGUgX3JlYWRNb2R1bGVEYXRhRnJvbUNvbXBpbGVkQ2xhc3MoXG4gICAgICBjbGF6ejogdHMuRGVjbGFyYXRpb24sIG5nTW9kdWxlSW1wb3J0ZWRGcm9tOiBzdHJpbmd8bnVsbCk6IE1vZHVsZURhdGF8bnVsbCB7XG4gICAgLy8gVGhpcyBvcGVyYXRpb24gaXMgZXhwbGljaXRseSBub3QgbWVtb2l6ZWQsIGFzIGl0IGRlcGVuZHMgb24gYG5nTW9kdWxlSW1wb3J0ZWRGcm9tYC5cbiAgICAvLyBUT0RPKGFseGh1Yik6IGludmVzdGlnYXRlIGNhY2hpbmcgb2YgLmQudHMgbW9kdWxlIG1ldGFkYXRhLlxuICAgIGNvbnN0IG5nTW9kdWxlRGVmID0gdGhpcy5yZWZsZWN0b3IuZ2V0TWVtYmVyc09mQ2xhc3MoY2xhenopLmZpbmQoXG4gICAgICAgIG1lbWJlciA9PiBtZW1iZXIubmFtZSA9PT0gJ25nTW9kdWxlRGVmJyAmJiBtZW1iZXIuaXNTdGF0aWMpO1xuICAgIGlmIChuZ01vZHVsZURlZiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgICAvLyBWYWxpZGF0ZSB0aGF0IHRoZSBzaGFwZSBvZiB0aGUgbmdNb2R1bGVEZWYgdHlwZSBpcyBjb3JyZWN0LlxuICAgICAgICBuZ01vZHVsZURlZi50eXBlID09PSBudWxsIHx8ICF0cy5pc1R5cGVSZWZlcmVuY2VOb2RlKG5nTW9kdWxlRGVmLnR5cGUpIHx8XG4gICAgICAgIG5nTW9kdWxlRGVmLnR5cGUudHlwZUFyZ3VtZW50cyA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgIG5nTW9kdWxlRGVmLnR5cGUudHlwZUFyZ3VtZW50cy5sZW5ndGggIT09IDQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFJlYWQgdGhlIE1vZHVsZURhdGEgb3V0IG9mIHRoZSB0eXBlIGFyZ3VtZW50cy5cbiAgICBjb25zdCBbXywgZGVjbGFyYXRpb25NZXRhZGF0YSwgaW1wb3J0TWV0YWRhdGEsIGV4cG9ydE1ldGFkYXRhXSA9IG5nTW9kdWxlRGVmLnR5cGUudHlwZUFyZ3VtZW50cztcbiAgICByZXR1cm4ge1xuICAgICAgZGVjbGFyYXRpb25zOiB0aGlzLl9leHRyYWN0UmVmZXJlbmNlc0Zyb21UeXBlKGRlY2xhcmF0aW9uTWV0YWRhdGEsIG5nTW9kdWxlSW1wb3J0ZWRGcm9tKSxcbiAgICAgIGV4cG9ydHM6IHRoaXMuX2V4dHJhY3RSZWZlcmVuY2VzRnJvbVR5cGUoZXhwb3J0TWV0YWRhdGEsIG5nTW9kdWxlSW1wb3J0ZWRGcm9tKSxcbiAgICAgIGltcG9ydHM6IHRoaXMuX2V4dHJhY3RSZWZlcmVuY2VzRnJvbVR5cGUoaW1wb3J0TWV0YWRhdGEsIG5nTW9kdWxlSW1wb3J0ZWRGcm9tKSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgc2VsZWN0b3IgZnJvbSB0eXBlIG1ldGFkYXRhIGZvciBhIGNsYXNzIHdpdGggYSBwcmVjb21waWxlZCBuZ0NvbXBvbmVudERlZiBvclxuICAgKiBuZ0RpcmVjdGl2ZURlZi5cbiAgICovXG4gIHByaXZhdGUgX3JlYWRNZXRhZGF0YUZyb21Db21waWxlZENsYXNzKHJlZjogUmVmZXJlbmNlPHRzLkNsYXNzRGVjbGFyYXRpb24+KTpcbiAgICAgIFNjb3BlRGlyZWN0aXZlPFJlZmVyZW5jZT58bnVsbCB7XG4gICAgY29uc3QgY2xhenogPSB0cy5nZXRPcmlnaW5hbE5vZGUocmVmLm5vZGUpIGFzIHRzLkNsYXNzRGVjbGFyYXRpb247XG4gICAgY29uc3QgZGVmID0gdGhpcy5yZWZsZWN0b3IuZ2V0TWVtYmVyc09mQ2xhc3MoY2xhenopLmZpbmQoXG4gICAgICAgIGZpZWxkID0+XG4gICAgICAgICAgICBmaWVsZC5pc1N0YXRpYyAmJiAoZmllbGQubmFtZSA9PT0gJ25nQ29tcG9uZW50RGVmJyB8fCBmaWVsZC5uYW1lID09PSAnbmdEaXJlY3RpdmVEZWYnKSk7XG4gICAgaWYgKGRlZiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBObyBkZWZpbml0aW9uIGNvdWxkIGJlIGZvdW5kLlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgICAgZGVmLnR5cGUgPT09IG51bGwgfHwgIXRzLmlzVHlwZVJlZmVyZW5jZU5vZGUoZGVmLnR5cGUpIHx8XG4gICAgICAgIGRlZi50eXBlLnR5cGVBcmd1bWVudHMgPT09IHVuZGVmaW5lZCB8fCBkZWYudHlwZS50eXBlQXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIC8vIFRoZSB0eXBlIG1ldGFkYXRhIHdhcyB0aGUgd3Jvbmcgc2hhcGUuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qgc2VsZWN0b3IgPSByZWFkU3RyaW5nVHlwZShkZWYudHlwZS50eXBlQXJndW1lbnRzWzFdKTtcbiAgICBpZiAoc2VsZWN0b3IgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICByZWYsXG4gICAgICBuYW1lOiBjbGF6ei5uYW1lICEudGV4dCxcbiAgICAgIGRpcmVjdGl2ZTogcmVmLFxuICAgICAgaXNDb21wb25lbnQ6IGRlZi5uYW1lID09PSAnbmdDb21wb25lbnREZWYnLCBzZWxlY3RvcixcbiAgICAgIGV4cG9ydEFzOiByZWFkU3RyaW5nVHlwZShkZWYudHlwZS50eXBlQXJndW1lbnRzWzJdKSxcbiAgICAgIGlucHV0czogcmVhZFN0cmluZ01hcFR5cGUoZGVmLnR5cGUudHlwZUFyZ3VtZW50c1szXSksXG4gICAgICBvdXRwdXRzOiByZWFkU3RyaW5nTWFwVHlwZShkZWYudHlwZS50eXBlQXJndW1lbnRzWzRdKSxcbiAgICAgIHF1ZXJpZXM6IHJlYWRTdHJpbmdBcnJheVR5cGUoZGVmLnR5cGUudHlwZUFyZ3VtZW50c1s1XSksXG4gICAgICAuLi5leHRyYWN0RGlyZWN0aXZlR3VhcmRzKGNsYXp6LCB0aGlzLnJlZmxlY3RvciksXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHNlbGVjdG9yIGZyb20gdHlwZSBtZXRhZGF0YSBmb3IgYSBjbGFzcyB3aXRoIGEgcHJlY29tcGlsZWQgbmdDb21wb25lbnREZWYgb3JcbiAgICogbmdEaXJlY3RpdmVEZWYuXG4gICAqL1xuICBwcml2YXRlIF9yZWFkTmFtZUZyb21Db21waWxlZENsYXNzKGNsYXp6OiB0cy5EZWNsYXJhdGlvbik6IHN0cmluZ3xudWxsIHtcbiAgICBjb25zdCBkZWYgPSB0aGlzLnJlZmxlY3Rvci5nZXRNZW1iZXJzT2ZDbGFzcyhjbGF6eikuZmluZChcbiAgICAgICAgZmllbGQgPT4gZmllbGQuaXNTdGF0aWMgJiYgZmllbGQubmFtZSA9PT0gJ25nUGlwZURlZicpO1xuICAgIGlmIChkZWYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gTm8gZGVmaW5pdGlvbiBjb3VsZCBiZSBmb3VuZC5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIGRlZi50eXBlID09PSBudWxsIHx8ICF0cy5pc1R5cGVSZWZlcmVuY2VOb2RlKGRlZi50eXBlKSB8fFxuICAgICAgICBkZWYudHlwZS50eXBlQXJndW1lbnRzID09PSB1bmRlZmluZWQgfHwgZGVmLnR5cGUudHlwZUFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICAvLyBUaGUgdHlwZSBtZXRhZGF0YSB3YXMgdGhlIHdyb25nIHNoYXBlLlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHR5cGUgPSBkZWYudHlwZS50eXBlQXJndW1lbnRzWzFdO1xuICAgIGlmICghdHMuaXNMaXRlcmFsVHlwZU5vZGUodHlwZSkgfHwgIXRzLmlzU3RyaW5nTGl0ZXJhbCh0eXBlLmxpdGVyYWwpKSB7XG4gICAgICAvLyBUaGUgdHlwZSBtZXRhZGF0YSB3YXMgdGhlIHdyb25nIHR5cGUuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHR5cGUubGl0ZXJhbC50ZXh0O1xuICB9XG5cbiAgLyoqXG4gICAqIFByb2Nlc3MgYSBgVHlwZU5vZGVgIHdoaWNoIGlzIGEgdHVwbGUgb2YgcmVmZXJlbmNlcyB0byBvdGhlciB0eXBlcywgYW5kIHJldHVybiBgUmVmZXJlbmNlYHMgdG9cbiAgICogdGhlbS5cbiAgICpcbiAgICogVGhpcyBvcGVyYXRpb24gYXNzdW1lcyB0aGF0IHRoZXNlIHR5cGVzIHNob3VsZCBiZSBpbXBvcnRlZCBmcm9tIGBuZ01vZHVsZUltcG9ydGVkRnJvbWAgdW5sZXNzXG4gICAqIHRoZXkgdGhlbXNlbHZlcyB3ZXJlIGltcG9ydGVkIGZyb20gYW5vdGhlciBhYnNvbHV0ZSBwYXRoLlxuICAgKi9cbiAgcHJpdmF0ZSBfZXh0cmFjdFJlZmVyZW5jZXNGcm9tVHlwZShkZWY6IHRzLlR5cGVOb2RlLCBuZ01vZHVsZUltcG9ydGVkRnJvbTogc3RyaW5nfG51bGwpOlxuICAgICAgUmVmZXJlbmNlPHRzLkRlY2xhcmF0aW9uPltdIHtcbiAgICBpZiAoIXRzLmlzVHVwbGVUeXBlTm9kZShkZWYpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHJldHVybiBkZWYuZWxlbWVudFR5cGVzLm1hcChlbGVtZW50ID0+IHtcbiAgICAgIGlmICghdHMuaXNUeXBlUXVlcnlOb2RlKGVsZW1lbnQpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgVHlwZVF1ZXJ5Tm9kZWApO1xuICAgICAgfVxuICAgICAgY29uc3QgdHlwZSA9IGVsZW1lbnQuZXhwck5hbWU7XG4gICAgICBpZiAobmdNb2R1bGVJbXBvcnRlZEZyb20gIT09IG51bGwpIHtcbiAgICAgICAgY29uc3Qge25vZGUsIGZyb219ID0gcmVmbGVjdFR5cGVFbnRpdHlUb0RlY2xhcmF0aW9uKHR5cGUsIHRoaXMuY2hlY2tlcik7XG4gICAgICAgIGNvbnN0IG1vZHVsZU5hbWUgPSAoZnJvbSAhPT0gbnVsbCAmJiAhZnJvbS5zdGFydHNXaXRoKCcuJykgPyBmcm9tIDogbmdNb2R1bGVJbXBvcnRlZEZyb20pO1xuICAgICAgICBjb25zdCBpZCA9IHJlZmxlY3RJZGVudGlmaWVyT2ZEZWNsYXJhdGlvbihub2RlKTtcbiAgICAgICAgcmV0dXJuIG5ldyBBYnNvbHV0ZVJlZmVyZW5jZShub2RlLCBpZCAhLCBtb2R1bGVOYW1lLCBpZCAhLnRleHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qge25vZGV9ID0gcmVmbGVjdFR5cGVFbnRpdHlUb0RlY2xhcmF0aW9uKHR5cGUsIHRoaXMuY2hlY2tlcik7XG4gICAgICAgIGNvbnN0IGlkID0gcmVmbGVjdElkZW50aWZpZXJPZkRlY2xhcmF0aW9uKG5vZGUpO1xuICAgICAgICByZXR1cm4gbmV3IFJlc29sdmVkUmVmZXJlbmNlKG5vZGUsIGlkICEpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW48VD4oYXJyYXk6IFRbXVtdKTogVFtdIHtcbiAgcmV0dXJuIGFycmF5LnJlZHVjZSgoYWNjdW0sIHN1YkFycmF5KSA9PiB7XG4gICAgYWNjdW0ucHVzaCguLi5zdWJBcnJheSk7XG4gICAgcmV0dXJuIGFjY3VtO1xuICB9LCBbXSBhcyBUW10pO1xufVxuXG5mdW5jdGlvbiBhYnNvbHV0ZU1vZHVsZU5hbWUocmVmOiBSZWZlcmVuY2UpOiBzdHJpbmd8bnVsbCB7XG4gIGlmICghKHJlZiBpbnN0YW5jZW9mIEFic29sdXRlUmVmZXJlbmNlKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiByZWYubW9kdWxlTmFtZTtcbn1cblxuZnVuY3Rpb24gY29udmVydERpcmVjdGl2ZVJlZmVyZW5jZUxpc3QoXG4gICAgaW5wdXQ6IFNjb3BlRGlyZWN0aXZlPFJlZmVyZW5jZT5bXSwgY29udGV4dDogdHMuU291cmNlRmlsZSk6IFNjb3BlRGlyZWN0aXZlPEV4cHJlc3Npb24+W10ge1xuICByZXR1cm4gaW5wdXQubWFwKG1ldGEgPT4ge1xuICAgIGNvbnN0IGRpcmVjdGl2ZSA9IG1ldGEuZGlyZWN0aXZlLnRvRXhwcmVzc2lvbihjb250ZXh0KTtcbiAgICBpZiAoZGlyZWN0aXZlID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCB3cml0ZSBleHByZXNzaW9uIHRvIHJlZmVyZW5jZSAke21ldGEuZGlyZWN0aXZlLm5vZGV9YCk7XG4gICAgfVxuICAgIHJldHVybiB7Li4ubWV0YSwgZGlyZWN0aXZlfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRQaXBlUmVmZXJlbmNlTWFwKFxuICAgIG1hcDogTWFwPHN0cmluZywgUmVmZXJlbmNlPiwgY29udGV4dDogdHMuU291cmNlRmlsZSk6IE1hcDxzdHJpbmcsIEV4cHJlc3Npb24+IHtcbiAgY29uc3QgbmV3TWFwID0gbmV3IE1hcDxzdHJpbmcsIEV4cHJlc3Npb24+KCk7XG4gIG1hcC5mb3JFYWNoKChtZXRhLCBzZWxlY3RvcikgPT4ge1xuICAgIGNvbnN0IHBpcGUgPSBtZXRhLnRvRXhwcmVzc2lvbihjb250ZXh0KTtcbiAgICBpZiAocGlwZSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3Qgd3JpdGUgZXhwcmVzc2lvbiB0byByZWZlcmVuY2UgJHttZXRhLm5vZGV9YCk7XG4gICAgfVxuICAgIG5ld01hcC5zZXQoc2VsZWN0b3IsIHBpcGUpO1xuICB9KTtcbiAgcmV0dXJuIG5ld01hcDtcbn1cblxuZnVuY3Rpb24gY29udmVydFNjb3BlVG9FeHByZXNzaW9ucyhcbiAgICBzY29wZTogQ29tcGlsYXRpb25TY29wZTxSZWZlcmVuY2U+LCBjb250ZXh0OiB0cy5EZWNsYXJhdGlvbik6IENvbXBpbGF0aW9uU2NvcGU8RXhwcmVzc2lvbj4ge1xuICBjb25zdCBzb3VyY2VDb250ZXh0ID0gdHMuZ2V0T3JpZ2luYWxOb2RlKGNvbnRleHQpLmdldFNvdXJjZUZpbGUoKTtcbiAgY29uc3QgZGlyZWN0aXZlcyA9IGNvbnZlcnREaXJlY3RpdmVSZWZlcmVuY2VMaXN0KHNjb3BlLmRpcmVjdGl2ZXMsIHNvdXJjZUNvbnRleHQpO1xuICBjb25zdCBwaXBlcyA9IGNvbnZlcnRQaXBlUmVmZXJlbmNlTWFwKHNjb3BlLnBpcGVzLCBzb3VyY2VDb250ZXh0KTtcbiAgY29uc3QgZGVjbFBvaW50ZXIgPSBtYXliZVVud3JhcE5hbWVPZkRlY2xhcmF0aW9uKGNvbnRleHQpO1xuICBsZXQgY29udGFpbnNGb3J3YXJkRGVjbHMgPSBmYWxzZTtcbiAgZGlyZWN0aXZlcy5mb3JFYWNoKG1ldGEgPT4ge1xuICAgIGNvbnRhaW5zRm9yd2FyZERlY2xzID0gY29udGFpbnNGb3J3YXJkRGVjbHMgfHxcbiAgICAgICAgaXNFeHByZXNzaW9uRm9yd2FyZFJlZmVyZW5jZShtZXRhLmRpcmVjdGl2ZSwgZGVjbFBvaW50ZXIsIHNvdXJjZUNvbnRleHQpO1xuICB9KTtcbiAgIWNvbnRhaW5zRm9yd2FyZERlY2xzICYmIHBpcGVzLmZvckVhY2goZXhwciA9PiB7XG4gICAgY29udGFpbnNGb3J3YXJkRGVjbHMgPVxuICAgICAgICBjb250YWluc0ZvcndhcmREZWNscyB8fCBpc0V4cHJlc3Npb25Gb3J3YXJkUmVmZXJlbmNlKGV4cHIsIGRlY2xQb2ludGVyLCBzb3VyY2VDb250ZXh0KTtcbiAgfSk7XG4gIHJldHVybiB7ZGlyZWN0aXZlcywgcGlwZXMsIGNvbnRhaW5zRm9yd2FyZERlY2xzfTtcbn1cblxuZnVuY3Rpb24gaXNFeHByZXNzaW9uRm9yd2FyZFJlZmVyZW5jZShcbiAgICBleHByOiBFeHByZXNzaW9uLCBjb250ZXh0OiB0cy5Ob2RlLCBjb250ZXh0U291cmNlOiB0cy5Tb3VyY2VGaWxlKTogYm9vbGVhbiB7XG4gIGlmIChpc1dyYXBwZWRUc05vZGVFeHByKGV4cHIpKSB7XG4gICAgY29uc3Qgbm9kZSA9IHRzLmdldE9yaWdpbmFsTm9kZShleHByLm5vZGUpO1xuICAgIHJldHVybiBub2RlLmdldFNvdXJjZUZpbGUoKSA9PT0gY29udGV4dFNvdXJjZSAmJiBjb250ZXh0LnBvcyA8IG5vZGUucG9zO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gaXNXcmFwcGVkVHNOb2RlRXhwcihleHByOiBFeHByZXNzaW9uKTogZXhwciBpcyBXcmFwcGVkTm9kZUV4cHI8dHMuTm9kZT4ge1xuICByZXR1cm4gZXhwciBpbnN0YW5jZW9mIFdyYXBwZWROb2RlRXhwcjtcbn1cblxuZnVuY3Rpb24gbWF5YmVVbndyYXBOYW1lT2ZEZWNsYXJhdGlvbihkZWNsOiB0cy5EZWNsYXJhdGlvbik6IHRzLkRlY2xhcmF0aW9ufHRzLklkZW50aWZpZXIge1xuICBpZiAoKHRzLmlzQ2xhc3NEZWNsYXJhdGlvbihkZWNsKSB8fCB0cy5pc1ZhcmlhYmxlRGVjbGFyYXRpb24oZGVjbCkpICYmIGRlY2wubmFtZSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICB0cy5pc0lkZW50aWZpZXIoZGVjbC5uYW1lKSkge1xuICAgIHJldHVybiBkZWNsLm5hbWU7XG4gIH1cbiAgcmV0dXJuIGRlY2w7XG59XG5cbmZ1bmN0aW9uIHJlYWRTdHJpbmdUeXBlKHR5cGU6IHRzLlR5cGVOb2RlKTogc3RyaW5nfG51bGwge1xuICBpZiAoIXRzLmlzTGl0ZXJhbFR5cGVOb2RlKHR5cGUpIHx8ICF0cy5pc1N0cmluZ0xpdGVyYWwodHlwZS5saXRlcmFsKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiB0eXBlLmxpdGVyYWwudGV4dDtcbn1cblxuZnVuY3Rpb24gcmVhZFN0cmluZ01hcFR5cGUodHlwZTogdHMuVHlwZU5vZGUpOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSB7XG4gIGlmICghdHMuaXNUeXBlTGl0ZXJhbE5vZGUodHlwZSkpIHtcbiAgICByZXR1cm4ge307XG4gIH1cbiAgY29uc3Qgb2JqOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICB0eXBlLm1lbWJlcnMuZm9yRWFjaChtZW1iZXIgPT4ge1xuICAgIGlmICghdHMuaXNQcm9wZXJ0eVNpZ25hdHVyZShtZW1iZXIpIHx8IG1lbWJlci50eXBlID09PSB1bmRlZmluZWQgfHwgbWVtYmVyLm5hbWUgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAhdHMuaXNTdHJpbmdMaXRlcmFsKG1lbWJlci5uYW1lKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZSA9IHJlYWRTdHJpbmdUeXBlKG1lbWJlci50eXBlKTtcbiAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBvYmpbbWVtYmVyLm5hbWUudGV4dF0gPSB2YWx1ZTtcbiAgfSk7XG4gIHJldHVybiBvYmo7XG59XG5cbmZ1bmN0aW9uIHJlYWRTdHJpbmdBcnJheVR5cGUodHlwZTogdHMuVHlwZU5vZGUpOiBzdHJpbmdbXSB7XG4gIGlmICghdHMuaXNUdXBsZVR5cGVOb2RlKHR5cGUpKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIGNvbnN0IHJlczogc3RyaW5nW10gPSBbXTtcbiAgdHlwZS5lbGVtZW50VHlwZXMuZm9yRWFjaChlbCA9PiB7XG4gICAgaWYgKCF0cy5pc0xpdGVyYWxUeXBlTm9kZShlbCkgfHwgIXRzLmlzU3RyaW5nTGl0ZXJhbChlbC5saXRlcmFsKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXMucHVzaChlbC5saXRlcmFsLnRleHQpO1xuICB9KTtcbiAgcmV0dXJuIHJlcztcbn1cbiJdfQ==