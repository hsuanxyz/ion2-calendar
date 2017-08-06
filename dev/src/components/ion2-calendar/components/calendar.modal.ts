import {Component, ViewChild, ElementRef, ChangeDetectorRef, Renderer} from '@angular/core';
import {NavParams, ViewController, Content, InfiniteScroll} from 'ionic-angular';

import * as moment from 'moment';

import {CalendarDay, CalendarMonth, CalendarOptions, CalendarControllerOptions} from '../calendar.model'
import {CalendarService} from '../services/calendar.service';


@Component({
  selector: 'ion-calendar-modal',
  template: `
    <ion-header>

      <ion-navbar [color]="_color">

        <ion-buttons start [hidden]="!showYearPicker">
          <ion-select [(ngModel)]="year" (ngModelChange)="changedYearSelection()" interface="popover">
            <ion-option *ngFor="let y of years" value="{{y}}">{{y}}</ion-option>
          </ion-select>
        </ion-buttons>

        <ion-title>{{title}}</ion-title>

        <ion-buttons end>
          <button ion-button clear (click)="onCancel()">
            <span *ngIf="closeLabel !== '' && !closeIcon">{{closeLabel}}</span>
            <ion-icon *ngIf="closeIcon" name="close"></ion-icon>
          </button>
          <button ion-button *ngIf="!_d.autoDone" clear [disabled]="!canDone()" (click)="done()">
            <span *ngIf="doneLabel !== '' && !doneIcon">{{doneLabel}}</span>
            <ion-icon *ngIf="doneIcon" name="checkmark"></ion-icon>
          </button>
        </ion-buttons>

      </ion-navbar>

      <ion-calendar-week
        [color]="_color"
        [weekArray]="weekdaysTitle"
        [weekStart]="weekStartDay">
      </ion-calendar-week>

    </ion-header>

    <ion-content (ionScroll)="onScroll($event)" class="calendar-page" [ngClass]="{'multi-selection': options.pickMode === 'multi'}">

      <div #months>
        <div *ngFor="let month of calendarMonths;let i = index;" class="month-box" [attr.id]="'month-' + i">
          <h4 class="text-center month-title">{{month.original.date | date:monthTitleFilterStr}}</h4>
          <ion-calendar-month [month]="month"
                              [pickMode]="options.pickMode"
                              [isSaveHistory]="isSaveHistory"
                              [id]="_id"
                              [color]="_color"
                              (onChange)="onChange($event)"
                              [(ngModel)]="datesTemp">

          </ion-calendar-month>
        </div>
      </div>

      <ion-infinite-scroll (ionInfinite)="nextMonth($event)">
        <ion-infinite-scroll-content></ion-infinite-scroll-content>
      </ion-infinite-scroll>

    </ion-content>
  `,

})
export class CalendarModal {
  @ViewChild(Content) content: Content;
  @ViewChild('months') monthsEle: ElementRef;

  title: string;
  closeLabel: string;
  closeIcon: boolean;
  doneLabel: string;
  doneIcon: boolean;
  datesTemp: Array<CalendarDay | null> = [null, null];
  calendarMonths: Array<CalendarMonth>;
  monthTitleFilterStr = '';
  weekdaysTitle: Array<string> = [];
  defaultDate: Date;
  scrollBackwards: boolean;
  weekStartDay: number = 0;
  isSaveHistory: boolean;
  countNextMonths: number;
  showYearPicker: boolean;
  year: number;
  years: Array<number>;
  infiniteScroll: InfiniteScroll;
  options: CalendarOptions;

  debug = true;

  _s: boolean = true;
  _id: string;
  _color: string = 'primary';
  _d: CalendarControllerOptions;

  constructor(private _renderer: Renderer,
              public _elementRef: ElementRef,
              public params: NavParams,
              public viewCtrl: ViewController,
              public ref: ChangeDetectorRef,
              public calSvc: CalendarService,) {
    this.findCssClass();
    this.init();
    this.getHistory();
  }

  ionViewDidLoad() {
    this.scrollToDefaultDate();
  }

