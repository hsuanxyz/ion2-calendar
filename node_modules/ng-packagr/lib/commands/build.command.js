"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const packagr_1 = require("../ng-v5/packagr");
/**
 * Command running an "one-off" build.
 *
 * @stable
 */
exports.build = opts => packagr_1.ngPackagr()
    .forProject(opts.project)
    .build();
//# sourceMappingURL=build.command.js.map