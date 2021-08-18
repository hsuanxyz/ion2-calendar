"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
exports.error = (err) => {
    if (err instanceof Error) {
        console.log('\n' + chalk_1.default.red('BUILD ERROR'));
        console.log(chalk_1.default.red(err.message));
        console.log(chalk_1.default.red(err.stack) + '\n');
    }
    else {
        console.log(chalk_1.default.red(err));
    }
};
exports.warn = (msg) => {
    console.log(chalk_1.default.yellow(msg));
};
exports.success = (msg) => {
    console.log(chalk_1.default.green(msg));
};
exports.info = (msg) => {
    console.log(chalk_1.default.blue(msg));
};
exports.debug = (msg) => {
    if (process.env.DEBUG) {
        console.log(chalk_1.default.inverse.cyan(`[debug] ${msg}`));
    }
};
//# sourceMappingURL=log.js.map