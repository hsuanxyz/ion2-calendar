import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';

import {
  CalendarModal,
  CalendarModalOptions
} from '../ion2-calendar'

@Component({
  selector: 'demo-modal-range',
  template: `
    <button ion-button (click)="openCalendar()">
      range
    </button>
  `
})
export class DemoModalRangeComponent {

  dateRange: {
    from: Date;
    to: Date
  } = {
    from: new Date(),
    to: new Date(Date.now() + 24 * 60 * 60 * 1000 * 5)
  };

  constructor(public modalCtrl: ModalController) {
  }

  openCalendar() {
    const options: CalendarModalOptions = {
      pickMode: 'range',
      title: 'RANGE',
      defaultDateRange: this.dateRange,
      color: 'color-custom'
    };

    let myCalendar = this.modalCtrl.create(CalendarModal, {
      options: options
    });

    myCalendar.present();

    myCalendar.onDidDismiss((date, type) => {
      if (type === 'done') {
        this.dateRange = Object.assign({}, {
          from: date.from.dateObj,
          to: date.to.dateObj,
        })
      }
      console.log(date);
      console.log('type', type);
    });
  }

}
