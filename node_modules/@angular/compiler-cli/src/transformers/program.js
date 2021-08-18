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
        define("@angular/compiler-cli/src/transformers/program", ["require", "exports", "@angular/compiler", "fs", "path", "typescript", "@angular/compiler-cli/src/diagnostics/translate_diagnostics", "@angular/compiler-cli/src/diagnostics/typescript_version", "@angular/compiler-cli/src/metadata/index", "@angular/compiler-cli/src/ngtsc/program", "@angular/compiler-cli/src/transformers/api", "@angular/compiler-cli/src/transformers/compiler_host", "@angular/compiler-cli/src/transformers/inline_resources", "@angular/compiler-cli/src/transformers/lower_expressions", "@angular/compiler-cli/src/transformers/metadata_cache", "@angular/compiler-cli/src/transformers/nocollapse_hack", "@angular/compiler-cli/src/transformers/node_emitter_transform", "@angular/compiler-cli/src/transformers/r3_metadata_transform", "@angular/compiler-cli/src/transformers/r3_strip_decorators", "@angular/compiler-cli/src/transformers/r3_transform", "@angular/compiler-cli/src/transformers/tsc_pass_through", "@angular/compiler-cli/src/transformers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const compiler_1 = require("@angular/compiler");
    const fs = require("fs");
    const path = require("path");
    const ts = require("typescript");
    const translate_diagnostics_1 = require("@angular/compiler-cli/src/diagnostics/translate_diagnostics");
    const typescript_version_1 = require("@angular/compiler-cli/src/diagnostics/typescript_version");
    const metadata_1 = require("@angular/compiler-cli/src/metadata/index");
    const program_1 = require("@angular/compiler-cli/src/ngtsc/program");
    const api_1 = require("@angular/compiler-cli/src/transformers/api");
    const compiler_host_1 = require("@angular/compiler-cli/src/transformers/compiler_host");
    const inline_resources_1 = require("@angular/compiler-cli/src/transformers/inline_resources");
    const lower_expressions_1 = require("@angular/compiler-cli/src/transformers/lower_expressions");
    const metadata_cache_1 = require("@angular/compiler-cli/src/transformers/metadata_cache");
    const nocollapse_hack_1 = require("@angular/compiler-cli/src/transformers/nocollapse_hack");
    const node_emitter_transform_1 = require("@angular/compiler-cli/src/transformers/node_emitter_transform");
    const r3_metadata_transform_1 = require("@angular/compiler-cli/src/transformers/r3_metadata_transform");
    const r3_strip_decorators_1 = require("@angular/compiler-cli/src/transformers/r3_strip_decorators");
    const r3_transform_1 = require("@angular/compiler-cli/src/transformers/r3_transform");
    const tsc_pass_through_1 = require("@angular/compiler-cli/src/transformers/tsc_pass_through");
    const util_1 = require("@angular/compiler-cli/src/transformers/util");
    /**
     * Maximum number of files that are emitable via calling ts.Program.emit
     * passing individual targetSourceFiles.
     */
    const MAX_FILE_COUNT_FOR_SINGLE_FILE_EMIT = 20;
    /**
     * Fields to lower within metadata in render2 mode.
     */
    const LOWER_FIELDS = ['useValue', 'useFactory', 'data', 'id', 'loadChildren'];
    /**
     * Fields to lower within metadata in render3 mode.
     */
    const R3_LOWER_FIELDS = [...LOWER_FIELDS, 'providers', 'imports', 'exports'];
    const R3_REIFIED_DECORATORS = [
        'Component',
        'Directive',
        'Injectable',
        'NgModule',
        'Pipe',
    ];
    const emptyModules = {
        ngModules: [],
        ngModuleByPipeOrDirective: new Map(),
        files: []
    };
    const defaultEmitCallback = ({ program, targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers }) => program.emit(targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers);
    /**
     * Minimum supported TypeScript version
     * ∀ supported typescript version v, v >= MIN_TS_VERSION
     */
    const MIN_TS_VERSION = '3.1.1';
    /**
     * Supremum of supported TypeScript versions
     * ∀ supported typescript version v, v < MAX_TS_VERSION
     * MAX_TS_VERSION is not considered as a supported TypeScript version
     */
    const MAX_TS_VERSION = '3.3.0';
    class AngularCompilerProgram {
        constructor(rootNames, options, host, oldProgram) {
            this.options = options;
            this.host = host;
            this._optionsDiagnostics = [];
            this.rootNames = [...rootNames];
            checkVersion(ts.version, MIN_TS_VERSION, MAX_TS_VERSION, options.disableTypeScriptVersionCheck);
            this.oldTsProgram = oldProgram ? oldProgram.getTsProgram() : undefined;
            if (oldProgram) {
                this.oldProgramLibrarySummaries = oldProgram.getLibrarySummaries();
                this.oldProgramEmittedGeneratedFiles = oldProgram.getEmittedGeneratedFiles();
                this.oldProgramEmittedSourceFiles = oldProgram.getEmittedSourceFiles();
            }
            if (options.flatModuleOutFile) {
                const { host: bundleHost, indexName, errors } = metadata_1.createBundleIndexHost(options, this.rootNames, host, () => this.flatModuleMetadataCache);
                if (errors) {
                    this._optionsDiagnostics.push(...errors.map(e => ({
                        category: e.category,
                        messageText: e.messageText,
                        source: api_1.SOURCE,
                        code: api_1.DEFAULT_ERROR_CODE
                    })));
                }
                else {
                    this.rootNames.push(indexName);
                    this.host = bundleHost;
                }
            }
            this.loweringMetadataTransform =
                new lower_expressions_1.LowerMetadataTransform(options.enableIvy ? R3_LOWER_FIELDS : LOWER_FIELDS);
            this.metadataCache = this.createMetadataCache([this.loweringMetadataTransform]);
        }
        createMetadataCache(transformers) {
            return new metadata_cache_1.MetadataCache(new metadata_1.MetadataCollector({ quotedNames: true }), !!this.options.strictMetadataEmit, transformers);
        }
        getLibrarySummaries() {
            const result = new Map();
            if (this.oldProgramLibrarySummaries) {
                this.oldProgramLibrarySummaries.forEach((summary, fileName) => result.set(fileName, summary));
            }
            if (this.emittedLibrarySummaries) {
                this.emittedLibrarySummaries.forEach((summary, fileName) => result.set(summary.fileName, summary));
            }
            return result;
        }
        getEmittedGeneratedFiles() {
            const result = new Map();
            if (this.oldProgramEmittedGeneratedFiles) {
                this.oldProgramEmittedGeneratedFiles.forEach((genFile, fileName) => result.set(fileName, genFile));
            }
            if (this.emittedGeneratedFiles) {
                this.emittedGeneratedFiles.forEach((genFile) => result.set(genFile.genFileUrl, genFile));
            }
            return result;
        }
        getEmittedSourceFiles() {
            const result = new Map();
            if (this.oldProgramEmittedSourceFiles) {
                this.oldProgramEmittedSourceFiles.forEach((sf, fileName) => result.set(fileName, sf));
            }
            if (this.emittedSourceFiles) {
                this.emittedSourceFiles.forEach((sf) => result.set(sf.fileName, sf));
            }
            return result;
        }
        getTsProgram() { return this.tsProgram; }
        getTsOptionDiagnostics(cancellationToken) {
            return this.tsProgram.getOptionsDiagnostics(cancellationToken);
        }
        getNgOptionDiagnostics(cancellationToken) {
            return [...this._optionsDiagnostics, ...getNgOptionDiagnostics(this.options)];
        }
        getTsSyntacticDiagnostics(sourceFile, cancellationToken) {
            return this.tsProgram.getSyntacticDiagnostics(sourceFile, cancellationToken);
        }
        getNgStructuralDiagnostics(cancellationToken) {
            return this.structuralDiagnostics;
        }
        getTsSemanticDiagnostics(sourceFile, cancellationToken) {
            const sourceFiles = sourceFile ? [sourceFile] : this.tsProgram.getSourceFiles();
            let diags = [];
            sourceFiles.forEach(sf => {
                if (!util_1.GENERATED_FILES.test(sf.fileName)) {
                    diags.push(...this.tsProgram.getSemanticDiagnostics(sf, cancellationToken));
                }
            });
            return diags;
        }
        getNgSemanticDiagnostics(fileName, cancellationToken) {
            let diags = [];
            this.tsProgram.getSourceFiles().forEach(sf => {
                if (util_1.GENERATED_FILES.test(sf.fileName) && !sf.isDeclarationFile) {
                    diags.push(...this.tsProgram.getSemanticDiagnostics(sf, cancellationToken));
                }
            });
            const { ng } = translate_diagnostics_1.translateDiagnostics(this.hostAdapter, diags);
            return ng;
        }
        loadNgStructureAsync() {
            if (this._analyzedModules) {
                throw new Error('Angular structure already loaded');
            }
            return Promise.resolve()
                .then(() => {
                const { tmpProgram, sourceFiles, tsFiles, rootNames } = this._createProgramWithBasicStubs();
                return this.compiler.loadFilesAsync(sourceFiles, tsFiles)
                    .then(({ analyzedModules, analyzedInjectables }) => {
                    if (this._analyzedModules) {
                        throw new Error('Angular structure loaded both synchronously and asynchronously');
                    }
                    this._updateProgramWithTypeCheckStubs(tmpProgram, analyzedModules, analyzedInjectables, rootNames);
                });
            })
                .catch(e => this._createProgramOnError(e));
        }
        listLazyRoutes(route) {
            // Note: Don't analyzedModules if a route is given
            // to be fast enough.
            return this.compiler.listLazyRoutes(route, route ? undefined : this.analyzedModules);
        }
        emit(parameters = {}) {
            if (this.options.enableIvy === 'ngtsc' || this.options.enableIvy === 'tsc') {
                throw new Error('Cannot run legacy compiler in ngtsc mode');
            }
            return this.options.enableIvy === true ? this._emitRender3(parameters) :
                this._emitRender2(parameters);
        }
        _emitRender3({ emitFlags = api_1.EmitFlags.Default, cancellationToken, customTransformers, emitCallback = defaultEmitCallback, mergeEmitResultsCallback = mergeEmitResults, } = {}) {
            const emitStart = Date.now();
            if ((emitFlags & (api_1.EmitFlags.JS | api_1.EmitFlags.DTS | api_1.EmitFlags.Metadata | api_1.EmitFlags.Codegen)) ===
                0) {
                return { emitSkipped: true, diagnostics: [], emittedFiles: [] };
            }
            // analyzedModules and analyzedInjectables are created together. If one exists, so does the
            // other.
            const modules = this.compiler.emitAllPartialModules(this.analyzedModules, this._analyzedInjectables);
            const writeTsFile = (outFileName, outData, writeByteOrderMark, onError, sourceFiles) => {
                const sourceFile = sourceFiles && sourceFiles.length == 1 ? sourceFiles[0] : null;
                let genFile;
                if (this.options.annotateForClosureCompiler && sourceFile &&
                    util_1.TS.test(sourceFile.fileName)) {
                    outData = nocollapse_hack_1.nocollapseHack(outData);
                }
                this.writeFile(outFileName, outData, writeByteOrderMark, onError, undefined, sourceFiles);
            };
            const emitOnlyDtsFiles = (emitFlags & (api_1.EmitFlags.DTS | api_1.EmitFlags.JS)) == api_1.EmitFlags.DTS;
            const tsCustomTransformers = this.calculateTransforms(
            /* genFiles */ undefined, /* partialModules */ modules, 
            /* stripDecorators */ this.reifiedDecorators, customTransformers);
            // Restore the original references before we emit so TypeScript doesn't emit
            // a reference to the .d.ts file.
            const augmentedReferences = new Map();
            for (const sourceFile of this.tsProgram.getSourceFiles()) {
                const originalReferences = compiler_host_1.getOriginalReferences(sourceFile);
                if (originalReferences) {
                    augmentedReferences.set(sourceFile, sourceFile.referencedFiles);
                    sourceFile.referencedFiles = originalReferences;
                }
            }
            try {
                return emitCallback({
                    program: this.tsProgram,
                    host: this.host,
                    options: this.options,
                    writeFile: writeTsFile, emitOnlyDtsFiles,
                    customTransformers: tsCustomTransformers
                });
            }
            finally {
                // Restore the references back to the augmented value to ensure that the
                // checks that TypeScript makes for project structure reuse will succeed.
                for (const [sourceFile, references] of Array.from(augmentedReferences)) {
                    // TODO(chuckj): Remove any cast after updating build to 2.6
                    sourceFile.referencedFiles = references;
                }
            }
        }
        _emitRender2({ emitFlags = api_1.EmitFlags.Default, cancellationToken, customTransformers, emitCallback = defaultEmitCallback, mergeEmitResultsCallback = mergeEmitResults, } = {}) {
            const emitStart = Date.now();
            if (emitFlags & api_1.EmitFlags.I18nBundle) {
                const locale = this.options.i18nOutLocale || null;
                const file = this.options.i18nOutFile || null;
                const format = this.options.i18nOutFormat || null;
                const bundle = this.compiler.emitMessageBundle(this.analyzedModules, locale);
                i18nExtract(format, file, this.host, this.options, bundle);
            }
            if ((emitFlags & (api_1.EmitFlags.JS | api_1.EmitFlags.DTS | api_1.EmitFlags.Metadata | api_1.EmitFlags.Codegen)) ===
                0) {
                return { emitSkipped: true, diagnostics: [], emittedFiles: [] };
            }
            let { genFiles, genDiags } = this.generateFilesForEmit(emitFlags);
            if (genDiags.length) {
                return {
                    diagnostics: genDiags,
                    emitSkipped: true,
                    emittedFiles: [],
                };
            }
            this.emittedGeneratedFiles = genFiles;
            const outSrcMapping = [];
            const genFileByFileName = new Map();
            genFiles.forEach(genFile => genFileByFileName.set(genFile.genFileUrl, genFile));
            this.emittedLibrarySummaries = [];
            const emittedSourceFiles = [];
            const writeTsFile = (outFileName, outData, writeByteOrderMark, onError, sourceFiles) => {
                const sourceFile = sourceFiles && sourceFiles.length == 1 ? sourceFiles[0] : null;
                let genFile;
                if (sourceFile) {
                    outSrcMapping.push({ outFileName: outFileName, sourceFile });
                    genFile = genFileByFileName.get(sourceFile.fileName);
                    if (!sourceFile.isDeclarationFile && !util_1.GENERATED_FILES.test(sourceFile.fileName)) {
                        // Note: sourceFile is the transformed sourcefile, not the original one!
                        const originalFile = this.tsProgram.getSourceFile(sourceFile.fileName);
                        if (originalFile) {
                            emittedSourceFiles.push(originalFile);
                        }
                    }
                    if (this.options.annotateForClosureCompiler && util_1.TS.test(sourceFile.fileName)) {
                        outData = nocollapse_hack_1.nocollapseHack(outData);
                    }
                }
                this.writeFile(outFileName, outData, writeByteOrderMark, onError, genFile, sourceFiles);
            };
            const modules = this._analyzedInjectables &&
                this.compiler.emitAllPartialModules2(this._analyzedInjectables);
            const tsCustomTransformers = this.calculateTransforms(genFileByFileName, modules, /* stripDecorators */ undefined, customTransformers);
            const emitOnlyDtsFiles = (emitFlags & (api_1.EmitFlags.DTS | api_1.EmitFlags.JS)) == api_1.EmitFlags.DTS;
            // Restore the original references before we emit so TypeScript doesn't emit
            // a reference to the .d.ts file.
            const augmentedReferences = new Map();
            for (const sourceFile of this.tsProgram.getSourceFiles()) {
                const originalReferences = compiler_host_1.getOriginalReferences(sourceFile);
                if (originalReferences) {
                    augmentedReferences.set(sourceFile, sourceFile.referencedFiles);
                    sourceFile.referencedFiles = originalReferences;
                }
            }
            const genTsFiles = [];
            const genJsonFiles = [];
            genFiles.forEach(gf => {
                if (gf.stmts) {
                    genTsFiles.push(gf);
                }
                if (gf.source) {
                    genJsonFiles.push(gf);
                }
            });
            let emitResult;
            let emittedUserTsCount;
            try {
                const sourceFilesToEmit = this.getSourceFilesForEmit();
                if (sourceFilesToEmit &&
                    (sourceFilesToEmit.length + genTsFiles.length) < MAX_FILE_COUNT_FOR_SINGLE_FILE_EMIT) {
                    const fileNamesToEmit = [...sourceFilesToEmit.map(sf => sf.fileName), ...genTsFiles.map(gf => gf.genFileUrl)];
                    emitResult = mergeEmitResultsCallback(fileNamesToEmit.map((fileName) => emitResult = emitCallback({
                        program: this.tsProgram,
                        host: this.host,
                        options: this.options,
                        writeFile: writeTsFile, emitOnlyDtsFiles,
                        customTransformers: tsCustomTransformers,
                        targetSourceFile: this.tsProgram.getSourceFile(fileName),
                    })));
                    emittedUserTsCount = sourceFilesToEmit.length;
                }
                else {
                    emitResult = emitCallback({
                        program: this.tsProgram,
                        host: this.host,
                        options: this.options,
                        writeFile: writeTsFile, emitOnlyDtsFiles,
                        customTransformers: tsCustomTransformers
                    });
                    emittedUserTsCount = this.tsProgram.getSourceFiles().length - genTsFiles.length;
                }
            }
            finally {
                // Restore the references back to the augmented value to ensure that the
                // checks that TypeScript makes for project structure reuse will succeed.
                for (const [sourceFile, references] of Array.from(augmentedReferences)) {
                    // TODO(chuckj): Remove any cast after updating build to 2.6
                    sourceFile.referencedFiles = references;
                }
            }
            this.emittedSourceFiles = emittedSourceFiles;
            // Match behavior of tsc: only produce emit diagnostics if it would block
            // emit. If noEmitOnError is false, the emit will happen in spite of any
            // errors, so we should not report them.
            if (this.options.noEmitOnError === true) {
                // translate the diagnostics in the emitResult as well.
                const translatedEmitDiags = translate_diagnostics_1.translateDiagnostics(this.hostAdapter, emitResult.diagnostics);
                emitResult.diagnostics = translatedEmitDiags.ts.concat(this.structuralDiagnostics.concat(translatedEmitDiags.ng).map(util_1.ngToTsDiagnostic));
            }
            if (!outSrcMapping.length) {
                // if no files were emitted by TypeScript, also don't emit .json files
                emitResult.diagnostics =
                    emitResult.diagnostics.concat([util_1.createMessageDiagnostic(`Emitted no files.`)]);
                return emitResult;
            }
            let sampleSrcFileName;
            let sampleOutFileName;
            if (outSrcMapping.length) {
                sampleSrcFileName = outSrcMapping[0].sourceFile.fileName;
                sampleOutFileName = outSrcMapping[0].outFileName;
            }
            const srcToOutPath = createSrcToOutPathMapper(this.options.outDir, sampleSrcFileName, sampleOutFileName);
            if (emitFlags & api_1.EmitFlags.Codegen) {
                genJsonFiles.forEach(gf => {
                    const outFileName = srcToOutPath(gf.genFileUrl);
                    this.writeFile(outFileName, gf.source, false, undefined, gf);
                });
            }
            let metadataJsonCount = 0;
            if (emitFlags & api_1.EmitFlags.Metadata) {
                this.tsProgram.getSourceFiles().forEach(sf => {
                    if (!sf.isDeclarationFile && !util_1.GENERATED_FILES.test(sf.fileName)) {
                        metadataJsonCount++;
                        const metadata = this.metadataCache.getMetadata(sf);
                        if (metadata) {
                            const metadataText = JSON.stringify([metadata]);
                            const outFileName = srcToOutPath(sf.fileName.replace(/\.tsx?$/, '.metadata.json'));
                            this.writeFile(outFileName, metadataText, false, undefined, undefined, [sf]);
                        }
                    }
                });
            }
            const emitEnd = Date.now();
            if (this.options.diagnostics) {
                emitResult.diagnostics = emitResult.diagnostics.concat([util_1.createMessageDiagnostic([
                        `Emitted in ${emitEnd - emitStart}ms`,
                        `- ${emittedUserTsCount} user ts files`,
                        `- ${genTsFiles.length} generated ts files`,
                        `- ${genJsonFiles.length + metadataJsonCount} generated json files`,
                    ].join('\n'))]);
            }
            return emitResult;
        }
        // Private members
        get compiler() {
            if (!this._compiler) {
                this._createCompiler();
            }
            return this._compiler;
        }
        get hostAdapter() {
            if (!this._hostAdapter) {
                this._createCompiler();
            }
            return this._hostAdapter;
        }
        get analyzedModules() {
            if (!this._analyzedModules) {
                this.initSync();
            }
            return this._analyzedModules;
        }
        get structuralDiagnostics() {
            let diagnostics = this._structuralDiagnostics;
            if (!diagnostics) {
                this.initSync();
                diagnostics = (this._structuralDiagnostics = this._structuralDiagnostics || []);
            }
            return diagnostics;
        }
        get tsProgram() {
            if (!this._tsProgram) {
                this.initSync();
            }
            return this._tsProgram;
        }
        get reifiedDecorators() {
            if (!this._reifiedDecorators) {
                const reflector = this.compiler.reflector;
                this._reifiedDecorators = new Set(R3_REIFIED_DECORATORS.map(name => reflector.findDeclaration('@angular/core', name)));
            }
            return this._reifiedDecorators;
        }
        calculateTransforms(genFiles, partialModules, stripDecorators, customTransformers) {
            const beforeTs = [];
            const metadataTransforms = [];
            const flatModuleMetadataTransforms = [];
            if (this.options.enableResourceInlining) {
                beforeTs.push(inline_resources_1.getInlineResourcesTransformFactory(this.tsProgram, this.hostAdapter));
                const transformer = new inline_resources_1.InlineResourcesMetadataTransformer(this.hostAdapter);
                metadataTransforms.push(transformer);
                flatModuleMetadataTransforms.push(transformer);
            }
            if (!this.options.disableExpressionLowering) {
                beforeTs.push(lower_expressions_1.getExpressionLoweringTransformFactory(this.loweringMetadataTransform, this.tsProgram));
                metadataTransforms.push(this.loweringMetadataTransform);
            }
            if (genFiles) {
                beforeTs.push(node_emitter_transform_1.getAngularEmitterTransformFactory(genFiles, this.getTsProgram()));
            }
            if (partialModules) {
                beforeTs.push(r3_transform_1.getAngularClassTransformerFactory(partialModules));
                // If we have partial modules, the cached metadata might be incorrect as it doesn't reflect
                // the partial module transforms.
                const transformer = new r3_metadata_transform_1.PartialModuleMetadataTransformer(partialModules);
                metadataTransforms.push(transformer);
                flatModuleMetadataTransforms.push(transformer);
            }
            if (stripDecorators) {
                beforeTs.push(r3_strip_decorators_1.getDecoratorStripTransformerFactory(stripDecorators, this.compiler.reflector, this.getTsProgram().getTypeChecker()));
                const transformer = new r3_strip_decorators_1.StripDecoratorsMetadataTransformer(stripDecorators, this.compiler.reflector);
                metadataTransforms.push(transformer);
                flatModuleMetadataTransforms.push(transformer);
            }
            if (customTransformers && customTransformers.beforeTs) {
                beforeTs.push(...customTransformers.beforeTs);
            }
            if (metadataTransforms.length > 0) {
                this.metadataCache = this.createMetadataCache(metadataTransforms);
            }
            if (flatModuleMetadataTransforms.length > 0) {
                this.flatModuleMetadataCache = this.createMetadataCache(flatModuleMetadataTransforms);
            }
            const afterTs = customTransformers ? customTransformers.afterTs : undefined;
            return { before: beforeTs, after: afterTs };
        }
        initSync() {
            if (this._analyzedModules) {
                return;
            }
            try {
                const { tmpProgram, sourceFiles, tsFiles, rootNames } = this._createProgramWithBasicStubs();
                const { analyzedModules, analyzedInjectables } = this.compiler.loadFilesSync(sourceFiles, tsFiles);
                this._updateProgramWithTypeCheckStubs(tmpProgram, analyzedModules, analyzedInjectables, rootNames);
            }
            catch (e) {
                this._createProgramOnError(e);
            }
        }
        _createCompiler() {
            const codegen = {
                generateFile: (genFileName, baseFileName) => this._compiler.emitBasicStub(genFileName, baseFileName),
                findGeneratedFileNames: (fileName) => this._compiler.findGeneratedFileNames(fileName),
            };
            this._hostAdapter = new compiler_host_1.TsCompilerAotCompilerTypeCheckHostAdapter(this.rootNames, this.options, this.host, this.metadataCache, codegen, this.oldProgramLibrarySummaries);
            const aotOptions = getAotCompilerOptions(this.options);
            const errorCollector = (this.options.collectAllErrors || this.options.fullTemplateTypeCheck) ?
                (err) => this._addStructuralDiagnostics(err) :
                undefined;
            this._compiler = compiler_1.createAotCompiler(this._hostAdapter, aotOptions, errorCollector).compiler;
        }
        _createProgramWithBasicStubs() {
            if (this._analyzedModules) {
                throw new Error(`Internal Error: already initialized!`);
            }
            // Note: This is important to not produce a memory leak!
            const oldTsProgram = this.oldTsProgram;
            this.oldTsProgram = undefined;
            const codegen = {
                generateFile: (genFileName, baseFileName) => this.compiler.emitBasicStub(genFileName, baseFileName),
                findGeneratedFileNames: (fileName) => this.compiler.findGeneratedFileNames(fileName),
            };
            let rootNames = [...this.rootNames];
            if (this.options.generateCodeForLibraries !== false) {
                // if we should generateCodeForLibraries, never include
                // generated files in the program as otherwise we will
                // overwrite them and typescript will report the error
                // TS5055: Cannot write file ... because it would overwrite input file.
                rootNames = rootNames.filter(fn => !util_1.GENERATED_FILES.test(fn));
            }
            if (this.options.noResolve) {
                this.rootNames.forEach(rootName => {
                    if (this.hostAdapter.shouldGenerateFilesFor(rootName)) {
                        rootNames.push(...this.compiler.findGeneratedFileNames(rootName));
                    }
                });
            }
            const tmpProgram = ts.createProgram(rootNames, this.options, this.hostAdapter, oldTsProgram);
            const sourceFiles = [];
            const tsFiles = [];
            tmpProgram.getSourceFiles().forEach(sf => {
                if (this.hostAdapter.isSourceFile(sf.fileName)) {
                    sourceFiles.push(sf.fileName);
                }
                if (util_1.TS.test(sf.fileName) && !util_1.DTS.test(sf.fileName)) {
                    tsFiles.push(sf.fileName);
                }
            });
            return { tmpProgram, sourceFiles, tsFiles, rootNames };
        }
        _updateProgramWithTypeCheckStubs(tmpProgram, analyzedModules, analyzedInjectables, rootNames) {
            this._analyzedModules = analyzedModules;
            this._analyzedInjectables = analyzedInjectables;
            tmpProgram.getSourceFiles().forEach(sf => {
                if (sf.fileName.endsWith('.ngfactory.ts')) {
                    const { generate, baseFileName } = this.hostAdapter.shouldGenerateFile(sf.fileName);
                    if (generate) {
                        // Note: ! is ok as hostAdapter.shouldGenerateFile will always return a baseFileName
                        // for .ngfactory.ts files.
                        const genFile = this.compiler.emitTypeCheckStub(sf.fileName, baseFileName);
                        if (genFile) {
                            this.hostAdapter.updateGeneratedFile(genFile);
                        }
                    }
                }
            });
            this._tsProgram = ts.createProgram(rootNames, this.options, this.hostAdapter, tmpProgram);
            // Note: the new ts program should be completely reusable by TypeScript as:
            // - we cache all the files in the hostAdapter
            // - new new stubs use the exactly same imports/exports as the old once (we assert that in
            // hostAdapter.updateGeneratedFile).
            if (util_1.tsStructureIsReused(tmpProgram) !== 2 /* Completely */) {
                throw new Error(`Internal Error: The structure of the program changed during codegen.`);
            }
        }
        _createProgramOnError(e) {
            // Still fill the analyzedModules and the tsProgram
            // so that we don't cause other errors for users who e.g. want to emit the ngProgram.
            this._analyzedModules = emptyModules;
            this.oldTsProgram = undefined;
            this._hostAdapter.isSourceFile = () => false;
            this._tsProgram = ts.createProgram(this.rootNames, this.options, this.hostAdapter);
            if (compiler_1.isSyntaxError(e)) {
                this._addStructuralDiagnostics(e);
                return;
            }
            throw e;
        }
        _addStructuralDiagnostics(error) {
            const diagnostics = this._structuralDiagnostics || (this._structuralDiagnostics = []);
            if (compiler_1.isSyntaxError(error)) {
                diagnostics.push(...syntaxErrorToDiagnostics(error));
            }
            else {
                diagnostics.push({
                    messageText: error.toString(),
                    category: ts.DiagnosticCategory.Error,
                    source: api_1.SOURCE,
                    code: api_1.DEFAULT_ERROR_CODE
                });
            }
        }
        // Note: this returns a ts.Diagnostic so that we
        // can return errors in a ts.EmitResult
        generateFilesForEmit(emitFlags) {
            try {
                if (!(emitFlags & api_1.EmitFlags.Codegen)) {
                    return { genFiles: [], genDiags: [] };
                }
                // TODO(tbosch): allow generating files that are not in the rootDir
                // See https://github.com/angular/angular/issues/19337
                let genFiles = this.compiler.emitAllImpls(this.analyzedModules)
                    .filter(genFile => util_1.isInRootDir(genFile.genFileUrl, this.options));
                if (this.oldProgramEmittedGeneratedFiles) {
                    const oldProgramEmittedGeneratedFiles = this.oldProgramEmittedGeneratedFiles;
                    genFiles = genFiles.filter(genFile => {
                        const oldGenFile = oldProgramEmittedGeneratedFiles.get(genFile.genFileUrl);
                        return !oldGenFile || !genFile.isEquivalent(oldGenFile);
                    });
                }
                return { genFiles, genDiags: [] };
            }
            catch (e) {
                // TODO(tbosch): check whether we can actually have syntax errors here,
                // as we already parsed the metadata and templates before to create the type check block.
                if (compiler_1.isSyntaxError(e)) {
                    const genDiags = [{
                            file: undefined,
                            start: undefined,
                            length: undefined,
                            messageText: e.message,
                            category: ts.DiagnosticCategory.Error,
                            source: api_1.SOURCE,
                            code: api_1.DEFAULT_ERROR_CODE
                        }];
                    return { genFiles: [], genDiags };
                }
                throw e;
            }
        }
        /**
         * Returns undefined if all files should be emitted.
         */
        getSourceFilesForEmit() {
            // TODO(tbosch): if one of the files contains a `const enum`
            // always emit all files -> return undefined!
            let sourceFilesToEmit = this.tsProgram.getSourceFiles().filter(sf => { return !sf.isDeclarationFile && !util_1.GENERATED_FILES.test(sf.fileName); });
            if (this.oldProgramEmittedSourceFiles) {
                sourceFilesToEmit = sourceFilesToEmit.filter(sf => {
                    const oldFile = this.oldProgramEmittedSourceFiles.get(sf.fileName);
                    return sf !== oldFile;
                });
            }
            return sourceFilesToEmit;
        }
        writeFile(outFileName, outData, writeByteOrderMark, onError, genFile, sourceFiles) {
            // collect emittedLibrarySummaries
            let baseFile;
            if (genFile) {
                baseFile = this.tsProgram.getSourceFile(genFile.srcFileUrl);
                if (baseFile) {
                    if (!this.emittedLibrarySummaries) {
                        this.emittedLibrarySummaries = [];
                    }
                    if (genFile.genFileUrl.endsWith('.ngsummary.json') && baseFile.fileName.endsWith('.d.ts')) {
                        this.emittedLibrarySummaries.push({
                            fileName: baseFile.fileName,
                            text: baseFile.text,
                            sourceFile: baseFile,
                        });
                        this.emittedLibrarySummaries.push({ fileName: genFile.genFileUrl, text: outData });
                        if (!this.options.declaration) {
                            // If we don't emit declarations, still record an empty .ngfactory.d.ts file,
                            // as we might need it later on for resolving module names from summaries.
                            const ngFactoryDts = genFile.genFileUrl.substring(0, genFile.genFileUrl.length - 15) + '.ngfactory.d.ts';
                            this.emittedLibrarySummaries.push({ fileName: ngFactoryDts, text: '' });
                        }
                    }
                    else if (outFileName.endsWith('.d.ts') && baseFile.fileName.endsWith('.d.ts')) {
                        const dtsSourceFilePath = genFile.genFileUrl.replace(/\.ts$/, '.d.ts');
                        // Note: Don't use sourceFiles here as the created .d.ts has a path in the outDir,
                        // but we need one that is next to the .ts file
                        this.emittedLibrarySummaries.push({ fileName: dtsSourceFilePath, text: outData });
                    }
                }
            }
            // Filter out generated files for which we didn't generate code.
            // This can happen as the stub calculation is not completely exact.
            // Note: sourceFile refers to the .ngfactory.ts / .ngsummary.ts file
            // node_emitter_transform already set the file contents to be empty,
            //  so this code only needs to skip the file if !allowEmptyCodegenFiles.
            const isGenerated = util_1.GENERATED_FILES.test(outFileName);
            if (isGenerated && !this.options.allowEmptyCodegenFiles &&
                (!genFile || !genFile.stmts || genFile.stmts.length === 0)) {
                return;
            }
            if (baseFile) {
                sourceFiles = sourceFiles ? [...sourceFiles, baseFile] : [baseFile];
            }
            // TODO: remove any when TS 2.4 support is removed.
            this.host.writeFile(outFileName, outData, writeByteOrderMark, onError, sourceFiles);
        }
    }
    /**
     * Checks whether a given version ∈ [minVersion, maxVersion[
     * An error will be thrown if the following statements are simultaneously true:
     * - the given version ∉ [minVersion, maxVersion[,
     * - the result of the version check is not meant to be bypassed (the parameter disableVersionCheck
     * is false)
     *
     * @param version The version on which the check will be performed
     * @param minVersion The lower bound version. A valid version needs to be greater than minVersion
     * @param maxVersion The upper bound version. A valid version needs to be strictly less than
     * maxVersion
     * @param disableVersionCheck Indicates whether version check should be bypassed
     *
     * @throws Will throw an error if the following statements are simultaneously true:
     * - the given version ∉ [minVersion, maxVersion[,
     * - the result of the version check is not meant to be bypassed (the parameter disableVersionCheck
     * is false)
     */
    function checkVersion(version, minVersion, maxVersion, disableVersionCheck) {
        if ((typescript_version_1.compareVersions(version, minVersion) < 0 || typescript_version_1.compareVersions(version, maxVersion) >= 0) &&
            !disableVersionCheck) {
            throw new Error(`The Angular Compiler requires TypeScript >=${minVersion} and <${maxVersion} but ${version} was found instead.`);
        }
    }
    exports.checkVersion = checkVersion;
    function createProgram({ rootNames, options, host, oldProgram }) {
        if (options.enableIvy === 'ngtsc') {
            return new program_1.NgtscProgram(rootNames, options, host, oldProgram);
        }
        else if (options.enableIvy === 'tsc') {
            return new tsc_pass_through_1.TscPassThroughProgram(rootNames, options, host, oldProgram);
        }
        return new AngularCompilerProgram(rootNames, options, host, oldProgram);
    }
    exports.createProgram = createProgram;
    // Compute the AotCompiler options
    function getAotCompilerOptions(options) {
        let missingTranslation = compiler_1.core.MissingTranslationStrategy.Warning;
        switch (options.i18nInMissingTranslations) {
            case 'ignore':
                missingTranslation = compiler_1.core.MissingTranslationStrategy.Ignore;
                break;
            case 'error':
                missingTranslation = compiler_1.core.MissingTranslationStrategy.Error;
                break;
        }
        let translations = '';
        if (options.i18nInFile) {
            if (!options.i18nInLocale) {
                throw new Error(`The translation file (${options.i18nInFile}) locale must be provided.`);
            }
            translations = fs.readFileSync(options.i18nInFile, 'utf8');
        }
        else {
            // No translations are provided, ignore any errors
            // We still go through i18n to remove i18n attributes
            missingTranslation = compiler_1.core.MissingTranslationStrategy.Ignore;
        }
        return {
            locale: options.i18nInLocale,
            i18nFormat: options.i18nInFormat || options.i18nOutFormat,
            i18nUseExternalIds: options.i18nUseExternalIds, translations, missingTranslation,
            enableSummariesForJit: options.enableSummariesForJit,
            preserveWhitespaces: options.preserveWhitespaces,
            fullTemplateTypeCheck: options.fullTemplateTypeCheck,
            allowEmptyCodegenFiles: options.allowEmptyCodegenFiles,
            enableIvy: options.enableIvy,
        };
    }
    function getNgOptionDiagnostics(options) {
        if (options.annotationsAs) {
            switch (options.annotationsAs) {
                case 'decorators':
                case 'static fields':
                    break;
                default:
                    return [{
                            messageText: 'Angular compiler options "annotationsAs" only supports "static fields" and "decorators"',
                            category: ts.DiagnosticCategory.Error,
                            source: api_1.SOURCE,
                            code: api_1.DEFAULT_ERROR_CODE
                        }];
            }
        }
        return [];
    }
    function normalizeSeparators(path) {
        return path.replace(/\\/g, '/');
    }
    /**
     * Returns a function that can adjust a path from source path to out path,
     * based on an existing mapping from source to out path.
     *
     * TODO(tbosch): talk to the TypeScript team to expose their logic for calculating the `rootDir`
     * if none was specified.
     *
     * Note: This function works on normalized paths from typescript but should always return
     * POSIX normalized paths for output paths.
     */
    function createSrcToOutPathMapper(outDir, sampleSrcFileName, sampleOutFileName, host = path) {
        if (outDir) {
            let path = {}; // Ensure we error if we use `path` instead of `host`.
            if (sampleSrcFileName == null || sampleOutFileName == null) {
                throw new Error(`Can't calculate the rootDir without a sample srcFileName / outFileName. `);
            }
            const srcFileDir = normalizeSeparators(host.dirname(sampleSrcFileName));
            const outFileDir = normalizeSeparators(host.dirname(sampleOutFileName));
            if (srcFileDir === outFileDir) {
                return (srcFileName) => srcFileName;
            }
            // calculate the common suffix, stopping
            // at `outDir`.
            const srcDirParts = srcFileDir.split('/');
            const outDirParts = normalizeSeparators(host.relative(outDir, outFileDir)).split('/');
            let i = 0;
            while (i < Math.min(srcDirParts.length, outDirParts.length) &&
                srcDirParts[srcDirParts.length - 1 - i] === outDirParts[outDirParts.length - 1 - i])
                i++;
            const rootDir = srcDirParts.slice(0, srcDirParts.length - i).join('/');
            return (srcFileName) => {
                // Note: Before we return the mapped output path, we need to normalize the path delimiters
                // because the output path is usually passed to TypeScript which sometimes only expects
                // posix normalized paths (e.g. if a custom compiler host is used)
                return normalizeSeparators(host.resolve(outDir, host.relative(rootDir, srcFileName)));
            };
        }
        else {
            // Note: Before we return the output path, we need to normalize the path delimiters because
            // the output path is usually passed to TypeScript which only passes around posix
            // normalized paths (e.g. if a custom compiler host is used)
            return (srcFileName) => normalizeSeparators(srcFileName);
        }
    }
    exports.createSrcToOutPathMapper = createSrcToOutPathMapper;
    function i18nExtract(formatName, outFile, host, options, bundle) {
        formatName = formatName || 'xlf';
        // Checks the format and returns the extension
        const ext = i18nGetExtension(formatName);
        const content = i18nSerialize(bundle, formatName, options);
        const dstFile = outFile || `messages.${ext}`;
        const dstPath = path.resolve(options.outDir || options.basePath, dstFile);
        host.writeFile(dstPath, content, false, undefined, []);
        return [dstPath];
    }
    exports.i18nExtract = i18nExtract;
    function i18nSerialize(bundle, formatName, options) {
        const format = formatName.toLowerCase();
        let serializer;
        switch (format) {
            case 'xmb':
                serializer = new compiler_1.Xmb();
                break;
            case 'xliff2':
            case 'xlf2':
                serializer = new compiler_1.Xliff2();
                break;
            case 'xlf':
            case 'xliff':
            default:
                serializer = new compiler_1.Xliff();
        }
        return bundle.write(serializer, getPathNormalizer(options.basePath));
    }
    exports.i18nSerialize = i18nSerialize;
    function getPathNormalizer(basePath) {
        // normalize source paths by removing the base path and always using "/" as a separator
        return (sourcePath) => {
            sourcePath = basePath ? path.relative(basePath, sourcePath) : sourcePath;
            return sourcePath.split(path.sep).join('/');
        };
    }
    function i18nGetExtension(formatName) {
        const format = formatName.toLowerCase();
        switch (format) {
            case 'xmb':
                return 'xmb';
            case 'xlf':
            case 'xlif':
            case 'xliff':
            case 'xlf2':
            case 'xliff2':
                return 'xlf';
        }
        throw new Error(`Unsupported format "${formatName}"`);
    }
    exports.i18nGetExtension = i18nGetExtension;
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
    function diagnosticSourceOfSpan(span) {
        // For diagnostics, TypeScript only uses the fileName and text properties.
        // The redundant '()' are here is to avoid having clang-format breaking the line incorrectly.
        return { fileName: span.start.file.url, text: span.start.file.content };
    }
    function diagnosticSourceOfFileName(fileName, program) {
        const sourceFile = program.getSourceFile(fileName);
        if (sourceFile)
            return sourceFile;
        // If we are reporting diagnostics for a source file that is not in the project then we need
        // to fake a source file so the diagnostic formatting routines can emit the file name.
        // The redundant '()' are here is to avoid having clang-format breaking the line incorrectly.
        return { fileName, text: '' };
    }
    function diagnosticChainFromFormattedDiagnosticChain(chain) {
        return {
            messageText: chain.message,
            next: chain.next && diagnosticChainFromFormattedDiagnosticChain(chain.next),
            position: chain.position
        };
    }
    function syntaxErrorToDiagnostics(error) {
        const parserErrors = compiler_1.getParseErrors(error);
        if (parserErrors && parserErrors.length) {
            return parserErrors.map(e => ({
                messageText: e.contextualMessage(),
                file: diagnosticSourceOfSpan(e.span),
                start: e.span.start.offset,
                length: e.span.end.offset - e.span.start.offset,
                category: ts.DiagnosticCategory.Error,
                source: api_1.SOURCE,
                code: api_1.DEFAULT_ERROR_CODE
            }));
        }
        else if (compiler_1.isFormattedError(error)) {
            return [{
                    messageText: error.message,
                    chain: error.chain && diagnosticChainFromFormattedDiagnosticChain(error.chain),
                    category: ts.DiagnosticCategory.Error,
                    source: api_1.SOURCE,
                    code: api_1.DEFAULT_ERROR_CODE,
                    position: error.position
                }];
        }
        // Produce a Diagnostic anyway since we know for sure `error` is a SyntaxError
        return [{
                messageText: error.message,
                category: ts.DiagnosticCategory.Error,
                code: api_1.DEFAULT_ERROR_CODE,
                source: api_1.SOURCE,
            }];
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3JhbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvdHJhbnNmb3JtZXJzL3Byb2dyYW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSCxnREFBc1o7SUFDdFoseUJBQXlCO0lBQ3pCLDZCQUE2QjtJQUM3QixpQ0FBaUM7SUFFakMsdUdBQXlGO0lBQ3pGLGlHQUFrRTtJQUNsRSx1RUFBcUY7SUFDckYscUVBQThDO0lBRTlDLG9FQUFvUDtJQUNwUCx3RkFBZ0g7SUFDaEgsOEZBQTBHO0lBQzFHLGdHQUFrRztJQUNsRywwRkFBb0U7SUFDcEUsNEZBQWlEO0lBQ2pELDBHQUEyRTtJQUMzRSx3R0FBeUU7SUFDekUsb0dBQThHO0lBQzlHLHNGQUFpRTtJQUNqRSw4RkFBeUQ7SUFDekQsc0VBQTJKO0lBRzNKOzs7T0FHRztJQUNILE1BQU0sbUNBQW1DLEdBQUcsRUFBRSxDQUFDO0lBRy9DOztPQUVHO0lBQ0gsTUFBTSxZQUFZLEdBQUcsQ0FBQyxVQUFVLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFFOUU7O09BRUc7SUFDSCxNQUFNLGVBQWUsR0FBRyxDQUFDLEdBQUcsWUFBWSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFFN0UsTUFBTSxxQkFBcUIsR0FBRztRQUM1QixXQUFXO1FBQ1gsV0FBVztRQUNYLFlBQVk7UUFDWixVQUFVO1FBQ1YsTUFBTTtLQUNQLENBQUM7SUFFRixNQUFNLFlBQVksR0FBc0I7UUFDdEMsU0FBUyxFQUFFLEVBQUU7UUFDYix5QkFBeUIsRUFBRSxJQUFJLEdBQUcsRUFBRTtRQUNwQyxLQUFLLEVBQUUsRUFBRTtLQUNWLENBQUM7SUFFRixNQUFNLG1CQUFtQixHQUNyQixDQUFDLEVBQUMsT0FBTyxFQUFFLGdC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b0JBQ3JDLE1BQU0sRUFBRSxZQUFNO29CQUNkLElBQUksRUFBRSx3QkFBa0I7b0JBQ3hCLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtpQkFDekIsQ0FBQyxDQUFDO1NBQ0o7UUFDRCw4RUFBOEU7UUFDOUUsT0FBTyxDQUFDO2dCQUNOLFdBQVcsRUFBRSxLQUFLLENBQUMsT0FBTztnQkFDMUIsUUFBUSxFQUFFLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLO2dCQUNyQyxJQUFJLEVBQUUsd0JBQWtCO2dCQUN4QixNQUFNLEVBQUUsWUFBTTthQUNmLENBQUMsQ0FBQztJQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBb3RDb21waWxlciwgQW90Q29tcGlsZXJIb3N0LCBBb3RDb21waWxlck9wdGlvbnMsIEVtaXR0ZXJWaXNpdG9yQ29udGV4dCwgRm9ybWF0dGVkTWVzc2FnZUNoYWluLCBHZW5lcmF0ZWRGaWxlLCBNZXNzYWdlQnVuZGxlLCBOZ0FuYWx5emVkRmlsZSwgTmdBbmFseXplZEZpbGVXaXRoSW5qZWN0YWJsZXMsIE5nQW5hbHl6ZWRNb2R1bGVzLCBQYXJzZVNvdXJjZVNwYW4sIFBhcnRpYWxNb2R1bGUsIFBvc2l0aW9uLCBTZXJpYWxpemVyLCBTdGF0aWNTeW1ib2wsIFR5cGVTY3JpcHRFbWl0dGVyLCBYbGlmZiwgWGxpZmYyLCBYbWIsIGNvcmUsIGNyZWF0ZUFvdENvbXBpbGVyLCBnZXRQYXJzZUVycm9ycywgaXNGb3JtYXR0ZWRFcnJvciwgaXNTeW50YXhFcnJvcn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge1R5cGVDaGVja0hvc3QsIHRyYW5zbGF0ZURpYWdub3N0aWNzfSBmcm9tICcuLi9kaWFnbm9zdGljcy90cmFuc2xhdGVfZGlhZ25vc3RpY3MnO1xuaW1wb3J0IHtjb21wYXJlVmVyc2lvbnN9IGZyb20gJy4uL2RpYWdub3N0aWNzL3R5cGVzY3JpcHRfdmVyc2lvbic7XG5pbXBvcnQge01ldGFkYXRhQ29sbGVjdG9yLCBNb2R1bGVNZXRhZGF0YSwgY3JlYXRlQnVuZGxlSW5kZXhIb3N0fSBmcm9tICcuLi9tZXRhZGF0YSc7XG5pbXBvcnQge05ndHNjUHJvZ3JhbX0gZnJvbSAnLi4vbmd0c2MvcHJvZ3JhbSc7XG5cbmltcG9ydCB7Q29tcGlsZXJIb3N0LCBDb21waWxlck9wdGlvbnMsIEN1c3RvbVRyYW5zZm9ybWVycywgREVGQVVMVF9FUlJPUl9DT0RFLCBEaWFnbm9zdGljLCBEaWFnbm9zdGljTWVzc2FnZUNoYWluLCBFbWl0RmxhZ3MsIExhenlSb3V0ZSwgTGlicmFyeVN1bW1hcnksIFByb2dyYW0sIFNPVVJDRSwgVHNFbWl0QXJndW1lbnRzLCBUc0VtaXRDYWxsYmFjaywgVHNNZXJnZUVtaXRSZXN1bHRzQ2FsbGJhY2t9IGZyb20gJy4vYXBpJztcbmltcG9ydCB7Q29kZUdlbmVyYXRvciwgVHNDb21waWxlckFvdENvbXBpbGVyVHlwZUNoZWNrSG9zdEFkYXB0ZXIsIGdldE9yaWdpbmFsUmVmZXJlbmNlc30gZnJvbSAnLi9jb21waWxlcl9ob3N0JztcbmltcG9ydCB7SW5saW5lUmVzb3VyY2VzTWV0YWRhdGFUcmFuc2Zvcm1lciwgZ2V0SW5saW5lUmVzb3VyY2VzVHJhbnNmb3JtRmFjdG9yeX0gZnJvbSAnLi9pbmxpbmVfcmVzb3VyY2VzJztcbmltcG9ydCB7TG93ZXJNZXRhZGF0YVRyYW5zZm9ybSwgZ2V0RXhwcmVzc2lvbkxvd2VyaW5nVHJhbnNmb3JtRmFjdG9yeX0gZnJvbSAnLi9sb3dlcl9leHByZXNzaW9ucyc7XG5pbXBvcnQge01ldGFkYXRhQ2FjaGUsIE1ldGFkYXRhVHJhbnNmb3JtZXJ9IGZyb20gJy4vbWV0YWRhdGFfY2FjaGUnO1xuaW1wb3J0IHtub2NvbGxhcHNlSGFja30gZnJvbSAnLi9ub2NvbGxhcHNlX2hhY2snO1xuaW1wb3J0IHtnZXRBbmd1bGFyRW1pdHRlclRyYW5zZm9ybUZhY3Rvcnl9IGZyb20gJy4vbm9kZV9lbWl0dGVyX3RyYW5zZm9ybSc7XG5pbXBvcnQge1BhcnRpYWxNb2R1bGVNZXRhZGF0YVRyYW5zZm9ybWVyfSBmcm9tICcuL3IzX21ldGFkYXRhX3RyYW5zZm9ybSc7XG5pbXBvcnQge1N0cmlwRGVjb3JhdG9yc01ldGFkYXRhVHJhbnNmb3JtZXIsIGdldERlY29yYXRvclN0cmlwVHJhbnNmb3JtZXJGYWN0b3J5fSBmcm9tICcuL3IzX3N0cmlwX2RlY29yYXRvcnMnO1xuaW1wb3J0IHtnZXRBbmd1bGFyQ2xhc3NUcmFuc2Zvcm1lckZhY3Rvcnl9IGZyb20gJy4vcjNfdHJhbnNmb3JtJztcbmltcG9ydCB7VHNjUGFzc1Rocm91Z2hQcm9ncmFtfSBmcm9tICcuL3RzY19wYXNzX3Rocm91Z2gnO1xuaW1wb3J0IHtEVFMsIEdFTkVSQVRFRF9GSUxFUywgU3RydWN0dXJlSXNSZXVzZWQsIFRTLCBjcmVhdGVNZXNzYWdlRGlhZ25vc3RpYywgaXNJblJvb3REaXIsIG5nVG9Uc0RpYWdub3N0aWMsIHRzU3RydWN0dXJlSXNSZXVzZWQsIHVzZXJFcnJvcn0gZnJvbSAnLi91dGlsJztcblxuXG4vKipcbiAqIE1heGltdW0gbnVtYmVyIG9mIGZpbGVzIHRoYXQgYXJlIGVtaXRhYmxlIHZpYSBjYWxsaW5nIHRzLlByb2dyYW0uZW1pdFxuICogcGFzc2luZyBpbmRpdmlkdWFsIHRhcmdldFNvdXJjZUZpbGVzLlxuICovXG5jb25zdCBNQVhfRklMRV9DT1VOVF9GT1JfU0lOR0xFX0ZJTEVfRU1JVCA9IDIwO1xuXG5cbi8qKlxuICogRmllbGRzIHRvIGxvd2VyIHdpdGhpbiBtZXRhZGF0YSBpbiByZW5kZXIyIG1vZGUuXG4gKi9cbmNvbnN0IExPV0VSX0ZJRUxEUyA9IFsndXNlVmFsdWUnLCAndXNlRmFjdG9yeScsICdkYXRhJywgJ2lkJywgJ2xvYWRDaGlsZHJlbiddO1xuXG4vKipcbiAqIEZpZWxkcyB0byBsb3dlciB3aXRoaW4gbWV0YWRhdGEgaW4gcmVuZGVyMyBtb2RlLlxuICovXG5jb25zdCBSM19MT1dFUl9GSUVMRFMgPSBbLi4uTE9XRVJfRklFTERTLCAncHJvdmlkZXJzJywgJ2ltcG9ydHMnLCAnZXhwb3J0cyddO1xuXG5jb25zdCBSM19SRUlGSUVEX0RFQ09SQVRPUlMgPSBbXG4gICdDb21wb25lbnQnLFxuICAnRGlyZWN0aXZlJyxcbiAgJ0luamVjdGFibGUnLFxuICAnTmdNb2R1bGUnLFxuICAnUGlwZScsXG5dO1xuXG5jb25zdCBlbXB0eU1vZHVsZXM6IE5nQW5hbHl6ZWRNb2R1bGVzID0ge1xuICBuZ01vZHVsZXM6IFtdLFxuICBuZ01vZHVsZUJ5UGlwZU9yRGlyZWN0aXZlOiBuZXcgTWFwKCksXG4gIGZpbGVzOiBbXVxufTtcblxuY29uc3QgZGVmYXVsdEVtaXRDYWxsYmFjazogVHNFbWl0Q2FsbGJhY2sgPVxuICAgICh7cHJvZ3JhbSwgdGFyZ2V0U291cmNlRmlsZSwgd3JpdGVGaWxlLCBjYW5jZWxsYXRpb25Ub2tlbiwgZW1pdE9ubHlEdHNGaWxlcyxcbiAgICAgIGN1c3RvbVRyYW5zZm9ybWVyc30pID0+XG4gICAgICAgIHByb2dyYW0uZW1pdChcbiAgICAgICAgICAgIHRhcmdldFNvdXJjZUZpbGUsIHdyaXRlRmlsZSwgY2FuY2VsbGF0aW9uVG9rZW4sIGVtaXRPbmx5RHRzRmlsZXMsIGN1c3RvbVRyYW5zZm9ybWVycyk7XG5cbi8qKlxuICogTWluaW11bSBzdXBwb3J0ZWQgVHlwZVNjcmlwdCB2ZXJzaW9uXG4gKiDiiIAgc3VwcG9ydGVkIHR5cGVzY3JpcHQgdmVyc2lvbiB2LCB2ID49IE1JTl9UU19WRVJTSU9OXG4gKi9cbmNvbnN0IE1JTl9UU19WRVJTSU9OID0gJzMuMS4xJztcblxuLyoqXG4gKiBTdXByZW11bSBvZiBzdXBwb3J0ZWQgVHlwZVNjcmlwdCB2ZXJzaW9uc1xuICog4oiAIHN1cHBvcnRlZCB0eXBlc2NyaXB0IHZlcnNpb24gdiwgdiA8IE1BWF9UU19WRVJTSU9OXG4gKiBNQVhfVFNfVkVSU0lPTiBpcyBub3QgY29uc2lkZXJlZCBhcyBhIHN1cHBvcnRlZCBUeXBlU2NyaXB0IHZlcnNpb25cbiAqL1xuY29uc3QgTUFYX1RTX1ZFUlNJT04gPSAnMy4zLjAnO1xuXG5jbGFzcyBBbmd1bGFyQ29tcGlsZXJQcm9ncmFtIGltcGxlbWVudHMgUHJvZ3JhbSB7XG4gIHByaXZhdGUgcm9vdE5hbWVzOiBzdHJpbmdbXTtcbiAgcHJpdmF0ZSBtZXRhZGF0YUNhY2hlOiBNZXRhZGF0YUNhY2hlO1xuICAvLyBNZXRhZGF0YSBjYWNoZSB1c2VkIGV4Y2x1c2l2ZWx5IGZvciB0aGUgZmxhdCBtb2R1bGUgaW5kZXhcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgZmxhdE1vZHVsZU1ldGFkYXRhQ2FjaGUgITogTWV0YWRhdGFDYWNoZTtcbiAgcHJpdmF0ZSBsb3dlcmluZ01ldGFkYXRhVHJhbnNmb3JtOiBMb3dlck1ldGFkYXRhVHJhbnNmb3JtO1xuICBwcml2YXRlIG9sZFByb2dyYW1MaWJyYXJ5U3VtbWFyaWVzOiBNYXA8c3RyaW5nLCBMaWJyYXJ5U3VtbWFyeT58dW5kZWZpbmVkO1xuICBwcml2YXRlIG9sZFByb2dyYW1FbWl0dGVkR2VuZXJhdGVkRmlsZXM6IE1hcDxzdHJpbmcsIEdlbmVyYXRlZEZpbGU+fHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBvbGRQcm9ncmFtRW1pdHRlZFNvdXJjZUZpbGVzOiBNYXA8c3RyaW5nLCB0cy5Tb3VyY2VGaWxlPnx1bmRlZmluZWQ7XG4gIC8vIE5vdGU6IFRoaXMgd2lsbCBiZSBjbGVhcmVkIG91dCBhcyBzb29uIGFzIHdlIGNyZWF0ZSB0aGUgX3RzUHJvZ3JhbVxuICBwcml2YXRlIG9sZFRzUHJvZ3JhbTogdHMuUHJvZ3JhbXx1bmRlZmluZWQ7XG4gIHByaXZhdGUgZW1pdHRlZExpYnJhcnlTdW1tYXJpZXM6IExpYnJhcnlTdW1tYXJ5W118dW5kZWZpbmVkO1xuICBwcml2YXRlIGVtaXR0ZWRHZW5lcmF0ZWRGaWxlczogR2VuZXJhdGVkRmlsZVtdfHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBlbWl0dGVkU291cmNlRmlsZXM6IHRzLlNvdXJjZUZpbGVbXXx1bmRlZmluZWQ7XG5cbiAgLy8gTGF6aWx5IGluaXRpYWxpemVkIGZpZWxkc1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfY29tcGlsZXIgITogQW90Q29tcGlsZXI7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9ob3N0QWRhcHRlciAhOiBUc0NvbXBpbGVyQW90Q29tcGlsZXJUeXBlQ2hlY2tIb3N0QWRhcHRlcjtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX3RzUHJvZ3JhbSAhOiB0cy5Qcm9ncmFtO1xuICBwcml2YXRlIF9hbmFseXplZE1vZHVsZXM6IE5nQW5hbHl6ZWRNb2R1bGVzfHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBfYW5hbHl6ZWRJbmplY3RhYmxlczogTmdBbmFseXplZEZpbGVXaXRoSW5qZWN0YWJsZXNbXXx1bmRlZmluZWQ7XG4gIHByaXZhdGUgX3N0cnVjdHVyYWxEaWFnbm9zdGljczogRGlhZ25vc3RpY1tdfHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBfcHJvZ3JhbVdpdGhTdHViczogdHMuUHJvZ3JhbXx1bmRlZmluZWQ7XG4gIHByaXZhdGUgX29wdGlvbnNEaWFnbm9zdGljczogRGlhZ25vc3RpY1tdID0gW107XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9yZWlmaWVkRGVjb3JhdG9ycyAhOiBTZXQ8U3RhdGljU3ltYm9sPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHJvb3ROYW1lczogUmVhZG9ubHlBcnJheTxzdHJpbmc+LCBwcml2YXRlIG9wdGlvbnM6IENvbXBpbGVyT3B0aW9ucyxcbiAgICAgIHByaXZhdGUgaG9zdDogQ29tcGlsZXJIb3N0LCBvbGRQcm9ncmFtPzogUHJvZ3JhbSkge1xuICAgIHRoaXMucm9vdE5hbWVzID0gWy4uLnJvb3ROYW1lc107XG5cbiAgICBjaGVja1ZlcnNpb24odHMudmVyc2lvbiwgTUlOX1RTX1ZFUlNJT04sIE1BWF9UU19WRVJTSU9OLCBvcHRpb25zLmRpc2FibGVUeXBlU2NyaXB0VmVyc2lvbkNoZWNrKTtcblxuICAgIHRoaXMub2xkVHNQcm9ncmFtID0gb2xkUHJvZ3JhbSA/IG9sZFByb2dyYW0uZ2V0VHNQcm9ncmFtKCkgOiB1bmRlZmluZWQ7XG4gICAgaWYgKG9sZFByb2dyYW0pIHtcbiAgICAgIHRoaXMub2xkUHJvZ3JhbUxpYnJhcnlTdW1tYXJpZXMgPSBvbGRQcm9ncmFtLmdldExpYnJhcnlTdW1tYXJpZXMoKTtcbiAgICAgIHRoaXMub2xkUHJvZ3JhbUVtaXR0ZWRHZW5lcmF0ZWRGaWxlcyA9IG9sZFByb2dyYW0uZ2V0RW1pdHRlZEdlbmVyYXRlZEZpbGVzKCk7XG4gICAgICB0aGlzLm9sZFByb2dyYW1FbWl0dGVkU291cmNlRmlsZXMgPSBvbGRQcm9ncmFtLmdldEVtaXR0ZWRTb3VyY2VGaWxlcygpO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmZsYXRNb2R1bGVPdXRGaWxlKSB7XG4gICAgICBjb25zdCB7aG9zdDogYnVuZGxlSG9zdCwgaW5kZXhOYW1lLCBlcnJvcnN9ID1cbiAgICAgICAgICBjcmVhdGVCdW5kbGVJbmRleEhvc3Qob3B0aW9ucywgdGhpcy5yb290TmFtZXMsIGhvc3QsICgpID0+IHRoaXMuZmxhdE1vZHVsZU1ldGFkYXRhQ2FjaGUpO1xuICAgICAgaWYgKGVycm9ycykge1xuICAgICAgICB0aGlzLl9vcHRpb25zRGlhZ25vc3RpY3MucHVzaCguLi5lcnJvcnMubWFwKGUgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBlLmNhdGVnb3J5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZVRleHQ6IGUubWVzc2FnZVRleHQgYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBTT1VSQ0UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBERUZBVUxUX0VSUk9SX0NPREVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yb290TmFtZXMucHVzaChpbmRleE5hbWUgISk7XG4gICAgICAgIHRoaXMuaG9zdCA9IGJ1bmRsZUhvc3Q7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5sb3dlcmluZ01ldGFkYXRhVHJhbnNmb3JtID1cbiAgICAgICAgbmV3IExvd2VyTWV0YWRhdGFUcmFuc2Zvcm0ob3B0aW9ucy5lbmFibGVJdnkgPyBSM19MT1dFUl9GSUVMRFMgOiBMT1dFUl9GSUVMRFMpO1xuICAgIHRoaXMubWV0YWRhdGFDYWNoZSA9IHRoaXMuY3JlYXRlTWV0YWRhdGFDYWNoZShbdGhpcy5sb3dlcmluZ01ldGFkYXRhVHJhbnNmb3JtXSk7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZU1ldGFkYXRhQ2FjaGUodHJhbnNmb3JtZXJzOiBNZXRhZGF0YVRyYW5zZm9ybWVyW10pIHtcbiAgICByZXR1cm4gbmV3IE1ldGFkYXRhQ2FjaGUoXG4gICAgICAgIG5ldyBNZXRhZGF0YUNvbGxlY3Rvcih7cXVvdGVkTmFtZXM6IHRydWV9KSwgISF0aGlzLm9wdGlvbnMuc3RyaWN0TWV0YWRhdGFFbWl0LFxuICAgICAgICB0cmFuc2Zvcm1lcnMpO1xuICB9XG5cbiAgZ2V0TGlicmFyeVN1bW1hcmllcygpOiBNYXA8c3RyaW5nLCBMaWJyYXJ5U3VtbWFyeT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBNYXA8c3RyaW5nLCBMaWJyYXJ5U3VtbWFyeT4oKTtcbiAgICBpZiAodGhpcy5vbGRQcm9ncmFtTGlicmFyeVN1bW1hcmllcykge1xuICAgICAgdGhpcy5vbGRQcm9ncmFtTGlicmFyeVN1bW1hcmllcy5mb3JFYWNoKChzdW1tYXJ5LCBmaWxlTmFtZSkgPT4gcmVzdWx0LnNldChmaWxlTmFtZSwgc3VtbWFyeSkpO1xuICAgIH1cbiAgICBpZiAodGhpcy5lbWl0dGVkTGlicmFyeVN1bW1hcmllcykge1xuICAgICAgdGhpcy5lbWl0dGVkTGlicmFyeVN1bW1hcmllcy5mb3JFYWNoKFxuICAgICAgICAgIChzdW1tYXJ5LCBmaWxlTmFtZSkgPT4gcmVzdWx0LnNldChzdW1tYXJ5LmZpbGVOYW1lLCBzdW1tYXJ5KSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBnZXRFbWl0dGVkR2VuZXJhdGVkRmlsZXMoKTogTWFwPHN0cmluZywgR2VuZXJhdGVkRmlsZT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBNYXA8c3RyaW5nLCBHZW5lcmF0ZWRGaWxlPigpO1xuICAgIGlmICh0aGlzLm9sZFByb2dyYW1FbWl0dGVkR2VuZXJhdGVkRmlsZXMpIHtcbiAgICAgIHRoaXMub2xkUHJvZ3JhbUVtaXR0ZWRHZW5lcmF0ZWRGaWxlcy5mb3JFYWNoKFxuICAgICAgICAgIChnZW5GaWxlLCBmaWxlTmFtZSkgPT4gcmVzdWx0LnNldChmaWxlTmFtZSwgZ2VuRmlsZSkpO1xuICAgIH1cbiAgICBpZiAodGhpcy5lbWl0dGVkR2VuZXJhdGVkRmlsZXMpIHtcbiAgICAgIHRoaXMuZW1pdHRlZEdlbmVyYXRlZEZpbGVzLmZvckVhY2goKGdlbkZpbGUpID0+IHJlc3VsdC5zZXQoZ2VuRmlsZS5nZW5GaWxlVXJsLCBnZW5GaWxlKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBnZXRFbWl0dGVkU291cmNlRmlsZXMoKTogTWFwPHN0cmluZywgdHMuU291cmNlRmlsZT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBNYXA8c3RyaW5nLCB0cy5Tb3VyY2VGaWxlPigpO1xuICAgIGlmICh0aGlzLm9sZFByb2dyYW1FbWl0dGVkU291cmNlRmlsZXMpIHtcbiAgICAgIHRoaXMub2xkUHJvZ3JhbUVtaXR0ZWRTb3VyY2VGaWxlcy5mb3JFYWNoKChzZiwgZmlsZU5hbWUpID0+IHJlc3VsdC5zZXQoZmlsZU5hbWUsIHNmKSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmVtaXR0ZWRTb3VyY2VGaWxlcykge1xuICAgICAgdGhpcy5lbWl0dGVkU291cmNlRmlsZXMuZm9yRWFjaCgoc2YpID0+IHJlc3VsdC5zZXQoc2YuZmlsZU5hbWUsIHNmKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBnZXRUc1Byb2dyYW0oKTogdHMuUHJvZ3JhbSB7IHJldHVybiB0aGlzLnRzUHJvZ3JhbTsgfVxuXG4gIGdldFRzT3B0aW9uRGlhZ25vc3RpY3MoY2FuY2VsbGF0aW9uVG9rZW4/OiB0cy5DYW5jZWxsYXRpb25Ub2tlbikge1xuICAgIHJldHVybiB0aGlzLnRzUHJvZ3JhbS5nZXRPcHRpb25zRGlhZ25vc3RpY3MoY2FuY2VsbGF0aW9uVG9rZW4pO1xuICB9XG5cbiAgZ2V0TmdPcHRpb25EaWFnbm9zdGljcyhjYW5jZWxsYXRpb25Ub2tlbj86IHRzLkNhbmNlbGxhdGlvblRva2VuKTogUmVhZG9ubHlBcnJheTxEaWFnbm9zdGljPiB7XG4gICAgcmV0dXJuIFsuLi50aGlzLl9vcHRpb25zRGlhZ25vc3RpY3MsIC4uLmdldE5nT3B0aW9uRGlhZ25vc3RpY3ModGhpcy5vcHRpb25zKV07XG4gIH1cblxuICBnZXRUc1N5bnRhY3RpY0RpYWdub3N0aWNzKHNvdXJjZUZpbGU/OiB0cy5Tb3VyY2VGaWxlLCBjYW5jZWxsYXRpb25Ub2tlbj86IHRzLkNhbmNlbGxhdGlvblRva2VuKTpcbiAgICAgIFJlYWRvbmx5QXJyYXk8dHMuRGlhZ25vc3RpYz4ge1xuICAgIHJldHVybiB0aGlzLnRzUHJvZ3JhbS5nZXRTeW50YWN0aWNEaWFnbm9zdGljcyhzb3VyY2VGaWxlLCBjYW5jZWxsYXRpb25Ub2tlbik7XG4gIH1cblxuICBnZXROZ1N0cnVjdHVyYWxEaWFnbm9zdGljcyhjYW5jZWxsYXRpb25Ub2tlbj86IHRzLkNhbmNlbGxhdGlvblRva2VuKTogUmVhZG9ubHlBcnJheTxEaWFnbm9zdGljPiB7XG4gICAgcmV0dXJuIHRoaXMuc3RydWN0dXJhbERpYWdub3N0aWNzO1xuICB9XG5cbiAgZ2V0VHNTZW1hbnRpY0RpYWdub3N0aWNzKHNvdXJjZUZpbGU/OiB0cy5Tb3VyY2VGaWxlLCBjYW5jZWxsYXRpb25Ub2tlbj86IHRzLkNhbmNlbGxhdGlvblRva2VuKTpcbiAgICAgIFJlYWRvbmx5QXJyYXk8dHMuRGlhZ25vc3RpYz4ge1xuICAgIGNvbnN0IHNvdXJjZUZpbGVzID0gc291cmNlRmlsZSA/IFtzb3VyY2VGaWxlXSA6IHRoaXMudHNQcm9ncmFtLmdldFNvdXJjZUZpbGVzKCk7XG4gICAgbGV0IGRpYWdzOiB0cy5EaWFnbm9zdGljW10gPSBbXTtcbiAgICBzb3VyY2VGaWxlcy5mb3JFYWNoKHNmID0+IHtcbiAgICAgIGlmICghR0VORVJBVEVEX0ZJTEVTLnRlc3Qoc2YuZmlsZU5hbWUpKSB7XG4gICAgICAgIGRpYWdzLnB1c2goLi4udGhpcy50c1Byb2dyYW0uZ2V0U2VtYW50aWNEaWFnbm9zdGljcyhzZiwgY2FuY2VsbGF0aW9uVG9rZW4pKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZGlhZ3M7XG4gIH1cblxuICBnZXROZ1NlbWFudGljRGlhZ25vc3RpY3MoZmlsZU5hbWU/OiBzdHJpbmcsIGNhbmNlbGxhdGlvblRva2VuPzogdHMuQ2FuY2VsbGF0aW9uVG9rZW4pOlxuICAgICAgUmVhZG9ubHlBcnJheTxEaWFnbm9zdGljPiB7XG4gICAgbGV0IGRpYWdzOiB0cy5EaWFnbm9zdGljW10gPSBbXTtcbiAgICB0aGlzLnRzUHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpLmZvckVhY2goc2YgPT4ge1xuICAgICAgaWYgKEdFTkVSQVRFRF9GSUxFUy50ZXN0KHNmLmZpbGVOYW1lKSAmJiAhc2YuaXNEZWNsYXJhdGlvbkZpbGUpIHtcbiAgICAgICAgZGlhZ3MucHVzaCguLi50aGlzLnRzUHJvZ3JhbS5nZXRTZW1hbnRpY0RpYWdub3N0aWNzKHNmLCBjYW5jZWxsYXRpb25Ub2tlbikpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGNvbnN0IHtuZ30gPSB0cmFuc2xhdGVEaWFnbm9zdGljcyh0aGlzLmhvc3RBZGFwdGVyLCBkaWFncyk7XG4gICAgcmV0dXJuIG5nO1xuICB9XG5cbiAgbG9hZE5nU3RydWN0dXJlQXN5bmMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuX2FuYWx5emVkTW9kdWxlcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbmd1bGFyIHN0cnVjdHVyZSBhbHJlYWR5IGxvYWRlZCcpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHt0bXBQcm9ncmFtLCBzb3VyY2VGaWxlcywgdHNGaWxlcywgcm9vdE5hbWVzfSA9IHRoaXMuX2NyZWF0ZVByb2dyYW1XaXRoQmFzaWNTdHVicygpO1xuICAgICAgICAgIHJldHVybiB0aGlzLmNvbXBpbGVyLmxvYWRGaWxlc0FzeW5jKHNvdXJjZUZpbGVzLCB0c0ZpbGVzKVxuICAgICAgICAgICAgICAudGhlbigoe2FuYWx5emVkTW9kdWxlcywgYW5hbHl6ZWRJbmplY3RhYmxlc30pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fYW5hbHl6ZWRNb2R1bGVzKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FuZ3VsYXIgc3RydWN0dXJlIGxvYWRlZCBib3RoIHN5bmNocm9ub3VzbHkgYW5kIGFzeW5jaHJvbm91c2x5Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVByb2dyYW1XaXRoVHlwZUNoZWNrU3R1YnMoXG4gICAgICAgICAgICAgICAgICAgIHRtcFByb2dyYW0sIGFuYWx5emVkTW9kdWxlcywgYW5hbHl6ZWRJbmplY3RhYmxlcywgcm9vdE5hbWVzKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChlID0+IHRoaXMuX2NyZWF0ZVByb2dyYW1PbkVycm9yKGUpKTtcbiAgfVxuXG4gIGxpc3RMYXp5Um91dGVzKHJvdXRlPzogc3RyaW5nKTogTGF6eVJvdXRlW10ge1xuICAgIC8vIE5vdGU6IERvbid0IGFuYWx5emVkTW9kdWxlcyBpZiBhIHJvdXRlIGlzIGdpdmVuXG4gICAgLy8gdG8gYmUgZmFzdCBlbm91Z2guXG4gICAgcmV0dXJuIHRoaXMuY29tcGlsZXIubGlzdExhenlSb3V0ZXMocm91dGUsIHJvdXRlID8gdW5kZWZpbmVkIDogdGhpcy5hbmFseXplZE1vZHVsZXMpO1xuICB9XG5cbiAgZW1pdChwYXJhbWV0ZXJzOiB7XG4gICAgZW1pdEZsYWdzPzogRW1pdEZsYWdzLFxuICAgIGNhbmNlbGxhdGlvblRva2VuPzogdHMuQ2FuY2VsbGF0aW9uVG9rZW4sXG4gICAgY3VzdG9tVHJhbnNmb3JtZXJzPzogQ3VzdG9tVHJhbnNmb3JtZXJzLFxuICAgIGVtaXRDYWxsYmFjaz86IFRzRW1pdENhbGxiYWNrLFxuICAgIG1lcmdlRW1pdFJlc3VsdHNDYWxsYmFjaz86IFRzTWVyZ2VFbWl0UmVzdWx0c0NhbGxiYWNrLFxuICB9ID0ge30pOiB0cy5FbWl0UmVzdWx0IHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmVuYWJsZUl2eSA9PT0gJ25ndHNjJyB8fCB0aGlzLm9wdGlvbnMuZW5hYmxlSXZ5ID09PSAndHNjJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgcnVuIGxlZ2FjeSBjb21waWxlciBpbiBuZ3RzYyBtb2RlJyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm9wdGlvbnMuZW5hYmxlSXZ5ID09PSB0cnVlID8gdGhpcy5fZW1pdFJlbmRlcjMocGFyYW1ldGVycykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZW1pdFJlbmRlcjIocGFyYW1ldGVycyk7XG4gIH1cblxuICBwcml2YXRlIF9lbWl0UmVuZGVyMyhcbiAgICAgIHtcbiAgICAgICAgICBlbWl0RmxhZ3MgPSBFbWl0RmxhZ3MuRGVmYXVsdCwgY2FuY2VsbGF0aW9uVG9rZW4sIGN1c3RvbVRyYW5zZm9ybWVycyxcbiAgICAgICAgICBlbWl0Q2FsbGJhY2sgPSBkZWZhdWx0RW1pdENhbGxiYWNrLCBtZXJnZUVtaXRSZXN1bHRzQ2FsbGJhY2sgPSBtZXJnZUVtaXRSZXN1bHRzLFxuICAgICAgfToge1xuICAgICAgICBlbWl0RmxhZ3M/OiBFbWl0RmxhZ3MsXG4gICAgICAgIGNhbmNlbGxhdGlvblRva2VuPzogdHMuQ2FuY2VsbGF0aW9uVG9rZW4sXG4gICAgICAgIGN1c3RvbVRyYW5zZm9ybWVycz86IEN1c3RvbVRyYW5zZm9ybWVycyxcbiAgICAgICAgZW1pdENhbGxiYWNrPzogVHNFbWl0Q2FsbGJhY2ssXG4gICAgICAgIG1lcmdlRW1pdFJlc3VsdHNDYWxsYmFjaz86IFRzTWVyZ2VFbWl0UmVzdWx0c0NhbGxiYWNrLFxuICAgICAgfSA9IHt9KTogdHMuRW1pdFJlc3VsdCB7XG4gICAgY29uc3QgZW1pdFN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICBpZiAoKGVtaXRGbGFncyAmIChFbWl0RmxhZ3MuSlMgfCBFbWl0RmxhZ3MuRFRTIHwgRW1pdEZsYWdzLk1ldGFkYXRhIHwgRW1pdEZsYWdzLkNvZGVnZW4pKSA9PT1cbiAgICAgICAgMCkge1xuICAgICAgcmV0dXJuIHtlbWl0U2tpcHBlZDogdHJ1ZSwgZGlhZ25vc3RpY3M6IFtdLCBlbWl0dGVkRmlsZXM6IFtdfTtcbiAgICB9XG5cbiAgICAvLyBhbmFseXplZE1vZHVsZXMgYW5kIGFuYWx5emVkSW5qZWN0YWJsZXMgYXJlIGNyZWF0ZWQgdG9nZXRoZXIuIElmIG9uZSBleGlzdHMsIHNvIGRvZXMgdGhlXG4gICAgLy8gb3RoZXIuXG4gICAgY29uc3QgbW9kdWxlcyA9XG4gICAgICAgIHRoaXMuY29tcGlsZXIuZW1pdEFsbFBhcnRpYWxNb2R1bGVzKHRoaXMuYW5hbHl6ZWRNb2R1bGVzLCB0aGlzLl9hbmFseXplZEluamVjdGFibGVzICEpO1xuXG4gICAgY29uc3Qgd3JpdGVUc0ZpbGU6IHRzLldyaXRlRmlsZUNhbGxiYWNrID1cbiAgICAgICAgKG91dEZpbGVOYW1lLCBvdXREYXRhLCB3cml0ZUJ5dGVPcmRlck1hcmssIG9uRXJyb3I/LCBzb3VyY2VGaWxlcz8pID0+IHtcbiAgICAgICAgICBjb25zdCBzb3VyY2VGaWxlID0gc291cmNlRmlsZXMgJiYgc291cmNlRmlsZXMubGVuZ3RoID09IDEgPyBzb3VyY2VGaWxlc1swXSA6IG51bGw7XG4gICAgICAgICAgbGV0IGdlbkZpbGU6IEdlbmVyYXRlZEZpbGV8dW5kZWZpbmVkO1xuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYW5ub3RhdGVGb3JDbG9zdXJlQ29tcGlsZXIgJiYgc291cmNlRmlsZSAmJlxuICAgICAgICAgICAgICBUUy50ZXN0KHNvdXJjZUZpbGUuZmlsZU5hbWUpKSB7XG4gICAgICAgICAgICBvdXREYXRhID0gbm9jb2xsYXBzZUhhY2sob3V0RGF0YSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMud3JpdGVGaWxlKG91dEZpbGVOYW1lLCBvdXREYXRhLCB3cml0ZUJ5dGVPcmRlck1hcmssIG9uRXJyb3IsIHVuZGVmaW5lZCwgc291cmNlRmlsZXMpO1xuICAgICAgICB9O1xuXG4gICAgY29uc3QgZW1pdE9ubHlEdHNGaWxlcyA9IChlbWl0RmxhZ3MgJiAoRW1pdEZsYWdzLkRUUyB8IEVtaXRGbGFncy5KUykpID09IEVtaXRGbGFncy5EVFM7XG5cbiAgICBjb25zdCB0c0N1c3RvbVRyYW5zZm9ybWVycyA9IHRoaXMuY2FsY3VsYXRlVHJhbnNmb3JtcyhcbiAgICAgICAgLyogZ2VuRmlsZXMgKi8gdW5kZWZpbmVkLCAvKiBwYXJ0aWFsTW9kdWxlcyAqLyBtb2R1bGVzLFxuICAgICAgICAvKiBzdHJpcERlY29yYXRvcnMgKi8gdGhpcy5yZWlmaWVkRGVjb3JhdG9ycywgY3VzdG9tVHJhbnNmb3JtZXJzKTtcblxuXG4gICAgLy8gUmVzdG9yZSB0aGUgb3JpZ2luYWwgcmVmZXJlbmNlcyBiZWZvcmUgd2UgZW1pdCBzbyBUeXBlU2NyaXB0IGRvZXNuJ3QgZW1pdFxuICAgIC8vIGEgcmVmZXJlbmNlIHRvIHRoZSAuZC50cyBmaWxlLlxuICAgIGNvbnN0IGF1Z21lbnRlZFJlZmVyZW5jZXMgPSBuZXcgTWFwPHRzLlNvdXJjZUZpbGUsIFJlYWRvbmx5QXJyYXk8dHMuRmlsZVJlZmVyZW5jZT4+KCk7XG4gICAgZm9yIChjb25zdCBzb3VyY2VGaWxlIG9mIHRoaXMudHNQcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkpIHtcbiAgICAgIGNvbnN0IG9yaWdpbmFsUmVmZXJlbmNlcyA9IGdldE9yaWdpbmFsUmVmZXJlbmNlcyhzb3VyY2VGaWxlKTtcbiAgICAgIGlmIChvcmlnaW5hbFJlZmVyZW5jZXMpIHtcbiAgICAgICAgYXVnbWVudGVkUmVmZXJlbmNlcy5zZXQoc291cmNlRmlsZSwgc291cmNlRmlsZS5yZWZlcmVuY2VkRmlsZXMpO1xuICAgICAgICBzb3VyY2VGaWxlLnJlZmVyZW5jZWRGaWxlcyA9IG9yaWdpbmFsUmVmZXJlbmNlcztcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGVtaXRDYWxsYmFjayh7XG4gICAgICAgIHByb2dyYW06IHRoaXMudHNQcm9ncmFtLFxuICAgICAgICBob3N0OiB0aGlzLmhvc3QsXG4gICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgd3JpdGVGaWxlOiB3cml0ZVRzRmlsZSwgZW1pdE9ubHlEdHNGaWxlcyxcbiAgICAgICAgY3VzdG9tVHJhbnNmb3JtZXJzOiB0c0N1c3RvbVRyYW5zZm9ybWVyc1xuICAgICAgfSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIC8vIFJlc3RvcmUgdGhlIHJlZmVyZW5jZXMgYmFjayB0byB0aGUgYXVnbWVudGVkIHZhbHVlIHRvIGVuc3VyZSB0aGF0IHRoZVxuICAgICAgLy8gY2hlY2tzIHRoYXQgVHlwZVNjcmlwdCBtYWtlcyBmb3IgcHJvamVjdCBzdHJ1Y3R1cmUgcmV1c2Ugd2lsbCBzdWNjZWVkLlxuICAgICAgZm9yIChjb25zdCBbc291cmNlRmlsZSwgcmVmZXJlbmNlc10gb2YgQXJyYXkuZnJvbShhdWdtZW50ZWRSZWZlcmVuY2VzKSkge1xuICAgICAgICAvLyBUT0RPKGNodWNraik6IFJlbW92ZSBhbnkgY2FzdCBhZnRlciB1cGRhdGluZyBidWlsZCB0byAyLjZcbiAgICAgICAgKHNvdXJjZUZpbGUgYXMgYW55KS5yZWZlcmVuY2VkRmlsZXMgPSByZWZlcmVuY2VzO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2VtaXRSZW5kZXIyKFxuICAgICAge1xuICAgICAgICAgIGVtaXRGbGFncyA9IEVtaXRGbGFncy5EZWZhdWx0LCBjYW5jZWxsYXRpb25Ub2tlbiwgY3VzdG9tVHJhbnNmb3JtZXJzLFxuICAgICAgICAgIGVtaXRDYWxsYmFjayA9IGRlZmF1bHRFbWl0Q2FsbGJhY2ssIG1lcmdlRW1pdFJlc3VsdHNDYWxsYmFjayA9IG1lcmdlRW1pdFJlc3VsdHMsXG4gICAgICB9OiB7XG4gICAgICAgIGVtaXRGbGFncz86IEVtaXRGbGFncyxcbiAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW4/OiB0cy5DYW5jZWxsYXRpb25Ub2tlbixcbiAgICAgICAgY3VzdG9tVHJhbnNmb3JtZXJzPzogQ3VzdG9tVHJhbnNmb3JtZXJzLFxuICAgICAgICBlbWl0Q2FsbGJhY2s/OiBUc0VtaXRDYWxsYmFjayxcbiAgICAgICAgbWVyZ2VFbWl0UmVzdWx0c0NhbGxiYWNrPzogVHNNZXJnZUVtaXRSZXN1bHRzQ2FsbGJhY2ssXG4gICAgICB9ID0ge30pOiB0cy5FbWl0UmVzdWx0IHtcbiAgICBjb25zdCBlbWl0U3RhcnQgPSBEYXRlLm5vdygpO1xuICAgIGlmIChlbWl0RmxhZ3MgJiBFbWl0RmxhZ3MuSTE4bkJ1bmRsZSkge1xuICAgICAgY29uc3QgbG9jYWxlID0gdGhpcy5vcHRpb25zLmkxOG5PdXRMb2NhbGUgfHwgbnVsbDtcbiAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLm9wdGlvbnMuaTE4bk91dEZpbGUgfHwgbnVsbDtcbiAgICAgIGNvbnN0IGZvcm1hdCA9IHRoaXMub3B0aW9ucy5pMThuT3V0Rm9ybWF0IHx8IG51bGw7XG4gICAgICBjb25zdCBidW5kbGUgPSB0aGlzLmNvbXBpbGVyLmVtaXRNZXNzYWdlQnVuZGxlKHRoaXMuYW5hbHl6ZWRNb2R1bGVzLCBsb2NhbGUpO1xuICAgICAgaTE4bkV4dHJhY3QoZm9ybWF0LCBmaWxlLCB0aGlzLmhvc3QsIHRoaXMub3B0aW9ucywgYnVuZGxlKTtcbiAgICB9XG4gICAgaWYgKChlbWl0RmxhZ3MgJiAoRW1pdEZsYWdzLkpTIHwgRW1pdEZsYWdzLkRUUyB8IEVtaXRGbGFncy5NZXRhZGF0YSB8IEVtaXRGbGFncy5Db2RlZ2VuKSkgPT09XG4gICAgICAgIDApIHtcbiAgICAgIHJldHVybiB7ZW1pdFNraXBwZWQ6IHRydWUsIGRpYWdub3N0aWNzOiBbXSwgZW1pdHRlZEZpbGVzOiBbXX07XG4gICAgfVxuICAgIGxldCB7Z2VuRmlsZXMsIGdlbkRpYWdzfSA9IHRoaXMuZ2VuZXJhdGVGaWxlc0ZvckVtaXQoZW1pdEZsYWdzKTtcbiAgICBpZiAoZ2VuRGlhZ3MubGVuZ3RoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkaWFnbm9zdGljczogZ2VuRGlhZ3MsXG4gICAgICAgIGVtaXRTa2lwcGVkOiB0cnVlLFxuICAgICAgICBlbWl0dGVkRmlsZXM6IFtdLFxuICAgICAgfTtcbiAgICB9XG4gICAgdGhpcy5lbWl0dGVkR2VuZXJhdGVkRmlsZXMgPSBnZW5GaWxlcztcbiAgICBjb25zdCBvdXRTcmNNYXBwaW5nOiBBcnJheTx7c291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgb3V0RmlsZU5hbWU6IHN0cmluZ30+ID0gW107XG4gICAgY29uc3QgZ2VuRmlsZUJ5RmlsZU5hbWUgPSBuZXcgTWFwPHN0cmluZywgR2VuZXJhdGVkRmlsZT4oKTtcbiAgICBnZW5GaWxlcy5mb3JFYWNoKGdlbkZpbGUgPT4gZ2VuRmlsZUJ5RmlsZU5hbWUuc2V0KGdlbkZpbGUuZ2VuRmlsZVVybCwgZ2VuRmlsZSkpO1xuICAgIHRoaXMuZW1pdHRlZExpYnJhcnlTdW1tYXJpZXMgPSBbXTtcbiAgICBjb25zdCBlbWl0dGVkU291cmNlRmlsZXMgPSBbXSBhcyB0cy5Tb3VyY2VGaWxlW107XG4gICAgY29uc3Qgd3JpdGVUc0ZpbGU6IHRzLldyaXRlRmlsZUNhbGxiYWNrID1cbiAgICAgICAgKG91dEZpbGVOYW1lLCBvdXREYXRhLCB3cml0ZUJ5dGVPcmRlck1hcmssIG9uRXJyb3I/LCBzb3VyY2VGaWxlcz8pID0+IHtcbiAgICAgICAgICBjb25zdCBzb3VyY2VGaWxlID0gc291cmNlRmlsZXMgJiYgc291cmNlRmlsZXMubGVuZ3RoID09IDEgPyBzb3VyY2VGaWxlc1swXSA6IG51bGw7XG4gICAgICAgICAgbGV0IGdlbkZpbGU6IEdlbmVyYXRlZEZpbGV8dW5kZWZpbmVkO1xuICAgICAgICAgIGlmIChzb3VyY2VGaWxlKSB7XG4gICAgICAgICAgICBvdXRTcmNNYXBwaW5nLnB1c2goe291dEZpbGVOYW1lOiBvdXRGaWxlTmFtZSwgc291cmNlRmlsZX0pO1xuICAgICAgICAgICAgZ2VuRmlsZSA9IGdlbkZpbGVCeUZpbGVOYW1lLmdldChzb3VyY2VGaWxlLmZpbGVOYW1lKTtcbiAgICAgICAgICAgIGlmICghc291cmNlRmlsZS5pc0RlY2xhcmF0aW9uRmlsZSAmJiAhR0VORVJBVEVEX0ZJTEVTLnRlc3Qoc291cmNlRmlsZS5maWxlTmFtZSkpIHtcbiAgICAgICAgICAgICAgLy8gTm90ZTogc291cmNlRmlsZSBpcyB0aGUgdHJhbnNmb3JtZWQgc291cmNlZmlsZSwgbm90IHRoZSBvcmlnaW5hbCBvbmUhXG4gICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsRmlsZSA9IHRoaXMudHNQcm9ncmFtLmdldFNvdXJjZUZpbGUoc291cmNlRmlsZS5maWxlTmFtZSk7XG4gICAgICAgICAgICAgIGlmIChvcmlnaW5hbEZpbGUpIHtcbiAgICAgICAgICAgICAgICBlbWl0dGVkU291cmNlRmlsZXMucHVzaChvcmlnaW5hbEZpbGUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmFubm90YXRlRm9yQ2xvc3VyZUNvbXBpbGVyICYmIFRTLnRlc3Qoc291cmNlRmlsZS5maWxlTmFtZSkpIHtcbiAgICAgICAgICAgICAgb3V0RGF0YSA9IG5vY29sbGFwc2VIYWNrKG91dERhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLndyaXRlRmlsZShvdXRGaWxlTmFtZSwgb3V0RGF0YSwgd3JpdGVCeXRlT3JkZXJNYXJrLCBvbkVycm9yLCBnZW5GaWxlLCBzb3VyY2VGaWxlcyk7XG4gICAgICAgIH07XG5cbiAgICBjb25zdCBtb2R1bGVzID0gdGhpcy5fYW5hbHl6ZWRJbmplY3RhYmxlcyAmJlxuICAgICAgICB0aGlzLmNvbXBpbGVyLmVtaXRBbGxQYXJ0aWFsTW9kdWxlczIodGhpcy5fYW5hbHl6ZWRJbmplY3RhYmxlcyk7XG5cbiAgICBjb25zdCB0c0N1c3RvbVRyYW5zZm9ybWVycyA9IHRoaXMuY2FsY3VsYXRlVHJhbnNmb3JtcyhcbiAgICAgICAgZ2VuRmlsZUJ5RmlsZU5hbWUsIG1vZHVsZXMsIC8qIHN0cmlwRGVjb3JhdG9ycyAqLyB1bmRlZmluZWQsIGN1c3RvbVRyYW5zZm9ybWVycyk7XG4gICAgY29uc3QgZW1pdE9ubHlEdHNGaWxlcyA9IChlbWl0RmxhZ3MgJiAoRW1pdEZsYWdzLkRUUyB8IEVtaXRGbGFncy5KUykpID09IEVtaXRGbGFncy5EVFM7XG4gICAgLy8gUmVzdG9yZSB0aGUgb3JpZ2luYWwgcmVmZXJlbmNlcyBiZWZvcmUgd2UgZW1pdCBzbyBUeXBlU2NyaXB0IGRvZXNuJ3QgZW1pdFxuICAgIC8vIGEgcmVmZXJlbmNlIHRvIHRoZSAuZC50cyBmaWxlLlxuICAgIGNvbnN0IGF1Z21lbnRlZFJlZmVyZW5jZXMgPSBuZXcgTWFwPHRzLlNvdXJjZUZpbGUsIFJlYWRvbmx5QXJyYXk8dHMuRmlsZVJlZmVyZW5jZT4+KCk7XG4gICAgZm9yIChjb25zdCBzb3VyY2VGaWxlIG9mIHRoaXMudHNQcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkpIHtcbiAgICAgIGNvbnN0IG9yaWdpbmFsUmVmZXJlbmNlcyA9IGdldE9yaWdpbmFsUmVmZXJlbmNlcyhzb3VyY2VGaWxlKTtcbiAgICAgIGlmIChvcmlnaW5hbFJlZmVyZW5jZXMpIHtcbiAgICAgICAgYXVnbWVudGVkUmVmZXJlbmNlcy5zZXQoc291cmNlRmlsZSwgc291cmNlRmlsZS5yZWZlcmVuY2VkRmlsZXMpO1xuICAgICAgICBzb3VyY2VGaWxlLnJlZmVyZW5jZWRGaWxlcyA9IG9yaWdpbmFsUmVmZXJlbmNlcztcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZ2VuVHNGaWxlczogR2VuZXJhdGVkRmlsZVtdID0gW107XG4gICAgY29uc3QgZ2VuSnNvbkZpbGVzOiBHZW5lcmF0ZWRGaWxlW10gPSBbXTtcbiAgICBnZW5GaWxlcy5mb3JFYWNoKGdmID0+IHtcbiAgICAgIGlmIChnZi5zdG10cykge1xuICAgICAgICBnZW5Uc0ZpbGVzLnB1c2goZ2YpO1xuICAgICAgfVxuICAgICAgaWYgKGdmLnNvdXJjZSkge1xuICAgICAgICBnZW5Kc29uRmlsZXMucHVzaChnZik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgbGV0IGVtaXRSZXN1bHQ6IHRzLkVtaXRSZXN1bHQ7XG4gICAgbGV0IGVtaXR0ZWRVc2VyVHNDb3VudDogbnVtYmVyO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzb3VyY2VGaWxlc1RvRW1pdCA9IHRoaXMuZ2V0U291cmNlRmlsZXNGb3JFbWl0KCk7XG4gICAgICBpZiAoc291cmNlRmlsZXNUb0VtaXQgJiZcbiAgICAgICAgICAoc291cmNlRmlsZXNUb0VtaXQubGVuZ3RoICsgZ2VuVHNGaWxlcy5sZW5ndGgpIDwgTUFYX0ZJTEVfQ09VTlRfRk9SX1NJTkdMRV9GSUxFX0VNSVQpIHtcbiAgICAgICAgY29uc3QgZmlsZU5hbWVzVG9FbWl0ID1cbiAgICAgICAgICAgIFsuLi5zb3VyY2VGaWxlc1RvRW1pdC5tYXAoc2YgPT4gc2YuZmlsZU5hbWUpLCAuLi5nZW5Uc0ZpbGVzLm1hcChnZiA9PiBnZi5nZW5GaWxlVXJsKV07XG4gICAgICAgIGVtaXRSZXN1bHQgPSBtZXJnZUVtaXRSZXN1bHRzQ2FsbGJhY2soXG4gICAgICAgICAgICBmaWxlTmFtZXNUb0VtaXQubWFwKChmaWxlTmFtZSkgPT4gZW1pdFJlc3VsdCA9IGVtaXRDYWxsYmFjayh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3JhbTogdGhpcy50c1Byb2dyYW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9zdDogdGhpcy5ob3N0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3cml0ZUZpbGU6IHdyaXRlVHNGaWxlLCBlbWl0T25seUR0c0ZpbGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbVRyYW5zZm9ybWVyczogdHNDdXN0b21UcmFuc2Zvcm1lcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0U291cmNlRmlsZTogdGhpcy50c1Byb2dyYW0uZ2V0U291cmNlRmlsZShmaWxlTmFtZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKSk7XG4gICAgICAgIGVtaXR0ZWRVc2VyVHNDb3VudCA9IHNvdXJjZUZpbGVzVG9FbWl0Lmxlbmd0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVtaXRSZXN1bHQgPSBlbWl0Q2FsbGJhY2soe1xuICAgICAgICAgIHByb2dyYW06IHRoaXMudHNQcm9ncmFtLFxuICAgICAgICAgIGhvc3Q6IHRoaXMuaG9zdCxcbiAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgd3JpdGVGaWxlOiB3cml0ZVRzRmlsZSwgZW1pdE9ubHlEdHNGaWxlcyxcbiAgICAgICAgICBjdXN0b21UcmFuc2Zvcm1lcnM6IHRzQ3VzdG9tVHJhbnNmb3JtZXJzXG4gICAgICAgIH0pO1xuICAgICAgICBlbWl0dGVkVXNlclRzQ291bnQgPSB0aGlzLnRzUHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpLmxlbmd0aCAtIGdlblRzRmlsZXMubGVuZ3RoO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICAvLyBSZXN0b3JlIHRoZSByZWZlcmVuY2VzIGJhY2sgdG8gdGhlIGF1Z21lbnRlZCB2YWx1ZSB0byBlbnN1cmUgdGhhdCB0aGVcbiAgICAgIC8vIGNoZWNrcyB0aGF0IFR5cGVTY3JpcHQgbWFrZXMgZm9yIHByb2plY3Qgc3RydWN0dXJlIHJldXNlIHdpbGwgc3VjY2VlZC5cbiAgICAgIGZvciAoY29uc3QgW3NvdXJjZUZpbGUsIHJlZmVyZW5jZXNdIG9mIEFycmF5LmZyb20oYXVnbWVudGVkUmVmZXJlbmNlcykpIHtcbiAgICAgICAgLy8gVE9ETyhjaHVja2opOiBSZW1vdmUgYW55IGNhc3QgYWZ0ZXIgdXBkYXRpbmcgYnVpbGQgdG8gMi42XG4gICAgICAgIChzb3VyY2VGaWxlIGFzIGFueSkucmVmZXJlbmNlZEZpbGVzID0gcmVmZXJlbmNlcztcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5lbWl0dGVkU291cmNlRmlsZXMgPSBlbWl0dGVkU291cmNlRmlsZXM7XG5cbiAgICAvLyBNYXRjaCBiZWhhdmlvciBvZiB0c2M6IG9ubHkgcHJvZHVjZSBlbWl0IGRpYWdub3N0aWNzIGlmIGl0IHdvdWxkIGJsb2NrXG4gICAgLy8gZW1pdC4gSWYgbm9FbWl0T25FcnJvciBpcyBmYWxzZSwgdGhlIGVtaXQgd2lsbCBoYXBwZW4gaW4gc3BpdGUgb2YgYW55XG4gICAgLy8gZXJyb3JzLCBzbyB3ZSBzaG91bGQgbm90IHJlcG9ydCB0aGVtLlxuICAgIGlmICh0aGlzLm9wdGlvbnMubm9FbWl0T25FcnJvciA9PT0gdHJ1ZSkge1xuICAgICAgLy8gdHJhbnNsYXRlIHRoZSBkaWFnbm9zdGljcyBpbiB0aGUgZW1pdFJlc3VsdCBhcyB3ZWxsLlxuICAgICAgY29uc3QgdHJhbnNsYXRlZEVtaXREaWFncyA9IHRyYW5zbGF0ZURpYWdub3N0aWNzKHRoaXMuaG9zdEFkYXB0ZXIsIGVtaXRSZXN1bHQuZGlhZ25vc3RpY3MpO1xuICAgICAgZW1pdFJlc3VsdC5kaWFnbm9zdGljcyA9IHRyYW5zbGF0ZWRFbWl0RGlhZ3MudHMuY29uY2F0KFxuICAgICAgICAgIHRoaXMuc3RydWN0dXJhbERpYWdub3N0aWNzLmNvbmNhdCh0cmFuc2xhdGVkRW1pdERpYWdzLm5nKS5tYXAobmdUb1RzRGlhZ25vc3RpYykpO1xuICAgIH1cblxuICAgIGlmICghb3V0U3JjTWFwcGluZy5sZW5ndGgpIHtcbiAgICAgIC8vIGlmIG5vIGZpbGVzIHdlcmUgZW1pdHRlZCBieSBUeXBlU2NyaXB0LCBhbHNvIGRvbid0IGVtaXQgLmpzb24gZmlsZXNcbiAgICAgIGVtaXRSZXN1bHQuZGlhZ25vc3RpY3MgPVxuICAgICAgICAgIGVtaXRSZXN1bHQuZGlhZ25vc3RpY3MuY29uY2F0KFtjcmVhdGVNZXNzYWdlRGlhZ25vc3RpYyhgRW1pdHRlZCBubyBmaWxlcy5gKV0pO1xuICAgICAgcmV0dXJuIGVtaXRSZXN1bHQ7XG4gICAgfVxuXG4gICAgbGV0IHNhbXBsZVNyY0ZpbGVOYW1lOiBzdHJpbmd8dW5kZWZpbmVkO1xuICAgIGxldCBzYW1wbGVPdXRGaWxlTmFtZTogc3RyaW5nfHVuZGVmaW5lZDtcbiAgICBpZiAob3V0U3JjTWFwcGluZy5sZW5ndGgpIHtcbiAgICAgIHNhbXBsZVNyY0ZpbGVOYW1lID0gb3V0U3JjTWFwcGluZ1swXS5zb3VyY2VGaWxlLmZpbGVOYW1lO1xuICAgICAgc2FtcGxlT3V0RmlsZU5hbWUgPSBvdXRTcmNNYXBwaW5nWzBdLm91dEZpbGVOYW1lO1xuICAgIH1cbiAgICBjb25zdCBzcmNUb091dFBhdGggPVxuICAgICAgICBjcmVhdGVTcmNUb091dFBhdGhNYXBwZXIodGhpcy5vcHRpb25zLm91dERpciwgc2FtcGxlU3JjRmlsZU5hbWUsIHNhbXBsZU91dEZpbGVOYW1lKTtcbiAgICBpZiAoZW1pdEZsYWdzICYgRW1pdEZsYWdzLkNvZGVnZW4pIHtcbiAgICAgIGdlbkpzb25GaWxlcy5mb3JFYWNoKGdmID0+IHtcbiAgICAgICAgY29uc3Qgb3V0RmlsZU5hbWUgPSBzcmNUb091dFBhdGgoZ2YuZ2VuRmlsZVVybCk7XG4gICAgICAgIHRoaXMud3JpdGVGaWxlKG91dEZpbGVOYW1lLCBnZi5zb3VyY2UgISwgZmFsc2UsIHVuZGVmaW5lZCwgZ2YpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGxldCBtZXRhZGF0YUpzb25Db3VudCA9IDA7XG4gICAgaWYgKGVtaXRGbGFncyAmIEVtaXRGbGFncy5NZXRhZGF0YSkge1xuICAgICAgdGhpcy50c1Byb2dyYW0uZ2V0U291cmNlRmlsZXMoKS5mb3JFYWNoKHNmID0+IHtcbiAgICAgICAgaWYgKCFzZi5pc0RlY2xhcmF0aW9uRmlsZSAmJiAhR0VORVJBVEVEX0ZJTEVTLnRlc3Qoc2YuZmlsZU5hbWUpKSB7XG4gICAgICAgICAgbWV0YWRhdGFKc29uQ291bnQrKztcbiAgICAgICAgICBjb25zdCBtZXRhZGF0YSA9IHRoaXMubWV0YWRhdGFDYWNoZS5nZXRNZXRhZGF0YShzZik7XG4gICAgICAgICAgaWYgKG1ldGFkYXRhKSB7XG4gICAgICAgICAgICBjb25zdCBtZXRhZGF0YVRleHQgPSBKU09OLnN0cmluZ2lmeShbbWV0YWRhdGFdKTtcbiAgICAgICAgICAgIGNvbnN0IG91dEZpbGVOYW1lID0gc3JjVG9PdXRQYXRoKHNmLmZpbGVOYW1lLnJlcGxhY2UoL1xcLnRzeD8kLywgJy5tZXRhZGF0YS5qc29uJykpO1xuICAgICAgICAgICAgdGhpcy53cml0ZUZpbGUob3V0RmlsZU5hbWUsIG1ldGFkYXRhVGV4dCwgZmFsc2UsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBbc2ZdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBjb25zdCBlbWl0RW5kID0gRGF0ZS5ub3coKTtcbiAgICBpZiAodGhpcy5vcHRpb25zLmRpYWdub3N0aWNzKSB7XG4gICAgICBlbWl0UmVzdWx0LmRpYWdub3N0aWNzID0gZW1pdFJlc3VsdC5kaWFnbm9zdGljcy5jb25jYXQoW2NyZWF0ZU1lc3NhZ2VEaWFnbm9zdGljKFtcbiAgICAgICAgYEVtaXR0ZWQgaW4gJHtlbWl0RW5kIC0gZW1pdFN0YXJ0fW1zYCxcbiAgICAgICAgYC0gJHtlbWl0dGVkVXNlclRzQ291bnR9IHVzZXIgdHMgZmlsZXNgLFxuICAgICAgICBgLSAke2dlblRzRmlsZXMubGVuZ3RofSBnZW5lcmF0ZWQgdHMgZmlsZXNgLFxuICAgICAgICBgLSAke2dlbkpzb25GaWxlcy5sZW5ndGggKyBtZXRhZGF0YUpzb25Db3VudH0gZ2VuZXJhdGVkIGpzb24gZmlsZXNgLFxuICAgICAgXS5qb2luKCdcXG4nKSldKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZW1pdFJlc3VsdDtcbiAgfVxuXG4gIC8vIFByaXZhdGUgbWVtYmVyc1xuICBwcml2YXRlIGdldCBjb21waWxlcigpOiBBb3RDb21waWxlciB7XG4gICAgaWYgKCF0aGlzLl9jb21waWxlcikge1xuICAgICAgdGhpcy5fY3JlYXRlQ29tcGlsZXIoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2NvbXBpbGVyICE7XG4gIH1cblxuICBwcml2YXRlIGdldCBob3N0QWRhcHRlcigpOiBUc0NvbXBpbGVyQW90Q29tcGlsZXJUeXBlQ2hlY2tIb3N0QWRhcHRlciB7XG4gICAgaWYgKCF0aGlzLl9ob3N0QWRhcHRlcikge1xuICAgICAgdGhpcy5fY3JlYXRlQ29tcGlsZXIoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2hvc3RBZGFwdGVyICE7XG4gIH1cblxuICBwcml2YXRlIGdldCBhbmFseXplZE1vZHVsZXMoKTogTmdBbmFseXplZE1vZHVsZXMge1xuICAgIGlmICghdGhpcy5fYW5hbHl6ZWRNb2R1bGVzKSB7XG4gICAgICB0aGlzLmluaXRTeW5jKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9hbmFseXplZE1vZHVsZXMgITtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IHN0cnVjdHVyYWxEaWFnbm9zdGljcygpOiBSZWFkb25seUFycmF5PERpYWdub3N0aWM+IHtcbiAgICBsZXQgZGlhZ25vc3RpY3MgPSB0aGlzLl9zdHJ1Y3R1cmFsRGlhZ25vc3RpY3M7XG4gICAgaWYgKCFkaWFnbm9zdGljcykge1xuICAgICAgdGhpcy5pbml0U3luYygpO1xuICAgICAgZGlhZ25vc3RpY3MgPSAodGhpcy5fc3RydWN0dXJhbERpYWdub3N0aWNzID0gdGhpcy5fc3RydWN0dXJhbERpYWdub3N0aWNzIHx8IFtdKTtcbiAgICB9XG4gICAgcmV0dXJuIGRpYWdub3N0aWNzO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgdHNQcm9ncmFtKCk6IHRzLlByb2dyYW0ge1xuICAgIGlmICghdGhpcy5fdHNQcm9ncmFtKSB7XG4gICAgICB0aGlzLmluaXRTeW5jKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl90c1Byb2dyYW0gITtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IHJlaWZpZWREZWNvcmF0b3JzKCk6IFNldDxTdGF0aWNTeW1ib2w+IHtcbiAgICBpZiAoIXRoaXMuX3JlaWZpZWREZWNvcmF0b3JzKSB7XG4gICAgICBjb25zdCByZWZsZWN0b3IgPSB0aGlzLmNvbXBpbGVyLnJlZmxlY3RvcjtcbiAgICAgIHRoaXMuX3JlaWZpZWREZWNvcmF0b3JzID0gbmV3IFNldChcbiAgICAgICAgICBSM19SRUlGSUVEX0RFQ09SQVRPUlMubWFwKG5hbWUgPT4gcmVmbGVjdG9yLmZpbmREZWNsYXJhdGlvbignQGFuZ3VsYXIvY29yZScsIG5hbWUpKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9yZWlmaWVkRGVjb3JhdG9ycztcbiAgfVxuXG4gIHByaXZhdGUgY2FsY3VsYXRlVHJhbnNmb3JtcyhcbiAgICAgIGdlbkZpbGVzOiBNYXA8c3RyaW5nLCBHZW5lcmF0ZWRGaWxlPnx1bmRlZmluZWQsIHBhcnRpYWxNb2R1bGVzOiBQYXJ0aWFsTW9kdWxlW118dW5kZWZpbmVkLFxuICAgICAgc3RyaXBEZWNvcmF0b3JzOiBTZXQ8U3RhdGljU3ltYm9sPnx1bmRlZmluZWQsXG4gICAgICBjdXN0b21UcmFuc2Zvcm1lcnM/OiBDdXN0b21UcmFuc2Zvcm1lcnMpOiB0cy5DdXN0b21UcmFuc2Zvcm1lcnMge1xuICAgIGNvbnN0IGJlZm9yZVRzOiBBcnJheTx0cy5UcmFuc2Zvcm1lckZhY3Rvcnk8dHMuU291cmNlRmlsZT4+ID0gW107XG4gICAgY29uc3QgbWV0YWRhdGFUcmFuc2Zvcm1zOiBNZXRhZGF0YVRyYW5zZm9ybWVyW10gPSBbXTtcbiAgICBjb25zdCBmbGF0TW9kdWxlTWV0YWRhdGFUcmFuc2Zvcm1zOiBNZXRhZGF0YVRyYW5zZm9ybWVyW10gPSBbXTtcbiAgICBpZiAodGhpcy5vcHRpb25zLmVuYWJsZVJlc291cmNlSW5saW5pbmcpIHtcbiAgICAgIGJlZm9yZVRzLnB1c2goZ2V0SW5saW5lUmVzb3VyY2VzVHJhbnNmb3JtRmFjdG9yeSh0aGlzLnRzUHJvZ3JhbSwgdGhpcy5ob3N0QWRhcHRlcikpO1xuICAgICAgY29uc3QgdHJhbnNmb3JtZXIgPSBuZXcgSW5saW5lUmVzb3VyY2VzTWV0YWRhdGFUcmFuc2Zvcm1lcih0aGlzLmhvc3RBZGFwdGVyKTtcbiAgICAgIG1ldGFkYXRhVHJhbnNmb3Jtcy5wdXNoKHRyYW5zZm9ybWVyKTtcbiAgICAgIGZsYXRNb2R1bGVNZXRhZGF0YVRyYW5zZm9ybXMucHVzaCh0cmFuc2Zvcm1lcik7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLm9wdGlvbnMuZGlzYWJsZUV4cHJlc3Npb25Mb3dlcmluZykge1xuICAgICAgYmVmb3JlVHMucHVzaChcbiAgICAgICAgICBnZXRFeHByZXNzaW9uTG93ZXJpbmdUcmFuc2Zvcm1GYWN0b3J5KHRoaXMubG93ZXJpbmdNZXRhZGF0YVRyYW5zZm9ybSwgdGhpcy50c1Byb2dyYW0pKTtcbiAgICAgIG1ldGFkYXRhVHJhbnNmb3Jtcy5wdXNoKHRoaXMubG93ZXJpbmdNZXRhZGF0YVRyYW5zZm9ybSk7XG4gICAgfVxuICAgIGlmIChnZW5GaWxlcykge1xuICAgICAgYmVmb3JlVHMucHVzaChnZXRBbmd1bGFyRW1pdHRlclRyYW5zZm9ybUZhY3RvcnkoZ2VuRmlsZXMsIHRoaXMuZ2V0VHNQcm9ncmFtKCkpKTtcbiAgICB9XG4gICAgaWYgKHBhcnRpYWxNb2R1bGVzKSB7XG4gICAgICBiZWZvcmVUcy5wdXNoKGdldEFuZ3VsYXJDbGFzc1RyYW5zZm9ybWVyRmFjdG9yeShwYXJ0aWFsTW9kdWxlcykpO1xuXG4gICAgICAvLyBJZiB3ZSBoYXZlIHBhcnRpYWwgbW9kdWxlcywgdGhlIGNhY2hlZCBtZXRhZGF0YSBtaWdodCBiZSBpbmNvcnJlY3QgYXMgaXQgZG9lc24ndCByZWZsZWN0XG4gICAgICAvLyB0aGUgcGFydGlhbCBtb2R1bGUgdHJhbnNmb3Jtcy5cbiAgICAgIGNvbnN0IHRyYW5zZm9ybWVyID0gbmV3IFBhcnRpYWxNb2R1bGVNZXRhZGF0YVRyYW5zZm9ybWVyKHBhcnRpYWxNb2R1bGVzKTtcbiAgICAgIG1ldGFkYXRhVHJhbnNmb3Jtcy5wdXNoKHRyYW5zZm9ybWVyKTtcbiAgICAgIGZsYXRNb2R1bGVNZXRhZGF0YVRyYW5zZm9ybXMucHVzaCh0cmFuc2Zvcm1lcik7XG4gICAgfVxuXG4gICAgaWYgKHN0cmlwRGVjb3JhdG9ycykge1xuICAgICAgYmVmb3JlVHMucHVzaChnZXREZWNvcmF0b3JTdHJpcFRyYW5zZm9ybWVyRmFjdG9yeShcbiAgICAgICAgICBzdHJpcERlY29yYXRvcnMsIHRoaXMuY29tcGlsZXIucmVmbGVjdG9yLCB0aGlzLmdldFRzUHJvZ3JhbSgpLmdldFR5cGVDaGVja2VyKCkpKTtcbiAgICAgIGNvbnN0IHRyYW5zZm9ybWVyID1cbiAgICAgICAgICBuZXcgU3RyaXBEZWNvcmF0b3JzTWV0YWRhdGFUcmFuc2Zvcm1lcihzdHJpcERlY29yYXRvcnMsIHRoaXMuY29tcGlsZXIucmVmbGVjdG9yKTtcbiAgICAgIG1ldGFkYXRhVHJhbnNmb3Jtcy5wdXNoKHRyYW5zZm9ybWVyKTtcbiAgICAgIGZsYXRNb2R1bGVNZXRhZGF0YVRyYW5zZm9ybXMucHVzaCh0cmFuc2Zvcm1lcik7XG4gICAgfVxuXG4gICAgaWYgKGN1c3RvbVRyYW5zZm9ybWVycyAmJiBjdXN0b21UcmFuc2Zvcm1lcnMuYmVmb3JlVHMpIHtcbiAgICAgIGJlZm9yZVRzLnB1c2goLi4uY3VzdG9tVHJhbnNmb3JtZXJzLmJlZm9yZVRzKTtcbiAgICB9XG4gICAgaWYgKG1ldGFkYXRhVHJhbnNmb3Jtcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLm1ldGFkYXRhQ2FjaGUgPSB0aGlzLmNyZWF0ZU1ldGFkYXRhQ2FjaGUobWV0YWRhdGFUcmFuc2Zvcm1zKTtcbiAgICB9XG4gICAgaWYgKGZsYXRNb2R1bGVNZXRhZGF0YVRyYW5zZm9ybXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5mbGF0TW9kdWxlTWV0YWRhdGFDYWNoZSA9IHRoaXMuY3JlYXRlTWV0YWRhdGFDYWNoZShmbGF0TW9kdWxlTWV0YWRhdGFUcmFuc2Zvcm1zKTtcbiAgICB9XG4gICAgY29uc3QgYWZ0ZXJUcyA9IGN1c3RvbVRyYW5zZm9ybWVycyA/IGN1c3RvbVRyYW5zZm9ybWVycy5hZnRlclRzIDogdW5kZWZpbmVkO1xuICAgIHJldHVybiB7YmVmb3JlOiBiZWZvcmVUcywgYWZ0ZXI6IGFmdGVyVHN9O1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0U3luYygpIHtcbiAgICBpZiAodGhpcy5fYW5hbHl6ZWRNb2R1bGVzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBjb25zdCB7dG1wUHJvZ3JhbSwgc291cmNlRmlsZXMsIHRzRmlsZXMsIHJvb3ROYW1lc30gPSB0aGlzLl9jcmVhdGVQcm9ncmFtV2l0aEJhc2ljU3R1YnMoKTtcbiAgICAgIGNvbnN0IHthbmFseXplZE1vZHVsZXMsIGFuYWx5emVkSW5qZWN0YWJsZXN9ID1cbiAgICAgICAgICB0aGlzLmNvbXBpbGVyLmxvYWRGaWxlc1N5bmMoc291cmNlRmlsZXMsIHRzRmlsZXMpO1xuICAgICAgdGhpcy5fdXBkYXRlUHJvZ3JhbVdpdGhUeXBlQ2hlY2tTdHVicyhcbiAgICAgICAgICB0bXBQcm9ncmFtLCBhbmFseXplZE1vZHVsZXMsIGFuYWx5emVkSW5qZWN0YWJsZXMsIHJvb3ROYW1lcyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fY3JlYXRlUHJvZ3JhbU9uRXJyb3IoZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlQ29tcGlsZXIoKSB7XG4gICAgY29uc3QgY29kZWdlbjogQ29kZUdlbmVyYXRvciA9IHtcbiAgICAgIGdlbmVyYXRlRmlsZTogKGdlbkZpbGVOYW1lLCBiYXNlRmlsZU5hbWUpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jb21waWxlci5lbWl0QmFzaWNTdHViKGdlbkZpbGVOYW1lLCBiYXNlRmlsZU5hbWUpLFxuICAgICAgZmluZEdlbmVyYXRlZEZpbGVOYW1lczogKGZpbGVOYW1lKSA9PiB0aGlzLl9jb21waWxlci5maW5kR2VuZXJhdGVkRmlsZU5hbWVzKGZpbGVOYW1lKSxcbiAgICB9O1xuXG4gICAgdGhpcy5faG9zdEFkYXB0ZXIgPSBuZXcgVHNDb21waWxlckFvdENvbXBpbGVyVHlwZUNoZWNrSG9zdEFkYXB0ZXIoXG4gICAgICAgIHRoaXMucm9vdE5hbWVzLCB0aGlzLm9wdGlvbnMsIHRoaXMuaG9zdCwgdGhpcy5tZXRhZGF0YUNhY2hlLCBjb2RlZ2VuLFxuICAgICAgICB0aGlzLm9sZFByb2dyYW1MaWJyYXJ5U3VtbWFyaWVzKTtcbiAgICBjb25zdCBhb3RPcHRpb25zID0gZ2V0QW90Q29tcGlsZXJPcHRpb25zKHRoaXMub3B0aW9ucyk7XG4gICAgY29uc3QgZXJyb3JDb2xsZWN0b3IgPSAodGhpcy5vcHRpb25zLmNvbGxlY3RBbGxFcnJvcnMgfHwgdGhpcy5vcHRpb25zLmZ1bGxUZW1wbGF0ZVR5cGVDaGVjaykgP1xuICAgICAgICAoZXJyOiBhbnkpID0+IHRoaXMuX2FkZFN0cnVjdHVyYWxEaWFnbm9zdGljcyhlcnIpIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuICAgIHRoaXMuX2NvbXBpbGVyID0gY3JlYXRlQW90Q29tcGlsZXIodGhpcy5faG9zdEFkYXB0ZXIsIGFvdE9wdGlvbnMsIGVycm9yQ29sbGVjdG9yKS5jb21waWxlcjtcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZVByb2dyYW1XaXRoQmFzaWNTdHVicygpOiB7XG4gICAgdG1wUHJvZ3JhbTogdHMuUHJvZ3JhbSxcbiAgICByb290TmFtZXM6IHN0cmluZ1tdLFxuICAgIHNvdXJjZUZpbGVzOiBzdHJpbmdbXSxcbiAgICB0c0ZpbGVzOiBzdHJpbmdbXSxcbiAgfSB7XG4gICAgaWYgKHRoaXMuX2FuYWx5emVkTW9kdWxlcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnRlcm5hbCBFcnJvcjogYWxyZWFkeSBpbml0aWFsaXplZCFgKTtcbiAgICB9XG4gICAgLy8gTm90ZTogVGhpcyBpcyBpbXBvcnRhbnQgdG8gbm90IHByb2R1Y2UgYSBtZW1vcnkgbGVhayFcbiAgICBjb25zdCBvbGRUc1Byb2dyYW0gPSB0aGlzLm9sZFRzUHJvZ3JhbTtcbiAgICB0aGlzLm9sZFRzUHJvZ3JhbSA9IHVuZGVmaW5lZDtcblxuICAgIGNvbnN0IGNvZGVnZW46IENvZGVHZW5lcmF0b3IgPSB7XG4gICAgICBnZW5lcmF0ZUZpbGU6IChnZW5GaWxlTmFtZSwgYmFzZUZpbGVOYW1lKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21waWxlci5lbWl0QmFzaWNTdHViKGdlbkZpbGVOYW1lLCBiYXNlRmlsZU5hbWUpLFxuICAgICAgZmluZEdlbmVyYXRlZEZpbGVOYW1lczogKGZpbGVOYW1lKSA9PiB0aGlzLmNvbXBpbGVyLmZpbmRHZW5lcmF0ZWRGaWxlTmFtZXMoZmlsZU5hbWUpLFxuICAgIH07XG5cblxuICAgIGxldCByb290TmFtZXMgPSBbLi4udGhpcy5yb290TmFtZXNdO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZ2VuZXJhdGVDb2RlRm9yTGlicmFyaWVzICE9PSBmYWxzZSkge1xuICAgICAgLy8gaWYgd2Ugc2hvdWxkIGdlbmVyYXRlQ29kZUZvckxpYnJhcmllcywgbmV2ZXIgaW5jbHVkZVxuICAgICAgLy8gZ2VuZXJhdGVkIGZpbGVzIGluIHRoZSBwcm9ncmFtIGFzIG90aGVyd2lzZSB3ZSB3aWxsXG4gICAgICAvLyBvdmVyd3JpdGUgdGhlbSBhbmQgdHlwZXNjcmlwdCB3aWxsIHJlcG9ydCB0aGUgZXJyb3JcbiAgICAgIC8vIFRTNTA1NTogQ2Fubm90IHdyaXRlIGZpbGUgLi4uIGJlY2F1c2UgaXQgd291bGQgb3ZlcndyaXRlIGlucHV0IGZpbGUuXG4gICAgICByb290TmFtZXMgPSByb290TmFtZXMuZmlsdGVyKGZuID0+ICFHRU5FUkFURURfRklMRVMudGVzdChmbikpO1xuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLm5vUmVzb2x2ZSkge1xuICAgICAgdGhpcy5yb290TmFtZXMuZm9yRWFjaChyb290TmFtZSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmhvc3RBZGFwdGVyLnNob3VsZEdlbmVyYXRlRmlsZXNGb3Iocm9vdE5hbWUpKSB7XG4gICAgICAgICAgcm9vdE5hbWVzLnB1c2goLi4udGhpcy5jb21waWxlci5maW5kR2VuZXJhdGVkRmlsZU5hbWVzKHJvb3ROYW1lKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHRtcFByb2dyYW0gPSB0cy5jcmVhdGVQcm9ncmFtKHJvb3ROYW1lcywgdGhpcy5vcHRpb25zLCB0aGlzLmhvc3RBZGFwdGVyLCBvbGRUc1Byb2dyYW0pO1xuICAgIGNvbnN0IHNvdXJjZUZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IHRzRmlsZXM6IHN0cmluZ1tdID0gW107XG4gICAgdG1wUHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpLmZvckVhY2goc2YgPT4ge1xuICAgICAgaWYgKHRoaXMuaG9zdEFkYXB0ZXIuaXNTb3VyY2VGaWxlKHNmLmZpbGVOYW1lKSkge1xuICAgICAgICBzb3VyY2VGaWxlcy5wdXNoKHNmLmZpbGVOYW1lKTtcbiAgICAgIH1cbiAgICAgIGlmIChUUy50ZXN0KHNmLmZpbGVOYW1lKSAmJiAhRFRTLnRlc3Qoc2YuZmlsZU5hbWUpKSB7XG4gICAgICAgIHRzRmlsZXMucHVzaChzZi5maWxlTmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHt0bXBQcm9ncmFtLCBzb3VyY2VGaWxlcywgdHNGaWxlcywgcm9vdE5hbWVzfTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVByb2dyYW1XaXRoVHlwZUNoZWNrU3R1YnMoXG4gICAgICB0bXBQcm9ncmFtOiB0cy5Qcm9ncmFtLCBhbmFseXplZE1vZHVsZXM6IE5nQW5hbHl6ZWRNb2R1bGVzLFxuICAgICAgYW5hbHl6ZWRJbmplY3RhYmxlczogTmdBbmFseXplZEZpbGVXaXRoSW5qZWN0YWJsZXNbXSwgcm9vdE5hbWVzOiBzdHJpbmdbXSkge1xuICAgIHRoaXMuX2FuYWx5emVkTW9kdWxlcyA9IGFuYWx5emVkTW9kdWxlcztcbiAgICB0aGlzLl9hbmFseXplZEluamVjdGFibGVzID0gYW5hbHl6ZWRJbmplY3RhYmxlcztcbiAgICB0bXBQcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkuZm9yRWFjaChzZiA9PiB7XG4gICAgICBpZiAoc2YuZmlsZU5hbWUuZW5kc1dpdGgoJy5uZ2ZhY3RvcnkudHMnKSkge1xuICAgICAgICBjb25zdCB7Z2VuZXJhdGUsIGJhc2VGaWxlTmFtZX0gPSB0aGlzLmhvc3RBZGFwdGVyLnNob3VsZEdlbmVyYXRlRmlsZShzZi5maWxlTmFtZSk7XG4gICAgICAgIGlmIChnZW5lcmF0ZSkge1xuICAgICAgICAgIC8vIE5vdGU6ICEgaXMgb2sgYXMgaG9zdEFkYXB0ZXIuc2hvdWxkR2VuZXJhdGVGaWxlIHdpbGwgYWx3YXlzIHJldHVybiBhIGJhc2VGaWxlTmFtZVxuICAgICAgICAgIC8vIGZvciAubmdmYWN0b3J5LnRzIGZpbGVzLlxuICAgICAgICAgIGNvbnN0IGdlbkZpbGUgPSB0aGlzLmNvbXBpbGVyLmVtaXRUeXBlQ2hlY2tTdHViKHNmLmZpbGVOYW1lLCBiYXNlRmlsZU5hbWUgISk7XG4gICAgICAgICAgaWYgKGdlbkZpbGUpIHtcbiAgICAgICAgICAgIHRoaXMuaG9zdEFkYXB0ZXIudXBkYXRlR2VuZXJhdGVkRmlsZShnZW5GaWxlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLl90c1Byb2dyYW0gPSB0cy5jcmVhdGVQcm9ncmFtKHJvb3ROYW1lcywgdGhpcy5vcHRpb25zLCB0aGlzLmhvc3RBZGFwdGVyLCB0bXBQcm9ncmFtKTtcbiAgICAvLyBOb3RlOiB0aGUgbmV3IHRzIHByb2dyYW0gc2hvdWxkIGJlIGNvbXBsZXRlbHkgcmV1c2FibGUgYnkgVHlwZVNjcmlwdCBhczpcbiAgICAvLyAtIHdlIGNhY2hlIGFsbCB0aGUgZmlsZXMgaW4gdGhlIGhvc3RBZGFwdGVyXG4gICAgLy8gLSBuZXcgbmV3IHN0dWJzIHVzZSB0aGUgZXhhY3RseSBzYW1lIGltcG9ydHMvZXhwb3J0cyBhcyB0aGUgb2xkIG9uY2UgKHdlIGFzc2VydCB0aGF0IGluXG4gICAgLy8gaG9zdEFkYXB0ZXIudXBkYXRlR2VuZXJhdGVkRmlsZSkuXG4gICAgaWYgKHRzU3RydWN0dXJlSXNSZXVzZWQodG1wUHJvZ3JhbSkgIT09IFN0cnVjdHVyZUlzUmV1c2VkLkNvbXBsZXRlbHkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW50ZXJuYWwgRXJyb3I6IFRoZSBzdHJ1Y3R1cmUgb2YgdGhlIHByb2dyYW0gY2hhbmdlZCBkdXJpbmcgY29kZWdlbi5gKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVQcm9ncmFtT25FcnJvcihlOiBhbnkpIHtcbiAgICAvLyBTdGlsbCBmaWxsIHRoZSBhbmFseXplZE1vZHVsZXMgYW5kIHRoZSB0c1Byb2dyYW1cbiAgICAvLyBzbyB0aGF0IHdlIGRvbid0IGNhdXNlIG90aGVyIGVycm9ycyBmb3IgdXNlcnMgd2hvIGUuZy4gd2FudCB0byBlbWl0IHRoZSBuZ1Byb2dyYW0uXG4gICAgdGhpcy5fYW5hbHl6ZWRNb2R1bGVzID0gZW1wdHlNb2R1bGVzO1xuICAgIHRoaXMub2xkVHNQcm9ncmFtID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2hvc3RBZGFwdGVyLmlzU291cmNlRmlsZSA9ICgpID0+IGZhbHNlO1xuICAgIHRoaXMuX3RzUHJvZ3JhbSA9IHRzLmNyZWF0ZVByb2dyYW0odGhpcy5yb290TmFtZXMsIHRoaXMub3B0aW9ucywgdGhpcy5ob3N0QWRhcHRlcik7XG4gICAgaWYgKGlzU3ludGF4RXJyb3IoZSkpIHtcbiAgICAgIHRoaXMuX2FkZFN0cnVjdHVyYWxEaWFnbm9zdGljcyhlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhyb3cgZTtcbiAgfVxuXG4gIHByaXZhdGUgX2FkZFN0cnVjdHVyYWxEaWFnbm9zdGljcyhlcnJvcjogRXJyb3IpIHtcbiAgICBjb25zdCBkaWFnbm9zdGljcyA9IHRoaXMuX3N0cnVjdHVyYWxEaWFnbm9zdGljcyB8fCAodGhpcy5fc3RydWN0dXJhbERpYWdub3N0aWNzID0gW10pO1xuICAgIGlmIChpc1N5bnRheEVycm9yKGVycm9yKSkge1xuICAgICAgZGlhZ25vc3RpY3MucHVzaCguLi5zeW50YXhFcnJvclRvRGlhZ25vc3RpY3MoZXJyb3IpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGlhZ25vc3RpY3MucHVzaCh7XG4gICAgICAgIG1lc3NhZ2VUZXh0OiBlcnJvci50b1N0cmluZygpLFxuICAgICAgICBjYXRlZ29yeTogdHMuRGlhZ25vc3RpY0NhdGVnb3J5LkVycm9yLFxuICAgICAgICBzb3VyY2U6IFNPVVJDRSxcbiAgICAgICAgY29kZTogREVGQVVMVF9FUlJPUl9DT0RFXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBOb3RlOiB0aGlzIHJldHVybnMgYSB0cy5EaWFnbm9zdGljIHNvIHRoYXQgd2VcbiAgLy8gY2FuIHJldHVybiBlcnJvcnMgaW4gYSB0cy5FbWl0UmVzdWx0XG4gIHByaXZhdGUgZ2VuZXJhdGVGaWxlc0ZvckVtaXQoZW1pdEZsYWdzOiBFbWl0RmxhZ3MpOlxuICAgICAge2dlbkZpbGVzOiBHZW5lcmF0ZWRGaWxlW10sIGdlbkRpYWdzOiB0cy5EaWFnbm9zdGljW119IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCEoZW1pdEZsYWdzICYgRW1pdEZsYWdzLkNvZGVnZW4pKSB7XG4gICAgICAgIHJldHVybiB7Z2VuRmlsZXM6IFtdLCBnZW5EaWFnczogW119O1xuICAgICAgfVxuICAgICAgLy8gVE9ETyh0Ym9zY2gpOiBhbGxvdyBnZW5lcmF0aW5nIGZpbGVzIHRoYXQgYXJlIG5vdCBpbiB0aGUgcm9vdERpclxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzE5MzM3XG4gICAgICBsZXQgZ2VuRmlsZXMgPSB0aGlzLmNvbXBpbGVyLmVtaXRBbGxJbXBscyh0aGlzLmFuYWx5emVkTW9kdWxlcylcbiAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKGdlbkZpbGUgPT4gaXNJblJvb3REaXIoZ2VuRmlsZS5nZW5GaWxlVXJsLCB0aGlzLm9wdGlvbnMpKTtcbiAgICAgIGlmICh0aGlzLm9sZFByb2dyYW1FbWl0dGVkR2VuZXJhdGVkRmlsZXMpIHtcbiAgICAgICAgY29uc3Qgb2xkUHJvZ3JhbUVtaXR0ZWRHZW5lcmF0ZWRGaWxlcyA9IHRoaXMub2xkUHJvZ3JhbUVtaXR0ZWRHZW5lcmF0ZWRGaWxlcztcbiAgICAgICAgZ2VuRmlsZXMgPSBnZW5GaWxlcy5maWx0ZXIoZ2VuRmlsZSA9PiB7XG4gICAgICAgICAgY29uc3Qgb2xkR2VuRmlsZSA9IG9sZFByb2dyYW1FbWl0dGVkR2VuZXJhdGVkRmlsZXMuZ2V0KGdlbkZpbGUuZ2VuRmlsZVVybCk7XG4gICAgICAgICAgcmV0dXJuICFvbGRHZW5GaWxlIHx8ICFnZW5GaWxlLmlzRXF1aXZhbGVudChvbGRHZW5GaWxlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4ge2dlbkZpbGVzLCBnZW5EaWFnczogW119O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIFRPRE8odGJvc2NoKTogY2hlY2sgd2hldGhlciB3ZSBjYW4gYWN0dWFsbHkgaGF2ZSBzeW50YXggZXJyb3JzIGhlcmUsXG4gICAgICAvLyBhcyB3ZSBhbHJlYWR5IHBhcnNlZCB0aGUgbWV0YWRhdGEgYW5kIHRlbXBsYXRlcyBiZWZvcmUgdG8gY3JlYXRlIHRoZSB0eXBlIGNoZWNrIGJsb2NrLlxuICAgICAgaWYgKGlzU3ludGF4RXJyb3IoZSkpIHtcbiAgICAgICAgY29uc3QgZ2VuRGlhZ3M6IHRzLkRpYWdub3N0aWNbXSA9IFt7XG4gICAgICAgICAgZmlsZTogdW5kZWZpbmVkLFxuICAgICAgICAgIHN0YXJ0OiB1bmRlZmluZWQsXG4gICAgICAgICAgbGVuZ3RoOiB1bmRlZmluZWQsXG4gICAgICAgICAgbWVzc2FnZVRleHQ6IGUubWVzc2FnZSxcbiAgICAgICAgICBjYXRlZ29yeTogdHMuRGlhZ25vc3RpY0NhdGVnb3J5LkVycm9yLFxuICAgICAgICAgIHNvdXJjZTogU09VUkNFLFxuICAgICAgICAgIGNvZGU6IERFRkFVTFRfRVJST1JfQ09ERVxuICAgICAgICB9XTtcbiAgICAgICAgcmV0dXJuIHtnZW5GaWxlczogW10sIGdlbkRpYWdzfTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdW5kZWZpbmVkIGlmIGFsbCBmaWxlcyBzaG91bGQgYmUgZW1pdHRlZC5cbiAgICovXG4gIHByaXZhdGUgZ2V0U291cmNlRmlsZXNGb3JFbWl0KCk6IHRzLlNvdXJjZUZpbGVbXXx1bmRlZmluZWQge1xuICAgIC8vIFRPRE8odGJvc2NoKTogaWYgb25lIG9mIHRoZSBmaWxlcyBjb250YWlucyBhIGBjb25zdCBlbnVtYFxuICAgIC8vIGFsd2F5cyBlbWl0IGFsbCBmaWxlcyAtPiByZXR1cm4gdW5kZWZpbmVkIVxuICAgIGxldCBzb3VyY2VGaWxlc1RvRW1pdCA9IHRoaXMudHNQcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkuZmlsdGVyKFxuICAgICAgICBzZiA9PiB7IHJldHVybiAhc2YuaXNEZWNsYXJhdGlvbkZpbGUgJiYgIUdFTkVSQVRFRF9GSUxFUy50ZXN0KHNmLmZpbGVOYW1lKTsgfSk7XG4gICAgaWYgKHRoaXMub2xkUHJvZ3JhbUVtaXR0ZWRTb3VyY2VGaWxlcykge1xuICAgICAgc291cmNlRmlsZXNUb0VtaXQgPSBzb3VyY2VGaWxlc1RvRW1pdC5maWx0ZXIoc2YgPT4ge1xuICAgICAgICBjb25zdCBvbGRGaWxlID0gdGhpcy5vbGRQcm9ncmFtRW1pdHRlZFNvdXJjZUZpbGVzICEuZ2V0KHNmLmZpbGVOYW1lKTtcbiAgICAgICAgcmV0dXJuIHNmICE9PSBvbGRGaWxlO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2VGaWxlc1RvRW1pdDtcbiAgfVxuXG4gIHByaXZhdGUgd3JpdGVGaWxlKFxuICAgICAgb3V0RmlsZU5hbWU6IHN0cmluZywgb3V0RGF0YTogc3RyaW5nLCB3cml0ZUJ5dGVPcmRlck1hcms6IGJvb2xlYW4sXG4gICAgICBvbkVycm9yPzogKG1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZCwgZ2VuRmlsZT86IEdlbmVyYXRlZEZpbGUsXG4gICAgICBzb3VyY2VGaWxlcz86IFJlYWRvbmx5QXJyYXk8dHMuU291cmNlRmlsZT4pIHtcbiAgICAvLyBjb2xsZWN0IGVtaXR0ZWRMaWJyYXJ5U3VtbWFyaWVzXG4gICAgbGV0IGJhc2VGaWxlOiB0cy5Tb3VyY2VGaWxlfHVuZGVmaW5lZDtcbiAgICBpZiAoZ2VuRmlsZSkge1xuICAgICAgYmFzZUZpbGUgPSB0aGlzLnRzUHJvZ3JhbS5nZXRTb3VyY2VGaWxlKGdlbkZpbGUuc3JjRmlsZVVybCk7XG4gICAgICBpZiAoYmFzZUZpbGUpIHtcbiAgICAgICAgaWYgKCF0aGlzLmVtaXR0ZWRMaWJyYXJ5U3VtbWFyaWVzKSB7XG4gICAgICAgICAgdGhpcy5lbWl0dGVkTGlicmFyeVN1bW1hcmllcyA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGlmIChnZW5GaWxlLmdlbkZpbGVVcmwuZW5kc1dpdGgoJy5uZ3N1bW1hcnkuanNvbicpICYmIGJhc2VGaWxlLmZpbGVOYW1lLmVuZHNXaXRoKCcuZC50cycpKSB7XG4gICAgICAgICAgdGhpcy5lbWl0dGVkTGlicmFyeVN1bW1hcmllcy5wdXNoKHtcbiAgICAgICAgICAgIGZpbGVOYW1lOiBiYXNlRmlsZS5maWxlTmFtZSxcbiAgICAgICAgICAgIHRleHQ6IGJhc2VGaWxlLnRleHQsXG4gICAgICAgICAgICBzb3VyY2VGaWxlOiBiYXNlRmlsZSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLmVtaXR0ZWRMaWJyYXJ5U3VtbWFyaWVzLnB1c2goe2ZpbGVOYW1lOiBnZW5GaWxlLmdlbkZpbGVVcmwsIHRleHQ6IG91dERhdGF9KTtcbiAgICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5kZWNsYXJhdGlvbikge1xuICAgICAgICAgICAgLy8gSWYgd2UgZG9uJ3QgZW1pdCBkZWNsYXJhdGlvbnMsIHN0aWxsIHJlY29yZCBhbiBlbXB0eSAubmdmYWN0b3J5LmQudHMgZmlsZSxcbiAgICAgICAgICAgIC8vIGFzIHdlIG1pZ2h0IG5lZWQgaXQgbGF0ZXIgb24gZm9yIHJlc29sdmluZyBtb2R1bGUgbmFtZXMgZnJvbSBzdW1tYXJpZXMuXG4gICAgICAgICAgICBjb25zdCBuZ0ZhY3RvcnlEdHMgPVxuICAgICAgICAgICAgICAgIGdlbkZpbGUuZ2VuRmlsZVVybC5zdWJzdHJpbmcoMCwgZ2VuRmlsZS5nZW5GaWxlVXJsLmxlbmd0aCAtIDE1KSArICcubmdmYWN0b3J5LmQudHMnO1xuICAgICAgICAgICAgdGhpcy5lbWl0dGVkTGlicmFyeVN1bW1hcmllcy5wdXNoKHtmaWxlTmFtZTogbmdGYWN0b3J5RHRzLCB0ZXh0OiAnJ30pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChvdXRGaWxlTmFtZS5lbmRzV2l0aCgnLmQudHMnKSAmJiBiYXNlRmlsZS5maWxlTmFtZS5lbmRzV2l0aCgnLmQudHMnKSkge1xuICAgICAgICAgIGNvbnN0IGR0c1NvdXJjZUZpbGVQYXRoID0gZ2VuRmlsZS5nZW5GaWxlVXJsLnJlcGxhY2UoL1xcLnRzJC8sICcuZC50cycpO1xuICAgICAgICAgIC8vIE5vdGU6IERvbid0IHVzZSBzb3VyY2VGaWxlcyBoZXJlIGFzIHRoZSBjcmVhdGVkIC5kLnRzIGhhcyBhIHBhdGggaW4gdGhlIG91dERpcixcbiAgICAgICAgICAvLyBidXQgd2UgbmVlZCBvbmUgdGhhdCBpcyBuZXh0IHRvIHRoZSAudHMgZmlsZVxuICAgICAgICAgIHRoaXMuZW1pdHRlZExpYnJhcnlTdW1tYXJpZXMucHVzaCh7ZmlsZU5hbWU6IGR0c1NvdXJjZUZpbGVQYXRoLCB0ZXh0OiBvdXREYXRhfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gRmlsdGVyIG91dCBnZW5lcmF0ZWQgZmlsZXMgZm9yIHdoaWNoIHdlIGRpZG4ndCBnZW5lcmF0ZSBjb2RlLlxuICAgIC8vIFRoaXMgY2FuIGhhcHBlbiBhcyB0aGUgc3R1YiBjYWxjdWxhdGlvbiBpcyBub3QgY29tcGxldGVseSBleGFjdC5cbiAgICAvLyBOb3RlOiBzb3VyY2VGaWxlIHJlZmVycyB0byB0aGUgLm5nZmFjdG9yeS50cyAvIC5uZ3N1bW1hcnkudHMgZmlsZVxuICAgIC8vIG5vZGVfZW1pdHRlcl90cmFuc2Zvcm0gYWxyZWFkeSBzZXQgdGhlIGZpbGUgY29udGVudHMgdG8gYmUgZW1wdHksXG4gICAgLy8gIHNvIHRoaXMgY29kZSBvbmx5IG5lZWRzIHRvIHNraXAgdGhlIGZpbGUgaWYgIWFsbG93RW1wdHlDb2RlZ2VuRmlsZXMuXG4gICAgY29uc3QgaXNHZW5lcmF0ZWQgPSBHRU5FUkFURURfRklMRVMudGVzdChvdXRGaWxlTmFtZSk7XG4gICAgaWYgKGlzR2VuZXJhdGVkICYmICF0aGlzLm9wdGlvbnMuYWxsb3dFbXB0eUNvZGVnZW5GaWxlcyAmJlxuICAgICAgICAoIWdlbkZpbGUgfHwgIWdlbkZpbGUuc3RtdHMgfHwgZ2VuRmlsZS5zdG10cy5sZW5ndGggPT09IDApKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChiYXNlRmlsZSkge1xuICAgICAgc291cmNlRmlsZXMgPSBzb3VyY2VGaWxlcyA/IFsuLi5zb3VyY2VGaWxlcywgYmFzZUZpbGVdIDogW2Jhc2VGaWxlXTtcbiAgICB9XG4gICAgLy8gVE9ETzogcmVtb3ZlIGFueSB3aGVuIFRTIDIuNCBzdXBwb3J0IGlzIHJlbW92ZWQuXG4gICAgdGhpcy5ob3N0LndyaXRlRmlsZShvdXRGaWxlTmFtZSwgb3V0RGF0YSwgd3JpdGVCeXRlT3JkZXJNYXJrLCBvbkVycm9yLCBzb3VyY2VGaWxlcyBhcyBhbnkpO1xuICB9XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgYSBnaXZlbiB2ZXJzaW9uIOKIiCBbbWluVmVyc2lvbiwgbWF4VmVyc2lvbltcbiAqIEFuIGVycm9yIHdpbGwgYmUgdGhyb3duIGlmIHRoZSBmb2xsb3dpbmcgc3RhdGVtZW50cyBhcmUgc2ltdWx0YW5lb3VzbHkgdHJ1ZTpcbiAqIC0gdGhlIGdpdmVuIHZlcnNpb24g4oiJIFttaW5WZXJzaW9uLCBtYXhWZXJzaW9uWyxcbiAqIC0gdGhlIHJlc3VsdCBvZiB0aGUgdmVyc2lvbiBjaGVjayBpcyBub3QgbWVhbnQgdG8gYmUgYnlwYXNzZWQgKHRoZSBwYXJhbWV0ZXIgZGlzYWJsZVZlcnNpb25DaGVja1xuICogaXMgZmFsc2UpXG4gKlxuICogQHBhcmFtIHZlcnNpb24gVGhlIHZlcnNpb24gb24gd2hpY2ggdGhlIGNoZWNrIHdpbGwgYmUgcGVyZm9ybWVkXG4gKiBAcGFyYW0gbWluVmVyc2lvbiBUaGUgbG93ZXIgYm91bmQgdmVyc2lvbi4gQSB2YWxpZCB2ZXJzaW9uIG5lZWRzIHRvIGJlIGdyZWF0ZXIgdGhhbiBtaW5WZXJzaW9uXG4gKiBAcGFyYW0gbWF4VmVyc2lvbiBUaGUgdXBwZXIgYm91bmQgdmVyc2lvbi4gQSB2YWxpZCB2ZXJzaW9uIG5lZWRzIHRvIGJlIHN0cmljdGx5IGxlc3MgdGhhblxuICogbWF4VmVyc2lvblxuICogQHBhcmFtIGRpc2FibGVWZXJzaW9uQ2hlY2sgSW5kaWNhdGVzIHdoZXRoZXIgdmVyc2lvbiBjaGVjayBzaG91bGQgYmUgYnlwYXNzZWRcbiAqXG4gKiBAdGhyb3dzIFdpbGwgdGhyb3cgYW4gZXJyb3IgaWYgdGhlIGZvbGxvd2luZyBzdGF0ZW1lbnRzIGFyZSBzaW11bHRhbmVvdXNseSB0cnVlOlxuICogLSB0aGUgZ2l2ZW4gdmVyc2lvbiDiiIkgW21pblZlcnNpb24sIG1heFZlcnNpb25bLFxuICogLSB0aGUgcmVzdWx0IG9mIHRoZSB2ZXJzaW9uIGNoZWNrIGlzIG5vdCBtZWFudCB0byBiZSBieXBhc3NlZCAodGhlIHBhcmFtZXRlciBkaXNhYmxlVmVyc2lvbkNoZWNrXG4gKiBpcyBmYWxzZSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrVmVyc2lvbihcbiAgICB2ZXJzaW9uOiBzdHJpbmcsIG1pblZlcnNpb246IHN0cmluZywgbWF4VmVyc2lvbjogc3RyaW5nLFxuICAgIGRpc2FibGVWZXJzaW9uQ2hlY2s6IGJvb2xlYW4gfCB1bmRlZmluZWQpIHtcbiAgaWYgKChjb21wYXJlVmVyc2lvbnModmVyc2lvbiwgbWluVmVyc2lvbikgPCAwIHx8IGNvbXBhcmVWZXJzaW9ucyh2ZXJzaW9uLCBtYXhWZXJzaW9uKSA+PSAwKSAmJlxuICAgICAgIWRpc2FibGVWZXJzaW9uQ2hlY2spIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBUaGUgQW5ndWxhciBDb21waWxlciByZXF1aXJlcyBUeXBlU2NyaXB0ID49JHttaW5WZXJzaW9ufSBhbmQgPCR7bWF4VmVyc2lvbn0gYnV0ICR7dmVyc2lvbn0gd2FzIGZvdW5kIGluc3RlYWQuYCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVByb2dyYW0oe3Jvb3ROYW1lcywgb3B0aW9ucywgaG9zdCwgb2xkUHJvZ3JhbX06IHtcbiAgcm9vdE5hbWVzOiBSZWFkb25seUFycmF5PHN0cmluZz4sXG4gIG9wdGlvbnM6IENvbXBpbGVyT3B0aW9ucyxcbiAgaG9zdDogQ29tcGlsZXJIb3N0LCBvbGRQcm9ncmFtPzogUHJvZ3JhbVxufSk6IFByb2dyYW0ge1xuICBpZiAob3B0aW9ucy5lbmFibGVJdnkgPT09ICduZ3RzYycpIHtcbiAgICByZXR1cm4gbmV3IE5ndHNjUHJvZ3JhbShyb290TmFtZXMsIG9wdGlvbnMsIGhvc3QsIG9sZFByb2dyYW0pO1xuICB9IGVsc2UgaWYgKG9wdGlvbnMuZW5hYmxlSXZ5ID09PSAndHNjJykge1xuICAgIHJldHVybiBuZXcgVHNjUGFzc1Rocm91Z2hQcm9ncmFtKHJvb3ROYW1lcywgb3B0aW9ucywgaG9zdCwgb2xkUHJvZ3JhbSk7XG4gIH1cbiAgcmV0dXJuIG5ldyBBbmd1bGFyQ29tcGlsZXJQcm9ncmFtKHJvb3ROYW1lcywgb3B0aW9ucywgaG9zdCwgb2xkUHJvZ3JhbSk7XG59XG5cbi8vIENvbXB1dGUgdGhlIEFvdENvbXBpbGVyIG9wdGlvbnNcbmZ1bmN0aW9uIGdldEFvdENvbXBpbGVyT3B0aW9ucyhvcHRpb25zOiBDb21waWxlck9wdGlvbnMpOiBBb3RDb21waWxlck9wdGlvbnMge1xuICBsZXQgbWlzc2luZ1RyYW5zbGF0aW9uID0gY29yZS5NaXNzaW5nVHJhbnNsYXRpb25TdHJhdGVneS5XYXJuaW5nO1xuXG4gIHN3aXRjaCAob3B0aW9ucy5pMThuSW5NaXNzaW5nVHJhbnNsYXRpb25zKSB7XG4gICAgY2FzZSAnaWdub3JlJzpcbiAgICAgIG1pc3NpbmdUcmFuc2xhdGlvbiA9IGNvcmUuTWlzc2luZ1RyYW5zbGF0aW9uU3RyYXRlZ3kuSWdub3JlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZXJyb3InOlxuICAgICAgbWlzc2luZ1RyYW5zbGF0aW9uID0gY29yZS5NaXNzaW5nVHJhbnNsYXRpb25TdHJhdGVneS5FcnJvcjtcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgbGV0IHRyYW5zbGF0aW9uczogc3RyaW5nID0gJyc7XG5cbiAgaWYgKG9wdGlvbnMuaTE4bkluRmlsZSkge1xuICAgIGlmICghb3B0aW9ucy5pMThuSW5Mb2NhbGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIHRyYW5zbGF0aW9uIGZpbGUgKCR7b3B0aW9ucy5pMThuSW5GaWxlfSkgbG9jYWxlIG11c3QgYmUgcHJvdmlkZWQuYCk7XG4gICAgfVxuICAgIHRyYW5zbGF0aW9ucyA9IGZzLnJlYWRGaWxlU3luYyhvcHRpb25zLmkxOG5JbkZpbGUsICd1dGY4Jyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTm8gdHJhbnNsYXRpb25zIGFyZSBwcm92aWRlZCwgaWdub3JlIGFueSBlcnJvcnNcbiAgICAvLyBXZSBzdGlsbCBnbyB0aHJvdWdoIGkxOG4gdG8gcmVtb3ZlIGkxOG4gYXR0cmlidXRlc1xuICAgIG1pc3NpbmdUcmFuc2xhdGlvbiA9IGNvcmUuTWlzc2luZ1RyYW5zbGF0aW9uU3RyYXRlZ3kuSWdub3JlO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBsb2NhbGU6IG9wdGlvbnMuaTE4bkluTG9jYWxlLFxuICAgIGkxOG5Gb3JtYXQ6IG9wdGlvbnMuaTE4bkluRm9ybWF0IHx8IG9wdGlvbnMuaTE4bk91dEZvcm1hdCxcbiAgICBpMThuVXNlRXh0ZXJuYWxJZHM6IG9wdGlvbnMuaTE4blVzZUV4dGVybmFsSWRzLCB0cmFuc2xhdGlvbnMsIG1pc3NpbmdUcmFuc2xhdGlvbixcbiAgICBlbmFibGVTdW1tYXJpZXNGb3JKaXQ6IG9wdGlvbnMuZW5hYmxlU3VtbWFyaWVzRm9ySml0LFxuICAgIHByZXNlcnZlV2hpdGVzcGFjZXM6IG9wdGlvbnMucHJlc2VydmVXaGl0ZXNwYWNlcyxcbiAgICBmdWxsVGVtcGxhdGVUeXBlQ2hlY2s6IG9wdGlvbnMuZnVsbFRlbXBsYXRlVHlwZUNoZWNrLFxuICAgIGFsbG93RW1wdHlDb2RlZ2VuRmlsZXM6IG9wdGlvbnMuYWxsb3dFbXB0eUNvZGVnZW5GaWxlcyxcbiAgICBlbmFibGVJdnk6IG9wdGlvbnMuZW5hYmxlSXZ5LFxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXROZ09wdGlvbkRpYWdub3N0aWNzKG9wdGlvbnM6IENvbXBpbGVyT3B0aW9ucyk6IFJlYWRvbmx5QXJyYXk8RGlhZ25vc3RpYz4ge1xuICBpZiAob3B0aW9ucy5hbm5vdGF0aW9uc0FzKSB7XG4gICAgc3dpdGNoIChvcHRpb25zLmFubm90YXRpb25zQXMpIHtcbiAgICAgIGNhc2UgJ2RlY29yYXRvcnMnOlxuICAgICAgY2FzZSAnc3RhdGljIGZpZWxkcyc6XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgbWVzc2FnZVRleHQ6XG4gICAgICAgICAgICAgICdBbmd1bGFyIGNvbXBpbGVyIG9wdGlvbnMgXCJhbm5vdGF0aW9uc0FzXCIgb25seSBzdXBwb3J0cyBcInN0YXRpYyBmaWVsZHNcIiBhbmQgXCJkZWNvcmF0b3JzXCInLFxuICAgICAgICAgIGNhdGVnb3J5OiB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuRXJyb3IsXG4gICAgICAgICAgc291cmNlOiBTT1VSQ0UsXG4gICAgICAgICAgY29kZTogREVGQVVMVF9FUlJPUl9DT0RFXG4gICAgICAgIH1dO1xuICAgIH1cbiAgfVxuICByZXR1cm4gW107XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVNlcGFyYXRvcnMocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHBhdGgucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGNhbiBhZGp1c3QgYSBwYXRoIGZyb20gc291cmNlIHBhdGggdG8gb3V0IHBhdGgsXG4gKiBiYXNlZCBvbiBhbiBleGlzdGluZyBtYXBwaW5nIGZyb20gc291cmNlIHRvIG91dCBwYXRoLlxuICpcbiAqIFRPRE8odGJvc2NoKTogdGFsayB0byB0aGUgVHlwZVNjcmlwdCB0ZWFtIHRvIGV4cG9zZSB0aGVpciBsb2dpYyBmb3IgY2FsY3VsYXRpbmcgdGhlIGByb290RGlyYFxuICogaWYgbm9uZSB3YXMgc3BlY2lmaWVkLlxuICpcbiAqIE5vdGU6IFRoaXMgZnVuY3Rpb24gd29ya3Mgb24gbm9ybWFsaXplZCBwYXRocyBmcm9tIHR5cGVzY3JpcHQgYnV0IHNob3VsZCBhbHdheXMgcmV0dXJuXG4gKiBQT1NJWCBub3JtYWxpemVkIHBhdGhzIGZvciBvdXRwdXQgcGF0aHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTcmNUb091dFBhdGhNYXBwZXIoXG4gICAgb3V0RGlyOiBzdHJpbmcgfCB1bmRlZmluZWQsIHNhbXBsZVNyY0ZpbGVOYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgc2FtcGxlT3V0RmlsZU5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCwgaG9zdDoge1xuICAgICAgZGlybmFtZTogdHlwZW9mIHBhdGguZGlybmFtZSxcbiAgICAgIHJlc29sdmU6IHR5cGVvZiBwYXRoLnJlc29sdmUsXG4gICAgICByZWxhdGl2ZTogdHlwZW9mIHBhdGgucmVsYXRpdmVcbiAgICB9ID0gcGF0aCk6IChzcmNGaWxlTmFtZTogc3RyaW5nKSA9PiBzdHJpbmcge1xuICBpZiAob3V0RGlyKSB7XG4gICAgbGV0IHBhdGg6IHt9ID0ge307ICAvLyBFbnN1cmUgd2UgZXJyb3IgaWYgd2UgdXNlIGBwYXRoYCBpbnN0ZWFkIG9mIGBob3N0YC5cbiAgICBpZiAoc2FtcGxlU3JjRmlsZU5hbWUgPT0gbnVsbCB8fCBzYW1wbGVPdXRGaWxlTmFtZSA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbid0IGNhbGN1bGF0ZSB0aGUgcm9vdERpciB3aXRob3V0IGEgc2FtcGxlIHNyY0ZpbGVOYW1lIC8gb3V0RmlsZU5hbWUuIGApO1xuICAgIH1cbiAgICBjb25zdCBzcmNGaWxlRGlyID0gbm9ybWFsaXplU2VwYXJhdG9ycyhob3N0LmRpcm5hbWUoc2FtcGxlU3JjRmlsZU5hbWUpKTtcbiAgICBjb25zdCBvdXRGaWxlRGlyID0gbm9ybWFsaXplU2VwYXJhdG9ycyhob3N0LmRpcm5hbWUoc2FtcGxlT3V0RmlsZU5hbWUpKTtcbiAgICBpZiAoc3JjRmlsZURpciA9PT0gb3V0RmlsZURpcikge1xuICAgICAgcmV0dXJuIChzcmNGaWxlTmFtZSkgPT4gc3JjRmlsZU5hbWU7XG4gICAgfVxuICAgIC8vIGNhbGN1bGF0ZSB0aGUgY29tbW9uIHN1ZmZpeCwgc3RvcHBpbmdcbiAgICAvLyBhdCBgb3V0RGlyYC5cbiAgICBjb25zdCBzcmNEaXJQYXJ0cyA9IHNyY0ZpbGVEaXIuc3BsaXQoJy8nKTtcbiAgICBjb25zdCBvdXREaXJQYXJ0cyA9IG5vcm1hbGl6ZVNlcGFyYXRvcnMoaG9zdC5yZWxhdGl2ZShvdXREaXIsIG91dEZpbGVEaXIpKS5zcGxpdCgnLycpO1xuICAgIGxldCBpID0gMDtcbiAgICB3aGlsZSAoaSA8IE1hdGgubWluKHNyY0RpclBhcnRzLmxlbmd0aCwgb3V0RGlyUGFydHMubGVuZ3RoKSAmJlxuICAgICAgICAgICBzcmNEaXJQYXJ0c1tzcmNEaXJQYXJ0cy5sZW5ndGggLSAxIC0gaV0gPT09IG91dERpclBhcnRzW291dERpclBhcnRzLmxlbmd0aCAtIDEgLSBpXSlcbiAgICAgIGkrKztcbiAgICBjb25zdCByb290RGlyID0gc3JjRGlyUGFydHMuc2xpY2UoMCwgc3JjRGlyUGFydHMubGVuZ3RoIC0gaSkuam9pbignLycpO1xuICAgIHJldHVybiAoc3JjRmlsZU5hbWUpID0+IHtcbiAgICAgIC8vIE5vdGU6IEJlZm9yZSB3ZSByZXR1cm4gdGhlIG1hcHBlZCBvdXRwdXQgcGF0aCwgd2UgbmVlZCB0byBub3JtYWxpemUgdGhlIHBhdGggZGVsaW1pdGVyc1xuICAgICAgLy8gYmVjYXVzZSB0aGUgb3V0cHV0IHBhdGggaXMgdXN1YWxseSBwYXNzZWQgdG8gVHlwZVNjcmlwdCB3aGljaCBzb21ldGltZXMgb25seSBleHBlY3RzXG4gICAgICAvLyBwb3NpeCBub3JtYWxpemVkIHBhdGhzIChlLmcuIGlmIGEgY3VzdG9tIGNvbXBpbGVyIGhvc3QgaXMgdXNlZClcbiAgICAgIHJldHVybiBub3JtYWxpemVTZXBhcmF0b3JzKGhvc3QucmVzb2x2ZShvdXREaXIsIGhvc3QucmVsYXRpdmUocm9vdERpciwgc3JjRmlsZU5hbWUpKSk7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICAvLyBOb3RlOiBCZWZvcmUgd2UgcmV0dXJuIHRoZSBvdXRwdXQgcGF0aCwgd2UgbmVlZCB0byBub3JtYWxpemUgdGhlIHBhdGggZGVsaW1pdGVycyBiZWNhdXNlXG4gICAgLy8gdGhlIG91dHB1dCBwYXRoIGlzIHVzdWFsbHkgcGFzc2VkIHRvIFR5cGVTY3JpcHQgd2hpY2ggb25seSBwYXNzZXMgYXJvdW5kIHBvc2l4XG4gICAgLy8gbm9ybWFsaXplZCBwYXRocyAoZS5nLiBpZiBhIGN1c3RvbSBjb21waWxlciBob3N0IGlzIHVzZWQpXG4gICAgcmV0dXJuIChzcmNGaWxlTmFtZSkgPT4gbm9ybWFsaXplU2VwYXJhdG9ycyhzcmNGaWxlTmFtZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGkxOG5FeHRyYWN0KFxuICAgIGZvcm1hdE5hbWU6IHN0cmluZyB8IG51bGwsIG91dEZpbGU6IHN0cmluZyB8IG51bGwsIGhvc3Q6IHRzLkNvbXBpbGVySG9zdCxcbiAgICBvcHRpb25zOiBDb21waWxlck9wdGlvbnMsIGJ1bmRsZTogTWVzc2FnZUJ1bmRsZSk6IHN0cmluZ1tdIHtcbiAgZm9ybWF0TmFtZSA9IGZvcm1hdE5hbWUgfHwgJ3hsZic7XG4gIC8vIENoZWNrcyB0aGUgZm9ybWF0IGFuZCByZXR1cm5zIHRoZSBleHRlbnNpb25cbiAgY29uc3QgZXh0ID0gaTE4bkdldEV4dGVuc2lvbihmb3JtYXROYW1lKTtcbiAgY29uc3QgY29udGVudCA9IGkxOG5TZXJpYWxpemUoYnVuZGxlLCBmb3JtYXROYW1lLCBvcHRpb25zKTtcbiAgY29uc3QgZHN0RmlsZSA9IG91dEZpbGUgfHwgYG1lc3NhZ2VzLiR7ZXh0fWA7XG4gIGNvbnN0IGRzdFBhdGggPSBwYXRoLnJlc29sdmUob3B0aW9ucy5vdXREaXIgfHwgb3B0aW9ucy5iYXNlUGF0aCAhLCBkc3RGaWxlKTtcbiAgaG9zdC53cml0ZUZpbGUoZHN0UGF0aCwgY29udGVudCwgZmFsc2UsIHVuZGVmaW5lZCwgW10pO1xuICByZXR1cm4gW2RzdFBhdGhdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaTE4blNlcmlhbGl6ZShcbiAgICBidW5kbGU6IE1lc3NhZ2VCdW5kbGUsIGZvcm1hdE5hbWU6IHN0cmluZywgb3B0aW9uczogQ29tcGlsZXJPcHRpb25zKTogc3RyaW5nIHtcbiAgY29uc3QgZm9ybWF0ID0gZm9ybWF0TmFtZS50b0xvd2VyQ2FzZSgpO1xuICBsZXQgc2VyaWFsaXplcjogU2VyaWFsaXplcjtcblxuICBzd2l0Y2ggKGZvcm1hdCkge1xuICAgIGNhc2UgJ3htYic6XG4gICAgICBzZXJpYWxpemVyID0gbmV3IFhtYigpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAneGxpZmYyJzpcbiAgICBjYXNlICd4bGYyJzpcbiAgICAgIHNlcmlhbGl6ZXIgPSBuZXcgWGxpZmYyKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd4bGYnOlxuICAgIGNhc2UgJ3hsaWZmJzpcbiAgICBkZWZhdWx0OlxuICAgICAgc2VyaWFsaXplciA9IG5ldyBYbGlmZigpO1xuICB9XG5cbiAgcmV0dXJuIGJ1bmRsZS53cml0ZShzZXJpYWxpemVyLCBnZXRQYXRoTm9ybWFsaXplcihvcHRpb25zLmJhc2VQYXRoKSk7XG59XG5cbmZ1bmN0aW9uIGdldFBhdGhOb3JtYWxpemVyKGJhc2VQYXRoPzogc3RyaW5nKSB7XG4gIC8vIG5vcm1hbGl6ZSBzb3VyY2UgcGF0aHMgYnkgcmVtb3ZpbmcgdGhlIGJhc2UgcGF0aCBhbmQgYWx3YXlzIHVzaW5nIFwiL1wiIGFzIGEgc2VwYXJhdG9yXG4gIHJldHVybiAoc291cmNlUGF0aDogc3RyaW5nKSA9PiB7XG4gICAgc291cmNlUGF0aCA9IGJhc2VQYXRoID8gcGF0aC5yZWxhdGl2ZShiYXNlUGF0aCwgc291cmNlUGF0aCkgOiBzb3VyY2VQYXRoO1xuICAgIHJldHVybiBzb3VyY2VQYXRoLnNwbGl0KHBhdGguc2VwKS5qb2luKCcvJyk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpMThuR2V0RXh0ZW5zaW9uKGZvcm1hdE5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGZvcm1hdCA9IGZvcm1hdE5hbWUudG9Mb3dlckNhc2UoKTtcblxuICBzd2l0Y2ggKGZvcm1hdCkge1xuICAgIGNhc2UgJ3htYic6XG4gICAgICByZXR1cm4gJ3htYic7XG4gICAgY2FzZSAneGxmJzpcbiAgICBjYXNlICd4bGlmJzpcbiAgICBjYXNlICd4bGlmZic6XG4gICAgY2FzZSAneGxmMic6XG4gICAgY2FzZSAneGxpZmYyJzpcbiAgICAgIHJldHVybiAneGxmJztcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgZm9ybWF0IFwiJHtmb3JtYXROYW1lfVwiYCk7XG59XG5cbmZ1bmN0aW9uIG1lcmdlRW1pdFJlc3VsdHMoZW1pdFJlc3VsdHM6IHRzLkVtaXRSZXN1bHRbXSk6IHRzLkVtaXRSZXN1bHQge1xuICBjb25zdCBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdID0gW107XG4gIGxldCBlbWl0U2tpcHBlZCA9IGZhbHNlO1xuICBjb25zdCBlbWl0dGVkRmlsZXM6IHN0cmluZ1tdID0gW107XG4gIGZvciAoY29uc3QgZXIgb2YgZW1pdFJlc3VsdHMpIHtcbiAgICBkaWFnbm9zdGljcy5wdXNoKC4uLmVyLmRpYWdub3N0aWNzKTtcbiAgICBlbWl0U2tpcHBlZCA9IGVtaXRTa2lwcGVkIHx8IGVyLmVtaXRTa2lwcGVkO1xuICAgIGVtaXR0ZWRGaWxlcy5wdXNoKC4uLihlci5lbWl0dGVkRmlsZXMgfHwgW10pKTtcbiAgfVxuICByZXR1cm4ge2RpYWdub3N0aWNzLCBlbWl0U2tpcHBlZCwgZW1pdHRlZEZpbGVzfTtcbn1cblxuZnVuY3Rpb24gZGlhZ25vc3RpY1NvdXJjZU9mU3BhbihzcGFuOiBQYXJzZVNvdXJjZVNwYW4pOiB0cy5Tb3VyY2VGaWxlIHtcbiAgLy8gRm9yIGRpYWdub3N0aWNzLCBUeXBlU2NyaXB0IG9ubHkgdXNlcyB0aGUgZmlsZU5hbWUgYW5kIHRleHQgcHJvcGVydGllcy5cbiAgLy8gVGhlIHJlZHVuZGFudCAnKCknIGFyZSBoZXJlIGlzIHRvIGF2b2lkIGhhdmluZyBjbGFuZy1mb3JtYXQgYnJlYWtpbmcgdGhlIGxpbmUgaW5jb3JyZWN0bHkuXG4gIHJldHVybiAoeyBmaWxlTmFtZTogc3Bhbi5zdGFydC5maWxlLnVybCwgdGV4dDogc3Bhbi5zdGFydC5maWxlLmNvbnRlbnQgfSBhcyBhbnkpO1xufVxuXG5mdW5jdGlvbiBkaWFnbm9zdGljU291cmNlT2ZGaWxlTmFtZShmaWxlTmFtZTogc3RyaW5nLCBwcm9ncmFtOiB0cy5Qcm9ncmFtKTogdHMuU291cmNlRmlsZSB7XG4gIGNvbnN0IHNvdXJjZUZpbGUgPSBwcm9ncmFtLmdldFNvdXJjZUZpbGUoZmlsZU5hbWUpO1xuICBpZiAoc291cmNlRmlsZSkgcmV0dXJuIHNvdXJjZUZpbGU7XG5cbiAgLy8gSWYgd2UgYXJlIHJlcG9ydGluZyBkaWFnbm9zdGljcyBmb3IgYSBzb3VyY2UgZmlsZSB0aGF0IGlzIG5vdCBpbiB0aGUgcHJvamVjdCB0aGVuIHdlIG5lZWRcbiAgLy8gdG8gZmFrZSBhIHNvdXJjZSBmaWxlIHNvIHRoZSBkaWFnbm9zdGljIGZvcm1hdHRpbmcgcm91dGluZXMgY2FuIGVtaXQgdGhlIGZpbGUgbmFtZS5cbiAgLy8gVGhlIHJlZHVuZGFudCAnKCknIGFyZSBoZXJlIGlzIHRvIGF2b2lkIGhhdmluZyBjbGFuZy1mb3JtYXQgYnJlYWtpbmcgdGhlIGxpbmUgaW5jb3JyZWN0bHkuXG4gIHJldHVybiAoeyBmaWxlTmFtZSwgdGV4dDogJycgfSBhcyBhbnkpO1xufVxuXG5cbmZ1bmN0aW9uIGRpYWdub3N0aWNDaGFpbkZyb21Gb3JtYXR0ZWREaWFnbm9zdGljQ2hhaW4oY2hhaW46IEZvcm1hdHRlZE1lc3NhZ2VDaGFpbik6XG4gICAgRGlhZ25vc3RpY01lc3NhZ2VDaGFpbiB7XG4gIHJldHVybiB7XG4gICAgbWVzc2FnZVRleHQ6IGNoYWluLm1lc3NhZ2UsXG4gICAgbmV4dDogY2hhaW4ubmV4dCAmJiBkaWFnbm9zdGljQ2hhaW5Gcm9tRm9ybWF0dGVkRGlhZ25vc3RpY0NoYWluKGNoYWluLm5leHQpLFxuICAgIHBvc2l0aW9uOiBjaGFpbi5wb3NpdGlvblxuICB9O1xufVxuXG5mdW5jdGlvbiBzeW50YXhFcnJvclRvRGlhZ25vc3RpY3MoZXJyb3I6IEVycm9yKTogRGlhZ25vc3RpY1tdIHtcbiAgY29uc3QgcGFyc2VyRXJyb3JzID0gZ2V0UGFyc2VFcnJvcnMoZXJyb3IpO1xuICBpZiAocGFyc2VyRXJyb3JzICYmIHBhcnNlckVycm9ycy5sZW5ndGgpIHtcbiAgICByZXR1cm4gcGFyc2VyRXJyb3JzLm1hcDxEaWFnbm9zdGljPihlID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlVGV4dDogZS5jb250ZXh0dWFsTWVzc2FnZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZGlhZ25vc3RpY1NvdXJjZU9mU3BhbihlLnNwYW4pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IGUuc3Bhbi5zdGFydC5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZW5ndGg6IGUuc3Bhbi5lbmQub2Zmc2V0IC0gZS5zcGFuLnN0YXJ0Lm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IFNPVVJDRSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IERFRkFVTFRfRVJST1JfQ09ERVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgfSBlbHNlIGlmIChpc0Zvcm1hdHRlZEVycm9yKGVycm9yKSkge1xuICAgIHJldHVybiBbe1xuICAgICAgbWVzc2FnZVRleHQ6IGVycm9yLm1lc3NhZ2UsXG4gICAgICBjaGFpbjogZXJyb3IuY2hhaW4gJiYgZGlhZ25vc3RpY0NoYWluRnJvbUZvcm1hdHRlZERpYWdub3N0aWNDaGFpbihlcnJvci5jaGFpbiksXG4gICAgICBjYXRlZ29yeTogdHMuRGlhZ25vc3RpY0NhdGVnb3J5LkVycm9yLFxuICAgICAgc291cmNlOiBTT1VSQ0UsXG4gICAgICBjb2RlOiBERUZBVUxUX0VSUk9SX0NPREUsXG4gICAgICBwb3NpdGlvbjogZXJyb3IucG9zaXRpb25cbiAgICB9XTtcbiAgfVxuICAvLyBQcm9kdWNlIGEgRGlhZ25vc3RpYyBhbnl3YXkgc2luY2Ugd2Uga25vdyBmb3Igc3VyZSBgZXJyb3JgIGlzIGEgU3ludGF4RXJyb3JcbiAgcmV0dXJuIFt7XG4gICAgbWVzc2FnZVRleHQ6IGVycm9yLm1lc3NhZ2UsXG4gICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcixcbiAgICBjb2RlOiBERUZBVUxUX0VSUk9SX0NPREUsXG4gICAgc291cmNlOiBTT1VSQ0UsXG4gIH1dO1xufVxuIl19