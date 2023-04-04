import { Component, Inject, LOCALE_ID } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import debounce from 'lodash/debounce';
import { FilterPage } from 'src/app/modals/filter/filter';
import { OccurrencesPage } from 'src/app/modals/occurrences/occurrences';
import { OccurrenceResult } from 'src/app/models/occurrence.model';
import { CommonFunctionsService } from 'src/app/services/common-functions/common-functions.service';
import { MdContentService } from 'src/app/services/md/md-content.service';
import { OccurrenceService } from 'src/app/services/occurrence/occurence.service';
import { SemanticDataService } from 'src/app/services/semantic-data/semantic-data.service';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';
import { config } from "src/app/services/config/config";

/**
 * A page for searching tag occurrences.
 * Can be filtered by tag type.
 */

// @IonicPage({
//   name: 'tag-search',
//   segment: 'tags'
// })
@Component({
  selector: 'page-tag-search',
  templateUrl: 'tag-search.html',
  styleUrls: ['tag-search.scss']
})
export class TagSearchPage{
  tags: any[] = [];
  tagsCopy: any[] = [];
  searchText?: string;
  texts: any[] = [];
  showLoading = false;
  showFilter = true;
  agg_after_key: Record<string, any> = {};
  last_fetch_size = 0;
  max_fetch_size = 500;
  filters: any = [];
  immediate_search = false;
  mdContent?: string;
  objectType = 'tag';

  // tslint:disable-next-line:max-line-length
  alphabet: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'Å', 'Ä', 'Ö'];

  debouncedSearch = debounce(this.searchTags, 500);

  constructor(
              public semanticDataService: SemanticDataService,
              private mdContentService: MdContentService,
              public occurrenceService: OccurrenceService,
              public modalCtrl: ModalController,
              private userSettingsService: UserSettingsService,
              public commonFunctions: CommonFunctionsService,
              private router: Router,
              @Inject(LOCALE_ID) public activeLocale: string
  ) {
    this.showFilter = config.TagSearch.ShowFilter ?? true;
    this.max_fetch_size = config.TagSearch.InitialLoadNumber ?? 500;
    if (this.max_fetch_size > 10000) {
      this.max_fetch_size = 10000;
    }
  }

  ionViewDidLoad() {
    this.getTags();
    this.getMdContent(this.activeLocale + '-12-04');
  }

  getTags() {
    this.showLoading = true;
    this.semanticDataService.getTagElastic(this.agg_after_key, this.searchText, this.filters, this.max_fetch_size).subscribe(
      tags => {
        // console.log('Elastic response: ', tags);
        if (tags.error !== undefined) {
          console.error('Elastic search error getting tags: ', tags);
        }
        if (tags.aggregations && tags.aggregations.unique_tags && tags.aggregations.unique_tags.buckets.length > 0) {
          this.agg_after_key = tags.aggregations.unique_tags.after_key;
          this.last_fetch_size = tags.aggregations.unique_tags.buckets.length;

          console.log('Number of fetched tags: ', this.last_fetch_size);

          const combining = /[\u0300-\u036F]/g;

          tags = tags.aggregations.unique_tags.buckets;
          tags.forEach((element: any) => {
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

            this.tags.push(element);
          });
        } else {
          this.agg_after_key = {};
          this.last_fetch_size = 0;
        }

        this.sortListAlphabeticallyAndGroup(this.tags);
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
    this.searchTags();
    this.scrollToTop();
  }

  filterByLetter(letter: any) {
    this.searchText = letter;
    this.searchTags();
    this.scrollToTop();
  }

  onSearchInput() {
    if (this.immediate_search) {
      this.immediate_search = false;
      this.searchTags();
    } else {
      this.debouncedSearch();
    }
  }

  onSearchClear() {
    this.immediate_search = true;
  }

  searchTags() {
    this.agg_after_key = {};
    this.tags = [];
    if (this.showLoading) {
      this.debouncedSearch();
    } else {
      this.getTags();
    }
  }

  loadMore(e: any) {
    this.getTags();
  }

  hasMore() {
    return this.last_fetch_size > this.max_fetch_size - 1;
  }

  async openTag(occurrenceResult: OccurrenceResult) {
    const showOccurrencesModalOnRead = config.showOccurencesModalOnReadPageAfterSearch?.tagSearch ?? true;
    const openOccurrencesAndInfoOnNewPage = config.OpenOccurrencesAndInfoOnNewPage ?? false;

    if (openOccurrencesAndInfoOnNewPage) {
      this.router.navigate([`/result/${this.objectType}/${occurrenceResult.id}`])

    } else {
      const occurrenceModal = await this.modalCtrl.create({
        component: OccurrencesPage,
        componentProps: {
          id: occurrenceResult.id,
        type: this.objectType,
        showOccurrencesModalOnRead: showOccurrencesModalOnRead
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
      componentProps: { searchType: 'tag-search', activeFilters: this.filters }
    });
    filterModal.onDidDismiss().then((detail: any) => {
      const { filters } = detail.data;
      if (filters) {
        this.tags = [];
        this.agg_after_key = {};
        this.filters = filters;
        this.getTags();
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
