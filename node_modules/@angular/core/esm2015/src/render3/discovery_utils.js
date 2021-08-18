/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
import { assertDefined } from './assert';
import { discoverLocalRefs, getComponentAtNodeIndex, getContext, getDirectivesAtNodeIndex } from './context_discovery';
import { CONTEXT, FLAGS, HOST, PARENT, TVIEW } from './interfaces/view';
import { readPatchedLViewData, stringify } from './util';
import { NodeInjector } from './view_engine_compatibility';
/**
 * Returns the component instance associated with a given DOM host element.
 * Elements which don't represent components return `null`.
 *
 * \@publicApi
 * @template T
 * @param {?} element Host DOM element from which the component should be retrieved for.
 *
 * ```
 * <my-app>
 *   #VIEW
 *     <div>
 *       <child-comp></child-comp>
 *     </div>
 * </mp-app>
 *
 * expect(getComponent(<child-comp>) instanceof ChildComponent).toBeTruthy();
 * expect(getComponent(<my-app>) instanceof MyApp).toBeTruthy();
 * ```
 *
 * @return {?}
 */
export function getComponent(element) {
    if (!(element instanceof Node))
        throw new Error('Expecting instance of DOM Node');
    /** @type {?} */
    const context = (/** @type {?} */ (loadContext(element)));
    if (context.component === undefined) {
        context.component = getComponentAtNodeIndex(context.nodeIndex, context.lViewData);
    }
    return (/** @type {?} */ (context.component));
}
/**
 * Returns the component instance associated with view which owns the DOM element (`null`
 * otherwise).
 *
 * \@publicApi
 * @template T
 * @param {?} element DOM element which is owned by an existing component's view.
 *
 * ```
 * <my-app>
 *   #VIEW
 *     <div>
 *       <child-comp></child-comp>
 *     </div>
 * </mp-app>
 *
 * expect(getViewComponent(<child-comp>) instanceof MyApp).toBeTruthy();
 * expect(getViewComponent(<my-app>)).toEqual(null);
 * ```
 *
 * @return {?}
 */
export function getViewComponent(element) {
    /** @type {?} */
    const context = (/** @type {?} */ (loadContext(element)));
    /** @type {?} */
    let lView = context.lViewData;
    while (lView[PARENT] && lView[HOST] === null) {
        // As long as lView[HOST] is null we know we are part of sub-template such as `*ngIf`
        lView = (/** @type {?} */ (lView[PARENT]));
    }
    return lView[FLAGS] & 64 /* IsRoot */ ? null : (/** @type {?} */ (lView[CONTEXT]));
}
/**
 * Returns the `RootContext` instance that is associated with
 * the application where the target is situated.
 *
 * @param {?} target
 * @return {?}
 */
export function getRootContext(target) {
    /** @type {?} */
    const lViewData = Array.isArray(target) ? target : (/** @type {?} */ (loadContext(target))).lViewData;
    /** @type {?} */
    const rootLViewData = getRootView(lViewData);
    return (/** @type {?} */ (rootLViewData[CONTEXT]));
}
/**
 * Retrieve all root components.
 *
 * Root components are those which have been bootstrapped by Angular.
 *
 * \@publicApi
 * @param {?} target A DOM element, component or directive instance.
 *
 * @return {?}
 */
export function getRootComponents(target) {
    return [...getRootContext(target).components];
}
/**
 * Retrieves an `Injector` associated with the element, component or directive.
 *
 * \@publicApi
 * @param {?} target A DOM element, component or directive instance.
 *
 * @return {?}
 */
export function getInjector(target) {
    /** @type {?} */
    const context = loadContext(target);
    /** @type {?} */
    const tNode = (/** @type {?} */ (context.lViewData[TVIEW].data[context.nodeIndex]));
    return new NodeInjector(tNode, context.lViewData);
}
/**
 * Retrieves directives associated with a given DOM host element.
 *
 * \@publicApi
 * @param {?} target A DOM element, component or directive instance.
 *
 * @return {?}
 */
export function getDirectives(target) {
    /** @type {?} */
    const context = (/** @type {?} */ (loadContext(target)));
    if (context.directives === undefined) {
        context.directives = getDirectivesAtNodeIndex(context.nodeIndex, context.lViewData, false);
    }
    return context.directives || [];
}
/**
 * Returns LContext associated with a target passed as an argument.
 * Throws if a given target doesn't have associated LContext.
 *
 * @param {?} target
 * @return {?}
 */
export function loadContext(target) {
    /** @type {?} */
    const context = getContext(target);
    if (!context) {
        throw new Error(ngDevMode ? `Unable to find context associated with ${stringify(target)}` :
            'Invalid ng target');
    }
    return context;
}
/**
 * Retrieve the root view from any component by walking the parent `LViewData` until
 * reaching the root `LViewData`.
 *
 * @param {?} componentOrView any component or view
 *
 * @return {?}
 */
export function getRootView(componentOrView) {
    /** @type {?} */
    let lViewData;
    if (Array.isArray(componentOrView)) {
        ngDevMode && assertDefined(componentOrView, 'lViewData');
        lViewData = (/** @type {?} */ (componentOrView));
    }
    else {
        ngDevMode && assertDefined(componentOrView, 'component');
        lViewData = (/** @type {?} */ (readPatchedLViewData(componentOrView)));
    }
    while (lViewData && !(lViewData[FLAGS] & 64 /* IsRoot */)) {
        lViewData = (/** @type {?} */ (lViewData[PARENT]));
    }
    return lViewData;
}
/**
 * Retrieve map of local references.
 *
 * The references are retrieved as a map of local reference name to element or directive instance.
 *
 * \@publicApi
 * @param {?} target A DOM element, component or directive instance.
 *
 * @return {?}
 */
export function getLocalRefs(target) {
    /** @type {?} */
    const context = (/** @type {?} */ (loadContext(target)));
    if (context.localRefs === undefined) {
        context.localRefs = discoverLocalRefs(context.lViewData, context.nodeIndex);
    }
    return context.localRefs || {};
}
/**
 * Retrieve the host element of the component.
 *
 * Use this function to retrieve the host element of the component. The host
 * element is the element which the component is associated with.
 *
 * \@publicApi
 * @template T
 * @param {?} directive Component or Directive for which the host element should be retrieved.
 *
 * @return {?}
 */
export function getHostElement(directive) {
    return (/** @type {?} */ ((/** @type {?} */ ((/** @type {?} */ (getContext(directive))).native))));
}
/**
 * Retrieves the rendered text for a given component.
 *
 * This function retrieves the host element of a component and
 * and then returns the `textContent` for that element. This implies
 * that the text returned will include re-projected content of
 * the component as well.
 *
 * @param {?} component The component to return the content text for.
 * @return {?}
 */
export function getRenderedText(component) {
    /** @type {?} */
    const hostElement = getHostElement(component);
    return hostElement.textContent || '';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzY292ZXJ5X3V0aWxzLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9kaXNjb3ZlcnlfdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQVNBLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDdkMsT0FBTyxFQUFDLGlCQUFpQixFQUFFLHVCQUF1QixFQUFFLFVBQVUsRUFBRSx3QkFBd0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBR3JILE9BQU8sRUFBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBeUIsTUFBTSxFQUFlLEtBQUssRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzFHLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxTQUFTLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFDdkQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLDZCQUE2QixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXVCekQsTUFBTSxVQUFVLFlBQVksQ0FBUyxPQUFnQjtJQUNuRCxJQUFJLENBQUMsQ0FBQyxPQUFPLFlBQVksSUFBSSxDQUFDO1FBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDOztVQUU1RSxPQUFPLEdBQUcsbUJBQUEsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0lBRXRDLElBQUksT0FBTyxDQUFDLFNBQVMsS0FBSyxTQUFTLEVBQUU7UUFDbkMsT0FBTyxDQUFDLFNBQVMsR0FBRyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNuRjtJQUVELE9BQU8sbUJBQUEsT0FBTyxDQUFDLFNBQVMsRUFBSyxDQUFDO0FBQ2hDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0JELE1BQU0sVUFBVSxnQkFBZ0IsQ0FBUyxPQUFxQjs7VUFDdEQsT0FBTyxHQUFHLG1CQUFBLFdBQVcs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Q0FBQyxrQkFBb0IsQ0FBQyxFQUFFO1FBQzNELFNBQVMsR0FBRyxtQkFBQSxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztLQUNqQztJQUNELE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUM7Ozs7Ozs7Ozs7O0FBV0QsTUFBTSxVQUFVLFlBQVksQ0FBQyxNQUFVOztVQUMvQixPQUFPLEdBQUcsbUJBQUEsV0FBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFO0lBRXJDLElBQUksT0FBTyxDQUFDLFNBQVMsS0FBSyxTQUFTLEVBQUU7UUFDbkMsT0FBTyxDQUFDLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUM3RTtJQUVELE9BQU8sT0FBTyxDQUFDLFNBQVMsSUFBSSxFQUFFLENBQUM7QUFDakMsQ0FBQzs7Ozs7Ozs7Ozs7OztBQVlELE1BQU0sVUFBVSxjQUFjLENBQUksU0FBWTtJQUM1QyxPQUFPLG1CQUFBLG1CQUFBLG1CQUFBLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBUyxFQUFXLENBQUM7QUFDNUQsQ0FBQzs7Ozs7Ozs7Ozs7O0FBWUQsTUFBTSxVQUFVLGVBQWUsQ0FBQyxTQUFjOztVQUN0QyxXQUFXLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQztJQUM3QyxPQUFPLFdBQVcsQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDO0FBQ3ZDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0luamVjdG9yfSBmcm9tICcuLi9kaS9pbmplY3Rvcic7XG5cbmltcG9ydCB7YXNzZXJ0RGVmaW5lZH0gZnJvbSAnLi9hc3NlcnQnO1xuaW1wb3J0IHtkaXNjb3ZlckxvY2FsUmVmcywgZ2V0Q29tcG9uZW50QXROb2RlSW5kZXgsIGdldENvbnRleHQsIGdldERpcmVjdGl2ZXNBdE5vZGVJbmRleH0gZnJvbSAnLi9jb250ZXh0X2Rpc2NvdmVyeSc7XG5pbXBvcnQge0xDb250ZXh0fSBmcm9tICcuL2ludGVyZmFjZXMvY29udGV4dCc7XG5pbXBvcnQge1RFbGVtZW50Tm9kZX0gZnJvbSAnLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtDT05URVhULCBGTEFHUywgSE9TVCwgTFZpZXdEYXRhLCBMVmlld0ZsYWdzLCBQQVJFTlQsIFJvb3RDb250ZXh0LCBUVklFV30gZnJvbSAnLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtyZWFkUGF0Y2hlZExWaWV3RGF0YSwgc3RyaW5naWZ5fSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtOb2RlSW5qZWN0b3J9IGZyb20gJy4vdmlld19lbmdpbmVfY29tcGF0aWJpbGl0eSc7XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBjb21wb25lbnQgaW5zdGFuY2UgYXNzb2NpYXRlZCB3aXRoIGEgZ2l2ZW4gRE9NIGhvc3QgZWxlbWVudC5cbiAqIEVsZW1lbnRzIHdoaWNoIGRvbid0IHJlcHJlc2VudCBjb21wb25lbnRzIHJldHVybiBgbnVsbGAuXG4gKlxuICogQHBhcmFtIGVsZW1lbnQgSG9zdCBET00gZWxlbWVudCBmcm9tIHdoaWNoIHRoZSBjb21wb25lbnQgc2hvdWxkIGJlIHJldHJpZXZlZCBmb3IuXG4gKlxuICogYGBgXG4gKiA8bXktYXBwPlxuICogICAjVklFV1xuICogICAgIDxkaXY+XG4gKiAgICAgICA8Y2hpbGQtY29tcD48L2NoaWxkLWNvbXA+XG4gKiAgICAgPC9kaXY+XG4gKiA8L21wLWFwcD5cbiAqXG4gKiBleHBlY3QoZ2V0Q29tcG9uZW50KDxjaGlsZC1jb21wPikgaW5zdGFuY2VvZiBDaGlsZENvbXBvbmVudCkudG9CZVRydXRoeSgpO1xuICogZXhwZWN0KGdldENvbXBvbmVudCg8bXktYXBwPikgaW5zdGFuY2VvZiBNeUFwcCkudG9CZVRydXRoeSgpO1xuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tcG9uZW50PFQgPSB7fT4oZWxlbWVudDogRWxlbWVudCk6IFR8bnVsbCB7XG4gIGlmICghKGVsZW1lbnQgaW5zdGFuY2VvZiBOb2RlKSkgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RpbmcgaW5zdGFuY2Ugb2YgRE9NIE5vZGUnKTtcblxuICBjb25zdCBjb250ZXh0ID0gbG9hZENvbnRleHQoZWxlbWVudCkgITtcblxuICBpZiAoY29udGV4dC5jb21wb25lbnQgPT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnRleHQuY29tcG9uZW50ID0gZ2V0Q29tcG9uZW50QXROb2RlSW5kZXgoY29udGV4dC5ub2RlSW5kZXgsIGNvbnRleHQubFZpZXdEYXRhKTtcbiAgfVxuXG4gIHJldHVybiBjb250ZXh0LmNvbXBvbmVudCBhcyBUO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGNvbXBvbmVudCBpbnN0YW5jZSBhc3NvY2lhdGVkIHdpdGggdmlldyB3aGljaCBvd25zIHRoZSBET00gZWxlbWVudCAoYG51bGxgXG4gKiBvdGhlcndpc2UpLlxuICpcbiAqIEBwYXJhbSBlbGVtZW50IERPTSBlbGVtZW50IHdoaWNoIGlzIG93bmVkIGJ5IGFuIGV4aXN0aW5nIGNvbXBvbmVudCdzIHZpZXcuXG4gKlxuICogYGBgXG4gKiA8bXktYXBwPlxuICogICAjVklFV1xuICogICAgIDxkaXY+XG4gKiAgICAgICA8Y2hpbGQtY29tcD48L2NoaWxkLWNvbXA+XG4gKiAgICAgPC9kaXY+XG4gKiA8L21wLWFwcD5cbiAqXG4gKiBleHBlY3QoZ2V0Vmlld0NvbXBvbmVudCg8Y2hpbGQtY29tcD4pIGluc3RhbmNlb2YgTXlBcHApLnRvQmVUcnV0aHkoKTtcbiAqIGV4cGVjdChnZXRWaWV3Q29tcG9uZW50KDxteS1hcHA+KSkudG9FcXVhbChudWxsKTtcbiAqIGBgYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFZpZXdDb21wb25lbnQ8VCA9IHt9PihlbGVtZW50OiBFbGVtZW50IHwge30pOiBUfG51bGwge1xuICBjb25zdCBjb250ZXh0ID0gbG9hZENvbnRleHQoZWxlbWVudCkgITtcbiAgbGV0IGxWaWV3OiBMVmlld0RhdGEgPSBjb250ZXh0LmxWaWV3RGF0YTtcbiAgd2hpbGUgKGxWaWV3W1BBUkVOVF0gJiYgbFZpZXdbSE9TVF0gPT09IG51bGwpIHtcbiAgICAvLyBBcyBsb25nIGFzIGxWaWV3W0hPU1RdIGlzIG51bGwgd2Uga25vdyB3ZSBhcmUgcGFydCBvZiBzdWItdGVtcGxhdGUgc3VjaCBhcyBgKm5nSWZgXG4gICAgbFZpZXcgPSBsVmlld1tQQVJFTlRdICE7XG4gIH1cblxuICByZXR1cm4gbFZpZXdbRkxBR1NdICYgTFZpZXdGbGFncy5Jc1Jvb3QgPyBudWxsIDogbFZpZXdbQ09OVEVYVF0gYXMgVDtcbn1cblxuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgYFJvb3RDb250ZXh0YCBpbnN0YW5jZSB0aGF0IGlzIGFzc29jaWF0ZWQgd2l0aFxuICogdGhlIGFwcGxpY2F0aW9uIHdoZXJlIHRoZSB0YXJnZXQgaXMgc2l0dWF0ZWQuXG4gKlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Um9vdENvbnRleHQodGFyZ2V0OiBMVmlld0RhdGEgfCB7fSk6IFJvb3RDb250ZXh0IHtcbiAgY29uc3QgbFZpZXdEYXRhID0gQXJyYXkuaXNBcnJheSh0YXJnZXQpID8gdGFyZ2V0IDogbG9hZENvbnRleHQodGFyZ2V0KSAhLmxWaWV3RGF0YTtcbiAgY29uc3Qgcm9vdExWaWV3RGF0YSA9IGdldFJvb3RWaWV3KGxWaWV3RGF0YSk7XG4gIHJldHVybiByb290TFZpZXdEYXRhW0NPTlRFWFRdIGFzIFJvb3RDb250ZXh0O1xufVxuXG4vKipcbiAqIFJldHJpZXZlIGFsbCByb290IGNvbXBvbmVudHMuXG4gKlxuICogUm9vdCBjb21wb25lbnRzIGFyZSB0aG9zZSB3aGljaCBoYXZlIGJlZW4gYm9vdHN0cmFwcGVkIGJ5IEFuZ3VsYXIuXG4gKlxuICogQHBhcmFtIHRhcmdldCBBIERPTSBlbGVtZW50LCBjb21wb25lbnQgb3IgZGlyZWN0aXZlIGluc3RhbmNlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJvb3RDb21wb25lbnRzKHRhcmdldDoge30pOiBhbnlbXSB7XG4gIHJldHVybiBbLi4uZ2V0Um9vdENvbnRleHQodGFyZ2V0KS5jb21wb25lbnRzXTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgYW4gYEluamVjdG9yYCBhc3NvY2lhdGVkIHdpdGggdGhlIGVsZW1lbnQsIGNvbXBvbmVudCBvciBkaXJlY3RpdmUuXG4gKlxuICogQHBhcmFtIHRhcmdldCBBIERPTSBlbGVtZW50LCBjb21wb25lbnQgb3IgZGlyZWN0aXZlIGluc3RhbmNlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEluamVjdG9yKHRhcmdldDoge30pOiBJbmplY3RvciB7XG4gIGNvbnN0IGNvbnRleHQgPSBsb2FkQ29udGV4dCh0YXJnZXQpO1xuICBjb25zdCB0Tm9kZSA9IGNvbnRleHQubFZpZXdEYXRhW1RWSUVXXS5kYXRhW2NvbnRleHQubm9kZUluZGV4XSBhcyBURWxlbWVudE5vZGU7XG5cbiAgcmV0dXJuIG5ldyBOb2RlSW5qZWN0b3IodE5vZGUsIGNvbnRleHQubFZpZXdEYXRhKTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgZGlyZWN0aXZlcyBhc3NvY2lhdGVkIHdpdGggYSBnaXZlbiBET00gaG9zdCBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB0YXJnZXQgQSBET00gZWxlbWVudCwgY29tcG9uZW50IG9yIGRpcmVjdGl2ZSBpbnN0YW5jZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREaXJlY3RpdmVzKHRhcmdldDoge30pOiBBcnJheTx7fT4ge1xuICBjb25zdCBjb250ZXh0ID0gbG9hZENvbnRleHQodGFyZ2V0KSAhO1xuXG4gIGlmIChjb250ZXh0LmRpcmVjdGl2ZXMgPT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnRleHQuZGlyZWN0aXZlcyA9IGdldERpcmVjdGl2ZXNBdE5vZGVJbmRleChjb250ZXh0Lm5vZGVJbmRleCwgY29udGV4dC5sVmlld0RhdGEsIGZhbHNlKTtcbiAgfVxuXG4gIHJldHVybiBjb250ZXh0LmRpcmVjdGl2ZXMgfHwgW107XG59XG5cbi8qKlxuICogUmV0dXJucyBMQ29udGV4dCBhc3NvY2lhdGVkIHdpdGggYSB0YXJnZXQgcGFzc2VkIGFzIGFuIGFyZ3VtZW50LlxuICogVGhyb3dzIGlmIGEgZ2l2ZW4gdGFyZ2V0IGRvZXNuJ3QgaGF2ZSBhc3NvY2lhdGVkIExDb250ZXh0LlxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvYWRDb250ZXh0KHRhcmdldDoge30pOiBMQ29udGV4dCB7XG4gIGNvbnN0IGNvbnRleHQgPSBnZXRDb250ZXh0KHRhcmdldCk7XG4gIGlmICghY29udGV4dCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgbmdEZXZNb2RlID8gYFVuYWJsZSB0byBmaW5kIGNvbnRleHQgYXNzb2NpYXRlZCB3aXRoICR7c3RyaW5naWZ5KHRhcmdldCl9YCA6XG4gICAgICAgICAgICAgICAgICAgICdJbnZhbGlkIG5nIHRhcmdldCcpO1xuICB9XG4gIHJldHVybiBjb250ZXh0O1xufVxuXG4vKipcbiAqIFJldHJpZXZlIHRoZSByb290IHZpZXcgZnJvbSBhbnkgY29tcG9uZW50IGJ5IHdhbGtpbmcgdGhlIHBhcmVudCBgTFZpZXdEYXRhYCB1bnRpbFxuICogcmVhY2hpbmcgdGhlIHJvb3QgYExWaWV3RGF0YWAuXG4gKlxuICogQHBhcmFtIGNvbXBvbmVudE9yVmlldyBhbnkgY29tcG9uZW50IG9yIHZpZXdcbiAqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRSb290Vmlldyhjb21wb25lbnRPclZpZXc6IExWaWV3RGF0YSB8IHt9KTogTFZpZXdEYXRhIHtcbiAgbGV0IGxWaWV3RGF0YTogTFZpZXdEYXRhO1xuICBpZiAoQXJyYXkuaXNBcnJheShjb21wb25lbnRPclZpZXcpKSB7XG4gICAgbmdEZXZNb2RlICYmIGFzc2VydERlZmluZWQoY29tcG9uZW50T3JWaWV3LCAnbFZpZXdEYXRhJyk7XG4gICAgbFZpZXdEYXRhID0gY29tcG9uZW50T3JWaWV3IGFzIExWaWV3RGF0YTtcbiAgfSBlbHNlIHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZChjb21wb25lbnRPclZpZXcsICdjb21wb25lbnQnKTtcbiAgICBsVmlld0RhdGEgPSByZWFkUGF0Y2hlZExWaWV3RGF0YShjb21wb25lbnRPclZpZXcpICE7XG4gIH1cbiAgd2hpbGUgKGxWaWV3RGF0YSAmJiAhKGxWaWV3RGF0YVtGTEFHU10gJiBMVmlld0ZsYWdzLklzUm9vdCkpIHtcbiAgICBsVmlld0RhdGEgPSBsVmlld0RhdGFbUEFSRU5UXSAhO1xuICB9XG4gIHJldHVybiBsVmlld0RhdGE7XG59XG5cbi8qKlxuICogUmV0cmlldmUgbWFwIG9mIGxvY2FsIHJlZmVyZW5jZXMuXG4gKlxuICogVGhlIHJlZmVyZW5jZXMgYXJlIHJldHJpZXZlZCBhcyBhIG1hcCBvZiBsb2NhbCByZWZlcmVuY2UgbmFtZSB0byBlbGVtZW50IG9yIGRpcmVjdGl2ZSBpbnN0YW5jZS5cbiAqXG4gKiBAcGFyYW0gdGFyZ2V0IEEgRE9NIGVsZW1lbnQsIGNvbXBvbmVudCBvciBkaXJlY3RpdmUgaW5zdGFuY2UuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxSZWZzKHRhcmdldDoge30pOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gIGNvbnN0IGNvbnRleHQgPSBsb2FkQ29udGV4dCh0YXJnZXQpICE7XG5cbiAgaWYgKGNvbnRleHQubG9jYWxSZWZzID09PSB1bmRlZmluZWQpIHtcbiAgICBjb250ZXh0LmxvY2FsUmVmcyA9IGRpc2NvdmVyTG9jYWxSZWZzKGNvbnRleHQubFZpZXdEYXRhLCBjb250ZXh0Lm5vZGVJbmRleCk7XG4gIH1cblxuICByZXR1cm4gY29udGV4dC5sb2NhbFJlZnMgfHwge307XG59XG5cbi8qKlxuICogUmV0cmlldmUgdGhlIGhvc3QgZWxlbWVudCBvZiB0aGUgY29tcG9uZW50LlxuICpcbiAqIFVzZSB0aGlzIGZ1bmN0aW9uIHRvIHJldHJpZXZlIHRoZSBob3N0IGVsZW1lbnQgb2YgdGhlIGNvbXBvbmVudC4gVGhlIGhvc3RcbiAqIGVsZW1lbnQgaXMgdGhlIGVsZW1lbnQgd2hpY2ggdGhlIGNvbXBvbmVudCBpcyBhc3NvY2lhdGVkIHdpdGguXG4gKlxuICogQHBhcmFtIGRpcmVjdGl2ZSBDb21wb25lbnQgb3IgRGlyZWN0aXZlIGZvciB3aGljaCB0aGUgaG9zdCBlbGVtZW50IHNob3VsZCBiZSByZXRyaWV2ZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SG9zdEVsZW1lbnQ8VD4oZGlyZWN0aXZlOiBUKTogRWxlbWVudCB7XG4gIHJldHVybiBnZXRDb250ZXh0KGRpcmVjdGl2ZSkgIS5uYXRpdmUgYXMgbmV2ZXIgYXMgRWxlbWVudDtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIHJlbmRlcmVkIHRleHQgZm9yIGEgZ2l2ZW4gY29tcG9uZW50LlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gcmV0cmlldmVzIHRoZSBob3N0IGVsZW1lbnQgb2YgYSBjb21wb25lbnQgYW5kXG4gKiBhbmQgdGhlbiByZXR1cm5zIHRoZSBgdGV4dENvbnRlbnRgIGZvciB0aGF0IGVsZW1lbnQuIFRoaXMgaW1wbGllc1xuICogdGhhdCB0aGUgdGV4dCByZXR1cm5lZCB3aWxsIGluY2x1ZGUgcmUtcHJvamVjdGVkIGNvbnRlbnQgb2ZcbiAqIHRoZSBjb21wb25lbnQgYXMgd2VsbC5cbiAqXG4gKiBAcGFyYW0gY29tcG9uZW50IFRoZSBjb21wb25lbnQgdG8gcmV0dXJuIHRoZSBjb250ZW50IHRleHQgZm9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVuZGVyZWRUZXh0KGNvbXBvbmVudDogYW55KTogc3RyaW5nIHtcbiAgY29uc3QgaG9zdEVsZW1lbnQgPSBnZXRIb3N0RWxlbWVudChjb21wb25lbnQpO1xuICByZXR1cm4gaG9zdEVsZW1lbnQudGV4dENvbnRlbnQgfHwgJyc7XG59Il19