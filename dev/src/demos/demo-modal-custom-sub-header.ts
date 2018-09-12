import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CalendarModalOptions } from '../ion2-calendar';
import { SubHeaderCalendarModal } from './sub-header-calendar-modal';

@Component({
  selector: 'demo-modal-custom-sub-header',
  template: `
    <ion-button (click)="openCalendar()">
      Custom Sub Header
    </ion-button>
  `,
})
export class DemoModalCustomSubHeaderComponent {
  date: Date = new Date();

  constructor(public modalCtrl: ModalController) {}

  async openCalendar() {
    const options: CalendarModalOptions = {
      title: 'Custom Sub Header',
      defaultDate: this.date,
      canBackwardsSelected: true,
    };

    const myCalendar = await this.modalCtrl.create({
      component: SubHeaderCalendarModal,
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
