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
export const TNODE = 8;
/** @type {?} */
export const PARENT_INJECTOR = 8;
/** @type {?} */
export const INJECTOR_SIZE = 9;
/**
 * Represents a relative location of parent injector.
 *
 * The interfaces encodes number of parents `LViewData`s to traverse and index in the `LViewData`
 * pointing to the parent injector.
 * @record
 */
export function RelativeInjectorLocation() { }
if (false) {
    /** @type {?} */
    RelativeInjectorLocation.prototype.__brand__;
}
/** @enum {number} */
const RelativeInjectorLocationFlags = {
    InjectorIndexMask: 32767,
    AcrossHostBoundary: 32768,
    ViewOffsetShift: 16,
    NO_PARENT: -1,
};
export { RelativeInjectorLocationFlags };
/** @type {?} */
export const NO_PARENT_INJECTOR = (/** @type {?} */ (-1));
/**
 * Each injector is saved in 9 contiguous slots in `LViewData` and 9 contiguous slots in
 * `TView.data`. This allows us to store information about the current node's tokens (which
 * can be shared in `TView`) as well as the tokens of its ancestor nodes (which cannot be
 * shared, so they live in `LViewData`).
 *
 * Each of these slots (aside from the last slot) contains a bloom filter. This bloom filter
 * determines whether a directive is available on the associated node or not. This prevents us
 * from searching the directives array at this level unless it's probable the directive is in it.
 *
 * See: https://en.wikipedia.org/wiki/Bloom_filter for more about bloom filters.
 *
 * Because all injectors have been flattened into `LViewData` and `TViewData`, they cannot typed
 * using interfaces as they were previously. The start index of each `LInjector` and `TInjector`
 * will differ based on where it is flattened into the main array, so it's not possible to know
 * the indices ahead of time and save their types here. The interfaces are still included here
 * for documentation purposes.
 *
 * export interface LInjector extends Array<any> {
 *
 *    // Cumulative bloom for directive IDs 0-31  (IDs are % BLOOM_SIZE)
 *    [0]: number;
 *
 *    // Cumulative bloom for directive IDs 32-63
 *    [1]: number;
 *
 *    // Cumulative bloom for directive IDs 64-95
 *    [2]: number;
 *
 *    // Cumulative bloom for directive IDs 96-127
 *    [3]: number;
 *
 *    // Cumulative bloom for directive IDs 128-159
 *    [4]: number;
 *
 *    // Cumulative bloom for directive IDs 160 - 191
 *    [5]: number;
 *
 *    // Cumulative bloom for directive IDs 192 - 223
 *    [6]: number;
 *
 *    // Cumulative bloom for directive IDs 224 - 255
 *    [7]: number;
 *
 *    // We need to store a reference to the injector's parent so DI can keep looking up
 *    // the injector tree until it finds the dependency it's looking for.
 *    [PARENT_INJECTOR]: number;
 * }
 *
 * export interface TInjector extends Array<any> {
 *
 *    // Shared node bloom for directive IDs 0-31  (IDs are % BLOOM_SIZE)
 *    [0]: number;
 *
 *    // Shared node bloom for directive IDs 32-63
 *    [1]: number;
 *
 *    // Shared node bloom for directive IDs 64-95
 *    [2]: number;
 *
 *    // Shared node bloom for directive IDs 96-127
 *    [3]: number;
 *
 *    // Shared node bloom for directive IDs 128-159
 *    [4]: number;
 *
 *    // Shared node bloom for directive IDs 160 - 191
 *    [5]: number;
 *
 *    // Shared node bloom for directive IDs 192 - 223
 *    [6]: number;
 *
 *    // Shared node bloom for directive IDs 224 - 255
 *    [7]: number;
 *
 *    // Necessary to find directive indices for a particular node.
 *    [TNODE]: TElementNode|TElementContainerNode|TContainerNode;
 *  }
 */
/**
 * Factory for creating instances of injectors in the NodeInjector.
 *
 * This factory is complicated by the fact that it can resolve `multi` factories as well.
 *
 * NOTE: Some of the fields are optional which means that this class has two hidden classes.
 * - One without `multi` support (most common)
 * - One with `multi` values, (rare).
 *
 * Since VMs can cache up to 4 inline hidden classes this is OK.
 *
 * - Single factory: Only `resolving` and `factory` is defined.
 * - `providers` factory: `componentProviders` is a number and `index = -1`.
 * - `viewProviders` factory: `componentProviders` is a number and `index` points to `providers`.
 */
