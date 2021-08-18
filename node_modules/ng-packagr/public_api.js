"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Commands API
 */
__export(require("./lib/commands/command"));
__export(require("./lib/commands/build.command"));
__export(require("./lib/commands/version.command"));
/**
 * ngPackagr() programmatic API
 */
__export(require("./lib/ng-v5/packagr"));
/**
 * Angular-specifics for tsc and ngc
 */
var compile_source_files_1 = require("./lib/ngc/compile-source-files");
exports.compileSourceFiles = compile_source_files_1.compileSourceFiles;
var transform_source_files_1 = require("./lib/ngc/transform-source-files");
exports.transformSourceFiles = transform_source_files_1.transformSourceFiles;
var ng_component_transformer_1 = require("./lib/ts/ng-component-transformer");
exports.transformComponentSourceFiles = ng_component_transformer_1.transformComponentSourceFiles;
var ng_ts_ast_1 = require("./lib/ts/ng-ts-ast");
exports.isComponentDecorator = ng_ts_ast_1.isComponentDecorator;
exports.isStyleUrls = ng_ts_ast_1.isStyleUrls;
exports.isTemplateUrl = ng_ts_ast_1.isTemplateUrl;
var transform_component_1 = require("./lib/ts/transform-component");
exports.transformComponent = transform_component_1.transformComponent;
/**
 * Deprecations that are going to be removed in v3.
 */
__export(require("./lib/deprecations"));
//# sourceMappingURL=public_api.js.map