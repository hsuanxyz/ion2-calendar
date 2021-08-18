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
/** @type {?} */
const __window = typeof window !== 'undefined' && window;
/** @type {?} */
const __self = typeof self !== 'undefined' && typeof WorkerGlobalScope !== 'undefined' &&
    self instanceof WorkerGlobalScope && self;
/** @type {?} */
const __global = typeof global !== 'undefined' && global;
// Check __global first, because in Node tests both __global and __window may be defined and _global
// should be __global in that case.
/** @type {?} */
const _global = __global || __window || __self;
/** @type {?} */
const promise = Promise.resolve(0);
/**
 * Attention: whenever providing a new value, be sure to add an
 * entry into the corresponding `....externs.js` file,
 * so that closure won't use that global for its purposes.
 */
export { _global as global };
/** @type {?} */
let _symbolIterator = null;
/**
 * @return {?}
 */
export function getSymbolIterator() {
    if (!_symbolIterator) {
        /** @type {?} */
        const Symbol = _global['Symbol'];
        if (Symbol && Symbol.iterator) {
            _symbolIterator = Symbol.iterator;
        }
        else {
            // es6-shim specific logic
            /** @type {?} */
            const keys = Object.getOwnPropertyNames(Map.prototype);
            for (let i = 0; i < keys.length; ++i) {
                /** @type {?} */
                const key = keys[i];
                if (key !== 'entries' && key !== 'size' &&
                    ((/** @type {?} */ (Map))).prototype[key] === Map.prototype['entries']) {
                    _symbolIterator = key;
                }
            }
        }
    }
    return _symbolIterator;
}
/**
 * @param {?} fn
 * @return {?}
 */
export function scheduleMicroTask(fn) {
    if (typeof Zone === 'undefined') {
        // use promise to schedule microTask instead of use Zone
        promise.then(() => { fn && fn.apply(null, null); });
    }
    else {
        Zone.current.scheduleMicroTask('scheduleMicrotask', fn);
    }
}
// JS has NaN !== NaN
/**
 * @param {?} a
 * @param {?} b
 * @return {?}
 */
export function looseIdentical(a, b) {
    return a === b || typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b);
}
/**
 * @param {?} token
 * @return {?}
 */
export function stringify(token) {
    if (typeof token === 'string') {
        return token;
    }
    if (token instanceof Array) {
        return '[' + token.map(stringify).join(', ') + ']';
    }
    if (token == null) {
        return '' + token;
    }
    if (token.overriddenName) {
        return `${token.overriddenName}`;
    }
    if (token.name) {
        return `${token.name}`;
    }
    /** @type {?} */
    const res = token.toString();
    if (res == null) {
        return '' + res;
    }
    /** @type {?} */
    const newLineIndex = res.indexOf('\n');
    return newLineIndex === -1 ? res : res.substring(0, newLineIndex);
}
/**
 * Convince closure compiler that the wrapped function has no side-effects.
 *
 * Closure compiler always assumes that `toString` has no side-effects. We use this quirk to
 * allow us to execute a function but have closure compiler mark the call as no-side-effects.
 * It is important that the return value for the `noSideEffects` function be assigned
 * to something which is retained otherwise the call to `noSideEffects` will be removed by closure
 * compiler.
 * @param {?} fn
 * @return {?}
 */
