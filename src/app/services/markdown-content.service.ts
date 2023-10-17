import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

import { config } from '@config';


@Injectable({
  providedIn: 'root',
})
export class MarkdownContentService {
  private apiEndpoint: string = '';

  constructor(
    private http: HttpClient
  ) {
    const apiURL = config.app?.apiEndpoint ?? '';
    const machineName = config.app?.machineName ?? '';
    this.apiEndpoint = apiURL + '/' + machineName;
  }

  getMdContent(fileID: string): Observable<any> {
    const url = this.apiEndpoint + '/md/' + fileID;
    return this.http.get(url);
  }

  getMenuTree(language: string, rootNodeID: string): Observable<any> {
    const url = `${this.apiEndpoint}/static-pages-toc/${language}`;
    return this.http.get(url).pipe(
      map((res: any) => {
        if (language && rootNodeID) {
          res = this.getNodeById(`${language}-${rootNodeID}`, res);
        } else {
          res = res.children[0].children;
        }
        res.id = this.stripLocaleFromID(res.id);
        this.stripLocaleFromAboutPagesIDs(res.children);
        return res;
      }),
      catchError((e) => {
        return of({});
      })
    );
  }

  /**
   * Find a node by id in a JSON tree
   */
  private getNodeById(id: any, tree: any) {
    const reduce = [].reduce;
    const runner: any = (result: any, node: any) => {
      if (result || !node) {
        return result;
      }
      return (
        (node.id === id && node) ||
        runner(null, node.children) ||
        reduce.call(Object(node), runner, result)
      );
    };
    return runner(null, tree);
  }

  private stripLocaleFromAboutPagesIDs(array: any[]) {
    for (let i = 0; i < array.length; i++) {
      array[i]['id'] = this.stripLocaleFromID(array[i]['id']);
      if (array[i]['children']?.length) {
        this.stripLocaleFromAboutPagesIDs(array[i]['children']);
      }
    }
  }

  private stripLocaleFromID(id: string) {
    return id.slice(id.indexOf('-') + 1);
  }

}
