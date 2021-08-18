/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @fileoverview Abstraction over the TypeScript API that makes multiple
 * versions of TypeScript appear to be interoperable. Any time a breaking change
 * in TypeScript affects Tsickle code, we should extend this shim to present an
 * unbroken API.
 * All code in tsickle should import from this location, not from 'typescript'.
 */
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/typescript", ["require", "exports", "typescript", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // tslint:disable:no-any We need to do various unsafe casts between TS versions
    var ts = require("typescript");
    var typescript_1 = require("typescript");
    exports.addSyntheticTrailingComment = typescript_1.addSyntheticTrailingComment;
    exports.createArrayLiteral = typescript_1.createArrayLiteral;
    exports.createArrayTypeNode = typescript_1.createArrayTypeNode;
    exports.createCompilerHost = typescript_1.createCompilerHost;
    exports.createIdentifier = typescript_1.createIdentifier;
    exports.createKeywordTypeNode = typescript_1.createKeywordTypeNode;
    exports.createNodeArray = typescript_1.createNodeArray;
    exports.createNotEmittedStatement = typescript_1.createNotEmittedStatement;
    exports.createObjectLiteral = typescript_1.createObjectLiteral;
    exports.createProgram = typescript_1.createProgram;
    exports.createProperty = typescript_1.createProperty;
    exports.createPropertyAssignment = typescript_1.createPropertyAssignment;
    exports.createPropertySignature = typescript_1.createPropertySignature;
    exports.createSourceFile = typescript_1.createSourceFile;
    exports.createToken = typescript_1.createToken;
    exports.createTypeLiteralNode = typescript_1.createTypeLiteralNode;
    exports.createTypeReferenceNode = typescript_1.createTypeReferenceNode;
    exports.DiagnosticCategory = typescript_1.DiagnosticCategory;
    exports.EmitFlags = typescript_1.EmitFlags;
    exports.flattenDiagnosticMessageText = typescript_1.flattenDiagnosticMessageText;
    exports.forEachChild = typescript_1.forEachChild;
    exports.getCombinedModifierFlags = typescript_1.getCombinedModifierFlags;
    exports.getLeadingCommentRanges = typescript_1.getLeadingCommentRanges;
    exports.getLineAndCharacterOfPosition = typescript_1.getLineAndCharacterOfPosition;
    exports.getMutableClone = typescript_1.getMutableClone;
    exports.getOriginalNode = typescript_1.getOriginalNode;
    exports.getPreEmitDiagnostics = typescript_1.getPreEmitDiagnostics;
    exports.getSyntheticLeadingComments = typescript_1.getSyntheticLeadingComments;
    exports.getSyntheticTrailingComments = typescript_1.getSyntheticTrailingComments;
    exports.getTrailingCommentRanges = typescript_1.getTrailingCommentRanges;
    exports.isBinaryExpression = typescript_1.isBinaryExpression;
    exports.isExportDeclaration = typescript_1.isExportDeclaration;
    exports.isExpressionStatement = typescript_1.isExpressionStatement;
    exports.isIdentifier = typescript_1.isIdentifier;
    exports.ModifierFlags = typescript_1.ModifierFlags;
    exports.ModuleKind = typescript_1.ModuleKind;
    exports.NodeFlags = typescript_1.NodeFlags;
    exports.parseCommandLine = typescript_1.parseCommandLine;
    exports.parseJsonConfigFileContent = typescript_1.parseJsonConfigFileContent;
    exports.readConfigFile = typescript_1.readConfigFile;
    exports.resolveModuleName = typescript_1.resolveModuleName;
    exports.ScriptTarget = typescript_1.ScriptTarget;
    exports.setEmitFlags = typescript_1.setEmitFlags;
    exports.setOriginalNode = typescript_1.setOriginalNode;
    exports.setSourceMapRange = typescript_1.setSourceMapRange;
    exports.setSyntheticLeadingComments = typescript_1.setSyntheticLeadingComments;
    exports.setSyntheticTrailingComments = typescript_1.setSyntheticTrailingComments;
    exports.setTextRange = typescript_1.setTextRange;
    exports.SymbolFlags = typescript_1.SymbolFlags;
    exports.SyntaxKind = typescript_1.SyntaxKind;
    exports.sys = typescript_1.sys;
    exports.TypeFlags = typescript_1.TypeFlags;
    exports.updateBlock = typescript_1.updateBlock;
    exports.visitEachChild = typescript_1.visitEachChild;
    exports.visitLexicalEnvironment = typescript_1.visitLexicalEnvironment;
    // getEmitFlags is now private starting in TS 2.5.
    // So we define our own method that calls through to TypeScript to defeat the
    // visibility constraint.
    function getEmitFlags(node) {
        return ts.getEmitFlags(node);
    }
    exports.getEmitFlags = getEmitFlags;
    // Between TypeScript 2.4 and 2.5 updateProperty was modified. If called with 2.4 re-order the
    // parameters.
    exports.updateProperty = ts.updateProperty;
    var _a = __read(ts.version.split('.'), 2), major = _a[0], minor = _a[1];
    if (major === '2' && minor === '4') {
        var updateProperty24_1 = ts.updateProperty;
        exports.updateProperty = function (node, decorators, modifiers, name, questionToken, type, initializer) {
            return updateProperty24_1(node, decorators, modifiers, name, type, initializer);
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90eXBlc2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNIOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVILCtFQUErRTtJQUUvRSwrQkFBaUM7SUFLakMseUNBQXUzRTtJQUFyMkUsbURBQUEsMkJBQTJCLENBQUE7SUFBOE0sMENBQUEsa0JBQWtCLENBQUE7SUFBRSwyQ0FBQSxtQkFBbUIsQ0FBQTtJQUFFLDBDQUFBLGtCQUFrQixDQUFBO0lBQUUsd0NBQUEsZ0JBQWdCLENBQUE7SUFBRSw2Q0FBQSxxQkFBcUIsQ0FBQTtJQUFFLHVDQUFBLGVBQWUsQ0FBQTtJQUFFLGlEQUFBLHlCQUF5QixDQUFBO0lBQUUsMkNBQUEsbUJBQW1CLENBQUE7SUFBRSxxQ0FBQSxhQUFhLENBQUE7SUFBRSxzQ0FBQSxjQUFjLENBQUE7SUFBRSxnREFBQSx3QkFBd0IsQ0FBQTtJQUFFLCtDQUFBLHVCQUF1QixDQUFBO0lBQUUsd0NBQUEsZ0JBQWdCLENBQUE7SUFBRSxtQ0FBQSxXQUFXLENBQUE7SUFBRSw2Q0FBQSxxQkFBcUIsQ0FBQTtJQUFFLCtDQUFBLHVCQUF1QixDQUFBO0lBQStHLDBDQUFBLGtCQUFrQixDQUFBO0lBQTJCLGlDQUFBLFNBQVMsQ0FBQTtJQUE0SCxvREFBQSw0QkFBNEIsQ0FBQTtJQUFFLG9DQUFBLFlBQVksQ0FBQTtJQUF3RSxnREFBQSx3QkFBd0IsQ0FBQTtJQUFFLCtDQUFBLHVCQUF1QixDQUFBO0lBQUUscURBQUEsNkJBQTZCLENBQUE7SUFBRSx1Q0FBQSxlQUFlLENBQUE7SUFBRSx1Q0FBQSxlQUFlLENBQUE7SUFBRSw2Q0FBQSxxQkFBcUIsQ0FBQTtJQUFFLG1EQUFBLDJCQUEyQixDQUFBO0lBQUUsb0RBQUEsNEJBQTRCLENBQUE7SUFBRSxnREFBQSx3QkFBd0IsQ0FBQTtJQUFpRywwQ0FBQSxrQkFBa0IsQ0FBQTtJQUFFLDJDQUFBLG1CQUFtQixDQUFBO0lBQUUsNkNBQUEscUJBQXFCLENBQUE7SUFBRSxvQ0FBQSxZQUFZLENBQUE7SUFBcUIscUNBQUEsYUFBYSxDQUFBO0lBQWtDLGtDQUFBLFVBQVUsQ0FBQTtJQUF5RSxpQ0FBQSxTQUFTLENBQUE7SUFBbUgsd0NBQUEsZ0JBQWdCLENBQUE7SUFBRSxrREFBQSwwQkFBMEIsQ0FBQTtJQUErRyxzQ0FBQSxjQUFjLENBQUE7SUFBRSx5Q0FBQSxpQkFBaUIsQ0FBQTtJQUFFLG9DQUFBLFlBQVksQ0FBQTtJQUEwQixvQ0FBQSxZQUFZLENBQUE7SUFBRSx1Q0FBQSxlQUFlLENBQUE7SUFBRSx5Q0FBQSxpQkFBaUIsQ0FBQTtJQUFFLG1EQUFBLDJCQUEyQixDQUFBO0lBQUUsb0RBQUEsNEJBQTRCLENBQUE7SUFBRSxvQ0FBQSxZQUFZLENBQUE7SUFBc0UsbUNBQUEsV0FBVyxDQUFBO0lBQUUsa0NBQUEsVUFBVSxDQUFBO0lBQXNCLDJCQUFBLEdBQUcsQ0FBQTtJQUF1SCxpQ0FBQSxTQUFTLENBQUE7SUFBc0MsbUNBQUEsV0FBVyxDQUFBO0lBQTBDLHNDQUFBLGNBQWMsQ0FBQTtJQUFFLCtDQUFBLHVCQUF1QixDQUFBO0lBRXYwRSxrREFBa0Q7SUFDbEQsNkVBQTZFO0lBQzdFLHlCQUF5QjtJQUN6QixzQkFBNkIsSUFBYTtRQUN4QyxNQUFNLENBQUUsRUFBVSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRkQsb0NBRUM7SUFFRCw4RkFBOEY7SUFDOUYsY0FBYztJQUNILFFBQUEsY0FBYyxHQUFHLEVBQUUsQ0FBQyxjQUFjLENBQUM7SUFFeEMsSUFBQSxxQ0FBc0MsRUFBckMsYUFBSyxFQUFFLGFBQUssQ0FBMEI7SUFDN0MsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLEdBQUcsSUFBSSxLQUFLLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNuQyxJQUFNLGtCQUFnQixHQUFHLEVBQUUsQ0FBQyxjQUFtRCxDQUFDO1FBQ2hGLHNCQUFjLEdBQUcsVUFBQyxJQUE0QixFQUFFLFVBQWlELEVBQy9FLFNBQStDLEVBQUUsSUFBNEIsRUFDN0UsYUFBeUMsRUFBRSxJQUEyQixFQUN0RSxXQUFvQztZQUNwRCxNQUFNLENBQUMsa0JBQWdCLENBQ1osSUFBdUMsRUFBRSxVQUFxQyxFQUM5RSxTQUFnQixFQUFFLElBQVcsRUFBRSxJQUFXLEVBQUUsV0FBa0IsQ0FBUSxDQUFDO1FBQ3BGLENBQUMsQ0FBQztJQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgQWJzdHJhY3Rpb24gb3ZlciB0aGUgVHlwZVNjcmlwdCBBUEkgdGhhdCBtYWtlcyBtdWx0aXBsZVxuICogdmVyc2lvbnMgb2YgVHlwZVNjcmlwdCBhcHBlYXIgdG8gYmUgaW50ZXJvcGVyYWJsZS4gQW55IHRpbWUgYSBicmVha2luZyBjaGFuZ2VcbiAqIGluIFR5cGVTY3JpcHQgYWZmZWN0cyBUc2lja2xlIGNvZGUsIHdlIHNob3VsZCBleHRlbmQgdGhpcyBzaGltIHRvIHByZXNlbnQgYW5cbiAqIHVuYnJva2VuIEFQSS5cbiAqIEFsbCBjb2RlIGluIHRzaWNrbGUgc2hvdWxkIGltcG9ydCBmcm9tIHRoaXMgbG9jYXRpb24sIG5vdCBmcm9tICd0eXBlc2NyaXB0Jy5cbiAqL1xuXG4vLyB0c2xpbnQ6ZGlzYWJsZTpuby1hbnkgV2UgbmVlZCB0byBkbyB2YXJpb3VzIHVuc2FmZSBjYXN0cyBiZXR3ZWVuIFRTIHZlcnNpb25zXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG4vLyBOb3RlLCB0aGlzIGltcG9ydCBkZXBlbmRzIG9uIGEgZ2VucnVsZSBjb3B5aW5nIHRoZSAuZC50cyBmaWxlIHRvIHRoaXMgcGFja2FnZVxuaW1wb3J0ICogYXMgdHMyNCBmcm9tICcuL3R5cGVzY3JpcHQtMi40JztcblxuZXhwb3J0IHtfX1N0cmluZywgYWRkU3ludGhldGljVHJhaWxpbmdDb21tZW50LCBBc3NlcnRpb25FeHByZXNzaW9uLCBCaW5hcnlFeHByZXNzaW9uLCBCbG9jaywgQ2FsbEV4cHJlc3Npb24sIENhbmNlbGxhdGlvblRva2VuLCBDbGFzc0RlY2xhcmF0aW9uLCBDbGFzc0VsZW1lbnQsIENsYXNzTGlrZURlY2xhcmF0aW9uLCBDb21tZW50UmFuZ2UsIENvbXBpbGVySG9zdCwgQ29tcGlsZXJPcHRpb25zLCBDb25zdHJ1Y3RvckRlY2xhcmF0aW9uLCBjcmVhdGVBcnJheUxpdGVyYWwsIGNyZWF0ZUFycmF5VHlwZU5vZGUsIGNyZWF0ZUNvbXBpbGVySG9zdCwgY3JlYXRlSWRlbnRpZmllciwgY3JlYXRlS2V5d29yZFR5cGVOb2RlLCBjcmVhdGVOb2RlQXJyYXksIGNyZWF0ZU5vdEVtaXR0ZWRTdGF0ZW1lbnQsIGNyZWF0ZU9iamVjdExpdGVyYWwsIGNyZWF0ZVByb2dyYW0sIGNyZWF0ZVByb3BlcnR5LCBjcmVhdGVQcm9wZXJ0eUFzc2lnbm1lbnQsIGNyZWF0ZVByb3BlcnR5U2lnbmF0dXJlLCBjcmVhdGVTb3VyY2VGaWxlLCBjcmVhdGVUb2tlbiwgY3JlYXRlVHlwZUxpdGVyYWxOb2RlLCBjcmVhdGVUeXBlUmVmZXJlbmNlTm9kZSwgQ3VzdG9tVHJhbnNmb3JtZXJzLCBEZWNsYXJhdGlvbiwgRGVjbGFyYXRpb25TdGF0ZW1lbnQsIERlY2xhcmF0aW9uV2l0aFR5cGVQYXJhbWV0ZXJzLCBEZWNvcmF0b3IsIERpYWdub3N0aWMsIERpYWdub3N0aWNDYXRlZ29yeSwgRWxlbWVudEFjY2Vzc0V4cHJlc3Npb24sIEVtaXRGbGFncywgRW1pdFJlc3VsdCwgRW50aXR5TmFtZSwgRW51bURlY2xhcmF0aW9uLCBFbnVtTWVtYmVyLCBFeHBvcnREZWNsYXJhdGlvbiwgRXhwb3J0U3BlY2lmaWVyLCBFeHByZXNzaW9uLCBFeHByZXNzaW9uU3RhdGVtZW50LCBmbGF0dGVuRGlhZ25vc3RpY01lc3NhZ2VUZXh0LCBmb3JFYWNoQ2hpbGQsIEZ1bmN0aW9uRGVjbGFyYXRpb24sIEZ1bmN0aW9uTGlrZURlY2xhcmF0aW9uLCBHZXRBY2Nlc3NvckRlY2xhcmF0aW9uLCBnZXRDb21iaW5lZE1vZGlmaWVyRmxhZ3MsIGdldExlYWRpbmdDb21tZW50UmFuZ2VzLCBnZXRMaW5lQW5kQ2hhcmFjdGVyT2ZQb3NpdGlvbiwgZ2V0TXV0YWJsZUNsb25lLCBnZXRPcmlnaW5hbE5vZGUsIGdldFByZUVtaXREaWFnbm9zdGljcywgZ2V0U3ludGhldGljTGVhZGluZ0NvbW1lbnRzLCBnZXRTeW50aGV0aWNUcmFpbGluZ0NvbW1lbnRzLCBnZXRUcmFpbGluZ0NvbW1lbnRSYW5nZXMsIElkZW50aWZpZXIsIEltcG9ydERlY2xhcmF0aW9uLCBJbXBvcnRFcXVhbHNEZWNsYXJhdGlvbiwgSW1wb3J0U3BlY2lmaWVyLCBJbnRlcmZhY2VEZWNsYXJhdGlvbiwgaXNCaW5hcnlFeHByZXNzaW9uLCBpc0V4cG9ydERlY2xhcmF0aW9uLCBpc0V4cHJlc3Npb25TdGF0ZW1lbnQsIGlzSWRlbnRpZmllciwgTWV0aG9kRGVjbGFyYXRpb24sIE1vZGlmaWVyRmxhZ3MsIE1vZHVsZUJsb2NrLCBNb2R1bGVEZWNsYXJhdGlvbiwgTW9kdWxlS2luZCwgTW9kdWxlUmVzb2x1dGlvbkhvc3QsIE5hbWVkRGVjbGFyYXRpb24sIE5hbWVkSW1wb3J0cywgTm9kZSwgTm9kZUFycmF5LCBOb2RlRmxhZ3MsIE5vbk51bGxFeHByZXNzaW9uLCBOb3RFbWl0dGVkU3RhdGVtZW50LCBPYmplY3RMaXRlcmFsRWxlbWVudExpa2UsIE9iamVjdExpdGVyYWxFeHByZXNzaW9uLCBQYXJhbWV0ZXJEZWNsYXJhdGlvbiwgcGFyc2VDb21tYW5kTGluZSwgcGFyc2VKc29uQ29uZmlnRmlsZUNvbnRlbnQsIFByb2dyYW0sIFByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbiwgUHJvcGVydHlBc3NpZ25tZW50LCBQcm9wZXJ0eURlY2xhcmF0aW9uLCBQcm9wZXJ0eU5hbWUsIFByb3BlcnR5U2lnbmF0dXJlLCByZWFkQ29uZmlnRmlsZSwgcmVzb2x2ZU1vZHVsZU5hbWUsIFNjcmlwdFRhcmdldCwgU2V0QWNjZXNzb3JEZWNsYXJhdGlvbiwgc2V0RW1pdEZsYWdzLCBzZXRPcmlnaW5hbE5vZGUsIHNldFNvdXJjZU1hcFJhbmdlLCBzZXRTeW50aGV0aWNMZWFkaW5nQ29tbWVudHMsIHNldFN5bnRoZXRpY1RyYWlsaW5nQ29tbWVudHMsIHNldFRleHRSYW5nZSwgU2lnbmF0dXJlRGVjbGFyYXRpb24sIFNvdXJjZUZpbGUsIFN0YXRlbWVudCwgU3RyaW5nTGl0ZXJhbCwgU3ltYm9sLCBTeW1ib2xGbGFncywgU3ludGF4S2luZCwgU3ludGhlc2l6ZWRDb21tZW50LCBzeXMsIFRva2VuLCBUcmFuc2Zvcm1hdGlvbkNvbnRleHQsIFRyYW5zZm9ybWVyLCBUcmFuc2Zvcm1lckZhY3RvcnksIFR5cGUsIFR5cGVBbGlhc0RlY2xhcmF0aW9uLCBUeXBlQ2hlY2tlciwgVHlwZUVsZW1lbnQsIFR5cGVGbGFncywgVHlwZU5vZGUsIFR5cGVSZWZlcmVuY2UsIFVuaW9uVHlwZSwgdXBkYXRlQmxvY2ssIFZhcmlhYmxlRGVjbGFyYXRpb24sIFZhcmlhYmxlU3RhdGVtZW50LCB2aXNpdEVhY2hDaGlsZCwgdmlzaXRMZXhpY2FsRW52aXJvbm1lbnQsIFZpc2l0b3IsIFdyaXRlRmlsZUNhbGxiYWNrfSBmcm9tICd0eXBlc2NyaXB0JztcblxuLy8gZ2V0RW1pdEZsYWdzIGlzIG5vdyBwcml2YXRlIHN0YXJ0aW5nIGluIFRTIDIuNS5cbi8vIFNvIHdlIGRlZmluZSBvdXIgb3duIG1ldGhvZCB0aGF0IGNhbGxzIHRocm91Z2ggdG8gVHlwZVNjcmlwdCB0byBkZWZlYXQgdGhlXG4vLyB2aXNpYmlsaXR5IGNvbnN0cmFpbnQuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RW1pdEZsYWdzKG5vZGU6IHRzLk5vZGUpOiB0cy5FbWl0RmxhZ3N8dW5kZWZpbmVkIHtcbiAgcmV0dXJuICh0cyBhcyBhbnkpLmdldEVtaXRGbGFncyhub2RlKTtcbn1cblxuLy8gQmV0d2VlbiBUeXBlU2NyaXB0IDIuNCBhbmQgMi41IHVwZGF0ZVByb3BlcnR5IHdhcyBtb2RpZmllZC4gSWYgY2FsbGVkIHdpdGggMi40IHJlLW9yZGVyIHRoZVxuLy8gcGFyYW1ldGVycy5cbmV4cG9ydCBsZXQgdXBkYXRlUHJvcGVydHkgPSB0cy51cGRhdGVQcm9wZXJ0eTtcblxuY29uc3QgW21ham9yLCBtaW5vcl0gPSB0cy52ZXJzaW9uLnNwbGl0KCcuJyk7XG5pZiAobWFqb3IgPT09ICcyJyAmJiBtaW5vciA9PT0gJzQnKSB7XG4gIGNvbnN0IHVwZGF0ZVByb3BlcnR5MjQgPSB0cy51cGRhdGVQcm9wZXJ0eSBhcyBhbnkgYXMgdHlwZW9mIHRzMjQudXBkYXRlUHJvcGVydHk7XG4gIHVwZGF0ZVByb3BlcnR5ID0gKG5vZGU6IHRzLlByb3BlcnR5RGVjbGFyYXRpb24sIGRlY29yYXRvcnM6IFJlYWRvbmx5QXJyYXk8dHMuRGVjb3JhdG9yPnx1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIG1vZGlmaWVyczogUmVhZG9ubHlBcnJheTx0cy5Nb2RpZmllcj58dW5kZWZpbmVkLCBuYW1lOiBzdHJpbmd8dHMuUHJvcGVydHlOYW1lLFxuICAgICAgICAgICAgICAgICAgICBxdWVzdGlvblRva2VuOiB0cy5RdWVzdGlvblRva2VufHVuZGVmaW5lZCwgdHlwZTogdHMuVHlwZU5vZGV8dW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsaXplcjogdHMuRXhwcmVzc2lvbnx1bmRlZmluZWQpOiB0cy5Qcm9wZXJ0eURlY2xhcmF0aW9uID0+IHtcbiAgICByZXR1cm4gdXBkYXRlUHJvcGVydHkyNChcbiAgICAgICAgICAgICAgIG5vZGUgYXMgYW55IGFzIHRzMjQuUHJvcGVydHlEZWNsYXJhdGlvbiwgZGVjb3JhdG9ycyBhcyBhbnkgYXMgdHMyNC5EZWNvcmF0b3JbXSxcbiAgICAgICAgICAgICAgIG1vZGlmaWVycyBhcyBhbnksIG5hbWUgYXMgYW55LCB0eXBlIGFzIGFueSzCoGluaXRpYWxpemVyIGFzIGFueSkgYXMgYW55O1xuICB9O1xufVxuIl19