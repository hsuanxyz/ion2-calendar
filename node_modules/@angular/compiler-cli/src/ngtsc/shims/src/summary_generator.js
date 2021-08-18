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
        define("@angular/compiler-cli/src/ngtsc/shims/src/summary_generator", ["require", "exports", "typescript", "@angular/compiler-cli/src/ngtsc/util/src/path", "@angular/compiler-cli/src/ngtsc/shims/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ts = require("typescript");
    var path_1 = require("@angular/compiler-cli/src/ngtsc/util/src/path");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/shims/src/util");
    var SummaryGenerator = /** @class */ (function () {
        function SummaryGenerator(map) {
            this.map = map;
        }
        SummaryGenerator.prototype.getSummaryFileNames = function () { return Array.from(this.map.keys()); };
        SummaryGenerator.prototype.recognize = function (fileName) { return this.map.has(fileName); };
        SummaryGenerator.prototype.generate = function (genFilePath, readFile) {
            var originalPath = this.map.get(genFilePath);
            var original = readFile(originalPath);
            if (original === null) {
                return null;
            }
            // Collect a list of classes that need to have factory types emitted for them. This list is
            // overly broad as at this point the ts.TypeChecker has not been created and so it can't be used
            // to semantically understand which decorators are Angular decorators. It's okay to output an
            // overly broad set of summary exports as the exports are no-ops anyway, and summaries are a
            // compatibility layer which will be removed after Ivy is enabled.
            var symbolNames = original
                .statements
                // Pick out top level class declarations...
                .filter(ts.isClassDeclaration)
                // which are named, exported, and have decorators.
                .filter(function (decl) { return isExported(decl) && decl.decorators !== undefined &&
                decl.name !== undefined; })
                // Grab the symbol name.
                .map(function (decl) { return decl.name.text; });
            var varLines = symbolNames.map(function (name) { return "export const " + name + "NgSummary: any = null;"; });
            if (varLines.length === 0) {
                // In the event there are no other exports, add an empty export to ensure the generated
                // summary file is still an ES module.
                varLines.push("export const \u0275empty = null;");
            }
            var sourceText = varLines.join('\n');
            var genFile = ts.createSourceFile(genFilePath, sourceText, original.languageVersion, true, ts.ScriptKind.TS);
            if (original.moduleName !== undefined) {
                genFile.moduleName =
                    util_1.generatedModuleName(original.moduleName, original.fileName, '.ngsummary');
            }
            return genFile;
        };
        SummaryGenerator.forRootFiles = function (files) {
            var map = new Map();
            files.filter(function (sourceFile) { return util_1.isNonDeclarationTsFile(sourceFile); })
                .map(function (sourceFile) { return path_1.normalizeSeparators(sourceFile); })
                .forEach(function (sourceFile) { return map.set(sourceFile.replace(/\.ts$/, '.ngsummary.ts'), sourceFile); });
            return new SummaryGenerator(map);
        };
        return SummaryGenerator;
    }());
    exports.SummaryGenerator = SummaryGenerator;
    function isExported(decl) {
        return decl.modifiers !== undefined &&
            decl.modifiers.some(function (mod) { return mod.kind == ts.SyntaxKind.ExportKeyword; });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VtbWFyeV9nZW5lcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3NoaW1zL3NyYy9zdW1tYXJ5X2dlbmVyYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILCtCQUFpQztJQUVqQyxzRUFBd0Q7SUFHeEQsdUVBQW1FO0lBRW5FO1FBQ0UsMEJBQTRCLEdBQXdCO1lBQXhCLFFBQUcsR0FBSCxHQUFHLENBQXFCO1FBQUcsQ0FBQztRQUV4RCw4Q0FBbUIsR0FBbkIsY0FBa0MsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFdkUsb0NBQVMsR0FBVCxVQUFVLFFBQWdCLElBQWEsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFdkUsbUNBQVEsR0FBUixVQUFTLFdBQW1CLEVBQUUsUUFBb0Q7WUFFaEYsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFHLENBQUM7WUFDakQsSUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3hDLElBQUksUUFBUSxLQUFLLElBQUksRUFBRTtnQkFDckIsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUVELDJGQUEyRjtZQUMzRixnR0FBZ0c7WUFDaEcsNkZBQTZGO1lBQzdGLDRGQUE0RjtZQUM1RixrRUFBa0U7WUFDbEUsSUFBTSxXQUFXLEdBQUcsUUFBUTtpQkFDSCxVQUFVO2dCQUNYLDJDQUEyQztpQkFDMUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQztnQkFDOUIsa0RBQWtEO2lCQUNqRCxNQUFNLENBQ0gsVUFBQSxJQUFJLElBQUksT0FBQSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxTQUFTO2dCQUNyRCxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFEbkIsQ0FDbUIsQ0FBQztnQkFDaEMsd0JBQXdCO2lCQUN2QixHQUFHLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsSUFBTSxDQUFDLElBQUksRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFDO1lBRXZELElBQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxrQkFBZ0IsSUFBSSwyQkFBd0IsRUFBNUMsQ0FBNEMsQ0FBQyxDQUFDO1lBRXZGLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3pCLHVGQUF1RjtnQkFDdkYsc0NBQXNDO2dCQUN0QyxRQUFRLENBQUMsSUFBSSxDQUFDLGtDQUE2QixDQUFDLENBQUM7YUFDOUM7WUFDRCxJQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZDLElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FDL0IsV0FBVyxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsZUFBZSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQy9FLElBQUksUUFBUSxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUU7Z0JBQ3JDLE9BQU8sQ0FBQyxVQUFVO29CQUNkLDBCQUFtQixDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQzthQUMvRTtZQUNELE9BQU8sT0FBTyxDQUFDO1FBQ2pCLENBQUM7UUFFTSw2QkFBWSxHQUFuQixVQUFvQixLQUE0QjtZQUM5QyxJQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztZQUN0QyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQUEsVUFBVSxJQUFJLE9BQUEsNkJBQXNCLENBQUMsVUFBVSxDQUFDLEVBQWxDLENBQWtDLENBQUM7aUJBQ3pELEdBQUcsQ0FBQyxVQUFBLFVBQVUsSUFBSSxPQUFBLDBCQUFtQixDQUFDLFVBQVUsQ0FBQyxFQUEvQixDQUErQixDQUFDO2lCQUNsRCxPQUFPLENBQUMsVUFBQSxVQUFVLElBQUksT0FBQSxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLGVBQWUsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxFQUFqRSxDQUFpRSxDQUFDLENBQUM7WUFDOUYsT0FBTyxJQUFJLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFDSCx1QkFBQztJQUFELENBQUMsQUF2REQsSUF1REM7SUF2RFksNENBQWdCO0lBeUQ3QixTQUFTLFVBQVUsQ0FBQyxJQUFvQjtRQUN0QyxPQUFPLElBQUksQ0FBQyxTQUFTLEtBQUssU0FBUztZQUMvQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQXZDLENBQXVDLENBQUMsQ0FBQztJQUMxRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtub3JtYWxpemVTZXBhcmF0b3JzfSBmcm9tICcuLi8uLi91dGlsL3NyYy9wYXRoJztcblxuaW1wb3J0IHtTaGltR2VuZXJhdG9yfSBmcm9tICcuL2hvc3QnO1xuaW1wb3J0IHtnZW5lcmF0ZWRNb2R1bGVOYW1lLCBpc05vbkRlY2xhcmF0aW9uVHNGaWxlfSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgY2xhc3MgU3VtbWFyeUdlbmVyYXRvciBpbXBsZW1lbnRzIFNoaW1HZW5lcmF0b3Ige1xuICBwcml2YXRlIGNvbnN0cnVjdG9yKHByaXZhdGUgbWFwOiBNYXA8c3RyaW5nLCBzdHJpbmc+KSB7fVxuXG4gIGdldFN1bW1hcnlGaWxlTmFtZXMoKTogc3RyaW5nW10geyByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLm1hcC5rZXlzKCkpOyB9XG5cbiAgcmVjb2duaXplKGZpbGVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMubWFwLmhhcyhmaWxlTmFtZSk7IH1cblxuICBnZW5lcmF0ZShnZW5GaWxlUGF0aDogc3RyaW5nLCByZWFkRmlsZTogKGZpbGVOYW1lOiBzdHJpbmcpID0+IHRzLlNvdXJjZUZpbGUgfCBudWxsKTogdHMuU291cmNlRmlsZVxuICAgICAgfG51bGwge1xuICAgIGNvbnN0IG9yaWdpbmFsUGF0aCA9IHRoaXMubWFwLmdldChnZW5GaWxlUGF0aCkgITtcbiAgICBjb25zdCBvcmlnaW5hbCA9IHJlYWRGaWxlKG9yaWdpbmFsUGF0aCk7XG4gICAgaWYgKG9yaWdpbmFsID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBDb2xsZWN0IGEgbGlzdCBvZiBjbGFzc2VzIHRoYXQgbmVlZCB0byBoYXZlIGZhY3RvcnkgdHlwZXMgZW1pdHRlZCBmb3IgdGhlbS4gVGhpcyBsaXN0IGlzXG4gICAgLy8gb3Zlcmx5IGJyb2FkIGFzIGF0IHRoaXMgcG9pbnQgdGhlIHRzLlR5cGVDaGVja2VyIGhhcyBub3QgYmVlbiBjcmVhdGVkIGFuZCBzbyBpdCBjYW4ndCBiZSB1c2VkXG4gICAgLy8gdG8gc2VtYW50aWNhbGx5IHVuZGVyc3RhbmQgd2hpY2ggZGVjb3JhdG9ycyBhcmUgQW5ndWxhciBkZWNvcmF0b3JzLiBJdCdzIG9rYXkgdG8gb3V0cHV0IGFuXG4gICAgLy8gb3Zlcmx5IGJyb2FkIHNldCBvZiBzdW1tYXJ5IGV4cG9ydHMgYXMgdGhlIGV4cG9ydHMgYXJlIG5vLW9wcyBhbnl3YXksIGFuZCBzdW1tYXJpZXMgYXJlIGFcbiAgICAvLyBjb21wYXRpYmlsaXR5IGxheWVyIHdoaWNoIHdpbGwgYmUgcmVtb3ZlZCBhZnRlciBJdnkgaXMgZW5hYmxlZC5cbiAgICBjb25zdCBzeW1ib2xOYW1lcyA9IG9yaWdpbmFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN0YXRlbWVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQaWNrIG91dCB0b3AgbGV2ZWwgY2xhc3MgZGVjbGFyYXRpb25zLi4uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcih0cy5pc0NsYXNzRGVjbGFyYXRpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2hpY2ggYXJlIG5hbWVkLCBleHBvcnRlZCwgYW5kIGhhdmUgZGVjb3JhdG9ycy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNsID0+IGlzRXhwb3J0ZWQoZGVjbCkgJiYgZGVjbC5kZWNvcmF0b3JzICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlY2wubmFtZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdyYWIgdGhlIHN5bWJvbCBuYW1lLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoZGVjbCA9PiBkZWNsLm5hbWUgIS50ZXh0KTtcblxuICAgIGNvbnN0IHZhckxpbmVzID0gc3ltYm9sTmFtZXMubWFwKG5hbWUgPT4gYGV4cG9ydCBjb25zdCAke25hbWV9TmdTdW1tYXJ5OiBhbnkgPSBudWxsO2ApO1xuXG4gICAgaWYgKHZhckxpbmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgLy8gSW4gdGhlIGV2ZW50IHRoZXJlIGFyZSBubyBvdGhlciBleHBvcnRzLCBhZGQgYW4gZW1wdHkgZXhwb3J0IHRvIGVuc3VyZSB0aGUgZ2VuZXJhdGVkXG4gICAgICAvLyBzdW1tYXJ5IGZpbGUgaXMgc3RpbGwgYW4gRVMgbW9kdWxlLlxuICAgICAgdmFyTGluZXMucHVzaChgZXhwb3J0IGNvbnN0IMm1ZW1wdHkgPSBudWxsO2ApO1xuICAgIH1cbiAgICBjb25zdCBzb3VyY2VUZXh0ID0gdmFyTGluZXMuam9pbignXFxuJyk7XG4gICAgY29uc3QgZ2VuRmlsZSA9IHRzLmNyZWF0ZVNvdXJjZUZpbGUoXG4gICAgICAgIGdlbkZpbGVQYXRoLCBzb3VyY2VUZXh0LCBvcmlnaW5hbC5sYW5ndWFnZVZlcnNpb24sIHRydWUsIHRzLlNjcmlwdEtpbmQuVFMpO1xuICAgIGlmIChvcmlnaW5hbC5tb2R1bGVOYW1lICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGdlbkZpbGUubW9kdWxlTmFtZSA9XG4gICAgICAgICAgZ2VuZXJhdGVkTW9kdWxlTmFtZShvcmlnaW5hbC5tb2R1bGVOYW1lLCBvcmlnaW5hbC5maWxlTmFtZSwgJy5uZ3N1bW1hcnknKTtcbiAgICB9XG4gICAgcmV0dXJuIGdlbkZpbGU7XG4gIH1cblxuICBzdGF0aWMgZm9yUm9vdEZpbGVzKGZpbGVzOiBSZWFkb25seUFycmF5PHN0cmluZz4pOiBTdW1tYXJ5R2VuZXJhdG9yIHtcbiAgICBjb25zdCBtYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICAgIGZpbGVzLmZpbHRlcihzb3VyY2VGaWxlID0+IGlzTm9uRGVjbGFyYXRpb25Uc0ZpbGUoc291cmNlRmlsZSkpXG4gICAgICAgIC5tYXAoc291cmNlRmlsZSA9PiBub3JtYWxpemVTZXBhcmF0b3JzKHNvdXJjZUZpbGUpKVxuICAgICAgICAuZm9yRWFjaChzb3VyY2VGaWxlID0+IG1hcC5zZXQoc291cmNlRmlsZS5yZXBsYWNlKC9cXC50cyQvLCAnLm5nc3VtbWFyeS50cycpLCBzb3VyY2VGaWxlKSk7XG4gICAgcmV0dXJuIG5ldyBTdW1tYXJ5R2VuZXJhdG9yKG1hcCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNFeHBvcnRlZChkZWNsOiB0cy5EZWNsYXJhdGlvbik6IGJvb2xlYW4ge1xuICByZXR1cm4gZGVjbC5tb2RpZmllcnMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgZGVjbC5tb2RpZmllcnMuc29tZShtb2QgPT4gbW9kLmtpbmQgPT0gdHMuU3ludGF4S2luZC5FeHBvcnRLZXl3b3JkKTtcbn1cbiJdfQ==