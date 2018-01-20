import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';

import {
  CalendarComponentOptions
} from '../ion2-calendar'

@Component({
  selector: 'demo-options',
  template: `
    <hr>
    <h3 style="text-align: center;">options</h3>
    <ion-list>
      <ion-item>
        <ion-label>colors</ion-label>
        <ion-select [(ngModel)]="_color" (ngModelChange)="_changeColors($event)">
          <ion-option value="primary">primary</ion-option>
          <ion-option value="secondary">secondary</ion-option>
          <ion-option value="danger">danger</ion-option>
          <ion-option value="light">light</ion-option>
          <ion-option value="dark">dark</ion-option>
        </ion-select>
      </ion-item>
      <ion-item>
        <ion-label>disableWeeks</ion-label>
        <ion-select [(ngModel)]="_disableWeeks" 
                    (ngModelChange)="_changeDisableWeeks($event)"
                    multiple="true">
          <ion-option value="0">0</ion-option>
          <ion-option value="1">1</ion-option>
          <ion-option value="2">2</ion-option>
          <ion-option value="2">3</ion-option>
          <ion-option value="4">4</ion-option>
          <ion-option value="5">5</ion-option>
          <ion-option value="6">6</ion-option>
        </ion-select>
      </ion-item>
      <ion-item>
        <ion-label>weekStart</ion-label>
        <ion-select [(ngModel)]="_weekStart" (ngModelChange)="_changeWeekStart($event)">
          <ion-option value="0">0</ion-option>
          <ion-option value="1">1</ion-option>
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
  `
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
    disableWeeks: [...this._disableWeeks]
  };

  constructor(public modalCtrl: ModalController) {

  }

  onChange($event) {
    console.log($event)
  }

  _changeColors(color: string) {
    this.options = {
      ...this.options,
      color
    }
  }

  _changeShowToggleButtons(showToggleButtons: boolean) {
    this.options = {
      ...this.options,
      showToggleButtons
    }
  }

  _changeShowMonthPicker(showMonthPicker: boolean) {
    this.options = {
      ...this.options,
      showMonthPicker
    }
  }

  _changeDisableWeeks(disableWeeks: string[]) {
    this.options = {
      ...this.options,
      disableWeeks: disableWeeks.map(e => parseInt(e))
    }
  }

  _changeWeekStart(weekStart: number) {
    this.options = {
      ...this.options,
      weekStart: parseInt(weekStart)
    };
  }
}
