import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { Parser } from 'htmlparser2';
import { DomHandler } from 'domhandler';
import { existsOne, findAll, getAttributeValue } from 'domutils';
import { render } from 'dom-serializer';

import { CommonFunctionsService } from './common-functions.service';
import { config } from "src/assets/config/config";


@Injectable({
  providedIn: 'root',
})
export class TextService {
  appMachineName: string = '';
  apiEndpoint: string = '';
  simpleApi: string = '';
  readViewTextId: string = '';
  previousReadViewTextId: string = '';
  recentCollectionTextViews: Array<any> = [];
  activeCollectionTextMobileModeView: string = '';

  constructor(
    private commonFunctions: CommonFunctionsService,
    private http: HttpClient
  ) {
    this.appMachineName = config.app?.machineName ?? '';
    this.apiEndpoint = config.app?.apiEndpoint ?? '';
    this.simpleApi = config.app?.simpleApi ?? '';
  }

  getEstablishedText(id: string): Observable<any> {
    const idParts = id.split(';')[0].split('_');
    const coll_id = idParts[0];
    const pub_id = idParts[1];
    let ch_id = '';
    if (idParts[2] !== undefined) {
      ch_id = idParts[2];
    }

    let api = this.apiEndpoint;
    if (this.simpleApi) {
      api = this.simpleApi;
    }

    const url = `${api}/${this.appMachineName}/text/${coll_id}/${pub_id}/est${
      (ch_id ? '/' + ch_id : '')
    }`;
    return this.http.get(url);
  }

  getIntroduction(id: string, lang: string): Observable<any> {
    const url = `${this.apiEndpoint}/${this.appMachineName}/text/${id}/1/inl/${lang}`;
    return this.http.get(url);
  }

  getCollectionAndPublicationByLegacyId(legacyId: string): Observable<any> {
    if (config.app?.enableCollectionLegacyIDs) {
      return this.http.get(
        `${this.apiEndpoint}/${this.appMachineName}/legacy/${legacyId}`
      );
    } else {
      return of([{coll_id: Number(legacyId.split('_')[0]), pub_id: Number(legacyId.split('_')[1])}]);
    }
  }

  getTitlePage(id: string, lang: string): Observable<any> {
    const idParts = id.split(';')[0].split('_');
    const coll_id = idParts[0];
    const pub_id = idParts.length > 1 ? idParts[1] : "1";
    const url = `${this.apiEndpoint}/${this.appMachineName}/text/${coll_id}/${pub_id}/tit/${lang}`;
    return this.http.get(url);
  }

  getForewordPage(id: string, lang: string): Observable<any> {
    const coll_id = id.split(';')[0].split('_')[0];
    const url = `${this.apiEndpoint}/${this.appMachineName}/text/${coll_id}/fore/${lang}`;
    return this.http.get(url);
  }

  /**
   * ! DON'T USE! The API endpoint this function tries to use has not been implemented.
   */
  getCoverPage(id: string, lang: string): Observable<any> {
    const idParts = id.split(';')[0].split('_');
    const coll_id = idParts[0];
    const pub_id = idParts.length > 1 ? idParts[1] : "1";
    const url = `${this.apiEndpoint}/${this.appMachineName}/text/${coll_id}/${pub_id}/cover/${lang}`;
    return this.http.get(url);
  }

