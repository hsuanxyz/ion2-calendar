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

export interface DayConfig {
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

export interface CalendarModalOptions {
  autoDone?: boolean;
  from?: Date;
  format?: string;
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
  defaultTitle?: string;
  defaultSubtitle?: string;
  defaultScrollTo?: Date;
  defaultDate?: DefaultDate;
  defaultDates?: DefaultDate[];
  defaultDateRange?: { from: DefaultDate, to?: DefaultDate } | null;
  countNextMonths?: number;
  /**
   * @deprecated this version notwork
   */
  showYearPicker?: boolean;
  daysConfig?: Array<DayConfig>
}

export interface CalendarComponentOptions {
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
  daysConfig?: Array<DayConfig>
}

export class CalendarResult {
  time: number;
  unix: number;
  dateObj: Date;
  string: string;
  years: number;
  months: number;
  date: number;
}

export type DefaultDate = Date | string | number | null;
export type Colors = 'primary' | 'secondary' | 'danger' | 'light' | 'dark' | string
export type PickMode = 'multi' | 'single' | 'range'
