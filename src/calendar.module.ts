/**
 * Created by youyou on 16/12/4.
 */
import { NgModule, CUSTOM_ELEMENTS_SCHEMA }           from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendarController } from './calendar.controller';
import {IonicModule} from "ionic-angular";
import {CalendarWeekComponent} from "./components/calendar-week-component";
import {CalendarComponent} from "./components/calendar-component";

@NgModule({
  imports:      [  IonicModule, CommonModule ],
  declarations: [ CalendarComponent, CalendarWeekComponent],
  providers:    [ CalendarController ],
  exports:[],
  entryComponents:    [ CalendarComponent,  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class CalendarModule { }
