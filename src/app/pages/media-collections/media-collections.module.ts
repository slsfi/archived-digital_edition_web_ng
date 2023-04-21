import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { PipesModule } from 'src/pipes/pipes.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { MediaCollectionsRoutingModule } from './media-collections-routing.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MediaCollectionsPage } from './media-collections';


@NgModule({
  declarations: [
    MediaCollectionsPage,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PipesModule,
    ComponentsModule,
    MediaCollectionsRoutingModule
  ],
})
export class MediaCollectionsPageModule {}
