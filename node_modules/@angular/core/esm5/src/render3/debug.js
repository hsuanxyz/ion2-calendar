/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { DebugRendererFactory2 } from '../view/services';
import { getComponent, getInjector, getLocalRefs, loadContext } from './discovery_utils';
import { TVIEW } from './interfaces/view';
/**
 * Adapts the DebugRendererFactory2 to create a DebugRenderer2 specific for IVY.
 *
 * The created DebugRenderer know how to create a Debug Context specific to IVY.
 */
var Render3DebugRendererFactory2 = /** @class */ (function (_super) {
    tslib_1.__extends(Render3DebugRendererFactory2, _super);
    function Render3DebugRendererFactory2() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Render3DebugRendererFactory2.prototype.createRenderer = function (element, renderData) {
        var renderer = _super.prototype.createRenderer.call(this, element, renderData);
        renderer.debugContextFactory = function (nativeElement) { return new Render3DebugContext(nativeElement); };
        return renderer;
    };
    return Render3DebugRendererFactory2;
}(DebugRendererFactory2));
export { Render3DebugRendererFactory2 };
/**
 * Stores context information about view nodes.
 *
 * Used in tests to retrieve information those nodes.
 */
var Render3DebugContext = /** @class */ (function () {
    function Render3DebugContext(_nativeNode) {
        this._nativeNode = _nativeNode;
    }
    Object.defineProperty(Render3DebugContext.prototype, "nodeIndex", {
        get: function () { return loadContext(this._nativeNode).nodeIndex; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render3DebugContext.prototype, "view", {
        get: function () { return loadContext(this._nativeNode).lViewData; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render3DebugContext.prototype, "injector", {
        get: function () { return getInjector(this._nativeNode); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render3DebugContext.prototype, "component", {
        get: function () { return getComponent(this._nativeNode); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render3DebugContext.prototype, "providerTokens", {
        get: function () {
            var lDebugCtx = loadContext(this._nativeNode);
            var lViewData = lDebugCtx.lViewData;
            var tNode = lViewData[TVIEW].data[lDebugCtx.nodeIndex];
            var directivesCount = tNode.flags & 4095 /* DirectiveCountMask */;
            if (directivesCount > 0) {
                var directiveIdxStart = tNode.flags >> 16 /* DirectiveStartingIndexShift */;
                var directiveIdxEnd = directiveIdxStart + directivesCount;
                var viewDirectiveDefs = this.view[TVIEW].data;
                var directiveDefs = viewDirectiveDefs.slice(directiveIdxStart, directiveIdxEnd);
                return directiveDefs.map(function (directiveDef) { return directiveDef.type; });
            }
            return [];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render3DebugContext.prototype, "references", {
        get: function () { return getLocalRefs(this._nativeNode); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render3DebugContext.prototype, "context", {
        // TODO(pk): check previous implementation and re-implement
        get: function () { throw new Error('Not implemented in ivy'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render3DebugContext.prototype, "componentRenderElement", {
        // TODO(pk): check previous implementation and re-implement
        get: function () { throw new Error('Not implemented in ivy'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render3DebugContext.prototype, "renderNode", {
        // TODO(pk): check previous implementation and re-implement
        get: function () { throw new Error('Not implemented in ivy'); },
        enumerable: true,
        configurable: true
    });
    // TODO(pk): check previous implementation and re-implement
    Render3DebugContext.prototype.logError = function (console) {
        var values = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
        }
        console.error.apply(console, tslib_1.__spread(values));
    };
    return Render3DebugContext;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWcuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2RlYnVnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFLSCxPQUFPLEVBQWlCLHFCQUFxQixFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFFdkUsT0FBTyxFQUFDLFlBQVksRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBR3ZGLE9BQU8sRUFBQyxLQUFLLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUd4Qzs7OztHQUlHO0FBQ0g7SUFBa0Qsd0RBQXFCO0lBQXZFOztJQU1BLENBQUM7SUFMQyxxREFBYyxHQUFkLFVBQWUsT0FBWSxFQUFFLFVBQThCO1FBQ3pELElBQU0sUUFBUSxHQUFHLGlCQUFNLGNBQWMsWUFBQyxPQUFPLEVBQUUsVUFBVSxDQUFtQixDQUFDO1FBQzdFLFFBQVEsQ0FBQyxtQkFBbUIsR0FBRyxVQUFDLGFBQWtCLElBQUssT0FBQSxJQUFJLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxFQUF0QyxDQUFzQyxDQUFDO1FBQzlGLE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7SUFDSCxtQ0FBQztBQUFELENBQUMsQUFORCxDQUFrRCxxQkFBcUIsR0FNdEU7O0FBRUQ7Ozs7R0FJRztBQUNIO0lBQ0UsNkJBQW9CLFdBQWdCO1FBQWhCLGdCQUFXLEdBQVgsV0FBVyxDQUFLO0lBQUcsQ0FBQztJQUV4QyxzQkFBSSwwQ0FBUzthQUFiLGNBQStCLE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUVoRixzQkFBSSxxQ0FBSTthQUFSLGNBQWtCLE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUVuRSxzQkFBSSx5Q0FBUTthQUFaLGNBQTJCLE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBRWxFLHNCQUFJLDBDQUFTO2FBQWIsY0FBdUIsT0FBTyxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFFL0Qsc0JBQUksK0NBQWM7YUFBbEI7WUFDRSxJQUFNLFNBQVMsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ2hELElBQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7WUFDdEMsSUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFVLENBQUM7WUFDbEUsSUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLEtBQUssZ0NBQWdDLENBQUM7WUFFcEUsSUFBSSxlQUFlLEdBQUcsQ0FBQyxFQUFFO2dCQUN2QixJQUFNLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxLQUFLLHdDQUEwQyxDQUFDO2dCQUNoRixJQUFNLGVBQWUsR0FBRyxpQkFBaUIsR0FBRyxlQUFlLENBQUM7Z0JBQzVELElBQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ2hELElBQU0sYUFBYSxHQUNmLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxlQUFlLENBQXdCLENBQUM7Z0JBRXZGLE9BQU8sYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFBLFlBQVksSUFBSSxPQUFBLFlBQVksQ0FBQyxJQUFJLEVBQWpCLENBQWlCLENBQUMsQ0FBQzthQUM3RDtZQUVELE9BQU8sRUFBRSxDQUFDO1FBQ1osQ0FBQzs7O09BQUE7SUFFRCxzQkFBSSwyQ0FBVTthQUFkLGNBQXlDLE9BQU8sWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBR2pGLHNCQUFJLHdDQUFPO1FBRFgsMkRBQTJEO2FBQzNELGNBQXFCLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBR2pFLHNCQUFJLHVEQUFzQjtRQUQxQiwyREFBMkQ7YUFDM0QsY0FBb0MsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFHaEYsc0JBQUksMkNBQVU7UUFEZCwyREFBMkQ7YUFDM0QsY0FBd0IsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFFcEUsMkRBQTJEO0lBQzNELHNDQUFRLEdBQVIsVUFBUyxPQUFnQjtRQUFFLGdCQUFnQjthQUFoQixVQUFnQixFQUFoQixxQkFBZ0IsRUFBaEIsSUFBZ0I7WUFBaEIsK0JBQWdCOztRQUFVLE9BQU8sQ0FBQyxLQUFLLE9BQWIsT0FBTyxtQkFBVSxNQUFNLEdBQUU7SUFBQyxDQUFDO0lBQ2xGLDBCQUFDO0FBQUQsQ0FBQyxBQTNDRCxJQTJDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnLi4vZGkvaW5qZWN0b3InO1xuaW1wb3J0IHtSZW5kZXJlcjIsIFJlbmRlcmVyVHlwZTJ9IGZyb20gJy4uL3JlbmRlci9hcGknO1xuaW1wb3J0IHtEZWJ1Z0NvbnRleHR9IGZyb20gJy4uL3ZpZXcnO1xuaW1wb3J0IHtEZWJ1Z1JlbmRlcmVyMiwgRGVidWdSZW5kZXJlckZhY3RvcnkyfSBmcm9tICcuLi92aWV3L3NlcnZpY2VzJztcblxuaW1wb3J0IHtnZXRDb21wb25lbnQsIGdldEluamVjdG9yLCBnZXRMb2NhbFJlZnMsIGxvYWRDb250ZXh0fSBmcm9tICcuL2Rpc2NvdmVyeV91dGlscyc7XG5pbXBvcnQge0RpcmVjdGl2ZURlZn0gZnJvbSAnLi9pbnRlcmZhY2VzL2RlZmluaXRpb24nO1xuaW1wb3J0IHtUTm9kZSwgVE5vZGVGbGFnc30gZnJvbSAnLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtUVklFV30gZnJvbSAnLi9pbnRlcmZhY2VzL3ZpZXcnO1xuXG5cbi8qKlxuICogQWRhcHRzIHRoZSBEZWJ1Z1JlbmRlcmVyRmFjdG9yeTIgdG8gY3JlYXRlIGEgRGVidWdSZW5kZXJlcjIgc3BlY2lmaWMgZm9yIElWWS5cbiAqXG4gKiBUaGUgY3JlYXRlZCBEZWJ1Z1JlbmRlcmVyIGtub3cgaG93IHRvIGNyZWF0ZSBhIERlYnVnIENvbnRleHQgc3BlY2lmaWMgdG8gSVZZLlxuICovXG5leHBvcnQgY2xhc3MgUmVuZGVyM0RlYnVnUmVuZGVyZXJGYWN0b3J5MiBleHRlbmRzIERlYnVnUmVuZGVyZXJGYWN0b3J5MiB7XG4gIGNyZWF0ZVJlbmRlcmVyKGVsZW1lbnQ6IGFueSwgcmVuZGVyRGF0YTogUmVuZGVyZXJUeXBlMnxudWxsKTogUmVuZGVyZXIyIHtcbiAgICBjb25zdCByZW5kZXJlciA9IHN1cGVyLmNyZWF0ZVJlbmRlcmVyKGVsZW1lbnQsIHJlbmRlckRhdGEpIGFzIERlYnVnUmVuZGVyZXIyO1xuICAgIHJlbmRlcmVyLmRlYnVnQ29udGV4dEZhY3RvcnkgPSAobmF0aXZlRWxlbWVudDogYW55KSA9PiBuZXcgUmVuZGVyM0RlYnVnQ29udGV4dChuYXRpdmVFbGVtZW50KTtcbiAgICByZXR1cm4gcmVuZGVyZXI7XG4gIH1cbn1cblxuLyoqXG4gKiBTdG9yZXMgY29udGV4dCBpbmZvcm1hdGlvbiBhYm91dCB2aWV3IG5vZGVzLlxuICpcbiAqIFVzZWQgaW4gdGVzdHMgdG8gcmV0cmlldmUgaW5mb3JtYXRpb24gdGhvc2Ugbm9kZXMuXG4gKi9cbmNsYXNzIFJlbmRlcjNEZWJ1Z0NvbnRleHQgaW1wbGVtZW50cyBEZWJ1Z0NvbnRleHQge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9uYXRpdmVOb2RlOiBhbnkpIHt9XG5cbiAgZ2V0IG5vZGVJbmRleCgpOiBudW1iZXJ8bnVsbCB7IHJldHVybiBsb2FkQ29udGV4dCh0aGlzLl9uYXRpdmVOb2RlKS5ub2RlSW5kZXg7IH1cblxuICBnZXQgdmlldygpOiBhbnkgeyByZXR1cm4gbG9hZENvbnRleHQodGhpcy5fbmF0aXZlTm9kZSkubFZpZXdEYXRhOyB9XG5cbiAgZ2V0IGluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIGdldEluamVjdG9yKHRoaXMuX25hdGl2ZU5vZGUpOyB9XG5cbiAgZ2V0IGNvbXBvbmVudCgpOiBhbnkgeyByZXR1cm4gZ2V0Q29tcG9uZW50KHRoaXMuX25hdGl2ZU5vZGUpOyB9XG5cbiAgZ2V0IHByb3ZpZGVyVG9rZW5zKCk6IGFueVtdIHtcbiAgICBjb25zdCBsRGVidWdDdHggPSBsb2FkQ29udGV4dCh0aGlzLl9uYXRpdmVOb2RlKTtcbiAgICBjb25zdCBsVmlld0RhdGEgPSBsRGVidWdDdHgubFZpZXdEYXRhO1xuICAgIGNvbnN0IHROb2RlID0gbFZpZXdEYXRhW1RWSUVXXS5kYXRhW2xEZWJ1Z0N0eC5ub2RlSW5kZXhdIGFzIFROb2RlO1xuICAgIGNvbnN0IGRpcmVjdGl2ZXNDb3VudCA9IHROb2RlLmZsYWdzICYgVE5vZGVGbGFncy5EaXJlY3RpdmVDb3VudE1hc2s7XG5cbiAgICBpZiAoZGlyZWN0aXZlc0NvdW50ID4gMCkge1xuICAgICAgY29uc3QgZGlyZWN0aXZlSWR4U3RhcnQgPSB0Tm9kZS5mbGFncyA+PiBUTm9kZUZsYWdzLkRpcmVjdGl2ZVN0YXJ0aW5nSW5kZXhTaGlmdDtcbiAgICAgIGNvbnN0IGRpcmVjdGl2ZUlkeEVuZCA9IGRpcmVjdGl2ZUlkeFN0YXJ0ICsgZGlyZWN0aXZlc0NvdW50O1xuICAgICAgY29uc3Qgdmlld0RpcmVjdGl2ZURlZnMgPSB0aGlzLnZpZXdbVFZJRVddLmRhdGE7XG4gICAgICBjb25zdCBkaXJlY3RpdmVEZWZzID1cbiAgICAgICAgICB2aWV3RGlyZWN0aXZlRGVmcy5zbGljZShkaXJlY3RpdmVJZHhTdGFydCwgZGlyZWN0aXZlSWR4RW5kKSBhcyBEaXJlY3RpdmVEZWY8YW55PltdO1xuXG4gICAgICByZXR1cm4gZGlyZWN0aXZlRGVmcy5tYXAoZGlyZWN0aXZlRGVmID0+IGRpcmVjdGl2ZURlZi50eXBlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gW107XG4gIH1cblxuICBnZXQgcmVmZXJlbmNlcygpOiB7W2tleTogc3RyaW5nXTogYW55fSB7IHJldHVybiBnZXRMb2NhbFJlZnModGhpcy5fbmF0aXZlTm9kZSk7IH1cblxuICAvLyBUT0RPKHBrKTogY2hlY2sgcHJldmlvdXMgaW1wbGVtZW50YXRpb24gYW5kIHJlLWltcGxlbWVudFxuICBnZXQgY29udGV4dCgpOiBhbnkgeyB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCBpbiBpdnknKTsgfVxuXG4gIC8vIFRPRE8ocGspOiBjaGVjayBwcmV2aW91cyBpbXBsZW1lbnRhdGlvbiBhbmQgcmUtaW1wbGVtZW50XG4gIGdldCBjb21wb25lbnRSZW5kZXJFbGVtZW50KCk6IGFueSB7IHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkIGluIGl2eScpOyB9XG5cbiAgLy8gVE9ETyhwayk6IGNoZWNrIHByZXZpb3VzIGltcGxlbWVudGF0aW9uIGFuZCByZS1pbXBsZW1lbnRcbiAgZ2V0IHJlbmRlck5vZGUoKTogYW55IHsgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQgaW4gaXZ5Jyk7IH1cblxuICAvLyBUT0RPKHBrKTogY2hlY2sgcHJldmlvdXMgaW1wbGVtZW50YXRpb24gYW5kIHJlLWltcGxlbWVudFxuICBsb2dFcnJvcihjb25zb2xlOiBDb25zb2xlLCAuLi52YWx1ZXM6IGFueVtdKTogdm9pZCB7IGNvbnNvbGUuZXJyb3IoLi4udmFsdWVzKTsgfVxufVxuIl19