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
                {{monthOpt.original.time | date: titleFormat}}
            </div>
            <div ion-button clear class="back" (click)="backMonth()">
                <ion-icon name="ios-arrow-back"></ion-icon>
            </div>
            <div ion-button clear class="forward" (click)="nextMonth()">
                <ion-icon name="ios-arrow-forward"></ion-icon>
            </div>
        </div>

        <ion-calendar-week color="light"
                           [weekStart]="weekStart">
        </ion-calendar-week>

        <ion-calendar-month [month]="monthOpt" [color]="color">

        </ion-calendar-month>

    `,

})
export class CalendarComponent implements OnInit{

    monthOpt: CalendarMonth;
    monthDate: Date = new Date();

    @Input() color: Colors = 'primary';
    @Input() titleFormat = 'MMM yyyy';
    @Input() weekStart: number = 0;
    @Input() disableWeekdays: Array<number> = [];
    @Input() from: number = new Date().getTime();
    constructor(
        private _renderer: Renderer,
        public _elementRef: ElementRef,
        public params: NavParams,
        public viewCtrl: ViewController,
        public ref: ChangeDetectorRef,
        public calSvc: CalendarService,

    ) {

    }

    ionViewDidLoad() {

    }

    ngOnInit() {

        if(!moment.isDate(new Date(this.from))){
            this.from = new Date().getTime();
            console.warn('form is not a Date type')
        }else {
            this.from = moment(this.from).valueOf();
        }

        this.monthOpt = this.createMonth();

    }

    createMonth(date: number = this.from) {

        return this.calSvc.createMonthsByPeriod(
            date,
            1,
            this.calSvc.safeOpt({
                from: new Date(date),
                weekStart: this.weekStart,
                disableWeekdays: this.disableWeekdays
            }),
        )[0];
    }

    nextMonth() {
        this.from = moment(this.from).add(1, 'months').valueOf();
        this.monthOpt = this.createMonth();
    }

    backMonth() {
        this.from = moment(this.from).subtract(1, 'months').valueOf();
        this.monthOpt = this.createMonth();
    }

}
