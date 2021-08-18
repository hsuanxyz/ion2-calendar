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
import { stringify } from '../util';
import { getClosureSafeProperty } from '../util/property';
/**
 * An interface that a function passed into {\@link forwardRef} has to implement.
 *
 * \@usageNotes
 * ### Example
 *
 * {\@example core/di/ts/forward_ref/forward_ref_spec.ts region='forward_ref_fn'}
 * \@publicApi
 * @record
 */
export function ForwardRefFn() { }
/** @type {?} */
const __forward_ref__ = getClosureSafeProperty({ __forward_ref__: getClosureSafeProperty });
/**
 * Allows to refer to references which are not yet defined.
 *
 * For instance, `forwardRef` is used when the `token` which we need to refer to for the purposes of
 * DI is declared, but not yet defined. It is also used when the `token` which we use when creating
 * a query is not yet defined.
 *
 * \@usageNotes
 * ### Example
 * {\@example core/di/ts/forward_ref/forward_ref_spec.ts region='forward_ref'}
 * \@publicApi
 * @param {?} forwardRefFn
 * @return {?}
 */
export function forwardRef(forwardRefFn) {
    ((/** @type {?} */ (forwardRefFn))).__forward_ref__ = forwardRef;
    ((/** @type {?} */ (forwardRefFn))).toString = function () { return stringify(this()); };
    return ((/** @type {?} */ ((/** @type {?} */ (forwardRefFn)))));
}
/**
 * Lazily retrieves the reference value from a forwardRef.
 *
 * Acts as the identity function when given a non-forward-ref value.
 *
 * \@usageNotes
 * ### Example
 *
 * {\@example core/di/ts/forward_ref/forward_ref_spec.ts region='resolve_forward_ref'}
 *
 * @see `forwardRef`
 * \@publicApi
 * @template T
 * @param {?} type
 * @return {?}
 */
