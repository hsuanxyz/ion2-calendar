"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ng = require("@angular/compiler-cli");
const ts = require("typescript");
function isTransformationResult(value) {
    return value.transformed instanceof Array && typeof value.dispose === 'function';
}
function transformSourceFiles(source, transformers) {
    if (isTransformationResult(source)) {
        // Apply subsequent typescript transformation to previous TransformationResult
        return ts.transform([...source.transformed], transformers);
    }
    else {
        // Apply initial typescript transformation to initial sources from TsConfig
        const tsConfig = source;
        const compilerHost = ng.createCompilerHost({
            options: tsConfig.options
        });
        const program = ng.createProgram({
            rootNames: [...tsConfig.rootNames],
            options: tsConfig.options,
            host: compilerHost
        });
        const sourceFiles = program.getTsProgram().getSourceFiles();
        const transformationResult = ts.transform(
        // XX: circumvent tsc compile error in 2.6
        Array.from(sourceFiles), transformers, tsConfig.options);
        return transformationResult;
    }
}
exports.transformSourceFiles = transformSourceFiles;
//# sourceMappingURL=transform-source-files.js.map