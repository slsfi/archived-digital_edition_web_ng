import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from '@config';
import { convertNamedEntityTypeForBackend } from '@utility-functions';


@Injectable({
  providedIn: 'root',
})
export class MediaCollectionService {
  private apiEndpoint: string = '';

  constructor(private http: HttpClient) {
    const apiURL = config.app?.apiEndpoint ?? '';
    const machineName = config.app?.machineName ?? '';
    this.apiEndpoint = apiURL + '/' + machineName;
  }

  getMediaCollections(language: string): Observable<any> {
    const url = this.apiEndpoint + '/gallery/data/' + language;
    return this.http.get(url);
  }

  getSingleMediaCollection(mediaCollectionID: string, language: string): Observable<any> {
    const url = this.apiEndpoint + '/gallery/data/' + mediaCollectionID + '/' + language;
    return this.http.get(url);
  }

  getNamedEntityOccInMediaColls(entityType: string, entityID: any): Observable<any> {
    entityType = convertNamedEntityTypeForBackend(entityType);
    const url = this.apiEndpoint + '/gallery/' + entityType + '/connections/' + entityID;
    return this.http.get(url);
  }

  getAllNamedEntityOccInMediaCollsByType(entityType: string, mediaCollectionID?: string): Observable<any> {
    entityType = convertNamedEntityTypeForBackend(entityType);
    const url = this.apiEndpoint + '/gallery/connections/' + entityType
                + (mediaCollectionID ? '/' + mediaCollectionID : '');
    return this.http.get(url);
  }

  getMediaMetadata(id: string, language: string): Observable<any> {
    const url = this.apiEndpoint + '/media/image/metadata/' + id + '/' + language;
    return this.http.get(url);
  }

}
