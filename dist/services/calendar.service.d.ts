import { CalendarOriginal, CalendarDay, CalendarMonth, CalendarModalOptions, CalendarResult } from '../calendar.model';
export declare class CalendarService {
    constructor();
    safeOpt(calendarOptions: any): CalendarModalOptions;
    createOriginalCalendar(time: number): CalendarOriginal;
    findDayConfig(day: any, opt: CalendarModalOptions): any;
    createCalendarDay(time: number, opt: CalendarModalOptions): CalendarDay;
    createCalendarMonth(original: CalendarOriginal, opt: CalendarModalOptions): CalendarMonth;
    createMonthsByPeriod(startTime: number, monthsNum: number, opt: CalendarModalOptions): Array<CalendarMonth>;
    getHistory(id: string | number): Array<CalendarDay | null>;
    savedHistory(savedDates: Array<CalendarDay | null>, id: string | number): void;
    wrapResult(original: CalendarDay[], pickMode: string): any;
    multiFormat(time: number): CalendarResult;
}
