/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { fillProperties } from '../../util/property';
import { EMPTY, EMPTY_ARRAY } from '../definition';
/**
 * Determines if a definition is a {@link ComponentDef} or a {@link DirectiveDef}
 * @param definition The definition to examine
 */
function isComponentDef(definition) {
    var def = definition;
    return typeof def.template === 'function';
}
function getSuperType(type) {
    return Object.getPrototypeOf(type.prototype).constructor;
}
/**
 * Merges the definition from a super class to a sub class.
 * @param definition The definition that is a SubClass of another directive of component
 */
export function InheritDefinitionFeature(definition) {
    var superType = getSuperType(definition.type);
    var _loop_1 = function () {
        var e_1, _a;
        var superDef = undefined;
        if (isComponentDef(definition)) {
            // Don't use getComponentDef/getDirectiveDef. This logic relies on inheritance.
            superDef = superType.ngComponentDef || superType.ngDirectiveDef;
        }
        else {
            if (superType.ngComponentDef) {
                throw new Error('Directives cannot inherit Components');
            }
            // Don't use getComponentDef/getDirectiveDef. This logic relies on inheritance.
            superDef = superType.ngDirectiveDef;
        }
        var baseDef = superType.ngBaseDef;
        // Some fields in the definition may be empty, if there were no values to put in them that
        // would've justified object creation. Unwrap them if necessary.
        if (baseDef || superDef) {
            var writeableDef = definition;
            writeableDef.inputs = maybeUnwrapEmpty(definition.inputs);
            writeableDef.declaredInputs = maybeUnwrapEmpty(definition.declaredInputs);
            writeableDef.outputs = maybeUnwrapEmpty(definition.outputs);
        }
        if (baseDef) {
            // Merge inputs and outputs
            fillProperties(definition.inputs, baseDef.inputs);
            fillProperties(definition.declaredInputs, baseDef.declaredInputs);
            fillProperties(definition.outputs, baseDef.outputs);
        }
        if (superDef) {
            // Merge hostBindings
            var prevHostBindings_1 = definition.hostBindings;
            var superHostBindings_1 = superDef.hostBindings;
            if (superHostBindings_1) {
                if (prevHostBindings_1) {
                    definition.hostBindings = function (directiveIndex, elementIndex) {
                        superHostBindings_1(directiveIndex, elementIndex);
                        prevHostBindings_1(directiveIndex, elementIndex);
                    };
                    definition.hostVars += superDef.hostVars;
                }
                else {
                    definition.hostBindings = superHostBindings_1;
                }
            }
            // Merge View Queries
            if (isComponentDef(definition) && isComponentDef(superDef)) {
                var prevViewQuery_1 = definition.viewQuery;
                var superViewQuery_1 = superDef.viewQuery;
                if (superViewQuery_1) {
                    if (prevViewQuery_1) {
                        definition.viewQuery = function (rf, ctx) {
                            superViewQuery_1(rf, ctx);
                            prevViewQuery_1(rf, ctx);
                        };
                    }
                    else {
                        definition.viewQuery = superViewQuery_1;
                    }
                }
            }
            // Merge Content Queries
            var prevContentQueries_1 = definition.contentQueries;
            var superContentQueries_1 = superDef.contentQueries;
            if (superContentQueries_1) {
                if (prevContentQueries_1) {
                    definition.contentQueries = function (dirIndex) {
                        superContentQueries_1(dirIndex);
                        prevContentQueries_1(dirIndex);
                    };
                }
                else {
                    definition.contentQueries = superContentQueries_1;
                }
            }
            // Merge Content Queries Refresh
            var prevContentQueriesRefresh_1 = definition.contentQueriesRefresh;
            var superContentQueriesRefresh_1 = superDef.contentQueriesRefresh;
            if (superContentQueriesRefresh_1) {
                if (prevContentQueriesRefresh_1) {
                    definition.contentQueriesRefresh = function (directiveIndex, queryIndex) {
                        superContentQueriesRefresh_1(directiveIndex, queryIndex);
                        prevContentQueriesRefresh_1(directiveIndex, queryIndex);
                    };
                }
                else {
                    definition.contentQueriesRefresh = superContentQueriesRefresh_1;
                }
            }
            // Merge inputs and outputs
            fillProperties(definition.inputs, superDef.inputs);
            fillProperties(definition.declaredInputs, superDef.declaredInputs);
            fillProperties(definition.outputs, superDef.outputs);
            // Inherit hooks
            // Assume super class inheritance feature has already run.
            definition.afterContentChecked =
                definition.afterContentChecked || superDef.afterContentChecked;
            definition.afterContentInit = definition.afterContentInit || superDef.afterContentInit;
            definition.afterViewChecked = definition.afterViewChecked || superDef.afterViewChecked;
            definition.afterViewInit = definition.afterViewInit || superDef.afterViewInit;
            definition.doCheck = definition.doCheck || superDef.doCheck;
            definition.onDestroy = definition.onDestroy || superDef.onDestroy;
            definition.onInit = definition.onInit || superDef.onInit;
            // Run parent features
            var features = superDef.features;
            if (features) {
                try {
                    for (var features_1 = tslib_1.__values(features), features_1_1 = features_1.next(); !features_1_1.done; features_1_1 = features_1.next()) {
                        var feature = features_1_1.value;
                        if (feature && feature.ngInherit) {
                            feature(definition);
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (features_1_1 && !features_1_1.done && (_a = features_1.return)) _a.call(features_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            return "break";
        }
        else {
            // Even if we don't have a definition, check the type for the hooks and use those if need be
            var superPrototype = superType.prototype;
            if (superPrototype) {
                definition.afterContentChecked =
                    definition.afterContentChecked || superPrototype.afterContentChecked;
                definition.afterContentInit =
                    definition.afterContentInit || superPrototype.afterContentInit;
                definition.afterViewChecked =
                    definition.afterViewChecked || superPrototype.afterViewChecked;
                definition.afterViewInit = definition.afterViewInit || superPrototype.afterViewInit;
                definition.doCheck = definition.doCheck || superPrototype.doCheck;
                definition.onDestroy = definition.onDestroy || superPrototype.onDestroy;
                definition.onInit = definition.onInit || superPrototype.onInit;
            }
        }
        superType = Object.getPrototypeOf(superType);
    };
    while (superType) {
        var state_1 = _loop_1();
        if (state_1 === "break")
            break;
    }
}
function maybeUnwrapEmpty(value) {
    if (value === EMPTY) {
        return {};
    }
    else if (value === EMPTY_ARRAY) {
        return [];
    }
    else {
        return value;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5oZXJpdF9kZWZpbml0aW9uX2ZlYXR1cmUuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2ZlYXR1cmVzL2luaGVyaXRfZGVmaW5pdGlvbl9mZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFHSCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDbkQsT0FBTyxFQUFDLEtBQUssRUFBRSxXQUFXLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFLakQ7OztHQUdHO0FBQ0gsU0FBUyxjQUFjLENBQUksVUFBNEM7SUFFckUsSUFBTSxHQUFHLEdBQUcsVUFBNkIsQ0FBQztJQUMxQyxPQUFPLE9BQU8sR0FBRyxDQUFDLFFBQVEsS0FBSyxVQUFVLENBQUM7QUFDNUMsQ0FBQztBQUVELFNBQVMsWUFBWSxDQUFDLElBQWU7SUFFbkMsT0FBTyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxXQUFXLENBQUM7QUFDM0QsQ0FBQztBQUVEOzs7R0FHRztBQUNILE1BQU0sVUFBVSx3QkFBd0IsQ0FBQyxVQUFnRDtJQUN2RixJQUFJLFNBQVMsR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDOzs7UUFHNUMsSUFBSSxRQUFRLEdBQWtELFNBQVMsQ0FBQztRQUN4RSxJQUFJLGNBQWMsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUM5QiwrRUFBK0U7WUFDL0UsUUFBUSxHQUFHLFNBQVMsQ0FBQyxjQUFjLElBQUksU0FBUyxDQUFDLGNBQWMsQ0FBQztTQUNqRTthQUFNO1lBQ0wsSUFBSSxTQUFTLENBQUMsY0FBYyxFQUFFO2dCQUM1QixNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7YUFDekQ7WUFDRCwrRUFBK0U7WUFDL0UsUUFBUSxHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUM7U0FDckM7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QUFJLGNBQWMsQ0FBQyxNQUFNLENBQUM7YUFDaEU7U0FDRjtRQUVELFNBQVMsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDOztJQXpJL0MsT0FBTyxTQUFTOzs7O0tBMElmO0FBQ0gsQ0FBQztBQUlELFNBQVMsZ0JBQWdCLENBQUMsS0FBVTtJQUNsQyxJQUFJLEtBQUssS0FBSyxLQUFLLEVBQUU7UUFDbkIsT0FBTyxFQUFFLENBQUM7S0FDWDtTQUFNLElBQUksS0FBSyxLQUFLLFdBQVcsRUFBRTtRQUNoQyxPQUFPLEVBQUUsQ0FBQztLQUNYO1NBQU07UUFDTCxPQUFPLEtBQUssQ0FBQztLQUNkO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtUeXBlfSBmcm9tICcuLi8uLi90eXBlJztcbmltcG9ydCB7ZmlsbFByb3BlcnRpZXN9IGZyb20gJy4uLy4uL3V0aWwvcHJvcGVydHknO1xuaW1wb3J0IHtFTVBUWSwgRU1QVFlfQVJSQVl9IGZyb20gJy4uL2RlZmluaXRpb24nO1xuaW1wb3J0IHtDb21wb25lbnREZWYsIENvbXBvbmVudFRlbXBsYXRlLCBEaXJlY3RpdmVEZWYsIERpcmVjdGl2ZURlZkZlYXR1cmUsIFJlbmRlckZsYWdzfSBmcm9tICcuLi9pbnRlcmZhY2VzL2RlZmluaXRpb24nO1xuXG5cblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIGEgZGVmaW5pdGlvbiBpcyBhIHtAbGluayBDb21wb25lbnREZWZ9IG9yIGEge0BsaW5rIERpcmVjdGl2ZURlZn1cbiAqIEBwYXJhbSBkZWZpbml0aW9uIFRoZSBkZWZpbml0aW9uIHRvIGV4YW1pbmVcbiAqL1xuZnVuY3Rpb24gaXNDb21wb25lbnREZWY8VD4oZGVmaW5pdGlvbjogQ29tcG9uZW50RGVmPFQ+fCBEaXJlY3RpdmVEZWY8VD4pOlxuICAgIGRlZmluaXRpb24gaXMgQ29tcG9uZW50RGVmPFQ+IHtcbiAgY29uc3QgZGVmID0gZGVmaW5pdGlvbiBhcyBDb21wb25lbnREZWY8VD47XG4gIHJldHVybiB0eXBlb2YgZGVmLnRlbXBsYXRlID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBnZXRTdXBlclR5cGUodHlwZTogVHlwZTxhbnk+KTogVHlwZTxhbnk+JlxuICAgIHtuZ0NvbXBvbmVudERlZj86IENvbXBvbmVudERlZjxhbnk+LCBuZ0RpcmVjdGl2ZURlZj86IERpcmVjdGl2ZURlZjxhbnk+fSB7XG4gIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2YodHlwZS5wcm90b3R5cGUpLmNvbnN0cnVjdG9yO1xufVxuXG4vKipcbiAqIE1lcmdlcyB0aGUgZGVmaW5pdGlvbiBmcm9tIGEgc3VwZXIgY2xhc3MgdG8gYSBzdWIgY2xhc3MuXG4gKiBAcGFyYW0gZGVmaW5pdGlvbiBUaGUgZGVmaW5pdGlvbiB0aGF0IGlzIGEgU3ViQ2xhc3Mgb2YgYW5vdGhlciBkaXJlY3RpdmUgb2YgY29tcG9uZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJbmhlcml0RGVmaW5pdGlvbkZlYXR1cmUoZGVmaW5pdGlvbjogRGlyZWN0aXZlRGVmPGFueT58IENvbXBvbmVudERlZjxhbnk+KTogdm9pZCB7XG4gIGxldCBzdXBlclR5cGUgPSBnZXRTdXBlclR5cGUoZGVmaW5pdGlvbi50eXBlKTtcblxuICB3aGlsZSAoc3VwZXJUeXBlKSB7XG4gICAgbGV0IHN1cGVyRGVmOiBEaXJlY3RpdmVEZWY8YW55PnxDb21wb25lbnREZWY8YW55Pnx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgaWYgKGlzQ29tcG9uZW50RGVmKGRlZmluaXRpb24pKSB7XG4gICAgICAvLyBEb24ndCB1c2UgZ2V0Q29tcG9uZW50RGVmL2dldERpcmVjdGl2ZURlZi4gVGhpcyBsb2dpYyByZWxpZXMgb24gaW5oZXJpdGFuY2UuXG4gICAgICBzdXBlckRlZiA9IHN1cGVyVHlwZS5uZ0NvbXBvbmVudERlZiB8fCBzdXBlclR5cGUubmdEaXJlY3RpdmVEZWY7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChzdXBlclR5cGUubmdDb21wb25lbnREZWYpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEaXJlY3RpdmVzIGNhbm5vdCBpbmhlcml0IENvbXBvbmVudHMnKTtcbiAgICAgIH1cbiAgICAgIC8vIERvbid0IHVzZSBnZXRDb21wb25lbnREZWYvZ2V0RGlyZWN0aXZlRGVmLiBUaGlzIGxvZ2ljIHJlbGllcyBvbiBpbmhlcml0YW5jZS5cbiAgICAgIHN1cGVyRGVmID0gc3VwZXJUeXBlLm5nRGlyZWN0aXZlRGVmO1xuICAgIH1cblxuICAgIGNvbnN0IGJhc2VEZWYgPSAoc3VwZXJUeXBlIGFzIGFueSkubmdCYXNlRGVmO1xuXG4gICAgLy8gU29tZSBmaWVsZHMgaW4gdGhlIGRlZmluaXRpb24gbWF5IGJlIGVtcHR5LCBpZiB0aGVyZSB3ZXJlIG5vIHZhbHVlcyB0byBwdXQgaW4gdGhlbSB0aGF0XG4gICAgLy8gd291bGQndmUganVzdGlmaWVkIG9iamVjdCBjcmVhdGlvbi4gVW53cmFwIHRoZW0gaWYgbmVjZXNzYXJ5LlxuICAgIGlmIChiYXNlRGVmIHx8IHN1cGVyRGVmKSB7XG4gICAgICBjb25zdCB3cml0ZWFibGVEZWYgPSBkZWZpbml0aW9uIGFzIGFueTtcbiAgICAgIHdyaXRlYWJsZURlZi5pbnB1dHMgPSBtYXliZVVud3JhcEVtcHR5KGRlZmluaXRpb24uaW5wdXRzKTtcbiAgICAgIHdyaXRlYWJsZURlZi5kZWNsYXJlZElucHV0cyA9IG1heWJlVW53cmFwRW1wdHkoZGVmaW5pdGlvbi5kZWNsYXJlZElucHV0cyk7XG4gICAgICB3cml0ZWFibGVEZWYub3V0cHV0cyA9IG1heWJlVW53cmFwRW1wdHkoZGVmaW5pdGlvbi5vdXRwdXRzKTtcbiAgICB9XG5cbiAgICBpZiAoYmFzZURlZikge1xuICAgICAgLy8gTWVyZ2UgaW5wdXRzIGFuZCBvdXRwdXRzXG4gICAgICBmaWxsUHJvcGVydGllcyhkZWZpbml0aW9uLmlucHV0cywgYmFzZURlZi5pbnB1dHMpO1xuICAgICAgZmlsbFByb3BlcnRpZXMoZGVmaW5pdGlvbi5kZWNsYXJlZElucHV0cywgYmFzZURlZi5kZWNsYXJlZElucHV0cyk7XG4gICAgICBmaWxsUHJvcGVydGllcyhkZWZpbml0aW9uLm91dHB1dHMsIGJhc2VEZWYub3V0cHV0cyk7XG4gICAgfVxuXG4gICAgaWYgKHN1cGVyRGVmKSB7XG4gICAgICAvLyBNZXJnZSBob3N0QmluZGluZ3NcbiAgICAgIGNvbnN0IHByZXZIb3N0QmluZGluZ3MgPSBkZWZpbml0aW9uLmhvc3RCaW5kaW5ncztcbiAgICAgIGNvbnN0IHN1cGVySG9zdEJpbmRpbmdzID0gc3VwZXJEZWYuaG9zdEJpbmRpbmdzO1xuICAgICAgaWYgKHN1cGVySG9zdEJpbmRpbmdzKSB7XG4gICAgICAgIGlmIChwcmV2SG9zdEJpbmRpbmdzKSB7XG4gICAgICAgICAgZGVmaW5pdGlvbi5ob3N0QmluZGluZ3MgPSAoZGlyZWN0aXZlSW5kZXg6IG51bWJlciwgZWxlbWVudEluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgIHN1cGVySG9zdEJpbmRpbmdzKGRpcmVjdGl2ZUluZGV4LCBlbGVtZW50SW5kZXgpO1xuICAgICAgICAgICAgcHJldkhvc3RCaW5kaW5ncyhkaXJlY3RpdmVJbmRleCwgZWxlbWVudEluZGV4KTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIChkZWZpbml0aW9uIGFzIGFueSkuaG9zdFZhcnMgKz0gc3VwZXJEZWYuaG9zdFZhcnM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmaW5pdGlvbi5ob3N0QmluZGluZ3MgPSBzdXBlckhvc3RCaW5kaW5ncztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBNZXJnZSBWaWV3IFF1ZXJpZXNcbiAgICAgIGlmIChpc0NvbXBvbmVudERlZihkZWZpbml0aW9uKSAmJiBpc0NvbXBvbmVudERlZihzdXBlckRlZikpIHtcbiAgICAgICAgY29uc3QgcHJldlZpZXdRdWVyeSA9IGRlZmluaXRpb24udmlld1F1ZXJ5O1xuICAgICAgICBjb25zdCBzdXBlclZpZXdRdWVyeSA9IHN1cGVyRGVmLnZpZXdRdWVyeTtcbiAgICAgICAgaWYgKHN1cGVyVmlld1F1ZXJ5KSB7XG4gICAgICAgICAgaWYgKHByZXZWaWV3UXVlcnkpIHtcbiAgICAgICAgICAgIGRlZmluaXRpb24udmlld1F1ZXJ5ID0gPFQ+KHJmOiBSZW5kZXJGbGFncywgY3R4OiBUKTogdm9pZCA9PiB7XG4gICAgICAgICAgICAgIHN1cGVyVmlld1F1ZXJ5KHJmLCBjdHgpO1xuICAgICAgICAgICAgICBwcmV2Vmlld1F1ZXJ5KHJmLCBjdHgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVmaW5pdGlvbi52aWV3UXVlcnkgPSBzdXBlclZpZXdRdWVyeTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gTWVyZ2UgQ29udGVudCBRdWVyaWVzXG4gICAgICBjb25zdCBwcmV2Q29udGVudFF1ZXJpZXMgPSBkZWZpbml0aW9uLmNvbnRlbnRRdWVyaWVzO1xuICAgICAgY29uc3Qgc3VwZXJDb250ZW50UXVlcmllcyA9IHN1cGVyRGVmLmNvbnRlbnRRdWVyaWVzO1xuICAgICAgaWYgKHN1cGVyQ29udGVudFF1ZXJpZXMpIHtcbiAgICAgICAgaWYgKHByZXZDb250ZW50UXVlcmllcykge1xuICAgICAgICAgIGRlZmluaXRpb24uY29udGVudFF1ZXJpZXMgPSAoZGlySW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgc3VwZXJDb250ZW50UXVlcmllcyhkaXJJbmRleCk7XG4gICAgICAgICAgICBwcmV2Q29udGVudFF1ZXJpZXMoZGlySW5kZXgpO1xuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmaW5pdGlvbi5jb250ZW50UXVlcmllcyA9IHN1cGVyQ29udGVudFF1ZXJpZXM7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gTWVyZ2UgQ29udGVudCBRdWVyaWVzIFJlZnJlc2hcbiAgICAgIGNvbnN0IHByZXZDb250ZW50UXVlcmllc1JlZnJlc2ggPSBkZWZpbml0aW9uLmNvbnRlbnRRdWVyaWVzUmVmcmVzaDtcbiAgICAgIGNvbnN0IHN1cGVyQ29udGVudFF1ZXJpZXNSZWZyZXNoID0gc3VwZXJEZWYuY29udGVudFF1ZXJpZXNSZWZyZXNoO1xuICAgICAgaWYgKHN1cGVyQ29udGVudFF1ZXJpZXNSZWZyZXNoKSB7XG4gICAgICAgIGlmIChwcmV2Q29udGVudFF1ZXJpZXNSZWZyZXNoKSB7XG4gICAgICAgICAgZGVmaW5pdGlvbi5jb250ZW50UXVlcmllc1JlZnJlc2ggPSAoZGlyZWN0aXZlSW5kZXg6IG51bWJlciwgcXVlcnlJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICBzdXBlckNvbnRlbnRRdWVyaWVzUmVmcmVzaChkaXJlY3RpdmVJbmRleCwgcXVlcnlJbmRleCk7XG4gICAgICAgICAgICBwcmV2Q29udGVudFF1ZXJpZXNSZWZyZXNoKGRpcmVjdGl2ZUluZGV4LCBxdWVyeUluZGV4KTtcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlZmluaXRpb24uY29udGVudFF1ZXJpZXNSZWZyZXNoID0gc3VwZXJDb250ZW50UXVlcmllc1JlZnJlc2g7XG4gICAgICAgIH1cbiAgICAgIH1cblxuXG4gICAgICAvLyBNZXJnZSBpbnB1dHMgYW5kIG91dHB1dHNcbiAgICAgIGZpbGxQcm9wZXJ0aWVzKGRlZmluaXRpb24uaW5wdXRzLCBzdXBlckRlZi5pbnB1dHMpO1xuICAgICAgZmlsbFByb3BlcnRpZXMoZGVmaW5pdGlvbi5kZWNsYXJlZElucHV0cywgc3VwZXJEZWYuZGVjbGFyZWRJbnB1dHMpO1xuICAgICAgZmlsbFByb3BlcnRpZXMoZGVmaW5pdGlvbi5vdXRwdXRzLCBzdXBlckRlZi5vdXRwdXRzKTtcblxuICAgICAgLy8gSW5oZXJpdCBob29rc1xuICAgICAgLy8gQXNzdW1lIHN1cGVyIGNsYXNzIGluaGVyaXRhbmNlIGZlYXR1cmUgaGFzIGFscmVhZHkgcnVuLlxuICAgICAgZGVmaW5pdGlvbi5hZnRlckNvbnRlbnRDaGVja2VkID1cbiAgICAgICAgICBkZWZpbml0aW9uLmFmdGVyQ29udGVudENoZWNrZWQgfHwgc3VwZXJEZWYuYWZ0ZXJDb250ZW50Q2hlY2tlZDtcbiAgICAgIGRlZmluaXRpb24uYWZ0ZXJDb250ZW50SW5pdCA9IGRlZmluaXRpb24uYWZ0ZXJDb250ZW50SW5pdCB8fCBzdXBlckRlZi5hZnRlckNvbnRlbnRJbml0O1xuICAgICAgZGVmaW5pdGlvbi5hZnRlclZpZXdDaGVja2VkID0gZGVmaW5pdGlvbi5hZnRlclZpZXdDaGVja2VkIHx8IHN1cGVyRGVmLmFmdGVyVmlld0NoZWNrZWQ7XG4gICAgICBkZWZpbml0aW9uLmFmdGVyVmlld0luaXQgPSBkZWZpbml0aW9uLmFmdGVyVmlld0luaXQgfHwgc3VwZXJEZWYuYWZ0ZXJWaWV3SW5pdDtcbiAgICAgIGRlZmluaXRpb24uZG9DaGVjayA9IGRlZmluaXRpb24uZG9DaGVjayB8fCBzdXBlckRlZi5kb0NoZWNrO1xuICAgICAgZGVmaW5pdGlvbi5vbkRlc3Ryb3kgPSBkZWZpbml0aW9uLm9uRGVzdHJveSB8fCBzdXBlckRlZi5vbkRlc3Ryb3k7XG4gICAgICBkZWZpbml0aW9uLm9uSW5pdCA9IGRlZmluaXRpb24ub25Jbml0IHx8IHN1cGVyRGVmLm9uSW5pdDtcblxuICAgICAgLy8gUnVuIHBhcmVudCBmZWF0dXJlc1xuICAgICAgY29uc3QgZmVhdHVyZXMgPSBzdXBlckRlZi5mZWF0dXJlcztcbiAgICAgIGlmIChmZWF0dXJlcykge1xuICAgICAgICBmb3IgKGNvbnN0IGZlYXR1cmUgb2YgZmVhdHVyZXMpIHtcbiAgICAgICAgICBpZiAoZmVhdHVyZSAmJiBmZWF0dXJlLm5nSW5oZXJpdCkge1xuICAgICAgICAgICAgKGZlYXR1cmUgYXMgRGlyZWN0aXZlRGVmRmVhdHVyZSkoZGVmaW5pdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGJyZWFrO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBFdmVuIGlmIHdlIGRvbid0IGhhdmUgYSBkZWZpbml0aW9uLCBjaGVjayB0aGUgdHlwZSBmb3IgdGhlIGhvb2tzIGFuZCB1c2UgdGhvc2UgaWYgbmVlZCBiZVxuICAgICAgY29uc3Qgc3VwZXJQcm90b3R5cGUgPSBzdXBlclR5cGUucHJvdG90eXBlO1xuXG4gICAgICBpZiAoc3VwZXJQcm90b3R5cGUpIHtcbiAgICAgICAgZGVmaW5pdGlvbi5hZnRlckNvbnRlbnRDaGVja2VkID1cbiAgICAgICAgICAgIGRlZmluaXRpb24uYWZ0ZXJDb250ZW50Q2hlY2tlZCB8fCBzdXBlclByb3RvdHlwZS5hZnRlckNvbnRlbnRDaGVja2VkO1xuICAgICAgICBkZWZpbml0aW9uLmFmdGVyQ29udGVudEluaXQgPVxuICAgICAgICAgICAgZGVmaW5pdGlvbi5hZnRlckNvbnRlbnRJbml0IHx8IHN1cGVyUHJvdG90eXBlLmFmdGVyQ29udGVudEluaXQ7XG4gICAgICAgIGRlZmluaXRpb24uYWZ0ZXJWaWV3Q2hlY2tlZCA9XG4gICAgICAgICAgICBkZWZpbml0aW9uLmFmdGVyVmlld0NoZWNrZWQgfHwgc3VwZXJQcm90b3R5cGUuYWZ0ZXJWaWV3Q2hlY2tlZDtcbiAgICAgICAgZGVmaW5pdGlvbi5hZnRlclZpZXdJbml0ID0gZGVmaW5pdGlvbi5hZnRlclZpZXdJbml0IHx8IHN1cGVyUHJvdG90eXBlLmFmdGVyVmlld0luaXQ7XG4gICAgICAgIGRlZmluaXRpb24uZG9DaGVjayA9IGRlZmluaXRpb24uZG9DaGVjayB8fCBzdXBlclByb3RvdHlwZS5kb0NoZWNrO1xuICAgICAgICBkZWZpbml0aW9uLm9uRGVzdHJveSA9IGRlZmluaXRpb24ub25EZXN0cm95IHx8IHN1cGVyUHJvdG90eXBlLm9uRGVzdHJveTtcbiAgICAgICAgZGVmaW5pdGlvbi5vbkluaXQgPSBkZWZpbml0aW9uLm9uSW5pdCB8fCBzdXBlclByb3RvdHlwZS5vbkluaXQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3VwZXJUeXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHN1cGVyVHlwZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbWF5YmVVbndyYXBFbXB0eTxUPih2YWx1ZTogVFtdKTogVFtdO1xuZnVuY3Rpb24gbWF5YmVVbndyYXBFbXB0eTxUPih2YWx1ZTogVCk6IFQ7XG5mdW5jdGlvbiBtYXliZVVud3JhcEVtcHR5KHZhbHVlOiBhbnkpOiBhbnkge1xuICBpZiAodmFsdWUgPT09IEVNUFRZKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9IGVsc2UgaWYgKHZhbHVlID09PSBFTVBUWV9BUlJBWSkge1xuICAgIHJldHVybiBbXTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbn1cbiJdfQ==