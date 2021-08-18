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
 * @template T
 * @param {?} objWithPropertyToExtract
 * @return {?}
 */
export function getClosureSafeProperty(objWithPropertyToExtract) {
    for (let key in objWithPropertyToExtract) {
        if (objWithPropertyToExtract[key] === (/** @type {?} */ (getClosureSafeProperty))) {
            return key;
        }
    }
    throw Error('Could not find renamed property on target object.');
}
/**
 * Sets properties on a target object from a source object, but only if
 * the property doesn't already exist on the target object.
 * @param {?} target The target to set properties on
 * @param {?} source The source of the property keys and values to set
 * @return {?}
 */
export function fillProperties(target, source) {
    for (const key in source) {
        if (source.hasOwnProperty(key) && !target.hasOwnProperty(key)) {
            target[key] = source[key];
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvcGVydHkuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9jb3JlL3NyYy91dGlsL3Byb3BlcnR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFRQSxNQUFNLFVBQVUsc0JBQXNCLENBQUksd0JBQTJCO0lBQ25FLEtBQUssSUFBSSxHQUFHLElBQUksd0JBQXdCLEVBQUU7UUFDeEMsSUFBSSx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsS0FBSyxtQkFBQSxzQkFBc0IsRUFBTyxFQUFFO1lBQ25FLE9BQU8sR0FBRyxDQUFDO1NBQ1o7S0FDRjtJQUNELE1BQU0sS0FBSyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7QUFDbkUsQ0FBQzs7Ozs7Ozs7QUFRRCxNQUFNLFVBQVUsY0FBYyxDQUFDLE1BQStCLEVBQUUsTUFBK0I7SUFDN0YsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUU7UUFDeEIsSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUM3RCxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzNCO0tBQ0Y7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2xvc3VyZVNhZmVQcm9wZXJ0eTxUPihvYmpXaXRoUHJvcGVydHlUb0V4dHJhY3Q6IFQpOiBzdHJpbmcge1xuICBmb3IgKGxldCBrZXkgaW4gb2JqV2l0aFByb3BlcnR5VG9FeHRyYWN0KSB7XG4gICAgaWYgKG9ialdpdGhQcm9wZXJ0eVRvRXh0cmFjdFtrZXldID09PSBnZXRDbG9zdXJlU2FmZVByb3BlcnR5IGFzIGFueSkge1xuICAgICAgcmV0dXJuIGtleTtcbiAgICB9XG4gIH1cbiAgdGhyb3cgRXJyb3IoJ0NvdWxkIG5vdCBmaW5kIHJlbmFtZWQgcHJvcGVydHkgb24gdGFyZ2V0IG9iamVjdC4nKTtcbn1cblxuLyoqXG4gKiBTZXRzIHByb3BlcnRpZXMgb24gYSB0YXJnZXQgb2JqZWN0IGZyb20gYSBzb3VyY2Ugb2JqZWN0LCBidXQgb25seSBpZlxuICogdGhlIHByb3BlcnR5IGRvZXNuJ3QgYWxyZWFkeSBleGlzdCBvbiB0aGUgdGFyZ2V0IG9iamVjdC5cbiAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCB0byBzZXQgcHJvcGVydGllcyBvblxuICogQHBhcmFtIHNvdXJjZSBUaGUgc291cmNlIG9mIHRoZSBwcm9wZXJ0eSBrZXlzIGFuZCB2YWx1ZXMgdG8gc2V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaWxsUHJvcGVydGllcyh0YXJnZXQ6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LCBzb3VyY2U6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KSB7XG4gIGZvciAoY29uc3Qga2V5IGluIHNvdXJjZSkge1xuICAgIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkoa2V5KSAmJiAhdGFyZ2V0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XG4gICAgfVxuICB9XG59XG4iXX0=