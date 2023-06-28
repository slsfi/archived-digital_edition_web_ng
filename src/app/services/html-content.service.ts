import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { config } from "src/assets/config/config";


@Injectable({
  providedIn: 'root',
})
export class HtmlContentService {
  private htmlUrl = '/html/';

  constructor(
    private http: HttpClient
  ) {}

  getHtmlContent(filename: string): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        this.htmlUrl +
        filename
    );
  }
}
