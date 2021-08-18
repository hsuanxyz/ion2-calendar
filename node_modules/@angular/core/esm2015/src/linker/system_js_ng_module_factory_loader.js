/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, Optional } from '../di';
import { Compiler } from './compiler';
/** @type {?} */
const _SEPARATOR = '#';
/** @type {?} */
const FACTORY_CLASS_SUFFIX = 'NgFactory';
/**
 * Configuration for SystemJsNgModuleLoader.
 * token.
 *
 * \@publicApi
 * @abstract
 */
export class SystemJsNgModuleLoaderConfig {
}
if (false) {
    /**
     * Prefix to add when computing the name of the factory module for a given module name.
     * @type {?}
     */
    SystemJsNgModuleLoaderConfig.prototype.factoryPathPrefix;
    /**
     * Suffix to add when computing the name of the factory module for a given module name.
     * @type {?}
     */
    SystemJsNgModuleLoaderConfig.prototype.factoryPathSuffix;
}
/** @type {?} */
const DEFAULT_CONFIG = {
    factoryPathPrefix: '',
    factoryPathSuffix: '.ngfactory',
};
/**
 * NgModuleFactoryLoader that uses SystemJS to load NgModuleFactory
 * \@publicApi
 */
export class SystemJsNgModuleLoader {
    /**
     * @param {?} _compiler
     * @param {?=} config
     */
    constructor(_compiler, config) {
        this._compiler = _compiler;
        this._config = config || DEFAULT_CONFIG;
    }
    /**
     * @param {?} path
     * @return {?}
     */
    load(path) {
        /** @type {?} */
        const offlineMode = this._compiler instanceof Compiler;
        return offlineMode ? this.loadFactory(path) : this.loadAndCompile(path);
    }
    /**
     * @param {?} path
     * @return {?}
     */
    loadAndCompile(path) {
        let [module, exportName] = path.split(_SEPARATOR);
        if (exportName === undefined) {
            exportName = 'default';
        }
        return System.import(module)
            .then((module) => module[exportName])
            .then((type) => checkNotEmpty(type, module, exportName))
            .then((type) => this._compiler.compileModuleAsync(type));
    }
    /**
     * @param {?} path
     * @return {?}
     */
    loadFactory(path) {
        let [module, exportName] = path.split(_SEPARATOR);
        /** @type {?} */
        let factoryClassSuffix = FACTORY_CLASS_SUFFIX;
        if (exportName === undefined) {
            exportName = 'default';
            factoryClassSuffix = '';
        }
        return System.import(this._config.factoryPathPrefix + module + this._config.factoryPathSuffix)
            .then((module) => module[exportName + factoryClassSuffix])
            .then((factory) => checkNotEmpty(factory, module, exportName));
    }
}
SystemJsNgModuleLoader.decorators = [
    { type: Injectable }
];
/** @nocollapse */
SystemJsNgModuleLoader.ctorParameters = () => [
    { type: Compiler },
    { type: SystemJsNgModuleLoaderConfig, decorators: [{ type: Optional }] }
];
if (false) {
    /** @type {?} */
    SystemJsNgModuleLoader.prototype._config;
    /** @type {?} */
    SystemJsNgModuleLoader.prototype._compiler;
}
/**
 * @param {?} value
 * @param {?} modulePath
 * @param {?} exportName
 * @return {?}
 */
