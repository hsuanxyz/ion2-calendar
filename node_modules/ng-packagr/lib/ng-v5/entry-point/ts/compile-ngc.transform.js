"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const transform_1 = require("../../../brocc/transform");
const compile_source_files_1 = require("../../../ngc/compile-source-files");
const log = require("../../../util/log");
const nodes_1 = require("../../nodes");
exports.compileNgcTransform = transform_1.transformFromPromise((graph) => __awaiter(this, void 0, void 0, function* () {
    log.info(`Compiling TypeScript sources through ngc`);
    const entryPoint = graph.find(nodes_1.isEntryPointInProgress());
    const tsSources = entryPoint.find(nodes_1.isTypeScriptSources);
    const tsConfig = entryPoint.data.tsConfig;
    // Add paths mappings for dependencies
    const entryPointDeps = entryPoint.filter(nodes_1.isEntryPoint);
    if (entryPointDeps.length > 0) {
        if (!tsConfig.options.paths) {
            tsConfig.options.paths = {};
        }
        for (let dep of entryPointDeps) {
            const depModuleId = dep.data.entryPoint.moduleId;
            if (!tsConfig.options.paths[depModuleId]) {
                tsConfig.options.paths[depModuleId] = [];
            }
            tsConfig.options.paths[depModuleId].push(path.resolve(path.dirname(dep.data.es2015EntryFile), path.basename(dep.data.es2015EntryFile, '.js')));
        }
    }
    // Compile TypeScript sources
    const previousTransform = tsSources.data;
    const compilationResult = yield compile_source_files_1.compileSourceFiles(tsSources.data.transformed, tsConfig, entryPoint.data.outDir);
    previousTransform.dispose();
    // Store compilation result on the graph for further processing (`writeFlatBundles`)
    entryPoint.data.es2015EntryFile = compilationResult.js;
    entryPoint.data.typings = compilationResult.typings;
    entryPoint.data.metadata = compilationResult.metadata;
    return graph;
}));
//# sourceMappingURL=compile-ngc.transform.js.map