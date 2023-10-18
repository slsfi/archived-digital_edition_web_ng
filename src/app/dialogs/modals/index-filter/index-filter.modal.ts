import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

import { NamedEntityService } from '@services/named-entity.service';


@Component({
  standalone: true,
  selector: 'modal-index-filter',
  templateUrl: 'index-filter.modal.html',
  styleUrls: ['index-filter.modal.scss'],
  imports: [CommonModule, FormsModule, IonicModule]
})
export class IndexFilterModal implements OnInit {
  @Input() activeFilters: any = undefined;
  @Input() searchType: string = '';

  filterCategoryTypes?: any[];
  filterCollections?: any[];
  filterPersonTypes?: any[];
  filterPlaceCountries?: any[];
  filterYearMax?: number;
  filterYearMin?: number;
  isEmpty: boolean = false;
  shouldFilterYear = false;
  showLoading: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private namedEntityService: NamedEntityService
  ) {}

  ngOnInit() {
    if (this.activeFilters?.filterYearMin) {
      this.filterYearMin = Number(this.activeFilters.filterYearMin);
    }
    if (this.activeFilters?.filterYearMax) {
      this.filterYearMax = Number(this.activeFilters.filterYearMax);
    }

    if (this.searchType === 'persons') {
      this.getFilterPersonTypes();
      this.shouldFilterYear = true;
    } else if (this.searchType === 'places') {
      this.getFilterPlaceCountries();
    } else if (this.searchType === 'keywords') {
      this.getFilterCategoryTypes();
    }
  }

  getFilterPersonTypes() {
    this.showLoading = true;
    this.namedEntityService.getFilterOptionsFromElastic(this.searchType).subscribe(
      (filterPersonTypes) => {
        this.filterPersonTypes = filterPersonTypes['aggregations']['types']['buckets'];
        this.filterPersonTypes?.forEach(cat => {
          cat.name = cat.key;
          if (this.activeFilters['filterPersonTypes'] && this.activeFilters['filterPersonTypes'].length > 0) {
            for (let i = 0; i < this.activeFilters['filterPersonTypes'].length; i++) {
              if (cat.name === this.activeFilters['filterPersonTypes'][i].name) {
                cat.selected = true;
                break;
              } else {
                cat.selected = false;
              }
            }
          } else {
            cat.selected = false;
          }
        });
        this.showLoading = false;
      }
    );
  }

  getFilterCategoryTypes() {
    this.showLoading = true;
    this.namedEntityService.getFilterOptionsFromElastic(this.searchType).subscribe(
      (filterCategoryTypes) => {
        this.filterCategoryTypes = filterCategoryTypes['aggregations']['types']['buckets'];
        this.filterCategoryTypes?.forEach(cat => {
          cat.name = cat.key;
          if (this.activeFilters['filterCategoryTypes'] && this.activeFilters['filterCategoryTypes'].length > 0) {
            for (let i = 0; i < this.activeFilters['filterCategoryTypes'].length; i++) {
              if (cat.name === this.activeFilters['filterCategoryTypes'][i].name) {
                cat.selected = true;
                break;
              } else {
                cat.selected = false;
              }
            }
          } else {
            cat.selected = false;
          }
        });
        this.showLoading = false;
      }
    );
  }

  getFilterPlaceCountries() {
    this.showLoading = true;
    this.namedEntityService.getFilterOptionsFromElastic(this.searchType).subscribe(
      (filterPlaceCountries) => {
        this.filterPlaceCountries = filterPlaceCountries['aggregations']['countries']['buckets'];
        this.filterPlaceCountries?.forEach(cat => {
          cat.name = cat.key;
          if (this.activeFilters['filterPlaceCountries'] && this.activeFilters['filterPlaceCountries'].length > 0) {
            for (let i = 0; i < this.activeFilters['filterPlaceCountries'].length; i++) {
              if (cat.name === this.activeFilters['filterPlaceCountries'][i].name) {
                cat.selected = true;
                break;
              } else {
                cat.selected = false;
              }
            }
          } else {
            cat.selected = false;
          }
        });
        this.showLoading = false;
      }
    );
  }

  apply() {
    const filters: any = {};
    const filterCollections = [];
    const filterPersonTypes = [];
    const filterCategoryTypes = [];
    const filterPlaceCountries = [];

    if (this.filterYearMin) {
      filters['filterYearMin'] = this.filterYearMin;
    }
    if (this.filterYearMax) {
      filters['filterYearMax'] = this.filterYearMax;
    }

    if (this.filterCollections) {
      for (const filter of this.filterCollections) {
        if (filter.selected) {
          filterCollections.push(filter);
        }
      }
      filters['filterCollections'] = filterCollections;
    }

    if (this.filterPersonTypes) {
      for (const filter of this.filterPersonTypes) {
        if (filter.selected) {
          filterPersonTypes.push(filter);
        }
      }
      filters['filterPersonTypes'] = filterPersonTypes;
    }

    if (this.filterCategoryTypes) {
      for (const filter of this.filterCategoryTypes) {
        if (filter.selected) {
          filterCategoryTypes.push(filter);
        }
      }
      filters['filterCategoryTypes'] = filterCategoryTypes;
    }

    if (this.filterPlaceCountries) {
      for (const filter of this.filterPlaceCountries) {
        if (filter.selected) {
          filterPlaceCountries.push(filter);
        }
      }
      filters['filterPlaceCountries'] = filterPlaceCountries;
    }

    this.checkIfFiltersEmpty(filters);
    filters['isEmpty'] = this.isEmpty;

    return this.modalCtrl.dismiss(filters, 'apply');
  }

  checkIfFiltersEmpty(filters: any) {
    if (this.searchType === 'persons') {
      const d = new Date();
      if (!filters['filterYearMin'] && filters['filterYearMax']) {
        filters['filterYearMin'] = 1;
      }
      if (
        (filters['filterYearMin'] && !filters['filterYearMax']) ||
        (Number(filters['filterYearMax']) > d.getFullYear())
      ) {
        filters['filterYearMax'] = d.getFullYear();
      }
      if (
        !filters['filterYearMin'] &&
        !filters['filterYearMax'] &&
        filters['filterPersonTypes'].length < 1
      ) {
        this.isEmpty = true;
      }
    }

    if (this.searchType === 'places' && filters['filterPlaceCountries'].length < 1) {
      this.isEmpty = true;
    }

    if (this.searchType === 'keywords' && filters['filterCategoryTypes'].length < 1) {
      this.isEmpty = true;
    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'close');
  }

}
