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
import { InjectionToken, NgModuleFactory } from '@angular/core';
// TODO(i): switch to fromPromise once it's expored in rxjs
import { from, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { LoadedRouterConfig, standardizeConfig } from './config';
import { flatten, wrapIntoObservable } from './utils/collection';
/**
 * \@docsNotRequired
 * \@publicApi
 * @type {?}
 */
export const ROUTES = new InjectionToken('ROUTES');
export class RouterConfigLoader {
    /**
     * @param {?} loader
     * @param {?} compiler
     * @param {?=} onLoadStartListener
     * @param {?=} onLoadEndListener
     */
    constructor(loader, compiler, onLoadStartListener, onLoadEndListener) {
        this.loader = loader;
        this.compiler = compiler;
        this.onLoadStartListener = onLoadStartListener;
        this.onLoadEndListener = onLoadEndListener;
    }
    /**
     * @param {?} parentInjector
     * @param {?} route
     * @return {?}
     */
    load(parentInjector, route) {
        if (this.onLoadStartListener) {
            this.onLoadStartListener(route);
        }
        /** @type {?} */
        const moduleFactory$ = this.loadModuleFactory((/** @type {?} */ (route.loadChildren)));
        return moduleFactory$.pipe(map((factory) => {
            if (this.onLoadEndListener) {
                this.onLoadEndListener(route);
            }
            /** @type {?} */
            const module = factory.create(parentInjector);
            return new LoadedRouterConfig(flatten(module.injector.get(ROUTES)).map(standardizeConfig), module);
        }));
    }
    /**
     * @param {?} loadChildren
     * @return {?}
     */
    loadModuleFactory(loadChildren) {
        if (typeof loadChildren === 'string') {
            return from(this.loader.load(loadChildren));
        }
        else {
            return wrapIntoObservable(loadChildren()).pipe(mergeMap((t) => {
                if (t instanceof NgModuleFactory) {
                    return of(t);
                }
                else {
                    return from(this.compiler.compileModuleAsync(t));
                }
            }));
        }
    }
}
if (false) {
    /** @type {?} */
    RouterConfigLoader.prototype.loader;
    /** @type {?} */
    RouterConfigLoader.prototype.compiler;
    /** @type {?} */
    RouterConfigLoader.prototype.onLoadStartListener;
    /** @type {?} */
    RouterConfigLoader.prototype.onLoadEndListener;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2NvbmZpZ19sb2FkZXIuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9yb3V0ZXIvc3JjL3JvdXRlcl9jb25maWdfbG9hZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFXLGNBQWMsRUFBWSxlQUFlLEVBQXdCLE1BQU0sZUFBZSxDQUFDOztBQUV6RyxPQUFPLEVBQWEsSUFBSSxFQUFFLEVBQUUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMzQyxPQUFPLEVBQUMsR0FBRyxFQUFFLFFBQVEsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzdDLE9BQU8sRUFBZSxrQkFBa0IsRUFBUyxpQkFBaUIsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUNwRixPQUFPLEVBQUMsT0FBTyxFQUFFLGtCQUFrQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7Ozs7OztBQU0vRCxNQUFNLE9BQU8sTUFBTSxHQUFHLElBQUksY0FBYyxDQUFZLFFBQVEsQ0FBQztBQUU3RCxNQUFNLE9BQU8sa0JBQWtCOzs7Ozs7O0lBQzdCLFlBQ1ksTUFBNkIsRUFBVSxRQUFrQixFQUN6RCxtQkFBd0MsRUFDeEMsaUJBQXNDO1FBRnRDLFdBQU0sR0FBTixNQUFNLENBQXVCO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUN6RCx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQ3hDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBcUI7SUFBRyxDQUFDOzs7Ozs7SUFFdEQsSUFBSSxDQUFDLGNBQXdCLEVBQUUsS0FBWTtRQUN6QyxJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUM1QixJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDakM7O2NBRUssY0FBYyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxtQkFBQSxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFbkUsT0FBTyxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQTZCLEVBQUUsRUFBRTtZQUMvRCxJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtnQkFDMUIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQy9COztrQkFFSyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUM7WUFFN0MsT0FBTyxJQUFJLGtCQUFrQixDQUN6QixPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMzRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ04sQ0FBQzs7Ozs7SUFFTyxpQkFBaUIsQ0FBQyxZQUEwQjtRQUNsRCxJQUFJLE9BQU8sWUFBWSxLQUFLLFFBQVEsRUFBRTtZQUNwQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1NBQzdDO2FBQU07WUFDTCxPQUFPLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFO2dCQUNqRSxJQUFJLENBQUMsWUFBWSxlQUFlLEVBQUU7b0JBQ2hDLE9BQU8sRUFBRSxDQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUNmO3FCQUFNO29CQUNMLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDbEQ7WUFDSCxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ0w7SUFDSCxDQUFDO0NBQ0Y7OztJQXBDSyxvQ0FBcUM7O0lBQUUsc0NBQTBCOztJQUNqRSxpREFBZ0Q7O0lBQ2hELCtDQUE4QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21waWxlciwgSW5qZWN0aW9uVG9rZW4sIEluamVjdG9yLCBOZ01vZHVsZUZhY3RvcnksIE5nTW9kdWxlRmFjdG9yeUxvYWRlcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG4vLyBUT0RPKGkpOiBzd2l0Y2ggdG8gZnJvbVByb21pc2Ugb25jZSBpdCdzIGV4cG9yZWQgaW4gcnhqc1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBmcm9tLCBvZiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHttYXAsIG1lcmdlTWFwfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge0xvYWRDaGlsZHJlbiwgTG9hZGVkUm91dGVyQ29uZmlnLCBSb3V0ZSwgc3RhbmRhcmRpemVDb25maWd9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7ZmxhdHRlbiwgd3JhcEludG9PYnNlcnZhYmxlfSBmcm9tICcuL3V0aWxzL2NvbGxlY3Rpb24nO1xuXG4vKipcbiAqIEBkb2NzTm90UmVxdWlyZWRcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IFJPVVRFUyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxSb3V0ZVtdW10+KCdST1VURVMnKTtcblxuZXhwb3J0IGNsYXNzIFJvdXRlckNvbmZpZ0xvYWRlciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBsb2FkZXI6IE5nTW9kdWxlRmFjdG9yeUxvYWRlciwgcHJpdmF0ZSBjb21waWxlcjogQ29tcGlsZXIsXG4gICAgICBwcml2YXRlIG9uTG9hZFN0YXJ0TGlzdGVuZXI/OiAocjogUm91dGUpID0+IHZvaWQsXG4gICAgICBwcml2YXRlIG9uTG9hZEVuZExpc3RlbmVyPzogKHI6IFJvdXRlKSA9PiB2b2lkKSB7fVxuXG4gIGxvYWQocGFyZW50SW5qZWN0b3I6IEluamVjdG9yLCByb3V0ZTogUm91dGUpOiBPYnNlcnZhYmxlPExvYWRlZFJvdXRlckNvbmZpZz4ge1xuICAgIGlmICh0aGlzLm9uTG9hZFN0YXJ0TGlzdGVuZXIpIHtcbiAgICAgIHRoaXMub25Mb2FkU3RhcnRMaXN0ZW5lcihyb3V0ZSk7XG4gICAgfVxuXG4gICAgY29uc3QgbW9kdWxlRmFjdG9yeSQgPSB0aGlzLmxvYWRNb2R1bGVGYWN0b3J5KHJvdXRlLmxvYWRDaGlsZHJlbiAhKTtcblxuICAgIHJldHVybiBtb2R1bGVGYWN0b3J5JC5waXBlKG1hcCgoZmFjdG9yeTogTmdNb2R1bGVGYWN0b3J5PGFueT4pID0+IHtcbiAgICAgIGlmICh0aGlzLm9uTG9hZEVuZExpc3RlbmVyKSB7XG4gICAgICAgIHRoaXMub25Mb2FkRW5kTGlzdGVuZXIocm91dGUpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBtb2R1bGUgPSBmYWN0b3J5LmNyZWF0ZShwYXJlbnRJbmplY3Rvcik7XG5cbiAgICAgIHJldHVybiBuZXcgTG9hZGVkUm91dGVyQ29uZmlnKFxuICAgICAgICAgIGZsYXR0ZW4obW9kdWxlLmluamVjdG9yLmdldChST1VURVMpKS5tYXAoc3RhbmRhcmRpemVDb25maWcpLCBtb2R1bGUpO1xuICAgIH0pKTtcbiAgfVxuXG4gIHByaXZhdGUgbG9hZE1vZHVsZUZhY3RvcnkobG9hZENoaWxkcmVuOiBMb2FkQ2hpbGRyZW4pOiBPYnNlcnZhYmxlPE5nTW9kdWxlRmFjdG9yeTxhbnk+PiB7XG4gICAgaWYgKHR5cGVvZiBsb2FkQ2hpbGRyZW4gPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gZnJvbSh0aGlzLmxvYWRlci5sb2FkKGxvYWRDaGlsZHJlbikpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gd3JhcEludG9PYnNlcnZhYmxlKGxvYWRDaGlsZHJlbigpKS5waXBlKG1lcmdlTWFwKCh0OiBhbnkpID0+IHtcbiAgICAgICAgaWYgKHQgaW5zdGFuY2VvZiBOZ01vZHVsZUZhY3RvcnkpIHtcbiAgICAgICAgICByZXR1cm4gb2YgKHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBmcm9tKHRoaXMuY29tcGlsZXIuY29tcGlsZU1vZHVsZUFzeW5jKHQpKTtcbiAgICAgICAgfVxuICAgICAgfSkpO1xuICAgIH1cbiAgfVxufVxuIl19