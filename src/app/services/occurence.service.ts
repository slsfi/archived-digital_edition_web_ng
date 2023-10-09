import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { config } from 'src/assets/config/config';


@Injectable({
  providedIn: 'root',
})
export class OccurrenceService {
  projectAPIBaseURL: string = '';

  constructor(private http: HttpClient) {
    this.projectAPIBaseURL = config.app.apiEndpoint + '/' + config.app.machineName;
  }

  getOccurences(object_type: string, id: string): Observable<any> {
    const url = config.app.apiEndpoint + '/occurrences/' + object_type + '/' + id;
    return this.http.get(url);
  }

  getMediaData(object_type: string, id: string): Observable<any> {
    const url = this.projectAPIBaseURL + '/media/data/' + object_type + '/' + id;
    return this.http.get(url);
  }

  getGalleryOccurrences(type: any, id: any) {
    const url = this.projectAPIBaseURL + '/gallery/' + type + '/connections/' + id + '/1';
    return this.http.get(url);
  }

  getArticleData(object_type: string, id: string): Observable<any> {
    const url = this.projectAPIBaseURL + '/media/articles/' + object_type + '/' + id;
    return this.http.get(url);
  }
}
