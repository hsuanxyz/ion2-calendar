import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalModePage } from './modal-mode';

@NgModule({
  declarations: [
    ModalModePage,
  ],
  entryComponents: [
  ],
  imports: [
    IonicPageModule.forChild(ModalModePage),
  ],
})
export class ModalModePageModule {}
