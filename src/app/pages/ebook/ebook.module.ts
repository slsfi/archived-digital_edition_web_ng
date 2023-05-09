import { NgModule } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { EpubComponent } from 'src/app/components/epub/epub';
import { IonicModule, NavParams } from '@ionic/angular';
import { ComponentsModule } from 'src/app/components/components.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EbookPageRoutingModule } from './ebook-routing.module';
import { EbookPage } from './ebook';

@NgModule({
    schemas: [
        NO_ERRORS_SCHEMA
    ],
    declarations: [
        EbookPage,
        EpubComponent
    ],
    imports: [
      IonicModule,
      CommonModule,
      FormsModule,
      ComponentsModule,
      EbookPageRoutingModule
    ],
    providers: [
      NavParams
    ],
    entryComponents: [
      EbookPage
    ]
  })
  export class EbookPageModule {}
