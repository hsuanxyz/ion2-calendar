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
import { Injectable } from '@angular/core';
import { RequestMethod } from './enums';
import { Headers } from './headers';
import { normalizeMethodName } from './http_utils';
import { URLSearchParams } from './url_search_params';
/**
 * Creates a request options object to be optionally provided when instantiating a
 * {\@link Request}.
 *
 * This class is based on the `RequestInit` description in the [Fetch
 * Spec](https://fetch.spec.whatwg.org/#requestinit).
 *
 * All values are null by default. Typical defaults can be found in the {\@link BaseRequestOptions}
 * class, which sub-classes `RequestOptions`.
 *
 * ```typescript
 * import {RequestOptions, Request, RequestMethod} from '\@angular/http';
 *
 * const options = new RequestOptions({
 *   method: RequestMethod.Post,
 *   url: 'https://google.com'
 * });
 * const req = new Request(options);
 * console.log('req.method:', RequestMethod[req.method]); // Post
 * console.log('options.url:', options.url); // https://google.com
 * ```
 *
 * @deprecated see https://angular.io/guide/http
 * \@publicApi
 */
export class RequestOptions {
    /**
     * @deprecated from 4.0.0. Use params instead.
     * @return {?}
     */
    get search() { return this.params; }
    /**
     * @deprecated from 4.0.0. Use params instead.
     * @param {?} params
     * @return {?}
     */
    set search(params) { this.params = params; }
    // TODO(Dzmitry): remove search when this.search is removed
    /**
     * @param {?=} opts
     */
    constructor(opts = {}) {
        const { method, headers, body, url, search, params, withCredentials, responseType } = opts;
        this.method = method != null ? normalizeMethodName(method) : null;
        this.headers = headers != null ? headers : null;
        this.body = body != null ? body : null;
        this.url = url != null ? url : null;
        this.params = this._mergeSearchParams(params || search);
        this.withCredentials = withCredentials != null ? withCredentials : null;
        this.responseType = responseType != null ? responseType : null;
    }
    /**
     * Creates a copy of the `RequestOptions` instance, using the optional input as values to override
     * existing values. This method will not change the values of the instance on which it is being
     * called.
     *
     * Note that `headers` and `search` will override existing values completely if present in
     * the `options` object. If these values should be merged, it should be done prior to calling
     * `merge` on the `RequestOptions` instance.
     *
     * ```typescript
     * import {RequestOptions, Request, RequestMethod} from '\@angular/http';
     *
     * const options = new RequestOptions({
     *   method: RequestMethod.Post
     * });
     * const req = new Request(options.merge({
     *   url: 'https://google.com'
     * }));
     * console.log('req.method:', RequestMethod[req.method]); // Post
     * console.log('options.url:', options.url); // null
     * console.log('req.url:', req.url); // https://google.com
     * ```
     * @param {?=} options
     * @return {?}
     */
    merge(options) {
        return new RequestOptions({
            method: options && options.method != null ? options.method : this.method,
            headers: options && options.headers != null ? options.headers : new Headers(this.headers),
            body: options && options.body != null ? options.body : this.body,
            url: options && options.url != null ? options.url : this.url,
            params: options && this._mergeSearchParams(options.params || options.search),
            withCredentials: options && options.withCredentials != null ? options.withCredentials :
                this.withCredentials,
            responseType: options && options.responseType != null ? options.responseType :
                this.responseType
        });
    }
    /**
     * @param {?=} params
     * @return {?}
     */
    _mergeSearchParams(params) {
        if (!params)
            return this.params;
        if (params instanceof URLSearchParams) {
            return params.clone();
        }
        if (typeof params === 'string') {
            return new URLSearchParams(params);
        }
        return this._parseParams(params);
    }
    /**
     * @param {?=} objParams
     * @return {?}
     */
    _parseParams(objParams = {}) {
        /** @type {?} */
        const params = new URLSearchParams();
        Object.keys(objParams).forEach((key) => {
            /** @type {?} */
            const value = objParams[key];
            if (Array.isArray(value)) {
                value.forEach((item) => this._appendParam(key, item, params));
            }
            else {
                this._appendParam(key, value, params);
            }
        });
        return params;
    }
    /**
     * @param {?} key
     * @param {?} value
     * @param {?} params
     * @return {?}
     */
    _appendParam(key, value, params) {
        if (typeof value !== 'string') {
            value = JSON.stringify(value);
        }
        params.append(key, value);
    }
}
if (false) {
    /**
     * Http method with which to execute a {\@link Request}.
     * Acceptable methods are defined in the {\@link RequestMethod} enum.
     * @type {?}
     */
    RequestOptions.prototype.method;
    /**
     * {\@link Headers} to be attached to a {\@link Request}.
     * @type {?}
     */
    RequestOptions.prototype.headers;
    /**
     * Body to be used when creating a {\@link Request}.
     * @type {?}
     */
    RequestOptions.prototype.body;
    /**
     * Url with which to perform a {\@link Request}.
     * @type {?}
     */
    RequestOptions.prototype.url;
    /**
     * Search parameters to be included in a {\@link Request}.
     * @type {?}
     */
    RequestOptions.prototype.params;
    /**
     * Enable use credentials for a {\@link Request}.
     * @type {?}
     */
    RequestOptions.prototype.withCredentials;
    /** @type {?} */
    RequestOptions.prototype.responseType;
}
/**
 * Subclass of {\@link RequestOptions}, with default values.
 *
 * Default values:
 *  * method: {\@link RequestMethod RequestMethod.Get}
 *  * headers: empty {\@link Headers} object
 *
 * This class could be extended and bound to the {\@link RequestOptions} class
 * when configuring an {\@link Injector}, in order to override the default options
 * used by {\@link Http} to create and send {\@link Request Requests}.
 *
 * ```typescript
 * import {BaseRequestOptions, RequestOptions} from '\@angular/http';
 *
 * class MyOptions extends BaseRequestOptions {
 *   search: string = 'coreTeam=true';
 * }
 *
 * {provide: RequestOptions, useClass: MyOptions};
 * ```
 *
 * The options could also be extended when manually creating a {\@link Request}
 * object.
 *
 * ```
 * import {BaseRequestOptions, Request, RequestMethod} from '\@angular/http';
 *
 * const options = new BaseRequestOptions();
 * const req = new Request(options.merge({
 *   method: RequestMethod.Post,
 *   url: 'https://google.com'
 * }));
 * console.log('req.method:', RequestMethod[req.method]); // Post
 * console.log('options.url:', options.url); // null
 * console.log('req.url:', req.url); // https://google.com
 * ```
 *
 * @deprecated see https://angular.io/guide/http
 * \@publicApi
 */
