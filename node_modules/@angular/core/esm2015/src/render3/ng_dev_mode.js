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
 * @return {?}
 */
export function ngDevModeResetPerfCounters() {
    /** @type {?} */
    const newCounters = {
        firstTemplatePass: 0,
        tNode: 0,
        tView: 0,
        rendererCreateTextNode: 0,
        rendererSetText: 0,
        rendererCreateElement: 0,
        rendererAddEventListener: 0,
        rendererSetAttribute: 0,
        rendererRemoveAttribute: 0,
        rendererSetProperty: 0,
        rendererSetClassName: 0,
        rendererAddClass: 0,
        rendererRemoveClass: 0,
        rendererSetStyle: 0,
        rendererRemoveStyle: 0,
        rendererDestroy: 0,
        rendererDestroyNode: 0,
        rendererMoveNode: 0,
        rendererRemoveNode: 0,
        rendererCreateComment: 0,
    };
    // NOTE: Under Ivy we may have both window & global defined in the Node
    //    environment since ensureDocument() in render3.ts sets global.window.
    if (typeof window != 'undefined') {
        // Make sure to refer to ngDevMode as ['ngDevMode'] for closure.
        ((/** @type {?} */ (window)))['ngDevMode'] = newCounters;
    }
    if (typeof global != 'undefined') {
        // Make sure to refer to ngDevMode as ['ngDevMode'] for closure.
        ((/** @type {?} */ (global)))['ngDevMode'] = newCounters;
    }
    if (typeof self != 'undefined') {
        // Make sure to refer to ngDevMode as ['ngDevMode'] for closure.
        ((/** @type {?} */ (self)))['ngDevMode'] = newCounters;
    }
    return newCounters;
}
/**
 * This checks to see if the `ngDevMode` has been set. If yes,
 * than we honor it, otherwise we default to dev mode with additional checks.
 *
 * The idea is that unless we are doing production build where we explicitly
 * set `ngDevMode == false` we should be helping the developer by providing
 * as much early warning and errors as possible.
 */
