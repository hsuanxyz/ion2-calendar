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
import { Directive, EventEmitter, Host, Inject, Input, Optional, Output, Self, forwardRef } from '@angular/core';
import { FormControl } from '../model';
import { NG_ASYNC_VALIDATORS, NG_VALIDATORS } from '../validators';
import { AbstractFormGroupDirective } from './abstract_form_group_directive';
import { ControlContainer } from './control_container';
import { NG_VALUE_ACCESSOR } from './control_value_accessor';
import { NgControl } from './ng_control';
import { NgForm } from './ng_form';
import { NgModelGroup } from './ng_model_group';
import { composeAsyncValidators, composeValidators, controlPath, isPropertyUpdated, selectValueAccessor, setUpControl } from './shared';
import { TemplateDrivenErrors } from './template_driven_errors';
/** @type {?} */
export const formControlBinding = {
    provide: NgControl,
    useExisting: forwardRef(() => NgModel)
};
/**
 * `ngModel` forces an additional change detection run when its inputs change:
 * E.g.:
 * ```
 * <div>{{myModel.valid}}</div>
 * <input [(ngModel)]="myValue" #myModel="ngModel">
 * ```
 * I.e. `ngModel` can export itself on the element and then be used in the template.
 * Normally, this would result in expressions before the `input` that use the exported directive
 * to have and old value as they have been
 * dirty checked before. As this is a very common case for `ngModel`, we added this second change
 * detection run.
 *
 * Notes:
 * - this is just one extra run no matter how many `ngModel` have been changed.
 * - this is a general problem when using `exportAs` for directives!
 * @type {?}
 */
const resolvedPromise = Promise.resolve(null);
/**
 * \@description
 * Creates a `FormControl` instance from a domain model and binds it
 * to a form control element.
 *
 * The `FormControl` instance tracks the value, user interaction, and
 * validation status of the control and keeps the view synced with the model. If used
 * within a parent form, the directive also registers itself with the form as a child
 * control.
 *
 * This directive is used by itself or as part of a larger form. Use the
 * `ngModel` selector to activate it.
 *
 * It accepts a domain model as an optional `Input`. If you have a one-way binding
 * to `ngModel` with `[]` syntax, changing the value of the domain model in the component
 * class sets the value in the view. If you have a two-way binding with `[()]` syntax
 * (also known as 'banana-box syntax'), the value in the UI always syncs back to
 * the domain model in your class.
 *
 * To inspect the properties of the associated `FormControl` (like validity state),
 * export the directive into a local template variable using `ngModel` as the key (ex: `#myVar="ngModel"`).
 * You then access the control using the directive's `control` property,
 * but most properties used (like `valid` and `dirty`) fall through to the control anyway for direct access.
 * See a full list of properties directly available in `AbstractControlDirective`.
 *
 * @see `RadioControlValueAccessor`
 * @see `SelectControlValueAccessor`
 *
 * \@usageNotes
 *
 * ### Using ngModel on a standalone control
 *
 * The following examples show a simple standalone control using `ngModel`:
 *
 * {\@example forms/ts/simpleNgModel/simple_ng_model_example.ts region='Component'}
 *
 * When using the `ngModel` within `<form>` tags, you'll also need to supply a `name` attribute
 * so that the control can be registered with the parent form under that name.
 *
 * In the context of a parent form, it's often unnecessary to include one-way or two-way binding,
 * as the parent form syncs the value for you. You access its properties by exporting it into a
 * local template variable using `ngForm` such as (`#f="ngForm"`). Use the variable where
 * needed on form submission.
 *
 * If you do need to populate initial values into your form, using a one-way binding for
 * `ngModel` tends to be sufficient as long as you use the exported form's value rather
 * than the domain model's value on submit.
 *
 * ### Using ngModel within a form
 *
 * The following example shows controls using `ngModel` within a form:
 *
 * {\@example forms/ts/simpleForm/simple_form_example.ts region='Component'}
 *
 * ### Using a standalone ngModel within a group
 *
 * The following example shows you how to use a standalone ngModel control
 * within a form. This controls the display of the form, but doesn't contain form data.
 *
 * ```html
 * <form>
 *   <input name="login" ngModel placeholder="Login">
 *   <input type="checkbox" ngModel [ngModelOptions]="{standalone: true}"> Show more options?
 * </form>
 * <!-- form value: {login: ''} -->
 * ```
 *
 * ### Setting the ngModel name attribute through options
 *
 * The following example shows you an alternate way to set the name attribute. The name attribute is used
 * within a custom form component, and the name `\@Input` property serves a different purpose.
 *
 * ```html
 * <form>
 *   <my-person-control name="Nancy" ngModel [ngModelOptions]="{name: 'user'}">
 *   </my-person-control>
 * </form>
 * <!-- form value: {user: ''} -->
 * ```
 *
 * \@ngModule FormsModule
 * \@publicApi
 */
