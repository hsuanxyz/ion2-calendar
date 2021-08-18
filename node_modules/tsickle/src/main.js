#!/usr/bin/env node
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/main", ["require", "exports", "fs", "minimist", "mkdirp", "path", "tsickle/src/typescript", "tsickle/src/cli_support", "tsickle/src/tsickle", "tsickle/src/tsickle", "tsickle/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fs = require("fs");
    var minimist = require("minimist");
    var mkdirp = require("mkdirp");
    var path = require("path");
    var ts = require("tsickle/src/typescript");
    var cliSupport = require("tsickle/src/cli_support");
    var tsickle = require("tsickle/src/tsickle");
    var tsickle_1 = require("tsickle/src/tsickle");
    var util_1 = require("tsickle/src/util");
    function usage() {
        console.error("usage: tsickle [tsickle options] -- [tsc options]\n\nexample:\n  tsickle --externs=foo/externs.js -- -p src --noImplicitAny\n\ntsickle flags are:\n  --externs=PATH        save generated Closure externs.js to PATH\n  --typed               [experimental] attempt to provide Closure types instead of {?}\n  --disableAutoQuoting  do not automatically apply quotes to property accesses\n");
    }
    /**
     * Parses the command-line arguments, extracting the tsickle settings and
     * the arguments to pass on to tsc.
     */
    function loadSettingsFromArgs(args) {
        var settings = {};
        var parsedArgs = minimist(args);
        try {
            for (var _a = __values(Object.keys(parsedArgs)), _b = _a.next(); !_b.done; _b = _a.next()) {
                var flag = _b.value;
                switch (flag) {
                    case 'h':
                    case 'help':
                        usage();
                        process.exit(0);
                        break;
                    case 'externs':
                        settings.externsPath = parsedArgs[flag];
                        break;
                    case 'typed':
                        settings.isTyped = true;
                        break;
                    case 'verbose':
                        settings.verbose = true;
                        break;
                    case 'disableAutoQuoting':
                        settings.disableAutoQuoting = true;
                        break;
                    case '_':
                        // This is part of the minimist API, and holds args after the '--'.
                        break;
                    default:
                        console.error("unknown flag '--" + flag + "'");
                        usage();
                        process.exit(1);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // Arguments after the '--' arg are arguments to tsc.
        var tscArgs = parsedArgs['_'];
        return { settings: settings, tscArgs: tscArgs };
        var e_1, _c;
    }
    /**
     * Loads the tsconfig.json from a directory.
     *
     * TODO(martinprobst): use ts.findConfigFile to match tsc behaviour.
     *
     * @param args tsc command-line arguments.
     */
    function loadTscConfig(args) {
        // Gather tsc options/input files from command line.
        var _a = ts.parseCommandLine(args), options = _a.options, fileNames = _a.fileNames, errors = _a.errors;
        if (errors.length > 0) {
            return { options: {}, fileNames: [], errors: errors };
        }
        // Store file arguments
        var tsFileArguments = fileNames;
        // Read further settings from tsconfig.json.
        var projectDir = options.project || '.';
        var configFileName = path.join(projectDir, 'tsconfig.json');
        var _b = ts.readConfigFile(configFileName, function (path) { return fs.readFileSync(path, 'utf-8'); }), json = _b.config, error = _b.error;
        if (error) {
            return { options: {}, fileNames: [], errors: [error] };
        }
        (_c = ts.parseJsonConfigFileContent(json, ts.sys, projectDir, options, configFileName), options = _c.options, fileNames = _c.fileNames, errors = _c.errors);
        if (errors.length > 0) {
            return { options: {}, fileNames: [], errors: errors };
        }
        // if file arguments were given to the typescript transpiler then transpile only those files
        fileNames = tsFileArguments.length > 0 ? tsFileArguments : fileNames;
        return { options: options, fileNames: fileNames, errors: [] };
        var _c;
    }
    /**
     * Compiles TypeScript code into Closure-compiler-ready JS.
     */
    function toClosureJS(options, fileNames, settings, writeFile) {
        // Use absolute paths to determine what files to process since files may be imported using
        // relative or absolute paths
        var absoluteFileNames = fileNames.map(function (i) { return path.resolve(i); });
        var compilerHost = ts.createCompilerHost(options);
        var program = ts.createProgram(fileNames, options, compilerHost);
        var filesToProcess = new Set(absoluteFileNames);
        var rootModulePath = options.rootDir || util_1.getCommonParentDirectory(absoluteFileNames);
        var transformerHost = {
            shouldSkipTsickleProcessing: function (fileName) {
                return !filesToProcess.has(path.resolve(fileName));
            },
            shouldIgnoreWarningsForPath: function (fileName) { return false; },
            pathToModuleName: cliSupport.pathToModuleName.bind(null, rootModulePath),
            fileNameToModuleId: function (fileName) { return fileName; },
            es5Mode: true,
            googmodule: true,
            prelude: '',
            transformDecorators: true,
            transformTypesToClosure: true,
            typeBlackListPaths: new Set(),
            disableAutoQuoting: settings.disableAutoQuoting,
            untyped: false,
            logWarning: function (warning) { return console.error(tsickle.formatDiagnostics([warning])); },
            options: options,
            host: compilerHost,
        };
        var diagnostics = ts.getPreEmitDiagnostics(program);
        if (diagnostics.length > 0) {
            return {
                diagnostics: diagnostics,
                modulesManifest: new tsickle_1.ModulesManifest(),
                externs: {},
                emitSkipped: true,
                emittedFiles: [],
            };
        }
        return tsickle.emitWithTsickle(program, transformerHost, compilerHost, options, undefined, writeFile);
    }
    exports.toClosureJS = toClosureJS;
    function main(args) {
        var _a = loadSettingsFromArgs(args), settings = _a.settings, tscArgs = _a.tscArgs;
        var config = loadTscConfig(tscArgs);
        if (config.errors.length) {
            console.error(tsickle.formatDiagnostics(config.errors));
            return 1;
        }
        if (config.options.module !== ts.ModuleKind.CommonJS) {
            // This is not an upstream TypeScript diagnostic, therefore it does not go
            // through the diagnostics array mechanism.
            console.error('tsickle converts TypeScript modules to Closure modules via CommonJS internally. ' +
                'Set tsconfig.js "module": "commonjs"');
            return 1;
        }
        // Run tsickle+TSC to convert inputs to Closure JS files.
        var result = toClosureJS(config.options, config.fileNames, settings, function (filePath, contents) {
            mkdirp.sync(path.dirname(filePath));
            fs.writeFileSync(filePath, contents, { encoding: 'utf-8' });
        });
        if (result.diagnostics.length) {
            console.error(tsickle.formatDiagnostics(result.diagnostics));
            return 1;
        }
        if (settings.externsPath) {
            mkdirp.sync(path.dirname(settings.externsPath));
            fs.writeFileSync(settings.externsPath, tsickle.getGeneratedExterns(result.externs));
        }
        return 0;
    }
    // CLI entry point
    if (require.main === module) {
        process.exit(main(process.argv.splice(2)));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFVQSx1QkFBeUI7SUFDekIsbUNBQXFDO0lBQ3JDLCtCQUFpQztJQUNqQywyQkFBNkI7SUFDN0IsMkNBQW1DO0lBRW5DLG9EQUE0QztJQUM1Qyw2Q0FBcUM7SUFDckMsK0NBQTBDO0lBQzFDLHlDQUFnRDtJQWlCaEQ7UUFDRSxPQUFPLENBQUMsS0FBSyxDQUFDLGdZQVNmLENBQUMsQ0FBQztJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSCw4QkFBOEIsSUFBYztRQUMxQyxJQUFNLFFBQVEsR0FBYSxFQUFFLENBQUM7UUFDOUIsSUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDOztZQUNsQyxHQUFHLENBQUMsQ0FBZSxJQUFBLEtBQUEsU0FBQSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBLGdCQUFBO2dCQUFyQyxJQUFNLElBQUksV0FBQTtnQkFDYixNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNiLEtBQUssR0FBRyxDQUFDO29CQUNULEtBQUssTUFBTTt3QkFDVCxLQUFLLEVBQUUsQ0FBQzt3QkFDUixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNoQixLQUFLLENBQUM7b0JBQ1IsS0FBSyxTQUFTO3dCQUNaLFFBQVEsQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUN4QyxLQUFLLENBQUM7b0JBQ1IsS0FBSyxPQUFPO3dCQUNWLFFBQVEsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO3dCQUN4QixLQUFLLENBQUM7b0JBQ1IsS0FBSyxTQUFTO3dCQUNaLFFBQVEsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO3dCQUN4QixLQUFLLENBQUM7b0JBQ1IsS0FBSyxv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QyxDQUFDO1lBQ3BDLEVBQUUsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxFQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFDO1FBQzVELENBQUMsQ0FBQyxDQUFDO1FBQ1AsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzlCLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ2hELEVBQUUsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDdEYsQ0FBQztRQUNELE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQsa0JBQWtCO0lBQ2xCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQztRQUM1QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0MsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcblxuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBtaW5pbWlzdCBmcm9tICdtaW5pbWlzdCc7XG5pbXBvcnQgKiBhcyBta2RpcnAgZnJvbSAnbWtkaXJwJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICcuL3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQgKiBhcyBjbGlTdXBwb3J0IGZyb20gJy4vY2xpX3N1cHBvcnQnO1xuaW1wb3J0ICogYXMgdHNpY2tsZSBmcm9tICcuL3RzaWNrbGUnO1xuaW1wb3J0IHtNb2R1bGVzTWFuaWZlc3R9IGZyb20gJy4vdHNpY2tsZSc7XG5pbXBvcnQge2dldENvbW1vblBhcmVudERpcmVjdG9yeX0gZnJvbSAnLi91dGlsJztcblxuLyoqIFRzaWNrbGUgc2V0dGluZ3MgcGFzc2VkIG9uIHRoZSBjb21tYW5kIGxpbmUuICovXG5leHBvcnQgaW50ZXJmYWNlIFNldHRpbmdzIHtcbiAgLyoqIElmIHByb3ZpZGVkLCBkbyBub3QgbW9kaWZ5IHF1b3Rpbmcgb2YgcHJvcGVydHkgYWNjZXNzZXMuICovXG4gIGRpc2FibGVBdXRvUXVvdGluZz86IGJvb2xlYW47XG5cbiAgLyoqIElmIHByb3ZpZGVkLCBwYXRoIHRvIHNhdmUgZXh0ZXJucyB0by4gKi9cbiAgZXh0ZXJuc1BhdGg/OiBzdHJpbmc7XG5cbiAgLyoqIElmIHByb3ZpZGVkLCBhdHRlbXB0IHRvIHByb3ZpZGUgdHlwZXMgcmF0aGVyIHRoYW4gez99LiAqL1xuICBpc1R5cGVkPzogYm9vbGVhbjtcblxuICAvKiogSWYgdHJ1ZSwgbG9nIGludGVybmFsIGRlYnVnIHdhcm5pbmdzIHRvIHRoZSBjb25zb2xlLiAqL1xuICB2ZXJib3NlPzogYm9vbGVhbjtcbn1cblxuZnVuY3Rpb24gdXNhZ2UoKSB7XG4gIGNvbnNvbGUuZXJyb3IoYHVzYWdlOiB0c2lja2xlIFt0c2lja2xlIG9wdGlvbnNdIC0tIFt0c2Mgb3B0aW9uc11cblxuZXhhbXBsZTpcbiAgdHNpY2tsZSAtLWV4dGVybnM9Zm9vL2V4dGVybnMuanMgLS0gLXAgc3JjIC0tbm9JbXBsaWNpdEFueVxuXG50c2lja2xlIGZsYWdzIGFyZTpcbiAgLS1leHRlcm5zPVBBVEggICAgICAgIHNhdmUgZ2VuZXJhdGVkIENsb3N1cmUgZXh0ZXJucy5qcyB0byBQQVRIXG4gIC0tdHlwZWQgICAgICAgICAgICAgICBbZXhwZXJpbWVudGFsXSBhdHRlbXB0IHRvIHByb3ZpZGUgQ2xvc3VyZSB0eXBlcyBpbnN0ZWFkIG9mIHs/fVxuICAtLWRpc2FibGVBdXRvUXVvdGluZyAgZG8gbm90IGF1dG9tYXRpY2FsbHkgYXBwbHkgcXVvdGVzIHRvIHByb3BlcnR5IGFjY2Vzc2VzXG5gKTtcbn1cblxuLyoqXG4gKiBQYXJzZXMgdGhlIGNvbW1hbmQtbGluZSBhcmd1bWVudHMsIGV4dHJhY3RpbmcgdGhlIHRzaWNrbGUgc2V0dGluZ3MgYW5kXG4gKiB0aGUgYXJndW1lbnRzIHRvIHBhc3Mgb24gdG8gdHNjLlxuICovXG5mdW5jdGlvbiBsb2FkU2V0dGluZ3NGcm9tQXJncyhhcmdzOiBzdHJpbmdbXSk6IHtzZXR0aW5nczogU2V0dGluZ3MsIHRzY0FyZ3M6IHN0cmluZ1tdfSB7XG4gIGNvbnN0IHNldHRpbmdzOiBTZXR0aW5ncyA9IHt9O1xuICBjb25zdCBwYXJzZWRBcmdzID0gbWluaW1pc3QoYXJncyk7XG4gIGZvciAoY29uc3QgZmxhZyBvZiBPYmplY3Qua2V5cyhwYXJzZWRBcmdzKSkge1xuICAgIHN3aXRjaCAoZmxhZykge1xuICAgICAgY2FzZSAnaCc6XG4gICAgICBjYXNlICdoZWxwJzpcbiAgICAgICAgdXNhZ2UoKTtcbiAgICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2V4dGVybnMnOlxuICAgICAgICBzZXR0aW5ncy5leHRlcm5zUGF0aCA9IHBhcnNlZEFyZ3NbZmxhZ107XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndHlwZWQnOlxuICAgICAgICBzZXR0aW5ncy5pc1R5cGVkID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd2ZXJib3NlJzpcbiAgICAgICAgc2V0dGluZ3MudmVyYm9zZSA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZGlzYWJsZUF1dG9RdW90aW5nJzpcbiAgICAgICAgc2V0dGluZ3MuZGlzYWJsZUF1dG9RdW90aW5nID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdfJzpcbiAgICAgICAgLy8gVGhpcyBpcyBwYXJ0IG9mIHRoZSBtaW5pbWlzdCBBUEksIGFuZCBob2xkcyBhcmdzIGFmdGVyIHRoZSAnLS0nLlxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYHVua25vd24gZmxhZyAnLS0ke2ZsYWd9J2ApO1xuICAgICAgICB1c2FnZSgpO1xuICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuICB9XG4gIC8vIEFyZ3VtZW50cyBhZnRlciB0aGUgJy0tJyBhcmcgYXJlIGFyZ3VtZW50cyB0byB0c2MuXG4gIGNvbnN0IHRzY0FyZ3MgPSBwYXJzZWRBcmdzWydfJ107XG4gIHJldHVybiB7c2V0dGluZ3MsIHRzY0FyZ3N9O1xufVxuXG4vKipcbiAqIExvYWRzIHRoZSB0c2NvbmZpZy5qc29uIGZyb20gYSBkaXJlY3RvcnkuXG4gKlxuICogVE9ETyhtYXJ0aW5wcm9ic3QpOiB1c2UgdHMuZmluZENvbmZpZ0ZpbGUgdG8gbWF0Y2ggdHNjIGJlaGF2aW91ci5cbiAqXG4gKiBAcGFyYW0gYXJncyB0c2MgY29tbWFuZC1saW5lIGFyZ3VtZW50cy5cbiAqL1xuZnVuY3Rpb24gbG9hZFRzY0NvbmZpZyhhcmdzOiBzdHJpbmdbXSk6XG4gICAge29wdGlvbnM6IHRzLkNvbXBpbGVyT3B0aW9ucywgZmlsZU5hbWVzOiBzdHJpbmdbXSwgZXJyb3JzOiB0cy5EaWFnbm9zdGljW119IHtcbiAgLy8gR2F0aGVyIHRzYyBvcHRpb25zL2lucHV0IGZpbGVzIGZyb20gY29tbWFuZCBsaW5lLlxuICBsZXQge29wdGlvbnMsIGZpbGVOYW1lcywgZXJyb3JzfSA9IHRzLnBhcnNlQ29tbWFuZExpbmUoYXJncyk7XG4gIGlmIChlcnJvcnMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiB7b3B0aW9uczoge30sIGZpbGVOYW1lczogW10sIGVycm9yc307XG4gIH1cblxuICAvLyBTdG9yZSBmaWxlIGFyZ3VtZW50c1xuICBjb25zdCB0c0ZpbGVBcmd1bWVudHMgPSBmaWxlTmFtZXM7XG5cbiAgLy8gUmVhZCBmdXJ0aGVyIHNldHRpbmdzIGZyb20gdHNjb25maWcuanNvbi5cbiAgY29uc3QgcHJvamVjdERpciA9IG9wdGlvbnMucHJvamVjdCB8fCAnLic7XG4gIGNvbnN0IGNvbmZpZ0ZpbGVOYW1lID0gcGF0aC5qb2luKHByb2plY3REaXIsICd0c2NvbmZpZy5qc29uJyk7XG4gIGNvbnN0IHtjb25maWc6IGpzb24sIGVycm9yfSA9XG4gICAgICB0cy5yZWFkQ29uZmlnRmlsZShjb25maWdGaWxlTmFtZSwgcGF0aCA9PiBmcy5yZWFkRmlsZVN5bmMocGF0aCwgJ3V0Zi04JykpO1xuICBpZiAoZXJyb3IpIHtcbiAgICByZXR1cm4ge29wdGlvbnM6IHt9LCBmaWxlTmFtZXM6IFtdLCBlcnJvcnM6IFtlcnJvcl19O1xuICB9XG4gICh7b3B0aW9ucywgZmlsZU5hbWVzLCBlcnJvcnN9ID1cbiAgICAgICB0cy5wYXJzZUpzb25Db25maWdGaWxlQ29udGVudChqc29uLCB0cy5zeXMsIHByb2plY3REaXIsIG9wdGlvbnMsIGNvbmZpZ0ZpbGVOYW1lKSk7XG4gIGlmIChlcnJvcnMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiB7b3B0aW9uczoge30sIGZpbGVOYW1lczogW10sIGVycm9yc307XG4gIH1cblxuICAvLyBpZiBmaWxlIGFyZ3VtZW50cyB3ZXJlIGdpdmVuIHRvIHRoZSB0eXBlc2NyaXB0IHRyYW5zcGlsZXIgdGhlbiB0cmFuc3BpbGUgb25seSB0aG9zZSBmaWxlc1xuICBmaWxlTmFtZXMgPSB0c0ZpbGVBcmd1bWVudHMubGVuZ3RoID4gMCA/IHRzRmlsZUFyZ3VtZW50cyA6IGZpbGVOYW1lcztcblxuICByZXR1cm4ge29wdGlvbnMsIGZpbGVOYW1lcywgZXJyb3JzOiBbXX07XG59XG5cbi8qKlxuICogQ29tcGlsZXMgVHlwZVNjcmlwdCBjb2RlIGludG8gQ2xvc3VyZS1jb21waWxlci1yZWFkeSBKUy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvQ2xvc3VyZUpTKFxuICAgIG9wdGlvbnM6IHRzLkNvbXBpbGVyT3B0aW9ucywgZmlsZU5hbWVzOiBzdHJpbmdbXSwgc2V0dGluZ3M6IFNldHRpbmdzLFxuICAgIHdyaXRlRmlsZT86IHRzLldyaXRlRmlsZUNhbGxiYWNrKTogdHNpY2tsZS5FbWl0UmVzdWx0IHtcbiAgLy8gVXNlIGFic29sdXRlIHBhdGhzIHRvIGRldGVybWluZSB3aGF0IGZpbGVzIHRvIHByb2Nlc3Mgc2luY2UgZmlsZXMgbWF5IGJlIGltcG9ydGVkIHVzaW5nXG4gIC8vIHJlbGF0aXZlIG9yIGFic29sdXRlIHBhdGhzXG4gIGNvbnN0IGFic29sdXRlRmlsZU5hbWVzID0gZmlsZU5hbWVzLm1hcChpID0+IHBhdGgucmVzb2x2ZShpKSk7XG5cbiAgY29uc3QgY29tcGlsZXJIb3N0ID0gdHMuY3JlYXRlQ29tcGlsZXJIb3N0KG9wdGlvbnMpO1xuICBjb25zdCBwcm9ncmFtID0gdHMuY3JlYXRlUHJvZ3JhbShmaWxlTmFtZXMsIG9wdGlvbnMsIGNvbXBpbGVySG9zdCk7XG4gIGNvbnN0IGZpbGVzVG9Qcm9jZXNzID0gbmV3IFNldChhYnNvbHV0ZUZpbGVOYW1lcyk7XG4gIGNvbnN0IHJvb3RNb2R1bGVQYXRoID0gb3B0aW9ucy5yb290RGlyIHx8IGdldENvbW1vblBhcmVudERpcmVjdG9yeShhYnNvbHV0ZUZpbGVOYW1lcyk7XG4gIGNvbnN0IHRyYW5zZm9ybWVySG9zdDogdHNpY2tsZS5Uc2lja2xlSG9zdCA9IHtcbiAgICBzaG91bGRTa2lwVHNpY2tsZVByb2Nlc3Npbmc6IChmaWxlTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICByZXR1cm4gIWZpbGVzVG9Qcm9jZXNzLmhhcyhwYXRoLnJlc29sdmUoZmlsZU5hbWUpKTtcbiAgICB9LFxuICAgIHNob3VsZElnbm9yZVdhcm5pbmdzRm9yUGF0aDogKGZpbGVOYW1lOiBzdHJpbmcpID0+IGZhbHNlLFxuICAgIHBhdGhUb01vZHVsZU5hbWU6IGNsaVN1cHBvcnQucGF0aFRvTW9kdWxlTmFtZS5iaW5kKG51bGwsIHJvb3RNb2R1bGVQYXRoKSxcbiAgICBmaWxlTmFtZVRvTW9kdWxlSWQ6IChmaWxlTmFtZSkgPT4gZmlsZU5hbWUsXG4gICAgZXM1TW9kZTogdHJ1ZSxcbiAgICBnb29nbW9kdWxlOiB0cnVlLFxuICAgIHByZWx1ZGU6ICcnLFxuICAgIHRyYW5zZm9ybURlY29yYXRvcnM6IHRydWUsXG4gICAgdHJhbnNmb3JtVHlwZXNUb0Nsb3N1cmU6IHRydWUsXG4gICAgdHlwZUJsYWNrTGlzdFBhdGhzOiBuZXcgU2V0KCksXG4gICAgZGlzYWJsZUF1dG9RdW90aW5nOiBzZXR0aW5ncy5kaXNhYmxlQXV0b1F1b3RpbmcsXG4gICAgdW50eXBlZDogZmFsc2UsXG4gICAgbG9nV2FybmluZzogKHdhcm5pbmcpID0+IGNvbnNvbGUuZXJyb3IodHNpY2tsZS5mb3JtYXREaWFnbm9zdGljcyhbd2FybmluZ10pKSxcbiAgICBvcHRpb25zLFxuICAgIGhvc3Q6IGNvbXBpbGVySG9zdCxcbiAgfTtcbiAgY29uc3QgZGlhZ25vc3RpY3MgPSB0cy5nZXRQcmVFbWl0RGlhZ25vc3RpY3MocHJvZ3JhbSk7XG4gIGlmIChkaWFnbm9zdGljcy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRpYWdub3N0aWNzLFxuICAgICAgbW9kdWxlc01hbmlmZXN0OiBuZXcgTW9kdWxlc01hbmlmZXN0KCksXG4gICAgICBleHRlcm5zOiB7fSxcbiAgICAgIGVtaXRTa2lwcGVkOiB0cnVlLFxuICAgICAgZW1pdHRlZEZpbGVzOiBbXSxcbiAgICB9O1xuICB9XG4gIHJldHVybiB0c2lja2xlLmVtaXRXaXRoVHNpY2tsZShcbiAgICAgIHByb2dyYW0sIHRyYW5zZm9ybWVySG9zdCwgY29tcGlsZXJIb3N0LCBvcHRpb25zLCB1bmRlZmluZWQsIHdyaXRlRmlsZSk7XG59XG5cbmZ1bmN0aW9uIG1haW4oYXJnczogc3RyaW5nW10pOiBudW1iZXIge1xuICBjb25zdCB7c2V0dGluZ3MsIHRzY0FyZ3N9ID0gbG9hZFNldHRpbmdzRnJvbUFyZ3MoYXJncyk7XG4gIGNvbnN0IGNvbmZpZyA9IGxvYWRUc2NDb25maWcodHNjQXJncyk7XG4gIGlmIChjb25maWcuZXJyb3JzLmxlbmd0aCkge1xuICAgIGNvbnNvbGUuZXJyb3IodHNpY2tsZS5mb3JtYXREaWFnbm9zdGljcyhjb25maWcuZXJyb3JzKSk7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICBpZiAoY29uZmlnLm9wdGlvbnMubW9kdWxlICE9PSB0cy5Nb2R1bGVLaW5kLkNvbW1vbkpTKSB7XG4gICAgLy8gVGhpcyBpcyBub3QgYW4gdXBzdHJlYW0gVHlwZVNjcmlwdCBkaWFnbm9zdGljLCB0aGVyZWZvcmUgaXQgZG9lcyBub3QgZ29cbiAgICAvLyB0aHJvdWdoIHRoZSBkaWFnbm9zdGljcyBhcnJheSBtZWNoYW5pc20uXG4gICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgJ3RzaWNrbGUgY29udmVydHMgVHlwZVNjcmlwdCBtb2R1bGVzIHRvIENsb3N1cmUgbW9kdWxlcyB2aWEgQ29tbW9uSlMgaW50ZXJuYWxseS4gJyArXG4gICAgICAgICdTZXQgdHNjb25maWcuanMgXCJtb2R1bGVcIjogXCJjb21tb25qc1wiJyk7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICAvLyBSdW4gdHNpY2tsZStUU0MgdG8gY29udmVydCBpbnB1dHMgdG8gQ2xvc3VyZSBKUyBmaWxlcy5cbiAgY29uc3QgcmVzdWx0ID0gdG9DbG9zdXJlSlMoXG4gICAgICBjb25maWcub3B0aW9ucywgY29uZmlnLmZpbGVOYW1lcywgc2V0dGluZ3MsIChmaWxlUGF0aDogc3RyaW5nLCBjb250ZW50czogc3RyaW5nKSA9PiB7XG4gICAgICAgIG1rZGlycC5zeW5jKHBhdGguZGlybmFtZShmaWxlUGF0aCkpO1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBjb250ZW50cywge2VuY29kaW5nOiAndXRmLTgnfSk7XG4gICAgICB9KTtcbiAgaWYgKHJlc3VsdC5kaWFnbm9zdGljcy5sZW5ndGgpIHtcbiAgICBjb25zb2xlLmVycm9yKHRzaWNrbGUuZm9ybWF0RGlhZ25vc3RpY3MocmVzdWx0LmRpYWdub3N0aWNzKSk7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICBpZiAoc2V0dGluZ3MuZXh0ZXJuc1BhdGgpIHtcbiAgICBta2RpcnAuc3luYyhwYXRoLmRpcm5hbWUoc2V0dGluZ3MuZXh0ZXJuc1BhdGgpKTtcbiAgICBmcy53cml0ZUZpbGVTeW5jKHNldHRpbmdzLmV4dGVybnNQYXRoLCB0c2lja2xlLmdldEdlbmVyYXRlZEV4dGVybnMocmVzdWx0LmV4dGVybnMpKTtcbiAgfVxuICByZXR1cm4gMDtcbn1cblxuLy8gQ0xJIGVudHJ5IHBvaW50XG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgcHJvY2Vzcy5leGl0KG1haW4ocHJvY2Vzcy5hcmd2LnNwbGljZSgyKSkpO1xufVxuIl19