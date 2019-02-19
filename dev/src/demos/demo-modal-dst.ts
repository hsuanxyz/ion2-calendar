import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';
import * as moment from 'moment';

import {
    CalendarModal,
    CalendarModalOptions,
} from '../ion2-calendar'

@Component({
    selector: 'demo-modal-dst',
    template: `
        <button ion-button (click)="openCalendar()">
            DST (Daylight Savings Time)
        </button>
    `
})
export class DemoModalDstComponent {

    constructor(public modalCtrl: ModalController) {
        moment.tz.setDefault(moment.tz.guess());
        moment.locale('en');
    }

    openCalendar() {
        const options: CalendarModalOptions = {
            title: 'DST (Daylight Savings Time)',
            weekStart: 1,
            from: new Date(2018, 9, 1),
        };

        let myCalendar = this.modalCtrl.create(CalendarModal, {
            options: options
        });

        myCalendar.present();

    }

}