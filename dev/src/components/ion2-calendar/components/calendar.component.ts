import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  forwardRef
} from '@angular/core';

import { CalendarMonth, CalendarModalOptions, CalendarComponentOptions, CalendarDay } from '../calendar.model'
import { CalendarService } from "../services/calendar.service";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import * as moment from 'moment';

export const ION_CAL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CalendarComponent),
  multi: true
};

@Component({
  selector: 'ion-calendar',
  providers: [ION_CAL_VALUE_ACCESSOR],
  template: `
    <div class="title">
      <button type="button"
              ion-button
              clear
              class="switch-btn"
              [disabled]="readonly"
              (click)="switchView()">
        {{monthOpt.original.time | date: _d.monthFormat}}
        <ion-icon *ngIf="!readonly" 
                  class="arrow-dropdown" 
                  [name]="_view === 'days' ? 'md-arrow-dropdown' : 'md-arrow-dropup'"></ion-icon>
      </button>
      <ng-template [ngIf]="_showToggleButtons">
        <button type='button' ion-button clear class="back" [disabled]="!canBack() || readonly" (click)="prev()">
          <ion-icon name="ios-arrow-back"></ion-icon>
        </button>
        <button type='button' ion-button clear class="forward" [disabled]="!canNext() || readonly"
                (click)="next()">
          <ion-icon name="ios-arrow-forward"></ion-icon>
        </button>
      </ng-template>
    </div>
    
    <ng-template [ngIf]="_view === 'days'" [ngIfElse]="monthPicker">
      <ion-calendar-week color="transparent"
                         [weekStart]="_d.weekStart">
      </ion-calendar-week>

      <ion-calendar-month [(ngModel)]="_calendarMonthValue"
                          [month]="monthOpt"
                          [readonly]="readonly"
                          (onChange)="onChanged($event)"
                          [pickMode]="_d.pickMode"
                          [color]="_d.color">
      </ion-calendar-month>
    </ng-template>

    <ng-template #monthPicker>
      <ion-calendar-month-picker [color]="_d.color" 
                                 [monthFormat]="options?.monthPickerFormat"
                                 (onSelect)="monthOnSelect($event)"
                                 [month]="monthOpt">
      </ion-calendar-month-picker>
    </ng-template>
  `,

})
export class CalendarComponent implements ControlValueAccessor, OnInit {


  monthOpt: CalendarMonth;
  @Input() options: CalendarComponentOptions;
  @Input() format: string = 'YYYY-MM-DD';
  @Input() type: 'string' | 'js-date' | 'moment' | 'time' | 'object' = 'string';
  @Input() readonly = false;
  @Output() onChange: EventEmitter<any> = new EventEmitter();
  @Output() monthChange: EventEmitter<any> = new EventEmitter();

  _d: CalendarModalOptions;
  _view = 'days';
  _calendarMonthValue: any[] = [null, null];
  _showToggleButtons = true;

  _onChanged: Function = () => {
  };
  _onTouched: Function = () => {
  };

  constructor(public calSvc: CalendarService) {

  }

  ionViewDidLoad() {
  }

  ngOnInit() {
    if (this.options && this.options.showToggleButtons === false) {
      this._showToggleButtons = false;
    }
    this._d = this.calSvc.safeOpt(this.options || {});
    // this.showToggleButtons = this.options.showToggleButtons;
    this.monthOpt = this.createMonth(new Date().getTime());


  }

  writeValue(obj: any): void {
    if (obj) {
      this._writeValue(obj);
      if (this._calendarMonthValue[0]) {
        this.monthOpt = this.createMonth(this._calendarMonthValue[0].time);
      } else {
        this.monthOpt = this.createMonth(new Date().getTime());
      }
    }
  }

