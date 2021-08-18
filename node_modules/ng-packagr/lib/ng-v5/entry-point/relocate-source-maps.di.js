"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const injection_js_1 = require("injection-js");
const transform_di_1 = require("../../brocc/transform.di");
const relocate_source_maps_transform_1 = require("./relocate-source-maps.transform");
exports.RELOCATE_SOURCE_MAPS_TRANSFORM_TOKEN = new injection_js_1.InjectionToken(`ng.v5.relocateSourceMapsTransform`);
exports.RELOCATE_SOURCE_MAPS_TRANSFORM = transform_di_1.provideTransform({
    provide: exports.RELOCATE_SOURCE_MAPS_TRANSFORM_TOKEN,
    useFactory: () => relocate_source_maps_transform_1.relocateSourceMapsTransform
});
//# sourceMappingURL=relocate-source-maps.di.js.map