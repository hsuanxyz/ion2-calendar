(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngcc/src/rendering/esm_renderer", ["require", "exports", "tslib", "canonical-path", "typescript", "@angular/compiler-cli/src/ngcc/src/host/ngcc_host", "@angular/compiler-cli/src/ngcc/src/rendering/renderer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var canonical_path_1 = require("canonical-path");
    var ts = require("typescript");
    var ngcc_host_1 = require("@angular/compiler-cli/src/ngcc/src/host/ngcc_host");
    var renderer_1 = require("@angular/compiler-cli/src/ngcc/src/rendering/renderer");
    var EsmRenderer = /** @class */ (function (_super) {
        tslib_1.__extends(EsmRenderer, _super);
        function EsmRenderer(host, isCore, bundle, sourcePath, targetPath) {
            return _super.call(this, host, isCore, bundle, sourcePath, targetPath) || this;
        }
        /**
         *  Add the imports at the top of the file
         */
        EsmRenderer.prototype.addImports = function (output, imports) {
            // The imports get inserted at the very top of the file.
            imports.forEach(function (i) { output.appendLeft(0, "import * as " + i.as + " from '" + i.name + "';\n"); });
        };
        EsmRenderer.prototype.addExports = function (output, entryPointBasePath, exports) {
            exports.forEach(function (e) {
                var basePath = renderer_1.stripExtension(e.from);
                var relativePath = './' + canonical_path_1.relative(canonical_path_1.dirname(entryPointBasePath), basePath);
                var exportFrom = entryPointBasePath !== basePath ? " from '" + relativePath + "'" : '';
                var exportStr = "\nexport {" + e.identifier + "}" + exportFrom + ";";
                output.append(exportStr);
            });
        };
        EsmRenderer.prototype.addConstants = function (output, constants, file) {
            if (constants === '') {
                return;
            }
            var insertionPoint = file.statements.reduce(function (prev, stmt) {
                if (ts.isImportDeclaration(stmt) || ts.isImportEqualsDeclaration(stmt) ||
                    ts.isNamespaceImport(stmt)) {
                    return stmt.getEnd();
                }
                return prev;
            }, 0);
            output.appendLeft(insertionPoint, '\n' + constants + '\n');
        };
        /**
         * Add the definitions to each decorated class
         */
        EsmRenderer.prototype.addDefinitions = function (output, compiledClass, definitions) {
            var classSymbol = this.host.getClassSymbol(compiledClass.declaration);
            if (!classSymbol) {
                throw new Error("Compiled class does not have a valid symbol: " + compiledClass.name);
            }
            var insertionPoint = classSymbol.valueDeclaration.getEnd();
            output.appendLeft(insertionPoint, '\n' + definitions);
        };
        /**
         * Remove static decorator properties from classes
         */
        EsmRenderer.prototype.removeDecorators = function (output, decoratorsToRemove) {
            decoratorsToRemove.forEach(function (nodesToRemove, containerNode) {
                if (ts.isArrayLiteralExpression(containerNode)) {
                    var items = containerNode.elements;
                    if (items.length === nodesToRemove.length) {
                        // Remove the entire statement
                        var statement = findStatement(containerNode);
                        if (statement) {
                            output.remove(statement.getFullStart(), statement.getEnd());
                        }
                    }
                    else {
                        nodesToRemove.forEach(function (node) {
                            // remove any trailing comma
                            var end = (output.slice(node.getEnd(), node.getEnd() + 1) === ',') ?
                                node.getEnd() + 1 :
                                node.getEnd();
                            output.remove(node.getFullStart(), end);
                        });
                    }
                }
            });
        };
        EsmRenderer.prototype.rewriteSwitchableDeclarations = function (outputText, sourceFile, declarations) {
            declarations.forEach(function (declaration) {
                var start = declaration.initializer.getStart();
                var end = declaration.initializer.getEnd();
                var replacement = declaration.initializer.text.replace(ngcc_host_1.PRE_R3_MARKER, ngcc_host_1.POST_R3_MARKER);
                outputText.overwrite(start, end, replacement);
            });
        };
        return EsmRenderer;
    }(renderer_1.Renderer));
    exports.EsmRenderer = EsmRenderer;
    function findStatement(node) {
        while (node) {
            if (ts.isExpressionStatement(node)) {
                return node;
            }
            node = node.parent;
        }
        return undefined;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXNtX3JlbmRlcmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ2NjL3NyYy9yZW5kZXJpbmcvZXNtX3JlbmRlcmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILGlEQUFpRDtJQUVqRCwrQkFBaUM7SUFDakMsK0VBQW1IO0lBRW5ILGtGQUEyRTtJQUczRTtRQUFpQyx1Q0FBUTtRQUN2QyxxQkFDSSxJQUF3QixFQUFFLE1BQWUsRUFBRSxNQUF3QixFQUFFLFVBQWtCLEVBQ3ZGLFVBQWtCO21CQUNwQixrQkFBTSxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDO1FBQ3JELENBQUM7UUFFRDs7V0FFRztRQUNILGdDQUFVLEdBQVYsVUFBVyxNQUFtQixFQUFFLE9BQXNDO1lBQ3BFLHdEQUF3RDtZQUN4RCxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQyxJQUFNLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLGlCQUFlLENBQUMsQ0FBQyxFQUFFLGVBQVUsQ0FBQyxDQUFDLElBQUksU0FBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3RixDQUFDO1FBRUQsZ0NBQVUsR0FBVixVQUFXLE1BQW1CLEVBQUUsa0JBQTBCLEVBQUUsT0FHekQ7WUFDRCxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQztnQkFDZixJQUFNLFFBQVEsR0FBRyx5QkFBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDeEMsSUFBTSxZQUFZLEdBQUcsSUFBSSxHQUFHLHlCQUFRLENBQUMsd0JBQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUM1RSxJQUFNLFVBQVUsR0FBRyxrQkFBa0IsS0FBSyxRQUFRLENB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O1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsbURBQTZCLEdBQTdCLFVBQ0ksVUFBdUIsRUFBRSxVQUF5QixFQUNsRCxZQUE2QztZQUMvQyxZQUFZLENBQUMsT0FBTyxDQUFDLFVBQUEsV0FBVztnQkFDOUIsSUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDakQsSUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDN0MsSUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLHlCQUFhLEVBQUUsMEJBQWMsQ0FBQyxDQUFDO2dCQUN4RixVQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDaEQsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0gsa0JBQUM7SUFBRCxDQUFDLEFBMUZELENBQWlDLG1CQUFRLEdBMEZ4QztJQTFGWSxrQ0FBVztJQTRGeEIsU0FBUyxhQUFhLENBQUMsSUFBYTtRQUNsQyxPQUFPLElBQUksRUFBRTtZQUNYLElBQUksRUFBRSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNsQyxPQUFPLElBQUksQ0FBQzthQUNiO1lBQ0QsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7U0FDcEI7UUFDRCxPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtkaXJuYW1lLCByZWxhdGl2ZX0gZnJvbSAnY2Fub25pY2FsLXBhdGgnO1xuaW1wb3J0IE1hZ2ljU3RyaW5nIGZyb20gJ21hZ2ljLXN0cmluZyc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7TmdjY1JlZmxlY3Rpb25Ib3N0LCBQT1NUX1IzX01BUktFUiwgUFJFX1IzX01BUktFUiwgU3dpdGNoYWJsZVZhcmlhYmxlRGVjbGFyYXRpb259IGZyb20gJy4uL2hvc3QvbmdjY19ob3N0JztcbmltcG9ydCB7Q29tcGlsZWRDbGFzc30gZnJvbSAnLi4vYW5hbHlzaXMvZGVjb3JhdGlvbl9hbmFseXplcic7XG5pbXBvcnQge1JlZHVuZGFudERlY29yYXRvck1hcCwgUmVuZGVyZXIsIHN0cmlwRXh0ZW5zaW9ufSBmcm9tICcuL3JlbmRlcmVyJztcbmltcG9ydCB7RW50cnlQb2ludEJ1bmRsZX0gZnJvbSAnLi4vcGFja2FnZXMvZW50cnlfcG9pbnRfYnVuZGxlJztcblxuZXhwb3J0IGNsYXNzIEVzbVJlbmRlcmVyIGV4dGVuZHMgUmVuZGVyZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIGhvc3Q6IE5nY2NSZWZsZWN0aW9uSG9zdCwgaXNDb3JlOiBib29sZWFuLCBidW5kbGU6IEVudHJ5UG9pbnRCdW5kbGUsIHNvdXJjZVBhdGg6IHN0cmluZyxcbiAgICAgIHRhcmdldFBhdGg6IHN0cmluZykge1xuICAgIHN1cGVyKGhvc3QsIGlzQ29yZSwgYnVuZGxlLCBzb3VyY2VQYXRoLCB0YXJnZXRQYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiAgQWRkIHRoZSBpbXBvcnRzIGF0IHRoZSB0b3Agb2YgdGhlIGZpbGVcbiAgICovXG4gIGFkZEltcG9ydHMob3V0cHV0OiBNYWdpY1N0cmluZywgaW1wb3J0czoge25hbWU6IHN0cmluZzsgYXM6IHN0cmluZzt9W10pOiB2b2lkIHtcbiAgICAvLyBUaGUgaW1wb3J0cyBnZXQgaW5zZXJ0ZWQgYXQgdGhlIHZlcnkgdG9wIG9mIHRoZSBmaWxlLlxuICAgIGltcG9ydHMuZm9yRWFjaChpID0+IHsgb3V0cHV0LmFwcGVuZExlZnQoMCwgYGltcG9ydCAqIGFzICR7aS5hc30gZnJvbSAnJHtpLm5hbWV9JztcXG5gKTsgfSk7XG4gIH1cblxuICBhZGRFeHBvcnRzKG91dHB1dDogTWFnaWNTdHJpbmcsIGVudHJ5UG9pbnRCYXNlUGF0aDogc3RyaW5nLCBleHBvcnRzOiB7XG4gICAgaWRlbnRpZmllcjogc3RyaW5nLFxuICAgIGZyb206IHN0cmluZ1xuICB9W10pOiB2b2lkIHtcbiAgICBleHBvcnRzLmZvckVhY2goZSA9PiB7XG4gICAgICBjb25zdCBiYXNlUGF0aCA9IHN0cmlwRXh0ZW5zaW9uKGUuZnJvbSk7XG4gICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSAnLi8nICsgcmVsYXRpdmUoZGlybmFtZShlbnRyeVBvaW50QmFzZVBhdGgpLCBiYXNlUGF0aCk7XG4gICAgICBjb25zdCBleHBvcnRGcm9tID0gZW50cnlQb2ludEJhc2VQYXRoICE9PSBiYXNlUGF0aCA/IGAgZnJvbSAnJHtyZWxhdGl2ZVBhdGh9J2AgOiAnJztcbiAgICAgIGNvbnN0IGV4cG9ydFN0ciA9IGBcXG5leHBvcnQgeyR7ZS5pZGVudGlmaWVyfX0ke2V4cG9ydEZyb219O2A7XG4gICAgICBvdXRwdXQuYXBwZW5kKGV4cG9ydFN0cik7XG4gICAgfSk7XG4gIH1cblxuICBhZGRDb25zdGFudHMob3V0cHV0OiBNYWdpY1N0cmluZywgY29uc3RhbnRzOiBzdHJpbmcsIGZpbGU6IHRzLlNvdXJjZUZpbGUpOiB2b2lkIHtcbiAgICBpZiAoY29uc3RhbnRzID09PSAnJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBpbnNlcnRpb25Qb2ludCA9IGZpbGUuc3RhdGVtZW50cy5yZWR1Y2UoKHByZXYsIHN0bXQpID0+IHtcbiAgICAgIGlmICh0cy5pc0ltcG9ydERlY2xhcmF0aW9uKHN0bXQpIHx8IHRzLmlzSW1wb3J0RXF1YWxzRGVjbGFyYXRpb24oc3RtdCkgfHxcbiAgICAgICAgICB0cy5pc05hbWVzcGFjZUltcG9ydChzdG10KSkge1xuICAgICAgICByZXR1cm4gc3RtdC5nZXRFbmQoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcmV2O1xuICAgIH0sIDApO1xuICAgIG91dHB1dC5hcHBlbmRMZWZ0KGluc2VydGlvblBvaW50LCAnXFxuJyArIGNvbnN0YW50cyArICdcXG4nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgdGhlIGRlZmluaXRpb25zIHRvIGVhY2ggZGVjb3JhdGVkIGNsYXNzXG4gICAqL1xuICBhZGREZWZpbml0aW9ucyhvdXRwdXQ6IE1hZ2ljU3RyaW5nLCBjb21waWxlZENsYXNzOiBDb21waWxlZENsYXNzLCBkZWZpbml0aW9uczogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgY2xhc3NTeW1ib2wgPSB0aGlzLmhvc3QuZ2V0Q2xhc3NTeW1ib2woY29tcGlsZWRDbGFzcy5kZWNsYXJhdGlvbik7XG4gICAgaWYgKCFjbGFzc1N5bWJvbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb21waWxlZCBjbGFzcyBkb2VzIG5vdCBoYXZlIGEgdmFsaWQgc3ltYm9sOiAke2NvbXBpbGVkQ2xhc3MubmFtZX1gKTtcbiAgICB9XG4gICAgY29uc3QgaW5zZXJ0aW9uUG9pbnQgPSBjbGFzc1N5bWJvbC52YWx1ZURlY2xhcmF0aW9uICEuZ2V0RW5kKCk7XG4gICAgb3V0cHV0LmFwcGVuZExlZnQoaW5zZXJ0aW9uUG9pbnQsICdcXG4nICsgZGVmaW5pdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBzdGF0aWMgZGVjb3JhdG9yIHByb3BlcnRpZXMgZnJvbSBjbGFzc2VzXG4gICAqL1xuICByZW1vdmVEZWNvcmF0b3JzKG91dHB1dDogTWFnaWNTdHJpbmcsIGRlY29yYXRvcnNUb1JlbW92ZTogUmVkdW5kYW50RGVjb3JhdG9yTWFwKTogdm9pZCB7XG4gICAgZGVjb3JhdG9yc1RvUmVtb3ZlLmZvckVhY2goKG5vZGVzVG9SZW1vdmUsIGNvbnRhaW5lck5vZGUpID0+IHtcbiAgICAgIGlmICh0cy5pc0FycmF5TGl0ZXJhbEV4cHJlc3Npb24oY29udGFpbmVyTm9kZSkpIHtcbiAgICAgICAgY29uc3QgaXRlbXMgPSBjb250YWluZXJOb2RlLmVsZW1lbnRzO1xuICAgICAgICBpZiAoaXRlbXMubGVuZ3RoID09PSBub2Rlc1RvUmVtb3ZlLmxlbmd0aCkge1xuICAgICAgICAgIC8vIFJlbW92ZSB0aGUgZW50aXJlIHN0YXRlbWVudFxuICAgICAgICAgIGNvbnN0IHN0YXRlbWVudCA9IGZpbmRTdGF0ZW1lbnQoY29udGFpbmVyTm9kZSk7XG4gICAgICAgICAgaWYgKHN0YXRlbWVudCkge1xuICAgICAgICAgICAgb3V0cHV0LnJlbW92ZShzdGF0ZW1lbnQuZ2V0RnVsbFN0YXJ0KCksIHN0YXRlbWVudC5nZXRFbmQoKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5vZGVzVG9SZW1vdmUuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgICAgIC8vIHJlbW92ZSBhbnkgdHJhaWxpbmcgY29tbWFcbiAgICAgICAgICAgIGNvbnN0IGVuZCA9IChvdXRwdXQuc2xpY2Uobm9kZS5nZXRFbmQoKSwgbm9kZS5nZXRFbmQoKSArIDEpID09PSAnLCcpID9cbiAgICAgICAgICAgICAgICBub2RlLmdldEVuZCgpICsgMSA6XG4gICAgICAgICAgICAgICAgbm9kZS5nZXRFbmQoKTtcbiAgICAgICAgICAgIG91dHB1dC5yZW1vdmUobm9kZS5nZXRGdWxsU3RhcnQoKSwgZW5kKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmV3cml0ZVN3aXRjaGFibGVEZWNsYXJhdGlvbnMoXG4gICAgICBvdXRwdXRUZXh0OiBNYWdpY1N0cmluZywgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSxcbiAgICAgIGRlY2xhcmF0aW9uczogU3dpdGNoYWJsZVZhcmlhYmxlRGVjbGFyYXRpb25bXSk6IHZvaWQge1xuICAgIGRlY2xhcmF0aW9ucy5mb3JFYWNoKGRlY2xhcmF0aW9uID0+IHtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gZGVjbGFyYXRpb24uaW5pdGlhbGl6ZXIuZ2V0U3RhcnQoKTtcbiAgICAgIGNvbnN0IGVuZCA9IGRlY2xhcmF0aW9uLmluaXRpYWxpemVyLmdldEVuZCgpO1xuICAgICAgY29uc3QgcmVwbGFjZW1lbnQgPSBkZWNsYXJhdGlvbi5pbml0aWFsaXplci50ZXh0LnJlcGxhY2UoUFJFX1IzX01BUktFUiwgUE9TVF9SM19NQVJLRVIpO1xuICAgICAgb3V0cHV0VGV4dC5vdmVyd3JpdGUoc3RhcnQsIGVuZCwgcmVwbGFjZW1lbnQpO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZpbmRTdGF0ZW1lbnQobm9kZTogdHMuTm9kZSkge1xuICB3aGlsZSAobm9kZSkge1xuICAgIGlmICh0cy5pc0V4cHJlc3Npb25TdGF0ZW1lbnQobm9kZSkpIHtcbiAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgICBub2RlID0gbm9kZS5wYXJlbnQ7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbiJdfQ==