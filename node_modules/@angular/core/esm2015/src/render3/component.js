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
import { assertComponentType, assertDefined } from './assert';
import { getComponentDef } from './definition';
import { diPublicInInjector, getOrCreateNodeInjectorForNode } from './di';
import { publishDefaultGlobalUtils } from './global_utils';
import { queueInitHooks, queueLifecycleHooks } from './hooks';
import { CLEAN_PROMISE, createLViewData, createNodeAtIndex, createTView, getOrCreateTView, initNodeFlags, instantiateRootComponent, locateHostElement, prefillHostVars, queueComponentIndexForCheck, refreshDescendantViews } from './instructions';
import { domRendererFactory3 } from './interfaces/renderer';
import { CONTEXT, HEADER_OFFSET, HOST, HOST_NODE, TVIEW } from './interfaces/view';
import { enterView, leaveView, resetComponentState } from './state';
import { defaultScheduler, getRootView, readPatchedLViewData, stringify } from './util';
/**
 * Options that control how the component should be bootstrapped.
 * @record
 */
export function CreateComponentOptions() { }
if (false) {
    /**
     * Which renderer factory to use.
     * @type {?|undefined}
     */
    CreateComponentOptions.prototype.rendererFactory;
    /**
     * A custom sanitizer instance
     * @type {?|undefined}
     */
    CreateComponentOptions.prototype.sanitizer;
    /**
     * A custom animation player handler
     * @type {?|undefined}
     */
    CreateComponentOptions.prototype.playerHandler;
    /**
     * Host element on which the component will be bootstrapped. If not specified,
     * the component definition's `tag` is used to query the existing DOM for the
     * element to bootstrap.
     * @type {?|undefined}
     */
    CreateComponentOptions.prototype.host;
    /**
     * Module injector for the component. If unspecified, the injector will be NULL_INJECTOR.
     * @type {?|undefined}
     */
    CreateComponentOptions.prototype.injector;
    /**
     * List of features to be applied to the created component. Features are simply
     * functions that decorate a component with a certain behavior.
     *
     * Typically, the features in this list are features that cannot be added to the
     * other features list in the component definition because they rely on other factors.
     *
     * Example: `RootLifecycleHooks` is a function that adds lifecycle hook capabilities
     * to root components in a tree-shakable way. It cannot be added to the component
     * features list because there's no way of knowing when the component will be used as
     * a root component.
     * @type {?|undefined}
     */
    CreateComponentOptions.prototype.hostFeatures;
    /**
     * A function which is used to schedule change detection work in the future.
     *
     * When marking components as dirty, it is necessary to schedule the work of
     * change detection in the future. This is done to coalesce multiple
     * {\@link markDirty} calls into a single changed detection processing.
     *
     * The default value of the scheduler is the `requestAnimationFrame` function.
     *
     * It is also useful to override this function for testing purposes.
     * @type {?|undefined}
     */
    CreateComponentOptions.prototype.scheduler;
}
// TODO: A hack to not pull in the NullInjector from @angular/core.
/** @type {?} */
export const NULL_INJECTOR = {
    get: (token, notFoundValue) => {
        throw new Error('NullInjector: Not found: ' + stringify(token));
    }
};
/**
 * Bootstraps a Component into an existing host element and returns an instance
 * of the component.
 *
 * Use this function to bootstrap a component into the DOM tree. Each invocation
 * of this function will create a separate tree of components, injectors and
 * change detection cycles and lifetimes. To dynamically insert a new component
 * into an existing tree such that it shares the same injection, change detection
 * and object lifetime, use {\@link ViewContainer#createComponent}.
 *
 * @template T
 * @param {?} componentType Component to bootstrap
 * @param {?=} opts
 * @return {?}
 */
export function renderComponent(componentType /* Type as workaround for: Microsoft/TypeScript/issues/4881 */, opts = {}) {
    ngDevMode && publishDefaultGlobalUtils();
    ngDevMode && assertComponentType(componentType);
    /** @type {?} */
    const rendererFactory = opts.rendererFactory || domRendererFactory3;
    /** @type {?} */
    const sanitizer = opts.sanitizer || null;
    /** @type {?} */
    const componentDef = (/** @type {?} */ (getComponentDef(componentType)));
    if (componentDef.type != componentType)
        componentDef.type = componentType;
    // The first index of the first selector is the tag name.
    /** @type {?} */
    const componentTag = (/** @type {?} */ ((/** @type {?} */ ((/** @type {?} */ (componentDef.selectors))[0]))[0]));
    /** @type {?} */
    const hostRNode = locateHostElement(rendererFactory, opts.host || componentTag);
    /** @type {?} */
    const rootFlags = componentDef.onPush ? 4 /* Dirty */ | 64 /* IsRoot */ :
        2 /* CheckAlways */ | 64 /* IsRoot */;
    /** @type {?} */
    const rootContext = createRootContext(opts.scheduler, opts.playerHandler);
    /** @type {?} */
    const renderer = rendererFactory.createRenderer(hostRNode, componentDef);
    /** @type {?} */
    const rootView = createLViewData(null, renderer, createTView(-1, null, 1, 0, null, null, null), rootContext, rootFlags, undefined, opts.injector || null);
    /** @type {?} */
    const oldView = enterView(rootView, null);
    /** @type {?} */
    let component;
    try {
        if (rendererFactory.begin)
            rendererFactory.begin();
        /** @type {?} */
        const componentView = createRootComponentView(hostRNode, componentDef, rootView, renderer, sanitizer);
        component = createRootComponent(componentView, componentDef, rootView, rootContext, opts.hostFeatures || null);
        refreshDescendantViews(rootView, null);
    }
    finally {
        leaveView(oldView);
        if (rendererFactory.end)
            rendererFactory.end();
    }
    return component;
}
/**
 * Creates the root component view and the root component node.
 *
 * @param {?} rNode Render host element.
 * @param {?} def ComponentDef
 * @param {?} rootView The parent view where the host node is stored
 * @param {?} renderer The current renderer
 * @param {?=} sanitizer The sanitizer, if provided
 *
 * @return {?} Component view created
 */
