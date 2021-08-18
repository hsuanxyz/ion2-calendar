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
/** @enum {number} */
const ChangeDetectionStrategy = {
    /**
     * Use the `CheckOnce` strategy, meaning that automatic change detection is deactivated
     * until reactivated by setting the strategy to `Default` (`CheckAlways`).
     * Change detection can still be explictly invoked.
     */
    OnPush: 0,
    /**
     * Use the default `CheckAlways` strategy, in which change detection is automatic until
     * explicitly deactivated.
     */
    Default: 1,
};
export { ChangeDetectionStrategy };
ChangeDetectionStrategy[ChangeDetectionStrategy.OnPush] = 'OnPush';
ChangeDetectionStrategy[ChangeDetectionStrategy.Default] = 'Default';
/** @enum {number} */
const ChangeDetectorStatus = {
    /**
     * A state in which, after calling `detectChanges()`, the change detector
     * state becomes `Checked`, and must be explicitly invoked or reactivated.
     */
    CheckOnce: 0,
    /**
     * A state in which change detection is skipped until the change detector mode
     * becomes `CheckOnce`.
     */
    Checked: 1,
    /**
     * A state in which change detection continues automatically until explictly
     * deactivated.
     */
    CheckAlways: 2,
    /**
     * A state in which a change detector sub tree is not a part of the main tree and
     * should be skipped.
     */
    Detached: 3,
    /**
     * Indicates that the change detector encountered an error checking a binding
     * or calling a directive lifecycle method and is now in an inconsistent state. Change
     * detectors in this state do not detect changes.
     */
    Errored: 4,
    /**
     * Indicates that the change detector has been destroyed.
     */
    Destroyed: 5,
};
export { ChangeDetectorStatus };
ChangeDetectorStatus[ChangeDetectorStatus.CheckOnce] = 'CheckOnce';
ChangeDetectorStatus[ChangeDetectorStatus.Checked] = 'Checked';
ChangeDetectorStatus[ChangeDetectorStatus.CheckAlways] = 'CheckAlways';
ChangeDetectorStatus[ChangeDetectorStatus.Detached] = 'Detached';
ChangeDetectorStatus[ChangeDetectorStatus.Errored] = 'Errored';
ChangeDetectorStatus[ChangeDetectorStatus.Destroyed] = 'Destroyed';
/**
 * Reports whether a given strategy is currently the default for change detection.
 * @see `ChangeDetectorStatus` / `ChangeDetectorRef`
 * @param {?} changeDetectionStrategy The strategy to check.
 * @return {?} True if the given strategy is the current default, false otherwise.
 */
export function isDefaultChangeDetectionStrategy(changeDetectionStrategy) {
    return changeDetectionStrategy == null ||
        changeDetectionStrategy === ChangeDetectionStrategy.Default;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvY29yZS9zcmMvY2hhbmdlX2RldGVjdGlvbi9jb25zdGFudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQWdCRTs7OztPQUlHO0lBQ0gsU0FBVTtJQUVWOzs7T0FHRztJQUNILFVBQVc7Ozs7Ozs7SUFRWDs7O09BR0c7SUFDSCxZQUFTO0lBRVQ7OztPQUdHO0lBQ0gsVUFBTztJQUVQOzs7T0FHRztJQUNILGNBQVc7SUFFWDs7O09BR0c7SUFDSCxXQUFRO0lBRVI7Ozs7T0FJRztJQUNILFVBQU87SUFFUDs7T0FFRztJQUNILFlBQVM7Ozs7Ozs7Ozs7Ozs7OztBQVVYLE1BQU0sVUFBVSxnQ0FBZ0MsQ0FBQyx1QkFBZ0Q7SUFFL0YsT0FBTyx1QkFBdUIsSUFBSSxJQUFJO1FBQ2xDLHVCQUF1QixLQUFLLHVCQUF1QixDQUFDLE9BQU8sQ0FBQztBQUNsRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5cbi8qKlxuICogVGhlIHN0cmF0ZWd5IHRoYXQgdGhlIGRlZmF1bHQgY2hhbmdlIGRldGVjdG9yIHVzZXMgdG8gZGV0ZWN0IGNoYW5nZXMuXG4gKiBXaGVuIHNldCwgdGFrZXMgZWZmZWN0IHRoZSBuZXh0IHRpbWUgY2hhbmdlIGRldGVjdGlvbiBpcyB0cmlnZ2VyZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSB7XG4gIC8qKlxuICAgKiBVc2UgdGhlIGBDaGVja09uY2VgIHN0cmF0ZWd5LCBtZWFuaW5nIHRoYXQgYXV0b21hdGljIGNoYW5nZSBkZXRlY3Rpb24gaXMgZGVhY3RpdmF0ZWRcbiAgICogdW50aWwgcmVhY3RpdmF0ZWQgYnkgc2V0dGluZyB0aGUgc3RyYXRlZ3kgdG8gYERlZmF1bHRgIChgQ2hlY2tBbHdheXNgKS5cbiAgICogQ2hhbmdlIGRldGVjdGlvbiBjYW4gc3RpbGwgYmUgZXhwbGljdGx5IGludm9rZWQuXG4gICAqL1xuICBPblB1c2ggPSAwLFxuXG4gIC8qKlxuICAgKiBVc2UgdGhlIGRlZmF1bHQgYENoZWNrQWx3YXlzYCBzdHJhdGVneSwgaW4gd2hpY2ggY2hhbmdlIGRldGVjdGlvbiBpcyBhdXRvbWF0aWMgdW50aWxcbiAgICogZXhwbGljaXRseSBkZWFjdGl2YXRlZC5cbiAgICovXG4gIERlZmF1bHQgPSAxLFxufVxuXG4vKipcbiAqIERlZmluZXMgdGhlIHBvc3NpYmxlIHN0YXRlcyBvZiB0aGUgZGVmYXVsdCBjaGFuZ2UgZGV0ZWN0b3IuXG4gKiBAc2VlIGBDaGFuZ2VEZXRlY3RvclJlZmBcbiAqL1xuZXhwb3J0IGVudW0gQ2hhbmdlRGV0ZWN0b3JTdGF0dXMge1xuICAvKipcbiAgICogQSBzdGF0ZSBpbiB3aGljaCwgYWZ0ZXIgY2FsbGluZyBgZGV0ZWN0Q2hhbmdlcygpYCwgdGhlIGNoYW5nZSBkZXRlY3RvclxuICAgKiBzdGF0ZSBiZWNvbWVzIGBDaGVja2VkYCwgYW5kIG11c3QgYmUgZXhwbGljaXRseSBpbnZva2VkIG9yIHJlYWN0aXZhdGVkLlxuICAgKi9cbiAgQ2hlY2tPbmNlLFxuXG4gIC8qKlxuICAgKiBBIHN0YXRlIGluIHdoaWNoIGNoYW5nZSBkZXRlY3Rpb24gaXMgc2tpcHBlZCB1bnRpbCB0aGUgY2hhbmdlIGRldGVjdG9yIG1vZGVcbiAgICogYmVjb21lcyBgQ2hlY2tPbmNlYC5cbiAgICovXG4gIENoZWNrZWQsXG5cbiAgLyoqXG4gICAqIEEgc3RhdGUgaW4gd2hpY2ggY2hhbmdlIGRldGVjdGlvbiBjb250aW51ZXMgYXV0b21hdGljYWxseSB1bnRpbCBleHBsaWN0bHlcbiAgICogZGVhY3RpdmF0ZWQuXG4gICAqL1xuICBDaGVja0Fsd2F5cyxcblxuICAvKipcbiAgICogQSBzdGF0ZSBpbiB3aGljaCBhIGNoYW5nZSBkZXRlY3RvciBzdWIgdHJlZSBpcyBub3QgYSBwYXJ0IG9mIHRoZSBtYWluIHRyZWUgYW5kXG4gICAqIHNob3VsZCBiZSBza2lwcGVkLlxuICAgKi9cbiAgRGV0YWNoZWQsXG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3IgZW5jb3VudGVyZWQgYW4gZXJyb3IgY2hlY2tpbmcgYSBiaW5kaW5nXG4gICAqIG9yIGNhbGxpbmcgYSBkaXJlY3RpdmUgbGlmZWN5Y2xlIG1ldGhvZCBhbmQgaXMgbm93IGluIGFuIGluY29uc2lzdGVudCBzdGF0ZS4gQ2hhbmdlXG4gICAqIGRldGVjdG9ycyBpbiB0aGlzIHN0YXRlIGRvIG5vdCBkZXRlY3QgY2hhbmdlcy5cbiAgICovXG4gIEVycm9yZWQsXG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3IgaGFzIGJlZW4gZGVzdHJveWVkLlxuICAgKi9cbiAgRGVzdHJveWVkLFxufVxuXG4vKipcbiAqIFJlcG9ydHMgd2hldGhlciBhIGdpdmVuIHN0cmF0ZWd5IGlzIGN1cnJlbnRseSB0aGUgZGVmYXVsdCBmb3IgY2hhbmdlIGRldGVjdGlvbi5cbiAqIEBwYXJhbSBjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSBUaGUgc3RyYXRlZ3kgdG8gY2hlY2suXG4gKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBnaXZlbiBzdHJhdGVneSBpcyB0aGUgY3VycmVudCBkZWZhdWx0LCBmYWxzZSBvdGhlcndpc2UuXG4gKiBAc2VlIGBDaGFuZ2VEZXRlY3RvclN0YXR1c2BcbiAqIEBzZWUgYENoYW5nZURldGVjdG9yUmVmYFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3koY2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3k6IENoYW5nZURldGVjdGlvblN0cmF0ZWd5KTpcbiAgICBib29sZWFuIHtcbiAgcmV0dXJuIGNoYW5nZURldGVjdGlvblN0cmF0ZWd5ID09IG51bGwgfHxcbiAgICAgIGNoYW5nZURldGVjdGlvblN0cmF0ZWd5ID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0O1xufVxuIl19