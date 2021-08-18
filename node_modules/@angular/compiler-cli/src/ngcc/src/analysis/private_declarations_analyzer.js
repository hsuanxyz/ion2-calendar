(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngcc/src/analysis/private_declarations_analyzer", ["require", "exports", "@angular/compiler-cli/src/ngcc/src/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils_1 = require("@angular/compiler-cli/src/ngcc/src/utils");
    /**
     * This class will analyze a program to find all the declared classes
     * (i.e. on an NgModule) that are not publicly exported via an entry-point.
     */
    var PrivateDeclarationsAnalyzer = /** @class */ (function () {
        function PrivateDeclarationsAnalyzer(host, referencesRegistry) {
            this.host = host;
            this.referencesRegistry = referencesRegistry;
        }
        PrivateDeclarationsAnalyzer.prototype.analyzeProgram = function (program) {
            var rootFiles = this.getRootFiles(program);
            return this.getPrivateDeclarations(rootFiles, this.referencesRegistry.getDeclarationMap());
        };
        PrivateDeclarationsAnalyzer.prototype.getRootFiles = function (program) {
            return program.getRootFileNames().map(function (f) { return program.getSourceFile(f); }).filter(utils_1.isDefined);
        };
        PrivateDeclarationsAnalyzer.prototype.getPrivateDeclarations = function (rootFiles, declarations) {
            var _this = this;
            var privateDeclarations = new Map(declarations);
            rootFiles.forEach(function (f) {
                var exports = _this.host.getExportsOfModule(f);
                if (exports) {
                    exports.forEach(function (declaration, exportedName) {
                        if (utils_1.hasNameIdentifier(declaration.node) && declaration.node.name.text === exportedName) {
                            privateDeclarations.delete(declaration.node.name);
                        }
                    });
                }
            });
            return Array.from(privateDeclarations.keys()).map(function (id) {
                var from = id.getSourceFile().fileName;
                var declaration = privateDeclarations.get(id);
                var dtsDeclaration = _this.host.getDtsDeclaration(declaration.node);
                var dtsFrom = dtsDeclaration && dtsDeclaration.getSourceFile().fileName;
                return { identifier: id.text, from: from, dtsFrom: dtsFrom };
            });
        };
        return PrivateDeclarationsAnalyzer;
    }());
    exports.PrivateDeclarationsAnalyzer = PrivateDeclarationsAnalyzer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpdmF0ZV9kZWNsYXJhdGlvbnNfYW5hbHl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25nY2Mvc3JjL2FuYWx5c2lzL3ByaXZhdGVfZGVjbGFyYXRpb25zX2FuYWx5emVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBWUEsa0VBQXNEO0lBU3REOzs7T0FHRztJQUNIO1FBQ0UscUNBQW9CLElBQXdCLEVBQVUsa0JBQXNDO1lBQXhFLFNBQUksR0FBSixJQUFJLENBQW9CO1lBQVUsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtRQUFHLENBQUM7UUFFaEcsb0RBQWMsR0FBZCxVQUFlLE9BQW1CO1lBQ2hDLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDN0MsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7UUFDN0YsQ0FBQztRQUVPLGtEQUFZLEdBQXBCLFVBQXFCLE9BQW1CO1lBQ3RDLE9BQU8sT0FBTyxDQUFDLGdCQUFnQixFQUFFLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBeEIsQ0FBd0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxpQkFBUyxDQUFDLENBQUM7UUFDekYsQ0FBQztRQUVPLDREQUFzQixHQUE5QixVQUNJLFNBQTBCLEVBQzFCLFlBQTZDO1lBRmpELGlCQXFCQztZQWxCQyxJQUFNLG1CQUFtQixHQUFvQyxJQUFJLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNuRixTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQztnQkFDakIsSUFBTSxPQUFPLEdBQUcsS0FBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxPQUFPLEVBQUU7b0JBQ1gsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFdBQVcsRUFBRSxZQUFZO3dCQUN4QyxJQUFJLHlCQUFpQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssWUFBWSxFQUFFOzRCQUN0RixtQkFBbUIsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzt5QkFDbkQ7b0JBQ0gsQ0FBQyxDQUFDLENBQUM7aUJBQ0o7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEVBQUU7Z0JBQ2xELElBQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxRQUFRLENBQUM7Z0JBQ3pDLElBQU0sV0FBVyxHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUcsQ0FBQztnQkFDbEQsSUFBTSxjQUFjLEdBQUcsS0FBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JFLElBQU0sT0FBTyxHQUFHLGNBQWMsSUFBSSxjQUFjLENBQUMsYUFBYSxFQUFFLENBQUMsUUFBUSxDQUFDO2dCQUMxRSxPQUFPLEVBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxNQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQztZQUM5QyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFDSCxrQ0FBQztJQUFELENBQUMsQUFsQ0QsSUFrQ0M7SUFsQ1ksa0VBQTJCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7UmVmZXJlbmNlc1JlZ2lzdHJ5fSBmcm9tICcuLi8uLi8uLi9uZ3RzYy9hbm5vdGF0aW9ucyc7XG5pbXBvcnQge0RlY2xhcmF0aW9ufSBmcm9tICcuLi8uLi8uLi9uZ3RzYy9ob3N0JztcbmltcG9ydCB7TmdjY1JlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi9ob3N0L25nY2NfaG9zdCc7XG5pbXBvcnQge2hhc05hbWVJZGVudGlmaWVyLCBpc0RlZmluZWR9IGZyb20gJy4uL3V0aWxzJztcblxuZXhwb3J0IGludGVyZmFjZSBFeHBvcnRJbmZvIHtcbiAgaWRlbnRpZmllcjogc3RyaW5nO1xuICBmcm9tOiBzdHJpbmc7XG4gIGR0c0Zyb20/OiBzdHJpbmd8bnVsbDtcbn1cbmV4cG9ydCB0eXBlIFByaXZhdGVEZWNsYXJhdGlvbnNBbmFseXNlcyA9IEV4cG9ydEluZm9bXTtcblxuLyoqXG4gKiBUaGlzIGNsYXNzIHdpbGwgYW5hbHl6ZSBhIHByb2dyYW0gdG8gZmluZCBhbGwgdGhlIGRlY2xhcmVkIGNsYXNzZXNcbiAqIChpLmUuIG9uIGFuIE5nTW9kdWxlKSB0aGF0IGFyZSBub3QgcHVibGljbHkgZXhwb3J0ZWQgdmlhIGFuIGVudHJ5LXBvaW50LlxuICovXG5leHBvcnQgY2xhc3MgUHJpdmF0ZURlY2xhcmF0aW9uc0FuYWx5emVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBob3N0OiBOZ2NjUmVmbGVjdGlvbkhvc3QsIHByaXZhdGUgcmVmZXJlbmNlc1JlZ2lzdHJ5OiBSZWZlcmVuY2VzUmVnaXN0cnkpIHt9XG5cbiAgYW5hbHl6ZVByb2dyYW0ocHJvZ3JhbTogdHMuUHJvZ3JhbSk6IFByaXZhdGVEZWNsYXJhdGlvbnNBbmFseXNlcyB7XG4gICAgY29uc3Qgcm9vdEZpbGVzID0gdGhpcy5nZXRSb290RmlsZXMocHJvZ3JhbSk7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UHJpdmF0ZURlY2xhcmF0aW9ucyhyb290RmlsZXMsIHRoaXMucmVmZXJlbmNlc1JlZ2lzdHJ5LmdldERlY2xhcmF0aW9uTWFwKCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRSb290RmlsZXMocHJvZ3JhbTogdHMuUHJvZ3JhbSk6IHRzLlNvdXJjZUZpbGVbXSB7XG4gICAgcmV0dXJuIHByb2dyYW0uZ2V0Um9vdEZpbGVOYW1lcygpLm1hcChmID0+IHByb2dyYW0uZ2V0U291cmNlRmlsZShmKSkuZmlsdGVyKGlzRGVmaW5lZCk7XG4gIH1cblxuICBwcml2YXRlIGdldFByaXZhdGVEZWNsYXJhdGlvbnMoXG4gICAgICByb290RmlsZXM6IHRzLlNvdXJjZUZpbGVbXSxcbiAgICAgIGRlY2xhcmF0aW9uczogTWFwPHRzLklkZW50aWZpZXIsIERlY2xhcmF0aW9uPik6IFByaXZhdGVEZWNsYXJhdGlvbnNBbmFseXNlcyB7XG4gICAgY29uc3QgcHJpdmF0ZURlY2xhcmF0aW9uczogTWFwPHRzLklkZW50aWZpZXIsIERlY2xhcmF0aW9uPiA9IG5ldyBNYXAoZGVjbGFyYXRpb25zKTtcbiAgICByb290RmlsZXMuZm9yRWFjaChmID0+IHtcbiAgICAgIGNvbnN0IGV4cG9ydHMgPSB0aGlzLmhvc3QuZ2V0RXhwb3J0c09mTW9kdWxlKGYpO1xuICAgICAgaWYgKGV4cG9ydHMpIHtcbiAgICAgICAgZXhwb3J0cy5mb3JFYWNoKChkZWNsYXJhdGlvbiwgZXhwb3J0ZWROYW1lKSA9PiB7XG4gICAgICAgICAgaWYgKGhhc05hbWVJZGVudGlmaWVyKGRlY2xhcmF0aW9uLm5vZGUpICYmIGRlY2xhcmF0aW9uLm5vZGUubmFtZS50ZXh0ID09PSBleHBvcnRlZE5hbWUpIHtcbiAgICAgICAgICAgIHByaXZhdGVEZWNsYXJhdGlvbnMuZGVsZXRlKGRlY2xhcmF0aW9uLm5vZGUubmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShwcml2YXRlRGVjbGFyYXRpb25zLmtleXMoKSkubWFwKGlkID0+IHtcbiAgICAgIGNvbnN0IGZyb20gPSBpZC5nZXRTb3VyY2VGaWxlKCkuZmlsZU5hbWU7XG4gICAgICBjb25zdCBkZWNsYXJhdGlvbiA9IHByaXZhdGVEZWNsYXJhdGlvbnMuZ2V0KGlkKSAhO1xuICAgICAgY29uc3QgZHRzRGVjbGFyYXRpb24gPSB0aGlzLmhvc3QuZ2V0RHRzRGVjbGFyYXRpb24oZGVjbGFyYXRpb24ubm9kZSk7XG4gICAgICBjb25zdCBkdHNGcm9tID0gZHRzRGVjbGFyYXRpb24gJiYgZHRzRGVjbGFyYXRpb24uZ2V0U291cmNlRmlsZSgpLmZpbGVOYW1lO1xuICAgICAgcmV0dXJuIHtpZGVudGlmaWVyOiBpZC50ZXh0LCBmcm9tLCBkdHNGcm9tfTtcbiAgICB9KTtcbiAgfVxufVxuIl19