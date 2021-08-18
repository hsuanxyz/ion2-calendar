/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { decimalDigest } from '../../../i18n/digest';
import * as i18n from '../../../i18n/i18n_ast';
import { createI18nMessageFactory } from '../../../i18n/i18n_parser';
import * as html from '../../../ml_parser/ast';
import { DEFAULT_INTERPOLATION_CONFIG } from '../../../ml_parser/interpolation_config';
import { ParseTreeResult } from '../../../ml_parser/parser';
import { I18N_ATTR, I18N_ATTR_PREFIX, hasI18nAttrs, icuFromI18nMessage, metaFromI18nMessage, parseI18nMeta } from './util';
function setI18nRefs(html, i18n) {
    html.i18n = i18n;
}
/**
 * This visitor walks over HTML parse tree and converts information stored in
 * i18n-related attributes ("i18n" and "i18n-*") into i18n meta object that is
 * stored with other element's and attribute's information.
 */
var I18nMetaVisitor = /** @class */ (function () {
    function I18nMetaVisitor(config) {
        this.config = config;
        // i18n message generation factory
        this._createI18nMessage = createI18nMessageFactory(DEFAULT_INTERPOLATION_CONFIG);
    }
    I18nMetaVisitor.prototype._generateI18nMessage = function (nodes, meta, visitNodeFn) {
        if (meta === void 0) { meta = ''; }
        var parsed = typeof meta === 'string' ? parseI18nMeta(meta) : metaFromI18nMessage(meta);
        var message = this._createI18nMessage(nodes, parsed.meaning || '', parsed.description || '', parsed.id || '', visitNodeFn);
        if (!message.id) {
            // generate (or restore) message id if not specified in template
            message.id = typeof meta !== 'string' && meta.id || decimalDigest(message);
        }
        return message;
    };
    I18nMetaVisitor.prototype.visitElement = function (element, context) {
        var e_1, _a, e_2, _b;
        if (hasI18nAttrs(element)) {
            var attrs = [];
            var attrsMeta = {};
            try {
                for (var _c = tslib_1.__values(element.attrs), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var attr = _d.value;
                    if (attr.name === I18N_ATTR) {
                        // root 'i18n' node attribute
                        var i18n_1 = element.i18n || attr.value;
                        var message = this._generateI18nMessage(element.children, i18n_1, setI18nRefs);
                        // do not assign empty i18n meta
                        if (message.nodes.length) {
                            element.i18n = message;
                        }
                    }
                    else if (attr.name.startsWith(I18N_ATTR_PREFIX)) {
                        // 'i18n-*' attributes
                        var key = attr.name.slice(I18N_ATTR_PREFIX.length);
                        attrsMeta[key] = attr.value;
                    }
                    else {
                        // non-i18n attributes
                        attrs.push(attr);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // set i18n meta for attributes
            if (Object.keys(attrsMeta).length) {
                try {
                    for (var attrs_1 = tslib_1.__values(attrs), attrs_1_1 = attrs_1.next(); !attrs_1_1.done; attrs_1_1 = attrs_1.next()) {
                        var attr = attrs_1_1.value;
                        var meta = attrsMeta[attr.name];
                        // do not create translation for empty attributes
                        if (meta !== undefined && attr.value) {
                            attr.i18n = this._generateI18nMessage([attr], attr.i18n || meta);
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (attrs_1_1 && !attrs_1_1.done && (_b = attrs_1.return)) _b.call(attrs_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            if (!this.config.keepI18nAttrs) {
                // update element's attributes,
                // keeping only non-i18n related ones
                element.attrs = attrs;
            }
        }
        html.visitAll(this, element.children);
        return element;
    };
    I18nMetaVisitor.prototype.visitExpansion = function (expansion, context) {
        var message;
        var meta = expansion.i18n;
        if (meta instanceof i18n.IcuPlaceholder) {
            // set ICU placeholder name (e.g. "ICU_1"),
            // generated while processing root element contents,
            // so we can reference it when we output translation
            var name_1 = meta.name;
            message = this._generateI18nMessage([expansion], meta);
            var icu = icuFromI18nMessage(message);
            icu.name = name_1;
        }
        else {
            // when ICU is a root level translation
            message = this._generateI18nMessage([expansion], meta);
        }
        expansion.i18n = message;
        return expansion;
    };
    I18nMetaVisitor.prototype.visitText = function (text, context) { return text; };
    I18nMetaVisitor.prototype.visitAttribute = function (attribute, context) { return attribute; };
    I18nMetaVisitor.prototype.visitComment = function (comment, context) { return comment; };
    I18nMetaVisitor.prototype.visitExpansionCase = function (expansionCase, context) { return expansionCase; };
    return I18nMetaVisitor;
}());
export { I18nMetaVisitor };
export function processI18nMeta(htmlAstWithErrors) {
    return new ParseTreeResult(html.visitAll(new I18nMetaVisitor({ keepI18nAttrs: false }), htmlAstWithErrors.rootNodes), htmlAstWithErrors.errors);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2NvbXBpbGVyL3NyYy9yZW5kZXIzL3ZpZXcvaTE4bi9tZXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDbkQsT0FBTyxLQUFLLElBQUksTUFBTSx3QkFBd0IsQ0FBQztBQUMvQyxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUNuRSxPQUFPLEtBQUssSUFBSSxNQUFNLHdCQUF3QixDQUFDO0FBQy9DLE9BQU8sRUFBQyw0QkFBNEIsRUFBQyxNQUFNLHlDQUF5QyxDQUFDO0FBQ3JGLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUUxRCxPQUFPLEVBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUFZLFlBQVksRUFBRSxrQkFBa0IsRUFBRSxtQkFBbUIsRUFBRSxhQUFhLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFFbkksU0FBUyxXQUFXLENBQUMsSUFBa0MsRUFBRSxJQUFlO0lBQ3RFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ25CLENBQUM7QUFFRDs7OztHQUlHO0FBQ0g7SUFJRSx5QkFBb0IsTUFBZ0M7UUFBaEMsV0FBTSxHQUFOLE1BQU0sQ0FBMEI7UUFIcEQsa0NBQWtDO1FBQzFCLHVCQUFrQixHQUFHLHdCQUF3QixDQUFDLDRCQUE0QixDQUFDLENBQUM7SUFFN0IsQ0FBQztJQUVoRCw4Q0FBb0IsR0FBNUIsVUFDSSxLQUFrQixFQUFFLElBQTBCLEVBQzlDLFdBQXdEO1FBRHBDLHFCQUFBLEVBQUEsU0FBMEI7UUFFaEQsSUFBTSxNQUFNLEdBQ1IsT0FBTyxJQUFJLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLElBQW9CLENBQUMsQ0FBQztRQUMvRixJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQ25DLEtBQUssRUFBRSxNQUFNLENBQUMsT0FBTyxJQUFJLEVBQUUsRUFBRSxNQUFNLENBQUMsV0FBVyxJQUFJLEVBQUUsRUFBRSxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUN6RixJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRTtZQUNmLGdFQUFnRTtZQUNoRSxPQUFPLENBQUMsRUFBRSxHQUFHLE9BQU8sSUFBSSxLQUFLLFFBQVEsSUFBSyxJQUFxQixDQUFDLEVBQUUsSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDOUY7UUFDRCxPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBRUQsc0NBQVksR0FBWixVQUFhLE9BQXFCLEVBQUUsT0FBWTs7UUFDOUMsSUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDekIsSUFBTSxLQUFLLEdBQXFCLEVBQUUsQ0FBQztZQUNuQyxJQUFNLFNBQVMsR0FBNEIsRUFBRSxDQUFDOztnQkFFOUMsS0FBbUIsSUFBQSxLQUFBLGlCQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUEsZ0JBQUEsNEJBQUU7b0JBQTdCLElBQU0sSUFBSSxXQUFBO29CQUNiLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7d0JBQzNCLDZCQUE2Qjt3QkFDN0IsSUFBTSxNQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDO3dCQUN4QyxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxNQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7d0JBQy9FLGdDQUFnQzt3QkFDaEMsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTs0QkFDeEIsT0FBTyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7eUJBQ3hCO3FCQUVGO3lCQUFNLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsRUFBRTt3QkFDakQsc0JBQXNCO3dCQUN0QixJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDckQsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7cUJBRTdCO3lCQUFNO3dCQUNMLHNCQUFzQjt3QkFDdEIsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDbEI7aUJBQ0Y7Ozs7Ozs7OztZQUVELCtCQUErQjtZQUMvQixJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxFQUFFOztvQkFDakMsS0FBbUIsSUFBQSxVQUFBLGlCQUFBLEtBQUssQ0FBQSw0QkFBQSwrQ0FBRTt3QkFBckIsSUFBTSxJQUFJLGtCQUFBO3dCQUNiLElBQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ2xDLGlEQUFpRDt3QkFDakQsSUFBSSxJQUFJLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7NEJBQ3BDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQzt5QkFDbEU7cUJBQ0Y7Ozs7Ozs7OzthQUNGO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFO2dCQUM5QiwrQkFBK0I7Z0JBQy9CLHFDQUFxQztnQkFDckMsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7YUFDdkI7U0FDRjtRQUNELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0QyxPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBRUQsd0NBQWMsR0FBZCxVQUFlLFNBQXlCLEVBQUUsT0FBWTtRQUNwRCxJQUFJLE9BQU8sQ0FBQztRQUNaLElBQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUM7UUFDNUIsSUFBSSxJQUFJLFlBQVksSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUN2QywyQ0FBMkM7WUFDM0Msb0RBQW9EO1lBQ3BELG9EQUFvRDtZQUNwRCxJQUFNLE1BQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ3ZCLE9BQU8sR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN2RCxJQUFNLEdBQUcsR0FBRyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4QyxHQUFHLENBQUMsSUFBSSxHQUFHLE1BQUksQ0FBQztTQUNqQjthQUFNO1lBQ0wsdUNBQXVDO1lBQ3ZDLE9BQU8sR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUN4RDtRQUNELFNBQVMsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO1FBQ3pCLE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7SUFFRCxtQ0FBUyxHQUFULFVBQVUsSUFBZSxFQUFFLE9BQVksSUFBUyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDOUQsd0NBQWMsR0FBZCxVQUFlLFNBQXlCLEVBQUUsT0FBWSxJQUFTLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQztJQUNsRixzQ0FBWSxHQUFaLFVBQWEsT0FBcUIsRUFBRSxPQUFZLElBQVMsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQzFFLDRDQUFrQixHQUFsQixVQUFtQixhQUFpQyxFQUFFLE9BQVksSUFBUyxPQUFPLGFBQWEsQ0FBQyxDQUFDLENBQUM7SUFDcEcsc0JBQUM7QUFBRCxDQUFDLEFBMUZELElBMEZDOztBQUVELE1BQU0sVUFBVSxlQUFlLENBQUMsaUJBQWtDO0lBQ2hFLE9BQU8sSUFBSSxlQUFlLENBQ3RCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxlQUFlLENBQUMsRUFBQyxhQUFhLEVBQUUsS0FBSyxFQUFDLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsRUFDdkYsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDaEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtkZWNpbWFsRGlnZXN0fSBmcm9tICcuLi8uLi8uLi9pMThuL2RpZ2VzdCc7XG5pbXBvcnQgKiBhcyBpMThuIGZyb20gJy4uLy4uLy4uL2kxOG4vaTE4bl9hc3QnO1xuaW1wb3J0IHtjcmVhdGVJMThuTWVzc2FnZUZhY3Rvcnl9IGZyb20gJy4uLy4uLy4uL2kxOG4vaTE4bl9wYXJzZXInO1xuaW1wb3J0ICogYXMgaHRtbCBmcm9tICcuLi8uLi8uLi9tbF9wYXJzZXIvYXN0JztcbmltcG9ydCB7REVGQVVMVF9JTlRFUlBPTEFUSU9OX0NPTkZJR30gZnJvbSAnLi4vLi4vLi4vbWxfcGFyc2VyL2ludGVycG9sYXRpb25fY29uZmlnJztcbmltcG9ydCB7UGFyc2VUcmVlUmVzdWx0fSBmcm9tICcuLi8uLi8uLi9tbF9wYXJzZXIvcGFyc2VyJztcblxuaW1wb3J0IHtJMThOX0FUVFIsIEkxOE5fQVRUUl9QUkVGSVgsIEkxOG5NZXRhLCBoYXNJMThuQXR0cnMsIGljdUZyb21JMThuTWVzc2FnZSwgbWV0YUZyb21JMThuTWVzc2FnZSwgcGFyc2VJMThuTWV0YX0gZnJvbSAnLi91dGlsJztcblxuZnVuY3Rpb24gc2V0STE4blJlZnMoaHRtbDogaHRtbC5Ob2RlICYge2kxOG46IGkxOG4uQVNUfSwgaTE4bjogaTE4bi5Ob2RlKSB7XG4gIGh0bWwuaTE4biA9IGkxOG47XG59XG5cbi8qKlxuICogVGhpcyB2aXNpdG9yIHdhbGtzIG92ZXIgSFRNTCBwYXJzZSB0cmVlIGFuZCBjb252ZXJ0cyBpbmZvcm1hdGlvbiBzdG9yZWQgaW5cbiAqIGkxOG4tcmVsYXRlZCBhdHRyaWJ1dGVzIChcImkxOG5cIiBhbmQgXCJpMThuLSpcIikgaW50byBpMThuIG1ldGEgb2JqZWN0IHRoYXQgaXNcbiAqIHN0b3JlZCB3aXRoIG90aGVyIGVsZW1lbnQncyBhbmQgYXR0cmlidXRlJ3MgaW5mb3JtYXRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBJMThuTWV0YVZpc2l0b3IgaW1wbGVtZW50cyBodG1sLlZpc2l0b3Ige1xuICAvLyBpMThuIG1lc3NhZ2UgZ2VuZXJhdGlvbiBmYWN0b3J5XG4gIHByaXZhdGUgX2NyZWF0ZUkxOG5NZXNzYWdlID0gY3JlYXRlSTE4bk1lc3NhZ2VGYWN0b3J5KERFRkFVTFRfSU5URVJQT0xBVElPTl9DT05GSUcpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY29uZmlnOiB7a2VlcEkxOG5BdHRyczogYm9vbGVhbn0pIHt9XG5cbiAgcHJpdmF0ZSBfZ2VuZXJhdGVJMThuTWVzc2FnZShcbiAgICAgIG5vZGVzOiBodG1sLk5vZGVbXSwgbWV0YTogc3RyaW5nfGkxOG4uQVNUID0gJycsXG4gICAgICB2aXNpdE5vZGVGbj86IChodG1sOiBodG1sLk5vZGUsIGkxOG46IGkxOG4uTm9kZSkgPT4gdm9pZCk6IGkxOG4uTWVzc2FnZSB7XG4gICAgY29uc3QgcGFyc2VkOiBJMThuTWV0YSA9XG4gICAgICAgIHR5cGVvZiBtZXRhID09PSAnc3RyaW5nJyA/IHBhcnNlSTE4bk1ldGEobWV0YSkgOiBtZXRhRnJvbUkxOG5NZXNzYWdlKG1ldGEgYXMgaTE4bi5NZXNzYWdlKTtcbiAgICBjb25zdCBtZXNzYWdlID0gdGhpcy5fY3JlYXRlSTE4bk1lc3NhZ2UoXG4gICAgICAgIG5vZGVzLCBwYXJzZWQubWVhbmluZyB8fCAnJywgcGFyc2VkLmRlc2NyaXB0aW9uIHx8ICcnLCBwYXJzZWQuaWQgfHwgJycsIHZpc2l0Tm9kZUZuKTtcbiAgICBpZiAoIW1lc3NhZ2UuaWQpIHtcbiAgICAgIC8vIGdlbmVyYXRlIChvciByZXN0b3JlKSBtZXNzYWdlIGlkIGlmIG5vdCBzcGVjaWZpZWQgaW4gdGVtcGxhdGVcbiAgICAgIG1lc3NhZ2UuaWQgPSB0eXBlb2YgbWV0YSAhPT0gJ3N0cmluZycgJiYgKG1ldGEgYXMgaTE4bi5NZXNzYWdlKS5pZCB8fCBkZWNpbWFsRGlnZXN0KG1lc3NhZ2UpO1xuICAgIH1cbiAgICByZXR1cm4gbWVzc2FnZTtcbiAgfVxuXG4gIHZpc2l0RWxlbWVudChlbGVtZW50OiBodG1sLkVsZW1lbnQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgaWYgKGhhc0kxOG5BdHRycyhlbGVtZW50KSkge1xuICAgICAgY29uc3QgYXR0cnM6IGh0bWwuQXR0cmlidXRlW10gPSBbXTtcbiAgICAgIGNvbnN0IGF0dHJzTWV0YToge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcblxuICAgICAgZm9yIChjb25zdCBhdHRyIG9mIGVsZW1lbnQuYXR0cnMpIHtcbiAgICAgICAgaWYgKGF0dHIubmFtZSA9PT0gSTE4Tl9BVFRSKSB7XG4gICAgICAgICAgLy8gcm9vdCAnaTE4bicgbm9kZSBhdHRyaWJ1dGVcbiAgICAgICAgICBjb25zdCBpMThuID0gZWxlbWVudC5pMThuIHx8IGF0dHIudmFsdWU7XG4gICAgICAgICAgY29uc3QgbWVzc2FnZSA9IHRoaXMuX2dlbmVyYXRlSTE4bk1lc3NhZ2UoZWxlbWVudC5jaGlsZHJlbiwgaTE4biwgc2V0STE4blJlZnMpO1xuICAgICAgICAgIC8vIGRvIG5vdCBhc3NpZ24gZW1wdHkgaTE4biBtZXRhXG4gICAgICAgICAgaWYgKG1lc3NhZ2Uubm9kZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBlbGVtZW50LmkxOG4gPSBtZXNzYWdlO1xuICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgaWYgKGF0dHIubmFtZS5zdGFydHNXaXRoKEkxOE5fQVRUUl9QUkVGSVgpKSB7XG4gICAgICAgICAgLy8gJ2kxOG4tKicgYXR0cmlidXRlc1xuICAgICAgICAgIGNvbnN0IGtleSA9IGF0dHIubmFtZS5zbGljZShJMThOX0FUVFJfUFJFRklYLmxlbmd0aCk7XG4gICAgICAgICAgYXR0cnNNZXRhW2tleV0gPSBhdHRyLnZhbHVlO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gbm9uLWkxOG4gYXR0cmlidXRlc1xuICAgICAgICAgIGF0dHJzLnB1c2goYXR0cik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gc2V0IGkxOG4gbWV0YSBmb3IgYXR0cmlidXRlc1xuICAgICAgaWYgKE9iamVjdC5rZXlzKGF0dHJzTWV0YSkubGVuZ3RoKSB7XG4gICAgICAgIGZvciAoY29uc3QgYXR0ciBvZiBhdHRycykge1xuICAgICAgICAgIGNvbnN0IG1ldGEgPSBhdHRyc01ldGFbYXR0ci5uYW1lXTtcbiAgICAgICAgICAvLyBkbyBub3QgY3JlYXRlIHRyYW5zbGF0aW9uIGZvciBlbXB0eSBhdHRyaWJ1dGVzXG4gICAgICAgICAgaWYgKG1ldGEgIT09IHVuZGVmaW5lZCAmJiBhdHRyLnZhbHVlKSB7XG4gICAgICAgICAgICBhdHRyLmkxOG4gPSB0aGlzLl9nZW5lcmF0ZUkxOG5NZXNzYWdlKFthdHRyXSwgYXR0ci5pMThuIHx8IG1ldGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuY29uZmlnLmtlZXBJMThuQXR0cnMpIHtcbiAgICAgICAgLy8gdXBkYXRlIGVsZW1lbnQncyBhdHRyaWJ1dGVzLFxuICAgICAgICAvLyBrZWVwaW5nIG9ubHkgbm9uLWkxOG4gcmVsYXRlZCBvbmVzXG4gICAgICAgIGVsZW1lbnQuYXR0cnMgPSBhdHRycztcbiAgICAgIH1cbiAgICB9XG4gICAgaHRtbC52aXNpdEFsbCh0aGlzLCBlbGVtZW50LmNoaWxkcmVuKTtcbiAgICByZXR1cm4gZWxlbWVudDtcbiAgfVxuXG4gIHZpc2l0RXhwYW5zaW9uKGV4cGFuc2lvbjogaHRtbC5FeHBhbnNpb24sIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgbGV0IG1lc3NhZ2U7XG4gICAgY29uc3QgbWV0YSA9IGV4cGFuc2lvbi5pMThuO1xuICAgIGlmIChtZXRhIGluc3RhbmNlb2YgaTE4bi5JY3VQbGFjZWhvbGRlcikge1xuICAgICAgLy8gc2V0IElDVSBwbGFjZWhvbGRlciBuYW1lIChlLmcuIFwiSUNVXzFcIiksXG4gICAgICAvLyBnZW5lcmF0ZWQgd2hpbGUgcHJvY2Vzc2luZyByb290IGVsZW1lbnQgY29udGVudHMsXG4gICAgICAvLyBzbyB3ZSBjYW4gcmVmZXJlbmNlIGl0IHdoZW4gd2Ugb3V0cHV0IHRyYW5zbGF0aW9uXG4gICAgICBjb25zdCBuYW1lID0gbWV0YS5uYW1lO1xuICAgICAgbWVzc2FnZSA9IHRoaXMuX2dlbmVyYXRlSTE4bk1lc3NhZ2UoW2V4cGFuc2lvbl0sIG1ldGEpO1xuICAgICAgY29uc3QgaWN1ID0gaWN1RnJvbUkxOG5NZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgaWN1Lm5hbWUgPSBuYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyB3aGVuIElDVSBpcyBhIHJvb3QgbGV2ZWwgdHJhbnNsYXRpb25cbiAgICAgIG1lc3NhZ2UgPSB0aGlzLl9nZW5lcmF0ZUkxOG5NZXNzYWdlKFtleHBhbnNpb25dLCBtZXRhKTtcbiAgICB9XG4gICAgZXhwYW5zaW9uLmkxOG4gPSBtZXNzYWdlO1xuICAgIHJldHVybiBleHBhbnNpb247XG4gIH1cblxuICB2aXNpdFRleHQodGV4dDogaHRtbC5UZXh0LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gdGV4dDsgfVxuICB2aXNpdEF0dHJpYnV0ZShhdHRyaWJ1dGU6IGh0bWwuQXR0cmlidXRlLCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gYXR0cmlidXRlOyB9XG4gIHZpc2l0Q29tbWVudChjb21tZW50OiBodG1sLkNvbW1lbnQsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBjb21tZW50OyB9XG4gIHZpc2l0RXhwYW5zaW9uQ2FzZShleHBhbnNpb25DYXNlOiBodG1sLkV4cGFuc2lvbkNhc2UsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBleHBhbnNpb25DYXNlOyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9jZXNzSTE4bk1ldGEoaHRtbEFzdFdpdGhFcnJvcnM6IFBhcnNlVHJlZVJlc3VsdCk6IFBhcnNlVHJlZVJlc3VsdCB7XG4gIHJldHVybiBuZXcgUGFyc2VUcmVlUmVzdWx0KFxuICAgICAgaHRtbC52aXNpdEFsbChuZXcgSTE4bk1ldGFWaXNpdG9yKHtrZWVwSTE4bkF0dHJzOiBmYWxzZX0pLCBodG1sQXN0V2l0aEVycm9ycy5yb290Tm9kZXMpLFxuICAgICAgaHRtbEFzdFdpdGhFcnJvcnMuZXJyb3JzKTtcbn0iXX0=