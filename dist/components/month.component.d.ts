import { ChangeDetectorRef, EventEmitter, AfterViewInit } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { CalendarDay, CalendarMonth, PickMode } from '../calendar.model';
export declare const MONTH_VALUE_ACCESSOR: any;
export declare class MonthComponent implements ControlValueAccessor, AfterViewInit {
    ref: ChangeDetectorRef;
    month: CalendarMonth;
    pickMode: PickMode;
    isSaveHistory: boolean;
    id: any;
    color: string;
    onChange: EventEmitter<any>;
    _date: Array<CalendarDay | null>;
    _isInit: boolean;
    _onChanged: Function;
    _onTouched: Function;
    constructor(ref: ChangeDetectorRef);
    ngAfterViewInit(): void;
    writeValue(obj: any): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    trackByTime(index: number, item: any): any;
    isEndSelection(day: CalendarDay): boolean;
    isBetween(day: CalendarDay): boolean;
    isStartSelection(day: CalendarDay): boolean;
    isSelected(time: number): boolean;
    onSelected(item: any): void;
}
