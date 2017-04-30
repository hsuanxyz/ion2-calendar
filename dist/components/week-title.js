import { Component, Input } from '@angular/core';
export var CalendarWeekTitle = (function () {
    function CalendarWeekTitle() {
        this._weekArray = "Di_Lu_Ma_Me_Je_Ve_Sa".split("_");
        this._weekStart = 0;
    }
    Object.defineProperty(CalendarWeekTitle.prototype, "weekArray", {
        set: function (value) {
            if (value && value.length === 7) {
                this._weekArray = value;
                this.adjustSort();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CalendarWeekTitle.prototype, "weekStart", {
        set: function (value) {
            if (value === 0 || value === 1) {
                this._weekStart = value;
                this.adjustSort();
            }
        },
        enumerable: true,
        configurable: true
    });
    CalendarWeekTitle.prototype.adjustSort = function () {
        if (this._weekStart === 1) {
            this._weekArray.push(this._weekArray.shift());
        }
    };
    CalendarWeekTitle.decorators = [
        { type: Component, args: [{
                    selector: 'calendar-week-title',
                    template: "\n        <ul class=\"week-title\">\n            <li *ngFor=\"let w of _weekArray\">{{w}}</li>\n        </ul>\n    ",
                    styles: [
                        "\n            .week-title {\n                background-color: #eee;\n                padding:0;margin:0\n            }\n\n            .week-title li {\n                list-style-type:none;\n                display: block;\n                float: left;\n                width: 14%;\n                text-align: center;\n            }\n\n            .week-title li:nth-of-type(7n), .week-title li:nth-of-type(7n+1) {\n                width: 15%;\n            }\n        "
                    ]
                },] },
    ];
    /** @nocollapse */
    CalendarWeekTitle.ctorParameters = function () { return []; };
    CalendarWeekTitle.propDecorators = {
        'weekArray': [{ type: Input },],
        'weekStart': [{ type: Input },],
    };
    return CalendarWeekTitle;
}());
//# sourceMappingURL=week-title.js.map