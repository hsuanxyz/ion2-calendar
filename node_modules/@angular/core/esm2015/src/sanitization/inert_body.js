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
 * This helper class is used to get hold of an inert tree of DOM elements containing dirty HTML
 * that needs sanitizing.
 * Depending upon browser support we must use one of three strategies for doing this.
 * Support: Safari 10.x -> XHR strategy
 * Support: Firefox -> DomParser strategy
 * Default: InertDocument strategy
 */
export class InertBodyHelper {
    /**
     * @param {?} defaultDoc
     */
    constructor(defaultDoc) {
        this.defaultDoc = defaultDoc;
        this.inertDocument = this.defaultDoc.implementation.createHTMLDocument('sanitization-inert');
        this.inertBodyElement = this.inertDocument.body;
        if (this.inertBodyElement == null) {
            // usually there should be only one body element in the document, but IE doesn't have any, so
            // we need to create one.
            /** @type {?} */
            const inertHtml = this.inertDocument.createElement('html');
            this.inertDocument.appendChild(inertHtml);
            this.inertBodyElement = this.inertDocument.createElement('body');
            inertHtml.appendChild(this.inertBodyElement);
        }
        this.inertBodyElement.innerHTML = '<svg><g onload="this.parentNode.remove()"></g></svg>';
        if (this.inertBodyElement.querySelector && !this.inertBodyElement.querySelector('svg')) {
            // We just hit the Safari 10.1 bug - which allows JS to run inside the SVG G element
            // so use the XHR strategy.
            this.getInertBodyElement = this.getInertBodyElement_XHR;
            return;
        }
        this.inertBodyElement.innerHTML =
            '<svg><p><style><img src="</style><img src=x onerror=alert(1)//">';
        if (this.inertBodyElement.querySelector && this.inertBodyElement.querySelector('svg img')) {
            // We just hit the Firefox bug - which prevents the inner img JS from being sanitized
            // so use the DOMParser strategy, if it is available.
            // If the DOMParser is not available then we are not in Firefox (Server/WebWorker?) so we
            // fall through to the default strategy below.
            if (isDOMParserAvailable()) {
                this.getInertBodyElement = this.getInertBodyElement_DOMParser;
                return;
            }
        }
        // None of the bugs were hit so it is safe for us to use the default InertDocument strategy
        this.getInertBodyElement = this.getInertBodyElement_InertDocument;
    }
    /**
     * Use XHR to create and fill an inert body element (on Safari 10.1)
     * See
     * https://github.com/cure53/DOMPurify/blob/a992d3a75031cb8bb032e5ea8399ba972bdf9a65/src/purify.js#L439-L449
     * @param {?} html
     * @return {?}
     */
    getInertBodyElement_XHR(html) {
        // We add these extra elements to ensure that the rest of the content is parsed as expected
        // e.g. leading whitespace is maintained and tags like `<meta>` do not get hoisted to the
        // `<head>` tag.
        html = '<body><remove></remove>' + html + '</body>';
        try {
            html = encodeURI(html);
        }
        catch (e) {
            return null;
        }
        /** @type {?} */
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'document';
        xhr.open('GET', 'data:text/html;charset=utf-8,' + html, false);
        xhr.send(undefined);
        /** @type {?} */
        const body = xhr.response.body;
        body.removeChild((/** @type {?} */ (body.firstChild)));
        return body;
    }
    /**
     * Use DOMParser to create and fill an inert body element (on Firefox)
     * See https://github.com/cure53/DOMPurify/releases/tag/0.6.7
     *
     * @param {?} html
     * @return {?}
     */
    getInertBodyElement_DOMParser(html) {
        // We add these extra elements to ensure that the rest of the content is parsed as expected
        // e.g. leading whitespace is maintained and tags like `<meta>` do not get hoisted to the
        // `<head>` tag.
        html = '<body><remove></remove>' + html + '</body>';
        try {
            /** @type {?} */
            const body = (/** @type {?} */ (new ((/** @type {?} */ (window)))
                .DOMParser()
                .parseFromString(html, 'text/html')
                .body));
            body.removeChild((/** @type {?} */ (body.firstChild)));
            return body;
        }
        catch (e) {
            return null;
        }
    }
    /**
     * Use an HTML5 `template` element, if supported, or an inert body element created via
     * `createHtmlDocument` to create and fill an inert DOM element.
     * This is the default sane strategy to use if the browser does not require one of the specialised
     * strategies above.
     * @param {?} html
     * @return {?}
     */
    getInertBodyElement_InertDocument(html) {
        // Prefer using <template> element if supported.
        /** @type {?} */
        const templateEl = this.inertDocument.createElement('template');
        if ('content' in templateEl) {
            templateEl.innerHTML = html;
            return templateEl;
        }
        this.inertBodyElement.innerHTML = html;
        // Support: IE 9-11 only
        // strip custom-namespaced attributes on IE<=11
        if (((/** @type {?} */ (this.defaultDoc))).documentMode) {
            this.stripCustomNsAttrs(this.inertBodyElement);
        }
        return this.inertBodyElement;
    }
    /**
     * When IE9-11 comes across an unknown namespaced attribute e.g. 'xlink:foo' it adds 'xmlns:ns1'
     * attribute to declare ns1 namespace and prefixes the attribute with 'ns1' (e.g.
     * 'ns1:xlink:foo').
     *
     * This is undesirable since we don't want to allow any of these custom attributes. This method
     * strips them all.
     * @param {?} el
     * @return {?}
     */
    stripCustomNsAttrs(el) {
        /** @type {?} */
        const elAttrs = el.attributes;
        // loop backwards so that we can support removals.
        for (let i = elAttrs.length - 1; 0 < i; i--) {
            /** @type {?} */
            const attrib = elAttrs.item(i);
            /** @type {?} */
            const attrName = (/** @type {?} */ (attrib)).name;
            if (attrName === 'xmlns:ns1' || attrName.indexOf('ns1:') === 0) {
                el.removeAttribute(attrName);
            }
        }
        /** @type {?} */
        let childNode = (/** @type {?} */ (el.firstChild));
        while (childNode) {
            if (childNode.nodeType === Node.ELEMENT_NODE)
                this.stripCustomNsAttrs((/** @type {?} */ (childNode)));
            childNode = childNode.nextSibling;
        }
    }
}
if (false) {
    /** @type {?} */
    InertBodyHelper.prototype.inertBodyElement;
    /** @type {?} */
    InertBodyHelper.prototype.inertDocument;
    /**
     * Get an inert DOM element containing DOM created from the dirty HTML string provided.
     * The implementation of this is determined in the constructor, when the class is instantiated.
     * @type {?}
     */
    InertBodyHelper.prototype.getInertBodyElement;
    /** @type {?} */
    InertBodyHelper.prototype.defaultDoc;
}
/**
 * We need to determine whether the DOMParser exists in the global context.
 * The try-catch is because, on some browsers, trying to access this property
 * on window can actually throw an error.
 *
 * @suppress {uselessCode}
 * @return {?}
 */
