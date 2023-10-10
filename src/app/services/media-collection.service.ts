import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/assets/config/config';


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

  getNamedEntityOccInMediaColls(namedEntityType: string, namedEntityID: any): Observable<any> {
    const url = this.projectAPIBaseURL + '/gallery/' + namedEntityType + '/connections/' + namedEntityID;
    return this.http.get(url);
  }

  getAllNamedEntityOccInMediaCollsByType(entityType: string, mediaCollectionID?: string): Observable<any> {
    entityType = (entityType === 'person') ? 'subject'
      : (entityType === 'place') ? 'location'
      : (entityType === 'keyword') ? 'tag'
      : entityType;
    
    const url = this.projectAPIBaseURL + '/gallery/connections/' + entityType
                + (mediaCollectionID ? '/' + mediaCollectionID : '');
    return this.http.get(url);
  }

  getMediaMetadata(id: string, language: string): Observable<any> {
    const url = this.projectAPIBaseURL + '/media/image/metadata/' + id + '/' + language;
    return this.http.get(url);
  }

}
