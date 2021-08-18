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
const fs = require("fs-extra");
const ng = require("@angular/compiler-cli");
const path = require("path");
const synthesized_compiler_host_1 = require("../ts/synthesized-compiler-host");
const redirect_write_file_compiler_host_1 = require("../ts/redirect-write-file-compiler-host");
const log = require("../util/log");
const create_emit_callback_1 = require("./create-emit-callback");
function compileSourceFiles(sourceFiles, tsConfig, outDir) {
    return __awaiter(this, void 0, void 0, function* () {
        log.debug(`ngc (v${ng.VERSION.full})`);
        // ts.CompilerHost
        let tsCompilerHost = synthesized_compiler_host_1.createCompilerHostForSynthesizedSourceFiles(sourceFiles, tsConfig.options);
        if (typeof outDir === 'string' && outDir.length) {
            // Redirect file output
            tsCompilerHost = redirect_write_file_compiler_host_1.redirectWriteFileCompilerHost(tsCompilerHost, tsConfig.options.basePath, outDir);
        }
        else {
            outDir = tsConfig.options.outDir;
        }
        // ng.CompilerHost
        const ngCompilerHost = ng.createCompilerHost({
            options: tsConfig.options,
            tsHost: tsCompilerHost
        });
        // ng.Program
        const ngProgram = ng.createProgram({
            rootNames: [...tsConfig.rootNames],
            options: tsConfig.options,
            host: ngCompilerHost
        });
        // ngc
        const result = ng.performCompilation({
            rootNames: [...tsConfig.rootNames],
            options: tsConfig.options,
            emitFlags: tsConfig.emitFlags,
            emitCallback: create_emit_callback_1.createEmitCallback(tsConfig.options),
            host: ngCompilerHost,
            oldProgram: ngProgram
        });
        const flatModuleFile = tsConfig.options.flatModuleOutFile;
        const flatModuleFileExtension = path.extname(flatModuleFile);
        // XX(hack): redirect the `*.metadata.json` to the correct outDir
        // @link https://github.com/angular/angular/pull/21787
        const metadataBundleFile = flatModuleFile.replace(flatModuleFileExtension, '.metadata.json');
        const metadataSrc = path.resolve(tsConfig.options.outDir, metadataBundleFile);
        const metadataDest = path.resolve(outDir, metadataBundleFile);
        if (metadataDest !== metadataSrc && fs.existsSync(metadataSrc)) {
            yield fs.move(metadataSrc, metadataDest);
        }
        const exitCode = ng.exitCodeFromResult(result.diagnostics);
        if (exitCode === 0) {
            return Promise.resolve({
                js: path.resolve(outDir, flatModuleFile),
                metadata: metadataDest,
                typings: path.resolve(outDir, flatModuleFile.replace(flatModuleFileExtension, '.d.ts'))
            });
        }
        else {
            return Promise.reject(new Error(ng.formatDiagnostics(result.diagnostics)));
        }
    });
}
exports.compileSourceFiles = compileSourceFiles;
//# sourceMappingURL=compile-source-files.js.map