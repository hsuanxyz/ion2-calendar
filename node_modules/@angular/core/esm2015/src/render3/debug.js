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
import { DebugRendererFactory2 } from '../view/services';
import { getComponent, getInjector, getLocalRefs, loadContext } from './discovery_utils';
import { TVIEW } from './interfaces/view';
/**
 * Adapts the DebugRendererFactory2 to create a DebugRenderer2 specific for IVY.
 *
 * The created DebugRenderer know how to create a Debug Context specific to IVY.
 */
export class Render3DebugRendererFactory2 extends DebugRendererFactory2 {
    /**
     * @param {?} element
     * @param {?} renderData
     * @return {?}
     */
    createRenderer(element, renderData) {
        /** @type {?} */
        const renderer = (/** @type {?} */ (super.createRenderer(element, renderData)));
        renderer.debugContextFactory = (nativeElement) => new Render3DebugContext(nativeElement);
        return renderer;
    }
}
/**
 * Stores context information about view nodes.
 *
 * Used in tests to retrieve information those nodes.
 */
class Render3DebugContext {
    /**
     * @param {?} _nativeNode
     */
    constructor(_nativeNode) {
        this._nativeNode = _nativeNode;
    }
    /**
     * @return {?}
     */
    get nodeIndex() { return loadContext(this._nativeNode).nodeIndex; }
    /**
     * @return {?}
     */
    get view() { return loadContext(this._nativeNode).lViewData; }
    /**
     * @return {?}
     */
    get injector() { return getInjector(this._nativeNode); }
    /**
     * @return {?}
     */
    get component() { return getComponent(this._nativeNode); }
    /**
     * @return {?}
     */
    get providerTokens() {
        /** @type {?} */
        const lDebugCtx = loadContext(this._nativeNode);
        /** @type {?} */
        const lViewData = lDebugCtx.lViewData;
        /** @type {?} */
        const tNode = (/** @type {?} */ (lViewData[TVIEW].data[lDebugCtx.nodeIndex]));
        /** @type {?} */
        const directivesCount = tNode.flags & 4095 /* DirectiveCountMask */;
        if (directivesCount > 0) {
            /** @type {?} */
            const directiveIdxStart = tNode.flags >> 16 /* DirectiveStartingIndexShift */;
            /** @type {?} */
            const directiveIdxEnd = directiveIdxStart + directivesCount;
            /** @type {?} */
            const viewDirectiveDefs = this.view[TVIEW].data;
            /** @type {?} */
            const directiveDefs = (/** @type {?} */ (viewDirectiveDefs.slice(directiveIdxStart, directiveIdxEnd)));
            return directiveDefs.map(directiveDef => directiveDef.type);
        }
        return [];
    }
    /**
     * @return {?}
     */
    get references() { return getLocalRefs(this._nativeNode); }
    // TODO(pk): check previous implementation and re-implement
    /**
     * @return {?}
     */
    get context() { throw new Error('Not implemented in ivy'); }
    // TODO(pk): check previous implementation and re-implement
    /**
     * @return {?}
     */
    get componentRenderElement() { throw new Error('Not implemented in ivy'); }
    // TODO(pk): check previous implementation and re-implement
    /**
     * @return {?}
     */
    get renderNode() { throw new Error('Not implemented in ivy'); }
    // TODO(pk): check previous implementation and re-implement
    /**
     * @param {?} console
     * @param {...?} values
     * @return {?}
     */
    logError(console, ...values) { console.error(...values); }
}
if (false) {
    /** @type {?} */
    Render3DebugContext.prototype._nativeNode;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWcuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2RlYnVnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBV0EsT0FBTyxFQUFpQixxQkFBcUIsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRXZFLE9BQU8sRUFBQyxZQUFZLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUd2RixPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7Ozs7OztBQVF4QyxNQUFNLE9BQU8sNEJBQTZCLFNBQVEscUJBQXFCOzs7Ozs7SUFDckUsY0FBYyxDQUFDLE9BQVksRUFBRSxVQUE4Qjs7Y0FDbkQsUUFBUSxHQUFHLG1CQUFBLEtBQUssQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxFQUFrQjtRQUM1RSxRQUFRLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxhQUFrQixFQUFFLEVBQUUsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzlGLE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7Q0FDRjs7Ozs7O0FBT0QsTUFBTSxtQkFBbUI7Ozs7SUFDdkIsWUFBb0IsV0FBZ0I7UUFBaEIsZ0JBQVcsR0FBWCxXQUFXLENBQUs7SUFBRyxDQUFDOzs7O0lBRXhDLElBQUksU0FBUyxLQUFrQixPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzs7OztJQUVoRixJQUFJLElBQUksS0FBVSxPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzs7OztJQUVuRSxJQUFJLFFBQVEsS0FBZSxPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7O0lBRWxFLElBQUksU0FBUyxLQUFVLE9BQU8sWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7SUFFL0QsSUFBSSxjQUFjOztjQUNWLFNBQVMsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQzs7Y0FDekMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTOztjQUMvQixLQUFLLEdBQUcsbUJBQUEsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEVBQVM7O2NBQzNELGVBQWUsR0FBRyxLQUFLLENBQUMsS0FBSyxnQ0FBZ0M7UUFFbkUsSUFBSSxlQUFlLEdBQUcsQ0FBQyxFQUFFOztrQkFDakIsaUJBQWlCLEdBQUcsS0FBSyxDQUFDLEtBQUssd0NBQTBDOztrQkFDekUsZUFBZSxHQUFHLGlCQUFpQixHQUFHLGVBQWU7O2tCQUNyRCxpQkFBaUIsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUk7O2tCQUN6QyxhQUFhLEdBQ2YsbUJBQUEsaUJBQWlCLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUFFLGVBQWUsQ0FBQyxFQUF1QjtZQUV0RixPQUFPLGFBQWEsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDN0Q7UUFFRCxPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7Ozs7SUFFRCxJQUFJLFVBQVUsS0FBMkIsT0FBTyxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7SUFHakYsSUFBSSxPQUFPLEtBQVUsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7SUFHakUsSUFBSSxzQkFBc0IsS0FBVSxNQUFNLElBQUksS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztJQUdoRixJQUFJLFVBQVUsS0FBVSxNQUFNLElBQUksS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDOzs7Ozs7O0lBR3BFLFFBQVEsQ0FBQyxPQUFnQixFQUFFLEdBQUcsTUFBYSxJQUFVLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDakY7OztJQTFDYSwwQ0FBd0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0b3J9IGZyb20gJy4uL2RpL2luamVjdG9yJztcbmltcG9ydCB7UmVuZGVyZXIyLCBSZW5kZXJlclR5cGUyfSBmcm9tICcuLi9yZW5kZXIvYXBpJztcbmltcG9ydCB7RGVidWdDb250ZXh0fSBmcm9tICcuLi92aWV3JztcbmltcG9ydCB7RGVidWdSZW5kZXJlcjIsIERlYnVnUmVuZGVyZXJGYWN0b3J5Mn0gZnJvbSAnLi4vdmlldy9zZXJ2aWNlcyc7XG5cbmltcG9ydCB7Z2V0Q29tcG9uZW50LCBnZXRJbmplY3RvciwgZ2V0TG9jYWxSZWZzLCBsb2FkQ29udGV4dH0gZnJvbSAnLi9kaXNjb3ZlcnlfdXRpbHMnO1xuaW1wb3J0IHtEaXJlY3RpdmVEZWZ9IGZyb20gJy4vaW50ZXJmYWNlcy9kZWZpbml0aW9uJztcbmltcG9ydCB7VE5vZGUsIFROb2RlRmxhZ3N9IGZyb20gJy4vaW50ZXJmYWNlcy9ub2RlJztcbmltcG9ydCB7VFZJRVd9IGZyb20gJy4vaW50ZXJmYWNlcy92aWV3JztcblxuXG4vKipcbiAqIEFkYXB0cyB0aGUgRGVidWdSZW5kZXJlckZhY3RvcnkyIHRvIGNyZWF0ZSBhIERlYnVnUmVuZGVyZXIyIHNwZWNpZmljIGZvciBJVlkuXG4gKlxuICogVGhlIGNyZWF0ZWQgRGVidWdSZW5kZXJlciBrbm93IGhvdyB0byBjcmVhdGUgYSBEZWJ1ZyBDb250ZXh0IHNwZWNpZmljIHRvIElWWS5cbiAqL1xuZXhwb3J0IGNsYXNzIFJlbmRlcjNEZWJ1Z1JlbmRlcmVyRmFjdG9yeTIgZXh0ZW5kcyBEZWJ1Z1JlbmRlcmVyRmFjdG9yeTIge1xuICBjcmVhdGVSZW5kZXJlcihlbGVtZW50OiBhbnksIHJlbmRlckRhdGE6IFJlbmRlcmVyVHlwZTJ8bnVsbCk6IFJlbmRlcmVyMiB7XG4gICAgY29uc3QgcmVuZGVyZXIgPSBzdXBlci5jcmVhdGVSZW5kZXJlcihlbGVtZW50LCByZW5kZXJEYXRhKSBhcyBEZWJ1Z1JlbmRlcmVyMjtcbiAgICByZW5kZXJlci5kZWJ1Z0NvbnRleHRGYWN0b3J5ID0gKG5hdGl2ZUVsZW1lbnQ6IGFueSkgPT4gbmV3IFJlbmRlcjNEZWJ1Z0NvbnRleHQobmF0aXZlRWxlbWVudCk7XG4gICAgcmV0dXJuIHJlbmRlcmVyO1xuICB9XG59XG5cbi8qKlxuICogU3RvcmVzIGNvbnRleHQgaW5mb3JtYXRpb24gYWJvdXQgdmlldyBub2Rlcy5cbiAqXG4gKiBVc2VkIGluIHRlc3RzIHRvIHJldHJpZXZlIGluZm9ybWF0aW9uIHRob3NlIG5vZGVzLlxuICovXG5jbGFzcyBSZW5kZXIzRGVidWdDb250ZXh0IGltcGxlbWVudHMgRGVidWdDb250ZXh0IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfbmF0aXZlTm9kZTogYW55KSB7fVxuXG4gIGdldCBub2RlSW5kZXgoKTogbnVtYmVyfG51bGwgeyByZXR1cm4gbG9hZENvbnRleHQodGhpcy5fbmF0aXZlTm9kZSkubm9kZUluZGV4OyB9XG5cbiAgZ2V0IHZpZXcoKTogYW55IHsgcmV0dXJuIGxvYWRDb250ZXh0KHRoaXMuX25hdGl2ZU5vZGUpLmxWaWV3RGF0YTsgfVxuXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiBnZXRJbmplY3Rvcih0aGlzLl9uYXRpdmVOb2RlKTsgfVxuXG4gIGdldCBjb21wb25lbnQoKTogYW55IHsgcmV0dXJuIGdldENvbXBvbmVudCh0aGlzLl9uYXRpdmVOb2RlKTsgfVxuXG4gIGdldCBwcm92aWRlclRva2VucygpOiBhbnlbXSB7XG4gICAgY29uc3QgbERlYnVnQ3R4ID0gbG9hZENvbnRleHQodGhpcy5fbmF0aXZlTm9kZSk7XG4gICAgY29uc3QgbFZpZXdEYXRhID0gbERlYnVnQ3R4LmxWaWV3RGF0YTtcbiAgICBjb25zdCB0Tm9kZSA9IGxWaWV3RGF0YVtUVklFV10uZGF0YVtsRGVidWdDdHgubm9kZUluZGV4XSBhcyBUTm9kZTtcbiAgICBjb25zdCBkaXJlY3RpdmVzQ291bnQgPSB0Tm9kZS5mbGFncyAmIFROb2RlRmxhZ3MuRGlyZWN0aXZlQ291bnRNYXNrO1xuXG4gICAgaWYgKGRpcmVjdGl2ZXNDb3VudCA+IDApIHtcbiAgICAgIGNvbnN0IGRpcmVjdGl2ZUlkeFN0YXJ0ID0gdE5vZGUuZmxhZ3MgPj4gVE5vZGVGbGFncy5EaXJlY3RpdmVTdGFydGluZ0luZGV4U2hpZnQ7XG4gICAgICBjb25zdCBkaXJlY3RpdmVJZHhFbmQgPSBkaXJlY3RpdmVJZHhTdGFydCArIGRpcmVjdGl2ZXNDb3VudDtcbiAgICAgIGNvbnN0IHZpZXdEaXJlY3RpdmVEZWZzID0gdGhpcy52aWV3W1RWSUVXXS5kYXRhO1xuICAgICAgY29uc3QgZGlyZWN0aXZlRGVmcyA9XG4gICAgICAgICAgdmlld0RpcmVjdGl2ZURlZnMuc2xpY2UoZGlyZWN0aXZlSWR4U3RhcnQsIGRpcmVjdGl2ZUlkeEVuZCkgYXMgRGlyZWN0aXZlRGVmPGFueT5bXTtcblxuICAgICAgcmV0dXJuIGRpcmVjdGl2ZURlZnMubWFwKGRpcmVjdGl2ZURlZiA9PiBkaXJlY3RpdmVEZWYudHlwZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgZ2V0IHJlZmVyZW5jZXMoKToge1trZXk6IHN0cmluZ106IGFueX0geyByZXR1cm4gZ2V0TG9jYWxSZWZzKHRoaXMuX25hdGl2ZU5vZGUpOyB9XG5cbiAgLy8gVE9ETyhwayk6IGNoZWNrIHByZXZpb3VzIGltcGxlbWVudGF0aW9uIGFuZCByZS1pbXBsZW1lbnRcbiAgZ2V0IGNvbnRleHQoKTogYW55IHsgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQgaW4gaXZ5Jyk7IH1cblxuICAvLyBUT0RPKHBrKTogY2hlY2sgcHJldmlvdXMgaW1wbGVtZW50YXRpb24gYW5kIHJlLWltcGxlbWVudFxuICBnZXQgY29tcG9uZW50UmVuZGVyRWxlbWVudCgpOiBhbnkgeyB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCBpbiBpdnknKTsgfVxuXG4gIC8vIFRPRE8ocGspOiBjaGVjayBwcmV2aW91cyBpbXBsZW1lbnRhdGlvbiBhbmQgcmUtaW1wbGVtZW50XG4gIGdldCByZW5kZXJOb2RlKCk6IGFueSB7IHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkIGluIGl2eScpOyB9XG5cbiAgLy8gVE9ETyhwayk6IGNoZWNrIHByZXZpb3VzIGltcGxlbWVudGF0aW9uIGFuZCByZS1pbXBsZW1lbnRcbiAgbG9nRXJyb3IoY29uc29sZTogQ29uc29sZSwgLi4udmFsdWVzOiBhbnlbXSk6IHZvaWQgeyBjb25zb2xlLmVycm9yKC4uLnZhbHVlcyk7IH1cbn1cbiJdfQ==