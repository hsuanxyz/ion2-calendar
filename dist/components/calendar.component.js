import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CalendarService } from "../services/calendar.service";
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import * as moment from 'moment';
export var ION_CAL_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(function () { return CalendarComponent; }),
    multi: true
};
var CalendarComponent = (function () {
    function CalendarComponent(calSvc) {
        this.calSvc = calSvc;
        this.format = 'YYYY-MM-DD';
        this.onChange = new EventEmitter();
        this._calendarMonthValue = [null, null];
        this._onChanged = function () {
        };
        this._onTouched = function () {
        };
    }
    CalendarComponent.prototype.ionViewDidLoad = function () {
    };
    CalendarComponent.prototype.ngOnInit = function () {
        this._d = this.calSvc.safeOpt(this.options || {});
        this.monthOpt = this.createMonth(new Date().getTime());
    };
    CalendarComponent.prototype.writeValue = function (obj) {
        if (obj) {
            this._writeValue(obj);
            if (this._calendarMonthValue[0] && this._calendarMonthValue[0].time) {
                this.monthOpt = this.createMonth(this._calendarMonthValue[0].time);
            }
            else {
                this.monthOpt = this.createMonth(new Date().getTime());
            }
        }
    };
    CalendarComponent.prototype.registerOnChange = function (fn) {
        this._onChanged = fn;
    };
    CalendarComponent.prototype.registerOnTouched = function (fn) {
        this._onTouched = fn;
    };
    CalendarComponent.prototype.createMonth = function (date) {
        return this.calSvc.createMonthsByPeriod(date, 1, this._d)[0];
    };
    CalendarComponent.prototype.nextMonth = function () {
        var nextTime = moment(this.monthOpt.original.time).add(1, 'months').valueOf();
        this.monthOpt = this.createMonth(nextTime);
    };
    CalendarComponent.prototype.canNext = function () {
        if (!this._d.to)
            return true;
        return this.monthOpt.original.time < moment(this._d.to).valueOf();
    };
    CalendarComponent.prototype.backMonth = function () {
        var backTime = moment(this.monthOpt.original.time).subtract(1, 'months').valueOf();
        this.monthOpt = this.createMonth(backTime);
    };
    CalendarComponent.prototype.canBack = function () {
        if (!this._d.from)
            return true;
        return this.monthOpt.original.time > moment(this._d.from).valueOf();
    };
    CalendarComponent.prototype.onChanged = function ($event) {
        switch (this._d.pickMode) {
            case 'single':
                var date = moment($event[0].time).format(this.format);
                this._onChanged(date);
                this.onChange.emit(date);
                break;
            case 'range':
                if ($event[0] && $event[1]) {
                    var rangeDate = {
                        from: moment($event[0].time).format(this.format),
                        to: moment($event[1].time).format(this.format)
                    };
                    this._onChanged(rangeDate);
                    this.onChange.emit(rangeDate);
                }
                break;
            case 'multi':
                var dates = [];
                for (var i = 0; i < $event.length; i++) {
                    if ($event[i] && $event[i].time) {
                        dates.push(moment($event[i].time).format(this.format));
                    }
                }
                this._onChanged(dates);
                this.onChange.emit(dates);
                break;
            default:
        }
    };
    CalendarComponent.prototype._writeValue = function (value) {
        var _this = this;
        if (!value)
            return;
        switch (this._d.pickMode) {
            case 'single':
                var date = moment(value, this.format);
                this._calendarMonthValue[0] = this.calSvc.createCalendarDay(date.valueOf(), this._d);
                break;
            case 'range':
                if (value.from) {
                    var from = moment(value.from, this.format);
                    this._calendarMonthValue[0] = this.calSvc.createCalendarDay(from.valueOf(), this._d);
                }
                if (value.to) {
                    var to = moment(value.to, this.format);
                    this._calendarMonthValue[1] = this.calSvc.createCalendarDay(to.valueOf(), this._d);
                }
                break;
            case 'multi':
                if (Array.isArray(value)) {
                    this._calendarMonthValue = value.map(function (e) {
                        return _this.calSvc.createCalendarDay(moment(e, _this.format).valueOf(), _this._d);
                    });
                }
                else {
                    this._calendarMonthValue = [];
                }
                break;
            default:
        }
    };
    return CalendarComponent;
}());
export { CalendarComponent };
CalendarComponent.decorators = [
    { type: Component, args: [{
                selector: 'ion-calendar',
                providers: [ION_CAL_VALUE_ACCESSOR],
                template: "\n    <div class=\"title\">\n      <div class=\"text\">\n        {{monthOpt.original.time | date: _d.monthFormat}}\n      </div>\n      <button ion-button clear class=\"back\" [disabled]=\"!canBack()\" (click)=\"backMonth()\">\n        <ion-icon name=\"ios-arrow-back\"></ion-icon>\n      </button>\n      <button ion-button clear class=\"forward\" [disabled]=\"!canNext()\" (click)=\"nextMonth()\">\n        <ion-icon name=\"ios-arrow-forward\"></ion-icon>\n      </button>\n    </div>\n\n    <ion-calendar-week color=\"transparent\"\n                       [weekStart]=\"_d.weekStart\">\n    </ion-calendar-week>\n\n    <ion-calendar-month\n      [(ngModel)]=\"_calendarMonthValue\"\n      [month]=\"monthOpt\"\n      (onChange)=\"onChanged($event)\"\n      [pickMode]=\"_d.pickMode\"\n      [color]=\"_d.color\">\n\n    </ion-calendar-month>\n\n  ",
            },] },
];
/** @nocollapse */
CalendarComponent.ctorParameters = function () { return [
    { type: CalendarService, },
]; };
CalendarComponent.propDecorators = {
    'options': [{ type: Input },],
    'format': [{ type: Input },],
    'onChange': [{ type: Output },],
};
//# sourceMappingURL=calendar.component.js.map