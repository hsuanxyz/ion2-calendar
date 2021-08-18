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
 * The goal here is to make sure that the browser DOM API is the Renderer.
 * We do this by defining a subset of DOM API to be the renderer and than
 * use that time for rendering.
 *
 * At runtime we can than use the DOM api directly, in server or web-worker
 * it will be easy to implement such API.
 */
/** @enum {number} */
const RendererStyleFlags3 = {
    Important: 1,
    DashCase: 2,
};
export { RendererStyleFlags3 };
RendererStyleFlags3[RendererStyleFlags3.Important] = 'Important';
RendererStyleFlags3[RendererStyleFlags3.DashCase] = 'DashCase';
/**
 * Object Oriented style of API needed to create elements and text nodes.
 *
 * This is the native browser API style, e.g. operations are methods on individual objects
 * like HTMLElement. With this style, no additional code is needed as a facade
 * (reducing payload size).
 *
 * @record
 */
export function ObjectOrientedRenderer3() { }
if (false) {
    /**
     * @param {?} data
     * @return {?}
     */
    ObjectOrientedRenderer3.prototype.createComment = function (data) { };
    /**
     * @param {?} tagName
     * @return {?}
     */
    ObjectOrientedRenderer3.prototype.createElement = function (tagName) { };
    /**
     * @param {?} namespace
     * @param {?} tagName
     * @return {?}
     */
    ObjectOrientedRenderer3.prototype.createElementNS = function (namespace, tagName) { };
    /**
     * @param {?} data
     * @return {?}
     */
    ObjectOrientedRenderer3.prototype.createTextNode = function (data) { };
    /**
     * @param {?} selectors
     * @return {?}
     */
    ObjectOrientedRenderer3.prototype.querySelector = function (selectors) { };
}
/**
 * Returns whether the `renderer` is a `ProceduralRenderer3`
 * @param {?} renderer
 * @return {?}
 */
export function isProceduralRenderer(renderer) {
    return !!(((/** @type {?} */ (renderer))).listen);
}
/**
 * Procedural style of API needed to create elements and text nodes.
 *
 * In non-native browser environments (e.g. platforms such as web-workers), this is the
 * facade that enables element manipulation. This also facilitates backwards compatibility
 * with Renderer2.
 * @record
 */
export function ProceduralRenderer3() { }
if (false) {
    /**
     * This property is allowed to be null / undefined,
     * in which case the view engine won't call it.
     * This is used as a performance optimization for production mode.
     * @type {?|undefined}
     */
    ProceduralRenderer3.prototype.destroyNode;
    /**
     * @return {?}
     */
    ProceduralRenderer3.prototype.destroy = function () { };
    /**
     * @param {?} value
     * @return {?}
     */
    ProceduralRenderer3.prototype.createComment = function (value) { };
    /**
     * @param {?} name
     * @param {?=} namespace
     * @return {?}
     */
    ProceduralRenderer3.prototype.createElement = function (name, namespace) { };
    /**
     * @param {?} value
     * @return {?}
     */
    ProceduralRenderer3.prototype.createText = function (value) { };
    /**
     * @param {?} parent
     * @param {?} newChild
     * @return {?}
     */
    ProceduralRenderer3.prototype.appendChild = function (parent, newChild) { };
    /**
     * @param {?} parent
     * @param {?} newChild
     * @param {?} refChild
     * @return {?}
     */
    ProceduralRenderer3.prototype.insertBefore = function (parent, newChild, refChild) { };
    /**
     * @param {?} parent
     * @param {?} oldChild
     * @return {?}
     */
    ProceduralRenderer3.prototype.removeChild = function (parent, oldChild) { };
    /**
     * @param {?} selectorOrNode
     * @return {?}
     */
    ProceduralRenderer3.prototype.selectRootElement = function (selectorOrNode) { };
    /**
     * @param {?} node
     * @return {?}
     */
    ProceduralRenderer3.prototype.parentNode = function (node) { };
    /**
     * @param {?} node
     * @return {?}
     */
    ProceduralRenderer3.prototype.nextSibling = function (node) { };
    /**
     * @param {?} el
     * @param {?} name
     * @param {?} value
     * @param {?=} namespace
     * @return {?}
     */
    ProceduralRenderer3.prototype.setAttribute = function (el, name, value, namespace) { };
    /**
     * @param {?} el
     * @param {?} name
     * @param {?=} namespace
     * @return {?}
     */
    ProceduralRenderer3.prototype.removeAttribute = function (el, name, namespace) { };
    /**
     * @param {?} el
     * @param {?} name
     * @return {?}
     */
    ProceduralRenderer3.prototype.addClass = function (el, name) { };
    /**
     * @param {?} el
     * @param {?} name
     * @return {?}
     */
    ProceduralRenderer3.prototype.removeClass = function (el, name) { };
    /**
     * @param {?} el
     * @param {?} style
     * @param {?} value
     * @param {?=} flags
     * @return {?}
     */
    ProceduralRenderer3.prototype.setStyle = function (el, style, value, flags) { };
    /**
     * @param {?} el
     * @param {?} style
     * @param {?=} flags
     * @return {?}
     */
    ProceduralRenderer3.prototype.removeStyle = function (el, style, flags) { };
    /**
     * @param {?} el
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    ProceduralRenderer3.prototype.setProperty = function (el, name, value) { };
    /**
     * @param {?} node
     * @param {?} value
     * @return {?}
     */
    ProceduralRenderer3.prototype.setValue = function (node, value) { };
    /**
     * @param {?} target
     * @param {?} eventName
     * @param {?} callback
     * @return {?}
     */
    ProceduralRenderer3.prototype.listen = function (target, eventName, callback) { };
}
/**
 * @record
 */
