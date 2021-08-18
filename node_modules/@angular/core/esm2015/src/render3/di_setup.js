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
import { resolveForwardRef } from '../di/forward_ref';
import { isTypeProvider, providerToFactory } from '../di/r3_injector';
import { diPublicInInjector, getNodeInjectable, getOrCreateNodeInjectorForNode } from './di';
import { directiveInject } from './instructions';
import { NodeInjectorFactory } from './interfaces/injector';
import { TVIEW } from './interfaces/view';
import { getPreviousOrParentTNode, getViewData } from './state';
import { isComponentDef } from './util';
/**
 * Resolves the providers which are defined in the DirectiveDef.
 *
 * When inserting the tokens and the factories in their respective arrays, we can assume that
 * this method is called first for the component (if any), and then for other directives on the same
 * node.
 * As a consequence,the providers are always processed in that order:
 * 1) The view providers of the component
 * 2) The providers of the component
 * 3) The providers of the other directives
 * This matches the structure of the injectables arrays of a view (for each node).
 * So the tokens and the factories can be pushed at the end of the arrays, except
 * in one case for multi providers.
 *
 * @template T
 * @param {?} def the directive definition
 * @param {?} providers
 * @param {?} viewProviders
 * @return {?}
 */
export function providersResolver(def, providers, viewProviders) {
    /** @type {?} */
    const viewData = getViewData();
    /** @type {?} */
    const tView = viewData[TVIEW];
    if (tView.firstTemplatePass) {
        /** @type {?} */
        const isComponent = isComponentDef(def);
        // The list of view providers is processed first, and the flags are updated
        resolveProvider(viewProviders, tView.data, tView.blueprint, isComponent, true);
        // Then, the list of providers is processed, and the flags are updated
        resolveProvider(providers, tView.data, tView.blueprint, isComponent, false);
    }
}
/**
 * Resolves a provider and publishes it to the DI system.
 * @param {?} provider
 * @param {?} tInjectables
 * @param {?} lInjectablesBlueprint
 * @param {?} isComponent
 * @param {?} isViewProvider
 * @return {?}
 */
function resolveProvider(provider, tInjectables, lInjectablesBlueprint, isComponent, isViewProvider) {
    provider = resolveForwardRef(provider);
    if (Array.isArray(provider)) {
        // Recursively call `resolveProvider`
        // Recursion is OK in this case because this code will not be in hot-path once we implement
        // cloning of the initial state.
        for (let i = 0; i < provider.length; i++) {
            resolveProvider(provider[i], tInjectables, lInjectablesBlueprint, isComponent, isViewProvider);
        }
    }
    else {
        /** @type {?} */
        const viewData = getViewData();
        /** @type {?} */
        let token = isTypeProvider(provider) ? provider : resolveForwardRef(provider.provide);
        /** @type {?} */
        let providerFactory = providerToFactory(provider);
        /** @type {?} */
        const previousOrParentTNode = getPreviousOrParentTNode();
        /** @type {?} */
        const beginIndex = previousOrParentTNode.providerIndexes & 65535 /* ProvidersStartIndexMask */;
        /** @type {?} */
        const endIndex = previousOrParentTNode.flags >> 16 /* DirectiveStartingIndexShift */;
        /** @type {?} */
        const cptViewProvidersCount = previousOrParentTNode.providerIndexes >> 16 /* CptViewProvidersCountShift */;
        if (isTypeProvider(provider) || !provider.multi) {
            // Single provider case: the factory is created and pushed immediately
            /** @type {?} */
            const factory = new NodeInjectorFactory(providerFactory, isViewProvider, directiveInject);
            /** @type {?} */
            const existingFactoryIndex = indexOf(token, tInjectables, isViewProvider ? beginIndex : beginIndex + cptViewProvidersCount, endIndex);
            if (existingFactoryIndex == -1) {
                diPublicInInjector(getOrCreateNodeInjectorForNode((/** @type {?} */ (previousOrParentTNode)), viewData), viewData, token);
                tInjectables.push(token);
                previousOrParentTNode.flags += 1 << 16 /* DirectiveStartingIndexShift */;
                if (isViewProvider) {
                    previousOrParentTNode.providerIndexes +=
                        65536 /* CptViewProvidersCountShifter */;
                }
                lInjectablesBlueprint.push(factory);
                viewData.push(factory);
            }
            else {
                lInjectablesBlueprint[existingFactoryIndex] = factory;
                viewData[existingFactoryIndex] = factory;
            }
        }
        else {
            // Multi provider case:
            // We create a multi factory which is going to aggregate all the values.
            // Since the output of such a factory depends on content or view injection,
            // we create two of them, which are linked together.
            //
            // The first one (for view providers) is always in the first block of the injectables array,
            // and the second one (for providers) is always in the second block.
            // This is important because view providers have higher priority. When a multi token
            // is being looked up, the view providers should be found first.
            // Note that it is not possible to have a multi factory in the third block (directive block).
            //
            // The algorithm to process multi providers is as follows:
            // 1) If the multi provider comes from the `viewProviders` of the component:
            //   a) If the special view providers factory doesn't exist, it is created and pushed.
            //   b) Else, the multi provider is added to the existing multi factory.
            // 2) If the multi provider comes from the `providers` of the component or of another
            // directive:
            //   a) If the multi factory doesn't exist, it is created and provider pushed into it.
            //      It is also linked to the multi factory for view providers, if it exists.
            //   b) Else, the multi provider is added to the existing multi factory.
            /** @type {?} */
            const existingProvidersFactoryIndex = indexOf(token, tInjectables, beginIndex + cptViewProvidersCount, endIndex);
            /** @type {?} */
            const existingViewProvidersFactoryIndex = indexOf(token, tInjectables, beginIndex, beginIndex + cptViewProvidersCount);
            /** @type {?} */
            const doesProvidersFactoryExist = existingProvidersFactoryIndex >= 0 &&
                lInjectablesBlueprint[existingProvidersFactoryIndex];
            /** @type {?} */
            const doesViewProvidersFactoryExist = existingViewProvidersFactoryIndex >= 0 &&
                lInjectablesBlueprint[existingViewProvidersFactoryIndex];
            if (isViewProvider && !doesViewProvidersFactoryExist ||
                !isViewProvider && !doesProvidersFactoryExist) {
                // Cases 1.a and 2.a
                diPublicInInjector(getOrCreateNodeInjectorForNode((/** @type {?} */ (previousOrParentTNode)), viewData), viewData, token);
                /** @type {?} */
                const factory = multiFactory(isViewProvider ? multiViewProvidersFactoryResolver : multiProvidersFactoryResolver, lInjectablesBlueprint.length, isViewProvider, isComponent, providerFactory);
                if (!isViewProvider && doesViewProvidersFactoryExist) {
                    lInjectablesBlueprint[existingViewProvidersFactoryIndex].providerFactory = factory;
                }
                tInjectables.push(token);
                previousOrParentTNode.flags += 1 << 16 /* DirectiveStartingIndexShift */;
                if (isViewProvider) {
                    previousOrParentTNode.providerIndexes +=
                        65536 /* CptViewProvidersCountShifter */;
                }
                lInjectablesBlueprint.push(factory);
                viewData.push(factory);
            }
            else {
                // Cases 1.b and 2.b
                multiFactoryAdd((/** @type {?} */ (lInjectablesBlueprint))[isViewProvider ? existingViewProvidersFactoryIndex : existingProvidersFactoryIndex], providerFactory, !isViewProvider && isComponent);
            }
            if (!isViewProvider && isComponent && doesViewProvidersFactoryExist) {
                (/** @type {?} */ (lInjectablesBlueprint[existingViewProvidersFactoryIndex].componentProviders))++;
            }
        }
    }
}
/**
 * Add a factory in a multi factory.
 * @param {?} multiFactory
 * @param {?} factory
 * @param {?} isComponentProvider
 * @return {?}
 */
