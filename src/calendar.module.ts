/**
 * Created by youyou on 16/12/4.
 */
import { NgModule, CUSTOM_ELEMENTS_SCHEMA }           from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendarController } from './calendar.controller';
import { IonicModule } from "ionic-angular";
import { CalendarWeekComponent } from "./components/calendar-week.component";
import { CalendarModal } from "./components/calendar.modal";
import { MonthComponent } from "./components/month.component";
import { CalendarService } from "./services/calendar.service";

@NgModule({
  imports: [IonicModule, CommonModule],
  declarations: [CalendarModal, CalendarWeekComponent, MonthComponent],
  providers: [CalendarController, CalendarService],
  exports:[],
  entryComponents: [CalendarModal],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CalendarModule { }
