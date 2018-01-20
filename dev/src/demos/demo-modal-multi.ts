import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';

import {
  CalendarModal,
  CalendarModalOptions,
} from '../ion2-calendar'

@Component({
  selector: 'demo-modal-multi',
  template: `
    <button ion-button (click)="openCalendar()">
      multi
    </button>
  `
})
export class DemoModalMultiComponent {

  dates: Date[] = [
    new Date(),
    new Date(Date.now() + 24 * 60 * 60 * 1000),
    new Date(Date.now() + 24 * 60 * 60 * 1000 * 2)
  ];

  constructor(public modalCtrl: ModalController) {
  }

  openCalendar() {
    const options: CalendarModalOptions = {
      pickMode: 'multi',
      title: 'MULTI',
      defaultDates: this.dates
    };

    let myCalendar = this.modalCtrl.create(CalendarModal, {
      options: options
    });

    myCalendar.present();

    myCalendar.onDidDismiss((dates, type) => {
      if (type === 'done') {
        this.dates = [...dates.map(e => e.dateObj)]
      }
      console.log(dates);
      console.log(type);
    })
  }

}
