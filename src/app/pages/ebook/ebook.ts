import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { config } from '@config';
import { IonicModule } from '@ionic/angular';
import { PdfViewerComponent } from '../../components/pdf-viewer/pdf-viewer';
import { EpubViewerComponent } from '../../components/epub-viewer/epub-viewer';
import { NgIf } from '@angular/common';


@Component({
    selector: 'page-ebook',
    templateUrl: 'ebook.html',
    styleUrls: ['ebook.scss'],
    standalone: true,
    imports: [NgIf, EpubViewerComponent, PdfViewerComponent, IonicModule]
})
export class EbookPage implements OnInit {
  ebookType: string = '';
  filename: string = '';

  constructor(
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.filename = '';
      this.ebookType = '';
      const availableEbooks: any[] = config.ebooks ?? [];
      for (const ebook of availableEbooks) {
        if (ebook.filename === params['filename']) {
          this.filename = params['filename'];
          this.ebookType = this.filename.substring(
            this.filename.lastIndexOf('.') + 1, this.filename.length
          ) || '';
          break;
        }
      }
    });
  }

}
