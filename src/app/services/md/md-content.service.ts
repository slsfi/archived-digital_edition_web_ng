import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, lastValueFrom, map, Observable, of } from 'rxjs';
import { config } from "src/assets/config/config";

@Injectable()
export class MdContentService {
  private mdUrl = '/md/';
  private staticPagesURL = '/static-pages-toc/';
  private apiEndpoint: string;

  constructor(
    private http: HttpClient
  ) {
    this.apiEndpoint = config.app?.apiEndpoint ?? '';
    const simpleApi = config.app?.simpleApi ?? '';
    if (simpleApi) {
      this.apiEndpoint = simpleApi as string;
    }
  }

  getMdContent(fileID: string): Observable<any> {
    // TODO: SK figure out why this "transformation" of fileID is here
    // This is a TEMPORARY bugfix, that is solved in this way because it
    // is 11 pm and there is to be a presentation tomorrow.
    const id_parts = fileID.split('-');
    if (id_parts.length === 5 && id_parts[1] === '04') {
      // transform sv-04-01-10-1 to sv-04-01-01
      id_parts[4] = '0' + id_parts[4];
      id_parts.splice(3, 1);
      fileID = id_parts.join('-');
    }

    const url = this.apiEndpoint + '/' + config.app.machineName + this.mdUrl + fileID;
    return this.http.get(url);
  }

  getStaticPagesToc(language: string): Observable<any> {
    const url =
      this.apiEndpoint +
      '/' +
      config.app.machineName +
      this.staticPagesURL +
      language;
    return this.http.get(url);
  }

  async getStaticPagesTocPromise(language: string): Promise<any> {
    try {
      const url = this.apiEndpoint + '/' + config.app.machineName + this.staticPagesURL + language;

      // console.log("FETCH HERE 4!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

      return await lastValueFrom(this.http.get(url));

      // const response = await fetch(url);
      // return response.json();
    } catch (e) {}
  }

  async getMarkdownMenu(lang: any, nodeID: any) {
    const jsonObjectID = `${lang}-${nodeID}`;
    const markdownData = await this.getStaticPagesTocPromise(lang);

    if (jsonObjectID) {
      const pages = this.getNodeById(jsonObjectID, markdownData);
      return pages;
    } else {
      return markdownData.children[0].children;
    }
  }

  getAboutPagesMenu(language: string, aboutPagesNodeID: any): Observable<any> {
    const url = this.apiEndpoint + '/' + config.app.machineName + this.staticPagesURL + language;
    return this.http.get(url).pipe(
      map((res: any) => {
        if (`${language}-${aboutPagesNodeID}`) {
          return this.getNodeById(`${language}-${aboutPagesNodeID}`, res);
        } else {
          return res.children[0].children;
        }
      }),
      catchError((e) => {
        return of({});
      })
    );
  }

  /**
   * Find a node by id in a JSON tree
   */
  getNodeById(id: any, tree: any) {
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
}
