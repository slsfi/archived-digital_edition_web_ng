import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from 'src/app/components/components.module';
import { CollectionTitlePage } from './collection-title';
import { CollectionTitlePageRoutingModule } from './collection-title-routing.module';
import { TextChangerComponent } from 'src/app/components/text-changer/text-changer';

@NgModule({
  declarations: [
    CollectionTitlePage,
  ],
  imports: [
    IonicModule,
    CommonModule,
    ComponentsModule,
    TextChangerComponent,
    CollectionTitlePageRoutingModule
  ],
})
export class CollectionTitlePageModule {}
