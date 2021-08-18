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
const TNodeType = {
    Container: 0,
    Projection: 1,
    View: 2,
    Element: 3,
    ViewOrElement: 2,
    ElementContainer: 4,
    IcuContainer: 5,
};
export { TNodeType };
/** @enum {number} */
const TNodeFlags = {
    /** The number of directives on this node is encoded on the least significant bits */
    DirectiveCountMask: 4095,
    /** This bit is set if the node is a component */
    isComponent: 4096,
    /** This bit is set if the node has been projected */
    isProjected: 8192,
    /** This bit is set if the node has any content queries */
    hasContentQuery: 16384,
    /** This bit is set if the node has any directives that contain [class properties */
    hasClassInput: 32768,
    /** The index of the first directive on this node is encoded on the most significant bits  */
    DirectiveStartingIndexShift: 16,
};
export { TNodeFlags };
/** @enum {number} */
const TNodeProviderIndexes = {
    /** The index of the first provider on this node is encoded on the least significant bits */
    ProvidersStartIndexMask: 65535,
    /** The count of view providers from the component on this node is encoded on the 16 most
       significant bits */
    CptViewProvidersCountShift: 16,
    CptViewProvidersCountShifter: 65536,
};
export { TNodeProviderIndexes };
/** @enum {number} */
const AttributeMarker = {
    /**
     * Marker indicates that the following 3 values in the attributes array are:
     * namespaceUri, attributeName, attributeValue
     * in that order.
     */
    NamespaceURI: 0,
    /**
     * This marker indicates that the following attribute names were extracted from bindings (ex.:
     * [foo]="exp") and / or event handlers (ex. (bar)="doSth()").
     * Taking the above bindings and outputs as an example an attributes array could look as follows:
     * ['class', 'fade in', AttributeMarker.SelectOnly, 'foo', 'bar']
     */
    SelectOnly: 1,
};
export { AttributeMarker };
/**
 * Binding data (flyweight) for a particular node that is shared between all templates
 * of a specific type.
 *
 * If a property is:
 *    - PropertyAliases: that property's data was generated and this is it
 *    - Null: that property's data was already generated and nothing was found.
 *    - Undefined: that property's data has not yet been generated
 *
 * see: https://en.wikipedia.org/wiki/Flyweight_pattern for more on the Flyweight pattern
 * @record
 */
export function TNode() { }
if (false) {
    /**
     * The type of the TNode. See TNodeType.
     * @type {?}
     */
    TNode.prototype.type;
    /**
     * Index of the TNode in TView.data and corresponding native element in LViewData.
     *
     * This is necessary to get from any TNode to its corresponding native element when
     * traversing the node tree.
     *
     * If index is -1, this is a dynamically created container node or embedded view node.
     * @type {?}
     */
    TNode.prototype.index;
    /**
     * The index of the closest injector in this node's LViewData.
     *
     * If the index === -1, there is no injector on this node or any ancestor node in this view.
     *
     * If the index !== -1, it is the index of this node's injector OR the index of a parent injector
     * in the same view. We pass the parent injector index down the node tree of a view so it's
     * possible to find the parent injector without walking a potentially deep node tree. Injector
     * indices are not set across view boundaries because there could be multiple component hosts.
     *
     * If tNode.injectorIndex === tNode.parent.injectorIndex, then the index belongs to a parent
     * injector.
     * @type {?}
     */
    TNode.prototype.injectorIndex;
    /**
     * This number stores two values using its bits:
     *
     * - the number of directives on that node (first 12 bits)
     * - the starting index of the node's directives in the directives array (last 20 bits).
     *
     * These two values are necessary so DI can effectively search the directives associated
     * with a node without searching the whole directives array.
     * @type {?}
     */
    TNode.prototype.flags;
    /**
     * This number stores two values using its bits:
     *
     * - the index of the first provider on that node (first 16 bits)
     * - the count of view providers from the component on this node (last 16 bits)
     * @type {?}
     */
    TNode.prototype.providerIndexes;
    /**
     * The tag name associated with this node.
     * @type {?}
     */
    TNode.prototype.tagName;
    /**
     * Attributes associated with an element. We need to store attributes to support various use-cases
     * (attribute injection, content projection with selectors, directives matching).
     * Attributes are stored statically because reading them from the DOM would be way too slow for
     * content projection and queries.
     *
     * Since attrs will always be calculated first, they will never need to be marked undefined by
     * other instructions.
     *
     * For regular attributes a name of an attribute and its value alternate in the array.
     * e.g. ['role', 'checkbox']
     * This array can contain flags that will indicate "special attributes" (attributes with
     * namespaces, attributes extracted from bindings and outputs).
     * @type {?}
     */
    TNode.prototype.attrs;
    /**
     * A set of local names under which a given element is exported in a template and
     * visible to queries. An entry in this array can be created for different reasons:
     * - an element itself is referenced, ex.: `<div #foo>`
     * - a component is referenced, ex.: `<my-cmpt #foo>`
     * - a directive is referenced, ex.: `<my-cmpt #foo="directiveExportAs">`.
     *
     * A given element might have different local names and those names can be associated
     * with a directive. We store local names at even indexes while odd indexes are reserved
     * for directive index in a view (or `-1` if there is no associated directive).
     *
     * Some examples:
     * - `<div #foo>` => `["foo", -1]`
     * - `<my-cmpt #foo>` => `["foo", myCmptIdx]`
     * - `<my-cmpt #foo #bar="directiveExportAs">` => `["foo", myCmptIdx, "bar", directiveIdx]`
     * - `<div #foo #bar="directiveExportAs">` => `["foo", -1, "bar", directiveIdx]`
     * @type {?}
     */
    TNode.prototype.localNames;
    /**
     * Information about input properties that need to be set once from attribute data.
     * @type {?}
     */
    TNode.prototype.initialInputs;
    /**
     * Input data for all directives on this node.
     *
     * - `undefined` means that the prop has not been initialized yet,
     * - `null` means that the prop has been initialized but no inputs have been found.
     * @type {?}
     */
    TNode.prototype.inputs;
    /**
     * Output data for all directives on this node.
     *
     * - `undefined` means that the prop has not been initialized yet,
     * - `null` means that the prop has been initialized but no outputs have been found.
     * @type {?}
     */
    TNode.prototype.outputs;
    /**
     * The TView or TViews attached to this node.
     *
     * If this TNode corresponds to an LContainer with inline views, the container will
     * need to store separate static data for each of its view blocks (TView[]). Otherwise,
     * nodes in inline views with the same index as nodes in their parent views will overwrite
     * each other, as they are in the same template.
     *
     * Each index in this array corresponds to the static data for a certain
     * view. So if you had V(0) and V(1) in a container, you might have:
     *
     * [
     *   [{tagName: 'div', attrs: ...}, null],     // V(0) TView
     *   [{tagName: 'button', attrs ...}, null]    // V(1) TView
     *
     * If this TNode corresponds to an LContainer with a template (e.g. structural
     * directive), the template's TView will be stored here.
     *
     * If this TNode corresponds to an element, tViews will be null .
     * @type {?}
     */
    TNode.prototype.tViews;
    /**
     * The next sibling node. Necessary so we can propagate through the root nodes of a view
     * to insert them or remove them from the DOM.
     * @type {?}
     */
    TNode.prototype.next;
    /**
     * First child of the current node.
     *
     * For component nodes, the child will always be a ContentChild (in same view).
     * For embedded view nodes, the child will be in their child view.
     * @type {?}
     */
    TNode.prototype.child;
    /**
     * Parent node (in the same view only).
     *
     * We need a reference to a node's parent so we can append the node to its parent's native
     * element at the appropriate time.
     *
     * If the parent would be in a different view (e.g. component host), this property will be null.
     * It's important that we don't try to cross component boundaries when retrieving the parent
     * because the parent will change (e.g. index, attrs) depending on where the component was
     * used (and thus shouldn't be stored on TNode). In these cases, we retrieve the parent through
     * LView.node instead (which will be instance-specific).
     *
     * If this is an inline view node (V), the parent will be its container.
     * @type {?}
     */
    TNode.prototype.parent;
    /**
     * If this node is part of an i18n block, it indicates whether this node is part of the DOM.
     * If this node is not part of an i18n block, this field is null.
     * @type {?}
     */
    TNode.prototype.detached;
    /** @type {?} */
    TNode.prototype.stylingTemplate;
    /**
     * List of projected TNodes for a given component host element OR index into the said nodes.
     *
     * For easier discussion assume this example:
     * `<parent>`'s view definition:
     * ```
     * <child id="c1">content1</child>
     * <child id="c2"><span>content2</span></child>
     * ```
     * `<child>`'s view definition:
     * ```
     * <ng-content id="cont1"></ng-content>
     * ```
     *
     * If `Array.isArray(projection)` then `TNode` is a host element:
     * - `projection` stores the content nodes which are to be projected.
     *    - The nodes represent categories defined by the selector: For example:
     *      `<ng-content/><ng-content select="abc"/>` would represent the heads for `<ng-content/>`
     *      and `<ng-content select="abc"/>` respectively.
     *    - The nodes we store in `projection` are heads only, we used `.next` to get their
     *      siblings.
     *    - The nodes `.next` is sorted/rewritten as part of the projection setup.
     *    - `projection` size is equal to the number of projections `<ng-content>`. The size of
     *      `c1` will be `1` because `<child>` has only one `<ng-content>`.
     * - we store `projection` with the host (`c1`, `c2`) rather than the `<ng-content>` (`cont1`)
     *   because the same component (`<child>`) can be used in multiple locations (`c1`, `c2`) and as
     *   a result have different set of nodes to project.
     * - without `projection` it would be difficult to efficiently traverse nodes to be projected.
     *
     * If `typeof projection == 'number'` then `TNode` is a `<ng-content>` element:
     * - `projection` is an index of the host's `projection`Nodes.
     *   - This would return the first head node to project:
     *     `getHost(currentTNode).projection[currentTNode.projection]`.
     * - When projecting nodes the parent node retrieved may be a `<ng-content>` node, in which case
     *   the process is recursive in nature (not implementation).
     * @type {?}
     */
    TNode.prototype.projection;
}
/**
 * Static data for an element
 * @record
 */
