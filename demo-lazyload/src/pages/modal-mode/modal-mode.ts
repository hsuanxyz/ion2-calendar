import { Component } from '@angular/core';
import { IonicPage, ModalController } from 'ionic-angular';
import { CalendarModal, CalendarModalOptions } from "ion2-calendar";

/**
 * Generated class for the ModalModePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-modal-mode',
  templateUrl: 'modal-mode.html',
})
export class ModalModePage {

  constructor(public modalCtrl: ModalController,) {
  }

  openCalendar() {
    const options: CalendarModalOptions = {
      title: 'BASIC',
    };
    let myCalendar =  this.modalCtrl.create(CalendarModal, {
      options: options
    });

    myCalendar.present();

    myCalendar.onDidDismiss((date, type) => {
      console.log(type);
      console.log(date);
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalModePage');
  }

}
