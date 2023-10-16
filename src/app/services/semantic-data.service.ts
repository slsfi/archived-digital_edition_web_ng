import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CommonFunctionsService } from './common-functions.service';
import { config } from 'src/assets/config/config';
import { convertNamedEntityTypeForBackend } from '@utility-functions';


@Injectable({
  providedIn: 'root',
})
export class SemanticDataService {
  textCache: any;
  elasticSubjectIndex: string;
  elasticLocationIndex: string;
  elasticWorkIndex: string;
  elasticTagIndex: string;
  flattened: any;

  constructor(
    private commonFunctions: CommonFunctionsService,
    private http: HttpClient,
    @Inject(LOCALE_ID) private activeLocale: string
  ) {
    this.elasticSubjectIndex = 'subject';
    this.elasticLocationIndex = 'location';
    this.elasticWorkIndex = 'work';
    this.elasticTagIndex = 'tag';
    this.flattened = [];
  }

  /**
   * Get single semantic data object details from the backend API.
   * @param type should be one of the following: keyword/tag, person/subject,
   * place/location, work.
   */
  getSingleSemanticDataObject(type: string, id: string): Observable<any> {
    type = convertNamedEntityTypeForBackend(type);
    
    let url = `${config.app.apiEndpoint}/${config.app.machineName}/${type}/${id}`;
    if (config.app?.i18n?.multilingualSemanticData) {
      url = url + '/' + this.activeLocale;
    }
    return this.http.get(url);
  }

  getFilterPersonTypes(): Observable<any> {
    const payload: any = {
      size: 0,
      query: {
        bool: {
          must: [
            {
              term: { project_id: config.app.projectId },
            },
          ],
        },
      },
      aggs: {
        types: {
          terms: {
            field: 'type.keyword',
          },
        },
      },
    };
    return this.http.post(this.getSearchUrl(this.elasticSubjectIndex), payload);
  }

  getFilterCategoryTypes(): Observable<any> {
    const payload: any = {
      size: 0,
      query: {
        bool: {
          must: [
            {
              term: { project_id: config.app.projectId },
            },
          ],
        },
      },
      aggs: {
        types: {
          terms: {
            field: 'tag_type.keyword',
          },
        },
      },
    };

    return this.http.post(this.getSearchUrl(this.elasticTagIndex), payload);
  }

  getFilterPlaceCountries(): Observable<any> {
    const payload: any = {
      size: 0,
      query: {
        bool: {
          must: [
            {
              term: { project_id: config.app.projectId },
            },
          ],
        },
      },
      aggs: {
        countries: {
          terms: {
            field: 'country.keyword',
          },
        },
      },
    };

    return this.http.post(
      this.getSearchUrl(this.elasticLocationIndex),
      payload
    );
  }

