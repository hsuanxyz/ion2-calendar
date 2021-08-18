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
import { defineInjectable } from '../../di/defs';
import { Optional, SkipSelf } from '../../di/metadata';
import { DefaultIterableDifferFactory } from '../differs/default_iterable_differ';
/**
 * A strategy for tracking changes over time to an iterable. Used by {\@link NgForOf} to
 * respond to changes in an iterable by effecting equivalent changes in the DOM.
 *
 * \@publicApi
 * @record
 * @template V
 */
export function IterableDiffer() { }
if (false) {
    /**
     * Compute a difference between the previous state and the new `object` state.
     *
     * @param {?} object containing the new value.
     * @return {?} an object describing the difference. The return value is only valid until the next
     * `diff()` invocation.
     */
    IterableDiffer.prototype.diff = function (object) { };
}
/**
 * An object describing the changes in the `Iterable` collection since last time
 * `IterableDiffer#diff()` was invoked.
 *
 * \@publicApi
 * @record
 * @template V
 */
export function IterableChanges() { }
if (false) {
    /**
     * Iterate over all changes. `IterableChangeRecord` will contain information about changes
     * to each item.
     * @param {?} fn
     * @return {?}
     */
    IterableChanges.prototype.forEachItem = function (fn) { };
    /**
     * Iterate over a set of operations which when applied to the original `Iterable` will produce the
     * new `Iterable`.
     *
     * NOTE: These are not necessarily the actual operations which were applied to the original
     * `Iterable`, rather these are a set of computed operations which may not be the same as the
     * ones applied.
     *
     * @param {?} fn
     * @return {?}
     */
    IterableChanges.prototype.forEachOperation = function (fn) { };
    /**
     * Iterate over changes in the order of original `Iterable` showing where the original items
     * have moved.
     * @param {?} fn
     * @return {?}
     */
    IterableChanges.prototype.forEachPreviousItem = function (fn) { };
    /**
     * Iterate over all added items.
     * @param {?} fn
     * @return {?}
     */
    IterableChanges.prototype.forEachAddedItem = function (fn) { };
    /**
     * Iterate over all moved items.
     * @param {?} fn
     * @return {?}
     */
    IterableChanges.prototype.forEachMovedItem = function (fn) { };
    /**
     * Iterate over all removed items.
     * @param {?} fn
     * @return {?}
     */
    IterableChanges.prototype.forEachRemovedItem = function (fn) { };
    /**
     * Iterate over all items which had their identity (as computed by the `TrackByFunction`)
     * changed.
     * @param {?} fn
     * @return {?}
     */
    IterableChanges.prototype.forEachIdentityChange = function (fn) { };
}
/**
 * Record representing the item change information.
 *
 * \@publicApi
 * @record
 * @template V
 */
export function IterableChangeRecord() { }
if (false) {
    /**
     * Current index of the item in `Iterable` or null if removed.
     * @type {?}
     */
    IterableChangeRecord.prototype.currentIndex;
    /**
     * Previous index of the item in `Iterable` or null if added.
     * @type {?}
     */
    IterableChangeRecord.prototype.previousIndex;
    /**
     * The item.
     * @type {?}
     */
    IterableChangeRecord.prototype.item;
    /**
     * Track by identity as computed by the `TrackByFunction`.
     * @type {?}
     */
    IterableChangeRecord.prototype.trackById;
}
/**
 * @deprecated v4.0.0 - Use IterableChangeRecord instead.
 * \@publicApi
 * @record
 * @template V
 */
export function CollectionChangeRecord() { }
/**
 * An optional function passed into {\@link NgForOf} that defines how to track
 * items in an iterable (e.g. fby index or id)
 *
 * \@publicApi
 * @record
 * @template T
 */
export function TrackByFunction() { }
/**
 * Provides a factory for {\@link IterableDiffer}.
 *
 * \@publicApi
 * @record
 */
export function IterableDifferFactory() { }
if (false) {
    /**
     * @param {?} objects
     * @return {?}
     */
    IterableDifferFactory.prototype.supports = function (objects) { };
    /**
     * @template V
     * @param {?=} trackByFn
     * @return {?}
     */
    IterableDifferFactory.prototype.create = function (trackByFn) { };
}
/**
 * A repository of different iterable diffing strategies used by NgFor, NgClass, and others.
 *
 * \@publicApi
 */
