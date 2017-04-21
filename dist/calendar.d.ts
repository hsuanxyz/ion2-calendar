import { ElementRef, ChangeDetectorRef, Renderer } from '@angular/core';
import { NavParams, ViewController, Content } from 'ionic-angular';
export interface CalendarOriginal {
    time: number;
    date: Date;
    year: number;
    month: number;
    firstWeek: number;
    howManyDays: number;
}
export interface CalendarDay {
    time: number;
    selected: boolean;
    disable: boolean;
    cssClass: string;
    title?: string;
    subTitle?: string;
    marked?: boolean;
    style?: {
        title?: string;
        subTitle?: string;
    };
}
export declare class CalendarMonth {
    original: CalendarOriginal;
    days: Array<CalendarDay | void>;
}
export declare class dayConfig {
    date: Date;
    marked?: boolean;
    disable?: boolean;
    title?: string;
    subTitle?: string;
}
export declare class CalendarOptions {
    start: number;
    isRadio: boolean;
    monthTitle: string;
    range_beg: number;
    range_end: number;
    daysConfig: Array<dayConfig>;
    disableWeekdays: Array<number>;
}
export declare class CalendarPage {
    params: NavParams;
    viewCtrl: ViewController;
    ref: ChangeDetectorRef;
    private _renderer;
    _elementRef: ElementRef;
    content: Content;
    monthsEle: ElementRef;
    title: string;
    closeLabel: string;
    dayTemp: Array<CalendarDay | null>;
    calendarMonths: Array<CalendarMonth>;
    monthTitleFilterStr: string;
    weekdaysTitle: Array<string>;
    _s: boolean;
    private static options;
    private static defaultDate;
    private static scrollBackwards;
    constructor(params: NavParams, viewCtrl: ViewController, ref: ChangeDetectorRef, _renderer: Renderer, _elementRef: ElementRef);
    ngAfterViewInit(): void;
    ionViewDidLoad(): void;
    init(): void;
    findCssClass(): void;
    dismiss(): void;
    onSelected(item: CalendarDay): void;
    nextMonth(infiniteScroll: any): void;
    backwardsMonth(): void;
    scrollToDefaultDate(): void;
    onScroll($event: any): void;
    static findDayConfig(day: any): any;
    static createOriginalCalendar(time: number): CalendarOriginal;
    static createCalendarDay(time: number): CalendarDay;
    static createCalendarMonth(original: CalendarOriginal): CalendarMonth;
    static createMonthsByPeriod(startTime: number, monthsNum: number): Array<CalendarMonth>;
    static findInitMonthNumber(date: Date): number;
}
