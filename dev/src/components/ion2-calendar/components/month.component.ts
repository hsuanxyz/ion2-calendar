import { Component, ChangeDetectorRef, Input, Output, EventEmitter, forwardRef, AfterViewInit, } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CalendarDay, CalendarMonth, PickMode } from '../calendar.model'

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
      <ng-template [ngIf]="pickMode !== 'range'" [ngIfElse]="rangeBox">
        <div class="days-box">
          <ng-template ngFor let-day [ngForOf]="month.days" [ngForTrackBy]="trackByTime">
            <div class="days">
              <ng-container *ngIf="day">
                <button type='button'
                        [class]="'days-btn ' + day.cssClass"
                        [class.today]="day.isToday"
                        (click)="onSelected(day)"
                        [class.marked]="day.marked"
                        [class.on-selected]="isSelected(day.time)"
                        [disabled]="day.disable">
                  <p>{{day.title}}</p>
                  <small *ngIf="day.subTitle">{{day?.subTitle}}</small>
                </button>
              </ng-container>
            </div>
          </ng-template>
        </div>
      </ng-template>

      <ng-template #rangeBox>
        <div class="days-box">
          <ng-template ngFor let-day [ngForOf]="month.days" [ngForTrackBy]="trackByTime">
            <div class="days"
                 [class.startSelection]="isStartSelection(day)"
                 [class.endSelection]="isEndSelection(day)"
                 [class.between]="isBetween(day)">
              <ng-container *ngIf="day">
                <button type='button'
                        [class]="'days-btn ' + day.cssClass"
                        [class.today]="day.isToday"
                        (click)="onSelected(day)"
                        [class.marked]="day.marked"
                        [class.on-selected]="isSelected(day.time)"
                        [disabled]="day.disable">
                  <p>{{day.title}}</p>
                  <small *ngIf="day.subTitle">{{day?.subTitle}}</small>
                </button>
              </ng-container>

            </div>
          </ng-template>
        </div>
      </ng-template>
    </div>
  `,
})
export class MonthComponent implements ControlValueAccessor, AfterViewInit {

  @Input() month: CalendarMonth;
  @Input() pickMode: PickMode;
  @Input() isSaveHistory: boolean;
  @Input() id: any;
  @Input() readonly = false;
  @Input() color: string = 'primary';

  @Output() onChange: EventEmitter<any> = new EventEmitter();

  _date: Array<CalendarDay | null> = [null, null];
  _isInit = false;
  _onChanged: Function;
  _onTouched: Function;

  constructor(public ref: ChangeDetectorRef,) {
  }

  ngAfterViewInit() {
    this._isInit = true;
  }

  writeValue(obj: any): void {
    if (Array.isArray(obj)) {
      this._date = obj;
    }
  }

  registerOnChange(fn: any): void {
    this._onChanged = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  trackByTime(index: number, item: any) {
    return item ? item.time : index;
  }

  isEndSelection(day: CalendarDay): boolean {
    if (!day) return false;
    if (this.pickMode !== 'range' || !this._isInit || this._date[1] === null) {
      return false;
    }

    return this._date[1].time === day.time;
  }

  isBetween(day: CalendarDay): boolean {
    if (!day) return false;

    if (this.pickMode !== 'range' || !this._isInit) {
      return false;
    }

    if (this._date[0] === null || this._date[1] === null) {
      return false;
    }

    const start = this._date[0].time;
    const end = this._date[1].time;

    return day.time < end && day.time > start;
  }

  isStartSelection(day: CalendarDay): boolean {
    if (!day) return false;
    if (this.pickMode !== 'range' || !this._isInit || this._date[0] === null) {
      return false;
    }

    return this._date[0].time === day.time && this._date[1] !== null;
  }

  isSelected(time: number): boolean {

    if (Array.isArray(this._date)) {

      if (this.pickMode !== 'multi') {
        if (this._date[0] !== null) {
          return time === this._date[0].time
        }

        if (this._date[1] !== null) {
          return time === this._date[1].time
        }
      } else {
        return this._date.findIndex(e => e !== null && e.time === time) !== -1;
      }

    } else {
      return false
    }
  }

  onSelected(item: any) {
    if (this.readonly) return;
    item.selected = true;

    if (this.pickMode === 'single') {
      this._date[0] = item;
      this.onChange.emit(this._date);
      return;
    }

    if (this.pickMode === 'range') {
      if (this._date[0] === null) {
        this._date[0] = item;
      } else if (this._date[1] === null) {
        if (this._date[0].time < item.time) {
          this._date[1] = item;
        } else {
          this._date[1] = this._date[0];
          this._date[0] = item;
        }
      } else {
        this._date[0] = item;
        this._date[1] = null;
      }
      this.onChange.emit(this._date);
      return;
    }

    if (this.pickMode === 'multi') {

      const index = this._date.findIndex(e => e !== null && e.time === item.time);

      if (index === -1) {
        this._date.push(item);
      } else {
        this._date.splice(index, 1);
      }
      this.onChange.emit(this._date.filter(e => e !== null));
    }
  }

}