export function TElementNode() { }
if (false) {
    /**
     * Index in the data[] array
     * @type {?}
     */
    TElementNode.prototype.index;
    /** @type {?} */
    TElementNode.prototype.child;
    /**
     * Element nodes will have parents unless they are the first node of a component or
     * embedded view (which means their parent is in a different view and must be
     * retrieved using viewData[HOST_NODE]).
     * @type {?}
     */
    TElementNode.prototype.parent;
    /** @type {?} */
    TElementNode.prototype.tViews;
    /**
     * If this is a component TNode with projection, this will be an array of projected
     * TNodes (see TNode.projection for more info). If it's a regular element node or a
     * component without projection, it will be null.
     * @type {?}
     */
    TElementNode.prototype.projection;
}
/**
 * Static data for a text node
 * @record
 */
export function TTextNode() { }
if (false) {
    /**
     * Index in the data[] array
     * @type {?}
     */
    TTextNode.prototype.index;
    /** @type {?} */
    TTextNode.prototype.child;
    /**
     * Text nodes will have parents unless they are the first node of a component or
     * embedded view (which means their parent is in a different view and must be
     * retrieved using LView.node).
     * @type {?}
     */
    TTextNode.prototype.parent;
    /** @type {?} */
    TTextNode.prototype.tViews;
    /** @type {?} */
    TTextNode.prototype.projection;
}
/**
 * Static data for an LContainer
 * @record
 */
export function TContainerNode() { }
if (false) {
    /**
     * Index in the data[] array.
     *
     * If it's -1, this is a dynamically created container node that isn't stored in
     * data[] (e.g. when you inject ViewContainerRef) .
     * @type {?}
     */
    TContainerNode.prototype.index;
    /** @type {?} */
    TContainerNode.prototype.child;
    /**
     * Container nodes will have parents unless:
     *
     * - They are the first node of a component or embedded view
     * - They are dynamically created
     * @type {?}
     */
    TContainerNode.prototype.parent;
    /** @type {?} */
    TContainerNode.prototype.tViews;
    /** @type {?} */
    TContainerNode.prototype.projection;
}
/**
 * Static data for an <ng-container>
 * @record
 */
export function TElementContainerNode() { }
if (false) {
    /**
     * Index in the LViewData[] array.
     * @type {?}
     */
    TElementContainerNode.prototype.index;
    /** @type {?} */
    TElementContainerNode.prototype.child;
    /** @type {?} */
    TElementContainerNode.prototype.parent;
    /** @type {?} */
    TElementContainerNode.prototype.tViews;
    /** @type {?} */
    TElementContainerNode.prototype.projection;
}
/**
 * Static data for an ICU expression
 * @record
 */
export function TIcuContainerNode() { }
if (false) {
    /**
     * Index in the LViewData[] array.
     * @type {?}
     */
    TIcuContainerNode.prototype.index;
    /** @type {?} */
    TIcuContainerNode.prototype.child;
    /** @type {?} */
    TIcuContainerNode.prototype.parent;
    /** @type {?} */
    TIcuContainerNode.prototype.tViews;
    /** @type {?} */
    TIcuContainerNode.prototype.projection;
    /**
     * Indicates the current active case for an ICU expression.
     * It is null when there is no active case.
     * @type {?}
     */
    TIcuContainerNode.prototype.activeCaseIndex;
}
/**
 * Static data for a view
 * @record
 */
export function TViewNode() { }
if (false) {
    /**
     * If -1, it's a dynamically created view. Otherwise, it is the view block ID.
     * @type {?}
     */
    TViewNode.prototype.index;
    /** @type {?} */
    TViewNode.prototype.child;
    /** @type {?} */
    TViewNode.prototype.parent;
    /** @type {?} */
    TViewNode.prototype.tViews;
    /** @type {?} */
    TViewNode.prototype.projection;
}
/**
 * Static data for an LProjectionNode
 * @record
 */
