import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CalendarMonth } from "../calendar.model";

@Component({
  selector: 'ion-calendar-month-picker',
  template: `
    <div [class]="'month-picker ' + color">
      <div class="month-packer-item"
           [class.this-month]="
           i === _thisMonth.getMonth() 
           && month.original.year === _thisMonth.getFullYear()"
           *ngFor="let item of _monthFormat; let i = index">
        <button type="button" (click)="_onSelect(i)">{{item}}</button>
      </div>
    </div>
  `,
})

export class MonthPickerComponent {

  @Input() month: CalendarMonth;
  @Input() color = 'primary';
  @Output() onSelect: EventEmitter<number> = new EventEmitter();
  _thisMonth = new Date();
  _monthFormat =  ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  @Input()
  set monthFormat(value: string[]) {
    if (Array.isArray(value) && value.length === 12) {
      this._monthFormat = value;
    }
  }

  get monthFormat(): string[] {
    return this._monthFormat;
  }

  constructor() {
  }

  _onSelect(month: number) {
    this.onSelect.emit(month);
  }


}
