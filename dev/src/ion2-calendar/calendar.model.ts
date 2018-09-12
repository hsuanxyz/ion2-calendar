import { AnimationBuilder } from '@ionic/core';

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
  isLastMonth?: boolean;
  isNextMonth?: boolean;
  title?: string;
  subTitle?: string;
  marked?: boolean;
  style?: {
    title?: string;
    subTitle?: string;
  };
  isFirst?: boolean;
  isLast?: boolean;
}

export class CalendarMonth {
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

export interface ModalOptions {
  showBackdrop?: boolean;
  backdropDismiss?: boolean;
  enterAnimation?: AnimationBuilder;
  leaveAnimation?: AnimationBuilder;
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
  defaultDateRange?: { from: DefaultDate; to?: DefaultDate } | null;
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
  /**
   * show last month & next month days fill six weeks
   */
  showAdjacentMonthDay?: boolean;
}

export interface CalendarComponentOptions extends CalendarOptions {
  showToggleButtons?: boolean;
  showMonthPicker?: boolean;
  monthPickerFormat?: string[];
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

export class CalendarComponentMonthChange {
  oldMonth: CalendarResult;
  newMonth: CalendarResult;
}

export type DefaultDate = Date | string | number | null;
export type Colors = 'primary' | 'secondary' | 'danger' | 'light' | 'dark' | string;
export type PickMode = 'multi' | 'single' | 'range';
export type CalendarComponentTypeProperty = 'string' | 'js-date' | 'moment' | 'time' | 'object';
export type CalendarComponentPayloadTypes = string | Date | number | {};
