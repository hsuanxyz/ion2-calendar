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
        define("@angular/compiler-cli/src/diagnostics/translate_diagnostics", ["require", "exports", "typescript", "@angular/compiler-cli/src/transformers/api", "@angular/compiler-cli/src/transformers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ts = require("typescript");
    const api_1 = require("@angular/compiler-cli/src/transformers/api");
    const util_1 = require("@angular/compiler-cli/src/transformers/util");
    function translateDiagnostics(host, untranslatedDiagnostics) {
        const ts = [];
        const ng = [];
        untranslatedDiagnostics.forEach((diagnostic) => {
            if (diagnostic.file && diagnostic.start && util_1.GENERATED_FILES.test(diagnostic.file.fileName)) {
                // We need to filter out diagnostics about unused functions as
                // they are in fact referenced by nobody and only serve to surface
                // type check errors.
                if (diagnostic.code === /* ... is declared but never used */ 6133) {
                    return;
                }
                const span = sourceSpanOf(host, diagnostic.file, diagnostic.start);
                if (span) {
                    const fileName = span.start.file.url;
                    ng.push({
                        messageText: diagnosticMessageToString(diagnostic.messageText),
                        category: diagnostic.category, span,
                        source: api_1.SOURCE,
                        code: api_1.DEFAULT_ERROR_CODE
                    });
                }
            }
            else {
                ts.push(diagnostic);
            }
        });
        return { ts, ng };
    }
    exports.translateDiagnostics = translateDiagnostics;
    function sourceSpanOf(host, source, start) {
        const { line, character } = ts.getLineAndCharacterOfPosition(source, start);
        return host.parseSourceSpanOf(source.fileName, line, character);
    }
    function diagnosticMessageToString(message) {
        return ts.flattenDiagnosticMessageText(message, '\n');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRlX2RpYWdub3N0aWNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9kaWFnbm9zdGljcy90cmFuc2xhdGVfZGlhZ25vc3RpY3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFHSCxpQ0FBaUM7SUFFakMsb0VBQTJFO0lBQzNFLHNFQUFxRDtJQU1yRCxTQUFnQixvQkFBb0IsQ0FDaEMsSUFBbUIsRUFBRSx1QkFBcUQ7UUFFNUUsTUFBTSxFQUFFLEdBQW9CLEVBQUUsQ0FBQztRQUMvQixNQUFNLEVBQUUsR0FBaUIsRUFBRSxDQUFDO1FBRTVCLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQzdDLElBQUksVUFBVSxDQUFDLElBQUksSUFBSSxVQUFVLENBQUMsS0FBSyxJQUFJLHNCQUFlLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3pGLDhEQUE4RDtnQkFDOUQsa0VBQWtFO2dCQUNsRSxxQkFBcUI7Z0JBQ3JCLElBQUksVUFBVSxDQUFDLElBQUksS0FBSyxvQ0FBb0MsQ0FBQyxJQUFJLEVBQUU7b0JBQ2pFLE9BQU87aUJBQ1I7Z0JBQ0QsTUFBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDbkUsSUFBSSxJQUFJLEVBQUU7b0JBQ1IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO29CQUNyQyxFQUFFLENBQUMsSUFBSSxDQUFDO3dCQUNOLFdBQVcsRUFBRSx5QkFBeUIsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDO3dCQUM5RCxRQUFRLEVBQUUsVUFBVSxDQUFDLFFBQVEsRUFBRSxJQUFJO3dCQUNuQyxNQUFNLEVBQUUsWUFBTTt3QkFDZCxJQUFJLEVBQUUsd0JBQWtCO3FCQUN6QixDQUFDLENBQUM7aUJBQ0o7YUFDRjtpQkFBTTtnQkFDTCxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3JCO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLEVBQUMsRUFBRSxFQUFFLEVBQUUsRUFBQyxDQUFDO0lBQ2xCLENBQUM7SUE3QkQsb0RBNkJDO0lBRUQsU0FBUyxZQUFZLENBQUMsSUFBbUIsRUFBRSxNQUFxQixFQUFFLEtBQWE7UUFFN0UsTUFBTSxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUMsR0FBRyxFQUFFLENBQUMsNkJBQTZCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzFFLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFFRCxTQUFTLHlCQUF5QixDQUFDLE9BQTJDO1FBQzVFLE9BQU8sRUFBRSxDQUFDLDRCQUE0QixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN4RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1BhcnNlU291cmNlU3Bhbn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7REVGQVVMVF9FUlJPUl9DT0RFLCBEaWFnbm9zdGljLCBTT1VSQ0V9IGZyb20gJy4uL3RyYW5zZm9ybWVycy9hcGknO1xuaW1wb3J0IHtHRU5FUkFURURfRklMRVN9IGZyb20gJy4uL3RyYW5zZm9ybWVycy91dGlsJztcblxuZXhwb3J0IGludGVyZmFjZSBUeXBlQ2hlY2tIb3N0IHtcbiAgcGFyc2VTb3VyY2VTcGFuT2YoZmlsZU5hbWU6IHN0cmluZywgbGluZTogbnVtYmVyLCBjaGFyYWN0ZXI6IG51bWJlcik6IFBhcnNlU291cmNlU3BhbnxudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNsYXRlRGlhZ25vc3RpY3MoXG4gICAgaG9zdDogVHlwZUNoZWNrSG9zdCwgdW50cmFuc2xhdGVkRGlhZ25vc3RpY3M6IFJlYWRvbmx5QXJyYXk8dHMuRGlhZ25vc3RpYz4pOlxuICAgIHt0czogdHMuRGlhZ25vc3RpY1tdLCBuZzogRGlhZ25vc3RpY1tdfSB7XG4gIGNvbnN0IHRzOiB0cy5EaWFnbm9zdGljW10gPSBbXTtcbiAgY29uc3Qgbmc6IERpYWdub3N0aWNbXSA9IFtdO1xuXG4gIHVudHJhbnNsYXRlZERpYWdub3N0aWNzLmZvckVhY2goKGRpYWdub3N0aWMpID0+IHtcbiAgICBpZiAoZGlhZ25vc3RpYy5maWxlICYmIGRpYWdub3N0aWMuc3RhcnQgJiYgR0VORVJBVEVEX0ZJTEVTLnRlc3QoZGlhZ25vc3RpYy5maWxlLmZpbGVOYW1lKSkge1xuICAgICAgLy8gV2UgbmVlZCB0byBmaWx0ZXIgb3V0IGRpYWdub3N0aWNzIGFib3V0IHVudXNlZCBmdW5jdGlvbnMgYXNcbiAgICAgIC8vIHRoZXkgYXJlIGluIGZhY3QgcmVmZXJlbmNlZCBieSBub2JvZHkgYW5kIG9ubHkgc2VydmUgdG8gc3VyZmFjZVxuICAgICAgLy8gdHlwZSBjaGVjayBlcnJvcnMuXG4gICAgICBpZiAoZGlhZ25vc3RpYy5jb2RlID09PSAvKiAuLi4gaXMgZGVjbGFyZWQgYnV0IG5ldmVyIHVzZWQgKi8gNjEzMykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBzcGFuID0gc291cmNlU3Bhbk9mKGhvc3QsIGRpYWdub3N0aWMuZmlsZSwgZGlhZ25vc3RpYy5zdGFydCk7XG4gICAgICBpZiAoc3Bhbikge1xuICAgICAgICBjb25zdCBmaWxlTmFtZSA9IHNwYW4uc3RhcnQuZmlsZS51cmw7XG4gICAgICAgIG5nLnB1c2goe1xuICAgICAgICAgIG1lc3NhZ2VUZXh0OiBkaWFnbm9zdGljTWVzc2FnZVRvU3RyaW5nKGRpYWdub3N0aWMubWVzc2FnZVRleHQpLFxuICAgICAgICAgIGNhdGVnb3J5OiBkaWFnbm9zdGljLmNhdGVnb3J5LCBzcGFuLFxuICAgICAgICAgIHNvdXJjZTogU09VUkNFLFxuICAgICAgICAgIGNvZGU6IERFRkFVTFRfRVJST1JfQ09ERVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdHMucHVzaChkaWFnbm9zdGljKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4ge3RzLCBuZ307XG59XG5cbmZ1bmN0aW9uIHNvdXJjZVNwYW5PZihob3N0OiBUeXBlQ2hlY2tIb3N0LCBzb3VyY2U6IHRzLlNvdXJjZUZpbGUsIHN0YXJ0OiBudW1iZXIpOiBQYXJzZVNvdXJjZVNwYW58XG4gICAgbnVsbCB7XG4gIGNvbnN0IHtsaW5lLCBjaGFyYWN0ZXJ9ID0gdHMuZ2V0TGluZUFuZENoYXJhY3Rlck9mUG9zaXRpb24oc291cmNlLCBzdGFydCk7XG4gIHJldHVybiBob3N0LnBhcnNlU291cmNlU3Bhbk9mKHNvdXJjZS5maWxlTmFtZSwgbGluZSwgY2hhcmFjdGVyKTtcbn1cblxuZnVuY3Rpb24gZGlhZ25vc3RpY01lc3NhZ2VUb1N0cmluZyhtZXNzYWdlOiB0cy5EaWFnbm9zdGljTWVzc2FnZUNoYWluIHwgc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHRzLmZsYXR0ZW5EaWFnbm9zdGljTWVzc2FnZVRleHQobWVzc2FnZSwgJ1xcbicpO1xufVxuIl19