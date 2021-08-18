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
import { Injectable } from '../di';
import { scheduleMicroTask } from '../util';
import { NgZone } from '../zone/ng_zone';
/**
 * @record
 */
export function PendingMacrotask() { }
if (false) {
    /** @type {?} */
    PendingMacrotask.prototype.source;
    /** @type {?} */
    PendingMacrotask.prototype.creationLocation;
    /** @type {?|undefined} */
    PendingMacrotask.prototype.runCount;
    /** @type {?} */
    PendingMacrotask.prototype.data;
}
/**
 * @record
 */
export function TaskData() { }
if (false) {
    /** @type {?|undefined} */
    TaskData.prototype.target;
    /** @type {?|undefined} */
    TaskData.prototype.delay;
    /** @type {?|undefined} */
    TaskData.prototype.isPeriodic;
}
/**
 * @record
 */
function WaitCallback() { }
if (false) {
    /** @type {?} */
    WaitCallback.prototype.timeoutId;
    /** @type {?} */
    WaitCallback.prototype.doneCb;
    /** @type {?|undefined} */
    WaitCallback.prototype.updateCb;
}
/**
 * The Testability service provides testing hooks that can be accessed from
 * the browser and by services such as Protractor. Each bootstrapped Angular
 * application on the page will have an instance of Testability.
 * \@publicApi
 */
export class Testability {
    /**
     * @param {?} _ngZone
     */
    constructor(_ngZone) {
        this._ngZone = _ngZone;
        this._pendingCount = 0;
        this._isZoneStable = true;
        /**
         * Whether any work was done since the last 'whenStable' callback. This is
         * useful to detect if this could have potentially destabilized another
         * component while it is stabilizing.
         * \@internal
         */
        this._didWork = false;
        this._callbacks = [];
        this.taskTrackingZone = null;
        this._watchAngularEvents();
        _ngZone.run(() => {
            this.taskTrackingZone =
                typeof Zone == 'undefined' ? null : Zone.current.get('TaskTrackingZone');
        });
    }
    /**
     * @return {?}
     */
    _watchAngularEvents() {
        this._ngZone.onUnstable.subscribe({
            next: () => {
                this._didWork = true;
                this._isZoneStable = false;
            }
        });
        this._ngZone.runOutsideAngular(() => {
            this._ngZone.onStable.subscribe({
                next: () => {
                    NgZone.assertNotInAngularZone();
                    scheduleMicroTask(() => {
                        this._isZoneStable = true;
                        this._runCallbacksIfReady();
                    });
                }
            });
        });
    }
    /**
     * Increases the number of pending request
     * @deprecated pending requests are now tracked with zones.
     * @return {?}
     */
    increasePendingRequestCount() {
        this._pendingCount += 1;
        this._didWork = true;
        return this._pendingCount;
    }
    /**
     * Decreases the number of pending request
     * @deprecated pending requests are now tracked with zones
     * @return {?}
     */
    decreasePendingRequestCount() {
        this._pendingCount -= 1;
        if (this._pendingCount < 0) {
            throw new Error('pending async requests below zero');
        }
        this._runCallbacksIfReady();
        return this._pendingCount;
    }
    /**
     * Whether an associated application is stable
     * @return {?}
     */
    isStable() {
        return this._isZoneStable && this._pendingCount === 0 && !this._ngZone.hasPendingMacrotasks;
    }
    /**
     * @return {?}
     */
    _runCallbacksIfReady() {
        if (this.isStable()) {
            // Schedules the call backs in a new frame so that it is always async.
            scheduleMicroTask(() => {
                while (this._callbacks.length !== 0) {
                    /** @type {?} */
                    let cb = (/** @type {?} */ (this._callbacks.pop()));
                    clearTimeout(cb.timeoutId);
                    cb.doneCb(this._didWork);
                }
                this._didWork = false;
            });
        }
        else {
            // Still not stable, send updates.
            /** @type {?} */
            let pending = this.getPendingTasks();
            this._callbacks = this._callbacks.filter((cb) => {
                if (cb.updateCb && cb.updateCb(pending)) {
                    clearTimeout(cb.timeoutId);
                    return false;
                }
                return true;
            });
            this._didWork = true;
        }
    }
    /**
     * @return {?}
     */
    getPendingTasks() {
        if (!this.taskTrackingZone) {
            return [];
        }
        // Copy the tasks data so that we don't leak tasks.
        return this.taskTrackingZone.macroTasks.map((t) => {
            return {
                source: t.source,
                // From TaskTrackingZone:
                // https://github.com/angular/zone.js/blob/master/lib/zone-spec/task-tracking.ts#L40
                creationLocation: (/** @type {?} */ (((/** @type {?} */ (t))).creationLocation)),
                data: t.data
            };
        });
    }
    /**
     * @param {?} cb
     * @param {?=} timeout
     * @param {?=} updateCb
     * @return {?}
     */
    addCallback(cb, timeout, updateCb) {
        /** @type {?} */
        let timeoutId = -1;
        if (timeout && timeout > 0) {
            timeoutId = setTimeout(() => {
                this._callbacks = this._callbacks.filter((cb) => cb.timeoutId !== timeoutId);
                cb(this._didWork, this.getPendingTasks());
            }, timeout);
        }
        this._callbacks.push((/** @type {?} */ ({ doneCb: cb, timeoutId: timeoutId, updateCb: updateCb })));
    }
    /**
     * Wait for the application to be stable with a timeout. If the timeout is reached before that
     * happens, the callback receives a list of the macro tasks that were pending, otherwise null.
     *
     * @param {?} doneCb The callback to invoke when Angular is stable or the timeout expires
     *    whichever comes first.
     * @param {?=} timeout Optional. The maximum time to wait for Angular to become stable. If not
     *    specified, whenStable() will wait forever.
     * @param {?=} updateCb Optional. If specified, this callback will be invoked whenever the set of
     *    pending macrotasks changes. If this callback returns true doneCb will not be invoked
     *    and no further updates will be issued.
     * @return {?}
     */
    whenStable(doneCb, timeout, updateCb) {
        if (updateCb && !this.taskTrackingZone) {
            throw new Error('Task tracking zone is required when passing an update callback to ' +
                'whenStable(). Is "zone.js/dist/task-tracking.js" loaded?');
        }
        // These arguments are 'Function' above to keep the public API simple.
        this.addCallback((/** @type {?} */ (doneCb)), timeout, (/** @type {?} */ (updateCb)));
        this._runCallbacksIfReady();
    }
    /**
     * Get the number of pending requests
     * @deprecated pending requests are now tracked with zones
     * @return {?}
     */
    getPendingRequestCount() { return this._pendingCount; }
    /**
     * Find providers by name
     * @param {?} using The root element to search from
     * @param {?} provider The name of binding variable
     * @param {?} exactMatch Whether using exactMatch
     * @return {?}
     */
    findProviders(using, provider, exactMatch) {
        // TODO(juliemr): implement.
        return [];
    }
}
Testability.decorators = [
    { type: Injectable }
];
/** @nocollapse */
Testability.ctorParameters = () => [
    { type: NgZone }
];
if (false) {
    /** @type {?} */
    Testability.prototype._pendingCount;
    /** @type {?} */
    Testability.prototype._isZoneStable;
    /**
     * Whether any work was done since the last 'whenStable' callback. This is
     * useful to detect if this could have potentially destabilized another
     * component while it is stabilizing.
     * \@internal
     * @type {?}
     */
    Testability.prototype._didWork;
    /** @type {?} */
    Testability.prototype._callbacks;
    /** @type {?} */
    Testability.prototype.taskTrackingZone;
    /** @type {?} */
    Testability.prototype._ngZone;
}
/**
 * A global registry of {\@link Testability} instances for specific elements.
 * \@publicApi
 */
