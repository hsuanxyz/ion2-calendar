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
import { DebugElement, DebugNode, EventListener, getDebugNode, indexDebugNode, removeDebugNodeFromIndex } from '../debug/debug_node';
import { getInjectableDef } from '../di/defs';
import { ErrorHandler } from '../error_handler';
import { isDevMode } from '../is_dev_mode';
import { ivyEnabled } from '../ivy_switch';
import { RendererFactory2 } from '../render/api';
import { Sanitizer } from '../sanitization/security';
import { tokenKey } from '../view/util';
import { isViewDebugError, viewDestroyedError, viewWrappedDebugError } from './errors';
import { resolveDep } from './provider';
import { dirtyParentQueries, getQueryValue } from './query';
import { createInjector, createNgModuleRef, getComponentViewDefinitionFactory } from './refs';
import { Services, asElementData, asPureExpressionData } from './types';
import { NOOP, isComponentView, renderNode, resolveDefinition, splitDepsDsl, viewParentEl } from './util';
import { checkAndUpdateNode, checkAndUpdateView, checkNoChangesNode, checkNoChangesView, createComponentView, createEmbeddedView, createRootView, destroyView } from './view';
/** @type {?} */
let initialized = false;
/**
 * @return {?}
 */
export function initServicesIfNeeded() {
    if (initialized) {
        return;
    }
    initialized = true;
    /** @type {?} */
    const services = isDevMode() ? createDebugServices() : createProdServices();
    Services.setCurrentNode = services.setCurrentNode;
    Services.createRootView = services.createRootView;
    Services.createEmbeddedView = services.createEmbeddedView;
    Services.createComponentView = services.createComponentView;
    Services.createNgModuleRef = services.createNgModuleRef;
    Services.overrideProvider = services.overrideProvider;
    Services.overrideComponentView = services.overrideComponentView;
    Services.clearOverrides = services.clearOverrides;
    Services.checkAndUpdateView = services.checkAndUpdateView;
    Services.checkNoChangesView = services.checkNoChangesView;
    Services.destroyView = services.destroyView;
    Services.resolveDep = resolveDep;
    Services.createDebugContext = services.createDebugContext;
    Services.handleEvent = services.handleEvent;
    Services.updateDirectives = services.updateDirectives;
    Services.updateRenderer = services.updateRenderer;
    Services.dirtyParentQueries = dirtyParentQueries;
}
/**
 * @return {?}
 */
function createProdServices() {
    return {
        setCurrentNode: () => { },
        createRootView: createProdRootView,
        createEmbeddedView: createEmbeddedView,
        createComponentView: createComponentView,
        createNgModuleRef: createNgModuleRef,
        overrideProvider: NOOP,
        overrideComponentView: NOOP,
        clearOverrides: NOOP,
        checkAndUpdateView: checkAndUpdateView,
        checkNoChangesView: checkNoChangesView,
        destroyView: destroyView,
        createDebugContext: (view, nodeIndex) => new DebugContext_(view, nodeIndex),
        handleEvent: (view, nodeIndex, eventName, event) => view.def.handleEvent(view, nodeIndex, eventName, event),
        updateDirectives: (view, checkType) => view.def.updateDirectives(checkType === 0 /* CheckAndUpdate */ ? prodCheckAndUpdateNode :
            prodCheckNoChangesNode, view),
        updateRenderer: (view, checkType) => view.def.updateRenderer(checkType === 0 /* CheckAndUpdate */ ? prodCheckAndUpdateNode :
            prodCheckNoChangesNode, view),
    };
}
/**
 * @return {?}
 */
function createDebugServices() {
    return {
        setCurrentNode: debugSetCurrentNode,
        createRootView: debugCreateRootView,
        createEmbeddedView: debugCreateEmbeddedView,
        createComponentView: debugCreateComponentView,
        createNgModuleRef: debugCreateNgModuleRef,
        overrideProvider: debugOverrideProvider,
        overrideComponentView: debugOverrideComponentView,
        clearOverrides: debugClearOverrides,
        checkAndUpdateView: debugCheckAndUpdateView,
        checkNoChangesView: debugCheckNoChangesView,
        destroyView: debugDestroyView,
        createDebugContext: (view, nodeIndex) => new DebugContext_(view, nodeIndex),
        handleEvent: debugHandleEvent,
        updateDirectives: debugUpdateDirectives,
        updateRenderer: debugUpdateRenderer,
    };
}
/**
 * @param {?} elInjector
 * @param {?} projectableNodes
 * @param {?} rootSelectorOrNode
 * @param {?} def
 * @param {?} ngModule
 * @param {?=} context
 * @return {?}
 */
function createProdRootView(elInjector, projectableNodes, rootSelectorOrNode, def, ngModule, context) {
    /** @type {?} */
    const rendererFactory = ngModule.injector.get(RendererFactory2);
    return createRootView(createRootData(elInjector, ngModule, rendererFactory, projectableNodes, rootSelectorOrNode), def, context);
}
/**
 * @param {?} elInjector
 * @param {?} projectableNodes
 * @param {?} rootSelectorOrNode
 * @param {?} def
 * @param {?} ngModule
 * @param {?=} context
 * @return {?}
 */
function debugCreateRootView(elInjector, projectableNodes, rootSelectorOrNode, def, ngModule, context) {
    /** @type {?} */
    const rendererFactory = ngModule.injector.get(RendererFactory2);
    /** @type {?} */
    const root = createRootData(elInjector, ngModule, new DebugRendererFactory2(rendererFactory), projectableNodes, rootSelectorOrNode);
    /** @type {?} */
    const defWithOverride = applyProviderOverridesToView(def);
    return callWithDebugContext(DebugAction.create, createRootView, null, [root, defWithOverride, context]);
}
/**
 * @param {?} elInjector
 * @param {?} ngModule
 * @param {?} rendererFactory
 * @param {?} projectableNodes
 * @param {?} rootSelectorOrNode
 * @return {?}
 */
function createRootData(elInjector, ngModule, rendererFactory, projectableNodes, rootSelectorOrNode) {
    /** @type {?} */
    const sanitizer = ngModule.injector.get(Sanitizer);
    /** @type {?} */
    const errorHandler = ngModule.injector.get(ErrorHandler);
    /** @type {?} */
    const renderer = rendererFactory.createRenderer(null, null);
    return {
        ngModule,
        injector: elInjector, projectableNodes,
        selectorOrNode: rootSelectorOrNode, sanitizer, rendererFactory, renderer, errorHandler
    };
}
/**
 * @param {?} parentView
 * @param {?} anchorDef
 * @param {?} viewDef
 * @param {?=} context
 * @return {?}
 */
function debugCreateEmbeddedView(parentView, anchorDef, viewDef, context) {
    /** @type {?} */
    const defWithOverride = applyProviderOverridesToView(viewDef);
    return callWithDebugContext(DebugAction.create, createEmbeddedView, null, [parentView, anchorDef, defWithOverride, context]);
}
/**
 * @param {?} parentView
 * @param {?} nodeDef
 * @param {?} viewDef
 * @param {?} hostElement
 * @return {?}
 */
function debugCreateComponentView(parentView, nodeDef, viewDef, hostElement) {
    /** @type {?} */
    const overrideComponentView = viewDefOverrides.get((/** @type {?} */ ((/** @type {?} */ ((/** @type {?} */ (nodeDef.element)).componentProvider)).provider)).token);
    if (overrideComponentView) {
        viewDef = overrideComponentView;
    }
    else {
        viewDef = applyProviderOverridesToView(viewDef);
    }
    return callWithDebugContext(DebugAction.create, createComponentView, null, [parentView, nodeDef, viewDef, hostElement]);
}
/**
 * @param {?} moduleType
 * @param {?} parentInjector
 * @param {?} bootstrapComponents
 * @param {?} def
 * @return {?}
 */
function debugCreateNgModuleRef(moduleType, parentInjector, bootstrapComponents, def) {
    /** @type {?} */
    const defWithOverride = applyProviderOverridesToNgModule(def);
    return createNgModuleRef(moduleType, parentInjector, bootstrapComponents, defWithOverride);
}
/** @type {?} */
const providerOverrides = new Map();
/** @type {?} */
const providerOverridesWithScope = new Map();
/** @type {?} */
const viewDefOverrides = new Map();
/**
 * @param {?} override
 * @return {?}
 */
function debugOverrideProvider(override) {
    providerOverrides.set(override.token, override);
    /** @type {?} */
    let injectableDef;
    if (typeof override.token === 'function' && (injectableDef = getInjectableDef(override.token)) &&
        typeof injectableDef.providedIn === 'function') {
        providerOverridesWithScope.set((/** @type {?} */ (override.token)), override);
    }
}
/**
 * @param {?} comp
 * @param {?} compFactory
 * @return {?}
 */
function debugOverrideComponentView(comp, compFactory) {
    /** @type {?} */
    const hostViewDef = resolveDefinition(getComponentViewDefinitionFactory(compFactory));
    /** @type {?} */
    const compViewDef = resolveDefinition((/** @type {?} */ ((/** @type {?} */ (hostViewDef.nodes[0].element)).componentView)));
    viewDefOverrides.set(comp, compViewDef);
}
/**
 * @return {?}
 */
function debugClearOverrides() {
    providerOverrides.clear();
    providerOverridesWithScope.clear();
    viewDefOverrides.clear();
}
// Notes about the algorithm:
// 1) Locate the providers of an element and check if one of them was overwritten
// 2) Change the providers of that element
//
// We only create new datastructures if we need to, to keep perf impact
// reasonable.
/**
 * @param {?} def
 * @return {?}
 */
function applyProviderOverridesToView(def) {
    if (providerOverrides.size === 0) {
        return def;
    }
    /** @type {?} */
    const elementIndicesWithOverwrittenProviders = findElementIndicesWithOverwrittenProviders(def);
    if (elementIndicesWithOverwrittenProviders.length === 0) {
        return def;
    }
    // clone the whole view definition,
    // as it maintains references between the nodes that are hard to update.
    def = (/** @type {?} */ (def.factory))(() => NOOP);
    for (let i = 0; i < elementIndicesWithOverwrittenProviders.length; i++) {
        applyProviderOverridesToElement(def, elementIndicesWithOverwrittenProviders[i]);
    }
    return def;
    /**
     * @param {?} def
     * @return {?}
     */
    function findElementIndicesWithOverwrittenProviders(def) {
        /** @type {?} */
        const elIndicesWithOverwrittenProviders = [];
        /** @type {?} */
        let lastElementDef = null;
        for (let i = 0; i < def.nodes.length; i++) {
            /** @type {?} */
            const nodeDef = def.nodes[i];
            if (nodeDef.flags & 1 /* TypeElement */) {
                lastElementDef = nodeDef;
            }
            if (lastElementDef && nodeDef.flags & 3840 /* CatProviderNoDirective */ &&
                providerOverrides.has((/** @type {?} */ (nodeDef.provider)).token)) {
                elIndicesWithOverwrittenProviders.push((/** @type {?} */ (lastElementDef)).nodeIndex);
                lastElementDef = null;
            }
        }
        return elIndicesWithOverwrittenProviders;
    }
    /**
     * @param {?} viewDef
     * @param {?} elIndex
     * @return {?}
     */
    function applyProviderOverridesToElement(viewDef, elIndex) {
        for (let i = elIndex + 1; i < viewDef.nodes.length; i++) {
            /** @type {?} */
            const nodeDef = viewDef.nodes[i];
            if (nodeDef.flags & 1 /* TypeElement */) {
                // stop at the next element
                return;
            }
            if (nodeDef.flags & 3840 /* CatProviderNoDirective */) {
                /** @type {?} */
                const provider = (/** @type {?} */ (nodeDef.provider));
                /** @type {?} */
                const override = providerOverrides.get(provider.token);
                if (override) {
                    nodeDef.flags = (nodeDef.flags & ~3840 /* CatProviderNoDirective */) | override.flags;
                    provider.deps = splitDepsDsl(override.deps);
                    provider.value = override.value;
                }
            }
        }
    }
}
// Notes about the algorithm:
// We only create new datastructures if we need to, to keep perf impact
// reasonable.
/**
 * @param {?} def
 * @return {?}
 */
function applyProviderOverridesToNgModule(def) {
    const { hasOverrides, hasDeprecatedOverrides } = calcHasOverrides(def);
    if (!hasOverrides) {
        return def;
    }
    // clone the whole view definition,
    // as it maintains references between the nodes that are hard to update.
    def = (/** @type {?} */ (def.factory))(() => NOOP);
    applyProviderOverrides(def);
    return def;
    /**
     * @param {?} def
     * @return {?}
     */
    function calcHasOverrides(def) {
        /** @type {?} */
        let hasOverrides = false;
        /** @type {?} */
        let hasDeprecatedOverrides = false;
        if (providerOverrides.size === 0) {
            return { hasOverrides, hasDeprecatedOverrides };
        }
        def.providers.forEach(node => {
            /** @type {?} */
            const override = providerOverrides.get(node.token);
            if ((node.flags & 3840 /* CatProviderNoDirective */) && override) {
                hasOverrides = true;
                hasDeprecatedOverrides = hasDeprecatedOverrides || override.deprecatedBehavior;
            }
        });
        def.modules.forEach(module => {
            providerOverridesWithScope.forEach((override, token) => {
                if ((/** @type {?} */ (getInjectableDef(token))).providedIn === module) {
                    hasOverrides = true;
                    hasDeprecatedOverrides = hasDeprecatedOverrides || override.deprecatedBehavior;
                }
            });
        });
        return { hasOverrides, hasDeprecatedOverrides };
    }
    /**
     * @param {?} def
     * @return {?}
     */
    function applyProviderOverrides(def) {
        for (let i = 0; i < def.providers.length; i++) {
            /** @type {?} */
            const provider = def.providers[i];
            if (hasDeprecatedOverrides) {
                // We had a bug where me made
                // all providers lazy. Keep this logic behind a flag
                // for migrating existing users.
                provider.flags |= 4096 /* LazyProvider */;
            }
            /** @type {?} */
            const override = providerOverrides.get(provider.token);
            if (override) {
                provider.flags = (provider.flags & ~3840 /* CatProviderNoDirective */) | override.flags;
                provider.deps = splitDepsDsl(override.deps);
                provider.value = override.value;
            }
        }
        if (providerOverridesWithScope.size > 0) {
            /** @type {?} */
            let moduleSet = new Set(def.modules);
            providerOverridesWithScope.forEach((override, token) => {
                if (moduleSet.has((/** @type {?} */ (getInjectableDef(token))).providedIn)) {
                    /** @type {?} */
                    let provider = {
                        token: token,
                        flags: override.flags | (hasDeprecatedOverrides ? 4096 /* LazyProvider */ : 0 /* None */),
                        deps: splitDepsDsl(override.deps),
                        value: override.value,
                        index: def.providers.length,
                    };
                    def.providers.push(provider);
                    def.providersByKey[tokenKey(token)] = provider;
                }
            });
        }
    }
}
/**
 * @param {?} view
 * @param {?} checkIndex
 * @param {?} argStyle
 * @param {?=} v0
 * @param {?=} v1
 * @param {?=} v2
 * @param {?=} v3
 * @param {?=} v4
 * @param {?=} v5
 * @param {?=} v6
 * @param {?=} v7
 * @param {?=} v8
 * @param {?=} v9
 * @return {?}
 */
