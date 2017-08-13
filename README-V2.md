<h1 align="center">ion2-calendar</h1>

<p align="center">
[![Dependency Status](https://david-dm.org/HsuanXyz/ion2-calendar.svg)](https://david-dm.org/HsuanXyz/ion2-calendar)
[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][downloads-url]
[![MIT License][license-image]][license-url]
</p>

![date](https://github.com/HsuanXyz/hsuanxyz.github.io/blob/master/assets/ion2-calendar/calendar.png?raw=true)

> English is not my native language; please excuse typing errors.
[中文文档](https://github.com/HsuanXyz/ion2-calendar/blob/master/README-CN.md)

- Support date range.
- Support multi date.
- Disable weekdays or weekends.
- Setting days event.
- Setting localization.
- Material design.

# Demo
live demo [click me](https://hsuanxyz.github.io/demo/ion2-calendar/).

# Usage
### Installation
`$ npm install ion2-calendar moment --save`

### Import module

```javascript
import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
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
  ]
})
export class AppModule {}
```

### Basic
Import ion2-calendar in component controller.
```javascript
import { Component } from '@angular/core';
import { CalendarController } from "ion2-calendar";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(
    public calendarCtrl: CalendarController
  ) { }

  openCalendar() {
    this.calendarCtrl.openCalendar({
      title: 'Basic'
      from: new Date()
    })
    .then(res => console.log(res))
    .catch(err => console.log(err))
  }

}
```

### Date range
Set pickMode to 'range'.
```javascript
openCalendar() {
    this.calendarCtrl.openCalendar({
      pickMode: 'range'
    })
    .then(res => console.log(res))
    .catch(err => console.log(err))
  }
```

### Multi Date
Set pickMode to 'multi'.
```javascript
openCalendar() {
    this.calendarCtrl.openCalendar({
      pickMode: 'multi'
    })
    .then(res => console.log(res))
    .catch(err => console.log(err))
  }
```

### Disable weeks
Use index eg: `[0, 6]` denote Sunday and Saturday.
```javascript
  openCalendar() {
    this.calendarCtrl.openCalendar({
      disableWeeks: [0,6]
    })
      .then(res => console.log(res))
      .catch(err => console.log(err))
  }
```

### Localization

```javascript
 openCalendar() {
    this.calendarCtrl.openCalendar({
      monthFormat: 'yyyy 年 MM 月 ',
      weekdays: ['天', '一', '二', '三', '四', '五', '六'],
      weekStart: 1,
    })
      .then(res => console.log(res))
      .catch(err => console.log(err))
  }
```
### Days config
Configure a day.
```javascript
daysConfig() {

    let _daysConfig = [
      {
        date: new Date(2017,0,1),
        subTitle: 'New Year\'s',
        marked: true
      },
      {
        date: new Date(2017,1,14),
        subTitle: 'Valentine\'s',
        disable: true
      }
    ];

    this.calendarCtrl.openCalendar({
      from: new Date(2017,0,1),
      to: new Date(2017,11.1),
      daysConfig: _daysConfig
    })
    .then(res => console.log(res))
    .catch(err => console.log(err))
  }
```

# API

## openCalendar(Options,ModalOptions)

### Options
| Name            | Type          | Default       | Description |
| --------------- | ------------- | ------------- | ----------- |
| from            | Date          | `new Date()`  | start date  |
| to              | Date          |  0 (Infinite) | end date    |
| title           | string        | `'CALENDAR'`  | title       |
| color           | string        | `'primary'`   | 'primary', 'secondary', 'danger', 'light', 'dark' |
| defaultDate     | Date          | none          | let the view scroll to the default date|
| cssClass        | string        | `''`          | Additional classes for custom styles, separated by spaces. |
| canBackwardsSelected        | boolean        | `false`        | can backwards selected |
| pickMode         | string       | `single`        | 'multi', 'range', 'single'     |
| disableWeeks | Array<number> | `[]`          | week to be disabled (0-6)                   |
| closeLabel      | string        | `CANCEL`      | cancel button label |
| doneLabel      | string        | `DONE`      | done button label |
| closeIcon      | boolean        | `false`      | show cancel button icon |
| doneIcon      | boolean        | `false`      | show done button icon  |
| monthFormat      | string        | `'MMM yyyy'`  | month title format  |
| weekdays   | Array<string> | `['S', 'M', 'T', 'W', 'T', 'F', 'S']` | weeks text |
| weekStart    | number        | `0` (0 or 1)           | set week start day |
| daysConfig      | Array<***DaysConfig***> | `[]` | days configuration |

#### DaysConfig
| Name          | Type          | Default  | Description
| ------------- | ------------- | -------- | --------------- |
| cssClass      | string        | `''`     | separated by spaces|
| date          | Date          | required | configured days |
| marked        | boolean       | false    | highlight color |
| disable       | boolean       | false    | disable         |
| title         | string        | none     | displayed title eg: `'today'`      |
| subTitle      | string        | none     | subTitle subTitle eg: `'New Year\'s'` |

### ModalOptions
| Name            | Type          | Default       | Description |
| --------------- | ------------- | ------------- | ----------- |
| showBackdrop            | boolean          | true  | Whether to show the backdrop |
| enableBackdropDismiss   | boolean          | true | Whether the popover should be dismissed by tapping the backdrop   |


### Output Promise
| pickMode      | Type  |
| ------------- | ----- |
| single        | { date:  ***Day*** }  |
| range         | { from: ***Day***, to: ***Day*** }  |
| multi         | Array<***Day***>   |

### Day
| Name          | Type    | Description |
| ------------- | ------- | ----------- |
| time          | number  | timestamp   |
| marked        | boolean | highlight color   |
| disable       | boolean | disable           |
| title         | string  | displayed title   |
| subTitle      | string  | subTitle subTitle |

# Contributing

1. Fork it!
2. Create your feature branch: git checkout -b my-new-feature
3. Commit your changes: git commit -am 'Add some feature'
4. Push to the branch: git push origin my-new-feature
5. Submit a pull request :D

### Development

```bash
cd ./dev
npm install
npm run ionic:serve
# do something in ./dev/src/components/ion2-calendar
```

### Build

```bash
cd ./
npm install
npm run build
```

## Thanks for reading

[npm-url]: https://www.npmjs.com/package/ion2-calendar
[npm-image]: https://img.shields.io/npm/v/ion2-calendar.svg

[downloads-image]: https://img.shields.io/npm/dm/ion2-calendar.svg
[downloads-url]: http://badge.fury.io/js/ion2-calendar

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE
