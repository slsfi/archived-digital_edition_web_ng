import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavParams } from '@ionic/angular';

import { ComponentsModule } from 'src/app/components/components.module';
import { EbookPageRoutingModule } from './ebook-routing.module';
import { EbookPage } from './ebook';
import { EpubComponent } from 'src/app/components/epub/epub';

@NgModule({
    declarations: [
        EbookPage
    ],
    imports: [
      IonicModule,
      CommonModule,
      FormsModule,
      ComponentsModule,
      EbookPageRoutingModule,
      EpubComponent
    ],
    providers: [
      NavParams
    ],
    entryComponents: [
      EbookPage
    ]
  })
  export class EbookPageModule {}