export function createRootComponentView(rNode, def, rootView, renderer, sanitizer) {
    resetComponentState();
    /** @type {?} */
    const tView = rootView[TVIEW];
    /** @type {?} */
    const componentView = createLViewData(rootView, renderer, getOrCreateTView(def.template, def.consts, def.vars, def.directiveDefs, def.pipeDefs, def.viewQuery), null, def.onPush ? 4 /* Dirty */ : 2 /* CheckAlways */, sanitizer);
    /** @type {?} */
    const tNode = createNodeAtIndex(0, 3 /* Element */, rNode, null, null);
    if (tView.firstTemplatePass) {
        diPublicInInjector(getOrCreateNodeInjectorForNode(tNode, rootView), rootView, def.type);
        tNode.flags = 4096 /* isComponent */;
        initNodeFlags(tNode, rootView.length, 1);
        queueComponentIndexForCheck(tNode);
    }
    // Store component view at node index, with node as the HOST
    componentView[HOST] = rootView[HEADER_OFFSET];
    componentView[HOST_NODE] = (/** @type {?} */ (tNode));
    return rootView[HEADER_OFFSET] = componentView;
}
/**
 * Creates a root component and sets it up with features and host bindings. Shared by
 * renderComponent() and ViewContainerRef.createComponent().
 * @template T
 * @param {?} componentView
 * @param {?} componentDef
 * @param {?} rootView
 * @param {?} rootContext
 * @param {?} hostFeatures
 * @return {?}
 */
export function createRootComponent(componentView, componentDef, rootView, rootContext, hostFeatures) {
    /** @type {?} */
    const tView = rootView[TVIEW];
    // Create directive instance with factory() and store at next index in viewData
    /** @type {?} */
    const component = instantiateRootComponent(tView, rootView, componentDef);
    rootContext.components.push(component);
    componentView[CONTEXT] = component;
    hostFeatures && hostFeatures.forEach((feature) => feature(component, componentDef));
    if (tView.firstTemplatePass)
        prefillHostVars(tView, rootView, componentDef.hostVars);
    return component;
}
/**
 * @param {?=} scheduler
 * @param {?=} playerHandler
 * @return {?}
 */
export function createRootContext(scheduler, playerHandler) {
    return {
        components: [],
        scheduler: scheduler || defaultScheduler,
        clean: CLEAN_PROMISE,
        playerHandler: playerHandler || null,
        flags: 0 /* Empty */
    };
}
/**
 * Used to enable lifecycle hooks on the root component.
 *
 * Include this feature when calling `renderComponent` if the root component
 * you are rendering has lifecycle hooks defined. Otherwise, the hooks won't
 * be called properly.
 *
 * Example:
 *
 * ```
 * renderComponent(AppComponent, {features: [RootLifecycleHooks]});
 * ```
 * @param {?} component
 * @param {?} def
 * @return {?}
 */
export function LifecycleHooksFeature(component, def) {
    /** @type {?} */
    const rootTView = (/** @type {?} */ (readPatchedLViewData(component)))[TVIEW];
    /** @type {?} */
    const dirIndex = rootTView.data.length - 1;
    queueInitHooks(dirIndex, def.onInit, def.doCheck, rootTView);
    queueLifecycleHooks(dirIndex << 16 /* DirectiveStartingIndexShift */ | 1, rootTView);
}
/**
 * Retrieve the root context for any component by walking the parent `LView` until
 * reaching the root `LView`.
 *
 * @param {?} component any component
 * @return {?}
 */
function getRootContext(component) {
    /** @type {?} */
    const rootContext = (/** @type {?} */ (getRootView(component)[CONTEXT]));
    ngDevMode && assertDefined(rootContext, 'rootContext');
    return rootContext;
}
/**
 * Wait on component until it is rendered.
 *
 * This function returns a `Promise` which is resolved when the component's
 * change detection is executed. This is determined by finding the scheduler
 * associated with the `component`'s render tree and waiting until the scheduler
 * flushes. If nothing is scheduled, the function returns a resolved promise.
 *
 * Example:
 * ```
 * await whenRendered(myComponent);
 * ```
 *
 * @param {?} component Component to wait upon
 * @return {?} Promise which resolves when the component is rendered.
 */
