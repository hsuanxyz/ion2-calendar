import { Injectable } from '@angular/core';
import { CalendarPage } from './calendar';
import { ModalController } from 'ionic-angular';

export interface CalendarOptions {
  from?:Date,
  cssClass?:string,
  to?:Date|number,
  isRadio?:boolean;
  disableWeekdays?:Array<number>,
  weekdaysTitle?:Array<string>,
  closeLabel?:string;
  monthTitle?:string;
  title?:string;
  daysConfig?:Array<{
    date:Date;
    cssClass?:string,
    marked?:boolean;
    title?:string;
    subTitle?:string;
  }>
}

export interface ModalOptions {
    showBackdrop?: boolean;
    enableBackdropDismiss?: boolean;
    enterAnimation?: string;
    leaveAnimation?: string;
}

@Injectable()
export class CalendarController {
  constructor(
    public modalCtrl: ModalController
  ) { }

  openCalendar(calendarOptions:CalendarOptions, modalOptions:ModalOptions = {}):any {

    let _arr:Array<any> = [];

    let {
        from = new Date(),
        to = 0,
        cssClass = '',
        isRadio = true,
        disableWeekdays = _arr,
        closeLabel = 'cancel',
        monthTitle = 'MMM yyyy',
        title = 'Calendar',
        weekdaysTitle = "Di_Lu_Ma_Me_Je_Ve_Sa".split("_"),
        daysConfig = _arr
    } = calendarOptions || {};


    let options = {
      from:from,
      to:to,
      cssClass:cssClass,
      isRadio:isRadio,
      closeLabel:closeLabel,
      disableWeekdays:disableWeekdays,
      monthTitle:monthTitle,
      title:title,
      weekdaysTitle:weekdaysTitle,
      daysConfig:daysConfig
    };

    let calendarModal = this.modalCtrl.create(CalendarPage,options,modalOptions);
    calendarModal.present();



    return new Promise( (resolve, reject) => {


      calendarModal.onWillDismiss((data:any)=> {
        if( data && ( (data.from && data.to) || data.date ) ){
          resolve(data)
        }else {
          reject('cancelled')
        }
      });
    });


  }
}
