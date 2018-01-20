import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';

import {
  CalendarModal,
  CalendarModalOptions,
} from 'ion2-calendar'

@Component({
  selector: 'demo-modal-basic',
  template: `
    <button ion-button (click)="openCalendar()">
      basic
    </button>
  `
})
export class DemoModalBasicComponent {

  date: Date = new Date();

  constructor(public modalCtrl: ModalController) {
  }

  openCalendar() {
    const options: CalendarModalOptions = {
      title: 'BASIC',
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
