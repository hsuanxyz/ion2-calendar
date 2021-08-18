"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const injection_js_1 = require("injection-js");
const transform_di_1 = require("../../../brocc/transform.di");
const transform_sources_transform_1 = require("./transform-sources.transform");
exports.TRANSFORM_SOURCES_TOKEN = new injection_js_1.InjectionToken(`ng.v5.transformSourcesTransform`);
exports.TRANSFORM_SOURCES_TRANSFORM = transform_di_1.provideTransform({
    provide: exports.TRANSFORM_SOURCES_TOKEN,
    useFactory: () => transform_sources_transform_1.transformSourcesTransform
});
//# sourceMappingURL=transform-sources.di.js.map