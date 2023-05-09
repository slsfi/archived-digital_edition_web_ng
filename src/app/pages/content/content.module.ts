import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from 'src/app/components/components.module';
import { DigitalEditionListModule } from 'src/app/components/digital-edition-list/digital-edition-list.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContentPage } from './content';
import { ContentPageRoutingModule } from './content-routing.module';

@NgModule({
  declarations: [
    ContentPage
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ComponentsModule,
    DigitalEditionListModule,
    ContentPageRoutingModule
  ],
  entryComponents: [
    ContentPage
  ],
  providers: [

  ]
})
export class ContentPageModule { }
