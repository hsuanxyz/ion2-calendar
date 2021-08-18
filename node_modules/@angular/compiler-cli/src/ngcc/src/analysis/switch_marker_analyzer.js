(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngcc/src/analysis/switch_marker_analyzer", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SwitchMarkerAnalyses = Map;
    /**
     * This Analyzer will analyse the files that have an R3 switch marker in them
     * that will be replaced.
     */
    var SwitchMarkerAnalyzer = /** @class */ (function () {
        function SwitchMarkerAnalyzer(host) {
            this.host = host;
        }
        /**
         * Analyze the files in the program to identify declarations that contain R3
         * switch markers.
         * @param program The program to analyze.
         * @return A map of source files to analysis objects. The map will contain only the
         * source files that had switch markers, and the analysis will contain an array of
         * the declarations in that source file that contain the marker.
         */
        SwitchMarkerAnalyzer.prototype.analyzeProgram = function (program) {
            var _this = this;
            var analyzedFiles = new exports.SwitchMarkerAnalyses();
            program.getSourceFiles().forEach(function (sourceFile) {
                var declarations = _this.host.getSwitchableDeclarations(sourceFile);
                if (declarations.length) {
                    analyzedFiles.set(sourceFile, { sourceFile: sourceFile, declarations: declarations });
                }
            });
            return analyzedFiles;
        };
        return SwitchMarkerAnalyzer;
    }());
    exports.SwitchMarkerAnalyzer = SwitchMarkerAnalyzer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoX21hcmtlcl9hbmFseXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmdjYy9zcmMvYW5hbHlzaXMvc3dpdGNoX21hcmtlcl9hbmFseXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQWdCYSxRQUFBLG9CQUFvQixHQUFHLEdBQUcsQ0FBQztJQUV4Qzs7O09BR0c7SUFDSDtRQUNFLDhCQUFvQixJQUF3QjtZQUF4QixTQUFJLEdBQUosSUFBSSxDQUFvQjtRQUFHLENBQUM7UUFDaEQ7Ozs7Ozs7V0FPRztRQUNILDZDQUFjLEdBQWQsVUFBZSxPQUFtQjtZQUFsQyxpQkFTQztZQVJDLElBQU0sYUFBYSxHQUFHLElBQUksNEJBQW9CLEVBQUUsQ0FBQztZQUNqRCxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQUEsVUFBVTtnQkFDekMsSUFBTSxZQUFZLEdBQUcsS0FBSSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDckUsSUFBSSxZQUFZLENBQUMsTUFBTSxFQUFFO29CQUN2QixhQUFhLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxFQUFDLFVBQVUsWUFBQSxFQUFFLFlBQVksY0FBQSxFQUFDLENBQUMsQ0FBQztpQkFDM0Q7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sYUFBYSxDQUFDO1FBQ3ZCLENBQUM7UUFDSCwyQkFBQztJQUFELENBQUMsQUFwQkQsSUFvQkM7SUFwQlksb0RBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQge05nY2NSZWZsZWN0aW9uSG9zdCwgU3dpdGNoYWJsZVZhcmlhYmxlRGVjbGFyYXRpb259IGZyb20gJy4uL2hvc3QvbmdjY19ob3N0JztcblxuZXhwb3J0IGludGVyZmFjZSBTd2l0Y2hNYXJrZXJBbmFseXNpcyB7XG4gIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGU7XG4gIGRlY2xhcmF0aW9uczogU3dpdGNoYWJsZVZhcmlhYmxlRGVjbGFyYXRpb25bXTtcbn1cblxuZXhwb3J0IHR5cGUgU3dpdGNoTWFya2VyQW5hbHlzZXMgPSBNYXA8dHMuU291cmNlRmlsZSwgU3dpdGNoTWFya2VyQW5hbHlzaXM+O1xuZXhwb3J0IGNvbnN0IFN3aXRjaE1hcmtlckFuYWx5c2VzID0gTWFwO1xuXG4vKipcbiAqIFRoaXMgQW5hbHl6ZXIgd2lsbCBhbmFseXNlIHRoZSBmaWxlcyB0aGF0IGhhdmUgYW4gUjMgc3dpdGNoIG1hcmtlciBpbiB0aGVtXG4gKiB0aGF0IHdpbGwgYmUgcmVwbGFjZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBTd2l0Y2hNYXJrZXJBbmFseXplciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaG9zdDogTmdjY1JlZmxlY3Rpb25Ib3N0KSB7fVxuICAvKipcbiAgICogQW5hbHl6ZSB0aGUgZmlsZXMgaW4gdGhlIHByb2dyYW0gdG8gaWRlbnRpZnkgZGVjbGFyYXRpb25zIHRoYXQgY29udGFpbiBSM1xuICAgKiBzd2l0Y2ggbWFya2Vycy5cbiAgICogQHBhcmFtIHByb2dyYW0gVGhlIHByb2dyYW0gdG8gYW5hbHl6ZS5cbiAgICogQHJldHVybiBBIG1hcCBvZiBzb3VyY2UgZmlsZXMgdG8gYW5hbHlzaXMgb2JqZWN0cy4gVGhlIG1hcCB3aWxsIGNvbnRhaW4gb25seSB0aGVcbiAgICogc291cmNlIGZpbGVzIHRoYXQgaGFkIHN3aXRjaCBtYXJrZXJzLCBhbmQgdGhlIGFuYWx5c2lzIHdpbGwgY29udGFpbiBhbiBhcnJheSBvZlxuICAgKiB0aGUgZGVjbGFyYXRpb25zIGluIHRoYXQgc291cmNlIGZpbGUgdGhhdCBjb250YWluIHRoZSBtYXJrZXIuXG4gICAqL1xuICBhbmFseXplUHJvZ3JhbShwcm9ncmFtOiB0cy5Qcm9ncmFtKTogU3dpdGNoTWFya2VyQW5hbHlzZXMge1xuICAgIGNvbnN0IGFuYWx5emVkRmlsZXMgPSBuZXcgU3dpdGNoTWFya2VyQW5hbHlzZXMoKTtcbiAgICBwcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkuZm9yRWFjaChzb3VyY2VGaWxlID0+IHtcbiAgICAgIGNvbnN0IGRlY2xhcmF0aW9ucyA9IHRoaXMuaG9zdC5nZXRTd2l0Y2hhYmxlRGVjbGFyYXRpb25zKHNvdXJjZUZpbGUpO1xuICAgICAgaWYgKGRlY2xhcmF0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgYW5hbHl6ZWRGaWxlcy5zZXQoc291cmNlRmlsZSwge3NvdXJjZUZpbGUsIGRlY2xhcmF0aW9uc30pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBhbmFseXplZEZpbGVzO1xuICB9XG59XG4iXX0=