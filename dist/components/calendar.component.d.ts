import { OnInit, EventEmitter } from '@angular/core';
import { CalendarMonth, CalendarModalOptions, CalendarComponentOptions } from '../calendar.model';
import { CalendarService } from "../services/calendar.service";
import { ControlValueAccessor } from '@angular/forms';
export declare const ION_CAL_VALUE_ACCESSOR: any;
export declare class CalendarComponent implements ControlValueAccessor, OnInit {
    calSvc: CalendarService;
    monthOpt: CalendarMonth;
    options: CalendarComponentOptions;
    format: string;
    onChange: EventEmitter<any>;
    _d: CalendarModalOptions;
    _calendarMonthValue: any[];
    _onChanged: Function;
    _onTouched: Function;
    constructor(calSvc: CalendarService);
    ionViewDidLoad(): void;
    ngOnInit(): void;
    writeValue(obj: any): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    createMonth(date: number): CalendarMonth;
    nextMonth(): void;
    canNext(): boolean;
    backMonth(): void;
    canBack(): boolean;
    onChanged($event: any[]): void;
    _writeValue(value: any): void;
}
