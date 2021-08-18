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
const sorcery = require("sorcery");
const log = require("../util/log");
/**
 * Re-maps the source `.map` file for the given `sourceFile`. This keeps source maps intact over
 * a series of transpilations!
 *
 * @param sourceFile Source file
 */
function remapSourceMap(sourceFile) {
    return __awaiter(this, void 0, void 0, function* () {
        log.debug(`re-mapping sources for ${sourceFile}`);
        const opts = {
            inline: false,
            includeContent: true
        };
        // Once sorcery loads the chain of sourcemaps, the new sourcemap will be written asynchronously.
        const chain = yield sorcery.load(sourceFile);
        if (!chain) {
            throw new Error('Failed to load sourceMap chain for ' + sourceFile);
        }
        yield chain.write(opts);
    });
}
exports.remapSourceMap = remapSourceMap;
//# sourceMappingURL=remap.js.map