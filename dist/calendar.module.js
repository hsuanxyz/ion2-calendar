import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CalendarController } from './calendar.controller';
import { IonicModule, ModalController } from 'ionic-angular';
import { CalendarService } from "./services/calendar.service";
import { CALENDAR_COMPONENTS } from "./components/index";
export function calendarController(modalCtrl, calSvc) {
    return new CalendarController(modalCtrl, calSvc);
}
var CalendarModule = /** @class */ (function () {
    function CalendarModule() {
    }
    CalendarModule.decorators = [
        { type: NgModule, args: [{
                    imports: [IonicModule],
                    declarations: CALENDAR_COMPONENTS,
                    exports: CALENDAR_COMPONENTS,
                    entryComponents: CALENDAR_COMPONENTS,
                    providers: [{
                            provide: CalendarController,
                            useFactory: calendarController,
                            deps: [ModalController, CalendarService],
                        }, CalendarService],
                    schemas: [CUSTOM_ELEMENTS_SCHEMA],
                },] },
    ];
    /** @nocollapse */
    CalendarModule.ctorParameters = function () { return []; };
    return CalendarModule;
}());
export { CalendarModule };
//# sourceMappingURL=calendar.module.js.map