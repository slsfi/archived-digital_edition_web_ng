import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LoadingController, ModalController } from '@ionic/angular';
import { catchError, map, Observable, of } from 'rxjs';
import { marked } from 'marked';
import { OccurrencesModal } from 'src/app/modals/occurrences/occurrences.modal';
import { FilterPage } from 'src/app/modals/filter/filter';
import { OccurrenceResult } from 'src/app/models/occurrence.model';
import { OccurrenceService } from 'src/app/services/occurrence/occurence.service';
import { SemanticDataService } from 'src/app/services/semantic-data/semantic-data.service';
import { MdContentService } from 'src/app/services/md/md-content.service';
import { TooltipService } from 'src/app/services/tooltips/tooltip.service';
import { CommonFunctionsService } from 'src/app/services/common-functions/common-functions.service';
import { config } from "src/assets/config/config";


@Component({
  selector: 'page-persons',
  templateUrl: 'index-of-persons.html',
  styleUrls: ['index-of-persons.scss']
})
export class IndexOfPersonsPage implements OnInit {
  persons: any[] = [];
  searchText?: string;
  max_fetch_size = 500;
  last_fetch_size = 0;
  agg_after_key: Record<string, any> = {};
  showLoading = false;
  showFilter = true;
  filters: any = [];
  immediate_search = false;
  type: any;
  subType: any;
  objectType = 'subject';
  pageTitle?: string | null;
  mdContent$: Observable<SafeHtml>;

