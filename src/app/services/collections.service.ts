import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

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
    const locale = this.multilingualTOC ? '/' + this.activeLocale : '';
    const url = `${this.apiEndpoint}/collections${locale}`;
    return this.http.get(url);
  }

  getCollection(id: string): Observable<any> {
    const url = `${this.apiEndpoint}/collection/${id}`;
    return this.http.get(url);
  }

  getLegacyIdByCollectionId(id: string): Observable<any> {
    const url = `${this.apiEndpoint}/legacy/collection/${id}`;
    return this.http.get(url);
  }

  getLegacyIdByPublicationId(id: string): Observable<any> {
    const url = `${this.apiEndpoint}/legacy/publication/${id}`;
    return this.http.get(url);
  }

  getCollectionAndPublicationByLegacyId(legacyId: string): Observable<any> {
    if (config.collections?.enableLegacyIDs) {
      const url = `${this.apiEndpoint}/legacy/${legacyId}`;
      return this.http.get(url);
    } else {
      return of([
        {
          coll_id: Number(legacyId.split('_')[0]),
          pub_id: Number(legacyId.split('_')[1])
        }
      ]);
    }
  }

}
