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
import { ɵisObservable as isObservable, ɵisPromise as isPromise } from '@angular/core';
import { from, of } from 'rxjs';
import { concatAll, last as lastValue, map } from 'rxjs/operators';
import { PRIMARY_OUTLET } from '../shared';
/**
 * @param {?} a
 * @param {?} b
 * @return {?}
 */
export function shallowEqualArrays(a, b) {
    if (a.length !== b.length)
        return false;
    for (let i = 0; i < a.length; ++i) {
        if (!shallowEqual(a[i], b[i]))
            return false;
    }
    return true;
}
/**
 * @param {?} a
 * @param {?} b
 * @return {?}
 */
export function shallowEqual(a, b) {
    /** @type {?} */
    const k1 = Object.keys(a);
    /** @type {?} */
    const k2 = Object.keys(b);
    if (k1.length != k2.length) {
        return false;
    }
    /** @type {?} */
    let key;
    for (let i = 0; i < k1.length; i++) {
        key = k1[i];
        if (a[key] !== b[key]) {
            return false;
        }
    }
    return true;
}
/**
 * Flattens single-level nested arrays.
 * @template T
 * @param {?} arr
 * @return {?}
 */
export function flatten(arr) {
    return Array.prototype.concat.apply([], arr);
}
/**
 * Return the last element of an array.
 * @template T
 * @param {?} a
 * @return {?}
 */
export function last(a) {
    return a.length > 0 ? a[a.length - 1] : null;
}
/**
 * Verifys all booleans in an array are `true`.
 * @param {?} bools
 * @return {?}
 */
export function and(bools) {
    return !bools.some(v => !v);
}
/**
 * @template K, V
 * @param {?} map
 * @param {?} callback
 * @return {?}
 */
export function forEach(map, callback) {
    for (const prop in map) {
        if (map.hasOwnProperty(prop)) {
            callback(map[prop], prop);
        }
    }
}
/**
 * @template A, B
 * @param {?} obj
 * @param {?} fn
 * @return {?}
 */
export function waitForMap(obj, fn) {
    if (Object.keys(obj).length === 0) {
        return of({});
    }
    /** @type {?} */
    const waitHead = [];
    /** @type {?} */
    const waitTail = [];
    /** @type {?} */
    const res = {};
    forEach(obj, (a, k) => {
        /** @type {?} */
        const mapped = fn(k, a).pipe(map((r) => res[k] = r));
        if (k === PRIMARY_OUTLET) {
            waitHead.push(mapped);
        }
        else {
            waitTail.push(mapped);
        }
    });
    // Closure compiler has problem with using spread operator here. So just using Array.concat.
    return of.apply(null, waitHead.concat(waitTail)).pipe(concatAll(), lastValue(), map(() => res));
}
/**
 * @template T
 * @param {?} value
 * @return {?}
 */
