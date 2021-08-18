/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/render3/view/i18n/context", ["require", "exports", "tslib", "@angular/compiler/src/render3/view/i18n/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var util_1 = require("@angular/compiler/src/render3/view/i18n/util");
    var TagType;
    (function (TagType) {
        TagType[TagType["ELEMENT"] = 0] = "ELEMENT";
        TagType[TagType["TEMPLATE"] = 1] = "TEMPLATE";
    })(TagType || (TagType = {}));
    /**
     * Generates an object that is used as a shared state between parent and all child contexts.
     */
    function setupRegistry() {
        return { getUniqueId: util_1.getSeqNumberGenerator(), icus: new Map() };
    }
    /**
     * I18nContext is a helper class which keeps track of all i18n-related aspects
     * (accumulates placeholders, bindings, etc) between i18nStart and i18nEnd instructions.
     *
     * When we enter a nested template, the top-level context is being passed down
     * to the nested component, which uses this context to generate a child instance
     * of I18nContext class (to handle nested template) and at the end, reconciles it back
     * with the parent context.
     *
     * @param index Instruction index of i18nStart, which initiates this context
     * @param ref Reference to a translation const that represents the content if thus context
     * @param level Nestng level defined for child contexts
     * @param templateIndex Instruction index of a template which this context belongs to
     * @param meta Meta information (id, meaning, description, etc) associated with this context
     */
    var I18nContext = /** @class */ (function () {
        function I18nContext(index, ref, level, templateIndex, meta, registry) {
            if (level === void 0) { level = 0; }
            if (templateIndex === void 0) { templateIndex = null; }
            this.index = index;
            this.ref = ref;
            this.level = level;
            this.templateIndex = templateIndex;
            this.meta = meta;
            this.registry = registry;
            this.bindings = new Set();
            this.placeholders = new Map();
            this._unresolvedCtxCount = 0;
            this._registry = registry || setupRegistry();
            this.id = this._registry.getUniqueId();
        }
        I18nContext.prototype.appendTag = function (type, node, index, closed) {
            if (node.isVoid && closed) {
                return; // ignore "close" for void tags
            }
            var ph = node.isVoid || !closed ? node.startName : node.closeName;
            var content = { type: type, index: index, ctx: this.id, isVoid: node.isVoid, closed: closed };
            util_1.updatePlaceholderMap(this.placeholders, ph, content);
        };
        Object.defineProperty(I18nContext.prototype, "icus", {
            get: function () { return this._registry.icus; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(I18nContext.prototype, "isRoot", {
            get: function () { return this.level === 0; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(I18nContext.prototype, "isResolved", {
            get: function () { return this._unresolvedCtxCount === 0; },
            enumerable: true,
            configurable: true
        });
        I18nContext.prototype.getSerializedPlaceholders = function () {
            var result = new Map();
            this.placeholders.forEach(function (values, key) { return result.set(key, values.map(serializePlaceholderValue)); });
            return result;
        };
        // public API to accumulate i18n-related content
        I18nContext.prototype.appendBinding = function (binding) { this.bindings.add(binding); };
        I18nContext.prototype.appendIcu = function (name, ref) {
            util_1.updatePlaceholderMap(this._registry.icus, name, ref);
        };
        I18nContext.prototype.appendBoundText = function (node) {
            var _this = this;
            var phs = util_1.assembleBoundTextPlaceholders(node, this.bindings.size, this.id);
            phs.forEach(function (values, key) { return util_1.updatePlaceholderMap.apply(void 0, tslib_1.__spread([_this.placeholders, key], values)); });
        };
        I18nContext.prototype.appendTemplate = function (node, index) {
            // add open and close tags at the same time,
            // since we process nested templates separately
            this.appendTag(TagType.TEMPLATE, node, index, false);
            this.appendTag(TagType.TEMPLATE, node, index, true);
            this._unresolvedCtxCount++;
        };
        I18nContext.prototype.appendElement = function (node, index, closed) {
            this.appendTag(TagType.ELEMENT, node, index, closed);
        };
        /**
         * Generates an instance of a child context based on the root one,
         * when we enter a nested template within I18n section.
         *
         * @param index Instruction index of corresponding i18nStart, which initiates this context
         * @param templateIndex Instruction index of a template which this context belongs to
         * @param meta Meta information (id, meaning, description, etc) associated with this context
         *
         * @returns I18nContext instance
         */
        I18nContext.prototype.forkChildContext = function (index, templateIndex, meta) {
            return new I18nContext(index, this.ref, this.level + 1, templateIndex, meta, this._registry);
        };
        /**
         * Reconciles child context into parent one once the end of the i18n block is reached (i18nEnd).
         *
         * @param context Child I18nContext instance to be reconciled with parent context.
         */
        I18nContext.prototype.reconcileChildContext = function (context) {
            var _this = this;
            // set the right context id for open and close
            // template tags, so we can use it as sub-block ids
            ['start', 'close'].forEach(function (op) {
                var key = context.meta[op + "Name"];
                var phs = _this.placeholders.get(key) || [];
                var tag = phs.find(findTemplateFn(_this.id, context.templateIndex));
                if (tag) {
                    tag.ctx = context.id;
                }
            });
            // reconcile placeholders
            var childPhs = context.placeholders;
            childPhs.forEach(function (values, key) {
                var phs = _this.placeholders.get(key);
                if (!phs) {
                    _this.placeholders.set(key, values);
                    return;
                }
                // try to find matching template...
                var tmplIdx = util_1.findIndex(phs, findTemplateFn(context.id, context.templateIndex));
                if (tmplIdx >= 0) {
                    // ... if found - replace it with nested template content
                    var isCloseTag = key.startsWith('CLOSE');
                    var isTemplateTag = key.endsWith('NG-TEMPLATE');
                    if (isTemplateTag) {
                        // current template's content is placed before or after
                        // parent template tag, depending on the open/close atrribute
                        phs.splice.apply(phs, tslib_1.__spread([tmplIdx + (isCloseTag ? 0 : 1), 0], values));
                    }
                    else {
                        var idx = isCloseTag ? values.length - 1 : 0;
                        values[idx].tmpl = phs[tmplIdx];
                        phs.splice.apply(phs, tslib_1.__spread([tmplIdx, 1], values));
                    }
                }
                else {
                    // ... otherwise just append content to placeholder value
                    phs.push.apply(phs, tslib_1.__spread(values));
                }
                _this.placeholders.set(key, phs);
            });
            this._unresolvedCtxCount--;
        };
        return I18nContext;
    }());
    exports.I18nContext = I18nContext;
    //
    // Helper methods
    //
    function wrap(symbol, index, contextId, closed) {
        var state = closed ? '/' : '';
        return util_1.wrapI18nPlaceholder("" + state + symbol + index, contextId);
    }
    function wrapTag(symbol, _a, closed) {
        var index = _a.index, ctx = _a.ctx, isVoid = _a.isVoid;
        return isVoid ? wrap(symbol, index, ctx) + wrap(symbol, index, ctx, true) :
            wrap(symbol, index, ctx, closed);
    }
    function findTemplateFn(ctx, templateIndex) {
        return function (token) { return typeof token === 'object' && token.type === TagType.TEMPLATE &&
            token.index === templateIndex && token.ctx === ctx; };
    }
    function serializePlaceholderValue(value) {
        var element = function (data, closed) { return wrapTag('#', data, closed); };
        var template = function (data, closed) { return wrapTag('*', data, closed); };
        switch (value.type) {
            case TagType.ELEMENT:
                // close element tag
                if (value.closed) {
                    return element(value, true) + (value.tmpl ? template(value.tmpl, true) : '');
                }
                // open element tag that also initiates a template
                if (value.tmpl) {
                    return template(value.tmpl) + element(value) +
                        (value.isVoid ? template(value.tmpl, true) : '');
                }
                return element(value);
            case TagType.TEMPLATE:
                return template(value, value.closed);
            default:
                return value;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2NvbXBpbGVyL3NyYy9yZW5kZXIzL3ZpZXcvaTE4bi9jb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUtILHFFQUFrSTtJQUVsSSxJQUFLLE9BR0o7SUFIRCxXQUFLLE9BQU87UUFDViwyQ0FBTyxDQUFBO1FBQ1AsNkNBQVEsQ0FBQTtJQUNWLENBQUMsRUFISSxPQUFPLEtBQVAsT0FBTyxRQUdYO0lBRUQ7O09BRUc7SUFDSCxTQUFTLGFBQWE7UUFDcEIsT0FBTyxFQUFDLFdBQVcsRUFBRSw0QkFBcUIsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEdBQUcsRUFBaUIsRUFBQyxDQUFDO0lBQ2hGLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7T0FjRztJQUNIO1FBUUUscUJBQ2EsS0FBYSxFQUFXLEdBQWtCLEVBQVcsS0FBaUIsRUFDdEUsYUFBaUMsRUFBVyxJQUFjLEVBQVUsUUFBYztZQUQ3QixzQkFBQSxFQUFBLFNBQWlCO1lBQ3RFLDhCQUFBLEVBQUEsb0JBQWlDO1lBRGpDLFVBQUssR0FBTCxLQUFLLENBQVE7WUFBVyxRQUFHLEdBQUgsR0FBRyxDQUFlO1lBQVcsVUFBSyxHQUFMLEtBQUssQ0FBWTtZQUN0RSxrQkFBYSxHQUFiLGFBQWEsQ0FBb0I7WUFBVyxTQUFJLEdBQUosSUFBSSxDQUFVO1lBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBTTtZQVJ4RixhQUFRLEdBQUcsSUFBSSxHQUFHLEVBQWdCLENBQUM7WUFDbkMsaUJBQVksR0FBRyxJQUFJLEdBQUcsRUFBaUIsQ0FBQztZQUd2Qyx3QkFBbUIsR0FBVyxDQUFDLENBQUM7WUFLdEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLElBQUksYUFBYSxFQUFFLENBQUM7WUFDN0MsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcs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T0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBpMThuIGZyb20gJy4uLy4uLy4uL2kxOG4vaTE4bl9hc3QnO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5cbmltcG9ydCB7YXNzZW1ibGVCb3VuZFRleHRQbGFjZWhvbGRlcnMsIGZpbmRJbmRleCwgZ2V0U2VxTnVtYmVyR2VuZXJhdG9yLCB1cGRhdGVQbGFjZWhvbGRlck1hcCwgd3JhcEkxOG5QbGFjZWhvbGRlcn0gZnJvbSAnLi91dGlsJztcblxuZW51bSBUYWdUeXBlIHtcbiAgRUxFTUVOVCxcbiAgVEVNUExBVEVcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYW4gb2JqZWN0IHRoYXQgaXMgdXNlZCBhcyBhIHNoYXJlZCBzdGF0ZSBiZXR3ZWVuIHBhcmVudCBhbmQgYWxsIGNoaWxkIGNvbnRleHRzLlxuICovXG5mdW5jdGlvbiBzZXR1cFJlZ2lzdHJ5KCkge1xuICByZXR1cm4ge2dldFVuaXF1ZUlkOiBnZXRTZXFOdW1iZXJHZW5lcmF0b3IoKSwgaWN1czogbmV3IE1hcDxzdHJpbmcsIGFueVtdPigpfTtcbn1cblxuLyoqXG4gKiBJMThuQ29udGV4dCBpcyBhIGhlbHBlciBjbGFzcyB3aGljaCBrZWVwcyB0cmFjayBvZiBhbGwgaTE4bi1yZWxhdGVkIGFzcGVjdHNcbiAqIChhY2N1bXVsYXRlcyBwbGFjZWhvbGRlcnMsIGJpbmRpbmdzLCBldGMpIGJldHdlZW4gaTE4blN0YXJ0IGFuZCBpMThuRW5kIGluc3RydWN0aW9ucy5cbiAqXG4gKiBXaGVuIHdlIGVudGVyIGEgbmVzdGVkIHRlbXBsYXRlLCB0aGUgdG9wLWxldmVsIGNvbnRleHQgaXMgYmVpbmcgcGFzc2VkIGRvd25cbiAqIHRvIHRoZSBuZXN0ZWQgY29tcG9uZW50LCB3aGljaCB1c2VzIHRoaXMgY29udGV4dCB0byBnZW5lcmF0ZSBhIGNoaWxkIGluc3RhbmNlXG4gKiBvZiBJMThuQ29udGV4dCBjbGFzcyAodG8gaGFuZGxlIG5lc3RlZCB0ZW1wbGF0ZSkgYW5kIGF0IHRoZSBlbmQsIHJlY29uY2lsZXMgaXQgYmFja1xuICogd2l0aCB0aGUgcGFyZW50IGNvbnRleHQuXG4gKlxuICogQHBhcmFtIGluZGV4IEluc3RydWN0aW9uIGluZGV4IG9mIGkxOG5TdGFydCwgd2hpY2ggaW5pdGlhdGVzIHRoaXMgY29udGV4dFxuICogQHBhcmFtIHJlZiBSZWZlcmVuY2UgdG8gYSB0cmFuc2xhdGlvbiBjb25zdCB0aGF0IHJlcHJlc2VudHMgdGhlIGNvbnRlbnQgaWYgdGh1cyBjb250ZXh0XG4gKiBAcGFyYW0gbGV2ZWwgTmVzdG5nIGxldmVsIGRlZmluZWQgZm9yIGNoaWxkIGNvbnRleHRzXG4gKiBAcGFyYW0gdGVtcGxhdGVJbmRleCBJbnN0cnVjdGlvbiBpbmRleCBvZiBhIHRlbXBsYXRlIHdoaWNoIHRoaXMgY29udGV4dCBiZWxvbmdzIHRvXG4gKiBAcGFyYW0gbWV0YSBNZXRhIGluZm9ybWF0aW9uIChpZCwgbWVhbmluZywgZGVzY3JpcHRpb24sIGV0YykgYXNzb2NpYXRlZCB3aXRoIHRoaXMgY29udGV4dFxuICovXG5leHBvcnQgY2xhc3MgSTE4bkNvbnRleHQge1xuICBwdWJsaWMgcmVhZG9ubHkgaWQ6IG51bWJlcjtcbiAgcHVibGljIGJpbmRpbmdzID0gbmV3IFNldDxvLkV4cHJlc3Npb24+KCk7XG4gIHB1YmxpYyBwbGFjZWhvbGRlcnMgPSBuZXcgTWFwPHN0cmluZywgYW55W10+KCk7XG5cbiAgcHJpdmF0ZSBfcmVnaXN0cnkgITogYW55O1xuICBwcml2YXRlIF91bnJlc29sdmVkQ3R4Q291bnQ6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICByZWFkb25seSBpbmRleDogbnVtYmVyLCByZWFkb25seSByZWY6IG8uUmVhZFZhckV4cHIsIHJlYWRvbmx5IGxldmVsOiBudW1iZXIgPSAwLFxuICAgICAgcmVhZG9ubHkgdGVtcGxhdGVJbmRleDogbnVtYmVyfG51bGwgPSBudWxsLCByZWFkb25seSBtZXRhOiBpMThuLkFTVCwgcHJpdmF0ZSByZWdpc3RyeT86IGFueSkge1xuICAgIHRoaXMuX3JlZ2lzdHJ5ID0gcmVnaXN0cnkgfHwgc2V0dXBSZWdpc3RyeSgpO1xuICAgIHRoaXMuaWQgPSB0aGlzLl9yZWdpc3RyeS5nZXRVbmlxdWVJZCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBhcHBlbmRUYWcodHlwZTogVGFnVHlwZSwgbm9kZTogaTE4bi5UYWdQbGFjZWhvbGRlciwgaW5kZXg6IG51bWJlciwgY2xvc2VkPzogYm9vbGVhbikge1xuICAgIGlmIChub2RlLmlzVm9pZCAmJiBjbG9zZWQpIHtcbiAgICAgIHJldHVybjsgIC8vIGlnbm9yZSBcImNsb3NlXCIgZm9yIHZvaWQgdGFnc1xuICAgIH1cbiAgICBjb25zdCBwaCA9IG5vZGUuaXNWb2lkIHx8ICFjbG9zZWQgPyBub2RlLnN0YXJ0TmFtZSA6IG5vZGUuY2xvc2VOYW1lO1xuICAgIGNvbnN0IGNvbnRlbnQgPSB7dHlwZSwgaW5kZXgsIGN0eDogdGhpcy5pZCwgaXNWb2lkOiBub2RlLmlzVm9pZCwgY2xvc2VkfTtcbiAgICB1cGRhdGVQbGFjZWhvbGRlck1hcCh0aGlzLnBsYWNlaG9sZGVycywgcGgsIGNvbnRlbnQpO1xuICB9XG5cbiAgZ2V0IGljdXMoKSB7IHJldHVybiB0aGlzLl9yZWdpc3RyeS5pY3VzOyB9XG4gIGdldCBpc1Jvb3QoKSB7IHJldHVybiB0aGlzLmxldmVsID09PSAwOyB9XG4gIGdldCBpc1Jlc29sdmVkKCkgeyByZXR1cm4gdGhpcy5fdW5yZXNvbHZlZEN0eENvdW50ID09PSAwOyB9XG5cbiAgZ2V0U2VyaWFsaXplZFBsYWNlaG9sZGVycygpIHtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgTWFwPHN0cmluZywgYW55W10+KCk7XG4gICAgdGhpcy5wbGFjZWhvbGRlcnMuZm9yRWFjaChcbiAgICAgICAgKHZhbHVlcywga2V5KSA9PiByZXN1bHQuc2V0KGtleSwgdmFsdWVzLm1hcChzZXJpYWxpemVQbGFjZWhvbGRlclZhbHVlKSkpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvLyBwdWJsaWMgQVBJIHRvIGFjY3VtdWxhdGUgaTE4bi1yZWxhdGVkIGNvbnRlbnRcbiAgYXBwZW5kQmluZGluZyhiaW5kaW5nOiBvLkV4cHJlc3Npb24pIHsgdGhpcy5iaW5kaW5ncy5hZGQoYmluZGluZyk7IH1cbiAgYXBwZW5kSWN1KG5hbWU6IHN0cmluZywgcmVmOiBvLkV4cHJlc3Npb24pIHtcbiAgICB1cGRhdGVQbGFjZWhvbGRlck1hcCh0aGlzLl9yZWdpc3RyeS5pY3VzLCBuYW1lLCByZWYpO1xuICB9XG4gIGFwcGVuZEJvdW5kVGV4dChub2RlOiBpMThuLkFTVCkge1xuICAgIGNvbnN0IHBocyA9IGFzc2VtYmxlQm91bmRUZXh0UGxhY2Vob2xkZXJzKG5vZGUsIHRoaXMuYmluZGluZ3Muc2l6ZSwgdGhpcy5pZCk7XG4gICAgcGhzLmZvckVhY2goKHZhbHVlcywga2V5KSA9PiB1cGRhdGVQbGFjZWhvbGRlck1hcCh0aGlzLnBsYWNlaG9sZGVycywga2V5LCAuLi52YWx1ZXMpKTtcbiAgfVxuICBhcHBlbmRUZW1wbGF0ZShub2RlOiBpMThuLkFTVCwgaW5kZXg6IG51bWJlcikge1xuICAgIC8vIGFkZCBvcGVuIGFuZCBjbG9zZSB0YWdzIGF0IHRoZSBzYW1lIHRpbWUsXG4gICAgLy8gc2luY2Ugd2UgcHJvY2VzcyBuZXN0ZWQgdGVtcGxhdGVzIHNlcGFyYXRlbHlcbiAgICB0aGlzLmFwcGVuZFRhZyhUYWdUeXBlLlRFTVBMQVRFLCBub2RlIGFzIGkxOG4uVGFnUGxhY2Vob2xkZXIsIGluZGV4LCBmYWxzZSk7XG4gICAgdGhpcy5hcHBlbmRUYWcoVGFnVHlwZS5URU1QTEFURSwgbm9kZSBhcyBpMThuLlRhZ1BsYWNlaG9sZGVyLCBpbmRleCwgdHJ1ZSk7XG4gICAgdGhpcy5fdW5yZXNvbHZlZEN0eENvdW50Kys7XG4gIH1cbiAgYXBwZW5kRWxlbWVudChub2RlOiBpMThuLkFTVCwgaW5kZXg6IG51bWJlciwgY2xvc2VkPzogYm9vbGVhbikge1xuICAgIHRoaXMuYXBwZW5kVGFnKFRhZ1R5cGUuRUxFTUVOVCwgbm9kZSBhcyBpMThuLlRhZ1BsYWNlaG9sZGVyLCBpbmRleCwgY2xvc2VkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZXMgYW4gaW5zdGFuY2Ugb2YgYSBjaGlsZCBjb250ZXh0IGJhc2VkIG9uIHRoZSByb290IG9uZSxcbiAgICogd2hlbiB3ZSBlbnRlciBhIG5lc3RlZCB0ZW1wbGF0ZSB3aXRoaW4gSTE4biBzZWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gaW5kZXggSW5zdHJ1Y3Rpb24gaW5kZXggb2YgY29ycmVzcG9uZGluZyBpMThuU3RhcnQsIHdoaWNoIGluaXRpYXRlcyB0aGlzIGNvbnRleHRcbiAgICogQHBhcmFtIHRlbXBsYXRlSW5kZXggSW5zdHJ1Y3Rpb24gaW5kZXggb2YgYSB0ZW1wbGF0ZSB3aGljaCB0aGlzIGNvbnRleHQgYmVsb25ncyB0b1xuICAgKiBAcGFyYW0gbWV0YSBNZXRhIGluZm9ybWF0aW9uIChpZCwgbWVhbmluZywgZGVzY3JpcHRpb24sIGV0YykgYXNzb2NpYXRlZCB3aXRoIHRoaXMgY29udGV4dFxuICAgKlxuICAgKiBAcmV0dXJucyBJMThuQ29udGV4dCBpbnN0YW5jZVxuICAgKi9cbiAgZm9ya0NoaWxkQ29udGV4dChpbmRleDogbnVtYmVyLCB0ZW1wbGF0ZUluZGV4OiBudW1iZXIsIG1ldGE6IGkxOG4uQVNUKSB7XG4gICAgcmV0dXJuIG5ldyBJMThuQ29udGV4dChpbmRleCwgdGhpcy5yZWYsIHRoaXMubGV2ZWwgKyAxLCB0ZW1wbGF0ZUluZGV4LCBtZXRhLCB0aGlzLl9yZWdpc3RyeSk7XG4gIH1cblxuICAvKipcbiAgICogUmVjb25jaWxlcyBjaGlsZCBjb250ZXh0IGludG8gcGFyZW50IG9uZSBvbmNlIHRoZSBlbmQgb2YgdGhlIGkxOG4gYmxvY2sgaXMgcmVhY2hlZCAoaTE4bkVuZCkuXG4gICAqXG4gICAqIEBwYXJhbSBjb250ZXh0IENoaWxkIEkxOG5Db250ZXh0IGluc3RhbmNlIHRvIGJlIHJlY29uY2lsZWQgd2l0aCBwYXJlbnQgY29udGV4dC5cbiAgICovXG4gIHJlY29uY2lsZUNoaWxkQ29udGV4dChjb250ZXh0OiBJMThuQ29udGV4dCkge1xuICAgIC8vIHNldCB0aGUgcmlnaHQgY29udGV4dCBpZCBmb3Igb3BlbiBhbmQgY2xvc2VcbiAgICAvLyB0ZW1wbGF0ZSB0YWdzLCBzbyB3ZSBjYW4gdXNlIGl0IGFzIHN1Yi1ibG9jayBpZHNcbiAgICBbJ3N0YXJ0JywgJ2Nsb3NlJ10uZm9yRWFjaCgob3A6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3Qga2V5ID0gKGNvbnRleHQubWV0YSBhcyBhbnkpW2Ake29wfU5hbWVgXTtcbiAgICAgIGNvbnN0IHBocyA9IHRoaXMucGxhY2Vob2xkZXJzLmdldChrZXkpIHx8IFtdO1xuICAgICAgY29uc3QgdGFnID0gcGhzLmZpbmQoZmluZFRlbXBsYXRlRm4odGhpcy5pZCwgY29udGV4dC50ZW1wbGF0ZUluZGV4KSk7XG4gICAgICBpZiAodGFnKSB7XG4gICAgICAgIHRhZy5jdHggPSBjb250ZXh0LmlkO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gcmVjb25jaWxlIHBsYWNlaG9sZGVyc1xuICAgIGNvbnN0IGNoaWxkUGhzID0gY29udGV4dC5wbGFjZWhvbGRlcnM7XG4gICAgY2hpbGRQaHMuZm9yRWFjaCgodmFsdWVzOiBhbnlbXSwga2V5OiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnN0IHBocyA9IHRoaXMucGxhY2Vob2xkZXJzLmdldChrZXkpO1xuICAgICAgaWYgKCFwaHMpIHtcbiAgICAgICAgdGhpcy5wbGFjZWhvbGRlcnMuc2V0KGtleSwgdmFsdWVzKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gdHJ5IHRvIGZpbmQgbWF0Y2hpbmcgdGVtcGxhdGUuLi5cbiAgICAgIGNvbnN0IHRtcGxJZHggPSBmaW5kSW5kZXgocGhzLCBmaW5kVGVtcGxhdGVGbihjb250ZXh0LmlkLCBjb250ZXh0LnRlbXBsYXRlSW5kZXgpKTtcbiAgICAgIGlmICh0bXBsSWR4ID49IDApIHtcbiAgICAgICAgLy8gLi4uIGlmIGZvdW5kIC0gcmVwbGFjZSBpdCB3aXRoIG5lc3RlZCB0ZW1wbGF0ZSBjb250ZW50XG4gICAgICAgIGNvbnN0IGlzQ2xvc2VUYWcgPSBrZXkuc3RhcnRzV2l0aCgnQ0xPU0UnKTtcbiAgICAgICAgY29uc3QgaXNUZW1wbGF0ZVRhZyA9IGtleS5lbmRzV2l0aCgnTkctVEVNUExBVEUnKTtcbiAgICAgICAgaWYgKGlzVGVtcGxhdGVUYWcpIHtcbiAgICAgICAgICAvLyBjdXJyZW50IHRlbXBsYXRlJ3MgY29udGVudCBpcyBwbGFjZWQgYmVmb3JlIG9yIGFmdGVyXG4gICAgICAgICAgLy8gcGFyZW50IHRlbXBsYXRlIHRhZywgZGVwZW5kaW5nIG9uIHRoZSBvcGVuL2Nsb3NlIGF0cnJpYnV0ZVxuICAgICAgICAgIHBocy5zcGxpY2UodG1wbElkeCArIChpc0Nsb3NlVGFnID8gMCA6IDEpLCAwLCAuLi52YWx1ZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGlkeCA9IGlzQ2xvc2VUYWcgPyB2YWx1ZXMubGVuZ3RoIC0gMSA6IDA7XG4gICAgICAgICAgdmFsdWVzW2lkeF0udG1wbCA9IHBoc1t0bXBsSWR4XTtcbiAgICAgICAgICBwaHMuc3BsaWNlKHRtcGxJZHgsIDEsIC4uLnZhbHVlcyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIC4uLiBvdGhlcndpc2UganVzdCBhcHBlbmQgY29udGVudCB0byBwbGFjZWhvbGRlciB2YWx1ZVxuICAgICAgICBwaHMucHVzaCguLi52YWx1ZXMpO1xuICAgICAgfVxuICAgICAgdGhpcy5wbGFjZWhvbGRlcnMuc2V0KGtleSwgcGhzKTtcbiAgICB9KTtcbiAgICB0aGlzLl91bnJlc29sdmVkQ3R4Q291bnQtLTtcbiAgfVxufVxuXG4vL1xuLy8gSGVscGVyIG1ldGhvZHNcbi8vXG5cbmZ1bmN0aW9uIHdyYXAoc3ltYm9sOiBzdHJpbmcsIGluZGV4OiBudW1iZXIsIGNvbnRleHRJZDogbnVtYmVyLCBjbG9zZWQ/OiBib29sZWFuKTogc3RyaW5nIHtcbiAgY29uc3Qgc3RhdGUgPSBjbG9zZWQgPyAnLycgOiAnJztcbiAgcmV0dXJuIHdyYXBJMThuUGxhY2Vob2xkZXIoYCR7c3RhdGV9JHtzeW1ib2x9JHtpbmRleH1gLCBjb250ZXh0SWQpO1xufVxuXG5mdW5jdGlvbiB3cmFwVGFnKHN5bWJvbDogc3RyaW5nLCB7aW5kZXgsIGN0eCwgaXNWb2lkfTogYW55LCBjbG9zZWQ/OiBib29sZWFuKTogc3RyaW5nIHtcbiAgcmV0dXJuIGlzVm9pZCA/IHdyYXAoc3ltYm9sLCBpbmRleCwgY3R4KSArIHdyYXAoc3ltYm9sLCBpbmRleCwgY3R4LCB0cnVlKSA6XG4gICAgICAgICAgICAgICAgICB3cmFwKHN5bWJvbCwgaW5kZXgsIGN0eCwgY2xvc2VkKTtcbn1cblxuZnVuY3Rpb24gZmluZFRlbXBsYXRlRm4oY3R4OiBudW1iZXIsIHRlbXBsYXRlSW5kZXg6IG51bWJlciB8IG51bGwpIHtcbiAgcmV0dXJuICh0b2tlbjogYW55KSA9PiB0eXBlb2YgdG9rZW4gPT09ICdvYmplY3QnICYmIHRva2VuLnR5cGUgPT09IFRhZ1R5cGUuVEVNUExBVEUgJiZcbiAgICAgIHRva2VuLmluZGV4ID09PSB0ZW1wbGF0ZUluZGV4ICYmIHRva2VuLmN0eCA9PT0gY3R4O1xufVxuXG5mdW5jdGlvbiBzZXJpYWxpemVQbGFjZWhvbGRlclZhbHVlKHZhbHVlOiBhbnkpOiBzdHJpbmcge1xuICBjb25zdCBlbGVtZW50ID0gKGRhdGE6IGFueSwgY2xvc2VkPzogYm9vbGVhbikgPT4gd3JhcFRhZygnIycsIGRhdGEsIGNsb3NlZCk7XG4gIGNvbnN0IHRlbXBsYXRlID0gKGRhdGE6IGFueSwgY2xvc2VkPzogYm9vbGVhbikgPT4gd3JhcFRhZygnKicsIGRhdGEsIGNsb3NlZCk7XG5cbiAgc3dpdGNoICh2YWx1ZS50eXBlKSB7XG4gICAgY2FzZSBUYWdUeXBlLkVMRU1FTlQ6XG4gICAgICAvLyBjbG9zZSBlbGVtZW50IHRhZ1xuICAgICAgaWYgKHZhbHVlLmNsb3NlZCkge1xuICAgICAgICByZXR1cm4gZWxlbWVudCh2YWx1ZSwgdHJ1ZSkgKyAodmFsdWUudG1wbCA/IHRlbXBsYXRlKHZhbHVlLnRtcGwsIHRydWUpIDogJycpO1xuICAgICAgfVxuICAgICAgLy8gb3BlbiBlbGVtZW50IHRhZyB0aGF0IGFsc28gaW5pdGlhdGVzIGEgdGVtcGxhdGVcbiAgICAgIGlmICh2YWx1ZS50bXBsKSB7XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZSh2YWx1ZS50bXBsKSArIGVsZW1lbnQodmFsdWUpICtcbiAgICAgICAgICAgICh2YWx1ZS5pc1ZvaWQgPyB0ZW1wbGF0ZSh2YWx1ZS50bXBsLCB0cnVlKSA6ICcnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBlbGVtZW50KHZhbHVlKTtcblxuICAgIGNhc2UgVGFnVHlwZS5URU1QTEFURTpcbiAgICAgIHJldHVybiB0ZW1wbGF0ZSh2YWx1ZSwgdmFsdWUuY2xvc2VkKTtcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gdmFsdWU7XG4gIH1cbn1cbiJdfQ==