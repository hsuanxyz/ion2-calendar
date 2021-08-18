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
        define("@angular/compiler-cli/src/perform_watch", ["require", "exports", "chokidar", "path", "typescript", "@angular/compiler-cli/src/perform_compile", "@angular/compiler-cli/src/transformers/api", "@angular/compiler-cli/src/transformers/entry_points", "@angular/compiler-cli/src/transformers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const chokidar = require("chokidar");
    const path = require("path");
    const ts = require("typescript");
    const perform_compile_1 = require("@angular/compiler-cli/src/perform_compile");
    const api = require("@angular/compiler-cli/src/transformers/api");
    const entry_points_1 = require("@angular/compiler-cli/src/transformers/entry_points");
    const util_1 = require("@angular/compiler-cli/src/transformers/util");
    function totalCompilationTimeDiagnostic(timeInMillis) {
        let duration;
        if (timeInMillis > 1000) {
            duration = `${(timeInMillis / 1000).toPrecision(2)}s`;
        }
        else {
            duration = `${timeInMillis}ms`;
        }
        return {
            category: ts.DiagnosticCategory.Message,
            messageText: `Total time: ${duration}`,
            code: api.DEFAULT_ERROR_CODE,
            source: api.SOURCE,
        };
    }
    var FileChangeEvent;
    (function (FileChangeEvent) {
        FileChangeEvent[FileChangeEvent["Change"] = 0] = "Change";
        FileChangeEvent[FileChangeEvent["CreateDelete"] = 1] = "CreateDelete";
        FileChangeEvent[FileChangeEvent["CreateDeleteDir"] = 2] = "CreateDeleteDir";
    })(FileChangeEvent = exports.FileChangeEvent || (exports.FileChangeEvent = {}));
    function createPerformWatchHost(configFileName, reportDiagnostics, existingOptions, createEmitCallback) {
        return {
            reportDiagnostics: reportDiagnostics,
            createCompilerHost: options => entry_points_1.createCompilerHost({ options }),
            readConfiguration: () => perform_compile_1.readConfiguration(configFileName, existingOptions),
            createEmitCallback: options => createEmitCallback ? createEmitCallback(options) : undefined,
            onFileChange: (options, listener, ready) => {
                if (!options.basePath) {
                    reportDiagnostics([{
                            category: ts.DiagnosticCategory.Error,
                            messageText: 'Invalid configuration option. baseDir not specified',
                            source: api.SOURCE,
                            code: api.DEFAULT_ERROR_CODE
                        }]);
                    return { close: () => { } };
                }
                const watcher = chokidar.watch(options.basePath, {
                    // ignore .dotfiles, .js and .map files.
                    // can't ignore other files as we e.g. want to recompile if an `.html` file changes as well.
                    ignored: /((^[\/\\])\..)|(\.js$)|(\.map$)|(\.metadata\.json)/,
                    ignoreInitial: true,
                    persistent: true,
                });
                watcher.on('all', (event, path) => {
                    switch (event) {
                        case 'change':
                            listener(FileChangeEvent.Change, path);
                            break;
                        case 'unlink':
                        case 'add':
                            listener(FileChangeEvent.CreateDelete, path);
                            break;
                        case 'unlinkDir':
                        case 'addDir':
                            listener(FileChangeEvent.CreateDeleteDir, path);
                            break;
                    }
                });
                watcher.on('ready', ready);
                return { close: () => watcher.close(), ready };
            },
            setTimeout: (ts.sys.clearTimeout && ts.sys.setTimeout) || setTimeout,
            clearTimeout: (ts.sys.setTimeout && ts.sys.clearTimeout) || clearTimeout,
        };
    }
    exports.createPerformWatchHost = createPerformWatchHost;
    /**
     * The logic in this function is adapted from `tsc.ts` from TypeScript.
     */
    function performWatchCompilation(host) {
        let cachedProgram; // Program cached from last compilation
        let cachedCompilerHost; // CompilerHost cached from last compilation
        let cachedOptions; // CompilerOptions cached from last compilation
        let timerHandleForRecompilation; // Handle for 0.25s wait timer to trigger recompilation
        const ignoreFilesForWatch = new Set();
        const fileCache = new Map();
        const firstCompileResult = doCompilation();
        // Watch basePath, ignoring .dotfiles
        let resolveReadyPromise;
        const readyPromise = new Promise(resolve => resolveReadyPromise = resolve);
        // Note: ! is ok as options are filled after the first compilation
        // Note: ! is ok as resolvedReadyPromise is filled by the previous call
        const fileWatcher = host.onFileChange(cachedOptions.options, watchedFileChanged, resolveReadyPromise);
        return { close, ready: cb => readyPromise.then(cb), firstCompileResult };
        function cacheEntry(fileName) {
            fileName = path.normalize(fileName);
            let entry = fileCache.get(fileName);
            if (!entry) {
                entry = {};
                fileCache.set(fileName, entry);
            }
            return entry;
        }
        function close() {
            fileWatcher.close();
            if (timerHandleForRecompilation) {
                host.clearTimeout(timerHandleForRecompilation);
                timerHandleForRecompilation = undefined;
            }
        }
        // Invoked to perform initial compilation or re-compilation in watch mode
        function doCompilation() {
            if (!cachedOptions) {
                cachedOptions = host.readConfiguration();
            }
            if (cachedOptions.errors && cachedOptions.errors.length) {
                host.reportDiagnostics(cachedOptions.errors);
                return cachedOptions.errors;
            }
            const startTime = Date.now();
            if (!cachedCompilerHost) {
                cachedCompilerHost = host.createCompilerHost(cachedOptions.options);
                const originalWriteFileCallback = cachedCompilerHost.writeFile;
                cachedCompilerHost.writeFile = function (fileName, data, writeByteOrderMark, onError, sourceFiles = []) {
                    ignoreFilesForWatch.add(path.normalize(fileName));
                    return originalWriteFileCallback(fileName, data, writeByteOrderMark, onError, sourceFiles);
                };
                const originalFileExists = cachedCompilerHost.fileExists;
                cachedCompilerHost.fileExists = function (fileName) {
                    const ce = cacheEntry(fileName);
                    if (ce.exists == null) {
                        ce.exists = originalFileExists.call(this, fileName);
                    }
                    return ce.exists;
                };
                const originalGetSourceFile = cachedCompilerHost.getSourceFile;
                cachedCompilerHost.getSourceFile = function (fileName, languageVersion) {
                    const ce = cacheEntry(fileName);
                    if (!ce.sf) {
                        ce.sf = originalGetSourceFile.call(this, fileName, languageVersion);
                    }
                    return ce.sf;
                };
                const originalReadFile = cachedCompilerHost.readFile;
                cachedCompilerHost.readFile = function (fileName) {
                    const ce = cacheEntry(fileName);
                    if (ce.content == null) {
                        ce.content = originalReadFile.call(this, fileName);
                    }
                    return ce.content;
                };
            }
            ignoreFilesForWatch.clear();
            const oldProgram = cachedProgram;
            // We clear out the `cachedProgram` here as a
            // program can only be used as `oldProgram` 1x
            cachedProgram = undefined;
            const compileResult = perform_compile_1.performCompilation({
                rootNames: cachedOptions.rootNames,
                options: cachedOptions.options,
                host: cachedCompilerHost,
                oldProgram: oldProgram,
                emitCallback: host.createEmitCallback(cachedOptions.options)
            });
            if (compileResult.diagnostics.length) {
                host.reportDiagnostics(compileResult.diagnostics);
            }
            const endTime = Date.now();
            if (cachedOptions.options.diagnostics) {
                const totalTime = (endTime - startTime) / 1000;
                host.reportDiagnostics([totalCompilationTimeDiagnostic(endTime - startTime)]);
            }
            const exitCode = perform_compile_1.exitCodeFromResult(compileResult.diagnostics);
            if (exitCode == 0) {
                cachedProgram = compileResult.program;
                host.reportDiagnostics([util_1.createMessageDiagnostic('Compilation complete. Watching for file changes.')]);
            }
            else {
                host.reportDiagnostics([util_1.createMessageDiagnostic('Compilation failed. Watching for file changes.')]);
            }
            return compileResult.diagnostics;
        }
        function resetOptions() {
            cachedProgram = undefined;
            cachedCompilerHost = undefined;
            cachedOptions = undefined;
        }
        function watchedFileChanged(event, fileName) {
            if (cachedOptions && event === FileChangeEvent.Change &&
                // TODO(chuckj): validate that this is sufficient to skip files that were written.
                // This assumes that the file path we write is the same file path we will receive in the
                // change notification.
                path.normalize(fileName) === path.normalize(cachedOptions.project)) {
                // If the configuration file changes, forget everything and start the recompilation timer
                resetOptions();
            }
            else if (event === FileChangeEvent.CreateDelete || event === FileChangeEvent.CreateDeleteDir) {
                // If a file was added or removed, reread the configuration
                // to determine the new list of root files.
                cachedOptions = undefined;
            }
            if (event === FileChangeEvent.CreateDeleteDir) {
                fileCache.clear();
            }
            else {
                fileCache.delete(path.normalize(fileName));
            }
            if (!ignoreFilesForWatch.has(path.normalize(fileName))) {
                // Ignore the file if the file is one that was written by the compiler.
                startTimerForRecompilation();
            }
        }
        // Upon detecting a file change, wait for 250ms and then perform a recompilation. This gives batch
        // operations (such as saving all modified files in an editor) a chance to complete before we kick
        // off a new compilation.
        function startTimerForRecompilation() {
            if (timerHandleForRecompilation) {
                host.clearTimeout(timerHandleForRecompilation);
            }
            timerHandleForRecompilation = host.setTimeout(recompile, 250);
        }
        function recompile() {
            timerHandleForRecompilation = undefined;
            host.reportDiagnostics([util_1.createMessageDiagnostic('File change detected. Starting incremental compilation.')]);
            doCompilation();
        }
    }
    exports.performWatchCompilation = performWatchCompilation;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyZm9ybV93YXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvcGVyZm9ybV93YXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHFDQUFxQztJQUNyQyw2QkFBNkI7SUFDN0IsaUNBQWlDO0lBRWpDLCtFQUF3SjtJQUN4SixrRUFBMEM7SUFDMUMsc0ZBQStEO0lBQy9ELHNFQUE0RDtJQUU1RCxTQUFTLDhCQUE4QixDQUFDLFlBQW9CO1FBQzFELElBQUksUUFBZ0IsQ0FBQztRQUNyQixJQUFJLFlBQVksR0FBRyxJQUFJLEVBQUU7WUFDdkIsUUFBUSxHQUFHLEdBQUcsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7U0FDdkQ7YUFBTTtZQUNMLFFBQVEsR0FBRyxHQUFHLFlBQVksSUFBSSxDQUFDO1NBQ2hDO1FBQ0QsT0FBTztZQUNMLFFBQVEsRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsT0FBTztZQUN2QyxXQUFXLEVBQUUsZUFBZSxRQUFRLEVBQUU7WUFDdEMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxrQkFBa0I7WUFDNUIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO1NBQ25CLENBQUM7SUFDSixDQUFDO0lBRUQsSUFBWSxlQUlYO0lBSkQsV0FBWSxlQUFlO1FBQ3pCLHlEQUFNLENBQUE7UUFDTixxRUFBWSxDQUFBO1FBQ1osMkVBQWUsQ0FBQTtJQUNqQixDQUFDLEVBSlcsZUFBZSxHQUFmLHVCQUFlLEtBQWYsdUJBQWUsUUFJMUI7SUFjRCxTQUFnQixzQkFBc0IsQ0FDbEMsY0FBc0IsRUFBRSxpQkFBcUQsRUFDN0UsZUFBb0MsRUFBRSxrQkFDa0M7UUFDMUUsT0FBTztZQUNMLGlCQUFpQixFQUFFLGlCQUFpQjtZQUNwQyxrQkFBa0IsRUFBRSxP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Q0FBQztRQUNsQixDQUFDO0lBQ0gsQ0FBQztJQXpLRCwwREF5S0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGNob2tpZGFyIGZyb20gJ2Nob2tpZGFyJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtEaWFnbm9zdGljcywgUGFyc2VkQ29uZmlndXJhdGlvbiwgUGVyZm9ybUNvbXBpbGF0aW9uUmVzdWx0LCBleGl0Q29kZUZyb21SZXN1bHQsIHBlcmZvcm1Db21waWxhdGlvbiwgcmVhZENvbmZpZ3VyYXRpb259IGZyb20gJy4vcGVyZm9ybV9jb21waWxlJztcbmltcG9ydCAqIGFzIGFwaSBmcm9tICcuL3RyYW5zZm9ybWVycy9hcGknO1xuaW1wb3J0IHtjcmVhdGVDb21waWxlckhvc3R9IGZyb20gJy4vdHJhbnNmb3JtZXJzL2VudHJ5X3BvaW50cyc7XG5pbXBvcnQge2NyZWF0ZU1lc3NhZ2VEaWFnbm9zdGljfSBmcm9tICcuL3RyYW5zZm9ybWVycy91dGlsJztcblxuZnVuY3Rpb24gdG90YWxDb21waWxhdGlvblRpbWVEaWFnbm9zdGljKHRpbWVJbk1pbGxpczogbnVtYmVyKTogYXBpLkRpYWdub3N0aWMge1xuICBsZXQgZHVyYXRpb246IHN0cmluZztcbiAgaWYgKHRpbWVJbk1pbGxpcyA+IDEwMDApIHtcbiAgICBkdXJhdGlvbiA9IGAkeyh0aW1lSW5NaWxsaXMgLyAxMDAwKS50b1ByZWNpc2lvbigyKX1zYDtcbiAgfSBlbHNlIHtcbiAgICBkdXJhdGlvbiA9IGAke3RpbWVJbk1pbGxpc31tc2A7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBjYXRlZ29yeTogdHMuRGlhZ25vc3RpY0NhdGVnb3J5Lk1lc3NhZ2UsXG4gICAgbWVzc2FnZVRleHQ6IGBUb3RhbCB0aW1lOiAke2R1cmF0aW9ufWAsXG4gICAgY29kZTogYXBpLkRFRkFVTFRfRVJST1JfQ09ERSxcbiAgICBzb3VyY2U6IGFwaS5TT1VSQ0UsXG4gIH07XG59XG5cbmV4cG9ydCBlbnVtIEZpbGVDaGFuZ2VFdmVudCB7XG4gIENoYW5nZSxcbiAgQ3JlYXRlRGVsZXRlLFxuICBDcmVhdGVEZWxldGVEaXIsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGVyZm9ybVdhdGNoSG9zdCB7XG4gIHJlcG9ydERpYWdub3N0aWNzKGRpYWdub3N0aWNzOiBEaWFnbm9zdGljcyk6IHZvaWQ7XG4gIHJlYWRDb25maWd1cmF0aW9uKCk6IFBhcnNlZENvbmZpZ3VyYXRpb247XG4gIGNyZWF0ZUNvbXBpbGVySG9zdChvcHRpb25zOiBhcGkuQ29tcGlsZXJPcHRpb25zKTogYXBpLkNvbXBpbGVySG9zdDtcbiAgY3JlYXRlRW1pdENhbGxiYWNrKG9wdGlvbnM6IGFwaS5Db21waWxlck9wdGlvbnMpOiBhcGkuVHNFbWl0Q2FsbGJhY2t8dW5kZWZpbmVkO1xuICBvbkZpbGVDaGFuZ2UoXG4gICAgICBvcHRpb25zOiBhcGkuQ29tcGlsZXJPcHRpb25zLCBsaXN0ZW5lcjogKGV2ZW50OiBGaWxlQ2hhbmdlRXZlbnQsIGZpbGVOYW1lOiBzdHJpbmcpID0+IHZvaWQsXG4gICAgICByZWFkeTogKCkgPT4gdm9pZCk6IHtjbG9zZTogKCkgPT4gdm9pZH07XG4gIHNldFRpbWVvdXQoY2FsbGJhY2s6ICgpID0+IHZvaWQsIG1zOiBudW1iZXIpOiBhbnk7XG4gIGNsZWFyVGltZW91dCh0aW1lb3V0SWQ6IGFueSk6IHZvaWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQZXJmb3JtV2F0Y2hIb3N0KFxuICAgIGNvbmZpZ0ZpbGVOYW1lOiBzdHJpbmcsIHJlcG9ydERpYWdub3N0aWNzOiAoZGlhZ25vc3RpY3M6IERpYWdub3N0aWNzKSA9PiB2b2lkLFxuICAgIGV4aXN0aW5nT3B0aW9ucz86IHRzLkNvbXBpbGVyT3B0aW9ucywgY3JlYXRlRW1pdENhbGxiYWNrPzogKG9wdGlvbnM6IGFwaS5Db21waWxlck9wdGlvbnMpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpLlRzRW1pdENhbGxiYWNrIHwgdW5kZWZpbmVkKTogUGVyZm9ybVdhdGNoSG9zdCB7XG4gIHJldHVybiB7XG4gICAgcmVwb3J0RGlhZ25vc3RpY3M6IHJlcG9ydERpYWdub3N0aWNzLFxuICAgIGNyZWF0ZUNvbXBpbGVySG9zdDogb3B0aW9ucyA9PiBjcmVhdGVDb21waWxlckhvc3Qoe29wdGlvbnN9KSxcbiAgICByZWFkQ29uZmlndXJhdGlvbjogKCkgPT4gcmVhZENvbmZpZ3VyYXRpb24oY29uZmlnRmlsZU5hbWUsIGV4aXN0aW5nT3B0aW9ucyksXG4gICAgY3JlYXRlRW1pdENhbGxiYWNrOiBvcHRpb25zID0+IGNyZWF0ZUVtaXRDYWxsYmFjayA/IGNyZWF0ZUVtaXRDYWxsYmFjayhvcHRpb25zKSA6IHVuZGVmaW5lZCxcbiAgICBvbkZpbGVDaGFuZ2U6IChvcHRpb25zLCBsaXN0ZW5lciwgcmVhZHk6ICgpID0+IHZvaWQpID0+IHtcbiAgICAgIGlmICghb3B0aW9ucy5iYXNlUGF0aCkge1xuICAgICAgICByZXBvcnREaWFnbm9zdGljcyhbe1xuICAgICAgICAgIGNhdGVnb3J5OiB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuRXJyb3IsXG4gICAgICAgICAgbWVzc2FnZVRleHQ6ICdJbnZhbGlkIGNvbmZpZ3VyYXRpb24gb3B0aW9uLiBiYXNlRGlyIG5vdCBzcGVjaWZpZWQnLFxuICAgICAgICAgIHNvdXJjZTogYXBpLlNPVVJDRSxcbiAgICAgICAgICBjb2RlOiBhcGkuREVGQVVMVF9FUlJPUl9DT0RFXG4gICAgICAgIH1dKTtcbiAgICAgICAgcmV0dXJuIHtjbG9zZTogKCkgPT4ge319O1xuICAgICAgfVxuICAgICAgY29uc3Qgd2F0Y2hlciA9IGNob2tpZGFyLndhdGNoKG9wdGlvbnMuYmFzZVBhdGgsIHtcbiAgICAgICAgLy8gaWdub3JlIC5kb3RmaWxlcywgLmpzIGFuZCAubWFwIGZpbGVzLlxuICAgICAgICAvLyBjYW4ndCBpZ25vcmUgb3RoZXIgZmlsZXMgYXMgd2UgZS5nLiB3YW50IHRvIHJlY29tcGlsZSBpZiBhbiBgLmh0bWxgIGZpbGUgY2hhbmdlcyBhcyB3ZWxsLlxuICAgICAgICBpZ25vcmVkOiAvKCheW1xcL1xcXFxdKVxcLi4pfChcXC5qcyQpfChcXC5tYXAkKXwoXFwubWV0YWRhdGFcXC5qc29uKS8sXG4gICAgICAgIGlnbm9yZUluaXRpYWw6IHRydWUsXG4gICAgICAgIHBlcnNpc3RlbnQ6IHRydWUsXG4gICAgICB9KTtcbiAgICAgIHdhdGNoZXIub24oJ2FsbCcsIChldmVudDogc3RyaW5nLCBwYXRoOiBzdHJpbmcpID0+IHtcbiAgICAgICAgc3dpdGNoIChldmVudCkge1xuICAgICAgICAgIGNhc2UgJ2NoYW5nZSc6XG4gICAgICAgICAgICBsaXN0ZW5lcihGaWxlQ2hhbmdlRXZlbnQuQ2hhbmdlLCBwYXRoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3VubGluayc6XG4gICAgICAgICAgY2FzZSAnYWRkJzpcbiAgICAgICAgICAgIGxpc3RlbmVyKEZpbGVDaGFuZ2VFdmVudC5DcmVhdGVEZWxldGUsIHBhdGgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAndW5saW5rRGlyJzpcbiAgICAgICAgICBjYXNlICdhZGREaXInOlxuICAgICAgICAgICAgbGlzdGVuZXIoRmlsZUNoYW5nZUV2ZW50LkNyZWF0ZURlbGV0ZURpciwgcGF0aCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB3YXRjaGVyLm9uKCdyZWFkeScsIHJlYWR5KTtcbiAgICAgIHJldHVybiB7Y2xvc2U6ICgpID0+IHdhdGNoZXIuY2xvc2UoKSwgcmVhZHl9O1xuICAgIH0sXG4gICAgc2V0VGltZW91dDogKHRzLnN5cy5jbGVhclRpbWVvdXQgJiYgdHMuc3lzLnNldFRpbWVvdXQpIHx8IHNldFRpbWVvdXQsXG4gICAgY2xlYXJUaW1lb3V0OiAodHMuc3lzLnNldFRpbWVvdXQgJiYgdHMuc3lzLmNsZWFyVGltZW91dCkgfHwgY2xlYXJUaW1lb3V0LFxuICB9O1xufVxuXG5pbnRlcmZhY2UgQ2FjaGVFbnRyeSB7XG4gIGV4aXN0cz86IGJvb2xlYW47XG4gIHNmPzogdHMuU291cmNlRmlsZTtcbiAgY29udGVudD86IHN0cmluZztcbn1cblxuLyoqXG4gKiBUaGUgbG9naWMgaW4gdGhpcyBmdW5jdGlvbiBpcyBhZGFwdGVkIGZyb20gYHRzYy50c2AgZnJvbSBUeXBlU2NyaXB0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGVyZm9ybVdhdGNoQ29tcGlsYXRpb24oaG9zdDogUGVyZm9ybVdhdGNoSG9zdCk6XG4gICAge2Nsb3NlOiAoKSA9PiB2b2lkLCByZWFkeTogKGNiOiAoKSA9PiB2b2lkKSA9PiB2b2lkLCBmaXJzdENvbXBpbGVSZXN1bHQ6IERpYWdub3N0aWNzfSB7XG4gIGxldCBjYWNoZWRQcm9ncmFtOiBhcGkuUHJvZ3JhbXx1bmRlZmluZWQ7ICAgICAgICAgICAgLy8gUHJvZ3JhbSBjYWNoZWQgZnJvbSBsYXN0IGNvbXBpbGF0aW9uXG4gIGxldCBjYWNoZWRDb21waWxlckhvc3Q6IGFwaS5Db21waWxlckhvc3R8dW5kZWZpbmVkOyAgLy8gQ29tcGlsZXJIb3N0IGNhY2hlZCBmcm9tIGxhc3QgY29tcGlsYXRpb25cbiAgbGV0IGNhY2hlZE9wdGlvbnM6IFBhcnNlZENvbmZpZ3VyYXRpb258dW5kZWZpbmVkOyAgLy8gQ29tcGlsZXJPcHRpb25zIGNhY2hlZCBmcm9tIGxhc3QgY29tcGlsYXRpb25cbiAgbGV0IHRpbWVySGFuZGxlRm9yUmVjb21waWxhdGlvbjogYW55OyAgLy8gSGFuZGxlIGZvciAwLjI1cyB3YWl0IHRpbWVyIHRvIHRyaWdnZXIgcmVjb21waWxhdGlvblxuXG4gIGNvbnN0IGlnbm9yZUZpbGVzRm9yV2F0Y2ggPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgY29uc3QgZmlsZUNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIENhY2hlRW50cnk+KCk7XG5cbiAgY29uc3QgZmlyc3RDb21waWxlUmVzdWx0ID0gZG9Db21waWxhdGlvbigpO1xuXG4gIC8vIFdhdGNoIGJhc2VQYXRoLCBpZ25vcmluZyAuZG90ZmlsZXNcbiAgbGV0IHJlc29sdmVSZWFkeVByb21pc2U6ICgpID0+IHZvaWQ7XG4gIGNvbnN0IHJlYWR5UHJvbWlzZSA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gcmVzb2x2ZVJlYWR5UHJvbWlzZSA9IHJlc29sdmUpO1xuICAvLyBOb3RlOiAhIGlzIG9rIGFzIG9wdGlvbnMgYXJlIGZpbGxlZCBhZnRlciB0aGUgZmlyc3QgY29tcGlsYXRpb25cbiAgLy8gTm90ZTogISBpcyBvayBhcyByZXNvbHZlZFJlYWR5UHJvbWlzZSBpcyBmaWxsZWQgYnkgdGhlIHByZXZpb3VzIGNhbGxcbiAgY29uc3QgZmlsZVdhdGNoZXIgPVxuICAgICAgaG9zdC5vbkZpbGVDaGFuZ2UoY2FjaGVkT3B0aW9ucyAhLm9wdGlvbnMsIHdhdGNoZWRGaWxlQ2hhbmdlZCwgcmVzb2x2ZVJlYWR5UHJvbWlzZSAhKTtcblxuICByZXR1cm4ge2Nsb3NlLCByZWFkeTogY2IgPT4gcmVhZHlQcm9taXNlLnRoZW4oY2IpLCBmaXJzdENvbXBpbGVSZXN1bHR9O1xuXG4gIGZ1bmN0aW9uIGNhY2hlRW50cnkoZmlsZU5hbWU6IHN0cmluZyk6IENhY2hlRW50cnkge1xuICAgIGZpbGVOYW1lID0gcGF0aC5ub3JtYWxpemUoZmlsZU5hbWUpO1xuICAgIGxldCBlbnRyeSA9IGZpbGVDYWNoZS5nZXQoZmlsZU5hbWUpO1xuICAgIGlmICghZW50cnkpIHtcbiAgICAgIGVudHJ5ID0ge307XG4gICAgICBmaWxlQ2FjaGUuc2V0KGZpbGVOYW1lLCBlbnRyeSk7XG4gICAgfVxuICAgIHJldHVybiBlbnRyeTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlKCkge1xuICAgIGZpbGVXYXRjaGVyLmNsb3NlKCk7XG4gICAgaWYgKHRpbWVySGFuZGxlRm9yUmVjb21waWxhdGlvbikge1xuICAgICAgaG9zdC5jbGVhclRpbWVvdXQodGltZXJIYW5kbGVGb3JSZWNvbXBpbGF0aW9uKTtcbiAgICAgIHRpbWVySGFuZGxlRm9yUmVjb21waWxhdGlvbiA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICAvLyBJbnZva2VkIHRvIHBlcmZvcm0gaW5pdGlhbCBjb21waWxhdGlvbiBvciByZS1jb21waWxhdGlvbiBpbiB3YXRjaCBtb2RlXG4gIGZ1bmN0aW9uIGRvQ29tcGlsYXRpb24oKTogRGlhZ25vc3RpY3Mge1xuICAgIGlmICghY2FjaGVkT3B0aW9ucykge1xuICAgICAgY2FjaGVkT3B0aW9ucyA9IGhvc3QucmVhZENvbmZpZ3VyYXRpb24oKTtcbiAgICB9XG4gICAgaWYgKGNhY2hlZE9wdGlvbnMuZXJyb3JzICYmIGNhY2hlZE9wdGlvbnMuZXJyb3JzLmxlbmd0aCkge1xuICAgICAgaG9zdC5yZXBvcnREaWFnbm9zdGljcyhjYWNoZWRPcHRpb25zLmVycm9ycyk7XG4gICAgICByZXR1cm4gY2FjaGVkT3B0aW9ucy5lcnJvcnM7XG4gICAgfVxuICAgIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG4gICAgaWYgKCFjYWNoZWRDb21waWxlckhvc3QpIHtcbiAgICAgIGNhY2hlZENvbXBpbGVySG9zdCA9IGhvc3QuY3JlYXRlQ29tcGlsZXJIb3N0KGNhY2hlZE9wdGlvbnMub3B0aW9ucyk7XG4gICAgICBjb25zdCBvcmlnaW5hbFdyaXRlRmlsZUNhbGxiYWNrID0gY2FjaGVkQ29tcGlsZXJIb3N0LndyaXRlRmlsZTtcbiAgICAgIGNhY2hlZENvbXBpbGVySG9zdC53cml0ZUZpbGUgPSBmdW5jdGlvbihcbiAgICAgICAgICBmaWxlTmFtZTogc3RyaW5nLCBkYXRhOiBzdHJpbmcsIHdyaXRlQnl0ZU9yZGVyTWFyazogYm9vbGVhbixcbiAgICAgICAgICBvbkVycm9yPzogKG1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZCwgc291cmNlRmlsZXM6IFJlYWRvbmx5QXJyYXk8dHMuU291cmNlRmlsZT4gPSBbXSkge1xuICAgICAgICBpZ25vcmVGaWxlc0ZvcldhdGNoLmFkZChwYXRoLm5vcm1hbGl6ZShmaWxlTmFtZSkpO1xuICAgICAgICByZXR1cm4gb3JpZ2luYWxXcml0ZUZpbGVDYWxsYmFjayhmaWxlTmFtZSwgZGF0YSwgd3JpdGVCeXRlT3JkZXJNYXJrLCBvbkVycm9yLCBzb3VyY2VGaWxlcyk7XG4gICAgICB9O1xuICAgICAgY29uc3Qgb3JpZ2luYWxGaWxlRXhpc3RzID0gY2FjaGVkQ29tcGlsZXJIb3N0LmZpbGVFeGlzdHM7XG4gICAgICBjYWNoZWRDb21waWxlckhvc3QuZmlsZUV4aXN0cyA9IGZ1bmN0aW9uKGZpbGVOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgY2UgPSBjYWNoZUVudHJ5KGZpbGVOYW1lKTtcbiAgICAgICAgaWYgKGNlLmV4aXN0cyA9PSBudWxsKSB7XG4gICAgICAgICAgY2UuZXhpc3RzID0gb3JpZ2luYWxGaWxlRXhpc3RzLmNhbGwodGhpcywgZmlsZU5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjZS5leGlzdHMgITtcbiAgICAgIH07XG4gICAgICBjb25zdCBvcmlnaW5hbEdldFNvdXJjZUZpbGUgPSBjYWNoZWRDb21waWxlckhvc3QuZ2V0U291cmNlRmlsZTtcbiAgICAgIGNhY2hlZENvbXBpbGVySG9zdC5nZXRTb3VyY2VGaWxlID0gZnVuY3Rpb24oXG4gICAgICAgICAgZmlsZU5hbWU6IHN0cmluZywgbGFuZ3VhZ2VWZXJzaW9uOiB0cy5TY3JpcHRUYXJnZXQpIHtcbiAgICAgICAgY29uc3QgY2UgPSBjYWNoZUVudHJ5KGZpbGVOYW1lKTtcbiAgICAgICAgaWYgKCFjZS5zZikge1xuICAgICAgICAgIGNlLnNmID0gb3JpZ2luYWxHZXRTb3VyY2VGaWxlLmNhbGwodGhpcywgZmlsZU5hbWUsIGxhbmd1YWdlVmVyc2lvbik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNlLnNmICE7XG4gICAgICB9O1xuICAgICAgY29uc3Qgb3JpZ2luYWxSZWFkRmlsZSA9IGNhY2hlZENvbXBpbGVySG9zdC5yZWFkRmlsZTtcbiAgICAgIGNhY2hlZENvbXBpbGVySG9zdC5yZWFkRmlsZSA9IGZ1bmN0aW9uKGZpbGVOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgY2UgPSBjYWNoZUVudHJ5KGZpbGVOYW1lKTtcbiAgICAgICAgaWYgKGNlLmNvbnRlbnQgPT0gbnVsbCkge1xuICAgICAgICAgIGNlLmNvbnRlbnQgPSBvcmlnaW5hbFJlYWRGaWxlLmNhbGwodGhpcywgZmlsZU5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjZS5jb250ZW50ICE7XG4gICAgICB9O1xuICAgIH1cbiAgICBpZ25vcmVGaWxlc0ZvcldhdGNoLmNsZWFyKCk7XG4gICAgY29uc3Qgb2xkUHJvZ3JhbSA9IGNhY2hlZFByb2dyYW07XG4gICAgLy8gV2UgY2xlYXIgb3V0IHRoZSBgY2FjaGVkUHJvZ3JhbWAgaGVyZSBhcyBhXG4gICAgLy8gcHJvZ3JhbSBjYW4gb25seSBiZSB1c2VkIGFzIGBvbGRQcm9ncmFtYCAxeFxuICAgIGNhY2hlZFByb2dyYW0gPSB1bmRlZmluZWQ7XG4gICAgY29uc3QgY29tcGlsZVJlc3VsdCA9IHBlcmZvcm1Db21waWxhdGlvbih7XG4gICAgICByb290TmFtZXM6IGNhY2hlZE9wdGlvbnMucm9vdE5hbWVzLFxuICAgICAgb3B0aW9uczogY2FjaGVkT3B0aW9ucy5vcHRpb25zLFxuICAgICAgaG9zdDogY2FjaGVkQ29tcGlsZXJIb3N0LFxuICAgICAgb2xkUHJvZ3JhbTogb2xkUHJvZ3JhbSxcbiAgICAgIGVtaXRDYWxsYmFjazogaG9zdC5jcmVhdGVFbWl0Q2FsbGJhY2soY2FjaGVkT3B0aW9ucy5vcHRpb25zKVxuICAgIH0pO1xuXG4gICAgaWYgKGNvbXBpbGVSZXN1bHQuZGlhZ25vc3RpY3MubGVuZ3RoKSB7XG4gICAgICBob3N0LnJlcG9ydERpYWdub3N0aWNzKGNvbXBpbGVSZXN1bHQuZGlhZ25vc3RpY3MpO1xuICAgIH1cblxuICAgIGNvbnN0IGVuZFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIGlmIChjYWNoZWRPcHRpb25zLm9wdGlvbnMuZGlhZ25vc3RpY3MpIHtcbiAgICAgIGNvbnN0IHRvdGFsVGltZSA9IChlbmRUaW1lIC0gc3RhcnRUaW1lKSAvIDEwMDA7XG4gICAgICBob3N0LnJlcG9ydERpYWdub3N0aWNzKFt0b3RhbENvbXBpbGF0aW9uVGltZURpYWdub3N0aWMoZW5kVGltZSAtIHN0YXJ0VGltZSldKTtcbiAgICB9XG4gICAgY29uc3QgZXhpdENvZGUgPSBleGl0Q29kZUZyb21SZXN1bHQoY29tcGlsZVJlc3VsdC5kaWFnbm9zdGljcyk7XG4gICAgaWYgKGV4aXRDb2RlID09IDApIHtcbiAgICAgIGNhY2hlZFByb2dyYW0gPSBjb21waWxlUmVzdWx0LnByb2dyYW07XG4gICAgICBob3N0LnJlcG9ydERpYWdub3N0aWNzKFxuICAgICAgICAgIFtjcmVhdGVNZXNzYWdlRGlhZ25vc3RpYygnQ29tcGlsYXRpb24gY29tcGxldGUuIFdhdGNoaW5nIGZvciBmaWxlIGNoYW5nZXMuJyldKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaG9zdC5yZXBvcnREaWFnbm9zdGljcyhcbiAgICAgICAgICBbY3JlYXRlTWVzc2FnZURpYWdub3N0aWMoJ0NvbXBpbGF0aW9uIGZhaWxlZC4gV2F0Y2hpbmcgZm9yIGZpbGUgY2hhbmdlcy4nKV0pO1xuICAgIH1cblxuICAgIHJldHVybiBjb21waWxlUmVzdWx0LmRpYWdub3N0aWNzO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzZXRPcHRpb25zKCkge1xuICAgIGNhY2hlZFByb2dyYW0gPSB1bmRlZmluZWQ7XG4gICAgY2FjaGVkQ29tcGlsZXJIb3N0ID0gdW5kZWZpbmVkO1xuICAgIGNhY2hlZE9wdGlvbnMgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBmdW5jdGlvbiB3YXRjaGVkRmlsZUNoYW5nZWQoZXZlbnQ6IEZpbGVDaGFuZ2VFdmVudCwgZmlsZU5hbWU6IHN0cmluZykge1xuICAgIGlmIChjYWNoZWRPcHRpb25zICYmIGV2ZW50ID09PSBGaWxlQ2hhbmdlRXZlbnQuQ2hhbmdlICYmXG4gICAgICAgIC8vIFRPRE8oY2h1Y2tqKTogdmFsaWRhdGUgdGhhdCB0aGlzIGlzIHN1ZmZpY2llbnQgdG8gc2tpcCBmaWxlcyB0aGF0IHdlcmUgd3JpdHRlbi5cbiAgICAgICAgLy8gVGhpcyBhc3N1bWVzIHRoYXQgdGhlIGZpbGUgcGF0aCB3ZSB3cml0ZSBpcyB0aGUgc2FtZSBmaWxlIHBhdGggd2Ugd2lsbCByZWNlaXZlIGluIHRoZVxuICAgICAgICAvLyBjaGFuZ2Ugbm90aWZpY2F0aW9uLlxuICAgICAgICBwYXRoLm5vcm1hbGl6ZShmaWxlTmFtZSkgPT09IHBhdGgubm9ybWFsaXplKGNhY2hlZE9wdGlvbnMucHJvamVjdCkpIHtcbiAgICAgIC8vIElmIHRoZSBjb25maWd1cmF0aW9uIGZpbGUgY2hhbmdlcywgZm9yZ2V0IGV2ZXJ5dGhpbmcgYW5kIHN0YXJ0IHRoZSByZWNvbXBpbGF0aW9uIHRpbWVyXG4gICAgICByZXNldE9wdGlvbnMoKTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgICBldmVudCA9PT0gRmlsZUNoYW5nZUV2ZW50LkNyZWF0ZURlbGV0ZSB8fCBldmVudCA9PT0gRmlsZUNoYW5nZUV2ZW50LkNyZWF0ZURlbGV0ZURpcikge1xuICAgICAgLy8gSWYgYSBmaWxlIHdhcyBhZGRlZCBvciByZW1vdmVkLCByZXJlYWQgdGhlIGNvbmZpZ3VyYXRpb25cbiAgICAgIC8vIHRvIGRldGVybWluZSB0aGUgbmV3IGxpc3Qgb2Ygcm9vdCBmaWxlcy5cbiAgICAgIGNhY2hlZE9wdGlvbnMgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKGV2ZW50ID09PSBGaWxlQ2hhbmdlRXZlbnQuQ3JlYXRlRGVsZXRlRGlyKSB7XG4gICAgICBmaWxlQ2FjaGUuY2xlYXIoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmlsZUNhY2hlLmRlbGV0ZShwYXRoLm5vcm1hbGl6ZShmaWxlTmFtZSkpO1xuICAgIH1cblxuICAgIGlmICghaWdub3JlRmlsZXNGb3JXYXRjaC5oYXMocGF0aC5ub3JtYWxpemUoZmlsZU5hbWUpKSkge1xuICAgICAgLy8gSWdub3JlIHRoZSBmaWxlIGlmIHRoZSBmaWxlIGlzIG9uZSB0aGF0IHdhcyB3cml0dGVuIGJ5IHRoZSBjb21waWxlci5cbiAgICAgIHN0YXJ0VGltZXJGb3JSZWNvbXBpbGF0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLy8gVXBvbiBkZXRlY3RpbmcgYSBmaWxlIGNoYW5nZSwgd2FpdCBmb3IgMjUwbXMgYW5kIHRoZW4gcGVyZm9ybSBhIHJlY29tcGlsYXRpb24uIFRoaXMgZ2l2ZXMgYmF0Y2hcbiAgLy8gb3BlcmF0aW9ucyAoc3VjaCBhcyBzYXZpbmcgYWxsIG1vZGlmaWVkIGZpbGVzIGluIGFuIGVkaXRvcikgYSBjaGFuY2UgdG8gY29tcGxldGUgYmVmb3JlIHdlIGtpY2tcbiAgLy8gb2ZmIGEgbmV3IGNvbXBpbGF0aW9uLlxuICBmdW5jdGlvbiBzdGFydFRpbWVyRm9yUmVjb21waWxhdGlvbigpIHtcbiAgICBpZiAodGltZXJIYW5kbGVGb3JSZWNvbXBpbGF0aW9uKSB7XG4gICAgICBob3N0LmNsZWFyVGltZW91dCh0aW1lckhhbmRsZUZvclJlY29tcGlsYXRpb24pO1xuICAgIH1cbiAgICB0aW1lckhhbmRsZUZvclJlY29tcGlsYXRpb24gPSBob3N0LnNldFRpbWVvdXQocmVjb21waWxlLCAyNTApO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVjb21waWxlKCkge1xuICAgIHRpbWVySGFuZGxlRm9yUmVjb21waWxhdGlvbiA9IHVuZGVmaW5lZDtcbiAgICBob3N0LnJlcG9ydERpYWdub3N0aWNzKFxuICAgICAgICBbY3JlYXRlTWVzc2FnZURpYWdub3N0aWMoJ0ZpbGUgY2hhbmdlIGRldGVjdGVkLiBTdGFydGluZyBpbmNyZW1lbnRhbCBjb21waWxhdGlvbi4nKV0pO1xuICAgIGRvQ29tcGlsYXRpb24oKTtcbiAgfVxufVxuIl19