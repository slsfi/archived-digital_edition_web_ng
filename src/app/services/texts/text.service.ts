import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { config } from "src/app/services/config/config";

@Injectable()
export class TextService {
  appMachineName: string = '';
  apiEndPoint: string = '';
  simpleApi: string = '';

  readViewTextId: string;
  previousReadViewTextId: string;
  variationsOrder: number[] = [];
  recentPageReadViews: Array<any> = [];

  /* A more logical place for the activeTocOrder variable would be the table-of-contents service,
     but due to the way it's set up it can't be a singleton service. That's why activeTocOrder
     is in this service. */
  activeTocOrder: string;

  constructor(
    private http: HttpClient
  ) {
    this.appMachineName = config.app?.machineName ?? '';
    this.apiEndPoint = config.app?.apiEndpoint ?? '';
    this.simpleApi = config.app?.simpleApi ?? '';

    this.readViewTextId = '';
    this.previousReadViewTextId = '';
    this.variationsOrder = [];
    this.activeTocOrder = 'thematic';
  }

  getEstablishedText(id: string): Observable<any> {
    const idParts = id.split(';')[0].split('_');
    const coll_id = idParts[0];
    const pub_id = idParts[1];
    let ch_id = '';
    if (idParts[2] !== undefined) {
      ch_id = idParts[2];
    }

    let api = this.apiEndPoint;
    if (this.simpleApi) {
      api = this.simpleApi;
    }

    const url = `${api}/${this.appMachineName}/text/${coll_id}/${pub_id}/est${
      (ch_id ? '/' + ch_id : '')
    }`;
    return this.http.get(url);
  }

  getIntroduction(id: string, lang: string): Observable<any> {
    const url = `${this.apiEndPoint}/${this.appMachineName}/text/${id}/1/inl/${lang}`;
    return this.http.get(url);
  }

  getCollectionAndPublicationByLegacyId(legacyId: string): Observable<any> {
    const url = `${this.apiEndPoint}/${this.appMachineName}/legacy/${legacyId}`;
    return this.http.get(url);
  }

  getTitlePage(id: string, lang: string): Observable<any> {
    const idParts = id.split(';')[0].split('_');
    const coll_id = idParts[0];
    const pub_id = idParts.length > 1 ? idParts[1] : "1";
    const url = `${this.apiEndPoint}/${this.appMachineName}/text/${coll_id}/${pub_id}/tit/${lang}`;
    return this.http.get(url);
  }

  getForewordPage(id: string, lang: string): Observable<any> {
    const coll_id = id.split(';')[0].split('_')[0];
    const url = `${this.apiEndPoint}/${this.appMachineName}/text/${coll_id}/fore/${lang}`;
    return this.http.get(url);
  }

  /**
   * ! DON'T USE! The API endpoint this function tries to use has not been implemented.
   */
  getCoverPage(id: string, lang: string): Observable<any> {
    const idParts = id.split(';')[0].split('_');
    const coll_id = idParts[0];
    const pub_id = idParts.length > 1 ? idParts[1] : "1";
    const url = `${this.apiEndPoint}/${this.appMachineName}/text/${coll_id}/${pub_id}/cover/${lang}`;
    return this.http.get(url);
  }

  getVariations(id: string): Observable<any> {
    const idParts = id.split(';')[0].split('_');
    const coll_id = idParts[0];
    const pub_id = idParts[1];
    let ch_id = '';
    if (idParts[2] !== undefined) {
      ch_id = idParts[2];
    }

    const url = `${this.apiEndPoint}/${this.appMachineName}/text/${coll_id}/${pub_id}/var${
      (ch_id ? '/' + ch_id : '')
    }`;
    return this.http.get(url);
  }