export function whenRendered(component) {
    return getRootContext(component).clean;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFjQSxPQUFPLEVBQUMsbUJBQW1CLEVBQUUsYUFBYSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBRTVELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDN0MsT0FBTyxFQUFDLGtCQUFrQixFQUFFLDhCQUE4QixFQUFDLE1BQU0sTUFBTSxDQUFDO0FBRXhFLE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3pELE9BQU8sRUFBQyxjQUFjLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDNUQsT0FBTyxFQUFDLGFBQWEsRUFBRSxlQUFlLEVBQUUsaUJBQWlCLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSx3QkFBd0IsRUFBRSxpQkFBaUIsRUFBRSxlQUFlLEVBQUUsMkJBQTJCLEVBQUUsc0JBQXNCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUlsUCxPQUFPLEVBQXdDLG1CQUFtQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDakcsT0FBTyxFQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBa0UsS0FBSyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakosT0FBTyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDbEUsT0FBTyxFQUFDLGdCQUFnQixFQUFFLFdBQVcsRUFBb0Isb0JBQW9CLEVBQUUsU0FBUyxFQUFDLE1BQU0sUUFBUSxDQUFDOzs7OztBQUt4Ryw0Q0E4Q0M7Ozs7OztJQTVDQyxpREFBbUM7Ozs7O0lBR25DLDJDQUFzQjs7Ozs7SUFHdEIsK0NBQThCOzs7Ozs7O0lBTzlCLHNDQUF1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LENBQUMsU0FBYzs7VUFDOUIsV0FBVyxHQUFHLG1CQUFBLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBZTtJQUNsRSxTQUFTLElBQUksYUFBYSxDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUN2RCxPQUFPLFdBQVcsQ0FBQztBQUNyQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7OztBQW1CRCxNQUFNLFVBQVUsWUFBWSxDQUFDLFNBQWM7SUFDekMsT0FBTyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ3pDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8vIFdlIGFyZSB0ZW1wb3JhcmlseSBpbXBvcnRpbmcgdGhlIGV4aXN0aW5nIHZpZXdFbmdpbmUgZnJvbSBjb3JlIHNvIHdlIGNhbiBiZSBzdXJlIHdlIGFyZVxuLy8gY29ycmVjdGx5IGltcGxlbWVudGluZyBpdHMgaW50ZXJmYWNlcyBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuXG5pbXBvcnQge1R5cGV9IGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnLi4vZGkvaW5qZWN0b3InO1xuaW1wb3J0IHtTYW5pdGl6ZXJ9IGZyb20gJy4uL3Nhbml0aXphdGlvbi9zZWN1cml0eSc7XG5cbmltcG9ydCB7YXNzZXJ0Q29tcG9uZW50VHlwZSwgYXNzZXJ0RGVmaW5lZH0gZnJvbSAnLi9hc3NlcnQnO1xuaW1wb3J0IHtnZXRDb250ZXh0fSBmcm9tICcuL2NvbnRleHRfZGlzY292ZXJ5JztcbmltcG9ydCB7Z2V0Q29tcG9uZW50RGVmfSBmcm9tICcuL2RlZmluaXRpb24nO1xuaW1wb3J0IHtkaVB1YmxpY0luSW5qZWN0b3IsIGdldE9yQ3JlYXRlTm9kZUluamVjdG9yRm9yTm9kZX0gZnJvbSAnLi9kaSc7XG5pbXBvcnQge2dldEhvc3RFbGVtZW50fSBmcm9tICcuL2Rpc2NvdmVyeV91dGlscyc7XG5pbXBvcnQge3B1Ymxpc2hEZWZhdWx0R2xvYmFsVXRpbHN9IGZyb20gJy4vZ2xvYmFsX3V0aWxzJztcbmltcG9ydCB7cXVldWVJbml0SG9va3MsIHF1ZXVlTGlmZWN5Y2xlSG9va3N9IGZyb20gJy4vaG9va3MnO1xuaW1wb3J0IHtDTEVBTl9QUk9NSVNFLCBjcmVhdGVMVmlld0RhdGEsIGNyZWF0ZU5vZGVBdEluZGV4LCBjcmVhdGVUVmlldywgZ2V0T3JDcmVhdGVUVmlldywgaW5pdE5vZGVGbGFncywgaW5zdGFudGlhdGVSb290Q29tcG9uZW50LCBsb2NhdGVIb3N0RWxlbWVudCwgcHJlZmlsbEhvc3RWYXJzLCBxdWV1ZUNvbXBvbmVudEluZGV4Rm9yQ2hlY2ssIHJlZnJlc2hEZXNjZW5kYW50Vmlld3N9IGZyb20gJy4vaW5zdHJ1Y3Rpb25zJztcbmltcG9ydCB7Q29tcG9uZW50RGVmLCBDb21wb25lbnRUeXBlfSBmcm9tICcuL2ludGVyZmFjZXMvZGVmaW5pdGlvbic7XG5pbXBvcnQge1RFbGVtZW50Tm9kZSwgVE5vZGVGbGFncywgVE5vZGVUeXBlfSBmcm9tICcuL2ludGVyZmFjZXMvbm9kZSc7XG5pbXBvcnQge1BsYXllckhhbmRsZXJ9IGZyb20gJy4vaW50ZXJmYWNlcy9wbGF5ZXInO1xuaW1wb3J0IHtSRWxlbWVudCwgUmVuZGVyZXIzLCBSZW5kZXJlckZhY3RvcnkzLCBkb21SZW5kZXJlckZhY3RvcnkzfSBmcm9tICcuL2ludGVyZmFjZXMvcmVuZGVyZXInO1xuaW1wb3J0IHtDT05URVhULCBIRUFERVJfT0ZGU0VULCBIT1NULCBIT1NUX05PREUsIElOSkVDVE9SLCBMVmlld0RhdGEsIExWaWV3RmxhZ3MsIFJvb3RDb250ZXh0LCBSb290Q29udGV4dEZsYWdzLCBUVklFV30gZnJvbSAnLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtlbnRlclZpZXcsIGxlYXZlVmlldywgcmVzZXRDb21wb25lbnRTdGF0ZX0gZnJvbSAnLi9zdGF0ZSc7XG5pbXBvcnQge2RlZmF1bHRTY2hlZHVsZXIsIGdldFJvb3RWaWV3LCByZWFkRWxlbWVudFZhbHVlLCByZWFkUGF0Y2hlZExWaWV3RGF0YSwgc3RyaW5naWZ5fSBmcm9tICcuL3V0aWwnO1xuXG5cblxuLyoqIE9wdGlvbnMgdGhhdCBjb250cm9sIGhvdyB0aGUgY29tcG9uZW50IHNob3VsZCBiZSBib290c3RyYXBwZWQuICovXG5leHBvcnQgaW50ZXJmYWNlIENyZWF0ZUNvbXBvbmVudE9wdGlvbnMge1xuICAvKiogV2hpY2ggcmVuZGVyZXIgZmFjdG9yeSB0byB1c2UuICovXG4gIHJlbmRlcmVyRmFjdG9yeT86IFJlbmRlcmVyRmFjdG9yeTM7XG5cbiAgLyoqIEEgY3VzdG9tIHNhbml0aXplciBpbnN0YW5jZSAqL1xuICBzYW5pdGl6ZXI/OiBTYW5pdGl6ZXI7XG5cbiAgLyoqIEEgY3VzdG9tIGFuaW1hdGlvbiBwbGF5ZXIgaGFuZGxlciAqL1xuICBwbGF5ZXJIYW5kbGVyPzogUGxheWVySGFuZGxlcjtcblxuICAvKipcbiAgICogSG9zdCBlbGVtZW50IG9uIHdoaWNoIHRoZSBjb21wb25lbnQgd2lsbCBiZSBib290c3RyYXBwZWQuIElmIG5vdCBzcGVjaWZpZWQsXG4gICAqIHRoZSBjb21wb25lbnQgZGVmaW5pdGlvbidzIGB0YWdgIGlzIHVzZWQgdG8gcXVlcnkgdGhlIGV4aXN0aW5nIERPTSBmb3IgdGhlXG4gICAqIGVsZW1lbnQgdG8gYm9vdHN0cmFwLlxuICAgKi9cbiAgaG9zdD86IFJFbGVtZW50fHN0cmluZztcblxuICAvKiogTW9kdWxlIGluamVjdG9yIGZvciB0aGUgY29tcG9uZW50LiBJZiB1bnNwZWNpZmllZCwgdGhlIGluamVjdG9yIHdpbGwgYmUgTlVMTF9JTkpFQ1RPUi4gKi9cbiAgaW5qZWN0b3I/OiBJbmplY3RvcjtcblxuICAvKipcbiAgICogTGlzdCBvZiBmZWF0dXJlcyB0byBiZSBhcHBsaWVkIHRvIHRoZSBjcmVhdGVkIGNvbXBvbmVudC4gRmVhdHVyZXMgYXJlIHNpbXBseVxuICAgKiBmdW5jdGlvbnMgdGhhdCBkZWNvcmF0ZSBhIGNvbXBvbmVudCB3aXRoIGEgY2VydGFpbiBiZWhhdmlvci5cbiAgICpcbiAgICogVHlwaWNhbGx5LCB0aGUgZmVhdHVyZXMgaW4gdGhpcyBsaXN0IGFyZSBmZWF0dXJlcyB0aGF0IGNhbm5vdCBiZSBhZGRlZCB0byB0aGVcbiAgICogb3RoZXIgZmVhdHVyZXMgbGlzdCBpbiB0aGUgY29tcG9uZW50IGRlZmluaXRpb24gYmVjYXVzZSB0aGV5IHJlbHkgb24gb3RoZXIgZmFjdG9ycy5cbiAgICpcbiAgICogRXhhbXBsZTogYFJvb3RMaWZlY3ljbGVIb29rc2AgaXMgYSBmdW5jdGlvbiB0aGF0IGFkZHMgbGlmZWN5Y2xlIGhvb2sgY2FwYWJpbGl0aWVzXG4gICAqIHRvIHJvb3QgY29tcG9uZW50cyBpbiBhIHRyZWUtc2hha2FibGUgd2F5LiBJdCBjYW5ub3QgYmUgYWRkZWQgdG8gdGhlIGNvbXBvbmVudFxuICAgKiBmZWF0dXJlcyBsaXN0IGJlY2F1c2UgdGhlcmUncyBubyB3YXkgb2Yga25vd2luZyB3aGVuIHRoZSBjb21wb25lbnQgd2lsbCBiZSB1c2VkIGFzXG4gICAqIGEgcm9vdCBjb21wb25lbnQuXG4gICAqL1xuICBob3N0RmVhdHVyZXM/OiBIb3N0RmVhdHVyZVtdO1xuXG4gIC8qKlxuICAgKiBBIGZ1bmN0aW9uIHdoaWNoIGlzIHVzZWQgdG8gc2NoZWR1bGUgY2hhbmdlIGRldGVjdGlvbiB3b3JrIGluIHRoZSBmdXR1cmUuXG4gICAqXG4gICAqIFdoZW4gbWFya2luZyBjb21wb25lbnRzIGFzIGRpcnR5LCBpdCBpcyBuZWNlc3NhcnkgdG8gc2NoZWR1bGUgdGhlIHdvcmsgb2ZcbiAgICogY2hhbmdlIGRldGVjdGlvbiBpbiB0aGUgZnV0dXJlLiBUaGlzIGlzIGRvbmUgdG8gY29hbGVzY2UgbXVsdGlwbGVcbiAgICoge0BsaW5rIG1hcmtEaXJ0eX0gY2FsbHMgaW50byBhIHNpbmdsZSBjaGFuZ2VkIGRldGVjdGlvbiBwcm9jZXNzaW5nLlxuICAgKlxuICAgKiBUaGUgZGVmYXVsdCB2YWx1ZSBvZiB0aGUgc2NoZWR1bGVyIGlzIHRoZSBgcmVxdWVzdEFuaW1hdGlvbkZyYW1lYCBmdW5jdGlvbi5cbiAgICpcbiAgICogSXQgaXMgYWxzbyB1c2VmdWwgdG8gb3ZlcnJpZGUgdGhpcyBmdW5jdGlvbiBmb3IgdGVzdGluZyBwdXJwb3Nlcy5cbiAgICovXG4gIHNjaGVkdWxlcj86ICh3b3JrOiAoKSA9PiB2b2lkKSA9PiB2b2lkO1xufVxuXG4vKiogU2VlIENyZWF0ZUNvbXBvbmVudE9wdGlvbnMuaG9zdEZlYXR1cmVzICovXG50eXBlIEhvc3RGZWF0dXJlID0gKDxUPihjb21wb25lbnQ6IFQsIGNvbXBvbmVudERlZjogQ29tcG9uZW50RGVmPFQ+KSA9PiB2b2lkKTtcblxuLy8gVE9ETzogQSBoYWNrIHRvIG5vdCBwdWxsIGluIHRoZSBOdWxsSW5qZWN0b3IgZnJvbSBAYW5ndWxhci9jb3JlLlxuZXhwb3J0IGNvbnN0IE5VTExfSU5KRUNUT1I6IEluamVjdG9yID0ge1xuICBnZXQ6ICh0b2tlbjogYW55LCBub3RGb3VuZFZhbHVlPzogYW55KSA9PiB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOdWxsSW5qZWN0b3I6IE5vdCBmb3VuZDogJyArIHN0cmluZ2lmeSh0b2tlbikpO1xuICB9XG59O1xuXG4vKipcbiAqIEJvb3RzdHJhcHMgYSBDb21wb25lbnQgaW50byBhbiBleGlzdGluZyBob3N0IGVsZW1lbnQgYW5kIHJldHVybnMgYW4gaW5zdGFuY2VcbiAqIG9mIHRoZSBjb21wb25lbnQuXG4gKlxuICogVXNlIHRoaXMgZnVuY3Rpb24gdG8gYm9vdHN0cmFwIGEgY29tcG9uZW50IGludG8gdGhlIERPTSB0cmVlLiBFYWNoIGludm9jYXRpb25cbiAqIG9mIHRoaXMgZnVuY3Rpb24gd2lsbCBjcmVhdGUgYSBzZXBhcmF0ZSB0cmVlIG9mIGNvbXBvbmVudHMsIGluamVjdG9ycyBhbmRcbiAqIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGVzIGFuZCBsaWZldGltZXMuIFRvIGR5bmFtaWNhbGx5IGluc2VydCBhIG5ldyBjb21wb25lbnRcbiAqIGludG8gYW4gZXhpc3RpbmcgdHJlZSBzdWNoIHRoYXQgaXQgc2hhcmVzIHRoZSBzYW1lIGluamVjdGlvbiwgY2hhbmdlIGRldGVjdGlvblxuICogYW5kIG9iamVjdCBsaWZldGltZSwgdXNlIHtAbGluayBWaWV3Q29udGFpbmVyI2NyZWF0ZUNvbXBvbmVudH0uXG4gKlxuICogQHBhcmFtIGNvbXBvbmVudFR5cGUgQ29tcG9uZW50IHRvIGJvb3RzdHJhcFxuICogQHBhcmFtIG9wdGlvbnMgT3B0aW9uYWwgcGFyYW1ldGVycyB3aGljaCBjb250cm9sIGJvb3RzdHJhcHBpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckNvbXBvbmVudDxUPihcbiAgICBjb21wb25lbnRUeXBlOiBDb21wb25lbnRUeXBlPFQ+fFxuICAgICAgICBUeXBlPFQ+LyogVHlwZSBhcyB3b3JrYXJvdW5kIGZvcjogTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzQ4ODEgKi9cbiAgICAsXG4gICAgb3B0czogQ3JlYXRlQ29tcG9uZW50T3B0aW9ucyA9IHt9KTogVCB7XG4gIG5nRGV2TW9kZSAmJiBwdWJsaXNoRGVmYXVsdEdsb2JhbFV0aWxzKCk7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRDb21wb25lbnRUeXBlKGNvbXBvbmVudFR5cGUpO1xuICBjb25zdCByZW5kZXJlckZhY3RvcnkgPSBvcHRzLnJlbmRlcmVyRmFjdG9yeSB8fCBkb21SZW5kZXJlckZhY3RvcnkzO1xuICBjb25zdCBzYW5pdGl6ZXIgPSBvcHRzLnNhbml0aXplciB8fCBudWxsO1xuICBjb25zdCBjb21wb25lbnREZWYgPSBnZXRDb21wb25lbnREZWY8VD4oY29tcG9uZW50VHlwZSkgITtcbiAgaWYgKGNvbXBvbmVudERlZi50eXBlICE9IGNvbXBvbmVudFR5cGUpIGNvbXBvbmVudERlZi50eXBlID0gY29tcG9uZW50VHlwZTtcblxuICAvLyBUaGUgZmlyc3QgaW5kZXggb2YgdGhlIGZpcnN0IHNlbGVjdG9yIGlzIHRoZSB0YWcgbmFtZS5cbiAgY29uc3QgY29tcG9uZW50VGFnID0gY29tcG9uZW50RGVmLnNlbGVjdG9ycyAhWzBdICFbMF0gYXMgc3RyaW5nO1xuICBjb25zdCBob3N0Uk5vZGUgPSBsb2NhdGVIb3N0RWxlbWVudChyZW5kZXJlckZhY3RvcnksIG9wdHMuaG9zdCB8fCBjb21wb25lbnRUYWcpO1xuICBjb25zdCByb290RmxhZ3MgPSBjb21wb25lbnREZWYub25QdXNoID8gTFZpZXdGbGFncy5EaXJ0eSB8IExWaWV3RmxhZ3MuSXNSb290IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIExWaWV3RmxhZ3MuQ2hlY2tBbHdheXMgfCBMVmlld0ZsYWdzLklzUm9vdDtcbiAgY29uc3Qgcm9vdENvbnRleHQgPSBjcmVhdGVSb290Q29udGV4dChvcHRzLnNjaGVkdWxlciwgb3B0cy5wbGF5ZXJIYW5kbGVyKTtcblxuICBjb25zdCByZW5kZXJlciA9IHJlbmRlcmVyRmFjdG9yeS5jcmVhdGVSZW5kZXJlcihob3N0Uk5vZGUsIGNvbXBvbmVudERlZik7XG4gIGNvbnN0IHJvb3RWaWV3OiBMVmlld0RhdGEgPSBjcmVhdGVMVmlld0RhdGEoXG4gICAgICBudWxsLCByZW5kZXJlciwgY3JlYXRlVFZpZXcoLTEsIG51bGwsIDEsIDAsIG51bGwsIG51bGwsIG51bGwpLCByb290Q29udGV4dCwgcm9vdEZsYWdzLFxuICAgICAgdW5kZWZpbmVkLCBvcHRzLmluamVjdG9yIHx8IG51bGwpO1xuXG4gIGNvbnN0IG9sZFZpZXcgPSBlbnRlclZpZXcocm9vdFZpZXcsIG51bGwpO1xuICBsZXQgY29tcG9uZW50OiBUO1xuICB0cnkge1xuICAgIGlmIChyZW5kZXJlckZhY3RvcnkuYmVnaW4pIHJlbmRlcmVyRmFjdG9yeS5iZWdpbigpO1xuICAgIGNvbnN0IGNvbXBvbmVudFZpZXcgPVxuICAgICAgICBjcmVhdGVSb290Q29tcG9uZW50Vmlldyhob3N0Uk5vZGUsIGNvbXBvbmVudERlZiwgcm9vdFZpZXcsIHJlbmRlcmVyLCBzYW5pdGl6ZXIpO1xuICAgIGNvbXBvbmVudCA9IGNyZWF0ZVJvb3RDb21wb25lbnQoXG4gICAgICAgIGNvbXBvbmVudFZpZXcsIGNvbXBvbmVudERlZiwgcm9vdFZpZXcsIHJvb3RDb250ZXh0LCBvcHRzLmhvc3RGZWF0dXJlcyB8fCBudWxsKTtcblxuICAgIHJlZnJlc2hEZXNjZW5kYW50Vmlld3Mocm9vdFZpZXcsIG51bGwpO1xuICB9IGZpbmFsbHkge1xuICAgIGxlYXZlVmlldyhvbGRWaWV3KTtcbiAgICBpZiAocmVuZGVyZXJGYWN0b3J5LmVuZCkgcmVuZGVyZXJGYWN0b3J5LmVuZCgpO1xuICB9XG5cbiAgcmV0dXJuIGNvbXBvbmVudDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIHRoZSByb290IGNvbXBvbmVudCB2aWV3IGFuZCB0aGUgcm9vdCBjb21wb25lbnQgbm9kZS5cbiAqXG4gKiBAcGFyYW0gck5vZGUgUmVuZGVyIGhvc3QgZWxlbWVudC5cbiAqIEBwYXJhbSBkZWYgQ29tcG9uZW50RGVmXG4gKiBAcGFyYW0gcm9vdFZpZXcgVGhlIHBhcmVudCB2aWV3IHdoZXJlIHRoZSBob3N0IG5vZGUgaXMgc3RvcmVkXG4gKiBAcGFyYW0gcmVuZGVyZXIgVGhlIGN1cnJlbnQgcmVuZGVyZXJcbiAqIEBwYXJhbSBzYW5pdGl6ZXIgVGhlIHNhbml0aXplciwgaWYgcHJvdmlkZWRcbiAqXG4gKiBAcmV0dXJucyBDb21wb25lbnQgdmlldyBjcmVhdGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSb290Q29tcG9uZW50VmlldyhcbiAgICByTm9kZTogUkVsZW1lbnQgfCBudWxsLCBkZWY6IENvbXBvbmVudERlZjxhbnk+LCByb290VmlldzogTFZpZXdEYXRhLCByZW5kZXJlcjogUmVuZGVyZXIzLFxuICAgIHNhbml0aXplcj86IFNhbml0aXplciB8IG51bGwpOiBMVmlld0RhdGEge1xuICByZXNldENvbXBvbmVudFN0YXRlKCk7XG4gIGNvbnN0IHRWaWV3ID0gcm9vdFZpZXdbVFZJRVddO1xuICBjb25zdCBjb21wb25lbnRWaWV3ID0gY3JlYXRlTFZpZXdEYXRhKFxuICAgICAgcm9vdFZpZXcsIHJlbmRlcmVyLFxuICAgICAgZ2V0T3JDcmVhdGVUVmlldyhcbiAgICAgICAgICBkZWYudGVtcGxhdGUsIGRlZi5jb25zdHMsIGRlZi52YXJzLCBkZWYuZGlyZWN0aXZlRGVmcywgZGVmLnBpcGVEZWZzLCBkZWYudmlld1F1ZXJ5KSxcbiAgICAgIG51bGwsIGRlZi5vblB1c2ggPyBMVmlld0ZsYWdzLkRpcnR5IDogTFZpZXdGbGFncy5DaGVja0Fsd2F5cywgc2FuaXRpemVyKTtcbiAgY29uc3QgdE5vZGUgPSBjcmVhdGVOb2RlQXRJbmRleCgwLCBUTm9kZVR5cGUuRWxlbWVudCwgck5vZGUsIG51bGwsIG51bGwpO1xuXG4gIGlmICh0Vmlldy5maXJzdFRlbXBsYXRlUGFzcykge1xuICAgIGRpUHVibGljSW5JbmplY3RvcihnZXRPckNyZWF0ZU5vZGVJbmplY3RvckZvck5vZGUodE5vZGUsIHJvb3RWaWV3KSwgcm9vdFZpZXcsIGRlZi50eXBlKTtcbiAgICB0Tm9kZS5mbGFncyA9IFROb2RlRmxhZ3MuaXNDb21wb25lbnQ7XG4gICAgaW5pdE5vZGVGbGFncyh0Tm9kZSwgcm9vdFZpZXcubGVuZ3RoLCAxKTtcbiAgICBxdWV1ZUNvbXBvbmVudEluZGV4Rm9yQ2hlY2sodE5vZGUpO1xuICB9XG5cbiAgLy8gU3RvcmUgY29tcG9uZW50IHZpZXcgYXQgbm9kZSBpbmRleCwgd2l0aCBub2RlIGFzIHRoZSBIT1NUXG4gIGNvbXBvbmVudFZpZXdbSE9TVF0gPSByb290Vmlld1tIRUFERVJfT0ZGU0VUXTtcbiAgY29tcG9uZW50Vmlld1tIT1NUX05PREVdID0gdE5vZGUgYXMgVEVsZW1lbnROb2RlO1xuICByZXR1cm4gcm9vdFZpZXdbSEVBREVSX09GRlNFVF0gPSBjb21wb25lbnRWaWV3O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSByb290IGNvbXBvbmVudCBhbmQgc2V0cyBpdCB1cCB3aXRoIGZlYXR1cmVzIGFuZCBob3N0IGJpbmRpbmdzLiBTaGFyZWQgYnlcbiAqIHJlbmRlckNvbXBvbmVudCgpIGFuZCBWaWV3Q29udGFpbmVyUmVmLmNyZWF0ZUNvbXBvbmVudCgpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUm9vdENvbXBvbmVudDxUPihcbiAgICBjb21wb25lbnRWaWV3OiBMVmlld0RhdGEsIGNvbXBvbmVudERlZjogQ29tcG9uZW50RGVmPFQ+LCByb290VmlldzogTFZpZXdEYXRhLFxuICAgIHJvb3RDb250ZXh0OiBSb290Q29udGV4dCwgaG9zdEZlYXR1cmVzOiBIb3N0RmVhdHVyZVtdIHwgbnVsbCk6IGFueSB7XG4gIGNvbnN0IHRWaWV3ID0gcm9vdFZpZXdbVFZJRVddO1xuICAvLyBDcmVhdGUgZGlyZWN0aXZlIGluc3RhbmNlIHdpdGggZmFjdG9yeSgpIGFuZCBzdG9yZSBhdCBuZXh0IGluZGV4IGluIHZpZXdEYXRhXG4gIGNvbnN0IGNvbXBvbmVudCA9IGluc3RhbnRpYXRlUm9vdENvbXBvbmVudCh0Vmlldywgcm9vdFZpZXcsIGNvbXBvbmVudERlZik7XG5cbiAgcm9vdENvbnRleHQuY29tcG9uZW50cy5wdXNoKGNvbXBvbmVudCk7XG4gIGNvbXBvbmVudFZpZXdbQ09OVEVYVF0gPSBjb21wb25lbnQ7XG5cbiAgaG9zdEZlYXR1cmVzICYmIGhvc3RGZWF0dXJlcy5mb3JFYWNoKChmZWF0dXJlKSA9PiBmZWF0dXJlKGNvbXBvbmVudCwgY29tcG9uZW50RGVmKSk7XG5cbiAgaWYgKHRWaWV3LmZpcnN0VGVtcGxhdGVQYXNzKSBwcmVmaWxsSG9zdFZhcnModFZpZXcsIHJvb3RWaWV3LCBjb21wb25lbnREZWYuaG9zdFZhcnMpO1xuICByZXR1cm4gY29tcG9uZW50O1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSb290Q29udGV4dChcbiAgICBzY2hlZHVsZXI/OiAod29ya0ZuOiAoKSA9PiB2b2lkKSA9PiB2b2lkLCBwbGF5ZXJIYW5kbGVyPzogUGxheWVySGFuZGxlcnxudWxsKTogUm9vdENvbnRleHQge1xuICByZXR1cm4ge1xuICAgIGNvbXBvbmVudHM6IFtdLFxuICAgIHNjaGVkdWxlcjogc2NoZWR1bGVyIHx8IGRlZmF1bHRTY2hlZHVsZXIsXG4gICAgY2xlYW46IENMRUFOX1BST01JU0UsXG4gICAgcGxheWVySGFuZGxlcjogcGxheWVySGFuZGxlciB8fCBudWxsLFxuICAgIGZsYWdzOiBSb290Q29udGV4dEZsYWdzLkVtcHR5XG4gIH07XG59XG5cbi8qKlxuICogVXNlZCB0byBlbmFibGUgbGlmZWN5Y2xlIGhvb2tzIG9uIHRoZSByb290IGNvbXBvbmVudC5cbiAqXG4gKiBJbmNsdWRlIHRoaXMgZmVhdHVyZSB3aGVuIGNhbGxpbmcgYHJlbmRlckNvbXBvbmVudGAgaWYgdGhlIHJvb3QgY29tcG9uZW50XG4gKiB5b3UgYXJlIHJlbmRlcmluZyBoYXMgbGlmZWN5Y2xlIGhvb2tzIGRlZmluZWQuIE90aGVyd2lzZSwgdGhlIGhvb2tzIHdvbid0XG4gKiBiZSBjYWxsZWQgcHJvcGVybHkuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBcbiAqIHJlbmRlckNvbXBvbmVudChBcHBDb21wb25lbnQsIHtmZWF0dXJlczogW1Jvb3RMaWZlY3ljbGVIb29rc119KTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gTGlmZWN5Y2xlSG9va3NGZWF0dXJlKGNvbXBvbmVudDogYW55LCBkZWY6IENvbXBvbmVudERlZjxhbnk+KTogdm9pZCB7XG4gIGNvbnN0IHJvb3RUVmlldyA9IHJlYWRQYXRjaGVkTFZpZXdEYXRhKGNvbXBvbmVudCkgIVtUVklFV107XG4gIGNvbnN0IGRpckluZGV4ID0gcm9vdFRWaWV3LmRhdGEubGVuZ3RoIC0gMTtcblxuICBxdWV1ZUluaXRIb29rcyhkaXJJbmRleCwgZGVmLm9uSW5pdCwgZGVmLmRvQ2hlY2ssIHJvb3RUVmlldyk7XG4gIHF1ZXVlTGlmZWN5Y2xlSG9va3MoZGlySW5kZXggPDwgVE5vZGVGbGFncy5EaXJlY3RpdmVTdGFydGluZ0luZGV4U2hpZnQgfCAxLCByb290VFZpZXcpO1xufVxuXG4vKipcbiAqIFJldHJpZXZlIHRoZSByb290IGNvbnRleHQgZm9yIGFueSBjb21wb25lbnQgYnkgd2Fsa2luZyB0aGUgcGFyZW50IGBMVmlld2AgdW50aWxcbiAqIHJlYWNoaW5nIHRoZSByb290IGBMVmlld2AuXG4gKlxuICogQHBhcmFtIGNvbXBvbmVudCBhbnkgY29tcG9uZW50XG4gKi9cbmZ1bmN0aW9uIGdldFJvb3RDb250ZXh0KGNvbXBvbmVudDogYW55KTogUm9vdENvbnRleHQge1xuICBjb25zdCByb290Q29udGV4dCA9IGdldFJvb3RWaWV3KGNvbXBvbmVudClbQ09OVEVYVF0gYXMgUm9vdENvbnRleHQ7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKHJvb3RDb250ZXh0LCAncm9vdENvbnRleHQnKTtcbiAgcmV0dXJuIHJvb3RDb250ZXh0O1xufVxuXG5cbi8qKlxuICogV2FpdCBvbiBjb21wb25lbnQgdW50aWwgaXQgaXMgcmVuZGVyZWQuXG4gKlxuICogVGhpcyBmdW5jdGlvbiByZXR1cm5zIGEgYFByb21pc2VgIHdoaWNoIGlzIHJlc29sdmVkIHdoZW4gdGhlIGNvbXBvbmVudCdzXG4gKiBjaGFuZ2UgZGV0ZWN0aW9uIGlzIGV4ZWN1dGVkLiBUaGlzIGlzIGRldGVybWluZWQgYnkgZmluZGluZyB0aGUgc2NoZWR1bGVyXG4gKiBhc3NvY2lhdGVkIHdpdGggdGhlIGBjb21wb25lbnRgJ3MgcmVuZGVyIHRyZWUgYW5kIHdhaXRpbmcgdW50aWwgdGhlIHNjaGVkdWxlclxuICogZmx1c2hlcy4gSWYgbm90aGluZyBpcyBzY2hlZHVsZWQsIHRoZSBmdW5jdGlvbiByZXR1cm5zIGEgcmVzb2x2ZWQgcHJvbWlzZS5cbiAqXG4gKiBFeGFtcGxlOlxuICogYGBgXG4gKiBhd2FpdCB3aGVuUmVuZGVyZWQobXlDb21wb25lbnQpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIGNvbXBvbmVudCBDb21wb25lbnQgdG8gd2FpdCB1cG9uXG4gKiBAcmV0dXJucyBQcm9taXNlIHdoaWNoIHJlc29sdmVzIHdoZW4gdGhlIGNvbXBvbmVudCBpcyByZW5kZXJlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdoZW5SZW5kZXJlZChjb21wb25lbnQ6IGFueSk6IFByb21pc2U8bnVsbD4ge1xuICByZXR1cm4gZ2V0Um9vdENvbnRleHQoY29tcG9uZW50KS5jbGVhbjtcbn1cbiJdfQ==