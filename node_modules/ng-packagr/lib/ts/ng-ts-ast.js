"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
exports.isComponentDecorator = (node) => {
    if (ts.isDecorator(node)) {
        const callExpression = node.getChildren().find(ts.isCallExpression);
        // callExpression may be undefined, check
        if (callExpression && ts.isCallExpression(callExpression)) {
            const decoratorExpression = callExpression.expression;
            if (ts.isIdentifier(decoratorExpression)) {
                // Accounts for `import { Component } from '@angular/core`
                // and accounts for `import { Component as Foo } from '@angular/core';`
                const identifierText = decoratorExpression.getText();
                const ngCoreImports = exports.resolveImportSymbolsFromModule(node, '@angular/core');
                return ngCoreImports['Component'] === identifierText;
            }
            else if (ts.isPropertyAccessExpression(decoratorExpression)) {
                // Accounts for `import * as ng from '@angular/core'`;
                const namespaceName = decoratorExpression.expression.getText();
                const namespacePropertyName = decoratorExpression.name.getText();
                const ngCoreImports = exports.resolveImportSymbolsFromModule(node, '@angular/core');
                return namespacePropertyName === 'Component' && namespaceName === ngCoreImports.__namespace;
            }
            return false;
        }
    }
    return false;
};
exports.isPropertyAssignmentFor = (node, name) => ts.isPropertyAssignment(node) && node.name.getText() === name;
exports.isTemplateUrl = (node) => exports.isPropertyAssignmentFor(node, 'templateUrl');
exports.isStyleUrls = (node) => exports.isPropertyAssignmentFor(node, 'styleUrls');
exports.isImportFromModule = (node, moduleIdentifier) => {
    if (ts.isImportDeclaration(node)) {
        const moduleSpecififer = node.moduleSpecifier.getText();
        const moduleId = moduleSpecififer.substring(1, moduleSpecififer.length - 1);
        return moduleId === moduleIdentifier;
    }
    return false;
};
exports.resolveImportSymbolsFromModule = (node, moduleIdentifier) => {
    const importSymbols = {};
    return node
        .getSourceFile()
        .statements.filter(statement => exports.isImportFromModule(statement, moduleIdentifier))
        .map((importDeclaration) => importDeclaration.importClause)
        .reduce((symbols, importClause) => {
        const importNode = importClause.getChildAt(0);
        if (ts.isNamedImports(importNode)) {
            const importSpecifier = importNode.elements;
            for (let specifier of importSpecifier) {
                // Accounts for aliased imports and straight named imports
                const importedFrom = specifier.propertyName ? specifier.propertyName.getText() : specifier.name.getText();
                const importedAs = specifier.name.getText();
                importSymbols[importedFrom] = importedAs;
            }
        }
        else if (ts.isNamespaceImport(importNode)) {
            const importedAsNamespace = importNode.name.getText();
            importSymbols.__namespace = importedAsNamespace;
        }
        return importSymbols;
    }, importSymbols);
};
//# sourceMappingURL=ng-ts-ast.js.map