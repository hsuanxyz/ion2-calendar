"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operators_1 = require("rxjs/operators");
const pipe_1 = require("rxjs/util/pipe");
const log = require("../../util/log");
const transform_source_files_1 = require("../../ngc/transform-source-files");
const analyse_dependencies_transformer_1 = require("../../ts/analyse-dependencies-transformer");
const ng_component_transformer_1 = require("../../ts/ng-component-transformer");
const nodes_1 = require("../nodes");
exports.analyseSourcesTransform = pipe_1.pipe(operators_1.map(graph => {
    const entryPoints = graph.filter(nodes_1.isEntryPoint);
    for (let entryPoint of entryPoints) {
        log.debug(`Analysing sources for ${entryPoint.data.entryPoint.moduleId}`);
        // Extracts templateUrl and styleUrls from `@Component({..})` decorators.
        const extractResources = ng_component_transformer_1.transformComponentSourceFiles({
            template: ({ templateFilePath }) => {
                const templateNode = new nodes_1.TemplateNode(nodes_1.fileUrl(templateFilePath));
                graph.put(templateNode);
                // mark that entryPoint depends on node
                entryPoint.dependsOn(templateNode);
            },
            stylesheet: ({ styleFilePath }) => {
                const stylesheetNode = new nodes_1.StylesheetNode(nodes_1.fileUrl(styleFilePath));
                graph.put(stylesheetNode);
                // mark that entryPoint depends on node
                entryPoint.dependsOn(stylesheetNode);
            }
        });
        // Extract TypeScript dependencies from source text (`import .. from 'moduleId'`)
        const extractDependencies = analyse_dependencies_transformer_1.analyseDependencies((sourceFile, moduleId) => {
            log.debug(`Found dependency in ${sourceFile.fileName}: ${moduleId}`);
            const dep = entryPoints.find(ep => ep.data.entryPoint.moduleId === moduleId);
            if (dep) {
                log.debug(`Found entry point dependency: ${entryPoint.data.entryPoint.moduleId} -> ${dep.data.entryPoint.moduleId}`);
                entryPoint.dependsOn(dep);
            }
        });
        // TODO: a typescript `SourceFile` may also be added as individual nod to the graph
        const tsSourcesNode = new nodes_1.TypeScriptSourceNode(nodes_1.tsUrl(entryPoint.data.entryPoint.moduleId));
        tsSourcesNode.data = transform_source_files_1.transformSourceFiles(entryPoint.data.tsConfig, [extractResources, extractDependencies]);
        graph.put(tsSourcesNode);
        entryPoint.dependsOn(tsSourcesNode);
    }
    return graph;
}));
//# sourceMappingURL=analyse-sources.transform.js.map