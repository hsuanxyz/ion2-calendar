import { Component, Input, OnInit, Output, EventEmitter, forwardRef, Provider } from '@angular/core';

import {
  CalendarMonth,
  CalendarModalOptions,
  CalendarComponentOptions,
  CalendarDay,
  CalendarComponentPayloadTypes,
  CalendarComponentMonthChange,
  CalendarComponentTypeProperty,
  DisplayMode, CalendarComponentWeekChange,
} from '../calendar.model';
import { CalendarService } from '../services/calendar.service';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import * as moment from 'moment';
import { defaults, pickModes } from '../config';
import {isIonIconsV4} from "../utils/icons";

export const ION_CAL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CalendarComponent),
  multi: true,
};

interface CompatibleIcons {
  caretDown: string;
  caretUp: string;
  chevronBack: string;
  chevronForward: string;
}

@Component({
  selector: 'ion-calendar',
  providers: [ION_CAL_VALUE_ACCESSOR],
  styleUrls: ['./calendar.component.scss'],
  template: `
    <div class="title">
      <ng-template [ngIf]="_showMonthPicker" [ngIfElse]="title">
        <ion-button type="button"
                    fill="clear"
                    class="switch-btn"
                    [attr.aria-label]="getDate(monthOpt.original.time) | date:MONTH_DATE_FORMAT"
                    (click)="switchView()">
          {{ _monthFormat(monthOpt.original.time) }}
          <ion-icon class="arrow-dropdown"
                    [name]="_view === 'days' ? _compatibleIcons.caretDown : _compatibleIcons.caretUp"></ion-icon>
        </ion-button>
      </ng-template>
      <ng-template #title>
        <div class="switch-btn"
             [attr.aria-label]="getDate(monthOpt.original.time) | date:MONTH_DATE_FORMAT">
          {{ _monthFormat(monthOpt.original.time) }}
        </div>
      </ng-template>
      <ng-template [ngIf]="_showToggleButtons">
        <ion-button type="button" fill="clear" class="back" [disabled]="!canBack()" (click)="prev()">
          <ion-icon slot="icon-only" size="small" [name]="_compatibleIcons.chevronBack"></ion-icon>
        </ion-button>
        <ion-button type="button" fill="clear" class="forward" [disabled]="!canNext()" (click)="next()">
          <ion-icon slot="icon-only" size="small" [name]="_compatibleIcons.chevronForward"></ion-icon>
        </ion-button>
      </ng-template>
    </div>
    <ng-template [ngIf]="_view === 'days'" [ngIfElse]="monthPicker">
      <ion-calendar-week color="transparent"
                         [weekArray]="_d.weekdays"
                         [weekStart]="_d.weekStart">
      </ion-calendar-week>

      <ion-calendar-month [componentMode]="true"
                          [(ngModel)]="_calendarMonthValue"
                          [month]="monthOpt"
                          [readonly]="readonly"
                          (change)="onChanged($event)"
                          (swipe)="swipeEvent($event)"
                          (select)="select.emit($event)"
                          (selectStart)="selectStart.emit($event)"
                          (selectEnd)="selectEnd.emit($event)"
                          [pickMode]="_d.pickMode"
                          [color]="_d.color">
      </ion-calendar-month>
    </ng-template>

    <ng-template #monthPicker>
      <ion-calendar-month-picker [color]="_d.color"
                                 [monthFormat]="_options?.monthPickerFormat"
                                 (select)="monthOnSelect($event)"
                                 [month]="monthOpt">
      </ion-calendar-month-picker>
    </ng-template>
  `,
})
export class CalendarComponent implements ControlValueAccessor, OnInit {
  _d: CalendarModalOptions;
  _options: CalendarComponentOptions;
  _view: 'month' | 'days' = 'days';
  _calendarMonthValue: CalendarDay[] = [null, null];
  _showToggleButtons = true;
  _compatibleIcons: CompatibleIcons;
  get showToggleButtons(): boolean {
    return this._showToggleButtons;
  }

  set showToggleButtons(value: boolean) {
    this._showToggleButtons = value;
  }

  _showMonthPicker = true;
  get showMonthPicker(): boolean {
    return this._showMonthPicker;
  }

  set showMonthPicker(value: boolean) {
    this._showMonthPicker = value;
  }

  monthOpt: CalendarMonth;

  @Input()
  format: string = defaults.DATE_FORMAT;
  @Input()
  type: CalendarComponentTypeProperty = 'string';
  @Input()
  readonly = false;
  @Output()
  change: EventEmitter<CalendarComponentPayloadTypes> = new EventEmitter();
  @Output()
  monthChange: EventEmitter<CalendarComponentMonthChange> = new EventEmitter();
  @Output()
  weekChange: EventEmitter<CalendarComponentWeekChange> = new EventEmitter();
  @Output()
  select: EventEmitter<CalendarDay> = new EventEmitter();
  @Output()
  selectStart: EventEmitter<CalendarDay> = new EventEmitter();
  @Output()
  selectEnd: EventEmitter<CalendarDay> = new EventEmitter();

