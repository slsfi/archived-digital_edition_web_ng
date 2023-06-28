import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from "@angular/router";
import { IonicModule } from '@ionic/angular';
import { PipesModule } from 'src/pipes/pipes.module';
import { DigitalEditionListService } from 'src/app/services/digital-edition-list.service';
import { DigitalEditionList } from './digital-edition-list.component';

@NgModule({
  declarations: [DigitalEditionList],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PipesModule,
    RouterLink
  ],
  exports: [DigitalEditionList],
  providers: [DigitalEditionListService]
})
export class DigitalEditionListModule {}