export function TProjectionNode() { }
if (false) {
    /**
     * Index in the data[] array
     * @type {?}
     */
    TProjectionNode.prototype.child;
    /**
     * Projection nodes will have parents unless they are the first node of a component
     * or embedded view (which means their parent is in a different view and must be
     * retrieved using LView.node).
     * @type {?}
     */
    TProjectionNode.prototype.parent;
    /** @type {?} */
    TProjectionNode.prototype.tViews;
    /**
     * Index of the projection node. (See TNode.projection for more info.)
     * @type {?}
     */
    TProjectionNode.prototype.projection;
}
// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
/** @type {?} */
export const unusedValueExportToPlacateAjd = 1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaW50ZXJmYWNlcy9ub2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFpQkUsWUFBaUI7SUFDakIsYUFBa0I7SUFDbEIsT0FBWTtJQUNaLFVBQWU7SUFDZixnQkFBcUI7SUFDckIsbUJBQXdCO0lBQ3hCLGVBQW9COzs7OztJQU9wQixxRkFBcUY7SUFDckYsd0JBQXVEO0lBRXZELGlEQUFpRDtJQUNqRCxpQkFBZ0Q7SUFFaEQscURBQXFEO0lBQ3JELGlCQUFnRDtJQUVoRCwwREFBMEQ7SUFDMUQsc0JBQW9EO0lBRXBELG9GQUFvRjtJQUNwRixvQkFBa0Q7SUFFbEQsNkZBQTZGO0lBQzdGLCtCQUFnQzs7Ozs7SUFPaEMsNEZBQTRGO0lBQzVGLDhCQUE0RDtJQUU1RDswQkFDc0I7SUFDdEIsOEJBQStCO0lBQy9CLG1DQUFpRTs7Ozs7SUFPakU7Ozs7T0FJRztJQUNILGVBQWdCO0lBRWhCOzs7OztPQUtHO0lBQ0gsYUFBYzs7Ozs7Ozs7Ozs7Ozs7O0FBcUJoQiwyQkF5TUM7Ozs7OztJQXZNQyxxQkFBZ0I7Ozs7Ozs7Ozs7SUFVaEIsc0JBQWM7Ozs7Ozs7Ozs7Ozs7OztJQWVkLDhCQUFzQjs7Ozs7Ozs7Ozs7SUFXdEIsc0JBQWtCOzs7Ozs7OztJQVFsQixnQ0FBc0M7Ozs7O0lBR3RDLHdCQUFxQjs7Ozs7Ozs7Ozs7Ozs7OztJQWdCckIsc0JBQXdCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBbUJ4QiwyQkFBbUM7Ozs7O0lBR25DLDhCQUErQzs7Ozs7Ozs7SUFRL0MsdUJBQXVDOzs7Ozs7OztJQVF2Qyx3QkFBd0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFzQnhDLHVCQUEyQjs7Ozs7O0lBTTNCLHFCQUFpQjs7Ozs7Ozs7SUFRakIsc0JBQWtCOzs7Ozs7Ozs7Ozs7Ozs7O0lBZ0JsQix1QkFBeUM7Ozs7OztJQU16Qyx5QkFBdUI7O0lBRXZCLGdDQUFxQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFxQ3JDLDJCQUF1Qzs7Ozs7O0FBSXpDLGtDQWtCQzs7Ozs7O0lBaEJDLDZCQUFjOztJQUNkLDZCQUF3Rjs7Ozs7OztJQU14Riw4QkFBZ0Q7O0lBQ2hELDhCQUFhOzs7Ozs7O0lBT2Isa0NBQWdDOzs7Ozs7QUFJbEMsK0JBWUM7Ozs7OztJQVZDLDBCQUFjOztJQUNkLDBCQUFZOzs7Ozs7O0lBTVosMkJBQWdEOztJQUNoRCwyQkFBYTs7SUFDYiwrQkFBaUI7Ozs7OztBQUluQixvQ0FtQkM7Ozs7Ozs7OztJQVpDLCtCQUFjOztJQUNkLCtCQUFZOzs7Ozs7OztJQVFaLGdDQUFnRDs7SUFDaEQsZ0NBQTJCOztJQUMzQixvQ0FBaUI7Ozs7OztBQUluQiwyQ0FPQzs7Ozs7O0lBTEMsc0NBQWM7O0lBQ2Qsc0NBQXdGOztJQUN4Rix1Q0FBZ0Q7O0lBQ2hELHVDQUFhOztJQUNiLDJDQUFpQjs7Ozs7O0FBSW5CLHVDQVlDOzs7Ozs7SUFWQyxrQ0FBYzs7SUFDZCxrQ0FBbUM7O0lBQ25DLG1DQUFnRDs7SUFDaEQsbUNBQWE7O0lBQ2IsdUNBQWlCOzs7Ozs7SUFLakIsNENBQTZCOzs7Ozs7QUFJL0IsK0JBT0M7Ozs7OztJQUxDLDBCQUFjOztJQUNkLDBCQUF3Rjs7SUFDeEYsMkJBQTRCOztJQUM1QiwyQkFBYTs7SUFDYiwrQkFBaUI7Ozs7OztBQUluQixxQ0FhQzs7Ozs7O0lBWEMsZ0NBQVk7Ozs7Ozs7SUFNWixpQ0FBZ0Q7O0lBQ2hELGlDQUFhOzs7OztJQUdiLHFDQUFtQjs7Ozs7QUE2RHJCLE1BQU0sT0FBTyw2QkFBNkIsR0FBRyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1N0eWxpbmdDb250ZXh0fSBmcm9tICcuL3N0eWxpbmcnO1xuaW1wb3J0IHtMVmlld0RhdGEsIFRWaWV3fSBmcm9tICcuL3ZpZXcnO1xuXG5cbi8qKlxuICogVE5vZGVUeXBlIGNvcnJlc3BvbmRzIHRvIHRoZSBUTm9kZS50eXBlIHByb3BlcnR5LiBJdCBjb250YWlucyBpbmZvcm1hdGlvblxuICogb24gaG93IHRvIG1hcCBhIHBhcnRpY3VsYXIgc2V0IG9mIGJpdHMgaW4gVE5vZGUuZmxhZ3MgdG8gdGhlIG5vZGUgdHlwZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gVE5vZGVUeXBlIHtcbiAgQ29udGFpbmVyID0gMGIwMDAsXG4gIFByb2plY3Rpb24gPSAwYjAwMSxcbiAgVmlldyA9IDBiMDEwLFxuICBFbGVtZW50ID0gMGIwMTEsXG4gIFZpZXdPckVsZW1lbnQgPSAwYjAxMCxcbiAgRWxlbWVudENvbnRhaW5lciA9IDBiMTAwLFxuICBJY3VDb250YWluZXIgPSAwYjEwMSxcbn1cblxuLyoqXG4gKiBDb3JyZXNwb25kcyB0byB0aGUgVE5vZGUuZmxhZ3MgcHJvcGVydHkuXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIFROb2RlRmxhZ3Mge1xuICAvKiogVGhlIG51bWJlciBvZiBkaXJlY3RpdmVzIG9uIHRoaXMgbm9kZSBpcyBlbmNvZGVkIG9uIHRoZSBsZWFzdCBzaWduaWZpY2FudCBiaXRzICovXG4gIERpcmVjdGl2ZUNvdW50TWFzayA9IDBiMDAwMDAwMDAwMDAwMDAwMDAwMDAxMTExMTExMTExMTEsXG5cbiAgLyoqIFRoaXMgYml0IGlzIHNldCBpZiB0aGUgbm9kZSBpcyBhIGNvbXBvbmVudCAqL1xuICBpc0NvbXBvbmVudCA9IDBiMDAwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMDAwMDAsXG5cbiAgLyoqIFRoaXMgYml0IGlzIHNldCBpZiB0aGUgbm9kZSBoYXMgYmVlbiBwcm9qZWN0ZWQgKi9cbiAgaXNQcm9qZWN0ZWQgPSAwYjAwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMDAwMDAwLFxuXG4gIC8qKiBUaGlzIGJpdCBpcyBzZXQgaWYgdGhlIG5vZGUgaGFzIGFueSBjb250ZW50IHF1ZXJpZXMgKi9cbiAgaGFzQ29udGVudFF1ZXJ5ID0gMGIwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMDAwMDAwMCxcblxuICAvKiogVGhpcyBiaXQgaXMgc2V0IGlmIHRoZSBub2RlIGhhcyBhbnkgZGlyZWN0aXZlcyB0aGF0IGNvbnRhaW4gW2NsYXNzIHByb3BlcnRpZXMgKi9cbiAgaGFzQ2xhc3NJbnB1dCA9IDBiMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMDAwMDAwMDAsXG5cbiAgLyoqIFRoZSBpbmRleCBvZiB0aGUgZmlyc3QgZGlyZWN0aXZlIG9uIHRoaXMgbm9kZSBpcyBlbmNvZGVkIG9uIHRoZSBtb3N0IHNpZ25pZmljYW50IGJpdHMgICovXG4gIERpcmVjdGl2ZVN0YXJ0aW5nSW5kZXhTaGlmdCA9IDE2LFxufVxuXG4vKipcbiAqIENvcnJlc3BvbmRzIHRvIHRoZSBUTm9kZS5wcm92aWRlckluZGV4ZXMgcHJvcGVydHkuXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIFROb2RlUHJvdmlkZXJJbmRleGVzIHtcbiAgLyoqIFRoZSBpbmRleCBvZiB0aGUgZmlyc3QgcHJvdmlkZXIgb24gdGhpcyBub2RlIGlzIGVuY29kZWQgb24gdGhlIGxlYXN0IHNpZ25pZmljYW50IGJpdHMgKi9cbiAgUHJvdmlkZXJzU3RhcnRJbmRleE1hc2sgPSAwYjAwMDAwMDAwMDAwMDAwMDAxMTExMTExMTExMTExMTExLFxuXG4gIC8qKiBUaGUgY291bnQgb2YgdmlldyBwcm92aWRlcnMgZnJvbSB0aGUgY29tcG9uZW50IG9uIHRoaXMgbm9kZSBpcyBlbmNvZGVkIG9uIHRoZSAxNiBtb3N0XG4gICAgIHNpZ25pZmljYW50IGJpdHMgKi9cbiAgQ3B0Vmlld1Byb3ZpZGVyc0NvdW50U2hpZnQgPSAxNixcbiAgQ3B0Vmlld1Byb3ZpZGVyc0NvdW50U2hpZnRlciA9IDBiMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAwMDAwMDAwMDAsXG59XG4vKipcbiAqIEEgc2V0IG9mIG1hcmtlciB2YWx1ZXMgdG8gYmUgdXNlZCBpbiB0aGUgYXR0cmlidXRlcyBhcnJheXMuIFRob3NlIG1hcmtlcnMgaW5kaWNhdGUgdGhhdCBzb21lXG4gKiBpdGVtcyBhcmUgbm90IHJlZ3VsYXIgYXR0cmlidXRlcyBhbmQgdGhlIHByb2Nlc3Npbmcgc2hvdWxkIGJlIGFkYXB0ZWQgYWNjb3JkaW5nbHkuXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIEF0dHJpYnV0ZU1hcmtlciB7XG4gIC8qKlxuICAgKiBNYXJrZXIgaW5kaWNhdGVzIHRoYXQgdGhlIGZvbGxvd2luZyAzIHZhbHVlcyBpbiB0aGUgYXR0cmlidXRlcyBhcnJheSBhcmU6XG4gICAqIG5hbWVzcGFjZVVyaSwgYXR0cmlidXRlTmFtZSwgYXR0cmlidXRlVmFsdWVcbiAgICogaW4gdGhhdCBvcmRlci5cbiAgICovXG4gIE5hbWVzcGFjZVVSSSA9IDAsXG5cbiAgLyoqXG4gICAqIFRoaXMgbWFya2VyIGluZGljYXRlcyB0aGF0IHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlIG5hbWVzIHdlcmUgZXh0cmFjdGVkIGZyb20gYmluZGluZ3MgKGV4LjpcbiAgICogW2Zvb109XCJleHBcIikgYW5kIC8gb3IgZXZlbnQgaGFuZGxlcnMgKGV4LiAoYmFyKT1cImRvU3RoKClcIikuXG4gICAqIFRha2luZyB0aGUgYWJvdmUgYmluZGluZ3MgYW5kIG91dHB1dHMgYXMgYW4gZXhhbXBsZSBhbiBhdHRyaWJ1dGVzIGFycmF5IGNvdWxkIGxvb2sgYXMgZm9sbG93czpcbiAgICogWydjbGFzcycsICdmYWRlIGluJywgQXR0cmlidXRlTWFya2VyLlNlbGVjdE9ubHksICdmb28nLCAnYmFyJ11cbiAgICovXG4gIFNlbGVjdE9ubHkgPSAxXG59XG5cbi8qKlxuICogQSBjb21iaW5hdGlvbiBvZjpcbiAqIC0gYXR0cmlidXRlIG5hbWVzIGFuZCB2YWx1ZXNcbiAqIC0gc3BlY2lhbCBtYXJrZXJzIGFjdGluZyBhcyBmbGFncyB0byBhbHRlciBhdHRyaWJ1dGVzIHByb2Nlc3NpbmcuXG4gKi9cbmV4cG9ydCB0eXBlIFRBdHRyaWJ1dGVzID0gKHN0cmluZyB8IEF0dHJpYnV0ZU1hcmtlcilbXTtcblxuLyoqXG4gKiBCaW5kaW5nIGRhdGEgKGZseXdlaWdodCkgZm9yIGEgcGFydGljdWxhciBub2RlIHRoYXQgaXMgc2hhcmVkIGJldHdlZW4gYWxsIHRlbXBsYXRlc1xuICogb2YgYSBzcGVjaWZpYyB0eXBlLlxuICpcbiAqIElmIGEgcHJvcGVydHkgaXM6XG4gKiAgICAtIFByb3BlcnR5QWxpYXNlczogdGhhdCBwcm9wZXJ0eSdzIGRhdGEgd2FzIGdlbmVyYXRlZCBhbmQgdGhpcyBpcyBpdFxuICogICAgLSBOdWxsOiB0aGF0IHByb3BlcnR5J3MgZGF0YSB3YXMgYWxyZWFkeSBnZW5lcmF0ZWQgYW5kIG5vdGhpbmcgd2FzIGZvdW5kLlxuICogICAgLSBVbmRlZmluZWQ6IHRoYXQgcHJvcGVydHkncyBkYXRhIGhhcyBub3QgeWV0IGJlZW4gZ2VuZXJhdGVkXG4gKlxuICogc2VlOiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9GbHl3ZWlnaHRfcGF0dGVybiBmb3IgbW9yZSBvbiB0aGUgRmx5d2VpZ2h0IHBhdHRlcm5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUTm9kZSB7XG4gIC8qKiBUaGUgdHlwZSBvZiB0aGUgVE5vZGUuIFNlZSBUTm9kZVR5cGUuICovXG4gIHR5cGU6IFROb2RlVHlwZTtcblxuICAvKipcbiAgICogSW5kZXggb2YgdGhlIFROb2RlIGluIFRWaWV3LmRhdGEgYW5kIGNvcnJlc3BvbmRpbmcgbmF0aXZlIGVsZW1lbnQgaW4gTFZpZXdEYXRhLlxuICAgKlxuICAgKiBUaGlzIGlzIG5lY2Vzc2FyeSB0byBnZXQgZnJvbSBhbnkgVE5vZGUgdG8gaXRzIGNvcnJlc3BvbmRpbmcgbmF0aXZlIGVsZW1lbnQgd2hlblxuICAgKiB0cmF2ZXJzaW5nIHRoZSBub2RlIHRyZWUuXG4gICAqXG4gICAqIElmIGluZGV4IGlzIC0xLCB0aGlzIGlzIGEgZHluYW1pY2FsbHkgY3JlYXRlZCBjb250YWluZXIgbm9kZSBvciBlbWJlZGRlZCB2aWV3IG5vZGUuXG4gICAqL1xuICBpbmRleDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBUaGUgaW5kZXggb2YgdGhlIGNsb3Nlc3QgaW5qZWN0b3IgaW4gdGhpcyBub2RlJ3MgTFZpZXdEYXRhLlxuICAgKlxuICAgKiBJZiB0aGUgaW5kZXggPT09IC0xLCB0aGVyZSBpcyBubyBpbmplY3RvciBvbiB0aGlzIG5vZGUgb3IgYW55IGFuY2VzdG9yIG5vZGUgaW4gdGhpcyB2aWV3LlxuICAgKlxuICAgKiBJZiB0aGUgaW5kZXggIT09IC0xLCBpdCBpcyB0aGUgaW5kZXggb2YgdGhpcyBub2RlJ3MgaW5qZWN0b3IgT1IgdGhlIGluZGV4IG9mIGEgcGFyZW50IGluamVjdG9yXG4gICAqIGluIHRoZSBzYW1lIHZpZXcuIFdlIHBhc3MgdGhlIHBhcmVudCBpbmplY3RvciBpbmRleCBkb3duIHRoZSBub2RlIHRyZWUgb2YgYSB2aWV3IHNvIGl0J3NcbiAgICogcG9zc2libGUgdG8gZmluZCB0aGUgcGFyZW50IGluamVjdG9yIHdpdGhvdXQgd2Fsa2luZyBhIHBvdGVudGlhbGx5IGRlZXAgbm9kZSB0cmVlLiBJbmplY3RvclxuICAgKiBpbmRpY2VzIGFyZSBub3Qgc2V0IGFjcm9zcyB2aWV3IGJvdW5kYXJpZXMgYmVjYXVzZSB0aGVyZSBjb3VsZCBiZSBtdWx0aXBsZSBjb21wb25lbnQgaG9zdHMuXG4gICAqXG4gICAqIElmIHROb2RlLmluamVjdG9ySW5kZXggPT09IHROb2RlLnBhcmVudC5pbmplY3RvckluZGV4LCB0aGVuIHRoZSBpbmRleCBiZWxvbmdzIHRvIGEgcGFyZW50XG4gICAqIGluamVjdG9yLlxuICAgKi9cbiAgaW5qZWN0b3JJbmRleDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBUaGlzIG51bWJlciBzdG9yZXMgdHdvIHZhbHVlcyB1c2luZyBpdHMgYml0czpcbiAgICpcbiAgICogLSB0aGUgbnVtYmVyIG9mIGRpcmVjdGl2ZXMgb24gdGhhdCBub2RlIChmaXJzdCAxMiBiaXRzKVxuICAgKiAtIHRoZSBzdGFydGluZyBpbmRleCBvZiB0aGUgbm9kZSdzIGRpcmVjdGl2ZXMgaW4gdGhlIGRpcmVjdGl2ZXMgYXJyYXkgKGxhc3QgMjAgYml0cykuXG4gICAqXG4gICAqIFRoZXNlIHR3byB2YWx1ZXMgYXJlIG5lY2Vzc2FyeSBzbyBESSBjYW4gZWZmZWN0aXZlbHkgc2VhcmNoIHRoZSBkaXJlY3RpdmVzIGFzc29jaWF0ZWRcbiAgICogd2l0aCBhIG5vZGUgd2l0aG91dCBzZWFyY2hpbmcgdGhlIHdob2xlIGRpcmVjdGl2ZXMgYXJyYXkuXG4gICAqL1xuICBmbGFnczogVE5vZGVGbGFncztcblxuICAvKipcbiAgICogVGhpcyBudW1iZXIgc3RvcmVzIHR3byB2YWx1ZXMgdXNpbmcgaXRzIGJpdHM6XG4gICAqXG4gICAqIC0gdGhlIGluZGV4IG9mIHRoZSBmaXJzdCBwcm92aWRlciBvbiB0aGF0IG5vZGUgKGZpcnN0IDE2IGJpdHMpXG4gICAqIC0gdGhlIGNvdW50IG9mIHZpZXcgcHJvdmlkZXJzIGZyb20gdGhlIGNvbXBvbmVudCBvbiB0aGlzIG5vZGUgKGxhc3QgMTYgYml0cylcbiAgICovXG4gIHByb3ZpZGVySW5kZXhlczogVE5vZGVQcm92aWRlckluZGV4ZXM7XG5cbiAgLyoqIFRoZSB0YWcgbmFtZSBhc3NvY2lhdGVkIHdpdGggdGhpcyBub2RlLiAqL1xuICB0YWdOYW1lOiBzdHJpbmd8bnVsbDtcblxuICAvKipcbiAgICogQXR0cmlidXRlcyBhc3NvY2lhdGVkIHdpdGggYW4gZWxlbWVudC4gV2UgbmVlZCB0byBzdG9yZSBhdHRyaWJ1dGVzIHRvIHN1cHBvcnQgdmFyaW91cyB1c2UtY2FzZXNcbiAgICogKGF0dHJpYnV0ZSBpbmplY3Rpb24sIGNvbnRlbnQgcHJvamVjdGlvbiB3aXRoIHNlbGVjdG9ycywgZGlyZWN0aXZlcyBtYXRjaGluZykuXG4gICAqIEF0dHJpYnV0ZXMgYXJlIHN0b3JlZCBzdGF0aWNhbGx5IGJlY2F1c2UgcmVhZGluZyB0aGVtIGZyb20gdGhlIERPTSB3b3VsZCBiZSB3YXkgdG9vIHNsb3cgZm9yXG4gICAqIGNvbnRlbnQgcHJvamVjdGlvbiBhbmQgcXVlcmllcy5cbiAgICpcbiAgICogU2luY2UgYXR0cnMgd2lsbCBhbHdheXMgYmUgY2FsY3VsYXRlZCBmaXJzdCwgdGhleSB3aWxsIG5ldmVyIG5lZWQgdG8gYmUgbWFya2VkIHVuZGVmaW5lZCBieVxuICAgKiBvdGhlciBpbnN0cnVjdGlvbnMuXG4gICAqXG4gICAqIEZvciByZWd1bGFyIGF0dHJpYnV0ZXMgYSBuYW1lIG9mIGFuIGF0dHJpYnV0ZSBhbmQgaXRzIHZhbHVlIGFsdGVybmF0ZSBpbiB0aGUgYXJyYXkuXG4gICAqIGUuZy4gWydyb2xlJywgJ2NoZWNrYm94J11cbiAgICogVGhpcyBhcnJheSBjYW4gY29udGFpbiBmbGFncyB0aGF0IHdpbGwgaW5kaWNhdGUgXCJzcGVjaWFsIGF0dHJpYnV0ZXNcIiAoYXR0cmlidXRlcyB3aXRoXG4gICAqIG5hbWVzcGFjZXMsIGF0dHJpYnV0ZXMgZXh0cmFjdGVkIGZyb20gYmluZGluZ3MgYW5kIG91dHB1dHMpLlxuICAgKi9cbiAgYXR0cnM6IFRBdHRyaWJ1dGVzfG51bGw7XG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIGxvY2FsIG5hbWVzIHVuZGVyIHdoaWNoIGEgZ2l2ZW4gZWxlbWVudCBpcyBleHBvcnRlZCBpbiBhIHRlbXBsYXRlIGFuZFxuICAgKiB2aXNpYmxlIHRvIHF1ZXJpZXMuIEFuIGVudHJ5IGluIHRoaXMgYXJyYXkgY2FuIGJlIGNyZWF0ZWQgZm9yIGRpZmZlcmVudCByZWFzb25zOlxuICAgKiAtIGFuIGVsZW1lbnQgaXRzZWxmIGlzIHJlZmVyZW5jZWQsIGV4LjogYDxkaXYgI2Zvbz5gXG4gICAqIC0gYSBjb21wb25lbnQgaXMgcmVmZXJlbmNlZCwgZXguOiBgPG15LWNtcHQgI2Zvbz5gXG4gICAqIC0gYSBkaXJlY3RpdmUgaXMgcmVmZXJlbmNlZCwgZXguOiBgPG15LWNtcHQgI2Zvbz1cImRpcmVjdGl2ZUV4cG9ydEFzXCI+YC5cbiAgICpcbiAgICogQSBnaXZlbiBlbGVtZW50IG1pZ2h0IGhhdmUgZGlmZmVyZW50IGxvY2FsIG5hbWVzIGFuZCB0aG9zZSBuYW1lcyBjYW4gYmUgYXNzb2NpYXRlZFxuICAgKiB3aXRoIGEgZGlyZWN0aXZlLiBXZSBzdG9yZSBsb2NhbCBuYW1lcyBhdCBldmVuIGluZGV4ZXMgd2hpbGUgb2RkIGluZGV4ZXMgYXJlIHJlc2VydmVkXG4gICAqIGZvciBkaXJlY3RpdmUgaW5kZXggaW4gYSB2aWV3IChvciBgLTFgIGlmIHRoZXJlIGlzIG5vIGFzc29jaWF0ZWQgZGlyZWN0aXZlKS5cbiAgICpcbiAgICogU29tZSBleGFtcGxlczpcbiAgICogLSBgPGRpdiAjZm9vPmAgPT4gYFtcImZvb1wiLCAtMV1gXG4gICAqIC0gYDxteS1jbXB0ICNmb28+YCA9PiBgW1wiZm9vXCIsIG15Q21wdElkeF1gXG4gICAqIC0gYDxteS1jbXB0ICNmb28gI2Jhcj1cImRpcmVjdGl2ZUV4cG9ydEFzXCI+YCA9PiBgW1wiZm9vXCIsIG15Q21wdElkeCwgXCJiYXJcIiwgZGlyZWN0aXZlSWR4XWBcbiAgICogLSBgPGRpdiAjZm9vICNiYXI9XCJkaXJlY3RpdmVFeHBvcnRBc1wiPmAgPT4gYFtcImZvb1wiLCAtMSwgXCJiYXJcIiwgZGlyZWN0aXZlSWR4XWBcbiAgICovXG4gIGxvY2FsTmFtZXM6IChzdHJpbmd8bnVtYmVyKVtdfG51bGw7XG5cbiAgLyoqIEluZm9ybWF0aW9uIGFib3V0IGlucHV0IHByb3BlcnRpZXMgdGhhdCBuZWVkIHRvIGJlIHNldCBvbmNlIGZyb20gYXR0cmlidXRlIGRhdGEuICovXG4gIGluaXRpYWxJbnB1dHM6IEluaXRpYWxJbnB1dERhdGF8bnVsbHx1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIElucHV0IGRhdGEgZm9yIGFsbCBkaXJlY3RpdmVzIG9uIHRoaXMgbm9kZS5cbiAgICpcbiAgICogLSBgdW5kZWZpbmVkYCBtZWFucyB0aGF0IHRoZSBwcm9wIGhhcyBub3QgYmVlbiBpbml0aWFsaXplZCB5ZXQsXG4gICAqIC0gYG51bGxgIG1lYW5zIHRoYXQgdGhlIHByb3AgaGFzIGJlZW4gaW5pdGlhbGl6ZWQgYnV0IG5vIGlucHV0cyBoYXZlIGJlZW4gZm91bmQuXG4gICAqL1xuICBpbnB1dHM6IFByb3BlcnR5QWxpYXNlc3xudWxsfHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogT3V0cHV0IGRhdGEgZm9yIGFsbCBkaXJlY3RpdmVzIG9uIHRoaXMgbm9kZS5cbiAgICpcbiAgICogLSBgdW5kZWZpbmVkYCBtZWFucyB0aGF0IHRoZSBwcm9wIGhhcyBub3QgYmVlbiBpbml0aWFsaXplZCB5ZXQsXG4gICAqIC0gYG51bGxgIG1lYW5zIHRoYXQgdGhlIHByb3AgaGFzIGJlZW4gaW5pdGlhbGl6ZWQgYnV0IG5vIG91dHB1dHMgaGF2ZSBiZWVuIGZvdW5kLlxuICAgKi9cbiAgb3V0cHV0czogUHJvcGVydHlBbGlhc2VzfG51bGx8dW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBUaGUgVFZpZXcgb3IgVFZpZXdzIGF0dGFjaGVkIHRvIHRoaXMgbm9kZS5cbiAgICpcbiAgICogSWYgdGhpcyBUTm9kZSBjb3JyZXNwb25kcyB0byBhbiBMQ29udGFpbmVyIHdpdGggaW5saW5lIHZpZXdzLCB0aGUgY29udGFpbmVyIHdpbGxcbiAgICogbmVlZCB0byBzdG9yZSBzZXBhcmF0ZSBzdGF0aWMgZGF0YSBmb3IgZWFjaCBvZiBpdHMgdmlldyBibG9ja3MgKFRWaWV3W10pLiBPdGhlcndpc2UsXG4gICAqIG5vZGVzIGluIGlubGluZSB2aWV3cyB3aXRoIHRoZSBzYW1lIGluZGV4IGFzIG5vZGVzIGluIHRoZWlyIHBhcmVudCB2aWV3cyB3aWxsIG92ZXJ3cml0ZVxuICAgKiBlYWNoIG90aGVyLCBhcyB0aGV5IGFyZSBpbiB0aGUgc2FtZSB0ZW1wbGF0ZS5cbiAgICpcbiAgICogRWFjaCBpbmRleCBpbiB0aGlzIGFycmF5IGNvcnJlc3BvbmRzIHRvIHRoZSBzdGF0aWMgZGF0YSBmb3IgYSBjZXJ0YWluXG4gICAqIHZpZXcuIFNvIGlmIHlvdSBoYWQgVigwKSBhbmQgVigxKSBpbiBhIGNvbnRhaW5lciwgeW91IG1pZ2h0IGhhdmU6XG4gICAqXG4gICAqIFtcbiAgICogICBbe3RhZ05hbWU6ICdkaXYnLCBhdHRyczogLi4ufSwgbnVsbF0sICAgICAvLyBWKDApIFRWaWV3XG4gICAqICAgW3t0YWdOYW1lOiAnYnV0dG9uJywgYXR0cnMgLi4ufSwgbnVsbF0gICAgLy8gVigxKSBUVmlld1xuICAgKlxuICAgKiBJZiB0aGlzIFROb2RlIGNvcnJlc3BvbmRzIHRvIGFuIExDb250YWluZXIgd2l0aCBhIHRlbXBsYXRlIChlLmcuIHN0cnVjdHVyYWxcbiAgICogZGlyZWN0aXZlKSwgdGhlIHRlbXBsYXRlJ3MgVFZpZXcgd2lsbCBiZSBzdG9yZWQgaGVyZS5cbiAgICpcbiAgICogSWYgdGhpcyBUTm9kZSBjb3JyZXNwb25kcyB0byBhbiBlbGVtZW50LCB0Vmlld3Mgd2lsbCBiZSBudWxsIC5cbiAgICovXG4gIHRWaWV3czogVFZpZXd8VFZpZXdbXXxudWxsO1xuXG4gIC8qKlxuICAgKiBUaGUgbmV4dCBzaWJsaW5nIG5vZGUuIE5lY2Vzc2FyeSBzbyB3ZSBjYW4gcHJvcGFnYXRlIHRocm91Z2ggdGhlIHJvb3Qgbm9kZXMgb2YgYSB2aWV3XG4gICAqIHRvIGluc2VydCB0aGVtIG9yIHJlbW92ZSB0aGVtIGZyb20gdGhlIERPTS5cbiAgICovXG4gIG5leHQ6IFROb2RlfG51bGw7XG5cbiAgLyoqXG4gICAqIEZpcnN0IGNoaWxkIG9mIHRoZSBjdXJyZW50IG5vZGUuXG4gICAqXG4gICAqIEZvciBjb21wb25lbnQgbm9kZXMsIHRoZSBjaGlsZCB3aWxsIGFsd2F5cyBiZSBhIENvbnRlbnRDaGlsZCAoaW4gc2FtZSB2aWV3KS5cbiAgICogRm9yIGVtYmVkZGVkIHZpZXcgbm9kZXMsIHRoZSBjaGlsZCB3aWxsIGJlIGluIHRoZWlyIGNoaWxkIHZpZXcuXG4gICAqL1xuICBjaGlsZDogVE5vZGV8bnVsbDtcblxuICAvKipcbiAgICogUGFyZW50IG5vZGUgKGluIHRoZSBzYW1lIHZpZXcgb25seSkuXG4gICAqXG4gICAqIFdlIG5lZWQgYSByZWZlcmVuY2UgdG8gYSBub2RlJ3MgcGFyZW50IHNvIHdlIGNhbiBhcHBlbmQgdGhlIG5vZGUgdG8gaXRzIHBhcmVudCdzIG5hdGl2ZVxuICAgKiBlbGVtZW50IGF0IHRoZSBhcHByb3ByaWF0ZSB0aW1lLlxuICAgKlxuICAgKiBJZiB0aGUgcGFyZW50IHdvdWxkIGJlIGluIGEgZGlmZmVyZW50IHZpZXcgKGUuZy4gY29tcG9uZW50IGhvc3QpLCB0aGlzIHByb3BlcnR5IHdpbGwgYmUgbnVsbC5cbiAgICogSXQncyBpbXBvcnRhbnQgdGhhdCB3ZSBkb24ndCB0cnkgdG8gY3Jvc3MgY29tcG9uZW50IGJvdW5kYXJpZXMgd2hlbiByZXRyaWV2aW5nIHRoZSBwYXJlbnRcbiAgICogYmVjYXVzZSB0aGUgcGFyZW50IHdpbGwgY2hhbmdlIChlLmcuIGluZGV4LCBhdHRycykgZGVwZW5kaW5nIG9uIHdoZXJlIHRoZSBjb21wb25lbnQgd2FzXG4gICAqIHVzZWQgKGFuZCB0aHVzIHNob3VsZG4ndCBiZSBzdG9yZWQgb24gVE5vZGUpLiBJbiB0aGVzZSBjYXNlcywgd2UgcmV0cmlldmUgdGhlIHBhcmVudCB0aHJvdWdoXG4gICAqIExWaWV3Lm5vZGUgaW5zdGVhZCAod2hpY2ggd2lsbCBiZSBpbnN0YW5jZS1zcGVjaWZpYykuXG4gICAqXG4gICAqIElmIHRoaXMgaXMgYW4gaW5saW5lIHZpZXcgbm9kZSAoViksIHRoZSBwYXJlbnQgd2lsbCBiZSBpdHMgY29udGFpbmVyLlxuICAgKi9cbiAgcGFyZW50OiBURWxlbWVudE5vZGV8VENvbnRhaW5lck5vZGV8bnVsbDtcblxuICAvKipcbiAgICogSWYgdGhpcyBub2RlIGlzIHBhcnQgb2YgYW4gaTE4biBibG9jaywgaXQgaW5kaWNhdGVzIHdoZXRoZXIgdGhpcyBub2RlIGlzIHBhcnQgb2YgdGhlIERPTS5cbiAgICogSWYgdGhpcyBub2RlIGlzIG5vdCBwYXJ0IG9mIGFuIGkxOG4gYmxvY2ssIHRoaXMgZmllbGQgaXMgbnVsbC5cbiAgICovXG4gIGRldGFjaGVkOiBib29sZWFufG51bGw7XG5cbiAgc3R5bGluZ1RlbXBsYXRlOiBTdHlsaW5nQ29udGV4dHxudWxsO1xuICAvKipcbiAgICogTGlzdCBvZiBwcm9qZWN0ZWQgVE5vZGVzIGZvciBhIGdpdmVuIGNvbXBvbmVudCBob3N0IGVsZW1lbnQgT1IgaW5kZXggaW50byB0aGUgc2FpZCBub2Rlcy5cbiAgICpcbiAgICogRm9yIGVhc2llciBkaXNjdXNzaW9uIGFzc3VtZSB0aGlzIGV4YW1wbGU6XG4gICAqIGA8cGFyZW50PmAncyB2aWV3IGRlZmluaXRpb246XG4gICAqIGBgYFxuICAgKiA8Y2hpbGQgaWQ9XCJjMVwiPmNvbnRlbnQxPC9jaGlsZD5cbiAgICogPGNoaWxkIGlkPVwiYzJcIj48c3Bhbj5jb250ZW50Mjwvc3Bhbj48L2NoaWxkPlxuICAgKiBgYGBcbiAgICogYDxjaGlsZD5gJ3MgdmlldyBkZWZpbml0aW9uOlxuICAgKiBgYGBcbiAgICogPG5nLWNvbnRlbnQgaWQ9XCJjb250MVwiPjwvbmctY29udGVudD5cbiAgICogYGBgXG4gICAqXG4gICAqIElmIGBBcnJheS5pc0FycmF5KHByb2plY3Rpb24pYCB0aGVuIGBUTm9kZWAgaXMgYSBob3N0IGVsZW1lbnQ6XG4gICAqIC0gYHByb2plY3Rpb25gIHN0b3JlcyB0aGUgY29udGVudCBub2RlcyB3aGljaCBhcmUgdG8gYmUgcHJvamVjdGVkLlxuICAgKiAgICAtIFRoZSBub2RlcyByZXByZXNlbnQgY2F0ZWdvcmllcyBkZWZpbmVkIGJ5IHRoZSBzZWxlY3RvcjogRm9yIGV4YW1wbGU6XG4gICAqICAgICAgYDxuZy1jb250ZW50Lz48bmctY29udGVudCBzZWxlY3Q9XCJhYmNcIi8+YCB3b3VsZCByZXByZXNlbnQgdGhlIGhlYWRzIGZvciBgPG5nLWNvbnRlbnQvPmBcbiAgICogICAgICBhbmQgYDxuZy1jb250ZW50IHNlbGVjdD1cImFiY1wiLz5gIHJlc3BlY3RpdmVseS5cbiAgICogICAgLSBUaGUgbm9kZXMgd2Ugc3RvcmUgaW4gYHByb2plY3Rpb25gIGFyZSBoZWFkcyBvbmx5LCB3ZSB1c2VkIGAubmV4dGAgdG8gZ2V0IHRoZWlyXG4gICAqICAgICAgc2libGluZ3MuXG4gICAqICAgIC0gVGhlIG5vZGVzIGAubmV4dGAgaXMgc29ydGVkL3Jld3JpdHRlbiBhcyBwYXJ0IG9mIHRoZSBwcm9qZWN0aW9uIHNldHVwLlxuICAgKiAgICAtIGBwcm9qZWN0aW9uYCBzaXplIGlzIGVxdWFsIHRvIHRoZSBudW1iZXIgb2YgcHJvamVjdGlvbnMgYDxuZy1jb250ZW50PmAuIFRoZSBzaXplIG9mXG4gICAqICAgICAgYGMxYCB3aWxsIGJlIGAxYCBiZWNhdXNlIGA8Y2hpbGQ+YCBoYXMgb25seSBvbmUgYDxuZy1jb250ZW50PmAuXG4gICAqIC0gd2Ugc3RvcmUgYHByb2plY3Rpb25gIHdpdGggdGhlIGhvc3QgKGBjMWAsIGBjMmApIHJhdGhlciB0aGFuIHRoZSBgPG5nLWNvbnRlbnQ+YCAoYGNvbnQxYClcbiAgICogICBiZWNhdXNlIHRoZSBzYW1lIGNvbXBvbmVudCAoYDxjaGlsZD5gKSBjYW4gYmUgdXNlZCBpbiBtdWx0aXBsZSBsb2NhdGlvbnMgKGBjMWAsIGBjMmApIGFuZCBhc1xuICAgKiAgIGEgcmVzdWx0IGhhdmUgZGlmZmVyZW50IHNldCBvZiBub2RlcyB0byBwcm9qZWN0LlxuICAgKiAtIHdpdGhvdXQgYHByb2plY3Rpb25gIGl0IHdvdWxkIGJlIGRpZmZpY3VsdCB0byBlZmZpY2llbnRseSB0cmF2ZXJzZSBub2RlcyB0byBiZSBwcm9qZWN0ZWQuXG4gICAqXG4gICAqIElmIGB0eXBlb2YgcHJvamVjdGlvbiA9PSAnbnVtYmVyJ2AgdGhlbiBgVE5vZGVgIGlzIGEgYDxuZy1jb250ZW50PmAgZWxlbWVudDpcbiAgICogLSBgcHJvamVjdGlvbmAgaXMgYW4gaW5kZXggb2YgdGhlIGhvc3QncyBgcHJvamVjdGlvbmBOb2Rlcy5cbiAgICogICAtIFRoaXMgd291bGQgcmV0dXJuIHRoZSBmaXJzdCBoZWFkIG5vZGUgdG8gcHJvamVjdDpcbiAgICogICAgIGBnZXRIb3N0KGN1cnJlbnRUTm9kZSkucHJvamVjdGlvbltjdXJyZW50VE5vZGUucHJvamVjdGlvbl1gLlxuICAgKiAtIFdoZW4gcHJvamVjdGluZyBub2RlcyB0aGUgcGFyZW50IG5vZGUgcmV0cmlldmVkIG1heSBiZSBhIGA8bmctY29udGVudD5gIG5vZGUsIGluIHdoaWNoIGNhc2VcbiAgICogICB0aGUgcHJvY2VzcyBpcyByZWN1cnNpdmUgaW4gbmF0dXJlIChub3QgaW1wbGVtZW50YXRpb24pLlxuICAgKi9cbiAgcHJvamVjdGlvbjogKFROb2RlfG51bGwpW118bnVtYmVyfG51bGw7XG59XG5cbi8qKiBTdGF0aWMgZGF0YSBmb3IgYW4gZWxlbWVudCAgKi9cbmV4cG9ydCBpbnRlcmZhY2UgVEVsZW1lbnROb2RlIGV4dGVuZHMgVE5vZGUge1xuICAvKiogSW5kZXggaW4gdGhlIGRhdGFbXSBhcnJheSAqL1xuICBpbmRleDogbnVtYmVyO1xuICBjaGlsZDogVEVsZW1lbnROb2RlfFRUZXh0Tm9kZXxURWxlbWVudENvbnRhaW5lck5vZGV8VENvbnRhaW5lck5vZGV8VFByb2plY3Rpb25Ob2RlfG51bGw7XG4gIC8qKlxuICAgKiBFbGVtZW50IG5vZGVzIHdpbGwgaGF2ZSBwYXJlbnRzIHVubGVzcyB0aGV5IGFyZSB0aGUgZmlyc3Qgbm9kZSBvZiBhIGNvbXBvbmVudCBvclxuICAgKiBlbWJlZGRlZCB2aWV3ICh3aGljaCBtZWFucyB0aGVpciBwYXJlbnQgaXMgaW4gYSBkaWZmZXJlbnQgdmlldyBhbmQgbXVzdCBiZVxuICAgKiByZXRyaWV2ZWQgdXNpbmcgdmlld0RhdGFbSE9TVF9OT0RFXSkuXG4gICAqL1xuICBwYXJlbnQ6IFRFbGVtZW50Tm9kZXxURWxlbWVudENvbnRhaW5lck5vZGV8bnVsbDtcbiAgdFZpZXdzOiBudWxsO1xuXG4gIC8qKlxuICAgKiBJZiB0aGlzIGlzIGEgY29tcG9uZW50IFROb2RlIHdpdGggcHJvamVjdGlvbiwgdGhpcyB3aWxsIGJlIGFuIGFycmF5IG9mIHByb2plY3RlZFxuICAgKiBUTm9kZXMgKHNlZSBUTm9kZS5wcm9qZWN0aW9uIGZvciBtb3JlIGluZm8pLiBJZiBpdCdzIGEgcmVndWxhciBlbGVtZW50IG5vZGUgb3IgYVxuICAgKiBjb21wb25lbnQgd2l0aG91dCBwcm9qZWN0aW9uLCBpdCB3aWxsIGJlIG51bGwuXG4gICAqL1xuICBwcm9qZWN0aW9uOiAoVE5vZGV8bnVsbClbXXxudWxsO1xufVxuXG4vKiogU3RhdGljIGRhdGEgZm9yIGEgdGV4dCBub2RlICovXG5leHBvcnQgaW50ZXJmYWNlIFRUZXh0Tm9kZSBleHRlbmRzIFROb2RlIHtcbiAgLyoqIEluZGV4IGluIHRoZSBkYXRhW10gYXJyYXkgKi9cbiAgaW5kZXg6IG51bWJlcjtcbiAgY2hpbGQ6IG51bGw7XG4gIC8qKlxuICAgKiBUZXh0IG5vZGVzIHdpbGwgaGF2ZSBwYXJlbnRzIHVubGVzcyB0aGV5IGFyZSB0aGUgZmlyc3Qgbm9kZSBvZiBhIGNvbXBvbmVudCBvclxuICAgKiBlbWJlZGRlZCB2aWV3ICh3aGljaCBtZWFucyB0aGVpciBwYXJlbnQgaXMgaW4gYSBkaWZmZXJlbnQgdmlldyBhbmQgbXVzdCBiZVxuICAgKiByZXRyaWV2ZWQgdXNpbmcgTFZpZXcubm9kZSkuXG4gICAqL1xuICBwYXJlbnQ6IFRFbGVtZW50Tm9kZXxURWxlbWVudENvbnRhaW5lck5vZGV8bnVsbDtcbiAgdFZpZXdzOiBudWxsO1xuICBwcm9qZWN0aW9uOiBudWxsO1xufVxuXG4vKiogU3RhdGljIGRhdGEgZm9yIGFuIExDb250YWluZXIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgVENvbnRhaW5lck5vZGUgZXh0ZW5kcyBUTm9kZSB7XG4gIC8qKlxuICAgKiBJbmRleCBpbiB0aGUgZGF0YVtdIGFycmF5LlxuICAgKlxuICAgKiBJZiBpdCdzIC0xLCB0aGlzIGlzIGEgZHluYW1pY2FsbHkgY3JlYXRlZCBjb250YWluZXIgbm9kZSB0aGF0IGlzbid0IHN0b3JlZCBpblxuICAgKiBkYXRhW10gKGUuZy4gd2hlbiB5b3UgaW5qZWN0IFZpZXdDb250YWluZXJSZWYpIC5cbiAgICovXG4gIGluZGV4OiBudW1iZXI7XG4gIGNoaWxkOiBudWxsO1xuXG4gIC8qKlxuICAgKiBDb250YWluZXIgbm9kZXMgd2lsbCBoYXZlIHBhcmVudHMgdW5sZXNzOlxuICAgKlxuICAgKiAtIFRoZXkgYXJlIHRoZSBmaXJzdCBub2RlIG9mIGEgY29tcG9uZW50IG9yIGVtYmVkZGVkIHZpZXdcbiAgICogLSBUaGV5IGFyZSBkeW5hbWljYWxseSBjcmVhdGVkXG4gICAqL1xuICBwYXJlbnQ6IFRFbGVtZW50Tm9kZXxURWxlbWVudENvbnRhaW5lck5vZGV8bnVsbDtcbiAgdFZpZXdzOiBUVmlld3xUVmlld1tdfG51bGw7XG4gIHByb2plY3Rpb246IG51bGw7XG59XG5cbi8qKiBTdGF0aWMgZGF0YSBmb3IgYW4gPG5nLWNvbnRhaW5lcj4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVEVsZW1lbnRDb250YWluZXJOb2RlIGV4dGVuZHMgVE5vZGUge1xuICAvKiogSW5kZXggaW4gdGhlIExWaWV3RGF0YVtdIGFycmF5LiAqL1xuICBpbmRleDogbnVtYmVyO1xuICBjaGlsZDogVEVsZW1lbnROb2RlfFRUZXh0Tm9kZXxUQ29udGFpbmVyTm9kZXxURWxlbWVudENvbnRhaW5lck5vZGV8VFByb2plY3Rpb25Ob2RlfG51bGw7XG4gIHBhcmVudDogVEVsZW1lbnROb2RlfFRFbGVtZW50Q29udGFpbmVyTm9kZXxudWxsO1xuICB0Vmlld3M6IG51bGw7XG4gIHByb2plY3Rpb246IG51bGw7XG59XG5cbi8qKiBTdGF0aWMgZGF0YSBmb3IgYW4gSUNVIGV4cHJlc3Npb24gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVEljdUNvbnRhaW5lck5vZGUgZXh0ZW5kcyBUTm9kZSB7XG4gIC8qKiBJbmRleCBpbiB0aGUgTFZpZXdEYXRhW10gYXJyYXkuICovXG4gIGluZGV4OiBudW1iZXI7XG4gIGNoaWxkOiBURWxlbWVudE5vZGV8VFRleHROb2RlfG51bGw7XG4gIHBhcmVudDogVEVsZW1lbnROb2RlfFRFbGVtZW50Q29udGFpbmVyTm9kZXxudWxsO1xuICB0Vmlld3M6IG51bGw7XG4gIHByb2plY3Rpb246IG51bGw7XG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgdGhlIGN1cnJlbnQgYWN0aXZlIGNhc2UgZm9yIGFuIElDVSBleHByZXNzaW9uLlxuICAgKiBJdCBpcyBudWxsIHdoZW4gdGhlcmUgaXMgbm8gYWN0aXZlIGNhc2UuXG4gICAqL1xuICBhY3RpdmVDYXNlSW5kZXg6IG51bWJlcnxudWxsO1xufVxuXG4vKiogU3RhdGljIGRhdGEgZm9yIGEgdmlldyAgKi9cbmV4cG9ydCBpbnRlcmZhY2UgVFZpZXdOb2RlIGV4dGVuZHMgVE5vZGUge1xuICAvKiogSWYgLTEsIGl0J3MgYSBkeW5hbWljYWxseSBjcmVhdGVkIHZpZXcuIE90aGVyd2lzZSwgaXQgaXMgdGhlIHZpZXcgYmxvY2sgSUQuICovXG4gIGluZGV4OiBudW1iZXI7XG4gIGNoaWxkOiBURWxlbWVudE5vZGV8VFRleHROb2RlfFRFbGVtZW50Q29udGFpbmVyTm9kZXxUQ29udGFpbmVyTm9kZXxUUHJvamVjdGlvbk5vZGV8bnVsbDtcbiAgcGFyZW50OiBUQ29udGFpbmVyTm9kZXxudWxsO1xuICB0Vmlld3M6IG51bGw7XG4gIHByb2plY3Rpb246IG51bGw7XG59XG5cbi8qKiBTdGF0aWMgZGF0YSBmb3IgYW4gTFByb2plY3Rpb25Ob2RlICAqL1xuZXhwb3J0IGludGVyZmFjZSBUUHJvamVjdGlvbk5vZGUgZXh0ZW5kcyBUTm9kZSB7XG4gIC8qKiBJbmRleCBpbiB0aGUgZGF0YVtdIGFycmF5ICovXG4gIGNoaWxkOiBudWxsO1xuICAvKipcbiAgICogUHJvamVjdGlvbiBub2RlcyB3aWxsIGhhdmUgcGFyZW50cyB1bmxlc3MgdGhleSBhcmUgdGhlIGZpcnN0IG5vZGUgb2YgYSBjb21wb25lbnRcbiAgICogb3IgZW1iZWRkZWQgdmlldyAod2hpY2ggbWVhbnMgdGhlaXIgcGFyZW50IGlzIGluIGEgZGlmZmVyZW50IHZpZXcgYW5kIG11c3QgYmVcbiAgICogcmV0cmlldmVkIHVzaW5nIExWaWV3Lm5vZGUpLlxuICAgKi9cbiAgcGFyZW50OiBURWxlbWVudE5vZGV8VEVsZW1lbnRDb250YWluZXJOb2RlfG51bGw7XG4gIHRWaWV3czogbnVsbDtcblxuICAvKiogSW5kZXggb2YgdGhlIHByb2plY3Rpb24gbm9kZS4gKFNlZSBUTm9kZS5wcm9qZWN0aW9uIGZvciBtb3JlIGluZm8uKSAqL1xuICBwcm9qZWN0aW9uOiBudW1iZXI7XG59XG5cbi8qKlxuICogVGhpcyBtYXBwaW5nIGlzIG5lY2Vzc2FyeSBzbyB3ZSBjYW4gc2V0IGlucHV0IHByb3BlcnRpZXMgYW5kIG91dHB1dCBsaXN0ZW5lcnNcbiAqIHByb3Blcmx5IGF0IHJ1bnRpbWUgd2hlbiBwcm9wZXJ0eSBuYW1lcyBhcmUgbWluaWZpZWQgb3IgYWxpYXNlZC5cbiAqXG4gKiBLZXk6IHVubWluaWZpZWQgLyBwdWJsaWMgaW5wdXQgb3Igb3V0cHV0IG5hbWVcbiAqIFZhbHVlOiBhcnJheSBjb250YWluaW5nIG1pbmlmaWVkIC8gaW50ZXJuYWwgbmFtZSBhbmQgcmVsYXRlZCBkaXJlY3RpdmUgaW5kZXhcbiAqXG4gKiBUaGUgdmFsdWUgbXVzdCBiZSBhbiBhcnJheSB0byBzdXBwb3J0IGlucHV0cyBhbmQgb3V0cHV0cyB3aXRoIHRoZSBzYW1lIG5hbWVcbiAqIG9uIHRoZSBzYW1lIG5vZGUuXG4gKi9cbmV4cG9ydCB0eXBlIFByb3BlcnR5QWxpYXNlcyA9IHtcbiAgLy8gVGhpcyB1c2VzIGFuIG9iamVjdCBtYXAgYmVjYXVzZSB1c2luZyB0aGUgTWFwIHR5cGUgd291bGQgYmUgdG9vIHNsb3dcbiAgW2tleTogc3RyaW5nXTogUHJvcGVydHlBbGlhc1ZhbHVlXG59O1xuXG4vKipcbiAqIFN0b3JlIHRoZSBydW50aW1lIGlucHV0IG9yIG91dHB1dCBuYW1lcyBmb3IgYWxsIHRoZSBkaXJlY3RpdmVzLlxuICpcbiAqIC0gRXZlbiBpbmRpY2VzOiBkaXJlY3RpdmUgaW5kZXhcbiAqIC0gT2RkIGluZGljZXM6IG1pbmlmaWVkIC8gaW50ZXJuYWwgbmFtZVxuICpcbiAqIGUuZy4gWzAsICdjaGFuZ2UtbWluaWZpZWQnXVxuICovXG5leHBvcnQgdHlwZSBQcm9wZXJ0eUFsaWFzVmFsdWUgPSAobnVtYmVyIHwgc3RyaW5nKVtdO1xuXG5cbi8qKlxuICogVGhpcyBhcnJheSBjb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCBpbnB1dCBwcm9wZXJ0aWVzIHRoYXRcbiAqIG5lZWQgdG8gYmUgc2V0IG9uY2UgZnJvbSBhdHRyaWJ1dGUgZGF0YS4gSXQncyBvcmRlcmVkIGJ5XG4gKiBkaXJlY3RpdmUgaW5kZXggKHJlbGF0aXZlIHRvIGVsZW1lbnQpIHNvIGl0J3Mgc2ltcGxlIHRvXG4gKiBsb29rIHVwIGEgc3BlY2lmaWMgZGlyZWN0aXZlJ3MgaW5pdGlhbCBpbnB1dCBkYXRhLlxuICpcbiAqIFdpdGhpbiBlYWNoIHN1Yi1hcnJheTpcbiAqXG4gKiBFdmVuIGluZGljZXM6IG1pbmlmaWVkL2ludGVybmFsIGlucHV0IG5hbWVcbiAqIE9kZCBpbmRpY2VzOiBpbml0aWFsIHZhbHVlXG4gKlxuICogSWYgYSBkaXJlY3RpdmUgb24gYSBub2RlIGRvZXMgbm90IGhhdmUgYW55IGlucHV0IHByb3BlcnRpZXNcbiAqIHRoYXQgc2hvdWxkIGJlIHNldCBmcm9tIGF0dHJpYnV0ZXMsIGl0cyBpbmRleCBpcyBzZXQgdG8gbnVsbFxuICogdG8gYXZvaWQgYSBzcGFyc2UgYXJyYXkuXG4gKlxuICogZS5nLiBbbnVsbCwgWydyb2xlLW1pbicsICdidXR0b24nXV1cbiAqL1xuZXhwb3J0IHR5cGUgSW5pdGlhbElucHV0RGF0YSA9IChJbml0aWFsSW5wdXRzIHwgbnVsbClbXTtcblxuLyoqXG4gKiBVc2VkIGJ5IEluaXRpYWxJbnB1dERhdGEgdG8gc3RvcmUgaW5wdXQgcHJvcGVydGllc1xuICogdGhhdCBzaG91bGQgYmUgc2V0IG9uY2UgZnJvbSBhdHRyaWJ1dGVzLlxuICpcbiAqIEV2ZW4gaW5kaWNlczogbWluaWZpZWQvaW50ZXJuYWwgaW5wdXQgbmFtZVxuICogT2RkIGluZGljZXM6IGluaXRpYWwgdmFsdWVcbiAqXG4gKiBlLmcuIFsncm9sZS1taW4nLCAnYnV0dG9uJ11cbiAqL1xuZXhwb3J0IHR5cGUgSW5pdGlhbElucHV0cyA9IHN0cmluZ1tdO1xuXG4vLyBOb3RlOiBUaGlzIGhhY2sgaXMgbmVjZXNzYXJ5IHNvIHdlIGRvbid0IGVycm9uZW91c2x5IGdldCBhIGNpcmN1bGFyIGRlcGVuZGVuY3lcbi8vIGZhaWx1cmUgYmFzZWQgb24gdHlwZXMuXG5leHBvcnQgY29uc3QgdW51c2VkVmFsdWVFeHBvcnRUb1BsYWNhdGVBamQgPSAxO1xuXG4vKipcbiAqIFR5cGUgcmVwcmVzZW50aW5nIGEgc2V0IG9mIFROb2RlcyB0aGF0IGNhbiBoYXZlIGxvY2FsIHJlZnMgKGAjZm9vYCkgcGxhY2VkIG9uIHRoZW0uXG4gKi9cbmV4cG9ydCB0eXBlIFROb2RlV2l0aExvY2FsUmVmcyA9IFRDb250YWluZXJOb2RlIHwgVEVsZW1lbnROb2RlIHwgVEVsZW1lbnRDb250YWluZXJOb2RlO1xuXG4vKipcbiAqIFR5cGUgZm9yIGEgZnVuY3Rpb24gdGhhdCBleHRyYWN0cyBhIHZhbHVlIGZvciBhIGxvY2FsIHJlZnMuXG4gKiBFeGFtcGxlOlxuICogLSBgPGRpdiAjbmF0aXZlRGl2RWw+YCAtIGBuYXRpdmVEaXZFbGAgc2hvdWxkIHBvaW50IHRvIHRoZSBuYXRpdmUgYDxkaXY+YCBlbGVtZW50O1xuICogLSBgPG5nLXRlbXBsYXRlICN0cGxSZWY+YCAtIGB0cGxSZWZgIHNob3VsZCBwb2ludCB0byB0aGUgYFRlbXBsYXRlUmVmYCBpbnN0YW5jZTtcbiAqL1xuZXhwb3J0IHR5cGUgTG9jYWxSZWZFeHRyYWN0b3IgPSAodE5vZGU6IFROb2RlV2l0aExvY2FsUmVmcywgY3VycmVudFZpZXc6IExWaWV3RGF0YSkgPT4gYW55O1xuIl19