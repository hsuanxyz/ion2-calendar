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
import { assertEqual } from './assert';
import { FLAGS } from './interfaces/view';
/**
 * If this is the first template pass, any ngOnInit or ngDoCheck hooks will be queued into
 * TView.initHooks during directiveCreate.
 *
 * The directive index and hook type are encoded into one number (1st bit: type, remaining bits:
 * directive index), then saved in the even indices of the initHooks array. The odd indices
 * hold the hook functions themselves.
 *
 * @param {?} index The index of the directive in LViewData
 * @param {?} onInit
 * @param {?} doCheck
 * @param {?} tView The current TView
 * @return {?}
 */
export function queueInitHooks(index, onInit, doCheck, tView) {
    ngDevMode &&
        assertEqual(tView.firstTemplatePass, true, 'Should only be called on first template pass');
    if (onInit) {
        (tView.initHooks || (tView.initHooks = [])).push(index, onInit);
    }
    if (doCheck) {
        (tView.initHooks || (tView.initHooks = [])).push(index, doCheck);
        (tView.checkHooks || (tView.checkHooks = [])).push(index, doCheck);
    }
}
/**
 * Loops through the directives on a node and queues all their hooks except ngOnInit
 * and ngDoCheck, which are queued separately in directiveCreate.
 * @param {?} flags
 * @param {?} tView
 * @return {?}
 */
export function queueLifecycleHooks(flags, tView) {
    if (tView.firstTemplatePass) {
        /** @type {?} */
        const start = flags >> 16 /* DirectiveStartingIndexShift */;
        /** @type {?} */
        const count = flags & 4095 /* DirectiveCountMask */;
        /** @type {?} */
        const end = start + count;
        // It's necessary to loop through the directives at elementEnd() (rather than processing in
        // directiveCreate) so we can preserve the current hook order. Content, view, and destroy
        // hooks for projected components and directives must be called *before* their hosts.
        for (let i = start; i < end; i++) {
            /** @type {?} */
            const def = (/** @type {?} */ (tView.data[i]));
            queueContentHooks(def, tView, i);
            queueViewHooks(def, tView, i);
            queueDestroyHooks(def, tView, i);
        }
    }
}
/**
 * Queues afterContentInit and afterContentChecked hooks on TView
 * @param {?} def
 * @param {?} tView
 * @param {?} i
 * @return {?}
 */
function queueContentHooks(def, tView, i) {
    if (def.afterContentInit) {
        (tView.contentHooks || (tView.contentHooks = [])).push(i, def.afterContentInit);
    }
    if (def.afterContentChecked) {
        (tView.contentHooks || (tView.contentHooks = [])).push(i, def.afterContentChecked);
        (tView.contentCheckHooks || (tView.contentCheckHooks = [])).push(i, def.afterContentChecked);
    }
}
/**
 * Queues afterViewInit and afterViewChecked hooks on TView
 * @param {?} def
 * @param {?} tView
 * @param {?} i
 * @return {?}
 */
function queueViewHooks(def, tView, i) {
    if (def.afterViewInit) {
        (tView.viewHooks || (tView.viewHooks = [])).push(i, def.afterViewInit);
    }
    if (def.afterViewChecked) {
        (tView.viewHooks || (tView.viewHooks = [])).push(i, def.afterViewChecked);
        (tView.viewCheckHooks || (tView.viewCheckHooks = [])).push(i, def.afterViewChecked);
    }
}
/**
 * Queues onDestroy hooks on TView
 * @param {?} def
 * @param {?} tView
 * @param {?} i
 * @return {?}
 */
function queueDestroyHooks(def, tView, i) {
    if (def.onDestroy != null) {
        (tView.destroyHooks || (tView.destroyHooks = [])).push(i, def.onDestroy);
    }
}
/**
 * Calls onInit and doCheck calls if they haven't already been called.
 *
 * @param {?} currentView The current view
 * @param {?} tView
 * @param {?} creationMode
 * @return {?}
 */
export function executeInitHooks(currentView, tView, creationMode) {
    if (currentView[FLAGS] & 16 /* RunInit */) {
        executeHooks(currentView, tView.initHooks, tView.checkHooks, creationMode);
        currentView[FLAGS] &= ~16 /* RunInit */;
    }
}
/**
 * Iterates over afterViewInit and afterViewChecked functions and calls them.
 *
 * @param {?} data
 * @param {?} allHooks
 * @param {?} checkHooks
 * @param {?} creationMode
 * @return {?}
 */
export function executeHooks(data, allHooks, checkHooks, creationMode) {
    /** @type {?} */
    const hooksToCall = creationMode ? allHooks : checkHooks;
    if (hooksToCall) {
        callHooks(data, hooksToCall);
    }
}
/**
 * Calls lifecycle hooks with their contexts, skipping init hooks if it's not
 * creation mode.
 *
 * @param {?} currentView The current view
 * @param {?} arr The array in which the hooks are found
 * @return {?}
 */
export function callHooks(currentView, arr) {
    for (let i = 0; i < arr.length; i += 2) {
        ((/** @type {?} */ (arr[i + 1]))).call(currentView[(/** @type {?} */ (arr[i]))]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9va3MuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2hvb2tzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUdyQyxPQUFPLEVBQUMsS0FBSyxFQUF5QyxNQUFNLG1CQUFtQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUFlaEYsTUFBTSxVQUFVLGNBQWMsQ0FDMUIsS0FBYSxFQUFFLE1BQTJCLEVBQUUsT0FBNEIsRUFBRSxLQUFZO0lBQ3hGLFNBQVM7UUFDTCxXQUFXLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUFFLElBQUksRUFBRSw4Q0FBOEMsQ0FBQyxDQUFDO0lBQy9GLElBQUksTUFBTSxFQUFFO1FBQ1YsQ0FBQyxLQUFLLENBQUMsU0FBUyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDakU7SUFFRCxJQUFJLE9BQU8sRUFBRTtRQUNYLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2pFLENBQUMsS0FBSyxDQUFDLFVBQVUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQ3BFO0FBQ0gsQ0FBQzs7Ozs7Ozs7QUFNRCxNQUFNLFVBQVUsbUJBQW1CLENBQUMsS0FBYSxFQUFFLEtBQVk7SUFDN0QsSUFBSSxLQUFLLENBQUMsaUJBQWlCLEVBQUU7O2NBQ3JCLEtBQUssR0FBRyxLQUFLLHdDQUEwQzs7Y0FDdkQsS0FBSyxHQUFHLEtBQUss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QyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDM0UsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLGlCQUFtQixDQUFDO0tBQzNDO0FBQ0gsQ0FBQzs7Ozs7Ozs7OztBQU9ELE1BQU0sVUFBVSxZQUFZLENBQ3hCLElBQWUsRUFBRSxRQUF5QixFQUFFLFVBQTJCLEVBQ3ZFLFlBQXFCOztVQUNqQixXQUFXLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFVBQVU7SUFDeEQsSUFBSSxXQUFXLEVBQUU7UUFDZixTQUFTLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQzlCO0FBQ0gsQ0FBQzs7Ozs7Ozs7O0FBU0QsTUFBTSxVQUFVLFNBQVMsQ0FBQyxXQUFrQixFQUFFLEdBQWE7SUFDekQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUN0QyxDQUFDLG1CQUFBLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsbUJBQUEsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFVLENBQUMsQ0FBQyxDQUFDO0tBQy9EO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHthc3NlcnRFcXVhbH0gZnJvbSAnLi9hc3NlcnQnO1xuaW1wb3J0IHtEaXJlY3RpdmVEZWZ9IGZyb20gJy4vaW50ZXJmYWNlcy9kZWZpbml0aW9uJztcbmltcG9ydCB7VE5vZGVGbGFnc30gZnJvbSAnLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtGTEFHUywgSG9va0RhdGEsIExWaWV3RGF0YSwgTFZpZXdGbGFncywgVFZpZXd9IGZyb20gJy4vaW50ZXJmYWNlcy92aWV3JztcblxuXG4vKipcbiAqIElmIHRoaXMgaXMgdGhlIGZpcnN0IHRlbXBsYXRlIHBhc3MsIGFueSBuZ09uSW5pdCBvciBuZ0RvQ2hlY2sgaG9va3Mgd2lsbCBiZSBxdWV1ZWQgaW50b1xuICogVFZpZXcuaW5pdEhvb2tzIGR1cmluZyBkaXJlY3RpdmVDcmVhdGUuXG4gKlxuICogVGhlIGRpcmVjdGl2ZSBpbmRleCBhbmQgaG9vayB0eXBlIGFyZSBlbmNvZGVkIGludG8gb25lIG51bWJlciAoMXN0IGJpdDogdHlwZSwgcmVtYWluaW5nIGJpdHM6XG4gKiBkaXJlY3RpdmUgaW5kZXgpLCB0aGVuIHNhdmVkIGluIHRoZSBldmVuIGluZGljZXMgb2YgdGhlIGluaXRIb29rcyBhcnJheS4gVGhlIG9kZCBpbmRpY2VzXG4gKiBob2xkIHRoZSBob29rIGZ1bmN0aW9ucyB0aGVtc2VsdmVzLlxuICpcbiAqIEBwYXJhbSBpbmRleCBUaGUgaW5kZXggb2YgdGhlIGRpcmVjdGl2ZSBpbiBMVmlld0RhdGFcbiAqIEBwYXJhbSBob29rcyBUaGUgc3RhdGljIGhvb2tzIG1hcCBvbiB0aGUgZGlyZWN0aXZlIGRlZlxuICogQHBhcmFtIHRWaWV3IFRoZSBjdXJyZW50IFRWaWV3XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBxdWV1ZUluaXRIb29rcyhcbiAgICBpbmRleDogbnVtYmVyLCBvbkluaXQ6ICgoKSA9PiB2b2lkKSB8IG51bGwsIGRvQ2hlY2s6ICgoKSA9PiB2b2lkKSB8IG51bGwsIHRWaWV3OiBUVmlldyk6IHZvaWQge1xuICBuZ0Rldk1vZGUgJiZcbiAgICAgIGFzc2VydEVxdWFsKHRWaWV3LmZpcnN0VGVtcGxhdGVQYXNzLCB0cnVlLCAnU2hvdWxkIG9ubHkgYmUgY2FsbGVkIG9uIGZpcnN0IHRlbXBsYXRlIHBhc3MnKTtcbiAgaWYgKG9uSW5pdCkge1xuICAgICh0Vmlldy5pbml0SG9va3MgfHwgKHRWaWV3LmluaXRIb29rcyA9IFtdKSkucHVzaChpbmRleCwgb25Jbml0KTtcbiAgfVxuXG4gIGlmIChkb0NoZWNrKSB7XG4gICAgKHRWaWV3LmluaXRIb29rcyB8fCAodFZpZXcuaW5pdEhvb2tzID0gW10pKS5wdXNoKGluZGV4LCBkb0NoZWNrKTtcbiAgICAodFZpZXcuY2hlY2tIb29rcyB8fCAodFZpZXcuY2hlY2tIb29rcyA9IFtdKSkucHVzaChpbmRleCwgZG9DaGVjayk7XG4gIH1cbn1cblxuLyoqXG4gKiBMb29wcyB0aHJvdWdoIHRoZSBkaXJlY3RpdmVzIG9uIGEgbm9kZSBhbmQgcXVldWVzIGFsbCB0aGVpciBob29rcyBleGNlcHQgbmdPbkluaXRcbiAqIGFuZCBuZ0RvQ2hlY2ssIHdoaWNoIGFyZSBxdWV1ZWQgc2VwYXJhdGVseSBpbiBkaXJlY3RpdmVDcmVhdGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBxdWV1ZUxpZmVjeWNsZUhvb2tzKGZsYWdzOiBudW1iZXIsIHRWaWV3OiBUVmlldyk6IHZvaWQge1xuICBpZiAodFZpZXcuZmlyc3RUZW1wbGF0ZVBhc3MpIHtcbiAgICBjb25zdCBzdGFydCA9IGZsYWdzID4+IFROb2RlRmxhZ3MuRGlyZWN0aXZlU3RhcnRpbmdJbmRleFNoaWZ0O1xuICAgIGNvbnN0IGNvdW50ID0gZmxhZ3MgJiBUTm9kZUZsYWdzLkRpcmVjdGl2ZUNvdW50TWFzaztcbiAgICBjb25zdCBlbmQgPSBzdGFydCArIGNvdW50O1xuXG4gICAgLy8gSXQncyBuZWNlc3NhcnkgdG8gbG9vcCB0aHJvdWdoIHRoZSBkaXJlY3RpdmVzIGF0IGVsZW1lbnRFbmQoKSAocmF0aGVyIHRoYW4gcHJvY2Vzc2luZyBpblxuICAgIC8vIGRpcmVjdGl2ZUNyZWF0ZSkgc28gd2UgY2FuIHByZXNlcnZlIHRoZSBjdXJyZW50IGhvb2sgb3JkZXIuIENvbnRlbnQsIHZpZXcsIGFuZCBkZXN0cm95XG4gICAgLy8gaG9va3MgZm9yIHByb2plY3RlZCBjb21wb25lbnRzIGFuZCBkaXJlY3RpdmVzIG11c3QgYmUgY2FsbGVkICpiZWZvcmUqIHRoZWlyIGhvc3RzLlxuICAgIGZvciAobGV0IGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICBjb25zdCBkZWYgPSB0Vmlldy5kYXRhW2ldIGFzIERpcmVjdGl2ZURlZjxhbnk+O1xuICAgICAgcXVldWVDb250ZW50SG9va3MoZGVmLCB0VmlldywgaSk7XG4gICAgICBxdWV1ZVZpZXdIb29rcyhkZWYsIHRWaWV3LCBpKTtcbiAgICAgIHF1ZXVlRGVzdHJveUhvb2tzKGRlZiwgdFZpZXcsIGkpO1xuICAgIH1cbiAgfVxufVxuXG4vKiogUXVldWVzIGFmdGVyQ29udGVudEluaXQgYW5kIGFmdGVyQ29udGVudENoZWNrZWQgaG9va3Mgb24gVFZpZXcgKi9cbmZ1bmN0aW9uIHF1ZXVlQ29udGVudEhvb2tzKGRlZjogRGlyZWN0aXZlRGVmPGFueT4sIHRWaWV3OiBUVmlldywgaTogbnVtYmVyKTogdm9pZCB7XG4gIGlmIChkZWYuYWZ0ZXJDb250ZW50SW5pdCkge1xuICAgICh0Vmlldy5jb250ZW50SG9va3MgfHwgKHRWaWV3LmNvbnRlbnRIb29rcyA9IFtdKSkucHVzaChpLCBkZWYuYWZ0ZXJDb250ZW50SW5pdCk7XG4gIH1cblxuICBpZiAoZGVmLmFmdGVyQ29udGVudENoZWNrZWQpIHtcbiAgICAodFZpZXcuY29udGVudEhvb2tzIHx8ICh0Vmlldy5jb250ZW50SG9va3MgPSBbXSkpLnB1c2goaSwgZGVmLmFmdGVyQ29udGVudENoZWNrZWQpO1xuICAgICh0Vmlldy5jb250ZW50Q2hlY2tIb29rcyB8fCAodFZpZXcuY29udGVudENoZWNrSG9va3MgPSBbXSkpLnB1c2goaSwgZGVmLmFmdGVyQ29udGVudENoZWNrZWQpO1xuICB9XG59XG5cbi8qKiBRdWV1ZXMgYWZ0ZXJWaWV3SW5pdCBhbmQgYWZ0ZXJWaWV3Q2hlY2tlZCBob29rcyBvbiBUVmlldyAqL1xuZnVuY3Rpb24gcXVldWVWaWV3SG9va3MoZGVmOiBEaXJlY3RpdmVEZWY8YW55PiwgdFZpZXc6IFRWaWV3LCBpOiBudW1iZXIpOiB2b2lkIHtcbiAgaWYgKGRlZi5hZnRlclZpZXdJbml0KSB7XG4gICAgKHRWaWV3LnZpZXdIb29rcyB8fCAodFZpZXcudmlld0hvb2tzID0gW10pKS5wdXNoKGksIGRlZi5hZnRlclZpZXdJbml0KTtcbiAgfVxuXG4gIGlmIChkZWYuYWZ0ZXJWaWV3Q2hlY2tlZCkge1xuICAgICh0Vmlldy52aWV3SG9va3MgfHwgKHRWaWV3LnZpZXdIb29rcyA9IFtdKSkucHVzaChpLCBkZWYuYWZ0ZXJWaWV3Q2hlY2tlZCk7XG4gICAgKHRWaWV3LnZpZXdDaGVja0hvb2tzIHx8ICh0Vmlldy52aWV3Q2hlY2tIb29rcyA9IFtdKSkucHVzaChpLCBkZWYuYWZ0ZXJWaWV3Q2hlY2tlZCk7XG4gIH1cbn1cblxuLyoqIFF1ZXVlcyBvbkRlc3Ryb3kgaG9va3Mgb24gVFZpZXcgKi9cbmZ1bmN0aW9uIHF1ZXVlRGVzdHJveUhvb2tzKGRlZjogRGlyZWN0aXZlRGVmPGFueT4sIHRWaWV3OiBUVmlldywgaTogbnVtYmVyKTogdm9pZCB7XG4gIGlmIChkZWYub25EZXN0cm95ICE9IG51bGwpIHtcbiAgICAodFZpZXcuZGVzdHJveUhvb2tzIHx8ICh0Vmlldy5kZXN0cm95SG9va3MgPSBbXSkpLnB1c2goaSwgZGVmLm9uRGVzdHJveSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDYWxscyBvbkluaXQgYW5kIGRvQ2hlY2sgY2FsbHMgaWYgdGhleSBoYXZlbid0IGFscmVhZHkgYmVlbiBjYWxsZWQuXG4gKlxuICogQHBhcmFtIGN1cnJlbnRWaWV3IFRoZSBjdXJyZW50IHZpZXdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4ZWN1dGVJbml0SG9va3MoXG4gICAgY3VycmVudFZpZXc6IExWaWV3RGF0YSwgdFZpZXc6IFRWaWV3LCBjcmVhdGlvbk1vZGU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgaWYgKGN1cnJlbnRWaWV3W0ZMQUdTXSAmIExWaWV3RmxhZ3MuUnVuSW5pdCkge1xuICAgIGV4ZWN1dGVIb29rcyhjdXJyZW50VmlldywgdFZpZXcuaW5pdEhvb2tzLCB0Vmlldy5jaGVja0hvb2tzLCBjcmVhdGlvbk1vZGUpO1xuICAgIGN1cnJlbnRWaWV3W0ZMQUdTXSAmPSB+TFZpZXdGbGFncy5SdW5Jbml0O1xuICB9XG59XG5cbi8qKlxuICogSXRlcmF0ZXMgb3ZlciBhZnRlclZpZXdJbml0IGFuZCBhZnRlclZpZXdDaGVja2VkIGZ1bmN0aW9ucyBhbmQgY2FsbHMgdGhlbS5cbiAqXG4gKiBAcGFyYW0gY3VycmVudFZpZXcgVGhlIGN1cnJlbnQgdmlld1xuICovXG5leHBvcnQgZnVuY3Rpb24gZXhlY3V0ZUhvb2tzKFxuICAgIGRhdGE6IExWaWV3RGF0YSwgYWxsSG9va3M6IEhvb2tEYXRhIHwgbnVsbCwgY2hlY2tIb29rczogSG9va0RhdGEgfCBudWxsLFxuICAgIGNyZWF0aW9uTW9kZTogYm9vbGVhbik6IHZvaWQge1xuICBjb25zdCBob29rc1RvQ2FsbCA9IGNyZWF0aW9uTW9kZSA/IGFsbEhvb2tzIDogY2hlY2tIb29rcztcbiAgaWYgKGhvb2tzVG9DYWxsKSB7XG4gICAgY2FsbEhvb2tzKGRhdGEsIGhvb2tzVG9DYWxsKTtcbiAgfVxufVxuXG4vKipcbiAqIENhbGxzIGxpZmVjeWNsZSBob29rcyB3aXRoIHRoZWlyIGNvbnRleHRzLCBza2lwcGluZyBpbml0IGhvb2tzIGlmIGl0J3Mgbm90XG4gKiBjcmVhdGlvbiBtb2RlLlxuICpcbiAqIEBwYXJhbSBjdXJyZW50VmlldyBUaGUgY3VycmVudCB2aWV3XG4gKiBAcGFyYW0gYXJyIFRoZSBhcnJheSBpbiB3aGljaCB0aGUgaG9va3MgYXJlIGZvdW5kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYWxsSG9va3MoY3VycmVudFZpZXc6IGFueVtdLCBhcnI6IEhvb2tEYXRhKTogdm9pZCB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgKGFycltpICsgMV0gYXMoKSA9PiB2b2lkKS5jYWxsKGN1cnJlbnRWaWV3W2FycltpXSBhcyBudW1iZXJdKTtcbiAgfVxufVxuIl19