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
import { defer, from, of } from 'rxjs';
import { concatAll, concatMap, first, map, mergeMap } from 'rxjs/operators';
import { ActivationStart, ChildActivationStart } from '../events';
import { wrapIntoObservable } from '../utils/collection';
import { getCanActivateChild, getToken } from '../utils/preactivation';
import { isBoolean, isCanActivate, isCanActivateChild, isCanDeactivate, isFunction } from '../utils/type_guards';
import { prioritizedGuardValue } from './prioritized_guard_value';
/**
 * @param {?} moduleInjector
 * @param {?=} forwardEvent
 * @return {?}
 */
export function checkGuards(moduleInjector, forwardEvent) {
    return function (source) {
        return source.pipe(mergeMap(t => {
            const { targetSnapshot, currentSnapshot, guards: { canActivateChecks, canDeactivateChecks } } = t;
            if (canDeactivateChecks.length === 0 && canActivateChecks.length === 0) {
                return of(Object.assign({}, t, { guardsResult: true }));
            }
            return runCanDeactivateChecks(canDeactivateChecks, (/** @type {?} */ (targetSnapshot)), currentSnapshot, moduleInjector)
                .pipe(mergeMap(canDeactivate => {
                return canDeactivate && isBoolean(canDeactivate) ?
                    runCanActivateChecks((/** @type {?} */ (targetSnapshot)), canActivateChecks, moduleInjector, forwardEvent) :
                    of(canDeactivate);
            }), map(guardsResult => (Object.assign({}, t, { guardsResult }))));
        }));
    };
}
/**
 * @param {?} checks
 * @param {?} futureRSS
 * @param {?} currRSS
 * @param {?} moduleInjector
 * @return {?}
 */
function runCanDeactivateChecks(checks, futureRSS, currRSS, moduleInjector) {
    return from(checks).pipe(mergeMap(check => runCanDeactivate(check.component, check.route, currRSS, futureRSS, moduleInjector)), first(result => { return result !== true; }, (/** @type {?} */ (true))));
}
/**
 * @param {?} futureSnapshot
 * @param {?} checks
 * @param {?} moduleInjector
 * @param {?=} forwardEvent
 * @return {?}
 */
function runCanActivateChecks(futureSnapshot, checks, moduleInjector, forwardEvent) {
    return from(checks).pipe(concatMap((check) => {
        return from([
            fireChildActivationStart(check.route.parent, forwardEvent),
            fireActivationStart(check.route, forwardEvent),
            runCanActivateChild(futureSnapshot, check.path, moduleInjector),
            runCanActivate(futureSnapshot, check.route, moduleInjector)
        ])
            .pipe(concatAll(), first(result => {
            return result !== true;
        }, (/** @type {?} */ (true))));
    }), first(result => { return result !== true; }, (/** @type {?} */ (true))));
}
/**
 * This should fire off `ActivationStart` events for each route being activated at this
 * level.
 * In other words, if you're activating `a` and `b` below, `path` will contain the
 * `ActivatedRouteSnapshot`s for both and we will fire `ActivationStart` for both. Always
 * return
 * `true` so checks continue to run.
 * @param {?} snapshot
 * @param {?=} forwardEvent
 * @return {?}
 */
function fireActivationStart(snapshot, forwardEvent) {
    if (snapshot !== null && forwardEvent) {
        forwardEvent(new ActivationStart(snapshot));
    }
    return of(true);
}
/**
 * This should fire off `ChildActivationStart` events for each route being activated at this
 * level.
 * In other words, if you're activating `a` and `b` below, `path` will contain the
 * `ActivatedRouteSnapshot`s for both and we will fire `ChildActivationStart` for both. Always
 * return
 * `true` so checks continue to run.
 * @param {?} snapshot
 * @param {?=} forwardEvent
 * @return {?}
 */
function fireChildActivationStart(snapshot, forwardEvent) {
    if (snapshot !== null && forwardEvent) {
        forwardEvent(new ChildActivationStart(snapshot));
    }
    return of(true);
}
/**
 * @param {?} futureRSS
 * @param {?} futureARS
 * @param {?} moduleInjector
 * @return {?}
 */
