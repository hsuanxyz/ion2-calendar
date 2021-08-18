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
import { defineInjectable } from './defs';
/**
 * Creates a token that can be used in a DI Provider.
 *
 * Use an `InjectionToken` whenever the type you are injecting is not reified (does not have a
 * runtime representation) such as when injecting an interface, callable type, array or
 * parametrized type.
 *
 * `InjectionToken` is parameterized on `T` which is the type of object which will be returned by
 * the `Injector`. This provides additional level of type safety.
 *
 * ```
 * interface MyInterface {...}
 * var myInterface = injector.get(new InjectionToken<MyInterface>('SomeToken'));
 * // myInterface is inferred to be MyInterface.
 * ```
 *
 * When creating an `InjectionToken`, you can optionally specify a factory function which returns
 * (possibly by creating) a default value of the parameterized type `T`. This sets up the
 * `InjectionToken` using this factory as a provider as if it was defined explicitly in the
 * application's root injector. If the factory function, which takes zero arguments, needs to inject
 * dependencies, it can do so using the `inject` function. See below for an example.
 *
 * Additionally, if a `factory` is specified you can also specify the `providedIn` option, which
 * overrides the above behavior and marks the token as belonging to a particular `\@NgModule`. As
 * mentioned above, `'root'` is the default value for `providedIn`.
 *
 * \@usageNotes
 * ### Basic Example
 *
 * ### Plain InjectionToken
 *
 * {\@example core/di/ts/injector_spec.ts region='InjectionToken'}
 *
 * ### Tree-shakable InjectionToken
 *
 * {\@example core/di/ts/injector_spec.ts region='ShakableInjectionToken'}
 *
 *
 * \@publicApi
 * @template T
 */
export class InjectionToken {
    /**
     * @param {?} _desc
     * @param {?=} options
     */
    constructor(_desc, options) {
        this._desc = _desc;
        /**
         * \@internal
         */
        this.ngMetadataName = 'InjectionToken';
        if (options !== undefined) {
            /** @nocollapse */ this.ngInjectableDef = defineInjectable({
                providedIn: options.providedIn || 'root',
                factory: options.factory,
            });
        }
        else {
            /** @nocollapse */ this.ngInjectableDef = undefined;
        }
    }
    /**
     * @return {?}
     */
    toString() { return `InjectionToken ${this._desc}`; }
}
if (false) {
    /**
     * \@internal
     * @type {?}
     */
    InjectionToken.prototype.ngMetadataName;
    /** @type {?} */
    InjectionToken.prototype.ngInjectableDef;
    /** @type {?} */
    InjectionToken.prototype._desc;
}
/**
 * @record
 * @template T
 */
