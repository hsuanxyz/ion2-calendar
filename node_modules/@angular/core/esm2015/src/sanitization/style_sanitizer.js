/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { isDevMode } from '../is_dev_mode';
import { _sanitizeUrl } from './url_sanitizer';
/**
 * Regular expression for safe style values.
 *
 * Quotes (" and ') are allowed, but a check must be done elsewhere to ensure they're balanced.
 *
 * ',' allows multiple values to be assigned to the same property (e.g. background-attachment or
 * font-family) and hence could allow multiple values to get injected, but that should pose no risk
 * of XSS.
 *
 * The function expression checks only for XSS safety, not for CSS validity.
 *
 * This regular expression was taken from the Closure sanitization library, and augmented for
 * transformation values.
 * @type {?}
 */
const VALUES = '[-,."\'%_!# a-zA-Z0-9]+';
/** @type {?} */
const TRANSFORMATION_FNS = '(?:matrix|translate|scale|rotate|skew|perspective)(?:X|Y|3d)?';
/** @type {?} */
const COLOR_FNS = '(?:rgb|hsl)a?';
/** @type {?} */
const GRADIENTS = '(?:repeating-)?(?:linear|radial)-gradient';
/** @type {?} */
const CSS3_FNS = '(?:calc|attr)';
/** @type {?} */
const FN_ARGS = '\\([-0-9.%, #a-zA-Z]+\\)';
/** @type {?} */
const SAFE_STYLE_VALUE = new RegExp(`^(${VALUES}|` +
    `(?:${TRANSFORMATION_FNS}|${COLOR_FNS}|${GRADIENTS}|${CSS3_FNS})` +
    `${FN_ARGS})$`, 'g');
/**
 * Matches a `url(...)` value with an arbitrary argument as long as it does
 * not contain parentheses.
 *
 * The URL value still needs to be sanitized separately.
 *
 * `url(...)` values are a very common use case, e.g. for `background-image`. With carefully crafted
 * CSS style rules, it is possible to construct an information leak with `url` values in CSS, e.g.
 * by observing whether scroll bars are displayed, or character ranges used by a font face
 * definition.
 *
 * Angular only allows binding CSS values (as opposed to entire CSS rules), so it is unlikely that
 * binding a URL value without further cooperation from the page will cause an information leak, and
 * if so, it is just a leak, not a full blown XSS vulnerability.
 *
 * Given the common use case, low likelihood of attack vector, and low impact of an attack, this
 * code is permissive and allows URLs that sanitize otherwise.
 * @type {?}
 */
const URL_RE = /^url\(([^)]+)\)$/;
/**
 * Checks that quotes (" and ') are properly balanced inside a string. Assumes
 * that neither escape (\) nor any other character that could result in
 * breaking out of a string parsing context are allowed;
 * see http://www.w3.org/TR/css3-syntax/#string-token-diagram.
 *
 * This code was taken from the Closure sanitization library.
 * @param {?} value
 * @return {?}
 */
function hasBalancedQuotes(value) {
    /** @type {?} */
    let outsideSingle = true;
    /** @type {?} */
    let outsideDouble = true;
    for (let i = 0; i < value.length; i++) {
        /** @type {?} */
        const c = value.charAt(i);
        if (c === '\'' && outsideDouble) {
            outsideSingle = !outsideSingle;
        }
        else if (c === '"' && outsideSingle) {
            outsideDouble = !outsideDouble;
        }
    }
    return outsideSingle && outsideDouble;
}
/**
 * Sanitizes the given untrusted CSS style property value (i.e. not an entire object, just a single
 * value) and returns a value that is safe to use in a browser environment.
 * @param {?} value
 * @return {?}
 */
export function _sanitizeStyle(value) {
    value = String(value).trim(); // Make sure it's actually a string.
    if (!value)
        return '';
    // Single url(...) values are supported, but only for URLs that sanitize cleanly. See above for
    // reasoning behind this.
    /** @type {?} */
    const urlMatch = value.match(URL_RE);
    if ((urlMatch && _sanitizeUrl(urlMatch[1]) === urlMatch[1]) ||
        value.match(SAFE_STYLE_VALUE) && hasBalancedQuotes(value)) {
        return value; // Safe style values.
    }
    if (isDevMode()) {
        console.warn(`WARNING: sanitizing unsafe style value ${value} (see http://g.co/ng/security#xss).`);
    }
    return 'unsafe';
}
/**
 * Used to intercept and sanitize style values before they are written to the renderer.
 *
 * This function is designed to be called in two modes. When a value is not provided
 * then the function will return a boolean whether a property will be sanitized later.
 * If a value is provided then the sanitized version of that will be returned.
 * @record
 */
export function StyleSanitizeFn() { }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGVfc2FuaXRpemVyLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvY29yZS9zcmMvc2FuaXRpemF0aW9uL3N0eWxlX3Nhbml0aXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6QyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7TUFpQnZDLE1BQU0sR0FBRyx5QkFBeUI7O01BQ2xDLGtCQUFrQixHQUFHLCtEQUErRDs7TUFDcEYsU0FBUyxHQUFHLGVBQWU7O01BQzNCLFNBQVMsR0FBRywyQ0FBMkM7O01BQ3ZELFFBQVEsR0FBRyxlQUFlOztNQUMxQixPQUFPLEdBQUcsMEJBQTBCOztNQUNwQyxnQkFBZ0IsR0FBRyxJQUFJLE1BQU0sQ0FDL0IsS0FBSyxNQUFNLEdBQUc7SUFDVixNQUFNLGtCQUFrQixJQUFJLFNBQVMsSUFBSSxTQUFTLElBQUksUUFBUSxHQUFHO0lBQ2pFLEdBQUcsT0FBTyxJQUFJLEVBQ2xCLEdBQUcsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFvQkYsTUFBTSxHQUFHLGtCQUFrQjs7Ozs7Ozs7Ozs7QUFVakMsU0FBUyxpQkFBaUIsQ0FBQyxLQUFhOztRQUNsQyxhQUFhLEdBQUcsSUFBSTs7UUFDcEIsYUFBYSxHQUFHLElBQUk7SUFDeEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7O2NBQy9CLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUN6QixJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksYUFBYSxFQUFFO1lBQy9CLGFBQWEsR0FBRyxDQUFDLGFBQWEsQ0FBQztTQUNoQzthQUFNLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxhQUFhLEVBQUU7WUFDckMsYUFBYSxHQUFHLENBQUMsYUFBYSxDQUFDO1NBQ2hDO0tBQ0Y7SUFDRCxPQUFPLGFBQWEsSUFBSSxhQUFhLENBQUM7QUFDeEMsQ0FBQzs7Ozs7OztBQU1ELE1BQU0sVUFBVSxjQUFjLENBQUMsS0FBYTtJQUMxQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUUsb0NBQW9DO0lBQ25FLElBQUksQ0FBQyxLQUFLO1FBQUUsT0FBTyxFQUFFLENBQUM7Ozs7VUFJaEIsUUFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQ3BDLElBQUksQ0FBQyxRQUFRLElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2RCxLQUFLLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLElBQUksaUJBQWlCLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDN0QsT0FBTyxLQUFLLENBQUMsQ0FBRSxxQkFBcUI7S0FDckM7SUFFRCxJQUFJLFNBQVMsRUFBRSxFQUFFO1FBQ2YsT0FBTyxDQUFDLElBQUksQ0FDUiwwQ0FBMEMsS0FBSyxxQ0FBcUMsQ0FBQyxDQUFDO0tBQzNGO0lBRUQsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQzs7Ozs7Ozs7O0FBVUQscUNBTUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aXNEZXZNb2RlfSBmcm9tICcuLi9pc19kZXZfbW9kZSc7XG5pbXBvcnQge19zYW5pdGl6ZVVybH0gZnJvbSAnLi91cmxfc2FuaXRpemVyJztcblxuXG4vKipcbiAqIFJlZ3VsYXIgZXhwcmVzc2lvbiBmb3Igc2FmZSBzdHlsZSB2YWx1ZXMuXG4gKlxuICogUXVvdGVzIChcIiBhbmQgJykgYXJlIGFsbG93ZWQsIGJ1dCBhIGNoZWNrIG11c3QgYmUgZG9uZSBlbHNld2hlcmUgdG8gZW5zdXJlIHRoZXkncmUgYmFsYW5jZWQuXG4gKlxuICogJywnIGFsbG93cyBtdWx0aXBsZSB2YWx1ZXMgdG8gYmUgYXNzaWduZWQgdG8gdGhlIHNhbWUgcHJvcGVydHkgKGUuZy4gYmFja2dyb3VuZC1hdHRhY2htZW50IG9yXG4gKiBmb250LWZhbWlseSkgYW5kIGhlbmNlIGNvdWxkIGFsbG93IG11bHRpcGxlIHZhbHVlcyB0byBnZXQgaW5qZWN0ZWQsIGJ1dCB0aGF0IHNob3VsZCBwb3NlIG5vIHJpc2tcbiAqIG9mIFhTUy5cbiAqXG4gKiBUaGUgZnVuY3Rpb24gZXhwcmVzc2lvbiBjaGVja3Mgb25seSBmb3IgWFNTIHNhZmV0eSwgbm90IGZvciBDU1MgdmFsaWRpdHkuXG4gKlxuICogVGhpcyByZWd1bGFyIGV4cHJlc3Npb24gd2FzIHRha2VuIGZyb20gdGhlIENsb3N1cmUgc2FuaXRpemF0aW9uIGxpYnJhcnksIGFuZCBhdWdtZW50ZWQgZm9yXG4gKiB0cmFuc2Zvcm1hdGlvbiB2YWx1ZXMuXG4gKi9cbmNvbnN0IFZBTFVFUyA9ICdbLSwuXCJcXCclXyEjIGEtekEtWjAtOV0rJztcbmNvbnN0IFRSQU5TRk9STUFUSU9OX0ZOUyA9ICcoPzptYXRyaXh8dHJhbnNsYXRlfHNjYWxlfHJvdGF0ZXxza2V3fHBlcnNwZWN0aXZlKSg/Olh8WXwzZCk/JztcbmNvbnN0IENPTE9SX0ZOUyA9ICcoPzpyZ2J8aHNsKWE/JztcbmNvbnN0IEdSQURJRU5UUyA9ICcoPzpyZXBlYXRpbmctKT8oPzpsaW5lYXJ8cmFkaWFsKS1ncmFkaWVudCc7XG5jb25zdCBDU1MzX0ZOUyA9ICcoPzpjYWxjfGF0dHIpJztcbmNvbnN0IEZOX0FSR1MgPSAnXFxcXChbLTAtOS4lLCAjYS16QS1aXStcXFxcKSc7XG5jb25zdCBTQUZFX1NUWUxFX1ZBTFVFID0gbmV3IFJlZ0V4cChcbiAgICBgXigke1ZBTFVFU318YCArXG4gICAgICAgIGAoPzoke1RSQU5TRk9STUFUSU9OX0ZOU318JHtDT0xPUl9GTlN9fCR7R1JBRElFTlRTfXwke0NTUzNfRk5TfSlgICtcbiAgICAgICAgYCR7Rk5fQVJHU30pJGAsXG4gICAgJ2cnKTtcblxuLyoqXG4gKiBNYXRjaGVzIGEgYHVybCguLi4pYCB2YWx1ZSB3aXRoIGFuIGFyYml0cmFyeSBhcmd1bWVudCBhcyBsb25nIGFzIGl0IGRvZXNcbiAqIG5vdCBjb250YWluIHBhcmVudGhlc2VzLlxuICpcbiAqIFRoZSBVUkwgdmFsdWUgc3RpbGwgbmVlZHMgdG8gYmUgc2FuaXRpemVkIHNlcGFyYXRlbHkuXG4gKlxuICogYHVybCguLi4pYCB2YWx1ZXMgYXJlIGEgdmVyeSBjb21tb24gdXNlIGNhc2UsIGUuZy4gZm9yIGBiYWNrZ3JvdW5kLWltYWdlYC4gV2l0aCBjYXJlZnVsbHkgY3JhZnRlZFxuICogQ1NTIHN0eWxlIHJ1bGVzLCBpdCBpcyBwb3NzaWJsZSB0byBjb25zdHJ1Y3QgYW4gaW5mb3JtYXRpb24gbGVhayB3aXRoIGB1cmxgIHZhbHVlcyBpbiBDU1MsIGUuZy5cbiAqIGJ5IG9ic2VydmluZyB3aGV0aGVyIHNjcm9sbCBiYXJzIGFyZSBkaXNwbGF5ZWQsIG9yIGNoYXJhY3RlciByYW5nZXMgdXNlZCBieSBhIGZvbnQgZmFjZVxuICogZGVmaW5pdGlvbi5cbiAqXG4gKiBBbmd1bGFyIG9ubHkgYWxsb3dzIGJpbmRpbmcgQ1NTIHZhbHVlcyAoYXMgb3Bwb3NlZCB0byBlbnRpcmUgQ1NTIHJ1bGVzKSwgc28gaXQgaXMgdW5saWtlbHkgdGhhdFxuICogYmluZGluZyBhIFVSTCB2YWx1ZSB3aXRob3V0IGZ1cnRoZXIgY29vcGVyYXRpb24gZnJvbSB0aGUgcGFnZSB3aWxsIGNhdXNlIGFuIGluZm9ybWF0aW9uIGxlYWssIGFuZFxuICogaWYgc28sIGl0IGlzIGp1c3QgYSBsZWFrLCBub3QgYSBmdWxsIGJsb3duIFhTUyB2dWxuZXJhYmlsaXR5LlxuICpcbiAqIEdpdmVuIHRoZSBjb21tb24gdXNlIGNhc2UsIGxvdyBsaWtlbGlob29kIG9mIGF0dGFjayB2ZWN0b3IsIGFuZCBsb3cgaW1wYWN0IG9mIGFuIGF0dGFjaywgdGhpc1xuICogY29kZSBpcyBwZXJtaXNzaXZlIGFuZCBhbGxvd3MgVVJMcyB0aGF0IHNhbml0aXplIG90aGVyd2lzZS5cbiAqL1xuY29uc3QgVVJMX1JFID0gL151cmxcXCgoW14pXSspXFwpJC87XG5cbi8qKlxuICogQ2hlY2tzIHRoYXQgcXVvdGVzIChcIiBhbmQgJykgYXJlIHByb3Blcmx5IGJhbGFuY2VkIGluc2lkZSBhIHN0cmluZy4gQXNzdW1lc1xuICogdGhhdCBuZWl0aGVyIGVzY2FwZSAoXFwpIG5vciBhbnkgb3RoZXIgY2hhcmFjdGVyIHRoYXQgY291bGQgcmVzdWx0IGluXG4gKiBicmVha2luZyBvdXQgb2YgYSBzdHJpbmcgcGFyc2luZyBjb250ZXh0IGFyZSBhbGxvd2VkO1xuICogc2VlIGh0dHA6Ly93d3cudzMub3JnL1RSL2NzczMtc3ludGF4LyNzdHJpbmctdG9rZW4tZGlhZ3JhbS5cbiAqXG4gKiBUaGlzIGNvZGUgd2FzIHRha2VuIGZyb20gdGhlIENsb3N1cmUgc2FuaXRpemF0aW9uIGxpYnJhcnkuXG4gKi9cbmZ1bmN0aW9uIGhhc0JhbGFuY2VkUXVvdGVzKHZhbHVlOiBzdHJpbmcpIHtcbiAgbGV0IG91dHNpZGVTaW5nbGUgPSB0cnVlO1xuICBsZXQgb3V0c2lkZURvdWJsZSA9IHRydWU7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBjID0gdmFsdWUuY2hhckF0KGkpO1xuICAgIGlmIChjID09PSAnXFwnJyAmJiBvdXRzaWRlRG91YmxlKSB7XG4gICAgICBvdXRzaWRlU2luZ2xlID0gIW91dHNpZGVTaW5nbGU7XG4gICAgfSBlbHNlIGlmIChjID09PSAnXCInICYmIG91dHNpZGVTaW5nbGUpIHtcbiAgICAgIG91dHNpZGVEb3VibGUgPSAhb3V0c2lkZURvdWJsZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG91dHNpZGVTaW5nbGUgJiYgb3V0c2lkZURvdWJsZTtcbn1cblxuLyoqXG4gKiBTYW5pdGl6ZXMgdGhlIGdpdmVuIHVudHJ1c3RlZCBDU1Mgc3R5bGUgcHJvcGVydHkgdmFsdWUgKGkuZS4gbm90IGFuIGVudGlyZSBvYmplY3QsIGp1c3QgYSBzaW5nbGVcbiAqIHZhbHVlKSBhbmQgcmV0dXJucyBhIHZhbHVlIHRoYXQgaXMgc2FmZSB0byB1c2UgaW4gYSBicm93c2VyIGVudmlyb25tZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gX3Nhbml0aXplU3R5bGUodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHZhbHVlID0gU3RyaW5nKHZhbHVlKS50cmltKCk7ICAvLyBNYWtlIHN1cmUgaXQncyBhY3R1YWxseSBhIHN0cmluZy5cbiAgaWYgKCF2YWx1ZSkgcmV0dXJuICcnO1xuXG4gIC8vIFNpbmdsZSB1cmwoLi4uKSB2YWx1ZXMgYXJlIHN1cHBvcnRlZCwgYnV0IG9ubHkgZm9yIFVSTHMgdGhhdCBzYW5pdGl6ZSBjbGVhbmx5LiBTZWUgYWJvdmUgZm9yXG4gIC8vIHJlYXNvbmluZyBiZWhpbmQgdGhpcy5cbiAgY29uc3QgdXJsTWF0Y2ggPSB2YWx1ZS5tYXRjaChVUkxfUkUpO1xuICBpZiAoKHVybE1hdGNoICYmIF9zYW5pdGl6ZVVybCh1cmxNYXRjaFsxXSkgPT09IHVybE1hdGNoWzFdKSB8fFxuICAgICAgdmFsdWUubWF0Y2goU0FGRV9TVFlMRV9WQUxVRSkgJiYgaGFzQmFsYW5jZWRRdW90ZXModmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlOyAgLy8gU2FmZSBzdHlsZSB2YWx1ZXMuXG4gIH1cblxuICBpZiAoaXNEZXZNb2RlKCkpIHtcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGBXQVJOSU5HOiBzYW5pdGl6aW5nIHVuc2FmZSBzdHlsZSB2YWx1ZSAke3ZhbHVlfSAoc2VlIGh0dHA6Ly9nLmNvL25nL3NlY3VyaXR5I3hzcykuYCk7XG4gIH1cblxuICByZXR1cm4gJ3Vuc2FmZSc7XG59XG5cblxuLyoqXG4gKiBVc2VkIHRvIGludGVyY2VwdCBhbmQgc2FuaXRpemUgc3R5bGUgdmFsdWVzIGJlZm9yZSB0aGV5IGFyZSB3cml0dGVuIHRvIHRoZSByZW5kZXJlci5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIGRlc2lnbmVkIHRvIGJlIGNhbGxlZCBpbiB0d28gbW9kZXMuIFdoZW4gYSB2YWx1ZSBpcyBub3QgcHJvdmlkZWRcbiAqIHRoZW4gdGhlIGZ1bmN0aW9uIHdpbGwgcmV0dXJuIGEgYm9vbGVhbiB3aGV0aGVyIGEgcHJvcGVydHkgd2lsbCBiZSBzYW5pdGl6ZWQgbGF0ZXIuXG4gKiBJZiBhIHZhbHVlIGlzIHByb3ZpZGVkIHRoZW4gdGhlIHNhbml0aXplZCB2ZXJzaW9uIG9mIHRoYXQgd2lsbCBiZSByZXR1cm5lZC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdHlsZVNhbml0aXplRm4ge1xuICAvKiogVGhpcyBtb2RlIGlzIGRlc2lnbmVkIHRvIGluc3RydWN0IHdoZXRoZXIgdGhlIHByb3BlcnR5IHdpbGwgYmUgdXNlZCBmb3Igc2FuaXRpemF0aW9uXG4gICAqIGF0IGEgbGF0ZXIgcG9pbnQgKi9cbiAgKHByb3A6IHN0cmluZyk6IGJvb2xlYW47XG4gIC8qKiBUaGlzIG1vZGUgaXMgZGVzaWduZWQgdG8gc2FuaXRpemUgdGhlIHByb3ZpZGVkIHZhbHVlICovXG4gIChwcm9wOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBzdHJpbmc7XG59XG4iXX0=