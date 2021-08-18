(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngcc/src/analysis/module_with_providers_analyzer", ["require", "exports", "typescript", "@angular/compiler-cli/src/ngtsc/metadata", "@angular/compiler-cli/src/ngcc/src/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ts = require("typescript");
    var metadata_1 = require("@angular/compiler-cli/src/ngtsc/metadata");
    var utils_1 = require("@angular/compiler-cli/src/ngcc/src/utils");
    exports.ModuleWithProvidersAnalyses = Map;
    var ModuleWithProvidersAnalyzer = /** @class */ (function () {
        function ModuleWithProvidersAnalyzer(host, referencesRegistry) {
            this.host = host;
            this.referencesRegistry = referencesRegistry;
        }
        ModuleWithProvidersAnalyzer.prototype.analyzeProgram = function (program) {
            var _this = this;
            var analyses = new exports.ModuleWithProvidersAnalyses();
            var rootFiles = this.getRootFiles(program);
            rootFiles.forEach(function (f) {
                var fns = _this.host.getModuleWithProvidersFunctions(f);
                fns && fns.forEach(function (fn) {
                    var dtsFn = _this.getDtsDeclaration(fn.declaration);
                    var typeParam = dtsFn.type && ts.isTypeReferenceNode(dtsFn.type) &&
                        dtsFn.type.typeArguments && dtsFn.type.typeArguments[0] ||
                        null;
                    if (!typeParam || isAnyKeyword(typeParam)) {
                        // Either we do not have a parameterized type or the type is `any`.
                        var ngModule = _this.host.getDeclarationOfIdentifier(fn.ngModule);
                        if (!ngModule) {
                            throw new Error("Cannot find a declaration for NgModule " + fn.ngModule.text + " referenced in " + fn.declaration.getText());
                        }
                        // For internal (non-library) module references, redirect the module's value declaration
                        // to its type declaration.
                        if (ngModule.viaModule === null) {
                            var dtsNgModule = _this.host.getDtsDeclaration(ngModule.node);
                            if (!dtsNgModule) {
                                throw new Error("No typings declaration can be found for the referenced NgModule class in " + fn.declaration.getText() + ".");
                            }
                            if (!ts.isClassDeclaration(dtsNgModule)) {
                                throw new Error("The referenced NgModule in " + fn.declaration.getText() + " is not a class declaration in the typings program; instead we get " + dtsNgModule.getText());
                            }
                            // Record the usage of the internal module as it needs to become an exported symbol
                            _this.referencesRegistry.add(new metadata_1.ResolvedReference(ngModule.node, fn.ngModule));
                            ngModule = { node: dtsNgModule, viaModule: null };
                        }
                        var dtsFile = dtsFn.getSourceFile();
                        var analysis = analyses.get(dtsFile) || [];
                        analysis.push({ declaration: dtsFn, ngModule: ngModule });
                        analyses.set(dtsFile, analysis);
                    }
                });
            });
            return analyses;
        };
        ModuleWithProvidersAnalyzer.prototype.getRootFiles = function (program) {
            return program.getRootFileNames().map(function (f) { return program.getSourceFile(f); }).filter(utils_1.isDefined);
        };
        ModuleWithProvidersAnalyzer.prototype.getDtsDeclaration = function (fn) {
            var dtsFn = null;
            var containerClass = this.host.getClassSymbol(fn.parent);
            var fnName = fn.name && ts.isIdentifier(fn.name) && fn.name.text;
            if (containerClass && fnName) {
                var dtsClass = this.host.getDtsDeclaration(containerClass.valueDeclaration);
                // Get the declaration of the matching static method
                dtsFn = dtsClass && ts.isClassDeclaration(dtsClass) ?
                    dtsClass.members
                        .find(function (member) { return ts.isMethodDeclaration(member) && ts.isIdentifier(member.name) &&
                        member.name.text === fnName; }) :
                    null;
            }
            else {
                dtsFn = this.host.getDtsDeclaration(fn);
            }
            if (!dtsFn) {
                throw new Error("Matching type declaration for " + fn.getText() + " is missing");
            }
            if (!isFunctionOrMethod(dtsFn)) {
                throw new Error("Matching type declaration for " + fn.getText() + " is not a function: " + dtsFn.getText());
            }
            return dtsFn;
        };
        return ModuleWithProvidersAnalyzer;
    }());
    exports.ModuleWithProvidersAnalyzer = ModuleWithProvidersAnalyzer;
    function isFunctionOrMethod(declaration) {
        return ts.isFunctionDeclaration(declaration) || ts.isMethodDeclaration(declaration);
    }
    function isAnyKeyword(typeParam) {
        return typeParam.kind === ts.SyntaxKind.AnyKeyword;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlX3dpdGhfcHJvdmlkZXJzX2FuYWx5emVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ2NjL3NyYy9hbmFseXNpcy9tb2R1bGVfd2l0aF9wcm92aWRlcnNfYW5hbHl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCwrQkFBaUM7SUFJakMscUVBQTBEO0lBRTFELGtFQUFtQztJQWdCdEIsUUFBQSwyQkFBMkIsR0FBRyxHQUFHLENBQUM7SUFFL0M7UUFDRSxxQ0FBb0IsSUFBd0IsRUFBVSxrQkFBc0M7WUFBeEUsU0FBSSxHQUFKLElBQUksQ0FBb0I7WUFBVSx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1FBQUcsQ0FBQztRQUVoRyxvREFBYyxHQUFkLFVBQWUsT0FBbUI7WUFBbEMsaUJBMENDO1lBekNDLElBQU0sUUFBUSxHQUFHLElBQUksbUNBQTJCLEVBQUUsQ0FBQztZQUNuRCxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDO2dCQUNqQixJQUFNLEdBQUcsR0FBRyxLQUFJLENBQUMsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6RCxHQUFHLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEVBQUU7b0JBQ25CLElBQU0sS0FBSyxHQUFHLEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQ3JELElBQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7d0JBQzFELEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxJQUFJLEtB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QUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUM7SUFDckQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge1JlZmVyZW5jZXNSZWdpc3RyeX0gZnJvbSAnLi4vLi4vLi4vbmd0c2MvYW5ub3RhdGlvbnMnO1xuaW1wb3J0IHtEZWNsYXJhdGlvbn0gZnJvbSAnLi4vLi4vLi4vbmd0c2MvaG9zdCc7XG5pbXBvcnQge1Jlc29sdmVkUmVmZXJlbmNlfSBmcm9tICcuLi8uLi8uLi9uZ3RzYy9tZXRhZGF0YSc7XG5pbXBvcnQge05nY2NSZWZsZWN0aW9uSG9zdH0gZnJvbSAnLi4vaG9zdC9uZ2NjX2hvc3QnO1xuaW1wb3J0IHtpc0RlZmluZWR9IGZyb20gJy4uL3V0aWxzJztcblxuZXhwb3J0IGludGVyZmFjZSBNb2R1bGVXaXRoUHJvdmlkZXJzSW5mbyB7XG4gIC8qKlxuICAgKiBUaGUgZGVjbGFyYXRpb24gKGluIHRoZSAuZC50cyBmaWxlKSBvZiB0aGUgZnVuY3Rpb24gdGhhdCByZXR1cm5zXG4gICAqIGEgYE1vZHVsZVdpdGhQcm92aWRlcnMgb2JqZWN0LCBidXQgaGFzIGEgc2lnbmF0dXJlIHRoYXQgbmVlZHNcbiAgICogYSB0eXBlIHBhcmFtZXRlciBhZGRpbmcuXG4gICAqL1xuICBkZWNsYXJhdGlvbjogdHMuTWV0aG9kRGVjbGFyYXRpb258dHMuRnVuY3Rpb25EZWNsYXJhdGlvbjtcbiAgLyoqXG4gICAqIFRoZSBOZ01vZHVsZSBjbGFzcyBkZWNsYXJhdGlvbiAoaW4gdGhlIC5kLnRzIGZpbGUpIHRvIGFkZCBhcyBhIHR5cGUgcGFyYW1ldGVyLlxuICAgKi9cbiAgbmdNb2R1bGU6IERlY2xhcmF0aW9uO1xufVxuXG5leHBvcnQgdHlwZSBNb2R1bGVXaXRoUHJvdmlkZXJzQW5hbHlzZXMgPSBNYXA8dHMuU291cmNlRmlsZSwgTW9kdWxlV2l0aFByb3ZpZGVyc0luZm9bXT47XG5leHBvcnQgY29uc3QgTW9kdWxlV2l0aFByb3ZpZGVyc0FuYWx5c2VzID0gTWFwO1xuXG5leHBvcnQgY2xhc3MgTW9kdWxlV2l0aFByb3ZpZGVyc0FuYWx5emVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBob3N0OiBOZ2NjUmVmbGVjdGlvbkhvc3QsIHByaXZhdGUgcmVmZXJlbmNlc1JlZ2lzdHJ5OiBSZWZlcmVuY2VzUmVnaXN0cnkpIHt9XG5cbiAgYW5hbHl6ZVByb2dyYW0ocHJvZ3JhbTogdHMuUHJvZ3JhbSk6IE1vZHVsZVdpdGhQcm92aWRlcnNBbmFseXNlcyB7XG4gICAgY29uc3QgYW5hbHlzZXMgPSBuZXcgTW9kdWxlV2l0aFByb3ZpZGVyc0FuYWx5c2VzKCk7XG4gICAgY29uc3Qgcm9vdEZpbGVzID0gdGhpcy5nZXRSb290RmlsZXMocHJvZ3JhbSk7XG4gICAgcm9vdEZpbGVzLmZvckVhY2goZiA9PiB7XG4gICAgICBjb25zdCBmbnMgPSB0aGlzLmhvc3QuZ2V0TW9kdWxlV2l0aFByb3ZpZGVyc0Z1bmN0aW9ucyhmKTtcbiAgICAgIGZucyAmJiBmbnMuZm9yRWFjaChmbiA9PiB7XG4gICAgICAgIGNvbnN0IGR0c0ZuID0gdGhpcy5nZXREdHNEZWNsYXJhdGlvbihmbi5kZWNsYXJhdGlvbik7XG4gICAgICAgIGNvbnN0IHR5cGVQYXJhbSA9IGR0c0ZuLnR5cGUgJiYgdHMuaXNUeXBlUmVmZXJlbmNlTm9kZShkdHNGbi50eXBlKSAmJlxuICAgICAgICAgICAgICAgIGR0c0ZuLnR5cGUudHlwZUFyZ3VtZW50cyAmJiBkdHNGbi50eXBlLnR5cGVBcmd1bWVudHNbMF0gfHxcbiAgICAgICAgICAgIG51bGw7XG4gICAgICAgIGlmICghdHlwZVBhcmFtIHx8IGlzQW55S2V5d29yZCh0eXBlUGFyYW0pKSB7XG4gICAgICAgICAgLy8gRWl0aGVyIHdlIGRvIG5vdCBoYXZlIGEgcGFyYW1ldGVyaXplZCB0eXBlIG9yIHRoZSB0eXBlIGlzIGBhbnlgLlxuICAgICAgICAgIGxldCBuZ01vZHVsZSA9IHRoaXMuaG9zdC5nZXREZWNsYXJhdGlvbk9mSWRlbnRpZmllcihmbi5uZ01vZHVsZSk7XG4gICAgICAgICAgaWYgKCFuZ01vZHVsZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIGBDYW5ub3QgZmluZCBhIGRlY2xhcmF0aW9uIGZvciBOZ01vZHVsZSAke2ZuLm5nTW9kdWxlLnRleHR9IHJlZmVyZW5jZWQgaW4gJHtmbi5kZWNsYXJhdGlvbi5nZXRUZXh0KCl9YCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIEZvciBpbnRlcm5hbCAobm9uLWxpYnJhcnkpIG1vZHVsZSByZWZlcmVuY2VzLCByZWRpcmVjdCB0aGUgbW9kdWxlJ3MgdmFsdWUgZGVjbGFyYXRpb25cbiAgICAgICAgICAvLyB0byBpdHMgdHlwZSBkZWNsYXJhdGlvbi5cbiAgICAgICAgICBpZiAobmdNb2R1bGUudmlhTW9kdWxlID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBkdHNOZ01vZHVsZSA9IHRoaXMuaG9zdC5nZXREdHNEZWNsYXJhdGlvbihuZ01vZHVsZS5ub2RlKTtcbiAgICAgICAgICAgIGlmICghZHRzTmdNb2R1bGUpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgYE5vIHR5cGluZ3MgZGVjbGFyYXRpb24gY2FuIGJlIGZvdW5kIGZvciB0aGUgcmVmZXJlbmNlZCBOZ01vZHVsZSBjbGFzcyBpbiAke2ZuLmRlY2xhcmF0aW9uLmdldFRleHQoKX0uYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXRzLmlzQ2xhc3NEZWNsYXJhdGlvbihkdHNOZ01vZHVsZSkpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgYFRoZSByZWZlcmVuY2VkIE5nTW9kdWxlIGluICR7Zm4uZGVjbGFyYXRpb24uZ2V0VGV4dCgpfSBpcyBub3QgYSBjbGFzcyBkZWNsYXJhdGlvbiBpbiB0aGUgdHlwaW5ncyBwcm9ncmFtOyBpbnN0ZWFkIHdlIGdldCAke2R0c05nTW9kdWxlLmdldFRleHQoKX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFJlY29yZCB0aGUgdXNhZ2Ugb2YgdGhlIGludGVybmFsIG1vZHVsZSBhcyBpdCBuZWVkcyB0byBiZWNvbWUgYW4gZXhwb3J0ZWQgc3ltYm9sXG4gICAgICAgICAgICB0aGlzLnJlZmVyZW5jZXNSZWdpc3RyeS5hZGQobmV3IFJlc29sdmVkUmVmZXJlbmNlKG5nTW9kdWxlLm5vZGUsIGZuLm5nTW9kdWxlKSk7XG5cbiAgICAgICAgICAgIG5nTW9kdWxlID0ge25vZGU6IGR0c05nTW9kdWxlLCB2aWFNb2R1bGU6IG51bGx9O1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBkdHNGaWxlID0gZHRzRm4uZ2V0U291cmNlRmlsZSgpO1xuICAgICAgICAgIGNvbnN0IGFuYWx5c2lzID0gYW5hbHlzZXMuZ2V0KGR0c0ZpbGUpIHx8IFtdO1xuICAgICAgICAgIGFuYWx5c2lzLnB1c2goe2RlY2xhcmF0aW9uOiBkdHNGbiwgbmdNb2R1bGV9KTtcbiAgICAgICAgICBhbmFseXNlcy5zZXQoZHRzRmlsZSwgYW5hbHlzaXMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gYW5hbHlzZXM7XG4gIH1cblxuICBwcml2YXRlIGdldFJvb3RGaWxlcyhwcm9ncmFtOiB0cy5Qcm9ncmFtKTogdHMuU291cmNlRmlsZVtdIHtcbiAgICByZXR1cm4gcHJvZ3JhbS5nZXRSb290RmlsZU5hbWVzKCkubWFwKGYgPT4gcHJvZ3JhbS5nZXRTb3VyY2VGaWxlKGYpKS5maWx0ZXIoaXNEZWZpbmVkKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0RHRzRGVjbGFyYXRpb24oZm46IHRzLlNpZ25hdHVyZURlY2xhcmF0aW9uKSB7XG4gICAgbGV0IGR0c0ZuOiB0cy5EZWNsYXJhdGlvbnxudWxsID0gbnVsbDtcbiAgICBjb25zdCBjb250YWluZXJDbGFzcyA9IHRoaXMuaG9zdC5nZXRDbGFzc1N5bWJvbChmbi5wYXJlbnQpO1xuICAgIGNvbnN0IGZuTmFtZSA9IGZuLm5hbWUgJiYgdHMuaXNJZGVudGlmaWVyKGZuLm5hbWUpICYmIGZuLm5hbWUudGV4dDtcbiAgICBpZiAoY29udGFpbmVyQ2xhc3MgJiYgZm5OYW1lKSB7XG4gICAgICBjb25zdCBkdHNDbGFzcyA9IHRoaXMuaG9zdC5nZXREdHNEZWNsYXJhdGlvbihjb250YWluZXJDbGFzcy52YWx1ZURlY2xhcmF0aW9uKTtcbiAgICAgIC8vIEdldCB0aGUgZGVjbGFyYXRpb24gb2YgdGhlIG1hdGNoaW5nIHN0YXRpYyBtZXRob2RcbiAgICAgIGR0c0ZuID0gZHRzQ2xhc3MgJiYgdHMuaXNDbGFzc0RlY2xhcmF0aW9uKGR0c0NsYXNzKSA/XG4gICAgICAgICAgZHRzQ2xhc3MubWVtYmVyc1xuICAgICAgICAgICAgICAuZmluZChcbiAgICAgICAgICAgICAgICAgIG1lbWJlciA9PiB0cy5pc01ldGhvZERlY2xhcmF0aW9uKG1lbWJlcikgJiYgdHMuaXNJZGVudGlmaWVyKG1lbWJlci5uYW1lKSAmJlxuICAgICAgICAgICAgICAgICAgICAgIG1lbWJlci5uYW1lLnRleHQgPT09IGZuTmFtZSkgYXMgdHMuRGVjbGFyYXRpb24gOlxuICAgICAgICAgIG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIGR0c0ZuID0gdGhpcy5ob3N0LmdldER0c0RlY2xhcmF0aW9uKGZuKTtcbiAgICB9XG4gICAgaWYgKCFkdHNGbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBNYXRjaGluZyB0eXBlIGRlY2xhcmF0aW9uIGZvciAke2ZuLmdldFRleHQoKX0gaXMgbWlzc2luZ2ApO1xuICAgIH1cbiAgICBpZiAoIWlzRnVuY3Rpb25Pck1ldGhvZChkdHNGbikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgTWF0Y2hpbmcgdHlwZSBkZWNsYXJhdGlvbiBmb3IgJHtmbi5nZXRUZXh0KCl9IGlzIG5vdCBhIGZ1bmN0aW9uOiAke2R0c0ZuLmdldFRleHQoKX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIGR0c0ZuO1xuICB9XG59XG5cblxuZnVuY3Rpb24gaXNGdW5jdGlvbk9yTWV0aG9kKGRlY2xhcmF0aW9uOiB0cy5EZWNsYXJhdGlvbik6IGRlY2xhcmF0aW9uIGlzIHRzLkZ1bmN0aW9uRGVjbGFyYXRpb258XG4gICAgdHMuTWV0aG9kRGVjbGFyYXRpb24ge1xuICByZXR1cm4gdHMuaXNGdW5jdGlvbkRlY2xhcmF0aW9uKGRlY2xhcmF0aW9uKSB8fCB0cy5pc01ldGhvZERlY2xhcmF0aW9uKGRlY2xhcmF0aW9uKTtcbn1cblxuZnVuY3Rpb24gaXNBbnlLZXl3b3JkKHR5cGVQYXJhbTogdHMuVHlwZU5vZGUpOiB0eXBlUGFyYW0gaXMgdHMuS2V5d29yZFR5cGVOb2RlIHtcbiAgcmV0dXJuIHR5cGVQYXJhbS5raW5kID09PSB0cy5TeW50YXhLaW5kLkFueUtleXdvcmQ7XG59XG4iXX0=