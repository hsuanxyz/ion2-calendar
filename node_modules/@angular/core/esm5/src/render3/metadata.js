/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
/**
 * Adds decorator, constructor, and property metadata to a given type via static metadata fields
 * on the type.
 *
 * These metadata fields can later be read with Angular's `ReflectionCapabilities` API.
 *
 * Calls to `setClassMetadata` can be marked as pure, resulting in the metadata assignments being
 * tree-shaken away during production builds.
 */
export function setClassMetadata(type, decorators, ctorParameters, propDecorators) {
    var _a;
    var clazz = type;
    if (decorators !== null) {
        if (clazz.decorators !== undefined) {
            (_a = clazz.decorators).push.apply(_a, tslib_1.__spread(decorators));
        }
        else {
            clazz.decorators = decorators;
        }
    }
    if (ctorParameters !== null) {
        // Rather than merging, clobber the existing parameters. If other projects exist which use
        // tsickle-style annotations and reflect over them in the same way, this could cause issues,
        // but that is vanishingly unlikely.
        clazz.ctorParameters = ctorParameters;
    }
    if (propDecorators !== null) {
        // The property decorator objects are merged as it is possible different fields have different
        // decorator types. Decorators on individual fields are not merged, as it's also incredibly
        // unlikely that a field will be decorated both with an Angular decorator and a non-Angular
        // decorator that's also been downleveled.
        if (clazz.propDecorators !== undefined) {
            clazz.propDecorators = tslib_1.__assign({}, clazz.propDecorators, propDecorators);
        }
        else {
            clazz.propDecorators = propDecorators;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFVSDs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sVUFBVSxnQkFBZ0IsQ0FDNUIsSUFBZSxFQUFFLFVBQXdCLEVBQUUsY0FBNEIsRUFDdkUsY0FBNkM7O0lBQy9DLElBQU0sS0FBSyxHQUFHLElBQXdCLENBQUM7SUFDdkMsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFO1FBQ3ZCLElBQUksS0FBSyxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUU7WUFDbEMsQ0FBQSxLQUFBLEtBQUssQ0FBQyxVQUFVLENBQUEsQ0FBQyxJQUFJLDRCQUFJLFVBQVUsR0FBRTtTQUN0QzthQUFNO1lBQ0wsS0FBSyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7U0FDL0I7S0FDRjtJQUNELElBQUksY0FBYyxLQUFLLElBQUksRUFBRTtRQUMzQiwwRkFBMEY7UUFDMUYsNEZBQTRGO1FBQzVGLG9DQUFvQztRQUNwQyxLQUFLLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztLQUN2QztJQUNELElBQUksY0FBYyxLQUFLLElBQUksRUFBRTtRQUMzQiw4RkFBOEY7UUFDOUYsMkZBQTJGO1FBQzNGLDJGQUEyRjtRQUMzRiwwQ0FBMEM7UUFDMUMsSUFBSSxLQUFLLENBQUMsY0FBYyxLQUFLLFNBQVMsRUFBRTtZQUN0QyxLQUFLLENBQUMsY0FBYyx3QkFBTyxLQUFLLENBQUMsY0FBYyxFQUFLLGNBQWMsQ0FBQyxDQUFDO1NBQ3JFO2FBQU07WUFDTCxLQUFLLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztTQUN2QztLQUNGO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtUeXBlfSBmcm9tICcuLi90eXBlJztcblxuaW50ZXJmYWNlIFR5cGVXaXRoTWV0YWRhdGEgZXh0ZW5kcyBUeXBlPGFueT4ge1xuICBkZWNvcmF0b3JzPzogYW55W107XG4gIGN0b3JQYXJhbWV0ZXJzPzogYW55W107XG4gIHByb3BEZWNvcmF0b3JzPzoge1tmaWVsZDogc3RyaW5nXTogYW55fTtcbn1cblxuLyoqXG4gKiBBZGRzIGRlY29yYXRvciwgY29uc3RydWN0b3IsIGFuZCBwcm9wZXJ0eSBtZXRhZGF0YSB0byBhIGdpdmVuIHR5cGUgdmlhIHN0YXRpYyBtZXRhZGF0YSBmaWVsZHNcbiAqIG9uIHRoZSB0eXBlLlxuICpcbiAqIFRoZXNlIG1ldGFkYXRhIGZpZWxkcyBjYW4gbGF0ZXIgYmUgcmVhZCB3aXRoIEFuZ3VsYXIncyBgUmVmbGVjdGlvbkNhcGFiaWxpdGllc2AgQVBJLlxuICpcbiAqIENhbGxzIHRvIGBzZXRDbGFzc01ldGFkYXRhYCBjYW4gYmUgbWFya2VkIGFzIHB1cmUsIHJlc3VsdGluZyBpbiB0aGUgbWV0YWRhdGEgYXNzaWdubWVudHMgYmVpbmdcbiAqIHRyZWUtc2hha2VuIGF3YXkgZHVyaW5nIHByb2R1Y3Rpb24gYnVpbGRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0Q2xhc3NNZXRhZGF0YShcbiAgICB0eXBlOiBUeXBlPGFueT4sIGRlY29yYXRvcnM6IGFueVtdIHwgbnVsbCwgY3RvclBhcmFtZXRlcnM6IGFueVtdIHwgbnVsbCxcbiAgICBwcm9wRGVjb3JhdG9yczoge1tmaWVsZDogc3RyaW5nXTogYW55fSB8IG51bGwpOiB2b2lkIHtcbiAgY29uc3QgY2xhenogPSB0eXBlIGFzIFR5cGVXaXRoTWV0YWRhdGE7XG4gIGlmIChkZWNvcmF0b3JzICE9PSBudWxsKSB7XG4gICAgaWYgKGNsYXp6LmRlY29yYXRvcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY2xhenouZGVjb3JhdG9ycy5wdXNoKC4uLmRlY29yYXRvcnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjbGF6ei5kZWNvcmF0b3JzID0gZGVjb3JhdG9ycztcbiAgICB9XG4gIH1cbiAgaWYgKGN0b3JQYXJhbWV0ZXJzICE9PSBudWxsKSB7XG4gICAgLy8gUmF0aGVyIHRoYW4gbWVyZ2luZywgY2xvYmJlciB0aGUgZXhpc3RpbmcgcGFyYW1ldGVycy4gSWYgb3RoZXIgcHJvamVjdHMgZXhpc3Qgd2hpY2ggdXNlXG4gICAgLy8gdHNpY2tsZS1zdHlsZSBhbm5vdGF0aW9ucyBhbmQgcmVmbGVjdCBvdmVyIHRoZW0gaW4gdGhlIHNhbWUgd2F5LCB0aGlzIGNvdWxkIGNhdXNlIGlzc3VlcyxcbiAgICAvLyBidXQgdGhhdCBpcyB2YW5pc2hpbmdseSB1bmxpa2VseS5cbiAgICBjbGF6ei5jdG9yUGFyYW1ldGVycyA9IGN0b3JQYXJhbWV0ZXJzO1xuICB9XG4gIGlmIChwcm9wRGVjb3JhdG9ycyAhPT0gbnVsbCkge1xuICAgIC8vIFRoZSBwcm9wZXJ0eSBkZWNvcmF0b3Igb2JqZWN0cyBhcmUgbWVyZ2VkIGFzIGl0IGlzIHBvc3NpYmxlIGRpZmZlcmVudCBmaWVsZHMgaGF2ZSBkaWZmZXJlbnRcbiAgICAvLyBkZWNvcmF0b3IgdHlwZXMuIERlY29yYXRvcnMgb24gaW5kaXZpZHVhbCBmaWVsZHMgYXJlIG5vdCBtZXJnZWQsIGFzIGl0J3MgYWxzbyBpbmNyZWRpYmx5XG4gICAgLy8gdW5saWtlbHkgdGhhdCBhIGZpZWxkIHdpbGwgYmUgZGVjb3JhdGVkIGJvdGggd2l0aCBhbiBBbmd1bGFyIGRlY29yYXRvciBhbmQgYSBub24tQW5ndWxhclxuICAgIC8vIGRlY29yYXRvciB0aGF0J3MgYWxzbyBiZWVuIGRvd25sZXZlbGVkLlxuICAgIGlmIChjbGF6ei5wcm9wRGVjb3JhdG9ycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjbGF6ei5wcm9wRGVjb3JhdG9ycyA9IHsuLi5jbGF6ei5wcm9wRGVjb3JhdG9ycywgLi4ucHJvcERlY29yYXRvcnN9O1xuICAgIH0gZWxzZSB7XG4gICAgICBjbGF6ei5wcm9wRGVjb3JhdG9ycyA9IHByb3BEZWNvcmF0b3JzO1xuICAgIH1cbiAgfVxufVxuIl19