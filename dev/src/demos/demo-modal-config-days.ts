import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';

import {
  CalendarModal,
  CalendarModalOptions,
  DayConfig
} from '../ion2-calendar'

@Component({
  selector: 'demo-modal-config-days',
  template: `
    <button ion-button (click)="openCalendar()">
      config-days
    </button>
  `
})
export class DemoModalConfigDaysComponent {

  date: Date = new Date(2017, 0, 2);

  constructor(public modalCtrl: ModalController) {
  }

  openCalendar() {

    const daysConfig: DayConfig[] = [];
    for (let i = 1; i < 30; i++) {
      daysConfig.push({
        date: new Date(2017, 0, i + 1),
        subTitle: `$${i + 1}`
      })
    }
    daysConfig.push({
      date: new Date(2017, 1, 1),
      disable: true,
      subTitle: 'disable',
    });
    daysConfig.push({
      date: new Date(2017, 0, 1),
      subTitle: 'New Year\'s',
      cssClass: 'my-day'
    });

    const options: CalendarModalOptions = {
      daysConfig,
      from: new Date(2017, 0, 1),
      to: new Date(2017, 11.1),
      title: 'CONFIG DAYS',
      defaultDate: this.date
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
