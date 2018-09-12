import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { CalendarComponentOptions } from '../ion2-calendar';

@Component({
  selector: 'demo-range',
  template: `
    <hr>
    <h3 style="text-align: center;">range</h3>
    <ion-calendar [(ngModel)]="date"
                  (onChange)="onChange($event)"
                  [options]="options"
                  type="string"
                  format="YYYY-MM-DD">
    </ion-calendar>
  `,
})
export class DemoRangeComponent {
  date: {
    from: string;
    to: string;
  } = {
    from: '2018-01-01',
    to: '2018-01-05',
  };
  options: CalendarComponentOptions = {
    from: new Date(2000, 0, 1),
    pickMode: 'range',
  };

  constructor(public modalCtrl: ModalController) {}

  onChange($event) {
    console.log($event);
  }
}
