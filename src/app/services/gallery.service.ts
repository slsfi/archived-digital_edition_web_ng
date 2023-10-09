import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/assets/config/config';


@Injectable({
  providedIn: 'root',
})
export class GalleryService {
  projectAPIBaseURL: string = '';

  constructor(private http: HttpClient) {
    this.projectAPIBaseURL = config.app.apiEndpoint + '/' + config.app.machineName;
  }

  getGalleries(language: string): Observable<any> {
    const url = this.projectAPIBaseURL + '/gallery/data/' + language;
    return this.http.get(url);
  }

  getGallery(id: string, lang: string): Observable<any> {
    const url = this.projectAPIBaseURL + '/gallery/data/' + id + '/' + lang;
    return this.http.get(url);
  }

  getNamedEntityGalleryOccurrences(namedEntityType: string, namedEntityID: any): Observable<any> {
    const url = this.projectAPIBaseURL + '/gallery/' + namedEntityType + '/connections/' + namedEntityID;
    return this.http.get(url);
  }

  getGalleryNamedEntityConnections(entityType: string, galleryID?: string): Observable<any> {
    entityType = (entityType === 'person') ? 'subject'
      : (entityType === 'place') ? 'location'
      : (entityType === 'keyword') ? 'tag'
      : entityType;
    
    const url = this.projectAPIBaseURL + '/gallery/connections/' + entityType + (galleryID ? '/' + galleryID : '');
    return this.http.get(url);
  }

  getMediaMetadata(id: string, lang: string): Observable<any> {
    const url = this.projectAPIBaseURL + '/media/image/metadata/' + id + '/' + lang;
    return this.http.get(url);
  }

  async getGalleryTags(id?: any): Promise<any> {
    try {
      let incId = '';
      if (id) {
        incId = '/' + id;
      }

      console.log("FETCH HERE 5!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

      const response = await fetch(
        config.app.apiEndpoint +
          '/' +
          config.app.machineName +
          '/gallery/connections/tag' +
          incId
      );
      return response.json();
    } catch (e) {}
  }

  async getGalleryLocations(id?: any): Promise<any> {
    try {
      let incId = '';
      if (id) {
        incId = '/' + id;
      }

      console.log("FETCH HERE 6!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

      const response = await fetch(
        config.app.apiEndpoint +
          '/' +
          config.app.machineName +
          '/gallery/connections/location' +
          incId
      );
      return response.json();
    } catch (e) {}
  }

  async getGallerySubjects(id?: any): Promise<any> {
    try {
      let incId = '';
      if (id) {
        incId = '/' + id;
      }

      console.log("FETCH HERE 7!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

      const response = await fetch(
        config.app.apiEndpoint +
          '/' +
          config.app.machineName +
          '/gallery/connections/subject' +
          incId
      );
      return response.json();
    } catch (e) {}
  }

}
