import { CalendarOriginal, CalendarDay, CalendarMonth, CalendarControllerOptions, CalendarResult } from '../calendar.model';
export declare class CalendarService {
    constructor();
    safeOpt(calendarOptions: any): CalendarControllerOptions;
    createOriginalCalendar(time: number): CalendarOriginal;
    findDayConfig(day: any, opt: CalendarControllerOptions): any;
    createCalendarDay(time: number, opt: CalendarControllerOptions): CalendarDay;
    createCalendarMonth(original: CalendarOriginal, opt: CalendarControllerOptions): CalendarMonth;
    createMonthsByPeriod(startTime: number, monthsNum: number, opt: CalendarControllerOptions): Array<CalendarMonth>;
    getHistory(id: string | number): Array<CalendarDay | null>;
    savedHistory(savedDates: Array<CalendarDay | null>, id: string | number): void;
    wrapResult(original: CalendarDay[], pickMode: string): any;
    _multiFormat(data: CalendarDay): CalendarResult;
}
