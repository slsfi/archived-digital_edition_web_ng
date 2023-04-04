import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from "src/app/services/config/config";

@Injectable()
export class TableOfContentsService {
  private tableOfContentsUrl = '/toc/'; // plus an id...
  private multilingualTOC = false;
  apiEndpoint: string;

  constructor(
    private http: HttpClient,
    @Inject(LOCALE_ID) public activeLocale: string
  ) {
    this.apiEndpoint = config.app?.apiEndpoint ?? '';
    const simpleApi = config.app?.simpleApi ?? '';
    if (simpleApi) {
      this.apiEndpoint = simpleApi as string;
    }
    this.multilingualTOC = config.app?.i18n?.multilingualCollectionTableOfContents ?? false;
  }

  getTableOfContents(id: string): Observable<any> {
    let url =
      this.apiEndpoint +
      '/' +
      config.app.machineName +
      this.tableOfContentsUrl +
      id;

    if (this.multilingualTOC) {
      url += '/' + this.activeLocale;
    }

    return this.http.get(url);
  }

  getTableOfContentsRoot(id: string): Observable<any> {
    return this.getTableOfContents(id);
  }

  getTableOfContentsGroup(id: string, group_id: string): Observable<any> {
    // @TODO add multilingual support to this as well...
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        this.tableOfContentsUrl +
        id +
        '/group/' +
        group_id
    );
  }

  getPrevNext(id: string): Observable<any> {
    // @TODO add multilingual support to this as well...
    const arr = id.split('_');
    const ed_id = arr[0];
    const item_id = arr[1];
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        this.tableOfContentsUrl +
        ed_id +
        '/prevnext/' +
        item_id
    );
  }

  /**
   * Get first TOC item which has itemId property and type property has value other
   * than 'subtitle' and 'section_title'
   * @param collectionID 
   * @param language 
   */
  getFirst(collectionID: string, language?: string): Observable<any> {
    let url = config.app.apiEndpoint + '/' + config.app.machineName +
              '/toc-first/' + collectionID;
    if (language && this.multilingualTOC) {
      url = url + '/' + language;
    }

    return this.http.get(url);
  }
}