  getManuscripts(id: string): Observable<any> {
    const idParts = id.split(';')[0].split('_');
    const coll_id = idParts[0];
    const pub_id = idParts[1];
    let ch_id = '';
    if (idParts[2] !== undefined) {
      ch_id = idParts[2];
    }

    let api = this.apiEndPoint;
    if (this.simpleApi) {
      api = this.simpleApi;
    }

    const url = `${api}/${this.appMachineName}/text/${coll_id}/${pub_id}/ms${
      (ch_id ? '/' + ch_id : '')
    }`;
    return this.http.get(url);
  }

  getTextByType(type: string, id: string): Observable<any> {
    const url = `${this.apiEndPoint}/${this.appMachineName}/text/${type}/${id}`;
    return this.http.get(url);
  }

  getCollection(id: string): Observable<any> {
    const url = `${this.apiEndPoint}/${this.appMachineName}/collection/${id}`;
    return this.http.get(url);
  }

  getCollectionPublications(collection_id: string): Observable<any> {
    const url = `${this.apiEndPoint}/${this.appMachineName}/collection/${collection_id}/publications`;
    return this.http.get(url);
  }

  getPublication(id: string): Observable<any> {
    const url = `${this.apiEndPoint}/${this.appMachineName}/publication/${id}`;
    return this.http.get(url);
  }

  getLegacyIdByPublicationId(id: string): Observable<any> {
    const url = `${this.apiEndPoint}/${this.appMachineName}/legacy/publication/${id}`;
    return this.http.get(url);
  }

  getLegacyIdByCollectionId(id: string): Observable<any> {
    const url = `${this.apiEndPoint}/${this.appMachineName}/legacy/collection/${id}`;
    return this.http.get(url);
  }

  getDownloadableIntroduction(id: string, format: string, lang: string): Observable<any> {
    const url = `${this.apiEndPoint}/${this.appMachineName}/text/downloadable/${format}/${id}/inl/${lang}`;
    return this.http.get(url);
  }

  getDownloadableEstablishedText(id: string, format: string): Observable<any> {
    const idParts = id.split(';')[0].split('_');
    const coll_id = idParts[0];
    const pub_id = idParts[1];
    let ch_id = '';
    if (idParts[2] !== undefined) {
      ch_id = idParts[2];
    }

    let api = this.apiEndPoint;
    if (this.simpleApi) {
      api = this.simpleApi;
    }

    const url = `${api}/${this.appMachineName}/text/downloadable/${format}/${coll_id}/${pub_id}/est${
      (ch_id ? '/' + ch_id : '')
    }`;
    return this.http.get(url);
  }

  postprocessEstablishedText(text: string, collectionId: string) {
    text = text.trim();
    text = this.mapIllustrationImagePaths(text, collectionId);

    // Add "tei" class to all classlists
    text = text.replace(
      /class="([a-z A-Z _ 0-9]{1,140})"/g,
      'class="tei $1"'
    );

    return text;
  }

  mapIllustrationImagePaths(text: string, collectionId: string) {
    text = text.replace(/\.png/g, '.svg');
    text = text.replace(/images\//g, 'assets/images/');
    text = text.replace(/assets\/images\/verk\/http/g, 'http');

    const showReadTextIllustrations = config.settings?.showReadTextIllustrations ?? [];
    if (showReadTextIllustrations.length > 0) {
      let galleryId = 44;
      const galleries = config.settings?.galleryCollectionMapping ?? [];
      if (galleries.length > 0) {
        galleryId = galleries[collectionId];
      }

      const regexFigure = new RegExp(/est_figure_graphic/);
      const regexAssets = new RegExp(/assets\/images\/verk\//);

      if (
        !showReadTextIllustrations.includes(collectionId) &&
        (regexFigure.test(text) || regexAssets.test(text))
      ) {
        // * The replace below should only replace in classLists, but adding a more specific 
        // * regex causes a "too much recursion" error for long texts. There used to be a
        // * DOMParser here.
        text = text.replace(
          /est_figure_graphic/g,
          'est_figure_graphic hide-illustration'
        );
        text = text.replace(
          /assets\/images\/verk\//g,
          `${this.apiEndPoint}/${this.appMachineName}/gallery/get/${galleryId}/`
        );
      }
    }
    return text;
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
