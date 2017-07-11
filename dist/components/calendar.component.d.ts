import { ElementRef, ChangeDetectorRef, Renderer, OnInit } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { CalendarMonth, Colors } from '../calendar.model';
import { CalendarService } from "../services/calendar.service";
export declare class CalendarComponent implements OnInit {
    private _renderer;
    _elementRef: ElementRef;
    params: NavParams;
    viewCtrl: ViewController;
    ref: ChangeDetectorRef;
    calSvc: CalendarService;
    month: CalendarMonth;
    color: Colors;
    titleFormat: string;
    weekStartDay: number;
    disableWeekdays: Array<number>;
    constructor(_renderer: Renderer, _elementRef: ElementRef, params: NavParams, viewCtrl: ViewController, ref: ChangeDetectorRef, calSvc: CalendarService);
    ionViewDidLoad(): void;
    ngOnInit(): void;
}
