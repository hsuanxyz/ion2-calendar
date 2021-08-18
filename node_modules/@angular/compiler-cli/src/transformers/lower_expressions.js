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
        define("@angular/compiler-cli/src/transformers/lower_expressions", ["require", "exports", "@angular/compiler", "typescript", "@angular/compiler-cli/src/metadata/index"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const compiler_1 = require("@angular/compiler");
    const ts = require("typescript");
    const index_1 = require("@angular/compiler-cli/src/metadata/index");
    function toMap(items, select) {
        return new Map(items.map(i => [select(i), i]));
    }
    // We will never lower expressions in a nested lexical scope so avoid entering them.
    // This also avoids a bug in TypeScript 2.3 where the lexical scopes get out of sync
    // when using visitEachChild.
    function isLexicalScope(node) {
        switch (node.kind) {
            case ts.SyntaxKind.ArrowFunction:
            case ts.SyntaxKind.FunctionExpression:
            case ts.SyntaxKind.FunctionDeclaration:
            case ts.SyntaxKind.ClassExpression:
            case ts.SyntaxKind.ClassDeclaration:
            case ts.SyntaxKind.FunctionType:
            case ts.SyntaxKind.TypeLiteral:
            case ts.SyntaxKind.ArrayType:
                return true;
        }
        return false;
    }
    function transformSourceFile(sourceFile, requests, context) {
        const inserts = [];
        // Calculate the range of interesting locations. The transform will only visit nodes in this
        // range to improve the performance on large files.
        const locations = Array.from(requests.keys());
        const min = Math.min(...locations);
        const max = Math.max(...locations);
        // Visit nodes matching the request and synthetic nodes added by tsickle
        function shouldVisit(pos, end) {
            return (pos <= max && end >= min) || pos == -1;
        }
        function visitSourceFile(sourceFile) {
            function topLevelStatement(node) {
                const declarations = [];
                function visitNode(node) {
                    // Get the original node before tsickle
                    const { pos, end, kind, parent: originalParent } = ts.getOriginalNode(node);
                    const nodeRequest = requests.get(pos);
                    if (nodeRequest && nodeRequest.kind == kind && nodeRequest.end == end) {
                        // This node is requested to be rewritten as a reference to the exported name.
                        if (originalParent && originalParent.kind === ts.SyntaxKind.VariableDeclaration) {
                            // As the value represents the whole initializer of a variable declaration,
                            // just refer to that variable. This e.g. helps to preserve closure comments
                            // at the right place.
                            const varParent = originalParent;
                            if (varParent.name.kind === ts.SyntaxKind.Identifier) {
                                const varName = varParent.name.text;
                                const exportName = nodeRequest.name;
                                declarations.push({
                                    name: exportName,
                                    node: ts.createIdentifier(varName),
                                    order: 1 /* AfterStmt */
                                });
                                return node;
                            }
                        }
                        // Record that the node needs to be moved to an exported variable with the given name
                        const exportName = nodeRequest.name;
                        declarations.push({ name: exportName, node, order: 0 /* BeforeStmt */ });
                        return ts.createIdentifier(exportName);
                    }
                    let result = node;
                    if (shouldVisit(pos, end) && !isLexicalScope(node)) {
                        result = ts.visitEachChild(node, visitNode, context);
                    }
                    return result;
                }
                // Get the original node before tsickle
                const { pos, end } = ts.getOriginalNode(node);
                let resultStmt;
                if (shouldVisit(pos, end)) {
                    resultStmt = ts.visitEachChild(node, visitNode, context);
                }
                else {
                    resultStmt = node;
                }
                if (declarations.length) {
                    inserts.push({ relativeTo: resultStmt, declarations });
                }
                return resultStmt;
            }
            let newStatements = sourceFile.statements.map(topLevelStatement);
            if (inserts.length) {
                // Insert the declarations relative to the rewritten statement that references them.
                const insertMap = toMap(inserts, i => i.relativeTo);
                const tmpStatements = [];
                newStatements.forEach(statement => {
                    const insert = insertMap.get(statement);
                    if (insert) {
                        const before = insert.declarations.filter(d => d.order === 0 /* BeforeStmt */);
                        if (before.length) {
                            tmpStatements.push(createVariableStatementForDeclarations(before));
                        }
                        tmpStatements.push(statement);
                        const after = insert.declarations.filter(d => d.order === 1 /* AfterStmt */);
                        if (after.length) {
                            tmpStatements.push(createVariableStatementForDeclarations(after));
                        }
                    }
                    else {
                        tmpStatements.push(statement);
                    }
                });
                // Insert an exports clause to export the declarations
                tmpStatements.push(ts.createExportDeclaration(
                /* decorators */ undefined, 
                /* modifiers */ undefined, ts.createNamedExports(inserts
                    .reduce((accumulator, insert) => [...accumulator, ...insert.declarations], [])
                    .map(declaration => ts.createExportSpecifier(
                /* propertyName */ undefined, declaration.name)))));
                newStatements = tmpStatements;
            }
            // Note: We cannot use ts.updateSourcefile here as
            // it does not work well with decorators.
            // See https://github.com/Microsoft/TypeScript/issues/17384
            const newSf = ts.getMutableClone(sourceFile);
            if (!(sourceFile.flags & ts.NodeFlags.Synthesized)) {
                newSf.flags &= ~ts.NodeFlags.Synthesized;
            }
            newSf.statements = ts.setTextRange(ts.createNodeArray(newStatements), sourceFile.statements);
            return newSf;
        }
        return visitSourceFile(sourceFile);
    }
    function createVariableStatementForDeclarations(declarations) {
        const varDecls = declarations.map(i => ts.createVariableDeclaration(i.name, /* type */ undefined, i.node));
        return ts.createVariableStatement(
        /* modifiers */ undefined, ts.createVariableDeclarationList(varDecls, ts.NodeFlags.Const));
    }
    function getExpressionLoweringTransformFactory(requestsMap, program) {
        // Return the factory
        return (context) => (sourceFile) => {
            // We need to use the original SourceFile for reading metadata, and not the transformed one.
            const originalFile = program.getSourceFile(sourceFile.fileName);
            if (originalFile) {
                const requests = requestsMap.getRequests(originalFile);
                if (requests && requests.size) {
                    return transformSourceFile(sourceFile, requests, context);
                }
            }
            return sourceFile;
        };
    }
    exports.getExpressionLoweringTransformFactory = getExpressionLoweringTransformFactory;
    function isEligibleForLowering(node) {
        if (node) {
            switch (node.kind) {
                case ts.SyntaxKind.SourceFile:
                case ts.SyntaxKind.Decorator:
                    // Lower expressions that are local to the module scope or
                    // in a decorator.
                    return true;
                case ts.SyntaxKind.ClassDeclaration:
                case ts.SyntaxKind.InterfaceDeclaration:
                case ts.SyntaxKind.EnumDeclaration:
                case ts.SyntaxKind.FunctionDeclaration:
                    // Don't lower expressions in a declaration.
                    return false;
                case ts.SyntaxKind.VariableDeclaration:
                    // Avoid lowering expressions already in an exported variable declaration
                    return (ts.getCombinedModifierFlags(node) &
                        ts.ModifierFlags.Export) == 0;
            }
            return isEligibleForLowering(node.parent);
        }
        return true;
    }
    function isPrimitive(value) {
        return Object(value) !== value;
    }
    function isRewritten(value) {
        return index_1.isMetadataGlobalReferenceExpression(value) && compiler_1.isLoweredSymbol(value.name);
    }
    function isLiteralFieldNamed(node, names) {
        if (node.parent && node.parent.kind == ts.SyntaxKind.PropertyAssignment) {
            const property = node.parent;
            if (property.parent && property.parent.kind == ts.SyntaxKind.ObjectLiteralExpression &&
                property.name && property.name.kind == ts.SyntaxKind.Identifier) {
                const propertyName = property.name;
                return names.has(propertyName.text);
            }
        }
        return false;
    }
    class LowerMetadataTransform {
        constructor(lowerableFieldNames) {
            this.requests = new Map();
            this.lowerableFieldNames = new Set(lowerableFieldNames);
        }
        // RequestMap
        getRequests(sourceFile) {
            let result = this.requests.get(sourceFile.fileName);
            if (!result) {
                // Force the metadata for this source file to be collected which
                // will recursively call start() populating the request map;
                this.cache.getMetadata(sourceFile);
                // If we still don't have the requested metadata, the file is not a module
                // or is a declaration file so return an empty map.
                result = this.requests.get(sourceFile.fileName) || new Map();
            }
            return result;
        }
        // MetadataTransformer
        connect(cache) { this.cache = cache; }
        start(sourceFile) {
            let identNumber = 0;
            const freshIdent = () => compiler_1.createLoweredSymbol(identNumber++);
            const requests = new Map();
            this.requests.set(sourceFile.fileName, requests);
            const replaceNode = (node) => {
                const name = freshIdent();
                requests.set(node.pos, { name, kind: node.kind, location: node.pos, end: node.end });
                return { __symbolic: 'reference', name };
            };
            const isExportedSymbol = (() => {
                let exportTable;
                return (node) => {
                    if (node.kind == ts.SyntaxKind.Identifier) {
                        const ident = node;
                        if (!exportTable) {
                            exportTable = createExportTableFor(sourceFile);
                        }
                        return exportTable.has(ident.text);
                    }
                    return false;
                };
            })();
            const isExportedPropertyAccess = (node) => {
                if (node.kind === ts.SyntaxKind.PropertyAccessExpression) {
                    const pae = node;
                    if (isExportedSymbol(pae.expression)) {
                        return true;
                    }
                }
                return false;
            };
            const hasLowerableParentCache = new Map();
            const shouldBeLowered = (node) => {
                if (node === undefined) {
                    return false;
                }
                let lowerable = false;
                if ((node.kind === ts.SyntaxKind.ArrowFunction ||
                    node.kind === ts.SyntaxKind.FunctionExpression) &&
                    isEligibleForLowering(node)) {
                    lowerable = true;
                }
                else if (isLiteralFieldNamed(node, this.lowerableFieldNames) && isEligibleForLowering(node) &&
                    !isExportedSymbol(node) && !isExportedPropertyAccess(node)) {
                    lowerable = true;
                }
                return lowerable;
            };
            const hasLowerableParent = (node) => {
                if (node === undefined) {
                    return false;
                }
                if (!hasLowerableParentCache.has(node)) {
                    hasLowerableParentCache.set(node, shouldBeLowered(node.parent) || hasLowerableParent(node.parent));
                }
                return hasLowerableParentCache.get(node);
            };
            const isLowerable = (node) => {
                if (node === undefined) {
                    return false;
                }
                return shouldBeLowered(node) && !hasLowerableParent(node);
            };
            return (value, node) => {
                if (!isPrimitive(value) && !isRewritten(value) && isLowerable(node)) {
                    return replaceNode(node);
                }
                return value;
            };
        }
    }
    exports.LowerMetadataTransform = LowerMetadataTransform;
    function createExportTableFor(sourceFile) {
        const exportTable = new Set();
        // Lazily collect all the exports from the source file
        ts.forEachChild(sourceFile, function scan(node) {
            switch (node.kind) {
                case ts.SyntaxKind.ClassDeclaration:
                case ts.SyntaxKind.FunctionDeclaration:
                case ts.SyntaxKind.InterfaceDeclaration:
                    if ((ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) != 0) {
                        const classDeclaration = node;
                        const name = classDeclaration.name;
                        if (name)
                            exportTable.add(name.text);
                    }
                    break;
                case ts.SyntaxKind.VariableStatement:
                    const variableStatement = node;
                    for (const declaration of variableStatement.declarationList.declarations) {
                        scan(declaration);
                    }
                    break;
                case ts.SyntaxKind.VariableDeclaration:
                    const variableDeclaration = node;
                    if ((ts.getCombinedModifierFlags(variableDeclaration) & ts.ModifierFlags.Export) != 0 &&
                        variableDeclaration.name.kind == ts.SyntaxKind.Identifier) {
                        const name = variableDeclaration.name;
                        exportTable.add(name.text);
                    }
                    break;
                case ts.SyntaxKind.ExportDeclaration:
                    const exportDeclaration = node;
                    const { moduleSpecifier, exportClause } = exportDeclaration;
                    if (!moduleSpecifier && exportClause) {
                        exportClause.elements.forEach(spec => { exportTable.add(spec.name.text); });
                    }
            }
        });
        return exportTable;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG93ZXJfZXhwcmVzc2lvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL3RyYW5zZm9ybWVycy9sb3dlcl9leHByZXNzaW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILGdEQUF1RTtJQUN2RSxpQ0FBaUM7SUFFakMsb0VBQTBJO0lBeUIxSSxTQUFTLEtBQUssQ0FBTyxLQUFVLEVBQUUsTUFBc0I7UUFDckQsT0FBTyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFRCxvRkFBb0Y7SUFDcEYsb0ZBQW9GO0lBQ3BGLDZCQUE2QjtJQUM3QixTQUFTLGNBQWMsQ0FBQyxJQUFhO1FBQ25DLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNqQixLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDO1lBQ2pDLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQztZQUN0QyxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUM7WUFDdkMsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQztZQUNuQyxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUM7WUFDcEMsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQztZQUNoQyxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDO1lBQy9CLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTO2dCQUMxQixPQUFPLElBQUksQ0FBQztTQUNmO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsU0FB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QUFtQixHQUFHLElBQThCLENBQUM7b0JBQzNELElBQUksQ0FBQyxFQUFFLENBQUMsd0JBQXdCLENBQUMsbUJBQW1CLENBQUMsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7d0JBQ2pGLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUU7d0JBQzdELE1BQU0sSUFBSSxHQUFHLG1CQUFtQixDQUFDLElBQXFCLENBQUM7d0JBQ3ZELFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUM1QjtvQkFDRCxNQUFNO2dCQUNSLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUI7b0JBQ2xDLE1BQU0saUJBQWlCLEdBQUcsSUFBNEIsQ0FBQztvQkFDdkQsTUFBTSxFQUFDLGVBQWUsRUFBRSxZQUFZLEVBQUMsR0FBRyxpQkFBaUIsQ0FBQztvQkFDMUQsSUFBSSxDQUFDLGVBQWUsSUFBSSxZQUFZLEVBQUU7d0JBQ3BDLFlBQVksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQzdFO2FBQ0o7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sV0FBVyxDQUFDO0lBQ3JCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Y3JlYXRlTG93ZXJlZFN5bWJvbCwgaXNMb3dlcmVkU3ltYm9sfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtDb2xsZWN0b3JPcHRpb25zLCBNZXRhZGF0YUNvbGxlY3RvciwgTWV0YWRhdGFWYWx1ZSwgTW9kdWxlTWV0YWRhdGEsIGlzTWV0YWRhdGFHbG9iYWxSZWZlcmVuY2VFeHByZXNzaW9ufSBmcm9tICcuLi9tZXRhZGF0YS9pbmRleCc7XG5pbXBvcnQge01ldGFkYXRhQ2FjaGUsIE1ldGFkYXRhVHJhbnNmb3JtZXIsIFZhbHVlVHJhbnNmb3JtfSBmcm9tICcuL21ldGFkYXRhX2NhY2hlJztcblxuZXhwb3J0IGludGVyZmFjZSBMb3dlcmluZ1JlcXVlc3Qge1xuICBraW5kOiB0cy5TeW50YXhLaW5kO1xuICBsb2NhdGlvbjogbnVtYmVyO1xuICBlbmQ6IG51bWJlcjtcbiAgbmFtZTogc3RyaW5nO1xufVxuXG5leHBvcnQgdHlwZSBSZXF1ZXN0TG9jYXRpb25NYXAgPSBNYXA8bnVtYmVyLCBMb3dlcmluZ1JlcXVlc3Q+O1xuXG5jb25zdCBlbnVtIERlY2xhcmF0aW9uT3JkZXIgeyBCZWZvcmVTdG10LCBBZnRlclN0bXQgfVxuXG5pbnRlcmZhY2UgRGVjbGFyYXRpb24ge1xuICBuYW1lOiBzdHJpbmc7XG4gIG5vZGU6IHRzLk5vZGU7XG4gIG9yZGVyOiBEZWNsYXJhdGlvbk9yZGVyO1xufVxuXG5pbnRlcmZhY2UgRGVjbGFyYXRpb25JbnNlcnQge1xuICBkZWNsYXJhdGlvbnM6IERlY2xhcmF0aW9uW107XG4gIHJlbGF0aXZlVG86IHRzLk5vZGU7XG59XG5cbmZ1bmN0aW9uIHRvTWFwPFQsIEs+KGl0ZW1zOiBUW10sIHNlbGVjdDogKGl0ZW06IFQpID0+IEspOiBNYXA8SywgVD4ge1xuICByZXR1cm4gbmV3IE1hcChpdGVtcy5tYXA8W0ssIFRdPihpID0+IFtzZWxlY3QoaSksIGldKSk7XG59XG5cbi8vIFdlIHdpbGwgbmV2ZXIgbG93ZXIgZXhwcmVzc2lvbnMgaW4gYSBuZXN0ZWQgbGV4aWNhbCBzY29wZSBzbyBhdm9pZCBlbnRlcmluZyB0aGVtLlxuLy8gVGhpcyBhbHNvIGF2b2lkcyBhIGJ1ZyBpbiBUeXBlU2NyaXB0IDIuMyB3aGVyZSB0aGUgbGV4aWNhbCBzY29wZXMgZ2V0IG91dCBvZiBzeW5jXG4vLyB3aGVuIHVzaW5nIHZpc2l0RWFjaENoaWxkLlxuZnVuY3Rpb24gaXNMZXhpY2FsU2NvcGUobm9kZTogdHMuTm9kZSk6IGJvb2xlYW4ge1xuICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgIGNhc2UgdHMuU3ludGF4S2luZC5BcnJvd0Z1bmN0aW9uOlxuICAgIGNhc2UgdHMuU3ludGF4S2luZC5GdW5jdGlvbkV4cHJlc3Npb246XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLkZ1bmN0aW9uRGVjbGFyYXRpb246XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLkNsYXNzRXhwcmVzc2lvbjpcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xhc3NEZWNsYXJhdGlvbjpcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuRnVuY3Rpb25UeXBlOlxuICAgIGNhc2UgdHMuU3ludGF4S2luZC5UeXBlTGl0ZXJhbDpcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuQXJyYXlUeXBlOlxuICAgICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1Tb3VyY2VGaWxlKFxuICAgIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIHJlcXVlc3RzOiBSZXF1ZXN0TG9jYXRpb25NYXAsXG4gICAgY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0KTogdHMuU291cmNlRmlsZSB7XG4gIGNvbnN0IGluc2VydHM6IERlY2xhcmF0aW9uSW5zZXJ0W10gPSBbXTtcblxuICAvLyBDYWxjdWxhdGUgdGhlIHJhbmdlIG9mIGludGVyZXN0aW5nIGxvY2F0aW9ucy4gVGhlIHRyYW5zZm9ybSB3aWxsIG9ubHkgdmlzaXQgbm9kZXMgaW4gdGhpc1xuICAvLyByYW5nZSB0byBpbXByb3ZlIHRoZSBwZXJmb3JtYW5jZSBvbiBsYXJnZSBmaWxlcy5cbiAgY29uc3QgbG9jYXRpb25zID0gQXJyYXkuZnJvbShyZXF1ZXN0cy5rZXlzKCkpO1xuICBjb25zdCBtaW4gPSBNYXRoLm1pbiguLi5sb2NhdGlvbnMpO1xuICBjb25zdCBtYXggPSBNYXRoLm1heCguLi5sb2NhdGlvbnMpO1xuXG4gIC8vIFZpc2l0IG5vZGVzIG1hdGNoaW5nIHRoZSByZXF1ZXN0IGFuZCBzeW50aGV0aWMgbm9kZXMgYWRkZWQgYnkgdHNpY2tsZVxuICBmdW5jdGlvbiBzaG91bGRWaXNpdChwb3M6IG51bWJlciwgZW5kOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKHBvcyA8PSBtYXggJiYgZW5kID49IG1pbikgfHwgcG9zID09IC0xO1xuICB9XG5cbiAgZnVuY3Rpb24gdmlzaXRTb3VyY2VGaWxlKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpOiB0cy5Tb3VyY2VGaWxlIHtcbiAgICBmdW5jdGlvbiB0b3BMZXZlbFN0YXRlbWVudChub2RlOiB0cy5TdGF0ZW1lbnQpOiB0cy5TdGF0ZW1lbnQge1xuICAgICAgY29uc3QgZGVjbGFyYXRpb25zOiBEZWNsYXJhdGlvbltdID0gW107XG5cbiAgICAgIGZ1bmN0aW9uIHZpc2l0Tm9kZShub2RlOiB0cy5Ob2RlKTogdHMuTm9kZSB7XG4gICAgICAgIC8vIEdldCB0aGUgb3JpZ2luYWwgbm9kZSBiZWZvcmUgdHNpY2tsZVxuICAgICAgICBjb25zdCB7cG9zLCBlbmQsIGtpbmQsIHBhcmVudDogb3JpZ2luYWxQYXJlbnR9ID0gdHMuZ2V0T3JpZ2luYWxOb2RlKG5vZGUpO1xuICAgICAgICBjb25zdCBub2RlUmVxdWVzdCA9IHJlcXVlc3RzLmdldChwb3MpO1xuICAgICAgICBpZiAobm9kZVJlcXVlc3QgJiYgbm9kZVJlcXVlc3Qua2luZCA9PSBraW5kICYmIG5vZGVSZXF1ZXN0LmVuZCA9PSBlbmQpIHtcbiAgICAgICAgICAvLyBUaGlzIG5vZGUgaXMgcmVxdWVzdGVkIHRvIGJlIHJld3JpdHRlbiBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZXhwb3J0ZWQgbmFtZS5cbiAgICAgICAgICBpZiAob3JpZ2luYWxQYXJlbnQgJiYgb3JpZ2luYWxQYXJlbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5WYXJpYWJsZURlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAvLyBBcyB0aGUgdmFsdWUgcmVwcmVzZW50cyB0aGUgd2hvbGUgaW5pdGlhbGl6ZXIgb2YgYSB2YXJpYWJsZSBkZWNsYXJhdGlvbixcbiAgICAgICAgICAgIC8vIGp1c3QgcmVmZXIgdG8gdGhhdCB2YXJpYWJsZS4gVGhpcyBlLmcuIGhlbHBzIHRvIHByZXNlcnZlIGNsb3N1cmUgY29tbWVudHNcbiAgICAgICAgICAgIC8vIGF0IHRoZSByaWdodCBwbGFjZS5cbiAgICAgICAgICAgIGNvbnN0IHZhclBhcmVudCA9IG9yaWdpbmFsUGFyZW50IGFzIHRzLlZhcmlhYmxlRGVjbGFyYXRpb247XG4gICAgICAgICAgICBpZiAodmFyUGFyZW50Lm5hbWUua2luZCA9PT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHZhck5hbWUgPSB2YXJQYXJlbnQubmFtZS50ZXh0O1xuICAgICAgICAgICAgICBjb25zdCBleHBvcnROYW1lID0gbm9kZVJlcXVlc3QubmFtZTtcbiAgICAgICAgICAgICAgZGVjbGFyYXRpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IGV4cG9ydE5hbWUsXG4gICAgICAgICAgICAgICAgbm9kZTogdHMuY3JlYXRlSWRlbnRpZmllcih2YXJOYW1lKSxcbiAgICAgICAgICAgICAgICBvcmRlcjogRGVjbGFyYXRpb25PcmRlci5BZnRlclN0bXRcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBSZWNvcmQgdGhhdCB0aGUgbm9kZSBuZWVkcyB0byBiZSBtb3ZlZCB0byBhbiBleHBvcnRlZCB2YXJpYWJsZSB3aXRoIHRoZSBnaXZlbiBuYW1lXG4gICAgICAgICAgY29uc3QgZXhwb3J0TmFtZSA9IG5vZGVSZXF1ZXN0Lm5hbWU7XG4gICAgICAgICAgZGVjbGFyYXRpb25zLnB1c2goe25hbWU6IGV4cG9ydE5hbWUsIG5vZGUsIG9yZGVyOiBEZWNsYXJhdGlvbk9yZGVyLkJlZm9yZVN0bXR9KTtcbiAgICAgICAgICByZXR1cm4gdHMuY3JlYXRlSWRlbnRpZmllcihleHBvcnROYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcmVzdWx0ID0gbm9kZTtcbiAgICAgICAgaWYgKHNob3VsZFZpc2l0KHBvcywgZW5kKSAmJiAhaXNMZXhpY2FsU2NvcGUobm9kZSkpIHtcbiAgICAgICAgICByZXN1bHQgPSB0cy52aXNpdEVhY2hDaGlsZChub2RlLCB2aXNpdE5vZGUsIGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG5cbiAgICAgIC8vIEdldCB0aGUgb3JpZ2luYWwgbm9kZSBiZWZvcmUgdHNpY2tsZVxuICAgICAgY29uc3Qge3BvcywgZW5kfSA9IHRzLmdldE9yaWdpbmFsTm9kZShub2RlKTtcbiAgICAgIGxldCByZXN1bHRTdG10OiB0cy5TdGF0ZW1lbnQ7XG4gICAgICBpZiAoc2hvdWxkVmlzaXQocG9zLCBlbmQpKSB7XG4gICAgICAgIHJlc3VsdFN0bXQgPSB0cy52aXNpdEVhY2hDaGlsZChub2RlLCB2aXNpdE5vZGUsIGNvbnRleHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0U3RtdCA9IG5vZGU7XG4gICAgICB9XG5cbiAgICAgIGlmIChkZWNsYXJhdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIGluc2VydHMucHVzaCh7cmVsYXRpdmVUbzogcmVzdWx0U3RtdCwgZGVjbGFyYXRpb25zfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0U3RtdDtcbiAgICB9XG5cbiAgICBsZXQgbmV3U3RhdGVtZW50cyA9IHNvdXJjZUZpbGUuc3RhdGVtZW50cy5tYXAodG9wTGV2ZWxTdGF0ZW1lbnQpO1xuXG4gICAgaWYgKGluc2VydHMubGVuZ3RoKSB7XG4gICAgICAvLyBJbnNlcnQgdGhlIGRlY2xhcmF0aW9ucyByZWxhdGl2ZSB0byB0aGUgcmV3cml0dGVuIHN0YXRlbWVudCB0aGF0IHJlZmVyZW5jZXMgdGhlbS5cbiAgICAgIGNvbnN0IGluc2VydE1hcCA9IHRvTWFwKGluc2VydHMsIGkgPT4gaS5yZWxhdGl2ZVRvKTtcbiAgICAgIGNvbnN0IHRtcFN0YXRlbWVudHM6IHRzLlN0YXRlbWVudFtdID0gW107XG4gICAgICBuZXdTdGF0ZW1lbnRzLmZvckVhY2goc3RhdGVtZW50ID0+IHtcbiAgICAgICAgY29uc3QgaW5zZXJ0ID0gaW5zZXJ0TWFwLmdldChzdGF0ZW1lbnQpO1xuICAgICAgICBpZiAoaW5zZXJ0KSB7XG4gICAgICAgICAgY29uc3QgYmVmb3JlID0gaW5zZXJ0LmRlY2xhcmF0aW9ucy5maWx0ZXIoZCA9PiBkLm9yZGVyID09PSBEZWNsYXJhdGlvbk9yZGVyLkJlZm9yZVN0bXQpO1xuICAgICAgICAgIGlmIChiZWZvcmUubGVuZ3RoKSB7XG4gICAgICAgICAgICB0bXBTdGF0ZW1lbnRzLnB1c2goY3JlYXRlVmFyaWFibGVTdGF0ZW1lbnRGb3JEZWNsYXJhdGlvbnMoYmVmb3JlKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRtcFN0YXRlbWVudHMucHVzaChzdGF0ZW1lbnQpO1xuICAgICAgICAgIGNvbnN0IGFmdGVyID0gaW5zZXJ0LmRlY2xhcmF0aW9ucy5maWx0ZXIoZCA9PiBkLm9yZGVyID09PSBEZWNsYXJhdGlvbk9yZGVyLkFmdGVyU3RtdCk7XG4gICAgICAgICAgaWYgKGFmdGVyLmxlbmd0aCkge1xuICAgICAgICAgICAgdG1wU3RhdGVtZW50cy5wdXNoKGNyZWF0ZVZhcmlhYmxlU3RhdGVtZW50Rm9yRGVjbGFyYXRpb25zKGFmdGVyKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRtcFN0YXRlbWVudHMucHVzaChzdGF0ZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gSW5zZXJ0IGFuIGV4cG9ydHMgY2xhdXNlIHRvIGV4cG9ydCB0aGUgZGVjbGFyYXRpb25zXG4gICAgICB0bXBTdGF0ZW1lbnRzLnB1c2godHMuY3JlYXRlRXhwb3J0RGVjbGFyYXRpb24oXG4gICAgICAgICAgLyogZGVjb3JhdG9ycyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgLyogbW9kaWZpZXJzICovIHVuZGVmaW5lZCxcbiAgICAgICAgICB0cy5jcmVhdGVOYW1lZEV4cG9ydHMoXG4gICAgICAgICAgICAgIGluc2VydHNcbiAgICAgICAgICAgICAgICAgIC5yZWR1Y2UoXG4gICAgICAgICAgICAgICAgICAgICAgKGFjY3VtdWxhdG9yLCBpbnNlcnQpID0+IFsuLi5hY2N1bXVsYXRvciwgLi4uaW5zZXJ0LmRlY2xhcmF0aW9uc10sXG4gICAgICAgICAgICAgICAgICAgICAgW10gYXMgRGVjbGFyYXRpb25bXSlcbiAgICAgICAgICAgICAgICAgIC5tYXAoXG4gICAgICAgICAgICAgICAgICAgICAgZGVjbGFyYXRpb24gPT4gdHMuY3JlYXRlRXhwb3J0U3BlY2lmaWVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBwcm9wZXJ0eU5hbWUgKi8gdW5kZWZpbmVkLCBkZWNsYXJhdGlvbi5uYW1lKSkpKSk7XG5cbiAgICAgIG5ld1N0YXRlbWVudHMgPSB0bXBTdGF0ZW1lbnRzO1xuICAgIH1cbiAgICAvLyBOb3RlOiBXZSBjYW5ub3QgdXNlIHRzLnVwZGF0ZVNvdXJjZWZpbGUgaGVyZSBhc1xuICAgIC8vIGl0IGRvZXMgbm90IHdvcmsgd2VsbCB3aXRoIGRlY29yYXRvcnMuXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvMTczODRcbiAgICBjb25zdCBuZXdTZiA9IHRzLmdldE11dGFibGVDbG9uZShzb3VyY2VGaWxlKTtcbiAgICBpZiAoIShzb3VyY2VGaWxlLmZsYWdzICYgdHMuTm9kZUZsYWdzLlN5bnRoZXNpemVkKSkge1xuICAgICAgbmV3U2YuZmxhZ3MgJj0gfnRzLk5vZGVGbGFncy5TeW50aGVzaXplZDtcbiAgICB9XG4gICAgbmV3U2Yuc3RhdGVtZW50cyA9IHRzLnNldFRleHRSYW5nZSh0cy5jcmVhdGVOb2RlQXJyYXkobmV3U3RhdGVtZW50cyksIHNvdXJjZUZpbGUuc3RhdGVtZW50cyk7XG4gICAgcmV0dXJuIG5ld1NmO1xuICB9XG5cbiAgcmV0dXJuIHZpc2l0U291cmNlRmlsZShzb3VyY2VGaWxlKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlVmFyaWFibGVTdGF0ZW1lbnRGb3JEZWNsYXJhdGlvbnMoZGVjbGFyYXRpb25zOiBEZWNsYXJhdGlvbltdKTogdHMuVmFyaWFibGVTdGF0ZW1lbnQge1xuICBjb25zdCB2YXJEZWNscyA9IGRlY2xhcmF0aW9ucy5tYXAoXG4gICAgICBpID0+IHRzLmNyZWF0ZVZhcmlhYmxlRGVjbGFyYXRpb24oaS5uYW1lLCAvKiB0eXBlICovIHVuZGVmaW5lZCwgaS5ub2RlIGFzIHRzLkV4cHJlc3Npb24pKTtcbiAgcmV0dXJuIHRzLmNyZWF0ZVZhcmlhYmxlU3RhdGVtZW50KFxuICAgICAgLyogbW9kaWZpZXJzICovIHVuZGVmaW5lZCwgdHMuY3JlYXRlVmFyaWFibGVEZWNsYXJhdGlvbkxpc3QodmFyRGVjbHMsIHRzLk5vZGVGbGFncy5Db25zdCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXhwcmVzc2lvbkxvd2VyaW5nVHJhbnNmb3JtRmFjdG9yeShcbiAgICByZXF1ZXN0c01hcDogUmVxdWVzdHNNYXAsIHByb2dyYW06IHRzLlByb2dyYW0pOiAoY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0KSA9PlxuICAgIChzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKSA9PiB0cy5Tb3VyY2VGaWxlIHtcbiAgLy8gUmV0dXJuIHRoZSBmYWN0b3J5XG4gIHJldHVybiAoY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0KSA9PiAoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IHRzLlNvdXJjZUZpbGUgPT4ge1xuICAgIC8vIFdlIG5lZWQgdG8gdXNlIHRoZSBvcmlnaW5hbCBTb3VyY2VGaWxlIGZvciByZWFkaW5nIG1ldGFkYXRhLCBhbmQgbm90IHRoZSB0cmFuc2Zvcm1lZCBvbmUuXG4gICAgY29uc3Qgb3JpZ2luYWxGaWxlID0gcHJvZ3JhbS5nZXRTb3VyY2VGaWxlKHNvdXJjZUZpbGUuZmlsZU5hbWUpO1xuICAgIGlmIChvcmlnaW5hbEZpbGUpIHtcbiAgICAgIGNvbnN0IHJlcXVlc3RzID0gcmVxdWVzdHNNYXAuZ2V0UmVxdWVzdHMob3JpZ2luYWxGaWxlKTtcbiAgICAgIGlmIChyZXF1ZXN0cyAmJiByZXF1ZXN0cy5zaXplKSB7XG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm1Tb3VyY2VGaWxlKHNvdXJjZUZpbGUsIHJlcXVlc3RzLCBjb250ZXh0KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZUZpbGU7XG4gIH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVxdWVzdHNNYXAgeyBnZXRSZXF1ZXN0cyhzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKTogUmVxdWVzdExvY2F0aW9uTWFwOyB9XG5cbmludGVyZmFjZSBNZXRhZGF0YUFuZExvd2VyaW5nUmVxdWVzdHMge1xuICBtZXRhZGF0YTogTW9kdWxlTWV0YWRhdGF8dW5kZWZpbmVkO1xuICByZXF1ZXN0czogUmVxdWVzdExvY2F0aW9uTWFwO1xufVxuXG5mdW5jdGlvbiBpc0VsaWdpYmxlRm9yTG93ZXJpbmcobm9kZTogdHMuTm9kZSB8IHVuZGVmaW5lZCk6IGJvb2xlYW4ge1xuICBpZiAobm9kZSkge1xuICAgIHN3aXRjaCAobm9kZS5raW5kKSB7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU291cmNlRmlsZTpcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5EZWNvcmF0b3I6XG4gICAgICAgIC8vIExvd2VyIGV4cHJlc3Npb25zIHRoYXQgYXJlIGxvY2FsIHRvIHRoZSBtb2R1bGUgc2NvcGUgb3JcbiAgICAgICAgLy8gaW4gYSBkZWNvcmF0b3IuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNsYXNzRGVjbGFyYXRpb246XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSW50ZXJmYWNlRGVjbGFyYXRpb246XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRW51bURlY2xhcmF0aW9uOlxuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZ1bmN0aW9uRGVjbGFyYXRpb246XG4gICAgICAgIC8vIERvbid0IGxvd2VyIGV4cHJlc3Npb25zIGluIGEgZGVjbGFyYXRpb24uXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5WYXJpYWJsZURlY2xhcmF0aW9uOlxuICAgICAgICAvLyBBdm9pZCBsb3dlcmluZyBleHByZXNzaW9ucyBhbHJlYWR5IGluIGFuIGV4cG9ydGVkIHZhcmlhYmxlIGRlY2xhcmF0aW9uXG4gICAgICAgIHJldHVybiAodHMuZ2V0Q29tYmluZWRNb2RpZmllckZsYWdzKG5vZGUgYXMgdHMuVmFyaWFibGVEZWNsYXJhdGlvbikgJlxuICAgICAgICAgICAgICAgIHRzLk1vZGlmaWVyRmxhZ3MuRXhwb3J0KSA9PSAwO1xuICAgIH1cbiAgICByZXR1cm4gaXNFbGlnaWJsZUZvckxvd2VyaW5nKG5vZGUucGFyZW50KTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gaXNQcmltaXRpdmUodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gT2JqZWN0KHZhbHVlKSAhPT0gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGlzUmV3cml0dGVuKHZhbHVlOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzTWV0YWRhdGFHbG9iYWxSZWZlcmVuY2VFeHByZXNzaW9uKHZhbHVlKSAmJiBpc0xvd2VyZWRTeW1ib2wodmFsdWUubmFtZSk7XG59XG5cbmZ1bmN0aW9uIGlzTGl0ZXJhbEZpZWxkTmFtZWQobm9kZTogdHMuTm9kZSwgbmFtZXM6IFNldDxzdHJpbmc+KTogYm9vbGVhbiB7XG4gIGlmIChub2RlLnBhcmVudCAmJiBub2RlLnBhcmVudC5raW5kID09IHRzLlN5bnRheEtpbmQuUHJvcGVydHlBc3NpZ25tZW50KSB7XG4gICAgY29uc3QgcHJvcGVydHkgPSBub2RlLnBhcmVudCBhcyB0cy5Qcm9wZXJ0eUFzc2lnbm1lbnQ7XG4gICAgaWYgKHByb3BlcnR5LnBhcmVudCAmJiBwcm9wZXJ0eS5wYXJlbnQua2luZCA9PSB0cy5TeW50YXhLaW5kLk9iamVjdExpdGVyYWxFeHByZXNzaW9uICYmXG4gICAgICAgIHByb3BlcnR5Lm5hbWUgJiYgcHJvcGVydHkubmFtZS5raW5kID09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgICAgY29uc3QgcHJvcGVydHlOYW1lID0gcHJvcGVydHkubmFtZSBhcyB0cy5JZGVudGlmaWVyO1xuICAgICAgcmV0dXJuIG5hbWVzLmhhcyhwcm9wZXJ0eU5hbWUudGV4dCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGNsYXNzIExvd2VyTWV0YWRhdGFUcmFuc2Zvcm0gaW1wbGVtZW50cyBSZXF1ZXN0c01hcCwgTWV0YWRhdGFUcmFuc2Zvcm1lciB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIGNhY2hlICE6IE1ldGFkYXRhQ2FjaGU7XG4gIHByaXZhdGUgcmVxdWVzdHMgPSBuZXcgTWFwPHN0cmluZywgUmVxdWVzdExvY2F0aW9uTWFwPigpO1xuICBwcml2YXRlIGxvd2VyYWJsZUZpZWxkTmFtZXM6IFNldDxzdHJpbmc+O1xuXG4gIGNvbnN0cnVjdG9yKGxvd2VyYWJsZUZpZWxkTmFtZXM6IHN0cmluZ1tdKSB7XG4gICAgdGhpcy5sb3dlcmFibGVGaWVsZE5hbWVzID0gbmV3IFNldDxzdHJpbmc+KGxvd2VyYWJsZUZpZWxkTmFtZXMpO1xuICB9XG5cbiAgLy8gUmVxdWVzdE1hcFxuICBnZXRSZXF1ZXN0cyhzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKTogUmVxdWVzdExvY2F0aW9uTWFwIHtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy5yZXF1ZXN0cy5nZXQoc291cmNlRmlsZS5maWxlTmFtZSk7XG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIC8vIEZvcmNlIHRoZSBtZXRhZGF0YSBmb3IgdGhpcyBzb3VyY2UgZmlsZSB0byBiZSBjb2xsZWN0ZWQgd2hpY2hcbiAgICAgIC8vIHdpbGwgcmVjdXJzaXZlbHkgY2FsbCBzdGFydCgpIHBvcHVsYXRpbmcgdGhlIHJlcXVlc3QgbWFwO1xuICAgICAgdGhpcy5jYWNoZS5nZXRNZXRhZGF0YShzb3VyY2VGaWxlKTtcblxuICAgICAgLy8gSWYgd2Ugc3RpbGwgZG9uJ3QgaGF2ZSB0aGUgcmVxdWVzdGVkIG1ldGFkYXRhLCB0aGUgZmlsZSBpcyBub3QgYSBtb2R1bGVcbiAgICAgIC8vIG9yIGlzIGEgZGVjbGFyYXRpb24gZmlsZSBzbyByZXR1cm4gYW4gZW1wdHkgbWFwLlxuICAgICAgcmVzdWx0ID0gdGhpcy5yZXF1ZXN0cy5nZXQoc291cmNlRmlsZS5maWxlTmFtZSkgfHwgbmV3IE1hcDxudW1iZXIsIExvd2VyaW5nUmVxdWVzdD4oKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8vIE1ldGFkYXRhVHJhbnNmb3JtZXJcbiAgY29ubmVjdChjYWNoZTogTWV0YWRhdGFDYWNoZSk6IHZvaWQgeyB0aGlzLmNhY2hlID0gY2FjaGU7IH1cblxuICBzdGFydChzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKTogVmFsdWVUcmFuc2Zvcm18dW5kZWZpbmVkIHtcbiAgICBsZXQgaWRlbnROdW1iZXIgPSAwO1xuICAgIGNvbnN0IGZyZXNoSWRlbnQgPSAoKSA9PiBjcmVhdGVMb3dlcmVkU3ltYm9sKGlkZW50TnVtYmVyKyspO1xuICAgIGNvbnN0IHJlcXVlc3RzID0gbmV3IE1hcDxudW1iZXIsIExvd2VyaW5nUmVxdWVzdD4oKTtcbiAgICB0aGlzLnJlcXVlc3RzLnNldChzb3VyY2VGaWxlLmZpbGVOYW1lLCByZXF1ZXN0cyk7XG5cbiAgICBjb25zdCByZXBsYWNlTm9kZSA9IChub2RlOiB0cy5Ob2RlKSA9PiB7XG4gICAgICBjb25zdCBuYW1lID0gZnJlc2hJZGVudCgpO1xuICAgICAgcmVxdWVzdHMuc2V0KG5vZGUucG9zLCB7bmFtZSwga2luZDogbm9kZS5raW5kLCBsb2NhdGlvbjogbm9kZS5wb3MsIGVuZDogbm9kZS5lbmR9KTtcbiAgICAgIHJldHVybiB7X19zeW1ib2xpYzogJ3JlZmVyZW5jZScsIG5hbWV9O1xuICAgIH07XG5cbiAgICBjb25zdCBpc0V4cG9ydGVkU3ltYm9sID0gKCgpID0+IHtcbiAgICAgIGxldCBleHBvcnRUYWJsZTogU2V0PHN0cmluZz47XG4gICAgICByZXR1cm4gKG5vZGU6IHRzLk5vZGUpID0+IHtcbiAgICAgICAgaWYgKG5vZGUua2luZCA9PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIpIHtcbiAgICAgICAgICBjb25zdCBpZGVudCA9IG5vZGUgYXMgdHMuSWRlbnRpZmllcjtcblxuICAgICAgICAgIGlmICghZXhwb3J0VGFibGUpIHtcbiAgICAgICAgICAgIGV4cG9ydFRhYmxlID0gY3JlYXRlRXhwb3J0VGFibGVGb3Ioc291cmNlRmlsZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBleHBvcnRUYWJsZS5oYXMoaWRlbnQudGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfTtcbiAgICB9KSgpO1xuXG4gICAgY29uc3QgaXNFeHBvcnRlZFByb3BlcnR5QWNjZXNzID0gKG5vZGU6IHRzLk5vZGUpID0+IHtcbiAgICAgIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKSB7XG4gICAgICAgIGNvbnN0IHBhZSA9IG5vZGUgYXMgdHMuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uO1xuICAgICAgICBpZiAoaXNFeHBvcnRlZFN5bWJvbChwYWUuZXhwcmVzc2lvbikpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICBjb25zdCBoYXNMb3dlcmFibGVQYXJlbnRDYWNoZSA9IG5ldyBNYXA8dHMuTm9kZSwgYm9vbGVhbj4oKTtcblxuICAgIGNvbnN0IHNob3VsZEJlTG93ZXJlZCA9IChub2RlOiB0cy5Ob2RlIHwgdW5kZWZpbmVkKTogYm9vbGVhbiA9PiB7XG4gICAgICBpZiAobm9kZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGxldCBsb3dlcmFibGU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgIGlmICgobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkFycm93RnVuY3Rpb24gfHxcbiAgICAgICAgICAgbm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkZ1bmN0aW9uRXhwcmVzc2lvbikgJiZcbiAgICAgICAgICBpc0VsaWdpYmxlRm9yTG93ZXJpbmcobm9kZSkpIHtcbiAgICAgICAgbG93ZXJhYmxlID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgaXNMaXRlcmFsRmllbGROYW1lZChub2RlLCB0aGlzLmxvd2VyYWJsZUZpZWxkTmFtZXMpICYmIGlzRWxpZ2libGVGb3JMb3dlcmluZyhub2RlKSAmJlxuICAgICAgICAgICFpc0V4cG9ydGVkU3ltYm9sKG5vZGUpICYmICFpc0V4cG9ydGVkUHJvcGVydHlBY2Nlc3Mobm9kZSkpIHtcbiAgICAgICAgbG93ZXJhYmxlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsb3dlcmFibGU7XG4gICAgfTtcblxuICAgIGNvbnN0IGhhc0xvd2VyYWJsZVBhcmVudCA9IChub2RlOiB0cy5Ob2RlIHwgdW5kZWZpbmVkKTogYm9vbGVhbiA9PiB7XG4gICAgICBpZiAobm9kZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmICghaGFzTG93ZXJhYmxlUGFyZW50Q2FjaGUuaGFzKG5vZGUpKSB7XG4gICAgICAgIGhhc0xvd2VyYWJsZVBhcmVudENhY2hlLnNldChcbiAgICAgICAgICAgIG5vZGUsIHNob3VsZEJlTG93ZXJlZChub2RlLnBhcmVudCkgfHwgaGFzTG93ZXJhYmxlUGFyZW50KG5vZGUucGFyZW50KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaGFzTG93ZXJhYmxlUGFyZW50Q2FjaGUuZ2V0KG5vZGUpICE7XG4gICAgfTtcblxuICAgIGNvbnN0IGlzTG93ZXJhYmxlID0gKG5vZGU6IHRzLk5vZGUgfCB1bmRlZmluZWQpOiBib29sZWFuID0+IHtcbiAgICAgIGlmIChub2RlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNob3VsZEJlTG93ZXJlZChub2RlKSAmJiAhaGFzTG93ZXJhYmxlUGFyZW50KG5vZGUpO1xuICAgIH07XG5cbiAgICByZXR1cm4gKHZhbHVlOiBNZXRhZGF0YVZhbHVlLCBub2RlOiB0cy5Ob2RlKTogTWV0YWRhdGFWYWx1ZSA9PiB7XG4gICAgICBpZiAoIWlzUHJpbWl0aXZlKHZhbHVlKSAmJiAhaXNSZXdyaXR0ZW4odmFsdWUpICYmIGlzTG93ZXJhYmxlKG5vZGUpKSB7XG4gICAgICAgIHJldHVybiByZXBsYWNlTm9kZShub2RlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUV4cG9ydFRhYmxlRm9yKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpOiBTZXQ8c3RyaW5nPiB7XG4gIGNvbnN0IGV4cG9ydFRhYmxlID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIC8vIExhemlseSBjb2xsZWN0IGFsbCB0aGUgZXhwb3J0cyBmcm9tIHRoZSBzb3VyY2UgZmlsZVxuICB0cy5mb3JFYWNoQ2hpbGQoc291cmNlRmlsZSwgZnVuY3Rpb24gc2Nhbihub2RlKSB7XG4gICAgc3dpdGNoIChub2RlLmtpbmQpIHtcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uOlxuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZ1bmN0aW9uRGVjbGFyYXRpb246XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSW50ZXJmYWNlRGVjbGFyYXRpb246XG4gICAgICAgIGlmICgodHMuZ2V0Q29tYmluZWRNb2RpZmllckZsYWdzKG5vZGUgYXMgdHMuRGVjbGFyYXRpb24pICYgdHMuTW9kaWZpZXJGbGFncy5FeHBvcnQpICE9IDApIHtcbiAgICAgICAgICBjb25zdCBjbGFzc0RlY2xhcmF0aW9uID1cbiAgICAgICAgICAgICAgbm9kZSBhcyh0cy5DbGFzc0RlY2xhcmF0aW9uIHwgdHMuRnVuY3Rpb25EZWNsYXJhdGlvbiB8IHRzLkludGVyZmFjZURlY2xhcmF0aW9uKTtcbiAgICAgICAgICBjb25zdCBuYW1lID0gY2xhc3NEZWNsYXJhdGlvbi5uYW1lO1xuICAgICAgICAgIGlmIChuYW1lKSBleHBvcnRUYWJsZS5hZGQobmFtZS50ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5WYXJpYWJsZVN0YXRlbWVudDpcbiAgICAgICAgY29uc3QgdmFyaWFibGVTdGF0ZW1lbnQgPSBub2RlIGFzIHRzLlZhcmlhYmxlU3RhdGVtZW50O1xuICAgICAgICBmb3IgKGNvbnN0IGRlY2xhcmF0aW9uIG9mIHZhcmlhYmxlU3RhdGVtZW50LmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMpIHtcbiAgICAgICAgICBzY2FuKGRlY2xhcmF0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5WYXJpYWJsZURlY2xhcmF0aW9uOlxuICAgICAgICBjb25zdCB2YXJpYWJsZURlY2xhcmF0aW9uID0gbm9kZSBhcyB0cy5WYXJpYWJsZURlY2xhcmF0aW9uO1xuICAgICAgICBpZiAoKHRzLmdldENvbWJpbmVkTW9kaWZpZXJGbGFncyh2YXJpYWJsZURlY2xhcmF0aW9uKSAmIHRzLk1vZGlmaWVyRmxhZ3MuRXhwb3J0KSAhPSAwICYmXG4gICAgICAgICAgICB2YXJpYWJsZURlY2xhcmF0aW9uLm5hbWUua2luZCA9PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIpIHtcbiAgICAgICAgICBjb25zdCBuYW1lID0gdmFyaWFibGVEZWNsYXJhdGlvbi5uYW1lIGFzIHRzLklkZW50aWZpZXI7XG4gICAgICAgICAgZXhwb3J0VGFibGUuYWRkKG5hbWUudGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRXhwb3J0RGVjbGFyYXRpb246XG4gICAgICAgIGNvbnN0IGV4cG9ydERlY2xhcmF0aW9uID0gbm9kZSBhcyB0cy5FeHBvcnREZWNsYXJhdGlvbjtcbiAgICAgICAgY29uc3Qge21vZHVsZVNwZWNpZmllciwgZXhwb3J0Q2xhdXNlfSA9IGV4cG9ydERlY2xhcmF0aW9uO1xuICAgICAgICBpZiAoIW1vZHVsZVNwZWNpZmllciAmJiBleHBvcnRDbGF1c2UpIHtcbiAgICAgICAgICBleHBvcnRDbGF1c2UuZWxlbWVudHMuZm9yRWFjaChzcGVjID0+IHsgZXhwb3J0VGFibGUuYWRkKHNwZWMubmFtZS50ZXh0KTsgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gIH0pO1xuICByZXR1cm4gZXhwb3J0VGFibGU7XG59XG4iXX0=