import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { CalendarComponentOptions } from '../ion2-calendar';

@Component({
  selector: 'demo-options',
  template: `
    <hr>
    <h3 style="text-align: center;">options</h3>
    <ion-list>
      <ion-item>
        <ion-label>colors</ion-label>
        <ion-select [(ngModel)]="_color" (ngModelChange)="_changeColors($event)">
          <ion-select-option color="primary">primary</ion-select-option>
          <ion-select-option color="secondary">secondary</ion-select-option>
          <ion-select-option color="danger">danger</ion-select-option>
          <ion-select-option color="light">light</ion-select-option>
          <ion-select-option color="dark">dark</ion-select-option>
        </ion-select>
      </ion-item>
      <ion-item>
        <ion-label>disableWeeks</ion-label>
        <ion-select [(ngModel)]="_disableWeeks" 
                    (ngModelChange)="_changeDisableWeeks($event)"
                    multiple="true">
          <ion-select-option color="0">0</ion-select-option>
          <ion-select-option color="1">1</ion-select-option>
          <ion-select-option color="2">2</ion-select-option>
          <ion-select-option color="2">3</ion-select-option>
          <ion-select-option color="4">4</ion-select-option>
          <ion-select-option color="5">5</ion-select-option>
          <ion-select-option color="6">6</ion-select-option>
        </ion-select>
      </ion-item>
      <ion-item>
        <ion-label>weekStart</ion-label>
        <ion-select [(ngModel)]="_weekStart" (ngModelChange)="_changeWeekStart($event)">
          <ion-select-option color="0">0</ion-select-option>
          <ion-select-option color="1">1</ion-select-option>
        </ion-select>
      </ion-item>
      <ion-item>
        <ion-label>showToggleButtons</ion-label>
        <ion-checkbox [(ngModel)]="_showToggleButtons" (ngModelChange)="_changeShowToggleButtons($event)"></ion-checkbox>
      </ion-item>
      <ion-item>
        <ion-label>showMonthPicker</ion-label>
        <ion-checkbox [(ngModel)]="_showMonthPicker" (ngModelChange)="_changeShowMonthPicker($event)"></ion-checkbox>
      </ion-item>
    </ion-list>

    <ion-calendar [(ngModel)]="date"
                  (onChange)="onChange($event)"
                  [options]="options"
                  type="string"
                  format="YYYY-MM-DD">
    </ion-calendar>
  `,
})
export class DemoOptionsComponent {
  _color: string = 'primary';
  _showToggleButtons: boolean = true;
  _showMonthPicker: boolean = true;
  _disableWeeks: number[] = [0, 6];
  _weekStart: number = 0;
  date: string = '2018-01-01';
  options: CalendarComponentOptions = {
    from: new Date(2000, 0, 1),
    disableWeeks: [...this._disableWeeks],
  };

  constructor(public modalCtrl: ModalController) {}

  onChange($event) {
    console.log($event);
  }

  _changeColors(color: string) {
    this.options = {
      ...this.options,
      color,
    };
  }

  _changeShowToggleButtons(showToggleButtons: boolean) {
    this.options = {
      ...this.options,
      showToggleButtons,
    };
  }

  _changeShowMonthPicker(showMonthPicker: boolean) {
    this.options = {
      ...this.options,
      showMonthPicker,
    };
  }

  _changeDisableWeeks(disableWeeks: string[]) {
    this.options = {
      ...this.options,
      disableWeeks: disableWeeks.map(e => parseInt(e)),
    };
  }

  _changeWeekStart(weekStart: string) {
    this.options = {
      ...this.options,
      weekStart: parseInt(weekStart),
    };
  }
}
