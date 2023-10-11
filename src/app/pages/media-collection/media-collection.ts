import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, SecurityContext } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';
import { catchError, combineLatest, forkJoin, map, Observable, of, Subscription } from 'rxjs';
import { marked } from 'marked';

import { GalleryItem } from 'src/app/models/gallery-item-model';
import { CommonFunctionsService } from 'src/app/services/common-functions.service';
import { FullscreenImageViewerModal } from 'src/app/modals/fullscreen-image-viewer/fullscreen-image-viewer.modal';
import { ReferenceDataModal } from 'src/app/modals/reference-data/reference-data.modal';
import { MediaCollectionService } from 'src/app/services/media-collection.service';
import { MdContentService } from 'src/app/services/md-content.service';
import { config } from 'src/assets/config/config';
import { UrlService } from 'src/app/services/url.service';


@Component({
  selector: 'page-media-collection',
  templateUrl: 'media-collection.html',
  styleUrls: ['media-collection.scss']
})
export class MediaCollectionPage implements OnDestroy, OnInit {
  activeKeywordFilters: number[] = [];
  activePersonFilters: number[] = [];
  activePlaceFilters: number[] = [];
  allMediaCollections: GalleryItem[] = [];
  allMediaConnections: any = {};
  apiEndPoint: string = '';
  filterOptionsKeywords: any[] = [];
  filterOptionsPersons: any[] = [];
  filterOptionsPlaces: any[] = [];
  filterOptionsSubscription: Subscription | null = null;
  filterResultCount: number = -1;
  filterSelectOptions: Record<string, any> = {};
  galleryBacksideImageURLs: (string | undefined)[] = [];
  galleryData: GalleryItem[] = [];
  galleryDescriptions: (string | undefined)[] = [];
  galleryImageURLs: (string | undefined)[] = [];
  galleryTitles: (string | undefined)[] = [];
  mdContent$: Observable<SafeHtml | null>;
  mediaCollectionID: string | undefined = undefined;
  mediaCollectionDescription: string = '';
  mediaCollectionTitle: string = '';
  namedEntityID: string = '';
  namedEntityType: string = '';
  projectName: string = '';
  showURNButton: boolean = false;
  urlParametersSubscription: Subscription | null = null;
  zoomLoading: boolean = false;

  constructor(
    private commonFunctions: CommonFunctionsService,
    private sanitizer: DomSanitizer,
    private mediaCollectionService: MediaCollectionService,
    private modalController: ModalController,
    private mdContentService: MdContentService,
    private route: ActivatedRoute,
    private router: Router,
    private urlService: UrlService,
    @Inject(LOCALE_ID) private activeLocale: string
  ) {
    this.apiEndPoint = config.app?.apiEndpoint ?? '';
    this.projectName = config.app?.machineName ?? '';
    this.showURNButton = config.page?.mediaCollection?.showURNButton ?? false;

    this.filterSelectOptions = {
      person: {
        header: $localize`:@@MediaCollection.FilterPerson:Avgränsa enligt person`,
        cssClass: 'custom-select-alert'
      },
      place: {
        header: $localize`:@@MediaCollection.FilterPlace:Avgränsa enligt plats`,
        cssClass: 'custom-select-alert'
      },
      keyword: {
        header: $localize`:@@MediaCollection.FilterKeyword:Avgränsa enligt ämnesord`,
        cssClass: 'custom-select-alert'
      }
    };
  }

