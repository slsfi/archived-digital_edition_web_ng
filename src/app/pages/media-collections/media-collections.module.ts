import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MediaCollectionsRoutingModule } from './media-collections-routing.module';
import { MediaCollectionsPage } from './media-collections';


@NgModule({
  declarations: [
    MediaCollectionsPage,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    MediaCollectionsRoutingModule
  ],
})
export class MediaCollectionsPageModule {}
