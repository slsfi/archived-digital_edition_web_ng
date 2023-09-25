import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ContentGridComponent } from 'src/app/components/content-grid/content-grid';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home';

@NgModule({
  declarations: [
    HomePage,
  ],
  imports: [
    CommonModule,
    IonicModule,
    ContentGridComponent,
    HomePageRoutingModule,
  ],
})
export class HomePageModule {}
