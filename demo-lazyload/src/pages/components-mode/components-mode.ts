import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the ComponentsModePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-components-mode',
  templateUrl: 'components-mode.html',
})
export class ComponentsModePage {

  date: string;
  type = 'string'; // 'string' | 'js-date' | 'moment' | 'time' | 'object'

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  onChange($event) {
    console.log($event);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ComponentsModePage');
  }

}
