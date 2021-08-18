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
import { global } from '../util';
/**
 * A scope function for the Web Tracing Framework (WTF).
 *
 * \@publicApi
 * @record
 */
export function WtfScopeFn() { }
/**
 * @record
 */
function WTF() { }
if (false) {
    /** @type {?} */
    WTF.prototype.trace;
}
/**
 * @record
 */
function Trace() { }
if (false) {
    /** @type {?} */
    Trace.prototype.events;
    /**
     * @param {?} scope
     * @param {?} returnValue
     * @return {?}
     */
    Trace.prototype.leaveScope = function (scope, returnValue) { };
    /**
     * @param {?} rangeType
     * @param {?} action
     * @return {?}
     */
    Trace.prototype.beginTimeRange = function (rangeType, action) { };
    /**
     * @param {?} range
     * @return {?}
     */
    Trace.prototype.endTimeRange = function (range) { };
}
/**
 * @record
 */
export function Range() { }
/**
 * @record
 */
function Events() { }
if (false) {
    /**
     * @param {?} signature
     * @param {?} flags
     * @return {?}
     */
    Events.prototype.createScope = function (signature, flags) { };
}
/**
 * @record
 */
export function Scope() { }
/** @type {?} */
let trace;
/** @type {?} */
let events;
/**
 * @return {?}
 */
export function detectWTF() {
    /** @type {?} */
    const wtf = ((/** @type {?} */ (global)))['wtf'];
    if (wtf) {
        trace = wtf['trace'];
        if (trace) {
            events = trace['events'];
            return true;
        }
    }
    return false;
}
/**
 * @param {?} signature
 * @param {?=} flags
 * @return {?}
 */
export function createScope(signature, flags = null) {
    return events.createScope(signature, flags);
}
/**
 * @template T
 * @param {?} scope
 * @param {?=} returnValue
 * @return {?}
 */
export function leave(scope, returnValue) {
    trace.leaveScope(scope, returnValue);
    return returnValue;
}
/**
 * @param {?} rangeType
 * @param {?} action
 * @return {?}
 */
export function startTimeRange(rangeType, action) {
    return trace.beginTimeRange(rangeType, action);
}
/**
 * @param {?} range
 * @return {?}
 */
