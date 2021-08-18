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
import { RequestOptions } from './base_request_options';
import { RequestMethod } from './enums';
import { ConnectionBackend } from './interfaces';
import { Request } from './static_request';
/**
 * @param {?} backend
 * @param {?} request
 * @return {?}
 */
function httpRequest(backend, request) {
    return backend.createConnection(request).response;
}
/**
 * @param {?} defaultOpts
 * @param {?} providedOpts
 * @param {?} method
 * @param {?} url
 * @return {?}
 */
function mergeOptions(defaultOpts, providedOpts, method, url) {
    /** @type {?} */
    const newOptions = defaultOpts;
    if (providedOpts) {
        // Hack so Dart can used named parameters
        return (/** @type {?} */ (newOptions.merge(new RequestOptions({
            method: providedOpts.method || method,
            url: providedOpts.url || url,
            search: providedOpts.search,
            params: providedOpts.params,
            headers: providedOpts.headers,
            body: providedOpts.body,
            withCredentials: providedOpts.withCredentials,
            responseType: providedOpts.responseType
        }))));
    }
    return (/** @type {?} */ (newOptions.merge(new RequestOptions({ method, url }))));
}
/**
 * Performs http requests using `XMLHttpRequest` as the default backend.
 *
 * `Http` is available as an injectable class, with methods to perform http requests. Calling
 * `request` returns an `Observable` which will emit a single {\@link Response} when a
 * response is received.
 *
 * \@usageNotes
 * ### Example
 *
 * ```typescript
 * import {Http, HTTP_PROVIDERS} from '\@angular/http';
 * import {map} from 'rxjs/operators';
 *
 * \@Component({
 *   selector: 'http-app',
 *   viewProviders: [HTTP_PROVIDERS],
 *   templateUrl: 'people.html'
 * })
 * class PeopleComponent {
 *   constructor(http: Http) {
 *     http.get('people.json')
 *       // Call map on the response observable to get the parsed people object
 *       .pipe(map(res => res.json()))
 *       // Subscribe to the observable to get the parsed people object and attach it to the
 *       // component
 *       .subscribe(people => this.people = people);
 *   }
 * }
 * ```
 *
 *
 * ### Example
 *
 * ```
 * http.get('people.json').subscribe((res:Response) => this.people = res.json());
 * ```
 *
 * The default construct used to perform requests, `XMLHttpRequest`, is abstracted as a "Backend" (
 * {\@link XHRBackend} in this case), which could be mocked with dependency injection by replacing
 * the {\@link XHRBackend} provider, as in the following example:
 *
 * ### Example
 *
 * ```typescript
 * import {BaseRequestOptions, Http} from '\@angular/http';
 * import {MockBackend} from '\@angular/http/testing';
 * var injector = Injector.resolveAndCreate([
 *   BaseRequestOptions,
 *   MockBackend,
 *   {provide: Http, useFactory:
 *       function(backend, defaultOptions) {
 *         return new Http(backend, defaultOptions);
 *       },
 *       deps: [MockBackend, BaseRequestOptions]}
 * ]);
 * var http = injector.get(Http);
 * http.get('request-from-mock-backend.json').subscribe((res:Response) => doSomething(res));
 * ```
 *
 * @deprecated see https://angular.io/guide/http
 * \@publicApi
 */
