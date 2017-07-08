import {Component, ViewChild, ElementRef, ChangeDetectorRef, Renderer, Input, OnInit} from '@angular/core';
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
        
        <ion-calendar-week color="light" 
                           [weekStart]="weekStartDay">
        </ion-calendar-week>
        
        <ion-calendar-month [month]="month" [color]="color">
            
        </ion-calendar-month>
        
    `,

})
export class CalendarComponent implements OnInit{

    month: any;

    @Input() color: Colors = 'primary';
    @Input() weekStartDay: number = 0;
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

    ngOnInit() {
        console.log(this.weekStartDay);
        this.month = this.calSvc.createMonthsByPeriod(
            new Date().getTime(),
            1,
            this.calSvc.safeOpt({
                from: new Date(),
                weekStartDay: this.weekStartDay,
            }),
        )[0];
    }

}
