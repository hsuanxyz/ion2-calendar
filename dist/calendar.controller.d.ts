import { ModalController } from 'ionic-angular';
export interface CalendarOptions {
    from?: Date;
    cssClass?: string;
    to?: Date | number;
    isRadio?: boolean;
    disableWeekdays?: Array<number>;
    weekdaysTitle?: Array<string>;
    closeLabel?: string;
    monthTitle?: string;
    title?: string;
    daysConfig?: Array<{
        date: Date;
        cssClass?: string;
        marked?: boolean;
        title?: string;
        subTitle?: string;
    }>;
}
export interface ModalOptions {
    showBackdrop?: boolean;
    enableBackdropDismiss?: boolean;
    enterAnimation?: string;
    leaveAnimation?: string;
}
export declare class CalendarController {
    modalCtrl: ModalController;
    constructor(modalCtrl: ModalController);
    openCalendar(calendarOptions: CalendarOptions, modalOptions?: ModalOptions): any;
}
