import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarController } from './calendar.controller';
import { CalendarPage } from './calendar';
import { IonicModule } from "ionic-angular";
export var CalendarModule = (function () {
    function CalendarModule() {
    }
    CalendarModule.decorators = [
        { type: NgModule, args: [{
                    imports: [IonicModule, CommonModule],
                    declarations: [CalendarPage],
                    providers: [CalendarController],
                    exports: [],
                    entryComponents: [CalendarPage],
                    schemas: [
                        CUSTOM_ELEMENTS_SCHEMA
                    ]
                },] },
    ];
    /** @nocollapse */
    CalendarModule.ctorParameters = [];
    return CalendarModule;
}());
//# sourceMappingURL=calendar.module.js.map