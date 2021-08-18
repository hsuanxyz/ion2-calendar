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
import { isDevMode } from '../is_dev_mode';
import { InertBodyHelper } from './inert_body';
import { _sanitizeUrl, sanitizeSrcset } from './url_sanitizer';
/**
 * @param {?} tags
 * @return {?}
 */
function tagSet(tags) {
    /** @type {?} */
    const res = {};
    for (const t of tags.split(','))
        res[t] = true;
    return res;
}
/**
 * @param {...?} sets
 * @return {?}
 */
function merge(...sets) {
    /** @type {?} */
    const res = {};
    for (const s of sets) {
        for (const v in s) {
            if (s.hasOwnProperty(v))
                res[v] = true;
        }
    }
    return res;
}
// Good source of info about elements and attributes
// http://dev.w3.org/html5/spec/Overview.html#semantics
// http://simon.html5.org/html-elements
// Safe Void Elements - HTML5
// http://dev.w3.org/html5/spec/Overview.html#void-elements
/** @type {?} */
const VOID_ELEMENTS = tagSet('area,br,col,hr,img,wbr');
// Elements that you can, intentionally, leave open (and which close themselves)
// http://dev.w3.org/html5/spec/Overview.html#optional-tags
/** @type {?} */
const OPTIONAL_END_TAG_BLOCK_ELEMENTS = tagSet('colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr');
/** @type {?} */
const OPTIONAL_END_TAG_INLINE_ELEMENTS = tagSet('rp,rt');
/** @type {?} */
const OPTIONAL_END_TAG_ELEMENTS = merge(OPTIONAL_END_TAG_INLINE_ELEMENTS, OPTIONAL_END_TAG_BLOCK_ELEMENTS);
// Safe Block Elements - HTML5
/** @type {?} */
const BLOCK_ELEMENTS = merge(OPTIONAL_END_TAG_BLOCK_ELEMENTS, tagSet('address,article,' +
    'aside,blockquote,caption,center,del,details,dialog,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,' +
    'h6,header,hgroup,hr,ins,main,map,menu,nav,ol,pre,section,summary,table,ul'));
// Inline Elements - HTML5
/** @type {?} */
const INLINE_ELEMENTS = merge(OPTIONAL_END_TAG_INLINE_ELEMENTS, tagSet('a,abbr,acronym,audio,b,' +
    'bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,picture,q,ruby,rp,rt,s,' +
    'samp,small,source,span,strike,strong,sub,sup,time,track,tt,u,var,video'));
/** @type {?} */
export const VALID_ELEMENTS = merge(VOID_ELEMENTS, BLOCK_ELEMENTS, INLINE_ELEMENTS, OPTIONAL_END_TAG_ELEMENTS);
// Attributes that have href and hence need to be sanitized
/** @type {?} */
export const URI_ATTRS = tagSet('background,cite,href,itemtype,longdesc,poster,src,xlink:href');
// Attributes that have special href set hence need to be sanitized
/** @type {?} */
export const SRCSET_ATTRS = tagSet('srcset');
/** @type {?} */
const HTML_ATTRS = tagSet('abbr,accesskey,align,alt,autoplay,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,' +
    'compact,controls,coords,datetime,default,dir,download,face,headers,height,hidden,hreflang,hspace,' +
    'ismap,itemscope,itemprop,kind,label,lang,language,loop,media,muted,nohref,nowrap,open,preload,rel,rev,role,rows,rowspan,rules,' +
    'scope,scrolling,shape,size,sizes,span,srclang,start,summary,tabindex,target,title,translate,type,usemap,' +
    'valign,value,vspace,width');
// NB: This currently consciously doesn't support SVG. SVG sanitization has had several security
// issues in the past, so it seems safer to leave it out if possible. If support for binding SVG via
// innerHTML is required, SVG attributes should be added here.
// NB: Sanitization does not allow <form> elements or other active elements (<button> etc). Those
// can be sanitized, but they increase security surface area without a legitimate use case, so they
// are left out here.
/** @type {?} */
export const VALID_ATTRS = merge(URI_ATTRS, SRCSET_ATTRS, HTML_ATTRS);
/**
 * SanitizingHtmlSerializer serializes a DOM fragment, stripping out any unsafe elements and unsafe
 * attributes.
 */
