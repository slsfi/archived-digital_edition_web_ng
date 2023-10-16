import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from '@config';


@Injectable({
  providedIn: 'root',
})
export class CollectionsService {
  private apiEndpoint: string = '';
  private multilingualTOC: boolean = false;

  constructor(
    private http: HttpClient,
    @Inject(LOCALE_ID) private activeLocale: string
  ) {
    const apiURL = config.app?.apiEndpoint ?? '';
    const machineName = config.app?.machineName ?? '';
    this.apiEndpoint = apiURL + '/' + machineName;
    this.multilingualTOC = config.app?.i18n?.multilingualCollectionTableOfContents ?? false;
  }

  getCollections(): Observable<any> {
    let url = `${this.apiEndpoint}/collections`;
    if (this.multilingualTOC) {
      url += '/' + this.activeLocale;
    }
    return this.http.get(url);
  }

  getCollection(id: string): Observable<any> {
    const url = `${this.apiEndpoint}/collection/${id}`;
    return this.http.get(url);
  }

}
