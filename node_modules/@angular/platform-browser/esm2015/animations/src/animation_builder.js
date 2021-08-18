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
import { AnimationBuilder, AnimationFactory, sequence } from '@angular/animations';
import { Inject, Injectable, RendererFactory2, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
export class BrowserAnimationBuilder extends AnimationBuilder {
    /**
     * @param {?} rootRenderer
     * @param {?} doc
     */
    constructor(rootRenderer, doc) {
        super();
        this._nextAnimationId = 0;
        /** @type {?} */
        const typeData = (/** @type {?} */ ({
            id: '0',
            encapsulation: ViewEncapsulation.None,
            styles: [],
            data: { animation: [] }
        }));
        this._renderer = (/** @type {?} */ (rootRenderer.createRenderer(doc.body, typeData)));
    }
    /**
     * @param {?} animation
     * @return {?}
     */
    build(animation) {
        /** @type {?} */
        const id = this._nextAnimationId.toString();
        this._nextAnimationId++;
        /** @type {?} */
        const entry = Array.isArray(animation) ? sequence(animation) : animation;
        issueAnimationCommand(this._renderer, null, id, 'register', [entry]);
        return new BrowserAnimationFactory(id, this._renderer);
    }
}
BrowserAnimationBuilder.decorators = [
    { type: Injectable }
];
/** @nocollapse */
BrowserAnimationBuilder.ctorParameters = () => [
    { type: RendererFactory2 },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
if (false) {
    /** @type {?} */
    BrowserAnimationBuilder.prototype._nextAnimationId;
    /** @type {?} */
    BrowserAnimationBuilder.prototype._renderer;
}
export class BrowserAnimationFactory extends AnimationFactory {
    /**
     * @param {?} _id
     * @param {?} _renderer
     */
    constructor(_id, _renderer) {
        super();
        this._id = _id;
        this._renderer = _renderer;
    }
    /**
     * @param {?} element
     * @param {?=} options
     * @return {?}
     */
    create(element, options) {
        return new RendererAnimationPlayer(this._id, element, options || {}, this._renderer);
    }
}
if (false) {
    /** @type {?} */
    BrowserAnimationFactory.prototype._id;
    /** @type {?} */
    BrowserAnimationFactory.prototype._renderer;
}
export class RendererAnimationPlayer {
    /**
     * @param {?} id
     * @param {?} element
     * @param {?} options
     * @param {?} _renderer
     */
    constructor(id, element, options, _renderer) {
        this.id = id;
        this.element = element;
        this._renderer = _renderer;
        this.parentPlayer = null;
        this._started = false;
        this.totalTime = 0;
        this._command('create', options);
    }
    /**
     * @param {?} eventName
     * @param {?} callback
     * @return {?}
     */
    _listen(eventName, callback) {
        return this._renderer.listen(this.element, `@@${this.id}:${eventName}`, callback);
    }
    /**
     * @param {?} command
     * @param {...?} args
     * @return {?}
     */
    _command(command, ...args) {
        return issueAnimationCommand(this._renderer, this.element, this.id, command, args);
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    onDone(fn) { this._listen('done', fn); }
    /**
     * @param {?} fn
     * @return {?}
     */
    onStart(fn) { this._listen('start', fn); }
    /**
     * @param {?} fn
     * @return {?}
     */
    onDestroy(fn) { this._listen('destroy', fn); }
    /**
     * @return {?}
     */
    init() { this._command('init'); }
    /**
     * @return {?}
     */
    hasStarted() { return this._started; }
    /**
     * @return {?}
     */
    play() {
        this._command('play');
        this._started = true;
    }
    /**
     * @return {?}
     */
    pause() { this._command('pause'); }
    /**
     * @return {?}
     */
    restart() { this._command('restart'); }
    /**
     * @return {?}
     */
    finish() { this._command('finish'); }
    /**
     * @return {?}
     */
    destroy() { this._command('destroy'); }
    /**
     * @return {?}
     */
    reset() { this._command('reset'); }
    /**
     * @param {?} p
     * @return {?}
     */
    setPosition(p) { this._command('setPosition', p); }
    /**
     * @return {?}
     */
    getPosition() { return 0; }
}
if (false) {
    /** @type {?} */
    RendererAnimationPlayer.prototype.parentPlayer;
    /** @type {?} */
    RendererAnimationPlayer.prototype._started;
    /** @type {?} */
    RendererAnimationPlayer.prototype.totalTime;
    /** @type {?} */
    RendererAnimationPlayer.prototype.id;
    /** @type {?} */
    RendererAnimationPlayer.prototype.element;
    /** @type {?} */
    RendererAnimationPlayer.prototype._renderer;
}
/**
 * @param {?} renderer
 * @param {?} element
 * @param {?} id
 * @param {?} command
 * @param {?} args
 * @return {?}
 */
function issueAnimationCommand(renderer, element, id, command, args) {
    return renderer.setProperty(element, `@@${id}:${command}`, args);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2J1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9wbGF0Zm9ybS1icm93c2VyL2FuaW1hdGlvbnMvc3JjL2FuaW1hdGlvbl9idWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBT0EsT0FBTyxFQUFDLGdCQUFnQixFQUFFLGdCQUFnQixFQUE2RSxRQUFRLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUM1SixPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsRUFBaUIsaUJBQWlCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDckcsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBS25ELE1BQU0sT0FBTyx1QkFBd0IsU0FBUSxnQkFBZ0I7Ozs7O0lBSTNELFlBQVksWUFBOEIsRUFBb0IsR0FBUTtRQUNwRSxLQUFLLEVBQUUsQ0FBQztRQUpGLHFCQUFnQixHQUFHLENBQUMsQ0FBQzs7Y0FLckIsUUFBUSxHQUFHLG1CQUFBO1lBQ2YsRUFBRSxFQUFFLEdBQUc7WUFDUCxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTtZQUNyQyxNQUFNLEVBQUUsRUFBRTtZQUNWLElBQUksRUFBRSxFQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUM7U0FDdEIsRUFBaUI7UUFDbEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxtQkFBQSxZQUFZLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEVBQXFCLENBQUM7SUFDeEYsQ0FBQzs7Ozs7SUFFRCxLQUFLLENBQUMsU0FBZ0Q7O2NBQzlDLEVBQUUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFO1FBQzNDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDOztjQUNsQixLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO1FBQ3hFLHFCQUFxQixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLE9BQU8sSUFBSSx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3pELENBQUM7OztZQXRCRixVQUFVOzs7O1lBTGlCLGdCQUFnQjs0Q0FVRyxNQUFNLFNBQUMsUUFBUTs7OztJQUg1RCxtREFBNkI7O0lBQzdCLDRDQUFxQzs7QUFzQnZDLE1BQU0sT0FBTyx1QkFBd0IsU0FBUSxnQkFBZ0I7Ozs7O0lBQzNELFlBQW9CLEdBQVcsRUFBVSxTQUE0QjtRQUFJLEtBQUssRUFBRSxDQUFDO1FBQTdELFFBQUcsR0FBSCxHQUFHLENBQVE7UUFBVSxjQUFTLEdBQVQsU0FBUyxDQUFtQjtJQUFhLENBQUM7Ozs7OztJQUVuRixNQUFNLENBQUMsT0FBWSxFQUFFLE9BQTBCO1FBQzdDLE9BQU8sSUFBSSx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxPQUFPLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2RixDQUFDO0NBQ0Y7OztJQUxhLHNDQUFtQjs7SUFBRSw0Q0FBb0M7O0FBT3ZFLE1BQU0sT0FBTyx1QkFBdUI7Ozs7Ozs7SUFJbEMsWUFDVyxFQUFVLEVBQVMsT0FBWSxFQUFFLE9BQXlCLEVBQ3pELFNBQTRCO1FBRDdCLE9BQUUsR0FBRixFQUFFLENBQVE7UUFBUyxZQUFPLEdBQVAsT0FBTyxDQUFLO1FBQzlCLGNBQVMsR0FBVCxTQUFTLENBQW1CO1FBTGpDLGlCQUFZLEdBQXlCLElBQUksQ0FBQztRQUN6QyxhQUFRLEdBQUcsS0FBSyxDQUFDO1FBNkNsQixjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBeENuQixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNuQyxDQUFDOzs7Ozs7SUFFTyxPQUFPLENBQUMsU0FBaUIsRUFBRSxRQUE2QjtRQUM5RCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxJQUFJLENBQUMsRUFBRSxJQUFJLFNBQVMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3BGLENBQUM7Ozs7OztJQUVPLFFBQVEsQ0FBQyxPQUFlLEVBQUUsR0FBRyxJQUFXO1FBQzlDLE9BQU8scUJBQXFCLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3JGLENBQUM7Ozs7O0lBRUQsTUFBTSxDQUFDLEVBQWMsSUFBVSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7O0lBRTFELE9BQU8sQ0FBQyxFQUFjLElBQVUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztJQUU1RCxTQUFTLENBQUMsRUFBYyxJQUFVLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7OztJQUVoRSxJQUFJLEtBQVcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7SUFFdkMsVUFBVSxLQUFjLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Ozs7SUFFL0MsSUFBSTtRQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7SUFDdkIsQ0FBQzs7OztJQUVELEtBQUssS0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzs7OztJQUV6QyxPQUFPLEtBQVcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7SUFFN0MsTUFBTSxLQUFXLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7O0lBRTNDLE9BQU8sS0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7OztJQUU3QyxLQUFLLEtBQVcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7O0lBRXpDLFdBQVcsQ0FBQyxDQUFTLElBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7O0lBRWpFLFdBQVcsS0FBYSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FHcEM7OztJQS9DQywrQ0FBaUQ7O0lBQ2pELDJDQUF5Qjs7SUE2Q3pCLDRDQUFxQjs7SUExQ2pCLHFDQUFpQjs7SUFBRSwwQ0FBbUI7O0lBQ3RDLDRDQUFvQzs7Ozs7Ozs7OztBQTRDMUMsU0FBUyxxQkFBcUIsQ0FDMUIsUUFBMkIsRUFBRSxPQUFZLEVBQUUsRUFBVSxFQUFFLE9BQWUsRUFBRSxJQUFXO0lBQ3JGLE9BQU8sUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbkUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QW5pbWF0aW9uQnVpbGRlciwgQW5pbWF0aW9uRmFjdG9yeSwgQW5pbWF0aW9uTWV0YWRhdGEsIEFuaW1hdGlvbk9wdGlvbnMsIEFuaW1hdGlvblBsYXllciwgTm9vcEFuaW1hdGlvblBsYXllciwgc2VxdWVuY2V9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIFJlbmRlcmVyRmFjdG9yeTIsIFJlbmRlcmVyVHlwZTIsIFZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuXG5pbXBvcnQge0FuaW1hdGlvblJlbmRlcmVyfSBmcm9tICcuL2FuaW1hdGlvbl9yZW5kZXJlcic7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBCcm93c2VyQW5pbWF0aW9uQnVpbGRlciBleHRlbmRzIEFuaW1hdGlvbkJ1aWxkZXIge1xuICBwcml2YXRlIF9uZXh0QW5pbWF0aW9uSWQgPSAwO1xuICBwcml2YXRlIF9yZW5kZXJlcjogQW5pbWF0aW9uUmVuZGVyZXI7XG5cbiAgY29uc3RydWN0b3Iocm9vdFJlbmRlcmVyOiBSZW5kZXJlckZhY3RvcnkyLCBASW5qZWN0KERPQ1VNRU5UKSBkb2M6IGFueSkge1xuICAgIHN1cGVyKCk7XG4gICAgY29uc3QgdHlwZURhdGEgPSB7XG4gICAgICBpZDogJzAnLFxuICAgICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgICAgIHN0eWxlczogW10sXG4gICAgICBkYXRhOiB7YW5pbWF0aW9uOiBbXX1cbiAgICB9IGFzIFJlbmRlcmVyVHlwZTI7XG4gICAgdGhpcy5fcmVuZGVyZXIgPSByb290UmVuZGVyZXIuY3JlYXRlUmVuZGVyZXIoZG9jLmJvZHksIHR5cGVEYXRhKSBhcyBBbmltYXRpb25SZW5kZXJlcjtcbiAgfVxuXG4gIGJ1aWxkKGFuaW1hdGlvbjogQW5pbWF0aW9uTWV0YWRhdGF8QW5pbWF0aW9uTWV0YWRhdGFbXSk6IEFuaW1hdGlvbkZhY3Rvcnkge1xuICAgIGNvbnN0IGlkID0gdGhpcy5fbmV4dEFuaW1hdGlvbklkLnRvU3RyaW5nKCk7XG4gICAgdGhpcy5fbmV4dEFuaW1hdGlvbklkKys7XG4gICAgY29uc3QgZW50cnkgPSBBcnJheS5pc0FycmF5KGFuaW1hdGlvbikgPyBzZXF1ZW5jZShhbmltYXRpb24pIDogYW5pbWF0aW9uO1xuICAgIGlzc3VlQW5pbWF0aW9uQ29tbWFuZCh0aGlzLl9yZW5kZXJlciwgbnVsbCwgaWQsICdyZWdpc3RlcicsIFtlbnRyeV0pO1xuICAgIHJldHVybiBuZXcgQnJvd3NlckFuaW1hdGlvbkZhY3RvcnkoaWQsIHRoaXMuX3JlbmRlcmVyKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQnJvd3NlckFuaW1hdGlvbkZhY3RvcnkgZXh0ZW5kcyBBbmltYXRpb25GYWN0b3J5IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfaWQ6IHN0cmluZywgcHJpdmF0ZSBfcmVuZGVyZXI6IEFuaW1hdGlvblJlbmRlcmVyKSB7IHN1cGVyKCk7IH1cblxuICBjcmVhdGUoZWxlbWVudDogYW55LCBvcHRpb25zPzogQW5pbWF0aW9uT3B0aW9ucyk6IEFuaW1hdGlvblBsYXllciB7XG4gICAgcmV0dXJuIG5ldyBSZW5kZXJlckFuaW1hdGlvblBsYXllcih0aGlzLl9pZCwgZWxlbWVudCwgb3B0aW9ucyB8fCB7fSwgdGhpcy5fcmVuZGVyZXIpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZW5kZXJlckFuaW1hdGlvblBsYXllciBpbXBsZW1lbnRzIEFuaW1hdGlvblBsYXllciB7XG4gIHB1YmxpYyBwYXJlbnRQbGF5ZXI6IEFuaW1hdGlvblBsYXllcnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfc3RhcnRlZCA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGlkOiBzdHJpbmcsIHB1YmxpYyBlbGVtZW50OiBhbnksIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMsXG4gICAgICBwcml2YXRlIF9yZW5kZXJlcjogQW5pbWF0aW9uUmVuZGVyZXIpIHtcbiAgICB0aGlzLl9jb21tYW5kKCdjcmVhdGUnLCBvcHRpb25zKTtcbiAgfVxuXG4gIHByaXZhdGUgX2xpc3RlbihldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2s6IChldmVudDogYW55KSA9PiBhbnkpOiAoKSA9PiB2b2lkIHtcbiAgICByZXR1cm4gdGhpcy5fcmVuZGVyZXIubGlzdGVuKHRoaXMuZWxlbWVudCwgYEBAJHt0aGlzLmlkfToke2V2ZW50TmFtZX1gLCBjYWxsYmFjayk7XG4gIH1cblxuICBwcml2YXRlIF9jb21tYW5kKGNvbW1hbmQ6IHN0cmluZywgLi4uYXJnczogYW55W10pIHtcbiAgICByZXR1cm4gaXNzdWVBbmltYXRpb25Db21tYW5kKHRoaXMuX3JlbmRlcmVyLCB0aGlzLmVsZW1lbnQsIHRoaXMuaWQsIGNvbW1hbmQsIGFyZ3MpO1xuICB9XG5cbiAgb25Eb25lKGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX2xpc3RlbignZG9uZScsIGZuKTsgfVxuXG4gIG9uU3RhcnQoZm46ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fbGlzdGVuKCdzdGFydCcsIGZuKTsgfVxuXG4gIG9uRGVzdHJveShmbjogKCkgPT4gdm9pZCk6IHZvaWQgeyB0aGlzLl9saXN0ZW4oJ2Rlc3Ryb3knLCBmbik7IH1cblxuICBpbml0KCk6IHZvaWQgeyB0aGlzLl9jb21tYW5kKCdpbml0Jyk7IH1cblxuICBoYXNTdGFydGVkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fc3RhcnRlZDsgfVxuXG4gIHBsYXkoKTogdm9pZCB7XG4gICAgdGhpcy5fY29tbWFuZCgncGxheScpO1xuICAgIHRoaXMuX3N0YXJ0ZWQgPSB0cnVlO1xuICB9XG5cbiAgcGF1c2UoKTogdm9pZCB7IHRoaXMuX2NvbW1hbmQoJ3BhdXNlJyk7IH1cblxuICByZXN0YXJ0KCk6IHZvaWQgeyB0aGlzLl9jb21tYW5kKCdyZXN0YXJ0Jyk7IH1cblxuICBmaW5pc2goKTogdm9pZCB7IHRoaXMuX2NvbW1hbmQoJ2ZpbmlzaCcpOyB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHsgdGhpcy5fY29tbWFuZCgnZGVzdHJveScpOyB9XG5cbiAgcmVzZXQoKTogdm9pZCB7IHRoaXMuX2NvbW1hbmQoJ3Jlc2V0Jyk7IH1cblxuICBzZXRQb3NpdGlvbihwOiBudW1iZXIpOiB2b2lkIHsgdGhpcy5fY29tbWFuZCgnc2V0UG9zaXRpb24nLCBwKTsgfVxuXG4gIGdldFBvc2l0aW9uKCk6IG51bWJlciB7IHJldHVybiAwOyB9XG5cbiAgcHVibGljIHRvdGFsVGltZSA9IDA7XG59XG5cbmZ1bmN0aW9uIGlzc3VlQW5pbWF0aW9uQ29tbWFuZChcbiAgICByZW5kZXJlcjogQW5pbWF0aW9uUmVuZGVyZXIsIGVsZW1lbnQ6IGFueSwgaWQ6IHN0cmluZywgY29tbWFuZDogc3RyaW5nLCBhcmdzOiBhbnlbXSk6IGFueSB7XG4gIHJldHVybiByZW5kZXJlci5zZXRQcm9wZXJ0eShlbGVtZW50LCBgQEAke2lkfToke2NvbW1hbmR9YCwgYXJncyk7XG59XG4iXX0=