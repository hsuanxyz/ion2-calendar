import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { CalendarComponentOptions } from '../ion2-calendar';

import * as moment from 'moment';
import 'moment-timezone';

@Component({
    selector: 'demo-dst',
    template: `
    <hr>
    <h3 style="text-align: center;">DST (Daylight Savings Time)</h3>
    <ion-calendar [(ngModel)]="date"
                  (onChange)="onChange($event)"
                  [options]="options"
                  type="moment"
                  format="YYYY-MM-DD">
    </ion-calendar>
  `,
})
export class DemoDstComponent {
    date: string = '2018-10-01';
    options: CalendarComponentOptions = {
        from: new Date(2000, 9, 1),
        weekStart: 1,
    };

    constructor(public modalCtrl: ModalController) {
        moment.tz.setDefault(moment.tz.guess());
    }

    onChange($event) {
        console.log($event);
    }
}
