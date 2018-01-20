import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';

import {
  CalendarModal,
} from '../ion2-calendar'

@Component({
  selector: 'demo-basic',
  template: `
    <button ion-button (click)="openCalendar()">
      basic
    </button>
  `
})
export class ModalBasicComponent {

  constructor(public modalCtrl: ModalController) { }

  openCalendar() {
    const options = {
      title: 'BASIC',
      canBackwardsSelected: true,
      doneIcon: true,
      closeIcon: true
    };
    let myCalendar =  this.modalCtrl.create(CalendarModal, {
      options: options
    });

    myCalendar.present();

    myCalendar.onDidDismiss((date, type) => {
      console.log(date);
      console.log('type', type);
    })

  }

}
