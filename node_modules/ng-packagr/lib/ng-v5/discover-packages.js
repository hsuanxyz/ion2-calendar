"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const json_schema_1 = require("@ngtools/json-schema");
const fs_extra_1 = require("fs-extra");
const glob = require("glob");
const path = require("path");
const log = require("../util/log");
const path_1 = require("../util/path");
const entry_point_1 = require("../ng-package-format/entry-point");
const package_1 = require("../ng-package-format/package");
const ngPackageSchemaJson = require('../../ng-package.schema.json');
/** Creates a SchemaClass for `NgPackageConfig` */
const NgPackageSchemaClass = json_schema_1.SchemaClassFactory(ngPackageSchemaJson);
/** Instantiates a concrete schema from `NgPackageConfig` */
const instantiateSchemaClass = (ngPackageJson) => new NgPackageSchemaClass(ngPackageJson);
const fileExists = (pathLike) => __awaiter(this, void 0, void 0, function* () { return (yield fs_extra_1.pathExists(pathLike)) && (yield fs_extra_1.lstat(pathLike)).isFile(); });
/**
 * Resolves a user's package by testing for 'package.json', 'ng-package.json', or 'ng-package.js'.
 *
 * @param folderPathOrFilePath A path pointing either to a file or a directory
 * @return The user's package
 */
const resolveUserPackage = (folderPathOrFilePath) => __awaiter(this, void 0, void 0, function* () {
    const pathStats = yield fs_extra_1.lstat(folderPathOrFilePath);
    const fullPath = path.isAbsolute(folderPathOrFilePath) ? folderPathOrFilePath : path.resolve(folderPathOrFilePath);
    const basePath = pathStats.isDirectory() ? fullPath : path.dirname(fullPath);
    const packageJson = yield fs_extra_1.readJson(path.join(basePath, 'package.json'));
    const ngPackageJsonPath = path.join(basePath, 'ng-package.json');
    const ngPackageJsPath = path.join(basePath, 'ng-package.js');
    let ngPackageJson;
    if (packageJson['ngPackage']) {
        // Read `ngPackage` from `package.json`
        ngPackageJson = Object.assign({}, packageJson['ngPackage']);
    }
    else if (yield fileExists(ngPackageJsonPath)) {
        // Read 'ng-package.json' file
        ngPackageJson = yield fs_extra_1.readJson(ngPackageJsonPath);
    }
    else if (yield fileExists(ngPackageJsPath)) {
        // Dynamic `require('<path>') the given file
        ngPackageJson = yield Promise.resolve().then(() => require(ngPackageJsPath));
    }
    if (ngPackageJson) {
        return {
            basePath,
            packageJson,
            ngPackageJson
        };
    }
    if (pathStats.isDirectory()) {
        // return even if it's undefined and use defaults when it's not a file
        return undefined;
    }
    if (pathStats.isFile()) {
        // a project file was specified but was in valid
        if (path.basename(folderPathOrFilePath) === 'package.json') {
            throw new Error(`Cannot read a package from 'package.json' without 'ngPackage' property.`);
        }
        throw new Error(`Trying to read a package from unsupported file extension. Path=${folderPathOrFilePath}`);
    }
    throw new Error(`Cannot discover package sources at ${folderPathOrFilePath}`);
});
/** Reads a primary entry point from it's package file. */
const primaryEntryPoint = ({ packageJson, ngPackageJson, basePath }) => new entry_point_1.NgEntryPoint(packageJson, ngPackageJson, instantiateSchemaClass(ngPackageJson), basePath);
/**
 * Scans `directoryPath` and sub-folders, looking for `package.json` files.
 * Similar to `find ${directoryPath} --name package.json --exec dirname {}`.
 *
 * @param directoryPath Path pointing to a directory
 * @param excludeFolder A sub-folder of `directoryPath` that is excluded from search results.
 */
const findSecondaryPackagesPaths = (directoryPath, excludeFolder) => __awaiter(this, void 0, void 0, function* () {
    let excludedFolders = [
        'node_modules',
        'dist',
        '.ng_build',
        '.ng_pkg_build',
        path.resolve(directoryPath, excludeFolder)
    ];
    const EXCLUDE_FOLDERS = [];
    for (let folder of excludedFolders) {
        EXCLUDE_FOLDERS.push(`**/${folder}/**/package.json`);
        EXCLUDE_FOLDERS.push(`**/${folder}/**/ng-package.json`);
    }
    EXCLUDE_FOLDERS.push(directoryPath + '/package.json');
    EXCLUDE_FOLDERS.push(directoryPath + '/ng-package.json');
    return new Promise((resolve, reject) => {
        glob(`${directoryPath}/**/*package.json`, { ignore: EXCLUDE_FOLDERS, cwd: directoryPath }, (err, files) => {
            if (err) {
                reject(err);
            }
            resolve(files);
        });
    }).then(filePaths => Promise.all(filePaths.map(filePath => path.dirname(filePath)).filter((value, index, array) => array.indexOf(value) === index)));
});
/**
 * Reads a secondary entry point from it's package file.
 *
 * @param primaryDirectoryPath A path pointing to the directory of the primary entry point.
 * @param primary The primary entry point.
 */
const secondaryEntryPoint = (primaryDirectoryPath, primary, { packageJson, ngPackageJson, basePath }) => {
    if (path.resolve(basePath) === path.resolve(primaryDirectoryPath)) {
        log.error(`Cannot read secondary entry point. It's already a primary entry point. path=${basePath}`);
        throw new Error(`Secondary entry point is already a primary.`);
    }
    const relativeSourcePath = path.relative(primaryDirectoryPath, basePath);
    const secondaryModuleId = path_1.ensureUnixPath(`${primary.moduleId}/${relativeSourcePath}`);
    return new entry_point_1.NgEntryPoint(packageJson, ngPackageJson, instantiateSchemaClass(ngPackageJson), basePath, {
        moduleId: secondaryModuleId,
        destinationPath: path.resolve(primary.destinationPath, relativeSourcePath)
    });
};
exports.discoverPackages = ({ project }) => __awaiter(this, void 0, void 0, function* () {
    project = path.isAbsolute(project) ? project : path.resolve(project);
    const primaryPackage = yield resolveUserPackage(project);
    const primary = primaryEntryPoint(primaryPackage);
    log.debug(`Found primary entry point: ${primary.moduleId}`);
    const secondaries = yield findSecondaryPackagesPaths(primaryPackage.basePath, primary.$get('dest'))
        .then(folderPaths => Promise.all(folderPaths.map(folderPath => resolveUserPackage(folderPath).catch(() => {
        log.warn(`Cannot read secondary entry point at ${folderPath}. Skipping.`);
        return null;
    }))))
        .then(secondaryPackages => secondaryPackages
        .filter(value => !!value)
        .map(secondaryPackage => secondaryEntryPoint(primaryPackage.basePath, primary, secondaryPackage)));
    if (secondaries.length > 0) {
        log.debug(`Found secondary entry points: ${secondaries.map(e => e.moduleId).join(', ')}`);
    }
    return new package_1.NgPackage(primaryPackage.basePath, primary, secondaries);
});
//# sourceMappingURL=discover-packages.js.map