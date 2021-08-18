"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
function isSynthesizedSourceFile(sourceFile) {
    return sourceFile && sourceFile['__replacements'] instanceof Array;
}
exports.isSynthesizedSourceFile = isSynthesizedSourceFile;
/**
 * Adds a {@link Replacement} marker to the TypeScript source file of `node`. The source text of
 * `node` should be replaced by the `replacement` source text in subsequent processing.
 *
 * @param node The source node that should be replaced
 * @param replacement The synthesized source text that will replace the node.
 */
function replaceWithSynthesizedSourceText(node, replacement) {
    const sourceFile = node.getSourceFile();
    if (!sourceFile.__replacements) {
        sourceFile.__replacements = [];
    }
    sourceFile.__replacements.push({
        from: node.getStart(),
        to: node.getEnd(),
        text: replacement
    });
    return sourceFile;
}
exports.replaceWithSynthesizedSourceText = replaceWithSynthesizedSourceText;
/**
 * Writes TypeScript source text to a string, potentially applying replacements.
 *
 * @param sourceFile TypeScript source file, either original or synthesiized sources
 */
function writeSourceText(sourceFile) {
    const originalSource = sourceFile.getFullText();
    if (isSynthesizedSourceFile(sourceFile)) {
        let newSource = '';
        let position = 0;
        for (let replacement of sourceFile.__replacements) {
            newSource = newSource.concat(originalSource.substring(position, replacement.from)).concat(replacement.text);
            position = replacement.to;
        }
        newSource = newSource.concat(originalSource.substring(position));
        return newSource;
    }
    else {
        return originalSource;
    }
}
exports.writeSourceText = writeSourceText;
/**
 * Writes a TypeScript source file, potentially applying replacements, and returns a 'fresh' source
 * file instance that may be used for later processing.
 *
 * @param sourceFile TypeScript source file, either original or synthesized sources
 */
function writeSourceFile(sourceFile) {
    if (isSynthesizedSourceFile(sourceFile)) {
        const sourceText = writeSourceText(sourceFile);
        return ts.createSourceFile(sourceFile.fileName, sourceText, sourceFile.languageVersion, true, ts.ScriptKind.TS);
    }
    else {
        return sourceFile;
    }
}
exports.writeSourceFile = writeSourceFile;
//# sourceMappingURL=synthesized-source-file.js.map