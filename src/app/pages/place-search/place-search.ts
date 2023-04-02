import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OverlayEventDetail } from '@ionic/core';
import { ModalController, Platform } from '@ionic/angular';
import debounce from 'lodash/debounce';
import { Subscription } from 'rxjs';
import { OccurrencesPage } from 'src/app/modals/occurrences/occurrences';
import { FilterPage } from 'src/app/modals/filter/filter';
import { OccurrenceResult } from 'src/app/models/occurrence.model';
import { SemanticDataService } from 'src/app/services/semantic-data/semantic-data.service';
import { LanguageService } from 'src/app/services/languages/language.service';
import { MdContentService } from 'src/app/services/md/md-content.service';
import { OccurrenceService } from 'src/app/services/occurrence/occurence.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { EventsService } from 'src/app/services/events/events.service';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';
import { CommonFunctionsService } from 'src/app/services/common-functions/common-functions.service';
import { config } from "src/app/services/config/config";

/**
 * A page for searching place occurrences.
 */

// @IonicPage({
//   name: 'place-search',
//   segment: 'places'
// })
@Component({
  selector: 'page-place-search',
  templateUrl: 'place-search.html',
  styleUrls: ['place-search.scss']
})
export class PlaceSearchPage {
  // @ViewChild(Content) content: Content;
  places: any[] = [];
  searchText?: string;
  max_fetch_size = 500;
  last_fetch_size = 0;
  agg_after_key: Record<string, any> = {};
  showLoading = false;
  showFilter = true;
  filters: any = [];
  immediate_search = false;
  objectType = 'location';
  mdContent?: string;

