/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/perform_compile", ["require", "exports", "@angular/compiler", "fs", "path", "typescript", "@angular/compiler-cli/src/transformers/api", "@angular/compiler-cli/src/transformers/entry_points", "@angular/compiler-cli/src/transformers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const compiler_1 = require("@angular/compiler");
    const fs = require("fs");
    const path = require("path");
    const ts = require("typescript");
    const api = require("@angular/compiler-cli/src/transformers/api");
    const ng = require("@angular/compiler-cli/src/transformers/entry_points");
    const util_1 = require("@angular/compiler-cli/src/transformers/util");
    const TS_EXT = /\.ts$/;
    function filterErrorsAndWarnings(diagnostics) {
        return diagnostics.filter(d => d.category !== ts.DiagnosticCategory.Message);
    }
    exports.filterErrorsAndWarnings = filterErrorsAndWarnings;
    const defaultFormatHost = {
        getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
        getCanonicalFileName: fileName => fileName,
        getNewLine: () => ts.sys.newLine
    };
    function displayFileName(fileName, host) {
        return path.relative(host.getCurrentDirectory(), host.getCanonicalFileName(fileName));
    }
    function formatDiagnosticPosition(position, host = defaultFormatHost) {
        return `${displayFileName(position.fileName, host)}(${position.line + 1},${position.column + 1})`;
    }
    exports.formatDiagnosticPosition = formatDiagnosticPosition;
    function flattenDiagnosticMessageChain(chain, host = defaultFormatHost) {
        let result = chain.messageText;
        let indent = 1;
        let current = chain.next;
        const newLine = host.getNewLine();
        while (current) {
            result += newLine;
            for (let i = 0; i < indent; i++) {
                result += '  ';
            }
            result += current.messageText;
            const position = current.position;
            if (position) {
                result += ` at ${formatDiagnosticPosition(position, host)}`;
            }
            current = current.next;
            indent++;
        }
        return result;
    }
    exports.flattenDiagnosticMessageChain = flattenDiagnosticMessageChain;
    function formatDiagnostic(diagnostic, host = defaultFormatHost) {
        let result = '';
        const newLine = host.getNewLine();
        const span = diagnostic.span;
        if (span) {
            result += `${formatDiagnosticPosition({
                fileName: span.start.file.url,
                line: span.start.line,
                column: span.start.col
            }, host)}: `;
        }
        else if (diagnostic.position) {
            result += `${formatDiagnosticPosition(diagnostic.position, host)}: `;
        }
        if (diagnostic.span && diagnostic.span.details) {
            result += `: ${diagnostic.span.details}, ${diagnostic.messageText}${newLine}`;
        }
        else if (diagnostic.chain) {
            result += `${flattenDiagnosticMessageChain(diagnostic.chain, host)}.${newLine}`;
        }
        else {
            result += `: ${diagnostic.messageText}${newLine}`;
        }
        return result;
    }
    exports.formatDiagnostic = formatDiagnostic;
    function formatDiagnostics(diags, host = defaultFormatHost) {
        if (diags && diags.length) {
            return diags
                .map(diagnostic => {
                if (api.isTsDiagnostic(diagnostic)) {
                    return ts.formatDiagnostics([diagnostic], host);
                }
                else {
                    return formatDiagnostic(diagnostic, host);
                }
            })
                .join('');
        }
        else {
            return '';
        }
    }
    exports.formatDiagnostics = formatDiagnostics;
    function calcProjectFileAndBasePath(project) {
        const projectIsDir = fs.lstatSync(project).isDirectory();
        const projectFile = projectIsDir ? path.join(project, 'tsconfig.json') : project;
        const projectDir = projectIsDir ? project : path.dirname(project);
        const basePath = path.resolve(process.cwd(), projectDir);
        return { projectFile, basePath };
    }
    exports.calcProjectFileAndBasePath = calcProjectFileAndBasePath;
    function createNgCompilerOptions(basePath, config, tsOptions) {
        return Object.assign({}, tsOptions, config.angularCompilerOptions, { genDir: basePath, basePath });
    }
    exports.createNgCompilerOptions = createNgCompilerOptions;
    function readConfiguration(project, existingOptions) {
        try {
            const { projectFile, basePath } = calcProjectFileAndBasePath(project);
            const readExtendedConfigFile = (configFile, existingConfig) => {
                const { config, error } = ts.readConfigFile(configFile, ts.sys.readFile);
                if (error) {
                    return { error };
                }
                // we are only interested into merging 'angularCompilerOptions' as
                // other options like 'compilerOptions' are merged by TS
                const baseConfig = existingConfig || config;
                if (existingConfig) {
                    baseConfig.angularCompilerOptions = Object.assign({}, config.angularCompilerOptions, baseConfig.angularCompilerOptions);
                }
                if (config.extends) {
                    let extendedConfigPath = path.resolve(path.dirname(configFile), config.extends);
                    extendedConfigPath = path.extname(extendedConfigPath) ? extendedConfigPath :
                        `${extendedConfigPath}.json`;
                    if (fs.existsSync(extendedConfigPath)) {
                        // Call read config recursively as TypeScript only merges CompilerOptions
                        return readExtendedConfigFile(extendedConfigPath, baseConfig);
                    }
                }
                return { config: baseConfig };
            };
            const { config, error } = readExtendedConfigFile(projectFile);
            if (error) {
                return {
                    project,
                    errors: [error],
                    rootNames: [],
                    options: {},
                    emitFlags: api.EmitFlags.Default
                };
            }
            const parseConfigHost = {
                useCaseSensitiveFileNames: true,
                fileExists: fs.existsSync,
                readDirectory: ts.sys.readDirectory,
                readFile: ts.sys.readFile
            };
            const parsed = ts.parseJsonConfigFileContent(config, parseConfigHost, basePath, existingOptions);
            const rootNames = parsed.fileNames.map(f => path.normalize(f));
            const options = createNgCompilerOptions(basePath, config, parsed.options);
            let emitFlags = api.EmitFlags.Default;
            if (!(options.skipMetadataEmit || options.flatModuleOutFile)) {
                emitFlags |= api.EmitFlags.Metadata;
            }
            if (options.skipTemplateCodegen) {
                emitFlags = emitFlags & ~api.EmitFlags.Codegen;
            }
            return { project: projectFile, rootNames, options, errors: parsed.errors, emitFlags };
        }
        catch (e) {
            const errors = [{
                    category: ts.DiagnosticCategory.Error,
                    messageText: e.stack,
                    source: api.SOURCE,
                    code: api.UNKNOWN_ERROR_CODE
                }];
            return { project: '', errors, rootNames: [], options: {}, emitFlags: api.EmitFlags.Default };
        }
    }
    exports.readConfiguration = readConfiguration;
    function exitCodeFromResult(diags) {
        if (!diags || filterErrorsAndWarnings(diags).length === 0) {
            // If we have a result and didn't get any errors, we succeeded.
            return 0;
        }
        // Return 2 if any of the errors were unknown.
        return diags.some(d => d.source === 'angular' && d.code === api.UNKNOWN_ERROR_CODE) ? 2 : 1;
    }
    exports.exitCodeFromResult = exitCodeFromResult;
    function performCompilation({ rootNames, options, host, oldProgram, emitCallback, mergeEmitResultsCallback, gatherDiagnostics = defaultGatherDiagnostics, customTransformers, emitFlags = api.EmitFlags.Default }) {
        let program;
        let emitResult;
        let allDiagnostics = [];
        try {
            if (!host) {
                host = ng.createCompilerHost({ options });
            }
            program = ng.createProgram({ rootNames, host, options, oldProgram });
            const beforeDiags = Date.now();
            allDiagnostics.push(...gatherDiagnostics(program));
            if (options.diagnostics) {
                const afterDiags = Date.now();
                allDiagnostics.push(util_1.createMessageDiagnostic(`Time for diagnostics: ${afterDiags - beforeDiags}ms.`));
            }
            if (!hasErrors(allDiagnostics)) {
                emitResult =
                    program.emit({ emitCallback, mergeEmitResultsCallback, customTransformers, emitFlags });
                allDiagnostics.push(...emitResult.diagnostics);
                return { diagnostics: allDiagnostics, program, emitResult };
            }
            return { diagnostics: allDiagnostics, program };
        }
        catch (e) {
            let errMsg;
            let code;
            if (compiler_1.isSyntaxError(e)) {
                // don't report the stack for syntax errors as they are well known errors.
                errMsg = e.message;
                code = api.DEFAULT_ERROR_CODE;
            }
            else {
                errMsg = e.stack;
                // It is not a syntax error we might have a program with unknown state, discard it.
                program = undefined;
                code = api.UNKNOWN_ERROR_CODE;
            }
            allDiagnostics.push({ category: ts.DiagnosticCategory.Error, messageText: errMsg, code, source: api.SOURCE });
            return { diagnostics: allDiagnostics, program };
        }
    }
    exports.performCompilation = performCompilation;
    function defaultGatherDiagnostics(program) {
        const allDiagnostics = [];
        function checkDiagnostics(diags) {
            if (diags) {
                allDiagnostics.push(...diags);
                return !hasErrors(diags);
            }
            return true;
        }
        let checkOtherDiagnostics = true;
        // Check parameter diagnostics
        checkOtherDiagnostics = checkOtherDiagnostics &&
            checkDiagnostics([...program.getTsOptionDiagnostics(), ...program.getNgOptionDiagnostics()]);
        // Check syntactic diagnostics
        checkOtherDiagnostics =
            checkOtherDiagnostics && checkDiagnostics(program.getTsSyntacticDiagnostics());
        // Check TypeScript semantic and Angular structure diagnostics
        checkOtherDiagnostics =
            checkOtherDiagnostics &&
                checkDiagnostics([...program.getTsSemanticDiagnostics(), ...program.getNgStructuralDiagnostics()]);
        // Check Angular semantic diagnostics
        checkOtherDiagnostics =
            checkOtherDiagnostics && checkDiagnostics(program.getNgSemanticDiagnostics());
        return allDiagnostics;
    }
    function hasErrors(diags) {
        return diags.some(d => d.category === ts.DiagnosticCategory.Error);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyZm9ybV9jb21waWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9wZXJmb3JtX2NvbXBpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSCxnREFBdUU7SUFDdkUseUJBQXlCO0lBQ3pCLDZCQUE2QjtJQUM3QixpQ0FBaUM7SUFFakMsa0VBQTBDO0lBQzFDLDBFQUFrRDtJQUNsRCxzRUFBNEQ7SUFFNUQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDO0lBSXZCLFNBQWdCLHVCQUF1QixDQUFDLFdBQXdCO1FBQzlELE9BQU8sV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEtBQUssRUFBRSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQy9FLENBQUM7SUFGRCwwREFFQztJQUVELE1BQU0saUJBQWlCLEdBQTZCO1FBQ2xELG1CQUFtQixFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUU7UUFDdkQsb0JBQW9CLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRO1FBQzFDLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU87S0FDakMsQ0FBQztJQUVGLFNBQVMsZUFBZSxDQUFDLFFBQWdCLEVBQUUsSUFBOEI7UUFDdkUsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3hGLENBQUM7SUFFRCxTQUFnQix3QkFBd0IsQ0FDcEMsUUFBa0IsRUFBRSxPQUFpQyxpQkFBaUI7UUFDeEUsT0FBTyxHQUFHLGVBQWUsQ0FBQyxRQUFRLENBQUMsUUFBUSxF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Qyw4QkFBOEI7UUFDOUIscUJBQXFCLEdBQUcscUJBQXFCO1lBQ3pDLGdCQUFnQixDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsc0JBQXNCLEVBQUUsRUFBRSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVqRyw4QkFBOEI7UUFDOUIscUJBQXFCO1lBQ2pCLHFCQUFxQixJQUFJLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsRUFBaUIsQ0FBQyxDQUFDO1FBRWxHLDhEQUE4RDtRQUM5RCxxQkFBcUI7WUFDakIscUJBQXFCO2dCQUNyQixnQkFBZ0IsQ0FDWixDQUFDLEdBQUcsT0FBTyxDQUFDLHdCQUF3QixFQUFFLEVBQUUsR0FBRyxPQUFPLENBQUMsMEJBQTBCLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFMUYscUNBQXFDO1FBQ3JDLHFCQUFxQjtZQUNqQixxQkFBcUIsSUFBSSxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQWlCLENBQUMsQ0FBQztRQUVqRyxPQUFPLGNBQWMsQ0FBQztJQUN4QixDQUFDO0lBRUQsU0FBUyxTQUFTLENBQUMsS0FBa0I7UUFDbkMsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsS0FBSyxFQUFFLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtQb3NpdGlvbiwgaXNTeW50YXhFcnJvciwgc3ludGF4RXJyb3J9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0ICogYXMgYXBpIGZyb20gJy4vdHJhbnNmb3JtZXJzL2FwaSc7XG5pbXBvcnQgKiBhcyBuZyBmcm9tICcuL3RyYW5zZm9ybWVycy9lbnRyeV9wb2ludHMnO1xuaW1wb3J0IHtjcmVhdGVNZXNzYWdlRGlhZ25vc3RpY30gZnJvbSAnLi90cmFuc2Zvcm1lcnMvdXRpbCc7XG5cbmNvbnN0IFRTX0VYVCA9IC9cXC50cyQvO1xuXG5leHBvcnQgdHlwZSBEaWFnbm9zdGljcyA9IFJlYWRvbmx5QXJyYXk8dHMuRGlhZ25vc3RpY3xhcGkuRGlhZ25vc3RpYz47XG5cbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJFcnJvcnNBbmRXYXJuaW5ncyhkaWFnbm9zdGljczogRGlhZ25vc3RpY3MpOiBEaWFnbm9zdGljcyB7XG4gIHJldHVybiBkaWFnbm9zdGljcy5maWx0ZXIoZCA9PiBkLmNhdGVnb3J5ICE9PSB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuTWVzc2FnZSk7XG59XG5cbmNvbnN0IGRlZmF1bHRGb3JtYXRIb3N0OiB0cy5Gb3JtYXREaWFnbm9zdGljc0hvc3QgPSB7XG4gIGdldEN1cnJlbnREaXJlY3Rvcnk6ICgpID0+IHRzLnN5cy5nZXRDdXJyZW50RGlyZWN0b3J5KCksXG4gIGdldENhbm9uaWNhbEZpbGVOYW1lOiBmaWxlTmFtZSA9PiBmaWxlTmFtZSxcbiAgZ2V0TmV3TGluZTogKCkgPT4gdHMuc3lzLm5ld0xpbmVcbn07XG5cbmZ1bmN0aW9uIGRpc3BsYXlGaWxlTmFtZShmaWxlTmFtZTogc3RyaW5nLCBob3N0OiB0cy5Gb3JtYXREaWFnbm9zdGljc0hvc3QpOiBzdHJpbmcge1xuICByZXR1cm4gcGF0aC5yZWxhdGl2ZShob3N0LmdldEN1cnJlbnREaXJlY3RvcnkoKSwgaG9zdC5nZXRDYW5vbmljYWxGaWxlTmFtZShmaWxlTmFtZSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0RGlhZ25vc3RpY1Bvc2l0aW9uKFxuICAgIHBvc2l0aW9uOiBQb3NpdGlvbiwgaG9zdDogdHMuRm9ybWF0RGlhZ25vc3RpY3NIb3N0ID0gZGVmYXVsdEZvcm1hdEhvc3QpOiBzdHJpbmcge1xuICByZXR1cm4gYCR7ZGlzcGxheUZpbGVOYW1lKHBvc2l0aW9uLmZpbGVOYW1lLCBob3N0KX0oJHtwb3NpdGlvbi5saW5lICsgMX0sJHtwb3NpdGlvbi5jb2x1bW4rMX0pYDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZsYXR0ZW5EaWFnbm9zdGljTWVzc2FnZUNoYWluKFxuICAgIGNoYWluOiBhcGkuRGlhZ25vc3RpY01lc3NhZ2VDaGFpbiwgaG9zdDogdHMuRm9ybWF0RGlhZ25vc3RpY3NIb3N0ID0gZGVmYXVsdEZvcm1hdEhvc3QpOiBzdHJpbmcge1xuICBsZXQgcmVzdWx0ID0gY2hhaW4ubWVzc2FnZVRleHQ7XG4gIGxldCBpbmRlbnQgPSAxO1xuICBsZXQgY3VycmVudCA9IGNoYWluLm5leHQ7XG4gIGNvbnN0IG5ld0xpbmUgPSBob3N0LmdldE5ld0xpbmUoKTtcbiAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICByZXN1bHQgKz0gbmV3TGluZTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGluZGVudDsgaSsrKSB7XG4gICAgICByZXN1bHQgKz0gJyAgJztcbiAgICB9XG4gICAgcmVzdWx0ICs9IGN1cnJlbnQubWVzc2FnZVRleHQ7XG4gICAgY29uc3QgcG9zaXRpb24gPSBjdXJyZW50LnBvc2l0aW9uO1xuICAgIGlmIChwb3NpdGlvbikge1xuICAgICAgcmVzdWx0ICs9IGAgYXQgJHtmb3JtYXREaWFnbm9zdGljUG9zaXRpb24ocG9zaXRpb24sIGhvc3QpfWA7XG4gICAgfVxuICAgIGN1cnJlbnQgPSBjdXJyZW50Lm5leHQ7XG4gICAgaW5kZW50Kys7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdERpYWdub3N0aWMoXG4gICAgZGlhZ25vc3RpYzogYXBpLkRpYWdub3N0aWMsIGhvc3Q6IHRzLkZvcm1hdERpYWdub3N0aWNzSG9zdCA9IGRlZmF1bHRGb3JtYXRIb3N0KSB7XG4gIGxldCByZXN1bHQgPSAnJztcbiAgY29uc3QgbmV3TGluZSA9IGhvc3QuZ2V0TmV3TGluZSgpO1xuICBjb25zdCBzcGFuID0gZGlhZ25vc3RpYy5zcGFuO1xuICBpZiAoc3Bhbikge1xuICAgIHJlc3VsdCArPSBgJHtmb3JtYXREaWFnbm9zdGljUG9zaXRpb24oe1xuICAgICAgZmlsZU5hbWU6IHNwYW4uc3RhcnQuZmlsZS51cmwsXG4gICAgICBsaW5lOiBzcGFuLnN0YXJ0LmxpbmUsXG4gICAgICBjb2x1bW46IHNwYW4uc3RhcnQuY29sXG4gICAgfSwgaG9zdCl9OiBgO1xuICB9IGVsc2UgaWYgKGRpYWdub3N0aWMucG9zaXRpb24pIHtcbiAgICByZXN1bHQgKz0gYCR7Zm9ybWF0RGlhZ25vc3RpY1Bvc2l0aW9uKGRpYWdub3N0aWMucG9zaXRpb24sIGhvc3QpfTogYDtcbiAgfVxuICBpZiAoZGlhZ25vc3RpYy5zcGFuICYmIGRpYWdub3N0aWMuc3Bhbi5kZXRhaWxzKSB7XG4gICAgcmVzdWx0ICs9IGA6ICR7ZGlhZ25vc3RpYy5zcGFuLmRldGFpbHN9LCAke2RpYWdub3N0aWMubWVzc2FnZVRleHR9JHtuZXdMaW5lfWA7XG4gIH0gZWxzZSBpZiAoZGlhZ25vc3RpYy5jaGFpbikge1xuICAgIHJlc3VsdCArPSBgJHtmbGF0dGVuRGlhZ25vc3RpY01lc3NhZ2VDaGFpbihkaWFnbm9zdGljLmNoYWluLCBob3N0KX0uJHtuZXdMaW5lfWA7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ICs9IGA6ICR7ZGlhZ25vc3RpYy5tZXNzYWdlVGV4dH0ke25ld0xpbmV9YDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0RGlhZ25vc3RpY3MoXG4gICAgZGlhZ3M6IERpYWdub3N0aWNzLCBob3N0OiB0cy5Gb3JtYXREaWFnbm9zdGljc0hvc3QgPSBkZWZhdWx0Rm9ybWF0SG9zdCk6IHN0cmluZyB7XG4gIGlmIChkaWFncyAmJiBkaWFncy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZGlhZ3NcbiAgICAgICAgLm1hcChkaWFnbm9zdGljID0+IHtcbiAgICAgICAgICBpZiAoYXBpLmlzVHNEaWFnbm9zdGljKGRpYWdub3N0aWMpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHMuZm9ybWF0RGlhZ25vc3RpY3MoW2RpYWdub3N0aWNdLCBob3N0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdERpYWdub3N0aWMoZGlhZ25vc3RpYywgaG9zdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuam9pbignJyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGFyc2VkQ29uZmlndXJhdGlvbiB7XG4gIHByb2plY3Q6IHN0cmluZztcbiAgb3B0aW9uczogYXBpLkNvbXBpbGVyT3B0aW9ucztcbiAgcm9vdE5hbWVzOiBzdHJpbmdbXTtcbiAgZW1pdEZsYWdzOiBhcGkuRW1pdEZsYWdzO1xuICBlcnJvcnM6IERpYWdub3N0aWNzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FsY1Byb2plY3RGaWxlQW5kQmFzZVBhdGgocHJvamVjdDogc3RyaW5nKTpcbiAgICB7cHJvamVjdEZpbGU6IHN0cmluZywgYmFzZVBhdGg6IHN0cmluZ30ge1xuICBjb25zdCBwcm9qZWN0SXNEaXIgPSBmcy5sc3RhdFN5bmMocHJvamVjdCkuaXNEaXJlY3RvcnkoKTtcbiAgY29uc3QgcHJvamVjdEZpbGUgPSBwcm9qZWN0SXNEaXIgPyBwYXRoLmpvaW4ocHJvamVjdCwgJ3RzY29uZmlnLmpzb24nKSA6IHByb2plY3Q7XG4gIGNvbnN0IHByb2plY3REaXIgPSBwcm9qZWN0SXNEaXIgPyBwcm9qZWN0IDogcGF0aC5kaXJuYW1lKHByb2plY3QpO1xuICBjb25zdCBiYXNlUGF0aCA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCBwcm9qZWN0RGlyKTtcbiAgcmV0dXJuIHtwcm9qZWN0RmlsZSwgYmFzZVBhdGh9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTmdDb21waWxlck9wdGlvbnMoXG4gICAgYmFzZVBhdGg6IHN0cmluZywgY29uZmlnOiBhbnksIHRzT3B0aW9uczogdHMuQ29tcGlsZXJPcHRpb25zKTogYXBpLkNvbXBpbGVyT3B0aW9ucyB7XG4gIHJldHVybiB7Li4udHNPcHRpb25zLCAuLi5jb25maWcuYW5ndWxhckNvbXBpbGVyT3B0aW9ucywgZ2VuRGlyOiBiYXNlUGF0aCwgYmFzZVBhdGh9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZENvbmZpZ3VyYXRpb24oXG4gICAgcHJvamVjdDogc3RyaW5nLCBleGlzdGluZ09wdGlvbnM/OiB0cy5Db21waWxlck9wdGlvbnMpOiBQYXJzZWRDb25maWd1cmF0aW9uIHtcbiAgdHJ5IHtcbiAgICBjb25zdCB7cHJvamVjdEZpbGUsIGJhc2VQYXRofSA9IGNhbGNQcm9qZWN0RmlsZUFuZEJhc2VQYXRoKHByb2plY3QpO1xuXG4gICAgY29uc3QgcmVhZEV4dGVuZGVkQ29uZmlnRmlsZSA9XG4gICAgICAgIChjb25maWdGaWxlOiBzdHJpbmcsIGV4aXN0aW5nQ29uZmlnPzogYW55KToge2NvbmZpZz86IGFueSwgZXJyb3I/OiB0cy5EaWFnbm9zdGljfSA9PiB7XG4gICAgICAgICAgY29uc3Qge2NvbmZpZywgZXJyb3J9ID0gdHMucmVhZENvbmZpZ0ZpbGUoY29uZmlnRmlsZSwgdHMuc3lzLnJlYWRGaWxlKTtcblxuICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIHtlcnJvcn07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gd2UgYXJlIG9ubHkgaW50ZXJlc3RlZCBpbnRvIG1lcmdpbmcgJ2FuZ3VsYXJDb21waWxlck9wdGlvbnMnIGFzXG4gICAgICAgICAgLy8gb3RoZXIgb3B0aW9ucyBsaWtlICdjb21waWxlck9wdGlvbnMnIGFyZSBtZXJnZWQgYnkgVFNcbiAgICAgICAgICBjb25zdCBiYXNlQ29uZmlnID0gZXhpc3RpbmdDb25maWcgfHwgY29uZmlnO1xuICAgICAgICAgIGlmIChleGlzdGluZ0NvbmZpZykge1xuICAgICAgICAgICAgYmFzZUNvbmZpZy5hbmd1bGFyQ29tcGlsZXJPcHRpb25zID0gey4uLmNvbmZpZy5hbmd1bGFyQ29tcGlsZXJPcHRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLmJhc2VDb25maWcuYW5ndWxhckNvbXBpbGVyT3B0aW9uc307XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGNvbmZpZy5leHRlbmRzKSB7XG4gICAgICAgICAgICBsZXQgZXh0ZW5kZWRDb25maWdQYXRoID0gcGF0aC5yZXNvbHZlKHBhdGguZGlybmFtZShjb25maWdGaWxlKSwgY29uZmlnLmV4dGVuZHMpO1xuICAgICAgICAgICAgZXh0ZW5kZWRDb25maWdQYXRoID0gcGF0aC5leHRuYW1lKGV4dGVuZGVkQ29uZmlnUGF0aCkgPyBleHRlbmRlZENvbmZpZ1BhdGggOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtleHRlbmRlZENvbmZpZ1BhdGh9Lmpzb25gO1xuXG4gICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhleHRlbmRlZENvbmZpZ1BhdGgpKSB7XG4gICAgICAgICAgICAgIC8vIENhbGwgcmVhZCBjb25maWcgcmVjdXJzaXZlbHkgYXMgVHlwZVNjcmlwdCBvbmx5IG1lcmdlcyBDb21waWxlck9wdGlvbnNcbiAgICAgICAgICAgICAgcmV0dXJuIHJlYWRFeHRlbmRlZENvbmZpZ0ZpbGUoZXh0ZW5kZWRDb25maWdQYXRoLCBiYXNlQ29uZmlnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge2NvbmZpZzogYmFzZUNvbmZpZ307XG4gICAgICAgIH07XG5cbiAgICBjb25zdCB7Y29uZmlnLCBlcnJvcn0gPSByZWFkRXh0ZW5kZWRDb25maWdGaWxlKHByb2plY3RGaWxlKTtcblxuICAgIGlmIChlcnJvcikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcHJvamVjdCxcbiAgICAgICAgZXJyb3JzOiBbZXJyb3JdLFxuICAgICAgICByb290TmFtZXM6IFtdLFxuICAgICAgICBvcHRpb25zOiB7fSxcbiAgICAgICAgZW1pdEZsYWdzOiBhcGkuRW1pdEZsYWdzLkRlZmF1bHRcbiAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IHBhcnNlQ29uZmlnSG9zdCA9IHtcbiAgICAgIHVzZUNhc2VTZW5zaXRpdmVGaWxlTmFtZXM6IHRydWUsXG4gICAgICBmaWxlRXhpc3RzOiBmcy5leGlzdHNTeW5jLFxuICAgICAgcmVhZERpcmVjdG9yeTogdHMuc3lzLnJlYWREaXJlY3RvcnksXG4gICAgICByZWFkRmlsZTogdHMuc3lzLnJlYWRGaWxlXG4gICAgfTtcbiAgICBjb25zdCBwYXJzZWQgPVxuICAgICAgICB0cy5wYXJzZUpzb25Db25maWdGaWxlQ29udGVudChjb25maWcsIHBhcnNlQ29uZmlnSG9zdCwgYmFzZVBhdGgsIGV4aXN0aW5nT3B0aW9ucyk7XG4gICAgY29uc3Qgcm9vdE5hbWVzID0gcGFyc2VkLmZpbGVOYW1lcy5tYXAoZiA9PiBwYXRoLm5vcm1hbGl6ZShmKSk7XG5cbiAgICBjb25zdCBvcHRpb25zID0gY3JlYXRlTmdDb21waWxlck9wdGlvbnMoYmFzZVBhdGgsIGNvbmZpZywgcGFyc2VkLm9wdGlvbnMpO1xuICAgIGxldCBlbWl0RmxhZ3MgPSBhcGkuRW1pdEZsYWdzLkRlZmF1bHQ7XG4gICAgaWYgKCEob3B0aW9ucy5za2lwTWV0YWRhdGFFbWl0IHx8IG9wdGlvbnMuZmxhdE1vZHVsZU91dEZpbGUpKSB7XG4gICAgICBlbWl0RmxhZ3MgfD0gYXBpLkVtaXRGbGFncy5NZXRhZGF0YTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuc2tpcFRlbXBsYXRlQ29kZWdlbikge1xuICAgICAgZW1pdEZsYWdzID0gZW1pdEZsYWdzICYgfmFwaS5FbWl0RmxhZ3MuQ29kZWdlbjtcbiAgICB9XG4gICAgcmV0dXJuIHtwcm9qZWN0OiBwcm9qZWN0RmlsZSwgcm9vdE5hbWVzLCBvcHRpb25zLCBlcnJvcnM6IHBhcnNlZC5lcnJvcnMsIGVtaXRGbGFnc307XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zdCBlcnJvcnM6IERpYWdub3N0aWNzID0gW3tcbiAgICAgIGNhdGVnb3J5OiB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuRXJyb3IsXG4gICAgICBtZXNzYWdlVGV4dDogZS5zdGFjayxcbiAgICAgIHNvdXJjZTogYXBpLlNPVVJDRSxcbiAgICAgIGNvZGU6IGFwaS5VTktOT1dOX0VSUk9SX0NPREVcbiAgICB9XTtcbiAgICByZXR1cm4ge3Byb2plY3Q6ICcnLCBlcnJvcnMsIHJvb3ROYW1lczogW10sIG9wdGlvbnM6IHt9LCBlbWl0RmxhZ3M6IGFwaS5FbWl0RmxhZ3MuRGVmYXVsdH07XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBQZXJmb3JtQ29tcGlsYXRpb25SZXN1bHQge1xuICBkaWFnbm9zdGljczogRGlhZ25vc3RpY3M7XG4gIHByb2dyYW0/OiBhcGkuUHJvZ3JhbTtcbiAgZW1pdFJlc3VsdD86IHRzLkVtaXRSZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleGl0Q29kZUZyb21SZXN1bHQoZGlhZ3M6IERpYWdub3N0aWNzIHwgdW5kZWZpbmVkKTogbnVtYmVyIHtcbiAgaWYgKCFkaWFncyB8fCBmaWx0ZXJFcnJvcnNBbmRXYXJuaW5ncyhkaWFncykubGVuZ3RoID09PSAwKSB7XG4gICAgLy8gSWYgd2UgaGF2ZSBhIHJlc3VsdCBhbmQgZGlkbid0IGdldCBhbnkgZXJyb3JzLCB3ZSBzdWNjZWVkZWQuXG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvLyBSZXR1cm4gMiBpZiBhbnkgb2YgdGhlIGVycm9ycyB3ZXJlIHVua25vd24uXG4gIHJldHVybiBkaWFncy5zb21lKGQgPT4gZC5zb3VyY2UgPT09ICdhbmd1bGFyJyAmJiBkLmNvZGUgPT09IGFwaS5VTktOT1dOX0VSUk9SX0NPREUpID8gMiA6IDE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwZXJmb3JtQ29tcGlsYXRpb24oe3Jvb3ROYW1lcywgb3B0aW9ucywgaG9zdCwgb2xkUHJvZ3JhbSwgZW1pdENhbGxiYWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVyZ2VFbWl0UmVzdWx0c0NhbGxiYWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2F0aGVyRGlhZ25vc3RpY3MgPSBkZWZhdWx0R2F0aGVyRGlhZ25vc3RpY3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXN0b21UcmFuc2Zvcm1lcnMsIGVtaXRGbGFncyA9IGFwaS5FbWl0RmxhZ3MuRGVmYXVsdH06IHtcbiAgcm9vdE5hbWVzOiBzdHJpbmdbXSxcbiAgb3B0aW9uczogYXBpLkNvbXBpbGVyT3B0aW9ucyxcbiAgaG9zdD86IGFwaS5Db21waWxlckhvc3QsXG4gIG9sZFByb2dyYW0/OiBhcGkuUHJvZ3JhbSxcbiAgZW1pdENhbGxiYWNrPzogYXBpLlRzRW1pdENhbGxiYWNrLFxuICBtZXJnZUVtaXRSZXN1bHRzQ2FsbGJhY2s/OiBhcGkuVHNNZXJnZUVtaXRSZXN1bHRzQ2FsbGJhY2ssXG4gIGdhdGhlckRpYWdub3N0aWNzPzogKHByb2dyYW06IGFwaS5Qcm9ncmFtKSA9PiBEaWFnbm9zdGljcyxcbiAgY3VzdG9tVHJhbnNmb3JtZXJzPzogYXBpLkN1c3RvbVRyYW5zZm9ybWVycyxcbiAgZW1pdEZsYWdzPzogYXBpLkVtaXRGbGFnc1xufSk6IFBlcmZvcm1Db21waWxhdGlvblJlc3VsdCB7XG4gIGxldCBwcm9ncmFtOiBhcGkuUHJvZ3JhbXx1bmRlZmluZWQ7XG4gIGxldCBlbWl0UmVzdWx0OiB0cy5FbWl0UmVzdWx0fHVuZGVmaW5lZDtcbiAgbGV0IGFsbERpYWdub3N0aWNzOiBBcnJheTx0cy5EaWFnbm9zdGljfGFwaS5EaWFnbm9zdGljPiA9IFtdO1xuICB0cnkge1xuICAgIGlmICghaG9zdCkge1xuICAgICAgaG9zdCA9IG5nLmNyZWF0ZUNvbXBpbGVySG9zdCh7b3B0aW9uc30pO1xuICAgIH1cblxuICAgIHByb2dyYW0gPSBuZy5jcmVhdGVQcm9ncmFtKHtyb290TmFtZXMsIGhvc3QsIG9wdGlvbnMsIG9sZFByb2dyYW19KTtcblxuICAgIGNvbnN0IGJlZm9yZURpYWdzID0gRGF0ZS5ub3coKTtcbiAgICBhbGxEaWFnbm9zdGljcy5wdXNoKC4uLmdhdGhlckRpYWdub3N0aWNzKHByb2dyYW0gISkpO1xuICAgIGlmIChvcHRpb25zLmRpYWdub3N0aWNzKSB7XG4gICAgICBjb25zdCBhZnRlckRpYWdzID0gRGF0ZS5ub3coKTtcbiAgICAgIGFsbERpYWdub3N0aWNzLnB1c2goXG4gICAgICAgICAgY3JlYXRlTWVzc2FnZURpYWdub3N0aWMoYFRpbWUgZm9yIGRpYWdub3N0aWNzOiAke2FmdGVyRGlhZ3MgLSBiZWZvcmVEaWFnc31tcy5gKSk7XG4gICAgfVxuXG4gICAgaWYgKCFoYXNFcnJvcnMoYWxsRGlhZ25vc3RpY3MpKSB7XG4gICAgICBlbWl0UmVzdWx0ID1cbiAgICAgICAgICBwcm9ncmFtICEuZW1pdCh7ZW1pdENhbGxiYWNrLCBtZXJnZUVtaXRSZXN1bHRzQ2FsbGJhY2ssIGN1c3RvbVRyYW5zZm9ybWVycywgZW1pdEZsYWdzfSk7XG4gICAgICBhbGxEaWFnbm9zdGljcy5wdXNoKC4uLmVtaXRSZXN1bHQuZGlhZ25vc3RpY3MpO1xuICAgICAgcmV0dXJuIHtkaWFnbm9zdGljczogYWxsRGlhZ25vc3RpY3MsIHByb2dyYW0sIGVtaXRSZXN1bHR9O1xuICAgIH1cbiAgICByZXR1cm4ge2RpYWdub3N0aWNzOiBhbGxEaWFnbm9zdGljcywgcHJvZ3JhbX07XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBsZXQgZXJyTXNnOiBzdHJpbmc7XG4gICAgbGV0IGNvZGU6IG51bWJlcjtcbiAgICBpZiAoaXNTeW50YXhFcnJvcihlKSkge1xuICAgICAgLy8gZG9uJ3QgcmVwb3J0IHRoZSBzdGFjayBmb3Igc3ludGF4IGVycm9ycyBhcyB0aGV5IGFyZSB3ZWxsIGtub3duIGVycm9ycy5cbiAgICAgIGVyck1zZyA9IGUubWVzc2FnZTtcbiAgICAgIGNvZGUgPSBhcGkuREVGQVVMVF9FUlJPUl9DT0RFO1xuICAgIH0gZWxzZSB7XG4gICAgICBlcnJNc2cgPSBlLnN0YWNrO1xuICAgICAgLy8gSXQgaXMgbm90IGEgc3ludGF4IGVycm9yIHdlIG1pZ2h0IGhhdmUgYSBwcm9ncmFtIHdpdGggdW5rbm93biBzdGF0ZSwgZGlzY2FyZCBpdC5cbiAgICAgIHByb2dyYW0gPSB1bmRlZmluZWQ7XG4gICAgICBjb2RlID0gYXBpLlVOS05PV05fRVJST1JfQ09ERTtcbiAgICB9XG4gICAgYWxsRGlhZ25vc3RpY3MucHVzaChcbiAgICAgICAge2NhdGVnb3J5OiB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuRXJyb3IsIG1lc3NhZ2VUZXh0OiBlcnJNc2csIGNvZGUsIHNvdXJjZTogYXBpLlNPVVJDRX0pO1xuICAgIHJldHVybiB7ZGlhZ25vc3RpY3M6IGFsbERpYWdub3N0aWNzLCBwcm9ncmFtfTtcbiAgfVxufVxuZnVuY3Rpb24gZGVmYXVsdEdhdGhlckRpYWdub3N0aWNzKHByb2dyYW06IGFwaS5Qcm9ncmFtKTogRGlhZ25vc3RpY3Mge1xuICBjb25zdCBhbGxEaWFnbm9zdGljczogQXJyYXk8dHMuRGlhZ25vc3RpY3xhcGkuRGlhZ25vc3RpYz4gPSBbXTtcblxuICBmdW5jdGlvbiBjaGVja0RpYWdub3N0aWNzKGRpYWdzOiBEaWFnbm9zdGljcyB8IHVuZGVmaW5lZCkge1xuICAgIGlmIChkaWFncykge1xuICAgICAgYWxsRGlhZ25vc3RpY3MucHVzaCguLi5kaWFncyk7XG4gICAgICByZXR1cm4gIWhhc0Vycm9ycyhkaWFncyk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgbGV0IGNoZWNrT3RoZXJEaWFnbm9zdGljcyA9IHRydWU7XG4gIC8vIENoZWNrIHBhcmFtZXRlciBkaWFnbm9zdGljc1xuICBjaGVja090aGVyRGlhZ25vc3RpY3MgPSBjaGVja090aGVyRGlhZ25vc3RpY3MgJiZcbiAgICAgIGNoZWNrRGlhZ25vc3RpY3MoWy4uLnByb2dyYW0uZ2V0VHNPcHRpb25EaWFnbm9zdGljcygpLCAuLi5wcm9ncmFtLmdldE5nT3B0aW9uRGlhZ25vc3RpY3MoKV0pO1xuXG4gIC8vIENoZWNrIHN5bnRhY3RpYyBkaWFnbm9zdGljc1xuICBjaGVja090aGVyRGlhZ25vc3RpY3MgPVxuICAgICAgY2hlY2tPdGhlckRpYWdub3N0aWNzICYmIGNoZWNrRGlhZ25vc3RpY3MocHJvZ3JhbS5nZXRUc1N5bnRhY3RpY0RpYWdub3N0aWNzKCkgYXMgRGlhZ25vc3RpY3MpO1xuXG4gIC8vIENoZWNrIFR5cGVTY3JpcHQgc2VtYW50aWMgYW5kIEFuZ3VsYXIgc3RydWN0dXJlIGRpYWdub3N0aWNzXG4gIGNoZWNrT3RoZXJEaWFnbm9zdGljcyA9XG4gICAgICBjaGVja090aGVyRGlhZ25vc3RpY3MgJiZcbiAgICAgIGNoZWNrRGlhZ25vc3RpY3MoXG4gICAgICAgICAgWy4uLnByb2dyYW0uZ2V0VHNTZW1hbnRpY0RpYWdub3N0aWNzKCksIC4uLnByb2dyYW0uZ2V0TmdTdHJ1Y3R1cmFsRGlhZ25vc3RpY3MoKV0pO1xuXG4gIC8vIENoZWNrIEFuZ3VsYXIgc2VtYW50aWMgZGlhZ25vc3RpY3NcbiAgY2hlY2tPdGhlckRpYWdub3N0aWNzID1cbiAgICAgIGNoZWNrT3RoZXJEaWFnbm9zdGljcyAmJiBjaGVja0RpYWdub3N0aWNzKHByb2dyYW0uZ2V0TmdTZW1hbnRpY0RpYWdub3N0aWNzKCkgYXMgRGlhZ25vc3RpY3MpO1xuXG4gIHJldHVybiBhbGxEaWFnbm9zdGljcztcbn1cblxuZnVuY3Rpb24gaGFzRXJyb3JzKGRpYWdzOiBEaWFnbm9zdGljcykge1xuICByZXR1cm4gZGlhZ3Muc29tZShkID0+IGQuY2F0ZWdvcnkgPT09IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcik7XG59XG4iXX0=