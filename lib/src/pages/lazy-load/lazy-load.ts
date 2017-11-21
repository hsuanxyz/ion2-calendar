import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {CalendarController} from '../../components/ion2-calendar'

/**
 * Generated class for the LazyLoadPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-lazy-load',
  templateUrl: 'lazy-load.html',
})
export class LazyLoadPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public calendarCtrl: CalendarController
    ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LazyLoadPage');
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

}
