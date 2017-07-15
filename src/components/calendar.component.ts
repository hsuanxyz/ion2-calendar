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
            <div ion-button clear class="back">
                <ion-icon name="ios-arrow-back"></ion-icon>
            </div>
            <div ion-button clear class="forward">
                <ion-icon name="ios-arrow-forward"></ion-icon>
            </div>
        </div>

        <ion-calendar-week color="light"
                           [weekStart]="weekStartDay">
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
    @Input() weekStartDay: number = 0;
    @Input() disableWeekdays: Array<number> = [];
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
        this.monthOpt = this.createMonth()
    }

    createMonth(date?: any) {
        if(!moment.isDate(date)){
            date = this.monthDate
        }
        date = new Date(date);
        return this.calSvc.createMonthsByPeriod(
            date.getTime(),
            1,
            this.calSvc.safeOpt({
                from: date,
                weekStartDay: this.weekStartDay,
                disableWeekdays: this.disableWeekdays,
            }),
        )[0];
    }

}
