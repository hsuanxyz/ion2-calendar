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
import { isDevMode, ɵlooseIdentical as looseIdentical } from '@angular/core';
import { Validators } from '../validators';
import { CheckboxControlValueAccessor } from './checkbox_value_accessor';
import { DefaultValueAccessor } from './default_value_accessor';
import { normalizeAsyncValidator, normalizeValidator } from './normalize_validator';
import { NumberValueAccessor } from './number_value_accessor';
import { RadioControlValueAccessor } from './radio_control_value_accessor';
import { RangeValueAccessor } from './range_value_accessor';
import { ReactiveErrors } from './reactive_errors';
import { SelectControlValueAccessor } from './select_control_value_accessor';
import { SelectMultipleControlValueAccessor } from './select_multiple_control_value_accessor';
/**
 * @param {?} name
 * @param {?} parent
 * @return {?}
 */
export function controlPath(name, parent) {
    return [...(/** @type {?} */ (parent.path)), name];
}
/**
 * @param {?} control
 * @param {?} dir
 * @return {?}
 */
export function setUpControl(control, dir) {
    if (!control)
        _throwError(dir, 'Cannot find control with');
    if (!dir.valueAccessor)
        _throwError(dir, 'No value accessor for form control with');
    control.validator = Validators.compose([(/** @type {?} */ (control.validator)), dir.validator]);
    control.asyncValidator = Validators.composeAsync([(/** @type {?} */ (control.asyncValidator)), dir.asyncValidator]);
    (/** @type {?} */ (dir.valueAccessor)).writeValue(control.value);
    setUpViewChangePipeline(control, dir);
    setUpModelChangePipeline(control, dir);
    setUpBlurPipeline(control, dir);
    if ((/** @type {?} */ (dir.valueAccessor)).setDisabledState) {
        control.registerOnDisabledChange((isDisabled) => { (/** @type {?} */ ((/** @type {?} */ (dir.valueAccessor)).setDisabledState))(isDisabled); });
    }
    // re-run validation when validator binding changes, e.g. minlength=3 -> minlength=4
    dir._rawValidators.forEach((validator) => {
        if (((/** @type {?} */ (validator))).registerOnValidatorChange)
            (/** @type {?} */ (((/** @type {?} */ (validator))).registerOnValidatorChange))(() => control.updateValueAndValidity());
    });
    dir._rawAsyncValidators.forEach((validator) => {
        if (((/** @type {?} */ (validator))).registerOnValidatorChange)
            (/** @type {?} */ (((/** @type {?} */ (validator))).registerOnValidatorChange))(() => control.updateValueAndValidity());
    });
}
/**
 * @param {?} control
 * @param {?} dir
 * @return {?}
 */
export function cleanUpControl(control, dir) {
    (/** @type {?} */ (dir.valueAccessor)).registerOnChange(() => _noControlError(dir));
    (/** @type {?} */ (dir.valueAccessor)).registerOnTouched(() => _noControlError(dir));
    dir._rawValidators.forEach((validator) => {
        if (validator.registerOnValidatorChange) {
            validator.registerOnValidatorChange(null);
        }
    });
    dir._rawAsyncValidators.forEach((validator) => {
        if (validator.registerOnValidatorChange) {
            validator.registerOnValidatorChange(null);
        }
    });
    if (control)
        control._clearChangeFns();
}
/**
 * @param {?} control
 * @param {?} dir
 * @return {?}
 */
function setUpViewChangePipeline(control, dir) {
    (/** @type {?} */ (dir.valueAccessor)).registerOnChange((newValue) => {
        control._pendingValue = newValue;
        control._pendingChange = true;
        control._pendingDirty = true;
        if (control.updateOn === 'change')
            updateControl(control, dir);
    });
}
/**
 * @param {?} control
 * @param {?} dir
 * @return {?}
 */
function setUpBlurPipeline(control, dir) {
    (/** @type {?} */ (dir.valueAccessor)).registerOnTouched(() => {
        control._pendingTouched = true;
        if (control.updateOn === 'blur' && control._pendingChange)
            updateControl(control, dir);
        if (control.updateOn !== 'submit')
            control.markAsTouched();
    });
}
/**
 * @param {?} control
 * @param {?} dir
 * @return {?}
 */
function updateControl(control, dir) {
    if (control._pendingDirty)
        control.markAsDirty();
    control.setValue(control._pendingValue, { emitModelToViewChange: false });
    dir.viewToModelUpdate(control._pendingValue);
    control._pendingChange = false;
}
/**
 * @param {?} control
 * @param {?} dir
 * @return {?}
 */
