var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@angular/core';
import { CalendarModal } from "./components/calendar.modal";
var CalendarController = (function () {
    function CalendarController(modalCtrl, calSvc) {
        this.modalCtrl = modalCtrl;
        this.calSvc = calSvc;
    }
    CalendarController.prototype.openCalendar = function (calendarOptions, modalOptions) {
        if (modalOptions === void 0) { modalOptions = {}; }
        var options = this.calSvc.safeOpt(calendarOptions);
        var calendarModal = this.modalCtrl.create(CalendarModal, Object.assign({
            options: options,
        }, options), modalOptions);
        calendarModal.present();
        return new Promise(function (resolve, reject) {
            calendarModal.onDidDismiss(function (data) {
                var result = {};
                if (data && Array.isArray(data)) {
                    if (options.isRadio) {
                        result.date = data[0];
                    }
                    else {
                        result.from = data[0];
                        result.to = data[1];
                    }
                    resolve(result);
                }
                else {
                    reject('cancelled');
                }
            });
        });
    };
    CalendarController.prototype.setHistory = function (param) {
        localStorage.setItem("ion-calendar-" + param.id, JSON.stringify(param.date));
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
    return CalendarController;
}());
CalendarController = __decorate([
    Injectable()
], CalendarController);
export { CalendarController };
//# sourceMappingURL=calendar.controller.js.map