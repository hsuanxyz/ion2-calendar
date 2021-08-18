"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
/**
 * Returns a TypeScript compiler host that redirects `writeFile` output to the given `outDir`.
 *
 * @param compilerHost Original compiler host
 * @param baseDir Project base directory
 * @param outDir Target directory
 */
function redirectWriteFileCompilerHost(compilerHost, baseDir, outDir) {
    return Object.assign({}, compilerHost, { writeFile: (fileName, data, writeByteOrderMark, onError, sourceFiles) => {
            const projectRelativePath = path.relative(baseDir, fileName);
            const filePath = path.resolve(outDir, projectRelativePath);
            fs.outputFileSync(filePath, data);
        } });
}
exports.redirectWriteFileCompilerHost = redirectWriteFileCompilerHost;
//# sourceMappingURL=redirect-write-file-compiler-host.js.map