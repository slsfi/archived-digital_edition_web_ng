import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { PipesModule } from 'src/pipes/pipes.module';
import { DigitalEditionListService } from 'src/app/services/toc/digital-edition-list.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DigitalEditionList } from './digital-edition-list.component';

@NgModule({
  declarations: [DigitalEditionList],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PipesModule
  ],
  exports: [DigitalEditionList],
  providers: [DigitalEditionListService]
})
export class DigitalEditionListModule {}
