import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { config } from '@config';


@Injectable({
  providedIn: 'root',
})
export class ReferenceDataService {
  private urnResolverUrl: string = 'https://urn.fi/';

  constructor(
    private http: HttpClient
  ) {
    this.urnResolverUrl = config.modal?.referenceData?.URNResolverURL ?? 'https://urn.fi/';
  }

  getReferenceData(id: string): Observable<any> {
    // We need to double encode the URL for the API
    id = encodeURI(encodeURIComponent(id));
    const url = config.app.apiEndpoint + '/' + config.app.machineName + '/urn/' + id + '/';
    return this.http.get(url);
  }

  getUrnResolverUrl() {
    return this.urnResolverUrl;
  }
}
