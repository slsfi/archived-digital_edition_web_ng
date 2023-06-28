import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { config } from "src/assets/config/config";


@Injectable({
  providedIn: 'root',
})
export class FacsimileService {
  private api = config.app.apiEndpoint;
  private facsimilesFolder = 'facsimiles';
  private project = config.app.machineName;

  constructor(private http: HttpClient) {}

  getFacsimiles(text_id: string): Observable<any> {
    const publication_id = text_id.split('_')[1] || text_id;
    const chapter_id = text_id.split('_')[2]?.split(';')[0].replace('ch', '') || '';
    const url = this.api + '/' + this.project + '/' + this.facsimilesFolder + '/' + publication_id + 
          (chapter_id ? '/' + chapter_id : '');
    return this.http.get(url);
  }

}
