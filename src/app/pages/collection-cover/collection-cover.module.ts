import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { ComponentsModule } from 'src/app/components/components.module';
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
    ComponentsModule,
    TextChangerComponent,
    CollectionCoverPageRoutingModule
  ],
})
export class CollectionCoverPageModule {}