export function RendererFactory3() { }
if (false) {
    /**
     * @param {?} hostElement
     * @param {?} rendererType
     * @return {?}
     */
    RendererFactory3.prototype.createRenderer = function (hostElement, rendererType) { };
    /**
     * @return {?}
     */
    RendererFactory3.prototype.begin = function () { };
    /**
     * @return {?}
     */
    RendererFactory3.prototype.end = function () { };
}
/** @type {?} */
export const domRendererFactory3 = {
    createRenderer: (hostElement, rendererType) => { return document; }
};
/**
 * Subset of API needed for appending elements and text nodes.
 * @record
 */
export function RNode() { }
if (false) {
    /** @type {?} */
    RNode.prototype.parentNode;
    /** @type {?} */
    RNode.prototype.nextSibling;
    /**
     * @param {?} oldChild
     * @return {?}
     */
    RNode.prototype.removeChild = function (oldChild) { };
    /**
     * Insert a child node.
     *
     * Used exclusively for adding View root nodes into ViewAnchor location.
     * @param {?} newChild
     * @param {?} refChild
     * @param {?} isViewRoot
     * @return {?}
     */
    RNode.prototype.insertBefore = function (newChild, refChild, isViewRoot) { };
    /**
     * Append a child node.
     *
     * Used exclusively for building up DOM which are static (ie not View roots)
     * @param {?} newChild
     * @return {?}
     */
    RNode.prototype.appendChild = function (newChild) { };
}
/**
 * Subset of API needed for writing attributes, properties, and setting up
 * listeners on Element.
 * @record
 */
