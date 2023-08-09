import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { CollectionIntroductionPage } from './collection-introduction';
import { CollectionIntroductionPageRoutingModule } from './collection-introduction-routing.module';
import { TextChangerComponent } from 'src/app/components/text-changer/text-changer';

@NgModule({
  declarations: [
    CollectionIntroductionPage,
  ],
  imports: [
    IonicModule,
    CommonModule,
    TextChangerComponent,
    CollectionIntroductionPageRoutingModule
  ],
})
export class CollectionIntroductionPageModule {}
