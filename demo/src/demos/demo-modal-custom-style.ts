import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';

import {
  CalendarModal,
  CalendarModalOptions,
} from 'ion2-calendar'

@Component({
  selector: 'demo-modal-custom-style',
  template: `
    <button ion-button (click)="openCalendar()">
      custom-style
    </button>
  `
})
export class DemoModalCustomStyleComponent {

  date: Date = new Date();

  constructor(public modalCtrl: ModalController) {
  }

  openCalendar() {
    const options: CalendarModalOptions = {
      title: 'CUSTOM-STYLE',
      defaultDate: this.date,
      cssClass: 'my-class',
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
