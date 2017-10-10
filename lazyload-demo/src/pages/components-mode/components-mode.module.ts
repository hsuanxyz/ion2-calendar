import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ComponentsModePage } from './components-mode';
import { CalendarModule } from "ion2-calendar";

@NgModule({
  declarations: [
    ComponentsModePage,
  ],
  imports: [
    IonicPageModule.forChild(ComponentsModePage),
    CalendarModule,
  ],
})
export class ComponentsModePageModule {}