function setUpModelChangePipeline(control, dir) {
    control.registerOnChange((newValue, emitModelEvent) => {
        // control -> view
        (/** @type {?} */ (dir.valueAccessor)).writeValue(newValue);
        // control -> ngModel
        if (emitModelEvent)
            dir.viewToModelUpdate(newValue);
    });
}
/**
 * @param {?} control
 * @param {?} dir
 * @return {?}
 */
export function setUpFormContainer(control, dir) {
    if (control == null)
        _throwError(dir, 'Cannot find control with');
    control.validator = Validators.compose([control.validator, dir.validator]);
    control.asyncValidator = Validators.composeAsync([control.asyncValidator, dir.asyncValidator]);
}
/**
 * @param {?} dir
 * @return {?}
 */
function _noControlError(dir) {
    return _throwError(dir, 'There is no FormControl instance attached to form control element with');
}
/**
 * @param {?} dir
 * @param {?} message
 * @return {?}
 */
function _throwError(dir, message) {
    /** @type {?} */
    let messageEnd;
    if ((/** @type {?} */ (dir.path)).length > 1) {
        messageEnd = `path: '${(/** @type {?} */ (dir.path)).join(' -> ')}'`;
    }
    else if ((/** @type {?} */ (dir.path))[0]) {
        messageEnd = `name: '${dir.path}'`;
    }
    else {
        messageEnd = 'unspecified name attribute';
    }
    throw new Error(`${message} ${messageEnd}`);
}
/**
 * @param {?} validators
 * @return {?}
 */
export function composeValidators(validators) {
    return validators != null ? Validators.compose(validators.map(normalizeValidator)) : null;
}
/**
 * @param {?} validators
 * @return {?}
 */
export function composeAsyncValidators(validators) {
    return validators != null ? Validators.composeAsync(validators.map(normalizeAsyncValidator)) :
        null;
}
/**
 * @param {?} changes
 * @param {?} viewModel
 * @return {?}
 */
export function isPropertyUpdated(changes, viewModel) {
    if (!changes.hasOwnProperty('model'))
        return false;
    /** @type {?} */
    const change = changes['model'];
    if (change.isFirstChange())
        return true;
    return !looseIdentical(viewModel, change.currentValue);
}
/** @type {?} */
const BUILTIN_ACCESSORS = [
    CheckboxControlValueAccessor,
    RangeValueAccessor,
    NumberValueAccessor,
    SelectControlValueAccessor,
    SelectMultipleControlValueAccessor,
    RadioControlValueAccessor,
];
/**
 * @param {?} valueAccessor
 * @return {?}
 */
export function isBuiltInAccessor(valueAccessor) {
    return BUILTIN_ACCESSORS.some(a => valueAccessor.constructor === a);
}
/**
 * @param {?} form
 * @param {?} directives
 * @return {?}
 */
export function syncPendingControls(form, directives) {
    form._syncPendingControls();
    directives.forEach(dir => {
        /** @type {?} */
        const control = (/** @type {?} */ (dir.control));
        if (control.updateOn === 'submit' && control._pendingChange) {
            dir.viewToModelUpdate(control._pendingValue);
            control._pendingChange = false;
        }
    });
}
// TODO: vsavkin remove it once https://github.com/angular/angular/issues/3011 is implemented
/**
 * @param {?} dir
 * @param {?} valueAccessors
 * @return {?}
 */
export function selectValueAccessor(dir, valueAccessors) {
    if (!valueAccessors)
        return null;
    if (!Array.isArray(valueAccessors))
        _throwError(dir, 'Value accessor was not provided as an array for form control with');
    /** @type {?} */
    let defaultAccessor = undefined;
    /** @type {?} */
    let builtinAccessor = undefined;
    /** @type {?} */
    let customAccessor = undefined;
    valueAccessors.forEach((v) => {
        if (v.constructor === DefaultValueAccessor) {
            defaultAccessor = v;
        }
        else if (isBuiltInAccessor(v)) {
            if (builtinAccessor)
                _throwError(dir, 'More than one built-in value accessor matches form control with');
            builtinAccessor = v;
        }
        else {
            if (customAccessor)
                _throwError(dir, 'More than one custom value accessor matches form control with');
            customAccessor = v;
        }
    });
    if (customAccessor)
        return customAccessor;
    if (builtinAccessor)
        return builtinAccessor;
    if (defaultAccessor)
        return defaultAccessor;
    _throwError(dir, 'No valid value accessor for form control with');
    return null;
}
/**
 * @template T
 * @param {?} list
 * @param {?} el
 * @return {?}
 */
export function removeDir(list, el) {
    /** @type {?} */
    const index = list.indexOf(el);
    if (index > -1)
        list.splice(index, 1);
}
// TODO(kara): remove after deprecation period
/**
 * @param {?} name
 * @param {?} type
 * @param {?} instance
 * @param {?} warningConfig
 * @return {?}
 */
