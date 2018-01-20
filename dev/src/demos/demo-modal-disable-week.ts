import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';

import {
  CalendarModal,
  CalendarModalOptions,
} from '../ion2-calendar'

@Component({
  selector: 'demo-modal-disable-week',
  template: `
    <button ion-button (click)="openCalendar()">
      disable-week
    </button>
  `
})
export class DemoModalDisableWeekComponent {

  date: Date = new Date();

  constructor(public modalCtrl: ModalController) {
  }

  openCalendar() {
    const options: CalendarModalOptions = {
      title: 'DISABLE-WEEK',
      defaultDate: this.date,
      disableWeeks: [0, 6],
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
