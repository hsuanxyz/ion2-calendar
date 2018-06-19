import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';
import {
  CalendarModalOptions,
} from '../ion2-calendar'
import { SubHeaderCalendarModal } from './sub-header-calendar-modal';

@Component({
  selector: 'demo-modal-custom-sub-header',
  template: `
    <button ion-button (click)="openCalendar()">
      Custom Sub Header
    </button>
  `
})
export class DemoModalCustomSubHeaderComponent {

  date: Date = new Date();

  constructor(public modalCtrl: ModalController) {
  }

  openCalendar() {
    const options: CalendarModalOptions = {
      title: 'Custom Sub Header',
      defaultDate: this.date,
      canBackwardsSelected: true
    };

    let myCalendar = this.modalCtrl.create(SubHeaderCalendarModal, {
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