  registerOnChange(fn: any): void {
    this._onChanged = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  createMonth(date: number) {
    return this.calSvc.createMonthsByPeriod(date, 1, this._d)[0];
  }

  switchView() {
    this._view = this._view === 'days' ? 'month' : 'days';
    return this._view;
  }

  prev() {
    if (this._view === 'days') {
      this.backMonth();
    } else {
      this.prevYear();
    }
  }

  next() {
    if (this._view === 'days') {
      this.nextMonth();
    } else {
      this.nextYear();
    }
  }

  prevYear() {
    const backTime = moment(this.monthOpt.original.time).subtract(1, 'year').valueOf();
    this.monthOpt = this.createMonth(backTime);
  }

  nextYear() {
    const nextTime = moment(this.monthOpt.original.time).add(1, 'year').valueOf();
    this.monthOpt = this.createMonth(nextTime);
  }

  nextMonth() {
    const nextTime = moment(this.monthOpt.original.time).add(1, 'months').valueOf();
    this.monthChange.emit({
      oldMonth: this.calSvc.multiFormat(this.monthOpt.original.time),
      newMonth: this.calSvc.multiFormat(nextTime)
    });
    this.monthOpt = this.createMonth(nextTime);
  }

  canNext() {
    if (!this._d.to || this._view !== 'days') return true;
    return this.monthOpt.original.time < moment(this._d.to).valueOf();
  }

  backMonth() {
    const backTime = moment(this.monthOpt.original.time).subtract(1, 'months').valueOf();
    this.monthChange.emit({
      oldMonth: this.calSvc.multiFormat(this.monthOpt.original.time),
      newMonth: this.calSvc.multiFormat(backTime)
    });
    this.monthOpt = this.createMonth(backTime);
  }

  canBack() {
    if (!this._d.from || this._view !== 'days') return true;
    return this.monthOpt.original.time > moment(this._d.from).valueOf();
  }

  monthOnSelect(month: number) {
    this._view = 'days';
    const newMonth = moment(this.monthOpt.original.time).month(month).valueOf();
    this.monthChange.emit({
      oldMonth: this.calSvc.multiFormat(this.monthOpt.original.time),
      newMonth: this.calSvc.multiFormat(newMonth)
    });
    this.monthOpt = this.createMonth(newMonth);
  }

  onChanged($event: any[]) {
    switch (this._d.pickMode) {
      case 'single':
        const date = this._handleType($event[0].time);
        this._onChanged(date);
        this.onChange.emit(date);
        break;

      case 'range':
        if ($event[0] && $event[1]) {
          const rangeDate = {
            from: this._handleType($event[0].time),
            to: this._handleType($event[1].time)
          };
          this._onChanged(rangeDate);
          this.onChange.emit(rangeDate);
        }
        break;

      case 'multi':
        let dates = [];

        for (let i = 0; i < $event.length; i++) {
          if ($event[i] && $event[i].time) {
            dates.push(this._handleType($event[i].time));
          }
        }

        this._onChanged(dates);
        this.onChange.emit(dates);
        break;

      default:

    }
  }

  _writeValue(value: any) {
    if (!value) return;
    switch (this._d.pickMode) {
      case 'single':
        this._calendarMonthValue[0] = this._createCalendarDay(value);
        break;

      case 'range':
        if (value.from) {
          this._calendarMonthValue[0] = this._createCalendarDay(value.from);
        }
        if (value.to) {
          this._calendarMonthValue[1] = this._createCalendarDay(value.to);
        }
        break;

      case 'multi':
        if (Array.isArray(value)) {
          this._calendarMonthValue = value.map(e => {
            return this._createCalendarDay(e)
          });
        } else {
          this._calendarMonthValue = [];
        }
        break;

      default:

    }
  }

  _createCalendarDay(value: any): CalendarDay {
    let date;
    if (this.type === 'string') {
      date = moment(value, this.format);
    } else {
      date = moment(value);
    }
    return this.calSvc.createCalendarDay(date.valueOf(), this._d);
  }

  _handleType(value: number): any {
    let date = moment(value);
    switch (this.type) {
      case 'string':
        return date.format(this.format);
      case 'js-date':
        return date.toDate();
      case 'moment':
        return date;
      case 'time':
        return date.valueOf();
      case 'object':
        return date.toObject();
    }
    return date;
  }

}
