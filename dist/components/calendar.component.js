import { Component, ElementRef, ChangeDetectorRef, Renderer, Input } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { CalendarService } from "../services/calendar.service";
var CalendarComponent = (function () {
    function CalendarComponent(_renderer, _elementRef, params, viewCtrl, ref, calSvc) {
        this._renderer = _renderer;
        this._elementRef = _elementRef;
        this.params = params;
        this.viewCtrl = viewCtrl;
        this.ref = ref;
        this.calSvc = calSvc;
        this.color = 'primary';
        this.titleFormat = 'MMM yyyy';
        this.weekStartDay = 0;
        this.disableWeekdays = [];
    }
    CalendarComponent.prototype.ionViewDidLoad = function () {
    };
    CalendarComponent.prototype.ngOnInit = function () {
        this.month = this.calSvc.createMonthsByPeriod(new Date().getTime(), 1, this.calSvc.safeOpt({
            from: new Date(),
            weekStartDay: this.weekStartDay,
            disableWeekdays: this.disableWeekdays,
        }))[0];
    };
    return CalendarComponent;
}());
export { CalendarComponent };
CalendarComponent.decorators = [
    { type: Component, args: [{
                selector: 'ion-calendar',
                template: "\n        <div class=\"title\">\n            <div class=\"text\">\n                {{month.original.time | date: titleFormat}}\n            </div>\n            <div ion-button clear class=\"back\">\n                <ion-icon name=\"ios-arrow-back\"></ion-icon>\n            </div>\n            <div ion-button clear class=\"forward\">\n                <ion-icon name=\"ios-arrow-forward\"></ion-icon>\n            </div>\n        </div>\n        \n        <ion-calendar-week color=\"light\" \n                           [weekStart]=\"weekStartDay\">\n        </ion-calendar-week>\n        \n        <ion-calendar-month [month]=\"month\" [color]=\"color\">\n            \n        </ion-calendar-month>\n        \n    ",
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
};
//# sourceMappingURL=calendar.component.js.map