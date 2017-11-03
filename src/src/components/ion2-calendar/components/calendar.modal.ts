import { Component, ViewChild, ElementRef, ChangeDetectorRef, Renderer } from '@angular/core';
import { NavParams, ViewController, Content, InfiniteScroll } from 'ionic-angular';
import { CalendarDay, CalendarMonth, PrivateCalendarOptions, CalendarModalOptions } from '../calendar.model'
import { CalendarService } from '../services/calendar.service';
import * as moment from 'moment';
import { defaults, pickModes } from "../config";

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
            <h4 class="text-center month-title">{{_monthFormat(month.original.date)}}</h4>
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
  weekdays: Array<string> = [];
  defaultScrollTo: Date;
  scrollBackwards: boolean;
  weekStart: number = 0;
  isSaveHistory: boolean;
  step: number;
  showYearPicker: boolean;
  year: number;
  years: Array<number>;
  infiniteScroll: InfiniteScroll;
  options: PrivateCalendarOptions;

  debug = true;

  _s: boolean = true;
  _id: string;
  _color: string = defaults.COLOR;
  _d: CalendarModalOptions;

  constructor(private _renderer: Renderer,
              public _elementRef: ElementRef,
              public params: NavParams,
              public viewCtrl: ViewController,
              public ref: ChangeDetectorRef,
              public calSvc: CalendarService,) {
    this.init();
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
    this.weekdays = this._d.weekdays;
    this.title = this._d.title;
    this.closeLabel = this._d.closeLabel;
    this.closeIcon = this._d.closeIcon;
    this.doneLabel = this._d.doneLabel;
    this.doneIcon = this._d.doneIcon;

    this.isSaveHistory = this._d.isSaveHistory;


    this.step = this._d.step;
    if (this.step < 1) {
      this.step = 1;
    }

    this.calendarMonths = this.calSvc.createMonthsByPeriod(
      startTime,
      this.findInitMonthNumber(this.defaultScrollTo) + this.step,
      this._d,
    );

  }

  initDefaultDate() {
    switch (this._d.pickMode) {
      case pickModes.SINGLE:
        if (this._d.defaultDate) {
          this.datesTemp[0] = this.calSvc.createCalendarDay(this._getDayTime(this._d.defaultDate), this._d);
        }
        break;
      case pickModes.RANGE:
        if (this._d.defaultDateRange) {
          if (this._d.defaultDateRange.from) {
            this.datesTemp[0] = this.calSvc.createCalendarDay(this._getDayTime(this._d.defaultDateRange.from), this._d);
          }
          if (this._d.defaultDateRange.to) {
            this.datesTemp[1] = this.calSvc.createCalendarDay(this._getDayTime(this._d.defaultDateRange.to), this._d);
          }
        }
        break;
      case pickModes.MULTI:
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
    this.ref.detectChanges();

    if (this._d.pickMode !== pickModes.MULTI && this._d.autoDone && this.canDone()) {
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
      case pickModes.SINGLE:
        return !!(this.datesTemp[0] && this.datesTemp[0].time);
      case pickModes.RANGE:
        return !!(this.datesTemp[0] && this.datesTemp[1]) && !!(this.datesTemp[0].time && this.datesTemp[1].time);
      case pickModes.MULTI:
        return this.datesTemp.length > 0 && this.datesTemp.every(e => !!e && !!e.time);
      default:
        return false;
    }

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

  _getDayTime(date: any): number {
    return moment(moment(date).format('YYYY-MM-DD')).valueOf();
  }

  _monthFormat(date: any): string {
    return moment(date).format('MMM YYYY')
  }
}
