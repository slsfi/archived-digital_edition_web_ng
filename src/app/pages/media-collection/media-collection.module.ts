import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PipesModule } from 'src/pipes/pipes.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { MediaCollectionRoutingModule } from './media-collection-routing.module';
import { MediaCollectionPage } from './media-collection';


@NgModule({
  declarations: [
    MediaCollectionPage,
  ],
 imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PipesModule,
    ComponentsModule,
    MediaCollectionRoutingModule
  ],
})
export class MediaCollectionPageModule {}
