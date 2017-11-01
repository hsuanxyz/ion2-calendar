import { Component, ViewChild, ElementRef, ChangeDetectorRef, Renderer } from '@angular/core';
import { NavParams, ViewController, Content, InfiniteScroll } from 'ionic-angular';
import { CalendarDay, CalendarMonth, PrivateCalendarOptions, CalendarModalOptions } from '../calendar.model'
import { CalendarService } from '../services/calendar.service';
import * as moment from 'moment';

@Component({
  selector: 'ion-calendar-modal',
  template: `
    <ion-header>

      <ion-navbar [color]="_color">

        <!--<ion-buttons start [hidden]="!showYearPicker">-->
        <!--<ion-select [(ngModel)]="year" (ngModelChange)="changedYearSelection()" interface="popover">-->
        <!--<ion-option *ngFor="let y of years" value="{{y}}">{{y}}</ion-option>-->
        <!--</ion-select>-->
        <!--</ion-buttons>-->

        <ion-buttons start>
          <button type='button' ion-button icon-only clear (click)="onCancel()">
            <span *ngIf="closeLabel !== '' && !closeIcon">{{closeLabel}}</span>
            <ion-icon *ngIf="closeIcon" name="close"></ion-icon>
          </button>
        </ion-buttons>

        <ion-title>{{title}}</ion-title>

        <ion-buttons end>
          <button type='button' ion-button icon-only *ngIf="!_d.autoDone" clear [disabled]="!canDone()" (click)="done()">
            <span *ngIf="doneLabel !== '' && !doneIcon">{{doneLabel}}</span>
            <ion-icon *ngIf="doneIcon" name="checkmark"></ion-icon>
          </button>

        </ion-buttons>

      </ion-navbar>

      <ion-calendar-week
        [color]="_color"
        [weekArray]="weekdays"
        [weekStart]="weekStart">
      </ion-calendar-week>

    </ion-header>

    <ion-content (ionScroll)="onScroll($event)" class="calendar-page"
                 [ngClass]="{'multi-selection': options.pickMode === 'multi'}">

      <div #months>
        <ng-template ngFor let-month [ngForOf]="calendarMonths" [ngForTrackBy]="trackByTime" let-i="index">
          <div class="month-box" [attr.id]="'month-' + i">
            <h4 class="text-center month-title">{{month.original.date | date:monthFormatFilterStr}}</h4>
            <ion-calendar-month [month]="month"
                                [pickMode]="options.pickMode"
                                [isSaveHistory]="isSaveHistory"
                                [id]="_id"
                                [color]="_color"
                                (onChange)="onChange($event)"
                                [(ngModel)]="datesTemp">

            </ion-calendar-month>
          </div>
        </ng-template>

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
  monthFormatFilterStr = '';
  weekdays: Array<string> = [];
  defaultScrollTo: Date;
  scrollBackwards: boolean;
  weekStart: number = 0;
  isSaveHistory: boolean;
  countNextMonths: number;
  showYearPicker: boolean;
  year: number;
  years: Array<number>;
  infiniteScroll: InfiniteScroll;
  options: PrivateCalendarOptions;

  debug = true;

  _s: boolean = true;
  _id: string;
  _color: string = 'primary';
  _d: CalendarModalOptions;

  constructor(private _renderer: Renderer,
              public _elementRef: ElementRef,
              public params: NavParams,
              public viewCtrl: ViewController,
              public ref: ChangeDetectorRef,
              public calSvc: CalendarService,) {
    this.init();
    this.getHistory();
    this.initDefaultDate();
  }

  ionViewDidLoad() {
    this.findCssClass();
    this.scrollToDefaultDate();
  }

  init() {
    const params = this.params;

    this._d = this.calSvc.safeOpt(params.get('options'));
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
      disableWeeks: params.get('disableWeeks'),
      monthFormat: params.get('monthFormat'),
    };

    this.defaultScrollTo = this._d.defaultScrollTo;
    this.scrollBackwards = this._d.canBackwardsSelected;
    this.weekStart = this._d.weekStart;
    this._id = this._d.id;
    this._color = this._d.color;

    this.monthFormatFilterStr = this._d.monthFormat;
    this.weekdays = this._d.weekdays;
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
        this.findInitMonthNumber(this.defaultScrollTo) + this.countNextMonths,
        this._d,
      );
    }
  }

  initDefaultDate() {
    switch (this._d.pickMode) {
      case 'single':
        if (this._d.defaultDate) {
          this.datesTemp[0] = this.calSvc.createCalendarDay(this._getDayTime(this._d.defaultDate), this._d);
        }
        break;
      case 'range':
        if (this._d.defaultDateRange) {
          if (this._d.defaultDateRange.from) {
            this.datesTemp[0] = this.calSvc.createCalendarDay(this._getDayTime(this._d.defaultDateRange.from), this._d);
          }
          if (this._d.defaultDateRange.to) {
            this.datesTemp[1] = this.calSvc.createCalendarDay(this._getDayTime(this._d.defaultDateRange.to), this._d);
          }
        }
        break;
      case 'multi':
        if (this._d.defaultDates && this._d.defaultDates.length) {
          this.datesTemp = this._d.defaultDates.map(e => this.calSvc.createCalendarDay(this._getDayTime(e), this._d));
        }
        break;
      default:
        this.datesTemp = [null, null]
    }
  }

  findCssClass() {
    let { cssClass } = this._d;
    if (cssClass) {
      cssClass.split(' ').forEach((cssClass: string) => {
        if (cssClass.trim() !== '') this._renderer.setElementClass(this._elementRef.nativeElement, cssClass, true);
      });
    }

  }

  onChange(data: any) {
    this.datesTemp = data;
    this.calSvc.savedHistory(data, this._id);
    this.ref.detectChanges();

    if (this._d.pickMode !== 'multi' && this._d.autoDone && this.canDone()) {
      this.done();
    }
  }

  onCancel() {
    this.viewCtrl.dismiss(null, 'cancel');
  }

  done() {
    this.viewCtrl.dismiss(
      this.calSvc.wrapResult(this.datesTemp, this._d.pickMode),
      'done'
    );
  }

  canDone(): boolean {
    if (!Array.isArray(this.datesTemp)) {
      return false
    }

    switch (this._d.pickMode) {
      case 'single':
        return !!(this.datesTemp[0] && this.datesTemp[0].time);
      case 'range':
        return !!(this.datesTemp[0] && this.datesTemp[1]) && !!(this.datesTemp[0].time && this.datesTemp[1].time);
      case 'multi':
        return this.datesTemp.length > 0 && this.datesTemp.every(e => !!e && !!e.time);
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
      maxYear = (new Date(this.defaultScrollTo)).getFullYear() + 10;
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
    // selection-start-year of defaultScrollTo
    this.year = this.defaultScrollTo.getFullYear();
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
      this.findInitMonthNumber(this.defaultScrollTo) + this.countNextMonths,
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
    let defaultDateIndex = this.findInitMonthNumber(this.defaultScrollTo);
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
    let defaultScrollTo = moment(date);
    const isAfter: boolean = defaultScrollTo.isAfter(startDate);
    if (!isAfter) return 0;

    if (this.showYearPicker) {
      startDate = moment(new Date(this.year, 0, 1));
    }


    return defaultScrollTo.diff(startDate, 'month');
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

  _getDayTime(date: any): number {
    return moment(moment(date).format('YYYY-MM-DD')).valueOf();
  }
}