  ngOnInit() {
    this.urlParametersSubscription = combineLatest(
      [this.route.params, this.route.queryParams]
    ).pipe(
      map(([params, queryParams]) => ({...params, ...queryParams}))
    ).subscribe(routeParams => {
      if (
        (this.commonFunctions.isEmptyObject(routeParams) &&
          (this.mediaCollectionID !== '' || this.namedEntityID)) ||
        (!routeParams.mediaCollectionID && routeParams.filters) ||
        (!routeParams.mediaCollectionID && (
          this.activePersonFilters.length ||
          this.activePlaceFilters.length ||
          this.activeKeywordFilters.length
        ))
      ) {
        // Load all media collections
        const getFilters = (this.mediaCollectionID !== '' || this.namedEntityID) ? true : false;
        this.mediaCollectionID = '';
        this.namedEntityID = '';
        this.mediaCollectionTitle = $localize`:@@TOC.MediaCollections:Bildbank`;
        this.mdContent$ = this.getMdContent(this.activeLocale + '-11-all');

        if (routeParams.filters) {
          this.setActiveFiltersFromQueryParams(routeParams.filters);
        } else {
          this.activePersonFilters = [];
          this.activePlaceFilters = [];
          this.activeKeywordFilters = [];
        }

        if (this.allMediaCollections.length < 1) {
          this.loadMediaCollections();
        } else {
          this.galleryData = this.allMediaCollections;
          if (getFilters) {
            this.setFilterOptionsAndApplyActiveFilters();
          } else {
            this.applyActiveFilters();
          }
        }
      } else {
        if (
          routeParams.mediaCollectionID &&
          (
            routeParams.mediaCollectionID !== this.mediaCollectionID ||
            routeParams.filters ||
            (
              this.activePersonFilters.length ||
              this.activePlaceFilters.length ||
              this.activeKeywordFilters.length
            )
          )
        ) {
          // Load single media collection

          // Set active filters
          if (routeParams.filters) {
            this.setActiveFiltersFromQueryParams(routeParams.filters);
          } else {
            this.activePersonFilters = [];
            this.activePlaceFilters = [];
            this.activeKeywordFilters = [];
          }

          if (routeParams.mediaCollectionID !== this.mediaCollectionID) {
            this.mediaCollectionID = routeParams.mediaCollectionID;
            this.loadSingleMediaCollection(routeParams.mediaCollectionID);
          } else {
            this.applyActiveFilters();
          }
          this.namedEntityID = '';
        } else if (
          // Load specific images related to a named entity
          routeParams.entityID &&
          routeParams.entityType &&
          routeParams.entityID !== this.namedEntityID &&
          routeParams.entityType !== this.namedEntityType
        ) {
          this.mediaCollectionID = '';
          this.namedEntityID = routeParams.entityID;
          this.namedEntityType = routeParams.entityType;
          this.loadNamedEntityGallery(this.namedEntityID, this.namedEntityType);
        }
      }
    });
  }

  ngOnDestroy() {
    this.filterOptionsSubscription?.unsubscribe();
    this.urlParametersSubscription?.unsubscribe();
  }

  private loadMediaCollections() {
    this.galleryData = [];

    this.mediaCollectionService.getMediaCollections(this.activeLocale).subscribe(
      (collections: any[]) => {
        this.allMediaCollections = this.getTransformedGalleryData(collections);
        this.galleryData = this.allMediaCollections;
        this.setFilterOptionsAndApplyActiveFilters();
      }
    );
  }

  private loadSingleMediaCollection(mediaCollectionID: string) {
    this.galleryData = [];

    // Get all media collections if not yet loaded, set current collection title and description
    if (this.allMediaCollections.length < 1) {
      this.mediaCollectionService.getMediaCollections(this.activeLocale).subscribe(
        (collections: any[]) => {
          for (let i = 0; i < collections.length; i++) {
            if (collections[i].id === Number(mediaCollectionID)) {
              this.mediaCollectionTitle = collections[i].title || '';
              this.mediaCollectionDescription = collections[i].description || '';
              break;
            }
          }
          this.allMediaCollections = this.getTransformedGalleryData(collections);
        }
      );
    } else {
      for (let i = 0; i < this.allMediaCollections.length; i++) {
        if (this.allMediaCollections[i].collectionID === Number(mediaCollectionID)) {
          this.mediaCollectionTitle = this.allMediaCollections[i].title || '';
          this.mediaCollectionDescription = this.allMediaCollections[i].description || '';
          break;
        }
      }
    }

    this.mdContent$ = this.getMdContent(this.activeLocale + '-11-' + mediaCollectionID);

    // Get selected media collection data, then filter options and apply any active filters
    this.mediaCollectionService.getSingleMediaCollection(mediaCollectionID, this.activeLocale).subscribe(
      (galleryItems: any[]) => {
        this.galleryData = this.getTransformedGalleryData(galleryItems, true);
        this.setFilterOptionsAndApplyActiveFilters();
      }
    );
  }

  private getTransformedGalleryData(galleryItems: any[], singleGallery = false): GalleryItem[] {
    const galleryItemsList: GalleryItem[] = [];
    if (galleryItems?.length) {
      galleryItems.forEach((gallery: any) => {
        const galleryItem = new GalleryItem(gallery);
        const urlStart = `${this.apiEndPoint}/${this.projectName}/gallery/get/${galleryItem.collectionID}/`;

        if (singleGallery) {
          const lastIndex = galleryItem.imageURL?.lastIndexOf('.') ?? -1;
          if (lastIndex > -1) {
            galleryItem.imageURLThumb = galleryItem.imageURL.substring(0, lastIndex) + '_thumb' + galleryItem.imageURL.substring(lastIndex);
          }
          galleryItem.imageURL = urlStart + `${galleryItem.imageURL}`;
          galleryItem.imageURLThumb = urlStart + `${galleryItem.imageURLThumb}`;
          galleryItem.imageURLBack = galleryItem.imageURLBack ? urlStart + `${galleryItem.imageURLBack}` : undefined;
        } else {
          galleryItem.imageURL = urlStart + `gallery_thumb.jpg`;
          galleryItem.imageURLThumb = galleryItem.imageURL;
        }

        if (!galleryItem.imageAltText) {
          galleryItem.imageAltText = $localize`:@@MediaCollection.GenericAltText:Galleribild`;
        }

        galleryItemsList.push(galleryItem);
      });

      !singleGallery && this.commonFunctions.sortArrayOfObjectsAlphabetically(galleryItemsList, 'title');
      this.commonFunctions.sortArrayOfObjectsNumerically(galleryItemsList, 'sortOrder');
    }
    return galleryItemsList;
  }

