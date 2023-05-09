import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from 'src/app/components/components.module';
import { CollectionIntroductionPageRoutingModule } from './collection-introduction-routing.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollectionIntroductionPage } from './collection-introduction';

@NgModule({
  declarations: [
    CollectionIntroductionPage,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ComponentsModule,
    CollectionIntroductionPageRoutingModule
  ],
})
export class CollectionIntroductionPageModule {}
