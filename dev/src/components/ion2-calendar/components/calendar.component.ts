import {Component, ViewChild, ElementRef, ChangeDetectorRef, Renderer, Input, OnInit} from '@angular/core';
import { NavParams ,ViewController, Content, InfiniteScroll } from 'ionic-angular';

import * as moment from 'moment';

import {CalendarDay, CalendarMonth, CalendarOptions, CalendarControllerOptions, Colors} from '../calendar.model'
import { CalendarService } from "../services/calendar.service";


@Component({
    selector: 'ion-calendar',
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
          (onChange)="_onChange($event)" 
          [(ngModel)]="_date" 
          [month]="monthOpt" 
          [pickMode]="_d.pickMode"
          [color]="_d.color">

        </ion-calendar-month>

    `,

})
export class CalendarComponent implements OnInit{

    monthOpt: CalendarMonth;
    monthDate: Date = new Date();

    _d: CalendarControllerOptions;
    _date: any[] = [null, null];
    @Input() options: CalendarControllerOptions;

    constructor(
        private _renderer: Renderer,
        public _elementRef: ElementRef,
        public params: NavParams,
        public viewCtrl: ViewController,
        public ref: ChangeDetectorRef,
        public calSvc: CalendarService,
    ) {
      this._d = this.calSvc.safeOpt(this.options || {});
    }

    ionViewDidLoad() {

    }

    ngOnInit() {

        this.monthOpt = this.createMonth(moment(this._d.from).valueOf());

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

  _onChange(value) {
      console.log(value)
  }

}
