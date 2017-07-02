import { Component, ViewChild, ElementRef, ChangeDetectorRef, Renderer } from '@angular/core';
import { NavParams ,ViewController, Content, InfiniteScroll } from 'ionic-angular';

import * as moment from 'moment';

import { CalendarDay, CalendarMonth, CalendarOptions, CalendarControllerOptions } from '../calendar.model'
import { CalendarService } from "../services/calendar.service";


@Component({
    selector: 'ion-calendar',
    template: `
        <div class="title">
            <div class="text">
                April 2017
            </div>
            <div ion-button clear class="back">
                <ion-icon name="ios-arrow-back"></ion-icon>
            </div>
            <div ion-button clear class="forward">
                <ion-icon name="ios-arrow-forward"></ion-icon>
            </div>
        </div>
        
        <ion-calendar-week></ion-calendar-week>
    `,

})
export class CalendarComponent {

    constructor(
        private _renderer: Renderer,
        public _elementRef: ElementRef,
        public params: NavParams,
        public viewCtrl: ViewController,
        public ref: ChangeDetectorRef,
        public calSvc: CalendarService,

    ) {

    }

    ionViewDidLoad() {

    }

}
