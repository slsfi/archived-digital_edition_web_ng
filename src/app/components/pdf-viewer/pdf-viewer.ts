import { Component, Inject, Input, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { IonicModule, ModalController } from '@ionic/angular';

import { IsExternalURLPipe } from 'src/app/pipes/is-external-url.pipe';
import { ReferenceDataModal } from '@modals/reference-data/reference-data.modal';
import { config } from 'src/assets/config/config';


@Component({
  standalone: true,
  selector: 'pdf-viewer',
  templateUrl: 'pdf-viewer.html',
  styleUrls: ['pdf-viewer.scss'],
  imports: [CommonModule, IonicModule, IsExternalURLPipe],
  host: {ngSkipHydration: 'true'}
})
export class PdfViewerComponent implements OnInit {
  @Input() pdfFileName: string = '';
  @ViewChild('downloadOptionsPopover') downloadOptionsPopover: any;
  
  downloadPopoverIsOpen: boolean = false;
  pdfData: Record<string, any> = {};
  pdfURL: SafeUrl;
  showURNButton: boolean = false;
  _window: Window | null = null;

  constructor(
    private modalController: ModalController,
    private sanitizer: DomSanitizer,
    @Inject(LOCALE_ID) private activeLocale: string,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.showURNButton = config.component?.epub?.showURNButton ?? false;
    this._window = <any>this.document.defaultView;
  }

  ngOnInit() {
    const availableEbooks: any[] = config.ebooks ?? [];
    for (const ebook of availableEbooks) {
      if (ebook.filename === this.pdfFileName) {
        this.pdfData = ebook;
        break;
      }
    }

    let pdfFilePath = (this._window?.location.origin ?? '')
          + (this._window?.location.pathname.split('/')[1] === this.activeLocale ? '/' + this.activeLocale : '')
          + '/assets/ebooks/'
          + this.pdfFileName;
    
    if (this.pdfData.externalFileURL) {
      pdfFilePath = this.pdfData.externalFileURL;
    }

    // console.log('Loading pdf from ', pdfFilePath);
    this.pdfURL = this.sanitizer.bypassSecurityTrustResourceUrl(pdfFilePath);
  }

  openDownloadPopover(event: any) {
    this.downloadOptionsPopover.event = event;
    this.downloadPopoverIsOpen = true;
  }

  closeDownloadPopover() {
    this.downloadPopoverIsOpen = false;
  }

  async showReference() {
    const modal = await this.modalController.create({
      component: ReferenceDataModal,
      componentProps: { origin: 'page-ebook' }
    });
    modal.present();
  }

}
