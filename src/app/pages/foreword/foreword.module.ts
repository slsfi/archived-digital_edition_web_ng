import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from 'src/app/components/components.module';
import { ForewordPage } from './foreword';
import { ForewordPageRoutingModule } from './foreword-routing.module';

@NgModule({
  declarations: [
    ForewordPage,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ComponentsModule,
    ForewordPageRoutingModule
  ],
})
export class ForewordPageModule {}
