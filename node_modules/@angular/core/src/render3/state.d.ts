/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Sanitizer } from '../sanitization/security';
import { TElementNode, TNode, TViewNode } from './interfaces/node';
import { LQueries } from './interfaces/query';
import { Renderer3, RendererFactory3 } from './interfaces/renderer';
import { LViewData, OpaqueViewState, TView } from './interfaces/view';
export declare function getRenderer(): Renderer3;
export declare function setRenderer(r: Renderer3): void;
export declare function getRendererFactory(): RendererFactory3;
export declare function setRendererFactory(factory: RendererFactory3): void;
export declare function getCurrentSanitizer(): Sanitizer | null;
export declare function getElementDepthCount(): number;
export declare function increaseElementDepthCount(): void;
export declare function decreaseElementDepthCount(): void;
export declare function getBindingsEnabled(): boolean;
/**
 * Enables directive matching on elements.
 *
 *  * Example:
 * ```
 * <my-comp my-directive>
 *   Should match component / directive.
 * </my-comp>
 * <div ngNonBindable>
 *   <!-- disabledBindings() -->
 *   <my-comp my-directive>
 *     Should not match component / directive because we are in ngNonBindable.
 *   </my-comp>
 *   <!-- enableBindings() -->
 * </div>
 * ```
 */
export declare function enableBindings(): void;
/**
 * Disables directive matching on element.
 *
 *  * Example:
 * ```
 * <my-comp my-directive>
 *   Should match component / directive.
 * </my-comp>
 * <div ngNonBindable>
 *   <!-- disabledBindings() -->
 *   <my-comp my-directive>
 *     Should not match component / directive because we are in ngNonBindable.
 *   </my-comp>
 *   <!-- enableBindings() -->
 * </div>
 * ```
 */
export declare function disableBindings(): void;
/**
 * Returns the current OpaqueViewState instance.
 *
 * Used in conjunction with the restoreView() instruction to save a snapshot
 * of the current view and restore it when listeners are invoked. This allows
 * walking the declaration view tree in listeners to get vars from parent views.
 */
export declare function getCurrentView(): OpaqueViewState;
export declare function _getViewData(): LViewData;
/**
 * Restores `contextViewData` to the given OpaqueViewState instance.
 *
 * Used in conjunction with the getCurrentView() instruction to save a snapshot
 * of the current view and restore it when listeners are invoked. This allows
 * walking the declaration view tree in listeners to get vars from parent views.
 *
 * @param viewToRestore The OpaqueViewState instance to restore.
 */
export declare function restoreView(viewToRestore: OpaqueViewState): void;
export declare function getPreviousOrParentTNode(): TNode;
export declare function setPreviousOrParentTNode(tNode: TNode): void;
export declare function setTNodeAndViewData(tNode: TNode, view: LViewData): void;
export declare function getIsParent(): boolean;
export declare function setIsParent(value: boolean): void;
export declare function getTView(): TView;
export declare function getCurrentQueries(): LQueries | null;
export declare function setCurrentQueries(queries: LQueries | null): void;
/**
 * Query instructions can ask for "current queries" in 2 different cases:
 * - when creating view queries (at the root of a component view, before any node is created - in
 * this case currentQueries points to view queries)
 * - when creating content queries (i.e. this previousOrParentTNode points to a node on which we
 * create content queries).
 */
export declare function getOrCreateCurrentQueries(QueryType: {
    new (parent: null, shallow: null, deep: null): LQueries;
}): LQueries;
export declare function getCreationMode(): boolean;
/**
 * Internal function that returns the current LViewData instance.
 *
 * The getCurrentView() instruction should be used for anything public.
 */
export declare function getViewData(): LViewData;
export declare function getContextViewData(): LViewData;
export declare function getCleanup(view: LViewData): any[];
export declare function getTViewCleanup(view: LViewData): any[];
export declare function getCheckNoChangesMode(): boolean;
export declare function setCheckNoChangesMode(mode: boolean): void;
export declare function getFirstTemplatePass(): boolean;
export declare function setFirstTemplatePass(value: boolean): void;
export declare function getBindingRoot(): number;
export declare function setBindingRoot(value: number): void;
/**
 * Swap the current state with a new state.
 *
 * For performance reasons we store the state in the top level of the module.
 * This way we minimize the number of properties to read. Whenever a new view
 * is entered we have to store the state for later, and when the view is
 * exited the state has to be restored
 *
 * @param newView New state to become active
 * @param host Element to which the View is a child of
 * @returns the previous state;
 */
export declare function enterView(newView: LViewData, hostTNode: TElementNode | TViewNode | null): LViewData;
export declare function nextContextImpl<T = any>(level?: number): T;
/**
 * Resets the application state.
 */
export declare function resetComponentState(): void;
/**
 * Used in lieu of enterView to make it clear when we are exiting a child view. This makes
 * the direction of traversal (up or down the view tree) a bit clearer.
 *
 * @param newView New state to become active
 * @param creationOnly An optional boolean to indicate that the view was processed in creation mode
 * only, i.e. the first update will be done later. Only possible for dynamically created views.
 */
export declare function leaveView(newView: LViewData, creationOnly?: boolean): void;
export declare function assertPreviousIsParent(): void;
export declare function assertHasParent(): void;
export declare function assertDataInRange(index: number, arr?: any[]): void;
export declare function assertDataNext(index: number, arr?: any[]): void;
