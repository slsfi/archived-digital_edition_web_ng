import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from 'src/app/components/components.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoverPageRoutingModule } from './cover-routing.module';
import { CoverPage } from './cover';

@NgModule({
  declarations: [
    CoverPage,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    CoverPageRoutingModule
  ],
})
export class CoverPageModule {}
