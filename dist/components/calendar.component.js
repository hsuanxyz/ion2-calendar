var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Input } from '@angular/core';
import * as moment from 'moment';
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
__decorate([
    Input()
], CalendarComponent.prototype, "color", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "titleFormat", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "weekStartDay", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "disableWeekdays", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "from", void 0);
CalendarComponent = __decorate([
    Component({
        selector: 'ion-calendar',
        template: "\n        <div class=\"title\">\n            <div class=\"text\">\n                {{monthOpt.original.time | date: titleFormat}}\n            </div>\n            <div ion-button clear class=\"back\" (click)=\"backMonth()\">\n                <ion-icon name=\"ios-arrow-back\"></ion-icon>\n            </div>\n            <div ion-button clear class=\"forward\" (click)=\"nextMonth()\">\n                <ion-icon name=\"ios-arrow-forward\"></ion-icon>\n            </div>\n        </div>\n\n        <ion-calendar-week color=\"light\"\n                           [weekStart]=\"weekStartDay\">\n        </ion-calendar-week>\n\n        <ion-calendar-month [month]=\"monthOpt\" [color]=\"color\">\n\n        </ion-calendar-month>\n\n    ",
    })
], CalendarComponent);
export { CalendarComponent };
//# sourceMappingURL=calendar.component.js.map