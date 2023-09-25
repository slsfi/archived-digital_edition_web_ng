import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { TextChangerComponent } from 'src/app/components/text-changer/text-changer';
import { CollectionCoverPageRoutingModule } from './collection-cover-routing.module';
import { CollectionCoverPage } from './collection-cover';

@NgModule({
  declarations: [
    CollectionCoverPage,
  ],
  imports: [
    CommonModule,
    IonicModule,
    TextChangerComponent,
    CollectionCoverPageRoutingModule
  ],
})
export class CollectionCoverPageModule {}
