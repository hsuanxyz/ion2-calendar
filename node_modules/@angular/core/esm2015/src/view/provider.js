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
import { ChangeDetectorRef, SimpleChange, WrappedValue } from '../change_detection/change_detection';
import { INJECTOR, Injector, resolveForwardRef } from '../di';
import { ElementRef } from '../linker/element_ref';
import { TemplateRef } from '../linker/template_ref';
import { ViewContainerRef } from '../linker/view_container_ref';
import { Renderer as RendererV1, Renderer2 } from '../render/api';
import { stringify } from '../util';
import { isObservable } from '../util/lang';
import { createChangeDetectorRef, createInjector, createRendererV1 } from './refs';
import { Services, asElementData, asProviderData, shouldCallLifecycleInitHook } from './types';
import { calcBindingFlags, checkBinding, dispatchEvent, isComponentView, splitDepsDsl, splitMatchedQueriesDsl, tokenKey, viewParentEl } from './util';
/** @type {?} */
const RendererV1TokenKey = tokenKey(RendererV1);
/** @type {?} */
const Renderer2TokenKey = tokenKey(Renderer2);
/** @type {?} */
const ElementRefTokenKey = tokenKey(ElementRef);
/** @type {?} */
const ViewContainerRefTokenKey = tokenKey(ViewContainerRef);
/** @type {?} */
const TemplateRefTokenKey = tokenKey(TemplateRef);
/** @type {?} */
const ChangeDetectorRefTokenKey = tokenKey(ChangeDetectorRef);
/** @type {?} */
const InjectorRefTokenKey = tokenKey(Injector);
/** @type {?} */
const INJECTORRefTokenKey = tokenKey(INJECTOR);
/**
 * @param {?} checkIndex
 * @param {?} flags
 * @param {?} matchedQueries
 * @param {?} childCount
 * @param {?} ctor
 * @param {?} deps
 * @param {?=} props
 * @param {?=} outputs
 * @return {?}
 */
export function directiveDef(checkIndex, flags, matchedQueries, childCount, ctor, deps, props, outputs) {
    /** @type {?} */
    const bindings = [];
    if (props) {
        for (let prop in props) {
            const [bindingIndex, nonMinifiedName] = props[prop];
            bindings[bindingIndex] = {
                flags: 8 /* TypeProperty */,
                name: prop, nonMinifiedName,
                ns: null,
                securityContext: null,
                suffix: null
            };
        }
    }
    /** @type {?} */
    const outputDefs = [];
    if (outputs) {
        for (let propName in outputs) {
            outputDefs.push({ type: 1 /* DirectiveOutput */, propName, target: null, eventName: outputs[propName] });
        }
    }
    flags |= 16384 /* TypeDirective */;
    return _def(checkIndex, flags, matchedQueries, childCount, ctor, ctor, deps, bindings, outputDefs);
}
/**
 * @param {?} flags
 * @param {?} ctor
 * @param {?} deps
 * @return {?}
 */
export function pipeDef(flags, ctor, deps) {
    flags |= 16 /* TypePipe */;
    return _def(-1, flags, null, 0, ctor, ctor, deps);
}
/**
 * @param {?} flags
 * @param {?} matchedQueries
 * @param {?} token
 * @param {?} value
 * @param {?} deps
 * @return {?}
 */
export function providerDef(flags, matchedQueries, token, value, deps) {
    return _def(-1, flags, matchedQueries, 0, token, value, deps);
}
/**
 * @param {?} checkIndex
 * @param {?} flags
 * @param {?} matchedQueriesDsl
 * @param {?} childCount
 * @param {?} token
 * @param {?} value
 * @param {?} deps
 * @param {?=} bindings
 * @param {?=} outputs
 * @return {?}
 */
export function _def(checkIndex, flags, matchedQueriesDsl, childCount, token, value, deps, bindings, outputs) {
    const { matchedQueries, references, matchedQueryIds } = splitMatchedQueriesDsl(matchedQueriesDsl);
    if (!outputs) {
        outputs = [];
    }
    if (!bindings) {
        bindings = [];
    }
    // Need to resolve forwardRefs as e.g. for `useValue` we
    // lowered the expression and then stopped evaluating it,
    // i.e. also didn't unwrap it.
    value = resolveForwardRef(value);
    /** @type {?} */
    const depDefs = splitDepsDsl(deps, stringify(token));
    return {
        // will bet set by the view definition
        nodeIndex: -1,
        parent: null,
        renderParent: null,
        bindingIndex: -1,
        outputIndex: -1,
        // regular values
        checkIndex,
        flags,
        childFlags: 0,
        directChildFlags: 0,
        childMatchedQueries: 0, matchedQueries, matchedQueryIds, references,
        ngContentIndex: -1, childCount, bindings,
        bindingFlags: calcBindingFlags(bindings), outputs,
        element: null,
        provider: { token, value, deps: depDefs },
        text: null,
        query: null,
        ngContent: null
    };
}
/**
 * @param {?} view
 * @param {?} def
 * @return {?}
 */
export function createProviderInstance(view, def) {
    return _createProviderInstance(view, def);
}
/**
 * @param {?} view
 * @param {?} def
 * @return {?}
 */
export function createPipeInstance(view, def) {
    // deps are looked up from component.
    /** @type {?} */
    let compView = view;
    while (compView.parent && !isComponentView(compView)) {
        compView = compView.parent;
    }
    // pipes can see the private services of the component
    /** @type {?} */
    const allowPrivateServices = true;
    // pipes are always eager and classes!
    return createClass((/** @type {?} */ (compView.parent)), (/** @type {?} */ (viewParentEl(compView))), allowPrivateServices, (/** @type {?} */ (def.provider)).value, (/** @type {?} */ (def.provider)).deps);
}
/**
 * @param {?} view
 * @param {?} def
 * @return {?}
 */
export function createDirectiveInstance(view, def) {
    // components can see other private services, other directives can't.
    /** @type {?} */
    const allowPrivateServices = (def.flags & 32768 /* Component */) > 0;
    // directives are always eager and classes!
    /** @type {?} */
    const instance = createClass(view, (/** @type {?} */ (def.parent)), allowPrivateServices, (/** @type {?} */ (def.provider)).value, (/** @type {?} */ (def.provider)).deps);
    if (def.outputs.length) {
        for (let i = 0; i < def.outputs.length; i++) {
            /** @type {?} */
            const output = def.outputs[i];
            /** @type {?} */
            const outputObservable = instance[(/** @type {?} */ (output.propName))];
            if (isObservable(outputObservable)) {
                /** @type {?} */
                const subscription = outputObservable.subscribe(eventHandlerClosure(view, (/** @type {?} */ (def.parent)).nodeIndex, output.eventName));
                (/** @type {?} */ (view.disposables))[def.outputIndex + i] = subscription.unsubscribe.bind(subscription);
            }
            else {
                throw new Error(`@Output ${output.propName} not initialized in '${instance.constructor.name}'.`);
            }
        }
    }
    return instance;
}
/**
 * @param {?} view
 * @param {?} index
 * @param {?} eventName
 * @return {?}
 */
function eventHandlerClosure(view, index, eventName) {
    return (event) => dispatchEvent(view, index, eventName, event);
}
/**
 * @param {?} view
 * @param {?} def
 * @param {?} v0
 * @param {?} v1
 * @param {?} v2
 * @param {?} v3
 * @param {?} v4
 * @param {?} v5
 * @param {?} v6
 * @param {?} v7
 * @param {?} v8
 * @param {?} v9
 * @return {?}
 */
export function checkAndUpdateDirectiveInline(view, def, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
    /** @type {?} */
    const providerData = asProviderData(view, def.nodeIndex);
    /** @type {?} */
    const directive = providerData.instance;
    /** @type {?} */
    let changed = false;
    /** @type {?} */
    let changes = (/** @type {?} */ (undefined));
    /** @type {?} */
    const bindLen = def.bindings.length;
    if (bindLen > 0 && checkBinding(view, def, 0, v0)) {
        changed = true;
        changes = updateProp(view, providerData, def, 0, v0, changes);
    }
    if (bindLen > 1 && checkBinding(view, def, 1, v1)) {
        changed = true;
        changes = updateProp(view, providerData, def, 1, v1, changes);
    }
    if (bindLen > 2 && checkBinding(view, def, 2, v2)) {
        changed = true;
        changes = updateProp(view, providerData, def, 2, v2, changes);
    }
    if (bindLen > 3 && checkBinding(view, def, 3, v3)) {
        changed = true;
        changes = updateProp(view, providerData, def, 3, v3, changes);
    }
    if (bindLen > 4 && checkBinding(view, def, 4, v4)) {
        changed = true;
        changes = updateProp(view, providerData, def, 4, v4, changes);
    }
    if (bindLen > 5 && checkBinding(view, def, 5, v5)) {
        changed = true;
        changes = updateProp(view, providerData, def, 5, v5, changes);
    }
    if (bindLen > 6 && checkBinding(view, def, 6, v6)) {
        changed = true;
        changes = updateProp(view, providerData, def, 6, v6, changes);
    }
    if (bindLen > 7 && checkBinding(view, def, 7, v7)) {
        changed = true;
        changes = updateProp(view, providerData, def, 7, v7, changes);
    }
    if (bindLen > 8 && checkBinding(view, def, 8, v8)) {
        changed = true;
        changes = updateProp(view, providerData, def, 8, v8, changes);
    }
    if (bindLen > 9 && checkBinding(view, def, 9, v9)) {
        changed = true;
        changes = updateProp(view, providerData, def, 9, v9, changes);
    }
    if (changes) {
        directive.ngOnChanges(changes);
    }
    if ((def.flags & 65536 /* OnInit */) &&
        shouldCallLifecycleInitHook(view, 256 /* InitState_CallingOnInit */, def.nodeIndex)) {
        directive.ngOnInit();
    }
    if (def.flags & 262144 /* DoCheck */) {
        directive.ngDoCheck();
    }
    return changed;
}
/**
 * @param {?} view
 * @param {?} def
 * @param {?} values
 * @return {?}
 */
export function checkAndUpdateDirectiveDynamic(view, def, values) {
    /** @type {?} */
    const providerData = asProviderData(view, def.nodeIndex);
    /** @type {?} */
    const directive = providerData.instance;
    /** @type {?} */
    let changed = false;
    /** @type {?} */
    let changes = (/** @type {?} */ (undefined));
    for (let i = 0; i < values.length; i++) {
        if (checkBinding(view, def, i, values[i])) {
            changed = true;
            changes = updateProp(view, providerData, def, i, values[i], changes);
        }
    }
    if (changes) {
        directive.ngOnChanges(changes);
    }
    if ((def.flags & 65536 /* OnInit */) &&
        shouldCallLifecycleInitHook(view, 256 /* InitState_CallingOnInit */, def.nodeIndex)) {
        directive.ngOnInit();
    }
    if (def.flags & 262144 /* DoCheck */) {
        directive.ngDoCheck();
    }
    return changed;
}
/**
 * @param {?} view
 * @param {?} def
 * @return {?}
 */
function _createProviderInstance(view, def) {
    // private services can see other private services
    /** @type {?} */
    const allowPrivateServices = (def.flags & 8192 /* PrivateProvider */) > 0;
    /** @type {?} */
    const providerDef = def.provider;
    switch (def.flags & 201347067 /* Types */) {
        case 512 /* TypeClassProvider */:
            return createClass(view, (/** @type {?} */ (def.parent)), allowPrivateServices, (/** @type {?} */ (providerDef)).value, (/** @type {?} */ (providerDef)).deps);
        case 1024 /* TypeFactoryProvider */:
            return callFactory(view, (/** @type {?} */ (def.parent)), allowPrivateServices, (/** @type {?} */ (providerDef)).value, (/** @type {?} */ (providerDef)).deps);
        case 2048 /* TypeUseExistingProvider */:
            return resolveDep(view, (/** @type {?} */ (def.parent)), allowPrivateServices, (/** @type {?} */ (providerDef)).deps[0]);
        case 256 /* TypeValueProvider */:
            return (/** @type {?} */ (providerDef)).value;
    }
}
/**
 * @param {?} view
 * @param {?} elDef
 * @param {?} allowPrivateServices
 * @param {?} ctor
 * @param {?} deps
 * @return {?}
 */
function createClass(view, elDef, allowPrivateServices, ctor, deps) {
    /** @type {?} */
    const len = deps.length;
    switch (len) {
        case 0:
            return new ctor();
        case 1:
            return new ctor(resolveDep(view, elDef, allowPrivateServices, deps[0]));
        case 2:
            return new ctor(resolveDep(view, elDef, allowPrivateServices, deps[0]), resolveDep(view, elDef, allowPrivateServices, deps[1]));
        case 3:
            return new ctor(resolveDep(view, elDef, allowPrivateServices, deps[0]), resolveDep(view, elDef, allowPrivateServices, deps[1]), resolveDep(view, elDef, allowPrivateServices, deps[2]));
        default:
            /** @type {?} */
            const depValues = new Array(len);
            for (let i = 0; i < len; i++) {
                depValues[i] = resolveDep(view, elDef, allowPrivateServices, deps[i]);
            }
            return new ctor(...depValues);
    }
}
/**
 * @param {?} view
 * @param {?} elDef
 * @param {?} allowPrivateServices
 * @param {?} factory
 * @param {?} deps
 * @return {?}
 */
