import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterPage } from './filter';

@NgModule({
  declarations: [
    FilterPage,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
  ],
})
export class FilterPageModule {}
