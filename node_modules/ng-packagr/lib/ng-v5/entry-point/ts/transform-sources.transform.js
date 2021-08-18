"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operators_1 = require("rxjs/operators");
const pipe_1 = require("rxjs/util/pipe");
const log = require("../../../util/log");
const transform_source_files_1 = require("../../../ngc/transform-source-files");
const ng_component_transformer_1 = require("../../../ts/ng-component-transformer");
const nodes_1 = require("../../nodes");
exports.transformSourcesTransform = pipe_1.pipe(operators_1.map(graph => {
    const entryPoint = graph.find(nodes_1.isEntryPointInProgress());
    log.debug(`Transforming TypeScript sources for ${entryPoint.data.entryPoint.moduleId}`);
    // Transformer that inlines template and style data
    const inlineResources = ng_component_transformer_1.transformComponentSourceFiles({
        template: ({ templateFilePath }) => {
            return entryPoint.find(node => node.url === nodes_1.fileUrl(templateFilePath)).data.content;
        },
        stylesheet: ({ styleFilePath }) => {
            return entryPoint.find(node => node.url === nodes_1.fileUrl(styleFilePath)).data.content;
        }
    });
    // TypeScriptSourcesNode
    const tsSources = entryPoint.find(nodes_1.isTypeScriptSources);
    const previousTransform = tsSources.data;
    // Modify the TypeScript source files
    tsSources.data = transform_source_files_1.transformSourceFiles(previousTransform, [inlineResources]);
    // Dispose the previous transformation result
    previousTransform.dispose();
    return graph;
}));
//# sourceMappingURL=transform-sources.transform.js.map