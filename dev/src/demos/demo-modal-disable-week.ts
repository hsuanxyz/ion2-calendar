import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { CalendarModal, CalendarModalOptions } from '../ion2-calendar';

@Component({
  selector: 'demo-modal-disable-week',
  template: `
    <ion-button (click)="openCalendar()">
      disable-week
    </ion-button>
  `,
})
export class DemoModalDisableWeekComponent {
  date: Date = new Date();

  constructor(public modalCtrl: ModalController) {}

  async openCalendar() {
    const options: CalendarModalOptions = {
      title: 'DISABLE-WEEK',
      defaultDate: this.date,
      disableWeeks: [0, 6],
    };

    const myCalendar = await this.modalCtrl.create({
      component: CalendarModal,
      componentProps: { options },
    });

    myCalendar.present();

    const event: any = await myCalendar.onDidDismiss();
    const { date, type } = event;

    if (type === 'done') {
      this.date = date.dateObj;
    }
    console.log(date);
    console.log('type', type);
  }
}
