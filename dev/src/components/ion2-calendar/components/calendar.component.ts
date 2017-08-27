import {
  Component, ViewChild, ElementRef, ChangeDetectorRef, Renderer, Input, OnInit, Output,
  EventEmitter, forwardRef
} from '@angular/core';
import {NavParams, ViewController, Content, InfiniteScroll} from 'ionic-angular';

import * as moment from 'moment';

import {
  CalendarDay, CalendarMonth, CalendarOptions, CalendarControllerOptions, Colors,
  CalendarComponentOptions
} from '../calendar.model'
import {CalendarService} from "../services/calendar.service";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

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
      <div class="text">
        {{monthOpt.original.time | date: _d.monthFormat}}
      </div>
      <div ion-button clear class="back" (click)="backMonth()">
        <ion-icon name="ios-arrow-back"></ion-icon>
      </div>
      <div ion-button clear class="forward" (click)="nextMonth()">
        <ion-icon name="ios-arrow-forward"></ion-icon>
      </div>
    </div>

    <ion-calendar-week color="light"
                       [weekStart]="_d.weekStart">
    </ion-calendar-week>

    <ion-calendar-month
      [(ngModel)]="_calendarMonthValue"
      [month]="monthOpt"
      (onChange)="onChanged($event)"
      [pickMode]="_d.pickMode"
      [color]="_d.color">

    </ion-calendar-month>

  `,

})
export class CalendarComponent implements ControlValueAccessor, OnInit {


  monthOpt: CalendarMonth;
  monthDate: Date = new Date();
  @Input() options: CalendarComponentOptions;
  @Input() format: string = 'YYYY-MM-DD';
  @Output() onChange: EventEmitter<any> = new EventEmitter();

  _d: CalendarControllerOptions;
  _calendarMonthValue: any[] = [null, null];
  _calendarValue: any;
  _onChanged: Function;
  _onTouched: Function;

  constructor(private _renderer: Renderer,
              public _elementRef: ElementRef,
              public params: NavParams,
              public viewCtrl: ViewController,
              public ref: ChangeDetectorRef,
              public calSvc: CalendarService,) {
  }

  ionViewDidLoad() {

  }

  ngOnInit() {
    this._d = this.calSvc.safeOpt(this.options || {});
    this.monthOpt = this.createMonth(moment(this._d.from).valueOf());
    this._calendarValue = moment(this._d.format).format(this.format);
  }

  writeValue(obj: any): void {
    this._writeValue(obj);
  }

  registerOnChange(fn: any): void {
    this._onChanged = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  createMonth(date) {
    return this.calSvc.createMonthsByPeriod(date, 1, this._d)[0];
  }

  nextMonth() {
    const nextTime = moment(this.monthOpt.original.time).add(1, 'months').valueOf();
    this.monthOpt = this.createMonth(nextTime);
  }

  backMonth() {
    const backTime = moment(this.monthOpt.original.time).subtract(1, 'months').valueOf();
    this.monthOpt = this.createMonth(backTime);
  }

  onChanged($event) {
    switch (this._d.pickMode) {
      case 'single':
        const date = moment($event[0].time).format(this.format);
        this._onChanged(date);
        this.onChange.emit(date);
        break;

      case 'range':
        if ($event[0] && $event[1]) {
          const rangeDate = {
            from: moment($event[0].time).format(this.format),
            to: moment($event[1].time).format(this.format)
          };
          this._onChanged(rangeDate);
          this.onChange.emit(rangeDate);
        }
        break;

      case 'multi':
        let dates = [];

        for (let i = 0; i < $event.length; i ++) {
          if ($event[i] && $event[i].time) {
            dates.push(moment($event[i].time).format(this.format))
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
        const date = moment(value, this.format);
        this._calendarMonthValue[0] = this.calSvc.createCalendarDay(date.valueOf(), this._d);
        break;

      case 'range':
          if (value.from) {
            const from = moment(value.from, this.format);
            this._calendarMonthValue[0] = this.calSvc.createCalendarDay(from.valueOf(), this._d);
          }
          if (value.to) {
            const to = moment(value.to, this.format);
            this._calendarMonthValue[1] = this.calSvc.createCalendarDay(to.valueOf(), this._d);
          }
        break;

      case 'multi':
        if (Array.isArray(value)) {
          this._calendarMonthValue = value.map(e => {
            return this.calSvc.createCalendarDay(moment(e, this.format).valueOf(), this._d);
          });
        } else {
          this._calendarMonthValue = [];
        }
        break;

      default:

    }
  }

}
