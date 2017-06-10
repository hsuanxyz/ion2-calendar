/**
 * Created by hsuanlee on 27/05/2017.
 */
import { Injectable } from '@angular/core';
import * as moment from 'moment';
var CalendarService = (function () {
    function CalendarService() {
    }
    CalendarService.prototype.createOriginalCalendar = function (time) {
        var date = new Date(time);
        var year = date.getFullYear();
        var month = date.getMonth();
        var firstWeek = new Date(year, month, 1).getDay();
        var howManyDays = moment(time).daysInMonth();
        return {
            time: time,
            date: new Date(time),
            year: year,
            month: month,
            firstWeek: firstWeek,
            howManyDays: howManyDays,
        };
    };
    CalendarService.prototype.findDayConfig = function (day, opt) {
        if (opt.daysConfig.length <= 0)
            return null;
        return opt.daysConfig.find(function (n) { return day.isSame(n.date, 'day'); });
    };
    CalendarService.prototype.createCalendarDay = function (time, opt) {
        var _time = moment(time);
        var isToday = moment().isSame(_time, 'days');
        var dayConfig = this.findDayConfig(_time, opt);
        var _rangeBeg = moment(opt.from).valueOf();
        var _rangeEnd = moment(opt.to).valueOf();
        var isBetween = true;
        var disableWee = opt.disableWeekdays.indexOf(_time.toDate().getDay()) !== -1;
        if (_rangeBeg > 0 && _rangeEnd > 0) {
            if (!opt.canBackwardsSelected) {
                isBetween = !_time.isBetween(_rangeBeg, _rangeEnd, 'days', '[]');
            }
            else {
                isBetween = moment(_time).isBefore(_rangeBeg) ? false : isBetween;
            }
        }
        else if (_rangeBeg > 0 && _rangeEnd === 0) {
            if (!opt.canBackwardsSelected) {
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
            subTitle: dayConfig ? dayConfig.subTitle || '' : '',
        };
    };
    CalendarService.prototype.createCalendarMonth = function (original, opt) {
        var days = new Array(6).fill(null);
        var len = original.howManyDays;
        for (var i = original.firstWeek; i < len + original.firstWeek; i++) {
            var itemTime = new Date(original.year, original.month, i - original.firstWeek + 1).getTime();
            days[i] = this.createCalendarDay(itemTime, opt);
        }
        var weekStartDay = opt.weekStartDay;
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
            days: days,
        };
    };
    CalendarService.prototype.createMonthsByPeriod = function (startTime, monthsNum, opt) {
        var _array = [];
        var _start = new Date(startTime);
        var _startMonth = new Date(_start.getFullYear(), _start.getMonth(), 1).getTime();
        for (var i = 0; i < monthsNum; i++) {
            var time = moment(_startMonth).add(i, 'M').valueOf();
            var originalCalendar = this.createOriginalCalendar(time);
            _array.push(this.createCalendarMonth(originalCalendar, opt));
        }
        return _array;
    };
    CalendarService.prototype.getHistory = function (id) {
        var _savedDatesCache = localStorage.getItem("ion-calendar-" + id);
        var _savedDates;
        if (_savedDatesCache === 'undefined' || _savedDatesCache === 'null' || !_savedDatesCache) {
            _savedDates = [null, null];
        }
        else {
            _savedDates = JSON.parse(_savedDatesCache);
        }
        return _savedDates;
    };
    CalendarService.prototype.savedHistory = function (savedDates, id) {
        localStorage.setItem("ion-calendar-" + id, JSON.stringify(savedDates));
    };
    return CalendarService;
}());
export { CalendarService };
CalendarService.decorators = [
    { type: Injectable },
];
/** @nocollapse */
CalendarService.ctorParameters = function () { return []; };
//# sourceMappingURL=calendar.service.js.map