import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LazyLoadPage } from './lazy-load';
import { CalendarModule, CALENDAR_COMPONENTS } from '../../components/ion2-calendar'


@NgModule({
  declarations: [
    LazyLoadPage,
  ],
  imports: [
    IonicPageModule.forChild(LazyLoadPage)]
})
export class LazyLoadPageModule {}
