import { Component, ViewChild, ElementRef, ChangeDetectorRef, Renderer2, OnInit } from '@angular/core';
import { NavParams, ViewController, Content, InfiniteScroll } from 'ionic-angular';
import { CalendarDay, CalendarMonth, CalendarModalOptions } from '../calendar.model'
import { CalendarService } from '../services/calendar.service';
import * as moment from 'moment';
import { pickModes } from "../config";

@Component({
  selector: 'ion-calendar-modal',
  template: `
    <ion-header>
      <ion-navbar [color]="_d.color">

        <ion-buttons start>
          <button type='button' ion-button icon-only clear (click)="onCancel()">
            <span *ngIf="_d.closeLabel !== '' && !_d.closeIcon">{{_d.closeLabel}}</span>
            <ion-icon *ngIf="_d.closeIcon" name="close"></ion-icon>
          </button>
        </ion-buttons>

        <ion-title>{{_d.title}}</ion-title>

        <ion-buttons end>
          <button type='button' ion-button icon-only *ngIf="!_d.autoDone" clear [disabled]="!canDone()" (click)="done()">
            <span *ngIf="_d.doneLabel !== '' && !_d.doneIcon">{{_d.doneLabel}}</span>
            <ion-icon *ngIf="_d.doneIcon" name="checkmark"></ion-icon>
          </button>

        </ion-buttons>

      </ion-navbar>
      
      <ng-content select="[sub-header]"></ng-content>

      <ion-calendar-week
        [color]="_d.color"
        [weekArray]="_d.weekdays"
        [weekStart]="_d.weekStart">
      </ion-calendar-week>

    </ion-header>

    <ion-content (ionScroll)="onScroll($event)" class="calendar-page"
                 [ngClass]="{'multi-selection': _d.pickMode === 'multi'}">

      <div #months>
        <ng-template ngFor let-month [ngForOf]="calendarMonths" [ngForTrackBy]="trackByIndex" let-i="index">
          <div class="month-box" [attr.id]="'month-' + i">
            <h4 class="text-center month-title">{{_monthFormat(month.original.date)}}</h4>
            <ion-calendar-month [month]="month"
                                [pickMode]="_d.pickMode"
                                [isSaveHistory]="_d.isSaveHistory"
                                [id]="_d.id"
                                [color]="_d.color"
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
  `
})
export class CalendarModal implements OnInit {

  @ViewChild(Content) content: Content;
  @ViewChild('months') monthsEle: ElementRef;

  datesTemp: Array<CalendarDay> = [null, null];
  calendarMonths: Array<CalendarMonth>;
  step: number;
  showYearPicker: boolean;
  year: number;
  years: Array<number>;
  infiniteScroll: InfiniteScroll;
  _s: boolean = true;
  _d: CalendarModalOptions;
  actualFirstTime: number;

  constructor(private _renderer: Renderer2,
    public _elementRef: ElementRef,
    public params: NavParams,
    public viewCtrl: ViewController,
    public ref: ChangeDetectorRef,
    public calSvc: CalendarService) {
  }

  ngOnInit(): void {
    this.init();
    this.initDefaultDate();
  }

  ngAfterViewInit(): void {
    this.findCssClass();
    if (this._d.canBackwardsSelected)
      this.backwardsMonth();

    this.scrollToDefaultDate();
  }

  init(): void {
    this._d = this.calSvc.safeOpt(this.params.get('options'));
    this._d.showAdjacentMonthDay = false;
    this.step = this._d.step;
    if (this.step < 1) {
      this.step = 1;
    }

    this.calendarMonths = this.calSvc.createMonthsByPeriod(
      moment(this._d.from).valueOf(),
      this.findInitMonthNumber(this._d.defaultScrollTo) + this.step,
      this._d
    );

  }

  initDefaultDate(): void {
    const { pickMode, defaultDate, defaultDateRange, defaultDates } = this._d;
    switch (pickMode) {
      case pickModes.SINGLE:
        if (defaultDate) {
          this.datesTemp[0] = this.calSvc.createCalendarDay(this._getDayTime(defaultDate), this._d);
        }
        break;
      case pickModes.RANGE:
        if (defaultDateRange) {
          if (defaultDateRange.from) {
            this.datesTemp[0] = this.calSvc.createCalendarDay(this._getDayTime(defaultDateRange.from), this._d);
          }
          if (defaultDateRange.to) {
            this.datesTemp[1] = this.calSvc.createCalendarDay(this._getDayTime(defaultDateRange.to), this._d);
          }
        }
        break;
      case pickModes.MULTI:
        if (defaultDates && defaultDates.length) {
          this.datesTemp = defaultDates.map(e => this.calSvc.createCalendarDay(this._getDayTime(e), this._d));
        }
        break;
      default:
        this.datesTemp = [null, null]
    }
  }

