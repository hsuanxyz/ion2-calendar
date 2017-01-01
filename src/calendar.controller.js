"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
var calendar_1 = require('./calendar');
// interface CalendarOptions {
//   from?:Date,
//   to?:Date|number,
//   isRadio?:boolean;
//   disableWeekdays?:Array<number>,
//   weekdaysTitle?:Array<string>,
//   monthTitle?:string;
//   title?:string;
//   daysConfig?:Array<{
//     date:Date;
//     marked?:boolean;
//     title?:string;
//     subTitle?:string;
//   }>
// }
var CalendarController = (function () {
    function CalendarController(modalCtrl) {
        this.modalCtrl = modalCtrl;
    }
    CalendarController.prototype.openCalendar = function (calendarOptions) {
        var _a = calendarOptions || {}, _b = _a.from, from = _b === void 0 ? new Date() : _b, _c = _a.to, to = _c === void 0 ? 0 : _c, _d = _a.isRadio, isRadio = _d === void 0 ? true : _d, _e = _a.disableWeekdays, disableWeekdays = _e === void 0 ? [] : _e, _f = _a.closeLabel, closeLabel = _f === void 0 ? 'cancel' : _f, _g = _a.monthTitle, monthTitle = _g === void 0 ? 'MMM yyyy' : _g, _h = _a.title, title = _h === void 0 ? 'Calendar' : _h, _j = _a.weekdaysTitle, weekdaysTitle = _j === void 0 ? "Di_Lu_Ma_Me_Je_Ve_Sa".split("_") : _j, _k = _a.daysConfig, daysConfig = _k === void 0 ? [] : _k;
        var options = {
            from: from,
            to: to,
            isRadio: isRadio,
            closeLabel: closeLabel,
            disableWeekdays: disableWeekdays,
            monthTitle: monthTitle,
            title: title,
            weekdaysTitle: weekdaysTitle,
            daysConfig: daysConfig
        };
        var calendarModal = this.modalCtrl.create(calendar_1.CalendarPage, options);
        calendarModal.present();
        return new Promise(function (resolve, reject) {
            calendarModal.onDidDismiss(function (data) {
                if ((data.from && data.to) || data.date) {
                    resolve(data);
                }
                else {
                    reject('cancelled');
                }
            });
        });
    };
    CalendarController = __decorate([
        core_1.Injectable()
    ], CalendarController);
    return CalendarController;
}());
exports.CalendarController = CalendarController;
