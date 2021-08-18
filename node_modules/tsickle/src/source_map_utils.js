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
        define("tsickle/src/source_map_utils", ["require", "exports", "source-map"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var source_map_1 = require("source-map");
    /**
     * Return a new RegExp object every time we want one because the
     * RegExp object has internal state that we don't want to persist
     * between different logical uses.
     */
    function getInlineSourceMapRegex() {
        return new RegExp('^//# sourceMappingURL=data:application/json;base64,(.*)$', 'mg');
    }
    function containsInlineSourceMap(source) {
        return getInlineSourceMapCount(source) > 0;
    }
    exports.containsInlineSourceMap = containsInlineSourceMap;
    function getInlineSourceMapCount(source) {
        var match = source.match(getInlineSourceMapRegex());
        return match ? match.length : 0;
    }
    exports.getInlineSourceMapCount = getInlineSourceMapCount;
    function extractInlineSourceMap(source) {
        var inlineSourceMapRegex = getInlineSourceMapRegex();
        var previousResult = null;
        var result = null;
        // We want to extract the last source map in the source file
        // since that's probably the most recent one added.  We keep
        // matching against the source until we don't get a result,
        // then we use the previous result.
        do {
            previousResult = result;
            result = inlineSourceMapRegex.exec(source);
        } while (result !== null);
        var base64EncodedMap = previousResult[1];
        return Buffer.from(base64EncodedMap, 'base64').toString('utf8');
    }
    exports.extractInlineSourceMap = extractInlineSourceMap;
    function removeInlineSourceMap(source) {
        return source.replace(getInlineSourceMapRegex(), '');
    }
    exports.removeInlineSourceMap = removeInlineSourceMap;
    /**
     * Sets the source map inline in the file.  If there's an existing inline source
     * map, it clobbers it.
     */
    function setInlineSourceMap(source, sourceMap) {
        var encodedSourceMap = Buffer.from(sourceMap, 'utf8').toString('base64');
        if (containsInlineSourceMap(source)) {
            return source.replace(getInlineSourceMapRegex(), "//# sourceMappingURL=data:application/json;base64," + encodedSourceMap);
        }
        else {
            return source + "\n//# sourceMappingURL=data:application/json;base64," + encodedSourceMap;
        }
    }
    exports.setInlineSourceMap = setInlineSourceMap;
    function parseSourceMap(text, fileName, sourceName) {
        var rawSourceMap = JSON.parse(text);
        if (sourceName) {
            rawSourceMap.sources = [sourceName];
        }
        if (fileName) {
            rawSourceMap.file = fileName;
        }
        return rawSourceMap;
    }
    exports.parseSourceMap = parseSourceMap;
    function sourceMapConsumerToGenerator(sourceMapConsumer) {
        return source_map_1.SourceMapGenerator.fromSourceMap(sourceMapConsumer);
    }
    exports.sourceMapConsumerToGenerator = sourceMapConsumerToGenerator;
    /**
     * Tsc identifies source files by their relative path to the output file.  Since
     * there's no easy way to identify these relative paths when tsickle generates its
     * own source maps, we patch them with the file name from the tsc source maps
     * before composing them.
     */
    function sourceMapGeneratorToConsumer(sourceMapGenerator, fileName, sourceName) {
        var rawSourceMap = sourceMapGenerator.toJSON();
        if (sourceName) {
            rawSourceMap.sources = [sourceName];
        }
        if (fileName) {
            rawSourceMap.file = fileName;
        }
        return new source_map_1.SourceMapConsumer(rawSourceMap);
    }
    exports.sourceMapGeneratorToConsumer = sourceMapGeneratorToConsumer;
    function sourceMapTextToConsumer(sourceMapText) {
        // the SourceMapConsumer constructor returns a BasicSourceMapConsumer or an
        // IndexedSourceMapConsumer depending on if you pass in a RawSourceMap or a
        // RawIndexMap or the string json of either.  In this case we're passing in
        // the string for a RawSourceMap, so we always get a BasicSourceMapConsumer
        //
        // Note, the typings distributed with the library are missing this constructor overload,
        // so we must type it as any, see https://github.com/angular/tsickle/issues/750
        // tslint:disable-next-line no-any
        return new source_map_1.SourceMapConsumer(sourceMapText);
    }
    exports.sourceMapTextToConsumer = sourceMapTextToConsumer;
    function sourceMapTextToGenerator(sourceMapText) {
        return source_map_1.SourceMapGenerator.fromSourceMap(sourceMapTextToConsumer(sourceMapText));
    }
    exports.sourceMapTextToGenerator = sourceMapTextToGenerator;
    exports.NOOP_SOURCE_MAPPER = {
        shiftByOffset: function () { },
        addMapping: function () { },
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlX21hcF91dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zb3VyY2VfbWFwX3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBRUgseUNBQStFO0lBMEIvRTs7OztPQUlHO0lBQ0g7UUFDRSxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsMERBQTBELEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEYsQ0FBQztJQUVELGlDQUF3QyxNQUFjO1FBQ3BELE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUZELDBEQUVDO0lBRUQsaUNBQXdDLE1BQWM7UUFDcEQsSUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLENBQUM7UUFDdEQsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFIRCwwREFHQztJQUVELGdDQUF1QyxNQUFjO1FBQ25ELElBQU0sb0JBQW9CLEdBQUcsdUJBQXVCLEVBQUUsQ0FBQztRQUN2RCxJQUFJLGNBQWMsR0FBeUIsSUFBSSxDQUFDO1FBQ2hELElBQUksTUFBTSxHQUF5QixJQUFJLENBQUM7UUFDeEMsNERBQTREO1FBQzVELDREQUE0RDtRQUM1RCwyREFBMkQ7UUFDM0QsbUNBQW1DO1FBQ25DLEdBQUcsQ0FBQztZQUNGLGNBQWMsR0FBRyxNQUFNLENBQUM7WUFDeEIsTUFBTSxHQUFHLG9CQUFvQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3QyxDQUFDLFFBQVEsTUFBTSxLQUFLLElBQUksRUFBRTtRQUMxQixJQUFNLGdCQUFnQixHQUFHLGNBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQWRELHdEQWNDO0lBRUQsK0JBQXNDLE1BQWM7UUFDbEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRkQsc0RBRUM7SUFFRDs7O09BR0c7SUFDSCw0QkFBbUMsTUFBYyxFQUFFLFNBQWlCO1FBQ2xFLElBQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzNFLEVBQUUsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FDakIsdUJBQXVCLEVBQUUsRUFDekIsdURBQXFELGdCQUFrQixDQUFDLENBQUM7UUFDL0UsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxDQUFJLE1BQU0sNERBQXVELGdCQUFrQixDQUFDO1FBQzVGLENBQUM7SUFDSCxDQUFDO0lBVEQsZ0RBU0M7SUFFRCx3QkFBK0IsSUFBWSxFQUFFLFFBQWlCLEVBQUUsVUFBbUI7UUFDakYsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQWlCLENBQUM7UUFDdEQsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNmLFlBQVksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNiLFlBQVksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO1FBQy9CLENBQUM7UUFDRCxNQUFNLENBQUMsWUFBWSxDQUFDO0lBQ3RCLENBQUM7SUFURCx3Q0FTQztJQUVELHNDQUE2QyxpQkFBb0M7UUFFL0UsTUFBTSxDQUFDLCtCQUFrQixDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFIRCxvRUFHQztJQUVEOzs7OztPQUtHO0lBQ0gsc0NBQ0ksa0JBQXNDLEVBQUUsUUFBaUIsRUFDekQsVUFBbUI7UUFDckIsSUFBTSxZQUFZLEdBQUksa0JBQStDLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDL0UsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNmLFlBQVksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNiLFlBQVksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO1FBQy9CLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSw4QkFBaUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBWEQsb0VBV0M7SUFFRCxpQ0FBd0MsYUFBcUI7UUFDM0QsMkVBQTJFO1FBQzNFLDJFQUEyRTtRQUMzRSwyRUFBMkU7UUFDM0UsMkVBQTJFO1FBQzNFLEVBQUU7UUFDRix3RkFBd0Y7UUFDeEYsK0VBQStFO1FBQy9FLGtDQUFrQztRQUNsQyxNQUFNLENBQUMsSUFBSSw4QkFBaUIsQ0FBQyxhQUFvQixDQUEyQixDQUFDO0lBQy9FLENBQUM7SUFWRCwwREFVQztJQUVELGtDQUF5QyxhQUFxQjtRQUM1RCxNQUFNLENBQUMsK0JBQWtCLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7SUFDbEYsQ0FBQztJQUZELDREQUVDO0lBZ0NZLFFBQUEsa0JBQWtCLEdBQWlCO1FBQzlDLGFBQWEsZ0JBQWUsQ0FBQztRQUM3QixVQUFVLGdCQUFlLENBQUM7S0FDM0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtSYXdTb3VyY2VNYXAsIFNvdXJjZU1hcENvbnN1bWVyLCBTb3VyY2VNYXBHZW5lcmF0b3J9IGZyb20gJ3NvdXJjZS1tYXAnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAnLi90eXBlc2NyaXB0JztcblxuLyoqXG4gKiBUaGlzIGludGVyZmFjZSB3YXMgZGVmaW5lZCBpbiBAdHlwZXMvc291cmNlLW1hcCBidXQgaXMgYWJzZW50IGZyb20gdGhlIHR5cGluZ3NcbiAqIGRpc3RyaWJ1dGVkIGluIHRoZSBzb3VyY2UtbWFwIHBhY2thZ2UuXG4gKiBDb3BpZWQgZnJvbSBodHRwczovL3VucGtnLmNvbS9AdHlwZXMvc291cmNlLW1hcEAwLjUuMi9pbmRleC5kLnRzXG4gKiBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvdHNpY2tsZS9pc3N1ZXMvNzUwXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQmFzaWNTb3VyY2VNYXBDb25zdW1lciBleHRlbmRzIFNvdXJjZU1hcENvbnN1bWVyIHtcbiAgZmlsZTogc3RyaW5nO1xuICBzb3VyY2VSb290OiBzdHJpbmc7XG4gIHNvdXJjZXM6IHN0cmluZ1tdO1xuICBzb3VyY2VzQ29udGVudDogc3RyaW5nW107XG59XG5cbi8qKlxuICogVGhlIHRvSlNPTiBtZXRob2QgaXMgaW50cm9kdWNlZCBpblxuICogaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEvc291cmNlLW1hcC9jb21taXQvN2MwNmFjODNkZDZkNzVlNjVmNzE3MjcxODRhMmQ4NjMwYTE1YmY1OCNkaWZmLTc5NDVmNmJiNDQ1ZDk1Njc5NDU2NGUwOThlZjIwYmIzXG4gKiBIb3dldmVyIHRoZXJlIGlzIGEgYnJlYWtpbmcgY2hhbmdlIGluIDAuNy5cbiAqIHNlZSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci90c2lja2xlL2lzc3Vlcy83NTBcbiAqL1xuZXhwb3J0IHR5cGUgU291cmNlTWFwR2VuZXJhdG9yVG9Kc29uID0gU291cmNlTWFwR2VuZXJhdG9yJntcbiAgdG9KU09OKCk6IFJhd1NvdXJjZU1hcDtcbn07XG5cbi8qKlxuICogUmV0dXJuIGEgbmV3IFJlZ0V4cCBvYmplY3QgZXZlcnkgdGltZSB3ZSB3YW50IG9uZSBiZWNhdXNlIHRoZVxuICogUmVnRXhwIG9iamVjdCBoYXMgaW50ZXJuYWwgc3RhdGUgdGhhdCB3ZSBkb24ndCB3YW50IHRvIHBlcnNpc3RcbiAqIGJldHdlZW4gZGlmZmVyZW50IGxvZ2ljYWwgdXNlcy5cbiAqL1xuZnVuY3Rpb24gZ2V0SW5saW5lU291cmNlTWFwUmVnZXgoKTogUmVnRXhwIHtcbiAgcmV0dXJuIG5ldyBSZWdFeHAoJ14vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LCguKikkJywgJ21nJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb250YWluc0lubGluZVNvdXJjZU1hcChzb3VyY2U6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gZ2V0SW5saW5lU291cmNlTWFwQ291bnQoc291cmNlKSA+IDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbmxpbmVTb3VyY2VNYXBDb3VudChzb3VyY2U6IHN0cmluZyk6IG51bWJlciB7XG4gIGNvbnN0IG1hdGNoID0gc291cmNlLm1hdGNoKGdldElubGluZVNvdXJjZU1hcFJlZ2V4KCkpO1xuICByZXR1cm4gbWF0Y2ggPyBtYXRjaC5sZW5ndGggOiAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdElubGluZVNvdXJjZU1hcChzb3VyY2U6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGlubGluZVNvdXJjZU1hcFJlZ2V4ID0gZ2V0SW5saW5lU291cmNlTWFwUmVnZXgoKTtcbiAgbGV0IHByZXZpb3VzUmVzdWx0OiBSZWdFeHBFeGVjQXJyYXl8bnVsbCA9IG51bGw7XG4gIGxldCByZXN1bHQ6IFJlZ0V4cEV4ZWNBcnJheXxudWxsID0gbnVsbDtcbiAgLy8gV2Ugd2FudCB0byBleHRyYWN0IHRoZSBsYXN0IHNvdXJjZSBtYXAgaW4gdGhlIHNvdXJjZSBmaWxlXG4gIC8vIHNpbmNlIHRoYXQncyBwcm9iYWJseSB0aGUgbW9zdCByZWNlbnQgb25lIGFkZGVkLiAgV2Uga2VlcFxuICAvLyBtYXRjaGluZyBhZ2FpbnN0IHRoZSBzb3VyY2UgdW50aWwgd2UgZG9uJ3QgZ2V0IGEgcmVzdWx0LFxuICAvLyB0aGVuIHdlIHVzZSB0aGUgcHJldmlvdXMgcmVzdWx0LlxuICBkbyB7XG4gICAgcHJldmlvdXNSZXN1bHQgPSByZXN1bHQ7XG4gICAgcmVzdWx0ID0gaW5saW5lU291cmNlTWFwUmVnZXguZXhlYyhzb3VyY2UpO1xuICB9IHdoaWxlIChyZXN1bHQgIT09IG51bGwpO1xuICBjb25zdCBiYXNlNjRFbmNvZGVkTWFwID0gcHJldmlvdXNSZXN1bHQhWzFdO1xuICByZXR1cm4gQnVmZmVyLmZyb20oYmFzZTY0RW5jb2RlZE1hcCwgJ2Jhc2U2NCcpLnRvU3RyaW5nKCd1dGY4Jyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVJbmxpbmVTb3VyY2VNYXAoc291cmNlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gc291cmNlLnJlcGxhY2UoZ2V0SW5saW5lU291cmNlTWFwUmVnZXgoKSwgJycpO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIHNvdXJjZSBtYXAgaW5saW5lIGluIHRoZSBmaWxlLiAgSWYgdGhlcmUncyBhbiBleGlzdGluZyBpbmxpbmUgc291cmNlXG4gKiBtYXAsIGl0IGNsb2JiZXJzIGl0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0SW5saW5lU291cmNlTWFwKHNvdXJjZTogc3RyaW5nLCBzb3VyY2VNYXA6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGVuY29kZWRTb3VyY2VNYXAgPSBCdWZmZXIuZnJvbShzb3VyY2VNYXAsICd1dGY4JykudG9TdHJpbmcoJ2Jhc2U2NCcpO1xuICBpZiAoY29udGFpbnNJbmxpbmVTb3VyY2VNYXAoc291cmNlKSkge1xuICAgIHJldHVybiBzb3VyY2UucmVwbGFjZShcbiAgICAgICAgZ2V0SW5saW5lU291cmNlTWFwUmVnZXgoKSxcbiAgICAgICAgYC8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsJHtlbmNvZGVkU291cmNlTWFwfWApO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBgJHtzb3VyY2V9XFxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCwke2VuY29kZWRTb3VyY2VNYXB9YDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTb3VyY2VNYXAodGV4dDogc3RyaW5nLCBmaWxlTmFtZT86IHN0cmluZywgc291cmNlTmFtZT86IHN0cmluZyk6IFJhd1NvdXJjZU1hcCB7XG4gIGNvbnN0IHJhd1NvdXJjZU1hcCA9IEpTT04ucGFyc2UodGV4dCkgYXMgUmF3U291cmNlTWFwO1xuICBpZiAoc291cmNlTmFtZSkge1xuICAgIHJhd1NvdXJjZU1hcC5zb3VyY2VzID0gW3NvdXJjZU5hbWVdO1xuICB9XG4gIGlmIChmaWxlTmFtZSkge1xuICAgIHJhd1NvdXJjZU1hcC5maWxlID0gZmlsZU5hbWU7XG4gIH1cbiAgcmV0dXJuIHJhd1NvdXJjZU1hcDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNvdXJjZU1hcENvbnN1bWVyVG9HZW5lcmF0b3Ioc291cmNlTWFwQ29uc3VtZXI6IFNvdXJjZU1hcENvbnN1bWVyKTpcbiAgICBTb3VyY2VNYXBHZW5lcmF0b3Ige1xuICByZXR1cm4gU291cmNlTWFwR2VuZXJhdG9yLmZyb21Tb3VyY2VNYXAoc291cmNlTWFwQ29uc3VtZXIpO1xufVxuXG4vKipcbiAqIFRzYyBpZGVudGlmaWVzIHNvdXJjZSBmaWxlcyBieSB0aGVpciByZWxhdGl2ZSBwYXRoIHRvIHRoZSBvdXRwdXQgZmlsZS4gIFNpbmNlXG4gKiB0aGVyZSdzIG5vIGVhc3kgd2F5IHRvIGlkZW50aWZ5IHRoZXNlIHJlbGF0aXZlIHBhdGhzIHdoZW4gdHNpY2tsZSBnZW5lcmF0ZXMgaXRzXG4gKiBvd24gc291cmNlIG1hcHMsIHdlIHBhdGNoIHRoZW0gd2l0aCB0aGUgZmlsZSBuYW1lIGZyb20gdGhlIHRzYyBzb3VyY2UgbWFwc1xuICogYmVmb3JlIGNvbXBvc2luZyB0aGVtLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc291cmNlTWFwR2VuZXJhdG9yVG9Db25zdW1lcihcbiAgICBzb3VyY2VNYXBHZW5lcmF0b3I6IFNvdXJjZU1hcEdlbmVyYXRvciwgZmlsZU5hbWU/OiBzdHJpbmcsXG4gICAgc291cmNlTmFtZT86IHN0cmluZyk6IFNvdXJjZU1hcENvbnN1bWVyIHtcbiAgY29uc3QgcmF3U291cmNlTWFwID0gKHNvdXJjZU1hcEdlbmVyYXRvciBhcyBTb3VyY2VNYXBHZW5lcmF0b3JUb0pzb24pLnRvSlNPTigpO1xuICBpZiAoc291cmNlTmFtZSkge1xuICAgIHJhd1NvdXJjZU1hcC5zb3VyY2VzID0gW3NvdXJjZU5hbWVdO1xuICB9XG4gIGlmIChmaWxlTmFtZSkge1xuICAgIHJhd1NvdXJjZU1hcC5maWxlID0gZmlsZU5hbWU7XG4gIH1cbiAgcmV0dXJuIG5ldyBTb3VyY2VNYXBDb25zdW1lcihyYXdTb3VyY2VNYXApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc291cmNlTWFwVGV4dFRvQ29uc3VtZXIoc291cmNlTWFwVGV4dDogc3RyaW5nKTogQmFzaWNTb3VyY2VNYXBDb25zdW1lciB7XG4gIC8vIHRoZSBTb3VyY2VNYXBDb25zdW1lciBjb25zdHJ1Y3RvciByZXR1cm5zIGEgQmFzaWNTb3VyY2VNYXBDb25zdW1lciBvciBhblxuICAvLyBJbmRleGVkU291cmNlTWFwQ29uc3VtZXIgZGVwZW5kaW5nIG9uIGlmIHlvdSBwYXNzIGluIGEgUmF3U291cmNlTWFwIG9yIGFcbiAgLy8gUmF3SW5kZXhNYXAgb3IgdGhlIHN0cmluZyBqc29uIG9mIGVpdGhlci4gIEluIHRoaXMgY2FzZSB3ZSdyZSBwYXNzaW5nIGluXG4gIC8vIHRoZSBzdHJpbmcgZm9yIGEgUmF3U291cmNlTWFwLCBzbyB3ZSBhbHdheXMgZ2V0IGEgQmFzaWNTb3VyY2VNYXBDb25zdW1lclxuICAvL1xuICAvLyBOb3RlLCB0aGUgdHlwaW5ncyBkaXN0cmlidXRlZCB3aXRoIHRoZSBsaWJyYXJ5IGFyZSBtaXNzaW5nIHRoaXMgY29uc3RydWN0b3Igb3ZlcmxvYWQsXG4gIC8vIHNvIHdlIG11c3QgdHlwZSBpdCBhcyBhbnksIHNlZSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci90c2lja2xlL2lzc3Vlcy83NTBcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lIG5vLWFueVxuICByZXR1cm4gbmV3IFNvdXJjZU1hcENvbnN1bWVyKHNvdXJjZU1hcFRleHQgYXMgYW55KSBhcyBCYXNpY1NvdXJjZU1hcENvbnN1bWVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc291cmNlTWFwVGV4dFRvR2VuZXJhdG9yKHNvdXJjZU1hcFRleHQ6IHN0cmluZyk6IFNvdXJjZU1hcEdlbmVyYXRvciB7XG4gIHJldHVybiBTb3VyY2VNYXBHZW5lcmF0b3IuZnJvbVNvdXJjZU1hcChzb3VyY2VNYXBUZXh0VG9Db25zdW1lcihzb3VyY2VNYXBUZXh0KSk7XG59XG5cbi8qKlxuICogQSBwb3NpdGlvbiBpbiBhIHNvdXJjZSBtYXAuIEFsbCBvZmZzZXRzIGFyZSB6ZXJvLWJhc2VkLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNvdXJjZVBvc2l0aW9uIHtcbiAgLyoqIDAgYmFzZWQgKi9cbiAgY29sdW1uOiBudW1iZXI7XG4gIC8qKiAwIGJhc2VkICovXG4gIGxpbmU6IG51bWJlcjtcbiAgLyoqIDAgYmFzZWQgZnVsbCBvZmZzZXQgaW4gdGhlIGZpbGUuICovXG4gIHBvc2l0aW9uOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU291cmNlTWFwcGVyIHtcbiAgLyoqXG4gICAqIExvZ2ljYWxseSBzaGlmdCBhbGwgc291cmNlIHBvc2l0aW9ucyBieSBgb2Zmc2V0YC5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgaXMgdXNlZnVsIGlmIGNvZGUgaGFzIHRvIHByZXBlbmQgYWRkaXRpb25hbCB0ZXh0IHRvIHRoZSBnZW5lcmF0ZWQgb3V0cHV0IGFmdGVyXG4gICAqIHNvdXJjZSBtYXBwaW5ncyBoYXZlIGFscmVhZHkgYmVlbiBnZW5lcmF0ZWQuIFRoZSBzb3VyY2UgbWFwcyBhcmUgdGhlbiB0cmFuc3BhcmVudGx5IGFkanVzdGVkXG4gICAqIGR1cmluZyBUeXBlU2NyaXB0IG91dHB1dCBnZW5lcmF0aW9uLlxuICAgKi9cbiAgc2hpZnRCeU9mZnNldChvZmZzZXQ6IG51bWJlcik6IHZvaWQ7XG4gIC8qKlxuICAgKiBBZGRzIGEgbWFwcGluZyBmcm9tIGBvcmlnaW5hbE5vZGVgIGluIGBvcmlnaW5hbGAgcG9zaXRpb24gdG8gaXRzIG5ldyBsb2NhdGlvbiBpbiB0aGUgb3V0cHV0LFxuICAgKiBzcGFubmluZyBmcm9tIGBnZW5lcmF0ZWRgIChhbiBvZmZzZXQgaW4gdGhlIGZpbGUpIGZvciBgbGVuZ3RoYCBjaGFyYWN0ZXJzLlxuICAgKi9cbiAgYWRkTWFwcGluZyhcbiAgICAgIG9yaWdpbmFsTm9kZTogdHMuTm9kZSwgb3JpZ2luYWw6IFNvdXJjZVBvc2l0aW9uLCBnZW5lcmF0ZWQ6IFNvdXJjZVBvc2l0aW9uLFxuICAgICAgbGVuZ3RoOiBudW1iZXIpOiB2b2lkO1xufVxuXG5leHBvcnQgY29uc3QgTk9PUF9TT1VSQ0VfTUFQUEVSOiBTb3VyY2VNYXBwZXIgPSB7XG4gIHNoaWZ0QnlPZmZzZXQoKSB7Lyogbm8tb3AgKi99LFxuICBhZGRNYXBwaW5nKCkgey8qIG5vLW9wICovfSxcbn07XG4iXX0=