import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ContentGridComponent } from 'src/app/components/content-grid/content-grid';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home';


@NgModule({
  declarations: [
    HomePage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContentGridComponent,
    HomePageRoutingModule
  ],
})
export class HomePageModule {}
