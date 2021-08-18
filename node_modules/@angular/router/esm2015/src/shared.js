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
/**
 * \@description
 *
 * Name of the primary outlet.
 *
 * \@publicApi
 * @type {?}
 */
export const PRIMARY_OUTLET = 'primary';
/**
 * Matrix and Query parameters.
 *
 * `ParamMap` makes it easier to work with parameters as they could have either a single value or
 * multiple value. Because this should be known by the user, calling `get` or `getAll` returns the
 * correct type (either `string` or `string[]`).
 *
 * The API is inspired by the URLSearchParams interface.
 * see https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
 *
 * \@publicApi
 * @record
 */
export function ParamMap() { }
if (false) {
    /**
     * Name of the parameters
     * @type {?}
     */
    ParamMap.prototype.keys;
    /**
     * @param {?} name
     * @return {?}
     */
    ParamMap.prototype.has = function (name) { };
    /**
     * Return a single value for the given parameter name:
     * - the value when the parameter has a single value,
     * - the first value if the parameter has multiple values,
     * - `null` when there is no such parameter.
     * @param {?} name
     * @return {?}
     */
    ParamMap.prototype.get = function (name) { };
    /**
     * Return an array of values for the given parameter name.
     *
     * If there is no such parameter, an empty array is returned.
     * @param {?} name
     * @return {?}
     */
    ParamMap.prototype.getAll = function (name) { };
}
class ParamsAsMap {
    /**
     * @param {?} params
     */
    constructor(params) { this.params = params || {}; }
    /**
     * @param {?} name
     * @return {?}
     */
    has(name) { return this.params.hasOwnProperty(name); }
    /**
     * @param {?} name
     * @return {?}
     */
    get(name) {
        if (this.has(name)) {
            /** @type {?} */
            const v = this.params[name];
            return Array.isArray(v) ? v[0] : v;
        }
        return null;
    }
    /**
     * @param {?} name
     * @return {?}
     */
    getAll(name) {
        if (this.has(name)) {
            /** @type {?} */
            const v = this.params[name];
            return Array.isArray(v) ? v : [v];
        }
        return [];
    }
    /**
     * @return {?}
     */
    get keys() { return Object.keys(this.params); }
}
if (false) {
    /** @type {?} */
    ParamsAsMap.prototype.params;
}
/**
 * Convert a `Params` instance to a `ParamMap`.
 *
 * \@publicApi
 * @param {?} params
 * @return {?}
 */
export function convertToParamMap(params) {
    return new ParamsAsMap(params);
}
/** @type {?} */
const NAVIGATION_CANCELING_ERROR = 'ngNavigationCancelingError';
/**
 * @param {?} message
 * @return {?}
 */
export function navigationCancelingError(message) {
    /** @type {?} */
    const error = Error('NavigationCancelingError: ' + message);
    ((/** @type {?} */ (error)))[NAVIGATION_CANCELING_ERROR] = true;
    return error;
}
/**
 * @param {?} error
 * @return {?}
 */
export function isNavigationCancelingError(error) {
    return error && ((/** @type {?} */ (error)))[NAVIGATION_CANCELING_ERROR];
}
// Matches the route configuration (`route`) against the actual URL (`segments`).
/**
 * @param {?} segments
 * @param {?} segmentGroup
 * @param {?} route
 * @return {?}
 */
