import { Component, ViewChild, ElementRef, ChangeDetectorRef, Renderer } from '@angular/core';
import { NavParams, ViewController, Content } from 'ionic-angular';
import * as moment from 'moment';
export var CalendarPage = (function () {
    function CalendarPage(params, viewCtrl, ref, _renderer, _elementRef) {
        this.params = params;
        this.viewCtrl = viewCtrl;
        this.ref = ref;
        this._renderer = _renderer;
        this._elementRef = _elementRef;
        this.dayTemp = [null, null];
        this.monthTitleFilterStr = '';
        this.weekdaysTitle = [];
        this._s = true;
        this.weekStartDay = 0;
        this.findCssClass();
        this.init();
    }
    CalendarPage.prototype.ionViewDidLoad = function () {
        this.scrollToDefaultDate();
        if (this.content.enableScrollListener && this.scrollBackwards) {
            this.content.enableScrollListener();
        }
    };
    CalendarPage.prototype.init = function () {
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
        this.monthTitleFilterStr = params.get('monthTitle');
        this.weekdaysTitle = params.get('weekdaysTitle');
        this.title = params.get('title');
        this.closeLabel = params.get('closeLabel');
        this.calendarMonths = this.createMonthsByPeriod(startTime, this.findInitMonthNumber(this.defaultDate) + 3);
    };
    CalendarPage.prototype.findCssClass = function () {
        var _this = this;
        var cssClass = this.params.get('cssClass');
        if (cssClass) {
            cssClass.split(' ').forEach(function (cssClass) {
                if (cssClass.trim() !== '')
                    _this._renderer.setElementClass(_this._elementRef.nativeElement, cssClass, true);
            });
        }
    };
    CalendarPage.prototype.dismiss = function () {
        var data = this.dayTemp;
        this.viewCtrl.dismiss({
            from: data[0],
            to: data[1],
        });
    };
    CalendarPage.prototype.onSelected = function (item) {
        item.selected = true;
        this.ref.detectChanges();
        if (this.options.isRadio) {
            this.viewCtrl.dismiss({
                date: Object.assign({}, item)
            });
            return;
        }
        if (!this.dayTemp[0]) {
            this.dayTemp[0] = item;
        }
        else if (!this.dayTemp[1]) {
            if (this.dayTemp[0].time < item.time) {
                this.dayTemp[1] = item;
            }
            else {
                this.dayTemp[1] = this.dayTemp[0];
                this.dayTemp[0] = item;
            }
            this.dismiss();
        }
        else {
            this.dayTemp[0].selected = false;
            this.dayTemp[0] = item;
            this.dayTemp[1].selected = false;
            this.dayTemp[1] = null;
        }
    };
    CalendarPage.prototype.nextMonth = function (infiniteScroll) {
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
    CalendarPage.prototype.backwardsMonth = function () {
        var first = this.calendarMonths[0];
        var firstTime = moment(first.original.time).subtract(1, 'M').valueOf();
        (_a = this.calendarMonths).unshift.apply(_a, this.createMonthsByPeriod(firstTime, 1));
        var _a;
    };
    CalendarPage.prototype.scrollToDefaultDate = function () {
        var _this = this;
        var defaultDateIndex = this.findInitMonthNumber(this.defaultDate);
        var defaultDateMonth = this.monthsEle.nativeElement.children[("month-" + defaultDateIndex)].offsetTop;
        if (defaultDateIndex === 0 || defaultDateMonth === 0)
            return;
        setTimeout(function () {
            _this.content.scrollTo(0, defaultDateMonth, 128);
        }, 300);
    };
    CalendarPage.prototype.onScroll = function ($event) {
        var _this = this;
        if (!this.scrollBackwards)
            return;
        if ($event.scrollTop <= 300 && this._s) {
            this._s = !1;
            this.backwardsMonth();
            this.ref.detectChanges();
            setTimeout(function () {
                _this._s = !0;
            }, 300);
        }
    };
    CalendarPage.prototype.findDayConfig = function (day) {
        if (this.options.daysConfig.length <= 0)
            return null;
        return this.options.daysConfig.find(function (n) { return day.isSame(n.date, 'day'); });
    };
    CalendarPage.prototype.createOriginalCalendar = function (time) {
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
    CalendarPage.prototype.createCalendarDay = function (time) {
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
    CalendarPage.prototype.createCalendarMonth = function (original) {
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
    CalendarPage.prototype.createMonthsByPeriod = function (startTime, monthsNum) {
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
    CalendarPage.prototype.findInitMonthNumber = function (date) {
        var startDate = moment(this.options.start);
        var defaultDate = moment(date);
        var isAfter = defaultDate.isAfter(startDate);
        if (!isAfter)
            return 0;
        return defaultDate.diff(startDate, 'month');
    };
    CalendarPage.decorators = [
        { type: Component, args: [{
                    template: "\n        <ion-header>\n            <ion-navbar>\n\n                <ion-buttons start>\n                    <button ion-button clear *ngIf=\"closeLabel !== ''\" (click)=\"dismiss()\">\n                        {{closeLabel}}\n                    </button>\n                </ion-buttons>\n\n\n                <ion-title>{{title}}</ion-title>\n            </ion-navbar>\n\n            <ion-toolbar no-border-top>\n                <calendar-week-title [weekArray]=\"weekdaysTitle\"\n                                     [weekStart]=\"weekStartDay\">\n                </calendar-week-title>\n            </ion-toolbar>\n\n        </ion-header>\n\n        <ion-content (ionScroll)=\"onScroll($event)\" class=\"calendar-page\">\n\n\n            <div #months>\n                <div *ngFor=\"let month of calendarMonths;let i = index;\" class=\"month-box\"  [attr.id]=\"'month-' + i\">\n                    <h4 class=\"text-center month-title\">{{month.original.date | date:monthTitleFilterStr}}</h4>\n                    <div class=\"days-box\">\n                        <div class=\"days\" *ngFor=\"let day of month.days\">\n                            <button [class]=\"'days-btn ' + day.cssClass\"\n                                    *ngIf=\"day\"\n                                    [class.today]=\"day.isToday\"\n                                    (click)=\"onSelected(day)\"\n                                    [class.marked]=\"day.marked\"\n                                    [class.on-selected]=\"day.selected\"\n                                    [disabled]=\"day.disable\">\n                                <p>{{day.title}}</p>\n                                <em>{{day.subTitle}}</em>\n                            </button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n\n            <ion-infinite-scroll (ionInfinite)=\"nextMonth($event)\">\n                <ion-infinite-scroll-content></ion-infinite-scroll-content>\n            </ion-infinite-scroll>\n\n        </ion-content>\n    ",
                    selector: 'calendar-page',
                    styles: [
                        "\n            ul.week-title {\n                background-color: #eee;\n                padding:0;margin:0\n            }\n\n            .week-title li {\n                list-style-type:none;\n                display: block;\n                float: left;\n                width: 14%;\n                text-align: center;\n            }\n\n            .week-title li:nth-of-type(7n), .week-title li:nth-of-type(7n+1) {\n                width: 15%;\n            }\n\n            .calendar-page {\n                background-color: #fff;\n            }\n\n            .month-box{\n                display: inline-block;\n                padding-bottom: 1em;\n                border-bottom: 2px solid #eee;\n            }\n\n            .days-box {\n                padding: 0.5rem;\n            }\n\n            h4 {\n                font-size: 2rem;\n                display: block;\n                text-align: center;\n                border-bottom: 2px solid #eee;\n                margin: 1rem 0;\n                padding-bottom: 1rem;\n            }\n            .days:nth-of-type(7n), .days:nth-of-type(7n+1) {\n                width: 15%;\n            }\n            .days {\n                width: 14%;\n                float: left;\n                text-align: center;\n                height: 40px;\n            }\n            .days .marked{\n                color: #f90;\n            }\n\n            .days .today{\n                border-radius: 50px;\n                border: 1px solid #f90;\n            }\n\n            .days .on-selected{\n                background-color: #f90;\n                border-radius: 7px;\n                border: none;\n            }\n\n            .days .on-selected p{\n                color: #fff;\n            }\n            .days .on-selected em{\n                color: #ffdfae;\n            }\n            button.days-btn {\n                width: 100%;\n                display: block;\n                margin: 0 auto;\n                height: 40px;\n                background-color: transparent;\n            }\n\n            button.days-btn p {\n                margin:0;\n                font-size: 1.2em;\n            }\n            button.days-btn em {\n                margin-top: 2px;\n                font-size: 1em;\n                color: #797979;\n                overflow: hidden;\n                text-overflow: ellipsis;\n                display: -webkit-box;\n                -webkit-line-clamp: 2;\n                -webkit-box-orient: vertical;\n            }\n        "]
                },] },
    ];
    /** @nocollapse */
    CalendarPage.ctorParameters = function () { return [
        { type: NavParams, },
        { type: ViewController, },
        { type: ChangeDetectorRef, },
        { type: Renderer, },
        { type: ElementRef, },
    ]; };
    CalendarPage.propDecorators = {
        'content': [{ type: ViewChild, args: [Content,] },],
        'monthsEle': [{ type: ViewChild, args: ['months',] },],
    };
    return CalendarPage;
}());
//# sourceMappingURL=calendar.js.map