export class NodeInjectorFactory {
    /**
     * @param {?} factory
     * @param {?} isViewProvider
     * @param {?} injectImplementation
     */
    constructor(factory, 
    /**
     * Set to `true` if the token is declared in `viewProviders` (or if it is component).
     */
    isViewProvider, injectImplementation) {
        this.factory = factory;
        /**
         * Marker set to true during factory invocation to see if we get into recursive loop.
         * Recursive loop causes an error to be displayed.
         */
        this.resolving = false;
        this.canSeeViewProviders = isViewProvider;
        this.injectImpl = injectImplementation;
    }
}
if (false) {
    /**
     * The inject implementation to be activated when using the factory.
     * @type {?}
     */
    NodeInjectorFactory.prototype.injectImpl;
    /**
     * Marker set to true during factory invocation to see if we get into recursive loop.
     * Recursive loop causes an error to be displayed.
     * @type {?}
     */
    NodeInjectorFactory.prototype.resolving;
    /**
     * Marks that the token can see other Tokens declared in `viewProviders` on the same node.
     * @type {?}
     */
    NodeInjectorFactory.prototype.canSeeViewProviders;
    /**
     * An array of factories to use in case of `multi` provider.
     * @type {?}
     */
    NodeInjectorFactory.prototype.multi;
    /**
     * Number of `multi`-providers which belong to the component.
     *
     * This is needed because when multiple components and directives declare the `multi` provider
     * they have to be concatenated in the correct order.
     *
     * Example:
     *
     * If we have a component and directive active an a single element as declared here
     * ```
     * component:
     *   provides: [ {provide: String, useValue: 'component', multi: true} ],
     *   viewProvides: [ {provide: String, useValue: 'componentView', multi: true} ],
     *
     * directive:
     *   provides: [ {provide: String, useValue: 'directive', multi: true} ],
     * ```
     *
     * Then the expected results are:
     *
     * ```
     * providers: ['component', 'directive']
     * viewProviders: ['component', 'componentView', 'directive']
     * ```
     *
     * The way to think about it is that the `viewProviders` have been inserted after the component
     * but before the directives, which is why we need to know how many `multi`s have been declared by
     * the component.
     * @type {?}
     */
    NodeInjectorFactory.prototype.componentProviders;
    /**
     * Current index of the Factory in the `data`. Needed for `viewProviders` and `providers` merging.
     * See `providerFactory`.
     * @type {?}
     */
    NodeInjectorFactory.prototype.index;
    /**
     * Because the same `multi` provider can be declared in `provides` and `viewProvides` it is
     * possible for `viewProvides` to shadow the `provides`. For this reason we store the
     * `provideFactory` of the `providers` so that `providers` can be extended with `viewProviders`.
     *
     * Example:
     *
     * Given:
     * ```
     * provides: [ {provide: String, useValue: 'all', multi: true} ],
     * viewProvides: [ {provide: String, useValue: 'viewOnly', multi: true} ],
     * ```
     *
     * We have to return `['all']` in case of content injection, but `['all', 'viewOnly']` in case
     * of view injection. We further have to make sure that the shared instances (in our case
     * `all`) are the exact same instance in both the content as well as the view injection. (We
     * have to make sure that we don't double instantiate.) For this reason the `viewProvides`
     * `Factory` has a pointer to the shadowed `provides` factory so that it can instantiate the
     * `providers` (`['all']`) and then extend it with `viewProviders` (`['all'] + ['viewOnly'] =
     * ['all', 'viewOnly']`).
     * @type {?}
     */
    NodeInjectorFactory.prototype.providerFactory;
    /**
     * Factory to invoke in order to create a new instance.
     * @type {?}
     */
    NodeInjectorFactory.prototype.factory;
}
/** @type {?} */
const FactoryPrototype = NodeInjectorFactory.prototype;
/**
 * @param {?} obj
 * @return {?}
 */
