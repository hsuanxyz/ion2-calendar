import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';

import { ModalOptions, CalendarModalOptions } from './calendar.model';
import { CalendarModal } from './components/calendar.modal';
import { CalendarService } from './services/calendar.service';

@Injectable()
export class CalendarController {
  constructor(public modalCtrl: ModalController, public calSvc: CalendarService) {}

  /**
   * @deprecated
   * @param {CalendarModalOptions} calendarOptions
   * @param {ModalOptions} modalOptions
   * @returns {any}
   */
  openCalendar(calendarOptions: CalendarModalOptions, modalOptions: ModalOptions = {}): Promise<{}> {
    const options = this.calSvc.safeOpt(calendarOptions);

    return this.modalCtrl
      .create({
        component: CalendarModal,
        componentProps: {
          options,
        },
        ...modalOptions,
      })
      .then((calendarModal: HTMLIonModalElement) => {
        calendarModal.present();

        return calendarModal.onDidDismiss().then((event: OverlayEventDetail) => {
          return event.data ? Promise.resolve(event.data) : Promise.reject('cancelled');
        });
      });
  }
}
