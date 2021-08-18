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
const I18nMutateOpCode = {
    /// Stores shift amount for bits 17-3 that contain reference index.
    SHIFT_REF: 3,
    /// Stores shift amount for bits 31-17 that contain parent index.
    SHIFT_PARENT: 17,
    /// Mask for OpCode
    MASK_OPCODE: 7,
    /// Mask for reference index.
    MASK_REF: 136,
    /// OpCode to select a node. (next OpCode will contain the operation.)
    Select: 0,
    /// OpCode to append the current node to `PARENT`.
    AppendChild: 1,
    /// OpCode to insert the current node to `PARENT` before `REF`.
    InsertBefore: 2,
    /// OpCode to remove the `REF` node from `PARENT`.
    Remove: 3,
    /// OpCode to set the attribute of a node.
    Attr: 4,
    /// OpCode to simulate elementEnd()
    ElementEnd: 5,
    /// OpCode to read the remove OpCodes for the nested ICU
    RemoveNestedIcu: 6,
};
export { I18nMutateOpCode };
/**
 * Marks that the next string is for element.
 *
 * See `I18nMutateOpCodes` documentation.
 * @type {?}
 */
export const ELEMENT_MARKER = {
    marker: 'element'
};
// WARNING: interface has both a type and a value, skipping emit
/**
 * Marks that the next string is for comment.
 *
 * See `I18nMutateOpCodes` documentation.
 * @type {?}
 */
export const COMMENT_MARKER = {
    marker: 'comment'
};
// WARNING: interface has both a type and a value, skipping emit
/**
 * Array storing OpCode for dynamically creating `i18n` blocks.
 *
 * Example:
 * ```
 * <I18nCreateOpCode>[
 *   // For adding text nodes
 *   // ---------------------
 *   // Equivalent to:
 *   //   const node = lViewData[index++] = document.createTextNode('abc');
 *   //   lViewData[1].insertBefore(node, lViewData[2]);
 *   'abc', 1 << SHIFT_PARENT | 2 << SHIFT_REF | InsertBefore,
 *
 *   // Equivalent to:
 *   //   const node = lViewData[index++] = document.createTextNode('xyz');
 *   //   lViewData[1].appendChild(node);
 *   'xyz', 1 << SHIFT_PARENT | AppendChild,
 *
 *   // For adding element nodes
 *   // ---------------------
 *   // Equivalent to:
 *   //   const node = lViewData[index++] = document.createElement('div');
 *   //   lViewData[1].insertBefore(node, lViewData[2]);
 *   ELEMENT_MARKER, 'div', 1 << SHIFT_PARENT | 2 << SHIFT_REF | InsertBefore,
 *
 *   // Equivalent to:
 *   //   const node = lViewData[index++] = document.createElement('div');
 *   //   lViewData[1].appendChild(node);
 *   ELEMENT_MARKER, 'div', 1 << SHIFT_PARENT | AppendChild,
 *
 *   // For adding comment nodes
 *   // ---------------------
 *   // Equivalent to:
 *   //   const node = lViewData[index++] = document.createComment('');
 *   //   lViewData[1].insertBefore(node, lViewData[2]);
 *   COMMENT_MARKER, '', 1 << SHIFT_PARENT | 2 << SHIFT_REF | InsertBefore,
 *
 *   // Equivalent to:
 *   //   const node = lViewData[index++] = document.createComment('');
 *   //   lViewData[1].appendChild(node);
 *   COMMENT_MARKER, '', 1 << SHIFT_PARENT | AppendChild,
 *
 *   // For moving existing nodes to a different location
 *   // --------------------------------------------------
 *   // Equivalent to:
 *   //   const node = lViewData[1];
 *   //   lViewData[2].insertBefore(node, lViewData[3]);
 *   1 << SHIFT_REF | Select, 2 << SHIFT_PARENT | 3 << SHIFT_REF | InsertBefore,
 *
 *   // Equivalent to:
 *   //   const node = lViewData[1];
 *   //   lViewData[2].appendChild(node);
 *   1 << SHIFT_REF | Select, 2 << SHIFT_PARENT | AppendChild,
 *
 *   // For removing existing nodes
 *   // --------------------------------------------------
 *   //   const node = lViewData[1];
 *   //   removeChild(tView.data(1), node, lViewData);
 *   1 << SHIFT_REF | Remove,
 *
 *   // For writing attributes
 *   // --------------------------------------------------
 *   //   const node = lViewData[1];
 *   //   node.setAttribute('attr', 'value');
 *   1 << SHIFT_REF | Select, 'attr', 'value'
 *            // NOTE: Select followed by two string (vs select followed by OpCode)
 * ];
 * ```
 * NOTE:
 *   - `index` is initial location where the extra nodes should be stored in the EXPANDO section of
 * `LVIewData`.
 *
 * See: `applyI18nCreateOpCodes`;
 * @record
 */
