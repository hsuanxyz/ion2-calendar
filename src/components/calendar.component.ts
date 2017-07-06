import {Component, ViewChild, ElementRef, ChangeDetectorRef, Renderer, Input} from '@angular/core';
import { NavParams ,ViewController, Content, InfiniteScroll } from 'ionic-angular';

import * as moment from 'moment';

import {CalendarDay, CalendarMonth, CalendarOptions, CalendarControllerOptions, Colors} from '../calendar.model'
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
        
        <ion-calendar-week color="light"></ion-calendar-week>
        
        <ion-calendar-month [month]="month" [color]="color">
            
        </ion-calendar-month>
        
    `,

})
export class CalendarComponent {

    month: any;

    @Input() color: Colors = 'primary';
    constructor(
        private _renderer: Renderer,
        public _elementRef: ElementRef,
        public params: NavParams,
        public viewCtrl: ViewController,
        public ref: ChangeDetectorRef,
        public calSvc: CalendarService,

    ) {
        this.month = this.calSvc.createMonthsByPeriod(
            new Date(2017,4).getTime(),
            1,
            this.calSvc.safeOpt({from: new Date(2017,4)}),
        )[0]
    }

    ionViewDidLoad() {

    }

}
