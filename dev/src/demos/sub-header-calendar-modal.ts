import { Component, ViewChild } from '@angular/core';

@Component({
  template: `
  <ion-calendar-modal #calendar>
    <div sub-header>
      <label>Date seleted: </label>
      <span *ngFor="let d of calendar.datesTemp; let i = index">
        <ion-button *ngIf="d" [color]="calendar._d.color" (click)="toDate(d.time)">{{d.time | date: 'dd/MM/yyyy'}}</ion-button>
      </span>
    </div>
  </ion-calendar-modal>
  `,
})
export class SubHeaderCalendarModal {
  toDate(p) {
    console.log(p);
  }
}
