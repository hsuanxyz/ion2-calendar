import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { CalendarModal, CalendarModalOptions } from '../ion2-calendar';

@Component({
  selector: 'demo-modal-default-scroll',
  template: `
    <ion-button (click)="openCalendar()">
      default-scroll-to
    </ion-button>
  `,
})
export class DemoModalDefaultScrollComponent {
  date: Date = new Date(2017, 4, 1);

  constructor(public modalCtrl: ModalController) {}

  async openCalendar() {
    const options: CalendarModalOptions = {
      title: 'DEFAULT SCROLL',
      from: new Date(2017, 1, 1),
      defaultScrollTo: this.date,
      defaultDate: this.date,
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
