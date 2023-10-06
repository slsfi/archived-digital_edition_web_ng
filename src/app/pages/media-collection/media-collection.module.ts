import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MediaCollectionRoutingModule } from './media-collection-routing.module';
import { MediaCollectionPage } from './media-collection';


@NgModule({
  declarations: [
    MediaCollectionPage,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MediaCollectionRoutingModule
  ],
})
export class MediaCollectionPageModule {}
