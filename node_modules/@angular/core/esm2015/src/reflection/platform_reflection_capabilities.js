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
 * @record
 */
export function PlatformReflectionCapabilities() { }
if (false) {
    /**
     * @return {?}
     */
    PlatformReflectionCapabilities.prototype.isReflectionEnabled = function () { };
    /**
     * @param {?} type
     * @return {?}
     */
    PlatformReflectionCapabilities.prototype.factory = function (type) { };
    /**
     * @param {?} type
     * @param {?} lcProperty
     * @return {?}
     */
    PlatformReflectionCapabilities.prototype.hasLifecycleHook = function (type, lcProperty) { };
    /**
     * @param {?} type
     * @return {?}
     */
    PlatformReflectionCapabilities.prototype.guards = function (type) { };
    /**
     * Return a list of annotations/types for constructor parameters
     * @param {?} type
     * @return {?}
     */
    PlatformReflectionCapabilities.prototype.parameters = function (type) { };
    /**
     * Return a list of annotations declared on the class
     * @param {?} type
     * @return {?}
     */
    PlatformReflectionCapabilities.prototype.annotations = function (type) { };
    /**
     * Return a object literal which describes the annotations on Class fields/properties.
     * @param {?} typeOrFunc
     * @return {?}
     */
    PlatformReflectionCapabilities.prototype.propMetadata = function (typeOrFunc) { };
    /**
     * @param {?} name
     * @return {?}
     */
    PlatformReflectionCapabilities.prototype.getter = function (name) { };
    /**
     * @param {?} name
     * @return {?}
     */
    PlatformReflectionCapabilities.prototype.setter = function (name) { };
    /**
     * @param {?} name
     * @return {?}
     */
    PlatformReflectionCapabilities.prototype.method = function (name) { };
    /**
     * @param {?} type
     * @return {?}
     */
    PlatformReflectionCapabilities.prototype.importUri = function (type) { };
    /**
     * @param {?} type
     * @return {?}
     */
    PlatformReflectionCapabilities.prototype.resourceUri = function (type) { };
    /**
     * @param {?} name
     * @param {?} moduleUrl
     * @param {?} members
     * @param {?} runtime
     * @return {?}
     */
    PlatformReflectionCapabilities.prototype.resolveIdentifier = function (name, moduleUrl, members, runtime) { };
    /**
     * @param {?} enumIdentifier
     * @param {?} name
     * @return {?}
     */
    PlatformReflectionCapabilities.prototype.resolveEnum = function (enumIdentifier, name) { };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1fcmVmbGVjdGlvbl9jYXBhYmlsaXRpZXMuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9jb3JlL3NyYy9yZWZsZWN0aW9uL3BsYXRmb3JtX3JlZmxlY3Rpb25fY2FwYWJpbGl0aWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBV0Esb0RBMkJDOzs7OztJQTFCQywrRUFBK0I7Ozs7O0lBQy9CLHVFQUFtQzs7Ozs7O0lBQ25DLDRGQUF5RDs7Ozs7SUFDekQsc0VBQXdDOzs7Ozs7SUFLeEMsMEVBQXFDOzs7Ozs7SUFLckMsMkVBQW9DOzs7Ozs7SUFLcEMsa0ZBQTREOzs7OztJQUM1RCxzRUFBK0I7Ozs7O0lBQy9CLHNFQUErQjs7Ozs7SUFDL0Isc0VBQStCOzs7OztJQUMvQix5RUFBbUM7Ozs7O0lBQ25DLDJFQUFxQzs7Ozs7Ozs7SUFDckMsOEdBQXlGOzs7Ozs7SUFDekYsMkZBQW9EIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1R5cGV9IGZyb20gJy4uL3R5cGUnO1xuaW1wb3J0IHtHZXR0ZXJGbiwgTWV0aG9kRm4sIFNldHRlckZufSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGludGVyZmFjZSBQbGF0Zm9ybVJlZmxlY3Rpb25DYXBhYmlsaXRpZXMge1xuICBpc1JlZmxlY3Rpb25FbmFibGVkKCk6IGJvb2xlYW47XG4gIGZhY3RvcnkodHlwZTogVHlwZTxhbnk+KTogRnVuY3Rpb247XG4gIGhhc0xpZmVjeWNsZUhvb2sodHlwZTogYW55LCBsY1Byb3BlcnR5OiBzdHJpbmcpOiBib29sZWFuO1xuICBndWFyZHModHlwZTogYW55KToge1trZXk6IHN0cmluZ106IGFueX07XG5cbiAgLyoqXG4gICAqIFJldHVybiBhIGxpc3Qgb2YgYW5ub3RhdGlvbnMvdHlwZXMgZm9yIGNvbnN0cnVjdG9yIHBhcmFtZXRlcnNcbiAgICovXG4gIHBhcmFtZXRlcnModHlwZTogVHlwZTxhbnk+KTogYW55W11bXTtcblxuICAvKipcbiAgICogUmV0dXJuIGEgbGlzdCBvZiBhbm5vdGF0aW9ucyBkZWNsYXJlZCBvbiB0aGUgY2xhc3NcbiAgICovXG4gIGFubm90YXRpb25zKHR5cGU6IFR5cGU8YW55Pik6IGFueVtdO1xuXG4gIC8qKlxuICAgKiBSZXR1cm4gYSBvYmplY3QgbGl0ZXJhbCB3aGljaCBkZXNjcmliZXMgdGhlIGFubm90YXRpb25zIG9uIENsYXNzIGZpZWxkcy9wcm9wZXJ0aWVzLlxuICAgKi9cbiAgcHJvcE1ldGFkYXRhKHR5cGVPckZ1bmM6IFR5cGU8YW55Pik6IHtba2V5OiBzdHJpbmddOiBhbnlbXX07XG4gIGdldHRlcihuYW1lOiBzdHJpbmcpOiBHZXR0ZXJGbjtcbiAgc2V0dGVyKG5hbWU6IHN0cmluZyk6IFNldHRlckZuO1xuICBtZXRob2QobmFtZTogc3RyaW5nKTogTWV0aG9kRm47XG4gIGltcG9ydFVyaSh0eXBlOiBUeXBlPGFueT4pOiBzdHJpbmc7XG4gIHJlc291cmNlVXJpKHR5cGU6IFR5cGU8YW55Pik6IHN0cmluZztcbiAgcmVzb2x2ZUlkZW50aWZpZXIobmFtZTogc3RyaW5nLCBtb2R1bGVVcmw6IHN0cmluZywgbWVtYmVyczogc3RyaW5nW10sIHJ1bnRpbWU6IGFueSk6IGFueTtcbiAgcmVzb2x2ZUVudW0oZW51bUlkZW50aWZpZXI6IGFueSwgbmFtZTogc3RyaW5nKTogYW55O1xufVxuIl19