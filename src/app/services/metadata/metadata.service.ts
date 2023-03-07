import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../languages/language.service';
import { config } from "src/app/services/config/config";
import { DOCUMENT } from "@angular/common";

/*
  Generated class for the MetadataService provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class MetadataService {
  private siteMetadata: Object | any;
  private appName?: String;
  constructor(
    private languageService: LanguageService,
    private translate: TranslateService,

    @Inject(DOCUMENT) private _doc: Document
  )
  {
    this.siteMetadata = config.siteMetaData ?? {};
  }

  clearHead() {
    // Try to remove all META-Informaiton
    this.removeDescription();
    this.removeKeywords();
    this.removeStructuredData();
    // Add standard structured data
    this.addStructuredDataWebSite();
    this.addStructuredDataOrganisation();
  }

  removeDescription() {
    // Try to remove META-Tags
    try {
      this._doc.querySelector('meta[name=\'description\']')?.remove();
    } catch (e) {

    }
  }

  addDescription(content?: any) {
    this.languageService.getLanguage().subscribe((lang: string) => {
      this.translate.get('Site.Title').subscribe({
        next: siteTitle => {
          // Add the new META-Tags
          const description = this._doc.createElement('meta');
          description.name = 'description';
          if ( !content ) {
            description.content = siteTitle + ' - ' + this.siteMetadata['description'];
          } else {
            description.content = siteTitle + ' - ' + content;
          }
          this._doc.getElementsByTagName('head')[0].appendChild(description);
        },
        error: e => {}
      });
    });
  }

  removeKeywords() {
    // Try to remove META-Tags
    try {
      this._doc.querySelector('meta[name=\'keywords\']')?.remove();
    } catch (e) {

    }
  }

  addKeywords(content?: any) {
    const keywords = this._doc.createElement('meta');
    keywords.name = 'keywords';
    if ( !content ) {
      keywords.content = this.siteMetadata['keywords'];
    } else {
      keywords.content = content;
    }
    this._doc.getElementsByTagName('head')[0].appendChild(keywords);
  }

  removeStructuredData() {
    // Remove all Structured Data
    try {
      while (this._doc.querySelector('script[type=\'application/ld+json\']')) {
        this._doc.querySelector('script[type=\'application/ld+json\']')?.remove();
      }
    } catch (e) {

    }
  }

  addStructuredDataWebSite() {
    const script = this._doc.createElement('script');
    script.type = 'application/ld+json';
    script.innerText = JSON.stringify(this.siteMetadata['website']);
    this._doc.getElementsByTagName('head')[0].appendChild(script);
  }

  addStructuredDataOrganisation() {
    const script = this._doc.createElement('script');
    script.type = 'application/ld+json';
    script.innerText = JSON.stringify(this.siteMetadata['organization']);
    this._doc.getElementsByTagName('head')[0].appendChild(script);
  }
}
