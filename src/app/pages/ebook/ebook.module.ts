import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { EbookPageRoutingModule } from './ebook-routing.module';
import { EbookPage } from './ebook';
import { EpubViewerComponent } from '@components/epub-viewer/epub-viewer';
import { PdfViewerComponent } from '@components/pdf-viewer/pdf-viewer';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        EbookPageRoutingModule,
        EpubViewerComponent,
        PdfViewerComponent,
        EbookPage
    ],
    entryComponents: [
        EbookPage
    ]
})
export class EbookPageModule {}
