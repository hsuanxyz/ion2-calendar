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
        define("@angular/compiler-cli/src/transformers/r3_transform", ["require", "exports", "@angular/compiler-cli/src/transformers/node_emitter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const node_emitter_1 = require("@angular/compiler-cli/src/transformers/node_emitter");
    /**
     * Returns a transformer that adds the requested static methods specified by modules.
     */
    function getAngularClassTransformerFactory(modules) {
        if (modules.length === 0) {
            // If no modules are specified, just return an identity transform.
            return () => sf => sf;
        }
        const moduleMap = new Map(modules.map(m => [m.fileName, m]));
        return function (context) {
            return function (sourceFile) {
                const module = moduleMap.get(sourceFile.fileName);
                if (module && module.statements.length > 0) {
                    const [newSourceFile] = node_emitter_1.updateSourceFile(sourceFile, module, context);
                    return newSourceFile;
                }
                return sourceFile;
            };
        };
    }
    exports.getAngularClassTransformerFactory = getAngularClassTransformerFactory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfdHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy90cmFuc2Zvcm1lcnMvcjNfdHJhbnNmb3JtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBS0gsc0ZBQWdEO0lBS2hEOztPQUVHO0lBQ0gsU0FBZ0IsaUNBQWlDLENBQUMsT0FBd0I7UUFDeEUsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN4QixrRUFBa0U7WUFDbEUsT0FBTyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztTQUN2QjtRQUNELE1BQU0sU0FBUyxHQUFHLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQTBCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RixPQUFPLFVBQVMsT0FBaUM7WUFDL0MsT0FBTyxVQUFTLFVBQXlCO2dCQUN2QyxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUMxQyxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsK0JBQWdCLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDdEUsT0FBTyxhQUFhLENBQUM7aUJBQ3RCO2dCQUNELE9BQU8sVUFBVSxDQUFDO1lBQ3BCLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQztJQUNKLENBQUM7SUFoQkQsOEVBZ0JDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1BhcnRpYWxNb2R1bGUsIFN0YXRlbWVudCwgU3RhdGljU3ltYm9sfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHt1cGRhdGVTb3VyY2VGaWxlfSBmcm9tICcuL25vZGVfZW1pdHRlcic7XG5cbmV4cG9ydCB0eXBlIFRyYW5zZm9ybWVyID0gKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpID0+IHRzLlNvdXJjZUZpbGU7XG5leHBvcnQgdHlwZSBUcmFuc2Zvcm1lckZhY3RvcnkgPSAoY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0KSA9PiBUcmFuc2Zvcm1lcjtcblxuLyoqXG4gKiBSZXR1cm5zIGEgdHJhbnNmb3JtZXIgdGhhdCBhZGRzIHRoZSByZXF1ZXN0ZWQgc3RhdGljIG1ldGhvZHMgc3BlY2lmaWVkIGJ5IG1vZHVsZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbmd1bGFyQ2xhc3NUcmFuc2Zvcm1lckZhY3RvcnkobW9kdWxlczogUGFydGlhbE1vZHVsZVtdKTogVHJhbnNmb3JtZXJGYWN0b3J5IHtcbiAgaWYgKG1vZHVsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgLy8gSWYgbm8gbW9kdWxlcyBhcmUgc3BlY2lmaWVkLCBqdXN0IHJldHVybiBhbiBpZGVudGl0eSB0cmFuc2Zvcm0uXG4gICAgcmV0dXJuICgpID0+IHNmID0+IHNmO1xuICB9XG4gIGNvbnN0IG1vZHVsZU1hcCA9IG5ldyBNYXAobW9kdWxlcy5tYXA8W3N0cmluZywgUGFydGlhbE1vZHVsZV0+KG0gPT4gW20uZmlsZU5hbWUsIG1dKSk7XG4gIHJldHVybiBmdW5jdGlvbihjb250ZXh0OiB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IHRzLlNvdXJjZUZpbGUge1xuICAgICAgY29uc3QgbW9kdWxlID0gbW9kdWxlTWFwLmdldChzb3VyY2VGaWxlLmZpbGVOYW1lKTtcbiAgICAgIGlmIChtb2R1bGUgJiYgbW9kdWxlLnN0YXRlbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBbbmV3U291cmNlRmlsZV0gPSB1cGRhdGVTb3VyY2VGaWxlKHNvdXJjZUZpbGUsIG1vZHVsZSwgY29udGV4dCk7XG4gICAgICAgIHJldHVybiBuZXdTb3VyY2VGaWxlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNvdXJjZUZpbGU7XG4gICAgfTtcbiAgfTtcbn1cbiJdfQ==