export function _ngModelWarning(name, type, instance, warningConfig) {
    if (!isDevMode() || warningConfig === 'never')
        return;
    if (((warningConfig === null || warningConfig === 'once') && !type._ngModelWarningSentOnce) ||
        (warningConfig === 'always' && !instance._ngModelWarningSent)) {
        ReactiveErrors.ngModelWarning(name);
        type._ngModelWarningSentOnce = true;
        instance._ngModelWarningSent = true;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvZm9ybXMvc3JjL2RpcmVjdGl2ZXMvc2hhcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLFNBQVMsRUFBRSxlQUFlLElBQUksY0FBYyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRzNFLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFHekMsT0FBTyxFQUFDLDRCQUE0QixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFHdkUsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFFOUQsT0FBTyxFQUFDLHVCQUF1QixFQUFFLGtCQUFrQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDbEYsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFDNUQsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sZ0NBQWdDLENBQUM7QUFDekUsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFFMUQsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQywwQkFBMEIsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBQzNFLE9BQU8sRUFBQyxrQ0FBa0MsRUFBQyxNQUFNLDBDQUEwQyxDQUFDOzs7Ozs7QUFJNUYsTUFBTSxVQUFVLFdBQVcsQ0FBQyxJQUFZLEVBQUUsTUFBd0I7SUFDaEUsT0FBTyxDQUFDLEdBQUcsbUJBQUEsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xDLENBQUM7Ozs7OztBQUVELE1BQU0sVUFBVSxZQUFZLENBQUMsT0FBb0IsRUFBRSxHQUFjO0lBQy9ELElBQUksQ0FBQyxPQUFPO1FBQUUsV0FBVyxDQUFDLEdBQUcsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO0lBQzNELElB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Q0FBQyxtQkFBbUIsQ0FBQyxFQUFFO1FBQ2pFLGNBQWMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksQ0FBQztRQUNwQyxRQUFRLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO0tBQ3JDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtpc0Rldk1vZGUsIMm1bG9vc2VJZGVudGljYWwgYXMgbG9vc2VJZGVudGljYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0Zvcm1BcnJheSwgRm9ybUNvbnRyb2wsIEZvcm1Hcm91cH0gZnJvbSAnLi4vbW9kZWwnO1xuaW1wb3J0IHtWYWxpZGF0b3JzfSBmcm9tICcuLi92YWxpZGF0b3JzJztcbmltcG9ydCB7QWJzdHJhY3RDb250cm9sRGlyZWN0aXZlfSBmcm9tICcuL2Fic3RyYWN0X2NvbnRyb2xfZGlyZWN0aXZlJztcbmltcG9ydCB7QWJzdHJhY3RGb3JtR3JvdXBEaXJlY3RpdmV9IGZyb20gJy4vYWJzdHJhY3RfZm9ybV9ncm91cF9kaXJlY3RpdmUnO1xuaW1wb3J0IHtDaGVja2JveENvbnRyb2xWYWx1ZUFjY2Vzc29yfSBmcm9tICcuL2NoZWNrYm94X3ZhbHVlX2FjY2Vzc29yJztcbmltcG9ydCB7Q29udHJvbENvbnRhaW5lcn0gZnJvbSAnLi9jb250cm9sX2NvbnRhaW5lcic7XG5pbXBvcnQge0NvbnRyb2xWYWx1ZUFjY2Vzc29yfSBmcm9tICcuL2NvbnRyb2xfdmFsdWVfYWNjZXNzb3InO1xuaW1wb3J0IHtEZWZhdWx0VmFsdWVBY2Nlc3Nvcn0gZnJvbSAnLi9kZWZhdWx0X3ZhbHVlX2FjY2Vzc29yJztcbmltcG9ydCB7TmdDb250cm9sfSBmcm9tICcuL25nX2NvbnRyb2wnO1xuaW1wb3J0IHtub3JtYWxpemVBc3luY1ZhbGlkYXRvciwgbm9ybWFsaXplVmFsaWRhdG9yfSBmcm9tICcuL25vcm1hbGl6ZV92YWxpZGF0b3InO1xuaW1wb3J0IHtOdW1iZXJWYWx1ZUFjY2Vzc29yfSBmcm9tICcuL251bWJlcl92YWx1ZV9hY2Nlc3Nvcic7XG5pbXBvcnQge1JhZGlvQ29udHJvbFZhbHVlQWNjZXNzb3J9IGZyb20gJy4vcmFkaW9fY29udHJvbF92YWx1ZV9hY2Nlc3Nvcic7XG5pbXBvcnQge1JhbmdlVmFsdWVBY2Nlc3Nvcn0gZnJvbSAnLi9yYW5nZV92YWx1ZV9hY2Nlc3Nvcic7XG5pbXBvcnQge0Zvcm1BcnJheU5hbWV9IGZyb20gJy4vcmVhY3RpdmVfZGlyZWN0aXZlcy9mb3JtX2dyb3VwX25hbWUnO1xuaW1wb3J0IHtSZWFjdGl2ZUVycm9yc30gZnJvbSAnLi9yZWFjdGl2ZV9lcnJvcnMnO1xuaW1wb3J0IHtTZWxlY3RDb250cm9sVmFsdWVBY2Nlc3Nvcn0gZnJvbSAnLi9zZWxlY3RfY29udHJvbF92YWx1ZV9hY2Nlc3Nvcic7XG5pbXBvcnQge1NlbGVjdE11bHRpcGxlQ29udHJvbFZhbHVlQWNjZXNzb3J9IGZyb20gJy4vc2VsZWN0X211bHRpcGxlX2NvbnRyb2xfdmFsdWVfYWNjZXNzb3InO1xuaW1wb3J0IHtBc3luY1ZhbGlkYXRvciwgQXN5bmNWYWxpZGF0b3JGbiwgVmFsaWRhdG9yLCBWYWxpZGF0b3JGbn0gZnJvbSAnLi92YWxpZGF0b3JzJztcblxuXG5leHBvcnQgZnVuY3Rpb24gY29udHJvbFBhdGgobmFtZTogc3RyaW5nLCBwYXJlbnQ6IENvbnRyb2xDb250YWluZXIpOiBzdHJpbmdbXSB7XG4gIHJldHVybiBbLi4ucGFyZW50LnBhdGggISwgbmFtZV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRVcENvbnRyb2woY29udHJvbDogRm9ybUNvbnRyb2wsIGRpcjogTmdDb250cm9sKTogdm9pZCB7XG4gIGlmICghY29udHJvbCkgX3Rocm93RXJyb3IoZGlyLCAnQ2Fubm90IGZpbmQgY29udHJvbCB3aXRoJyk7XG4gIGlmICghZGlyLnZhbHVlQWNjZXNzb3IpIF90aHJvd0Vycm9yKGRpciwgJ05vIHZhbHVlIGFjY2Vzc29yIGZvciBmb3JtIGNvbnRyb2wgd2l0aCcpO1xuXG4gIGNvbnRyb2wudmFsaWRhdG9yID0gVmFsaWRhdG9ycy5jb21wb3NlKFtjb250cm9sLnZhbGlkYXRvciAhLCBkaXIudmFsaWRhdG9yXSk7XG4gIGNvbnRyb2wuYXN5bmNWYWxpZGF0b3IgPSBWYWxpZGF0b3JzLmNvbXBvc2VBc3luYyhbY29udHJvbC5hc3luY1ZhbGlkYXRvciAhLCBkaXIuYXN5bmNWYWxpZGF0b3JdKTtcbiAgZGlyLnZhbHVlQWNjZXNzb3IgIS53cml0ZVZhbHVlKGNvbnRyb2wudmFsdWUpO1xuXG4gIHNldFVwVmlld0NoYW5nZVBpcGVsaW5lKGNvbnRyb2wsIGRpcik7XG4gIHNldFVwTW9kZWxDaGFuZ2VQaXBlbGluZShjb250cm9sLCBkaXIpO1xuXG4gIHNldFVwQmx1clBpcGVsaW5lKGNvbnRyb2wsIGRpcik7XG5cbiAgaWYgKGRpci52YWx1ZUFjY2Vzc29yICEuc2V0RGlzYWJsZWRTdGF0ZSkge1xuICAgIGNvbnRyb2wucmVnaXN0ZXJPbkRpc2FibGVkQ2hhbmdlKFxuICAgICAgICAoaXNEaXNhYmxlZDogYm9vbGVhbikgPT4geyBkaXIudmFsdWVBY2Nlc3NvciAhLnNldERpc2FibGVkU3RhdGUgIShpc0Rpc2FibGVkKTsgfSk7XG4gIH1cblxuICAvLyByZS1ydW4gdmFsaWRhdGlvbiB3aGVuIHZhbGlkYXRvciBiaW5kaW5nIGNoYW5nZXMsIGUuZy4gbWlubGVuZ3RoPTMgLT4gbWlubGVuZ3RoPTRcbiAgZGlyLl9yYXdWYWxpZGF0b3JzLmZvckVhY2goKHZhbGlkYXRvcjogVmFsaWRhdG9yIHwgVmFsaWRhdG9yRm4pID0+IHtcbiAgICBpZiAoKDxWYWxpZGF0b3I+dmFsaWRhdG9yKS5yZWdpc3Rlck9uVmFsaWRhdG9yQ2hhbmdlKVxuICAgICAgKDxWYWxpZGF0b3I+dmFsaWRhdG9yKS5yZWdpc3Rlck9uVmFsaWRhdG9yQ2hhbmdlICEoKCkgPT4gY29udHJvbC51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KCkpO1xuICB9KTtcblxuICBkaXIuX3Jhd0FzeW5jVmFsaWRhdG9ycy5mb3JFYWNoKCh2YWxpZGF0b3I6IEFzeW5jVmFsaWRhdG9yIHwgQXN5bmNWYWxpZGF0b3JGbikgPT4ge1xuICAgIGlmICgoPFZhbGlkYXRvcj52YWxpZGF0b3IpLnJlZ2lzdGVyT25WYWxpZGF0b3JDaGFuZ2UpXG4gICAgICAoPFZhbGlkYXRvcj52YWxpZGF0b3IpLnJlZ2lzdGVyT25WYWxpZGF0b3JDaGFuZ2UgISgoKSA9PiBjb250cm9sLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKSk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYW5VcENvbnRyb2woY29udHJvbDogRm9ybUNvbnRyb2wsIGRpcjogTmdDb250cm9sKSB7XG4gIGRpci52YWx1ZUFjY2Vzc29yICEucmVnaXN0ZXJPbkNoYW5nZSgoKSA9PiBfbm9Db250cm9sRXJyb3IoZGlyKSk7XG4gIGRpci52YWx1ZUFjY2Vzc29yICEucmVnaXN0ZXJPblRvdWNoZWQoKCkgPT4gX25vQ29udHJvbEVycm9yKGRpcikpO1xuXG4gIGRpci5fcmF3VmFsaWRhdG9ycy5mb3JFYWNoKCh2YWxpZGF0b3I6IGFueSkgPT4ge1xuICAgIGlmICh2YWxpZGF0b3IucmVnaXN0ZXJPblZhbGlkYXRvckNoYW5nZSkge1xuICAgICAgdmFsaWRhdG9yLnJlZ2lzdGVyT25WYWxpZGF0b3JDaGFuZ2UobnVsbCk7XG4gICAgfVxuICB9KTtcblxuICBkaXIuX3Jhd0FzeW5jVmFsaWRhdG9ycy5mb3JFYWNoKCh2YWxpZGF0b3I6IGFueSkgPT4ge1xuICAgIGlmICh2YWxpZGF0b3IucmVnaXN0ZXJPblZhbGlkYXRvckNoYW5nZSkge1xuICAgICAgdmFsaWRhdG9yLnJlZ2lzdGVyT25WYWxpZGF0b3JDaGFuZ2UobnVsbCk7XG4gICAgfVxuICB9KTtcblxuICBpZiAoY29udHJvbCkgY29udHJvbC5fY2xlYXJDaGFuZ2VGbnMoKTtcbn1cblxuZnVuY3Rpb24gc2V0VXBWaWV3Q2hhbmdlUGlwZWxpbmUoY29udHJvbDogRm9ybUNvbnRyb2wsIGRpcjogTmdDb250cm9sKTogdm9pZCB7XG4gIGRpci52YWx1ZUFjY2Vzc29yICEucmVnaXN0ZXJPbkNoYW5nZSgobmV3VmFsdWU6IGFueSkgPT4ge1xuICAgIGNvbnRyb2wuX3BlbmRpbmdWYWx1ZSA9IG5ld1ZhbHVlO1xuICAgIGNvbnRyb2wuX3BlbmRpbmdDaGFuZ2UgPSB0cnVlO1xuICAgIGNvbnRyb2wuX3BlbmRpbmdEaXJ0eSA9IHRydWU7XG5cbiAgICBpZiAoY29udHJvbC51cGRhdGVPbiA9PT0gJ2NoYW5nZScpIHVwZGF0ZUNvbnRyb2woY29udHJvbCwgZGlyKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNldFVwQmx1clBpcGVsaW5lKGNvbnRyb2w6IEZvcm1Db250cm9sLCBkaXI6IE5nQ29udHJvbCk6IHZvaWQge1xuICBkaXIudmFsdWVBY2Nlc3NvciAhLnJlZ2lzdGVyT25Ub3VjaGVkKCgpID0+IHtcbiAgICBjb250cm9sLl9wZW5kaW5nVG91Y2hlZCA9IHRydWU7XG5cbiAgICBpZiAoY29udHJvbC51cGRhdGVPbiA9PT0gJ2JsdXInICYmIGNvbnRyb2wuX3BlbmRpbmdDaGFuZ2UpIHVwZGF0ZUNvbnRyb2woY29udHJvbCwgZGlyKTtcbiAgICBpZiAoY29udHJvbC51cGRhdGVPbiAhPT0gJ3N1Ym1pdCcpIGNvbnRyb2wubWFya0FzVG91Y2hlZCgpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlQ29udHJvbChjb250cm9sOiBGb3JtQ29udHJvbCwgZGlyOiBOZ0NvbnRyb2wpOiB2b2lkIHtcbiAgaWYgKGNvbnRyb2wuX3BlbmRpbmdEaXJ0eSkgY29udHJvbC5tYXJrQXNEaXJ0eSgpO1xuICBjb250cm9sLnNldFZhbHVlKGNvbnRyb2wuX3BlbmRpbmdWYWx1ZSwge2VtaXRNb2RlbFRvVmlld0NoYW5nZTogZmFsc2V9KTtcbiAgZGlyLnZpZXdUb01vZGVsVXBkYXRlKGNvbnRyb2wuX3BlbmRpbmdWYWx1ZSk7XG4gIGNvbnRyb2wuX3BlbmRpbmdDaGFuZ2UgPSBmYWxzZTtcbn1cblxuZnVuY3Rpb24gc2V0VXBNb2RlbENoYW5nZVBpcGVsaW5lKGNvbnRyb2w6IEZvcm1Db250cm9sLCBkaXI6IE5nQ29udHJvbCk6IHZvaWQge1xuICBjb250cm9sLnJlZ2lzdGVyT25DaGFuZ2UoKG5ld1ZhbHVlOiBhbnksIGVtaXRNb2RlbEV2ZW50OiBib29sZWFuKSA9PiB7XG4gICAgLy8gY29udHJvbCAtPiB2aWV3XG4gICAgZGlyLnZhbHVlQWNjZXNzb3IgIS53cml0ZVZhbHVlKG5ld1ZhbHVlKTtcblxuICAgIC8vIGNvbnRyb2wgLT4gbmdNb2RlbFxuICAgIGlmIChlbWl0TW9kZWxFdmVudCkgZGlyLnZpZXdUb01vZGVsVXBkYXRlKG5ld1ZhbHVlKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRVcEZvcm1Db250YWluZXIoXG4gICAgY29udHJvbDogRm9ybUdyb3VwIHwgRm9ybUFycmF5LCBkaXI6IEFic3RyYWN0Rm9ybUdyb3VwRGlyZWN0aXZlIHwgRm9ybUFycmF5TmFtZSkge1xuICBpZiAoY29udHJvbCA9PSBudWxsKSBfdGhyb3dFcnJvcihkaXIsICdDYW5ub3QgZmluZCBjb250cm9sIHdpdGgnKTtcbiAgY29udHJvbC52YWxpZGF0b3IgPSBWYWxpZGF0b3JzLmNvbXBvc2UoW2NvbnRyb2wudmFsaWRhdG9yLCBkaXIudmFsaWRhdG9yXSk7XG4gIGNvbnRyb2wuYXN5bmNWYWxpZGF0b3IgPSBWYWxpZGF0b3JzLmNvbXBvc2VBc3luYyhbY29udHJvbC5hc3luY1ZhbGlkYXRvciwgZGlyLmFzeW5jVmFsaWRhdG9yXSk7XG59XG5cbmZ1bmN0aW9uIF9ub0NvbnRyb2xFcnJvcihkaXI6IE5nQ29udHJvbCkge1xuICByZXR1cm4gX3Rocm93RXJyb3IoZGlyLCAnVGhlcmUgaXMgbm8gRm9ybUNvbnRyb2wgaW5zdGFuY2UgYXR0YWNoZWQgdG8gZm9ybSBjb250cm9sIGVsZW1lbnQgd2l0aCcpO1xufVxuXG5mdW5jdGlvbiBfdGhyb3dFcnJvcihkaXI6IEFic3RyYWN0Q29udHJvbERpcmVjdGl2ZSwgbWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gIGxldCBtZXNzYWdlRW5kOiBzdHJpbmc7XG4gIGlmIChkaXIucGF0aCAhLmxlbmd0aCA+IDEpIHtcbiAgICBtZXNzYWdlRW5kID0gYHBhdGg6ICcke2Rpci5wYXRoIS5qb2luKCcgLT4gJyl9J2A7XG4gIH0gZWxzZSBpZiAoZGlyLnBhdGggIVswXSkge1xuICAgIG1lc3NhZ2VFbmQgPSBgbmFtZTogJyR7ZGlyLnBhdGh9J2A7XG4gIH0gZWxzZSB7XG4gICAgbWVzc2FnZUVuZCA9ICd1bnNwZWNpZmllZCBuYW1lIGF0dHJpYnV0ZSc7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKGAke21lc3NhZ2V9ICR7bWVzc2FnZUVuZH1gKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvc2VWYWxpZGF0b3JzKHZhbGlkYXRvcnM6IEFycmF5PFZhbGlkYXRvcnxGdW5jdGlvbj4pOiBWYWxpZGF0b3JGbnxudWxsIHtcbiAgcmV0dXJuIHZhbGlkYXRvcnMgIT0gbnVsbCA/IFZhbGlkYXRvcnMuY29tcG9zZSh2YWxpZGF0b3JzLm1hcChub3JtYWxpemVWYWxpZGF0b3IpKSA6IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wb3NlQXN5bmNWYWxpZGF0b3JzKHZhbGlkYXRvcnM6IEFycmF5PFZhbGlkYXRvcnxGdW5jdGlvbj4pOiBBc3luY1ZhbGlkYXRvckZufFxuICAgIG51bGwge1xuICByZXR1cm4gdmFsaWRhdG9ycyAhPSBudWxsID8gVmFsaWRhdG9ycy5jb21wb3NlQXN5bmModmFsaWRhdG9ycy5tYXAobm9ybWFsaXplQXN5bmNWYWxpZGF0b3IpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQcm9wZXJ0eVVwZGF0ZWQoY2hhbmdlczoge1trZXk6IHN0cmluZ106IGFueX0sIHZpZXdNb2RlbDogYW55KTogYm9vbGVhbiB7XG4gIGlmICghY2hhbmdlcy5oYXNPd25Qcm9wZXJ0eSgnbW9kZWwnKSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBjaGFuZ2UgPSBjaGFuZ2VzWydtb2RlbCddO1xuXG4gIGlmIChjaGFuZ2UuaXNGaXJzdENoYW5nZSgpKSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuICFsb29zZUlkZW50aWNhbCh2aWV3TW9kZWwsIGNoYW5nZS5jdXJyZW50VmFsdWUpO1xufVxuXG5jb25zdCBCVUlMVElOX0FDQ0VTU09SUyA9IFtcbiAgQ2hlY2tib3hDb250cm9sVmFsdWVBY2Nlc3NvcixcbiAgUmFuZ2VWYWx1ZUFjY2Vzc29yLFxuICBOdW1iZXJWYWx1ZUFjY2Vzc29yLFxuICBTZWxlY3RDb250cm9sVmFsdWVBY2Nlc3NvcixcbiAgU2VsZWN0TXVsdGlwbGVDb250cm9sVmFsdWVBY2Nlc3NvcixcbiAgUmFkaW9Db250cm9sVmFsdWVBY2Nlc3Nvcixcbl07XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0J1aWx0SW5BY2Nlc3Nvcih2YWx1ZUFjY2Vzc29yOiBDb250cm9sVmFsdWVBY2Nlc3Nvcik6IGJvb2xlYW4ge1xuICByZXR1cm4gQlVJTFRJTl9BQ0NFU1NPUlMuc29tZShhID0+IHZhbHVlQWNjZXNzb3IuY29uc3RydWN0b3IgPT09IGEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3luY1BlbmRpbmdDb250cm9scyhmb3JtOiBGb3JtR3JvdXAsIGRpcmVjdGl2ZXM6IE5nQ29udHJvbFtdKTogdm9pZCB7XG4gIGZvcm0uX3N5bmNQZW5kaW5nQ29udHJvbHMoKTtcbiAgZGlyZWN0aXZlcy5mb3JFYWNoKGRpciA9PiB7XG4gICAgY29uc3QgY29udHJvbCA9IGRpci5jb250cm9sIGFzIEZvcm1Db250cm9sO1xuICAgIGlmIChjb250cm9sLnVwZGF0ZU9uID09PSAnc3VibWl0JyAmJiBjb250cm9sLl9wZW5kaW5nQ2hhbmdlKSB7XG4gICAgICBkaXIudmlld1RvTW9kZWxVcGRhdGUoY29udHJvbC5fcGVuZGluZ1ZhbHVlKTtcbiAgICAgIGNvbnRyb2wuX3BlbmRpbmdDaGFuZ2UgPSBmYWxzZTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBUT0RPOiB2c2F2a2luIHJlbW92ZSBpdCBvbmNlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzMwMTEgaXMgaW1wbGVtZW50ZWRcbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RWYWx1ZUFjY2Vzc29yKFxuICAgIGRpcjogTmdDb250cm9sLCB2YWx1ZUFjY2Vzc29yczogQ29udHJvbFZhbHVlQWNjZXNzb3JbXSk6IENvbnRyb2xWYWx1ZUFjY2Vzc29yfG51bGwge1xuICBpZiAoIXZhbHVlQWNjZXNzb3JzKSByZXR1cm4gbnVsbDtcblxuICBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWVBY2Nlc3NvcnMpKVxuICAgIF90aHJvd0Vycm9yKGRpciwgJ1ZhbHVlIGFjY2Vzc29yIHdhcyBub3QgcHJvdmlkZWQgYXMgYW4gYXJyYXkgZm9yIGZvcm0gY29udHJvbCB3aXRoJyk7XG5cbiAgbGV0IGRlZmF1bHRBY2Nlc3NvcjogQ29udHJvbFZhbHVlQWNjZXNzb3J8dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICBsZXQgYnVpbHRpbkFjY2Vzc29yOiBDb250cm9sVmFsdWVBY2Nlc3Nvcnx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIGxldCBjdXN0b21BY2Nlc3NvcjogQ29udHJvbFZhbHVlQWNjZXNzb3J8dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gIHZhbHVlQWNjZXNzb3JzLmZvckVhY2goKHY6IENvbnRyb2xWYWx1ZUFjY2Vzc29yKSA9PiB7XG4gICAgaWYgKHYuY29uc3RydWN0b3IgPT09IERlZmF1bHRWYWx1ZUFjY2Vzc29yKSB7XG4gICAgICBkZWZhdWx0QWNjZXNzb3IgPSB2O1xuXG4gICAgfSBlbHNlIGlmIChpc0J1aWx0SW5BY2Nlc3Nvcih2KSkge1xuICAgICAgaWYgKGJ1aWx0aW5BY2Nlc3NvcilcbiAgICAgICAgX3Rocm93RXJyb3IoZGlyLCAnTW9yZSB0aGFuIG9uZSBidWlsdC1pbiB2YWx1ZSBhY2Nlc3NvciBtYXRjaGVzIGZvcm0gY29udHJvbCB3aXRoJyk7XG4gICAgICBidWlsdGluQWNjZXNzb3IgPSB2O1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChjdXN0b21BY2Nlc3NvcilcbiAgICAgICAgX3Rocm93RXJyb3IoZGlyLCAnTW9yZSB0aGFuIG9uZSBjdXN0b20gdmFsdWUgYWNjZXNzb3IgbWF0Y2hlcyBmb3JtIGNvbnRyb2wgd2l0aCcpO1xuICAgICAgY3VzdG9tQWNjZXNzb3IgPSB2O1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKGN1c3RvbUFjY2Vzc29yKSByZXR1cm4gY3VzdG9tQWNjZXNzb3I7XG4gIGlmIChidWlsdGluQWNjZXNzb3IpIHJldHVybiBidWlsdGluQWNjZXNzb3I7XG4gIGlmIChkZWZhdWx0QWNjZXNzb3IpIHJldHVybiBkZWZhdWx0QWNjZXNzb3I7XG5cbiAgX3Rocm93RXJyb3IoZGlyLCAnTm8gdmFsaWQgdmFsdWUgYWNjZXNzb3IgZm9yIGZvcm0gY29udHJvbCB3aXRoJyk7XG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlRGlyPFQ+KGxpc3Q6IFRbXSwgZWw6IFQpOiB2b2lkIHtcbiAgY29uc3QgaW5kZXggPSBsaXN0LmluZGV4T2YoZWwpO1xuICBpZiAoaW5kZXggPiAtMSkgbGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xufVxuXG4vLyBUT0RPKGthcmEpOiByZW1vdmUgYWZ0ZXIgZGVwcmVjYXRpb24gcGVyaW9kXG5leHBvcnQgZnVuY3Rpb24gX25nTW9kZWxXYXJuaW5nKFxuICAgIG5hbWU6IHN0cmluZywgdHlwZToge19uZ01vZGVsV2FybmluZ1NlbnRPbmNlOiBib29sZWFufSxcbiAgICBpbnN0YW5jZToge19uZ01vZGVsV2FybmluZ1NlbnQ6IGJvb2xlYW59LCB3YXJuaW5nQ29uZmlnOiBzdHJpbmcgfCBudWxsKSB7XG4gIGlmICghaXNEZXZNb2RlKCkgfHwgd2FybmluZ0NvbmZpZyA9PT0gJ25ldmVyJykgcmV0dXJuO1xuXG4gIGlmICgoKHdhcm5pbmdDb25maWcgPT09IG51bGwgfHwgd2FybmluZ0NvbmZpZyA9PT0gJ29uY2UnKSAmJiAhdHlwZS5fbmdNb2RlbFdhcm5pbmdTZW50T25jZSkgfHxcbiAgICAgICh3YXJuaW5nQ29uZmlnID09PSAnYWx3YXlzJyAmJiAhaW5zdGFuY2UuX25nTW9kZWxXYXJuaW5nU2VudCkpIHtcbiAgICBSZWFjdGl2ZUVycm9ycy5uZ01vZGVsV2FybmluZyhuYW1lKTtcbiAgICB0eXBlLl9uZ01vZGVsV2FybmluZ1NlbnRPbmNlID0gdHJ1ZTtcbiAgICBpbnN0YW5jZS5fbmdNb2RlbFdhcm5pbmdTZW50ID0gdHJ1ZTtcbiAgfVxufVxuIl19