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
import { global } from '../util';
import { assertDefined } from './assert';
import { getComponent, getDirectives, getHostElement, getInjector, getPlayers, getRootComponents, getViewComponent, markDirty } from './global_utils_api';
/**
 * This value reflects the property on the window where the dev
 * tools are patched (window.ng).
 *
 * @type {?}
 */
export const GLOBAL_PUBLISH_EXPANDO_KEY = 'ng';
/*
 * Publishes a collection of default debug tools onto `window._ng_`.
 *
 * These functions are available globally when Angular is in development
 * mode and are automatically stripped away from prod mode is on.
 */
/** @type {?} */
let _published = false;
/**
 * @return {?}
 */
export function publishDefaultGlobalUtils() {
    if (!_published) {
        _published = true;
        publishGlobalUtil('getComponent', getComponent);
        publishGlobalUtil('getViewComponent', getViewComponent);
        publishGlobalUtil('getHostElement', getHostElement);
        publishGlobalUtil('getInjector', getInjector);
        publishGlobalUtil('getRootComponents', getRootComponents);
        publishGlobalUtil('getDirectives', getDirectives);
        publishGlobalUtil('getPlayers', getPlayers);
        publishGlobalUtil('markDirty', markDirty);
    }
}
/**
 * Publishes the given function to `window.ngDevMode` so that it can be
 * used from the browser console when an application is not in production.
 * @param {?} name
 * @param {?} fn
 * @return {?}
 */
