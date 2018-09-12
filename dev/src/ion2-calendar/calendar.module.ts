import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './services/calendar.service';
import { CALENDAR_COMPONENTS } from './components/index';

export function calendarController(modalCtrl: ModalController, calSvc: CalendarService) {
  return new CalendarController(modalCtrl, calSvc);
}

@NgModule({
  imports: [CommonModule, IonicModule, FormsModule],
  declarations: CALENDAR_COMPONENTS,
  exports: CALENDAR_COMPONENTS,
  entryComponents: CALENDAR_COMPONENTS,
  providers: [
    CalendarService,
    {
      provide: CalendarController,
      useFactory: calendarController,
      deps: [ModalController, CalendarService],
    },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CalendarModule {}
