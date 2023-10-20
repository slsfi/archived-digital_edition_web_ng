import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { config } from '@config';


@Injectable({
  providedIn: 'root',
})
export class CollectionsService {
  private apiURL: string = '';
  private multilingualTOC: boolean = false;

  constructor(
    private http: HttpClient,
    @Inject(LOCALE_ID) private activeLocale: string
  ) {
    const apiBaseURL = config.app?.apiEndpoint ?? '';
    const projectName = config.app?.machineName ?? '';
    this.apiURL = apiBaseURL + '/' + projectName;
    this.multilingualTOC = config.app?.i18n?.multilingualCollectionTableOfContents ?? false;
  }

  getCollections(): Observable<any> {
    const locale = this.multilingualTOC ? '/' + this.activeLocale : '';
    const endpoint = `${this.apiURL}/collections${locale}`;
    return this.http.get(endpoint);
  }

  getCollection(id: string): Observable<any> {
    const locale = this.multilingualTOC ? '/i18n/' + this.activeLocale : '';
    const endpoint = `${this.apiURL}/collection/${id}${locale}`;
    return this.http.get(endpoint);
  }

  getLegacyIdByCollectionId(id: string): Observable<any> {
    const endpoint = `${this.apiURL}/legacy/collection/${id}`;
    return this.http.get(endpoint);
  }

  getLegacyIdByPublicationId(id: string): Observable<any> {
    const endpoint = `${this.apiURL}/legacy/publication/${id}`;
    return this.http.get(endpoint);
  }

  getCollectionAndPublicationByLegacyId(legacyId: string): Observable<any> {
    if (config.collections?.enableLegacyIDs) {
      const endpoint = `${this.apiURL}/legacy/${legacyId}`;
      return this.http.get(endpoint);
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
