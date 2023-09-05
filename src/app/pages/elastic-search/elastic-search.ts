import { ChangeDetectorRef, Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { catchError, map, Observable, of, Subscription } from 'rxjs';
import { marked } from 'marked';

import { AggregationData, AggregationsData, Facet, Facets, FacetGroups, TimeRange } from 'src/app/models/elastic-search.model';
import { CommonFunctionsService } from 'src/app/services/common-functions.service';
import { ElasticSearchService } from 'src/app/services/elastic-search.service';
import { MdContentService } from 'src/app/services/md-content.service';
import { UrlService } from 'src/app/services/url.service';
import { UserSettingsService } from 'src/app/services/user-settings.service';
import { config } from "src/assets/config/config";


@Component({
  selector: 'page-elastic-search',
  templateUrl: 'elastic-search.html',
  styleUrls: ['elastic-search.scss']
})
export class ElasticSearchPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;
  
  // Helpers to loop objects
  objectKeys = Object.keys;
  objectValues = Object.values;

  aggregations: object = {};
  dateHistogramData: any = undefined;
  disableFacetCheckboxes = true;
  elasticError: boolean = false;
  enableFilters: boolean = true;
  facetGroups: any = {};
  filtersVisible: boolean = true;
  from: number = 0;
  groupsOpenByDefault: any;
  highlightSearchMatches: boolean = true;
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
  selectedFacetGroups: FacetGroups = {};
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
    this.highlightSearchMatches = config.show?.highlightedSearchMatches ?? true;
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
        this.facetGroups = filters;
        if (this.facetGroups['Years']) {
          this.dateHistogramData = Object.values(this.facetGroups['Years']);
        }
        this.disableFacetCheckboxes = false;
        this.loading = false;

        console.log('initial facetGroups: ', this.facetGroups);

        // Subscribe to queryParams, all searches are triggered through them
        this.routeQueryParamsSubscription = this.route.queryParams.subscribe(
          (queryParams: any) => {
            let triggerSearch = false;
            let directSearch = false;

            if (queryParams['query']) {
              if (queryParams['query'] !== this.query) {
                this.query = queryParams['query'];
              }
              triggerSearch = true;
            }

            if (queryParams['filters']) {
              // TODO
              triggerSearch = true;
            }

            if (queryParams['from'] && queryParams['to']) {
              let range = { from: queryParams['from'], to: queryParams['to'] };
              if (range.from !== this.rangeYears?.from && range.to !== this.rangeYears?.to) {
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
              if (queryParams['order'] === 'relevance') {
                this.sort = '';
              } else {
                this.sort = queryParams['order'];
              }
              triggerSearch = true;
            }

            if (queryParams['pages']) {
              if (this.from < 1) {
                this.hits = [];
                this.from = 0;
                this.total = -1;
                this.pages = Number(queryParams['pages']) || 1;
              } else {
                this.loadingMoreHits = true;
              }
              directSearch = true;
              triggerSearch = true;
            }

            if (!triggerSearch && !queryParams['query'] && !this.initializing) {
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
    this.search();
    this.cf.detectChanges();
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
   * Triggers a new search with selected facets.
   */
  onFacetsChanged() {
    this.disableFacetCheckboxes = true;
    this.cf.detectChanges();
    this.reset();
    this.loading = true;
    this.search();
  }

  /**
   * Triggers a new search with selected years.
   */
  onRangeChange(from: string, to: string) {
    let triggerSearch = false;
    let range = null;
    if (from && to) {
      // Certain date range
      range = {from, to};
      triggerSearch = true;  
    } else if (!from && !to) {
      // All time
      this.range = null;
      this.rangeYears = undefined;
      triggerSearch = true;
    }

    if (triggerSearch) {
      this.updateURLQueryParameters(
        {
          from: range && range.from ? range.from : null,
          to: range && range.to ? range.to : null
        }
      );
    }
  }

  /**
   * Sorting changed so trigger new query.
   */
  onSortByChanged() {
    this.updateURLQueryParameters({ order: this.sort || 'relevance' });
  }

  /**
   * Resets search results.
   */
  reset() {
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
      facetGroups: this.facetGroups,
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
    });
    
    // Get aggregations only if NOT loading more hits
    if (this.from < 1) {
      this.getAggregations();
    }
  }

  private getAggregations() {
    this.elastic.executeAggregationQuery({
      queries: [this.query],
      facetGroups: this.facetGroups,
      range: this.range,
    }).subscribe({
      next: data => {
        this.populateFacets(data.aggregations);
        this.disableFacetCheckboxes = false;
      },
      error: e => {
        console.error('Error fetching aggregations', e);
        this.loading = false;
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
    this.pages += 1;

    this.updateURLQueryParameters({ pages: this.pages });
  }

  canShowHits() {
    return (!this.loading || this.loadingMoreHits) && (this.submittedQuery || this.range || this.hasSelectedFacets());
  }

  hasSelectedFacets() {
    return Object.values(this.facetGroups).some((facets: any) => Object.values(facets).some((facet: any) => facet.selected));
  }

  hasSelectedFacetsByGroup(groupKey: string) {
    return (this.selectedFacetGroups[groupKey] ? Object.keys(this.selectedFacetGroups[groupKey]).length : 0) > 0;
  }

  hasSelectedNormalFacets() {
    return Object.keys(this.facetGroups).some(facetGroupKey =>
      facetGroupKey !== 'Type' && facetGroupKey !== 'Years' && Object.values(this.facetGroups[facetGroupKey]).some((facet: any) => facet.selected)
    );
  }

  hasFacets(facetGroupKey: string) {
    return (this.facetGroups[facetGroupKey] ? Object.keys(this.facetGroups[facetGroupKey]).length : 0) > 0;
  }

  getFacets(facetGroupKey: string): any {
    const facets = this.facetGroups[facetGroupKey];
    if (facets) {
      if (facetGroupKey !== 'Years') {
        const keys = [];
        const facetsAsArray = [];
        for (const key in facets) {
          if (facets.hasOwnProperty(key)) {
            keys.push(key);
          }
        }
        for (let i = 0; i < keys.length; i++) {
          facetsAsArray.push(facets[keys[i]]);
        }
        if (!config.ElasticSearch?.aggregations?.[facetGroupKey]?.terms?.order?._key) {
          this.commonFunctions.sortArrayOfObjectsNumerically(facetsAsArray, 'doc_count');
        }
        return facetsAsArray;
      } else {
        return Object.values(facets);
      }
    } else {
      return [];
    }
  }

  /**
   * Toggles facet on/off. Note that the selected state is controlled by the ion-checkbox
   * so it should not be modified here.
   */
  updateFacet(facetGroupKey: string, facet: Facet) {
    const facets = this.facetGroups[facetGroupKey] || {};
    facets[facet.key] = facet;
    this.facetGroups[facetGroupKey] = facets;

    this.updateSelectedFacets(facetGroupKey, facet);

    this.onFacetsChanged();
  }

  unselectFacet(facetGroupKey: string, facet: Facet) {
    facet.selected = false;
    this.updateFacet(facetGroupKey, facet);
  }

  private updateSelectedFacets(facetGroupKey: string, facet: Facet) {
    const facetGroup = this.selectedFacetGroups[facetGroupKey] || {};

    // Set or delete facet from selected facets
    if (facet.selected) {
      facetGroup[facet.key] = facet;
    } else {
      delete facetGroup[facet.key];
    }

    // Set or delete facet group from selected facet groups
    if ((facetGroup ? Object.keys(facetGroup).length : 0) === 0) {
      delete this.selectedFacetGroups[facetGroupKey];
    } else {
      this.selectedFacetGroups[facetGroupKey] = facetGroup;
    }
  }

  /**
   * Populate facets data using the search results aggregation data.
   */
  private populateFacets(aggregations: AggregationsData) {
    // Get aggregation keys that are ordered in config.json.
    this.elastic.getAggregationKeys().forEach((facetGroupKey: any) => {
      const newFacets = this.convertAggregationsToFacets(aggregations[facetGroupKey]);
      if (this.facetGroups[facetGroupKey]) {
        Object.entries(this.facetGroups[facetGroupKey]).forEach(([facetKey, existingFacet]: [string, any]) => {
          const newFacet = newFacets[facetKey];
          if (newFacet) {
            existingFacet.doc_count = newFacet.doc_count;
          } else if (this.hasSelectedFacetsByGroup(facetGroupKey)) {
            // Unselected facets aren't updating because the terms bool.filter in the query
            // prevents unselected aggregations from appearing in the results.
            // TODO: Fix this by separating search and aggregation query. // SK: not sure this is an issua any more
          } else {
            // delete this.facetGroups[facetGroupKey][facetKey];
            existingFacet.doc_count = 0;
          }
        })
        Object.entries(newFacets).forEach(([facetKey, existingFacet]: [string, any]) => {
          if (this.facetGroups[facetGroupKey][facetKey] === undefined) {
            this.facetGroups[facetGroupKey][facetKey] = existingFacet;
          }
        });
      } else {
        this.facetGroups[facetGroupKey] = newFacets;
      }
    });
  }

  private getInitialFilters(aggregations: AggregationsData) {
    // Get aggregation keys that are ordered in config.json.
    const filterGroups: any = {};
    this.elastic.getAggregationKeys().forEach((facetGroupKey: any) => {
      filterGroups[facetGroupKey] = this.convertAggregationsToFacets(aggregations[facetGroupKey]);
    });
    return filterGroups;
  }

  /**
   * Convert aggregation data to facets data.
   */
  private convertAggregationsToFacets(aggregation: AggregationData): Facets {
    const facets = {} as any;
    // Get buckets from either unfiltered or filtered aggregation.
    const buckets = aggregation.buckets || aggregation?.filtered?.buckets;

    buckets?.forEach((facet: Facet) => {
      facets[facet.key] = facet;
    });
    return facets;
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

  public getDate(source: any) {
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

  getHitHref(hit: any) {
    let path = '/';

    if (hit.source.text_type === 'tit') {
      path = path + 'publication-title/' + hit.source.collection_id;
    } else if (hit.source.text_type === 'fore') {
      path = path + 'publication-foreword/' + hit.source.collection_id;
    } else if (hit.source.text_type === 'inl') {
      path = path + 'publication-introduction/' + hit.source.collection_id;
    } else {
      path = path + 'publication/' + hit.source.collection_id;
      path = path + '/text/' + hit.source.publication_id;
      path = path + '/nochapter/not/infinite/nosong/';
      path = path + this.getMatchesForUrl(hit) + '/';
    }

    if (hit.source.text_type === 'est') {
      path = path + 'established';
    } else if (hit.source.text_type === 'com') {
      path = path + 'comments';
    } else if (hit.source.text_type === 'ms') {
      path = path + 'manuscripts';
    } else if (hit.source.text_type === 'var') {
      path = path + 'variants';
    }

    return path;
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

  getMatchesForUrl(hit: any) {
    if (hit && hit.highlight && hit.highlight.text_data && this.highlightSearchMatches) {
      let encoded_matches = '';
      const unique_matches = [] as any;
      const regexp = /<em>.+?<\/em>/g;

      hit.highlight.text_data.forEach((highlight: any) => {
        const matches = highlight.match(regexp);
        matches.forEach((match: any) => {
          const clean_match = match.replace('<em>', '').replace('</em>', '').toLowerCase();
          if (!unique_matches.includes(clean_match)) {
            unique_matches.push(clean_match);
          }
        });
      });

      if (unique_matches.length > 0) {
        for (let i = 0; i < unique_matches.length; i++) {
          encoded_matches = encoded_matches + encodeURIComponent(unique_matches[i]);
          if (i < unique_matches.length - 1) {
            encoded_matches = encoded_matches + '_';
          }
        }
        return encoded_matches;
      } else {
        return 'searchtitle';
      }
    } else {
      return 'searchtitle';
    }
  }

  openAccordion(e: any, group: any) {
    const facet = document.getElementById('facetList-' + group);
    const arrow = document.getElementById('arrow-' + group);

    arrow?.classList.toggle('rotate');

    if (arrow?.classList.contains('open')) {
      if (facet) {
        facet.style.display = 'none';
      }
      arrow.classList.add('closed');
      arrow.classList.remove('open');
    } else if (arrow) {
      if (facet) {
        facet.style.display = 'block';
      }
      arrow.classList.add('open');
      arrow.classList.remove('closed');
    }
    this.cf.detectChanges();
  }

  autoExpandSearchfields() {
    const inputs: NodeListOf<HTMLElement> = document.querySelectorAll('.searchInput');

    for (let i = 0; i < inputs.length; i++) {
      const borderTop = measure(inputs[i], 'border-top-width');
      const borderBottom = measure(inputs[i], 'border-bottom-width');

      inputs[i].style.height = '';
      inputs[i].style.height = borderTop + inputs[i].scrollHeight + borderBottom + 'px';
    }

    function measure(elem: Element, property: any) {
      return parseInt(
        window.getComputedStyle(elem, null)
          .getPropertyValue(property)
          .replace(/px$/, ''));
    }
  }

  getMdContent(fileID: string): Observable<SafeHtml> {
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
}
