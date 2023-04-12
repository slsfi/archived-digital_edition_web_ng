import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from 'src/app/components/components.module';
import { IntroductionRoutingModule } from './introduction-routing.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IntroductionPage } from './introduction';

@NgModule({
  declarations: [
    IntroductionPage,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ComponentsModule,
    IntroductionRoutingModule
  ],
})
export class IntroductionPageModule {}
