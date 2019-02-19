import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';
import 'moment-timezone';

import { CalendarModal, CalendarModalOptions } from '../ion2-calendar';

@Component({
    selector: 'demo-modal-dst',
    template: `
    <ion-button (click)="openCalendar()">
      DST (Daylight Savings Time)
    </ion-button>
  `,
})
export class DemoModalDstComponent {
    constructor(public modalCtrl: ModalController) {
        moment.tz.setDefault(moment.tz.guess());
        moment.locale('en');
    }

    async openCalendar() {
        const options: CalendarModalOptions = {
            title: 'DST (Daylight Savings Time)',
            weekStart: 1,
            from: new Date(2018, 9, 1),
        };

        const myCalendar = await this.modalCtrl.create({
            component: CalendarModal,
            componentProps: { options },
        });

        myCalendar.present();
    }
}