export class BaseRequestOptions extends RequestOptions {
    constructor() { super({ method: RequestMethod.Get, headers: new Headers() }); }
}
BaseRequestOptions.decorators = [
    { type: Injectable }
];
/** @nocollapse */
BaseRequestOptions.ctorParameters = () => [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZV9yZXF1ZXN0X29wdGlvbnMuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9odHRwL3NyYy9iYXNlX3JlcXVlc3Rfb3B0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFekMsT0FBTyxFQUFDLGFBQWEsRUFBc0IsTUFBTSxTQUFTLENBQUM7QUFDM0QsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUNsQyxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFFakQsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHFCQUFxQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTRCcEQsTUFBTSxPQUFPLGNBQWM7Ozs7O0lBeUJ6QixJQUFJLE1BQU0sS0FBc0IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzs7Ozs7O0lBSXJELElBQUksTUFBTSxDQUFDLE1BQXVCLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDOzs7OztJQVc3RCxZQUFZLE9BQTJCLEVBQUU7Y0FDakMsRUFBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUUsWUFBWSxFQUFDLEdBQUcsSUFBSTtRQUN4RixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDbEUsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNoRCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUks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LENBQUMsQ0FBQyxJQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO2FBQ3BFO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQzthQUN2QztRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQzs7Ozs7OztJQUVPLFlBQVksQ0FBQyxHQUFXLEVBQUUsS0FBVSxFQUFFLE1BQXVCO1FBQ25FLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1lBQzdCLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQy9CO1FBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDNUIsQ0FBQztDQUNGOzs7Ozs7O0lBckhDLGdDQUFrQzs7Ozs7SUFJbEMsaUNBQXNCOzs7OztJQUl0Qiw4QkFBVTs7Ozs7SUFJViw2QkFBaUI7Ozs7O0lBSWpCLGdDQUF3Qjs7Ozs7SUFZeEIseUNBQThCOztJQUk5QixzQ0FBdUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWdJekMsTUFBTSxPQUFPLGtCQUFtQixTQUFRLGNBQWM7SUFDcEQsZ0JBQWdCLEtBQUssQ0FBQyxFQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLE9BQU8sRUFBRSxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7OztZQUY5RSxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1JlcXVlc3RNZXRob2QsIFJlc3BvbnNlQ29udGVudFR5cGV9IGZyb20gJy4vZW51bXMnO1xuaW1wb3J0IHtIZWFkZXJzfSBmcm9tICcuL2hlYWRlcnMnO1xuaW1wb3J0IHtub3JtYWxpemVNZXRob2ROYW1lfSBmcm9tICcuL2h0dHBfdXRpbHMnO1xuaW1wb3J0IHtSZXF1ZXN0T3B0aW9uc0FyZ3N9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQge1VSTFNlYXJjaFBhcmFtc30gZnJvbSAnLi91cmxfc2VhcmNoX3BhcmFtcyc7XG5cblxuLyoqXG4gKiBDcmVhdGVzIGEgcmVxdWVzdCBvcHRpb25zIG9iamVjdCB0byBiZSBvcHRpb25hbGx5IHByb3ZpZGVkIHdoZW4gaW5zdGFudGlhdGluZyBhXG4gKiB7QGxpbmsgUmVxdWVzdH0uXG4gKlxuICogVGhpcyBjbGFzcyBpcyBiYXNlZCBvbiB0aGUgYFJlcXVlc3RJbml0YCBkZXNjcmlwdGlvbiBpbiB0aGUgW0ZldGNoXG4gKiBTcGVjXShodHRwczovL2ZldGNoLnNwZWMud2hhdHdnLm9yZy8jcmVxdWVzdGluaXQpLlxuICpcbiAqIEFsbCB2YWx1ZXMgYXJlIG51bGwgYnkgZGVmYXVsdC4gVHlwaWNhbCBkZWZhdWx0cyBjYW4gYmUgZm91bmQgaW4gdGhlIHtAbGluayBCYXNlUmVxdWVzdE9wdGlvbnN9XG4gKiBjbGFzcywgd2hpY2ggc3ViLWNsYXNzZXMgYFJlcXVlc3RPcHRpb25zYC5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge1JlcXVlc3RPcHRpb25zLCBSZXF1ZXN0LCBSZXF1ZXN0TWV0aG9kfSBmcm9tICdAYW5ndWxhci9odHRwJztcbiAqXG4gKiBjb25zdCBvcHRpb25zID0gbmV3IFJlcXVlc3RPcHRpb25zKHtcbiAqICAgbWV0aG9kOiBSZXF1ZXN0TWV0aG9kLlBvc3QsXG4gKiAgIHVybDogJ2h0dHBzOi8vZ29vZ2xlLmNvbSdcbiAqIH0pO1xuICogY29uc3QgcmVxID0gbmV3IFJlcXVlc3Qob3B0aW9ucyk7XG4gKiBjb25zb2xlLmxvZygncmVxLm1ldGhvZDonLCBSZXF1ZXN0TWV0aG9kW3JlcS5tZXRob2RdKTsgLy8gUG9zdFxuICogY29uc29sZS5sb2coJ29wdGlvbnMudXJsOicsIG9wdGlvbnMudXJsKTsgLy8gaHR0cHM6Ly9nb29nbGUuY29tXG4gKiBgYGBcbiAqXG4gKiBAZGVwcmVjYXRlZCBzZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2h0dHBcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIFJlcXVlc3RPcHRpb25zIHtcbiAgLyoqXG4gICAqIEh0dHAgbWV0aG9kIHdpdGggd2hpY2ggdG8gZXhlY3V0ZSBhIHtAbGluayBSZXF1ZXN0fS5cbiAgICogQWNjZXB0YWJsZSBtZXRob2RzIGFyZSBkZWZpbmVkIGluIHRoZSB7QGxpbmsgUmVxdWVzdE1ldGhvZH0gZW51bS5cbiAgICovXG4gIG1ldGhvZDogUmVxdWVzdE1ldGhvZHxzdHJpbmd8bnVsbDtcbiAgLyoqXG4gICAqIHtAbGluayBIZWFkZXJzfSB0byBiZSBhdHRhY2hlZCB0byBhIHtAbGluayBSZXF1ZXN0fS5cbiAgICovXG4gIGhlYWRlcnM6IEhlYWRlcnN8bnVsbDtcbiAgLyoqXG4gICAqIEJvZHkgdG8gYmUgdXNlZCB3aGVuIGNyZWF0aW5nIGEge0BsaW5rIFJlcXVlc3R9LlxuICAgKi9cbiAgYm9keTogYW55O1xuICAvKipcbiAgICogVXJsIHdpdGggd2hpY2ggdG8gcGVyZm9ybSBhIHtAbGluayBSZXF1ZXN0fS5cbiAgICovXG4gIHVybDogc3RyaW5nfG51bGw7XG4gIC8qKlxuICAgKiBTZWFyY2ggcGFyYW1ldGVycyB0byBiZSBpbmNsdWRlZCBpbiBhIHtAbGluayBSZXF1ZXN0fS5cbiAgICovXG4gIHBhcmFtczogVVJMU2VhcmNoUGFyYW1zO1xuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgZnJvbSA0LjAuMC4gVXNlIHBhcmFtcyBpbnN0ZWFkLlxuICAgKi9cbiAgZ2V0IHNlYXJjaCgpOiBVUkxTZWFyY2hQYXJhbXMgeyByZXR1cm4gdGhpcy5wYXJhbXM7IH1cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIGZyb20gNC4wLjAuIFVzZSBwYXJhbXMgaW5zdGVhZC5cbiAgICovXG4gIHNldCBzZWFyY2gocGFyYW1zOiBVUkxTZWFyY2hQYXJhbXMpIHsgdGhpcy5wYXJhbXMgPSBwYXJhbXM7IH1cbiAgLyoqXG4gICAqIEVuYWJsZSB1c2UgY3JlZGVudGlhbHMgZm9yIGEge0BsaW5rIFJlcXVlc3R9LlxuICAgKi9cbiAgd2l0aENyZWRlbnRpYWxzOiBib29sZWFufG51bGw7XG4gIC8qXG4gICAqIFNlbGVjdCBhIGJ1ZmZlciB0byBzdG9yZSB0aGUgcmVzcG9uc2UsIHN1Y2ggYXMgQXJyYXlCdWZmZXIsIEJsb2IsIEpzb24gKG9yIERvY3VtZW50KVxuICAgKi9cbiAgcmVzcG9uc2VUeXBlOiBSZXNwb25zZUNvbnRlbnRUeXBlfG51bGw7XG5cbiAgLy8gVE9ETyhEem1pdHJ5KTogcmVtb3ZlIHNlYXJjaCB3aGVuIHRoaXMuc2VhcmNoIGlzIHJlbW92ZWRcbiAgY29uc3RydWN0b3Iob3B0czogUmVxdWVzdE9wdGlvbnNBcmdzID0ge30pIHtcbiAgICBjb25zdCB7bWV0aG9kLCBoZWFkZXJzLCBib2R5LCB1cmwsIHNlYXJjaCwgcGFyYW1zLCB3aXRoQ3JlZGVudGlhbHMsIHJlc3BvbnNlVHlwZX0gPSBvcHRzO1xuICAgIHRoaXMubWV0aG9kID0gbWV0aG9kICE9IG51bGwgPyBub3JtYWxpemVNZXRob2ROYW1lKG1ldGhvZCkgOiBudWxsO1xuICAgIHRoaXMuaGVhZGVycyA9IGhlYWRlcnMgIT0gbnVsbCA/IGhlYWRlcnMgOiBudWxsO1xuICAgIHRoaXMuYm9keSA9IGJvZHkgIT0gbnVsbCA/IGJvZHkgOiBudWxsO1xuICAgIHRoaXMudXJsID0gdXJsICE9IG51bGwgPyB1cmwgOiBudWxsO1xuICAgIHRoaXMucGFyYW1zID0gdGhpcy5fbWVyZ2VTZWFyY2hQYXJhbXMocGFyYW1zIHx8IHNlYXJjaCk7XG4gICAgdGhpcy53aXRoQ3JlZGVudGlhbHMgPSB3aXRoQ3JlZGVudGlhbHMgIT0gbnVsbCA/IHdpdGhDcmVkZW50aWFscyA6IG51bGw7XG4gICAgdGhpcy5yZXNwb25zZVR5cGUgPSByZXNwb25zZVR5cGUgIT0gbnVsbCA/IHJlc3BvbnNlVHlwZSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGNvcHkgb2YgdGhlIGBSZXF1ZXN0T3B0aW9uc2AgaW5zdGFuY2UsIHVzaW5nIHRoZSBvcHRpb25hbCBpbnB1dCBhcyB2YWx1ZXMgdG8gb3ZlcnJpZGVcbiAgICogZXhpc3RpbmcgdmFsdWVzLiBUaGlzIG1ldGhvZCB3aWxsIG5vdCBjaGFuZ2UgdGhlIHZhbHVlcyBvZiB0aGUgaW5zdGFuY2Ugb24gd2hpY2ggaXQgaXMgYmVpbmdcbiAgICogY2FsbGVkLlxuICAgKlxuICAgKiBOb3RlIHRoYXQgYGhlYWRlcnNgIGFuZCBgc2VhcmNoYCB3aWxsIG92ZXJyaWRlIGV4aXN0aW5nIHZhbHVlcyBjb21wbGV0ZWx5IGlmIHByZXNlbnQgaW5cbiAgICogdGhlIGBvcHRpb25zYCBvYmplY3QuIElmIHRoZXNlIHZhbHVlcyBzaG91bGQgYmUgbWVyZ2VkLCBpdCBzaG91bGQgYmUgZG9uZSBwcmlvciB0byBjYWxsaW5nXG4gICAqIGBtZXJnZWAgb24gdGhlIGBSZXF1ZXN0T3B0aW9uc2AgaW5zdGFuY2UuXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogaW1wb3J0IHtSZXF1ZXN0T3B0aW9ucywgUmVxdWVzdCwgUmVxdWVzdE1ldGhvZH0gZnJvbSAnQGFuZ3VsYXIvaHR0cCc7XG4gICAqXG4gICAqIGNvbnN0IG9wdGlvbnMgPSBuZXcgUmVxdWVzdE9wdGlvbnMoe1xuICAgKiAgIG1ldGhvZDogUmVxdWVzdE1ldGhvZC5Qb3N0XG4gICAqIH0pO1xuICAgKiBjb25zdCByZXEgPSBuZXcgUmVxdWVzdChvcHRpb25zLm1lcmdlKHtcbiAgICogICB1cmw6ICdodHRwczovL2dvb2dsZS5jb20nXG4gICAqIH0pKTtcbiAgICogY29uc29sZS5sb2coJ3JlcS5tZXRob2Q6JywgUmVxdWVzdE1ldGhvZFtyZXEubWV0aG9kXSk7IC8vIFBvc3RcbiAgICogY29uc29sZS5sb2coJ29wdGlvbnMudXJsOicsIG9wdGlvbnMudXJsKTsgLy8gbnVsbFxuICAgKiBjb25zb2xlLmxvZygncmVxLnVybDonLCByZXEudXJsKTsgLy8gaHR0cHM6Ly9nb29nbGUuY29tXG4gICAqIGBgYFxuICAgKi9cbiAgbWVyZ2Uob3B0aW9ucz86IFJlcXVlc3RPcHRpb25zQXJncyk6IFJlcXVlc3RPcHRpb25zIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3RPcHRpb25zKHtcbiAgICAgIG1ldGhvZDogb3B0aW9ucyAmJiBvcHRpb25zLm1ldGhvZCAhPSBudWxsID8gb3B0aW9ucy5tZXRob2QgOiB0aGlzLm1ldGhvZCxcbiAgICAgIGhlYWRlcnM6IG9wdGlvbnMgJiYgb3B0aW9ucy5oZWFkZXJzICE9IG51bGwgPyBvcHRpb25zLmhlYWRlcnMgOiBuZXcgSGVhZGVycyh0aGlzLmhlYWRlcnMpLFxuICAgICAgYm9keTogb3B0aW9ucyAmJiBvcHRpb25zLmJvZHkgIT0gbnVsbCA/IG9wdGlvbnMuYm9keSA6IHRoaXMuYm9keSxcbiAgICAgIHVybDogb3B0aW9ucyAmJiBvcHRpb25zLnVybCAhPSBudWxsID8gb3B0aW9ucy51cmwgOiB0aGlzLnVybCxcbiAgICAgIHBhcmFtczogb3B0aW9ucyAmJiB0aGlzLl9tZXJnZVNlYXJjaFBhcmFtcyhvcHRpb25zLnBhcmFtcyB8fCBvcHRpb25zLnNlYXJjaCksXG4gICAgICB3aXRoQ3JlZGVudGlhbHM6IG9wdGlvbnMgJiYgb3B0aW9ucy53aXRoQ3JlZGVudGlhbHMgIT0gbnVsbCA/IG9wdGlvbnMud2l0aENyZWRlbnRpYWxzIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy53aXRoQ3JlZGVudGlhbHMsXG4gICAgICByZXNwb25zZVR5cGU6IG9wdGlvbnMgJiYgb3B0aW9ucy5yZXNwb25zZVR5cGUgIT0gbnVsbCA/IG9wdGlvbnMucmVzcG9uc2VUeXBlIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNwb25zZVR5cGVcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX21lcmdlU2VhcmNoUGFyYW1zKHBhcmFtcz86IHN0cmluZ3xVUkxTZWFyY2hQYXJhbXN8e1trZXk6IHN0cmluZ106IGFueSB8IGFueVtdfXxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCk6IFVSTFNlYXJjaFBhcmFtcyB7XG4gICAgaWYgKCFwYXJhbXMpIHJldHVybiB0aGlzLnBhcmFtcztcblxuICAgIGlmIChwYXJhbXMgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXMpIHtcbiAgICAgIHJldHVybiBwYXJhbXMuY2xvbmUoKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHBhcmFtcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBuZXcgVVJMU2VhcmNoUGFyYW1zKHBhcmFtcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3BhcnNlUGFyYW1zKHBhcmFtcyk7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZVBhcmFtcyhvYmpQYXJhbXM6IHtba2V5OiBzdHJpbmddOiBhbnkgfCBhbnlbXX0gPSB7fSk6IFVSTFNlYXJjaFBhcmFtcyB7XG4gICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpO1xuICAgIE9iamVjdC5rZXlzKG9ialBhcmFtcykuZm9yRWFjaCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlOiBhbnl8YW55W10gPSBvYmpQYXJhbXNba2V5XTtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICB2YWx1ZS5mb3JFYWNoKChpdGVtOiBhbnkpID0+IHRoaXMuX2FwcGVuZFBhcmFtKGtleSwgaXRlbSwgcGFyYW1zKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9hcHBlbmRQYXJhbShrZXksIHZhbHVlLCBwYXJhbXMpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBwYXJhbXM7XG4gIH1cblxuICBwcml2YXRlIF9hcHBlbmRQYXJhbShrZXk6IHN0cmluZywgdmFsdWU6IGFueSwgcGFyYW1zOiBVUkxTZWFyY2hQYXJhbXMpOiB2b2lkIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgdmFsdWUgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgfVxuICAgIHBhcmFtcy5hcHBlbmQoa2V5LCB2YWx1ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBTdWJjbGFzcyBvZiB7QGxpbmsgUmVxdWVzdE9wdGlvbnN9LCB3aXRoIGRlZmF1bHQgdmFsdWVzLlxuICpcbiAqIERlZmF1bHQgdmFsdWVzOlxuICogICogbWV0aG9kOiB7QGxpbmsgUmVxdWVzdE1ldGhvZCBSZXF1ZXN0TWV0aG9kLkdldH1cbiAqICAqIGhlYWRlcnM6IGVtcHR5IHtAbGluayBIZWFkZXJzfSBvYmplY3RcbiAqXG4gKiBUaGlzIGNsYXNzIGNvdWxkIGJlIGV4dGVuZGVkIGFuZCBib3VuZCB0byB0aGUge0BsaW5rIFJlcXVlc3RPcHRpb25zfSBjbGFzc1xuICogd2hlbiBjb25maWd1cmluZyBhbiB7QGxpbmsgSW5qZWN0b3J9LCBpbiBvcmRlciB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCBvcHRpb25zXG4gKiB1c2VkIGJ5IHtAbGluayBIdHRwfSB0byBjcmVhdGUgYW5kIHNlbmQge0BsaW5rIFJlcXVlc3QgUmVxdWVzdHN9LlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7QmFzZVJlcXVlc3RPcHRpb25zLCBSZXF1ZXN0T3B0aW9uc30gZnJvbSAnQGFuZ3VsYXIvaHR0cCc7XG4gKlxuICogY2xhc3MgTXlPcHRpb25zIGV4dGVuZHMgQmFzZVJlcXVlc3RPcHRpb25zIHtcbiAqICAgc2VhcmNoOiBzdHJpbmcgPSAnY29yZVRlYW09dHJ1ZSc7XG4gKiB9XG4gKlxuICoge3Byb3ZpZGU6IFJlcXVlc3RPcHRpb25zLCB1c2VDbGFzczogTXlPcHRpb25zfTtcbiAqIGBgYFxuICpcbiAqIFRoZSBvcHRpb25zIGNvdWxkIGFsc28gYmUgZXh0ZW5kZWQgd2hlbiBtYW51YWxseSBjcmVhdGluZyBhIHtAbGluayBSZXF1ZXN0fVxuICogb2JqZWN0LlxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtCYXNlUmVxdWVzdE9wdGlvbnMsIFJlcXVlc3QsIFJlcXVlc3RNZXRob2R9IGZyb20gJ0Bhbmd1bGFyL2h0dHAnO1xuICpcbiAqIGNvbnN0IG9wdGlvbnMgPSBuZXcgQmFzZVJlcXVlc3RPcHRpb25zKCk7XG4gKiBjb25zdCByZXEgPSBuZXcgUmVxdWVzdChvcHRpb25zLm1lcmdlKHtcbiAqICAgbWV0aG9kOiBSZXF1ZXN0TWV0aG9kLlBvc3QsXG4gKiAgIHVybDogJ2h0dHBzOi8vZ29vZ2xlLmNvbSdcbiAqIH0pKTtcbiAqIGNvbnNvbGUubG9nKCdyZXEubWV0aG9kOicsIFJlcXVlc3RNZXRob2RbcmVxLm1ldGhvZF0pOyAvLyBQb3N0XG4gKiBjb25zb2xlLmxvZygnb3B0aW9ucy51cmw6Jywgb3B0aW9ucy51cmwpOyAvLyBudWxsXG4gKiBjb25zb2xlLmxvZygncmVxLnVybDonLCByZXEudXJsKTsgLy8gaHR0cHM6Ly9nb29nbGUuY29tXG4gKiBgYGBcbiAqXG4gKiBAZGVwcmVjYXRlZCBzZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2h0dHBcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEJhc2VSZXF1ZXN0T3B0aW9ucyBleHRlbmRzIFJlcXVlc3RPcHRpb25zIHtcbiAgY29uc3RydWN0b3IoKSB7IHN1cGVyKHttZXRob2Q6IFJlcXVlc3RNZXRob2QuR2V0LCBoZWFkZXJzOiBuZXcgSGVhZGVycygpfSk7IH1cbn1cbiJdfQ==