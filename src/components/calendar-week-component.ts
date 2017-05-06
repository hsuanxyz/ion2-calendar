import {Component, Input} from '@angular/core';

@Component({
    selector: 'calendar-week-title',
    template:`
        <ion-toolbar class="week-toolbar"  no-border-top >
            <ul [class]="'week-title ' + color">
                <li *ngFor="let w of _weekArray">{{w}}</li>
            </ul>          
        </ion-toolbar>
    `,
    styles:[
        `
            .week-toolbar{
                padding: 0;
          
            }
            
            .week-title {
                margin: 0;
                color:#fff;
                height: 44px;
                width: 100%;
                background-color: rgb(59, 151, 247);
                padding: 15px 0;
            }


            .week-title li {
                list-style-type:none;
                display: block;
                float: left;
                width: 14%;
                text-align: center;
            }

            .week-title li:nth-of-type(7n), .week-title li:nth-of-type(7n+1) {
                width: 15%;
            }
        `
    ]
})

export class CalendarWeekComponent {

    _weekArray: string[] = "Di_Lu_Ma_Me_Je_Ve_Sa".split("_");
    _weekStart: number = 0;
    @Input() color:string = 'primary';

    constructor() {}

    @Input()
    set weekArray(value:string[]) {
        if(value && value.length === 7) {
            this._weekArray = value;
            this.adjustSort();
        }
    }

    @Input()
    set weekStart(value: number){
        if(value === 0 || value === 1 ){
            this._weekStart = value;
            this.adjustSort();
        }
    }

    adjustSort() {
        if(this._weekStart === 1){
            this._weekArray.push(this._weekArray.shift())
        }
    }


}