export function isFactory(obj) {
    // See: https://jsperf.com/instanceof-vs-getprototypeof
    return obj != null && typeof obj == 'object' && Object.getPrototypeOf(obj) == FactoryPrototype;
}
// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
/** @type {?} */
export const unusedValueExportToPlacateAjd = 1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0b3IuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2ludGVyZmFjZXMvaW5qZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBY0EsTUFBTSxPQUFPLEtBQUssR0FBRyxDQUFDOztBQUN0QixNQUFNLE9BQU8sZUFBZSxHQUFHLENBQUM7O0FBQ2hDLE1BQU0sT0FBTyxhQUFhLEdBQUcsQ0FBQzs7Ozs7Ozs7QUFROUIsOENBQXlGOzs7SUFBN0MsNkNBQTJDOzs7O0lBR3JGLHdCQUFxQztJQUNyQyx5QkFBdUM7SUFDdkMsbUJBQW9CO0lBQ3BCLGFBQWM7Ozs7QUFHaEIsTUFBTSxPQUFPLGtCQUFrQixHQUE2QixtQkFBQSxDQUFDLENBQUMsRUFBTzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpR3JFLE1BQU0sT0FBTyxtQkFBbUI7Ozs7OztJQW1GOUIsWUFJVyxPQWV5QjtJQUNoQzs7T0FFRztJQUNILGNBQXVCLEVBQ3ZCLG9CQUEyRjtRQXBCcEYsWUFBTyxHQUFQLE9BQU8sQ0Fla0I7Ozs7O1FBNUZwQyxjQUFTLEdBQUcsS0FBSyxDQUFDO1FBa0doQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsY0FBYyxDQUFDO1FBQzFDLElBQUksQ0FBQyxVQUFVLEdBQUcsb0JBQW9CLENBQUM7SUFDekMsQ0FBQztDQUNGOzs7Ozs7SUEzR0MseUNBQWtGOzs7Ozs7SUFNbEYsd0NBQWtCOzs7OztJQUtsQixrREFBNkI7Ozs7O0lBSzdCLG9DQUF5Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQStCekIsaURBQTRCOzs7Ozs7SUFNNUIsb0NBQWU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBdUJmLDhDQUEyQzs7Ozs7SUFPdkMsc0NBZWdDOzs7TUFXaEMsZ0JBQWdCLEdBQUcsbUJBQW1CLENBQUMsU0FBUzs7Ozs7QUFDdEQsTUFBTSxVQUFVLFNBQVMsQ0FBQyxHQUFRO0lBQ2hDLHVEQUF1RDtJQUN2RCxPQUFPLEdBQUcsSUFBSSxJQUFJLElBQUksT0FBTyxHQUFHLElBQUksUUFBUSxJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksZ0JBQWdCLENBQUM7QUFDakcsQ0FBQzs7OztBQUlELE1BQU0sT0FBTyw2QkFBNkIsR0FBRyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGlvblRva2VufSBmcm9tICcuLi8uLi9kaS9pbmplY3Rpb25fdG9rZW4nO1xuaW1wb3J0IHtJbmplY3RGbGFnc30gZnJvbSAnLi4vLi4vZGkvaW5qZWN0b3JfY29tcGF0aWJpbGl0eSc7XG5pbXBvcnQge1R5cGV9IGZyb20gJy4uLy4uL3R5cGUnO1xuaW1wb3J0IHtURWxlbWVudE5vZGV9IGZyb20gJy4vbm9kZSc7XG5pbXBvcnQge0xWaWV3RGF0YSwgVERhdGF9IGZyb20gJy4vdmlldyc7XG5cbmV4cG9ydCBjb25zdCBUTk9ERSA9IDg7XG5leHBvcnQgY29uc3QgUEFSRU5UX0lOSkVDVE9SID0gODtcbmV4cG9ydCBjb25zdCBJTkpFQ1RPUl9TSVpFID0gOTtcblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgcmVsYXRpdmUgbG9jYXRpb24gb2YgcGFyZW50IGluamVjdG9yLlxuICpcbiAqIFRoZSBpbnRlcmZhY2VzIGVuY29kZXMgbnVtYmVyIG9mIHBhcmVudHMgYExWaWV3RGF0YWBzIHRvIHRyYXZlcnNlIGFuZCBpbmRleCBpbiB0aGUgYExWaWV3RGF0YWBcbiAqIHBvaW50aW5nIHRvIHRoZSBwYXJlbnQgaW5qZWN0b3IuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsYXRpdmVJbmplY3RvckxvY2F0aW9uIHsgX19icmFuZF9fOiAnUmVsYXRpdmVJbmplY3RvckxvY2F0aW9uRmxhZ3MnOyB9XG5cbmV4cG9ydCBjb25zdCBlbnVtIFJlbGF0aXZlSW5qZWN0b3JMb2NhdGlvbkZsYWdzIHtcbiAgSW5qZWN0b3JJbmRleE1hc2sgPSAwYjExMTExMTExMTExMTExMSxcbiAgQWNyb3NzSG9zdEJvdW5kYXJ5ID0gMGIxMDAwMDAwMDAwMDAwMDAwLFxuICBWaWV3T2Zmc2V0U2hpZnQgPSAxNixcbiAgTk9fUEFSRU5UID0gLTEsXG59XG5cbmV4cG9ydCBjb25zdCBOT19QQVJFTlRfSU5KRUNUT1I6IFJlbGF0aXZlSW5qZWN0b3JMb2NhdGlvbiA9IC0xIGFzIGFueTtcblxuLyoqXG4gKiBFYWNoIGluamVjdG9yIGlzIHNhdmVkIGluIDkgY29udGlndW91cyBzbG90cyBpbiBgTFZpZXdEYXRhYCBhbmQgOSBjb250aWd1b3VzIHNsb3RzIGluXG4gKiBgVFZpZXcuZGF0YWAuIFRoaXMgYWxsb3dzIHVzIHRvIHN0b3JlIGluZm9ybWF0aW9uIGFib3V0IHRoZSBjdXJyZW50IG5vZGUncyB0b2tlbnMgKHdoaWNoXG4gKiBjYW4gYmUgc2hhcmVkIGluIGBUVmlld2ApIGFzIHdlbGwgYXMgdGhlIHRva2VucyBvZiBpdHMgYW5jZXN0b3Igbm9kZXMgKHdoaWNoIGNhbm5vdCBiZVxuICogc2hhcmVkLCBzbyB0aGV5IGxpdmUgaW4gYExWaWV3RGF0YWApLlxuICpcbiAqIEVhY2ggb2YgdGhlc2Ugc2xvdHMgKGFzaWRlIGZyb20gdGhlIGxhc3Qgc2xvdCkgY29udGFpbnMgYSBibG9vbSBmaWx0ZXIuIFRoaXMgYmxvb20gZmlsdGVyXG4gKiBkZXRlcm1pbmVzIHdoZXRoZXIgYSBkaXJlY3RpdmUgaXMgYXZhaWxhYmxlIG9uIHRoZSBhc3NvY2lhdGVkIG5vZGUgb3Igbm90LiBUaGlzIHByZXZlbnRzIHVzXG4gKiBmcm9tIHNlYXJjaGluZyB0aGUgZGlyZWN0aXZlcyBhcnJheSBhdCB0aGlzIGxldmVsIHVubGVzcyBpdCdzIHByb2JhYmxlIHRoZSBkaXJlY3RpdmUgaXMgaW4gaXQuXG4gKlxuICogU2VlOiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9CbG9vbV9maWx0ZXIgZm9yIG1vcmUgYWJvdXQgYmxvb20gZmlsdGVycy5cbiAqXG4gKiBCZWNhdXNlIGFsbCBpbmplY3RvcnMgaGF2ZSBiZWVuIGZsYXR0ZW5lZCBpbnRvIGBMVmlld0RhdGFgIGFuZCBgVFZpZXdEYXRhYCwgdGhleSBjYW5ub3QgdHlwZWRcbiAqIHVzaW5nIGludGVyZmFjZXMgYXMgdGhleSB3ZXJlIHByZXZpb3VzbHkuIFRoZSBzdGFydCBpbmRleCBvZiBlYWNoIGBMSW5qZWN0b3JgIGFuZCBgVEluamVjdG9yYFxuICogd2lsbCBkaWZmZXIgYmFzZWQgb24gd2hlcmUgaXQgaXMgZmxhdHRlbmVkIGludG8gdGhlIG1haW4gYXJyYXksIHNvIGl0J3Mgbm90IHBvc3NpYmxlIHRvIGtub3dcbiAqIHRoZSBpbmRpY2VzIGFoZWFkIG9mIHRpbWUgYW5kIHNhdmUgdGhlaXIgdHlwZXMgaGVyZS4gVGhlIGludGVyZmFjZXMgYXJlIHN0aWxsIGluY2x1ZGVkIGhlcmVcbiAqIGZvciBkb2N1bWVudGF0aW9uIHB1cnBvc2VzLlxuICpcbiAqIGV4cG9ydCBpbnRlcmZhY2UgTEluamVjdG9yIGV4dGVuZHMgQXJyYXk8YW55PiB7XG4gKlxuICogICAgLy8gQ3VtdWxhdGl2ZSBibG9vbSBmb3IgZGlyZWN0aXZlIElEcyAwLTMxICAoSURzIGFyZSAlIEJMT09NX1NJWkUpXG4gKiAgICBbMF06IG51bWJlcjtcbiAqXG4gKiAgICAvLyBDdW11bGF0aXZlIGJsb29tIGZvciBkaXJlY3RpdmUgSURzIDMyLTYzXG4gKiAgICBbMV06IG51bWJlcjtcbiAqXG4gKiAgICAvLyBDdW11bGF0aXZlIGJsb29tIGZvciBkaXJlY3RpdmUgSURzIDY0LTk1XG4gKiAgICBbMl06IG51bWJlcjtcbiAqXG4gKiAgICAvLyBDdW11bGF0aXZlIGJsb29tIGZvciBkaXJlY3RpdmUgSURzIDk2LTEyN1xuICogICAgWzNdOiBudW1iZXI7XG4gKlxuICogICAgLy8gQ3VtdWxhdGl2ZSBibG9vbSBmb3IgZGlyZWN0aXZlIElEcyAxMjgtMTU5XG4gKiAgICBbNF06IG51bWJlcjtcbiAqXG4gKiAgICAvLyBDdW11bGF0aXZlIGJsb29tIGZvciBkaXJlY3RpdmUgSURzIDE2MCAtIDE5MVxuICogICAgWzVdOiBudW1iZXI7XG4gKlxuICogICAgLy8gQ3VtdWxhdGl2ZSBibG9vbSBmb3IgZGlyZWN0aXZlIElEcyAxOTIgLSAyMjNcbiAqICAgIFs2XTogbnVtYmVyO1xuICpcbiAqICAgIC8vIEN1bXVsYXRpdmUgYmxvb20gZm9yIGRpcmVjdGl2ZSBJRHMgMjI0IC0gMjU1XG4gKiAgICBbN106IG51bWJlcjtcbiAqXG4gKiAgICAvLyBXZSBuZWVkIHRvIHN0b3JlIGEgcmVmZXJlbmNlIHRvIHRoZSBpbmplY3RvcidzIHBhcmVudCBzbyBESSBjYW4ga2VlcCBsb29raW5nIHVwXG4gKiAgICAvLyB0aGUgaW5qZWN0b3IgdHJlZSB1bnRpbCBpdCBmaW5kcyB0aGUgZGVwZW5kZW5jeSBpdCdzIGxvb2tpbmcgZm9yLlxuICogICAgW1BBUkVOVF9JTkpFQ1RPUl06IG51bWJlcjtcbiAqIH1cbiAqXG4gKiBleHBvcnQgaW50ZXJmYWNlIFRJbmplY3RvciBleHRlbmRzIEFycmF5PGFueT4ge1xuICpcbiAqICAgIC8vIFNoYXJlZCBub2RlIGJsb29tIGZvciBkaXJlY3RpdmUgSURzIDAtMzEgIChJRHMgYXJlICUgQkxPT01fU0laRSlcbiAqICAgIFswXTogbnVtYmVyO1xuICpcbiAqICAgIC8vIFNoYXJlZCBub2RlIGJsb29tIGZvciBkaXJlY3RpdmUgSURzIDMyLTYzXG4gKiAgICBbMV06IG51bWJlcjtcbiAqXG4gKiAgICAvLyBTaGFyZWQgbm9kZSBibG9vbSBmb3IgZGlyZWN0aXZlIElEcyA2NC05NVxuICogICAgWzJdOiBudW1iZXI7XG4gKlxuICogICAgLy8gU2hhcmVkIG5vZGUgYmxvb20gZm9yIGRpcmVjdGl2ZSBJRHMgOTYtMTI3XG4gKiAgICBbM106IG51bWJlcjtcbiAqXG4gKiAgICAvLyBTaGFyZWQgbm9kZSBibG9vbSBmb3IgZGlyZWN0aXZlIElEcyAxMjgtMTU5XG4gKiAgICBbNF06IG51bWJlcjtcbiAqXG4gKiAgICAvLyBTaGFyZWQgbm9kZSBibG9vbSBmb3IgZGlyZWN0aXZlIElEcyAxNjAgLSAxOTFcbiAqICAgIFs1XTogbnVtYmVyO1xuICpcbiAqICAgIC8vIFNoYXJlZCBub2RlIGJsb29tIGZvciBkaXJlY3RpdmUgSURzIDE5MiAtIDIyM1xuICogICAgWzZdOiBudW1iZXI7XG4gKlxuICogICAgLy8gU2hhcmVkIG5vZGUgYmxvb20gZm9yIGRpcmVjdGl2ZSBJRHMgMjI0IC0gMjU1XG4gKiAgICBbN106IG51bWJlcjtcbiAqXG4gKiAgICAvLyBOZWNlc3NhcnkgdG8gZmluZCBkaXJlY3RpdmUgaW5kaWNlcyBmb3IgYSBwYXJ0aWN1bGFyIG5vZGUuXG4gKiAgICBbVE5PREVdOiBURWxlbWVudE5vZGV8VEVsZW1lbnRDb250YWluZXJOb2RlfFRDb250YWluZXJOb2RlO1xuICogIH1cbiAqL1xuXG4vKipcbiogRmFjdG9yeSBmb3IgY3JlYXRpbmcgaW5zdGFuY2VzIG9mIGluamVjdG9ycyBpbiB0aGUgTm9kZUluamVjdG9yLlxuKlxuKiBUaGlzIGZhY3RvcnkgaXMgY29tcGxpY2F0ZWQgYnkgdGhlIGZhY3QgdGhhdCBpdCBjYW4gcmVzb2x2ZSBgbXVsdGlgIGZhY3RvcmllcyBhcyB3ZWxsLlxuKlxuKiBOT1RFOiBTb21lIG9mIHRoZSBmaWVsZHMgYXJlIG9wdGlvbmFsIHdoaWNoIG1lYW5zIHRoYXQgdGhpcyBjbGFzcyBoYXMgdHdvIGhpZGRlbiBjbGFzc2VzLlxuKiAtIE9uZSB3aXRob3V0IGBtdWx0aWAgc3VwcG9ydCAobW9zdCBjb21tb24pXG4qIC0gT25lIHdpdGggYG11bHRpYCB2YWx1ZXMsIChyYXJlKS5cbipcbiogU2luY2UgVk1zIGNhbiBjYWNoZSB1cCB0byA0IGlubGluZSBoaWRkZW4gY2xhc3NlcyB0aGlzIGlzIE9LLlxuKlxuKiAtIFNpbmdsZSBmYWN0b3J5OiBPbmx5IGByZXNvbHZpbmdgIGFuZCBgZmFjdG9yeWAgaXMgZGVmaW5lZC5cbiogLSBgcHJvdmlkZXJzYCBmYWN0b3J5OiBgY29tcG9uZW50UHJvdmlkZXJzYCBpcyBhIG51bWJlciBhbmQgYGluZGV4ID0gLTFgLlxuKiAtIGB2aWV3UHJvdmlkZXJzYCBmYWN0b3J5OiBgY29tcG9uZW50UHJvdmlkZXJzYCBpcyBhIG51bWJlciBhbmQgYGluZGV4YCBwb2ludHMgdG8gYHByb3ZpZGVyc2AuXG4qL1xuZXhwb3J0IGNsYXNzIE5vZGVJbmplY3RvckZhY3Rvcnkge1xuICAvKipcbiAgICogVGhlIGluamVjdCBpbXBsZW1lbnRhdGlvbiB0byBiZSBhY3RpdmF0ZWQgd2hlbiB1c2luZyB0aGUgZmFjdG9yeS5cbiAgICovXG4gIGluamVjdEltcGw6IG51bGx8KDxUPih0b2tlbjogVHlwZTxUPnxJbmplY3Rpb25Ub2tlbjxUPiwgZmxhZ3M6IEluamVjdEZsYWdzKSA9PiBUKTtcblxuICAvKipcbiAgICogTWFya2VyIHNldCB0byB0cnVlIGR1cmluZyBmYWN0b3J5IGludm9jYXRpb24gdG8gc2VlIGlmIHdlIGdldCBpbnRvIHJlY3Vyc2l2ZSBsb29wLlxuICAgKiBSZWN1cnNpdmUgbG9vcCBjYXVzZXMgYW4gZXJyb3IgdG8gYmUgZGlzcGxheWVkLlxuICAgKi9cbiAgcmVzb2x2aW5nID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIE1hcmtzIHRoYXQgdGhlIHRva2VuIGNhbiBzZWUgb3RoZXIgVG9rZW5zIGRlY2xhcmVkIGluIGB2aWV3UHJvdmlkZXJzYCBvbiB0aGUgc2FtZSBub2RlLlxuICAgKi9cbiAgY2FuU2VlVmlld1Byb3ZpZGVyczogYm9vbGVhbjtcblxuICAvKipcbiAgICogQW4gYXJyYXkgb2YgZmFjdG9yaWVzIHRvIHVzZSBpbiBjYXNlIG9mIGBtdWx0aWAgcHJvdmlkZXIuXG4gICAqL1xuICBtdWx0aT86IEFycmF5PCgpID0+IGFueT47XG5cbiAgLyoqXG4gICAqIE51bWJlciBvZiBgbXVsdGlgLXByb3ZpZGVycyB3aGljaCBiZWxvbmcgdG8gdGhlIGNvbXBvbmVudC5cbiAgICpcbiAgICogVGhpcyBpcyBuZWVkZWQgYmVjYXVzZSB3aGVuIG11bHRpcGxlIGNvbXBvbmVudHMgYW5kIGRpcmVjdGl2ZXMgZGVjbGFyZSB0aGUgYG11bHRpYCBwcm92aWRlclxuICAgKiB0aGV5IGhhdmUgdG8gYmUgY29uY2F0ZW5hdGVkIGluIHRoZSBjb3JyZWN0IG9yZGVyLlxuICAgKlxuICAgKiBFeGFtcGxlOlxuICAgKlxuICAgKiBJZiB3ZSBoYXZlIGEgY29tcG9uZW50IGFuZCBkaXJlY3RpdmUgYWN0aXZlIGFuIGEgc2luZ2xlIGVsZW1lbnQgYXMgZGVjbGFyZWQgaGVyZVxuICAgKiBgYGBcbiAgICogY29tcG9uZW50OlxuICAgKiAgIHByb3ZpZGVzOiBbIHtwcm92aWRlOiBTdHJpbmcsIHVzZVZhbHVlOiAnY29tcG9uZW50JywgbXVsdGk6IHRydWV9IF0sXG4gICAqICAgdmlld1Byb3ZpZGVzOiBbIHtwcm92aWRlOiBTdHJpbmcsIHVzZVZhbHVlOiAnY29tcG9uZW50VmlldycsIG11bHRpOiB0cnVlfSBdLFxuICAgKlxuICAgKiBkaXJlY3RpdmU6XG4gICAqICAgcHJvdmlkZXM6IFsge3Byb3ZpZGU6IFN0cmluZywgdXNlVmFsdWU6ICdkaXJlY3RpdmUnLCBtdWx0aTogdHJ1ZX0gXSxcbiAgICogYGBgXG4gICAqXG4gICAqIFRoZW4gdGhlIGV4cGVjdGVkIHJlc3VsdHMgYXJlOlxuICAgKlxuICAgKiBgYGBcbiAgICogcHJvdmlkZXJzOiBbJ2NvbXBvbmVudCcsICdkaXJlY3RpdmUnXVxuICAgKiB2aWV3UHJvdmlkZXJzOiBbJ2NvbXBvbmVudCcsICdjb21wb25lbnRWaWV3JywgJ2RpcmVjdGl2ZSddXG4gICAqIGBgYFxuICAgKlxuICAgKiBUaGUgd2F5IHRvIHRoaW5rIGFib3V0IGl0IGlzIHRoYXQgdGhlIGB2aWV3UHJvdmlkZXJzYCBoYXZlIGJlZW4gaW5zZXJ0ZWQgYWZ0ZXIgdGhlIGNvbXBvbmVudFxuICAgKiBidXQgYmVmb3JlIHRoZSBkaXJlY3RpdmVzLCB3aGljaCBpcyB3aHkgd2UgbmVlZCB0byBrbm93IGhvdyBtYW55IGBtdWx0aWBzIGhhdmUgYmVlbiBkZWNsYXJlZCBieVxuICAgKiB0aGUgY29tcG9uZW50LlxuICAgKi9cbiAgY29tcG9uZW50UHJvdmlkZXJzPzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBDdXJyZW50IGluZGV4IG9mIHRoZSBGYWN0b3J5IGluIHRoZSBgZGF0YWAuIE5lZWRlZCBmb3IgYHZpZXdQcm92aWRlcnNgIGFuZCBgcHJvdmlkZXJzYCBtZXJnaW5nLlxuICAgKiBTZWUgYHByb3ZpZGVyRmFjdG9yeWAuXG4gICAqL1xuICBpbmRleD86IG51bWJlcjtcblxuICAvKipcbiAgICogQmVjYXVzZSB0aGUgc2FtZSBgbXVsdGlgIHByb3ZpZGVyIGNhbiBiZSBkZWNsYXJlZCBpbiBgcHJvdmlkZXNgIGFuZCBgdmlld1Byb3ZpZGVzYCBpdCBpc1xuICAgKiBwb3NzaWJsZSBmb3IgYHZpZXdQcm92aWRlc2AgdG8gc2hhZG93IHRoZSBgcHJvdmlkZXNgLiBGb3IgdGhpcyByZWFzb24gd2Ugc3RvcmUgdGhlXG4gICAqIGBwcm92aWRlRmFjdG9yeWAgb2YgdGhlIGBwcm92aWRlcnNgIHNvIHRoYXQgYHByb3ZpZGVyc2AgY2FuIGJlIGV4dGVuZGVkIHdpdGggYHZpZXdQcm92aWRlcnNgLlxuICAgKlxuICAgKiBFeGFtcGxlOlxuICAgKlxuICAgKiBHaXZlbjpcbiAgICogYGBgXG4gICAqIHByb3ZpZGVzOiBbIHtwcm92aWRlOiBTdHJpbmcsIHVzZVZhbHVlOiAnYWxsJywgbXVsdGk6IHRydWV9IF0sXG4gICAqIHZpZXdQcm92aWRlczogWyB7cHJvdmlkZTogU3RyaW5nLCB1c2VWYWx1ZTogJ3ZpZXdPbmx5JywgbXVsdGk6IHRydWV9IF0sXG4gICAqIGBgYFxuICAgKlxuICAgKiBXZSBoYXZlIHRvIHJldHVybiBgWydhbGwnXWAgaW4gY2FzZSBvZiBjb250ZW50IGluamVjdGlvbiwgYnV0IGBbJ2FsbCcsICd2aWV3T25seSddYCBpbiBjYXNlXG4gICAqIG9mIHZpZXcgaW5qZWN0aW9uLiBXZSBmdXJ0aGVyIGhhdmUgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHNoYXJlZCBpbnN0YW5jZXMgKGluIG91ciBjYXNlXG4gICAqIGBhbGxgKSBhcmUgdGhlIGV4YWN0IHNhbWUgaW5zdGFuY2UgaW4gYm90aCB0aGUgY29udGVudCBhcyB3ZWxsIGFzIHRoZSB2aWV3IGluamVjdGlvbi4gKFdlXG4gICAqIGhhdmUgdG8gbWFrZSBzdXJlIHRoYXQgd2UgZG9uJ3QgZG91YmxlIGluc3RhbnRpYXRlLikgRm9yIHRoaXMgcmVhc29uIHRoZSBgdmlld1Byb3ZpZGVzYFxuICAgKiBgRmFjdG9yeWAgaGFzIGEgcG9pbnRlciB0byB0aGUgc2hhZG93ZWQgYHByb3ZpZGVzYCBmYWN0b3J5IHNvIHRoYXQgaXQgY2FuIGluc3RhbnRpYXRlIHRoZVxuICAgKiBgcHJvdmlkZXJzYCAoYFsnYWxsJ11gKSBhbmQgdGhlbiBleHRlbmQgaXQgd2l0aCBgdmlld1Byb3ZpZGVyc2AgKGBbJ2FsbCddICsgWyd2aWV3T25seSddID1cbiAgICogWydhbGwnLCAndmlld09ubHknXWApLlxuICAgKi9cbiAgcHJvdmlkZXJGYWN0b3J5PzogTm9kZUluamVjdG9yRmFjdG9yeXxudWxsO1xuXG5cbiAgY29uc3RydWN0b3IoXG4gICAgICAvKipcbiAgICAgICAqIEZhY3RvcnkgdG8gaW52b2tlIGluIG9yZGVyIHRvIGNyZWF0ZSBhIG5ldyBpbnN0YW5jZS5cbiAgICAgICAqL1xuICAgICAgcHVibGljIGZhY3Rvcnk6XG4gICAgICAgICAgKHRoaXM6IE5vZGVJbmplY3RvckZhY3RvcnksIF86IG51bGwsXG4gICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBhcnJheSB3aGVyZSBpbmplY3RhYmxlcyB0b2tlbnMgYXJlIHN0b3JlZC4gVGhpcyBpcyB1c2VkIGluXG4gICAgICAgICAgICAqIGNhc2Ugb2YgYW4gZXJyb3IgcmVwb3J0aW5nIHRvIHByb2R1Y2UgZnJpZW5kbGllciBlcnJvcnMuXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICB0RGF0YTogVERhdGEsXG4gICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBhcnJheSB3aGVyZSBleGlzdGluZyBpbnN0YW5jZXMgb2YgaW5qZWN0YWJsZXMgYXJlIHN0b3JlZC4gVGhpcyBpcyB1c2VkIGluIGNhc2VcbiAgICAgICAgICAgICogb2YgbXVsdGkgc2hhZG93IGlzIG5lZWRlZC4gU2VlIGBtdWx0aWAgZmllbGQgZG9jdW1lbnRhdGlvbi5cbiAgICAgICAgICAgICovXG4gICAgICAgICAgIGxEYXRhOiBMVmlld0RhdGEsXG4gICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBUaGUgVE5vZGUgb2YgdGhlIHNhbWUgZWxlbWVudCBpbmplY3Rvci5cbiAgICAgICAgICAgICovXG4gICAgICAgICAgIHROb2RlOiBURWxlbWVudE5vZGUpID0+IGFueSxcbiAgICAgIC8qKlxuICAgICAgICogU2V0IHRvIGB0cnVlYCBpZiB0aGUgdG9rZW4gaXMgZGVjbGFyZWQgaW4gYHZpZXdQcm92aWRlcnNgIChvciBpZiBpdCBpcyBjb21wb25lbnQpLlxuICAgICAgICovXG4gICAgICBpc1ZpZXdQcm92aWRlcjogYm9vbGVhbixcbiAgICAgIGluamVjdEltcGxlbWVudGF0aW9uOiBudWxsfCg8VD4odG9rZW46IFR5cGU8VD58SW5qZWN0aW9uVG9rZW48VD4sIGZsYWdzOiBJbmplY3RGbGFncykgPT4gVCkpIHtcbiAgICB0aGlzLmNhblNlZVZpZXdQcm92aWRlcnMgPSBpc1ZpZXdQcm92aWRlcjtcbiAgICB0aGlzLmluamVjdEltcGwgPSBpbmplY3RJbXBsZW1lbnRhdGlvbjtcbiAgfVxufVxuXG5jb25zdCBGYWN0b3J5UHJvdG90eXBlID0gTm9kZUluamVjdG9yRmFjdG9yeS5wcm90b3R5cGU7XG5leHBvcnQgZnVuY3Rpb24gaXNGYWN0b3J5KG9iajogYW55KTogb2JqIGlzIE5vZGVJbmplY3RvckZhY3Rvcnkge1xuICAvLyBTZWU6IGh0dHBzOi8vanNwZXJmLmNvbS9pbnN0YW5jZW9mLXZzLWdldHByb3RvdHlwZW9mXG4gIHJldHVybiBvYmogIT0gbnVsbCAmJiB0eXBlb2Ygb2JqID09ICdvYmplY3QnICYmIE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopID09IEZhY3RvcnlQcm90b3R5cGU7XG59XG5cbi8vIE5vdGU6IFRoaXMgaGFjayBpcyBuZWNlc3Nhcnkgc28gd2UgZG9uJ3QgZXJyb25lb3VzbHkgZ2V0IGEgY2lyY3VsYXIgZGVwZW5kZW5jeVxuLy8gZmFpbHVyZSBiYXNlZCBvbiB0eXBlcy5cbmV4cG9ydCBjb25zdCB1bnVzZWRWYWx1ZUV4cG9ydFRvUGxhY2F0ZUFqZCA9IDE7XG4iXX0=