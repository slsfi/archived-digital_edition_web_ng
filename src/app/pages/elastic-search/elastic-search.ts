import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { catchError, map, Observable, of, Subscription } from 'rxjs';
import { marked } from 'marked';

import { AggregationData, AggregationsData, Facet, Facets, TimeRange } from 'src/app/models/elastic-search.model';
import { CommonFunctionsService } from 'src/app/services/common-functions.service';
import { ElasticSearchService } from 'src/app/services/elastic-search.service';
import { MdContentService } from 'src/app/services/md-content.service';
import { UrlService } from 'src/app/services/url.service';
import { UserSettingsService } from 'src/app/services/user-settings.service';
import { config } from "src/assets/config/config";


@Component({
  selector: 'page-elastic-search',
  templateUrl: 'elastic-search.html',
  styleUrls: ['elastic-search.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ElasticSearchPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;
  
  activeFilters: any[] = [];
  aggregations: object = {};
  dateHistogramData: any = undefined;
  disableFacetCheckboxes = true;
  elasticError: boolean = false;
  enableFilters: boolean = true;
  filterGroups: any[] = [];
  filtersVisible: boolean = true;
  from: number = 0;
  groupsOpenByDefault: any;
  hits: any = [];
  hitsPerPage: number = 10;
  initializing: boolean = true;
  loading: boolean = true;
  loadingMoreHits: boolean = false;
  mdContent$: Observable<SafeHtml>;
  pages: number = 1;
  query: string = ''; // variable bound to the input search field with ngModel
  range?: TimeRange | null = undefined;
  rangeYears?: Record<string, any> = undefined;
  routeQueryParamsSubscription: Subscription | null = null;
  showAllFor: any = {};
  showSortOptions: boolean = true;
  sort: string = '';
  sortSelectOptions: Record<string, any> = {};
  submittedQuery: string = '';
  textHighlightFragmentSize: number = 150;
  textHighlightType: string = 'unified';
  textTitleHighlightType: string = 'unified';
  total: number = -1;

  constructor(
    private cf: ChangeDetectorRef,
    private commonFunctions: CommonFunctionsService,
    public elastic: ElasticSearchService,
    private mdContentService: MdContentService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private urlService: UrlService,
    public userSettingsService: UserSettingsService,
    @Inject(LOCALE_ID) private activeLocale: string
  ) {
    this.enableFilters = config.ElasticSearch?.show?.facets ?? true;
    this.groupsOpenByDefault = config.ElasticSearch?.groupOpenByDefault ?? undefined;
    this.hitsPerPage = config.ElasticSearch?.hitsPerPage ?? 20;
    this.showSortOptions = config.ElasticSearch?.show?.sortOptions ?? true;
    this.textHighlightFragmentSize = config.ElasticSearch?.textHighlightFragmentSize ?? 150;
    this.textHighlightType = config.ElasticSearch?.textHighlightType ?? 'unified';
    this.textTitleHighlightType = config.ElasticSearch?.textTitleHighlightType ?? 'unified';

    this.filtersVisible = this.userSettingsService.isMobile() ? false : true;
    
    if (
      this.textTitleHighlightType !== 'fvh' &&
      this.textTitleHighlightType !== 'unified' &&
      this.textTitleHighlightType !== 'plain'
    ) {
      this.textTitleHighlightType = 'unified';
    }
    if (
      this.textHighlightType !== 'fvh' &&
      this.textHighlightType !== 'unified' &&
      this.textHighlightType !== 'plain'
    ) {
      this.textHighlightType = 'unified';
    }

    this.sortSelectOptions = {
      header: $localize`:@@ElasticSearch.SortBy:Sortera enligt`,
      cssClass: 'custom-select-alert'
    };
  }

  ngOnInit() {
    this.mdContent$ = this.getMdContent(this.activeLocale + '-12-01');

    // Get initial aggregations
    this.getInitialAggregations().subscribe(
      (filters: any) => {
        this.filterGroups = filters;

        for (let g = 0; g < this.filterGroups.length; g++) {
          if (this.filterGroups[g].name === 'Years') {
            this.dateHistogramData = this.filterGroups[g].filters;
            break;
          }
        }

        this.disableFacetCheckboxes = false;
        this.loading = false;
        this.cf.detectChanges();

        // Subscribe to queryParams, all searches are triggered through them
        this.routeQueryParamsSubscription = this.route.queryParams.subscribe(
          (queryParams: any) => {
            let triggerSearch = false;
            let directSearch = false;

            if (queryParams['query']) {
              if (queryParams['query'] !== this.submittedQuery) {
                this.query = queryParams['query'];
                triggerSearch = true;
              }
            }

            if (queryParams['filters']) {
              const parsedActiveFilters = this.urlService.parse(queryParams['filters'], true);
              if (this.activeFiltersChanged(parsedActiveFilters)) {
                this.selectFiltersFromActiveFilters(parsedActiveFilters);
                this.activeFilters = parsedActiveFilters;
                triggerSearch = true;
              }
            } else if (this.activeFilters.length) {
              // Active filters should be cleared
              this.clearAllActiveFilters();
              triggerSearch = true;
            }

            if (queryParams['from'] && queryParams['to']) {
              let range = {
                from: queryParams['from'],
                to: queryParams['to']
              };
              if (
                range.from !== this.rangeYears?.from ||
                range.to !== this.rangeYears?.to
              ) {
                this.rangeYears = range;
                this.range = {
                  from: new Date(range.from || '').getTime(),
                  to: new Date(`${parseInt(range.to || '') + 1}`).getTime()
                }
                triggerSearch = true;
              }
            } else if (this.range?.from && this.range?.to) {
              this.range = null;
              this.rangeYears = undefined;
              triggerSearch = true;
            }

            if (queryParams['order']) {
              let compareOrder = queryParams['order'];
              if (queryParams['order'] === 'relevance') {
                compareOrder = '';
              }
              if (compareOrder !== this.sort) {
                this.sort = compareOrder;
                triggerSearch = true;
              }
            }

            if (queryParams['pages']) {
              if (Number(queryParams['pages']) !== this.pages) {
                if (this.from < 1) {
                  this.hits = [];
                  this.from = 0;
                  this.total = -1;
                } else {
                  this.loadingMoreHits = true;
                }
                this.pages = Number(queryParams['pages']) || 1;
                directSearch = true;
                triggerSearch = true;
              }
            }

            // Trigger new search if the search input field has
            // been cleared, i.e. no "query" parameter
            if (
              !triggerSearch &&
              !queryParams['query'] &&
              this.submittedQuery &&
              !this.initializing
            ) {
              triggerSearch = true;
            }

            this.initializing = false;

            if (triggerSearch) {
              if (directSearch) {
                this.search();
              } else {
                this.initSearch();
              }
            }
          }
        );
      }
    );
  }

  ngOnDestroy() {
    this.routeQueryParamsSubscription?.unsubscribe();
  }

  /**
   * Triggers a new search.
   */
  initSearch() {
    this.disableFacetCheckboxes = true;
    this.reset();
    this.loading = true;
    this.cf.detectChanges();
    this.search();
  }

  clearSearchQuery() {
    this.query = '';
    this.updateURLQueryParameters({ query: null });
  }

  updateURLQueryParameters(params: any) {
    if (!params.pages) {
      params.pages = null;
    }

    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: params,
        queryParamsHandling: 'merge',
        replaceUrl: true
      }
    );
  }

  submitSearchQuery() {
    this.updateURLQueryParameters({ query: this.query || null });
  }

  /**
   * Triggers a new search with selected years.
   */
  onTimeRangeChange(newRange: { from: string | null, to: string | null } | null) {
    let triggerSearch = false;
    let range = null;
    if (newRange?.from && newRange?.to) {
      // Certain date range
      range = newRange;
      triggerSearch = true;  
    } else if (!newRange?.from && !newRange?.to) {
      // All time
      triggerSearch = true;
    }

    if (triggerSearch) {
      this.updateURLQueryParameters(
        {
          from: range?.from ? range.from : null,
          to: range?.to ? range.to : null
        }
      );
    }
  }

  /**
   * Sorting changed so trigger new query.
   */
  onSortByChanged(event: any) {
    this.updateURLQueryParameters({ order: event?.detail?.value || 'relevance' });
  }

  /**
   * Resets search results.
   */
  private reset() {
    this.hits = [];
    this.from = 0;
    this.total = -1;
    this.pages = 1;
  }

  /**
   * Immediately execute a search.
   */
  private search() {
    this.elasticError = false;
    this.loading = true;
    this.submittedQuery = this.query;

    // Fetch hits
    this.elastic.executeSearchQuery({
      queries: [this.query],
      highlight: {
        fields: {
          'text_data': {
            number_of_fragments: 1000,
            fragment_size: this.textHighlightFragmentSize,
            type: this.textHighlightType
          },
          'text_title': {
            number_of_fragments: 0,
            type: this.textTitleHighlightType
          },
        },
      },
      from: this.from,
      size: (this.from < 1 && this.pages > 1) ? this.pages * this.hitsPerPage : this.hitsPerPage,
      facetGroups: this.filterGroups,
      range: this.range,
      sort: this.parseSortForQuery(),
    }).subscribe((data: any) => {
      if (data.hits === undefined) {
        console.error('Elastic search error, no hits: ', data);
        this.from = 0;
        this.pages = 1;
        this.total = 0;
        this.elasticError = true;
      } else {
        this.total = data.hits.total.value;
        // console.log('hits: ', data.hits);

        // Append new hits to this.hits array.
        Array.prototype.push.apply(this.hits, data.hits.hits.map((hit: any) => ({
          type: hit._source.text_type,
          source: hit._source,
          highlight: hit.highlight,
          id: hit._id
        })));

        if (this.from < 1 && this.pages > 1) {
          this.from = (this.pages - 1) * this.hitsPerPage;
        }
      }
      this.loading = false;
      this.loadingMoreHits = false;
      this.cf.detectChanges();
    });
    
    // Get aggregations only if NOT loading more hits
    if (this.from < 1) {
      this.getAggregations();
    }
  }

  private getAggregations() {
    this.elastic.executeAggregationQuery({
      queries: [this.query],
      facetGroups: this.filterGroups,
      range: this.range,
    }).subscribe({
      next: data => {
        this.updateFilters(data.aggregations);
        this.disableFacetCheckboxes = false;
        this.cf.detectChanges();
      },
      error: e => {
        console.error('Error fetching aggregations', e);
        this.loading = false;
        this.cf.detectChanges();
      }
    });
  }

  private getInitialAggregations(): Observable<any> {
    return this.elastic.executeAggregationQuery({
      queries: [],
      facetGroups: {},
      range: undefined,
    }).pipe(
      map((data: any) => {
        return this.getInitialFilters(data.aggregations);
      })
    );
  }

  private parseSortForQuery() {
    if (!this.sort) {
      return;
    }

    const [key, direction] = this.sort.split('.');
    return [{ [key]: direction }];
  }

  hasMore() {
    return this.total > this.from + this.hitsPerPage;
  }

  loadMore(e: any) {
    this.loadingMoreHits = true;
    this.from += this.hitsPerPage;

    this.updateURLQueryParameters({ pages: this.pages + 1 });
  }

  canShowHits() {
    return (!this.loading || this.loadingMoreHits) && (this.submittedQuery || this.range || this.activeFilters.length);
  }

  toggleFilter(filterGroupKey: string, filter: Facet) {
    // Get updated list of active filters
    const newActiveFilters = this.getNewActiveFilters(filterGroupKey, filter);

    // Update URL query params so a new search is triggered
    this.updateURLQueryParameters(
      {
        filters: newActiveFilters.length ? this.urlService.stringify(newActiveFilters, true) : null
      }
    );
  }

  unselectFilter(filterGroupKey: string, filterKey: string) {
    // Mark the filter as unselected
    for (let g = 0; g < this.filterGroups.length; g++) {
      if (this.filterGroups[g].name === filterGroupKey) {
        for (let f = 0; f < this.filterGroups[g].filters.length; f++) {
          if (String(this.filterGroups[g].filters[f].key) === filterKey) {
            this.filterGroups[g].filters[f].selected = false;
            break;
          }
        }
        break;
      }
    }

    this.toggleFilter(filterGroupKey, { key: filterKey, selected: false, doc_count: 0 });
  }

  private getNewActiveFilters(filterGroupKey: string, updatedFilter: Facet) {
    const newActiveFilters: any[] = [];
    let filterGroupActive: boolean = false;

    for (let a = 0; a < this.activeFilters.length; a++) {
      // Copy current active filters to new array
      newActiveFilters.push(
        {
          name: this.activeFilters[a].name,
          keys: [...this.activeFilters[a].keys]
        }
      );

      if (this.activeFilters[a].name === filterGroupKey) {
        filterGroupActive = true;

        if (updatedFilter.selected) {
          // Add filter to already active filter group
          newActiveFilters[newActiveFilters.length - 1].keys.push(updatedFilter.key);
        } else {
          // Remove filter from already active filter group
          for (let f = 0; f < newActiveFilters[newActiveFilters.length - 1].keys.length; f++) {
            if (newActiveFilters[newActiveFilters.length - 1].keys[f] === updatedFilter.key) {
              newActiveFilters[newActiveFilters.length - 1].keys.splice(f, 1);
              break;
            }
          }
          if (newActiveFilters[newActiveFilters.length - 1].keys.length < 1) {
            // Remove filter group from active filters
            // since there are no active filters from the group
            newActiveFilters.splice(-1, 1);
          }
        }
      }
    }

    if (!filterGroupActive && updatedFilter.selected) {
      // Add filter group and filter to active filters
      newActiveFilters.push(
        {
          name: filterGroupKey,
          keys: [updatedFilter.key]
        }
      );
    }

    return newActiveFilters;
  }

  /**
   * Loops through the array with all filter groups and marks the filters
   * in activeFilters as selected.
   * @param activeFilters Array of active filter objects which should be
   * applied to all filters.
   */
  private selectFiltersFromActiveFilters(activeFilters: any[]) {
    for (let a = 0; a < activeFilters.length; a++) {
      for (let g = 0; g < this.filterGroups.length; g++) {
        if (activeFilters[a].name === this.filterGroups[g].name) {
          for (let i = 0; i < activeFilters[a].keys.length; i++) {
            for (let f = 0; f < this.filterGroups[g].filters.length; f++) {
              if (this.filterGroups[g].filters[f].key === activeFilters[a].keys[i]) {
                this.filterGroups[g].filters[f].selected = true;
                break;
              }
            }
          }
          break;
        }
      }
    }
  }

  /**
   * Checks if the given array of active filter objects is non-identical to this.activeFilters.
   * @param compareActiveFilters Array of active filter objects to compare upon.
   * @returns True if the given filters array differs from this.activeFilters
   */
  private activeFiltersChanged(compareActiveFilters: any[]): boolean {
    if (compareActiveFilters.length !== this.activeFilters.length) {
      return true;
    } else {
      for (let a = 0; a < this.activeFilters.length; a++) {
        let groupFound = false;
        for (let c = 0; c < compareActiveFilters.length; c++) {
          if (this.activeFilters[a].name === compareActiveFilters[c].name) {
            groupFound = true;

            if (this.activeFilters[a].keys.length !== compareActiveFilters[c].keys.length) {
              return true;
            }

            for (let k = 0; k < this.activeFilters[a].keys.length; k++) {
              if (!compareActiveFilters[c].keys.includes(this.activeFilters[a].keys[k])) {
                return true;
              }
            }
            break;
          }
        }

        if (!groupFound) {
          return true;
        }
      }
    }

    return false;
  }

  private clearAllActiveFilters() {
    this.activeFilters = [];
    for (let g = 0; g < this.filterGroups.length; g++) {
      for (let f = 0; f < this.filterGroups[g].filters.length; f++) {
        this.filterGroups[g].filters[f].selected = false;
      }
    }
  }

  /**
   * Updates filter data using the search result's aggregation data.
   */
  private updateFilters(aggregations: AggregationsData) {
    // Get aggregation keys that are ordered in config.json.
    this.elastic.getAggregationKeys().forEach((filterGroupKey: any) => {
      const newFilterGroup = this.convertAggregationsToFilters(aggregations[filterGroupKey]);
      let filterGroupExists = false;
      for (let g = 0; g < this.filterGroups.length; g++) {
        if (this.filterGroups[g].name === filterGroupKey) {
          filterGroupExists = true;

          if (
            config.ElasticSearch?.aggregations?.[filterGroupKey]?.terms &&
            !config.ElasticSearch?.aggregations?.[filterGroupKey]?.terms?.order
          ) {
            // Aggregations are ordered desc according to doc_count -->
            // Empty filters should be removed, so replace filters in the group
            const filtersArray = this.convertFilterGroupToArray(filterGroupKey, newFilterGroup);

            // Retain selected status of filters, i.e. search for all selected filters
            // in the matching filterGroup and apply selected to the new filters
            for (let f = 0; f < this.filterGroups[g].filters.length; f++) {
              if (this.filterGroups[g].filters[f].selected) {
                for (let w = 0; w < filtersArray.length; w++) {
                  if (this.filterGroups[g].filters[f].key === filtersArray[w].key) {
                    filtersArray[w].selected = true;
                    break;
                  }
                }
              }
            }

            this.filterGroups[g].filters = filtersArray;
          } else {
            // Aggregations are ordered according to key name -->
            // Empty filters should be retained with zero count
            for (let f = 0; f < this.filterGroups[g].filters.length; f++) {
              const updatedFilter = newFilterGroup[this.filterGroups[g].filters[f].key];
              if (updatedFilter) {
                this.filterGroups[g].filters[f].doc_count = updatedFilter.doc_count;
              } else {
                this.filterGroups[g].filters[f].doc_count = 0;
              }
            }
          }

          // The reference of date histogram filter arrays needs to be changed in order
          // for change detection to be triggered in the <date-histogram> component
          // when the input changes. This shallow copy action using the spread operator
          // accomplishes this.
          if (config.ElasticSearch?.aggregations?.[filterGroupKey]?.date_histogram) {
            this.filterGroups[g].filters = [...this.filterGroups[g].filters];
          }

          break;
        }
      }

      if (!filterGroupExists) {
        this.filterGroups.push(
          {
            name: filterGroupKey,
            filters: this.convertFilterGroupToArray(filterGroupKey, newFilterGroup),
            open: config.ElasticSearch?.filterGroupsOpenByDefault?.includes(filterGroupKey) ? true : false,
            type: this.elastic.isDateHistogramAggregation(filterGroupKey) ? 'date_histogram' : 'terms'
          }
        );
      }
    });
  }

  private getInitialFilters(aggregations: AggregationsData) {
    // Get aggregation keys that are ordered in config.json.
    const filterGroups: any[] = [];
    this.elastic.getAggregationKeys().forEach((filterGroupKey: any) => {
      const facetGroupObj = this.convertAggregationsToFilters(aggregations[filterGroupKey]);

      filterGroups.push(
        {
          name: filterGroupKey,
          filters: this.convertFilterGroupToArray(filterGroupKey, facetGroupObj),
          open: config.ElasticSearch?.filterGroupsOpenByDefault?.includes(filterGroupKey) ? true : false,
          type: this.elastic.isDateHistogramAggregation(filterGroupKey) ? 'date_histogram' : 'terms'
        }
      );
    });

    return filterGroups;
  }

  /**
   * Convert aggregation data to facets data.
   */
  private convertAggregationsToFilters(aggregation: AggregationData): Facets {
    const facets = {} as any;
    // Get buckets from either unfiltered or filtered aggregation.
    const buckets = aggregation.buckets || aggregation?.filtered?.buckets;

    buckets?.forEach((facet: Facet) => {
      facets[facet.key] = facet;
    });
    return facets;
  }

  private convertFilterGroupToArray(facetGroupKey: string, facetGroupObj: Facets) {
    if (facetGroupObj) {
      if (facetGroupKey !== 'Years') {
        const keys = [];
        const facetsAsArray = [];
        for (const key in facetGroupObj) {
          if (facetGroupObj.hasOwnProperty(key)) {
            keys.push(key);
          }
        }
        for (let i = 0; i < keys.length; i++) {
          facetsAsArray.push(facetGroupObj[keys[i]]);
        }
        if (!config.ElasticSearch?.aggregations?.[facetGroupKey]?.terms?.order?._key) {
          this.commonFunctions.sortArrayOfObjectsNumerically(facetsAsArray, 'doc_count');
        }
        return facetsAsArray;
      } else {
        return Object.values(facetGroupObj);
      }
    } else {
      return [];
    }
  }

  getTextName(source: any) {
    return source?.text_title;
  }

  getPublicationName(source: any) {
    return source?.publication_data?.[0]?.publication_name;
  }

  getHiglightedTextName(highlight: any) {
    if (highlight['text_title']) {
      return highlight['text_title'][0];
    } else {
      return '';
    }
  }

  getHiglightedPublicationName(highlight: any) {
    if (highlight['publication_data.publication_name']) {
      return highlight['publication_data.publication_name'][0];
    } else {
      return '';
    }
  }

  getPublicationCollectionName(source: any) {
    return source?.publication_data?.[0]?.collection_name;
  }

  // Returns the title from the xml title element in the teiHeader
  getTitle(source: any) {
    return (source.doc_title || source.name || '').trim();
  }

  getGenre(source: any) {
    return source?.publication_data?.[0]?.genre;
  }

  private formatISO8601DateToLocale(date: string) {
    return date && new Date(date).toLocaleDateString('fi-FI');
  }

  hasDate(source: any) {
    const dateData = source?.publication_data?.[0]?.original_publication_date ?? source?.orig_date_certain;
    if (dateData === undefined || dateData === null || dateData === '') {
      if (source.orig_date_year !== undefined && source.orig_date_year !== null && source.orig_date_year !== '') {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  getDate(source: any) {
    let date = source?.publication_data?.[0]?.original_publication_date ?? this.formatISO8601DateToLocale(source?.orig_date_certain);
    if ((date === undefined || date === '' || date === null)
    && source.orig_date_year !== undefined && source.orig_date_year !== null && source.orig_date_year !== '') {
      date = source.orig_date_year;
    }
    return date;
  }

  private filterEmpty(array: any[]) {
    return array.filter(str => str).join(', ');
  }

  getHeading(hit: any) {
    /* If a match is found in the publication name, return it from the highlights. Otherwise from the data. */
    let text_name = '';
    if (hit.highlight) {
      text_name = this.getHiglightedTextName(hit.highlight);
    }
    if (!text_name) {
      text_name = this.getTextName(hit.source);
      if (!text_name) {
        text_name = this.getTitle(hit.source);
      }
    }
    return text_name;
  }

  getSubHeading(source: any) {
    return this.filterEmpty([
      this.getGenre(source),
      source.type !== 'brev' && this.getDate(source)
    ]);
  }

  getEllipsisString(str: any, max = 50) {
    if (!str || str.length <= max) {
      return str;
    } else {
      return str.substring(0, max) + '...';
    }
  }

  toggleFilterGroupOpenState(filterGroup: any) {
    filterGroup.open = !filterGroup.open;
  }

  private getMdContent(fileID: string): Observable<SafeHtml> {
    return this.mdContentService.getMdContent(fileID).pipe(
      map((res: any) => {
        return this.sanitizer.bypassSecurityTrustHtml(marked(res.content));
      }),
      catchError((e) => {
        return of('');
      })
    );
  }

  showAllHitHighlights(event: any) {
    // Find and show all hidden highlights
    let parentElem = event.target.parentElement as any;
    while (parentElem !== null && !parentElem.classList.contains('match-highlights')) {
      parentElem = parentElem.parentElement;
    }

    if (parentElem !== null) {
      const highlightElems = parentElem.querySelectorAll('.hidden-highlight');
      for (let i = 0; i < highlightElems.length; i++) {
        highlightElems[i].classList.remove('hidden-highlight');
      }
    }

    // Hide the button that triggered the event
    if (event.target?.classList.contains('show-all-highlights')) {
      event.target.classList.add('hidden-highlight-button');
    }
  }

  toggleFiltersColumn() {
    this.filtersVisible = !this.filtersVisible;
  }

  scrollToTop() {
    const searchBarElem = document.querySelector('.search-container') as HTMLElement;
    if (searchBarElem) {
      const topMenuElem = document.querySelector('top-menu') as HTMLElement;
      if (topMenuElem) {
        this.content.scrollByPoint(0, searchBarElem.getBoundingClientRect().top - topMenuElem.offsetHeight, 500);
      }
    }
  }

  trackById(index: number, item: any) {
    return item.id;
  }

  trackByKey(index: number, item: any) {
    return item.key;
  }

  trackByName(index: number, item: any) {
    return item.name;
  }

}
