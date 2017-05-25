import { ElementRef, ChangeDetectorRef, Renderer, EventEmitter, OnInit } from '@angular/core';
import { ControlValueAccessor } from "@angular/forms";
import { CalendarDay, CalendarMonth, SavedDatesCache } from '../calendar.model';
export declare const MONTH_VALUE_ACCESSOR: any;
export declare class MonthComponent implements ControlValueAccessor, OnInit {
    ref: ChangeDetectorRef;
    private _renderer;
    _elementRef: ElementRef;
    month: CalendarMonth;
    isRadio: boolean;
    history: SavedDatesCache | any;
    onChange: EventEmitter<any>;
    _date: Array<CalendarDay | null>;
    _onChanged: Function;
    _onTouched: Function;
    constructor(ref: ChangeDetectorRef, _renderer: Renderer, _elementRef: ElementRef);
    writeValue(obj: any): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    ngOnInit(): void;
    private setValue(val);
    isEndSelection(day: CalendarDay): boolean;
    isBetween(day: CalendarDay): boolean;
    isStartSelection(day: CalendarDay): boolean;
    onSelected(item: any): void;
}
