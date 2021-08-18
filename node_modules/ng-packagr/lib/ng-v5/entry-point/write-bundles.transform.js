"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operators_1 = require("rxjs/operators");
const fromPromise_1 = require("rxjs/observable/fromPromise");
const pipe_1 = require("rxjs/util/pipe");
const flatten_1 = require("../../flatten/flatten");
const nodes_1 = require("../nodes");
exports.writeBundlesTransform = pipe_1.pipe(operators_1.switchMap(graph => {
    const entryPoint = graph.find(nodes_1.isEntryPointInProgress());
    const ngEntryPoint = entryPoint.data.entryPoint;
    // Add UMD module IDs for dependencies
    const dependencyUmdIds = entryPoint
        .filter(nodes_1.isEntryPoint)
        .map(ep => ep.data.entryPoint)
        .reduce((prev, ep) => {
        prev[ep.moduleId] = ep.umdId;
        return prev;
    }, {});
    const opts = {
        entryFile: entryPoint.data.es2015EntryFile,
        outDir: entryPoint.data.stageDir,
        flatModuleFile: ngEntryPoint.flatModuleFile,
        esmModuleId: ngEntryPoint.moduleId,
        umdModuleId: ngEntryPoint.umdId,
        amdId: ngEntryPoint.amdId,
        umdModuleIds: Object.assign({}, ngEntryPoint.umdModuleIds, dependencyUmdIds),
        embedded: ngEntryPoint.embedded,
        comments: ngEntryPoint.comments,
        licensePath: ngEntryPoint.licensePath
    };
    return fromPromise_1.fromPromise(flatten_1.writeFlatBundleFiles(opts)).pipe(operators_1.map(() => graph));
}));
//# sourceMappingURL=write-bundles.transform.js.map