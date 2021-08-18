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
 * Abstract class from which real backends are derived.
 *
 * The primary purpose of a `ConnectionBackend` is to create new connections to fulfill a given
 * {\@link Request}.
 *
 * @deprecated see https://angular.io/guide/http
 * \@publicApi
 * @abstract
 */
export class ConnectionBackend {
}
if (false) {
    /**
     * @abstract
     * @param {?} request
     * @return {?}
     */
    ConnectionBackend.prototype.createConnection = function (request) { };
}
/**
 * Abstract class from which real connections are derived.
 *
 * @deprecated see https://angular.io/guide/http
 * \@publicApi
 * @abstract
 */
export class Connection {
}
if (false) {
    /** @type {?} */
    Connection.prototype.readyState;
    /** @type {?} */
    Connection.prototype.request;
    /** @type {?} */
    Connection.prototype.response;
}
/**
 * An XSRFStrategy configures XSRF protection (e.g. via headers) on an HTTP request.
 *
 * @deprecated see https://angular.io/guide/http
 * \@publicApi
 * @abstract
 */
export class XSRFStrategy {
}
if (false) {
    /**
     * @abstract
     * @param {?} req
     * @return {?}
     */
    XSRFStrategy.prototype.configureRequest = function (req) { };
}
/**
 * Interface for options to construct a RequestOptions, based on
 * [RequestInit](https://fetch.spec.whatwg.org/#requestinit) from the Fetch spec.
 *
 * @deprecated see https://angular.io/guide/http
 * \@publicApi
 * @record
 */
export function RequestOptionsArgs() { }
if (false) {
    /** @type {?|undefined} */
    RequestOptionsArgs.prototype.url;
    /** @type {?|undefined} */
    RequestOptionsArgs.prototype.method;
    /**
     * @deprecated from 4.0.0. Use params instead.
     * @type {?|undefined}
     */
    RequestOptionsArgs.prototype.search;
    /** @type {?|undefined} */
    RequestOptionsArgs.prototype.params;
    /** @type {?|undefined} */
    RequestOptionsArgs.prototype.headers;
    /** @type {?|undefined} */
    RequestOptionsArgs.prototype.body;
    /** @type {?|undefined} */
    RequestOptionsArgs.prototype.withCredentials;
    /** @type {?|undefined} */
    RequestOptionsArgs.prototype.responseType;
}
/**
 * Required structure when constructing new Request();
 * @record
 */
export function RequestArgs() { }
if (false) {
    /** @type {?} */
    RequestArgs.prototype.url;
}
/**
 * Interface for options to construct a Response, based on
 * [ResponseInit](https://fetch.spec.whatwg.org/#responseinit) from the Fetch spec.
 *
 * @deprecated see https://angular.io/guide/http
 * \@publicApi
 * @record
 */