export function RElement() { }
if (false) {
    /** @type {?} */
    RElement.prototype.style;
    /** @type {?} */
    RElement.prototype.classList;
    /** @type {?} */
    RElement.prototype.className;
    /**
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    RElement.prototype.setAttribute = function (name, value) { };
    /**
     * @param {?} name
     * @return {?}
     */
    RElement.prototype.removeAttribute = function (name) { };
    /**
     * @param {?} namespaceURI
     * @param {?} qualifiedName
     * @param {?} value
     * @return {?}
     */
    RElement.prototype.setAttributeNS = function (namespaceURI, qualifiedName, value) { };
    /**
     * @param {?} type
     * @param {?} listener
     * @param {?=} useCapture
     * @return {?}
     */
    RElement.prototype.addEventListener = function (type, listener, useCapture) { };
    /**
     * @param {?} type
     * @param {?=} listener
     * @param {?=} options
     * @return {?}
     */
    RElement.prototype.removeEventListener = function (type, listener, options) { };
    /**
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    RElement.prototype.setProperty = function (name, value) { };
}
/**
 * @record
 */
export function RCssStyleDeclaration() { }
if (false) {
    /**
     * @param {?} propertyName
     * @return {?}
     */
    RCssStyleDeclaration.prototype.removeProperty = function (propertyName) { };
    /**
     * @param {?} propertyName
     * @param {?} value
     * @param {?=} priority
     * @return {?}
     */
    RCssStyleDeclaration.prototype.setProperty = function (propertyName, value, priority) { };
}
/**
 * @record
 */
export function RDomTokenList() { }
if (false) {
    /**
     * @param {?} token
     * @return {?}
     */
    RDomTokenList.prototype.add = function (token) { };
    /**
     * @param {?} token
     * @return {?}
     */
    RDomTokenList.prototype.remove = function (token) { };
}
/**
 * @record
 */
export function RText() { }
if (false) {
    /** @type {?} */
    RText.prototype.textContent;
}
/**
 * @record
 */
export function RComment() { }
// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
/** @type {?} */
export const unusedValueExportToPlacateAjd = 1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2ludGVyZmFjZXMvcmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBc0JFLFlBQWtCO0lBQ2xCLFdBQWlCOzs7Ozs7Ozs7Ozs7OztBQVluQiw2Q0FPQzs7Ozs7O0lBTkMsc0VBQXNDOzs7OztJQUN0Qyx5RUFBeUM7Ozs7OztJQUN6QyxzRkFBOEQ7Ozs7O0lBQzlELHVFQUFvQzs7Ozs7SUFFcEMsMkVBQWdEOzs7Ozs7O0FBSWxELE1BQU0sVUFBVSxvQkFBb0IsQ0FBQyxRQUF1RDtJQUUxRixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsbUJBQUEsUUFBUSxFQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN0QyxDQUFDOzs7Ozs7Ozs7QUFTRCx5Q0FnQ0M7Ozs7Ozs7O0lBdEJDLDBDQUEyQzs7OztJQVQzQyx3REFBZ0I7Ozs7O0lBQ2hCLG1FQUF1Qzs7Ozs7O0lBQ3ZDLDZFQUErRDs7Ozs7SUFDL0QsZ0VBQWlDOzs7Ozs7SUFPakMsNEVBQXFEOzs7Ozs7O0lBQ3JELHVGQUF5RTs7Ozs7O0lBQ3pFLDRFQUFxRDs7Ozs7SUFDckQsZ0ZBQXdEOzs7OztJQUV4RCwrREFBdUM7Ozs7O0lBQ3ZDLGdFQUFxQzs7Ozs7Ozs7SUFFckMsdUZBQXVGOzs7Ozs7O0lBQ3ZGLG1GQUEyRTs7Ozs7O0lBQzNFLGlFQUEyQzs7Ozs7O0lBQzNDLG9FQUE4Qzs7Ozs7Ozs7SUFDOUMsZ0ZBRTJEOzs7Ozs7O0lBQzNELDRFQUFnRzs7Ozs7OztJQUNoRywyRUFBMEQ7Ozs7OztJQUMxRCxvRUFBMkM7Ozs7Ozs7SUFHM0Msa0ZBQStGOzs7OztBQUdqRyxzQ0FJQzs7Ozs7OztJQUhDLHFGQUF3Rjs7OztJQUN4RixtREFBZTs7OztJQUNmLGlEQUFhOzs7QUFHZixNQUFNLE9BQU8sbUJBQW1CLEdBQXFCO0lBQ25ELGNBQWMsRUFBRSxDQUFDLFdBQTRCLEVBQUUsWUFBa0MsRUFDbkQsRUFBRSxHQUFHLE9BQU8sUUFBUSxDQUFDLENBQUEsQ0FBQztDQUNyRDs7Ozs7QUFHRCwyQkFvQkM7OztJQW5CQywyQkFBdUI7O0lBRXZCLDRCQUF3Qjs7Ozs7SUFFeEIsc0RBQW1DOzs7Ozs7Ozs7O0lBT25DLDZFQUErRTs7Ozs7Ozs7SUFPL0Usc0RBQW9DOzs7Ozs7O0FBT3RDLDhCQVdDOzs7SUFWQyx5QkFBNEI7O0lBQzVCLDZCQUF5Qjs7SUFDekIsNkJBQWtCOzs7Ozs7SUFDbEIsNkRBQWdEOzs7OztJQUNoRCx5REFBb0M7Ozs7Ozs7SUFDcEMsc0ZBQWlGOzs7Ozs7O0lBQ2pGLGdGQUFvRjs7Ozs7OztJQUNwRixnRkFBcUY7Ozs7OztJQUVyRiw0REFBNkM7Ozs7O0FBRy9DLDBDQUdDOzs7Ozs7SUFGQyw0RUFBNkM7Ozs7Ozs7SUFDN0MsMEZBQStFOzs7OztBQUdqRixtQ0FHQzs7Ozs7O0lBRkMsbURBQXlCOzs7OztJQUN6QixzREFBNEI7Ozs7O0FBRzlCLDJCQUFrRTs7O0lBQTNCLDRCQUF5Qjs7Ozs7QUFFaEUsOEJBQTBDOzs7O0FBSTFDLE1BQU0sT0FBTyw2QkFBNkIsR0FBRyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIFRoZSBnb2FsIGhlcmUgaXMgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIGJyb3dzZXIgRE9NIEFQSSBpcyB0aGUgUmVuZGVyZXIuXG4gKiBXZSBkbyB0aGlzIGJ5IGRlZmluaW5nIGEgc3Vic2V0IG9mIERPTSBBUEkgdG8gYmUgdGhlIHJlbmRlcmVyIGFuZCB0aGFuXG4gKiB1c2UgdGhhdCB0aW1lIGZvciByZW5kZXJpbmcuXG4gKlxuICogQXQgcnVudGltZSB3ZSBjYW4gdGhhbiB1c2UgdGhlIERPTSBhcGkgZGlyZWN0bHksIGluIHNlcnZlciBvciB3ZWItd29ya2VyXG4gKiBpdCB3aWxsIGJlIGVhc3kgdG8gaW1wbGVtZW50IHN1Y2ggQVBJLlxuICovXG5cbmltcG9ydCB7UmVuZGVyZXJTdHlsZUZsYWdzMiwgUmVuZGVyZXJUeXBlMn0gZnJvbSAnLi4vLi4vcmVuZGVyL2FwaSc7XG5cblxuLy8gVE9ETzogY2xlYW51cCBvbmNlIHRoZSBjb2RlIGlzIG1lcmdlZCBpbiBhbmd1bGFyL2FuZ3VsYXJcbmV4cG9ydCBlbnVtIFJlbmRlcmVyU3R5bGVGbGFnczMge1xuICBJbXBvcnRhbnQgPSAxIDw8IDAsXG4gIERhc2hDYXNlID0gMSA8PCAxXG59XG5cbmV4cG9ydCB0eXBlIFJlbmRlcmVyMyA9IE9iamVjdE9yaWVudGVkUmVuZGVyZXIzIHwgUHJvY2VkdXJhbFJlbmRlcmVyMztcblxuLyoqXG4gKiBPYmplY3QgT3JpZW50ZWQgc3R5bGUgb2YgQVBJIG5lZWRlZCB0byBjcmVhdGUgZWxlbWVudHMgYW5kIHRleHQgbm9kZXMuXG4gKlxuICogVGhpcyBpcyB0aGUgbmF0aXZlIGJyb3dzZXIgQVBJIHN0eWxlLCBlLmcuIG9wZXJhdGlvbnMgYXJlIG1ldGhvZHMgb24gaW5kaXZpZHVhbCBvYmplY3RzXG4gKiBsaWtlIEhUTUxFbGVtZW50LiBXaXRoIHRoaXMgc3R5bGUsIG5vIGFkZGl0aW9uYWwgY29kZSBpcyBuZWVkZWQgYXMgYSBmYWNhZGVcbiAqIChyZWR1Y2luZyBwYXlsb2FkIHNpemUpLlxuICogKi9cbmV4cG9ydCBpbnRlcmZhY2UgT2JqZWN0T3JpZW50ZWRSZW5kZXJlcjMge1xuICBjcmVhdGVDb21tZW50KGRhdGE6IHN0cmluZyk6IFJDb21tZW50O1xuICBjcmVhdGVFbGVtZW50KHRhZ05hbWU6IHN0cmluZyk6IFJFbGVtZW50O1xuICBjcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlOiBzdHJpbmcsIHRhZ05hbWU6IHN0cmluZyk6IFJFbGVtZW50O1xuICBjcmVhdGVUZXh0Tm9kZShkYXRhOiBzdHJpbmcpOiBSVGV4dDtcblxuICBxdWVyeVNlbGVjdG9yKHNlbGVjdG9yczogc3RyaW5nKTogUkVsZW1lbnR8bnVsbDtcbn1cblxuLyoqIFJldHVybnMgd2hldGhlciB0aGUgYHJlbmRlcmVyYCBpcyBhIGBQcm9jZWR1cmFsUmVuZGVyZXIzYCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvY2VkdXJhbFJlbmRlcmVyKHJlbmRlcmVyOiBQcm9jZWR1cmFsUmVuZGVyZXIzIHwgT2JqZWN0T3JpZW50ZWRSZW5kZXJlcjMpOlxuICAgIHJlbmRlcmVyIGlzIFByb2NlZHVyYWxSZW5kZXJlcjMge1xuICByZXR1cm4gISEoKHJlbmRlcmVyIGFzIGFueSkubGlzdGVuKTtcbn1cblxuLyoqXG4gKiBQcm9jZWR1cmFsIHN0eWxlIG9mIEFQSSBuZWVkZWQgdG8gY3JlYXRlIGVsZW1lbnRzIGFuZCB0ZXh0IG5vZGVzLlxuICpcbiAqIEluIG5vbi1uYXRpdmUgYnJvd3NlciBlbnZpcm9ubWVudHMgKGUuZy4gcGxhdGZvcm1zIHN1Y2ggYXMgd2ViLXdvcmtlcnMpLCB0aGlzIGlzIHRoZVxuICogZmFjYWRlIHRoYXQgZW5hYmxlcyBlbGVtZW50IG1hbmlwdWxhdGlvbi4gVGhpcyBhbHNvIGZhY2lsaXRhdGVzIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG4gKiB3aXRoIFJlbmRlcmVyMi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQcm9jZWR1cmFsUmVuZGVyZXIzIHtcbiAgZGVzdHJveSgpOiB2b2lkO1xuICBjcmVhdGVDb21tZW50KHZhbHVlOiBzdHJpbmcpOiBSQ29tbWVudDtcbiAgY3JlYXRlRWxlbWVudChuYW1lOiBzdHJpbmcsIG5hbWVzcGFjZT86IHN0cmluZ3xudWxsKTogUkVsZW1lbnQ7XG4gIGNyZWF0ZVRleHQodmFsdWU6IHN0cmluZyk6IFJUZXh0O1xuICAvKipcbiAgICogVGhpcyBwcm9wZXJ0eSBpcyBhbGxvd2VkIHRvIGJlIG51bGwgLyB1bmRlZmluZWQsXG4gICAqIGluIHdoaWNoIGNhc2UgdGhlIHZpZXcgZW5naW5lIHdvbid0IGNhbGwgaXQuXG4gICAqIFRoaXMgaXMgdXNlZCBhcyBhIHBlcmZvcm1hbmNlIG9wdGltaXphdGlvbiBmb3IgcHJvZHVjdGlvbiBtb2RlLlxuICAgKi9cbiAgZGVzdHJveU5vZGU/OiAoKG5vZGU6IFJOb2RlKSA9PiB2b2lkKXxudWxsO1xuICBhcHBlbmRDaGlsZChwYXJlbnQ6IFJFbGVtZW50LCBuZXdDaGlsZDogUk5vZGUpOiB2b2lkO1xuICBpbnNlcnRCZWZvcmUocGFyZW50OiBSTm9kZSwgbmV3Q2hpbGQ6IFJOb2RlLCByZWZDaGlsZDogUk5vZGV8bnVsbCk6IHZvaWQ7XG4gIHJlbW92ZUNoaWxkKHBhcmVudDogUkVsZW1lbnQsIG9sZENoaWxkOiBSTm9kZSk6IHZvaWQ7XG4gIHNlbGVjdFJvb3RFbGVtZW50KHNlbGVjdG9yT3JOb2RlOiBzdHJpbmd8YW55KTogUkVsZW1lbnQ7XG5cbiAgcGFyZW50Tm9kZShub2RlOiBSTm9kZSk6IFJFbGVtZW50fG51bGw7XG4gIG5leHRTaWJsaW5nKG5vZGU6IFJOb2RlKTogUk5vZGV8bnVsbDtcblxuICBzZXRBdHRyaWJ1dGUoZWw6IFJFbGVtZW50LCBuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIG5hbWVzcGFjZT86IHN0cmluZ3xudWxsKTogdm9pZDtcbiAgcmVtb3ZlQXR0cmlidXRlKGVsOiBSRWxlbWVudCwgbmFtZTogc3RyaW5nLCBuYW1lc3BhY2U/OiBzdHJpbmd8bnVsbCk6IHZvaWQ7XG4gIGFkZENsYXNzKGVsOiBSRWxlbWVudCwgbmFtZTogc3RyaW5nKTogdm9pZDtcbiAgcmVtb3ZlQ2xhc3MoZWw6IFJFbGVtZW50LCBuYW1lOiBzdHJpbmcpOiB2b2lkO1xuICBzZXRTdHlsZShcbiAgICAgIGVsOiBSRWxlbWVudCwgc3R5bGU6IHN0cmluZywgdmFsdWU6IGFueSxcbiAgICAgIGZsYWdzPzogUmVuZGVyZXJTdHlsZUZsYWdzMnxSZW5kZXJlclN0eWxlRmxhZ3MzKTogdm9pZDtcbiAgcmVtb3ZlU3R5bGUoZWw6IFJFbGVtZW50LCBzdHlsZTogc3RyaW5nLCBmbGFncz86IFJlbmRlcmVyU3R5bGVGbGFnczJ8UmVuZGVyZXJTdHlsZUZsYWdzMyk6IHZvaWQ7XG4gIHNldFByb3BlcnR5KGVsOiBSRWxlbWVudCwgbmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZDtcbiAgc2V0VmFsdWUobm9kZTogUlRleHQsIHZhbHVlOiBzdHJpbmcpOiB2b2lkO1xuXG4gIC8vIFRPRE8obWlza28pOiBEZXByZWNhdGUgaW4gZmF2b3Igb2YgYWRkRXZlbnRMaXN0ZW5lci9yZW1vdmVFdmVudExpc3RlbmVyXG4gIGxpc3Rlbih0YXJnZXQ6IFJOb2RlLCBldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2s6IChldmVudDogYW55KSA9PiBib29sZWFuIHwgdm9pZCk6ICgpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyZXJGYWN0b3J5MyB7XG4gIGNyZWF0ZVJlbmRlcmVyKGhvc3RFbGVtZW50OiBSRWxlbWVudHxudWxsLCByZW5kZXJlclR5cGU6IFJlbmRlcmVyVHlwZTJ8bnVsbCk6IFJlbmRlcmVyMztcbiAgYmVnaW4/KCk6IHZvaWQ7XG4gIGVuZD8oKTogdm9pZDtcbn1cblxuZXhwb3J0IGNvbnN0IGRvbVJlbmRlcmVyRmFjdG9yeTM6IFJlbmRlcmVyRmFjdG9yeTMgPSB7XG4gIGNyZWF0ZVJlbmRlcmVyOiAoaG9zdEVsZW1lbnQ6IFJFbGVtZW50IHwgbnVsbCwgcmVuZGVyZXJUeXBlOiBSZW5kZXJlclR5cGUyIHwgbnVsbCk6XG4gICAgICAgICAgICAgICAgICAgICAgUmVuZGVyZXIzID0+IHsgcmV0dXJuIGRvY3VtZW50O31cbn07XG5cbi8qKiBTdWJzZXQgb2YgQVBJIG5lZWRlZCBmb3IgYXBwZW5kaW5nIGVsZW1lbnRzIGFuZCB0ZXh0IG5vZGVzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSTm9kZSB7XG4gIHBhcmVudE5vZGU6IFJOb2RlfG51bGw7XG5cbiAgbmV4dFNpYmxpbmc6IFJOb2RlfG51bGw7XG5cbiAgcmVtb3ZlQ2hpbGQob2xkQ2hpbGQ6IFJOb2RlKTogdm9pZDtcblxuICAvKipcbiAgICogSW5zZXJ0IGEgY2hpbGQgbm9kZS5cbiAgICpcbiAgICogVXNlZCBleGNsdXNpdmVseSBmb3IgYWRkaW5nIFZpZXcgcm9vdCBub2RlcyBpbnRvIFZpZXdBbmNob3IgbG9jYXRpb24uXG4gICAqL1xuICBpbnNlcnRCZWZvcmUobmV3Q2hpbGQ6IFJOb2RlLCByZWZDaGlsZDogUk5vZGV8bnVsbCwgaXNWaWV3Um9vdDogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEFwcGVuZCBhIGNoaWxkIG5vZGUuXG4gICAqXG4gICAqIFVzZWQgZXhjbHVzaXZlbHkgZm9yIGJ1aWxkaW5nIHVwIERPTSB3aGljaCBhcmUgc3RhdGljIChpZSBub3QgVmlldyByb290cylcbiAgICovXG4gIGFwcGVuZENoaWxkKG5ld0NoaWxkOiBSTm9kZSk6IFJOb2RlO1xufVxuXG4vKipcbiAqIFN1YnNldCBvZiBBUEkgbmVlZGVkIGZvciB3cml0aW5nIGF0dHJpYnV0ZXMsIHByb3BlcnRpZXMsIGFuZCBzZXR0aW5nIHVwXG4gKiBsaXN0ZW5lcnMgb24gRWxlbWVudC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSRWxlbWVudCBleHRlbmRzIFJOb2RlIHtcbiAgc3R5bGU6IFJDc3NTdHlsZURlY2xhcmF0aW9uO1xuICBjbGFzc0xpc3Q6IFJEb21Ub2tlbkxpc3Q7XG4gIGNsYXNzTmFtZTogc3RyaW5nO1xuICBzZXRBdHRyaWJ1dGUobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZDtcbiAgcmVtb3ZlQXR0cmlidXRlKG5hbWU6IHN0cmluZyk6IHZvaWQ7XG4gIHNldEF0dHJpYnV0ZU5TKG5hbWVzcGFjZVVSSTogc3RyaW5nLCBxdWFsaWZpZWROYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkO1xuICBhZGRFdmVudExpc3RlbmVyKHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IEV2ZW50TGlzdGVuZXIsIHVzZUNhcHR1cmU/OiBib29sZWFuKTogdm9pZDtcbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlOiBzdHJpbmcsIGxpc3RlbmVyPzogRXZlbnRMaXN0ZW5lciwgb3B0aW9ucz86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIHNldFByb3BlcnR5PyhuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJDc3NTdHlsZURlY2xhcmF0aW9uIHtcbiAgcmVtb3ZlUHJvcGVydHkocHJvcGVydHlOYW1lOiBzdHJpbmcpOiBzdHJpbmc7XG4gIHNldFByb3BlcnR5KHByb3BlcnR5TmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nfG51bGwsIHByaW9yaXR5Pzogc3RyaW5nKTogdm9pZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSRG9tVG9rZW5MaXN0IHtcbiAgYWRkKHRva2VuOiBzdHJpbmcpOiB2b2lkO1xuICByZW1vdmUodG9rZW46IHN0cmluZyk6IHZvaWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUlRleHQgZXh0ZW5kcyBSTm9kZSB7IHRleHRDb250ZW50OiBzdHJpbmd8bnVsbDsgfVxuXG5leHBvcnQgaW50ZXJmYWNlIFJDb21tZW50IGV4dGVuZHMgUk5vZGUge31cblxuLy8gTm90ZTogVGhpcyBoYWNrIGlzIG5lY2Vzc2FyeSBzbyB3ZSBkb24ndCBlcnJvbmVvdXNseSBnZXQgYSBjaXJjdWxhciBkZXBlbmRlbmN5XG4vLyBmYWlsdXJlIGJhc2VkIG9uIHR5cGVzLlxuZXhwb3J0IGNvbnN0IHVudXNlZFZhbHVlRXhwb3J0VG9QbGFjYXRlQWpkID0gMTtcbiJdfQ==