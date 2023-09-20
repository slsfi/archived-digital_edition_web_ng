import { NgModule } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { DigitalEditionListModule } from 'src/app/components/digital-edition-list/digital-edition-list.module';
import { IonicModule } from '@ionic/angular';
import { HomePageRoutingModule } from './home-routing.module';
import { CommonModule } from '@angular/common';
import { HomePage } from './home';

@NgModule({
    declarations: [
      HomePage,
    ],
    imports: [
      CommonModule,
      IonicModule,
      ComponentsModule,
      DigitalEditionListModule,
      ComponentsModule,
      HomePageRoutingModule,
    ],
    providers: [],
  })
  export class HomePageModule {}
