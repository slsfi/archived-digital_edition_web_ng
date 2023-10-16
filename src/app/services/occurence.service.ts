import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { config } from '@config';
import { convertNamedEntityTypeForBackend } from '@utility-functions';


@Injectable({
  providedIn: 'root',
})
export class OccurrenceService {
  projectAPIBaseURL: string = '';

  constructor(private http: HttpClient) {
    this.projectAPIBaseURL = config.app.apiEndpoint + '/' + config.app.machineName;
  }

  getMediaData(object_type: string, id: string): Observable<any> {
    object_type = convertNamedEntityTypeForBackend(object_type);
    const url = this.projectAPIBaseURL + '/media/data/' + object_type + '/' + id;
    return this.http.get(url);
  }

  getGalleryOccurrences(object_type: any, id: any) {
    object_type = convertNamedEntityTypeForBackend(object_type);
    const url = this.projectAPIBaseURL + '/gallery/' + object_type + '/connections/' + id + '/1';
    return this.http.get(url);
  }

  getArticleData(object_type: string, id: string): Observable<any> {
    object_type = convertNamedEntityTypeForBackend(object_type);
    const url = this.projectAPIBaseURL + '/media/articles/' + object_type + '/' + id;
    return this.http.get(url);
  }
}
