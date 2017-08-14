/**
 * Created by hsuanlee on 27/05/2017.
 */
import { Injectable } from '@angular/core';
import * as moment from 'moment';
var CalendarService = (function () {
    function CalendarService() {
    }
    CalendarService.prototype.safeOpt = function (calendarOptions) {
        var _a = calendarOptions || {}, _b = _a.autoDone, autoDone = _b === void 0 ? false : _b, _c = _a.from, from = _c === void 0 ? new Date() : _c, _d = _a.to, to = _d === void 0 ? 0 : _d, _e = _a.cssClass, cssClass = _e === void 0 ? '' : _e, _f = _a.weekStart, weekStart = _f === void 0 ? 0 : _f, _g = _a.canBackwardsSelected, canBackwardsSelected = _g === void 0 ? false : _g, _h = _a.disableWeeks, disableWeeks = _h === void 0 ? [] : _h, _j = _a.closeLabel, closeLabel = _j === void 0 ? 'CANCEL' : _j, _k = _a.closeIcon, closeIcon = _k === void 0 ? false : _k, _l = _a.doneLabel, doneLabel = _l === void 0 ? 'DONE' : _l, _m = _a.doneIcon, doneIcon = _m === void 0 ? false : _m, _o = _a.id, id = _o === void 0 ? '' : _o, _p = _a.pickMode, pickMode = _p === void 0 ? 'single' : _p, _q = _a.color, color = _q === void 0 ? 'primary' : _q, _r = _a.isSaveHistory, isSaveHistory = _r === void 0 ? false : _r, _s = _a.monthFormat, monthFormat = _s === void 0 ? 'MMM yyyy' : _s, _t = _a.title, title = _t === void 0 ? 'CALENDAR' : _t, _u = _a.weekdays, weekdays = _u === void 0 ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : _u, _v = _a.daysConfig, daysConfig = _v === void 0 ? [] : _v, _w = _a.countNextMonths, countNextMonths = _w === void 0 ? 3 : _w, _x = _a.showYearPicker, showYearPicker = _x === void 0 ? false : _x;
        return {
            autoDone: autoDone,
            from: from,
            to: to,
            cssClass: cssClass,
            weekStart: weekStart,
            canBackwardsSelected: canBackwardsSelected,
            closeLabel: closeLabel,
            closeIcon: closeIcon,
            doneLabel: doneLabel,
            doneIcon: doneIcon,
            id: id,
            pickMode: pickMode,
            color: color,
            isSaveHistory: isSaveHistory,
            defaultDate: calendarOptions.defaultDate || from,
            disableWeeks: disableWeeks,
            monthFormat: monthFormat,
            title: title,
            weekdays: weekdays,
            daysConfig: daysConfig,
            countNextMonths: countNextMonths,
            showYearPicker: showYearPicker,
        };
    };
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
        var disableWee = opt.disableWeeks.indexOf(_time.toDate().getDay()) !== -1;
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
                var _addTime = _time.add(1, 'day');
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
            disable: dayConfig ? dayConfig.disable && _disable : _disable,
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
        var weekStart = opt.weekStart;
        if (weekStart === 1) {
            if (days[0] === null) {
                days.shift();
                days.push(null);
            }
            else {
                days.unshift.apply(days, new Array(6).fill(null));
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