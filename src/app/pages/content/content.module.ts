import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ContentGridComponent } from '@components/content-grid/content-grid';
import { ContentPage } from './content';
import { ContentPageRoutingModule } from './content-routing.module';


@NgModule({
  declarations: [
    ContentPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContentGridComponent,
    ContentPageRoutingModule
  ],
  entryComponents: [
    ContentPage
  ]
})
export class ContentPageModule { }
