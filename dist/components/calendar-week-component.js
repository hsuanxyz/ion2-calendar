import { Component, Input } from '@angular/core';
export var CalendarWeekComponent = (function () {
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
    CalendarWeekComponent.decorators = [
        { type: Component, args: [{
                    selector: 'calendar-week-title',
                    template: "\n        <ion-toolbar class=\"week-toolbar\"  no-border-top >\n            <ul [class]=\"'week-title ' + color\">\n                <li *ngFor=\"let w of _weekArray\">{{w}}</li>\n            </ul>          \n        </ion-toolbar>\n    ",
                    styles: [
                        "\n            .week-toolbar{\n                padding: 0;\n                box-shadow: 0 2px 4px rgb(158, 158, 158);\n            }\n            \n            .week-toolbar.toolbar-md {\n                min-height:44px;\n            }\n\n\n            .week-title {\n                margin: 0;\n                color:#fff;\n                height: 44px;\n                width: 100%;\n                background-color: rgb(59, 151, 247);\n                padding: 15px 0;\n            }\n\n\n            .week-title li {\n                list-style-type:none;\n                display: block;\n                float: left;\n                width: 14%;\n                text-align: center;\n            }\n\n            .week-title li:nth-of-type(7n), .week-title li:nth-of-type(7n+1) {\n                width: 15%;\n            }\n        "
                    ]
                },] },
    ];
    /** @nocollapse */
    CalendarWeekComponent.ctorParameters = function () { return []; };
    CalendarWeekComponent.propDecorators = {
        'color': [{ type: Input },],
        'weekArray': [{ type: Input },],
        'weekStart': [{ type: Input },],
    };
    return CalendarWeekComponent;
}());
//# sourceMappingURL=calendar-week-component.js.map