function multiFactoryAdd(multiFactory, factory, isComponentProvider) {
    (/** @type {?} */ (multiFactory.multi)).push(factory);
    if (isComponentProvider) {
        (/** @type {?} */ (multiFactory.componentProviders))++;
    }
}
/**
 * Returns the index of item in the array, but only in the begin to end range.
 * @param {?} item
 * @param {?} arr
 * @param {?} begin
 * @param {?} end
 * @return {?}
 */
function indexOf(item, arr, begin, end) {
    for (let i = begin; i < end; i++) {
        if (arr[i] === item)
            return i;
    }
    return -1;
}
/**
 * Use this with `multi` `providers`.
 * @this {?}
 * @param {?} _
 * @param {?} tData
 * @param {?} lData
 * @param {?} tNode
 * @return {?}
 */
function multiProvidersFactoryResolver(_, tData, lData, tNode) {
    return multiResolve((/** @type {?} */ (this.multi)), []);
}
/**
 * Use this with `multi` `viewProviders`.
 *
 * This factory knows how to concatenate itself with the existing `multi` `providers`.
 * @this {?}
 * @param {?} _
 * @param {?} tData
 * @param {?} lData
 * @param {?} tNode
 * @return {?}
 */
function multiViewProvidersFactoryResolver(_, tData, lData, tNode) {
    /** @type {?} */
    const factories = (/** @type {?} */ (this.multi));
    /** @type {?} */
    let result;
    if (this.providerFactory) {
        /** @type {?} */
        const componentCount = (/** @type {?} */ (this.providerFactory.componentProviders));
        /** @type {?} */
        const multiProviders = getNodeInjectable(tData, lData, (/** @type {?} */ ((/** @type {?} */ (this.providerFactory)).index)), tNode);
        // Copy the section of the array which contains `multi` `providers` from the component
        result = multiProviders.slice(0, componentCount);
        // Insert the `viewProvider` instances.
        multiResolve(factories, result);
        // Copy the section of the array which contains `multi` `providers` from other directives
        for (let i = componentCount; i < multiProviders.length; i++) {
            result.push(multiProviders[i]);
        }
    }
    else {
        result = [];
        // Insert the `viewProvider` instances.
        multiResolve(factories, result);
    }
    return result;
}
/**
 * Maps an array of factories into an array of values.
 * @param {?} factories
 * @param {?} result
 * @return {?}
 */
function multiResolve(factories, result) {
    for (let i = 0; i < factories.length; i++) {
        /** @type {?} */
        const factory = (/** @type {?} */ ((/** @type {?} */ (factories[i]))));
        result.push(factory());
    }
    return result;
}
/**
 * Creates a multi factory.
 * @param {?} factoryFn
 * @param {?} index
 * @param {?} isViewProvider
 * @param {?} isComponent
 * @param {?} f
 * @return {?}
 */
