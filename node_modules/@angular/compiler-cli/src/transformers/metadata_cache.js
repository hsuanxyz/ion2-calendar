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
        define("@angular/compiler-cli/src/transformers/metadata_cache", ["require", "exports", "typescript", "@angular/compiler-cli/src/transformers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ts = require("typescript");
    const util_1 = require("@angular/compiler-cli/src/transformers/util");
    /**
     * Cache, and potentially transform, metadata as it is being collected.
     */
    class MetadataCache {
        constructor(collector, strict, transformers) {
            this.collector = collector;
            this.strict = strict;
            this.transformers = transformers;
            this.metadataCache = new Map();
            for (let transformer of transformers) {
                if (transformer.connect) {
                    transformer.connect(this);
                }
            }
        }
        getMetadata(sourceFile) {
            if (this.metadataCache.has(sourceFile.fileName)) {
                return this.metadataCache.get(sourceFile.fileName);
            }
            let substitute = undefined;
            // Only process transformers on modules that are not declaration files.
            const declarationFile = sourceFile.isDeclarationFile;
            const moduleFile = ts.isExternalModule(sourceFile);
            if (!declarationFile && moduleFile) {
                for (let transform of this.transformers) {
                    const transformSubstitute = transform.start(sourceFile);
                    if (transformSubstitute) {
                        if (substitute) {
                            const previous = substitute;
                            substitute = (value, node) => transformSubstitute(previous(value, node), node);
                        }
                        else {
                            substitute = transformSubstitute;
                        }
                    }
                }
            }
            const isTsFile = util_1.TS.test(sourceFile.fileName);
            const result = this.collector.getMetadata(sourceFile, this.strict && isTsFile, substitute);
            this.metadataCache.set(sourceFile.fileName, result);
            return result;
        }
    }
    exports.MetadataCache = MetadataCache;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGFfY2FjaGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL3RyYW5zZm9ybWVycy9tZXRhZGF0YV9jYWNoZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILGlDQUFpQztJQUtqQyxzRUFBMEI7SUFTMUI7O09BRUc7SUFDSCxNQUFhLGFBQWE7UUFHeEIsWUFDWSxTQUE0QixFQUFtQixNQUFlLEVBQzlELFlBQW1DO1lBRG5DLGNBQVMsR0FBVCxTQUFTLENBQW1CO1lBQW1CLFdBQU0sR0FBTixNQUFNLENBQVM7WUFDOUQsaUJBQVksR0FBWixZQUFZLENBQXVCO1lBSnZDLGtCQUFhLEdBQUcsSUFBSSxHQUFHLEVBQW9DLENBQUM7WUFLbEUsS0FBSyxJQUFJLFdBQVcsSUFBSSxZQUFZLEVBQUU7Z0JBQ3BDLElBQUksV0FBVyxDQUFDLE9BQU8sRUFBRTtvQkFDdkIsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDM0I7YUFDRjtRQUNILENBQUM7UUFFRCxXQUFXLENBQUMsVUFBeUI7WUFDbkMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQy9DLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ3BEO1lBQ0QsSUFBSSxVQUFVLEdBQTZCLFNBQVMsQ0FBQztZQUVyRCx1RUFBdUU7WUFDdkUsTUFBTSxlQUFlLEdBQUcsVUFBVSxDQUFDLGlCQUFpQixDQUFDO1lBQ3JELE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsZUFBZSxJQUFJLFVBQVUsRUFBRTtnQkFDbEMsS0FBSyxJQUFJLFNBQVMsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO29CQUN2QyxNQUFNLG1CQUFtQixHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ3hELElBQUksbUJBQW1CLEVBQUU7d0JBQ3ZCLElBQUksVUFBVSxFQUFFOzRCQUNkLE1BQU0sUUFBUSxHQUFtQixVQUFVLENBQUM7NEJBQzVDLFVBQVUsR0FBRyxDQUFDLEtBQW9CLEVBQUUsSUFBYSxFQUFFLEVBQUUsQ0FDakQsbUJBQW1CLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQzt5QkFDdEQ7NkJBQU07NEJBQ0wsVUFBVSxHQUFHLG1CQUFtQixDQUFDO3lCQUNsQztxQkFDRjtpQkFDRjthQUNGO1lBRUQsTUFBTSxRQUFRLEdBQUcsU0FBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDOUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLElBQUksUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzNGLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDcEQsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztLQUNGO0lBMUNELHNDQTBDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7TWV0YWRhdGFDb2xsZWN0b3IsIE1ldGFkYXRhVmFsdWUsIE1vZHVsZU1ldGFkYXRhfSBmcm9tICcuLi9tZXRhZGF0YS9pbmRleCc7XG5cbmltcG9ydCB7TWV0YWRhdGFQcm92aWRlcn0gZnJvbSAnLi9jb21waWxlcl9ob3N0JztcbmltcG9ydCB7VFN9IGZyb20gJy4vdXRpbCc7XG5cbmV4cG9ydCB0eXBlIFZhbHVlVHJhbnNmb3JtID0gKHZhbHVlOiBNZXRhZGF0YVZhbHVlLCBub2RlOiB0cy5Ob2RlKSA9PiBNZXRhZGF0YVZhbHVlO1xuXG5leHBvcnQgaW50ZXJmYWNlIE1ldGFkYXRhVHJhbnNmb3JtZXIge1xuICBjb25uZWN0PyhjYWNoZTogTWV0YWRhdGFDYWNoZSk6IHZvaWQ7XG4gIHN0YXJ0KHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpOiBWYWx1ZVRyYW5zZm9ybXx1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogQ2FjaGUsIGFuZCBwb3RlbnRpYWxseSB0cmFuc2Zvcm0sIG1ldGFkYXRhIGFzIGl0IGlzIGJlaW5nIGNvbGxlY3RlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIE1ldGFkYXRhQ2FjaGUgaW1wbGVtZW50cyBNZXRhZGF0YVByb3ZpZGVyIHtcbiAgcHJpdmF0ZSBtZXRhZGF0YUNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIE1vZHVsZU1ldGFkYXRhfHVuZGVmaW5lZD4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgY29sbGVjdG9yOiBNZXRhZGF0YUNvbGxlY3RvciwgcHJpdmF0ZSByZWFkb25seSBzdHJpY3Q6IGJvb2xlYW4sXG4gICAgICBwcml2YXRlIHRyYW5zZm9ybWVyczogTWV0YWRhdGFUcmFuc2Zvcm1lcltdKSB7XG4gICAgZm9yIChsZXQgdHJhbnNmb3JtZXIgb2YgdHJhbnNmb3JtZXJzKSB7XG4gICAgICBpZiAodHJhbnNmb3JtZXIuY29ubmVjdCkge1xuICAgICAgICB0cmFuc2Zvcm1lci5jb25uZWN0KHRoaXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldE1ldGFkYXRhKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpOiBNb2R1bGVNZXRhZGF0YXx1bmRlZmluZWQge1xuICAgIGlmICh0aGlzLm1ldGFkYXRhQ2FjaGUuaGFzKHNvdXJjZUZpbGUuZmlsZU5hbWUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5tZXRhZGF0YUNhY2hlLmdldChzb3VyY2VGaWxlLmZpbGVOYW1lKTtcbiAgICB9XG4gICAgbGV0IHN1YnN0aXR1dGU6IFZhbHVlVHJhbnNmb3JtfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAgIC8vIE9ubHkgcHJvY2VzcyB0cmFuc2Zvcm1lcnMgb24gbW9kdWxlcyB0aGF0IGFyZSBub3QgZGVjbGFyYXRpb24gZmlsZXMuXG4gICAgY29uc3QgZGVjbGFyYXRpb25GaWxlID0gc291cmNlRmlsZS5pc0RlY2xhcmF0aW9uRmlsZTtcbiAgICBjb25zdCBtb2R1bGVGaWxlID0gdHMuaXNFeHRlcm5hbE1vZHVsZShzb3VyY2VGaWxlKTtcbiAgICBpZiAoIWRlY2xhcmF0aW9uRmlsZSAmJiBtb2R1bGVGaWxlKSB7XG4gICAgICBmb3IgKGxldCB0cmFuc2Zvcm0gb2YgdGhpcy50cmFuc2Zvcm1lcnMpIHtcbiAgICAgICAgY29uc3QgdHJhbnNmb3JtU3Vic3RpdHV0ZSA9IHRyYW5zZm9ybS5zdGFydChzb3VyY2VGaWxlKTtcbiAgICAgICAgaWYgKHRyYW5zZm9ybVN1YnN0aXR1dGUpIHtcbiAgICAgICAgICBpZiAoc3Vic3RpdHV0ZSkge1xuICAgICAgICAgICAgY29uc3QgcHJldmlvdXM6IFZhbHVlVHJhbnNmb3JtID0gc3Vic3RpdHV0ZTtcbiAgICAgICAgICAgIHN1YnN0aXR1dGUgPSAodmFsdWU6IE1ldGFkYXRhVmFsdWUsIG5vZGU6IHRzLk5vZGUpID0+XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtU3Vic3RpdHV0ZShwcmV2aW91cyh2YWx1ZSwgbm9kZSksIG5vZGUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdWJzdGl0dXRlID0gdHJhbnNmb3JtU3Vic3RpdHV0ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpc1RzRmlsZSA9IFRTLnRlc3Qoc291cmNlRmlsZS5maWxlTmFtZSk7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5jb2xsZWN0b3IuZ2V0TWV0YWRhdGEoc291cmNlRmlsZSwgdGhpcy5zdHJpY3QgJiYgaXNUc0ZpbGUsIHN1YnN0aXR1dGUpO1xuICAgIHRoaXMubWV0YWRhdGFDYWNoZS5zZXQoc291cmNlRmlsZS5maWxlTmFtZSwgcmVzdWx0KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59Il19