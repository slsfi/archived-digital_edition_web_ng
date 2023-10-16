import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { Parser } from 'htmlparser2';
import { DomHandler } from 'domhandler';
import { existsOne, findAll, getAttributeValue } from 'domutils';
import { render } from 'dom-serializer';

import { config } from '@config';
import { isEmptyObject } from '@utility-functions';


@Injectable({
  providedIn: 'root',
})
export class TextService {
  activeCollectionTextMobileModeView: string = '';
  apiEndpoint: string = '';
  previousReadViewTextId: string = '';
  readViewTextId: string = '';
  recentCollectionTextViews: any[] = [];

  constructor(
    private http: HttpClient
  ) {
    const apiURL = config.app?.apiEndpoint ?? '';
    const machineName = config.app?.machineName ?? '';
    this.apiEndpoint = apiURL + '/' + machineName;
  }

  getCollectionForewordText(id: string, lang: string): Observable<any> {
    const url = `${this.apiEndpoint}/text/${id}/fore/${lang}`;
    return this.http.get(url);
  }

  getCollectionIntroductionText(id: string, lang: string): Observable<any> {
    const url = `${this.apiEndpoint}/text/${id}/1/inl/${lang}`;
    return this.http.get(url);
  }

  getCollectionReadText(id: string): Observable<any> {
    const idParts = id.split(';')[0].split('_');
    const ch_id = idParts.length > 2 ? '/' + idParts[2] : '';
    const url = `${this.apiEndpoint}/text/${idParts[0]}/${idParts[1]}/est${ch_id}`;
    return this.http.get(url);
  }

  getCollectionTitleText(id: string, lang: string): Observable<any> {
    const url = `${this.apiEndpoint}/text/${id}/1/tit/${lang}`;
    return this.http.get(url);
  }

  getCollectionManuscriptTexts(id: string): Observable<any> {
    const idParts = id.split(';')[0].split('_');
    const ch_id = idParts.length > 2 ? '/' + idParts[2] : '';
    const url = `${this.apiEndpoint}/text/${idParts[0]}/${idParts[1]}/ms${ch_id}`;
    return this.http.get(url);
  }

  getCollectionVariantTexts(id: string): Observable<any> {
    const idParts = id.split(';')[0].split('_');
    const ch_id = idParts.length > 2 ? '/' + idParts[2] : '';
    const url = `${this.apiEndpoint}/text/${idParts[0]}/${idParts[1]}/var${ch_id}`;
    return this.http.get(url);
  }

  getCollectionAndPublicationByLegacyId(legacyId: string): Observable<any> {
    if (config.collections?.enableLegacyIDs) {
      return this.http.get(
        `${this.apiEndpoint}/legacy/${legacyId}`
      );
    } else {
      return of([
        {
          coll_id: Number(legacyId.split('_')[0]),
          pub_id: Number(legacyId.split('_')[1])
        }
      ]);
    }
  }

  getLegacyIdByPublicationId(id: string): Observable<any> {
    const url = `${this.apiEndpoint}/legacy/publication/${id}`;
    return this.http.get(url);
  }

  getLegacyIdByCollectionId(id: string): Observable<any> {
    const url = `${this.apiEndpoint}/legacy/collection/${id}`;
    return this.http.get(url);
  }

  getDownloadableIntroduction(id: string, format: string, lang: string): Observable<any> {
    const url = `${this.apiEndpoint}/text/downloadable/${format}/${id}/inl/${lang}`;
    return this.http.get(url);
  }

  getDownloadableEstablishedText(id: string, format: string): Observable<any> {
    const idParts = id.split(';')[0].split('_');
    const ch_id = idParts.length > 2 ? '/' + idParts[2] : '';
    const url = `${this.apiEndpoint}/text/downloadable/${format}/${idParts[0]}/${idParts[1]}/est${ch_id}`;
    return this.http.get(url);
  }

  getEstablishedTextIllustrations(id: string): Observable<any> {
    return this.getCollectionReadText(id).pipe(
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
    const galleryId = !isEmptyObject(galleries)
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
              `${this.apiEndpoint}/gallery/get/${galleryId}/`
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

}
