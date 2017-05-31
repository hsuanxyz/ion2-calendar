import { ChangeDetectorRef, EventEmitter, OnInit } from '@angular/core';
import { ControlValueAccessor } from "@angular/forms";
import { CalendarDay, CalendarMonth } from '../calendar.model';
export declare const MONTH_VALUE_ACCESSOR: any;
export declare class MonthComponent implements ControlValueAccessor, OnInit {
    ref: ChangeDetectorRef;
    month: CalendarMonth;
    isRadio: boolean;
    isSaveHistory: boolean;
    id: any;
    onChange: EventEmitter<any>;
    _date: Array<CalendarDay | null>;
    _onChanged: Function;
    _onTouched: Function;
    constructor(ref: ChangeDetectorRef);
    ngOnInit(): void;
    writeValue(obj: any): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    isEndSelection(day: CalendarDay): boolean;
    isBetween(day: CalendarDay): boolean;
    isStartSelection(day: CalendarDay): boolean;
    isSelected(time: number): boolean;
    onSelected(item: any): void;
}
