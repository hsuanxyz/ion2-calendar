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
        define("@angular/compiler-cli/src/transformers/r3_metadata_transform", ["require", "exports", "@angular/compiler", "typescript", "@angular/compiler-cli/src/metadata/index"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const compiler_1 = require("@angular/compiler");
    const ts = require("typescript");
    const index_1 = require("@angular/compiler-cli/src/metadata/index");
    class PartialModuleMetadataTransformer {
        constructor(modules) {
            this.moduleMap = new Map(modules.map(m => [m.fileName, m]));
        }
        start(sourceFile) {
            const partialModule = this.moduleMap.get(sourceFile.fileName);
            if (partialModule) {
                const classMap = new Map(partialModule.statements.filter(isClassStmt).map(s => [s.name, s]));
                if (classMap.size > 0) {
                    return (value, node) => {
                        // For class metadata that is going to be transformed to have a static method ensure the
                        // metadata contains a static declaration the new static method.
                        if (index_1.isClassMetadata(value) && node.kind === ts.SyntaxKind.ClassDeclaration) {
                            const classDeclaration = node;
                            if (classDeclaration.name) {
                                const partialClass = classMap.get(classDeclaration.name.text);
                                if (partialClass) {
                                    for (const field of partialClass.fields) {
                                        if (field.name && field.modifiers &&
                                            field.modifiers.some(modifier => modifier === compiler_1.StmtModifier.Static)) {
                                            value.statics = Object.assign({}, (value.statics || {}), { [field.name]: {} });
                                        }
                                    }
                                }
                            }
                        }
                        return value;
                    };
                }
            }
        }
    }
    exports.PartialModuleMetadataTransformer = PartialModuleMetadataTransformer;
    function isClassStmt(v) {
        return v instanceof compiler_1.ClassStmt;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfbWV0YWRhdGFfdHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy90cmFuc2Zvcm1lcnMvcjNfbWV0YWRhdGFfdHJhbnNmb3JtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBRUgsZ0RBQW9GO0lBQ3BGLGlDQUFpQztJQUVqQyxvRUFBb0c7SUFJcEcsTUFBYSxnQ0FBZ0M7UUFHM0MsWUFBWSxPQUF3QjtZQUNsQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQTBCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2RixDQUFDO1FBRUQsS0FBSyxDQUFDLFVBQXlCO1lBQzdCLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM5RCxJQUFJLGFBQWEsRUFBRTtnQkFDakIsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLENBQ3BCLGFBQWEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBc0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM3RixJQUFJLFFBQVEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO29CQUNyQixPQUFPLENBQUMsS0FBb0IsRUFBRSxJQUFhLEVBQWlCLEVBQUU7d0JBQzVELHdGQUF3Rjt3QkFDeEYsZ0VBQWdFO3dCQUNoRSxJQUFJLHVCQUFlLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFOzRCQUMxRSxNQUFNLGdCQUFnQixHQUFHLElBQTJCLENBQUM7NEJBQ3JELElBQUksZ0JBQWdCLENBQUMsSUFBSSxFQUFFO2dDQUN6QixNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQ0FDOUQsSUFBSSxZQUFZLEVBQUU7b0NBQ2hCLEtBQUssTUFBTSxLQUFLLElBQUksWUFBWSxDQUFDLE1BQU0sRUFBRTt3Q0FDdkMsSUFBSSxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxTQUFTOzRDQUM3QixLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsS0FBSyx1QkFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFOzRDQUN0RSxLQUFLLENBQUMsT0FBTyxxQkFBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLElBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFDLENBQUM7eUNBQzlEO3FDQUNGO2lDQUNGOzZCQUNGO3lCQUNGO3dCQUNELE9BQU8sS0FBSyxDQUFDO29CQUNmLENBQUMsQ0FBQztpQkFDSDthQUNGO1FBQ0gsQ0FBQztLQUNGO0lBbkNELDRFQW1DQztJQUVELFNBQVMsV0FBVyxDQUFDLENBQVk7UUFDL0IsT0FBTyxDQUFDLFlBQVksb0JBQVMsQ0FBQztJQUNoQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NsYXNzU3RtdCwgUGFydGlhbE1vZHVsZSwgU3RhdGVtZW50LCBTdG10TW9kaWZpZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge01ldGFkYXRhQ29sbGVjdG9yLCBNZXRhZGF0YVZhbHVlLCBNb2R1bGVNZXRhZGF0YSwgaXNDbGFzc01ldGFkYXRhfSBmcm9tICcuLi9tZXRhZGF0YS9pbmRleCc7XG5cbmltcG9ydCB7TWV0YWRhdGFUcmFuc2Zvcm1lciwgVmFsdWVUcmFuc2Zvcm19IGZyb20gJy4vbWV0YWRhdGFfY2FjaGUnO1xuXG5leHBvcnQgY2xhc3MgUGFydGlhbE1vZHVsZU1ldGFkYXRhVHJhbnNmb3JtZXIgaW1wbGVtZW50cyBNZXRhZGF0YVRyYW5zZm9ybWVyIHtcbiAgcHJpdmF0ZSBtb2R1bGVNYXA6IE1hcDxzdHJpbmcsIFBhcnRpYWxNb2R1bGU+O1xuXG4gIGNvbnN0cnVjdG9yKG1vZHVsZXM6IFBhcnRpYWxNb2R1bGVbXSkge1xuICAgIHRoaXMubW9kdWxlTWFwID0gbmV3IE1hcChtb2R1bGVzLm1hcDxbc3RyaW5nLCBQYXJ0aWFsTW9kdWxlXT4obSA9PiBbbS5maWxlTmFtZSwgbV0pKTtcbiAgfVxuXG4gIHN0YXJ0KHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpOiBWYWx1ZVRyYW5zZm9ybXx1bmRlZmluZWQge1xuICAgIGNvbnN0IHBhcnRpYWxNb2R1bGUgPSB0aGlzLm1vZHVsZU1hcC5nZXQoc291cmNlRmlsZS5maWxlTmFtZSk7XG4gICAgaWYgKHBhcnRpYWxNb2R1bGUpIHtcbiAgICAgIGNvbnN0IGNsYXNzTWFwID0gbmV3IE1hcDxzdHJpbmcsIENsYXNzU3RtdD4oXG4gICAgICAgICAgcGFydGlhbE1vZHVsZS5zdGF0ZW1lbnRzLmZpbHRlcihpc0NsYXNzU3RtdCkubWFwPFtzdHJpbmcsIENsYXNzU3RtdF0+KHMgPT4gW3MubmFtZSwgc10pKTtcbiAgICAgIGlmIChjbGFzc01hcC5zaXplID4gMCkge1xuICAgICAgICByZXR1cm4gKHZhbHVlOiBNZXRhZGF0YVZhbHVlLCBub2RlOiB0cy5Ob2RlKTogTWV0YWRhdGFWYWx1ZSA9PiB7XG4gICAgICAgICAgLy8gRm9yIGNsYXNzIG1ldGFkYXRhIHRoYXQgaXMgZ29pbmcgdG8gYmUgdHJhbnNmb3JtZWQgdG8gaGF2ZSBhIHN0YXRpYyBtZXRob2QgZW5zdXJlIHRoZVxuICAgICAgICAgIC8vIG1ldGFkYXRhIGNvbnRhaW5zIGEgc3RhdGljIGRlY2xhcmF0aW9uIHRoZSBuZXcgc3RhdGljIG1ldGhvZC5cbiAgICAgICAgICBpZiAoaXNDbGFzc01ldGFkYXRhKHZhbHVlKSAmJiBub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuQ2xhc3NEZWNsYXJhdGlvbikge1xuICAgICAgICAgICAgY29uc3QgY2xhc3NEZWNsYXJhdGlvbiA9IG5vZGUgYXMgdHMuQ2xhc3NEZWNsYXJhdGlvbjtcbiAgICAgICAgICAgIGlmIChjbGFzc0RlY2xhcmF0aW9uLm5hbWUpIHtcbiAgICAgICAgICAgICAgY29uc3QgcGFydGlhbENsYXNzID0gY2xhc3NNYXAuZ2V0KGNsYXNzRGVjbGFyYXRpb24ubmFtZS50ZXh0KTtcbiAgICAgICAgICAgICAgaWYgKHBhcnRpYWxDbGFzcykge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZmllbGQgb2YgcGFydGlhbENsYXNzLmZpZWxkcykge1xuICAgICAgICAgICAgICAgICAgaWYgKGZpZWxkLm5hbWUgJiYgZmllbGQubW9kaWZpZXJzICYmXG4gICAgICAgICAgICAgICAgICAgICAgZmllbGQubW9kaWZpZXJzLnNvbWUobW9kaWZpZXIgPT4gbW9kaWZpZXIgPT09IFN0bXRNb2RpZmllci5TdGF0aWMpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLnN0YXRpY3MgPSB7Li4uKHZhbHVlLnN0YXRpY3MgfHwge30pLCBbZmllbGQubmFtZV06IHt9fTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc0NsYXNzU3RtdCh2OiBTdGF0ZW1lbnQpOiB2IGlzIENsYXNzU3RtdCB7XG4gIHJldHVybiB2IGluc3RhbmNlb2YgQ2xhc3NTdG10O1xufVxuIl19