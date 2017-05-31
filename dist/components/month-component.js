import { Component, ChangeDetectorRef, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from "@angular/forms";
export var MONTH_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(function () { return MonthComponent; }),
    multi: true,
};
export var MonthComponent = (function () {
    function MonthComponent(ref) {
        this.ref = ref;
        this.onChange = new EventEmitter();
        this._date = [null, null];
    }
    MonthComponent.prototype.ngOnInit = function () {
        this._date = [null, null];
    };
    MonthComponent.prototype.writeValue = function (obj) {
        this._date = obj;
    };
    MonthComponent.prototype.registerOnChange = function (fn) {
        this._onChanged = fn;
    };
    MonthComponent.prototype.registerOnTouched = function (fn) {
        this._onTouched = fn;
    };
    MonthComponent.prototype.isEndSelection = function (day) {
        if (this.isRadio || !Array.isArray(this._date) || this._date[1] === null) {
            return false;
        }
        return this._date[1].time === day.time;
    };
    MonthComponent.prototype.isBetween = function (day) {
        if (this.isRadio || !Array.isArray(this._date)) {
            return false;
        }
        var start = 0;
        var end = 0;
        if (this._date[0] === null) {
            return false;
        }
        else {
            start = this._date[0].time;
        }
        if (this._date[1] === null) {
            return false;
        }
        else {
            end = this._date[1].time;
        }
        return day.time < end && day.time > start;
    };
    MonthComponent.prototype.isStartSelection = function (day) {
        if (this.isRadio || !Array.isArray(this._date) || this._date[0] === null) {
            return false;
        }
        return this._date[0].time === day.time && this._date[1] !== null;
    };
    MonthComponent.prototype.isSelected = function (time) {
        if (Array.isArray(this._date)) {
            if (this._date[0] !== null) {
                return time === this._date[0].time;
            }
            if (this._date[1] !== null) {
                return time === this._date[1].time;
            }
        }
        else {
            return false;
        }
    };
    MonthComponent.prototype.onSelected = function (item) {
        item.selected = true;
        this.ref.detectChanges();
        if (this.isRadio) {
            this._date[0] = item;
            this.onChange.emit(this._date);
            return;
        }
        if (this._date[0] === null) {
            this._date[0] = item;
            this.ref.detectChanges();
        }
        else if (this._date[1] === null) {
            if (this._date[0].time < item.time) {
                this._date[1] = item;
            }
            else {
                this._date[1] = this._date[0];
                this._date[0] = item;
            }
            this.ref.detectChanges();
        }
        else {
            this._date[0] = item;
            this._date[1] = null;
        }
        this.onChange.emit(this._date);
        this.ref.detectChanges();
    };
    MonthComponent.decorators = [
        { type: Component, args: [{
                    selector: 'ion2-month',
                    providers: [MONTH_VALUE_ACCESSOR],
                    template: "        \n        <ng-template *ngIf=\"isRadio\">\n            <div class=\"days-box\">\n                <div class=\"days\" *ngFor=\"let day of month.days\">\n                    <button [class]=\"'days-btn ' + day.cssClass\"\n                            *ngIf=\"day\"\n                            [class.today]=\"day.isToday\"\n                            (click)=\"onSelected(day)\"\n                            [class.marked]=\"day.marked\"\n                            [class.on-selected]=\"isSelected(day.time)\"\n                            [disabled]=\"day.disable\">\n                        <p>{{day.title}}</p>\n                        <small *ngIf=\"day.subTitle\">{{day?.subTitle}}</small>\n                    </button>\n                </div>\n            </div>\n        </ng-template>\n        <ng-template *ngIf=\"!isRadio\">\n            <div class=\"days-box\">\n                <div class=\"days\" *ngFor=\"let day of month.days\">\n                    <button [class]=\"'days-btn ' + day.cssClass\"\n                            *ngIf=\"day\"\n                            [class.today]=\"day.isToday\"\n                            (click)=\"onSelected(day)\"\n                            [class.marked]=\"day.marked\"\n                            [class.on-selected]=\"isSelected(day.time)\"\n                            [disabled]=\"day.disable\"\n                            [class.startSelection]=\"isStartSelection(day)\"\n                            [class.endSelection]=\"isEndSelection(day)\"\n                            [class.between]=\"isBetween(day)\">\n                        <p>{{day.title}}</p>\n                        <small *ngIf=\"day.subTitle\">{{day?.subTitle}}</small>\n                    </button>\n                </div>\n            </div>\n        </ng-template>\n\n    ",
                    styles: [
                        "\n            .month-box{\n                display: inline-block;\n                padding-bottom: 1em;\n                border-bottom: 1px solid #f1f1f1;\n            }\n\n            .days-box {\n                padding: 0.5rem;\n            }\n\n      \n            .days:nth-of-type(7n), .days:nth-of-type(7n+1) {\n                width: 15%;\n            }\n            .days {\n                width: 14%;\n                float: left;\n                text-align: center;\n                height: 40px;\n            }\n            .days .marked p{\n                color: rgb(59, 151, 247);\n                font-weight:500;\n            }\n\n            .days .today p {\n                border-bottom: 2px solid rgb(59, 151, 247);\n                padding-bottom: 2px;\n            }\n\n            .days .on-selected{\n                transition: background-color .3s;\n                background-color: rgb(201, 225, 250);\n                border: none;\n            }\n\n            .days .on-selected p{\n                color: rgb(59, 151, 247);\n                font-size: 1.3em;\n            }\n\n            button.days-btn {\n                border-radius: 50%;\n                width: 36px;\n                display: block;\n                margin: 0 auto;\n                height: 36px;\n                background-color: transparent;\n                position: relative;\n                z-index:2;\n            }\n\n            button.days-btn p {\n                margin:0;\n                font-size: 1.2em;\n                color: #333;\n            }\n\n            button.days-btn.on-selected small{\n                transition: bottom .3s;\n                bottom: -14px;\n            }\n\n            button.days-btn small {\n                overflow: hidden;\n                display: block;\n                left: 0;\n                right: 0;\n                bottom: -5px;\n                position: absolute;\n                z-index:1;\n                text-align: center;\n                color: #3b97f7;\n                font-weight: 200;\n            }\n        ",
                    ],
                },] },
    ];
    /** @nocollapse */
    MonthComponent.ctorParameters = function () { return [
        { type: ChangeDetectorRef, },
    ]; };
    MonthComponent.propDecorators = {
        'month': [{ type: Input },],
        'isRadio': [{ type: Input },],
        'isSaveHistory': [{ type: Input },],
        'id': [{ type: Input },],
        'onChange': [{ type: Output },],
    };
    return MonthComponent;
}());
//# sourceMappingURL=month-component.js.map