export class NgModel extends NgControl {
    /**
     * @param {?} parent
     * @param {?} validators
     * @param {?} asyncValidators
     * @param {?} valueAccessors
     */
    constructor(parent, validators, asyncValidators, valueAccessors) {
        super();
        this.control = new FormControl();
        /**
         * \@internal
         */
        this._registered = false;
        /**
         * \@description
         * Event emitter for producing the `ngModelChange` event after
         * the view model updates.
         */
        this.update = new EventEmitter();
        this._parent = parent;
        this._rawValidators = validators || [];
        this._rawAsyncValidators = asyncValidators || [];
        this.valueAccessor = selectValueAccessor(this, valueAccessors);
    }
    /**
     * \@description
     * A lifecycle method called when the directive's inputs change. For internal use
     * only.
     *
     * @param {?} changes A object of key/value pairs for the set of changed inputs.
     * @return {?}
     */
    ngOnChanges(changes) {
        this._checkForErrors();
        if (!this._registered)
            this._setUpControl();
        if ('isDisabled' in changes) {
            this._updateDisabled(changes);
        }
        if (isPropertyUpdated(changes, this.viewModel)) {
            this._updateValue(this.model);
            this.viewModel = this.model;
        }
    }
    /**
     * \@description
     * Lifecycle method called before the directive's instance is destroyed. For internal
     * use only.
     * @return {?}
     */
    ngOnDestroy() { this.formDirective && this.formDirective.removeControl(this); }
    /**
     * \@description
     * Returns an array that represents the path from the top-level form to this control.
     * Each index is the string name of the control on that level.
     * @return {?}
     */
    get path() {
        return this._parent ? controlPath(this.name, this._parent) : [this.name];
    }
    /**
     * \@description
     * The top-level directive for this control if present, otherwise null.
     * @return {?}
     */
    get formDirective() { return this._parent ? this._parent.formDirective : null; }
    /**
     * \@description
     * Synchronous validator function composed of all the synchronous validators
     * registered with this directive.
     * @return {?}
     */
    get validator() { return composeValidators(this._rawValidators); }
    /**
     * \@description
     * Async validator function composed of all the async validators registered with this
     * directive.
     * @return {?}
     */
    get asyncValidator() {
        return composeAsyncValidators(this._rawAsyncValidators);
    }
    /**
     * \@description
     * Sets the new value for the view model and emits an `ngModelChange` event.
     *
     * @param {?} newValue The new value emitted by `ngModelChange`.
     * @return {?}
     */
    viewToModelUpdate(newValue) {
        this.viewModel = newValue;
        this.update.emit(newValue);
    }
    /**
     * @return {?}
     */
    _setUpControl() {
        this._setUpdateStrategy();
        this._isStandalone() ? this._setUpStandalone() :
            this.formDirective.addControl(this);
        this._registered = true;
    }
    /**
     * @return {?}
     */
    _setUpdateStrategy() {
        if (this.options && this.options.updateOn != null) {
            this.control._updateOn = this.options.updateOn;
        }
    }
    /**
     * @return {?}
     */
    _isStandalone() {
        return !this._parent || !!(this.options && this.options.standalone);
    }
    /**
     * @return {?}
     */
    _setUpStandalone() {
        setUpControl(this.control, this);
        this.control.updateValueAndValidity({ emitEvent: false });
    }
    /**
     * @return {?}
     */
    _checkForErrors() {
        if (!this._isStandalone()) {
            this._checkParentType();
        }
        this._checkName();
    }
    /**
     * @return {?}
     */
    _checkParentType() {
        if (!(this._parent instanceof NgModelGroup) &&
            this._parent instanceof AbstractFormGroupDirective) {
            TemplateDrivenErrors.formGroupNameException();
        }
        else if (!(this._parent instanceof NgModelGroup) && !(this._parent instanceof NgForm)) {
            TemplateDrivenErrors.modelParentException();
        }
    }
    /**
     * @return {?}
     */
    _checkName() {
        if (this.options && this.options.name)
            this.name = this.options.name;
        if (!this._isStandalone() && !this.name) {
            TemplateDrivenErrors.missingNameException();
        }
    }
    /**
     * @param {?} value
     * @return {?}
     */
    _updateValue(value) {
        resolvedPromise.then(() => { this.control.setValue(value, { emitViewToModelChange: false }); });
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    _updateDisabled(changes) {
        /** @type {?} */
        const disabledValue = changes['isDisabled'].currentValue;
        /** @type {?} */
        const isDisabled = disabledValue === '' || (disabledValue && disabledValue !== 'false');
        resolvedPromise.then(() => {
            if (isDisabled && !this.control.disabled) {
                this.control.disable();
            }
            else if (!isDisabled && this.control.disabled) {
                this.control.enable();
            }
        });
    }
}
NgModel.decorators = [
    { type: Directive, args: [{
                selector: '[ngModel]:not([formControlName]):not([formControl])',
                providers: [formControlBinding],
                exportAs: 'ngModel'
            },] }
];
/** @nocollapse */
NgModel.ctorParameters = () => [
    { type: ControlContainer, decorators: [{ type: Optional }, { type: Host }] },
    { type: Array, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_VALIDATORS,] }] },
    { type: Array, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_ASYNC_VALIDATORS,] }] },
    { type: Array, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [NG_VALUE_ACCESSOR,] }] }
];
NgModel.propDecorators = {
    name: [{ type: Input }],
    isDisabled: [{ type: Input, args: ['disabled',] }],
    model: [{ type: Input, args: ['ngModel',] }],
    options: [{ type: Input, args: ['ngModelOptions',] }],
    update: [{ type: Output, args: ['ngModelChange',] }]
};
if (false) {
    /** @type {?} */
    NgModel.prototype.control;
    /**
     * \@internal
     * @type {?}
     */
    NgModel.prototype._registered;
    /**
     * \@description
     * Internal reference to the view model value.
     * @type {?}
     */
    NgModel.prototype.viewModel;
    /**
     * \@description
     * Tracks the name bound to the directive. The parent form
     * uses this name as a key to retrieve this control's value.
     * @type {?}
     */
    NgModel.prototype.name;
    /**
     * \@description
     * Tracks whether the control is disabled.
     * @type {?}
     */
    NgModel.prototype.isDisabled;
    /**
     * \@description
     * Tracks the value bound to this directive.
     * @type {?}
     */
    NgModel.prototype.model;
    /**
     * \@description
     * Tracks the configuration options for this `ngModel` instance.
     *
     * **name**: An alternative to setting the name attribute on the form control element. See
     * the [example](api/forms/NgModel#using-ngmodel-on-a-standalone-control) for using `NgModel`
     * as a standalone control.
     *
     * **standalone**: When set to true, the `ngModel` will not register itself with its parent form,
     * and acts as if it's not in the form. Defaults to false.
     *
     * **updateOn**: Defines the event upon which the form control value and validity update.
     * Defaults to 'change'. Possible values: `'change'` | `'blur'` | `'submit'`.
     *
     * @type {?}
     */
    NgModel.prototype.options;
    /**
     * \@description
     * Event emitter for producing the `ngModelChange` event after
     * the view model updates.
     * @type {?}
     */
    NgModel.prototype.update;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfbW9kZWwuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9mb3Jtcy9zcmMvZGlyZWN0aXZlcy9uZ19tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUF3QixRQUFRLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBaUIsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXBKLE9BQU8sRUFBQyxXQUFXLEVBQVksTUFBTSxVQUFVLENBQUM7QUFDaEQsT0FBTyxFQUFDLG1CQUFtQixFQUFFLGFBQWEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUVqRSxPQUFPLEVBQUMsMEJBQTBCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUMzRSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNyRCxPQUFPLEVBQXVCLGlCQUFpQixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDakYsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUN2QyxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ2pDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUM5QyxPQUFPLEVBQUMsc0JBQXNCLEVBQUUsaUJBQWlCLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFLG1CQUFtQixFQUFFLFlBQVksRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUN0SSxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQzs7QUFHOUQsTUFBTSxPQUFPLGtCQUFrQixHQUFRO0lBQ3JDLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLFdBQVcsRUFBRSxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDO0NBQ3ZDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BbUJLLGVB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QUFRLEVBQUUsU0FBUzthQUNwQjs7OztZQXhITyxnQkFBZ0IsdUJBb0xULFFBQVEsWUFBSSxJQUFJO1lBQ3NDLEtBQUssdUJBQTNELFFBQVEsWUFBSSxJQUFJLFlBQUksTUFBTSxTQUFDLGFBQWE7WUFDeUIsS0FBSyx1QkFBdEUsUUFBUSxZQUFJLElBQUksWUFBSSxNQUFNLFNBQUMsbUJBQW1CO3dDQUM5QyxRQUFRLFlBQUksSUFBSSxZQUFJLE1BQU0sU0FBQyxpQkFBaUI7OzttQkE1Q3hELEtBQUs7eUJBT0wsS0FBSyxTQUFDLFVBQVU7b0JBTWhCLEtBQUssU0FBQyxTQUFTO3NCQWtCZixLQUFLLFNBQUMsZ0JBQWdCO3FCQVF0QixNQUFNLFNBQUMsZUFBZTs7OztJQXZEdkIsMEJBQXlEOzs7OztJQUV6RCw4QkFBb0I7Ozs7OztJQU1wQiw0QkFBZTs7Ozs7OztJQVFmLHVCQUF3Qjs7Ozs7O0lBT3hCLDZCQUF5Qzs7Ozs7O0lBTXpDLHdCQUE2Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFrQjdCLDBCQUN1RTs7Ozs7OztJQU92RSx5QkFBcUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBFdmVudEVtaXR0ZXIsIEhvc3QsIEluamVjdCwgSW5wdXQsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBPcHRpb25hbCwgT3V0cHV0LCBTZWxmLCBTaW1wbGVDaGFuZ2VzLCBmb3J3YXJkUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtGb3JtQ29udHJvbCwgRm9ybUhvb2tzfSBmcm9tICcuLi9tb2RlbCc7XG5pbXBvcnQge05HX0FTWU5DX1ZBTElEQVRPUlMsIE5HX1ZBTElEQVRPUlN9IGZyb20gJy4uL3ZhbGlkYXRvcnMnO1xuXG5pbXBvcnQge0Fic3RyYWN0Rm9ybUdyb3VwRGlyZWN0aXZlfSBmcm9tICcuL2Fic3RyYWN0X2Zvcm1fZ3JvdXBfZGlyZWN0aXZlJztcbmltcG9ydCB7Q29udHJvbENvbnRhaW5lcn0gZnJvbSAnLi9jb250cm9sX2NvbnRhaW5lcic7XG5pbXBvcnQge0NvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxVRV9BQ0NFU1NPUn0gZnJvbSAnLi9jb250cm9sX3ZhbHVlX2FjY2Vzc29yJztcbmltcG9ydCB7TmdDb250cm9sfSBmcm9tICcuL25nX2NvbnRyb2wnO1xuaW1wb3J0IHtOZ0Zvcm19IGZyb20gJy4vbmdfZm9ybSc7XG5pbXBvcnQge05nTW9kZWxHcm91cH0gZnJvbSAnLi9uZ19tb2RlbF9ncm91cCc7XG5pbXBvcnQge2NvbXBvc2VBc3luY1ZhbGlkYXRvcnMsIGNvbXBvc2VWYWxpZGF0b3JzLCBjb250cm9sUGF0aCwgaXNQcm9wZXJ0eVVwZGF0ZWQsIHNlbGVjdFZhbHVlQWNjZXNzb3IsIHNldFVwQ29udHJvbH0gZnJvbSAnLi9zaGFyZWQnO1xuaW1wb3J0IHtUZW1wbGF0ZURyaXZlbkVycm9yc30gZnJvbSAnLi90ZW1wbGF0ZV9kcml2ZW5fZXJyb3JzJztcbmltcG9ydCB7QXN5bmNWYWxpZGF0b3IsIEFzeW5jVmFsaWRhdG9yRm4sIFZhbGlkYXRvciwgVmFsaWRhdG9yRm59IGZyb20gJy4vdmFsaWRhdG9ycyc7XG5cbmV4cG9ydCBjb25zdCBmb3JtQ29udHJvbEJpbmRpbmc6IGFueSA9IHtcbiAgcHJvdmlkZTogTmdDb250cm9sLFxuICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBOZ01vZGVsKVxufTtcblxuLyoqXG4gKiBgbmdNb2RlbGAgZm9yY2VzIGFuIGFkZGl0aW9uYWwgY2hhbmdlIGRldGVjdGlvbiBydW4gd2hlbiBpdHMgaW5wdXRzIGNoYW5nZTpcbiAqIEUuZy46XG4gKiBgYGBcbiAqIDxkaXY+e3tteU1vZGVsLnZhbGlkfX08L2Rpdj5cbiAqIDxpbnB1dCBbKG5nTW9kZWwpXT1cIm15VmFsdWVcIiAjbXlNb2RlbD1cIm5nTW9kZWxcIj5cbiAqIGBgYFxuICogSS5lLiBgbmdNb2RlbGAgY2FuIGV4cG9ydCBpdHNlbGYgb24gdGhlIGVsZW1lbnQgYW5kIHRoZW4gYmUgdXNlZCBpbiB0aGUgdGVtcGxhdGUuXG4gKiBOb3JtYWxseSwgdGhpcyB3b3VsZCByZXN1bHQgaW4gZXhwcmVzc2lvbnMgYmVmb3JlIHRoZSBgaW5wdXRgIHRoYXQgdXNlIHRoZSBleHBvcnRlZCBkaXJlY3RpdmVcbiAqIHRvIGhhdmUgYW5kIG9sZCB2YWx1ZSBhcyB0aGV5IGhhdmUgYmVlblxuICogZGlydHkgY2hlY2tlZCBiZWZvcmUuIEFzIHRoaXMgaXMgYSB2ZXJ5IGNvbW1vbiBjYXNlIGZvciBgbmdNb2RlbGAsIHdlIGFkZGVkIHRoaXMgc2Vjb25kIGNoYW5nZVxuICogZGV0ZWN0aW9uIHJ1bi5cbiAqXG4gKiBOb3RlczpcbiAqIC0gdGhpcyBpcyBqdXN0IG9uZSBleHRyYSBydW4gbm8gbWF0dGVyIGhvdyBtYW55IGBuZ01vZGVsYCBoYXZlIGJlZW4gY2hhbmdlZC5cbiAqIC0gdGhpcyBpcyBhIGdlbmVyYWwgcHJvYmxlbSB3aGVuIHVzaW5nIGBleHBvcnRBc2AgZm9yIGRpcmVjdGl2ZXMhXG4gKi9cbmNvbnN0IHJlc29sdmVkUHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShudWxsKTtcblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIENyZWF0ZXMgYSBgRm9ybUNvbnRyb2xgIGluc3RhbmNlIGZyb20gYSBkb21haW4gbW9kZWwgYW5kIGJpbmRzIGl0XG4gKiB0byBhIGZvcm0gY29udHJvbCBlbGVtZW50LlxuICpcbiAqIFRoZSBgRm9ybUNvbnRyb2xgIGluc3RhbmNlIHRyYWNrcyB0aGUgdmFsdWUsIHVzZXIgaW50ZXJhY3Rpb24sIGFuZFxuICogdmFsaWRhdGlvbiBzdGF0dXMgb2YgdGhlIGNvbnRyb2wgYW5kIGtlZXBzIHRoZSB2aWV3IHN5bmNlZCB3aXRoIHRoZSBtb2RlbC4gSWYgdXNlZFxuICogd2l0aGluIGEgcGFyZW50IGZvcm0sIHRoZSBkaXJlY3RpdmUgYWxzbyByZWdpc3RlcnMgaXRzZWxmIHdpdGggdGhlIGZvcm0gYXMgYSBjaGlsZFxuICogY29udHJvbC5cbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSBpcyB1c2VkIGJ5IGl0c2VsZiBvciBhcyBwYXJ0IG9mIGEgbGFyZ2VyIGZvcm0uIFVzZSB0aGVcbiAqIGBuZ01vZGVsYCBzZWxlY3RvciB0byBhY3RpdmF0ZSBpdC5cbiAqXG4gKiBJdCBhY2NlcHRzIGEgZG9tYWluIG1vZGVsIGFzIGFuIG9wdGlvbmFsIGBJbnB1dGAuIElmIHlvdSBoYXZlIGEgb25lLXdheSBiaW5kaW5nXG4gKiB0byBgbmdNb2RlbGAgd2l0aCBgW11gIHN5bnRheCwgY2hhbmdpbmcgdGhlIHZhbHVlIG9mIHRoZSBkb21haW4gbW9kZWwgaW4gdGhlIGNvbXBvbmVudFxuICogY2xhc3Mgc2V0cyB0aGUgdmFsdWUgaW4gdGhlIHZpZXcuIElmIHlvdSBoYXZlIGEgdHdvLXdheSBiaW5kaW5nIHdpdGggYFsoKV1gIHN5bnRheFxuICogKGFsc28ga25vd24gYXMgJ2JhbmFuYS1ib3ggc3ludGF4JyksIHRoZSB2YWx1ZSBpbiB0aGUgVUkgYWx3YXlzIHN5bmNzIGJhY2sgdG9cbiAqIHRoZSBkb21haW4gbW9kZWwgaW4geW91ciBjbGFzcy5cbiAqXG4gKiBUbyBpbnNwZWN0IHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBhc3NvY2lhdGVkIGBGb3JtQ29udHJvbGAgKGxpa2UgdmFsaWRpdHkgc3RhdGUpLCBcbiAqIGV4cG9ydCB0aGUgZGlyZWN0aXZlIGludG8gYSBsb2NhbCB0ZW1wbGF0ZSB2YXJpYWJsZSB1c2luZyBgbmdNb2RlbGAgYXMgdGhlIGtleSAoZXg6IGAjbXlWYXI9XCJuZ01vZGVsXCJgKS5cbiAqIFlvdSB0aGVuIGFjY2VzcyB0aGUgY29udHJvbCB1c2luZyB0aGUgZGlyZWN0aXZlJ3MgYGNvbnRyb2xgIHByb3BlcnR5LCBcbiAqIGJ1dCBtb3N0IHByb3BlcnRpZXMgdXNlZCAobGlrZSBgdmFsaWRgIGFuZCBgZGlydHlgKSBmYWxsIHRocm91Z2ggdG8gdGhlIGNvbnRyb2wgYW55d2F5IGZvciBkaXJlY3QgYWNjZXNzLiBcbiAqIFNlZSBhIGZ1bGwgbGlzdCBvZiBwcm9wZXJ0aWVzIGRpcmVjdGx5IGF2YWlsYWJsZSBpbiBgQWJzdHJhY3RDb250cm9sRGlyZWN0aXZlYC5cbiAqXG4gKiBAc2VlIGBSYWRpb0NvbnRyb2xWYWx1ZUFjY2Vzc29yYCBcbiAqIEBzZWUgYFNlbGVjdENvbnRyb2xWYWx1ZUFjY2Vzc29yYFxuICogXG4gKiBAdXNhZ2VOb3Rlc1xuICogXG4gKiAjIyMgVXNpbmcgbmdNb2RlbCBvbiBhIHN0YW5kYWxvbmUgY29udHJvbFxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZXMgc2hvdyBhIHNpbXBsZSBzdGFuZGFsb25lIGNvbnRyb2wgdXNpbmcgYG5nTW9kZWxgOlxuICpcbiAqIHtAZXhhbXBsZSBmb3Jtcy90cy9zaW1wbGVOZ01vZGVsL3NpbXBsZV9uZ19tb2RlbF9leGFtcGxlLnRzIHJlZ2lvbj0nQ29tcG9uZW50J31cbiAqXG4gKiBXaGVuIHVzaW5nIHRoZSBgbmdNb2RlbGAgd2l0aGluIGA8Zm9ybT5gIHRhZ3MsIHlvdSdsbCBhbHNvIG5lZWQgdG8gc3VwcGx5IGEgYG5hbWVgIGF0dHJpYnV0ZVxuICogc28gdGhhdCB0aGUgY29udHJvbCBjYW4gYmUgcmVnaXN0ZXJlZCB3aXRoIHRoZSBwYXJlbnQgZm9ybSB1bmRlciB0aGF0IG5hbWUuXG4gKlxuICogSW4gdGhlIGNvbnRleHQgb2YgYSBwYXJlbnQgZm9ybSwgaXQncyBvZnRlbiB1bm5lY2Vzc2FyeSB0byBpbmNsdWRlIG9uZS13YXkgb3IgdHdvLXdheSBiaW5kaW5nLCBcbiAqIGFzIHRoZSBwYXJlbnQgZm9ybSBzeW5jcyB0aGUgdmFsdWUgZm9yIHlvdS4gWW91IGFjY2VzcyBpdHMgcHJvcGVydGllcyBieSBleHBvcnRpbmcgaXQgaW50byBhIFxuICogbG9jYWwgdGVtcGxhdGUgdmFyaWFibGUgdXNpbmcgYG5nRm9ybWAgc3VjaCBhcyAoYCNmPVwibmdGb3JtXCJgKS4gVXNlIHRoZSB2YXJpYWJsZSB3aGVyZSBcbiAqIG5lZWRlZCBvbiBmb3JtIHN1Ym1pc3Npb24uXG4gKlxuICogSWYgeW91IGRvIG5lZWQgdG8gcG9wdWxhdGUgaW5pdGlhbCB2YWx1ZXMgaW50byB5b3VyIGZvcm0sIHVzaW5nIGEgb25lLXdheSBiaW5kaW5nIGZvclxuICogYG5nTW9kZWxgIHRlbmRzIHRvIGJlIHN1ZmZpY2llbnQgYXMgbG9uZyBhcyB5b3UgdXNlIHRoZSBleHBvcnRlZCBmb3JtJ3MgdmFsdWUgcmF0aGVyXG4gKiB0aGFuIHRoZSBkb21haW4gbW9kZWwncyB2YWx1ZSBvbiBzdWJtaXQuXG4gKiBcbiAqICMjIyBVc2luZyBuZ01vZGVsIHdpdGhpbiBhIGZvcm1cbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgc2hvd3MgY29udHJvbHMgdXNpbmcgYG5nTW9kZWxgIHdpdGhpbiBhIGZvcm06XG4gKlxuICoge0BleGFtcGxlIGZvcm1zL3RzL3NpbXBsZUZvcm0vc2ltcGxlX2Zvcm1fZXhhbXBsZS50cyByZWdpb249J0NvbXBvbmVudCd9XG4gKiBcbiAqICMjIyBVc2luZyBhIHN0YW5kYWxvbmUgbmdNb2RlbCB3aXRoaW4gYSBncm91cFxuICogXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgc2hvd3MgeW91IGhvdyB0byB1c2UgYSBzdGFuZGFsb25lIG5nTW9kZWwgY29udHJvbFxuICogd2l0aGluIGEgZm9ybS4gVGhpcyBjb250cm9scyB0aGUgZGlzcGxheSBvZiB0aGUgZm9ybSwgYnV0IGRvZXNuJ3QgY29udGFpbiBmb3JtIGRhdGEuXG4gKlxuICogYGBgaHRtbFxuICogPGZvcm0+XG4gKiAgIDxpbnB1dCBuYW1lPVwibG9naW5cIiBuZ01vZGVsIHBsYWNlaG9sZGVyPVwiTG9naW5cIj5cbiAqICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIG5nTW9kZWwgW25nTW9kZWxPcHRpb25zXT1cIntzdGFuZGFsb25lOiB0cnVlfVwiPiBTaG93IG1vcmUgb3B0aW9ucz9cbiAqIDwvZm9ybT5cbiAqIDwhLS0gZm9ybSB2YWx1ZToge2xvZ2luOiAnJ30gLS0+XG4gKiBgYGBcbiAqIFxuICogIyMjIFNldHRpbmcgdGhlIG5nTW9kZWwgbmFtZSBhdHRyaWJ1dGUgdGhyb3VnaCBvcHRpb25zXG4gKiBcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBzaG93cyB5b3UgYW4gYWx0ZXJuYXRlIHdheSB0byBzZXQgdGhlIG5hbWUgYXR0cmlidXRlLiBUaGUgbmFtZSBhdHRyaWJ1dGUgaXMgdXNlZFxuICogd2l0aGluIGEgY3VzdG9tIGZvcm0gY29tcG9uZW50LCBhbmQgdGhlIG5hbWUgYEBJbnB1dGAgcHJvcGVydHkgc2VydmVzIGEgZGlmZmVyZW50IHB1cnBvc2UuXG4gKlxuICogYGBgaHRtbFxuICogPGZvcm0+XG4gKiAgIDxteS1wZXJzb24tY29udHJvbCBuYW1lPVwiTmFuY3lcIiBuZ01vZGVsIFtuZ01vZGVsT3B0aW9uc109XCJ7bmFtZTogJ3VzZXInfVwiPlxuICogICA8L215LXBlcnNvbi1jb250cm9sPlxuICogPC9mb3JtPlxuICogPCEtLSBmb3JtIHZhbHVlOiB7dXNlcjogJyd9IC0tPlxuICogYGBgXG4gKlxuICogQG5nTW9kdWxlIEZvcm1zTW9kdWxlXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tuZ01vZGVsXTpub3QoW2Zvcm1Db250cm9sTmFtZV0pOm5vdChbZm9ybUNvbnRyb2xdKScsXG4gIHByb3ZpZGVyczogW2Zvcm1Db250cm9sQmluZGluZ10sXG4gIGV4cG9ydEFzOiAnbmdNb2RlbCdcbn0pXG5leHBvcnQgY2xhc3MgTmdNb2RlbCBleHRlbmRzIE5nQ29udHJvbCBpbXBsZW1lbnRzIE9uQ2hhbmdlcyxcbiAgICBPbkRlc3Ryb3kge1xuICBwdWJsaWMgcmVhZG9ubHkgY29udHJvbDogRm9ybUNvbnRyb2wgPSBuZXcgRm9ybUNvbnRyb2woKTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmVnaXN0ZXJlZCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogSW50ZXJuYWwgcmVmZXJlbmNlIHRvIHRoZSB2aWV3IG1vZGVsIHZhbHVlLlxuICAgKi9cbiAgdmlld01vZGVsOiBhbnk7XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUcmFja3MgdGhlIG5hbWUgYm91bmQgdG8gdGhlIGRpcmVjdGl2ZS4gVGhlIHBhcmVudCBmb3JtXG4gICAqIHVzZXMgdGhpcyBuYW1lIGFzIGEga2V5IHRvIHJldHJpZXZlIHRoaXMgY29udHJvbCdzIHZhbHVlLlxuICAgKi9cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIEBJbnB1dCgpIG5hbWUgITogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVHJhY2tzIHdoZXRoZXIgdGhlIGNvbnRyb2wgaXMgZGlzYWJsZWQuXG4gICAqL1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgQElucHV0KCdkaXNhYmxlZCcpIGlzRGlzYWJsZWQgITogYm9vbGVhbjtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFRyYWNrcyB0aGUgdmFsdWUgYm91bmQgdG8gdGhpcyBkaXJlY3RpdmUuXG4gICAqL1xuICBASW5wdXQoJ25nTW9kZWwnKSBtb2RlbDogYW55O1xuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVHJhY2tzIHRoZSBjb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIHRoaXMgYG5nTW9kZWxgIGluc3RhbmNlLlxuICAgKlxuICAgKiAqKm5hbWUqKjogQW4gYWx0ZXJuYXRpdmUgdG8gc2V0dGluZyB0aGUgbmFtZSBhdHRyaWJ1dGUgb24gdGhlIGZvcm0gY29udHJvbCBlbGVtZW50LiBTZWVcbiAgICogdGhlIFtleGFtcGxlXShhcGkvZm9ybXMvTmdNb2RlbCN1c2luZy1uZ21vZGVsLW9uLWEtc3RhbmRhbG9uZS1jb250cm9sKSBmb3IgdXNpbmcgYE5nTW9kZWxgXG4gICAqIGFzIGEgc3RhbmRhbG9uZSBjb250cm9sLlxuICAgKlxuICAgKiAqKnN0YW5kYWxvbmUqKjogV2hlbiBzZXQgdG8gdHJ1ZSwgdGhlIGBuZ01vZGVsYCB3aWxsIG5vdCByZWdpc3RlciBpdHNlbGYgd2l0aCBpdHMgcGFyZW50IGZvcm0sXG4gICAqIGFuZCBhY3RzIGFzIGlmIGl0J3Mgbm90IGluIHRoZSBmb3JtLiBEZWZhdWx0cyB0byBmYWxzZS5cbiAgICpcbiAgICogKip1cGRhdGVPbioqOiBEZWZpbmVzIHRoZSBldmVudCB1cG9uIHdoaWNoIHRoZSBmb3JtIGNvbnRyb2wgdmFsdWUgYW5kIHZhbGlkaXR5IHVwZGF0ZS5cbiAgICogRGVmYXVsdHMgdG8gJ2NoYW5nZScuIFBvc3NpYmxlIHZhbHVlczogYCdjaGFuZ2UnYCB8IGAnYmx1cidgIHwgYCdzdWJtaXQnYC5cbiAgICpcbiAgICovXG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBASW5wdXQoJ25nTW9kZWxPcHRpb25zJylcbiAgb3B0aW9ucyAhOiB7bmFtZT86IHN0cmluZywgc3RhbmRhbG9uZT86IGJvb2xlYW4sIHVwZGF0ZU9uPzogRm9ybUhvb2tzfTtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIEV2ZW50IGVtaXR0ZXIgZm9yIHByb2R1Y2luZyB0aGUgYG5nTW9kZWxDaGFuZ2VgIGV2ZW50IGFmdGVyXG4gICAqIHRoZSB2aWV3IG1vZGVsIHVwZGF0ZXMuXG4gICAqL1xuICBAT3V0cHV0KCduZ01vZGVsQ2hhbmdlJykgdXBkYXRlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIEBIb3N0KCkgcGFyZW50OiBDb250cm9sQ29udGFpbmVyLFxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoTkdfVkFMSURBVE9SUykgdmFsaWRhdG9yczogQXJyYXk8VmFsaWRhdG9yfFZhbGlkYXRvckZuPixcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBASW5qZWN0KE5HX0FTWU5DX1ZBTElEQVRPUlMpIGFzeW5jVmFsaWRhdG9yczogQXJyYXk8QXN5bmNWYWxpZGF0b3J8QXN5bmNWYWxpZGF0b3JGbj4sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBTZWxmKCkgQEluamVjdChOR19WQUxVRV9BQ0NFU1NPUilcbiAgICAgICAgICAgICAgdmFsdWVBY2Nlc3NvcnM6IENvbnRyb2xWYWx1ZUFjY2Vzc29yW10pIHtcbiAgICAgICAgICAgICAgICBzdXBlcigpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3BhcmVudCA9IHBhcmVudDtcbiAgICAgICAgICAgICAgICB0aGlzLl9yYXdWYWxpZGF0b3JzID0gdmFsaWRhdG9ycyB8fCBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLl9yYXdBc3luY1ZhbGlkYXRvcnMgPSBhc3luY1ZhbGlkYXRvcnMgfHwgW107XG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZUFjY2Vzc29yID0gc2VsZWN0VmFsdWVBY2Nlc3Nvcih0aGlzLCB2YWx1ZUFjY2Vzc29ycyk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICogQGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAqIEEgbGlmZWN5Y2xlIG1ldGhvZCBjYWxsZWQgd2hlbiB0aGUgZGlyZWN0aXZlJ3MgaW5wdXRzIGNoYW5nZS4gRm9yIGludGVybmFsIHVzZVxuICAgICAgICAgICAgICAgKiBvbmx5LlxuICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgKiBAcGFyYW0gY2hhbmdlcyBBIG9iamVjdCBvZiBrZXkvdmFsdWUgcGFpcnMgZm9yIHRoZSBzZXQgb2YgY2hhbmdlZCBpbnB1dHMuXG4gICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2hlY2tGb3JFcnJvcnMoKTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX3JlZ2lzdGVyZWQpIHRoaXMuX3NldFVwQ29udHJvbCgpO1xuICAgICAgICAgICAgICAgIGlmICgnaXNEaXNhYmxlZCcgaW4gY2hhbmdlcykge1xuICAgICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlRGlzYWJsZWQoY2hhbmdlcyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGlzUHJvcGVydHlVcGRhdGVkKGNoYW5nZXMsIHRoaXMudmlld01vZGVsKSkge1xuICAgICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlVmFsdWUodGhpcy5tb2RlbCk7XG4gICAgICAgICAgICAgICAgICB0aGlzLnZpZXdNb2RlbCA9IHRoaXMubW9kZWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgKiBMaWZlY3ljbGUgbWV0aG9kIGNhbGxlZCBiZWZvcmUgdGhlIGRpcmVjdGl2ZSdzIGluc3RhbmNlIGlzIGRlc3Ryb3llZC4gRm9yIGludGVybmFsXG4gICAgICAgICAgICAgICAqIHVzZSBvbmx5LlxuICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgbmdPbkRlc3Ryb3koKTogdm9pZCB7IHRoaXMuZm9ybURpcmVjdGl2ZSAmJiB0aGlzLmZvcm1EaXJlY3RpdmUucmVtb3ZlQ29udHJvbCh0aGlzKTsgfVxuXG4gICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICogUmV0dXJucyBhbiBhcnJheSB0aGF0IHJlcHJlc2VudHMgdGhlIHBhdGggZnJvbSB0aGUgdG9wLWxldmVsIGZvcm0gdG8gdGhpcyBjb250cm9sLlxuICAgICAgICAgICAgICAgKiBFYWNoIGluZGV4IGlzIHRoZSBzdHJpbmcgbmFtZSBvZiB0aGUgY29udHJvbCBvbiB0aGF0IGxldmVsLlxuICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgZ2V0IHBhdGgoKTogc3RyaW5nW10ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9wYXJlbnQgPyBjb250cm9sUGF0aCh0aGlzLm5hbWUsIHRoaXMuX3BhcmVudCkgOiBbdGhpcy5uYW1lXTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICogVGhlIHRvcC1sZXZlbCBkaXJlY3RpdmUgZm9yIHRoaXMgY29udHJvbCBpZiBwcmVzZW50LCBvdGhlcndpc2UgbnVsbC5cbiAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgIGdldCBmb3JtRGlyZWN0aXZlKCk6IGFueSB7IHJldHVybiB0aGlzLl9wYXJlbnQgPyB0aGlzLl9wYXJlbnQuZm9ybURpcmVjdGl2ZSA6IG51bGw7IH1cblxuICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICogQGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAqIFN5bmNocm9ub3VzIHZhbGlkYXRvciBmdW5jdGlvbiBjb21wb3NlZCBvZiBhbGwgdGhlIHN5bmNocm9ub3VzIHZhbGlkYXRvcnNcbiAgICAgICAgICAgICAgICogcmVnaXN0ZXJlZCB3aXRoIHRoaXMgZGlyZWN0aXZlLlxuICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgZ2V0IHZhbGlkYXRvcigpOiBWYWxpZGF0b3JGbnxudWxsIHsgcmV0dXJuIGNvbXBvc2VWYWxpZGF0b3JzKHRoaXMuX3Jhd1ZhbGlkYXRvcnMpOyB9XG5cbiAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgKiBBc3luYyB2YWxpZGF0b3IgZnVuY3Rpb24gY29tcG9zZWQgb2YgYWxsIHRoZSBhc3luYyB2YWxpZGF0b3JzIHJlZ2lzdGVyZWQgd2l0aCB0aGlzXG4gICAgICAgICAgICAgICAqIGRpcmVjdGl2ZS5cbiAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgIGdldCBhc3luY1ZhbGlkYXRvcigpOiBBc3luY1ZhbGlkYXRvckZufG51bGwge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21wb3NlQXN5bmNWYWxpZGF0b3JzKHRoaXMuX3Jhd0FzeW5jVmFsaWRhdG9ycyk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICogQGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAqIFNldHMgdGhlIG5ldyB2YWx1ZSBmb3IgdGhlIHZpZXcgbW9kZWwgYW5kIGVtaXRzIGFuIGBuZ01vZGVsQ2hhbmdlYCBldmVudC5cbiAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICogQHBhcmFtIG5ld1ZhbHVlIFRoZSBuZXcgdmFsdWUgZW1pdHRlZCBieSBgbmdNb2RlbENoYW5nZWAuXG4gICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICB2aWV3VG9Nb2RlbFVwZGF0ZShuZXdWYWx1ZTogYW55KTogdm9pZCB7XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3TW9kZWwgPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZS5lbWl0KG5ld1ZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHByaXZhdGUgX3NldFVwQ29udHJvbCgpOiB2b2lkIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRVcGRhdGVTdHJhdGVneSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2lzU3RhbmRhbG9uZSgpID8gdGhpcy5fc2V0VXBTdGFuZGFsb25lKCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mb3JtRGlyZWN0aXZlLmFkZENvbnRyb2wodGhpcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVnaXN0ZXJlZCA9IHRydWU7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBwcml2YXRlIF9zZXRVcGRhdGVTdHJhdGVneSgpOiB2b2lkIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zICYmIHRoaXMub3B0aW9ucy51cGRhdGVPbiAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLmNvbnRyb2wuX3VwZGF0ZU9uID0gdGhpcy5vcHRpb25zLnVwZGF0ZU9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHByaXZhdGUgX2lzU3RhbmRhbG9uZSgpOiBib29sZWFuIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gIXRoaXMuX3BhcmVudCB8fCAhISh0aGlzLm9wdGlvbnMgJiYgdGhpcy5vcHRpb25zLnN0YW5kYWxvbmUpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcHJpdmF0ZSBfc2V0VXBTdGFuZGFsb25lKCk6IHZvaWQge1xuICAgICAgICAgICAgICAgIHNldFVwQ29udHJvbCh0aGlzLmNvbnRyb2wsIHRoaXMpO1xuICAgICAgICAgICAgICAgIHRoaXMuY29udHJvbC51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KHtlbWl0RXZlbnQ6IGZhbHNlfSk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBwcml2YXRlIF9jaGVja0ZvckVycm9ycygpOiB2b2lkIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX2lzU3RhbmRhbG9uZSgpKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLl9jaGVja1BhcmVudFR5cGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fY2hlY2tOYW1lKCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBwcml2YXRlIF9jaGVja1BhcmVudFR5cGUoKTogdm9pZCB7XG4gICAgICAgICAgICAgICAgaWYgKCEodGhpcy5fcGFyZW50IGluc3RhbmNlb2YgTmdNb2RlbEdyb3VwKSAmJlxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wYXJlbnQgaW5zdGFuY2VvZiBBYnN0cmFjdEZvcm1Hcm91cERpcmVjdGl2ZSkge1xuICAgICAgICAgICAgICAgICAgVGVtcGxhdGVEcml2ZW5FcnJvcnMuZm9ybUdyb3VwTmFtZUV4Y2VwdGlvbigpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgICEodGhpcy5fcGFyZW50IGluc3RhbmNlb2YgTmdNb2RlbEdyb3VwKSAmJiAhKHRoaXMuX3BhcmVudCBpbnN0YW5jZW9mIE5nRm9ybSkpIHtcbiAgICAgICAgICAgICAgICAgIFRlbXBsYXRlRHJpdmVuRXJyb3JzLm1vZGVsUGFyZW50RXhjZXB0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcHJpdmF0ZSBfY2hlY2tOYW1lKCk6IHZvaWQge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMgJiYgdGhpcy5vcHRpb25zLm5hbWUpIHRoaXMubmFtZSA9IHRoaXMub3B0aW9ucy5uYW1lO1xuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1N0YW5kYWxvbmUoKSAmJiAhdGhpcy5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICBUZW1wbGF0ZURyaXZlbkVycm9ycy5taXNzaW5nTmFtZUV4Y2VwdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHByaXZhdGUgX3VwZGF0ZVZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlZFByb21pc2UudGhlbihcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4geyB0aGlzLmNvbnRyb2wuc2V0VmFsdWUodmFsdWUsIHtlbWl0Vmlld1RvTW9kZWxDaGFuZ2U6IGZhbHNlfSk7IH0pO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcHJpdmF0ZSBfdXBkYXRlRGlzYWJsZWQoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpc2FibGVkVmFsdWUgPSBjaGFuZ2VzWydpc0Rpc2FibGVkJ10uY3VycmVudFZhbHVlO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgaXNEaXNhYmxlZCA9XG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkVmFsdWUgPT09ICcnIHx8IChkaXNhYmxlZFZhbHVlICYmIGRpc2FibGVkVmFsdWUgIT09ICdmYWxzZScpO1xuXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKGlzRGlzYWJsZWQgJiYgIXRoaXMuY29udHJvbC5kaXNhYmxlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRyb2wuZGlzYWJsZSgpO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICghaXNEaXNhYmxlZCAmJiB0aGlzLmNvbnRyb2wuZGlzYWJsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250cm9sLmVuYWJsZSgpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG59XG4iXX0=