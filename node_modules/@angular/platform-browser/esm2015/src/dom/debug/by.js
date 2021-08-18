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
import { getDOM } from '../../dom/dom_adapter';
/**
 * Predicates for use with {\@link DebugElement}'s query functions.
 *
 * \@publicApi
 */
export class By {
    /**
     * Match all elements.
     *
     * \@usageNotes
     * ### Example
     *
     * {\@example platform-browser/dom/debug/ts/by/by.ts region='by_all'}
     * @return {?}
     */
    static all() { return (debugElement) => true; }
    /**
     * Match elements by the given CSS selector.
     *
     * \@usageNotes
     * ### Example
     *
     * {\@example platform-browser/dom/debug/ts/by/by.ts region='by_css'}
     * @param {?} selector
     * @return {?}
     */
    static css(selector) {
        return (debugElement) => {
            return debugElement.nativeElement != null ?
                getDOM().elementMatches(debugElement.nativeElement, selector) :
                false;
        };
    }
    /**
     * Match elements that have the given directive present.
     *
     * \@usageNotes
     * ### Example
     *
     * {\@example platform-browser/dom/debug/ts/by/by.ts region='by_directive'}
     * @param {?} type
     * @return {?}
     */
    static directive(type) {
        return (debugElement) => (/** @type {?} */ (debugElement.providerTokens)).indexOf(type) !== -1;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnkuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9wbGF0Zm9ybS1icm93c2VyL3NyYy9kb20vZGVidWcvYnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFTQSxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7Ozs7OztBQVM3QyxNQUFNLE9BQU8sRUFBRTs7Ozs7Ozs7OztJQVNiLE1BQU0sQ0FBQyxHQUFHLEtBQThCLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7Ozs7O0lBVXhFLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBZ0I7UUFDekIsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFO1lBQ3RCLE9BQU8sWUFBWSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsQ0FBQztnQkFDdkMsTUFBTSxFQUFFLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDL0QsS0FBSyxDQUFDO1FBQ1osQ0FBQyxDQUFDO0lBQ0osQ0FBQzs7Ozs7Ozs7Ozs7SUFVRCxNQUFNLENBQUMsU0FBUyxDQUFDLElBQWU7UUFDOUIsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsbUJBQUEsWUFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM5RSxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGVidWdFbGVtZW50LCBQcmVkaWNhdGUsIFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtnZXRET019IGZyb20gJy4uLy4uL2RvbS9kb21fYWRhcHRlcic7XG5cblxuXG4vKipcbiAqIFByZWRpY2F0ZXMgZm9yIHVzZSB3aXRoIHtAbGluayBEZWJ1Z0VsZW1lbnR9J3MgcXVlcnkgZnVuY3Rpb25zLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIEJ5IHtcbiAgLyoqXG4gICAqIE1hdGNoIGFsbCBlbGVtZW50cy5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICoge0BleGFtcGxlIHBsYXRmb3JtLWJyb3dzZXIvZG9tL2RlYnVnL3RzL2J5L2J5LnRzIHJlZ2lvbj0nYnlfYWxsJ31cbiAgICovXG4gIHN0YXRpYyBhbGwoKTogUHJlZGljYXRlPERlYnVnRWxlbWVudD4geyByZXR1cm4gKGRlYnVnRWxlbWVudCkgPT4gdHJ1ZTsgfVxuXG4gIC8qKlxuICAgKiBNYXRjaCBlbGVtZW50cyBieSB0aGUgZ2l2ZW4gQ1NTIHNlbGVjdG9yLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiB7QGV4YW1wbGUgcGxhdGZvcm0tYnJvd3Nlci9kb20vZGVidWcvdHMvYnkvYnkudHMgcmVnaW9uPSdieV9jc3MnfVxuICAgKi9cbiAgc3RhdGljIGNzcyhzZWxlY3Rvcjogc3RyaW5nKTogUHJlZGljYXRlPERlYnVnRWxlbWVudD4ge1xuICAgIHJldHVybiAoZGVidWdFbGVtZW50KSA9PiB7XG4gICAgICByZXR1cm4gZGVidWdFbGVtZW50Lm5hdGl2ZUVsZW1lbnQgIT0gbnVsbCA/XG4gICAgICAgICAgZ2V0RE9NKCkuZWxlbWVudE1hdGNoZXMoZGVidWdFbGVtZW50Lm5hdGl2ZUVsZW1lbnQsIHNlbGVjdG9yKSA6XG4gICAgICAgICAgZmFsc2U7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXRjaCBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIGdpdmVuIGRpcmVjdGl2ZSBwcmVzZW50LlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiB7QGV4YW1wbGUgcGxhdGZvcm0tYnJvd3Nlci9kb20vZGVidWcvdHMvYnkvYnkudHMgcmVnaW9uPSdieV9kaXJlY3RpdmUnfVxuICAgKi9cbiAgc3RhdGljIGRpcmVjdGl2ZSh0eXBlOiBUeXBlPGFueT4pOiBQcmVkaWNhdGU8RGVidWdFbGVtZW50PiB7XG4gICAgcmV0dXJuIChkZWJ1Z0VsZW1lbnQpID0+IGRlYnVnRWxlbWVudC5wcm92aWRlclRva2VucyAhLmluZGV4T2YodHlwZSkgIT09IC0xO1xuICB9XG59XG4iXX0=