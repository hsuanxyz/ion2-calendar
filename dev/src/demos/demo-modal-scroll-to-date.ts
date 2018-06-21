import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';

import {
  CalendarModal,
  CalendarModalOptions,
} from '../ion2-calendar'

@Component({
  selector: 'demo-modal-scroll-to-date',
  template: `
    <button ion-button (click)="openCalendar()">
      Scroll to Date (3 seg timeout to 2 month)
    </button>
  `
})
export class DemoModalScrollToDateComponent {

  date: Date = new Date();

  constructor(public modalCtrl: ModalController) {
  }

  openCalendar() {
    const options: CalendarModalOptions = {
      title: 'BASIC',
      defaultDate: this.date,
      canBackwardsSelected: true
    };

    let myCalendar = this.modalCtrl.create(CalendarModal, {
      options: options
    });

    myCalendar.present().then((v) =>{
      setTimeout(() => {
        ((myCalendar.overlay as any).instance as CalendarModal).scrollToDate(new Date(this.date.getFullYear(), this.date.getMonth() + 2, this.date.getDate()))
      }, 3000);
    });

    myCalendar.onDidDismiss((date, type) => {
      if (type === 'done') {
        this.date = date.dateObj;
      }
      console.log(date);
      console.log('type', type);
    })

  }

}
