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
const remap_1 = require("../sourcemaps/remap");
const log = require("../util/log");
const rollup_1 = require("./rollup");
const rollup_tsc_1 = require("./rollup-tsc");
const uglify_1 = require("./uglify");
function writeFlatBundleFiles(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        log.info('Bundling to FESM15');
        const fesm15File = yield flattenToFesm15(opts);
        yield remap_1.remapSourceMap(fesm15File);
        log.info('Bundling to FESM5');
        const fesm5File = yield flattenToFesm5(Object.assign({}, opts, { entryFile: fesm15File }));
        yield remap_1.remapSourceMap(fesm5File);
        log.info('Bundling to UMD');
        const umdFile = yield flattenToUmd(Object.assign({}, opts, { entryFile: fesm5File }));
        yield remap_1.remapSourceMap(umdFile);
        log.info('Minifying UMD bundle');
        const minUmdFile = yield flattenToUmdMin(Object.assign({}, opts, { entryFile: umdFile }));
        yield remap_1.remapSourceMap(minUmdFile);
    });
}
exports.writeFlatBundleFiles = writeFlatBundleFiles;
function flattenToFesm15(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const destFile = path.resolve(opts.outDir, 'esm2015', opts.flatModuleFile + '.js');
        yield rollup_1.rollupBundleFile({
            moduleName: opts.esmModuleId,
            entry: opts.entryFile,
            format: 'es',
            dest: destFile,
            embedded: opts.embedded,
            comments: opts.comments,
            licensePath: opts.licensePath
        });
        return destFile;
    });
}
exports.flattenToFesm15 = flattenToFesm15;
function flattenToFesm5(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const destFile = path.resolve(opts.outDir, 'esm5', opts.flatModuleFile + '.js');
        yield rollup_1.rollupBundleFile({
            moduleName: opts.esmModuleId,
            entry: opts.entryFile,
            format: 'es',
            dest: destFile,
            embedded: opts.embedded,
            transform: rollup_tsc_1.downlevelWithTsc
        });
        return destFile;
    });
}
exports.flattenToFesm5 = flattenToFesm5;
function flattenToUmd(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const destFile = path.resolve(opts.outDir, 'bundles', opts.flatModuleFile + '.umd.js');
        const { embedded = [] } = opts;
        yield rollup_1.rollupBundleFile({
            moduleName: opts.umdModuleId,
            entry: opts.entryFile,
            format: 'umd',
            dest: destFile,
            amd: { id: opts.amdId },
            umdModuleIds: Object.assign({}, opts.umdModuleIds),
            embedded: ['tslib', ...embedded],
            comments: opts.comments,
            licensePath: opts.licensePath
        });
        return destFile;
    });
}
exports.flattenToUmd = flattenToUmd;
function flattenToUmdMin(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        return uglify_1.minifyJsFile(opts.entryFile);
    });
}
exports.flattenToUmdMin = flattenToUmdMin;
//# sourceMappingURL=flatten.js.map