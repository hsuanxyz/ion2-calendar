"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cpx_1 = require("cpx");
const promisify_1 = require("./promisify");
const log_1 = require("./log");
exports.copyFiles = (src, dest, options) => {
    log_1.debug('copyFiles from ' + src + ' to ' + dest);
    return promisify_1.promisify((resolveOrReject) => {
        if (options) {
            cpx_1.copy(src, dest, options, resolveOrReject);
        }
        else {
            cpx_1.copy(src, dest, resolveOrReject);
        }
    });
};
//# sourceMappingURL=copy.js.map