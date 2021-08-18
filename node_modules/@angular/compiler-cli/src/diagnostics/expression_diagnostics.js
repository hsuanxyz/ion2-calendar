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
        define("@angular/compiler-cli/src/diagnostics/expression_diagnostics", ["require", "exports", "@angular/compiler", "@angular/compiler-cli/src/diagnostics/expression_type", "@angular/compiler-cli/src/diagnostics/symbols"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const compiler_1 = require("@angular/compiler");
    const expression_type_1 = require("@angular/compiler-cli/src/diagnostics/expression_type");
    const symbols_1 = require("@angular/compiler-cli/src/diagnostics/symbols");
    function getTemplateExpressionDiagnostics(info) {
        const visitor = new ExpressionDiagnosticsVisitor(info, (path, includeEvent) => getExpressionScope(info, path, includeEvent));
        compiler_1.templateVisitAll(visitor, info.templateAst);
        return visitor.diagnostics;
    }
    exports.getTemplateExpressionDiagnostics = getTemplateExpressionDiagnostics;
    function getExpressionDiagnostics(scope, ast, query, context = {}) {
        const analyzer = new expression_type_1.AstType(scope, query, context);
        analyzer.getDiagnostics(ast);
        return analyzer.diagnostics;
    }
    exports.getExpressionDiagnostics = getExpressionDiagnostics;
    function getReferences(info) {
        const result = [];
        function processReferences(references) {
            for (const reference of references) {
                let type = undefined;
                if (reference.value) {
                    type = info.query.getTypeSymbol(compiler_1.tokenReference(reference.value));
                }
                result.push({
                    name: reference.name,
                    kind: 'reference',
                    type: type || info.query.getBuiltinType(symbols_1.BuiltinType.Any),
                    get definition() { return getDefinitionOf(info, reference); }
                });
            }
        }
        const visitor = new class extends compiler_1.RecursiveTemplateAstVisitor {
            visitEmbeddedTemplate(ast, context) {
                super.visitEmbeddedTemplate(ast, context);
                processReferences(ast.references);
            }
            visitElement(ast, context) {
                super.visitElement(ast, context);
                processReferences(ast.references);
            }
        };
        compiler_1.templateVisitAll(visitor, info.templateAst);
        return result;
    }
    function getDefinitionOf(info, ast) {
        if (info.fileName) {
            const templateOffset = info.offset;
            return [{
                    fileName: info.fileName,
                    span: {
                        start: ast.sourceSpan.start.offset + templateOffset,
                        end: ast.sourceSpan.end.offset + templateOffset
                    }
                }];
        }
    }
    function getVarDeclarations(info, path) {
        const result = [];
        let current = path.tail;
        while (current) {
            if (current instanceof compiler_1.EmbeddedTemplateAst) {
                for (const variable of current.variables) {
                    const name = variable.name;
                    // Find the first directive with a context.
                    const context = current.directives.map(d => info.query.getTemplateContext(d.directive.type.reference))
                        .find(c => !!c);
                    // Determine the type of the context field referenced by variable.value.
                    let type = undefined;
                    if (context) {
                        const value = context.get(variable.value);
                        if (value) {
                            type = value.type;
                            let kind = info.query.getTypeKind(type);
                            if (kind === symbols_1.BuiltinType.Any || kind == symbols_1.BuiltinType.Unbound) {
                                // The any type is not very useful here. For special cases, such as ngFor, we can do
                                // better.
                                type = refinedVariableType(type, info, current);
                            }
                        }
                    }
                    if (!type) {
                        type = info.query.getBuiltinType(symbols_1.BuiltinType.Any);
                    }
                    result.push({
                        name,
                        kind: 'variable', type, get definition() { return getDefinitionOf(info, variable); }
                    });
                }
            }
            current = path.parentOf(current);
        }
        return result;
    }
    function refinedVariableType(type, info, templateElement) {
        // Special case the ngFor directive
        const ngForDirective = templateElement.directives.find(d => {
            const name = compiler_1.identifierName(d.directive.type);
            return name == 'NgFor' || name == 'NgForOf';
        });
        if (ngForDirective) {
            const ngForOfBinding = ngForDirective.inputs.find(i => i.directiveName == 'ngForOf');
            if (ngForOfBinding) {
                const bindingType = new expression_type_1.AstType(info.members, info.query, {}).getType(ngForOfBinding.value);
                if (bindingType) {
                    const result = info.query.getElementType(bindingType);
                    if (result) {
                        return result;
                    }
                }
            }
        }
        // We can't do better, return any
        return info.query.getBuiltinType(symbols_1.BuiltinType.Any);
    }
    function getEventDeclaration(info, includeEvent) {
        let result = [];
        if (includeEvent) {
            // TODO: Determine the type of the event parameter based on the Observable<T> or EventEmitter<T>
            // of the event.
            result = [{ name: '$event', kind: 'variable', type: info.query.getBuiltinType(symbols_1.BuiltinType.Any) }];
        }
        return result;
    }
    function getExpressionScope(info, path, includeEvent) {
        let result = info.members;
        const references = getReferences(info);
        const variables = getVarDeclarations(info, path);
        const events = getEventDeclaration(info, includeEvent);
        if (references.length || variables.length || events.length) {
            const referenceTable = info.query.createSymbolTable(references);
            const variableTable = info.query.createSymbolTable(variables);
            const eventsTable = info.query.createSymbolTable(events);
            result = info.query.mergeSymbolTable([result, referenceTable, variableTable, eventsTable]);
        }
        return result;
    }
    exports.getExpressionScope = getExpressionScope;
    class ExpressionDiagnosticsVisitor extends compiler_1.RecursiveTemplateAstVisitor {
        constructor(info, getExpressionScope) {
            super();
            this.info = info;
            this.getExpressionScope = getExpressionScope;
            this.diagnostics = [];
            this.path = new compiler_1.AstPath([]);
        }
        visitDirective(ast, context) {
            // Override the default child visitor to ignore the host properties of a directive.
            if (ast.inputs && ast.inputs.length) {
                compiler_1.templateVisitAll(this, ast.inputs, context);
            }
        }
        visitBoundText(ast) {
            this.push(ast);
            this.diagnoseExpression(ast.value, ast.sourceSpan.start.offset, false);
            this.pop();
        }
        visitDirectiveProperty(ast) {
            this.push(ast);
            this.diagnoseExpression(ast.value, this.attributeValueLocation(ast), false);
            this.pop();
        }
        visitElementProperty(ast) {
            this.push(ast);
            this.diagnoseExpression(ast.value, this.attributeValueLocation(ast), false);
            this.pop();
        }
        visitEvent(ast) {
            this.push(ast);
            this.diagnoseExpression(ast.handler, this.attributeValueLocation(ast), true);
            this.pop();
        }
        visitVariable(ast) {
            const directive = this.directiveSummary;
            if (directive && ast.value) {
                const context = this.info.query.getTemplateContext(directive.type.reference);
                if (context && !context.has(ast.value)) {
                    if (ast.value === '$implicit') {
                        this.reportError('The template context does not have an implicit value', spanOf(ast.sourceSpan));
                    }
                    else {
                        this.reportError(`The template context does not defined a member called '${ast.value}'`, spanOf(ast.sourceSpan));
                    }
                }
            }
        }
        visitElement(ast, context) {
            this.push(ast);
            super.visitElement(ast, context);
            this.pop();
        }
        visitEmbeddedTemplate(ast, context) {
            const previousDirectiveSummary = this.directiveSummary;
            this.push(ast);
            // Find directive that references this template
            this.directiveSummary =
                ast.directives.map(d => d.directive).find(d => hasTemplateReference(d.type));
            // Process children
            super.visitEmbeddedTemplate(ast, context);
            this.pop();
            this.directiveSummary = previousDirectiveSummary;
        }
        attributeValueLocation(ast) {
            const path = compiler_1.findNode(this.info.htmlAst, ast.sourceSpan.start.offset);
            const last = path.tail;
            if (last instanceof compiler_1.Attribute && last.valueSpan) {
                // Add 1 for the quote.
                return last.valueSpan.start.offset + 1;
            }
            return ast.sourceSpan.start.offset;
        }
        diagnoseExpression(ast, offset, includeEvent) {
            const scope = this.getExpressionScope(this.path, includeEvent);
            this.diagnostics.push(...getExpressionDiagnostics(scope, ast, this.info.query, {
                event: includeEvent
            }).map(d => ({
                span: offsetSpan(d.ast.span, offset + this.info.offset),
                kind: d.kind,
                message: d.message
            })));
        }
        push(ast) { this.path.push(ast); }
        pop() { this.path.pop(); }
        reportError(message, span) {
            if (span) {
                this.diagnostics.push({ span: offsetSpan(span, this.info.offset), kind: expression_type_1.DiagnosticKind.Error, message });
            }
        }
        reportWarning(message, span) {
            this.diagnostics.push({ span: offsetSpan(span, this.info.offset), kind: expression_type_1.DiagnosticKind.Warning, message });
        }
    }
    function hasTemplateReference(type) {
        if (type.diDeps) {
            for (let diDep of type.diDeps) {
                if (diDep.token && diDep.token.identifier &&
                    compiler_1.identifierName(diDep.token.identifier) == 'TemplateRef')
                    return true;
            }
        }
        return false;
    }
    function offsetSpan(span, amount) {
        return { start: span.start + amount, end: span.end + amount };
    }
    function spanOf(sourceSpan) {
        return { start: sourceSpan.start.offset, end: sourceSpan.end.offset };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwcmVzc2lvbl9kaWFnbm9zdGljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvZGlhZ25vc3RpY3MvZXhwcmVzc2lvbl9kaWFnbm9zdGljcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILGdEQUFpWjtJQUVqWiwyRkFBd0c7SUFDeEcsMkVBQTZHO0lBaUI3RyxTQUFnQixnQ0FBZ0MsQ0FBQyxJQUE0QjtRQUUzRSxNQUFNLE9BQU8sR0FBRyxJQUFJLDRCQUE0QixDQUM1QyxJQUFJLEVBQUUsQ0FBQyxJQUFxQixFQUFFLFlBQXFCLEVBQUUsRUFBRSxDQUM3QyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDNUQsMkJBQWdCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM1QyxPQUFPLE9BQU8sQ0FBQyxXQUFXLENBQUM7SUFDN0IsQ0FBQztJQVBELDRFQU9DO0lBRUQsU0FBZ0Isd0JBQXdCLENBQ3BDLEtBQWtCLEVBQUUsR0FBUSxFQUFFLEtBQWtCLEVBQ2hELFVBQXdDLEVBQUU7UUFDNUMsTUFBTSxRQUFRLEdBQUcsSUFBSSx5QkFBTyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDcEQsUUFBUSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3QixPQUFPLFFBQVEsQ0FBQyxXQUFXLENBQUM7SUFDOUIsQ0FBQztJQU5ELDREQU1DO0lBRUQsU0FBUyxhQUFhLENBQUMsSUFBNEI7UUFDakQsTUFBTSxNQUFNLEdBQXdCLEVBQUUsQ0FBQztRQUV2QyxTQUFTLGlCQUFpQixDQUFDLFVBQTBCO1lBQ25ELEtBQUssTUFBTSxTQUFTLElBQUksVUFBVSxFQUFFO2dCQUNsQyxJQUFJLElBQUks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SSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUM3QixJQUFJLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVO29CQUNyQyx5QkFBYyxDQUFDLEtBQUssQ0FBQyxLQUFPLENBQUMsVUFBWSxDQUFDLElBQUksYUFBYTtvQkFDN0QsT0FBTyxJQUFJLENBQUM7YUFDZjtTQUNGO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsU0FBUyxVQUFVLENBQUMsSUFBVSxFQUFFLE1BQWM7UUFDNUMsT0FBTyxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxNQUFNLEVBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRUQsU0FBUyxNQUFNLENBQUMsVUFBMkI7UUFDekMsT0FBTyxFQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUMsQ0FBQztJQUN0RSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FTVCwgQXN0UGF0aCwgQXR0cmlidXRlLCBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0LCBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCwgQm91bmRFdmVudEFzdCwgQm91bmRUZXh0QXN0LCBDb21waWxlRGlyZWN0aXZlU3VtbWFyeSwgQ29tcGlsZVR5cGVNZXRhZGF0YSwgRGlyZWN0aXZlQXN0LCBFbGVtZW50QXN0LCBFbWJlZGRlZFRlbXBsYXRlQXN0LCBOb2RlLCBQYXJzZVNvdXJjZVNwYW4sIFJlY3Vyc2l2ZVRlbXBsYXRlQXN0VmlzaXRvciwgUmVmZXJlbmNlQXN0LCBUZW1wbGF0ZUFzdCwgVGVtcGxhdGVBc3RQYXRoLCBWYXJpYWJsZUFzdCwgZmluZE5vZGUsIGlkZW50aWZpZXJOYW1lLCB0ZW1wbGF0ZVZpc2l0QWxsLCB0b2tlblJlZmVyZW5jZX0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuXG5pbXBvcnQge0FzdFR5cGUsIERpYWdub3N0aWNLaW5kLCBFeHByZXNzaW9uRGlhZ25vc3RpY3NDb250ZXh0LCBUeXBlRGlhZ25vc3RpY30gZnJvbSAnLi9leHByZXNzaW9uX3R5cGUnO1xuaW1wb3J0IHtCdWlsdGluVHlwZSwgRGVmaW5pdGlvbiwgU3BhbiwgU3ltYm9sLCBTeW1ib2xEZWNsYXJhdGlvbiwgU3ltYm9sUXVlcnksIFN5bWJvbFRhYmxlfSBmcm9tICcuL3N5bWJvbHMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIERpYWdub3N0aWNUZW1wbGF0ZUluZm8ge1xuICBmaWxlTmFtZT86IHN0cmluZztcbiAgb2Zmc2V0OiBudW1iZXI7XG4gIHF1ZXJ5OiBTeW1ib2xRdWVyeTtcbiAgbWVtYmVyczogU3ltYm9sVGFibGU7XG4gIGh0bWxBc3Q6IE5vZGVbXTtcbiAgdGVtcGxhdGVBc3Q6IFRlbXBsYXRlQXN0W107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXhwcmVzc2lvbkRpYWdub3N0aWMge1xuICBtZXNzYWdlOiBzdHJpbmc7XG4gIHNwYW46IFNwYW47XG4gIGtpbmQ6IERpYWdub3N0aWNLaW5kO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGVtcGxhdGVFeHByZXNzaW9uRGlhZ25vc3RpY3MoaW5mbzogRGlhZ25vc3RpY1RlbXBsYXRlSW5mbyk6XG4gICAgRXhwcmVzc2lvbkRpYWdub3N0aWNbXSB7XG4gIGNvbnN0IHZpc2l0b3IgPSBuZXcgRXhwcmVzc2lvbkRpYWdub3N0aWNzVmlzaXRvcihcbiAgICAgIGluZm8sIChwYXRoOiBUZW1wbGF0ZUFzdFBhdGgsIGluY2x1ZGVFdmVudDogYm9vbGVhbikgPT5cbiAgICAgICAgICAgICAgICBnZXRFeHByZXNzaW9uU2NvcGUoaW5mbywgcGF0aCwgaW5jbHVkZUV2ZW50KSk7XG4gIHRlbXBsYXRlVmlzaXRBbGwodmlzaXRvciwgaW5mby50ZW1wbGF0ZUFzdCk7XG4gIHJldHVybiB2aXNpdG9yLmRpYWdub3N0aWNzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXhwcmVzc2lvbkRpYWdub3N0aWNzKFxuICAgIHNjb3BlOiBTeW1ib2xUYWJsZSwgYXN0OiBBU1QsIHF1ZXJ5OiBTeW1ib2xRdWVyeSxcbiAgICBjb250ZXh0OiBFeHByZXNzaW9uRGlhZ25vc3RpY3NDb250ZXh0ID0ge30pOiBUeXBlRGlhZ25vc3RpY1tdIHtcbiAgY29uc3QgYW5hbHl6ZXIgPSBuZXcgQXN0VHlwZShzY29wZSwgcXVlcnksIGNvbnRleHQpO1xuICBhbmFseXplci5nZXREaWFnbm9zdGljcyhhc3QpO1xuICByZXR1cm4gYW5hbHl6ZXIuZGlhZ25vc3RpY3M7XG59XG5cbmZ1bmN0aW9uIGdldFJlZmVyZW5jZXMoaW5mbzogRGlhZ25vc3RpY1RlbXBsYXRlSW5mbyk6IFN5bWJvbERlY2xhcmF0aW9uW10ge1xuICBjb25zdCByZXN1bHQ6IFN5bWJvbERlY2xhcmF0aW9uW10gPSBbXTtcblxuICBmdW5jdGlvbiBwcm9jZXNzUmVmZXJlbmNlcyhyZWZlcmVuY2VzOiBSZWZlcmVuY2VBc3RbXSkge1xuICAgIGZvciAoY29uc3QgcmVmZXJlbmNlIG9mIHJlZmVyZW5jZXMpIHtcbiAgICAgIGxldCB0eXBlOiBTeW1ib2x8dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgICAgaWYgKHJlZmVyZW5jZS52YWx1ZSkge1xuICAgICAgICB0eXBlID0gaW5mby5xdWVyeS5nZXRUeXBlU3ltYm9sKHRva2VuUmVmZXJlbmNlKHJlZmVyZW5jZS52YWx1ZSkpO1xuICAgICAgfVxuICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICBuYW1lOiByZWZlcmVuY2UubmFtZSxcbiAgICAgICAga2luZDogJ3JlZmVyZW5jZScsXG4gICAgICAgIHR5cGU6IHR5cGUgfHwgaW5mby5xdWVyeS5nZXRCdWlsdGluVHlwZShCdWlsdGluVHlwZS5BbnkpLFxuICAgICAgICBnZXQgZGVmaW5pdGlvbigpIHsgcmV0dXJuIGdldERlZmluaXRpb25PZihpbmZvLCByZWZlcmVuY2UpOyB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBjb25zdCB2aXNpdG9yID0gbmV3IGNsYXNzIGV4dGVuZHMgUmVjdXJzaXZlVGVtcGxhdGVBc3RWaXNpdG9yIHtcbiAgICB2aXNpdEVtYmVkZGVkVGVtcGxhdGUoYXN0OiBFbWJlZGRlZFRlbXBsYXRlQXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgICAgc3VwZXIudmlzaXRFbWJlZGRlZFRlbXBsYXRlKGFzdCwgY29udGV4dCk7XG4gICAgICBwcm9jZXNzUmVmZXJlbmNlcyhhc3QucmVmZXJlbmNlcyk7XG4gICAgfVxuICAgIHZpc2l0RWxlbWVudChhc3Q6IEVsZW1lbnRBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgICBzdXBlci52aXNpdEVsZW1lbnQoYXN0LCBjb250ZXh0KTtcbiAgICAgIHByb2Nlc3NSZWZlcmVuY2VzKGFzdC5yZWZlcmVuY2VzKTtcbiAgICB9XG4gIH07XG5cbiAgdGVtcGxhdGVWaXNpdEFsbCh2aXNpdG9yLCBpbmZvLnRlbXBsYXRlQXN0KTtcblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBnZXREZWZpbml0aW9uT2YoaW5mbzogRGlhZ25vc3RpY1RlbXBsYXRlSW5mbywgYXN0OiBUZW1wbGF0ZUFzdCk6IERlZmluaXRpb258dW5kZWZpbmVkIHtcbiAgaWYgKGluZm8uZmlsZU5hbWUpIHtcbiAgICBjb25zdCB0ZW1wbGF0ZU9mZnNldCA9IGluZm8ub2Zmc2V0O1xuICAgIHJldHVybiBbe1xuICAgICAgZmlsZU5hbWU6IGluZm8uZmlsZU5hbWUsXG4gICAgICBzcGFuOiB7XG4gICAgICAgIHN0YXJ0OiBhc3Quc291cmNlU3Bhbi5zdGFydC5vZmZzZXQgKyB0ZW1wbGF0ZU9mZnNldCxcbiAgICAgICAgZW5kOiBhc3Quc291cmNlU3Bhbi5lbmQub2Zmc2V0ICsgdGVtcGxhdGVPZmZzZXRcbiAgICAgIH1cbiAgICB9XTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRWYXJEZWNsYXJhdGlvbnMoXG4gICAgaW5mbzogRGlhZ25vc3RpY1RlbXBsYXRlSW5mbywgcGF0aDogVGVtcGxhdGVBc3RQYXRoKTogU3ltYm9sRGVjbGFyYXRpb25bXSB7XG4gIGNvbnN0IHJlc3VsdDogU3ltYm9sRGVjbGFyYXRpb25bXSA9IFtdO1xuXG4gIGxldCBjdXJyZW50ID0gcGF0aC50YWlsO1xuICB3aGlsZSAoY3VycmVudCkge1xuICAgIGlmIChjdXJyZW50IGluc3RhbmNlb2YgRW1iZWRkZWRUZW1wbGF0ZUFzdCkge1xuICAgICAgZm9yIChjb25zdCB2YXJpYWJsZSBvZiBjdXJyZW50LnZhcmlhYmxlcykge1xuICAgICAgICBjb25zdCBuYW1lID0gdmFyaWFibGUubmFtZTtcblxuICAgICAgICAvLyBGaW5kIHRoZSBmaXJzdCBkaXJlY3RpdmUgd2l0aCBhIGNvbnRleHQuXG4gICAgICAgIGNvbnN0IGNvbnRleHQgPVxuICAgICAgICAgICAgY3VycmVudC5kaXJlY3RpdmVzLm1hcChkID0+IGluZm8ucXVlcnkuZ2V0VGVtcGxhdGVDb250ZXh0KGQuZGlyZWN0aXZlLnR5cGUucmVmZXJlbmNlKSlcbiAgICAgICAgICAgICAgICAuZmluZChjID0+ICEhYyk7XG5cbiAgICAgICAgLy8gRGV0ZXJtaW5lIHRoZSB0eXBlIG9mIHRoZSBjb250ZXh0IGZpZWxkIHJlZmVyZW5jZWQgYnkgdmFyaWFibGUudmFsdWUuXG4gICAgICAgIGxldCB0eXBlOiBTeW1ib2x8dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAoY29udGV4dCkge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gY29udGV4dC5nZXQodmFyaWFibGUudmFsdWUpO1xuICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgdHlwZSA9IHZhbHVlLnR5cGUgITtcbiAgICAgICAgICAgIGxldCBraW5kID0gaW5mby5xdWVyeS5nZXRUeXBlS2luZCh0eXBlKTtcbiAgICAgICAgICAgIGlmIChraW5kID09PSBCdWlsdGluVHlwZS5BbnkgfHwga2luZCA9PSBCdWlsdGluVHlwZS5VbmJvdW5kKSB7XG4gICAgICAgICAgICAgIC8vIFRoZSBhbnkgdHlwZSBpcyBub3QgdmVyeSB1c2VmdWwgaGVyZS4gRm9yIHNwZWNpYWwgY2FzZXMsIHN1Y2ggYXMgbmdGb3IsIHdlIGNhbiBkb1xuICAgICAgICAgICAgICAvLyBiZXR0ZXIuXG4gICAgICAgICAgICAgIHR5cGUgPSByZWZpbmVkVmFyaWFibGVUeXBlKHR5cGUsIGluZm8sIGN1cnJlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIXR5cGUpIHtcbiAgICAgICAgICB0eXBlID0gaW5mby5xdWVyeS5nZXRCdWlsdGluVHlwZShCdWlsdGluVHlwZS5BbnkpO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgICAgICBuYW1lLFxuICAgICAgICAgIGtpbmQ6ICd2YXJpYWJsZScsIHR5cGUsIGdldCBkZWZpbml0aW9uKCkgeyByZXR1cm4gZ2V0RGVmaW5pdGlvbk9mKGluZm8sIHZhcmlhYmxlKTsgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgY3VycmVudCA9IHBhdGgucGFyZW50T2YoY3VycmVudCk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiByZWZpbmVkVmFyaWFibGVUeXBlKFxuICAgIHR5cGU6IFN5bWJvbCwgaW5mbzogRGlhZ25vc3RpY1RlbXBsYXRlSW5mbywgdGVtcGxhdGVFbGVtZW50OiBFbWJlZGRlZFRlbXBsYXRlQXN0KTogU3ltYm9sIHtcbiAgLy8gU3BlY2lhbCBjYXNlIHRoZSBuZ0ZvciBkaXJlY3RpdmVcbiAgY29uc3QgbmdGb3JEaXJlY3RpdmUgPSB0ZW1wbGF0ZUVsZW1lbnQuZGlyZWN0aXZlcy5maW5kKGQgPT4ge1xuICAgIGNvbnN0IG5hbWUgPSBpZGVudGlmaWVyTmFtZShkLmRpcmVjdGl2ZS50eXBlKTtcbiAgICByZXR1cm4gbmFtZSA9PSAnTmdGb3InIHx8IG5hbWUgPT0gJ05nRm9yT2YnO1xuICB9KTtcbiAgaWYgKG5nRm9yRGlyZWN0aXZlKSB7XG4gICAgY29uc3QgbmdGb3JPZkJpbmRpbmcgPSBuZ0ZvckRpcmVjdGl2ZS5pbnB1dHMuZmluZChpID0+IGkuZGlyZWN0aXZlTmFtZSA9PSAnbmdGb3JPZicpO1xuICAgIGlmIChuZ0Zvck9mQmluZGluZykge1xuICAgICAgY29uc3QgYmluZGluZ1R5cGUgPSBuZXcgQXN0VHlwZShpbmZvLm1lbWJlcnMsIGluZm8ucXVlcnksIHt9KS5nZXRUeXBlKG5nRm9yT2ZCaW5kaW5nLnZhbHVlKTtcbiAgICAgIGlmIChiaW5kaW5nVHlwZSkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBpbmZvLnF1ZXJ5LmdldEVsZW1lbnRUeXBlKGJpbmRpbmdUeXBlKTtcbiAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBXZSBjYW4ndCBkbyBiZXR0ZXIsIHJldHVybiBhbnlcbiAgcmV0dXJuIGluZm8ucXVlcnkuZ2V0QnVpbHRpblR5cGUoQnVpbHRpblR5cGUuQW55KTtcbn1cblxuZnVuY3Rpb24gZ2V0RXZlbnREZWNsYXJhdGlvbihpbmZvOiBEaWFnbm9zdGljVGVtcGxhdGVJbmZvLCBpbmNsdWRlRXZlbnQ/OiBib29sZWFuKSB7XG4gIGxldCByZXN1bHQ6IFN5bWJvbERlY2xhcmF0aW9uW10gPSBbXTtcbiAgaWYgKGluY2x1ZGVFdmVudCkge1xuICAgIC8vIFRPRE86IERldGVybWluZSB0aGUgdHlwZSBvZiB0aGUgZXZlbnQgcGFyYW1ldGVyIGJhc2VkIG9uIHRoZSBPYnNlcnZhYmxlPFQ+IG9yIEV2ZW50RW1pdHRlcjxUPlxuICAgIC8vIG9mIHRoZSBldmVudC5cbiAgICByZXN1bHQgPSBbe25hbWU6ICckZXZlbnQnLCBraW5kOiAndmFyaWFibGUnLCB0eXBlOiBpbmZvLnF1ZXJ5LmdldEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlLkFueSl9XTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXhwcmVzc2lvblNjb3BlKFxuICAgIGluZm86IERpYWdub3N0aWNUZW1wbGF0ZUluZm8sIHBhdGg6IFRlbXBsYXRlQXN0UGF0aCwgaW5jbHVkZUV2ZW50OiBib29sZWFuKTogU3ltYm9sVGFibGUge1xuICBsZXQgcmVzdWx0ID0gaW5mby5tZW1iZXJzO1xuICBjb25zdCByZWZlcmVuY2VzID0gZ2V0UmVmZXJlbmNlcyhpbmZvKTtcbiAgY29uc3QgdmFyaWFibGVzID0gZ2V0VmFyRGVjbGFyYXRpb25zKGluZm8sIHBhdGgpO1xuICBjb25zdCBldmVudHMgPSBnZXRFdmVudERlY2xhcmF0aW9uKGluZm8sIGluY2x1ZGVFdmVudCk7XG4gIGlmIChyZWZlcmVuY2VzLmxlbmd0aCB8fCB2YXJpYWJsZXMubGVuZ3RoIHx8IGV2ZW50cy5sZW5ndGgpIHtcbiAgICBjb25zdCByZWZlcmVuY2VUYWJsZSA9IGluZm8ucXVlcnkuY3JlYXRlU3ltYm9sVGFibGUocmVmZXJlbmNlcyk7XG4gICAgY29uc3QgdmFyaWFibGVUYWJsZSA9IGluZm8ucXVlcnkuY3JlYXRlU3ltYm9sVGFibGUodmFyaWFibGVzKTtcbiAgICBjb25zdCBldmVudHNUYWJsZSA9IGluZm8ucXVlcnkuY3JlYXRlU3ltYm9sVGFibGUoZXZlbnRzKTtcbiAgICByZXN1bHQgPSBpbmZvLnF1ZXJ5Lm1lcmdlU3ltYm9sVGFibGUoW3Jlc3VsdCwgcmVmZXJlbmNlVGFibGUsIHZhcmlhYmxlVGFibGUsIGV2ZW50c1RhYmxlXSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuY2xhc3MgRXhwcmVzc2lvbkRpYWdub3N0aWNzVmlzaXRvciBleHRlbmRzIFJlY3Vyc2l2ZVRlbXBsYXRlQXN0VmlzaXRvciB7XG4gIHByaXZhdGUgcGF0aDogVGVtcGxhdGVBc3RQYXRoO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBkaXJlY3RpdmVTdW1tYXJ5ICE6IENvbXBpbGVEaXJlY3RpdmVTdW1tYXJ5O1xuXG4gIGRpYWdub3N0aWNzOiBFeHByZXNzaW9uRGlhZ25vc3RpY1tdID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGluZm86IERpYWdub3N0aWNUZW1wbGF0ZUluZm8sXG4gICAgICBwcml2YXRlIGdldEV4cHJlc3Npb25TY29wZTogKHBhdGg6IFRlbXBsYXRlQXN0UGF0aCwgaW5jbHVkZUV2ZW50OiBib29sZWFuKSA9PiBTeW1ib2xUYWJsZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5wYXRoID0gbmV3IEFzdFBhdGg8VGVtcGxhdGVBc3Q+KFtdKTtcbiAgfVxuXG4gIHZpc2l0RGlyZWN0aXZlKGFzdDogRGlyZWN0aXZlQXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIC8vIE92ZXJyaWRlIHRoZSBkZWZhdWx0IGNoaWxkIHZpc2l0b3IgdG8gaWdub3JlIHRoZSBob3N0IHByb3BlcnRpZXMgb2YgYSBkaXJlY3RpdmUuXG4gICAgaWYgKGFzdC5pbnB1dHMgJiYgYXN0LmlucHV0cy5sZW5ndGgpIHtcbiAgICAgIHRlbXBsYXRlVmlzaXRBbGwodGhpcywgYXN0LmlucHV0cywgY29udGV4dCk7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRCb3VuZFRleHQoYXN0OiBCb3VuZFRleHRBc3QpOiB2b2lkIHtcbiAgICB0aGlzLnB1c2goYXN0KTtcbiAgICB0aGlzLmRpYWdub3NlRXhwcmVzc2lvbihhc3QudmFsdWUsIGFzdC5zb3VyY2VTcGFuLnN0YXJ0Lm9mZnNldCwgZmFsc2UpO1xuICAgIHRoaXMucG9wKCk7XG4gIH1cblxuICB2aXNpdERpcmVjdGl2ZVByb3BlcnR5KGFzdDogQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdCk6IHZvaWQge1xuICAgIHRoaXMucHVzaChhc3QpO1xuICAgIHRoaXMuZGlhZ25vc2VFeHByZXNzaW9uKGFzdC52YWx1ZSwgdGhpcy5hdHRyaWJ1dGVWYWx1ZUxvY2F0aW9uKGFzdCksIGZhbHNlKTtcbiAgICB0aGlzLnBvcCgpO1xuICB9XG5cbiAgdmlzaXRFbGVtZW50UHJvcGVydHkoYXN0OiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCk6IHZvaWQge1xuICAgIHRoaXMucHVzaChhc3QpO1xuICAgIHRoaXMuZGlhZ25vc2VFeHByZXNzaW9uKGFzdC52YWx1ZSwgdGhpcy5hdHRyaWJ1dGVWYWx1ZUxvY2F0aW9uKGFzdCksIGZhbHNlKTtcbiAgICB0aGlzLnBvcCgpO1xuICB9XG5cbiAgdmlzaXRFdmVudChhc3Q6IEJvdW5kRXZlbnRBc3QpOiB2b2lkIHtcbiAgICB0aGlzLnB1c2goYXN0KTtcbiAgICB0aGlzLmRpYWdub3NlRXhwcmVzc2lvbihhc3QuaGFuZGxlciwgdGhpcy5hdHRyaWJ1dGVWYWx1ZUxvY2F0aW9uKGFzdCksIHRydWUpO1xuICAgIHRoaXMucG9wKCk7XG4gIH1cblxuICB2aXNpdFZhcmlhYmxlKGFzdDogVmFyaWFibGVBc3QpOiB2b2lkIHtcbiAgICBjb25zdCBkaXJlY3RpdmUgPSB0aGlzLmRpcmVjdGl2ZVN1bW1hcnk7XG4gICAgaWYgKGRpcmVjdGl2ZSAmJiBhc3QudmFsdWUpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzLmluZm8ucXVlcnkuZ2V0VGVtcGxhdGVDb250ZXh0KGRpcmVjdGl2ZS50eXBlLnJlZmVyZW5jZSkgITtcbiAgICAgIGlmIChjb250ZXh0ICYmICFjb250ZXh0Lmhhcyhhc3QudmFsdWUpKSB7XG4gICAgICAgIGlmIChhc3QudmFsdWUgPT09ICckaW1wbGljaXQnKSB7XG4gICAgICAgICAgdGhpcy5yZXBvcnRFcnJvcihcbiAgICAgICAgICAgICAgJ1RoZSB0ZW1wbGF0ZSBjb250ZXh0IGRvZXMgbm90IGhhdmUgYW4gaW1wbGljaXQgdmFsdWUnLCBzcGFuT2YoYXN0LnNvdXJjZVNwYW4pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnJlcG9ydEVycm9yKFxuICAgICAgICAgICAgICBgVGhlIHRlbXBsYXRlIGNvbnRleHQgZG9lcyBub3QgZGVmaW5lZCBhIG1lbWJlciBjYWxsZWQgJyR7YXN0LnZhbHVlfSdgLFxuICAgICAgICAgICAgICBzcGFuT2YoYXN0LnNvdXJjZVNwYW4pKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHZpc2l0RWxlbWVudChhc3Q6IEVsZW1lbnRBc3QsIGNvbnRleHQ6IGFueSk6IHZvaWQge1xuICAgIHRoaXMucHVzaChhc3QpO1xuICAgIHN1cGVyLnZpc2l0RWxlbWVudChhc3QsIGNvbnRleHQpO1xuICAgIHRoaXMucG9wKCk7XG4gIH1cblxuICB2aXNpdEVtYmVkZGVkVGVtcGxhdGUoYXN0OiBFbWJlZGRlZFRlbXBsYXRlQXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGNvbnN0IHByZXZpb3VzRGlyZWN0aXZlU3VtbWFyeSA9IHRoaXMuZGlyZWN0aXZlU3VtbWFyeTtcblxuICAgIHRoaXMucHVzaChhc3QpO1xuXG4gICAgLy8gRmluZCBkaXJlY3RpdmUgdGhhdCByZWZlcmVuY2VzIHRoaXMgdGVtcGxhdGVcbiAgICB0aGlzLmRpcmVjdGl2ZVN1bW1hcnkgPVxuICAgICAgICBhc3QuZGlyZWN0aXZlcy5tYXAoZCA9PiBkLmRpcmVjdGl2ZSkuZmluZChkID0+IGhhc1RlbXBsYXRlUmVmZXJlbmNlKGQudHlwZSkpICE7XG5cbiAgICAvLyBQcm9jZXNzIGNoaWxkcmVuXG4gICAgc3VwZXIudmlzaXRFbWJlZGRlZFRlbXBsYXRlKGFzdCwgY29udGV4dCk7XG5cbiAgICB0aGlzLnBvcCgpO1xuXG4gICAgdGhpcy5kaXJlY3RpdmVTdW1tYXJ5ID0gcHJldmlvdXNEaXJlY3RpdmVTdW1tYXJ5O1xuICB9XG5cbiAgcHJpdmF0ZSBhdHRyaWJ1dGVWYWx1ZUxvY2F0aW9uKGFzdDogVGVtcGxhdGVBc3QpIHtcbiAgICBjb25zdCBwYXRoID0gZmluZE5vZGUodGhpcy5pbmZvLmh0bWxBc3QsIGFzdC5zb3VyY2VTcGFuLnN0YXJ0Lm9mZnNldCk7XG4gICAgY29uc3QgbGFzdCA9IHBhdGgudGFpbDtcbiAgICBpZiAobGFzdCBpbnN0YW5jZW9mIEF0dHJpYnV0ZSAmJiBsYXN0LnZhbHVlU3Bhbikge1xuICAgICAgLy8gQWRkIDEgZm9yIHRoZSBxdW90ZS5cbiAgICAgIHJldHVybiBsYXN0LnZhbHVlU3Bhbi5zdGFydC5vZmZzZXQgKyAxO1xuICAgIH1cbiAgICByZXR1cm4gYXN0LnNvdXJjZVNwYW4uc3RhcnQub2Zmc2V0O1xuICB9XG5cbiAgcHJpdmF0ZSBkaWFnbm9zZUV4cHJlc3Npb24oYXN0OiBBU1QsIG9mZnNldDogbnVtYmVyLCBpbmNsdWRlRXZlbnQ6IGJvb2xlYW4pIHtcbiAgICBjb25zdCBzY29wZSA9IHRoaXMuZ2V0RXhwcmVzc2lvblNjb3BlKHRoaXMucGF0aCwgaW5jbHVkZUV2ZW50KTtcbiAgICB0aGlzLmRpYWdub3N0aWNzLnB1c2goLi4uZ2V0RXhwcmVzc2lvbkRpYWdub3N0aWNzKHNjb3BlLCBhc3QsIHRoaXMuaW5mby5xdWVyeSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50OiBpbmNsdWRlRXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSkubWFwKGQgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3Bhbjogb2Zmc2V0U3BhbihkLmFzdC5zcGFuLCBvZmZzZXQgKyB0aGlzLmluZm8ub2Zmc2V0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZDogZC5raW5kLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBkLm1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKSk7XG4gIH1cblxuICBwcml2YXRlIHB1c2goYXN0OiBUZW1wbGF0ZUFzdCkgeyB0aGlzLnBhdGgucHVzaChhc3QpOyB9XG5cbiAgcHJpdmF0ZSBwb3AoKSB7IHRoaXMucGF0aC5wb3AoKTsgfVxuXG4gIHByaXZhdGUgcmVwb3J0RXJyb3IobWVzc2FnZTogc3RyaW5nLCBzcGFuOiBTcGFufHVuZGVmaW5lZCkge1xuICAgIGlmIChzcGFuKSB7XG4gICAgICB0aGlzLmRpYWdub3N0aWNzLnB1c2goXG4gICAgICAgICAge3NwYW46IG9mZnNldFNwYW4oc3BhbiwgdGhpcy5pbmZvLm9mZnNldCksIGtpbmQ6IERpYWdub3N0aWNLaW5kLkVycm9yLCBtZXNzYWdlfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZXBvcnRXYXJuaW5nKG1lc3NhZ2U6IHN0cmluZywgc3BhbjogU3Bhbikge1xuICAgIHRoaXMuZGlhZ25vc3RpY3MucHVzaChcbiAgICAgICAge3NwYW46IG9mZnNldFNwYW4oc3BhbiwgdGhpcy5pbmZvLm9mZnNldCksIGtpbmQ6IERpYWdub3N0aWNLaW5kLldhcm5pbmcsIG1lc3NhZ2V9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBoYXNUZW1wbGF0ZVJlZmVyZW5jZSh0eXBlOiBDb21waWxlVHlwZU1ldGFkYXRhKTogYm9vbGVhbiB7XG4gIGlmICh0eXBlLmRpRGVwcykge1xuICAgIGZvciAobGV0IGRpRGVwIG9mIHR5cGUuZGlEZXBzKSB7XG4gICAgICBpZiAoZGlEZXAudG9rZW4gJiYgZGlEZXAudG9rZW4uaWRlbnRpZmllciAmJlxuICAgICAgICAgIGlkZW50aWZpZXJOYW1lKGRpRGVwLnRva2VuICEuaWRlbnRpZmllciAhKSA9PSAnVGVtcGxhdGVSZWYnKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBvZmZzZXRTcGFuKHNwYW46IFNwYW4sIGFtb3VudDogbnVtYmVyKTogU3BhbiB7XG4gIHJldHVybiB7c3RhcnQ6IHNwYW4uc3RhcnQgKyBhbW91bnQsIGVuZDogc3Bhbi5lbmQgKyBhbW91bnR9O1xufVxuXG5mdW5jdGlvbiBzcGFuT2Yoc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKTogU3BhbiB7XG4gIHJldHVybiB7c3RhcnQ6IHNvdXJjZVNwYW4uc3RhcnQub2Zmc2V0LCBlbmQ6IHNvdXJjZVNwYW4uZW5kLm9mZnNldH07XG59Il19