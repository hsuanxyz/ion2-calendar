import { Injectable } from '@angular/core';
import { ModalController } from 'ionic-angular';

import { ModalOptions, CalendarControllerOptions } from './calendar.model'
import { CalendarModal } from "./components/calendar.modal";
import {CalendarService} from './services/calendar.service';


@Injectable()
export class CalendarController {

    isRadio: boolean;

    constructor(
        public modalCtrl: ModalController,
        public calSvc: CalendarService,
    ) { }

    openCalendar(calendarOptions: CalendarControllerOptions, modalOptions:ModalOptions = {}):any {


        let options = this.calSvc.safeOpt(calendarOptions);
        let calendarModal = this.modalCtrl.create(CalendarModal, Object.assign({
            options:options,
        },options),modalOptions);

        calendarModal.present();

        return new Promise( (resolve, reject) => {

            calendarModal.onDidDismiss((data:any) => {
              if (data && Array.isArray(data)) {
                resolve(this.calSvc.wrapResult(data, options.pickMode));
              } else {
                reject('cancelled')
              }
            });
        });

    }

    setHistory(param: any) {
        localStorage.setItem(`ion-calendar-${param.id}`, JSON.stringify(param.date));
    }

    getHistory(id: any): Object {
        let _history = localStorage.getItem(`ion-calendar-${id}`);
        if(_history){
            return JSON.parse(_history);
        }
    }

    removeHistory(id:any) {
        localStorage.removeItem(`ion-calendar-${id}`)
    }
}
