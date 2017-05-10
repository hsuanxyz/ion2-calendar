import { ModalController } from 'ionic-angular';
import { ModalOptions, CalendarControllerOptions, SavedDatesCache } from './calendar.model';
export declare class CalendarController {
    modalCtrl: ModalController;
    constructor(modalCtrl: ModalController);
    openCalendar(calendarOptions: CalendarControllerOptions, modalOptions?: ModalOptions): any;
    setHistory(param: SavedDatesCache): void;
    getHistory(id: any): Object;
    removeHistory(id: any): void;
}
