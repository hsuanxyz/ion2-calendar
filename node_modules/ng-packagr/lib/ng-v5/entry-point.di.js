"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const injection_js_1 = require("injection-js");
const transform_di_1 = require("../brocc/transform.di");
const stylesheet_di_1 = require("./entry-point/resources/stylesheet.di");
const template_di_1 = require("./entry-point/resources/template.di");
const compile_ngc_di_1 = require("./entry-point/ts/compile-ngc.di");
const transform_sources_di_1 = require("./entry-point/ts/transform-sources.di");
const relocate_source_maps_di_1 = require("./entry-point/relocate-source-maps.di");
const write_bundles_di_1 = require("./entry-point/write-bundles.di");
const write_package_di_1 = require("./entry-point/write-package.di");
const entry_point_transform_1 = require("./entry-point.transform");
exports.ENTRY_POINT_TRANSFORM_TOKEN = new injection_js_1.InjectionToken(`ng.v5.entryPointTransform`);
exports.ENTRY_POINT_TRANSFORM = transform_di_1.provideTransform({
    provide: exports.ENTRY_POINT_TRANSFORM_TOKEN,
    useFactory: entry_point_transform_1.entryPointTransformFactory,
    deps: [
        stylesheet_di_1.STYLESHEET_TRANSFORM_TOKEN,
        template_di_1.TEMPLATE_TRANSFORM_TOKEN,
        transform_sources_di_1.TRANSFORM_SOURCES_TOKEN,
        compile_ngc_di_1.COMPILE_NGC_TOKEN,
        write_bundles_di_1.WRITE_BUNDLES_TRANSFORM_TOKEN,
        relocate_source_maps_di_1.RELOCATE_SOURCE_MAPS_TRANSFORM_TOKEN,
        write_package_di_1.WRITE_PACKAGE_TRANSFORM_TOKEN
    ]
});
exports.ENTRY_POINT_PROVIDERS = [
    exports.ENTRY_POINT_TRANSFORM,
    stylesheet_di_1.STYLESHEET_TRANSFORM,
    template_di_1.TEMPLATE_TRANSFORM,
    transform_sources_di_1.TRANSFORM_SOURCES_TRANSFORM,
    compile_ngc_di_1.COMPILE_NGC_TRANSFORM,
    relocate_source_maps_di_1.RELOCATE_SOURCE_MAPS_TRANSFORM,
    write_bundles_di_1.WRITE_BUNDLES_TRANSFORM,
    write_package_di_1.WRITE_PACKAGE_TRANSFORM
];
//# sourceMappingURL=entry-point.di.js.map