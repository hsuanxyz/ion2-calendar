/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
/**
 * Called when directives inject each other (creating a circular dependency)
 * @param {?} token
 * @return {?}
 */
export function throwCyclicDependencyError(token) {
    throw new Error(`Cannot instantiate cyclic dependency! ${token}`);
}
/**
 * Called when there are multiple component selectors that match a given node
 * @param {?} tNode
 * @return {?}
 */
export function throwMultipleComponentError(tNode) {
    throw new Error(`Multiple components match node with tagname ${tNode.tagName}`);
}
/**
 * Throws an ExpressionChangedAfterChecked error if checkNoChanges mode is on.
 * @param {?} creationMode
 * @param {?} checkNoChangesMode
 * @param {?} oldValue
 * @param {?} currValue
 * @return {?}
 */
export function throwErrorIfNoChangesMode(creationMode, checkNoChangesMode, oldValue, currValue) {
    if (checkNoChangesMode) {
        /** @type {?} */
        let msg = `ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value: '${oldValue}'. Current value: '${currValue}'.`;
        if (creationMode) {
            msg +=
                ` It seems like the view has been created after its parent and its children have been dirty checked.` +
                    ` Has it been created in a change detection hook ?`;
        }
        // TODO: include debug context
        throw new Error(msg);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9lcnJvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBV0EsTUFBTSxVQUFVLDBCQUEwQixDQUFDLEtBQVU7SUFDbkQsTUFBTSxJQUFJLEtBQUssQ0FBQyx5Q0FBeUMsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUNwRSxDQUFDOzs7Ozs7QUFHRCxNQUFNLFVBQVUsMkJBQTJCLENBQUMsS0FBWTtJQUN0RCxNQUFNLElBQUksS0FBSyxDQUFDLCtDQUErQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUNsRixDQUFDOzs7Ozs7Ozs7QUFHRCxNQUFNLFVBQVUseUJBQXlCLENBQ3JDLFlBQXFCLEVBQUUsa0JBQTJCLEVBQUUsUUFBYSxFQUFFLFNBQWM7SUFDbkYsSUFBSSxrQkFBa0IsRUFBRTs7WUFDbEIsR0FBRyxHQUNILDhHQUE4RyxRQUFRLHNCQUFzQixTQUFTLElBQUk7UUFDN0osSUFBSSxZQUFZLEVBQUU7WUFDaEIsR0FBRztnQkFDQyxxR0FBcUc7b0JBQ3JHLG1EQUFtRCxDQUFDO1NBQ3pEO1FBQ0QsOEJBQThCO1FBQzlCLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDdEI7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge1ROb2RlfSBmcm9tICcuL2ludGVyZmFjZXMvbm9kZSc7XG5cbi8qKiBDYWxsZWQgd2hlbiBkaXJlY3RpdmVzIGluamVjdCBlYWNoIG90aGVyIChjcmVhdGluZyBhIGNpcmN1bGFyIGRlcGVuZGVuY3kpICovXG5leHBvcnQgZnVuY3Rpb24gdGhyb3dDeWNsaWNEZXBlbmRlbmN5RXJyb3IodG9rZW46IGFueSk6IG5ldmVyIHtcbiAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgaW5zdGFudGlhdGUgY3ljbGljIGRlcGVuZGVuY3khICR7dG9rZW59YCk7XG59XG5cbi8qKiBDYWxsZWQgd2hlbiB0aGVyZSBhcmUgbXVsdGlwbGUgY29tcG9uZW50IHNlbGVjdG9ycyB0aGF0IG1hdGNoIGEgZ2l2ZW4gbm9kZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRocm93TXVsdGlwbGVDb21wb25lbnRFcnJvcih0Tm9kZTogVE5vZGUpOiBuZXZlciB7XG4gIHRocm93IG5ldyBFcnJvcihgTXVsdGlwbGUgY29tcG9uZW50cyBtYXRjaCBub2RlIHdpdGggdGFnbmFtZSAke3ROb2RlLnRhZ05hbWV9YCk7XG59XG5cbi8qKiBUaHJvd3MgYW4gRXhwcmVzc2lvbkNoYW5nZWRBZnRlckNoZWNrZWQgZXJyb3IgaWYgY2hlY2tOb0NoYW5nZXMgbW9kZSBpcyBvbi4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0aHJvd0Vycm9ySWZOb0NoYW5nZXNNb2RlKFxuICAgIGNyZWF0aW9uTW9kZTogYm9vbGVhbiwgY2hlY2tOb0NoYW5nZXNNb2RlOiBib29sZWFuLCBvbGRWYWx1ZTogYW55LCBjdXJyVmFsdWU6IGFueSk6IG5ldmVyfHZvaWQge1xuICBpZiAoY2hlY2tOb0NoYW5nZXNNb2RlKSB7XG4gICAgbGV0IG1zZyA9XG4gICAgICAgIGBFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEVycm9yOiBFeHByZXNzaW9uIGhhcyBjaGFuZ2VkIGFmdGVyIGl0IHdhcyBjaGVja2VkLiBQcmV2aW91cyB2YWx1ZTogJyR7b2xkVmFsdWV9Jy4gQ3VycmVudCB2YWx1ZTogJyR7Y3VyclZhbHVlfScuYDtcbiAgICBpZiAoY3JlYXRpb25Nb2RlKSB7XG4gICAgICBtc2cgKz1cbiAgICAgICAgICBgIEl0IHNlZW1zIGxpa2UgdGhlIHZpZXcgaGFzIGJlZW4gY3JlYXRlZCBhZnRlciBpdHMgcGFyZW50IGFuZCBpdHMgY2hpbGRyZW4gaGF2ZSBiZWVuIGRpcnR5IGNoZWNrZWQuYCArXG4gICAgICAgICAgYCBIYXMgaXQgYmVlbiBjcmVhdGVkIGluIGEgY2hhbmdlIGRldGVjdGlvbiBob29rID9gO1xuICAgIH1cbiAgICAvLyBUT0RPOiBpbmNsdWRlIGRlYnVnIGNvbnRleHRcbiAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgfVxufVxuIl19