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
import { injectViewContainerRef as render3InjectViewContainerRef } from '../render3/view_engine_compatibility';
import { noop } from '../util/noop';
import { ElementRef } from './element_ref';
/**
 * Represents a container where one or more views can be attached to a component.
 *
 * Can contain *host views* (created by instantiating a
 * component with the `createComponent()` method), and *embedded views*
 * (created by instantiating a `TemplateRef` with the `createEmbeddedView()` method).
 *
 * A view container instance can contain other view containers,
 * creating a [view hierarchy](guide/glossary#view-tree).
 *
 * @see `ComponentRef`
 * @see `EmbeddedViewRef`
 *
 * \@publicApi
 * @abstract
 */
export class ViewContainerRef {
}
/**
 * \@internal
 */
ViewContainerRef.__NG_ELEMENT_ID__ = () => SWITCH_VIEW_CONTAINER_REF_FACTORY(ViewContainerRef, ElementRef);
if (false) {
    /**
     * \@internal
     * @type {?}
     */
    ViewContainerRef.__NG_ELEMENT_ID__;
    /**
     * Anchor element that specifies the location of this container in the containing view.
     * Each view container can have only one anchor element, and each anchor element
     * can have only a single view container.
     *
     * Root elements of views attached to this container become siblings of the anchor element in
     * the rendered view.
     *
     * Access the `ViewContainerRef` of an element by placing a `Directive` injected
     * with `ViewContainerRef` on the element, or use a `ViewChild` query.
     *
     * <!-- TODO: rename to anchorElement -->
     * @abstract
     * @return {?}
     */
    ViewContainerRef.prototype.element = function () { };
    /**
     * The [dependency injector](guide/glossary#injector) for this view container.
     * @abstract
     * @return {?}
     */
    ViewContainerRef.prototype.injector = function () { };
    /**
     * @deprecated No replacement
     * @abstract
     * @return {?}
     */
    ViewContainerRef.prototype.parentInjector = function () { };
    /**
     * Destroys all views in this container.
     * @abstract
     * @return {?}
     */
    ViewContainerRef.prototype.clear = function () { };
    /**
     * Retrieves a view from this container.
     * @abstract
     * @param {?} index The 0-based index of the view to retrieve.
     * @return {?} The `ViewRef` instance, or null if the index is out of range.
     */
    ViewContainerRef.prototype.get = function (index) { };
    /**
     * Reports how many views are currently attached to this container.
     * @abstract
     * @return {?} The number of views.
     */
    ViewContainerRef.prototype.length = function () { };
    /**
     * Instantiates an embedded view and inserts it
     * into this container.
     * @abstract
     * @template C
     * @param {?} templateRef The HTML template that defines the view.
     * @param {?=} context
     * @param {?=} index The 0-based index at which to insert the new view into this container.
     * If not specified, appends the new view as the last entry.
     *
     * @return {?} The `ViewRef` instance for the newly created view.
     */
    ViewContainerRef.prototype.createEmbeddedView = function (templateRef, context, index) { };
    /**
     * Instantiates a single component and inserts its host view into this container.
     *
     * @abstract
     * @template C
     * @param {?} componentFactory The factory to use.
     * @param {?=} index The index at which to insert the new component's host view into this container.
     * If not specified, appends the new view as the last entry.
     * @param {?=} injector The injector to use as the parent for the new component.
     * @param {?=} projectableNodes
     * @param {?=} ngModule
     *
     * @return {?} The new component instance, containing the host view.
     *
     */
    ViewContainerRef.prototype.createComponent = function (componentFactory, index, injector, projectableNodes, ngModule) { };
    /**
     * Inserts a view into this container.
     * @abstract
     * @param {?} viewRef The view to insert.
     * @param {?=} index The 0-based index at which to insert the view.
     * If not specified, appends the new view as the last entry.
     * @return {?} The inserted `ViewRef` instance.
     *
     */
    ViewContainerRef.prototype.insert = function (viewRef, index) { };
    /**
     * Moves a view to a new location in this container.
     * @abstract
     * @param {?} viewRef The view to move.
     * @param {?} currentIndex
     * @return {?} The moved `ViewRef` instance.
     */
    ViewContainerRef.prototype.move = function (viewRef, currentIndex) { };
    /**
     * Returns the index of a view within the current container.
     * @abstract
     * @param {?} viewRef The view to query.
     * @return {?} The 0-based index of the view's position in this container,
     * or `-1` if this container doesn't contain the view.
     */
    ViewContainerRef.prototype.indexOf = function (viewRef) { };
    /**
     * Destroys a view attached to this container
     * @abstract
     * @param {?=} index The 0-based index of the view to destroy.
     * If not specified, the last view in the container is removed.
     * @return {?}
     */
    ViewContainerRef.prototype.remove = function (index) { };
    /**
     * Detaches a view from this container without destroying it.
     * Use along with `insert()` to move a view within the current container.
     * @abstract
     * @param {?=} index The 0-based index of the view to detach.
     * If not specified, the last view in the container is detached.
     * @return {?}
     */
    ViewContainerRef.prototype.detach = function (index) { };
}
/** @type {?} */
export const SWITCH_VIEW_CONTAINER_REF_FACTORY__POST_R3__ = render3InjectViewContainerRef;
/** @type {?} */
const SWITCH_VIEW_CONTAINER_REF_FACTORY__PRE_R3__ = noop;
/** @type {?} */
const SWITCH_VIEW_CONTAINER_REF_FACTORY = SWITCH_VIEW_CONTAINER_REF_FACTORY__PRE_R3__;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19jb250YWluZXJfcmVmLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvY29yZS9zcmMvbGlua2VyL3ZpZXdfY29udGFpbmVyX3JlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVNBLE9BQU8sRUFBQyxzQkFBc0IsSUFBSSw2QkFBNkIsRUFBQyxNQUFNLHNDQUFzQyxDQUFDO0FBQzdHLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFHbEMsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFxQnpDLE1BQU0sT0FBZ0IsZ0JBQWdCOzs7OztBQWlIN0Isa0NBQWlCLEdBQ0ssR0FBRyxFQUFFLENBQUMsaUNBQWlDLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLENBQUE7Ozs7OztJQURsRyxtQ0FDa0c7Ozs7Ozs7Ozs7Ozs7Ozs7SUFwR2xHLHFEQUFtQzs7Ozs7O0lBS25DLHNEQUFrQzs7Ozs7O0lBR2xDLDREQUF3Qzs7Ozs7O0lBS3hDLG1EQUF1Qjs7Ozs7OztJQU92QixzREFBMEM7Ozs7OztJQU0xQyxvREFBOEI7Ozs7Ozs7Ozs7Ozs7SUFXOUIsMkZBQ3VCOzs7Ozs7Ozs7Ozs7Ozs7O0lBZXZCLDBIQUU4RTs7Ozs7Ozs7OztJQVU5RSxrRUFBMkQ7Ozs7Ozs7O0lBUTNELHVFQUErRDs7Ozs7Ozs7SUFRL0QsNERBQTJDOzs7Ozs7OztJQU8zQyx5REFBc0M7Ozs7Ozs7OztJQVF0Qyx5REFBOEM7OztBQU9oRCxNQUFNLE9BQU8sNENBQTRDLEdBQUcsNkJBQTZCOztNQUNuRiwyQ0FBMkMsR0FBRyxJQUFJOztNQUNsRCxpQ0FBaUMsR0FDbkMsMkNBQTJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdG9yfSBmcm9tICcuLi9kaS9pbmplY3Rvcic7XG5pbXBvcnQge2luamVjdFZpZXdDb250YWluZXJSZWYgYXMgcmVuZGVyM0luamVjdFZpZXdDb250YWluZXJSZWZ9IGZyb20gJy4uL3JlbmRlcjMvdmlld19lbmdpbmVfY29tcGF0aWJpbGl0eSc7XG5pbXBvcnQge25vb3B9IGZyb20gJy4uL3V0aWwvbm9vcCc7XG5cbmltcG9ydCB7Q29tcG9uZW50RmFjdG9yeSwgQ29tcG9uZW50UmVmfSBmcm9tICcuL2NvbXBvbmVudF9mYWN0b3J5JztcbmltcG9ydCB7RWxlbWVudFJlZn0gZnJvbSAnLi9lbGVtZW50X3JlZic7XG5pbXBvcnQge05nTW9kdWxlUmVmfSBmcm9tICcuL25nX21vZHVsZV9mYWN0b3J5JztcbmltcG9ydCB7VGVtcGxhdGVSZWZ9IGZyb20gJy4vdGVtcGxhdGVfcmVmJztcbmltcG9ydCB7RW1iZWRkZWRWaWV3UmVmLCBWaWV3UmVmfSBmcm9tICcuL3ZpZXdfcmVmJztcblxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBjb250YWluZXIgd2hlcmUgb25lIG9yIG1vcmUgdmlld3MgY2FuIGJlIGF0dGFjaGVkIHRvIGEgY29tcG9uZW50LlxuICpcbiAqIENhbiBjb250YWluICpob3N0IHZpZXdzKiAoY3JlYXRlZCBieSBpbnN0YW50aWF0aW5nIGFcbiAqIGNvbXBvbmVudCB3aXRoIHRoZSBgY3JlYXRlQ29tcG9uZW50KClgIG1ldGhvZCksIGFuZCAqZW1iZWRkZWQgdmlld3MqXG4gKiAoY3JlYXRlZCBieSBpbnN0YW50aWF0aW5nIGEgYFRlbXBsYXRlUmVmYCB3aXRoIHRoZSBgY3JlYXRlRW1iZWRkZWRWaWV3KClgIG1ldGhvZCkuXG4gKlxuICogQSB2aWV3IGNvbnRhaW5lciBpbnN0YW5jZSBjYW4gY29udGFpbiBvdGhlciB2aWV3IGNvbnRhaW5lcnMsXG4gKiBjcmVhdGluZyBhIFt2aWV3IGhpZXJhcmNoeV0oZ3VpZGUvZ2xvc3Nhcnkjdmlldy10cmVlKS5cbiAqXG4gKiBAc2VlIGBDb21wb25lbnRSZWZgXG4gKiBAc2VlIGBFbWJlZGRlZFZpZXdSZWZgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVmlld0NvbnRhaW5lclJlZiB7XG4gIC8qKlxuICAgKiBBbmNob3IgZWxlbWVudCB0aGF0IHNwZWNpZmllcyB0aGUgbG9jYXRpb24gb2YgdGhpcyBjb250YWluZXIgaW4gdGhlIGNvbnRhaW5pbmcgdmlldy5cbiAgICogRWFjaCB2aWV3IGNvbnRhaW5lciBjYW4gaGF2ZSBvbmx5IG9uZSBhbmNob3IgZWxlbWVudCwgYW5kIGVhY2ggYW5jaG9yIGVsZW1lbnRcbiAgICogY2FuIGhhdmUgb25seSBhIHNpbmdsZSB2aWV3IGNvbnRhaW5lci5cbiAgICpcbiAgICogUm9vdCBlbGVtZW50cyBvZiB2aWV3cyBhdHRhY2hlZCB0byB0aGlzIGNvbnRhaW5lciBiZWNvbWUgc2libGluZ3Mgb2YgdGhlIGFuY2hvciBlbGVtZW50IGluXG4gICAqIHRoZSByZW5kZXJlZCB2aWV3LlxuICAgKlxuICAgKiBBY2Nlc3MgdGhlIGBWaWV3Q29udGFpbmVyUmVmYCBvZiBhbiBlbGVtZW50IGJ5IHBsYWNpbmcgYSBgRGlyZWN0aXZlYCBpbmplY3RlZFxuICAgKiB3aXRoIGBWaWV3Q29udGFpbmVyUmVmYCBvbiB0aGUgZWxlbWVudCwgb3IgdXNlIGEgYFZpZXdDaGlsZGAgcXVlcnkuXG4gICAqXG4gICAqIDwhLS0gVE9ETzogcmVuYW1lIHRvIGFuY2hvckVsZW1lbnQgLS0+XG4gICAqL1xuICBhYnN0cmFjdCBnZXQgZWxlbWVudCgpOiBFbGVtZW50UmVmO1xuXG4gIC8qKlxuICAgKiBUaGUgW2RlcGVuZGVuY3kgaW5qZWN0b3JdKGd1aWRlL2dsb3NzYXJ5I2luamVjdG9yKSBmb3IgdGhpcyB2aWV3IGNvbnRhaW5lci5cbiAgICovXG4gIGFic3RyYWN0IGdldCBpbmplY3RvcigpOiBJbmplY3RvcjtcblxuICAvKiogQGRlcHJlY2F0ZWQgTm8gcmVwbGFjZW1lbnQgKi9cbiAgYWJzdHJhY3QgZ2V0IHBhcmVudEluamVjdG9yKCk6IEluamVjdG9yO1xuXG4gIC8qKlxuICAgKiBEZXN0cm95cyBhbGwgdmlld3MgaW4gdGhpcyBjb250YWluZXIuXG4gICAqL1xuICBhYnN0cmFjdCBjbGVhcigpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgYSB2aWV3IGZyb20gdGhpcyBjb250YWluZXIuXG4gICAqIEBwYXJhbSBpbmRleCBUaGUgMC1iYXNlZCBpbmRleCBvZiB0aGUgdmlldyB0byByZXRyaWV2ZS5cbiAgICogQHJldHVybnMgVGhlIGBWaWV3UmVmYCBpbnN0YW5jZSwgb3IgbnVsbCBpZiB0aGUgaW5kZXggaXMgb3V0IG9mIHJhbmdlLlxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0KGluZGV4OiBudW1iZXIpOiBWaWV3UmVmfG51bGw7XG5cbiAgLyoqXG4gICAqIFJlcG9ydHMgaG93IG1hbnkgdmlld3MgYXJlIGN1cnJlbnRseSBhdHRhY2hlZCB0byB0aGlzIGNvbnRhaW5lci5cbiAgICogQHJldHVybnMgVGhlIG51bWJlciBvZiB2aWV3cy5cbiAgICovXG4gIGFic3RyYWN0IGdldCBsZW5ndGgoKTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBJbnN0YW50aWF0ZXMgYW4gZW1iZWRkZWQgdmlldyBhbmQgaW5zZXJ0cyBpdFxuICAgKiBpbnRvIHRoaXMgY29udGFpbmVyLlxuICAgKiBAcGFyYW0gdGVtcGxhdGVSZWYgVGhlIEhUTUwgdGVtcGxhdGUgdGhhdCBkZWZpbmVzIHRoZSB2aWV3LlxuICAgKiBAcGFyYW0gaW5kZXggVGhlIDAtYmFzZWQgaW5kZXggYXQgd2hpY2ggdG8gaW5zZXJ0IHRoZSBuZXcgdmlldyBpbnRvIHRoaXMgY29udGFpbmVyLlxuICAgKiBJZiBub3Qgc3BlY2lmaWVkLCBhcHBlbmRzIHRoZSBuZXcgdmlldyBhcyB0aGUgbGFzdCBlbnRyeS5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGBWaWV3UmVmYCBpbnN0YW5jZSBmb3IgdGhlIG5ld2x5IGNyZWF0ZWQgdmlldy5cbiAgICovXG4gIGFic3RyYWN0IGNyZWF0ZUVtYmVkZGVkVmlldzxDPih0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8Qz4sIGNvbnRleHQ/OiBDLCBpbmRleD86IG51bWJlcik6XG4gICAgICBFbWJlZGRlZFZpZXdSZWY8Qz47XG5cbiAgLyoqXG4gICAqIEluc3RhbnRpYXRlcyBhIHNpbmdsZSBjb21wb25lbnQgYW5kIGluc2VydHMgaXRzIGhvc3QgdmlldyBpbnRvIHRoaXMgY29udGFpbmVyLlxuICAgKlxuICAgKiBAcGFyYW0gY29tcG9uZW50RmFjdG9yeSBUaGUgZmFjdG9yeSB0byB1c2UuXG4gICAqIEBwYXJhbSBpbmRleCBUaGUgaW5kZXggYXQgd2hpY2ggdG8gaW5zZXJ0IHRoZSBuZXcgY29tcG9uZW50J3MgaG9zdCB2aWV3IGludG8gdGhpcyBjb250YWluZXIuXG4gICAqIElmIG5vdCBzcGVjaWZpZWQsIGFwcGVuZHMgdGhlIG5ldyB2aWV3IGFzIHRoZSBsYXN0IGVudHJ5LlxuICAgKiBAcGFyYW0gaW5qZWN0b3IgVGhlIGluamVjdG9yIHRvIHVzZSBhcyB0aGUgcGFyZW50IGZvciB0aGUgbmV3IGNvbXBvbmVudC5cbiAgICogQHBhcmFtIHByb2plY3RhYmxlTm9kZXNcbiAgICogQHBhcmFtIG5nTW9kdWxlXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBuZXcgY29tcG9uZW50IGluc3RhbmNlLCBjb250YWluaW5nIHRoZSBob3N0IHZpZXcuXG4gICAqXG4gICAqL1xuICBhYnN0cmFjdCBjcmVhdGVDb21wb25lbnQ8Qz4oXG4gICAgICBjb21wb25lbnRGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5PEM+LCBpbmRleD86IG51bWJlciwgaW5qZWN0b3I/OiBJbmplY3RvcixcbiAgICAgIHByb2plY3RhYmxlTm9kZXM/OiBhbnlbXVtdLCBuZ01vZHVsZT86IE5nTW9kdWxlUmVmPGFueT4pOiBDb21wb25lbnRSZWY8Qz47XG5cbiAgLyoqXG4gICAqIEluc2VydHMgYSB2aWV3IGludG8gdGhpcyBjb250YWluZXIuXG4gICAqIEBwYXJhbSB2aWV3UmVmIFRoZSB2aWV3IHRvIGluc2VydC5cbiAgICogQHBhcmFtIGluZGV4IFRoZSAwLWJhc2VkIGluZGV4IGF0IHdoaWNoIHRvIGluc2VydCB0aGUgdmlldy5cbiAgICogSWYgbm90IHNwZWNpZmllZCwgYXBwZW5kcyB0aGUgbmV3IHZpZXcgYXMgdGhlIGxhc3QgZW50cnkuXG4gICAqIEByZXR1cm5zIFRoZSBpbnNlcnRlZCBgVmlld1JlZmAgaW5zdGFuY2UuXG4gICAqXG4gICAqL1xuICBhYnN0cmFjdCBpbnNlcnQodmlld1JlZjogVmlld1JlZiwgaW5kZXg/OiBudW1iZXIpOiBWaWV3UmVmO1xuXG4gIC8qKlxuICAgKiBNb3ZlcyBhIHZpZXcgdG8gYSBuZXcgbG9jYXRpb24gaW4gdGhpcyBjb250YWluZXIuXG4gICAqIEBwYXJhbSB2aWV3UmVmIFRoZSB2aWV3IHRvIG1vdmUuXG4gICAqIEBwYXJhbSBpbmRleCBUaGUgMC1iYXNlZCBpbmRleCBvZiB0aGUgbmV3IGxvY2F0aW9uLlxuICAgKiBAcmV0dXJucyBUaGUgbW92ZWQgYFZpZXdSZWZgIGluc3RhbmNlLlxuICAgKi9cbiAgYWJzdHJhY3QgbW92ZSh2aWV3UmVmOiBWaWV3UmVmLCBjdXJyZW50SW5kZXg6IG51bWJlcik6IFZpZXdSZWY7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGluZGV4IG9mIGEgdmlldyB3aXRoaW4gdGhlIGN1cnJlbnQgY29udGFpbmVyLlxuICAgKiBAcGFyYW0gdmlld1JlZiBUaGUgdmlldyB0byBxdWVyeS5cbiAgICogQHJldHVybnMgVGhlIDAtYmFzZWQgaW5kZXggb2YgdGhlIHZpZXcncyBwb3NpdGlvbiBpbiB0aGlzIGNvbnRhaW5lcixcbiAgICogb3IgYC0xYCBpZiB0aGlzIGNvbnRhaW5lciBkb2Vzbid0IGNvbnRhaW4gdGhlIHZpZXcuXG4gICAqL1xuICBhYnN0cmFjdCBpbmRleE9mKHZpZXdSZWY6IFZpZXdSZWYpOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIGEgdmlldyBhdHRhY2hlZCB0byB0aGlzIGNvbnRhaW5lclxuICAgKiBAcGFyYW0gaW5kZXggVGhlIDAtYmFzZWQgaW5kZXggb2YgdGhlIHZpZXcgdG8gZGVzdHJveS5cbiAgICogSWYgbm90IHNwZWNpZmllZCwgdGhlIGxhc3QgdmlldyBpbiB0aGUgY29udGFpbmVyIGlzIHJlbW92ZWQuXG4gICAqL1xuICBhYnN0cmFjdCByZW1vdmUoaW5kZXg/OiBudW1iZXIpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBEZXRhY2hlcyBhIHZpZXcgZnJvbSB0aGlzIGNvbnRhaW5lciB3aXRob3V0IGRlc3Ryb3lpbmcgaXQuXG4gICAqIFVzZSBhbG9uZyB3aXRoIGBpbnNlcnQoKWAgdG8gbW92ZSBhIHZpZXcgd2l0aGluIHRoZSBjdXJyZW50IGNvbnRhaW5lci5cbiAgICogQHBhcmFtIGluZGV4IFRoZSAwLWJhc2VkIGluZGV4IG9mIHRoZSB2aWV3IHRvIGRldGFjaC5cbiAgICogSWYgbm90IHNwZWNpZmllZCwgdGhlIGxhc3QgdmlldyBpbiB0aGUgY29udGFpbmVyIGlzIGRldGFjaGVkLlxuICAgKi9cbiAgYWJzdHJhY3QgZGV0YWNoKGluZGV4PzogbnVtYmVyKTogVmlld1JlZnxudWxsO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgc3RhdGljIF9fTkdfRUxFTUVOVF9JRF9fOlxuICAgICAgKCkgPT4gVmlld0NvbnRhaW5lclJlZiA9ICgpID0+IFNXSVRDSF9WSUVXX0NPTlRBSU5FUl9SRUZfRkFDVE9SWShWaWV3Q29udGFpbmVyUmVmLCBFbGVtZW50UmVmKVxufVxuXG5leHBvcnQgY29uc3QgU1dJVENIX1ZJRVdfQ09OVEFJTkVSX1JFRl9GQUNUT1JZX19QT1NUX1IzX18gPSByZW5kZXIzSW5qZWN0Vmlld0NvbnRhaW5lclJlZjtcbmNvbnN0IFNXSVRDSF9WSUVXX0NPTlRBSU5FUl9SRUZfRkFDVE9SWV9fUFJFX1IzX18gPSBub29wO1xuY29uc3QgU1dJVENIX1ZJRVdfQ09OVEFJTkVSX1JFRl9GQUNUT1JZOiB0eXBlb2YgcmVuZGVyM0luamVjdFZpZXdDb250YWluZXJSZWYgPVxuICAgIFNXSVRDSF9WSUVXX0NPTlRBSU5FUl9SRUZfRkFDVE9SWV9fUFJFX1IzX187XG4iXX0=