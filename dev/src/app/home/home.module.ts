import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import { CalendarModule } from '../../ion2-calendar';
import { DemosModule } from '../../demos/demos.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalendarModule,
    DemosModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage,
      },
    ]),
  ],
  declarations: [HomePage],
})
export class HomePageModule {}
