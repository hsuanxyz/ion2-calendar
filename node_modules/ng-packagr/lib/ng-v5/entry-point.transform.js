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
const pipe_1 = require("rxjs/util/pipe");
const node_1 = require("../brocc/node");
const select_1 = require("../brocc/select");
const transform_1 = require("../brocc/transform");
const log = require("../util/log");
const rimraf_1 = require("../util/rimraf");
const nodes_1 = require("./nodes");
/**
 * A re-write of the `transformSources()` script that transforms an entry point from sources to distributable format.
 *
 * Sources are TypeScript source files accompanied by HTML templates and xCSS stylesheets.
 * See the Angular Package Format for a detailed description of what the distributables include.
 *
 * The current transformation pipeline can be thought of as:
 *
 *  - clean
 *  - renderTemplates
 *  - renderStylesheets
 *  - transformTsSources (thereby inlining template and stylesheet data)
 *  - compileTs
 *  - writeBundles
 *    - bundleToFesm15
 *    - bundleToFesm5
 *    - bundleToUmd
 *    - bundleToUmdMin
 *  - relocateSourceMaps
 *  - writePackage
 *   - copyStagedFiles (bundles, esm, dts, metadata, sourcemaps)
 *   - writePackageJson
 *
 * The transformation pipeline is pluggable through the dependency injection system.
 * Sub-transformations are passed to this factory function as arguments.
 *
 * @param renderTemplates Transformation rendering HTML templates.
 * @param renderStylesheets Transformation rendering xCSS stylesheets.
 * @param transformTsSources Transformation manipulating the typescript source files (thus inlining template and stylesheet data).
 * @param compileTs Transformation compiling typescript sources to ES2015 modules.
 * @param writeBundles Transformation flattening ES2015 modules to ESM2015, ESM5, UMD, and minified UMD.
 * @param relocateSourceMaps Transformation re-locating (adapting) paths in the source maps.
 * @param writePackage Transformation writing a distribution-ready `package.json` (for publishing to npm registry).
 */
exports.entryPointTransformFactory = (renderStylesheets, renderTemplates, transformTsSources, compileTs, writeBundles, relocateSourceMaps, writePackage) => pipe_1.pipe(
//tap(() => log.info(`Building from sources for entry point`)),
transform_1.transformFromPromise((graph) => __awaiter(this, void 0, void 0, function* () {
    // Peek the first entry point from the graph
    const entryPoint = graph.find(nodes_1.byEntryPoint().and(select_1.isInProgress));
    log.info(`Building entry point '${entryPoint.data.entryPoint.moduleId}'`);
    // Clean build directory
    yield clean(entryPoint.data.stageDir, entryPoint.data.outDir);
})), 
// Stylesheet and template rendering
renderStylesheets, renderTemplates, 
// Inlining of stylesheets and templates
transformTsSources, 
// TypeScript sources compilation
compileTs, 
// After TypeScript: bundling and write package
writeBundles, relocateSourceMaps, writePackage, transform_1.transformFromPromise((graph) => __awaiter(this, void 0, void 0, function* () {
    const entryPoint = graph.find(nodes_1.byEntryPoint().and(select_1.isInProgress));
    entryPoint.state = node_1.STATE_DONE;
}))
//tap(() => log.info(`Built.`))
);
function clean(...paths) {
    return __awaiter(this, void 0, void 0, function* () {
        log.info('Cleaning build directory');
        for (let path of paths) {
            yield rimraf_1.rimraf(path);
        }
    });
}
//# sourceMappingURL=entry-point.transform.js.map