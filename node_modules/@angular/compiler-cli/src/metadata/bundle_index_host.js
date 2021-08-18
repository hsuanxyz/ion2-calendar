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
        define("@angular/compiler-cli/src/metadata/bundle_index_host", ["require", "exports", "path", "typescript", "@angular/compiler-cli/src/metadata/bundler", "@angular/compiler-cli/src/metadata/index_writer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const path = require("path");
    const ts = require("typescript");
    const bundler_1 = require("@angular/compiler-cli/src/metadata/bundler");
    const index_writer_1 = require("@angular/compiler-cli/src/metadata/index_writer");
    const DTS = /\.d\.ts$/;
    const JS_EXT = /(\.js|)$/;
    function createSyntheticIndexHost(delegate, syntheticIndex) {
        const normalSyntheticIndexName = path.normalize(syntheticIndex.name);
        const newHost = Object.create(delegate);
        newHost.fileExists = (fileName) => {
            return path.normalize(fileName) == normalSyntheticIndexName || delegate.fileExists(fileName);
        };
        newHost.readFile = (fileName) => {
            return path.normalize(fileName) == normalSyntheticIndexName ? syntheticIndex.content :
                delegate.readFile(fileName);
        };
        newHost.getSourceFile =
            (fileName, languageVersion, onError) => {
                if (path.normalize(fileName) == normalSyntheticIndexName) {
                    const sf = ts.createSourceFile(fileName, syntheticIndex.content, languageVersion, true);
                    if (delegate.fileNameToModuleName) {
                        sf.moduleName = delegate.fileNameToModuleName(fileName);
                    }
                    return sf;
                }
                return delegate.getSourceFile(fileName, languageVersion, onError);
            };
        newHost.writeFile =
            (fileName, data, writeByteOrderMark, onError, sourceFiles) => {
                delegate.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
                if (fileName.match(DTS) && sourceFiles && sourceFiles.length == 1 &&
                    path.normalize(sourceFiles[0].fileName) === normalSyntheticIndexName) {
                    // If we are writing the synthetic index, write the metadata along side.
                    const metadataName = fileName.replace(DTS, '.metadata.json');
                    const indexMetadata = syntheticIndex.getMetadata();
                    delegate.writeFile(metadataName, indexMetadata, writeByteOrderMark, onError, []);
                }
            };
        return newHost;
    }
    function createBundleIndexHost(ngOptions, rootFiles, host, getMetadataCache) {
        const files = rootFiles.filter(f => !DTS.test(f));
        let indexFile;
        if (files.length === 1) {
            indexFile = files[0];
        }
        else {
            for (const f of files) {
                // Assume the shortest file path called index.ts is the entry point. Note that we
                // need to use the posix path delimiter here because TypeScript internally only
                // passes posix paths.
                if (f.endsWith('/index.ts')) {
                    if (!indexFile || indexFile.length > f.length) {
                        indexFile = f;
                    }
                }
            }
        }
        if (!indexFile) {
            return {
                host,
                errors: [{
                        file: null,
                        start: null,
                        length: null,
                        messageText: 'Angular compiler option "flatModuleIndex" requires one and only one .ts file in the "files" field.',
                        category: ts.DiagnosticCategory.Error,
                        code: 0
                    }]
            };
        }
        const indexModule = indexFile.replace(/\.ts$/, '');
        // The operation of producing a metadata bundle happens twice - once during setup and once during
        // the emit phase. The first time, the bundle is produced without a metadata cache, to compute the
        // contents of the flat module index. The bundle produced during emit does use the metadata cache
        // with associated transforms, so the metadata will have lowered expressions, resource inlining,
        // etc.
        const getMetadataBundle = (cache) => {
            const bundler = new bundler_1.MetadataBundler(indexModule, ngOptions.flatModuleId, new bundler_1.CompilerHostAdapter(host, cache, ngOptions), ngOptions.flatModulePrivateSymbolPrefix);
            return bundler.getMetadataBundle();
        };
        // First, produce the bundle with no MetadataCache.
        const metadataBundle = getMetadataBundle(/* MetadataCache */ null);
        const name = path.join(path.dirname(indexModule), ngOptions.flatModuleOutFile.replace(JS_EXT, '.ts'));
        const libraryIndex = `./${path.basename(indexModule)}`;
        const content = index_writer_1.privateEntriesToIndex(libraryIndex, metadataBundle.privates);
        host = createSyntheticIndexHost(host, {
            name,
            content,
            getMetadata: () => {
                // The second metadata bundle production happens on-demand, and uses the getMetadataCache
                // closure to retrieve an up-to-date MetadataCache which is configured with whatever metadata
                // transforms were used to produce the JS output.
                const metadataBundle = getMetadataBundle(getMetadataCache());
                return JSON.stringify(metadataBundle.metadata);
            }
        });
        return { host, indexName: name };
    }
    exports.createBundleIndexHost = createBundleIndexHost;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlX2luZGV4X2hvc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL21ldGFkYXRhL2J1bmRsZV9pbmRleF9ob3N0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBR0gsNkJBQTZCO0lBQzdCLGlDQUFpQztJQUtqQyx3RUFBK0Q7SUFDL0Qsa0ZBQXFEO0lBRXJELE1BQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQztJQUN2QixNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUM7SUFFMUIsU0FBUyx3QkFBd0IsQ0FDN0IsUUFBVyxFQUFFLGNBQTBFO1FBQ3pGLE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFckUsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN4QyxPQUFPLENBQUMsVUFBVSxHQUFHLENBQUMsUUFBZ0IsRUFBVyxFQUFFO1lBQ2pELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSx3QkFBd0IsSUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9GLENBQUMsQ0FBQztRQUVGLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxRQUFnQixFQUFFLEVBQUU7WUFDdEMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3hCLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUYsQ0FBQyxDQUFDO1FBRUYsT0FBTyxDQUFDLGFBQWE7WUFDakIsQ0FBQyxRQUFnQixFQUFFLGVBQWdDLEVBQUUsT0FBbUMsRUFBRSxFQUFFO2dC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QUMsQ0FBQztZQUNqRCxDQUFDO1NBQ0YsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFDLENBQUM7SUFDakMsQ0FBQztJQXBFRCxzREFvRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtDb21waWxlck9wdGlvbnN9IGZyb20gJy4uL3RyYW5zZm9ybWVycy9hcGknO1xuaW1wb3J0IHtNZXRhZGF0YUNhY2hlfSBmcm9tICcuLi90cmFuc2Zvcm1lcnMvbWV0YWRhdGFfY2FjaGUnO1xuXG5pbXBvcnQge0NvbXBpbGVySG9zdEFkYXB0ZXIsIE1ldGFkYXRhQnVuZGxlcn0gZnJvbSAnLi9idW5kbGVyJztcbmltcG9ydCB7cHJpdmF0ZUVudHJpZXNUb0luZGV4fSBmcm9tICcuL2luZGV4X3dyaXRlcic7XG5cbmNvbnN0IERUUyA9IC9cXC5kXFwudHMkLztcbmNvbnN0IEpTX0VYVCA9IC8oXFwuanN8KSQvO1xuXG5mdW5jdGlvbiBjcmVhdGVTeW50aGV0aWNJbmRleEhvc3Q8SCBleHRlbmRzIHRzLkNvbXBpbGVySG9zdD4oXG4gICAgZGVsZWdhdGU6IEgsIHN5bnRoZXRpY0luZGV4OiB7bmFtZTogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcsIGdldE1ldGFkYXRhOiAoKSA9PiBzdHJpbmd9KTogSCB7XG4gIGNvbnN0IG5vcm1hbFN5bnRoZXRpY0luZGV4TmFtZSA9IHBhdGgubm9ybWFsaXplKHN5bnRoZXRpY0luZGV4Lm5hbWUpO1xuXG4gIGNvbnN0IG5ld0hvc3QgPSBPYmplY3QuY3JlYXRlKGRlbGVnYXRlKTtcbiAgbmV3SG9zdC5maWxlRXhpc3RzID0gKGZpbGVOYW1lOiBzdHJpbmcpOiBib29sZWFuID0+IHtcbiAgICByZXR1cm4gcGF0aC5ub3JtYWxpemUoZmlsZU5hbWUpID09IG5vcm1hbFN5bnRoZXRpY0luZGV4TmFtZSB8fCBkZWxlZ2F0ZS5maWxlRXhpc3RzKGZpbGVOYW1lKTtcbiAgfTtcblxuICBuZXdIb3N0LnJlYWRGaWxlID0gKGZpbGVOYW1lOiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4gcGF0aC5ub3JtYWxpemUoZmlsZU5hbWUpID09IG5vcm1hbFN5bnRoZXRpY0luZGV4TmFtZSA/IHN5bnRoZXRpY0luZGV4LmNvbnRlbnQgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZWdhdGUucmVhZEZpbGUoZmlsZU5hbWUpO1xuICB9O1xuXG4gIG5ld0hvc3QuZ2V0U291cmNlRmlsZSA9XG4gICAgICAoZmlsZU5hbWU6IHN0cmluZywgbGFuZ3VhZ2VWZXJzaW9uOiB0cy5TY3JpcHRUYXJnZXQsIG9uRXJyb3I/OiAobWVzc2FnZTogc3RyaW5nKSA9PiB2b2lkKSA9PiB7XG4gICAgICAgIGlmIChwYXRoLm5vcm1hbGl6ZShmaWxlTmFtZSkgPT0gbm9ybWFsU3ludGhldGljSW5kZXhOYW1lKSB7XG4gICAgICAgICAgY29uc3Qgc2YgPSB0cy5jcmVhdGVTb3VyY2VGaWxlKGZpbGVOYW1lLCBzeW50aGV0aWNJbmRleC5jb250ZW50LCBsYW5ndWFnZVZlcnNpb24sIHRydWUpO1xuICAgICAgICAgIGlmICgoZGVsZWdhdGUgYXMgYW55KS5maWxlTmFtZVRvTW9kdWxlTmFtZSkge1xuICAgICAgICAgICAgc2YubW9kdWxlTmFtZSA9IChkZWxlZ2F0ZSBhcyBhbnkpLmZpbGVOYW1lVG9Nb2R1bGVOYW1lKGZpbGVOYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHNmO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWxlZ2F0ZS5nZXRTb3VyY2VGaWxlKGZpbGVOYW1lLCBsYW5ndWFnZVZlcnNpb24sIG9uRXJyb3IpO1xuICAgICAgfTtcblxuICBuZXdIb3N0LndyaXRlRmlsZSA9XG4gICAgICAoZmlsZU5hbWU6IHN0cmluZywgZGF0YTogc3RyaW5nLCB3cml0ZUJ5dGVPcmRlck1hcms6IGJvb2xlYW4sXG4gICAgICAgb25FcnJvcjogKChtZXNzYWdlOiBzdHJpbmcpID0+IHZvaWQpIHwgdW5kZWZpbmVkLFxuICAgICAgIHNvdXJjZUZpbGVzOiBSZWFkb25seTx0cy5Tb3VyY2VGaWxlPltdKSA9PiB7XG4gICAgICAgIGRlbGVnYXRlLndyaXRlRmlsZShmaWxlTmFtZSwgZGF0YSwgd3JpdGVCeXRlT3JkZXJNYXJrLCBvbkVycm9yLCBzb3VyY2VGaWxlcyk7XG4gICAgICAgIGlmIChmaWxlTmFtZS5tYXRjaChEVFMpICYmIHNvdXJjZUZpbGVzICYmIHNvdXJjZUZpbGVzLmxlbmd0aCA9PSAxICYmXG4gICAgICAgICAgICBwYXRoLm5vcm1hbGl6ZShzb3VyY2VGaWxlc1swXS5maWxlTmFtZSkgPT09IG5vcm1hbFN5bnRoZXRpY0luZGV4TmFtZSkge1xuICAgICAgICAgIC8vIElmIHdlIGFyZSB3cml0aW5nIHRoZSBzeW50aGV0aWMgaW5kZXgsIHdyaXRlIHRoZSBtZXRhZGF0YSBhbG9uZyBzaWRlLlxuICAgICAgICAgIGNvbnN0IG1ldGFkYXRhTmFtZSA9IGZpbGVOYW1lLnJlcGxhY2UoRFRTLCAnLm1ldGFkYXRhLmpzb24nKTtcbiAgICAgICAgICBjb25zdCBpbmRleE1ldGFkYXRhID0gc3ludGhldGljSW5kZXguZ2V0TWV0YWRhdGEoKTtcbiAgICAgICAgICBkZWxlZ2F0ZS53cml0ZUZpbGUobWV0YWRhdGFOYW1lLCBpbmRleE1ldGFkYXRhLCB3cml0ZUJ5dGVPcmRlck1hcmssIG9uRXJyb3IsIFtdKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgcmV0dXJuIG5ld0hvc3Q7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVCdW5kbGVJbmRleEhvc3Q8SCBleHRlbmRzIHRzLkNvbXBpbGVySG9zdD4oXG4gICAgbmdPcHRpb25zOiBDb21waWxlck9wdGlvbnMsIHJvb3RGaWxlczogUmVhZG9ubHlBcnJheTxzdHJpbmc+LCBob3N0OiBILFxuICAgIGdldE1ldGFkYXRhQ2FjaGU6ICgpID0+XG4gICAgICAgIE1ldGFkYXRhQ2FjaGUpOiB7aG9zdDogSCwgaW5kZXhOYW1lPzogc3RyaW5nLCBlcnJvcnM/OiB0cy5EaWFnbm9zdGljW119IHtcbiAgY29uc3QgZmlsZXMgPSByb290RmlsZXMuZmlsdGVyKGYgPT4gIURUUy50ZXN0KGYpKTtcbiAgbGV0IGluZGV4RmlsZTogc3RyaW5nfHVuZGVmaW5lZDtcbiAgaWYgKGZpbGVzLmxlbmd0aCA9PT0gMSkge1xuICAgIGluZGV4RmlsZSA9IGZpbGVzWzBdO1xuICB9IGVsc2Uge1xuICAgIGZvciAoY29uc3QgZiBvZiBmaWxlcykge1xuICAgICAgLy8gQXNzdW1lIHRoZSBzaG9ydGVzdCBmaWxlIHBhdGggY2FsbGVkIGluZGV4LnRzIGlzIHRoZSBlbnRyeSBwb2ludC4gTm90ZSB0aGF0IHdlXG4gICAgICAvLyBuZWVkIHRvIHVzZSB0aGUgcG9zaXggcGF0aCBkZWxpbWl0ZXIgaGVyZSBiZWNhdXNlIFR5cGVTY3JpcHQgaW50ZXJuYWxseSBvbmx5XG4gICAgICAvLyBwYXNzZXMgcG9zaXggcGF0aHMuXG4gICAgICBpZiAoZi5lbmRzV2l0aCgnL2luZGV4LnRzJykpIHtcbiAgICAgICAgaWYgKCFpbmRleEZpbGUgfHwgaW5kZXhGaWxlLmxlbmd0aCA+IGYubGVuZ3RoKSB7XG4gICAgICAgICAgaW5kZXhGaWxlID0gZjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAoIWluZGV4RmlsZSkge1xuICAgIHJldHVybiB7XG4gICAgICBob3N0LFxuICAgICAgZXJyb3JzOiBbe1xuICAgICAgICBmaWxlOiBudWxsIGFzIGFueSBhcyB0cy5Tb3VyY2VGaWxlLFxuICAgICAgICBzdGFydDogbnVsbCBhcyBhbnkgYXMgbnVtYmVyLFxuICAgICAgICBsZW5ndGg6IG51bGwgYXMgYW55IGFzIG51bWJlcixcbiAgICAgICAgbWVzc2FnZVRleHQ6XG4gICAgICAgICAgICAnQW5ndWxhciBjb21waWxlciBvcHRpb24gXCJmbGF0TW9kdWxlSW5kZXhcIiByZXF1aXJlcyBvbmUgYW5kIG9ubHkgb25lIC50cyBmaWxlIGluIHRoZSBcImZpbGVzXCIgZmllbGQuJyxcbiAgICAgICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcixcbiAgICAgICAgY29kZTogMFxuICAgICAgfV1cbiAgICB9O1xuICB9XG5cbiAgY29uc3QgaW5kZXhNb2R1bGUgPSBpbmRleEZpbGUucmVwbGFjZSgvXFwudHMkLywgJycpO1xuXG4gIC8vIFRoZSBvcGVyYXRpb24gb2YgcHJvZHVjaW5nIGEgbWV0YWRhdGEgYnVuZGxlIGhhcHBlbnMgdHdpY2UgLSBvbmNlIGR1cmluZyBzZXR1cCBhbmQgb25jZSBkdXJpbmdcbiAgLy8gdGhlIGVtaXQgcGhhc2UuIFRoZSBmaXJzdCB0aW1lLCB0aGUgYnVuZGxlIGlzIHByb2R1Y2VkIHdpdGhvdXQgYSBtZXRhZGF0YSBjYWNoZSwgdG8gY29tcHV0ZSB0aGVcbiAgLy8gY29udGVudHMgb2YgdGhlIGZsYXQgbW9kdWxlIGluZGV4LiBUaGUgYnVuZGxlIHByb2R1Y2VkIGR1cmluZyBlbWl0IGRvZXMgdXNlIHRoZSBtZXRhZGF0YSBjYWNoZVxuICAvLyB3aXRoIGFzc29jaWF0ZWQgdHJhbnNmb3Jtcywgc28gdGhlIG1ldGFkYXRhIHdpbGwgaGF2ZSBsb3dlcmVkIGV4cHJlc3Npb25zLCByZXNvdXJjZSBpbmxpbmluZyxcbiAgLy8gZXRjLlxuICBjb25zdCBnZXRNZXRhZGF0YUJ1bmRsZSA9IChjYWNoZTogTWV0YWRhdGFDYWNoZSB8IG51bGwpID0+IHtcbiAgICBjb25zdCBidW5kbGVyID0gbmV3IE1ldGFkYXRhQnVuZGxlcihcbiAgICAgICAgaW5kZXhNb2R1bGUsIG5nT3B0aW9ucy5mbGF0TW9kdWxlSWQsIG5ldyBDb21waWxlckhvc3RBZGFwdGVyKGhvc3QsIGNhY2hlLCBuZ09wdGlvbnMpLFxuICAgICAgICBuZ09wdGlvbnMuZmxhdE1vZHVsZVByaXZhdGVTeW1ib2xQcmVmaXgpO1xuICAgIHJldHVybiBidW5kbGVyLmdldE1ldGFkYXRhQnVuZGxlKCk7XG4gIH07XG5cbiAgLy8gRmlyc3QsIHByb2R1Y2UgdGhlIGJ1bmRsZSB3aXRoIG5vIE1ldGFkYXRhQ2FjaGUuXG4gIGNvbnN0IG1ldGFkYXRhQnVuZGxlID0gZ2V0TWV0YWRhdGFCdW5kbGUoLyogTWV0YWRhdGFDYWNoZSAqLyBudWxsKTtcbiAgY29uc3QgbmFtZSA9XG4gICAgICBwYXRoLmpvaW4ocGF0aC5kaXJuYW1lKGluZGV4TW9kdWxlKSwgbmdPcHRpb25zLmZsYXRNb2R1bGVPdXRGaWxlICEucmVwbGFjZShKU19FWFQsICcudHMnKSk7XG4gIGNvbnN0IGxpYnJhcnlJbmRleCA9IGAuLyR7cGF0aC5iYXNlbmFtZShpbmRleE1vZHVsZSl9YDtcbiAgY29uc3QgY29udGVudCA9IHByaXZhdGVFbnRyaWVzVG9JbmRleChsaWJyYXJ5SW5kZXgsIG1ldGFkYXRhQnVuZGxlLnByaXZhdGVzKTtcblxuICBob3N0ID0gY3JlYXRlU3ludGhldGljSW5kZXhIb3N0KGhvc3QsIHtcbiAgICBuYW1lLFxuICAgIGNvbnRlbnQsXG4gICAgZ2V0TWV0YWRhdGE6ICgpID0+IHtcbiAgICAgIC8vIFRoZSBzZWNvbmQgbWV0YWRhdGEgYnVuZGxlIHByb2R1Y3Rpb24gaGFwcGVucyBvbi1kZW1hbmQsIGFuZCB1c2VzIHRoZSBnZXRNZXRhZGF0YUNhY2hlXG4gICAgICAvLyBjbG9zdXJlIHRvIHJldHJpZXZlIGFuIHVwLXRvLWRhdGUgTWV0YWRhdGFDYWNoZSB3aGljaCBpcyBjb25maWd1cmVkIHdpdGggd2hhdGV2ZXIgbWV0YWRhdGFcbiAgICAgIC8vIHRyYW5zZm9ybXMgd2VyZSB1c2VkIHRvIHByb2R1Y2UgdGhlIEpTIG91dHB1dC5cbiAgICAgIGNvbnN0IG1ldGFkYXRhQnVuZGxlID0gZ2V0TWV0YWRhdGFCdW5kbGUoZ2V0TWV0YWRhdGFDYWNoZSgpKTtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShtZXRhZGF0YUJ1bmRsZS5tZXRhZGF0YSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHtob3N0LCBpbmRleE5hbWU6IG5hbWV9O1xufVxuIl19