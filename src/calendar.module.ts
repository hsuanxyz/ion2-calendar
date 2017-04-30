/**
 * Created by youyou on 16/12/4.
 */
import { NgModule, CUSTOM_ELEMENTS_SCHEMA }           from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendarController } from './calendar.controller';
import { CalendarPage } from './calendar';
import {IonicModule} from "ionic-angular";
import {CalendarWeekTitle} from "./components/week-title";

@NgModule({
  imports:      [  IonicModule, CommonModule ],
  declarations: [ CalendarPage, CalendarWeekTitle],
  providers:    [ CalendarController ],
  exports:[],
  entryComponents:    [ CalendarPage,  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class CalendarModule { }
