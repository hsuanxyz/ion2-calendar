import { CalendarModule } from '../ion2-calendar'

import { NgModule } from '@angular/core';
import { DemoModalBasicComponent } from './demo-modal-basic';
import { IonicModule } from "ionic-angular";
import { MyApp } from "../app/app.component";
import { DemoModalMultiComponent } from "./demo-modal-multi";
import { DemoModalRangeComponent } from "./demo-modal-range";
import { DemoModalDisableWeekComponent } from "./demo-modal-disable-week";
import { DemoModalLocaleComponent } from "./demo-modal-locale";
import { DemoModalCustomStyleComponent } from "./demo-modal-custom-style";
import { DemoModalDefaultScrollComponent } from "./demo-modal-default-scroll";
import { DemoModalConfigDaysComponent } from "./demo-modal-config-days";
import { DemoBasicComponent } from "./demo-basic";
import { DemoMultiComponent } from "./demo-multi";
import { DemoRangeComponent } from "./demo-range";
import { DemoOptionsComponent } from "./demo-options";
import { DemoEventsComponent } from "./demo-events";
import { DemoMethodsComponent } from "./demo-methods";
import { DemoModalRangeBackwardsComponent } from './demo-modal-range-backwards';
import { DemoModalScrollToDateComponent } from './demo-modal-scroll-to-date';
import { DemoModalCustomSubHeaderComponent } from './demo-modal-custom-sub-header';
import { SubHeaderCalendarModal } from './sub-header-calendar-modal';


const COMPONENTS = [
  DemoModalBasicComponent,
  DemoModalMultiComponent,
  DemoModalRangeComponent,
  DemoModalCustomSubHeaderComponent,
  SubHeaderCalendarModal,
  DemoModalDisableWeekComponent,
  DemoModalLocaleComponent,
  DemoModalCustomStyleComponent,
  DemoModalDefaultScrollComponent,
  DemoModalConfigDaysComponent,
  DemoBasicComponent,
  DemoMultiComponent,
  DemoRangeComponent,
  DemoOptionsComponent,
  DemoEventsComponent,
  DemoMethodsComponent,
  DemoModalRangeBackwardsComponent,
  DemoModalScrollToDateComponent
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [IonicModule.forRoot(MyApp), CalendarModule],
  exports: [...COMPONENTS],
  entryComponents: [...COMPONENTS],
})
export class DemosModule {
}