function callFactory(view, elDef, allowPrivateServices, factory, deps) {
    /** @type {?} */
    const len = deps.length;
    switch (len) {
        case 0:
            return factory();
        case 1:
            return factory(resolveDep(view, elDef, allowPrivateServices, deps[0]));
        case 2:
            return factory(resolveDep(view, elDef, allowPrivateServices, deps[0]), resolveDep(view, elDef, allowPrivateServices, deps[1]));
        case 3:
            return factory(resolveDep(view, elDef, allowPrivateServices, deps[0]), resolveDep(view, elDef, allowPrivateServices, deps[1]), resolveDep(view, elDef, allowPrivateServices, deps[2]));
        default:
            /** @type {?} */
            const depValues = Array(len);
            for (let i = 0; i < len; i++) {
                depValues[i] = resolveDep(view, elDef, allowPrivateServices, deps[i]);
            }
            return factory(...depValues);
    }
}
// This default value is when checking the hierarchy for a token.
//
// It means both:
// - the token is not provided by the current injector,
// - only the element injectors should be checked (ie do not check module injectors
//
//          mod1
//         /
//       el1   mod2
//         \  /
//         el2
//
// When requesting el2.injector.get(token), we should check in the following order and return the
// first found value:
// - el2.injector.get(token, default)
// - el1.injector.get(token, NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR) -> do not check the module
// - mod2.injector.get(token, default)
/** @type {?} */
export const NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR = {};
/**
 * @param {?} view
 * @param {?} elDef
 * @param {?} allowPrivateServices
 * @param {?} depDef
 * @param {?=} notFoundValue
 * @return {?}
 */
export function resolveDep(view, elDef, allowPrivateServices, depDef, notFoundValue = Injector.THROW_IF_NOT_FOUND) {
    if (depDef.flags & 8 /* Value */) {
        return depDef.token;
    }
    /** @type {?} */
    const startView = view;
    if (depDef.flags & 2 /* Optional */) {
        notFoundValue = null;
    }
    /** @type {?} */
    const tokenKey = depDef.tokenKey;
    if (tokenKey === ChangeDetectorRefTokenKey) {
        // directives on the same element as a component should be able to control the change detector
        // of that component as well.
        allowPrivateServices = !!(elDef && (/** @type {?} */ (elDef.element)).componentView);
    }
    if (elDef && (depDef.flags & 1 /* SkipSelf */)) {
        allowPrivateServices = false;
        elDef = (/** @type {?} */ (elDef.parent));
    }
    /** @type {?} */
    let searchView = view;
    while (searchView) {
        if (elDef) {
            switch (tokenKey) {
                case RendererV1TokenKey: {
                    /** @type {?} */
                    const compView = findCompView(searchView, elDef, allowPrivateServices);
                    return createRendererV1(compView);
                }
                case Renderer2TokenKey: {
                    /** @type {?} */
                    const compView = findCompView(searchView, elDef, allowPrivateServices);
                    return compView.renderer;
                }
                case ElementRefTokenKey:
                    return new ElementRef(asElementData(searchView, elDef.nodeIndex).renderElement);
                case ViewContainerRefTokenKey:
                    return asElementData(searchView, elDef.nodeIndex).viewContainer;
                case TemplateRefTokenKey: {
                    if ((/** @type {?} */ (elDef.element)).template) {
                        return asElementData(searchView, elDef.nodeIndex).template;
                    }
                    break;
                }
                case ChangeDetectorRefTokenKey: {
                    /** @type {?} */
                    let cdView = findCompView(searchView, elDef, allowPrivateServices);
                    return createChangeDetectorRef(cdView);
                }
                case InjectorRefTokenKey:
                case INJECTORRefTokenKey:
                    return createInjector(searchView, elDef);
                default:
                    /** @type {?} */
                    const providerDef = (/** @type {?} */ ((allowPrivateServices ? (/** @type {?} */ (elDef.element)).allProviders :
                        (/** @type {?} */ (elDef.element)).publicProviders)))[tokenKey];
                    if (providerDef) {
                        /** @type {?} */
                        let providerData = asProviderData(searchView, providerDef.nodeIndex);
                        if (!providerData) {
                            providerData = { instance: _createProviderInstance(searchView, providerDef) };
                            searchView.nodes[providerDef.nodeIndex] = (/** @type {?} */ (providerData));
                        }
                        return providerData.instance;
                    }
            }
        }
        allowPrivateServices = isComponentView(searchView);
        elDef = (/** @type {?} */ (viewParentEl(searchView)));
        searchView = (/** @type {?} */ (searchView.parent));
        if (depDef.flags & 4 /* Self */) {
            searchView = null;
        }
    }
    /** @type {?} */
    const value = startView.root.injector.get(depDef.token, NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR);
    if (value !== NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR ||
        notFoundValue === NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR) {
        // Return the value from the root element injector when
        // - it provides it
        //   (value !== NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR)
        // - the module injector should not be checked
        //   (notFoundValue === NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR)
        return value;
    }
    return startView.root.ngModule.injector.get(depDef.token, notFoundValue);
}
/**
 * @param {?} view
 * @param {?} elDef
 * @param {?} allowPrivateServices
 * @return {?}
 */
function findCompView(view, elDef, allowPrivateServices) {
    /** @type {?} */
    let compView;
    if (allowPrivateServices) {
        compView = asElementData(view, elDef.nodeIndex).componentView;
    }
    else {
        compView = view;
        while (compView.parent && !isComponentView(compView)) {
            compView = compView.parent;
        }
    }
    return compView;
}
/**
 * @param {?} view
 * @param {?} providerData
 * @param {?} def
 * @param {?} bindingIdx
 * @param {?} value
 * @param {?} changes
 * @return {?}
 */
function updateProp(view, providerData, def, bindingIdx, value, changes) {
    if (def.flags & 32768 /* Component */) {
        /** @type {?} */
        const compView = asElementData(view, (/** @type {?} */ (def.parent)).nodeIndex).componentView;
        if (compView.def.flags & 2 /* OnPush */) {
            compView.state |= 8 /* ChecksEnabled */;
        }
    }
    /** @type {?} */
    const binding = def.bindings[bindingIdx];
    /** @type {?} */
    const propName = (/** @type {?} */ (binding.name));
    // Note: This is still safe with Closure Compiler as
    // the user passed in the property name as an object has to `providerDef`,
    // so Closure Compiler will have renamed the property correctly already.
    providerData.instance[propName] = value;
    if (def.flags & 524288 /* OnChanges */) {
        changes = changes || {};
        /** @type {?} */
        const oldValue = WrappedValue.unwrap(view.oldValues[def.bindingIndex + bindingIdx]);
        /** @type {?} */
        const binding = def.bindings[bindingIdx];
        changes[(/** @type {?} */ (binding.nonMinifiedName))] =
            new SimpleChange(oldValue, value, (view.state & 2 /* FirstCheck */) !== 0);
    }
    view.oldValues[def.bindingIndex + bindingIdx] = value;
    return changes;
}
// This function calls the ngAfterContentCheck, ngAfterContentInit,
// ngAfterViewCheck, and ngAfterViewInit lifecycle hooks (depending on the node
// flags in lifecycle). Unlike ngDoCheck, ngOnChanges and ngOnInit, which are
// called during a pre-order traversal of the view tree (that is calling the
// parent hooks before the child hooks) these events are sent in using a
// post-order traversal of the tree (children before parents). This changes the
// meaning of initIndex in the view state. For ngOnInit, initIndex tracks the
// expected nodeIndex which a ngOnInit should be called. When sending
// ngAfterContentInit and ngAfterViewInit it is the expected count of
// ngAfterContentInit or ngAfterViewInit methods that have been called. This
// ensure that despite being called recursively or after picking up after an
// exception, the ngAfterContentInit or ngAfterViewInit will be called on the
// correct nodes. Consider for example, the following (where E is an element
// and D is a directive)
//  Tree:       pre-order index  post-order index
//    E1        0                6
//      E2      1                1
//       D3     2                0
//      E4      3                5
//       E5     4                4
//        E6    5                2
//        E7    6                3
// As can be seen, the post-order index has an unclear relationship to the
// pre-order index (postOrderIndex === preOrderIndex - parentCount +
// childCount). Since number of calls to ngAfterContentInit and ngAfterViewInit
// are stable (will be the same for the same view regardless of exceptions or
// recursion) we just need to count them which will roughly correspond to the
// post-order index (it skips elements and directives that do not have
// lifecycle hooks).
//
// For example, if an exception is raised in the E6.onAfterViewInit() the
// initIndex is left at 3 (by shouldCallLifecycleInitHook() which set it to
// initIndex + 1). When checkAndUpdateView() is called again D3, E2 and E6 will
// not have their ngAfterViewInit() called but, starting with E7, the rest of
// the view will begin getting ngAfterViewInit() called until a check and
// pass is complete.
//
// This algorthim also handles recursion. Consider if E4's ngAfterViewInit()
// indirectly calls E1's ChangeDetectorRef.detectChanges(). The expected
// initIndex is set to 6, the recusive checkAndUpdateView() starts walk again.
// D3, E2, E6, E7, E5 and E4 are skipped, ngAfterViewInit() is called on E1.
// When the recursion returns the initIndex will be 7 so E1 is skipped as it
// has already been called in the recursively called checkAnUpdateView().
/**
 * @param {?} view
 * @param {?} lifecycles
 * @return {?}
 */
export function callLifecycleHooksChildrenFirst(view, lifecycles) {
    if (!(view.def.nodeFlags & lifecycles)) {
        return;
    }
    /** @type {?} */
    const nodes = view.def.nodes;
    /** @type {?} */
    let initIndex = 0;
    for (let i = 0; i < nodes.length; i++) {
        /** @type {?} */
        const nodeDef = nodes[i];
        /** @type {?} */
        let parent = nodeDef.parent;
        if (!parent && nodeDef.flags & lifecycles) {
            // matching root node (e.g. a pipe)
            callProviderLifecycles(view, i, nodeDef.flags & lifecycles, initIndex++);
        }
        if ((nodeDef.childFlags & lifecycles) === 0) {
            // no child matches one of the lifecycles
            i += nodeDef.childCount;
        }
        while (parent && (parent.flags & 1 /* TypeElement */) &&
            i === parent.nodeIndex + parent.childCount) {
            // last child of an element
            if (parent.directChildFlags & lifecycles) {
                initIndex = callElementProvidersLifecycles(view, parent, lifecycles, initIndex);
            }
            parent = parent.parent;
        }
    }
}
/**
 * @param {?} view
 * @param {?} elDef
 * @param {?} lifecycles
 * @param {?} initIndex
 * @return {?}
 */
function callElementProvidersLifecycles(view, elDef, lifecycles, initIndex) {
    for (let i = elDef.nodeIndex + 1; i <= elDef.nodeIndex + elDef.childCount; i++) {
        /** @type {?} */
        const nodeDef = view.def.nodes[i];
        if (nodeDef.flags & lifecycles) {
            callProviderLifecycles(view, i, nodeDef.flags & lifecycles, initIndex++);
        }
        // only visit direct children
        i += nodeDef.childCount;
    }
    return initIndex;
}
/**
 * @param {?} view
 * @param {?} index
 * @param {?} lifecycles
 * @param {?} initIndex
 * @return {?}
 */
