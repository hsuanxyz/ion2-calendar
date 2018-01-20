import { NgModule } from '@angular/core';
import { DemoModalBasicComponent } from './demo-modal-basic';
import { IonicModule } from "ionic-angular";
import { MyApp } from "../app/app.component";
import { DemoModalMultiComponent } from "./demo-modal-multi";
import { DemoModalRangeComponent } from "./demo-modal-range";
import { DemoModalDisableWeekComponent } from "./demo-modal-disable-week";
import { DemoModalLocaleComponent } from "./demo-modal-locale";
import { DemoModalCustomStyleComponent } from "./demo-modal-custom-style";
import { DemoModalDefaultScrollComponent } from "./demo-modal-default-scroll";
import { DemoModalConfigDaysComponent } from "./demo-modal-config-days";

const COMPONENTS = [
  DemoModalBasicComponent,
  DemoModalMultiComponent,
  DemoModalRangeComponent,
  DemoModalDisableWeekComponent,
  DemoModalLocaleComponent,
  DemoModalCustomStyleComponent,
  DemoModalDefaultScrollComponent,
  DemoModalConfigDaysComponent
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [IonicModule.forRoot(MyApp)],
  exports: [...COMPONENTS]
})
export class DemosModule {
}
