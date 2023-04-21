import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from 'src/app/components/components.module';
import { TitlePage } from './title';
import { TitlePageRoutingModule } from './title-routing.module';

@NgModule({
  declarations: [
    TitlePage,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ComponentsModule,
    TitlePageRoutingModule
  ],
})
export class TitlePageModule {}
