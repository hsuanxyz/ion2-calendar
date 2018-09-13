import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { CalendarModal, CalendarModalOptions } from '../ion2-calendar';

@Component({
  selector: 'demo-modal-custom-style',
  template: `
    <ion-button (click)="openCalendar()">
      custom-style
    </ion-button>
  `,
})
export class DemoModalCustomStyleComponent {
  date: Date = new Date();

  constructor(public modalCtrl: ModalController) {}

  async openCalendar() {
    const options: CalendarModalOptions = {
      title: 'CUSTOM-STYLE',
      defaultDate: this.date,
      cssClass: 'my-class',
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
