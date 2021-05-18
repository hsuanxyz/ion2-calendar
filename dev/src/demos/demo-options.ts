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
      <ion-item>
        <ion-label>showAdjacentMonthDay</ion-label>
        <ion-checkbox [(ngModel)]="_showAdjacentMonthDay" (ngModelChange)="_changeShowAdjacentMonthDay($event)"></ion-checkbox>
      </ion-item>
      <ion-item>
        <ion-label>displayMode</ion-label>
        <ion-radio-group [(ngModel)]="_displayMode" (ngModelChange)="_changeDisplayMode($event)">
          <ion-row>
            <ion-item lines="none">
              <ion-label>month &nbsp;</ion-label>
              <ion-radio value="month"></ion-radio>
            </ion-item>
            <ion-item lines="none">
              <ion-label>week &nbsp;</ion-label>
              <ion-radio value="week"></ion-radio>
            </ion-item>
          </ion-row>
        </ion-radio-group>
      </ion-item>
      <ion-item>
        <ion-label position="floating">weeks</ion-label>
        <ion-input [disabled]="_displayMode !== 'week'" type="number" inputmode="numeric" min="1" step="1" [(ngModel)]="_weeks"
                   (ngModelChange)="_changeNumberWeeks($event)"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label>continuous</ion-label>
        <ion-checkbox [disabled]="_displayMode !== 'week'" [(ngModel)]="_continuous" (ngModelChange)="_changeContinuous($event)"></ion-checkbox>
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
  _weeks: number = 1;
  _continuous: boolean = false;
  _displayMode: string = 'month';
  _showAdjacentMonthDay: boolean = true;
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

  _changeDisplayMode(displayMode: string) {
    if (displayMode === 'week' || displayMode === 'month'){
      this.options = {
        ...this.options,
        displayMode: displayMode,
      };
    }
  }

  _changeNumberWeeks(weeks: number) {
    if (weeks > 0){
      this.options = {
        ...this.options,
        weeks: weeks,
      };
    }
  }

  _changeContinuous(continuous: boolean) {
    this.options = {
      ...this.options,
      continuous,
    };
  }

  _changeShowAdjacentMonthDay(showAdjacentMonthDay: boolean) {
    this.options = {
      ...this.options,
      showAdjacentMonthDay,
    };
  }
}
