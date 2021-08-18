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
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpErrorResponse, HttpEventType, HttpResponse } from './response';
// Every request made through JSONP needs a callback name that's unique across the
// whole page. Each request is assigned an id and the callback name is constructed
// from that. The next id to be assigned is tracked in a global variable here that
// is shared among all applications on the page.
/** @type {?} */
let nextRequestId = 0;
// Error text given when a JSONP script is injected, but doesn't invoke the callback
// passed in its URL.
/** @type {?} */
export const JSONP_ERR_NO_CALLBACK = 'JSONP injected script did not invoke callback.';
// Error text given when a request is passed to the JsonpClientBackend that doesn't
// have a request method JSONP.
/** @type {?} */
export const JSONP_ERR_WRONG_METHOD = 'JSONP requests must use JSONP request method.';
/** @type {?} */
export const JSONP_ERR_WRONG_RESPONSE_TYPE = 'JSONP requests must use Json response type.';
/**
 * DI token/abstract type representing a map of JSONP callbacks.
 *
 * In the browser, this should always be the `window` object.
 *
 *
 * @abstract
 */
export class JsonpCallbackContext {
}
/**
 * `HttpBackend` that only processes `HttpRequest` with the JSONP method,
 * by performing JSONP style requests.
 *
 * \@publicApi
 */
