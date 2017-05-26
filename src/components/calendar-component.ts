import {Component, ViewChild, ElementRef, ChangeDetectorRef, Renderer} from '@angular/core';
import { NavParams ,ViewController, Content, InfiniteScroll } from 'ionic-angular';

import * as moment from 'moment';

import {CalendarOriginal, CalendarDay, CalendarMonth, CalendarOptions, SavedDatesCache} from '../calendar.model'


@Component({
    template: `
        <ion-header>
            <ion-navbar [color]="_color">

                <ion-buttons start>
                    <button ion-button clear *ngIf="closeLabel !== '' && !closeIcon" (click)="dismiss()">
                        {{closeLabel}}
                    </button>
                    <button ion-button icon-only clear *ngIf="closeLabel === '' || closeIcon" (click)="dismiss()">
                         <ion-icon name="close"></ion-icon>
                    </button>
                </ion-buttons>


                <ion-title *ngIf="showYearPicker">
                    <ion-select [(ngModel)]="year" (ngModelChange)="changedYearSelection()" interface="popover">
                        <ion-option *ngFor="let y of years" value="{{y}}">{{y}}</ion-option>
                    </ion-select>
                </ion-title>
                <ion-title *ngIf="!showYearPicker">{{title}}</ion-title>
            </ion-navbar>

            <calendar-week-title
                    [color]="_color"
                    [weekArray]="weekdaysTitle"
                    [weekStart]="weekStartDay">
            </calendar-week-title>

        </ion-header>

        <ion-content (ionScroll)="onScroll($event)" class="calendar-page" [ngClass]="{'multiSelection': !options.isRadio}">

            <div #months>
                <div *ngFor="let month of calendarMonths;let i = index;" class="month-box" [attr.id]="'month-' + i">
                    <h4 class="text-center month-title">{{month.original.date | date:monthTitleFilterStr}}</h4>
                    <div class="days-box">
                        <ion2-month [month]="month" 
                                    [isRadio]="options.isRadio" 
                                    [(history)]="_savedHistory" 
                                    [isSaveHistory]="isSaveHistory" 
                                    [id]="_id"
                                    (onChange)="dismiss($event)"
                                    [(ngModel)]="dayTemp"></ion2-month>
                        <!--<div class="days" *ngFor="let day of month.days">-->
                            <!--<button [class]="'days-btn ' + day.cssClass"-->
                                    <!--*ngIf="day"-->
                                    <!--[class.today]="day.isToday"-->
                                    <!--(click)="onSelected(day)"-->
                                    <!--[class.marked]="day.marked"-->
                                    <!--[class.on-selected]="day.selected || _savedHistory?.from === day.time || _savedHistory?.to === day.time"-->
                                    <!--[disabled]="day.disable"-->
                                    <!--[class.startSelection]="isStartSelection(day)"-->
                                    <!--[class.endSelection]="isEndSelection(day)"-->
                                    <!--[class.between]="isBetween(day)">-->
                                <!--<p>{{day.title}}</p>-->
                                <!--<small *ngIf="day.subTitle">{{day?.subTitle}}</small>-->
                            <!--</button>-->
                        <!--</div>-->
                    </div>
                </div>
            </div>

            <ion-infinite-scroll (ionInfinite)="nextMonth($event)">
                <ion-infinite-scroll-content></ion-infinite-scroll-content>
            </ion-infinite-scroll>

        </ion-content>
    `,
    styles:[
        `
            .calendar-page {
                background-color: #fbfbfb;
            }

            .month-box{
                display: inline-block;
                padding-bottom: 1em;
                border-bottom: 1px solid #f1f1f1;
            }

            .days-box {
                padding: 0.5rem;
            }

            h4 {
                font-weight: 400;
                font-size: 1.8rem;
                display: block;
                text-align: center;
                margin: 1rem 0 0;
                color: #929292;
            }
            .days:nth-of-type(7n), .days:nth-of-type(7n+1) {
                width: 15%;
            }
            .days {
                width: 14%;
                float: left;
                text-align: center;
                height: 40px;
            }
            .days .marked p{
                color: rgb(59, 151, 247);
                font-weight:500;
            }

            .days .today p {
                border-bottom: 2px solid rgb(59, 151, 247);
                padding-bottom: 2px;
            }

            .days .on-selected{
                transition: background-color .3s;
                background-color: rgb(201, 225, 250);
                border: none;
            }

            .days .on-selected p{
                color: rgb(59, 151, 247);
                font-size: 1.3em;
            }

            button.days-btn {
                border-radius: 50%;
                width: 36px;
                display: block;
                margin: 0 auto;
                height: 36px;
                background-color: transparent;
                position: relative;
                z-index:2;
            }

            button.days-btn p {
                margin:0;
                font-size: 1.2em;
                color: #333;
            }

            button.days-btn.on-selected small{
                transition: bottom .3s;
                bottom: -14px;
            }

            button.days-btn small {
                overflow: hidden;
                display: block;
                left: 0;
                right: 0;
                bottom: -5px;
                position: absolute;
                z-index:1;
                text-align: center;
                color: #3b97f7;
                font-weight: 200;
            }
        `
    ],
    selector: 'calendar-page',

})
export class CalendarComponent{
    @ViewChild(Content) content: Content;
    @ViewChild('months') monthsEle: ElementRef;
    title: string;
    closeLabel: string;
    dayTemp: Array<CalendarDay|null> = [null,null];
    calendarMonths: Array<CalendarMonth>;
    monthTitleFilterStr = '';
    weekdaysTitle:Array<string> = [];
    _s:boolean = true;
    _id:string;
    _savedHistory:SavedDatesCache|any = {};
    _color:string = 'primary';
    options: CalendarOptions;
    defaultDate:Date;
    scrollBackwards:boolean;
    weekStartDay:number = 0;
    isSaveHistory:boolean;
    countNextMonths:number;
    showYearPicker:boolean;
    year: number;
    years: Array<number>;
    infiniteScroll: InfiniteScroll;
    closeIcon: boolean;

    debug = true;

    constructor(
        public params: NavParams,
        public viewCtrl: ViewController,
        public ref: ChangeDetectorRef,
        private _renderer: Renderer,
        public _elementRef: ElementRef,

    ) {
        this.findCssClass();
        this.init();
    }

    ionViewDidLoad() {
        this.scrollToDefaultDate();

        if(this.content.enableScrollListener && this.scrollBackwards ){
            this.content.enableScrollListener();
        }
    }

    init(){
        const params = this.params;
        let startTime = moment(params.get('from')).valueOf();
        let endTime = moment(params.get('to')).valueOf();
        this.options = {
            start:startTime,
            end:endTime,
            isRadio:params.get('isRadio'),
            range_beg:startTime,
            range_end:endTime,
            daysConfig:params.get('daysConfig'),
            disableWeekdays:params.get('disableWeekdays'),
            monthTitle:params.get('monthTitle'),
        };

        this.defaultDate = params.get('defaultDate');
        this.scrollBackwards = params.get('canBackwardsSelected');
        this.weekStartDay = params.get('weekStartDay');
        this._id = params.get('id');

        this.monthTitleFilterStr = params.get('monthTitle');
        this.weekdaysTitle = params.get('weekdaysTitle');
        this.title = params.get('title');
        this.closeLabel = params.get('closeLabel');
        this.closeIcon = params.get('closeIcon');

        this.isSaveHistory = params.get('isSaveHistory');


        this.countNextMonths = (params.get('countNextMonths') || 3);
        if (this.countNextMonths < 1) {
            this.countNextMonths = 1;
        }

        this.showYearPicker = (params.get('showYearPicker') || false);

        if(this.showYearPicker) {
           this.createYearPicker(startTime, endTime)
        } else {
            this.calendarMonths = this.createMonthsByPeriod(startTime, this.findInitMonthNumber(this.defaultDate) + this.countNextMonths);
        }
    }


