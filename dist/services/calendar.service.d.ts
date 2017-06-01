import { CalendarOriginal, CalendarDay, CalendarMonth, CalendarControllerOptions } from '../calendar.model';
export declare class CalendarService {
    constructor();
    createOriginalCalendar(time: number): CalendarOriginal;
    findDayConfig(day: any, opt: CalendarControllerOptions): any;
    createCalendarDay(time: number, opt: CalendarControllerOptions): CalendarDay;
    createCalendarMonth(original: CalendarOriginal, opt: CalendarControllerOptions): CalendarMonth;
    createMonthsByPeriod(startTime: number, monthsNum: number, opt: CalendarControllerOptions): Array<CalendarMonth>;
    getHistory(id: string | number): Array<CalendarDay | null>;
    savedHistory(savedDates: Array<CalendarDay | null>, id: string | number): void;
}
