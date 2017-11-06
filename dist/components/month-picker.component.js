import { Component, EventEmitter, Input, Output } from '@angular/core';
import { defaults } from "../config";
var MonthPickerComponent = /** @class */ (function () {
    function MonthPickerComponent() {
        this.color = defaults.COLOR;
        this.onSelect = new EventEmitter();
        this._thisMonth = new Date();
        this._monthFormat = defaults.MONTH_FORMAT;
    }
    Object.defineProperty(MonthPickerComponent.prototype, "monthFormat", {
        get: function () {
            return this._monthFormat;
        },
        set: function (value) {
            if (Array.isArray(value) && value.length === 12) {
                this._monthFormat = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    MonthPickerComponent.prototype._onSelect = function (month) {
        this.onSelect.emit(month);
    };
    MonthPickerComponent.decorators = [
        { type: Component, args: [{
                    selector: 'ion-calendar-month-picker',
                    template: "\n    <div [class]=\"'month-picker ' + color\">\n      <div class=\"month-packer-item\"\n           [class.this-month]=\"\n           i === _thisMonth.getMonth() \n           && month.original.year === _thisMonth.getFullYear()\"\n           *ngFor=\"let item of _monthFormat; let i = index\">\n        <button type=\"button\" (click)=\"_onSelect(i)\">{{item}}</button>\n      </div>\n    </div>\n  ",
                },] },
    ];
    /** @nocollapse */
    MonthPickerComponent.ctorParameters = function () { return []; };
    MonthPickerComponent.propDecorators = {
        'month': [{ type: Input },],
        'color': [{ type: Input },],
        'onSelect': [{ type: Output },],
        'monthFormat': [{ type: Input },],
    };
    return MonthPickerComponent;
}());
export { MonthPickerComponent };
//# sourceMappingURL=month-picker.component.js.map