import { Component, ViewChild, ElementRef, ChangeDetectorRef, Renderer } from '@angular/core';
import { NavParams, ViewController, Content } from 'ionic-angular';
import * as moment from 'moment';
import { CalendarService } from "../services/calendar.service";
export var CalendarComponent = (function () {
    function CalendarComponent(_renderer, _elementRef, params, viewCtrl, ref, calSvc) {
        this._renderer = _renderer;
        this._elementRef = _elementRef;
        this.params = params;
        this.viewCtrl = viewCtrl;
        this.ref = ref;
        this.calSvc = calSvc;
        this.dayTemp = [null, null];
        this.monthTitleFilterStr = '';
        this.weekdaysTitle = [];
        this.weekStartDay = 0;
        this.debug = true;
        this._s = true;
        this._color = 'primary';
        this.findCssClass();
        this.init();
        this.getHistory();
    }
    CalendarComponent.prototype.ionViewDidLoad = function () {
        this.scrollToDefaultDate();
        if (this.content.enableScrollListener && this.scrollBackwards) {
            this.content.enableScrollListener();
        }
    };
    CalendarComponent.prototype.init = function () {
        var params = this.params;
        this._d = params.get('options');
        var startTime = moment(this._d.from).valueOf();
        var endTime = moment(this._d.to).valueOf();
        this.options = {
            start: startTime,
            end: endTime,
            isRadio: params.get('isRadio'),
            range_beg: startTime,
            range_end: endTime,
            daysConfig: params.get('daysConfig'),
            disableWeekdays: params.get('disableWeekdays'),
            monthTitle: params.get('monthTitle'),
        };
        this.defaultDate = this._d.defaultDate;
        this.scrollBackwards = this._d.canBackwardsSelected;
        this.weekStartDay = this._d.weekStartDay;
        this._id = this._d.id;
        this.monthTitleFilterStr = this._d.monthTitle;
        this.weekdaysTitle = this._d.weekdaysTitle;
        this.title = this._d.title;
        this.closeLabel = this._d.closeLabel;
        this.closeIcon = this._d.closeIcon;
        this.isSaveHistory = this._d.isSaveHistory;
        this.countNextMonths = this._d.countNextMonths;
        if (this.countNextMonths < 1) {
            this.countNextMonths = 1;
        }
        this.showYearPicker = this._d.showYearPicker;
        if (this.showYearPicker) {
            this.createYearPicker(startTime, endTime);
        }
        else {
            this.calendarMonths = this.calSvc.createMonthsByPeriod(startTime, this.findInitMonthNumber(this.defaultDate) + this.countNextMonths, this._d);
        }
    };
    CalendarComponent.prototype.findCssClass = function () {
        var _this = this;
        var cssClass = this.params.get('cssClass');
        if (cssClass) {
            cssClass.split(' ').forEach(function (cssClass) {
                if (cssClass.trim() !== '')
                    _this._renderer.setElementClass(_this._elementRef.nativeElement, cssClass, true);
            });
        }
    };
    CalendarComponent.prototype.dismiss = function (data) {
        // this.viewCtrl.dismiss(data);
        this.calSvc.savedHistory(data, this._id);
        this.ref.detectChanges();
    };
    CalendarComponent.prototype.getHistory = function () {
        if (this.isSaveHistory) {
            this.dayTemp = this.calSvc.getHistory(this._id);
        }
    };
    CalendarComponent.prototype.createYearPicker = function (startTime, endTime) {
        // init year array
        this.years = [];
        // getting max and be sure, it is in future (maybe parameter?)
        var maxYear = (new Date(endTime)).getFullYear();
        if (maxYear <= 1970) {
            maxYear = (new Date(this.defaultDate)).getFullYear() + 10;
            this.options.end = new Date(maxYear, 12, 0).getTime();
        }
        // min year should be okay, either it will be set or something like 1970 at min
        var minYear = (new Date(startTime)).getFullYear();
        // calculating the needed years to be added to array
        var neededYears = (maxYear - minYear);
        // pushing years to selection array
        for (var y = 0; y <= neededYears; y++) {
            this.years.push(maxYear - y);
        }
        // selection-start-year of defaultDate
        this.year = this.defaultDate.getFullYear();
        var firstDayOfYear = new Date(this.year, 0, 1);
        var lastDayOfYear = new Date(this.year, 12, 0);
        // don't calc over the start / end
        if (firstDayOfYear.getTime() < this.options.start) {
            firstDayOfYear = new Date(this.options.start);
        }
        if (lastDayOfYear.getTime() > this.options.end) {
            lastDayOfYear = new Date(this.options.end);
        }
        // calcing the month
        this.calendarMonths = this.calSvc.createMonthsByPeriod(firstDayOfYear.getTime(), this.findInitMonthNumber(this.defaultDate) + this.countNextMonths, this._d);
        // sets the range new
        // checking whether the start is after firstDayOfYear
        this.options.range_beg = firstDayOfYear.getTime() < startTime ? startTime : firstDayOfYear.getTime();
        // checking whether the end is before lastDayOfYear
        this.options.range_end = lastDayOfYear.getTime() > endTime ? endTime : lastDayOfYear.getTime();
    };
    CalendarComponent.prototype.nextMonth = function (infiniteScroll) {
        this.infiniteScroll = infiniteScroll;
        var len = this.calendarMonths.length;
        var final = this.calendarMonths[len - 1];
        var nextTime = moment(final.original.time).add(1, 'M').valueOf();
        var rangeEnd = this.options.range_end ? moment(this.options.range_end).subtract(1, 'M') : 0;
        if (len <= 0 || (rangeEnd !== 0 && moment(final.original.time).isAfter(rangeEnd))) {
            infiniteScroll.enable(false);
            return;
        }
        (_a = this.calendarMonths).push.apply(_a, this.calSvc.createMonthsByPeriod(nextTime, 1, this._d));
        infiniteScroll.complete();
        var _a;
    };
    CalendarComponent.prototype.backwardsMonth = function () {
        var first = this.calendarMonths[0];
        var firstTime = moment(first.original.time).subtract(1, 'M').valueOf();
        (_a = this.calendarMonths).unshift.apply(_a, this.calSvc.createMonthsByPeriod(firstTime, 1, this._d));
        this.ref.detectChanges();
        var _a;
    };
    CalendarComponent.prototype.scrollToDefaultDate = function () {
        var _this = this;
        var defaultDateIndex = this.findInitMonthNumber(this.defaultDate);
        var defaultDateMonth = this.monthsEle.nativeElement.children[("month-" + defaultDateIndex)].offsetTop;
        if (defaultDateIndex === 0 || defaultDateMonth === 0)
            return;
        setTimeout(function () {
            _this.content.scrollTo(0, defaultDateMonth, 128);
        }, 300);
    };
    CalendarComponent.prototype.onScroll = function ($event) {
        var _this = this;
        if (!this.scrollBackwards)
            return;
        if ($event.scrollTop <= 200 && this._s) {
            this._s = !1;
            var lastHeight_1 = this.content.getContentDimensions().scrollHeight;
            setTimeout(function () {
                _this.backwardsMonth();
                var nowHeight = _this.content.getContentDimensions().scrollHeight;
                _this.content.scrollTo(0, nowHeight - lastHeight_1, 0)
                    .then(function () {
                    _this._s = !0;
                });
            }, 180);
        }
    };
    CalendarComponent.prototype.findInitMonthNumber = function (date) {
        var startDate = moment(this.options.start);
        var defaultDate = moment(date);
        var isAfter = defaultDate.isAfter(startDate);
        if (!isAfter)
            return 0;
        if (this.showYearPicker) {
            startDate = moment(new Date(this.year, 0, 1));
        }
        return defaultDate.diff(startDate, 'month');
    };
    CalendarComponent.prototype.changedYearSelection = function () {
        var _this = this;
        // re-enabling infinite scroll
        if (this.infiniteScroll !== undefined) {
            this.infiniteScroll.enable(true);
        }
        // getting first day and last day of the year
        var firstDayOfYear = new Date(this.year, 0, 1);
        var lastDayOfYear = new Date(this.year, 12, 0);
        // don't calc over the start / end
        if (firstDayOfYear.getTime() < this.options.start) {
            firstDayOfYear = new Date(this.options.start);
        }
        if (lastDayOfYear.getTime() > this.options.end) {
            lastDayOfYear = new Date(this.options.end);
        }
        // sets the range new
        // checking whether the start is after firstDayOfYear
        this.options.range_beg = firstDayOfYear.getTime() < this.options.start ? this.options.start : firstDayOfYear.getTime();
        // checking whether the end is before lastDayOfYear
        this.options.range_end = lastDayOfYear.getTime() > this.options.end ? this.options.end : lastDayOfYear.getTime();
        // calcing the months
        var monthCount = (this.findInitMonthNumber(firstDayOfYear) + this.countNextMonths);
        this.calendarMonths = this.calSvc.createMonthsByPeriod(firstDayOfYear.getTime(), monthCount <= 1 ? 3 : monthCount, this._d);
        // scrolling to the top
        setTimeout(function () {
            _this.content.scrollTo(0, 0, 128);
        }, 300);
    };
    CalendarComponent.decorators = [
        { type: Component, args: [{
                    template: "\n        <ion-header>\n            <ion-navbar [color]=\"_color\">\n\n                <ion-buttons start>\n                    <button ion-button clear *ngIf=\"closeLabel !== '' && !closeIcon\" (click)=\"dismiss()\">\n                        {{closeLabel}}\n                    </button>\n                    <button ion-button icon-only clear *ngIf=\"closeLabel === '' || closeIcon\" (click)=\"dismiss()\">\n                        <ion-icon name=\"close\"></ion-icon>\n                    </button>\n                </ion-buttons>\n\n\n                <ion-title *ngIf=\"showYearPicker\">\n                    <ion-select [(ngModel)]=\"year\" (ngModelChange)=\"changedYearSelection()\" interface=\"popover\">\n                        <ion-option *ngFor=\"let y of years\" value=\"{{y}}\">{{y}}</ion-option>\n                    </ion-select>\n                </ion-title>\n                <ion-title *ngIf=\"!showYearPicker\">{{title}}</ion-title>\n            </ion-navbar>\n\n            <calendar-week-title\n                    [color]=\"_color\"\n                    [weekArray]=\"weekdaysTitle\"\n                    [weekStart]=\"weekStartDay\">\n            </calendar-week-title>\n\n        </ion-header>\n\n        <ion-content (ionScroll)=\"onScroll($event)\" class=\"calendar-page\" [ngClass]=\"{'multiSelection': !options.isRadio}\">\n\n            <div #months>\n                <div *ngFor=\"let month of calendarMonths;let i = index;\" class=\"month-box\" [attr.id]=\"'month-' + i\">\n                    <h4 class=\"text-center month-title\">{{month.original.date | date:monthTitleFilterStr}}</h4>\n                    <ion2-month [month]=\"month\"\n                                [isRadio]=\"options.isRadio\"\n                                [isSaveHistory]=\"isSaveHistory\"\n                                [id]=\"_id\"\n                                (onChange)=\"dismiss($event)\"\n                                [(ngModel)]=\"dayTemp\"></ion2-month>\n                </div>\n            </div>\n\n            <ion-infinite-scroll (ionInfinite)=\"nextMonth($event)\">\n                <ion-infinite-scroll-content></ion-infinite-scroll-content>\n            </ion-infinite-scroll>\n\n        </ion-content>\n    ",
                    selector: 'calendar-page',
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
        'content': [{ type: ViewChild, args: [Content,] },],
        'monthsEle': [{ type: ViewChild, args: ['months',] },],
    };
    return CalendarComponent;
}());
//# sourceMappingURL=calendar-component.js.map