import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LegendComponent } from './legend';

@NgModule({
  declarations: [LegendComponent],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  exports: [LegendComponent]
})
export class LegendModule {}
