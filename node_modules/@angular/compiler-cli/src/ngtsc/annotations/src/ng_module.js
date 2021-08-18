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
        define("@angular/compiler-cli/src/ngtsc/annotations/src/ng_module", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/src/ngtsc/metadata", "@angular/compiler-cli/src/ngtsc/annotations/src/metadata", "@angular/compiler-cli/src/ngtsc/annotations/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var metadata_1 = require("@angular/compiler-cli/src/ngtsc/metadata");
    var metadata_2 = require("@angular/compiler-cli/src/ngtsc/annotations/src/metadata");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/util");
    /**
     * Compiles @NgModule annotations to ngModuleDef fields.
     *
     * TODO(alxhub): handle injector side of things as well.
     */
    var NgModuleDecoratorHandler = /** @class */ (function () {
        function NgModuleDecoratorHandler(checker, reflector, scopeRegistry, referencesRegistry, isCore) {
            this.checker = checker;
            this.reflector = reflector;
            this.scopeRegistry = scopeRegistry;
            this.referencesRegistry = referencesRegistry;
            this.isCore = isCore;
        }
        NgModuleDecoratorHandler.prototype.detect = function (node, decorators) {
            var _this = this;
            if (!decorators) {
                return undefined;
            }
            return decorators.find(function (decorator) { return decorator.name === 'NgModule' && (_this.isCore || util_1.isAngularCore(decorator)); });
        };
        NgModuleDecoratorHandler.prototype.analyze = function (node, decorator) {
            var _this = this;
            var _a, _b, _c, _d;
            if (decorator.args === null || decorator.args.length > 1) {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_ARITY_WRONG, decorator.node, "Incorrect number of arguments to @NgModule decorator");
            }
            // @NgModule can be invoked without arguments. In case it is, pretend as if a blank object
            // literal was specified. This simplifies the code below.
            var meta = decorator.args.length === 1 ? util_1.unwrapExpression(decorator.args[0]) :
                ts.createObjectLiteral([]);
            if (!ts.isObjectLiteralExpression(meta)) {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_ARG_NOT_LITERAL, meta, '@NgModule argument must be an object literal');
            }
            var ngModule = metadata_1.reflectObjectLiteral(meta);
            if (ngModule.has('jit')) {
                // The only allowed value is true, so there's no need to expand further.
                return {};
            }
            // Extract the module declarations, imports, and exports.
            var declarations = [];
            if (ngModule.has('declarations')) {
                var expr = ngModule.get('declarations');
                var declarationMeta = metadata_1.staticallyResolve(expr, this.reflector, this.checker);
                declarations = this.resolveTypeList(expr, declarationMeta, 'declarations');
                (_a = this.referencesRegistry).add.apply(_a, tslib_1.__spread(declarations));
            }
            var imports = [];
            if (ngModule.has('imports')) {
                var expr = ngModule.get('imports');
                var importsMeta = metadata_1.staticallyResolve(expr, this.reflector, this.checker, function (ref) { return _this._extractModuleFromModuleWithProvidersFn(ref.node); });
                imports = this.resolveTypeList(expr, importsMeta, 'imports');
                (_b = this.referencesRegistry).add.apply(_b, tslib_1.__spread(imports));
            }
            var exports = [];
            if (ngModule.has('exports')) {
                var expr = ngModule.get('exports');
                var exportsMeta = metadata_1.staticallyResolve(expr, this.reflector, this.checker, function (ref) { return _this._extractModuleFromModuleWithProvidersFn(ref.node); });
                exports = this.resolveTypeList(expr, exportsMeta, 'exports');
                (_c = this.referencesRegistry).add.apply(_c, tslib_1.__spread(exports));
            }
            var bootstrap = [];
            if (ngModule.has('bootstrap')) {
                var expr = ngModule.get('bootstrap');
                var bootstrapMeta = metadata_1.staticallyResolve(expr, this.reflector, this.checker);
                bootstrap = this.resolveTypeList(expr, bootstrapMeta, 'bootstrap');
                (_d = this.referencesRegistry).add.apply(_d, tslib_1.__spread(bootstrap));
            }
            // Register this module's information with the SelectorScopeRegistry. This ensures that during
            // the compile() phase, the module's metadata is available for selector scope computation.
            this.scopeRegistry.registerModule(node, { declarations: declarations, imports: imports, exports: exports });
            var valueContext = node.getSourceFile();
            var typeContext = valueContext;
            var typeNode = this.reflector.getDtsDeclaration(node);
            if (typeNode !== null) {
                typeContext = typeNode.getSourceFile();
            }
            var ngModuleDef = {
                type: new compiler_1.WrappedNodeExpr(node.name),
                bootstrap: bootstrap.map(function (bootstrap) { return _this._toR3Reference(bootstrap, valueContext, typeContext); }),
                declarations: declarations.map(function (decl) { return _this._toR3Reference(decl, valueContext, typeContext); }),
                exports: exports.map(function (exp) { return _this._toR3Reference(exp, valueContext, typeContext); }),
                imports: imports.map(function (imp) { return _this._toR3Reference(imp, valueContext, typeContext); }),
                emitInline: false,
            };
            var providers = ngModule.has('providers') ?
                new compiler_1.WrappedNodeExpr(ngModule.get('providers')) :
                new compiler_1.LiteralArrayExpr([]);
            var injectorImports = [];
            if (ngModule.has('imports')) {
                injectorImports.push(new compiler_1.WrappedNodeExpr(ngModule.get('imports')));
            }
            if (ngModule.has('exports')) {
                injectorImports.push(new compiler_1.WrappedNodeExpr(ngModule.get('exports')));
            }
            var ngInjectorDef = {
                name: node.name.text,
                type: new compiler_1.WrappedNodeExpr(node.name),
                deps: util_1.getConstructorDependencies(node, this.reflector, this.isCore), providers: providers,
                imports: new compiler_1.LiteralArrayExpr(injectorImports),
            };
            return {
                analysis: {
                    ngModuleDef: ngModuleDef,
                    ngInjectorDef: ngInjectorDef,
                    metadataStmt: metadata_2.generateSetClassMetadataCall(node, this.reflector, this.isCore),
                },
                factorySymbolName: node.name !== undefined ? node.name.text : undefined,
            };
        };
        NgModuleDecoratorHandler.prototype.compile = function (node, analysis) {
            var ngInjectorDef = compiler_1.compileInjector(analysis.ngInjectorDef);
            var ngModuleDef = compiler_1.compileNgModule(analysis.ngModuleDef);
            var ngModuleStatements = ngModuleDef.additionalStatements;
            if (analysis.metadataStmt !== null) {
                ngModuleStatements.push(analysis.metadataStmt);
            }
            return [
                {
                    name: 'ngModuleDef',
                    initializer: ngModuleDef.expression,
                    statements: ngModuleStatements,
                    type: ngModuleDef.type,
                },
                {
                    name: 'ngInjectorDef',
                    initializer: ngInjectorDef.expression,
                    statements: ngInjectorDef.statements,
                    type: ngInjectorDef.type,
                },
            ];
        };
        NgModuleDecoratorHandler.prototype._toR3Reference = function (valueRef, valueContext, typeContext) {
            if (!(valueRef instanceof metadata_1.ResolvedReference)) {
                return util_1.toR3Reference(valueRef, valueRef, valueContext, valueContext);
            }
            else {
                var typeRef = valueRef;
                var typeNode = this.reflector.getDtsDeclaration(typeRef.node);
                if (typeNode !== null && ts.isClassDeclaration(typeNode)) {
                    typeRef = new metadata_1.ResolvedReference(typeNode, typeNode.name);
                }
                return util_1.toR3Reference(valueRef, typeRef, valueContext, typeContext);
            }
        };
        /**
         * Given a `FunctionDeclaration` or `MethodDeclaration`, check if it is typed as a
         * `ModuleWithProviders` and return an expression referencing the module if available.
         */
        NgModuleDecoratorHandler.prototype._extractModuleFromModuleWithProvidersFn = function (node) {
            var type = node.type || null;
            return type &&
                (this._reflectModuleFromTypeParam(type) || this._reflectModuleFromLiteralType(type));
        };
        /**
         * Retrieve an `NgModule` identifier (T) from the specified `type`, if it is of the form:
         * `ModuleWithProviders<T>`
         * @param type The type to reflect on.
         * @returns the identifier of the NgModule type if found, or null otherwise.
         */
        NgModuleDecoratorHandler.prototype._reflectModuleFromTypeParam = function (type) {
            // Examine the type of the function to see if it's a ModuleWithProviders reference.
            if (!ts.isTypeReferenceNode(type) || !ts.isIdentifier(type.typeName)) {
                return null;
            }
            // Look at the type itself to see where it comes from.
            var id = this.reflector.getImportOfIdentifier(type.typeName);
            // If it's not named ModuleWithProviders, bail.
            if (id === null || id.name !== 'ModuleWithProviders') {
                return null;
            }
            // If it's not from @angular/core, bail.
            if (!this.isCore && id.from !== '@angular/core') {
                return null;
            }
            // If there's no type parameter specified, bail.
            if (type.typeArguments === undefined || type.typeArguments.length !== 1) {
                return null;
            }
            var arg = type.typeArguments[0];
            return metadata_1.typeNodeToValueExpr(arg);
        };
        /**
         * Retrieve an `NgModule` identifier (T) from the specified `type`, if it is of the form:
         * `A|B|{ngModule: T}|C`.
         * @param type The type to reflect on.
         * @returns the identifier of the NgModule type if found, or null otherwise.
         */
        NgModuleDecoratorHandler.prototype._reflectModuleFromLiteralType = function (type) {
            var e_1, _a, e_2, _b;
            if (!ts.isIntersectionTypeNode(type)) {
                return null;
            }
            try {
                for (var _c = tslib_1.__values(type.types), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var t = _d.value;
                    if (ts.isTypeLiteralNode(t)) {
                        try {
                            for (var _e = tslib_1.__values(t.members), _f = _e.next(); !_f.done; _f = _e.next()) {
                                var m = _f.value;
                                var ngModuleType = ts.isPropertySignature(m) && ts.isIdentifier(m.name) &&
                                    m.name.text === 'ngModule' && m.type ||
                                    null;
                                var ngModuleExpression = ngModuleType && metadata_1.typeNodeToValueExpr(ngModuleType);
                                if (ngModuleExpression) {
                                    return ngModuleExpression;
                                }
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return null;
        };
        /**
         * Compute a list of `Reference`s from a resolved metadata value.
         */
        NgModuleDecoratorHandler.prototype.resolveTypeList = function (expr, resolvedList, name) {
            var _this = this;
            var refList = [];
            if (!Array.isArray(resolvedList)) {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.VALUE_HAS_WRONG_TYPE, expr, "Expected array when reading property " + name);
            }
            resolvedList.forEach(function (entry, idx) {
                // Unwrap ModuleWithProviders for modules that are locally declared (and thus static
                // resolution was able to descend into the function and return an object literal, a Map).
                if (entry instanceof Map && entry.has('ngModule')) {
                    entry = entry.get('ngModule');
                }
                if (Array.isArray(entry)) {
                    // Recurse into nested arrays.
                    refList.push.apply(refList, tslib_1.__spread(_this.resolveTypeList(expr, entry, name)));
                }
                else if (isDeclarationReference(entry)) {
                    if (!entry.expressable) {
                        throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.VALUE_HAS_WRONG_TYPE, expr, "One entry in " + name + " is not a type");
                    }
                    else if (!_this.reflector.isClass(entry.node)) {
                        throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.VALUE_HAS_WRONG_TYPE, entry.node, "Entry is not a type, but is used as such in " + name + " array");
                    }
                    refList.push(entry);
                }
                else {
                    // TODO(alxhub): expand ModuleWithProviders.
                    throw new Error("Value at position " + idx + " in " + name + " array is not a reference: " + entry);
                }
            });
            return refList;
        };
        return NgModuleDecoratorHandler;
    }());
    exports.NgModuleDecoratorHandler = NgModuleDecoratorHandler;
    function isDeclarationReference(ref) {
        return ref instanceof metadata_1.Reference &&
            (ts.isClassDeclaration(ref.node) || ts.isFunctionDeclaration(ref.node) ||
                ts.isVariableDeclaration(ref.node));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfbW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9hbm5vdGF0aW9ucy9zcmMvbmdfbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILDhDQUFrTDtJQUNsTCwrQkFBaUM7SUFFakMsMkVBQWtFO0lBRWxFLHFFQUF5STtJQUd6SSxxRkFBd0Q7SUFHeEQsNkVBQWtHO0lBUWxHOzs7O09BSUc7SUFDSDtRQUNFLGtDQUNZLE9BQXVCLEVBQVUsU0FBeUIsRUFDMUQsYUFBb0MsRUFBVSxrQkFBc0MsRUFDcEYsTUFBZTtZQUZmLFlBQU8sR0FBUCxPQUFPLENBQWdCO1lBQVUsY0FBUyxHQUFULFNBQVMsQ0FBZ0I7WUFDMUQsa0JBQWEsR0FBYixhQUFhLENBQXVCO1lBQVUsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUNwRixXQUFNLEdBQU4sTUFBTSxDQUFTO1FBQUcsQ0FBQztRQUUvQix5Q0FBTSxHQUFOLFVBQU8sSUFBb0IsRUFBRSxVQUE0QjtZQUF6RCxpQkFNQztZQUxDLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ2YsT0FBTyxTQUFTLENBQUM7YUFDbEI7WUFDRCxPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQ2xCLFVBQUEsU0FBUyxJQUFJLE9BQUEsU0FBUyxDQUFDLElBQUksS0FBSyxVQUFVLElBQUksQ0FBQyxLQUFJLENBQUMsTUFBTSxJQUFJLG9CQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBMUUsQ0FBMEUsQ0FBQyxDQUFDO1FBQy9GLENBQUM7UUFFRCwwQ0FBTyxHQUFQLFVBQVEsSUFBeUIsRUFBRSxTQUFvQjtZQUF2RCxpQkEyR0M7O1lBMUdDLElBQUksU0FBUyxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN4RCxNQUFNLElBQUksa0NBQW9CLENBQzFCLHVCQUFTLENBQUMscUJBQXFCLEVBQUUsU0FBUyxDQUFDLElBQUksRUFDL0Msc0RBQXNELENBQUMsQ0FBQzthQUM3RDtZQUVELDBGQUEwRjtZQUMxRix5REFBeUQ7WUFDekQsSUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyx1QkFBZ0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRXRFLElBQUksQ0FBQyxFQUFFLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3ZDLE1BQU0sSUFBSSxrQ0FBb0IsQ0FDMUIsdUJBQVMsQ0FBQyx5QkFBeUIsRUFBRSxJQUFJLEVBQ3pDLDhDQUE4QyxDQUFDLENBQUM7YUFDckQ7WUFDRCxJQUFNLFFBQVEsR0FBRywrQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUU1QyxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3ZCLHdFQUF3RTtnQkFDeEUsT0FBTyxFQUFFLENBQUM7YUFDWDtZQUVELHlEQUF5RDtZQUN6RCxJQUFJLFlBQVksR0FBZ0MsRUFBRSxDQUFDO1lBQ25ELElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFBRTtnQkFDaEMsSUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUcsQ0FBQztnQkFDNUMsSUFBTSxlQUFlLEdBQUcsNEJBQWlCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM5RSxZQUFZLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLGNBQWMsQ0FBQyxDQUFDO2dCQUMzRSxDQUFBLEtBQUEsSUFBSSxDQUFDLGtCQUFrQixDQUFBLENBQUMsR0FBRyw0QkFBSSxZQUFZLEdBQUU7YUFDOUM7WUFDRCxJQUFJLE9BQU8sR0FBZ0MsRUFBRSxDQUFDO1lBQzlDLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDM0IsSUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUcsQ0FBQztnQkFDdkMsSUFBTSxXQUFXLEdBQUcsNEJBQWlCLENBQ2pDLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQ2xDLFVBQUEsR0FBRyxJQUFJLE9BQUEsS0FBSSxDQUFDLHVDQUF1QyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBdEQsQ0FBc0QsQ0FBQyxDQUFDO2dCQUNuRSxPQUFPLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUM3RCxDQUFBLEtBQUEsSUFBSSxDQUFDLGtCQUFrQixDQUFBLENBQUMsR0FBRyw0QkFBSSxPQUFPLEdBQUU7YUFDekM7WUFDRCxJQUFJLE9BQU8sR0FBZ0MsRUFBRSxDQUFDO1lBQzlDLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDM0IsSUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUcsQ0FBQztnQkFDdkMsSUFBTSxXQUFXLEdBQUcsNEJBQWlCLENBQ2pDLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQ2xDLFVBQUEsR0FBRyxJQUFJLE9BQUEsS0FBSSxDQUFDLHVDQUF1QyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBdEQsQ0FBc0QsQ0FBQyxDQUFDO2dCQUNuRSxPQUFPLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUM3RCxDQUFBLEtBQUEsSUFBSSxDQUFDLGtCQUFrQixDQUFBLENBQUMsR0FBRyw0QkFBSSxPQUFPLEdBQUU7YUFDekM7WUFDRCxJQUFJLFNBQVMsR0FBZ0MsRUFBRSxDQUFDO1lBQ2hELElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRTtnQkFDN0IsSUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUcsQ0FBQztnQkFDekMsSUFBTSxhQUFhLEdBQUcsNEJBQWlCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM1RSxTQUFTLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUNuRSxDQUFBLEtBQUEsSUFBSSxDQUFDLGtCQUFrQixDQUFBLENBQUMsR0FBRyw0QkFBSSxTQUFTLEdBQUU7YUFDM0M7WUFFRCw4RkFBOEY7WUFDOUYsMEZBQTBGO1lBQzFGLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxFQUFDLFlBQVksY0FBQSxFQUFFLE9BQU8sU0FBQSxFQUFFLE9BQU8sU0FBQSxFQUFDLENBQUMsQ0FBQztZQUUxRSxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFFMUMsSUFBSSxXQUFXLEdBQUcsWUFBWSxDQUFDO1lBQy9CLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEQsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO2dCQUNyQixXQUFXLEdBQUcsUUFBUSxDQUFDLGFBQWEsRUFBRSxDQUFDO2FBQ3hDO1lBRUQsSUFBTSxXQUFXLEdBQXVCO2dCQUN0QyxJQUFJLEVBQUUsSUFBSSwwQkFBZSxDQUFDLElBQUksQ0FBQyxJQUFNLENBQUM7Z0JBQ3RDLFNBQVMsRUFDTCxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQUEsU0FBUyxJQUFJLE9BQUEsS0FBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQyxFQUF6RCxDQUF5RCxDQUFDO2dCQUN6RixZQUFZLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLEtBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxXQUFXLENBQUMsRUFBcEQsQ0FBb0QsQ0FBQztnQkFDNUYsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxLQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxZQUFZLEVBQUUsV0FBVyxDQUFDLEVBQW5ELENBQW1ELENBQUM7Z0JBQ2hGLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUEsS0FBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQyxFQUFuRCxDQUFtRCxDQUFDO2dCQUNoRixVQUFVLEVBQUUsS0FBSzthQUNsQixDQUFDO1lBRUYsSUFBTSxTQUFTLEdBQWUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLDBCQUFlLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xELElBQUksMkJBQWdCLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFN0IsSUFBTSxlQUFlLEdBQXFDLEVBQUUsQ0FBQztZQUM3RCxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQzNCLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSwwQkFBZSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ3RFO1lBQ0QsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUMzQixlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksMEJBQWUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBRyxDQUFDLENBQUMsQ0FBQzthQUN0RTtZQUVELElBQU0sYUFBYSxHQUF1QjtnQkFDeEMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFNLENBQUMsSUFBSTtnQkFDdEIsSUFBSSxFQUFFLElBQUksMEJBQWUsQ0FBQyxJQUFJLENBQUMsSUFBTSxDQUFDO2dCQUN0QyxJQUFJLEVBQUUsaUNBQTBCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFNBQVMsV0FBQTtnQkFDOUUsT0FBTyxFQUFFLElBQUksMkJBQWdCLENBQUMsZUFBZSxDQUFDO2FBQy9DLENBQUM7WUFFRixPQUFPO2dCQUNMLFFBQVEsRUFBRTtvQkFDUixXQUFXLGFBQUE7b0JBQ1gsYUFBYSxlQUFBO29CQUNiLFlBQVksRUFBRSx1Q0FBNEIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDO2lCQUM5RTtnQkFDRCxpQkFBaUIsRUFBRSxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVM7YUFDeEUsQ0FBQztRQUNKLENBQUM7UUFFRCwwQ0FBTyxHQUFQLFVBQVEsSUFBeUIsRUFBRSxRQUEwQjtZQUMzRCxJQUFNLGFBQWEsR0FBRywwQkFBZSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUM5RCxJQUFNLFdBQVcsR0FBRywwQkFBZSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMxRCxJQUFNLGtCQUFrQixHQUFHLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQztZQUM1RCxJQUFJLFFBQVEsQ0FBQyxZQUFZLEtBQUssSUFBSSxFQUFFO2dCQUNsQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQ2hEO1lBQ0QsT0FBTztnQkFDTDtvQkFDRSxJQUFJLEVBQUUsYUFBYTtvQkFDbkIsV0FBVyxFQUFFLFdBQVcsQ0FBQyxVQUFVO29CQUNuQyxVQUFVLEVBQUUsa0JBQWtCO29CQUM5QixJQUFJLEVBQUUsV0FBVyxDQUFDLElBQUk7aUJBQ3ZCO2dCQUNEO29CQUNFLElBQUksRUFBRSxlQUFlO29CQUNyQixXQUFXLEVBQUUsYUFBYSxDQUFDLFVBQVU7b0JBQ3JDLFVBQVUsRUFBRSxhQUFhLENBQUMsVUFBVTtvQkFDcEMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxJQUFJO2lCQUN6QjthQUNGLENBQUM7UUFDSixDQUFDO1FBRU8saURBQWMsR0FBdEIsVUFDSSxRQUFtQyxFQUFFLFlBQTJCLEVBQ2hFLFdBQTBCO1lBQzVCLElBQUksQ0FBQyxDQUFDLFFBQVEsWUFBWSw0QkFBaUIsQ0FBQyxFQUFFO2dCQUM1QyxPQUFPLG9CQUFhLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFDdEU7aUJBQU07Z0JBQ0wsSUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDO2dCQUN2QixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDOUQsSUFBSSxRQUFRLEtBQUssSUFBSSxJQUFJLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDeEQsT0FBTyxHQUFHLElBQUksNEJBQWlCLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxJQUFNLENBQUMsQ0FBQztpQkFDNUQ7Z0JBQ0QsT0FBTyxvQkFBYSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2FBQ3BFO1FBQ0gsQ0FBQztRQUVEOzs7V0FHRztRQUNLLDBFQUF1QyxHQUEvQyxVQUFnRCxJQUNvQjtZQUNsRSxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQztZQUMvQixPQUFPLElBQUk7Z0JBQ1AsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLDZCQUE2QixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDM0YsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0ssOERBQTJCLEdBQW5DLFVBQW9DLElBQWlCO1lBQ25ELG1GQUFtRjtZQUNuRixJQUFJLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3BFLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCxzREFBc0Q7WUFDdEQsSUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFL0QsK0NBQStDO1lBQy9DLElBQUksRUFBRSxLQUFLLElBQUksSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLHFCQUFxQixFQUFFO2dCQUNwRCxPQUFPLElBQUksQ0FBQzthQUNiO1lBRUQsd0NBQXdDO1lBQ3hDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssZUFBZSxFQUFFO2dCQUMvQyxPQUFPLElBQUksQ0FBQzthQUNiO1lBRUQsZ0RBQWdEO1lBQ2hELElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN2RSxPQUFPLElBQUksQ0FBQzthQUNiO1lBRUQsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVsQyxPQUFPLDhCQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNLLGdFQUE2QixHQUFyQyxVQUFzQyxJQUFpQjs7WUFDckQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDcEMsT0FBTyxJQUFJLENBQUM7YUFDYjs7Z0JBQ0QsS0FBZ0IsSUFBQSxLQUFBLGlCQUFBLElBQUksQ0FBQyxLQUFLLENBQUEsZ0JBQUEsNEJBQUU7b0JBQXZCLElBQU0sQ0FBQyxXQUFBO29CQUNWLElBQUksRUFBRSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUFFOzs0QkFDM0IsS0FBZ0IsSUFBQSxLQUFBLGlCQUFBLENBQUMsQ0FBQyxPQUFPLENBQUEsZ0JBQUEsNEJBQUU7Z0NBQXRCLElBQU0sQ0FBQyxXQUFBO2dDQUNWLElBQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7b0NBQ2pFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFVBQVUsSUFBSSxDQUFDLENBQUMsSUFBSTtvQ0FDeEMsSUFBSSxDQUFDO2dDQUNULElBQU0sa0JBQWtCLEdBQUcsWUFBWSxJQUFJLDhCQUFtQixDQUFDLFlBQVksQ0FBQyxDQUFDO2dDQUM3RSxJQUFJLGtCQUFrQixFQUFFO29DQUN0QixPQUFPLGtCQUFrQixDQUFDO2lDQUMzQjs2QkFDRjs7Ozs7Ozs7O3FCQUNGO2lCQUNGOzs7Ozs7Ozs7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRDs7V0FFRztRQUNLLGtEQUFlLEdBQXZCLFVBQXdCLElBQWEsRUFBRSxZQUEyQixFQUFFLElBQVk7WUFBaEYsaUJBbUNDO1lBakNDLElBQU0sT0FBTyxHQUFnQyxFQUFFLENBQUM7WUFDaEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUU7Z0JBQ2hDLE1BQU0sSUFBSSxrQ0FBb0IsQ0FDMUIsdUJBQVMsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsMENBQXdDLElBQU0sQ0FBQyxDQUFDO2FBQzNGO1lBRUQsWUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQUssRUFBRSxHQUFHO2dCQUM5QixvRkFBb0Y7Z0JBQ3BGLHlGQUF5RjtnQkFDekYsSUFBSSxLQUFLLFlBQVksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7b0JBQ2pELEtBQUssR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBRyxDQUFDO2lCQUNqQztnQkFFRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ3hCLDhCQUE4QjtvQkFDOUIsT0FBTyxDQUFDLElBQUksT0FBWixPQUFPLG1CQUFTLEtBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRTtpQkFDMUQ7cUJBQU0sSUFBSSxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDeEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUU7d0JBQ3RCLE1BQU0sSUFBSSxrQ0FBb0IsQ0FDMUIsdUJBQVMsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsa0JBQWdCLElBQUksbUJBQWdCLENBQUMsQ0FBQztxQkFDakY7eUJBQU0sSUFBSSxDQUFDLEtBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDOUMsTUFBTSxJQUFJLGtDQUFvQixDQUMxQix1QkFBUyxDQUFDLG9CQUFvQixFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQzFDLGlEQUErQyxJQUFJLFdBQVEsQ0FBQyxDQUFDO3FCQUNsRTtvQkFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNyQjtxQkFBTTtvQkFDTCw0Q0FBNEM7b0JBQzVDLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXFCLEdBQUcsWUFBTyxJQUFJLG1DQUE4QixLQUFPLENBQUMsQ0FBQztpQkFDM0Y7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sT0FBTyxDQUFDO1FBQ2pCLENBQUM7UUFDSCwrQkFBQztJQUFELENBQUMsQUFoUkQsSUFnUkM7SUFoUlksNERBQXdCO0lBa1JyQyxTQUFTLHNCQUFzQixDQUFDLEdBQVE7UUFDdEMsT0FBTyxHQUFHLFlBQVksb0JBQVM7WUFDM0IsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO2dCQUNyRSxFQUFFLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDM0MsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtFeHByZXNzaW9uLCBMaXRlcmFsQXJyYXlFeHByLCBSM0luamVjdG9yTWV0YWRhdGEsIFIzTmdNb2R1bGVNZXRhZGF0YSwgUjNSZWZlcmVuY2UsIFN0YXRlbWVudCwgV3JhcHBlZE5vZGVFeHByLCBjb21waWxlSW5qZWN0b3IsIGNvbXBpbGVOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7RXJyb3JDb2RlLCBGYXRhbERpYWdub3N0aWNFcnJvcn0gZnJvbSAnLi4vLi4vZGlhZ25vc3RpY3MnO1xuaW1wb3J0IHtEZWNvcmF0b3IsIFJlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi8uLi9ob3N0JztcbmltcG9ydCB7UmVmZXJlbmNlLCBSZXNvbHZlZFJlZmVyZW5jZSwgUmVzb2x2ZWRWYWx1ZSwgcmVmbGVjdE9iamVjdExpdGVyYWwsIHN0YXRpY2FsbHlSZXNvbHZlLCB0eXBlTm9kZVRvVmFsdWVFeHByfSBmcm9tICcuLi8uLi9tZXRhZGF0YSc7XG5pbXBvcnQge0FuYWx5c2lzT3V0cHV0LCBDb21waWxlUmVzdWx0LCBEZWNvcmF0b3JIYW5kbGVyfSBmcm9tICcuLi8uLi90cmFuc2Zvcm0nO1xuXG5pbXBvcnQge2dlbmVyYXRlU2V0Q2xhc3NNZXRhZGF0YUNhbGx9IGZyb20gJy4vbWV0YWRhdGEnO1xuaW1wb3J0IHtSZWZlcmVuY2VzUmVnaXN0cnl9IGZyb20gJy4vcmVmZXJlbmNlc19yZWdpc3RyeSc7XG5pbXBvcnQge1NlbGVjdG9yU2NvcGVSZWdpc3RyeX0gZnJvbSAnLi9zZWxlY3Rvcl9zY29wZSc7XG5pbXBvcnQge2dldENvbnN0cnVjdG9yRGVwZW5kZW5jaWVzLCBpc0FuZ3VsYXJDb3JlLCB0b1IzUmVmZXJlbmNlLCB1bndyYXBFeHByZXNzaW9ufSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE5nTW9kdWxlQW5hbHlzaXMge1xuICBuZ01vZHVsZURlZjogUjNOZ01vZHVsZU1ldGFkYXRhO1xuICBuZ0luamVjdG9yRGVmOiBSM0luamVjdG9yTWV0YWRhdGE7XG4gIG1ldGFkYXRhU3RtdDogU3RhdGVtZW50fG51bGw7XG59XG5cbi8qKlxuICogQ29tcGlsZXMgQE5nTW9kdWxlIGFubm90YXRpb25zIHRvIG5nTW9kdWxlRGVmIGZpZWxkcy5cbiAqXG4gKiBUT0RPKGFseGh1Yik6IGhhbmRsZSBpbmplY3RvciBzaWRlIG9mIHRoaW5ncyBhcyB3ZWxsLlxuICovXG5leHBvcnQgY2xhc3MgTmdNb2R1bGVEZWNvcmF0b3JIYW5kbGVyIGltcGxlbWVudHMgRGVjb3JhdG9ySGFuZGxlcjxOZ01vZHVsZUFuYWx5c2lzLCBEZWNvcmF0b3I+IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLCBwcml2YXRlIHJlZmxlY3RvcjogUmVmbGVjdGlvbkhvc3QsXG4gICAgICBwcml2YXRlIHNjb3BlUmVnaXN0cnk6IFNlbGVjdG9yU2NvcGVSZWdpc3RyeSwgcHJpdmF0ZSByZWZlcmVuY2VzUmVnaXN0cnk6IFJlZmVyZW5jZXNSZWdpc3RyeSxcbiAgICAgIHByaXZhdGUgaXNDb3JlOiBib29sZWFuKSB7fVxuXG4gIGRldGVjdChub2RlOiB0cy5EZWNsYXJhdGlvbiwgZGVjb3JhdG9yczogRGVjb3JhdG9yW118bnVsbCk6IERlY29yYXRvcnx1bmRlZmluZWQge1xuICAgIGlmICghZGVjb3JhdG9ycykge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIGRlY29yYXRvcnMuZmluZChcbiAgICAgICAgZGVjb3JhdG9yID0+IGRlY29yYXRvci5uYW1lID09PSAnTmdNb2R1bGUnICYmICh0aGlzLmlzQ29yZSB8fCBpc0FuZ3VsYXJDb3JlKGRlY29yYXRvcikpKTtcbiAgfVxuXG4gIGFuYWx5emUobm9kZTogdHMuQ2xhc3NEZWNsYXJhdGlvbiwgZGVjb3JhdG9yOiBEZWNvcmF0b3IpOiBBbmFseXNpc091dHB1dDxOZ01vZHVsZUFuYWx5c2lzPiB7XG4gICAgaWYgKGRlY29yYXRvci5hcmdzID09PSBudWxsIHx8IGRlY29yYXRvci5hcmdzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHRocm93IG5ldyBGYXRhbERpYWdub3N0aWNFcnJvcihcbiAgICAgICAgICBFcnJvckNvZGUuREVDT1JBVE9SX0FSSVRZX1dST05HLCBkZWNvcmF0b3Iubm9kZSxcbiAgICAgICAgICBgSW5jb3JyZWN0IG51bWJlciBvZiBhcmd1bWVudHMgdG8gQE5nTW9kdWxlIGRlY29yYXRvcmApO1xuICAgIH1cblxuICAgIC8vIEBOZ01vZHVsZSBjYW4gYmUgaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50cy4gSW4gY2FzZSBpdCBpcywgcHJldGVuZCBhcyBpZiBhIGJsYW5rIG9iamVjdFxuICAgIC8vIGxpdGVyYWwgd2FzIHNwZWNpZmllZC4gVGhpcyBzaW1wbGlmaWVzIHRoZSBjb2RlIGJlbG93LlxuICAgIGNvbnN0IG1ldGEgPSBkZWNvcmF0b3IuYXJncy5sZW5ndGggPT09IDEgPyB1bndyYXBFeHByZXNzaW9uKGRlY29yYXRvci5hcmdzWzBdKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRzLmNyZWF0ZU9iamVjdExpdGVyYWwoW10pO1xuXG4gICAgaWYgKCF0cy5pc09iamVjdExpdGVyYWxFeHByZXNzaW9uKG1ldGEpKSB7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxEaWFnbm9zdGljRXJyb3IoXG4gICAgICAgICAgRXJyb3JDb2RlLkRFQ09SQVRPUl9BUkdfTk9UX0xJVEVSQUwsIG1ldGEsXG4gICAgICAgICAgJ0BOZ01vZHVsZSBhcmd1bWVudCBtdXN0IGJlIGFuIG9iamVjdCBsaXRlcmFsJyk7XG4gICAgfVxuICAgIGNvbnN0IG5nTW9kdWxlID0gcmVmbGVjdE9iamVjdExpdGVyYWwobWV0YSk7XG5cbiAgICBpZiAobmdNb2R1bGUuaGFzKCdqaXQnKSkge1xuICAgICAgLy8gVGhlIG9ubHkgYWxsb3dlZCB2YWx1ZSBpcyB0cnVlLCBzbyB0aGVyZSdzIG5vIG5lZWQgdG8gZXhwYW5kIGZ1cnRoZXIuXG4gICAgICByZXR1cm4ge307XG4gICAgfVxuXG4gICAgLy8gRXh0cmFjdCB0aGUgbW9kdWxlIGRlY2xhcmF0aW9ucywgaW1wb3J0cywgYW5kIGV4cG9ydHMuXG4gICAgbGV0IGRlY2xhcmF0aW9uczogUmVmZXJlbmNlPHRzLkRlY2xhcmF0aW9uPltdID0gW107XG4gICAgaWYgKG5nTW9kdWxlLmhhcygnZGVjbGFyYXRpb25zJykpIHtcbiAgICAgIGNvbnN0IGV4cHIgPSBuZ01vZHVsZS5nZXQoJ2RlY2xhcmF0aW9ucycpICE7XG4gICAgICBjb25zdCBkZWNsYXJhdGlvbk1ldGEgPSBzdGF0aWNhbGx5UmVzb2x2ZShleHByLCB0aGlzLnJlZmxlY3RvciwgdGhpcy5jaGVja2VyKTtcbiAgICAgIGRlY2xhcmF0aW9ucyA9IHRoaXMucmVzb2x2ZVR5cGVMaXN0KGV4cHIsIGRlY2xhcmF0aW9uTWV0YSwgJ2RlY2xhcmF0aW9ucycpO1xuICAgICAgdGhpcy5yZWZlcmVuY2VzUmVnaXN0cnkuYWRkKC4uLmRlY2xhcmF0aW9ucyk7XG4gICAgfVxuICAgIGxldCBpbXBvcnRzOiBSZWZlcmVuY2U8dHMuRGVjbGFyYXRpb24+W10gPSBbXTtcbiAgICBpZiAobmdNb2R1bGUuaGFzKCdpbXBvcnRzJykpIHtcbiAgICAgIGNvbnN0IGV4cHIgPSBuZ01vZHVsZS5nZXQoJ2ltcG9ydHMnKSAhO1xuICAgICAgY29uc3QgaW1wb3J0c01ldGEgPSBzdGF0aWNhbGx5UmVzb2x2ZShcbiAgICAgICAgICBleHByLCB0aGlzLnJlZmxlY3RvciwgdGhpcy5jaGVja2VyLFxuICAgICAgICAgIHJlZiA9PiB0aGlzLl9leHRyYWN0TW9kdWxlRnJvbU1vZHVsZVdpdGhQcm92aWRlcnNGbihyZWYubm9kZSkpO1xuICAgICAgaW1wb3J0cyA9IHRoaXMucmVzb2x2ZVR5cGVMaXN0KGV4cHIsIGltcG9ydHNNZXRhLCAnaW1wb3J0cycpO1xuICAgICAgdGhpcy5yZWZlcmVuY2VzUmVnaXN0cnkuYWRkKC4uLmltcG9ydHMpO1xuICAgIH1cbiAgICBsZXQgZXhwb3J0czogUmVmZXJlbmNlPHRzLkRlY2xhcmF0aW9uPltdID0gW107XG4gICAgaWYgKG5nTW9kdWxlLmhhcygnZXhwb3J0cycpKSB7XG4gICAgICBjb25zdCBleHByID0gbmdNb2R1bGUuZ2V0KCdleHBvcnRzJykgITtcbiAgICAgIGNvbnN0IGV4cG9ydHNNZXRhID0gc3RhdGljYWxseVJlc29sdmUoXG4gICAgICAgICAgZXhwciwgdGhpcy5yZWZsZWN0b3IsIHRoaXMuY2hlY2tlcixcbiAgICAgICAgICByZWYgPT4gdGhpcy5fZXh0cmFjdE1vZHVsZUZyb21Nb2R1bGVXaXRoUHJvdmlkZXJzRm4ocmVmLm5vZGUpKTtcbiAgICAgIGV4cG9ydHMgPSB0aGlzLnJlc29sdmVUeXBlTGlzdChleHByLCBleHBvcnRzTWV0YSwgJ2V4cG9ydHMnKTtcbiAgICAgIHRoaXMucmVmZXJlbmNlc1JlZ2lzdHJ5LmFkZCguLi5leHBvcnRzKTtcbiAgICB9XG4gICAgbGV0IGJvb3RzdHJhcDogUmVmZXJlbmNlPHRzLkRlY2xhcmF0aW9uPltdID0gW107XG4gICAgaWYgKG5nTW9kdWxlLmhhcygnYm9vdHN0cmFwJykpIHtcbiAgICAgIGNvbnN0IGV4cHIgPSBuZ01vZHVsZS5nZXQoJ2Jvb3RzdHJhcCcpICE7XG4gICAgICBjb25zdCBib290c3RyYXBNZXRhID0gc3RhdGljYWxseVJlc29sdmUoZXhwciwgdGhpcy5yZWZsZWN0b3IsIHRoaXMuY2hlY2tlcik7XG4gICAgICBib290c3RyYXAgPSB0aGlzLnJlc29sdmVUeXBlTGlzdChleHByLCBib290c3RyYXBNZXRhLCAnYm9vdHN0cmFwJyk7XG4gICAgICB0aGlzLnJlZmVyZW5jZXNSZWdpc3RyeS5hZGQoLi4uYm9vdHN0cmFwKTtcbiAgICB9XG5cbiAgICAvLyBSZWdpc3RlciB0aGlzIG1vZHVsZSdzIGluZm9ybWF0aW9uIHdpdGggdGhlIFNlbGVjdG9yU2NvcGVSZWdpc3RyeS4gVGhpcyBlbnN1cmVzIHRoYXQgZHVyaW5nXG4gICAgLy8gdGhlIGNvbXBpbGUoKSBwaGFzZSwgdGhlIG1vZHVsZSdzIG1ldGFkYXRhIGlzIGF2YWlsYWJsZSBmb3Igc2VsZWN0b3Igc2NvcGUgY29tcHV0YXRpb24uXG4gICAgdGhpcy5zY29wZVJlZ2lzdHJ5LnJlZ2lzdGVyTW9kdWxlKG5vZGUsIHtkZWNsYXJhdGlvbnMsIGltcG9ydHMsIGV4cG9ydHN9KTtcblxuICAgIGNvbnN0IHZhbHVlQ29udGV4dCA9IG5vZGUuZ2V0U291cmNlRmlsZSgpO1xuXG4gICAgbGV0IHR5cGVDb250ZXh0ID0gdmFsdWVDb250ZXh0O1xuICAgIGNvbnN0IHR5cGVOb2RlID0gdGhpcy5yZWZsZWN0b3IuZ2V0RHRzRGVjbGFyYXRpb24obm9kZSk7XG4gICAgaWYgKHR5cGVOb2RlICE9PSBudWxsKSB7XG4gICAgICB0eXBlQ29udGV4dCA9IHR5cGVOb2RlLmdldFNvdXJjZUZpbGUoKTtcbiAgICB9XG5cbiAgICBjb25zdCBuZ01vZHVsZURlZjogUjNOZ01vZHVsZU1ldGFkYXRhID0ge1xuICAgICAgdHlwZTogbmV3IFdyYXBwZWROb2RlRXhwcihub2RlLm5hbWUgISksXG4gICAgICBib290c3RyYXA6XG4gICAgICAgICAgYm9vdHN0cmFwLm1hcChib290c3RyYXAgPT4gdGhpcy5fdG9SM1JlZmVyZW5jZShib290c3RyYXAsIHZhbHVlQ29udGV4dCwgdHlwZUNvbnRleHQpKSxcbiAgICAgIGRlY2xhcmF0aW9uczogZGVjbGFyYXRpb25zLm1hcChkZWNsID0+IHRoaXMuX3RvUjNSZWZlcmVuY2UoZGVjbCwgdmFsdWVDb250ZXh0LCB0eXBlQ29udGV4dCkpLFxuICAgICAgZXhwb3J0czogZXhwb3J0cy5tYXAoZXhwID0+IHRoaXMuX3RvUjNSZWZlcmVuY2UoZXhwLCB2YWx1ZUNvbnRleHQsIHR5cGVDb250ZXh0KSksXG4gICAgICBpbXBvcnRzOiBpbXBvcnRzLm1hcChpbXAgPT4gdGhpcy5fdG9SM1JlZmVyZW5jZShpbXAsIHZhbHVlQ29udGV4dCwgdHlwZUNvbnRleHQpKSxcbiAgICAgIGVtaXRJbmxpbmU6IGZhbHNlLFxuICAgIH07XG5cbiAgICBjb25zdCBwcm92aWRlcnM6IEV4cHJlc3Npb24gPSBuZ01vZHVsZS5oYXMoJ3Byb3ZpZGVycycpID9cbiAgICAgICAgbmV3IFdyYXBwZWROb2RlRXhwcihuZ01vZHVsZS5nZXQoJ3Byb3ZpZGVycycpICEpIDpcbiAgICAgICAgbmV3IExpdGVyYWxBcnJheUV4cHIoW10pO1xuXG4gICAgY29uc3QgaW5qZWN0b3JJbXBvcnRzOiBXcmFwcGVkTm9kZUV4cHI8dHMuRXhwcmVzc2lvbj5bXSA9IFtdO1xuICAgIGlmIChuZ01vZHVsZS5oYXMoJ2ltcG9ydHMnKSkge1xuICAgICAgaW5qZWN0b3JJbXBvcnRzLnB1c2gobmV3IFdyYXBwZWROb2RlRXhwcihuZ01vZHVsZS5nZXQoJ2ltcG9ydHMnKSAhKSk7XG4gICAgfVxuICAgIGlmIChuZ01vZHVsZS5oYXMoJ2V4cG9ydHMnKSkge1xuICAgICAgaW5qZWN0b3JJbXBvcnRzLnB1c2gobmV3IFdyYXBwZWROb2RlRXhwcihuZ01vZHVsZS5nZXQoJ2V4cG9ydHMnKSAhKSk7XG4gICAgfVxuXG4gICAgY29uc3QgbmdJbmplY3RvckRlZjogUjNJbmplY3Rvck1ldGFkYXRhID0ge1xuICAgICAgbmFtZTogbm9kZS5uYW1lICEudGV4dCxcbiAgICAgIHR5cGU6IG5ldyBXcmFwcGVkTm9kZUV4cHIobm9kZS5uYW1lICEpLFxuICAgICAgZGVwczogZ2V0Q29uc3RydWN0b3JEZXBlbmRlbmNpZXMobm9kZSwgdGhpcy5yZWZsZWN0b3IsIHRoaXMuaXNDb3JlKSwgcHJvdmlkZXJzLFxuICAgICAgaW1wb3J0czogbmV3IExpdGVyYWxBcnJheUV4cHIoaW5qZWN0b3JJbXBvcnRzKSxcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGFuYWx5c2lzOiB7XG4gICAgICAgIG5nTW9kdWxlRGVmLFxuICAgICAgICBuZ0luamVjdG9yRGVmLFxuICAgICAgICBtZXRhZGF0YVN0bXQ6IGdlbmVyYXRlU2V0Q2xhc3NNZXRhZGF0YUNhbGwobm9kZSwgdGhpcy5yZWZsZWN0b3IsIHRoaXMuaXNDb3JlKSxcbiAgICAgIH0sXG4gICAgICBmYWN0b3J5U3ltYm9sTmFtZTogbm9kZS5uYW1lICE9PSB1bmRlZmluZWQgPyBub2RlLm5hbWUudGV4dCA6IHVuZGVmaW5lZCxcbiAgICB9O1xuICB9XG5cbiAgY29tcGlsZShub2RlOiB0cy5DbGFzc0RlY2xhcmF0aW9uLCBhbmFseXNpczogTmdNb2R1bGVBbmFseXNpcyk6IENvbXBpbGVSZXN1bHRbXSB7XG4gICAgY29uc3QgbmdJbmplY3RvckRlZiA9IGNvbXBpbGVJbmplY3RvcihhbmFseXNpcy5uZ0luamVjdG9yRGVmKTtcbiAgICBjb25zdCBuZ01vZHVsZURlZiA9IGNvbXBpbGVOZ01vZHVsZShhbmFseXNpcy5uZ01vZHVsZURlZik7XG4gICAgY29uc3QgbmdNb2R1bGVTdGF0ZW1lbnRzID0gbmdNb2R1bGVEZWYuYWRkaXRpb25hbFN0YXRlbWVudHM7XG4gICAgaWYgKGFuYWx5c2lzLm1ldGFkYXRhU3RtdCAhPT0gbnVsbCkge1xuICAgICAgbmdNb2R1bGVTdGF0ZW1lbnRzLnB1c2goYW5hbHlzaXMubWV0YWRhdGFTdG10KTtcbiAgICB9XG4gICAgcmV0dXJuIFtcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ25nTW9kdWxlRGVmJyxcbiAgICAgICAgaW5pdGlhbGl6ZXI6IG5nTW9kdWxlRGVmLmV4cHJlc3Npb24sXG4gICAgICAgIHN0YXRlbWVudHM6IG5nTW9kdWxlU3RhdGVtZW50cyxcbiAgICAgICAgdHlwZTogbmdNb2R1bGVEZWYudHlwZSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICduZ0luamVjdG9yRGVmJyxcbiAgICAgICAgaW5pdGlhbGl6ZXI6IG5nSW5qZWN0b3JEZWYuZXhwcmVzc2lvbixcbiAgICAgICAgc3RhdGVtZW50czogbmdJbmplY3RvckRlZi5zdGF0ZW1lbnRzLFxuICAgICAgICB0eXBlOiBuZ0luamVjdG9yRGVmLnR5cGUsXG4gICAgICB9LFxuICAgIF07XG4gIH1cblxuICBwcml2YXRlIF90b1IzUmVmZXJlbmNlKFxuICAgICAgdmFsdWVSZWY6IFJlZmVyZW5jZTx0cy5EZWNsYXJhdGlvbj4sIHZhbHVlQ29udGV4dDogdHMuU291cmNlRmlsZSxcbiAgICAgIHR5cGVDb250ZXh0OiB0cy5Tb3VyY2VGaWxlKTogUjNSZWZlcmVuY2Uge1xuICAgIGlmICghKHZhbHVlUmVmIGluc3RhbmNlb2YgUmVzb2x2ZWRSZWZlcmVuY2UpKSB7XG4gICAgICByZXR1cm4gdG9SM1JlZmVyZW5jZSh2YWx1ZVJlZiwgdmFsdWVSZWYsIHZhbHVlQ29udGV4dCwgdmFsdWVDb250ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHR5cGVSZWYgPSB2YWx1ZVJlZjtcbiAgICAgIGxldCB0eXBlTm9kZSA9IHRoaXMucmVmbGVjdG9yLmdldER0c0RlY2xhcmF0aW9uKHR5cGVSZWYubm9kZSk7XG4gICAgICBpZiAodHlwZU5vZGUgIT09IG51bGwgJiYgdHMuaXNDbGFzc0RlY2xhcmF0aW9uKHR5cGVOb2RlKSkge1xuICAgICAgICB0eXBlUmVmID0gbmV3IFJlc29sdmVkUmVmZXJlbmNlKHR5cGVOb2RlLCB0eXBlTm9kZS5uYW1lICEpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRvUjNSZWZlcmVuY2UodmFsdWVSZWYsIHR5cGVSZWYsIHZhbHVlQ29udGV4dCwgdHlwZUNvbnRleHQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIGBGdW5jdGlvbkRlY2xhcmF0aW9uYCBvciBgTWV0aG9kRGVjbGFyYXRpb25gLCBjaGVjayBpZiBpdCBpcyB0eXBlZCBhcyBhXG4gICAqIGBNb2R1bGVXaXRoUHJvdmlkZXJzYCBhbmQgcmV0dXJuIGFuIGV4cHJlc3Npb24gcmVmZXJlbmNpbmcgdGhlIG1vZHVsZSBpZiBhdmFpbGFibGUuXG4gICAqL1xuICBwcml2YXRlIF9leHRyYWN0TW9kdWxlRnJvbU1vZHVsZVdpdGhQcm92aWRlcnNGbihub2RlOiB0cy5GdW5jdGlvbkRlY2xhcmF0aW9ufFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cy5NZXRob2REZWNsYXJhdGlvbik6IHRzLkV4cHJlc3Npb258bnVsbCB7XG4gICAgY29uc3QgdHlwZSA9IG5vZGUudHlwZSB8fCBudWxsO1xuICAgIHJldHVybiB0eXBlICYmXG4gICAgICAgICh0aGlzLl9yZWZsZWN0TW9kdWxlRnJvbVR5cGVQYXJhbSh0eXBlKSB8fCB0aGlzLl9yZWZsZWN0TW9kdWxlRnJvbUxpdGVyYWxUeXBlKHR5cGUpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSBhbiBgTmdNb2R1bGVgIGlkZW50aWZpZXIgKFQpIGZyb20gdGhlIHNwZWNpZmllZCBgdHlwZWAsIGlmIGl0IGlzIG9mIHRoZSBmb3JtOlxuICAgKiBgTW9kdWxlV2l0aFByb3ZpZGVyczxUPmBcbiAgICogQHBhcmFtIHR5cGUgVGhlIHR5cGUgdG8gcmVmbGVjdCBvbi5cbiAgICogQHJldHVybnMgdGhlIGlkZW50aWZpZXIgb2YgdGhlIE5nTW9kdWxlIHR5cGUgaWYgZm91bmQsIG9yIG51bGwgb3RoZXJ3aXNlLlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVmbGVjdE1vZHVsZUZyb21UeXBlUGFyYW0odHlwZTogdHMuVHlwZU5vZGUpOiB0cy5FeHByZXNzaW9ufG51bGwge1xuICAgIC8vIEV4YW1pbmUgdGhlIHR5cGUgb2YgdGhlIGZ1bmN0aW9uIHRvIHNlZSBpZiBpdCdzIGEgTW9kdWxlV2l0aFByb3ZpZGVycyByZWZlcmVuY2UuXG4gICAgaWYgKCF0cy5pc1R5cGVSZWZlcmVuY2VOb2RlKHR5cGUpIHx8ICF0cy5pc0lkZW50aWZpZXIodHlwZS50eXBlTmFtZSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIExvb2sgYXQgdGhlIHR5cGUgaXRzZWxmIHRvIHNlZSB3aGVyZSBpdCBjb21lcyBmcm9tLlxuICAgIGNvbnN0IGlkID0gdGhpcy5yZWZsZWN0b3IuZ2V0SW1wb3J0T2ZJZGVudGlmaWVyKHR5cGUudHlwZU5hbWUpO1xuXG4gICAgLy8gSWYgaXQncyBub3QgbmFtZWQgTW9kdWxlV2l0aFByb3ZpZGVycywgYmFpbC5cbiAgICBpZiAoaWQgPT09IG51bGwgfHwgaWQubmFtZSAhPT0gJ01vZHVsZVdpdGhQcm92aWRlcnMnKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBJZiBpdCdzIG5vdCBmcm9tIEBhbmd1bGFyL2NvcmUsIGJhaWwuXG4gICAgaWYgKCF0aGlzLmlzQ29yZSAmJiBpZC5mcm9tICE9PSAnQGFuZ3VsYXIvY29yZScpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIElmIHRoZXJlJ3Mgbm8gdHlwZSBwYXJhbWV0ZXIgc3BlY2lmaWVkLCBiYWlsLlxuICAgIGlmICh0eXBlLnR5cGVBcmd1bWVudHMgPT09IHVuZGVmaW5lZCB8fCB0eXBlLnR5cGVBcmd1bWVudHMubGVuZ3RoICE9PSAxKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBhcmcgPSB0eXBlLnR5cGVBcmd1bWVudHNbMF07XG5cbiAgICByZXR1cm4gdHlwZU5vZGVUb1ZhbHVlRXhwcihhcmcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIGFuIGBOZ01vZHVsZWAgaWRlbnRpZmllciAoVCkgZnJvbSB0aGUgc3BlY2lmaWVkIGB0eXBlYCwgaWYgaXQgaXMgb2YgdGhlIGZvcm06XG4gICAqIGBBfEJ8e25nTW9kdWxlOiBUfXxDYC5cbiAgICogQHBhcmFtIHR5cGUgVGhlIHR5cGUgdG8gcmVmbGVjdCBvbi5cbiAgICogQHJldHVybnMgdGhlIGlkZW50aWZpZXIgb2YgdGhlIE5nTW9kdWxlIHR5cGUgaWYgZm91bmQsIG9yIG51bGwgb3RoZXJ3aXNlLlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVmbGVjdE1vZHVsZUZyb21MaXRlcmFsVHlwZSh0eXBlOiB0cy5UeXBlTm9kZSk6IHRzLkV4cHJlc3Npb258bnVsbCB7XG4gICAgaWYgKCF0cy5pc0ludGVyc2VjdGlvblR5cGVOb2RlKHR5cGUpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZm9yIChjb25zdCB0IG9mIHR5cGUudHlwZXMpIHtcbiAgICAgIGlmICh0cy5pc1R5cGVMaXRlcmFsTm9kZSh0KSkge1xuICAgICAgICBmb3IgKGNvbnN0IG0gb2YgdC5tZW1iZXJzKSB7XG4gICAgICAgICAgY29uc3QgbmdNb2R1bGVUeXBlID0gdHMuaXNQcm9wZXJ0eVNpZ25hdHVyZShtKSAmJiB0cy5pc0lkZW50aWZpZXIobS5uYW1lKSAmJlxuICAgICAgICAgICAgICAgICAgbS5uYW1lLnRleHQgPT09ICduZ01vZHVsZScgJiYgbS50eXBlIHx8XG4gICAgICAgICAgICAgIG51bGw7XG4gICAgICAgICAgY29uc3QgbmdNb2R1bGVFeHByZXNzaW9uID0gbmdNb2R1bGVUeXBlICYmIHR5cGVOb2RlVG9WYWx1ZUV4cHIobmdNb2R1bGVUeXBlKTtcbiAgICAgICAgICBpZiAobmdNb2R1bGVFeHByZXNzaW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gbmdNb2R1bGVFeHByZXNzaW9uO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlIGEgbGlzdCBvZiBgUmVmZXJlbmNlYHMgZnJvbSBhIHJlc29sdmVkIG1ldGFkYXRhIHZhbHVlLlxuICAgKi9cbiAgcHJpdmF0ZSByZXNvbHZlVHlwZUxpc3QoZXhwcjogdHMuTm9kZSwgcmVzb2x2ZWRMaXN0OiBSZXNvbHZlZFZhbHVlLCBuYW1lOiBzdHJpbmcpOlxuICAgICAgUmVmZXJlbmNlPHRzLkRlY2xhcmF0aW9uPltdIHtcbiAgICBjb25zdCByZWZMaXN0OiBSZWZlcmVuY2U8dHMuRGVjbGFyYXRpb24+W10gPSBbXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocmVzb2x2ZWRMaXN0KSkge1xuICAgICAgdGhyb3cgbmV3IEZhdGFsRGlhZ25vc3RpY0Vycm9yKFxuICAgICAgICAgIEVycm9yQ29kZS5WQUxVRV9IQVNfV1JPTkdfVFlQRSwgZXhwciwgYEV4cGVjdGVkIGFycmF5IHdoZW4gcmVhZGluZyBwcm9wZXJ0eSAke25hbWV9YCk7XG4gICAgfVxuXG4gICAgcmVzb2x2ZWRMaXN0LmZvckVhY2goKGVudHJ5LCBpZHgpID0+IHtcbiAgICAgIC8vIFVud3JhcCBNb2R1bGVXaXRoUHJvdmlkZXJzIGZvciBtb2R1bGVzIHRoYXQgYXJlIGxvY2FsbHkgZGVjbGFyZWQgKGFuZCB0aHVzIHN0YXRpY1xuICAgICAgLy8gcmVzb2x1dGlvbiB3YXMgYWJsZSB0byBkZXNjZW5kIGludG8gdGhlIGZ1bmN0aW9uIGFuZCByZXR1cm4gYW4gb2JqZWN0IGxpdGVyYWwsIGEgTWFwKS5cbiAgICAgIGlmIChlbnRyeSBpbnN0YW5jZW9mIE1hcCAmJiBlbnRyeS5oYXMoJ25nTW9kdWxlJykpIHtcbiAgICAgICAgZW50cnkgPSBlbnRyeS5nZXQoJ25nTW9kdWxlJykgITtcbiAgICAgIH1cblxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZW50cnkpKSB7XG4gICAgICAgIC8vIFJlY3Vyc2UgaW50byBuZXN0ZWQgYXJyYXlzLlxuICAgICAgICByZWZMaXN0LnB1c2goLi4udGhpcy5yZXNvbHZlVHlwZUxpc3QoZXhwciwgZW50cnksIG5hbWUpKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNEZWNsYXJhdGlvblJlZmVyZW5jZShlbnRyeSkpIHtcbiAgICAgICAgaWYgKCFlbnRyeS5leHByZXNzYWJsZSkge1xuICAgICAgICAgIHRocm93IG5ldyBGYXRhbERpYWdub3N0aWNFcnJvcihcbiAgICAgICAgICAgICAgRXJyb3JDb2RlLlZBTFVFX0hBU19XUk9OR19UWVBFLCBleHByLCBgT25lIGVudHJ5IGluICR7bmFtZX0gaXMgbm90IGEgdHlwZWApO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnJlZmxlY3Rvci5pc0NsYXNzKGVudHJ5Lm5vZGUpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEZhdGFsRGlhZ25vc3RpY0Vycm9yKFxuICAgICAgICAgICAgICBFcnJvckNvZGUuVkFMVUVfSEFTX1dST05HX1RZUEUsIGVudHJ5Lm5vZGUsXG4gICAgICAgICAgICAgIGBFbnRyeSBpcyBub3QgYSB0eXBlLCBidXQgaXMgdXNlZCBhcyBzdWNoIGluICR7bmFtZX0gYXJyYXlgKTtcbiAgICAgICAgfVxuICAgICAgICByZWZMaXN0LnB1c2goZW50cnkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVE9ETyhhbHhodWIpOiBleHBhbmQgTW9kdWxlV2l0aFByb3ZpZGVycy5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBWYWx1ZSBhdCBwb3NpdGlvbiAke2lkeH0gaW4gJHtuYW1lfSBhcnJheSBpcyBub3QgYSByZWZlcmVuY2U6ICR7ZW50cnl9YCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVmTGlzdDtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc0RlY2xhcmF0aW9uUmVmZXJlbmNlKHJlZjogYW55KTogcmVmIGlzIFJlZmVyZW5jZTx0cy5EZWNsYXJhdGlvbj4ge1xuICByZXR1cm4gcmVmIGluc3RhbmNlb2YgUmVmZXJlbmNlICYmXG4gICAgICAodHMuaXNDbGFzc0RlY2xhcmF0aW9uKHJlZi5ub2RlKSB8fCB0cy5pc0Z1bmN0aW9uRGVjbGFyYXRpb24ocmVmLm5vZGUpIHx8XG4gICAgICAgdHMuaXNWYXJpYWJsZURlY2xhcmF0aW9uKHJlZi5ub2RlKSk7XG59XG4iXX0=