    createYearPicker(startTime:number, endTime:number){
        // init year array
        this.years = [];
        // getting max and be sure, it is in future (maybe parameter?)
        let maxYear = (new Date(endTime)).getFullYear();
        if(maxYear <= 1970){
            maxYear = (new Date(this.defaultDate)).getFullYear() + 10;
            this.options.end = new Date(maxYear, 12, 0).getTime();
        }
        // min year should be okay, either it will be set or something like 1970 at min
        let minYear = (new Date(startTime)).getFullYear();
        // calculating the needed years to be added to array
        let neededYears = (maxYear - minYear);
        //pushing years to selection array
        for(let y = 0; y <= neededYears; y++) {
            this.years.push(maxYear - y);
        }
        // selection-start-year of defaultDate
        this.year = this.defaultDate.getFullYear();
        let firstDayOfYear = new Date(this.year, 0, 1);
        let lastDayOfYear = new Date(this.year, 12, 0);
        // don't calc over the start / end
        if(firstDayOfYear.getTime() < this.options.start) {
            firstDayOfYear = new Date(this.options.start);
        }
        if(lastDayOfYear.getTime() > this.options.end) {
            lastDayOfYear = new Date(this.options.end);
        }
        // calcing the month
        this.calendarMonths = this.createMonthsByPeriod(firstDayOfYear.getTime(), this.findInitMonthNumber(this.defaultDate) + this.countNextMonths);
        // sets the range new

        // checking whether the start is after firstDayOfYear
        this.options.range_beg = firstDayOfYear.getTime() < startTime ? startTime :  firstDayOfYear.getTime();
        // checking whether the end is before lastDayOfYear
        this.options.range_end = lastDayOfYear.getTime() > endTime ? endTime : lastDayOfYear.getTime();
    }
    findCssClass() {
        let cssClass = this.params.get('cssClass');

        if (cssClass) {
            cssClass.split(' ').forEach( (cssClass: string) => {
                if (cssClass.trim() !== '') this._renderer.setElementClass(this._elementRef.nativeElement, cssClass, true);
            });
        }

    }

    dismiss(data: any) {
        console.log(data);

        this.viewCtrl.dismiss(data);
    }


    nextMonth(infiniteScroll: InfiniteScroll) {
        this.infiniteScroll = infiniteScroll;
        let len = this.calendarMonths.length;
        let final = this.calendarMonths[len-1];
        let nextTime = moment(final.original.time).add(1,'M').valueOf();
        let rangeEnd = this.options.range_end ? moment(this.options.range_end).subtract(1,'M') : 0;
        if(len <= 0 || ( rangeEnd !== 0 && moment(final.original.time).isAfter(rangeEnd) )) {
            infiniteScroll.enable(false);
            return;
        }

        this.calendarMonths.push(...this.createMonthsByPeriod(nextTime,1));
        infiniteScroll.complete();

    }

    backwardsMonth() {
        let first = this.calendarMonths[0];
        let firstTime =  moment(first.original.time).subtract(1,'M').valueOf();
        this.calendarMonths.unshift(...this.createMonthsByPeriod(firstTime,1));
        this.ref.detectChanges();
    }

    scrollToDefaultDate() {
        let defaultDateIndex = this.findInitMonthNumber(this.defaultDate );
        let defaultDateMonth = this.monthsEle.nativeElement.children[`month-${defaultDateIndex}`].offsetTop;

        if(defaultDateIndex === 0 || defaultDateMonth === 0) return;
        setTimeout(() => {
            this.content.scrollTo(0,defaultDateMonth,128);
        },300)
    }

    onScroll($event: any){
        if(!this.scrollBackwards) return;
        if($event.scrollTop <= 200 && this._s){
            this._s = !1;
            let lastHeight = this.content.getContentDimensions().scrollHeight;
            setTimeout( () => {
                this.backwardsMonth();
                let nowHeight = this.content.getContentDimensions().scrollHeight;
                this.content.scrollTo(0,nowHeight-lastHeight,0)
                    .then(() => {
                        this._s = !0;
                    })
            },180)
        }
    }

    findDayConfig(day:any): any {
        if(this.options.daysConfig.length <= 0) return null;
        return this.options.daysConfig.find((n) => day.isSame(n.date,'day'))
    }

    createOriginalCalendar(time: number): CalendarOriginal {
        let _year = new Date(time).getFullYear();
        let _month = new Date(time).getMonth();
        let _firstWeek = new Date(_year,_month,1).getDay();
        let _howManyDays = moment(time).daysInMonth();

        return {
            time:time,
            date:new Date(time),
            year:_year,
            month:_month,
            firstWeek:_firstWeek,
            howManyDays:_howManyDays
        }
    }

