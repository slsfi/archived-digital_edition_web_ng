import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from "@angular/router";
import { IonicModule } from '@ionic/angular';

import { ParentChildPagePathPipe } from 'src/pipes/parent-child-page-path.pipe';
import { DigitalEditionListService } from 'src/app/services/digital-edition-list.service';
import { DigitalEditionList } from './digital-edition-list.component';

@NgModule({
  declarations: [DigitalEditionList],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterLink,
    ParentChildPagePathPipe
  ],
  exports: [DigitalEditionList],
  providers: [DigitalEditionListService]
})
export class DigitalEditionListModule {}
