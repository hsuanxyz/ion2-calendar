(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngcc/src/analysis/decoration_analyzer", ["require", "exports", "tslib", "@angular/compiler", "canonical-path", "fs", "@angular/compiler-cli/src/ngtsc/annotations", "@angular/compiler-cli/src/ngcc/src/utils"], factory);
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
    var compiler_1 = require("@angular/compiler");
    var path = require("canonical-path");
    var fs = require("fs");
    var annotations_1 = require("@angular/compiler-cli/src/ngtsc/annotations");
    var utils_1 = require("@angular/compiler-cli/src/ngcc/src/utils");
    exports.DecorationAnalyses = Map;
    /**
     * `ResourceLoader` which directly uses the filesystem to resolve resources synchronously.
     */
    var FileResourceLoader = /** @class */ (function () {
        function FileResourceLoader() {
        }
        FileResourceLoader.prototype.load = function (url, containingFile) {
            url = path.resolve(path.dirname(containingFile), url);
            return fs.readFileSync(url, 'utf8');
        };
        return FileResourceLoader;
    }());
    exports.FileResourceLoader = FileResourceLoader;
    /**
     * This Analyzer will analyze the files that have decorated classes that need to be transformed.
     */
    var DecorationAnalyzer = /** @class */ (function () {
        function DecorationAnalyzer(typeChecker, host, referencesRegistry, rootDirs, isCore) {
            this.typeChecker = typeChecker;
            this.host = host;
            this.referencesRegistry = referencesRegistry;
            this.rootDirs = rootDirs;
            this.isCore = isCore;
            this.resourceLoader = new FileResourceLoader();
            this.scopeRegistry = new annotations_1.SelectorScopeRegistry(this.typeChecker, this.host);
            this.handlers = [
                new annotations_1.BaseDefDecoratorHandler(this.typeChecker, this.host),
                new annotations_1.ComponentDecoratorHandler(this.typeChecker, this.host, this.scopeRegistry, this.isCore, this.resourceLoader, this.rootDirs, /* defaultPreserveWhitespaces */ false, /* i18nUseExternalIds */ true),
                new annotations_1.DirectiveDecoratorHandler(this.typeChecker, this.host, this.scopeRegistry, this.isCore),
                new annotations_1.InjectableDecoratorHandler(this.host, this.isCore),
                new annotations_1.NgModuleDecoratorHandler(this.typeChecker, this.host, this.scopeRegistry, this.referencesRegistry, this.isCore),
                new annotations_1.PipeDecoratorHandler(this.typeChecker, this.host, this.scopeRegistry, this.isCore),
            ];
        }
        /**
         * Analyze a program to find all the decorated files should be transformed.
         * @param program The program whose files should be analysed.
         * @returns a map of the source files to the analysis for those files.
         */
        DecorationAnalyzer.prototype.analyzeProgram = function (program) {
            var _this = this;
            var decorationAnalyses = new exports.DecorationAnalyses();
            var analysedFiles = program.getSourceFiles().map(function (sourceFile) { return _this.analyzeFile(sourceFile); }).filter(utils_1.isDefined);
            var compiledFiles = analysedFiles.map(function (analysedFile) { return _this.compileFile(analysedFile); });
            compiledFiles.forEach(function (compiledFile) { return decorationAnalyses.set(compiledFile.sourceFile, compiledFile); });
            return decorationAnalyses;
        };
        DecorationAnalyzer.prototype.analyzeFile = function (sourceFile) {
            var _this = this;
            var decoratedClasses = this.host.findDecoratedClasses(sourceFile);
            return decoratedClasses.length ? {
                sourceFile: sourceFile,
                analyzedClasses: decoratedClasses.map(function (clazz) { return _this.analyzeClass(clazz); }).filter(utils_1.isDefined)
            } :
                undefined;
        };
        DecorationAnalyzer.prototype.analyzeClass = function (clazz) {
            var matchingHandlers = this.handlers
                .map(function (handler) {
                var match = handler.detect(clazz.declaration, clazz.decorators);
                return { handler: handler, match: match };
            })
                .filter(isMatchingHandler);
            if (matchingHandlers.length > 1) {
                throw new Error('TODO.Diagnostic: Class has multiple Angular decorators.');
            }
            if (matchingHandlers.length === 0) {
                return null;
            }
            var _a = matchingHandlers[0], handler = _a.handler, match = _a.match;
            var _b = handler.analyze(clazz.declaration, match), analysis = _b.analysis, diagnostics = _b.diagnostics;
            return tslib_1.__assign({}, clazz, { handler: handler, analysis: analysis, diagnostics: diagnostics });
        };
        DecorationAnalyzer.prototype.compileFile = function (analyzedFile) {
            var _this = this;
            var constantPool = new compiler_1.ConstantPool();
            var compiledClasses = analyzedFile.analyzedClasses.map(function (analyzedClass) {
                var compilation = _this.compileClass(analyzedClass, constantPool);
                return tslib_1.__assign({}, analyzedClass, { compilation: compilation });
            });
            return { constantPool: constantPool, sourceFile: analyzedFile.sourceFile, compiledClasses: compiledClasses };
        };
        DecorationAnalyzer.prototype.compileClass = function (clazz, constantPool) {
            var compilation = clazz.handler.compile(clazz.declaration, clazz.analysis, constantPool);
            if (!Array.isArray(compilation)) {
                compilation = [compilation];
            }
            return compilation;
        };
        return DecorationAnalyzer;
    }());
    exports.DecorationAnalyzer = DecorationAnalyzer;
    function isMatchingHandler(handler) {
        return !!handler.match;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdGlvbl9hbmFseXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmdjYy9zcmMvYW5hbHlzaXMvZGVjb3JhdGlvbl9hbmFseXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCw4Q0FBK0M7SUFDL0MscUNBQXVDO0lBQ3ZDLHVCQUF5QjtJQUd6QiwyRUFBZ1E7SUFJaFEsa0VBQW1DO0lBc0J0QixRQUFBLGtCQUFrQixHQUFHLEdBQUcsQ0FBQztJQU90Qzs7T0FFRztJQUNIO1FBQUE7UUFLQSxDQUFDO1FBSkMsaUNBQUksR0FBSixVQUFLLEdBQVcsRUFBRSxjQUFzQjtZQUN0QyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3RELE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUNILHlCQUFDO0lBQUQsQ0FBQyxBQUxELElBS0M7SUFMWSxnREFBa0I7SUFPL0I7O09BRUc7SUFDSDtRQWVFLDRCQUNZLFdBQTJCLEVBQVUsSUFBd0IsRUFDN0Qsa0JBQXNDLEVBQVUsUUFBa0IsRUFDbEUsTUFBZTtZQUZmLGdCQUFXLEdBQVgsV0FBVyxDQUFnQjtZQUFVLFNBQUksR0FBSixJQUFJLENBQW9CO1lBQzdELHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFVO1lBQ2xFLFdBQU0sR0FBTixNQUFNLENBQVM7WUFqQjNCLG1CQUFjLEdBQUcsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO1lBQzFDLGtCQUFhLEdBQUcsSUFBSSxtQ0FBcUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FB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SUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQy9CLFdBQVcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQzdCO1lBQ0QsT0FBTyxXQUFXLENBQUM7UUFDckIsQ0FBQztRQUNILHlCQUFDO0lBQUQsQ0FBQyxBQWhGRCxJQWdGQztJQWhGWSxnREFBa0I7SUFrRi9CLFNBQVMsaUJBQWlCLENBQU8sT0FBdUM7UUFFdEUsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztJQUN6QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtDb25zdGFudFBvb2x9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAnY2Fub25pY2FsLXBhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7QmFzZURlZkRlY29yYXRvckhhbmRsZXIsIENvbXBvbmVudERlY29yYXRvckhhbmRsZXIsIERpcmVjdGl2ZURlY29yYXRvckhhbmRsZXIsIEluamVjdGFibGVEZWNvcmF0b3JIYW5kbGVyLCBOZ01vZHVsZURlY29yYXRvckhhbmRsZXIsIFBpcGVEZWNvcmF0b3JIYW5kbGVyLCBSZWZlcmVuY2VzUmVnaXN0cnksIFJlc291cmNlTG9hZGVyLCBTZWxlY3RvclNjb3BlUmVnaXN0cnl9IGZyb20gJy4uLy4uLy4uL25ndHNjL2Fubm90YXRpb25zJztcbmltcG9ydCB7Q29tcGlsZVJlc3VsdCwgRGVjb3JhdG9ySGFuZGxlcn0gZnJvbSAnLi4vLi4vLi4vbmd0c2MvdHJhbnNmb3JtJztcbmltcG9ydCB7RGVjb3JhdGVkQ2xhc3N9IGZyb20gJy4uL2hvc3QvZGVjb3JhdGVkX2NsYXNzJztcbmltcG9ydCB7TmdjY1JlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi9ob3N0L25nY2NfaG9zdCc7XG5pbXBvcnQge2lzRGVmaW5lZH0gZnJvbSAnLi4vdXRpbHMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFuYWx5emVkRmlsZSB7XG4gIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGU7XG4gIGFuYWx5emVkQ2xhc3NlczogQW5hbHl6ZWRDbGFzc1tdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFuYWx5emVkQ2xhc3MgZXh0ZW5kcyBEZWNvcmF0ZWRDbGFzcyB7XG4gIGRpYWdub3N0aWNzPzogdHMuRGlhZ25vc3RpY1tdO1xuICBoYW5kbGVyOiBEZWNvcmF0b3JIYW5kbGVyPGFueSwgYW55PjtcbiAgYW5hbHlzaXM6IGFueTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21waWxlZENsYXNzIGV4dGVuZHMgQW5hbHl6ZWRDbGFzcyB7IGNvbXBpbGF0aW9uOiBDb21waWxlUmVzdWx0W107IH1cblxuZXhwb3J0IGludGVyZmFjZSBDb21waWxlZEZpbGUge1xuICBjb21waWxlZENsYXNzZXM6IENvbXBpbGVkQ2xhc3NbXTtcbiAgc291cmNlRmlsZTogdHMuU291cmNlRmlsZTtcbiAgY29uc3RhbnRQb29sOiBDb25zdGFudFBvb2w7XG59XG5cbmV4cG9ydCB0eXBlIERlY29yYXRpb25BbmFseXNlcyA9IE1hcDx0cy5Tb3VyY2VGaWxlLCBDb21waWxlZEZpbGU+O1xuZXhwb3J0IGNvbnN0IERlY29yYXRpb25BbmFseXNlcyA9IE1hcDtcblxuZXhwb3J0IGludGVyZmFjZSBNYXRjaGluZ0hhbmRsZXI8QSwgTT4ge1xuICBoYW5kbGVyOiBEZWNvcmF0b3JIYW5kbGVyPEEsIE0+O1xuICBtYXRjaDogTTtcbn1cblxuLyoqXG4gKiBgUmVzb3VyY2VMb2FkZXJgIHdoaWNoIGRpcmVjdGx5IHVzZXMgdGhlIGZpbGVzeXN0ZW0gdG8gcmVzb2x2ZSByZXNvdXJjZXMgc3luY2hyb25vdXNseS5cbiAqL1xuZXhwb3J0IGNsYXNzIEZpbGVSZXNvdXJjZUxvYWRlciBpbXBsZW1lbnRzIFJlc291cmNlTG9hZGVyIHtcbiAgbG9hZCh1cmw6IHN0cmluZywgY29udGFpbmluZ0ZpbGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgdXJsID0gcGF0aC5yZXNvbHZlKHBhdGguZGlybmFtZShjb250YWluaW5nRmlsZSksIHVybCk7XG4gICAgcmV0dXJuIGZzLnJlYWRGaWxlU3luYyh1cmwsICd1dGY4Jyk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGlzIEFuYWx5emVyIHdpbGwgYW5hbHl6ZSB0aGUgZmlsZXMgdGhhdCBoYXZlIGRlY29yYXRlZCBjbGFzc2VzIHRoYXQgbmVlZCB0byBiZSB0cmFuc2Zvcm1lZC5cbiAqL1xuZXhwb3J0IGNsYXNzIERlY29yYXRpb25BbmFseXplciB7XG4gIHJlc291cmNlTG9hZGVyID0gbmV3IEZpbGVSZXNvdXJjZUxvYWRlcigpO1xuICBzY29wZVJlZ2lzdHJ5ID0gbmV3IFNlbGVjdG9yU2NvcGVSZWdpc3RyeSh0aGlzLnR5cGVDaGVja2VyLCB0aGlzLmhvc3QpO1xuICBoYW5kbGVyczogRGVjb3JhdG9ySGFuZGxlcjxhbnksIGFueT5bXSA9IFtcbiAgICBuZXcgQmFzZURlZkRlY29yYXRvckhhbmRsZXIodGhpcy50eXBlQ2hlY2tlciwgdGhpcy5ob3N0KSxcbiAgICBuZXcgQ29tcG9uZW50RGVjb3JhdG9ySGFuZGxlcihcbiAgICAgICAgdGhpcy50eXBlQ2hlY2tlciwgdGhpcy5ob3N0LCB0aGlzLnNjb3BlUmVnaXN0cnksIHRoaXMuaXNDb3JlLCB0aGlzLnJlc291cmNlTG9hZGVyLFxuICAgICAgICB0aGlzLnJvb3REaXJzLCAvKiBkZWZhdWx0UHJlc2VydmVXaGl0ZXNwYWNlcyAqLyBmYWxzZSwgLyogaTE4blVzZUV4dGVybmFsSWRzICovIHRydWUpLFxuICAgIG5ldyBEaXJlY3RpdmVEZWNvcmF0b3JIYW5kbGVyKHRoaXMudHlwZUNoZWNrZXIsIHRoaXMuaG9zdCwgdGhpcy5zY29wZVJlZ2lzdHJ5LCB0aGlzLmlzQ29yZSksXG4gICAgbmV3IEluamVjdGFibGVEZWNvcmF0b3JIYW5kbGVyKHRoaXMuaG9zdCwgdGhpcy5pc0NvcmUpLFxuICAgIG5ldyBOZ01vZHVsZURlY29yYXRvckhhbmRsZXIoXG4gICAgICAgIHRoaXMudHlwZUNoZWNrZXIsIHRoaXMuaG9zdCwgdGhpcy5zY29wZVJlZ2lzdHJ5LCB0aGlzLnJlZmVyZW5jZXNSZWdpc3RyeSwgdGhpcy5pc0NvcmUpLFxuICAgIG5ldyBQaXBlRGVjb3JhdG9ySGFuZGxlcih0aGlzLnR5cGVDaGVja2VyLCB0aGlzLmhvc3QsIHRoaXMuc2NvcGVSZWdpc3RyeSwgdGhpcy5pc0NvcmUpLFxuICBdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSB0eXBlQ2hlY2tlcjogdHMuVHlwZUNoZWNrZXIsIHByaXZhdGUgaG9zdDogTmdjY1JlZmxlY3Rpb25Ib3N0LFxuICAgICAgcHJpdmF0ZSByZWZlcmVuY2VzUmVnaXN0cnk6IFJlZmVyZW5jZXNSZWdpc3RyeSwgcHJpdmF0ZSByb290RGlyczogc3RyaW5nW10sXG4gICAgICBwcml2YXRlIGlzQ29yZTogYm9vbGVhbikge31cblxuICAvKipcbiAgICogQW5hbHl6ZSBhIHByb2dyYW0gdG8gZmluZCBhbGwgdGhlIGRlY29yYXRlZCBmaWxlcyBzaG91bGQgYmUgdHJhbnNmb3JtZWQuXG4gICAqIEBwYXJhbSBwcm9ncmFtIFRoZSBwcm9ncmFtIHdob3NlIGZpbGVzIHNob3VsZCBiZSBhbmFseXNlZC5cbiAgICogQHJldHVybnMgYSBtYXAgb2YgdGhlIHNvdXJjZSBmaWxlcyB0byB0aGUgYW5hbHlzaXMgZm9yIHRob3NlIGZpbGVzLlxuICAgKi9cbiAgYW5hbHl6ZVByb2dyYW0ocHJvZ3JhbTogdHMuUHJvZ3JhbSk6IERlY29yYXRpb25BbmFseXNlcyB7XG4gICAgY29uc3QgZGVjb3JhdGlvbkFuYWx5c2VzID0gbmV3IERlY29yYXRpb25BbmFseXNlcygpO1xuICAgIGNvbnN0IGFuYWx5c2VkRmlsZXMgPVxuICAgICAgICBwcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkubWFwKHNvdXJjZUZpbGUgPT4gdGhpcy5hbmFseXplRmlsZShzb3VyY2VGaWxlKSkuZmlsdGVyKGlzRGVmaW5lZCk7XG4gICAgY29uc3QgY29tcGlsZWRGaWxlcyA9IGFuYWx5c2VkRmlsZXMubWFwKGFuYWx5c2VkRmlsZSA9PiB0aGlzLmNvbXBpbGVGaWxlKGFuYWx5c2VkRmlsZSkpO1xuICAgIGNvbXBpbGVkRmlsZXMuZm9yRWFjaChcbiAgICAgICAgY29tcGlsZWRGaWxlID0+IGRlY29yYXRpb25BbmFseXNlcy5zZXQoY29tcGlsZWRGaWxlLnNvdXJjZUZpbGUsIGNvbXBpbGVkRmlsZSkpO1xuICAgIHJldHVybiBkZWNvcmF0aW9uQW5hbHlzZXM7XG4gIH1cblxuICBwcm90ZWN0ZWQgYW5hbHl6ZUZpbGUoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IEFuYWx5emVkRmlsZXx1bmRlZmluZWQge1xuICAgIGNvbnN0IGRlY29yYXRlZENsYXNzZXMgPSB0aGlzLmhvc3QuZmluZERlY29yYXRlZENsYXNzZXMoc291cmNlRmlsZSk7XG4gICAgcmV0dXJuIGRlY29yYXRlZENsYXNzZXMubGVuZ3RoID8ge1xuICAgICAgc291cmNlRmlsZSxcbiAgICAgIGFuYWx5emVkQ2xhc3NlczogZGVjb3JhdGVkQ2xhc3Nlcy5tYXAoY2xhenogPT4gdGhpcy5hbmFseXplQ2xhc3MoY2xhenopKS5maWx0ZXIoaXNEZWZpbmVkKVxuICAgIH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZDtcbiAgfVxuXG4gIHByb3RlY3RlZCBhbmFseXplQ2xhc3MoY2xheno6IERlY29yYXRlZENsYXNzKTogQW5hbHl6ZWRDbGFzc3xudWxsIHtcbiAgICBjb25zdCBtYXRjaGluZ0hhbmRsZXJzID0gdGhpcy5oYW5kbGVyc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChoYW5kbGVyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWF0Y2ggPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlci5kZXRlY3QoY2xhenouZGVjbGFyYXRpb24sIGNsYXp6LmRlY29yYXRvcnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge2hhbmRsZXIsIG1hdGNofTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKGlzTWF0Y2hpbmdIYW5kbGVyKTtcblxuICAgIGlmIChtYXRjaGluZ0hhbmRsZXJzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVE9ETy5EaWFnbm9zdGljOiBDbGFzcyBoYXMgbXVsdGlwbGUgQW5ndWxhciBkZWNvcmF0b3JzLicpO1xuICAgIH1cbiAgICBpZiAobWF0Y2hpbmdIYW5kbGVycy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB7aGFuZGxlciwgbWF0Y2h9ID0gbWF0Y2hpbmdIYW5kbGVyc1swXTtcbiAgICBjb25zdCB7YW5hbHlzaXMsIGRpYWdub3N0aWNzfSA9IGhhbmRsZXIuYW5hbHl6ZShjbGF6ei5kZWNsYXJhdGlvbiwgbWF0Y2gpO1xuICAgIHJldHVybiB7Li4uY2xhenosIGhhbmRsZXIsIGFuYWx5c2lzLCBkaWFnbm9zdGljc307XG4gIH1cblxuICBwcm90ZWN0ZWQgY29tcGlsZUZpbGUoYW5hbHl6ZWRGaWxlOiBBbmFseXplZEZpbGUpOiBDb21waWxlZEZpbGUge1xuICAgIGNvbnN0IGNvbnN0YW50UG9vbCA9IG5ldyBDb25zdGFudFBvb2woKTtcbiAgICBjb25zdCBjb21waWxlZENsYXNzZXM6IENvbXBpbGVkQ2xhc3NbXSA9IGFuYWx5emVkRmlsZS5hbmFseXplZENsYXNzZXMubWFwKGFuYWx5emVkQ2xhc3MgPT4ge1xuICAgICAgY29uc3QgY29tcGlsYXRpb24gPSB0aGlzLmNvbXBpbGVDbGFzcyhhbmFseXplZENsYXNzLCBjb25zdGFudFBvb2wpO1xuICAgICAgcmV0dXJuIHsuLi5hbmFseXplZENsYXNzLCBjb21waWxhdGlvbn07XG4gICAgfSk7XG4gICAgcmV0dXJuIHtjb25zdGFudFBvb2wsIHNvdXJjZUZpbGU6IGFuYWx5emVkRmlsZS5zb3VyY2VGaWxlLCBjb21waWxlZENsYXNzZXN9O1xuICB9XG5cbiAgcHJvdGVjdGVkIGNvbXBpbGVDbGFzcyhjbGF6ejogQW5hbHl6ZWRDbGFzcywgY29uc3RhbnRQb29sOiBDb25zdGFudFBvb2wpOiBDb21waWxlUmVzdWx0W10ge1xuICAgIGxldCBjb21waWxhdGlvbiA9IGNsYXp6LmhhbmRsZXIuY29tcGlsZShjbGF6ei5kZWNsYXJhdGlvbiwgY2xhenouYW5hbHlzaXMsIGNvbnN0YW50UG9vbCk7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGNvbXBpbGF0aW9uKSkge1xuICAgICAgY29tcGlsYXRpb24gPSBbY29tcGlsYXRpb25dO1xuICAgIH1cbiAgICByZXR1cm4gY29tcGlsYXRpb247XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNNYXRjaGluZ0hhbmRsZXI8QSwgTT4oaGFuZGxlcjogUGFydGlhbDxNYXRjaGluZ0hhbmRsZXI8QSwgTT4+KTpcbiAgICBoYW5kbGVyIGlzIE1hdGNoaW5nSGFuZGxlcjxBLCBNPiB7XG4gIHJldHVybiAhIWhhbmRsZXIubWF0Y2g7XG59XG4iXX0=