import { Component, ElementRef, ChangeDetectorRef, Renderer, Input } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import * as moment from 'moment';
import { CalendarService } from "../services/calendar.service";
var CalendarComponent = (function () {
    function CalendarComponent(_renderer, _elementRef, params, viewCtrl, ref, calSvc) {
        this._renderer = _renderer;
        this._elementRef = _elementRef;
        this.params = params;
        this.viewCtrl = viewCtrl;
        this.ref = ref;
        this.calSvc = calSvc;
        this.monthDate = new Date();
        this.color = 'primary';
        this.titleFormat = 'MMM yyyy';
        this.weekStartDay = 0;
        this.disableWeekdays = [];
        this.from = new Date().getTime();
    }
    CalendarComponent.prototype.ionViewDidLoad = function () {
    };
    CalendarComponent.prototype.ngOnInit = function () {
        if (!moment.isDate(new Date(this.from))) {
            this.from = new Date().getTime();
            console.warn('form is not a Date type');
        }
        else {
            this.from = moment(this.from).valueOf();
        }
        this.monthOpt = this.createMonth();
    };
    CalendarComponent.prototype.createMonth = function (date) {
        if (date === void 0) { date = this.from; }
        return this.calSvc.createMonthsByPeriod(date, 1, this.calSvc.safeOpt({
            from: new Date(date),
            weekStartDay: this.weekStartDay,
            disableWeekdays: this.disableWeekdays,
        }))[0];
    };
    CalendarComponent.prototype.nextMonth = function () {
        this.from = moment(this.from).add(1, 'months').valueOf();
        this.monthOpt = this.createMonth();
    };
    CalendarComponent.prototype.backMonth = function () {
        this.from = moment(this.from).subtract(1, 'months').valueOf();
        this.monthOpt = this.createMonth();
    };
    return CalendarComponent;
}());
export { CalendarComponent };
CalendarComponent.decorators = [
    { type: Component, args: [{
                selector: 'ion-calendar',
                template: "\n        <div class=\"title\">\n            <div class=\"text\">\n                {{monthOpt.original.time | date: titleFormat}}\n            </div>\n            <div ion-button clear class=\"back\" (click)=\"backMonth()\">\n                <ion-icon name=\"ios-arrow-back\"></ion-icon>\n            </div>\n            <div ion-button clear class=\"forward\" (click)=\"nextMonth()\">\n                <ion-icon name=\"ios-arrow-forward\"></ion-icon>\n            </div>\n        </div>\n\n        <ion-calendar-week color=\"light\"\n                           [weekStart]=\"weekStartDay\">\n        </ion-calendar-week>\n\n        <ion-calendar-month [month]=\"monthOpt\" [color]=\"color\">\n\n        </ion-calendar-month>\n\n    ",
            },] },
];
/** @nocollapse */
CalendarComponent.ctorParameters = function () { return [
    { type: Renderer, },
    { type: ElementRef, },
    { type: NavParams, },
    { type: ViewController, },
    { type: ChangeDetectorRef, },
    { type: CalendarService, },
]; };
CalendarComponent.propDecorators = {
    'color': [{ type: Input },],
    'titleFormat': [{ type: Input },],
    'weekStartDay': [{ type: Input },],
    'disableWeekdays': [{ type: Input },],
    'from': [{ type: Input },],
};
//# sourceMappingURL=calendar.component.js.map