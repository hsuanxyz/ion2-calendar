/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InjectionToken } from '../di/injection_token';
import { Injector } from '../di/injector';
import { InjectFlags } from '../di/injector_compatibility';
import { Type } from '../type';
import { RelativeInjectorLocation } from './interfaces/injector';
import { TContainerNode, TElementContainerNode, TElementNode, TNode } from './interfaces/node';
import { LViewData, TData, TView } from './interfaces/view';
/**
 * Registers this directive as present in its node's injector by flipping the directive's
 * corresponding bit in the injector's bloom filter.
 *
 * @param injectorIndex The index of the node injector where this token should be registered
 * @param tView The TView for the injector's bloom filters
 * @param type The directive token to register
 */
export declare function bloomAdd(injectorIndex: number, tView: TView, type: Type<any> | InjectionToken<any>): void;
/**
 * Creates (or gets an existing) injector for a given element or container.
 *
 * @param tNode for which an injector should be retrieved / created.
 * @param hostView View where the node is stored
 * @returns Node injector
 */
export declare function getOrCreateNodeInjectorForNode(tNode: TElementNode | TContainerNode | TElementContainerNode, hostView: LViewData): number;
export declare function getInjectorIndex(tNode: TNode, hostView: LViewData): number;
/**
 * Finds the index of the parent injector, with a view offset if applicable. Used to set the
 * parent injector initially.
 *
 * Returns a combination of number of `ViewData` we have to go up and index in that `Viewdata`
 */
export declare function getParentInjectorLocation(tNode: TNode, view: LViewData): RelativeInjectorLocation;
/**
 * Makes a type or an injection token public to the DI system by adding it to an
 * injector's bloom filter.
 *
 * @param di The node injector in which a directive will be added
 * @param token The type or the injection token to be made public
 */
export declare function diPublicInInjector(injectorIndex: number, view: LViewData, token: InjectionToken<any> | Type<any>): void;
/**
 * Inject static attribute value into directive constructor.
 *
 * This method is used with `factory` functions which are generated as part of
 * `defineDirective` or `defineComponent`. The method retrieves the static value
 * of an attribute. (Dynamic attributes are not supported since they are not resolved
 *  at the time of injection and can change over time.)
 *
 * # Example
 * Given:
 * ```
 * @Component(...)
 * class MyComponent {
 *   constructor(@Attribute('title') title: string) { ... }
 * }
 * ```
 * When instantiated with
 * ```
 * <my-component title="Hello"></my-component>
 * ```
 *
 * Then factory method generated is:
 * ```
 * MyComponent.ngComponentDef = defineComponent({
 *   factory: () => new MyComponent(injectAttribute('title'))
 *   ...
 * })
 * ```
 *
 * @publicApi
 */
export declare function injectAttributeImpl(tNode: TNode, attrNameToInject: string): string | undefined;
/**
 * Returns the value associated to the given token from the NodeInjectors => ModuleInjector.
 *
 * Look for the injector providing the token by walking up the node injector tree and then
 * the module injector tree.
 *
 * @param nodeInjector Node injector where the search should start
 * @param token The token to look for
 * @param flags Injection flags
 * @returns the value from the injector or `null` when not found
 */
export declare function getOrCreateInjectable<T>(tNode: TElementNode | TContainerNode | TElementContainerNode, lViewData: LViewData, token: Type<T> | InjectionToken<T>, flags?: InjectFlags, notFoundValue?: any): T | null;
/**
* Retrieve or instantiate the injectable from the `lData` at particular `index`.
*
* This function checks to see if the value has already been instantiated and if so returns the
* cached `injectable`. Otherwise if it detects that the value is still a factory it
* instantiates the `injectable` and caches the value.
*/
export declare function getNodeInjectable(tData: TData, lData: LViewData, index: number, tNode: TElementNode): any;
/**
 * Returns the bit in an injector's bloom filter that should be used to determine whether or not
 * the directive might be provided by the injector.
 *
 * When a directive is public, it is added to the bloom filter and given a unique ID that can be
 * retrieved on the Type. When the directive isn't public or the token is not a directive `null`
 * is returned as the node injector can not possibly provide that token.
 *
 * @param token the injection token
 * @returns the matching bit to check in the bloom filter or `null` if the token is not known.
 */
export declare function bloomHashBitOrFactory(token: Type<any> | InjectionToken<any>): number | Function | undefined;
export declare function bloomHasToken(bloomHash: number, injectorIndex: number, injectorView: LViewData | TData): boolean;
export declare function injectInjector(): NodeInjector;
export declare class NodeInjector implements Injector {
    private _tNode;
    private _hostView;
    private _injectorIndex;
    constructor(_tNode: TElementNode | TContainerNode | TElementContainerNode, _hostView: LViewData);
    get(token: any): any;
}
export declare function getFactoryOf<T>(type: Type<any>): ((type: Type<T> | null) => T) | null;
export declare function getInheritedFactory<T>(type: Type<any>): (type: Type<T>) => T;