function runCanActivate(futureRSS, futureARS, moduleInjector) {
    /** @type {?} */
    const canActivate = futureARS.routeConfig ? futureARS.routeConfig.canActivate : null;
    if (!canActivate || canActivate.length === 0)
        return of(true);
    /** @type {?} */
    const canActivateObservables = canActivate.map((c) => {
        return defer(() => {
            /** @type {?} */
            const guard = getToken(c, futureARS, moduleInjector);
            /** @type {?} */
            let observable;
            if (isCanActivate(guard)) {
                observable = wrapIntoObservable(guard.canActivate(futureARS, futureRSS));
            }
            else if (isFunction(guard)) {
                observable = wrapIntoObservable(guard(futureARS, futureRSS));
            }
            else {
                throw new Error('Invalid CanActivate guard');
            }
            return observable.pipe(first());
        });
    });
    return of(canActivateObservables).pipe(prioritizedGuardValue());
}
/**
 * @param {?} futureRSS
 * @param {?} path
 * @param {?} moduleInjector
 * @return {?}
 */
function runCanActivateChild(futureRSS, path, moduleInjector) {
    /** @type {?} */
    const futureARS = path[path.length - 1];
    /** @type {?} */
    const canActivateChildGuards = path.slice(0, path.length - 1)
        .reverse()
        .map(p => getCanActivateChild(p))
        .filter(_ => _ !== null);
    /** @type {?} */
    const canActivateChildGuardsMapped = canActivateChildGuards.map((d) => {
        return defer(() => {
            /** @type {?} */
            const guardsMapped = d.guards.map((c) => {
                /** @type {?} */
                const guard = getToken(c, d.node, moduleInjector);
                /** @type {?} */
                let observable;
                if (isCanActivateChild(guard)) {
                    observable = wrapIntoObservable(guard.canActivateChild(futureARS, futureRSS));
                }
                else if (isFunction(guard)) {
                    observable = wrapIntoObservable(guard(futureARS, futureRSS));
                }
                else {
                    throw new Error('Invalid CanActivateChild guard');
                }
                return observable.pipe(first());
            });
            return of(guardsMapped).pipe(prioritizedGuardValue());
        });
    });
    return of(canActivateChildGuardsMapped).pipe(prioritizedGuardValue());
}
/**
 * @param {?} component
 * @param {?} currARS
 * @param {?} currRSS
 * @param {?} futureRSS
 * @param {?} moduleInjector
 * @return {?}
 */