export class JsonpClientBackend {
    /**
     * @param {?} callbackMap
     * @param {?} document
     */
    constructor(callbackMap, document) {
        this.callbackMap = callbackMap;
        this.document = document;
    }
    /**
     * Get the name of the next callback method, by incrementing the global `nextRequestId`.
     * @return {?}
     */
    nextCallback() { return `ng_jsonp_callback_${nextRequestId++}`; }
    /**
     * Process a JSONP request and return an event stream of the results.
     * @param {?} req
     * @return {?}
     */
    handle(req) {
        // Firstly, check both the method and response type. If either doesn't match
        // then the request was improperly routed here and cannot be handled.
        if (req.method !== 'JSONP') {
            throw new Error(JSONP_ERR_WRONG_METHOD);
        }
        else if (req.responseType !== 'json') {
            throw new Error(JSONP_ERR_WRONG_RESPONSE_TYPE);
        }
        // Everything else happens inside the Observable boundary.
        return new Observable((observer) => {
            // The first step to make a request is to generate the callback name, and replace the
            // callback placeholder in the URL with the name. Care has to be taken here to ensure
            // a trailing &, if matched, gets inserted back into the URL in the correct place.
            /** @type {?} */
            const callback = this.nextCallback();
            /** @type {?} */
            const url = req.urlWithParams.replace(/=JSONP_CALLBACK(&|$)/, `=${callback}$1`);
            // Construct the <script> tag and point it at the URL.
            /** @type {?} */
            const node = this.document.createElement('script');
            node.src = url;
            // A JSONP request requires waiting for multiple callbacks. These variables
            // are closed over and track state across those callbacks.
            // The response object, if one has been received, or null otherwise.
            /** @type {?} */
            let body = null;
            // Whether the response callback has been called.
            /** @type {?} */
            let finished = false;
            // Whether the request has been cancelled (and thus any other callbacks)
            // should be ignored.
            /** @type {?} */
            let cancelled = false;
            // Set the response callback in this.callbackMap (which will be the window
            // object in the browser. The script being loaded via the <script> tag will
            // eventually call this callback.
            this.callbackMap[callback] = (data) => {
                // Data has been received from the JSONP script. Firstly, delete this callback.
                delete this.callbackMap[callback];
                // Next, make sure the request wasn't cancelled in the meantime.
                if (cancelled) {
                    return;
                }
                // Set state to indicate data was received.
                body = data;
                finished = true;
            };
            // cleanup() is a utility closure that removes the <script> from the page and
            // the response callback from the window. This logic is used in both the
            // success, error, and cancellation paths, so it's extracted out for convenience.
            /** @type {?} */
            const cleanup = () => {
                // Remove the <script> tag if it's still on the page.
                if (node.parentNode) {
                    node.parentNode.removeChild(node);
                }
                // Remove the response callback from the callbackMap (window object in the
                // browser).
                delete this.callbackMap[callback];
            };
            // onLoad() is the success callback which runs after the response callback
            // if the JSONP script loads successfully. The event itself is unimportant.
            // If something went wrong, onLoad() may run without the response callback
            // having been invoked.
            /** @type {?} */
            const onLoad = (event) => {
                // Do nothing if the request has been cancelled.
                if (cancelled) {
                    return;
                }
                // Cleanup the page.
                cleanup();
                // Check whether the response callback has run.
                if (!finished) {
                    // It hasn't, something went wrong with the request. Return an error via
                    // the Observable error path. All JSONP errors have status 0.
                    observer.error(new HttpErrorResponse({
                        url,
                        status: 0,
                        statusText: 'JSONP Error',
                        error: new Error(JSONP_ERR_NO_CALLBACK),
                    }));
                    return;
                }
                // Success. body either contains the response body or null if none was
                // returned.
                observer.next(new HttpResponse({
                    body,
                    status: 200,
                    statusText: 'OK', url,
                }));
                // Complete the stream, the response is over.
                observer.complete();
            };
            // onError() is the error callback, which runs if the script returned generates
            // a Javascript error. It emits the error via the Observable error channel as
            // a HttpErrorResponse.
            /** @type {?} */
            const onError = (error) => {
                // If the request was already cancelled, no need to emit anything.
                if (cancelled) {
                    return;
                }
                cleanup();
                // Wrap the error in a HttpErrorResponse.
                observer.error(new HttpErrorResponse({
                    error,
                    status: 0,
                    statusText: 'JSONP Error', url,
                }));
            };
            // Subscribe to both the success (load) and error events on the <script> tag,
            // and add it to the page.
            node.addEventListener('load', onLoad);
            node.addEventListener('error', onError);
            this.document.body.appendChild(node);
            // The request has now been successfully sent.
            observer.next({ type: HttpEventType.Sent });
            // Cancellation handler.
            return () => {
                // Track the cancellation so event listeners won't do anything even if already scheduled.
                cancelled = true;
                // Remove the event listeners so they won't run if the events later fire.
                node.removeEventListener('load', onLoad);
                node.removeEventListener('error', onError);
                // And finally, clean up the page.
                cleanup();
            };
        });
    }
}
JsonpClientBackend.decorators = [
    { type: Injectable }
];
/** @nocollapse */
JsonpClientBackend.ctorParameters = () => [
    { type: JsonpCallbackContext },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
if (false) {
    /** @type {?} */
    JsonpClientBackend.prototype.callbackMap;
    /** @type {?} */
    JsonpClientBackend.prototype.document;
}
/**
 * An `HttpInterceptor` which identifies requests with the method JSONP and
 * shifts them to the `JsonpClientBackend`.
 *
 * \@publicApi
 */
export class JsonpInterceptor {
    /**
     * @param {?} jsonp
     */
    constructor(jsonp) {
        this.jsonp = jsonp;
    }
    /**
     * @param {?} req
     * @param {?} next
     * @return {?}
     */
    intercept(req, next) {
        if (req.method === 'JSONP') {
            return this.jsonp.handle((/** @type {?} */ (req)));
        }
        // Fall through for normal HTTP requests.
        return next.handle(req);
    }
}
JsonpInterceptor.decorators = [
    { type: Injectable }
];
/** @nocollapse */
JsonpInterceptor.ctorParameters = () => [
    { type: JsonpClientBackend }
];
if (false) {
    /** @type {?} */
    JsonpInterceptor.prototype.jsonp;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbnAuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvanNvbnAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDakQsT0FBTyxFQUFDLFVBQVUsRUFBVyxNQUFNLE1BQU0sQ0FBQztBQUkxQyxPQUFPLEVBQUMsaUJBQWlCLEVBQWEsYUFBYSxFQUFFLFlBQVksRUFBQyxNQUFNLFlBQVksQ0FBQzs7Ozs7O0lBTWpGLGFBQWEsR0FBVyxDQUFDOzs7O0FBSTdCLE1BQU0sT0FBTyxxQkFBcUIsR0FBRyxnREFBZ0Q7Ozs7QUFJckYsTUFBTSxPQUFPLHNCQUFzQixHQUFHLCtDQUErQzs7QUFDckYsTUFBTSxPQUFPLDZCQUE2QixHQUFHLDZDQUE2Qzs7Ozs7Ozs7O0FBUzFGLE1BQU0sT0FBZ0Isb0JBQW9CO0NBQXdDOzs7Ozs7O0FBU2xGLE1BQU0sT0FBTyxrQkFBa0I7Ozs7O0lBQzdCLFlBQW9CLFdBQWlDLEVBQTRCLFFBQWE7UUFBMUUsZ0JBQVcsR0FBWCxXQUFXLENBQXNCO1FBQTRCLGFBQVEsR0FBUixRQUFRLENBQUs7SUFBRyxDQUFDOzs7OztJQUsxRixZQUFZLEtBQWEsT0FBTyxxQkFBcUIsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Ozs7OztJQUtqRixNQUFNLENBQUMsR0FBdUI7UUFDNUIsNEVBQTRFO1FBQzVFLHFFQUFxRTtRQUNyRSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssT0FBTyxFQUFFO1lBQzFCLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztTQUN6QzthQUFNLElBQUksR0FBRyxDQUFDLFlBQVksS0FBSyxNQUFNLEVBQUU7WUFDdEMsTUFBTSxJQUFJLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1NBQ2hEO1FBRUQsMERBQTBEO1FBQzFELE9BQU8sSUFBSSxVQUFVLENBQWlCLENBQUMsUUFBa0MsRUFBRSxFQUFFOzs7OztrQkFJckUsUUFBUSxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUU7O2tCQUM5QixHQUFHLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxRQUFRLElBQUksQ0FBQzs7O2tCQUd6RSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDO1lBQ2xELElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDOzs7OztnQkFNWCxJQUFJLEdBQWEsSUFBSTs7O2dCQUdyQixRQUFRLEdBQVksS0FBSzs7OztnQkFJekIsU0FBUyxHQUFZLEtBQUs7WUFFOUIsMEVBQTBFO1lBQzFFLDJFQUEyRTtZQUMzRSxpQ0FBaUM7WUFDakMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQVUsRUFBRSxFQUFFO2dCQUMxQywrRUFBK0U7Z0JBQy9FLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFFbEMsZ0VBQWdFO2dCQUNoRSxJQUFJLFNBQVMsRUFBRTtvQkFDYixPQUFPO2lCQUNSO2dCQUVELDJDQUEyQztnQkFDM0MsSUFBSSxHQUFHLElBQUksQ0FBQztnQkFDWixRQUFRLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLENBQUMsQ0FBQzs7Ozs7a0JBS0ksT0FBTyxHQUFHLEdBQUcsRUFBRTtnQkFDbkIscURBQXFEO2dCQUNyRCxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7b0JBQ25CLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNuQztnQkFFRCwwRUFBMEU7Z0JBQzFFLFlBQVk7Z0JBQ1osT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3BDLENBQUM7Ozs7OztrQkFNSyxNQUFNLEdBQUcsQ0FBQyxLQUFZLEVBQUUsRUFBRTtnQkFDOUIsZ0RBQWdEO2dCQUNoRCxJQUFJLFNBQVMsRUFBRTtvQkFDYixPQUFPO2lCQUNSO2dCQUVELG9CQUFvQjtnQkFDcEIsT0FBTyxFQUFFLENBQUM7Z0JBRVYsK0NBQStDO2dCQUMvQyxJQUFJLENBQUMsUUFBUSxFQUFFO29CQUNiLHdFQUF3RTtvQkFDeEUsNkRBQTZEO29CQUM3RCxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksaUJBQWlCLENBQUM7d0JBQ25DLEdBQUc7d0JBQ0gsTUFBTSxFQUFFLENBQUM7d0JBQ1QsVUFBVSxFQUFFLGFBQWE7d0JBQ3pCLEtBQUssRUFBRSxJQUFJLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQztxQkFDeEMsQ0FBQyxDQUFDLENBQUM7b0JBQ0osT0FBTztpQkFDUjtnQkFFRCxzRUFBc0U7Z0JBQ3RFLFlBQVk7Z0JBQ1osUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLFlBQVksQ0FBQztvQkFDN0IsSUFBSTtvQkFDSixNQUFNLEVBQUUsR0FBRztvQkFDWCxVQUFVLEVBQUUsSUFBSSxFQUFFLEdBQUc7aUJBQ3RCLENBQUMsQ0FBQyxDQUFDO2dCQUVKLDZDQUE2QztnQkFDN0MsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3RCLENBQUM7Ozs7O2tCQUtLLE9BQU8sR0FBUSxDQUFDLEtBQVksRUFBRSxFQUFFO2dCQUNwQyxrRUFBa0U7Z0JBQ2xFLElBQUksU0FBUyxFQUFFO29CQUNiLE9BQU87aUJBQ1I7Z0JBQ0QsT0FBTyxFQUFFLENBQUM7Z0JBRVYseUNBQXlDO2dCQUN6QyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksaUJBQWlCLENBQUM7b0JBQ25DLEtBQUs7b0JBQ0wsTUFBTSxFQUFFLENBQUM7b0JBQ1QsVUFBVSxFQUFFLGFBQWEsRUFBRSxHQUFHO2lCQUMvQixDQUFDLENBQUMsQ0FBQztZQUNOLENBQUM7WUFFRCw2RUFBNkU7WUFDN0UsMEJBQTBCO1lBQzFCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFckMsOENBQThDO1lBQzlDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLElBQUksRUFBQyxDQUFDLENBQUM7WUFFMUMsd0JBQXdCO1lBQ3hCLE9BQU8sR0FBRyxFQUFFO2dCQUNWLHlGQUF5RjtnQkFDekYsU0FBUyxHQUFHLElBQUksQ0FBQztnQkFFakIseUVBQXlFO2dCQUN6RSxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUN6QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUUzQyxrQ0FBa0M7Z0JBQ2xDLE9BQU8sRUFBRSxDQUFDO1lBQ1osQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDOzs7WUEzSkYsVUFBVTs7OztZQUV3QixvQkFBb0I7NENBQUcsTUFBTSxTQUFDLFFBQVE7Ozs7SUFBM0QseUNBQXlDOztJQUFFLHNDQUF1Qzs7Ozs7Ozs7QUFtS2hHLE1BQU0sT0FBTyxnQkFBZ0I7Ozs7SUFDM0IsWUFBb0IsS0FBeUI7UUFBekIsVUFBSyxHQUFMLEtBQUssQ0FBb0I7SUFBRyxDQUFDOzs7Ozs7SUFFakQsU0FBUyxDQUFDLEdBQXFCLEVBQUUsSUFBaUI7UUFDaEQsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLE9BQU8sRUFBRTtZQUMxQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLG1CQUFBLEdBQUcsRUFBc0IsQ0FBQyxDQUFDO1NBQ3JEO1FBQ0QseUNBQXlDO1FBQ3pDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMxQixDQUFDOzs7WUFWRixVQUFVOzs7O1lBRWtCLGtCQUFrQjs7OztJQUFqQyxpQ0FBaUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIE9ic2VydmVyfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtIdHRwQmFja2VuZCwgSHR0cEhhbmRsZXJ9IGZyb20gJy4vYmFja2VuZCc7XG5pbXBvcnQge0h0dHBSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IHtIdHRwRXJyb3JSZXNwb25zZSwgSHR0cEV2ZW50LCBIdHRwRXZlbnRUeXBlLCBIdHRwUmVzcG9uc2V9IGZyb20gJy4vcmVzcG9uc2UnO1xuXG4vLyBFdmVyeSByZXF1ZXN0IG1hZGUgdGhyb3VnaCBKU09OUCBuZWVkcyBhIGNhbGxiYWNrIG5hbWUgdGhhdCdzIHVuaXF1ZSBhY3Jvc3MgdGhlXG4vLyB3aG9sZSBwYWdlLiBFYWNoIHJlcXVlc3QgaXMgYXNzaWduZWQgYW4gaWQgYW5kIHRoZSBjYWxsYmFjayBuYW1lIGlzIGNvbnN0cnVjdGVkXG4vLyBmcm9tIHRoYXQuIFRoZSBuZXh0IGlkIHRvIGJlIGFzc2lnbmVkIGlzIHRyYWNrZWQgaW4gYSBnbG9iYWwgdmFyaWFibGUgaGVyZSB0aGF0XG4vLyBpcyBzaGFyZWQgYW1vbmcgYWxsIGFwcGxpY2F0aW9ucyBvbiB0aGUgcGFnZS5cbmxldCBuZXh0UmVxdWVzdElkOiBudW1iZXIgPSAwO1xuXG4vLyBFcnJvciB0ZXh0IGdpdmVuIHdoZW4gYSBKU09OUCBzY3JpcHQgaXMgaW5qZWN0ZWQsIGJ1dCBkb2Vzbid0IGludm9rZSB0aGUgY2FsbGJhY2tcbi8vIHBhc3NlZCBpbiBpdHMgVVJMLlxuZXhwb3J0IGNvbnN0IEpTT05QX0VSUl9OT19DQUxMQkFDSyA9ICdKU09OUCBpbmplY3RlZCBzY3JpcHQgZGlkIG5vdCBpbnZva2UgY2FsbGJhY2suJztcblxuLy8gRXJyb3IgdGV4dCBnaXZlbiB3aGVuIGEgcmVxdWVzdCBpcyBwYXNzZWQgdG8gdGhlIEpzb25wQ2xpZW50QmFja2VuZCB0aGF0IGRvZXNuJ3Rcbi8vIGhhdmUgYSByZXF1ZXN0IG1ldGhvZCBKU09OUC5cbmV4cG9ydCBjb25zdCBKU09OUF9FUlJfV1JPTkdfTUVUSE9EID0gJ0pTT05QIHJlcXVlc3RzIG11c3QgdXNlIEpTT05QIHJlcXVlc3QgbWV0aG9kLic7XG5leHBvcnQgY29uc3QgSlNPTlBfRVJSX1dST05HX1JFU1BPTlNFX1RZUEUgPSAnSlNPTlAgcmVxdWVzdHMgbXVzdCB1c2UgSnNvbiByZXNwb25zZSB0eXBlLic7XG5cbi8qKlxuICogREkgdG9rZW4vYWJzdHJhY3QgdHlwZSByZXByZXNlbnRpbmcgYSBtYXAgb2YgSlNPTlAgY2FsbGJhY2tzLlxuICpcbiAqIEluIHRoZSBicm93c2VyLCB0aGlzIHNob3VsZCBhbHdheXMgYmUgdGhlIGB3aW5kb3dgIG9iamVjdC5cbiAqXG4gKlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSnNvbnBDYWxsYmFja0NvbnRleHQgeyBba2V5OiBzdHJpbmddOiAoZGF0YTogYW55KSA9PiB2b2lkOyB9XG5cbi8qKlxuICogYEh0dHBCYWNrZW5kYCB0aGF0IG9ubHkgcHJvY2Vzc2VzIGBIdHRwUmVxdWVzdGAgd2l0aCB0aGUgSlNPTlAgbWV0aG9kLFxuICogYnkgcGVyZm9ybWluZyBKU09OUCBzdHlsZSByZXF1ZXN0cy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBKc29ucENsaWVudEJhY2tlbmQgaW1wbGVtZW50cyBIdHRwQmFja2VuZCB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY2FsbGJhY2tNYXA6IEpzb25wQ2FsbGJhY2tDb250ZXh0LCBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIGRvY3VtZW50OiBhbnkpIHt9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbmFtZSBvZiB0aGUgbmV4dCBjYWxsYmFjayBtZXRob2QsIGJ5IGluY3JlbWVudGluZyB0aGUgZ2xvYmFsIGBuZXh0UmVxdWVzdElkYC5cbiAgICovXG4gIHByaXZhdGUgbmV4dENhbGxiYWNrKCk6IHN0cmluZyB7IHJldHVybiBgbmdfanNvbnBfY2FsbGJhY2tfJHtuZXh0UmVxdWVzdElkKyt9YDsgfVxuXG4gIC8qKlxuICAgKiBQcm9jZXNzIGEgSlNPTlAgcmVxdWVzdCBhbmQgcmV0dXJuIGFuIGV2ZW50IHN0cmVhbSBvZiB0aGUgcmVzdWx0cy5cbiAgICovXG4gIGhhbmRsZShyZXE6IEh0dHBSZXF1ZXN0PG5ldmVyPik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICAvLyBGaXJzdGx5LCBjaGVjayBib3RoIHRoZSBtZXRob2QgYW5kIHJlc3BvbnNlIHR5cGUuIElmIGVpdGhlciBkb2Vzbid0IG1hdGNoXG4gICAgLy8gdGhlbiB0aGUgcmVxdWVzdCB3YXMgaW1wcm9wZXJseSByb3V0ZWQgaGVyZSBhbmQgY2Fubm90IGJlIGhhbmRsZWQuXG4gICAgaWYgKHJlcS5tZXRob2QgIT09ICdKU09OUCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihKU09OUF9FUlJfV1JPTkdfTUVUSE9EKTtcbiAgICB9IGVsc2UgaWYgKHJlcS5yZXNwb25zZVR5cGUgIT09ICdqc29uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKEpTT05QX0VSUl9XUk9OR19SRVNQT05TRV9UWVBFKTtcbiAgICB9XG5cbiAgICAvLyBFdmVyeXRoaW5nIGVsc2UgaGFwcGVucyBpbnNpZGUgdGhlIE9ic2VydmFibGUgYm91bmRhcnkuXG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+Pigob2JzZXJ2ZXI6IE9ic2VydmVyPEh0dHBFdmVudDxhbnk+PikgPT4ge1xuICAgICAgLy8gVGhlIGZpcnN0IHN0ZXAgdG8gbWFrZSBhIHJlcXVlc3QgaXMgdG8gZ2VuZXJhdGUgdGhlIGNhbGxiYWNrIG5hbWUsIGFuZCByZXBsYWNlIHRoZVxuICAgICAgLy8gY2FsbGJhY2sgcGxhY2Vob2xkZXIgaW4gdGhlIFVSTCB3aXRoIHRoZSBuYW1lLiBDYXJlIGhhcyB0byBiZSB0YWtlbiBoZXJlIHRvIGVuc3VyZVxuICAgICAgLy8gYSB0cmFpbGluZyAmLCBpZiBtYXRjaGVkLCBnZXRzIGluc2VydGVkIGJhY2sgaW50byB0aGUgVVJMIGluIHRoZSBjb3JyZWN0IHBsYWNlLlxuICAgICAgY29uc3QgY2FsbGJhY2sgPSB0aGlzLm5leHRDYWxsYmFjaygpO1xuICAgICAgY29uc3QgdXJsID0gcmVxLnVybFdpdGhQYXJhbXMucmVwbGFjZSgvPUpTT05QX0NBTExCQUNLKCZ8JCkvLCBgPSR7Y2FsbGJhY2t9JDFgKTtcblxuICAgICAgLy8gQ29uc3RydWN0IHRoZSA8c2NyaXB0PiB0YWcgYW5kIHBvaW50IGl0IGF0IHRoZSBVUkwuXG4gICAgICBjb25zdCBub2RlID0gdGhpcy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgIG5vZGUuc3JjID0gdXJsO1xuXG4gICAgICAvLyBBIEpTT05QIHJlcXVlc3QgcmVxdWlyZXMgd2FpdGluZyBmb3IgbXVsdGlwbGUgY2FsbGJhY2tzLiBUaGVzZSB2YXJpYWJsZXNcbiAgICAgIC8vIGFyZSBjbG9zZWQgb3ZlciBhbmQgdHJhY2sgc3RhdGUgYWNyb3NzIHRob3NlIGNhbGxiYWNrcy5cblxuICAgICAgLy8gVGhlIHJlc3BvbnNlIG9iamVjdCwgaWYgb25lIGhhcyBiZWVuIHJlY2VpdmVkLCBvciBudWxsIG90aGVyd2lzZS5cbiAgICAgIGxldCBib2R5OiBhbnl8bnVsbCA9IG51bGw7XG5cbiAgICAgIC8vIFdoZXRoZXIgdGhlIHJlc3BvbnNlIGNhbGxiYWNrIGhhcyBiZWVuIGNhbGxlZC5cbiAgICAgIGxldCBmaW5pc2hlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgICAvLyBXaGV0aGVyIHRoZSByZXF1ZXN0IGhhcyBiZWVuIGNhbmNlbGxlZCAoYW5kIHRodXMgYW55IG90aGVyIGNhbGxiYWNrcylcbiAgICAgIC8vIHNob3VsZCBiZSBpZ25vcmVkLlxuICAgICAgbGV0IGNhbmNlbGxlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgICAvLyBTZXQgdGhlIHJlc3BvbnNlIGNhbGxiYWNrIGluIHRoaXMuY2FsbGJhY2tNYXAgKHdoaWNoIHdpbGwgYmUgdGhlIHdpbmRvd1xuICAgICAgLy8gb2JqZWN0IGluIHRoZSBicm93c2VyLiBUaGUgc2NyaXB0IGJlaW5nIGxvYWRlZCB2aWEgdGhlIDxzY3JpcHQ+IHRhZyB3aWxsXG4gICAgICAvLyBldmVudHVhbGx5IGNhbGwgdGhpcyBjYWxsYmFjay5cbiAgICAgIHRoaXMuY2FsbGJhY2tNYXBbY2FsbGJhY2tdID0gKGRhdGE/OiBhbnkpID0+IHtcbiAgICAgICAgLy8gRGF0YSBoYXMgYmVlbiByZWNlaXZlZCBmcm9tIHRoZSBKU09OUCBzY3JpcHQuIEZpcnN0bHksIGRlbGV0ZSB0aGlzIGNhbGxiYWNrLlxuICAgICAgICBkZWxldGUgdGhpcy5jYWxsYmFja01hcFtjYWxsYmFja107XG5cbiAgICAgICAgLy8gTmV4dCwgbWFrZSBzdXJlIHRoZSByZXF1ZXN0IHdhc24ndCBjYW5jZWxsZWQgaW4gdGhlIG1lYW50aW1lLlxuICAgICAgICBpZiAoY2FuY2VsbGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IHN0YXRlIHRvIGluZGljYXRlIGRhdGEgd2FzIHJlY2VpdmVkLlxuICAgICAgICBib2R5ID0gZGF0YTtcbiAgICAgICAgZmluaXNoZWQgPSB0cnVlO1xuICAgICAgfTtcblxuICAgICAgLy8gY2xlYW51cCgpIGlzIGEgdXRpbGl0eSBjbG9zdXJlIHRoYXQgcmVtb3ZlcyB0aGUgPHNjcmlwdD4gZnJvbSB0aGUgcGFnZSBhbmRcbiAgICAgIC8vIHRoZSByZXNwb25zZSBjYWxsYmFjayBmcm9tIHRoZSB3aW5kb3cuIFRoaXMgbG9naWMgaXMgdXNlZCBpbiBib3RoIHRoZVxuICAgICAgLy8gc3VjY2VzcywgZXJyb3IsIGFuZCBjYW5jZWxsYXRpb24gcGF0aHMsIHNvIGl0J3MgZXh0cmFjdGVkIG91dCBmb3IgY29udmVuaWVuY2UuXG4gICAgICBjb25zdCBjbGVhbnVwID0gKCkgPT4ge1xuICAgICAgICAvLyBSZW1vdmUgdGhlIDxzY3JpcHQ+IHRhZyBpZiBpdCdzIHN0aWxsIG9uIHRoZSBwYWdlLlxuICAgICAgICBpZiAobm9kZS5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgbm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSByZXNwb25zZSBjYWxsYmFjayBmcm9tIHRoZSBjYWxsYmFja01hcCAod2luZG93IG9iamVjdCBpbiB0aGVcbiAgICAgICAgLy8gYnJvd3NlcikuXG4gICAgICAgIGRlbGV0ZSB0aGlzLmNhbGxiYWNrTWFwW2NhbGxiYWNrXTtcbiAgICAgIH07XG5cbiAgICAgIC8vIG9uTG9hZCgpIGlzIHRoZSBzdWNjZXNzIGNhbGxiYWNrIHdoaWNoIHJ1bnMgYWZ0ZXIgdGhlIHJlc3BvbnNlIGNhbGxiYWNrXG4gICAgICAvLyBpZiB0aGUgSlNPTlAgc2NyaXB0IGxvYWRzIHN1Y2Nlc3NmdWxseS4gVGhlIGV2ZW50IGl0c2VsZiBpcyB1bmltcG9ydGFudC5cbiAgICAgIC8vIElmIHNvbWV0aGluZyB3ZW50IHdyb25nLCBvbkxvYWQoKSBtYXkgcnVuIHdpdGhvdXQgdGhlIHJlc3BvbnNlIGNhbGxiYWNrXG4gICAgICAvLyBoYXZpbmcgYmVlbiBpbnZva2VkLlxuICAgICAgY29uc3Qgb25Mb2FkID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgICAvLyBEbyBub3RoaW5nIGlmIHRoZSByZXF1ZXN0IGhhcyBiZWVuIGNhbmNlbGxlZC5cbiAgICAgICAgaWYgKGNhbmNlbGxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENsZWFudXAgdGhlIHBhZ2UuXG4gICAgICAgIGNsZWFudXAoKTtcblxuICAgICAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSByZXNwb25zZSBjYWxsYmFjayBoYXMgcnVuLlxuICAgICAgICBpZiAoIWZpbmlzaGVkKSB7XG4gICAgICAgICAgLy8gSXQgaGFzbid0LCBzb21ldGhpbmcgd2VudCB3cm9uZyB3aXRoIHRoZSByZXF1ZXN0LiBSZXR1cm4gYW4gZXJyb3IgdmlhXG4gICAgICAgICAgLy8gdGhlIE9ic2VydmFibGUgZXJyb3IgcGF0aC4gQWxsIEpTT05QIGVycm9ycyBoYXZlIHN0YXR1cyAwLlxuICAgICAgICAgIG9ic2VydmVyLmVycm9yKG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICAgICAgICB1cmwsXG4gICAgICAgICAgICBzdGF0dXM6IDAsXG4gICAgICAgICAgICBzdGF0dXNUZXh0OiAnSlNPTlAgRXJyb3InLFxuICAgICAgICAgICAgZXJyb3I6IG5ldyBFcnJvcihKU09OUF9FUlJfTk9fQ0FMTEJBQ0spLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdWNjZXNzLiBib2R5IGVpdGhlciBjb250YWlucyB0aGUgcmVzcG9uc2UgYm9keSBvciBudWxsIGlmIG5vbmUgd2FzXG4gICAgICAgIC8vIHJldHVybmVkLlxuICAgICAgICBvYnNlcnZlci5uZXh0KG5ldyBIdHRwUmVzcG9uc2Uoe1xuICAgICAgICAgIGJvZHksXG4gICAgICAgICAgc3RhdHVzOiAyMDAsXG4gICAgICAgICAgc3RhdHVzVGV4dDogJ09LJywgdXJsLFxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gQ29tcGxldGUgdGhlIHN0cmVhbSwgdGhlIHJlc3BvbnNlIGlzIG92ZXIuXG4gICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICB9O1xuXG4gICAgICAvLyBvbkVycm9yKCkgaXMgdGhlIGVycm9yIGNhbGxiYWNrLCB3aGljaCBydW5zIGlmIHRoZSBzY3JpcHQgcmV0dXJuZWQgZ2VuZXJhdGVzXG4gICAgICAvLyBhIEphdmFzY3JpcHQgZXJyb3IuIEl0IGVtaXRzIHRoZSBlcnJvciB2aWEgdGhlIE9ic2VydmFibGUgZXJyb3IgY2hhbm5lbCBhc1xuICAgICAgLy8gYSBIdHRwRXJyb3JSZXNwb25zZS5cbiAgICAgIGNvbnN0IG9uRXJyb3I6IGFueSA9IChlcnJvcjogRXJyb3IpID0+IHtcbiAgICAgICAgLy8gSWYgdGhlIHJlcXVlc3Qgd2FzIGFscmVhZHkgY2FuY2VsbGVkLCBubyBuZWVkIHRvIGVtaXQgYW55dGhpbmcuXG4gICAgICAgIGlmIChjYW5jZWxsZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY2xlYW51cCgpO1xuXG4gICAgICAgIC8vIFdyYXAgdGhlIGVycm9yIGluIGEgSHR0cEVycm9yUmVzcG9uc2UuXG4gICAgICAgIG9ic2VydmVyLmVycm9yKG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgc3RhdHVzOiAwLFxuICAgICAgICAgIHN0YXR1c1RleHQ6ICdKU09OUCBFcnJvcicsIHVybCxcbiAgICAgICAgfSkpO1xuICAgICAgfTtcblxuICAgICAgLy8gU3Vic2NyaWJlIHRvIGJvdGggdGhlIHN1Y2Nlc3MgKGxvYWQpIGFuZCBlcnJvciBldmVudHMgb24gdGhlIDxzY3JpcHQ+IHRhZyxcbiAgICAgIC8vIGFuZCBhZGQgaXQgdG8gdGhlIHBhZ2UuXG4gICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBvbkxvYWQpO1xuICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIG9uRXJyb3IpO1xuICAgICAgdGhpcy5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG5vZGUpO1xuXG4gICAgICAvLyBUaGUgcmVxdWVzdCBoYXMgbm93IGJlZW4gc3VjY2Vzc2Z1bGx5IHNlbnQuXG4gICAgICBvYnNlcnZlci5uZXh0KHt0eXBlOiBIdHRwRXZlbnRUeXBlLlNlbnR9KTtcblxuICAgICAgLy8gQ2FuY2VsbGF0aW9uIGhhbmRsZXIuXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAvLyBUcmFjayB0aGUgY2FuY2VsbGF0aW9uIHNvIGV2ZW50IGxpc3RlbmVycyB3b24ndCBkbyBhbnl0aGluZyBldmVuIGlmIGFscmVhZHkgc2NoZWR1bGVkLlxuICAgICAgICBjYW5jZWxsZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgZXZlbnQgbGlzdGVuZXJzIHNvIHRoZXkgd29uJ3QgcnVuIGlmIHRoZSBldmVudHMgbGF0ZXIgZmlyZS5cbiAgICAgICAgbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkJywgb25Mb2FkKTtcbiAgICAgICAgbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIG9uRXJyb3IpO1xuXG4gICAgICAgIC8vIEFuZCBmaW5hbGx5LCBjbGVhbiB1cCB0aGUgcGFnZS5cbiAgICAgICAgY2xlYW51cCgpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEFuIGBIdHRwSW50ZXJjZXB0b3JgIHdoaWNoIGlkZW50aWZpZXMgcmVxdWVzdHMgd2l0aCB0aGUgbWV0aG9kIEpTT05QIGFuZFxuICogc2hpZnRzIHRoZW0gdG8gdGhlIGBKc29ucENsaWVudEJhY2tlbmRgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEpzb25wSW50ZXJjZXB0b3Ige1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGpzb25wOiBKc29ucENsaWVudEJhY2tlbmQpIHt9XG5cbiAgaW50ZXJjZXB0KHJlcTogSHR0cFJlcXVlc3Q8YW55PiwgbmV4dDogSHR0cEhhbmRsZXIpOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgaWYgKHJlcS5tZXRob2QgPT09ICdKU09OUCcpIHtcbiAgICAgIHJldHVybiB0aGlzLmpzb25wLmhhbmRsZShyZXEgYXMgSHR0cFJlcXVlc3Q8bmV2ZXI+KTtcbiAgICB9XG4gICAgLy8gRmFsbCB0aHJvdWdoIGZvciBub3JtYWwgSFRUUCByZXF1ZXN0cy5cbiAgICByZXR1cm4gbmV4dC5oYW5kbGUocmVxKTtcbiAgfVxufVxuIl19