  // tslint:disable-next-line:max-line-length
  alphabet: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'Å', 'Ä', 'Ö'];

  languageSubscription?: Subscription;
  debouncedSearch = debounce(this.searchPlaces, 500);

  constructor(
              public semanticDataService: SemanticDataService,
              protected langService: LanguageService,
              private mdContentService: MdContentService,
              private platform: Platform,
              public occurrenceService: OccurrenceService,
              protected storage: StorageService,
              private events: EventsService,
              public modalCtrl: ModalController,
              private userSettingsService: UserSettingsService,
              public commonFunctions: CommonFunctionsService,
              private router: Router,
  ) {
    this.showFilter = config.LocationSearch?.ShowFilter ?? true;
    this.max_fetch_size = config.LocationSearch?.InitialLoadNumber ?? 500;

    if (this.max_fetch_size > 10000) {
      this.max_fetch_size = 10000;
    }
  }

  ngOnInit() {
    this.getPlaces();
    this.languageSubscription = this.langService.languageSubjectChange().subscribe(lang => {
      if (lang) {
        this.getMdContent(lang + '-12-03');
      }
    });
  }

  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  getPlaces() {
    this.showLoading = true;
    this.semanticDataService.getLocationElastic(this.agg_after_key, this.searchText, this.filters, this.max_fetch_size).subscribe(
      places => {
        // console.log('Elastic response: ', places);
        if (places.error !== undefined) {
          console.error('Elastic search error getting places: ', places);
        }
        if (places.aggregations && places.aggregations.unique_places && places.aggregations.unique_places.buckets.length > 0) {
          this.agg_after_key = places.aggregations.unique_places.after_key;
          this.last_fetch_size = places.aggregations.unique_places.buckets.length;

          console.log('Number of fetched places: ', this.last_fetch_size);

          const combining = /[\u0300-\u036F]/g;

          places = places.aggregations.unique_places.buckets;
          places.forEach((element: any) => {
            element = element['key'];

            let sortByName = String(element['name']);
            if (element['sort_by_name']) {
              sortByName = String(element['sort_by_name']);
            }
            sortByName = sortByName.replace('ʽ', '').trim().toLowerCase();
            const ltr = sortByName.charAt(0);
            if (ltr.length === 1 && ltr.match(/[a-zåäö]/i)) {
              element['sort_by_name'] = sortByName;
            } else {
              element['sort_by_name'] = sortByName.normalize('NFKD').replace(combining, '').replace(',', '');
            }

            this.places.push(element);
          });
        } else {
          this.agg_after_key = {};
          this.last_fetch_size = 0;
        }

        this.sortListAlphabeticallyAndGroup(this.places);
        this.showLoading = false;
      },
      err => {
        console.error(err);
        this.showLoading = false;
        this.agg_after_key = {};
        this.last_fetch_size = 0;
      }
    );
  }

  showAll() {
    this.filters = [];
    this.searchText = '';
    this.searchPlaces();
    // this.scrollToTop();
  }

  filterByLetter(letter: any) {
    this.searchText = letter;
    this.searchPlaces();
    // this.scrollToTop();
  }

  onSearchInput() {
    if (this.immediate_search) {
      this.immediate_search = false;
      this.searchPlaces();
    } else {
      this.debouncedSearch();
    }
  }

  onSearchClear() {
    this.immediate_search = true;
  }

  searchPlaces() {
    this.agg_after_key = {};
    this.places = [];
    if (this.showLoading) {
      this.debouncedSearch();
    } else {
      this.getPlaces();
    }
  }

  loadMore(e: any) {
    this.getPlaces();
  }

  hasMore() {
    return this.last_fetch_size > this.max_fetch_size - 1;
  }

  async openPlace(occurrenceResult: OccurrenceResult) {
    const showOccurrencesModalOnRead = config.showOccurencesModalOnReadPageAfterSearch?.placeSearch ?? true;
    const openOccurrencesAndInfoOnNewPage = config.OpenOccurrencesAndInfoOnNewPage ?? false;

    if (openOccurrencesAndInfoOnNewPage) {
      this.router.navigate([`/result/${this.objectType}/${occurrenceResult.id}`]);
    } else {
      const occurrenceModal = await this.modalCtrl.create({
        component: OccurrencesPage,
        componentProps: {
          id: occurrenceResult.id,
          type: this.objectType,
          showOccurrencesModalOnRead: showOccurrencesModalOnRead,
        }
      });

      return await occurrenceModal.present();
    }
  }

  sortListAlphabeticallyAndGroup(list: any[]) {
    const data = list;

    // Sort alphabetically
    this.commonFunctions.sortArrayOfObjectsAlphabetically(data, 'sort_by_name');

    // Check when first character changes in order to divide names into alphabetical groups
    for (let i = 0; i < data.length ; i++) {
      if (data[i] && data[i - 1]) {
        if (data[i].sort_by_name && data[i - 1].sort_by_name) {
          if (data[i].sort_by_name.length > 1 && data[i - 1].sort_by_name.length > 1) {
            if (data[i].sort_by_name.charAt(0) !== data[i - 1].sort_by_name.charAt(0)) {
              const ltr = data[i].sort_by_name.charAt(0);
              if (ltr.length === 1 && ltr.match(/[a-zåäö]/i)) {
                data[i]['firstOfItsKind'] = data[i].sort_by_name.charAt(0);
              }
            }
          }
        }
      }
    }

    for (let j = 0; j < data.length; j++) {
      if (data[j].sort_by_name.length > 1) {
        data[j]['firstOfItsKind'] = data[j].sort_by_name.charAt(0);
        break;
      }
    }

    return data;
  }

  async openFilterModal() {
    const filterModal = await this.modalCtrl.create({
      component: FilterPage,
      componentProps: {
        searchType: 'place-search', activeFilters: this.filters
      }
    });
    filterModal.onDidDismiss().then((detail: OverlayEventDetail) => {
      const { filters } = detail.data;
      if (filters) {
        this.places = [];
        this.agg_after_key = {};
        this.filters = filters;
        this.getPlaces();
      }
    });
    return await filterModal.present();
  }

  getMdContent(fileID: string) {
    this.mdContentService.getMdContent(fileID)
      .subscribe(
        text => { this.mdContent = text.content; },
        error => { this.mdContent = ''; }
      );
  }

  scrollToTop() {
    // this.content.scrollToTop(400);
  }

}
