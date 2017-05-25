import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarController } from './calendar.controller';
import { IonicModule } from "ionic-angular";
import { CalendarWeekComponent } from "./components/calendar-week-component";
import { CalendarComponent } from "./components/calendar-component";
import { MonthComponent } from "./components/month-component";
export var CalendarModule = (function () {
    function CalendarModule() {
    }
    CalendarModule.decorators = [
        { type: NgModule, args: [{
                    imports: [IonicModule, CommonModule],
                    declarations: [CalendarComponent, CalendarWeekComponent, MonthComponent],
                    providers: [CalendarController],
                    exports: [],
                    entryComponents: [CalendarComponent,],
                    schemas: [
                        CUSTOM_ELEMENTS_SCHEMA
                    ]
                },] },
    ];
    /** @nocollapse */
    CalendarModule.ctorParameters = function () { return []; };
    return CalendarModule;
}());
//# sourceMappingURL=calendar.module.js.map