import { Component, EventEmitter, Input, Output } from '@angular/core';
import { defaults } from "../config";

@Component({
  selector: 'ion-calendar-year-picker',
  template: `
  <div [class]="'month-picker ' + color">
  <div class="month-packer-item"
       *ngFor="let item of _yearRanges; let i = index">
        <button type="button" (click)="_onSelect(item)">{{item}}</button>
    </div>
    </div>
  `
})

export class YearPickerComponent {
  private _year: number;
  @Input() year: number;
  private _yearStep: number;

  @Input() set yearStep(value: any) {
    if(this._year){
        this._yearStep = value;
        const tempYear = Number(this._year) + Number(this._yearStep * 10);
        this._yearRanges = this.range(Number(tempYear.toString().substr(-4,3) + '0'),Number(tempYear.toString().substr(-4,3) + '9'));
    }
  }
  get yearStep(): any {
    return this._yearStep;
  }

  @Input() color = defaults.COLOR;
  @Output() onSelect: EventEmitter<number> = new EventEmitter();
  @Output() onYearRangeUppdated: EventEmitter<string> = new EventEmitter(true);
  _thisMonth = new Date();
  _yearRanges = [];
  constructor() {
  }
  range(start, end) {
    this.onYearRangeUppdated.emit(start + ' - ' + end);
    const list = [];
    for (var i = start; i <= end; i++) {
        list.push(i);
    }
    return list;
  }
  _onSelect(year: number): void {
    this.onSelect.emit(year);
  }

  ngOnChanges(changes: any) {
    if(changes.year){
        this._year = changes.year.currentValue;
        this._yearRanges = this.range(Number(this._year.toString().substr(-4,3) + '0'),Number(this._year.toString().substr(-4,3) + '9'));
    }
  }  
}
