import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { EbookPageRoutingModule } from './ebook-routing.module';
import { EbookPage } from './ebook';
import { EpubViewerComponent } from 'src/app/components/epub-viewer/epub-viewer';
import { PdfViewerComponent } from 'src/app/components/pdf-viewer/pdf-viewer';

@NgModule({
    declarations: [
        EbookPage
    ],
    imports: [
      IonicModule,
      CommonModule,
      FormsModule,
      EbookPageRoutingModule,
      EpubViewerComponent,
      PdfViewerComponent
    ],
    providers: [],
    entryComponents: [
      EbookPage
    ]
  })
  export class EbookPageModule {}