export function InjectableDefToken() { }
if (false) {
    /** @type {?} */
    InjectableDefToken.prototype.ngInjectableDef;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0aW9uX3Rva2VuLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvY29yZS9zcmMvZGkvaW5qZWN0aW9uX3Rva2VuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBVUEsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sUUFBUSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEwQ3hDLE1BQU0sT0FBTyxjQUFjOzs7OztJQU16QixZQUFzQixLQUFhLEVBQUUsT0FHcEM7UUFIcUIsVUFBSyxHQUFMLEtBQUssQ0FBUTs7OztRQUoxQixtQkFBYyxHQUFHLGdCQUFnQixDQUFDO1FBUXpDLElBQUksT0FBTyxLQUFLLFNBQVMsRUFBRTtZQUN6QixJQUFJLENBQUMsZUFBZSxHQUFHLGdCQUFnQixDQUFDO2dCQUN0QyxVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVUsSUFBSSxNQUFNO2dCQUN4QyxPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU87YUFDekIsQ0FBQyxDQUFDO1NBQ0o7YUFBTTtZQUNMLElBQUksQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDO1NBQ2xDO0lBQ0gsQ0FBQzs7OztJQUVELFFBQVEsS0FBYSxPQUFPLGtCQUFrQixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzlEOzs7Ozs7SUFuQkMsd0NBQTJDOztJQUUzQyx5Q0FBMEM7O0lBRTlCLCtCQUF1Qjs7Ozs7O0FBaUJyQyx3Q0FBNEY7OztJQUF6Qiw2Q0FBdUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7VHlwZX0gZnJvbSAnLi4vdHlwZSc7XG5cbmltcG9ydCB7ZGVmaW5lSW5qZWN0YWJsZX0gZnJvbSAnLi9kZWZzJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgdG9rZW4gdGhhdCBjYW4gYmUgdXNlZCBpbiBhIERJIFByb3ZpZGVyLlxuICpcbiAqIFVzZSBhbiBgSW5qZWN0aW9uVG9rZW5gIHdoZW5ldmVyIHRoZSB0eXBlIHlvdSBhcmUgaW5qZWN0aW5nIGlzIG5vdCByZWlmaWVkIChkb2VzIG5vdCBoYXZlIGFcbiAqIHJ1bnRpbWUgcmVwcmVzZW50YXRpb24pIHN1Y2ggYXMgd2hlbiBpbmplY3RpbmcgYW4gaW50ZXJmYWNlLCBjYWxsYWJsZSB0eXBlLCBhcnJheSBvclxuICogcGFyYW1ldHJpemVkIHR5cGUuXG4gKlxuICogYEluamVjdGlvblRva2VuYCBpcyBwYXJhbWV0ZXJpemVkIG9uIGBUYCB3aGljaCBpcyB0aGUgdHlwZSBvZiBvYmplY3Qgd2hpY2ggd2lsbCBiZSByZXR1cm5lZCBieVxuICogdGhlIGBJbmplY3RvcmAuIFRoaXMgcHJvdmlkZXMgYWRkaXRpb25hbCBsZXZlbCBvZiB0eXBlIHNhZmV0eS5cbiAqXG4gKiBgYGBcbiAqIGludGVyZmFjZSBNeUludGVyZmFjZSB7Li4ufVxuICogdmFyIG15SW50ZXJmYWNlID0gaW5qZWN0b3IuZ2V0KG5ldyBJbmplY3Rpb25Ub2tlbjxNeUludGVyZmFjZT4oJ1NvbWVUb2tlbicpKTtcbiAqIC8vIG15SW50ZXJmYWNlIGlzIGluZmVycmVkIHRvIGJlIE15SW50ZXJmYWNlLlxuICogYGBgXG4gKlxuICogV2hlbiBjcmVhdGluZyBhbiBgSW5qZWN0aW9uVG9rZW5gLCB5b3UgY2FuIG9wdGlvbmFsbHkgc3BlY2lmeSBhIGZhY3RvcnkgZnVuY3Rpb24gd2hpY2ggcmV0dXJuc1xuICogKHBvc3NpYmx5IGJ5IGNyZWF0aW5nKSBhIGRlZmF1bHQgdmFsdWUgb2YgdGhlIHBhcmFtZXRlcml6ZWQgdHlwZSBgVGAuIFRoaXMgc2V0cyB1cCB0aGVcbiAqIGBJbmplY3Rpb25Ub2tlbmAgdXNpbmcgdGhpcyBmYWN0b3J5IGFzIGEgcHJvdmlkZXIgYXMgaWYgaXQgd2FzIGRlZmluZWQgZXhwbGljaXRseSBpbiB0aGVcbiAqIGFwcGxpY2F0aW9uJ3Mgcm9vdCBpbmplY3Rvci4gSWYgdGhlIGZhY3RvcnkgZnVuY3Rpb24sIHdoaWNoIHRha2VzIHplcm8gYXJndW1lbnRzLCBuZWVkcyB0byBpbmplY3RcbiAqIGRlcGVuZGVuY2llcywgaXQgY2FuIGRvIHNvIHVzaW5nIHRoZSBgaW5qZWN0YCBmdW5jdGlvbi4gU2VlIGJlbG93IGZvciBhbiBleGFtcGxlLlxuICpcbiAqIEFkZGl0aW9uYWxseSwgaWYgYSBgZmFjdG9yeWAgaXMgc3BlY2lmaWVkIHlvdSBjYW4gYWxzbyBzcGVjaWZ5IHRoZSBgcHJvdmlkZWRJbmAgb3B0aW9uLCB3aGljaFxuICogb3ZlcnJpZGVzIHRoZSBhYm92ZSBiZWhhdmlvciBhbmQgbWFya3MgdGhlIHRva2VuIGFzIGJlbG9uZ2luZyB0byBhIHBhcnRpY3VsYXIgYEBOZ01vZHVsZWAuIEFzXG4gKiBtZW50aW9uZWQgYWJvdmUsIGAncm9vdCdgIGlzIHRoZSBkZWZhdWx0IHZhbHVlIGZvciBgcHJvdmlkZWRJbmAuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqICMjIyBCYXNpYyBFeGFtcGxlXG4gKlxuICogIyMjIFBsYWluIEluamVjdGlvblRva2VuXG4gKlxuICoge0BleGFtcGxlIGNvcmUvZGkvdHMvaW5qZWN0b3Jfc3BlYy50cyByZWdpb249J0luamVjdGlvblRva2VuJ31cbiAqXG4gKiAjIyMgVHJlZS1zaGFrYWJsZSBJbmplY3Rpb25Ub2tlblxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL2RpL3RzL2luamVjdG9yX3NwZWMudHMgcmVnaW9uPSdTaGFrYWJsZUluamVjdGlvblRva2VuJ31cbiAqXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgSW5qZWN0aW9uVG9rZW48VD4ge1xuICAvKiogQGludGVybmFsICovXG4gIHJlYWRvbmx5IG5nTWV0YWRhdGFOYW1lID0gJ0luamVjdGlvblRva2VuJztcblxuICByZWFkb25seSBuZ0luamVjdGFibGVEZWY6IG5ldmVyfHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgX2Rlc2M6IHN0cmluZywgb3B0aW9ucz86IHtcbiAgICBwcm92aWRlZEluPzogVHlwZTxhbnk+fCAncm9vdCcgfCBudWxsLFxuICAgIGZhY3Rvcnk6ICgpID0+IFRcbiAgfSkge1xuICAgIGlmIChvcHRpb25zICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMubmdJbmplY3RhYmxlRGVmID0gZGVmaW5lSW5qZWN0YWJsZSh7XG4gICAgICAgIHByb3ZpZGVkSW46IG9wdGlvbnMucHJvdmlkZWRJbiB8fCAncm9vdCcsXG4gICAgICAgIGZhY3Rvcnk6IG9wdGlvbnMuZmFjdG9yeSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm5nSW5qZWN0YWJsZURlZiA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gYEluamVjdGlvblRva2VuICR7dGhpcy5fZGVzY31gOyB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW5qZWN0YWJsZURlZlRva2VuPFQ+IGV4dGVuZHMgSW5qZWN0aW9uVG9rZW48VD4geyBuZ0luamVjdGFibGVEZWY6IG5ldmVyOyB9XG4iXX0=