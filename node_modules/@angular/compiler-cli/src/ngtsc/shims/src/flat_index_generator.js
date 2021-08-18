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
        define("@angular/compiler-cli/src/ngtsc/shims/src/flat_index_generator", ["require", "exports", "tslib", "path", "typescript", "@angular/compiler-cli/src/ngtsc/shims/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var path = require("path");
    var ts = require("typescript");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/shims/src/util");
    var FlatIndexGenerator = /** @class */ (function () {
        function FlatIndexGenerator(relativeFlatIndexPath, entryPoint, moduleName) {
            this.entryPoint = entryPoint;
            this.moduleName = moduleName;
            this.flatIndexPath = path.posix.join(path.posix.dirname(entryPoint), relativeFlatIndexPath)
                .replace(/\.js$/, '') +
                '.ts';
        }
        FlatIndexGenerator.forRootFiles = function (flatIndexPath, files, moduleName) {
            var e_1, _a;
            // If there's only one .ts file in the program, it's the entry. Otherwise, look for the shortest
            // (in terms of characters in the filename) file that ends in /index.ts. The second behavior is
            // deprecated; users should always explicitly specify a single .ts entrypoint.
            var tsFiles = files.filter(util_1.isNonDeclarationTsFile);
            if (tsFiles.length === 1) {
                return new FlatIndexGenerator(flatIndexPath, tsFiles[0], moduleName);
            }
            else {
                var indexFile = null;
                try {
                    for (var tsFiles_1 = tslib_1.__values(tsFiles), tsFiles_1_1 = tsFiles_1.next(); !tsFiles_1_1.done; tsFiles_1_1 = tsFiles_1.next()) {
                        var tsFile = tsFiles_1_1.value;
                        if (tsFile.endsWith('/index.ts') &&
                            (indexFile === null || tsFile.length <= indexFile.length)) {
                            indexFile = tsFile;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (tsFiles_1_1 && !tsFiles_1_1.done && (_a = tsFiles_1.return)) _a.call(tsFiles_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                if (indexFile !== null) {
                    return new FlatIndexGenerator(flatIndexPath, indexFile, moduleName);
                }
                else {
                    return null;
                }
            }
        };
        FlatIndexGenerator.prototype.recognize = function (fileName) { return fileName === this.flatIndexPath; };
        FlatIndexGenerator.prototype.generate = function () {
            var relativeEntryPoint = './' +
                path.posix.relative(path.posix.dirname(this.flatIndexPath), this.entryPoint)
                    .replace(/\.tsx?$/, '');
            var contents = "/**\n * Generated bundle index. Do not edit.\n */\n\nexport * from '" + relativeEntryPoint + "';\n";
            var genFile = ts.createSourceFile(this.flatIndexPath, contents, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);
            if (this.moduleName !== null) {
                genFile.moduleName = this.moduleName;
            }
            return genFile;
        };
        return FlatIndexGenerator;
    }());
    exports.FlatIndexGenerator = FlatIndexGenerator;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhdF9pbmRleF9nZW5lcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3NoaW1zL3NyYy9mbGF0X2luZGV4X2dlbmVyYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCwyQkFBNkI7SUFDN0IsK0JBQWlDO0lBR2pDLHVFQUE4QztJQUU5QztRQUdFLDRCQUNJLHFCQUE2QixFQUFXLFVBQWtCLEVBQ2pELFVBQXVCO1lBRFEsZUFBVSxHQUFWLFVBQVUsQ0FBUTtZQUNqRCxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ2xDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUscUJBQXFCLENBQUM7aUJBQ2pFLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO2dCQUMxQyxLQUFLLENBQUM7UUFDWixDQUFDO1FBRU0sK0JBQVksR0FBbkIsVUFBb0IsYUFBcUIsRUFBRSxLQUE0QixFQUFFLFVBQXVCOztZQUU5RixnR0FBZ0c7WUFDaEcsK0ZBQStGO1lBQy9GLDhFQUE4RTtZQUM5RSxJQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLDZCQUFzQixDQUFDLENBQUM7WUFDckQsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDeEIsT0FBTyxJQUFJLGtCQUFrQixDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7YUFDdEU7aUJBQU07Z0JBQ0wsSUFBSSxTQUFTLEdBQWdCLElBQUksQ0FBQzs7b0JBQ2xDLEtBQXFCLElBQUEsWUFBQSxpQkFBQSxPQUFPLENBQUEsZ0NBQUEscURBQUU7d0JBQXpCLElBQU0sTUFBTSxvQkFBQTt3QkFDZixJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDOzRCQUM1QixDQUFDLFNBQVMsS0FBSyxJQUFJLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUU7NEJBQzdELFNBQVMsR0FBRyxNQUFNLENBQUM7eUJBQ3BCO3FCQUNGOzs7Ozs7Ozs7Z0JBQ0QsSUFBSSxTQUFTLEtBQUssSUFBSSxFQUFFO29CQUN0QixPQUFPLElBQUksa0JBQWtCLENBQUMsYUFBYSxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztpQkFDckU7cUJBQU07b0JBQ0wsT0FBTyxJQUFJLENBQUM7aUJBQ2I7YUFDRjtRQUNILENBQUM7UUFFRCxzQ0FBUyxHQUFULFVBQVUsUUFBZ0IsSUFBYSxPQUFPLFFBQVEsS0FBSyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUVoRixxQ0FBUSxHQUFSO1lBQ0UsSUFBTSxrQkFBa0IsR0FBRyxJQUFJO2dCQUMzQixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQztxQkFDdkUsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUVoQyxJQUFNLFFBQVEsR0FBRyx5RUFJSixrQkFBa0IsU0FDbEMsQ0FBQztZQUNFLElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FDL0IsSUFBSSxDQUFDLGFBQWEsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbEYsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLElBQUksRUFBRTtnQkFDNUIsT0FBTyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO2FBQ3RDO1lBQ0QsT0FBTyxPQUFPLENBQUM7UUFDakIsQ0FBQztRQUNILHlCQUFDO0lBQUQsQ0FBQyxBQXZERCxJQXVEQztJQXZEWSxnREFBa0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtTaGltR2VuZXJhdG9yfSBmcm9tICcuL2hvc3QnO1xuaW1wb3J0IHtpc05vbkRlY2xhcmF0aW9uVHNGaWxlfSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgY2xhc3MgRmxhdEluZGV4R2VuZXJhdG9yIGltcGxlbWVudHMgU2hpbUdlbmVyYXRvciB7XG4gIHJlYWRvbmx5IGZsYXRJbmRleFBhdGg6IHN0cmluZztcblxuICBwcml2YXRlIGNvbnN0cnVjdG9yKFxuICAgICAgcmVsYXRpdmVGbGF0SW5kZXhQYXRoOiBzdHJpbmcsIHJlYWRvbmx5IGVudHJ5UG9pbnQ6IHN0cmluZyxcbiAgICAgIHJlYWRvbmx5IG1vZHVsZU5hbWU6IHN0cmluZ3xudWxsKSB7XG4gICAgdGhpcy5mbGF0SW5kZXhQYXRoID0gcGF0aC5wb3NpeC5qb2luKHBhdGgucG9zaXguZGlybmFtZShlbnRyeVBvaW50KSwgcmVsYXRpdmVGbGF0SW5kZXhQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwuanMkLywgJycpICtcbiAgICAgICAgJy50cyc7XG4gIH1cblxuICBzdGF0aWMgZm9yUm9vdEZpbGVzKGZsYXRJbmRleFBhdGg6IHN0cmluZywgZmlsZXM6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPiwgbW9kdWxlTmFtZTogc3RyaW5nfG51bGwpOlxuICAgICAgRmxhdEluZGV4R2VuZXJhdG9yfG51bGwge1xuICAgIC8vIElmIHRoZXJlJ3Mgb25seSBvbmUgLnRzIGZpbGUgaW4gdGhlIHByb2dyYW0sIGl0J3MgdGhlIGVudHJ5LiBPdGhlcndpc2UsIGxvb2sgZm9yIHRoZSBzaG9ydGVzdFxuICAgIC8vIChpbiB0ZXJtcyBvZiBjaGFyYWN0ZXJzIGluIHRoZSBmaWxlbmFtZSkgZmlsZSB0aGF0IGVuZHMgaW4gL2luZGV4LnRzLiBUaGUgc2Vjb25kIGJlaGF2aW9yIGlzXG4gICAgLy8gZGVwcmVjYXRlZDsgdXNlcnMgc2hvdWxkIGFsd2F5cyBleHBsaWNpdGx5IHNwZWNpZnkgYSBzaW5nbGUgLnRzIGVudHJ5cG9pbnQuXG4gICAgY29uc3QgdHNGaWxlcyA9IGZpbGVzLmZpbHRlcihpc05vbkRlY2xhcmF0aW9uVHNGaWxlKTtcbiAgICBpZiAodHNGaWxlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHJldHVybiBuZXcgRmxhdEluZGV4R2VuZXJhdG9yKGZsYXRJbmRleFBhdGgsIHRzRmlsZXNbMF0sIG1vZHVsZU5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgaW5kZXhGaWxlOiBzdHJpbmd8bnVsbCA9IG51bGw7XG4gICAgICBmb3IgKGNvbnN0IHRzRmlsZSBvZiB0c0ZpbGVzKSB7XG4gICAgICAgIGlmICh0c0ZpbGUuZW5kc1dpdGgoJy9pbmRleC50cycpICYmXG4gICAgICAgICAgICAoaW5kZXhGaWxlID09PSBudWxsIHx8IHRzRmlsZS5sZW5ndGggPD0gaW5kZXhGaWxlLmxlbmd0aCkpIHtcbiAgICAgICAgICBpbmRleEZpbGUgPSB0c0ZpbGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChpbmRleEZpbGUgIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGbGF0SW5kZXhHZW5lcmF0b3IoZmxhdEluZGV4UGF0aCwgaW5kZXhGaWxlLCBtb2R1bGVOYW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlY29nbml6ZShmaWxlTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7IHJldHVybiBmaWxlTmFtZSA9PT0gdGhpcy5mbGF0SW5kZXhQYXRoOyB9XG5cbiAgZ2VuZXJhdGUoKTogdHMuU291cmNlRmlsZSB7XG4gICAgY29uc3QgcmVsYXRpdmVFbnRyeVBvaW50ID0gJy4vJyArXG4gICAgICAgIHBhdGgucG9zaXgucmVsYXRpdmUocGF0aC5wb3NpeC5kaXJuYW1lKHRoaXMuZmxhdEluZGV4UGF0aCksIHRoaXMuZW50cnlQb2ludClcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXC50c3g/JC8sICcnKTtcblxuICAgIGNvbnN0IGNvbnRlbnRzID0gYC8qKlxuICogR2VuZXJhdGVkIGJ1bmRsZSBpbmRleC4gRG8gbm90IGVkaXQuXG4gKi9cblxuZXhwb3J0ICogZnJvbSAnJHtyZWxhdGl2ZUVudHJ5UG9pbnR9JztcbmA7XG4gICAgY29uc3QgZ2VuRmlsZSA9IHRzLmNyZWF0ZVNvdXJjZUZpbGUoXG4gICAgICAgIHRoaXMuZmxhdEluZGV4UGF0aCwgY29udGVudHMsIHRzLlNjcmlwdFRhcmdldC5FUzIwMTUsIHRydWUsIHRzLlNjcmlwdEtpbmQuVFMpO1xuICAgIGlmICh0aGlzLm1vZHVsZU5hbWUgIT09IG51bGwpIHtcbiAgICAgIGdlbkZpbGUubW9kdWxlTmFtZSA9IHRoaXMubW9kdWxlTmFtZTtcbiAgICB9XG4gICAgcmV0dXJuIGdlbkZpbGU7XG4gIH1cbn1cbiJdfQ==