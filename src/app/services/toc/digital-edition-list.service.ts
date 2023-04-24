import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from "src/assets/config/config";

@Injectable()
export class DigitalEditionListService {
  private digitalEditionsUrl = '/collections';

  constructor(
    private http: HttpClient
  ) {}

  getDigitalEditions(): Observable<any> {
    const url = config.app.apiEndpoint + '/' + config.app.machineName + this.digitalEditionsUrl;
    return this.http.get(url);
  }

}
