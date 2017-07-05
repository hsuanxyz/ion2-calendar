import { ModalController } from 'ionic-angular';
import { ModalOptions, CalendarControllerOptions } from './calendar.model';
import { CalendarService } from './services/calendar.service';
export declare class CalendarController {
    modalCtrl: ModalController;
    calSvc: CalendarService;
    isRadio: boolean;
    constructor(modalCtrl: ModalController, calSvc: CalendarService);
    openCalendar(calendarOptions: CalendarControllerOptions, modalOptions?: ModalOptions): any;
    setHistory(param: any): void;
    getHistory(id: any): Object;
    removeHistory(id: any): void;
}
