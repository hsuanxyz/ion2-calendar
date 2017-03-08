# ion2-calendar

[![Dependency Status](https://david-dm.org/HsuanXyz/ion2-calendar.svg)](https://david-dm.org/HsuanXyz/ion2-calendar)
[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][downloads-url] [![MIT License][license-image]][license-url]

一个可配置与可选择范围日期的ionic2日历组件
# 使用
### 安装
`$ npm install ion2-calendar --save`
#### 如果你没有安装 moment
`$ npm install moment --save`
### 引入模块

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
### 使用
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

# 演示
[DEMO](https://hsuanxyz.github.io/hsuan.github.io/demo/ion2-calendar/)
### 选择单个日期
![date](https://github.com/HsuanXyz/hsuan.github.io/blob/master/assets/ion2-calendar/%E5%8D%95%E9%80%89%E6%97%A5%E6%9C%9F.gif?raw=true)
### 选择范围日期
![date range](https://github.com/HsuanXyz/hsuan.github.io/blob/master/assets/ion2-calendar/%E5%A4%9A%E9%80%89%E6%97%A5%E6%9C%9F.gif?raw=true)
### 按星期禁用
![disable weekdays](https://github.com/HsuanXyz/hsuan.github.io/blob/master/assets/ion2-calendar/%E7%A6%81%E7%94%A8%E6%98%9F%E6%9C%9F.gif?raw=true)
### 设置星期标题
![weekdays title](https://github.com/HsuanXyz/hsuan.github.io/blob/master/assets/ion2-calendar/%E8%87%AA%E5%AE%9A%E4%B9%89%E5%91%A8%E6%A0%87%E9%A2%98.gif?raw=true)
### 设置月份标题
![month title](https://github.com/HsuanXyz/hsuan.github.io/blob/master/assets/ion2-calendar/%E8%87%AA%E5%AE%9A%E4%B9%89%E6%9C%88%E4%BB%BD%E6%A0%87%E9%A2%98.gif?raw=true)
### 按天配置
![days config](https://github.com/HsuanXyz/hsuan.github.io/blob/master/assets/ion2-calendar/%E8%87%AA%E5%AE%9A%E4%B9%89%E5%A4%A9.gif?raw=true)
# API
## openCalendar(Options,ModalOptions)
### Options
| 参数名            | 类型          | 默认       | 描述 |
| --------------- | ------------- | ------------- | ----------- |
| from            | Date          | `new Date()`  |  开始时间 |
| to              | Date          |  0 (Infinite) |  结束时间  |
| title           | string        | `'Calendar'`  | 标题       |
| isRadio         | boolean       | `true`        | 设置是否单选 ，如果为false则选择日期范围    |
| disableWeekdays | Array<number> | `[]`          | 需要禁用的星期数 (0-6，重0开始)                   |
| closeLabel      | string        | `cancel`      | 取消按钮文字，可以为空 |
| monthTitle      | string        | `'MMM yyyy'`  | 设置月份显示格式  |
| weekdaysTitle   | Array<string> | `"Di_Lu_Ma_Me_Je_Ve_Sa".split("_")` | 星期显示格式 |
| daysConfig      | Array<***DaysConfig***> | `[]` | 按天配置 |
#### DaysConfig
| 参数名          | 类型          | 默认  | 描述     |
| ------------- | ------------- | -------- | --------------- |
| date          | Date          | 必选 | 需要配置的天数时间对象 |
| marked        | boolean       | false    | 是否高亮显示 |
| disable       | boolean       | false    | 是否禁用         |
| title         | string        | none     | 这天的标题 如"今天"      |
| subTitle      | string        | none     | 这天的副标题 如 "春节" |


### ModalOptions
| Name            | Type          | Default       | Description |
| --------------- | ------------- | ------------- | ----------- |
| showBackdrop            | boolean          | true  | 是否显示背景遮罩|
| enableBackdropDismiss   | boolean          | true | 允许通过背景遮罩关闭 |



### 输出 Promise
| 参数名          | 类型  | 描述 |
| ------------- | ----- | ----------- |
| from          | ***Day***   | 如果 isRadio 为 false 的时候才会出现，这是用户选择的开始时间 |
| to            | ***Day***   | 如果 isRadio 为 false 的时候才会出现，这是用户选择的结束时间    |
| date          | ***Day***   | 如果 isRadio 为 true 的时候才会出现 ，这是用户选择的那天       |
### Day
| Name          | Type    | Description |
| ------------- | ------- | ----------- |
| time          | number  | 时间戳   |
| marked        | boolean | 是否高亮   |
| disable       | boolean | 是否禁用           |
| title         | string  | 标题   |
| subTitle      | string  | 副标题 |

### 待办事宜
1. 添加样式设置

# 开发时的环境
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