  @Input()
  set options(value: CalendarComponentOptions) {
    this._options = value;
    this.initOpt();
    if (this.monthOpt && this.monthOpt.original) {
      this.createWeekOrMonth(this.monthOpt.original.time);
    }
  }

  get options(): CalendarComponentOptions {
    return this._options;
  }

  readonly MONTH_DATE_FORMAT = 'MMMM yyyy';

  constructor(public calSvc: CalendarService) {
    if (isIonIconsV4()) {
      this._compatibleIcons = {
        caretDown: 'md-arrow-dropdown',
        caretUp: 'md-arrow-dropup',
        chevronBack: 'ios-arrow-back',
        chevronForward: 'ios-arrow-forward',
      };
    } else {
      this._compatibleIcons = {
        caretDown: 'caret-down-outline',
        caretUp: 'caret-up-outline',
        chevronBack: 'chevron-back-outline',
        chevronForward: 'chevron-forward-outline',
      };
    }
  }

  ngOnInit(): void {
    this.initOpt();
    this.createWeekOrMonth(new Date().getTime());
  }

  getViewDate() {
    return this._handleType(this.monthOpt.original.time);
  }

  getDate(date: number) {
    return new Date(date);
  }

  setViewDate(value: CalendarComponentPayloadTypes) {
    this.createWeekOrMonth(this._payloadToTimeNumber(value));
  }

  switchView(): void {
    this._view = this._view === 'days' ? 'month' : 'days';
  }

  prev(): void {
    if (this._view === 'days') {
      if (this._d.displayMode === 'week') {
        this.backWeek();
      } else {
        this.backMonth();
      }
    } else {
      this.prevYear();
    }
  }

  next(): void {
    if (this._view === 'days') {
      if (this._d.displayMode === 'week') {
        this.nextWeek();
      } else {
        this.nextMonth();
      }
    } else {
      this.nextYear();
    }
  }

  prevYear(): void {
    if (moment(this.monthOpt.original.time).year() === 1970) { return; }
    const backTime = moment(this.monthOpt.original.time)
      .subtract(1, 'year')
      .valueOf();
    this.createWeekOrMonth(backTime);
  }

  nextYear(): void {
    const nextTime = moment(this.monthOpt.original.time)
      .add(1, 'year')
      .valueOf();
    this.createWeekOrMonth(nextTime);
  }

  nextMonth(): void {
    const nextTime = moment(this.monthOpt.original.time)
      .add(1, 'months')
      .valueOf();
    this.monthChange.emit({
      oldMonth: this.calSvc.multiFormat(this.monthOpt.original.time),
      newMonth: this.calSvc.multiFormat(nextTime),
    });
    this.monthOpt = this.createMonth(nextTime);
  }

  nextWeek(): void {
    let nextTime = moment(this.monthOpt.original.time)
      .add(this._d.weeks, 'weeks')
      .valueOf();
    let oldWeek = this.calSvc.multiFormat(this.monthOpt.original.time);
    let newWeek = this.calSvc.multiFormat(nextTime);
    if (oldWeek.months != newWeek.months && !this._d.continuous) {
      let _start = new Date(nextTime);
      nextTime = new Date(_start.getFullYear(), _start.getMonth(), 1).getTime();
      newWeek = this.calSvc.multiFormat(nextTime);
    }
    this.monthOpt = this.createWeek(nextTime);
    this.weekChange.emit({
      oldWeek: oldWeek,
      newWeek: this.calSvc.multiFormat(this.monthOpt.original.time),
    });
    if (oldWeek.months != newWeek.months) {
      this.monthChange.emit({
        oldMonth: oldWeek,
        newMonth: this.calSvc.multiFormat(this.monthOpt.original.time),
      });
    }
  }

  canNext(): boolean {
    if (!this._d.to || this._view !== 'days') { return true; }
    return this.monthOpt.original.time < moment(this._d.to).valueOf();
  }

  backMonth(): void {
    const backTime = moment(this.monthOpt.original.time)
      .subtract(1, 'months')
      .valueOf();
    this.monthChange.emit({
      oldMonth: this.calSvc.multiFormat(this.monthOpt.original.time),
      newMonth: this.calSvc.multiFormat(backTime),
    });
    this.monthOpt = this.createMonth(backTime);
  }

  backWeek(): void {
    let backTime = moment(this.monthOpt.original.time)
      .subtract(this._d.weeks, 'weeks')
      .valueOf();
    let oldWeek = this.calSvc.multiFormat(this.monthOpt.original.time);
    let newWeek = this.calSvc.multiFormat(backTime);
    if (oldWeek.months != newWeek.months && !this._d.continuous) {
      let _start = new Date(this.monthOpt.original.time);
      let dayToSubstrac = _start.getDay();
      if (this.options.weekStart === 1) {
        dayToSubstrac--;
        if (dayToSubstrac < 0) {
          dayToSubstrac = 6;
        }
      }

      let firstDayMonth = new Date(_start.getFullYear(), _start.getMonth(), 1).getTime();
      let momentBackTime = moment(firstDayMonth);
      if (_start.getDate() - dayToSubstrac <= 1) {
        momentBackTime = momentBackTime.subtract(1, 'd');
      }
      backTime = momentBackTime.valueOf();

      newWeek = this.calSvc.multiFormat(backTime);
    }
    this.weekChange.emit({
      oldWeek: oldWeek,
      newWeek: newWeek,
    });
    if (oldWeek.months != newWeek.months) {
      this.monthChange.emit({
        oldMonth: oldWeek,
        newMonth: newWeek,
      });
    }
    this.monthOpt = this.createWeek(backTime);
  }

