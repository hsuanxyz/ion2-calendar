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
import { isPlatformServer } from '@angular/common';
import { Inject, Injectable, NgZone, Optional, PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '../dom_tokens';
import { EventManagerPlugin } from './event_manager';
const ɵ0 = function (v) {
    return '__zone_symbol__' + v;
};
/**
 * Detect if Zone is present. If it is then use simple zone aware 'addEventListener'
 * since Angular can do much more
 * efficient bookkeeping than Zone can, because we have additional information. This speeds up
 * addEventListener by 3x.
 * @type {?}
 */
const __symbol__ = (typeof Zone !== 'undefined') && ((/** @type {?} */ (Zone)))['__symbol__'] || ɵ0;
/** @type {?} */
const ADD_EVENT_LISTENER = __symbol__('addEventListener');
/** @type {?} */
const REMOVE_EVENT_LISTENER = __symbol__('removeEventListener');
/** @type {?} */
const symbolNames = {};
/** @type {?} */
const FALSE = 'FALSE';
/** @type {?} */
const ANGULAR = 'ANGULAR';
/** @type {?} */
const NATIVE_ADD_LISTENER = 'addEventListener';
/** @type {?} */
const NATIVE_REMOVE_LISTENER = 'removeEventListener';
// use the same symbol string which is used in zone.js
/** @type {?} */
const stopSymbol = '__zone_symbol__propagationStopped';
/** @type {?} */
const stopMethodSymbol = '__zone_symbol__stopImmediatePropagation';
/** @type {?} */
const blackListedEvents = (typeof Zone !== 'undefined') && ((/** @type {?} */ (Zone)))[__symbol__('BLACK_LISTED_EVENTS')];
/** @type {?} */
let blackListedMap;
if (blackListedEvents) {
    blackListedMap = {};
    blackListedEvents.forEach(eventName => { blackListedMap[eventName] = eventName; });
}
/** @type {?} */
const isBlackListedEvent = function (eventName) {
    if (!blackListedMap) {
        return false;
    }
    return blackListedMap.hasOwnProperty(eventName);
};
const ɵ1 = isBlackListedEvent;
/**
 * @record
 */
function TaskData() { }
if (false) {
    /** @type {?} */
    TaskData.prototype.zone;
    /** @type {?} */
    TaskData.prototype.handler;
}
// a global listener to handle all dom event,
// so we do not need to create a closure every time
/** @type {?} */
const globalListener = function (event) {
    /** @type {?} */
    const symbolName = symbolNames[event.type];
    if (!symbolName) {
        return;
    }
    /** @type {?} */
    const taskDatas = this[symbolName];
    if (!taskDatas) {
        return;
    }
    /** @type {?} */
    const args = [event];
    if (taskDatas.length === 1) {
        // if taskDatas only have one element, just invoke it
        /** @type {?} */
        const taskData = taskDatas[0];
        if (taskData.zone !== Zone.current) {
            // only use Zone.run when Zone.current not equals to stored zone
            return taskData.zone.run(taskData.handler, this, args);
        }
        else {
            return taskData.handler.apply(this, args);
        }
    }
    else {
        // copy tasks as a snapshot to avoid event handlers remove
        // itself or others
        /** @type {?} */
        const copiedTasks = taskDatas.slice();
        for (let i = 0; i < copiedTasks.length; i++) {
            // if other listener call event.stopImmediatePropagation
            // just break
            if (((/** @type {?} */ (event)))[stopSymbol] === true) {
                break;
            }
            /** @type {?} */
            const taskData = copiedTasks[i];
            if (taskData.zone !== Zone.current) {
                // only use Zone.run when Zone.current not equals to stored zone
                taskData.zone.run(taskData.handler, this, args);
            }
            else {
                taskData.handler.apply(this, args);
            }
        }
    }
};
const ɵ2 = globalListener;
export class DomEventsPlugin extends EventManagerPlugin {
    /**
     * @param {?} doc
     * @param {?} ngZone
     * @param {?} platformId
     */
    constructor(doc, ngZone, platformId) {
        super(doc);
        this.ngZone = ngZone;
        if (!platformId || !isPlatformServer(platformId)) {
            this.patchEvent();
        }
    }
    /**
     * @return {?}
     */
    patchEvent() {
        if (typeof Event === 'undefined' || !Event || !Event.prototype) {
            return;
        }
        if (((/** @type {?} */ (Event.prototype)))[stopMethodSymbol]) {
            // already patched by zone.js
            return;
        }
        /** @type {?} */
        const delegate = ((/** @type {?} */ (Event.prototype)))[stopMethodSymbol] =
            Event.prototype.stopImmediatePropagation;
        Event.prototype.stopImmediatePropagation = function () {
            if (this) {
                this[stopSymbol] = true;
            }
            // should call native delegate in case
            // in some environment part of the application
            // will not use the patched Event
            delegate && delegate.apply(this, arguments);
        };
    }
    // This plugin should come last in the list of plugins, because it accepts all
    // events.
    /**
     * @param {?} eventName
     * @return {?}
     */
    supports(eventName) { return true; }
    /**
     * @param {?} element
     * @param {?} eventName
     * @param {?} handler
     * @return {?}
     */
    addEventListener(element, eventName, handler) {
        /**
         * This code is about to add a listener to the DOM. If Zone.js is present, than
         * `addEventListener` has been patched. The patched code adds overhead in both
         * memory and speed (3x slower) than native. For this reason if we detect that
         * Zone.js is present we use a simple version of zone aware addEventListener instead.
         * The result is faster registration and the zone will be restored.
         * But ZoneSpec.onScheduleTask, ZoneSpec.onInvokeTask, ZoneSpec.onCancelTask
         * will not be invoked
         * We also do manual zone restoration in element.ts renderEventHandlerClosure method.
         *
         * NOTE: it is possible that the element is from different iframe, and so we
         * have to check before we execute the method.
         * @type {?}
         */
        const self = this;
        /** @type {?} */
        const zoneJsLoaded = element[ADD_EVENT_LISTENER];
        /** @type {?} */
        let callback = (/** @type {?} */ (handler));
        // if zonejs is loaded and current zone is not ngZone
        // we keep Zone.current on target for later restoration.
        if (zoneJsLoaded && (!NgZone.isInAngularZone() || isBlackListedEvent(eventName))) {
            /** @type {?} */
            let symbolName = symbolNames[eventName];
            if (!symbolName) {
                symbolName = symbolNames[eventName] = __symbol__(ANGULAR + eventName + FALSE);
            }
            /** @type {?} */
            let taskDatas = ((/** @type {?} */ (element)))[symbolName];
            /** @type {?} */
            const globalListenerRegistered = taskDatas && taskDatas.length > 0;
            if (!taskDatas) {
                taskDatas = ((/** @type {?} */ (element)))[symbolName] = [];
            }
            /** @type {?} */
            const zone = isBlackListedEvent(eventName) ? Zone.root : Zone.current;
            if (taskDatas.length === 0) {
                taskDatas.push({ zone: zone, handler: callback });
            }
            else {
                /** @type {?} */
                let callbackRegistered = false;
                for (let i = 0; i < taskDatas.length; i++) {
                    if (taskDatas[i].handler === callback) {
                        callbackRegistered = true;
                        break;
                    }
                }
                if (!callbackRegistered) {
                    taskDatas.push({ zone: zone, handler: callback });
                }
            }
            if (!globalListenerRegistered) {
                element[ADD_EVENT_LISTENER](eventName, globalListener, false);
            }
        }
        else {
            element[NATIVE_ADD_LISTENER](eventName, callback, false);
        }
        return () => this.removeEventListener(element, eventName, callback);
    }
    /**
     * @param {?} target
     * @param {?} eventName
     * @param {?} callback
     * @return {?}
     */
    removeEventListener(target, eventName, callback) {
        /** @type {?} */
        let underlyingRemove = target[REMOVE_EVENT_LISTENER];
        // zone.js not loaded, use native removeEventListener
        if (!underlyingRemove) {
            return target[NATIVE_REMOVE_LISTENER].apply(target, [eventName, callback, false]);
        }
        /** @type {?} */
        let symbolName = symbolNames[eventName];
        /** @type {?} */
        let taskDatas = symbolName && target[symbolName];
        if (!taskDatas) {
            // addEventListener not using patched version
            // just call native removeEventListener
            return target[NATIVE_REMOVE_LISTENER].apply(target, [eventName, callback, false]);
        }
        // fix issue 20532, should be able to remove
        // listener which was added inside of ngZone
        /** @type {?} */
        let found = false;
        for (let i = 0; i < taskDatas.length; i++) {
            // remove listener from taskDatas if the callback equals
            if (taskDatas[i].handler === callback) {
                found = true;
                taskDatas.splice(i, 1);
                break;
            }
        }
        if (found) {
            if (taskDatas.length === 0) {
                // all listeners are removed, we can remove the globalListener from target
                underlyingRemove.apply(target, [eventName, globalListener, false]);
            }
        }
        else {
            // not found in taskDatas, the callback may be added inside of ngZone
            // use native remove listener to remove the callback
            target[NATIVE_REMOVE_LISTENER].apply(target, [eventName, callback, false]);
        }
    }
}
DomEventsPlugin.decorators = [
    { type: Injectable }
];
/** @nocollapse */
DomEventsPlugin.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: NgZone },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [PLATFORM_ID,] }] }
];
if (false) {
    /** @type {?} */
    DomEventsPlugin.prototype.ngZone;
}
export { ɵ0, ɵ1, ɵ2 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX2V2ZW50cy5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL3BsYXRmb3JtLWJyb3dzZXIvc3JjL2RvbS9ldmVudHMvZG9tX2V2ZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBR2hGLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFdkMsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0saUJBQWlCLENBQUM7V0FTaUIsVUFBUyxDQUFTO0lBQ2hGLE9BQU8saUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLENBQUM7Ozs7Ozs7O01BSEMsVUFBVSxHQUNaLENBQUMsT0FBTyxJQUFJLEtBQUssV0FBVyxDQUFDLElBQUksQ0FBQyxtQkFBQSxJQUFJLEVBQU8sQ0FBQyxDQUFDLFlBQVksQ0FBQyxNQUUzRDs7TUFDQyxrQkFBa0IsR0FBdUIsVUFBVSxDQUFDLGtCQUFrQixDQUFDOztNQUN2RSxxQkFBcUIsR0FBMEIsVUFBVSxDQUFDLHFCQUFxQixDQUFDOztNQUVoRixXQUFXLEdBQTRCLEVBQUU7O01BRXpDLEtBQUssR0FBRyxPQUFPOztNQUNmLE9BQU8sR0FBRyxTQUFTOztNQUNuQixtQkFBbUIsR0FBRyxrQkFBa0I7O01BQ3hDLHNCQUFzQixHQUFHLHFCQUFxQjs7O01BRzlDLFVBQVUsR0FBRyxtQ0FBbUM7O01BQ2hELGdCQUFnQixHQUFHLHlDQUF5Qzs7TUFFNUQsaUJBQWlCLEdBQ25CLENBQUMsT0FBTyxJQUFJLEtBQUssV0FBVyxDQUFDLElBQUksQ0FBQyxtQkFBQSxJQUFJLEVBQU8sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztJQUNqRixjQUE2QztBQUNqRCxJQUFJLGlCQUFpQixFQUFFO0lBQ3JCLGNBQWMsR0FBRyxFQUFFLENBQUM7SUFDcEIsaUJBQWlCLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3BGOztNQUVLLGtCQUFrQixHQUFHLFVBQVMsU0FBaUI7SUFDbkQsSUFBSSxDQUFDLGNBQWMsRUFBRTtRQUNuQixPQUFPLEtBQUssQ0FBQztLQUNkO0lBQ0QsT0FBTyxjQUFjLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2xELENBQUM7Ozs7O0FBRUQsdUJBR0M7OztJQUZDLHdCQUFVOztJQUNWLDJCQUFrQjs7Ozs7TUFLZCxjQUFjLEdBQUcsVUFBUyxLQUFZOztVQUNwQyxVQUFVLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7SUFDMUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtRQUNmLE9BQU87S0FDUjs7VUFDSyxTQUFTLEdBQWUsSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUM5QyxJQUFJLENBQUMsU0FBUyxFQUFFO1FBQ2QsT0FBTztLQUNSOztVQUNLLElBQUksR0FBUSxDQUFDLEtBQUssQ0FBQztJQUN6QixJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOzs7Y0FFcEIsUUFBUSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDN0IsSUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDbEMsZ0VBQWdFO1lBQ2hFLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDeEQ7YUFBTTtZQUNMLE9BQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzNDO0tBQ0Y7U0FBTTs7OztjQUdDLFdBQVcsR0FBRyxTQUFTLENBQUMsS0FBSyxFQUFFO1FBQ3JDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzNDLHdEQUF3RDtZQUN4RCxhQUFhO1lBQ2IsSUFBSSxDQUFDLG1CQUFBLEtBQUssRUFBTyxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUN2QyxNQUFNO2FBQ1A7O2tCQUNLLFFBQVEsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQy9CLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNsQyxnRUFBZ0U7Z0JBQ2hFLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ2pEO2lCQUFNO2dCQUNMLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQzthQUNwQztTQUNGO0tBQ0Y7QUFDSCxDQUFDOztBQUdELE1BQU0sT0FBTyxlQUFnQixTQUFRLGtCQUFrQjs7Ozs7O0lBQ3JELFlBQ3NCLEdBQVEsRUFBVSxNQUFjLEVBQ2pCLFVBQW1CO1FBQ3RELEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUYyQixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBSXBELElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUNoRCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7U0FDbkI7SUFDSCxDQUFDOzs7O0lBRU8sVUFBVTtRQUNoQixJQUFJLE9BQU8sS0FBSyxLQUFLLFdBQVcsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUU7WUFDOUQsT0FBTztTQUNSO1FBQ0QsSUFBSSxDQUFDLG1CQUFBLEtBQUssQ0FBQyxTQUFTLEVBQU8sQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7WUFDOUMsNkJBQTZCO1lBQzdCLE9BQU87U0FDUjs7Y0FDSyxRQUFRLEdBQUcsQ0FBQyxtQkFBQSxLQUFLLENBQUMsU0FBUyxFQUFPLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQztZQUN2RCxLQUFLLENBQUMsU0FBUyxDQUFDLHdCQUF3QjtRQUM1QyxLQUFLLENBQUMsU0FBUyxDQUFDLHdCQUF3QixHQUFHO1lBQ3pDLElBQUksSUFBSSxFQUFFO2dCQUNSLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUM7YUFDekI7WUFFRCxzQ0FBc0M7WUFDdEMsOENBQThDO1lBQzlDLGlDQUFpQztZQUNqQyxRQUFRLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDOUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQzs7Ozs7OztJQUlELFFBQVEsQ0FBQyxTQUFpQixJQUFhLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQzs7Ozs7OztJQUVyRCxnQkFBZ0IsQ0FBQyxPQUFvQixFQUFFLFNBQWlCLEVBQUUsT0FBaUI7Ozs7Ozs7Ozs7Ozs7OztjQWNuRSxJQUFJLEdBQUcsSUFBSTs7Y0FDWCxZQUFZLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDOztZQUM1QyxRQUFRLEdBQWtCLG1CQUFBLE9BQU8sRUFBaUI7UUFDdEQscURBQXFEO1FBQ3JELHdEQUF3RDtRQUN4RCxJQUFJLFlBQVksSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxJQUFJLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUU7O2dCQUM1RSxVQUFVLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQztZQUN2QyxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNmLFVBQVUsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsVUFBVSxDQUFDLE9BQU8sR0FBRyxTQUFTLEdBQUcsS0FBSyxDQUFDLENBQUM7YUFDL0U7O2dCQUNHLFNBQVMsR0FBZSxDQUFDLG1CQUFBLE9BQU8sRUFBTyxDQUFDLENBQUMsVUFBVSxDQUFDOztrQkFDbEQsd0JBQXdCLEdBQUcsU0FBUyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQztZQUNsRSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNkLFNBQVMsR0FBRyxDQUFDLG1CQUFBLE9BQU8sRUFBTyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDO2FBQy9DOztrQkFFSyxJQUFJLEdBQUcsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPO1lBQ3JFLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzFCLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO2FBQ2pEO2lCQUFNOztvQkFDRCxrQkFBa0IsR0FBRyxLQUFLO2dCQUM5QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDekMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxLQUFLLFFBQVEsRUFBRTt3QkFDckMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO3dCQUMxQixNQUFNO3FCQUNQO2lCQUNGO2dCQUNELElBQUksQ0FBQyxrQkFBa0IsRUFBRTtvQkFDdkIsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7aUJBQ2pEO2FBQ0Y7WUFFRCxJQUFJLENBQUMsd0JBQXdCLEVBQUU7Z0JBQzdCLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLFNBQVMsRUFBRSxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDL0Q7U0FDRjthQUFNO1lBQ0wsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUMxRDtRQUNELE9BQU8sR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDdEUsQ0FBQzs7Ozs7OztJQUVELG1CQUFtQixDQUFDLE1BQVcsRUFBRSxTQUFpQixFQUFFLFFBQWtCOztZQUNoRSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMscUJBQXFCLENBQUM7UUFDcEQscURBQXFEO1FBQ3JELElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtZQUNyQixPQUFPLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDbkY7O1lBQ0csVUFBVSxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUM7O1lBQ25DLFNBQVMsR0FBZSxVQUFVLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQztRQUM1RCxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2QsNkNBQTZDO1lBQzdDLHVDQUF1QztZQUN2QyxPQUFPLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDbkY7Ozs7WUFHRyxLQUFLLEdBQUcsS0FBSztRQUNqQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN6Qyx3REFBd0Q7WUFDeEQsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxLQUFLLFFBQVEsRUFBRTtnQkFDckMsS0FBSyxHQUFHLElBQUksQ0FBQztnQkFDYixTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDdkIsTUFBTTthQUNQO1NBQ0Y7UUFDRCxJQUFJLEtBQUssRUFBRTtZQUNULElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzFCLDBFQUEwRTtnQkFDMUUsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLFNBQVMsRUFBRSxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUNwRTtTQUNGO2FBQU07WUFDTCxxRUFBcUU7WUFDckUsb0RBQW9EO1lBQ3BELE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDNUU7SUFDSCxDQUFDOzs7WUEvSEYsVUFBVTs7Ozs0Q0FHSixNQUFNLFNBQUMsUUFBUTtZQWhHTSxNQUFNOzRDQWlHM0IsUUFBUSxZQUFJLE1BQU0sU0FBQyxXQUFXOzs7O0lBREgsaUNBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2lzUGxhdGZvcm1TZXJ2ZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgTmdab25lLCBPcHRpb25hbCwgUExBVEZPUk1fSUR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5cbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJy4uL2RvbV90b2tlbnMnO1xuXG5pbXBvcnQge0V2ZW50TWFuYWdlclBsdWdpbn0gZnJvbSAnLi9ldmVudF9tYW5hZ2VyJztcblxuLyoqXG4gKiBEZXRlY3QgaWYgWm9uZSBpcyBwcmVzZW50LiBJZiBpdCBpcyB0aGVuIHVzZSBzaW1wbGUgem9uZSBhd2FyZSAnYWRkRXZlbnRMaXN0ZW5lcidcbiAqIHNpbmNlIEFuZ3VsYXIgY2FuIGRvIG11Y2ggbW9yZVxuICogZWZmaWNpZW50IGJvb2trZWVwaW5nIHRoYW4gWm9uZSBjYW4sIGJlY2F1c2Ugd2UgaGF2ZSBhZGRpdGlvbmFsIGluZm9ybWF0aW9uLiBUaGlzIHNwZWVkcyB1cFxuICogYWRkRXZlbnRMaXN0ZW5lciBieSAzeC5cbiAqL1xuY29uc3QgX19zeW1ib2xfXyA9XG4gICAgKHR5cGVvZiBab25lICE9PSAndW5kZWZpbmVkJykgJiYgKFpvbmUgYXMgYW55KVsnX19zeW1ib2xfXyddIHx8IGZ1bmN0aW9uKHY6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICByZXR1cm4gJ19fem9uZV9zeW1ib2xfXycgKyB2O1xuICAgIH07XG5jb25zdCBBRERfRVZFTlRfTElTVEVORVI6ICdhZGRFdmVudExpc3RlbmVyJyA9IF9fc3ltYm9sX18oJ2FkZEV2ZW50TGlzdGVuZXInKTtcbmNvbnN0IFJFTU9WRV9FVkVOVF9MSVNURU5FUjogJ3JlbW92ZUV2ZW50TGlzdGVuZXInID0gX19zeW1ib2xfXygncmVtb3ZlRXZlbnRMaXN0ZW5lcicpO1xuXG5jb25zdCBzeW1ib2xOYW1lczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcblxuY29uc3QgRkFMU0UgPSAnRkFMU0UnO1xuY29uc3QgQU5HVUxBUiA9ICdBTkdVTEFSJztcbmNvbnN0IE5BVElWRV9BRERfTElTVEVORVIgPSAnYWRkRXZlbnRMaXN0ZW5lcic7XG5jb25zdCBOQVRJVkVfUkVNT1ZFX0xJU1RFTkVSID0gJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuXG4vLyB1c2UgdGhlIHNhbWUgc3ltYm9sIHN0cmluZyB3aGljaCBpcyB1c2VkIGluIHpvbmUuanNcbmNvbnN0IHN0b3BTeW1ib2wgPSAnX196b25lX3N5bWJvbF9fcHJvcGFnYXRpb25TdG9wcGVkJztcbmNvbnN0IHN0b3BNZXRob2RTeW1ib2wgPSAnX196b25lX3N5bWJvbF9fc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uJztcblxuY29uc3QgYmxhY2tMaXN0ZWRFdmVudHM6IHN0cmluZ1tdID1cbiAgICAodHlwZW9mIFpvbmUgIT09ICd1bmRlZmluZWQnKSAmJiAoWm9uZSBhcyBhbnkpW19fc3ltYm9sX18oJ0JMQUNLX0xJU1RFRF9FVkVOVFMnKV07XG5sZXQgYmxhY2tMaXN0ZWRNYXA6IHtbZXZlbnROYW1lOiBzdHJpbmddOiBzdHJpbmd9O1xuaWYgKGJsYWNrTGlzdGVkRXZlbnRzKSB7XG4gIGJsYWNrTGlzdGVkTWFwID0ge307XG4gIGJsYWNrTGlzdGVkRXZlbnRzLmZvckVhY2goZXZlbnROYW1lID0+IHsgYmxhY2tMaXN0ZWRNYXBbZXZlbnROYW1lXSA9IGV2ZW50TmFtZTsgfSk7XG59XG5cbmNvbnN0IGlzQmxhY2tMaXN0ZWRFdmVudCA9IGZ1bmN0aW9uKGV2ZW50TmFtZTogc3RyaW5nKSB7XG4gIGlmICghYmxhY2tMaXN0ZWRNYXApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIGJsYWNrTGlzdGVkTWFwLmhhc093blByb3BlcnR5KGV2ZW50TmFtZSk7XG59O1xuXG5pbnRlcmZhY2UgVGFza0RhdGEge1xuICB6b25lOiBhbnk7XG4gIGhhbmRsZXI6IEZ1bmN0aW9uO1xufVxuXG4vLyBhIGdsb2JhbCBsaXN0ZW5lciB0byBoYW5kbGUgYWxsIGRvbSBldmVudCxcbi8vIHNvIHdlIGRvIG5vdCBuZWVkIHRvIGNyZWF0ZSBhIGNsb3N1cmUgZXZlcnkgdGltZVxuY29uc3QgZ2xvYmFsTGlzdGVuZXIgPSBmdW5jdGlvbihldmVudDogRXZlbnQpIHtcbiAgY29uc3Qgc3ltYm9sTmFtZSA9IHN5bWJvbE5hbWVzW2V2ZW50LnR5cGVdO1xuICBpZiAoIXN5bWJvbE5hbWUpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgdGFza0RhdGFzOiBUYXNrRGF0YVtdID0gdGhpc1tzeW1ib2xOYW1lXTtcbiAgaWYgKCF0YXNrRGF0YXMpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgYXJnczogYW55ID0gW2V2ZW50XTtcbiAgaWYgKHRhc2tEYXRhcy5sZW5ndGggPT09IDEpIHtcbiAgICAvLyBpZiB0YXNrRGF0YXMgb25seSBoYXZlIG9uZSBlbGVtZW50LCBqdXN0IGludm9rZSBpdFxuICAgIGNvbnN0IHRhc2tEYXRhID0gdGFza0RhdGFzWzBdO1xuICAgIGlmICh0YXNrRGF0YS56b25lICE9PSBab25lLmN1cnJlbnQpIHtcbiAgICAgIC8vIG9ubHkgdXNlIFpvbmUucnVuIHdoZW4gWm9uZS5jdXJyZW50IG5vdCBlcXVhbHMgdG8gc3RvcmVkIHpvbmVcbiAgICAgIHJldHVybiB0YXNrRGF0YS56b25lLnJ1bih0YXNrRGF0YS5oYW5kbGVyLCB0aGlzLCBhcmdzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRhc2tEYXRhLmhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIGNvcHkgdGFza3MgYXMgYSBzbmFwc2hvdCB0byBhdm9pZCBldmVudCBoYW5kbGVycyByZW1vdmVcbiAgICAvLyBpdHNlbGYgb3Igb3RoZXJzXG4gICAgY29uc3QgY29waWVkVGFza3MgPSB0YXNrRGF0YXMuc2xpY2UoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvcGllZFRhc2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBpZiBvdGhlciBsaXN0ZW5lciBjYWxsIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvblxuICAgICAgLy8ganVzdCBicmVha1xuICAgICAgaWYgKChldmVudCBhcyBhbnkpW3N0b3BTeW1ib2xdID09PSB0cnVlKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY29uc3QgdGFza0RhdGEgPSBjb3BpZWRUYXNrc1tpXTtcbiAgICAgIGlmICh0YXNrRGF0YS56b25lICE9PSBab25lLmN1cnJlbnQpIHtcbiAgICAgICAgLy8gb25seSB1c2UgWm9uZS5ydW4gd2hlbiBab25lLmN1cnJlbnQgbm90IGVxdWFscyB0byBzdG9yZWQgem9uZVxuICAgICAgICB0YXNrRGF0YS56b25lLnJ1bih0YXNrRGF0YS5oYW5kbGVyLCB0aGlzLCBhcmdzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRhc2tEYXRhLmhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRG9tRXZlbnRzUGx1Z2luIGV4dGVuZHMgRXZlbnRNYW5hZ2VyUGx1Z2luIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBASW5qZWN0KERPQ1VNRU5UKSBkb2M6IGFueSwgcHJpdmF0ZSBuZ1pvbmU6IE5nWm9uZSxcbiAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoUExBVEZPUk1fSUQpIHBsYXRmb3JtSWQ6IHt9fG51bGwpIHtcbiAgICBzdXBlcihkb2MpO1xuXG4gICAgaWYgKCFwbGF0Zm9ybUlkIHx8ICFpc1BsYXRmb3JtU2VydmVyKHBsYXRmb3JtSWQpKSB7XG4gICAgICB0aGlzLnBhdGNoRXZlbnQoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHBhdGNoRXZlbnQoKSB7XG4gICAgaWYgKHR5cGVvZiBFdmVudCA9PT0gJ3VuZGVmaW5lZCcgfHwgIUV2ZW50IHx8ICFFdmVudC5wcm90b3R5cGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKChFdmVudC5wcm90b3R5cGUgYXMgYW55KVtzdG9wTWV0aG9kU3ltYm9sXSkge1xuICAgICAgLy8gYWxyZWFkeSBwYXRjaGVkIGJ5IHpvbmUuanNcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZGVsZWdhdGUgPSAoRXZlbnQucHJvdG90eXBlIGFzIGFueSlbc3RvcE1ldGhvZFN5bWJvbF0gPVxuICAgICAgICBFdmVudC5wcm90b3R5cGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uO1xuICAgIEV2ZW50LnByb3RvdHlwZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzKSB7XG4gICAgICAgIHRoaXNbc3RvcFN5bWJvbF0gPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBzaG91bGQgY2FsbCBuYXRpdmUgZGVsZWdhdGUgaW4gY2FzZVxuICAgICAgLy8gaW4gc29tZSBlbnZpcm9ubWVudCBwYXJ0IG9mIHRoZSBhcHBsaWNhdGlvblxuICAgICAgLy8gd2lsbCBub3QgdXNlIHRoZSBwYXRjaGVkIEV2ZW50XG4gICAgICBkZWxlZ2F0ZSAmJiBkZWxlZ2F0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICAvLyBUaGlzIHBsdWdpbiBzaG91bGQgY29tZSBsYXN0IGluIHRoZSBsaXN0IG9mIHBsdWdpbnMsIGJlY2F1c2UgaXQgYWNjZXB0cyBhbGxcbiAgLy8gZXZlbnRzLlxuICBzdXBwb3J0cyhldmVudE5hbWU6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gdHJ1ZTsgfVxuXG4gIGFkZEV2ZW50TGlzdGVuZXIoZWxlbWVudDogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBoYW5kbGVyOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICAvKipcbiAgICAgKiBUaGlzIGNvZGUgaXMgYWJvdXQgdG8gYWRkIGEgbGlzdGVuZXIgdG8gdGhlIERPTS4gSWYgWm9uZS5qcyBpcyBwcmVzZW50LCB0aGFuXG4gICAgICogYGFkZEV2ZW50TGlzdGVuZXJgIGhhcyBiZWVuIHBhdGNoZWQuIFRoZSBwYXRjaGVkIGNvZGUgYWRkcyBvdmVyaGVhZCBpbiBib3RoXG4gICAgICogbWVtb3J5IGFuZCBzcGVlZCAoM3ggc2xvd2VyKSB0aGFuIG5hdGl2ZS4gRm9yIHRoaXMgcmVhc29uIGlmIHdlIGRldGVjdCB0aGF0XG4gICAgICogWm9uZS5qcyBpcyBwcmVzZW50IHdlIHVzZSBhIHNpbXBsZSB2ZXJzaW9uIG9mIHpvbmUgYXdhcmUgYWRkRXZlbnRMaXN0ZW5lciBpbnN0ZWFkLlxuICAgICAqIFRoZSByZXN1bHQgaXMgZmFzdGVyIHJlZ2lzdHJhdGlvbiBhbmQgdGhlIHpvbmUgd2lsbCBiZSByZXN0b3JlZC5cbiAgICAgKiBCdXQgWm9uZVNwZWMub25TY2hlZHVsZVRhc2ssIFpvbmVTcGVjLm9uSW52b2tlVGFzaywgWm9uZVNwZWMub25DYW5jZWxUYXNrXG4gICAgICogd2lsbCBub3QgYmUgaW52b2tlZFxuICAgICAqIFdlIGFsc28gZG8gbWFudWFsIHpvbmUgcmVzdG9yYXRpb24gaW4gZWxlbWVudC50cyByZW5kZXJFdmVudEhhbmRsZXJDbG9zdXJlIG1ldGhvZC5cbiAgICAgKlxuICAgICAqIE5PVEU6IGl0IGlzIHBvc3NpYmxlIHRoYXQgdGhlIGVsZW1lbnQgaXMgZnJvbSBkaWZmZXJlbnQgaWZyYW1lLCBhbmQgc28gd2VcbiAgICAgKiBoYXZlIHRvIGNoZWNrIGJlZm9yZSB3ZSBleGVjdXRlIHRoZSBtZXRob2QuXG4gICAgICovXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgY29uc3Qgem9uZUpzTG9hZGVkID0gZWxlbWVudFtBRERfRVZFTlRfTElTVEVORVJdO1xuICAgIGxldCBjYWxsYmFjazogRXZlbnRMaXN0ZW5lciA9IGhhbmRsZXIgYXMgRXZlbnRMaXN0ZW5lcjtcbiAgICAvLyBpZiB6b25lanMgaXMgbG9hZGVkIGFuZCBjdXJyZW50IHpvbmUgaXMgbm90IG5nWm9uZVxuICAgIC8vIHdlIGtlZXAgWm9uZS5jdXJyZW50IG9uIHRhcmdldCBmb3IgbGF0ZXIgcmVzdG9yYXRpb24uXG4gICAgaWYgKHpvbmVKc0xvYWRlZCAmJiAoIU5nWm9uZS5pc0luQW5ndWxhclpvbmUoKSB8fCBpc0JsYWNrTGlzdGVkRXZlbnQoZXZlbnROYW1lKSkpIHtcbiAgICAgIGxldCBzeW1ib2xOYW1lID0gc3ltYm9sTmFtZXNbZXZlbnROYW1lXTtcbiAgICAgIGlmICghc3ltYm9sTmFtZSkge1xuICAgICAgICBzeW1ib2xOYW1lID0gc3ltYm9sTmFtZXNbZXZlbnROYW1lXSA9IF9fc3ltYm9sX18oQU5HVUxBUiArIGV2ZW50TmFtZSArIEZBTFNFKTtcbiAgICAgIH1cbiAgICAgIGxldCB0YXNrRGF0YXM6IFRhc2tEYXRhW10gPSAoZWxlbWVudCBhcyBhbnkpW3N5bWJvbE5hbWVdO1xuICAgICAgY29uc3QgZ2xvYmFsTGlzdGVuZXJSZWdpc3RlcmVkID0gdGFza0RhdGFzICYmIHRhc2tEYXRhcy5sZW5ndGggPiAwO1xuICAgICAgaWYgKCF0YXNrRGF0YXMpIHtcbiAgICAgICAgdGFza0RhdGFzID0gKGVsZW1lbnQgYXMgYW55KVtzeW1ib2xOYW1lXSA9IFtdO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB6b25lID0gaXNCbGFja0xpc3RlZEV2ZW50KGV2ZW50TmFtZSkgPyBab25lLnJvb3QgOiBab25lLmN1cnJlbnQ7XG4gICAgICBpZiAodGFza0RhdGFzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0YXNrRGF0YXMucHVzaCh7em9uZTogem9uZSwgaGFuZGxlcjogY2FsbGJhY2t9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBjYWxsYmFja1JlZ2lzdGVyZWQgPSBmYWxzZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0YXNrRGF0YXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAodGFza0RhdGFzW2ldLmhhbmRsZXIgPT09IGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFja1JlZ2lzdGVyZWQgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghY2FsbGJhY2tSZWdpc3RlcmVkKSB7XG4gICAgICAgICAgdGFza0RhdGFzLnB1c2goe3pvbmU6IHpvbmUsIGhhbmRsZXI6IGNhbGxiYWNrfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCFnbG9iYWxMaXN0ZW5lclJlZ2lzdGVyZWQpIHtcbiAgICAgICAgZWxlbWVudFtBRERfRVZFTlRfTElTVEVORVJdKGV2ZW50TmFtZSwgZ2xvYmFsTGlzdGVuZXIsIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbWVudFtOQVRJVkVfQUREX0xJU1RFTkVSXShldmVudE5hbWUsIGNhbGxiYWNrLCBmYWxzZSk7XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoZWxlbWVudCwgZXZlbnROYW1lLCBjYWxsYmFjayk7XG4gIH1cblxuICByZW1vdmVFdmVudExpc3RlbmVyKHRhcmdldDogYW55LCBldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgbGV0IHVuZGVybHlpbmdSZW1vdmUgPSB0YXJnZXRbUkVNT1ZFX0VWRU5UX0xJU1RFTkVSXTtcbiAgICAvLyB6b25lLmpzIG5vdCBsb2FkZWQsIHVzZSBuYXRpdmUgcmVtb3ZlRXZlbnRMaXN0ZW5lclxuICAgIGlmICghdW5kZXJseWluZ1JlbW92ZSkge1xuICAgICAgcmV0dXJuIHRhcmdldFtOQVRJVkVfUkVNT1ZFX0xJU1RFTkVSXS5hcHBseSh0YXJnZXQsIFtldmVudE5hbWUsIGNhbGxiYWNrLCBmYWxzZV0pO1xuICAgIH1cbiAgICBsZXQgc3ltYm9sTmFtZSA9IHN5bWJvbE5hbWVzW2V2ZW50TmFtZV07XG4gICAgbGV0IHRhc2tEYXRhczogVGFza0RhdGFbXSA9IHN5bWJvbE5hbWUgJiYgdGFyZ2V0W3N5bWJvbE5hbWVdO1xuICAgIGlmICghdGFza0RhdGFzKSB7XG4gICAgICAvLyBhZGRFdmVudExpc3RlbmVyIG5vdCB1c2luZyBwYXRjaGVkIHZlcnNpb25cbiAgICAgIC8vIGp1c3QgY2FsbCBuYXRpdmUgcmVtb3ZlRXZlbnRMaXN0ZW5lclxuICAgICAgcmV0dXJuIHRhcmdldFtOQVRJVkVfUkVNT1ZFX0xJU1RFTkVSXS5hcHBseSh0YXJnZXQsIFtldmVudE5hbWUsIGNhbGxiYWNrLCBmYWxzZV0pO1xuICAgIH1cbiAgICAvLyBmaXggaXNzdWUgMjA1MzIsIHNob3VsZCBiZSBhYmxlIHRvIHJlbW92ZVxuICAgIC8vIGxpc3RlbmVyIHdoaWNoIHdhcyBhZGRlZCBpbnNpZGUgb2Ygbmdab25lXG4gICAgbGV0IGZvdW5kID0gZmFsc2U7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0YXNrRGF0YXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIHJlbW92ZSBsaXN0ZW5lciBmcm9tIHRhc2tEYXRhcyBpZiB0aGUgY2FsbGJhY2sgZXF1YWxzXG4gICAgICBpZiAodGFza0RhdGFzW2ldLmhhbmRsZXIgPT09IGNhbGxiYWNrKSB7XG4gICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgdGFza0RhdGFzLnNwbGljZShpLCAxKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChmb3VuZCkge1xuICAgICAgaWYgKHRhc2tEYXRhcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8gYWxsIGxpc3RlbmVycyBhcmUgcmVtb3ZlZCwgd2UgY2FuIHJlbW92ZSB0aGUgZ2xvYmFsTGlzdGVuZXIgZnJvbSB0YXJnZXRcbiAgICAgICAgdW5kZXJseWluZ1JlbW92ZS5hcHBseSh0YXJnZXQsIFtldmVudE5hbWUsIGdsb2JhbExpc3RlbmVyLCBmYWxzZV0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBub3QgZm91bmQgaW4gdGFza0RhdGFzLCB0aGUgY2FsbGJhY2sgbWF5IGJlIGFkZGVkIGluc2lkZSBvZiBuZ1pvbmVcbiAgICAgIC8vIHVzZSBuYXRpdmUgcmVtb3ZlIGxpc3RlbmVyIHRvIHJlbW92ZSB0aGUgY2FsbGJhY2tcbiAgICAgIHRhcmdldFtOQVRJVkVfUkVNT1ZFX0xJU1RFTkVSXS5hcHBseSh0YXJnZXQsIFtldmVudE5hbWUsIGNhbGxiYWNrLCBmYWxzZV0pO1xuICAgIH1cbiAgfVxufVxuIl19