import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

import {CalendarController} from '../../components/ion2-calendar'
import {CalendarControllerOptions, DayConfig} from '../../components/ion2-calendar/calendar.model';
import * as moment from 'moment';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  days: Array<any> = [];
  date = [];
  format = 'YYYY-MM-DD';
  options: CalendarControllerOptions = {
    pickMode: 'multi'
  };
  constructor(public navCtrl: NavController,
              public calendarCtrl: CalendarController,) {

  }

  onChange($event) {
    console.log($event)
  }

  basic() {

    this.calendarCtrl.openCalendar({
      title: 'BASIC',
      canBackwardsSelected: true,
      color: 'cal-color',
      doneIcon: true,
      closeIcon: true
    })
      .then((res: any) => {
        console.log(res)
      })
      .catch(() => {
      });
  }

  multi() {
    this.calendarCtrl.openCalendar({
      pickMode: 'multi',
      title: 'MULTI',
      defaultDates: [new Date(2017, 7, 20), new Date(2017, 7, 18).getTime()]
    })
      .then((res: any) => {
        console.log(res)
      })
      .catch(() => {
      });
  }

  setDefaultDate() {
    this.calendarCtrl.openCalendar({
      from: new Date(2017, 1, 1),
      defaultScrollTo: new Date(2017, 4, 1),

    })
      .then((res: any) => {
        console.log(res)
      })
      .catch(() => {
      })
  }


  setCssClass() {
    this.calendarCtrl.openCalendar({
      cssClass: 'my-class',
      color: 'secondary',
      pickMode: 'range',
      autoDone: true
    })
      .then((res: any) => {
        console.log(res)
      })
      .catch(() => {
      })
  }

  dateRange() {
    this.calendarCtrl.openCalendar({
      pickMode: 'range',
      title: 'RANGE',
      canBackwardsSelected: true,
      color: 'danger'
    })
      .then((res: any) => {
        console.log(res)
      })
      .catch(() => {
      })
  }

  optional() {
    this.calendarCtrl.openCalendar({
      from: new Date(2017, 1, 1),
      to: new Date(2017, 2, 5),
    })
      .then((res: any) => {
        console.log(res)
      })
      .catch(() => {
      })
  }

  disableWeekdays() {
    this.calendarCtrl.openCalendar({
      disableWeeks: [0, 6],
      canBackwardsSelected: true,
    })
      .then((res: any) => {
        console.log(res)
      })
      .catch(() => {
      })
  }

  local() {

    this.calendarCtrl.openCalendar({
      monthFormat: 'yyyy 年 MM 月 ',
      weekdays: ['天', '一', '二', '三', '四', '五', '六'],
      weekStart: 1,
      defaultDate: new Date()
    })
      .then((res: any) => {
        console.log(res)
      })
      .catch(() => {
      })
  }

  daysConfig() {

    let _daysConfig: DayConfig[] = [
      {
        date: new Date(2017, 0, 1),
        subTitle: 'New Year\'s',
        marked: true,
        cssClass: 'day-danger',
      },
      {
        date: new Date(2017, 1, 14),
        subTitle: 'Valentine\'s',
      },
      {
        date: new Date(2017, 3, 1),
        subTitle: 'April Fools',
        marked: true
      },
      {
        date: new Date(2017, 3, 7),
        subTitle: 'World Health',
      },
      {
        date: new Date(2017, 4, 31),
        subTitle: 'No-Smoking',
      },
      {
        date: new Date(2017, 5, 1),
        subTitle: 'Children\'s',
      }
    ];

    for (let i = 0; i < 31; i++) {
      this.days.push({
        date: new Date(2017, 0, i + 1),
        subTitle: `$${i + 1}`
      })
    }

    _daysConfig.push(...this.days);

    this.calendarCtrl.openCalendar({
      from: new Date(2017, 0, 1),
      to: new Date(2017, 11.1),
      daysConfig: _daysConfig,
      cssClass: 'my-cal',
    })
      .then((res: any) => {
        console.log(res)
      })

      .catch(() => {
      })
  }

}
