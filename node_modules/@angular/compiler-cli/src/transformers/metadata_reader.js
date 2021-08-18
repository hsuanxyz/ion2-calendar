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
        define("@angular/compiler-cli/src/transformers/metadata_reader", ["require", "exports", "@angular/compiler-cli/src/metadata/index", "@angular/compiler-cli/src/transformers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const metadata_1 = require("@angular/compiler-cli/src/metadata/index");
    const util_1 = require("@angular/compiler-cli/src/transformers/util");
    function createMetadataReaderCache() {
        const data = new Map();
        return { data };
    }
    exports.createMetadataReaderCache = createMetadataReaderCache;
    function readMetadata(filePath, host, cache) {
        let metadatas = cache && cache.data.get(filePath);
        if (metadatas) {
            return metadatas;
        }
        if (host.fileExists(filePath)) {
            // If the file doesn't exists then we cannot return metadata for the file.
            // This will occur if the user referenced a declared module for which no file
            // exists for the module (i.e. jQuery or angularjs).
            if (util_1.DTS.test(filePath)) {
                metadatas = readMetadataFile(host, filePath);
                if (!metadatas) {
                    // If there is a .d.ts file but no metadata file we need to produce a
                    // metadata from the .d.ts file as metadata files capture reexports
                    // (starting with v3).
                    metadatas = [upgradeMetadataWithDtsData(host, { '__symbolic': 'module', 'version': 1, 'metadata': {} }, filePath)];
                }
            }
            else {
                const metadata = host.getSourceFileMetadata(filePath);
                metadatas = metadata ? [metadata] : [];
            }
        }
        if (cache && (!host.cacheMetadata || host.cacheMetadata(filePath))) {
            cache.data.set(filePath, metadatas);
        }
        return metadatas;
    }
    exports.readMetadata = readMetadata;
    function readMetadataFile(host, dtsFilePath) {
        const metadataPath = dtsFilePath.replace(util_1.DTS, '.metadata.json');
        if (!host.fileExists(metadataPath)) {
            return undefined;
        }
        try {
            const metadataOrMetadatas = JSON.parse(host.readFile(metadataPath));
            const metadatas = metadataOrMetadatas ?
                (Array.isArray(metadataOrMetadatas) ? metadataOrMetadatas : [metadataOrMetadatas]) :
                [];
            if (metadatas.length) {
                let maxMetadata = metadatas.reduce((p, c) => p.version > c.version ? p : c);
                if (maxMetadata.version < metadata_1.METADATA_VERSION) {
                    metadatas.push(upgradeMetadataWithDtsData(host, maxMetadata, dtsFilePath));
                }
            }
            return metadatas;
        }
        catch (e) {
            console.error(`Failed to read JSON file ${metadataPath}`);
            throw e;
        }
    }
    function upgradeMetadataWithDtsData(host, oldMetadata, dtsFilePath) {
        // patch v1 to v3 by adding exports and the `extends` clause.
        // patch v3 to v4 by adding `interface` symbols for TypeAlias
        let newMetadata = {
            '__symbolic': 'module',
            'version': metadata_1.METADATA_VERSION,
            'metadata': Object.assign({}, oldMetadata.metadata),
        };
        if (oldMetadata.exports) {
            newMetadata.exports = oldMetadata.exports;
        }
        if (oldMetadata.importAs) {
            newMetadata.importAs = oldMetadata.importAs;
        }
        if (oldMetadata.origins) {
            newMetadata.origins = oldMetadata.origins;
        }
        const dtsMetadata = host.getSourceFileMetadata(dtsFilePath);
        if (dtsMetadata) {
            for (let prop in dtsMetadata.metadata) {
                if (!newMetadata.metadata[prop]) {
                    newMetadata.metadata[prop] = dtsMetadata.metadata[prop];
                }
            }
            if (dtsMetadata['importAs'])
                newMetadata['importAs'] = dtsMetadata['importAs'];
            // Only copy exports from exports from metadata prior to version 3.
            // Starting with version 3 the collector began collecting exports and
            // this should be redundant. Also, with bundler will rewrite the exports
            // which will hoist the exports from modules referenced indirectly causing
            // the imports to be different than the .d.ts files and using the .d.ts file
            // exports would cause the StaticSymbolResolver to redirect symbols to the
            // incorrect location.
            if ((!oldMetadata.version || oldMetadata.version < 3) && dtsMetadata.exports) {
                newMetadata.exports = dtsMetadata.exports;
            }
        }
        return newMetadata;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGFfcmVhZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy90cmFuc2Zvcm1lcnMvbWV0YWRhdGFfcmVhZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBSUgsdUVBQTZEO0lBRTdELHNFQUEyQjtJQWdCM0IsU0FBZ0IseUJBQXlCO1FBQ3ZDLE1BQU0sSUFBSSxHQUFHLElBQUksR0FBRyxFQUFzQyxDQUFDO1FBQzNELE9BQU8sRUFBQyxJQUFJLEVBQUMsQ0FBQztJQUNoQixDQUFDO0lBSEQsOERBR0M7SUFFRCxTQUFnQixZQUFZLENBQ3hCLFFBQWdCLEVBQUUsSUFBd0IsRUFBRSxLQUEyQjtRQUV6RSxJQUFJLFNBQVMsR0FBRyxLQUFLLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEQsSUFBSSxTQUFTLEVBQUU7WUFDYixPQUFPLFNBQVMsQ0FBQztTQUNsQjtRQUNELElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUM3QiwwRUFBMEU7WUFDMUUsNkVBQTZFO1lBQzdFLG9EQUFvRDtZQUNwRCxJQUFJLFVBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3RCLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQzdDLElBQUksQ0FBQyxTQUFTLEVBQUU7b0JBQ2QscUVBQXFFO29CQUNyRSxtRUFBbUU7b0JBQ25FLHNCQUFzQjtvQkFDdEIsU0FBUyxHQUFHLENBQUMsMEJBQTBCLENBQ25DLElBQUksRUFBRSxFQUFDLFlBQVksRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztp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LElBQUksSUFBSSxXQUFXLENBQUMsUUFBUSxFQUFFO2dCQUNyQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDL0IsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN6RDthQUNGO1lBQ0QsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDO2dCQUFFLFdBQVcsQ0FBQyxVQUFVLENBQUMsR0FBRyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFL0UsbUVBQW1FO1lBQ25FLHFFQUFxRTtZQUNyRSx3RUFBd0U7WUFDeEUsMEVBQTBFO1lBQzFFLDRFQUE0RTtZQUM1RSwwRUFBMEU7WUFDMUUsc0JBQXNCO1lBQ3RCLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLElBQUksV0FBVyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFO2dCQUM1RSxXQUFXLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUM7YUFDM0M7U0FDRjtRQUNELE9BQU8sV0FBVyxDQUFDO0lBQ3JCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge01FVEFEQVRBX1ZFUlNJT04sIE1vZHVsZU1ldGFkYXRhfSBmcm9tICcuLi9tZXRhZGF0YSc7XG5cbmltcG9ydCB7RFRTfSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE1ldGFkYXRhUmVhZGVySG9zdCB7XG4gIGdldFNvdXJjZUZpbGVNZXRhZGF0YShmaWxlUGF0aDogc3RyaW5nKTogTW9kdWxlTWV0YWRhdGF8dW5kZWZpbmVkO1xuICBjYWNoZU1ldGFkYXRhPyhmaWxlTmFtZTogc3RyaW5nKTogYm9vbGVhbjtcbiAgZmlsZUV4aXN0cyhmaWxlUGF0aDogc3RyaW5nKTogYm9vbGVhbjtcbiAgcmVhZEZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNZXRhZGF0YVJlYWRlckNhY2hlIHtcbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgZGF0YTogTWFwPHN0cmluZywgTW9kdWxlTWV0YWRhdGFbXXx1bmRlZmluZWQ+O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTWV0YWRhdGFSZWFkZXJDYWNoZSgpOiBNZXRhZGF0YVJlYWRlckNhY2hlIHtcbiAgY29uc3QgZGF0YSA9IG5ldyBNYXA8c3RyaW5nLCBNb2R1bGVNZXRhZGF0YVtdfHVuZGVmaW5lZD4oKTtcbiAgcmV0dXJuIHtkYXRhfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRNZXRhZGF0YShcbiAgICBmaWxlUGF0aDogc3RyaW5nLCBob3N0OiBNZXRhZGF0YVJlYWRlckhvc3QsIGNhY2hlPzogTWV0YWRhdGFSZWFkZXJDYWNoZSk6IE1vZHVsZU1ldGFkYXRhW118XG4gICAgdW5kZWZpbmVkIHtcbiAgbGV0IG1ldGFkYXRhcyA9IGNhY2hlICYmIGNhY2hlLmRhdGEuZ2V0KGZpbGVQYXRoKTtcbiAgaWYgKG1ldGFkYXRhcykge1xuICAgIHJldHVybiBtZXRhZGF0YXM7XG4gIH1cbiAgaWYgKGhvc3QuZmlsZUV4aXN0cyhmaWxlUGF0aCkpIHtcbiAgICAvLyBJZiB0aGUgZmlsZSBkb2Vzbid0IGV4aXN0cyB0aGVuIHdlIGNhbm5vdCByZXR1cm4gbWV0YWRhdGEgZm9yIHRoZSBmaWxlLlxuICAgIC8vIFRoaXMgd2lsbCBvY2N1ciBpZiB0aGUgdXNlciByZWZlcmVuY2VkIGEgZGVjbGFyZWQgbW9kdWxlIGZvciB3aGljaCBubyBmaWxlXG4gICAgLy8gZXhpc3RzIGZvciB0aGUgbW9kdWxlIChpLmUuIGpRdWVyeSBvciBhbmd1bGFyanMpLlxuICAgIGlmIChEVFMudGVzdChmaWxlUGF0aCkpIHtcbiAgICAgIG1ldGFkYXRhcyA9IHJlYWRNZXRhZGF0YUZpbGUoaG9zdCwgZmlsZVBhdGgpO1xuICAgICAgaWYgKCFtZXRhZGF0YXMpIHtcbiAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSAuZC50cyBmaWxlIGJ1dCBubyBtZXRhZGF0YSBmaWxlIHdlIG5lZWQgdG8gcHJvZHVjZSBhXG4gICAgICAgIC8vIG1ldGFkYXRhIGZyb20gdGhlIC5kLnRzIGZpbGUgYXMgbWV0YWRhdGEgZmlsZXMgY2FwdHVyZSByZWV4cG9ydHNcbiAgICAgICAgLy8gKHN0YXJ0aW5nIHdpdGggdjMpLlxuICAgICAgICBtZXRhZGF0YXMgPSBbdXBncmFkZU1ldGFkYXRhV2l0aER0c0RhdGEoXG4gICAgICAgICAgICBob3N0LCB7J19fc3ltYm9saWMnOiAnbW9kdWxlJywgJ3ZlcnNpb24nOiAxLCAnbWV0YWRhdGEnOiB7fX0sIGZpbGVQYXRoKV07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG1ldGFkYXRhID0gaG9zdC5nZXRTb3VyY2VGaWxlTWV0YWRhdGEoZmlsZVBhdGgpO1xuICAgICAgbWV0YWRhdGFzID0gbWV0YWRhdGEgPyBbbWV0YWRhdGFdIDogW107XG4gICAgfVxuICB9XG4gIGlmIChjYWNoZSAmJiAoIWhvc3QuY2FjaGVNZXRhZGF0YSB8fCBob3N0LmNhY2hlTWV0YWRhdGEoZmlsZVBhdGgpKSkge1xuICAgIGNhY2hlLmRhdGEuc2V0KGZpbGVQYXRoLCBtZXRhZGF0YXMpO1xuICB9XG4gIHJldHVybiBtZXRhZGF0YXM7XG59XG5cblxuZnVuY3Rpb24gcmVhZE1ldGFkYXRhRmlsZShob3N0OiBNZXRhZGF0YVJlYWRlckhvc3QsIGR0c0ZpbGVQYXRoOiBzdHJpbmcpOiBNb2R1bGVNZXRhZGF0YVtdfFxuICAgIHVuZGVmaW5lZCB7XG4gIGNvbnN0IG1ldGFkYXRhUGF0aCA9IGR0c0ZpbGVQYXRoLnJlcGxhY2UoRFRTLCAnLm1ldGFkYXRhLmpzb24nKTtcbiAgaWYgKCFob3N0LmZpbGVFeGlzdHMobWV0YWRhdGFQYXRoKSkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgdHJ5IHtcbiAgICBjb25zdCBtZXRhZGF0YU9yTWV0YWRhdGFzID0gSlNPTi5wYXJzZShob3N0LnJlYWRGaWxlKG1ldGFkYXRhUGF0aCkpO1xuICAgIGNvbnN0IG1ldGFkYXRhczogTW9kdWxlTWV0YWRhdGFbXSA9IG1ldGFkYXRhT3JNZXRhZGF0YXMgP1xuICAgICAgICAoQXJyYXkuaXNBcnJheShtZXRhZGF0YU9yTWV0YWRhdGFzKSA/IG1ldGFkYXRhT3JNZXRhZGF0YXMgOiBbbWV0YWRhdGFPck1ldGFkYXRhc10pIDpcbiAgICAgICAgW107XG4gICAgaWYgKG1ldGFkYXRhcy5sZW5ndGgpIHtcbiAgICAgIGxldCBtYXhNZXRhZGF0YSA9IG1ldGFkYXRhcy5yZWR1Y2UoKHAsIGMpID0+IHAudmVyc2lvbiA+IGMudmVyc2lvbiA/IHAgOiBjKTtcbiAgICAgIGlmIChtYXhNZXRhZGF0YS52ZXJzaW9uIDwgTUVUQURBVEFfVkVSU0lPTikge1xuICAgICAgICBtZXRhZGF0YXMucHVzaCh1cGdyYWRlTWV0YWRhdGFXaXRoRHRzRGF0YShob3N0LCBtYXhNZXRhZGF0YSwgZHRzRmlsZVBhdGgpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1ldGFkYXRhcztcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoYEZhaWxlZCB0byByZWFkIEpTT04gZmlsZSAke21ldGFkYXRhUGF0aH1gKTtcbiAgICB0aHJvdyBlO1xuICB9XG59XG5cbmZ1bmN0aW9uIHVwZ3JhZGVNZXRhZGF0YVdpdGhEdHNEYXRhKFxuICAgIGhvc3Q6IE1ldGFkYXRhUmVhZGVySG9zdCwgb2xkTWV0YWRhdGE6IE1vZHVsZU1ldGFkYXRhLCBkdHNGaWxlUGF0aDogc3RyaW5nKTogTW9kdWxlTWV0YWRhdGEge1xuICAvLyBwYXRjaCB2MSB0byB2MyBieSBhZGRpbmcgZXhwb3J0cyBhbmQgdGhlIGBleHRlbmRzYCBjbGF1c2UuXG4gIC8vIHBhdGNoIHYzIHRvIHY0IGJ5IGFkZGluZyBgaW50ZXJmYWNlYCBzeW1ib2xzIGZvciBUeXBlQWxpYXNcbiAgbGV0IG5ld01ldGFkYXRhOiBNb2R1bGVNZXRhZGF0YSA9IHtcbiAgICAnX19zeW1ib2xpYyc6ICdtb2R1bGUnLFxuICAgICd2ZXJzaW9uJzogTUVUQURBVEFfVkVSU0lPTixcbiAgICAnbWV0YWRhdGEnOiB7Li4ub2xkTWV0YWRhdGEubWV0YWRhdGF9LFxuICB9O1xuICBpZiAob2xkTWV0YWRhdGEuZXhwb3J0cykge1xuICAgIG5ld01ldGFkYXRhLmV4cG9ydHMgPSBvbGRNZXRhZGF0YS5leHBvcnRzO1xuICB9XG4gIGlmIChvbGRNZXRhZGF0YS5pbXBvcnRBcykge1xuICAgIG5ld01ldGFkYXRhLmltcG9ydEFzID0gb2xkTWV0YWRhdGEuaW1wb3J0QXM7XG4gIH1cbiAgaWYgKG9sZE1ldGFkYXRhLm9yaWdpbnMpIHtcbiAgICBuZXdNZXRhZGF0YS5vcmlnaW5zID0gb2xkTWV0YWRhdGEub3JpZ2lucztcbiAgfVxuICBjb25zdCBkdHNNZXRhZGF0YSA9IGhvc3QuZ2V0U291cmNlRmlsZU1ldGFkYXRhKGR0c0ZpbGVQYXRoKTtcbiAgaWYgKGR0c01ldGFkYXRhKSB7XG4gICAgZm9yIChsZXQgcHJvcCBpbiBkdHNNZXRhZGF0YS5tZXRhZGF0YSkge1xuICAgICAgaWYgKCFuZXdNZXRhZGF0YS5tZXRhZGF0YVtwcm9wXSkge1xuICAgICAgICBuZXdNZXRhZGF0YS5tZXRhZGF0YVtwcm9wXSA9IGR0c01ldGFkYXRhLm1ldGFkYXRhW3Byb3BdO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZHRzTWV0YWRhdGFbJ2ltcG9ydEFzJ10pIG5ld01ldGFkYXRhWydpbXBvcnRBcyddID0gZHRzTWV0YWRhdGFbJ2ltcG9ydEFzJ107XG5cbiAgICAvLyBPbmx5IGNvcHkgZXhwb3J0cyBmcm9tIGV4cG9ydHMgZnJvbSBtZXRhZGF0YSBwcmlvciB0byB2ZXJzaW9uIDMuXG4gICAgLy8gU3RhcnRpbmcgd2l0aCB2ZXJzaW9uIDMgdGhlIGNvbGxlY3RvciBiZWdhbiBjb2xsZWN0aW5nIGV4cG9ydHMgYW5kXG4gICAgLy8gdGhpcyBzaG91bGQgYmUgcmVkdW5kYW50LiBBbHNvLCB3aXRoIGJ1bmRsZXIgd2lsbCByZXdyaXRlIHRoZSBleHBvcnRzXG4gICAgLy8gd2hpY2ggd2lsbCBob2lzdCB0aGUgZXhwb3J0cyBmcm9tIG1vZHVsZXMgcmVmZXJlbmNlZCBpbmRpcmVjdGx5IGNhdXNpbmdcbiAgICAvLyB0aGUgaW1wb3J0cyB0byBiZSBkaWZmZXJlbnQgdGhhbiB0aGUgLmQudHMgZmlsZXMgYW5kIHVzaW5nIHRoZSAuZC50cyBmaWxlXG4gICAgLy8gZXhwb3J0cyB3b3VsZCBjYXVzZSB0aGUgU3RhdGljU3ltYm9sUmVzb2x2ZXIgdG8gcmVkaXJlY3Qgc3ltYm9scyB0byB0aGVcbiAgICAvLyBpbmNvcnJlY3QgbG9jYXRpb24uXG4gICAgaWYgKCghb2xkTWV0YWRhdGEudmVyc2lvbiB8fCBvbGRNZXRhZGF0YS52ZXJzaW9uIDwgMykgJiYgZHRzTWV0YWRhdGEuZXhwb3J0cykge1xuICAgICAgbmV3TWV0YWRhdGEuZXhwb3J0cyA9IGR0c01ldGFkYXRhLmV4cG9ydHM7XG4gICAgfVxuICB9XG4gIHJldHVybiBuZXdNZXRhZGF0YTtcbn1cbiJdfQ==