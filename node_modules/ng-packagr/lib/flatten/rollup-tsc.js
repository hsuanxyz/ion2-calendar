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
const typescript_1 = require("typescript");
const log_1 = require("../util/log");
/**
 * Downlevels a .js file from ES2015 to ES5. Internally, uses `tsc`.
 *
 */
function downlevelWithTsc(code, filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        log_1.debug(`tsc ${filePath}`);
        const compilerOptions = {
            target: typescript_1.ScriptTarget.ES5,
            module: typescript_1.ModuleKind.ES2015,
            allowJs: true,
            sourceMap: true,
            importHelpers: true,
            downlevelIteration: true,
            mapRoot: path.dirname(filePath)
        };
        const transpiled = typescript_1.transpileModule(code, {
            compilerOptions
        });
        return {
            code: transpiled.outputText,
            map: transpiled.sourceMapText
        };
    });
}
exports.downlevelWithTsc = downlevelWithTsc;
//# sourceMappingURL=rollup-tsc.js.map