export function endTimeRange(range) {
    trace.endTimeRange(range);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3RmX2ltcGwuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9jb3JlL3NyYy9wcm9maWxlL3d0Zl9pbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFNBQVMsQ0FBQzs7Ozs7OztBQU8vQixnQ0FBOEQ7Ozs7QUFFOUQsa0JBRUM7OztJQURDLG9CQUFhOzs7OztBQUdmLG9CQUtDOzs7SUFKQyx1QkFBZTs7Ozs7O0lBQ2YsK0RBQWtFOzs7Ozs7SUFDbEUsa0VBQXlEOzs7OztJQUN6RCxvREFBa0Q7Ozs7O0FBR3BELDJCQUF5Qjs7OztBQUV6QixxQkFFQzs7Ozs7OztJQURDLCtEQUFrRDs7Ozs7QUFHcEQsMkJBQW1FOztJQUUvRCxLQUFZOztJQUNaLE1BQWM7Ozs7QUFFbEIsTUFBTSxVQUFVLFNBQVM7O1VBQ2pCLEdBQUcsR0FBUSxDQUFDLG1CQUFBLE1BQU0sRUFBTyxDQUFtQixDQUFDLEtBQUssQ0FBQztJQUN6RCxJQUFJLEdBQUcsRUFBRTtRQUNQLEtBQUssR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckIsSUFBSSxLQUFLLEVBQUU7WUFDVCxNQUFNLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3pCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7S0FDRjtJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQzs7Ozs7O0FBRUQsTUFBTSxVQUFVLFdBQVcsQ0FBQyxTQUFpQixFQUFFLFFBQWEsSUFBSTtJQUM5RCxPQUFPLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzlDLENBQUM7Ozs7Ozs7QUFJRCxNQUFNLFVBQVUsS0FBSyxDQUFJLEtBQVksRUFBRSxXQUFpQjtJQUN0RCxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQztJQUNyQyxPQUFPLFdBQVcsQ0FBQztBQUNyQixDQUFDOzs7Ozs7QUFFRCxNQUFNLFVBQVUsY0FBYyxDQUFDLFNBQWlCLEVBQUUsTUFBYztJQUM5RCxPQUFPLEtBQUssQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ2pELENBQUM7Ozs7O0FBRUQsTUFBTSxVQUFVLFlBQVksQ0FBQyxLQUFZO0lBQ3ZDLEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDNUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtnbG9iYWx9IGZyb20gJy4uL3V0aWwnO1xuXG4vKipcbiAqIEEgc2NvcGUgZnVuY3Rpb24gZm9yIHRoZSBXZWIgVHJhY2luZyBGcmFtZXdvcmsgKFdURikuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFd0ZlNjb3BlRm4geyAoYXJnMD86IGFueSwgYXJnMT86IGFueSk6IGFueTsgfVxuXG5pbnRlcmZhY2UgV1RGIHtcbiAgdHJhY2U6IFRyYWNlO1xufVxuXG5pbnRlcmZhY2UgVHJhY2Uge1xuICBldmVudHM6IEV2ZW50cztcbiAgbGVhdmVTY29wZShzY29wZTogU2NvcGUsIHJldHVyblZhbHVlOiBhbnkpOiBhbnkgLyoqIFRPRE8gIzkxMDAgKi87XG4gIGJlZ2luVGltZVJhbmdlKHJhbmdlVHlwZTogc3RyaW5nLCBhY3Rpb246IHN0cmluZyk6IFJhbmdlO1xuICBlbmRUaW1lUmFuZ2UocmFuZ2U6IFJhbmdlKTogYW55IC8qKiBUT0RPICM5MTAwICovO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJhbmdlIHt9XG5cbmludGVyZmFjZSBFdmVudHMge1xuICBjcmVhdGVTY29wZShzaWduYXR1cmU6IHN0cmluZywgZmxhZ3M6IGFueSk6IFNjb3BlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNjb3BlIHsgKC4uLmFyZ3M6IGFueVtdIC8qKiBUT0RPICM5MTAwICovKTogYW55OyB9XG5cbmxldCB0cmFjZTogVHJhY2U7XG5sZXQgZXZlbnRzOiBFdmVudHM7XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXRlY3RXVEYoKTogYm9vbGVhbiB7XG4gIGNvbnN0IHd0ZjogV1RGID0gKGdsb2JhbCBhcyBhbnkgLyoqIFRPRE8gIzkxMDAgKi8pWyd3dGYnXTtcbiAgaWYgKHd0Zikge1xuICAgIHRyYWNlID0gd3RmWyd0cmFjZSddO1xuICAgIGlmICh0cmFjZSkge1xuICAgICAgZXZlbnRzID0gdHJhY2VbJ2V2ZW50cyddO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNjb3BlKHNpZ25hdHVyZTogc3RyaW5nLCBmbGFnczogYW55ID0gbnVsbCk6IGFueSB7XG4gIHJldHVybiBldmVudHMuY3JlYXRlU2NvcGUoc2lnbmF0dXJlLCBmbGFncyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsZWF2ZTxUPihzY29wZTogU2NvcGUpOiB2b2lkO1xuZXhwb3J0IGZ1bmN0aW9uIGxlYXZlPFQ+KHNjb3BlOiBTY29wZSwgcmV0dXJuVmFsdWU/OiBUKTogVDtcbmV4cG9ydCBmdW5jdGlvbiBsZWF2ZTxUPihzY29wZTogU2NvcGUsIHJldHVyblZhbHVlPzogYW55KTogYW55IHtcbiAgdHJhY2UubGVhdmVTY29wZShzY29wZSwgcmV0dXJuVmFsdWUpO1xuICByZXR1cm4gcmV0dXJuVmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydFRpbWVSYW5nZShyYW5nZVR5cGU6IHN0cmluZywgYWN0aW9uOiBzdHJpbmcpOiBSYW5nZSB7XG4gIHJldHVybiB0cmFjZS5iZWdpblRpbWVSYW5nZShyYW5nZVR5cGUsIGFjdGlvbik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmRUaW1lUmFuZ2UocmFuZ2U6IFJhbmdlKTogdm9pZCB7XG4gIHRyYWNlLmVuZFRpbWVSYW5nZShyYW5nZSk7XG59XG4iXX0=