export class Http {
    /**
     * @param {?} _backend
     * @param {?} _defaultOptions
     */
    constructor(_backend, _defaultOptions) {
        this._backend = _backend;
        this._defaultOptions = _defaultOptions;
    }
    /**
     * Performs any type of http request. First argument is required, and can either be a url or
     * a {\@link Request} instance. If the first argument is a url, an optional {\@link RequestOptions}
     * object can be provided as the 2nd argument. The options object will be merged with the values
     * of {\@link BaseRequestOptions} before performing the request.
     * @param {?} url
     * @param {?=} options
     * @return {?}
     */
    request(url, options) {
        /** @type {?} */
        let responseObservable;
        if (typeof url === 'string') {
            responseObservable = httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions, options, RequestMethod.Get, (/** @type {?} */ (url)))));
        }
        else if (url instanceof Request) {
            responseObservable = httpRequest(this._backend, url);
        }
        else {
            throw new Error('First argument must be a url string or Request instance.');
        }
        return responseObservable;
    }
    /**
     * Performs a request with `get` http method.
     * @param {?} url
     * @param {?=} options
     * @return {?}
     */
    get(url, options) {
        return this.request(new Request(mergeOptions(this._defaultOptions, options, RequestMethod.Get, url)));
    }
    /**
     * Performs a request with `post` http method.
     * @param {?} url
     * @param {?} body
     * @param {?=} options
     * @return {?}
     */
    post(url, body, options) {
        return this.request(new Request(mergeOptions(this._defaultOptions.merge(new RequestOptions({ body: body })), options, RequestMethod.Post, url)));
    }
    /**
     * Performs a request with `put` http method.
     * @param {?} url
     * @param {?} body
     * @param {?=} options
     * @return {?}
     */
    put(url, body, options) {
        return this.request(new Request(mergeOptions(this._defaultOptions.merge(new RequestOptions({ body: body })), options, RequestMethod.Put, url)));
    }
    /**
     * Performs a request with `delete` http method.
     * @param {?} url
     * @param {?=} options
     * @return {?}
     */
    delete(url, options) {
        return this.request(new Request(mergeOptions(this._defaultOptions, options, RequestMethod.Delete, url)));
    }
    /**
     * Performs a request with `patch` http method.
     * @param {?} url
     * @param {?} body
     * @param {?=} options
     * @return {?}
     */
    patch(url, body, options) {
        return this.request(new Request(mergeOptions(this._defaultOptions.merge(new RequestOptions({ body: body })), options, RequestMethod.Patch, url)));
    }
    /**
     * Performs a request with `head` http method.
     * @param {?} url
     * @param {?=} options
     * @return {?}
     */
    head(url, options) {
        return this.request(new Request(mergeOptions(this._defaultOptions, options, RequestMethod.Head, url)));
    }
    /**
     * Performs a request with `options` http method.
     * @param {?} url
     * @param {?=} options
     * @return {?}
     */
    options(url, options) {
        return this.request(new Request(mergeOptions(this._defaultOptions, options, RequestMethod.Options, url)));
    }
}
Http.decorators = [
    { type: Injectable }
];
/** @nocollapse */
Http.ctorParameters = () => [
    { type: ConnectionBackend },
    { type: RequestOptions }
];
if (false) {
    /** @type {?} */
    Http.prototype._backend;
    /** @type {?} */
    Http.prototype._defaultOptions;
}
/**
 * @deprecated see https://angular.io/guide/http
 * \@publicApi
 */
