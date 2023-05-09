import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VariantsComponent } from './variants';

@NgModule({
  declarations: [VariantsComponent],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  exports: [VariantsComponent]
})
export class VariantsModule {}
