import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ConfigService } from '@ngx-config/core';

@Injectable()
export class SemanticDataService {

  textCache: any;
  useLegacy: boolean;
  elasticSubjectIndex: string;
  elasticLocationIndex: string;
  elasticTagIndex: string;

  constructor(private http: Http, private config: ConfigService) {
    try {
      this.useLegacy = this.config.getSettings('app.useLegacyIdsForSemanticData');
    } catch (e) {
      this.useLegacy = false;
    }
    this.elasticSubjectIndex = 'subject';
    this.elasticLocationIndex = 'location';
    this.elasticTagIndex = 'tag';
  }


  getFilterCollections(): Observable<any[]> {
    return this.http.get('assets/filterCollections.json')
      .map(this.extractData)
      .catch(this.handleError);
  }

  getFilterPersonTypes(): Observable<any[]> {
    return this.http.get('assets/filterPersonTypes.json')
      .map(this.extractData)
      .catch(this.handleError);
  }

  getPlace(id: string): Observable<any> {
    return this.http.get(this.config.getSettings('app.apiEndpoint') + '/' +
       this.config.getSettings('app.machineName') + '/location/' + id)
      .map(res => {
        const body = res.json();

        return body || ' - no content - ';
      })
      .catch(this.handleError);
  }

  getPerson(id: string): Observable<any> {
    return this.http.get(this.config.getSettings('app.apiEndpoint') + '/' +
       this.config.getSettings('app.machineName') + '/subject/' + id)
      .map(res => {
        const body = res.json();

        return body || ' - no content - ';
      })
      .catch(this.handleError);
  }

  getTag(id: string): Observable<any> {
    return this.http.get(this.config.getSettings('app.apiEndpoint') + '/' +
      this.config.getSettings('app.machineName') + '/tag/' + id)
      .map(res => {
        const body = res.json();

        return body || ' - no content - ';
      })
      .catch(this.handleError);
  }

  getWork(id: string): Observable<any> {
    return this.http.get(this.config.getSettings('app.apiEndpoint') + '/' +
      this.config.getSettings('app.machineName') + '/work/' + id)
      .map(res => {
        const body = res.json();

        return body || ' - no content - ';
      })
      .catch(this.handleError);
  }

  getSemanticData(id: string): Observable<any> {
    return this.http.get(this.config.getSettings('app.apiEndpoint') + '/' +
      this.config.getSettings('app.machineName') + '/tag/' + id)
      .map(res => {
        const body = res.json();

        return body.content || ' - no content - ';
      })
      .catch(this.handleError);

  }

  getAllPerson(): Observable<any> {
    return this.http.get(this.config.getSettings('app.apiEndpoint') + '/subjects')
      .map(res => {
        const body = res.json();

        return body || ' - no content - ';
      })
      .catch(this.handleError);
  }

  getOccurrencesByType(object_type: string, object_subtype?: string): Observable<any> {
    let occurrenceURL = `/occurrences/${object_type}`;

    if (object_subtype) {
      occurrenceURL = `${occurrenceURL}/${object_subtype}`
    }

    return this.http.get(this.config.getSettings('app.apiEndpoint') + '/' +
      this.config.getSettings('app.machineName') + occurrenceURL)
      .map(res => {
        const body = res.json();

        return body || ' - no content - ';
      })
      .catch(this.handleError);
  }

  getSubjectOccurrences(subject_id?: Number): Observable<any> {

    return this.http.get(this.config.getSettings('app.apiEndpoint') + '/' +
      this.config.getSettings('app.machineName') + '/subject/occurrences/' + ((subject_id) ? subject_id + '/' : ''))
      .map(res => {
        const body = res.json();

        return body || ' - no content - ';
      })
      .catch(this.handleError);
  }

  getSubjects(): Observable<any> {

    return this.http.get(this.config.getSettings('app.apiEndpoint') + '/' +
      this.config.getSettings('app.machineName') + '/subjects')
      .map(res => {
        const body = res.json();

        return body || ' - no content - ';
      })
      .catch(this.handleError);
  }

  getSubjectsElastic(from, searchText?) {
    const payload: any = {
      from: from,
      size: 800,
      sort: [
        { 'full_name.keyword' : 'asc' }
      ],
      query: {
        bool: {
          must : [{
            'term' : { 'project_id' : this.config.getSettings('app.projectId') }
          }],
        }
      }
    }
    if (searchText !== undefined && searchText !== '') {
      payload.from = 0;
      payload.size = 1000;
      payload.query.bool.must.push({'prefix': {'full_name': String(searchText).toLowerCase()}});
    }

      return this.http.post(this.getSearchUrl(this.elasticSubjectIndex), payload)
      .map(this.extractData)
      .catch(this.handleError)
  }

