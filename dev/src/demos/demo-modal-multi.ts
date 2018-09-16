import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { CalendarModal, CalendarModalOptions } from '../ion2-calendar';

@Component({
  selector: 'demo-modal-multi',
  template: `
    <ion-button (click)="openCalendar()">
      multi
    </ion-button>
  `,
})
export class DemoModalMultiComponent {
  dates: Date[] = [
    new Date(),
    new Date(Date.now() + 24 * 60 * 60 * 1000),
    new Date(Date.now() + 24 * 60 * 60 * 1000 * 2),
  ];

  constructor(public modalCtrl: ModalController) {}

  async openCalendar() {
    const options: CalendarModalOptions = {
      pickMode: 'multi',
      title: 'MULTI',
      defaultDates: this.dates,
    };

    const myCalendar = await this.modalCtrl.create({
      component: CalendarModal,
      componentProps: { options },
    });

    myCalendar.present();

    const event: any = await myCalendar.onDidDismiss();
    const { data: dates, role } = event;

    if (role === 'done') {
      this.dates = [...dates.map(e => e.dateObj)];
    }
    console.log(dates);
    console.log(role);
  }
}
