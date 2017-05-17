import { Component, ViewChild, ElementRef, ChangeDetectorRef, Renderer } from '@angular/core';
import { NavParams, ViewController, Content } from 'ionic-angular';
import * as moment from 'moment';
export var CalendarComponent = (function () {
    function CalendarComponent(params, viewCtrl, ref, _renderer, _elementRef) {
        this.params = params;
        this.viewCtrl = viewCtrl;
        this.ref = ref;
        this._renderer = _renderer;
        this._elementRef = _elementRef;
        this.dayTemp = [null, null];
        this.monthTitleFilterStr = '';
        this.weekdaysTitle = [];
        this._s = true;
        this._savedHistory = {};
        this._color = 'primary';
        this.weekStartDay = 0;
        this.findCssClass();
        this.init();
    }
    CalendarComponent.prototype.ionViewDidLoad = function () {
        this.scrollToDefaultDate();
        if (this.content.enableScrollListener && this.scrollBackwards) {
            this.content.enableScrollListener();
        }
    };
    CalendarComponent.prototype.init = function () {
        var params = this.params;
        var startTime = moment(params.get('from')).valueOf();
        var endTime = moment(params.get('to')).valueOf();
        this.options = {
            start: startTime,
            isRadio: params.get('isRadio'),
            range_beg: startTime,
            range_end: endTime,
            daysConfig: params.get('daysConfig'),
            disableWeekdays: params.get('disableWeekdays'),
            monthTitle: params.get('monthTitle'),
        };
        this.defaultDate = params.get('defaultDate');
        this.scrollBackwards = params.get('canBackwardsSelected');
        this.weekStartDay = params.get('weekStartDay');
        this._id = params.get('id');
        this.monthTitleFilterStr = params.get('monthTitle');
        this.weekdaysTitle = params.get('weekdaysTitle');
        this.title = params.get('title');
        this.closeLabel = params.get('closeLabel');
        this.isSaveHistory = params.get('isSaveHistory');
        if (this.isSaveHistory) {
            this._savedHistory = this.savedHistory || {};
        }
        this.countNextMonths = (params.get('countNextMonths') || 3);
        if (this.countNextMonths < 1) {
            this.countNextMonths = 1;
        }
        this.calendarMonths = this.createMonthsByPeriod(startTime, this.findInitMonthNumber(this.defaultDate) + this.countNextMonths);
    };
    Object.defineProperty(CalendarComponent.prototype, "savedHistory", {
        get: function () {
            var _savedDatesCache = localStorage.getItem("ion-calendar-" + this._id);
            var _savedDates = JSON.parse(_savedDatesCache);
            return _savedDates;
        },
        set: function (savedDates) {
            localStorage.setItem("ion-calendar-" + this._id, JSON.stringify(savedDates));
        },
        enumerable: true,
        configurable: true
    });
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
    CalendarComponent.prototype.dismiss = function () {
        var data = this.dayTemp;
        this.viewCtrl.dismiss({
            from: data[0],
            to: data[1],
        });
    };
    CalendarComponent.prototype.onSelected = function (item) {
        item.selected = true;
        this.ref.detectChanges();
        if (this.options.isRadio) {
            this.savedHistory = {
                type: 'radio',
                id: this._id,
                from: item.time,
                to: 0
            };
            if (this.isSaveHistory) {
                this._savedHistory = this.savedHistory;
            }
            this.viewCtrl.dismiss({
                date: Object.assign({}, item)
            });
            return;
        }
        if (!this.dayTemp[0]) {
            this.dayTemp[0] = item;
            this._savedHistory.from = this.dayTemp[0].time;
            this.ref.detectChanges();
        }
        else if (!this.dayTemp[1]) {
            if (this.dayTemp[0].time < item.time) {
                this.dayTemp[1] = item;
            }
            else {
                this.dayTemp[1] = this.dayTemp[0];
                this.dayTemp[0] = item;
            }
            this.ref.detectChanges();
            if (this.isSaveHistory) {
                this.savedHistory = {
                    type: 'radio',
                    id: this._id,
                    from: this.dayTemp[0].time,
                    to: this.dayTemp[1].time
                };
                this._savedHistory = this.savedHistory;
            }
            this.dismiss();
        }
        else {
            this.dayTemp[0].selected = false;
            this.dayTemp[0] = item;
            this.dayTemp[1].selected = false;
            this.dayTemp[1] = null;
            this.ref.detectChanges();
        }
    };
    CalendarComponent.prototype.nextMonth = function (infiniteScroll) {
        var len = this.calendarMonths.length;
        var final = this.calendarMonths[len - 1];
        var nextTime = moment(final.original.time).add(1, 'M').valueOf();
        var rangeEnd = this.options.range_end ? moment(this.options.range_end).subtract(1, 'M') : 0;
        if (len <= 0 || (rangeEnd !== 0 && moment(final.original.time).isAfter(rangeEnd))) {
            infiniteScroll.enable(false);
            return;
        }
        (_a = this.calendarMonths).push.apply(_a, this.createMonthsByPeriod(nextTime, 1));
        infiniteScroll.complete();
        var _a;
    };
    CalendarComponent.prototype.backwardsMonth = function () {
        var first = this.calendarMonths[0];
        var firstTime = moment(first.original.time).subtract(1, 'M').valueOf();
        (_a = this.calendarMonths).unshift.apply(_a, this.createMonthsByPeriod(firstTime, 1));
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
    CalendarComponent.prototype.findDayConfig = function (day) {
        if (this.options.daysConfig.length <= 0)
            return null;
        return this.options.daysConfig.find(function (n) { return day.isSame(n.date, 'day'); });
    };
    CalendarComponent.prototype.createOriginalCalendar = function (time) {
        var _year = new Date(time).getFullYear();
        var _month = new Date(time).getMonth();
        var _firstWeek = new Date(_year, _month, 1).getDay();
        var _howManyDays = moment(time).daysInMonth();
        return {
            time: time,
            date: new Date(time),
            year: _year,
            month: _month,
            firstWeek: _firstWeek,
            howManyDays: _howManyDays
        };
    };
    CalendarComponent.prototype.createCalendarDay = function (time) {
        var _time = moment(time);
        var isToday = moment().isSame(_time, 'days');
        var dayConfig = this.findDayConfig(_time);
        var _rangeBeg = this.options.range_beg;
        var _rangeEnd = this.options.range_end;
        var isBetween = true;
        var disableWee = this.options.disableWeekdays.indexOf(_time.toDate().getDay()) !== -1;
        if (_rangeBeg > 0 && _rangeEnd > 0) {
            if (!this.scrollBackwards) {
                isBetween = !_time.isBetween(_rangeBeg, _rangeEnd, 'days', '[]');
            }
            else {
                isBetween = moment(_time).isBefore(_rangeBeg) ? false : isBetween;
            }
        }
        else if (_rangeBeg > 0 && _rangeEnd === 0) {
            if (!this.scrollBackwards) {
                var _addTime = _time.add('day', 1);
                isBetween = !_addTime.isAfter(_rangeBeg);
            }
            else {
                isBetween = false;
            }
        }
        var _disable = disableWee || isBetween;
        return {
            time: time,
            isToday: isToday,
            selected: false,
            marked: dayConfig ? dayConfig.marked || false : false,
            cssClass: dayConfig ? dayConfig.cssClass || '' : '',
            disable: dayConfig ? dayConfig.disable || _disable : _disable,
            title: dayConfig ? dayConfig.title || new Date(time).getDate().toString() : new Date(time).getDate().toString(),
            subTitle: dayConfig ? dayConfig.subTitle || '' : ''
        };
    };
    CalendarComponent.prototype.createCalendarMonth = function (original) {
        var days = new Array(6).fill(null);
        var len = original.howManyDays;
        for (var i = original.firstWeek; i < len + original.firstWeek; i++) {
            var itemTime = new Date(original.year, original.month, i - original.firstWeek + 1).getTime();
            days[i] = this.createCalendarDay(itemTime);
        }
        var weekStartDay = this.weekStartDay;
        if (weekStartDay === 1) {
            if (days[0] === null) {
                days.shift();
                days.push.apply(days, new Array(1).fill(null));
            }
            else {
                days.unshift(null);
                days.pop();
            }
        }
        return {
            original: original,
            days: days
        };
    };
    CalendarComponent.prototype.createMonthsByPeriod = function (startTime, monthsNum) {
        var _array = [];
        var _start = new Date(startTime);
        var _startMonth = new Date(_start.getFullYear(), _start.getMonth(), 1).getTime();
        for (var i = 0; i < monthsNum; i++) {
            var time = moment(_startMonth).add(i, 'M').valueOf();
            var originalCalendar = this.createOriginalCalendar(time);
            _array.push(this.createCalendarMonth(originalCalendar));
        }
        return _array;
    };
    CalendarComponent.prototype.findInitMonthNumber = function (date) {
        var startDate = moment(this.options.start);
        var defaultDate = moment(date);
        var isAfter = defaultDate.isAfter(startDate);
        if (!isAfter)
            return 0;
        return defaultDate.diff(startDate, 'month');
    };
    CalendarComponent.decorators = [
        { type: Component, args: [{
                    template: "\n        <ion-header>\n            <ion-navbar [color]=\"_color\">\n\n                <ion-buttons start>\n                    <button ion-button clear *ngIf=\"closeLabel !== ''\" (click)=\"dismiss()\">\n                        {{closeLabel}}\n                    </button>\n                </ion-buttons>\n\n\n                <ion-title>{{title}}</ion-title>\n            </ion-navbar>\n\n            <calendar-week-title\n                    [color]=\"_color\"\n                    [weekArray]=\"weekdaysTitle\"\n                    [weekStart]=\"weekStartDay\">\n            </calendar-week-title>\n\n        </ion-header>\n\n        <ion-content (ionScroll)=\"onScroll($event)\" class=\"calendar-page\">\n\n            <div #months>\n                <div *ngFor=\"let month of calendarMonths;let i = index;\" class=\"month-box\" [attr.id]=\"'month-' + i\">\n                    <h4 class=\"text-center month-title\">{{month.original.date | date:monthTitleFilterStr}}</h4>\n                    <div class=\"days-box\">\n                        <div class=\"days\" *ngFor=\"let day of month.days\">\n                            <button [class]=\"'days-btn ' + day.cssClass\"\n                                    *ngIf=\"day\"\n                                    [class.today]=\"day.isToday\"\n                                    (click)=\"onSelected(day)\"\n                                    [class.marked]=\"day.marked\"\n                                    [class.on-selected]=\"day.selected || _savedHistory?.from === day.time || _savedHistory?.to === day.time\"\n                                    [disabled]=\"day.disable\">\n                                <p>{{day.title}}</p>\n                                <small *ngIf=\"day.subTitle\">{{day?.subTitle}}</small>\n                            </button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n\n            <ion-infinite-scroll (ionInfinite)=\"nextMonth($event)\">\n                <ion-infinite-scroll-content></ion-infinite-scroll-content>\n            </ion-infinite-scroll>\n\n        </ion-content>\n    ",
                    styles: [
                        "\n            .calendar-page {\n                background-color: #fbfbfb;\n            }\n\n            .month-box{\n                display: inline-block;\n                padding-bottom: 1em;\n                border-bottom: 1px solid #f1f1f1;\n            }\n\n            .days-box {\n                padding: 0.5rem;\n            }\n\n            h4 {\n                font-weight: 400;\n                font-size: 1.8rem;\n                display: block;\n                text-align: center;\n                margin: 1rem 0 0;\n                color: #929292;\n            }\n            .days:nth-of-type(7n), .days:nth-of-type(7n+1) {\n                width: 15%;\n            }\n            .days {\n                width: 14%;\n                float: left;\n                text-align: center;\n                height: 40px;\n            }\n            .days .marked p{\n                color: rgb(59, 151, 247);\n                font-weight:500;\n            }\n\n            .days .today p {\n                border-bottom: 2px solid rgb(59, 151, 247);\n                padding-bottom: 2px;\n            }\n\n            .days .on-selected{\n                transition: background-color .3s;\n                background-color: rgb(201, 225, 250);\n                border: none;\n            }\n\n            .days .on-selected p{\n                color: rgb(59, 151, 247);\n                font-size: 1.3em;\n            }\n\n            button.days-btn {\n                border-radius: 50%;\n                width: 36px;\n                display: block;\n                margin: 0 auto;\n                height: 36px;\n                background-color: transparent;\n                position: relative;\n                z-index:2;\n            }\n\n            button.days-btn p {\n                margin:0;\n                font-size: 1.2em;\n                color: #333;\n            }\n\n            button.days-btn.on-selected small{\n                transition: bottom .3s;\n                bottom: -14px;\n            }\n            \n            button.days-btn small {\n                overflow: hidden;\n                display: block;\n                left: 0;\n                right: 0;\n                bottom: -5px;\n                position: absolute;\n                z-index:1;\n                text-align: center;\n                color: #3b97f7;\n                font-weight: 200;\n            }\n        "
                    ],
                    selector: 'calendar-page',
                },] },
    ];
    /** @nocollapse */
    CalendarComponent.ctorParameters = function () { return [
        { type: NavParams, },
        { type: ViewController, },
        { type: ChangeDetectorRef, },
        { type: Renderer, },
        { type: ElementRef, },
    ]; };
    CalendarComponent.propDecorators = {
        'content': [{ type: ViewChild, args: [Content,] },],
        'monthsEle': [{ type: ViewChild, args: ['months',] },],
    };
    return CalendarComponent;
}());
//# sourceMappingURL=calendar-component.js.map