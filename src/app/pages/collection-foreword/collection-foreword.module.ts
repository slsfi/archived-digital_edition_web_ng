import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { CollectionForewordPage } from './collection-foreword';
import { CollectionForewordPageRoutingModule } from './collection-foreword-routing.module';
import { TextChangerComponent } from 'src/app/components/text-changer/text-changer';

@NgModule({
  declarations: [
    CollectionForewordPage,
  ],
  imports: [
    IonicModule,
    CommonModule,
    TextChangerComponent,
    CollectionForewordPageRoutingModule
  ],
})
export class CollectionForewordPageModule {}
