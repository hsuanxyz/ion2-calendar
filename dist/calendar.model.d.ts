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
    isToday: boolean;
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
export interface DayConfig {
    date: Date;
    marked?: boolean;
    disable?: boolean;
    title?: string;
    subTitle?: string;
    cssClass?: string;
}
export declare class PrivateCalendarOptions {
    start: number;
    end: number;
    pickMode: string;
    monthFormat: string;
    range_beg: number;
    range_end: number;
    daysConfig: Array<DayConfig>;
    disableWeeks: Array<number>;
}
export interface ModalOptions {
    showBackdrop?: boolean;
    enableBackdropDismiss?: boolean;
    enterAnimation?: string;
    leaveAnimation?: string;
}
export interface CalendarModalOptions extends CalendarOptions {
    autoDone?: boolean;
    format?: string;
    cssClass?: string;
    id?: string;
    isSaveHistory?: boolean;
    closeLabel?: string;
    doneLabel?: string;
    closeIcon?: boolean;
    doneIcon?: boolean;
    canBackwardsSelected?: boolean;
    title?: string;
    defaultScrollTo?: Date;
    defaultDate?: DefaultDate;
    defaultDates?: DefaultDate[];
    defaultDateRange?: {
        from: DefaultDate;
        to?: DefaultDate;
    } | null;
    step?: number;
    /**
     * @deprecated this version notwork
     */
    showYearPicker?: boolean;
}
export interface CalendarOptions {
    from?: Date | number;
    to?: Date | number;
    pickMode?: string;
    weekStart?: number;
    disableWeeks?: Array<number>;
    weekdays?: Array<string>;
    monthFormat?: string;
    color?: string;
    defaultTitle?: string;
    defaultSubtitle?: string;
    daysConfig?: Array<DayConfig>;
    pins?: Array<string>;
}
export interface CalendarComponentOptions extends CalendarOptions {
    showToggleButtons?: boolean;
    showMonthPicker?: boolean;
    monthPickerFormat?: string[];
}
export declare class CalendarResult {
    time: number;
    unix: number;
    dateObj: Date;
    string: string;
    years: number;
    months: number;
    date: number;
}
export declare type DefaultDate = Date | string | number | null;
export declare type Colors = 'primary' | 'secondary' | 'danger' | 'light' | 'dark' | string;
export declare type PickMode = 'multi' | 'single' | 'range';
