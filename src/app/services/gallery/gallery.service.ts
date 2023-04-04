import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, Observable } from 'rxjs';
import { config } from "src/app/services/config/config";

@Injectable()
export class GalleryService {

  constructor(
    private http: HttpClient,
    @Inject(LOCALE_ID) public activeLocale: string
  ) {
    // ! SK 3.4.2023: Why call this in the constructor?
    this.getGalleries(this.activeLocale);
  }

  async getGalleries(language: string): Promise<any> {
    try {
      // console.log("FETCH HERE 3!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

      const url = config.app.apiEndpoint + '/' + config.app.machineName + '/gallery/data/' + language
      await lastValueFrom(this.http.get(url));

      /*const response = await fetch(
        url
      );
      return response.json();*/

    } catch (e) {}
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

  getGallery(id: string, lang: string): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/gallery/data/' +
        id +
        '/' +
        lang
    );
  }

  getMediaMetadata(id: string, lang: String): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/media/image/metadata/' +
        id +
        '/' +
        lang
    );
  }

  getGalleryOccurrences(type: any, id: any): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/gallery/' +
        type +
        '/connections/' +
        id
    );
  }

  private async handleError(error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = (await error.json()) || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    throw errMsg;
  }
}
