import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VariationsComponent } from './variations';

@NgModule({
  declarations: [VariationsComponent],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  exports: [VariationsComponent]
})
export class VariationsModule {}