  init() {
    const params = this.params;

    this._d = params.get('options');
    let startTime = moment(this._d.from).valueOf();
    let endTime = moment(this._d.to).valueOf();

    this.options = {
      start: startTime,
      end: endTime,
      isRadio: params.get('isRadio'),
      pickMode: this._d.pickMode,
      range_beg: startTime,
      range_end: endTime,
      daysConfig: params.get('daysConfig'),
      disableWeekdays: params.get('disableWeekdays'),
      monthTitle: params.get('monthTitle'),
    };

    this.defaultDate = this._d.defaultDate;
    this.scrollBackwards = this._d.canBackwardsSelected;
    this.weekStartDay = this._d.weekStartDay;
    this._id = this._d.id;
    this._color = this._d.color;

    this.monthTitleFilterStr = this._d.monthTitle;
    this.weekdaysTitle = this._d.weekdaysTitle;
    this.title = this._d.title;
    this.closeLabel = this._d.closeLabel;
    this.closeIcon = this._d.closeIcon;
    this.doneLabel = this._d.doneLabel;
    this.doneIcon = this._d.doneIcon;

    this.isSaveHistory = this._d.isSaveHistory;


    this.countNextMonths = this._d.countNextMonths;
    if (this.countNextMonths < 1) {
      this.countNextMonths = 1;
    }

    this.showYearPicker = this._d.showYearPicker;

    if (this.showYearPicker) {
      this.createYearPicker(startTime, endTime)
    } else {
      this.calendarMonths = this.calSvc.createMonthsByPeriod(
        startTime,
        this.findInitMonthNumber(this.defaultDate) + this.countNextMonths,
        this._d,
      );
    }
  }

  findCssClass() {
    let cssClass = this.params.get('cssClass');

    if (cssClass) {
      cssClass.split(' ').forEach((cssClass: string) => {
        if (cssClass.trim() !== '') this._renderer.setElementClass(this._elementRef.nativeElement, cssClass, true);
      });
    }

  }

  onChange(data: any) {
    this.calSvc.savedHistory(data, this._id);
    this.ref.detectChanges();

    if (this._d.autoDone && this.canDone()) {
      this.done();
    }
  }

  onCancel() {
    this.viewCtrl.dismiss();
  }

  done() {
    this.viewCtrl.dismiss(this.datesTemp);
  }

  canDone(): boolean {
    if (!Array.isArray(this.datesTemp)) {
      return false
    }

    switch (this._d.pickMode) {
      case 'single':
        return !!(this.datesTemp[0] && this.datesTemp[0].time);
      case 'range':
        return !!(this.datesTemp[0] && this.datesTemp[1]) && !!( this.datesTemp[0].time && this.datesTemp[1].time);
      case 'multi':
        return this.datesTemp.every(e => !!e && !!e.time);
      default:
        return false;
    }

  }

  getHistory() {
    if (this.isSaveHistory) {
      this.datesTemp = this.calSvc.getHistory(this._id);
    }
  }

  createYearPicker(startTime: number, endTime: number) {
    // init year array
    this.years = [];
    // getting max and be sure, it is in future (maybe parameter?)
    let maxYear = (new Date(endTime)).getFullYear();

    if (maxYear <= 1970) {
      maxYear = (new Date(this.defaultDate)).getFullYear() + 10;
      this.options.end = new Date(maxYear, 12, 0).getTime();
    }

    // min year should be okay, either it will be set or something like 1970 at min
    let minYear = (new Date(startTime)).getFullYear();

    // calculating the needed years to be added to array
    let neededYears = (maxYear - minYear);

    // pushing years to selection array
    for (let y = 0; y <= neededYears; y++) {
      this.years.push(maxYear - y);
    }

    this.years.reverse();
    // selection-start-year of defaultDate
    this.year = this.defaultDate.getFullYear();
    let firstDayOfYear = new Date(this.year, 0, 1);
    let lastDayOfYear = new Date(this.year, 12, 0);

    // don't calc over the start / end
    if (firstDayOfYear.getTime() < this.options.start) {
      firstDayOfYear = new Date(this.options.start);
    }

    if (lastDayOfYear.getTime() > this.options.end) {
      lastDayOfYear = new Date(this.options.end);
    }
    // calcing the month
    this.calendarMonths = this.calSvc.createMonthsByPeriod(
      firstDayOfYear.getTime(),
      this.findInitMonthNumber(this.defaultDate) + this.countNextMonths,
      this._d);
    // sets the range new

    // checking whether the start is after firstDayOfYear
    this.options.range_beg = firstDayOfYear.getTime() < startTime ? startTime : firstDayOfYear.getTime();
    // checking whether the end is before lastDayOfYear
    this.options.range_end = lastDayOfYear.getTime() > endTime ? endTime : lastDayOfYear.getTime();
  }