export class IterableDiffers {
    /**
     * @param {?} factories
     */
    constructor(factories) { this.factories = factories; }
    /**
     * @param {?} factories
     * @param {?=} parent
     * @return {?}
     */
    static create(factories, parent) {
        if (parent != null) {
            /** @type {?} */
            const copied = parent.factories.slice();
            factories = factories.concat(copied);
        }
        return new IterableDiffers(factories);
    }
    /**
     * Takes an array of {\@link IterableDifferFactory} and returns a provider used to extend the
     * inherited {\@link IterableDiffers} instance with the provided factories and return a new
     * {\@link IterableDiffers} instance.
     *
     * \@usageNotes
     * ### Example
     *
     * The following example shows how to extend an existing list of factories,
     * which will only be applied to the injector for this component and its children.
     * This step is all that's required to make a new {\@link IterableDiffer} available.
     *
     * ```
     * \@Component({
     *   viewProviders: [
     *     IterableDiffers.extend([new ImmutableListDiffer()])
     *   ]
     * })
     * ```
     * @param {?} factories
     * @return {?}
     */
    static extend(factories) {
        return {
            provide: IterableDiffers,
            useFactory: (parent) => {
                if (!parent) {
                    // Typically would occur when calling IterableDiffers.extend inside of dependencies passed
                    // to
                    // bootstrap(), which would override default pipes instead of extending them.
                    throw new Error('Cannot extend IterableDiffers without a parent injector');
                }
                return IterableDiffers.create(factories, parent);
            },
            // Dependency technically isn't optional, but we can provide a better error message this way.
            deps: [[IterableDiffers, new SkipSelf(), new Optional()]]
        };
    }
    /**
     * @param {?} iterable
     * @return {?}
     */
    find(iterable) {
        /** @type {?} */
        const factory = this.factories.find(f => f.supports(iterable));
        if (factory != null) {
            return factory;
        }
        else {
            throw new Error(`Cannot find a differ supporting object '${iterable}' of type '${getTypeNameForDebugging(iterable)}'`);
        }
    }
}
/** @nocollapse */
/** @nocollapse */ IterableDiffers.ngInjectableDef = defineInjectable({
    providedIn: 'root',
    factory: () => new IterableDiffers([new DefaultIterableDifferFactory()])
});
if (false) {
    /**
     * @nocollapse
     * @type {?}
     */
    IterableDiffers.ngInjectableDef;
    /**
     * @deprecated v4.0.0 - Should be private
     * @type {?}
     */
    IterableDiffers.prototype.factories;
}
/**
 * @param {?} type
 * @return {?}
 */
