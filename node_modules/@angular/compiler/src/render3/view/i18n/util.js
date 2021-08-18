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
        define("@angular/compiler/src/render3/view/i18n/util", ["require", "exports", "tslib", "@angular/compiler/src/i18n/i18n_ast", "@angular/compiler/src/i18n/serializers/xmb", "@angular/compiler/src/output/map_util", "@angular/compiler/src/output/output_ast"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var i18n = require("@angular/compiler/src/i18n/i18n_ast");
    var xmb_1 = require("@angular/compiler/src/i18n/serializers/xmb");
    var map_util_1 = require("@angular/compiler/src/output/map_util");
    var o = require("@angular/compiler/src/output/output_ast");
    /* Closure variables holding messages must be named `MSG_[A-Z0-9]+` */
    var TRANSLATION_PREFIX = 'MSG_';
    /** Closure uses `goog.getMsg(message)` to lookup translations */
    var GOOG_GET_MSG = 'goog.getMsg';
    /** String key that is used to provide backup id of translatable message in Closure */
    var BACKUP_MESSAGE_ID = 'BACKUP_MESSAGE_ID';
    /** Regexp to identify whether backup id already provided in description */
    var BACKUP_MESSAGE_ID_REGEXP = new RegExp(BACKUP_MESSAGE_ID);
    /** I18n separators for metadata **/
    var I18N_MEANING_SEPARATOR = '|';
    var I18N_ID_SEPARATOR = '@@';
    /** Name of the i18n attributes **/
    exports.I18N_ATTR = 'i18n';
    exports.I18N_ATTR_PREFIX = 'i18n-';
    /** Prefix of var expressions used in ICUs */
    exports.I18N_ICU_VAR_PREFIX = 'VAR_';
    /** Prefix of ICU expressions for post processing */
    exports.I18N_ICU_MAPPING_PREFIX = 'I18N_EXP_';
    /** Placeholder wrapper for i18n expressions **/
    exports.I18N_PLACEHOLDER_SYMBOL = '�';
    function i18nTranslationToDeclStmt(variable, message, params) {
        var args = [o.literal(message)];
        if (params && Object.keys(params).length) {
            args.push(map_util_1.mapLiteral(params, true));
        }
        var fnCall = o.variable(GOOG_GET_MSG).callFn(args);
        return variable.set(fnCall).toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]);
    }
    // Converts i18n meta informations for a message (id, description, meaning)
    // to a JsDoc statement formatted as expected by the Closure compiler.
    function i18nMetaToDocStmt(meta) {
        var tags = [];
        var id = meta.id, description = meta.description, meaning = meta.meaning;
        if (id || description) {
            var hasBackupId = !!description && BACKUP_MESSAGE_ID_REGEXP.test(description);
            var text = id && !hasBackupId ? "[" + BACKUP_MESSAGE_ID + ":" + id + "] " + (description || '') : description;
            tags.push({ tagName: "desc" /* Desc */, text: text.trim() });
        }
        if (meaning) {
            tags.push({ tagName: "meaning" /* Meaning */, text: meaning });
        }
        return tags.length == 0 ? null : new o.JSDocCommentStmt(tags);
    }
    function isI18nAttribute(name) {
        return name === exports.I18N_ATTR || name.startsWith(exports.I18N_ATTR_PREFIX);
    }
    exports.isI18nAttribute = isI18nAttribute;
    function isI18nRootNode(meta) {
        return meta instanceof i18n.Message;
    }
    exports.isI18nRootNode = isI18nRootNode;
    function isSingleI18nIcu(meta) {
        return isI18nRootNode(meta) && meta.nodes.length === 1 && meta.nodes[0] instanceof i18n.Icu;
    }
    exports.isSingleI18nIcu = isSingleI18nIcu;
    function hasI18nAttrs(element) {
        return element.attrs.some(function (attr) { return isI18nAttribute(attr.name); });
    }
    exports.hasI18nAttrs = hasI18nAttrs;
    function metaFromI18nMessage(message) {
        return {
            id: message.id || '',
            meaning: message.meaning || '',
            description: message.description || ''
        };
    }
    exports.metaFromI18nMessage = metaFromI18nMessage;
    function icuFromI18nMessage(message) {
        return message.nodes[0];
    }
    exports.icuFromI18nMessage = icuFromI18nMessage;
    function wrapI18nPlaceholder(content, contextId) {
        if (contextId === void 0) { contextId = 0; }
        var blockId = contextId > 0 ? ":" + contextId : '';
        return "" + exports.I18N_PLACEHOLDER_SYMBOL + content + blockId + exports.I18N_PLACEHOLDER_SYMBOL;
    }
    exports.wrapI18nPlaceholder = wrapI18nPlaceholder;
    function assembleI18nBoundString(strings, bindingStartIndex, contextId) {
        if (bindingStartIndex === void 0) { bindingStartIndex = 0; }
        if (contextId === void 0) { contextId = 0; }
        if (!strings.length)
            return '';
        var acc = '';
        var lastIdx = strings.length - 1;
        for (var i = 0; i < lastIdx; i++) {
            acc += "" + strings[i] + wrapI18nPlaceholder(bindingStartIndex + i, contextId);
        }
        acc += strings[lastIdx];
        return acc;
    }
    exports.assembleI18nBoundString = assembleI18nBoundString;
    function getSeqNumberGenerator(startsAt) {
        if (startsAt === void 0) { startsAt = 0; }
        var current = startsAt;
        return function () { return current++; };
    }
    exports.getSeqNumberGenerator = getSeqNumberGenerator;
    function placeholdersToParams(placeholders) {
        var params = {};
        placeholders.forEach(function (values, key) {
            params[key] = o.literal(values.length > 1 ? "[" + values.join('|') + "]" : values[0]);
        });
        return params;
    }
    exports.placeholdersToParams = placeholdersToParams;
    function updatePlaceholderMap(map, name) {
        var values = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            values[_i - 2] = arguments[_i];
        }
        var current = map.get(name) || [];
        current.push.apply(current, tslib_1.__spread(values));
        map.set(name, current);
    }
    exports.updatePlaceholderMap = updatePlaceholderMap;
    function assembleBoundTextPlaceholders(meta, bindingStartIndex, contextId) {
        if (bindingStartIndex === void 0) { bindingStartIndex = 0; }
        if (contextId === void 0) { contextId = 0; }
        var startIdx = bindingStartIndex;
        var placeholders = new Map();
        var node = meta instanceof i18n.Message ? meta.nodes.find(function (node) { return node instanceof i18n.Container; }) : meta;
        if (node) {
            node
                .children.filter(function (child) { return child instanceof i18n.Placeholder; })
                .forEach(function (child, idx) {
                var content = wrapI18nPlaceholder(startIdx + idx, contextId);
                updatePlaceholderMap(placeholders, child.name, content);
            });
        }
        return placeholders;
    }
    exports.assembleBoundTextPlaceholders = assembleBoundTextPlaceholders;
    function findIndex(items, callback) {
        for (var i = 0; i < items.length; i++) {
            if (callback(items[i])) {
                return i;
            }
        }
        return -1;
    }
    exports.findIndex = findIndex;
    /**
     * Parses i18n metas like:
     *  - "@@id",
     *  - "description[@@id]",
     *  - "meaning|description[@@id]"
     * and returns an object with parsed output.
     *
     * @param meta String that represents i18n meta
     * @returns Object with id, meaning and description fields
     */
    function parseI18nMeta(meta) {
        var _a, _b;
        var id;
        var meaning;
        var description;
        if (meta) {
            var idIndex = meta.indexOf(I18N_ID_SEPARATOR);
            var descIndex = meta.indexOf(I18N_MEANING_SEPARATOR);
            var meaningAndDesc = void 0;
            _a = tslib_1.__read((idIndex > -1) ? [meta.slice(0, idIndex), meta.slice(idIndex + 2)] : [meta, ''], 2), meaningAndDesc = _a[0], id = _a[1];
            _b = tslib_1.__read((descIndex > -1) ?
                [meaningAndDesc.slice(0, descIndex), meaningAndDesc.slice(descIndex + 1)] :
                ['', meaningAndDesc], 2), meaning = _b[0], description = _b[1];
        }
        return { id: id, meaning: meaning, description: description };
    }
    exports.parseI18nMeta = parseI18nMeta;
    /**
     * Converts internal placeholder names to public-facing format
     * (for example to use in goog.getMsg call).
     * Example: `START_TAG_DIV_1` is converted to `startTagDiv_1`.
     *
     * @param name The placeholder name that should be formatted
     * @returns Formatted placeholder name
     */
    function formatI18nPlaceholderName(name) {
        var chunks = xmb_1.toPublicName(name).split('_');
        if (chunks.length === 1) {
            // if no "_" found - just lowercase the value
            return name.toLowerCase();
        }
        var postfix;
        // eject last element if it's a number
        if (/^\d+$/.test(chunks[chunks.length - 1])) {
            postfix = chunks.pop();
        }
        var raw = chunks.shift().toLowerCase();
        if (chunks.length) {
            raw += chunks.map(function (c) { return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase(); }).join('');
        }
        return postfix ? raw + "_" + postfix : raw;
    }
    exports.formatI18nPlaceholderName = formatI18nPlaceholderName;
    function getTranslationConstPrefix(fileBasedSuffix) {
        return ("" + TRANSLATION_PREFIX + fileBasedSuffix).toUpperCase();
    }
    exports.getTranslationConstPrefix = getTranslationConstPrefix;
    /**
     * Generates translation declaration statements.
     *
     * @param variable Translation value reference
     * @param message Text message to be translated
     * @param meta Object that contains meta information (id, meaning and description)
     * @param params Object with placeholders key-value pairs
     * @param transformFn Optional transformation (post processing) function reference
     * @returns Array of Statements that represent a given translation
     */
    function getTranslationDeclStmts(variable, message, meta, params, transformFn) {
        if (params === void 0) { params = {}; }
        var statements = [];
        var docStatements = i18nMetaToDocStmt(meta);
        if (docStatements) {
            statements.push(docStatements);
        }
        if (transformFn) {
            var raw = o.variable(variable.name + "_RAW");
            statements.push(i18nTranslationToDeclStmt(raw, message, params));
            statements.push(variable.set(transformFn(raw)).toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
        }
        else {
            statements.push(i18nTranslationToDeclStmt(variable, message, params));
        }
        return statements;
    }
    exports.getTranslationDeclStmts = getTranslationDeclStmts;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2NvbXBpbGVyL3NyYy9yZW5kZXIzL3ZpZXcvaTE4bi91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILDBEQUErQztJQUMvQyxrRUFBMkQ7SUFFM0Qsa0VBQW9EO0lBQ3BELDJEQUFnRDtJQUdoRCxzRUFBc0U7SUFDdEUsSUFBTSxrQkFBa0IsR0FBRyxNQUFNLENBQUM7SUFFbEMsaUVBQWlFO0lBQ2pFLElBQU0sWUFBWSxHQUFHLGFBQWEsQ0FBQztJQUVuQyxzRkFBc0Y7SUFDdEYsSUFBTSxpQkFBaUIsR0FBRyxtQkFBbUIsQ0FBQztJQUU5QywyRUFBMkU7SUFDM0UsSUFBTSx3QkFBd0IsR0FBRyxJQUFJLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBRS9ELG9DQUFvQztJQUNwQyxJQUFNLHNCQUFzQixHQUFHLEdBQUcsQ0FBQztJQUNuQyxJQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQztJQUUvQixtQ0FBbUM7SUFDdEIsUUFBQSxTQUFTLEdBQUcsTUFBTSxDQUFDO0lBQ25CLFFBQUEsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDO0lBRXhDLDZDQUE2QztJQUNoQyxRQUFBLG1CQUFtQixHQUFHLE1BQU0sQ0FBQztJQUUxQyxvREFBb0Q7SUFDdkMsUUFBQSx1QkFBdUIsR0FBRyxXQUFXLENBQUM7SUFFbkQsZ0RBQWdEO0lBQ25DLFFBQUEsdUJBQXVCLEdBQUcsR0FBRyxDQUFDO0lBUTNDLFNBQVMseUJBQXlCLENBQzlCLFFBQXVCLEVBQUUsT0FBZSxFQUN4QyxNQUF1QztRQUN6QyxJQUFNLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFpQixDQUFDLENBQUM7UUFDbEQsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUU7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QztJQUNwQixDQUFDO0lBbEJELDBEQWtCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaTE4biBmcm9tICcuLi8uLi8uLi9pMThuL2kxOG5fYXN0JztcbmltcG9ydCB7dG9QdWJsaWNOYW1lfSBmcm9tICcuLi8uLi8uLi9pMThuL3NlcmlhbGl6ZXJzL3htYic7XG5pbXBvcnQgKiBhcyBodG1sIGZyb20gJy4uLy4uLy4uL21sX3BhcnNlci9hc3QnO1xuaW1wb3J0IHttYXBMaXRlcmFsfSBmcm9tICcuLi8uLi8uLi9vdXRwdXQvbWFwX3V0aWwnO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5cblxuLyogQ2xvc3VyZSB2YXJpYWJsZXMgaG9sZGluZyBtZXNzYWdlcyBtdXN0IGJlIG5hbWVkIGBNU0dfW0EtWjAtOV0rYCAqL1xuY29uc3QgVFJBTlNMQVRJT05fUFJFRklYID0gJ01TR18nO1xuXG4vKiogQ2xvc3VyZSB1c2VzIGBnb29nLmdldE1zZyhtZXNzYWdlKWAgdG8gbG9va3VwIHRyYW5zbGF0aW9ucyAqL1xuY29uc3QgR09PR19HRVRfTVNHID0gJ2dvb2cuZ2V0TXNnJztcblxuLyoqIFN0cmluZyBrZXkgdGhhdCBpcyB1c2VkIHRvIHByb3ZpZGUgYmFja3VwIGlkIG9mIHRyYW5zbGF0YWJsZSBtZXNzYWdlIGluIENsb3N1cmUgKi9cbmNvbnN0IEJBQ0tVUF9NRVNTQUdFX0lEID0gJ0JBQ0tVUF9NRVNTQUdFX0lEJztcblxuLyoqIFJlZ2V4cCB0byBpZGVudGlmeSB3aGV0aGVyIGJhY2t1cCBpZCBhbHJlYWR5IHByb3ZpZGVkIGluIGRlc2NyaXB0aW9uICovXG5jb25zdCBCQUNLVVBfTUVTU0FHRV9JRF9SRUdFWFAgPSBuZXcgUmVnRXhwKEJBQ0tVUF9NRVNTQUdFX0lEKTtcblxuLyoqIEkxOG4gc2VwYXJhdG9ycyBmb3IgbWV0YWRhdGEgKiovXG5jb25zdCBJMThOX01FQU5JTkdfU0VQQVJBVE9SID0gJ3wnO1xuY29uc3QgSTE4Tl9JRF9TRVBBUkFUT1IgPSAnQEAnO1xuXG4vKiogTmFtZSBvZiB0aGUgaTE4biBhdHRyaWJ1dGVzICoqL1xuZXhwb3J0IGNvbnN0IEkxOE5fQVRUUiA9ICdpMThuJztcbmV4cG9ydCBjb25zdCBJMThOX0FUVFJfUFJFRklYID0gJ2kxOG4tJztcblxuLyoqIFByZWZpeCBvZiB2YXIgZXhwcmVzc2lvbnMgdXNlZCBpbiBJQ1VzICovXG5leHBvcnQgY29uc3QgSTE4Tl9JQ1VfVkFSX1BSRUZJWCA9ICdWQVJfJztcblxuLyoqIFByZWZpeCBvZiBJQ1UgZXhwcmVzc2lvbnMgZm9yIHBvc3QgcHJvY2Vzc2luZyAqL1xuZXhwb3J0IGNvbnN0IEkxOE5fSUNVX01BUFBJTkdfUFJFRklYID0gJ0kxOE5fRVhQXyc7XG5cbi8qKiBQbGFjZWhvbGRlciB3cmFwcGVyIGZvciBpMThuIGV4cHJlc3Npb25zICoqL1xuZXhwb3J0IGNvbnN0IEkxOE5fUExBQ0VIT0xERVJfU1lNQk9MID0gJ++/vSc7XG5cbmV4cG9ydCB0eXBlIEkxOG5NZXRhID0ge1xuICBpZD86IHN0cmluZyxcbiAgZGVzY3JpcHRpb24/OiBzdHJpbmcsXG4gIG1lYW5pbmc/OiBzdHJpbmdcbn07XG5cbmZ1bmN0aW9uIGkxOG5UcmFuc2xhdGlvblRvRGVjbFN0bXQoXG4gICAgdmFyaWFibGU6IG8uUmVhZFZhckV4cHIsIG1lc3NhZ2U6IHN0cmluZyxcbiAgICBwYXJhbXM/OiB7W25hbWU6IHN0cmluZ106IG8uRXhwcmVzc2lvbn0pOiBvLkRlY2xhcmVWYXJTdG10IHtcbiAgY29uc3QgYXJncyA9IFtvLmxpdGVyYWwobWVzc2FnZSkgYXMgby5FeHByZXNzaW9uXTtcbiAgaWYgKHBhcmFtcyAmJiBPYmplY3Qua2V5cyhwYXJhbXMpLmxlbmd0aCkge1xuICAgIGFyZ3MucHVzaChtYXBMaXRlcmFsKHBhcmFtcywgdHJ1ZSkpO1xuICB9XG4gIGNvbnN0IGZuQ2FsbCA9IG8udmFyaWFibGUoR09PR19HRVRfTVNHKS5jYWxsRm4oYXJncyk7XG4gIHJldHVybiB2YXJpYWJsZS5zZXQoZm5DYWxsKS50b0RlY2xTdG10KG8uSU5GRVJSRURfVFlQRSwgW28uU3RtdE1vZGlmaWVyLkZpbmFsXSk7XG59XG5cbi8vIENvbnZlcnRzIGkxOG4gbWV0YSBpbmZvcm1hdGlvbnMgZm9yIGEgbWVzc2FnZSAoaWQsIGRlc2NyaXB0aW9uLCBtZWFuaW5nKVxuLy8gdG8gYSBKc0RvYyBzdGF0ZW1lbnQgZm9ybWF0dGVkIGFzIGV4cGVjdGVkIGJ5IHRoZSBDbG9zdXJlIGNvbXBpbGVyLlxuZnVuY3Rpb24gaTE4bk1ldGFUb0RvY1N0bXQobWV0YTogSTE4bk1ldGEpOiBvLkpTRG9jQ29tbWVudFN0bXR8bnVsbCB7XG4gIGNvbnN0IHRhZ3M6IG8uSlNEb2NUYWdbXSA9IFtdO1xuICBjb25zdCB7aWQsIGRlc2NyaXB0aW9uLCBtZWFuaW5nfSA9IG1ldGE7XG4gIGlmIChpZCB8fCBkZXNjcmlwdGlvbikge1xuICAgIGNvbnN0IGhhc0JhY2t1cElkID0gISFkZXNjcmlwdGlvbiAmJiBCQUNLVVBfTUVTU0FHRV9JRF9SRUdFWFAudGVzdChkZXNjcmlwdGlvbik7XG4gICAgY29uc3QgdGV4dCA9XG4gICAgICAgIGlkICYmICFoYXNCYWNrdXBJZCA/IGBbJHtCQUNLVVBfTUVTU0FHRV9JRH06JHtpZH1dICR7ZGVzY3JpcHRpb24gfHwgJyd9YCA6IGRlc2NyaXB0aW9uO1xuICAgIHRhZ3MucHVzaCh7dGFnTmFtZTogby5KU0RvY1RhZ05hbWUuRGVzYywgdGV4dDogdGV4dCAhLnRyaW0oKX0pO1xuICB9XG4gIGlmIChtZWFuaW5nKSB7XG4gICAgdGFncy5wdXNoKHt0YWdOYW1lOiBvLkpTRG9jVGFnTmFtZS5NZWFuaW5nLCB0ZXh0OiBtZWFuaW5nfSk7XG4gIH1cbiAgcmV0dXJuIHRhZ3MubGVuZ3RoID09IDAgPyBudWxsIDogbmV3IG8uSlNEb2NDb21tZW50U3RtdCh0YWdzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSTE4bkF0dHJpYnV0ZShuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIG5hbWUgPT09IEkxOE5fQVRUUiB8fCBuYW1lLnN0YXJ0c1dpdGgoSTE4Tl9BVFRSX1BSRUZJWCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0kxOG5Sb290Tm9kZShtZXRhPzogaTE4bi5BU1QpOiBtZXRhIGlzIGkxOG4uTWVzc2FnZSB7XG4gIHJldHVybiBtZXRhIGluc3RhbmNlb2YgaTE4bi5NZXNzYWdlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTaW5nbGVJMThuSWN1KG1ldGE/OiBpMThuLkFTVCk6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNJMThuUm9vdE5vZGUobWV0YSkgJiYgbWV0YS5ub2Rlcy5sZW5ndGggPT09IDEgJiYgbWV0YS5ub2Rlc1swXSBpbnN0YW5jZW9mIGkxOG4uSWN1O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzSTE4bkF0dHJzKGVsZW1lbnQ6IGh0bWwuRWxlbWVudCk6IGJvb2xlYW4ge1xuICByZXR1cm4gZWxlbWVudC5hdHRycy5zb21lKChhdHRyOiBodG1sLkF0dHJpYnV0ZSkgPT4gaXNJMThuQXR0cmlidXRlKGF0dHIubmFtZSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWV0YUZyb21JMThuTWVzc2FnZShtZXNzYWdlOiBpMThuLk1lc3NhZ2UpOiBJMThuTWV0YSB7XG4gIHJldHVybiB7XG4gICAgaWQ6IG1lc3NhZ2UuaWQgfHwgJycsXG4gICAgbWVhbmluZzogbWVzc2FnZS5tZWFuaW5nIHx8ICcnLFxuICAgIGRlc2NyaXB0aW9uOiBtZXNzYWdlLmRlc2NyaXB0aW9uIHx8ICcnXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpY3VGcm9tSTE4bk1lc3NhZ2UobWVzc2FnZTogaTE4bi5NZXNzYWdlKSB7XG4gIHJldHVybiBtZXNzYWdlLm5vZGVzWzBdIGFzIGkxOG4uSWN1UGxhY2Vob2xkZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwSTE4blBsYWNlaG9sZGVyKGNvbnRlbnQ6IHN0cmluZyB8IG51bWJlciwgY29udGV4dElkOiBudW1iZXIgPSAwKTogc3RyaW5nIHtcbiAgY29uc3QgYmxvY2tJZCA9IGNvbnRleHRJZCA+IDAgPyBgOiR7Y29udGV4dElkfWAgOiAnJztcbiAgcmV0dXJuIGAke0kxOE5fUExBQ0VIT0xERVJfU1lNQk9MfSR7Y29udGVudH0ke2Jsb2NrSWR9JHtJMThOX1BMQUNFSE9MREVSX1NZTUJPTH1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNzZW1ibGVJMThuQm91bmRTdHJpbmcoXG4gICAgc3RyaW5nczogc3RyaW5nW10sIGJpbmRpbmdTdGFydEluZGV4OiBudW1iZXIgPSAwLCBjb250ZXh0SWQ6IG51bWJlciA9IDApOiBzdHJpbmcge1xuICBpZiAoIXN0cmluZ3MubGVuZ3RoKSByZXR1cm4gJyc7XG4gIGxldCBhY2MgPSAnJztcbiAgY29uc3QgbGFzdElkeCA9IHN0cmluZ3MubGVuZ3RoIC0gMTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYXN0SWR4OyBpKyspIHtcbiAgICBhY2MgKz0gYCR7c3RyaW5nc1tpXX0ke3dyYXBJMThuUGxhY2Vob2xkZXIoYmluZGluZ1N0YXJ0SW5kZXggKyBpLCBjb250ZXh0SWQpfWA7XG4gIH1cbiAgYWNjICs9IHN0cmluZ3NbbGFzdElkeF07XG4gIHJldHVybiBhY2M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZXFOdW1iZXJHZW5lcmF0b3Ioc3RhcnRzQXQ6IG51bWJlciA9IDApOiAoKSA9PiBudW1iZXIge1xuICBsZXQgY3VycmVudCA9IHN0YXJ0c0F0O1xuICByZXR1cm4gKCkgPT4gY3VycmVudCsrO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGxhY2Vob2xkZXJzVG9QYXJhbXMocGxhY2Vob2xkZXJzOiBNYXA8c3RyaW5nLCBzdHJpbmdbXT4pOlxuICAgIHtbbmFtZTogc3RyaW5nXTogby5FeHByZXNzaW9ufSB7XG4gIGNvbnN0IHBhcmFtczoge1tuYW1lOiBzdHJpbmddOiBvLkV4cHJlc3Npb259ID0ge307XG4gIHBsYWNlaG9sZGVycy5mb3JFYWNoKCh2YWx1ZXM6IHN0cmluZ1tdLCBrZXk6IHN0cmluZykgPT4ge1xuICAgIHBhcmFtc1trZXldID0gby5saXRlcmFsKHZhbHVlcy5sZW5ndGggPiAxID8gYFske3ZhbHVlcy5qb2luKCd8Jyl9XWAgOiB2YWx1ZXNbMF0pO1xuICB9KTtcbiAgcmV0dXJuIHBhcmFtcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVBsYWNlaG9sZGVyTWFwKG1hcDogTWFwPHN0cmluZywgYW55W10+LCBuYW1lOiBzdHJpbmcsIC4uLnZhbHVlczogYW55W10pIHtcbiAgY29uc3QgY3VycmVudCA9IG1hcC5nZXQobmFtZSkgfHwgW107XG4gIGN1cnJlbnQucHVzaCguLi52YWx1ZXMpO1xuICBtYXAuc2V0KG5hbWUsIGN1cnJlbnQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNzZW1ibGVCb3VuZFRleHRQbGFjZWhvbGRlcnMoXG4gICAgbWV0YTogaTE4bi5BU1QsIGJpbmRpbmdTdGFydEluZGV4OiBudW1iZXIgPSAwLCBjb250ZXh0SWQ6IG51bWJlciA9IDApOiBNYXA8c3RyaW5nLCBhbnlbXT4ge1xuICBjb25zdCBzdGFydElkeCA9IGJpbmRpbmdTdGFydEluZGV4O1xuICBjb25zdCBwbGFjZWhvbGRlcnMgPSBuZXcgTWFwPHN0cmluZywgYW55PigpO1xuICBjb25zdCBub2RlID1cbiAgICAgIG1ldGEgaW5zdGFuY2VvZiBpMThuLk1lc3NhZ2UgPyBtZXRhLm5vZGVzLmZpbmQobm9kZSA9PiBub2RlIGluc3RhbmNlb2YgaTE4bi5Db250YWluZXIpIDogbWV0YTtcbiAgaWYgKG5vZGUpIHtcbiAgICAobm9kZSBhcyBpMThuLkNvbnRhaW5lcilcbiAgICAgICAgLmNoaWxkcmVuLmZpbHRlcigoY2hpbGQ6IGkxOG4uTm9kZSkgPT4gY2hpbGQgaW5zdGFuY2VvZiBpMThuLlBsYWNlaG9sZGVyKVxuICAgICAgICAuZm9yRWFjaCgoY2hpbGQ6IGkxOG4uUGxhY2Vob2xkZXIsIGlkeDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgY29uc3QgY29udGVudCA9IHdyYXBJMThuUGxhY2Vob2xkZXIoc3RhcnRJZHggKyBpZHgsIGNvbnRleHRJZCk7XG4gICAgICAgICAgdXBkYXRlUGxhY2Vob2xkZXJNYXAocGxhY2Vob2xkZXJzLCBjaGlsZC5uYW1lLCBjb250ZW50KTtcbiAgICAgICAgfSk7XG4gIH1cbiAgcmV0dXJuIHBsYWNlaG9sZGVycztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRJbmRleChpdGVtczogYW55W10sIGNhbGxiYWNrOiAoaXRlbTogYW55KSA9PiBib29sZWFuKTogbnVtYmVyIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChjYWxsYmFjayhpdGVtc1tpXSkpIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbi8qKlxuICogUGFyc2VzIGkxOG4gbWV0YXMgbGlrZTpcbiAqICAtIFwiQEBpZFwiLFxuICogIC0gXCJkZXNjcmlwdGlvbltAQGlkXVwiLFxuICogIC0gXCJtZWFuaW5nfGRlc2NyaXB0aW9uW0BAaWRdXCJcbiAqIGFuZCByZXR1cm5zIGFuIG9iamVjdCB3aXRoIHBhcnNlZCBvdXRwdXQuXG4gKlxuICogQHBhcmFtIG1ldGEgU3RyaW5nIHRoYXQgcmVwcmVzZW50cyBpMThuIG1ldGFcbiAqIEByZXR1cm5zIE9iamVjdCB3aXRoIGlkLCBtZWFuaW5nIGFuZCBkZXNjcmlwdGlvbiBmaWVsZHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlSTE4bk1ldGEobWV0YT86IHN0cmluZyk6IEkxOG5NZXRhIHtcbiAgbGV0IGlkOiBzdHJpbmd8dW5kZWZpbmVkO1xuICBsZXQgbWVhbmluZzogc3RyaW5nfHVuZGVmaW5lZDtcbiAgbGV0IGRlc2NyaXB0aW9uOiBzdHJpbmd8dW5kZWZpbmVkO1xuXG4gIGlmIChtZXRhKSB7XG4gICAgY29uc3QgaWRJbmRleCA9IG1ldGEuaW5kZXhPZihJMThOX0lEX1NFUEFSQVRPUik7XG4gICAgY29uc3QgZGVzY0luZGV4ID0gbWV0YS5pbmRleE9mKEkxOE5fTUVBTklOR19TRVBBUkFUT1IpO1xuICAgIGxldCBtZWFuaW5nQW5kRGVzYzogc3RyaW5nO1xuICAgIFttZWFuaW5nQW5kRGVzYywgaWRdID1cbiAgICAgICAgKGlkSW5kZXggPiAtMSkgPyBbbWV0YS5zbGljZSgwLCBpZEluZGV4KSwgbWV0YS5zbGljZShpZEluZGV4ICsgMildIDogW21ldGEsICcnXTtcbiAgICBbbWVhbmluZywgZGVzY3JpcHRpb25dID0gKGRlc2NJbmRleCA+IC0xKSA/XG4gICAgICAgIFttZWFuaW5nQW5kRGVzYy5zbGljZSgwLCBkZXNjSW5kZXgpLCBtZWFuaW5nQW5kRGVzYy5zbGljZShkZXNjSW5kZXggKyAxKV0gOlxuICAgICAgICBbJycsIG1lYW5pbmdBbmREZXNjXTtcbiAgfVxuXG4gIHJldHVybiB7aWQsIG1lYW5pbmcsIGRlc2NyaXB0aW9ufTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBpbnRlcm5hbCBwbGFjZWhvbGRlciBuYW1lcyB0byBwdWJsaWMtZmFjaW5nIGZvcm1hdFxuICogKGZvciBleGFtcGxlIHRvIHVzZSBpbiBnb29nLmdldE1zZyBjYWxsKS5cbiAqIEV4YW1wbGU6IGBTVEFSVF9UQUdfRElWXzFgIGlzIGNvbnZlcnRlZCB0byBgc3RhcnRUYWdEaXZfMWAuXG4gKlxuICogQHBhcmFtIG5hbWUgVGhlIHBsYWNlaG9sZGVyIG5hbWUgdGhhdCBzaG91bGQgYmUgZm9ybWF0dGVkXG4gKiBAcmV0dXJucyBGb3JtYXR0ZWQgcGxhY2Vob2xkZXIgbmFtZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0STE4blBsYWNlaG9sZGVyTmFtZShuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBjaHVua3MgPSB0b1B1YmxpY05hbWUobmFtZSkuc3BsaXQoJ18nKTtcbiAgaWYgKGNodW5rcy5sZW5ndGggPT09IDEpIHtcbiAgICAvLyBpZiBubyBcIl9cIiBmb3VuZCAtIGp1c3QgbG93ZXJjYXNlIHRoZSB2YWx1ZVxuICAgIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKCk7XG4gIH1cbiAgbGV0IHBvc3RmaXg7XG4gIC8vIGVqZWN0IGxhc3QgZWxlbWVudCBpZiBpdCdzIGEgbnVtYmVyXG4gIGlmICgvXlxcZCskLy50ZXN0KGNodW5rc1tjaHVua3MubGVuZ3RoIC0gMV0pKSB7XG4gICAgcG9zdGZpeCA9IGNodW5rcy5wb3AoKTtcbiAgfVxuICBsZXQgcmF3ID0gY2h1bmtzLnNoaWZ0KCkgIS50b0xvd2VyQ2FzZSgpO1xuICBpZiAoY2h1bmtzLmxlbmd0aCkge1xuICAgIHJhdyArPSBjaHVua3MubWFwKGMgPT4gYy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGMuc2xpY2UoMSkudG9Mb3dlckNhc2UoKSkuam9pbignJyk7XG4gIH1cbiAgcmV0dXJuIHBvc3RmaXggPyBgJHtyYXd9XyR7cG9zdGZpeH1gIDogcmF3O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJhbnNsYXRpb25Db25zdFByZWZpeChmaWxlQmFzZWRTdWZmaXg6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBgJHtUUkFOU0xBVElPTl9QUkVGSVh9JHtmaWxlQmFzZWRTdWZmaXh9YC50b1VwcGVyQ2FzZSgpO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyB0cmFuc2xhdGlvbiBkZWNsYXJhdGlvbiBzdGF0ZW1lbnRzLlxuICpcbiAqIEBwYXJhbSB2YXJpYWJsZSBUcmFuc2xhdGlvbiB2YWx1ZSByZWZlcmVuY2VcbiAqIEBwYXJhbSBtZXNzYWdlIFRleHQgbWVzc2FnZSB0byBiZSB0cmFuc2xhdGVkXG4gKiBAcGFyYW0gbWV0YSBPYmplY3QgdGhhdCBjb250YWlucyBtZXRhIGluZm9ybWF0aW9uIChpZCwgbWVhbmluZyBhbmQgZGVzY3JpcHRpb24pXG4gKiBAcGFyYW0gcGFyYW1zIE9iamVjdCB3aXRoIHBsYWNlaG9sZGVycyBrZXktdmFsdWUgcGFpcnNcbiAqIEBwYXJhbSB0cmFuc2Zvcm1GbiBPcHRpb25hbCB0cmFuc2Zvcm1hdGlvbiAocG9zdCBwcm9jZXNzaW5nKSBmdW5jdGlvbiByZWZlcmVuY2VcbiAqIEByZXR1cm5zIEFycmF5IG9mIFN0YXRlbWVudHMgdGhhdCByZXByZXNlbnQgYSBnaXZlbiB0cmFuc2xhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJhbnNsYXRpb25EZWNsU3RtdHMoXG4gICAgdmFyaWFibGU6IG8uUmVhZFZhckV4cHIsIG1lc3NhZ2U6IHN0cmluZywgbWV0YTogSTE4bk1ldGEsXG4gICAgcGFyYW1zOiB7W25hbWU6IHN0cmluZ106IG8uRXhwcmVzc2lvbn0gPSB7fSxcbiAgICB0cmFuc2Zvcm1Gbj86IChyYXc6IG8uUmVhZFZhckV4cHIpID0+IG8uRXhwcmVzc2lvbik6IG8uU3RhdGVtZW50W10ge1xuICBjb25zdCBzdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdID0gW107XG4gIGNvbnN0IGRvY1N0YXRlbWVudHMgPSBpMThuTWV0YVRvRG9jU3RtdChtZXRhKTtcbiAgaWYgKGRvY1N0YXRlbWVudHMpIHtcbiAgICBzdGF0ZW1lbnRzLnB1c2goZG9jU3RhdGVtZW50cyk7XG4gIH1cbiAgaWYgKHRyYW5zZm9ybUZuKSB7XG4gICAgY29uc3QgcmF3ID0gby52YXJpYWJsZShgJHt2YXJpYWJsZS5uYW1lfV9SQVdgKTtcbiAgICBzdGF0ZW1lbnRzLnB1c2goaTE4blRyYW5zbGF0aW9uVG9EZWNsU3RtdChyYXcsIG1lc3NhZ2UsIHBhcmFtcykpO1xuICAgIHN0YXRlbWVudHMucHVzaChcbiAgICAgICAgdmFyaWFibGUuc2V0KHRyYW5zZm9ybUZuKHJhdykpLnRvRGVjbFN0bXQoby5JTkZFUlJFRF9UWVBFLCBbby5TdG10TW9kaWZpZXIuRmluYWxdKSk7XG4gIH0gZWxzZSB7XG4gICAgc3RhdGVtZW50cy5wdXNoKGkxOG5UcmFuc2xhdGlvblRvRGVjbFN0bXQodmFyaWFibGUsIG1lc3NhZ2UsIHBhcmFtcykpO1xuICB9XG4gIHJldHVybiBzdGF0ZW1lbnRzO1xufSJdfQ==