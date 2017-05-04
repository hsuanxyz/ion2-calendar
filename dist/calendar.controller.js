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
        var _a = calendarOptions || {}, _b = _a.from, from = _b === void 0 ? new Date() : _b, _c = _a.to, to = _c === void 0 ? 0 : _c, _d = _a.cssClass, cssClass = _d === void 0 ? '' : _d, _e = _a.weekStartDay, weekStartDay = _e === void 0 ? 0 : _e, _f = _a.isRadio, isRadio = _f === void 0 ? true : _f, _g = _a.canBackwardsSelected, canBackwardsSelected = _g === void 0 ? false : _g, _h = _a.disableWeekdays, disableWeekdays = _h === void 0 ? _arr : _h, _j = _a.closeLabel, closeLabel = _j === void 0 ? 'cancel' : _j, _k = _a.id, id = _k === void 0 ? 0 : _k, _l = _a.monthTitle, monthTitle = _l === void 0 ? 'MMM yyyy' : _l, _m = _a.title, title = _m === void 0 ? 'Calendar' : _m, _o = _a.weekdaysTitle, weekdaysTitle = _o === void 0 ? "Di_Lu_Ma_Me_Je_Ve_Sa".split("_") : _o, _p = _a.daysConfig, daysConfig = _p === void 0 ? _arr : _p;
        var options = {
            from: from,
            to: to,
            cssClass: cssClass,
            isRadio: isRadio,
            weekStartDay: weekStartDay,
            canBackwardsSelected: canBackwardsSelected,
            closeLabel: closeLabel,
            id: id,
            defaultDate: calendarOptions.defaultDate || from,
            disableWeekdays: disableWeekdays,
            monthTitle: monthTitle,
            title: title,
            weekdaysTitle: weekdaysTitle,
            daysConfig: daysConfig
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