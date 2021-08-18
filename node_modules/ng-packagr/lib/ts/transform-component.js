"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const ng_ts_ast_1 = require("./ng-ts-ast");
exports.transformComponent = transformer => context => sourceFile => {
    // skip source files from 'node_modules' directory (third-party source)
    if (sourceFile.fileName.includes('node_modules')) {
        return sourceFile;
    }
    const visitComponentMetadata = (node) => {
        if (ng_ts_ast_1.isTemplateUrl(node)) {
            return transformer.templateUrl(node);
        }
        else if (ng_ts_ast_1.isStyleUrls(node)) {
            return transformer.styleUrls(node);
        }
        return ts.visitEachChild(node, visitComponentMetadata, context);
    };
    const visitDecorators = (node) => ng_ts_ast_1.isComponentDecorator(node)
        ? ts.visitEachChild(node, visitComponentMetadata, context)
        : ts.visitEachChild(node, visitDecorators, context);
    // Either custom file transformer or identity transform
    const transformFile = transformer.file ? transformer.file : file => file;
    return transformFile(ts.visitNode(sourceFile, visitDecorators));
};
//# sourceMappingURL=transform-component.js.map