    createCalendarDay (time: number): CalendarDay {
        let _time = moment(time);
        let isToday = moment().isSame(_time, 'days');
        let dayConfig = this.findDayConfig(_time);
        let _rangeBeg = this.options.range_beg;
        let _rangeEnd = this.options.range_end;
        let isBetween = true;
        let disableWee = this.options.disableWeekdays.indexOf(_time.toDate().getDay()) !== -1;
        if(_rangeBeg > 0 && _rangeEnd > 0){
            if (!this.scrollBackwards ){
                isBetween = !_time.isBetween(_rangeBeg, _rangeEnd,'days','[]');
            }else {
                isBetween = moment(_time).isBefore(_rangeBeg) ? false : isBetween;
            }
        }else if (_rangeBeg > 0 && _rangeEnd === 0){


            if (!this.scrollBackwards ){
                let _addTime = _time.add('day',1);
                isBetween = !_addTime.isAfter(_rangeBeg);
            }else {
                isBetween = false;
            }
        }

        let _disable = disableWee || isBetween;

        return {
            time: time,
            isToday: isToday,
            selected: false,
            marked: dayConfig ? dayConfig.marked || false : false,
            cssClass: dayConfig ? dayConfig.cssClass || '' : '',
            disable: dayConfig ? dayConfig.disable || _disable : _disable,
            title : dayConfig ? dayConfig.title || new Date(time).getDate().toString() : new Date(time).getDate().toString(),
            subTitle: dayConfig ? dayConfig.subTitle || '' : ''
        }
    }

    createCalendarMonth(original: CalendarOriginal): CalendarMonth {
        let days:Array<CalendarDay> = new Array(6).fill(null);
        let len = original.howManyDays;

        for(let i = original.firstWeek ; i < len+original.firstWeek; i++){
            let itemTime = new Date(original.year,original.month,i - original.firstWeek+1).getTime();
            days[i] = this.createCalendarDay(itemTime);
        }


        let weekStartDay = this.weekStartDay;

        if(weekStartDay === 1){
            if(days[0] === null){
                days.shift();
                days.push(...new Array(1).fill(null));
            }else {
                days.unshift(null);
                days.pop();
            }
        }

        return {
            original: original,
            days: days
        }

    }

    createMonthsByPeriod(startTime: number, monthsNum: number): Array<CalendarMonth> {
        let _array:Array<CalendarMonth> = [];

        let _start = new Date(startTime);
        let _startMonth = new Date(_start.getFullYear(),_start.getMonth(),1).getTime();

        for(let i = 0; i < monthsNum; i++ ){
            let time = moment(_startMonth).add(i,'M').valueOf();
            let originalCalendar = this.createOriginalCalendar(time);
            _array.push(this.createCalendarMonth(originalCalendar))
        }

        return _array;
    }

    findInitMonthNumber(date: Date): number {
        let startDate = moment(this.options.start);
        let defaultDate = moment(date);
        const isAfter:boolean = defaultDate.isAfter(startDate);
        if(!isAfter) return 0;

        if(this.showYearPicker){
            startDate = moment(new Date(this.year, 0, 1));
        }


        return  defaultDate.diff(startDate, 'month');
    }

    changedYearSelection(){
        // re-enabling infinite scroll
        if(this.infiniteScroll !== undefined){
            this.infiniteScroll.enable(true);
        }
        // getting first day and last day of the year
        let firstDayOfYear = new Date(this.year, 0, 1);
        let lastDayOfYear = new Date(this.year, 12, 0);
        // don't calc over the start / end
        if(firstDayOfYear.getTime() < this.options.start) {
            firstDayOfYear = new Date(this.options.start);
        }
        if(lastDayOfYear.getTime() > this.options.end) {
            lastDayOfYear = new Date(this.options.end);
        }
        // sets the range new
        // checking whether the start is after firstDayOfYear
        this.options.range_beg = firstDayOfYear.getTime() < this.options.start ? this.options.start :  firstDayOfYear.getTime();
        // checking whether the end is before lastDayOfYear
        this.options.range_end = lastDayOfYear.getTime() > this.options.end ? this.options.end : lastDayOfYear.getTime();
        // calcing the months
        let monthCount = (this.findInitMonthNumber(firstDayOfYear) + this.countNextMonths);
        this.calendarMonths = this.createMonthsByPeriod(firstDayOfYear.getTime(), monthCount <= 1 ? 3 : monthCount );
        // scrolling to the top
        setTimeout(() => {
            this.content.scrollTo(0, 0, 128);
        }, 300)
    }

}