export function resolveForwardRef(type) {
    /** @type {?} */
    const fn = type;
    if (typeof fn === 'function' && fn.hasOwnProperty(__forward_ref__) &&
        fn.__forward_ref__ === forwardRef) {
        return fn();
    }
    else {
        return type;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9yd2FyZF9yZWYuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9jb3JlL3NyYy9kaS9mb3J3YXJkX3JlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVNBLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDbEMsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sa0JBQWtCLENBQUM7Ozs7Ozs7Ozs7O0FBYXhELGtDQUEwQzs7TUFFcEMsZUFBZSxHQUFHLHNCQUFzQixDQUFDLEVBQUMsZUFBZSxFQUFFLHNCQUFzQixFQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQWN6RixNQUFNLFVBQVUsVUFBVSxDQUFDLFlBQTBCO0lBQ25ELENBQUMsbUJBQUssWUFBWSxFQUFBLENBQUMsQ0FBQyxlQUFlLEdBQUcsVUFBVSxDQUFDO0lBQ2pELENBQUMsbUJBQUssWUFBWSxFQUFBLENBQUMsQ0FBQyxRQUFRLEdBQUcsY0FBYSxPQUFPLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hFLE9BQU8sQ0FBQyxtQkFBVyxtQkFBSyxZQUFZLEVBQUEsRUFBQSxDQUFDLENBQUM7QUFDeEMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFlRCxNQUFNLFVBQVUsaUJBQWlCLENBQUksSUFBTzs7VUFDcEMsRUFBRSxHQUFRLElBQUk7SUFDcEIsSUFBSSxPQUFPLEVBQUUsS0FBSyxVQUFVLElBQUksRUFBRSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUM7UUFDOUQsRUFBRSxDQUFDLGVBQWUsS0FBSyxVQUFVLEVBQUU7UUFDckMsT0FBTyxFQUFFLEVBQUUsQ0FBQztLQUNiO1NBQU07UUFDTCxPQUFPLElBQUksQ0FBQztLQUNiO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtUeXBlfSBmcm9tICcuLi90eXBlJztcbmltcG9ydCB7c3RyaW5naWZ5fSBmcm9tICcuLi91dGlsJztcbmltcG9ydCB7Z2V0Q2xvc3VyZVNhZmVQcm9wZXJ0eX0gZnJvbSAnLi4vdXRpbC9wcm9wZXJ0eSc7XG5cblxuXG4vKipcbiAqIEFuIGludGVyZmFjZSB0aGF0IGEgZnVuY3Rpb24gcGFzc2VkIGludG8ge0BsaW5rIGZvcndhcmRSZWZ9IGhhcyB0byBpbXBsZW1lbnQuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvcmUvZGkvdHMvZm9yd2FyZF9yZWYvZm9yd2FyZF9yZWZfc3BlYy50cyByZWdpb249J2ZvcndhcmRfcmVmX2ZuJ31cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBGb3J3YXJkUmVmRm4geyAoKTogYW55OyB9XG5cbmNvbnN0IF9fZm9yd2FyZF9yZWZfXyA9IGdldENsb3N1cmVTYWZlUHJvcGVydHkoe19fZm9yd2FyZF9yZWZfXzogZ2V0Q2xvc3VyZVNhZmVQcm9wZXJ0eX0pO1xuXG4vKipcbiAqIEFsbG93cyB0byByZWZlciB0byByZWZlcmVuY2VzIHdoaWNoIGFyZSBub3QgeWV0IGRlZmluZWQuXG4gKlxuICogRm9yIGluc3RhbmNlLCBgZm9yd2FyZFJlZmAgaXMgdXNlZCB3aGVuIHRoZSBgdG9rZW5gIHdoaWNoIHdlIG5lZWQgdG8gcmVmZXIgdG8gZm9yIHRoZSBwdXJwb3NlcyBvZlxuICogREkgaXMgZGVjbGFyZWQsIGJ1dCBub3QgeWV0IGRlZmluZWQuIEl0IGlzIGFsc28gdXNlZCB3aGVuIHRoZSBgdG9rZW5gIHdoaWNoIHdlIHVzZSB3aGVuIGNyZWF0aW5nXG4gKiBhIHF1ZXJ5IGlzIG5vdCB5ZXQgZGVmaW5lZC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVcbiAqIHtAZXhhbXBsZSBjb3JlL2RpL3RzL2ZvcndhcmRfcmVmL2ZvcndhcmRfcmVmX3NwZWMudHMgcmVnaW9uPSdmb3J3YXJkX3JlZid9XG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3J3YXJkUmVmKGZvcndhcmRSZWZGbjogRm9yd2FyZFJlZkZuKTogVHlwZTxhbnk+IHtcbiAgKDxhbnk+Zm9yd2FyZFJlZkZuKS5fX2ZvcndhcmRfcmVmX18gPSBmb3J3YXJkUmVmO1xuICAoPGFueT5mb3J3YXJkUmVmRm4pLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7IHJldHVybiBzdHJpbmdpZnkodGhpcygpKTsgfTtcbiAgcmV0dXJuICg8VHlwZTxhbnk+Pjxhbnk+Zm9yd2FyZFJlZkZuKTtcbn1cblxuLyoqXG4gKiBMYXppbHkgcmV0cmlldmVzIHRoZSByZWZlcmVuY2UgdmFsdWUgZnJvbSBhIGZvcndhcmRSZWYuXG4gKlxuICogQWN0cyBhcyB0aGUgaWRlbnRpdHkgZnVuY3Rpb24gd2hlbiBnaXZlbiBhIG5vbi1mb3J3YXJkLXJlZiB2YWx1ZS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9kaS90cy9mb3J3YXJkX3JlZi9mb3J3YXJkX3JlZl9zcGVjLnRzIHJlZ2lvbj0ncmVzb2x2ZV9mb3J3YXJkX3JlZid9XG4gKlxuICogQHNlZSBgZm9yd2FyZFJlZmBcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVGb3J3YXJkUmVmPFQ+KHR5cGU6IFQpOiBUIHtcbiAgY29uc3QgZm46IGFueSA9IHR5cGU7XG4gIGlmICh0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicgJiYgZm4uaGFzT3duUHJvcGVydHkoX19mb3J3YXJkX3JlZl9fKSAmJlxuICAgICAgZm4uX19mb3J3YXJkX3JlZl9fID09PSBmb3J3YXJkUmVmKSB7XG4gICAgcmV0dXJuIGZuKCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHR5cGU7XG4gIH1cbn1cbiJdfQ==