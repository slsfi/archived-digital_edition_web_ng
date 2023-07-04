import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { config } from "src/assets/config/config";


@Injectable({
  providedIn: 'root',
})
export class ReferenceDataService {
  private referenceDataUrl = '/urn/';
  private urnResolverUrl: string;

  constructor(
    private http: HttpClient
  ) {
    this.urnResolverUrl = config.urnResolverUrl ?? 'https://urn.fi/';
  }

  getReferenceData(id: string): Observable<any> {
    // We need to double encode the URL for the API
    id = encodeURI(encodeURIComponent(id));
    return this.http.get(
      config.app.apiEndpoint + '/' + config.app.machineName + this.referenceDataUrl + id + '/'
    );
  }

  public getUrnResolverUrl() {
    return this.urnResolverUrl;
  }
}
