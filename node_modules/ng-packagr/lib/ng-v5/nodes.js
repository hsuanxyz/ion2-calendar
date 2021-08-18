"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("../brocc/node");
const select_1 = require("../brocc/select");
exports.TYPE_NG_PACKAGE = 'application/ng-package';
exports.TYPE_NG_ENTRY_POINT = 'application/ng-entry-point';
exports.TYPE_STYLESHEET = 'text/css';
exports.TYPE_TEMPLATE = 'text/html';
exports.TYPE_TS_SOURCES = 'application/ts';
/** A node that can be read through the `fs` api. */
exports.URL_PROTOCOL_FILE = 'file://';
/** A node that can be read through the `ts` compiler api. */
exports.URL_PROTOCOL_TS = 'ts://';
/** A node specific to angular. */
exports.URL_PROTOCOL_NG = 'ng://';
function isEntryPoint(node) {
    return node.type === exports.TYPE_NG_ENTRY_POINT;
}
exports.isEntryPoint = isEntryPoint;
function isPackage(node) {
    return node.type === exports.TYPE_NG_PACKAGE;
}
exports.isPackage = isPackage;
function isStylesheet(node) {
    return node.type === exports.TYPE_STYLESHEET;
}
exports.isStylesheet = isStylesheet;
function isTemplate(node) {
    return node.type === exports.TYPE_TEMPLATE;
}
exports.isTemplate = isTemplate;
function isTypeScriptSources(node) {
    return node.type === exports.TYPE_TS_SOURCES;
}
exports.isTypeScriptSources = isTypeScriptSources;
function byEntryPoint() {
    return select_1.by(isEntryPoint);
}
exports.byEntryPoint = byEntryPoint;
function isEntryPointInProgress() {
    return select_1.by(isEntryPoint).and(select_1.isInProgress);
}
exports.isEntryPointInProgress = isEntryPointInProgress;
function isFileUrl(value) {
    return value.startsWith(exports.URL_PROTOCOL_FILE);
}
exports.isFileUrl = isFileUrl;
function fileUrl(path) {
    return `${exports.URL_PROTOCOL_FILE}${path}`;
}
exports.fileUrl = fileUrl;
function fileUrlPath(url) {
    if (url.startsWith(exports.URL_PROTOCOL_FILE)) {
        return url.substring(exports.URL_PROTOCOL_FILE.length);
    }
}
exports.fileUrlPath = fileUrlPath;
function ngUrl(path) {
    return `${exports.URL_PROTOCOL_NG}${path}`;
}
exports.ngUrl = ngUrl;
function isTsUrl(value) {
    return value.startsWith(exports.URL_PROTOCOL_TS);
}
exports.isTsUrl = isTsUrl;
function tsUrl(path) {
    return `${exports.URL_PROTOCOL_TS}${path}`;
}
exports.tsUrl = tsUrl;
class EntryPointNode extends node_1.Node {
    constructor() {
        super(...arguments);
        this.type = exports.TYPE_NG_ENTRY_POINT;
    }
}
exports.EntryPointNode = EntryPointNode;
class PackageNode extends node_1.Node {
    constructor() {
        super(...arguments);
        this.type = exports.TYPE_NG_PACKAGE;
    }
}
exports.PackageNode = PackageNode;
class StylesheetNode extends node_1.Node {
    constructor() {
        super(...arguments);
        this.type = exports.TYPE_STYLESHEET;
    }
}
exports.StylesheetNode = StylesheetNode;
class TemplateNode extends node_1.Node {
    constructor() {
        super(...arguments);
        this.type = exports.TYPE_TEMPLATE;
    }
}
exports.TemplateNode = TemplateNode;
class TypeScriptSourceNode extends node_1.Node {
    constructor() {
        super(...arguments);
        this.type = exports.TYPE_TS_SOURCES;
    }
}
exports.TypeScriptSourceNode = TypeScriptSourceNode;
//# sourceMappingURL=nodes.js.map