if (typeof ngDevMode === 'undefined' || ngDevMode) {
    ngDevModeResetPerfCounters();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZGV2X21vZGUuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL25nX2Rldl9tb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBb0NBLE1BQU0sVUFBVSwwQkFBMEI7O1VBQ2xDLFdBQVcsR0FBMEI7UUFDekMsaUJBQWlCLEVBQUUsQ0FBQztRQUNwQixLQUFLLEVBQUUsQ0FBQztRQUNSLEtBQUssRUFBRSxDQUFDO1FBQ1Isc0JBQXNCLEVBQUUsQ0FBQztRQUN6QixlQUFlLEVBQUUsQ0FBQztRQUNsQixxQkFBcUIsRUFBRSxDQUFDO1FBQ3hCLHdCQUF3QixFQUFFLENBQUM7UUFDM0Isb0JBQW9CLEVBQUUsQ0FBQztRQUN2Qix1QkFBdUIsRUFBRSxDQUFDO1FBQzFCLG1CQUFtQixFQUFFLENBQUM7UUFDdEIsb0JBQW9CLEVBQUUsQ0FBQztRQUN2QixnQkFBZ0IsRUFBRSxDQUFDO1FBQ25CLG1CQUFtQixFQUFFLENBQUM7UUFDdEIsZ0JBQWdCLEVBQUUsQ0FBQztRQUNuQixtQkFBbUIsRUFBRSxDQUFDO1FBQ3RCLGVBQWUsRUFBRSxDQUFDO1FBQ2xCLG1CQUFtQixFQUFFLENBQUM7UUFDdEIsZ0JBQWdCLEVBQUUsQ0FBQztRQUNuQixrQkFBa0IsRUFBRSxDQUFDO1FBQ3JCLHFCQUFxQixFQUFFLENBQUM7S0FDekI7SUFDRCx1RUFBdUU7SUFDdkUsMEVBQTBFO0lBQzFFLElBQUksT0FBTyxNQUFNLElBQUksV0FBVyxFQUFFO1FBQ2hDLGdFQUFnRTtRQUNoRSxDQUFDLG1CQUFBLE1BQU0sRUFBTyxDQUFDLENBQUMsV0FBVyxDQUFDLEdBQUcsV0FBVyxDQUFDO0tBQzVDO0lBQ0QsSUFBSSxPQUFPLE1BQU0sSUFBSSxXQUFXLEVBQUU7UUFDaEMsZ0VBQWdFO1FBQ2hFLENBQUMsbUJBQUEsTUFBTSxFQUFPLENBQUMsQ0FBQyxXQUFXLENBQUMsR0FBRyxXQUFXLENBQUM7S0FDNUM7SUFDRCxJQUFJLE9BQU8sSUFBSSxJQUFJLFdBQVcsRUFBRTtRQUM5QixnRUFBZ0U7UUFDaEUsQ0FBQyxtQkFBQSxJQUFJLEVBQU8sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxHQUFHLFdBQVcsQ0FBQztLQUMxQztJQUNELE9BQU8sV0FBVyxDQUFDO0FBQ3JCLENBQUM7Ozs7Ozs7OztBQVVELElBQUksT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsRUFBRTtJQUNqRCwwQkFBMEIsRUFBRSxDQUFDO0NBQzlCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIGNvbnN0IG5nRGV2TW9kZTogbnVsbHxOZ0Rldk1vZGVQZXJmQ291bnRlcnM7XG4gIGludGVyZmFjZSBOZ0Rldk1vZGVQZXJmQ291bnRlcnMge1xuICAgIGZpcnN0VGVtcGxhdGVQYXNzOiBudW1iZXI7XG4gICAgdE5vZGU6IG51bWJlcjtcbiAgICB0VmlldzogbnVtYmVyO1xuICAgIHJlbmRlcmVyQ3JlYXRlVGV4dE5vZGU6IG51bWJlcjtcbiAgICByZW5kZXJlclNldFRleHQ6IG51bWJlcjtcbiAgICByZW5kZXJlckNyZWF0ZUVsZW1lbnQ6IG51bWJlcjtcbiAgICByZW5kZXJlckFkZEV2ZW50TGlzdGVuZXI6IG51bWJlcjtcbiAgICByZW5kZXJlclNldEF0dHJpYnV0ZTogbnVtYmVyO1xuICAgIHJlbmRlcmVyUmVtb3ZlQXR0cmlidXRlOiBudW1iZXI7XG4gICAgcmVuZGVyZXJTZXRQcm9wZXJ0eTogbnVtYmVyO1xuICAgIHJlbmRlcmVyU2V0Q2xhc3NOYW1lOiBudW1iZXI7XG4gICAgcmVuZGVyZXJBZGRDbGFzczogbnVtYmVyO1xuICAgIHJlbmRlcmVyUmVtb3ZlQ2xhc3M6IG51bWJlcjtcbiAgICByZW5kZXJlclNldFN0eWxlOiBudW1iZXI7XG4gICAgcmVuZGVyZXJSZW1vdmVTdHlsZTogbnVtYmVyO1xuICAgIHJlbmRlcmVyRGVzdHJveTogbnVtYmVyO1xuICAgIHJlbmRlcmVyRGVzdHJveU5vZGU6IG51bWJlcjtcbiAgICByZW5kZXJlck1vdmVOb2RlOiBudW1iZXI7XG4gICAgcmVuZGVyZXJSZW1vdmVOb2RlOiBudW1iZXI7XG4gICAgcmVuZGVyZXJDcmVhdGVDb21tZW50OiBudW1iZXI7XG4gIH1cbn1cblxuZGVjbGFyZSBsZXQgZ2xvYmFsOiBhbnk7XG5cbmV4cG9ydCBmdW5jdGlvbiBuZ0Rldk1vZGVSZXNldFBlcmZDb3VudGVycygpOiBOZ0Rldk1vZGVQZXJmQ291bnRlcnMge1xuICBjb25zdCBuZXdDb3VudGVyczogTmdEZXZNb2RlUGVyZkNvdW50ZXJzID0ge1xuICAgIGZpcnN0VGVtcGxhdGVQYXNzOiAwLFxuICAgIHROb2RlOiAwLFxuICAgIHRWaWV3OiAwLFxuICAgIHJlbmRlcmVyQ3JlYXRlVGV4dE5vZGU6IDAsXG4gICAgcmVuZGVyZXJTZXRUZXh0OiAwLFxuICAgIHJlbmRlcmVyQ3JlYXRlRWxlbWVudDogMCxcbiAgICByZW5kZXJlckFkZEV2ZW50TGlzdGVuZXI6IDAsXG4gICAgcmVuZGVyZXJTZXRBdHRyaWJ1dGU6IDAsXG4gICAgcmVuZGVyZXJSZW1vdmVBdHRyaWJ1dGU6IDAsXG4gICAgcmVuZGVyZXJTZXRQcm9wZXJ0eTogMCxcbiAgICByZW5kZXJlclNldENsYXNzTmFtZTogMCxcbiAgICByZW5kZXJlckFkZENsYXNzOiAwLFxuICAgIHJlbmRlcmVyUmVtb3ZlQ2xhc3M6IDAsXG4gICAgcmVuZGVyZXJTZXRTdHlsZTogMCxcbiAgICByZW5kZXJlclJlbW92ZVN0eWxlOiAwLFxuICAgIHJlbmRlcmVyRGVzdHJveTogMCxcbiAgICByZW5kZXJlckRlc3Ryb3lOb2RlOiAwLFxuICAgIHJlbmRlcmVyTW92ZU5vZGU6IDAsXG4gICAgcmVuZGVyZXJSZW1vdmVOb2RlOiAwLFxuICAgIHJlbmRlcmVyQ3JlYXRlQ29tbWVudDogMCxcbiAgfTtcbiAgLy8gTk9URTogVW5kZXIgSXZ5IHdlIG1heSBoYXZlIGJvdGggd2luZG93ICYgZ2xvYmFsIGRlZmluZWQgaW4gdGhlIE5vZGVcbiAgLy8gICAgZW52aXJvbm1lbnQgc2luY2UgZW5zdXJlRG9jdW1lbnQoKSBpbiByZW5kZXIzLnRzIHNldHMgZ2xvYmFsLndpbmRvdy5cbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBNYWtlIHN1cmUgdG8gcmVmZXIgdG8gbmdEZXZNb2RlIGFzIFsnbmdEZXZNb2RlJ10gZm9yIGNsb3N1cmUuXG4gICAgKHdpbmRvdyBhcyBhbnkpWyduZ0Rldk1vZGUnXSA9IG5ld0NvdW50ZXJzO1xuICB9XG4gIGlmICh0eXBlb2YgZ2xvYmFsICE9ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gTWFrZSBzdXJlIHRvIHJlZmVyIHRvIG5nRGV2TW9kZSBhcyBbJ25nRGV2TW9kZSddIGZvciBjbG9zdXJlLlxuICAgIChnbG9iYWwgYXMgYW55KVsnbmdEZXZNb2RlJ10gPSBuZXdDb3VudGVycztcbiAgfVxuICBpZiAodHlwZW9mIHNlbGYgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBNYWtlIHN1cmUgdG8gcmVmZXIgdG8gbmdEZXZNb2RlIGFzIFsnbmdEZXZNb2RlJ10gZm9yIGNsb3N1cmUuXG4gICAgKHNlbGYgYXMgYW55KVsnbmdEZXZNb2RlJ10gPSBuZXdDb3VudGVycztcbiAgfVxuICByZXR1cm4gbmV3Q291bnRlcnM7XG59XG5cbi8qKlxuICogVGhpcyBjaGVja3MgdG8gc2VlIGlmIHRoZSBgbmdEZXZNb2RlYCBoYXMgYmVlbiBzZXQuIElmIHllcyxcbiAqIHRoYW4gd2UgaG9ub3IgaXQsIG90aGVyd2lzZSB3ZSBkZWZhdWx0IHRvIGRldiBtb2RlIHdpdGggYWRkaXRpb25hbCBjaGVja3MuXG4gKlxuICogVGhlIGlkZWEgaXMgdGhhdCB1bmxlc3Mgd2UgYXJlIGRvaW5nIHByb2R1Y3Rpb24gYnVpbGQgd2hlcmUgd2UgZXhwbGljaXRseVxuICogc2V0IGBuZ0Rldk1vZGUgPT0gZmFsc2VgIHdlIHNob3VsZCBiZSBoZWxwaW5nIHRoZSBkZXZlbG9wZXIgYnkgcHJvdmlkaW5nXG4gKiBhcyBtdWNoIGVhcmx5IHdhcm5pbmcgYW5kIGVycm9ycyBhcyBwb3NzaWJsZS5cbiAqL1xuaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICBuZ0Rldk1vZGVSZXNldFBlcmZDb3VudGVycygpO1xufVxuIl19