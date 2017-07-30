var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Created by youyou on 16/12/4.
 */
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarController } from './calendar.controller';
import { IonicModule } from "ionic-angular";
import { CalendarWeekComponent } from "./components/calendar-week.component";
import { CalendarModal } from "./components/calendar.modal";
import { MonthComponent } from "./components/month.component";
import { CalendarService } from "./services/calendar.service";
import { CalendarComponent } from './components/calendar.component';
var CalendarModule = (function () {
    function CalendarModule() {
    }
    return CalendarModule;
}());
CalendarModule = __decorate([
    NgModule({
        imports: [IonicModule, CommonModule],
        declarations: [CalendarModal, CalendarWeekComponent, MonthComponent, CalendarComponent],
        providers: [CalendarController, CalendarService],
        exports: [CalendarComponent],
        entryComponents: [CalendarModal],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
], CalendarModule);
export { CalendarModule };
//# sourceMappingURL=calendar.module.js.map