function multiFactory(factoryFn, index, isViewProvider, isComponent, f) {
    /** @type {?} */
    const factory = new NodeInjectorFactory(factoryFn, isViewProvider, directiveInject);
    factory.multi = [];
    factory.index = index;
    factory.componentProviders = 0;
    multiFactoryAdd(factory, f, isComponent && !isViewProvider);
    return factory;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlfc2V0dXAuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2RpX3NldHVwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBU0EsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFFcEQsT0FBTyxFQUFDLGNBQWMsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBR3BFLE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxpQkFBaUIsRUFBRSw4QkFBOEIsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUMzRixPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDL0MsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFMUQsT0FBTyxFQUFtQixLQUFLLEVBQVEsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRSxPQUFPLEVBQUMsd0JBQXdCLEVBQUUsV0FBVyxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBQzlELE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxRQUFRLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNCdEMsTUFBTSxVQUFVLGlCQUFpQixDQUM3QixHQUFvQixFQUFFLFNBQXFCLEVBQUUsYUFBeUI7O1VBQ2xFLFFBQVEsR0FBRyxXQUFXLEVBQUU7O1VBQ3hCLEtBQUssR0FBVSxRQUFRLENBQUMsS0FBSyxDQUFDO0lBQ3BDLElBQUksS0FBSyxDQUFDLGlCQUFpQixFQUFFOztjQUNyQixXQUFXLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQztRQUV2QywyRUFBMkU7UUFDM0UsZUFBZSxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRS9FLHNFQUFzRTtRQUN0RSxlQUFlLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxJ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QUFtQixDQUFDLFNBQVMsRUFBRSxjQUFjLEVBQUUsZUFBZSxDQUFDO0lBQ25GLE9BQU8sQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ25CLE9BQU8sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3RCLE9BQU8sQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUM7SUFDL0IsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsV0FBVyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDNUQsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuXG5pbXBvcnQge3Jlc29sdmVGb3J3YXJkUmVmfSBmcm9tICcuLi9kaS9mb3J3YXJkX3JlZic7XG5pbXBvcnQge1Byb3ZpZGVyfSBmcm9tICcuLi9kaS9wcm92aWRlcic7XG5pbXBvcnQge2lzVHlwZVByb3ZpZGVyLCBwcm92aWRlclRvRmFjdG9yeX0gZnJvbSAnLi4vZGkvcjNfaW5qZWN0b3InO1xuXG5pbXBvcnQge0RpcmVjdGl2ZURlZn0gZnJvbSAnLic7XG5pbXBvcnQge2RpUHVibGljSW5JbmplY3RvciwgZ2V0Tm9kZUluamVjdGFibGUsIGdldE9yQ3JlYXRlTm9kZUluamVjdG9yRm9yTm9kZX0gZnJvbSAnLi9kaSc7XG5pbXBvcnQge2RpcmVjdGl2ZUluamVjdH0gZnJvbSAnLi9pbnN0cnVjdGlvbnMnO1xuaW1wb3J0IHtOb2RlSW5qZWN0b3JGYWN0b3J5fSBmcm9tICcuL2ludGVyZmFjZXMvaW5qZWN0b3InO1xuaW1wb3J0IHtUQ29udGFpbmVyTm9kZSwgVEVsZW1lbnRDb250YWluZXJOb2RlLCBURWxlbWVudE5vZGUsIFROb2RlRmxhZ3MsIFROb2RlUHJvdmlkZXJJbmRleGVzfSBmcm9tICcuL2ludGVyZmFjZXMvbm9kZSc7XG5pbXBvcnQge0xWaWV3RGF0YSwgVERhdGEsIFRWSUVXLCBUVmlld30gZnJvbSAnLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtnZXRQcmV2aW91c09yUGFyZW50VE5vZGUsIGdldFZpZXdEYXRhfSBmcm9tICcuL3N0YXRlJztcbmltcG9ydCB7aXNDb21wb25lbnREZWZ9IGZyb20gJy4vdXRpbCc7XG5cblxuXG4vKipcbiAqIFJlc29sdmVzIHRoZSBwcm92aWRlcnMgd2hpY2ggYXJlIGRlZmluZWQgaW4gdGhlIERpcmVjdGl2ZURlZi5cbiAqXG4gKiBXaGVuIGluc2VydGluZyB0aGUgdG9rZW5zIGFuZCB0aGUgZmFjdG9yaWVzIGluIHRoZWlyIHJlc3BlY3RpdmUgYXJyYXlzLCB3ZSBjYW4gYXNzdW1lIHRoYXRcbiAqIHRoaXMgbWV0aG9kIGlzIGNhbGxlZCBmaXJzdCBmb3IgdGhlIGNvbXBvbmVudCAoaWYgYW55KSwgYW5kIHRoZW4gZm9yIG90aGVyIGRpcmVjdGl2ZXMgb24gdGhlIHNhbWVcbiAqIG5vZGUuXG4gKiBBcyBhIGNvbnNlcXVlbmNlLHRoZSBwcm92aWRlcnMgYXJlIGFsd2F5cyBwcm9jZXNzZWQgaW4gdGhhdCBvcmRlcjpcbiAqIDEpIFRoZSB2aWV3IHByb3ZpZGVycyBvZiB0aGUgY29tcG9uZW50XG4gKiAyKSBUaGUgcHJvdmlkZXJzIG9mIHRoZSBjb21wb25lbnRcbiAqIDMpIFRoZSBwcm92aWRlcnMgb2YgdGhlIG90aGVyIGRpcmVjdGl2ZXNcbiAqIFRoaXMgbWF0Y2hlcyB0aGUgc3RydWN0dXJlIG9mIHRoZSBpbmplY3RhYmxlcyBhcnJheXMgb2YgYSB2aWV3IChmb3IgZWFjaCBub2RlKS5cbiAqIFNvIHRoZSB0b2tlbnMgYW5kIHRoZSBmYWN0b3JpZXMgY2FuIGJlIHB1c2hlZCBhdCB0aGUgZW5kIG9mIHRoZSBhcnJheXMsIGV4Y2VwdFxuICogaW4gb25lIGNhc2UgZm9yIG11bHRpIHByb3ZpZGVycy5cbiAqXG4gKiBAcGFyYW0gZGVmIHRoZSBkaXJlY3RpdmUgZGVmaW5pdGlvblxuICogQHBhcmFtIHByb3ZpZGVyczogQXJyYXkgb2YgYHByb3ZpZGVyc2AuXG4gKiBAcGFyYW0gdmlld1Byb3ZpZGVyczogQXJyYXkgb2YgYHZpZXdQcm92aWRlcnNgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZXJzUmVzb2x2ZXI8VD4oXG4gICAgZGVmOiBEaXJlY3RpdmVEZWY8VD4sIHByb3ZpZGVyczogUHJvdmlkZXJbXSwgdmlld1Byb3ZpZGVyczogUHJvdmlkZXJbXSk6IHZvaWQge1xuICBjb25zdCB2aWV3RGF0YSA9IGdldFZpZXdEYXRhKCk7XG4gIGNvbnN0IHRWaWV3OiBUVmlldyA9IHZpZXdEYXRhW1RWSUVXXTtcbiAgaWYgKHRWaWV3LmZpcnN0VGVtcGxhdGVQYXNzKSB7XG4gICAgY29uc3QgaXNDb21wb25lbnQgPSBpc0NvbXBvbmVudERlZihkZWYpO1xuXG4gICAgLy8gVGhlIGxpc3Qgb2YgdmlldyBwcm92aWRlcnMgaXMgcHJvY2Vzc2VkIGZpcnN0LCBhbmQgdGhlIGZsYWdzIGFyZSB1cGRhdGVkXG4gICAgcmVzb2x2ZVByb3ZpZGVyKHZpZXdQcm92aWRlcnMsIHRWaWV3LmRhdGEsIHRWaWV3LmJsdWVwcmludCwgaXNDb21wb25lbnQsIHRydWUpO1xuXG4gICAgLy8gVGhlbiwgdGhlIGxpc3Qgb2YgcHJvdmlkZXJzIGlzIHByb2Nlc3NlZCwgYW5kIHRoZSBmbGFncyBhcmUgdXBkYXRlZFxuICAgIHJlc29sdmVQcm92aWRlcihwcm92aWRlcnMsIHRWaWV3LmRhdGEsIHRWaWV3LmJsdWVwcmludCwgaXNDb21wb25lbnQsIGZhbHNlKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlc29sdmVzIGEgcHJvdmlkZXIgYW5kIHB1Ymxpc2hlcyBpdCB0byB0aGUgREkgc3lzdGVtLlxuICovXG5mdW5jdGlvbiByZXNvbHZlUHJvdmlkZXIoXG4gICAgcHJvdmlkZXI6IFByb3ZpZGVyLCB0SW5qZWN0YWJsZXM6IFREYXRhLCBsSW5qZWN0YWJsZXNCbHVlcHJpbnQ6IE5vZGVJbmplY3RvckZhY3RvcnlbXSxcbiAgICBpc0NvbXBvbmVudDogYm9vbGVhbiwgaXNWaWV3UHJvdmlkZXI6IGJvb2xlYW4pOiB2b2lkIHtcbiAgcHJvdmlkZXIgPSByZXNvbHZlRm9yd2FyZFJlZihwcm92aWRlcik7XG4gIGlmIChBcnJheS5pc0FycmF5KHByb3ZpZGVyKSkge1xuICAgIC8vIFJlY3Vyc2l2ZWx5IGNhbGwgYHJlc29sdmVQcm92aWRlcmBcbiAgICAvLyBSZWN1cnNpb24gaXMgT0sgaW4gdGhpcyBjYXNlIGJlY2F1c2UgdGhpcyBjb2RlIHdpbGwgbm90IGJlIGluIGhvdC1wYXRoIG9uY2Ugd2UgaW1wbGVtZW50XG4gICAgLy8gY2xvbmluZyBvZiB0aGUgaW5pdGlhbCBzdGF0ZS5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb3ZpZGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICByZXNvbHZlUHJvdmlkZXIoXG4gICAgICAgICAgcHJvdmlkZXJbaV0sIHRJbmplY3RhYmxlcywgbEluamVjdGFibGVzQmx1ZXByaW50LCBpc0NvbXBvbmVudCwgaXNWaWV3UHJvdmlkZXIpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjb25zdCB2aWV3RGF0YSA9IGdldFZpZXdEYXRhKCk7XG4gICAgbGV0IHRva2VuOiBhbnkgPSBpc1R5cGVQcm92aWRlcihwcm92aWRlcikgPyBwcm92aWRlciA6IHJlc29sdmVGb3J3YXJkUmVmKHByb3ZpZGVyLnByb3ZpZGUpO1xuICAgIGxldCBwcm92aWRlckZhY3Rvcnk6ICgpID0+IGFueSA9IHByb3ZpZGVyVG9GYWN0b3J5KHByb3ZpZGVyKTtcblxuICAgIGNvbnN0IHByZXZpb3VzT3JQYXJlbnRUTm9kZSA9IGdldFByZXZpb3VzT3JQYXJlbnRUTm9kZSgpO1xuICAgIGNvbnN0IGJlZ2luSW5kZXggPVxuICAgICAgICBwcmV2aW91c09yUGFyZW50VE5vZGUucHJvdmlkZXJJbmRleGVzICYgVE5vZGVQcm92aWRlckluZGV4ZXMuUHJvdmlkZXJzU3RhcnRJbmRleE1hc2s7XG4gICAgY29uc3QgZW5kSW5kZXggPSBwcmV2aW91c09yUGFyZW50VE5vZGUuZmxhZ3MgPj4gVE5vZGVGbGFncy5EaXJlY3RpdmVTdGFydGluZ0luZGV4U2hpZnQ7XG4gICAgY29uc3QgY3B0Vmlld1Byb3ZpZGVyc0NvdW50ID1cbiAgICAgICAgcHJldmlvdXNPclBhcmVudFROb2RlLnByb3ZpZGVySW5kZXhlcyA+PiBUTm9kZVByb3ZpZGVySW5kZXhlcy5DcHRWaWV3UHJvdmlkZXJzQ291bnRTaGlmdDtcblxuICAgIGlmIChpc1R5cGVQcm92aWRlcihwcm92aWRlcikgfHwgIXByb3ZpZGVyLm11bHRpKSB7XG4gICAgICAvLyBTaW5nbGUgcHJvdmlkZXIgY2FzZTogdGhlIGZhY3RvcnkgaXMgY3JlYXRlZCBhbmQgcHVzaGVkIGltbWVkaWF0ZWx5XG4gICAgICBjb25zdCBmYWN0b3J5ID0gbmV3IE5vZGVJbmplY3RvckZhY3RvcnkocHJvdmlkZXJGYWN0b3J5LCBpc1ZpZXdQcm92aWRlciwgZGlyZWN0aXZlSW5qZWN0KTtcbiAgICAgIGNvbnN0IGV4aXN0aW5nRmFjdG9yeUluZGV4ID0gaW5kZXhPZihcbiAgICAgICAgICB0b2tlbiwgdEluamVjdGFibGVzLCBpc1ZpZXdQcm92aWRlciA/IGJlZ2luSW5kZXggOiBiZWdpbkluZGV4ICsgY3B0Vmlld1Byb3ZpZGVyc0NvdW50LFxuICAgICAgICAgIGVuZEluZGV4KTtcbiAgICAgIGlmIChleGlzdGluZ0ZhY3RvcnlJbmRleCA9PSAtMSkge1xuICAgICAgICBkaVB1YmxpY0luSW5qZWN0b3IoXG4gICAgICAgICAgICBnZXRPckNyZWF0ZU5vZGVJbmplY3RvckZvck5vZGUoXG4gICAgICAgICAgICAgICAgcHJldmlvdXNPclBhcmVudFROb2RlIGFzIFRFbGVtZW50Tm9kZSB8IFRDb250YWluZXJOb2RlIHwgVEVsZW1lbnRDb250YWluZXJOb2RlLFxuICAgICAgICAgICAgICAgIHZpZXdEYXRhKSxcbiAgICAgICAgICAgIHZpZXdEYXRhLCB0b2tlbik7XG4gICAgICAgIHRJbmplY3RhYmxlcy5wdXNoKHRva2VuKTtcbiAgICAgICAgcHJldmlvdXNPclBhcmVudFROb2RlLmZsYWdzICs9IDEgPDwgVE5vZGVGbGFncy5EaXJlY3RpdmVTdGFydGluZ0luZGV4U2hpZnQ7XG4gICAgICAgIGlmIChpc1ZpZXdQcm92aWRlcikge1xuICAgICAgICAgIHByZXZpb3VzT3JQYXJlbnRUTm9kZS5wcm92aWRlckluZGV4ZXMgKz1cbiAgICAgICAgICAgICAgVE5vZGVQcm92aWRlckluZGV4ZXMuQ3B0Vmlld1Byb3ZpZGVyc0NvdW50U2hpZnRlcjtcbiAgICAgICAgfVxuICAgICAgICBsSW5qZWN0YWJsZXNCbHVlcHJpbnQucHVzaChmYWN0b3J5KTtcbiAgICAgICAgdmlld0RhdGEucHVzaChmYWN0b3J5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxJbmplY3RhYmxlc0JsdWVwcmludFtleGlzdGluZ0ZhY3RvcnlJbmRleF0gPSBmYWN0b3J5O1xuICAgICAgICB2aWV3RGF0YVtleGlzdGluZ0ZhY3RvcnlJbmRleF0gPSBmYWN0b3J5O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBNdWx0aSBwcm92aWRlciBjYXNlOlxuICAgICAgLy8gV2UgY3JlYXRlIGEgbXVsdGkgZmFjdG9yeSB3aGljaCBpcyBnb2luZyB0byBhZ2dyZWdhdGUgYWxsIHRoZSB2YWx1ZXMuXG4gICAgICAvLyBTaW5jZSB0aGUgb3V0cHV0IG9mIHN1Y2ggYSBmYWN0b3J5IGRlcGVuZHMgb24gY29udGVudCBvciB2aWV3IGluamVjdGlvbixcbiAgICAgIC8vIHdlIGNyZWF0ZSB0d28gb2YgdGhlbSwgd2hpY2ggYXJlIGxpbmtlZCB0b2dldGhlci5cbiAgICAgIC8vXG4gICAgICAvLyBUaGUgZmlyc3Qgb25lIChmb3IgdmlldyBwcm92aWRlcnMpIGlzIGFsd2F5cyBpbiB0aGUgZmlyc3QgYmxvY2sgb2YgdGhlIGluamVjdGFibGVzIGFycmF5LFxuICAgICAgLy8gYW5kIHRoZSBzZWNvbmQgb25lIChmb3IgcHJvdmlkZXJzKSBpcyBhbHdheXMgaW4gdGhlIHNlY29uZCBibG9jay5cbiAgICAgIC8vIFRoaXMgaXMgaW1wb3J0YW50IGJlY2F1c2UgdmlldyBwcm92aWRlcnMgaGF2ZSBoaWdoZXIgcHJpb3JpdHkuIFdoZW4gYSBtdWx0aSB0b2tlblxuICAgICAgLy8gaXMgYmVpbmcgbG9va2VkIHVwLCB0aGUgdmlldyBwcm92aWRlcnMgc2hvdWxkIGJlIGZvdW5kIGZpcnN0LlxuICAgICAgLy8gTm90ZSB0aGF0IGl0IGlzIG5vdCBwb3NzaWJsZSB0byBoYXZlIGEgbXVsdGkgZmFjdG9yeSBpbiB0aGUgdGhpcmQgYmxvY2sgKGRpcmVjdGl2ZSBibG9jaykuXG4gICAgICAvL1xuICAgICAgLy8gVGhlIGFsZ29yaXRobSB0byBwcm9jZXNzIG11bHRpIHByb3ZpZGVycyBpcyBhcyBmb2xsb3dzOlxuICAgICAgLy8gMSkgSWYgdGhlIG11bHRpIHByb3ZpZGVyIGNvbWVzIGZyb20gdGhlIGB2aWV3UHJvdmlkZXJzYCBvZiB0aGUgY29tcG9uZW50OlxuICAgICAgLy8gICBhKSBJZiB0aGUgc3BlY2lhbCB2aWV3IHByb3ZpZGVycyBmYWN0b3J5IGRvZXNuJ3QgZXhpc3QsIGl0IGlzIGNyZWF0ZWQgYW5kIHB1c2hlZC5cbiAgICAgIC8vICAgYikgRWxzZSwgdGhlIG11bHRpIHByb3ZpZGVyIGlzIGFkZGVkIHRvIHRoZSBleGlzdGluZyBtdWx0aSBmYWN0b3J5LlxuICAgICAgLy8gMikgSWYgdGhlIG11bHRpIHByb3ZpZGVyIGNvbWVzIGZyb20gdGhlIGBwcm92aWRlcnNgIG9mIHRoZSBjb21wb25lbnQgb3Igb2YgYW5vdGhlclxuICAgICAgLy8gZGlyZWN0aXZlOlxuICAgICAgLy8gICBhKSBJZiB0aGUgbXVsdGkgZmFjdG9yeSBkb2Vzbid0IGV4aXN0LCBpdCBpcyBjcmVhdGVkIGFuZCBwcm92aWRlciBwdXNoZWQgaW50byBpdC5cbiAgICAgIC8vICAgICAgSXQgaXMgYWxzbyBsaW5rZWQgdG8gdGhlIG11bHRpIGZhY3RvcnkgZm9yIHZpZXcgcHJvdmlkZXJzLCBpZiBpdCBleGlzdHMuXG4gICAgICAvLyAgIGIpIEVsc2UsIHRoZSBtdWx0aSBwcm92aWRlciBpcyBhZGRlZCB0byB0aGUgZXhpc3RpbmcgbXVsdGkgZmFjdG9yeS5cblxuICAgICAgY29uc3QgZXhpc3RpbmdQcm92aWRlcnNGYWN0b3J5SW5kZXggPVxuICAgICAgICAgIGluZGV4T2YodG9rZW4sIHRJbmplY3RhYmxlcywgYmVnaW5JbmRleCArIGNwdFZpZXdQcm92aWRlcnNDb3VudCwgZW5kSW5kZXgpO1xuICAgICAgY29uc3QgZXhpc3RpbmdWaWV3UHJvdmlkZXJzRmFjdG9yeUluZGV4ID1cbiAgICAgICAgICBpbmRleE9mKHRva2VuLCB0SW5qZWN0YWJsZXMsIGJlZ2luSW5kZXgsIGJlZ2luSW5kZXggKyBjcHRWaWV3UHJvdmlkZXJzQ291bnQpO1xuICAgICAgY29uc3QgZG9lc1Byb3ZpZGVyc0ZhY3RvcnlFeGlzdCA9IGV4aXN0aW5nUHJvdmlkZXJzRmFjdG9yeUluZGV4ID49IDAgJiZcbiAgICAgICAgICBsSW5qZWN0YWJsZXNCbHVlcHJpbnRbZXhpc3RpbmdQcm92aWRlcnNGYWN0b3J5SW5kZXhdO1xuICAgICAgY29uc3QgZG9lc1ZpZXdQcm92aWRlcnNGYWN0b3J5RXhpc3QgPSBleGlzdGluZ1ZpZXdQcm92aWRlcnNGYWN0b3J5SW5kZXggPj0gMCAmJlxuICAgICAgICAgIGxJbmplY3RhYmxlc0JsdWVwcmludFtleGlzdGluZ1ZpZXdQcm92aWRlcnNGYWN0b3J5SW5kZXhdO1xuXG4gICAgICBpZiAoaXNWaWV3UHJvdmlkZXIgJiYgIWRvZXNWaWV3UHJvdmlkZXJzRmFjdG9yeUV4aXN0IHx8XG4gICAgICAgICAgIWlzVmlld1Byb3ZpZGVyICYmICFkb2VzUHJvdmlkZXJzRmFjdG9yeUV4aXN0KSB7XG4gICAgICAgIC8vIENhc2VzIDEuYSBhbmQgMi5hXG4gICAgICAgIGRpUHVibGljSW5JbmplY3RvcihcbiAgICAgICAgICAgIGdldE9yQ3JlYXRlTm9kZUluamVjdG9yRm9yTm9kZShcbiAgICAgICAgICAgICAgICBwcmV2aW91c09yUGFyZW50VE5vZGUgYXMgVEVsZW1lbnROb2RlIHwgVENvbnRhaW5lck5vZGUgfCBURWxlbWVudENvbnRhaW5lck5vZGUsXG4gICAgICAgICAgICAgICAgdmlld0RhdGEpLFxuICAgICAgICAgICAgdmlld0RhdGEsIHRva2VuKTtcbiAgICAgICAgY29uc3QgZmFjdG9yeSA9IG11bHRpRmFjdG9yeShcbiAgICAgICAgICAgIGlzVmlld1Byb3ZpZGVyID8gbXVsdGlWaWV3UHJvdmlkZXJzRmFjdG9yeVJlc29sdmVyIDogbXVsdGlQcm92aWRlcnNGYWN0b3J5UmVzb2x2ZXIsXG4gICAgICAgICAgICBsSW5qZWN0YWJsZXNCbHVlcHJpbnQubGVuZ3RoLCBpc1ZpZXdQcm92aWRlciwgaXNDb21wb25lbnQsIHByb3ZpZGVyRmFjdG9yeSk7XG4gICAgICAgIGlmICghaXNWaWV3UHJvdmlkZXIgJiYgZG9lc1ZpZXdQcm92aWRlcnNGYWN0b3J5RXhpc3QpIHtcbiAgICAgICAgICBsSW5qZWN0YWJsZXNCbHVlcHJpbnRbZXhpc3RpbmdWaWV3UHJvdmlkZXJzRmFjdG9yeUluZGV4XS5wcm92aWRlckZhY3RvcnkgPSBmYWN0b3J5O1xuICAgICAgICB9XG4gICAgICAgIHRJbmplY3RhYmxlcy5wdXNoKHRva2VuKTtcbiAgICAgICAgcHJldmlvdXNPclBhcmVudFROb2RlLmZsYWdzICs9IDEgPDwgVE5vZGVGbGFncy5EaXJlY3RpdmVTdGFydGluZ0luZGV4U2hpZnQ7XG4gICAgICAgIGlmIChpc1ZpZXdQcm92aWRlcikge1xuICAgICAgICAgIHByZXZpb3VzT3JQYXJlbnRUTm9kZS5wcm92aWRlckluZGV4ZXMgKz1cbiAgICAgICAgICAgICAgVE5vZGVQcm92aWRlckluZGV4ZXMuQ3B0Vmlld1Byb3ZpZGVyc0NvdW50U2hpZnRlcjtcbiAgICAgICAgfVxuICAgICAgICBsSW5qZWN0YWJsZXNCbHVlcHJpbnQucHVzaChmYWN0b3J5KTtcbiAgICAgICAgdmlld0RhdGEucHVzaChmYWN0b3J5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIENhc2VzIDEuYiBhbmQgMi5iXG4gICAgICAgIG11bHRpRmFjdG9yeUFkZChcbiAgICAgICAgICAgIGxJbmplY3RhYmxlc0JsdWVwcmludCAhW2lzVmlld1Byb3ZpZGVyID8gZXhpc3RpbmdWaWV3UHJvdmlkZXJzRmFjdG9yeUluZGV4IDogZXhpc3RpbmdQcm92aWRlcnNGYWN0b3J5SW5kZXhdLFxuICAgICAgICAgICAgcHJvdmlkZXJGYWN0b3J5LCAhaXNWaWV3UHJvdmlkZXIgJiYgaXNDb21wb25lbnQpO1xuICAgICAgfVxuICAgICAgaWYgKCFpc1ZpZXdQcm92aWRlciAmJiBpc0NvbXBvbmVudCAmJiBkb2VzVmlld1Byb3ZpZGVyc0ZhY3RvcnlFeGlzdCkge1xuICAgICAgICBsSW5qZWN0YWJsZXNCbHVlcHJpbnRbZXhpc3RpbmdWaWV3UHJvdmlkZXJzRmFjdG9yeUluZGV4XS5jb21wb25lbnRQcm92aWRlcnMgISsrO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFkZCBhIGZhY3RvcnkgaW4gYSBtdWx0aSBmYWN0b3J5LlxuICovXG5mdW5jdGlvbiBtdWx0aUZhY3RvcnlBZGQoXG4gICAgbXVsdGlGYWN0b3J5OiBOb2RlSW5qZWN0b3JGYWN0b3J5LCBmYWN0b3J5OiAoKSA9PiBhbnksIGlzQ29tcG9uZW50UHJvdmlkZXI6IGJvb2xlYW4pOiB2b2lkIHtcbiAgbXVsdGlGYWN0b3J5Lm11bHRpICEucHVzaChmYWN0b3J5KTtcbiAgaWYgKGlzQ29tcG9uZW50UHJvdmlkZXIpIHtcbiAgICBtdWx0aUZhY3RvcnkuY29tcG9uZW50UHJvdmlkZXJzICErKztcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGluZGV4IG9mIGl0ZW0gaW4gdGhlIGFycmF5LCBidXQgb25seSBpbiB0aGUgYmVnaW4gdG8gZW5kIHJhbmdlLlxuICovXG5mdW5jdGlvbiBpbmRleE9mKGl0ZW06IGFueSwgYXJyOiBhbnlbXSwgYmVnaW46IG51bWJlciwgZW5kOiBudW1iZXIpIHtcbiAgZm9yIChsZXQgaSA9IGJlZ2luOyBpIDwgZW5kOyBpKyspIHtcbiAgICBpZiAoYXJyW2ldID09PSBpdGVtKSByZXR1cm4gaTtcbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbi8qKlxuICogVXNlIHRoaXMgd2l0aCBgbXVsdGlgIGBwcm92aWRlcnNgLlxuICovXG5mdW5jdGlvbiBtdWx0aVByb3ZpZGVyc0ZhY3RvcnlSZXNvbHZlcihcbiAgICB0aGlzOiBOb2RlSW5qZWN0b3JGYWN0b3J5LCBfOiBudWxsLCB0RGF0YTogVERhdGEsIGxEYXRhOiBMVmlld0RhdGEsXG4gICAgdE5vZGU6IFRFbGVtZW50Tm9kZSk6IGFueVtdIHtcbiAgcmV0dXJuIG11bHRpUmVzb2x2ZSh0aGlzLm11bHRpICEsIFtdKTtcbn1cblxuLyoqXG4gKiBVc2UgdGhpcyB3aXRoIGBtdWx0aWAgYHZpZXdQcm92aWRlcnNgLlxuICpcbiAqIFRoaXMgZmFjdG9yeSBrbm93cyBob3cgdG8gY29uY2F0ZW5hdGUgaXRzZWxmIHdpdGggdGhlIGV4aXN0aW5nIGBtdWx0aWAgYHByb3ZpZGVyc2AuXG4gKi9cbmZ1bmN0aW9uIG11bHRpVmlld1Byb3ZpZGVyc0ZhY3RvcnlSZXNvbHZlcihcbiAgICB0aGlzOiBOb2RlSW5qZWN0b3JGYWN0b3J5LCBfOiBudWxsLCB0RGF0YTogVERhdGEsIGxEYXRhOiBMVmlld0RhdGEsXG4gICAgdE5vZGU6IFRFbGVtZW50Tm9kZSk6IGFueVtdIHtcbiAgY29uc3QgZmFjdG9yaWVzID0gdGhpcy5tdWx0aSAhO1xuICBsZXQgcmVzdWx0OiBhbnlbXTtcbiAgaWYgKHRoaXMucHJvdmlkZXJGYWN0b3J5KSB7XG4gICAgY29uc3QgY29tcG9uZW50Q291bnQgPSB0aGlzLnByb3ZpZGVyRmFjdG9yeS5jb21wb25lbnRQcm92aWRlcnMgITtcbiAgICBjb25zdCBtdWx0aVByb3ZpZGVycyA9IGdldE5vZGVJbmplY3RhYmxlKHREYXRhLCBsRGF0YSwgdGhpcy5wcm92aWRlckZhY3RvcnkgIS5pbmRleCAhLCB0Tm9kZSk7XG4gICAgLy8gQ29weSB0aGUgc2VjdGlvbiBvZiB0aGUgYXJyYXkgd2hpY2ggY29udGFpbnMgYG11bHRpYCBgcHJvdmlkZXJzYCBmcm9tIHRoZSBjb21wb25lbnRcbiAgICByZXN1bHQgPSBtdWx0aVByb3ZpZGVycy5zbGljZSgwLCBjb21wb25lbnRDb3VudCk7XG4gICAgLy8gSW5zZXJ0IHRoZSBgdmlld1Byb3ZpZGVyYCBpbnN0YW5jZXMuXG4gICAgbXVsdGlSZXNvbHZlKGZhY3RvcmllcywgcmVzdWx0KTtcbiAgICAvLyBDb3B5IHRoZSBzZWN0aW9uIG9mIHRoZSBhcnJheSB3aGljaCBjb250YWlucyBgbXVsdGlgIGBwcm92aWRlcnNgIGZyb20gb3RoZXIgZGlyZWN0aXZlc1xuICAgIGZvciAobGV0IGkgPSBjb21wb25lbnRDb3VudDsgaSA8IG11bHRpUHJvdmlkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHQucHVzaChtdWx0aVByb3ZpZGVyc1tpXSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9IFtdO1xuICAgIC8vIEluc2VydCB0aGUgYHZpZXdQcm92aWRlcmAgaW5zdGFuY2VzLlxuICAgIG11bHRpUmVzb2x2ZShmYWN0b3JpZXMsIHJlc3VsdCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBNYXBzIGFuIGFycmF5IG9mIGZhY3RvcmllcyBpbnRvIGFuIGFycmF5IG9mIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gbXVsdGlSZXNvbHZlKGZhY3RvcmllczogQXJyYXk8KCkgPT4gYW55PiwgcmVzdWx0OiBhbnlbXSk6IGFueVtdIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBmYWN0b3JpZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBmYWN0b3J5ID0gZmFjdG9yaWVzW2ldICFhcygpID0+IG51bGw7XG4gICAgcmVzdWx0LnB1c2goZmFjdG9yeSgpKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBtdWx0aSBmYWN0b3J5LlxuICovXG5mdW5jdGlvbiBtdWx0aUZhY3RvcnkoXG4gICAgZmFjdG9yeUZuOlxuICAgICAgICAodGhpczogTm9kZUluamVjdG9yRmFjdG9yeSwgXzogbnVsbCwgdERhdGE6IFREYXRhLCBsRGF0YTogTFZpZXdEYXRhLCB0Tm9kZTogVEVsZW1lbnROb2RlKSA9PlxuICAgICAgICAgICAgYW55LFxuICAgIGluZGV4OiBudW1iZXIsIGlzVmlld1Byb3ZpZGVyOiBib29sZWFuLCBpc0NvbXBvbmVudDogYm9vbGVhbixcbiAgICBmOiAoKSA9PiBhbnkpOiBOb2RlSW5qZWN0b3JGYWN0b3J5IHtcbiAgY29uc3QgZmFjdG9yeSA9IG5ldyBOb2RlSW5qZWN0b3JGYWN0b3J5KGZhY3RvcnlGbiwgaXNWaWV3UHJvdmlkZXIsIGRpcmVjdGl2ZUluamVjdCk7XG4gIGZhY3RvcnkubXVsdGkgPSBbXTtcbiAgZmFjdG9yeS5pbmRleCA9IGluZGV4O1xuICBmYWN0b3J5LmNvbXBvbmVudFByb3ZpZGVycyA9IDA7XG4gIG11bHRpRmFjdG9yeUFkZChmYWN0b3J5LCBmLCBpc0NvbXBvbmVudCAmJiAhaXNWaWV3UHJvdmlkZXIpO1xuICByZXR1cm4gZmFjdG9yeTtcbn1cbiJdfQ==