export function wrapIntoObservable(value) {
    if (isObservable(value)) {
        return value;
    }
    if (isPromise(value)) {
        // Use `Promise.resolve()` to wrap promise-like instances.
        // Required ie when a Resolver returns a AngularJS `$q` promise to correctly trigger the
        // change detection.
        return from(Promise.resolve(value));
    }
    return of(value);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL3JvdXRlci9zcmMvdXRpbHMvY29sbGVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBa0IsYUFBYSxJQUFJLFlBQVksRUFBRSxVQUFVLElBQUksU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3RHLE9BQU8sRUFBYSxJQUFJLEVBQUUsRUFBRSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBQyxTQUFTLEVBQUUsSUFBSSxJQUFJLFNBQVMsRUFBRSxHQUFHLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUVqRSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sV0FBVyxDQUFDOzs7Ozs7QUFFekMsTUFBTSxVQUFVLGtCQUFrQixDQUFDLENBQVEsRUFBRSxDQUFRO0lBQ25ELElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsTUFBTTtRQUFFLE9BQU8sS0FBSyxDQUFDO0lBQ3hDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFO1FBQ2pDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDO0tBQzdDO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDOzs7Ozs7QUFFRCxNQUFNLFVBQVUsWUFBWSxDQUFDLENBQXFCLEVBQUUsQ0FBcUI7O1VBQ2pFLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7VUFDbkIsRUFBRSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3pCLElBQUksRUFBRSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFF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UUFDMUQsd0ZBQXdGO1FBQ3hGLG9CQUFvQjtRQUNwQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDckM7SUFFRCxPQUFPLEVBQUUsQ0FBRSxLQUFLLENBQUMsQ0FBQztBQUNwQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge05nTW9kdWxlRmFjdG9yeSwgybVpc09ic2VydmFibGUgYXMgaXNPYnNlcnZhYmxlLCDJtWlzUHJvbWlzZSBhcyBpc1Byb21pc2V9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBmcm9tLCBvZiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtjb25jYXRBbGwsIGxhc3QgYXMgbGFzdFZhbHVlLCBtYXB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtQUklNQVJZX09VVExFVH0gZnJvbSAnLi4vc2hhcmVkJztcblxuZXhwb3J0IGZ1bmN0aW9uIHNoYWxsb3dFcXVhbEFycmF5cyhhOiBhbnlbXSwgYjogYW55W10pOiBib29sZWFuIHtcbiAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGEubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoIXNoYWxsb3dFcXVhbChhW2ldLCBiW2ldKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hhbGxvd0VxdWFsKGE6IHtbeDogc3RyaW5nXTogYW55fSwgYjoge1t4OiBzdHJpbmddOiBhbnl9KTogYm9vbGVhbiB7XG4gIGNvbnN0IGsxID0gT2JqZWN0LmtleXMoYSk7XG4gIGNvbnN0IGsyID0gT2JqZWN0LmtleXMoYik7XG4gIGlmIChrMS5sZW5ndGggIT0gazIubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGxldCBrZXk6IHN0cmluZztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBrMS5sZW5ndGg7IGkrKykge1xuICAgIGtleSA9IGsxW2ldO1xuICAgIGlmIChhW2tleV0gIT09IGJba2V5XSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBGbGF0dGVucyBzaW5nbGUtbGV2ZWwgbmVzdGVkIGFycmF5cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZsYXR0ZW48VD4oYXJyOiBUW11bXSk6IFRbXSB7XG4gIHJldHVybiBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCBhcnIpO1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgbGFzdCBlbGVtZW50IG9mIGFuIGFycmF5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gbGFzdDxUPihhOiBUW10pOiBUfG51bGwge1xuICByZXR1cm4gYS5sZW5ndGggPiAwID8gYVthLmxlbmd0aCAtIDFdIDogbnVsbDtcbn1cblxuLyoqXG4gKiBWZXJpZnlzIGFsbCBib29sZWFucyBpbiBhbiBhcnJheSBhcmUgYHRydWVgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYW5kKGJvb2xzOiBib29sZWFuW10pOiBib29sZWFuIHtcbiAgcmV0dXJuICFib29scy5zb21lKHYgPT4gIXYpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9yRWFjaDxLLCBWPihtYXA6IHtba2V5OiBzdHJpbmddOiBWfSwgY2FsbGJhY2s6ICh2OiBWLCBrOiBzdHJpbmcpID0+IHZvaWQpOiB2b2lkIHtcbiAgZm9yIChjb25zdCBwcm9wIGluIG1hcCkge1xuICAgIGlmIChtYXAuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgIGNhbGxiYWNrKG1hcFtwcm9wXSwgcHJvcCk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3YWl0Rm9yTWFwPEEsIEI+KFxuICAgIG9iajoge1trOiBzdHJpbmddOiBBfSwgZm46IChrOiBzdHJpbmcsIGE6IEEpID0+IE9ic2VydmFibGU8Qj4pOiBPYnNlcnZhYmxlPHtbazogc3RyaW5nXTogQn0+IHtcbiAgaWYgKE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG9mICh7fSk7XG4gIH1cblxuICBjb25zdCB3YWl0SGVhZDogT2JzZXJ2YWJsZTxCPltdID0gW107XG4gIGNvbnN0IHdhaXRUYWlsOiBPYnNlcnZhYmxlPEI+W10gPSBbXTtcbiAgY29uc3QgcmVzOiB7W2s6IHN0cmluZ106IEJ9ID0ge307XG5cbiAgZm9yRWFjaChvYmosIChhOiBBLCBrOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBtYXBwZWQgPSBmbihrLCBhKS5waXBlKG1hcCgocjogQikgPT4gcmVzW2tdID0gcikpO1xuICAgIGlmIChrID09PSBQUklNQVJZX09VVExFVCkge1xuICAgICAgd2FpdEhlYWQucHVzaChtYXBwZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3YWl0VGFpbC5wdXNoKG1hcHBlZCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBDbG9zdXJlIGNvbXBpbGVyIGhhcyBwcm9ibGVtIHdpdGggdXNpbmcgc3ByZWFkIG9wZXJhdG9yIGhlcmUuIFNvIGp1c3QgdXNpbmcgQXJyYXkuY29uY2F0LlxuICByZXR1cm4gb2YgLmFwcGx5KG51bGwsIHdhaXRIZWFkLmNvbmNhdCh3YWl0VGFpbCkpLnBpcGUoY29uY2F0QWxsKCksIGxhc3RWYWx1ZSgpLCBtYXAoKCkgPT4gcmVzKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwSW50b09ic2VydmFibGU8VD4odmFsdWU6IFQgfCBOZ01vZHVsZUZhY3Rvcnk8VD58IFByb21pc2U8VD58IE9ic2VydmFibGU8VD4pIHtcbiAgaWYgKGlzT2JzZXJ2YWJsZSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICBpZiAoaXNQcm9taXNlKHZhbHVlKSkge1xuICAgIC8vIFVzZSBgUHJvbWlzZS5yZXNvbHZlKClgIHRvIHdyYXAgcHJvbWlzZS1saWtlIGluc3RhbmNlcy5cbiAgICAvLyBSZXF1aXJlZCBpZSB3aGVuIGEgUmVzb2x2ZXIgcmV0dXJucyBhIEFuZ3VsYXJKUyBgJHFgIHByb21pc2UgdG8gY29ycmVjdGx5IHRyaWdnZXIgdGhlXG4gICAgLy8gY2hhbmdlIGRldGVjdGlvbi5cbiAgICByZXR1cm4gZnJvbShQcm9taXNlLnJlc29sdmUodmFsdWUpKTtcbiAgfVxuXG4gIHJldHVybiBvZiAodmFsdWUpO1xufVxuIl19