export function ResponseOptionsArgs() { }
if (false) {
    /** @type {?|undefined} */
    ResponseOptionsArgs.prototype.body;
    /** @type {?|undefined} */
    ResponseOptionsArgs.prototype.status;
    /** @type {?|undefined} */
    ResponseOptionsArgs.prototype.statusText;
    /** @type {?|undefined} */
    ResponseOptionsArgs.prototype.headers;
    /** @type {?|undefined} */
    ResponseOptionsArgs.prototype.type;
    /** @type {?|undefined} */
    ResponseOptionsArgs.prototype.url;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJmYWNlcy5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2h0dHAvc3JjL2ludGVyZmFjZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0JBLE1BQU0sT0FBZ0IsaUJBQWlCO0NBQXlEOzs7Ozs7O0lBQXRELHNFQUFvRDs7Ozs7Ozs7O0FBUTlGLE1BQU0sT0FBZ0IsVUFBVTtDQU0vQjs7O0lBSkMsZ0NBQXlCOztJQUV6Qiw2QkFBbUI7O0lBQ25CLDhCQUFjOzs7Ozs7Ozs7QUFTaEIsTUFBTSxPQUFnQixZQUFZO0NBQW1EOzs7Ozs7O0lBQWhELDZEQUE4Qzs7Ozs7Ozs7OztBQVNuRix3Q0FVQzs7O0lBVEMsaUNBQWtCOztJQUNsQixvQ0FBbUM7Ozs7O0lBRW5DLG9DQUFrRTs7SUFDbEUsb0NBQWtFOztJQUNsRSxxQ0FBdUI7O0lBQ3ZCLGtDQUFXOztJQUNYLDZDQUErQjs7SUFDL0IsMENBQXdDOzs7Ozs7QUFNMUMsaUNBQTZFOzs7SUFBbkIsMEJBQWlCOzs7Ozs7Ozs7O0FBUzNFLHlDQU9DOzs7SUFOQyxtQ0FBb0Q7O0lBQ3BELHFDQUFxQjs7SUFDckIseUNBQXlCOztJQUN6QixzQ0FBdUI7O0lBQ3ZCLG1DQUF5Qjs7SUFDekIsa0NBQWtCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1JlYWR5U3RhdGUsIFJlcXVlc3RNZXRob2QsIFJlc3BvbnNlQ29udGVudFR5cGUsIFJlc3BvbnNlVHlwZX0gZnJvbSAnLi9lbnVtcyc7XG5pbXBvcnQge0hlYWRlcnN9IGZyb20gJy4vaGVhZGVycyc7XG5pbXBvcnQge1JlcXVlc3R9IGZyb20gJy4vc3RhdGljX3JlcXVlc3QnO1xuaW1wb3J0IHtVUkxTZWFyY2hQYXJhbXN9IGZyb20gJy4vdXJsX3NlYXJjaF9wYXJhbXMnO1xuXG4vKipcbiAqIEFic3RyYWN0IGNsYXNzIGZyb20gd2hpY2ggcmVhbCBiYWNrZW5kcyBhcmUgZGVyaXZlZC5cbiAqXG4gKiBUaGUgcHJpbWFyeSBwdXJwb3NlIG9mIGEgYENvbm5lY3Rpb25CYWNrZW5kYCBpcyB0byBjcmVhdGUgbmV3IGNvbm5lY3Rpb25zIHRvIGZ1bGZpbGwgYSBnaXZlblxuICoge0BsaW5rIFJlcXVlc3R9LlxuICpcbiAqIEBkZXByZWNhdGVkIHNlZSBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaHR0cFxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29ubmVjdGlvbkJhY2tlbmQgeyBhYnN0cmFjdCBjcmVhdGVDb25uZWN0aW9uKHJlcXVlc3Q6IGFueSk6IENvbm5lY3Rpb247IH1cblxuLyoqXG4gKiBBYnN0cmFjdCBjbGFzcyBmcm9tIHdoaWNoIHJlYWwgY29ubmVjdGlvbnMgYXJlIGRlcml2ZWQuXG4gKlxuICogQGRlcHJlY2F0ZWQgc2VlIGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9odHRwXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb25uZWN0aW9uIHtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHJlYWR5U3RhdGUgITogUmVhZHlTdGF0ZTtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHJlcXVlc3QgITogUmVxdWVzdDtcbiAgcmVzcG9uc2U6IGFueTsgIC8vIFRPRE86IGdlbmVyaWMgb2YgPFJlc3BvbnNlPjtcbn1cblxuLyoqXG4gKiBBbiBYU1JGU3RyYXRlZ3kgY29uZmlndXJlcyBYU1JGIHByb3RlY3Rpb24gKGUuZy4gdmlhIGhlYWRlcnMpIG9uIGFuIEhUVFAgcmVxdWVzdC5cbiAqXG4gKiBAZGVwcmVjYXRlZCBzZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2h0dHBcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFhTUkZTdHJhdGVneSB7IGFic3RyYWN0IGNvbmZpZ3VyZVJlcXVlc3QocmVxOiBSZXF1ZXN0KTogdm9pZDsgfVxuXG4vKipcbiAqIEludGVyZmFjZSBmb3Igb3B0aW9ucyB0byBjb25zdHJ1Y3QgYSBSZXF1ZXN0T3B0aW9ucywgYmFzZWQgb25cbiAqIFtSZXF1ZXN0SW5pdF0oaHR0cHM6Ly9mZXRjaC5zcGVjLndoYXR3Zy5vcmcvI3JlcXVlc3Rpbml0KSBmcm9tIHRoZSBGZXRjaCBzcGVjLlxuICpcbiAqIEBkZXByZWNhdGVkIHNlZSBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaHR0cFxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlcXVlc3RPcHRpb25zQXJncyB7XG4gIHVybD86IHN0cmluZ3xudWxsO1xuICBtZXRob2Q/OiBzdHJpbmd8UmVxdWVzdE1ldGhvZHxudWxsO1xuICAvKiogQGRlcHJlY2F0ZWQgZnJvbSA0LjAuMC4gVXNlIHBhcmFtcyBpbnN0ZWFkLiAqL1xuICBzZWFyY2g/OiBzdHJpbmd8VVJMU2VhcmNoUGFyYW1zfHtba2V5OiBzdHJpbmddOiBhbnkgfCBhbnlbXX18bnVsbDtcbiAgcGFyYW1zPzogc3RyaW5nfFVSTFNlYXJjaFBhcmFtc3x7W2tleTogc3RyaW5nXTogYW55IHwgYW55W119fG51bGw7XG4gIGhlYWRlcnM/OiBIZWFkZXJzfG51bGw7XG4gIGJvZHk/OiBhbnk7XG4gIHdpdGhDcmVkZW50aWFscz86IGJvb2xlYW58bnVsbDtcbiAgcmVzcG9uc2VUeXBlPzogUmVzcG9uc2VDb250ZW50VHlwZXxudWxsO1xufVxuXG4vKipcbiAqIFJlcXVpcmVkIHN0cnVjdHVyZSB3aGVuIGNvbnN0cnVjdGluZyBuZXcgUmVxdWVzdCgpO1xuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlcXVlc3RBcmdzIGV4dGVuZHMgUmVxdWVzdE9wdGlvbnNBcmdzIHsgdXJsOiBzdHJpbmd8bnVsbDsgfVxuXG4vKipcbiAqIEludGVyZmFjZSBmb3Igb3B0aW9ucyB0byBjb25zdHJ1Y3QgYSBSZXNwb25zZSwgYmFzZWQgb25cbiAqIFtSZXNwb25zZUluaXRdKGh0dHBzOi8vZmV0Y2guc3BlYy53aGF0d2cub3JnLyNyZXNwb25zZWluaXQpIGZyb20gdGhlIEZldGNoIHNwZWMuXG4gKlxuICogQGRlcHJlY2F0ZWQgc2VlIGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9odHRwXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVzcG9uc2VPcHRpb25zQXJncyB7XG4gIGJvZHk/OiBzdHJpbmd8T2JqZWN0fEZvcm1EYXRhfEFycmF5QnVmZmVyfEJsb2J8bnVsbDtcbiAgc3RhdHVzPzogbnVtYmVyfG51bGw7XG4gIHN0YXR1c1RleHQ/OiBzdHJpbmd8bnVsbDtcbiAgaGVhZGVycz86IEhlYWRlcnN8bnVsbDtcbiAgdHlwZT86IFJlc3BvbnNlVHlwZXxudWxsO1xuICB1cmw/OiBzdHJpbmd8bnVsbDtcbn1cbiJdfQ==