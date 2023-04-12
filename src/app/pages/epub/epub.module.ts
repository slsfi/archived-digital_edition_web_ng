import { NgModule } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { EpubComponent } from 'src/app/components/epub/epub';
import { IonicModule, NavParams } from '@ionic/angular';
import { ComponentsModule } from 'src/app/components/components.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EpubPageRoutingModule } from './epub-routing.module';
import { EpubPage } from './epub';

@NgModule({
    schemas: [
        NO_ERRORS_SCHEMA
    ],
    declarations: [
        EpubPage,
        EpubComponent
    ],
    imports: [
      IonicModule,
      CommonModule,
      FormsModule,
      ComponentsModule,
      EpubPageRoutingModule
    ],
    providers: [
      NavParams
    ],
    entryComponents: [
      EpubPage
    ]
  })
  export class EpubModule {}
