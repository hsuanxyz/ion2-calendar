import { NgModule } from '@angular/core';
import { ModalBasicComponent } from './modal-basic';
import { IonicModule } from "ionic-angular";
import { MyApp } from "../app/app.component";
@NgModule({
  declarations: [ModalBasicComponent],
  imports: [IonicModule.forRoot(MyApp)],
  exports: [ModalBasicComponent]
})
export class DemosModule {}
