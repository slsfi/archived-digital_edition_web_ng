import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from '@config';


@Injectable({
  providedIn: 'root',
})
export class MetadataService {
    constructor(
        private http: HttpClient
    ) {}

    getMetadata(id: string, lang: string): Observable<any> {
        const url = `${config.app.apiEndpoint}/${config.app.machineName}/publications/${id}/metadata/${lang}`;
        return this.http.get(url);
    }
}
