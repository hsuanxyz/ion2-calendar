import { ModalController } from 'ionic-angular';
import { ModalOptions, CalendarControllerOptions } from './calendar.model';
export declare class CalendarController {
    modalCtrl: ModalController;
    isRadio: boolean;
    constructor(modalCtrl: ModalController);
    openCalendar(calendarOptions: CalendarControllerOptions, modalOptions?: ModalOptions): any;
    setHistory(param: any): void;
    getHistory(id: any): Object;
    removeHistory(id: any): void;
}
