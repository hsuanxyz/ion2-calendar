import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ion-calendar-month-picker',
  template: `
    <div [class]="'month-picker ' + color">
      <div class="month-packer-item"
           [class.this-month]="i === _thisMonth"
           [class.active]="i === month"
           *ngFor="let item of monthFormat; let i = index">
        <button type="button" (click)="_onSelect(i)">{{item}}</button>
      </div>
    </div>
  `,
})

export class MonthPickerComponent {

  @Input() monthFormat = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  @Input() month: number;
  @Input() color = 'primary';
  @Output() onSelect: EventEmitter<number> = new EventEmitter();
  _thisMonth = new Date().getMonth();
  constructor() {
  }

  _onSelect(month: number) {
    this.onSelect.emit(month);
  }


}
