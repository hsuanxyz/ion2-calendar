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
        define("@angular/compiler-cli/src/ngtsc/annotations", ["require", "exports", "@angular/compiler-cli/src/ngtsc/annotations/src/base_def", "@angular/compiler-cli/src/ngtsc/annotations/src/component", "@angular/compiler-cli/src/ngtsc/annotations/src/directive", "@angular/compiler-cli/src/ngtsc/annotations/src/injectable", "@angular/compiler-cli/src/ngtsc/annotations/src/ng_module", "@angular/compiler-cli/src/ngtsc/annotations/src/pipe", "@angular/compiler-cli/src/ngtsc/annotations/src/references_registry", "@angular/compiler-cli/src/ngtsc/annotations/src/selector_scope"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var base_def_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/base_def");
    exports.BaseDefDecoratorHandler = base_def_1.BaseDefDecoratorHandler;
    var component_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/component");
    exports.ComponentDecoratorHandler = component_1.ComponentDecoratorHandler;
    var directive_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/directive");
    exports.DirectiveDecoratorHandler = directive_1.DirectiveDecoratorHandler;
    var injectable_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/injectable");
    exports.InjectableDecoratorHandler = injectable_1.InjectableDecoratorHandler;
    var ng_module_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/ng_module");
    exports.NgModuleDecoratorHandler = ng_module_1.NgModuleDecoratorHandler;
    var pipe_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/pipe");
    exports.PipeDecoratorHandler = pipe_1.PipeDecoratorHandler;
    var references_registry_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/references_registry");
    exports.NoopReferencesRegistry = references_registry_1.NoopReferencesRegistry;
    var selector_scope_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/selector_scope");
    exports.SelectorScopeRegistry = selector_scope_1.SelectorScopeRegistry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2Fubm90YXRpb25zL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBS0gscUZBQXVEO0lBQS9DLDZDQUFBLHVCQUF1QixDQUFBO0lBQy9CLHVGQUEwRDtJQUFsRCxnREFBQSx5QkFBeUIsQ0FBQTtJQUNqQyx1RkFBMEQ7SUFBbEQsZ0RBQUEseUJBQXlCLENBQUE7SUFDakMseUZBQTREO0lBQXBELGtEQUFBLDBCQUEwQixDQUFBO0lBQ2xDLHVGQUF5RDtJQUFqRCwrQ0FBQSx3QkFBd0IsQ0FBQTtJQUNoQyw2RUFBZ0Q7SUFBeEMsc0NBQUEsb0JBQW9CLENBQUE7SUFDNUIsMkdBQXFGO0lBQTdFLHVEQUFBLHNCQUFzQixDQUFBO0lBQzlCLGlHQUE2RTtJQUFuRCxpREFBQSxxQkFBcUIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJub2RlXCIgLz5cblxuZXhwb3J0IHtSZXNvdXJjZUxvYWRlcn0gZnJvbSAnLi9zcmMvYXBpJztcbmV4cG9ydCB7QmFzZURlZkRlY29yYXRvckhhbmRsZXJ9IGZyb20gJy4vc3JjL2Jhc2VfZGVmJztcbmV4cG9ydCB7Q29tcG9uZW50RGVjb3JhdG9ySGFuZGxlcn0gZnJvbSAnLi9zcmMvY29tcG9uZW50JztcbmV4cG9ydCB7RGlyZWN0aXZlRGVjb3JhdG9ySGFuZGxlcn0gZnJvbSAnLi9zcmMvZGlyZWN0aXZlJztcbmV4cG9ydCB7SW5qZWN0YWJsZURlY29yYXRvckhhbmRsZXJ9IGZyb20gJy4vc3JjL2luamVjdGFibGUnO1xuZXhwb3J0IHtOZ01vZHVsZURlY29yYXRvckhhbmRsZXJ9IGZyb20gJy4vc3JjL25nX21vZHVsZSc7XG5leHBvcnQge1BpcGVEZWNvcmF0b3JIYW5kbGVyfSBmcm9tICcuL3NyYy9waXBlJztcbmV4cG9ydCB7Tm9vcFJlZmVyZW5jZXNSZWdpc3RyeSwgUmVmZXJlbmNlc1JlZ2lzdHJ5fSBmcm9tICcuL3NyYy9yZWZlcmVuY2VzX3JlZ2lzdHJ5JztcbmV4cG9ydCB7Q29tcGlsYXRpb25TY29wZSwgU2VsZWN0b3JTY29wZVJlZ2lzdHJ5fSBmcm9tICcuL3NyYy9zZWxlY3Rvcl9zY29wZSc7XG4iXX0=