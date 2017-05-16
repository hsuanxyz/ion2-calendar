import { Injectable } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { CalendarComponent } from "./components/calendar-component";
export var CalendarController = (function () {
    function CalendarController(modalCtrl) {
        this.modalCtrl = modalCtrl;
    }
    CalendarController.prototype.openCalendar = function (calendarOptions, modalOptions) {
        if (modalOptions === void 0) { modalOptions = {}; }
        var _arr = [];
        var _a = calendarOptions || {}, _b = _a.from, from = _b === void 0 ? new Date() : _b, _c = _a.to, to = _c === void 0 ? 0 : _c, _d = _a.cssClass, cssClass = _d === void 0 ? '' : _d, _e = _a.weekStartDay, weekStartDay = _e === void 0 ? 0 : _e, _f = _a.isRadio, isRadio = _f === void 0 ? true : _f, _g = _a.canBackwardsSelected, canBackwardsSelected = _g === void 0 ? false : _g, _h = _a.disableWeekdays, disableWeekdays = _h === void 0 ? _arr : _h, _j = _a.closeLabel, closeLabel = _j === void 0 ? 'cancel' : _j, _k = _a.id, id = _k === void 0 ? '' : _k, _l = _a.isSaveHistory, isSaveHistory = _l === void 0 ? false : _l, _m = _a.monthTitle, monthTitle = _m === void 0 ? 'MMM yyyy' : _m, _o = _a.title, title = _o === void 0 ? 'Calendar' : _o, _p = _a.weekdaysTitle, weekdaysTitle = _p === void 0 ? "Di_Lu_Ma_Me_Je_Ve_Sa".split("_") : _p, _q = _a.daysConfig, daysConfig = _q === void 0 ? _arr : _q, _r = _a.countNextMonths, countNextMonths = _r === void 0 ? 3 : _r, _s = _a.showYearPicker, showYearPicker = _s === void 0 ? false : _s;
        var options = {
            from: from,
            to: to,
            cssClass: cssClass,
            isRadio: isRadio,
            weekStartDay: weekStartDay,
            canBackwardsSelected: canBackwardsSelected,
            closeLabel: closeLabel,
            id: id,
            isSaveHistory: isSaveHistory,
            defaultDate: calendarOptions.defaultDate || from,
            disableWeekdays: disableWeekdays,
            monthTitle: monthTitle,
            title: title,
            weekdaysTitle: weekdaysTitle,
            daysConfig: daysConfig,
            countNextMonths: countNextMonths,
            showYearPicker: showYearPicker,
        };
        var calendarModal = this.modalCtrl.create(CalendarComponent, options, modalOptions);
        calendarModal.present();
        return new Promise(function (resolve, reject) {
            calendarModal.onWillDismiss(function (data) {
                if (data && ((data.from && data.to) || data.date)) {
                    resolve(data);
                }
                else {
                    reject('cancelled');
                }
            });
        });
    };
    CalendarController.prototype.setHistory = function (param) {
        localStorage.setItem("ion-calendar-" + param.id, JSON.stringify(param));
    };
    CalendarController.prototype.getHistory = function (id) {
        var _history = localStorage.getItem("ion-calendar-" + id);
        if (_history) {
            return JSON.parse(_history);
        }
    };
    CalendarController.prototype.removeHistory = function (id) {
        localStorage.removeItem("ion-calendar-" + id);
    };
    CalendarController.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    CalendarController.ctorParameters = function () { return [
        { type: ModalController, },
    ]; };
    return CalendarController;
}());
//# sourceMappingURL=calendar.controller.js.map