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
        define("@angular/compiler-cli/src/ngtsc/program", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/transformers/nocollapse_hack", "@angular/compiler-cli/src/ngtsc/annotations", "@angular/compiler-cli/src/ngtsc/annotations/src/base_def", "@angular/compiler-cli/src/ngtsc/metadata", "@angular/compiler-cli/src/ngtsc/resource_loader", "@angular/compiler-cli/src/ngtsc/shims", "@angular/compiler-cli/src/ngtsc/switch", "@angular/compiler-cli/src/ngtsc/transform", "@angular/compiler-cli/src/ngtsc/typecheck"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const ts = require("typescript");
    const nocollapse_hack_1 = require("@angular/compiler-cli/src/transformers/nocollapse_hack");
    const annotations_1 = require("@angular/compiler-cli/src/ngtsc/annotations");
    const base_def_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/base_def");
    const metadata_1 = require("@angular/compiler-cli/src/ngtsc/metadata");
    const resource_loader_1 = require("@angular/compiler-cli/src/ngtsc/resource_loader");
    const shims_1 = require("@angular/compiler-cli/src/ngtsc/shims");
    const switch_1 = require("@angular/compiler-cli/src/ngtsc/switch");
    const transform_1 = require("@angular/compiler-cli/src/ngtsc/transform");
    const typecheck_1 = require("@angular/compiler-cli/src/ngtsc/typecheck");
    class NgtscProgram {
        constructor(rootNames, options, host, oldProgram) {
            this.options = options;
            this.compilation = undefined;
            this.factoryToSourceInfo = null;
            this.sourceToFactorySymbols = null;
            this._coreImportsFrom = undefined;
            this._reflector = undefined;
            this._isCore = undefined;
            this.rootDirs = [];
            if (options.rootDirs !== undefined) {
                this.rootDirs.push(...options.rootDirs);
            }
            else if (options.rootDir !== undefined) {
                this.rootDirs.push(options.rootDir);
            }
            else {
                this.rootDirs.push(host.getCurrentDirectory());
            }
            this.closureCompilerEnabled = !!options.annotateForClosureCompiler;
            this.resourceLoader =
                host.readResource !== undefined && host.resourceNameToFileName !== undefined ?
                    new resource_loader_1.HostResourceLoader(host.resourceNameToFileName.bind(host), host.readResource.bind(host)) :
                    new resource_loader_1.FileResourceLoader(host, this.options);
            const shouldGenerateShims = options.allowEmptyCodegenFiles || false;
            this.host = host;
            let rootFiles = [...rootNames];
            const generators = [];
            if (shouldGenerateShims) {
                // Summary generation.
                const summaryGenerator = shims_1.SummaryGenerator.forRootFiles(rootNames);
                // Factory generation.
                const factoryGenerator = shims_1.FactoryGenerator.forRootFiles(rootNames);
                const factoryFileMap = factoryGenerator.factoryFileMap;
                this.factoryToSourceInfo = new Map();
                this.sourceToFactorySymbols = new Map();
                factoryFileMap.forEach((sourceFilePath, factoryPath) => {
                    const moduleSymbolNames = new Set();
                    this.sourceToFactorySymbols.set(sourceFilePath, moduleSymbolNames);
                    this.factoryToSourceInfo.set(factoryPath, { sourceFilePath, moduleSymbolNames });
                });
                const factoryFileNames = Array.from(factoryFileMap.keys());
                rootFiles.push(...factoryFileNames, ...summaryGenerator.getSummaryFileNames());
                generators.push(summaryGenerator, factoryGenerator);
            }
            if (options.flatModuleOutFile !== undefined) {
                const flatModuleId = options.flatModuleId || null;
                const flatIndexGenerator = shims_1.FlatIndexGenerator.forRootFiles(options.flatModuleOutFile, rootNames, flatModuleId);
                if (flatIndexGenerator !== null) {
                    generators.push(flatIndexGenerator);
                    rootFiles.push(flatIndexGenerator.flatIndexPath);
                }
                else {
                    // This error message talks specifically about having a single .ts file in "files". However
                    // the actual logic is a bit more permissive. If a single file exists, that will be taken,
                    // otherwise the highest level (shortest path) "index.ts" file will be used as the flat
                    // module entry point instead. If neither of these conditions apply, the error below is
                    // given.
                    //
                    // The user is not informed about the "index.ts" option as this behavior is deprecated -
                    // an explicit entrypoint should always be specified.
                    throw new Error('Angular compiler option "flatModuleIndex" requires one and only one .ts file in the "files" field.');
                }
            }
            if (generators.length > 0) {
                this.host = new shims_1.GeneratedShimsHostWrapper(host, generators);
            }
            this.tsProgram =
                ts.createProgram(rootFiles, options, this.host, oldProgram && oldProgram.getTsProgram());
        }
        getTsProgram() { return this.tsProgram; }
        getTsOptionDiagnostics(cancellationToken) {
            return this.tsProgram.getOptionsDiagnostics(cancellationToken);
        }
        getNgOptionDiagnostics(cancellationToken) {
            return [];
        }
        getTsSyntacticDiagnostics(sourceFile, cancellationToken) {
            return this.tsProgram.getSyntacticDiagnostics(sourceFile, cancellationToken);
        }
        getNgStructuralDiagnostics(cancellationToken) {
            return [];
        }
        getTsSemanticDiagnostics(sourceFile, cancellationToken) {
            return this.tsProgram.getSemanticDiagnostics(sourceFile, cancellationToken);
        }
        getNgSemanticDiagnostics(fileName, cancellationToken) {
            const compilation = this.ensureAnalyzed();
            const diagnostics = [...compilation.diagnostics];
            if (!!this.options.fullTemplateTypeCheck) {
                const ctx = new typecheck_1.TypeCheckContext();
                compilation.typeCheck(ctx);
                diagnostics.push(...this.compileTypeCheckProgram(ctx));
            }
            return diagnostics;
        }
        loadNgStructureAsync() {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (this.compilation === undefined) {
                    this.compilation = this.makeCompilation();
                }
                yield Promise.all(this.tsProgram.getSourceFiles()
                    .filter(file => !file.fileName.endsWith('.d.ts'))
                    .map(file => this.compilation.analyzeAsync(file))
                    .filter((result) => result !== undefined));
            });
        }
        listLazyRoutes(entryRoute) { return []; }
        getLibrarySummaries() {
            throw new Error('Method not implemented.');
        }
        getEmittedGeneratedFiles() {
            throw new Error('Method not implemented.');
        }
        getEmittedSourceFiles() {
            throw new Error('Method not implemented.');
        }
        ensureAnalyzed() {
            if (this.compilation === undefined) {
                this.compilation = this.makeCompilation();
                this.tsProgram.getSourceFiles()
                    .filter(file => !file.fileName.endsWith('.d.ts'))
                    .forEach(file => this.compilation.analyzeSync(file));
            }
            return this.compilation;
        }
        emit(opts) {
            const emitCallback = opts && opts.emitCallback || defaultEmitCallback;
            this.ensureAnalyzed();
            // Since there is no .d.ts transformation API, .d.ts files are transformed during write.
            const writeFile = (fileName, data, writeByteOrderMark, onError, sourceFiles) => {
                if (fileName.endsWith('.d.ts')) {
                    data = sourceFiles.reduce((data, sf) => this.compilation.transformedDtsFor(sf.fileName, data), data);
                }
                else if (this.closureCompilerEnabled && fileName.endsWith('.ts')) {
                    data = nocollapse_hack_1.nocollapseHack(data);
                }
                this.host.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
            };
            const customTransforms = opts && opts.customTransformers;
            const beforeTransforms = [transform_1.ivyTransformFactory(this.compilation, this.reflector, this.coreImportsFrom)];
            if (this.factoryToSourceInfo !== null) {
                beforeTransforms.push(shims_1.generatedFactoryTransform(this.factoryToSourceInfo, this.coreImportsFrom));
            }
            if (this.isCore) {
                beforeTransforms.push(switch_1.ivySwitchTransform);
            }
            if (customTransforms && customTransforms.beforeTs) {
                beforeTransforms.push(...customTransforms.beforeTs);
            }
            // Run the emit, including a custom transformer that will downlevel the Ivy decorators in code.
            const emitResult = emitCallback({
                program: this.tsProgram,
                host: this.host,
                options: this.options,
                emitOnlyDtsFiles: false, writeFile,
                customTransformers: {
                    before: beforeTransforms,
                    after: customTransforms && customTransforms.afterTs,
                },
            });
            return emitResult;
        }
        compileTypeCheckProgram(ctx) {
            const host = new typecheck_1.TypeCheckProgramHost(this.tsProgram, this.host, ctx);
            const auxProgram = ts.createProgram({
                host,
                rootNames: this.tsProgram.getRootFileNames(),
                oldProgram: this.tsProgram,
                options: this.options,
            });
            return auxProgram.getSemanticDiagnostics();
        }
        makeCompilation() {
            const checker = this.tsProgram.getTypeChecker();
            const scopeRegistry = new annotations_1.SelectorScopeRegistry(checker, this.reflector);
            const referencesRegistry = new annotations_1.NoopReferencesRegistry();
            // Set up the IvyCompilation, which manages state for the Ivy transformer.
            const handlers = [
                new base_def_1.BaseDefDecoratorHandler(checker, this.reflector),
                new annotations_1.ComponentDecoratorHandler(checker, this.reflector, scopeRegistry, this.isCore, this.resourceLoader, this.rootDirs, this.options.preserveWhitespaces || false, this.options.i18nUseExternalIds !== false),
                new annotations_1.DirectiveDecoratorHandler(checker, this.reflector, scopeRegistry, this.isCore),
                new annotations_1.InjectableDecoratorHandler(this.reflector, this.isCore),
                new annotations_1.NgModuleDecoratorHandler(checker, this.reflector, scopeRegistry, referencesRegistry, this.isCore),
                new annotations_1.PipeDecoratorHandler(checker, this.reflector, scopeRegistry, this.isCore),
            ];
            return new transform_1.IvyCompilation(handlers, checker, this.reflector, this.coreImportsFrom, this.sourceToFactorySymbols);
        }
        get reflector() {
            if (this._reflector === undefined) {
                this._reflector = new metadata_1.TypeScriptReflectionHost(this.tsProgram.getTypeChecker());
            }
            return this._reflector;
        }
        get coreImportsFrom() {
            if (this._coreImportsFrom === undefined) {
                this._coreImportsFrom = this.isCore && getR3SymbolsFile(this.tsProgram) || null;
            }
            return this._coreImportsFrom;
        }
        get isCore() {
            if (this._isCore === undefined) {
                this._isCore = isAngularCorePackage(this.tsProgram);
            }
            return this._isCore;
        }
    }
    exports.NgtscProgram = NgtscProgram;
    const defaultEmitCallback = ({ program, targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers }) => program.emit(targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers);
    function mergeEmitResults(emitResults) {
        const diagnostics = [];
        let emitSkipped = false;
        const emittedFiles = [];
        for (const er of emitResults) {
            diagnostics.push(...er.diagnostics);
            emitSkipped = emitSkipped || er.emitSkipped;
            emittedFiles.push(...(er.emittedFiles || []));
        }
        return { diagnostics, emitSkipped, emittedFiles };
    }
    /**
     * Find the 'r3_symbols.ts' file in the given `Program`, or return `null` if it wasn't there.
     */
    function getR3SymbolsFile(program) {
        return program.getSourceFiles().find(file => file.fileName.indexOf('r3_symbols.ts') >= 0) || null;
    }
    /**
     * Determine if the given `Program` is @angular/core.
     */
    function isAngularCorePackage(program) {
        // Look for its_just_angular.ts somewhere in the program.
        const r3Symbols = getR3SymbolsFile(program);
        if (r3Symbols === null) {
            return false;
        }
        // Look for the constant ITS_JUST_ANGULAR in that file.
        return r3Symbols.statements.some(stmt => {
            // The statement must be a variable declaration statement.
            if (!ts.isVariableStatement(stmt)) {
                return false;
            }
            // It must be exported.
            if (stmt.modifiers === undefined ||
                !stmt.modifiers.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword)) {
                return false;
            }
            // It must declare ITS_JUST_ANGULAR.
            return stmt.declarationList.declarations.some(decl => {
                // The declaration must match the name.
                if (!ts.isIdentifier(decl.name) || decl.name.text !== 'ITS_JUST_ANGULAR') {
                    return false;
                }
                // It must initialize the variable to true.
                if (decl.initializer === undefined || decl.initializer.kind !== ts.SyntaxKind.TrueKeyword) {
                    return false;
                }
                // This definition matches.
                return true;
            });
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3JhbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvcHJvZ3JhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFJSCxpQ0FBaUM7SUFHakMsNEZBQStEO0lBRS9ELDZFQUE4TjtJQUM5Tix1RkFBbUU7SUFDbkUsdUVBQW9EO0lBQ3BELHFGQUF5RTtJQUN6RSxpRUFBaUs7SUFDakssbUVBQTRDO0lBQzVDLHlFQUFnRTtJQUNoRSx5RUFBbUU7SUFFbkUsTUFBYSxZQUFZO1FBY3ZCLFlBQ0ksU0FBZ0MsRUFBVSxPQUE0QixFQUN0RSxJQUFzQixFQUFFLFVBQXdCO1lBRE4sWUFBTyxHQUFQLE9BQU8sQ0FBcUI7WUFabEUsZ0JBQVcsR0FBNkIsU0FBUyxDQUFDO1lBQ2xELHdCQUFtQixHQUFrQyxJQUFJLENBQUM7WUFDMUQsMkJBQXNCLEdBQWtDLElBQUksQ0FBQztZQUU3RCxxQkFBZ0IsR0FBaUMsU0FBUyxDQUFDO1lBQzNELGVBQVUsR0FBdUMsU0FBUyxDQUFDO1lBQzNELFlBQU8sR0FBc0IsU0FBUyxDQUFDO1lBUTdDLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1lBQ25CLElBQUksT0FBTyxDQUFDLFFBQVEsS0FBSyxTQUFTLEVBQUU7Z0JBQ2xDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ3pDO2lCQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sS0FBSyxTQUFTLEVBQUU7Z0JBQ3hDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNyQztpQkFBTTtnQkFDTCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFD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QTJCO2dCQUMzQixPQUFPLElBQUksQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0dlbmVyYXRlZEZpbGV9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0ICogYXMgYXBpIGZyb20gJy4uL3RyYW5zZm9ybWVycy9hcGknO1xuaW1wb3J0IHtub2NvbGxhcHNlSGFja30gZnJvbSAnLi4vdHJhbnNmb3JtZXJzL25vY29sbGFwc2VfaGFjayc7XG5cbmltcG9ydCB7Q29tcG9uZW50RGVjb3JhdG9ySGFuZGxlciwgRGlyZWN0aXZlRGVjb3JhdG9ySGFuZGxlciwgSW5qZWN0YWJsZURlY29yYXRvckhhbmRsZXIsIE5nTW9kdWxlRGVjb3JhdG9ySGFuZGxlciwgTm9vcFJlZmVyZW5jZXNSZWdpc3RyeSwgUGlwZURlY29yYXRvckhhbmRsZXIsIFJlc291cmNlTG9hZGVyLCBTZWxlY3RvclNjb3BlUmVnaXN0cnl9IGZyb20gJy4vYW5ub3RhdGlvbnMnO1xuaW1wb3J0IHtCYXNlRGVmRGVjb3JhdG9ySGFuZGxlcn0gZnJvbSAnLi9hbm5vdGF0aW9ucy9zcmMvYmFzZV9kZWYnO1xuaW1wb3J0IHtUeXBlU2NyaXB0UmVmbGVjdGlvbkhvc3R9IGZyb20gJy4vbWV0YWRhdGEnO1xuaW1wb3J0IHtGaWxlUmVzb3VyY2VMb2FkZXIsIEhvc3RSZXNvdXJjZUxvYWRlcn0gZnJvbSAnLi9yZXNvdXJjZV9sb2FkZXInO1xuaW1wb3J0IHtGYWN0b3J5R2VuZXJhdG9yLCBGYWN0b3J5SW5mbywgRmxhdEluZGV4R2VuZXJhdG9yLCBHZW5lcmF0ZWRTaGltc0hvc3RXcmFwcGVyLCBTaGltR2VuZXJhdG9yLCBTdW1tYXJ5R2VuZXJhdG9yLCBnZW5lcmF0ZWRGYWN0b3J5VHJhbnNmb3JtfSBmcm9tICcuL3NoaW1zJztcbmltcG9ydCB7aXZ5U3dpdGNoVHJhbnNmb3JtfSBmcm9tICcuL3N3aXRjaCc7XG5pbXBvcnQge0l2eUNvbXBpbGF0aW9uLCBpdnlUcmFuc2Zvcm1GYWN0b3J5fSBmcm9tICcuL3RyYW5zZm9ybSc7XG5pbXBvcnQge1R5cGVDaGVja0NvbnRleHQsIFR5cGVDaGVja1Byb2dyYW1Ib3N0fSBmcm9tICcuL3R5cGVjaGVjayc7XG5cbmV4cG9ydCBjbGFzcyBOZ3RzY1Byb2dyYW0gaW1wbGVtZW50cyBhcGkuUHJvZ3JhbSB7XG4gIHByaXZhdGUgdHNQcm9ncmFtOiB0cy5Qcm9ncmFtO1xuICBwcml2YXRlIHJlc291cmNlTG9hZGVyOiBSZXNvdXJjZUxvYWRlcjtcbiAgcHJpdmF0ZSBjb21waWxhdGlvbjogSXZ5Q29tcGlsYXRpb258dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICBwcml2YXRlIGZhY3RvcnlUb1NvdXJjZUluZm86IE1hcDxzdHJpbmcsIEZhY3RvcnlJbmZvPnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBzb3VyY2VUb0ZhY3RvcnlTeW1ib2xzOiBNYXA8c3RyaW5nLCBTZXQ8c3RyaW5nPj58bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgaG9zdDogdHMuQ29tcGlsZXJIb3N0O1xuICBwcml2YXRlIF9jb3JlSW1wb3J0c0Zyb206IHRzLlNvdXJjZUZpbGV8bnVsbHx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIHByaXZhdGUgX3JlZmxlY3RvcjogVHlwZVNjcmlwdFJlZmxlY3Rpb25Ib3N0fHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBfaXNDb3JlOiBib29sZWFufHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSByb290RGlyczogc3RyaW5nW107XG4gIHByaXZhdGUgY2xvc3VyZUNvbXBpbGVyRW5hYmxlZDogYm9vbGVhbjtcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcm9vdE5hbWVzOiBSZWFkb25seUFycmF5PHN0cmluZz4sIHByaXZhdGUgb3B0aW9uczogYXBpLkNvbXBpbGVyT3B0aW9ucyxcbiAgICAgIGhvc3Q6IGFwaS5Db21waWxlckhvc3QsIG9sZFByb2dyYW0/OiBhcGkuUHJvZ3JhbSkge1xuICAgIHRoaXMucm9vdERpcnMgPSBbXTtcbiAgICBpZiAob3B0aW9ucy5yb290RGlycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnJvb3REaXJzLnB1c2goLi4ub3B0aW9ucy5yb290RGlycyk7XG4gICAgfSBlbHNlIGlmIChvcHRpb25zLnJvb3REaXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5yb290RGlycy5wdXNoKG9wdGlvbnMucm9vdERpcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucm9vdERpcnMucHVzaChob3N0LmdldEN1cnJlbnREaXJlY3RvcnkoKSk7XG4gICAgfVxuICAgIHRoaXMuY2xvc3VyZUNvbXBpbGVyRW5hYmxlZCA9ICEhb3B0aW9ucy5hbm5vdGF0ZUZvckNsb3N1cmVDb21waWxlcjtcbiAgICB0aGlzLnJlc291cmNlTG9hZGVyID1cbiAgICAgICAgaG9zdC5yZWFkUmVzb3VyY2UgIT09IHVuZGVmaW5lZCAmJiBob3N0LnJlc291cmNlTmFtZVRvRmlsZU5hbWUgIT09IHVuZGVmaW5lZCA/XG4gICAgICAgIG5ldyBIb3N0UmVzb3VyY2VMb2FkZXIoXG4gICAgICAgICAgICBob3N0LnJlc291cmNlTmFtZVRvRmlsZU5hbWUuYmluZChob3N0KSwgaG9zdC5yZWFkUmVzb3VyY2UuYmluZChob3N0KSkgOlxuICAgICAgICBuZXcgRmlsZVJlc291cmNlTG9hZGVyKGhvc3QsIHRoaXMub3B0aW9ucyk7XG4gICAgY29uc3Qgc2hvdWxkR2VuZXJhdGVTaGltcyA9IG9wdGlvbnMuYWxsb3dFbXB0eUNvZGVnZW5GaWxlcyB8fCBmYWxzZTtcbiAgICB0aGlzLmhvc3QgPSBob3N0O1xuICAgIGxldCByb290RmlsZXMgPSBbLi4ucm9vdE5hbWVzXTtcblxuICAgIGNvbnN0IGdlbmVyYXRvcnM6IFNoaW1HZW5lcmF0b3JbXSA9IFtdO1xuICAgIGlmIChzaG91bGRHZW5lcmF0ZVNoaW1zKSB7XG4gICAgICAvLyBTdW1tYXJ5IGdlbmVyYXRpb24uXG4gICAgICBjb25zdCBzdW1tYXJ5R2VuZXJhdG9yID0gU3VtbWFyeUdlbmVyYXRvci5mb3JSb290RmlsZXMocm9vdE5hbWVzKTtcblxuICAgICAgLy8gRmFjdG9yeSBnZW5lcmF0aW9uLlxuICAgICAgY29uc3QgZmFjdG9yeUdlbmVyYXRvciA9IEZhY3RvcnlHZW5lcmF0b3IuZm9yUm9vdEZpbGVzKHJvb3ROYW1lcyk7XG4gICAgICBjb25zdCBmYWN0b3J5RmlsZU1hcCA9IGZhY3RvcnlHZW5lcmF0b3IuZmFjdG9yeUZpbGVNYXA7XG4gICAgICB0aGlzLmZhY3RvcnlUb1NvdXJjZUluZm8gPSBuZXcgTWFwPHN0cmluZywgRmFjdG9yeUluZm8+KCk7XG4gICAgICB0aGlzLnNvdXJjZVRvRmFjdG9yeVN5bWJvbHMgPSBuZXcgTWFwPHN0cmluZywgU2V0PHN0cmluZz4+KCk7XG4gICAgICBmYWN0b3J5RmlsZU1hcC5mb3JFYWNoKChzb3VyY2VGaWxlUGF0aCwgZmFjdG9yeVBhdGgpID0+IHtcbiAgICAgICAgY29uc3QgbW9kdWxlU3ltYm9sTmFtZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgICAgdGhpcy5zb3VyY2VUb0ZhY3RvcnlTeW1ib2xzICEuc2V0KHNvdXJjZUZpbGVQYXRoLCBtb2R1bGVTeW1ib2xOYW1lcyk7XG4gICAgICAgIHRoaXMuZmFjdG9yeVRvU291cmNlSW5mbyAhLnNldChmYWN0b3J5UGF0aCwge3NvdXJjZUZpbGVQYXRoLCBtb2R1bGVTeW1ib2xOYW1lc30pO1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGZhY3RvcnlGaWxlTmFtZXMgPSBBcnJheS5mcm9tKGZhY3RvcnlGaWxlTWFwLmtleXMoKSk7XG4gICAgICByb290RmlsZXMucHVzaCguLi5mYWN0b3J5RmlsZU5hbWVzLCAuLi5zdW1tYXJ5R2VuZXJhdG9yLmdldFN1bW1hcnlGaWxlTmFtZXMoKSk7XG4gICAgICBnZW5lcmF0b3JzLnB1c2goc3VtbWFyeUdlbmVyYXRvciwgZmFjdG9yeUdlbmVyYXRvcik7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuZmxhdE1vZHVsZU91dEZpbGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgZmxhdE1vZHVsZUlkID0gb3B0aW9ucy5mbGF0TW9kdWxlSWQgfHwgbnVsbDtcbiAgICAgIGNvbnN0IGZsYXRJbmRleEdlbmVyYXRvciA9XG4gICAgICAgICAgRmxhdEluZGV4R2VuZXJhdG9yLmZvclJvb3RGaWxlcyhvcHRpb25zLmZsYXRNb2R1bGVPdXRGaWxlLCByb290TmFtZXMsIGZsYXRNb2R1bGVJZCk7XG4gICAgICBpZiAoZmxhdEluZGV4R2VuZXJhdG9yICE9PSBudWxsKSB7XG4gICAgICAgIGdlbmVyYXRvcnMucHVzaChmbGF0SW5kZXhHZW5lcmF0b3IpO1xuICAgICAgICByb290RmlsZXMucHVzaChmbGF0SW5kZXhHZW5lcmF0b3IuZmxhdEluZGV4UGF0aCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUaGlzIGVycm9yIG1lc3NhZ2UgdGFsa3Mgc3BlY2lmaWNhbGx5IGFib3V0IGhhdmluZyBhIHNpbmdsZSAudHMgZmlsZSBpbiBcImZpbGVzXCIuIEhvd2V2ZXJcbiAgICAgICAgLy8gdGhlIGFjdHVhbCBsb2dpYyBpcyBhIGJpdCBtb3JlIHBlcm1pc3NpdmUuIElmIGEgc2luZ2xlIGZpbGUgZXhpc3RzLCB0aGF0IHdpbGwgYmUgdGFrZW4sXG4gICAgICAgIC8vIG90aGVyd2lzZSB0aGUgaGlnaGVzdCBsZXZlbCAoc2hvcnRlc3QgcGF0aCkgXCJpbmRleC50c1wiIGZpbGUgd2lsbCBiZSB1c2VkIGFzIHRoZSBmbGF0XG4gICAgICAgIC8vIG1vZHVsZSBlbnRyeSBwb2ludCBpbnN0ZWFkLiBJZiBuZWl0aGVyIG9mIHRoZXNlIGNvbmRpdGlvbnMgYXBwbHksIHRoZSBlcnJvciBiZWxvdyBpc1xuICAgICAgICAvLyBnaXZlbi5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhlIHVzZXIgaXMgbm90IGluZm9ybWVkIGFib3V0IHRoZSBcImluZGV4LnRzXCIgb3B0aW9uIGFzIHRoaXMgYmVoYXZpb3IgaXMgZGVwcmVjYXRlZCAtXG4gICAgICAgIC8vIGFuIGV4cGxpY2l0IGVudHJ5cG9pbnQgc2hvdWxkIGFsd2F5cyBiZSBzcGVjaWZpZWQuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICdBbmd1bGFyIGNvbXBpbGVyIG9wdGlvbiBcImZsYXRNb2R1bGVJbmRleFwiIHJlcXVpcmVzIG9uZSBhbmQgb25seSBvbmUgLnRzIGZpbGUgaW4gdGhlIFwiZmlsZXNcIiBmaWVsZC4nKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZ2VuZXJhdG9ycy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLmhvc3QgPSBuZXcgR2VuZXJhdGVkU2hpbXNIb3N0V3JhcHBlcihob3N0LCBnZW5lcmF0b3JzKTtcbiAgICB9XG5cbiAgICB0aGlzLnRzUHJvZ3JhbSA9XG4gICAgICAgIHRzLmNyZWF0ZVByb2dyYW0ocm9vdEZpbGVzLCBvcHRpb25zLCB0aGlzLmhvc3QsIG9sZFByb2dyYW0gJiYgb2xkUHJvZ3JhbS5nZXRUc1Byb2dyYW0oKSk7XG4gIH1cblxuICBnZXRUc1Byb2dyYW0oKTogdHMuUHJvZ3JhbSB7IHJldHVybiB0aGlzLnRzUHJvZ3JhbTsgfVxuXG4gIGdldFRzT3B0aW9uRGlhZ25vc3RpY3MoY2FuY2VsbGF0aW9uVG9rZW4/OiB0cy5DYW5jZWxsYXRpb25Ub2tlbnxcbiAgICAgICAgICAgICAgICAgICAgICAgICB1bmRlZmluZWQpOiBSZWFkb25seUFycmF5PHRzLkRpYWdub3N0aWM+IHtcbiAgICByZXR1cm4gdGhpcy50c1Byb2dyYW0uZ2V0T3B0aW9uc0RpYWdub3N0aWNzKGNhbmNlbGxhdGlvblRva2VuKTtcbiAgfVxuXG4gIGdldE5nT3B0aW9uRGlhZ25vc3RpY3MoY2FuY2VsbGF0aW9uVG9rZW4/OiB0cy5DYW5jZWxsYXRpb25Ub2tlbnxcbiAgICAgICAgICAgICAgICAgICAgICAgICB1bmRlZmluZWQpOiBSZWFkb25seUFycmF5PGFwaS5EaWFnbm9zdGljPiB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgZ2V0VHNTeW50YWN0aWNEaWFnbm9zdGljcyhcbiAgICAgIHNvdXJjZUZpbGU/OiB0cy5Tb3VyY2VGaWxlfHVuZGVmaW5lZCxcbiAgICAgIGNhbmNlbGxhdGlvblRva2VuPzogdHMuQ2FuY2VsbGF0aW9uVG9rZW58dW5kZWZpbmVkKTogUmVhZG9ubHlBcnJheTx0cy5EaWFnbm9zdGljPiB7XG4gICAgcmV0dXJuIHRoaXMudHNQcm9ncmFtLmdldFN5bnRhY3RpY0RpYWdub3N0aWNzKHNvdXJjZUZpbGUsIGNhbmNlbGxhdGlvblRva2VuKTtcbiAgfVxuXG4gIGdldE5nU3RydWN0dXJhbERpYWdub3N0aWNzKGNhbmNlbGxhdGlvblRva2VuPzogdHMuQ2FuY2VsbGF0aW9uVG9rZW58XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZCk6IFJlYWRvbmx5QXJyYXk8YXBpLkRpYWdub3N0aWM+IHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBnZXRUc1NlbWFudGljRGlhZ25vc3RpY3MoXG4gICAgICBzb3VyY2VGaWxlPzogdHMuU291cmNlRmlsZXx1bmRlZmluZWQsXG4gICAgICBjYW5jZWxsYXRpb25Ub2tlbj86IHRzLkNhbmNlbGxhdGlvblRva2VufHVuZGVmaW5lZCk6IFJlYWRvbmx5QXJyYXk8dHMuRGlhZ25vc3RpYz4ge1xuICAgIHJldHVybiB0aGlzLnRzUHJvZ3JhbS5nZXRTZW1hbnRpY0RpYWdub3N0aWNzKHNvdXJjZUZpbGUsIGNhbmNlbGxhdGlvblRva2VuKTtcbiAgfVxuXG4gIGdldE5nU2VtYW50aWNEaWFnbm9zdGljcyhcbiAgICAgIGZpbGVOYW1lPzogc3RyaW5nfHVuZGVmaW5lZCwgY2FuY2VsbGF0aW9uVG9rZW4/OiB0cy5DYW5jZWxsYXRpb25Ub2tlbnxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkKTogUmVhZG9ubHlBcnJheTx0cy5EaWFnbm9zdGljfGFwaS5EaWFnbm9zdGljPiB7XG4gICAgY29uc3QgY29tcGlsYXRpb24gPSB0aGlzLmVuc3VyZUFuYWx5emVkKCk7XG4gICAgY29uc3QgZGlhZ25vc3RpY3MgPSBbLi4uY29tcGlsYXRpb24uZGlhZ25vc3RpY3NdO1xuICAgIGlmICghIXRoaXMub3B0aW9ucy5mdWxsVGVtcGxhdGVUeXBlQ2hlY2spIHtcbiAgICAgIGNvbnN0IGN0eCA9IG5ldyBUeXBlQ2hlY2tDb250ZXh0KCk7XG4gICAgICBjb21waWxhdGlvbi50eXBlQ2hlY2soY3R4KTtcbiAgICAgIGRpYWdub3N0aWNzLnB1c2goLi4udGhpcy5jb21waWxlVHlwZUNoZWNrUHJvZ3JhbShjdHgpKTtcbiAgICB9XG4gICAgcmV0dXJuIGRpYWdub3N0aWNzO1xuICB9XG5cbiAgYXN5bmMgbG9hZE5nU3RydWN0dXJlQXN5bmMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuY29tcGlsYXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5jb21waWxhdGlvbiA9IHRoaXMubWFrZUNvbXBpbGF0aW9uKCk7XG4gICAgfVxuICAgIGF3YWl0IFByb21pc2UuYWxsKHRoaXMudHNQcm9ncmFtLmdldFNvdXJjZUZpbGVzKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihmaWxlID0+ICFmaWxlLmZpbGVOYW1lLmVuZHNXaXRoKCcuZC50cycpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKGZpbGUgPT4gdGhpcy5jb21waWxhdGlvbiAhLmFuYWx5emVBc3luYyhmaWxlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigocmVzdWx0KTogcmVzdWx0IGlzIFByb21pc2U8dm9pZD4gPT4gcmVzdWx0ICE9PSB1bmRlZmluZWQpKTtcbiAgfVxuXG4gIGxpc3RMYXp5Um91dGVzKGVudHJ5Um91dGU/OiBzdHJpbmd8dW5kZWZpbmVkKTogYXBpLkxhenlSb3V0ZVtdIHsgcmV0dXJuIFtdOyB9XG5cbiAgZ2V0TGlicmFyeVN1bW1hcmllcygpOiBNYXA8c3RyaW5nLCBhcGkuTGlicmFyeVN1bW1hcnk+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ01ldGhvZCBub3QgaW1wbGVtZW50ZWQuJyk7XG4gIH1cblxuICBnZXRFbWl0dGVkR2VuZXJhdGVkRmlsZXMoKTogTWFwPHN0cmluZywgR2VuZXJhdGVkRmlsZT4ge1xuICAgIHRocm93IG5ldyBFcnJvcignTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC4nKTtcbiAgfVxuXG4gIGdldEVtaXR0ZWRTb3VyY2VGaWxlcygpOiBNYXA8c3RyaW5nLCB0cy5Tb3VyY2VGaWxlPiB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdNZXRob2Qgbm90IGltcGxlbWVudGVkLicpO1xuICB9XG5cbiAgcHJpdmF0ZSBlbnN1cmVBbmFseXplZCgpOiBJdnlDb21waWxhdGlvbiB7XG4gICAgaWYgKHRoaXMuY29tcGlsYXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5jb21waWxhdGlvbiA9IHRoaXMubWFrZUNvbXBpbGF0aW9uKCk7XG4gICAgICB0aGlzLnRzUHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpXG4gICAgICAgICAgLmZpbHRlcihmaWxlID0+ICFmaWxlLmZpbGVOYW1lLmVuZHNXaXRoKCcuZC50cycpKVxuICAgICAgICAgIC5mb3JFYWNoKGZpbGUgPT4gdGhpcy5jb21waWxhdGlvbiAhLmFuYWx5emVTeW5jKGZpbGUpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY29tcGlsYXRpb247XG4gIH1cblxuICBlbWl0KG9wdHM/OiB7XG4gICAgZW1pdEZsYWdzPzogYXBpLkVtaXRGbGFncyxcbiAgICBjYW5jZWxsYXRpb25Ub2tlbj86IHRzLkNhbmNlbGxhdGlvblRva2VuLFxuICAgIGN1c3RvbVRyYW5zZm9ybWVycz86IGFwaS5DdXN0b21UcmFuc2Zvcm1lcnMsXG4gICAgZW1pdENhbGxiYWNrPzogYXBpLlRzRW1pdENhbGxiYWNrLFxuICAgIG1lcmdlRW1pdFJlc3VsdHNDYWxsYmFjaz86IGFwaS5Uc01lcmdlRW1pdFJlc3VsdHNDYWxsYmFja1xuICB9KTogdHMuRW1pdFJlc3VsdCB7XG4gICAgY29uc3QgZW1pdENhbGxiYWNrID0gb3B0cyAmJiBvcHRzLmVtaXRDYWxsYmFjayB8fCBkZWZhdWx0RW1pdENhbGxiYWNrO1xuXG4gICAgdGhpcy5lbnN1cmVBbmFseXplZCgpO1xuXG4gICAgLy8gU2luY2UgdGhlcmUgaXMgbm8gLmQudHMgdHJhbnNmb3JtYXRpb24gQVBJLCAuZC50cyBmaWxlcyBhcmUgdHJhbnNmb3JtZWQgZHVyaW5nIHdyaXRlLlxuICAgIGNvbnN0IHdyaXRlRmlsZTogdHMuV3JpdGVGaWxlQ2FsbGJhY2sgPVxuICAgICAgICAoZmlsZU5hbWU6IHN0cmluZywgZGF0YTogc3RyaW5nLCB3cml0ZUJ5dGVPcmRlck1hcms6IGJvb2xlYW4sXG4gICAgICAgICBvbkVycm9yOiAoKG1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZCkgfCB1bmRlZmluZWQsXG4gICAgICAgICBzb3VyY2VGaWxlczogUmVhZG9ubHlBcnJheTx0cy5Tb3VyY2VGaWxlPikgPT4ge1xuICAgICAgICAgIGlmIChmaWxlTmFtZS5lbmRzV2l0aCgnLmQudHMnKSkge1xuICAgICAgICAgICAgZGF0YSA9IHNvdXJjZUZpbGVzLnJlZHVjZShcbiAgICAgICAgICAgICAgICAoZGF0YSwgc2YpID0+IHRoaXMuY29tcGlsYXRpb24gIS50cmFuc2Zvcm1lZER0c0ZvcihzZi5maWxlTmFtZSwgZGF0YSksIGRhdGEpO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5jbG9zdXJlQ29tcGlsZXJFbmFibGVkICYmIGZpbGVOYW1lLmVuZHNXaXRoKCcudHMnKSkge1xuICAgICAgICAgICAgZGF0YSA9IG5vY29sbGFwc2VIYWNrKGRhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmhvc3Qud3JpdGVGaWxlKGZpbGVOYW1lLCBkYXRhLCB3cml0ZUJ5dGVPcmRlck1hcmssIG9uRXJyb3IsIHNvdXJjZUZpbGVzKTtcbiAgICAgICAgfTtcblxuICAgIGNvbnN0IGN1c3RvbVRyYW5zZm9ybXMgPSBvcHRzICYmIG9wdHMuY3VzdG9tVHJhbnNmb3JtZXJzO1xuICAgIGNvbnN0IGJlZm9yZVRyYW5zZm9ybXMgPVxuICAgICAgICBbaXZ5VHJhbnNmb3JtRmFjdG9yeSh0aGlzLmNvbXBpbGF0aW9uICEsIHRoaXMucmVmbGVjdG9yLCB0aGlzLmNvcmVJbXBvcnRzRnJvbSldO1xuXG4gICAgaWYgKHRoaXMuZmFjdG9yeVRvU291cmNlSW5mbyAhPT0gbnVsbCkge1xuICAgICAgYmVmb3JlVHJhbnNmb3Jtcy5wdXNoKFxuICAgICAgICAgIGdlbmVyYXRlZEZhY3RvcnlUcmFuc2Zvcm0odGhpcy5mYWN0b3J5VG9Tb3VyY2VJbmZvLCB0aGlzLmNvcmVJbXBvcnRzRnJvbSkpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0NvcmUpIHtcbiAgICAgIGJlZm9yZVRyYW5zZm9ybXMucHVzaChpdnlTd2l0Y2hUcmFuc2Zvcm0pO1xuICAgIH1cbiAgICBpZiAoY3VzdG9tVHJhbnNmb3JtcyAmJiBjdXN0b21UcmFuc2Zvcm1zLmJlZm9yZVRzKSB7XG4gICAgICBiZWZvcmVUcmFuc2Zvcm1zLnB1c2goLi4uY3VzdG9tVHJhbnNmb3Jtcy5iZWZvcmVUcyk7XG4gICAgfVxuXG4gICAgLy8gUnVuIHRoZSBlbWl0LCBpbmNsdWRpbmcgYSBjdXN0b20gdHJhbnNmb3JtZXIgdGhhdCB3aWxsIGRvd25sZXZlbCB0aGUgSXZ5IGRlY29yYXRvcnMgaW4gY29kZS5cbiAgICBjb25zdCBlbWl0UmVzdWx0ID0gZW1pdENhbGxiYWNrKHtcbiAgICAgIHByb2dyYW06IHRoaXMudHNQcm9ncmFtLFxuICAgICAgaG9zdDogdGhpcy5ob3N0LFxuICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgZW1pdE9ubHlEdHNGaWxlczogZmFsc2UsIHdyaXRlRmlsZSxcbiAgICAgIGN1c3RvbVRyYW5zZm9ybWVyczoge1xuICAgICAgICBiZWZvcmU6IGJlZm9yZVRyYW5zZm9ybXMsXG4gICAgICAgIGFmdGVyOiBjdXN0b21UcmFuc2Zvcm1zICYmIGN1c3RvbVRyYW5zZm9ybXMuYWZ0ZXJUcyxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgcmV0dXJuIGVtaXRSZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIGNvbXBpbGVUeXBlQ2hlY2tQcm9ncmFtKGN0eDogVHlwZUNoZWNrQ29udGV4dCk6IFJlYWRvbmx5QXJyYXk8dHMuRGlhZ25vc3RpYz4ge1xuICAgIGNvbnN0IGhvc3QgPSBuZXcgVHlwZUNoZWNrUHJvZ3JhbUhvc3QodGhpcy50c1Byb2dyYW0sIHRoaXMuaG9zdCwgY3R4KTtcbiAgICBjb25zdCBhdXhQcm9ncmFtID0gdHMuY3JlYXRlUHJvZ3JhbSh7XG4gICAgICBob3N0LFxuICAgICAgcm9vdE5hbWVzOiB0aGlzLnRzUHJvZ3JhbS5nZXRSb290RmlsZU5hbWVzKCksXG4gICAgICBvbGRQcm9ncmFtOiB0aGlzLnRzUHJvZ3JhbSxcbiAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICB9KTtcbiAgICByZXR1cm4gYXV4UHJvZ3JhbS5nZXRTZW1hbnRpY0RpYWdub3N0aWNzKCk7XG4gIH1cblxuICBwcml2YXRlIG1ha2VDb21waWxhdGlvbigpOiBJdnlDb21waWxhdGlvbiB7XG4gICAgY29uc3QgY2hlY2tlciA9IHRoaXMudHNQcm9ncmFtLmdldFR5cGVDaGVja2VyKCk7XG4gICAgY29uc3Qgc2NvcGVSZWdpc3RyeSA9IG5ldyBTZWxlY3RvclNjb3BlUmVnaXN0cnkoY2hlY2tlciwgdGhpcy5yZWZsZWN0b3IpO1xuICAgIGNvbnN0IHJlZmVyZW5jZXNSZWdpc3RyeSA9IG5ldyBOb29wUmVmZXJlbmNlc1JlZ2lzdHJ5KCk7XG5cbiAgICAvLyBTZXQgdXAgdGhlIEl2eUNvbXBpbGF0aW9uLCB3aGljaCBtYW5hZ2VzIHN0YXRlIGZvciB0aGUgSXZ5IHRyYW5zZm9ybWVyLlxuICAgIGNvbnN0IGhhbmRsZXJzID0gW1xuICAgICAgbmV3IEJhc2VEZWZEZWNvcmF0b3JIYW5kbGVyKGNoZWNrZXIsIHRoaXMucmVmbGVjdG9yKSxcbiAgICAgIG5ldyBDb21wb25lbnREZWNvcmF0b3JIYW5kbGVyKFxuICAgICAgICAgIGNoZWNrZXIsIHRoaXMucmVmbGVjdG9yLCBzY29wZVJlZ2lzdHJ5LCB0aGlzLmlzQ29yZSwgdGhpcy5yZXNvdXJjZUxvYWRlciwgdGhpcy5yb290RGlycyxcbiAgICAgICAgICB0aGlzLm9wdGlvbnMucHJlc2VydmVXaGl0ZXNwYWNlcyB8fCBmYWxzZSwgdGhpcy5vcHRpb25zLmkxOG5Vc2VFeHRlcm5hbElkcyAhPT0gZmFsc2UpLFxuICAgICAgbmV3IERpcmVjdGl2ZURlY29yYXRvckhhbmRsZXIoY2hlY2tlciwgdGhpcy5yZWZsZWN0b3IsIHNjb3BlUmVnaXN0cnksIHRoaXMuaXNDb3JlKSxcbiAgICAgIG5ldyBJbmplY3RhYmxlRGVjb3JhdG9ySGFuZGxlcih0aGlzLnJlZmxlY3RvciwgdGhpcy5pc0NvcmUpLFxuICAgICAgbmV3IE5nTW9kdWxlRGVjb3JhdG9ySGFuZGxlcihcbiAgICAgICAgICBjaGVja2VyLCB0aGlzLnJlZmxlY3Rvciwgc2NvcGVSZWdpc3RyeSwgcmVmZXJlbmNlc1JlZ2lzdHJ5LCB0aGlzLmlzQ29yZSksXG4gICAgICBuZXcgUGlwZURlY29yYXRvckhhbmRsZXIoY2hlY2tlciwgdGhpcy5yZWZsZWN0b3IsIHNjb3BlUmVnaXN0cnksIHRoaXMuaXNDb3JlKSxcbiAgICBdO1xuXG4gICAgcmV0dXJuIG5ldyBJdnlDb21waWxhdGlvbihcbiAgICAgICAgaGFuZGxlcnMsIGNoZWNrZXIsIHRoaXMucmVmbGVjdG9yLCB0aGlzLmNvcmVJbXBvcnRzRnJvbSwgdGhpcy5zb3VyY2VUb0ZhY3RvcnlTeW1ib2xzKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IHJlZmxlY3RvcigpOiBUeXBlU2NyaXB0UmVmbGVjdGlvbkhvc3Qge1xuICAgIGlmICh0aGlzLl9yZWZsZWN0b3IgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fcmVmbGVjdG9yID0gbmV3IFR5cGVTY3JpcHRSZWZsZWN0aW9uSG9zdCh0aGlzLnRzUHJvZ3JhbS5nZXRUeXBlQ2hlY2tlcigpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3JlZmxlY3RvcjtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IGNvcmVJbXBvcnRzRnJvbSgpOiB0cy5Tb3VyY2VGaWxlfG51bGwge1xuICAgIGlmICh0aGlzLl9jb3JlSW1wb3J0c0Zyb20gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fY29yZUltcG9ydHNGcm9tID0gdGhpcy5pc0NvcmUgJiYgZ2V0UjNTeW1ib2xzRmlsZSh0aGlzLnRzUHJvZ3JhbSkgfHwgbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2NvcmVJbXBvcnRzRnJvbTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IGlzQ29yZSgpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5faXNDb3JlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuX2lzQ29yZSA9IGlzQW5ndWxhckNvcmVQYWNrYWdlKHRoaXMudHNQcm9ncmFtKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2lzQ29yZTtcbiAgfVxufVxuXG5jb25zdCBkZWZhdWx0RW1pdENhbGxiYWNrOiBhcGkuVHNFbWl0Q2FsbGJhY2sgPVxuICAgICh7cHJvZ3JhbSwgdGFyZ2V0U291cmNlRmlsZSwgd3JpdGVGaWxlLCBjYW5jZWxsYXRpb25Ub2tlbiwgZW1pdE9ubHlEdHNGaWxlcyxcbiAgICAgIGN1c3RvbVRyYW5zZm9ybWVyc30pID0+XG4gICAgICAgIHByb2dyYW0uZW1pdChcbiAgICAgICAgICAgIHRhcmdldFNvdXJjZUZpbGUsIHdyaXRlRmlsZSwgY2FuY2VsbGF0aW9uVG9rZW4sIGVtaXRPbmx5RHRzRmlsZXMsIGN1c3RvbVRyYW5zZm9ybWVycyk7XG5cbmZ1bmN0aW9uIG1lcmdlRW1pdFJlc3VsdHMoZW1pdFJlc3VsdHM6IHRzLkVtaXRSZXN1bHRbXSk6IHRzLkVtaXRSZXN1bHQge1xuICBjb25zdCBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdID0gW107XG4gIGxldCBlbWl0U2tpcHBlZCA9IGZhbHNlO1xuICBjb25zdCBlbWl0dGVkRmlsZXM6IHN0cmluZ1tdID0gW107XG4gIGZvciAoY29uc3QgZXIgb2YgZW1pdFJlc3VsdHMpIHtcbiAgICBkaWFnbm9zdGljcy5wdXNoKC4uLmVyLmRpYWdub3N0aWNzKTtcbiAgICBlbWl0U2tpcHBlZCA9IGVtaXRTa2lwcGVkIHx8IGVyLmVtaXRTa2lwcGVkO1xuICAgIGVtaXR0ZWRGaWxlcy5wdXNoKC4uLihlci5lbWl0dGVkRmlsZXMgfHwgW10pKTtcbiAgfVxuICByZXR1cm4ge2RpYWdub3N0aWNzLCBlbWl0U2tpcHBlZCwgZW1pdHRlZEZpbGVzfTtcbn1cblxuLyoqXG4gKiBGaW5kIHRoZSAncjNfc3ltYm9scy50cycgZmlsZSBpbiB0aGUgZ2l2ZW4gYFByb2dyYW1gLCBvciByZXR1cm4gYG51bGxgIGlmIGl0IHdhc24ndCB0aGVyZS5cbiAqL1xuZnVuY3Rpb24gZ2V0UjNTeW1ib2xzRmlsZShwcm9ncmFtOiB0cy5Qcm9ncmFtKTogdHMuU291cmNlRmlsZXxudWxsIHtcbiAgcmV0dXJuIHByb2dyYW0uZ2V0U291cmNlRmlsZXMoKS5maW5kKGZpbGUgPT4gZmlsZS5maWxlTmFtZS5pbmRleE9mKCdyM19zeW1ib2xzLnRzJykgPj0gMCkgfHwgbnVsbDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgdGhlIGdpdmVuIGBQcm9ncmFtYCBpcyBAYW5ndWxhci9jb3JlLlxuICovXG5mdW5jdGlvbiBpc0FuZ3VsYXJDb3JlUGFja2FnZShwcm9ncmFtOiB0cy5Qcm9ncmFtKTogYm9vbGVhbiB7XG4gIC8vIExvb2sgZm9yIGl0c19qdXN0X2FuZ3VsYXIudHMgc29tZXdoZXJlIGluIHRoZSBwcm9ncmFtLlxuICBjb25zdCByM1N5bWJvbHMgPSBnZXRSM1N5bWJvbHNGaWxlKHByb2dyYW0pO1xuICBpZiAocjNTeW1ib2xzID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gTG9vayBmb3IgdGhlIGNvbnN0YW50IElUU19KVVNUX0FOR1VMQVIgaW4gdGhhdCBmaWxlLlxuICByZXR1cm4gcjNTeW1ib2xzLnN0YXRlbWVudHMuc29tZShzdG10ID0+IHtcbiAgICAvLyBUaGUgc3RhdGVtZW50IG11c3QgYmUgYSB2YXJpYWJsZSBkZWNsYXJhdGlvbiBzdGF0ZW1lbnQuXG4gICAgaWYgKCF0cy5pc1ZhcmlhYmxlU3RhdGVtZW50KHN0bXQpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIEl0IG11c3QgYmUgZXhwb3J0ZWQuXG4gICAgaWYgKHN0bXQubW9kaWZpZXJzID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgIXN0bXQubW9kaWZpZXJzLnNvbWUobW9kID0+IG1vZC5raW5kID09PSB0cy5TeW50YXhLaW5kLkV4cG9ydEtleXdvcmQpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIEl0IG11c3QgZGVjbGFyZSBJVFNfSlVTVF9BTkdVTEFSLlxuICAgIHJldHVybiBzdG10LmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMuc29tZShkZWNsID0+IHtcbiAgICAgIC8vIFRoZSBkZWNsYXJhdGlvbiBtdXN0IG1hdGNoIHRoZSBuYW1lLlxuICAgICAgaWYgKCF0cy5pc0lkZW50aWZpZXIoZGVjbC5uYW1lKSB8fCBkZWNsLm5hbWUudGV4dCAhPT0gJ0lUU19KVVNUX0FOR1VMQVInKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8vIEl0IG11c3QgaW5pdGlhbGl6ZSB0aGUgdmFyaWFibGUgdG8gdHJ1ZS5cbiAgICAgIGlmIChkZWNsLmluaXRpYWxpemVyID09PSB1bmRlZmluZWQgfHwgZGVjbC5pbml0aWFsaXplci5raW5kICE9PSB0cy5TeW50YXhLaW5kLlRydWVLZXl3b3JkKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8vIFRoaXMgZGVmaW5pdGlvbiBtYXRjaGVzLlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH0pO1xufVxuIl19