import { Component, Input } from '@angular/core';
var CalendarWeekComponent = (function () {
    function CalendarWeekComponent() {
        this._weekArray = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
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
export { CalendarWeekComponent };
CalendarWeekComponent.decorators = [
    { type: Component, args: [{
                selector: 'ion-calendar-week',
                template: "\n    <ion-toolbar class=\"week-toolbar\" no-border-top>\n      <ul [class]=\"'week-title ' + color\">\n        <li *ngFor=\"let w of _weekArray\">{{w}}</li>\n      </ul>\n    </ion-toolbar>\n  ",
            },] },
];
/** @nocollapse */
CalendarWeekComponent.ctorParameters = function () { return []; };
CalendarWeekComponent.propDecorators = {
    'color': [{ type: Input },],
    'weekArray': [{ type: Input },],
    'weekStart': [{ type: Input },],
};
//# sourceMappingURL=calendar-week.component.js.map