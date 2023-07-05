import { Component, Inject, LOCALE_ID, Input, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { PRIMARY_OUTLET, Router, RouterModule, UrlSegment, UrlTree } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';

import { ReferenceDataService } from 'src/app/services/reference-data.service';


@Component({
  standalone: true,
  selector: 'modal-reference-data',
  templateUrl: './reference-data.modal.html',
  styleUrls: ['reference-data.modal.scss'],
  imports: [CommonModule, IonicModule, RouterModule]
})
export class ReferenceDataModal implements OnInit {
  @Input() origin: string = '';

  currentUrl: string = '';
  permaLinkTranslation: boolean = false;
  referenceData: any = {};
  thisPageTranslation: boolean = false;
  urnResolverUrl: string = '';

  constructor(
    private modalCtrl: ModalController,
    private referenceDataService: ReferenceDataService,
    private router: Router,
    @Inject(LOCALE_ID) private activeLocale: string,
    @Inject(DOCUMENT) private document: Document
  ) {
    // Get URL to use for resolving URNs
    this.urnResolverUrl = this.referenceDataService.getUrnResolverUrl();

    // Check if these label translations exist
    this.thisPageTranslation = $localize`:@@Reference.thisPage:Hänvisa till denna sida` ? true : false;
    this.permaLinkTranslation = $localize`:@@Reference.permaLink:Beständig webbadress` ? true : false;
  }

  ngOnInit() {
    const currentUrlTree: UrlTree = this.router.parseUrl(this.router.url);
    const currentUrlSegments: UrlSegment[] = currentUrlTree?.root?.children[PRIMARY_OUTLET]?.segments;
    this.currentUrl = this.document.defaultView?.location.href.split('?')[0] || '';
    this.getReferenceData(currentUrlSegments);
  }

  getReferenceData(urlSegments: UrlSegment[]): any {
    let url = '/';
    for (let i = 0; i < urlSegments?.length; i++) {
      const separator = i > 0 ? '/' : '';
      url += separator + urlSegments[i].path;
    }

    this.referenceDataService.getReferenceData('/' + this.activeLocale + url).subscribe({
      next: (data: any) => {
        if (data && Array.isArray(data) && data.length > 0) {
          if (data.length > 1) {
            for (let i = 0; i < data.length; i++) {
              if (data[i]['deleted'] === 0) {
                data = data[i];
                break;
              }
            }
          } else {
            data = data[0];
          }
        } else if (
          !data?.urn &&
          !data?.reference_text &&
          !data?.intro_reference_text
        ) {
          data = undefined;
        }

        if (data) {
          // Remove trailing comma from reference_text if present
          if (data.reference_text?.slice(-2) === ', ') {
            data.reference_text = data.reference_text.slice(0, -2);
          } else if (data.reference_text?.slice(-1) === ',') {
            data.reference_text = data.reference_text.slice(0, -1);
          }
          this.referenceData = data;
        } else if (
          urlSegments?.[0]?.path === 'collection' &&
          urlSegments?.[2]?.path === 'text' &&
          urlSegments?.length > 4
        ) {
          // Try to get URN with stripped chapter id from URL
          urlSegments.pop();
          this.getReferenceData(urlSegments);
        } else {
          this.referenceData = {};
        }
      },
      error: (e) => {
        console.error(e);
        this.referenceData = {};
      }
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

}
