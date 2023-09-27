import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { TextChangerComponent } from 'src/app/components/text-changer/text-changer';
import { CollectionIntroductionPage } from './collection-introduction';
import { CollectionIntroductionPageRoutingModule } from './collection-introduction-routing.module';


@NgModule({
  declarations: [
    CollectionIntroductionPage,
  ],
  imports: [
    CommonModule,
    IonicModule,
    TextChangerComponent,
    CollectionIntroductionPageRoutingModule
  ],
})
export class CollectionIntroductionPageModule {}
