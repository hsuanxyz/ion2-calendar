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
import { DomAdapter } from '../dom/dom_adapter';
/**
 * Provides DOM operations in any browser environment.
 *
 * \@security Tread carefully! Interacting with the DOM directly is dangerous and
 * can introduce XSS risks.
 * @abstract
 */
export class GenericBrowserDomAdapter extends DomAdapter {
    constructor() {
        super();
        this._animationPrefix = null;
        this._transitionEnd = null;
        try {
            /** @type {?} */
            const element = this.createElement('div', document);
            if (this.getStyle(element, 'animationName') != null) {
                this._animationPrefix = '';
            }
            else {
                /** @type {?} */
                const domPrefixes = ['Webkit', 'Moz', 'O', 'ms'];
                for (let i = 0; i < domPrefixes.length; i++) {
                    if (this.getStyle(element, domPrefixes[i] + 'AnimationName') != null) {
                        this._animationPrefix = '-' + domPrefixes[i].toLowerCase() + '-';
                        break;
                    }
                }
            }
            /** @type {?} */
            const transEndEventNames = {
                WebkitTransition: 'webkitTransitionEnd',
                MozTransition: 'transitionend',
                OTransition: 'oTransitionEnd otransitionend',
                transition: 'transitionend'
            };
            Object.keys(transEndEventNames).forEach((key) => {
                if (this.getStyle(element, key) != null) {
                    this._transitionEnd = transEndEventNames[key];
                }
            });
        }
        catch (e) {
            this._animationPrefix = null;
            this._transitionEnd = null;
        }
    }
    /**
     * @param {?} el
     * @return {?}
     */
    getDistributedNodes(el) { return ((/** @type {?} */ (el))).getDistributedNodes(); }
    /**
     * @param {?} el
     * @param {?} baseUrl
     * @param {?} href
     * @return {?}
     */
    resolveAndSetHref(el, baseUrl, href) {
        el.href = href == null ? baseUrl : baseUrl + '/../' + href;
    }
    /**
     * @return {?}
     */
    supportsDOMEvents() { return true; }
    /**
     * @return {?}
     */
    supportsNativeShadowDOM() {
        return typeof ((/** @type {?} */ (document.body))).createShadowRoot === 'function';
    }
    /**
     * @return {?}
     */
    getAnimationPrefix() { return this._animationPrefix ? this._animationPrefix : ''; }
    /**
     * @return {?}
     */
    getTransitionEnd() { return this._transitionEnd ? this._transitionEnd : ''; }
    /**
     * @return {?}
     */
    supportsAnimation() {
        return this._animationPrefix != null && this._transitionEnd != null;
    }
}
if (false) {
    /** @type {?} */
    GenericBrowserDomAdapter.prototype._animationPrefix;
    /** @type {?} */
    GenericBrowserDomAdapter.prototype._transitionEnd;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJpY19icm93c2VyX2FkYXB0ZXIuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9wbGF0Zm9ybS1icm93c2VyL3NyYy9icm93c2VyL2dlbmVyaWNfYnJvd3Nlcl9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLG9CQUFvQixDQUFDOzs7Ozs7OztBQVU5QyxNQUFNLE9BQWdCLHdCQUF5QixTQUFRLFVBQVU7SUFHL0Q7UUFDRSxLQUFLLEVBQUUsQ0FBQztRQUhGLHFCQUFnQixHQUFnQixJQUFJLENBQUM7UUFDckMsbUJBQWMsR0FBZ0IsSUFBSSxDQUFDO1FBR3pDLElBQUk7O2tCQUNJLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUM7WUFDbkQsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsSUFBSSxJQUFJLEVBQUU7Z0JBQ25ELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7YUFDNUI7aUJBQU07O3NCQUNDLFdBQVcsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQztnQkFFaEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQzNDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLGVBQWUsQ0FBQyxJQUFJLElBQUksRUFBRTt3QkFDcEUsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEdBQUcsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsR0FBRyxDQUFDO3dCQUNqRSxNQUFNO3FCQUNQO2lCQUNGO2FBQ0Y7O2tCQUVLLGtCQUFrQixHQUE0QjtnQkFDbEQsZ0JBQWdCLEVBQUUscUJBQXFCO2dCQUN2QyxhQUFhLEVBQUUsZUFBZTtnQkFDOUIsV0FBVyxFQUFFLCtCQUErQjtnQkFDNUMsVUFBVSxFQUFFLGVBQWU7YUFDNUI7WUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBVyxFQUFFLEVBQUU7Z0JBQ3RELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLElBQUksSUFBSSxFQUFFO29CQUN2QyxJQUFJLENBQUMsY0FBYyxHQUFHLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUMvQztZQUNILENBQUMsQ0FBQyxDQUFDO1NBQ0o7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7WUFDN0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7U0FDNUI7SUFDSCxDQUFDOzs7OztJQUVELG1CQUFtQixDQUFDLEVBQWUsSUFBWSxPQUFPLENBQUMsbUJBQUssRUFBRSxFQUFBLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsQ0FBQzs7Ozs7OztJQUN4RixpQkFBaUIsQ0FBQyxFQUFxQixFQUFFLE9BQWUsRUFBRSxJQUFZO1FBQ3BFLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQztJQUM3RCxDQUFDOzs7O0lBQ0QsaUJBQWlCLEtBQWMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDOzs7O0lBQzdDLHVCQUF1QjtRQUNyQixPQUFPLE9BQU0sQ0FBQyxtQkFBSyxRQUFRLENBQUMsSUFBSSxFQUFBLENBQUMsQ0FBQyxnQkFBZ0IsS0FBSyxVQUFVLENBQUM7SUFDcEUsQ0FBQzs7OztJQUNELGtCQUFrQixLQUFhLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Ozs7SUFDM0YsZ0JBQWdCLEtBQWEsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7O0lBQ3JGLGlCQUFpQjtRQUNmLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQztJQUN0RSxDQUFDO0NBQ0Y7OztJQWxEQyxvREFBNkM7O0lBQzdDLGtEQUEyQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEb21BZGFwdGVyfSBmcm9tICcuLi9kb20vZG9tX2FkYXB0ZXInO1xuXG5cblxuLyoqXG4gKiBQcm92aWRlcyBET00gb3BlcmF0aW9ucyBpbiBhbnkgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAqXG4gKiBAc2VjdXJpdHkgVHJlYWQgY2FyZWZ1bGx5ISBJbnRlcmFjdGluZyB3aXRoIHRoZSBET00gZGlyZWN0bHkgaXMgZGFuZ2Vyb3VzIGFuZFxuICogY2FuIGludHJvZHVjZSBYU1Mgcmlza3MuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBHZW5lcmljQnJvd3NlckRvbUFkYXB0ZXIgZXh0ZW5kcyBEb21BZGFwdGVyIHtcbiAgcHJpdmF0ZSBfYW5pbWF0aW9uUHJlZml4OiBzdHJpbmd8bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX3RyYW5zaXRpb25FbmQ6IHN0cmluZ3xudWxsID0gbnVsbDtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuY3JlYXRlRWxlbWVudCgnZGl2JywgZG9jdW1lbnQpO1xuICAgICAgaWYgKHRoaXMuZ2V0U3R5bGUoZWxlbWVudCwgJ2FuaW1hdGlvbk5hbWUnKSAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuX2FuaW1hdGlvblByZWZpeCA9ICcnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZG9tUHJlZml4ZXMgPSBbJ1dlYmtpdCcsICdNb3onLCAnTycsICdtcyddO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZG9tUHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAodGhpcy5nZXRTdHlsZShlbGVtZW50LCBkb21QcmVmaXhlc1tpXSArICdBbmltYXRpb25OYW1lJykgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5fYW5pbWF0aW9uUHJlZml4ID0gJy0nICsgZG9tUHJlZml4ZXNbaV0udG9Mb3dlckNhc2UoKSArICctJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCB0cmFuc0VuZEV2ZW50TmFtZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgICBXZWJraXRUcmFuc2l0aW9uOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXG4gICAgICAgIE1velRyYW5zaXRpb246ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICAgT1RyYW5zaXRpb246ICdvVHJhbnNpdGlvbkVuZCBvdHJhbnNpdGlvbmVuZCcsXG4gICAgICAgIHRyYW5zaXRpb246ICd0cmFuc2l0aW9uZW5kJ1xuICAgICAgfTtcblxuICAgICAgT2JqZWN0LmtleXModHJhbnNFbmRFdmVudE5hbWVzKS5mb3JFYWNoKChrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAodGhpcy5nZXRTdHlsZShlbGVtZW50LCBrZXkpICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLl90cmFuc2l0aW9uRW5kID0gdHJhbnNFbmRFdmVudE5hbWVzW2tleV07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX2FuaW1hdGlvblByZWZpeCA9IG51bGw7XG4gICAgICB0aGlzLl90cmFuc2l0aW9uRW5kID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBnZXREaXN0cmlidXRlZE5vZGVzKGVsOiBIVE1MRWxlbWVudCk6IE5vZGVbXSB7IHJldHVybiAoPGFueT5lbCkuZ2V0RGlzdHJpYnV0ZWROb2RlcygpOyB9XG4gIHJlc29sdmVBbmRTZXRIcmVmKGVsOiBIVE1MQW5jaG9yRWxlbWVudCwgYmFzZVVybDogc3RyaW5nLCBocmVmOiBzdHJpbmcpIHtcbiAgICBlbC5ocmVmID0gaHJlZiA9PSBudWxsID8gYmFzZVVybCA6IGJhc2VVcmwgKyAnLy4uLycgKyBocmVmO1xuICB9XG4gIHN1cHBvcnRzRE9NRXZlbnRzKCk6IGJvb2xlYW4geyByZXR1cm4gdHJ1ZTsgfVxuICBzdXBwb3J0c05hdGl2ZVNoYWRvd0RPTSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHlwZW9mKDxhbnk+ZG9jdW1lbnQuYm9keSkuY3JlYXRlU2hhZG93Um9vdCA9PT0gJ2Z1bmN0aW9uJztcbiAgfVxuICBnZXRBbmltYXRpb25QcmVmaXgoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuX2FuaW1hdGlvblByZWZpeCA/IHRoaXMuX2FuaW1hdGlvblByZWZpeCA6ICcnOyB9XG4gIGdldFRyYW5zaXRpb25FbmQoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuX3RyYW5zaXRpb25FbmQgPyB0aGlzLl90cmFuc2l0aW9uRW5kIDogJyc7IH1cbiAgc3VwcG9ydHNBbmltYXRpb24oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2FuaW1hdGlvblByZWZpeCAhPSBudWxsICYmIHRoaXMuX3RyYW5zaXRpb25FbmQgIT0gbnVsbDtcbiAgfVxufVxuIl19