import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { AboutPage } from './about';
import { AboutPageRoutingModule } from './about-routing.module';

@NgModule({
  declarations: [
    AboutPage
  ],
  imports: [
    CommonModule,
    IonicModule,
    AboutPageRoutingModule,
  ],
  entryComponents: [
    AboutPage
  ]
})
export class AboutPageModule {}