  private loadNamedEntityGallery(objectID: string, objectType: string) {
    this.mediaCollectionService.getNamedEntityOccInMediaColls(objectType, objectID).subscribe(
      (occurrences: any) => {
        this.galleryData = this.getTransformedGalleryData(occurrences, true);

        if (objectType === 'subject') {
          this.mediaCollectionTitle = occurrences[0]['full_name'];
          this.mediaCollectionDescription = '';
        } else {
          this.mediaCollectionTitle = occurrences[0]['name'];
          this.mediaCollectionDescription = '';
        }

        this.setGalleryZoomedImageData();
      }
    );
  }

  private setGalleryZoomedImageData() {
    this.galleryImageURLs = [];
    this.galleryBacksideImageURLs = [];
    this.galleryDescriptions = [];
    this.galleryTitles = [];

    this.galleryData.forEach((element: GalleryItem) => {
      if (element.visible) {
        this.galleryImageURLs.push(element.imageURL);
        this.galleryBacksideImageURLs.push(element.imageURLBack);
        this.galleryDescriptions.push(element.description);
        this.galleryTitles.push(element.title);
      }
    });
  }

  private setActiveFiltersFromQueryParams(urlFilters: string) {
    const parsedActiveFilters = this.urlService.parse(urlFilters, true) || [];

    parsedActiveFilters.forEach((filterGroup: any) => {
      if (filterGroup.person?.length) {
        this.activePersonFilters = filterGroup.person;
      }

      if (filterGroup.place?.length) {
        this.activePlaceFilters = filterGroup.place;
      }
      
      if (filterGroup.keyword?.length) {
        this.activeKeywordFilters = filterGroup.keyword;
      }
    });
  }

  /**
   * Sets filter options for media collection and applies any
   * active filters. this.galleryData must be set before
   * calling this function.
   */
  private setFilterOptionsAndApplyActiveFilters() {
    this.filterOptionsSubscription?.unsubscribe();
    this.filterOptionsSubscription = forkJoin(
      [
        this.mediaCollectionService.getAllNamedEntityOccInMediaCollsByType(
          'keyword', this.mediaCollectionID
        ),
        this.mediaCollectionService.getAllNamedEntityOccInMediaCollsByType(
          'person', this.mediaCollectionID
        ),
        this.mediaCollectionService.getAllNamedEntityOccInMediaCollsByType(
          'place', this.mediaCollectionID
        )
      ]
    ).pipe(
      map((res: any[]) => {
        const entityOccs = [
          {
            type: 'keyword',
            data: res[0] || []
          },
          {
            type: 'person',
            data: res[1] || []
          },
          {
            type: 'place',
            data: res[2] || []
          },
        ];
        return entityOccs;
      })
    ).subscribe(
      (filterGroups: any[]) => {
        filterGroups.forEach((group: any) => {
          this.setFilterOptionsByType(group.type, group.data);
        });

        this.applyActiveFilters();
      }
    );
  }

  private setFilterOptionsByType(type: string, entities: any[]) {
    const filterOptions: any[] = [];
    const addedIDs: number[] = [];
    this.allMediaConnections[type] = {};
    
    entities.forEach((entity: any) => {
      if (!addedIDs.includes(entity.id)) {
        filterOptions.push(
          {
            id: entity.id,
            name: entity.name
          }
        );
        addedIDs.push(entity.id);
      }
      if (!this.allMediaConnections[type][entity.id]) {
        this.allMediaConnections[type][entity.id] = {
          filenames: [],
          mediaCollectionIDs: []
        };
      }
      if (!this.allMediaConnections[type][entity.id]['filenames'].includes(entity.filename)) {
        this.allMediaConnections[type][entity.id]['filenames'].push(entity.filename);
      }
      if (!this.allMediaConnections[type][entity.id]['mediaCollectionIDs'].includes(entity.media_collection_id)) {
        this.allMediaConnections[type][entity.id]['mediaCollectionIDs'].push(entity.media_collection_id);
      }
    });
    
    this.commonFunctions.sortArrayOfObjectsAlphabetically(filterOptions, 'name');
    if (type === 'person') {
      this.filterOptionsPersons = filterOptions;
    } else if (type === 'place') {
      this.filterOptionsPlaces = filterOptions;
    } else if (type === 'keyword') {
      this.filterOptionsKeywords = filterOptions;
    }
  }

