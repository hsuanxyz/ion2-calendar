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
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/type_check_block", ["require", "exports", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/translator", "@angular/compiler-cli/src/ngtsc/typecheck/src/expression"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var translator_1 = require("@angular/compiler-cli/src/ngtsc/translator");
    var expression_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/expression");
    /**
     * Given a `ts.ClassDeclaration` for a component, and metadata regarding that component, compose a
     * "type check block" function.
     *
     * When passed through TypeScript's TypeChecker, type errors that arise within the type check block
     * function indicate issues in the template itself.
     *
     * @param node the TypeScript node for the component class.
     * @param meta metadata about the component's template and the function being generated.
     * @param importManager an `ImportManager` for the file into which the TCB will be written.
     */
    function generateTypeCheckBlock(node, meta, importManager) {
        var tcb = new Context(meta.boundTarget, node.getSourceFile(), importManager);
        var scope = new Scope(tcb);
        tcbProcessNodes(meta.boundTarget.target.template, tcb, scope);
        var body = ts.createBlock([ts.createIf(ts.createTrue(), scope.getBlock())]);
        return ts.createFunctionDeclaration(
        /* decorators */ undefined, 
        /* modifiers */ undefined, 
        /* asteriskToken */ undefined, 
        /* name */ meta.fnName, 
        /* typeParameters */ node.typeParameters, 
        /* parameters */ [tcbCtxParam(node)], 
        /* type */ undefined, 
        /* body */ body);
    }
    exports.generateTypeCheckBlock = generateTypeCheckBlock;
    /**
     * Overall generation context for the type check block.
     *
     * `Context` handles operations during code generation which are global with respect to the whole
     * block. It's responsible for variable name allocation and management of any imports needed. It
     * also contains the template metadata itself.
     */
    var Context = /** @class */ (function () {
        function Context(boundTarget, sourceFile, importManager) {
            this.boundTarget = boundTarget;
            this.sourceFile = sourceFile;
            this.importManager = importManager;
            this.nextId = 1;
        }
        /**
         * Allocate a new variable name for use within the `Context`.
         *
         * Currently this uses a monotonically increasing counter, but in the future the variable name
         * might change depending on the type of data being stored.
         */
        Context.prototype.allocateId = function () { return ts.createIdentifier("_t" + this.nextId++); };
        /**
         * Write a `ts.Expression` that references the given node.
         *
         * This may involve importing the node into the file if it's not declared there already.
         */
        Context.prototype.reference = function (ref) {
            var ngExpr = ref.toExpression(this.sourceFile);
            if (ngExpr === null) {
                throw new Error("Unreachable reference: " + ref.node);
            }
            // Use `translateExpression` to convert the `Expression` into a `ts.Expression`.
            return translator_1.translateExpression(ngExpr, this.importManager);
        };
        return Context;
    }());
    /**
     * Local scope within the type check block for a particular template.
     *
     * The top-level template and each nested `<ng-template>` have their own `Scope`, which exist in a
     * hierarchy. The structure of this hierarchy mirrors the syntactic scopes in the generated type
     * check block, where each nested template is encased in an `if` structure.
     *
     * As a template is processed in a given `Scope`, statements are added via `addStatement()`. When
     * this processing is complete, the `Scope` can be turned into a `ts.Block` via `getBlock()`.
     */
    var Scope = /** @class */ (function () {
        function Scope(tcb, parent) {
            if (parent === void 0) { parent = null; }
            this.tcb = tcb;
            this.parent = parent;
            /**
             * Map of nodes to information about that node within the TCB.
             *
             * For example, this stores the `ts.Identifier` within the TCB for an element or <ng-template>.
             */
            this.elementData = new Map();
            /**
             * Map of immediately nested <ng-template>s (within this `Scope`) to the `ts.Identifier` of their
             * rendering contexts.
             */
            this.templateCtx = new Map();
            /**
             * Map of variables declared on the template that created this `Scope` to their `ts.Identifier`s
             * within the TCB.
             */
            this.varMap = new Map();
            /**
             * Statements for this template.
             */
            this.statements = [];
        }
        /**
         * Get the identifier within the TCB for a given `TmplAstElement`.
         */
        Scope.prototype.getElementId = function (el) {
            var data = this.getElementData(el, false);
            if (data !== null && data.htmlNode !== null) {
                return data.htmlNode;
            }
            return this.parent !== null ? this.parent.getElementId(el) : null;
        };
        /**
         * Get the identifier of a directive instance on a given template node.
         */
        Scope.prototype.getDirectiveId = function (el, dir) {
            var data = this.getElementData(el, false);
            if (data !== null && data.directives !== null && data.directives.has(dir)) {
                return data.directives.get(dir);
            }
            return this.parent !== null ? this.parent.getDirectiveId(el, dir) : null;
        };
        /**
         * Get the identifier of a template's rendering context.
         */
        Scope.prototype.getTemplateCtx = function (tmpl) {
            return this.templateCtx.get(tmpl) ||
                (this.parent !== null ? this.parent.getTemplateCtx(tmpl) : null);
        };
        /**
         * Get the identifier of a template variable.
         */
        Scope.prototype.getVariableId = function (v) {
            return this.varMap.get(v) || (this.parent !== null ? this.parent.getVariableId(v) : null);
        };
        /**
         * Allocate an identifier for the given template element.
         */
        Scope.prototype.allocateElementId = function (el) {
            var data = this.getElementData(el, true);
            if (data.htmlNode === null) {
                data.htmlNode = this.tcb.allocateId();
            }
            return data.htmlNode;
        };
        /**
         * Allocate an identifier for the given template variable.
         */
        Scope.prototype.allocateVariableId = function (v) {
            if (!this.varMap.has(v)) {
                this.varMap.set(v, this.tcb.allocateId());
            }
            return this.varMap.get(v);
        };
        /**
         * Allocate an identifier for an instance of the given directive on the given template node.
         */
        Scope.prototype.allocateDirectiveId = function (el, dir) {
            // Look up the data for this template node.
            var data = this.getElementData(el, true);
            // Lazily populate the directives map, if it exists.
            if (data.directives === null) {
                data.directives = new Map();
            }
            if (!data.directives.has(dir)) {
                data.directives.set(dir, this.tcb.allocateId());
            }
            return data.directives.get(dir);
        };
        /**
         * Allocate an identifier for the rendering context of a given template.
         */
        Scope.prototype.allocateTemplateCtx = function (tmpl) {
            if (!this.templateCtx.has(tmpl)) {
                this.templateCtx.set(tmpl, this.tcb.allocateId());
            }
            return this.templateCtx.get(tmpl);
        };
        /**
         * Add a statement to this scope.
         */
        Scope.prototype.addStatement = function (stmt) { this.statements.push(stmt); };
        /**
         * Get a `ts.Block` containing the statements in this scope.
         */
        Scope.prototype.getBlock = function () { return ts.createBlock(this.statements); };
        Scope.prototype.getElementData = function (el, alloc) {
            if (alloc && !this.elementData.has(el)) {
                this.elementData.set(el, { htmlNode: null, directives: null });
            }
            return this.elementData.get(el) || null;
        };
        return Scope;
    }());
    /**
     * Create the `ctx` parameter to the top-level TCB function.
     *
     * This is a parameter with a type equivalent to the component type, with all generic type
     * parameters listed (without their generic bounds).
     */
    function tcbCtxParam(node) {
        var typeArguments = undefined;
        // Check if the component is generic, and pass generic type parameters if so.
        if (node.typeParameters !== undefined) {
            typeArguments =
                node.typeParameters.map(function (param) { return ts.createTypeReferenceNode(param.name, undefined); });
        }
        var type = ts.createTypeReferenceNode(node.name, typeArguments);
        return ts.createParameter(
        /* decorators */ undefined, 
        /* modifiers */ undefined, 
        /* dotDotDotToken */ undefined, 
        /* name */ 'ctx', 
        /* questionToken */ undefined, 
        /* type */ type, 
        /* initializer */ undefined);
    }
    /**
     * Process an array of template nodes and generate type checking code for them within the given
     * `Scope`.
     *
     * @param nodes template node array over which to iterate.
     * @param tcb context of the overall type check block.
     * @param scope
     */
    function tcbProcessNodes(nodes, tcb, scope) {
        nodes.forEach(function (node) {
            // Process elements, templates, and bindings.
            if (node instanceof compiler_1.TmplAstElement) {
                tcbProcessElement(node, tcb, scope);
            }
            else if (node instanceof compiler_1.TmplAstTemplate) {
                tcbProcessTemplateDeclaration(node, tcb, scope);
            }
            else if (node instanceof compiler_1.TmplAstBoundText) {
                var expr = tcbExpression(node.value, tcb, scope);
                scope.addStatement(ts.createStatement(expr));
            }
        });
    }
    /**
     * Process an element, generating type checking code for it, its directives, and its children.
     */
    function tcbProcessElement(el, tcb, scope) {
        var id = scope.getElementId(el);
        if (id !== null) {
            // This element has been processed before. No need to run through it again.
            return id;
        }
        id = scope.allocateElementId(el);
        // Add the declaration of the element using document.createElement.
        scope.addStatement(tsCreateVariable(id, tsCreateElement(el.name)));
        // Construct a set of all the input bindings. Anything matched by directives will be removed from
        // this set. The rest are bindings being made on the element itself.
        var inputs = new Set(el.inputs.filter(function (input) { return input.type === 0 /* Property */; }).map(function (input) { return input.name; }));
        // Process directives of the node.
        tcbProcessDirectives(el, inputs, tcb, scope);
        // At this point, `inputs` now contains only those bindings not matched by any directive. These
        // bindings go to the element itself.
        inputs.forEach(function (name) {
            var binding = el.inputs.find(function (input) { return input.name === name; });
            var expr = tcbExpression(binding.value, tcb, scope);
            var prop = ts.createPropertyAccess(id, name);
            var assign = ts.createBinary(prop, ts.SyntaxKind.EqualsToken, expr);
            scope.addStatement(ts.createStatement(assign));
        });
        // Recurse into children.
        tcbProcessNodes(el.children, tcb, scope);
        return id;
    }
    /**
     * Process all the directives associated with a given template node.
     */
    function tcbProcessDirectives(el, unclaimed, tcb, scope) {
        var directives = tcb.boundTarget.getDirectivesOfNode(el);
        if (directives === null) {
            // No directives, nothing to do.
            return;
        }
        directives.forEach(function (dir) { return tcbProcessDirective(el, dir, unclaimed, tcb, scope); });
    }
    /**
     * Process a directive, generating type checking code for it.
     */
    function tcbProcessDirective(el, dir, unclaimed, tcb, scope) {
        var id = scope.getDirectiveId(el, dir);
        if (id !== null) {
            // This directive has been processed before. No need to run through it again.
            return id;
        }
        id = scope.allocateDirectiveId(el, dir);
        var bindings = tcbGetInputBindingExpressions(el, dir, tcb, scope);
        // Call the type constructor of the directive to infer a type, and assign the directive instance.
        scope.addStatement(tsCreateVariable(id, tcbCallTypeCtor(el, dir, tcb, scope, bindings)));
        tcbProcessBindings(id, bindings, unclaimed, tcb, scope);
        return id;
    }
    function tcbProcessBindings(recv, bindings, unclaimed, tcb, scope) {
        // Iterate through all the bindings this directive is consuming.
        bindings.forEach(function (binding) {
            // Generate an assignment statement for this binding.
            var prop = ts.createPropertyAccess(recv, binding.field);
            var assign = ts.createBinary(prop, ts.SyntaxKind.EqualsToken, binding.expression);
            scope.addStatement(ts.createStatement(assign));
            // Remove the binding from the set of unclaimed inputs, as this directive has 'claimed' it.
            unclaimed.delete(binding.property);
        });
    }
    /**
     * Process a nested <ng-template>, generating type-checking code for it and its children.
     *
     * The nested <ng-template> is represented with an `if` structure, which creates a new syntactical
     * scope for the type checking code for the template. If the <ng-template> has any directives, they
     * can influence type inference within the `if` block through defined guard functions.
     */
    function tcbProcessTemplateDeclaration(tmpl, tcb, scope) {
        // Create a new Scope to represent bindings captured in the template.
        var tmplScope = new Scope(tcb, scope);
        // Allocate a template ctx variable and declare it with an 'any' type.
        var ctx = tmplScope.allocateTemplateCtx(tmpl);
        var type = ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
        scope.addStatement(tsDeclareVariable(ctx, type));
        // Process directives on the template.
        tcbProcessDirectives(tmpl, new Set(), tcb, scope);
        // Process the template itself (inside the inner Scope).
        tcbProcessNodes(tmpl.children, tcb, tmplScope);
        // An `if` will be constructed, within which the template's children will be type checked. The
        // `if` is used for two reasons: it creates a new syntactic scope, isolating variables declared in
        // the template's TCB from the outer context, and it allows any directives on the templates to
        // perform type narrowing of either expressions or the template's context.
        // The guard is the `if` block's condition. It's usually set to `true` but directives that exist
        // on the template can trigger extra guard expressions that serve to narrow types within the
        // `if`. `guard` is calculated by starting with `true` and adding other conditions as needed.
        // Collect these into `guards` by processing the directives.
        var directiveGuards = [];
        var directives = tcb.boundTarget.getDirectivesOfNode(tmpl);
        if (directives !== null) {
            directives.forEach(function (dir) {
                var dirInstId = scope.getDirectiveId(tmpl, dir);
                var dirId = tcb.reference(dir.ref);
                // There are two kinds of guards. Template guards (ngTemplateGuards) allow type narrowing of
                // the expression passed to an @Input of the directive. Scan the directive to see if it has
                // any template guards, and generate them if needed.
                dir.ngTemplateGuards.forEach(function (inputName) {
                    // For each template guard function on the directive, look for a binding to that input.
                    var boundInput = tmpl.inputs.find(function (i) { return i.name === inputName; });
                    if (boundInput !== undefined) {
                        // If there is such a binding, generate an expression for it.
                        var expr = tcbExpression(boundInput.value, tcb, scope);
                        // Call the guard function on the directive with the directive instance and that
                        // expression.
                        var guardInvoke = tsCallMethod(dirId, "ngTemplateGuard_" + inputName, [
                            dirInstId,
                            expr,
                        ]);
                        directiveGuards.push(guardInvoke);
                    }
                });
                // The second kind of guard is a template context guard. This guard narrows the template
                // rendering context variable `ctx`.
                if (dir.hasNgTemplateContextGuard) {
                    var guardInvoke = tsCallMethod(dirId, 'ngTemplateContextGuard', [dirInstId, ctx]);
                    directiveGuards.push(guardInvoke);
                }
            });
        }
        // By default the guard is simply `true`.
        var guard = ts.createTrue();
        // If there are any guards from directives, use them instead.
        if (directiveGuards.length > 0) {
            // Pop the first value and use it as the initializer to reduce(). This way, a single guard
            // will be used on its own, but two or more will be combined into binary expressions.
            guard = directiveGuards.reduce(function (expr, dirGuard) { return ts.createBinary(expr, ts.SyntaxKind.AmpersandAmpersandToken, dirGuard); }, directiveGuards.pop());
        }
        // Construct the `if` block for the template with the generated guard expression.
        var tmplIf = ts.createIf(
        /* expression */ guard, 
        /* thenStatement */ tmplScope.getBlock());
        scope.addStatement(tmplIf);
    }
    /**
     * Process an `AST` expression and convert it into a `ts.Expression`, generating references to the
     * correct identifiers in the current scope.
     */
    function tcbExpression(ast, tcb, scope) {
        // `astToTypescript` actually does the conversion. A special resolver `tcbResolve` is passed which
        // interprets specific expression nodes that interact with the `ImplicitReceiver`. These nodes
        // actually refer to identifiers within the current scope.
        return expression_1.astToTypescript(ast, function (ast) { return tcbResolve(ast, tcb, scope); });
    }
    /**
     * Call the type constructor of a directive instance on a given template node, inferring a type for
     * the directive instance from any bound inputs.
     */
    function tcbCallTypeCtor(el, dir, tcb, scope, bindings) {
        var dirClass = tcb.reference(dir.ref);
        // Construct an array of `ts.PropertyAssignment`s for each input of the directive that has a
        // matching binding.
        var members = bindings.map(function (b) { return ts.createPropertyAssignment(b.field, b.expression); });
        // Call the `ngTypeCtor` method on the directive class, with an object literal argument created
        // from the matched inputs.
        return tsCallMethod(
        /* receiver */ dirClass, 
        /* methodName */ 'ngTypeCtor', 
        /* args */ [ts.createObjectLiteral(members)]);
    }
    function tcbGetInputBindingExpressions(el, dir, tcb, scope) {
        var bindings = [];
        // `dir.inputs` is an object map of field names on the directive class to property names.
        // This is backwards from what's needed to match bindings - a map of properties to field names
        // is desired. Invert `dir.inputs` into `propMatch` to create this map.
        var propMatch = new Map();
        var inputs = dir.inputs;
        Object.keys(inputs).forEach(function (key) {
            Array.isArray(inputs[key]) ? propMatch.set(inputs[key][0], key) :
                propMatch.set(inputs[key], key);
        });
        // Add a binding expression to the map for each input of the directive that has a
        // matching binding.
        el.inputs.filter(function (input) { return propMatch.has(input.name); }).forEach(function (input) {
            // Produce an expression representing the value of the binding.
            var expr = tcbExpression(input.value, tcb, scope);
            // Call the callback.
            bindings.push({
                property: input.name,
                field: propMatch.get(input.name),
                expression: expr,
            });
        });
        return bindings;
    }
    /**
     * Create an expression which instantiates an element by its HTML tagName.
     *
     * Thanks to narrowing of `document.createElement()`, this expression will have its type inferred
     * based on the tag name, including for custom elements that have appropriate .d.ts definitions.
     */
    function tsCreateElement(tagName) {
        var createElement = ts.createPropertyAccess(
        /* expression */ ts.createIdentifier('document'), 'createElement');
        return ts.createCall(
        /* expression */ createElement, 
        /* typeArguments */ undefined, 
        /* argumentsArray */ [ts.createLiteral(tagName)]);
    }
    /**
     * Create a `ts.VariableStatement` which declares a variable without explicit initialization.
     *
     * The initializer `null!` is used to bypass strict variable initialization checks.
     *
     * Unlike with `tsCreateVariable`, the type of the variable is explicitly specified.
     */
    function tsDeclareVariable(id, type) {
        var decl = ts.createVariableDeclaration(
        /* name */ id, 
        /* type */ type, 
        /* initializer */ ts.createNonNullExpression(ts.createNull()));
        return ts.createVariableStatement(
        /* modifiers */ undefined, 
        /* declarationList */ [decl]);
    }
    /**
     * Create a `ts.VariableStatement` that initializes a variable with a given expression.
     *
     * Unlike with `tsDeclareVariable`, the type of the variable is inferred from the initializer
     * expression.
     */
    function tsCreateVariable(id, initializer) {
        var decl = ts.createVariableDeclaration(
        /* name */ id, 
        /* type */ undefined, 
        /* initializer */ initializer);
        return ts.createVariableStatement(
        /* modifiers */ undefined, 
        /* declarationList */ [decl]);
    }
    /**
     * Construct a `ts.CallExpression` that calls a method on a receiver.
     */
    function tsCallMethod(receiver, methodName, args) {
        if (args === void 0) { args = []; }
        var methodAccess = ts.createPropertyAccess(receiver, methodName);
        return ts.createCall(
        /* expression */ methodAccess, 
        /* typeArguments */ undefined, 
        /* argumentsArray */ args);
    }
    /**
     * Resolve an `AST` expression within the given scope.
     *
     * Some `AST` expressions refer to top-level concepts (references, variables, the component
     * context). This method assists in resolving those.
     */
    function tcbResolve(ast, tcb, scope) {
        // Short circuit for AST types that won't have mappings.
        if (!(ast instanceof compiler_1.ImplicitReceiver || ast instanceof compiler_1.PropertyRead)) {
            return null;
        }
        if (ast instanceof compiler_1.PropertyRead && ast.receiver instanceof compiler_1.ImplicitReceiver) {
            // Check whether the template metadata has bound a target for this expression. If so, then
            // resolve that target. If not, then the expression is referencing the top-level component
            // context.
            var binding = tcb.boundTarget.getExpressionTarget(ast);
            if (binding !== null) {
                // This expression has a binding to some variable or reference in the template. Resolve it.
                if (binding instanceof compiler_1.TmplAstVariable) {
                    return tcbResolveVariable(binding, tcb, scope);
                }
                else {
                    throw new Error("Not handled: " + binding);
                }
            }
            else {
                // This is a PropertyRead(ImplicitReceiver) and probably refers to a property access on the
                // component context. Let it fall through resolution here so it will be caught when the
                // ImplicitReceiver is resolved in the branch below.
                return null;
            }
        }
        else if (ast instanceof compiler_1.ImplicitReceiver) {
            // AST instances representing variables and references look very similar to property reads from
            // the component context: both have the shape PropertyRead(ImplicitReceiver, 'propertyName').
            // `tcbExpression` will first try to `tcbResolve` the outer PropertyRead. If this works, it's
            // because the `BoundTarget` found an expression target for the whole expression, and therefore
            // `tcbExpression` will never attempt to `tcbResolve` the ImplicitReceiver of that PropertyRead.
            //
            // Therefore if `tcbResolve` is called on an `ImplicitReceiver`, it's because no outer
            // PropertyRead resolved to a variable or reference, and therefore this is a property read on
            // the component context itself.
            return ts.createIdentifier('ctx');
        }
        else {
            // This AST isn't special after all.
            return null;
        }
    }
    /**
     * Resolve a variable to an identifier that represents its value.
     */
    function tcbResolveVariable(binding, tcb, scope) {
        // Look to see whether the variable was already initialized. If so, just reuse it.
        var id = scope.getVariableId(binding);
        if (id !== null) {
            return id;
        }
        // Look for the template which declares this variable.
        var tmpl = tcb.boundTarget.getTemplateOfSymbol(binding);
        if (tmpl === null) {
            throw new Error("Expected TmplAstVariable to be mapped to a TmplAstTemplate");
        }
        // Look for a context variable for the template. This should've been declared before anything
        // that could reference the template's variables.
        var ctx = scope.getTemplateCtx(tmpl);
        if (ctx === null) {
            throw new Error('Expected template context to exist.');
        }
        // Allocate an identifier for the TmplAstVariable, and initialize it to a read of the variable on
        // the template context.
        id = scope.allocateVariableId(binding);
        var initializer = ts.createPropertyAccess(
        /* expression */ ctx, 
        /* name */ binding.value);
        // Declare the variable, and return its identifier.
        scope.addStatement(tsCreateVariable(id, initializer));
        return id;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZV9jaGVja19ibG9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdHlwZWNoZWNrL3NyYy90eXBlX2NoZWNrX2Jsb2NrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBRUgsOENBQWlMO0lBQ2pMLCtCQUFpQztJQUdqQyx5RUFBb0U7SUFHcEUsdUZBQTZDO0lBRzdDOzs7Ozs7Ozs7O09BVUc7SUFDSCxTQUFnQixzQkFBc0IsQ0FDbEMsSUFBeUIsRUFBRSxJQUE0QixFQUN2RCxhQUE0QjtRQUM5QixJQUFNLEdBQUcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUMvRSxJQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3QixlQUFlLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBVSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUVoRSxJQUFNLElBQUksR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTlFLE9BQU8sRUFBRSxDQUFDLHlCQUF5QjtRQUMvQixnQkFBZ0IsQ0FBQyxTQUFTO1FBQzFCLGVBQWUsQ0FBQyxTQUFTO1FBQ3pCLG1CQUFtQixDQUFDLFNBQVM7UUFDN0IsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNO1FBQ3RCLG9CQUFvQixDQUFDLElBQUksQ0FBQyxjQUFjO1FBQ3hDLGdCQUFnQixDQUFBLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxD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ZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FTVCwgQmluZGluZ1R5cGUsIEJvdW5kVGFyZ2V0LCBJbXBsaWNpdFJlY2VpdmVyLCBQcm9wZXJ0eVJlYWQsIFRtcGxBc3RCb3VuZFRleHQsIFRtcGxBc3RFbGVtZW50LCBUbXBsQXN0Tm9kZSwgVG1wbEFzdFRlbXBsYXRlLCBUbXBsQXN0VmFyaWFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge1JlZmVyZW5jZX0gZnJvbSAnLi4vLi4vbWV0YWRhdGEnO1xuaW1wb3J0IHtJbXBvcnRNYW5hZ2VyLCB0cmFuc2xhdGVFeHByZXNzaW9ufSBmcm9tICcuLi8uLi90cmFuc2xhdG9yJztcblxuaW1wb3J0IHtUeXBlQ2hlY2tCbG9ja01ldGFkYXRhLCBUeXBlQ2hlY2thYmxlRGlyZWN0aXZlTWV0YX0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHthc3RUb1R5cGVzY3JpcHR9IGZyb20gJy4vZXhwcmVzc2lvbic7XG5cblxuLyoqXG4gKiBHaXZlbiBhIGB0cy5DbGFzc0RlY2xhcmF0aW9uYCBmb3IgYSBjb21wb25lbnQsIGFuZCBtZXRhZGF0YSByZWdhcmRpbmcgdGhhdCBjb21wb25lbnQsIGNvbXBvc2UgYVxuICogXCJ0eXBlIGNoZWNrIGJsb2NrXCIgZnVuY3Rpb24uXG4gKlxuICogV2hlbiBwYXNzZWQgdGhyb3VnaCBUeXBlU2NyaXB0J3MgVHlwZUNoZWNrZXIsIHR5cGUgZXJyb3JzIHRoYXQgYXJpc2Ugd2l0aGluIHRoZSB0eXBlIGNoZWNrIGJsb2NrXG4gKiBmdW5jdGlvbiBpbmRpY2F0ZSBpc3N1ZXMgaW4gdGhlIHRlbXBsYXRlIGl0c2VsZi5cbiAqXG4gKiBAcGFyYW0gbm9kZSB0aGUgVHlwZVNjcmlwdCBub2RlIGZvciB0aGUgY29tcG9uZW50IGNsYXNzLlxuICogQHBhcmFtIG1ldGEgbWV0YWRhdGEgYWJvdXQgdGhlIGNvbXBvbmVudCdzIHRlbXBsYXRlIGFuZCB0aGUgZnVuY3Rpb24gYmVpbmcgZ2VuZXJhdGVkLlxuICogQHBhcmFtIGltcG9ydE1hbmFnZXIgYW4gYEltcG9ydE1hbmFnZXJgIGZvciB0aGUgZmlsZSBpbnRvIHdoaWNoIHRoZSBUQ0Igd2lsbCBiZSB3cml0dGVuLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVUeXBlQ2hlY2tCbG9jayhcbiAgICBub2RlOiB0cy5DbGFzc0RlY2xhcmF0aW9uLCBtZXRhOiBUeXBlQ2hlY2tCbG9ja01ldGFkYXRhLFxuICAgIGltcG9ydE1hbmFnZXI6IEltcG9ydE1hbmFnZXIpOiB0cy5GdW5jdGlvbkRlY2xhcmF0aW9uIHtcbiAgY29uc3QgdGNiID0gbmV3IENvbnRleHQobWV0YS5ib3VuZFRhcmdldCwgbm9kZS5nZXRTb3VyY2VGaWxlKCksIGltcG9ydE1hbmFnZXIpO1xuICBjb25zdCBzY29wZSA9IG5ldyBTY29wZSh0Y2IpO1xuICB0Y2JQcm9jZXNzTm9kZXMobWV0YS5ib3VuZFRhcmdldC50YXJnZXQudGVtcGxhdGUgISwgdGNiLCBzY29wZSk7XG5cbiAgY29uc3QgYm9keSA9IHRzLmNyZWF0ZUJsb2NrKFt0cy5jcmVhdGVJZih0cy5jcmVhdGVUcnVlKCksIHNjb3BlLmdldEJsb2NrKCkpXSk7XG5cbiAgcmV0dXJuIHRzLmNyZWF0ZUZ1bmN0aW9uRGVjbGFyYXRpb24oXG4gICAgICAvKiBkZWNvcmF0b3JzICovIHVuZGVmaW5lZCxcbiAgICAgIC8qIG1vZGlmaWVycyAqLyB1bmRlZmluZWQsXG4gICAgICAvKiBhc3Rlcmlza1Rva2VuICovIHVuZGVmaW5lZCxcbiAgICAgIC8qIG5hbWUgKi8gbWV0YS5mbk5hbWUsXG4gICAgICAvKiB0eXBlUGFyYW1ldGVycyAqLyBub2RlLnR5cGVQYXJhbWV0ZXJzLFxuICAgICAgLyogcGFyYW1ldGVycyAqL1t0Y2JDdHhQYXJhbShub2RlKV0sXG4gICAgICAvKiB0eXBlICovIHVuZGVmaW5lZCxcbiAgICAgIC8qIGJvZHkgKi8gYm9keSk7XG59XG5cbi8qKlxuICogT3ZlcmFsbCBnZW5lcmF0aW9uIGNvbnRleHQgZm9yIHRoZSB0eXBlIGNoZWNrIGJsb2NrLlxuICpcbiAqIGBDb250ZXh0YCBoYW5kbGVzIG9wZXJhdGlvbnMgZHVyaW5nIGNvZGUgZ2VuZXJhdGlvbiB3aGljaCBhcmUgZ2xvYmFsIHdpdGggcmVzcGVjdCB0byB0aGUgd2hvbGVcbiAqIGJsb2NrLiBJdCdzIHJlc3BvbnNpYmxlIGZvciB2YXJpYWJsZSBuYW1lIGFsbG9jYXRpb24gYW5kIG1hbmFnZW1lbnQgb2YgYW55IGltcG9ydHMgbmVlZGVkLiBJdFxuICogYWxzbyBjb250YWlucyB0aGUgdGVtcGxhdGUgbWV0YWRhdGEgaXRzZWxmLlxuICovXG5jbGFzcyBDb250ZXh0IHtcbiAgcHJpdmF0ZSBuZXh0SWQgPSAxO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcmVhZG9ubHkgYm91bmRUYXJnZXQ6IEJvdW5kVGFyZ2V0PFR5cGVDaGVja2FibGVEaXJlY3RpdmVNZXRhPixcbiAgICAgIHByaXZhdGUgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgcHJpdmF0ZSBpbXBvcnRNYW5hZ2VyOiBJbXBvcnRNYW5hZ2VyKSB7fVxuXG4gIC8qKlxuICAgKiBBbGxvY2F0ZSBhIG5ldyB2YXJpYWJsZSBuYW1lIGZvciB1c2Ugd2l0aGluIHRoZSBgQ29udGV4dGAuXG4gICAqXG4gICAqIEN1cnJlbnRseSB0aGlzIHVzZXMgYSBtb25vdG9uaWNhbGx5IGluY3JlYXNpbmcgY291bnRlciwgYnV0IGluIHRoZSBmdXR1cmUgdGhlIHZhcmlhYmxlIG5hbWVcbiAgICogbWlnaHQgY2hhbmdlIGRlcGVuZGluZyBvbiB0aGUgdHlwZSBvZiBkYXRhIGJlaW5nIHN0b3JlZC5cbiAgICovXG4gIGFsbG9jYXRlSWQoKTogdHMuSWRlbnRpZmllciB7IHJldHVybiB0cy5jcmVhdGVJZGVudGlmaWVyKGBfdCR7dGhpcy5uZXh0SWQrK31gKTsgfVxuXG4gIC8qKlxuICAgKiBXcml0ZSBhIGB0cy5FeHByZXNzaW9uYCB0aGF0IHJlZmVyZW5jZXMgdGhlIGdpdmVuIG5vZGUuXG4gICAqXG4gICAqIFRoaXMgbWF5IGludm9sdmUgaW1wb3J0aW5nIHRoZSBub2RlIGludG8gdGhlIGZpbGUgaWYgaXQncyBub3QgZGVjbGFyZWQgdGhlcmUgYWxyZWFkeS5cbiAgICovXG4gIHJlZmVyZW5jZShyZWY6IFJlZmVyZW5jZTx0cy5Ob2RlPik6IHRzLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IG5nRXhwciA9IHJlZi50b0V4cHJlc3Npb24odGhpcy5zb3VyY2VGaWxlKTtcbiAgICBpZiAobmdFeHByID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVucmVhY2hhYmxlIHJlZmVyZW5jZTogJHtyZWYubm9kZX1gKTtcbiAgICB9XG5cbiAgICAvLyBVc2UgYHRyYW5zbGF0ZUV4cHJlc3Npb25gIHRvIGNvbnZlcnQgdGhlIGBFeHByZXNzaW9uYCBpbnRvIGEgYHRzLkV4cHJlc3Npb25gLlxuICAgIHJldHVybiB0cmFuc2xhdGVFeHByZXNzaW9uKG5nRXhwciwgdGhpcy5pbXBvcnRNYW5hZ2VyKTtcbiAgfVxufVxuXG4vKipcbiAqIExvY2FsIHNjb3BlIHdpdGhpbiB0aGUgdHlwZSBjaGVjayBibG9jayBmb3IgYSBwYXJ0aWN1bGFyIHRlbXBsYXRlLlxuICpcbiAqIFRoZSB0b3AtbGV2ZWwgdGVtcGxhdGUgYW5kIGVhY2ggbmVzdGVkIGA8bmctdGVtcGxhdGU+YCBoYXZlIHRoZWlyIG93biBgU2NvcGVgLCB3aGljaCBleGlzdCBpbiBhXG4gKiBoaWVyYXJjaHkuIFRoZSBzdHJ1Y3R1cmUgb2YgdGhpcyBoaWVyYXJjaHkgbWlycm9ycyB0aGUgc3ludGFjdGljIHNjb3BlcyBpbiB0aGUgZ2VuZXJhdGVkIHR5cGVcbiAqIGNoZWNrIGJsb2NrLCB3aGVyZSBlYWNoIG5lc3RlZCB0ZW1wbGF0ZSBpcyBlbmNhc2VkIGluIGFuIGBpZmAgc3RydWN0dXJlLlxuICpcbiAqIEFzIGEgdGVtcGxhdGUgaXMgcHJvY2Vzc2VkIGluIGEgZ2l2ZW4gYFNjb3BlYCwgc3RhdGVtZW50cyBhcmUgYWRkZWQgdmlhIGBhZGRTdGF0ZW1lbnQoKWAuIFdoZW5cbiAqIHRoaXMgcHJvY2Vzc2luZyBpcyBjb21wbGV0ZSwgdGhlIGBTY29wZWAgY2FuIGJlIHR1cm5lZCBpbnRvIGEgYHRzLkJsb2NrYCB2aWEgYGdldEJsb2NrKClgLlxuICovXG5jbGFzcyBTY29wZSB7XG4gIC8qKlxuICAgKiBNYXAgb2Ygbm9kZXMgdG8gaW5mb3JtYXRpb24gYWJvdXQgdGhhdCBub2RlIHdpdGhpbiB0aGUgVENCLlxuICAgKlxuICAgKiBGb3IgZXhhbXBsZSwgdGhpcyBzdG9yZXMgdGhlIGB0cy5JZGVudGlmaWVyYCB3aXRoaW4gdGhlIFRDQiBmb3IgYW4gZWxlbWVudCBvciA8bmctdGVtcGxhdGU+LlxuICAgKi9cbiAgcHJpdmF0ZSBlbGVtZW50RGF0YSA9IG5ldyBNYXA8VG1wbEFzdEVsZW1lbnR8VG1wbEFzdFRlbXBsYXRlLCBUY2JOb2RlRGF0YT4oKTtcblxuICAvKipcbiAgICogTWFwIG9mIGltbWVkaWF0ZWx5IG5lc3RlZCA8bmctdGVtcGxhdGU+cyAod2l0aGluIHRoaXMgYFNjb3BlYCkgdG8gdGhlIGB0cy5JZGVudGlmaWVyYCBvZiB0aGVpclxuICAgKiByZW5kZXJpbmcgY29udGV4dHMuXG4gICAqL1xuICBwcml2YXRlIHRlbXBsYXRlQ3R4ID0gbmV3IE1hcDxUbXBsQXN0VGVtcGxhdGUsIHRzLklkZW50aWZpZXI+KCk7XG5cbiAgLyoqXG4gICAqIE1hcCBvZiB2YXJpYWJsZXMgZGVjbGFyZWQgb24gdGhlIHRlbXBsYXRlIHRoYXQgY3JlYXRlZCB0aGlzIGBTY29wZWAgdG8gdGhlaXIgYHRzLklkZW50aWZpZXJgc1xuICAgKiB3aXRoaW4gdGhlIFRDQi5cbiAgICovXG4gIHByaXZhdGUgdmFyTWFwID0gbmV3IE1hcDxUbXBsQXN0VmFyaWFibGUsIHRzLklkZW50aWZpZXI+KCk7XG5cbiAgLyoqXG4gICAqIFN0YXRlbWVudHMgZm9yIHRoaXMgdGVtcGxhdGUuXG4gICAqL1xuICBwcml2YXRlIHN0YXRlbWVudHM6IHRzLlN0YXRlbWVudFtdID0gW107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSB0Y2I6IENvbnRleHQsIHByaXZhdGUgcGFyZW50OiBTY29wZXxudWxsID0gbnVsbCkge31cblxuICAvKipcbiAgICogR2V0IHRoZSBpZGVudGlmaWVyIHdpdGhpbiB0aGUgVENCIGZvciBhIGdpdmVuIGBUbXBsQXN0RWxlbWVudGAuXG4gICAqL1xuICBnZXRFbGVtZW50SWQoZWw6IFRtcGxBc3RFbGVtZW50KTogdHMuSWRlbnRpZmllcnxudWxsIHtcbiAgICBjb25zdCBkYXRhID0gdGhpcy5nZXRFbGVtZW50RGF0YShlbCwgZmFsc2UpO1xuICAgIGlmIChkYXRhICE9PSBudWxsICYmIGRhdGEuaHRtbE5vZGUgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiBkYXRhLmh0bWxOb2RlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wYXJlbnQgIT09IG51bGwgPyB0aGlzLnBhcmVudC5nZXRFbGVtZW50SWQoZWwpIDogbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGlkZW50aWZpZXIgb2YgYSBkaXJlY3RpdmUgaW5zdGFuY2Ugb24gYSBnaXZlbiB0ZW1wbGF0ZSBub2RlLlxuICAgKi9cbiAgZ2V0RGlyZWN0aXZlSWQoZWw6IFRtcGxBc3RFbGVtZW50fFRtcGxBc3RUZW1wbGF0ZSwgZGlyOiBUeXBlQ2hlY2thYmxlRGlyZWN0aXZlTWV0YSk6IHRzLklkZW50aWZpZXJcbiAgICAgIHxudWxsIHtcbiAgICBjb25zdCBkYXRhID0gdGhpcy5nZXRFbGVtZW50RGF0YShlbCwgZmFsc2UpO1xuICAgIGlmIChkYXRhICE9PSBudWxsICYmIGRhdGEuZGlyZWN0aXZlcyAhPT0gbnVsbCAmJiBkYXRhLmRpcmVjdGl2ZXMuaGFzKGRpcikpIHtcbiAgICAgIHJldHVybiBkYXRhLmRpcmVjdGl2ZXMuZ2V0KGRpcikgITtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucGFyZW50ICE9PSBudWxsID8gdGhpcy5wYXJlbnQuZ2V0RGlyZWN0aXZlSWQoZWwsIGRpcikgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgaWRlbnRpZmllciBvZiBhIHRlbXBsYXRlJ3MgcmVuZGVyaW5nIGNvbnRleHQuXG4gICAqL1xuICBnZXRUZW1wbGF0ZUN0eCh0bXBsOiBUbXBsQXN0VGVtcGxhdGUpOiB0cy5JZGVudGlmaWVyfG51bGwge1xuICAgIHJldHVybiB0aGlzLnRlbXBsYXRlQ3R4LmdldCh0bXBsKSB8fFxuICAgICAgICAodGhpcy5wYXJlbnQgIT09IG51bGwgPyB0aGlzLnBhcmVudC5nZXRUZW1wbGF0ZUN0eCh0bXBsKSA6IG51bGwpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgaWRlbnRpZmllciBvZiBhIHRlbXBsYXRlIHZhcmlhYmxlLlxuICAgKi9cbiAgZ2V0VmFyaWFibGVJZCh2OiBUbXBsQXN0VmFyaWFibGUpOiB0cy5JZGVudGlmaWVyfG51bGwge1xuICAgIHJldHVybiB0aGlzLnZhck1hcC5nZXQodikgfHwgKHRoaXMucGFyZW50ICE9PSBudWxsID8gdGhpcy5wYXJlbnQuZ2V0VmFyaWFibGVJZCh2KSA6IG51bGwpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbG9jYXRlIGFuIGlkZW50aWZpZXIgZm9yIHRoZSBnaXZlbiB0ZW1wbGF0ZSBlbGVtZW50LlxuICAgKi9cbiAgYWxsb2NhdGVFbGVtZW50SWQoZWw6IFRtcGxBc3RFbGVtZW50KTogdHMuSWRlbnRpZmllciB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuZ2V0RWxlbWVudERhdGEoZWwsIHRydWUpO1xuICAgIGlmIChkYXRhLmh0bWxOb2RlID09PSBudWxsKSB7XG4gICAgICBkYXRhLmh0bWxOb2RlID0gdGhpcy50Y2IuYWxsb2NhdGVJZCgpO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YS5odG1sTm9kZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvY2F0ZSBhbiBpZGVudGlmaWVyIGZvciB0aGUgZ2l2ZW4gdGVtcGxhdGUgdmFyaWFibGUuXG4gICAqL1xuICBhbGxvY2F0ZVZhcmlhYmxlSWQodjogVG1wbEFzdFZhcmlhYmxlKTogdHMuSWRlbnRpZmllciB7XG4gICAgaWYgKCF0aGlzLnZhck1hcC5oYXModikpIHtcbiAgICAgIHRoaXMudmFyTWFwLnNldCh2LCB0aGlzLnRjYi5hbGxvY2F0ZUlkKCkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy52YXJNYXAuZ2V0KHYpICE7XG4gIH1cblxuICAvKipcbiAgICogQWxsb2NhdGUgYW4gaWRlbnRpZmllciBmb3IgYW4gaW5zdGFuY2Ugb2YgdGhlIGdpdmVuIGRpcmVjdGl2ZSBvbiB0aGUgZ2l2ZW4gdGVtcGxhdGUgbm9kZS5cbiAgICovXG4gIGFsbG9jYXRlRGlyZWN0aXZlSWQoZWw6IFRtcGxBc3RFbGVtZW50fFRtcGxBc3RUZW1wbGF0ZSwgZGlyOiBUeXBlQ2hlY2thYmxlRGlyZWN0aXZlTWV0YSk6XG4gICAgICB0cy5JZGVudGlmaWVyIHtcbiAgICAvLyBMb29rIHVwIHRoZSBkYXRhIGZvciB0aGlzIHRlbXBsYXRlIG5vZGUuXG4gICAgY29uc3QgZGF0YSA9IHRoaXMuZ2V0RWxlbWVudERhdGEoZWwsIHRydWUpO1xuXG4gICAgLy8gTGF6aWx5IHBvcHVsYXRlIHRoZSBkaXJlY3RpdmVzIG1hcCwgaWYgaXQgZXhpc3RzLlxuICAgIGlmIChkYXRhLmRpcmVjdGl2ZXMgPT09IG51bGwpIHtcbiAgICAgIGRhdGEuZGlyZWN0aXZlcyA9IG5ldyBNYXA8VHlwZUNoZWNrYWJsZURpcmVjdGl2ZU1ldGEsIHRzLklkZW50aWZpZXI+KCk7XG4gICAgfVxuICAgIGlmICghZGF0YS5kaXJlY3RpdmVzLmhhcyhkaXIpKSB7XG4gICAgICBkYXRhLmRpcmVjdGl2ZXMuc2V0KGRpciwgdGhpcy50Y2IuYWxsb2NhdGVJZCgpKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGEuZGlyZWN0aXZlcy5nZXQoZGlyKSAhO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbG9jYXRlIGFuIGlkZW50aWZpZXIgZm9yIHRoZSByZW5kZXJpbmcgY29udGV4dCBvZiBhIGdpdmVuIHRlbXBsYXRlLlxuICAgKi9cbiAgYWxsb2NhdGVUZW1wbGF0ZUN0eCh0bXBsOiBUbXBsQXN0VGVtcGxhdGUpOiB0cy5JZGVudGlmaWVyIHtcbiAgICBpZiAoIXRoaXMudGVtcGxhdGVDdHguaGFzKHRtcGwpKSB7XG4gICAgICB0aGlzLnRlbXBsYXRlQ3R4LnNldCh0bXBsLCB0aGlzLnRjYi5hbGxvY2F0ZUlkKCkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy50ZW1wbGF0ZUN0eC5nZXQodG1wbCkgITtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBzdGF0ZW1lbnQgdG8gdGhpcyBzY29wZS5cbiAgICovXG4gIGFkZFN0YXRlbWVudChzdG10OiB0cy5TdGF0ZW1lbnQpOiB2b2lkIHsgdGhpcy5zdGF0ZW1lbnRzLnB1c2goc3RtdCk7IH1cblxuICAvKipcbiAgICogR2V0IGEgYHRzLkJsb2NrYCBjb250YWluaW5nIHRoZSBzdGF0ZW1lbnRzIGluIHRoaXMgc2NvcGUuXG4gICAqL1xuICBnZXRCbG9jaygpOiB0cy5CbG9jayB7IHJldHVybiB0cy5jcmVhdGVCbG9jayh0aGlzLnN0YXRlbWVudHMpOyB9XG5cbiAgLyoqXG4gICAqIEludGVybmFsIGhlbHBlciB0byBnZXQgdGhlIGRhdGEgYXNzb2NpYXRlZCB3aXRoIGEgcGFydGljdWxhciBlbGVtZW50LlxuICAgKlxuICAgKiBUaGlzIGNhbiBlaXRoZXIgcmV0dXJuIGBudWxsYCBpZiB0aGUgZGF0YSBpcyBub3QgcHJlc2VudCAod2hlbiB0aGUgYGFsbG9jYCBmbGFnIGlzIHNldCB0b1xuICAgKiBgZmFsc2VgKSwgb3IgaXQgY2FuIGluaXRpYWxpemUgdGhlIGRhdGEgZm9yIHRoZSBlbGVtZW50ICh3aGVuIGBhbGxvY2AgaXMgYHRydWVgKS5cbiAgICovXG4gIHByaXZhdGUgZ2V0RWxlbWVudERhdGEoZWw6IFRtcGxBc3RFbGVtZW50fFRtcGxBc3RUZW1wbGF0ZSwgYWxsb2M6IHRydWUpOiBUY2JOb2RlRGF0YTtcbiAgcHJpdmF0ZSBnZXRFbGVtZW50RGF0YShlbDogVG1wbEFzdEVsZW1lbnR8VG1wbEFzdFRlbXBsYXRlLCBhbGxvYzogZmFsc2UpOiBUY2JOb2RlRGF0YXxudWxsO1xuICBwcml2YXRlIGdldEVsZW1lbnREYXRhKGVsOiBUbXBsQXN0RWxlbWVudHxUbXBsQXN0VGVtcGxhdGUsIGFsbG9jOiBib29sZWFuKTogVGNiTm9kZURhdGF8bnVsbCB7XG4gICAgaWYgKGFsbG9jICYmICF0aGlzLmVsZW1lbnREYXRhLmhhcyhlbCkpIHtcbiAgICAgIHRoaXMuZWxlbWVudERhdGEuc2V0KGVsLCB7aHRtbE5vZGU6IG51bGwsIGRpcmVjdGl2ZXM6IG51bGx9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudERhdGEuZ2V0KGVsKSB8fCBudWxsO1xuICB9XG59XG5cbi8qKlxuICogRGF0YSBzdG9yZWQgZm9yIGEgdGVtcGxhdGUgbm9kZSBpbiBhIFRDQi5cbiAqL1xuaW50ZXJmYWNlIFRjYk5vZGVEYXRhIHtcbiAgLyoqXG4gICAqIFRoZSBpZGVudGlmaWVyIG9mIHRoZSBub2RlIGVsZW1lbnQgaW5zdGFuY2UsIGlmIGFueS5cbiAgICovXG4gIGh0bWxOb2RlOiB0cy5JZGVudGlmaWVyfG51bGw7XG4gIGRpcmVjdGl2ZXM6IE1hcDxUeXBlQ2hlY2thYmxlRGlyZWN0aXZlTWV0YSwgdHMuSWRlbnRpZmllcj58bnVsbDtcbn1cblxuLyoqXG4gKiBDcmVhdGUgdGhlIGBjdHhgIHBhcmFtZXRlciB0byB0aGUgdG9wLWxldmVsIFRDQiBmdW5jdGlvbi5cbiAqXG4gKiBUaGlzIGlzIGEgcGFyYW1ldGVyIHdpdGggYSB0eXBlIGVxdWl2YWxlbnQgdG8gdGhlIGNvbXBvbmVudCB0eXBlLCB3aXRoIGFsbCBnZW5lcmljIHR5cGVcbiAqIHBhcmFtZXRlcnMgbGlzdGVkICh3aXRob3V0IHRoZWlyIGdlbmVyaWMgYm91bmRzKS5cbiAqL1xuZnVuY3Rpb24gdGNiQ3R4UGFyYW0obm9kZTogdHMuQ2xhc3NEZWNsYXJhdGlvbik6IHRzLlBhcmFtZXRlckRlY2xhcmF0aW9uIHtcbiAgbGV0IHR5cGVBcmd1bWVudHM6IHRzLlR5cGVOb2RlW118dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAvLyBDaGVjayBpZiB0aGUgY29tcG9uZW50IGlzIGdlbmVyaWMsIGFuZCBwYXNzIGdlbmVyaWMgdHlwZSBwYXJhbWV0ZXJzIGlmIHNvLlxuICBpZiAobm9kZS50eXBlUGFyYW1ldGVycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdHlwZUFyZ3VtZW50cyA9XG4gICAgICAgIG5vZGUudHlwZVBhcmFtZXRlcnMubWFwKHBhcmFtID0+IHRzLmNyZWF0ZVR5cGVSZWZlcmVuY2VOb2RlKHBhcmFtLm5hbWUsIHVuZGVmaW5lZCkpO1xuICB9XG4gIGNvbnN0IHR5cGUgPSB0cy5jcmVhdGVUeXBlUmVmZXJlbmNlTm9kZShub2RlLm5hbWUgISwgdHlwZUFyZ3VtZW50cyk7XG4gIHJldHVybiB0cy5jcmVhdGVQYXJhbWV0ZXIoXG4gICAgICAvKiBkZWNvcmF0b3JzICovIHVuZGVmaW5lZCxcbiAgICAgIC8qIG1vZGlmaWVycyAqLyB1bmRlZmluZWQsXG4gICAgICAvKiBkb3REb3REb3RUb2tlbiAqLyB1bmRlZmluZWQsXG4gICAgICAvKiBuYW1lICovICdjdHgnLFxuICAgICAgLyogcXVlc3Rpb25Ub2tlbiAqLyB1bmRlZmluZWQsXG4gICAgICAvKiB0eXBlICovIHR5cGUsXG4gICAgICAvKiBpbml0aWFsaXplciAqLyB1bmRlZmluZWQpO1xufVxuXG4vKipcbiAqIFByb2Nlc3MgYW4gYXJyYXkgb2YgdGVtcGxhdGUgbm9kZXMgYW5kIGdlbmVyYXRlIHR5cGUgY2hlY2tpbmcgY29kZSBmb3IgdGhlbSB3aXRoaW4gdGhlIGdpdmVuXG4gKiBgU2NvcGVgLlxuICpcbiAqIEBwYXJhbSBub2RlcyB0ZW1wbGF0ZSBub2RlIGFycmF5IG92ZXIgd2hpY2ggdG8gaXRlcmF0ZS5cbiAqIEBwYXJhbSB0Y2IgY29udGV4dCBvZiB0aGUgb3ZlcmFsbCB0eXBlIGNoZWNrIGJsb2NrLlxuICogQHBhcmFtIHNjb3BlXG4gKi9cbmZ1bmN0aW9uIHRjYlByb2Nlc3NOb2Rlcyhub2RlczogVG1wbEFzdE5vZGVbXSwgdGNiOiBDb250ZXh0LCBzY29wZTogU2NvcGUpOiB2b2lkIHtcbiAgbm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAvLyBQcm9jZXNzIGVsZW1lbnRzLCB0ZW1wbGF0ZXMsIGFuZCBiaW5kaW5ncy5cbiAgICBpZiAobm9kZSBpbnN0YW5jZW9mIFRtcGxBc3RFbGVtZW50KSB7XG4gICAgICB0Y2JQcm9jZXNzRWxlbWVudChub2RlLCB0Y2IsIHNjb3BlKTtcbiAgICB9IGVsc2UgaWYgKG5vZGUgaW5zdGFuY2VvZiBUbXBsQXN0VGVtcGxhdGUpIHtcbiAgICAgIHRjYlByb2Nlc3NUZW1wbGF0ZURlY2xhcmF0aW9uKG5vZGUsIHRjYiwgc2NvcGUpO1xuICAgIH0gZWxzZSBpZiAobm9kZSBpbnN0YW5jZW9mIFRtcGxBc3RCb3VuZFRleHQpIHtcbiAgICAgIGNvbnN0IGV4cHIgPSB0Y2JFeHByZXNzaW9uKG5vZGUudmFsdWUsIHRjYiwgc2NvcGUpO1xuICAgICAgc2NvcGUuYWRkU3RhdGVtZW50KHRzLmNyZWF0ZVN0YXRlbWVudChleHByKSk7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBQcm9jZXNzIGFuIGVsZW1lbnQsIGdlbmVyYXRpbmcgdHlwZSBjaGVja2luZyBjb2RlIGZvciBpdCwgaXRzIGRpcmVjdGl2ZXMsIGFuZCBpdHMgY2hpbGRyZW4uXG4gKi9cbmZ1bmN0aW9uIHRjYlByb2Nlc3NFbGVtZW50KGVsOiBUbXBsQXN0RWxlbWVudCwgdGNiOiBDb250ZXh0LCBzY29wZTogU2NvcGUpOiB0cy5JZGVudGlmaWVyIHtcbiAgbGV0IGlkID0gc2NvcGUuZ2V0RWxlbWVudElkKGVsKTtcbiAgaWYgKGlkICE9PSBudWxsKSB7XG4gICAgLy8gVGhpcyBlbGVtZW50IGhhcyBiZWVuIHByb2Nlc3NlZCBiZWZvcmUuIE5vIG5lZWQgdG8gcnVuIHRocm91Z2ggaXQgYWdhaW4uXG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIGlkID0gc2NvcGUuYWxsb2NhdGVFbGVtZW50SWQoZWwpO1xuXG4gIC8vIEFkZCB0aGUgZGVjbGFyYXRpb24gb2YgdGhlIGVsZW1lbnQgdXNpbmcgZG9jdW1lbnQuY3JlYXRlRWxlbWVudC5cbiAgc2NvcGUuYWRkU3RhdGVtZW50KHRzQ3JlYXRlVmFyaWFibGUoaWQsIHRzQ3JlYXRlRWxlbWVudChlbC5uYW1lKSkpO1xuXG5cbiAgLy8gQ29uc3RydWN0IGEgc2V0IG9mIGFsbCB0aGUgaW5wdXQgYmluZGluZ3MuIEFueXRoaW5nIG1hdGNoZWQgYnkgZGlyZWN0aXZlcyB3aWxsIGJlIHJlbW92ZWQgZnJvbVxuICAvLyB0aGlzIHNldC4gVGhlIHJlc3QgYXJlIGJpbmRpbmdzIGJlaW5nIG1hZGUgb24gdGhlIGVsZW1lbnQgaXRzZWxmLlxuICBjb25zdCBpbnB1dHMgPSBuZXcgU2V0KFxuICAgICAgZWwuaW5wdXRzLmZpbHRlcihpbnB1dCA9PiBpbnB1dC50eXBlID09PSBCaW5kaW5nVHlwZS5Qcm9wZXJ0eSkubWFwKGlucHV0ID0+IGlucHV0Lm5hbWUpKTtcblxuICAvLyBQcm9jZXNzIGRpcmVjdGl2ZXMgb2YgdGhlIG5vZGUuXG4gIHRjYlByb2Nlc3NEaXJlY3RpdmVzKGVsLCBpbnB1dHMsIHRjYiwgc2NvcGUpO1xuXG4gIC8vIEF0IHRoaXMgcG9pbnQsIGBpbnB1dHNgIG5vdyBjb250YWlucyBvbmx5IHRob3NlIGJpbmRpbmdzIG5vdCBtYXRjaGVkIGJ5IGFueSBkaXJlY3RpdmUuIFRoZXNlXG4gIC8vIGJpbmRpbmdzIGdvIHRvIHRoZSBlbGVtZW50IGl0c2VsZi5cbiAgaW5wdXRzLmZvckVhY2gobmFtZSA9PiB7XG4gICAgY29uc3QgYmluZGluZyA9IGVsLmlucHV0cy5maW5kKGlucHV0ID0+IGlucHV0Lm5hbWUgPT09IG5hbWUpICE7XG4gICAgY29uc3QgZXhwciA9IHRjYkV4cHJlc3Npb24oYmluZGluZy52YWx1ZSwgdGNiLCBzY29wZSk7XG5cbiAgICBjb25zdCBwcm9wID0gdHMuY3JlYXRlUHJvcGVydHlBY2Nlc3MoaWQgISwgbmFtZSk7XG4gICAgY29uc3QgYXNzaWduID0gdHMuY3JlYXRlQmluYXJ5KHByb3AsIHRzLlN5bnRheEtpbmQuRXF1YWxzVG9rZW4sIGV4cHIpO1xuICAgIHNjb3BlLmFkZFN0YXRlbWVudCh0cy5jcmVhdGVTdGF0ZW1lbnQoYXNzaWduKSk7XG4gIH0pO1xuXG4gIC8vIFJlY3Vyc2UgaW50byBjaGlsZHJlbi5cbiAgdGNiUHJvY2Vzc05vZGVzKGVsLmNoaWxkcmVuLCB0Y2IsIHNjb3BlKTtcblxuICByZXR1cm4gaWQ7XG59XG5cbi8qKlxuICogUHJvY2VzcyBhbGwgdGhlIGRpcmVjdGl2ZXMgYXNzb2NpYXRlZCB3aXRoIGEgZ2l2ZW4gdGVtcGxhdGUgbm9kZS5cbiAqL1xuZnVuY3Rpb24gdGNiUHJvY2Vzc0RpcmVjdGl2ZXMoXG4gICAgZWw6IFRtcGxBc3RFbGVtZW50IHwgVG1wbEFzdFRlbXBsYXRlLCB1bmNsYWltZWQ6IFNldDxzdHJpbmc+LCB0Y2I6IENvbnRleHQsXG4gICAgc2NvcGU6IFNjb3BlKTogdm9pZCB7XG4gIGNvbnN0IGRpcmVjdGl2ZXMgPSB0Y2IuYm91bmRUYXJnZXQuZ2V0RGlyZWN0aXZlc09mTm9kZShlbCk7XG4gIGlmIChkaXJlY3RpdmVzID09PSBudWxsKSB7XG4gICAgLy8gTm8gZGlyZWN0aXZlcywgbm90aGluZyB0byBkby5cbiAgICByZXR1cm47XG4gIH1cbiAgZGlyZWN0aXZlcy5mb3JFYWNoKGRpciA9PiB0Y2JQcm9jZXNzRGlyZWN0aXZlKGVsLCBkaXIsIHVuY2xhaW1lZCwgdGNiLCBzY29wZSkpO1xufVxuXG4vKipcbiAqIFByb2Nlc3MgYSBkaXJlY3RpdmUsIGdlbmVyYXRpbmcgdHlwZSBjaGVja2luZyBjb2RlIGZvciBpdC5cbiAqL1xuZnVuY3Rpb24gdGNiUHJvY2Vzc0RpcmVjdGl2ZShcbiAgICBlbDogVG1wbEFzdEVsZW1lbnQgfCBUbXBsQXN0VGVtcGxhdGUsIGRpcjogVHlwZUNoZWNrYWJsZURpcmVjdGl2ZU1ldGEsIHVuY2xhaW1lZDogU2V0PHN0cmluZz4sXG4gICAgdGNiOiBDb250ZXh0LCBzY29wZTogU2NvcGUpOiB0cy5JZGVudGlmaWVyIHtcbiAgbGV0IGlkID0gc2NvcGUuZ2V0RGlyZWN0aXZlSWQoZWwsIGRpcik7XG4gIGlmIChpZCAhPT0gbnVsbCkge1xuICAgIC8vIFRoaXMgZGlyZWN0aXZlIGhhcyBiZWVuIHByb2Nlc3NlZCBiZWZvcmUuIE5vIG5lZWQgdG8gcnVuIHRocm91Z2ggaXQgYWdhaW4uXG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIGlkID0gc2NvcGUuYWxsb2NhdGVEaXJlY3RpdmVJZChlbCwgZGlyKTtcblxuICBjb25zdCBiaW5kaW5ncyA9IHRjYkdldElucHV0QmluZGluZ0V4cHJlc3Npb25zKGVsLCBkaXIsIHRjYiwgc2NvcGUpO1xuXG5cbiAgLy8gQ2FsbCB0aGUgdHlwZSBjb25zdHJ1Y3RvciBvZiB0aGUgZGlyZWN0aXZlIHRvIGluZmVyIGEgdHlwZSwgYW5kIGFzc2lnbiB0aGUgZGlyZWN0aXZlIGluc3RhbmNlLlxuICBzY29wZS5hZGRTdGF0ZW1lbnQodHNDcmVhdGVWYXJpYWJsZShpZCwgdGNiQ2FsbFR5cGVDdG9yKGVsLCBkaXIsIHRjYiwgc2NvcGUsIGJpbmRpbmdzKSkpO1xuXG4gIHRjYlByb2Nlc3NCaW5kaW5ncyhpZCwgYmluZGluZ3MsIHVuY2xhaW1lZCwgdGNiLCBzY29wZSk7XG5cbiAgcmV0dXJuIGlkO1xufVxuXG5mdW5jdGlvbiB0Y2JQcm9jZXNzQmluZGluZ3MoXG4gICAgcmVjdjogdHMuRXhwcmVzc2lvbiwgYmluZGluZ3M6IFRjYkJpbmRpbmdbXSwgdW5jbGFpbWVkOiBTZXQ8c3RyaW5nPiwgdGNiOiBDb250ZXh0LFxuICAgIHNjb3BlOiBTY29wZSk6IHZvaWQge1xuICAvLyBJdGVyYXRlIHRocm91Z2ggYWxsIHRoZSBiaW5kaW5ncyB0aGlzIGRpcmVjdGl2ZSBpcyBjb25zdW1pbmcuXG4gIGJpbmRpbmdzLmZvckVhY2goYmluZGluZyA9PiB7XG4gICAgLy8gR2VuZXJhdGUgYW4gYXNzaWdubWVudCBzdGF0ZW1lbnQgZm9yIHRoaXMgYmluZGluZy5cbiAgICBjb25zdCBwcm9wID0gdHMuY3JlYXRlUHJvcGVydHlBY2Nlc3MocmVjdiwgYmluZGluZy5maWVsZCk7XG4gICAgY29uc3QgYXNzaWduID0gdHMuY3JlYXRlQmluYXJ5KHByb3AsIHRzLlN5bnRheEtpbmQuRXF1YWxzVG9rZW4sIGJpbmRpbmcuZXhwcmVzc2lvbik7XG4gICAgc2NvcGUuYWRkU3RhdGVtZW50KHRzLmNyZWF0ZVN0YXRlbWVudChhc3NpZ24pKTtcblxuICAgIC8vIFJlbW92ZSB0aGUgYmluZGluZyBmcm9tIHRoZSBzZXQgb2YgdW5jbGFpbWVkIGlucHV0cywgYXMgdGhpcyBkaXJlY3RpdmUgaGFzICdjbGFpbWVkJyBpdC5cbiAgICB1bmNsYWltZWQuZGVsZXRlKGJpbmRpbmcucHJvcGVydHkpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBQcm9jZXNzIGEgbmVzdGVkIDxuZy10ZW1wbGF0ZT4sIGdlbmVyYXRpbmcgdHlwZS1jaGVja2luZyBjb2RlIGZvciBpdCBhbmQgaXRzIGNoaWxkcmVuLlxuICpcbiAqIFRoZSBuZXN0ZWQgPG5nLXRlbXBsYXRlPiBpcyByZXByZXNlbnRlZCB3aXRoIGFuIGBpZmAgc3RydWN0dXJlLCB3aGljaCBjcmVhdGVzIGEgbmV3IHN5bnRhY3RpY2FsXG4gKiBzY29wZSBmb3IgdGhlIHR5cGUgY2hlY2tpbmcgY29kZSBmb3IgdGhlIHRlbXBsYXRlLiBJZiB0aGUgPG5nLXRlbXBsYXRlPiBoYXMgYW55IGRpcmVjdGl2ZXMsIHRoZXlcbiAqIGNhbiBpbmZsdWVuY2UgdHlwZSBpbmZlcmVuY2Ugd2l0aGluIHRoZSBgaWZgIGJsb2NrIHRocm91Z2ggZGVmaW5lZCBndWFyZCBmdW5jdGlvbnMuXG4gKi9cbmZ1bmN0aW9uIHRjYlByb2Nlc3NUZW1wbGF0ZURlY2xhcmF0aW9uKHRtcGw6IFRtcGxBc3RUZW1wbGF0ZSwgdGNiOiBDb250ZXh0LCBzY29wZTogU2NvcGUpIHtcbiAgLy8gQ3JlYXRlIGEgbmV3IFNjb3BlIHRvIHJlcHJlc2VudCBiaW5kaW5ncyBjYXB0dXJlZCBpbiB0aGUgdGVtcGxhdGUuXG4gIGNvbnN0IHRtcGxTY29wZSA9IG5ldyBTY29wZSh0Y2IsIHNjb3BlKTtcblxuICAvLyBBbGxvY2F0ZSBhIHRlbXBsYXRlIGN0eCB2YXJpYWJsZSBhbmQgZGVjbGFyZSBpdCB3aXRoIGFuICdhbnknIHR5cGUuXG4gIGNvbnN0IGN0eCA9IHRtcGxTY29wZS5hbGxvY2F0ZVRlbXBsYXRlQ3R4KHRtcGwpO1xuICBjb25zdCB0eXBlID0gdHMuY3JlYXRlS2V5d29yZFR5cGVOb2RlKHRzLlN5bnRheEtpbmQuQW55S2V5d29yZCk7XG4gIHNjb3BlLmFkZFN0YXRlbWVudCh0c0RlY2xhcmVWYXJpYWJsZShjdHgsIHR5cGUpKTtcblxuICAvLyBQcm9jZXNzIGRpcmVjdGl2ZXMgb24gdGhlIHRlbXBsYXRlLlxuICB0Y2JQcm9jZXNzRGlyZWN0aXZlcyh0bXBsLCBuZXcgU2V0KCksIHRjYiwgc2NvcGUpO1xuXG4gIC8vIFByb2Nlc3MgdGhlIHRlbXBsYXRlIGl0c2VsZiAoaW5zaWRlIHRoZSBpbm5lciBTY29wZSkuXG4gIHRjYlByb2Nlc3NOb2Rlcyh0bXBsLmNoaWxkcmVuLCB0Y2IsIHRtcGxTY29wZSk7XG5cbiAgLy8gQW4gYGlmYCB3aWxsIGJlIGNvbnN0cnVjdGVkLCB3aXRoaW4gd2hpY2ggdGhlIHRlbXBsYXRlJ3MgY2hpbGRyZW4gd2lsbCBiZSB0eXBlIGNoZWNrZWQuIFRoZVxuICAvLyBgaWZgIGlzIHVzZWQgZm9yIHR3byByZWFzb25zOiBpdCBjcmVhdGVzIGEgbmV3IHN5bnRhY3RpYyBzY29wZSwgaXNvbGF0aW5nIHZhcmlhYmxlcyBkZWNsYXJlZCBpblxuICAvLyB0aGUgdGVtcGxhdGUncyBUQ0IgZnJvbSB0aGUgb3V0ZXIgY29udGV4dCwgYW5kIGl0IGFsbG93cyBhbnkgZGlyZWN0aXZlcyBvbiB0aGUgdGVtcGxhdGVzIHRvXG4gIC8vIHBlcmZvcm0gdHlwZSBuYXJyb3dpbmcgb2YgZWl0aGVyIGV4cHJlc3Npb25zIG9yIHRoZSB0ZW1wbGF0ZSdzIGNvbnRleHQuXG5cbiAgLy8gVGhlIGd1YXJkIGlzIHRoZSBgaWZgIGJsb2NrJ3MgY29uZGl0aW9uLiBJdCdzIHVzdWFsbHkgc2V0IHRvIGB0cnVlYCBidXQgZGlyZWN0aXZlcyB0aGF0IGV4aXN0XG4gIC8vIG9uIHRoZSB0ZW1wbGF0ZSBjYW4gdHJpZ2dlciBleHRyYSBndWFyZCBleHByZXNzaW9ucyB0aGF0IHNlcnZlIHRvIG5hcnJvdyB0eXBlcyB3aXRoaW4gdGhlXG4gIC8vIGBpZmAuIGBndWFyZGAgaXMgY2FsY3VsYXRlZCBieSBzdGFydGluZyB3aXRoIGB0cnVlYCBhbmQgYWRkaW5nIG90aGVyIGNvbmRpdGlvbnMgYXMgbmVlZGVkLlxuICAvLyBDb2xsZWN0IHRoZXNlIGludG8gYGd1YXJkc2AgYnkgcHJvY2Vzc2luZyB0aGUgZGlyZWN0aXZlcy5cbiAgY29uc3QgZGlyZWN0aXZlR3VhcmRzOiB0cy5FeHByZXNzaW9uW10gPSBbXTtcblxuICBjb25zdCBkaXJlY3RpdmVzID0gdGNiLmJvdW5kVGFyZ2V0LmdldERpcmVjdGl2ZXNPZk5vZGUodG1wbCk7XG4gIGlmIChkaXJlY3RpdmVzICE9PSBudWxsKSB7XG4gICAgZGlyZWN0aXZlcy5mb3JFYWNoKGRpciA9PiB7XG4gICAgICBjb25zdCBkaXJJbnN0SWQgPSBzY29wZS5nZXREaXJlY3RpdmVJZCh0bXBsLCBkaXIpICE7XG4gICAgICBjb25zdCBkaXJJZCA9IHRjYi5yZWZlcmVuY2UoZGlyLnJlZik7XG5cbiAgICAgIC8vIFRoZXJlIGFyZSB0d28ga2luZHMgb2YgZ3VhcmRzLiBUZW1wbGF0ZSBndWFyZHMgKG5nVGVtcGxhdGVHdWFyZHMpIGFsbG93IHR5cGUgbmFycm93aW5nIG9mXG4gICAgICAvLyB0aGUgZXhwcmVzc2lvbiBwYXNzZWQgdG8gYW4gQElucHV0IG9mIHRoZSBkaXJlY3RpdmUuIFNjYW4gdGhlIGRpcmVjdGl2ZSB0byBzZWUgaWYgaXQgaGFzXG4gICAgICAvLyBhbnkgdGVtcGxhdGUgZ3VhcmRzLCBhbmQgZ2VuZXJhdGUgdGhlbSBpZiBuZWVkZWQuXG4gICAgICBkaXIubmdUZW1wbGF0ZUd1YXJkcy5mb3JFYWNoKGlucHV0TmFtZSA9PiB7XG4gICAgICAgIC8vIEZvciBlYWNoIHRlbXBsYXRlIGd1YXJkIGZ1bmN0aW9uIG9uIHRoZSBkaXJlY3RpdmUsIGxvb2sgZm9yIGEgYmluZGluZyB0byB0aGF0IGlucHV0LlxuICAgICAgICBjb25zdCBib3VuZElucHV0ID0gdG1wbC5pbnB1dHMuZmluZChpID0+IGkubmFtZSA9PT0gaW5wdXROYW1lKTtcbiAgICAgICAgaWYgKGJvdW5kSW5wdXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIElmIHRoZXJlIGlzIHN1Y2ggYSBiaW5kaW5nLCBnZW5lcmF0ZSBhbiBleHByZXNzaW9uIGZvciBpdC5cbiAgICAgICAgICBjb25zdCBleHByID0gdGNiRXhwcmVzc2lvbihib3VuZElucHV0LnZhbHVlLCB0Y2IsIHNjb3BlKTtcbiAgICAgICAgICAvLyBDYWxsIHRoZSBndWFyZCBmdW5jdGlvbiBvbiB0aGUgZGlyZWN0aXZlIHdpdGggdGhlIGRpcmVjdGl2ZSBpbnN0YW5jZSBhbmQgdGhhdFxuICAgICAgICAgIC8vIGV4cHJlc3Npb24uXG4gICAgICAgICAgY29uc3QgZ3VhcmRJbnZva2UgPSB0c0NhbGxNZXRob2QoZGlySWQsIGBuZ1RlbXBsYXRlR3VhcmRfJHtpbnB1dE5hbWV9YCwgW1xuICAgICAgICAgICAgZGlySW5zdElkLFxuICAgICAgICAgICAgZXhwcixcbiAgICAgICAgICBdKTtcbiAgICAgICAgICBkaXJlY3RpdmVHdWFyZHMucHVzaChndWFyZEludm9rZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBUaGUgc2Vjb25kIGtpbmQgb2YgZ3VhcmQgaXMgYSB0ZW1wbGF0ZSBjb250ZXh0IGd1YXJkLiBUaGlzIGd1YXJkIG5hcnJvd3MgdGhlIHRlbXBsYXRlXG4gICAgICAvLyByZW5kZXJpbmcgY29udGV4dCB2YXJpYWJsZSBgY3R4YC5cbiAgICAgIGlmIChkaXIuaGFzTmdUZW1wbGF0ZUNvbnRleHRHdWFyZCkge1xuICAgICAgICBjb25zdCBndWFyZEludm9rZSA9IHRzQ2FsbE1ldGhvZChkaXJJZCwgJ25nVGVtcGxhdGVDb250ZXh0R3VhcmQnLCBbZGlySW5zdElkLCBjdHhdKTtcbiAgICAgICAgZGlyZWN0aXZlR3VhcmRzLnB1c2goZ3VhcmRJbnZva2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLy8gQnkgZGVmYXVsdCB0aGUgZ3VhcmQgaXMgc2ltcGx5IGB0cnVlYC5cbiAgbGV0IGd1YXJkOiB0cy5FeHByZXNzaW9uID0gdHMuY3JlYXRlVHJ1ZSgpO1xuXG4gIC8vIElmIHRoZXJlIGFyZSBhbnkgZ3VhcmRzIGZyb20gZGlyZWN0aXZlcywgdXNlIHRoZW0gaW5zdGVhZC5cbiAgaWYgKGRpcmVjdGl2ZUd1YXJkcy5sZW5ndGggPiAwKSB7XG4gICAgLy8gUG9wIHRoZSBmaXJzdCB2YWx1ZSBhbmQgdXNlIGl0IGFzIHRoZSBpbml0aWFsaXplciB0byByZWR1Y2UoKS4gVGhpcyB3YXksIGEgc2luZ2xlIGd1YXJkXG4gICAgLy8gd2lsbCBiZSB1c2VkIG9uIGl0cyBvd24sIGJ1dCB0d28gb3IgbW9yZSB3aWxsIGJlIGNvbWJpbmVkIGludG8gYmluYXJ5IGV4cHJlc3Npb25zLlxuICAgIGd1YXJkID0gZGlyZWN0aXZlR3VhcmRzLnJlZHVjZShcbiAgICAgICAgKGV4cHIsIGRpckd1YXJkKSA9PiB0cy5jcmVhdGVCaW5hcnkoZXhwciwgdHMuU3ludGF4S2luZC5BbXBlcnNhbmRBbXBlcnNhbmRUb2tlbiwgZGlyR3VhcmQpLFxuICAgICAgICBkaXJlY3RpdmVHdWFyZHMucG9wKCkgISk7XG4gIH1cblxuICAvLyBDb25zdHJ1Y3QgdGhlIGBpZmAgYmxvY2sgZm9yIHRoZSB0ZW1wbGF0ZSB3aXRoIHRoZSBnZW5lcmF0ZWQgZ3VhcmQgZXhwcmVzc2lvbi5cbiAgY29uc3QgdG1wbElmID0gdHMuY3JlYXRlSWYoXG4gICAgICAvKiBleHByZXNzaW9uICovIGd1YXJkLFxuICAgICAgLyogdGhlblN0YXRlbWVudCAqLyB0bXBsU2NvcGUuZ2V0QmxvY2soKSk7XG4gIHNjb3BlLmFkZFN0YXRlbWVudCh0bXBsSWYpO1xufVxuXG4vKipcbiAqIFByb2Nlc3MgYW4gYEFTVGAgZXhwcmVzc2lvbiBhbmQgY29udmVydCBpdCBpbnRvIGEgYHRzLkV4cHJlc3Npb25gLCBnZW5lcmF0aW5nIHJlZmVyZW5jZXMgdG8gdGhlXG4gKiBjb3JyZWN0IGlkZW50aWZpZXJzIGluIHRoZSBjdXJyZW50IHNjb3BlLlxuICovXG5mdW5jdGlvbiB0Y2JFeHByZXNzaW9uKGFzdDogQVNULCB0Y2I6IENvbnRleHQsIHNjb3BlOiBTY29wZSk6IHRzLkV4cHJlc3Npb24ge1xuICAvLyBgYXN0VG9UeXBlc2NyaXB0YCBhY3R1YWxseSBkb2VzIHRoZSBjb252ZXJzaW9uLiBBIHNwZWNpYWwgcmVzb2x2ZXIgYHRjYlJlc29sdmVgIGlzIHBhc3NlZCB3aGljaFxuICAvLyBpbnRlcnByZXRzIHNwZWNpZmljIGV4cHJlc3Npb24gbm9kZXMgdGhhdCBpbnRlcmFjdCB3aXRoIHRoZSBgSW1wbGljaXRSZWNlaXZlcmAuIFRoZXNlIG5vZGVzXG4gIC8vIGFjdHVhbGx5IHJlZmVyIHRvIGlkZW50aWZpZXJzIHdpdGhpbiB0aGUgY3VycmVudCBzY29wZS5cbiAgcmV0dXJuIGFzdFRvVHlwZXNjcmlwdChhc3QsIChhc3QpID0+IHRjYlJlc29sdmUoYXN0LCB0Y2IsIHNjb3BlKSk7XG59XG5cbi8qKlxuICogQ2FsbCB0aGUgdHlwZSBjb25zdHJ1Y3RvciBvZiBhIGRpcmVjdGl2ZSBpbnN0YW5jZSBvbiBhIGdpdmVuIHRlbXBsYXRlIG5vZGUsIGluZmVycmluZyBhIHR5cGUgZm9yXG4gKiB0aGUgZGlyZWN0aXZlIGluc3RhbmNlIGZyb20gYW55IGJvdW5kIGlucHV0cy5cbiAqL1xuZnVuY3Rpb24gdGNiQ2FsbFR5cGVDdG9yKFxuICAgIGVsOiBUbXBsQXN0RWxlbWVudCB8IFRtcGxBc3RUZW1wbGF0ZSwgZGlyOiBUeXBlQ2hlY2thYmxlRGlyZWN0aXZlTWV0YSwgdGNiOiBDb250ZXh0LFxuICAgIHNjb3BlOiBTY29wZSwgYmluZGluZ3M6IFRjYkJpbmRpbmdbXSk6IHRzLkV4cHJlc3Npb24ge1xuICBjb25zdCBkaXJDbGFzcyA9IHRjYi5yZWZlcmVuY2UoZGlyLnJlZik7XG5cbiAgLy8gQ29uc3RydWN0IGFuIGFycmF5IG9mIGB0cy5Qcm9wZXJ0eUFzc2lnbm1lbnRgcyBmb3IgZWFjaCBpbnB1dCBvZiB0aGUgZGlyZWN0aXZlIHRoYXQgaGFzIGFcbiAgLy8gbWF0Y2hpbmcgYmluZGluZy5cbiAgY29uc3QgbWVtYmVycyA9IGJpbmRpbmdzLm1hcChiID0+IHRzLmNyZWF0ZVByb3BlcnR5QXNzaWdubWVudChiLmZpZWxkLCBiLmV4cHJlc3Npb24pKTtcblxuICAvLyBDYWxsIHRoZSBgbmdUeXBlQ3RvcmAgbWV0aG9kIG9uIHRoZSBkaXJlY3RpdmUgY2xhc3MsIHdpdGggYW4gb2JqZWN0IGxpdGVyYWwgYXJndW1lbnQgY3JlYXRlZFxuICAvLyBmcm9tIHRoZSBtYXRjaGVkIGlucHV0cy5cbiAgcmV0dXJuIHRzQ2FsbE1ldGhvZChcbiAgICAgIC8qIHJlY2VpdmVyICovIGRpckNsYXNzLFxuICAgICAgLyogbWV0aG9kTmFtZSAqLyAnbmdUeXBlQ3RvcicsXG4gICAgICAvKiBhcmdzICovW3RzLmNyZWF0ZU9iamVjdExpdGVyYWwobWVtYmVycyldKTtcbn1cblxuaW50ZXJmYWNlIFRjYkJpbmRpbmcge1xuICBmaWVsZDogc3RyaW5nO1xuICBwcm9wZXJ0eTogc3RyaW5nO1xuICBleHByZXNzaW9uOiB0cy5FeHByZXNzaW9uO1xufVxuXG5mdW5jdGlvbiB0Y2JHZXRJbnB1dEJpbmRpbmdFeHByZXNzaW9ucyhcbiAgICBlbDogVG1wbEFzdEVsZW1lbnQgfCBUbXBsQXN0VGVtcGxhdGUsIGRpcjogVHlwZUNoZWNrYWJsZURpcmVjdGl2ZU1ldGEsIHRjYjogQ29udGV4dCxcbiAgICBzY29wZTogU2NvcGUpOiBUY2JCaW5kaW5nW10ge1xuICBjb25zdCBiaW5kaW5nczogVGNiQmluZGluZ1tdID0gW107XG4gIC8vIGBkaXIuaW5wdXRzYCBpcyBhbiBvYmplY3QgbWFwIG9mIGZpZWxkIG5hbWVzIG9uIHRoZSBkaXJlY3RpdmUgY2xhc3MgdG8gcHJvcGVydHkgbmFtZXMuXG4gIC8vIFRoaXMgaXMgYmFja3dhcmRzIGZyb20gd2hhdCdzIG5lZWRlZCB0byBtYXRjaCBiaW5kaW5ncyAtIGEgbWFwIG9mIHByb3BlcnRpZXMgdG8gZmllbGQgbmFtZXNcbiAgLy8gaXMgZGVzaXJlZC4gSW52ZXJ0IGBkaXIuaW5wdXRzYCBpbnRvIGBwcm9wTWF0Y2hgIHRvIGNyZWF0ZSB0aGlzIG1hcC5cbiAgY29uc3QgcHJvcE1hdGNoID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgY29uc3QgaW5wdXRzID0gZGlyLmlucHV0cztcbiAgT2JqZWN0LmtleXMoaW5wdXRzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgQXJyYXkuaXNBcnJheShpbnB1dHNba2V5XSkgPyBwcm9wTWF0Y2guc2V0KGlucHV0c1trZXldWzBdLCBrZXkpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BNYXRjaC5zZXQoaW5wdXRzW2tleV0gYXMgc3RyaW5nLCBrZXkpO1xuICB9KTtcblxuICAvLyBBZGQgYSBiaW5kaW5nIGV4cHJlc3Npb24gdG8gdGhlIG1hcCBmb3IgZWFjaCBpbnB1dCBvZiB0aGUgZGlyZWN0aXZlIHRoYXQgaGFzIGFcbiAgLy8gbWF0Y2hpbmcgYmluZGluZy5cbiAgZWwuaW5wdXRzLmZpbHRlcihpbnB1dCA9PiBwcm9wTWF0Y2guaGFzKGlucHV0Lm5hbWUpKS5mb3JFYWNoKGlucHV0ID0+IHtcbiAgICAvLyBQcm9kdWNlIGFuIGV4cHJlc3Npb24gcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGUgYmluZGluZy5cbiAgICBjb25zdCBleHByID0gdGNiRXhwcmVzc2lvbihpbnB1dC52YWx1ZSwgdGNiLCBzY29wZSk7XG5cbiAgICAvLyBDYWxsIHRoZSBjYWxsYmFjay5cbiAgICBiaW5kaW5ncy5wdXNoKHtcbiAgICAgIHByb3BlcnR5OiBpbnB1dC5uYW1lLFxuICAgICAgZmllbGQ6IHByb3BNYXRjaC5nZXQoaW5wdXQubmFtZSkgISxcbiAgICAgIGV4cHJlc3Npb246IGV4cHIsXG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gYmluZGluZ3M7XG59XG5cbi8qKlxuICogQ3JlYXRlIGFuIGV4cHJlc3Npb24gd2hpY2ggaW5zdGFudGlhdGVzIGFuIGVsZW1lbnQgYnkgaXRzIEhUTUwgdGFnTmFtZS5cbiAqXG4gKiBUaGFua3MgdG8gbmFycm93aW5nIG9mIGBkb2N1bWVudC5jcmVhdGVFbGVtZW50KClgLCB0aGlzIGV4cHJlc3Npb24gd2lsbCBoYXZlIGl0cyB0eXBlIGluZmVycmVkXG4gKiBiYXNlZCBvbiB0aGUgdGFnIG5hbWUsIGluY2x1ZGluZyBmb3IgY3VzdG9tIGVsZW1lbnRzIHRoYXQgaGF2ZSBhcHByb3ByaWF0ZSAuZC50cyBkZWZpbml0aW9ucy5cbiAqL1xuZnVuY3Rpb24gdHNDcmVhdGVFbGVtZW50KHRhZ05hbWU6IHN0cmluZyk6IHRzLkV4cHJlc3Npb24ge1xuICBjb25zdCBjcmVhdGVFbGVtZW50ID0gdHMuY3JlYXRlUHJvcGVydHlBY2Nlc3MoXG4gICAgICAvKiBleHByZXNzaW9uICovIHRzLmNyZWF0ZUlkZW50aWZpZXIoJ2RvY3VtZW50JyksICdjcmVhdGVFbGVtZW50Jyk7XG4gIHJldHVybiB0cy5jcmVhdGVDYWxsKFxuICAgICAgLyogZXhwcmVzc2lvbiAqLyBjcmVhdGVFbGVtZW50LFxuICAgICAgLyogdHlwZUFyZ3VtZW50cyAqLyB1bmRlZmluZWQsXG4gICAgICAvKiBhcmd1bWVudHNBcnJheSAqL1t0cy5jcmVhdGVMaXRlcmFsKHRhZ05hbWUpXSk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgYHRzLlZhcmlhYmxlU3RhdGVtZW50YCB3aGljaCBkZWNsYXJlcyBhIHZhcmlhYmxlIHdpdGhvdXQgZXhwbGljaXQgaW5pdGlhbGl6YXRpb24uXG4gKlxuICogVGhlIGluaXRpYWxpemVyIGBudWxsIWAgaXMgdXNlZCB0byBieXBhc3Mgc3RyaWN0IHZhcmlhYmxlIGluaXRpYWxpemF0aW9uIGNoZWNrcy5cbiAqXG4gKiBVbmxpa2Ugd2l0aCBgdHNDcmVhdGVWYXJpYWJsZWAsIHRoZSB0eXBlIG9mIHRoZSB2YXJpYWJsZSBpcyBleHBsaWNpdGx5IHNwZWNpZmllZC5cbiAqL1xuZnVuY3Rpb24gdHNEZWNsYXJlVmFyaWFibGUoaWQ6IHRzLklkZW50aWZpZXIsIHR5cGU6IHRzLlR5cGVOb2RlKTogdHMuVmFyaWFibGVTdGF0ZW1lbnQge1xuICBjb25zdCBkZWNsID0gdHMuY3JlYXRlVmFyaWFibGVEZWNsYXJhdGlvbihcbiAgICAgIC8qIG5hbWUgKi8gaWQsXG4gICAgICAvKiB0eXBlICovIHR5cGUsXG4gICAgICAvKiBpbml0aWFsaXplciAqLyB0cy5jcmVhdGVOb25OdWxsRXhwcmVzc2lvbih0cy5jcmVhdGVOdWxsKCkpKTtcbiAgcmV0dXJuIHRzLmNyZWF0ZVZhcmlhYmxlU3RhdGVtZW50KFxuICAgICAgLyogbW9kaWZpZXJzICovIHVuZGVmaW5lZCxcbiAgICAgIC8qIGRlY2xhcmF0aW9uTGlzdCAqL1tkZWNsXSk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgYHRzLlZhcmlhYmxlU3RhdGVtZW50YCB0aGF0IGluaXRpYWxpemVzIGEgdmFyaWFibGUgd2l0aCBhIGdpdmVuIGV4cHJlc3Npb24uXG4gKlxuICogVW5saWtlIHdpdGggYHRzRGVjbGFyZVZhcmlhYmxlYCwgdGhlIHR5cGUgb2YgdGhlIHZhcmlhYmxlIGlzIGluZmVycmVkIGZyb20gdGhlIGluaXRpYWxpemVyXG4gKiBleHByZXNzaW9uLlxuICovXG5mdW5jdGlvbiB0c0NyZWF0ZVZhcmlhYmxlKGlkOiB0cy5JZGVudGlmaWVyLCBpbml0aWFsaXplcjogdHMuRXhwcmVzc2lvbik6IHRzLlZhcmlhYmxlU3RhdGVtZW50IHtcbiAgY29uc3QgZGVjbCA9IHRzLmNyZWF0ZVZhcmlhYmxlRGVjbGFyYXRpb24oXG4gICAgICAvKiBuYW1lICovIGlkLFxuICAgICAgLyogdHlwZSAqLyB1bmRlZmluZWQsXG4gICAgICAvKiBpbml0aWFsaXplciAqLyBpbml0aWFsaXplcik7XG4gIHJldHVybiB0cy5jcmVhdGVWYXJpYWJsZVN0YXRlbWVudChcbiAgICAgIC8qIG1vZGlmaWVycyAqLyB1bmRlZmluZWQsXG4gICAgICAvKiBkZWNsYXJhdGlvbkxpc3QgKi9bZGVjbF0pO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdCBhIGB0cy5DYWxsRXhwcmVzc2lvbmAgdGhhdCBjYWxscyBhIG1ldGhvZCBvbiBhIHJlY2VpdmVyLlxuICovXG5mdW5jdGlvbiB0c0NhbGxNZXRob2QoXG4gICAgcmVjZWl2ZXI6IHRzLkV4cHJlc3Npb24sIG1ldGhvZE5hbWU6IHN0cmluZywgYXJnczogdHMuRXhwcmVzc2lvbltdID0gW10pOiB0cy5DYWxsRXhwcmVzc2lvbiB7XG4gIGNvbnN0IG1ldGhvZEFjY2VzcyA9IHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKHJlY2VpdmVyLCBtZXRob2ROYW1lKTtcbiAgcmV0dXJuIHRzLmNyZWF0ZUNhbGwoXG4gICAgICAvKiBleHByZXNzaW9uICovIG1ldGhvZEFjY2VzcyxcbiAgICAgIC8qIHR5cGVBcmd1bWVudHMgKi8gdW5kZWZpbmVkLFxuICAgICAgLyogYXJndW1lbnRzQXJyYXkgKi8gYXJncyk7XG59XG5cbi8qKlxuICogUmVzb2x2ZSBhbiBgQVNUYCBleHByZXNzaW9uIHdpdGhpbiB0aGUgZ2l2ZW4gc2NvcGUuXG4gKlxuICogU29tZSBgQVNUYCBleHByZXNzaW9ucyByZWZlciB0byB0b3AtbGV2ZWwgY29uY2VwdHMgKHJlZmVyZW5jZXMsIHZhcmlhYmxlcywgdGhlIGNvbXBvbmVudFxuICogY29udGV4dCkuIFRoaXMgbWV0aG9kIGFzc2lzdHMgaW4gcmVzb2x2aW5nIHRob3NlLlxuICovXG5mdW5jdGlvbiB0Y2JSZXNvbHZlKGFzdDogQVNULCB0Y2I6IENvbnRleHQsIHNjb3BlOiBTY29wZSk6IHRzLkV4cHJlc3Npb258bnVsbCB7XG4gIC8vIFNob3J0IGNpcmN1aXQgZm9yIEFTVCB0eXBlcyB0aGF0IHdvbid0IGhhdmUgbWFwcGluZ3MuXG4gIGlmICghKGFzdCBpbnN0YW5jZW9mIEltcGxpY2l0UmVjZWl2ZXIgfHwgYXN0IGluc3RhbmNlb2YgUHJvcGVydHlSZWFkKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgaWYgKGFzdCBpbnN0YW5jZW9mIFByb3BlcnR5UmVhZCAmJiBhc3QucmVjZWl2ZXIgaW5zdGFuY2VvZiBJbXBsaWNpdFJlY2VpdmVyKSB7XG4gICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgdGVtcGxhdGUgbWV0YWRhdGEgaGFzIGJvdW5kIGEgdGFyZ2V0IGZvciB0aGlzIGV4cHJlc3Npb24uIElmIHNvLCB0aGVuXG4gICAgLy8gcmVzb2x2ZSB0aGF0IHRhcmdldC4gSWYgbm90LCB0aGVuIHRoZSBleHByZXNzaW9uIGlzIHJlZmVyZW5jaW5nIHRoZSB0b3AtbGV2ZWwgY29tcG9uZW50XG4gICAgLy8gY29udGV4dC5cbiAgICBjb25zdCBiaW5kaW5nID0gdGNiLmJvdW5kVGFyZ2V0LmdldEV4cHJlc3Npb25UYXJnZXQoYXN0KTtcbiAgICBpZiAoYmluZGluZyAhPT0gbnVsbCkge1xuICAgICAgLy8gVGhpcyBleHByZXNzaW9uIGhhcyBhIGJpbmRpbmcgdG8gc29tZSB2YXJpYWJsZSBvciByZWZlcmVuY2UgaW4gdGhlIHRlbXBsYXRlLiBSZXNvbHZlIGl0LlxuICAgICAgaWYgKGJpbmRpbmcgaW5zdGFuY2VvZiBUbXBsQXN0VmFyaWFibGUpIHtcbiAgICAgICAgcmV0dXJuIHRjYlJlc29sdmVWYXJpYWJsZShiaW5kaW5nLCB0Y2IsIHNjb3BlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgTm90IGhhbmRsZWQ6ICR7YmluZGluZ31gKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhpcyBpcyBhIFByb3BlcnR5UmVhZChJbXBsaWNpdFJlY2VpdmVyKSBhbmQgcHJvYmFibHkgcmVmZXJzIHRvIGEgcHJvcGVydHkgYWNjZXNzIG9uIHRoZVxuICAgICAgLy8gY29tcG9uZW50IGNvbnRleHQuIExldCBpdCBmYWxsIHRocm91Z2ggcmVzb2x1dGlvbiBoZXJlIHNvIGl0IHdpbGwgYmUgY2F1Z2h0IHdoZW4gdGhlXG4gICAgICAvLyBJbXBsaWNpdFJlY2VpdmVyIGlzIHJlc29sdmVkIGluIHRoZSBicmFuY2ggYmVsb3cuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH0gZWxzZSBpZiAoYXN0IGluc3RhbmNlb2YgSW1wbGljaXRSZWNlaXZlcikge1xuICAgIC8vIEFTVCBpbnN0YW5jZXMgcmVwcmVzZW50aW5nIHZhcmlhYmxlcyBhbmQgcmVmZXJlbmNlcyBsb29rIHZlcnkgc2ltaWxhciB0byBwcm9wZXJ0eSByZWFkcyBmcm9tXG4gICAgLy8gdGhlIGNvbXBvbmVudCBjb250ZXh0OiBib3RoIGhhdmUgdGhlIHNoYXBlIFByb3BlcnR5UmVhZChJbXBsaWNpdFJlY2VpdmVyLCAncHJvcGVydHlOYW1lJykuXG4gICAgLy8gYHRjYkV4cHJlc3Npb25gIHdpbGwgZmlyc3QgdHJ5IHRvIGB0Y2JSZXNvbHZlYCB0aGUgb3V0ZXIgUHJvcGVydHlSZWFkLiBJZiB0aGlzIHdvcmtzLCBpdCdzXG4gICAgLy8gYmVjYXVzZSB0aGUgYEJvdW5kVGFyZ2V0YCBmb3VuZCBhbiBleHByZXNzaW9uIHRhcmdldCBmb3IgdGhlIHdob2xlIGV4cHJlc3Npb24sIGFuZCB0aGVyZWZvcmVcbiAgICAvLyBgdGNiRXhwcmVzc2lvbmAgd2lsbCBuZXZlciBhdHRlbXB0IHRvIGB0Y2JSZXNvbHZlYCB0aGUgSW1wbGljaXRSZWNlaXZlciBvZiB0aGF0IFByb3BlcnR5UmVhZC5cbiAgICAvL1xuICAgIC8vIFRoZXJlZm9yZSBpZiBgdGNiUmVzb2x2ZWAgaXMgY2FsbGVkIG9uIGFuIGBJbXBsaWNpdFJlY2VpdmVyYCwgaXQncyBiZWNhdXNlIG5vIG91dGVyXG4gICAgLy8gUHJvcGVydHlSZWFkIHJlc29sdmVkIHRvIGEgdmFyaWFibGUgb3IgcmVmZXJlbmNlLCBhbmQgdGhlcmVmb3JlIHRoaXMgaXMgYSBwcm9wZXJ0eSByZWFkIG9uXG4gICAgLy8gdGhlIGNvbXBvbmVudCBjb250ZXh0IGl0c2VsZi5cbiAgICByZXR1cm4gdHMuY3JlYXRlSWRlbnRpZmllcignY3R4Jyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gVGhpcyBBU1QgaXNuJ3Qgc3BlY2lhbCBhZnRlciBhbGwuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXNvbHZlIGEgdmFyaWFibGUgdG8gYW4gaWRlbnRpZmllciB0aGF0IHJlcHJlc2VudHMgaXRzIHZhbHVlLlxuICovXG5mdW5jdGlvbiB0Y2JSZXNvbHZlVmFyaWFibGUoYmluZGluZzogVG1wbEFzdFZhcmlhYmxlLCB0Y2I6IENvbnRleHQsIHNjb3BlOiBTY29wZSk6IHRzLklkZW50aWZpZXIge1xuICAvLyBMb29rIHRvIHNlZSB3aGV0aGVyIHRoZSB2YXJpYWJsZSB3YXMgYWxyZWFkeSBpbml0aWFsaXplZC4gSWYgc28sIGp1c3QgcmV1c2UgaXQuXG4gIGxldCBpZCA9IHNjb3BlLmdldFZhcmlhYmxlSWQoYmluZGluZyk7XG4gIGlmIChpZCAhPT0gbnVsbCkge1xuICAgIHJldHVybiBpZDtcbiAgfVxuXG4gIC8vIExvb2sgZm9yIHRoZSB0ZW1wbGF0ZSB3aGljaCBkZWNsYXJlcyB0aGlzIHZhcmlhYmxlLlxuICBjb25zdCB0bXBsID0gdGNiLmJvdW5kVGFyZ2V0LmdldFRlbXBsYXRlT2ZTeW1ib2woYmluZGluZyk7XG4gIGlmICh0bXBsID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBUbXBsQXN0VmFyaWFibGUgdG8gYmUgbWFwcGVkIHRvIGEgVG1wbEFzdFRlbXBsYXRlYCk7XG4gIH1cbiAgLy8gTG9vayBmb3IgYSBjb250ZXh0IHZhcmlhYmxlIGZvciB0aGUgdGVtcGxhdGUuIFRoaXMgc2hvdWxkJ3ZlIGJlZW4gZGVjbGFyZWQgYmVmb3JlIGFueXRoaW5nXG4gIC8vIHRoYXQgY291bGQgcmVmZXJlbmNlIHRoZSB0ZW1wbGF0ZSdzIHZhcmlhYmxlcy5cbiAgY29uc3QgY3R4ID0gc2NvcGUuZ2V0VGVtcGxhdGVDdHgodG1wbCk7XG4gIGlmIChjdHggPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIHRlbXBsYXRlIGNvbnRleHQgdG8gZXhpc3QuJyk7XG4gIH1cblxuICAvLyBBbGxvY2F0ZSBhbiBpZGVudGlmaWVyIGZvciB0aGUgVG1wbEFzdFZhcmlhYmxlLCBhbmQgaW5pdGlhbGl6ZSBpdCB0byBhIHJlYWQgb2YgdGhlIHZhcmlhYmxlIG9uXG4gIC8vIHRoZSB0ZW1wbGF0ZSBjb250ZXh0LlxuICBpZCA9IHNjb3BlLmFsbG9jYXRlVmFyaWFibGVJZChiaW5kaW5nKTtcbiAgY29uc3QgaW5pdGlhbGl6ZXIgPSB0cy5jcmVhdGVQcm9wZXJ0eUFjY2VzcyhcbiAgICAgIC8qIGV4cHJlc3Npb24gKi8gY3R4LFxuICAgICAgLyogbmFtZSAqLyBiaW5kaW5nLnZhbHVlKTtcblxuICAvLyBEZWNsYXJlIHRoZSB2YXJpYWJsZSwgYW5kIHJldHVybiBpdHMgaWRlbnRpZmllci5cbiAgc2NvcGUuYWRkU3RhdGVtZW50KHRzQ3JlYXRlVmFyaWFibGUoaWQsIGluaXRpYWxpemVyKSk7XG4gIHJldHVybiBpZDtcbn1cbiJdfQ==