export function I18nMutateOpCodes() { }
/** @enum {number} */
const I18nUpdateOpCode = {
    /// Stores shift amount for bits 17-2 that contain reference index.
    SHIFT_REF: 2,
    /// Stores shift amount for bits 31-17 that contain which ICU in i18n block are we referring to.
    SHIFT_ICU: 17,
    /// Mask for OpCode
    MASK_OPCODE: 3,
    /// Mask for reference index.
    MASK_REF: 68,
    /// OpCode to update a text node.
    Text: 0,
    /// OpCode to update a attribute of a node.
    Attr: 1,
    /// OpCode to switch the current ICU case.
    IcuSwitch: 2,
    /// OpCode to update the current ICU case.
    IcuUpdate: 3,
};
export { I18nUpdateOpCode };
/**
 * Stores DOM operations which need to be applied to update DOM render tree due to changes in
 * expressions.
 *
 * The basic idea is that `i18nExp` OpCodes capture expression changes and update a change
 * mask bit. (Bit 1 for expression 1, bit 2 for expression 2 etc..., bit 32 for expression 32 and
 * higher.) The OpCodes then compare its own change mask against the expression change mask to
 * determine if the OpCodes should execute.
 *
 * These OpCodes can be used by both the i18n block as well as ICU sub-block.
 *
 * ## Example
 *
 * Assume
 * ```
 *   if (rf & RenderFlags.Update) {
 *    i18nExp(bind(ctx.exp1)); // If changed set mask bit 1
 *    i18nExp(bind(ctx.exp2)); // If changed set mask bit 2
 *    i18nExp(bind(ctx.exp3)); // If changed set mask bit 3
 *    i18nExp(bind(ctx.exp4)); // If changed set mask bit 4
 *    i18nApply(0);            // Apply all changes by executing the OpCodes.
 *  }
 * ```
 * We can assume that each call to `i18nExp` sets an internal `changeMask` bit depending on the
 * index of `i18nExp`.
 *
 * OpCodes
 * ```
 * <I18nUpdateOpCodes>[
 *   // The following OpCodes represent: `<div i18n-title="pre{{exp1}}in{{exp2}}post">`
 *   // If `changeMask & 0b11`
 *   //        has changed then execute update OpCodes.
 *   //        has NOT changed then skip `7` values and start processing next OpCodes.
 *   0b11, 7,
 *   // Concatenate `newValue = 'pre'+lViewData[bindIndex-4]+'in'+lViewData[bindIndex-3]+'post';`.
 *   'pre', -4, 'in', -3, 'post',
 *   // Update attribute: `elementAttribute(1, 'title', sanitizerFn(newValue));`
 *   1 << SHIFT_REF | Attr, 'title', sanitizerFn,
 *
 *   // The following OpCodes represent: `<div i18n>Hello {{exp3}}!">`
 *   // If `changeMask & 0b100`
 *   //        has changed then execute update OpCodes.
 *   //        has NOT changed then skip `4` values and start processing next OpCodes.
 *   0b100, 4,
 *   // Concatenate `newValue = 'Hello ' + lViewData[bindIndex -2] + '!';`.
 *   'Hello ', -2, '!',
 *   // Update text: `lViewData[1].textContent = newValue;`
 *   1 << SHIFT_REF | Text,
 *
 *   // The following OpCodes represent: `<div i18n>{exp4, plural, ... }">`
 *   // If `changeMask & 0b1000`
 *   //        has changed then execute update OpCodes.
 *   //        has NOT changed then skip `4` values and start processing next OpCodes.
 *   0b1000, 4,
 *   // Concatenate `newValue = lViewData[bindIndex -1];`.
 *   -1,
 *   // Switch ICU: `icuSwitchCase(lViewData[1], 0, newValue);`
 *   0 << SHIFT_ICU | 1 << SHIFT_REF | IcuSwitch,
 *
 *   // Note `changeMask & -1` is always true, so the IcuUpdate will always execute.
 *   -1, 1,
 *   // Update ICU: `icuUpdateCase(lViewData[1], 0);`
 *   0 << SHIFT_ICU | 1 << SHIFT_REF | IcuUpdate,
 *
 * ];
 * ```
 *
 * @record
 */
export function I18nUpdateOpCodes() { }
/**
 * Store information for the i18n translation block.
 * @record
 */
export function TI18n() { }
if (false) {
    /**
     * Number of slots to allocate in expando.
     *
     * This is the max number of DOM elements which will be created by this i18n + ICU blocks. When
     * the DOM elements are being created they are stored in the EXPANDO, so that update OpCodes can
     * write into them.
     * @type {?}
     */
    TI18n.prototype.vars;
    /**
     * Index in EXPANDO where the i18n stores its DOM nodes.
     *
     * When the bindings are processed by the `i18nEnd` instruction it is necessary to know where the
     * newly created DOM nodes will be inserted.
     * @type {?}
     */
    TI18n.prototype.expandoStartIndex;
    /**
     * A set of OpCodes which will create the Text Nodes and ICU anchors for the translation blocks.
     *
     * NOTE: The ICU anchors are filled in with ICU Update OpCode.
     * @type {?}
     */
    TI18n.prototype.create;
    /**
     * A set of OpCodes which will be executed on each change detection to determine if any changes to
     * DOM are required.
     * @type {?}
     */
    TI18n.prototype.update;
    /**
     * A list of ICUs in a translation block (or `null` if block has no ICUs).
     *
     * Example:
     * Given: `<div i18n>You have {count, plural, ...} and {state, switch, ...}</div>`
     * There would be 2 ICUs in this array.
     *   1. `{count, plural, ...}`
     *   2. `{state, switch, ...}`
     * @type {?}
     */
    TI18n.prototype.icus;
}
/** @enum {number} */
const IcuType = {
    select: 0,
    plural: 1,
};
export { IcuType };
/**
 * @record
 */
