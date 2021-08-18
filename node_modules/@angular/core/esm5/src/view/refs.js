/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { Injector } from '../di/injector';
import { InjectFlags } from '../di/injector_compatibility';
import { ComponentFactory, ComponentRef } from '../linker/component_factory';
import { ComponentFactoryBoundToModule, ComponentFactoryResolver } from '../linker/component_factory_resolver';
import { ElementRef } from '../linker/element_ref';
import { NgModuleRef } from '../linker/ng_module_factory';
import { TemplateRef } from '../linker/template_ref';
import { stringify } from '../util';
import { VERSION } from '../version';
import { callNgModuleLifecycle, initNgModule, resolveNgModuleDep } from './ng_module';
import { Services, asElementData, asProviderData, asTextData } from './types';
import { markParentViewsForCheck, resolveDefinition, rootRenderNodes, splitNamespace, tokenKey, viewParentEl } from './util';
import { attachEmbeddedView, detachEmbeddedView, moveEmbeddedView, renderDetachView } from './view_attach';
var EMPTY_CONTEXT = new Object();
// Attention: this function is called as top level function.
// Putting any logic in here will destroy closure tree shaking!
export function createComponentFactory(selector, componentType, viewDefFactory, inputs, outputs, ngContentSelectors) {
    return new ComponentFactory_(selector, componentType, viewDefFactory, inputs, outputs, ngContentSelectors);
}
export function getComponentViewDefinitionFactory(componentFactory) {
    return componentFactory.viewDefFactory;
}
var ComponentFactory_ = /** @class */ (function (_super) {
    tslib_1.__extends(ComponentFactory_, _super);
    function ComponentFactory_(selector, componentType, viewDefFactory, _inputs, _outputs, ngContentSelectors) {
        var _this = 
        // Attention: this ctor is called as top level function.
        // Putting any logic in here will destroy closure tree shaking!
        _super.call(this) || this;
        _this.selector = selector;
        _this.componentType = componentType;
        _this._inputs = _inputs;
        _this._outputs = _outputs;
        _this.ngContentSelectors = ngContentSelectors;
        _this.viewDefFactory = viewDefFactory;
        return _this;
    }
    Object.defineProperty(ComponentFactory_.prototype, "inputs", {
        get: function () {
            var inputsArr = [];
            var inputs = this._inputs;
            for (var propName in inputs) {
                var templateName = inputs[propName];
                inputsArr.push({ propName: propName, templateName: templateName });
            }
            return inputsArr;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComponentFactory_.prototype, "outputs", {
        get: function () {
            var outputsArr = [];
            for (var propName in this._outputs) {
                var templateName = this._outputs[propName];
                outputsArr.push({ propName: propName, templateName: templateName });
            }
            return outputsArr;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Creates a new component.
     */
    ComponentFactory_.prototype.create = function (injector, projectableNodes, rootSelectorOrNode, ngModule) {
        if (!ngModule) {
            throw new Error('ngModule should be provided');
        }
        var viewDef = resolveDefinition(this.viewDefFactory);
        var componentNodeIndex = viewDef.nodes[0].element.componentProvider.nodeIndex;
        var view = Services.createRootView(injector, projectableNodes || [], rootSelectorOrNode, viewDef, ngModule, EMPTY_CONTEXT);
        var component = asProviderData(view, componentNodeIndex).instance;
        if (rootSelectorOrNode) {
            view.renderer.setAttribute(asElementData(view, 0).renderElement, 'ng-version', VERSION.full);
        }
        return new ComponentRef_(view, new ViewRef_(view), component);
    };
    return ComponentFactory_;
}(ComponentFactory));
var ComponentRef_ = /** @class */ (function (_super) {
    tslib_1.__extends(ComponentRef_, _super);
    function ComponentRef_(_view, _viewRef, _component) {
        var _this = _super.call(this) || this;
        _this._view = _view;
        _this._viewRef = _viewRef;
        _this._component = _component;
        _this._elDef = _this._view.def.nodes[0];
        _this.hostView = _viewRef;
        _this.changeDetectorRef = _viewRef;
        _this.instance = _component;
        return _this;
    }
    Object.defineProperty(ComponentRef_.prototype, "location", {
        get: function () {
            return new ElementRef(asElementData(this._view, this._elDef.nodeIndex).renderElement);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComponentRef_.prototype, "injector", {
        get: function () { return new Injector_(this._view, this._elDef); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComponentRef_.prototype, "componentType", {
        get: function () { return this._component.constructor; },
        enumerable: true,
        configurable: true
    });
    ComponentRef_.prototype.destroy = function () { this._viewRef.destroy(); };
    ComponentRef_.prototype.onDestroy = function (callback) { this._viewRef.onDestroy(callback); };
    return ComponentRef_;
}(ComponentRef));
export function createViewContainerData(view, elDef, elData) {
    return new ViewContainerRef_(view, elDef, elData);
}
var ViewContainerRef_ = /** @class */ (function () {
    function ViewContainerRef_(_view, _elDef, _data) {
        this._view = _view;
        this._elDef = _elDef;
        this._data = _data;
        /**
         * @internal
         */
        this._embeddedViews = [];
    }
    Object.defineProperty(ViewContainerRef_.prototype, "element", {
        get: function () { return new ElementRef(this._data.renderElement); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewContainerRef_.prototype, "injector", {
        get: function () { return new Injector_(this._view, this._elDef); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewContainerRef_.prototype, "parentInjector", {
        /** @deprecated No replacement */
        get: function () {
            var view = this._view;
            var elDef = this._elDef.parent;
            while (!elDef && view) {
                elDef = viewParentEl(view);
                view = view.parent;
            }
            return view ? new Injector_(view, elDef) : new Injector_(this._view, null);
        },
        enumerable: true,
        configurable: true
    });
    ViewContainerRef_.prototype.clear = function () {
        var len = this._embeddedViews.length;
        for (var i = len - 1; i >= 0; i--) {
            var view = detachEmbeddedView(this._data, i);
            Services.destroyView(view);
        }
    };
    ViewContainerRef_.prototype.get = function (index) {
        var view = this._embeddedViews[index];
        if (view) {
            var ref = new ViewRef_(view);
            ref.attachToViewContainerRef(this);
            return ref;
        }
        return null;
    };
    Object.defineProperty(ViewContainerRef_.prototype, "length", {
        get: function () { return this._embeddedViews.length; },
        enumerable: true,
        configurable: true
    });
    ViewContainerRef_.prototype.createEmbeddedView = function (templateRef, context, index) {
        var viewRef = templateRef.createEmbeddedView(context || {});
        this.insert(viewRef, index);
        return viewRef;
    };
    ViewContainerRef_.prototype.createComponent = function (componentFactory, index, injector, projectableNodes, ngModuleRef) {
        var contextInjector = injector || this.parentInjector;
        if (!ngModuleRef && !(componentFactory instanceof ComponentFactoryBoundToModule)) {
            ngModuleRef = contextInjector.get(NgModuleRef);
        }
        var componentRef = componentFactory.create(contextInjector, projectableNodes, undefined, ngModuleRef);
        this.insert(componentRef.hostView, index);
        return componentRef;
    };
    ViewContainerRef_.prototype.insert = function (viewRef, index) {
        if (viewRef.destroyed) {
            throw new Error('Cannot insert a destroyed View in a ViewContainer!');
        }
        var viewRef_ = viewRef;
        var viewData = viewRef_._view;
        attachEmbeddedView(this._view, this._data, index, viewData);
        viewRef_.attachToViewContainerRef(this);
        return viewRef;
    };
    ViewContainerRef_.prototype.move = function (viewRef, currentIndex) {
        if (viewRef.destroyed) {
            throw new Error('Cannot move a destroyed View in a ViewContainer!');
        }
        var previousIndex = this._embeddedViews.indexOf(viewRef._view);
        moveEmbeddedView(this._data, previousIndex, currentIndex);
        return viewRef;
    };
    ViewContainerRef_.prototype.indexOf = function (viewRef) {
        return this._embeddedViews.indexOf(viewRef._view);
    };
    ViewContainerRef_.prototype.remove = function (index) {
        var viewData = detachEmbeddedView(this._data, index);
        if (viewData) {
            Services.destroyView(viewData);
        }
    };
    ViewContainerRef_.prototype.detach = function (index) {
        var view = detachEmbeddedView(this._data, index);
        return view ? new ViewRef_(view) : null;
    };
    return ViewContainerRef_;
}());
export function createChangeDetectorRef(view) {
    return new ViewRef_(view);
}
var ViewRef_ = /** @class */ (function () {
    function ViewRef_(_view) {
        this._view = _view;
        this._viewContainerRef = null;
        this._appRef = null;
    }
    Object.defineProperty(ViewRef_.prototype, "rootNodes", {
        get: function () { return rootRenderNodes(this._view); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewRef_.prototype, "context", {
        get: function () { return this._view.context; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewRef_.prototype, "destroyed", {
        get: function () { return (this._view.state & 128 /* Destroyed */) !== 0; },
        enumerable: true,
        configurable: true
    });
    ViewRef_.prototype.markForCheck = function () { markParentViewsForCheck(this._view); };
    ViewRef_.prototype.detach = function () { this._view.state &= ~4 /* Attached */; };
    ViewRef_.prototype.detectChanges = function () {
        var fs = this._view.root.rendererFactory;
        if (fs.begin) {
            fs.begin();
        }
        try {
            Services.checkAndUpdateView(this._view);
        }
        finally {
            if (fs.end) {
                fs.end();
            }
        }
    };
    ViewRef_.prototype.checkNoChanges = function () { Services.checkNoChangesView(this._view); };
    ViewRef_.prototype.reattach = function () { this._view.state |= 4 /* Attached */; };
    ViewRef_.prototype.onDestroy = function (callback) {
        if (!this._view.disposables) {
            this._view.disposables = [];
        }
        this._view.disposables.push(callback);
    };
    ViewRef_.prototype.destroy = function () {
        if (this._appRef) {
            this._appRef.detachView(this);
        }
        else if (this._viewContainerRef) {
            this._viewContainerRef.detach(this._viewContainerRef.indexOf(this));
        }
        Services.destroyView(this._view);
    };
    ViewRef_.prototype.detachFromAppRef = function () {
        this._appRef = null;
        renderDetachView(this._view);
        Services.dirtyParentQueries(this._view);
    };
    ViewRef_.prototype.attachToAppRef = function (appRef) {
        if (this._viewContainerRef) {
            throw new Error('This view is already attached to a ViewContainer!');
        }
        this._appRef = appRef;
    };
    ViewRef_.prototype.attachToViewContainerRef = function (vcRef) {
        if (this._appRef) {
            throw new Error('This view is already attached directly to the ApplicationRef!');
        }
        this._viewContainerRef = vcRef;
    };
    return ViewRef_;
}());
export { ViewRef_ };
export function createTemplateData(view, def) {
    return new TemplateRef_(view, def);
}
var TemplateRef_ = /** @class */ (function (_super) {
    tslib_1.__extends(TemplateRef_, _super);
    function TemplateRef_(_parentView, _def) {
        var _this = _super.call(this) || this;
        _this._parentView = _parentView;
        _this._def = _def;
        return _this;
    }
    TemplateRef_.prototype.createEmbeddedView = function (context) {
        return new ViewRef_(Services.createEmbeddedView(this._parentView, this._def, this._def.element.template, context));
    };
    Object.defineProperty(TemplateRef_.prototype, "elementRef", {
        get: function () {
            return new ElementRef(asElementData(this._parentView, this._def.nodeIndex).renderElement);
        },
        enumerable: true,
        configurable: true
    });
    return TemplateRef_;
}(TemplateRef));
export function createInjector(view, elDef) {
    return new Injector_(view, elDef);
}
var Injector_ = /** @class */ (function () {
    function Injector_(view, elDef) {
        this.view = view;
        this.elDef = elDef;
    }
    Injector_.prototype.get = function (token, notFoundValue) {
        if (notFoundValue === void 0) { notFoundValue = Injector.THROW_IF_NOT_FOUND; }
        var allowPrivateServices = this.elDef ? (this.elDef.flags & 33554432 /* ComponentView */) !== 0 : false;
        return Services.resolveDep(this.view, this.elDef, allowPrivateServices, { flags: 0 /* None */, token: token, tokenKey: tokenKey(token) }, notFoundValue);
    };
    return Injector_;
}());
export function nodeValue(view, index) {
    var def = view.def.nodes[index];
    if (def.flags & 1 /* TypeElement */) {
        var elData = asElementData(view, def.nodeIndex);
        return def.element.template ? elData.template : elData.renderElement;
    }
    else if (def.flags & 2 /* TypeText */) {
        return asTextData(view, def.nodeIndex).renderText;
    }
    else if (def.flags & (20224 /* CatProvider */ | 16 /* TypePipe */)) {
        return asProviderData(view, def.nodeIndex).instance;
    }
    throw new Error("Illegal state: read nodeValue for node index " + index);
}
export function createRendererV1(view) {
    return new RendererAdapter(view.renderer);
}
var RendererAdapter = /** @class */ (function () {
    function RendererAdapter(delegate) {
        this.delegate = delegate;
    }
    RendererAdapter.prototype.selectRootElement = function (selectorOrNode) {
        return this.delegate.selectRootElement(selectorOrNode);
    };
    RendererAdapter.prototype.createElement = function (parent, namespaceAndName) {
        var _a = tslib_1.__read(splitNamespace(namespaceAndName), 2), ns = _a[0], name = _a[1];
        var el = this.delegate.createElement(name, ns);
        if (parent) {
            this.delegate.appendChild(parent, el);
        }
        return el;
    };
    RendererAdapter.prototype.createViewRoot = function (hostElement) { return hostElement; };
    RendererAdapter.prototype.createTemplateAnchor = function (parentElement) {
        var comment = this.delegate.createComment('');
        if (parentElement) {
            this.delegate.appendChild(parentElement, comment);
        }
        return comment;
    };
    RendererAdapter.prototype.createText = function (parentElement, value) {
        var node = this.delegate.createText(value);
        if (parentElement) {
            this.delegate.appendChild(parentElement, node);
        }
        return node;
    };
    RendererAdapter.prototype.projectNodes = function (parentElement, nodes) {
        for (var i = 0; i < nodes.length; i++) {
            this.delegate.appendChild(parentElement, nodes[i]);
        }
    };
    RendererAdapter.prototype.attachViewAfter = function (node, viewRootNodes) {
        var parentElement = this.delegate.parentNode(node);
        var nextSibling = this.delegate.nextSibling(node);
        for (var i = 0; i < viewRootNodes.length; i++) {
            this.delegate.insertBefore(parentElement, viewRootNodes[i], nextSibling);
        }
    };
    RendererAdapter.prototype.detachView = function (viewRootNodes) {
        for (var i = 0; i < viewRootNodes.length; i++) {
            var node = viewRootNodes[i];
            var parentElement = this.delegate.parentNode(node);
            this.delegate.removeChild(parentElement, node);
        }
    };
    RendererAdapter.prototype.destroyView = function (hostElement, viewAllNodes) {
        for (var i = 0; i < viewAllNodes.length; i++) {
            this.delegate.destroyNode(viewAllNodes[i]);
        }
    };
    RendererAdapter.prototype.listen = function (renderElement, name, callback) {
        return this.delegate.listen(renderElement, name, callback);
    };
    RendererAdapter.prototype.listenGlobal = function (target, name, callback) {
        return this.delegate.listen(target, name, callback);
    };
    RendererAdapter.prototype.setElementProperty = function (renderElement, propertyName, propertyValue) {
        this.delegate.setProperty(renderElement, propertyName, propertyValue);
    };
    RendererAdapter.prototype.setElementAttribute = function (renderElement, namespaceAndName, attributeValue) {
        var _a = tslib_1.__read(splitNamespace(namespaceAndName), 2), ns = _a[0], name = _a[1];
        if (attributeValue != null) {
            this.delegate.setAttribute(renderElement, name, attributeValue, ns);
        }
        else {
            this.delegate.removeAttribute(renderElement, name, ns);
        }
    };
    RendererAdapter.prototype.setBindingDebugInfo = function (renderElement, propertyName, propertyValue) { };
    RendererAdapter.prototype.setElementClass = function (renderElement, className, isAdd) {
        if (isAdd) {
            this.delegate.addClass(renderElement, className);
        }
        else {
            this.delegate.removeClass(renderElement, className);
        }
    };
    RendererAdapter.prototype.setElementStyle = function (renderElement, styleName, styleValue) {
        if (styleValue != null) {
            this.delegate.setStyle(renderElement, styleName, styleValue);
        }
        else {
            this.delegate.removeStyle(renderElement, styleName);
        }
    };
    RendererAdapter.prototype.invokeElementMethod = function (renderElement, methodName, args) {
        renderElement[methodName].apply(renderElement, args);
    };
    RendererAdapter.prototype.setText = function (renderNode, text) { this.delegate.setValue(renderNode, text); };
    RendererAdapter.prototype.animate = function () { throw new Error('Renderer.animate is no longer supported!'); };
    return RendererAdapter;
}());
export function createNgModuleRef(moduleType, parent, bootstrapComponents, def) {
    return new NgModuleRef_(moduleType, parent, bootstrapComponents, def);
}
var NgModuleRef_ = /** @class */ (function () {
    function NgModuleRef_(_moduleType, _parent, _bootstrapComponents, _def) {
        this._moduleType = _moduleType;
        this._parent = _parent;
        this._bootstrapComponents = _bootstrapComponents;
        this._def = _def;
        this._destroyListeners = [];
        this._destroyed = false;
        this.injector = this;
        initNgModule(this);
    }
    NgModuleRef_.prototype.get = function (token, notFoundValue, injectFlags) {
        if (notFoundValue === void 0) { notFoundValue = Injector.THROW_IF_NOT_FOUND; }
        if (injectFlags === void 0) { injectFlags = InjectFlags.Default; }
        var flags = 0 /* None */;
        if (injectFlags & InjectFlags.SkipSelf) {
            flags |= 1 /* SkipSelf */;
        }
        else if (injectFlags & InjectFlags.Self) {
            flags |= 4 /* Self */;
        }
        return resolveNgModuleDep(this, { token: token, tokenKey: tokenKey(token), flags: flags }, notFoundValue);
    };
    Object.defineProperty(NgModuleRef_.prototype, "instance", {
        get: function () { return this.get(this._moduleType); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgModuleRef_.prototype, "componentFactoryResolver", {
        get: function () { return this.get(ComponentFactoryResolver); },
        enumerable: true,
        configurable: true
    });
    NgModuleRef_.prototype.destroy = function () {
        if (this._destroyed) {
            throw new Error("The ng module " + stringify(this.instance.constructor) + " has already been destroyed.");
        }
        this._destroyed = true;
        callNgModuleLifecycle(this, 131072 /* OnDestroy */);
        this._destroyListeners.forEach(function (listener) { return listener(); });
    };
    NgModuleRef_.prototype.onDestroy = function (callback) { this._destroyListeners.push(callback); };
    return NgModuleRef_;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmcy5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2NvcmUvc3JjL3ZpZXcvcmVmcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBSUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3hDLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUN6RCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsWUFBWSxFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDM0UsT0FBTyxFQUFDLDZCQUE2QixFQUFFLHdCQUF3QixFQUFDLE1BQU0sc0NBQXNDLENBQUM7QUFDN0csT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ2pELE9BQU8sRUFBc0IsV0FBVyxFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDN0UsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBS25ELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDbEMsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFlBQVksQ0FBQztBQUVuQyxPQUFPLEVBQUMscUJBQXFCLEVBQUUsWUFBWSxFQUFFLGtCQUFrQixFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3BGLE9BQU8sRUFBOEUsUUFBUSxFQUErRSxhQUFhLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUN0TyxPQUFPLEVBQUMsdUJBQXVCLEVBQUUsaUJBQWlCLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFDLE1BQU0sUUFBUSxDQUFDO0FBQzNILE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxrQkFBa0IsRUFBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV6RyxJQUFNLGFBQWEsR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDO0FB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QVcsQ0FBQyxJQUFJLEVBQUU7WUFDekMsS0FBSyxnQkFBaUIsQ0FBQztTQUN4QjtRQUNELE9BQU8sa0JBQWtCLENBQ3JCLElBQUksRUFBRSxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFDLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDcEYsQ0FBQztJQUVELHNCQUFJLGtDQUFRO2FBQVosY0FBaUIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBRXJELHNCQUFJLGtEQUF3QjthQUE1QixjQUFpQyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBRTdFLDhCQUFPLEdBQVA7UUFDRSxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDbkIsTUFBTSxJQUFJLEtBQUssQ0FDWCxtQkFBaUIsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLGlDQUE4QixDQUFDLENBQUM7U0FDMUY7UUFDRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztRQUN2QixxQkFBcUIsQ0FBQyxJQUFJLHlCQUFzQixDQUFDO1FBQ2pELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsVUFBQyxRQUFRLElBQUssT0FBQSxRQUFRLEVBQUUsRUFBVixDQUFVLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRUQsZ0NBQVMsR0FBVCxVQUFVLFFBQW9CLElBQVUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEYsbUJBQUM7QUFBRCxDQUFDLEFBN0NELElBNkNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FwcGxpY2F0aW9uUmVmfSBmcm9tICcuLi9hcHBsaWNhdGlvbl9yZWYnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3RvclJlZn0gZnJvbSAnLi4vY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uJztcbmltcG9ydCB7SW5qZWN0b3J9IGZyb20gJy4uL2RpL2luamVjdG9yJztcbmltcG9ydCB7SW5qZWN0RmxhZ3N9IGZyb20gJy4uL2RpL2luamVjdG9yX2NvbXBhdGliaWxpdHknO1xuaW1wb3J0IHtDb21wb25lbnRGYWN0b3J5LCBDb21wb25lbnRSZWZ9IGZyb20gJy4uL2xpbmtlci9jb21wb25lbnRfZmFjdG9yeSc7XG5pbXBvcnQge0NvbXBvbmVudEZhY3RvcnlCb3VuZFRvTW9kdWxlLCBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXJ9IGZyb20gJy4uL2xpbmtlci9jb21wb25lbnRfZmFjdG9yeV9yZXNvbHZlcic7XG5pbXBvcnQge0VsZW1lbnRSZWZ9IGZyb20gJy4uL2xpbmtlci9lbGVtZW50X3JlZic7XG5pbXBvcnQge0ludGVybmFsTmdNb2R1bGVSZWYsIE5nTW9kdWxlUmVmfSBmcm9tICcuLi9saW5rZXIvbmdfbW9kdWxlX2ZhY3RvcnknO1xuaW1wb3J0IHtUZW1wbGF0ZVJlZn0gZnJvbSAnLi4vbGlua2VyL3RlbXBsYXRlX3JlZic7XG5pbXBvcnQge1ZpZXdDb250YWluZXJSZWZ9IGZyb20gJy4uL2xpbmtlci92aWV3X2NvbnRhaW5lcl9yZWYnO1xuaW1wb3J0IHtFbWJlZGRlZFZpZXdSZWYsIEludGVybmFsVmlld1JlZiwgVmlld1JlZn0gZnJvbSAnLi4vbGlua2VyL3ZpZXdfcmVmJztcbmltcG9ydCB7UmVuZGVyZXIgYXMgUmVuZGVyZXJWMSwgUmVuZGVyZXIyfSBmcm9tICcuLi9yZW5kZXIvYXBpJztcbmltcG9ydCB7VHlwZX0gZnJvbSAnLi4vdHlwZSc7XG5pbXBvcnQge3N0cmluZ2lmeX0gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQge1ZFUlNJT059IGZyb20gJy4uL3ZlcnNpb24nO1xuXG5pbXBvcnQge2NhbGxOZ01vZHVsZUxpZmVjeWNsZSwgaW5pdE5nTW9kdWxlLCByZXNvbHZlTmdNb2R1bGVEZXB9IGZyb20gJy4vbmdfbW9kdWxlJztcbmltcG9ydCB7RGVwRmxhZ3MsIEVsZW1lbnREYXRhLCBOZ01vZHVsZURhdGEsIE5nTW9kdWxlRGVmaW5pdGlvbiwgTm9kZURlZiwgTm9kZUZsYWdzLCBTZXJ2aWNlcywgVGVtcGxhdGVEYXRhLCBWaWV3Q29udGFpbmVyRGF0YSwgVmlld0RhdGEsIFZpZXdEZWZpbml0aW9uRmFjdG9yeSwgVmlld1N0YXRlLCBhc0VsZW1lbnREYXRhLCBhc1Byb3ZpZGVyRGF0YSwgYXNUZXh0RGF0YX0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQge21hcmtQYXJlbnRWaWV3c0ZvckNoZWNrLCByZXNvbHZlRGVmaW5pdGlvbiwgcm9vdFJlbmRlck5vZGVzLCBzcGxpdE5hbWVzcGFjZSwgdG9rZW5LZXksIHZpZXdQYXJlbnRFbH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7YXR0YWNoRW1iZWRkZWRWaWV3LCBkZXRhY2hFbWJlZGRlZFZpZXcsIG1vdmVFbWJlZGRlZFZpZXcsIHJlbmRlckRldGFjaFZpZXd9IGZyb20gJy4vdmlld19hdHRhY2gnO1xuXG5jb25zdCBFTVBUWV9DT05URVhUID0gbmV3IE9iamVjdCgpO1xuXG4vLyBBdHRlbnRpb246IHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGFzIHRvcCBsZXZlbCBmdW5jdGlvbi5cbi8vIFB1dHRpbmcgYW55IGxvZ2ljIGluIGhlcmUgd2lsbCBkZXN0cm95IGNsb3N1cmUgdHJlZSBzaGFraW5nIVxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudEZhY3RvcnkoXG4gICAgc2VsZWN0b3I6IHN0cmluZywgY29tcG9uZW50VHlwZTogVHlwZTxhbnk+LCB2aWV3RGVmRmFjdG9yeTogVmlld0RlZmluaXRpb25GYWN0b3J5LFxuICAgIGlucHV0czoge1twcm9wTmFtZTogc3RyaW5nXTogc3RyaW5nfSB8IG51bGwsIG91dHB1dHM6IHtbcHJvcE5hbWU6IHN0cmluZ106IHN0cmluZ30sXG4gICAgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXSk6IENvbXBvbmVudEZhY3Rvcnk8YW55PiB7XG4gIHJldHVybiBuZXcgQ29tcG9uZW50RmFjdG9yeV8oXG4gICAgICBzZWxlY3RvciwgY29tcG9uZW50VHlwZSwgdmlld0RlZkZhY3RvcnksIGlucHV0cywgb3V0cHV0cywgbmdDb250ZW50U2VsZWN0b3JzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbXBvbmVudFZpZXdEZWZpbml0aW9uRmFjdG9yeShjb21wb25lbnRGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5PGFueT4pOlxuICAgIFZpZXdEZWZpbml0aW9uRmFjdG9yeSB7XG4gIHJldHVybiAoY29tcG9uZW50RmFjdG9yeSBhcyBDb21wb25lbnRGYWN0b3J5Xykudmlld0RlZkZhY3Rvcnk7XG59XG5cbmNsYXNzIENvbXBvbmVudEZhY3RvcnlfIGV4dGVuZHMgQ29tcG9uZW50RmFjdG9yeTxhbnk+IHtcbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgdmlld0RlZkZhY3Rvcnk6IFZpZXdEZWZpbml0aW9uRmFjdG9yeTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBzZWxlY3Rvcjogc3RyaW5nLCBwdWJsaWMgY29tcG9uZW50VHlwZTogVHlwZTxhbnk+LFxuICAgICAgdmlld0RlZkZhY3Rvcnk6IFZpZXdEZWZpbml0aW9uRmFjdG9yeSwgcHJpdmF0ZSBfaW5wdXRzOiB7W3Byb3BOYW1lOiBzdHJpbmddOiBzdHJpbmd9fG51bGwsXG4gICAgICBwcml2YXRlIF9vdXRwdXRzOiB7W3Byb3BOYW1lOiBzdHJpbmddOiBzdHJpbmd9LCBwdWJsaWMgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXSkge1xuICAgIC8vIEF0dGVudGlvbjogdGhpcyBjdG9yIGlzIGNhbGxlZCBhcyB0b3AgbGV2ZWwgZnVuY3Rpb24uXG4gICAgLy8gUHV0dGluZyBhbnkgbG9naWMgaW4gaGVyZSB3aWxsIGRlc3Ryb3kgY2xvc3VyZSB0cmVlIHNoYWtpbmchXG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnZpZXdEZWZGYWN0b3J5ID0gdmlld0RlZkZhY3Rvcnk7XG4gIH1cblxuICBnZXQgaW5wdXRzKCkge1xuICAgIGNvbnN0IGlucHV0c0Fycjoge3Byb3BOYW1lOiBzdHJpbmcsIHRlbXBsYXRlTmFtZTogc3RyaW5nfVtdID0gW107XG4gICAgY29uc3QgaW5wdXRzID0gdGhpcy5faW5wdXRzICE7XG4gICAgZm9yIChsZXQgcHJvcE5hbWUgaW4gaW5wdXRzKSB7XG4gICAgICBjb25zdCB0ZW1wbGF0ZU5hbWUgPSBpbnB1dHNbcHJvcE5hbWVdO1xuICAgICAgaW5wdXRzQXJyLnB1c2goe3Byb3BOYW1lLCB0ZW1wbGF0ZU5hbWV9KTtcbiAgICB9XG4gICAgcmV0dXJuIGlucHV0c0FycjtcbiAgfVxuXG4gIGdldCBvdXRwdXRzKCkge1xuICAgIGNvbnN0IG91dHB1dHNBcnI6IHtwcm9wTmFtZTogc3RyaW5nLCB0ZW1wbGF0ZU5hbWU6IHN0cmluZ31bXSA9IFtdO1xuICAgIGZvciAobGV0IHByb3BOYW1lIGluIHRoaXMuX291dHB1dHMpIHtcbiAgICAgIGNvbnN0IHRlbXBsYXRlTmFtZSA9IHRoaXMuX291dHB1dHNbcHJvcE5hbWVdO1xuICAgICAgb3V0cHV0c0Fyci5wdXNoKHtwcm9wTmFtZSwgdGVtcGxhdGVOYW1lfSk7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXRzQXJyO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgY29tcG9uZW50LlxuICAgKi9cbiAgY3JlYXRlKFxuICAgICAgaW5qZWN0b3I6IEluamVjdG9yLCBwcm9qZWN0YWJsZU5vZGVzPzogYW55W11bXSwgcm9vdFNlbGVjdG9yT3JOb2RlPzogc3RyaW5nfGFueSxcbiAgICAgIG5nTW9kdWxlPzogTmdNb2R1bGVSZWY8YW55Pik6IENvbXBvbmVudFJlZjxhbnk+IHtcbiAgICBpZiAoIW5nTW9kdWxlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ25nTW9kdWxlIHNob3VsZCBiZSBwcm92aWRlZCcpO1xuICAgIH1cbiAgICBjb25zdCB2aWV3RGVmID0gcmVzb2x2ZURlZmluaXRpb24odGhpcy52aWV3RGVmRmFjdG9yeSk7XG4gICAgY29uc3QgY29tcG9uZW50Tm9kZUluZGV4ID0gdmlld0RlZi5ub2Rlc1swXS5lbGVtZW50ICEuY29tcG9uZW50UHJvdmlkZXIgIS5ub2RlSW5kZXg7XG4gICAgY29uc3QgdmlldyA9IFNlcnZpY2VzLmNyZWF0ZVJvb3RWaWV3KFxuICAgICAgICBpbmplY3RvciwgcHJvamVjdGFibGVOb2RlcyB8fCBbXSwgcm9vdFNlbGVjdG9yT3JOb2RlLCB2aWV3RGVmLCBuZ01vZHVsZSwgRU1QVFlfQ09OVEVYVCk7XG4gICAgY29uc3QgY29tcG9uZW50ID0gYXNQcm92aWRlckRhdGEodmlldywgY29tcG9uZW50Tm9kZUluZGV4KS5pbnN0YW5jZTtcbiAgICBpZiAocm9vdFNlbGVjdG9yT3JOb2RlKSB7XG4gICAgICB2aWV3LnJlbmRlcmVyLnNldEF0dHJpYnV0ZShhc0VsZW1lbnREYXRhKHZpZXcsIDApLnJlbmRlckVsZW1lbnQsICduZy12ZXJzaW9uJywgVkVSU0lPTi5mdWxsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IENvbXBvbmVudFJlZl8odmlldywgbmV3IFZpZXdSZWZfKHZpZXcpLCBjb21wb25lbnQpO1xuICB9XG59XG5cbmNsYXNzIENvbXBvbmVudFJlZl8gZXh0ZW5kcyBDb21wb25lbnRSZWY8YW55PiB7XG4gIHB1YmxpYyByZWFkb25seSBob3N0VmlldzogVmlld1JlZjtcbiAgcHVibGljIHJlYWRvbmx5IGluc3RhbmNlOiBhbnk7XG4gIHB1YmxpYyByZWFkb25seSBjaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWY7XG4gIHByaXZhdGUgX2VsRGVmOiBOb2RlRGVmO1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF92aWV3OiBWaWV3RGF0YSwgcHJpdmF0ZSBfdmlld1JlZjogVmlld1JlZiwgcHJpdmF0ZSBfY29tcG9uZW50OiBhbnkpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX2VsRGVmID0gdGhpcy5fdmlldy5kZWYubm9kZXNbMF07XG4gICAgdGhpcy5ob3N0VmlldyA9IF92aWV3UmVmO1xuICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3JSZWYgPSBfdmlld1JlZjtcbiAgICB0aGlzLmluc3RhbmNlID0gX2NvbXBvbmVudDtcbiAgfVxuICBnZXQgbG9jYXRpb24oKTogRWxlbWVudFJlZiB7XG4gICAgcmV0dXJuIG5ldyBFbGVtZW50UmVmKGFzRWxlbWVudERhdGEodGhpcy5fdmlldywgdGhpcy5fZWxEZWYubm9kZUluZGV4KS5yZW5kZXJFbGVtZW50KTtcbiAgfVxuICBnZXQgaW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gbmV3IEluamVjdG9yXyh0aGlzLl92aWV3LCB0aGlzLl9lbERlZik7IH1cbiAgZ2V0IGNvbXBvbmVudFR5cGUoKTogVHlwZTxhbnk+IHsgcmV0dXJuIDxhbnk+dGhpcy5fY29tcG9uZW50LmNvbnN0cnVjdG9yOyB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHsgdGhpcy5fdmlld1JlZi5kZXN0cm95KCk7IH1cbiAgb25EZXN0cm95KGNhbGxiYWNrOiBGdW5jdGlvbik6IHZvaWQgeyB0aGlzLl92aWV3UmVmLm9uRGVzdHJveShjYWxsYmFjayk7IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVZpZXdDb250YWluZXJEYXRhKFxuICAgIHZpZXc6IFZpZXdEYXRhLCBlbERlZjogTm9kZURlZiwgZWxEYXRhOiBFbGVtZW50RGF0YSk6IFZpZXdDb250YWluZXJEYXRhIHtcbiAgcmV0dXJuIG5ldyBWaWV3Q29udGFpbmVyUmVmXyh2aWV3LCBlbERlZiwgZWxEYXRhKTtcbn1cblxuY2xhc3MgVmlld0NvbnRhaW5lclJlZl8gaW1wbGVtZW50cyBWaWV3Q29udGFpbmVyRGF0YSB7XG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIF9lbWJlZGRlZFZpZXdzOiBWaWV3RGF0YVtdID0gW107XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3ZpZXc6IFZpZXdEYXRhLCBwcml2YXRlIF9lbERlZjogTm9kZURlZiwgcHJpdmF0ZSBfZGF0YTogRWxlbWVudERhdGEpIHt9XG5cbiAgZ2V0IGVsZW1lbnQoKTogRWxlbWVudFJlZiB7IHJldHVybiBuZXcgRWxlbWVudFJlZih0aGlzLl9kYXRhLnJlbmRlckVsZW1lbnQpOyB9XG5cbiAgZ2V0IGluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIG5ldyBJbmplY3Rvcl8odGhpcy5fdmlldywgdGhpcy5fZWxEZWYpOyB9XG5cbiAgLyoqIEBkZXByZWNhdGVkIE5vIHJlcGxhY2VtZW50ICovXG4gIGdldCBwYXJlbnRJbmplY3RvcigpOiBJbmplY3RvciB7XG4gICAgbGV0IHZpZXcgPSB0aGlzLl92aWV3O1xuICAgIGxldCBlbERlZiA9IHRoaXMuX2VsRGVmLnBhcmVudDtcbiAgICB3aGlsZSAoIWVsRGVmICYmIHZpZXcpIHtcbiAgICAgIGVsRGVmID0gdmlld1BhcmVudEVsKHZpZXcpO1xuICAgICAgdmlldyA9IHZpZXcucGFyZW50ICE7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZpZXcgPyBuZXcgSW5qZWN0b3JfKHZpZXcsIGVsRGVmKSA6IG5ldyBJbmplY3Rvcl8odGhpcy5fdmlldywgbnVsbCk7XG4gIH1cblxuICBjbGVhcigpOiB2b2lkIHtcbiAgICBjb25zdCBsZW4gPSB0aGlzLl9lbWJlZGRlZFZpZXdzLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gbGVuIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGNvbnN0IHZpZXcgPSBkZXRhY2hFbWJlZGRlZFZpZXcodGhpcy5fZGF0YSwgaSkgITtcbiAgICAgIFNlcnZpY2VzLmRlc3Ryb3lWaWV3KHZpZXcpO1xuICAgIH1cbiAgfVxuXG4gIGdldChpbmRleDogbnVtYmVyKTogVmlld1JlZnxudWxsIHtcbiAgICBjb25zdCB2aWV3ID0gdGhpcy5fZW1iZWRkZWRWaWV3c1tpbmRleF07XG4gICAgaWYgKHZpZXcpIHtcbiAgICAgIGNvbnN0IHJlZiA9IG5ldyBWaWV3UmVmXyh2aWV3KTtcbiAgICAgIHJlZi5hdHRhY2hUb1ZpZXdDb250YWluZXJSZWYodGhpcyk7XG4gICAgICByZXR1cm4gcmVmO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGdldCBsZW5ndGgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX2VtYmVkZGVkVmlld3MubGVuZ3RoOyB9XG5cbiAgY3JlYXRlRW1iZWRkZWRWaWV3PEM+KHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxDPiwgY29udGV4dD86IEMsIGluZGV4PzogbnVtYmVyKTpcbiAgICAgIEVtYmVkZGVkVmlld1JlZjxDPiB7XG4gICAgY29uc3Qgdmlld1JlZiA9IHRlbXBsYXRlUmVmLmNyZWF0ZUVtYmVkZGVkVmlldyhjb250ZXh0IHx8IDxhbnk+e30pO1xuICAgIHRoaXMuaW5zZXJ0KHZpZXdSZWYsIGluZGV4KTtcbiAgICByZXR1cm4gdmlld1JlZjtcbiAgfVxuXG4gIGNyZWF0ZUNvbXBvbmVudDxDPihcbiAgICAgIGNvbXBvbmVudEZhY3Rvcnk6IENvbXBvbmVudEZhY3Rvcnk8Qz4sIGluZGV4PzogbnVtYmVyLCBpbmplY3Rvcj86IEluamVjdG9yLFxuICAgICAgcHJvamVjdGFibGVOb2Rlcz86IGFueVtdW10sIG5nTW9kdWxlUmVmPzogTmdNb2R1bGVSZWY8YW55Pik6IENvbXBvbmVudFJlZjxDPiB7XG4gICAgY29uc3QgY29udGV4dEluamVjdG9yID0gaW5qZWN0b3IgfHwgdGhpcy5wYXJlbnRJbmplY3RvcjtcbiAgICBpZiAoIW5nTW9kdWxlUmVmICYmICEoY29tcG9uZW50RmFjdG9yeSBpbnN0YW5jZW9mIENvbXBvbmVudEZhY3RvcnlCb3VuZFRvTW9kdWxlKSkge1xuICAgICAgbmdNb2R1bGVSZWYgPSBjb250ZXh0SW5qZWN0b3IuZ2V0KE5nTW9kdWxlUmVmKTtcbiAgICB9XG4gICAgY29uc3QgY29tcG9uZW50UmVmID1cbiAgICAgICAgY29tcG9uZW50RmFjdG9yeS5jcmVhdGUoY29udGV4dEluamVjdG9yLCBwcm9qZWN0YWJsZU5vZGVzLCB1bmRlZmluZWQsIG5nTW9kdWxlUmVmKTtcbiAgICB0aGlzLmluc2VydChjb21wb25lbnRSZWYuaG9zdFZpZXcsIGluZGV4KTtcbiAgICByZXR1cm4gY29tcG9uZW50UmVmO1xuICB9XG5cbiAgaW5zZXJ0KHZpZXdSZWY6IFZpZXdSZWYsIGluZGV4PzogbnVtYmVyKTogVmlld1JlZiB7XG4gICAgaWYgKHZpZXdSZWYuZGVzdHJveWVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBpbnNlcnQgYSBkZXN0cm95ZWQgVmlldyBpbiBhIFZpZXdDb250YWluZXIhJyk7XG4gICAgfVxuICAgIGNvbnN0IHZpZXdSZWZfID0gPFZpZXdSZWZfPnZpZXdSZWY7XG4gICAgY29uc3Qgdmlld0RhdGEgPSB2aWV3UmVmXy5fdmlldztcbiAgICBhdHRhY2hFbWJlZGRlZFZpZXcodGhpcy5fdmlldywgdGhpcy5fZGF0YSwgaW5kZXgsIHZpZXdEYXRhKTtcbiAgICB2aWV3UmVmXy5hdHRhY2hUb1ZpZXdDb250YWluZXJSZWYodGhpcyk7XG4gICAgcmV0dXJuIHZpZXdSZWY7XG4gIH1cblxuICBtb3ZlKHZpZXdSZWY6IFZpZXdSZWZfLCBjdXJyZW50SW5kZXg6IG51bWJlcik6IFZpZXdSZWYge1xuICAgIGlmICh2aWV3UmVmLmRlc3Ryb3llZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgbW92ZSBhIGRlc3Ryb3llZCBWaWV3IGluIGEgVmlld0NvbnRhaW5lciEnKTtcbiAgICB9XG4gICAgY29uc3QgcHJldmlvdXNJbmRleCA9IHRoaXMuX2VtYmVkZGVkVmlld3MuaW5kZXhPZih2aWV3UmVmLl92aWV3KTtcbiAgICBtb3ZlRW1iZWRkZWRWaWV3KHRoaXMuX2RhdGEsIHByZXZpb3VzSW5kZXgsIGN1cnJlbnRJbmRleCk7XG4gICAgcmV0dXJuIHZpZXdSZWY7XG4gIH1cblxuICBpbmRleE9mKHZpZXdSZWY6IFZpZXdSZWYpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9lbWJlZGRlZFZpZXdzLmluZGV4T2YoKDxWaWV3UmVmXz52aWV3UmVmKS5fdmlldyk7XG4gIH1cblxuICByZW1vdmUoaW5kZXg/OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCB2aWV3RGF0YSA9IGRldGFjaEVtYmVkZGVkVmlldyh0aGlzLl9kYXRhLCBpbmRleCk7XG4gICAgaWYgKHZpZXdEYXRhKSB7XG4gICAgICBTZXJ2aWNlcy5kZXN0cm95Vmlldyh2aWV3RGF0YSk7XG4gICAgfVxuICB9XG5cbiAgZGV0YWNoKGluZGV4PzogbnVtYmVyKTogVmlld1JlZnxudWxsIHtcbiAgICBjb25zdCB2aWV3ID0gZGV0YWNoRW1iZWRkZWRWaWV3KHRoaXMuX2RhdGEsIGluZGV4KTtcbiAgICByZXR1cm4gdmlldyA/IG5ldyBWaWV3UmVmXyh2aWV3KSA6IG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNoYW5nZURldGVjdG9yUmVmKHZpZXc6IFZpZXdEYXRhKTogQ2hhbmdlRGV0ZWN0b3JSZWYge1xuICByZXR1cm4gbmV3IFZpZXdSZWZfKHZpZXcpO1xufVxuXG5leHBvcnQgY2xhc3MgVmlld1JlZl8gaW1wbGVtZW50cyBFbWJlZGRlZFZpZXdSZWY8YW55PiwgSW50ZXJuYWxWaWV3UmVmIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdmlldzogVmlld0RhdGE7XG4gIHByaXZhdGUgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWZ8bnVsbDtcbiAgcHJpdmF0ZSBfYXBwUmVmOiBBcHBsaWNhdGlvblJlZnxudWxsO1xuXG4gIGNvbnN0cnVjdG9yKF92aWV3OiBWaWV3RGF0YSkge1xuICAgIHRoaXMuX3ZpZXcgPSBfdmlldztcbiAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmID0gbnVsbDtcbiAgICB0aGlzLl9hcHBSZWYgPSBudWxsO1xuICB9XG5cbiAgZ2V0IHJvb3ROb2RlcygpOiBhbnlbXSB7IHJldHVybiByb290UmVuZGVyTm9kZXModGhpcy5fdmlldyk7IH1cblxuICBnZXQgY29udGV4dCgpIHsgcmV0dXJuIHRoaXMuX3ZpZXcuY29udGV4dDsgfVxuXG4gIGdldCBkZXN0cm95ZWQoKTogYm9vbGVhbiB7IHJldHVybiAodGhpcy5fdmlldy5zdGF0ZSAmIFZpZXdTdGF0ZS5EZXN0cm95ZWQpICE9PSAwOyB9XG5cbiAgbWFya0ZvckNoZWNrKCk6IHZvaWQgeyBtYXJrUGFyZW50Vmlld3NGb3JDaGVjayh0aGlzLl92aWV3KTsgfVxuICBkZXRhY2goKTogdm9pZCB7IHRoaXMuX3ZpZXcuc3RhdGUgJj0gflZpZXdTdGF0ZS5BdHRhY2hlZDsgfVxuICBkZXRlY3RDaGFuZ2VzKCk6IHZvaWQge1xuICAgIGNvbnN0IGZzID0gdGhpcy5fdmlldy5yb290LnJlbmRlcmVyRmFjdG9yeTtcbiAgICBpZiAoZnMuYmVnaW4pIHtcbiAgICAgIGZzLmJlZ2luKCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBTZXJ2aWNlcy5jaGVja0FuZFVwZGF0ZVZpZXcodGhpcy5fdmlldyk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChmcy5lbmQpIHtcbiAgICAgICAgZnMuZW5kKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNoZWNrTm9DaGFuZ2VzKCk6IHZvaWQgeyBTZXJ2aWNlcy5jaGVja05vQ2hhbmdlc1ZpZXcodGhpcy5fdmlldyk7IH1cblxuICByZWF0dGFjaCgpOiB2b2lkIHsgdGhpcy5fdmlldy5zdGF0ZSB8PSBWaWV3U3RhdGUuQXR0YWNoZWQ7IH1cbiAgb25EZXN0cm95KGNhbGxiYWNrOiBGdW5jdGlvbikge1xuICAgIGlmICghdGhpcy5fdmlldy5kaXNwb3NhYmxlcykge1xuICAgICAgdGhpcy5fdmlldy5kaXNwb3NhYmxlcyA9IFtdO1xuICAgIH1cbiAgICB0aGlzLl92aWV3LmRpc3Bvc2FibGVzLnB1c2goPGFueT5jYWxsYmFjayk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGlmICh0aGlzLl9hcHBSZWYpIHtcbiAgICAgIHRoaXMuX2FwcFJlZi5kZXRhY2hWaWV3KHRoaXMpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fdmlld0NvbnRhaW5lclJlZikge1xuICAgICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5kZXRhY2godGhpcy5fdmlld0NvbnRhaW5lclJlZi5pbmRleE9mKHRoaXMpKTtcbiAgICB9XG4gICAgU2VydmljZXMuZGVzdHJveVZpZXcodGhpcy5fdmlldyk7XG4gIH1cblxuICBkZXRhY2hGcm9tQXBwUmVmKCkge1xuICAgIHRoaXMuX2FwcFJlZiA9IG51bGw7XG4gICAgcmVuZGVyRGV0YWNoVmlldyh0aGlzLl92aWV3KTtcbiAgICBTZXJ2aWNlcy5kaXJ0eVBhcmVudFF1ZXJpZXModGhpcy5fdmlldyk7XG4gIH1cblxuICBhdHRhY2hUb0FwcFJlZihhcHBSZWY6IEFwcGxpY2F0aW9uUmVmKSB7XG4gICAgaWYgKHRoaXMuX3ZpZXdDb250YWluZXJSZWYpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhpcyB2aWV3IGlzIGFscmVhZHkgYXR0YWNoZWQgdG8gYSBWaWV3Q29udGFpbmVyIScpO1xuICAgIH1cbiAgICB0aGlzLl9hcHBSZWYgPSBhcHBSZWY7XG4gIH1cblxuICBhdHRhY2hUb1ZpZXdDb250YWluZXJSZWYodmNSZWY6IFZpZXdDb250YWluZXJSZWYpIHtcbiAgICBpZiAodGhpcy5fYXBwUmVmKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgdmlldyBpcyBhbHJlYWR5IGF0dGFjaGVkIGRpcmVjdGx5IHRvIHRoZSBBcHBsaWNhdGlvblJlZiEnKTtcbiAgICB9XG4gICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZiA9IHZjUmVmO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUZW1wbGF0ZURhdGEodmlldzogVmlld0RhdGEsIGRlZjogTm9kZURlZik6IFRlbXBsYXRlRGF0YSB7XG4gIHJldHVybiBuZXcgVGVtcGxhdGVSZWZfKHZpZXcsIGRlZik7XG59XG5cbmNsYXNzIFRlbXBsYXRlUmVmXyBleHRlbmRzIFRlbXBsYXRlUmVmPGFueT4gaW1wbGVtZW50cyBUZW1wbGF0ZURhdGEge1xuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgX3Byb2plY3RlZFZpZXdzICE6IFZpZXdEYXRhW107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcGFyZW50VmlldzogVmlld0RhdGEsIHByaXZhdGUgX2RlZjogTm9kZURlZikgeyBzdXBlcigpOyB9XG5cbiAgY3JlYXRlRW1iZWRkZWRWaWV3KGNvbnRleHQ6IGFueSk6IEVtYmVkZGVkVmlld1JlZjxhbnk+IHtcbiAgICByZXR1cm4gbmV3IFZpZXdSZWZfKFNlcnZpY2VzLmNyZWF0ZUVtYmVkZGVkVmlldyhcbiAgICAgICAgdGhpcy5fcGFyZW50VmlldywgdGhpcy5fZGVmLCB0aGlzLl9kZWYuZWxlbWVudCAhLnRlbXBsYXRlICEsIGNvbnRleHQpKTtcbiAgfVxuXG4gIGdldCBlbGVtZW50UmVmKCk6IEVsZW1lbnRSZWYge1xuICAgIHJldHVybiBuZXcgRWxlbWVudFJlZihhc0VsZW1lbnREYXRhKHRoaXMuX3BhcmVudFZpZXcsIHRoaXMuX2RlZi5ub2RlSW5kZXgpLnJlbmRlckVsZW1lbnQpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVJbmplY3Rvcih2aWV3OiBWaWV3RGF0YSwgZWxEZWY6IE5vZGVEZWYpOiBJbmplY3RvciB7XG4gIHJldHVybiBuZXcgSW5qZWN0b3JfKHZpZXcsIGVsRGVmKTtcbn1cblxuY2xhc3MgSW5qZWN0b3JfIGltcGxlbWVudHMgSW5qZWN0b3Ige1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHZpZXc6IFZpZXdEYXRhLCBwcml2YXRlIGVsRGVmOiBOb2RlRGVmfG51bGwpIHt9XG4gIGdldCh0b2tlbjogYW55LCBub3RGb3VuZFZhbHVlOiBhbnkgPSBJbmplY3Rvci5USFJPV19JRl9OT1RfRk9VTkQpOiBhbnkge1xuICAgIGNvbnN0IGFsbG93UHJpdmF0ZVNlcnZpY2VzID1cbiAgICAgICAgdGhpcy5lbERlZiA/ICh0aGlzLmVsRGVmLmZsYWdzICYgTm9kZUZsYWdzLkNvbXBvbmVudFZpZXcpICE9PSAwIDogZmFsc2U7XG4gICAgcmV0dXJuIFNlcnZpY2VzLnJlc29sdmVEZXAoXG4gICAgICAgIHRoaXMudmlldywgdGhpcy5lbERlZiwgYWxsb3dQcml2YXRlU2VydmljZXMsXG4gICAgICAgIHtmbGFnczogRGVwRmxhZ3MuTm9uZSwgdG9rZW4sIHRva2VuS2V5OiB0b2tlbktleSh0b2tlbil9LCBub3RGb3VuZFZhbHVlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9kZVZhbHVlKHZpZXc6IFZpZXdEYXRhLCBpbmRleDogbnVtYmVyKTogYW55IHtcbiAgY29uc3QgZGVmID0gdmlldy5kZWYubm9kZXNbaW5kZXhdO1xuICBpZiAoZGVmLmZsYWdzICYgTm9kZUZsYWdzLlR5cGVFbGVtZW50KSB7XG4gICAgY29uc3QgZWxEYXRhID0gYXNFbGVtZW50RGF0YSh2aWV3LCBkZWYubm9kZUluZGV4KTtcbiAgICByZXR1cm4gZGVmLmVsZW1lbnQgIS50ZW1wbGF0ZSA/IGVsRGF0YS50ZW1wbGF0ZSA6IGVsRGF0YS5yZW5kZXJFbGVtZW50O1xuICB9IGVsc2UgaWYgKGRlZi5mbGFncyAmIE5vZGVGbGFncy5UeXBlVGV4dCkge1xuICAgIHJldHVybiBhc1RleHREYXRhKHZpZXcsIGRlZi5ub2RlSW5kZXgpLnJlbmRlclRleHQ7XG4gIH0gZWxzZSBpZiAoZGVmLmZsYWdzICYgKE5vZGVGbGFncy5DYXRQcm92aWRlciB8IE5vZGVGbGFncy5UeXBlUGlwZSkpIHtcbiAgICByZXR1cm4gYXNQcm92aWRlckRhdGEodmlldywgZGVmLm5vZGVJbmRleCkuaW5zdGFuY2U7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKGBJbGxlZ2FsIHN0YXRlOiByZWFkIG5vZGVWYWx1ZSBmb3Igbm9kZSBpbmRleCAke2luZGV4fWApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUmVuZGVyZXJWMSh2aWV3OiBWaWV3RGF0YSk6IFJlbmRlcmVyVjEge1xuICByZXR1cm4gbmV3IFJlbmRlcmVyQWRhcHRlcih2aWV3LnJlbmRlcmVyKTtcbn1cblxuY2xhc3MgUmVuZGVyZXJBZGFwdGVyIGltcGxlbWVudHMgUmVuZGVyZXJWMSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZGVsZWdhdGU6IFJlbmRlcmVyMikge31cbiAgc2VsZWN0Um9vdEVsZW1lbnQoc2VsZWN0b3JPck5vZGU6IHN0cmluZ3xFbGVtZW50KTogRWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMuZGVsZWdhdGUuc2VsZWN0Um9vdEVsZW1lbnQoc2VsZWN0b3JPck5vZGUpO1xuICB9XG5cbiAgY3JlYXRlRWxlbWVudChwYXJlbnQ6IEVsZW1lbnR8RG9jdW1lbnRGcmFnbWVudCwgbmFtZXNwYWNlQW5kTmFtZTogc3RyaW5nKTogRWxlbWVudCB7XG4gICAgY29uc3QgW25zLCBuYW1lXSA9IHNwbGl0TmFtZXNwYWNlKG5hbWVzcGFjZUFuZE5hbWUpO1xuICAgIGNvbnN0IGVsID0gdGhpcy5kZWxlZ2F0ZS5jcmVhdGVFbGVtZW50KG5hbWUsIG5zKTtcbiAgICBpZiAocGFyZW50KSB7XG4gICAgICB0aGlzLmRlbGVnYXRlLmFwcGVuZENoaWxkKHBhcmVudCwgZWwpO1xuICAgIH1cbiAgICByZXR1cm4gZWw7XG4gIH1cblxuICBjcmVhdGVWaWV3Um9vdChob3N0RWxlbWVudDogRWxlbWVudCk6IEVsZW1lbnR8RG9jdW1lbnRGcmFnbWVudCB7IHJldHVybiBob3N0RWxlbWVudDsgfVxuXG4gIGNyZWF0ZVRlbXBsYXRlQW5jaG9yKHBhcmVudEVsZW1lbnQ6IEVsZW1lbnR8RG9jdW1lbnRGcmFnbWVudCk6IENvbW1lbnQge1xuICAgIGNvbnN0IGNvbW1lbnQgPSB0aGlzLmRlbGVnYXRlLmNyZWF0ZUNvbW1lbnQoJycpO1xuICAgIGlmIChwYXJlbnRFbGVtZW50KSB7XG4gICAgICB0aGlzLmRlbGVnYXRlLmFwcGVuZENoaWxkKHBhcmVudEVsZW1lbnQsIGNvbW1lbnQpO1xuICAgIH1cbiAgICByZXR1cm4gY29tbWVudDtcbiAgfVxuXG4gIGNyZWF0ZVRleHQocGFyZW50RWxlbWVudDogRWxlbWVudHxEb2N1bWVudEZyYWdtZW50LCB2YWx1ZTogc3RyaW5nKTogYW55IHtcbiAgICBjb25zdCBub2RlID0gdGhpcy5kZWxlZ2F0ZS5jcmVhdGVUZXh0KHZhbHVlKTtcbiAgICBpZiAocGFyZW50RWxlbWVudCkge1xuICAgICAgdGhpcy5kZWxlZ2F0ZS5hcHBlbmRDaGlsZChwYXJlbnRFbGVtZW50LCBub2RlKTtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBwcm9qZWN0Tm9kZXMocGFyZW50RWxlbWVudDogRWxlbWVudHxEb2N1bWVudEZyYWdtZW50LCBub2RlczogTm9kZVtdKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5kZWxlZ2F0ZS5hcHBlbmRDaGlsZChwYXJlbnRFbGVtZW50LCBub2Rlc1tpXSk7XG4gICAgfVxuICB9XG5cbiAgYXR0YWNoVmlld0FmdGVyKG5vZGU6IE5vZGUsIHZpZXdSb290Tm9kZXM6IE5vZGVbXSkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSB0aGlzLmRlbGVnYXRlLnBhcmVudE5vZGUobm9kZSk7XG4gICAgY29uc3QgbmV4dFNpYmxpbmcgPSB0aGlzLmRlbGVnYXRlLm5leHRTaWJsaW5nKG5vZGUpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmlld1Jvb3ROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5kZWxlZ2F0ZS5pbnNlcnRCZWZvcmUocGFyZW50RWxlbWVudCwgdmlld1Jvb3ROb2Rlc1tpXSwgbmV4dFNpYmxpbmcpO1xuICAgIH1cbiAgfVxuXG4gIGRldGFjaFZpZXcodmlld1Jvb3ROb2RlczogKEVsZW1lbnR8VGV4dHxDb21tZW50KVtdKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2aWV3Um9vdE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBub2RlID0gdmlld1Jvb3ROb2Rlc1tpXTtcbiAgICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSB0aGlzLmRlbGVnYXRlLnBhcmVudE5vZGUobm9kZSk7XG4gICAgICB0aGlzLmRlbGVnYXRlLnJlbW92ZUNoaWxkKHBhcmVudEVsZW1lbnQsIG5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3lWaWV3KGhvc3RFbGVtZW50OiBFbGVtZW50fERvY3VtZW50RnJhZ21lbnQsIHZpZXdBbGxOb2RlczogTm9kZVtdKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2aWV3QWxsTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUuZGVzdHJveU5vZGUgISh2aWV3QWxsTm9kZXNbaV0pO1xuICAgIH1cbiAgfVxuXG4gIGxpc3RlbihyZW5kZXJFbGVtZW50OiBhbnksIG5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKTogRnVuY3Rpb24ge1xuICAgIHJldHVybiB0aGlzLmRlbGVnYXRlLmxpc3RlbihyZW5kZXJFbGVtZW50LCBuYW1lLCA8YW55PmNhbGxiYWNrKTtcbiAgfVxuXG4gIGxpc3Rlbkdsb2JhbCh0YXJnZXQ6IHN0cmluZywgbmFtZTogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuZGVsZWdhdGUubGlzdGVuKHRhcmdldCwgbmFtZSwgPGFueT5jYWxsYmFjayk7XG4gIH1cblxuICBzZXRFbGVtZW50UHJvcGVydHkoXG4gICAgICByZW5kZXJFbGVtZW50OiBFbGVtZW50fERvY3VtZW50RnJhZ21lbnQsIHByb3BlcnR5TmFtZTogc3RyaW5nLCBwcm9wZXJ0eVZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLmRlbGVnYXRlLnNldFByb3BlcnR5KHJlbmRlckVsZW1lbnQsIHByb3BlcnR5TmFtZSwgcHJvcGVydHlWYWx1ZSk7XG4gIH1cblxuICBzZXRFbGVtZW50QXR0cmlidXRlKHJlbmRlckVsZW1lbnQ6IEVsZW1lbnQsIG5hbWVzcGFjZUFuZE5hbWU6IHN0cmluZywgYXR0cmlidXRlVmFsdWU/OiBzdHJpbmcpOlxuICAgICAgdm9pZCB7XG4gICAgY29uc3QgW25zLCBuYW1lXSA9IHNwbGl0TmFtZXNwYWNlKG5hbWVzcGFjZUFuZE5hbWUpO1xuICAgIGlmIChhdHRyaWJ1dGVWYWx1ZSAhPSBudWxsKSB7XG4gICAgICB0aGlzLmRlbGVnYXRlLnNldEF0dHJpYnV0ZShyZW5kZXJFbGVtZW50LCBuYW1lLCBhdHRyaWJ1dGVWYWx1ZSwgbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRlbGVnYXRlLnJlbW92ZUF0dHJpYnV0ZShyZW5kZXJFbGVtZW50LCBuYW1lLCBucyk7XG4gICAgfVxuICB9XG5cbiAgc2V0QmluZGluZ0RlYnVnSW5mbyhyZW5kZXJFbGVtZW50OiBFbGVtZW50LCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgcHJvcGVydHlWYWx1ZTogc3RyaW5nKTogdm9pZCB7fVxuXG4gIHNldEVsZW1lbnRDbGFzcyhyZW5kZXJFbGVtZW50OiBFbGVtZW50LCBjbGFzc05hbWU6IHN0cmluZywgaXNBZGQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAoaXNBZGQpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUuYWRkQ2xhc3MocmVuZGVyRWxlbWVudCwgY2xhc3NOYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kZWxlZ2F0ZS5yZW1vdmVDbGFzcyhyZW5kZXJFbGVtZW50LCBjbGFzc05hbWUpO1xuICAgIH1cbiAgfVxuXG4gIHNldEVsZW1lbnRTdHlsZShyZW5kZXJFbGVtZW50OiBIVE1MRWxlbWVudCwgc3R5bGVOYW1lOiBzdHJpbmcsIHN0eWxlVmFsdWU/OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoc3R5bGVWYWx1ZSAhPSBudWxsKSB7XG4gICAgICB0aGlzLmRlbGVnYXRlLnNldFN0eWxlKHJlbmRlckVsZW1lbnQsIHN0eWxlTmFtZSwgc3R5bGVWYWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUucmVtb3ZlU3R5bGUocmVuZGVyRWxlbWVudCwgc3R5bGVOYW1lKTtcbiAgICB9XG4gIH1cblxuICBpbnZva2VFbGVtZW50TWV0aG9kKHJlbmRlckVsZW1lbnQ6IEVsZW1lbnQsIG1ldGhvZE5hbWU6IHN0cmluZywgYXJnczogYW55W10pOiB2b2lkIHtcbiAgICAocmVuZGVyRWxlbWVudCBhcyBhbnkpW21ldGhvZE5hbWVdLmFwcGx5KHJlbmRlckVsZW1lbnQsIGFyZ3MpO1xuICB9XG5cbiAgc2V0VGV4dChyZW5kZXJOb2RlOiBUZXh0LCB0ZXh0OiBzdHJpbmcpOiB2b2lkIHsgdGhpcy5kZWxlZ2F0ZS5zZXRWYWx1ZShyZW5kZXJOb2RlLCB0ZXh0KTsgfVxuXG4gIGFuaW1hdGUoKTogYW55IHsgdGhyb3cgbmV3IEVycm9yKCdSZW5kZXJlci5hbmltYXRlIGlzIG5vIGxvbmdlciBzdXBwb3J0ZWQhJyk7IH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTmdNb2R1bGVSZWYoXG4gICAgbW9kdWxlVHlwZTogVHlwZTxhbnk+LCBwYXJlbnQ6IEluamVjdG9yLCBib290c3RyYXBDb21wb25lbnRzOiBUeXBlPGFueT5bXSxcbiAgICBkZWY6IE5nTW9kdWxlRGVmaW5pdGlvbik6IE5nTW9kdWxlUmVmPGFueT4ge1xuICByZXR1cm4gbmV3IE5nTW9kdWxlUmVmXyhtb2R1bGVUeXBlLCBwYXJlbnQsIGJvb3RzdHJhcENvbXBvbmVudHMsIGRlZik7XG59XG5cbmNsYXNzIE5nTW9kdWxlUmVmXyBpbXBsZW1lbnRzIE5nTW9kdWxlRGF0YSwgSW50ZXJuYWxOZ01vZHVsZVJlZjxhbnk+IHtcbiAgcHJpdmF0ZSBfZGVzdHJveUxpc3RlbmVyczogKCgpID0+IHZvaWQpW10gPSBbXTtcbiAgcHJpdmF0ZSBfZGVzdHJveWVkOiBib29sZWFuID0gZmFsc2U7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIF9wcm92aWRlcnMgITogYW55W107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIF9tb2R1bGVzICE6IGFueVtdO1xuXG4gIHJlYWRvbmx5IGluamVjdG9yOiBJbmplY3RvciA9IHRoaXM7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF9tb2R1bGVUeXBlOiBUeXBlPGFueT4sIHB1YmxpYyBfcGFyZW50OiBJbmplY3RvcixcbiAgICAgIHB1YmxpYyBfYm9vdHN0cmFwQ29tcG9uZW50czogVHlwZTxhbnk+W10sIHB1YmxpYyBfZGVmOiBOZ01vZHVsZURlZmluaXRpb24pIHtcbiAgICBpbml0TmdNb2R1bGUodGhpcyk7XG4gIH1cblxuICBnZXQodG9rZW46IGFueSwgbm90Rm91bmRWYWx1ZTogYW55ID0gSW5qZWN0b3IuVEhST1dfSUZfTk9UX0ZPVU5ELFxuICAgICAgaW5qZWN0RmxhZ3M6IEluamVjdEZsYWdzID0gSW5qZWN0RmxhZ3MuRGVmYXVsdCk6IGFueSB7XG4gICAgbGV0IGZsYWdzID0gRGVwRmxhZ3MuTm9uZTtcbiAgICBpZiAoaW5qZWN0RmxhZ3MgJiBJbmplY3RGbGFncy5Ta2lwU2VsZikge1xuICAgICAgZmxhZ3MgfD0gRGVwRmxhZ3MuU2tpcFNlbGY7XG4gICAgfSBlbHNlIGlmIChpbmplY3RGbGFncyAmIEluamVjdEZsYWdzLlNlbGYpIHtcbiAgICAgIGZsYWdzIHw9IERlcEZsYWdzLlNlbGY7XG4gICAgfVxuICAgIHJldHVybiByZXNvbHZlTmdNb2R1bGVEZXAoXG4gICAgICAgIHRoaXMsIHt0b2tlbjogdG9rZW4sIHRva2VuS2V5OiB0b2tlbktleSh0b2tlbiksIGZsYWdzOiBmbGFnc30sIG5vdEZvdW5kVmFsdWUpO1xuICB9XG5cbiAgZ2V0IGluc3RhbmNlKCkgeyByZXR1cm4gdGhpcy5nZXQodGhpcy5fbW9kdWxlVHlwZSk7IH1cblxuICBnZXQgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyKCkgeyByZXR1cm4gdGhpcy5nZXQoQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyKTsgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2Rlc3Ryb3llZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBUaGUgbmcgbW9kdWxlICR7c3RyaW5naWZ5KHRoaXMuaW5zdGFuY2UuY29uc3RydWN0b3IpfSBoYXMgYWxyZWFkeSBiZWVuIGRlc3Ryb3llZC5gKTtcbiAgICB9XG4gICAgdGhpcy5fZGVzdHJveWVkID0gdHJ1ZTtcbiAgICBjYWxsTmdNb2R1bGVMaWZlY3ljbGUodGhpcywgTm9kZUZsYWdzLk9uRGVzdHJveSk7XG4gICAgdGhpcy5fZGVzdHJveUxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4gbGlzdGVuZXIoKSk7XG4gIH1cblxuICBvbkRlc3Ryb3koY2FsbGJhY2s6ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fZGVzdHJveUxpc3RlbmVycy5wdXNoKGNhbGxiYWNrKTsgfVxufVxuIl19