import { Component, ChangeDetectorRef, Input, Output, EventEmitter, forwardRef, } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { defaults, pickModes } from "../config";
export var MONTH_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(function () { return MonthComponent; }),
    multi: true,
};
var MonthComponent = /** @class */ (function () {
    function MonthComponent(ref) {
        this.ref = ref;
        this._pins = [];
        this.readonly = false;
        this.color = defaults.COLOR;
        this.onChange = new EventEmitter();
        this._date = [null, null];
        this._isInit = false;
    }
    Object.defineProperty(MonthComponent.prototype, "pins", {
        get: function () {
            return this._pins;
        },
        set: function (ps) {
            if (Array.isArray(ps) && ps.length > 1) {
                this._pins = ps;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MonthComponent.prototype, "_isRange", {
        get: function () {
            return this.pickMode === pickModes.RANGE;
        },
        enumerable: true,
        configurable: true
    });
    MonthComponent.prototype.ngAfterViewInit = function () {
        this._isInit = true;
    };
    MonthComponent.prototype.writeValue = function (obj) {
        if (Array.isArray(obj)) {
            this._date = obj;
        }
    };
    MonthComponent.prototype.registerOnChange = function (fn) {
        this._onChanged = fn;
    };
    MonthComponent.prototype.registerOnTouched = function (fn) {
        this._onTouched = fn;
    };
    MonthComponent.prototype.trackByTime = function (index, item) {
        return item ? item.time : index;
    };
    MonthComponent.prototype.isEndPin = function (day) {
        if (!day)
            return false;
        if (this.pickMode === pickModes.RANGE || !this._isInit || !this.pins.length) {
            return false;
        }
        return this.pins[1] === day.time && this.pins[1] !== null;
    };
    MonthComponent.prototype.isBetweenPin = function (day) {
        if (!day)
            return false;
        if (this.pickMode === pickModes.RANGE || !this._isInit || !this.pins.length) {
            return false;
        }
        var start = this.pins[0];
        var end = this.pins[1];
        return day.time < end && day.time > start;
    };
    MonthComponent.prototype.isStartPin = function (day) {
        if (!day)
            return false;
        if (this.pickMode === pickModes.RANGE || !this._isInit || !this.pins.length) {
            return false;
        }
        return this.pins[0] === day.time && this.pins[0] !== null;
    };
    MonthComponent.prototype.isEndSelection = function (day) {
        if (!day)
            return false;
        if (this.pickMode !== pickModes.RANGE || !this._isInit || this._date[1] === null) {
            return false;
        }
        return this._date[1].time === day.time;
    };
    MonthComponent.prototype.isBetween = function (day) {
        if (!day)
            return false;
        if (this.pickMode !== pickModes.RANGE || !this._isInit) {
            return false;
        }
        if (this._date[0] === null || this._date[1] === null) {
            return false;
        }
        var start = this._date[0].time;
        var end = this._date[1].time;
        return day.time < end && day.time > start;
    };
    MonthComponent.prototype.isStartSelection = function (day) {
        if (!day)
            return false;
        if (this.pickMode !== pickModes.RANGE || !this._isInit || this._date[0] === null) {
            return false;
        }
        return this._date[0].time === day.time && this._date[1] !== null;
    };
    MonthComponent.prototype.isSelected = function (time) {
        if (Array.isArray(this._date)) {
            if (this.pickMode === pickModes.MULTI) {
                return this._date.findIndex(function (e) { return e !== null && e.time === time; }) !== -1;
            }
            else if (this.pickMode !== pickModes.SINGLE) {
                if (this._date[0] !== null) {
                    return time === this._date[0].time;
                }
            }
            else {
                if (this._date[0] !== null) {
                    if (this._date[1] !== null) {
                        return time === this._date[0].time || time === this._date[1].time;
                    }
                    else {
                        return time === this._date[0].time;
                    }
                }
                else {
                    return false;
                }
            }
        }
        else {
            return false;
        }
    };
    MonthComponent.prototype.onSelected = function (item) {
        if (this.readonly)
            return;
        item.selected = true;
        if (this.pickMode === pickModes.SINGLE) {
            this._date[0] = item;
            this.onChange.emit(this._date);
            return;
        }
        if (this.pickMode === pickModes.RANGE) {
            if (this._date[0] === null) {
                this._date[0] = item;
            }
            else {
                if (this._date[1] === null) {
                    if (this._date[0].time < item.time) {
                        this._date[1] = item;
                    }
                    else {
                        this._date[1] = this._date[0];
                        this._date[0] = item;
                    }
                }
                else {
                    this._date[0] = item;
                    this._date[1] = null;
                }
            }
            this.onChange.emit(this._date);
            return;
        }
        if (this.pickMode === pickModes.MULTI) {
            var index = this._date.findIndex(function (e) { return e !== null && e.time === item.time; });
            if (index === -1) {
                this._date.push(item);
            }
            else {
                this._date.splice(index, 1);
            }
            this.onChange.emit(this._date.filter(function (e) { return e !== null; }));
        }
    };
    MonthComponent.decorators = [
        { type: Component, args: [{
                    selector: 'ion-calendar-month',
                    providers: [MONTH_VALUE_ACCESSOR],
                    template: "\n    <div [class]=\"color\">\n      <ng-template [ngIf]=\"!_isRange\" [ngIfElse]=\"rangeBox\">\n        <div class=\"days-box\">\n          <ng-template ngFor let-day [ngForOf]=\"month.days\" [ngForTrackBy]=\"trackByTime\">\n            <div class=\"days\"\n                 [class.startPins]=\"isStartPin(day)\"\n                 [class.endPins]=\"isEndPin(day)\"\n                 [class.betweenPins]=\"isBetweenPin(day)\">\n              <ng-container *ngIf=\"day\">\n                <button type='button'\n                        [class]=\"'days-btn ' + day.cssClass\"\n                        [class.today]=\"day.isToday\"\n                        (click)=\"onSelected(day)\"\n                        [class.marked]=\"day.marked\"\n                        [class.on-selected]=\"isSelected(day.time)\"\n                        [disabled]=\"day.disable\">\n                  <p>{{day.title}}</p>\n                  <small *ngIf=\"day.subTitle\">{{day?.subTitle}}</small>\n                </button>\n              </ng-container>\n            </div>\n          </ng-template>\n        </div>\n      </ng-template>\n\n      <ng-template #rangeBox>\n        <div class=\"days-box\">\n          <ng-template ngFor let-day [ngForOf]=\"month.days\" [ngForTrackBy]=\"trackByTime\">\n            <div class=\"days\"\n                 [class.startSelection]=\"isStartSelection(day)\"\n                 [class.endSelection]=\"isEndSelection(day)\"\n                 [class.between]=\"isBetween(day)\">\n              <ng-container *ngIf=\"day\">\n                <button type='button'\n                        [class]=\"'days-btn ' + day.cssClass\"\n                        [class.today]=\"day.isToday\"\n                        (click)=\"onSelected(day)\"\n                        [class.marked]=\"day.marked\"\n                        [class.on-selected]=\"isSelected(day.time)\"\n                        [disabled]=\"day.disable\">\n                  <p>{{day.title}}</p>\n                  <small *ngIf=\"day.subTitle\">{{day?.subTitle}}</small>\n                </button>\n              </ng-container>\n\n            </div>\n          </ng-template>\n        </div>\n      </ng-template>\n    </div>\n  ",
                },] },
    ];
    /** @nocollapse */
    MonthComponent.ctorParameters = function () { return [
        { type: ChangeDetectorRef, },
    ]; };
    MonthComponent.propDecorators = {
        'month': [{ type: Input },],
        'pickMode': [{ type: Input },],
        'isSaveHistory': [{ type: Input },],
        'id': [{ type: Input },],
        'readonly': [{ type: Input },],
        'color': [{ type: Input },],
        'pins': [{ type: Input },],
        'onChange': [{ type: Output },],
    };
    return MonthComponent;
}());
export { MonthComponent };
//# sourceMappingURL=month.component.js.map