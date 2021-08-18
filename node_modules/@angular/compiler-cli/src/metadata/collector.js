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
        define("@angular/compiler-cli/src/metadata/collector", ["require", "exports", "typescript", "@angular/compiler-cli/src/metadata/evaluator", "@angular/compiler-cli/src/metadata/schema", "@angular/compiler-cli/src/metadata/symbols"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ts = require("typescript");
    const evaluator_1 = require("@angular/compiler-cli/src/metadata/evaluator");
    const schema_1 = require("@angular/compiler-cli/src/metadata/schema");
    const symbols_1 = require("@angular/compiler-cli/src/metadata/symbols");
    const isStatic = (node) => ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Static;
    /**
     * Collect decorator metadata from a TypeScript module.
     */
    class MetadataCollector {
        constructor(options = {}) {
            this.options = options;
        }
        /**
         * Returns a JSON.stringify friendly form describing the decorators of the exported classes from
         * the source file that is expected to correspond to a module.
         */
        getMetadata(sourceFile, strict = false, substituteExpression) {
            const locals = new symbols_1.Symbols(sourceFile);
            const nodeMap = new Map();
            const composedSubstituter = substituteExpression && this.options.substituteExpression ?
                (value, node) => this.options.substituteExpression(substituteExpression(value, node), node) :
                substituteExpression;
            const evaluatorOptions = substituteExpression ? Object.assign({}, this.options, { substituteExpression: composedSubstituter }) :
                this.options;
            let metadata;
            const evaluator = new evaluator_1.Evaluator(locals, nodeMap, evaluatorOptions, (name, value) => {
                if (!metadata)
                    metadata = {};
                metadata[name] = value;
            });
            let exports = undefined;
            function objFromDecorator(decoratorNode) {
                return evaluator.evaluateNode(decoratorNode.expression);
            }
            function recordEntry(entry, node) {
                if (composedSubstituter) {
                    entry = composedSubstituter(entry, node);
                }
                return evaluator_1.recordMapEntry(entry, node, nodeMap, sourceFile);
            }
            function errorSym(message, node, context) {
                return evaluator_1.errorSymbol(message, node, context, sourceFile);
            }
            function maybeGetSimpleFunction(functionDeclaration) {
                if (functionDeclaration.name && functionDeclaration.name.kind == ts.SyntaxKind.Identifier) {
                    const nameNode = functionDeclaration.name;
                    const functionName = nameNode.text;
                    const functionBody = functionDeclaration.body;
                    if (functionBody && functionBody.statements.length == 1) {
                        const statement = functionBody.statements[0];
                        if (statement.kind === ts.SyntaxKind.ReturnStatement) {
                            const returnStatement = statement;
                            if (returnStatement.expression) {
                                const func = {
                                    __symbolic: 'function',
                                    parameters: namesOf(functionDeclaration.parameters),
                                    value: evaluator.evaluateNode(returnStatement.expression)
                                };
                                if (functionDeclaration.parameters.some(p => p.initializer != null)) {
                                    func.defaults = functionDeclaration.parameters.map(p => p.initializer && evaluator.evaluateNode(p.initializer));
                                }
                                return recordEntry({ func, name: functionName }, functionDeclaration);
                            }
                        }
                    }
                }
            }
            function classMetadataOf(classDeclaration) {
                const result = { __symbolic: 'class' };
                function getDecorators(decorators) {
                    if (decorators && decorators.length)
                        return decorators.map(decorator => objFromDecorator(decorator));
                    return undefined;
                }
                function referenceFrom(node) {
                    const result = evaluator.evaluateNode(node);
                    if (schema_1.isMetadataError(result) || schema_1.isMetadataSymbolicReferenceExpression(result) ||
                        schema_1.isMetadataSymbolicSelectExpression(result)) {
                        return result;
                    }
                    else {
                        return errorSym('Symbol reference expected', node);
                    }
                }
                // Add class parents
                if (classDeclaration.heritageClauses) {
                    classDeclaration.heritageClauses.forEach((hc) => {
                        if (hc.token === ts.SyntaxKind.ExtendsKeyword && hc.types) {
                            hc.types.forEach(type => result.extends = referenceFrom(type.expression));
                        }
                    });
                }
                // Add arity if the type is generic
                const typeParameters = classDeclaration.typeParameters;
                if (typeParameters && typeParameters.length) {
                    result.arity = typeParameters.length;
                }
                // Add class decorators
                if (classDeclaration.decorators) {
                    result.decorators = getDecorators(classDeclaration.decorators);
                }
                // member decorators
                let members = null;
                function recordMember(name, metadata) {
                    if (!members)
                        members = {};
                    const data = members.hasOwnProperty(name) ? members[name] : [];
                    data.push(metadata);
                    members[name] = data;
                }
                // static member
                let statics = null;
                function recordStaticMember(name, value) {
                    if (!statics)
                        statics = {};
                    statics[name] = value;
                }
                for (const member of classDeclaration.members) {
                    let isConstructor = false;
                    switch (member.kind) {
                        case ts.SyntaxKind.Constructor:
                        case ts.SyntaxKind.MethodDeclaration:
                            isConstructor = member.kind === ts.SyntaxKind.Constructor;
                            const method = member;
                            if (isStatic(method)) {
                                const maybeFunc = maybeGetSimpleFunction(method);
                                if (maybeFunc) {
                                    recordStaticMember(maybeFunc.name, maybeFunc.func);
                                }
                                continue;
                            }
                            const methodDecorators = getDecorators(method.decorators);
                            const parameters = method.parameters;
                            const parameterDecoratorData = [];
                            const parametersData = [];
                            let hasDecoratorData = false;
                            let hasParameterData = false;
                            for (const parameter of parameters) {
                                const parameterData = getDecorators(parameter.decorators);
                                parameterDecoratorData.push(parameterData);
                                hasDecoratorData = hasDecoratorData || !!parameterData;
                                if (isConstructor) {
                                    if (parameter.type) {
                                        parametersData.push(referenceFrom(parameter.type));
                                    }
                                    else {
                                        parametersData.push(null);
                                    }
                                    hasParameterData = true;
                                }
                            }
                            const data = { __symbolic: isConstructor ? 'constructor' : 'method' };
                            const name = isConstructor ? '__ctor__' : evaluator.nameOf(member.name);
                            if (methodDecorators) {
                                data.decorators = methodDecorators;
                            }
                            if (hasDecoratorData) {
                                data.parameterDecorators = parameterDecoratorData;
                            }
                            if (hasParameterData) {
                                data.parameters = parametersData;
                            }
                            if (!schema_1.isMetadataError(name)) {
                                recordMember(name, data);
                            }
                            break;
                        case ts.SyntaxKind.PropertyDeclaration:
                        case ts.SyntaxKind.GetAccessor:
                        case ts.SyntaxKind.SetAccessor:
                            const property = member;
                            if (isStatic(property)) {
                                const name = evaluator.nameOf(property.name);
                                if (!schema_1.isMetadataError(name)) {
                                    if (property.initializer) {
                                        const value = evaluator.evaluateNode(property.initializer);
                                        recordStaticMember(name, value);
                                    }
                                    else {
                                        recordStaticMember(name, errorSym('Variable not initialized', property.name));
                                    }
                                }
                            }
                            const propertyDecorators = getDecorators(property.decorators);
                            if (propertyDecorators) {
                                const name = evaluator.nameOf(property.name);
                                if (!schema_1.isMetadataError(name)) {
                                    recordMember(name, { __symbolic: 'property', decorators: propertyDecorators });
                                }
                            }
                            break;
                    }
                }
                if (members) {
                    result.members = members;
                }
                if (statics) {
                    result.statics = statics;
                }
                return recordEntry(result, classDeclaration);
            }
            // Collect all exported symbols from an exports clause.
            const exportMap = new Map();
            ts.forEachChild(sourceFile, node => {
                switch (node.kind) {
                    case ts.SyntaxKind.ExportDeclaration:
                        const exportDeclaration = node;
                        const { moduleSpecifier, exportClause } = exportDeclaration;
                        if (!moduleSpecifier) {
                            // If there is a module specifier there is also an exportClause
                            exportClause.elements.forEach(spec => {
                                const exportedAs = spec.name.text;
                                const name = (spec.propertyName || spec.name).text;
                                exportMap.set(name, exportedAs);
                            });
                        }
                }
            });
            const isExport = (node) => sourceFile.isDeclarationFile ||
                ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export;
            const isExportedIdentifier = (identifier) => identifier && exportMap.has(identifier.text);
            const isExported = (node) => isExport(node) || isExportedIdentifier(node.name);
            const exportedIdentifierName = (identifier) => identifier && (exportMap.get(identifier.text) || identifier.text);
            const exportedName = (node) => exportedIdentifierName(node.name);
            // Pre-declare classes and functions
            ts.forEachChild(sourceFile, node => {
                switch (node.kind) {
                    case ts.SyntaxKind.ClassDeclaration:
                        const classDeclaration = node;
                        if (classDeclaration.name) {
                            const className = classDeclaration.name.text;
                            if (isExported(classDeclaration)) {
                                locals.define(className, { __symbolic: 'reference', name: exportedName(classDeclaration) });
                            }
                            else {
                                locals.define(className, errorSym('Reference to non-exported class', node, { className }));
                            }
                        }
                        break;
                    case ts.SyntaxKind.InterfaceDeclaration:
                        const interfaceDeclaration = node;
                        if (interfaceDeclaration.name) {
                            const interfaceName = interfaceDeclaration.name.text;
                            // All references to interfaces should be converted to references to `any`.
                            locals.define(interfaceName, { __symbolic: 'reference', name: 'any' });
                        }
                        break;
                    case ts.SyntaxKind.FunctionDeclaration:
                        const functionDeclaration = node;
                        if (!isExported(functionDeclaration)) {
                            // Report references to this function as an error.
                            const nameNode = functionDeclaration.name;
                            if (nameNode && nameNode.text) {
                                locals.define(nameNode.text, errorSym('Reference to a non-exported function', nameNode, { name: nameNode.text }));
                            }
                        }
                        break;
                }
            });
            ts.forEachChild(sourceFile, node => {
                switch (node.kind) {
                    case ts.SyntaxKind.ExportDeclaration:
                        // Record export declarations
                        const exportDeclaration = node;
                        const { moduleSpecifier, exportClause } = exportDeclaration;
                        if (!moduleSpecifier) {
                            // no module specifier -> export {propName as name};
                            if (exportClause) {
                                exportClause.elements.forEach(spec => {
                                    const name = spec.name.text;
                                    // If the symbol was not already exported, export a reference since it is a
                                    // reference to an import
                                    if (!metadata || !metadata[name]) {
                                        const propNode = spec.propertyName || spec.name;
                                        const value = evaluator.evaluateNode(propNode);
                                        if (!metadata)
                                            metadata = {};
                                        metadata[name] = recordEntry(value, node);
                                    }
                                });
                            }
                        }
                        if (moduleSpecifier && moduleSpecifier.kind == ts.SyntaxKind.StringLiteral) {
                            // Ignore exports that don't have string literals as exports.
                            // This is allowed by the syntax but will be flagged as an error by the type checker.
                            const from = moduleSpecifier.text;
                            const moduleExport = { from };
                            if (exportClause) {
                                moduleExport.export = exportClause.elements.map(spec => spec.propertyName ? { name: spec.propertyName.text, as: spec.name.text } :
                                    spec.name.text);
                            }
                            if (!exports)
                                exports = [];
                            exports.push(moduleExport);
                        }
                        break;
                    case ts.SyntaxKind.ClassDeclaration:
                        const classDeclaration = node;
                        if (classDeclaration.name) {
                            if (isExported(classDeclaration)) {
                                const name = exportedName(classDeclaration);
                                if (name) {
                                    if (!metadata)
                                        metadata = {};
                                    metadata[name] = classMetadataOf(classDeclaration);
                                }
                            }
                        }
                        // Otherwise don't record metadata for the class.
                        break;
                    case ts.SyntaxKind.TypeAliasDeclaration:
                        const typeDeclaration = node;
                        if (typeDeclaration.name && isExported(typeDeclaration)) {
                            const name = exportedName(typeDeclaration);
                            if (name) {
                                if (!metadata)
                                    metadata = {};
                                metadata[name] = { __symbolic: 'interface' };
                            }
                        }
                        break;
                    case ts.SyntaxKind.InterfaceDeclaration:
                        const interfaceDeclaration = node;
                        if (interfaceDeclaration.name && isExported(interfaceDeclaration)) {
                            const name = exportedName(interfaceDeclaration);
                            if (name) {
                                if (!metadata)
                                    metadata = {};
                                metadata[name] = { __symbolic: 'interface' };
                            }
                        }
                        break;
                    case ts.SyntaxKind.FunctionDeclaration:
                        // Record functions that return a single value. Record the parameter
                        // names substitution will be performed by the StaticReflector.
                        const functionDeclaration = node;
                        if (isExported(functionDeclaration) && functionDeclaration.name) {
                            const name = exportedName(functionDeclaration);
                            const maybeFunc = maybeGetSimpleFunction(functionDeclaration);
                            if (name) {
                                if (!metadata)
                                    metadata = {};
                                metadata[name] =
                                    maybeFunc ? recordEntry(maybeFunc.func, node) : { __symbolic: 'function' };
                            }
                        }
                        break;
                    case ts.SyntaxKind.EnumDeclaration:
                        const enumDeclaration = node;
                        if (isExported(enumDeclaration)) {
                            const enumValueHolder = {};
                            const enumName = exportedName(enumDeclaration);
                            let nextDefaultValue = 0;
                            let writtenMembers = 0;
                            for (const member of enumDeclaration.members) {
                                let enumValue;
                                if (!member.initializer) {
                                    enumValue = nextDefaultValue;
                                }
                                else {
                                    enumValue = evaluator.evaluateNode(member.initializer);
                                }
                                let name = undefined;
                                if (member.name.kind == ts.SyntaxKind.Identifier) {
                                    const identifier = member.name;
                                    name = identifier.text;
                                    enumValueHolder[name] = enumValue;
                                    writtenMembers++;
                                }
                                if (typeof enumValue === 'number') {
                                    nextDefaultValue = enumValue + 1;
                                }
                                else if (name) {
                                    nextDefaultValue = {
                                        __symbolic: 'binary',
                                        operator: '+',
                                        left: {
                                            __symbolic: 'select',
                                            expression: recordEntry({ __symbolic: 'reference', name: enumName }, node), name
                                        }
                                    };
                                }
                                else {
                                    nextDefaultValue =
                                        recordEntry(errorSym('Unsupported enum member name', member.name), node);
                                }
                            }
                            if (writtenMembers) {
                                if (enumName) {
                                    if (!metadata)
                                        metadata = {};
                                    metadata[enumName] = recordEntry(enumValueHolder, node);
                                }
                            }
                        }
                        break;
                    case ts.SyntaxKind.VariableStatement:
                        const variableStatement = node;
                        for (const variableDeclaration of variableStatement.declarationList.declarations) {
                            if (variableDeclaration.name.kind == ts.SyntaxKind.Identifier) {
                                const nameNode = variableDeclaration.name;
                                let varValue;
                                if (variableDeclaration.initializer) {
                                    varValue = evaluator.evaluateNode(variableDeclaration.initializer);
                                }
                                else {
                                    varValue = recordEntry(errorSym('Variable not initialized', nameNode), nameNode);
                                }
                                let exported = false;
                                if (isExport(variableStatement) || isExport(variableDeclaration) ||
                                    isExportedIdentifier(nameNode)) {
                                    const name = exportedIdentifierName(nameNode);
                                    if (name) {
                                        if (!metadata)
                                            metadata = {};
                                        metadata[name] = recordEntry(varValue, node);
                                    }
                                    exported = true;
                                }
                                if (typeof varValue == 'string' || typeof varValue == 'number' ||
                                    typeof varValue == 'boolean') {
                                    locals.define(nameNode.text, varValue);
                                    if (exported) {
                                        locals.defineReference(nameNode.text, { __symbolic: 'reference', name: nameNode.text });
                                    }
                                }
                                else if (!exported) {
                                    if (varValue && !schema_1.isMetadataError(varValue)) {
                                        locals.define(nameNode.text, recordEntry(varValue, node));
                                    }
                                    else {
                                        locals.define(nameNode.text, recordEntry(errorSym('Reference to a local symbol', nameNode, { name: nameNode.text }), node));
                                    }
                                }
                            }
                            else {
                                // Destructuring (or binding) declarations are not supported,
                                // var {<identifier>[, <identifier>]+} = <expression>;
                                //   or
                                // var [<identifier>[, <identifier}+] = <expression>;
                                // are not supported.
                                const report = (nameNode) => {
                                    switch (nameNode.kind) {
                                        case ts.SyntaxKind.Identifier:
                                            const name = nameNode;
                                            const varValue = errorSym('Destructuring not supported', name);
                                            locals.define(name.text, varValue);
                                            if (isExport(node)) {
                                                if (!metadata)
                                                    metadata = {};
                                                metadata[name.text] = varValue;
                                            }
                                            break;
                                        case ts.SyntaxKind.BindingElement:
                                            const bindingElement = nameNode;
                                            report(bindingElement.name);
                                            break;
                                        case ts.SyntaxKind.ObjectBindingPattern:
                                        case ts.SyntaxKind.ArrayBindingPattern:
                                            const bindings = nameNode;
                                            bindings.elements.forEach(report);
                                            break;
                                    }
                                };
                                report(variableDeclaration.name);
                            }
                        }
                        break;
                }
            });
            if (metadata || exports) {
                if (!metadata)
                    metadata = {};
                else if (strict) {
                    validateMetadata(sourceFile, nodeMap, metadata);
                }
                const result = {
                    __symbolic: 'module',
                    version: this.options.version || schema_1.METADATA_VERSION, metadata
                };
                if (sourceFile.moduleName)
                    result.importAs = sourceFile.moduleName;
                if (exports)
                    result.exports = exports;
                return result;
            }
        }
    }
    exports.MetadataCollector = MetadataCollector;
    // This will throw if the metadata entry given contains an error node.
    function validateMetadata(sourceFile, nodeMap, metadata) {
        let locals = new Set(['Array', 'Object', 'Set', 'Map', 'string', 'number', 'any']);
        function validateExpression(expression) {
            if (!expression) {
                return;
            }
            else if (Array.isArray(expression)) {
                expression.forEach(validateExpression);
            }
            else if (typeof expression === 'object' && !expression.hasOwnProperty('__symbolic')) {
                Object.getOwnPropertyNames(expression).forEach(v => validateExpression(expression[v]));
            }
            else if (schema_1.isMetadataError(expression)) {
                reportError(expression);
            }
            else if (schema_1.isMetadataGlobalReferenceExpression(expression)) {
                if (!locals.has(expression.name)) {
                    const reference = metadata[expression.name];
                    if (reference) {
                        validateExpression(reference);
                    }
                }
            }
            else if (schema_1.isFunctionMetadata(expression)) {
                validateFunction(expression);
            }
            else if (schema_1.isMetadataSymbolicExpression(expression)) {
                switch (expression.__symbolic) {
                    case 'binary':
                        const binaryExpression = expression;
                        validateExpression(binaryExpression.left);
                        validateExpression(binaryExpression.right);
                        break;
                    case 'call':
                    case 'new':
                        const callExpression = expression;
                        validateExpression(callExpression.expression);
                        if (callExpression.arguments)
                            callExpression.arguments.forEach(validateExpression);
                        break;
                    case 'index':
                        const indexExpression = expression;
                        validateExpression(indexExpression.expression);
                        validateExpression(indexExpression.index);
                        break;
                    case 'pre':
                        const prefixExpression = expression;
                        validateExpression(prefixExpression.operand);
                        break;
                    case 'select':
                        const selectExpression = expression;
                        validateExpression(selectExpression.expression);
                        break;
                    case 'spread':
                        const spreadExpression = expression;
                        validateExpression(spreadExpression.expression);
                        break;
                    case 'if':
                        const ifExpression = expression;
                        validateExpression(ifExpression.condition);
                        validateExpression(ifExpression.elseExpression);
                        validateExpression(ifExpression.thenExpression);
                        break;
                }
            }
        }
        function validateMember(classData, member) {
            if (member.decorators) {
                member.decorators.forEach(validateExpression);
            }
            if (schema_1.isMethodMetadata(member) && member.parameterDecorators) {
                member.parameterDecorators.forEach(validateExpression);
            }
            // Only validate parameters of classes for which we know that are used with our DI
            if (classData.decorators && schema_1.isConstructorMetadata(member) && member.parameters) {
                member.parameters.forEach(validateExpression);
            }
        }
        function validateClass(classData) {
            if (classData.decorators) {
                classData.decorators.forEach(validateExpression);
            }
            if (classData.members) {
                Object.getOwnPropertyNames(classData.members)
                    .forEach(name => classData.members[name].forEach((m) => validateMember(classData, m)));
            }
            if (classData.statics) {
                Object.getOwnPropertyNames(classData.statics).forEach(name => {
                    const staticMember = classData.statics[name];
                    if (schema_1.isFunctionMetadata(staticMember)) {
                        validateExpression(staticMember.value);
                    }
                    else {
                        validateExpression(staticMember);
                    }
                });
            }
        }
        function validateFunction(functionDeclaration) {
            if (functionDeclaration.value) {
                const oldLocals = locals;
                if (functionDeclaration.parameters) {
                    locals = new Set(oldLocals.values());
                    if (functionDeclaration.parameters)
                        functionDeclaration.parameters.forEach(n => locals.add(n));
                }
                validateExpression(functionDeclaration.value);
                locals = oldLocals;
            }
        }
        function shouldReportNode(node) {
            if (node) {
                const nodeStart = node.getStart();
                return !(node.pos != nodeStart &&
                    sourceFile.text.substring(node.pos, nodeStart).indexOf('@dynamic') >= 0);
            }
            return true;
        }
        function reportError(error) {
            const node = nodeMap.get(error);
            if (shouldReportNode(node)) {
                const lineInfo = error.line != undefined ?
                    error.character != undefined ? `:${error.line + 1}:${error.character + 1}` :
                        `:${error.line + 1}` :
                    '';
                throw new Error(`${sourceFile.fileName}${lineInfo}: Metadata collected contains an error that will be reported at runtime: ${expandedMessage(error)}.\n  ${JSON.stringify(error)}`);
            }
        }
        Object.getOwnPropertyNames(metadata).forEach(name => {
            const entry = metadata[name];
            try {
                if (schema_1.isClassMetadata(entry)) {
                    validateClass(entry);
                }
            }
            catch (e) {
                const node = nodeMap.get(entry);
                if (shouldReportNode(node)) {
                    if (node) {
                        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
                        throw new Error(`${sourceFile.fileName}:${line + 1}:${character + 1}: Error encountered in metadata generated for exported symbol '${name}': \n ${e.message}`);
                    }
                    throw new Error(`Error encountered in metadata generated for exported symbol ${name}: \n ${e.message}`);
                }
            }
        });
    }
    // Collect parameter names from a function.
    function namesOf(parameters) {
        const result = [];
        function addNamesOf(name) {
            if (name.kind == ts.SyntaxKind.Identifier) {
                const identifier = name;
                result.push(identifier.text);
            }
            else {
                const bindingPattern = name;
                for (const element of bindingPattern.elements) {
                    const name = element.name;
                    if (name) {
                        addNamesOf(name);
                    }
                }
            }
        }
        for (const parameter of parameters) {
            addNamesOf(parameter.name);
        }
        return result;
    }
    function expandedMessage(error) {
        switch (error.message) {
            case 'Reference to non-exported class':
                if (error.context && error.context.className) {
                    return `Reference to a non-exported class ${error.context.className}. Consider exporting the class`;
                }
                break;
            case 'Variable not initialized':
                return 'Only initialized variables and constants can be referenced because the value of this variable is needed by the template compiler';
            case 'Destructuring not supported':
                return 'Referencing an exported destructured variable or constant is not supported by the template compiler. Consider simplifying this to avoid destructuring';
            case 'Could not resolve type':
                if (error.context && error.context.typeName) {
                    return `Could not resolve type ${error.context.typeName}`;
                }
                break;
            case 'Function call not supported':
                let prefix = error.context && error.context.name ? `Calling function '${error.context.name}', f` : 'F';
                return prefix +
                    'unction calls are not supported. Consider replacing the function or lambda with a reference to an exported function';
            case 'Reference to a local symbol':
                if (error.context && error.context.name) {
                    return `Reference to a local (non-exported) symbol '${error.context.name}'. Consider exporting the symbol`;
                }
        }
        return error.message;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9tZXRhZGF0YS9jb2xsZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSCxpQ0FBaUM7SUFFakMsNEVBQW1FO0lBQ25FLHNFQUF1MUI7SUFDdjFCLHdFQUFrQztJQUVsQyxNQUFNLFFBQVEsR0FBRyxDQUFDLElBQW9CLEVBQUUsRUFBRSxDQUN0QyxFQUFFLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUM7SUE0QmhFOztPQUVHO0lBQ0gsTUFBYSxpQkFBaUI7UUFDNUIsWUFBb0IsVUFBNEIsRUFBRTtZQUE5QixZQUFPLEdBQVAsT0FBTyxDQUF1QjtRQUFHLENBQUM7UUFFdEQ7OztXQUdHO1FBQ0ksV0FBVyxDQUNkLFVBQXlCLEVBQUUsU0FBa0IsS0FBSyxFQUNsRCxvQkFBNkU7WUFFL0UsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sT0FBTyxHQUNULElBQUksR0FBRyxFQUEyRSxDQUFDO1lBQ3ZGLE1BQU0sbUJBQW1CLEdBQUcsb0JBQW9CLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2dCQUNuRixDQUFDLEtBQW9CLEVBQUUsSUFBYSxFQUFFLEVBQUUsQ0FDcEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxvQkFBc0IsQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDbEYsb0JBQW9CLENBQUM7WUFDekIsTUFBTSxnQkFBZ0IsR0FBRyxvQkFBb0IsQ0FBQyxDQUFDLG1CQUN2QyxJQUFJLENBQUMsT0FBTyxJQUFFLG9CQUFvQixFQUFF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QixLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO2lCQUMzRDtnQkFDRCxNQUFNO1lBQ1IsS0FBSyw2QkFBNkI7Z0JBQ2hDLElBQUksTUFBTSxHQUNOLEtBQUssQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7Z0JBQzlGLE9BQU8sTUFBTTtvQkFDVCxxSEFBcUgsQ0FBQztZQUM1SCxLQUFLLDZCQUE2QjtnQkFDaEMsSUFBSSxLQUFLLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFO29CQUN2QyxPQUFPLCtDQUErQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksa0NBQWtDLENBQUM7aUJBQzVHO1NBQ0o7UUFDRCxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUM7SUFDdkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7RXZhbHVhdG9yLCBlcnJvclN5bWJvbCwgcmVjb3JkTWFwRW50cnl9IGZyb20gJy4vZXZhbHVhdG9yJztcbmltcG9ydCB7Q2xhc3NNZXRhZGF0YSwgQ29uc3RydWN0b3JNZXRhZGF0YSwgRnVuY3Rpb25NZXRhZGF0YSwgSW50ZXJmYWNlTWV0YWRhdGEsIE1FVEFEQVRBX1ZFUlNJT04sIE1lbWJlck1ldGFkYXRhLCBNZXRhZGF0YUVudHJ5LCBNZXRhZGF0YUVycm9yLCBNZXRhZGF0YU1hcCwgTWV0YWRhdGFTeW1ib2xpY0JpbmFyeUV4cHJlc3Npb24sIE1ldGFkYXRhU3ltYm9saWNDYWxsRXhwcmVzc2lvbiwgTWV0YWRhdGFTeW1ib2xpY0V4cHJlc3Npb24sIE1ldGFkYXRhU3ltYm9saWNJZkV4cHJlc3Npb24sIE1ldGFkYXRhU3ltYm9saWNJbmRleEV4cHJlc3Npb24sIE1ldGFkYXRhU3ltYm9saWNQcmVmaXhFeHByZXNzaW9uLCBNZXRhZGF0YVN5bWJvbGljUmVmZXJlbmNlRXhwcmVzc2lvbiwgTWV0YWRhdGFTeW1ib2xpY1NlbGVjdEV4cHJlc3Npb24sIE1ldGFkYXRhU3ltYm9saWNTcHJlYWRFeHByZXNzaW9uLCBNZXRhZGF0YVZhbHVlLCBNZXRob2RNZXRhZGF0YSwgTW9kdWxlRXhwb3J0TWV0YWRhdGEsIE1vZHVsZU1ldGFkYXRhLCBpc0NsYXNzTWV0YWRhdGEsIGlzQ29uc3RydWN0b3JNZXRhZGF0YSwgaXNGdW5jdGlvbk1ldGFkYXRhLCBpc01ldGFkYXRhRXJyb3IsIGlzTWV0YWRhdGFHbG9iYWxSZWZlcmVuY2VFeHByZXNzaW9uLCBpc01ldGFkYXRhSW1wb3J0RGVmYXVsdFJlZmVyZW5jZSwgaXNNZXRhZGF0YUltcG9ydGVkU3ltYm9sUmVmZXJlbmNlRXhwcmVzc2lvbiwgaXNNZXRhZGF0YVN5bWJvbGljRXhwcmVzc2lvbiwgaXNNZXRhZGF0YVN5bWJvbGljUmVmZXJlbmNlRXhwcmVzc2lvbiwgaXNNZXRhZGF0YVN5bWJvbGljU2VsZWN0RXhwcmVzc2lvbiwgaXNNZXRob2RNZXRhZGF0YX0gZnJvbSAnLi9zY2hlbWEnO1xuaW1wb3J0IHtTeW1ib2xzfSBmcm9tICcuL3N5bWJvbHMnO1xuXG5jb25zdCBpc1N0YXRpYyA9IChub2RlOiB0cy5EZWNsYXJhdGlvbikgPT5cbiAgICB0cy5nZXRDb21iaW5lZE1vZGlmaWVyRmxhZ3Mobm9kZSkgJiB0cy5Nb2RpZmllckZsYWdzLlN0YXRpYztcblxuLyoqXG4gKiBBIHNldCBvZiBjb2xsZWN0b3Igb3B0aW9ucyB0byB1c2Ugd2hlbiBjb2xsZWN0aW5nIG1ldGFkYXRhLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbGxlY3Rvck9wdGlvbnMge1xuICAvKipcbiAgICogVmVyc2lvbiBvZiB0aGUgbWV0YWRhdGEgdG8gY29sbGVjdC5cbiAgICovXG4gIHZlcnNpb24/OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIENvbGxlY3QgYSBoaWRkZW4gZmllbGQgXCIkcXVvdGVkJFwiIGluIG9iamVjdHMgbGl0ZXJhbHMgdGhhdCByZWNvcmQgd2hlbiB0aGUga2V5IHdhcyBxdW90ZWQgaW5cbiAgICogdGhlIHNvdXJjZS5cbiAgICovXG4gIHF1b3RlZE5hbWVzPzogYm9vbGVhbjtcblxuICAvKipcbiAgICogRG8gbm90IHNpbXBsaWZ5IGludmFsaWQgZXhwcmVzc2lvbnMuXG4gICAqL1xuICB2ZXJib3NlSW52YWxpZEV4cHJlc3Npb24/OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBBbiBleHByZXNzaW9uIHN1YnN0aXR1dGlvbiBjYWxsYmFjay5cbiAgICovXG4gIHN1YnN0aXR1dGVFeHByZXNzaW9uPzogKHZhbHVlOiBNZXRhZGF0YVZhbHVlLCBub2RlOiB0cy5Ob2RlKSA9PiBNZXRhZGF0YVZhbHVlO1xufVxuXG4vKipcbiAqIENvbGxlY3QgZGVjb3JhdG9yIG1ldGFkYXRhIGZyb20gYSBUeXBlU2NyaXB0IG1vZHVsZS5cbiAqL1xuZXhwb3J0IGNsYXNzIE1ldGFkYXRhQ29sbGVjdG9yIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBvcHRpb25zOiBDb2xsZWN0b3JPcHRpb25zID0ge30pIHt9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBKU09OLnN0cmluZ2lmeSBmcmllbmRseSBmb3JtIGRlc2NyaWJpbmcgdGhlIGRlY29yYXRvcnMgb2YgdGhlIGV4cG9ydGVkIGNsYXNzZXMgZnJvbVxuICAgKiB0aGUgc291cmNlIGZpbGUgdGhhdCBpcyBleHBlY3RlZCB0byBjb3JyZXNwb25kIHRvIGEgbW9kdWxlLlxuICAgKi9cbiAgcHVibGljIGdldE1ldGFkYXRhKFxuICAgICAgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgc3RyaWN0OiBib29sZWFuID0gZmFsc2UsXG4gICAgICBzdWJzdGl0dXRlRXhwcmVzc2lvbj86ICh2YWx1ZTogTWV0YWRhdGFWYWx1ZSwgbm9kZTogdHMuTm9kZSkgPT4gTWV0YWRhdGFWYWx1ZSk6IE1vZHVsZU1ldGFkYXRhXG4gICAgICB8dW5kZWZpbmVkIHtcbiAgICBjb25zdCBsb2NhbHMgPSBuZXcgU3ltYm9scyhzb3VyY2VGaWxlKTtcbiAgICBjb25zdCBub2RlTWFwID1cbiAgICAgICAgbmV3IE1hcDxNZXRhZGF0YVZhbHVlfENsYXNzTWV0YWRhdGF8SW50ZXJmYWNlTWV0YWRhdGF8RnVuY3Rpb25NZXRhZGF0YSwgdHMuTm9kZT4oKTtcbiAgICBjb25zdCBjb21wb3NlZFN1YnN0aXR1dGVyID0gc3Vic3RpdHV0ZUV4cHJlc3Npb24gJiYgdGhpcy5vcHRpb25zLnN1YnN0aXR1dGVFeHByZXNzaW9uID9cbiAgICAgICAgKHZhbHVlOiBNZXRhZGF0YVZhbHVlLCBub2RlOiB0cy5Ob2RlKSA9PlxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnN1YnN0aXR1dGVFeHByZXNzaW9uICEoc3Vic3RpdHV0ZUV4cHJlc3Npb24odmFsdWUsIG5vZGUpLCBub2RlKSA6XG4gICAgICAgIHN1YnN0aXR1dGVFeHByZXNzaW9uO1xuICAgIGNvbnN0IGV2YWx1YXRvck9wdGlvbnMgPSBzdWJzdGl0dXRlRXhwcmVzc2lvbiA/XG4gICAgICAgIHsuLi50aGlzLm9wdGlvbnMsIHN1YnN0aXR1dGVFeHByZXNzaW9uOiBjb21wb3NlZFN1YnN0aXR1dGVyfSA6XG4gICAgICAgIHRoaXMub3B0aW9ucztcbiAgICBsZXQgbWV0YWRhdGE6IHtbbmFtZTogc3RyaW5nXTogTWV0YWRhdGFWYWx1ZSB8IENsYXNzTWV0YWRhdGEgfCBGdW5jdGlvbk1ldGFkYXRhfXx1bmRlZmluZWQ7XG4gICAgY29uc3QgZXZhbHVhdG9yID0gbmV3IEV2YWx1YXRvcihsb2NhbHMsIG5vZGVNYXAsIGV2YWx1YXRvck9wdGlvbnMsIChuYW1lLCB2YWx1ZSkgPT4ge1xuICAgICAgaWYgKCFtZXRhZGF0YSkgbWV0YWRhdGEgPSB7fTtcbiAgICAgIG1ldGFkYXRhW25hbWVdID0gdmFsdWU7XG4gICAgfSk7XG4gICAgbGV0IGV4cG9ydHM6IE1vZHVsZUV4cG9ydE1ldGFkYXRhW118dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gICAgZnVuY3Rpb24gb2JqRnJvbURlY29yYXRvcihkZWNvcmF0b3JOb2RlOiB0cy5EZWNvcmF0b3IpOiBNZXRhZGF0YVN5bWJvbGljRXhwcmVzc2lvbiB7XG4gICAgICByZXR1cm4gPE1ldGFkYXRhU3ltYm9saWNFeHByZXNzaW9uPmV2YWx1YXRvci5ldmFsdWF0ZU5vZGUoZGVjb3JhdG9yTm9kZS5leHByZXNzaW9uKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWNvcmRFbnRyeTxUIGV4dGVuZHMgTWV0YWRhdGFFbnRyeT4oZW50cnk6IFQsIG5vZGU6IHRzLk5vZGUpOiBUIHtcbiAgICAgIGlmIChjb21wb3NlZFN1YnN0aXR1dGVyKSB7XG4gICAgICAgIGVudHJ5ID0gY29tcG9zZWRTdWJzdGl0dXRlcihlbnRyeSBhcyBNZXRhZGF0YVZhbHVlLCBub2RlKSBhcyBUO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlY29yZE1hcEVudHJ5KGVudHJ5LCBub2RlLCBub2RlTWFwLCBzb3VyY2VGaWxlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBlcnJvclN5bShcbiAgICAgICAgbWVzc2FnZTogc3RyaW5nLCBub2RlPzogdHMuTm9kZSwgY29udGV4dD86IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfSk6IE1ldGFkYXRhRXJyb3Ige1xuICAgICAgcmV0dXJuIGVycm9yU3ltYm9sKG1lc3NhZ2UsIG5vZGUsIGNvbnRleHQsIHNvdXJjZUZpbGUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1heWJlR2V0U2ltcGxlRnVuY3Rpb24oXG4gICAgICAgIGZ1bmN0aW9uRGVjbGFyYXRpb246IHRzLkZ1bmN0aW9uRGVjbGFyYXRpb24gfFxuICAgICAgICB0cy5NZXRob2REZWNsYXJhdGlvbik6IHtmdW5jOiBGdW5jdGlvbk1ldGFkYXRhLCBuYW1lOiBzdHJpbmd9fHVuZGVmaW5lZCB7XG4gICAgICBpZiAoZnVuY3Rpb25EZWNsYXJhdGlvbi5uYW1lICYmIGZ1bmN0aW9uRGVjbGFyYXRpb24ubmFtZS5raW5kID09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgICAgICBjb25zdCBuYW1lTm9kZSA9IDx0cy5JZGVudGlmaWVyPmZ1bmN0aW9uRGVjbGFyYXRpb24ubmFtZTtcbiAgICAgICAgY29uc3QgZnVuY3Rpb25OYW1lID0gbmFtZU5vZGUudGV4dDtcbiAgICAgICAgY29uc3QgZnVuY3Rpb25Cb2R5ID0gZnVuY3Rpb25EZWNsYXJhdGlvbi5ib2R5O1xuICAgICAgICBpZiAoZnVuY3Rpb25Cb2R5ICYmIGZ1bmN0aW9uQm9keS5zdGF0ZW1lbnRzLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgY29uc3Qgc3RhdGVtZW50ID0gZnVuY3Rpb25Cb2R5LnN0YXRlbWVudHNbMF07XG4gICAgICAgICAgaWYgKHN0YXRlbWVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLlJldHVyblN0YXRlbWVudCkge1xuICAgICAgICAgICAgY29uc3QgcmV0dXJuU3RhdGVtZW50ID0gPHRzLlJldHVyblN0YXRlbWVudD5zdGF0ZW1lbnQ7XG4gICAgICAgICAgICBpZiAocmV0dXJuU3RhdGVtZW50LmV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgY29uc3QgZnVuYzogRnVuY3Rpb25NZXRhZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBfX3N5bWJvbGljOiAnZnVuY3Rpb24nLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IG5hbWVzT2YoZnVuY3Rpb25EZWNsYXJhdGlvbi5wYXJhbWV0ZXJzKSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogZXZhbHVhdG9yLmV2YWx1YXRlTm9kZShyZXR1cm5TdGF0ZW1lbnQuZXhwcmVzc2lvbilcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgaWYgKGZ1bmN0aW9uRGVjbGFyYXRpb24ucGFyYW1ldGVycy5zb21lKHAgPT4gcC5pbml0aWFsaXplciAhPSBudWxsKSkge1xuICAgICAgICAgICAgICAgIGZ1bmMuZGVmYXVsdHMgPSBmdW5jdGlvbkRlY2xhcmF0aW9uLnBhcmFtZXRlcnMubWFwKFxuICAgICAgICAgICAgICAgICAgICBwID0+IHAuaW5pdGlhbGl6ZXIgJiYgZXZhbHVhdG9yLmV2YWx1YXRlTm9kZShwLmluaXRpYWxpemVyKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHJlY29yZEVudHJ5KHtmdW5jLCBuYW1lOiBmdW5jdGlvbk5hbWV9LCBmdW5jdGlvbkRlY2xhcmF0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjbGFzc01ldGFkYXRhT2YoY2xhc3NEZWNsYXJhdGlvbjogdHMuQ2xhc3NEZWNsYXJhdGlvbik6IENsYXNzTWV0YWRhdGEge1xuICAgICAgY29uc3QgcmVzdWx0OiBDbGFzc01ldGFkYXRhID0ge19fc3ltYm9saWM6ICdjbGFzcyd9O1xuXG4gICAgICBmdW5jdGlvbiBnZXREZWNvcmF0b3JzKGRlY29yYXRvcnM6IFJlYWRvbmx5QXJyYXk8dHMuRGVjb3JhdG9yPnwgdW5kZWZpbmVkKTpcbiAgICAgICAgICBNZXRhZGF0YVN5bWJvbGljRXhwcmVzc2lvbltdfHVuZGVmaW5lZCB7XG4gICAgICAgIGlmIChkZWNvcmF0b3JzICYmIGRlY29yYXRvcnMubGVuZ3RoKVxuICAgICAgICAgIHJldHVybiBkZWNvcmF0b3JzLm1hcChkZWNvcmF0b3IgPT4gb2JqRnJvbURlY29yYXRvcihkZWNvcmF0b3IpKTtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcmVmZXJlbmNlRnJvbShub2RlOiB0cy5Ob2RlKTogTWV0YWRhdGFTeW1ib2xpY1JlZmVyZW5jZUV4cHJlc3Npb258TWV0YWRhdGFFcnJvcnxcbiAgICAgICAgICBNZXRhZGF0YVN5bWJvbGljU2VsZWN0RXhwcmVzc2lvbiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGV2YWx1YXRvci5ldmFsdWF0ZU5vZGUobm9kZSk7XG4gICAgICAgIGlmIChpc01ldGFkYXRhRXJyb3IocmVzdWx0KSB8fCBpc01ldGFkYXRhU3ltYm9saWNSZWZlcmVuY2VFeHByZXNzaW9uKHJlc3VsdCkgfHxcbiAgICAgICAgICAgIGlzTWV0YWRhdGFTeW1ib2xpY1NlbGVjdEV4cHJlc3Npb24ocmVzdWx0KSkge1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGVycm9yU3ltKCdTeW1ib2wgcmVmZXJlbmNlIGV4cGVjdGVkJywgbm9kZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gQWRkIGNsYXNzIHBhcmVudHNcbiAgICAgIGlmIChjbGFzc0RlY2xhcmF0aW9uLmhlcml0YWdlQ2xhdXNlcykge1xuICAgICAgICBjbGFzc0RlY2xhcmF0aW9uLmhlcml0YWdlQ2xhdXNlcy5mb3JFYWNoKChoYykgPT4ge1xuICAgICAgICAgIGlmIChoYy50b2tlbiA9PT0gdHMuU3ludGF4S2luZC5FeHRlbmRzS2V5d29yZCAmJiBoYy50eXBlcykge1xuICAgICAgICAgICAgaGMudHlwZXMuZm9yRWFjaCh0eXBlID0+IHJlc3VsdC5leHRlbmRzID0gcmVmZXJlbmNlRnJvbSh0eXBlLmV4cHJlc3Npb24pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBBZGQgYXJpdHkgaWYgdGhlIHR5cGUgaXMgZ2VuZXJpY1xuICAgICAgY29uc3QgdHlwZVBhcmFtZXRlcnMgPSBjbGFzc0RlY2xhcmF0aW9uLnR5cGVQYXJhbWV0ZXJzO1xuICAgICAgaWYgKHR5cGVQYXJhbWV0ZXJzICYmIHR5cGVQYXJhbWV0ZXJzLmxlbmd0aCkge1xuICAgICAgICByZXN1bHQuYXJpdHkgPSB0eXBlUGFyYW1ldGVycy5sZW5ndGg7XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZCBjbGFzcyBkZWNvcmF0b3JzXG4gICAgICBpZiAoY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzKSB7XG4gICAgICAgIHJlc3VsdC5kZWNvcmF0b3JzID0gZ2V0RGVjb3JhdG9ycyhjbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnMpO1xuICAgICAgfVxuXG4gICAgICAvLyBtZW1iZXIgZGVjb3JhdG9yc1xuICAgICAgbGV0IG1lbWJlcnM6IE1ldGFkYXRhTWFwfG51bGwgPSBudWxsO1xuICAgICAgZnVuY3Rpb24gcmVjb3JkTWVtYmVyKG5hbWU6IHN0cmluZywgbWV0YWRhdGE6IE1lbWJlck1ldGFkYXRhKSB7XG4gICAgICAgIGlmICghbWVtYmVycykgbWVtYmVycyA9IHt9O1xuICAgICAgICBjb25zdCBkYXRhID0gbWVtYmVycy5oYXNPd25Qcm9wZXJ0eShuYW1lKSA/IG1lbWJlcnNbbmFtZV0gOiBbXTtcbiAgICAgICAgZGF0YS5wdXNoKG1ldGFkYXRhKTtcbiAgICAgICAgbWVtYmVyc1tuYW1lXSA9IGRhdGE7XG4gICAgICB9XG5cbiAgICAgIC8vIHN0YXRpYyBtZW1iZXJcbiAgICAgIGxldCBzdGF0aWNzOiB7W25hbWU6IHN0cmluZ106IE1ldGFkYXRhVmFsdWUgfCBGdW5jdGlvbk1ldGFkYXRhfXxudWxsID0gbnVsbDtcbiAgICAgIGZ1bmN0aW9uIHJlY29yZFN0YXRpY01lbWJlcihuYW1lOiBzdHJpbmcsIHZhbHVlOiBNZXRhZGF0YVZhbHVlIHwgRnVuY3Rpb25NZXRhZGF0YSkge1xuICAgICAgICBpZiAoIXN0YXRpY3MpIHN0YXRpY3MgPSB7fTtcbiAgICAgICAgc3RhdGljc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IG1lbWJlciBvZiBjbGFzc0RlY2xhcmF0aW9uLm1lbWJlcnMpIHtcbiAgICAgICAgbGV0IGlzQ29uc3RydWN0b3IgPSBmYWxzZTtcbiAgICAgICAgc3dpdGNoIChtZW1iZXIua2luZCkge1xuICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Db25zdHJ1Y3RvcjpcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTWV0aG9kRGVjbGFyYXRpb246XG4gICAgICAgICAgICBpc0NvbnN0cnVjdG9yID0gbWVtYmVyLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuQ29uc3RydWN0b3I7XG4gICAgICAgICAgICBjb25zdCBtZXRob2QgPSA8dHMuTWV0aG9kRGVjbGFyYXRpb258dHMuQ29uc3RydWN0b3JEZWNsYXJhdGlvbj5tZW1iZXI7XG4gICAgICAgICAgICBpZiAoaXNTdGF0aWMobWV0aG9kKSkge1xuICAgICAgICAgICAgICBjb25zdCBtYXliZUZ1bmMgPSBtYXliZUdldFNpbXBsZUZ1bmN0aW9uKDx0cy5NZXRob2REZWNsYXJhdGlvbj5tZXRob2QpO1xuICAgICAgICAgICAgICBpZiAobWF5YmVGdW5jKSB7XG4gICAgICAgICAgICAgICAgcmVjb3JkU3RhdGljTWVtYmVyKG1heWJlRnVuYy5uYW1lLCBtYXliZUZ1bmMuZnVuYyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBtZXRob2REZWNvcmF0b3JzID0gZ2V0RGVjb3JhdG9ycyhtZXRob2QuZGVjb3JhdG9ycyk7XG4gICAgICAgICAgICBjb25zdCBwYXJhbWV0ZXJzID0gbWV0aG9kLnBhcmFtZXRlcnM7XG4gICAgICAgICAgICBjb25zdCBwYXJhbWV0ZXJEZWNvcmF0b3JEYXRhOlxuICAgICAgICAgICAgICAgICgoTWV0YWRhdGFTeW1ib2xpY0V4cHJlc3Npb24gfCBNZXRhZGF0YUVycm9yKVtdIHwgdW5kZWZpbmVkKVtdID0gW107XG4gICAgICAgICAgICBjb25zdCBwYXJhbWV0ZXJzRGF0YTpcbiAgICAgICAgICAgICAgICAoTWV0YWRhdGFTeW1ib2xpY1JlZmVyZW5jZUV4cHJlc3Npb24gfCBNZXRhZGF0YUVycm9yIHxcbiAgICAgICAgICAgICAgICAgTWV0YWRhdGFTeW1ib2xpY1NlbGVjdEV4cHJlc3Npb24gfCBudWxsKVtdID0gW107XG4gICAgICAgICAgICBsZXQgaGFzRGVjb3JhdG9yRGF0YTogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgICAgICAgbGV0IGhhc1BhcmFtZXRlckRhdGE6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcGFyYW1ldGVyIG9mIHBhcmFtZXRlcnMpIHtcbiAgICAgICAgICAgICAgY29uc3QgcGFyYW1ldGVyRGF0YSA9IGdldERlY29yYXRvcnMocGFyYW1ldGVyLmRlY29yYXRvcnMpO1xuICAgICAgICAgICAgICBwYXJhbWV0ZXJEZWNvcmF0b3JEYXRhLnB1c2gocGFyYW1ldGVyRGF0YSk7XG4gICAgICAgICAgICAgIGhhc0RlY29yYXRvckRhdGEgPSBoYXNEZWNvcmF0b3JEYXRhIHx8ICEhcGFyYW1ldGVyRGF0YTtcbiAgICAgICAgICAgICAgaWYgKGlzQ29uc3RydWN0b3IpIHtcbiAgICAgICAgICAgICAgICBpZiAocGFyYW1ldGVyLnR5cGUpIHtcbiAgICAgICAgICAgICAgICAgIHBhcmFtZXRlcnNEYXRhLnB1c2gocmVmZXJlbmNlRnJvbShwYXJhbWV0ZXIudHlwZSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzRGF0YS5wdXNoKG51bGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBoYXNQYXJhbWV0ZXJEYXRhID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZGF0YTogTWV0aG9kTWV0YWRhdGEgPSB7X19zeW1ib2xpYzogaXNDb25zdHJ1Y3RvciA/ICdjb25zdHJ1Y3RvcicgOiAnbWV0aG9kJ307XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gaXNDb25zdHJ1Y3RvciA/ICdfX2N0b3JfXycgOiBldmFsdWF0b3IubmFtZU9mKG1lbWJlci5uYW1lKTtcbiAgICAgICAgICAgIGlmIChtZXRob2REZWNvcmF0b3JzKSB7XG4gICAgICAgICAgICAgIGRhdGEuZGVjb3JhdG9ycyA9IG1ldGhvZERlY29yYXRvcnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaGFzRGVjb3JhdG9yRGF0YSkge1xuICAgICAgICAgICAgICBkYXRhLnBhcmFtZXRlckRlY29yYXRvcnMgPSBwYXJhbWV0ZXJEZWNvcmF0b3JEYXRhO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGhhc1BhcmFtZXRlckRhdGEpIHtcbiAgICAgICAgICAgICAgKDxDb25zdHJ1Y3Rvck1ldGFkYXRhPmRhdGEpLnBhcmFtZXRlcnMgPSBwYXJhbWV0ZXJzRGF0YTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNNZXRhZGF0YUVycm9yKG5hbWUpKSB7XG4gICAgICAgICAgICAgIHJlY29yZE1lbWJlcihuYW1lLCBkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Qcm9wZXJ0eURlY2xhcmF0aW9uOlxuICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5HZXRBY2Nlc3NvcjpcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU2V0QWNjZXNzb3I6XG4gICAgICAgICAgICBjb25zdCBwcm9wZXJ0eSA9IDx0cy5Qcm9wZXJ0eURlY2xhcmF0aW9uPm1lbWJlcjtcbiAgICAgICAgICAgIGlmIChpc1N0YXRpYyhwcm9wZXJ0eSkpIHtcbiAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGV2YWx1YXRvci5uYW1lT2YocHJvcGVydHkubmFtZSk7XG4gICAgICAgICAgICAgIGlmICghaXNNZXRhZGF0YUVycm9yKG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5LmluaXRpYWxpemVyKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGV2YWx1YXRvci5ldmFsdWF0ZU5vZGUocHJvcGVydHkuaW5pdGlhbGl6ZXIpO1xuICAgICAgICAgICAgICAgICAgcmVjb3JkU3RhdGljTWVtYmVyKG5hbWUsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmVjb3JkU3RhdGljTWVtYmVyKG5hbWUsIGVycm9yU3ltKCdWYXJpYWJsZSBub3QgaW5pdGlhbGl6ZWQnLCBwcm9wZXJ0eS5uYW1lKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwcm9wZXJ0eURlY29yYXRvcnMgPSBnZXREZWNvcmF0b3JzKHByb3BlcnR5LmRlY29yYXRvcnMpO1xuICAgICAgICAgICAgaWYgKHByb3BlcnR5RGVjb3JhdG9ycykge1xuICAgICAgICAgICAgICBjb25zdCBuYW1lID0gZXZhbHVhdG9yLm5hbWVPZihwcm9wZXJ0eS5uYW1lKTtcbiAgICAgICAgICAgICAgaWYgKCFpc01ldGFkYXRhRXJyb3IobmFtZSkpIHtcbiAgICAgICAgICAgICAgICByZWNvcmRNZW1iZXIobmFtZSwge19fc3ltYm9saWM6ICdwcm9wZXJ0eScsIGRlY29yYXRvcnM6IHByb3BlcnR5RGVjb3JhdG9yc30pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG1lbWJlcnMpIHtcbiAgICAgICAgcmVzdWx0Lm1lbWJlcnMgPSBtZW1iZXJzO1xuICAgICAgfVxuICAgICAgaWYgKHN0YXRpY3MpIHtcbiAgICAgICAgcmVzdWx0LnN0YXRpY3MgPSBzdGF0aWNzO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVjb3JkRW50cnkocmVzdWx0LCBjbGFzc0RlY2xhcmF0aW9uKTtcbiAgICB9XG5cbiAgICAvLyBDb2xsZWN0IGFsbCBleHBvcnRlZCBzeW1ib2xzIGZyb20gYW4gZXhwb3J0cyBjbGF1c2UuXG4gICAgY29uc3QgZXhwb3J0TWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgICB0cy5mb3JFYWNoQ2hpbGQoc291cmNlRmlsZSwgbm9kZSA9PiB7XG4gICAgICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRXhwb3J0RGVjbGFyYXRpb246XG4gICAgICAgICAgY29uc3QgZXhwb3J0RGVjbGFyYXRpb24gPSA8dHMuRXhwb3J0RGVjbGFyYXRpb24+bm9kZTtcbiAgICAgICAgICBjb25zdCB7bW9kdWxlU3BlY2lmaWVyLCBleHBvcnRDbGF1c2V9ID0gZXhwb3J0RGVjbGFyYXRpb247XG5cbiAgICAgICAgICBpZiAoIW1vZHVsZVNwZWNpZmllcikge1xuICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSBtb2R1bGUgc3BlY2lmaWVyIHRoZXJlIGlzIGFsc28gYW4gZXhwb3J0Q2xhdXNlXG4gICAgICAgICAgICBleHBvcnRDbGF1c2UgIS5lbGVtZW50cy5mb3JFYWNoKHNwZWMgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBleHBvcnRlZEFzID0gc3BlYy5uYW1lLnRleHQ7XG4gICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSAoc3BlYy5wcm9wZXJ0eU5hbWUgfHwgc3BlYy5uYW1lKS50ZXh0O1xuICAgICAgICAgICAgICBleHBvcnRNYXAuc2V0KG5hbWUsIGV4cG9ydGVkQXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgaXNFeHBvcnQgPSAobm9kZTogdHMuTm9kZSkgPT4gc291cmNlRmlsZS5pc0RlY2xhcmF0aW9uRmlsZSB8fFxuICAgICAgICB0cy5nZXRDb21iaW5lZE1vZGlmaWVyRmxhZ3Mobm9kZSBhcyB0cy5EZWNsYXJhdGlvbikgJiB0cy5Nb2RpZmllckZsYWdzLkV4cG9ydDtcbiAgICBjb25zdCBpc0V4cG9ydGVkSWRlbnRpZmllciA9IChpZGVudGlmaWVyPzogdHMuSWRlbnRpZmllcikgPT5cbiAgICAgICAgaWRlbnRpZmllciAmJiBleHBvcnRNYXAuaGFzKGlkZW50aWZpZXIudGV4dCk7XG4gICAgY29uc3QgaXNFeHBvcnRlZCA9XG4gICAgICAgIChub2RlOiB0cy5GdW5jdGlvbkRlY2xhcmF0aW9uIHwgdHMuQ2xhc3NEZWNsYXJhdGlvbiB8IHRzLlR5cGVBbGlhc0RlY2xhcmF0aW9uIHxcbiAgICAgICAgIHRzLkludGVyZmFjZURlY2xhcmF0aW9uIHwgdHMuRW51bURlY2xhcmF0aW9uKSA9PlxuICAgICAgICAgICAgaXNFeHBvcnQobm9kZSkgfHwgaXNFeHBvcnRlZElkZW50aWZpZXIobm9kZS5uYW1lKTtcbiAgICBjb25zdCBleHBvcnRlZElkZW50aWZpZXJOYW1lID0gKGlkZW50aWZpZXI/OiB0cy5JZGVudGlmaWVyKSA9PlxuICAgICAgICBpZGVudGlmaWVyICYmIChleHBvcnRNYXAuZ2V0KGlkZW50aWZpZXIudGV4dCkgfHwgaWRlbnRpZmllci50ZXh0KTtcbiAgICBjb25zdCBleHBvcnRlZE5hbWUgPVxuICAgICAgICAobm9kZTogdHMuRnVuY3Rpb25EZWNsYXJhdGlvbiB8IHRzLkNsYXNzRGVjbGFyYXRpb24gfCB0cy5JbnRlcmZhY2VEZWNsYXJhdGlvbiB8XG4gICAgICAgICB0cy5UeXBlQWxpYXNEZWNsYXJhdGlvbiB8IHRzLkVudW1EZWNsYXJhdGlvbikgPT4gZXhwb3J0ZWRJZGVudGlmaWVyTmFtZShub2RlLm5hbWUpO1xuXG5cbiAgICAvLyBQcmUtZGVjbGFyZSBjbGFzc2VzIGFuZCBmdW5jdGlvbnNcbiAgICB0cy5mb3JFYWNoQ2hpbGQoc291cmNlRmlsZSwgbm9kZSA9PiB7XG4gICAgICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xhc3NEZWNsYXJhdGlvbjpcbiAgICAgICAgICBjb25zdCBjbGFzc0RlY2xhcmF0aW9uID0gPHRzLkNsYXNzRGVjbGFyYXRpb24+bm9kZTtcbiAgICAgICAgICBpZiAoY2xhc3NEZWNsYXJhdGlvbi5uYW1lKSB7XG4gICAgICAgICAgICBjb25zdCBjbGFzc05hbWUgPSBjbGFzc0RlY2xhcmF0aW9uLm5hbWUudGV4dDtcbiAgICAgICAgICAgIGlmIChpc0V4cG9ydGVkKGNsYXNzRGVjbGFyYXRpb24pKSB7XG4gICAgICAgICAgICAgIGxvY2Fscy5kZWZpbmUoXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWUsIHtfX3N5bWJvbGljOiAncmVmZXJlbmNlJywgbmFtZTogZXhwb3J0ZWROYW1lKGNsYXNzRGVjbGFyYXRpb24pfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBsb2NhbHMuZGVmaW5lKFxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lLCBlcnJvclN5bSgnUmVmZXJlbmNlIHRvIG5vbi1leHBvcnRlZCBjbGFzcycsIG5vZGUsIHtjbGFzc05hbWV9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5JbnRlcmZhY2VEZWNsYXJhdGlvbjpcbiAgICAgICAgICBjb25zdCBpbnRlcmZhY2VEZWNsYXJhdGlvbiA9IDx0cy5JbnRlcmZhY2VEZWNsYXJhdGlvbj5ub2RlO1xuICAgICAgICAgIGlmIChpbnRlcmZhY2VEZWNsYXJhdGlvbi5uYW1lKSB7XG4gICAgICAgICAgICBjb25zdCBpbnRlcmZhY2VOYW1lID0gaW50ZXJmYWNlRGVjbGFyYXRpb24ubmFtZS50ZXh0O1xuICAgICAgICAgICAgLy8gQWxsIHJlZmVyZW5jZXMgdG8gaW50ZXJmYWNlcyBzaG91bGQgYmUgY29udmVydGVkIHRvIHJlZmVyZW5jZXMgdG8gYGFueWAuXG4gICAgICAgICAgICBsb2NhbHMuZGVmaW5lKGludGVyZmFjZU5hbWUsIHtfX3N5bWJvbGljOiAncmVmZXJlbmNlJywgbmFtZTogJ2FueSd9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZ1bmN0aW9uRGVjbGFyYXRpb246XG4gICAgICAgICAgY29uc3QgZnVuY3Rpb25EZWNsYXJhdGlvbiA9IDx0cy5GdW5jdGlvbkRlY2xhcmF0aW9uPm5vZGU7XG4gICAgICAgICAgaWYgKCFpc0V4cG9ydGVkKGZ1bmN0aW9uRGVjbGFyYXRpb24pKSB7XG4gICAgICAgICAgICAvLyBSZXBvcnQgcmVmZXJlbmNlcyB0byB0aGlzIGZ1bmN0aW9uIGFzIGFuIGVycm9yLlxuICAgICAgICAgICAgY29uc3QgbmFtZU5vZGUgPSBmdW5jdGlvbkRlY2xhcmF0aW9uLm5hbWU7XG4gICAgICAgICAgICBpZiAobmFtZU5vZGUgJiYgbmFtZU5vZGUudGV4dCkge1xuICAgICAgICAgICAgICBsb2NhbHMuZGVmaW5lKFxuICAgICAgICAgICAgICAgICAgbmFtZU5vZGUudGV4dCxcbiAgICAgICAgICAgICAgICAgIGVycm9yU3ltKFxuICAgICAgICAgICAgICAgICAgICAgICdSZWZlcmVuY2UgdG8gYSBub24tZXhwb3J0ZWQgZnVuY3Rpb24nLCBuYW1lTm9kZSwge25hbWU6IG5hbWVOb2RlLnRleHR9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdHMuZm9yRWFjaENoaWxkKHNvdXJjZUZpbGUsIG5vZGUgPT4ge1xuICAgICAgc3dpdGNoIChub2RlLmtpbmQpIHtcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkV4cG9ydERlY2xhcmF0aW9uOlxuICAgICAgICAgIC8vIFJlY29yZCBleHBvcnQgZGVjbGFyYXRpb25zXG4gICAgICAgICAgY29uc3QgZXhwb3J0RGVjbGFyYXRpb24gPSA8dHMuRXhwb3J0RGVjbGFyYXRpb24+bm9kZTtcbiAgICAgICAgICBjb25zdCB7bW9kdWxlU3BlY2lmaWVyLCBleHBvcnRDbGF1c2V9ID0gZXhwb3J0RGVjbGFyYXRpb247XG5cbiAgICAgICAgICBpZiAoIW1vZHVsZVNwZWNpZmllcikge1xuICAgICAgICAgICAgLy8gbm8gbW9kdWxlIHNwZWNpZmllciAtPiBleHBvcnQge3Byb3BOYW1lIGFzIG5hbWV9O1xuICAgICAgICAgICAgaWYgKGV4cG9ydENsYXVzZSkge1xuICAgICAgICAgICAgICBleHBvcnRDbGF1c2UuZWxlbWVudHMuZm9yRWFjaChzcGVjID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gc3BlYy5uYW1lLnRleHQ7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHN5bWJvbCB3YXMgbm90IGFscmVhZHkgZXhwb3J0ZWQsIGV4cG9ydCBhIHJlZmVyZW5jZSBzaW5jZSBpdCBpcyBhXG4gICAgICAgICAgICAgICAgLy8gcmVmZXJlbmNlIHRvIGFuIGltcG9ydFxuICAgICAgICAgICAgICAgIGlmICghbWV0YWRhdGEgfHwgIW1ldGFkYXRhW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBwcm9wTm9kZSA9IHNwZWMucHJvcGVydHlOYW1lIHx8IHNwZWMubmFtZTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlOiBNZXRhZGF0YVZhbHVlID0gZXZhbHVhdG9yLmV2YWx1YXRlTm9kZShwcm9wTm9kZSk7XG4gICAgICAgICAgICAgICAgICBpZiAoIW1ldGFkYXRhKSBtZXRhZGF0YSA9IHt9O1xuICAgICAgICAgICAgICAgICAgbWV0YWRhdGFbbmFtZV0gPSByZWNvcmRFbnRyeSh2YWx1ZSwgbm9kZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobW9kdWxlU3BlY2lmaWVyICYmIG1vZHVsZVNwZWNpZmllci5raW5kID09IHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbCkge1xuICAgICAgICAgICAgLy8gSWdub3JlIGV4cG9ydHMgdGhhdCBkb24ndCBoYXZlIHN0cmluZyBsaXRlcmFscyBhcyBleHBvcnRzLlxuICAgICAgICAgICAgLy8gVGhpcyBpcyBhbGxvd2VkIGJ5IHRoZSBzeW50YXggYnV0IHdpbGwgYmUgZmxhZ2dlZCBhcyBhbiBlcnJvciBieSB0aGUgdHlwZSBjaGVja2VyLlxuICAgICAgICAgICAgY29uc3QgZnJvbSA9ICg8dHMuU3RyaW5nTGl0ZXJhbD5tb2R1bGVTcGVjaWZpZXIpLnRleHQ7XG4gICAgICAgICAgICBjb25zdCBtb2R1bGVFeHBvcnQ6IE1vZHVsZUV4cG9ydE1ldGFkYXRhID0ge2Zyb219O1xuICAgICAgICAgICAgaWYgKGV4cG9ydENsYXVzZSkge1xuICAgICAgICAgICAgICBtb2R1bGVFeHBvcnQuZXhwb3J0ID0gZXhwb3J0Q2xhdXNlLmVsZW1lbnRzLm1hcChcbiAgICAgICAgICAgICAgICAgIHNwZWMgPT4gc3BlYy5wcm9wZXJ0eU5hbWUgPyB7bmFtZTogc3BlYy5wcm9wZXJ0eU5hbWUudGV4dCwgYXM6IHNwZWMubmFtZS50ZXh0fSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlYy5uYW1lLnRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFleHBvcnRzKSBleHBvcnRzID0gW107XG4gICAgICAgICAgICBleHBvcnRzLnB1c2gobW9kdWxlRXhwb3J0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uOlxuICAgICAgICAgIGNvbnN0IGNsYXNzRGVjbGFyYXRpb24gPSA8dHMuQ2xhc3NEZWNsYXJhdGlvbj5ub2RlO1xuICAgICAgICAgIGlmIChjbGFzc0RlY2xhcmF0aW9uLm5hbWUpIHtcbiAgICAgICAgICAgIGlmIChpc0V4cG9ydGVkKGNsYXNzRGVjbGFyYXRpb24pKSB7XG4gICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBleHBvcnRlZE5hbWUoY2xhc3NEZWNsYXJhdGlvbik7XG4gICAgICAgICAgICAgIGlmIChuYW1lKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFtZXRhZGF0YSkgbWV0YWRhdGEgPSB7fTtcbiAgICAgICAgICAgICAgICBtZXRhZGF0YVtuYW1lXSA9IGNsYXNzTWV0YWRhdGFPZihjbGFzc0RlY2xhcmF0aW9uKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBPdGhlcndpc2UgZG9uJ3QgcmVjb3JkIG1ldGFkYXRhIGZvciB0aGUgY2xhc3MuXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlR5cGVBbGlhc0RlY2xhcmF0aW9uOlxuICAgICAgICAgIGNvbnN0IHR5cGVEZWNsYXJhdGlvbiA9IDx0cy5UeXBlQWxpYXNEZWNsYXJhdGlvbj5ub2RlO1xuICAgICAgICAgIGlmICh0eXBlRGVjbGFyYXRpb24ubmFtZSAmJiBpc0V4cG9ydGVkKHR5cGVEZWNsYXJhdGlvbikpIHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBleHBvcnRlZE5hbWUodHlwZURlY2xhcmF0aW9uKTtcbiAgICAgICAgICAgIGlmIChuYW1lKSB7XG4gICAgICAgICAgICAgIGlmICghbWV0YWRhdGEpIG1ldGFkYXRhID0ge307XG4gICAgICAgICAgICAgIG1ldGFkYXRhW25hbWVdID0ge19fc3ltYm9saWM6ICdpbnRlcmZhY2UnfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkludGVyZmFjZURlY2xhcmF0aW9uOlxuICAgICAgICAgIGNvbnN0IGludGVyZmFjZURlY2xhcmF0aW9uID0gPHRzLkludGVyZmFjZURlY2xhcmF0aW9uPm5vZGU7XG4gICAgICAgICAgaWYgKGludGVyZmFjZURlY2xhcmF0aW9uLm5hbWUgJiYgaXNFeHBvcnRlZChpbnRlcmZhY2VEZWNsYXJhdGlvbikpIHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBleHBvcnRlZE5hbWUoaW50ZXJmYWNlRGVjbGFyYXRpb24pO1xuICAgICAgICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgICAgICAgaWYgKCFtZXRhZGF0YSkgbWV0YWRhdGEgPSB7fTtcbiAgICAgICAgICAgICAgbWV0YWRhdGFbbmFtZV0gPSB7X19zeW1ib2xpYzogJ2ludGVyZmFjZSd9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRnVuY3Rpb25EZWNsYXJhdGlvbjpcbiAgICAgICAgICAvLyBSZWNvcmQgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIGEgc2luZ2xlIHZhbHVlLiBSZWNvcmQgdGhlIHBhcmFtZXRlclxuICAgICAgICAgIC8vIG5hbWVzIHN1YnN0aXR1dGlvbiB3aWxsIGJlIHBlcmZvcm1lZCBieSB0aGUgU3RhdGljUmVmbGVjdG9yLlxuICAgICAgICAgIGNvbnN0IGZ1bmN0aW9uRGVjbGFyYXRpb24gPSA8dHMuRnVuY3Rpb25EZWNsYXJhdGlvbj5ub2RlO1xuICAgICAgICAgIGlmIChpc0V4cG9ydGVkKGZ1bmN0aW9uRGVjbGFyYXRpb24pICYmIGZ1bmN0aW9uRGVjbGFyYXRpb24ubmFtZSkge1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IGV4cG9ydGVkTmFtZShmdW5jdGlvbkRlY2xhcmF0aW9uKTtcbiAgICAgICAgICAgIGNvbnN0IG1heWJlRnVuYyA9IG1heWJlR2V0U2ltcGxlRnVuY3Rpb24oZnVuY3Rpb25EZWNsYXJhdGlvbik7XG4gICAgICAgICAgICBpZiAobmFtZSkge1xuICAgICAgICAgICAgICBpZiAoIW1ldGFkYXRhKSBtZXRhZGF0YSA9IHt9O1xuICAgICAgICAgICAgICBtZXRhZGF0YVtuYW1lXSA9XG4gICAgICAgICAgICAgICAgICBtYXliZUZ1bmMgPyByZWNvcmRFbnRyeShtYXliZUZ1bmMuZnVuYywgbm9kZSkgOiB7X19zeW1ib2xpYzogJ2Z1bmN0aW9uJ307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5FbnVtRGVjbGFyYXRpb246XG4gICAgICAgICAgY29uc3QgZW51bURlY2xhcmF0aW9uID0gPHRzLkVudW1EZWNsYXJhdGlvbj5ub2RlO1xuICAgICAgICAgIGlmIChpc0V4cG9ydGVkKGVudW1EZWNsYXJhdGlvbikpIHtcbiAgICAgICAgICAgIGNvbnN0IGVudW1WYWx1ZUhvbGRlcjoge1tuYW1lOiBzdHJpbmddOiBNZXRhZGF0YVZhbHVlfSA9IHt9O1xuICAgICAgICAgICAgY29uc3QgZW51bU5hbWUgPSBleHBvcnRlZE5hbWUoZW51bURlY2xhcmF0aW9uKTtcbiAgICAgICAgICAgIGxldCBuZXh0RGVmYXVsdFZhbHVlOiBNZXRhZGF0YVZhbHVlID0gMDtcbiAgICAgICAgICAgIGxldCB3cml0dGVuTWVtYmVycyA9IDA7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG1lbWJlciBvZiBlbnVtRGVjbGFyYXRpb24ubWVtYmVycykge1xuICAgICAgICAgICAgICBsZXQgZW51bVZhbHVlOiBNZXRhZGF0YVZhbHVlO1xuICAgICAgICAgICAgICBpZiAoIW1lbWJlci5pbml0aWFsaXplcikge1xuICAgICAgICAgICAgICAgIGVudW1WYWx1ZSA9IG5leHREZWZhdWx0VmFsdWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZW51bVZhbHVlID0gZXZhbHVhdG9yLmV2YWx1YXRlTm9kZShtZW1iZXIuaW5pdGlhbGl6ZXIpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGxldCBuYW1lOiBzdHJpbmd8dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICBpZiAobWVtYmVyLm5hbWUua2luZCA9PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpZGVudGlmaWVyID0gPHRzLklkZW50aWZpZXI+bWVtYmVyLm5hbWU7XG4gICAgICAgICAgICAgICAgbmFtZSA9IGlkZW50aWZpZXIudGV4dDtcbiAgICAgICAgICAgICAgICBlbnVtVmFsdWVIb2xkZXJbbmFtZV0gPSBlbnVtVmFsdWU7XG4gICAgICAgICAgICAgICAgd3JpdHRlbk1lbWJlcnMrKztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAodHlwZW9mIGVudW1WYWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICBuZXh0RGVmYXVsdFZhbHVlID0gZW51bVZhbHVlICsgMTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChuYW1lKSB7XG4gICAgICAgICAgICAgICAgbmV4dERlZmF1bHRWYWx1ZSA9IHtcbiAgICAgICAgICAgICAgICAgIF9fc3ltYm9saWM6ICdiaW5hcnknLFxuICAgICAgICAgICAgICAgICAgb3BlcmF0b3I6ICcrJyxcbiAgICAgICAgICAgICAgICAgIGxlZnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgX19zeW1ib2xpYzogJ3NlbGVjdCcsXG4gICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb246IHJlY29yZEVudHJ5KHtfX3N5bWJvbGljOiAncmVmZXJlbmNlJywgbmFtZTogZW51bU5hbWV9LCBub2RlKSwgbmFtZVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmV4dERlZmF1bHRWYWx1ZSA9XG4gICAgICAgICAgICAgICAgICAgIHJlY29yZEVudHJ5KGVycm9yU3ltKCdVbnN1cHBvcnRlZCBlbnVtIG1lbWJlciBuYW1lJywgbWVtYmVyLm5hbWUpLCBub2RlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHdyaXR0ZW5NZW1iZXJzKSB7XG4gICAgICAgICAgICAgIGlmIChlbnVtTmFtZSkge1xuICAgICAgICAgICAgICAgIGlmICghbWV0YWRhdGEpIG1ldGFkYXRhID0ge307XG4gICAgICAgICAgICAgICAgbWV0YWRhdGFbZW51bU5hbWVdID0gcmVjb3JkRW50cnkoZW51bVZhbHVlSG9sZGVyLCBub2RlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVmFyaWFibGVTdGF0ZW1lbnQ6XG4gICAgICAgICAgY29uc3QgdmFyaWFibGVTdGF0ZW1lbnQgPSA8dHMuVmFyaWFibGVTdGF0ZW1lbnQ+bm9kZTtcbiAgICAgICAgICBmb3IgKGNvbnN0IHZhcmlhYmxlRGVjbGFyYXRpb24gb2YgdmFyaWFibGVTdGF0ZW1lbnQuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9ucykge1xuICAgICAgICAgICAgaWYgKHZhcmlhYmxlRGVjbGFyYXRpb24ubmFtZS5raW5kID09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgICAgICAgICAgICBjb25zdCBuYW1lTm9kZSA9IDx0cy5JZGVudGlmaWVyPnZhcmlhYmxlRGVjbGFyYXRpb24ubmFtZTtcbiAgICAgICAgICAgICAgbGV0IHZhclZhbHVlOiBNZXRhZGF0YVZhbHVlO1xuICAgICAgICAgICAgICBpZiAodmFyaWFibGVEZWNsYXJhdGlvbi5pbml0aWFsaXplcikge1xuICAgICAgICAgICAgICAgIHZhclZhbHVlID0gZXZhbHVhdG9yLmV2YWx1YXRlTm9kZSh2YXJpYWJsZURlY2xhcmF0aW9uLmluaXRpYWxpemVyKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXJWYWx1ZSA9IHJlY29yZEVudHJ5KGVycm9yU3ltKCdWYXJpYWJsZSBub3QgaW5pdGlhbGl6ZWQnLCBuYW1lTm9kZSksIG5hbWVOb2RlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBsZXQgZXhwb3J0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgaWYgKGlzRXhwb3J0KHZhcmlhYmxlU3RhdGVtZW50KSB8fCBpc0V4cG9ydCh2YXJpYWJsZURlY2xhcmF0aW9uKSB8fFxuICAgICAgICAgICAgICAgICAgaXNFeHBvcnRlZElkZW50aWZpZXIobmFtZU5vZGUpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGV4cG9ydGVkSWRlbnRpZmllck5hbWUobmFtZU5vZGUpO1xuICAgICAgICAgICAgICAgIGlmIChuYW1lKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoIW1ldGFkYXRhKSBtZXRhZGF0YSA9IHt9O1xuICAgICAgICAgICAgICAgICAgbWV0YWRhdGFbbmFtZV0gPSByZWNvcmRFbnRyeSh2YXJWYWx1ZSwgbm9kZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGV4cG9ydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhclZhbHVlID09ICdzdHJpbmcnIHx8IHR5cGVvZiB2YXJWYWx1ZSA9PSAnbnVtYmVyJyB8fFxuICAgICAgICAgICAgICAgICAgdHlwZW9mIHZhclZhbHVlID09ICdib29sZWFuJykge1xuICAgICAgICAgICAgICAgIGxvY2Fscy5kZWZpbmUobmFtZU5vZGUudGV4dCwgdmFyVmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmIChleHBvcnRlZCkge1xuICAgICAgICAgICAgICAgICAgbG9jYWxzLmRlZmluZVJlZmVyZW5jZShcbiAgICAgICAgICAgICAgICAgICAgICBuYW1lTm9kZS50ZXh0LCB7X19zeW1ib2xpYzogJ3JlZmVyZW5jZScsIG5hbWU6IG5hbWVOb2RlLnRleHR9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWV4cG9ydGVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhclZhbHVlICYmICFpc01ldGFkYXRhRXJyb3IodmFyVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICBsb2NhbHMuZGVmaW5lKG5hbWVOb2RlLnRleHQsIHJlY29yZEVudHJ5KHZhclZhbHVlLCBub2RlKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGxvY2Fscy5kZWZpbmUoXG4gICAgICAgICAgICAgICAgICAgICAgbmFtZU5vZGUudGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICByZWNvcmRFbnRyeShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JTeW0oJ1JlZmVyZW5jZSB0byBhIGxvY2FsIHN5bWJvbCcsIG5hbWVOb2RlLCB7bmFtZTogbmFtZU5vZGUudGV4dH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBEZXN0cnVjdHVyaW5nIChvciBiaW5kaW5nKSBkZWNsYXJhdGlvbnMgYXJlIG5vdCBzdXBwb3J0ZWQsXG4gICAgICAgICAgICAgIC8vIHZhciB7PGlkZW50aWZpZXI+WywgPGlkZW50aWZpZXI+XSt9ID0gPGV4cHJlc3Npb24+O1xuICAgICAgICAgICAgICAvLyAgIG9yXG4gICAgICAgICAgICAgIC8vIHZhciBbPGlkZW50aWZpZXI+WywgPGlkZW50aWZpZXJ9K10gPSA8ZXhwcmVzc2lvbj47XG4gICAgICAgICAgICAgIC8vIGFyZSBub3Qgc3VwcG9ydGVkLlxuICAgICAgICAgICAgICBjb25zdCByZXBvcnQ6IChuYW1lTm9kZTogdHMuTm9kZSkgPT4gdm9pZCA9IChuYW1lTm9kZTogdHMuTm9kZSkgPT4ge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAobmFtZU5vZGUua2luZCkge1xuICAgICAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXI6XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSA8dHMuSWRlbnRpZmllcj5uYW1lTm9kZTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFyVmFsdWUgPSBlcnJvclN5bSgnRGVzdHJ1Y3R1cmluZyBub3Qgc3VwcG9ydGVkJywgbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGxvY2Fscy5kZWZpbmUobmFtZS50ZXh0LCB2YXJWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0V4cG9ydChub2RlKSkge1xuICAgICAgICAgICAgICAgICAgICAgIGlmICghbWV0YWRhdGEpIG1ldGFkYXRhID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGFbbmFtZS50ZXh0XSA9IHZhclZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkJpbmRpbmdFbGVtZW50OlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBiaW5kaW5nRWxlbWVudCA9IDx0cy5CaW5kaW5nRWxlbWVudD5uYW1lTm9kZTtcbiAgICAgICAgICAgICAgICAgICAgcmVwb3J0KGJpbmRpbmdFbGVtZW50Lm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5PYmplY3RCaW5kaW5nUGF0dGVybjpcbiAgICAgICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5BcnJheUJpbmRpbmdQYXR0ZXJuOlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBiaW5kaW5ncyA9IDx0cy5CaW5kaW5nUGF0dGVybj5uYW1lTm9kZTtcbiAgICAgICAgICAgICAgICAgICAgKGJpbmRpbmdzIGFzIGFueSkuZWxlbWVudHMuZm9yRWFjaChyZXBvcnQpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJlcG9ydCh2YXJpYWJsZURlY2xhcmF0aW9uLm5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChtZXRhZGF0YSB8fCBleHBvcnRzKSB7XG4gICAgICBpZiAoIW1ldGFkYXRhKVxuICAgICAgICBtZXRhZGF0YSA9IHt9O1xuICAgICAgZWxzZSBpZiAoc3RyaWN0KSB7XG4gICAgICAgIHZhbGlkYXRlTWV0YWRhdGEoc291cmNlRmlsZSwgbm9kZU1hcCwgbWV0YWRhdGEpO1xuICAgICAgfVxuICAgICAgY29uc3QgcmVzdWx0OiBNb2R1bGVNZXRhZGF0YSA9IHtcbiAgICAgICAgX19zeW1ib2xpYzogJ21vZHVsZScsXG4gICAgICAgIHZlcnNpb246IHRoaXMub3B0aW9ucy52ZXJzaW9uIHx8IE1FVEFEQVRBX1ZFUlNJT04sIG1ldGFkYXRhXG4gICAgICB9O1xuICAgICAgaWYgKHNvdXJjZUZpbGUubW9kdWxlTmFtZSkgcmVzdWx0LmltcG9ydEFzID0gc291cmNlRmlsZS5tb2R1bGVOYW1lO1xuICAgICAgaWYgKGV4cG9ydHMpIHJlc3VsdC5leHBvcnRzID0gZXhwb3J0cztcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9XG59XG5cbi8vIFRoaXMgd2lsbCB0aHJvdyBpZiB0aGUgbWV0YWRhdGEgZW50cnkgZ2l2ZW4gY29udGFpbnMgYW4gZXJyb3Igbm9kZS5cbmZ1bmN0aW9uIHZhbGlkYXRlTWV0YWRhdGEoXG4gICAgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgbm9kZU1hcDogTWFwPE1ldGFkYXRhRW50cnksIHRzLk5vZGU+LFxuICAgIG1ldGFkYXRhOiB7W25hbWU6IHN0cmluZ106IE1ldGFkYXRhRW50cnl9KSB7XG4gIGxldCBsb2NhbHM6IFNldDxzdHJpbmc+ID0gbmV3IFNldChbJ0FycmF5JywgJ09iamVjdCcsICdTZXQnLCAnTWFwJywgJ3N0cmluZycsICdudW1iZXInLCAnYW55J10pO1xuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlRXhwcmVzc2lvbihcbiAgICAgIGV4cHJlc3Npb246IE1ldGFkYXRhVmFsdWUgfCBNZXRhZGF0YVN5bWJvbGljRXhwcmVzc2lvbiB8IE1ldGFkYXRhRXJyb3IpIHtcbiAgICBpZiAoIWV4cHJlc3Npb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZXhwcmVzc2lvbikpIHtcbiAgICAgIGV4cHJlc3Npb24uZm9yRWFjaCh2YWxpZGF0ZUV4cHJlc3Npb24pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cHJlc3Npb24gPT09ICdvYmplY3QnICYmICFleHByZXNzaW9uLmhhc093blByb3BlcnR5KCdfX3N5bWJvbGljJykpIHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGV4cHJlc3Npb24pLmZvckVhY2godiA9PiB2YWxpZGF0ZUV4cHJlc3Npb24oKDxhbnk+ZXhwcmVzc2lvbilbdl0pKTtcbiAgICB9IGVsc2UgaWYgKGlzTWV0YWRhdGFFcnJvcihleHByZXNzaW9uKSkge1xuICAgICAgcmVwb3J0RXJyb3IoZXhwcmVzc2lvbik7XG4gICAgfSBlbHNlIGlmIChpc01ldGFkYXRhR2xvYmFsUmVmZXJlbmNlRXhwcmVzc2lvbihleHByZXNzaW9uKSkge1xuICAgICAgaWYgKCFsb2NhbHMuaGFzKGV4cHJlc3Npb24ubmFtZSkpIHtcbiAgICAgICAgY29uc3QgcmVmZXJlbmNlID0gPE1ldGFkYXRhVmFsdWU+bWV0YWRhdGFbZXhwcmVzc2lvbi5uYW1lXTtcbiAgICAgICAgaWYgKHJlZmVyZW5jZSkge1xuICAgICAgICAgIHZhbGlkYXRlRXhwcmVzc2lvbihyZWZlcmVuY2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc0Z1bmN0aW9uTWV0YWRhdGEoZXhwcmVzc2lvbikpIHtcbiAgICAgIHZhbGlkYXRlRnVuY3Rpb24oPGFueT5leHByZXNzaW9uKTtcbiAgICB9IGVsc2UgaWYgKGlzTWV0YWRhdGFTeW1ib2xpY0V4cHJlc3Npb24oZXhwcmVzc2lvbikpIHtcbiAgICAgIHN3aXRjaCAoZXhwcmVzc2lvbi5fX3N5bWJvbGljKSB7XG4gICAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgICAgY29uc3QgYmluYXJ5RXhwcmVzc2lvbiA9IDxNZXRhZGF0YVN5bWJvbGljQmluYXJ5RXhwcmVzc2lvbj5leHByZXNzaW9uO1xuICAgICAgICAgIHZhbGlkYXRlRXhwcmVzc2lvbihiaW5hcnlFeHByZXNzaW9uLmxlZnQpO1xuICAgICAgICAgIHZhbGlkYXRlRXhwcmVzc2lvbihiaW5hcnlFeHByZXNzaW9uLnJpZ2h0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnY2FsbCc6XG4gICAgICAgIGNhc2UgJ25ldyc6XG4gICAgICAgICAgY29uc3QgY2FsbEV4cHJlc3Npb24gPSA8TWV0YWRhdGFTeW1ib2xpY0NhbGxFeHByZXNzaW9uPmV4cHJlc3Npb247XG4gICAgICAgICAgdmFsaWRhdGVFeHByZXNzaW9uKGNhbGxFeHByZXNzaW9uLmV4cHJlc3Npb24pO1xuICAgICAgICAgIGlmIChjYWxsRXhwcmVzc2lvbi5hcmd1bWVudHMpIGNhbGxFeHByZXNzaW9uLmFyZ3VtZW50cy5mb3JFYWNoKHZhbGlkYXRlRXhwcmVzc2lvbik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2luZGV4JzpcbiAgICAgICAgICBjb25zdCBpbmRleEV4cHJlc3Npb24gPSA8TWV0YWRhdGFTeW1ib2xpY0luZGV4RXhwcmVzc2lvbj5leHByZXNzaW9uO1xuICAgICAgICAgIHZhbGlkYXRlRXhwcmVzc2lvbihpbmRleEV4cHJlc3Npb24uZXhwcmVzc2lvbik7XG4gICAgICAgICAgdmFsaWRhdGVFeHByZXNzaW9uKGluZGV4RXhwcmVzc2lvbi5pbmRleCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3ByZSc6XG4gICAgICAgICAgY29uc3QgcHJlZml4RXhwcmVzc2lvbiA9IDxNZXRhZGF0YVN5bWJvbGljUHJlZml4RXhwcmVzc2lvbj5leHByZXNzaW9uO1xuICAgICAgICAgIHZhbGlkYXRlRXhwcmVzc2lvbihwcmVmaXhFeHByZXNzaW9uLm9wZXJhbmQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzZWxlY3QnOlxuICAgICAgICAgIGNvbnN0IHNlbGVjdEV4cHJlc3Npb24gPSA8TWV0YWRhdGFTeW1ib2xpY1NlbGVjdEV4cHJlc3Npb24+ZXhwcmVzc2lvbjtcbiAgICAgICAgICB2YWxpZGF0ZUV4cHJlc3Npb24oc2VsZWN0RXhwcmVzc2lvbi5leHByZXNzaW9uKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc3ByZWFkJzpcbiAgICAgICAgICBjb25zdCBzcHJlYWRFeHByZXNzaW9uID0gPE1ldGFkYXRhU3ltYm9saWNTcHJlYWRFeHByZXNzaW9uPmV4cHJlc3Npb247XG4gICAgICAgICAgdmFsaWRhdGVFeHByZXNzaW9uKHNwcmVhZEV4cHJlc3Npb24uZXhwcmVzc2lvbik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2lmJzpcbiAgICAgICAgICBjb25zdCBpZkV4cHJlc3Npb24gPSA8TWV0YWRhdGFTeW1ib2xpY0lmRXhwcmVzc2lvbj5leHByZXNzaW9uO1xuICAgICAgICAgIHZhbGlkYXRlRXhwcmVzc2lvbihpZkV4cHJlc3Npb24uY29uZGl0aW9uKTtcbiAgICAgICAgICB2YWxpZGF0ZUV4cHJlc3Npb24oaWZFeHByZXNzaW9uLmVsc2VFeHByZXNzaW9uKTtcbiAgICAgICAgICB2YWxpZGF0ZUV4cHJlc3Npb24oaWZFeHByZXNzaW9uLnRoZW5FeHByZXNzaW9uKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB2YWxpZGF0ZU1lbWJlcihjbGFzc0RhdGE6IENsYXNzTWV0YWRhdGEsIG1lbWJlcjogTWVtYmVyTWV0YWRhdGEpIHtcbiAgICBpZiAobWVtYmVyLmRlY29yYXRvcnMpIHtcbiAgICAgIG1lbWJlci5kZWNvcmF0b3JzLmZvckVhY2godmFsaWRhdGVFeHByZXNzaW9uKTtcbiAgICB9XG4gICAgaWYgKGlzTWV0aG9kTWV0YWRhdGEobWVtYmVyKSAmJiBtZW1iZXIucGFyYW1ldGVyRGVjb3JhdG9ycykge1xuICAgICAgbWVtYmVyLnBhcmFtZXRlckRlY29yYXRvcnMuZm9yRWFjaCh2YWxpZGF0ZUV4cHJlc3Npb24pO1xuICAgIH1cbiAgICAvLyBPbmx5IHZhbGlkYXRlIHBhcmFtZXRlcnMgb2YgY2xhc3NlcyBmb3Igd2hpY2ggd2Uga25vdyB0aGF0IGFyZSB1c2VkIHdpdGggb3VyIERJXG4gICAgaWYgKGNsYXNzRGF0YS5kZWNvcmF0b3JzICYmIGlzQ29uc3RydWN0b3JNZXRhZGF0YShtZW1iZXIpICYmIG1lbWJlci5wYXJhbWV0ZXJzKSB7XG4gICAgICBtZW1iZXIucGFyYW1ldGVycy5mb3JFYWNoKHZhbGlkYXRlRXhwcmVzc2lvbik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVDbGFzcyhjbGFzc0RhdGE6IENsYXNzTWV0YWRhdGEpIHtcbiAgICBpZiAoY2xhc3NEYXRhLmRlY29yYXRvcnMpIHtcbiAgICAgIGNsYXNzRGF0YS5kZWNvcmF0b3JzLmZvckVhY2godmFsaWRhdGVFeHByZXNzaW9uKTtcbiAgICB9XG4gICAgaWYgKGNsYXNzRGF0YS5tZW1iZXJzKSB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhjbGFzc0RhdGEubWVtYmVycylcbiAgICAgICAgICAuZm9yRWFjaChuYW1lID0+IGNsYXNzRGF0YS5tZW1iZXJzICFbbmFtZV0uZm9yRWFjaCgobSkgPT4gdmFsaWRhdGVNZW1iZXIoY2xhc3NEYXRhLCBtKSkpO1xuICAgIH1cbiAgICBpZiAoY2xhc3NEYXRhLnN0YXRpY3MpIHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGNsYXNzRGF0YS5zdGF0aWNzKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgICBjb25zdCBzdGF0aWNNZW1iZXIgPSBjbGFzc0RhdGEuc3RhdGljcyAhW25hbWVdO1xuICAgICAgICBpZiAoaXNGdW5jdGlvbk1ldGFkYXRhKHN0YXRpY01lbWJlcikpIHtcbiAgICAgICAgICB2YWxpZGF0ZUV4cHJlc3Npb24oc3RhdGljTWVtYmVyLnZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWxpZGF0ZUV4cHJlc3Npb24oc3RhdGljTWVtYmVyKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVGdW5jdGlvbihmdW5jdGlvbkRlY2xhcmF0aW9uOiBGdW5jdGlvbk1ldGFkYXRhKSB7XG4gICAgaWYgKGZ1bmN0aW9uRGVjbGFyYXRpb24udmFsdWUpIHtcbiAgICAgIGNvbnN0IG9sZExvY2FscyA9IGxvY2FscztcbiAgICAgIGlmIChmdW5jdGlvbkRlY2xhcmF0aW9uLnBhcmFtZXRlcnMpIHtcbiAgICAgICAgbG9jYWxzID0gbmV3IFNldChvbGRMb2NhbHMudmFsdWVzKCkpO1xuICAgICAgICBpZiAoZnVuY3Rpb25EZWNsYXJhdGlvbi5wYXJhbWV0ZXJzKVxuICAgICAgICAgIGZ1bmN0aW9uRGVjbGFyYXRpb24ucGFyYW1ldGVycy5mb3JFYWNoKG4gPT4gbG9jYWxzLmFkZChuKSk7XG4gICAgICB9XG4gICAgICB2YWxpZGF0ZUV4cHJlc3Npb24oZnVuY3Rpb25EZWNsYXJhdGlvbi52YWx1ZSk7XG4gICAgICBsb2NhbHMgPSBvbGRMb2NhbHM7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2hvdWxkUmVwb3J0Tm9kZShub2RlOiB0cy5Ob2RlIHwgdW5kZWZpbmVkKSB7XG4gICAgaWYgKG5vZGUpIHtcbiAgICAgIGNvbnN0IG5vZGVTdGFydCA9IG5vZGUuZ2V0U3RhcnQoKTtcbiAgICAgIHJldHVybiAhKFxuICAgICAgICAgIG5vZGUucG9zICE9IG5vZGVTdGFydCAmJlxuICAgICAgICAgIHNvdXJjZUZpbGUudGV4dC5zdWJzdHJpbmcobm9kZS5wb3MsIG5vZGVTdGFydCkuaW5kZXhPZignQGR5bmFtaWMnKSA+PSAwKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBmdW5jdGlvbiByZXBvcnRFcnJvcihlcnJvcjogTWV0YWRhdGFFcnJvcikge1xuICAgIGNvbnN0IG5vZGUgPSBub2RlTWFwLmdldChlcnJvcik7XG4gICAgaWYgKHNob3VsZFJlcG9ydE5vZGUobm9kZSkpIHtcbiAgICAgIGNvbnN0IGxpbmVJbmZvID0gZXJyb3IubGluZSAhPSB1bmRlZmluZWQgP1xuICAgICAgICAgIGVycm9yLmNoYXJhY3RlciAhPSB1bmRlZmluZWQgPyBgOiR7ZXJyb3IubGluZSArIDF9OiR7ZXJyb3IuY2hhcmFjdGVyICsgMX1gIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYDoke2Vycm9yLmxpbmUgKyAxfWAgOlxuICAgICAgICAgICcnO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGAke3NvdXJjZUZpbGUuZmlsZU5hbWV9JHtsaW5lSW5mb306IE1ldGFkYXRhIGNvbGxlY3RlZCBjb250YWlucyBhbiBlcnJvciB0aGF0IHdpbGwgYmUgcmVwb3J0ZWQgYXQgcnVudGltZTogJHtleHBhbmRlZE1lc3NhZ2UoZXJyb3IpfS5cXG4gICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IpfWApO1xuICAgIH1cbiAgfVxuXG4gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG1ldGFkYXRhKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgIGNvbnN0IGVudHJ5ID0gbWV0YWRhdGFbbmFtZV07XG4gICAgdHJ5IHtcbiAgICAgIGlmIChpc0NsYXNzTWV0YWRhdGEoZW50cnkpKSB7XG4gICAgICAgIHZhbGlkYXRlQ2xhc3MoZW50cnkpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnN0IG5vZGUgPSBub2RlTWFwLmdldChlbnRyeSk7XG4gICAgICBpZiAoc2hvdWxkUmVwb3J0Tm9kZShub2RlKSkge1xuICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgIGNvbnN0IHtsaW5lLCBjaGFyYWN0ZXJ9ID0gc291cmNlRmlsZS5nZXRMaW5lQW5kQ2hhcmFjdGVyT2ZQb3NpdGlvbihub2RlLmdldFN0YXJ0KCkpO1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgYCR7c291cmNlRmlsZS5maWxlTmFtZX06JHtsaW5lICsgMX06JHtjaGFyYWN0ZXIgKyAxfTogRXJyb3IgZW5jb3VudGVyZWQgaW4gbWV0YWRhdGEgZ2VuZXJhdGVkIGZvciBleHBvcnRlZCBzeW1ib2wgJyR7bmFtZX0nOiBcXG4gJHtlLm1lc3NhZ2V9YCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEVycm9yIGVuY291bnRlcmVkIGluIG1ldGFkYXRhIGdlbmVyYXRlZCBmb3IgZXhwb3J0ZWQgc3ltYm9sICR7bmFtZX06IFxcbiAke2UubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG4vLyBDb2xsZWN0IHBhcmFtZXRlciBuYW1lcyBmcm9tIGEgZnVuY3Rpb24uXG5mdW5jdGlvbiBuYW1lc09mKHBhcmFtZXRlcnM6IHRzLk5vZGVBcnJheTx0cy5QYXJhbWV0ZXJEZWNsYXJhdGlvbj4pOiBzdHJpbmdbXSB7XG4gIGNvbnN0IHJlc3VsdDogc3RyaW5nW10gPSBbXTtcblxuICBmdW5jdGlvbiBhZGROYW1lc09mKG5hbWU6IHRzLklkZW50aWZpZXIgfCB0cy5CaW5kaW5nUGF0dGVybikge1xuICAgIGlmIChuYW1lLmtpbmQgPT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyKSB7XG4gICAgICBjb25zdCBpZGVudGlmaWVyID0gPHRzLklkZW50aWZpZXI+bmFtZTtcbiAgICAgIHJlc3VsdC5wdXNoKGlkZW50aWZpZXIudGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGJpbmRpbmdQYXR0ZXJuID0gPHRzLkJpbmRpbmdQYXR0ZXJuPm5hbWU7XG4gICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgYmluZGluZ1BhdHRlcm4uZWxlbWVudHMpIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IChlbGVtZW50IGFzIGFueSkubmFtZTtcbiAgICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgICBhZGROYW1lc09mKG5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCBwYXJhbWV0ZXIgb2YgcGFyYW1ldGVycykge1xuICAgIGFkZE5hbWVzT2YocGFyYW1ldGVyLm5hbWUpO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gZXhwYW5kZWRNZXNzYWdlKGVycm9yOiBhbnkpOiBzdHJpbmcge1xuICBzd2l0Y2ggKGVycm9yLm1lc3NhZ2UpIHtcbiAgICBjYXNlICdSZWZlcmVuY2UgdG8gbm9uLWV4cG9ydGVkIGNsYXNzJzpcbiAgICAgIGlmIChlcnJvci5jb250ZXh0ICYmIGVycm9yLmNvbnRleHQuY2xhc3NOYW1lKSB7XG4gICAgICAgIHJldHVybiBgUmVmZXJlbmNlIHRvIGEgbm9uLWV4cG9ydGVkIGNsYXNzICR7ZXJyb3IuY29udGV4dC5jbGFzc05hbWV9LiBDb25zaWRlciBleHBvcnRpbmcgdGhlIGNsYXNzYDtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1ZhcmlhYmxlIG5vdCBpbml0aWFsaXplZCc6XG4gICAgICByZXR1cm4gJ09ubHkgaW5pdGlhbGl6ZWQgdmFyaWFibGVzIGFuZCBjb25zdGFudHMgY2FuIGJlIHJlZmVyZW5jZWQgYmVjYXVzZSB0aGUgdmFsdWUgb2YgdGhpcyB2YXJpYWJsZSBpcyBuZWVkZWQgYnkgdGhlIHRlbXBsYXRlIGNvbXBpbGVyJztcbiAgICBjYXNlICdEZXN0cnVjdHVyaW5nIG5vdCBzdXBwb3J0ZWQnOlxuICAgICAgcmV0dXJuICdSZWZlcmVuY2luZyBhbiBleHBvcnRlZCBkZXN0cnVjdHVyZWQgdmFyaWFibGUgb3IgY29uc3RhbnQgaXMgbm90IHN1cHBvcnRlZCBieSB0aGUgdGVtcGxhdGUgY29tcGlsZXIuIENvbnNpZGVyIHNpbXBsaWZ5aW5nIHRoaXMgdG8gYXZvaWQgZGVzdHJ1Y3R1cmluZyc7XG4gICAgY2FzZSAnQ291bGQgbm90IHJlc29sdmUgdHlwZSc6XG4gICAgICBpZiAoZXJyb3IuY29udGV4dCAmJiBlcnJvci5jb250ZXh0LnR5cGVOYW1lKSB7XG4gICAgICAgIHJldHVybiBgQ291bGQgbm90IHJlc29sdmUgdHlwZSAke2Vycm9yLmNvbnRleHQudHlwZU5hbWV9YDtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0Z1bmN0aW9uIGNhbGwgbm90IHN1cHBvcnRlZCc6XG4gICAgICBsZXQgcHJlZml4ID1cbiAgICAgICAgICBlcnJvci5jb250ZXh0ICYmIGVycm9yLmNvbnRleHQubmFtZSA/IGBDYWxsaW5nIGZ1bmN0aW9uICcke2Vycm9yLmNvbnRleHQubmFtZX0nLCBmYCA6ICdGJztcbiAgICAgIHJldHVybiBwcmVmaXggK1xuICAgICAgICAgICd1bmN0aW9uIGNhbGxzIGFyZSBub3Qgc3VwcG9ydGVkLiBDb25zaWRlciByZXBsYWNpbmcgdGhlIGZ1bmN0aW9uIG9yIGxhbWJkYSB3aXRoIGEgcmVmZXJlbmNlIHRvIGFuIGV4cG9ydGVkIGZ1bmN0aW9uJztcbiAgICBjYXNlICdSZWZlcmVuY2UgdG8gYSBsb2NhbCBzeW1ib2wnOlxuICAgICAgaWYgKGVycm9yLmNvbnRleHQgJiYgZXJyb3IuY29udGV4dC5uYW1lKSB7XG4gICAgICAgIHJldHVybiBgUmVmZXJlbmNlIHRvIGEgbG9jYWwgKG5vbi1leHBvcnRlZCkgc3ltYm9sICcke2Vycm9yLmNvbnRleHQubmFtZX0nLiBDb25zaWRlciBleHBvcnRpbmcgdGhlIHN5bWJvbGA7XG4gICAgICB9XG4gIH1cbiAgcmV0dXJuIGVycm9yLm1lc3NhZ2U7XG59XG4iXX0=