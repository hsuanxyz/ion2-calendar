import { ModalController } from 'ionic-angular';
import { ModalOptions, CalendarModalOptions } from './calendar.model';
import { CalendarService } from './services/calendar.service';
export declare class CalendarController {
    modalCtrl: ModalController;
    calSvc: CalendarService;
    isRadio: boolean;
    constructor(modalCtrl: ModalController, calSvc: CalendarService);
    /**
     * @deprecated
     * @param {CalendarModalOptions} calendarOptions
     * @param {ModalOptions} modalOptions
     * @returns {any}
     */
    openCalendar(calendarOptions: CalendarModalOptions, modalOptions?: ModalOptions): any;
    /**
     * @deprecated
     */
    setHistory(param: any): void;
    /**
     * @deprecated
     */
    getHistory(id: any): Object;
    removeHistory(id: any): void;
}
