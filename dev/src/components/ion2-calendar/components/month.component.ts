import {Component, ChangeDetectorRef, Input, Output, EventEmitter, OnInit, forwardRef} from '@angular/core';

import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

import {CalendarDay, CalendarMonth, PickMode} from '../calendar.model'

export const MONTH_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MonthComponent),
  multi: true,
};

@Component({
  selector: 'ion-calendar-month',
  providers: [MONTH_VALUE_ACCESSOR],
  template: `
    <div [class]="color">
      <div *ngIf="pickMode !== 'range'">
        <div class="days-box">
          <div class="days" *ngFor="let day of month.days">
            <button [class]="'days-btn ' + day.cssClass"
                    *ngIf="day"
                    [class.today]="day.isToday"
                    (click)="onSelected(day)"
                    [class.marked]="day.marked"
                    [class.on-selected]="isSelected(day.time)"
                    [disabled]="day.disable">
              <p>{{day.title}}</p>
              <small *ngIf="day.subTitle">{{day?.subTitle}}</small>
            </button>
          </div>
        </div>
      </div>
      <div *ngIf="pickMode === 'range'">
        <div class="days-box">
          <div class="days" *ngFor="let day of month.days">
            <button [class]="'days-btn ' + day.cssClass"
                    *ngIf="day"
                    [class.today]="day.isToday"
                    (click)="onSelected(day)"
                    [class.marked]="day.marked"
                    [class.on-selected]="isSelected(day.time)"
                    [disabled]="day.disable"
                    [class.startSelection]="isStartSelection(day)"
                    [class.endSelection]="isEndSelection(day)"
                    [class.between]="isBetween(day)">
              <p>{{day.title}}</p>
              <small *ngIf="day.subTitle">{{day?.subTitle}}</small>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class MonthComponent implements ControlValueAccessor, OnInit {

  @Input() month: CalendarMonth;
  @Input() pickMode: PickMode;
  @Input() isSaveHistory: boolean;
  @Input() id: any;
  @Input() color: string = 'primary';

  @Output() onChange: EventEmitter<any> = new EventEmitter();

  _date: Array<CalendarDay | null> = [];

  _onChanged: Function;
  _onTouched: Function;

  constructor(public ref: ChangeDetectorRef,) {
  }

  ngOnInit() {
    this._date = [];
  }

  writeValue(obj: any): void {
    this._date = obj;
  }

  registerOnChange(fn: any): void {
    this._onChanged = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  isEndSelection(day: CalendarDay): boolean {
    if (this.pickMode !== 'range' || !Array.isArray(this._date) || this._date[1] === null) {
      return false;
    }

    return this._date[1].time === day.time;
  }

  isBetween(day: CalendarDay): boolean {

    if (this.pickMode !== 'range' || !Array.isArray(this._date)) {
      return false;
    }

    let start = 0;
    let end = 0;

    if (this._date[0] === null) {
      return false
    } else {
      start = this._date[0].time;
    }

    if (this._date[1] === null) {
      return false
    } else {
      end = this._date[1].time;
    }

    return day.time < end && day.time > start;

  }

  isStartSelection(day: CalendarDay): boolean {
    if (this.pickMode !== 'range' || !Array.isArray(this._date) || this._date[0] === null) {
      return false;
    }

    return this._date[0].time === day.time && this._date[1] !== null;
  }

  isSelected(time: number): boolean {
    if (Array.isArray(this._date)) {

      if (this.pickMode !== 'multi') {
        if (this._date[0] !== null) {
          return time === this._date[0].time
        }

        if (this._date[1] !== null) {
          return time === this._date[1].time
        }
      } else {
        return this._date.findIndex(e => e !== null && e.time === time) !== -1;
      }

    } else {
      return false
    }
  }

  onSelected(item: any) {
    item.selected = true;
    this.ref.detectChanges();


    if (this.pickMode === 'single') {
      this._date[0] = item;

      this.onChange.emit(this._date);
      return;
    }

    if (this.pickMode === 'range') {
      if (this._date[0] === null) {
        this._date[0] = item;

        this.ref.detectChanges();

      } else if (this._date[1] === null) {
        if (this._date[0].time < item.time) {
          this._date[1] = item;
        } else {
          this._date[1] = this._date[0];
          this._date[0] = item;
        }

        this.ref.detectChanges();
      } else {
        this._date[0] = item;
        this._date[1] = null;
      }
      this.onChange.emit(this._date);
    }

    if (this.pickMode === 'multi') {

      const index = this._date.findIndex(e => e !== null && e.time === item.time);

      if (index === -1) {
        this._date.push(item);
      } else {
        this._date.splice(index, 1);
      }
      this.onChange.emit(this._date.filter(e => e !== null));
      console.log(this._date.filter(e => e !== null))
    }

      this.ref.detectChanges();

  }

}
