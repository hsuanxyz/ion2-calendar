import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';

import {
  CalendarModal,
  CalendarModalOptions,
} from '../ion2-calendar'

@Component({
  selector: 'demo-modal-default-scroll',
  template: `
    <button ion-button (click)="openCalendar()">
      default-scroll-to
    </button>
  `
})
export class DemoModalDefaultScrollComponent {

  date: Date = new Date(2017, 4, 1);

  constructor(public modalCtrl: ModalController) {
  }

  openCalendar() {
    const options: CalendarModalOptions = {
      title: 'DEFAULT SCROLL',
      from: new Date(2017, 1, 1),
      defaultScrollTo: this.date,
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
