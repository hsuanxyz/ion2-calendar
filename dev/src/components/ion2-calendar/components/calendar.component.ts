import {
  Component, ViewChild, ElementRef, ChangeDetectorRef, Renderer, Input, OnInit, Output,
  EventEmitter, forwardRef
} from '@angular/core';
import {NavParams, ViewController, Content, InfiniteScroll} from 'ionic-angular';

import * as moment from 'moment';

import {CalendarDay, CalendarMonth, CalendarOptions, CalendarControllerOptions, Colors} from '../calendar.model'
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
  @Input() options: CalendarControllerOptions;
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
    this._calendarValue = moment(this._d.format).format('YYYY-MM-DD');
  }

  writeValue(obj: any): void {
    this._writeValue(obj);
    console.log(obj);
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
        const date = moment($event[0].time).format('YYYY-MM-DD');
        this._onChanged(date);
        this.onChange.emit(date);
        break;
      case 'range':
        if ($event[0] && $event[1]) {
          const rangeDate = {
            from: moment($event[0].time).format('YYYY-MM-DD'),
            to: moment($event[1].time).format('YYYY-MM-DD')
          };
          this._onChanged(rangeDate);
          this.onChange.emit(rangeDate);
        }

        break;
      default:

    }
  }

  _writeValue(value: any) {
    if (!value) return;
    switch (this._d.pickMode) {
      case 'single':
        const date = moment(value, 'YYYY-MM-DD');
        this._calendarMonthValue[0] = this.calSvc.createCalendarDay(date.valueOf(), this._d);
        break;
      case 'range':
          if (value.from) {
            const from = moment(value.from, 'YYYY-MM-DD');
            this._calendarMonthValue[0] = this.calSvc.createCalendarDay(from.valueOf(), this._d);
          }
          if (value.to) {
            const to = moment(value.to, 'YYYY-MM-DD');
            this._calendarMonthValue[1] = this.calSvc.createCalendarDay(to.valueOf(), this._d);
          }
        break;
      default:

    }
  }

}
