var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Input } from '@angular/core';
var CalendarWeekComponent = (function () {
    function CalendarWeekComponent() {
        this._weekArray = "Di_Lu_Ma_Me_Je_Ve_Sa".split("_");
        this._weekStart = 0;
        this.color = 'primary';
    }
    Object.defineProperty(CalendarWeekComponent.prototype, "weekArray", {
        set: function (value) {
            if (value && value.length === 7) {
                this._weekArray = value;
                this.adjustSort();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CalendarWeekComponent.prototype, "weekStart", {
        set: function (value) {
            if (value === 0 || value === 1) {
                this._weekStart = value;
                this.adjustSort();
            }
        },
        enumerable: true,
        configurable: true
    });
    CalendarWeekComponent.prototype.adjustSort = function () {
        if (this._weekStart === 1) {
            this._weekArray.push(this._weekArray.shift());
        }
    };
    return CalendarWeekComponent;
}());
__decorate([
    Input()
], CalendarWeekComponent.prototype, "color", void 0);
__decorate([
    Input()
], CalendarWeekComponent.prototype, "weekArray", null);
__decorate([
    Input()
], CalendarWeekComponent.prototype, "weekStart", null);
CalendarWeekComponent = __decorate([
    Component({
        selector: 'ion-calendar-week',
        template: "\n        <ion-toolbar class=\"week-toolbar\"  no-border-top >\n            <ul [class]=\"'week-title ' + color\">\n                <li *ngFor=\"let w of _weekArray\">{{w}}</li>\n            </ul>\n        </ion-toolbar>\n    ",
    })
], CalendarWeekComponent);
export { CalendarWeekComponent };
//# sourceMappingURL=calendar-week.component.js.map