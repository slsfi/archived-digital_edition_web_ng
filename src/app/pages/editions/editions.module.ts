import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from 'src/app/components/components.module';
import { DigitalEditionListModule } from 'src/app/components/digital-edition-list/digital-edition-list.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EditionsPage } from './editions';
import { EditionsPageRoutingModule } from './editions-routing.module';

@NgModule({
  declarations: [
    EditionsPage
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ComponentsModule,
    DigitalEditionListModule,
    EditionsPageRoutingModule
  ],
  entryComponents: [
    EditionsPage
  ],
  providers: [

  ]
})
export class EditionsPageModule { }
