import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/assets/config/config';
import { convertNamedEntityTypeForBackend } from 'src/standalone/utility-functions';


@Injectable({
  providedIn: 'root',
})
export class MediaCollectionService {
  projectAPIBaseURL: string = '';

  constructor(private http: HttpClient) {
    this.projectAPIBaseURL = config.app.apiEndpoint + '/' + config.app.machineName;
  }

  getMediaCollections(language: string): Observable<any> {
    const url = this.projectAPIBaseURL + '/gallery/data/' + language;
    return this.http.get(url);
  }

  getSingleMediaCollection(mediaCollectionID: string, language: string): Observable<any> {
    const url = this.projectAPIBaseURL + '/gallery/data/' + mediaCollectionID + '/' + language;
    return this.http.get(url);
  }

  getNamedEntityOccInMediaColls(entityType: string, entityID: any): Observable<any> {
    entityType = convertNamedEntityTypeForBackend(entityType);
    const url = this.projectAPIBaseURL + '/gallery/' + entityType + '/connections/' + entityID;
    return this.http.get(url);
  }

  getAllNamedEntityOccInMediaCollsByType(entityType: string, mediaCollectionID?: string): Observable<any> {
    entityType = convertNamedEntityTypeForBackend(entityType);
    
    const url = this.projectAPIBaseURL + '/gallery/connections/' + entityType
                + (mediaCollectionID ? '/' + mediaCollectionID : '');
    return this.http.get(url);
  }

  getMediaMetadata(id: string, language: string): Observable<any> {
    const url = this.projectAPIBaseURL + '/media/image/metadata/' + id + '/' + language;
    return this.http.get(url);
  }

}