  getVariants(id: string): Observable<any> {
    const idParts = id.split(';')[0].split('_');
    const coll_id = idParts[0];
    const pub_id = idParts[1];
    let ch_id = '';
    if (idParts[2] !== undefined) {
      ch_id = idParts[2];
    }

    const url = `${this.apiEndpoint}/${this.appMachineName}/text/${coll_id}/${pub_id}/var${
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

    let api = this.apiEndpoint;
    if (this.simpleApi) {
      api = this.simpleApi;
    }

    const url = `${api}/${this.appMachineName}/text/${coll_id}/${pub_id}/ms${
      (ch_id ? '/' + ch_id : '')
    }`;
    return this.http.get(url);
  }

  getTextByType(type: string, id: string): Observable<any> {
    const url = `${this.apiEndpoint}/${this.appMachineName}/text/${type}/${id}`;
    return this.http.get(url);
  }

  getCollection(id: string): Observable<any> {
    const url = `${this.apiEndpoint}/${this.appMachineName}/collection/${id}`;
    return this.http.get(url);
  }

  getCollectionPublications(collection_id: string): Observable<any> {
    const url = `${this.apiEndpoint}/${this.appMachineName}/collection/${collection_id}/publications`;
    return this.http.get(url);
  }

  getPublication(id: string): Observable<any> {
    const url = `${this.apiEndpoint}/${this.appMachineName}/publication/${id}`;
    return this.http.get(url);
  }

  getLegacyIdByPublicationId(id: string): Observable<any> {
    const url = `${this.apiEndpoint}/${this.appMachineName}/legacy/publication/${id}`;
    return this.http.get(url);
  }

  getLegacyIdByCollectionId(id: string): Observable<any> {
    const url = `${this.apiEndpoint}/${this.appMachineName}/legacy/collection/${id}`;
    return this.http.get(url);
  }

  getDownloadableIntroduction(id: string, format: string, lang: string): Observable<any> {
    const url = `${this.apiEndpoint}/${this.appMachineName}/text/downloadable/${format}/${id}/inl/${lang}`;
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

    let api = this.apiEndpoint;
    if (this.simpleApi) {
      api = this.simpleApi;
    }

    const url = `${api}/${this.appMachineName}/text/downloadable/${format}/${coll_id}/${pub_id}/est${
      (ch_id ? '/' + ch_id : '')
    }`;
    return this.http.get(url);
  }

  getEstablishedTextIllustrations(id: string): Observable<any> {
    return this.getEstablishedText(id).pipe(
      map((res) => {
        const images: any[] = [];
        if (
          res &&
          res.content &&
          res.content !== '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>File not found</body></html>'
        ) {
          const collectionID = String(id).split('_')[0];
          let text = res.content as string;
          text = this.postprocessEstablishedText(text, collectionID);

          // Parse the read text html to get all illustrations in it using
          // SSR compatible htmlparser2
          const parser = new Parser({
            onopentag(name, attributes) {
              if (name === 'img' && attributes.src) {
                if (attributes.class?.includes('est_figure_graphic')) {
                  let illustrationClass = 'illustration';
                  if (!attributes.class?.includes('hide-illustration')) {
                    illustrationClass = 'visible-illustration';
                  }
                  const image = { src: attributes.src, class: illustrationClass };
                  images.push(image);
                } else if (attributes.class?.includes('doodle') && attributes['data-id']) {
                  const image = {
                    src: 'assets/images/verk/' + attributes['data-id'].replace('tag_', '') + '.jpg',
                    class: 'doodle'
                  };
                  images.push(image);
                }
              }
            }
          });
          parser.write(text);
          parser.end();
        }
        return images;
      }),
      catchError((e: any) => {
        console.error('Error loading established text illustrations', e);
        return of([]);
      })
    );
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

    const galleries = config.collections?.mediaCollectionMappings ?? {};
    const galleryId = !this.commonFunctions.isEmptyObject(galleries)
                      ? galleries[collectionId]
                      : undefined;
    const visibleInlineIllustrations = config.collections?.visibleInlineReadTextIllustrations ?? [];

    if (text.includes('est_figure_graphic') || text.includes('assets/images/verk/')) {
      // Use SSR compatible htmlparser2 and related DOM-handling modules
      // (domhandler: https://domhandler.js.org/, domutils: https://domutils.js.org/,
      // dom-serializer: https://github.com/cheeriojs/dom-serializer)
      // to add class names to images and replace image file paths.
      const handler = new DomHandler();
      const parser = new Parser(handler);
      parser.write(text);
      parser.end();
      if (!visibleInlineIllustrations.includes(Number(collectionId))) {
        // Hide inline illustrations in the read text
        const m = findAll(
          el => String(getAttributeValue(el, 'class')).includes('est_figure_graphic'), handler.dom
        );
        m.forEach(element => {
          element.attribs.class += ' hide-illustration';
        });
      }
      const m2 = findAll(
        el => String(getAttributeValue(el, 'src')).includes('assets/images/verk/'), handler.dom
      );
      m2.forEach(element => {
        element.attribs.src = element.attribs.src.replace(
              'assets/images/verk/',
              `${this.apiEndpoint}/${this.appMachineName}/gallery/get/${galleryId}/`
        );
      });
      text = render(handler.dom, { decodeEntities: false });
    }

    return text;
  }

  readTextHasVisibleIllustrations(text: string): boolean {
    const handler = new DomHandler();
    const parser = new Parser(handler);
    parser.write(text);
    parser.end();

    return existsOne(
      el => (String(getAttributeValue(el, 'class')).includes('est_figure_graphic') &&
            !String(getAttributeValue(el, 'class')).includes('hide-illustration')), handler.dom
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
