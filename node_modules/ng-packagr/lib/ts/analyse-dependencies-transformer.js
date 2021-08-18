"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
exports.analyseDependencies = (analyser) => (context) => (sourceFile) => {
    // skip source files from 'node_modules' directory (third-party source)
    // 'ngfactory' and 'ngstyles' should also be skipped
    if (/node_modules|\.ngfactory|\.ngstyle/.test(sourceFile.fileName)) {
        return sourceFile;
    }
    const findModuleIdFromImport = (node) => {
        const text = node.moduleSpecifier.getText();
        return text.substring(1, text.length - 1);
    };
    const visitImports = node => {
        if (ts.isImportDeclaration(node)) {
            // Found an 'import ...' declaration
            const importedModuleId = findModuleIdFromImport(node);
            analyser(node.getSourceFile(), importedModuleId);
        }
        else {
            return ts.visitEachChild(node, visitImports, context);
        }
        return node;
    };
    return ts.visitEachChild(sourceFile, visitImports, context);
};
//# sourceMappingURL=analyse-dependencies-transformer.js.map