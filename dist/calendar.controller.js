import { Injectable } from '@angular/core';
import { CalendarPage } from './calendar';
import { ModalController } from 'ionic-angular';
export var CalendarController = (function () {
    function CalendarController(modalCtrl) {
        this.modalCtrl = modalCtrl;
    }
    CalendarController.prototype.openCalendar = function (calendarOptions, modalOptions) {
        if (modalOptions === void 0) { modalOptions = {}; }
        var _arr = [];
        var _a = calendarOptions || {}, _b = _a.from, from = _b === void 0 ? new Date() : _b, _c = _a.to, to = _c === void 0 ? 0 : _c, _d = _a.cssClass, cssClass = _d === void 0 ? '' : _d, _e = _a.isRadio, isRadio = _e === void 0 ? true : _e, _f = _a.canBackwardsSelected, canBackwardsSelected = _f === void 0 ? false : _f, _g = _a.disableWeekdays, disableWeekdays = _g === void 0 ? _arr : _g, _h = _a.closeLabel, closeLabel = _h === void 0 ? 'cancel' : _h, _j = _a.monthTitle, monthTitle = _j === void 0 ? 'MMM yyyy' : _j, _k = _a.title, title = _k === void 0 ? 'Calendar' : _k, _l = _a.weekdaysTitle, weekdaysTitle = _l === void 0 ? "Di_Lu_Ma_Me_Je_Ve_Sa".split("_") : _l, _m = _a.daysConfig, daysConfig = _m === void 0 ? _arr : _m;
        var options = {
            from: from,
            to: to,
            cssClass: cssClass,
            isRadio: isRadio,
            canBackwardsSelected: canBackwardsSelected,
            closeLabel: closeLabel,
            defaultDate: calendarOptions.defaultDate || from,
            disableWeekdays: disableWeekdays,
            monthTitle: monthTitle,
            title: title,
            weekdaysTitle: weekdaysTitle,
            daysConfig: daysConfig
        };
        var calendarModal = this.modalCtrl.create(CalendarPage, options, modalOptions);
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