  canBack(): boolean {
    if (!this._d.from || this._view !== 'days') { return true; }
    return this.monthOpt.original.time > moment(this._d.from).valueOf();
  }

  monthOnSelect(month: number): void {
    this._view = 'days';
    const newMonth = moment(this.monthOpt.original.time)
      .month(month)
      .valueOf();
    this.monthChange.emit({
      oldMonth: this.calSvc.multiFormat(this.monthOpt.original.time),
      newMonth: this.calSvc.multiFormat(newMonth),
    });
    this.createWeekOrMonth(newMonth);
  }

  onChanged($event: CalendarDay[]): void {
    switch (this._d.pickMode) {
      case pickModes.SINGLE:
        const date = this._handleType($event[0].time);
        this._onChanged(date);
        this.change.emit(date);
        break;

      case pickModes.RANGE:
        if ($event[0] && $event[1]) {
          const rangeDate = {
            from: this._handleType($event[0].time),
            to: this._handleType($event[1].time),
          };
          this._onChanged(rangeDate);
          this.change.emit(rangeDate);
        }
        break;

      case pickModes.MULTI:
        const dates = [];

        for (let i = 0; i < $event.length; i++) {
          if ($event[i] && $event[i].time) {
            dates.push(this._handleType($event[i].time));
          }
        }

        this._onChanged(dates);
        this.change.emit(dates);
        break;

      default:
    }
  }

  swipeEvent($event: any): void {
    const isNext = $event.deltaX < 0;
    if (isNext && this.canNext()) {
      this.nextMonth();
    } else if (!isNext && this.canBack()) {
      this.backMonth();
    }
  }

  _onChanged: Function = () => {};

  _onTouched: Function = () => {};

  _payloadToTimeNumber(value: CalendarComponentPayloadTypes): number {
    let date;
    if (this.type === 'string') {
      date = moment(value, this.format);
    } else {
      date = moment(value);
    }
    return date.valueOf();
  }

  _monthFormat(date: number): string {
    return moment(date).format(this._d.monthFormat.replace(/y/g, 'Y'));
  }

  private initOpt(): void {
    if (this._options && typeof this._options.showToggleButtons === 'boolean') {
      this.showToggleButtons = this._options.showToggleButtons;
    }
    if (this._options && typeof this._options.showMonthPicker === 'boolean') {
      this.showMonthPicker = this._options.showMonthPicker;
      if (this._view !== 'days' && !this.showMonthPicker) {
        this._view = 'days';
      }
    }
    this._d = this.calSvc.safeOpt(this._options || {});
  }

  private createWeekOrMonth(time: number) {
    if (this._d.displayMode === 'week') {
      this.monthOpt = this.createWeek(time);
    } else {
      this.monthOpt = this.createMonth(time);
    }
  }

  createMonth(date: number): CalendarMonth {
    return this.calSvc.createMonthsByPeriod(date, 1, this._d)[0];
  }

  createWeek(date: number): CalendarMonth {
    return this.calSvc.createWeeksByPeriod(date, this._d)[0];
  }

  _createCalendarDay(value: CalendarComponentPayloadTypes): CalendarDay {
    return this.calSvc.createCalendarDay(this._payloadToTimeNumber(value), this._d);
  }

  _handleType(value: number): CalendarComponentPayloadTypes {
    const date = moment(value);
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

  writeValue(obj: any): void {
    this._writeValue(obj);
    if (obj) {
      if (this._calendarMonthValue[0]) {
        this.createWeekOrMonth(this._calendarMonthValue[0].time);
      } else {
        this.createWeekOrMonth(new Date().getTime());
      }
    }
  }

  registerOnChange(fn: () => {}): void {
    this._onChanged = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this._onTouched = fn;
  }

  _writeValue(value: any): void {
    if (!value) {
      this._calendarMonthValue = [null, null];
      return;
    }

    switch (this._d.pickMode) {
      case 'single':
        this._calendarMonthValue[0] = this._createCalendarDay(value);
        break;

      case 'range':
        if (value.from) {
          this._calendarMonthValue[0] = value.from ? this._createCalendarDay(value.from) : null;
        }
        if (value.to) {
          this._calendarMonthValue[1] = value.to ? this._createCalendarDay(value.to) : null;
        }
        break;

      case 'multi':
        if (Array.isArray(value)) {
          this._calendarMonthValue = value.map(e => {
            return this._createCalendarDay(e);
          });
        } else {
          this._calendarMonthValue = [null, null];
        }
        break;

      default:
    }
  }
}
