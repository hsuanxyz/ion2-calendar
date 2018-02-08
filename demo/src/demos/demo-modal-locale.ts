import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';
import * as moment from 'moment';

import {
  CalendarModal,
  CalendarModalOptions,
} from 'ion2-calendar'

@Component({
  selector: 'demo-modal-locale',
  template: `
    <button ion-button (click)="openCalendar()">
      locale
    </button>
  `
})
export class DemoModalLocaleComponent {

  date: Date = new Date();

  constructor(public modalCtrl: ModalController) {
    moment.locale('zh-cn');
  }

  openCalendar() {
    const options: CalendarModalOptions = {
      title: 'LOCALE',
      defaultDate: this.date,
      monthFormat: 'yyyy 年 MM 月',
      weekdays: moment.weekdaysShort(),
      weekStart: 1,
    };

    let myCalendar = this.modalCtrl.create(CalendarModal, {
      options: options
    });

    myCalendar.present();

    myCalendar.onDidDismiss((date, type) => {
      if (type === 'done') {
        this.date = date.dateObj;
      }
      console.log(date);
      console.log('type', type);
    })

  }

}
