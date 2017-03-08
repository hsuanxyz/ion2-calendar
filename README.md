# ion2-calendar

[![Dependency Status](https://david-dm.org/HsuanXyz/ion2-calendar.svg)](https://david-dm.org/HsuanXyz/ion2-calendar)
[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][downloads-url] [![MIT License][license-image]][license-url]


A configurable and selectable range dates calendar component for ionic2

### install

  *if you do not use moment*
`$ npm install moment --save`

`$ npm install ion2-calendar --save`

### import module

```javascript
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
...
import { CalendarModule } from "ion2-calendar";

@NgModule({
  declarations: [
    MyApp,
    ...
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    CalendarModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ...
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {}
```
### Use
```javascript
import { Component } from '@angular/core';

import {CalendarController} from "ion2-calendar/dist";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(
    public calendarCtrl: CalendarController
  ) {

  }

  openCalendar(){
    this.calendarCtrl.openCalendar({
      from:new Date()
    })
    .then( res => { console.log(res) } );
  }

}
```

# Demo
[DEMO](https://hsuanxyz.github.io/hsuan.github.io/demo/ion2-calendar/)

### date

![date](https://github.com/HsuanXyz/hsuan.github.io/blob/master/assets/ion2-calendar/%E5%8D%95%E9%80%89%E6%97%A5%E6%9C%9F.gif?raw=true)

### date range

![date range](https://github.com/HsuanXyz/hsuan.github.io/blob/master/assets/ion2-calendar/%E5%A4%9A%E9%80%89%E6%97%A5%E6%9C%9F.gif?raw=true)

### disable weekdays

![disable weekdays](https://github.com/HsuanXyz/hsuan.github.io/blob/master/assets/ion2-calendar/%E7%A6%81%E7%94%A8%E6%98%9F%E6%9C%9F.gif?raw=true)

### weekdays title

![weekdays title](https://github.com/HsuanXyz/hsuan.github.io/blob/master/assets/ion2-calendar/%E8%87%AA%E5%AE%9A%E4%B9%89%E5%91%A8%E6%A0%87%E9%A2%98.gif?raw=true)

### month title

![month title](https://github.com/HsuanXyz/hsuan.github.io/blob/master/assets/ion2-calendar/%E8%87%AA%E5%AE%9A%E4%B9%89%E6%9C%88%E4%BB%BD%E6%A0%87%E9%A2%98.gif?raw=true)

### days config

![days config](https://github.com/HsuanXyz/hsuan.github.io/blob/master/assets/ion2-calendar/%E8%87%AA%E5%AE%9A%E4%B9%89%E5%A4%A9.gif?raw=true)

# API

## openCalendar(Options,ModalOptions)

### Options
| Name            | Type          | Default       | Description |
| --------------- | ------------- | ------------- | ----------- |
| from            | Date          | `new Date()`  | start date  |
| to              | Date          |  0 (Infinite) | end date    |
| title           | string        | `'Calendar'`  | title       |
| isRadio         | boolean       | `true`        | true for one day ,false for range dates     |
| disableWeekdays | Array<number> | `[]`          | week to be disabled (0-6)                   |
| closeLabel      | string        | `cancel`      | cancel button label ,can be an empty string |
| monthTitle      | string        | `'MMM yyyy'`  | month title format  |
| weekdaysTitle   | Array<string> | `"Di_Lu_Ma_Me_Je_Ve_Sa".split("_")` | weeks title |
| daysConfig      | Array<***DaysConfig***> | `[]` | days configuration |

#### DaysConfig
| Name          | Type          | Default  | Description     |
| ------------- | ------------- | -------- | --------------- |
| date          | Date          | required | configured days |
| marked        | boolean       | false    | highlight color |
| disable       | boolean       | false    | disable         |
| title         | string        | none     | displayed title example:'today'       |
| subTitle      | string        | none     | subTitle subTitle example:'christmas' |

### ModalOptions
| Name            | Type          | Default       | Description |
| --------------- | ------------- | ------------- | ----------- |
| showBackdrop            | boolean          | true  | Whether to show the backdrop |
| enableBackdropDismiss   | boolean          | true | Whether the popover should be dismissed by tapping the backdrop   |


### Output Promise
| Name          | Type  | Description |
| ------------- | ----- | ----------- |
| from          | ***Day***   | start date If `isRadio` it is `false` |
| to            | ***Day***   | end date If `isRadio` it is `false`   |
| date          | ***Day***   | date If `isRadio` it is `true`        |

### Day
| Name          | Type    | Description |
| ------------- | ------- | ----------- |
| time          | number  | timestamp   |
| marked        | boolean | highlight color   |
| disable       | boolean | disable           |
| title         | string  | displayed title   |
| subTitle      | string  | subTitle subTitle |


### TODO
1. Add style settings.


# Environment
```
Cordova CLI: 6.4.0
Ionic Framework Version: 2.0.0
Ionic CLI Version: 2.1.18
Ionic App Lib Version: 2.1.9
Ionic App Scripts Version: 1.1.3
```

[npm-url]: https://www.npmjs.com/package/ion2-calendar
[npm-image]: https://img.shields.io/npm/v/ion2-calendar.svg

[downloads-image]: https://img.shields.io/npm/dm/ion2-calendar.svg
[downloads-url]: http://badge.fury.io/js/ionic2-rating

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE
