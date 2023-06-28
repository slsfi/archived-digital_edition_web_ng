import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from "src/assets/config/config";


@Injectable({
  providedIn: 'root',
})
export class DigitalEditionListService {
  private digitalEditionsUrl = '/collections';
  private multilingualTOC = false;

  constructor(
    private http: HttpClient,
    @Inject(LOCALE_ID) private activeLocale: string
  ) {
    this.multilingualTOC = config.app?.i18n?.multilingualCollectionTableOfContents ?? false;
  }

  getDigitalEditions(): Observable<any> {
    let url = config.app.apiEndpoint + '/' + config.app.machineName + this.digitalEditionsUrl;
    if (this.multilingualTOC) {
      url += '/' + this.activeLocale;
    }
    return this.http.get(url);
  }

}
