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

# TODO

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
