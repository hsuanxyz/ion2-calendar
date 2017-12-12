# 📅 ion2-calendar

[![Dependency Status](https://david-dm.org/HsuanXyz/ion2-calendar.svg)](https://david-dm.org/HsuanXyz/ion2-calendar)
[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][downloads-url]
[![MIT License][license-image]][license-url]

![date](https://github.com/HsuanXyz/hsuanxyz.github.io/blob/master/assets/ion2-calendar/calendar.png?raw=true)

<p align="center">
    <img width="800" src="https://github.com/HsuanXyz/hsuanxyz.github.io/blob/master/assets/ion2-calendar/calendar-1.png?raw=true">
</p>


### 新增支持显示range时间段 (在SINGLE、MUTLI模式下)
 ![pins-demo](./resources/pins-demo.png)

这种需求存在于需要标记出来一段时间，例如孕妇的当前孕周，月经周期中的安全期等...
用法是在 options 添加pins属性，支持‘YYYY-MM-DD'字符串格式的时间段

```typescript
  options: CalendarComponentOptions = {
    pickMode: 'single',  // single or mutli
    pins: ['2018-01-10', '2018-01-17'] // not worked in range mode.
  };
```


- 支持日期范围
- 支持多选
- 支持HTML组件
- 可按周数禁用日期
- 可按天设置事件
- 支持本地化
- Material 风格

# 支持

- ionic-angular `^3.0.0`

# Demo
live demo [click me](https://hsuanxyz.github.io/demo/ion2-calendar/).

# 使用
### 安装
`$ npm install ion2-calendar moment --save`

### 引入模块

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

# HTML 组件模式

### 基本

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

### 日期范围

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

### 日期多选

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

### 输入属性
| Name            | Type          | Default        | Description |
| --------------- | ------------- | -------------- | ----------- |
| options         | CalendarComponentOptions| null | 配置选项对象     |
| format          | string        | 'YYYY-MM-DD'   | 格式 |
| type            | string        | 'string'       | 类型 |
| readonly        | boolean        | false         | 只读 |

### 输出属性
| Name            | Type          |  Description |
| --------------- | ------------- |  ----------- |
| onChange         | EventEmitter|   模型被改变    |
| monthChange      | EventEmitter |  月份被改变  |

### CalendarComponentOptions
| Name            | Type          | Default       | Description |
| --------------- | ------------- | ------------- | ----------- |
| from            | Date          | `new Date()`  | 开始日期  |
| to              | Date          |  0 (Infinite) | 结束日期    |
| color           | string        | `'primary'`   | 颜色 'primary', 'secondary', 'danger', 'light', 'dark' |
| pickMode         | string       | `single`        | 模式 'multi', 'range', 'single'     |
| showToggleButtons  | boolean       | `true`        | 显示月份切换按钮 |
| showMonthPicker  | boolean       | `true`        | 显示月份选择器 |
| monthPickerFormat  | Array<string>       | `['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']` | 月份选择器格式  |
| defaultTitle | string | ''          | 每天的默认标题            |
| defaultSubtitle | string | ''          | 每天的默认副标题            |
| disableWeeks | Array<number> | `[]`          | 按周数禁用 (0-6)                   |
| monthFormat      | string        | `'MMM YYYY'`  | 标题格式  |
| weekdays   | Array<string> | `['S', 'M', 'T', 'W', 'T', 'F', 'S']` | 每周显示文本 |
| weekStart    | number        | `0` (0 or 1)           | 每周从星期几开始 |
| daysConfig      | Array<***DaysConfig***> | `[]` | 按天配置 |

# 模态框模式

### 基本

引入 ion2-calendar 到你的组件控制器。

```typescript
import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { CalendarModal, CalendarModalOptions, DayConfig } from "ion2-calendar";

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

    myCalendar.onDidDismiss(date => {
      console.log(date);
    })
  }

}
```

### 日期范围

设置 pickMode 为 'range'.

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

        myCalendar.onDidDismiss(date => {
          console.log(date);
        });
  }
```

### 多选日期

设置 pickMode 为 'multi'。

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

        myCalendar.onDidDismiss(date => {
          console.log(date);
        })
      }
```

### 禁用周

使用周索引 例子: `[0, 6]` 禁用周末.

```typescript
  openCalendar() {
    const options: CalendarModalOptions = {
      disableWeeks: [0, 6]
    };

    let myCalendar =  this.modalCtrl.create(CalendarModal, {
      options: options
    });

    myCalendar.present();

    myCalendar.onDidDismiss(date => {
      console.log(date);
    });
  }
```

### 本地化

你的根模块

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

    myCalendar.onDidDismiss(date => {
      console.log(date);
    });
  }
```

### Days config

单独设置某一天或者多天

```javascript
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

    myCalendar.onDidDismiss(date => {
      console.log(date);
    });
  }
```

# API

## 模态框控制器选项

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
| defaultTitle | string | ''          | 每天的默认标题            |
| defaultSubtitle | string | ''          | 每天的默认副标题            |
| cssClass        | string        | `''`          | 将自定义 class 插入 模态框顶级，多个用逗号分割|
| canBackwardsSelected        | boolean        | `false`        | 能否向后滚动 |
| pickMode         | string       | `single`        | 'multi', 'range', 'single'     |
| disableWeeks | Array<number> | `[]`          | 按周数禁用 (0-6)                   |
| closeLabel      | string        | `CANCEL`      | 关闭按钮标题 |
| doneLabel      | string        | `DONE`      | 完成按钮标题 |
| closeIcon      | boolean        | `false`      | 使用关闭图标按钮 |
| doneIcon      | boolean        | `false`      | 使用完成图标按钮  |
| monthFormat      | string        | `'MMM YYYY'`  | 月份显示格式  |
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

### onDidDismiss 返回字段 [, param1]
| pickMode      | Type  |
| ------------- | ----- |
| single        | { date:  ***CalendarResult*** }  |
| range         | { from: ***CalendarResult***, to: ***CalendarResult*** }  |
| multi         | Array<***CalendarResult***>   |

### onDidDismiss 返回字段 [, param2]
| Value      | Description  |
| --------- | ----- |
| 'cancel'    | 通过取消按钮关闭 |
| 'done'    | 通过完成按钮关闭 |
| 'backdrop'    | 点击背景关闭 |

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

## 感谢阅读

[npm-url]: https://www.npmjs.com/package/ion2-calendar
[npm-image]: https://img.shields.io/npm/v/ion2-calendar.svg

[downloads-image]: https://img.shields.io/npm/dm/ion2-calendar.svg
[downloads-url]: http://badge.fury.io/js/ion2-calendar

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE
