import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { TextCacheService } from './text-cache.service';
import { config } from "src/app/services/config/config";

@Injectable()
export class TextService {
  private introductionUrl = '/text/{c_id}/{p_id}/inl/{lang}';
  private introductionUrlDownloadable =
    '/text/downloadable/{format}/{c_id}/inl/{lang}';

  textCache: any;
  apiEndPoint: string;

  simpleApi?: string;
  useSimpleApi = false;

  appMachineName: string;

  readViewTextId: string;
  previousReadViewTextId: string;
  variationsOrder: number[] = [];
  recentPageReadViews: Array<any> = [];

  /* A more logical place for the activeTocOrder variable would be the table-of-contents service,
     but due to the way it's set up it can't be a singleton service. That's why activeTocOrder
     is in this service. */
  activeTocOrder: string;

  constructor(
    private cache: TextCacheService,
    private http: HttpClient
  ) {
    this.appMachineName = config.app?.machineName ?? '';
    this.apiEndPoint = config.app?.apiEndpoint ?? '';

    try {
      const simpleApi = config.app?.simpleApi ?? '';
      if (simpleApi) {
        this.useSimpleApi = true;
        this.simpleApi = simpleApi;
      }
    } catch (e) {}

    this.readViewTextId = '';
    this.previousReadViewTextId = '';
    this.variationsOrder = [];
    this.activeTocOrder = 'thematic';
  }

  getEstablishedText(id: string): Observable<any> {
    const c_id = `${id}`.split('_')[0] as any;
    const pub_id = `${id}`.split('_')[1];
    let ch_id = null;
    if (`${id}`.split('_')[2] !== undefined) {
      ch_id = String(`${id}`.split('_')[2]).split(';')[0];
    }

    if (ch_id === '' || ch_id === 'nochapter') {
      ch_id = null;
    }

    let api = this.apiEndPoint;
    if (this.useSimpleApi) {
      api = this.simpleApi as string;
    }
    const url = `${api}/${this.appMachineName}/text/${c_id}/${pub_id}/est${
      ch_id === null ? '' : '/' + ch_id
    }`;

    return this.http.get(url);
  }

  getIntroduction(id: string, lang: string): Observable<any> {
    const path = this.introductionUrl
      .replace('{c_id}', id)
      .replace('{p_id}', '1')
      .replace('{lang}', lang);

    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        path
    );
  }

  getCollectionAndPublicationByLegacyId(legacyId: string): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/legacy/' +
        legacyId
    );
  }

  getTitlePage(id: string, lang: string): Observable<any> {
    const data = `${id}`.split('_');
    const c_id = data[0];
    const pub_id = data.length > 1 ? data[1] : 1;

    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/text/' +
        c_id +
        '/' +
        pub_id +
        '/tit/' +
        lang
    );
  }

  getForewordPage(id: string, lang: string): Observable<any> {
    const data = `${id}`.split('_');
    const c_id = data[0];

    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/text/' +
        c_id +
        '/fore/' +
        lang
    );
  }

  getCoverPage(id: string, lang: string): Observable<any> {
    const data = `${id}`.split('_');
    const c_id = data[0];
    const pub_id = data.length > 1 ? data[1] : 1;

    /**
     * ! The API endpoint below has not been implemented.
     */
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/text/' +
        c_id +
        '/' +
        pub_id +
        '/cover/' +
        lang
    );
  }

  getVariations(id: string): Observable<any> {
    const c_id = `${id}`.split('_')[0];
    const pub_id = `${id}`.split('_')[1];
    let chapter = `${id}`.split('_')[2];
    if (chapter !== undefined && chapter !== null) {
      chapter = chapter.split(';')[0];
    }
    const url =
      config.app.apiEndpoint +
      '/' +
      config.app.machineName +
      '/text/' +
      c_id +
      '/' +
      pub_id +
      '/var' +
      (chapter ? '/' + chapter + '' : '');
    return this.http.get(url);
  }

  getManuscripts(id: string, chapter?: string): Observable<any> {
    const c_id = `${id}`.split('_')[0];
    const pub_id = `${id}`.split('_')[1];

    if (chapter !== undefined && chapter !== null) {
      chapter = String(chapter).split(';')[0];
    }

    let api = this.apiEndPoint;
    if (this.useSimpleApi && this.simpleApi) {
      api = this.simpleApi;
    }

    return this.http.get(
      api +
        '/' +
        config.app.machineName +
        '/text/' +
        c_id +
        '/' +
        pub_id +
        '/ms' +
        (chapter ? '/' + chapter + '' : '')
    );
  }

  getTextByType(type: string, id: string): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/text/' +
        type +
        '/' +
        id
    );
  }

  getCollection(id: string): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/collection/' +
        id
    );
  }

  getCollectionPublications(collection_id: string): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/collection/' +
        collection_id +
        '/publications'
    );
  }

  getPublication(id: string): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/publication/' +
        id
    );
  }

  getLegacyIdByPublicationId(id: string): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/legacy/publication/' +
        id
    );
  }

  getLegacyIdByCollectionId(id: string): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/legacy/collection/' +
        id
    );
  }

  getDownloadableIntroduction(
    id: string,
    format: string,
    lang: string
  ): Observable<any> {
    const path = this.introductionUrlDownloadable
      .replace('{format}', format)
      .replace('{c_id}', id)
      .replace('{lang}', lang);

    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        path
    );
  }

  getDownloadableEstablishedText(id: string, format: string): Observable<any> {
    const c_id = `${id}`.split('_')[0];
    const pub_id = `${id}`.split('_')[1];
    let ch_id = null;
    if (`${id}`.split('_')[2] !== undefined) {
      ch_id = String(`${id}`.split('_')[2]).split(';')[0];
    }

    if (ch_id === '' || ch_id === 'nochapter') {
      ch_id = null;
    }

    let api = this.apiEndPoint;
    if (this.useSimpleApi && this.simpleApi) {
      api = this.simpleApi;
    }
    const url = `${api}/${
      this.appMachineName
    }/text/downloadable/${format}/${c_id}/${pub_id}/est${
      ch_id === null ? '' : '/' + ch_id
    }`;

    return this.http.get(url);
  }

  postprocessEstablishedText(text: string, collectionId: string) {
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
