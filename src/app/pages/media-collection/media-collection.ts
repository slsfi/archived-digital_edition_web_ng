import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, SecurityContext } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';
import { catchError, combineLatest, map, Observable, of, Subscription } from 'rxjs';
import { marked } from 'marked';

import { GalleryItem } from 'src/app/models/gallery-item-model';
import { CommonFunctionsService } from 'src/app/services/common-functions.service';
import { FullscreenImageViewerModal } from 'src/app/modals/fullscreen-image-viewer/fullscreen-image-viewer.modal';
import { ReferenceDataModal } from 'src/app/modals/reference-data/reference-data.modal';
import { MediaCollectionService } from 'src/app/services/media-collection.service';
import { MdContentService } from 'src/app/services/md-content.service';
import { config } from 'src/assets/config/config';


@Component({
  selector: 'page-media-collection',
  templateUrl: 'media-collection.html',
  styleUrls: ['media-collection.scss']
})
export class MediaCollectionPage implements OnDestroy, OnInit {
  allMediaCollections: GalleryItem[] = [];
  allMediaConnections: any = {};
  apiEndPoint: string = '';
  filterOptionsKeywords: any[] = [];
  filterOptionsPersons: any[] = [];
  filterOptionsPlaces: any[] = [];
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
  selectedKeywordFilter: number[] = [];
  selectedPersonFilter: number[] = [];
  selectedPlaceFilter: number[] = [];
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
        this.commonFunctions.isEmptyObject(routeParams) &&
        (this.mediaCollectionID !== '' || this.namedEntityID)
      ) {
        // Load all media collections
        this.mediaCollectionID = '';
        this.namedEntityID = '';
        this.mediaCollectionTitle = $localize`:@@TOC.MediaCollections:Bildbank`;
        this.mdContent$ = this.getMdContent(this.activeLocale + '-11-all');
        if (this.allMediaCollections.length < 1) {
          this.getMediaCollections();
        } else {
          this.galleryData = this.allMediaCollections;
        }
        this.initFilterOptions();
      } else {
        // Load single media collection or specific images related to a named entity
        if (routeParams.mediaCollectionID && routeParams.mediaCollectionID !== this.mediaCollectionID) {
          this.mediaCollectionID = routeParams.mediaCollectionID;
          this.namedEntityID = '';
          this.getSingleMediaCollection(routeParams.mediaCollectionID);
          this.initFilterOptions();
        } else if (
          routeParams.entityID &&
          routeParams.entityType &&
          routeParams.entityID !== this.namedEntityID &&
          routeParams.entityType !== this.namedEntityType
        ) {
          this.mediaCollectionID = '';
          this.namedEntityID = routeParams.entityID;
          this.namedEntityType = routeParams.entityType;
          this.getNamedEntityGallery(this.namedEntityID, this.namedEntityType);
        }
      }
    });
  }

  ngOnDestroy() {
    this.urlParametersSubscription?.unsubscribe();
  }

  private getMediaCollections() {
    this.galleryData = [];

    this.mediaCollectionService.getMediaCollections(this.activeLocale).subscribe(
      (collections: any[]) => {
        this.allMediaCollections = this.processGalleriesData(collections);
        this.galleryData = this.allMediaCollections;
      }
    );
  }

  private getSingleMediaCollection(mediaCollectionID: string) {
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
          this.allMediaCollections = this.processGalleriesData(collections);
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

    // Get selected media collection data
    this.mediaCollectionService.getSingleMediaCollection(mediaCollectionID, this.activeLocale).subscribe(
      (galleryItems: any[]) => {
        this.galleryData = this.processGalleriesData(galleryItems, true);
        this.setGalleryZoomedImageData();
      }
    );
  }

  private processGalleriesData(galleryItems: any[], singleGallery = false): GalleryItem[] {
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

  private getNamedEntityGallery(objectID: string, objectType: string) {
    this.mediaCollectionService.getNamedEntityOccInMediaColls(objectType, objectID).subscribe(
      (occurrences: any) => {
        this.galleryData = this.processGalleriesData(occurrences, true);

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

  private initFilterOptions() {
    this.getFilterOptions('keyword');
    this.getFilterOptions('person');
    this.getFilterOptions('place');
  }

  private getFilterOptions(type: string) {
    this.mediaCollectionService.getAllNamedEntityOccInMediaCollsByType(type, this.mediaCollectionID).subscribe(
      (entities: any[]) => {
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
    );
  }

  onFilterChanged(type: string, event: any) {
    if (type === 'person') {
      this.selectedPersonFilter = event?.detail?.value ?? [];
    } else if (type === 'place') {
      this.selectedPlaceFilter = event?.detail?.value ?? [];
    } else if (type === 'keyword') {
      this.selectedKeywordFilter = event?.detail?.value ?? [];
    }

    this.filterGallery();

    if (this.mediaCollectionID) {
      this.setGalleryZoomedImageData();
    }
  }

  private filterGallery() {
    let filterResultCount = 0;
    const connKey = this.mediaCollectionID ? 'filenames' : 'mediaCollectionIDs';
    const itemKey = this.mediaCollectionID ? 'filename' : 'collectionID';

    if (
      this.selectedPersonFilter.length ||
      this.selectedPlaceFilter.length ||
      this.selectedKeywordFilter.length
    ) {
      // Apply filters
      this.galleryData.forEach((item: GalleryItem) => {
        let personOk = false;
        let placeOk = false;
        let keywordOk = false;

        if (this.selectedPersonFilter.length) {
          for (let f = 0; f < this.selectedPersonFilter.length; f++) {
            if (this.allMediaConnections['person']?.[this.selectedPersonFilter[f]]?.[connKey]?.includes(item[itemKey])) {
              personOk = true;
              break;
            } else {
              personOk = false;
            }
          }
        } else {
          personOk = true;
        }

        if (this.selectedPlaceFilter.length) {
          for (let f = 0; f < this.selectedPlaceFilter.length; f++) {
            if (this.allMediaConnections['place']?.[this.selectedPlaceFilter[f]]?.[connKey]?.includes(item[itemKey])) {
              placeOk = true;
              break;
            } else {
              placeOk = false;
            }
          }
        } else {
          placeOk = true;
        }

        if (this.selectedKeywordFilter.length) {
          for (let f = 0; f < this.selectedKeywordFilter.length; f++) {
            if (this.allMediaConnections['keyword']?.[this.selectedKeywordFilter[f]]?.[connKey]?.includes(item[itemKey])) {
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
  }

  clearFilters() {
    this.selectedKeywordFilter = [];
    this.selectedPersonFilter = [];
    this.selectedPlaceFilter = [];

    this.filterGallery();
    this.setGalleryZoomedImageData();
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

}