function checkNotEmpty(value, modulePath, exportName) {
    if (!value) {
        throw new Error(`Cannot find '${exportName}' in '${modulePath}'`);
    }
    return value;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtX2pzX25nX21vZHVsZV9mYWN0b3J5X2xvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2NvcmUvc3JjL2xpbmtlci9zeXN0ZW1fanNfbmdfbW9kdWxlX2ZhY3RvcnlfbG9hZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBU0EsT0FBTyxFQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUMsTUFBTSxPQUFPLENBQUM7QUFFM0MsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLFlBQVksQ0FBQzs7TUFJOUIsVUFBVSxHQUFHLEdBQUc7O01BRWhCLG9CQUFvQixHQUFHLFdBQVc7Ozs7Ozs7O0FBU3hDLE1BQU0sT0FBZ0IsNEJBQTRCO0NBWWpEOzs7Ozs7SUFQQyx5REFBNEI7Ozs7O0lBTTVCLHlEQUE0Qjs7O01BR3hCLGNBQWMsR0FBaUM7SUFDbkQsaUJBQWlCLEVBQUUsRUFBRTtJQUNyQixpQkFBaUIsRUFBRSxZQUFZO0NBQ2hDOzs7OztBQU9ELE1BQU0sT0FBTyxzQkFBc0I7Ozs7O0lBR2pDLFlBQW9CLFNBQW1CLEVBQWMsTUFBcUM7UUFBdEUsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQUNyQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sSUFBSSxjQUFjLENBQUM7SUFDMUMsQ0FBQzs7Ozs7SUFFRCxJQUFJLENBQUMsSUFBWTs7Y0FDVCxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsWUFBWSxRQUFRO1FBQ3RELE9BQU8sV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFFLENBQUM7Ozs7O0lBRU8sY0FBYyxDQUFDLElBQVk7WUFDN0IsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUM7UUFDakQsSUFBSSxVQUFVLEtBQUssU0FBUyxFQUFFO1lBQzVCLFVBQVUsR0FBRyxTQUFTLENBQUM7U0FDeEI7UUFFRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO2FBQ3ZCLElBQUksQ0FBQyxDQUFDLE1BQVcsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3pDLElBQUksQ0FBQyxDQUFDLElBQVMsRUFBRSxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7YUFDNUQsSUFBSSxDQUFDLENBQUMsSUFBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEUsQ0FBQzs7Ozs7SUFFTyxXQUFXLENBQUMsSUFBWTtZQUMxQixDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQzs7WUFDN0Msa0JBQWtCLEdBQUcsb0JBQW9CO1FBQzdDLElBQUksVUFBVSxLQUFLLFNBQVMsRUFBRTtZQUM1QixVQUFVLEdBQUcsU0FBUyxDQUFDO1lBQ3ZCLGtCQUFrQixHQUFHLEVBQUUsQ0FBQztTQUN6QjtRQUVELE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDO2FBQ3pGLElBQUksQ0FBQyxDQUFDLE1BQVcsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxrQkFBa0IsQ0FBQyxDQUFDO2FBQzlELElBQUksQ0FBQyxDQUFDLE9BQVksRUFBRSxFQUFFLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUMxRSxDQUFDOzs7WUFwQ0YsVUFBVTs7OztZQXRDSCxRQUFRO1lBMENnRCw0QkFBNEIsdUJBQWhELFFBQVE7Ozs7SUFGbEQseUNBQThDOztJQUVsQywyQ0FBMkI7Ozs7Ozs7O0FBbUN6QyxTQUFTLGFBQWEsQ0FBQyxLQUFVLEVBQUUsVUFBa0IsRUFBRSxVQUFrQjtJQUN2RSxJQUFJLENBQUMsS0FBSyxFQUFFO1FBQ1YsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsVUFBVSxTQUFTLFVBQVUsR0FBRyxDQUFDLENBQUM7S0FDbkU7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cblxuaW1wb3J0IHtJbmplY3RhYmxlLCBPcHRpb25hbH0gZnJvbSAnLi4vZGknO1xuXG5pbXBvcnQge0NvbXBpbGVyfSBmcm9tICcuL2NvbXBpbGVyJztcbmltcG9ydCB7TmdNb2R1bGVGYWN0b3J5fSBmcm9tICcuL25nX21vZHVsZV9mYWN0b3J5JztcbmltcG9ydCB7TmdNb2R1bGVGYWN0b3J5TG9hZGVyfSBmcm9tICcuL25nX21vZHVsZV9mYWN0b3J5X2xvYWRlcic7XG5cbmNvbnN0IF9TRVBBUkFUT1IgPSAnIyc7XG5cbmNvbnN0IEZBQ1RPUllfQ0xBU1NfU1VGRklYID0gJ05nRmFjdG9yeSc7XG5kZWNsYXJlIHZhciBTeXN0ZW06IGFueTtcblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIGZvciBTeXN0ZW1Kc05nTW9kdWxlTG9hZGVyLlxuICogdG9rZW4uXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU3lzdGVtSnNOZ01vZHVsZUxvYWRlckNvbmZpZyB7XG4gIC8qKlxuICAgKiBQcmVmaXggdG8gYWRkIHdoZW4gY29tcHV0aW5nIHRoZSBuYW1lIG9mIHRoZSBmYWN0b3J5IG1vZHVsZSBmb3IgYSBnaXZlbiBtb2R1bGUgbmFtZS5cbiAgICovXG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBmYWN0b3J5UGF0aFByZWZpeCAhOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFN1ZmZpeCB0byBhZGQgd2hlbiBjb21wdXRpbmcgdGhlIG5hbWUgb2YgdGhlIGZhY3RvcnkgbW9kdWxlIGZvciBhIGdpdmVuIG1vZHVsZSBuYW1lLlxuICAgKi9cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIGZhY3RvcnlQYXRoU3VmZml4ICE6IHN0cmluZztcbn1cblxuY29uc3QgREVGQVVMVF9DT05GSUc6IFN5c3RlbUpzTmdNb2R1bGVMb2FkZXJDb25maWcgPSB7XG4gIGZhY3RvcnlQYXRoUHJlZml4OiAnJyxcbiAgZmFjdG9yeVBhdGhTdWZmaXg6ICcubmdmYWN0b3J5Jyxcbn07XG5cbi8qKlxuICogTmdNb2R1bGVGYWN0b3J5TG9hZGVyIHRoYXQgdXNlcyBTeXN0ZW1KUyB0byBsb2FkIE5nTW9kdWxlRmFjdG9yeVxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgU3lzdGVtSnNOZ01vZHVsZUxvYWRlciBpbXBsZW1lbnRzIE5nTW9kdWxlRmFjdG9yeUxvYWRlciB7XG4gIHByaXZhdGUgX2NvbmZpZzogU3lzdGVtSnNOZ01vZHVsZUxvYWRlckNvbmZpZztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9jb21waWxlcjogQ29tcGlsZXIsIEBPcHRpb25hbCgpIGNvbmZpZz86IFN5c3RlbUpzTmdNb2R1bGVMb2FkZXJDb25maWcpIHtcbiAgICB0aGlzLl9jb25maWcgPSBjb25maWcgfHwgREVGQVVMVF9DT05GSUc7XG4gIH1cblxuICBsb2FkKHBhdGg6IHN0cmluZyk6IFByb21pc2U8TmdNb2R1bGVGYWN0b3J5PGFueT4+IHtcbiAgICBjb25zdCBvZmZsaW5lTW9kZSA9IHRoaXMuX2NvbXBpbGVyIGluc3RhbmNlb2YgQ29tcGlsZXI7XG4gICAgcmV0dXJuIG9mZmxpbmVNb2RlID8gdGhpcy5sb2FkRmFjdG9yeShwYXRoKSA6IHRoaXMubG9hZEFuZENvbXBpbGUocGF0aCk7XG4gIH1cblxuICBwcml2YXRlIGxvYWRBbmRDb21waWxlKHBhdGg6IHN0cmluZyk6IFByb21pc2U8TmdNb2R1bGVGYWN0b3J5PGFueT4+IHtcbiAgICBsZXQgW21vZHVsZSwgZXhwb3J0TmFtZV0gPSBwYXRoLnNwbGl0KF9TRVBBUkFUT1IpO1xuICAgIGlmIChleHBvcnROYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGV4cG9ydE5hbWUgPSAnZGVmYXVsdCc7XG4gICAgfVxuXG4gICAgcmV0dXJuIFN5c3RlbS5pbXBvcnQobW9kdWxlKVxuICAgICAgICAudGhlbigobW9kdWxlOiBhbnkpID0+IG1vZHVsZVtleHBvcnROYW1lXSlcbiAgICAgICAgLnRoZW4oKHR5cGU6IGFueSkgPT4gY2hlY2tOb3RFbXB0eSh0eXBlLCBtb2R1bGUsIGV4cG9ydE5hbWUpKVxuICAgICAgICAudGhlbigodHlwZTogYW55KSA9PiB0aGlzLl9jb21waWxlci5jb21waWxlTW9kdWxlQXN5bmModHlwZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBsb2FkRmFjdG9yeShwYXRoOiBzdHJpbmcpOiBQcm9taXNlPE5nTW9kdWxlRmFjdG9yeTxhbnk+PiB7XG4gICAgbGV0IFttb2R1bGUsIGV4cG9ydE5hbWVdID0gcGF0aC5zcGxpdChfU0VQQVJBVE9SKTtcbiAgICBsZXQgZmFjdG9yeUNsYXNzU3VmZml4ID0gRkFDVE9SWV9DTEFTU19TVUZGSVg7XG4gICAgaWYgKGV4cG9ydE5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZXhwb3J0TmFtZSA9ICdkZWZhdWx0JztcbiAgICAgIGZhY3RvcnlDbGFzc1N1ZmZpeCA9ICcnO1xuICAgIH1cblxuICAgIHJldHVybiBTeXN0ZW0uaW1wb3J0KHRoaXMuX2NvbmZpZy5mYWN0b3J5UGF0aFByZWZpeCArIG1vZHVsZSArIHRoaXMuX2NvbmZpZy5mYWN0b3J5UGF0aFN1ZmZpeClcbiAgICAgICAgLnRoZW4oKG1vZHVsZTogYW55KSA9PiBtb2R1bGVbZXhwb3J0TmFtZSArIGZhY3RvcnlDbGFzc1N1ZmZpeF0pXG4gICAgICAgIC50aGVuKChmYWN0b3J5OiBhbnkpID0+IGNoZWNrTm90RW1wdHkoZmFjdG9yeSwgbW9kdWxlLCBleHBvcnROYW1lKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tOb3RFbXB0eSh2YWx1ZTogYW55LCBtb2R1bGVQYXRoOiBzdHJpbmcsIGV4cG9ydE5hbWU6IHN0cmluZyk6IGFueSB7XG4gIGlmICghdmFsdWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBmaW5kICcke2V4cG9ydE5hbWV9JyBpbiAnJHttb2R1bGVQYXRofSdgKTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG4iXX0=