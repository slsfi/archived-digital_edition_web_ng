import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  getReferenceData(url: string): Observable<any> {
    // We need to double encode the URL for the API
    url = encodeURI(encodeURIComponent(url));
    const endpoint = `${config.app.apiEndpoint}/${config.app.machineName}/urn/${url}/`;
    return this.http.get(endpoint);
  }

  getUrnResolverUrl() {
    return this.urnResolverUrl;
  }
}