export function TIcu() { }
if (false) {
    /**
     * Defines the ICU type of `select` or `plural`
     * @type {?}
     */
    TIcu.prototype.type;
    /**
     * Number of slots to allocate in expando for each case.
     *
     * This is the max number of DOM elements which will be created by this i18n + ICU blocks. When
     * the DOM elements are being created they are stored in the EXPANDO, so that update OpCodes can
     * write into them.
     * @type {?}
     */
    TIcu.prototype.vars;
    /**
     * An optional array of child/sub ICUs.
     *
     * In case of nested ICUs such as:
     * ```
     * {�0�, plural,
     *   =0 {zero}
     *   other {�0� {�1�, select,
     *                     cat {cats}
     *                     dog {dogs}
     *                     other {animals}
     *                   }!
     *   }
     * }
     * ```
     * When the parent ICU is changing it must clean up child ICUs as well. For this reason it needs
     * to know which child ICUs to run clean up for as well.
     *
     * In the above example this would be:
     * ```
     * [
     *   [],   // `=0` has no sub ICUs
     *   [1],  // `other` has one subICU at `1`st index.
     * ]
     * ```
     *
     * The reason why it is Array of Arrays is because first array represents the case, and second
     * represents the child ICUs to clean up. There may be more than one child ICUs per case.
     * @type {?}
     */
    TIcu.prototype.childIcus;
    /**
     * Index in EXPANDO where the i18n stores its DOM nodes.
     *
     * When the bindings are processed by the `i18nEnd` instruction it is necessary to know where the
     * newly created DOM nodes will be inserted.
     * @type {?}
     */
    TIcu.prototype.expandoStartIndex;
    /**
     * A list of case values which the current ICU will try to match.
     *
     * The last value is `other`
     * @type {?}
     */
    TIcu.prototype.cases;
    /**
     * A set of OpCodes to apply in order to build up the DOM render tree for the ICU
     * @type {?}
     */
    TIcu.prototype.create;
    /**
     * A set of OpCodes to apply in order to destroy the DOM render tree for the ICU.
     * @type {?}
     */
    TIcu.prototype.remove;
    /**
     * A set of OpCodes to apply in order to update the DOM render tree for the ICU bindings.
     * @type {?}
     */
    TIcu.prototype.update;
}
// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
/** @type {?} */
export const unusedValueExportToPlacateAjd = 1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bi5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaW50ZXJmYWNlcy9pMThuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFxQkUsbUVBQW1FO0lBQ25FLFlBQWE7SUFDYixpRUFBaUU7SUFDakUsZ0JBQWlCO0lBQ2pCLG1CQUFtQjtJQUNuQixjQUFtQjtJQUNuQiw2QkFBNkI7SUFDN0IsYUFBc0M7SUFFdEMsc0VBQXNFO0lBQ3RFLFNBQWM7SUFDZCxrREFBa0Q7SUFDbEQsY0FBbUI7SUFDbkIsK0RBQStEO0lBQy9ELGVBQW9CO0lBQ3BCLGtEQUFrRDtJQUNsRCxTQUFjO0lBQ2QsMENBQTBDO0lBQzFDLE9BQVk7SUFDWixtQ0FBbUM7SUFDbkMsYUFBa0I7SUFDbEIsd0RBQXdEO0lBQ3hELGtCQUF1Qjs7Ozs7Ozs7O0FBUXpCLE1BQU0sT0FBTyxjQUFjLEdBQW1CO0lBQzVDLE1BQU0sRUFBRSxTQUFTO0NBQ2xCOzs7Ozs7OztBQVFELE1BQU0sT0FBTyxjQUFjLEdBQW1CO0lBQzVDLE1BQU0sRUFBRSxTQUFTO0NBQ2xCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQThFRCx1Q0FDQzs7O0lBR0MsbUVBQW1FO0lBQ25FLFlBQWE7SUFDYixnR0FBZ0c7SUFDaEcsYUFBYztJQUNkLG1CQUFtQjtJQUNuQixjQUFrQjtJQUNsQiw2QkFBNkI7SUFDN0IsWUFBc0M7SUFFdEMsaUNBQWlDO0lBQ2pDLE9BQVc7SUFDWCwyQ0FBMkM7SUFDM0MsT0FBVztJQUNYLDBDQUEwQztJQUMxQyxZQUFnQjtJQUNoQiwwQ0FBMEM7SUFDMUMsWUFBZ0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXVFbEIsdUNBQW1GOzs7OztBQUtuRiwyQkF5Q0M7Ozs7Ozs7Ozs7SUFqQ0MscUJBQWE7Ozs7Ozs7O0lBUWIsa0NBQTBCOzs7Ozs7O0lBTzFCLHVCQUEwQjs7Ozs7O0lBTTFCLHVCQUEwQjs7Ozs7Ozs7Ozs7SUFXMUIscUJBQWtCOzs7O0lBT2xCLFNBQVU7SUFDVixTQUFVOzs7Ozs7QUFHWiwwQkEyRUM7Ozs7OztJQXZFQyxvQkFBYzs7Ozs7Ozs7O0lBU2Qsb0JBQWU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUErQmYseUJBQXNCOzs7Ozs7OztJQVF0QixpQ0FBMEI7Ozs7Ozs7SUFPMUIscUJBQWE7Ozs7O0lBS2Isc0JBQTRCOzs7OztJQUs1QixzQkFBNEI7Ozs7O0lBSzVCLHNCQUE0Qjs7Ozs7QUFLOUIsTUFBTSxPQUFPLDZCQUE2QixHQUFHLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogYEkxOG5NdXRhdGVPcENvZGVgIGRlZmluZXMgT3BDb2RlcyBmb3IgYEkxOG5NdXRhdGVPcENvZGVzYCBhcnJheS5cbiAqXG4gKiBPcENvZGVzIGNvbnRhaW4gdGhyZWUgcGFydHM6XG4gKiAgMSkgUGFyZW50IG5vZGUgaW5kZXggb2Zmc2V0LlxuICogIDIpIFJlZmVyZW5jZSBub2RlIGluZGV4IG9mZnNldC5cbiAqICAzKSBUaGUgT3BDb2RlIHRvIGV4ZWN1dGUuXG4gKlxuICogU2VlOiBgSTE4bkNyZWF0ZU9wQ29kZXNgIGZvciBleGFtcGxlIG9mIHVzYWdlLlxuICovXG5pbXBvcnQge1Nhbml0aXplckZufSBmcm9tICcuL3Nhbml0aXphdGlvbic7XG5cbmV4cG9ydCBjb25zdCBlbnVtIEkxOG5NdXRhdGVPcENvZGUge1xuICAvLy8gU3RvcmVzIHNoaWZ0IGFtb3VudCBmb3IgYml0cyAxNy0zIHRoYXQgY29udGFpbiByZWZlcmVuY2UgaW5kZXguXG4gIFNISUZUX1JFRiA9IDMsXG4gIC8vLyBTdG9yZXMgc2hpZnQgYW1vdW50IGZvciBiaXRzIDMxLTE3IHRoYXQgY29udGFpbiBwYXJlbnQgaW5kZXguXG4gIFNISUZUX1BBUkVOVCA9IDE3LFxuICAvLy8gTWFzayBmb3IgT3BDb2RlXG4gIE1BU0tfT1BDT0RFID0gMGIxMTEsXG4gIC8vLyBNYXNrIGZvciByZWZlcmVuY2UgaW5kZXguXG4gIE1BU0tfUkVGID0gKCgyIF4gMTYpIC0gMSkgPDwgU0hJRlRfUkVGLFxuXG4gIC8vLyBPcENvZGUgdG8gc2VsZWN0IGEgbm9kZS4gKG5leHQgT3BDb2RlIHdpbGwgY29udGFpbiB0aGUgb3BlcmF0aW9uLilcbiAgU2VsZWN0ID0gMGIwMDAsXG4gIC8vLyBPcENvZGUgdG8gYXBwZW5kIHRoZSBjdXJyZW50IG5vZGUgdG8gYFBBUkVOVGAuXG4gIEFwcGVuZENoaWxkID0gMGIwMDEsXG4gIC8vLyBPcENvZGUgdG8gaW5zZXJ0IHRoZSBjdXJyZW50IG5vZGUgdG8gYFBBUkVOVGAgYmVmb3JlIGBSRUZgLlxuICBJbnNlcnRCZWZvcmUgPSAwYjAxMCxcbiAgLy8vIE9wQ29kZSB0byByZW1vdmUgdGhlIGBSRUZgIG5vZGUgZnJvbSBgUEFSRU5UYC5cbiAgUmVtb3ZlID0gMGIwMTEsXG4gIC8vLyBPcENvZGUgdG8gc2V0IHRoZSBhdHRyaWJ1dGUgb2YgYSBub2RlLlxuICBBdHRyID0gMGIxMDAsXG4gIC8vLyBPcENvZGUgdG8gc2ltdWxhdGUgZWxlbWVudEVuZCgpXG4gIEVsZW1lbnRFbmQgPSAwYjEwMSxcbiAgLy8vIE9wQ29kZSB0byByZWFkIHRoZSByZW1vdmUgT3BDb2RlcyBmb3IgdGhlIG5lc3RlZCBJQ1VcbiAgUmVtb3ZlTmVzdGVkSWN1ID0gMGIxMTAsXG59XG5cbi8qKlxuICogTWFya3MgdGhhdCB0aGUgbmV4dCBzdHJpbmcgaXMgZm9yIGVsZW1lbnQuXG4gKlxuICogU2VlIGBJMThuTXV0YXRlT3BDb2Rlc2AgZG9jdW1lbnRhdGlvbi5cbiAqL1xuZXhwb3J0IGNvbnN0IEVMRU1FTlRfTUFSS0VSOiBFTEVNRU5UX01BUktFUiA9IHtcbiAgbWFya2VyOiAnZWxlbWVudCdcbn07XG5leHBvcnQgaW50ZXJmYWNlIEVMRU1FTlRfTUFSS0VSIHsgbWFya2VyOiAnZWxlbWVudCc7IH1cblxuLyoqXG4gKiBNYXJrcyB0aGF0IHRoZSBuZXh0IHN0cmluZyBpcyBmb3IgY29tbWVudC5cbiAqXG4gKiBTZWUgYEkxOG5NdXRhdGVPcENvZGVzYCBkb2N1bWVudGF0aW9uLlxuICovXG5leHBvcnQgY29uc3QgQ09NTUVOVF9NQVJLRVI6IENPTU1FTlRfTUFSS0VSID0ge1xuICBtYXJrZXI6ICdjb21tZW50J1xufTtcblxuZXhwb3J0IGludGVyZmFjZSBDT01NRU5UX01BUktFUiB7IG1hcmtlcjogJ2NvbW1lbnQnOyB9XG5cbi8qKlxuICogQXJyYXkgc3RvcmluZyBPcENvZGUgZm9yIGR5bmFtaWNhbGx5IGNyZWF0aW5nIGBpMThuYCBibG9ja3MuXG4gKlxuICogRXhhbXBsZTpcbiAqIGBgYFxuICogPEkxOG5DcmVhdGVPcENvZGU+W1xuICogICAvLyBGb3IgYWRkaW5nIHRleHQgbm9kZXNcbiAqICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiAgIC8vIEVxdWl2YWxlbnQgdG86XG4gKiAgIC8vICAgY29uc3Qgbm9kZSA9IGxWaWV3RGF0YVtpbmRleCsrXSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdhYmMnKTtcbiAqICAgLy8gICBsVmlld0RhdGFbMV0uaW5zZXJ0QmVmb3JlKG5vZGUsIGxWaWV3RGF0YVsyXSk7XG4gKiAgICdhYmMnLCAxIDw8IFNISUZUX1BBUkVOVCB8IDIgPDwgU0hJRlRfUkVGIHwgSW5zZXJ0QmVmb3JlLFxuICpcbiAqICAgLy8gRXF1aXZhbGVudCB0bzpcbiAqICAgLy8gICBjb25zdCBub2RlID0gbFZpZXdEYXRhW2luZGV4KytdID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ3h5eicpO1xuICogICAvLyAgIGxWaWV3RGF0YVsxXS5hcHBlbmRDaGlsZChub2RlKTtcbiAqICAgJ3h5eicsIDEgPDwgU0hJRlRfUEFSRU5UIHwgQXBwZW5kQ2hpbGQsXG4gKlxuICogICAvLyBGb3IgYWRkaW5nIGVsZW1lbnQgbm9kZXNcbiAqICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiAgIC8vIEVxdWl2YWxlbnQgdG86XG4gKiAgIC8vICAgY29uc3Qgbm9kZSA9IGxWaWV3RGF0YVtpbmRleCsrXSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICogICAvLyAgIGxWaWV3RGF0YVsxXS5pbnNlcnRCZWZvcmUobm9kZSwgbFZpZXdEYXRhWzJdKTtcbiAqICAgRUxFTUVOVF9NQVJLRVIsICdkaXYnLCAxIDw8IFNISUZUX1BBUkVOVCB8IDIgPDwgU0hJRlRfUkVGIHwgSW5zZXJ0QmVmb3JlLFxuICpcbiAqICAgLy8gRXF1aXZhbGVudCB0bzpcbiAqICAgLy8gICBjb25zdCBub2RlID0gbFZpZXdEYXRhW2luZGV4KytdID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gKiAgIC8vICAgbFZpZXdEYXRhWzFdLmFwcGVuZENoaWxkKG5vZGUpO1xuICogICBFTEVNRU5UX01BUktFUiwgJ2RpdicsIDEgPDwgU0hJRlRfUEFSRU5UIHwgQXBwZW5kQ2hpbGQsXG4gKlxuICogICAvLyBGb3IgYWRkaW5nIGNvbW1lbnQgbm9kZXNcbiAqICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiAgIC8vIEVxdWl2YWxlbnQgdG86XG4gKiAgIC8vICAgY29uc3Qgbm9kZSA9IGxWaWV3RGF0YVtpbmRleCsrXSA9IGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoJycpO1xuICogICAvLyAgIGxWaWV3RGF0YVsxXS5pbnNlcnRCZWZvcmUobm9kZSwgbFZpZXdEYXRhWzJdKTtcbiAqICAgQ09NTUVOVF9NQVJLRVIsICcnLCAxIDw8IFNISUZUX1BBUkVOVCB8IDIgPDwgU0hJRlRfUkVGIHwgSW5zZXJ0QmVmb3JlLFxuICpcbiAqICAgLy8gRXF1aXZhbGVudCB0bzpcbiAqICAgLy8gICBjb25zdCBub2RlID0gbFZpZXdEYXRhW2luZGV4KytdID0gZG9jdW1lbnQuY3JlYXRlQ29tbWVudCgnJyk7XG4gKiAgIC8vICAgbFZpZXdEYXRhWzFdLmFwcGVuZENoaWxkKG5vZGUpO1xuICogICBDT01NRU5UX01BUktFUiwgJycsIDEgPDwgU0hJRlRfUEFSRU5UIHwgQXBwZW5kQ2hpbGQsXG4gKlxuICogICAvLyBGb3IgbW92aW5nIGV4aXN0aW5nIG5vZGVzIHRvIGEgZGlmZmVyZW50IGxvY2F0aW9uXG4gKiAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiAgIC8vIEVxdWl2YWxlbnQgdG86XG4gKiAgIC8vICAgY29uc3Qgbm9kZSA9IGxWaWV3RGF0YVsxXTtcbiAqICAgLy8gICBsVmlld0RhdGFbMl0uaW5zZXJ0QmVmb3JlKG5vZGUsIGxWaWV3RGF0YVszXSk7XG4gKiAgIDEgPDwgU0hJRlRfUkVGIHwgU2VsZWN0LCAyIDw8IFNISUZUX1BBUkVOVCB8IDMgPDwgU0hJRlRfUkVGIHwgSW5zZXJ0QmVmb3JlLFxuICpcbiAqICAgLy8gRXF1aXZhbGVudCB0bzpcbiAqICAgLy8gICBjb25zdCBub2RlID0gbFZpZXdEYXRhWzFdO1xuICogICAvLyAgIGxWaWV3RGF0YVsyXS5hcHBlbmRDaGlsZChub2RlKTtcbiAqICAgMSA8PCBTSElGVF9SRUYgfCBTZWxlY3QsIDIgPDwgU0hJRlRfUEFSRU5UIHwgQXBwZW5kQ2hpbGQsXG4gKlxuICogICAvLyBGb3IgcmVtb3ZpbmcgZXhpc3Rpbmcgbm9kZXNcbiAqICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqICAgLy8gICBjb25zdCBub2RlID0gbFZpZXdEYXRhWzFdO1xuICogICAvLyAgIHJlbW92ZUNoaWxkKHRWaWV3LmRhdGEoMSksIG5vZGUsIGxWaWV3RGF0YSk7XG4gKiAgIDEgPDwgU0hJRlRfUkVGIHwgUmVtb3ZlLFxuICpcbiAqICAgLy8gRm9yIHdyaXRpbmcgYXR0cmlidXRlc1xuICogICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogICAvLyAgIGNvbnN0IG5vZGUgPSBsVmlld0RhdGFbMV07XG4gKiAgIC8vICAgbm9kZS5zZXRBdHRyaWJ1dGUoJ2F0dHInLCAndmFsdWUnKTtcbiAqICAgMSA8PCBTSElGVF9SRUYgfCBTZWxlY3QsICdhdHRyJywgJ3ZhbHVlJ1xuICogICAgICAgICAgICAvLyBOT1RFOiBTZWxlY3QgZm9sbG93ZWQgYnkgdHdvIHN0cmluZyAodnMgc2VsZWN0IGZvbGxvd2VkIGJ5IE9wQ29kZSlcbiAqIF07XG4gKiBgYGBcbiAqIE5PVEU6XG4gKiAgIC0gYGluZGV4YCBpcyBpbml0aWFsIGxvY2F0aW9uIHdoZXJlIHRoZSBleHRyYSBub2RlcyBzaG91bGQgYmUgc3RvcmVkIGluIHRoZSBFWFBBTkRPIHNlY3Rpb24gb2ZcbiAqIGBMVklld0RhdGFgLlxuICpcbiAqIFNlZTogYGFwcGx5STE4bkNyZWF0ZU9wQ29kZXNgO1xuICovXG5leHBvcnQgaW50ZXJmYWNlIEkxOG5NdXRhdGVPcENvZGVzIGV4dGVuZHMgQXJyYXk8bnVtYmVyfHN0cmluZ3xFTEVNRU5UX01BUktFUnxDT01NRU5UX01BUktFUnxudWxsPiB7XG59XG5cbmV4cG9ydCBjb25zdCBlbnVtIEkxOG5VcGRhdGVPcENvZGUge1xuICAvLy8gU3RvcmVzIHNoaWZ0IGFtb3VudCBmb3IgYml0cyAxNy0yIHRoYXQgY29udGFpbiByZWZlcmVuY2UgaW5kZXguXG4gIFNISUZUX1JFRiA9IDIsXG4gIC8vLyBTdG9yZXMgc2hpZnQgYW1vdW50IGZvciBiaXRzIDMxLTE3IHRoYXQgY29udGFpbiB3aGljaCBJQ1UgaW4gaTE4biBibG9jayBhcmUgd2UgcmVmZXJyaW5nIHRvLlxuICBTSElGVF9JQ1UgPSAxNyxcbiAgLy8vIE1hc2sgZm9yIE9wQ29kZVxuICBNQVNLX09QQ09ERSA9IDBiMTEsXG4gIC8vLyBNYXNrIGZvciByZWZlcmVuY2UgaW5kZXguXG4gIE1BU0tfUkVGID0gKCgyIF4gMTYpIC0gMSkgPDwgU0hJRlRfUkVGLFxuXG4gIC8vLyBPcENvZGUgdG8gdXBkYXRlIGEgdGV4dCBub2RlLlxuICBUZXh0ID0gMGIwMCxcbiAgLy8vIE9wQ29kZSB0byB1cGRhdGUgYSBhdHRyaWJ1dGUgb2YgYSBub2RlLlxuICBBdHRyID0gMGIwMSxcbiAgLy8vIE9wQ29kZSB0byBzd2l0Y2ggdGhlIGN1cnJlbnQgSUNVIGNhc2UuXG4gIEljdVN3aXRjaCA9IDBiMTAsXG4gIC8vLyBPcENvZGUgdG8gdXBkYXRlIHRoZSBjdXJyZW50IElDVSBjYXNlLlxuICBJY3VVcGRhdGUgPSAwYjExLFxufVxuXG4vKipcbiAqIFN0b3JlcyBET00gb3BlcmF0aW9ucyB3aGljaCBuZWVkIHRvIGJlIGFwcGxpZWQgdG8gdXBkYXRlIERPTSByZW5kZXIgdHJlZSBkdWUgdG8gY2hhbmdlcyBpblxuICogZXhwcmVzc2lvbnMuXG4gKlxuICogVGhlIGJhc2ljIGlkZWEgaXMgdGhhdCBgaTE4bkV4cGAgT3BDb2RlcyBjYXB0dXJlIGV4cHJlc3Npb24gY2hhbmdlcyBhbmQgdXBkYXRlIGEgY2hhbmdlXG4gKiBtYXNrIGJpdC4gKEJpdCAxIGZvciBleHByZXNzaW9uIDEsIGJpdCAyIGZvciBleHByZXNzaW9uIDIgZXRjLi4uLCBiaXQgMzIgZm9yIGV4cHJlc3Npb24gMzIgYW5kXG4gKiBoaWdoZXIuKSBUaGUgT3BDb2RlcyB0aGVuIGNvbXBhcmUgaXRzIG93biBjaGFuZ2UgbWFzayBhZ2FpbnN0IHRoZSBleHByZXNzaW9uIGNoYW5nZSBtYXNrIHRvXG4gKiBkZXRlcm1pbmUgaWYgdGhlIE9wQ29kZXMgc2hvdWxkIGV4ZWN1dGUuXG4gKlxuICogVGhlc2UgT3BDb2RlcyBjYW4gYmUgdXNlZCBieSBib3RoIHRoZSBpMThuIGJsb2NrIGFzIHdlbGwgYXMgSUNVIHN1Yi1ibG9jay5cbiAqXG4gKiAjIyBFeGFtcGxlXG4gKlxuICogQXNzdW1lXG4gKiBgYGBcbiAqICAgaWYgKHJmICYgUmVuZGVyRmxhZ3MuVXBkYXRlKSB7XG4gKiAgICBpMThuRXhwKGJpbmQoY3R4LmV4cDEpKTsgLy8gSWYgY2hhbmdlZCBzZXQgbWFzayBiaXQgMVxuICogICAgaTE4bkV4cChiaW5kKGN0eC5leHAyKSk7IC8vIElmIGNoYW5nZWQgc2V0IG1hc2sgYml0IDJcbiAqICAgIGkxOG5FeHAoYmluZChjdHguZXhwMykpOyAvLyBJZiBjaGFuZ2VkIHNldCBtYXNrIGJpdCAzXG4gKiAgICBpMThuRXhwKGJpbmQoY3R4LmV4cDQpKTsgLy8gSWYgY2hhbmdlZCBzZXQgbWFzayBiaXQgNFxuICogICAgaTE4bkFwcGx5KDApOyAgICAgICAgICAgIC8vIEFwcGx5IGFsbCBjaGFuZ2VzIGJ5IGV4ZWN1dGluZyB0aGUgT3BDb2Rlcy5cbiAqICB9XG4gKiBgYGBcbiAqIFdlIGNhbiBhc3N1bWUgdGhhdCBlYWNoIGNhbGwgdG8gYGkxOG5FeHBgIHNldHMgYW4gaW50ZXJuYWwgYGNoYW5nZU1hc2tgIGJpdCBkZXBlbmRpbmcgb24gdGhlXG4gKiBpbmRleCBvZiBgaTE4bkV4cGAuXG4gKlxuICogT3BDb2Rlc1xuICogYGBgXG4gKiA8STE4blVwZGF0ZU9wQ29kZXM+W1xuICogICAvLyBUaGUgZm9sbG93aW5nIE9wQ29kZXMgcmVwcmVzZW50OiBgPGRpdiBpMThuLXRpdGxlPVwicHJle3tleHAxfX1pbnt7ZXhwMn19cG9zdFwiPmBcbiAqICAgLy8gSWYgYGNoYW5nZU1hc2sgJiAwYjExYFxuICogICAvLyAgICAgICAgaGFzIGNoYW5nZWQgdGhlbiBleGVjdXRlIHVwZGF0ZSBPcENvZGVzLlxuICogICAvLyAgICAgICAgaGFzIE5PVCBjaGFuZ2VkIHRoZW4gc2tpcCBgN2AgdmFsdWVzIGFuZCBzdGFydCBwcm9jZXNzaW5nIG5leHQgT3BDb2Rlcy5cbiAqICAgMGIxMSwgNyxcbiAqICAgLy8gQ29uY2F0ZW5hdGUgYG5ld1ZhbHVlID0gJ3ByZScrbFZpZXdEYXRhW2JpbmRJbmRleC00XSsnaW4nK2xWaWV3RGF0YVtiaW5kSW5kZXgtM10rJ3Bvc3QnO2AuXG4gKiAgICdwcmUnLCAtNCwgJ2luJywgLTMsICdwb3N0JyxcbiAqICAgLy8gVXBkYXRlIGF0dHJpYnV0ZTogYGVsZW1lbnRBdHRyaWJ1dGUoMSwgJ3RpdGxlJywgc2FuaXRpemVyRm4obmV3VmFsdWUpKTtgXG4gKiAgIDEgPDwgU0hJRlRfUkVGIHwgQXR0ciwgJ3RpdGxlJywgc2FuaXRpemVyRm4sXG4gKlxuICogICAvLyBUaGUgZm9sbG93aW5nIE9wQ29kZXMgcmVwcmVzZW50OiBgPGRpdiBpMThuPkhlbGxvIHt7ZXhwM319IVwiPmBcbiAqICAgLy8gSWYgYGNoYW5nZU1hc2sgJiAwYjEwMGBcbiAqICAgLy8gICAgICAgIGhhcyBjaGFuZ2VkIHRoZW4gZXhlY3V0ZSB1cGRhdGUgT3BDb2Rlcy5cbiAqICAgLy8gICAgICAgIGhhcyBOT1QgY2hhbmdlZCB0aGVuIHNraXAgYDRgIHZhbHVlcyBhbmQgc3RhcnQgcHJvY2Vzc2luZyBuZXh0IE9wQ29kZXMuXG4gKiAgIDBiMTAwLCA0LFxuICogICAvLyBDb25jYXRlbmF0ZSBgbmV3VmFsdWUgPSAnSGVsbG8gJyArIGxWaWV3RGF0YVtiaW5kSW5kZXggLTJdICsgJyEnO2AuXG4gKiAgICdIZWxsbyAnLCAtMiwgJyEnLFxuICogICAvLyBVcGRhdGUgdGV4dDogYGxWaWV3RGF0YVsxXS50ZXh0Q29udGVudCA9IG5ld1ZhbHVlO2BcbiAqICAgMSA8PCBTSElGVF9SRUYgfCBUZXh0LFxuICpcbiAqICAgLy8gVGhlIGZvbGxvd2luZyBPcENvZGVzIHJlcHJlc2VudDogYDxkaXYgaTE4bj57ZXhwNCwgcGx1cmFsLCAuLi4gfVwiPmBcbiAqICAgLy8gSWYgYGNoYW5nZU1hc2sgJiAwYjEwMDBgXG4gKiAgIC8vICAgICAgICBoYXMgY2hhbmdlZCB0aGVuIGV4ZWN1dGUgdXBkYXRlIE9wQ29kZXMuXG4gKiAgIC8vICAgICAgICBoYXMgTk9UIGNoYW5nZWQgdGhlbiBza2lwIGA0YCB2YWx1ZXMgYW5kIHN0YXJ0IHByb2Nlc3NpbmcgbmV4dCBPcENvZGVzLlxuICogICAwYjEwMDAsIDQsXG4gKiAgIC8vIENvbmNhdGVuYXRlIGBuZXdWYWx1ZSA9IGxWaWV3RGF0YVtiaW5kSW5kZXggLTFdO2AuXG4gKiAgIC0xLFxuICogICAvLyBTd2l0Y2ggSUNVOiBgaWN1U3dpdGNoQ2FzZShsVmlld0RhdGFbMV0sIDAsIG5ld1ZhbHVlKTtgXG4gKiAgIDAgPDwgU0hJRlRfSUNVIHwgMSA8PCBTSElGVF9SRUYgfCBJY3VTd2l0Y2gsXG4gKlxuICogICAvLyBOb3RlIGBjaGFuZ2VNYXNrICYgLTFgIGlzIGFsd2F5cyB0cnVlLCBzbyB0aGUgSWN1VXBkYXRlIHdpbGwgYWx3YXlzIGV4ZWN1dGUuXG4gKiAgIC0xLCAxLFxuICogICAvLyBVcGRhdGUgSUNVOiBgaWN1VXBkYXRlQ2FzZShsVmlld0RhdGFbMV0sIDApO2BcbiAqICAgMCA8PCBTSElGVF9JQ1UgfCAxIDw8IFNISUZUX1JFRiB8IEljdVVwZGF0ZSxcbiAqXG4gKiBdO1xuICogYGBgXG4gKlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEkxOG5VcGRhdGVPcENvZGVzIGV4dGVuZHMgQXJyYXk8c3RyaW5nfG51bWJlcnxTYW5pdGl6ZXJGbnxudWxsPiB7fVxuXG4vKipcbiAqIFN0b3JlIGluZm9ybWF0aW9uIGZvciB0aGUgaTE4biB0cmFuc2xhdGlvbiBibG9jay5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUSTE4biB7XG4gIC8qKlxuICAgKiBOdW1iZXIgb2Ygc2xvdHMgdG8gYWxsb2NhdGUgaW4gZXhwYW5kby5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbWF4IG51bWJlciBvZiBET00gZWxlbWVudHMgd2hpY2ggd2lsbCBiZSBjcmVhdGVkIGJ5IHRoaXMgaTE4biArIElDVSBibG9ja3MuIFdoZW5cbiAgICogdGhlIERPTSBlbGVtZW50cyBhcmUgYmVpbmcgY3JlYXRlZCB0aGV5IGFyZSBzdG9yZWQgaW4gdGhlIEVYUEFORE8sIHNvIHRoYXQgdXBkYXRlIE9wQ29kZXMgY2FuXG4gICAqIHdyaXRlIGludG8gdGhlbS5cbiAgICovXG4gIHZhcnM6IG51bWJlcjtcblxuICAvKipcbiAgICogSW5kZXggaW4gRVhQQU5ETyB3aGVyZSB0aGUgaTE4biBzdG9yZXMgaXRzIERPTSBub2Rlcy5cbiAgICpcbiAgICogV2hlbiB0aGUgYmluZGluZ3MgYXJlIHByb2Nlc3NlZCBieSB0aGUgYGkxOG5FbmRgIGluc3RydWN0aW9uIGl0IGlzIG5lY2Vzc2FyeSB0byBrbm93IHdoZXJlIHRoZVxuICAgKiBuZXdseSBjcmVhdGVkIERPTSBub2RlcyB3aWxsIGJlIGluc2VydGVkLlxuICAgKi9cbiAgZXhwYW5kb1N0YXJ0SW5kZXg6IG51bWJlcjtcblxuICAvKipcbiAgICogQSBzZXQgb2YgT3BDb2RlcyB3aGljaCB3aWxsIGNyZWF0ZSB0aGUgVGV4dCBOb2RlcyBhbmQgSUNVIGFuY2hvcnMgZm9yIHRoZSB0cmFuc2xhdGlvbiBibG9ja3MuXG4gICAqXG4gICAqIE5PVEU6IFRoZSBJQ1UgYW5jaG9ycyBhcmUgZmlsbGVkIGluIHdpdGggSUNVIFVwZGF0ZSBPcENvZGUuXG4gICAqL1xuICBjcmVhdGU6IEkxOG5NdXRhdGVPcENvZGVzO1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBPcENvZGVzIHdoaWNoIHdpbGwgYmUgZXhlY3V0ZWQgb24gZWFjaCBjaGFuZ2UgZGV0ZWN0aW9uIHRvIGRldGVybWluZSBpZiBhbnkgY2hhbmdlcyB0b1xuICAgKiBET00gYXJlIHJlcXVpcmVkLlxuICAgKi9cbiAgdXBkYXRlOiBJMThuVXBkYXRlT3BDb2RlcztcblxuICAvKipcbiAgICogQSBsaXN0IG9mIElDVXMgaW4gYSB0cmFuc2xhdGlvbiBibG9jayAob3IgYG51bGxgIGlmIGJsb2NrIGhhcyBubyBJQ1VzKS5cbiAgICpcbiAgICogRXhhbXBsZTpcbiAgICogR2l2ZW46IGA8ZGl2IGkxOG4+WW91IGhhdmUge2NvdW50LCBwbHVyYWwsIC4uLn0gYW5kIHtzdGF0ZSwgc3dpdGNoLCAuLi59PC9kaXY+YFxuICAgKiBUaGVyZSB3b3VsZCBiZSAyIElDVXMgaW4gdGhpcyBhcnJheS5cbiAgICogICAxLiBge2NvdW50LCBwbHVyYWwsIC4uLn1gXG4gICAqICAgMi4gYHtzdGF0ZSwgc3dpdGNoLCAuLi59YFxuICAgKi9cbiAgaWN1czogVEljdVtdfG51bGw7XG59XG5cbi8qKlxuICogRGVmaW5lcyB0aGUgSUNVIHR5cGUgb2YgYHNlbGVjdGAgb3IgYHBsdXJhbGBcbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gSWN1VHlwZSB7XG4gIHNlbGVjdCA9IDAsXG4gIHBsdXJhbCA9IDEsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVEljdSB7XG4gIC8qKlxuICAgKiBEZWZpbmVzIHRoZSBJQ1UgdHlwZSBvZiBgc2VsZWN0YCBvciBgcGx1cmFsYFxuICAgKi9cbiAgdHlwZTogSWN1VHlwZTtcblxuICAvKipcbiAgICogTnVtYmVyIG9mIHNsb3RzIHRvIGFsbG9jYXRlIGluIGV4cGFuZG8gZm9yIGVhY2ggY2FzZS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbWF4IG51bWJlciBvZiBET00gZWxlbWVudHMgd2hpY2ggd2lsbCBiZSBjcmVhdGVkIGJ5IHRoaXMgaTE4biArIElDVSBibG9ja3MuIFdoZW5cbiAgICogdGhlIERPTSBlbGVtZW50cyBhcmUgYmVpbmcgY3JlYXRlZCB0aGV5IGFyZSBzdG9yZWQgaW4gdGhlIEVYUEFORE8sIHNvIHRoYXQgdXBkYXRlIE9wQ29kZXMgY2FuXG4gICAqIHdyaXRlIGludG8gdGhlbS5cbiAgICovXG4gIHZhcnM6IG51bWJlcltdO1xuXG4gIC8qKlxuICAgKiBBbiBvcHRpb25hbCBhcnJheSBvZiBjaGlsZC9zdWIgSUNVcy5cbiAgICpcbiAgICogSW4gY2FzZSBvZiBuZXN0ZWQgSUNVcyBzdWNoIGFzOlxuICAgKiBgYGBcbiAgICoge++/vTDvv70sIHBsdXJhbCxcbiAgICogICA9MCB7emVyb31cbiAgICogICBvdGhlciB777+9MO+/vSB777+9Me+/vSwgc2VsZWN0LFxuICAgKiAgICAgICAgICAgICAgICAgICAgIGNhdCB7Y2F0c31cbiAgICogICAgICAgICAgICAgICAgICAgICBkb2cge2RvZ3N9XG4gICAqICAgICAgICAgICAgICAgICAgICAgb3RoZXIge2FuaW1hbHN9XG4gICAqICAgICAgICAgICAgICAgICAgIH0hXG4gICAqICAgfVxuICAgKiB9XG4gICAqIGBgYFxuICAgKiBXaGVuIHRoZSBwYXJlbnQgSUNVIGlzIGNoYW5naW5nIGl0IG11c3QgY2xlYW4gdXAgY2hpbGQgSUNVcyBhcyB3ZWxsLiBGb3IgdGhpcyByZWFzb24gaXQgbmVlZHNcbiAgICogdG8ga25vdyB3aGljaCBjaGlsZCBJQ1VzIHRvIHJ1biBjbGVhbiB1cCBmb3IgYXMgd2VsbC5cbiAgICpcbiAgICogSW4gdGhlIGFib3ZlIGV4YW1wbGUgdGhpcyB3b3VsZCBiZTpcbiAgICogYGBgXG4gICAqIFtcbiAgICogICBbXSwgICAvLyBgPTBgIGhhcyBubyBzdWIgSUNVc1xuICAgKiAgIFsxXSwgIC8vIGBvdGhlcmAgaGFzIG9uZSBzdWJJQ1UgYXQgYDFgc3QgaW5kZXguXG4gICAqIF1cbiAgICogYGBgXG4gICAqXG4gICAqIFRoZSByZWFzb24gd2h5IGl0IGlzIEFycmF5IG9mIEFycmF5cyBpcyBiZWNhdXNlIGZpcnN0IGFycmF5IHJlcHJlc2VudHMgdGhlIGNhc2UsIGFuZCBzZWNvbmRcbiAgICogcmVwcmVzZW50cyB0aGUgY2hpbGQgSUNVcyB0byBjbGVhbiB1cC4gVGhlcmUgbWF5IGJlIG1vcmUgdGhhbiBvbmUgY2hpbGQgSUNVcyBwZXIgY2FzZS5cbiAgICovXG4gIGNoaWxkSWN1czogbnVtYmVyW11bXTtcblxuICAvKipcbiAgICogSW5kZXggaW4gRVhQQU5ETyB3aGVyZSB0aGUgaTE4biBzdG9yZXMgaXRzIERPTSBub2Rlcy5cbiAgICpcbiAgICogV2hlbiB0aGUgYmluZGluZ3MgYXJlIHByb2Nlc3NlZCBieSB0aGUgYGkxOG5FbmRgIGluc3RydWN0aW9uIGl0IGlzIG5lY2Vzc2FyeSB0byBrbm93IHdoZXJlIHRoZVxuICAgKiBuZXdseSBjcmVhdGVkIERPTSBub2RlcyB3aWxsIGJlIGluc2VydGVkLlxuICAgKi9cbiAgZXhwYW5kb1N0YXJ0SW5kZXg6IG51bWJlcjtcblxuICAvKipcbiAgICogQSBsaXN0IG9mIGNhc2UgdmFsdWVzIHdoaWNoIHRoZSBjdXJyZW50IElDVSB3aWxsIHRyeSB0byBtYXRjaC5cbiAgICpcbiAgICogVGhlIGxhc3QgdmFsdWUgaXMgYG90aGVyYFxuICAgKi9cbiAgY2FzZXM6IGFueVtdO1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBPcENvZGVzIHRvIGFwcGx5IGluIG9yZGVyIHRvIGJ1aWxkIHVwIHRoZSBET00gcmVuZGVyIHRyZWUgZm9yIHRoZSBJQ1VcbiAgICovXG4gIGNyZWF0ZTogSTE4bk11dGF0ZU9wQ29kZXNbXTtcblxuICAvKipcbiAgICogQSBzZXQgb2YgT3BDb2RlcyB0byBhcHBseSBpbiBvcmRlciB0byBkZXN0cm95IHRoZSBET00gcmVuZGVyIHRyZWUgZm9yIHRoZSBJQ1UuXG4gICAqL1xuICByZW1vdmU6IEkxOG5NdXRhdGVPcENvZGVzW107XG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIE9wQ29kZXMgdG8gYXBwbHkgaW4gb3JkZXIgdG8gdXBkYXRlIHRoZSBET00gcmVuZGVyIHRyZWUgZm9yIHRoZSBJQ1UgYmluZGluZ3MuXG4gICAqL1xuICB1cGRhdGU6IEkxOG5VcGRhdGVPcENvZGVzW107XG59XG5cbi8vIE5vdGU6IFRoaXMgaGFjayBpcyBuZWNlc3Nhcnkgc28gd2UgZG9uJ3QgZXJyb25lb3VzbHkgZ2V0IGEgY2lyY3VsYXIgZGVwZW5kZW5jeVxuLy8gZmFpbHVyZSBiYXNlZCBvbiB0eXBlcy5cbmV4cG9ydCBjb25zdCB1bnVzZWRWYWx1ZUV4cG9ydFRvUGxhY2F0ZUFqZCA9IDE7XG4iXX0=