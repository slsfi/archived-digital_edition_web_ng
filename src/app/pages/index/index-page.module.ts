import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { IndexPageRoutingModule } from './index-page-routing.module';
import { IndexPage } from './index-page';


@NgModule({
  declarations: [
    IndexPage,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IndexPageRoutingModule
  ]
})
export class IndexPageModule {}
