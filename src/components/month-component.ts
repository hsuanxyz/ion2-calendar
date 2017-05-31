import { Component, ChangeDetectorRef, Input, Output, EventEmitter, OnInit, forwardRef } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

import {CalendarDay, CalendarMonth, SavedDatesCache} from '../calendar.model'

export const MONTH_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MonthComponent),
    multi: true,
};

@Component({
    selector: 'ion2-month',
    providers: [MONTH_VALUE_ACCESSOR],
    template: `        
        <ng-template *ngIf="isRadio">
            <div class="days-box">
                <div class="days" *ngFor="let day of month.days">
                    <button [class]="'days-btn ' + day.cssClass"
                            *ngIf="day"
                            [class.today]="day.isToday"
                            (click)="onSelected(day)"
                            [class.marked]="day.marked"
                            [class.on-selected]="day.selected || history?.from === day.time || history?.to === day.time"
                            [disabled]="day.disable">
                        <p>{{day.title}}</p>
                        <small *ngIf="day.subTitle">{{day?.subTitle}}</small>
                    </button>
                </div>
            </div>
        </ng-template>
        <ng-template *ngIf="!isRadio">
            <div class="days-box">
                <div class="days" *ngFor="let day of month.days">
                    <button [class]="'days-btn ' + day.cssClass"
                            *ngIf="day"
                            [class.today]="day.isToday"
                            (click)="onSelected(day)"
                            [class.marked]="day.marked"
                            [class.on-selected]="day.selected || history?.from === day.time || history?.to === day.time"
                            [disabled]="day.disable"
                            [class.startSelection]="isStartSelection(day)"
                            [class.endSelection]="isEndSelection(day)"
                            [class.between]="isBetween(day)">
                        <p>{{day.title}}</p>
                        <small *ngIf="day.subTitle">{{day?.subTitle}}</small>
                    </button>
                </div>
            </div>
        </ng-template>

    `,
    styles:[
            `
            .month-box{
                display: inline-block;
                padding-bottom: 1em;
                border-bottom: 1px solid #f1f1f1;
            }

            .days-box {
                padding: 0.5rem;
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
        `,
    ],
})
export class MonthComponent implements ControlValueAccessor, OnInit{

    @Input() month: CalendarMonth;
    @Input() isRadio: boolean;
    @Input() history: SavedDatesCache|any = {};
    @Input() isSaveHistory: boolean;
    @Input() id: any;

    @Output() onChange: EventEmitter<any> = new EventEmitter();

    _date: Array<CalendarDay|null> = [null,null];
    _onChanged: Function;
    _onTouched: Function;
    constructor(
        public ref: ChangeDetectorRef,
    ) {
    }

    ngOnInit() {
        if(this.isSaveHistory) {
            this.history = this.savedHistory || {};
        }
    }

    writeValue(obj: any): void {
        this._date = obj;
    }

    registerOnChange(fn: any): void {
        this._onChanged = fn;
    }

    registerOnTouched(fn: any): void {
        this._onTouched = fn;
    }

    isEndSelection(day: CalendarDay): boolean {
        if(this.isRadio) {
            return false;
        }
        if(this.history.to === day.time){
            return true;
        }
        if(!day.selected){
            return false;
        }
        return this._date.indexOf(day) === 1 && this.history.from !== day.time;
    }

    isBetween(day: CalendarDay): boolean {
        if(this.isRadio || !this._date) {
            return false;
        }
        if(day.time > this.history.from || (this._date[0] !== null && day.time > this._date[0].time)){
            if(day.time < this.history.to || (this._date[1] !== null && day.time < this._date[1].time)){
                return true;
            }
        }
        return false;
    }

    isStartSelection(day: CalendarDay): boolean {
        if(this.isRadio) {
            return false;
        }
        if(this.history.from === day.time){
            return true;
        }
        if(!day.selected){
            return false;
        }
        return this._date.indexOf(day) === 0 && this.history.to !== day.time;
    }

    get savedHistory(): SavedDatesCache|null {
        const _savedDatesCache = localStorage.getItem(`ion-calendar-${this.id}`);
        const _savedDates = <any>JSON.parse(_savedDatesCache);
        return <SavedDatesCache>_savedDates
    }

    set savedHistory(savedDates: SavedDatesCache) {
        localStorage.setItem(`ion-calendar-${this.id}`, JSON.stringify(savedDates));
    }

    onSelected(item: any) {
        item.selected = true;
        this.ref.detectChanges();
        if(this.isRadio) {
            this.savedHistory = <SavedDatesCache> {
                type: 'radio',
                id: this.id,
                from: item.time,
                to:0,
            };

            if(this.isSaveHistory) {
                this.history = this.savedHistory;
            }

            this.onChange.emit(item);

            return;
        }

        if(!this._date[0]) {
            this._date[0] = item;

            if(this.isSaveHistory) {
                if(this.history.to !== null) {
                    if(this._date[0].time > this.history.to){
                        this.history.to = this._date[0].time;
                    } else {
                        this.history.from = this._date[0].time
                    }
                } else {
                    this.history.from = this._date[0].time
                }

                this.ref.detectChanges();
            }

        }else if(!this._date[1]) {
            if(this._date[0].time < item.time){
                this._date[1] = item;
            }else {
                this._date[1] = this._date[0];
                this._date[0] = item;
            }


            if(this.isSaveHistory) {
                this.savedHistory = <SavedDatesCache>{
                    type: 'radio',
                    id: this.id,
                    from: this._date[0].time,
                    to: this._date[1].time,
                };
                this.history = this.savedHistory;
            }

            this.ref.detectChanges();

            this.onChange.emit({
                from:this._date[0],
                to:this._date[1],
            });

        }else {
            this._date[0].selected = false;
            this._date[0] = item;
            this._date[1].selected = false;
            this._date[1] = null;
            this.ref.detectChanges();
        }
    }

}
