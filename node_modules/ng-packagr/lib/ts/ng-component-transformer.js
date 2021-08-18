"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const path = require("path");
const transform_component_1 = require("./transform-component");
const synthesized_source_file_1 = require("./synthesized-source-file");
exports.transformComponentSourceFiles = ({ template, stylesheet }) => transform_component_1.transformComponent({
    templateUrl: node => {
        const sourceFile = node.getSourceFile();
        const sourceFilePath = node.getSourceFile().fileName;
        // XX: strip quotes (' or ") from path
        const templatePath = node.initializer.getText().substring(1, node.initializer.getText().length - 1);
        const templateFilePath = path.resolve(path.dirname(sourceFilePath), templatePath);
        // Call the transformer
        const inlinedTemplate = template({ node, sourceFile, sourceFilePath, templatePath, templateFilePath });
        if (typeof inlinedTemplate === 'string') {
            // Apply the transformer result, thus altering the source file
            const synthesizedNode = ts.updatePropertyAssignment(node, ts.createIdentifier('template'), ts.createLiteral(inlinedTemplate));
            const synthesizedSourceText = 'template: `'.concat(inlinedTemplate).concat('`');
            synthesized_source_file_1.replaceWithSynthesizedSourceText(node, synthesizedSourceText);
            return synthesizedNode;
        }
        else {
            return node;
        }
    },
    styleUrls: node => {
        const sourceFile = node.getSourceFile();
        const sourceFilePath = node.getSourceFile().fileName;
        // Handle array arguments for styleUrls
        const styleUrls = node.initializer
            .getChildren()
            .filter(node => node.kind === ts.SyntaxKind.SyntaxList)
            .map(node => node.getChildren().map(n => n.getText()))
            .reduce((prev, current) => prev.concat(...current), [])
            .filter(text => text !== ',')
            .map(url => url.substring(1, url.length - 1));
        // Call the transformation for each value found in `stylesUrls: []`.
        const stylesheets = styleUrls.map((url) => {
            const styleFilePath = path.resolve(path.dirname(sourceFilePath), url);
            // Call the stylesheet transformer
            const content = stylesheet({ node, sourceFile, sourceFilePath, stylePath: url, styleFilePath });
            return typeof content === 'string' ? content : url;
        });
        // Check if the transformer manipulated the metadata of the `@Component({..})` decorator
        const hasChanged = stylesheets.every((value, index) => {
            return styleUrls[index] && styleUrls[index] !== value;
        });
        if (hasChanged) {
            // Apply the transformation result, thus altering the source file
            const synthesizedNode = ts.updatePropertyAssignment(node, ts.createIdentifier('styles'), ts.createArrayLiteral(stylesheets.map(value => ts.createLiteral(value))));
            const synthesizedSourceText = 'styles: ['
                .concat(stylesheets.map(value => `\`${value}\``).join(', '))
                .concat(']');
            synthesized_source_file_1.replaceWithSynthesizedSourceText(node, synthesizedSourceText);
            return synthesizedNode;
        }
        else {
            return node;
        }
    },
    file: sourceFile => {
        // XX ... the string replacement is quite hacky.
        // Why can't we use `ts.SourceFile#update()`?
        // It produces a `FalseExpression` error, somehow.
        if (synthesized_source_file_1.isSynthesizedSourceFile(sourceFile['original'])) {
            sourceFile['__replacements'] = sourceFile['original'].__replacements;
            return synthesized_source_file_1.writeSourceFile(sourceFile);
        }
        return sourceFile;
    }
});
//# sourceMappingURL=ng-component-transformer.js.map