/**
 * Created by youyou on 16/12/4.
 */
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendarController } from './calendar.controller';
import { IonicModule, ModalController } from 'ionic-angular';
import { CalendarWeekComponent } from "./components/calendar-week.component";
import { CalendarModal } from "./components/calendar.modal";
import { MonthComponent } from "./components/month.component";
import { CalendarService } from "./services/calendar.service";
import { CalendarComponent } from './components/calendar.component';


export function calendarController (
  modalCtrl: ModalController,
  calSvc: CalendarService,
) {
  return new CalendarController(modalCtrl, calSvc);
}

@NgModule({
  imports: [IonicModule, CommonModule],
  declarations: [CalendarModal, CalendarWeekComponent, MonthComponent, CalendarComponent],
  providers: [ {
    provide: CalendarController,
    useFactory: calendarController,
    deps: [ModalController, CalendarService],
  }, CalendarService],
  exports:[CalendarComponent],
  entryComponents: [CalendarModal],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CalendarModule { }

