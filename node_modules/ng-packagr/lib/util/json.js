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
const glob = require("glob");
const fs_extra_1 = require("fs-extra");
const promisify_1 = require("./promisify");
const log_1 = require("./log");
/**
 * Modifies a set of JSON files by invoking `modifyFn`
 *
 * @param globPattern A glob pattern matching several files. Example: '**\/*.js.map'
 * @param modifyFn A callback function that takes a JSON-parsed input and should return an output
 *                  that will be JSON-stringified
 */
function modifyJsonFiles(globPattern, modifyFn) {
    return __awaiter(this, void 0, void 0, function* () {
        log_1.debug('modifyJsonFiles');
        const fileNames = yield promisify_1.promisify(resolveOrReject => {
            glob(globPattern, resolveOrReject);
        });
        yield Promise.all(fileNames.map((fileName) => __awaiter(this, void 0, void 0, function* () {
            const fileContent = yield tryReadJson(fileName);
            const modified = modifyFn(fileContent);
            yield fs_extra_1.writeJson(fileName, modified, { spaces: 2 });
        })));
    });
}
exports.modifyJsonFiles = modifyJsonFiles;
/**
 * Read json and don't throw if json parsing fails.
 *
 * @param filePath Path to the file which is parsed.
 */
function tryReadJson(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return fs_extra_1.readJson(filePath);
        }
        catch (e) {
            // this means the file was empty or not json, which is fine
            return Promise.resolve({});
        }
    });
}
exports.tryReadJson = tryReadJson;
//# sourceMappingURL=json.js.map