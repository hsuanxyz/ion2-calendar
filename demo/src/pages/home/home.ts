import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import {CalendarController} from "ion2-calendar";
import {Observable, Observer} from 'rxjs';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  days:Array<any> = [];

  constructor(
    public navCtrl: NavController,
    public calendarCtrl: CalendarController
  ) {

  }


  basic() {

    this.calendarCtrl.openCalendar({
      id:'1',
      title:'basic demo',
      canBackwardsSelected:true,
      isSaveHistory:true,
      showYearPicker:true,
      closeIcon: true
    })
      .then( (res:any) => { console.log(res) })
      .catch( () => {} );
  }

  setDefaultDate() {
    this.calendarCtrl.openCalendar({
      id:'2',
      from: new Date(2017,1,1),
      defaultDate:new Date(2017,4,1),
      showYearPicker:true,

    })
      .then( (res:any) => { console.log(res) })
      .catch( () => {} )
  }


  setCssClass() {
    this.calendarCtrl.openCalendar({
      id:'3',
      cssClass:'my-class',
      isRadio: false,
    })
      .then( (res:any) => { console.log(res) })
      .catch( () => {} )
  }

  dateRange() {
    this.calendarCtrl.openCalendar({
      id:'4',
      isRadio: false,
      canBackwardsSelected:true,
      isSaveHistory:true,
      showYearPicker:true,


    })
      .then( (res:any) => { console.log(res) })
      .catch( () => {} )
  }

  maxAndMin() {
    this.calendarCtrl.openCalendar({
      id:'5',
      from: new Date(2017,1,1),
      to  : new Date(2017,2,5),
      showYearPicker:true,

    })
      .then( (res:any) => { console.log(res) })
      .catch( () => {} )
  }

  disableWeekdays() {
    this.calendarCtrl.openCalendar({
      id:'6',
      disableWeekdays:[0,6],
      canBackwardsSelected:true,
      showYearPicker:true,

    })
      .then( (res:any) => { console.log(res) })
      .catch( () => {} )
  }

  settingDisplay() {
    this.calendarCtrl.openCalendar({
      id:'7',
      monthTitle:'yyyy 年 MM 月 ',
      weekdaysTitle:["天","一", "二", "三", "四", "五", "六"],
      closeLabel:'',
      weekStartDay:1,
      showYearPicker:true,

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
      id:'8',
      from: new Date(2017,0,1),
      to  : new Date(2017,11.1),
      daysConfig:_daysConfig,
      cssClass:'my-cal'
    })
      .then( (res:any) => { console.log(res) })

      .catch( () => {} )
  }

}