export class TestabilityRegistry {
    constructor() {
        /**
         * \@internal
         */
        this._applications = new Map();
        _testabilityGetter.addToWindow(this);
    }
    /**
     * Registers an application with a testability hook so that it can be tracked
     * @param {?} token token of application, root element
     * @param {?} testability Testability hook
     * @return {?}
     */
    registerApplication(token, testability) {
        this._applications.set(token, testability);
    }
    /**
     * Unregisters an application.
     * @param {?} token token of application, root element
     * @return {?}
     */
    unregisterApplication(token) { this._applications.delete(token); }
    /**
     * Unregisters all applications
     * @return {?}
     */
    unregisterAllApplications() { this._applications.clear(); }
    /**
     * Get a testability hook associated with the application
     * @param {?} elem root element
     * @return {?}
     */
    getTestability(elem) { return this._applications.get(elem) || null; }
    /**
     * Get all registered testabilities
     * @return {?}
     */
    getAllTestabilities() { return Array.from(this._applications.values()); }
    /**
     * Get all registered applications(root elements)
     * @return {?}
     */
    getAllRootElements() { return Array.from(this._applications.keys()); }
    /**
     * Find testability of a node in the Tree
     * @param {?} elem node
     * @param {?=} findInAncestors whether finding testability in ancestors if testability was not found in
     * current node
     * @return {?}
     */
    findTestabilityInTree(elem, findInAncestors = true) {
        return _testabilityGetter.findTestabilityInTree(this, elem, findInAncestors);
    }
}
TestabilityRegistry.decorators = [
    { type: Injectable }
];
/** @nocollapse */
TestabilityRegistry.ctorParameters = () => [];
if (false) {
    /**
     * \@internal
     * @type {?}
     */
    TestabilityRegistry.prototype._applications;
}
/**
 * Adapter interface for retrieving the `Testability` service associated for a
 * particular context.
 *
 * \@publicApi
 * @record
 */
