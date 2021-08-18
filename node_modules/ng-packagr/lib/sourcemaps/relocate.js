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
const json_1 = require("../util/json");
/**
 * Relocates pathes of the `sources` file array in `*.js.map` files.
 *
 * Simply said, because `sourcesContent` are inlined in the source maps, it's possible to pass an
 * arbitrary file name and path in the `sources` property. By setting the value to a common prefix,
 * i.e. `ng://@org/package/secondary`,
 * the source map p `.map` file's relative root file paths to the module's name.
 *
 * @param flobPattern A glob pattern matching `.js.map` files
 * @param mapFn A mapping function to relocate/modify source map paths
 */
function relocateSourceMaps(globPattern, mapFn) {
    return __awaiter(this, void 0, void 0, function* () {
        yield json_1.modifyJsonFiles(globPattern, (sourceMap) => {
            sourceMap.sources = sourceMap.sources.map(mapFn);
            return sourceMap;
        });
    });
}
exports.relocateSourceMaps = relocateSourceMaps;
//# sourceMappingURL=relocate.js.map