import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from 'src/app/components/components.module';
import { CollectionForewordPage } from './collection-foreword';
import { CollectionForewordPageRoutingModule } from './collection-foreword-routing.module';

@NgModule({
  declarations: [
    CollectionForewordPage,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ComponentsModule,
    CollectionForewordPageRoutingModule
  ],
})
export class CollectionForewordPageModule {}