  nextMonth(infiniteScroll: InfiniteScroll) {
    this.infiniteScroll = infiniteScroll;
    let len = this.calendarMonths.length;
    let final = this.calendarMonths[len - 1];
    let nextTime = moment(final.original.time).add(1, 'M').valueOf();
    let rangeEnd = this.options.range_end ? moment(this.options.range_end).subtract(1, 'M') : 0;

    if (len <= 0 || ( rangeEnd !== 0 && moment(final.original.time).isAfter(rangeEnd) )) {
      infiniteScroll.enable(false);
      return;
    }

    this.calendarMonths.push(...this.calSvc.createMonthsByPeriod(nextTime, 1, this._d));
    infiniteScroll.complete();

  }

  backwardsMonth() {
    let first = this.calendarMonths[0];
    let firstTime = moment(first.original.time).subtract(1, 'M').valueOf();
    this.calendarMonths.unshift(...this.calSvc.createMonthsByPeriod(firstTime, 1, this._d));
    this.ref.detectChanges();
  }

  scrollToDefaultDate() {
    let defaultDateIndex = this.findInitMonthNumber(this.defaultDate);
    let defaultDateMonth = this.monthsEle.nativeElement.children[`month-${defaultDateIndex}`].offsetTop;

    if (defaultDateIndex === 0 || defaultDateMonth === 0) return;
    setTimeout(() => {
      this.content.scrollTo(0, defaultDateMonth, 128);
    }, 300)
  }

  onScroll($event: any) {
    if (!this.scrollBackwards) return;
    if ($event.scrollTop <= 200 && this._s) {
      this._s = !1;
      let lastHeight = this.content.getContentDimensions().scrollHeight;
      setTimeout(() => {
        this.backwardsMonth();
        let nowHeight = this.content.getContentDimensions().scrollHeight;
        this.content.scrollTo(0, nowHeight - lastHeight, 0)
          .then(() => {
            this._s = !0;
          })
      }, 180)
    }
  }

  findInitMonthNumber(date: Date): number {
    let startDate = moment(this.options.start);
    let defaultDate = moment(date);
    const isAfter: boolean = defaultDate.isAfter(startDate);
    if (!isAfter) return 0;

    if (this.showYearPicker) {
      startDate = moment(new Date(this.year, 0, 1));
    }


    return defaultDate.diff(startDate, 'month');
  }

  changedYearSelection() {
    // re-enabling infinite scroll
    if (this.infiniteScroll !== undefined) {
      this.infiniteScroll.enable(true);
    }
    // getting first day and last day of the year
    let firstDayOfYear = new Date(this.year, 0, 1);
    let lastDayOfYear = new Date(this.year, 12, 0);
    // don't calc over the start / end
    if (firstDayOfYear.getTime() < this.options.start) {
      firstDayOfYear = new Date(this.options.start);
    }
    if (lastDayOfYear.getTime() > this.options.end) {
      lastDayOfYear = new Date(this.options.end);
    }
    // sets the range new
    // checking whether the start is after firstDayOfYear
    this.options.range_beg = firstDayOfYear.getTime() < this.options.start ? this.options.start : firstDayOfYear.getTime();
    // checking whether the end is before lastDayOfYear
    this.options.range_end = lastDayOfYear.getTime() > this.options.end ? this.options.end : lastDayOfYear.getTime();
    // calcing the months
    let monthCount = (this.findInitMonthNumber(firstDayOfYear) + this.countNextMonths);
    this.calendarMonths = this.calSvc.createMonthsByPeriod(firstDayOfYear.getTime(), monthCount <= 1 ? 3 : monthCount, this._d);
    // scrolling to the top
    setTimeout(() => {
      this.content.scrollTo(0, 0, 128);
    }, 300)
  }

}
