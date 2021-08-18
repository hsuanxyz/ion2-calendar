/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { SimpleChange } from '../../change_detection/change_detection_util';
var PRIVATE_PREFIX = '__ngOnChanges_';
/**
 * The NgOnChangesFeature decorates a component with support for the ngOnChanges
 * lifecycle hook, so it should be included in any component that implements
 * that hook.
 *
 * If the component or directive uses inheritance, the NgOnChangesFeature MUST
 * be included as a feature AFTER {@link InheritDefinitionFeature}, otherwise
 * inherited properties will not be propagated to the ngOnChanges lifecycle
 * hook.
 *
 * Example usage:
 *
 * ```
 * static ngComponentDef = defineComponent({
 *   ...
 *   inputs: {name: 'publicName'},
 *   features: [NgOnChangesFeature]
 * });
 * ```
 */
export function NgOnChangesFeature(definition) {
    var declaredToMinifiedInputs = definition.declaredInputs;
    var proto = definition.type.prototype;
    var _loop_1 = function (declaredName) {
        if (declaredToMinifiedInputs.hasOwnProperty(declaredName)) {
            var minifiedKey = declaredToMinifiedInputs[declaredName];
            var privateMinKey_1 = PRIVATE_PREFIX + minifiedKey;
            // Walk the prototype chain to see if we find a property descriptor
            // That way we can honor setters and getters that were inherited.
            var originalProperty = undefined;
            var checkProto = proto;
            while (!originalProperty && checkProto &&
                Object.getPrototypeOf(checkProto) !== Object.getPrototypeOf(Object.prototype)) {
                originalProperty = Object.getOwnPropertyDescriptor(checkProto, minifiedKey);
                checkProto = Object.getPrototypeOf(checkProto);
            }
            var getter = originalProperty && originalProperty.get;
            var setter_1 = originalProperty && originalProperty.set;
            // create a getter and setter for property
            Object.defineProperty(proto, minifiedKey, {
                get: getter ||
                    (setter_1 ? undefined : function () { return this[privateMinKey_1]; }),
                set: function (value) {
                    var simpleChanges = this[PRIVATE_PREFIX];
                    if (!simpleChanges) {
                        simpleChanges = {};
                        // Place where we will store SimpleChanges if there is a change
                        Object.defineProperty(this, PRIVATE_PREFIX, { value: simpleChanges, writable: true });
                    }
                    var isFirstChange = !this.hasOwnProperty(privateMinKey_1);
                    var currentChange = simpleChanges[declaredName];
                    if (currentChange) {
                        currentChange.currentValue = value;
                    }
                    else {
                        simpleChanges[declaredName] =
                            new SimpleChange(this[privateMinKey_1], value, isFirstChange);
                    }
                    if (isFirstChange) {
                        // Create a place where the actual value will be stored and make it non-enumerable
                        Object.defineProperty(this, privateMinKey_1, { value: value, writable: true });
                    }
                    else {
                        this[privateMinKey_1] = value;
                    }
                    if (setter_1)
                        setter_1.call(this, value);
                },
                // Make the property configurable in dev mode to allow overriding in tests
                configurable: !!ngDevMode
            });
        }
    };
    for (var declaredName in declaredToMinifiedInputs) {
        _loop_1(declaredName);
    }
    // If an onInit hook is defined, it will need to wrap the ngOnChanges call
    // so the call order is changes-init-check in creation mode. In subsequent
    // change detection runs, only the check wrapper will be called.
    if (definition.onInit != null) {
        definition.onInit = onChangesWrapper(definition.onInit);
    }
    definition.doCheck = onChangesWrapper(definition.doCheck);
}
// This option ensures that the ngOnChanges lifecycle hook will be inherited
// from superclasses (in InheritDefinitionFeature).
NgOnChangesFeature.ngInherit = true;
function onChangesWrapper(delegateHook) {
    return function () {
        var simpleChanges = this[PRIVATE_PREFIX];
        if (simpleChanges != null) {
            this.ngOnChanges(simpleChanges);
            this[PRIVATE_PREFIX] = null;
        }
        if (delegateHook)
            delegateHook.apply(this);
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfb25jaGFuZ2VzX2ZlYXR1cmUuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2ZlYXR1cmVzL25nX29uY2hhbmdlc19mZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSw4Q0FBOEMsQ0FBQztBQUkxRSxJQUFNLGNBQWMsR0FBRyxnQkFBZ0IsQ0FBQztBQVF4Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1CRztBQUNILE1BQU0sVUFBVSxrQkFBa0IsQ0FBSSxVQUEyQjtJQUMvRCxJQUFNLHdCQUF3QixHQUFHLFVBQVUsQ0FBQyxjQUFjLENBQUM7SUFDM0QsSUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7NEJBQzdCLFlBQVk7UUFDckIsSUFBSSx3QkFBd0IsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDekQsSUFBTSxXQUFXLEdBQUcsd0JBQXdCLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDM0QsSUFBTSxlQUFhLEdBQUcsY0FBYyxHQUFHLFdBQVcsQ0FBQztZQUVuRCxtRUFBbUU7WUFDbkUsaUVBQWlFO1lBQ2pFLElBQUksZ0JBQWdCLEdBQWlDLFNBQVMsQ0FBQztZQUMvRCxJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7WUFDdkIsT0FBTyxDQUFDLGdCQUFnQixJQUFJLFVBQVU7Z0JBQy9CLE1BQU0sQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLEtBQUssTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ3BGLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQzVFLFVBQVUsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ2hEO1lBRUQs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ZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtTaW1wbGVDaGFuZ2V9IGZyb20gJy4uLy4uL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbl91dGlsJztcbmltcG9ydCB7T25DaGFuZ2VzLCBTaW1wbGVDaGFuZ2VzfSBmcm9tICcuLi8uLi9tZXRhZGF0YS9saWZlY3ljbGVfaG9va3MnO1xuaW1wb3J0IHtEaXJlY3RpdmVEZWYsIERpcmVjdGl2ZURlZkZlYXR1cmV9IGZyb20gJy4uL2ludGVyZmFjZXMvZGVmaW5pdGlvbic7XG5cbmNvbnN0IFBSSVZBVEVfUFJFRklYID0gJ19fbmdPbkNoYW5nZXNfJztcblxudHlwZSBPbkNoYW5nZXNFeHBhbmRvID0gT25DaGFuZ2VzICYge1xuICBfX25nT25DaGFuZ2VzXzogU2ltcGxlQ2hhbmdlc3xudWxsfHVuZGVmaW5lZDtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueSBDYW4gaG9sZCBhbnkgdmFsdWVcbiAgW2tleTogc3RyaW5nXTogYW55O1xufTtcblxuLyoqXG4gKiBUaGUgTmdPbkNoYW5nZXNGZWF0dXJlIGRlY29yYXRlcyBhIGNvbXBvbmVudCB3aXRoIHN1cHBvcnQgZm9yIHRoZSBuZ09uQ2hhbmdlc1xuICogbGlmZWN5Y2xlIGhvb2ssIHNvIGl0IHNob3VsZCBiZSBpbmNsdWRlZCBpbiBhbnkgY29tcG9uZW50IHRoYXQgaW1wbGVtZW50c1xuICogdGhhdCBob29rLlxuICpcbiAqIElmIHRoZSBjb21wb25lbnQgb3IgZGlyZWN0aXZlIHVzZXMgaW5oZXJpdGFuY2UsIHRoZSBOZ09uQ2hhbmdlc0ZlYXR1cmUgTVVTVFxuICogYmUgaW5jbHVkZWQgYXMgYSBmZWF0dXJlIEFGVEVSIHtAbGluayBJbmhlcml0RGVmaW5pdGlvbkZlYXR1cmV9LCBvdGhlcndpc2VcbiAqIGluaGVyaXRlZCBwcm9wZXJ0aWVzIHdpbGwgbm90IGJlIHByb3BhZ2F0ZWQgdG8gdGhlIG5nT25DaGFuZ2VzIGxpZmVjeWNsZVxuICogaG9vay5cbiAqXG4gKiBFeGFtcGxlIHVzYWdlOlxuICpcbiAqIGBgYFxuICogc3RhdGljIG5nQ29tcG9uZW50RGVmID0gZGVmaW5lQ29tcG9uZW50KHtcbiAqICAgLi4uXG4gKiAgIGlucHV0czoge25hbWU6ICdwdWJsaWNOYW1lJ30sXG4gKiAgIGZlYXR1cmVzOiBbTmdPbkNoYW5nZXNGZWF0dXJlXVxuICogfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE5nT25DaGFuZ2VzRmVhdHVyZTxUPihkZWZpbml0aW9uOiBEaXJlY3RpdmVEZWY8VD4pOiB2b2lkIHtcbiAgY29uc3QgZGVjbGFyZWRUb01pbmlmaWVkSW5wdXRzID0gZGVmaW5pdGlvbi5kZWNsYXJlZElucHV0cztcbiAgY29uc3QgcHJvdG8gPSBkZWZpbml0aW9uLnR5cGUucHJvdG90eXBlO1xuICBmb3IgKGNvbnN0IGRlY2xhcmVkTmFtZSBpbiBkZWNsYXJlZFRvTWluaWZpZWRJbnB1dHMpIHtcbiAgICBpZiAoZGVjbGFyZWRUb01pbmlmaWVkSW5wdXRzLmhhc093blByb3BlcnR5KGRlY2xhcmVkTmFtZSkpIHtcbiAgICAgIGNvbnN0IG1pbmlmaWVkS2V5ID0gZGVjbGFyZWRUb01pbmlmaWVkSW5wdXRzW2RlY2xhcmVkTmFtZV07XG4gICAgICBjb25zdCBwcml2YXRlTWluS2V5ID0gUFJJVkFURV9QUkVGSVggKyBtaW5pZmllZEtleTtcblxuICAgICAgLy8gV2FsayB0aGUgcHJvdG90eXBlIGNoYWluIHRvIHNlZSBpZiB3ZSBmaW5kIGEgcHJvcGVydHkgZGVzY3JpcHRvclxuICAgICAgLy8gVGhhdCB3YXkgd2UgY2FuIGhvbm9yIHNldHRlcnMgYW5kIGdldHRlcnMgdGhhdCB3ZXJlIGluaGVyaXRlZC5cbiAgICAgIGxldCBvcmlnaW5hbFByb3BlcnR5OiBQcm9wZXJ0eURlc2NyaXB0b3J8dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgICAgbGV0IGNoZWNrUHJvdG8gPSBwcm90bztcbiAgICAgIHdoaWxlICghb3JpZ2luYWxQcm9wZXJ0eSAmJiBjaGVja1Byb3RvICYmXG4gICAgICAgICAgICAgT2JqZWN0LmdldFByb3RvdHlwZU9mKGNoZWNrUHJvdG8pICE9PSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoT2JqZWN0LnByb3RvdHlwZSkpIHtcbiAgICAgICAgb3JpZ2luYWxQcm9wZXJ0eSA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoY2hlY2tQcm90bywgbWluaWZpZWRLZXkpO1xuICAgICAgICBjaGVja1Byb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGNoZWNrUHJvdG8pO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBnZXR0ZXIgPSBvcmlnaW5hbFByb3BlcnR5ICYmIG9yaWdpbmFsUHJvcGVydHkuZ2V0O1xuICAgICAgY29uc3Qgc2V0dGVyID0gb3JpZ2luYWxQcm9wZXJ0eSAmJiBvcmlnaW5hbFByb3BlcnR5LnNldDtcblxuICAgICAgLy8gY3JlYXRlIGEgZ2V0dGVyIGFuZCBzZXR0ZXIgZm9yIHByb3BlcnR5XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG8sIG1pbmlmaWVkS2V5LCB7XG4gICAgICAgIGdldDogZ2V0dGVyIHx8XG4gICAgICAgICAgICAoc2V0dGVyID8gdW5kZWZpbmVkIDogZnVuY3Rpb24odGhpczogT25DaGFuZ2VzRXhwYW5kbykgeyByZXR1cm4gdGhpc1twcml2YXRlTWluS2V5XTsgfSksXG4gICAgICAgIHNldDxUPih0aGlzOiBPbkNoYW5nZXNFeHBhbmRvLCB2YWx1ZTogVCkge1xuICAgICAgICAgIGxldCBzaW1wbGVDaGFuZ2VzID0gdGhpc1tQUklWQVRFX1BSRUZJWF07XG4gICAgICAgICAgaWYgKCFzaW1wbGVDaGFuZ2VzKSB7XG4gICAgICAgICAgICBzaW1wbGVDaGFuZ2VzID0ge307XG4gICAgICAgICAgICAvLyBQbGFjZSB3aGVyZSB3ZSB3aWxsIHN0b3JlIFNpbXBsZUNoYW5nZXMgaWYgdGhlcmUgaXMgYSBjaGFuZ2VcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBQUklWQVRFX1BSRUZJWCwge3ZhbHVlOiBzaW1wbGVDaGFuZ2VzLCB3cml0YWJsZTogdHJ1ZX0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGlzRmlyc3RDaGFuZ2UgPSAhdGhpcy5oYXNPd25Qcm9wZXJ0eShwcml2YXRlTWluS2V5KTtcbiAgICAgICAgICBjb25zdCBjdXJyZW50Q2hhbmdlID0gc2ltcGxlQ2hhbmdlc1tkZWNsYXJlZE5hbWVdO1xuXG4gICAgICAgICAgaWYgKGN1cnJlbnRDaGFuZ2UpIHtcbiAgICAgICAgICAgIGN1cnJlbnRDaGFuZ2UuY3VycmVudFZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNpbXBsZUNoYW5nZXNbZGVjbGFyZWROYW1lXSA9XG4gICAgICAgICAgICAgICAgbmV3IFNpbXBsZUNoYW5nZSh0aGlzW3ByaXZhdGVNaW5LZXldLCB2YWx1ZSwgaXNGaXJzdENoYW5nZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGlzRmlyc3RDaGFuZ2UpIHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBhIHBsYWNlIHdoZXJlIHRoZSBhY3R1YWwgdmFsdWUgd2lsbCBiZSBzdG9yZWQgYW5kIG1ha2UgaXQgbm9uLWVudW1lcmFibGVcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBwcml2YXRlTWluS2V5LCB7dmFsdWUsIHdyaXRhYmxlOiB0cnVlfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXNbcHJpdmF0ZU1pbktleV0gPSB2YWx1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2V0dGVyKSBzZXR0ZXIuY2FsbCh0aGlzLCB2YWx1ZSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIE1ha2UgdGhlIHByb3BlcnR5IGNvbmZpZ3VyYWJsZSBpbiBkZXYgbW9kZSB0byBhbGxvdyBvdmVycmlkaW5nIGluIHRlc3RzXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogISFuZ0Rldk1vZGVcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIElmIGFuIG9uSW5pdCBob29rIGlzIGRlZmluZWQsIGl0IHdpbGwgbmVlZCB0byB3cmFwIHRoZSBuZ09uQ2hhbmdlcyBjYWxsXG4gIC8vIHNvIHRoZSBjYWxsIG9yZGVyIGlzIGNoYW5nZXMtaW5pdC1jaGVjayBpbiBjcmVhdGlvbiBtb2RlLiBJbiBzdWJzZXF1ZW50XG4gIC8vIGNoYW5nZSBkZXRlY3Rpb24gcnVucywgb25seSB0aGUgY2hlY2sgd3JhcHBlciB3aWxsIGJlIGNhbGxlZC5cbiAgaWYgKGRlZmluaXRpb24ub25Jbml0ICE9IG51bGwpIHtcbiAgICBkZWZpbml0aW9uLm9uSW5pdCA9IG9uQ2hhbmdlc1dyYXBwZXIoZGVmaW5pdGlvbi5vbkluaXQpO1xuICB9XG5cbiAgZGVmaW5pdGlvbi5kb0NoZWNrID0gb25DaGFuZ2VzV3JhcHBlcihkZWZpbml0aW9uLmRvQ2hlY2spO1xufVxuXG4vLyBUaGlzIG9wdGlvbiBlbnN1cmVzIHRoYXQgdGhlIG5nT25DaGFuZ2VzIGxpZmVjeWNsZSBob29rIHdpbGwgYmUgaW5oZXJpdGVkXG4vLyBmcm9tIHN1cGVyY2xhc3NlcyAoaW4gSW5oZXJpdERlZmluaXRpb25GZWF0dXJlKS5cbihOZ09uQ2hhbmdlc0ZlYXR1cmUgYXMgRGlyZWN0aXZlRGVmRmVhdHVyZSkubmdJbmhlcml0ID0gdHJ1ZTtcblxuZnVuY3Rpb24gb25DaGFuZ2VzV3JhcHBlcihkZWxlZ2F0ZUhvb2s6ICgoKSA9PiB2b2lkKSB8IG51bGwpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRoaXM6IE9uQ2hhbmdlc0V4cGFuZG8pIHtcbiAgICBjb25zdCBzaW1wbGVDaGFuZ2VzID0gdGhpc1tQUklWQVRFX1BSRUZJWF07XG4gICAgaWYgKHNpbXBsZUNoYW5nZXMgIT0gbnVsbCkge1xuICAgICAgdGhpcy5uZ09uQ2hhbmdlcyhzaW1wbGVDaGFuZ2VzKTtcbiAgICAgIHRoaXNbUFJJVkFURV9QUkVGSVhdID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKGRlbGVnYXRlSG9vaykgZGVsZWdhdGVIb29rLmFwcGx5KHRoaXMpO1xuICB9O1xufVxuIl19