/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CanActivate, CanActivateChild, CanDeactivate, CanLoad } from '../interfaces';
import { UrlTree } from '../url_tree';
/**
 * Simple function check, but generic so type inference will flow. Example:
 *
 * function product(a: number, b: number) {
 *   return a * b;
 * }
 *
 * if (isFunction<product>(fn)) {
 *   return fn(1, 2);
 * } else {
 *   throw "Must provide the `product` function";
 * }
 */
export declare function isFunction<T>(v: any): v is T;
export declare function isBoolean(v: any): v is boolean;
export declare function isUrlTree(v: any): v is UrlTree;
export declare function isCanLoad(guard: any): guard is CanLoad;
export declare function isCanActivate(guard: any): guard is CanActivate;
export declare function isCanActivateChild(guard: any): guard is CanActivateChild;
export declare function isCanDeactivate<T>(guard: any): guard is CanDeactivate<T>;