export function noSideEffects(fn) {
    return '' + { toString: fn };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2NvcmUvc3JjL3V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O01BY00sUUFBUSxHQUFHLE9BQU8sTUFBTSxLQUFLLFdBQVcsSUFBSSxNQUFNOztNQUNsRCxNQUFNLEdBQUcsT0FBTyxJQUFJLEtBQUssV0FBVyxJQUFJLE9BQU8saUJBQWlCLEtBQUssV0FBVztJQUNsRixJQUFJLFlBQVksaUJBQWlCLElBQUksSUFBSTs7TUFDdkMsUUFBUSxHQUFHLE9BQU8sTUFBTSxLQUFLLFdBQVcsSUFBSSxNQUFNOzs7O01BSWxELE9BQU8sR0FBMEIsUUFBUSxJQUFJLFFBQVEsSUFBSSxNQUFNOztNQUUvRCxPQUFPLEdBQWlCLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDOzs7Ozs7QUFNaEQsT0FBTyxFQUFDLE9BQU8sSUFBSSxNQUFNLEVBQUMsQ0FBQzs7SUFJdkIsZUFBZSxHQUFRLElBQUk7Ozs7QUFDL0IsTUFBTSxVQUFVLGlCQUFpQjtJQUMvQixJQUFJLENBQUMsZUFBZSxFQUFFOztjQUNkLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO1FBQ2hDLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUU7WUFDN0IsZUFBZSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7U0FDbkM7YUFBTTs7O2tCQUVDLElBQUksR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQztZQUN0RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRTs7c0JBQzlCLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixJQUFJLEdBQUcsS0FBSyxTQUFTLElBQUksR0FBRyxLQUFLLE1BQU07b0JBQ25DLENBQUMsbUJBQUEsR0FBRyxFQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRTtvQkFDNUQsZUFBZSxHQUFHLEdBQUcsQ0FBQztpQkFDdkI7YUFDRjtTQUNGO0tBQ0Y7SUFDRCxPQUFPLGVBQWUsQ0FBQztBQUN6QixDQUFDOzs7OztBQUVELE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxFQUFZO0lBQzVDLElBQUksT0FBTyxJQUFJLEtBQUssV0FBVyxFQUFFO1FBQy9CLHdEQUF3RDtRQUN4RCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3JEO1NBQU07UUFDTCxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQ3pEO0FBQ0gsQ0FBQzs7Ozs7OztBQUdELE1BQU0sVUFBVSxjQUFjLENBQUMsQ0FBTSxFQUFFLENBQU07SUFDM0MsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQyxLQUFLLFFBQVEsSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzRixDQUFDOzs7OztBQUVELE1BQU0sVUFBVSxTQUFTLENBQUMsS0FBVTtJQUNsQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtRQUM3QixPQUFPLEtBQUssQ0FBQztLQUNkO0lBRUQsSUFBSSxLQUFLLFlBQVksS0FBSyxFQUFFO1FBQzFCLE9BQU8sR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQztLQUNwRDtJQUVELElBQUksS0FBSyxJQUFJLElBQUksRUFBRTtRQUNqQixPQUFPLEVBQUUsR0FBRyxLQUFLLENBQUM7S0FDbkI7SUFFRCxJQUFJLEtBQUssQ0FBQyxjQUFjLEVBQUU7UUFDeEIsT0FBTyxHQUFHLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztLQUNsQztJQUVELElBQUksS0FBSyxDQUFDLElBQUksRUFBRTtRQUNkLE9BQU8sR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDeEI7O1VBRUssR0FBRyxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUU7SUFFNUIsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFO1FBQ2YsT0FBTyxFQUFFLEdBQUcsR0FBRyxDQUFDO0tBQ2pCOztVQUVLLFlBQVksR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztJQUN0QyxPQUFPLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUNwRSxDQUFDOzs7Ozs7Ozs7Ozs7QUFXRCxNQUFNLFVBQVUsYUFBYSxDQUFDLEVBQWM7SUFDMUMsT0FBTyxFQUFFLEdBQUcsRUFBQyxRQUFRLEVBQUUsRUFBRSxFQUFDLENBQUM7QUFDN0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gVE9ETyhqdGVwbGl0ejYwMik6IExvYWQgV29ya2VyR2xvYmFsU2NvcGUgZnJvbSBsaWIud2Vid29ya2VyLmQudHMgZmlsZSAjMzQ5MlxuZGVjbGFyZSB2YXIgV29ya2VyR2xvYmFsU2NvcGU6IGFueSAvKiogVE9ETyAjOTEwMCAqLztcbi8vIENvbW1vbkpTIC8gTm9kZSBoYXZlIGdsb2JhbCBjb250ZXh0IGV4cG9zZWQgYXMgXCJnbG9iYWxcIiB2YXJpYWJsZS5cbi8vIFdlIGRvbid0IHdhbnQgdG8gaW5jbHVkZSB0aGUgd2hvbGUgbm9kZS5kLnRzIHRoaXMgdGhpcyBjb21waWxhdGlvbiB1bml0IHNvIHdlJ2xsIGp1c3QgZmFrZVxuLy8gdGhlIGdsb2JhbCBcImdsb2JhbFwiIHZhciBmb3Igbm93LlxuZGVjbGFyZSB2YXIgZ2xvYmFsOiBhbnkgLyoqIFRPRE8gIzkxMDAgKi87XG5jb25zdCBfX3dpbmRvdyA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdztcbmNvbnN0IF9fc2VsZiA9IHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgV29ya2VyR2xvYmFsU2NvcGUgIT09ICd1bmRlZmluZWQnICYmXG4gICAgc2VsZiBpbnN0YW5jZW9mIFdvcmtlckdsb2JhbFNjb3BlICYmIHNlbGY7XG5jb25zdCBfX2dsb2JhbCA9IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnICYmIGdsb2JhbDtcblxuLy8gQ2hlY2sgX19nbG9iYWwgZmlyc3QsIGJlY2F1c2UgaW4gTm9kZSB0ZXN0cyBib3RoIF9fZ2xvYmFsIGFuZCBfX3dpbmRvdyBtYXkgYmUgZGVmaW5lZCBhbmQgX2dsb2JhbFxuLy8gc2hvdWxkIGJlIF9fZ2xvYmFsIGluIHRoYXQgY2FzZS5cbmNvbnN0IF9nbG9iYWw6IHtbbmFtZTogc3RyaW5nXTogYW55fSA9IF9fZ2xvYmFsIHx8IF9fd2luZG93IHx8IF9fc2VsZjtcblxuY29uc3QgcHJvbWlzZTogUHJvbWlzZTxhbnk+ID0gUHJvbWlzZS5yZXNvbHZlKDApO1xuLyoqXG4gKiBBdHRlbnRpb246IHdoZW5ldmVyIHByb3ZpZGluZyBhIG5ldyB2YWx1ZSwgYmUgc3VyZSB0byBhZGQgYW5cbiAqIGVudHJ5IGludG8gdGhlIGNvcnJlc3BvbmRpbmcgYC4uLi5leHRlcm5zLmpzYCBmaWxlLFxuICogc28gdGhhdCBjbG9zdXJlIHdvbid0IHVzZSB0aGF0IGdsb2JhbCBmb3IgaXRzIHB1cnBvc2VzLlxuICovXG5leHBvcnQge19nbG9iYWwgYXMgZ2xvYmFsfTtcblxuLy8gV2hlbiBTeW1ib2wuaXRlcmF0b3IgZG9lc24ndCBleGlzdCwgcmV0cmlldmVzIHRoZSBrZXkgdXNlZCBpbiBlczYtc2hpbVxuZGVjbGFyZSBjb25zdCBTeW1ib2w6IGFueTtcbmxldCBfc3ltYm9sSXRlcmF0b3I6IGFueSA9IG51bGw7XG5leHBvcnQgZnVuY3Rpb24gZ2V0U3ltYm9sSXRlcmF0b3IoKTogc3RyaW5nfHN5bWJvbCB7XG4gIGlmICghX3N5bWJvbEl0ZXJhdG9yKSB7XG4gICAgY29uc3QgU3ltYm9sID0gX2dsb2JhbFsnU3ltYm9sJ107XG4gICAgaWYgKFN5bWJvbCAmJiBTeW1ib2wuaXRlcmF0b3IpIHtcbiAgICAgIF9zeW1ib2xJdGVyYXRvciA9IFN5bWJvbC5pdGVyYXRvcjtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZXM2LXNoaW0gc3BlY2lmaWMgbG9naWNcbiAgICAgIGNvbnN0IGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhNYXAucHJvdG90eXBlKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBrZXkgPSBrZXlzW2ldO1xuICAgICAgICBpZiAoa2V5ICE9PSAnZW50cmllcycgJiYga2V5ICE9PSAnc2l6ZScgJiZcbiAgICAgICAgICAgIChNYXAgYXMgYW55KS5wcm90b3R5cGVba2V5XSA9PT0gTWFwLnByb3RvdHlwZVsnZW50cmllcyddKSB7XG4gICAgICAgICAgX3N5bWJvbEl0ZXJhdG9yID0ga2V5O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBfc3ltYm9sSXRlcmF0b3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzY2hlZHVsZU1pY3JvVGFzayhmbjogRnVuY3Rpb24pIHtcbiAgaWYgKHR5cGVvZiBab25lID09PSAndW5kZWZpbmVkJykge1xuICAgIC8vIHVzZSBwcm9taXNlIHRvIHNjaGVkdWxlIG1pY3JvVGFzayBpbnN0ZWFkIG9mIHVzZSBab25lXG4gICAgcHJvbWlzZS50aGVuKCgpID0+IHsgZm4gJiYgZm4uYXBwbHkobnVsbCwgbnVsbCk7IH0pO1xuICB9IGVsc2Uge1xuICAgIFpvbmUuY3VycmVudC5zY2hlZHVsZU1pY3JvVGFzaygnc2NoZWR1bGVNaWNyb3Rhc2snLCBmbik7XG4gIH1cbn1cblxuLy8gSlMgaGFzIE5hTiAhPT0gTmFOXG5leHBvcnQgZnVuY3Rpb24gbG9vc2VJZGVudGljYWwoYTogYW55LCBiOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIGEgPT09IGIgfHwgdHlwZW9mIGEgPT09ICdudW1iZXInICYmIHR5cGVvZiBiID09PSAnbnVtYmVyJyAmJiBpc05hTihhKSAmJiBpc05hTihiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ2lmeSh0b2tlbjogYW55KTogc3RyaW5nIHtcbiAgaWYgKHR5cGVvZiB0b2tlbiA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdG9rZW47XG4gIH1cblxuICBpZiAodG9rZW4gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIHJldHVybiAnWycgKyB0b2tlbi5tYXAoc3RyaW5naWZ5KS5qb2luKCcsICcpICsgJ10nO1xuICB9XG5cbiAgaWYgKHRva2VuID09IG51bGwpIHtcbiAgICByZXR1cm4gJycgKyB0b2tlbjtcbiAgfVxuXG4gIGlmICh0b2tlbi5vdmVycmlkZGVuTmFtZSkge1xuICAgIHJldHVybiBgJHt0b2tlbi5vdmVycmlkZGVuTmFtZX1gO1xuICB9XG5cbiAgaWYgKHRva2VuLm5hbWUpIHtcbiAgICByZXR1cm4gYCR7dG9rZW4ubmFtZX1gO1xuICB9XG5cbiAgY29uc3QgcmVzID0gdG9rZW4udG9TdHJpbmcoKTtcblxuICBpZiAocmVzID09IG51bGwpIHtcbiAgICByZXR1cm4gJycgKyByZXM7XG4gIH1cblxuICBjb25zdCBuZXdMaW5lSW5kZXggPSByZXMuaW5kZXhPZignXFxuJyk7XG4gIHJldHVybiBuZXdMaW5lSW5kZXggPT09IC0xID8gcmVzIDogcmVzLnN1YnN0cmluZygwLCBuZXdMaW5lSW5kZXgpO1xufVxuXG4vKipcbiAqIENvbnZpbmNlIGNsb3N1cmUgY29tcGlsZXIgdGhhdCB0aGUgd3JhcHBlZCBmdW5jdGlvbiBoYXMgbm8gc2lkZS1lZmZlY3RzLlxuICpcbiAqIENsb3N1cmUgY29tcGlsZXIgYWx3YXlzIGFzc3VtZXMgdGhhdCBgdG9TdHJpbmdgIGhhcyBubyBzaWRlLWVmZmVjdHMuIFdlIHVzZSB0aGlzIHF1aXJrIHRvXG4gKiBhbGxvdyB1cyB0byBleGVjdXRlIGEgZnVuY3Rpb24gYnV0IGhhdmUgY2xvc3VyZSBjb21waWxlciBtYXJrIHRoZSBjYWxsIGFzIG5vLXNpZGUtZWZmZWN0cy5cbiAqIEl0IGlzIGltcG9ydGFudCB0aGF0IHRoZSByZXR1cm4gdmFsdWUgZm9yIHRoZSBgbm9TaWRlRWZmZWN0c2AgZnVuY3Rpb24gYmUgYXNzaWduZWRcbiAqIHRvIHNvbWV0aGluZyB3aGljaCBpcyByZXRhaW5lZCBvdGhlcndpc2UgdGhlIGNhbGwgdG8gYG5vU2lkZUVmZmVjdHNgIHdpbGwgYmUgcmVtb3ZlZCBieSBjbG9zdXJlXG4gKiBjb21waWxlci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vU2lkZUVmZmVjdHMoZm46ICgpID0+IHZvaWQpOiBzdHJpbmcge1xuICByZXR1cm4gJycgKyB7dG9TdHJpbmc6IGZufTtcbn0iXX0=