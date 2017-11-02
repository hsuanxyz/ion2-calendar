import { Injectable } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { ModalOptions, CalendarModalOptions } from './calendar.model'
import { CalendarModal } from "./components/calendar.modal";
import { CalendarService } from './services/calendar.service';

@Injectable()
export class CalendarController {

  isRadio: boolean;

  constructor(public modalCtrl: ModalController,
              public calSvc: CalendarService) {
  }

  /**
   * @deprecated
   * @param {CalendarModalOptions} calendarOptions
   * @param {ModalOptions} modalOptions
   * @returns {any}
   */
  openCalendar(calendarOptions: CalendarModalOptions, modalOptions: ModalOptions = {}): any {


    let options = this.calSvc.safeOpt(calendarOptions);
    let calendarModal = this.modalCtrl.create(CalendarModal, Object.assign({
      options: options,
    }, options), modalOptions);

    calendarModal.present();

    return new Promise((resolve, reject) => {

      calendarModal.onDidDismiss((data: any) => {
        if (data) {
          resolve(data);
        } else {
          reject('cancelled')
        }
      });
    });

  }

  /**
   * @deprecated
   */
  setHistory(param: any) {
    console.warn('setHistory deprecated');
  }

  /**
   * @deprecated
   */
  getHistory(id: any): Object {
    console.warn('getHistory deprecated');
    return null;
  }

  removeHistory(id: any) {
    localStorage.removeItem(`ion-calendar-${id}`)
  }
}
