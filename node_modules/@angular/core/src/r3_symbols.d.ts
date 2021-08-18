/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export { InjectableDef, InjectorDef, defineInjectable, defineInjector } from './di/defs';
export { inject } from './di/injector_compatibility';
export { NgModuleDef, NgModuleDefWithMeta } from './metadata/ng_module';
export { defineNgModule } from './render3/definition';
export { setClassMetadata } from './render3/metadata';
export { NgModuleFactory } from './render3/ng_module_ref';
/**
 * The existence of this constant (in this particular file) informs the Angular compiler that the
 * current program is actually @angular/core, which needs to be compiled specially.
 */
export declare const ITS_JUST_ANGULAR = true;