export function getTypeNameForDebugging(type) {
    return type['name'] || typeof type;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXRlcmFibGVfZGlmZmVycy5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2NvcmUvc3JjL2NoYW5nZV9kZXRlY3Rpb24vZGlmZmVycy9pdGVyYWJsZV9kaWZmZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQy9DLE9BQU8sRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFFckQsT0FBTyxFQUFDLDRCQUE0QixFQUFDLE1BQU0sb0NBQW9DLENBQUM7Ozs7Ozs7OztBQWdCaEYsb0NBU0M7Ozs7Ozs7OztJQURDLHNEQUFxRDs7Ozs7Ozs7OztBQVN2RCxxQ0E4Q0M7Ozs7Ozs7O0lBekNDLDBEQUFpRTs7Ozs7Ozs7Ozs7O0lBa0JqRSwrREFHbUQ7Ozs7Ozs7SUFNbkQsa0VBQXlFOzs7Ozs7SUFHekUsK0RBQXNFOzs7Ozs7SUFHdEUsK0RBQXNFOzs7Ozs7SUFHdEUsaUVBQXdFOzs7Ozs7O0lBSXhFLG9FQUEyRTs7Ozs7Ozs7O0FBUTdFLDBDQVlDOzs7Ozs7SUFWQyw0Q0FBbUM7Ozs7O0lBR25DLDZDQUFvQzs7Ozs7SUFHcEMsb0NBQWlCOzs7OztJQUdqQix5Q0FBd0I7Ozs7Ozs7O0FBTzFCLDRDQUE2RTs7Ozs7Ozs7O0FBUTdFLHFDQUFzRTs7Ozs7OztBQU90RSwyQ0FHQzs7Ozs7O0lBRkMsa0VBQWdDOzs7Ozs7SUFDaEMsa0VBQTZEOzs7Ozs7O0FBUS9ELE1BQU0sT0FBTyxlQUFlOzs7O0lBVzFCLFlBQVksU0FBa0MsSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUM7Ozs7OztJQUUvRSxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQWtDLEVBQUUsTUFBd0I7UUFDeEUsSUFBSSxNQUFNLElBQUksSUFBSSxFQUFFOztrQkFDWixNQUFNLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUU7WUFDdkMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDdEM7UUFFRCxPQUFPLElBQUksZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBc0JELE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBa0M7UUFDOUMsT0FBTztZQUNMLE9BQU8sRUFBRSxlQUFlO1lBQ3hCLFVBQVUsRUFBRSxDQUFDLE1BQXVCLEVBQUUsRUFBRTtnQkFDdEMsSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFDWCwwRkFBMEY7b0JBQzFGLEtBQUs7b0JBQ0wsNkVBQTZFO29CQUM3RSxNQUFNLElBQUksS0FBSyxDQUFDLHlEQUF5RCxDQUFDLENBQUM7aUJBQzVFO2dCQUNELE9BQU8sZUFBZSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbkQsQ0FBQzs7WUFFRCxJQUFJLEVBQUUsQ0FBQyxDQUFDLGVBQWUsRUFBRSxJQUFJLFFBQVEsRUFBRSxFQUFFLElBQUksUUFBUSxFQUFFLENBQUMsQ0FBQztTQUMxRCxDQUFDO0lBQ0osQ0FBQzs7Ozs7SUFFRCxJQUFJLENBQUMsUUFBYTs7Y0FDVixPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlELElBQUksT0FBTyxJQUFJLElBQUksRUFBRTtZQUNuQixPQUFPLE9BQU8sQ0FBQztTQUNoQjthQUFNO1lBQ0wsTUFBTSxJQUFJLEtBQUssQ0FDWCwyQ0FBMkMsUUFBUSxjQUFjLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUM1RztJQUNILENBQUM7OztBQWpFTSwrQkFBZSxHQUFHLGdCQUFnQixDQUFDO0lBQ3hDLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLGVBQWUsQ0FBQyxDQUFDLElBQUksNEJBQTRCLEVBQUUsQ0FBQyxDQUFDO0NBQ3pFLENBQUMsQ0FBQzs7Ozs7O0lBSEgsZ0NBR0c7Ozs7O0lBS0gsb0NBQW1DOzs7Ozs7QUE0RHJDLE1BQU0sVUFBVSx1QkFBdUIsQ0FBQyxJQUFTO0lBQy9DLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sSUFBSSxDQUFDO0FBQ3JDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZGVmaW5lSW5qZWN0YWJsZX0gZnJvbSAnLi4vLi4vZGkvZGVmcyc7XG5pbXBvcnQge09wdGlvbmFsLCBTa2lwU2VsZn0gZnJvbSAnLi4vLi4vZGkvbWV0YWRhdGEnO1xuaW1wb3J0IHtTdGF0aWNQcm92aWRlcn0gZnJvbSAnLi4vLi4vZGkvcHJvdmlkZXInO1xuaW1wb3J0IHtEZWZhdWx0SXRlcmFibGVEaWZmZXJGYWN0b3J5fSBmcm9tICcuLi9kaWZmZXJzL2RlZmF1bHRfaXRlcmFibGVfZGlmZmVyJztcblxuXG4vKipcbiAqIEEgdHlwZSBkZXNjcmliaW5nIHN1cHBvcnRlZCBpdGVyYWJsZSB0eXBlcy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIE5nSXRlcmFibGU8VD4gPSBBcnJheTxUPnwgSXRlcmFibGU8VD47XG5cbi8qKlxuICogQSBzdHJhdGVneSBmb3IgdHJhY2tpbmcgY2hhbmdlcyBvdmVyIHRpbWUgdG8gYW4gaXRlcmFibGUuIFVzZWQgYnkge0BsaW5rIE5nRm9yT2Z9IHRvXG4gKiByZXNwb25kIHRvIGNoYW5nZXMgaW4gYW4gaXRlcmFibGUgYnkgZWZmZWN0aW5nIGVxdWl2YWxlbnQgY2hhbmdlcyBpbiB0aGUgRE9NLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJdGVyYWJsZURpZmZlcjxWPiB7XG4gIC8qKlxuICAgKiBDb21wdXRlIGEgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBwcmV2aW91cyBzdGF0ZSBhbmQgdGhlIG5ldyBgb2JqZWN0YCBzdGF0ZS5cbiAgICpcbiAgICogQHBhcmFtIG9iamVjdCBjb250YWluaW5nIHRoZSBuZXcgdmFsdWUuXG4gICAqIEByZXR1cm5zIGFuIG9iamVjdCBkZXNjcmliaW5nIHRoZSBkaWZmZXJlbmNlLiBUaGUgcmV0dXJuIHZhbHVlIGlzIG9ubHkgdmFsaWQgdW50aWwgdGhlIG5leHRcbiAgICogYGRpZmYoKWAgaW52b2NhdGlvbi5cbiAgICovXG4gIGRpZmYob2JqZWN0OiBOZ0l0ZXJhYmxlPFY+KTogSXRlcmFibGVDaGFuZ2VzPFY+fG51bGw7XG59XG5cbi8qKlxuICogQW4gb2JqZWN0IGRlc2NyaWJpbmcgdGhlIGNoYW5nZXMgaW4gdGhlIGBJdGVyYWJsZWAgY29sbGVjdGlvbiBzaW5jZSBsYXN0IHRpbWVcbiAqIGBJdGVyYWJsZURpZmZlciNkaWZmKClgIHdhcyBpbnZva2VkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJdGVyYWJsZUNoYW5nZXM8Vj4ge1xuICAvKipcbiAgICogSXRlcmF0ZSBvdmVyIGFsbCBjaGFuZ2VzLiBgSXRlcmFibGVDaGFuZ2VSZWNvcmRgIHdpbGwgY29udGFpbiBpbmZvcm1hdGlvbiBhYm91dCBjaGFuZ2VzXG4gICAqIHRvIGVhY2ggaXRlbS5cbiAgICovXG4gIGZvckVhY2hJdGVtKGZuOiAocmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZDxWPikgPT4gdm9pZCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgb3ZlciBhIHNldCBvZiBvcGVyYXRpb25zIHdoaWNoIHdoZW4gYXBwbGllZCB0byB0aGUgb3JpZ2luYWwgYEl0ZXJhYmxlYCB3aWxsIHByb2R1Y2UgdGhlXG4gICAqIG5ldyBgSXRlcmFibGVgLlxuICAgKlxuICAgKiBOT1RFOiBUaGVzZSBhcmUgbm90IG5lY2Vzc2FyaWx5IHRoZSBhY3R1YWwgb3BlcmF0aW9ucyB3aGljaCB3ZXJlIGFwcGxpZWQgdG8gdGhlIG9yaWdpbmFsXG4gICAqIGBJdGVyYWJsZWAsIHJhdGhlciB0aGVzZSBhcmUgYSBzZXQgb2YgY29tcHV0ZWQgb3BlcmF0aW9ucyB3aGljaCBtYXkgbm90IGJlIHRoZSBzYW1lIGFzIHRoZVxuICAgKiBvbmVzIGFwcGxpZWQuXG4gICAqXG4gICAqIEBwYXJhbSByZWNvcmQgQSBjaGFuZ2Ugd2hpY2ggbmVlZHMgdG8gYmUgYXBwbGllZFxuICAgKiBAcGFyYW0gcHJldmlvdXNJbmRleCBUaGUgYEl0ZXJhYmxlQ2hhbmdlUmVjb3JkI3ByZXZpb3VzSW5kZXhgIG9mIHRoZSBgcmVjb3JkYCByZWZlcnMgdG8gdGhlXG4gICAqICAgICAgICBvcmlnaW5hbCBgSXRlcmFibGVgIGxvY2F0aW9uLCB3aGVyZSBhcyBgcHJldmlvdXNJbmRleGAgcmVmZXJzIHRvIHRoZSB0cmFuc2llbnQgbG9jYXRpb25cbiAgICogICAgICAgIG9mIHRoZSBpdGVtLCBhZnRlciBhcHBseWluZyB0aGUgb3BlcmF0aW9ucyB1cCB0byB0aGlzIHBvaW50LlxuICAgKiBAcGFyYW0gY3VycmVudEluZGV4IFRoZSBgSXRlcmFibGVDaGFuZ2VSZWNvcmQjY3VycmVudEluZGV4YCBvZiB0aGUgYHJlY29yZGAgcmVmZXJzIHRvIHRoZVxuICAgKiAgICAgICAgb3JpZ2luYWwgYEl0ZXJhYmxlYCBsb2NhdGlvbiwgd2hlcmUgYXMgYGN1cnJlbnRJbmRleGAgcmVmZXJzIHRvIHRoZSB0cmFuc2llbnQgbG9jYXRpb25cbiAgICogICAgICAgIG9mIHRoZSBpdGVtLCBhZnRlciBhcHBseWluZyB0aGUgb3BlcmF0aW9ucyB1cCB0byB0aGlzIHBvaW50LlxuICAgKi9cbiAgZm9yRWFjaE9wZXJhdGlvbihcbiAgICAgIGZuOlxuICAgICAgICAgIChyZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkPFY+LCBwcmV2aW91c0luZGV4OiBudW1iZXJ8bnVsbCxcbiAgICAgICAgICAgY3VycmVudEluZGV4OiBudW1iZXJ8bnVsbCkgPT4gdm9pZCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgb3ZlciBjaGFuZ2VzIGluIHRoZSBvcmRlciBvZiBvcmlnaW5hbCBgSXRlcmFibGVgIHNob3dpbmcgd2hlcmUgdGhlIG9yaWdpbmFsIGl0ZW1zXG4gICAqIGhhdmUgbW92ZWQuXG4gICAqL1xuICBmb3JFYWNoUHJldmlvdXNJdGVtKGZuOiAocmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZDxWPikgPT4gdm9pZCk6IHZvaWQ7XG5cbiAgLyoqIEl0ZXJhdGUgb3ZlciBhbGwgYWRkZWQgaXRlbXMuICovXG4gIGZvckVhY2hBZGRlZEl0ZW0oZm46IChyZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkPFY+KSA9PiB2b2lkKTogdm9pZDtcblxuICAvKiogSXRlcmF0ZSBvdmVyIGFsbCBtb3ZlZCBpdGVtcy4gKi9cbiAgZm9yRWFjaE1vdmVkSXRlbShmbjogKHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmQ8Vj4pID0+IHZvaWQpOiB2b2lkO1xuXG4gIC8qKiBJdGVyYXRlIG92ZXIgYWxsIHJlbW92ZWQgaXRlbXMuICovXG4gIGZvckVhY2hSZW1vdmVkSXRlbShmbjogKHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmQ8Vj4pID0+IHZvaWQpOiB2b2lkO1xuXG4gIC8qKiBJdGVyYXRlIG92ZXIgYWxsIGl0ZW1zIHdoaWNoIGhhZCB0aGVpciBpZGVudGl0eSAoYXMgY29tcHV0ZWQgYnkgdGhlIGBUcmFja0J5RnVuY3Rpb25gKVxuICAgKiBjaGFuZ2VkLiAqL1xuICBmb3JFYWNoSWRlbnRpdHlDaGFuZ2UoZm46IChyZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkPFY+KSA9PiB2b2lkKTogdm9pZDtcbn1cblxuLyoqXG4gKiBSZWNvcmQgcmVwcmVzZW50aW5nIHRoZSBpdGVtIGNoYW5nZSBpbmZvcm1hdGlvbi5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSXRlcmFibGVDaGFuZ2VSZWNvcmQ8Vj4ge1xuICAvKiogQ3VycmVudCBpbmRleCBvZiB0aGUgaXRlbSBpbiBgSXRlcmFibGVgIG9yIG51bGwgaWYgcmVtb3ZlZC4gKi9cbiAgcmVhZG9ubHkgY3VycmVudEluZGV4OiBudW1iZXJ8bnVsbDtcblxuICAvKiogUHJldmlvdXMgaW5kZXggb2YgdGhlIGl0ZW0gaW4gYEl0ZXJhYmxlYCBvciBudWxsIGlmIGFkZGVkLiAqL1xuICByZWFkb25seSBwcmV2aW91c0luZGV4OiBudW1iZXJ8bnVsbDtcblxuICAvKiogVGhlIGl0ZW0uICovXG4gIHJlYWRvbmx5IGl0ZW06IFY7XG5cbiAgLyoqIFRyYWNrIGJ5IGlkZW50aXR5IGFzIGNvbXB1dGVkIGJ5IHRoZSBgVHJhY2tCeUZ1bmN0aW9uYC4gKi9cbiAgcmVhZG9ubHkgdHJhY2tCeUlkOiBhbnk7XG59XG5cbi8qKlxuICogQGRlcHJlY2F0ZWQgdjQuMC4wIC0gVXNlIEl0ZXJhYmxlQ2hhbmdlUmVjb3JkIGluc3RlYWQuXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29sbGVjdGlvbkNoYW5nZVJlY29yZDxWPiBleHRlbmRzIEl0ZXJhYmxlQ2hhbmdlUmVjb3JkPFY+IHt9XG5cbi8qKlxuICogQW4gb3B0aW9uYWwgZnVuY3Rpb24gcGFzc2VkIGludG8ge0BsaW5rIE5nRm9yT2Z9IHRoYXQgZGVmaW5lcyBob3cgdG8gdHJhY2tcbiAqIGl0ZW1zIGluIGFuIGl0ZXJhYmxlIChlLmcuIGZieSBpbmRleCBvciBpZClcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVHJhY2tCeUZ1bmN0aW9uPFQ+IHsgKGluZGV4OiBudW1iZXIsIGl0ZW06IFQpOiBhbnk7IH1cblxuLyoqXG4gKiBQcm92aWRlcyBhIGZhY3RvcnkgZm9yIHtAbGluayBJdGVyYWJsZURpZmZlcn0uXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEl0ZXJhYmxlRGlmZmVyRmFjdG9yeSB7XG4gIHN1cHBvcnRzKG9iamVjdHM6IGFueSk6IGJvb2xlYW47XG4gIGNyZWF0ZTxWPih0cmFja0J5Rm4/OiBUcmFja0J5RnVuY3Rpb248Vj4pOiBJdGVyYWJsZURpZmZlcjxWPjtcbn1cblxuLyoqXG4gKiBBIHJlcG9zaXRvcnkgb2YgZGlmZmVyZW50IGl0ZXJhYmxlIGRpZmZpbmcgc3RyYXRlZ2llcyB1c2VkIGJ5IE5nRm9yLCBOZ0NsYXNzLCBhbmQgb3RoZXJzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIEl0ZXJhYmxlRGlmZmVycyB7XG4gIC8qKiBAbm9jb2xsYXBzZSAqL1xuICBzdGF0aWMgbmdJbmplY3RhYmxlRGVmID0gZGVmaW5lSW5qZWN0YWJsZSh7XG4gICAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICAgIGZhY3Rvcnk6ICgpID0+IG5ldyBJdGVyYWJsZURpZmZlcnMoW25ldyBEZWZhdWx0SXRlcmFibGVEaWZmZXJGYWN0b3J5KCldKVxuICB9KTtcblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgdjQuMC4wIC0gU2hvdWxkIGJlIHByaXZhdGVcbiAgICovXG4gIGZhY3RvcmllczogSXRlcmFibGVEaWZmZXJGYWN0b3J5W107XG4gIGNvbnN0cnVjdG9yKGZhY3RvcmllczogSXRlcmFibGVEaWZmZXJGYWN0b3J5W10pIHsgdGhpcy5mYWN0b3JpZXMgPSBmYWN0b3JpZXM7IH1cblxuICBzdGF0aWMgY3JlYXRlKGZhY3RvcmllczogSXRlcmFibGVEaWZmZXJGYWN0b3J5W10sIHBhcmVudD86IEl0ZXJhYmxlRGlmZmVycyk6IEl0ZXJhYmxlRGlmZmVycyB7XG4gICAgaWYgKHBhcmVudCAhPSBudWxsKSB7XG4gICAgICBjb25zdCBjb3BpZWQgPSBwYXJlbnQuZmFjdG9yaWVzLnNsaWNlKCk7XG4gICAgICBmYWN0b3JpZXMgPSBmYWN0b3JpZXMuY29uY2F0KGNvcGllZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBJdGVyYWJsZURpZmZlcnMoZmFjdG9yaWVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyBhbiBhcnJheSBvZiB7QGxpbmsgSXRlcmFibGVEaWZmZXJGYWN0b3J5fSBhbmQgcmV0dXJucyBhIHByb3ZpZGVyIHVzZWQgdG8gZXh0ZW5kIHRoZVxuICAgKiBpbmhlcml0ZWQge0BsaW5rIEl0ZXJhYmxlRGlmZmVyc30gaW5zdGFuY2Ugd2l0aCB0aGUgcHJvdmlkZWQgZmFjdG9yaWVzIGFuZCByZXR1cm4gYSBuZXdcbiAgICoge0BsaW5rIEl0ZXJhYmxlRGlmZmVyc30gaW5zdGFuY2UuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBzaG93cyBob3cgdG8gZXh0ZW5kIGFuIGV4aXN0aW5nIGxpc3Qgb2YgZmFjdG9yaWVzLFxuICAgKiB3aGljaCB3aWxsIG9ubHkgYmUgYXBwbGllZCB0byB0aGUgaW5qZWN0b3IgZm9yIHRoaXMgY29tcG9uZW50IGFuZCBpdHMgY2hpbGRyZW4uXG4gICAqIFRoaXMgc3RlcCBpcyBhbGwgdGhhdCdzIHJlcXVpcmVkIHRvIG1ha2UgYSBuZXcge0BsaW5rIEl0ZXJhYmxlRGlmZmVyfSBhdmFpbGFibGUuXG4gICAqXG4gICAqIGBgYFxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICB2aWV3UHJvdmlkZXJzOiBbXG4gICAqICAgICBJdGVyYWJsZURpZmZlcnMuZXh0ZW5kKFtuZXcgSW1tdXRhYmxlTGlzdERpZmZlcigpXSlcbiAgICogICBdXG4gICAqIH0pXG4gICAqIGBgYFxuICAgKi9cbiAgc3RhdGljIGV4dGVuZChmYWN0b3JpZXM6IEl0ZXJhYmxlRGlmZmVyRmFjdG9yeVtdKTogU3RhdGljUHJvdmlkZXIge1xuICAgIHJldHVybiB7XG4gICAgICBwcm92aWRlOiBJdGVyYWJsZURpZmZlcnMsXG4gICAgICB1c2VGYWN0b3J5OiAocGFyZW50OiBJdGVyYWJsZURpZmZlcnMpID0+IHtcbiAgICAgICAgaWYgKCFwYXJlbnQpIHtcbiAgICAgICAgICAvLyBUeXBpY2FsbHkgd291bGQgb2NjdXIgd2hlbiBjYWxsaW5nIEl0ZXJhYmxlRGlmZmVycy5leHRlbmQgaW5zaWRlIG9mIGRlcGVuZGVuY2llcyBwYXNzZWRcbiAgICAgICAgICAvLyB0b1xuICAgICAgICAgIC8vIGJvb3RzdHJhcCgpLCB3aGljaCB3b3VsZCBvdmVycmlkZSBkZWZhdWx0IHBpcGVzIGluc3RlYWQgb2YgZXh0ZW5kaW5nIHRoZW0uXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZXh0ZW5kIEl0ZXJhYmxlRGlmZmVycyB3aXRob3V0IGEgcGFyZW50IGluamVjdG9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEl0ZXJhYmxlRGlmZmVycy5jcmVhdGUoZmFjdG9yaWVzLCBwYXJlbnQpO1xuICAgICAgfSxcbiAgICAgIC8vIERlcGVuZGVuY3kgdGVjaG5pY2FsbHkgaXNuJ3Qgb3B0aW9uYWwsIGJ1dCB3ZSBjYW4gcHJvdmlkZSBhIGJldHRlciBlcnJvciBtZXNzYWdlIHRoaXMgd2F5LlxuICAgICAgZGVwczogW1tJdGVyYWJsZURpZmZlcnMsIG5ldyBTa2lwU2VsZigpLCBuZXcgT3B0aW9uYWwoKV1dXG4gICAgfTtcbiAgfVxuXG4gIGZpbmQoaXRlcmFibGU6IGFueSk6IEl0ZXJhYmxlRGlmZmVyRmFjdG9yeSB7XG4gICAgY29uc3QgZmFjdG9yeSA9IHRoaXMuZmFjdG9yaWVzLmZpbmQoZiA9PiBmLnN1cHBvcnRzKGl0ZXJhYmxlKSk7XG4gICAgaWYgKGZhY3RvcnkgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhY3Rvcnk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgQ2Fubm90IGZpbmQgYSBkaWZmZXIgc3VwcG9ydGluZyBvYmplY3QgJyR7aXRlcmFibGV9JyBvZiB0eXBlICcke2dldFR5cGVOYW1lRm9yRGVidWdnaW5nKGl0ZXJhYmxlKX0nYCk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUeXBlTmFtZUZvckRlYnVnZ2luZyh0eXBlOiBhbnkpOiBzdHJpbmcge1xuICByZXR1cm4gdHlwZVsnbmFtZSddIHx8IHR5cGVvZiB0eXBlO1xufVxuIl19