import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';

import { config } from '@config';


@Injectable({
  providedIn: 'root',
})
export class CollectionTableOfContentsService {
  activeTocOrder: BehaviorSubject<string> = new BehaviorSubject('default');
  apiEndpoint: string = '';
  cachedTableOfContents: any = {};
  multilingualTOC: boolean = false;

  constructor(
    private http: HttpClient,
    @Inject(LOCALE_ID) private activeLocale: string
  ) {
    const apiURL = config.app?.apiEndpoint ?? '';
    const machineName = config.app?.machineName ?? '';
    this.apiEndpoint = apiURL + '/' + machineName;
    this.multilingualTOC = config.app?.i18n?.multilingualCollectionTableOfContents ?? false;
  }

  getTableOfContents(id: string): Observable<any> {
    if (this.cachedTableOfContents?.collectionId === id) {
      return of(this.cachedTableOfContents);
    } else {
      const locale = this.multilingualTOC ? '/' + this.activeLocale : '';
      const url = `${this.apiEndpoint}/toc/${id}${locale}`;

      return this.http.get(url).pipe(
        map((res: any) => {
          this.cachedTableOfContents = res;
          return res;
        }),
        catchError(this.handleError)
      );
    }
  }

  /**
   * Get first TOC item which has 'itemId' property and 'type' property
   * has value other than 'subtitle' and 'section_title'.
   * @param collectionID 
   * @param language optional
   */
  getFirstItem(collectionID: string, language?: string): Observable<any> {
    language = language && this.multilingualTOC ? '/' + language : '';
    const url = `${this.apiEndpoint}/toc-first/${collectionID}${language}`;
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