export function publishGlobalUtil(name, fn) {
    /** @type {?} */
    const w = (/** @type {?} */ ((/** @type {?} */ (global))));
    ngDevMode && assertDefined(fn, 'function not defined');
    if (w) {
        /** @type {?} */
        let container = w[GLOBAL_PUBLISH_EXPANDO_KEY];
        if (!container) {
            container = w[GLOBAL_PUBLISH_EXPANDO_KEY] = {};
        }
        container[name] = fn;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsX3V0aWxzLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9nbG9iYWxfdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFPQSxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRS9CLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDdkMsT0FBTyxFQUFDLFlBQVksRUFBRSxhQUFhLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxFQUFDLE1BQU0sb0JBQW9CLENBQUM7Ozs7Ozs7QUFvQnhKLE1BQU0sT0FBTywwQkFBMEIsR0FBRyxJQUFJOzs7Ozs7OztJQVExQyxVQUFVLEdBQUcsS0FBSzs7OztBQUN0QixNQUFNLFVBQVUseUJBQXlCO0lBQ3ZDLElBQUksQ0FBQyxVQUFVLEVBQUU7UUFDZixVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLGlCQUFpQixDQUFDLGNBQWMsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUNoRCxpQkFBaUIsQ0FBQyxrQkFBa0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3hELGlCQUFpQixDQUFDLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ3BELGlCQUFpQixDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUM5QyxpQkFBaUIsQ0FBQyxtQkFBbUIsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQzFELGlCQUFpQixDQUFDLGVBQWUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUNsRCxpQkFBaUIsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDNUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0tBQzNDO0FBQ0gsQ0FBQzs7Ozs7Ozs7QUFVRCxNQUFNLFVBQVUsaUJBQWlCLENBQUMsSUFBWSxFQUFFLEVBQVk7O1VBQ3BELENBQUMsR0FBRyxtQkFBQSxtQkFBQSxNQUFNLEVBQU8sRUFBMEI7SUFDakQsU0FBUyxJQUFJLGFBQWEsQ0FBQyxFQUFFLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztJQUN2RCxJQUFJLENBQUMsRUFBRTs7WUFDRCxTQUFTLEdBQUcsQ0FBQyxDQUFDLDBCQUEwQixDQUFDO1FBQzdDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDZCxTQUFTLEdBQUcsQ0FBQyxDQUFDLDBCQUEwQixDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQ2hEO1FBQ0QsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztLQUN0QjtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge2dsb2JhbH0gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCB7YXNzZXJ0RGVmaW5lZH0gZnJvbSAnLi9hc3NlcnQnO1xuaW1wb3J0IHtnZXRDb21wb25lbnQsIGdldERpcmVjdGl2ZXMsIGdldEhvc3RFbGVtZW50LCBnZXRJbmplY3RvciwgZ2V0UGxheWVycywgZ2V0Um9vdENvbXBvbmVudHMsIGdldFZpZXdDb21wb25lbnQsIG1hcmtEaXJ0eX0gZnJvbSAnLi9nbG9iYWxfdXRpbHNfYXBpJztcblxuXG5cbi8qKlxuICogVGhpcyBmaWxlIGludHJvZHVjZXMgc2VyaWVzIG9mIGdsb2JhbGx5IGFjY2Vzc2libGUgZGVidWcgdG9vbHNcbiAqIHRvIGFsbG93IGZvciB0aGUgQW5ndWxhciBkZWJ1Z2dpbmcgc3RvcnkgdG8gZnVuY3Rpb24uXG4gKlxuICogVG8gc2VlIHRoaXMgaW4gYWN0aW9uIHJ1biB0aGUgZm9sbG93aW5nIGNvbW1hbmQ6XG4gKlxuICogICBiYXplbCBydW4gLS1kZWZpbmU9Y29tcGlsZT1hb3RcbiAqICAgLy9wYWNrYWdlcy9jb3JlL3Rlc3QvYnVuZGxpbmcvdG9kbzpkZXZzZXJ2ZXJcbiAqXG4gKiAgVGhlbiBsb2FkIGBsb2NhbGhvc3Q6NTQzMmAgYW5kIHN0YXJ0IHVzaW5nIHRoZSBjb25zb2xlIHRvb2xzLlxuICovXG5cbi8qKlxuICogVGhpcyB2YWx1ZSByZWZsZWN0cyB0aGUgcHJvcGVydHkgb24gdGhlIHdpbmRvdyB3aGVyZSB0aGUgZGV2XG4gKiB0b29scyBhcmUgcGF0Y2hlZCAod2luZG93Lm5nKS5cbiAqICovXG5leHBvcnQgY29uc3QgR0xPQkFMX1BVQkxJU0hfRVhQQU5ET19LRVkgPSAnbmcnO1xuXG4vKlxuICogUHVibGlzaGVzIGEgY29sbGVjdGlvbiBvZiBkZWZhdWx0IGRlYnVnIHRvb2xzIG9udG8gYHdpbmRvdy5fbmdfYC5cbiAqXG4gKiBUaGVzZSBmdW5jdGlvbnMgYXJlIGF2YWlsYWJsZSBnbG9iYWxseSB3aGVuIEFuZ3VsYXIgaXMgaW4gZGV2ZWxvcG1lbnRcbiAqIG1vZGUgYW5kIGFyZSBhdXRvbWF0aWNhbGx5IHN0cmlwcGVkIGF3YXkgZnJvbSBwcm9kIG1vZGUgaXMgb24uXG4gKi9cbmxldCBfcHVibGlzaGVkID0gZmFsc2U7XG5leHBvcnQgZnVuY3Rpb24gcHVibGlzaERlZmF1bHRHbG9iYWxVdGlscygpIHtcbiAgaWYgKCFfcHVibGlzaGVkKSB7XG4gICAgX3B1Ymxpc2hlZCA9IHRydWU7XG4gICAgcHVibGlzaEdsb2JhbFV0aWwoJ2dldENvbXBvbmVudCcsIGdldENvbXBvbmVudCk7XG4gICAgcHVibGlzaEdsb2JhbFV0aWwoJ2dldFZpZXdDb21wb25lbnQnLCBnZXRWaWV3Q29tcG9uZW50KTtcbiAgICBwdWJsaXNoR2xvYmFsVXRpbCgnZ2V0SG9zdEVsZW1lbnQnLCBnZXRIb3N0RWxlbWVudCk7XG4gICAgcHVibGlzaEdsb2JhbFV0aWwoJ2dldEluamVjdG9yJywgZ2V0SW5qZWN0b3IpO1xuICAgIHB1Ymxpc2hHbG9iYWxVdGlsKCdnZXRSb290Q29tcG9uZW50cycsIGdldFJvb3RDb21wb25lbnRzKTtcbiAgICBwdWJsaXNoR2xvYmFsVXRpbCgnZ2V0RGlyZWN0aXZlcycsIGdldERpcmVjdGl2ZXMpO1xuICAgIHB1Ymxpc2hHbG9iYWxVdGlsKCdnZXRQbGF5ZXJzJywgZ2V0UGxheWVycyk7XG4gICAgcHVibGlzaEdsb2JhbFV0aWwoJ21hcmtEaXJ0eScsIG1hcmtEaXJ0eSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlY2xhcmUgdHlwZSBHbG9iYWxEZXZNb2RlQ29udGFpbmVyID0ge1xuICBbR0xPQkFMX1BVQkxJU0hfRVhQQU5ET19LRVldOiB7W2ZuTmFtZTogc3RyaW5nXTogRnVuY3Rpb259O1xufTtcblxuLyoqXG4gKiBQdWJsaXNoZXMgdGhlIGdpdmVuIGZ1bmN0aW9uIHRvIGB3aW5kb3cubmdEZXZNb2RlYCBzbyB0aGF0IGl0IGNhbiBiZVxuICogdXNlZCBmcm9tIHRoZSBicm93c2VyIGNvbnNvbGUgd2hlbiBhbiBhcHBsaWNhdGlvbiBpcyBub3QgaW4gcHJvZHVjdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHB1Ymxpc2hHbG9iYWxVdGlsKG5hbWU6IHN0cmluZywgZm46IEZ1bmN0aW9uKTogdm9pZCB7XG4gIGNvbnN0IHcgPSBnbG9iYWwgYXMgYW55IGFzIEdsb2JhbERldk1vZGVDb250YWluZXI7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKGZuLCAnZnVuY3Rpb24gbm90IGRlZmluZWQnKTtcbiAgaWYgKHcpIHtcbiAgICBsZXQgY29udGFpbmVyID0gd1tHTE9CQUxfUFVCTElTSF9FWFBBTkRPX0tFWV07XG4gICAgaWYgKCFjb250YWluZXIpIHtcbiAgICAgIGNvbnRhaW5lciA9IHdbR0xPQkFMX1BVQkxJU0hfRVhQQU5ET19LRVldID0ge307XG4gICAgfVxuICAgIGNvbnRhaW5lcltuYW1lXSA9IGZuO1xuICB9XG59XG4iXX0=