function callProviderLifecycles(view, index, lifecycles, initIndex) {
    /** @type {?} */
    const providerData = asProviderData(view, index);
    if (!providerData) {
        return;
    }
    /** @type {?} */
    const provider = providerData.instance;
    if (!provider) {
        return;
    }
    Services.setCurrentNode(view, index);
    if (lifecycles & 1048576 /* AfterContentInit */ &&
        shouldCallLifecycleInitHook(view, 512 /* InitState_CallingAfterContentInit */, initIndex)) {
        provider.ngAfterContentInit();
    }
    if (lifecycles & 2097152 /* AfterContentChecked */) {
        provider.ngAfterContentChecked();
    }
    if (lifecycles & 4194304 /* AfterViewInit */ &&
        shouldCallLifecycleInitHook(view, 768 /* InitState_CallingAfterViewInit */, initIndex)) {
        provider.ngAfterViewInit();
    }
    if (lifecycles & 8388608 /* AfterViewChecked */) {
        provider.ngAfterViewChecked();
    }
    if (lifecycles & 131072 /* OnDestroy */) {
        provider.ngOnDestroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9jb3JlL3NyYy92aWV3L3Byb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLGlCQUFpQixFQUFFLFlBQVksRUFBaUIsWUFBWSxFQUFDLE1BQU0sc0NBQXNDLENBQUM7QUFDbEgsT0FBTyxFQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxPQUFPLENBQUM7QUFDNUQsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ2pELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUNuRCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUMsUUFBUSxJQUFJLFVBQVUsRUFBRSxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDaEUsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUNsQyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBRTFDLE9BQU8sRUFBQyx1QkFBdUIsRUFBRSxjQUFjLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFDakYsT0FBTyxFQUFzSCxRQUFRLEVBQWtDLGFBQWEsRUFBRSxjQUFjLEVBQUUsMkJBQTJCLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDbFAsT0FBTyxFQUFDLGdCQUFnQixFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLFlBQVksRUFBRSxzQkFBc0IsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFDLE1BQU0sUUFBUSxDQUFDOztNQUU5SSxrQkFBa0IsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDOztNQUN6QyxpQkFBaUIsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDOztNQUN2QyxrQkFBa0IsR0FBRyxRQUFRLENB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QUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQy9EO0lBQ0QsSUFBSSxPQUFPLEdBQUcsQ0FBQyxJQUFJLFlBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtRQUNqRCxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ2YsT0FBTyxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQy9EO0lBQ0QsSUFBSSxPQUFPLEdBQUcsQ0FBQyxJQUFJLFlBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtRQUNqRCxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ2YsT0FBTyxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQy9EO0lBQ0QsSUFBSSxPQUFPLEdBQUcsQ0FBQyxJQUFJLFlBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtRQUNqRCxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ2YsT0FBTyxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQy9EO0lBQ0QsSUFBSSxPQUFPLEdBQUcsQ0FBQyxJQUFJLFlBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtRQUNqRCxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ2YsT0FBTyxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQy9EO0lBQ0QsSUFBSSxPQUFPLEdBQUcsQ0FBQyxJQUFJLFlBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtRQUNqRCxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ2YsT0FBTyxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQy9EO0lBQ0QsSUFBSSxPQUFPLEdBQUcsQ0FBQyxJQUFJLFlBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtRQUNqRCxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ2YsT0FBTyxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQy9EO0lBQ0QsSUFBSSxPQUFPLEdBQUcsQ0FBQyxJQUFJLFlBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtRQUNqRCxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ2YsT0FBTyxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQy9EO0lBQ0QsSUFBSSxPQUFPLEdBQUcsQ0FBQyxJQUFJLFlBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtRQUNqRCxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ2YsT0FBTyxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQy9EO0lBQ0QsSUFBSSxPQUFPLEdBQUcsQ0FBQyxJQUFJLFlBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtRQUNqRCxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ2YsT0FBTyxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQy9EO0lBQ0QsSUFBSSxPQUFPLEVBQUU7UUFDWCxTQUFTLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ2hDO0lBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLHFCQUFtQixDQUFDO1FBQzlCLDJCQUEyQixDQUFDLElBQUkscUNBQXFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtRQUN2RixTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDdEI7SUFDRCxJQUFJLEdBQUcsQ0FBQyxLQUFLLHVCQUFvQixFQUFFO1FBQ2pDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztLQUN2QjtJQUNELE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUM7Ozs7Ozs7QUFFRCxNQUFNLFVBQVUsOEJBQThCLENBQzFDLElBQWMsRUFBRSxHQUFZLEVBQUUsTUFBYTs7VUFDdkMsWUFBWSxHQUFHLGNBQWMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQzs7VUFDbEQsU0FBUyxHQUFHLFlBQVksQ0FBQyxRQUFROztRQUNuQyxPQUFPLEdBQUcsS0FBSzs7UUFDZixPQUFPLEdBQWtCLG1CQUFBLFNBQVMsRUFBRTtJQUN4QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN0QyxJQUFJLFlBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUN6QyxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBQ2YsT0FBTyxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ3RFO0tBQ0Y7SUFDRCxJQUFJLE9BQU8sRUFBRTtRQUNYLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDaEM7SUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUsscUJBQW1CLENBQUM7UUFDOUIsMkJBQTJCLENBQUMsSUFBSSxxQ0FBcUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1FBQ3ZGLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUN0QjtJQUNELElBQUksR0FBRyxDQUFDLEtBQUssdUJBQW9CLEVBQUU7UUFDakMsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO0tBQ3ZCO0lBQ0QsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQzs7Ozs7O0FBRUQsU0FBUyx1QkFBdUIsQ0FBQyxJQUFjLEVBQUUsR0FBWTs7O1VBRXJELG9CQUFvQixHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssNkJBQTRCLENBQUMsR0FBRyxDQUFDOztVQUNsRSxXQUFXLEdBQUcsR0FBRyxDQUFDLFFBQVE7SUFDaEMsUUFBUSxHQUFHLENBQUMsS0FBSyx3QkFBa0IsRUFBRTtRQUNuQztZQUNFLE9BQU8sV0FBVyxDQUNkLElBQUksRUFBRSxtQkFBQSxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsb0JBQW9CLEVBQUUsbUJBQUEsV0FBVyxFQUFFLENBQUMsS0FBSyxFQUFFLG1CQUFBLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pGO1lBQ0UsT0FBTyxXQUFXLENBQ2QsSUFBSSxFQUFFLG1CQUFBLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxvQkFBb0IsRUFBRSxtQkFBQSxXQUFXLEVBQUUsQ0FBQyxLQUFLLEVBQUUsbUJBQUEsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekY7WUFDRSxPQUFPLFVBQVUsQ0FBQyxJQUFJLEVBQUUsbUJBQUEsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLG9CQUFvQixFQUFFLG1CQUFBLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JGO1lBQ0UsT0FBTyxtQkFBQSxXQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUM7S0FDOUI7QUFDSCxDQUFDOzs7Ozs7Ozs7QUFFRCxTQUFTLFdBQVcsQ0FDaEIsSUFBYyxFQUFFLEtBQWMsRUFBRSxvQkFBNkIsRUFBRSxJQUFTLEVBQUUsSUFBYzs7VUFDcEYsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNO0lBQ3ZCLFFBQVEsR0FBRyxFQUFFO1FBQ1gsS0FBSyxDQUFDO1lBQ0osT0FBTyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3BCLEtBQUssQ0FBQztZQUNKLE9BQU8sSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxRSxLQUFLLENBQUM7WUFDSixPQUFPLElBQUksSUFBSSxDQUNYLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLG9CQUFvQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUN0RCxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlELEtBQUssQ0FBQztZQUNKLE9BQU8sSUFBSSxJQUFJLENBQ1gsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3RELFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLG9CQUFvQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUN0RCxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlEOztrQkFDUSxTQUFTLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDO1lBQ2hDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzVCLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN2RTtZQUNELE9BQU8sSUFBSSxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQztLQUNqQztBQUNILENBQUM7Ozs7Ozs7OztBQUVELFNBQVMsV0FBVyxDQUNoQixJQUFjLEVBQUUsS0FBYyxFQUFFLG9CQUE2QixFQUFFLE9BQVksRUFDM0UsSUFBYzs7VUFDVixHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU07SUFDdkIsUUFBUSxHQUFHLEVBQUU7UUFDWCxLQUFLLENBQUM7WUFDSixPQUFPLE9BQU8sRUFBRSxDQUFDO1FBQ25CLEtBQUssQ0FBQztZQUNKLE9BQU8sT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLG9CQUFvQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekUsS0FBSyxDQUFDO1lBQ0osT0FBTyxPQUFPLENBQ1YsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3RELFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLG9CQUFvQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUQsS0FBSyxDQUFDO1lBQ0osT0FBTyxPQUFPLENBQ1YsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3RELFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLG9CQUFvQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUN0RCxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlEOztrQkFDUSxTQUFTLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQztZQUM1QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM1QixTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDdkU7WUFDRCxPQUFPLE9BQU8sQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDO0tBQ2hDO0FBQ0gsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1CRCxNQUFNLE9BQU8scUNBQXFDLEdBQUcsRUFBRTs7Ozs7Ozs7O0FBRXZELE1BQU0sVUFBVSxVQUFVLENBQ3RCLElBQWMsRUFBRSxLQUFjLEVBQUUsb0JBQTZCLEVBQUUsTUFBYyxFQUM3RSxnQkFBcUIsUUFBUSxDQUFDLGtCQUFrQjtJQUNsRCxJQUFJLE1BQU0sQ0FBQyxLQUFLLGdCQUFpQixFQUFFO1FBQ2pDLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQztLQUNyQjs7VUFDSyxTQUFTLEdBQUcsSUFBSTtJQUN0QixJQUFJLE1BQU0sQ0FBQyxLQUFLLG1CQUFvQixFQUFFO1FBQ3BDLGFBQWEsR0FBRyxJQUFJLENBQUM7S0FDdEI7O1VBQ0ssUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRO0lBRWhDLElBQUksUUFBUSxLQUFLLHlCQUF5QixFQUFFO1FBQzFDLDhGQUE4RjtRQUM5Riw2QkFBNkI7UUFDN0Isb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLG1CQUFBLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUNuRTtJQUVELElBQUksS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssbUJBQW9CLENBQUMsRUFBRTtRQUMvQyxvQkFBb0IsR0FBRyxLQUFLLENBQUM7UUFDN0IsS0FBSyxHQUFHLG1CQUFBLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUN4Qjs7UUFFRyxVQUFVLEdBQWtCLElBQUk7SUFDcEMsT0FBTyxVQUFVLEVBQUU7UUFDakIsSUFBSSxLQUFLLEVBQUU7WUFDVCxRQUFRLFFBQVEsRUFBRTtnQkFDaEIsS0FBSyxrQkFBa0IsQ0FBQyxDQUFDOzswQkFDakIsUUFBUSxHQUFHLFlBQVksQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLG9CQUFvQixDQUFDO29CQUN0RSxPQUFPLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNuQztnQkFDRCxLQUFLLGlCQUFpQixDQUFDLENBQUM7OzBCQUNoQixRQUFRLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsb0JBQW9CLENBQUM7b0JBQ3RFLE9BQU8sUUFBUSxDQUFDLFFBQVEsQ0FBQztpQkFDMUI7Z0JBQ0QsS0FBSyxrQkFBa0I7b0JBQ3JCLE9BQU8sSUFBSSxVQUFVLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ2xGLEtBQUssd0JBQXdCO29CQUMzQixPQUFPLGFBQWEsQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLGFBQWEsQ0FBQztnQkFDbEUsS0FBSyxtQkFBbUIsQ0FBQyxDQUFDO29CQUN4QixJQUFJLG1CQUFBLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLEVBQUU7d0JBQzVCLE9BQU8sYUFBYSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxDQUFDO3FCQUM1RDtvQkFDRCxNQUFNO2lCQUNQO2dCQUNELEtBQUsseUJBQXlCLENBQUMsQ0FBQzs7d0JBQzFCLE1BQU0sR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxvQkFBb0IsQ0FBQztvQkFDbEUsT0FBTyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDeEM7Z0JBQ0QsS0FBSyxtQkFBbUIsQ0FBQztnQkFDekIsS0FBSyxtQkFBbUI7b0JBQ3RCLE9BQU8sY0FBYyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDM0M7OzBCQUNRLFdBQVcsR0FDYixtQkFBQSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxtQkFBQSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUM7d0JBQzlCLG1CQUFBLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQztvQkFDeEUsSUFBSSxXQUFXLEVBQUU7OzRCQUNYLFlBQVksR0FBRyxjQUFjLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUM7d0JBQ3BFLElBQUksQ0FBQyxZQUFZLEVBQUU7NEJBQ2pCLFlBQVksR0FBRyxFQUFDLFFBQVEsRUFBRSx1QkFBdUIsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLEVBQUMsQ0FBQzs0QkFDNUUsVUFBVSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsbUJBQUEsWUFBWSxFQUFPLENBQUM7eUJBQy9EO3dCQUNELE9BQU8sWUFBWSxDQUFDLFFBQVEsQ0FBQztxQkFDOUI7YUFDSjtTQUNGO1FBRUQsb0JBQW9CLEdBQUcsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ25ELEtBQUssR0FBRyxtQkFBQSxZQUFZLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztRQUNuQyxVQUFVLEdBQUcsbUJBQUEsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRWpDLElBQUksTUFBTSxDQUFDLEtBQUssZUFBZ0IsRUFBRTtZQUNoQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1NBQ25CO0tBQ0Y7O1VBRUssS0FBSyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLHFDQUFxQyxDQUFDO0lBRTlGLElBQUksS0FBSyxLQUFLLHFDQUFxQztRQUMvQyxhQUFhLEtBQUsscUNBQXFDLEVBQUU7UUFDM0QsdURBQXVEO1FBQ3ZELG1CQUFtQjtRQUNuQixzREFBc0Q7UUFDdEQsOENBQThDO1FBQzlDLDhEQUE4RDtRQUM5RCxPQUFPLEtBQUssQ0FBQztLQUNkO0lBRUQsT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDM0UsQ0FBQzs7Ozs7OztBQUVELFNBQVMsWUFBWSxDQUFDLElBQWMsRUFBRSxLQUFjLEVBQUUsb0JBQTZCOztRQUM3RSxRQUFrQjtJQUN0QixJQUFJLG9CQUFvQixFQUFFO1FBQ3hCLFFBQVEsR0FBRyxhQUFhLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxhQUFhLENBQUM7S0FDL0Q7U0FBTTtRQUNMLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDaEIsT0FBTyxRQUFRLENBQUMsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3BELFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO1NBQzVCO0tBQ0Y7SUFDRCxPQUFPLFFBQVEsQ0FBQztBQUNsQixDQUFDOzs7Ozs7Ozs7O0FBRUQsU0FBUyxVQUFVLENBQ2YsSUFBYyxFQUFFLFlBQTBCLEVBQUUsR0FBWSxFQUFFLFVBQWtCLEVBQUUsS0FBVSxFQUN4RixPQUFzQjtJQUN4QixJQUFJLEdBQUcsQ0FBQyxLQUFLLHdCQUFzQixFQUFFOztjQUM3QixRQUFRLEdBQUcsYUFBYSxDQUFDLElBQUksRUFBRSxtQkFBQSxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsYUFBYTtRQUMxRSxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxpQkFBbUIsRUFBRTtZQUN6QyxRQUFRLENBQUMsS0FBSyx5QkFBMkIsQ0FBQztTQUMzQztLQUNGOztVQUNLLE9BQU8sR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQzs7VUFDbEMsUUFBUSxHQUFHLG1CQUFBLE9BQU8sQ0FBQyxJQUFJLEVBQUU7SUFDL0Isb0RBQW9EO0lBQ3BELDBFQUEwRTtJQUMxRSx3RUFBd0U7SUFDeEUsWUFBWSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDeEMsSUFBSSxHQUFHLENBQUMsS0FBSyx5QkFBc0IsRUFBRTtRQUNuQyxPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQzs7Y0FDbEIsUUFBUSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQyxDQUFDOztjQUM3RSxPQUFPLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7UUFDeEMsT0FBTyxDQUFDLG1CQUFBLE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUM5QixJQUFJLFlBQVksQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUsscUJBQXVCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUNsRjtJQUNELElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksR0FBRyxVQUFVLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDdEQsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTZDRCxNQUFNLFVBQVUsK0JBQStCLENBQUMsSUFBYyxFQUFFLFVBQXFCO0lBQ25GLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxFQUFFO1FBQ3RDLE9BQU87S0FDUjs7VUFDSyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLOztRQUN4QixTQUFTLEdBQUcsQ0FBQztJQUNqQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTs7Y0FDL0IsT0FBTyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7O1lBQ3BCLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTTtRQUMzQixJQUFJLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxLQUFLLEdBQUcsVUFBVSxFQUFFO1lBQ3pDLG1DQUFtQztZQUNuQyxzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEdBQUcsVUFBVSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7U0FDMUU7UUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDM0MseUNBQXlDO1lBQ3pDLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDO1NBQ3pCO1FBQ0QsT0FBTyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxzQkFBd0IsQ0FBQztZQUNoRCxDQUFDLEtBQUssTUFBTSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFO1lBQ2pELDJCQUEyQjtZQUMzQixJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxVQUFVLEVBQUU7Z0JBQ3hDLFNBQVMsR0FBRyw4QkFBOEIsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQzthQUNqRjtZQUNELE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1NBQ3hCO0tBQ0Y7QUFDSCxDQUFDOzs7Ozs7OztBQUVELFNBQVMsOEJBQThCLENBQ25DLElBQWMsRUFBRSxLQUFjLEVBQUUsVUFBcUIsRUFBRSxTQUFpQjtJQUMxRSxLQUFLLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQUU7O2NBQ3hFLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDakMsSUFBSSxPQUFPLENBQUMsS0FBSyxHQUFHLFVBQVUsRUFBRTtZQUM5QixzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEdBQUcsVUFBVSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7U0FDMUU7UUFDRCw2QkFBNkI7UUFDN0IsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUM7S0FDekI7SUFDRCxPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDOzs7Ozs7OztBQUVELFNBQVMsc0JBQXNCLENBQzNCLElBQWMsRUFBRSxLQUFhLEVBQUUsVUFBcUIsRUFBRSxTQUFpQjs7VUFDbkUsWUFBWSxHQUFHLGNBQWMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDO0lBQ2hELElBQUksQ0FBQyxZQUFZLEVBQUU7UUFDakIsT0FBTztLQUNSOztVQUNLLFFBQVEsR0FBRyxZQUFZLENBQUMsUUFBUTtJQUN0QyxJQUFJLENBQUMsUUFBUSxFQUFFO1FBQ2IsT0FBTztLQUNSO0lBQ0QsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDckMsSUFBSSxVQUFVLGlDQUE2QjtRQUN2QywyQkFBMkIsQ0FBQyxJQUFJLCtDQUErQyxTQUFTLENBQUMsRUFBRTtRQUM3RixRQUFRLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztLQUMvQjtJQUNELElBQUksVUFBVSxvQ0FBZ0MsRUFBRTtRQUM5QyxRQUFRLENBQUMscUJBQXFCLEVBQUUsQ0FBQztLQUNsQztJQUNELElBQUksVUFBVSw4QkFBMEI7UUFDcEMsMkJBQTJCLENBQUMsSUFBSSw0Q0FBNEMsU0FBUyxDQUFDLEVBQUU7UUFDMUYsUUFBUSxDQUFDLGVBQWUsRUFBRSxDQUFDO0tBQzVCO0lBQ0QsSUFBSSxVQUFVLGlDQUE2QixFQUFFO1FBQzNDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0tBQy9CO0lBQ0QsSUFBSSxVQUFVLHlCQUFzQixFQUFFO1FBQ3BDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztLQUN4QjtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q2hhbmdlRGV0ZWN0b3JSZWYsIFNpbXBsZUNoYW5nZSwgU2ltcGxlQ2hhbmdlcywgV3JhcHBlZFZhbHVlfSBmcm9tICcuLi9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rpb24nO1xuaW1wb3J0IHtJTkpFQ1RPUiwgSW5qZWN0b3IsIHJlc29sdmVGb3J3YXJkUmVmfSBmcm9tICcuLi9kaSc7XG5pbXBvcnQge0VsZW1lbnRSZWZ9IGZyb20gJy4uL2xpbmtlci9lbGVtZW50X3JlZic7XG5pbXBvcnQge1RlbXBsYXRlUmVmfSBmcm9tICcuLi9saW5rZXIvdGVtcGxhdGVfcmVmJztcbmltcG9ydCB7Vmlld0NvbnRhaW5lclJlZn0gZnJvbSAnLi4vbGlua2VyL3ZpZXdfY29udGFpbmVyX3JlZic7XG5pbXBvcnQge1JlbmRlcmVyIGFzIFJlbmRlcmVyVjEsIFJlbmRlcmVyMn0gZnJvbSAnLi4vcmVuZGVyL2FwaSc7XG5pbXBvcnQge3N0cmluZ2lmeX0gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQge2lzT2JzZXJ2YWJsZX0gZnJvbSAnLi4vdXRpbC9sYW5nJztcblxuaW1wb3J0IHtjcmVhdGVDaGFuZ2VEZXRlY3RvclJlZiwgY3JlYXRlSW5qZWN0b3IsIGNyZWF0ZVJlbmRlcmVyVjF9IGZyb20gJy4vcmVmcyc7XG5pbXBvcnQge0JpbmRpbmdEZWYsIEJpbmRpbmdGbGFncywgRGVwRGVmLCBEZXBGbGFncywgTm9kZURlZiwgTm9kZUZsYWdzLCBPdXRwdXREZWYsIE91dHB1dFR5cGUsIFByb3ZpZGVyRGF0YSwgUXVlcnlWYWx1ZVR5cGUsIFNlcnZpY2VzLCBWaWV3RGF0YSwgVmlld0ZsYWdzLCBWaWV3U3RhdGUsIGFzRWxlbWVudERhdGEsIGFzUHJvdmlkZXJEYXRhLCBzaG91bGRDYWxsTGlmZWN5Y2xlSW5pdEhvb2t9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHtjYWxjQmluZGluZ0ZsYWdzLCBjaGVja0JpbmRpbmcsIGRpc3BhdGNoRXZlbnQsIGlzQ29tcG9uZW50Vmlldywgc3BsaXREZXBzRHNsLCBzcGxpdE1hdGNoZWRRdWVyaWVzRHNsLCB0b2tlbktleSwgdmlld1BhcmVudEVsfSBmcm9tICcuL3V0aWwnO1xuXG5jb25zdCBSZW5kZXJlclYxVG9rZW5LZXkgPSB0b2tlbktleShSZW5kZXJlclYxKTtcbmNvbnN0IFJlbmRlcmVyMlRva2VuS2V5ID0gdG9rZW5LZXkoUmVuZGVyZXIyKTtcbmNvbnN0IEVsZW1lbnRSZWZUb2tlbktleSA9IHRva2VuS2V5KEVsZW1lbnRSZWYpO1xuY29uc3QgVmlld0NvbnRhaW5lclJlZlRva2VuS2V5ID0gdG9rZW5LZXkoVmlld0NvbnRhaW5lclJlZik7XG5jb25zdCBUZW1wbGF0ZVJlZlRva2VuS2V5ID0gdG9rZW5LZXkoVGVtcGxhdGVSZWYpO1xuY29uc3QgQ2hhbmdlRGV0ZWN0b3JSZWZUb2tlbktleSA9IHRva2VuS2V5KENoYW5nZURldGVjdG9yUmVmKTtcbmNvbnN0IEluamVjdG9yUmVmVG9rZW5LZXkgPSB0b2tlbktleShJbmplY3Rvcik7XG5jb25zdCBJTkpFQ1RPUlJlZlRva2VuS2V5ID0gdG9rZW5LZXkoSU5KRUNUT1IpO1xuXG5leHBvcnQgZnVuY3Rpb24gZGlyZWN0aXZlRGVmKFxuICAgIGNoZWNrSW5kZXg6IG51bWJlciwgZmxhZ3M6IE5vZGVGbGFncyxcbiAgICBtYXRjaGVkUXVlcmllczogbnVsbCB8IFtzdHJpbmcgfCBudW1iZXIsIFF1ZXJ5VmFsdWVUeXBlXVtdLCBjaGlsZENvdW50OiBudW1iZXIsIGN0b3I6IGFueSxcbiAgICBkZXBzOiAoW0RlcEZsYWdzLCBhbnldIHwgYW55KVtdLCBwcm9wcz86IG51bGwgfCB7W25hbWU6IHN0cmluZ106IFtudW1iZXIsIHN0cmluZ119LFxuICAgIG91dHB1dHM/OiBudWxsIHwge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9KTogTm9kZURlZiB7XG4gIGNvbnN0IGJpbmRpbmdzOiBCaW5kaW5nRGVmW10gPSBbXTtcbiAgaWYgKHByb3BzKSB7XG4gICAgZm9yIChsZXQgcHJvcCBpbiBwcm9wcykge1xuICAgICAgY29uc3QgW2JpbmRpbmdJbmRleCwgbm9uTWluaWZpZWROYW1lXSA9IHByb3BzW3Byb3BdO1xuICAgICAgYmluZGluZ3NbYmluZGluZ0luZGV4XSA9IHtcbiAgICAgICAgZmxhZ3M6IEJpbmRpbmdGbGFncy5UeXBlUHJvcGVydHksXG4gICAgICAgIG5hbWU6IHByb3AsIG5vbk1pbmlmaWVkTmFtZSxcbiAgICAgICAgbnM6IG51bGwsXG4gICAgICAgIHNlY3VyaXR5Q29udGV4dDogbnVsbCxcbiAgICAgICAgc3VmZml4OiBudWxsXG4gICAgICB9O1xuICAgIH1cbiAgfVxuICBjb25zdCBvdXRwdXREZWZzOiBPdXRwdXREZWZbXSA9IFtdO1xuICBpZiAob3V0cHV0cykge1xuICAgIGZvciAobGV0IHByb3BOYW1lIGluIG91dHB1dHMpIHtcbiAgICAgIG91dHB1dERlZnMucHVzaChcbiAgICAgICAgICB7dHlwZTogT3V0cHV0VHlwZS5EaXJlY3RpdmVPdXRwdXQsIHByb3BOYW1lLCB0YXJnZXQ6IG51bGwsIGV2ZW50TmFtZTogb3V0cHV0c1twcm9wTmFtZV19KTtcbiAgICB9XG4gIH1cbiAgZmxhZ3MgfD0gTm9kZUZsYWdzLlR5cGVEaXJlY3RpdmU7XG4gIHJldHVybiBfZGVmKFxuICAgICAgY2hlY2tJbmRleCwgZmxhZ3MsIG1hdGNoZWRRdWVyaWVzLCBjaGlsZENvdW50LCBjdG9yLCBjdG9yLCBkZXBzLCBiaW5kaW5ncywgb3V0cHV0RGVmcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwaXBlRGVmKGZsYWdzOiBOb2RlRmxhZ3MsIGN0b3I6IGFueSwgZGVwczogKFtEZXBGbGFncywgYW55XSB8IGFueSlbXSk6IE5vZGVEZWYge1xuICBmbGFncyB8PSBOb2RlRmxhZ3MuVHlwZVBpcGU7XG4gIHJldHVybiBfZGVmKC0xLCBmbGFncywgbnVsbCwgMCwgY3RvciwgY3RvciwgZGVwcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlckRlZihcbiAgICBmbGFnczogTm9kZUZsYWdzLCBtYXRjaGVkUXVlcmllczogbnVsbCB8IFtzdHJpbmcgfCBudW1iZXIsIFF1ZXJ5VmFsdWVUeXBlXVtdLCB0b2tlbjogYW55LFxuICAgIHZhbHVlOiBhbnksIGRlcHM6IChbRGVwRmxhZ3MsIGFueV0gfCBhbnkpW10pOiBOb2RlRGVmIHtcbiAgcmV0dXJuIF9kZWYoLTEsIGZsYWdzLCBtYXRjaGVkUXVlcmllcywgMCwgdG9rZW4sIHZhbHVlLCBkZXBzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9kZWYoXG4gICAgY2hlY2tJbmRleDogbnVtYmVyLCBmbGFnczogTm9kZUZsYWdzLFxuICAgIG1hdGNoZWRRdWVyaWVzRHNsOiBbc3RyaW5nIHwgbnVtYmVyLCBRdWVyeVZhbHVlVHlwZV1bXSB8IG51bGwsIGNoaWxkQ291bnQ6IG51bWJlciwgdG9rZW46IGFueSxcbiAgICB2YWx1ZTogYW55LCBkZXBzOiAoW0RlcEZsYWdzLCBhbnldIHwgYW55KVtdLCBiaW5kaW5ncz86IEJpbmRpbmdEZWZbXSxcbiAgICBvdXRwdXRzPzogT3V0cHV0RGVmW10pOiBOb2RlRGVmIHtcbiAgY29uc3Qge21hdGNoZWRRdWVyaWVzLCByZWZlcmVuY2VzLCBtYXRjaGVkUXVlcnlJZHN9ID0gc3BsaXRNYXRjaGVkUXVlcmllc0RzbChtYXRjaGVkUXVlcmllc0RzbCk7XG4gIGlmICghb3V0cHV0cykge1xuICAgIG91dHB1dHMgPSBbXTtcbiAgfVxuICBpZiAoIWJpbmRpbmdzKSB7XG4gICAgYmluZGluZ3MgPSBbXTtcbiAgfVxuICAvLyBOZWVkIHRvIHJlc29sdmUgZm9yd2FyZFJlZnMgYXMgZS5nLiBmb3IgYHVzZVZhbHVlYCB3ZVxuICAvLyBsb3dlcmVkIHRoZSBleHByZXNzaW9uIGFuZCB0aGVuIHN0b3BwZWQgZXZhbHVhdGluZyBpdCxcbiAgLy8gaS5lLiBhbHNvIGRpZG4ndCB1bndyYXAgaXQuXG4gIHZhbHVlID0gcmVzb2x2ZUZvcndhcmRSZWYodmFsdWUpO1xuXG4gIGNvbnN0IGRlcERlZnMgPSBzcGxpdERlcHNEc2woZGVwcywgc3RyaW5naWZ5KHRva2VuKSk7XG5cbiAgcmV0dXJuIHtcbiAgICAvLyB3aWxsIGJldCBzZXQgYnkgdGhlIHZpZXcgZGVmaW5pdGlvblxuICAgIG5vZGVJbmRleDogLTEsXG4gICAgcGFyZW50OiBudWxsLFxuICAgIHJlbmRlclBhcmVudDogbnVsbCxcbiAgICBiaW5kaW5nSW5kZXg6IC0xLFxuICAgIG91dHB1dEluZGV4OiAtMSxcbiAgICAvLyByZWd1bGFyIHZhbHVlc1xuICAgIGNoZWNrSW5kZXgsXG4gICAgZmxhZ3MsXG4gICAgY2hpbGRGbGFnczogMCxcbiAgICBkaXJlY3RDaGlsZEZsYWdzOiAwLFxuICAgIGNoaWxkTWF0Y2hlZFF1ZXJpZXM6IDAsIG1hdGNoZWRRdWVyaWVzLCBtYXRjaGVkUXVlcnlJZHMsIHJlZmVyZW5jZXMsXG4gICAgbmdDb250ZW50SW5kZXg6IC0xLCBjaGlsZENvdW50LCBiaW5kaW5ncyxcbiAgICBiaW5kaW5nRmxhZ3M6IGNhbGNCaW5kaW5nRmxhZ3MoYmluZGluZ3MpLCBvdXRwdXRzLFxuICAgIGVsZW1lbnQ6IG51bGwsXG4gICAgcHJvdmlkZXI6IHt0b2tlbiwgdmFsdWUsIGRlcHM6IGRlcERlZnN9LFxuICAgIHRleHQ6IG51bGwsXG4gICAgcXVlcnk6IG51bGwsXG4gICAgbmdDb250ZW50OiBudWxsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQcm92aWRlckluc3RhbmNlKHZpZXc6IFZpZXdEYXRhLCBkZWY6IE5vZGVEZWYpOiBhbnkge1xuICByZXR1cm4gX2NyZWF0ZVByb3ZpZGVySW5zdGFuY2UodmlldywgZGVmKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBpcGVJbnN0YW5jZSh2aWV3OiBWaWV3RGF0YSwgZGVmOiBOb2RlRGVmKTogYW55IHtcbiAgLy8gZGVwcyBhcmUgbG9va2VkIHVwIGZyb20gY29tcG9uZW50LlxuICBsZXQgY29tcFZpZXcgPSB2aWV3O1xuICB3aGlsZSAoY29tcFZpZXcucGFyZW50ICYmICFpc0NvbXBvbmVudFZpZXcoY29tcFZpZXcpKSB7XG4gICAgY29tcFZpZXcgPSBjb21wVmlldy5wYXJlbnQ7XG4gIH1cbiAgLy8gcGlwZXMgY2FuIHNlZSB0aGUgcHJpdmF0ZSBzZXJ2aWNlcyBvZiB0aGUgY29tcG9uZW50XG4gIGNvbnN0IGFsbG93UHJpdmF0ZVNlcnZpY2VzID0gdHJ1ZTtcbiAgLy8gcGlwZXMgYXJlIGFsd2F5cyBlYWdlciBhbmQgY2xhc3NlcyFcbiAgcmV0dXJuIGNyZWF0ZUNsYXNzKFxuICAgICAgY29tcFZpZXcucGFyZW50ICEsIHZpZXdQYXJlbnRFbChjb21wVmlldykgISwgYWxsb3dQcml2YXRlU2VydmljZXMsIGRlZi5wcm92aWRlciAhLnZhbHVlLFxuICAgICAgZGVmLnByb3ZpZGVyICEuZGVwcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVEaXJlY3RpdmVJbnN0YW5jZSh2aWV3OiBWaWV3RGF0YSwgZGVmOiBOb2RlRGVmKTogYW55IHtcbiAgLy8gY29tcG9uZW50cyBjYW4gc2VlIG90aGVyIHByaXZhdGUgc2VydmljZXMsIG90aGVyIGRpcmVjdGl2ZXMgY2FuJ3QuXG4gIGNvbnN0IGFsbG93UHJpdmF0ZVNlcnZpY2VzID0gKGRlZi5mbGFncyAmIE5vZGVGbGFncy5Db21wb25lbnQpID4gMDtcbiAgLy8gZGlyZWN0aXZlcyBhcmUgYWx3YXlzIGVhZ2VyIGFuZCBjbGFzc2VzIVxuICBjb25zdCBpbnN0YW5jZSA9IGNyZWF0ZUNsYXNzKFxuICAgICAgdmlldywgZGVmLnBhcmVudCAhLCBhbGxvd1ByaXZhdGVTZXJ2aWNlcywgZGVmLnByb3ZpZGVyICEudmFsdWUsIGRlZi5wcm92aWRlciAhLmRlcHMpO1xuICBpZiAoZGVmLm91dHB1dHMubGVuZ3RoKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZWYub3V0cHV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3Qgb3V0cHV0ID0gZGVmLm91dHB1dHNbaV07XG4gICAgICBjb25zdCBvdXRwdXRPYnNlcnZhYmxlID0gaW5zdGFuY2Vbb3V0cHV0LnByb3BOYW1lICFdO1xuICAgICAgaWYgKGlzT2JzZXJ2YWJsZShvdXRwdXRPYnNlcnZhYmxlKSkge1xuICAgICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSBvdXRwdXRPYnNlcnZhYmxlLnN1YnNjcmliZShcbiAgICAgICAgICAgIGV2ZW50SGFuZGxlckNsb3N1cmUodmlldywgZGVmLnBhcmVudCAhLm5vZGVJbmRleCwgb3V0cHV0LmV2ZW50TmFtZSkpO1xuICAgICAgICB2aWV3LmRpc3Bvc2FibGVzICFbZGVmLm91dHB1dEluZGV4ICsgaV0gPSBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUuYmluZChzdWJzY3JpcHRpb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEBPdXRwdXQgJHtvdXRwdXQucHJvcE5hbWV9IG5vdCBpbml0aWFsaXplZCBpbiAnJHtpbnN0YW5jZS5jb25zdHJ1Y3Rvci5uYW1lfScuYCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBpbnN0YW5jZTtcbn1cblxuZnVuY3Rpb24gZXZlbnRIYW5kbGVyQ2xvc3VyZSh2aWV3OiBWaWV3RGF0YSwgaW5kZXg6IG51bWJlciwgZXZlbnROYW1lOiBzdHJpbmcpIHtcbiAgcmV0dXJuIChldmVudDogYW55KSA9PiBkaXNwYXRjaEV2ZW50KHZpZXcsIGluZGV4LCBldmVudE5hbWUsIGV2ZW50KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrQW5kVXBkYXRlRGlyZWN0aXZlSW5saW5lKFxuICAgIHZpZXc6IFZpZXdEYXRhLCBkZWY6IE5vZGVEZWYsIHYwOiBhbnksIHYxOiBhbnksIHYyOiBhbnksIHYzOiBhbnksIHY0OiBhbnksIHY1OiBhbnksIHY2OiBhbnksXG4gICAgdjc6IGFueSwgdjg6IGFueSwgdjk6IGFueSk6IGJvb2xlYW4ge1xuICBjb25zdCBwcm92aWRlckRhdGEgPSBhc1Byb3ZpZGVyRGF0YSh2aWV3LCBkZWYubm9kZUluZGV4KTtcbiAgY29uc3QgZGlyZWN0aXZlID0gcHJvdmlkZXJEYXRhLmluc3RhbmNlO1xuICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xuICBsZXQgY2hhbmdlczogU2ltcGxlQ2hhbmdlcyA9IHVuZGVmaW5lZCAhO1xuICBjb25zdCBiaW5kTGVuID0gZGVmLmJpbmRpbmdzLmxlbmd0aDtcbiAgaWYgKGJpbmRMZW4gPiAwICYmIGNoZWNrQmluZGluZyh2aWV3LCBkZWYsIDAsIHYwKSkge1xuICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIGNoYW5nZXMgPSB1cGRhdGVQcm9wKHZpZXcsIHByb3ZpZGVyRGF0YSwgZGVmLCAwLCB2MCwgY2hhbmdlcyk7XG4gIH1cbiAgaWYgKGJpbmRMZW4gPiAxICYmIGNoZWNrQmluZGluZyh2aWV3LCBkZWYsIDEsIHYxKSkge1xuICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIGNoYW5nZXMgPSB1cGRhdGVQcm9wKHZpZXcsIHByb3ZpZGVyRGF0YSwgZGVmLCAxLCB2MSwgY2hhbmdlcyk7XG4gIH1cbiAgaWYgKGJpbmRMZW4gPiAyICYmIGNoZWNrQmluZGluZyh2aWV3LCBkZWYsIDIsIHYyKSkge1xuICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIGNoYW5nZXMgPSB1cGRhdGVQcm9wKHZpZXcsIHByb3ZpZGVyRGF0YSwgZGVmLCAyLCB2MiwgY2hhbmdlcyk7XG4gIH1cbiAgaWYgKGJpbmRMZW4gPiAzICYmIGNoZWNrQmluZGluZyh2aWV3LCBkZWYsIDMsIHYzKSkge1xuICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIGNoYW5nZXMgPSB1cGRhdGVQcm9wKHZpZXcsIHByb3ZpZGVyRGF0YSwgZGVmLCAzLCB2MywgY2hhbmdlcyk7XG4gIH1cbiAgaWYgKGJpbmRMZW4gPiA0ICYmIGNoZWNrQmluZGluZyh2aWV3LCBkZWYsIDQsIHY0KSkge1xuICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIGNoYW5nZXMgPSB1cGRhdGVQcm9wKHZpZXcsIHByb3ZpZGVyRGF0YSwgZGVmLCA0LCB2NCwgY2hhbmdlcyk7XG4gIH1cbiAgaWYgKGJpbmRMZW4gPiA1ICYmIGNoZWNrQmluZGluZyh2aWV3LCBkZWYsIDUsIHY1KSkge1xuICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIGNoYW5nZXMgPSB1cGRhdGVQcm9wKHZpZXcsIHByb3ZpZGVyRGF0YSwgZGVmLCA1LCB2NSwgY2hhbmdlcyk7XG4gIH1cbiAgaWYgKGJpbmRMZW4gPiA2ICYmIGNoZWNrQmluZGluZyh2aWV3LCBkZWYsIDYsIHY2KSkge1xuICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIGNoYW5nZXMgPSB1cGRhdGVQcm9wKHZpZXcsIHByb3ZpZGVyRGF0YSwgZGVmLCA2LCB2NiwgY2hhbmdlcyk7XG4gIH1cbiAgaWYgKGJpbmRMZW4gPiA3ICYmIGNoZWNrQmluZGluZyh2aWV3LCBkZWYsIDcsIHY3KSkge1xuICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIGNoYW5nZXMgPSB1cGRhdGVQcm9wKHZpZXcsIHByb3ZpZGVyRGF0YSwgZGVmLCA3LCB2NywgY2hhbmdlcyk7XG4gIH1cbiAgaWYgKGJpbmRMZW4gPiA4ICYmIGNoZWNrQmluZGluZyh2aWV3LCBkZWYsIDgsIHY4KSkge1xuICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIGNoYW5nZXMgPSB1cGRhdGVQcm9wKHZpZXcsIHByb3ZpZGVyRGF0YSwgZGVmLCA4LCB2OCwgY2hhbmdlcyk7XG4gIH1cbiAgaWYgKGJpbmRMZW4gPiA5ICYmIGNoZWNrQmluZGluZyh2aWV3LCBkZWYsIDksIHY5KSkge1xuICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIGNoYW5nZXMgPSB1cGRhdGVQcm9wKHZpZXcsIHByb3ZpZGVyRGF0YSwgZGVmLCA5LCB2OSwgY2hhbmdlcyk7XG4gIH1cbiAgaWYgKGNoYW5nZXMpIHtcbiAgICBkaXJlY3RpdmUubmdPbkNoYW5nZXMoY2hhbmdlcyk7XG4gIH1cbiAgaWYgKChkZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuT25Jbml0KSAmJlxuICAgICAgc2hvdWxkQ2FsbExpZmVjeWNsZUluaXRIb29rKHZpZXcsIFZpZXdTdGF0ZS5Jbml0U3RhdGVfQ2FsbGluZ09uSW5pdCwgZGVmLm5vZGVJbmRleCkpIHtcbiAgICBkaXJlY3RpdmUubmdPbkluaXQoKTtcbiAgfVxuICBpZiAoZGVmLmZsYWdzICYgTm9kZUZsYWdzLkRvQ2hlY2spIHtcbiAgICBkaXJlY3RpdmUubmdEb0NoZWNrKCk7XG4gIH1cbiAgcmV0dXJuIGNoYW5nZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0FuZFVwZGF0ZURpcmVjdGl2ZUR5bmFtaWMoXG4gICAgdmlldzogVmlld0RhdGEsIGRlZjogTm9kZURlZiwgdmFsdWVzOiBhbnlbXSk6IGJvb2xlYW4ge1xuICBjb25zdCBwcm92aWRlckRhdGEgPSBhc1Byb3ZpZGVyRGF0YSh2aWV3LCBkZWYubm9kZUluZGV4KTtcbiAgY29uc3QgZGlyZWN0aXZlID0gcHJvdmlkZXJEYXRhLmluc3RhbmNlO1xuICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xuICBsZXQgY2hhbmdlczogU2ltcGxlQ2hhbmdlcyA9IHVuZGVmaW5lZCAhO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChjaGVja0JpbmRpbmcodmlldywgZGVmLCBpLCB2YWx1ZXNbaV0pKSB7XG4gICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgIGNoYW5nZXMgPSB1cGRhdGVQcm9wKHZpZXcsIHByb3ZpZGVyRGF0YSwgZGVmLCBpLCB2YWx1ZXNbaV0sIGNoYW5nZXMpO1xuICAgIH1cbiAgfVxuICBpZiAoY2hhbmdlcykge1xuICAgIGRpcmVjdGl2ZS5uZ09uQ2hhbmdlcyhjaGFuZ2VzKTtcbiAgfVxuICBpZiAoKGRlZi5mbGFncyAmIE5vZGVGbGFncy5PbkluaXQpICYmXG4gICAgICBzaG91bGRDYWxsTGlmZWN5Y2xlSW5pdEhvb2sodmlldywgVmlld1N0YXRlLkluaXRTdGF0ZV9DYWxsaW5nT25Jbml0LCBkZWYubm9kZUluZGV4KSkge1xuICAgIGRpcmVjdGl2ZS5uZ09uSW5pdCgpO1xuICB9XG4gIGlmIChkZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuRG9DaGVjaykge1xuICAgIGRpcmVjdGl2ZS5uZ0RvQ2hlY2soKTtcbiAgfVxuICByZXR1cm4gY2hhbmdlZDtcbn1cblxuZnVuY3Rpb24gX2NyZWF0ZVByb3ZpZGVySW5zdGFuY2UodmlldzogVmlld0RhdGEsIGRlZjogTm9kZURlZik6IGFueSB7XG4gIC8vIHByaXZhdGUgc2VydmljZXMgY2FuIHNlZSBvdGhlciBwcml2YXRlIHNlcnZpY2VzXG4gIGNvbnN0IGFsbG93UHJpdmF0ZVNlcnZpY2VzID0gKGRlZi5mbGFncyAmIE5vZGVGbGFncy5Qcml2YXRlUHJvdmlkZXIpID4gMDtcbiAgY29uc3QgcHJvdmlkZXJEZWYgPSBkZWYucHJvdmlkZXI7XG4gIHN3aXRjaCAoZGVmLmZsYWdzICYgTm9kZUZsYWdzLlR5cGVzKSB7XG4gICAgY2FzZSBOb2RlRmxhZ3MuVHlwZUNsYXNzUHJvdmlkZXI6XG4gICAgICByZXR1cm4gY3JlYXRlQ2xhc3MoXG4gICAgICAgICAgdmlldywgZGVmLnBhcmVudCAhLCBhbGxvd1ByaXZhdGVTZXJ2aWNlcywgcHJvdmlkZXJEZWYgIS52YWx1ZSwgcHJvdmlkZXJEZWYgIS5kZXBzKTtcbiAgICBjYXNlIE5vZGVGbGFncy5UeXBlRmFjdG9yeVByb3ZpZGVyOlxuICAgICAgcmV0dXJuIGNhbGxGYWN0b3J5KFxuICAgICAgICAgIHZpZXcsIGRlZi5wYXJlbnQgISwgYWxsb3dQcml2YXRlU2VydmljZXMsIHByb3ZpZGVyRGVmICEudmFsdWUsIHByb3ZpZGVyRGVmICEuZGVwcyk7XG4gICAgY2FzZSBOb2RlRmxhZ3MuVHlwZVVzZUV4aXN0aW5nUHJvdmlkZXI6XG4gICAgICByZXR1cm4gcmVzb2x2ZURlcCh2aWV3LCBkZWYucGFyZW50ICEsIGFsbG93UHJpdmF0ZVNlcnZpY2VzLCBwcm92aWRlckRlZiAhLmRlcHNbMF0pO1xuICAgIGNhc2UgTm9kZUZsYWdzLlR5cGVWYWx1ZVByb3ZpZGVyOlxuICAgICAgcmV0dXJuIHByb3ZpZGVyRGVmICEudmFsdWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQ2xhc3MoXG4gICAgdmlldzogVmlld0RhdGEsIGVsRGVmOiBOb2RlRGVmLCBhbGxvd1ByaXZhdGVTZXJ2aWNlczogYm9vbGVhbiwgY3RvcjogYW55LCBkZXBzOiBEZXBEZWZbXSk6IGFueSB7XG4gIGNvbnN0IGxlbiA9IGRlcHMubGVuZ3RoO1xuICBzd2l0Y2ggKGxlbikge1xuICAgIGNhc2UgMDpcbiAgICAgIHJldHVybiBuZXcgY3RvcigpO1xuICAgIGNhc2UgMTpcbiAgICAgIHJldHVybiBuZXcgY3RvcihyZXNvbHZlRGVwKHZpZXcsIGVsRGVmLCBhbGxvd1ByaXZhdGVTZXJ2aWNlcywgZGVwc1swXSkpO1xuICAgIGNhc2UgMjpcbiAgICAgIHJldHVybiBuZXcgY3RvcihcbiAgICAgICAgICByZXNvbHZlRGVwKHZpZXcsIGVsRGVmLCBhbGxvd1ByaXZhdGVTZXJ2aWNlcywgZGVwc1swXSksXG4gICAgICAgICAgcmVzb2x2ZURlcCh2aWV3LCBlbERlZiwgYWxsb3dQcml2YXRlU2VydmljZXMsIGRlcHNbMV0pKTtcbiAgICBjYXNlIDM6XG4gICAgICByZXR1cm4gbmV3IGN0b3IoXG4gICAgICAgICAgcmVzb2x2ZURlcCh2aWV3LCBlbERlZiwgYWxsb3dQcml2YXRlU2VydmljZXMsIGRlcHNbMF0pLFxuICAgICAgICAgIHJlc29sdmVEZXAodmlldywgZWxEZWYsIGFsbG93UHJpdmF0ZVNlcnZpY2VzLCBkZXBzWzFdKSxcbiAgICAgICAgICByZXNvbHZlRGVwKHZpZXcsIGVsRGVmLCBhbGxvd1ByaXZhdGVTZXJ2aWNlcywgZGVwc1syXSkpO1xuICAgIGRlZmF1bHQ6XG4gICAgICBjb25zdCBkZXBWYWx1ZXMgPSBuZXcgQXJyYXkobGVuKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZGVwVmFsdWVzW2ldID0gcmVzb2x2ZURlcCh2aWV3LCBlbERlZiwgYWxsb3dQcml2YXRlU2VydmljZXMsIGRlcHNbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBjdG9yKC4uLmRlcFZhbHVlcyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2FsbEZhY3RvcnkoXG4gICAgdmlldzogVmlld0RhdGEsIGVsRGVmOiBOb2RlRGVmLCBhbGxvd1ByaXZhdGVTZXJ2aWNlczogYm9vbGVhbiwgZmFjdG9yeTogYW55LFxuICAgIGRlcHM6IERlcERlZltdKTogYW55IHtcbiAgY29uc3QgbGVuID0gZGVwcy5sZW5ndGg7XG4gIHN3aXRjaCAobGVuKSB7XG4gICAgY2FzZSAwOlxuICAgICAgcmV0dXJuIGZhY3RvcnkoKTtcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gZmFjdG9yeShyZXNvbHZlRGVwKHZpZXcsIGVsRGVmLCBhbGxvd1ByaXZhdGVTZXJ2aWNlcywgZGVwc1swXSkpO1xuICAgIGNhc2UgMjpcbiAgICAgIHJldHVybiBmYWN0b3J5KFxuICAgICAgICAgIHJlc29sdmVEZXAodmlldywgZWxEZWYsIGFsbG93UHJpdmF0ZVNlcnZpY2VzLCBkZXBzWzBdKSxcbiAgICAgICAgICByZXNvbHZlRGVwKHZpZXcsIGVsRGVmLCBhbGxvd1ByaXZhdGVTZXJ2aWNlcywgZGVwc1sxXSkpO1xuICAgIGNhc2UgMzpcbiAgICAgIHJldHVybiBmYWN0b3J5KFxuICAgICAgICAgIHJlc29sdmVEZXAodmlldywgZWxEZWYsIGFsbG93UHJpdmF0ZVNlcnZpY2VzLCBkZXBzWzBdKSxcbiAgICAgICAgICByZXNvbHZlRGVwKHZpZXcsIGVsRGVmLCBhbGxvd1ByaXZhdGVTZXJ2aWNlcywgZGVwc1sxXSksXG4gICAgICAgICAgcmVzb2x2ZURlcCh2aWV3LCBlbERlZiwgYWxsb3dQcml2YXRlU2VydmljZXMsIGRlcHNbMl0pKTtcbiAgICBkZWZhdWx0OlxuICAgICAgY29uc3QgZGVwVmFsdWVzID0gQXJyYXkobGVuKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZGVwVmFsdWVzW2ldID0gcmVzb2x2ZURlcCh2aWV3LCBlbERlZiwgYWxsb3dQcml2YXRlU2VydmljZXMsIGRlcHNbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhY3RvcnkoLi4uZGVwVmFsdWVzKTtcbiAgfVxufVxuXG4vLyBUaGlzIGRlZmF1bHQgdmFsdWUgaXMgd2hlbiBjaGVja2luZyB0aGUgaGllcmFyY2h5IGZvciBhIHRva2VuLlxuLy9cbi8vIEl0IG1lYW5zIGJvdGg6XG4vLyAtIHRoZSB0b2tlbiBpcyBub3QgcHJvdmlkZWQgYnkgdGhlIGN1cnJlbnQgaW5qZWN0b3IsXG4vLyAtIG9ubHkgdGhlIGVsZW1lbnQgaW5qZWN0b3JzIHNob3VsZCBiZSBjaGVja2VkIChpZSBkbyBub3QgY2hlY2sgbW9kdWxlIGluamVjdG9yc1xuLy9cbi8vICAgICAgICAgIG1vZDFcbi8vICAgICAgICAgL1xuLy8gICAgICAgZWwxICAgbW9kMlxuLy8gICAgICAgICBcXCAgL1xuLy8gICAgICAgICBlbDJcbi8vXG4vLyBXaGVuIHJlcXVlc3RpbmcgZWwyLmluamVjdG9yLmdldCh0b2tlbiksIHdlIHNob3VsZCBjaGVjayBpbiB0aGUgZm9sbG93aW5nIG9yZGVyIGFuZCByZXR1cm4gdGhlXG4vLyBmaXJzdCBmb3VuZCB2YWx1ZTpcbi8vIC0gZWwyLmluamVjdG9yLmdldCh0b2tlbiwgZGVmYXVsdClcbi8vIC0gZWwxLmluamVjdG9yLmdldCh0b2tlbiwgTk9UX0ZPVU5EX0NIRUNLX09OTFlfRUxFTUVOVF9JTkpFQ1RPUikgLT4gZG8gbm90IGNoZWNrIHRoZSBtb2R1bGVcbi8vIC0gbW9kMi5pbmplY3Rvci5nZXQodG9rZW4sIGRlZmF1bHQpXG5leHBvcnQgY29uc3QgTk9UX0ZPVU5EX0NIRUNLX09OTFlfRUxFTUVOVF9JTkpFQ1RPUiA9IHt9O1xuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZURlcChcbiAgICB2aWV3OiBWaWV3RGF0YSwgZWxEZWY6IE5vZGVEZWYsIGFsbG93UHJpdmF0ZVNlcnZpY2VzOiBib29sZWFuLCBkZXBEZWY6IERlcERlZixcbiAgICBub3RGb3VuZFZhbHVlOiBhbnkgPSBJbmplY3Rvci5USFJPV19JRl9OT1RfRk9VTkQpOiBhbnkge1xuICBpZiAoZGVwRGVmLmZsYWdzICYgRGVwRmxhZ3MuVmFsdWUpIHtcbiAgICByZXR1cm4gZGVwRGVmLnRva2VuO1xuICB9XG4gIGNvbnN0IHN0YXJ0VmlldyA9IHZpZXc7XG4gIGlmIChkZXBEZWYuZmxhZ3MgJiBEZXBGbGFncy5PcHRpb25hbCkge1xuICAgIG5vdEZvdW5kVmFsdWUgPSBudWxsO1xuICB9XG4gIGNvbnN0IHRva2VuS2V5ID0gZGVwRGVmLnRva2VuS2V5O1xuXG4gIGlmICh0b2tlbktleSA9PT0gQ2hhbmdlRGV0ZWN0b3JSZWZUb2tlbktleSkge1xuICAgIC8vIGRpcmVjdGl2ZXMgb24gdGhlIHNhbWUgZWxlbWVudCBhcyBhIGNvbXBvbmVudCBzaG91bGQgYmUgYWJsZSB0byBjb250cm9sIHRoZSBjaGFuZ2UgZGV0ZWN0b3JcbiAgICAvLyBvZiB0aGF0IGNvbXBvbmVudCBhcyB3ZWxsLlxuICAgIGFsbG93UHJpdmF0ZVNlcnZpY2VzID0gISEoZWxEZWYgJiYgZWxEZWYuZWxlbWVudCAhLmNvbXBvbmVudFZpZXcpO1xuICB9XG5cbiAgaWYgKGVsRGVmICYmIChkZXBEZWYuZmxhZ3MgJiBEZXBGbGFncy5Ta2lwU2VsZikpIHtcbiAgICBhbGxvd1ByaXZhdGVTZXJ2aWNlcyA9IGZhbHNlO1xuICAgIGVsRGVmID0gZWxEZWYucGFyZW50ICE7XG4gIH1cblxuICBsZXQgc2VhcmNoVmlldzogVmlld0RhdGF8bnVsbCA9IHZpZXc7XG4gIHdoaWxlIChzZWFyY2hWaWV3KSB7XG4gICAgaWYgKGVsRGVmKSB7XG4gICAgICBzd2l0Y2ggKHRva2VuS2V5KSB7XG4gICAgICAgIGNhc2UgUmVuZGVyZXJWMVRva2VuS2V5OiB7XG4gICAgICAgICAgY29uc3QgY29tcFZpZXcgPSBmaW5kQ29tcFZpZXcoc2VhcmNoVmlldywgZWxEZWYsIGFsbG93UHJpdmF0ZVNlcnZpY2VzKTtcbiAgICAgICAgICByZXR1cm4gY3JlYXRlUmVuZGVyZXJWMShjb21wVmlldyk7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBSZW5kZXJlcjJUb2tlbktleToge1xuICAgICAgICAgIGNvbnN0IGNvbXBWaWV3ID0gZmluZENvbXBWaWV3KHNlYXJjaFZpZXcsIGVsRGVmLCBhbGxvd1ByaXZhdGVTZXJ2aWNlcyk7XG4gICAgICAgICAgcmV0dXJuIGNvbXBWaWV3LnJlbmRlcmVyO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgRWxlbWVudFJlZlRva2VuS2V5OlxuICAgICAgICAgIHJldHVybiBuZXcgRWxlbWVudFJlZihhc0VsZW1lbnREYXRhKHNlYXJjaFZpZXcsIGVsRGVmLm5vZGVJbmRleCkucmVuZGVyRWxlbWVudCk7XG4gICAgICAgIGNhc2UgVmlld0NvbnRhaW5lclJlZlRva2VuS2V5OlxuICAgICAgICAgIHJldHVybiBhc0VsZW1lbnREYXRhKHNlYXJjaFZpZXcsIGVsRGVmLm5vZGVJbmRleCkudmlld0NvbnRhaW5lcjtcbiAgICAgICAgY2FzZSBUZW1wbGF0ZVJlZlRva2VuS2V5OiB7XG4gICAgICAgICAgaWYgKGVsRGVmLmVsZW1lbnQgIS50ZW1wbGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGFzRWxlbWVudERhdGEoc2VhcmNoVmlldywgZWxEZWYubm9kZUluZGV4KS50ZW1wbGF0ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBDaGFuZ2VEZXRlY3RvclJlZlRva2VuS2V5OiB7XG4gICAgICAgICAgbGV0IGNkVmlldyA9IGZpbmRDb21wVmlldyhzZWFyY2hWaWV3LCBlbERlZiwgYWxsb3dQcml2YXRlU2VydmljZXMpO1xuICAgICAgICAgIHJldHVybiBjcmVhdGVDaGFuZ2VEZXRlY3RvclJlZihjZFZpZXcpO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgSW5qZWN0b3JSZWZUb2tlbktleTpcbiAgICAgICAgY2FzZSBJTkpFQ1RPUlJlZlRva2VuS2V5OlxuICAgICAgICAgIHJldHVybiBjcmVhdGVJbmplY3RvcihzZWFyY2hWaWV3LCBlbERlZik7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29uc3QgcHJvdmlkZXJEZWYgPVxuICAgICAgICAgICAgICAoYWxsb3dQcml2YXRlU2VydmljZXMgPyBlbERlZi5lbGVtZW50ICEuYWxsUHJvdmlkZXJzIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxEZWYuZWxlbWVudCAhLnB1YmxpY1Byb3ZpZGVycykgIVt0b2tlbktleV07XG4gICAgICAgICAgaWYgKHByb3ZpZGVyRGVmKSB7XG4gICAgICAgICAgICBsZXQgcHJvdmlkZXJEYXRhID0gYXNQcm92aWRlckRhdGEoc2VhcmNoVmlldywgcHJvdmlkZXJEZWYubm9kZUluZGV4KTtcbiAgICAgICAgICAgIGlmICghcHJvdmlkZXJEYXRhKSB7XG4gICAgICAgICAgICAgIHByb3ZpZGVyRGF0YSA9IHtpbnN0YW5jZTogX2NyZWF0ZVByb3ZpZGVySW5zdGFuY2Uoc2VhcmNoVmlldywgcHJvdmlkZXJEZWYpfTtcbiAgICAgICAgICAgICAgc2VhcmNoVmlldy5ub2Rlc1twcm92aWRlckRlZi5ub2RlSW5kZXhdID0gcHJvdmlkZXJEYXRhIGFzIGFueTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm92aWRlckRhdGEuaW5zdGFuY2U7XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGFsbG93UHJpdmF0ZVNlcnZpY2VzID0gaXNDb21wb25lbnRWaWV3KHNlYXJjaFZpZXcpO1xuICAgIGVsRGVmID0gdmlld1BhcmVudEVsKHNlYXJjaFZpZXcpICE7XG4gICAgc2VhcmNoVmlldyA9IHNlYXJjaFZpZXcucGFyZW50ICE7XG5cbiAgICBpZiAoZGVwRGVmLmZsYWdzICYgRGVwRmxhZ3MuU2VsZikge1xuICAgICAgc2VhcmNoVmlldyA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgdmFsdWUgPSBzdGFydFZpZXcucm9vdC5pbmplY3Rvci5nZXQoZGVwRGVmLnRva2VuLCBOT1RfRk9VTkRfQ0hFQ0tfT05MWV9FTEVNRU5UX0lOSkVDVE9SKTtcblxuICBpZiAodmFsdWUgIT09IE5PVF9GT1VORF9DSEVDS19PTkxZX0VMRU1FTlRfSU5KRUNUT1IgfHxcbiAgICAgIG5vdEZvdW5kVmFsdWUgPT09IE5PVF9GT1VORF9DSEVDS19PTkxZX0VMRU1FTlRfSU5KRUNUT1IpIHtcbiAgICAvLyBSZXR1cm4gdGhlIHZhbHVlIGZyb20gdGhlIHJvb3QgZWxlbWVudCBpbmplY3RvciB3aGVuXG4gICAgLy8gLSBpdCBwcm92aWRlcyBpdFxuICAgIC8vICAgKHZhbHVlICE9PSBOT1RfRk9VTkRfQ0hFQ0tfT05MWV9FTEVNRU5UX0lOSkVDVE9SKVxuICAgIC8vIC0gdGhlIG1vZHVsZSBpbmplY3RvciBzaG91bGQgbm90IGJlIGNoZWNrZWRcbiAgICAvLyAgIChub3RGb3VuZFZhbHVlID09PSBOT1RfRk9VTkRfQ0hFQ0tfT05MWV9FTEVNRU5UX0lOSkVDVE9SKVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIHJldHVybiBzdGFydFZpZXcucm9vdC5uZ01vZHVsZS5pbmplY3Rvci5nZXQoZGVwRGVmLnRva2VuLCBub3RGb3VuZFZhbHVlKTtcbn1cblxuZnVuY3Rpb24gZmluZENvbXBWaWV3KHZpZXc6IFZpZXdEYXRhLCBlbERlZjogTm9kZURlZiwgYWxsb3dQcml2YXRlU2VydmljZXM6IGJvb2xlYW4pIHtcbiAgbGV0IGNvbXBWaWV3OiBWaWV3RGF0YTtcbiAgaWYgKGFsbG93UHJpdmF0ZVNlcnZpY2VzKSB7XG4gICAgY29tcFZpZXcgPSBhc0VsZW1lbnREYXRhKHZpZXcsIGVsRGVmLm5vZGVJbmRleCkuY29tcG9uZW50VmlldztcbiAgfSBlbHNlIHtcbiAgICBjb21wVmlldyA9IHZpZXc7XG4gICAgd2hpbGUgKGNvbXBWaWV3LnBhcmVudCAmJiAhaXNDb21wb25lbnRWaWV3KGNvbXBWaWV3KSkge1xuICAgICAgY29tcFZpZXcgPSBjb21wVmlldy5wYXJlbnQ7XG4gICAgfVxuICB9XG4gIHJldHVybiBjb21wVmlldztcbn1cblxuZnVuY3Rpb24gdXBkYXRlUHJvcChcbiAgICB2aWV3OiBWaWV3RGF0YSwgcHJvdmlkZXJEYXRhOiBQcm92aWRlckRhdGEsIGRlZjogTm9kZURlZiwgYmluZGluZ0lkeDogbnVtYmVyLCB2YWx1ZTogYW55LFxuICAgIGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiBTaW1wbGVDaGFuZ2VzIHtcbiAgaWYgKGRlZi5mbGFncyAmIE5vZGVGbGFncy5Db21wb25lbnQpIHtcbiAgICBjb25zdCBjb21wVmlldyA9IGFzRWxlbWVudERhdGEodmlldywgZGVmLnBhcmVudCAhLm5vZGVJbmRleCkuY29tcG9uZW50VmlldztcbiAgICBpZiAoY29tcFZpZXcuZGVmLmZsYWdzICYgVmlld0ZsYWdzLk9uUHVzaCkge1xuICAgICAgY29tcFZpZXcuc3RhdGUgfD0gVmlld1N0YXRlLkNoZWNrc0VuYWJsZWQ7XG4gICAgfVxuICB9XG4gIGNvbnN0IGJpbmRpbmcgPSBkZWYuYmluZGluZ3NbYmluZGluZ0lkeF07XG4gIGNvbnN0IHByb3BOYW1lID0gYmluZGluZy5uYW1lICE7XG4gIC8vIE5vdGU6IFRoaXMgaXMgc3RpbGwgc2FmZSB3aXRoIENsb3N1cmUgQ29tcGlsZXIgYXNcbiAgLy8gdGhlIHVzZXIgcGFzc2VkIGluIHRoZSBwcm9wZXJ0eSBuYW1lIGFzIGFuIG9iamVjdCBoYXMgdG8gYHByb3ZpZGVyRGVmYCxcbiAgLy8gc28gQ2xvc3VyZSBDb21waWxlciB3aWxsIGhhdmUgcmVuYW1lZCB0aGUgcHJvcGVydHkgY29ycmVjdGx5IGFscmVhZHkuXG4gIHByb3ZpZGVyRGF0YS5pbnN0YW5jZVtwcm9wTmFtZV0gPSB2YWx1ZTtcbiAgaWYgKGRlZi5mbGFncyAmIE5vZGVGbGFncy5PbkNoYW5nZXMpIHtcbiAgICBjaGFuZ2VzID0gY2hhbmdlcyB8fCB7fTtcbiAgICBjb25zdCBvbGRWYWx1ZSA9IFdyYXBwZWRWYWx1ZS51bndyYXAodmlldy5vbGRWYWx1ZXNbZGVmLmJpbmRpbmdJbmRleCArIGJpbmRpbmdJZHhdKTtcbiAgICBjb25zdCBiaW5kaW5nID0gZGVmLmJpbmRpbmdzW2JpbmRpbmdJZHhdO1xuICAgIGNoYW5nZXNbYmluZGluZy5ub25NaW5pZmllZE5hbWUgIV0gPVxuICAgICAgICBuZXcgU2ltcGxlQ2hhbmdlKG9sZFZhbHVlLCB2YWx1ZSwgKHZpZXcuc3RhdGUgJiBWaWV3U3RhdGUuRmlyc3RDaGVjaykgIT09IDApO1xuICB9XG4gIHZpZXcub2xkVmFsdWVzW2RlZi5iaW5kaW5nSW5kZXggKyBiaW5kaW5nSWR4XSA9IHZhbHVlO1xuICByZXR1cm4gY2hhbmdlcztcbn1cblxuLy8gVGhpcyBmdW5jdGlvbiBjYWxscyB0aGUgbmdBZnRlckNvbnRlbnRDaGVjaywgbmdBZnRlckNvbnRlbnRJbml0LFxuLy8gbmdBZnRlclZpZXdDaGVjaywgYW5kIG5nQWZ0ZXJWaWV3SW5pdCBsaWZlY3ljbGUgaG9va3MgKGRlcGVuZGluZyBvbiB0aGUgbm9kZVxuLy8gZmxhZ3MgaW4gbGlmZWN5Y2xlKS4gVW5saWtlIG5nRG9DaGVjaywgbmdPbkNoYW5nZXMgYW5kIG5nT25Jbml0LCB3aGljaCBhcmVcbi8vIGNhbGxlZCBkdXJpbmcgYSBwcmUtb3JkZXIgdHJhdmVyc2FsIG9mIHRoZSB2aWV3IHRyZWUgKHRoYXQgaXMgY2FsbGluZyB0aGVcbi8vIHBhcmVudCBob29rcyBiZWZvcmUgdGhlIGNoaWxkIGhvb2tzKSB0aGVzZSBldmVudHMgYXJlIHNlbnQgaW4gdXNpbmcgYVxuLy8gcG9zdC1vcmRlciB0cmF2ZXJzYWwgb2YgdGhlIHRyZWUgKGNoaWxkcmVuIGJlZm9yZSBwYXJlbnRzKS4gVGhpcyBjaGFuZ2VzIHRoZVxuLy8gbWVhbmluZyBvZiBpbml0SW5kZXggaW4gdGhlIHZpZXcgc3RhdGUuIEZvciBuZ09uSW5pdCwgaW5pdEluZGV4IHRyYWNrcyB0aGVcbi8vIGV4cGVjdGVkIG5vZGVJbmRleCB3aGljaCBhIG5nT25Jbml0IHNob3VsZCBiZSBjYWxsZWQuIFdoZW4gc2VuZGluZ1xuLy8gbmdBZnRlckNvbnRlbnRJbml0IGFuZCBuZ0FmdGVyVmlld0luaXQgaXQgaXMgdGhlIGV4cGVjdGVkIGNvdW50IG9mXG4vLyBuZ0FmdGVyQ29udGVudEluaXQgb3IgbmdBZnRlclZpZXdJbml0IG1ldGhvZHMgdGhhdCBoYXZlIGJlZW4gY2FsbGVkLiBUaGlzXG4vLyBlbnN1cmUgdGhhdCBkZXNwaXRlIGJlaW5nIGNhbGxlZCByZWN1cnNpdmVseSBvciBhZnRlciBwaWNraW5nIHVwIGFmdGVyIGFuXG4vLyBleGNlcHRpb24sIHRoZSBuZ0FmdGVyQ29udGVudEluaXQgb3IgbmdBZnRlclZpZXdJbml0IHdpbGwgYmUgY2FsbGVkIG9uIHRoZVxuLy8gY29ycmVjdCBub2Rlcy4gQ29uc2lkZXIgZm9yIGV4YW1wbGUsIHRoZSBmb2xsb3dpbmcgKHdoZXJlIEUgaXMgYW4gZWxlbWVudFxuLy8gYW5kIEQgaXMgYSBkaXJlY3RpdmUpXG4vLyAgVHJlZTogICAgICAgcHJlLW9yZGVyIGluZGV4ICBwb3N0LW9yZGVyIGluZGV4XG4vLyAgICBFMSAgICAgICAgMCAgICAgICAgICAgICAgICA2XG4vLyAgICAgIEUyICAgICAgMSAgICAgICAgICAgICAgICAxXG4vLyAgICAgICBEMyAgICAgMiAgICAgICAgICAgICAgICAwXG4vLyAgICAgIEU0ICAgICAgMyAgICAgICAgICAgICAgICA1XG4vLyAgICAgICBFNSAgICAgNCAgICAgICAgICAgICAgICA0XG4vLyAgICAgICAgRTYgICAgNSAgICAgICAgICAgICAgICAyXG4vLyAgICAgICAgRTcgICAgNiAgICAgICAgICAgICAgICAzXG4vLyBBcyBjYW4gYmUgc2VlbiwgdGhlIHBvc3Qtb3JkZXIgaW5kZXggaGFzIGFuIHVuY2xlYXIgcmVsYXRpb25zaGlwIHRvIHRoZVxuLy8gcHJlLW9yZGVyIGluZGV4IChwb3N0T3JkZXJJbmRleCA9PT0gcHJlT3JkZXJJbmRleCAtIHBhcmVudENvdW50ICtcbi8vIGNoaWxkQ291bnQpLiBTaW5jZSBudW1iZXIgb2YgY2FsbHMgdG8gbmdBZnRlckNvbnRlbnRJbml0IGFuZCBuZ0FmdGVyVmlld0luaXRcbi8vIGFyZSBzdGFibGUgKHdpbGwgYmUgdGhlIHNhbWUgZm9yIHRoZSBzYW1lIHZpZXcgcmVnYXJkbGVzcyBvZiBleGNlcHRpb25zIG9yXG4vLyByZWN1cnNpb24pIHdlIGp1c3QgbmVlZCB0byBjb3VudCB0aGVtIHdoaWNoIHdpbGwgcm91Z2hseSBjb3JyZXNwb25kIHRvIHRoZVxuLy8gcG9zdC1vcmRlciBpbmRleCAoaXQgc2tpcHMgZWxlbWVudHMgYW5kIGRpcmVjdGl2ZXMgdGhhdCBkbyBub3QgaGF2ZVxuLy8gbGlmZWN5Y2xlIGhvb2tzKS5cbi8vXG4vLyBGb3IgZXhhbXBsZSwgaWYgYW4gZXhjZXB0aW9uIGlzIHJhaXNlZCBpbiB0aGUgRTYub25BZnRlclZpZXdJbml0KCkgdGhlXG4vLyBpbml0SW5kZXggaXMgbGVmdCBhdCAzIChieSBzaG91bGRDYWxsTGlmZWN5Y2xlSW5pdEhvb2soKSB3aGljaCBzZXQgaXQgdG9cbi8vIGluaXRJbmRleCArIDEpLiBXaGVuIGNoZWNrQW5kVXBkYXRlVmlldygpIGlzIGNhbGxlZCBhZ2FpbiBEMywgRTIgYW5kIEU2IHdpbGxcbi8vIG5vdCBoYXZlIHRoZWlyIG5nQWZ0ZXJWaWV3SW5pdCgpIGNhbGxlZCBidXQsIHN0YXJ0aW5nIHdpdGggRTcsIHRoZSByZXN0IG9mXG4vLyB0aGUgdmlldyB3aWxsIGJlZ2luIGdldHRpbmcgbmdBZnRlclZpZXdJbml0KCkgY2FsbGVkIHVudGlsIGEgY2hlY2sgYW5kXG4vLyBwYXNzIGlzIGNvbXBsZXRlLlxuLy9cbi8vIFRoaXMgYWxnb3J0aGltIGFsc28gaGFuZGxlcyByZWN1cnNpb24uIENvbnNpZGVyIGlmIEU0J3MgbmdBZnRlclZpZXdJbml0KClcbi8vIGluZGlyZWN0bHkgY2FsbHMgRTEncyBDaGFuZ2VEZXRlY3RvclJlZi5kZXRlY3RDaGFuZ2VzKCkuIFRoZSBleHBlY3RlZFxuLy8gaW5pdEluZGV4IGlzIHNldCB0byA2LCB0aGUgcmVjdXNpdmUgY2hlY2tBbmRVcGRhdGVWaWV3KCkgc3RhcnRzIHdhbGsgYWdhaW4uXG4vLyBEMywgRTIsIEU2LCBFNywgRTUgYW5kIEU0IGFyZSBza2lwcGVkLCBuZ0FmdGVyVmlld0luaXQoKSBpcyBjYWxsZWQgb24gRTEuXG4vLyBXaGVuIHRoZSByZWN1cnNpb24gcmV0dXJucyB0aGUgaW5pdEluZGV4IHdpbGwgYmUgNyBzbyBFMSBpcyBza2lwcGVkIGFzIGl0XG4vLyBoYXMgYWxyZWFkeSBiZWVuIGNhbGxlZCBpbiB0aGUgcmVjdXJzaXZlbHkgY2FsbGVkIGNoZWNrQW5VcGRhdGVWaWV3KCkuXG5leHBvcnQgZnVuY3Rpb24gY2FsbExpZmVjeWNsZUhvb2tzQ2hpbGRyZW5GaXJzdCh2aWV3OiBWaWV3RGF0YSwgbGlmZWN5Y2xlczogTm9kZUZsYWdzKSB7XG4gIGlmICghKHZpZXcuZGVmLm5vZGVGbGFncyAmIGxpZmVjeWNsZXMpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IG5vZGVzID0gdmlldy5kZWYubm9kZXM7XG4gIGxldCBpbml0SW5kZXggPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgbm9kZURlZiA9IG5vZGVzW2ldO1xuICAgIGxldCBwYXJlbnQgPSBub2RlRGVmLnBhcmVudDtcbiAgICBpZiAoIXBhcmVudCAmJiBub2RlRGVmLmZsYWdzICYgbGlmZWN5Y2xlcykge1xuICAgICAgLy8gbWF0Y2hpbmcgcm9vdCBub2RlIChlLmcuIGEgcGlwZSlcbiAgICAgIGNhbGxQcm92aWRlckxpZmVjeWNsZXModmlldywgaSwgbm9kZURlZi5mbGFncyAmIGxpZmVjeWNsZXMsIGluaXRJbmRleCsrKTtcbiAgICB9XG4gICAgaWYgKChub2RlRGVmLmNoaWxkRmxhZ3MgJiBsaWZlY3ljbGVzKSA9PT0gMCkge1xuICAgICAgLy8gbm8gY2hpbGQgbWF0Y2hlcyBvbmUgb2YgdGhlIGxpZmVjeWNsZXNcbiAgICAgIGkgKz0gbm9kZURlZi5jaGlsZENvdW50O1xuICAgIH1cbiAgICB3aGlsZSAocGFyZW50ICYmIChwYXJlbnQuZmxhZ3MgJiBOb2RlRmxhZ3MuVHlwZUVsZW1lbnQpICYmXG4gICAgICAgICAgIGkgPT09IHBhcmVudC5ub2RlSW5kZXggKyBwYXJlbnQuY2hpbGRDb3VudCkge1xuICAgICAgLy8gbGFzdCBjaGlsZCBvZiBhbiBlbGVtZW50XG4gICAgICBpZiAocGFyZW50LmRpcmVjdENoaWxkRmxhZ3MgJiBsaWZlY3ljbGVzKSB7XG4gICAgICAgIGluaXRJbmRleCA9IGNhbGxFbGVtZW50UHJvdmlkZXJzTGlmZWN5Y2xlcyh2aWV3LCBwYXJlbnQsIGxpZmVjeWNsZXMsIGluaXRJbmRleCk7XG4gICAgICB9XG4gICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBjYWxsRWxlbWVudFByb3ZpZGVyc0xpZmVjeWNsZXMoXG4gICAgdmlldzogVmlld0RhdGEsIGVsRGVmOiBOb2RlRGVmLCBsaWZlY3ljbGVzOiBOb2RlRmxhZ3MsIGluaXRJbmRleDogbnVtYmVyKTogbnVtYmVyIHtcbiAgZm9yIChsZXQgaSA9IGVsRGVmLm5vZGVJbmRleCArIDE7IGkgPD0gZWxEZWYubm9kZUluZGV4ICsgZWxEZWYuY2hpbGRDb3VudDsgaSsrKSB7XG4gICAgY29uc3Qgbm9kZURlZiA9IHZpZXcuZGVmLm5vZGVzW2ldO1xuICAgIGlmIChub2RlRGVmLmZsYWdzICYgbGlmZWN5Y2xlcykge1xuICAgICAgY2FsbFByb3ZpZGVyTGlmZWN5Y2xlcyh2aWV3LCBpLCBub2RlRGVmLmZsYWdzICYgbGlmZWN5Y2xlcywgaW5pdEluZGV4KyspO1xuICAgIH1cbiAgICAvLyBvbmx5IHZpc2l0IGRpcmVjdCBjaGlsZHJlblxuICAgIGkgKz0gbm9kZURlZi5jaGlsZENvdW50O1xuICB9XG4gIHJldHVybiBpbml0SW5kZXg7XG59XG5cbmZ1bmN0aW9uIGNhbGxQcm92aWRlckxpZmVjeWNsZXMoXG4gICAgdmlldzogVmlld0RhdGEsIGluZGV4OiBudW1iZXIsIGxpZmVjeWNsZXM6IE5vZGVGbGFncywgaW5pdEluZGV4OiBudW1iZXIpIHtcbiAgY29uc3QgcHJvdmlkZXJEYXRhID0gYXNQcm92aWRlckRhdGEodmlldywgaW5kZXgpO1xuICBpZiAoIXByb3ZpZGVyRGF0YSkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBwcm92aWRlciA9IHByb3ZpZGVyRGF0YS5pbnN0YW5jZTtcbiAgaWYgKCFwcm92aWRlcikge1xuICAgIHJldHVybjtcbiAgfVxuICBTZXJ2aWNlcy5zZXRDdXJyZW50Tm9kZSh2aWV3LCBpbmRleCk7XG4gIGlmIChsaWZlY3ljbGVzICYgTm9kZUZsYWdzLkFmdGVyQ29udGVudEluaXQgJiZcbiAgICAgIHNob3VsZENhbGxMaWZlY3ljbGVJbml0SG9vayh2aWV3LCBWaWV3U3RhdGUuSW5pdFN0YXRlX0NhbGxpbmdBZnRlckNvbnRlbnRJbml0LCBpbml0SW5kZXgpKSB7XG4gICAgcHJvdmlkZXIubmdBZnRlckNvbnRlbnRJbml0KCk7XG4gIH1cbiAgaWYgKGxpZmVjeWNsZXMgJiBOb2RlRmxhZ3MuQWZ0ZXJDb250ZW50Q2hlY2tlZCkge1xuICAgIHByb3ZpZGVyLm5nQWZ0ZXJDb250ZW50Q2hlY2tlZCgpO1xuICB9XG4gIGlmIChsaWZlY3ljbGVzICYgTm9kZUZsYWdzLkFmdGVyVmlld0luaXQgJiZcbiAgICAgIHNob3VsZENhbGxMaWZlY3ljbGVJbml0SG9vayh2aWV3LCBWaWV3U3RhdGUuSW5pdFN0YXRlX0NhbGxpbmdBZnRlclZpZXdJbml0LCBpbml0SW5kZXgpKSB7XG4gICAgcHJvdmlkZXIubmdBZnRlclZpZXdJbml0KCk7XG4gIH1cbiAgaWYgKGxpZmVjeWNsZXMgJiBOb2RlRmxhZ3MuQWZ0ZXJWaWV3Q2hlY2tlZCkge1xuICAgIHByb3ZpZGVyLm5nQWZ0ZXJWaWV3Q2hlY2tlZCgpO1xuICB9XG4gIGlmIChsaWZlY3ljbGVzICYgTm9kZUZsYWdzLk9uRGVzdHJveSkge1xuICAgIHByb3ZpZGVyLm5nT25EZXN0cm95KCk7XG4gIH1cbn1cbiJdfQ==