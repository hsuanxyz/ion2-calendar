# 📅 ion2-calendar

[![Dependency Status](https://david-dm.org/HsuanXyz/ion2-calendar.svg)](https://david-dm.org/HsuanXyz/ion2-calendar)
[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][downloads-url]
[![MIT License][license-image]][license-url]


![date](https://github.com/HsuanXyz/hsuanxyz.github.io/blob/master/assets/ion2-calendar/calendar.png?raw=true)


- 支持日期范围
- 支持多选
- 支持HTML组件
- 可按周数禁用日期
- 可按天设置事件
- 支持本地化
- Material 风格

# Demo
live demo [click me](https://hsuanxyz.github.io/demo/ion2-calendar/).

# 使用
### 按照
`$ npm install ion2-calendar@2.0.0-beta.7 moment --save`

### 引入模块

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

# 组件模式

### 基本

```html
<ion-calendar [(ngModel)]="date"
              (onChange)="onChange($event)"
              [format]="'YYYY-MM-DD'">
</ion-calendar>
```

```javascript
import { Component } from '@angular/core';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  date: string;
  constructor() { }

  onChange($event) {
    console.log($event);
  }
  ...
}
```

### 日期范围

```html
<ion-calendar [(ngModel)]="dateRange"
              [options]="optionsRange"
              [format]="'YYYY-MM-DD'">
</ion-calendar>
```

```javascript
import { Component } from '@angular/core';
import { CalendarComponentOptions } from 'ion2-calendar'
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  dateRange: { from: string; to: string; };
  optionsRange: CalendarComponentOptions = {
    pickMode: 'range'
  };
  constructor() { }
  ...
}
```

### 日期多选

```html
<ion-calendar [(ngModel)]="dateMulti"
              [options]="optionsMulti"
              [format]="'YYYY-MM-DD'">
</ion-calendar>
```

```javascript
import { Component } from '@angular/core';
import { CalendarComponentOptions } from 'ion2-calendar'
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  dateMulti: string[];
  optionsMulti: CalendarComponentOptions = {
    pickMode: 'multi'
  };
  constructor() { }
  ...
}
```

### 组件属性
| Name            | Type          | Default        | Description |
| --------------- | ------------- | -------------- | ----------- |
| options         | CalendarComponentOptions| null | 配置选项对象     |
| format          | string        | 'YYYY-MM-DD'   | 格式 |

### CalendarComponentOptions
| Name            | Type          | Default       | Description |
| --------------- | ------------- | ------------- | ----------- |
| from            | Date          | `new Date()`  | 开始日期  |
| to              | Date          |  0 (Infinite) | 结束日期    |
| color           | string        | `'primary'`   | 颜色 'primary', 'secondary', 'danger', 'light', 'dark' |
| pickMode         | string       | `single`        | 模式 'multi', 'range', 'single'     |
| disableWeeks | Array<number> | `[]`          | 按周数禁用 (0-6)                   |
| monthFormat      | string        | `'MMM yyyy'`  | 标题格式  |
| weekdays   | Array<string> | `['S', 'M', 'T', 'W', 'T', 'F', 'S']` | 每周显示文本 |
| weekStart    | number        | `0` (0 or 1)           | 每周从星期几开始 |
| daysConfig      | Array<***DaysConfig***> | `[]` | 按天配置 |

# 模态框模式

### 基本 
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

### 日期范围
设置 pickMode 为 'range'.
```javascript
openCalendar() {
    this.calendarCtrl.openCalendar({
      pickMode: 'range'
    })
    .then(res => console.log(res))
    .catch(err => console.log(err))
  }
```

### 多选日期
设置 pickMode 为 'multi'.
```javascript
openCalendar() {
    this.calendarCtrl.openCalendar({
      pickMode: 'multi'
    })
    .then(res => console.log(res))
    .catch(err => console.log(err))
  }
```

### 禁用周
使用周索引 例子: `[0, 6]` 禁用周末.
```javascript
  openCalendar() {
    this.calendarCtrl.openCalendar({
      disableWeeks: [0,6]
    })
      .then(res => console.log(res))
      .catch(err => console.log(err))
  }
```

### 本地化

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
单独设置某一天或者多天
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
| from            | Date          | `new Date()`  | 开始日期  |
| to              | Date          |  0 (Infinite) | 结束日期    |
| title           | string        | `'CALENDAR'`  | 标题       |
| color           | string        | `'primary'`   | 颜色 'primary', 'secondary', 'danger', 'light', 'dark' |
| defaultScrollTo | Date          | none          | 使进入视图是默认滚动到指定日期位置 |
| defaultDate     | Date          | none          | 默认选择的日期，适用于 'single' 模式 |
| defaultDates    | Array<Date>   | none          | 默认选择的多个日期，适用于 'multi' 模式  |
| defaultDateRange | { from: Date, to: Date }  | none  | 默认选择的日期范围，适用于 'range' 模式 |
| cssClass        | string        | `''`          | 将自定义 class 插入 模态框顶级，多个用逗号分割|
| canBackwardsSelected        | boolean        | `false`        | 能否向后滚动 |
| pickMode         | string       | `single`        | 'multi', 'range', 'single'     |
| disableWeeks | Array<number> | `[]`          | 按周数禁用 (0-6)                   |
| closeLabel      | string        | `CANCEL`      | 关闭按钮标题 |
| doneLabel      | string        | `DONE`      | 完成按钮标题 |
| closeIcon      | boolean        | `false`      | 使用关闭图标按钮 |
| doneIcon      | boolean        | `false`      | 使用完成图标按钮  |
| monthFormat      | string        | `'MMM yyyy'`  | 月份显示格式  |
| weekdays   | Array<string> | `['S', 'M', 'T', 'W', 'T', 'F', 'S']` | 星期标题 |
| weekStart    | number        | `0` (0 or 1)           | 设置每周开始时间 |
| daysConfig      | Array<***DaysConfig***> | `[]` | 按天配置 |

#### DaysConfig
| Name          | Type          | Default  | Description
| ------------- | ------------- | -------- | --------------- |
| cssClass      | string        | `''`     | 多个用逗号分开|
| date          | Date          | required | 被设置的那天 |
| marked        | boolean       | false    | 高亮 |
| disable       | boolean       | false    | 禁用         |
| title         | string        | none     | 显示为什么 eg: `'今天'`      |
| subTitle      | string        | none     | 副标题 eg: `新年` |

### ModalOptions
| Name            | Type          | Default       | Description |
| --------------- | ------------- | ------------- | ----------- |
| showBackdrop            | boolean          | true  | Whether to show the backdrop |
| enableBackdropDismiss   | boolean          | true | Whether the popover should be dismissed by tapping the backdrop   |


### 返回字段
| pickMode      | Type  |
| ------------- | ----- |
| single        | { date:  ***CalendarResult*** }  |
| range         | { from: ***CalendarResult***, to: ***CalendarResult*** }  |
| multi         | Array<***CalendarResult***>   |

### Day
| Name          | Type    | Description |
| ------------- | ------- | ----------- |
| time          | number  | 时间戳   |
| marked        | boolean | 是否高亮   |
| disable       | boolean | 禁用           |
| title         | string  | 标题   |
| subTitle      | string  | 副标题 |

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
