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
import { Pipe } from '@angular/core';
/**
 * \@ngModule CommonModule
 * \@description
 *
 * Converts a value into its JSON-format representation.  Useful for debugging.
 *
 * \@usageNotes
 *
 * The following component uses a JSON pipe to convert an object
 * to JSON format, and displays the string in both formats for comparison.
 *
 * {\@example common/pipes/ts/json_pipe.ts region='JsonPipe'}
 *
 * \@publicApi
 */
export class JsonPipe {
    /**
     * @param {?} value A value of any type to convert into a JSON-format string.
     * @return {?}
     */
    transform(value) { return JSON.stringify(value, null, 2); }
}
JsonPipe.decorators = [
    { type: Pipe, args: [{ name: 'json', pure: false },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbl9waXBlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvY29tbW9uL3NyYy9waXBlcy9qc29uX3BpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsSUFBSSxFQUFnQixNQUFNLGVBQWUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7OztBQWtCbEQsTUFBTSxPQUFPLFFBQVE7Ozs7O0lBSW5CLFNBQVMsQ0FBQyxLQUFVLElBQVksT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7WUFMekUsSUFBSSxTQUFDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1BpcGUsIFBpcGVUcmFuc2Zvcm19IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIENvbnZlcnRzIGEgdmFsdWUgaW50byBpdHMgSlNPTi1mb3JtYXQgcmVwcmVzZW50YXRpb24uICBVc2VmdWwgZm9yIGRlYnVnZ2luZy5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIFRoZSBmb2xsb3dpbmcgY29tcG9uZW50IHVzZXMgYSBKU09OIHBpcGUgdG8gY29udmVydCBhbiBvYmplY3RcbiAqIHRvIEpTT04gZm9ybWF0LCBhbmQgZGlzcGxheXMgdGhlIHN0cmluZyBpbiBib3RoIGZvcm1hdHMgZm9yIGNvbXBhcmlzb24uXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9qc29uX3BpcGUudHMgcmVnaW9uPSdKc29uUGlwZSd9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5AUGlwZSh7bmFtZTogJ2pzb24nLCBwdXJlOiBmYWxzZX0pXG5leHBvcnQgY2xhc3MgSnNvblBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB2YWx1ZSBBIHZhbHVlIG9mIGFueSB0eXBlIHRvIGNvbnZlcnQgaW50byBhIEpTT04tZm9ybWF0IHN0cmluZy5cbiAgICovXG4gIHRyYW5zZm9ybSh2YWx1ZTogYW55KTogc3RyaW5nIHsgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlLCBudWxsLCAyKTsgfVxufVxuIl19