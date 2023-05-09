import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from 'src/app/components/components.module';
import { CollectionTitlePage } from './collection-title';
import { CollectionTitlePageRoutingModule } from './collection-title-routing.module';

@NgModule({
  declarations: [
    CollectionTitlePage,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ComponentsModule,
    CollectionTitlePageRoutingModule
  ],
})
export class CollectionTitlePageModule {}
