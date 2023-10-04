import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { config } from 'src/assets/config/config';


@Injectable({
  providedIn: 'root',
})
export class ReferenceDataService {
  private referenceDataUrl = '/urn/';
  private urnResolverUrl: string = 'https://urn.fi/';

  constructor(
    private http: HttpClient
  ) {
    this.urnResolverUrl = config.modal?.referenceData?.URNResolverURL ?? 'https://urn.fi/';
  }

  getReferenceData(id: string): Observable<any> {
    // We need to double encode the URL for the API
    id = encodeURI(encodeURIComponent(id));
    return this.http.get(
      config.app.apiEndpoint + '/' + config.app.machineName + this.referenceDataUrl + id + '/'
    );
  }

  getUrnResolverUrl() {
    return this.urnResolverUrl;
  }
}