  getPlace(id: string): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/location/' +
        id
    );
  }

  getPerson(id: string): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/subject/' +
        id
    );
  }

  getTag(id: string): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/tag/' +
        id
    );
  }

  getWork(id: string): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/work/' +
        id
    );
  }

  getSemanticData(id: string): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/tag/' +
        id
    );
  }

  getPersons(language: string): Observable<any> {
    return this.http.get(
      `${config.app.apiEndpoint}/${config.app.machineName}/persons/${language}`
    );
  }

  getSubjectOccurrences(subject_id?: number): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/subject/occurrences/' +
        (subject_id ? subject_id + '/' : '')
    );
  }

  getSubjects(): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/subjects'
    );
  }

  getSingleObjectElastic(type: any, id: any) {
    type = convertNamedEntityTypeForBackend(type);
    
    const payload: any = {
      from: 0,
      size: 200,
      query: {
        bool: {
          should: [
            {
              bool: {
                must: [
                  {
                    term: {
                      project_id: config.app.projectId,
                    },
                  },
                  {
                    term: { id: id },
                  },
                ],
              },
            },
            {
              bool: {
                must: [
                  {
                    term: {
                      project_id: config.app.projectId,
                    },
                  },
                  {
                    term: { legacy_id: id },
                  },
                ],
              },
            },
          ],
        },
      },
    };

    if (type === 'work') {
      payload.query.bool.should[0].bool.must[1]['term'] = { man_id: id };
    }

    // remove if the ID is not strictly numerical
    if (/^\d+$/.test(id) === false) {
      delete payload.query.bool.should[0];
    }

    return this.http.post<any>(this.getSearchUrl(type), payload);
  }

  getSubjectsElastic(after_key?: any, searchText?: any, filters?: any, max?: any) {
    const showPublishedStatus = config.page?.index?.persons?.publishedStatus ?? 2;

    if (filters === null || filters === undefined) {
      filters = {};
    }

    if (max === undefined || max === null) {
      max = 500;
    } else if (max > 10000) {
      max = 10000;
    }

    const payload: any = {
      size: 0,
      query: {
        bool: {
          must: [
            {
              term: {
                project_id: { value: config.app.projectId },
              },
            },
            { term: { published: { value: showPublishedStatus } } },
            { term: { sub_deleted: { value: 0 } } },
            { term: { ev_c_deleted: { value: 0 } } },
            { term: { ev_o_deleted: { value: 0 } } },
            { term: { publication_deleted: { value: 0 } } },
          ],
        },
      },
      aggs: {
        unique_subjects: {
          composite: {
            size: max,
            sources: [
              {
                sort_by_name: {
                  terms: {
                    field: 'sort_by_name.keyword',
                    missing_bucket: true,
                  },
                },
              },
              { full_name: { terms: { field: 'full_name.keyword' } } },
              {
                date_born: {
                  terms: { field: 'date_born.keyword', missing_bucket: true },
                },
              },
              {
                date_deceased: {
                  terms: {
                    field: 'date_deceased.keyword',
                    missing_bucket: true,
                  },
                },
              },
              {
                type: {
                  terms: { field: 'type.keyword', missing_bucket: true },
                },
              },
              { id: { terms: { field: 'id' } } },
            ],
          },
        },
      },
    };

    if (
      after_key !== undefined &&
      !this.commonFunctions.isEmptyObject(after_key)
    ) {
      payload.aggs.unique_subjects.composite.after = after_key;
    }

    if (
      filters !== undefined &&
      filters['filterPersonTypes'] !== undefined &&
      filters['filterPersonTypes'].length > 0
    ) {
      payload.query.bool.must.push({ bool: { should: [] } });
      filters['filterPersonTypes'].forEach((element: any) => {
        payload.query.bool.must[
          payload.query.bool.must.length - 1
        ].bool.should.push({ term: { 'type.keyword': String(element.name) } });
      });
    }

    // Add date range filter.
    if (filters.filterYearMax && filters.filterYearMin) {
      payload.query.bool.must.push({
        range: {
          date_born_date: {
            gte: ('0000' + String(filters.filterYearMin)).slice(-4) + '-01-01',
            lte: ('0000' + String(filters.filterYearMax)).slice(-4) + '-12-31',
          },
        },
      });
    }

    // Search for first character of name
    if (
      searchText !== undefined &&
      searchText !== '' &&
      String(searchText).length === 1
    ) {
      payload.query.bool.must.push({
        regexp: {
          'sort_by_name.keyword': {
            value: `${String(searchText)}.*|${String(
              searchText
            ).toLowerCase()}.*`,
          },
        },
      });
    } else if (searchText !== undefined && searchText !== '') {
      payload.query.bool.must.push({
        fuzzy: {
          full_name: {
            value: `${String(searchText)}`,
          },
        },
      });
    }

    return this.http.post<any>(this.getSearchUrl(this.elasticSubjectIndex), payload);
  }

  getLocationElastic(after_key?: any, searchText?: any, filters?: any, max?: any) {
    const showPublishedStatus = config.page?.index?.places?.publishedStatus ?? 2;

    if (filters === null || filters === undefined) {
      filters = {};
    }

    if (max === undefined || max === null) {
      max = 500;
    } else if (max > 10000) {
      max = 10000;
    }

    const payload: any = {
      size: 0,
      query: {
        bool: {
          must: [
            {
              term: {
                project_id: { value: config.app.projectId },
              },
            },
            { term: { published: { value: showPublishedStatus } } },
            { term: { loc_deleted: { value: 0 } } },
            { term: { ev_c_deleted: { value: 0 } } },
            { term: { ev_o_deleted: { value: 0 } } },
            { term: { publication_deleted: { value: 0 } } },
          ],
        },
      },
      aggs: {
        unique_places: {
          composite: {
            size: max,
            sources: [
              {
                sort_by_name: {
                  terms: {
                    field: 'sort_by_name.keyword',
                    missing_bucket: true,
                  },
                },
              },
              { name: { terms: { field: 'name.keyword' } } },
              { id: { terms: { field: 'id' } } },
              { loc_id: { terms: { field: 'loc_id' } } },
            ],
          },
        },
      },
    };

    if (
      after_key !== undefined &&
      !this.commonFunctions.isEmptyObject(after_key)
    ) {
      payload.aggs.unique_places.composite.after = after_key;
    }

    if (
      filters !== undefined &&
      filters['filterPlaceCountries'] !== undefined &&
      filters['filterPlaceCountries'].length > 0
    ) {
      payload.query.bool.must.push({ bool: { should: [] } });
      filters['filterPlaceCountries'].forEach((element: any) => {
        payload.query.bool.must[
          payload.query.bool.must.length - 1
        ].bool.should.push({
          term: { 'country.keyword': String(element.name) },
        });
      });
    }

    if (
      searchText !== undefined &&
      searchText !== '' &&
      String(searchText).length === 1
    ) {
      // Search for first character of place name
      payload.query.bool.must.push({
        regexp: {
          'sort_by_name.keyword': {
            value: `${String(searchText)}.*|${String(
              searchText
            ).toLowerCase()}.*`,
          },
        },
      });
    } else if (searchText !== undefined && searchText !== '') {
      // Fuzzy search in full place name
      payload.query.bool.must.push({
        fuzzy: {
          name: {
            value: `${String(searchText)}`,
          },
        },
      });
    }

    return this.http.post<any>(this.getSearchUrl(this.elasticLocationIndex), payload);
  }

  getWorksElastic(from: any, searchText?: any, size: number = 500) {
    const payload: any = {
      from: from,
      size: size,
      sort: [{ 'author_data.last_name.keyword': 'asc' }],
      query: {
        bool: {
          should: [
            {
              bool: {
                must: [
                  {
                    term: {
                      project_id: config.app.projectId,
                    },
                  },
                  {
                    term: { deleted: 0 },
                  },
                ],
              },
            },
            {
              bool: {
                must: [
                  {
                    term: {
                      project_id: config.app.projectId,
                    },
                  },
                  {
                    term: { deleted: 0 },
                  },
                ],
              },
            },
          ],
        },
      },
    };
    if (searchText !== undefined && searchText !== '') {
      payload.from = 0;
      payload.size = 5000;
      payload.query.bool.should[0].bool.must.push({
        fuzzy: {
          title: {
            value: `${String(searchText)}`,
          },
        },
      });
      payload.query.bool.should[1].bool.must.push({
        regexp: {
          'author_data.full_name': {
            value: `${String(searchText)}.*|${String(
              searchText
            ).toLowerCase()}.*`,
          },
        },
      });
    }
    return this.http.post<any>(this.getSearchUrl(this.elasticWorkIndex), payload);
  }

  getTagElastic(after_key?: any, searchText?: any, filters?: any, max?: any) {
    const showPublishedStatus = config.page?.index?.keywords?.publishedStatus ?? 2;

    if (filters === null || filters === undefined) {
      filters = {};
    }

    if (max === undefined || max === null) {
      max = 500;
    } else if (max > 10000) {
      max = 10000;
    }

    const payload: any = {
      size: 0,
      query: {
        bool: {
          must: [
            {
              term: {
                project_id: { value: config.app.projectId },
              },
            },
            { term: { published: { value: showPublishedStatus } } },
            { term: { tag_deleted: { value: 0 } } },
            { term: { ev_c_deleted: { value: 0 } } },
            { term: { ev_o_deleted: { value: 0 } } },
            { term: { publication_deleted: { value: 0 } } },
          ],
        },
      },
      aggs: {
        unique_tags: {
          composite: {
            size: max,
            sources: [
              {
                sort_by_name: {
                  terms: {
                    field: 'sort_by_name.keyword',
                    missing_bucket: true,
                  },
                },
              },
              { name: { terms: { field: 'name.keyword' } } },
              {
                tag_type: {
                  terms: { field: 'tag_type.keyword', missing_bucket: true },
                },
              },
              { id: { terms: { field: 'id' } } },
              { tag_id: { terms: { field: 'tag_id' } } },
            ],
          },
        },
      },
    };

    if (
      after_key !== undefined &&
      !this.commonFunctions.isEmptyObject(after_key)
    ) {
      payload.aggs.unique_tags.composite.after = after_key;
    }

    if (
      filters !== undefined &&
      filters['filterCategoryTypes'] !== undefined &&
      filters['filterCategoryTypes'].length > 0
    ) {
      payload.query.bool.must.push({ bool: { should: [] } });
      filters['filterCategoryTypes'].forEach((element: any) => {
        payload.query.bool.must[
          payload.query.bool.must.length - 1
        ].bool.should.push({
          term: { 'tag_type.keyword': String(element.name) },
        });
      });
    }

    if (
      searchText !== undefined &&
      searchText !== '' &&
      String(searchText).length === 1
    ) {
      // Search for first character of tag name
      payload.query.bool.must.push({
        regexp: {
          'sort_by_name.keyword': {
            value: `${String(searchText)}.*|${String(
              searchText
            ).toLowerCase()}.*`,
          },
        },
      });
    } else if (searchText !== undefined && searchText !== '') {
      // Fuzzy search in full tag name
      payload.query.bool.must.push({
        fuzzy: {
          name: {
            value: `${String(searchText)}`,
          },
        },
      });
    }

    return this.http.post<any>(this.getSearchUrl(this.elasticTagIndex), payload);
  }

  getSubjectOccurrencesById(id: string): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint + '/occurrences/subject/' + id
    );
  }

  getOccurrences(type: string, id: string): Observable<any> {
    type = convertNamedEntityTypeForBackend(type);
    const url = config.app.apiEndpoint + '/occurrences/' + type + '/' + id;
    return this.http.get(url);
  }

  getLocationOccurrencesById(id: string): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint + '/occurrences/location/' + id
    );
  }

  getTagOccurrencesById(id: string): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint + '/occurrences/tag/' + id
    );
  }

  getWorkOccurrencesById(id: string): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/workregister/work/project/occurrences/' +
        id
    );
  }

  getLocationOccurrences(id?: any): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/location/occurrences/' +
        (id ? id + '/' : '')
    );
  }

  getTagOccurrences(id?: any): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/tag/occurrences/' +
        (id ? id + '/' : '')
    );
  }

  getAllWorks(): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/workregister/manifestations/'
    );
  }

  getAllPlaces(): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint + '/tooltips/locations'
    );
  }

  getSubjectsOccurencesByCollection(
    object_type: string,
    id: any[]
  ): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/occurrences/collection/' +
        object_type +
        '/' +
        id
    );
  }

  private getSearchUrl(index: any): string {
    return (
      config.app.apiEndpoint +
      '/' +
      config.app.machineName +
      '/search/elastic/' +
      index
    );
  }

}
