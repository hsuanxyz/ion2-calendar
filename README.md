# ion2-calendar

[![Dependency Status](https://david-dm.org/HsuanXyz/ion2-calendar.svg)](https://david-dm.org/HsuanXyz/ion2-calendar)
[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][downloads-url] [![MIT License][license-image]][license-url]

A configurable and selectable range dates calendar component for ionic2

[![NPM](https://nodei.co/npm/ion2-calendar.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/ion2-calendar/)

[中文文档](https://github.com/HsuanXyz/ion2-calendar/blob/master/README-CN.md)


![date](https://github.com/HsuanXyz/hsuanxyz.github.io/blob/master/assets/ion2-calendar/calendar-gif.gif?raw=true)

> English is not my native language; please excuse typing errors.

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
[DEMO](https://hsuanxyz.github.io/demo/ion2-calendar/)

### date

![date](https://github.com/HsuanXyz/hsuanxyz.github.io/blob/master/assets/ion2-calendar/%E5%8D%95%E9%80%89%E6%97%A5%E6%9C%9F.gif?raw=true)

```typescript
 basic() {
    this.calendarCtrl.openCalendar({
      title:'basic demo',
    })
      .then( (res:any) => { console.log(res) })
      .catch( () => {} )
  }
```

### date range

![date range](https://github.com/HsuanXyz/hsuanxyz.github.io/blob/master/assets/ion2-calendar/%E5%A4%9A%E9%80%89%E6%97%A5%E6%9C%9F.gif?raw=true)

```typescript
dateRange() {
    this.calendarCtrl.openCalendar({
      isRadio: false,
    })
      .then( (res:any) => { console.log(res) })
      .catch( () => {} )
  }
```

### disable weekdays

![disable weekdays](https://github.com/HsuanXyz/hsuanxyz.github.io/blob/master/assets/ion2-calendar/%E7%A6%81%E7%94%A8%E6%98%9F%E6%9C%9F.gif?raw=true)

```typescript
  disableWeekdays() {
    this.calendarCtrl.openCalendar({
      disableWeekdays:[0,6]
    })
      .then( (res:any) => { console.log(res) })
      .catch( () => {} )
  }
```

### weekdays title format

![weekdays title](https://github.com/HsuanXyz/hsuanxyz.github.io/blob/master/assets/ion2-calendar/%E8%87%AA%E5%AE%9A%E4%B9%89%E5%91%A8%E6%A0%87%E9%A2%98.gif?raw=true)

### month title format

![month title](https://github.com/HsuanXyz/hsuanxyz.github.io/blob/master/assets/ion2-calendar/%E8%87%AA%E5%AE%9A%E4%B9%89%E6%9C%88%E4%BB%BD%E6%A0%87%E9%A2%98.gif?raw=true)

```typescript
 settingDisplay() {
    this.calendarCtrl.openCalendar({
      monthTitle:' MMMM-yy ',
      weekdaysTitle:["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      closeLabel:''
    })
      .then( (res:any) => { console.log(res) })
      .catch( () => {} )
  }
```
### days config

![days config](https://github.com/HsuanXyz/hsuanxyz.github.io/blob/master/assets/ion2-calendar/%E8%87%AA%E5%AE%9A%E4%B9%89%E5%A4%A9.gif?raw=true)

```typescript
daysConfig() {

    let _daysConfig = [
      {
        date:new Date(2017,0,1),
        subTitle:'New Year\'s',
        marked:true
      },
      {
        date:new Date(2017,1,14),
        subTitle:'Valentine\'s',
        disable:true
      },
      {
        date:new Date(2017,3,1),
        subTitle:'April Fools',
        marked:true
      },
      {
        date:new Date(2017,3,7),
        subTitle:'World Health',
        marked:true
      },
      {
        date:new Date(2017,4,31),
        subTitle:'No-Smoking',
        marked:true
      },
      {
        date:new Date(2017,5,1),
        subTitle:'Children\'s',
        marked:true
      }
    ];

    _daysConfig.push(...this.days);

    this.calendarCtrl.openCalendar({
      from: new Date(2017,0,1),
      to  : new Date(2017,11.1),
      daysConfig:_daysConfig
    })
      .then( (res:any) => { console.log(res) })
      .catch( () => {} )
  }
```

# API

## openCalendar(Options,ModalOptions)

### Options
| Name            | Type          | Default       | Description |
| --------------- | ------------- | ------------- | ----------- |
| from            | Date          | `new Date()`  | start date  |
| to              | Date          |  0 (Infinite) | end date    |
| title           | string        | `'Calendar'`  | title       |
| defaultDate     | Date          | none          | let the view scroll to the default date|
| cssClass        | string        | `''`          | Additional classes for custom styles, separated by spaces. |
| canBackwardsSelected        | boolean        | `false`        | can backwards selected |
| isRadio         | boolean       | `true`        | true for one day ,false for range dates     |
| disableWeekdays | Array<number> | `[]`          | week to be disabled (0-6)                   |
| closeLabel      | string        | `cancel`      | cancel button label ,can be an empty string |
| monthTitle      | string        | `'MMM yyyy'`  | month title format  |
| weekdaysTitle   | Array<string> | `"Di_Lu_Ma_Me_Je_Ve_Sa".split("_")` | weeks title |
| weekStartDay    | number        | `0` (0 or 1)           | set week start day |
| daysConfig      | Array<***DaysConfig***> | `[]` | days configuration |

#### DaysConfig
| Name          | Type          | Default  | Description
| ------------- | ------------- | -------- | --------------- |
| cssClass      | string        | `''`     | separated by spaces|
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

1. ~~Add style settings.~~
2. ~~Add default date, let the view scroll to the default date.~~
3. To today
4. ~~Scroll backwards ([#2](https://github.com/HsuanXyz/ion2-calendar/issues/2))~~
5. ~~Settings week start day([#5](https://github.com/HsuanXyz/ion2-calendar/issues/5))~~



# Contributing

1. Fork it!
2. Create your feature branch: git checkout -b my-new-feature
3. Commit your changes: git commit -am 'Add some feature'
4. Push to the branch: git push origin my-new-feature
5. Submit a pull request :D

# Development

```bash
cd ion2-calendar
npm install
npm run build
# output ./dist files
```
[![NPM](https://nodei.co/npm-dl/ion2-calendar.png?months=3&height=1)](https://nodei.co/npm/ion2-calendar/)

[npm-url]: https://www.npmjs.com/package/ion2-calendar
[npm-image]: https://img.shields.io/npm/v/ion2-calendar.svg

[downloads-image]: https://img.shields.io/npm/dm/ion2-calendar.svg
[downloads-url]: http://badge.fury.io/js/ion2-calendar

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE
