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
import { Optional, SkipSelf, defineInjectable } from '../../di';
import { DefaultKeyValueDifferFactory } from './default_keyvalue_differ';
/**
 * A differ that tracks changes made to an object over time.
 *
 * \@publicApi
 * @record
 * @template K, V
 */
export function KeyValueDiffer() { }
if (false) {
    /**
     * Compute a difference between the previous state and the new `object` state.
     *
     * @param {?} object containing the new value.
     * @return {?} an object describing the difference. The return value is only valid until the next
     * `diff()` invocation.
     */
    KeyValueDiffer.prototype.diff = function (object) { };
    /**
     * Compute a difference between the previous state and the new `object` state.
     *
     * @param {?} object containing the new value.
     * @return {?} an object describing the difference. The return value is only valid until the next
     * `diff()` invocation.
     */
    KeyValueDiffer.prototype.diff = function (object) { };
}
/**
 * An object describing the changes in the `Map` or `{[k:string]: string}` since last time
 * `KeyValueDiffer#diff()` was invoked.
 *
 * \@publicApi
 * @record
 * @template K, V
 */
export function KeyValueChanges() { }
if (false) {
    /**
     * Iterate over all changes. `KeyValueChangeRecord` will contain information about changes
     * to each item.
     * @param {?} fn
     * @return {?}
     */
    KeyValueChanges.prototype.forEachItem = function (fn) { };
    /**
     * Iterate over changes in the order of original Map showing where the original items
     * have moved.
     * @param {?} fn
     * @return {?}
     */
    KeyValueChanges.prototype.forEachPreviousItem = function (fn) { };
    /**
     * Iterate over all keys for which values have changed.
     * @param {?} fn
     * @return {?}
     */
    KeyValueChanges.prototype.forEachChangedItem = function (fn) { };
    /**
     * Iterate over all added items.
     * @param {?} fn
     * @return {?}
     */
    KeyValueChanges.prototype.forEachAddedItem = function (fn) { };
    /**
     * Iterate over all removed items.
     * @param {?} fn
     * @return {?}
     */
    KeyValueChanges.prototype.forEachRemovedItem = function (fn) { };
}
/**
 * Record representing the item change information.
 *
 * \@publicApi
 * @record
 * @template K, V
 */
export function KeyValueChangeRecord() { }
if (false) {
    /**
     * Current key in the Map.
     * @type {?}
     */
    KeyValueChangeRecord.prototype.key;
    /**
     * Current value for the key or `null` if removed.
     * @type {?}
     */
    KeyValueChangeRecord.prototype.currentValue;
    /**
     * Previous value for the key or `null` if added.
     * @type {?}
     */
    KeyValueChangeRecord.prototype.previousValue;
}
/**
 * Provides a factory for {\@link KeyValueDiffer}.
 *
 * \@publicApi
 * @record
 */
export function KeyValueDifferFactory() { }
if (false) {
    /**
     * Test to see if the differ knows how to diff this kind of object.
     * @param {?} objects
     * @return {?}
     */
    KeyValueDifferFactory.prototype.supports = function (objects) { };
    /**
     * Create a `KeyValueDiffer`.
     * @template K, V
     * @return {?}
     */
    KeyValueDifferFactory.prototype.create = function () { };
}
/**
 * A repository of different Map diffing strategies used by NgClass, NgStyle, and others.
 *
 * \@publicApi
 */
export class KeyValueDiffers {
    /**
     * @param {?} factories
     */
    constructor(factories) { this.factories = factories; }
    /**
     * @template S
     * @param {?} factories
     * @param {?=} parent
     * @return {?}
     */
    static create(factories, parent) {
        if (parent) {
            /** @type {?} */
            const copied = parent.factories.slice();
            factories = factories.concat(copied);
        }
        return new KeyValueDiffers(factories);
    }
    /**
     * Takes an array of {\@link KeyValueDifferFactory} and returns a provider used to extend the
     * inherited {\@link KeyValueDiffers} instance with the provided factories and return a new
     * {\@link KeyValueDiffers} instance.
     *
     * \@usageNotes
     * ### Example
     *
     * The following example shows how to extend an existing list of factories,
     * which will only be applied to the injector for this component and its children.
     * This step is all that's required to make a new {\@link KeyValueDiffer} available.
     *
     * ```
     * \@Component({
     *   viewProviders: [
     *     KeyValueDiffers.extend([new ImmutableMapDiffer()])
     *   ]
     * })
     * ```
     * @template S
     * @param {?} factories
     * @return {?}
     */
    static extend(factories) {
        return {
            provide: KeyValueDiffers,
            useFactory: (parent) => {
                if (!parent) {
                    // Typically would occur when calling KeyValueDiffers.extend inside of dependencies passed
                    // to bootstrap(), which would override default pipes instead of extending them.
                    throw new Error('Cannot extend KeyValueDiffers without a parent injector');
                }
                return KeyValueDiffers.create(factories, parent);
            },
            // Dependency technically isn't optional, but we can provide a better error message this way.
            deps: [[KeyValueDiffers, new SkipSelf(), new Optional()]]
        };
    }
    /**
     * @param {?} kv
     * @return {?}
     */
    find(kv) {
        /** @type {?} */
        const factory = this.factories.find(f => f.supports(kv));
        if (factory) {
            return factory;
        }
        throw new Error(`Cannot find a differ supporting object '${kv}'`);
    }
}
/** @nocollapse */
/** @nocollapse */ KeyValueDiffers.ngInjectableDef = defineInjectable({
    providedIn: 'root',
    factory: () => new KeyValueDiffers([new DefaultKeyValueDifferFactory()])
});
if (false) {
    /**
     * @nocollapse
     * @type {?}
     */
    KeyValueDiffers.ngInjectableDef;
    /**
     * @deprecated v4.0.0 - Should be private.
     * @type {?}
     */
    KeyValueDiffers.prototype.factories;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5dmFsdWVfZGlmZmVycy5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2NvcmUvc3JjL2NoYW5nZV9kZXRlY3Rpb24vZGlmZmVycy9rZXl2YWx1ZV9kaWZmZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLFFBQVEsRUFBRSxRQUFRLEVBQWtCLGdCQUFnQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQzlFLE9BQU8sRUFBQyw0QkFBNEIsRUFBQyxNQUFNLDJCQUEyQixDQUFDOzs7Ozs7OztBQVF2RSxvQ0FvQkM7Ozs7Ozs7OztJQVpDLHNEQUFvRDs7Ozs7Ozs7SUFTcEQsc0RBQWtFOzs7Ozs7Ozs7O0FBV3BFLHFDQTJCQzs7Ozs7Ozs7SUF0QkMsMERBQStEOzs7Ozs7O0lBTS9ELGtFQUF1RTs7Ozs7O0lBS3ZFLGlFQUFzRTs7Ozs7O0lBS3RFLCtEQUFvRTs7Ozs7O0lBS3BFLGlFQUFzRTs7Ozs7Ozs7O0FBUXhFLDBDQWVDOzs7Ozs7SUFYQyxtQ0FBZ0I7Ozs7O0lBS2hCLDRDQUE4Qjs7Ozs7SUFLOUIsNkNBQStCOzs7Ozs7OztBQVFqQywyQ0FVQzs7Ozs7OztJQU5DLGtFQUFnQzs7Ozs7O0lBS2hDLHlEQUFxQzs7Ozs7OztBQVF2QyxNQUFNLE9BQU8sZUFBZTs7OztJQVkxQixZQUFZLFNBQWtDLElBQUksSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDOzs7Ozs7O0lBRS9FLE1BQU0sQ0FBQyxNQUFNLENBQUksU0FBa0MsRUFBRSxNQUF3QjtRQUMzRSxJQUFJLE1BQU0sRUFBRTs7a0JBQ0osTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFO1lBQ3ZDLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3RDO1FBQ0QsT0FBTyxJQUFJLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN4QyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFzQkQsTUFBTSxDQUFDLE1BQU0sQ0FBSSxTQUFrQztRQUNqRCxPQUFPO1lBQ0wsT0FBTyxFQUFFLGVBQWU7WUFDeEIsVUFBVSxFQUFFLENBQUMsTUFBdUIsRUFBRSxFQUFFO2dCQUN0QyxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNYLDBGQUEwRjtvQkFDMUYsZ0ZBQWdGO29CQUNoRixNQUFNLElBQUksS0FBSyxDQUFDLHlEQUF5RCxDQUFDLENBQUM7aUJBQzVFO2dCQUNELE9BQU8sZUFBZSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbkQsQ0FBQzs7WUFFRCxJQUFJLEVBQUUsQ0FBQyxDQUFDLGVBQWUsRUFBRSxJQUFJLFFBQVEsRUFBRSxFQUFFLElBQUksUUFBUSxFQUFFLENBQUMsQ0FBQztTQUMxRCxDQUFDO0lBQ0osQ0FBQzs7Ozs7SUFFRCxJQUFJLENBQUMsRUFBTzs7Y0FDSixPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3hELElBQUksT0FBTyxFQUFFO1lBQ1gsT0FBTyxPQUFPLENBQUM7U0FDaEI7UUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLDJDQUEyQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7OztBQTlETSwrQkFBZSxHQUFHLGdCQUFnQixDQUFDO0lBQ3hDLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLGVBQWUsQ0FBQyxDQUFDLElBQUksNEJBQTRCLEVBQUUsQ0FBQyxDQUFDO0NBQ3pFLENBQUMsQ0FBQzs7Ozs7O0lBSEgsZ0NBR0c7Ozs7O0lBS0gsb0NBQW1DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge09wdGlvbmFsLCBTa2lwU2VsZiwgU3RhdGljUHJvdmlkZXIsIGRlZmluZUluamVjdGFibGV9IGZyb20gJy4uLy4uL2RpJztcbmltcG9ydCB7RGVmYXVsdEtleVZhbHVlRGlmZmVyRmFjdG9yeX0gZnJvbSAnLi9kZWZhdWx0X2tleXZhbHVlX2RpZmZlcic7XG5cblxuLyoqXG4gKiBBIGRpZmZlciB0aGF0IHRyYWNrcyBjaGFuZ2VzIG1hZGUgdG8gYW4gb2JqZWN0IG92ZXIgdGltZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgS2V5VmFsdWVEaWZmZXI8SywgVj4ge1xuICAvKipcbiAgICogQ29tcHV0ZSBhIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgcHJldmlvdXMgc3RhdGUgYW5kIHRoZSBuZXcgYG9iamVjdGAgc3RhdGUuXG4gICAqXG4gICAqIEBwYXJhbSBvYmplY3QgY29udGFpbmluZyB0aGUgbmV3IHZhbHVlLlxuICAgKiBAcmV0dXJucyBhbiBvYmplY3QgZGVzY3JpYmluZyB0aGUgZGlmZmVyZW5jZS4gVGhlIHJldHVybiB2YWx1ZSBpcyBvbmx5IHZhbGlkIHVudGlsIHRoZSBuZXh0XG4gICAqIGBkaWZmKClgIGludm9jYXRpb24uXG4gICAqL1xuICBkaWZmKG9iamVjdDogTWFwPEssIFY+KTogS2V5VmFsdWVDaGFuZ2VzPEssIFY+fG51bGw7XG5cbiAgLyoqXG4gICAqIENvbXB1dGUgYSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIHByZXZpb3VzIHN0YXRlIGFuZCB0aGUgbmV3IGBvYmplY3RgIHN0YXRlLlxuICAgKlxuICAgKiBAcGFyYW0gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG5ldyB2YWx1ZS5cbiAgICogQHJldHVybnMgYW4gb2JqZWN0IGRlc2NyaWJpbmcgdGhlIGRpZmZlcmVuY2UuIFRoZSByZXR1cm4gdmFsdWUgaXMgb25seSB2YWxpZCB1bnRpbCB0aGUgbmV4dFxuICAgKiBgZGlmZigpYCBpbnZvY2F0aW9uLlxuICAgKi9cbiAgZGlmZihvYmplY3Q6IHtba2V5OiBzdHJpbmddOiBWfSk6IEtleVZhbHVlQ2hhbmdlczxzdHJpbmcsIFY+fG51bGw7XG4gIC8vIFRPRE8oVFMyLjEpOiBkaWZmPEtQIGV4dGVuZHMgc3RyaW5nPih0aGlzOiBLZXlWYWx1ZURpZmZlcjxLUCwgVj4sIG9iamVjdDogUmVjb3JkPEtQLCBWPik6XG4gIC8vIEtleVZhbHVlRGlmZmVyPEtQLCBWPjtcbn1cblxuLyoqXG4gKiBBbiBvYmplY3QgZGVzY3JpYmluZyB0aGUgY2hhbmdlcyBpbiB0aGUgYE1hcGAgb3IgYHtbazpzdHJpbmddOiBzdHJpbmd9YCBzaW5jZSBsYXN0IHRpbWVcbiAqIGBLZXlWYWx1ZURpZmZlciNkaWZmKClgIHdhcyBpbnZva2VkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBLZXlWYWx1ZUNoYW5nZXM8SywgVj4ge1xuICAvKipcbiAgICogSXRlcmF0ZSBvdmVyIGFsbCBjaGFuZ2VzLiBgS2V5VmFsdWVDaGFuZ2VSZWNvcmRgIHdpbGwgY29udGFpbiBpbmZvcm1hdGlvbiBhYm91dCBjaGFuZ2VzXG4gICAqIHRvIGVhY2ggaXRlbS5cbiAgICovXG4gIGZvckVhY2hJdGVtKGZuOiAocjogS2V5VmFsdWVDaGFuZ2VSZWNvcmQ8SywgVj4pID0+IHZvaWQpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBJdGVyYXRlIG92ZXIgY2hhbmdlcyBpbiB0aGUgb3JkZXIgb2Ygb3JpZ2luYWwgTWFwIHNob3dpbmcgd2hlcmUgdGhlIG9yaWdpbmFsIGl0ZW1zXG4gICAqIGhhdmUgbW92ZWQuXG4gICAqL1xuICBmb3JFYWNoUHJldmlvdXNJdGVtKGZuOiAocjogS2V5VmFsdWVDaGFuZ2VSZWNvcmQ8SywgVj4pID0+IHZvaWQpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBJdGVyYXRlIG92ZXIgYWxsIGtleXMgZm9yIHdoaWNoIHZhbHVlcyBoYXZlIGNoYW5nZWQuXG4gICAqL1xuICBmb3JFYWNoQ2hhbmdlZEl0ZW0oZm46IChyOiBLZXlWYWx1ZUNoYW5nZVJlY29yZDxLLCBWPikgPT4gdm9pZCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgb3ZlciBhbGwgYWRkZWQgaXRlbXMuXG4gICAqL1xuICBmb3JFYWNoQWRkZWRJdGVtKGZuOiAocjogS2V5VmFsdWVDaGFuZ2VSZWNvcmQ8SywgVj4pID0+IHZvaWQpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBJdGVyYXRlIG92ZXIgYWxsIHJlbW92ZWQgaXRlbXMuXG4gICAqL1xuICBmb3JFYWNoUmVtb3ZlZEl0ZW0oZm46IChyOiBLZXlWYWx1ZUNoYW5nZVJlY29yZDxLLCBWPikgPT4gdm9pZCk6IHZvaWQ7XG59XG5cbi8qKlxuICogUmVjb3JkIHJlcHJlc2VudGluZyB0aGUgaXRlbSBjaGFuZ2UgaW5mb3JtYXRpb24uXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEtleVZhbHVlQ2hhbmdlUmVjb3JkPEssIFY+IHtcbiAgLyoqXG4gICAqIEN1cnJlbnQga2V5IGluIHRoZSBNYXAuXG4gICAqL1xuICByZWFkb25seSBrZXk6IEs7XG5cbiAgLyoqXG4gICAqIEN1cnJlbnQgdmFsdWUgZm9yIHRoZSBrZXkgb3IgYG51bGxgIGlmIHJlbW92ZWQuXG4gICAqL1xuICByZWFkb25seSBjdXJyZW50VmFsdWU6IFZ8bnVsbDtcblxuICAvKipcbiAgICogUHJldmlvdXMgdmFsdWUgZm9yIHRoZSBrZXkgb3IgYG51bGxgIGlmIGFkZGVkLlxuICAgKi9cbiAgcmVhZG9ubHkgcHJldmlvdXNWYWx1ZTogVnxudWxsO1xufVxuXG4vKipcbiAqIFByb3ZpZGVzIGEgZmFjdG9yeSBmb3Ige0BsaW5rIEtleVZhbHVlRGlmZmVyfS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgS2V5VmFsdWVEaWZmZXJGYWN0b3J5IHtcbiAgLyoqXG4gICAqIFRlc3QgdG8gc2VlIGlmIHRoZSBkaWZmZXIga25vd3MgaG93IHRvIGRpZmYgdGhpcyBraW5kIG9mIG9iamVjdC5cbiAgICovXG4gIHN1cHBvcnRzKG9iamVjdHM6IGFueSk6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGBLZXlWYWx1ZURpZmZlcmAuXG4gICAqL1xuICBjcmVhdGU8SywgVj4oKTogS2V5VmFsdWVEaWZmZXI8SywgVj47XG59XG5cbi8qKlxuICogQSByZXBvc2l0b3J5IG9mIGRpZmZlcmVudCBNYXAgZGlmZmluZyBzdHJhdGVnaWVzIHVzZWQgYnkgTmdDbGFzcywgTmdTdHlsZSwgYW5kIG90aGVycy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBLZXlWYWx1ZURpZmZlcnMge1xuICAvKiogQG5vY29sbGFwc2UgKi9cbiAgc3RhdGljIG5nSW5qZWN0YWJsZURlZiA9IGRlZmluZUluamVjdGFibGUoe1xuICAgIHByb3ZpZGVkSW46ICdyb290JyxcbiAgICBmYWN0b3J5OiAoKSA9PiBuZXcgS2V5VmFsdWVEaWZmZXJzKFtuZXcgRGVmYXVsdEtleVZhbHVlRGlmZmVyRmFjdG9yeSgpXSlcbiAgfSk7XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIHY0LjAuMCAtIFNob3VsZCBiZSBwcml2YXRlLlxuICAgKi9cbiAgZmFjdG9yaWVzOiBLZXlWYWx1ZURpZmZlckZhY3RvcnlbXTtcblxuICBjb25zdHJ1Y3RvcihmYWN0b3JpZXM6IEtleVZhbHVlRGlmZmVyRmFjdG9yeVtdKSB7IHRoaXMuZmFjdG9yaWVzID0gZmFjdG9yaWVzOyB9XG5cbiAgc3RhdGljIGNyZWF0ZTxTPihmYWN0b3JpZXM6IEtleVZhbHVlRGlmZmVyRmFjdG9yeVtdLCBwYXJlbnQ/OiBLZXlWYWx1ZURpZmZlcnMpOiBLZXlWYWx1ZURpZmZlcnMge1xuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgIGNvbnN0IGNvcGllZCA9IHBhcmVudC5mYWN0b3JpZXMuc2xpY2UoKTtcbiAgICAgIGZhY3RvcmllcyA9IGZhY3Rvcmllcy5jb25jYXQoY29waWVkKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBLZXlWYWx1ZURpZmZlcnMoZmFjdG9yaWVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyBhbiBhcnJheSBvZiB7QGxpbmsgS2V5VmFsdWVEaWZmZXJGYWN0b3J5fSBhbmQgcmV0dXJucyBhIHByb3ZpZGVyIHVzZWQgdG8gZXh0ZW5kIHRoZVxuICAgKiBpbmhlcml0ZWQge0BsaW5rIEtleVZhbHVlRGlmZmVyc30gaW5zdGFuY2Ugd2l0aCB0aGUgcHJvdmlkZWQgZmFjdG9yaWVzIGFuZCByZXR1cm4gYSBuZXdcbiAgICoge0BsaW5rIEtleVZhbHVlRGlmZmVyc30gaW5zdGFuY2UuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBzaG93cyBob3cgdG8gZXh0ZW5kIGFuIGV4aXN0aW5nIGxpc3Qgb2YgZmFjdG9yaWVzLFxuICAgKiB3aGljaCB3aWxsIG9ubHkgYmUgYXBwbGllZCB0byB0aGUgaW5qZWN0b3IgZm9yIHRoaXMgY29tcG9uZW50IGFuZCBpdHMgY2hpbGRyZW4uXG4gICAqIFRoaXMgc3RlcCBpcyBhbGwgdGhhdCdzIHJlcXVpcmVkIHRvIG1ha2UgYSBuZXcge0BsaW5rIEtleVZhbHVlRGlmZmVyfSBhdmFpbGFibGUuXG4gICAqXG4gICAqIGBgYFxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICB2aWV3UHJvdmlkZXJzOiBbXG4gICAqICAgICBLZXlWYWx1ZURpZmZlcnMuZXh0ZW5kKFtuZXcgSW1tdXRhYmxlTWFwRGlmZmVyKCldKVxuICAgKiAgIF1cbiAgICogfSlcbiAgICogYGBgXG4gICAqL1xuICBzdGF0aWMgZXh0ZW5kPFM+KGZhY3RvcmllczogS2V5VmFsdWVEaWZmZXJGYWN0b3J5W10pOiBTdGF0aWNQcm92aWRlciB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb3ZpZGU6IEtleVZhbHVlRGlmZmVycyxcbiAgICAgIHVzZUZhY3Rvcnk6IChwYXJlbnQ6IEtleVZhbHVlRGlmZmVycykgPT4ge1xuICAgICAgICBpZiAoIXBhcmVudCkge1xuICAgICAgICAgIC8vIFR5cGljYWxseSB3b3VsZCBvY2N1ciB3aGVuIGNhbGxpbmcgS2V5VmFsdWVEaWZmZXJzLmV4dGVuZCBpbnNpZGUgb2YgZGVwZW5kZW5jaWVzIHBhc3NlZFxuICAgICAgICAgIC8vIHRvIGJvb3RzdHJhcCgpLCB3aGljaCB3b3VsZCBvdmVycmlkZSBkZWZhdWx0IHBpcGVzIGluc3RlYWQgb2YgZXh0ZW5kaW5nIHRoZW0uXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZXh0ZW5kIEtleVZhbHVlRGlmZmVycyB3aXRob3V0IGEgcGFyZW50IGluamVjdG9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEtleVZhbHVlRGlmZmVycy5jcmVhdGUoZmFjdG9yaWVzLCBwYXJlbnQpO1xuICAgICAgfSxcbiAgICAgIC8vIERlcGVuZGVuY3kgdGVjaG5pY2FsbHkgaXNuJ3Qgb3B0aW9uYWwsIGJ1dCB3ZSBjYW4gcHJvdmlkZSBhIGJldHRlciBlcnJvciBtZXNzYWdlIHRoaXMgd2F5LlxuICAgICAgZGVwczogW1tLZXlWYWx1ZURpZmZlcnMsIG5ldyBTa2lwU2VsZigpLCBuZXcgT3B0aW9uYWwoKV1dXG4gICAgfTtcbiAgfVxuXG4gIGZpbmQoa3Y6IGFueSk6IEtleVZhbHVlRGlmZmVyRmFjdG9yeSB7XG4gICAgY29uc3QgZmFjdG9yeSA9IHRoaXMuZmFjdG9yaWVzLmZpbmQoZiA9PiBmLnN1cHBvcnRzKGt2KSk7XG4gICAgaWYgKGZhY3RvcnkpIHtcbiAgICAgIHJldHVybiBmYWN0b3J5O1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBmaW5kIGEgZGlmZmVyIHN1cHBvcnRpbmcgb2JqZWN0ICcke2t2fSdgKTtcbiAgfVxufVxuIl19