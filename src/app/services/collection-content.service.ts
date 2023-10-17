import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from '@config';


@Injectable({
  providedIn: 'root',
})
export class CollectionContentService {
  activeCollectionTextMobileModeView: string = '';
  previousReadViewTextId: string = '';
  readViewTextId: string = '';
  recentCollectionTextViews: any[] = [];

  private apiEndpoint: string = '';

  constructor(
    private http: HttpClient
  ) {
    const apiURL = config.app?.apiEndpoint ?? '';
    const machineName = config.app?.machineName ?? '';
    this.apiEndpoint = apiURL + '/' + machineName;
  }

  getTitle(id: string, language: string): Observable<any> {
    const url = `${this.apiEndpoint}/text/${id}/1/tit/${language}`;
    return this.http.get(url);
  }

  getForeword(id: string, language: string): Observable<any> {
    const url = `${this.apiEndpoint}/text/${id}/fore/${language}`;
    return this.http.get(url);
  }

  getIntroduction(id: string, language: string): Observable<any> {
    const url = `${this.apiEndpoint}/text/${id}/1/inl/${language}`;
    return this.http.get(url);
  }

  getReadText(id: string): Observable<any> {
    const idParts = id.split(';')[0].split('_');
    const ch_id = idParts.length > 2 ? '/' + idParts[2] : '';
    const url = `${this.apiEndpoint}/text/${idParts[0]}/${idParts[1]}/est${ch_id}`;
    return this.http.get(url);
  }

  getManuscripts(id: string): Observable<any> {
    const idParts = id.split(';')[0].split('_');
    const ch_id = idParts.length > 2 ? '/' + idParts[2] : '';
    const url = `${this.apiEndpoint}/text/${idParts[0]}/${idParts[1]}/ms${ch_id}`;
    return this.http.get(url);
  }

  getVariants(id: string): Observable<any> {
    const idParts = id.split(';')[0].split('_');
    const ch_id = idParts.length > 2 ? '/' + idParts[2] : '';
    const url = `${this.apiEndpoint}/text/${idParts[0]}/${idParts[1]}/var${ch_id}`;
    return this.http.get(url);
  }

  getFacsimiles(id: string): Observable<any> {
    const idParts = id.split(';')[0].split('_');
    const ch_id = idParts.length > 2 ? '/' + idParts[2].replace('ch', '') : '';
    const url = `${this.apiEndpoint}/facsimiles/${idParts[1]}${ch_id}`;
    return this.http.get(url);
  }

  getMetadata(pub_id: string, language: string): Observable<any> {
    const url = `${this.apiEndpoint}/publications/${pub_id}/metadata/${language}`;
    return this.http.get(url);
}

  getDownloadableIntroduction(id: string, format: string, lang: string): Observable<any> {
    const url = `${this.apiEndpoint}/text/downloadable/${format}/${id}/inl/${lang}`;
    return this.http.get(url);
  }

  getDownloadableReadText(id: string, format: string): Observable<any> {
    const idParts = id.split(';')[0].split('_');
    const ch_id = idParts.length > 2 ? '/' + idParts[2] : '';
    const url = `${this.apiEndpoint}/text/downloadable/`
          + `${format}/${idParts[0]}/${idParts[1]}/est${ch_id}`;
    return this.http.get(url);
  }

}
