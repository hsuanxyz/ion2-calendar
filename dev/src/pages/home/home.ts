import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { CalendarController } from '../../components/ion2-calendar'
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  days:Array<any> = [];

  constructor(
    public navCtrl: NavController,
    public calendarCtrl: CalendarController,
  ) {

  }

  basic() {

    this.calendarCtrl.openCalendar({
      title:'basic demo',
      canBackwardsSelected:true,
      color:'secondary',
      doneIcon: true
    })
      .then( (res:any) => { console.log(res) })
      .catch( () => {} );
  }

  multi() {
    this.calendarCtrl.openCalendar({
      pickMode: 'multi'
    })
      .then( (res:any) => { console.log(res) })
      .catch( () => {} );
  }

  setDefaultDate() {
    this.calendarCtrl.openCalendar({
      from: new Date(2017,1,1),
      defaultDate:new Date(2017,4,1),

    })
      .then( (res:any) => { console.log(res) })
      .catch( () => {} )
  }



  setCssClass() {
    this.calendarCtrl.openCalendar({
      cssClass:'my-class',
      isRadio: false,
    })
      .then( (res:any) => { console.log(res) })
      .catch( () => {} )
  }

  dateRange() {
    this.calendarCtrl.openCalendar({
      isRadio: false,
      canBackwardsSelected:true,
      autoDone: true
    })
      .then( (res:any) => { console.log(res) })
      .catch( () => {} )
  }

  maxAndMin() {
    this.calendarCtrl.openCalendar({
      from: new Date(2017,1,1),
      to  : new Date(2017,2,5),

    })
      .then( (res:any) => { console.log(res) })
      .catch( () => {} )
  }

  disableWeekdays() {
    this.calendarCtrl.openCalendar({
      disableWeekdays:[0,6],
      weekStartDay: 1,
      weekdaysTitle:["天","一", "二", "三", "四", "五", "六"],
      monthTitle:'yyyy 年 MM 月 ',
      canBackwardsSelected:true,

    })
      .then( (res:any) => { console.log(res) })
      .catch( () => {} )
  }

  settingDisplay() {
    this.calendarCtrl.openCalendar({
      monthTitle:'yyyy 年 MM 月 ',
      weekdaysTitle:["天","一", "二", "三", "四", "五", "六"],
      closeLabel:'关闭',
      weekStartDay:1,
    })
      .then( (res:any) => { console.log(res) })
      .catch( () => {} )
  }

  daysConfig() {

    let _daysConfig = [
      {
        date:new Date(2017,0,1),
        subTitle:'New Year\'s',
        marked:true,
        cssClass:'day-danger',
      },
      {
        date:new Date(2017,1,14),
        subTitle:'Valentine\'s',
      },
      {
        date:new Date(2017,3,1),
        subTitle:'April Fools',
        marked:true
      },
      {
        date:new Date(2017,3,7),
        subTitle:'World Health',
      },
      {
        date:new Date(2017,4,31),
        subTitle:'No-Smoking',
      },
      {
        date:new Date(2017,5,1),
        subTitle:'Children\'s',
      }
    ];

    for(let i = 0;  i < 31; i++){
      this.days.push({
        date:new Date(2017,0,i+1),
        subTitle:`$${i+1}`
      })
    }

    _daysConfig.push(...this.days);

    this.calendarCtrl.openCalendar({
      from: new Date(2017,0,1),
      to  : new Date(2017,11.1),
      daysConfig:_daysConfig,
      cssClass:'my-cal'
    })
      .then( (res:any) => { console.log(res) })

      .catch( () => {} )
  }

}
