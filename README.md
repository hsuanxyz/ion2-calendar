# 📅 ion2-calendar

[![Build Status](https://travis-ci.org/HsuanXyz/ion2-calendar.svg?branch=master)](https://travis-ci.org/HsuanXyz/ion2-calendar)
[![Dependency Status](https://david-dm.org/HsuanXyz/ion2-calendar.svg)](https://david-dm.org/HsuanXyz/ion2-calendar)
[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][downloads-url]
[![MIT License][license-image]][license-url]


![date](https://github.com/HsuanXyz/hsuanxyz.github.io/blob/master/assets/ion2-calendar/calendar.png?raw=true)
<p align="center">
    <img width="800" src="https://github.com/HsuanXyz/hsuanxyz.github.io/blob/master/assets/ion2-calendar/calendar-1.png?raw=true">
</p>

> English is not my native language; please excuse typing errors.
[中文文档](https://github.com/HsuanXyz/ion2-calendar/blob/master/README-CN.md)

- Support date range.
- Support multi date.
- Support HTML components.
- Disable weekdays or weekends.
- Setting days event.
- Setting localization.
- Material design.

# Support

- ionic-angular `^3.0.0`

# Demo
live demo [click me](https://hsuanxyz.github.io/demo/ion2-calendar/).

# Usage
### Installation
`$ npm install ion2-calendar moment --save`

### Import module

```typescript
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

# Components Mode

### Basic

```html
<ion-calendar [(ngModel)]="date"
              (onChange)="onChange($event)"
              [type]="type"
              [format]="'YYYY-MM-DD'">
</ion-calendar>
```

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  date: string;
  type: 'string'; // 'string' | 'js-date' | 'moment' | 'time' | 'object'
  constructor() { }

  onChange($event) {
    console.log($event);
  }
  ...
}
```

### Date range

```html
<ion-calendar [(ngModel)]="dateRange"
              [options]="optionsRange"
              [type]="type"
              [format]="'YYYY-MM-DD'">
</ion-calendar>
```

```typescript
import { Component } from '@angular/core';
import { CalendarComponentOptions } from 'ion2-calendar'
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  dateRange: { from: string; to: string; };
  type: 'string'; // 'string' | 'js-date' | 'moment' | 'time' | 'object'
  optionsRange: CalendarComponentOptions = {
    pickMode: 'range'
  };
  constructor() { }
  ...
}
```

### Multi Date

```html
<ion-calendar [(ngModel)]="dateMulti"
              [options]="optionsMulti"
              [type]="type"
              [format]="'YYYY-MM-DD'">
</ion-calendar>
```

```typescript
import { Component } from '@angular/core';
import { CalendarComponentOptions } from 'ion2-calendar'
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  dateMulti: string[];
  type: 'string'; // 'string' | 'js-date' | 'moment' | 'time' | 'object'
  optionsMulti: CalendarComponentOptions = {
    pickMode: 'multi'
  };
  constructor() { }
  ...
}
```

### Input Properties
| Name            | Type          | Default        | Description |
| --------------- | ------------- | -------------- | ----------- |
| options         | CalendarComponentOptions| null | options     |
| format          | string        | 'YYYY-MM-DD'   | value format |
| type            | string        | 'string'       | value type |
| readonly        | boolean        | false         | readonly |

### Output Properties
| Name            | Type          |  Description |
| --------------- | ------------- |  ----------- |
| onChange         | EventEmitter|   event for model change     |
| monthChange      | EventEmitter |  event for month change  |


### CalendarComponentOptions
| Name            | Type          | Default       | Description |
| --------------- | ------------- | ------------- | ----------- |
| from            | Date          | `new Date()`  | start date  |
| to              | Date          |  0 (Infinite) | end date    |
| color           | string        | `'primary'`   | 'primary', 'secondary', 'danger', 'light', 'dark' |
| pickMode         | string       | `single`        | 'multi', 'range', 'single'     |
| showToggleButtons  | boolean       | `true`        | show toggle buttons     |
| showMonthPicker  | boolean       | `true`        | show month picker     |
| monthPickerFormat  | Array<string>       | `['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']` | month picker format  |
| defaultTitle | string | ''          | default title in days            |
| defaultSubtitle | string | ''          | default subtitle in days            |
| disableWeeks | Array<number> | `[]`          | week to be disabled (0-6)                   |
| monthFormat      | string        | `'MMM YYYY'`  | month title format  |
| weekdays   | Array<string> | `['S', 'M', 'T', 'W', 'T', 'F', 'S']` | weeks text |
| weekStart    | number        | `0` (0 or 1)           | set week start day |
| daysConfig      | Array<***DaysConfig***> | `[]` | days configuration |

# Modal Mode

### Basic

Import ion2-calendar in component controller.

```typescript
import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { CalendarModal, CalendarModalOptions, DayConfig, CalendarResult } from "ion2-calendar";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(
    public modalCtrl: ModalController,
  ) { }

  openCalendar() {
    const options: CalendarModalOptions = {
      title: 'BASIC',
    };
    let myCalendar =  this.modalCtrl.create(CalendarModal, {
      options: options
    });

    myCalendar.present();

    myCalendar.onDidDismiss((date: CalendarResult, type: string) => {
      console.log(date);
    })
  }

}
```

### Date range

Set pickMode to 'range'.

```typescript
    openCalendar() {
        const options: CalendarModalOptions = {
          pickMode: 'range',
          title: 'RANGE'
        };
    
        let myCalendar = this.modalCtrl.create(CalendarModal, {
          options: options
        });
    
        myCalendar.present();
    
        myCalendar.onDidDismiss((date: { from: CalendarResult; to: CalendarResult }, type: string) => {
          console.log(date);
        });
  }
```

### Multi Date

Set pickMode to 'multi'.

```typescript
    openCalendar() {
        const options = {
          pickMode: 'multi',
          title: 'MULTI'
        };
    
        let myCalendar =  this.modalCtrl.create(CalendarModal, {
          options: options
        });
    
        myCalendar.present();
    
        myCalendar.onDidDismiss((date: CalendarResult[], type: string) => {
          console.log(date);
        })
      }
```

### Disable weeks

Use index eg: `[0, 6]` denote Sunday and Saturday.

```typescript
  openCalendar() {
    const options: CalendarModalOptions = {
      disableWeeks: [0, 6]
    };

    let myCalendar =  this.modalCtrl.create(CalendarModal, {
      options: options
    });

    myCalendar.present();

    myCalendar.onDidDismiss((date: CalendarResult, type: string) => {
      console.log(date);
    });
  }
```

### Localization

your root module

```typescript
import { NgModule, LOCALE_ID } from '@angular/core';
...

@NgModule({
  ...
  providers: [{ provide: LOCALE_ID, useValue: "zh-CN" }]
})

...
```

```typescript
 openCalendar() {
    const options: CalendarModalOptions = {
      monthFormat: 'YYYY 年 MM 月 ',
      weekdays: ['天', '一', '二', '三', '四', '五', '六'],
      weekStart: 1,
      defaultDate: new Date()
    };

    let myCalendar =  this.modalCtrl.create(CalendarModal, {
      options: options
    });

    myCalendar.present();

    myCalendar.onDidDismiss((date: CalendarResult, type: string) => {
      console.log(date);
    });
  }
```
### Days config

Configure one day.

```typescript
openCalendar() {
    let _daysConfig: DayConfig[] = [];
    for (let i = 0; i < 31; i++) {
      _daysConfig.push({
        date: new Date(2017, 0, i + 1),
        subTitle: `$${i + 1}`
      })
    }

    const options: CalendarModalOptions = {
      from: new Date(2017, 0, 1),
      to: new Date(2017, 11.1),
      daysConfig: _daysConfig
    };

    let myCalendar =  this.modalCtrl.create(CalendarModal, {
      options: options
    });

    myCalendar.present();

    myCalendar.onDidDismiss((date: CalendarResult, type: string) => {
      console.log(date);
    });
  }
```

# API

### Modal Options

| Name            | Type          | Default       | Description |
| --------------- | ------------- | ------------- | ----------- |
| from            | Date          | `new Date()`  | start date  |
| to              | Date          |  0 (Infinite) | end date    |
| title           | string        | `'CALENDAR'`  | title       |
| color           | string        | `'primary'`   | 'primary', 'secondary', 'danger', 'light', 'dark' |
| defaultScrollTo | Date          | none          | let the view scroll to the default date|
| defaultDate     | Date          | none          | default date data, apply to single|
| defaultDates    | Array<Date>   | none          | default dates data, apply to multi |
| defaultDateRange | { from: Date, to: Date }  | none  | default date-range data, apply to range |
| defaultTitle | string | ''          | default title in days            |
| defaultSubtitle | string | ''          | default subtitle in days            |
| cssClass        | string        | `''`          | Additional classes for custom styles, separated by spaces. |
| canBackwardsSelected        | boolean        | `false`        | can backwards selected |
| pickMode         | string       | `single`        | 'multi', 'range', 'single'     |
| disableWeeks | Array<number> | `[]`          | week to be disabled (0-6)                   |
| closeLabel      | string        | `CANCEL`      | cancel button label |
| doneLabel      | string        | `DONE`      | done button label |
| closeIcon      | boolean        | `false`      | show cancel button icon |
| doneIcon      | boolean        | `false`      | show done button icon  |
| monthFormat      | string        | `'MMM YYYY'`  | month title format  |
| weekdays   | Array<string> | `['S', 'M', 'T', 'W', 'T', 'F', 'S']` | weeks text |
| weekStart    | number        | `0` (0 or 1)           | set week start day |
| daysConfig      | Array<***DaysConfig***> | `[]` | days configuration |

### onDidDismiss Output [, param1]

| pickMode      | Type  |
| ------------- | ----- |
| single        | { date:  ***CalendarResult*** }  |
| range         | { from: ***CalendarResult***, to: ***CalendarResult*** }  |
| multi         | Array<***CalendarResult***>   |

### onDidDismiss Output [, param2]
| Value      | Description  |
| --------- | ----- |
| 'cancel'    | dismissed by click the cancel button |
| 'done'    | dismissed by click the  done button |
| 'backdrop'    | dismissed by click the backdrop |

#### DaysConfig

| Name          | Type          | Default  | Description
| ------------- | ------------- | -------- | --------------- |
| cssClass      | string        | `''`     | separated by spaces|
| date          | Date          | required | configured days |
| marked        | boolean       | false    | highlight color |
| disable       | boolean       | false    | disable         |
| title         | string        | none     | displayed title eg: `'today'`      |
| subTitle      | string        | none     | subTitle subTitle eg: `'New Year\'s'` |

### CalendarResult

| Name          | Type    |
| ------------- | ------- |
| time          | number  |
| unix          | number  |
| dateObj       | Date    |
| string        | string  |
| years         | number  |
| months        | number  |
| date          | number  |

# Contributing

1. Fork it!
2. Create your feature branch: git checkout -b my-new-feature
3. Commit your changes: git commit -am 'Add some feature'
4. Push to the branch: git push origin my-new-feature
5. Submit a pull request :D

### Development

```bash
cd ./src
npm install
npm run ionic:serve
# do something in ./src/src/components/ion2-calendar
```

### Build

```bash
npm run build
```

## Thanks for reading

[npm-url]: https://www.npmjs.com/package/ion2-calendar
[npm-image]: https://img.shields.io/npm/v/ion2-calendar.svg

[downloads-image]: https://img.shields.io/npm/dm/ion2-calendar.svg
[downloads-url]: http://badge.fury.io/js/ion2-calendar

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE
