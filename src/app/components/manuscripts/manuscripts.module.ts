import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManuscriptsComponent } from './manuscripts';

@NgModule({
  declarations: [ManuscriptsComponent],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  exports: [ManuscriptsComponent]
})
export class ManuscriptsModule {}
