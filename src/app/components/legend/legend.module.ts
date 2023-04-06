import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MarkdownModule } from 'ngx-markdown';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LegendComponent } from './legend';

@NgModule({
  declarations: [LegendComponent],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    MarkdownModule
  ],
  exports: [LegendComponent]
})
export class LegendModule {}
