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
        define("@angular/compiler-cli/src/ngtsc/resource_loader", ["require", "exports", "fs", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const fs = require("fs");
    const ts = require("typescript");
    /**
     * `ResourceLoader` which delegates to a `CompilerHost` resource loading method.
     */
    class HostResourceLoader {
        constructor(resolver, loader) {
            this.resolver = resolver;
            this.loader = loader;
            this.cache = new Map();
            this.fetching = new Map();
        }
        preload(file, containingFile) {
            const resolved = this.resolver(file, containingFile);
            if (resolved === null) {
                return undefined;
            }
            if (this.cache.has(resolved)) {
                return undefined;
            }
            else if (this.fetching.has(resolved)) {
                return this.fetching.get(resolved);
            }
            const result = this.loader(resolved);
            if (typeof result === 'string') {
                this.cache.set(resolved, result);
                return undefined;
            }
            else {
                const fetchCompletion = result.then(str => {
                    this.fetching.delete(resolved);
                    this.cache.set(resolved, str);
                });
                this.fetching.set(resolved, fetchCompletion);
                return fetchCompletion;
            }
        }
        load(file, containingFile) {
            const resolved = this.resolver(file, containingFile);
            if (resolved === null) {
                throw new Error(`HostResourceLoader: could not resolve ${file} in context of ${containingFile})`);
            }
            if (this.cache.has(resolved)) {
                return this.cache.get(resolved);
            }
            const result = this.loader(resolved);
            if (typeof result !== 'string') {
                throw new Error(`HostResourceLoader: loader(${resolved}) returned a Promise`);
            }
            this.cache.set(resolved, result);
            return result;
        }
    }
    exports.HostResourceLoader = HostResourceLoader;
    /**
     * `ResourceLoader` which directly uses the filesystem to resolve resources synchronously.
     */
    class FileResourceLoader {
        constructor(host, options) {
            this.host = host;
            this.options = options;
        }
        load(file, containingFile) {
            // Attempt to resolve `file` in the context of `containingFile`, while respecting the rootDirs
            // option from the tsconfig. First, normalize the file name.
            // Strip a leading '/' if one is present.
            if (file.startsWith('/')) {
                file = file.substr(1);
            }
            // Turn absolute paths into relative paths.
            if (!file.startsWith('.')) {
                file = `./${file}`;
            }
            // TypeScript provides utilities to resolve module names, but not resource files (which aren't
            // a part of the ts.Program). However, TypeScript's module resolution can be used creatively
            // to locate where resource files should be expected to exist. Since module resolution returns
            // a list of file names that were considered, the loader can enumerate the possible locations
            // for the file by setting up a module resolution for it that will fail.
            file += '.$ngresource$';
            // clang-format off
            const failedLookup = ts.resolveModuleName(file, containingFile, this.options, this.host);
            // clang-format on
            if (failedLookup.failedLookupLocations === undefined) {
                throw new Error(`Internal error: expected to find failedLookupLocations during resolution of resource '${file}' in context of ${containingFile}`);
            }
            const candidateLocations = failedLookup.failedLookupLocations
                .filter(candidate => candidate.endsWith('.$ngresource$.ts'))
                .map(candidate => candidate.replace(/\.\$ngresource\$\.ts$/, ''));
            for (const candidate of candidateLocations) {
                if (fs.existsSync(candidate)) {
                    return fs.readFileSync(candidate, 'utf8');
                }
            }
            throw new Error(`Could not find resource ${file} in context of ${containingFile}`);
        }
    }
    exports.FileResourceLoader = FileResourceLoader;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2VfbG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9yZXNvdXJjZV9sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSCx5QkFBeUI7SUFDekIsaUNBQWlDO0lBSWpDOztPQUVHO0lBQ0gsTUFBYSxrQkFBa0I7UUFJN0IsWUFDWSxRQUEyRCxFQUMzRCxNQUFpRDtZQURqRCxhQUFRLEdBQVIsUUFBUSxDQUFtRDtZQUMzRCxXQUFNLEdBQU4sTUFBTSxDQUEyQztZQUxyRCxVQUFLLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7WUFDbEMsYUFBUSxHQUFHLElBQUksR0FBRyxFQUF5QixDQUFDO1FBSVksQ0FBQztRQUVqRSxPQUFPLENBQUMsSUFBWSxFQUFFLGNBQXNCO1lBQzFDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ3JELElBQUksUUFBUSxLQUFLLElBQUksRUFBRTtnQkFDckIsT0FBTyxTQUFTLENBQUM7YUFDbEI7WUFFRCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUM1QixPQUFPLFNBQVMsQ0FBQzthQUNsQjtpQkFBTSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN0QyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ3BDO1lBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNyQyxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRTtnQkFDOUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMs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QUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLHVCQUF1QixFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFMUUsS0FBSyxNQUFNLFNBQVMsSUFBSSxrQkFBa0IsRUFBRTtnQkFDMUMsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUM1QixPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2lCQUMzQzthQUNGO1lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsSUFBSSxrQkFBa0IsY0FBYyxFQUFFLENBQUMsQ0FBQztRQUNyRixDQUFDO0tBQ0Y7SUEzQ0QsZ0RBMkNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtSZXNvdXJjZUxvYWRlcn0gZnJvbSAnLi9hbm5vdGF0aW9ucyc7XG5cbi8qKlxuICogYFJlc291cmNlTG9hZGVyYCB3aGljaCBkZWxlZ2F0ZXMgdG8gYSBgQ29tcGlsZXJIb3N0YCByZXNvdXJjZSBsb2FkaW5nIG1ldGhvZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEhvc3RSZXNvdXJjZUxvYWRlciBpbXBsZW1lbnRzIFJlc291cmNlTG9hZGVyIHtcbiAgcHJpdmF0ZSBjYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gIHByaXZhdGUgZmV0Y2hpbmcgPSBuZXcgTWFwPHN0cmluZywgUHJvbWlzZTx2b2lkPj4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgcmVzb2x2ZXI6IChmaWxlOiBzdHJpbmcsIGJhc2VQYXRoOiBzdHJpbmcpID0+IHN0cmluZyB8IG51bGwsXG4gICAgICBwcml2YXRlIGxvYWRlcjogKHVybDogc3RyaW5nKSA9PiBzdHJpbmcgfCBQcm9taXNlPHN0cmluZz4pIHt9XG5cbiAgcHJlbG9hZChmaWxlOiBzdHJpbmcsIGNvbnRhaW5pbmdGaWxlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+fHVuZGVmaW5lZCB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSB0aGlzLnJlc29sdmVyKGZpbGUsIGNvbnRhaW5pbmdGaWxlKTtcbiAgICBpZiAocmVzb2x2ZWQgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2FjaGUuaGFzKHJlc29sdmVkKSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZmV0Y2hpbmcuaGFzKHJlc29sdmVkKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZmV0Y2hpbmcuZ2V0KHJlc29sdmVkKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmxvYWRlcihyZXNvbHZlZCk7XG4gICAgaWYgKHR5cGVvZiByZXN1bHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLmNhY2hlLnNldChyZXNvbHZlZCwgcmVzdWx0KTtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGZldGNoQ29tcGxldGlvbiA9IHJlc3VsdC50aGVuKHN0ciA9PiB7XG4gICAgICAgIHRoaXMuZmV0Y2hpbmcuZGVsZXRlKHJlc29sdmVkKTtcbiAgICAgICAgdGhpcy5jYWNoZS5zZXQocmVzb2x2ZWQsIHN0cik7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuZmV0Y2hpbmcuc2V0KHJlc29sdmVkLCBmZXRjaENvbXBsZXRpb24pO1xuICAgICAgcmV0dXJuIGZldGNoQ29tcGxldGlvbjtcbiAgICB9XG4gIH1cblxuICBsb2FkKGZpbGU6IHN0cmluZywgY29udGFpbmluZ0ZpbGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSB0aGlzLnJlc29sdmVyKGZpbGUsIGNvbnRhaW5pbmdGaWxlKTtcbiAgICBpZiAocmVzb2x2ZWQgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgSG9zdFJlc291cmNlTG9hZGVyOiBjb3VsZCBub3QgcmVzb2x2ZSAke2ZpbGV9IGluIGNvbnRleHQgb2YgJHtjb250YWluaW5nRmlsZX0pYCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2FjaGUuaGFzKHJlc29sdmVkKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY2FjaGUuZ2V0KHJlc29sdmVkKSAhO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMubG9hZGVyKHJlc29sdmVkKTtcbiAgICBpZiAodHlwZW9mIHJlc3VsdCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSG9zdFJlc291cmNlTG9hZGVyOiBsb2FkZXIoJHtyZXNvbHZlZH0pIHJldHVybmVkIGEgUHJvbWlzZWApO1xuICAgIH1cbiAgICB0aGlzLmNhY2hlLnNldChyZXNvbHZlZCwgcmVzdWx0KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59XG5cblxuXG4vLyBgZmFpbGVkTG9va3VwTG9jYXRpb25zYCBpcyBpbiB0aGUgbmFtZSBvZiB0aGUgdHlwZSB0cy5SZXNvbHZlZE1vZHVsZVdpdGhGYWlsZWRMb29rdXBMb2NhdGlvbnNcbi8vIGJ1dCBpcyBtYXJrZWQgQGludGVybmFsIGluIFR5cGVTY3JpcHQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzI4NzcwLlxudHlwZSBSZXNvbHZlZE1vZHVsZVdpdGhGYWlsZWRMb29rdXBMb2NhdGlvbnMgPVxuICAgIHRzLlJlc29sdmVkTW9kdWxlV2l0aEZhaWxlZExvb2t1cExvY2F0aW9ucyAmIHtmYWlsZWRMb29rdXBMb2NhdGlvbnM6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPn07XG5cbi8qKlxuICogYFJlc291cmNlTG9hZGVyYCB3aGljaCBkaXJlY3RseSB1c2VzIHRoZSBmaWxlc3lzdGVtIHRvIHJlc29sdmUgcmVzb3VyY2VzIHN5bmNocm9ub3VzbHkuXG4gKi9cbmV4cG9ydCBjbGFzcyBGaWxlUmVzb3VyY2VMb2FkZXIgaW1wbGVtZW50cyBSZXNvdXJjZUxvYWRlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaG9zdDogdHMuQ29tcGlsZXJIb3N0LCBwcml2YXRlIG9wdGlvbnM6IHRzLkNvbXBpbGVyT3B0aW9ucykge31cblxuICBsb2FkKGZpbGU6IHN0cmluZywgY29udGFpbmluZ0ZpbGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gQXR0ZW1wdCB0byByZXNvbHZlIGBmaWxlYCBpbiB0aGUgY29udGV4dCBvZiBgY29udGFpbmluZ0ZpbGVgLCB3aGlsZSByZXNwZWN0aW5nIHRoZSByb290RGlyc1xuICAgIC8vIG9wdGlvbiBmcm9tIHRoZSB0c2NvbmZpZy4gRmlyc3QsIG5vcm1hbGl6ZSB0aGUgZmlsZSBuYW1lLlxuXG4gICAgLy8gU3RyaXAgYSBsZWFkaW5nICcvJyBpZiBvbmUgaXMgcHJlc2VudC5cbiAgICBpZiAoZmlsZS5zdGFydHNXaXRoKCcvJykpIHtcbiAgICAgIGZpbGUgPSBmaWxlLnN1YnN0cigxKTtcbiAgICB9XG4gICAgLy8gVHVybiBhYnNvbHV0ZSBwYXRocyBpbnRvIHJlbGF0aXZlIHBhdGhzLlxuICAgIGlmICghZmlsZS5zdGFydHNXaXRoKCcuJykpIHtcbiAgICAgIGZpbGUgPSBgLi8ke2ZpbGV9YDtcbiAgICB9XG5cbiAgICAvLyBUeXBlU2NyaXB0IHByb3ZpZGVzIHV0aWxpdGllcyB0byByZXNvbHZlIG1vZHVsZSBuYW1lcywgYnV0IG5vdCByZXNvdXJjZSBmaWxlcyAod2hpY2ggYXJlbid0XG4gICAgLy8gYSBwYXJ0IG9mIHRoZSB0cy5Qcm9ncmFtKS4gSG93ZXZlciwgVHlwZVNjcmlwdCdzIG1vZHVsZSByZXNvbHV0aW9uIGNhbiBiZSB1c2VkIGNyZWF0aXZlbHlcbiAgICAvLyB0byBsb2NhdGUgd2hlcmUgcmVzb3VyY2UgZmlsZXMgc2hvdWxkIGJlIGV4cGVjdGVkIHRvIGV4aXN0LiBTaW5jZSBtb2R1bGUgcmVzb2x1dGlvbiByZXR1cm5zXG4gICAgLy8gYSBsaXN0IG9mIGZpbGUgbmFtZXMgdGhhdCB3ZXJlIGNvbnNpZGVyZWQsIHRoZSBsb2FkZXIgY2FuIGVudW1lcmF0ZSB0aGUgcG9zc2libGUgbG9jYXRpb25zXG4gICAgLy8gZm9yIHRoZSBmaWxlIGJ5IHNldHRpbmcgdXAgYSBtb2R1bGUgcmVzb2x1dGlvbiBmb3IgaXQgdGhhdCB3aWxsIGZhaWwuXG4gICAgZmlsZSArPSAnLiRuZ3Jlc291cmNlJCc7XG5cbiAgICAvLyBjbGFuZy1mb3JtYXQgb2ZmXG4gICAgY29uc3QgZmFpbGVkTG9va3VwID0gdHMucmVzb2x2ZU1vZHVsZU5hbWUoZmlsZSwgY29udGFpbmluZ0ZpbGUsIHRoaXMub3B0aW9ucywgdGhpcy5ob3N0KSBhcyBSZXNvbHZlZE1vZHVsZVdpdGhGYWlsZWRMb29rdXBMb2NhdGlvbnM7XG4gICAgLy8gY2xhbmctZm9ybWF0IG9uXG4gICAgaWYgKGZhaWxlZExvb2t1cC5mYWlsZWRMb29rdXBMb2NhdGlvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBJbnRlcm5hbCBlcnJvcjogZXhwZWN0ZWQgdG8gZmluZCBmYWlsZWRMb29rdXBMb2NhdGlvbnMgZHVyaW5nIHJlc29sdXRpb24gb2YgcmVzb3VyY2UgJyR7ZmlsZX0nIGluIGNvbnRleHQgb2YgJHtjb250YWluaW5nRmlsZX1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBjYW5kaWRhdGVMb2NhdGlvbnMgPVxuICAgICAgICBmYWlsZWRMb29rdXAuZmFpbGVkTG9va3VwTG9jYXRpb25zXG4gICAgICAgICAgICAuZmlsdGVyKGNhbmRpZGF0ZSA9PiBjYW5kaWRhdGUuZW5kc1dpdGgoJy4kbmdyZXNvdXJjZSQudHMnKSlcbiAgICAgICAgICAgIC5tYXAoY2FuZGlkYXRlID0+IGNhbmRpZGF0ZS5yZXBsYWNlKC9cXC5cXCRuZ3Jlc291cmNlXFwkXFwudHMkLywgJycpKTtcblxuICAgIGZvciAoY29uc3QgY2FuZGlkYXRlIG9mIGNhbmRpZGF0ZUxvY2F0aW9ucykge1xuICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoY2FuZGlkYXRlKSkge1xuICAgICAgICByZXR1cm4gZnMucmVhZEZpbGVTeW5jKGNhbmRpZGF0ZSwgJ3V0ZjgnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgZmluZCByZXNvdXJjZSAke2ZpbGV9IGluIGNvbnRleHQgb2YgJHtjb250YWluaW5nRmlsZX1gKTtcbiAgfVxufVxuIl19