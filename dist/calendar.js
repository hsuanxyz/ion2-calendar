"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var moment = require("moment");
var ionic_angular_1 = require("ionic-angular");
var core_1 = require("@angular/core");
var CalendarMonth = (function () {
    function CalendarMonth() {
    }
    return CalendarMonth;
}());
exports.CalendarMonth = CalendarMonth;
var dayConfig = (function () {
    function dayConfig() {
    }
    return dayConfig;
}());
var CalendarOptions = (function () {
    function CalendarOptions() {
    }
    return CalendarOptions;
}());
var DateResults = (function () {
    function DateResults() {
    }
    return DateResults;
}());
var CalendarPage = CalendarPage_1 = (function () {
    function CalendarPage(params, viewCtrl) {
        this.params = params;
        this.viewCtrl = viewCtrl;
        this.dayTemp = [null, null];
        this.monthTitleFilterStr = '';
        this.weekdaysTitle = [];
        var startTime = moment(params.get('from')).valueOf();
        var endTime = moment(params.get('to')).valueOf();
        CalendarPage_1.options = {
            start: startTime,
            isRadio: params.get('isRadio'),
            range_beg: startTime,
            range_end: endTime,
            daysConfig: params.get('daysConfig'),
            disableWeekdays: params.get('disableWeekdays'),
            monthTitle: params.get('monthTitle'),
        };
        this.monthTitleFilterStr = params.get('monthTitle');
        this.weekdaysTitle = params.get('weekdaysTitle');
        this.title = params.get('title');
        this.closeLabel = params.get('closeLabel');
        this.calendarMonths = CalendarPage_1.createMonthsByPeriod(startTime, 3);
    }
    CalendarPage.prototype.dismiss = function () {
        this.toast.dismiss();
        var data = this.dayTemp;
        this.viewCtrl.dismiss({
            from: data[0],
            to: data[1],
        });
    };
    CalendarPage.prototype.onSelected = function (item) {
        item.selected = true;
        if (CalendarPage_1.options.isRadio) {
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
        var rangeEnd = CalendarPage_1.options.range_end ? moment(CalendarPage_1.options.range_end).subtract(1, 'M') : 0;
        if (len <= 0 || (rangeEnd !== 0 && moment(final.original.time).isAfter(rangeEnd))) {
            infiniteScroll.enable(false);
            return;
        }
        (_a = this.calendarMonths).push.apply(_a, CalendarPage_1.createMonthsByPeriod(nextTime, 1));
        infiniteScroll.complete();
        var _a;
    };
    ;
    CalendarPage.findDayConfig = function (day) {
        if (CalendarPage_1.options.daysConfig.length <= 0)
            return null;
        return CalendarPage_1.options.daysConfig.find(function (n) { return day.isSame(n.date, 'day'); });
    };
    CalendarPage.createOriginalCalendar = function (time) {
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
    CalendarPage.createCalendarDay = function (time) {
        var _time = moment(time);
        var dayConfig = CalendarPage_1.findDayConfig(_time);
        var _rangeBeg = CalendarPage_1.options.range_beg;
        var _rangeEnd = CalendarPage_1.options.range_end;
        var isBetween = true;
        var disableWee = CalendarPage_1.options.disableWeekdays.indexOf(_time.toDate().getDay()) !== -1;
        if (_rangeBeg > 0 && _rangeEnd > 0) {
            isBetween = !_time.isBetween(_rangeBeg, _rangeEnd, 'days', '[]');
        }
        else if (_rangeBeg > 0 && _rangeEnd === 0) {
            var _addTime = _time.add('day', 1);
            isBetween = !_addTime.isAfter(_rangeBeg);
        }
        var _disable = disableWee || isBetween;
        return {
            time: time,
            selected: false,
            marked: dayConfig ? dayConfig.marked || false : false,
            disable: dayConfig ? dayConfig.disable || _disable : _disable,
            title: dayConfig ? dayConfig.title || new Date(time).getDate().toString() : new Date(time).getDate().toString(),
            subTitle: dayConfig ? dayConfig.subTitle || '' : ''
        };
    };
    CalendarPage.createCalendarMonth = function (original) {
        var days = new Array(6).fill(null);
        var len = original.howManyDays;
        for (var i = original.firstWeek; i < len + original.firstWeek; i++) {
            var itemTime = new Date(original.year, original.month, i - original.firstWeek + 1).getTime();
            days[i] = CalendarPage_1.createCalendarDay(itemTime);
        }
        return {
            original: original,
            days: days
        };
    };
    CalendarPage.createMonthsByPeriod = function (startTime, monthsNum) {
        var _array = [];
        var _start = new Date(startTime);
        var _startMonth = new Date(_start.getFullYear(), _start.getMonth(), 1).getTime();
        for (var i = 0; i < monthsNum; i++) {
            var time = moment(_startMonth).add(i, 'M').valueOf();
            var originalCalendar = CalendarPage_1.createOriginalCalendar(time);
            _array.push(CalendarPage_1.createCalendarMonth(originalCalendar));
        }
        return _array;
    };
    return CalendarPage;
}());
CalendarPage = CalendarPage_1 = __decorate([
    core_1.Component({
        template: "\n<ion-header>\n  <ion-navbar>\n  \n   <ion-buttons start>\n       <button ion-button clear *ngIf=\"closeLabel !== ''\" (click)=\"dismiss()\">\n         {{closeLabel}}\n       </button>\n    </ion-buttons>\n  \n   \n    <ion-title>{{title}}</ion-title>\n  </ion-navbar>\n\n  <ion-toolbar no-border-top>\n    <ul class=\"week-title\">\n      <li *ngFor=\"let w of weekdaysTitle\">{{w}}</li>\n    </ul>\n  </ion-toolbar>\n\n</ion-header>\n\n<ion-content class=\"calendar-page\">\n\n\n  <div *ngFor=\"let month of calendarMonths\" class=\"month-box\">\n    <h4 class=\"text-center month-title\">{{month.original.date | date:monthTitleFilterStr}}</h4>\n    <div class=\"days-box\">\n      <div class=\"days\" *ngFor=\"let day of month.days\">\n        <button class=\"days-btn\"\n                *ngIf=\"day\"\n                (click)=\"onSelected(day)\"\n                [class.marked]=\"day.marked\"\n                [class.on-selected]=\"day.selected\"\n                [disabled]=\"day.disable\">\n          <p>{{day.title}}</p>\n          <em>{{day.subTitle}}</em>\n        </button>\n      </div>\n    </div>\n  </div>\n\n  <ion-infinite-scroll (ionInfinite)=\"nextMonth($event)\">\n    <ion-infinite-scroll-content></ion-infinite-scroll-content>\n  </ion-infinite-scroll>\n\n</ion-content>\n",
        selector: 'calendar-page',
        styles: [
            "\n  ul.week-title {\n  background-color: #eee;\n  padding:0;margin:0\n}\n\n.week-title li {\n  list-style-type:none;\n  display: block;\n  float: left;\n  width: 14%;\n  text-align: center;\n}\n\n.week-title li:nth-of-type(7n), .week-title li:nth-of-type(7n+1) {\n  width: 15%;\n}\n\n.calendar-page .month-box{\n    display: inline-block;\n    padding-bottom: 1em;\n    border-bottom: 2px solid #eee;\n  }\n.calendar-page h4 {\n    font-size: 2rem;\n    display: block;\n    text-align: center;\n    border-bottom: 2px solid #eee;\n    margin: 1rem 0;\n    padding-bottom: 1rem;\n  }\n.calendar-page .days:nth-of-type(7n), .days:nth-of-type(7n+1) {\n    width: 15%;\n  }\n.calendar-page .days {\n    width: 14%;\n    float: left;\n    text-align: center;\n    height: 40px;\n  }\n.calendar-page .days .marked{\n    color: #f90;\n  }\n\n.calendar-page .days .on-selected{\n background-color: #f90;\n    border-radius: 7px;\n}\n\n.calendar-page .days .on-selected p{\n  color: #fff;\n}\n.calendar-page .days .on-selected em{\n  color: #ffdfae;\n}\n.calendar-page button.days-btn {\n  width: 100%;\n    display: block;\n    margin: 0 auto;\n    height: 40px;\n    background-color: transparent;\n}\n\n.calendar-page button.days-btn p {\n margin:0;\n      font-size: 1.2em;\n}\n.calendar-page button.days-btn em {\nmargin-top: 2px;\n      font-size: 1em;\n      color: #797979;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      display: -webkit-box;\n      -webkit-line-clamp: 2;\n      -webkit-box-orient: vertical;\n}\n  \n"
        ]
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof ionic_angular_1.NavParams !== "undefined" && ionic_angular_1.NavParams) === "function" && _a || Object, typeof (_b = typeof ionic_angular_1.ViewController !== "undefined" && ionic_angular_1.ViewController) === "function" && _b || Object])
], CalendarPage);
exports.CalendarPage = CalendarPage;
var CalendarPage_1, _a, _b;
//# sourceMappingURL=calendar.js.map