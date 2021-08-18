import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CalendarModule } from '../ion2-calendar';
import { CommonModule } from '@angular/common';

import { DemoModalBasicComponent } from './demo-modal-basic';
import { DemoModalMultiComponent } from './demo-modal-multi';
import { DemoModalRangeComponent } from './demo-modal-range';
import { DemoModalDisableWeekComponent } from './demo-modal-disable-week';
import { DemoModalLocaleComponent } from './demo-modal-locale';
import { DemoModalCustomStyleComponent } from './demo-modal-custom-style';
import { DemoModalDefaultScrollComponent } from './demo-modal-default-scroll';
import { DemoModalConfigDaysComponent } from './demo-modal-config-days';
import { DemoBasicComponent } from './demo-basic';
import { FormsModule } from '@angular/forms';
import { DemoMultiComponent } from './demo-multi';
import { DemoRangeComponent } from './demo-range';
import { DemoOptionsComponent } from './demo-options';
import { DemoEventsComponent } from './demo-events';
import { DemoMethodsComponent } from './demo-methods';
import { DemoModalRangeBackwardsComponent } from './demo-modal-range-backwards';
import { DemoModalCustomSubHeaderComponent } from './demo-modal-custom-sub-header';
import { SubHeaderCalendarModal } from './sub-header-calendar-modal';
import { DemoModalRangeWithDefaultEndDate } from './demo-modal-range-with-default-end-date';
import { DemoModalMultiMaxComponent } from './demo-modal-multi-max';

const COMPONENTS = [
  DemoModalBasicComponent,
  DemoModalMultiComponent,
  DemoModalMultiMaxComponent,
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
  DemoModalRangeWithDefaultEndDate,
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [CommonModule, IonicModule, FormsModule, CalendarModule],
  exports: [...COMPONENTS],
  entryComponents: [...COMPONENTS],
})
export class DemosModule {}