function runCanDeactivate(component, currARS, currRSS, futureRSS, moduleInjector) {
    /** @type {?} */
    const canDeactivate = currARS && currARS.routeConfig ? currARS.routeConfig.canDeactivate : null;
    if (!canDeactivate || canDeactivate.length === 0)
        return of(true);
    /** @type {?} */
    const canDeactivateObservables = canDeactivate.map((c) => {
        /** @type {?} */
        const guard = getToken(c, currARS, moduleInjector);
        /** @type {?} */
        let observable;
        if (isCanDeactivate(guard)) {
            observable =
                wrapIntoObservable(guard.canDeactivate((/** @type {?} */ (component)), currARS, currRSS, futureRSS));
        }
        else if (isFunction(guard)) {
            observable = wrapIntoObservable(guard(component, currARS, currRSS, futureRSS));
        }
        else {
            throw new Error('Invalid CanDeactivate guard');
        }
        return observable.pipe(first());
    });
    return of(canDeactivateObservables).pipe(prioritizedGuardValue());
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tfZ3VhcmRzLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvcm91dGVyL3NyYy9vcGVyYXRvcnMvY2hlY2tfZ3VhcmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBU0EsT0FBTyxFQUF1QyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM1RSxPQUFPLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRTFFLE9BQU8sRUFBQyxlQUFlLEVBQUUsb0JBQW9CLEVBQVEsTUFBTSxXQUFXLENBQUM7QUFLdkUsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDdkQsT0FBTyxFQUE2QixtQkFBbUIsRUFBRSxRQUFRLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUNqRyxPQUFPLEVBQUMsU0FBUyxFQUFFLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxlQUFlLEVBQUUsVUFBVSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFL0csT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7Ozs7OztBQUVoRSxNQUFNLFVBQVUsV0FBVyxDQUFDLGNBQXdCLEVBQUUsWUFBbUM7SUFFdkYsT0FBTyxVQUFTLE1BQXdDO1FBRXRELE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUU7a0JBQ3hCLEVBQUMsY0FBYyxFQUFFLGVBQWUsRUFBRSxNQUFNLEVBQUUsRUFBQyxpQkFBaUIsRUFBRSxtQkFBbUIsRUFBQyxFQUFDLEdBQUcsQ0FBQztZQUM3RixJQUFJLG1CQUFtQixDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksaUJBQWlCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDdEUsT0FBTyxFQUFFLG1CQUFNLENBQUMsSUFB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QUMsQ0FBQztTQUNoRjthQUFNO1lBQ0wsTUFBTSxJQUFJLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1NBQ2hEO1FBQ0QsT0FBTyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDbEMsQ0FBQyxDQUFDO0lBQ0YsT0FBTyxFQUFFLENBQUUsd0JBQXdCLENBQUMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDO0FBQ3JFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0b3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb24sIE9ic2VydmFibGUsIGRlZmVyLCBmcm9tLCBvZiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtjb25jYXRBbGwsIGNvbmNhdE1hcCwgZmlyc3QsIG1hcCwgbWVyZ2VNYXB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtBY3RpdmF0aW9uU3RhcnQsIENoaWxkQWN0aXZhdGlvblN0YXJ0LCBFdmVudH0gZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCB7Q2FuQWN0aXZhdGVDaGlsZEZuLCBDYW5BY3RpdmF0ZUZuLCBDYW5EZWFjdGl2YXRlRm59IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtOYXZpZ2F0aW9uVHJhbnNpdGlvbn0gZnJvbSAnLi4vcm91dGVyJztcbmltcG9ydCB7QWN0aXZhdGVkUm91dGVTbmFwc2hvdCwgUm91dGVyU3RhdGVTbmFwc2hvdH0gZnJvbSAnLi4vcm91dGVyX3N0YXRlJztcbmltcG9ydCB7VXJsVHJlZX0gZnJvbSAnLi4vdXJsX3RyZWUnO1xuaW1wb3J0IHt3cmFwSW50b09ic2VydmFibGV9IGZyb20gJy4uL3V0aWxzL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtDYW5BY3RpdmF0ZSwgQ2FuRGVhY3RpdmF0ZSwgZ2V0Q2FuQWN0aXZhdGVDaGlsZCwgZ2V0VG9rZW59IGZyb20gJy4uL3V0aWxzL3ByZWFjdGl2YXRpb24nO1xuaW1wb3J0IHtpc0Jvb2xlYW4sIGlzQ2FuQWN0aXZhdGUsIGlzQ2FuQWN0aXZhdGVDaGlsZCwgaXNDYW5EZWFjdGl2YXRlLCBpc0Z1bmN0aW9ufSBmcm9tICcuLi91dGlscy90eXBlX2d1YXJkcyc7XG5cbmltcG9ydCB7cHJpb3JpdGl6ZWRHdWFyZFZhbHVlfSBmcm9tICcuL3ByaW9yaXRpemVkX2d1YXJkX3ZhbHVlJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrR3VhcmRzKG1vZHVsZUluamVjdG9yOiBJbmplY3RvciwgZm9yd2FyZEV2ZW50PzogKGV2dDogRXZlbnQpID0+IHZvaWQpOlxuICAgIE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxOYXZpZ2F0aW9uVHJhbnNpdGlvbj4ge1xuICByZXR1cm4gZnVuY3Rpb24oc291cmNlOiBPYnNlcnZhYmxlPE5hdmlnYXRpb25UcmFuc2l0aW9uPikge1xuXG4gICAgcmV0dXJuIHNvdXJjZS5waXBlKG1lcmdlTWFwKHQgPT4ge1xuICAgICAgY29uc3Qge3RhcmdldFNuYXBzaG90LCBjdXJyZW50U25hcHNob3QsIGd1YXJkczoge2NhbkFjdGl2YXRlQ2hlY2tzLCBjYW5EZWFjdGl2YXRlQ2hlY2tzfX0gPSB0O1xuICAgICAgaWYgKGNhbkRlYWN0aXZhdGVDaGVja3MubGVuZ3RoID09PSAwICYmIGNhbkFjdGl2YXRlQ2hlY2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gb2YgKHsuLi50LCBndWFyZHNSZXN1bHQ6IHRydWV9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJ1bkNhbkRlYWN0aXZhdGVDaGVja3MoXG4gICAgICAgICAgICAgICAgIGNhbkRlYWN0aXZhdGVDaGVja3MsIHRhcmdldFNuYXBzaG90ICEsIGN1cnJlbnRTbmFwc2hvdCwgbW9kdWxlSW5qZWN0b3IpXG4gICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgIG1lcmdlTWFwKGNhbkRlYWN0aXZhdGUgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYW5EZWFjdGl2YXRlICYmIGlzQm9vbGVhbihjYW5EZWFjdGl2YXRlKSA/XG4gICAgICAgICAgICAgICAgICAgIHJ1bkNhbkFjdGl2YXRlQ2hlY2tzKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0U25hcHNob3QgISwgY2FuQWN0aXZhdGVDaGVja3MsIG1vZHVsZUluamVjdG9yLCBmb3J3YXJkRXZlbnQpIDpcbiAgICAgICAgICAgICAgICAgICAgb2YgKGNhbkRlYWN0aXZhdGUpO1xuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgbWFwKGd1YXJkc1Jlc3VsdCA9PiAoey4uLnQsIGd1YXJkc1Jlc3VsdH0pKSk7XG4gICAgfSkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBydW5DYW5EZWFjdGl2YXRlQ2hlY2tzKFxuICAgIGNoZWNrczogQ2FuRGVhY3RpdmF0ZVtdLCBmdXR1cmVSU1M6IFJvdXRlclN0YXRlU25hcHNob3QsIGN1cnJSU1M6IFJvdXRlclN0YXRlU25hcHNob3QsXG4gICAgbW9kdWxlSW5qZWN0b3I6IEluamVjdG9yKSB7XG4gIHJldHVybiBmcm9tKGNoZWNrcykucGlwZShcbiAgICAgIG1lcmdlTWFwKFxuICAgICAgICAgIGNoZWNrID0+XG4gICAgICAgICAgICAgIHJ1bkNhbkRlYWN0aXZhdGUoY2hlY2suY29tcG9uZW50LCBjaGVjay5yb3V0ZSwgY3VyclJTUywgZnV0dXJlUlNTLCBtb2R1bGVJbmplY3RvcikpLFxuICAgICAgZmlyc3QocmVzdWx0ID0+IHsgcmV0dXJuIHJlc3VsdCAhPT0gdHJ1ZTsgfSwgdHJ1ZSBhcyBib29sZWFuIHwgVXJsVHJlZSkpO1xufVxuXG5mdW5jdGlvbiBydW5DYW5BY3RpdmF0ZUNoZWNrcyhcbiAgICBmdXR1cmVTbmFwc2hvdDogUm91dGVyU3RhdGVTbmFwc2hvdCwgY2hlY2tzOiBDYW5BY3RpdmF0ZVtdLCBtb2R1bGVJbmplY3RvcjogSW5qZWN0b3IsXG4gICAgZm9yd2FyZEV2ZW50PzogKGV2dDogRXZlbnQpID0+IHZvaWQpIHtcbiAgcmV0dXJuIGZyb20oY2hlY2tzKS5waXBlKFxuICAgICAgY29uY2F0TWFwKChjaGVjazogQ2FuQWN0aXZhdGUpID0+IHtcbiAgICAgICAgcmV0dXJuIGZyb20oW1xuICAgICAgICAgICAgICAgICBmaXJlQ2hpbGRBY3RpdmF0aW9uU3RhcnQoY2hlY2sucm91dGUucGFyZW50LCBmb3J3YXJkRXZlbnQpLFxuICAgICAgICAgICAgICAgICBmaXJlQWN0aXZhdGlvblN0YXJ0KGNoZWNrLnJvdXRlLCBmb3J3YXJkRXZlbnQpLFxuICAgICAgICAgICAgICAgICBydW5DYW5BY3RpdmF0ZUNoaWxkKGZ1dHVyZVNuYXBzaG90LCBjaGVjay5wYXRoLCBtb2R1bGVJbmplY3RvciksXG4gICAgICAgICAgICAgICAgIHJ1bkNhbkFjdGl2YXRlKGZ1dHVyZVNuYXBzaG90LCBjaGVjay5yb3V0ZSwgbW9kdWxlSW5qZWN0b3IpXG4gICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgLnBpcGUoY29uY2F0QWxsKCksIGZpcnN0KHJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQgIT09IHRydWU7XG4gICAgICAgICAgICAgICAgICB9LCB0cnVlIGFzIGJvb2xlYW4gfCBVcmxUcmVlKSk7XG4gICAgICB9KSxcbiAgICAgIGZpcnN0KHJlc3VsdCA9PiB7IHJldHVybiByZXN1bHQgIT09IHRydWU7IH0sIHRydWUgYXMgYm9vbGVhbiB8IFVybFRyZWUpKTtcbn1cblxuLyoqXG4gICAqIFRoaXMgc2hvdWxkIGZpcmUgb2ZmIGBBY3RpdmF0aW9uU3RhcnRgIGV2ZW50cyBmb3IgZWFjaCByb3V0ZSBiZWluZyBhY3RpdmF0ZWQgYXQgdGhpc1xuICAgKiBsZXZlbC5cbiAgICogSW4gb3RoZXIgd29yZHMsIGlmIHlvdSdyZSBhY3RpdmF0aW5nIGBhYCBhbmQgYGJgIGJlbG93LCBgcGF0aGAgd2lsbCBjb250YWluIHRoZVxuICAgKiBgQWN0aXZhdGVkUm91dGVTbmFwc2hvdGBzIGZvciBib3RoIGFuZCB3ZSB3aWxsIGZpcmUgYEFjdGl2YXRpb25TdGFydGAgZm9yIGJvdGguIEFsd2F5c1xuICAgKiByZXR1cm5cbiAgICogYHRydWVgIHNvIGNoZWNrcyBjb250aW51ZSB0byBydW4uXG4gICAqL1xuZnVuY3Rpb24gZmlyZUFjdGl2YXRpb25TdGFydChcbiAgICBzbmFwc2hvdDogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCB8IG51bGwsXG4gICAgZm9yd2FyZEV2ZW50PzogKGV2dDogRXZlbnQpID0+IHZvaWQpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcbiAgaWYgKHNuYXBzaG90ICE9PSBudWxsICYmIGZvcndhcmRFdmVudCkge1xuICAgIGZvcndhcmRFdmVudChuZXcgQWN0aXZhdGlvblN0YXJ0KHNuYXBzaG90KSk7XG4gIH1cbiAgcmV0dXJuIG9mICh0cnVlKTtcbn1cblxuLyoqXG4gICAqIFRoaXMgc2hvdWxkIGZpcmUgb2ZmIGBDaGlsZEFjdGl2YXRpb25TdGFydGAgZXZlbnRzIGZvciBlYWNoIHJvdXRlIGJlaW5nIGFjdGl2YXRlZCBhdCB0aGlzXG4gICAqIGxldmVsLlxuICAgKiBJbiBvdGhlciB3b3JkcywgaWYgeW91J3JlIGFjdGl2YXRpbmcgYGFgIGFuZCBgYmAgYmVsb3csIGBwYXRoYCB3aWxsIGNvbnRhaW4gdGhlXG4gICAqIGBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90YHMgZm9yIGJvdGggYW5kIHdlIHdpbGwgZmlyZSBgQ2hpbGRBY3RpdmF0aW9uU3RhcnRgIGZvciBib3RoLiBBbHdheXNcbiAgICogcmV0dXJuXG4gICAqIGB0cnVlYCBzbyBjaGVja3MgY29udGludWUgdG8gcnVuLlxuICAgKi9cbmZ1bmN0aW9uIGZpcmVDaGlsZEFjdGl2YXRpb25TdGFydChcbiAgICBzbmFwc2hvdDogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCB8IG51bGwsXG4gICAgZm9yd2FyZEV2ZW50PzogKGV2dDogRXZlbnQpID0+IHZvaWQpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcbiAgaWYgKHNuYXBzaG90ICE9PSBudWxsICYmIGZvcndhcmRFdmVudCkge1xuICAgIGZvcndhcmRFdmVudChuZXcgQ2hpbGRBY3RpdmF0aW9uU3RhcnQoc25hcHNob3QpKTtcbiAgfVxuICByZXR1cm4gb2YgKHRydWUpO1xufVxuXG5mdW5jdGlvbiBydW5DYW5BY3RpdmF0ZShcbiAgICBmdXR1cmVSU1M6IFJvdXRlclN0YXRlU25hcHNob3QsIGZ1dHVyZUFSUzogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCxcbiAgICBtb2R1bGVJbmplY3RvcjogSW5qZWN0b3IpOiBPYnNlcnZhYmxlPGJvb2xlYW58VXJsVHJlZT4ge1xuICBjb25zdCBjYW5BY3RpdmF0ZSA9IGZ1dHVyZUFSUy5yb3V0ZUNvbmZpZyA/IGZ1dHVyZUFSUy5yb3V0ZUNvbmZpZy5jYW5BY3RpdmF0ZSA6IG51bGw7XG4gIGlmICghY2FuQWN0aXZhdGUgfHwgY2FuQWN0aXZhdGUubGVuZ3RoID09PSAwKSByZXR1cm4gb2YgKHRydWUpO1xuXG4gIGNvbnN0IGNhbkFjdGl2YXRlT2JzZXJ2YWJsZXMgPSBjYW5BY3RpdmF0ZS5tYXAoKGM6IGFueSkgPT4ge1xuICAgIHJldHVybiBkZWZlcigoKSA9PiB7XG4gICAgICBjb25zdCBndWFyZCA9IGdldFRva2VuKGMsIGZ1dHVyZUFSUywgbW9kdWxlSW5qZWN0b3IpO1xuICAgICAgbGV0IG9ic2VydmFibGU7XG4gICAgICBpZiAoaXNDYW5BY3RpdmF0ZShndWFyZCkpIHtcbiAgICAgICAgb2JzZXJ2YWJsZSA9IHdyYXBJbnRvT2JzZXJ2YWJsZShndWFyZC5jYW5BY3RpdmF0ZShmdXR1cmVBUlMsIGZ1dHVyZVJTUykpO1xuICAgICAgfSBlbHNlIGlmIChpc0Z1bmN0aW9uPENhbkFjdGl2YXRlRm4+KGd1YXJkKSkge1xuICAgICAgICBvYnNlcnZhYmxlID0gd3JhcEludG9PYnNlcnZhYmxlKGd1YXJkKGZ1dHVyZUFSUywgZnV0dXJlUlNTKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgQ2FuQWN0aXZhdGUgZ3VhcmQnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYnNlcnZhYmxlLnBpcGUoZmlyc3QoKSk7XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gb2YgKGNhbkFjdGl2YXRlT2JzZXJ2YWJsZXMpLnBpcGUocHJpb3JpdGl6ZWRHdWFyZFZhbHVlKCkpO1xufVxuXG5mdW5jdGlvbiBydW5DYW5BY3RpdmF0ZUNoaWxkKFxuICAgIGZ1dHVyZVJTUzogUm91dGVyU3RhdGVTbmFwc2hvdCwgcGF0aDogQWN0aXZhdGVkUm91dGVTbmFwc2hvdFtdLFxuICAgIG1vZHVsZUluamVjdG9yOiBJbmplY3Rvcik6IE9ic2VydmFibGU8Ym9vbGVhbnxVcmxUcmVlPiB7XG4gIGNvbnN0IGZ1dHVyZUFSUyA9IHBhdGhbcGF0aC5sZW5ndGggLSAxXTtcblxuICBjb25zdCBjYW5BY3RpdmF0ZUNoaWxkR3VhcmRzID0gcGF0aC5zbGljZSgwLCBwYXRoLmxlbmd0aCAtIDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJldmVyc2UoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAocCA9PiBnZXRDYW5BY3RpdmF0ZUNoaWxkKHApKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoXyA9PiBfICE9PSBudWxsKTtcblxuICBjb25zdCBjYW5BY3RpdmF0ZUNoaWxkR3VhcmRzTWFwcGVkID0gY2FuQWN0aXZhdGVDaGlsZEd1YXJkcy5tYXAoKGQ6IGFueSkgPT4ge1xuICAgIHJldHVybiBkZWZlcigoKSA9PiB7XG4gICAgICBjb25zdCBndWFyZHNNYXBwZWQgPSBkLmd1YXJkcy5tYXAoKGM6IGFueSkgPT4ge1xuICAgICAgICBjb25zdCBndWFyZCA9IGdldFRva2VuKGMsIGQubm9kZSwgbW9kdWxlSW5qZWN0b3IpO1xuICAgICAgICBsZXQgb2JzZXJ2YWJsZTtcbiAgICAgICAgaWYgKGlzQ2FuQWN0aXZhdGVDaGlsZChndWFyZCkpIHtcbiAgICAgICAgICBvYnNlcnZhYmxlID0gd3JhcEludG9PYnNlcnZhYmxlKGd1YXJkLmNhbkFjdGl2YXRlQ2hpbGQoZnV0dXJlQVJTLCBmdXR1cmVSU1MpKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0Z1bmN0aW9uPENhbkFjdGl2YXRlQ2hpbGRGbj4oZ3VhcmQpKSB7XG4gICAgICAgICAgb2JzZXJ2YWJsZSA9IHdyYXBJbnRvT2JzZXJ2YWJsZShndWFyZChmdXR1cmVBUlMsIGZ1dHVyZVJTUykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBDYW5BY3RpdmF0ZUNoaWxkIGd1YXJkJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9ic2VydmFibGUucGlwZShmaXJzdCgpKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG9mIChndWFyZHNNYXBwZWQpLnBpcGUocHJpb3JpdGl6ZWRHdWFyZFZhbHVlKCkpO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIG9mIChjYW5BY3RpdmF0ZUNoaWxkR3VhcmRzTWFwcGVkKS5waXBlKHByaW9yaXRpemVkR3VhcmRWYWx1ZSgpKTtcbn1cblxuZnVuY3Rpb24gcnVuQ2FuRGVhY3RpdmF0ZShcbiAgICBjb21wb25lbnQ6IE9iamVjdCB8IG51bGwsIGN1cnJBUlM6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QsIGN1cnJSU1M6IFJvdXRlclN0YXRlU25hcHNob3QsXG4gICAgZnV0dXJlUlNTOiBSb3V0ZXJTdGF0ZVNuYXBzaG90LCBtb2R1bGVJbmplY3RvcjogSW5qZWN0b3IpOiBPYnNlcnZhYmxlPGJvb2xlYW58VXJsVHJlZT4ge1xuICBjb25zdCBjYW5EZWFjdGl2YXRlID0gY3VyckFSUyAmJiBjdXJyQVJTLnJvdXRlQ29uZmlnID8gY3VyckFSUy5yb3V0ZUNvbmZpZy5jYW5EZWFjdGl2YXRlIDogbnVsbDtcbiAgaWYgKCFjYW5EZWFjdGl2YXRlIHx8IGNhbkRlYWN0aXZhdGUubGVuZ3RoID09PSAwKSByZXR1cm4gb2YgKHRydWUpO1xuICBjb25zdCBjYW5EZWFjdGl2YXRlT2JzZXJ2YWJsZXMgPSBjYW5EZWFjdGl2YXRlLm1hcCgoYzogYW55KSA9PiB7XG4gICAgY29uc3QgZ3VhcmQgPSBnZXRUb2tlbihjLCBjdXJyQVJTLCBtb2R1bGVJbmplY3Rvcik7XG4gICAgbGV0IG9ic2VydmFibGU7XG4gICAgaWYgKGlzQ2FuRGVhY3RpdmF0ZShndWFyZCkpIHtcbiAgICAgIG9ic2VydmFibGUgPVxuICAgICAgICAgIHdyYXBJbnRvT2JzZXJ2YWJsZShndWFyZC5jYW5EZWFjdGl2YXRlKGNvbXBvbmVudCAhLCBjdXJyQVJTLCBjdXJyUlNTLCBmdXR1cmVSU1MpKTtcbiAgICB9IGVsc2UgaWYgKGlzRnVuY3Rpb248Q2FuRGVhY3RpdmF0ZUZuPGFueT4+KGd1YXJkKSkge1xuICAgICAgb2JzZXJ2YWJsZSA9IHdyYXBJbnRvT2JzZXJ2YWJsZShndWFyZChjb21wb25lbnQsIGN1cnJBUlMsIGN1cnJSU1MsIGZ1dHVyZVJTUykpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgQ2FuRGVhY3RpdmF0ZSBndWFyZCcpO1xuICAgIH1cbiAgICByZXR1cm4gb2JzZXJ2YWJsZS5waXBlKGZpcnN0KCkpO1xuICB9KTtcbiAgcmV0dXJuIG9mIChjYW5EZWFjdGl2YXRlT2JzZXJ2YWJsZXMpLnBpcGUocHJpb3JpdGl6ZWRHdWFyZFZhbHVlKCkpO1xufVxuIl19