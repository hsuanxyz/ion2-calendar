import { Component, ChangeDetectorRef, Input, Output, EventEmitter, OnInit, forwardRef } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

import { CalendarDay, CalendarMonth } from '../calendar.model'

export const MONTH_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MonthComponent),
    multi: true,
};

@Component({
    selector: 'ion-calendar-month',
    providers: [MONTH_VALUE_ACCESSOR],
    template: `        
        <div [class]="color">
            <div *ngIf="!isRange">
                <div class="days-box">
                    <div class="days" *ngFor="let day of month.days">
                        <button [class]="'days-btn ' + day.cssClass"
                                *ngIf="day"
                                [class.today]="day.isToday"
                                (click)="onSelected(day)"
                                [class.marked]="day.marked"
                                [class.on-selected]="isSelected(day.time)"
                                [disabled]="day.disable">
                            <p>{{day.title}}</p>
                            <small *ngIf="day.subTitle">{{day?.subTitle}}</small>
                        </button>
                    </div>
                </div>
            </div>
            <div *ngIf="isRange">
                <div class="days-box">
                    <div class="days" *ngFor="let day of month.days">
                        <button [class]="'days-btn ' + day.cssClass"
                                *ngIf="day"
                                [class.today]="day.isToday"
                                (click)="onSelected(day)"
                                [class.marked]="day.marked"
                                [class.on-selected]="isSelected(day.time)"
                                [disabled]="day.disable"
                                [class.startSelection]="isStartSelection(day)"
                                [class.endSelection]="isEndSelection(day)"
                                [class.between]="isBetween(day)">
                            <p>{{day.title}}</p>
                            <small *ngIf="day.subTitle">{{day?.subTitle}}</small>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
})
export class MonthComponent implements ControlValueAccessor, OnInit {

    @Input() month: CalendarMonth;
    @Input() isRadio: boolean;
    @Input() isRange: boolean;
    @Input() isSaveHistory: boolean;
    @Input() id: any;
    @Input() color: string = 'primary';

    @Output() onChange: EventEmitter<any> = new EventEmitter();

    _date: Array<CalendarDay | null> = [null, null];

    _onChanged: Function;
    _onTouched: Function;

    constructor(
        public ref: ChangeDetectorRef,
    ) {

    }

    ngOnInit() {
        this._date = [null, null];
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
        if (this.isRadio || !Array.isArray(this._date) || this._date[1] === null) {
            return false;
        }

        return this._date[1].time === day.time;
    }

    isBetween(day: CalendarDay): boolean {

        if (this.isRadio || !Array.isArray(this._date)) {
            return false;
        }

        let start = 0;
        let end = 0;

        if (this._date[0] === null) {
            return false
        } else {
            start = this._date[0].time;
        }

        if (this._date[1] === null) {
            return false
        } else {
            end = this._date[1].time;
        }

        return day.time < end && day.time > start;

    }

    isStartSelection(day: CalendarDay): boolean {
        if (this.isRadio || !Array.isArray(this._date) || this._date[0] === null) {
            return false;
        }

        return this._date[0].time === day.time && this._date[1] !== null;
    }

    isSelected(time: number): boolean {
        if (!Array.isArray(this._date))
            return false;
        // Remove null values
        this._date = this._date.filter(a => a);
        if (this._date.length !== 0) {
            if (this._date.filter((date) => {
                return date.time === time;
            }).length > 0)
                return true;
            return false;
        }
    }

    onSelected(item: any) {
        item.selected = true;
        this.ref.detectChanges();
        if (this.isRadio) {
            this._date[0] = item;
            this.onChange.emit(this._date);
        } else if (this.isRange) {
            if (this._date[0] === null) {
                this._date[0] = item;
                this.ref.detectChanges();
            } else if (this._date[1] === null) {
                if (this._date[0].time < item.time) {
                    this._date[1] = item;
                } else {
                    this._date[1] = this._date[0];
                    this._date[0] = item;
                }
                this.ref.detectChanges();
            } else {
                this._date[0] = item;
                this._date[1] = null;
            }
            this.onChange.emit(this._date);
            this.ref.detectChanges();
        } else {
            if (this._date.filter((date) => date.time === item.time).length > 0)
                this._date = this._date.filter((date) => date.time !== item.time);
            else
                this._date.push(item);
            this.onChange.emit(this._date);
        }

    }

}