export class Jsonp extends Http {
    /**
     * @param {?} backend
     * @param {?} defaultOptions
     */
    constructor(backend, defaultOptions) {
        super(backend, defaultOptions);
    }
    /**
     * Performs any type of http request. First argument is required, and can either be a url or
     * a {\@link Request} instance. If the first argument is a url, an optional {\@link RequestOptions}
     * object can be provided as the 2nd argument. The options object will be merged with the values
     * of {\@link BaseRequestOptions} before performing the request.
     *
     * \@security Regular XHR is the safest alternative to JSONP for most applications, and is
     * supported by all current browsers. Because JSONP creates a `<script>` element with
     * contents retrieved from a remote source, attacker-controlled data introduced by an untrusted
     * source could expose your application to XSS risks. Data exposed by JSONP may also be
     * readable by malicious third-party websites. In addition, JSONP introduces potential risk for
     * future security issues (e.g. content sniffing).  For more detail, see the
     * [Security Guide](http://g.co/ng/security).
     * @param {?} url
     * @param {?=} options
     * @return {?}
     */
    request(url, options) {
        /** @type {?} */
        let responseObservable;
        if (typeof url === 'string') {
            url =
                new Request(mergeOptions(this._defaultOptions, options, RequestMethod.Get, (/** @type {?} */ (url))));
        }
        if (url instanceof Request) {
            if (url.method !== RequestMethod.Get) {
                throw new Error('JSONP requests must use GET request method.');
            }
            responseObservable = httpRequest(this._backend, url);
        }
        else {
            throw new Error('First argument must be a url string or Request instance.');
        }
        return responseObservable;
    }
}
Jsonp.decorators = [
    { type: Injectable }
];
/** @nocollapse */
Jsonp.ctorParameters = () => [
    { type: ConnectionBackend },
    { type: RequestOptions }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2h0dHAvc3JjL2h0dHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBR3pDLE9BQU8sRUFBcUIsY0FBYyxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDMUUsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUN0QyxPQUFPLEVBQUMsaUJBQWlCLEVBQWtDLE1BQU0sY0FBYyxDQUFDO0FBQ2hGLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQzs7Ozs7O0FBR3pDLFNBQVMsV0FBVyxDQUFDLE9BQTBCLEVBQUUsT0FBZ0I7SUFDL0QsT0FBTyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDO0FBQ3BELENBQUM7Ozs7Ozs7O0FBRUQsU0FBUyxZQUFZLENBQ2pCLFdBQStCLEVBQUUsWUFBNEMsRUFDN0UsTUFBcUIsRUFBRSxHQUFXOztVQUM5QixVQUFVLEdBQUcsV0FBVztJQUM5QixJQUFJLFlBQVksRUFBRTtRQUNoQix5Q0FBeUM7UUFDekMsT0FBTyxtQkFBQSxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksY0FBYyxDQUFDO1lBQ3pDLE1BQU0sRUFBRSxZQUFZLENBQUMsTUFBTSxJQUFJLE1BQU07WUFDckMsR0FBRyxFQUFFLFlBQVksQ0FBQyxHQUFHLElBQUksR0FBRztZQUM1QixNQUFNLEVBQUUsWUFBWSxDQUFDLE1BQU07WUFDM0IsTUFBTSxFQUFFLFlBQVksQ0FBQyxNQUFNO1lBQzNCLE9BQU8sRUFBRSxZQUFZLENBQUMsT0FBTztZQUM3QixJQUFJLEVBQUUsWUFBWSxDQUFDLElBQUk7WUFDdkIsZUFBZSxFQUFFLFlBQVksQ0FBQyxlQUFlO1lBQzdDLFlBQVksRUFBRSxZQUFZLENBQUMsWUFBWTtTQUN4QyxD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QUFHLENBQUMsTUFBTSxLQUFLLGFBQWEsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3BDLE1BQU0sSUFBSSxLQUFLLENBQUMsNkNBQTZDLENBQUMsQ0FBQzthQUNoRTtZQUNELGtCQUFrQixHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3REO2FBQU07WUFDTCxNQUFNLElBQUksS0FBSyxDQUFDLDBEQUEwRCxDQUFDLENBQUM7U0FDN0U7UUFDRCxPQUFPLGtCQUFrQixDQUFDO0lBQzVCLENBQUM7OztZQW5DRixVQUFVOzs7O1lBckxILGlCQUFpQjtZQUZHLGNBQWMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0Jhc2VSZXF1ZXN0T3B0aW9ucywgUmVxdWVzdE9wdGlvbnN9IGZyb20gJy4vYmFzZV9yZXF1ZXN0X29wdGlvbnMnO1xuaW1wb3J0IHtSZXF1ZXN0TWV0aG9kfSBmcm9tICcuL2VudW1zJztcbmltcG9ydCB7Q29ubmVjdGlvbkJhY2tlbmQsIFJlcXVlc3RBcmdzLCBSZXF1ZXN0T3B0aW9uc0FyZ3N9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQge1JlcXVlc3R9IGZyb20gJy4vc3RhdGljX3JlcXVlc3QnO1xuaW1wb3J0IHtSZXNwb25zZX0gZnJvbSAnLi9zdGF0aWNfcmVzcG9uc2UnO1xuXG5mdW5jdGlvbiBodHRwUmVxdWVzdChiYWNrZW5kOiBDb25uZWN0aW9uQmFja2VuZCwgcmVxdWVzdDogUmVxdWVzdCk6IE9ic2VydmFibGU8UmVzcG9uc2U+IHtcbiAgcmV0dXJuIGJhY2tlbmQuY3JlYXRlQ29ubmVjdGlvbihyZXF1ZXN0KS5yZXNwb25zZTtcbn1cblxuZnVuY3Rpb24gbWVyZ2VPcHRpb25zKFxuICAgIGRlZmF1bHRPcHRzOiBCYXNlUmVxdWVzdE9wdGlvbnMsIHByb3ZpZGVkT3B0czogUmVxdWVzdE9wdGlvbnNBcmdzIHwgdW5kZWZpbmVkLFxuICAgIG1ldGhvZDogUmVxdWVzdE1ldGhvZCwgdXJsOiBzdHJpbmcpOiBSZXF1ZXN0QXJncyB7XG4gIGNvbnN0IG5ld09wdGlvbnMgPSBkZWZhdWx0T3B0cztcbiAgaWYgKHByb3ZpZGVkT3B0cykge1xuICAgIC8vIEhhY2sgc28gRGFydCBjYW4gdXNlZCBuYW1lZCBwYXJhbWV0ZXJzXG4gICAgcmV0dXJuIG5ld09wdGlvbnMubWVyZ2UobmV3IFJlcXVlc3RPcHRpb25zKHtcbiAgICAgIG1ldGhvZDogcHJvdmlkZWRPcHRzLm1ldGhvZCB8fCBtZXRob2QsXG4gICAgICB1cmw6IHByb3ZpZGVkT3B0cy51cmwgfHwgdXJsLFxuICAgICAgc2VhcmNoOiBwcm92aWRlZE9wdHMuc2VhcmNoLFxuICAgICAgcGFyYW1zOiBwcm92aWRlZE9wdHMucGFyYW1zLFxuICAgICAgaGVhZGVyczogcHJvdmlkZWRPcHRzLmhlYWRlcnMsXG4gICAgICBib2R5OiBwcm92aWRlZE9wdHMuYm9keSxcbiAgICAgIHdpdGhDcmVkZW50aWFsczogcHJvdmlkZWRPcHRzLndpdGhDcmVkZW50aWFscyxcbiAgICAgIHJlc3BvbnNlVHlwZTogcHJvdmlkZWRPcHRzLnJlc3BvbnNlVHlwZVxuICAgIH0pKSBhcyBSZXF1ZXN0QXJncztcbiAgfVxuXG4gIHJldHVybiBuZXdPcHRpb25zLm1lcmdlKG5ldyBSZXF1ZXN0T3B0aW9ucyh7bWV0aG9kLCB1cmx9KSkgYXMgUmVxdWVzdEFyZ3M7XG59XG5cbi8qKlxuICogUGVyZm9ybXMgaHR0cCByZXF1ZXN0cyB1c2luZyBgWE1MSHR0cFJlcXVlc3RgIGFzIHRoZSBkZWZhdWx0IGJhY2tlbmQuXG4gKlxuICogYEh0dHBgIGlzIGF2YWlsYWJsZSBhcyBhbiBpbmplY3RhYmxlIGNsYXNzLCB3aXRoIG1ldGhvZHMgdG8gcGVyZm9ybSBodHRwIHJlcXVlc3RzLiBDYWxsaW5nXG4gKiBgcmVxdWVzdGAgcmV0dXJucyBhbiBgT2JzZXJ2YWJsZWAgd2hpY2ggd2lsbCBlbWl0IGEgc2luZ2xlIHtAbGluayBSZXNwb25zZX0gd2hlbiBhXG4gKiByZXNwb25zZSBpcyByZWNlaXZlZC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge0h0dHAsIEhUVFBfUFJPVklERVJTfSBmcm9tICdAYW5ndWxhci9odHRwJztcbiAqIGltcG9ydCB7bWFwfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnaHR0cC1hcHAnLFxuICogICB2aWV3UHJvdmlkZXJzOiBbSFRUUF9QUk9WSURFUlNdLFxuICogICB0ZW1wbGF0ZVVybDogJ3Blb3BsZS5odG1sJ1xuICogfSlcbiAqIGNsYXNzIFBlb3BsZUNvbXBvbmVudCB7XG4gKiAgIGNvbnN0cnVjdG9yKGh0dHA6IEh0dHApIHtcbiAqICAgICBodHRwLmdldCgncGVvcGxlLmpzb24nKVxuICogICAgICAgLy8gQ2FsbCBtYXAgb24gdGhlIHJlc3BvbnNlIG9ic2VydmFibGUgdG8gZ2V0IHRoZSBwYXJzZWQgcGVvcGxlIG9iamVjdFxuICogICAgICAgLnBpcGUobWFwKHJlcyA9PiByZXMuanNvbigpKSlcbiAqICAgICAgIC8vIFN1YnNjcmliZSB0byB0aGUgb2JzZXJ2YWJsZSB0byBnZXQgdGhlIHBhcnNlZCBwZW9wbGUgb2JqZWN0IGFuZCBhdHRhY2ggaXQgdG8gdGhlXG4gKiAgICAgICAvLyBjb21wb25lbnRcbiAqICAgICAgIC5zdWJzY3JpYmUocGVvcGxlID0+IHRoaXMucGVvcGxlID0gcGVvcGxlKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBodHRwLmdldCgncGVvcGxlLmpzb24nKS5zdWJzY3JpYmUoKHJlczpSZXNwb25zZSkgPT4gdGhpcy5wZW9wbGUgPSByZXMuanNvbigpKTtcbiAqIGBgYFxuICpcbiAqIFRoZSBkZWZhdWx0IGNvbnN0cnVjdCB1c2VkIHRvIHBlcmZvcm0gcmVxdWVzdHMsIGBYTUxIdHRwUmVxdWVzdGAsIGlzIGFic3RyYWN0ZWQgYXMgYSBcIkJhY2tlbmRcIiAoXG4gKiB7QGxpbmsgWEhSQmFja2VuZH0gaW4gdGhpcyBjYXNlKSwgd2hpY2ggY291bGQgYmUgbW9ja2VkIHdpdGggZGVwZW5kZW5jeSBpbmplY3Rpb24gYnkgcmVwbGFjaW5nXG4gKiB0aGUge0BsaW5rIFhIUkJhY2tlbmR9IHByb3ZpZGVyLCBhcyBpbiB0aGUgZm9sbG93aW5nIGV4YW1wbGU6XG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge0Jhc2VSZXF1ZXN0T3B0aW9ucywgSHR0cH0gZnJvbSAnQGFuZ3VsYXIvaHR0cCc7XG4gKiBpbXBvcnQge01vY2tCYWNrZW5kfSBmcm9tICdAYW5ndWxhci9odHRwL3Rlc3RpbmcnO1xuICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gKiAgIEJhc2VSZXF1ZXN0T3B0aW9ucyxcbiAqICAgTW9ja0JhY2tlbmQsXG4gKiAgIHtwcm92aWRlOiBIdHRwLCB1c2VGYWN0b3J5OlxuICogICAgICAgZnVuY3Rpb24oYmFja2VuZCwgZGVmYXVsdE9wdGlvbnMpIHtcbiAqICAgICAgICAgcmV0dXJuIG5ldyBIdHRwKGJhY2tlbmQsIGRlZmF1bHRPcHRpb25zKTtcbiAqICAgICAgIH0sXG4gKiAgICAgICBkZXBzOiBbTW9ja0JhY2tlbmQsIEJhc2VSZXF1ZXN0T3B0aW9uc119XG4gKiBdKTtcbiAqIHZhciBodHRwID0gaW5qZWN0b3IuZ2V0KEh0dHApO1xuICogaHR0cC5nZXQoJ3JlcXVlc3QtZnJvbS1tb2NrLWJhY2tlbmQuanNvbicpLnN1YnNjcmliZSgocmVzOlJlc3BvbnNlKSA9PiBkb1NvbWV0aGluZyhyZXMpKTtcbiAqIGBgYFxuICpcbiAqIEBkZXByZWNhdGVkIHNlZSBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaHR0cFxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSHR0cCB7XG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBfYmFja2VuZDogQ29ubmVjdGlvbkJhY2tlbmQsIHByb3RlY3RlZCBfZGVmYXVsdE9wdGlvbnM6IFJlcXVlc3RPcHRpb25zKSB7fVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyBhbnkgdHlwZSBvZiBodHRwIHJlcXVlc3QuIEZpcnN0IGFyZ3VtZW50IGlzIHJlcXVpcmVkLCBhbmQgY2FuIGVpdGhlciBiZSBhIHVybCBvclxuICAgKiBhIHtAbGluayBSZXF1ZXN0fSBpbnN0YW5jZS4gSWYgdGhlIGZpcnN0IGFyZ3VtZW50IGlzIGEgdXJsLCBhbiBvcHRpb25hbCB7QGxpbmsgUmVxdWVzdE9wdGlvbnN9XG4gICAqIG9iamVjdCBjYW4gYmUgcHJvdmlkZWQgYXMgdGhlIDJuZCBhcmd1bWVudC4gVGhlIG9wdGlvbnMgb2JqZWN0IHdpbGwgYmUgbWVyZ2VkIHdpdGggdGhlIHZhbHVlc1xuICAgKiBvZiB7QGxpbmsgQmFzZVJlcXVlc3RPcHRpb25zfSBiZWZvcmUgcGVyZm9ybWluZyB0aGUgcmVxdWVzdC5cbiAgICovXG4gIHJlcXVlc3QodXJsOiBzdHJpbmd8UmVxdWVzdCwgb3B0aW9ucz86IFJlcXVlc3RPcHRpb25zQXJncyk6IE9ic2VydmFibGU8UmVzcG9uc2U+IHtcbiAgICBsZXQgcmVzcG9uc2VPYnNlcnZhYmxlOiBhbnk7XG4gICAgaWYgKHR5cGVvZiB1cmwgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXNwb25zZU9ic2VydmFibGUgPSBodHRwUmVxdWVzdChcbiAgICAgICAgICB0aGlzLl9iYWNrZW5kLFxuICAgICAgICAgIG5ldyBSZXF1ZXN0KG1lcmdlT3B0aW9ucyh0aGlzLl9kZWZhdWx0T3B0aW9ucywgb3B0aW9ucywgUmVxdWVzdE1ldGhvZC5HZXQsIDxzdHJpbmc+dXJsKSkpO1xuICAgIH0gZWxzZSBpZiAodXJsIGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgICAgcmVzcG9uc2VPYnNlcnZhYmxlID0gaHR0cFJlcXVlc3QodGhpcy5fYmFja2VuZCwgdXJsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCBtdXN0IGJlIGEgdXJsIHN0cmluZyBvciBSZXF1ZXN0IGluc3RhbmNlLicpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzcG9uc2VPYnNlcnZhYmxlO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIGEgcmVxdWVzdCB3aXRoIGBnZXRgIGh0dHAgbWV0aG9kLlxuICAgKi9cbiAgZ2V0KHVybDogc3RyaW5nLCBvcHRpb25zPzogUmVxdWVzdE9wdGlvbnNBcmdzKTogT2JzZXJ2YWJsZTxSZXNwb25zZT4ge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QoXG4gICAgICAgIG5ldyBSZXF1ZXN0KG1lcmdlT3B0aW9ucyh0aGlzLl9kZWZhdWx0T3B0aW9ucywgb3B0aW9ucywgUmVxdWVzdE1ldGhvZC5HZXQsIHVybCkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyBhIHJlcXVlc3Qgd2l0aCBgcG9zdGAgaHR0cCBtZXRob2QuXG4gICAqL1xuICBwb3N0KHVybDogc3RyaW5nLCBib2R5OiBhbnksIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9uc0FyZ3MpOiBPYnNlcnZhYmxlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChuZXcgUmVxdWVzdChtZXJnZU9wdGlvbnMoXG4gICAgICAgIHRoaXMuX2RlZmF1bHRPcHRpb25zLm1lcmdlKG5ldyBSZXF1ZXN0T3B0aW9ucyh7Ym9keTogYm9keX0pKSwgb3B0aW9ucywgUmVxdWVzdE1ldGhvZC5Qb3N0LFxuICAgICAgICB1cmwpKSk7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgYSByZXF1ZXN0IHdpdGggYHB1dGAgaHR0cCBtZXRob2QuXG4gICAqL1xuICBwdXQodXJsOiBzdHJpbmcsIGJvZHk6IGFueSwgb3B0aW9ucz86IFJlcXVlc3RPcHRpb25zQXJncyk6IE9ic2VydmFibGU8UmVzcG9uc2U+IHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG5ldyBSZXF1ZXN0KG1lcmdlT3B0aW9ucyhcbiAgICAgICAgdGhpcy5fZGVmYXVsdE9wdGlvbnMubWVyZ2UobmV3IFJlcXVlc3RPcHRpb25zKHtib2R5OiBib2R5fSkpLCBvcHRpb25zLCBSZXF1ZXN0TWV0aG9kLlB1dCxcbiAgICAgICAgdXJsKSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIGEgcmVxdWVzdCB3aXRoIGBkZWxldGVgIGh0dHAgbWV0aG9kLlxuICAgKi9cbiAgZGVsZXRlICh1cmw6IHN0cmluZywgb3B0aW9ucz86IFJlcXVlc3RPcHRpb25zQXJncyk6IE9ic2VydmFibGU8UmVzcG9uc2U+IHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KFxuICAgICAgICBuZXcgUmVxdWVzdChtZXJnZU9wdGlvbnModGhpcy5fZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMsIFJlcXVlc3RNZXRob2QuRGVsZXRlLCB1cmwpKSk7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgYSByZXF1ZXN0IHdpdGggYHBhdGNoYCBodHRwIG1ldGhvZC5cbiAgICovXG4gIHBhdGNoKHVybDogc3RyaW5nLCBib2R5OiBhbnksIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9uc0FyZ3MpOiBPYnNlcnZhYmxlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChuZXcgUmVxdWVzdChtZXJnZU9wdGlvbnMoXG4gICAgICAgIHRoaXMuX2RlZmF1bHRPcHRpb25zLm1lcmdlKG5ldyBSZXF1ZXN0T3B0aW9ucyh7Ym9keTogYm9keX0pKSwgb3B0aW9ucywgUmVxdWVzdE1ldGhvZC5QYXRjaCxcbiAgICAgICAgdXJsKSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIGEgcmVxdWVzdCB3aXRoIGBoZWFkYCBodHRwIG1ldGhvZC5cbiAgICovXG4gIGhlYWQodXJsOiBzdHJpbmcsIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9uc0FyZ3MpOiBPYnNlcnZhYmxlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChcbiAgICAgICAgbmV3IFJlcXVlc3QobWVyZ2VPcHRpb25zKHRoaXMuX2RlZmF1bHRPcHRpb25zLCBvcHRpb25zLCBSZXF1ZXN0TWV0aG9kLkhlYWQsIHVybCkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyBhIHJlcXVlc3Qgd2l0aCBgb3B0aW9uc2AgaHR0cCBtZXRob2QuXG4gICAqL1xuICBvcHRpb25zKHVybDogc3RyaW5nLCBvcHRpb25zPzogUmVxdWVzdE9wdGlvbnNBcmdzKTogT2JzZXJ2YWJsZTxSZXNwb25zZT4ge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QoXG4gICAgICAgIG5ldyBSZXF1ZXN0KG1lcmdlT3B0aW9ucyh0aGlzLl9kZWZhdWx0T3B0aW9ucywgb3B0aW9ucywgUmVxdWVzdE1ldGhvZC5PcHRpb25zLCB1cmwpKSk7XG4gIH1cbn1cblxuXG4vKipcbiAqIEBkZXByZWNhdGVkIHNlZSBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaHR0cFxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSnNvbnAgZXh0ZW5kcyBIdHRwIHtcbiAgY29uc3RydWN0b3IoYmFja2VuZDogQ29ubmVjdGlvbkJhY2tlbmQsIGRlZmF1bHRPcHRpb25zOiBSZXF1ZXN0T3B0aW9ucykge1xuICAgIHN1cGVyKGJhY2tlbmQsIGRlZmF1bHRPcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyBhbnkgdHlwZSBvZiBodHRwIHJlcXVlc3QuIEZpcnN0IGFyZ3VtZW50IGlzIHJlcXVpcmVkLCBhbmQgY2FuIGVpdGhlciBiZSBhIHVybCBvclxuICAgKiBhIHtAbGluayBSZXF1ZXN0fSBpbnN0YW5jZS4gSWYgdGhlIGZpcnN0IGFyZ3VtZW50IGlzIGEgdXJsLCBhbiBvcHRpb25hbCB7QGxpbmsgUmVxdWVzdE9wdGlvbnN9XG4gICAqIG9iamVjdCBjYW4gYmUgcHJvdmlkZWQgYXMgdGhlIDJuZCBhcmd1bWVudC4gVGhlIG9wdGlvbnMgb2JqZWN0IHdpbGwgYmUgbWVyZ2VkIHdpdGggdGhlIHZhbHVlc1xuICAgKiBvZiB7QGxpbmsgQmFzZVJlcXVlc3RPcHRpb25zfSBiZWZvcmUgcGVyZm9ybWluZyB0aGUgcmVxdWVzdC5cbiAgICpcbiAgICogQHNlY3VyaXR5IFJlZ3VsYXIgWEhSIGlzIHRoZSBzYWZlc3QgYWx0ZXJuYXRpdmUgdG8gSlNPTlAgZm9yIG1vc3QgYXBwbGljYXRpb25zLCBhbmQgaXNcbiAgICogc3VwcG9ydGVkIGJ5IGFsbCBjdXJyZW50IGJyb3dzZXJzLiBCZWNhdXNlIEpTT05QIGNyZWF0ZXMgYSBgPHNjcmlwdD5gIGVsZW1lbnQgd2l0aFxuICAgKiBjb250ZW50cyByZXRyaWV2ZWQgZnJvbSBhIHJlbW90ZSBzb3VyY2UsIGF0dGFja2VyLWNvbnRyb2xsZWQgZGF0YSBpbnRyb2R1Y2VkIGJ5IGFuIHVudHJ1c3RlZFxuICAgKiBzb3VyY2UgY291bGQgZXhwb3NlIHlvdXIgYXBwbGljYXRpb24gdG8gWFNTIHJpc2tzLiBEYXRhIGV4cG9zZWQgYnkgSlNPTlAgbWF5IGFsc28gYmVcbiAgICogcmVhZGFibGUgYnkgbWFsaWNpb3VzIHRoaXJkLXBhcnR5IHdlYnNpdGVzLiBJbiBhZGRpdGlvbiwgSlNPTlAgaW50cm9kdWNlcyBwb3RlbnRpYWwgcmlzayBmb3JcbiAgICogZnV0dXJlIHNlY3VyaXR5IGlzc3VlcyAoZS5nLiBjb250ZW50IHNuaWZmaW5nKS4gIEZvciBtb3JlIGRldGFpbCwgc2VlIHRoZVxuICAgKiBbU2VjdXJpdHkgR3VpZGVdKGh0dHA6Ly9nLmNvL25nL3NlY3VyaXR5KS5cbiAgICovXG4gIHJlcXVlc3QodXJsOiBzdHJpbmd8UmVxdWVzdCwgb3B0aW9ucz86IFJlcXVlc3RPcHRpb25zQXJncyk6IE9ic2VydmFibGU8UmVzcG9uc2U+IHtcbiAgICBsZXQgcmVzcG9uc2VPYnNlcnZhYmxlOiBhbnk7XG4gICAgaWYgKHR5cGVvZiB1cmwgPT09ICdzdHJpbmcnKSB7XG4gICAgICB1cmwgPVxuICAgICAgICAgIG5ldyBSZXF1ZXN0KG1lcmdlT3B0aW9ucyh0aGlzLl9kZWZhdWx0T3B0aW9ucywgb3B0aW9ucywgUmVxdWVzdE1ldGhvZC5HZXQsIDxzdHJpbmc+dXJsKSk7XG4gICAgfVxuICAgIGlmICh1cmwgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG4gICAgICBpZiAodXJsLm1ldGhvZCAhPT0gUmVxdWVzdE1ldGhvZC5HZXQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdKU09OUCByZXF1ZXN0cyBtdXN0IHVzZSBHRVQgcmVxdWVzdCBtZXRob2QuJyk7XG4gICAgICB9XG4gICAgICByZXNwb25zZU9ic2VydmFibGUgPSBodHRwUmVxdWVzdCh0aGlzLl9iYWNrZW5kLCB1cmwpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYSB1cmwgc3RyaW5nIG9yIFJlcXVlc3QgaW5zdGFuY2UuJyk7XG4gICAgfVxuICAgIHJldHVybiByZXNwb25zZU9ic2VydmFibGU7XG4gIH1cbn1cbiJdfQ==