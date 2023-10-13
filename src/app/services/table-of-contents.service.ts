import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';

import { config } from 'src/assets/config/config';


@Injectable({
  providedIn: 'root',
})
export class TableOfContentsService {
  activeTocOrder: BehaviorSubject<string> = new BehaviorSubject('default');
  apiEndpoint: string = '';
  cachedTableOfContents: any = {};
  multilingualTOC: boolean = false;

  constructor(
    private http: HttpClient,
    @Inject(LOCALE_ID) private activeLocale: string
  ) {
    this.apiEndpoint = config.app?.apiEndpoint ?? '';
    this.multilingualTOC = config.app?.i18n?.multilingualCollectionTableOfContents ?? false;
  }

  getTableOfContents(id: string): Observable<any> {
    if (this.cachedTableOfContents?.collectionId === id) {
      return of(this.cachedTableOfContents);
    } else {
      let url = this.apiEndpoint + '/' + config.app.machineName + '/toc/' + id;

      if (this.multilingualTOC) {
        url += '/' + this.activeLocale;
      }

      return this.http.get(url).pipe(
        map((res: any) => {
          this.cachedTableOfContents = res;
          return res;
        }),
        catchError(this.handleError)
      );
    }
  }

  getTableOfContentsGroup(id: string, group_id: string): Observable<any> {
    // @TODO add multilingual support to this as well...
    const url = config.app.apiEndpoint + '/' + config.app.machineName +
                '/toc/' + id + '/group/' + group_id;
    return this.http.get(url);
  }

  getPrevNext(id: string): Observable<any> {
    // @TODO add multilingual support to this as well...
    const arr = id.split('_');
    const ed_id = arr[0];
    const item_id = arr[1];
    const url = config.app.apiEndpoint + '/' + config.app.machineName +
                '/toc/' + ed_id + '/prevnext/' + item_id;
    return this.http.get(url);
  }

  /**
   * Get first TOC item which has 'itemId' property and 'type' property
   * has value other than 'subtitle' and 'section_title'.
   * @param collectionID 
   * @param language optional
   */
  getFirst(collectionID: string, language?: string): Observable<any> {
    let url = config.app.apiEndpoint + '/' + config.app.machineName +
              '/toc-first/' + collectionID;
    if (language && this.multilingualTOC) {
      url = url + '/' + language;
    }

    return this.http.get(url);
  }

  setActiveTocOrder(newTocOrder: string) {
    this.activeTocOrder.next(newTocOrder);
  }

  getActiveTocOrder(): Observable<string> {
    return this.activeTocOrder.asObservable();
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
