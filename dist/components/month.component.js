var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from "@angular/forms";
export var MONTH_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(function () { return MonthComponent; }),
    multi: true,
};
var MonthComponent = (function () {
    function MonthComponent(ref) {
        this.ref = ref;
        this.color = 'primary';
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
    return MonthComponent;
}());
__decorate([
    Input()
], MonthComponent.prototype, "month", void 0);
__decorate([
    Input()
], MonthComponent.prototype, "isRadio", void 0);
__decorate([
    Input()
], MonthComponent.prototype, "isSaveHistory", void 0);
__decorate([
    Input()
], MonthComponent.prototype, "id", void 0);
__decorate([
    Input()
], MonthComponent.prototype, "color", void 0);
__decorate([
    Output()
], MonthComponent.prototype, "onChange", void 0);
MonthComponent = __decorate([
    Component({
        selector: 'ion-calendar-month',
        providers: [MONTH_VALUE_ACCESSOR],
        template: "        \n        <div [class]=\"color\">\n            <div *ngIf=\"isRadio\">\n                <div class=\"days-box\">\n                    <div class=\"days\" *ngFor=\"let day of month.days\">\n                        <button [class]=\"'days-btn ' + day.cssClass\"\n                                *ngIf=\"day\"\n                                [class.today]=\"day.isToday\"\n                                (click)=\"onSelected(day)\"\n                                [class.marked]=\"day.marked\"\n                                [class.on-selected]=\"isSelected(day.time)\"\n                                [disabled]=\"day.disable\">\n                            <p>{{day.title}}</p>\n                            <small *ngIf=\"day.subTitle\">{{day?.subTitle}}</small>\n                        </button>\n                    </div>\n                </div>\n            </div>\n            <div *ngIf=\"!isRadio\">\n                <div class=\"days-box\">\n                    <div class=\"days\" *ngFor=\"let day of month.days\">\n                        <button [class]=\"'days-btn ' + day.cssClass\"\n                                *ngIf=\"day\"\n                                [class.today]=\"day.isToday\"\n                                (click)=\"onSelected(day)\"\n                                [class.marked]=\"day.marked\"\n                                [class.on-selected]=\"isSelected(day.time)\"\n                                [disabled]=\"day.disable\"\n                                [class.startSelection]=\"isStartSelection(day)\"\n                                [class.endSelection]=\"isEndSelection(day)\"\n                                [class.between]=\"isBetween(day)\">\n                            <p>{{day.title}}</p>\n                            <small *ngIf=\"day.subTitle\">{{day?.subTitle}}</small>\n                        </button>\n                    </div>\n                </div>\n            </div>\n        </div>\n    ",
    })
], MonthComponent);
export { MonthComponent };
//# sourceMappingURL=month.component.js.map