  findCssClass(): void {
    let { cssClass } = this._d;
    if (cssClass) {
      cssClass.split(' ').forEach((_class: string) => {
        if (_class.trim() !== '') this._renderer.addClass(this._elementRef.nativeElement, _class);
      });
    }
  }

  onChange(data: any): void {
    const { pickMode, autoDone } = this._d;

    this.datesTemp = data;
    this.ref.detectChanges();

    if (pickMode !== pickModes.MULTI && autoDone && this.canDone()) {
      this.done();
    }
  }

  onCancel(): void {
    this.viewCtrl.dismiss(null, 'cancel');
  }

  done(): void {
    const { pickMode } = this._d;

    this.viewCtrl.dismiss(
      this.calSvc.wrapResult(this.datesTemp, pickMode),
      'done'
    );
  }

  canDone(): boolean {
    if (!Array.isArray(this.datesTemp)) {
      return false
    }
    const { pickMode } = this._d;

    switch (pickMode) {
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

  nextMonth(infiniteScroll: InfiniteScroll): void {
    this.infiniteScroll = infiniteScroll;
    let len = this.calendarMonths.length;
    let final = this.calendarMonths[len - 1];
    let nextTime = moment(final.original.time).add(1, 'M').valueOf();
    let rangeEnd = this._d.to ? moment(this._d.to).subtract(1, 'M') : 0;

    if (len <= 0 || (rangeEnd !== 0 && moment(final.original.time).isAfter(rangeEnd))) {
      infiniteScroll.enable(false);
      return;
    }

    this.calendarMonths.push(...this.calSvc.createMonthsByPeriod(nextTime, 1, this._d));
    infiniteScroll.complete();
  }

  backwardsMonth(): void {
    let first = this.calendarMonths[0];
    if (first.original.time <= 0) {
      this._d.canBackwardsSelected = false;
      return;
    }
    let firstTime = this.actualFirstTime = moment(first.original.time).subtract(1, 'M').valueOf();
    this.calendarMonths.unshift(...this.calSvc.createMonthsByPeriod(firstTime, 1, this._d));
    this.ref.detectChanges();
  }

  scrollToDate(date: Date): void {
    let defaultDateIndex = this.findInitMonthNumber(date);
    let monthElement = this.monthsEle.nativeElement.children[`month-${defaultDateIndex}`];
    let defaultDateMonth = monthElement ? monthElement.offsetTop : 0;

    if (defaultDateIndex === -1 || defaultDateMonth === 0) return;
    setTimeout(() => {
      this.content.scrollTo(0, defaultDateMonth, 128);
    }, 300);
  }

  scrollToDefaultDate(): void {
    this.scrollToDate(this._d.defaultScrollTo);
  }

  onScroll($event: any): void {
    if (!this._d.canBackwardsSelected) return;
    if ($event.scrollTop <= 200 && $event.directionY === "up" && this._s) {
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
    let startDate = this.actualFirstTime ? moment(this.actualFirstTime) : moment(this._d.from);
    let defaultScrollTo = moment(date);
    const isAfter: boolean = defaultScrollTo.isAfter(startDate);
    if (!isAfter) return -1;

    if (this.showYearPicker) {
      startDate = moment(new Date(this.year, 0, 1));
    }

    return defaultScrollTo.diff(startDate, 'month');
  }

  _getDayTime(date: any): number {
    return moment(moment(date).format('YYYY-MM-DD')).valueOf();
  }

  _monthFormat(date: any): string {
    let monthFormat = this._d.monthFormat.replace(/y/g, 'Y');

    // Try to use custom month text if available.
    const monthTexts = this._d.monthTexts;
    if (monthTexts && monthTexts.length === 12 && date instanceof Date) {
      const month = date.getMonth();
      const monthText = monthTexts[month];
      monthFormat = monthFormat.replace(/M+/g, `[${monthText}]`);
    }

    return moment(date).format(monthFormat);
  }

  trackByIndex(index: number, moment: CalendarMonth): number {
    return moment.original ? moment.original.time : index;
  }
}
