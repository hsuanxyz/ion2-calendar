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
import { Injector } from '../di/injector';
import { NgModuleFactory } from '../linker/ng_module_factory';
import { initServicesIfNeeded } from './services';
import { Services } from './types';
import { resolveDefinition } from './util';
/**
 * @param {?} override
 * @return {?}
 */
export function overrideProvider(override) {
    initServicesIfNeeded();
    return Services.overrideProvider(override);
}
/**
 * @param {?} comp
 * @param {?} componentFactory
 * @return {?}
 */
export function overrideComponentView(comp, componentFactory) {
    initServicesIfNeeded();
    return Services.overrideComponentView(comp, componentFactory);
}
/**
 * @return {?}
 */
export function clearOverrides() {
    initServicesIfNeeded();
    return Services.clearOverrides();
}
// Attention: this function is called as top level function.
// Putting any logic in here will destroy closure tree shaking!
/**
 * @param {?} ngModuleType
 * @param {?} bootstrapComponents
 * @param {?} defFactory
 * @return {?}
 */
export function createNgModuleFactory(ngModuleType, bootstrapComponents, defFactory) {
    return new NgModuleFactory_(ngModuleType, bootstrapComponents, defFactory);
}
/**
 * @param {?} def
 * @return {?}
 */
function cloneNgModuleDefinition(def) {
    /** @type {?} */
    const providers = Array.from(def.providers);
    /** @type {?} */
    const modules = Array.from(def.modules);
    /** @type {?} */
    const providersByKey = {};
    for (const key in def.providersByKey) {
        providersByKey[key] = def.providersByKey[key];
    }
    return {
        factory: def.factory,
        isRoot: def.isRoot, providers, modules, providersByKey,
    };
}
class NgModuleFactory_ extends NgModuleFactory {
    /**
     * @param {?} moduleType
     * @param {?} _bootstrapComponents
     * @param {?} _ngModuleDefFactory
     */
    constructor(moduleType, _bootstrapComponents, _ngModuleDefFactory) {
        // Attention: this ctor is called as top level function.
        // Putting any logic in here will destroy closure tree shaking!
        super();
        this.moduleType = moduleType;
        this._bootstrapComponents = _bootstrapComponents;
        this._ngModuleDefFactory = _ngModuleDefFactory;
    }
    /**
     * @param {?} parentInjector
     * @return {?}
     */
    create(parentInjector) {
        initServicesIfNeeded();
        // Clone the NgModuleDefinition so that any tree shakeable provider definition
        // added to this instance of the NgModuleRef doesn't affect the cached copy.
        // See https://github.com/angular/angular/issues/25018.
        /** @type {?} */
        const def = cloneNgModuleDefinition(resolveDefinition(this._ngModuleDefFactory));
        return Services.createNgModuleRef(this.moduleType, parentInjector || Injector.NULL, this._bootstrapComponents, def);
    }
}
if (false) {
    /** @type {?} */
    NgModuleFactory_.prototype.moduleType;
    /** @type {?} */
    NgModuleFactory_.prototype._bootstrapComponents;
    /** @type {?} */
    NgModuleFactory_.prototype._ngModuleDefFactory;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlwb2ludC5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2NvcmUvc3JjL3ZpZXcvZW50cnlwb2ludC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QyxPQUFPLEVBQUMsZUFBZSxFQUFjLE1BQU0sNkJBQTZCLENBQUM7QUFHekUsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ2hELE9BQU8sRUFBdUYsUUFBUSxFQUFpQixNQUFNLFNBQVMsQ0FBQztBQUN2SSxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxRQUFRLENBQUM7Ozs7O0FBRXpDLE1BQU0sVUFBVSxnQkFBZ0IsQ0FBQyxRQUEwQjtJQUN6RCxvQkFBb0IsRUFBRSxDQUFDO0lBQ3ZCLE9BQU8sUUFBUSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzdDLENBQUM7Ozs7OztBQUVELE1BQU0sVUFBVSxxQkFBcUIsQ0FBQyxJQUFlLEVBQUUsZ0JBQXVDO0lBQzVGLG9CQUFvQixFQUFFLENBQUM7SUFDdkIsT0FBTyxRQUFRLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUM7QUFDaEUsQ0FBQzs7OztBQUVELE1BQU0sVUFBVSxjQUFjO0lBQzVCLG9CQUFvQixFQUFFLENBQUM7SUFDdkIsT0FBTyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDbkMsQ0FBQzs7Ozs7Ozs7O0FBSUQsTUFBTSxVQUFVLHFCQUFxQixDQUNqQyxZQUF1QixFQUFFLG1CQUFnQyxFQUN6RCxVQUFxQztJQUN2QyxPQUFPLElBQUksZ0JBQWdCLENBQUMsWUFBWSxFQUFFLG1CQUFtQixFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQzdFLENBQUM7Ozs7O0FBRUQsU0FBUyx1QkFBdUIsQ0FBQyxHQUF1Qjs7VUFDaEQsU0FBUyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQzs7VUFDckMsT0FBTyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQzs7VUFDakMsY0FBYyxHQUE4QyxFQUFFO0lBQ3BFLEtBQUssTUFBTSxHQUFHLElBQUksR0FBRyxDQUFDLGNBQWMsRUFBRTtRQUNwQyxjQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUMvQztJQUVELE9BQU87UUFDTCxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU87UUFDcEIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxjQUFjO0tBQ3ZELENBQUM7QUFDSixDQUFDO0FBRUQsTUFBTSxnQkFBaUIsU0FBUSxlQUFvQjs7Ozs7O0lBQ2pELFlBQ29CLFVBQXFCLEVBQVUsb0JBQWlDLEVBQ3hFLG1CQUE4QztRQUN4RCx3REFBd0Q7UUFDeEQsK0RBQStEO1FBQy9ELEtBQUssRUFBRSxDQUFDO1FBSlUsZUFBVSxHQUFWLFVBQVUsQ0FBVztRQUFVLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBYTtRQUN4RSx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQTJCO0lBSTFELENBQUM7Ozs7O0lBRUQsTUFBTSxDQUFDLGNBQTZCO1FBQ2xDLG9CQUFvQixFQUFFLENBQUM7Ozs7O2NBSWpCLEdBQUcsR0FBRyx1QkFBdUIsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUNoRixPQUFPLFFBQVEsQ0FBQyxpQkFBaUIsQ0FDN0IsSUFBSSxDQUFDLFVBQVUsRUFBRSxjQUFjLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDeEYsQ0FBQztDQUNGOzs7SUFoQkssc0NBQXFDOztJQUFFLGdEQUF5Qzs7SUFDaEYsK0NBQXNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdG9yfSBmcm9tICcuLi9kaS9pbmplY3Rvcic7XG5pbXBvcnQge0NvbXBvbmVudEZhY3Rvcnl9IGZyb20gJy4uL2xpbmtlci9jb21wb25lbnRfZmFjdG9yeSc7XG5pbXBvcnQge05nTW9kdWxlRmFjdG9yeSwgTmdNb2R1bGVSZWZ9IGZyb20gJy4uL2xpbmtlci9uZ19tb2R1bGVfZmFjdG9yeSc7XG5pbXBvcnQge1R5cGV9IGZyb20gJy4uL3R5cGUnO1xuXG5pbXBvcnQge2luaXRTZXJ2aWNlc0lmTmVlZGVkfSBmcm9tICcuL3NlcnZpY2VzJztcbmltcG9ydCB7TmdNb2R1bGVEZWZpbml0aW9uLCBOZ01vZHVsZURlZmluaXRpb25GYWN0b3J5LCBOZ01vZHVsZVByb3ZpZGVyRGVmLCBQcm92aWRlck92ZXJyaWRlLCBTZXJ2aWNlcywgVmlld0RlZmluaXRpb259IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHtyZXNvbHZlRGVmaW5pdGlvbn0gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGZ1bmN0aW9uIG92ZXJyaWRlUHJvdmlkZXIob3ZlcnJpZGU6IFByb3ZpZGVyT3ZlcnJpZGUpIHtcbiAgaW5pdFNlcnZpY2VzSWZOZWVkZWQoKTtcbiAgcmV0dXJuIFNlcnZpY2VzLm92ZXJyaWRlUHJvdmlkZXIob3ZlcnJpZGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3ZlcnJpZGVDb21wb25lbnRWaWV3KGNvbXA6IFR5cGU8YW55PiwgY29tcG9uZW50RmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxhbnk+KSB7XG4gIGluaXRTZXJ2aWNlc0lmTmVlZGVkKCk7XG4gIHJldHVybiBTZXJ2aWNlcy5vdmVycmlkZUNvbXBvbmVudFZpZXcoY29tcCwgY29tcG9uZW50RmFjdG9yeSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhck92ZXJyaWRlcygpIHtcbiAgaW5pdFNlcnZpY2VzSWZOZWVkZWQoKTtcbiAgcmV0dXJuIFNlcnZpY2VzLmNsZWFyT3ZlcnJpZGVzKCk7XG59XG5cbi8vIEF0dGVudGlvbjogdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgYXMgdG9wIGxldmVsIGZ1bmN0aW9uLlxuLy8gUHV0dGluZyBhbnkgbG9naWMgaW4gaGVyZSB3aWxsIGRlc3Ryb3kgY2xvc3VyZSB0cmVlIHNoYWtpbmchXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTmdNb2R1bGVGYWN0b3J5KFxuICAgIG5nTW9kdWxlVHlwZTogVHlwZTxhbnk+LCBib290c3RyYXBDb21wb25lbnRzOiBUeXBlPGFueT5bXSxcbiAgICBkZWZGYWN0b3J5OiBOZ01vZHVsZURlZmluaXRpb25GYWN0b3J5KTogTmdNb2R1bGVGYWN0b3J5PGFueT4ge1xuICByZXR1cm4gbmV3IE5nTW9kdWxlRmFjdG9yeV8obmdNb2R1bGVUeXBlLCBib290c3RyYXBDb21wb25lbnRzLCBkZWZGYWN0b3J5KTtcbn1cblxuZnVuY3Rpb24gY2xvbmVOZ01vZHVsZURlZmluaXRpb24oZGVmOiBOZ01vZHVsZURlZmluaXRpb24pOiBOZ01vZHVsZURlZmluaXRpb24ge1xuICBjb25zdCBwcm92aWRlcnMgPSBBcnJheS5mcm9tKGRlZi5wcm92aWRlcnMpO1xuICBjb25zdCBtb2R1bGVzID0gQXJyYXkuZnJvbShkZWYubW9kdWxlcyk7XG4gIGNvbnN0IHByb3ZpZGVyc0J5S2V5OiB7W3Rva2VuS2V5OiBzdHJpbmddOiBOZ01vZHVsZVByb3ZpZGVyRGVmfSA9IHt9O1xuICBmb3IgKGNvbnN0IGtleSBpbiBkZWYucHJvdmlkZXJzQnlLZXkpIHtcbiAgICBwcm92aWRlcnNCeUtleVtrZXldID0gZGVmLnByb3ZpZGVyc0J5S2V5W2tleV07XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGZhY3Rvcnk6IGRlZi5mYWN0b3J5LFxuICAgIGlzUm9vdDogZGVmLmlzUm9vdCwgcHJvdmlkZXJzLCBtb2R1bGVzLCBwcm92aWRlcnNCeUtleSxcbiAgfTtcbn1cblxuY2xhc3MgTmdNb2R1bGVGYWN0b3J5XyBleHRlbmRzIE5nTW9kdWxlRmFjdG9yeTxhbnk+IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgcmVhZG9ubHkgbW9kdWxlVHlwZTogVHlwZTxhbnk+LCBwcml2YXRlIF9ib290c3RyYXBDb21wb25lbnRzOiBUeXBlPGFueT5bXSxcbiAgICAgIHByaXZhdGUgX25nTW9kdWxlRGVmRmFjdG9yeTogTmdNb2R1bGVEZWZpbml0aW9uRmFjdG9yeSkge1xuICAgIC8vIEF0dGVudGlvbjogdGhpcyBjdG9yIGlzIGNhbGxlZCBhcyB0b3AgbGV2ZWwgZnVuY3Rpb24uXG4gICAgLy8gUHV0dGluZyBhbnkgbG9naWMgaW4gaGVyZSB3aWxsIGRlc3Ryb3kgY2xvc3VyZSB0cmVlIHNoYWtpbmchXG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGNyZWF0ZShwYXJlbnRJbmplY3RvcjogSW5qZWN0b3J8bnVsbCk6IE5nTW9kdWxlUmVmPGFueT4ge1xuICAgIGluaXRTZXJ2aWNlc0lmTmVlZGVkKCk7XG4gICAgLy8gQ2xvbmUgdGhlIE5nTW9kdWxlRGVmaW5pdGlvbiBzbyB0aGF0IGFueSB0cmVlIHNoYWtlYWJsZSBwcm92aWRlciBkZWZpbml0aW9uXG4gICAgLy8gYWRkZWQgdG8gdGhpcyBpbnN0YW5jZSBvZiB0aGUgTmdNb2R1bGVSZWYgZG9lc24ndCBhZmZlY3QgdGhlIGNhY2hlZCBjb3B5LlxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8yNTAxOC5cbiAgICBjb25zdCBkZWYgPSBjbG9uZU5nTW9kdWxlRGVmaW5pdGlvbihyZXNvbHZlRGVmaW5pdGlvbih0aGlzLl9uZ01vZHVsZURlZkZhY3RvcnkpKTtcbiAgICByZXR1cm4gU2VydmljZXMuY3JlYXRlTmdNb2R1bGVSZWYoXG4gICAgICAgIHRoaXMubW9kdWxlVHlwZSwgcGFyZW50SW5qZWN0b3IgfHwgSW5qZWN0b3IuTlVMTCwgdGhpcy5fYm9vdHN0cmFwQ29tcG9uZW50cywgZGVmKTtcbiAgfVxufVxuIl19