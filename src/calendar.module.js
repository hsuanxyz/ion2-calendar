"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Created by youyou on 16/12/4.
 */
var core_1 = require('@angular/core');
var common_1 = require('@angular/common');
var calendar_controller_1 = require('./calendar.controller');
var calendar_1 = require('./calendar');
var ionic_angular_1 = require("ionic-angular");
var CalendarModule = (function () {
    function CalendarModule() {
    }
    CalendarModule = __decorate([
        core_1.NgModule({
            imports: [ionic_angular_1.IonicModule, common_1.CommonModule],
            declarations: [calendar_1.CalendarPage],
            providers: [calendar_controller_1.CalendarController],
            exports: [],
            entryComponents: [calendar_1.CalendarPage],
            schemas: [
                core_1.CUSTOM_ELEMENTS_SCHEMA
            ]
        })
    ], CalendarModule);
    return CalendarModule;
}());
exports.CalendarModule = CalendarModule;