export function defaultUrlMatcher(segments, segmentGroup, route) {
    /** @type {?} */
    const parts = (/** @type {?} */ (route.path)).split('/');
    if (parts.length > segments.length) {
        // The actual URL is shorter than the config, no match
        return null;
    }
    if (route.pathMatch === 'full' &&
        (segmentGroup.hasChildren() || parts.length < segments.length)) {
        // The config is longer than the actual URL but we are looking for a full match, return null
        return null;
    }
    /** @type {?} */
    const posParams = {};
    // Check each config part against the actual URL
    for (let index = 0; index < parts.length; index++) {
        /** @type {?} */
        const part = parts[index];
        /** @type {?} */
        const segment = segments[index];
        /** @type {?} */
        const isParameter = part.startsWith(':');
        if (isParameter) {
            posParams[part.substring(1)] = segment;
        }
        else if (part !== segment.path) {
            // The actual URL part does not match the config, no match
            return null;
        }
    }
    return { consumed: segments.slice(0, parts.length), posParams };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvcm91dGVyL3NyYy9zaGFyZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1CQSxNQUFNLE9BQU8sY0FBYyxHQUFHLFNBQVM7Ozs7Ozs7Ozs7Ozs7O0FBdUJ2Qyw4QkFrQkM7Ozs7OztJQURDLHdCQUF3Qjs7Ozs7SUFoQnhCLDZDQUEyQjs7Ozs7Ozs7O0lBTzNCLDZDQUErQjs7Ozs7Ozs7SUFNL0IsZ0RBQStCOztBQU1qQyxNQUFNLFdBQVc7Ozs7SUFHZixZQUFZLE1BQWMsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7OztJQUUzRCxHQUFHLENBQUMsSUFBWSxJQUFhLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztJQUV2RSxHQUFHLENBQUMsSUFBWTtRQUNkLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTs7a0JBQ1osQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQzNCLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDcEM7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7Ozs7O0lBRUQsTUFBTSxDQUFDLElBQVk7UUFDakIsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFOztrQkFDWixDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDM0IsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbkM7UUFFRCxPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7Ozs7SUFFRCxJQUFJLElBQUksS0FBZSxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUMxRDs7O0lBekJDLDZCQUF1Qjs7Ozs7Ozs7O0FBZ0N6QixNQUFNLFVBQVUsaUJBQWlCLENBQUMsTUFBYztJQUM5QyxPQUFPLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2pDLENBQUM7O01BRUssMEJBQTBCLEdBQUcsNEJBQTRCOzs7OztBQUUvRCxNQUFNLFVBQVUsd0JBQXdCLENBQUMsT0FBZTs7VUFDaEQsS0FBSyxHQUFHLEtBQUssQ0FBQyw0QkFBNEIsR0FBRyxPQUFPLENBQUM7SUFDM0QsQ0FBQyxtQkFBQSxLQUFLLEVBQU8sQ0FBQyxDQUFDLDBCQUEwQixDQUFDLEdBQUcsSUFBSSxDQUFDO0lBQ2xELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQzs7Ozs7QUFFRCxNQUFNLFVBQVUsMEJBQTBCLENBQUMsS0FBWTtJQUNyRCxPQUFPLEtBQUssSUFBSSxDQUFDLG1CQUFBLEtBQUssRUFBTyxDQUFDLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUM3RCxDQUFDOzs7Ozs7OztBQUdELE1BQU0sVUFBVSxpQkFBaUIsQ0FDN0IsUUFBc0IsRUFBRSxZQUE2QixFQUFFLEtBQVk7O1VBQy9ELEtBQUssR0FBRyxtQkFBQSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztJQUVyQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRTtRQUNsQyxzREFBc0Q7UUFDdEQsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUVELElBQUksS0FBSyxDQUFDLFNBQVMsS0FBSyxNQUFNO1FBQzFCLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQ2xFLDRGQUE0RjtRQUM1RixPQUFPLElBQUksQ0FBQztLQUNiOztVQUVLLFNBQVMsR0FBZ0MsRUFBRTtJQUVqRCxnREFBZ0Q7SUFDaEQsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUU7O2NBQzNDLElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDOztjQUNuQixPQUFPLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQzs7Y0FDekIsV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDO1FBQ3hDLElBQUksV0FBVyxFQUFFO1lBQ2YsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUM7U0FDeEM7YUFBTSxJQUFJLElBQUksS0FBSyxPQUFPLENBQUMsSUFBSSxFQUFFO1lBQ2hDLDBEQUEwRDtZQUMxRCxPQUFPLElBQUksQ0FBQztTQUNiO0tBQ0Y7SUFFRCxPQUFPLEVBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxTQUFTLEVBQUMsQ0FBQztBQUNoRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1JvdXRlLCBVcmxNYXRjaFJlc3VsdH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtVcmxTZWdtZW50LCBVcmxTZWdtZW50R3JvdXB9IGZyb20gJy4vdXJsX3RyZWUnO1xuXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogTmFtZSBvZiB0aGUgcHJpbWFyeSBvdXRsZXQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgUFJJTUFSWV9PVVRMRVQgPSAncHJpbWFyeSc7XG5cbi8qKlxuICogQSBjb2xsZWN0aW9uIG9mIHBhcmFtZXRlcnMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgdHlwZSBQYXJhbXMgPSB7XG4gIFtrZXk6IHN0cmluZ106IGFueVxufTtcblxuLyoqXG4gKiBNYXRyaXggYW5kIFF1ZXJ5IHBhcmFtZXRlcnMuXG4gKlxuICogYFBhcmFtTWFwYCBtYWtlcyBpdCBlYXNpZXIgdG8gd29yayB3aXRoIHBhcmFtZXRlcnMgYXMgdGhleSBjb3VsZCBoYXZlIGVpdGhlciBhIHNpbmdsZSB2YWx1ZSBvclxuICogbXVsdGlwbGUgdmFsdWUuIEJlY2F1c2UgdGhpcyBzaG91bGQgYmUga25vd24gYnkgdGhlIHVzZXIsIGNhbGxpbmcgYGdldGAgb3IgYGdldEFsbGAgcmV0dXJucyB0aGVcbiAqIGNvcnJlY3QgdHlwZSAoZWl0aGVyIGBzdHJpbmdgIG9yIGBzdHJpbmdbXWApLlxuICpcbiAqIFRoZSBBUEkgaXMgaW5zcGlyZWQgYnkgdGhlIFVSTFNlYXJjaFBhcmFtcyBpbnRlcmZhY2UuXG4gKiBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1VSTFNlYXJjaFBhcmFtc1xuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQYXJhbU1hcCB7XG4gIGhhcyhuYW1lOiBzdHJpbmcpOiBib29sZWFuO1xuICAvKipcbiAgICogUmV0dXJuIGEgc2luZ2xlIHZhbHVlIGZvciB0aGUgZ2l2ZW4gcGFyYW1ldGVyIG5hbWU6XG4gICAqIC0gdGhlIHZhbHVlIHdoZW4gdGhlIHBhcmFtZXRlciBoYXMgYSBzaW5nbGUgdmFsdWUsXG4gICAqIC0gdGhlIGZpcnN0IHZhbHVlIGlmIHRoZSBwYXJhbWV0ZXIgaGFzIG11bHRpcGxlIHZhbHVlcyxcbiAgICogLSBgbnVsbGAgd2hlbiB0aGVyZSBpcyBubyBzdWNoIHBhcmFtZXRlci5cbiAgICovXG4gIGdldChuYW1lOiBzdHJpbmcpOiBzdHJpbmd8bnVsbDtcbiAgLyoqXG4gICAqIFJldHVybiBhbiBhcnJheSBvZiB2YWx1ZXMgZm9yIHRoZSBnaXZlbiBwYXJhbWV0ZXIgbmFtZS5cbiAgICpcbiAgICogSWYgdGhlcmUgaXMgbm8gc3VjaCBwYXJhbWV0ZXIsIGFuIGVtcHR5IGFycmF5IGlzIHJldHVybmVkLlxuICAgKi9cbiAgZ2V0QWxsKG5hbWU6IHN0cmluZyk6IHN0cmluZ1tdO1xuXG4gIC8qKiBOYW1lIG9mIHRoZSBwYXJhbWV0ZXJzICovXG4gIHJlYWRvbmx5IGtleXM6IHN0cmluZ1tdO1xufVxuXG5jbGFzcyBQYXJhbXNBc01hcCBpbXBsZW1lbnRzIFBhcmFtTWFwIHtcbiAgcHJpdmF0ZSBwYXJhbXM6IFBhcmFtcztcblxuICBjb25zdHJ1Y3RvcihwYXJhbXM6IFBhcmFtcykgeyB0aGlzLnBhcmFtcyA9IHBhcmFtcyB8fCB7fTsgfVxuXG4gIGhhcyhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMucGFyYW1zLmhhc093blByb3BlcnR5KG5hbWUpOyB9XG5cbiAgZ2V0KG5hbWU6IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICBpZiAodGhpcy5oYXMobmFtZSkpIHtcbiAgICAgIGNvbnN0IHYgPSB0aGlzLnBhcmFtc1tuYW1lXTtcbiAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KHYpID8gdlswXSA6IHY7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBnZXRBbGwobmFtZTogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgIGlmICh0aGlzLmhhcyhuYW1lKSkge1xuICAgICAgY29uc3QgdiA9IHRoaXMucGFyYW1zW25hbWVdO1xuICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodikgPyB2IDogW3ZdO1xuICAgIH1cblxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGdldCBrZXlzKCk6IHN0cmluZ1tdIHsgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMucGFyYW1zKTsgfVxufVxuXG4vKipcbiAqIENvbnZlcnQgYSBgUGFyYW1zYCBpbnN0YW5jZSB0byBhIGBQYXJhbU1hcGAuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udmVydFRvUGFyYW1NYXAocGFyYW1zOiBQYXJhbXMpOiBQYXJhbU1hcCB7XG4gIHJldHVybiBuZXcgUGFyYW1zQXNNYXAocGFyYW1zKTtcbn1cblxuY29uc3QgTkFWSUdBVElPTl9DQU5DRUxJTkdfRVJST1IgPSAnbmdOYXZpZ2F0aW9uQ2FuY2VsaW5nRXJyb3InO1xuXG5leHBvcnQgZnVuY3Rpb24gbmF2aWdhdGlvbkNhbmNlbGluZ0Vycm9yKG1lc3NhZ2U6IHN0cmluZykge1xuICBjb25zdCBlcnJvciA9IEVycm9yKCdOYXZpZ2F0aW9uQ2FuY2VsaW5nRXJyb3I6ICcgKyBtZXNzYWdlKTtcbiAgKGVycm9yIGFzIGFueSlbTkFWSUdBVElPTl9DQU5DRUxJTkdfRVJST1JdID0gdHJ1ZTtcbiAgcmV0dXJuIGVycm9yO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOYXZpZ2F0aW9uQ2FuY2VsaW5nRXJyb3IoZXJyb3I6IEVycm9yKSB7XG4gIHJldHVybiBlcnJvciAmJiAoZXJyb3IgYXMgYW55KVtOQVZJR0FUSU9OX0NBTkNFTElOR19FUlJPUl07XG59XG5cbi8vIE1hdGNoZXMgdGhlIHJvdXRlIGNvbmZpZ3VyYXRpb24gKGByb3V0ZWApIGFnYWluc3QgdGhlIGFjdHVhbCBVUkwgKGBzZWdtZW50c2ApLlxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRVcmxNYXRjaGVyKFxuICAgIHNlZ21lbnRzOiBVcmxTZWdtZW50W10sIHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwLCByb3V0ZTogUm91dGUpOiBVcmxNYXRjaFJlc3VsdHxudWxsIHtcbiAgY29uc3QgcGFydHMgPSByb3V0ZS5wYXRoICEuc3BsaXQoJy8nKTtcblxuICBpZiAocGFydHMubGVuZ3RoID4gc2VnbWVudHMubGVuZ3RoKSB7XG4gICAgLy8gVGhlIGFjdHVhbCBVUkwgaXMgc2hvcnRlciB0aGFuIHRoZSBjb25maWcsIG5vIG1hdGNoXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBpZiAocm91dGUucGF0aE1hdGNoID09PSAnZnVsbCcgJiZcbiAgICAgIChzZWdtZW50R3JvdXAuaGFzQ2hpbGRyZW4oKSB8fCBwYXJ0cy5sZW5ndGggPCBzZWdtZW50cy5sZW5ndGgpKSB7XG4gICAgLy8gVGhlIGNvbmZpZyBpcyBsb25nZXIgdGhhbiB0aGUgYWN0dWFsIFVSTCBidXQgd2UgYXJlIGxvb2tpbmcgZm9yIGEgZnVsbCBtYXRjaCwgcmV0dXJuIG51bGxcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IHBvc1BhcmFtczoge1trZXk6IHN0cmluZ106IFVybFNlZ21lbnR9ID0ge307XG5cbiAgLy8gQ2hlY2sgZWFjaCBjb25maWcgcGFydCBhZ2FpbnN0IHRoZSBhY3R1YWwgVVJMXG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBwYXJ0cy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICBjb25zdCBwYXJ0ID0gcGFydHNbaW5kZXhdO1xuICAgIGNvbnN0IHNlZ21lbnQgPSBzZWdtZW50c1tpbmRleF07XG4gICAgY29uc3QgaXNQYXJhbWV0ZXIgPSBwYXJ0LnN0YXJ0c1dpdGgoJzonKTtcbiAgICBpZiAoaXNQYXJhbWV0ZXIpIHtcbiAgICAgIHBvc1BhcmFtc1twYXJ0LnN1YnN0cmluZygxKV0gPSBzZWdtZW50O1xuICAgIH0gZWxzZSBpZiAocGFydCAhPT0gc2VnbWVudC5wYXRoKSB7XG4gICAgICAvLyBUaGUgYWN0dWFsIFVSTCBwYXJ0IGRvZXMgbm90IG1hdGNoIHRoZSBjb25maWcsIG5vIG1hdGNoXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge2NvbnN1bWVkOiBzZWdtZW50cy5zbGljZSgwLCBwYXJ0cy5sZW5ndGgpLCBwb3NQYXJhbXN9O1xufVxuIl19