class SanitizingHtmlSerializer {
    constructor() {
        // Explicitly track if something was stripped, to avoid accidentally warning of sanitization just
        // because characters were re-encoded.
        this.sanitizedSomething = false;
        this.buf = [];
    }
    /**
     * @param {?} el
     * @return {?}
     */
    sanitizeChildren(el) {
        // This cannot use a TreeWalker, as it has to run on Angular's various DOM adapters.
        // However this code never accesses properties off of `document` before deleting its contents
        // again, so it shouldn't be vulnerable to DOM clobbering.
        /** @type {?} */
        let current = (/** @type {?} */ (el.firstChild));
        /** @type {?} */
        let elementValid = true;
        while (current) {
            if (current.nodeType === Node.ELEMENT_NODE) {
                elementValid = this.startElement((/** @type {?} */ (current)));
            }
            else if (current.nodeType === Node.TEXT_NODE) {
                this.chars((/** @type {?} */ (current.nodeValue)));
            }
            else {
                // Strip non-element, non-text nodes.
                this.sanitizedSomething = true;
            }
            if (elementValid && current.firstChild) {
                current = (/** @type {?} */ (current.firstChild));
                continue;
            }
            while (current) {
                // Leaving the element. Walk up and to the right, closing tags as we go.
                if (current.nodeType === Node.ELEMENT_NODE) {
                    this.endElement((/** @type {?} */ (current)));
                }
                /** @type {?} */
                let next = this.checkClobberedElement(current, (/** @type {?} */ (current.nextSibling)));
                if (next) {
                    current = next;
                    break;
                }
                current = this.checkClobberedElement(current, (/** @type {?} */ (current.parentNode)));
            }
        }
        return this.buf.join('');
    }
    /**
     * Outputs only valid Elements.
     *
     * Invalid elements are skipped.
     *
     * @param {?} element element to sanitize
     * Returns true if the element is valid.
     * @return {?}
     */
    startElement(element) {
        /** @type {?} */
        const tagName = element.nodeName.toLowerCase();
        if (!VALID_ELEMENTS.hasOwnProperty(tagName)) {
            this.sanitizedSomething = true;
            return false;
        }
        this.buf.push('<');
        this.buf.push(tagName);
        /** @type {?} */
        const elAttrs = element.attributes;
        for (let i = 0; i < elAttrs.length; i++) {
            /** @type {?} */
            const elAttr = elAttrs.item(i);
            /** @type {?} */
            const attrName = (/** @type {?} */ (elAttr)).name;
            /** @type {?} */
            const lower = attrName.toLowerCase();
            if (!VALID_ATTRS.hasOwnProperty(lower)) {
                this.sanitizedSomething = true;
                continue;
            }
            /** @type {?} */
            let value = (/** @type {?} */ (elAttr)).value;
            // TODO(martinprobst): Special case image URIs for data:image/...
            if (URI_ATTRS[lower])
                value = _sanitizeUrl(value);
            if (SRCSET_ATTRS[lower])
                value = sanitizeSrcset(value);
            this.buf.push(' ', attrName, '="', encodeEntities(value), '"');
        }
        this.buf.push('>');
        return true;
    }
    /**
     * @param {?} current
     * @return {?}
     */
    endElement(current) {
        /** @type {?} */
        const tagName = current.nodeName.toLowerCase();
        if (VALID_ELEMENTS.hasOwnProperty(tagName) && !VOID_ELEMENTS.hasOwnProperty(tagName)) {
            this.buf.push('</');
            this.buf.push(tagName);
            this.buf.push('>');
        }
    }
    /**
     * @param {?} chars
     * @return {?}
     */
    chars(chars) { this.buf.push(encodeEntities(chars)); }
    /**
     * @param {?} node
     * @param {?} nextNode
     * @return {?}
     */
    checkClobberedElement(node, nextNode) {
        if (nextNode &&
            (node.compareDocumentPosition(nextNode) &
                Node.DOCUMENT_POSITION_CONTAINED_BY) === Node.DOCUMENT_POSITION_CONTAINED_BY) {
            throw new Error(`Failed to sanitize html because the element is clobbered: ${((/** @type {?} */ (node))).outerHTML}`);
        }
        return nextNode;
    }
}
if (false) {
    /** @type {?} */
    SanitizingHtmlSerializer.prototype.sanitizedSomething;
    /** @type {?} */
    SanitizingHtmlSerializer.prototype.buf;
}
// Regular Expressions for parsing tags and attributes
/** @type {?} */
const SURROGATE_PAIR_REGEXP = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
// ! to ~ is the ASCII range.
/** @type {?} */
const NON_ALPHANUMERIC_REGEXP = /([^\#-~ |!])/g;
/**
 * Escapes all potentially dangerous characters, so that the
 * resulting string can be safely inserted into attribute or
 * element text.
 * @param {?} value
 * @return {?}
 */
function encodeEntities(value) {
    return value.replace(/&/g, '&amp;')
        .replace(SURROGATE_PAIR_REGEXP, function (match) {
        /** @type {?} */
        const hi = match.charCodeAt(0);
        /** @type {?} */
        const low = match.charCodeAt(1);
        return '&#' + (((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000) + ';';
    })
        .replace(NON_ALPHANUMERIC_REGEXP, function (match) { return '&#' + match.charCodeAt(0) + ';'; })
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
/** @type {?} */
let inertBodyHelper;
/**
 * Sanitizes the given unsafe, untrusted HTML fragment, and returns HTML text that is safe to add to
 * the DOM in a browser environment.
 * @param {?} defaultDoc
 * @param {?} unsafeHtmlInput
 * @return {?}
 */
export function _sanitizeHtml(defaultDoc, unsafeHtmlInput) {
    /** @type {?} */
    let inertBodyElement = null;
    try {
        inertBodyHelper = inertBodyHelper || new InertBodyHelper(defaultDoc);
        // Make sure unsafeHtml is actually a string (TypeScript types are not enforced at runtime).
        /** @type {?} */
        let unsafeHtml = unsafeHtmlInput ? String(unsafeHtmlInput) : '';
        inertBodyElement = inertBodyHelper.getInertBodyElement(unsafeHtml);
        // mXSS protection. Repeatedly parse the document to make sure it stabilizes, so that a browser
        // trying to auto-correct incorrect HTML cannot cause formerly inert HTML to become dangerous.
        /** @type {?} */
        let mXSSAttempts = 5;
        /** @type {?} */
        let parsedHtml = unsafeHtml;
        do {
            if (mXSSAttempts === 0) {
                throw new Error('Failed to sanitize html because the input is unstable');
            }
            mXSSAttempts--;
            unsafeHtml = parsedHtml;
            parsedHtml = (/** @type {?} */ (inertBodyElement)).innerHTML;
            inertBodyElement = inertBodyHelper.getInertBodyElement(unsafeHtml);
        } while (unsafeHtml !== parsedHtml);
        /** @type {?} */
        const sanitizer = new SanitizingHtmlSerializer();
        /** @type {?} */
        const safeHtml = sanitizer.sanitizeChildren((/** @type {?} */ (getTemplateContent((/** @type {?} */ (inertBodyElement))))) || inertBodyElement);
        if (isDevMode() && sanitizer.sanitizedSomething) {
            console.warn('WARNING: sanitizing HTML stripped some content (see http://g.co/ng/security#xss).');
        }
        return safeHtml;
    }
    finally {
        // In case anything goes wrong, clear out inertElement to reset the entire DOM structure.
        if (inertBodyElement) {
            /** @type {?} */
            const parent = getTemplateContent(inertBodyElement) || inertBodyElement;
            while (parent.firstChild) {
                parent.removeChild(parent.firstChild);
            }
        }
    }
}
/**
 * @param {?} el
 * @return {?}
 */
export function getTemplateContent(el) {
    return 'content' in ((/** @type {?} */ (el))) && isTemplateElement(el) ?
        el.content :
        null;
}
/**
 * @param {?} el
 * @return {?}
 */
function isTemplateElement(el) {
    return el.nodeType === Node.ELEMENT_NODE && el.nodeName === 'TEMPLATE';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbF9zYW5pdGl6ZXIuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9jb3JlL3NyYy9zYW5pdGl6YXRpb24vaHRtbF9zYW5pdGl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDekMsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUM3QyxPQUFPLEVBQUMsWUFBWSxFQUFFLGNBQWMsRUFBQyxNQUFNLGlCQUFpQixDQUFDOzs7OztBQUU3RCxTQUFTLE1BQU0sQ0FBQyxJQUFZOztVQUNwQixHQUFHLEdBQTJCLEVBQUU7SUFDdEMsS0FBSyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztRQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDL0MsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDOzs7OztBQUVELFNBQVMsS0FBSyxDQUFDLEdBQUcsSUFBOEI7O1VBQ3hDLEdBQUcsR0FBMkIsRUFBRTtJQUN0QyxLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRTtRQUNwQixLQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNqQixJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO2dCQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7U0FDeEM7S0FDRjtJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQzs7Ozs7OztNQVFLLGFBQWEsR0FBRyxNQUFNLENBQUMsd0JBQXdCLENBQUM7Ozs7TUFJaEQsK0JBQStCLEdBQUcsTUFBTSxDQUFDLGdEQUFnRCxDQUFDOztNQUMxRixnQ0FBZ0MsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDOztNQUNsRCx5QkFBeUIsR0FDM0IsS0FBSyxDQUFDLGdDQUFnQyxFQUFFLCtCQUEr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c2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtpc0Rldk1vZGV9IGZyb20gJy4uL2lzX2Rldl9tb2RlJztcbmltcG9ydCB7SW5lcnRCb2R5SGVscGVyfSBmcm9tICcuL2luZXJ0X2JvZHknO1xuaW1wb3J0IHtfc2FuaXRpemVVcmwsIHNhbml0aXplU3Jjc2V0fSBmcm9tICcuL3VybF9zYW5pdGl6ZXInO1xuXG5mdW5jdGlvbiB0YWdTZXQodGFnczogc3RyaW5nKToge1trOiBzdHJpbmddOiBib29sZWFufSB7XG4gIGNvbnN0IHJlczoge1trOiBzdHJpbmddOiBib29sZWFufSA9IHt9O1xuICBmb3IgKGNvbnN0IHQgb2YgdGFncy5zcGxpdCgnLCcpKSByZXNbdF0gPSB0cnVlO1xuICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBtZXJnZSguLi5zZXRzOiB7W2s6IHN0cmluZ106IGJvb2xlYW59W10pOiB7W2s6IHN0cmluZ106IGJvb2xlYW59IHtcbiAgY29uc3QgcmVzOiB7W2s6IHN0cmluZ106IGJvb2xlYW59ID0ge307XG4gIGZvciAoY29uc3QgcyBvZiBzZXRzKSB7XG4gICAgZm9yIChjb25zdCB2IGluIHMpIHtcbiAgICAgIGlmIChzLmhhc093blByb3BlcnR5KHYpKSByZXNbdl0gPSB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG4vLyBHb29kIHNvdXJjZSBvZiBpbmZvIGFib3V0IGVsZW1lbnRzIGFuZCBhdHRyaWJ1dGVzXG4vLyBodHRwOi8vZGV2LnczLm9yZy9odG1sNS9zcGVjL092ZXJ2aWV3Lmh0bWwjc2VtYW50aWNzXG4vLyBodHRwOi8vc2ltb24uaHRtbDUub3JnL2h0bWwtZWxlbWVudHNcblxuLy8gU2FmZSBWb2lkIEVsZW1lbnRzIC0gSFRNTDVcbi8vIGh0dHA6Ly9kZXYudzMub3JnL2h0bWw1L3NwZWMvT3ZlcnZpZXcuaHRtbCN2b2lkLWVsZW1lbnRzXG5jb25zdCBWT0lEX0VMRU1FTlRTID0gdGFnU2V0KCdhcmVhLGJyLGNvbCxocixpbWcsd2JyJyk7XG5cbi8vIEVsZW1lbnRzIHRoYXQgeW91IGNhbiwgaW50ZW50aW9uYWxseSwgbGVhdmUgb3BlbiAoYW5kIHdoaWNoIGNsb3NlIHRoZW1zZWx2ZXMpXG4vLyBodHRwOi8vZGV2LnczLm9yZy9odG1sNS9zcGVjL092ZXJ2aWV3Lmh0bWwjb3B0aW9uYWwtdGFnc1xuY29uc3QgT1BUSU9OQUxfRU5EX1RBR19CTE9DS19FTEVNRU5UUyA9IHRhZ1NldCgnY29sZ3JvdXAsZGQsZHQsbGkscCx0Ym9keSx0ZCx0Zm9vdCx0aCx0aGVhZCx0cicpO1xuY29uc3QgT1BUSU9OQUxfRU5EX1RBR19JTkxJTkVfRUxFTUVOVFMgPSB0YWdTZXQoJ3JwLHJ0Jyk7XG5jb25zdCBPUFRJT05BTF9FTkRfVEFHX0VMRU1FTlRTID1cbiAgICBtZXJnZShPUFRJT05BTF9FTkRfVEFHX0lOTElORV9FTEVNRU5UUywgT1BUSU9OQUxfRU5EX1RBR19CTE9DS19FTEVNRU5UUyk7XG5cbi8vIFNhZmUgQmxvY2sgRWxlbWVudHMgLSBIVE1MNVxuY29uc3QgQkxPQ0tfRUxFTUVOVFMgPSBtZXJnZShcbiAgICBPUFRJT05BTF9FTkRfVEFHX0JMT0NLX0VMRU1FTlRTLFxuICAgIHRhZ1NldChcbiAgICAgICAgJ2FkZHJlc3MsYXJ0aWNsZSwnICtcbiAgICAgICAgJ2FzaWRlLGJsb2NrcXVvdGUsY2FwdGlvbixjZW50ZXIsZGVsLGRldGFpbHMsZGlhbG9nLGRpcixkaXYsZGwsZmlndXJlLGZpZ2NhcHRpb24sZm9vdGVyLGgxLGgyLGgzLGg0LGg1LCcgK1xuICAgICAgICAnaDYsaGVhZGVyLGhncm91cCxocixpbnMsbWFpbixtYXAsbWVudSxuYXYsb2wscHJlLHNlY3Rpb24sc3VtbWFyeSx0YWJsZSx1bCcpKTtcblxuLy8gSW5saW5lIEVsZW1lbnRzIC0gSFRNTDVcbmNvbnN0IElOTElORV9FTEVNRU5UUyA9IG1lcmdlKFxuICAgIE9QVElPTkFMX0VORF9UQUdfSU5MSU5FX0VMRU1FTlRTLFxuICAgIHRhZ1NldChcbiAgICAgICAgJ2EsYWJicixhY3JvbnltLGF1ZGlvLGIsJyArXG4gICAgICAgICdiZGksYmRvLGJpZyxicixjaXRlLGNvZGUsZGVsLGRmbixlbSxmb250LGksaW1nLGlucyxrYmQsbGFiZWwsbWFwLG1hcmsscGljdHVyZSxxLHJ1YnkscnAscnQscywnICtcbiAgICAgICAgJ3NhbXAsc21hbGwsc291cmNlLHNwYW4sc3RyaWtlLHN0cm9uZyxzdWIsc3VwLHRpbWUsdHJhY2ssdHQsdSx2YXIsdmlkZW8nKSk7XG5cbmV4cG9ydCBjb25zdCBWQUxJRF9FTEVNRU5UUyA9XG4gICAgbWVyZ2UoVk9JRF9FTEVNRU5UUywgQkxPQ0tfRUxFTUVOVFMsIElOTElORV9FTEVNRU5UUywgT1BUSU9OQUxfRU5EX1RBR19FTEVNRU5UUyk7XG5cbi8vIEF0dHJpYnV0ZXMgdGhhdCBoYXZlIGhyZWYgYW5kIGhlbmNlIG5lZWQgdG8gYmUgc2FuaXRpemVkXG5leHBvcnQgY29uc3QgVVJJX0FUVFJTID0gdGFnU2V0KCdiYWNrZ3JvdW5kLGNpdGUsaHJlZixpdGVtdHlwZSxsb25nZGVzYyxwb3N0ZXIsc3JjLHhsaW5rOmhyZWYnKTtcblxuLy8gQXR0cmlidXRlcyB0aGF0IGhhdmUgc3BlY2lhbCBocmVmIHNldCBoZW5jZSBuZWVkIHRvIGJlIHNhbml0aXplZFxuZXhwb3J0IGNvbnN0IFNSQ1NFVF9BVFRSUyA9IHRhZ1NldCgnc3Jjc2V0Jyk7XG5cbmNvbnN0IEhUTUxfQVRUUlMgPSB0YWdTZXQoXG4gICAgJ2FiYnIsYWNjZXNza2V5LGFsaWduLGFsdCxhdXRvcGxheSxheGlzLGJnY29sb3IsYm9yZGVyLGNlbGxwYWRkaW5nLGNlbGxzcGFjaW5nLGNsYXNzLGNsZWFyLGNvbG9yLGNvbHMsY29sc3BhbiwnICtcbiAgICAnY29tcGFjdCxjb250cm9scyxjb29yZHMsZGF0ZXRpbWUsZGVmYXVsdCxkaXIsZG93bmxvYWQsZmFjZSxoZWFkZXJzLGhlaWdodCxoaWRkZW4saHJlZmxhbmcsaHNwYWNlLCcgK1xuICAgICdpc21hcCxpdGVtc2NvcGUsaXRlbXByb3Asa2luZCxsYWJlbCxsYW5nLGxhbmd1YWdlLGxvb3AsbWVkaWEsbXV0ZWQsbm9ocmVmLG5vd3JhcCxvcGVuLHByZWxvYWQscmVsLHJldixyb2xlLHJvd3Mscm93c3BhbixydWxlcywnICtcbiAgICAnc2NvcGUsc2Nyb2xsaW5nLHNoYXBlLHNpemUsc2l6ZXMsc3BhbixzcmNsYW5nLHN0YXJ0LHN1bW1hcnksdGFiaW5kZXgsdGFyZ2V0LHRpdGxlLHRyYW5zbGF0ZSx0eXBlLHVzZW1hcCwnICtcbiAgICAndmFsaWduLHZhbHVlLHZzcGFjZSx3aWR0aCcpO1xuXG4vLyBOQjogVGhpcyBjdXJyZW50bHkgY29uc2Npb3VzbHkgZG9lc24ndCBzdXBwb3J0IFNWRy4gU1ZHIHNhbml0aXphdGlvbiBoYXMgaGFkIHNldmVyYWwgc2VjdXJpdHlcbi8vIGlzc3VlcyBpbiB0aGUgcGFzdCwgc28gaXQgc2VlbXMgc2FmZXIgdG8gbGVhdmUgaXQgb3V0IGlmIHBvc3NpYmxlLiBJZiBzdXBwb3J0IGZvciBiaW5kaW5nIFNWRyB2aWFcbi8vIGlubmVySFRNTCBpcyByZXF1aXJlZCwgU1ZHIGF0dHJpYnV0ZXMgc2hvdWxkIGJlIGFkZGVkIGhlcmUuXG5cbi8vIE5COiBTYW5pdGl6YXRpb24gZG9lcyBub3QgYWxsb3cgPGZvcm0+IGVsZW1lbnRzIG9yIG90aGVyIGFjdGl2ZSBlbGVtZW50cyAoPGJ1dHRvbj4gZXRjKS4gVGhvc2Vcbi8vIGNhbiBiZSBzYW5pdGl6ZWQsIGJ1dCB0aGV5IGluY3JlYXNlIHNlY3VyaXR5IHN1cmZhY2UgYXJlYSB3aXRob3V0IGEgbGVnaXRpbWF0ZSB1c2UgY2FzZSwgc28gdGhleVxuLy8gYXJlIGxlZnQgb3V0IGhlcmUuXG5cbmV4cG9ydCBjb25zdCBWQUxJRF9BVFRSUyA9IG1lcmdlKFVSSV9BVFRSUywgU1JDU0VUX0FUVFJTLCBIVE1MX0FUVFJTKTtcblxuLyoqXG4gKiBTYW5pdGl6aW5nSHRtbFNlcmlhbGl6ZXIgc2VyaWFsaXplcyBhIERPTSBmcmFnbWVudCwgc3RyaXBwaW5nIG91dCBhbnkgdW5zYWZlIGVsZW1lbnRzIGFuZCB1bnNhZmVcbiAqIGF0dHJpYnV0ZXMuXG4gKi9cbmNsYXNzIFNhbml0aXppbmdIdG1sU2VyaWFsaXplciB7XG4gIC8vIEV4cGxpY2l0bHkgdHJhY2sgaWYgc29tZXRoaW5nIHdhcyBzdHJpcHBlZCwgdG8gYXZvaWQgYWNjaWRlbnRhbGx5IHdhcm5pbmcgb2Ygc2FuaXRpemF0aW9uIGp1c3RcbiAgLy8gYmVjYXVzZSBjaGFyYWN0ZXJzIHdlcmUgcmUtZW5jb2RlZC5cbiAgcHVibGljIHNhbml0aXplZFNvbWV0aGluZyA9IGZhbHNlO1xuICBwcml2YXRlIGJ1Zjogc3RyaW5nW10gPSBbXTtcblxuICBzYW5pdGl6ZUNoaWxkcmVuKGVsOiBFbGVtZW50KTogc3RyaW5nIHtcbiAgICAvLyBUaGlzIGNhbm5vdCB1c2UgYSBUcmVlV2Fsa2VyLCBhcyBpdCBoYXMgdG8gcnVuIG9uIEFuZ3VsYXIncyB2YXJpb3VzIERPTSBhZGFwdGVycy5cbiAgICAvLyBIb3dldmVyIHRoaXMgY29kZSBuZXZlciBhY2Nlc3NlcyBwcm9wZXJ0aWVzIG9mZiBvZiBgZG9jdW1lbnRgIGJlZm9yZSBkZWxldGluZyBpdHMgY29udGVudHNcbiAgICAvLyBhZ2Fpbiwgc28gaXQgc2hvdWxkbid0IGJlIHZ1bG5lcmFibGUgdG8gRE9NIGNsb2JiZXJpbmcuXG4gICAgbGV0IGN1cnJlbnQ6IE5vZGUgPSBlbC5maXJzdENoaWxkICE7XG4gICAgbGV0IGVsZW1lbnRWYWxpZCA9IHRydWU7XG4gICAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICAgIGlmIChjdXJyZW50Lm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSkge1xuICAgICAgICBlbGVtZW50VmFsaWQgPSB0aGlzLnN0YXJ0RWxlbWVudChjdXJyZW50IGFzIEVsZW1lbnQpO1xuICAgICAgfSBlbHNlIGlmIChjdXJyZW50Lm5vZGVUeXBlID09PSBOb2RlLlRFWFRfTk9ERSkge1xuICAgICAgICB0aGlzLmNoYXJzKGN1cnJlbnQubm9kZVZhbHVlICEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU3RyaXAgbm9uLWVsZW1lbnQsIG5vbi10ZXh0IG5vZGVzLlxuICAgICAgICB0aGlzLnNhbml0aXplZFNvbWV0aGluZyA9IHRydWU7XG4gICAgICB9XG4gICAgICBpZiAoZWxlbWVudFZhbGlkICYmIGN1cnJlbnQuZmlyc3RDaGlsZCkge1xuICAgICAgICBjdXJyZW50ID0gY3VycmVudC5maXJzdENoaWxkICE7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICAgICAgLy8gTGVhdmluZyB0aGUgZWxlbWVudC4gV2FsayB1cCBhbmQgdG8gdGhlIHJpZ2h0LCBjbG9zaW5nIHRhZ3MgYXMgd2UgZ28uXG4gICAgICAgIGlmIChjdXJyZW50Lm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSkge1xuICAgICAgICAgIHRoaXMuZW5kRWxlbWVudChjdXJyZW50IGFzIEVsZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG5leHQgPSB0aGlzLmNoZWNrQ2xvYmJlcmVkRWxlbWVudChjdXJyZW50LCBjdXJyZW50Lm5leHRTaWJsaW5nICEpO1xuXG4gICAgICAgIGlmIChuZXh0KSB7XG4gICAgICAgICAgY3VycmVudCA9IG5leHQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBjdXJyZW50ID0gdGhpcy5jaGVja0Nsb2JiZXJlZEVsZW1lbnQoY3VycmVudCwgY3VycmVudC5wYXJlbnROb2RlICEpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5idWYuam9pbignJyk7XG4gIH1cblxuICAvKipcbiAgICogT3V0cHV0cyBvbmx5IHZhbGlkIEVsZW1lbnRzLlxuICAgKlxuICAgKiBJbnZhbGlkIGVsZW1lbnRzIGFyZSBza2lwcGVkLlxuICAgKlxuICAgKiBAcGFyYW0gZWxlbWVudCBlbGVtZW50IHRvIHNhbml0aXplXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZWxlbWVudCBpcyB2YWxpZC5cbiAgICovXG4gIHByaXZhdGUgc3RhcnRFbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnQpOiBib29sZWFuIHtcbiAgICBjb25zdCB0YWdOYW1lID0gZWxlbWVudC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmICghVkFMSURfRUxFTUVOVFMuaGFzT3duUHJvcGVydHkodGFnTmFtZSkpIHtcbiAgICAgIHRoaXMuc2FuaXRpemVkU29tZXRoaW5nID0gdHJ1ZTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy5idWYucHVzaCgnPCcpO1xuICAgIHRoaXMuYnVmLnB1c2godGFnTmFtZSk7XG4gICAgY29uc3QgZWxBdHRycyA9IGVsZW1lbnQuYXR0cmlidXRlcztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsQXR0cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVsQXR0ciA9IGVsQXR0cnMuaXRlbShpKTtcbiAgICAgIGNvbnN0IGF0dHJOYW1lID0gZWxBdHRyICEubmFtZTtcbiAgICAgIGNvbnN0IGxvd2VyID0gYXR0ck5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmICghVkFMSURfQVRUUlMuaGFzT3duUHJvcGVydHkobG93ZXIpKSB7XG4gICAgICAgIHRoaXMuc2FuaXRpemVkU29tZXRoaW5nID0gdHJ1ZTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBsZXQgdmFsdWUgPSBlbEF0dHIgIS52YWx1ZTtcbiAgICAgIC8vIFRPRE8obWFydGlucHJvYnN0KTogU3BlY2lhbCBjYXNlIGltYWdlIFVSSXMgZm9yIGRhdGE6aW1hZ2UvLi4uXG4gICAgICBpZiAoVVJJX0FUVFJTW2xvd2VyXSkgdmFsdWUgPSBfc2FuaXRpemVVcmwodmFsdWUpO1xuICAgICAgaWYgKFNSQ1NFVF9BVFRSU1tsb3dlcl0pIHZhbHVlID0gc2FuaXRpemVTcmNzZXQodmFsdWUpO1xuICAgICAgdGhpcy5idWYucHVzaCgnICcsIGF0dHJOYW1lLCAnPVwiJywgZW5jb2RlRW50aXRpZXModmFsdWUpLCAnXCInKTtcbiAgICB9XG4gICAgdGhpcy5idWYucHVzaCgnPicpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSBlbmRFbGVtZW50KGN1cnJlbnQ6IEVsZW1lbnQpIHtcbiAgICBjb25zdCB0YWdOYW1lID0gY3VycmVudC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChWQUxJRF9FTEVNRU5UUy5oYXNPd25Qcm9wZXJ0eSh0YWdOYW1lKSAmJiAhVk9JRF9FTEVNRU5UUy5oYXNPd25Qcm9wZXJ0eSh0YWdOYW1lKSkge1xuICAgICAgdGhpcy5idWYucHVzaCgnPC8nKTtcbiAgICAgIHRoaXMuYnVmLnB1c2godGFnTmFtZSk7XG4gICAgICB0aGlzLmJ1Zi5wdXNoKCc+Jyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjaGFycyhjaGFyczogc3RyaW5nKSB7IHRoaXMuYnVmLnB1c2goZW5jb2RlRW50aXRpZXMoY2hhcnMpKTsgfVxuXG4gIGNoZWNrQ2xvYmJlcmVkRWxlbWVudChub2RlOiBOb2RlLCBuZXh0Tm9kZTogTm9kZSk6IE5vZGUge1xuICAgIGlmIChuZXh0Tm9kZSAmJlxuICAgICAgICAobm9kZS5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbihuZXh0Tm9kZSkgJlxuICAgICAgICAgTm9kZS5ET0NVTUVOVF9QT1NJVElPTl9DT05UQUlORURfQlkpID09PcKgTm9kZS5ET0NVTUVOVF9QT1NJVElPTl9DT05UQUlORURfQlkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgRmFpbGVkIHRvIHNhbml0aXplIGh0bWwgYmVjYXVzZSB0aGUgZWxlbWVudCBpcyBjbG9iYmVyZWQ6ICR7KG5vZGUgYXMgRWxlbWVudCkub3V0ZXJIVE1MfWApO1xuICAgIH1cbiAgICByZXR1cm4gbmV4dE5vZGU7XG4gIH1cbn1cblxuLy8gUmVndWxhciBFeHByZXNzaW9ucyBmb3IgcGFyc2luZyB0YWdzIGFuZCBhdHRyaWJ1dGVzXG5jb25zdCBTVVJST0dBVEVfUEFJUl9SRUdFWFAgPSAvW1xcdUQ4MDAtXFx1REJGRl1bXFx1REMwMC1cXHVERkZGXS9nO1xuLy8gISB0byB+IGlzIHRoZSBBU0NJSSByYW5nZS5cbmNvbnN0IE5PTl9BTFBIQU5VTUVSSUNfUkVHRVhQID0gLyhbXlxcIy1+IHwhXSkvZztcblxuLyoqXG4gKiBFc2NhcGVzIGFsbCBwb3RlbnRpYWxseSBkYW5nZXJvdXMgY2hhcmFjdGVycywgc28gdGhhdCB0aGVcbiAqIHJlc3VsdGluZyBzdHJpbmcgY2FuIGJlIHNhZmVseSBpbnNlcnRlZCBpbnRvIGF0dHJpYnV0ZSBvclxuICogZWxlbWVudCB0ZXh0LlxuICogQHBhcmFtIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGVuY29kZUVudGl0aWVzKHZhbHVlOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAgIC5yZXBsYWNlKFxuICAgICAgICAgIFNVUlJPR0FURV9QQUlSX1JFR0VYUCxcbiAgICAgICAgICBmdW5jdGlvbihtYXRjaDogc3RyaW5nKSB7XG4gICAgICAgICAgICBjb25zdCBoaSA9IG1hdGNoLmNoYXJDb2RlQXQoMCk7XG4gICAgICAgICAgICBjb25zdCBsb3cgPSBtYXRjaC5jaGFyQ29kZUF0KDEpO1xuICAgICAgICAgICAgcmV0dXJuICcmIycgKyAoKChoaSAtIDB4RDgwMCkgKiAweDQwMCkgKyAobG93IC0gMHhEQzAwKSArIDB4MTAwMDApICsgJzsnO1xuICAgICAgICAgIH0pXG4gICAgICAucmVwbGFjZShcbiAgICAgICAgICBOT05fQUxQSEFOVU1FUklDX1JFR0VYUCxcbiAgICAgICAgICBmdW5jdGlvbihtYXRjaDogc3RyaW5nKSB7IHJldHVybiAnJiMnICsgbWF0Y2guY2hhckNvZGVBdCgwKSArICc7JzsgfSlcbiAgICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7Jyk7XG59XG5cbmxldCBpbmVydEJvZHlIZWxwZXI6IEluZXJ0Qm9keUhlbHBlcjtcblxuLyoqXG4gKiBTYW5pdGl6ZXMgdGhlIGdpdmVuIHVuc2FmZSwgdW50cnVzdGVkIEhUTUwgZnJhZ21lbnQsIGFuZCByZXR1cm5zIEhUTUwgdGV4dCB0aGF0IGlzIHNhZmUgdG8gYWRkIHRvXG4gKiB0aGUgRE9NIGluIGEgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9zYW5pdGl6ZUh0bWwoZGVmYXVsdERvYzogYW55LCB1bnNhZmVIdG1sSW5wdXQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCBpbmVydEJvZHlFbGVtZW50OiBIVE1MRWxlbWVudHxudWxsID0gbnVsbDtcbiAgdHJ5IHtcbiAgICBpbmVydEJvZHlIZWxwZXIgPSBpbmVydEJvZHlIZWxwZXIgfHwgbmV3IEluZXJ0Qm9keUhlbHBlcihkZWZhdWx0RG9jKTtcbiAgICAvLyBNYWtlIHN1cmUgdW5zYWZlSHRtbCBpcyBhY3R1YWxseSBhIHN0cmluZyAoVHlwZVNjcmlwdCB0eXBlcyBhcmUgbm90IGVuZm9yY2VkIGF0IHJ1bnRpbWUpLlxuICAgIGxldCB1bnNhZmVIdG1sID0gdW5zYWZlSHRtbElucHV0ID8gU3RyaW5nKHVuc2FmZUh0bWxJbnB1dCkgOiAnJztcbiAgICBpbmVydEJvZHlFbGVtZW50ID0gaW5lcnRCb2R5SGVscGVyLmdldEluZXJ0Qm9keUVsZW1lbnQodW5zYWZlSHRtbCk7XG5cbiAgICAvLyBtWFNTIHByb3RlY3Rpb24uIFJlcGVhdGVkbHkgcGFyc2UgdGhlIGRvY3VtZW50IHRvIG1ha2Ugc3VyZSBpdCBzdGFiaWxpemVzLCBzbyB0aGF0IGEgYnJvd3NlclxuICAgIC8vIHRyeWluZyB0byBhdXRvLWNvcnJlY3QgaW5jb3JyZWN0IEhUTUwgY2Fubm90IGNhdXNlIGZvcm1lcmx5IGluZXJ0IEhUTUwgdG8gYmVjb21lIGRhbmdlcm91cy5cbiAgICBsZXQgbVhTU0F0dGVtcHRzID0gNTtcbiAgICBsZXQgcGFyc2VkSHRtbCA9IHVuc2FmZUh0bWw7XG5cbiAgICBkbyB7XG4gICAgICBpZiAobVhTU0F0dGVtcHRzID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIHNhbml0aXplIGh0bWwgYmVjYXVzZSB0aGUgaW5wdXQgaXMgdW5zdGFibGUnKTtcbiAgICAgIH1cbiAgICAgIG1YU1NBdHRlbXB0cy0tO1xuXG4gICAgICB1bnNhZmVIdG1sID0gcGFyc2VkSHRtbDtcbiAgICAgIHBhcnNlZEh0bWwgPSBpbmVydEJvZHlFbGVtZW50ICEuaW5uZXJIVE1MO1xuICAgICAgaW5lcnRCb2R5RWxlbWVudCA9IGluZXJ0Qm9keUhlbHBlci5nZXRJbmVydEJvZHlFbGVtZW50KHVuc2FmZUh0bWwpO1xuICAgIH0gd2hpbGUgKHVuc2FmZUh0bWwgIT09IHBhcnNlZEh0bWwpO1xuXG4gICAgY29uc3Qgc2FuaXRpemVyID0gbmV3IFNhbml0aXppbmdIdG1sU2VyaWFsaXplcigpO1xuICAgIGNvbnN0IHNhZmVIdG1sID0gc2FuaXRpemVyLnNhbml0aXplQ2hpbGRyZW4oXG4gICAgICAgIGdldFRlbXBsYXRlQ29udGVudChpbmVydEJvZHlFbGVtZW50ICEpIGFzIEVsZW1lbnQgfHwgaW5lcnRCb2R5RWxlbWVudCk7XG4gICAgaWYgKGlzRGV2TW9kZSgpICYmIHNhbml0aXplci5zYW5pdGl6ZWRTb21ldGhpbmcpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAnV0FSTklORzogc2FuaXRpemluZyBIVE1MIHN0cmlwcGVkIHNvbWUgY29udGVudCAoc2VlIGh0dHA6Ly9nLmNvL25nL3NlY3VyaXR5I3hzcykuJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNhZmVIdG1sO1xuICB9IGZpbmFsbHkge1xuICAgIC8vIEluIGNhc2UgYW55dGhpbmcgZ29lcyB3cm9uZywgY2xlYXIgb3V0IGluZXJ0RWxlbWVudCB0byByZXNldCB0aGUgZW50aXJlIERPTSBzdHJ1Y3R1cmUuXG4gICAgaWYgKGluZXJ0Qm9keUVsZW1lbnQpIHtcbiAgICAgIGNvbnN0IHBhcmVudCA9IGdldFRlbXBsYXRlQ29udGVudChpbmVydEJvZHlFbGVtZW50KSB8fCBpbmVydEJvZHlFbGVtZW50O1xuICAgICAgd2hpbGUgKHBhcmVudC5maXJzdENoaWxkKSB7XG4gICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChwYXJlbnQuZmlyc3RDaGlsZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUZW1wbGF0ZUNvbnRlbnQoZWw6IE5vZGUpOiBOb2RlfG51bGwge1xuICByZXR1cm4gJ2NvbnRlbnQnIGluIChlbCBhcyBhbnkgLyoqIE1pY3Jvc29mdC9UeXBlU2NyaXB0IzIxNTE3ICovKSAmJiBpc1RlbXBsYXRlRWxlbWVudChlbCkgP1xuICAgICAgZWwuY29udGVudCA6XG4gICAgICBudWxsO1xufVxuZnVuY3Rpb24gaXNUZW1wbGF0ZUVsZW1lbnQoZWw6IE5vZGUpOiBlbCBpcyBIVE1MVGVtcGxhdGVFbGVtZW50IHtcbiAgcmV0dXJuIGVsLm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSAmJiBlbC5ub2RlTmFtZSA9PT0gJ1RFTVBMQVRFJztcbn1cbiJdfQ==