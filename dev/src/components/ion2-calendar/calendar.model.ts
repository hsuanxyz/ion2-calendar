/**
 * Created by hsuanlee on 2017/4/26.
 */
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
  }
}

export class CalendarMonth {
  original: CalendarOriginal;
  days: Array<CalendarDay | void>
}

export class DayConfig {
  date: Date;
  marked?: boolean;
  disable?: boolean;
  title?: string;
  subTitle?: string;
  cssClass?: string;
}

export class CalendarOptions {
  start: number;
  end: number;
  isRadio: boolean;
  pickMode: string;
  monthFormat: string;
  range_beg: number;
  range_end: number;
  daysConfig: Array<DayConfig>;
  disableWeeks: Array<number>
}

export interface ModalOptions {
  showBackdrop?: boolean;
  enableBackdropDismiss?: boolean;
  enterAnimation?: string;
  leaveAnimation?: string;
}

export interface CalendarControllerOptions {
  autoDone?: boolean;
  from?: Date;
  cssClass?: string;
  to?: Date | number;
  pickMode?: string;
  id?: string;
  isSaveHistory?: boolean;
  weekStart?: number;
  disableWeeks?: Array<number>;
  weekdays?: Array<string>;
  closeLabel?: string;
  doneLabel?: string;
  closeIcon?: boolean;
  doneIcon?: boolean;
  monthFormat?: string;
  color?: string;
  canBackwardsSelected?: boolean;
  title?: string;
  defaultScrollTo?: Date;
  defaultDate?: DefaultDate;
  defaultDates?: DefaultDate[];
  defaultDateRange?: { from:DefaultDate, to?: DefaultDate } | null;
  countNextMonths?: number;
  showYearPicker?: boolean;
  daysConfig?: Array<DayConfig>
}

export type DefaultDate = Date | string | number | null;
export type Colors = 'primary' | 'secondary' | 'danger' | 'light' | 'dark'
export type PickMode = 'multi' | 'single' | 'range'
