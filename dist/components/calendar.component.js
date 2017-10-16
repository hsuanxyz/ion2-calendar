import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CalendarService } from "../services/calendar.service";
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import * as moment from 'moment';
export var ION_CAL_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(function () { return CalendarComponent; }),
    multi: true
};
var CalendarComponent = /** @class */ (function () {
    function CalendarComponent(calSvc) {
        this.calSvc = calSvc;
        this._view = 'days';
        this._calendarMonthValue = [null, null];
        this._showToggleButtons = true;
        this._showMonthPicker = true;
        this.format = 'YYYY-MM-DD';
        this.type = 'string';
        this.readonly = false;
        this.onChange = new EventEmitter();
        this.monthChange = new EventEmitter();
        this._onChanged = function () { };
        this._onTouched = function () { };
    }
    Object.defineProperty(CalendarComponent.prototype, "options", {
        get: function () {
            return this._options;
        },
        set: function (value) {
            this._options = value;
            this.initOpt();
            if (this.monthOpt && this.monthOpt.original) {
                this.monthOpt = this.createMonth(this.monthOpt.original.time);
            }
        },
        enumerable: true,
        configurable: true
    });
    CalendarComponent.prototype.ionViewDidLoad = function () {
    };
    CalendarComponent.prototype.ngOnInit = function () {
        this.initOpt();
        this.monthOpt = this.createMonth(new Date().getTime());
    };
    CalendarComponent.prototype.initOpt = function () {
        if (this._options && this._options.showToggleButtons === false) {
            this._showToggleButtons = false;
        }
        if (this._options && this._options.showMonthPicker === false) {
            this._showMonthPicker = false;
        }
        this._d = this.calSvc.safeOpt(this._options || {});
    };
    CalendarComponent.prototype.writeValue = function (obj) {
        if (obj) {
            this._writeValue(obj);
            if (this._calendarMonthValue[0]) {
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
    CalendarComponent.prototype.switchView = function () {
        this._view = this._view === 'days' ? 'month' : 'days';
        return this._view;
    };
    CalendarComponent.prototype.prev = function () {
        if (this._view === 'days') {
            this.backMonth();
        }
        else {
            this.prevYear();
        }
    };
    CalendarComponent.prototype.next = function () {
        if (this._view === 'days') {
            this.nextMonth();
        }
        else {
            this.nextYear();
        }
    };
    CalendarComponent.prototype.prevYear = function () {
        var backTime = moment(this.monthOpt.original.time).subtract(1, 'year').valueOf();
        this.monthOpt = this.createMonth(backTime);
    };
    CalendarComponent.prototype.nextYear = function () {
        var nextTime = moment(this.monthOpt.original.time).add(1, 'year').valueOf();
        this.monthOpt = this.createMonth(nextTime);
    };
    CalendarComponent.prototype.nextMonth = function () {
        var nextTime = moment(this.monthOpt.original.time).add(1, 'months').valueOf();
        this.monthChange.emit({
            oldMonth: this.calSvc.multiFormat(this.monthOpt.original.time),
            newMonth: this.calSvc.multiFormat(nextTime)
        });
        this.monthOpt = this.createMonth(nextTime);
    };
    CalendarComponent.prototype.canNext = function () {
        if (!this._d.to || this._view !== 'days')
            return true;
        return this.monthOpt.original.time < moment(this._d.to).valueOf();
    };
    CalendarComponent.prototype.backMonth = function () {
        var backTime = moment(this.monthOpt.original.time).subtract(1, 'months').valueOf();
        this.monthChange.emit({
            oldMonth: this.calSvc.multiFormat(this.monthOpt.original.time),
            newMonth: this.calSvc.multiFormat(backTime)
        });
        this.monthOpt = this.createMonth(backTime);
    };
    CalendarComponent.prototype.canBack = function () {
        if (!this._d.from || this._view !== 'days')
            return true;
        return this.monthOpt.original.time > moment(this._d.from).valueOf();
    };
    CalendarComponent.prototype.monthOnSelect = function (month) {
        this._view = 'days';
        var newMonth = moment(this.monthOpt.original.time).month(month).valueOf();
        this.monthChange.emit({
            oldMonth: this.calSvc.multiFormat(this.monthOpt.original.time),
            newMonth: this.calSvc.multiFormat(newMonth)
        });
        this.monthOpt = this.createMonth(newMonth);
    };
    CalendarComponent.prototype.onChanged = function ($event) {
        switch (this._d.pickMode) {
            case 'single':
                var date = this._handleType($event[0].time);
                this._onChanged(date);
                this.onChange.emit(date);
                break;
            case 'range':
                if ($event[0] && $event[1]) {
                    var rangeDate = {
                        from: this._handleType($event[0].time),
                        to: this._handleType($event[1].time)
                    };
                    this._onChanged(rangeDate);
                    this.onChange.emit(rangeDate);
                }
                break;
            case 'multi':
                var dates = [];
                for (var i = 0; i < $event.length; i++) {
                    if ($event[i] && $event[i].time) {
                        dates.push(this._handleType($event[i].time));
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
                this._calendarMonthValue[0] = this._createCalendarDay(value);
                break;
            case 'range':
                if (value.from) {
                    this._calendarMonthValue[0] = this._createCalendarDay(value.from);
                }
                if (value.to) {
                    this._calendarMonthValue[1] = this._createCalendarDay(value.to);
                }
                break;
            case 'multi':
                if (Array.isArray(value)) {
                    this._calendarMonthValue = value.map(function (e) {
                        return _this._createCalendarDay(e);
                    });
                }
                else {
                    this._calendarMonthValue = [];
                }
                break;
            default:
        }
    };
    CalendarComponent.prototype._createCalendarDay = function (value) {
        var date;
        if (this.type === 'string') {
            date = moment(value, this.format);
        }
        else {
            date = moment(value);
        }
        return this.calSvc.createCalendarDay(date.valueOf(), this._d);
    };
    CalendarComponent.prototype._handleType = function (value) {
        var date = moment(value);
        switch (this.type) {
            case 'string':
                return date.format(this.format);
            case 'js-date':
                return date.toDate();
            case 'moment':
                return date;
            case 'time':
                return date.valueOf();
            case 'object':
                return date.toObject();
        }
        return date;
    };
    CalendarComponent.decorators = [
        { type: Component, args: [{
                    selector: 'ion-calendar',
                    providers: [ION_CAL_VALUE_ACCESSOR],
                    template: "\n    <div class=\"title\">\n      <ng-template [ngIf]=\"_showMonthPicker ? _showMonthPicker || !readonly : false\" [ngIfElse]=\"title\">\n        <button type=\"button\"\n                ion-button\n                clear\n                class=\"switch-btn\"\n                [disabled]=\"readonly\"\n                (click)=\"switchView()\">\n          {{monthOpt.original.time | date: _d.monthFormat}}\n          <ion-icon *ngIf=\"!readonly\"\n                    class=\"arrow-dropdown\"\n                    [name]=\"_view === 'days' ? 'md-arrow-dropdown' : 'md-arrow-dropup'\"></ion-icon>\n        </button>\n      </ng-template>\n      <ng-template #title>\n        <div class=\"switch-btn\">\n          {{monthOpt.original.time | date: _d.monthFormat}}\n        </div>\n      </ng-template>\n      <ng-template [ngIf]=\"_showToggleButtons\">\n        <button type='button' ion-button clear class=\"back\" [disabled]=\"!canBack() || readonly\" (click)=\"prev()\">\n          <ion-icon name=\"ios-arrow-back\"></ion-icon>\n        </button>\n        <button type='button' ion-button clear class=\"forward\" [disabled]=\"!canNext() || readonly\"\n                (click)=\"next()\">\n          <ion-icon name=\"ios-arrow-forward\"></ion-icon>\n        </button>\n      </ng-template>\n    </div>\n    \n    <ng-template [ngIf]=\"_view === 'days'\" [ngIfElse]=\"monthPicker\">\n      <ion-calendar-week color=\"transparent\"\n                         [weekArray]=\"_d.weekdays\"\n                         [weekStart]=\"_d.weekStart\">\n      </ion-calendar-week>\n\n      <ion-calendar-month [(ngModel)]=\"_calendarMonthValue\"\n                          [month]=\"monthOpt\"\n                          [readonly]=\"readonly\"\n                          (onChange)=\"onChanged($event)\"\n                          [pickMode]=\"_d.pickMode\"\n                          [color]=\"_d.color\">\n      </ion-calendar-month>\n    </ng-template>\n\n    <ng-template #monthPicker>\n      <ion-calendar-month-picker [color]=\"_d.color\" \n                                 [monthFormat]=\"_options?.monthPickerFormat\"\n                                 (onSelect)=\"monthOnSelect($event)\"\n                                 [month]=\"monthOpt\">\n      </ion-calendar-month-picker>\n    </ng-template>\n  ",
                },] },
    ];
    /** @nocollapse */
    CalendarComponent.ctorParameters = function () { return [
        { type: CalendarService, },
    ]; };
    CalendarComponent.propDecorators = {
        'format': [{ type: Input },],
        'type': [{ type: Input },],
        'readonly': [{ type: Input },],
        'onChange': [{ type: Output },],
        'monthChange': [{ type: Output },],
        'options': [{ type: Input },],
    };
    return CalendarComponent;
}());
export { CalendarComponent };
//# sourceMappingURL=calendar.component.js.map