/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
        define("tsickle/src/es5processor", ["require", "exports", "path", "tsickle/src/fileoverview_comment_transformer", "tsickle/src/rewriter", "tsickle/src/typescript", "tsickle/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var path = require("path");
    var fileoverview_comment_transformer_1 = require("tsickle/src/fileoverview_comment_transformer");
    var rewriter_1 = require("tsickle/src/rewriter");
    var ts = require("tsickle/src/typescript");
    var util_1 = require("tsickle/src/util");
    // Matches common extensions of TypeScript input filenames
    var TS_EXTENSIONS = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;
    /**
     * Extracts the namespace part of a goog: import, or returns null if the given
     * import is not a goog: import.
     */
    function extractGoogNamespaceImport(tsImport) {
        if (tsImport.match(/^goog:/))
            return tsImport.substring('goog:'.length);
        return null;
    }
    exports.extractGoogNamespaceImport = extractGoogNamespaceImport;
    /**
     * Convert from implicit `import {} from 'pkg'` to `import {} from 'pkg/index'.
     * TypeScript supports the shorthand, but not all ES6 module loaders do.
     * Workaround for https://github.com/Microsoft/TypeScript/issues/12597
     */
    function resolveIndexShorthand(host, fileName, imported) {
        var resolved = ts.resolveModuleName(imported, fileName, host.options, host.host);
        if (!resolved || !resolved.resolvedModule)
            return imported;
        var requestedModule = imported.replace(TS_EXTENSIONS, '');
        var resolvedModule = resolved.resolvedModule.resolvedFileName.replace(TS_EXTENSIONS, '');
        if (resolvedModule.indexOf('node_modules') === -1 &&
            requestedModule.substr(requestedModule.lastIndexOf('/')) !==
                resolvedModule.substr(resolvedModule.lastIndexOf('/'))) {
            imported = './' + path.relative(path.dirname(fileName), resolvedModule).replace(path.sep, '/');
        }
        return imported;
    }
    exports.resolveIndexShorthand = resolveIndexShorthand;
    /**
     * ES5Processor postprocesses TypeScript compilation output JS, to rewrite commonjs require()s into
     * goog.require(). Contrary to its name it handles converting the modules in both ES5 and ES6
     * outputs.
     */
    var ES5Processor = /** @class */ (function (_super) {
        __extends(ES5Processor, _super);
        function ES5Processor(host, file) {
            var _this = _super.call(this, file) || this;
            _this.host = host;
            /**
             * namespaceImports collects the variables for imported goog.modules.
             * If the original TS input is:
             *   import foo from 'goog:bar';
             * then TS produces:
             *   var foo = require('goog:bar');
             * and this class rewrites it to:
             *   var foo = require('goog.bar');
             * After this step, namespaceImports['foo'] is true.
             * (This is used to rewrite 'foo.default' into just 'foo'.)
             */
            _this.namespaceImports = new Set();
            /**
             * moduleVariables maps from module names to the variables they're assigned to.
             * Continuing the above example, moduleVariables['goog.bar'] = 'foo'.
             */
            _this.moduleVariables = new Map();
            /** strippedStrict is true once we've stripped a "use strict"; from the input. */
            _this.strippedStrict = false;
            /** unusedIndex is used to generate fresh symbols for unnamed imports. */
            _this.unusedIndex = 0;
            return _this;
        }
        ES5Processor.prototype.process = function () {
            var _this = this;
            this.emitFileComment();
            var moduleId = this.host.fileNameToModuleId(this.file.fileName);
            var moduleName = this.host.pathToModuleName('', this.file.fileName);
            // NB: No linebreak after module call so sourcemaps are not offset.
            this.emit("goog.module('" + moduleName + "');");
            if (this.host.prelude)
                this.emit(this.host.prelude);
            // Allow code to use `module.id` to discover its module URL, e.g. to resolve
            // a template URL against.
            // Uses 'var', as this code is inserted in ES6 and ES5 modes.
            // The following pattern ensures closure doesn't throw an error in advanced
            // optimizations mode.
            if (this.host.es5Mode) {
                this.emit("var module = module || {id: '" + moduleId + "'};");
            }
            else {
                // The `exports = {}` serves as a default export to disable Closure Compiler's error checking
                // for mutable exports. That's OK because TS compiler makes sure that consuming code always
                // accesses exports through the module object, so mutable exports work.
                // It is only inserted in ES6 because we strip `.default` accesses in ES5 mode, which breaks
                // when assigning an `exports = {}` object and then later accessing it.
                // However Closure bails if code later on assigns into exports directly, as we do if we have
                // an "exports = " block, so skip emit if that's the case.
                if (!this.file.statements.find(function (s) { return ts.isExpressionStatement(s) && _this.isModuleExportsAssignment(s); })) {
                    this.emit(" exports = {};");
                }
                // The module=module bit suppresses an unused variable warning which
                // may trigger depending on the compilation flags.
                this.emit(" var module = module || {id: '" + moduleId + "'}; module = module;");
            }
            var pos = 0;
            try {
                for (var _a = __values(this.file.statements), _b = _a.next(); !_b.done; _b = _a.next()) {
                    var stmt = _b.value;
                    this.writeRange(this.file, pos, stmt.getFullStart());
                    this.visitTopLevel(stmt);
                    pos = stmt.getEnd();
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_1) throw e_1.error; }
            }
            this.writeRange(this.file, pos, this.file.getEnd());
            var referencedModules = Array.from(this.moduleVariables.keys());
            // Note: don't sort referencedModules, as the keys are in the same order
            // they occur in the source file.
            var output = this.getOutput().output;
            return { output: output, referencedModules: referencedModules };
            var e_1, _c;
        };
        /** Emits file comments for the current source file, if any. */
        ES5Processor.prototype.emitFileComment = function () {
            var _this = this;
            var leadingComments = ts.getLeadingCommentRanges(this.file.getFullText(), 0) || [];
            var fileComment = leadingComments.find(function (c) {
                if (c.kind !== ts.SyntaxKind.MultiLineCommentTrivia)
                    return false;
                var commentText = _this.file.getFullText().substring(c.pos, c.end);
                return fileoverview_comment_transformer_1.isClosureFileoverviewComment(commentText);
            });
            if (!fileComment)
                return;
            var end = fileComment.end;
            if (fileComment.hasTrailingNewLine)
                end++;
            this.writeLeadingTrivia(this.file, end);
        };
        /**
         * visitTopLevel processes a top-level ts.Node and emits its contents.
         *
         * It's separate from the normal Rewriter recursive traversal
         * because some top-level statements are handled specially.
         */
        ES5Processor.prototype.visitTopLevel = function (node) {
            switch (node.kind) {
                case ts.SyntaxKind.ExpressionStatement:
                    var exprStatement = node;
                    // Check for "use strict" and skip it if necessary.
                    if (!this.strippedStrict && this.isUseStrict(node)) {
                        this.emitCommentWithoutStatementBody(node);
                        this.strippedStrict = true;
                        return;
                    }
                    // Check for:
                    // - "require('foo');" (a require for its side effects)
                    // - "__export(require(...));" (an "export * from ...")
                    if (this.emitRewrittenRequires(node)) {
                        return;
                    }
                    // Check for
                    //   Object.defineProperty(exports, "__esModule", ...);
                    if (this.isEsModuleProperty(exprStatement)) {
                        this.emitCommentWithoutStatementBody(node);
                        return;
                    }
                    // Check for
                    //   module.exports = ...;
                    // Rewrite to goog.module's
                    //   exports = ...;
                    if (this.isModuleExportsAssignment(exprStatement)) {
                        this.emitExportsAssignment(exprStatement);
                        return;
                    }
                    // Otherwise fall through to default processing.
                    break;
                case ts.SyntaxKind.VariableStatement:
                    // Check for a "var x = require('foo');".
                    if (this.emitRewrittenRequires(node))
                        return;
                    break;
                default:
                    break;
            }
            this.visit(node);
        };
        /**
         * The TypeScript AST attaches comments to statement nodes, so even if a node
         * contains code we want to skip emitting, we need to emit the attached
         * comment(s).
         */
        ES5Processor.prototype.emitCommentWithoutStatementBody = function (node) {
            this.writeLeadingTrivia(node);
        };
        /** isUseStrict returns true if node is a "use strict"; statement. */
        ES5Processor.prototype.isUseStrict = function (node) {
            if (node.kind !== ts.SyntaxKind.ExpressionStatement)
                return false;
            var exprStmt = node;
            var expr = exprStmt.expression;
            if (expr.kind !== ts.SyntaxKind.StringLiteral)
                return false;
            var literal = expr;
            return literal.text === 'use strict';
        };
        /**
         * emitRewrittenRequires rewrites require()s into goog.require() equivalents.
         *
         * @return True if the node was rewritten, false if needs ordinary processing.
         */
        ES5Processor.prototype.emitRewrittenRequires = function (node) {
            // We're looking for requires, of one of the forms:
            // - "var importName = require(...);".
            // - "require(...);".
            if (node.kind === ts.SyntaxKind.VariableStatement) {
                // It's possibly of the form "var x = require(...);".
                var varStmt = node;
                // Verify it's a single decl (and not "var x = ..., y = ...;").
                if (varStmt.declarationList.declarations.length !== 1)
                    return false;
                var decl = varStmt.declarationList.declarations[0];
                // Grab the variable name (avoiding things like destructuring binds).
                if (decl.name.kind !== ts.SyntaxKind.Identifier)
                    return false;
                var varName = rewriter_1.getIdentifierText(decl.name);
                if (!decl.initializer || decl.initializer.kind !== ts.SyntaxKind.CallExpression)
                    return false;
                var call = decl.initializer;
                var require_1 = this.extractRequire(call);
                if (!require_1)
                    return false;
                this.writeLeadingTrivia(node);
                this.emitGoogRequire(varName, require_1);
                return true;
            }
            else if (node.kind === ts.SyntaxKind.ExpressionStatement) {
                // It's possibly of the form:
                // - require(...);
                // - __export(require(...));
                // - tslib_1.__exportStar(require(...));
                // All are CallExpressions.
                var exprStmt = node;
                var expr = exprStmt.expression;
                if (expr.kind !== ts.SyntaxKind.CallExpression)
                    return false;
                var call = expr;
                var require_2 = this.extractRequire(call);
                var isExport = false;
                if (!require_2) {
                    // If it's an __export(require(...)), we emit:
                    //   var x = require(...);
                    //   __export(x);
                    // This extra variable is necessary in case there's a later import of the
                    // same module name.
                    var innerCall = this.isExportRequire(call);
                    if (!innerCall)
                        return false;
                    isExport = true;
                    call = innerCall; // Update call to point at the require() expression.
                    require_2 = this.extractRequire(call);
                }
                if (!require_2)
                    return false;
                this.writeLeadingTrivia(node);
                var varName = this.emitGoogRequire(null, require_2);
                if (isExport) {
                    // node is a statement containing a require() in it, while
                    // requireCall is that call.  We replace the require() call
                    // with the variable we emitted.
                    var fullStatement = node.getText();
                    var requireCall = call.getText();
                    this.emit(fullStatement.replace(requireCall, varName));
                }
                return true;
            }
            else {
                // It's some other type of statement.
                return false;
            }
        };
        /**
         * Emits a goog.require() statement for a given variable name and TypeScript import.
         *
         * E.g. from:
         *   var varName = require('tsImport');
         * produces:
         *   var varName = goog.require('goog.module.name');
         *
         * If the input varName is null, generates a new variable name if necessary.
         *
         * @return The variable name for the imported module, reusing a previous import if one
         *    is available.
         */
        ES5Processor.prototype.emitGoogRequire = function (varName, tsImport) {
            var modName;
            var isNamespaceImport = false;
            var nsImport = extractGoogNamespaceImport(tsImport);
            if (nsImport !== null) {
                // This is a namespace import, of the form "goog:foo.bar".
                // Fix it to just "foo.bar".
                modName = nsImport;
                isNamespaceImport = true;
            }
            else {
                if (this.host.convertIndexImportShorthand) {
                    tsImport = resolveIndexShorthand(this.host, this.file.fileName, tsImport);
                }
                modName = this.host.pathToModuleName(this.file.fileName, tsImport);
            }
            if (!varName) {
                var mv = this.moduleVariables.get(modName);
                if (mv) {
                    // Caller didn't request a specific variable name and we've already
                    // imported the module, so just return the name we already have for this module.
                    return mv;
                }
                // Note: we always introduce a variable for any import, regardless of whether
                // the caller requested one.  This avoids a Closure error.
                varName = this.generateFreshVariableName();
            }
            if (isNamespaceImport)
                this.namespaceImports.add(varName);
            if (this.moduleVariables.has(modName)) {
                this.emit("var " + varName + " = " + this.moduleVariables.get(modName) + ";");
            }
            else {
                this.emit("var " + varName + " = goog.require('" + modName + "');");
                this.moduleVariables.set(modName, varName);
            }
            return varName;
        };
        // workaround for syntax highlighting bug in Sublime: `
        /**
         * Returns the string argument if call is of the form
         *   require('foo')
         */
        ES5Processor.prototype.extractRequire = function (call) {
            // Verify that the call is a call to require(...).
            if (call.expression.kind !== ts.SyntaxKind.Identifier)
                return null;
            var ident = call.expression;
            if (rewriter_1.getIdentifierText(ident) !== 'require')
                return null;
            // Verify the call takes a single string argument and grab it.
            if (call.arguments.length !== 1)
                return null;
            var arg = call.arguments[0];
            if (arg.kind !== ts.SyntaxKind.StringLiteral)
                return null;
            return arg.text;
        };
        /**
         * Returns the require() call node if the outer call is of the forms:
         * - __export(require('foo'))
         * - tslib_1.__exportStar(require('foo'), bar)
         */
        ES5Processor.prototype.isExportRequire = function (call) {
            switch (call.expression.kind) {
                case ts.SyntaxKind.Identifier:
                    var ident = call.expression;
                    // TS_24_COMPAT: accept three leading underscores
                    if (ident.text !== '__export' && ident.text !== '___export') {
                        return null;
                    }
                    break;
                case ts.SyntaxKind.PropertyAccessExpression:
                    var propAccess = call.expression;
                    // TS_24_COMPAT: accept three leading underscores
                    if (propAccess.name.text !== '__exportStar' && propAccess.name.text !== '___exportStar') {
                        return null;
                    }
                    break;
                default:
                    return null;
            }
            // Verify the call takes at least one argument and check it.
            if (call.arguments.length < 1)
                return null;
            var arg = call.arguments[0];
            if (arg.kind !== ts.SyntaxKind.CallExpression)
                return null;
            var innerCall = arg;
            if (!this.extractRequire(innerCall))
                return null;
            return innerCall;
        };
        ES5Processor.prototype.isEsModuleProperty = function (expr) {
            // We're matching the explicit source text generated by the TS compiler.
            return expr.getText() === 'Object.defineProperty(exports, "__esModule", { value: true });';
        };
        ES5Processor.prototype.isModuleExportsAssignment = function (expr) {
            // Looking for "module.exports = ...;"
            if (!ts.isBinaryExpression(expr.expression))
                return false;
            if (expr.expression.operatorToken.kind !== ts.SyntaxKind.EqualsToken)
                return false;
            return expr.expression.left.getText() === 'module.exports';
        };
        ES5Processor.prototype.emitExportsAssignment = function (expr) {
            this.emitCommentWithoutStatementBody(expr);
            this.emit('exports =');
            this.visit(expr.expression.right);
            this.emit(';');
        };
        /**
         * maybeProcess is called during the recursive traversal of the program's AST.
         *
         * @return True if the node was processed/emitted, false if it should be emitted as is.
         */
        ES5Processor.prototype.maybeProcess = function (node) {
            switch (node.kind) {
                case ts.SyntaxKind.PropertyAccessExpression:
                    var propAccess = node;
                    // We're looking for an expression of the form:
                    //   module_name_var.default
                    if (rewriter_1.getIdentifierText(propAccess.name) !== 'default')
                        break;
                    if (propAccess.expression.kind !== ts.SyntaxKind.Identifier)
                        break;
                    var lhs = rewriter_1.getIdentifierText(propAccess.expression);
                    if (!this.namespaceImports.has(lhs))
                        break;
                    // Emit the same expression, with spaces to replace the ".default" part
                    // so that source maps still line up.
                    this.writeLeadingTrivia(node);
                    this.emit(lhs + "        ");
                    return true;
                default:
                    break;
            }
            return false;
        };
        /** Generates a new variable name inside the tsickle_ namespace. */
        ES5Processor.prototype.generateFreshVariableName = function () {
            return "tsickle_module_" + this.unusedIndex++ + "_";
        };
        return ES5Processor;
    }(rewriter_1.Rewriter));
    /**
     * Converts TypeScript's JS+CommonJS output to Closure goog.module etc.
     * For use as a postprocessing step *after* TypeScript emits JavaScript.
     *
     * @param fileName The source file name.
     * @param moduleId The "module id", a module-identifying string that is
     *     the value module.id in the scope of the module.
     * @param pathToModuleName A function that maps a filesystem .ts path to a
     *     Closure module name, as found in a goog.require('...') statement.
     *     The context parameter is the referencing file, used for resolving
     *     imports with relative paths like "import * as foo from '../foo';".
     * @param prelude An additional prelude to insert after the `goog.module` call,
     *     e.g. with additional imports or requires.
     */
    function processES5(host, fileName, content) {
        var file = ts.createSourceFile(fileName, content, ts.ScriptTarget.ES5, true);
        return new ES5Processor(host, file).process();
    }
    exports.processES5 = processES5;
    function convertCommonJsToGoogModuleIfNeeded(host, modulesManifest, fileName, content) {
        if (!host.googmodule || util_1.isDtsFileName(fileName)) {
            return content;
        }
        var _a = processES5(host, fileName, content), output = _a.output, referencedModules = _a.referencedModules;
        var moduleName = host.pathToModuleName('', fileName);
        modulesManifest.addModule(fileName, moduleName);
        try {
            for (var referencedModules_1 = __values(referencedModules), referencedModules_1_1 = referencedModules_1.next(); !referencedModules_1_1.done; referencedModules_1_1 = referencedModules_1.next()) {
                var referenced = referencedModules_1_1.value;
                modulesManifest.addReferencedModule(fileName, referenced);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (referencedModules_1_1 && !referencedModules_1_1.done && (_b = referencedModules_1.return)) _b.call(referencedModules_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return output;
        var e_2, _b;
    }
    exports.convertCommonJsToGoogModuleIfNeeded = convertCommonJsToGoogModuleIfNeeded;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXM1cHJvY2Vzc29yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2VzNXByb2Nlc3Nvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRUgsMkJBQTZCO0lBRTdCLGlHQUFnRjtJQUVoRixpREFBdUQ7SUFDdkQsMkNBQW1DO0lBQ25DLHlDQUFxQztJQUVyQywwREFBMEQ7SUFDMUQsSUFBTSxhQUFhLEdBQUcsa0NBQWtDLENBQUM7SUE2QnpEOzs7T0FHRztJQUNILG9DQUEyQyxRQUFnQjtRQUN6RCxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hFLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBSEQsZ0VBR0M7SUFFRDs7OztPQUlHO0lBQ0gsK0JBQ0ksSUFBa0UsRUFBRSxRQUFnQixFQUNwRixRQUFnQjtRQUNsQixJQUFNLFFBQVEsR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuRixFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUM7WUFBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQzNELElBQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVELElBQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzRixFQUFFLENBQUMsQ0FBQyxjQUFj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QUFFLE9BQWU7UUFFbEYsSUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDL0UsTUFBTSxDQUFDLElBQUksWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNoRCxDQUFDO0lBSkQsZ0NBSUM7SUFFRCw2Q0FDSSxJQUFzQixFQUFFLGVBQWdDLEVBQUUsUUFBZ0IsRUFDMUUsT0FBZTtRQUNqQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksb0JBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEQsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUNqQixDQUFDO1FBQ0ssSUFBQSx3Q0FBaUUsRUFBaEUsa0JBQU0sRUFBRSx3Q0FBaUIsQ0FBd0M7UUFFeEUsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN2RCxlQUFlLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQzs7WUFDaEQsR0FBRyxDQUFDLENBQXFCLElBQUEsc0JBQUEsU0FBQSxpQkFBaUIsQ0FBQSxvREFBQTtnQkFBckMsSUFBTSxVQUFVLDhCQUFBO2dCQUNuQixlQUFlLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQzNEOzs7Ozs7Ozs7UUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDOztJQUNoQixDQUFDO0lBZkQsa0ZBZUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7aXNDbG9zdXJlRmlsZW92ZXJ2aWV3Q29tbWVudH0gZnJvbSAnLi9maWxlb3ZlcnZpZXdfY29tbWVudF90cmFuc2Zvcm1lcic7XG5pbXBvcnQge01vZHVsZXNNYW5pZmVzdH0gZnJvbSAnLi9tb2R1bGVzX21hbmlmZXN0JztcbmltcG9ydCB7Z2V0SWRlbnRpZmllclRleHQsIFJld3JpdGVyfSBmcm9tICcuL3Jld3JpdGVyJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJy4vdHlwZXNjcmlwdCc7XG5pbXBvcnQge2lzRHRzRmlsZU5hbWV9IGZyb20gJy4vdXRpbCc7XG5cbi8vIE1hdGNoZXMgY29tbW9uIGV4dGVuc2lvbnMgb2YgVHlwZVNjcmlwdCBpbnB1dCBmaWxlbmFtZXNcbmNvbnN0IFRTX0VYVEVOU0lPTlMgPSAvKFxcLnRzfFxcLmRcXC50c3xcXC5qc3xcXC5qc3h8XFwudHN4KSQvO1xuXG5leHBvcnQgaW50ZXJmYWNlIEVzNVByb2Nlc3Nvckhvc3Qge1xuICAvKipcbiAgICogVGFrZXMgYSBjb250ZXh0ICh0aGUgY3VycmVudCBmaWxlKSBhbmQgdGhlIHBhdGggb2YgdGhlIGZpbGUgdG8gaW1wb3J0XG4gICAqICBhbmQgZ2VuZXJhdGVzIGEgZ29vZ21vZHVsZSBtb2R1bGUgbmFtZVxuICAgKi9cbiAgcGF0aFRvTW9kdWxlTmFtZShjb250ZXh0OiBzdHJpbmcsIGltcG9ydFBhdGg6IHN0cmluZyk6IHN0cmluZztcbiAgLyoqXG4gICAqIElmIHdlIGRvIGdvb2dtb2R1bGUgcHJvY2Vzc2luZywgd2UgcG9seWZpbGwgbW9kdWxlLmlkLCBzaW5jZSB0aGF0J3NcbiAgICogcGFydCBvZiBFUzYgbW9kdWxlcy4gIFRoaXMgZnVuY3Rpb24gZGV0ZXJtaW5lcyB3aGF0IHRoZSBtb2R1bGUuaWQgd2lsbCBiZVxuICAgKiBmb3IgZWFjaCBmaWxlLlxuICAgKi9cbiAgZmlsZU5hbWVUb01vZHVsZUlkKGZpbGVOYW1lOiBzdHJpbmcpOiBzdHJpbmc7XG4gIC8qKiBXaGV0aGVyIHRvIGNvbnZlcnQgQ29tbW9uSlMgbW9kdWxlIHN5bnRheCB0byBgZ29vZy5tb2R1bGVgIENsb3N1cmUgaW1wb3J0cy4gKi9cbiAgZ29vZ21vZHVsZT86IGJvb2xlYW47XG4gIC8qKiBXaGV0aGVyIHRoZSBlbWl0IHRhcmdldHMgRVM1IG9yIEVTNisuICovXG4gIGVzNU1vZGU/OiBib29sZWFuO1xuICAvKiogZXhwYW5kIFwiaW1wb3J0ICdmb28nO1wiIHRvIFwiaW1wb3J0ICdmb28vaW5kZXgnO1wiIGlmIGl0IHBvaW50cyB0byBhbiBpbmRleCBmaWxlLiAqL1xuICBjb252ZXJ0SW5kZXhJbXBvcnRTaG9ydGhhbmQ/OiBib29sZWFuO1xuICAvKipcbiAgICogQW4gYWRkaXRpb25hbCBwcmVsdWRlIHRvIGluc2VydCBpbiBmcm9udCBvZiB0aGUgZW1pdHRlZCBjb2RlLCBlLmcuIHRvIGltcG9ydCBhIHNoYXJlZCBsaWJyYXJ5LlxuICAgKi9cbiAgcHJlbHVkZT86IHN0cmluZztcblxuICBvcHRpb25zOiB0cy5Db21waWxlck9wdGlvbnM7XG4gIGhvc3Q6IHRzLk1vZHVsZVJlc29sdXRpb25Ib3N0O1xufVxuXG4vKipcbiAqIEV4dHJhY3RzIHRoZSBuYW1lc3BhY2UgcGFydCBvZiBhIGdvb2c6IGltcG9ydCwgb3IgcmV0dXJucyBudWxsIGlmIHRoZSBnaXZlblxuICogaW1wb3J0IGlzIG5vdCBhIGdvb2c6IGltcG9ydC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RHb29nTmFtZXNwYWNlSW1wb3J0KHRzSW1wb3J0OiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gIGlmICh0c0ltcG9ydC5tYXRjaCgvXmdvb2c6LykpIHJldHVybiB0c0ltcG9ydC5zdWJzdHJpbmcoJ2dvb2c6Jy5sZW5ndGgpO1xuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGZyb20gaW1wbGljaXQgYGltcG9ydCB7fSBmcm9tICdwa2cnYCB0byBgaW1wb3J0IHt9IGZyb20gJ3BrZy9pbmRleCcuXG4gKiBUeXBlU2NyaXB0IHN1cHBvcnRzIHRoZSBzaG9ydGhhbmQsIGJ1dCBub3QgYWxsIEVTNiBtb2R1bGUgbG9hZGVycyBkby5cbiAqIFdvcmthcm91bmQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvMTI1OTdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVJbmRleFNob3J0aGFuZChcbiAgICBob3N0OiB7b3B0aW9uczogdHMuQ29tcGlsZXJPcHRpb25zLCBob3N0OiB0cy5Nb2R1bGVSZXNvbHV0aW9uSG9zdH0sIGZpbGVOYW1lOiBzdHJpbmcsXG4gICAgaW1wb3J0ZWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHJlc29sdmVkID0gdHMucmVzb2x2ZU1vZHVsZU5hbWUoaW1wb3J0ZWQsIGZpbGVOYW1lLCBob3N0Lm9wdGlvbnMsIGhvc3QuaG9zdCk7XG4gIGlmICghcmVzb2x2ZWQgfHwgIXJlc29sdmVkLnJlc29sdmVkTW9kdWxlKSByZXR1cm4gaW1wb3J0ZWQ7XG4gIGNvbnN0IHJlcXVlc3RlZE1vZHVsZSA9IGltcG9ydGVkLnJlcGxhY2UoVFNfRVhURU5TSU9OUywgJycpO1xuICBjb25zdCByZXNvbHZlZE1vZHVsZSA9IHJlc29sdmVkLnJlc29sdmVkTW9kdWxlLnJlc29sdmVkRmlsZU5hbWUucmVwbGFjZShUU19FWFRFTlNJT05TLCAnJyk7XG4gIGlmIChyZXNvbHZlZE1vZHVsZS5pbmRleE9mKCdub2RlX21vZHVsZXMnKSA9PT0gLTEgJiZcbiAgICAgIHJlcXVlc3RlZE1vZHVsZS5zdWJzdHIocmVxdWVzdGVkTW9kdWxlLmxhc3RJbmRleE9mKCcvJykpICE9PVxuICAgICAgICAgIHJlc29sdmVkTW9kdWxlLnN1YnN0cihyZXNvbHZlZE1vZHVsZS5sYXN0SW5kZXhPZignLycpKSkge1xuICAgIGltcG9ydGVkID0gJy4vJyArIHBhdGgucmVsYXRpdmUocGF0aC5kaXJuYW1lKGZpbGVOYW1lKSwgcmVzb2x2ZWRNb2R1bGUpLnJlcGxhY2UocGF0aC5zZXAsICcvJyk7XG4gIH1cbiAgcmV0dXJuIGltcG9ydGVkO1xufVxuXG4vKipcbiAqIEVTNVByb2Nlc3NvciBwb3N0cHJvY2Vzc2VzIFR5cGVTY3JpcHQgY29tcGlsYXRpb24gb3V0cHV0IEpTLCB0byByZXdyaXRlIGNvbW1vbmpzIHJlcXVpcmUoKXMgaW50b1xuICogZ29vZy5yZXF1aXJlKCkuIENvbnRyYXJ5IHRvIGl0cyBuYW1lIGl0IGhhbmRsZXMgY29udmVydGluZyB0aGUgbW9kdWxlcyBpbiBib3RoIEVTNSBhbmQgRVM2XG4gKiBvdXRwdXRzLlxuICovXG5jbGFzcyBFUzVQcm9jZXNzb3IgZXh0ZW5kcyBSZXdyaXRlciB7XG4gIC8qKlxuICAgKiBuYW1lc3BhY2VJbXBvcnRzIGNvbGxlY3RzIHRoZSB2YXJpYWJsZXMgZm9yIGltcG9ydGVkIGdvb2cubW9kdWxlcy5cbiAgICogSWYgdGhlIG9yaWdpbmFsIFRTIGlucHV0IGlzOlxuICAgKiAgIGltcG9ydCBmb28gZnJvbSAnZ29vZzpiYXInO1xuICAgKiB0aGVuIFRTIHByb2R1Y2VzOlxuICAgKiAgIHZhciBmb28gPSByZXF1aXJlKCdnb29nOmJhcicpO1xuICAgKiBhbmQgdGhpcyBjbGFzcyByZXdyaXRlcyBpdCB0bzpcbiAgICogICB2YXIgZm9vID0gcmVxdWlyZSgnZ29vZy5iYXInKTtcbiAgICogQWZ0ZXIgdGhpcyBzdGVwLCBuYW1lc3BhY2VJbXBvcnRzWydmb28nXSBpcyB0cnVlLlxuICAgKiAoVGhpcyBpcyB1c2VkIHRvIHJld3JpdGUgJ2Zvby5kZWZhdWx0JyBpbnRvIGp1c3QgJ2ZvbycuKVxuICAgKi9cbiAgbmFtZXNwYWNlSW1wb3J0cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gIC8qKlxuICAgKiBtb2R1bGVWYXJpYWJsZXMgbWFwcyBmcm9tIG1vZHVsZSBuYW1lcyB0byB0aGUgdmFyaWFibGVzIHRoZXkncmUgYXNzaWduZWQgdG8uXG4gICAqIENvbnRpbnVpbmcgdGhlIGFib3ZlIGV4YW1wbGUsIG1vZHVsZVZhcmlhYmxlc1snZ29vZy5iYXInXSA9ICdmb28nLlxuICAgKi9cbiAgbW9kdWxlVmFyaWFibGVzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcblxuICAvKiogc3RyaXBwZWRTdHJpY3QgaXMgdHJ1ZSBvbmNlIHdlJ3ZlIHN0cmlwcGVkIGEgXCJ1c2Ugc3RyaWN0XCI7IGZyb20gdGhlIGlucHV0LiAqL1xuICBzdHJpcHBlZFN0cmljdCA9IGZhbHNlO1xuXG4gIC8qKiB1bnVzZWRJbmRleCBpcyB1c2VkIHRvIGdlbmVyYXRlIGZyZXNoIHN5bWJvbHMgZm9yIHVubmFtZWQgaW1wb3J0cy4gKi9cbiAgdW51c2VkSW5kZXggPSAwO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaG9zdDogRXM1UHJvY2Vzc29ySG9zdCwgZmlsZTogdHMuU291cmNlRmlsZSkge1xuICAgIHN1cGVyKGZpbGUpO1xuICB9XG5cbiAgcHJvY2VzcygpOiB7b3V0cHV0OiBzdHJpbmcsIHJlZmVyZW5jZWRNb2R1bGVzOiBzdHJpbmdbXX0ge1xuICAgIHRoaXMuZW1pdEZpbGVDb21tZW50KCk7XG5cbiAgICBjb25zdCBtb2R1bGVJZCA9IHRoaXMuaG9zdC5maWxlTmFtZVRvTW9kdWxlSWQodGhpcy5maWxlLmZpbGVOYW1lKTtcbiAgICBjb25zdCBtb2R1bGVOYW1lID0gdGhpcy5ob3N0LnBhdGhUb01vZHVsZU5hbWUoJycsIHRoaXMuZmlsZS5maWxlTmFtZSk7XG4gICAgLy8gTkI6IE5vIGxpbmVicmVhayBhZnRlciBtb2R1bGUgY2FsbCBzbyBzb3VyY2VtYXBzIGFyZSBub3Qgb2Zmc2V0LlxuICAgIHRoaXMuZW1pdChgZ29vZy5tb2R1bGUoJyR7bW9kdWxlTmFtZX0nKTtgKTtcbiAgICBpZiAodGhpcy5ob3N0LnByZWx1ZGUpIHRoaXMuZW1pdCh0aGlzLmhvc3QucHJlbHVkZSk7XG4gICAgLy8gQWxsb3cgY29kZSB0byB1c2UgYG1vZHVsZS5pZGAgdG8gZGlzY292ZXIgaXRzIG1vZHVsZSBVUkwsIGUuZy4gdG8gcmVzb2x2ZVxuICAgIC8vIGEgdGVtcGxhdGUgVVJMIGFnYWluc3QuXG4gICAgLy8gVXNlcyAndmFyJywgYXMgdGhpcyBjb2RlIGlzIGluc2VydGVkIGluIEVTNiBhbmQgRVM1IG1vZGVzLlxuICAgIC8vIFRoZSBmb2xsb3dpbmcgcGF0dGVybiBlbnN1cmVzIGNsb3N1cmUgZG9lc24ndCB0aHJvdyBhbiBlcnJvciBpbiBhZHZhbmNlZFxuICAgIC8vIG9wdGltaXphdGlvbnMgbW9kZS5cbiAgICBpZiAodGhpcy5ob3N0LmVzNU1vZGUpIHtcbiAgICAgIHRoaXMuZW1pdChgdmFyIG1vZHVsZSA9IG1vZHVsZSB8fCB7aWQ6ICcke21vZHVsZUlkfSd9O2ApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgYGV4cG9ydHMgPSB7fWAgc2VydmVzIGFzIGEgZGVmYXVsdCBleHBvcnQgdG8gZGlzYWJsZSBDbG9zdXJlIENvbXBpbGVyJ3MgZXJyb3IgY2hlY2tpbmdcbiAgICAgIC8vIGZvciBtdXRhYmxlIGV4cG9ydHMuIFRoYXQncyBPSyBiZWNhdXNlIFRTIGNvbXBpbGVyIG1ha2VzIHN1cmUgdGhhdCBjb25zdW1pbmcgY29kZSBhbHdheXNcbiAgICAgIC8vIGFjY2Vzc2VzIGV4cG9ydHMgdGhyb3VnaCB0aGUgbW9kdWxlIG9iamVjdCwgc28gbXV0YWJsZSBleHBvcnRzIHdvcmsuXG4gICAgICAvLyBJdCBpcyBvbmx5IGluc2VydGVkIGluIEVTNiBiZWNhdXNlIHdlIHN0cmlwIGAuZGVmYXVsdGAgYWNjZXNzZXMgaW4gRVM1IG1vZGUsIHdoaWNoIGJyZWFrc1xuICAgICAgLy8gd2hlbiBhc3NpZ25pbmcgYW4gYGV4cG9ydHMgPSB7fWAgb2JqZWN0IGFuZCB0aGVuIGxhdGVyIGFjY2Vzc2luZyBpdC5cbiAgICAgIC8vIEhvd2V2ZXIgQ2xvc3VyZSBiYWlscyBpZiBjb2RlIGxhdGVyIG9uIGFzc2lnbnMgaW50byBleHBvcnRzIGRpcmVjdGx5LCBhcyB3ZSBkbyBpZiB3ZSBoYXZlXG4gICAgICAvLyBhbiBcImV4cG9ydHMgPSBcIiBibG9jaywgc28gc2tpcCBlbWl0IGlmIHRoYXQncyB0aGUgY2FzZS5cbiAgICAgIGlmICghdGhpcy5maWxlLnN0YXRlbWVudHMuZmluZChcbiAgICAgICAgICAgICAgcyA9PiB0cy5pc0V4cHJlc3Npb25TdGF0ZW1lbnQocykgJiYgdGhpcy5pc01vZHVsZUV4cG9ydHNBc3NpZ25tZW50KHMpKSkge1xuICAgICAgICB0aGlzLmVtaXQoYCBleHBvcnRzID0ge307YCk7XG4gICAgICB9XG4gICAgICAvLyBUaGUgbW9kdWxlPW1vZHVsZSBiaXQgc3VwcHJlc3NlcyBhbiB1bnVzZWQgdmFyaWFibGUgd2FybmluZyB3aGljaFxuICAgICAgLy8gbWF5IHRyaWdnZXIgZGVwZW5kaW5nIG9uIHRoZSBjb21waWxhdGlvbiBmbGFncy5cbiAgICAgIHRoaXMuZW1pdChgIHZhciBtb2R1bGUgPSBtb2R1bGUgfHwge2lkOiAnJHttb2R1bGVJZH0nfTsgbW9kdWxlID0gbW9kdWxlO2ApO1xuICAgIH1cblxuICAgIGxldCBwb3MgPSAwO1xuICAgIGZvciAoY29uc3Qgc3RtdCBvZiB0aGlzLmZpbGUuc3RhdGVtZW50cykge1xuICAgICAgdGhpcy53cml0ZVJhbmdlKHRoaXMuZmlsZSwgcG9zLCBzdG10LmdldEZ1bGxTdGFydCgpKTtcbiAgICAgIHRoaXMudmlzaXRUb3BMZXZlbChzdG10KTtcbiAgICAgIHBvcyA9IHN0bXQuZ2V0RW5kKCk7XG4gICAgfVxuICAgIHRoaXMud3JpdGVSYW5nZSh0aGlzLmZpbGUsIHBvcywgdGhpcy5maWxlLmdldEVuZCgpKTtcblxuICAgIGNvbnN0IHJlZmVyZW5jZWRNb2R1bGVzID0gQXJyYXkuZnJvbSh0aGlzLm1vZHVsZVZhcmlhYmxlcy5rZXlzKCkpO1xuICAgIC8vIE5vdGU6IGRvbid0IHNvcnQgcmVmZXJlbmNlZE1vZHVsZXMsIGFzIHRoZSBrZXlzIGFyZSBpbiB0aGUgc2FtZSBvcmRlclxuICAgIC8vIHRoZXkgb2NjdXIgaW4gdGhlIHNvdXJjZSBmaWxlLlxuICAgIGNvbnN0IHtvdXRwdXR9ID0gdGhpcy5nZXRPdXRwdXQoKTtcbiAgICByZXR1cm4ge291dHB1dCwgcmVmZXJlbmNlZE1vZHVsZXN9O1xuICB9XG5cbiAgLyoqIEVtaXRzIGZpbGUgY29tbWVudHMgZm9yIHRoZSBjdXJyZW50IHNvdXJjZSBmaWxlLCBpZiBhbnkuICovXG4gIHByaXZhdGUgZW1pdEZpbGVDb21tZW50KCkge1xuICAgIGNvbnN0IGxlYWRpbmdDb21tZW50cyA9IHRzLmdldExlYWRpbmdDb21tZW50UmFuZ2VzKHRoaXMuZmlsZS5nZXRGdWxsVGV4dCgpLCAwKSB8fCBbXTtcbiAgICBjb25zdCBmaWxlQ29tbWVudCA9IGxlYWRpbmdDb21tZW50cy5maW5kKGMgPT4ge1xuICAgICAgaWYgKGMua2luZCAhPT0gdHMuU3ludGF4S2luZC5NdWx0aUxpbmVDb21tZW50VHJpdmlhKSByZXR1cm4gZmFsc2U7XG4gICAgICBjb25zdCBjb21tZW50VGV4dCA9IHRoaXMuZmlsZS5nZXRGdWxsVGV4dCgpLnN1YnN0cmluZyhjLnBvcywgYy5lbmQpO1xuICAgICAgcmV0dXJuIGlzQ2xvc3VyZUZpbGVvdmVydmlld0NvbW1lbnQoY29tbWVudFRleHQpO1xuICAgIH0pO1xuICAgIGlmICghZmlsZUNvbW1lbnQpIHJldHVybjtcbiAgICBsZXQgZW5kID0gZmlsZUNvbW1lbnQuZW5kO1xuICAgIGlmIChmaWxlQ29tbWVudC5oYXNUcmFpbGluZ05ld0xpbmUpIGVuZCsrO1xuICAgIHRoaXMud3JpdGVMZWFkaW5nVHJpdmlhKHRoaXMuZmlsZSwgZW5kKTtcbiAgfVxuXG4gIC8qKlxuICAgKiB2aXNpdFRvcExldmVsIHByb2Nlc3NlcyBhIHRvcC1sZXZlbCB0cy5Ob2RlIGFuZCBlbWl0cyBpdHMgY29udGVudHMuXG4gICAqXG4gICAqIEl0J3Mgc2VwYXJhdGUgZnJvbSB0aGUgbm9ybWFsIFJld3JpdGVyIHJlY3Vyc2l2ZSB0cmF2ZXJzYWxcbiAgICogYmVjYXVzZSBzb21lIHRvcC1sZXZlbCBzdGF0ZW1lbnRzIGFyZSBoYW5kbGVkIHNwZWNpYWxseS5cbiAgICovXG4gIHZpc2l0VG9wTGV2ZWwobm9kZTogdHMuTm9kZSkge1xuICAgIHN3aXRjaCAobm9kZS5raW5kKSB7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRXhwcmVzc2lvblN0YXRlbWVudDpcbiAgICAgICAgY29uc3QgZXhwclN0YXRlbWVudCA9IG5vZGUgYXMgdHMuRXhwcmVzc2lvblN0YXRlbWVudDtcbiAgICAgICAgLy8gQ2hlY2sgZm9yIFwidXNlIHN0cmljdFwiIGFuZCBza2lwIGl0IGlmIG5lY2Vzc2FyeS5cbiAgICAgICAgaWYgKCF0aGlzLnN0cmlwcGVkU3RyaWN0ICYmIHRoaXMuaXNVc2VTdHJpY3Qobm9kZSkpIHtcbiAgICAgICAgICB0aGlzLmVtaXRDb21tZW50V2l0aG91dFN0YXRlbWVudEJvZHkobm9kZSk7XG4gICAgICAgICAgdGhpcy5zdHJpcHBlZFN0cmljdCA9IHRydWU7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIENoZWNrIGZvcjpcbiAgICAgICAgLy8gLSBcInJlcXVpcmUoJ2ZvbycpO1wiIChhIHJlcXVpcmUgZm9yIGl0cyBzaWRlIGVmZmVjdHMpXG4gICAgICAgIC8vIC0gXCJfX2V4cG9ydChyZXF1aXJlKC4uLikpO1wiIChhbiBcImV4cG9ydCAqIGZyb20gLi4uXCIpXG4gICAgICAgIGlmICh0aGlzLmVtaXRSZXdyaXR0ZW5SZXF1aXJlcyhub2RlKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBDaGVjayBmb3JcbiAgICAgICAgLy8gICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIC4uLik7XG4gICAgICAgIGlmICh0aGlzLmlzRXNNb2R1bGVQcm9wZXJ0eShleHByU3RhdGVtZW50KSkge1xuICAgICAgICAgIHRoaXMuZW1pdENvbW1lbnRXaXRob3V0U3RhdGVtZW50Qm9keShub2RlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2hlY2sgZm9yXG4gICAgICAgIC8vICAgbW9kdWxlLmV4cG9ydHMgPSAuLi47XG4gICAgICAgIC8vIFJld3JpdGUgdG8gZ29vZy5tb2R1bGUnc1xuICAgICAgICAvLyAgIGV4cG9ydHMgPSAuLi47XG4gICAgICAgIGlmICh0aGlzLmlzTW9kdWxlRXhwb3J0c0Fzc2lnbm1lbnQoZXhwclN0YXRlbWVudCkpIHtcbiAgICAgICAgICB0aGlzLmVtaXRFeHBvcnRzQXNzaWdubWVudChleHByU3RhdGVtZW50KTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3RoZXJ3aXNlIGZhbGwgdGhyb3VnaCB0byBkZWZhdWx0IHByb2Nlc3NpbmcuXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlZhcmlhYmxlU3RhdGVtZW50OlxuICAgICAgICAvLyBDaGVjayBmb3IgYSBcInZhciB4ID0gcmVxdWlyZSgnZm9vJyk7XCIuXG4gICAgICAgIGlmICh0aGlzLmVtaXRSZXdyaXR0ZW5SZXF1aXJlcyhub2RlKSkgcmV0dXJuO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICB0aGlzLnZpc2l0KG5vZGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBUeXBlU2NyaXB0IEFTVCBhdHRhY2hlcyBjb21tZW50cyB0byBzdGF0ZW1lbnQgbm9kZXMsIHNvIGV2ZW4gaWYgYSBub2RlXG4gICAqIGNvbnRhaW5zIGNvZGUgd2Ugd2FudCB0byBza2lwIGVtaXR0aW5nLCB3ZSBuZWVkIHRvIGVtaXQgdGhlIGF0dGFjaGVkXG4gICAqIGNvbW1lbnQocykuXG4gICAqL1xuICBlbWl0Q29tbWVudFdpdGhvdXRTdGF0ZW1lbnRCb2R5KG5vZGU6IHRzLk5vZGUpIHtcbiAgICB0aGlzLndyaXRlTGVhZGluZ1RyaXZpYShub2RlKTtcbiAgfVxuXG4gIC8qKiBpc1VzZVN0cmljdCByZXR1cm5zIHRydWUgaWYgbm9kZSBpcyBhIFwidXNlIHN0cmljdFwiOyBzdGF0ZW1lbnQuICovXG4gIGlzVXNlU3RyaWN0KG5vZGU6IHRzLk5vZGUpOiBib29sZWFuIHtcbiAgICBpZiAobm9kZS5raW5kICE9PSB0cy5TeW50YXhLaW5kLkV4cHJlc3Npb25TdGF0ZW1lbnQpIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBleHByU3RtdCA9IG5vZGUgYXMgdHMuRXhwcmVzc2lvblN0YXRlbWVudDtcbiAgICBjb25zdCBleHByID0gZXhwclN0bXQuZXhwcmVzc2lvbjtcbiAgICBpZiAoZXhwci5raW5kICE9PSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWwpIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBsaXRlcmFsID0gZXhwciBhcyB0cy5TdHJpbmdMaXRlcmFsO1xuICAgIHJldHVybiBsaXRlcmFsLnRleHQgPT09ICd1c2Ugc3RyaWN0JztcbiAgfVxuXG4gIC8qKlxuICAgKiBlbWl0UmV3cml0dGVuUmVxdWlyZXMgcmV3cml0ZXMgcmVxdWlyZSgpcyBpbnRvIGdvb2cucmVxdWlyZSgpIGVxdWl2YWxlbnRzLlxuICAgKlxuICAgKiBAcmV0dXJuIFRydWUgaWYgdGhlIG5vZGUgd2FzIHJld3JpdHRlbiwgZmFsc2UgaWYgbmVlZHMgb3JkaW5hcnkgcHJvY2Vzc2luZy5cbiAgICovXG4gIGVtaXRSZXdyaXR0ZW5SZXF1aXJlcyhub2RlOiB0cy5Ob2RlKTogYm9vbGVhbiB7XG4gICAgLy8gV2UncmUgbG9va2luZyBmb3IgcmVxdWlyZXMsIG9mIG9uZSBvZiB0aGUgZm9ybXM6XG4gICAgLy8gLSBcInZhciBpbXBvcnROYW1lID0gcmVxdWlyZSguLi4pO1wiLlxuICAgIC8vIC0gXCJyZXF1aXJlKC4uLik7XCIuXG4gICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5WYXJpYWJsZVN0YXRlbWVudCkge1xuICAgICAgLy8gSXQncyBwb3NzaWJseSBvZiB0aGUgZm9ybSBcInZhciB4ID0gcmVxdWlyZSguLi4pO1wiLlxuICAgICAgY29uc3QgdmFyU3RtdCA9IG5vZGUgYXMgdHMuVmFyaWFibGVTdGF0ZW1lbnQ7XG5cbiAgICAgIC8vIFZlcmlmeSBpdCdzIGEgc2luZ2xlIGRlY2wgKGFuZCBub3QgXCJ2YXIgeCA9IC4uLiwgeSA9IC4uLjtcIikuXG4gICAgICBpZiAodmFyU3RtdC5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zLmxlbmd0aCAhPT0gMSkgcmV0dXJuIGZhbHNlO1xuICAgICAgY29uc3QgZGVjbCA9IHZhclN0bXQuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1swXTtcblxuICAgICAgLy8gR3JhYiB0aGUgdmFyaWFibGUgbmFtZSAoYXZvaWRpbmcgdGhpbmdzIGxpa2UgZGVzdHJ1Y3R1cmluZyBiaW5kcykuXG4gICAgICBpZiAoZGVjbC5uYW1lLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikgcmV0dXJuIGZhbHNlO1xuICAgICAgY29uc3QgdmFyTmFtZSA9IGdldElkZW50aWZpZXJUZXh0KGRlY2wubmFtZSBhcyB0cy5JZGVudGlmaWVyKTtcbiAgICAgIGlmICghZGVjbC5pbml0aWFsaXplciB8fCBkZWNsLmluaXRpYWxpemVyLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuQ2FsbEV4cHJlc3Npb24pIHJldHVybiBmYWxzZTtcbiAgICAgIGNvbnN0IGNhbGwgPSBkZWNsLmluaXRpYWxpemVyIGFzIHRzLkNhbGxFeHByZXNzaW9uO1xuICAgICAgY29uc3QgcmVxdWlyZSA9IHRoaXMuZXh0cmFjdFJlcXVpcmUoY2FsbCk7XG4gICAgICBpZiAoIXJlcXVpcmUpIHJldHVybiBmYWxzZTtcbiAgICAgIHRoaXMud3JpdGVMZWFkaW5nVHJpdmlhKG5vZGUpO1xuICAgICAgdGhpcy5lbWl0R29vZ1JlcXVpcmUodmFyTmFtZSwgcmVxdWlyZSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5FeHByZXNzaW9uU3RhdGVtZW50KSB7XG4gICAgICAvLyBJdCdzIHBvc3NpYmx5IG9mIHRoZSBmb3JtOlxuICAgICAgLy8gLSByZXF1aXJlKC4uLik7XG4gICAgICAvLyAtIF9fZXhwb3J0KHJlcXVpcmUoLi4uKSk7XG4gICAgICAvLyAtIHRzbGliXzEuX19leHBvcnRTdGFyKHJlcXVpcmUoLi4uKSk7XG4gICAgICAvLyBBbGwgYXJlIENhbGxFeHByZXNzaW9ucy5cbiAgICAgIGNvbnN0IGV4cHJTdG10ID0gbm9kZSBhcyB0cy5FeHByZXNzaW9uU3RhdGVtZW50O1xuICAgICAgY29uc3QgZXhwciA9IGV4cHJTdG10LmV4cHJlc3Npb247XG4gICAgICBpZiAoZXhwci5raW5kICE9PSB0cy5TeW50YXhLaW5kLkNhbGxFeHByZXNzaW9uKSByZXR1cm4gZmFsc2U7XG4gICAgICBsZXQgY2FsbCA9IGV4cHIgYXMgdHMuQ2FsbEV4cHJlc3Npb247XG5cbiAgICAgIGxldCByZXF1aXJlID0gdGhpcy5leHRyYWN0UmVxdWlyZShjYWxsKTtcbiAgICAgIGxldCBpc0V4cG9ydCA9IGZhbHNlO1xuICAgICAgaWYgKCFyZXF1aXJlKSB7XG4gICAgICAgIC8vIElmIGl0J3MgYW4gX19leHBvcnQocmVxdWlyZSguLi4pKSwgd2UgZW1pdDpcbiAgICAgICAgLy8gICB2YXIgeCA9IHJlcXVpcmUoLi4uKTtcbiAgICAgICAgLy8gICBfX2V4cG9ydCh4KTtcbiAgICAgICAgLy8gVGhpcyBleHRyYSB2YXJpYWJsZSBpcyBuZWNlc3NhcnkgaW4gY2FzZSB0aGVyZSdzIGEgbGF0ZXIgaW1wb3J0IG9mIHRoZVxuICAgICAgICAvLyBzYW1lIG1vZHVsZSBuYW1lLlxuICAgICAgICBjb25zdCBpbm5lckNhbGwgPSB0aGlzLmlzRXhwb3J0UmVxdWlyZShjYWxsKTtcbiAgICAgICAgaWYgKCFpbm5lckNhbGwpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaXNFeHBvcnQgPSB0cnVlO1xuICAgICAgICBjYWxsID0gaW5uZXJDYWxsOyAgLy8gVXBkYXRlIGNhbGwgdG8gcG9pbnQgYXQgdGhlIHJlcXVpcmUoKSBleHByZXNzaW9uLlxuICAgICAgICByZXF1aXJlID0gdGhpcy5leHRyYWN0UmVxdWlyZShjYWxsKTtcbiAgICAgIH1cbiAgICAgIGlmICghcmVxdWlyZSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICB0aGlzLndyaXRlTGVhZGluZ1RyaXZpYShub2RlKTtcbiAgICAgIGNvbnN0IHZhck5hbWUgPSB0aGlzLmVtaXRHb29nUmVxdWlyZShudWxsLCByZXF1aXJlKTtcblxuICAgICAgaWYgKGlzRXhwb3J0KSB7XG4gICAgICAgIC8vIG5vZGUgaXMgYSBzdGF0ZW1lbnQgY29udGFpbmluZyBhIHJlcXVpcmUoKSBpbiBpdCwgd2hpbGVcbiAgICAgICAgLy8gcmVxdWlyZUNhbGwgaXMgdGhhdCBjYWxsLiAgV2UgcmVwbGFjZSB0aGUgcmVxdWlyZSgpIGNhbGxcbiAgICAgICAgLy8gd2l0aCB0aGUgdmFyaWFibGUgd2UgZW1pdHRlZC5cbiAgICAgICAgY29uc3QgZnVsbFN0YXRlbWVudCA9IG5vZGUuZ2V0VGV4dCgpO1xuICAgICAgICBjb25zdCByZXF1aXJlQ2FsbCA9IGNhbGwuZ2V0VGV4dCgpO1xuICAgICAgICB0aGlzLmVtaXQoZnVsbFN0YXRlbWVudC5yZXBsYWNlKHJlcXVpcmVDYWxsLCB2YXJOYW1lKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSXQncyBzb21lIG90aGVyIHR5cGUgb2Ygc3RhdGVtZW50LlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFbWl0cyBhIGdvb2cucmVxdWlyZSgpIHN0YXRlbWVudCBmb3IgYSBnaXZlbiB2YXJpYWJsZSBuYW1lIGFuZCBUeXBlU2NyaXB0IGltcG9ydC5cbiAgICpcbiAgICogRS5nLiBmcm9tOlxuICAgKiAgIHZhciB2YXJOYW1lID0gcmVxdWlyZSgndHNJbXBvcnQnKTtcbiAgICogcHJvZHVjZXM6XG4gICAqICAgdmFyIHZhck5hbWUgPSBnb29nLnJlcXVpcmUoJ2dvb2cubW9kdWxlLm5hbWUnKTtcbiAgICpcbiAgICogSWYgdGhlIGlucHV0IHZhck5hbWUgaXMgbnVsbCwgZ2VuZXJhdGVzIGEgbmV3IHZhcmlhYmxlIG5hbWUgaWYgbmVjZXNzYXJ5LlxuICAgKlxuICAgKiBAcmV0dXJuIFRoZSB2YXJpYWJsZSBuYW1lIGZvciB0aGUgaW1wb3J0ZWQgbW9kdWxlLCByZXVzaW5nIGEgcHJldmlvdXMgaW1wb3J0IGlmIG9uZVxuICAgKiAgICBpcyBhdmFpbGFibGUuXG4gICAqL1xuICBlbWl0R29vZ1JlcXVpcmUodmFyTmFtZTogc3RyaW5nfG51bGwsIHRzSW1wb3J0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGxldCBtb2ROYW1lOiBzdHJpbmc7XG4gICAgbGV0IGlzTmFtZXNwYWNlSW1wb3J0ID0gZmFsc2U7XG4gICAgY29uc3QgbnNJbXBvcnQgPSBleHRyYWN0R29vZ05hbWVzcGFjZUltcG9ydCh0c0ltcG9ydCk7XG4gICAgaWYgKG5zSW1wb3J0ICE9PSBudWxsKSB7XG4gICAgICAvLyBUaGlzIGlzIGEgbmFtZXNwYWNlIGltcG9ydCwgb2YgdGhlIGZvcm0gXCJnb29nOmZvby5iYXJcIi5cbiAgICAgIC8vIEZpeCBpdCB0byBqdXN0IFwiZm9vLmJhclwiLlxuICAgICAgbW9kTmFtZSA9IG5zSW1wb3J0O1xuICAgICAgaXNOYW1lc3BhY2VJbXBvcnQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5ob3N0LmNvbnZlcnRJbmRleEltcG9ydFNob3J0aGFuZCkge1xuICAgICAgICB0c0ltcG9ydCA9IHJlc29sdmVJbmRleFNob3J0aGFuZCh0aGlzLmhvc3QsIHRoaXMuZmlsZS5maWxlTmFtZSwgdHNJbXBvcnQpO1xuICAgICAgfVxuICAgICAgbW9kTmFtZSA9IHRoaXMuaG9zdC5wYXRoVG9Nb2R1bGVOYW1lKHRoaXMuZmlsZS5maWxlTmFtZSwgdHNJbXBvcnQpO1xuICAgIH1cblxuICAgIGlmICghdmFyTmFtZSkge1xuICAgICAgY29uc3QgbXYgPSB0aGlzLm1vZHVsZVZhcmlhYmxlcy5nZXQobW9kTmFtZSk7XG4gICAgICBpZiAobXYpIHtcbiAgICAgICAgLy8gQ2FsbGVyIGRpZG4ndCByZXF1ZXN0IGEgc3BlY2lmaWMgdmFyaWFibGUgbmFtZSBhbmQgd2UndmUgYWxyZWFkeVxuICAgICAgICAvLyBpbXBvcnRlZCB0aGUgbW9kdWxlLCBzbyBqdXN0IHJldHVybiB0aGUgbmFtZSB3ZSBhbHJlYWR5IGhhdmUgZm9yIHRoaXMgbW9kdWxlLlxuICAgICAgICByZXR1cm4gbXY7XG4gICAgICB9XG5cbiAgICAgIC8vIE5vdGU6IHdlIGFsd2F5cyBpbnRyb2R1Y2UgYSB2YXJpYWJsZSBmb3IgYW55IGltcG9ydCwgcmVnYXJkbGVzcyBvZiB3aGV0aGVyXG4gICAgICAvLyB0aGUgY2FsbGVyIHJlcXVlc3RlZCBvbmUuICBUaGlzIGF2b2lkcyBhIENsb3N1cmUgZXJyb3IuXG4gICAgICB2YXJOYW1lID0gdGhpcy5nZW5lcmF0ZUZyZXNoVmFyaWFibGVOYW1lKCk7XG4gICAgfVxuXG4gICAgaWYgKGlzTmFtZXNwYWNlSW1wb3J0KSB0aGlzLm5hbWVzcGFjZUltcG9ydHMuYWRkKHZhck5hbWUpO1xuICAgIGlmICh0aGlzLm1vZHVsZVZhcmlhYmxlcy5oYXMobW9kTmFtZSkpIHtcbiAgICAgIHRoaXMuZW1pdChgdmFyICR7dmFyTmFtZX0gPSAke3RoaXMubW9kdWxlVmFyaWFibGVzLmdldChtb2ROYW1lKX07YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZW1pdChgdmFyICR7dmFyTmFtZX0gPSBnb29nLnJlcXVpcmUoJyR7bW9kTmFtZX0nKTtgKTtcbiAgICAgIHRoaXMubW9kdWxlVmFyaWFibGVzLnNldChtb2ROYW1lLCB2YXJOYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhck5hbWU7XG4gIH1cbiAgLy8gd29ya2Fyb3VuZCBmb3Igc3ludGF4IGhpZ2hsaWdodGluZyBidWcgaW4gU3VibGltZTogYFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzdHJpbmcgYXJndW1lbnQgaWYgY2FsbCBpcyBvZiB0aGUgZm9ybVxuICAgKiAgIHJlcXVpcmUoJ2ZvbycpXG4gICAqL1xuICBleHRyYWN0UmVxdWlyZShjYWxsOiB0cy5DYWxsRXhwcmVzc2lvbik6IHN0cmluZ3xudWxsIHtcbiAgICAvLyBWZXJpZnkgdGhhdCB0aGUgY2FsbCBpcyBhIGNhbGwgdG8gcmVxdWlyZSguLi4pLlxuICAgIGlmIChjYWxsLmV4cHJlc3Npb24ua2luZCAhPT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBpZGVudCA9IGNhbGwuZXhwcmVzc2lvbiBhcyB0cy5JZGVudGlmaWVyO1xuICAgIGlmIChnZXRJZGVudGlmaWVyVGV4dChpZGVudCkgIT09ICdyZXF1aXJlJykgcmV0dXJuIG51bGw7XG5cbiAgICAvLyBWZXJpZnkgdGhlIGNhbGwgdGFrZXMgYSBzaW5nbGUgc3RyaW5nIGFyZ3VtZW50IGFuZCBncmFiIGl0LlxuICAgIGlmIChjYWxsLmFyZ3VtZW50cy5sZW5ndGggIT09IDEpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IGFyZyA9IGNhbGwuYXJndW1lbnRzWzBdO1xuICAgIGlmIChhcmcua2luZCAhPT0gdHMuU3ludGF4S2luZC5TdHJpbmdMaXRlcmFsKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gKGFyZyBhcyB0cy5TdHJpbmdMaXRlcmFsKS50ZXh0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHJlcXVpcmUoKSBjYWxsIG5vZGUgaWYgdGhlIG91dGVyIGNhbGwgaXMgb2YgdGhlIGZvcm1zOlxuICAgKiAtIF9fZXhwb3J0KHJlcXVpcmUoJ2ZvbycpKVxuICAgKiAtIHRzbGliXzEuX19leHBvcnRTdGFyKHJlcXVpcmUoJ2ZvbycpLCBiYXIpXG4gICAqL1xuICBpc0V4cG9ydFJlcXVpcmUoY2FsbDogdHMuQ2FsbEV4cHJlc3Npb24pOiB0cy5DYWxsRXhwcmVzc2lvbnxudWxsIHtcbiAgICBzd2l0Y2ggKGNhbGwuZXhwcmVzc2lvbi5raW5kKSB7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcjpcbiAgICAgICAgY29uc3QgaWRlbnQgPSBjYWxsLmV4cHJlc3Npb24gYXMgdHMuSWRlbnRpZmllcjtcbiAgICAgICAgLy8gVFNfMjRfQ09NUEFUOiBhY2NlcHQgdGhyZWUgbGVhZGluZyB1bmRlcnNjb3Jlc1xuICAgICAgICBpZiAoaWRlbnQudGV4dCAhPT0gJ19fZXhwb3J0JyAmJiBpZGVudC50ZXh0ICE9PSAnX19fZXhwb3J0Jykge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbjpcbiAgICAgICAgY29uc3QgcHJvcEFjY2VzcyA9IGNhbGwuZXhwcmVzc2lvbiBhcyB0cy5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb247XG4gICAgICAgIC8vIFRTXzI0X0NPTVBBVDogYWNjZXB0IHRocmVlIGxlYWRpbmcgdW5kZXJzY29yZXNcbiAgICAgICAgaWYgKHByb3BBY2Nlc3MubmFtZS50ZXh0ICE9PSAnX19leHBvcnRTdGFyJyAmJiBwcm9wQWNjZXNzLm5hbWUudGV4dCAhPT0gJ19fX2V4cG9ydFN0YXInKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBWZXJpZnkgdGhlIGNhbGwgdGFrZXMgYXQgbGVhc3Qgb25lIGFyZ3VtZW50IGFuZCBjaGVjayBpdC5cbiAgICBpZiAoY2FsbC5hcmd1bWVudHMubGVuZ3RoIDwgMSkgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgYXJnID0gY2FsbC5hcmd1bWVudHNbMF07XG4gICAgaWYgKGFyZy5raW5kICE9PSB0cy5TeW50YXhLaW5kLkNhbGxFeHByZXNzaW9uKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBpbm5lckNhbGwgPSBhcmcgYXMgdHMuQ2FsbEV4cHJlc3Npb247XG4gICAgaWYgKCF0aGlzLmV4dHJhY3RSZXF1aXJlKGlubmVyQ2FsbCkpIHJldHVybiBudWxsO1xuICAgIHJldHVybiBpbm5lckNhbGw7XG4gIH1cblxuICBpc0VzTW9kdWxlUHJvcGVydHkoZXhwcjogdHMuRXhwcmVzc2lvblN0YXRlbWVudCk6IGJvb2xlYW4ge1xuICAgIC8vIFdlJ3JlIG1hdGNoaW5nIHRoZSBleHBsaWNpdCBzb3VyY2UgdGV4dCBnZW5lcmF0ZWQgYnkgdGhlIFRTIGNvbXBpbGVyLlxuICAgIHJldHVybiBleHByLmdldFRleHQoKSA9PT0gJ09iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTsnO1xuICB9XG5cbiAgaXNNb2R1bGVFeHBvcnRzQXNzaWdubWVudChleHByOiB0cy5FeHByZXNzaW9uU3RhdGVtZW50KTogYm9vbGVhbiB7XG4gICAgLy8gTG9va2luZyBmb3IgXCJtb2R1bGUuZXhwb3J0cyA9IC4uLjtcIlxuICAgIGlmICghdHMuaXNCaW5hcnlFeHByZXNzaW9uKGV4cHIuZXhwcmVzc2lvbikpIHJldHVybiBmYWxzZTtcbiAgICBpZiAoZXhwci5leHByZXNzaW9uLm9wZXJhdG9yVG9rZW4ua2luZCAhPT0gdHMuU3ludGF4S2luZC5FcXVhbHNUb2tlbikgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBleHByLmV4cHJlc3Npb24ubGVmdC5nZXRUZXh0KCkgPT09ICdtb2R1bGUuZXhwb3J0cyc7XG4gIH1cblxuICBlbWl0RXhwb3J0c0Fzc2lnbm1lbnQoZXhwcjogdHMuRXhwcmVzc2lvblN0YXRlbWVudCkge1xuICAgIHRoaXMuZW1pdENvbW1lbnRXaXRob3V0U3RhdGVtZW50Qm9keShleHByKTtcbiAgICB0aGlzLmVtaXQoJ2V4cG9ydHMgPScpO1xuICAgIHRoaXMudmlzaXQoKGV4cHIuZXhwcmVzc2lvbiBhcyB0cy5CaW5hcnlFeHByZXNzaW9uKS5yaWdodCk7XG4gICAgdGhpcy5lbWl0KCc7Jyk7XG4gIH1cblxuICAvKipcbiAgICogbWF5YmVQcm9jZXNzIGlzIGNhbGxlZCBkdXJpbmcgdGhlIHJlY3Vyc2l2ZSB0cmF2ZXJzYWwgb2YgdGhlIHByb2dyYW0ncyBBU1QuXG4gICAqXG4gICAqIEByZXR1cm4gVHJ1ZSBpZiB0aGUgbm9kZSB3YXMgcHJvY2Vzc2VkL2VtaXR0ZWQsIGZhbHNlIGlmIGl0IHNob3VsZCBiZSBlbWl0dGVkIGFzIGlzLlxuICAgKi9cbiAgcHJvdGVjdGVkIG1heWJlUHJvY2Vzcyhub2RlOiB0cy5Ob2RlKTogYm9vbGVhbiB7XG4gICAgc3dpdGNoIChub2RlLmtpbmQpIHtcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb246XG4gICAgICAgIGNvbnN0IHByb3BBY2Nlc3MgPSBub2RlIGFzIHRzLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbjtcbiAgICAgICAgLy8gV2UncmUgbG9va2luZyBmb3IgYW4gZXhwcmVzc2lvbiBvZiB0aGUgZm9ybTpcbiAgICAgICAgLy8gICBtb2R1bGVfbmFtZV92YXIuZGVmYXVsdFxuICAgICAgICBpZiAoZ2V0SWRlbnRpZmllclRleHQocHJvcEFjY2Vzcy5uYW1lKSAhPT0gJ2RlZmF1bHQnKSBicmVhaztcbiAgICAgICAgaWYgKHByb3BBY2Nlc3MuZXhwcmVzc2lvbi5raW5kICE9PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIpIGJyZWFrO1xuICAgICAgICBjb25zdCBsaHMgPSBnZXRJZGVudGlmaWVyVGV4dChwcm9wQWNjZXNzLmV4cHJlc3Npb24gYXMgdHMuSWRlbnRpZmllcik7XG4gICAgICAgIGlmICghdGhpcy5uYW1lc3BhY2VJbXBvcnRzLmhhcyhsaHMpKSBicmVhaztcbiAgICAgICAgLy8gRW1pdCB0aGUgc2FtZSBleHByZXNzaW9uLCB3aXRoIHNwYWNlcyB0byByZXBsYWNlIHRoZSBcIi5kZWZhdWx0XCIgcGFydFxuICAgICAgICAvLyBzbyB0aGF0IHNvdXJjZSBtYXBzIHN0aWxsIGxpbmUgdXAuXG4gICAgICAgIHRoaXMud3JpdGVMZWFkaW5nVHJpdmlhKG5vZGUpO1xuICAgICAgICB0aGlzLmVtaXQoYCR7bGhzfSAgICAgICAgYCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKiBHZW5lcmF0ZXMgYSBuZXcgdmFyaWFibGUgbmFtZSBpbnNpZGUgdGhlIHRzaWNrbGVfIG5hbWVzcGFjZS4gKi9cbiAgZ2VuZXJhdGVGcmVzaFZhcmlhYmxlTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgdHNpY2tsZV9tb2R1bGVfJHt0aGlzLnVudXNlZEluZGV4Kyt9X2A7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBUeXBlU2NyaXB0J3MgSlMrQ29tbW9uSlMgb3V0cHV0IHRvIENsb3N1cmUgZ29vZy5tb2R1bGUgZXRjLlxuICogRm9yIHVzZSBhcyBhIHBvc3Rwcm9jZXNzaW5nIHN0ZXAgKmFmdGVyKiBUeXBlU2NyaXB0IGVtaXRzIEphdmFTY3JpcHQuXG4gKlxuICogQHBhcmFtIGZpbGVOYW1lIFRoZSBzb3VyY2UgZmlsZSBuYW1lLlxuICogQHBhcmFtIG1vZHVsZUlkIFRoZSBcIm1vZHVsZSBpZFwiLCBhIG1vZHVsZS1pZGVudGlmeWluZyBzdHJpbmcgdGhhdCBpc1xuICogICAgIHRoZSB2YWx1ZSBtb2R1bGUuaWQgaW4gdGhlIHNjb3BlIG9mIHRoZSBtb2R1bGUuXG4gKiBAcGFyYW0gcGF0aFRvTW9kdWxlTmFtZSBBIGZ1bmN0aW9uIHRoYXQgbWFwcyBhIGZpbGVzeXN0ZW0gLnRzIHBhdGggdG8gYVxuICogICAgIENsb3N1cmUgbW9kdWxlIG5hbWUsIGFzIGZvdW5kIGluIGEgZ29vZy5yZXF1aXJlKCcuLi4nKSBzdGF0ZW1lbnQuXG4gKiAgICAgVGhlIGNvbnRleHQgcGFyYW1ldGVyIGlzIHRoZSByZWZlcmVuY2luZyBmaWxlLCB1c2VkIGZvciByZXNvbHZpbmdcbiAqICAgICBpbXBvcnRzIHdpdGggcmVsYXRpdmUgcGF0aHMgbGlrZSBcImltcG9ydCAqIGFzIGZvbyBmcm9tICcuLi9mb28nO1wiLlxuICogQHBhcmFtIHByZWx1ZGUgQW4gYWRkaXRpb25hbCBwcmVsdWRlIHRvIGluc2VydCBhZnRlciB0aGUgYGdvb2cubW9kdWxlYCBjYWxsLFxuICogICAgIGUuZy4gd2l0aCBhZGRpdGlvbmFsIGltcG9ydHMgb3IgcmVxdWlyZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm9jZXNzRVM1KGhvc3Q6IEVzNVByb2Nlc3Nvckhvc3QsIGZpbGVOYW1lOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZyk6XG4gICAge291dHB1dDogc3RyaW5nLCByZWZlcmVuY2VkTW9kdWxlczogc3RyaW5nW119IHtcbiAgY29uc3QgZmlsZSA9IHRzLmNyZWF0ZVNvdXJjZUZpbGUoZmlsZU5hbWUsIGNvbnRlbnQsIHRzLlNjcmlwdFRhcmdldC5FUzUsIHRydWUpO1xuICByZXR1cm4gbmV3IEVTNVByb2Nlc3Nvcihob3N0LCBmaWxlKS5wcm9jZXNzKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0Q29tbW9uSnNUb0dvb2dNb2R1bGVJZk5lZWRlZChcbiAgICBob3N0OiBFczVQcm9jZXNzb3JIb3N0LCBtb2R1bGVzTWFuaWZlc3Q6IE1vZHVsZXNNYW5pZmVzdCwgZmlsZU5hbWU6IHN0cmluZyxcbiAgICBjb250ZW50OiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoIWhvc3QuZ29vZ21vZHVsZSB8fCBpc0R0c0ZpbGVOYW1lKGZpbGVOYW1lKSkge1xuICAgIHJldHVybiBjb250ZW50O1xuICB9XG4gIGNvbnN0IHtvdXRwdXQsIHJlZmVyZW5jZWRNb2R1bGVzfSA9IHByb2Nlc3NFUzUoaG9zdCwgZmlsZU5hbWUsIGNvbnRlbnQpO1xuXG4gIGNvbnN0IG1vZHVsZU5hbWUgPSBob3N0LnBhdGhUb01vZHVsZU5hbWUoJycsIGZpbGVOYW1lKTtcbiAgbW9kdWxlc01hbmlmZXN0LmFkZE1vZHVsZShmaWxlTmFtZSwgbW9kdWxlTmFtZSk7XG4gIGZvciAoY29uc3QgcmVmZXJlbmNlZCBvZiByZWZlcmVuY2VkTW9kdWxlcykge1xuICAgIG1vZHVsZXNNYW5pZmVzdC5hZGRSZWZlcmVuY2VkTW9kdWxlKGZpbGVOYW1lLCByZWZlcmVuY2VkKTtcbiAgfVxuXG4gIHJldHVybiBvdXRwdXQ7XG59XG4iXX0=