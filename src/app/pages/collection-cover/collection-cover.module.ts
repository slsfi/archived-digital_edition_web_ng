import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from 'src/app/components/components.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollectionCoverPageRoutingModule } from './collection-cover-routing.module';
import { CollectionCoverPage } from './collection-cover';

@NgModule({
  declarations: [
    CollectionCoverPage,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    CollectionCoverPageRoutingModule
  ],
})
export class CollectionCoverPageModule {}
