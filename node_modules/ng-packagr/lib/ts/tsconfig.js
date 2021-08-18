"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ng = require("@angular/compiler-cli");
const path = require("path");
const ts = require("typescript");
/**
 * Reads the default TypeScript configuration.
 */
function readDefaultTsConfig(fileName) {
    if (!fileName) {
        fileName = path.resolve(__dirname, 'conf', 'tsconfig.ngc.json');
    }
    return ng.readConfiguration(fileName);
}
exports.readDefaultTsConfig = readDefaultTsConfig;
/**
 * Creates a parsed TypeScript configuration object.
 *
 * @param values File path or parsed configuration.
 */
function createDefaultTsConfig(values) {
    if (!values) {
        return readDefaultTsConfig();
    }
    else if (typeof values === 'string') {
        return readDefaultTsConfig(values);
    }
    else {
        return values;
    }
}
exports.createDefaultTsConfig = createDefaultTsConfig;
/**
 * Initializes TypeScript Compiler options and Angular Compiler options by overriding the
 * default config with entry point-specific values.
 */
exports.initializeTsConfig = (defaultTsConfig, entryPoint, outDir) => {
    const basePath = path.dirname(entryPoint.entryFilePath);
    // Resolve defaults from DI token and create a deep copy of the defaults
    const tsConfig = JSON.parse(JSON.stringify(defaultTsConfig));
    tsConfig.rootNames = [entryPoint.entryFilePath];
    tsConfig.options.flatModuleId = entryPoint.moduleId;
    tsConfig.options.flatModuleOutFile = `${entryPoint.flatModuleFile}.js`;
    tsConfig.options.basePath = basePath;
    tsConfig.options.baseUrl = basePath;
    tsConfig.options.rootDir = basePath;
    tsConfig.options.outDir = basePath;
    tsConfig.options.genDir = outDir;
    if (entryPoint.languageLevel) {
        // ng.readConfiguration implicitly converts "es6" to "lib.es6.d.ts", etc.
        tsConfig.options.lib = entryPoint.languageLevel.map(lib => `lib.${lib}.d.ts`);
    }
    switch (entryPoint.jsxConfig) {
        case 'preserve':
            tsConfig.options.jsx = ts.JsxEmit.Preserve;
            break;
        case 'react':
            tsConfig.options.jsx = ts.JsxEmit.React;
            break;
        case 'react-native':
            tsConfig.options.jsx = ts.JsxEmit.ReactNative;
            break;
        default:
            break;
    }
    return tsConfig;
};
//# sourceMappingURL=tsconfig.js.map