  onFilterChanged(type: string, event: any) {
    const filters: any[] = [];

    if (type === 'person' && event?.detail?.value?.length) {
      filters.push({ person: event?.detail?.value });
    } else if (type !== 'person' && this.activePersonFilters.length) {
      filters.push({ person: this.activePersonFilters });
    }

    if (type === 'place' && event?.detail?.value?.length) {
      filters.push({ place: event?.detail?.value });
    } else if (type !== 'place' && this.activePlaceFilters.length) {
      filters.push({ place: this.activePlaceFilters });
    }

    if (type === 'keyword' && event?.detail?.value?.length) {
      filters.push({ keyword: event?.detail?.value });
    } else if (type !== 'keyword' && this.activeKeywordFilters.length) {
      filters.push({ keyword: this.activeKeywordFilters });
    }

    this.updateURLQueryParameters(
      {
        filters: filters.length ? this.urlService.stringify(filters, true) : null
      }
    );
  }

  private applyActiveFilters() {
    let filterResultCount = 0;
    const connKey = this.mediaCollectionID ? 'filenames' : 'mediaCollectionIDs';
    const itemKey = this.mediaCollectionID ? 'filename' : 'collectionID';

    if (
      this.activePersonFilters.length ||
      this.activePlaceFilters.length ||
      this.activeKeywordFilters.length
    ) {
      // Apply filters
      this.galleryData.forEach((item: GalleryItem) => {
        let personOk = false;
        let placeOk = false;
        let keywordOk = false;

        if (this.activePersonFilters.length) {
          for (let f = 0; f < this.activePersonFilters.length; f++) {
            if (this.allMediaConnections['person']?.[this.activePersonFilters[f]]?.[connKey]?.includes(item[itemKey])) {
              personOk = true;
              break;
            } else {
              personOk = false;
            }
          }
        } else {
          personOk = true;
        }

        if (this.activePlaceFilters.length) {
          for (let f = 0; f < this.activePlaceFilters.length; f++) {
            if (this.allMediaConnections['place']?.[this.activePlaceFilters[f]]?.[connKey]?.includes(item[itemKey])) {
              placeOk = true;
              break;
            } else {
              placeOk = false;
            }
          }
        } else {
          placeOk = true;
        }

        if (this.activeKeywordFilters.length) {
          for (let f = 0; f < this.activeKeywordFilters.length; f++) {
            if (this.allMediaConnections['keyword']?.[this.activeKeywordFilters[f]]?.[connKey]?.includes(item[itemKey])) {
              keywordOk = true;
              break;
            } else {
              keywordOk = false;
            }
          }
        } else {
          keywordOk = true;
        }
        
        item.visible = personOk && placeOk && keywordOk;
        if (item.visible) {
          filterResultCount++;
        }
      });
    } else {
      // Clear all filters --> show all collection items
      this.galleryData.forEach((item: GalleryItem) => {
        item.visible = true;
      });
      filterResultCount = -1;
    }

    this.filterResultCount = filterResultCount;

    if (this.mediaCollectionID) {
      this.setGalleryZoomedImageData();
    }
  }

  clearActiveFilters() {
    this.updateURLQueryParameters(
      {
        filters: null
      }
    );
  }

  private getMdContent(fileID: string): Observable<SafeHtml | null> {
    return this.mdContentService.getMdContent(fileID).pipe(
      map((res: any) => {
        return this.sanitizer.sanitize(
          SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml(marked(res.content))
        );
      }),
      catchError((e) => {
        return of('');
      })
    );
  }

  async openImage(imageURL: string) {
    this.zoomLoading = true;
    let index = 0;

    for(let i = 0; i < this.galleryImageURLs.length; i++) {
      if (imageURL === this.galleryImageURLs[i]) {
        index = i;
        break;
      }
    }

    const params = {
      activeImageIndex: index,
      backsides: this.galleryBacksideImageURLs,
      imageDescriptions: this.galleryDescriptions,
      imageTitles: this.galleryTitles,
      imageURLs: this.galleryImageURLs
    };

    const modal = await this.modalController.create({
      component: FullscreenImageViewerModal,
      componentProps: params,
      cssClass: 'fullscreen-image-viewer-modal',
    });
    
    modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role) {
      this.zoomLoading = false;
    }
  }

  async showReference() {
    // Get URL of Page and then the URI
    const modal = await this.modalController.create({
      component: ReferenceDataModal,
      componentProps: { origin: 'media-collection' }
    });

    modal.present();
  }

  trackById(index: number | string, item: any) {
    return item.id;
  }

  private updateURLQueryParameters(params: any) {
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

}
