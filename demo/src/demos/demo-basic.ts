import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';

import {
  CalendarComponentOptions
} from 'ion2-calendar'

@Component({
  selector: 'demo-basic',
  template: `
    <hr>
    <h3 style="text-align: center;">basic</h3>
    <ion-calendar [(ngModel)]="date"
                  (onChange)="onChange($event)"
                  [options]="options"
                  type="string"
                  format="YYYY-MM-DD">
    </ion-calendar>
  `
})
export class DemoBasicComponent {

  date: string = '2018-01-01';
  options: CalendarComponentOptions = {
    from: new Date(2000, 0, 1),
  };

  constructor(public modalCtrl: ModalController) {
  }

  onChange($event) {
    console.log($event)
  }

}