function isDOMParserAvailable() {
    try {
        return !!((/** @type {?} */ (window))).DOMParser;
    }
    catch (e) {
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5lcnRfYm9keS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2NvcmUvc3JjL3Nhbml0aXphdGlvbi9pbmVydF9ib2R5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQkEsTUFBTSxPQUFPLGVBQWU7Ozs7SUFJMUIsWUFBb0IsVUFBb0I7UUFBcEIsZUFBVSxHQUFWLFVBQVUsQ0FBVTtRQUN0QyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDN0YsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDO1FBRWhELElBQUksSUFBSSxDQUFDLGdCQUFnQixJQUFJLElBQUksRUFBRTs7OztrQkFHM0IsU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQztZQUMxRCxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakUsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztTQUM5QztRQUVELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEdBQUcsc0RBQXNELENBQUM7UUFDekYsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN0RixvRkFBb0Y7WUFDcEYsMkJBQTJCO1lBQzNCLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUM7WUFDeEQsT0FBTztTQUNSO1FBRUQsSUFB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Q0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7O2tCQUNyQyxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7O2tCQUN4QixRQUFRLEdBQUcsbUJBQUEsTUFBTSxFQUFFLENBQUMsSUFBSTtZQUM5QixJQUFJLFFBQVEsS0FBSyxXQUFXLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzlELEVBQUUsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDOUI7U0FDRjs7WUFDRyxTQUFTLEdBQUcsbUJBQUEsRUFBRSxDQUFDLFVBQVUsRUFBZTtRQUM1QyxPQUFPLFNBQVMsRUFBRTtZQUNoQixJQUFJLFNBQVMsQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLFlBQVk7Z0JBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLG1CQUFBLFNBQVMsRUFBVyxDQUFDLENBQUM7WUFDNUYsU0FBUyxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUM7U0FDbkM7SUFDSCxDQUFDO0NBQ0Y7OztJQTlJQywyQ0FBc0M7O0lBQ3RDLHdDQUFnQzs7Ozs7O0lBNENoQyw4Q0FBMEQ7O0lBMUM5QyxxQ0FBNEI7Ozs7Ozs7Ozs7QUFvSjFDLFNBQVMsb0JBQW9CO0lBQzNCLElBQUk7UUFDRixPQUFPLENBQUMsQ0FBQyxDQUFDLG1CQUFBLE1BQU0sRUFBTyxDQUFDLENBQUMsU0FBUyxDQUFDO0tBQ3BDO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixPQUFPLEtBQUssQ0FBQztLQUNkO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBUaGlzIGhlbHBlciBjbGFzcyBpcyB1c2VkIHRvIGdldCBob2xkIG9mIGFuIGluZXJ0IHRyZWUgb2YgRE9NIGVsZW1lbnRzIGNvbnRhaW5pbmcgZGlydHkgSFRNTFxuICogdGhhdCBuZWVkcyBzYW5pdGl6aW5nLlxuICogRGVwZW5kaW5nIHVwb24gYnJvd3NlciBzdXBwb3J0IHdlIG11c3QgdXNlIG9uZSBvZiB0aHJlZSBzdHJhdGVnaWVzIGZvciBkb2luZyB0aGlzLlxuICogU3VwcG9ydDogU2FmYXJpIDEwLnggLT4gWEhSIHN0cmF0ZWd5XG4gKiBTdXBwb3J0OiBGaXJlZm94IC0+IERvbVBhcnNlciBzdHJhdGVneVxuICogRGVmYXVsdDogSW5lcnREb2N1bWVudCBzdHJhdGVneVxuICovXG5leHBvcnQgY2xhc3MgSW5lcnRCb2R5SGVscGVyIHtcbiAgcHJpdmF0ZSBpbmVydEJvZHlFbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgcHJpdmF0ZSBpbmVydERvY3VtZW50OiBEb2N1bWVudDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGRlZmF1bHREb2M6IERvY3VtZW50KSB7XG4gICAgdGhpcy5pbmVydERvY3VtZW50ID0gdGhpcy5kZWZhdWx0RG9jLmltcGxlbWVudGF0aW9uLmNyZWF0ZUhUTUxEb2N1bWVudCgnc2FuaXRpemF0aW9uLWluZXJ0Jyk7XG4gICAgdGhpcy5pbmVydEJvZHlFbGVtZW50ID0gdGhpcy5pbmVydERvY3VtZW50LmJvZHk7XG5cbiAgICBpZiAodGhpcy5pbmVydEJvZHlFbGVtZW50ID09IG51bGwpIHtcbiAgICAgIC8vIHVzdWFsbHkgdGhlcmUgc2hvdWxkIGJlIG9ubHkgb25lIGJvZHkgZWxlbWVudCBpbiB0aGUgZG9jdW1lbnQsIGJ1dCBJRSBkb2Vzbid0IGhhdmUgYW55LCBzb1xuICAgICAgLy8gd2UgbmVlZCB0byBjcmVhdGUgb25lLlxuICAgICAgY29uc3QgaW5lcnRIdG1sID0gdGhpcy5pbmVydERvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2h0bWwnKTtcbiAgICAgIHRoaXMuaW5lcnREb2N1bWVudC5hcHBlbmRDaGlsZChpbmVydEh0bWwpO1xuICAgICAgdGhpcy5pbmVydEJvZHlFbGVtZW50ID0gdGhpcy5pbmVydERvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JvZHknKTtcbiAgICAgIGluZXJ0SHRtbC5hcHBlbmRDaGlsZCh0aGlzLmluZXJ0Qm9keUVsZW1lbnQpO1xuICAgIH1cblxuICAgIHRoaXMuaW5lcnRCb2R5RWxlbWVudC5pbm5lckhUTUwgPSAnPHN2Zz48ZyBvbmxvYWQ9XCJ0aGlzLnBhcmVudE5vZGUucmVtb3ZlKClcIj48L2c+PC9zdmc+JztcbiAgICBpZiAodGhpcy5pbmVydEJvZHlFbGVtZW50LnF1ZXJ5U2VsZWN0b3IgJiYgIXRoaXMuaW5lcnRCb2R5RWxlbWVudC5xdWVyeVNlbGVjdG9yKCdzdmcnKSkge1xuICAgICAgLy8gV2UganVzdCBoaXQgdGhlIFNhZmFyaSAxMC4xIGJ1ZyAtIHdoaWNoIGFsbG93cyBKUyB0byBydW4gaW5zaWRlIHRoZSBTVkcgRyBlbGVtZW50XG4gICAgICAvLyBzbyB1c2UgdGhlIFhIUiBzdHJhdGVneS5cbiAgICAgIHRoaXMuZ2V0SW5lcnRCb2R5RWxlbWVudCA9IHRoaXMuZ2V0SW5lcnRCb2R5RWxlbWVudF9YSFI7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5pbmVydEJvZHlFbGVtZW50LmlubmVySFRNTCA9XG4gICAgICAgICc8c3ZnPjxwPjxzdHlsZT48aW1nIHNyYz1cIjwvc3R5bGU+PGltZyBzcmM9eCBvbmVycm9yPWFsZXJ0KDEpLy9cIj4nO1xuICAgIGlmICh0aGlzLmluZXJ0Qm9keUVsZW1lbnQucXVlcnlTZWxlY3RvciAmJiB0aGlzLmluZXJ0Qm9keUVsZW1lbnQucXVlcnlTZWxlY3Rvcignc3ZnIGltZycpKSB7XG4gICAgICAvLyBXZSBqdXN0IGhpdCB0aGUgRmlyZWZveCBidWcgLSB3aGljaCBwcmV2ZW50cyB0aGUgaW5uZXIgaW1nIEpTIGZyb20gYmVpbmcgc2FuaXRpemVkXG4gICAgICAvLyBzbyB1c2UgdGhlIERPTVBhcnNlciBzdHJhdGVneSwgaWYgaXQgaXMgYXZhaWxhYmxlLlxuICAgICAgLy8gSWYgdGhlIERPTVBhcnNlciBpcyBub3QgYXZhaWxhYmxlIHRoZW4gd2UgYXJlIG5vdCBpbiBGaXJlZm94IChTZXJ2ZXIvV2ViV29ya2VyPykgc28gd2VcbiAgICAgIC8vIGZhbGwgdGhyb3VnaCB0byB0aGUgZGVmYXVsdCBzdHJhdGVneSBiZWxvdy5cbiAgICAgIGlmIChpc0RPTVBhcnNlckF2YWlsYWJsZSgpKSB7XG4gICAgICAgIHRoaXMuZ2V0SW5lcnRCb2R5RWxlbWVudCA9IHRoaXMuZ2V0SW5lcnRCb2R5RWxlbWVudF9ET01QYXJzZXI7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBOb25lIG9mIHRoZSBidWdzIHdlcmUgaGl0IHNvIGl0IGlzIHNhZmUgZm9yIHVzIHRvIHVzZSB0aGUgZGVmYXVsdCBJbmVydERvY3VtZW50IHN0cmF0ZWd5XG4gICAgdGhpcy5nZXRJbmVydEJvZHlFbGVtZW50ID0gdGhpcy5nZXRJbmVydEJvZHlFbGVtZW50X0luZXJ0RG9jdW1lbnQ7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFuIGluZXJ0IERPTSBlbGVtZW50IGNvbnRhaW5pbmcgRE9NIGNyZWF0ZWQgZnJvbSB0aGUgZGlydHkgSFRNTCBzdHJpbmcgcHJvdmlkZWQuXG4gICAqIFRoZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGlzIGlzIGRldGVybWluZWQgaW4gdGhlIGNvbnN0cnVjdG9yLCB3aGVuIHRoZSBjbGFzcyBpcyBpbnN0YW50aWF0ZWQuXG4gICAqL1xuICBnZXRJbmVydEJvZHlFbGVtZW50OiAoaHRtbDogc3RyaW5nKSA9PiBIVE1MRWxlbWVudCB8IG51bGw7XG5cbiAgLyoqXG4gICAqIFVzZSBYSFIgdG8gY3JlYXRlIGFuZCBmaWxsIGFuIGluZXJ0IGJvZHkgZWxlbWVudCAob24gU2FmYXJpIDEwLjEpXG4gICAqIFNlZVxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vY3VyZTUzL0RPTVB1cmlmeS9ibG9iL2E5OTJkM2E3NTAzMWNiOGJiMDMyZTVlYTgzOTliYTk3MmJkZjlhNjUvc3JjL3B1cmlmeS5qcyNMNDM5LUw0NDlcbiAgICovXG4gIHByaXZhdGUgZ2V0SW5lcnRCb2R5RWxlbWVudF9YSFIoaHRtbDogc3RyaW5nKSB7XG4gICAgLy8gV2UgYWRkIHRoZXNlIGV4dHJhIGVsZW1lbnRzIHRvIGVuc3VyZSB0aGF0IHRoZSByZXN0IG9mIHRoZSBjb250ZW50IGlzIHBhcnNlZCBhcyBleHBlY3RlZFxuICAgIC8vIGUuZy4gbGVhZGluZyB3aGl0ZXNwYWNlIGlzIG1haW50YWluZWQgYW5kIHRhZ3MgbGlrZSBgPG1ldGE+YCBkbyBub3QgZ2V0IGhvaXN0ZWQgdG8gdGhlXG4gICAgLy8gYDxoZWFkPmAgdGFnLlxuICAgIGh0bWwgPSAnPGJvZHk+PHJlbW92ZT48L3JlbW92ZT4nICsgaHRtbCArICc8L2JvZHk+JztcbiAgICB0cnkge1xuICAgICAgaHRtbCA9IGVuY29kZVVSSShodG1sKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdkb2N1bWVudCc7XG4gICAgeGhyLm9wZW4oJ0dFVCcsICdkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LCcgKyBodG1sLCBmYWxzZSk7XG4gICAgeGhyLnNlbmQodW5kZWZpbmVkKTtcbiAgICBjb25zdCBib2R5OiBIVE1MQm9keUVsZW1lbnQgPSB4aHIucmVzcG9uc2UuYm9keTtcbiAgICBib2R5LnJlbW92ZUNoaWxkKGJvZHkuZmlyc3RDaGlsZCAhKTtcbiAgICByZXR1cm4gYm9keTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2UgRE9NUGFyc2VyIHRvIGNyZWF0ZSBhbmQgZmlsbCBhbiBpbmVydCBib2R5IGVsZW1lbnQgKG9uIEZpcmVmb3gpXG4gICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vY3VyZTUzL0RPTVB1cmlmeS9yZWxlYXNlcy90YWcvMC42LjdcbiAgICpcbiAgICovXG4gIHByaXZhdGUgZ2V0SW5lcnRCb2R5RWxlbWVudF9ET01QYXJzZXIoaHRtbDogc3RyaW5nKSB7XG4gICAgLy8gV2UgYWRkIHRoZXNlIGV4dHJhIGVsZW1lbnRzIHRvIGVuc3VyZSB0aGF0IHRoZSByZXN0IG9mIHRoZSBjb250ZW50IGlzIHBhcnNlZCBhcyBleHBlY3RlZFxuICAgIC8vIGUuZy4gbGVhZGluZyB3aGl0ZXNwYWNlIGlzIG1haW50YWluZWQgYW5kIHRhZ3MgbGlrZSBgPG1ldGE+YCBkbyBub3QgZ2V0IGhvaXN0ZWQgdG8gdGhlXG4gICAgLy8gYDxoZWFkPmAgdGFnLlxuICAgIGh0bWwgPSAnPGJvZHk+PHJlbW92ZT48L3JlbW92ZT4nICsgaHRtbCArICc8L2JvZHk+JztcbiAgICB0cnkge1xuICAgICAgY29uc3QgYm9keSA9IG5ldyAod2luZG93IGFzIGFueSlcbiAgICAgICAgICAgICAgICAgICAgICAgLkRPTVBhcnNlcigpXG4gICAgICAgICAgICAgICAgICAgICAgIC5wYXJzZUZyb21TdHJpbmcoaHRtbCwgJ3RleHQvaHRtbCcpXG4gICAgICAgICAgICAgICAgICAgICAgIC5ib2R5IGFzIEhUTUxCb2R5RWxlbWVudDtcbiAgICAgIGJvZHkucmVtb3ZlQ2hpbGQoYm9keS5maXJzdENoaWxkICEpO1xuICAgICAgcmV0dXJuIGJvZHk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVzZSBhbiBIVE1MNSBgdGVtcGxhdGVgIGVsZW1lbnQsIGlmIHN1cHBvcnRlZCwgb3IgYW4gaW5lcnQgYm9keSBlbGVtZW50IGNyZWF0ZWQgdmlhXG4gICAqIGBjcmVhdGVIdG1sRG9jdW1lbnRgIHRvIGNyZWF0ZSBhbmQgZmlsbCBhbiBpbmVydCBET00gZWxlbWVudC5cbiAgICogVGhpcyBpcyB0aGUgZGVmYXVsdCBzYW5lIHN0cmF0ZWd5IHRvIHVzZSBpZiB0aGUgYnJvd3NlciBkb2VzIG5vdCByZXF1aXJlIG9uZSBvZiB0aGUgc3BlY2lhbGlzZWRcbiAgICogc3RyYXRlZ2llcyBhYm92ZS5cbiAgICovXG4gIHByaXZhdGUgZ2V0SW5lcnRCb2R5RWxlbWVudF9JbmVydERvY3VtZW50KGh0bWw6IHN0cmluZykge1xuICAgIC8vIFByZWZlciB1c2luZyA8dGVtcGxhdGU+IGVsZW1lbnQgaWYgc3VwcG9ydGVkLlxuICAgIGNvbnN0IHRlbXBsYXRlRWwgPSB0aGlzLmluZXJ0RG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKTtcbiAgICBpZiAoJ2NvbnRlbnQnIGluIHRlbXBsYXRlRWwpIHtcbiAgICAgIHRlbXBsYXRlRWwuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgIHJldHVybiB0ZW1wbGF0ZUVsO1xuICAgIH1cblxuICAgIHRoaXMuaW5lcnRCb2R5RWxlbWVudC5pbm5lckhUTUwgPSBodG1sO1xuXG4gICAgLy8gU3VwcG9ydDogSUUgOS0xMSBvbmx5XG4gICAgLy8gc3RyaXAgY3VzdG9tLW5hbWVzcGFjZWQgYXR0cmlidXRlcyBvbiBJRTw9MTFcbiAgICBpZiAoKHRoaXMuZGVmYXVsdERvYyBhcyBhbnkpLmRvY3VtZW50TW9kZSkge1xuICAgICAgdGhpcy5zdHJpcEN1c3RvbU5zQXR0cnModGhpcy5pbmVydEJvZHlFbGVtZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5pbmVydEJvZHlFbGVtZW50O1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZW4gSUU5LTExIGNvbWVzIGFjcm9zcyBhbiB1bmtub3duIG5hbWVzcGFjZWQgYXR0cmlidXRlIGUuZy4gJ3hsaW5rOmZvbycgaXQgYWRkcyAneG1sbnM6bnMxJ1xuICAgKiBhdHRyaWJ1dGUgdG8gZGVjbGFyZSBuczEgbmFtZXNwYWNlIGFuZCBwcmVmaXhlcyB0aGUgYXR0cmlidXRlIHdpdGggJ25zMScgKGUuZy5cbiAgICogJ25zMTp4bGluazpmb28nKS5cbiAgICpcbiAgICogVGhpcyBpcyB1bmRlc2lyYWJsZSBzaW5jZSB3ZSBkb24ndCB3YW50IHRvIGFsbG93IGFueSBvZiB0aGVzZSBjdXN0b20gYXR0cmlidXRlcy4gVGhpcyBtZXRob2RcbiAgICogc3RyaXBzIHRoZW0gYWxsLlxuICAgKi9cbiAgcHJpdmF0ZSBzdHJpcEN1c3RvbU5zQXR0cnMoZWw6IEVsZW1lbnQpIHtcbiAgICBjb25zdCBlbEF0dHJzID0gZWwuYXR0cmlidXRlcztcbiAgICAvLyBsb29wIGJhY2t3YXJkcyBzbyB0aGF0IHdlIGNhbiBzdXBwb3J0IHJlbW92YWxzLlxuICAgIGZvciAobGV0IGkgPSBlbEF0dHJzLmxlbmd0aCAtIDE7IDAgPCBpOyBpLS0pIHtcbiAgICAgIGNvbnN0IGF0dHJpYiA9IGVsQXR0cnMuaXRlbShpKTtcbiAgICAgIGNvbnN0IGF0dHJOYW1lID0gYXR0cmliICEubmFtZTtcbiAgICAgIGlmIChhdHRyTmFtZSA9PT0gJ3htbG5zOm5zMScgfHwgYXR0ck5hbWUuaW5kZXhPZignbnMxOicpID09PSAwKSB7XG4gICAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZShhdHRyTmFtZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGxldCBjaGlsZE5vZGUgPSBlbC5maXJzdENoaWxkIGFzIE5vZGUgfCBudWxsO1xuICAgIHdoaWxlIChjaGlsZE5vZGUpIHtcbiAgICAgIGlmIChjaGlsZE5vZGUubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFKSB0aGlzLnN0cmlwQ3VzdG9tTnNBdHRycyhjaGlsZE5vZGUgYXMgRWxlbWVudCk7XG4gICAgICBjaGlsZE5vZGUgPSBjaGlsZE5vZGUubmV4dFNpYmxpbmc7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogV2UgbmVlZCB0byBkZXRlcm1pbmUgd2hldGhlciB0aGUgRE9NUGFyc2VyIGV4aXN0cyBpbiB0aGUgZ2xvYmFsIGNvbnRleHQuXG4gKiBUaGUgdHJ5LWNhdGNoIGlzIGJlY2F1c2UsIG9uIHNvbWUgYnJvd3NlcnMsIHRyeWluZyB0byBhY2Nlc3MgdGhpcyBwcm9wZXJ0eVxuICogb24gd2luZG93IGNhbiBhY3R1YWxseSB0aHJvdyBhbiBlcnJvci5cbiAqXG4gKiBAc3VwcHJlc3Mge3VzZWxlc3NDb2RlfVxuICovXG5mdW5jdGlvbiBpc0RPTVBhcnNlckF2YWlsYWJsZSgpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gISEod2luZG93IGFzIGFueSkuRE9NUGFyc2VyO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iXX0=