export function GetTestability() { }
if (false) {
    /**
     * @param {?} registry
     * @return {?}
     */
    GetTestability.prototype.addToWindow = function (registry) { };
    /**
     * @param {?} registry
     * @param {?} elem
     * @param {?} findInAncestors
     * @return {?}
     */
    GetTestability.prototype.findTestabilityInTree = function (registry, elem, findInAncestors) { };
}
class _NoopGetTestability {
    /**
     * @param {?} registry
     * @return {?}
     */
    addToWindow(registry) { }
    /**
     * @param {?} registry
     * @param {?} elem
     * @param {?} findInAncestors
     * @return {?}
     */
    findTestabilityInTree(registry, elem, findInAncestors) {
        return null;
    }
}
/**
 * Set the {\@link GetTestability} implementation used by the Angular testing framework.
 * \@publicApi
 * @param {?} getter
 * @return {?}
 */
export function setTestabilityGetter(getter) {
    _testabilityGetter = getter;
}
/** @type {?} */
let _testabilityGetter = new _NoopGetTestability();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGFiaWxpdHkuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9jb3JlL3NyYy90ZXN0YWJpbGl0eS90ZXN0YWJpbGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxPQUFPLENBQUM7QUFDakMsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sU0FBUyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQzs7OztBQWV2QyxzQ0FLQzs7O0lBSkMsa0NBQWU7O0lBQ2YsNENBQXdCOztJQUN4QixvQ0FBa0I7O0lBQ2xCLGdDQUFlOzs7OztBQUdqQiw4QkFJQzs7O0lBSEMsMEJBQXdCOztJQUN4Qix5QkFBZTs7SUFDZiw4QkFBcUI7Ozs7O0FBT3ZCLDJCQU1DOzs7SUFIQyxpQ0FBZTs7SUFDZiw4QkFBcUI7O0lBQ3JCLGdDQUEwQjs7Ozs7Ozs7QUFVNUIsTUFBTSxPQUFPLFdBQVc7Ozs7SUFjdEIsWUFBb0IsT0FBZTtRQUFmLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFiM0Isa0JBQWEsR0FBVyxDQUFDLENBQUM7UUFDMUIsa0JBQWEsR0FBWSxJQUFJLENBQUM7Ozs7Ozs7UUFPOUIsYUFBUSxHQUFZLEtBQUssQ0FBQztRQUMxQixlQUFVLEdBQW1CLEVBQUUsQ0FBQztRQUVoQyxxQkFBZ0IsR0FBOEIsSUFBSSxDQUFDO1FBR3pELElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQ2YsSUFBSSxDQUFDLGdCQUFnQjtnQkFDakIsT0FBTyxJQUFJLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDL0UsQ0FBQyxDQUFDLENBQUM7SUFDTCxD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Q0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7Ozs7O0lBSzVGLG1CQUFtQixLQUFvQixPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7SUFLeEYsa0JBQWtCLEtBQVksT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7O0lBUTdFLHFCQUFxQixDQUFDLElBQVUsRUFBRSxrQkFBMkIsSUFBSTtRQUMvRCxPQUFPLGtCQUFrQixDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDL0UsQ0FBQzs7O1lBbkRGLFVBQVU7Ozs7Ozs7OztJQUdULDRDQUE0Qzs7Ozs7Ozs7O0FBeUQ5QyxvQ0FJQzs7Ozs7O0lBSEMsK0RBQWlEOzs7Ozs7O0lBQ2pELGdHQUNxQjs7QUFHdkIsTUFBTSxtQkFBbUI7Ozs7O0lBQ3ZCLFdBQVcsQ0FBQyxRQUE2QixJQUFTLENBQUM7Ozs7Ozs7SUFDbkQscUJBQXFCLENBQUMsUUFBNkIsRUFBRSxJQUFTLEVBQUUsZUFBd0I7UUFFdEYsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0NBQ0Y7Ozs7Ozs7QUFNRCxNQUFNLFVBQVUsb0JBQW9CLENBQUMsTUFBc0I7SUFDekQsa0JBQWtCLEdBQUcsTUFBTSxDQUFDO0FBQzlCLENBQUM7O0lBRUcsa0JBQWtCLEdBQW1CLElBQUksbUJBQW1CLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnLi4vZGknO1xuaW1wb3J0IHtzY2hlZHVsZU1pY3JvVGFza30gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQge05nWm9uZX0gZnJvbSAnLi4vem9uZS9uZ196b25lJztcblxuLyoqXG4gKiBUZXN0YWJpbGl0eSBBUEkuXG4gKiBgZGVjbGFyZWAga2V5d29yZCBjYXVzZXMgdHNpY2tsZSB0byBnZW5lcmF0ZSBleHRlcm5zLCBzbyB0aGVzZSBtZXRob2RzIGFyZVxuICogbm90IHJlbmFtZWQgYnkgQ2xvc3VyZSBDb21waWxlci5cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGRlY2xhcmUgaW50ZXJmYWNlIFB1YmxpY1Rlc3RhYmlsaXR5IHtcbiAgaXNTdGFibGUoKTogYm9vbGVhbjtcbiAgd2hlblN0YWJsZShjYWxsYmFjazogRnVuY3Rpb24sIHRpbWVvdXQ/OiBudW1iZXIsIHVwZGF0ZUNhbGxiYWNrPzogRnVuY3Rpb24pOiB2b2lkO1xuICBmaW5kUHJvdmlkZXJzKHVzaW5nOiBhbnksIHByb3ZpZGVyOiBzdHJpbmcsIGV4YWN0TWF0Y2g6IGJvb2xlYW4pOiBhbnlbXTtcbn1cblxuLy8gQW5ndWxhciBpbnRlcm5hbCwgbm90IGludGVuZGVkIGZvciBwdWJsaWMgQVBJLlxuZXhwb3J0IGludGVyZmFjZSBQZW5kaW5nTWFjcm90YXNrIHtcbiAgc291cmNlOiBzdHJpbmc7XG4gIGNyZWF0aW9uTG9jYXRpb246IEVycm9yO1xuICBydW5Db3VudD86IG51bWJlcjtcbiAgZGF0YTogVGFza0RhdGE7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFza0RhdGEge1xuICB0YXJnZXQ/OiBYTUxIdHRwUmVxdWVzdDtcbiAgZGVsYXk/OiBudW1iZXI7XG4gIGlzUGVyaW9kaWM/OiBib29sZWFuO1xufVxuXG4vLyBBbmd1bGFyIGludGVybmFsLCBub3QgaW50ZW5kZWQgZm9yIHB1YmxpYyBBUEkuXG5leHBvcnQgdHlwZSBEb25lQ2FsbGJhY2sgPSAoZGlkV29yazogYm9vbGVhbiwgdGFza3M/OiBQZW5kaW5nTWFjcm90YXNrW10pID0+IHZvaWQ7XG5leHBvcnQgdHlwZSBVcGRhdGVDYWxsYmFjayA9ICh0YXNrczogUGVuZGluZ01hY3JvdGFza1tdKSA9PiBib29sZWFuO1xuXG5pbnRlcmZhY2UgV2FpdENhbGxiYWNrIHtcbiAgLy8gTmVlZHMgdG8gYmUgJ2FueScgLSBzZXRUaW1lb3V0IHJldHVybnMgYSBudW1iZXIgYWNjb3JkaW5nIHRvIEVTNiwgYnV0XG4gIC8vIG9uIE5vZGVKUyBpdCByZXR1cm5zIGEgVGltZXIuXG4gIHRpbWVvdXRJZDogYW55O1xuICBkb25lQ2I6IERvbmVDYWxsYmFjaztcbiAgdXBkYXRlQ2I/OiBVcGRhdGVDYWxsYmFjaztcbn1cblxuLyoqXG4gKiBUaGUgVGVzdGFiaWxpdHkgc2VydmljZSBwcm92aWRlcyB0ZXN0aW5nIGhvb2tzIHRoYXQgY2FuIGJlIGFjY2Vzc2VkIGZyb21cbiAqIHRoZSBicm93c2VyIGFuZCBieSBzZXJ2aWNlcyBzdWNoIGFzIFByb3RyYWN0b3IuIEVhY2ggYm9vdHN0cmFwcGVkIEFuZ3VsYXJcbiAqIGFwcGxpY2F0aW9uIG9uIHRoZSBwYWdlIHdpbGwgaGF2ZSBhbiBpbnN0YW5jZSBvZiBUZXN0YWJpbGl0eS5cbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRlc3RhYmlsaXR5IGltcGxlbWVudHMgUHVibGljVGVzdGFiaWxpdHkge1xuICBwcml2YXRlIF9wZW5kaW5nQ291bnQ6IG51bWJlciA9IDA7XG4gIHByaXZhdGUgX2lzWm9uZVN0YWJsZTogYm9vbGVhbiA9IHRydWU7XG4gIC8qKlxuICAgKiBXaGV0aGVyIGFueSB3b3JrIHdhcyBkb25lIHNpbmNlIHRoZSBsYXN0ICd3aGVuU3RhYmxlJyBjYWxsYmFjay4gVGhpcyBpc1xuICAgKiB1c2VmdWwgdG8gZGV0ZWN0IGlmIHRoaXMgY291bGQgaGF2ZSBwb3RlbnRpYWxseSBkZXN0YWJpbGl6ZWQgYW5vdGhlclxuICAgKiBjb21wb25lbnQgd2hpbGUgaXQgaXMgc3RhYmlsaXppbmcuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgcHJpdmF0ZSBfZGlkV29yazogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF9jYWxsYmFja3M6IFdhaXRDYWxsYmFja1tdID0gW107XG5cbiAgcHJpdmF0ZSB0YXNrVHJhY2tpbmdab25lOiB7bWFjcm9UYXNrczogVGFza1tdfXxudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSkge1xuICAgIHRoaXMuX3dhdGNoQW5ndWxhckV2ZW50cygpO1xuICAgIF9uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgIHRoaXMudGFza1RyYWNraW5nWm9uZSA9XG4gICAgICAgICAgdHlwZW9mIFpvbmUgPT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogWm9uZS5jdXJyZW50LmdldCgnVGFza1RyYWNraW5nWm9uZScpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfd2F0Y2hBbmd1bGFyRXZlbnRzKCk6IHZvaWQge1xuICAgIHRoaXMuX25nWm9uZS5vblVuc3RhYmxlLnN1YnNjcmliZSh7XG4gICAgICBuZXh0OiAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2RpZFdvcmsgPSB0cnVlO1xuICAgICAgICB0aGlzLl9pc1pvbmVTdGFibGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICB0aGlzLl9uZ1pvbmUub25TdGFibGUuc3Vic2NyaWJlKHtcbiAgICAgICAgbmV4dDogKCkgPT4ge1xuICAgICAgICAgIE5nWm9uZS5hc3NlcnROb3RJbkFuZ3VsYXJab25lKCk7XG4gICAgICAgICAgc2NoZWR1bGVNaWNyb1Rhc2soKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5faXNab25lU3RhYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX3J1bkNhbGxiYWNrc0lmUmVhZHkoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW5jcmVhc2VzIHRoZSBudW1iZXIgb2YgcGVuZGluZyByZXF1ZXN0XG4gICAqIEBkZXByZWNhdGVkIHBlbmRpbmcgcmVxdWVzdHMgYXJlIG5vdyB0cmFja2VkIHdpdGggem9uZXMuXG4gICAqL1xuICBpbmNyZWFzZVBlbmRpbmdSZXF1ZXN0Q291bnQoKTogbnVtYmVyIHtcbiAgICB0aGlzLl9wZW5kaW5nQ291bnQgKz0gMTtcbiAgICB0aGlzLl9kaWRXb3JrID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5fcGVuZGluZ0NvdW50O1xuICB9XG5cbiAgLyoqXG4gICAqIERlY3JlYXNlcyB0aGUgbnVtYmVyIG9mIHBlbmRpbmcgcmVxdWVzdFxuICAgKiBAZGVwcmVjYXRlZCBwZW5kaW5nIHJlcXVlc3RzIGFyZSBub3cgdHJhY2tlZCB3aXRoIHpvbmVzXG4gICAqL1xuICBkZWNyZWFzZVBlbmRpbmdSZXF1ZXN0Q291bnQoKTogbnVtYmVyIHtcbiAgICB0aGlzLl9wZW5kaW5nQ291bnQgLT0gMTtcbiAgICBpZiAodGhpcy5fcGVuZGluZ0NvdW50IDwgMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdwZW5kaW5nIGFzeW5jIHJlcXVlc3RzIGJlbG93IHplcm8nKTtcbiAgICB9XG4gICAgdGhpcy5fcnVuQ2FsbGJhY2tzSWZSZWFkeSgpO1xuICAgIHJldHVybiB0aGlzLl9wZW5kaW5nQ291bnQ7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciBhbiBhc3NvY2lhdGVkIGFwcGxpY2F0aW9uIGlzIHN0YWJsZVxuICAgKi9cbiAgaXNTdGFibGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2lzWm9uZVN0YWJsZSAmJiB0aGlzLl9wZW5kaW5nQ291bnQgPT09IDAgJiYgIXRoaXMuX25nWm9uZS5oYXNQZW5kaW5nTWFjcm90YXNrcztcbiAgfVxuXG4gIHByaXZhdGUgX3J1bkNhbGxiYWNrc0lmUmVhZHkoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaXNTdGFibGUoKSkge1xuICAgICAgLy8gU2NoZWR1bGVzIHRoZSBjYWxsIGJhY2tzIGluIGEgbmV3IGZyYW1lIHNvIHRoYXQgaXQgaXMgYWx3YXlzIGFzeW5jLlxuICAgICAgc2NoZWR1bGVNaWNyb1Rhc2soKCkgPT4ge1xuICAgICAgICB3aGlsZSAodGhpcy5fY2FsbGJhY2tzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgIGxldCBjYiA9IHRoaXMuX2NhbGxiYWNrcy5wb3AoKSAhO1xuICAgICAgICAgIGNsZWFyVGltZW91dChjYi50aW1lb3V0SWQpO1xuICAgICAgICAgIGNiLmRvbmVDYih0aGlzLl9kaWRXb3JrKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9kaWRXb3JrID0gZmFsc2U7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU3RpbGwgbm90IHN0YWJsZSwgc2VuZCB1cGRhdGVzLlxuICAgICAgbGV0IHBlbmRpbmcgPSB0aGlzLmdldFBlbmRpbmdUYXNrcygpO1xuICAgICAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzLmZpbHRlcigoY2IpID0+IHtcbiAgICAgICAgaWYgKGNiLnVwZGF0ZUNiICYmIGNiLnVwZGF0ZUNiKHBlbmRpbmcpKSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KGNiLnRpbWVvdXRJZCk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5fZGlkV29yayA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRQZW5kaW5nVGFza3MoKTogUGVuZGluZ01hY3JvdGFza1tdIHtcbiAgICBpZiAoIXRoaXMudGFza1RyYWNraW5nWm9uZSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIC8vIENvcHkgdGhlIHRhc2tzIGRhdGEgc28gdGhhdCB3ZSBkb24ndCBsZWFrIHRhc2tzLlxuICAgIHJldHVybiB0aGlzLnRhc2tUcmFja2luZ1pvbmUubWFjcm9UYXNrcy5tYXAoKHQ6IFRhc2spID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNvdXJjZTogdC5zb3VyY2UsXG4gICAgICAgIC8vIEZyb20gVGFza1RyYWNraW5nWm9uZTpcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvem9uZS5qcy9ibG9iL21hc3Rlci9saWIvem9uZS1zcGVjL3Rhc2stdHJhY2tpbmcudHMjTDQwXG4gICAgICAgIGNyZWF0aW9uTG9jYXRpb246ICh0IGFzIGFueSkuY3JlYXRpb25Mb2NhdGlvbiBhcyBFcnJvcixcbiAgICAgICAgZGF0YTogdC5kYXRhXG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRDYWxsYmFjayhjYjogRG9uZUNhbGxiYWNrLCB0aW1lb3V0PzogbnVtYmVyLCB1cGRhdGVDYj86IFVwZGF0ZUNhbGxiYWNrKSB7XG4gICAgbGV0IHRpbWVvdXRJZDogYW55ID0gLTE7XG4gICAgaWYgKHRpbWVvdXQgJiYgdGltZW91dCA+IDApIHtcbiAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MuZmlsdGVyKChjYikgPT4gY2IudGltZW91dElkICE9PSB0aW1lb3V0SWQpO1xuICAgICAgICBjYih0aGlzLl9kaWRXb3JrLCB0aGlzLmdldFBlbmRpbmdUYXNrcygpKTtcbiAgICAgIH0sIHRpbWVvdXQpO1xuICAgIH1cbiAgICB0aGlzLl9jYWxsYmFja3MucHVzaCg8V2FpdENhbGxiYWNrPntkb25lQ2I6IGNiLCB0aW1lb3V0SWQ6IHRpbWVvdXRJZCwgdXBkYXRlQ2I6IHVwZGF0ZUNifSk7XG4gIH1cblxuICAvKipcbiAgICogV2FpdCBmb3IgdGhlIGFwcGxpY2F0aW9uIHRvIGJlIHN0YWJsZSB3aXRoIGEgdGltZW91dC4gSWYgdGhlIHRpbWVvdXQgaXMgcmVhY2hlZCBiZWZvcmUgdGhhdFxuICAgKiBoYXBwZW5zLCB0aGUgY2FsbGJhY2sgcmVjZWl2ZXMgYSBsaXN0IG9mIHRoZSBtYWNybyB0YXNrcyB0aGF0IHdlcmUgcGVuZGluZywgb3RoZXJ3aXNlIG51bGwuXG4gICAqXG4gICAqIEBwYXJhbSBkb25lQ2IgVGhlIGNhbGxiYWNrIHRvIGludm9rZSB3aGVuIEFuZ3VsYXIgaXMgc3RhYmxlIG9yIHRoZSB0aW1lb3V0IGV4cGlyZXNcbiAgICogICAgd2hpY2hldmVyIGNvbWVzIGZpcnN0LlxuICAgKiBAcGFyYW0gdGltZW91dCBPcHRpb25hbC4gVGhlIG1heGltdW0gdGltZSB0byB3YWl0IGZvciBBbmd1bGFyIHRvIGJlY29tZSBzdGFibGUuIElmIG5vdFxuICAgKiAgICBzcGVjaWZpZWQsIHdoZW5TdGFibGUoKSB3aWxsIHdhaXQgZm9yZXZlci5cbiAgICogQHBhcmFtIHVwZGF0ZUNiIE9wdGlvbmFsLiBJZiBzcGVjaWZpZWQsIHRoaXMgY2FsbGJhY2sgd2lsbCBiZSBpbnZva2VkIHdoZW5ldmVyIHRoZSBzZXQgb2ZcbiAgICogICAgcGVuZGluZyBtYWNyb3Rhc2tzIGNoYW5nZXMuIElmIHRoaXMgY2FsbGJhY2sgcmV0dXJucyB0cnVlIGRvbmVDYiB3aWxsIG5vdCBiZSBpbnZva2VkXG4gICAqICAgIGFuZCBubyBmdXJ0aGVyIHVwZGF0ZXMgd2lsbCBiZSBpc3N1ZWQuXG4gICAqL1xuICB3aGVuU3RhYmxlKGRvbmVDYjogRnVuY3Rpb24sIHRpbWVvdXQ/OiBudW1iZXIsIHVwZGF0ZUNiPzogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICBpZiAodXBkYXRlQ2IgJiYgIXRoaXMudGFza1RyYWNraW5nWm9uZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdUYXNrIHRyYWNraW5nIHpvbmUgaXMgcmVxdWlyZWQgd2hlbiBwYXNzaW5nIGFuIHVwZGF0ZSBjYWxsYmFjayB0byAnICtcbiAgICAgICAgICAnd2hlblN0YWJsZSgpLiBJcyBcInpvbmUuanMvZGlzdC90YXNrLXRyYWNraW5nLmpzXCIgbG9hZGVkPycpO1xuICAgIH1cbiAgICAvLyBUaGVzZSBhcmd1bWVudHMgYXJlICdGdW5jdGlvbicgYWJvdmUgdG8ga2VlcCB0aGUgcHVibGljIEFQSSBzaW1wbGUuXG4gICAgdGhpcy5hZGRDYWxsYmFjayhkb25lQ2IgYXMgRG9uZUNhbGxiYWNrLCB0aW1lb3V0LCB1cGRhdGVDYiBhcyBVcGRhdGVDYWxsYmFjayk7XG4gICAgdGhpcy5fcnVuQ2FsbGJhY2tzSWZSZWFkeSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbnVtYmVyIG9mIHBlbmRpbmcgcmVxdWVzdHNcbiAgICogQGRlcHJlY2F0ZWQgcGVuZGluZyByZXF1ZXN0cyBhcmUgbm93IHRyYWNrZWQgd2l0aCB6b25lc1xuICAgKi9cbiAgZ2V0UGVuZGluZ1JlcXVlc3RDb3VudCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fcGVuZGluZ0NvdW50OyB9XG5cbiAgLyoqXG4gICAqIEZpbmQgcHJvdmlkZXJzIGJ5IG5hbWVcbiAgICogQHBhcmFtIHVzaW5nIFRoZSByb290IGVsZW1lbnQgdG8gc2VhcmNoIGZyb21cbiAgICogQHBhcmFtIHByb3ZpZGVyIFRoZSBuYW1lIG9mIGJpbmRpbmcgdmFyaWFibGVcbiAgICogQHBhcmFtIGV4YWN0TWF0Y2ggV2hldGhlciB1c2luZyBleGFjdE1hdGNoXG4gICAqL1xuICBmaW5kUHJvdmlkZXJzKHVzaW5nOiBhbnksIHByb3ZpZGVyOiBzdHJpbmcsIGV4YWN0TWF0Y2g6IGJvb2xlYW4pOiBhbnlbXSB7XG4gICAgLy8gVE9ETyhqdWxpZW1yKTogaW1wbGVtZW50LlxuICAgIHJldHVybiBbXTtcbiAgfVxufVxuXG4vKipcbiAqIEEgZ2xvYmFsIHJlZ2lzdHJ5IG9mIHtAbGluayBUZXN0YWJpbGl0eX0gaW5zdGFuY2VzIGZvciBzcGVjaWZpYyBlbGVtZW50cy5cbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRlc3RhYmlsaXR5UmVnaXN0cnkge1xuICAvKiogQGludGVybmFsICovXG4gIF9hcHBsaWNhdGlvbnMgPSBuZXcgTWFwPGFueSwgVGVzdGFiaWxpdHk+KCk7XG5cbiAgY29uc3RydWN0b3IoKSB7IF90ZXN0YWJpbGl0eUdldHRlci5hZGRUb1dpbmRvdyh0aGlzKTsgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYW4gYXBwbGljYXRpb24gd2l0aCBhIHRlc3RhYmlsaXR5IGhvb2sgc28gdGhhdCBpdCBjYW4gYmUgdHJhY2tlZFxuICAgKiBAcGFyYW0gdG9rZW4gdG9rZW4gb2YgYXBwbGljYXRpb24sIHJvb3QgZWxlbWVudFxuICAgKiBAcGFyYW0gdGVzdGFiaWxpdHkgVGVzdGFiaWxpdHkgaG9va1xuICAgKi9cbiAgcmVnaXN0ZXJBcHBsaWNhdGlvbih0b2tlbjogYW55LCB0ZXN0YWJpbGl0eTogVGVzdGFiaWxpdHkpIHtcbiAgICB0aGlzLl9hcHBsaWNhdGlvbnMuc2V0KHRva2VuLCB0ZXN0YWJpbGl0eSk7XG4gIH1cblxuICAvKipcbiAgICogVW5yZWdpc3RlcnMgYW4gYXBwbGljYXRpb24uXG4gICAqIEBwYXJhbSB0b2tlbiB0b2tlbiBvZiBhcHBsaWNhdGlvbiwgcm9vdCBlbGVtZW50XG4gICAqL1xuICB1bnJlZ2lzdGVyQXBwbGljYXRpb24odG9rZW46IGFueSkgeyB0aGlzLl9hcHBsaWNhdGlvbnMuZGVsZXRlKHRva2VuKTsgfVxuXG4gIC8qKlxuICAgKiBVbnJlZ2lzdGVycyBhbGwgYXBwbGljYXRpb25zXG4gICAqL1xuICB1bnJlZ2lzdGVyQWxsQXBwbGljYXRpb25zKCkgeyB0aGlzLl9hcHBsaWNhdGlvbnMuY2xlYXIoKTsgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSB0ZXN0YWJpbGl0eSBob29rIGFzc29jaWF0ZWQgd2l0aCB0aGUgYXBwbGljYXRpb25cbiAgICogQHBhcmFtIGVsZW0gcm9vdCBlbGVtZW50XG4gICAqL1xuICBnZXRUZXN0YWJpbGl0eShlbGVtOiBhbnkpOiBUZXN0YWJpbGl0eXxudWxsIHsgcmV0dXJuIHRoaXMuX2FwcGxpY2F0aW9ucy5nZXQoZWxlbSkgfHwgbnVsbDsgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIHJlZ2lzdGVyZWQgdGVzdGFiaWxpdGllc1xuICAgKi9cbiAgZ2V0QWxsVGVzdGFiaWxpdGllcygpOiBUZXN0YWJpbGl0eVtdIHsgcmV0dXJuIEFycmF5LmZyb20odGhpcy5fYXBwbGljYXRpb25zLnZhbHVlcygpKTsgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIHJlZ2lzdGVyZWQgYXBwbGljYXRpb25zKHJvb3QgZWxlbWVudHMpXG4gICAqL1xuICBnZXRBbGxSb290RWxlbWVudHMoKTogYW55W10geyByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLl9hcHBsaWNhdGlvbnMua2V5cygpKTsgfVxuXG4gIC8qKlxuICAgKiBGaW5kIHRlc3RhYmlsaXR5IG9mIGEgbm9kZSBpbiB0aGUgVHJlZVxuICAgKiBAcGFyYW0gZWxlbSBub2RlXG4gICAqIEBwYXJhbSBmaW5kSW5BbmNlc3RvcnMgd2hldGhlciBmaW5kaW5nIHRlc3RhYmlsaXR5IGluIGFuY2VzdG9ycyBpZiB0ZXN0YWJpbGl0eSB3YXMgbm90IGZvdW5kIGluXG4gICAqIGN1cnJlbnQgbm9kZVxuICAgKi9cbiAgZmluZFRlc3RhYmlsaXR5SW5UcmVlKGVsZW06IE5vZGUsIGZpbmRJbkFuY2VzdG9yczogYm9vbGVhbiA9IHRydWUpOiBUZXN0YWJpbGl0eXxudWxsIHtcbiAgICByZXR1cm4gX3Rlc3RhYmlsaXR5R2V0dGVyLmZpbmRUZXN0YWJpbGl0eUluVHJlZSh0aGlzLCBlbGVtLCBmaW5kSW5BbmNlc3RvcnMpO1xuICB9XG59XG5cbi8qKlxuICogQWRhcHRlciBpbnRlcmZhY2UgZm9yIHJldHJpZXZpbmcgdGhlIGBUZXN0YWJpbGl0eWAgc2VydmljZSBhc3NvY2lhdGVkIGZvciBhXG4gKiBwYXJ0aWN1bGFyIGNvbnRleHQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEdldFRlc3RhYmlsaXR5IHtcbiAgYWRkVG9XaW5kb3cocmVnaXN0cnk6IFRlc3RhYmlsaXR5UmVnaXN0cnkpOiB2b2lkO1xuICBmaW5kVGVzdGFiaWxpdHlJblRyZWUocmVnaXN0cnk6IFRlc3RhYmlsaXR5UmVnaXN0cnksIGVsZW06IGFueSwgZmluZEluQW5jZXN0b3JzOiBib29sZWFuKTpcbiAgICAgIFRlc3RhYmlsaXR5fG51bGw7XG59XG5cbmNsYXNzIF9Ob29wR2V0VGVzdGFiaWxpdHkgaW1wbGVtZW50cyBHZXRUZXN0YWJpbGl0eSB7XG4gIGFkZFRvV2luZG93KHJlZ2lzdHJ5OiBUZXN0YWJpbGl0eVJlZ2lzdHJ5KTogdm9pZCB7fVxuICBmaW5kVGVzdGFiaWxpdHlJblRyZWUocmVnaXN0cnk6IFRlc3RhYmlsaXR5UmVnaXN0cnksIGVsZW06IGFueSwgZmluZEluQW5jZXN0b3JzOiBib29sZWFuKTpcbiAgICAgIFRlc3RhYmlsaXR5fG51bGwge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogU2V0IHRoZSB7QGxpbmsgR2V0VGVzdGFiaWxpdHl9IGltcGxlbWVudGF0aW9uIHVzZWQgYnkgdGhlIEFuZ3VsYXIgdGVzdGluZyBmcmFtZXdvcmsuXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRUZXN0YWJpbGl0eUdldHRlcihnZXR0ZXI6IEdldFRlc3RhYmlsaXR5KTogdm9pZCB7XG4gIF90ZXN0YWJpbGl0eUdldHRlciA9IGdldHRlcjtcbn1cblxubGV0IF90ZXN0YWJpbGl0eUdldHRlcjogR2V0VGVzdGFiaWxpdHkgPSBuZXcgX05vb3BHZXRUZXN0YWJpbGl0eSgpO1xuIl19