function prodCheckAndUpdateNode(view, checkIndex, argStyle, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
    /** @type {?} */
    const nodeDef = view.def.nodes[checkIndex];
    checkAndUpdateNode(view, nodeDef, argStyle, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
    return (nodeDef.flags & 224 /* CatPureExpression */) ?
        asPureExpressionData(view, checkIndex).value :
        undefined;
}
/**
 * @param {?} view
 * @param {?} checkIndex
 * @param {?} argStyle
 * @param {?=} v0
 * @param {?=} v1
 * @param {?=} v2
 * @param {?=} v3
 * @param {?=} v4
 * @param {?=} v5
 * @param {?=} v6
 * @param {?=} v7
 * @param {?=} v8
 * @param {?=} v9
 * @return {?}
 */
function prodCheckNoChangesNode(view, checkIndex, argStyle, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
    /** @type {?} */
    const nodeDef = view.def.nodes[checkIndex];
    checkNoChangesNode(view, nodeDef, argStyle, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
    return (nodeDef.flags & 224 /* CatPureExpression */) ?
        asPureExpressionData(view, checkIndex).value :
        undefined;
}
/**
 * @param {?} view
 * @return {?}
 */
function debugCheckAndUpdateView(view) {
    return callWithDebugContext(DebugAction.detectChanges, checkAndUpdateView, null, [view]);
}
/**
 * @param {?} view
 * @return {?}
 */
function debugCheckNoChangesView(view) {
    return callWithDebugContext(DebugAction.checkNoChanges, checkNoChangesView, null, [view]);
}
/**
 * @param {?} view
 * @return {?}
 */
function debugDestroyView(view) {
    return callWithDebugContext(DebugAction.destroy, destroyView, null, [view]);
}
/** @enum {number} */
const DebugAction = {
    create: 0,
    detectChanges: 1,
    checkNoChanges: 2,
    destroy: 3,
    handleEvent: 4,
};
DebugAction[DebugAction.create] = 'create';
DebugAction[DebugAction.detectChanges] = 'detectChanges';
DebugAction[DebugAction.checkNoChanges] = 'checkNoChanges';
DebugAction[DebugAction.destroy] = 'destroy';
DebugAction[DebugAction.handleEvent] = 'handleEvent';
/** @type {?} */
let _currentAction;
/** @type {?} */
let _currentView;
/** @type {?} */
let _currentNodeIndex;
/**
 * @param {?} view
 * @param {?} nodeIndex
 * @return {?}
 */
function debugSetCurrentNode(view, nodeIndex) {
    _currentView = view;
    _currentNodeIndex = nodeIndex;
}
/**
 * @param {?} view
 * @param {?} nodeIndex
 * @param {?} eventName
 * @param {?} event
 * @return {?}
 */
function debugHandleEvent(view, nodeIndex, eventName, event) {
    debugSetCurrentNode(view, nodeIndex);
    return callWithDebugContext(DebugAction.handleEvent, view.def.handleEvent, null, [view, nodeIndex, eventName, event]);
}
/**
 * @param {?} view
 * @param {?} checkType
 * @return {?}
 */
function debugUpdateDirectives(view, checkType) {
    if (view.state & 128 /* Destroyed */) {
        throw viewDestroyedError(DebugAction[_currentAction]);
    }
    debugSetCurrentNode(view, nextDirectiveWithBinding(view, 0));
    return view.def.updateDirectives(debugCheckDirectivesFn, view);
    /**
     * @param {?} view
     * @param {?} nodeIndex
     * @param {?} argStyle
     * @param {...?} values
     * @return {?}
     */
    function debugCheckDirectivesFn(view, nodeIndex, argStyle, ...values) {
        /** @type {?} */
        const nodeDef = view.def.nodes[nodeIndex];
        if (checkType === 0 /* CheckAndUpdate */) {
            debugCheckAndUpdateNode(view, nodeDef, argStyle, values);
        }
        else {
            debugCheckNoChangesNode(view, nodeDef, argStyle, values);
        }
        if (nodeDef.flags & 16384 /* TypeDirective */) {
            debugSetCurrentNode(view, nextDirectiveWithBinding(view, nodeIndex));
        }
        return (nodeDef.flags & 224 /* CatPureExpression */) ?
            asPureExpressionData(view, nodeDef.nodeIndex).value :
            undefined;
    }
}
/**
 * @param {?} view
 * @param {?} checkType
 * @return {?}
 */
function debugUpdateRenderer(view, checkType) {
    if (view.state & 128 /* Destroyed */) {
        throw viewDestroyedError(DebugAction[_currentAction]);
    }
    debugSetCurrentNode(view, nextRenderNodeWithBinding(view, 0));
    return view.def.updateRenderer(debugCheckRenderNodeFn, view);
    /**
     * @param {?} view
     * @param {?} nodeIndex
     * @param {?} argStyle
     * @param {...?} values
     * @return {?}
     */
    function debugCheckRenderNodeFn(view, nodeIndex, argStyle, ...values) {
        /** @type {?} */
        const nodeDef = view.def.nodes[nodeIndex];
        if (checkType === 0 /* CheckAndUpdate */) {
            debugCheckAndUpdateNode(view, nodeDef, argStyle, values);
        }
        else {
            debugCheckNoChangesNode(view, nodeDef, argStyle, values);
        }
        if (nodeDef.flags & 3 /* CatRenderNode */) {
            debugSetCurrentNode(view, nextRenderNodeWithBinding(view, nodeIndex));
        }
        return (nodeDef.flags & 224 /* CatPureExpression */) ?
            asPureExpressionData(view, nodeDef.nodeIndex).value :
            undefined;
    }
}
/**
 * @param {?} view
 * @param {?} nodeDef
 * @param {?} argStyle
 * @param {?} givenValues
 * @return {?}
 */
function debugCheckAndUpdateNode(view, nodeDef, argStyle, givenValues) {
    /** @type {?} */
    const changed = ((/** @type {?} */ (checkAndUpdateNode)))(view, nodeDef, argStyle, ...givenValues);
    if (changed) {
        /** @type {?} */
        const values = argStyle === 1 /* Dynamic */ ? givenValues[0] : givenValues;
        if (nodeDef.flags & 16384 /* TypeDirective */) {
            /** @type {?} */
            const bindingValues = {};
            for (let i = 0; i < nodeDef.bindings.length; i++) {
                /** @type {?} */
                const binding = nodeDef.bindings[i];
                /** @type {?} */
                const value = values[i];
                if (binding.flags & 8 /* TypeProperty */) {
                    bindingValues[normalizeDebugBindingName((/** @type {?} */ (binding.nonMinifiedName)))] =
                        normalizeDebugBindingValue(value);
                }
            }
            /** @type {?} */
            const elDef = (/** @type {?} */ (nodeDef.parent));
            /** @type {?} */
            const el = asElementData(view, elDef.nodeIndex).renderElement;
            if (!(/** @type {?} */ (elDef.element)).name) {
                // a comment.
                view.renderer.setValue(el, `bindings=${JSON.stringify(bindingValues, null, 2)}`);
            }
            else {
                // a regular element.
                for (let attr in bindingValues) {
                    /** @type {?} */
                    const value = bindingValues[attr];
                    if (value != null) {
                        view.renderer.setAttribute(el, attr, value);
                    }
                    else {
                        view.renderer.removeAttribute(el, attr);
                    }
                }
            }
        }
    }
}
/**
 * @param {?} view
 * @param {?} nodeDef
 * @param {?} argStyle
 * @param {?} values
 * @return {?}
 */
function debugCheckNoChangesNode(view, nodeDef, argStyle, values) {
    ((/** @type {?} */ (checkNoChangesNode)))(view, nodeDef, argStyle, ...values);
}
/**
 * @param {?} name
 * @return {?}
 */
function normalizeDebugBindingName(name) {
    // Attribute names with `$` (eg `x-y$`) are valid per spec, but unsupported by some browsers
    name = camelCaseToDashCase(name.replace(/[$@]/g, '_'));
    return `ng-reflect-${name}`;
}
/** @type {?} */
const CAMEL_CASE_REGEXP = /([A-Z])/g;
/**
 * @param {?} input
 * @return {?}
 */
function camelCaseToDashCase(input) {
    return input.replace(CAMEL_CASE_REGEXP, (...m) => '-' + m[1].toLowerCase());
}
/**
 * @param {?} value
 * @return {?}
 */
function normalizeDebugBindingValue(value) {
    try {
        // Limit the size of the value as otherwise the DOM just gets polluted.
        return value != null ? value.toString().slice(0, 30) : value;
    }
    catch (e) {
        return '[ERROR] Exception while trying to serialize the value';
    }
}
/**
 * @param {?} view
 * @param {?} nodeIndex
 * @return {?}
 */
function nextDirectiveWithBinding(view, nodeIndex) {
    for (let i = nodeIndex; i < view.def.nodes.length; i++) {
        /** @type {?} */
        const nodeDef = view.def.nodes[i];
        if (nodeDef.flags & 16384 /* TypeDirective */ && nodeDef.bindings && nodeDef.bindings.length) {
            return i;
        }
    }
    return null;
}
/**
 * @param {?} view
 * @param {?} nodeIndex
 * @return {?}
 */
function nextRenderNodeWithBinding(view, nodeIndex) {
    for (let i = nodeIndex; i < view.def.nodes.length; i++) {
        /** @type {?} */
        const nodeDef = view.def.nodes[i];
        if ((nodeDef.flags & 3 /* CatRenderNode */) && nodeDef.bindings && nodeDef.bindings.length) {
            return i;
        }
    }
    return null;
}
class DebugContext_ {
    /**
     * @param {?} view
     * @param {?} nodeIndex
     */
    constructor(view, nodeIndex) {
        this.view = view;
        this.nodeIndex = nodeIndex;
        if (nodeIndex == null) {
            this.nodeIndex = nodeIndex = 0;
        }
        this.nodeDef = view.def.nodes[nodeIndex];
        /** @type {?} */
        let elDef = this.nodeDef;
        /** @type {?} */
        let elView = view;
        while (elDef && (elDef.flags & 1 /* TypeElement */) === 0) {
            elDef = (/** @type {?} */ (elDef.parent));
        }
        if (!elDef) {
            while (!elDef && elView) {
                elDef = (/** @type {?} */ (viewParentEl(elView)));
                elView = (/** @type {?} */ (elView.parent));
            }
        }
        this.elDef = elDef;
        this.elView = elView;
    }
    /**
     * @return {?}
     */
    get elOrCompView() {
        // Has to be done lazily as we use the DebugContext also during creation of elements...
        return asElementData(this.elView, this.elDef.nodeIndex).componentView || this.view;
    }
    /**
     * @return {?}
     */
    get injector() { return createInjector(this.elView, this.elDef); }
    /**
     * @return {?}
     */
    get component() { return this.elOrCompView.component; }
    /**
     * @return {?}
     */
    get context() { return this.elOrCompView.context; }
    /**
     * @return {?}
     */
    get providerTokens() {
        /** @type {?} */
        const tokens = [];
        if (this.elDef) {
            for (let i = this.elDef.nodeIndex + 1; i <= this.elDef.nodeIndex + this.elDef.childCount; i++) {
                /** @type {?} */
                const childDef = this.elView.def.nodes[i];
                if (childDef.flags & 20224 /* CatProvider */) {
                    tokens.push((/** @type {?} */ (childDef.provider)).token);
                }
                i += childDef.childCount;
            }
        }
        return tokens;
    }
    /**
     * @return {?}
     */
    get references() {
        /** @type {?} */
        const references = {};
        if (this.elDef) {
            collectReferences(this.elView, this.elDef, references);
            for (let i = this.elDef.nodeIndex + 1; i <= this.elDef.nodeIndex + this.elDef.childCount; i++) {
                /** @type {?} */
                const childDef = this.elView.def.nodes[i];
                if (childDef.flags & 20224 /* CatProvider */) {
                    collectReferences(this.elView, childDef, references);
                }
                i += childDef.childCount;
            }
        }
        return references;
    }
    /**
     * @return {?}
     */
    get componentRenderElement() {
        /** @type {?} */
        const elData = findHostElement(this.elOrCompView);
        return elData ? elData.renderElement : undefined;
    }
    /**
     * @return {?}
     */
    get renderNode() {
        return this.nodeDef.flags & 2 /* TypeText */ ? renderNode(this.view, this.nodeDef) :
            renderNode(this.elView, this.elDef);
    }
    /**
     * @param {?} console
     * @param {...?} values
     * @return {?}
     */
    logError(console, ...values) {
        /** @type {?} */
        let logViewDef;
        /** @type {?} */
        let logNodeIndex;
        if (this.nodeDef.flags & 2 /* TypeText */) {
            logViewDef = this.view.def;
            logNodeIndex = this.nodeDef.nodeIndex;
        }
        else {
            logViewDef = this.elView.def;
            logNodeIndex = this.elDef.nodeIndex;
        }
        // Note: we only generate a log function for text and element nodes
        // to make the generated code as small as possible.
        /** @type {?} */
        const renderNodeIndex = getRenderNodeIndex(logViewDef, logNodeIndex);
        /** @type {?} */
        let currRenderNodeIndex = -1;
        /** @type {?} */
        let nodeLogger = () => {
            currRenderNodeIndex++;
            if (currRenderNodeIndex === renderNodeIndex) {
                return console.error.bind(console, ...values);
            }
            else {
                return NOOP;
            }
        };
        (/** @type {?} */ (logViewDef.factory))(nodeLogger);
        if (currRenderNodeIndex < renderNodeIndex) {
            console.error('Illegal state: the ViewDefinitionFactory did not call the logger!');
            ((/** @type {?} */ (console.error)))(...values);
        }
    }
}
if (false) {
    /** @type {?} */
    DebugContext_.prototype.nodeDef;
    /** @type {?} */
    DebugContext_.prototype.elView;
    /** @type {?} */
    DebugContext_.prototype.elDef;
    /** @type {?} */
    DebugContext_.prototype.view;
    /** @type {?} */
    DebugContext_.prototype.nodeIndex;
}
/**
 * @param {?} viewDef
 * @param {?} nodeIndex
 * @return {?}
 */
function getRenderNodeIndex(viewDef, nodeIndex) {
    /** @type {?} */
    let renderNodeIndex = -1;
    for (let i = 0; i <= nodeIndex; i++) {
        /** @type {?} */
        const nodeDef = viewDef.nodes[i];
        if (nodeDef.flags & 3 /* CatRenderNode */) {
            renderNodeIndex++;
        }
    }
    return renderNodeIndex;
}
/**
 * @param {?} view
 * @return {?}
 */
function findHostElement(view) {
    while (view && !isComponentView(view)) {
        view = (/** @type {?} */ (view.parent));
    }
    if (view.parent) {
        return asElementData(view.parent, (/** @type {?} */ (viewParentEl(view))).nodeIndex);
    }
    return null;
}
/**
 * @param {?} view
 * @param {?} nodeDef
 * @param {?} references
 * @return {?}
 */
function collectReferences(view, nodeDef, references) {
    for (let refName in nodeDef.references) {
        references[refName] = getQueryValue(view, nodeDef, nodeDef.references[refName]);
    }
}
/**
 * @param {?} action
 * @param {?} fn
 * @param {?} self
 * @param {?} args
 * @return {?}
 */
function callWithDebugContext(action, fn, self, args) {
    /** @type {?} */
    const oldAction = _currentAction;
    /** @type {?} */
    const oldView = _currentView;
    /** @type {?} */
    const oldNodeIndex = _currentNodeIndex;
    try {
        _currentAction = action;
        /** @type {?} */
        const result = fn.apply(self, args);
        _currentView = oldView;
        _currentNodeIndex = oldNodeIndex;
        _currentAction = oldAction;
        return result;
    }
    catch (e) {
        if (isViewDebugError(e) || !_currentView) {
            throw e;
        }
        throw viewWrappedDebugError(e, (/** @type {?} */ (getCurrentDebugContext())));
    }
}
/**
 * @return {?}
 */
export function getCurrentDebugContext() {
    return _currentView ? new DebugContext_(_currentView, _currentNodeIndex) : null;
}
export class DebugRendererFactory2 {
    /**
     * @param {?} delegate
     */
    constructor(delegate) {
        this.delegate = delegate;
    }
    /**
     * @param {?} element
     * @param {?} renderData
     * @return {?}
     */
    createRenderer(element, renderData) {
        return new DebugRenderer2(this.delegate.createRenderer(element, renderData));
    }
    /**
     * @return {?}
     */
    begin() {
        if (this.delegate.begin) {
            this.delegate.begin();
        }
    }
    /**
     * @return {?}
     */
    end() {
        if (this.delegate.end) {
            this.delegate.end();
        }
    }
    /**
     * @return {?}
     */
    whenRenderingDone() {
        if (this.delegate.whenRenderingDone) {
            return this.delegate.whenRenderingDone();
        }
        return Promise.resolve(null);
    }
}
if (false) {
    /** @type {?} */
    DebugRendererFactory2.prototype.delegate;
}
export class DebugRenderer2 {
    /**
     * @param {?} delegate
     */
    constructor(delegate) {
        this.delegate = delegate;
        /**
         * Factory function used to create a `DebugContext` when a node is created.
         *
         * The `DebugContext` allows to retrieve information about the nodes that are useful in tests.
         *
         * The factory is configurable so that the `DebugRenderer2` could instantiate either a View Engine
         * or a Render context.
         */
        this.debugContextFactory = getCurrentDebugContext;
        this.data = this.delegate.data;
    }
    /**
     * @param {?} nativeElement
     * @return {?}
     */
    createDebugContext(nativeElement) { return this.debugContextFactory(nativeElement); }
    /**
     * @param {?} node
     * @return {?}
     */
    destroyNode(node) {
        removeDebugNodeFromIndex((/** @type {?} */ (getDebugNode(node))));
        if (this.delegate.destroyNode) {
            this.delegate.destroyNode(node);
        }
    }
    /**
     * @return {?}
     */
    destroy() { this.delegate.destroy(); }
    /**
     * @param {?} name
     * @param {?=} namespace
     * @return {?}
     */
    createElement(name, namespace) {
        /** @type {?} */
        const el = this.delegate.createElement(name, namespace);
        /** @type {?} */
        const debugCtx = this.createDebugContext(el);
        if (debugCtx) {
            /** @type {?} */
            const debugEl = new DebugElement(el, null, debugCtx);
            debugEl.name = name;
            indexDebugNode(debugEl);
        }
        return el;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    createComment(value) {
        /** @type {?} */
        const comment = this.delegate.createComment(value);
        /** @type {?} */
        const debugCtx = this.createDebugContext(comment);
        if (debugCtx) {
            indexDebugNode(new DebugNode(comment, null, debugCtx));
        }
        return comment;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    createText(value) {
        /** @type {?} */
        const text = this.delegate.createText(value);
        /** @type {?} */
        const debugCtx = this.createDebugContext(text);
        if (debugCtx) {
            indexDebugNode(new DebugNode(text, null, debugCtx));
        }
        return text;
    }
    /**
     * @param {?} parent
     * @param {?} newChild
     * @return {?}
     */
    appendChild(parent, newChild) {
        /** @type {?} */
        const debugEl = getDebugNode(parent);
        /** @type {?} */
        const debugChildEl = getDebugNode(newChild);
        if (debugEl && debugChildEl && debugEl instanceof DebugElement) {
            debugEl.addChild(debugChildEl);
        }
        this.delegate.appendChild(parent, newChild);
    }
    /**
     * @param {?} parent
     * @param {?} newChild
     * @param {?} refChild
     * @return {?}
     */
    insertBefore(parent, newChild, refChild) {
        /** @type {?} */
        const debugEl = getDebugNode(parent);
        /** @type {?} */
        const debugChildEl = getDebugNode(newChild);
        /** @type {?} */
        const debugRefEl = (/** @type {?} */ (getDebugNode(refChild)));
        if (debugEl && debugChildEl && debugEl instanceof DebugElement) {
            debugEl.insertBefore(debugRefEl, debugChildEl);
        }
        this.delegate.insertBefore(parent, newChild, refChild);
    }
    /**
     * @param {?} parent
     * @param {?} oldChild
     * @return {?}
     */
    removeChild(parent, oldChild) {
        /** @type {?} */
        const debugEl = getDebugNode(parent);
        /** @type {?} */
        const debugChildEl = getDebugNode(oldChild);
        if (debugEl && debugChildEl && debugEl instanceof DebugElement) {
            debugEl.removeChild(debugChildEl);
        }
        this.delegate.removeChild(parent, oldChild);
    }
    /**
     * @param {?} selectorOrNode
     * @param {?=} preserveContent
     * @return {?}
     */
    selectRootElement(selectorOrNode, preserveContent) {
        /** @type {?} */
        const el = this.delegate.selectRootElement(selectorOrNode, preserveContent);
        /** @type {?} */
        const debugCtx = getCurrentDebugContext() || (ivyEnabled ? this.createDebugContext(el) : null);
        if (debugCtx) {
            indexDebugNode(new DebugElement(el, null, debugCtx));
        }
        return el;
    }
    /**
     * @param {?} el
     * @param {?} name
     * @param {?} value
     * @param {?=} namespace
     * @return {?}
     */
    setAttribute(el, name, value, namespace) {
        /** @type {?} */
        const debugEl = getDebugNode(el);
        if (debugEl && debugEl instanceof DebugElement) {
            /** @type {?} */
            const fullName = namespace ? namespace + ':' + name : name;
            debugEl.attributes[fullName] = value;
        }
        this.delegate.setAttribute(el, name, value, namespace);
    }
    /**
     * @param {?} el
     * @param {?} name
     * @param {?=} namespace
     * @return {?}
     */
    removeAttribute(el, name, namespace) {
        /** @type {?} */
        const debugEl = getDebugNode(el);
        if (debugEl && debugEl instanceof DebugElement) {
            /** @type {?} */
            const fullName = namespace ? namespace + ':' + name : name;
            debugEl.attributes[fullName] = null;
        }
        this.delegate.removeAttribute(el, name, namespace);
    }
    /**
     * @param {?} el
     * @param {?} name
     * @return {?}
     */
    addClass(el, name) {
        /** @type {?} */
        const debugEl = getDebugNode(el);
        if (debugEl && debugEl instanceof DebugElement) {
            debugEl.classes[name] = true;
        }
        this.delegate.addClass(el, name);
    }
    /**
     * @param {?} el
     * @param {?} name
     * @return {?}
     */
    removeClass(el, name) {
        /** @type {?} */
        const debugEl = getDebugNode(el);
        if (debugEl && debugEl instanceof DebugElement) {
            debugEl.classes[name] = false;
        }
        this.delegate.removeClass(el, name);
    }
    /**
     * @param {?} el
     * @param {?} style
     * @param {?} value
     * @param {?} flags
     * @return {?}
     */
    setStyle(el, style, value, flags) {
        /** @type {?} */
        const debugEl = getDebugNode(el);
        if (debugEl && debugEl instanceof DebugElement) {
            debugEl.styles[style] = value;
        }
        this.delegate.setStyle(el, style, value, flags);
    }
    /**
     * @param {?} el
     * @param {?} style
     * @param {?} flags
     * @return {?}
     */
    removeStyle(el, style, flags) {
        /** @type {?} */
        const debugEl = getDebugNode(el);
        if (debugEl && debugEl instanceof DebugElement) {
            debugEl.styles[style] = null;
        }
        this.delegate.removeStyle(el, style, flags);
    }
    /**
     * @param {?} el
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    setProperty(el, name, value) {
        /** @type {?} */
        const debugEl = getDebugNode(el);
        if (debugEl && debugEl instanceof DebugElement) {
            debugEl.properties[name] = value;
        }
        this.delegate.setProperty(el, name, value);
    }
    /**
     * @param {?} target
     * @param {?} eventName
     * @param {?} callback
     * @return {?}
     */
    listen(target, eventName, callback) {
        if (typeof target !== 'string') {
            /** @type {?} */
            const debugEl = getDebugNode(target);
            if (debugEl) {
                debugEl.listeners.push(new EventListener(eventName, callback));
            }
        }
        return this.delegate.listen(target, eventName, callback);
    }
    /**
     * @param {?} node
     * @return {?}
     */
    parentNode(node) { return this.delegate.parentNode(node); }
    /**
     * @param {?} node
     * @return {?}
     */
    nextSibling(node) { return this.delegate.nextSibling(node); }
    /**
     * @param {?} node
     * @param {?} value
     * @return {?}
     */
    setValue(node, value) { return this.delegate.setValue(node, value); }
}
if (false) {
    /** @type {?} */
    DebugRenderer2.prototype.data;
    /**
     * Factory function used to create a `DebugContext` when a node is created.
     *
     * The `DebugContext` allows to retrieve information about the nodes that are useful in tests.
     *
     * The factory is configurable so that the `DebugRenderer2` could instantiate either a View Engine
     * or a Render context.
     * @type {?}
     */
    DebugRenderer2.prototype.debugContextFactory;
    /** @type {?} */
    DebugRenderer2.prototype.delegate;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZXMuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9jb3JlL3NyYy92aWV3L3NlcnZpY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLFlBQVksRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsd0JBQXdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUVuSSxPQUFPLEVBQWdCLGdCQUFnQixFQUFDLE1BQU0sWUFBWSxDQUFDO0FBRTNELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUM5QyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDekMsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUd6QyxPQUFPLEVBQVksZ0JBQWdCLEVBQXFDLE1BQU0sZUFBZSxDQUFDO0FBQzlGLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUVuRCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBRXRDLE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsRUFBRSxxQkFBcUIsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUNyRixPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxhQUFhLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDMUQsT0FBTyxFQUFDLGNBQWMsRUFBRSxpQkFBaUIsRUFBRSxpQ0FBaUMsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUM1RixPQUFPLEVBQW1KLFFBQVEsRUFBdUMsYUFBYSxFQUFFLG9CQUFvQixFQUFDLE1BQU0sU0FBUyxDQUFDO0FBQzdQLE9BQU8sRUFBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFD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LElBQVMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7OztJQUN2RSxRQUFRLENBQUMsSUFBUyxFQUFFLEtBQWEsSUFBVSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDekY7OztJQXRLQyw4QkFBb0M7Ozs7Ozs7Ozs7SUFZcEMsNkNBQTJGOztJQUUvRSxrQ0FBMkIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGVidWdFbGVtZW50LCBEZWJ1Z05vZGUsIEV2ZW50TGlzdGVuZXIsIGdldERlYnVnTm9kZSwgaW5kZXhEZWJ1Z05vZGUsIHJlbW92ZURlYnVnTm9kZUZyb21JbmRleH0gZnJvbSAnLi4vZGVidWcvZGVidWdfbm9kZSc7XG5pbXBvcnQge0luamVjdG9yfSBmcm9tICcuLi9kaSc7XG5pbXBvcnQge0luamVjdGFibGVEZWYsIGdldEluamVjdGFibGVEZWZ9IGZyb20gJy4uL2RpL2RlZnMnO1xuaW1wb3J0IHtJbmplY3RhYmxlVHlwZX0gZnJvbSAnLi4vZGkvaW5qZWN0YWJsZSc7XG5pbXBvcnQge0Vycm9ySGFuZGxlcn0gZnJvbSAnLi4vZXJyb3JfaGFuZGxlcic7XG5pbXBvcnQge2lzRGV2TW9kZX0gZnJvbSAnLi4vaXNfZGV2X21vZGUnO1xuaW1wb3J0IHtpdnlFbmFibGVkfSBmcm9tICcuLi9pdnlfc3dpdGNoJztcbmltcG9ydCB7Q29tcG9uZW50RmFjdG9yeX0gZnJvbSAnLi4vbGlua2VyL2NvbXBvbmVudF9mYWN0b3J5JztcbmltcG9ydCB7TmdNb2R1bGVSZWZ9IGZyb20gJy4uL2xpbmtlci9uZ19tb2R1bGVfZmFjdG9yeSc7XG5pbXBvcnQge1JlbmRlcmVyMiwgUmVuZGVyZXJGYWN0b3J5MiwgUmVuZGVyZXJTdHlsZUZsYWdzMiwgUmVuZGVyZXJUeXBlMn0gZnJvbSAnLi4vcmVuZGVyL2FwaSc7XG5pbXBvcnQge1Nhbml0aXplcn0gZnJvbSAnLi4vc2FuaXRpemF0aW9uL3NlY3VyaXR5JztcbmltcG9ydCB7VHlwZX0gZnJvbSAnLi4vdHlwZSc7XG5pbXBvcnQge3Rva2VuS2V5fSBmcm9tICcuLi92aWV3L3V0aWwnO1xuXG5pbXBvcnQge2lzVmlld0RlYnVnRXJyb3IsIHZpZXdEZXN0cm95ZWRFcnJvciwgdmlld1dyYXBwZWREZWJ1Z0Vycm9yfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQge3Jlc29sdmVEZXB9IGZyb20gJy4vcHJvdmlkZXInO1xuaW1wb3J0IHtkaXJ0eVBhcmVudFF1ZXJpZXMsIGdldFF1ZXJ5VmFsdWV9IGZyb20gJy4vcXVlcnknO1xuaW1wb3J0IHtjcmVhdGVJbmplY3RvciwgY3JlYXRlTmdNb2R1bGVSZWYsIGdldENvbXBvbmVudFZpZXdEZWZpbml0aW9uRmFjdG9yeX0gZnJvbSAnLi9yZWZzJztcbmltcG9ydCB7QXJndW1lbnRUeXBlLCBCaW5kaW5nRmxhZ3MsIENoZWNrVHlwZSwgRGVidWdDb250ZXh0LCBFbGVtZW50RGF0YSwgTmdNb2R1bGVEZWZpbml0aW9uLCBOb2RlRGVmLCBOb2RlRmxhZ3MsIE5vZGVMb2dnZXIsIFByb3ZpZGVyT3ZlcnJpZGUsIFJvb3REYXRhLCBTZXJ2aWNlcywgVmlld0RhdGEsIFZpZXdEZWZpbml0aW9uLCBWaWV3U3RhdGUsIGFzRWxlbWVudERhdGEsIGFzUHVyZUV4cHJlc3Npb25EYXRhfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7Tk9PUCwgaXNDb21wb25lbnRWaWV3LCByZW5kZXJOb2RlLCByZXNvbHZlRGVmaW5pdGlvbiwgc3BsaXREZXBzRHNsLCB2aWV3UGFyZW50RWx9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQge2NoZWNrQW5kVXBkYXRlTm9kZSwgY2hlY2tBbmRVcGRhdGVWaWV3LCBjaGVja05vQ2hhbmdlc05vZGUsIGNoZWNrTm9DaGFuZ2VzVmlldywgY3JlYXRlQ29tcG9uZW50VmlldywgY3JlYXRlRW1iZWRkZWRWaWV3LCBjcmVhdGVSb290VmlldywgZGVzdHJveVZpZXd9IGZyb20gJy4vdmlldyc7XG5cblxubGV0IGluaXRpYWxpemVkID0gZmFsc2U7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0U2VydmljZXNJZk5lZWRlZCgpIHtcbiAgaWYgKGluaXRpYWxpemVkKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGluaXRpYWxpemVkID0gdHJ1ZTtcbiAgY29uc3Qgc2VydmljZXMgPSBpc0Rldk1vZGUoKSA/IGNyZWF0ZURlYnVnU2VydmljZXMoKSA6IGNyZWF0ZVByb2RTZXJ2aWNlcygpO1xuICBTZXJ2aWNlcy5zZXRDdXJyZW50Tm9kZSA9IHNlcnZpY2VzLnNldEN1cnJlbnROb2RlO1xuICBTZXJ2aWNlcy5jcmVhdGVSb290VmlldyA9IHNlcnZpY2VzLmNyZWF0ZVJvb3RWaWV3O1xuICBTZXJ2aWNlcy5jcmVhdGVFbWJlZGRlZFZpZXcgPSBzZXJ2aWNlcy5jcmVhdGVFbWJlZGRlZFZpZXc7XG4gIFNlcnZpY2VzLmNyZWF0ZUNvbXBvbmVudFZpZXcgPSBzZXJ2aWNlcy5jcmVhdGVDb21wb25lbnRWaWV3O1xuICBTZXJ2aWNlcy5jcmVhdGVOZ01vZHVsZVJlZiA9IHNlcnZpY2VzLmNyZWF0ZU5nTW9kdWxlUmVmO1xuICBTZXJ2aWNlcy5vdmVycmlkZVByb3ZpZGVyID0gc2VydmljZXMub3ZlcnJpZGVQcm92aWRlcjtcbiAgU2VydmljZXMub3ZlcnJpZGVDb21wb25lbnRWaWV3ID0gc2VydmljZXMub3ZlcnJpZGVDb21wb25lbnRWaWV3O1xuICBTZXJ2aWNlcy5jbGVhck92ZXJyaWRlcyA9IHNlcnZpY2VzLmNsZWFyT3ZlcnJpZGVzO1xuICBTZXJ2aWNlcy5jaGVja0FuZFVwZGF0ZVZpZXcgPSBzZXJ2aWNlcy5jaGVja0FuZFVwZGF0ZVZpZXc7XG4gIFNlcnZpY2VzLmNoZWNrTm9DaGFuZ2VzVmlldyA9IHNlcnZpY2VzLmNoZWNrTm9DaGFuZ2VzVmlldztcbiAgU2VydmljZXMuZGVzdHJveVZpZXcgPSBzZXJ2aWNlcy5kZXN0cm95VmlldztcbiAgU2VydmljZXMucmVzb2x2ZURlcCA9IHJlc29sdmVEZXA7XG4gIFNlcnZpY2VzLmNyZWF0ZURlYnVnQ29udGV4dCA9IHNlcnZpY2VzLmNyZWF0ZURlYnVnQ29udGV4dDtcbiAgU2VydmljZXMuaGFuZGxlRXZlbnQgPSBzZXJ2aWNlcy5oYW5kbGVFdmVudDtcbiAgU2VydmljZXMudXBkYXRlRGlyZWN0aXZlcyA9IHNlcnZpY2VzLnVwZGF0ZURpcmVjdGl2ZXM7XG4gIFNlcnZpY2VzLnVwZGF0ZVJlbmRlcmVyID0gc2VydmljZXMudXBkYXRlUmVuZGVyZXI7XG4gIFNlcnZpY2VzLmRpcnR5UGFyZW50UXVlcmllcyA9IGRpcnR5UGFyZW50UXVlcmllcztcbn1cblxuZnVuY3Rpb24gY3JlYXRlUHJvZFNlcnZpY2VzKCkge1xuICByZXR1cm4ge1xuICAgIHNldEN1cnJlbnROb2RlOiAoKSA9PiB7fSxcbiAgICBjcmVhdGVSb290VmlldzogY3JlYXRlUHJvZFJvb3RWaWV3LFxuICAgIGNyZWF0ZUVtYmVkZGVkVmlldzogY3JlYXRlRW1iZWRkZWRWaWV3LFxuICAgIGNyZWF0ZUNvbXBvbmVudFZpZXc6IGNyZWF0ZUNvbXBvbmVudFZpZXcsXG4gICAgY3JlYXRlTmdNb2R1bGVSZWY6IGNyZWF0ZU5nTW9kdWxlUmVmLFxuICAgIG92ZXJyaWRlUHJvdmlkZXI6IE5PT1AsXG4gICAgb3ZlcnJpZGVDb21wb25lbnRWaWV3OiBOT09QLFxuICAgIGNsZWFyT3ZlcnJpZGVzOiBOT09QLFxuICAgIGNoZWNrQW5kVXBkYXRlVmlldzogY2hlY2tBbmRVcGRhdGVWaWV3LFxuICAgIGNoZWNrTm9DaGFuZ2VzVmlldzogY2hlY2tOb0NoYW5nZXNWaWV3LFxuICAgIGRlc3Ryb3lWaWV3OiBkZXN0cm95VmlldyxcbiAgICBjcmVhdGVEZWJ1Z0NvbnRleHQ6ICh2aWV3OiBWaWV3RGF0YSwgbm9kZUluZGV4OiBudW1iZXIpID0+IG5ldyBEZWJ1Z0NvbnRleHRfKHZpZXcsIG5vZGVJbmRleCksXG4gICAgaGFuZGxlRXZlbnQ6ICh2aWV3OiBWaWV3RGF0YSwgbm9kZUluZGV4OiBudW1iZXIsIGV2ZW50TmFtZTogc3RyaW5nLCBldmVudDogYW55KSA9PlxuICAgICAgICAgICAgICAgICAgICAgdmlldy5kZWYuaGFuZGxlRXZlbnQodmlldywgbm9kZUluZGV4LCBldmVudE5hbWUsIGV2ZW50KSxcbiAgICB1cGRhdGVEaXJlY3RpdmVzOiAodmlldzogVmlld0RhdGEsIGNoZWNrVHlwZTogQ2hlY2tUeXBlKSA9PiB2aWV3LmRlZi51cGRhdGVEaXJlY3RpdmVzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja1R5cGUgPT09IENoZWNrVHlwZS5DaGVja0FuZFVwZGF0ZSA/IHByb2RDaGVja0FuZFVwZGF0ZU5vZGUgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2RDaGVja05vQ2hhbmdlc05vZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcpLFxuICAgIHVwZGF0ZVJlbmRlcmVyOiAodmlldzogVmlld0RhdGEsIGNoZWNrVHlwZTogQ2hlY2tUeXBlKSA9PiB2aWV3LmRlZi51cGRhdGVSZW5kZXJlcihcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrVHlwZSA9PT0gQ2hlY2tUeXBlLkNoZWNrQW5kVXBkYXRlID8gcHJvZENoZWNrQW5kVXBkYXRlTm9kZSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2RDaGVja05vQ2hhbmdlc05vZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3KSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRGVidWdTZXJ2aWNlcygpIHtcbiAgcmV0dXJuIHtcbiAgICBzZXRDdXJyZW50Tm9kZTogZGVidWdTZXRDdXJyZW50Tm9kZSxcbiAgICBjcmVhdGVSb290VmlldzogZGVidWdDcmVhdGVSb290VmlldyxcbiAgICBjcmVhdGVFbWJlZGRlZFZpZXc6IGRlYnVnQ3JlYXRlRW1iZWRkZWRWaWV3LFxuICAgIGNyZWF0ZUNvbXBvbmVudFZpZXc6IGRlYnVnQ3JlYXRlQ29tcG9uZW50VmlldyxcbiAgICBjcmVhdGVOZ01vZHVsZVJlZjogZGVidWdDcmVhdGVOZ01vZHVsZVJlZixcbiAgICBvdmVycmlkZVByb3ZpZGVyOiBkZWJ1Z092ZXJyaWRlUHJvdmlkZXIsXG4gICAgb3ZlcnJpZGVDb21wb25lbnRWaWV3OiBkZWJ1Z092ZXJyaWRlQ29tcG9uZW50VmlldyxcbiAgICBjbGVhck92ZXJyaWRlczogZGVidWdDbGVhck92ZXJyaWRlcyxcbiAgICBjaGVja0FuZFVwZGF0ZVZpZXc6IGRlYnVnQ2hlY2tBbmRVcGRhdGVWaWV3LFxuICAgIGNoZWNrTm9DaGFuZ2VzVmlldzogZGVidWdDaGVja05vQ2hhbmdlc1ZpZXcsXG4gICAgZGVzdHJveVZpZXc6IGRlYnVnRGVzdHJveVZpZXcsXG4gICAgY3JlYXRlRGVidWdDb250ZXh0OiAodmlldzogVmlld0RhdGEsIG5vZGVJbmRleDogbnVtYmVyKSA9PiBuZXcgRGVidWdDb250ZXh0Xyh2aWV3LCBub2RlSW5kZXgpLFxuICAgIGhhbmRsZUV2ZW50OiBkZWJ1Z0hhbmRsZUV2ZW50LFxuICAgIHVwZGF0ZURpcmVjdGl2ZXM6IGRlYnVnVXBkYXRlRGlyZWN0aXZlcyxcbiAgICB1cGRhdGVSZW5kZXJlcjogZGVidWdVcGRhdGVSZW5kZXJlcixcbiAgfTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUHJvZFJvb3RWaWV3KFxuICAgIGVsSW5qZWN0b3I6IEluamVjdG9yLCBwcm9qZWN0YWJsZU5vZGVzOiBhbnlbXVtdLCByb290U2VsZWN0b3JPck5vZGU6IHN0cmluZyB8IGFueSxcbiAgICBkZWY6IFZpZXdEZWZpbml0aW9uLCBuZ01vZHVsZTogTmdNb2R1bGVSZWY8YW55PiwgY29udGV4dD86IGFueSk6IFZpZXdEYXRhIHtcbiAgY29uc3QgcmVuZGVyZXJGYWN0b3J5OiBSZW5kZXJlckZhY3RvcnkyID0gbmdNb2R1bGUuaW5qZWN0b3IuZ2V0KFJlbmRlcmVyRmFjdG9yeTIpO1xuICByZXR1cm4gY3JlYXRlUm9vdFZpZXcoXG4gICAgICBjcmVhdGVSb290RGF0YShlbEluamVjdG9yLCBuZ01vZHVsZSwgcmVuZGVyZXJGYWN0b3J5LCBwcm9qZWN0YWJsZU5vZGVzLCByb290U2VsZWN0b3JPck5vZGUpLFxuICAgICAgZGVmLCBjb250ZXh0KTtcbn1cblxuZnVuY3Rpb24gZGVidWdDcmVhdGVSb290VmlldyhcbiAgICBlbEluamVjdG9yOiBJbmplY3RvciwgcHJvamVjdGFibGVOb2RlczogYW55W11bXSwgcm9vdFNlbGVjdG9yT3JOb2RlOiBzdHJpbmcgfCBhbnksXG4gICAgZGVmOiBWaWV3RGVmaW5pdGlvbiwgbmdNb2R1bGU6IE5nTW9kdWxlUmVmPGFueT4sIGNvbnRleHQ/OiBhbnkpOiBWaWV3RGF0YSB7XG4gIGNvbnN0IHJlbmRlcmVyRmFjdG9yeTogUmVuZGVyZXJGYWN0b3J5MiA9IG5nTW9kdWxlLmluamVjdG9yLmdldChSZW5kZXJlckZhY3RvcnkyKTtcbiAgY29uc3Qgcm9vdCA9IGNyZWF0ZVJvb3REYXRhKFxuICAgICAgZWxJbmplY3RvciwgbmdNb2R1bGUsIG5ldyBEZWJ1Z1JlbmRlcmVyRmFjdG9yeTIocmVuZGVyZXJGYWN0b3J5KSwgcHJvamVjdGFibGVOb2RlcyxcbiAgICAgIHJvb3RTZWxlY3Rvck9yTm9kZSk7XG4gIGNvbnN0IGRlZldpdGhPdmVycmlkZSA9IGFwcGx5UHJvdmlkZXJPdmVycmlkZXNUb1ZpZXcoZGVmKTtcbiAgcmV0dXJuIGNhbGxXaXRoRGVidWdDb250ZXh0KFxuICAgICAgRGVidWdBY3Rpb24uY3JlYXRlLCBjcmVhdGVSb290VmlldywgbnVsbCwgW3Jvb3QsIGRlZldpdGhPdmVycmlkZSwgY29udGV4dF0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVSb290RGF0YShcbiAgICBlbEluamVjdG9yOiBJbmplY3RvciwgbmdNb2R1bGU6IE5nTW9kdWxlUmVmPGFueT4sIHJlbmRlcmVyRmFjdG9yeTogUmVuZGVyZXJGYWN0b3J5MixcbiAgICBwcm9qZWN0YWJsZU5vZGVzOiBhbnlbXVtdLCByb290U2VsZWN0b3JPck5vZGU6IGFueSk6IFJvb3REYXRhIHtcbiAgY29uc3Qgc2FuaXRpemVyID0gbmdNb2R1bGUuaW5qZWN0b3IuZ2V0KFNhbml0aXplcik7XG4gIGNvbnN0IGVycm9ySGFuZGxlciA9IG5nTW9kdWxlLmluamVjdG9yLmdldChFcnJvckhhbmRsZXIpO1xuICBjb25zdCByZW5kZXJlciA9IHJlbmRlcmVyRmFjdG9yeS5jcmVhdGVSZW5kZXJlcihudWxsLCBudWxsKTtcbiAgcmV0dXJuIHtcbiAgICBuZ01vZHVsZSxcbiAgICBpbmplY3RvcjogZWxJbmplY3RvciwgcHJvamVjdGFibGVOb2RlcyxcbiAgICBzZWxlY3Rvck9yTm9kZTogcm9vdFNlbGVjdG9yT3JOb2RlLCBzYW5pdGl6ZXIsIHJlbmRlcmVyRmFjdG9yeSwgcmVuZGVyZXIsIGVycm9ySGFuZGxlclxuICB9O1xufVxuXG5mdW5jdGlvbiBkZWJ1Z0NyZWF0ZUVtYmVkZGVkVmlldyhcbiAgICBwYXJlbnRWaWV3OiBWaWV3RGF0YSwgYW5jaG9yRGVmOiBOb2RlRGVmLCB2aWV3RGVmOiBWaWV3RGVmaW5pdGlvbiwgY29udGV4dD86IGFueSk6IFZpZXdEYXRhIHtcbiAgY29uc3QgZGVmV2l0aE92ZXJyaWRlID0gYXBwbHlQcm92aWRlck92ZXJyaWRlc1RvVmlldyh2aWV3RGVmKTtcbiAgcmV0dXJuIGNhbGxXaXRoRGVidWdDb250ZXh0KFxuICAgICAgRGVidWdBY3Rpb24uY3JlYXRlLCBjcmVhdGVFbWJlZGRlZFZpZXcsIG51bGwsXG4gICAgICBbcGFyZW50VmlldywgYW5jaG9yRGVmLCBkZWZXaXRoT3ZlcnJpZGUsIGNvbnRleHRdKTtcbn1cblxuZnVuY3Rpb24gZGVidWdDcmVhdGVDb21wb25lbnRWaWV3KFxuICAgIHBhcmVudFZpZXc6IFZpZXdEYXRhLCBub2RlRGVmOiBOb2RlRGVmLCB2aWV3RGVmOiBWaWV3RGVmaW5pdGlvbiwgaG9zdEVsZW1lbnQ6IGFueSk6IFZpZXdEYXRhIHtcbiAgY29uc3Qgb3ZlcnJpZGVDb21wb25lbnRWaWV3ID1cbiAgICAgIHZpZXdEZWZPdmVycmlkZXMuZ2V0KG5vZGVEZWYuZWxlbWVudCAhLmNvbXBvbmVudFByb3ZpZGVyICEucHJvdmlkZXIgIS50b2tlbik7XG4gIGlmIChvdmVycmlkZUNvbXBvbmVudFZpZXcpIHtcbiAgICB2aWV3RGVmID0gb3ZlcnJpZGVDb21wb25lbnRWaWV3O1xuICB9IGVsc2Uge1xuICAgIHZpZXdEZWYgPSBhcHBseVByb3ZpZGVyT3ZlcnJpZGVzVG9WaWV3KHZpZXdEZWYpO1xuICB9XG4gIHJldHVybiBjYWxsV2l0aERlYnVnQ29udGV4dChcbiAgICAgIERlYnVnQWN0aW9uLmNyZWF0ZSwgY3JlYXRlQ29tcG9uZW50VmlldywgbnVsbCwgW3BhcmVudFZpZXcsIG5vZGVEZWYsIHZpZXdEZWYsIGhvc3RFbGVtZW50XSk7XG59XG5cbmZ1bmN0aW9uIGRlYnVnQ3JlYXRlTmdNb2R1bGVSZWYoXG4gICAgbW9kdWxlVHlwZTogVHlwZTxhbnk+LCBwYXJlbnRJbmplY3RvcjogSW5qZWN0b3IsIGJvb3RzdHJhcENvbXBvbmVudHM6IFR5cGU8YW55PltdLFxuICAgIGRlZjogTmdNb2R1bGVEZWZpbml0aW9uKTogTmdNb2R1bGVSZWY8YW55PiB7XG4gIGNvbnN0IGRlZldpdGhPdmVycmlkZSA9IGFwcGx5UHJvdmlkZXJPdmVycmlkZXNUb05nTW9kdWxlKGRlZik7XG4gIHJldHVybiBjcmVhdGVOZ01vZHVsZVJlZihtb2R1bGVUeXBlLCBwYXJlbnRJbmplY3RvciwgYm9vdHN0cmFwQ29tcG9uZW50cywgZGVmV2l0aE92ZXJyaWRlKTtcbn1cblxuY29uc3QgcHJvdmlkZXJPdmVycmlkZXMgPSBuZXcgTWFwPGFueSwgUHJvdmlkZXJPdmVycmlkZT4oKTtcbmNvbnN0IHByb3ZpZGVyT3ZlcnJpZGVzV2l0aFNjb3BlID0gbmV3IE1hcDxJbmplY3RhYmxlVHlwZTxhbnk+LCBQcm92aWRlck92ZXJyaWRlPigpO1xuY29uc3Qgdmlld0RlZk92ZXJyaWRlcyA9IG5ldyBNYXA8YW55LCBWaWV3RGVmaW5pdGlvbj4oKTtcblxuZnVuY3Rpb24gZGVidWdPdmVycmlkZVByb3ZpZGVyKG92ZXJyaWRlOiBQcm92aWRlck92ZXJyaWRlKSB7XG4gIHByb3ZpZGVyT3ZlcnJpZGVzLnNldChvdmVycmlkZS50b2tlbiwgb3ZlcnJpZGUpO1xuICBsZXQgaW5qZWN0YWJsZURlZjogSW5qZWN0YWJsZURlZjxhbnk+fG51bGw7XG4gIGlmICh0eXBlb2Ygb3ZlcnJpZGUudG9rZW4gPT09ICdmdW5jdGlvbicgJiYgKGluamVjdGFibGVEZWYgPSBnZXRJbmplY3RhYmxlRGVmKG92ZXJyaWRlLnRva2VuKSkgJiZcbiAgICAgIHR5cGVvZiBpbmplY3RhYmxlRGVmLnByb3ZpZGVkSW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICBwcm92aWRlck92ZXJyaWRlc1dpdGhTY29wZS5zZXQob3ZlcnJpZGUudG9rZW4gYXMgSW5qZWN0YWJsZVR5cGU8YW55Piwgb3ZlcnJpZGUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRlYnVnT3ZlcnJpZGVDb21wb25lbnRWaWV3KGNvbXA6IGFueSwgY29tcEZhY3Rvcnk6IENvbXBvbmVudEZhY3Rvcnk8YW55Pikge1xuICBjb25zdCBob3N0Vmlld0RlZiA9IHJlc29sdmVEZWZpbml0aW9uKGdldENvbXBvbmVudFZpZXdEZWZpbml0aW9uRmFjdG9yeShjb21wRmFjdG9yeSkpO1xuICBjb25zdCBjb21wVmlld0RlZiA9IHJlc29sdmVEZWZpbml0aW9uKGhvc3RWaWV3RGVmLm5vZGVzWzBdLmVsZW1lbnQgIS5jb21wb25lbnRWaWV3ICEpO1xuICB2aWV3RGVmT3ZlcnJpZGVzLnNldChjb21wLCBjb21wVmlld0RlZik7XG59XG5cbmZ1bmN0aW9uIGRlYnVnQ2xlYXJPdmVycmlkZXMoKSB7XG4gIHByb3ZpZGVyT3ZlcnJpZGVzLmNsZWFyKCk7XG4gIHByb3ZpZGVyT3ZlcnJpZGVzV2l0aFNjb3BlLmNsZWFyKCk7XG4gIHZpZXdEZWZPdmVycmlkZXMuY2xlYXIoKTtcbn1cblxuLy8gTm90ZXMgYWJvdXQgdGhlIGFsZ29yaXRobTpcbi8vIDEpIExvY2F0ZSB0aGUgcHJvdmlkZXJzIG9mIGFuIGVsZW1lbnQgYW5kIGNoZWNrIGlmIG9uZSBvZiB0aGVtIHdhcyBvdmVyd3JpdHRlblxuLy8gMikgQ2hhbmdlIHRoZSBwcm92aWRlcnMgb2YgdGhhdCBlbGVtZW50XG4vL1xuLy8gV2Ugb25seSBjcmVhdGUgbmV3IGRhdGFzdHJ1Y3R1cmVzIGlmIHdlIG5lZWQgdG8sIHRvIGtlZXAgcGVyZiBpbXBhY3Rcbi8vIHJlYXNvbmFibGUuXG5mdW5jdGlvbiBhcHBseVByb3ZpZGVyT3ZlcnJpZGVzVG9WaWV3KGRlZjogVmlld0RlZmluaXRpb24pOiBWaWV3RGVmaW5pdGlvbiB7XG4gIGlmIChwcm92aWRlck92ZXJyaWRlcy5zaXplID09PSAwKSB7XG4gICAgcmV0dXJuIGRlZjtcbiAgfVxuICBjb25zdCBlbGVtZW50SW5kaWNlc1dpdGhPdmVyd3JpdHRlblByb3ZpZGVycyA9IGZpbmRFbGVtZW50SW5kaWNlc1dpdGhPdmVyd3JpdHRlblByb3ZpZGVycyhkZWYpO1xuICBpZiAoZWxlbWVudEluZGljZXNXaXRoT3ZlcndyaXR0ZW5Qcm92aWRlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGRlZjtcbiAgfVxuICAvLyBjbG9uZSB0aGUgd2hvbGUgdmlldyBkZWZpbml0aW9uLFxuICAvLyBhcyBpdCBtYWludGFpbnMgcmVmZXJlbmNlcyBiZXR3ZWVuIHRoZSBub2RlcyB0aGF0IGFyZSBoYXJkIHRvIHVwZGF0ZS5cbiAgZGVmID0gZGVmLmZhY3RvcnkgISgoKSA9PiBOT09QKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50SW5kaWNlc1dpdGhPdmVyd3JpdHRlblByb3ZpZGVycy5sZW5ndGg7IGkrKykge1xuICAgIGFwcGx5UHJvdmlkZXJPdmVycmlkZXNUb0VsZW1lbnQoZGVmLCBlbGVtZW50SW5kaWNlc1dpdGhPdmVyd3JpdHRlblByb3ZpZGVyc1tpXSk7XG4gIH1cbiAgcmV0dXJuIGRlZjtcblxuICBmdW5jdGlvbiBmaW5kRWxlbWVudEluZGljZXNXaXRoT3ZlcndyaXR0ZW5Qcm92aWRlcnMoZGVmOiBWaWV3RGVmaW5pdGlvbik6IG51bWJlcltdIHtcbiAgICBjb25zdCBlbEluZGljZXNXaXRoT3ZlcndyaXR0ZW5Qcm92aWRlcnM6IG51bWJlcltdID0gW107XG4gICAgbGV0IGxhc3RFbGVtZW50RGVmOiBOb2RlRGVmfG51bGwgPSBudWxsO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGVmLm5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBub2RlRGVmID0gZGVmLm5vZGVzW2ldO1xuICAgICAgaWYgKG5vZGVEZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuVHlwZUVsZW1lbnQpIHtcbiAgICAgICAgbGFzdEVsZW1lbnREZWYgPSBub2RlRGVmO1xuICAgICAgfVxuICAgICAgaWYgKGxhc3RFbGVtZW50RGVmICYmIG5vZGVEZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuQ2F0UHJvdmlkZXJOb0RpcmVjdGl2ZSAmJlxuICAgICAgICAgIHByb3ZpZGVyT3ZlcnJpZGVzLmhhcyhub2RlRGVmLnByb3ZpZGVyICEudG9rZW4pKSB7XG4gICAgICAgIGVsSW5kaWNlc1dpdGhPdmVyd3JpdHRlblByb3ZpZGVycy5wdXNoKGxhc3RFbGVtZW50RGVmICEubm9kZUluZGV4KTtcbiAgICAgICAgbGFzdEVsZW1lbnREZWYgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZWxJbmRpY2VzV2l0aE92ZXJ3cml0dGVuUHJvdmlkZXJzO1xuICB9XG5cbiAgZnVuY3Rpb24gYXBwbHlQcm92aWRlck92ZXJyaWRlc1RvRWxlbWVudCh2aWV3RGVmOiBWaWV3RGVmaW5pdGlvbiwgZWxJbmRleDogbnVtYmVyKSB7XG4gICAgZm9yIChsZXQgaSA9IGVsSW5kZXggKyAxOyBpIDwgdmlld0RlZi5ub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3Qgbm9kZURlZiA9IHZpZXdEZWYubm9kZXNbaV07XG4gICAgICBpZiAobm9kZURlZi5mbGFncyAmIE5vZGVGbGFncy5UeXBlRWxlbWVudCkge1xuICAgICAgICAvLyBzdG9wIGF0IHRoZSBuZXh0IGVsZW1lbnRcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKG5vZGVEZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuQ2F0UHJvdmlkZXJOb0RpcmVjdGl2ZSkge1xuICAgICAgICBjb25zdCBwcm92aWRlciA9IG5vZGVEZWYucHJvdmlkZXIgITtcbiAgICAgICAgY29uc3Qgb3ZlcnJpZGUgPSBwcm92aWRlck92ZXJyaWRlcy5nZXQocHJvdmlkZXIudG9rZW4pO1xuICAgICAgICBpZiAob3ZlcnJpZGUpIHtcbiAgICAgICAgICBub2RlRGVmLmZsYWdzID0gKG5vZGVEZWYuZmxhZ3MgJiB+Tm9kZUZsYWdzLkNhdFByb3ZpZGVyTm9EaXJlY3RpdmUpIHwgb3ZlcnJpZGUuZmxhZ3M7XG4gICAgICAgICAgcHJvdmlkZXIuZGVwcyA9IHNwbGl0RGVwc0RzbChvdmVycmlkZS5kZXBzKTtcbiAgICAgICAgICBwcm92aWRlci52YWx1ZSA9IG92ZXJyaWRlLnZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8vIE5vdGVzIGFib3V0IHRoZSBhbGdvcml0aG06XG4vLyBXZSBvbmx5IGNyZWF0ZSBuZXcgZGF0YXN0cnVjdHVyZXMgaWYgd2UgbmVlZCB0bywgdG8ga2VlcCBwZXJmIGltcGFjdFxuLy8gcmVhc29uYWJsZS5cbmZ1bmN0aW9uIGFwcGx5UHJvdmlkZXJPdmVycmlkZXNUb05nTW9kdWxlKGRlZjogTmdNb2R1bGVEZWZpbml0aW9uKTogTmdNb2R1bGVEZWZpbml0aW9uIHtcbiAgY29uc3Qge2hhc092ZXJyaWRlcywgaGFzRGVwcmVjYXRlZE92ZXJyaWRlc30gPSBjYWxjSGFzT3ZlcnJpZGVzKGRlZik7XG4gIGlmICghaGFzT3ZlcnJpZGVzKSB7XG4gICAgcmV0dXJuIGRlZjtcbiAgfVxuICAvLyBjbG9uZSB0aGUgd2hvbGUgdmlldyBkZWZpbml0aW9uLFxuICAvLyBhcyBpdCBtYWludGFpbnMgcmVmZXJlbmNlcyBiZXR3ZWVuIHRoZSBub2RlcyB0aGF0IGFyZSBoYXJkIHRvIHVwZGF0ZS5cbiAgZGVmID0gZGVmLmZhY3RvcnkgISgoKSA9PiBOT09QKTtcbiAgYXBwbHlQcm92aWRlck92ZXJyaWRlcyhkZWYpO1xuICByZXR1cm4gZGVmO1xuXG4gIGZ1bmN0aW9uIGNhbGNIYXNPdmVycmlkZXMoZGVmOiBOZ01vZHVsZURlZmluaXRpb24pOlxuICAgICAge2hhc092ZXJyaWRlczogYm9vbGVhbiwgaGFzRGVwcmVjYXRlZE92ZXJyaWRlczogYm9vbGVhbn0ge1xuICAgIGxldCBoYXNPdmVycmlkZXMgPSBmYWxzZTtcbiAgICBsZXQgaGFzRGVwcmVjYXRlZE92ZXJyaWRlcyA9IGZhbHNlO1xuICAgIGlmIChwcm92aWRlck92ZXJyaWRlcy5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm4ge2hhc092ZXJyaWRlcywgaGFzRGVwcmVjYXRlZE92ZXJyaWRlc307XG4gICAgfVxuICAgIGRlZi5wcm92aWRlcnMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgIGNvbnN0IG92ZXJyaWRlID0gcHJvdmlkZXJPdmVycmlkZXMuZ2V0KG5vZGUudG9rZW4pO1xuICAgICAgaWYgKChub2RlLmZsYWdzICYgTm9kZUZsYWdzLkNhdFByb3ZpZGVyTm9EaXJlY3RpdmUpICYmIG92ZXJyaWRlKSB7XG4gICAgICAgIGhhc092ZXJyaWRlcyA9IHRydWU7XG4gICAgICAgIGhhc0RlcHJlY2F0ZWRPdmVycmlkZXMgPSBoYXNEZXByZWNhdGVkT3ZlcnJpZGVzIHx8IG92ZXJyaWRlLmRlcHJlY2F0ZWRCZWhhdmlvcjtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBkZWYubW9kdWxlcy5mb3JFYWNoKG1vZHVsZSA9PiB7XG4gICAgICBwcm92aWRlck92ZXJyaWRlc1dpdGhTY29wZS5mb3JFYWNoKChvdmVycmlkZSwgdG9rZW4pID0+IHtcbiAgICAgICAgaWYgKGdldEluamVjdGFibGVEZWYodG9rZW4pICEucHJvdmlkZWRJbiA9PT0gbW9kdWxlKSB7XG4gICAgICAgICAgaGFzT3ZlcnJpZGVzID0gdHJ1ZTtcbiAgICAgICAgICBoYXNEZXByZWNhdGVkT3ZlcnJpZGVzID0gaGFzRGVwcmVjYXRlZE92ZXJyaWRlcyB8fCBvdmVycmlkZS5kZXByZWNhdGVkQmVoYXZpb3I7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiB7aGFzT3ZlcnJpZGVzLCBoYXNEZXByZWNhdGVkT3ZlcnJpZGVzfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFwcGx5UHJvdmlkZXJPdmVycmlkZXMoZGVmOiBOZ01vZHVsZURlZmluaXRpb24pIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRlZi5wcm92aWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHByb3ZpZGVyID0gZGVmLnByb3ZpZGVyc1tpXTtcbiAgICAgIGlmIChoYXNEZXByZWNhdGVkT3ZlcnJpZGVzKSB7XG4gICAgICAgIC8vIFdlIGhhZCBhIGJ1ZyB3aGVyZSBtZSBtYWRlXG4gICAgICAgIC8vIGFsbCBwcm92aWRlcnMgbGF6eS4gS2VlcCB0aGlzIGxvZ2ljIGJlaGluZCBhIGZsYWdcbiAgICAgICAgLy8gZm9yIG1pZ3JhdGluZyBleGlzdGluZyB1c2Vycy5cbiAgICAgICAgcHJvdmlkZXIuZmxhZ3MgfD0gTm9kZUZsYWdzLkxhenlQcm92aWRlcjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG92ZXJyaWRlID0gcHJvdmlkZXJPdmVycmlkZXMuZ2V0KHByb3ZpZGVyLnRva2VuKTtcbiAgICAgIGlmIChvdmVycmlkZSkge1xuICAgICAgICBwcm92aWRlci5mbGFncyA9IChwcm92aWRlci5mbGFncyAmIH5Ob2RlRmxhZ3MuQ2F0UHJvdmlkZXJOb0RpcmVjdGl2ZSkgfCBvdmVycmlkZS5mbGFncztcbiAgICAgICAgcHJvdmlkZXIuZGVwcyA9IHNwbGl0RGVwc0RzbChvdmVycmlkZS5kZXBzKTtcbiAgICAgICAgcHJvdmlkZXIudmFsdWUgPSBvdmVycmlkZS52YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHByb3ZpZGVyT3ZlcnJpZGVzV2l0aFNjb3BlLnNpemUgPiAwKSB7XG4gICAgICBsZXQgbW9kdWxlU2V0ID0gbmV3IFNldDxhbnk+KGRlZi5tb2R1bGVzKTtcbiAgICAgIHByb3ZpZGVyT3ZlcnJpZGVzV2l0aFNjb3BlLmZvckVhY2goKG92ZXJyaWRlLCB0b2tlbikgPT4ge1xuICAgICAgICBpZiAobW9kdWxlU2V0LmhhcyhnZXRJbmplY3RhYmxlRGVmKHRva2VuKSAhLnByb3ZpZGVkSW4pKSB7XG4gICAgICAgICAgbGV0IHByb3ZpZGVyID0ge1xuICAgICAgICAgICAgdG9rZW46IHRva2VuLFxuICAgICAgICAgICAgZmxhZ3M6XG4gICAgICAgICAgICAgICAgb3ZlcnJpZGUuZmxhZ3MgfCAoaGFzRGVwcmVjYXRlZE92ZXJyaWRlcyA/IE5vZGVGbGFncy5MYXp5UHJvdmlkZXIgOiBOb2RlRmxhZ3MuTm9uZSksXG4gICAgICAgICAgICBkZXBzOiBzcGxpdERlcHNEc2wob3ZlcnJpZGUuZGVwcyksXG4gICAgICAgICAgICB2YWx1ZTogb3ZlcnJpZGUudmFsdWUsXG4gICAgICAgICAgICBpbmRleDogZGVmLnByb3ZpZGVycy5sZW5ndGgsXG4gICAgICAgICAgfTtcbiAgICAgICAgICBkZWYucHJvdmlkZXJzLnB1c2gocHJvdmlkZXIpO1xuICAgICAgICAgIGRlZi5wcm92aWRlcnNCeUtleVt0b2tlbktleSh0b2tlbildID0gcHJvdmlkZXI7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBwcm9kQ2hlY2tBbmRVcGRhdGVOb2RlKFxuICAgIHZpZXc6IFZpZXdEYXRhLCBjaGVja0luZGV4OiBudW1iZXIsIGFyZ1N0eWxlOiBBcmd1bWVudFR5cGUsIHYwPzogYW55LCB2MT86IGFueSwgdjI/OiBhbnksXG4gICAgdjM/OiBhbnksIHY0PzogYW55LCB2NT86IGFueSwgdjY/OiBhbnksIHY3PzogYW55LCB2OD86IGFueSwgdjk/OiBhbnkpOiBhbnkge1xuICBjb25zdCBub2RlRGVmID0gdmlldy5kZWYubm9kZXNbY2hlY2tJbmRleF07XG4gIGNoZWNrQW5kVXBkYXRlTm9kZSh2aWV3LCBub2RlRGVmLCBhcmdTdHlsZSwgdjAsIHYxLCB2MiwgdjMsIHY0LCB2NSwgdjYsIHY3LCB2OCwgdjkpO1xuICByZXR1cm4gKG5vZGVEZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuQ2F0UHVyZUV4cHJlc3Npb24pID9cbiAgICAgIGFzUHVyZUV4cHJlc3Npb25EYXRhKHZpZXcsIGNoZWNrSW5kZXgpLnZhbHVlIDpcbiAgICAgIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gcHJvZENoZWNrTm9DaGFuZ2VzTm9kZShcbiAgICB2aWV3OiBWaWV3RGF0YSwgY2hlY2tJbmRleDogbnVtYmVyLCBhcmdTdHlsZTogQXJndW1lbnRUeXBlLCB2MD86IGFueSwgdjE/OiBhbnksIHYyPzogYW55LFxuICAgIHYzPzogYW55LCB2ND86IGFueSwgdjU/OiBhbnksIHY2PzogYW55LCB2Nz86IGFueSwgdjg/OiBhbnksIHY5PzogYW55KTogYW55IHtcbiAgY29uc3Qgbm9kZURlZiA9IHZpZXcuZGVmLm5vZGVzW2NoZWNrSW5kZXhdO1xuICBjaGVja05vQ2hhbmdlc05vZGUodmlldywgbm9kZURlZiwgYXJnU3R5bGUsIHYwLCB2MSwgdjIsIHYzLCB2NCwgdjUsIHY2LCB2NywgdjgsIHY5KTtcbiAgcmV0dXJuIChub2RlRGVmLmZsYWdzICYgTm9kZUZsYWdzLkNhdFB1cmVFeHByZXNzaW9uKSA/XG4gICAgICBhc1B1cmVFeHByZXNzaW9uRGF0YSh2aWV3LCBjaGVja0luZGV4KS52YWx1ZSA6XG4gICAgICB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGRlYnVnQ2hlY2tBbmRVcGRhdGVWaWV3KHZpZXc6IFZpZXdEYXRhKSB7XG4gIHJldHVybiBjYWxsV2l0aERlYnVnQ29udGV4dChEZWJ1Z0FjdGlvbi5kZXRlY3RDaGFuZ2VzLCBjaGVja0FuZFVwZGF0ZVZpZXcsIG51bGwsIFt2aWV3XSk7XG59XG5cbmZ1bmN0aW9uIGRlYnVnQ2hlY2tOb0NoYW5nZXNWaWV3KHZpZXc6IFZpZXdEYXRhKSB7XG4gIHJldHVybiBjYWxsV2l0aERlYnVnQ29udGV4dChEZWJ1Z0FjdGlvbi5jaGVja05vQ2hhbmdlcywgY2hlY2tOb0NoYW5nZXNWaWV3LCBudWxsLCBbdmlld10pO1xufVxuXG5mdW5jdGlvbiBkZWJ1Z0Rlc3Ryb3lWaWV3KHZpZXc6IFZpZXdEYXRhKSB7XG4gIHJldHVybiBjYWxsV2l0aERlYnVnQ29udGV4dChEZWJ1Z0FjdGlvbi5kZXN0cm95LCBkZXN0cm95VmlldywgbnVsbCwgW3ZpZXddKTtcbn1cblxuZW51bSBEZWJ1Z0FjdGlvbiB7XG4gIGNyZWF0ZSxcbiAgZGV0ZWN0Q2hhbmdlcyxcbiAgY2hlY2tOb0NoYW5nZXMsXG4gIGRlc3Ryb3ksXG4gIGhhbmRsZUV2ZW50XG59XG5cbmxldCBfY3VycmVudEFjdGlvbjogRGVidWdBY3Rpb247XG5sZXQgX2N1cnJlbnRWaWV3OiBWaWV3RGF0YTtcbmxldCBfY3VycmVudE5vZGVJbmRleDogbnVtYmVyfG51bGw7XG5cbmZ1bmN0aW9uIGRlYnVnU2V0Q3VycmVudE5vZGUodmlldzogVmlld0RhdGEsIG5vZGVJbmRleDogbnVtYmVyIHwgbnVsbCkge1xuICBfY3VycmVudFZpZXcgPSB2aWV3O1xuICBfY3VycmVudE5vZGVJbmRleCA9IG5vZGVJbmRleDtcbn1cblxuZnVuY3Rpb24gZGVidWdIYW5kbGVFdmVudCh2aWV3OiBWaWV3RGF0YSwgbm9kZUluZGV4OiBudW1iZXIsIGV2ZW50TmFtZTogc3RyaW5nLCBldmVudDogYW55KSB7XG4gIGRlYnVnU2V0Q3VycmVudE5vZGUodmlldywgbm9kZUluZGV4KTtcbiAgcmV0dXJuIGNhbGxXaXRoRGVidWdDb250ZXh0KFxuICAgICAgRGVidWdBY3Rpb24uaGFuZGxlRXZlbnQsIHZpZXcuZGVmLmhhbmRsZUV2ZW50LCBudWxsLCBbdmlldywgbm9kZUluZGV4LCBldmVudE5hbWUsIGV2ZW50XSk7XG59XG5cbmZ1bmN0aW9uIGRlYnVnVXBkYXRlRGlyZWN0aXZlcyh2aWV3OiBWaWV3RGF0YSwgY2hlY2tUeXBlOiBDaGVja1R5cGUpIHtcbiAgaWYgKHZpZXcuc3RhdGUgJiBWaWV3U3RhdGUuRGVzdHJveWVkKSB7XG4gICAgdGhyb3cgdmlld0Rlc3Ryb3llZEVycm9yKERlYnVnQWN0aW9uW19jdXJyZW50QWN0aW9uXSk7XG4gIH1cbiAgZGVidWdTZXRDdXJyZW50Tm9kZSh2aWV3LCBuZXh0RGlyZWN0aXZlV2l0aEJpbmRpbmcodmlldywgMCkpO1xuICByZXR1cm4gdmlldy5kZWYudXBkYXRlRGlyZWN0aXZlcyhkZWJ1Z0NoZWNrRGlyZWN0aXZlc0ZuLCB2aWV3KTtcblxuICBmdW5jdGlvbiBkZWJ1Z0NoZWNrRGlyZWN0aXZlc0ZuKFxuICAgICAgdmlldzogVmlld0RhdGEsIG5vZGVJbmRleDogbnVtYmVyLCBhcmdTdHlsZTogQXJndW1lbnRUeXBlLCAuLi52YWx1ZXM6IGFueVtdKSB7XG4gICAgY29uc3Qgbm9kZURlZiA9IHZpZXcuZGVmLm5vZGVzW25vZGVJbmRleF07XG4gICAgaWYgKGNoZWNrVHlwZSA9PT0gQ2hlY2tUeXBlLkNoZWNrQW5kVXBkYXRlKSB7XG4gICAgICBkZWJ1Z0NoZWNrQW5kVXBkYXRlTm9kZSh2aWV3LCBub2RlRGVmLCBhcmdTdHlsZSwgdmFsdWVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWdDaGVja05vQ2hhbmdlc05vZGUodmlldywgbm9kZURlZiwgYXJnU3R5bGUsIHZhbHVlcyk7XG4gICAgfVxuICAgIGlmIChub2RlRGVmLmZsYWdzICYgTm9kZUZsYWdzLlR5cGVEaXJlY3RpdmUpIHtcbiAgICAgIGRlYnVnU2V0Q3VycmVudE5vZGUodmlldywgbmV4dERpcmVjdGl2ZVdpdGhCaW5kaW5nKHZpZXcsIG5vZGVJbmRleCkpO1xuICAgIH1cbiAgICByZXR1cm4gKG5vZGVEZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuQ2F0UHVyZUV4cHJlc3Npb24pID9cbiAgICAgICAgYXNQdXJlRXhwcmVzc2lvbkRhdGEodmlldywgbm9kZURlZi5ub2RlSW5kZXgpLnZhbHVlIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRlYnVnVXBkYXRlUmVuZGVyZXIodmlldzogVmlld0RhdGEsIGNoZWNrVHlwZTogQ2hlY2tUeXBlKSB7XG4gIGlmICh2aWV3LnN0YXRlICYgVmlld1N0YXRlLkRlc3Ryb3llZCkge1xuICAgIHRocm93IHZpZXdEZXN0cm95ZWRFcnJvcihEZWJ1Z0FjdGlvbltfY3VycmVudEFjdGlvbl0pO1xuICB9XG4gIGRlYnVnU2V0Q3VycmVudE5vZGUodmlldywgbmV4dFJlbmRlck5vZGVXaXRoQmluZGluZyh2aWV3LCAwKSk7XG4gIHJldHVybiB2aWV3LmRlZi51cGRhdGVSZW5kZXJlcihkZWJ1Z0NoZWNrUmVuZGVyTm9kZUZuLCB2aWV3KTtcblxuICBmdW5jdGlvbiBkZWJ1Z0NoZWNrUmVuZGVyTm9kZUZuKFxuICAgICAgdmlldzogVmlld0RhdGEsIG5vZGVJbmRleDogbnVtYmVyLCBhcmdTdHlsZTogQXJndW1lbnRUeXBlLCAuLi52YWx1ZXM6IGFueVtdKSB7XG4gICAgY29uc3Qgbm9kZURlZiA9IHZpZXcuZGVmLm5vZGVzW25vZGVJbmRleF07XG4gICAgaWYgKGNoZWNrVHlwZSA9PT0gQ2hlY2tUeXBlLkNoZWNrQW5kVXBkYXRlKSB7XG4gICAgICBkZWJ1Z0NoZWNrQW5kVXBkYXRlTm9kZSh2aWV3LCBub2RlRGVmLCBhcmdTdHlsZSwgdmFsdWVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWdDaGVja05vQ2hhbmdlc05vZGUodmlldywgbm9kZURlZiwgYXJnU3R5bGUsIHZhbHVlcyk7XG4gICAgfVxuICAgIGlmIChub2RlRGVmLmZsYWdzICYgTm9kZUZsYWdzLkNhdFJlbmRlck5vZGUpIHtcbiAgICAgIGRlYnVnU2V0Q3VycmVudE5vZGUodmlldywgbmV4dFJlbmRlck5vZGVXaXRoQmluZGluZyh2aWV3LCBub2RlSW5kZXgpKTtcbiAgICB9XG4gICAgcmV0dXJuIChub2RlRGVmLmZsYWdzICYgTm9kZUZsYWdzLkNhdFB1cmVFeHByZXNzaW9uKSA/XG4gICAgICAgIGFzUHVyZUV4cHJlc3Npb25EYXRhKHZpZXcsIG5vZGVEZWYubm9kZUluZGV4KS52YWx1ZSA6XG4gICAgICAgIHVuZGVmaW5lZDtcbiAgfVxufVxuXG5mdW5jdGlvbiBkZWJ1Z0NoZWNrQW5kVXBkYXRlTm9kZShcbiAgICB2aWV3OiBWaWV3RGF0YSwgbm9kZURlZjogTm9kZURlZiwgYXJnU3R5bGU6IEFyZ3VtZW50VHlwZSwgZ2l2ZW5WYWx1ZXM6IGFueVtdKTogdm9pZCB7XG4gIGNvbnN0IGNoYW5nZWQgPSAoPGFueT5jaGVja0FuZFVwZGF0ZU5vZGUpKHZpZXcsIG5vZGVEZWYsIGFyZ1N0eWxlLCAuLi5naXZlblZhbHVlcyk7XG4gIGlmIChjaGFuZ2VkKSB7XG4gICAgY29uc3QgdmFsdWVzID0gYXJnU3R5bGUgPT09IEFyZ3VtZW50VHlwZS5EeW5hbWljID8gZ2l2ZW5WYWx1ZXNbMF0gOiBnaXZlblZhbHVlcztcbiAgICBpZiAobm9kZURlZi5mbGFncyAmIE5vZGVGbGFncy5UeXBlRGlyZWN0aXZlKSB7XG4gICAgICBjb25zdCBiaW5kaW5nVmFsdWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlRGVmLmJpbmRpbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGJpbmRpbmcgPSBub2RlRGVmLmJpbmRpbmdzW2ldO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IHZhbHVlc1tpXTtcbiAgICAgICAgaWYgKGJpbmRpbmcuZmxhZ3MgJiBCaW5kaW5nRmxhZ3MuVHlwZVByb3BlcnR5KSB7XG4gICAgICAgICAgYmluZGluZ1ZhbHVlc1tub3JtYWxpemVEZWJ1Z0JpbmRpbmdOYW1lKGJpbmRpbmcubm9uTWluaWZpZWROYW1lICEpXSA9XG4gICAgICAgICAgICAgIG5vcm1hbGl6ZURlYnVnQmluZGluZ1ZhbHVlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgZWxEZWYgPSBub2RlRGVmLnBhcmVudCAhO1xuICAgICAgY29uc3QgZWwgPSBhc0VsZW1lbnREYXRhKHZpZXcsIGVsRGVmLm5vZGVJbmRleCkucmVuZGVyRWxlbWVudDtcbiAgICAgIGlmICghZWxEZWYuZWxlbWVudCAhLm5hbWUpIHtcbiAgICAgICAgLy8gYSBjb21tZW50LlxuICAgICAgICB2aWV3LnJlbmRlcmVyLnNldFZhbHVlKGVsLCBgYmluZGluZ3M9JHtKU09OLnN0cmluZ2lmeShiaW5kaW5nVmFsdWVzLCBudWxsLCAyKX1gKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGEgcmVndWxhciBlbGVtZW50LlxuICAgICAgICBmb3IgKGxldCBhdHRyIGluIGJpbmRpbmdWYWx1ZXMpIHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IGJpbmRpbmdWYWx1ZXNbYXR0cl07XG4gICAgICAgICAgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHZpZXcucmVuZGVyZXIuc2V0QXR0cmlidXRlKGVsLCBhdHRyLCB2YWx1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZpZXcucmVuZGVyZXIucmVtb3ZlQXR0cmlidXRlKGVsLCBhdHRyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZGVidWdDaGVja05vQ2hhbmdlc05vZGUoXG4gICAgdmlldzogVmlld0RhdGEsIG5vZGVEZWY6IE5vZGVEZWYsIGFyZ1N0eWxlOiBBcmd1bWVudFR5cGUsIHZhbHVlczogYW55W10pOiB2b2lkIHtcbiAgKDxhbnk+Y2hlY2tOb0NoYW5nZXNOb2RlKSh2aWV3LCBub2RlRGVmLCBhcmdTdHlsZSwgLi4udmFsdWVzKTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplRGVidWdCaW5kaW5nTmFtZShuYW1lOiBzdHJpbmcpIHtcbiAgLy8gQXR0cmlidXRlIG5hbWVzIHdpdGggYCRgIChlZyBgeC15JGApIGFyZSB2YWxpZCBwZXIgc3BlYywgYnV0IHVuc3VwcG9ydGVkIGJ5IHNvbWUgYnJvd3NlcnNcbiAgbmFtZSA9IGNhbWVsQ2FzZVRvRGFzaENhc2UobmFtZS5yZXBsYWNlKC9bJEBdL2csICdfJykpO1xuICByZXR1cm4gYG5nLXJlZmxlY3QtJHtuYW1lfWA7XG59XG5cbmNvbnN0IENBTUVMX0NBU0VfUkVHRVhQID0gLyhbQS1aXSkvZztcblxuZnVuY3Rpb24gY2FtZWxDYXNlVG9EYXNoQ2FzZShpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGlucHV0LnJlcGxhY2UoQ0FNRUxfQ0FTRV9SRUdFWFAsICguLi5tOiBhbnlbXSkgPT4gJy0nICsgbVsxXS50b0xvd2VyQ2FzZSgpKTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplRGVidWdCaW5kaW5nVmFsdWUodmFsdWU6IGFueSk6IHN0cmluZyB7XG4gIHRyeSB7XG4gICAgLy8gTGltaXQgdGhlIHNpemUgb2YgdGhlIHZhbHVlIGFzIG90aGVyd2lzZSB0aGUgRE9NIGp1c3QgZ2V0cyBwb2xsdXRlZC5cbiAgICByZXR1cm4gdmFsdWUgIT0gbnVsbCA/IHZhbHVlLnRvU3RyaW5nKCkuc2xpY2UoMCwgMzApIDogdmFsdWU7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gJ1tFUlJPUl0gRXhjZXB0aW9uIHdoaWxlIHRyeWluZyB0byBzZXJpYWxpemUgdGhlIHZhbHVlJztcbiAgfVxufVxuXG5mdW5jdGlvbiBuZXh0RGlyZWN0aXZlV2l0aEJpbmRpbmcodmlldzogVmlld0RhdGEsIG5vZGVJbmRleDogbnVtYmVyKTogbnVtYmVyfG51bGwge1xuICBmb3IgKGxldCBpID0gbm9kZUluZGV4OyBpIDwgdmlldy5kZWYubm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBub2RlRGVmID0gdmlldy5kZWYubm9kZXNbaV07XG4gICAgaWYgKG5vZGVEZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuVHlwZURpcmVjdGl2ZSAmJiBub2RlRGVmLmJpbmRpbmdzICYmIG5vZGVEZWYuYmluZGluZ3MubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIG5leHRSZW5kZXJOb2RlV2l0aEJpbmRpbmcodmlldzogVmlld0RhdGEsIG5vZGVJbmRleDogbnVtYmVyKTogbnVtYmVyfG51bGwge1xuICBmb3IgKGxldCBpID0gbm9kZUluZGV4OyBpIDwgdmlldy5kZWYubm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBub2RlRGVmID0gdmlldy5kZWYubm9kZXNbaV07XG4gICAgaWYgKChub2RlRGVmLmZsYWdzICYgTm9kZUZsYWdzLkNhdFJlbmRlck5vZGUpICYmIG5vZGVEZWYuYmluZGluZ3MgJiYgbm9kZURlZi5iaW5kaW5ncy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuY2xhc3MgRGVidWdDb250ZXh0XyBpbXBsZW1lbnRzIERlYnVnQ29udGV4dCB7XG4gIHByaXZhdGUgbm9kZURlZjogTm9kZURlZjtcbiAgcHJpdmF0ZSBlbFZpZXc6IFZpZXdEYXRhO1xuICBwcml2YXRlIGVsRGVmOiBOb2RlRGVmO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2aWV3OiBWaWV3RGF0YSwgcHVibGljIG5vZGVJbmRleDogbnVtYmVyfG51bGwpIHtcbiAgICBpZiAobm9kZUluZGV4ID09IG51bGwpIHtcbiAgICAgIHRoaXMubm9kZUluZGV4ID0gbm9kZUluZGV4ID0gMDtcbiAgICB9XG4gICAgdGhpcy5ub2RlRGVmID0gdmlldy5kZWYubm9kZXNbbm9kZUluZGV4XTtcbiAgICBsZXQgZWxEZWYgPSB0aGlzLm5vZGVEZWY7XG4gICAgbGV0IGVsVmlldyA9IHZpZXc7XG4gICAgd2hpbGUgKGVsRGVmICYmIChlbERlZi5mbGFncyAmIE5vZGVGbGFncy5UeXBlRWxlbWVudCkgPT09IDApIHtcbiAgICAgIGVsRGVmID0gZWxEZWYucGFyZW50ICE7XG4gICAgfVxuICAgIGlmICghZWxEZWYpIHtcbiAgICAgIHdoaWxlICghZWxEZWYgJiYgZWxWaWV3KSB7XG4gICAgICAgIGVsRGVmID0gdmlld1BhcmVudEVsKGVsVmlldykgITtcbiAgICAgICAgZWxWaWV3ID0gZWxWaWV3LnBhcmVudCAhO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmVsRGVmID0gZWxEZWY7XG4gICAgdGhpcy5lbFZpZXcgPSBlbFZpZXc7XG4gIH1cblxuICBwcml2YXRlIGdldCBlbE9yQ29tcFZpZXcoKSB7XG4gICAgLy8gSGFzIHRvIGJlIGRvbmUgbGF6aWx5IGFzIHdlIHVzZSB0aGUgRGVidWdDb250ZXh0IGFsc28gZHVyaW5nIGNyZWF0aW9uIG9mIGVsZW1lbnRzLi4uXG4gICAgcmV0dXJuIGFzRWxlbWVudERhdGEodGhpcy5lbFZpZXcsIHRoaXMuZWxEZWYubm9kZUluZGV4KS5jb21wb25lbnRWaWV3IHx8IHRoaXMudmlldztcbiAgfVxuXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiBjcmVhdGVJbmplY3Rvcih0aGlzLmVsVmlldywgdGhpcy5lbERlZik7IH1cblxuICBnZXQgY29tcG9uZW50KCk6IGFueSB7IHJldHVybiB0aGlzLmVsT3JDb21wVmlldy5jb21wb25lbnQ7IH1cblxuICBnZXQgY29udGV4dCgpOiBhbnkgeyByZXR1cm4gdGhpcy5lbE9yQ29tcFZpZXcuY29udGV4dDsgfVxuXG4gIGdldCBwcm92aWRlclRva2VucygpOiBhbnlbXSB7XG4gICAgY29uc3QgdG9rZW5zOiBhbnlbXSA9IFtdO1xuICAgIGlmICh0aGlzLmVsRGVmKSB7XG4gICAgICBmb3IgKGxldCBpID0gdGhpcy5lbERlZi5ub2RlSW5kZXggKyAxOyBpIDw9IHRoaXMuZWxEZWYubm9kZUluZGV4ICsgdGhpcy5lbERlZi5jaGlsZENvdW50O1xuICAgICAgICAgICBpKyspIHtcbiAgICAgICAgY29uc3QgY2hpbGREZWYgPSB0aGlzLmVsVmlldy5kZWYubm9kZXNbaV07XG4gICAgICAgIGlmIChjaGlsZERlZi5mbGFncyAmIE5vZGVGbGFncy5DYXRQcm92aWRlcikge1xuICAgICAgICAgIHRva2Vucy5wdXNoKGNoaWxkRGVmLnByb3ZpZGVyICEudG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGkgKz0gY2hpbGREZWYuY2hpbGRDb3VudDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRva2VucztcbiAgfVxuXG4gIGdldCByZWZlcmVuY2VzKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICBjb25zdCByZWZlcmVuY2VzOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xuICAgIGlmICh0aGlzLmVsRGVmKSB7XG4gICAgICBjb2xsZWN0UmVmZXJlbmNlcyh0aGlzLmVsVmlldywgdGhpcy5lbERlZiwgcmVmZXJlbmNlcyk7XG5cbiAgICAgIGZvciAobGV0IGkgPSB0aGlzLmVsRGVmLm5vZGVJbmRleCArIDE7IGkgPD0gdGhpcy5lbERlZi5ub2RlSW5kZXggKyB0aGlzLmVsRGVmLmNoaWxkQ291bnQ7XG4gICAgICAgICAgIGkrKykge1xuICAgICAgICBjb25zdCBjaGlsZERlZiA9IHRoaXMuZWxWaWV3LmRlZi5ub2Rlc1tpXTtcbiAgICAgICAgaWYgKGNoaWxkRGVmLmZsYWdzICYgTm9kZUZsYWdzLkNhdFByb3ZpZGVyKSB7XG4gICAgICAgICAgY29sbGVjdFJlZmVyZW5jZXModGhpcy5lbFZpZXcsIGNoaWxkRGVmLCByZWZlcmVuY2VzKTtcbiAgICAgICAgfVxuICAgICAgICBpICs9IGNoaWxkRGVmLmNoaWxkQ291bnQ7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZWZlcmVuY2VzO1xuICB9XG5cbiAgZ2V0IGNvbXBvbmVudFJlbmRlckVsZW1lbnQoKSB7XG4gICAgY29uc3QgZWxEYXRhID0gZmluZEhvc3RFbGVtZW50KHRoaXMuZWxPckNvbXBWaWV3KTtcbiAgICByZXR1cm4gZWxEYXRhID8gZWxEYXRhLnJlbmRlckVsZW1lbnQgOiB1bmRlZmluZWQ7XG4gIH1cblxuICBnZXQgcmVuZGVyTm9kZSgpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLm5vZGVEZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuVHlwZVRleHQgPyByZW5kZXJOb2RlKHRoaXMudmlldywgdGhpcy5ub2RlRGVmKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlck5vZGUodGhpcy5lbFZpZXcsIHRoaXMuZWxEZWYpO1xuICB9XG5cbiAgbG9nRXJyb3IoY29uc29sZTogQ29uc29sZSwgLi4udmFsdWVzOiBhbnlbXSkge1xuICAgIGxldCBsb2dWaWV3RGVmOiBWaWV3RGVmaW5pdGlvbjtcbiAgICBsZXQgbG9nTm9kZUluZGV4OiBudW1iZXI7XG4gICAgaWYgKHRoaXMubm9kZURlZi5mbGFncyAmIE5vZGVGbGFncy5UeXBlVGV4dCkge1xuICAgICAgbG9nVmlld0RlZiA9IHRoaXMudmlldy5kZWY7XG4gICAgICBsb2dOb2RlSW5kZXggPSB0aGlzLm5vZGVEZWYubm9kZUluZGV4O1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2dWaWV3RGVmID0gdGhpcy5lbFZpZXcuZGVmO1xuICAgICAgbG9nTm9kZUluZGV4ID0gdGhpcy5lbERlZi5ub2RlSW5kZXg7XG4gICAgfVxuICAgIC8vIE5vdGU6IHdlIG9ubHkgZ2VuZXJhdGUgYSBsb2cgZnVuY3Rpb24gZm9yIHRleHQgYW5kIGVsZW1lbnQgbm9kZXNcbiAgICAvLyB0byBtYWtlIHRoZSBnZW5lcmF0ZWQgY29kZSBhcyBzbWFsbCBhcyBwb3NzaWJsZS5cbiAgICBjb25zdCByZW5kZXJOb2RlSW5kZXggPSBnZXRSZW5kZXJOb2RlSW5kZXgobG9nVmlld0RlZiwgbG9nTm9kZUluZGV4KTtcbiAgICBsZXQgY3VyclJlbmRlck5vZGVJbmRleCA9IC0xO1xuICAgIGxldCBub2RlTG9nZ2VyOiBOb2RlTG9nZ2VyID0gKCkgPT4ge1xuICAgICAgY3VyclJlbmRlck5vZGVJbmRleCsrO1xuICAgICAgaWYgKGN1cnJSZW5kZXJOb2RlSW5kZXggPT09IHJlbmRlck5vZGVJbmRleCkge1xuICAgICAgICByZXR1cm4gY29uc29sZS5lcnJvci5iaW5kKGNvbnNvbGUsIC4uLnZhbHVlcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gTk9PUDtcbiAgICAgIH1cbiAgICB9O1xuICAgIGxvZ1ZpZXdEZWYuZmFjdG9yeSAhKG5vZGVMb2dnZXIpO1xuICAgIGlmIChjdXJyUmVuZGVyTm9kZUluZGV4IDwgcmVuZGVyTm9kZUluZGV4KSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdJbGxlZ2FsIHN0YXRlOiB0aGUgVmlld0RlZmluaXRpb25GYWN0b3J5IGRpZCBub3QgY2FsbCB0aGUgbG9nZ2VyIScpO1xuICAgICAgKDxhbnk+Y29uc29sZS5lcnJvcikoLi4udmFsdWVzKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UmVuZGVyTm9kZUluZGV4KHZpZXdEZWY6IFZpZXdEZWZpbml0aW9uLCBub2RlSW5kZXg6IG51bWJlcik6IG51bWJlciB7XG4gIGxldCByZW5kZXJOb2RlSW5kZXggPSAtMTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPD0gbm9kZUluZGV4OyBpKyspIHtcbiAgICBjb25zdCBub2RlRGVmID0gdmlld0RlZi5ub2Rlc1tpXTtcbiAgICBpZiAobm9kZURlZi5mbGFncyAmIE5vZGVGbGFncy5DYXRSZW5kZXJOb2RlKSB7XG4gICAgICByZW5kZXJOb2RlSW5kZXgrKztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlbmRlck5vZGVJbmRleDtcbn1cblxuZnVuY3Rpb24gZmluZEhvc3RFbGVtZW50KHZpZXc6IFZpZXdEYXRhKTogRWxlbWVudERhdGF8bnVsbCB7XG4gIHdoaWxlICh2aWV3ICYmICFpc0NvbXBvbmVudFZpZXcodmlldykpIHtcbiAgICB2aWV3ID0gdmlldy5wYXJlbnQgITtcbiAgfVxuICBpZiAodmlldy5wYXJlbnQpIHtcbiAgICByZXR1cm4gYXNFbGVtZW50RGF0YSh2aWV3LnBhcmVudCwgdmlld1BhcmVudEVsKHZpZXcpICEubm9kZUluZGV4KTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gY29sbGVjdFJlZmVyZW5jZXModmlldzogVmlld0RhdGEsIG5vZGVEZWY6IE5vZGVEZWYsIHJlZmVyZW5jZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9KSB7XG4gIGZvciAobGV0IHJlZk5hbWUgaW4gbm9kZURlZi5yZWZlcmVuY2VzKSB7XG4gICAgcmVmZXJlbmNlc1tyZWZOYW1lXSA9IGdldFF1ZXJ5VmFsdWUodmlldywgbm9kZURlZiwgbm9kZURlZi5yZWZlcmVuY2VzW3JlZk5hbWVdKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjYWxsV2l0aERlYnVnQ29udGV4dChhY3Rpb246IERlYnVnQWN0aW9uLCBmbjogYW55LCBzZWxmOiBhbnksIGFyZ3M6IGFueVtdKSB7XG4gIGNvbnN0IG9sZEFjdGlvbiA9IF9jdXJyZW50QWN0aW9uO1xuICBjb25zdCBvbGRWaWV3ID0gX2N1cnJlbnRWaWV3O1xuICBjb25zdCBvbGROb2RlSW5kZXggPSBfY3VycmVudE5vZGVJbmRleDtcbiAgdHJ5IHtcbiAgICBfY3VycmVudEFjdGlvbiA9IGFjdGlvbjtcbiAgICBjb25zdCByZXN1bHQgPSBmbi5hcHBseShzZWxmLCBhcmdzKTtcbiAgICBfY3VycmVudFZpZXcgPSBvbGRWaWV3O1xuICAgIF9jdXJyZW50Tm9kZUluZGV4ID0gb2xkTm9kZUluZGV4O1xuICAgIF9jdXJyZW50QWN0aW9uID0gb2xkQWN0aW9uO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoaXNWaWV3RGVidWdFcnJvcihlKSB8fCAhX2N1cnJlbnRWaWV3KSB7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgICB0aHJvdyB2aWV3V3JhcHBlZERlYnVnRXJyb3IoZSwgZ2V0Q3VycmVudERlYnVnQ29udGV4dCgpICEpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW50RGVidWdDb250ZXh0KCk6IERlYnVnQ29udGV4dHxudWxsIHtcbiAgcmV0dXJuIF9jdXJyZW50VmlldyA/IG5ldyBEZWJ1Z0NvbnRleHRfKF9jdXJyZW50VmlldywgX2N1cnJlbnROb2RlSW5kZXgpIDogbnVsbDtcbn1cblxuZXhwb3J0IGNsYXNzIERlYnVnUmVuZGVyZXJGYWN0b3J5MiBpbXBsZW1lbnRzIFJlbmRlcmVyRmFjdG9yeTIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGRlbGVnYXRlOiBSZW5kZXJlckZhY3RvcnkyKSB7fVxuXG4gIGNyZWF0ZVJlbmRlcmVyKGVsZW1lbnQ6IGFueSwgcmVuZGVyRGF0YTogUmVuZGVyZXJUeXBlMnxudWxsKTogUmVuZGVyZXIyIHtcbiAgICByZXR1cm4gbmV3IERlYnVnUmVuZGVyZXIyKHRoaXMuZGVsZWdhdGUuY3JlYXRlUmVuZGVyZXIoZWxlbWVudCwgcmVuZGVyRGF0YSkpO1xuICB9XG5cbiAgYmVnaW4oKSB7XG4gICAgaWYgKHRoaXMuZGVsZWdhdGUuYmVnaW4pIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUuYmVnaW4oKTtcbiAgICB9XG4gIH1cbiAgZW5kKCkge1xuICAgIGlmICh0aGlzLmRlbGVnYXRlLmVuZCkge1xuICAgICAgdGhpcy5kZWxlZ2F0ZS5lbmQoKTtcbiAgICB9XG4gIH1cblxuICB3aGVuUmVuZGVyaW5nRG9uZSgpOiBQcm9taXNlPGFueT4ge1xuICAgIGlmICh0aGlzLmRlbGVnYXRlLndoZW5SZW5kZXJpbmdEb25lKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZWxlZ2F0ZS53aGVuUmVuZGVyaW5nRG9uZSgpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWJ1Z1JlbmRlcmVyMiBpbXBsZW1lbnRzIFJlbmRlcmVyMiB7XG4gIHJlYWRvbmx5IGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuXG4gIHByaXZhdGUgY3JlYXRlRGVidWdDb250ZXh0KG5hdGl2ZUVsZW1lbnQ6IGFueSkgeyByZXR1cm4gdGhpcy5kZWJ1Z0NvbnRleHRGYWN0b3J5KG5hdGl2ZUVsZW1lbnQpOyB9XG5cbiAgLyoqXG4gICAqIEZhY3RvcnkgZnVuY3Rpb24gdXNlZCB0byBjcmVhdGUgYSBgRGVidWdDb250ZXh0YCB3aGVuIGEgbm9kZSBpcyBjcmVhdGVkLlxuICAgKlxuICAgKiBUaGUgYERlYnVnQ29udGV4dGAgYWxsb3dzIHRvIHJldHJpZXZlIGluZm9ybWF0aW9uIGFib3V0IHRoZSBub2RlcyB0aGF0IGFyZSB1c2VmdWwgaW4gdGVzdHMuXG4gICAqXG4gICAqIFRoZSBmYWN0b3J5IGlzIGNvbmZpZ3VyYWJsZSBzbyB0aGF0IHRoZSBgRGVidWdSZW5kZXJlcjJgIGNvdWxkIGluc3RhbnRpYXRlIGVpdGhlciBhIFZpZXcgRW5naW5lXG4gICAqIG9yIGEgUmVuZGVyIGNvbnRleHQuXG4gICAqL1xuICBkZWJ1Z0NvbnRleHRGYWN0b3J5OiAobmF0aXZlRWxlbWVudD86IGFueSkgPT4gRGVidWdDb250ZXh0IHwgbnVsbCA9IGdldEN1cnJlbnREZWJ1Z0NvbnRleHQ7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBkZWxlZ2F0ZTogUmVuZGVyZXIyKSB7IHRoaXMuZGF0YSA9IHRoaXMuZGVsZWdhdGUuZGF0YTsgfVxuXG4gIGRlc3Ryb3lOb2RlKG5vZGU6IGFueSkge1xuICAgIHJlbW92ZURlYnVnTm9kZUZyb21JbmRleChnZXREZWJ1Z05vZGUobm9kZSkgISk7XG4gICAgaWYgKHRoaXMuZGVsZWdhdGUuZGVzdHJveU5vZGUpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUuZGVzdHJveU5vZGUobm9kZSk7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpIHsgdGhpcy5kZWxlZ2F0ZS5kZXN0cm95KCk7IH1cblxuICBjcmVhdGVFbGVtZW50KG5hbWU6IHN0cmluZywgbmFtZXNwYWNlPzogc3RyaW5nKTogYW55IHtcbiAgICBjb25zdCBlbCA9IHRoaXMuZGVsZWdhdGUuY3JlYXRlRWxlbWVudChuYW1lLCBuYW1lc3BhY2UpO1xuICAgIGNvbnN0IGRlYnVnQ3R4ID0gdGhpcy5jcmVhdGVEZWJ1Z0NvbnRleHQoZWwpO1xuICAgIGlmIChkZWJ1Z0N0eCkge1xuICAgICAgY29uc3QgZGVidWdFbCA9IG5ldyBEZWJ1Z0VsZW1lbnQoZWwsIG51bGwsIGRlYnVnQ3R4KTtcbiAgICAgIGRlYnVnRWwubmFtZSA9IG5hbWU7XG4gICAgICBpbmRleERlYnVnTm9kZShkZWJ1Z0VsKTtcbiAgICB9XG4gICAgcmV0dXJuIGVsO1xuICB9XG5cbiAgY3JlYXRlQ29tbWVudCh2YWx1ZTogc3RyaW5nKTogYW55IHtcbiAgICBjb25zdCBjb21tZW50ID0gdGhpcy5kZWxlZ2F0ZS5jcmVhdGVDb21tZW50KHZhbHVlKTtcbiAgICBjb25zdCBkZWJ1Z0N0eCA9IHRoaXMuY3JlYXRlRGVidWdDb250ZXh0KGNvbW1lbnQpO1xuICAgIGlmIChkZWJ1Z0N0eCkge1xuICAgICAgaW5kZXhEZWJ1Z05vZGUobmV3IERlYnVnTm9kZShjb21tZW50LCBudWxsLCBkZWJ1Z0N0eCkpO1xuICAgIH1cbiAgICByZXR1cm4gY29tbWVudDtcbiAgfVxuXG4gIGNyZWF0ZVRleHQodmFsdWU6IHN0cmluZyk6IGFueSB7XG4gICAgY29uc3QgdGV4dCA9IHRoaXMuZGVsZWdhdGUuY3JlYXRlVGV4dCh2YWx1ZSk7XG4gICAgY29uc3QgZGVidWdDdHggPSB0aGlzLmNyZWF0ZURlYnVnQ29udGV4dCh0ZXh0KTtcbiAgICBpZiAoZGVidWdDdHgpIHtcbiAgICAgIGluZGV4RGVidWdOb2RlKG5ldyBEZWJ1Z05vZGUodGV4dCwgbnVsbCwgZGVidWdDdHgpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cblxuICBhcHBlbmRDaGlsZChwYXJlbnQ6IGFueSwgbmV3Q2hpbGQ6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IGRlYnVnRWwgPSBnZXREZWJ1Z05vZGUocGFyZW50KTtcbiAgICBjb25zdCBkZWJ1Z0NoaWxkRWwgPSBnZXREZWJ1Z05vZGUobmV3Q2hpbGQpO1xuICAgIGlmIChkZWJ1Z0VsICYmIGRlYnVnQ2hpbGRFbCAmJiBkZWJ1Z0VsIGluc3RhbmNlb2YgRGVidWdFbGVtZW50KSB7XG4gICAgICBkZWJ1Z0VsLmFkZENoaWxkKGRlYnVnQ2hpbGRFbCk7XG4gICAgfVxuICAgIHRoaXMuZGVsZWdhdGUuYXBwZW5kQ2hpbGQocGFyZW50LCBuZXdDaGlsZCk7XG4gIH1cblxuICBpbnNlcnRCZWZvcmUocGFyZW50OiBhbnksIG5ld0NoaWxkOiBhbnksIHJlZkNoaWxkOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCBkZWJ1Z0VsID0gZ2V0RGVidWdOb2RlKHBhcmVudCk7XG4gICAgY29uc3QgZGVidWdDaGlsZEVsID0gZ2V0RGVidWdOb2RlKG5ld0NoaWxkKTtcbiAgICBjb25zdCBkZWJ1Z1JlZkVsID0gZ2V0RGVidWdOb2RlKHJlZkNoaWxkKSAhO1xuICAgIGlmIChkZWJ1Z0VsICYmIGRlYnVnQ2hpbGRFbCAmJiBkZWJ1Z0VsIGluc3RhbmNlb2YgRGVidWdFbGVtZW50KSB7XG4gICAgICBkZWJ1Z0VsLmluc2VydEJlZm9yZShkZWJ1Z1JlZkVsLCBkZWJ1Z0NoaWxkRWwpO1xuICAgIH1cblxuICAgIHRoaXMuZGVsZWdhdGUuaW5zZXJ0QmVmb3JlKHBhcmVudCwgbmV3Q2hpbGQsIHJlZkNoaWxkKTtcbiAgfVxuXG4gIHJlbW92ZUNoaWxkKHBhcmVudDogYW55LCBvbGRDaGlsZDogYW55KTogdm9pZCB7XG4gICAgY29uc3QgZGVidWdFbCA9IGdldERlYnVnTm9kZShwYXJlbnQpO1xuICAgIGNvbnN0IGRlYnVnQ2hpbGRFbCA9IGdldERlYnVnTm9kZShvbGRDaGlsZCk7XG4gICAgaWYgKGRlYnVnRWwgJiYgZGVidWdDaGlsZEVsICYmIGRlYnVnRWwgaW5zdGFuY2VvZiBEZWJ1Z0VsZW1lbnQpIHtcbiAgICAgIGRlYnVnRWwucmVtb3ZlQ2hpbGQoZGVidWdDaGlsZEVsKTtcbiAgICB9XG4gICAgdGhpcy5kZWxlZ2F0ZS5yZW1vdmVDaGlsZChwYXJlbnQsIG9sZENoaWxkKTtcbiAgfVxuXG4gIHNlbGVjdFJvb3RFbGVtZW50KHNlbGVjdG9yT3JOb2RlOiBzdHJpbmd8YW55LCBwcmVzZXJ2ZUNvbnRlbnQ/OiBib29sZWFuKTogYW55IHtcbiAgICBjb25zdCBlbCA9IHRoaXMuZGVsZWdhdGUuc2VsZWN0Um9vdEVsZW1lbnQoc2VsZWN0b3JPck5vZGUsIHByZXNlcnZlQ29udGVudCk7XG4gICAgY29uc3QgZGVidWdDdHggPSBnZXRDdXJyZW50RGVidWdDb250ZXh0KCkgfHwgKGl2eUVuYWJsZWQgPyB0aGlzLmNyZWF0ZURlYnVnQ29udGV4dChlbCkgOiBudWxsKTtcbiAgICBpZiAoZGVidWdDdHgpIHtcbiAgICAgIGluZGV4RGVidWdOb2RlKG5ldyBEZWJ1Z0VsZW1lbnQoZWwsIG51bGwsIGRlYnVnQ3R4KSk7XG4gICAgfVxuICAgIHJldHVybiBlbDtcbiAgfVxuXG4gIHNldEF0dHJpYnV0ZShlbDogYW55LCBuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIG5hbWVzcGFjZT86IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGRlYnVnRWwgPSBnZXREZWJ1Z05vZGUoZWwpO1xuICAgIGlmIChkZWJ1Z0VsICYmIGRlYnVnRWwgaW5zdGFuY2VvZiBEZWJ1Z0VsZW1lbnQpIHtcbiAgICAgIGNvbnN0IGZ1bGxOYW1lID0gbmFtZXNwYWNlID8gbmFtZXNwYWNlICsgJzonICsgbmFtZSA6IG5hbWU7XG4gICAgICBkZWJ1Z0VsLmF0dHJpYnV0ZXNbZnVsbE5hbWVdID0gdmFsdWU7XG4gICAgfVxuICAgIHRoaXMuZGVsZWdhdGUuc2V0QXR0cmlidXRlKGVsLCBuYW1lLCB2YWx1ZSwgbmFtZXNwYWNlKTtcbiAgfVxuXG4gIHJlbW92ZUF0dHJpYnV0ZShlbDogYW55LCBuYW1lOiBzdHJpbmcsIG5hbWVzcGFjZT86IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGRlYnVnRWwgPSBnZXREZWJ1Z05vZGUoZWwpO1xuICAgIGlmIChkZWJ1Z0VsICYmIGRlYnVnRWwgaW5zdGFuY2VvZiBEZWJ1Z0VsZW1lbnQpIHtcbiAgICAgIGNvbnN0IGZ1bGxOYW1lID0gbmFtZXNwYWNlID8gbmFtZXNwYWNlICsgJzonICsgbmFtZSA6IG5hbWU7XG4gICAgICBkZWJ1Z0VsLmF0dHJpYnV0ZXNbZnVsbE5hbWVdID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5kZWxlZ2F0ZS5yZW1vdmVBdHRyaWJ1dGUoZWwsIG5hbWUsIG5hbWVzcGFjZSk7XG4gIH1cblxuICBhZGRDbGFzcyhlbDogYW55LCBuYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBkZWJ1Z0VsID0gZ2V0RGVidWdOb2RlKGVsKTtcbiAgICBpZiAoZGVidWdFbCAmJiBkZWJ1Z0VsIGluc3RhbmNlb2YgRGVidWdFbGVtZW50KSB7XG4gICAgICBkZWJ1Z0VsLmNsYXNzZXNbbmFtZV0gPSB0cnVlO1xuICAgIH1cbiAgICB0aGlzLmRlbGVnYXRlLmFkZENsYXNzKGVsLCBuYW1lKTtcbiAgfVxuXG4gIHJlbW92ZUNsYXNzKGVsOiBhbnksIG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGRlYnVnRWwgPSBnZXREZWJ1Z05vZGUoZWwpO1xuICAgIGlmIChkZWJ1Z0VsICYmIGRlYnVnRWwgaW5zdGFuY2VvZiBEZWJ1Z0VsZW1lbnQpIHtcbiAgICAgIGRlYnVnRWwuY2xhc3Nlc1tuYW1lXSA9IGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLmRlbGVnYXRlLnJlbW92ZUNsYXNzKGVsLCBuYW1lKTtcbiAgfVxuXG4gIHNldFN0eWxlKGVsOiBhbnksIHN0eWxlOiBzdHJpbmcsIHZhbHVlOiBhbnksIGZsYWdzOiBSZW5kZXJlclN0eWxlRmxhZ3MyKTogdm9pZCB7XG4gICAgY29uc3QgZGVidWdFbCA9IGdldERlYnVnTm9kZShlbCk7XG4gICAgaWYgKGRlYnVnRWwgJiYgZGVidWdFbCBpbnN0YW5jZW9mIERlYnVnRWxlbWVudCkge1xuICAgICAgZGVidWdFbC5zdHlsZXNbc3R5bGVdID0gdmFsdWU7XG4gICAgfVxuICAgIHRoaXMuZGVsZWdhdGUuc2V0U3R5bGUoZWwsIHN0eWxlLCB2YWx1ZSwgZmxhZ3MpO1xuICB9XG5cbiAgcmVtb3ZlU3R5bGUoZWw6IGFueSwgc3R5bGU6IHN0cmluZywgZmxhZ3M6IFJlbmRlcmVyU3R5bGVGbGFnczIpOiB2b2lkIHtcbiAgICBjb25zdCBkZWJ1Z0VsID0gZ2V0RGVidWdOb2RlKGVsKTtcbiAgICBpZiAoZGVidWdFbCAmJiBkZWJ1Z0VsIGluc3RhbmNlb2YgRGVidWdFbGVtZW50KSB7XG4gICAgICBkZWJ1Z0VsLnN0eWxlc1tzdHlsZV0gPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLmRlbGVnYXRlLnJlbW92ZVN0eWxlKGVsLCBzdHlsZSwgZmxhZ3MpO1xuICB9XG5cbiAgc2V0UHJvcGVydHkoZWw6IGFueSwgbmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgY29uc3QgZGVidWdFbCA9IGdldERlYnVnTm9kZShlbCk7XG4gICAgaWYgKGRlYnVnRWwgJiYgZGVidWdFbCBpbnN0YW5jZW9mIERlYnVnRWxlbWVudCkge1xuICAgICAgZGVidWdFbC5wcm9wZXJ0aWVzW25hbWVdID0gdmFsdWU7XG4gICAgfVxuICAgIHRoaXMuZGVsZWdhdGUuc2V0UHJvcGVydHkoZWwsIG5hbWUsIHZhbHVlKTtcbiAgfVxuXG4gIGxpc3RlbihcbiAgICAgIHRhcmdldDogJ2RvY3VtZW50J3wnd2luZG93cyd8J2JvZHknfGFueSwgZXZlbnROYW1lOiBzdHJpbmcsXG4gICAgICBjYWxsYmFjazogKGV2ZW50OiBhbnkpID0+IGJvb2xlYW4pOiAoKSA9PiB2b2lkIHtcbiAgICBpZiAodHlwZW9mIHRhcmdldCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnN0IGRlYnVnRWwgPSBnZXREZWJ1Z05vZGUodGFyZ2V0KTtcbiAgICAgIGlmIChkZWJ1Z0VsKSB7XG4gICAgICAgIGRlYnVnRWwubGlzdGVuZXJzLnB1c2gobmV3IEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjaykpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmRlbGVnYXRlLmxpc3Rlbih0YXJnZXQsIGV2ZW50TmFtZSwgY2FsbGJhY2spO1xuICB9XG5cbiAgcGFyZW50Tm9kZShub2RlOiBhbnkpOiBhbnkgeyByZXR1cm4gdGhpcy5kZWxlZ2F0ZS5wYXJlbnROb2RlKG5vZGUpOyB9XG4gIG5leHRTaWJsaW5nKG5vZGU6IGFueSk6IGFueSB7IHJldHVybiB0aGlzLmRlbGVnYXRlLm5leHRTaWJsaW5nKG5vZGUpOyB9XG4gIHNldFZhbHVlKG5vZGU6IGFueSwgdmFsdWU6IHN0cmluZyk6IHZvaWQgeyByZXR1cm4gdGhpcy5kZWxlZ2F0ZS5zZXRWYWx1ZShub2RlLCB2YWx1ZSk7IH1cbn1cbiJdfQ==