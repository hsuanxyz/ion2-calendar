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
const transform_1 = require("../../brocc/transform");
const relocate_1 = require("../../sourcemaps/relocate");
const log = require("../../util/log");
const nodes_1 = require("../nodes");
exports.relocateSourceMapsTransform = transform_1.transformFromPromise((graph) => __awaiter(this, void 0, void 0, function* () {
    const entryPoint = graph.find(nodes_1.isEntryPointInProgress());
    const stageDir = entryPoint.data.stageDir;
    const moduleId = entryPoint.data.entryPoint.moduleId;
    // 4. SOURCEMAPS: RELOCATE ROOT PATHS
    log.info('Relocating source maps');
    const relocate = relocate_1.relocateSourceMaps(`${stageDir}/+(bundles|esm2015|esm5)/**/*.js.map`, path => {
        let trimmedPath = path;
        // Trim leading '../' path separators
        while (trimmedPath.startsWith('../')) {
            trimmedPath = trimmedPath.substring(3);
        }
        return `ng://${moduleId}/${trimmedPath}`;
    });
    return graph;
}));
//# sourceMappingURL=relocate-source-maps.transform.js.map