  getLocationElastic(from, searchText?) {
    const payload: any = {
      from: from,
      size: 800,
      sort: [
        { 'name.keyword' : 'asc' }
      ],
      query: {
        bool: {
          must : [{
            'term' : { 'project_id' : this.config.getSettings('app.projectId') }
          }],
        }
      }
    }
    if (searchText !== undefined && searchText !== '') {
      payload.from = 0;
      payload.size = 1000;
      payload.query.bool.must.push({'prefix': {'name': String(searchText).toLowerCase()}});
    }
    return this.http.post(this.getSearchUrl(this.elasticLocationIndex), payload)
    .map(this.extractData)
    .catch(this.handleError)
  }

  getTagElastic(from, searchText?) {
    const payload: any = {
      from: from,
      size: 800,
      sort: [
        { 'name.keyword' : 'asc' }
      ],
      query: {
        bool: {
          must : [{
            'term' : { 'project_id' : this.config.getSettings('app.projectId') }
          }],
        }
      }
    }
    if (searchText !== undefined && searchText !== '') {
      payload.from = 0;
      payload.size = 1000;
      payload.query.bool.must.push({'prefix': {'name': String(searchText).toLowerCase()}});
    }
    return this.http.post(this.getSearchUrl(this.elasticTagIndex), payload)
    .map(this.extractData)
    .catch(this.handleError)
  }

  getSubjectOccurrencesById(id: string): Observable<any> {

    return this.http.get(this.config.getSettings('app.apiEndpoint') + '/occurrences/subject/' + id)
      .map(res => {
        const body = res.json();

        return body || ' - no content - ';
      })
      .catch(this.handleError);
  }

  getOccurrences(type: string, id: string): Observable<any> {

    return this.http.get(this.config.getSettings('app.apiEndpoint') + '/occurrences/' + type + '/' + id)
      .map(res => {
        const body = res.json();

        return body || ' - no content - ';
      })
      .catch(this.handleError);
  }

  getLocationOccurrencesById(id: string): Observable<any> {

    return this.http.get(this.config.getSettings('app.apiEndpoint') + '/occurrences/location/' + id)
      .map(res => {
        const body = res.json();

        return body || ' - no content - ';
      })
      .catch(this.handleError);
  }

  getTagOccurrencesById(id: string): Observable<any> {

    return this.http.get(this.config.getSettings('app.apiEndpoint') + '/occurrences/tag/' + id)
      .map(res => {
        const body = res.json();

        return body || ' - no content - ';
      })
      .catch(this.handleError);
  }

  getWorkOccurrencesById(id: string): Observable<any> {

    return this.http.get(this.config.getSettings('app.apiEndpoint') + '/' + this.config.getSettings('app.machineName') + '/workregister/work/project/occurrences/' + id)
      .map(res => {
        const body = res.json();

        return body || ' - no content - ';
      })
      .catch(this.handleError);
  }

  getLocationOccurrences(id?): Observable<any> {

    return this.http.get(this.config.getSettings('app.apiEndpoint') + '/' +
      this.config.getSettings('app.machineName') + '/location/occurrences/' + ((id) ? id + '/' : ''))
      .map(res => {
        const body = res.json();

        return body || ' - no content - ';
      })
      .catch(this.handleError);
  }

  getTagOccurrences(id?): Observable<any> {

    return this.http.get(this.config.getSettings('app.apiEndpoint') + '/' +
      this.config.getSettings('app.machineName') + '/tag/occurrences/' + ((id) ? id + '/' : ''))
      .map(res => {
        const body = res.json();

        return body || ' - no content - ';
      })
      .catch(this.handleError);
  }

  getWorkOccurrences(): Observable<any> {

    return this.http.get(this.config.getSettings('app.apiEndpoint') + '/' +
      this.config.getSettings('app.machineName') + '/workregister/manifestations/')
      .map(res => {
        const body = res.json();

        return body || ' - no content - ';
      })
      .catch(this.handleError);
  }

  getAllPlaces(): Observable<any> {
    return this.http.get(this.config.getSettings('app.apiEndpoint') + '/tooltips/locations')
      .map(res => {
        const body = res.json();

        return body || ' - no content - ';
      })
      .catch(this.handleError);
  }

  getSubjectsOccurencesByCollection(object_type: string, id: any[]): Observable<any> {
    return this.http.get(this.config.getSettings('app.apiEndpoint') + '/' +
      this.config.getSettings('app.machineName') + '/occurrences/collection/' + object_type + '/' + id)
      .map(res => {
        return res.json();
      })
      .catch(this.handleError);
  }

  private getSearchUrl(index: any): string {
    return this.config.getSettings('app.apiEndpoint') + '/' +
     this.config.getSettings('app.machineName') + '/search/elastic/' + index
  }

  private extractData(res: Response) {
    const body = res.json();
    return body || {};
  }

  private handleError(error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    return Observable.throw(errMsg);
  }

}