  // tslint:disable-next-line:max-line-length
  alphabet: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'Å', 'Ä', 'Ö'];

  personSearchTypes = [] as any;

  // debouncedSearch = debounce(this.searchPersons, 500); // lodash/debounce has been removed from dependencies. Implement with Ionic's debounce instead.
  debouncedSearch = this.searchPersons;

  constructor(
              private sanitizer: DomSanitizer,
              public semanticDataService: SemanticDataService,
              private mdContentService: MdContentService,
              public modalCtrl: ModalController,
              public loadingCtrl: LoadingController,
              public occurrenceService: OccurrenceService,
              private tooltipService: TooltipService,
              public commonFunctions: CommonFunctionsService,
              private router: Router,
              private route: ActivatedRoute,
              @Inject(LOCALE_ID) public activeLocale: string
  ) {
    this.showFilter = config.PersonSearch?.ShowFilter ?? true;
    this.personSearchTypes = config.PersonSearchTypes ?? [];
    this.max_fetch_size = config.PersonSearch?.InitialLoadNumber ?? 500;

    if (this.max_fetch_size > 10000) {
      this.max_fetch_size = 10000;
    }
  }

  ngOnInit() {
    this.getParamsData();
    this.mdContent$ = this.getMdContent(this.activeLocale + '-12-02');
  }

  getParamsData() {
    this.route.params.subscribe(params => {
      this.type = params['type'] || null;
      this.subType = params['subtype'];
      if ( String(this.subType).includes('subtype') ) {
        this.subType = null;
        this.pageTitle = $localize`:@@TOC.PersonSearch:Personregister`;
      }

      if (this.subType) {
        const subTypeObj = {
          key: this.subType,
          name: this.subType,
          selected: true
        }
        this.filters['filterPersonTypes' as keyof typeof this.filters] = [];
        this.filters['filterPersonTypes' as keyof typeof this.filters].push(subTypeObj);
        /**
         * TODO: Get correct page title if subtype person search
         */
        this.pageTitle = null;
      }

      this.getPersons();
    });

  }

  getPersons() {
    this.showLoading = true;
    this.semanticDataService.getSubjectsElastic(this.agg_after_key, this.searchText, this.filters, this.max_fetch_size).subscribe({
      next: (persons) => {
        // console.log('Elastic response: ', persons);
        if (persons.error !== undefined) {
          console.error('Elastic search error getting persons: ', persons);
        }

        if (persons.aggregations && persons.aggregations.unique_subjects && persons.aggregations.unique_subjects.buckets.length > 0) {
          this.agg_after_key = persons.aggregations.unique_subjects.after_key;
          this.last_fetch_size = persons.aggregations.unique_subjects.buckets.length;

          console.log('Number of fetched persons: ', this.last_fetch_size);

          const combining = /[\u0300-\u036F]/g;

          persons = persons.aggregations.unique_subjects.buckets;
          persons.forEach((element: any) => {
            element = element['key'];

            let sortByName = String(element['full_name']);
            if (element['sort_by_name']) {
              sortByName = String(element['sort_by_name']);
            }
            sortByName = sortByName.replace('ʽ', '').trim();
            sortByName = sortByName.replace(/^(?:de la |de |von |van |af |d’ |d’|di |du |des |zu |auf |del |do |dos |da |das |e )/, '');
            sortByName = sortByName.toLowerCase();
            const ltr = sortByName.charAt(0);
            if (ltr.length === 1 && ltr.match(/[a-zåäö]/i)) {
              element['sort_by_name'] = sortByName;
            } else {
              element['sort_by_name'] = sortByName.normalize('NFKD').replace(combining, '').replace(',', '');
            }

            element['year_born_deceased'] = this.tooltipService.constructYearBornDeceasedString(element['date_born'],
            element['date_deceased']);

            if ( this.subType !== '' && this.subType !== null && element['type'] !== this.subType ) {
            } else {
              this.persons.push(element);
            }
          });
        } else {
          this.agg_after_key = {};
          this.last_fetch_size = 0;
        }

        this.sortListAlphabeticallyAndGroup(this.persons);
        this.showLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.showLoading = false;
        this.agg_after_key = {};
        this.last_fetch_size = 0;
      }
    });
  }

  sortListAlphabeticallyAndGroup(listOfPersons: any[]) {
    const persons = listOfPersons;

    this.commonFunctions.sortArrayOfObjectsAlphabetically(persons, 'sort_by_name');
    this.groupPersonsAlphabetically(persons);

    for (let j = 0; j < persons.length; j++) {
      if (persons[j].sort_by_name.length > 1) {
        persons[j]['firstOfItsKind'] = persons[j].sort_by_name.charAt(0);
        break;
      }
    }
    return persons;
  }

  groupPersonsAlphabetically(persons: any) {
    // Checks when first character changes in order to divide names into alphabetical groups
    for (let i = 0; i < persons.length ; i++) {
      if (persons[i] && persons[i - 1]) {
        if (persons[i].sort_by_name && persons[i - 1].sort_by_name) {
          if (persons[i].sort_by_name.length > 0 && persons[i - 1].sort_by_name.length > 0) {
            if (persons[i].sort_by_name.charAt(0) !== persons[i - 1].sort_by_name.charAt(0)) {
              const ltr = persons[i].sort_by_name.charAt(0);
              if (ltr.length === 1 && ltr.match(/[a-zåäö]/i)) {
                persons[i]['firstOfItsKind'] = persons[i].sort_by_name.charAt(0);
              }
            }
          }
        }
      }
    }
    return persons;
  }

  async openFilterModal() {
    const filterModal = await this.modalCtrl.create({
      component: FilterPage,
      componentProps: {
        searchType: 'person-search',
        activeFilters: this.filters
      }
    });
    filterModal.onDidDismiss().then((detail: any) => {
      const { filters } = detail.data;
      if (filters) {
        this.persons = [];
        this.agg_after_key = {};
        this.filters = filters;
        this.getPersons();
      }
    });
    filterModal.present();
  }

  showAll() {
    this.filters = [];
    this.searchText = '';
    this.searchPersons();
    // this.scrollToTop();
  }

  filterByLetter(letter: any) {
    this.searchText = letter;
    this.searchPersons();
    // this.scrollToTop();
  }

  onSearchInput() {
    if (this.immediate_search) {
      this.immediate_search = false;
      this.searchPersons();
    } else {
      this.debouncedSearch();
    }
  }

  onSearchClear() {
    this.immediate_search = true;
  }

  searchPersons() {
    this.agg_after_key = {};
    this.persons = [];
    if (this.showLoading) {
      this.debouncedSearch();
    } else {
      this.getPersons();
    }
  }

  loadMore(e: any) {
    this.getPersons();
  }

  hasMore() {
    return this.last_fetch_size > this.max_fetch_size - 1;
  }

  async openPerson(occurrenceResult: OccurrenceResult) {
    const showOccurrencesModalOnRead = config.showOccurencesModalOnReadPageAfterSearch?.personSearch ?? true;
    const openOccurrencesAndInfoOnNewPage = config.OpenOccurrencesAndInfoOnNewPage ?? false;

    if (openOccurrencesAndInfoOnNewPage) {
      this.router.navigate([`/result/${this.objectType}/${occurrenceResult.id}`])

    } else {
      const occurrenceModal = await this.modalCtrl.create({
        component: OccurrencesModal,
        id: occurrenceResult.id,
        componentProps: {
          type: this.objectType,
          showOccurrencesModalOnRead: showOccurrencesModalOnRead
        }
      });

      occurrenceModal.present();
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

  scrollToTop() {
    // this.content.scrollToTop(400);
  }

}
