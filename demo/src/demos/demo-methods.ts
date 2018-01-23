import { Component, ViewChild } from '@angular/core';
import { ToastController } from 'ionic-angular';

import {
  CalendarComponent,
  CalendarComponentOptions
} from 'ion2-calendar'

@Component({
  selector: 'demo-methods',
  template: `
    <hr>
    <h3 style="text-align: center;">methods</h3>
    <button ion-button (click)="getCalendarViewDate()">get view date</button>
    <button ion-button (click)="serCalendarViewDate()">set view date: 2018-2-1</button>
    <ion-calendar #calendar
                  [(ngModel)]="date"
                  (onChange)="onChange($event)"
                  [options]="options"
                  type="string"
                  format="YYYY-MM-DD">
    </ion-calendar>
  `
})
export class DemoMethodsComponent {

  @ViewChild('calendar', { read: CalendarComponent }) calendarRef: CalendarComponent;

  date: {
    from: string
    to: string
  } = {
    from: '2018-01-15',
    to: '2018-01-25'
  };
  options: CalendarComponentOptions = {
    from: new Date(2000, 0, 1),
    pickMode: 'range'
  };

  constructor(private toastCtrl: ToastController) {

  }

  _toastWrap(event: string, payload: {}) {
    let toast = this.toastCtrl.create({
      message: `${event}: ${JSON.stringify(payload, null, 2)}`,
      duration: 2000,
    });
    toast.present()
  }

  onChange($event) {
    console.log('onChange', $event);
  }

  getCalendarViewDate() {
    console.log(this.calendarRef)
    this._toastWrap('view date', this.calendarRef.getViewDate());
    console.log('view date', this.calendarRef.getViewDate())
  }

  serCalendarViewDate() {
    this.calendarRef.setViewDate('2018-02-01')
  }

}
