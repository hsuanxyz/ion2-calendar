"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
/**
 * An entry point - quoting Angular Package Format - is:
 *
 * > a module intended to be imported by the user. It is referenced by a unique module ID and
 * > exports the public API referenced by that module ID. An example is `@angular/core` or
 * > `@angular/core/testing`. Both entry points exist in the `@angular/core` package, but they
 * > export different symbols. A package can have many entry points.
 *
 * #### Public API, source file tree and build output
 *
 * An entry point serves as the root of a source tree.
 * The entry point's public API references one TypeScript source file (`*.ts`).
 * That source file, e.g. `public_api.ts`, references other source files who in turn may reference
 * other source files, thus creating a tree of source code files.
 * The source files may be TypeScript (`*.ts`), Templates (`.html`) or Stylesheets
 * (`.css`, `.scss`, ..), or other formats.
 *
 * The compilation process for an entry point is a series of transformations applied to the source
 * files, e.g. TypeScript compilation, Inlining of Stylesheets and Templates, and so on.
 * As a result of the compilation process, an entry point is transpiled to a set of artefacts
 * (the build output) which include a FESM'15 Bundle, a FESM'5 Bundle, AoT metadata, TypeScript
 * type definitions, and so on.
 *
 * #### Representation in the domain
 *
 * The set of artefacts is reflected by `NgArtefacts`;
 * one `NgEntryPoint` relates to one `NgArtefacts`.
 * The parent package of an entry point is reflected by `NgPackage`.
 */
class NgEntryPoint {
    constructor(packageJson, ngPackageJson, $schema, basePath, secondaryData) {
        this.packageJson = packageJson;
        this.ngPackageJson = ngPackageJson;
        this.$schema = $schema;
        this.basePath = basePath;
        this.secondaryData = secondaryData;
    }
    /** Absolute file path of the entry point's source code entry file. */
    get entryFilePath() {
        return path.resolve(this.basePath, this.entryFile);
    }
    /** Absolute directory path of the entry point's 'package.json'. */
    get destinationPath() {
        if (this.secondaryData) {
            return this.secondaryData.destinationPath;
        }
        else {
            return path.resolve(this.basePath, this.$get('dest'));
        }
    }
    $get(key) {
        return this.$schema.$$get(key);
    }
    get entryFile() {
        return this.$get('lib.entryFile');
    }
    get cssUrl() {
        return this.$get('lib.cssUrl');
    }
    get umdModuleIds() {
        return this.$get('lib.umdModuleIds');
    }
    get embedded() {
        return this.$get('lib.embedded');
    }
    get comments() {
        return this.$get('lib.comments');
    }
    get licensePath() {
        if (this.$get('lib.licensePath')) {
            return path.resolve(this.basePath, this.$get('lib.licensePath'));
        }
        else {
            return this.$get('lib.licensePath');
        }
    }
    get jsxConfig() {
        return this.$get('lib.jsx');
    }
    get flatModuleFile() {
        return this.$get('lib.flatModuleFile') || this.flattenModuleId('-');
    }
    get styleIncludePaths() {
        // lib.sassIncludePaths retained for backwards compatability
        const includePaths = this.$get('lib.styleIncludePaths') || this.$get('lib.sassIncludePaths') || [];
        return includePaths.map(includePath => (path.isAbsolute(includePath) ? includePath : path.resolve(this.basePath, includePath)));
    }
    get languageLevel() {
        return this.$get('lib.languageLevel');
    }
    /**
     * The module ID is an "identifier of a module used in the import statements, e.g.
     * '@angular/core'. The ID often maps directly to a path on the filesystem, but this
     * is not always the case due to various module resolution strategies."
     */
    get moduleId() {
        if (this.secondaryData) {
            return this.secondaryData.moduleId;
        }
        else {
            return this.packageJson['name'];
        }
    }
    /**
     * The UMD module ID registers a module on the old-fashioned JavaScript global scope.
     * Used by UMD bundles only.
     * Example: `@my/foo/bar` registers as `global['my']['foo']['bar']`.
     */
    get umdId() {
        return this.$get('lib.umdId') || this.flattenModuleId();
    }
    /**
     * The AMD ID reflects a named module that is distributed in the UMD bundles.
     * @link http://requirejs.org/docs/whyamd.html#namedmodules
     */
    get amdId() {
        return this.$get('lib.amdId') || this.moduleId;
    }
    flattenModuleId(separator = '.') {
        if (this.moduleId.startsWith('@')) {
            return this.moduleId
                .substring(1)
                .split('/')
                .join(separator);
        }
        else {
            return this.moduleId.split('/').join(separator);
        }
    }
}
exports.NgEntryPoint = NgEntryPoint;
var CssUrl;
(function (CssUrl) {
    CssUrl["inline"] = "inline";
    CssUrl["none"] = "none";
})(CssUrl = exports.CssUrl || (exports.CssUrl = {}));
//# sourceMappingURL=entry-point.js.map