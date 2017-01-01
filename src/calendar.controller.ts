import { Injectable } from '@angular/core';
import { CalendarPage } from './calendar';
import { ModalController } from 'ionic-angular';


// interface CalendarOptions {
//   from?:Date,
//   to?:Date|number,
//   isRadio?:boolean;
//   disableWeekdays?:Array<number>,
//   weekdaysTitle?:Array<string>,
//   monthTitle?:string;
//   title?:string;
//   daysConfig?:Array<{
//     date:Date;
//     marked?:boolean;
//     title?:string;
//     subTitle?:string;
//   }>
// }

@Injectable()
export class CalendarController {
  constructor(
    public modalCtrl: ModalController
  ) { }

  openCalendar(calendarOptions):any {

    let {
      from = new Date(),
      to = 0,
      isRadio = true,
      disableWeekdays = [],
      closeLabel = 'cancel',
      monthTitle = 'MMM yyyy',
      title = 'Calendar',
      weekdaysTitle = "Di_Lu_Ma_Me_Je_Ve_Sa".split("_"),
      daysConfig = []
    } = calendarOptions || {};


    let options = {
      from:from,
      to:to,
      isRadio:isRadio,
      closeLabel:closeLabel,
      disableWeekdays:disableWeekdays,
      monthTitle:monthTitle,
      title:title,
      weekdaysTitle:weekdaysTitle,
      daysConfig:daysConfig
    };

    let calendarModal = this.modalCtrl.create(CalendarPage,options);
    calendarModal.present();



    return new Promise( (resolve, reject) => {
      calendarModal.onDidDismiss(data => {
        if( (data.from && data.to) || data.date ){
          resolve(data)
        }else {
          reject('cancelled')
        }
      });
    });


  }
}
