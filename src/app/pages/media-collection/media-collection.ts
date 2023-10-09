import { ChangeDetectorRef, Component, Inject, LOCALE_ID, OnDestroy, OnInit, SecurityContext } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';
import { catchError, combineLatest, map, Observable, of, Subscription } from 'rxjs';
import { marked } from 'marked';

import { GalleryItem } from 'src/app/models/gallery-item-model';
import { CommonFunctionsService } from 'src/app/services/common-functions.service';
import { FullscreenImageViewerModal } from 'src/app/modals/fullscreen-image-viewer/fullscreen-image-viewer.modal';
import { ReferenceDataModal } from 'src/app/modals/reference-data/reference-data.modal';
import { GalleryService } from 'src/app/services/gallery.service';
import { MdContentService } from 'src/app/services/md-content.service';
import { config } from 'src/assets/config/config';


@Component({
  selector: 'page-media-collection',
  templateUrl: 'media-collection.html',
  styleUrls: ['media-collection.scss']
})
export class MediaCollectionPage implements OnDestroy, OnInit {
  allGalleries: GalleryItem[] = [];
  allGalleryConnections: any = {};
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
  mediaCollectionID: string = '';
  mediaDescription: string = '';
  mediaTitle: string = '';
  namedEntityID: string = '';
  namedEntityType: string = '';
  projectMachineName: string = '';
  selectedKeywordFilter: any = null;
  selectedPersonFilter: any = null;
  selectedPlaceFilter: any = null;
  showURNButton: boolean = false;
  urlParametersSubscription: Subscription | null = null;
  zoomLoading: boolean = false;


  mediaCollection: any[] = [];
  allTags = [];
  allLocations = [];
  allSubjects = [];
  allMediaCollection: any[] = [];
  galleryTags = [] as any;
  galleryLocations = [] as any;
  gallerySubjects = [] as any;
  locationModel = '';
  tagModel = '';
  subjectModel = '';
  prevTag = '';
  prevLoc = '';
  prevSub = '';

  constructor(
    private cdRef: ChangeDetectorRef,
    private commonFunctions: CommonFunctionsService,
    private sanitizer: DomSanitizer,
    private galleryService: GalleryService,
    private modalController: ModalController,
    private mdContentService: MdContentService,
    private route: ActivatedRoute,
    @Inject(LOCALE_ID) private activeLocale: string
  ) {
    this.apiEndPoint = config.app?.apiEndpoint ?? '';
    this.projectMachineName = config.app?.machineName ?? '';
    this.showURNButton = config.page?.mediaCollection?.showURNButton ?? false;

    this.filterSelectOptions = {
      person: {
        header: $localize`:@@MediaCollections.filterPerson:Filtrera enligt person`,
        cssClass: 'custom-select-alert'
      },
      place: {
        header: $localize`:@@MediaCollections.filterPlace:Filtrera enligt plats`,
        cssClass: 'custom-select-alert'
      },
      keyword: {
        header: $localize`:@@MediaCollections.filterKeyword:Filtrera enligt ämnesord`,
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
      if (this.commonFunctions.isEmptyObject(routeParams)) {
        // Load all galleries
        this.mediaCollectionID = '';
        this.namedEntityID = '';
        this.mediaTitle = $localize`:@@TOC.MediaCollections:Bildbank`;
        this.mdContent$ = this.getMdContent(this.activeLocale + '-11-all');
        if (this.allGalleries.length < 1) {
          this.getGalleries();
        } else {
          this.galleryData = this.allGalleries;
        }
      } else {
        // Load specific gallery or specific images based on a semantic data object
        if (routeParams.mediaCollectionID) {
          this.mediaCollectionID = routeParams.mediaCollectionID;
          this.namedEntityID = '';
          this.getSingleGallery(this.mediaCollectionID);
          this.initFilterOptions();
        } else if (routeParams.entityID && routeParams.entityType) {
          this.mediaCollectionID = '';
          this.namedEntityID = routeParams.entityID;
          this.namedEntityType = routeParams.entityType;
          this.getSemanticDataObjectGallery(this.namedEntityID, this.namedEntityType);
        }
      }
    });
  }

  ngOnDestroy() {
    this.urlParametersSubscription?.unsubscribe();
  }

  private getGalleries() {
    this.galleryService.getGalleries(this.activeLocale).subscribe(
      (galleries: any[]) => {
        this.allGalleries = this.processGalleriesData(galleries);
        this.galleryData = this.allGalleries;
      }
    );
  }

  private getSingleGallery(galleryID: string) {
    // Get galleries if not yet loaded, set gallery title and description
    if (this.allGalleries.length < 1) {
      this.galleryService.getGalleries(this.activeLocale).subscribe(
        (galleries: any[]) => {
          for (let i = 0; i < galleries.length; i++) {
            if (galleries[i].id === Number(galleryID)) {
              this.mediaTitle = galleries[i].title || '';
              this.mediaDescription = galleries[i].description || '';
              break;
            }
          }
          this.allGalleries = this.processGalleriesData(galleries);
        }
      );
    } else {
      for (let i = 0; i < this.allGalleries.length; i++) {
        if (this.allGalleries[i].id === Number(galleryID)) {
          this.mediaTitle = this.allGalleries[i].title || '';
          this.mediaDescription = this.allGalleries[i].description || '';
          break;
        }
      }
    }

    // Get selected gallery data
    this.galleryService.getGallery(galleryID, this.activeLocale).subscribe(
      (galleryItems: any[]) => {
        this.mdContent$ = this.getMdContent(this.activeLocale + '-11-' + galleryID);
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
        const urlStart = `${this.apiEndPoint}/${this.projectMachineName}/gallery/get/${galleryItem.collectionID}/`;

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
          galleryItem.imageAltText = $localize`:@@MediaCollections.altText:Galleribild`;
        }

        galleryItemsList.push(galleryItem);
      });

      !singleGallery && this.commonFunctions.sortArrayOfObjectsAlphabetically(galleryItemsList, 'title');
      this.commonFunctions.sortArrayOfObjectsNumerically(galleryItemsList, 'sortOrder');
    }
    return galleryItemsList;
  }

  private getSemanticDataObjectGallery(objectID: string, objectType: string) {
    this.galleryService.getNamedEntityGalleryOccurrences(objectType, objectID).subscribe(
      (occurrences: any) => {
        this.galleryData = this.processGalleriesData(occurrences, true);

        if (objectType === 'subject') {
          this.mediaTitle = occurrences[0]['full_name'];
          this.mediaDescription = '';
        } else {
          this.mediaTitle = occurrences[0]['name'];
          this.mediaDescription = '';
        }

        this.setGalleryZoomedImageData();
      }
    );
  }

  /*
  getMediaCollections(id?: any, type?: any) {
    if ( id === undefined && this.mediaCollectionID ) {
      this.galleryService.getGallery(this.mediaCollectionID, this.activeLocale).subscribe(gallery => {
        this.mediaCollection = gallery.gallery ? gallery.gallery : gallery;
        this.allMediaCollection = this.mediaCollection;
        this.mediaTitle = gallery[0].title ? gallery[0].title : this.mediaTitle;
        this.mediaDescription = gallery.description ? gallery.description : '';
        if (this.tagModel !== undefined && this.tagModel !== '') {
          this.prevTag = this.tagModel;
          if (this.allTags.length > 0) {
            this.filterCollectionsByTag(this.tagModel);
          } else {
            this.getCollectionTags(this.tagModel);
          }
        }
        if (this.locationModel !== undefined && this.locationModel !== '') {
          this.prevLoc = this.locationModel;
          if (this.allLocations.length > 0) {
            this.filterCollectionsByLocation(this.locationModel);
          } else {
            this.getCollectionLocations(this.locationModel);
          }
        }
        if (this.subjectModel !== undefined && this.subjectModel !== '') {
          this.prevSub = this.subjectModel;
          if (this.allSubjects.length > 0) {
            this.filterCollectionsBySubject(this.subjectModel);
          } else {
            this.getCollectionSubjects(this.subjectModel);
          }
        }
      });
    } else {
      this.galleryService.getNamedEntityGalleryOccurrences(type, id).subscribe((occurrences: any) => {
        occurrences.forEach((element: any) => {
          element['mediaCollectionId'] = element['media_collection_id'];
          element['front'] = element['filename'];
          this.mediaCollection.push(element)
        });

        if ( type === 'subject' ) {
          this.mediaTitle = occurrences[0]['full_name'];
          this.mediaDescription = '';
        } else {
          this.mediaTitle = occurrences[0]['name'];
          this.mediaDescription = '';
        }
      });
    }
  }
  */

  private setGalleryZoomedImageData() {
    this.galleryImageURLs = this.galleryData.map((i: GalleryItem) => i.imageURL);
    this.galleryBacksideImageURLs = this.galleryData.map((i: GalleryItem) => i.imageURLBack);
    this.galleryDescriptions = this.galleryData.map((i: GalleryItem) => i.description);
    this.galleryTitles = this.galleryData.map((i: GalleryItem) => i.title);
  }

  getCollectionSubjects(filter?: any) {
    (async () => {
      let subjects = [];
      subjects = await this.galleryService.getGallerySubjects(this.mediaCollectionID);
      this.allSubjects = subjects;
      const addedSubjects: Array<any> = [];
      subjects.forEach((element: any) => {
        if (addedSubjects.indexOf(element['id']) === -1) {
          this.gallerySubjects.push({
            'name': String(element['name']),
            id: element['id'],
            'media_collection_id': element['media_collection_id']
          });
          addedSubjects.push(element['id']);
        }
      });
      this.gallerySubjects.sort(function(a: any, b: any) {
        const nameA = a.name.toLowerCase(); // ignore upper and lowercase
        const nameB = b.name.toLowerCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
      if (filter) {
        this.filterCollectionsBySubject(filter);
      }
    }).bind(this)();
  }

  private initFilterOptions() {
    this.getFilterOptions('keyword');
    this.getFilterOptions('person');
    this.getFilterOptions('place');
  }

  private getFilterOptions(type: string, filter?: any) {
    this.galleryService.getGalleryNamedEntityConnections(type, this.mediaCollectionID).subscribe(
      (entities: any[]) => {
        console.log(entities);
        const filterOptions: any[] = [];
        const addedIDs: number[] = [];

        this.allGalleryConnections[type] = {};
        
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
          if (!this.allGalleryConnections[type][entity.id]) {
            this.allGalleryConnections[type][entity.id] = {
              filenames: [],
              galleryIDs: []
            };
          }
          if (!this.allGalleryConnections[type][entity.id]['filenames'].includes(entity.filename)) {
            this.allGalleryConnections[type][entity.id]['filenames'].push(entity.filename);
          }
          if (!this.allGalleryConnections[type][entity.id]['galleryIDs'].includes(entity.media_collection_id)) {
            this.allGalleryConnections[type][entity.id]['galleryIDs'].push(entity.media_collection_id);
          }
        });
        
        this.commonFunctions.sortArrayOfObjectsAlphabetically(filterOptions, 'name');
        // console.log(filterOptions);
        if (type === 'person') {
          this.filterOptionsPersons = filterOptions;
          // console.log(filterOptions);
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
      this.selectedPersonFilter = event?.detail?.value ?? null;
    } else if (type === 'place') {
      this.selectedPlaceFilter = event?.detail?.value ?? null;
    } else if (type === 'keyword') {
      this.selectedKeywordFilter = event?.detail?.value ?? null;
    }
    this.filterGallery();
  }

  private filterGallery() {
    let filterResultCount = 0;

    if (
      this.selectedPersonFilter?.id ||
      this.selectedPlaceFilter?.id ||
      this.selectedKeywordFilter?.id
    ) {
      // Apply filters
      this.galleryData.forEach((item: GalleryItem) => {
        let personFilterApplies = false;
        let placeFilterApplies = false;
        let keywordFilterApplies = false;

        if (this.selectedPersonFilter?.id) {
          if (this.allGalleryConnections['person']?.[this.selectedPersonFilter.id]?.['filenames']?.includes(item.filename)) {
            personFilterApplies = true;
          } else {
            personFilterApplies = false;
          }
        } else {
          personFilterApplies = true;
        }

        if (this.selectedPlaceFilter?.id) {
          if (this.allGalleryConnections['place']?.[this.selectedPlaceFilter.id]?.['filenames']?.includes(item.filename)) {
            placeFilterApplies = true;
          } else {
            placeFilterApplies = false;
          }
        } else {
          placeFilterApplies = true;
        }

        if (this.selectedKeywordFilter?.id) {
          if (this.allGalleryConnections['keyword']?.[this.selectedKeywordFilter.id]?.['filenames']?.includes(item.filename)) {
            keywordFilterApplies = true;
          } else {
            keywordFilterApplies = false;
          }
        } else {
          keywordFilterApplies = true;
        }
        
        item.visible = personFilterApplies && placeFilterApplies && keywordFilterApplies;
        if (item.visible) {
          filterResultCount++;
        }
      });
    } else {
      // Clear all filters
      this.galleryData.forEach((item: GalleryItem) => {
        item.visible = true;
      });
      filterResultCount = -1;
    }

    this.filterResultCount = filterResultCount;

  }

  filterCollectionsByTag(name: any) {
    if (name === '') {
      this.mediaCollection = this.allMediaCollection;
      if (this.locationModel !== undefined && this.locationModel !== '') {
        this.filterCollectionsByLocation(this.locationModel);
      }
      if (this.subjectModel !== undefined && this.subjectModel !== '') {
        this.filterCollectionsBySubject(this.subjectModel);
      }
      return true;
    }
    if (name !== this.prevTag) {
      this.mediaCollection = this.allMediaCollection;
      this.prevTag = name;
      if (this.locationModel !== undefined && this.locationModel !== '') {
        this.filterCollectionsByLocation(this.locationModel);
      }
      if (this.subjectModel !== undefined && this.subjectModel !== '') {
        this.filterCollectionsBySubject(this.subjectModel);
      }
    }
    const filenames: Array<any> = [];
    const filteredGalleries = [] as any;
    this.allTags.forEach(element => {
      if (String(element['name']).toLowerCase() === String(name).toLowerCase()) {
        filenames.push(element['filename']);
      }
    });
    this.mediaCollection.forEach((element: any) => {
      if (filenames.indexOf(element['front']) !== -1) {
        filteredGalleries.push(element);
      }
    });
    this.mediaCollection = filteredGalleries;

    return;
  }

  filterCollectionsByLocation(name: any) {
    if (name === '') {
      this.mediaCollection = this.allMediaCollection;
      if (this.tagModel !== undefined && this.tagModel !== '') {
        this.filterCollectionsByTag(this.tagModel);
      }
      if (this.subjectModel !== undefined && this.subjectModel !== '') {
        this.filterCollectionsBySubject(this.subjectModel);
      }
      return true;
    }
    if (name !== this.prevLoc) {
      this.mediaCollection = this.allMediaCollection;
      this.prevLoc = name;
      if (this.tagModel !== undefined && this.tagModel !== '') {
        this.filterCollectionsByTag(this.tagModel);
      }
      if (this.subjectModel !== undefined && this.subjectModel !== '') {
        this.filterCollectionsBySubject(this.subjectModel);
      }
    }
    const filenames: Array<any> = [];
    const filteredGalleries = [] as any;
    this.allLocations.forEach(element => {
      if (String(element['name']).toLowerCase() === String(name).toLowerCase()) {
        filenames.push(element['filename']);
      }
    });
    this.mediaCollection.forEach((element: any) => {
      if (filenames.indexOf(element['front']) !== -1) {
        filteredGalleries.push(element);
      }
    });
    this.mediaCollection = filteredGalleries;

    return;
  }

  filterCollectionsBySubject(name: any) {
    if (name === '') {
      this.mediaCollection = this.allMediaCollection;
      if ( this.tagModel !== undefined && this.tagModel !== '') {
        this.filterCollectionsByTag(this.tagModel);
      }
      if (this.locationModel !== undefined && this.locationModel !== '') {
        this.filterCollectionsByLocation(this.locationModel);
      }
      return true;
    }
    if (name !== this.prevSub) {
      this.mediaCollection = this.allMediaCollection;
      this.prevSub = name;
      if ( this.tagModel !== undefined && this.tagModel !== '') {
        this.filterCollectionsByTag(this.tagModel);
      }
      if ( this.locationModel !== undefined && this.locationModel !== '') {
        this.filterCollectionsByLocation(this.locationModel);
      }
    }
    const filenames: Array<any> = [];
    const filteredGalleries = [] as any;
    this.allSubjects.forEach(element => {
      if (String(element['name']).toLowerCase() === String(name).toLowerCase() || name === '') {
        filenames.push(element['filename']);
      }
    });
    this.mediaCollection.forEach((element: any) => {
      if (filenames.indexOf(element['front']) !== -1) {
        filteredGalleries.push(element);
      }
    });
    this.mediaCollection = filteredGalleries;

    return;
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

  async openImage(index: number) {
    this.zoomLoading = true;

    //TODO: if active filters, params need to be recreated

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

  compareFilterOptionsWith(o1: any, o2: any) {
    if (!o1 || !o2) {
      return o1 === o2;
    }

    if (Array.isArray(o2)) {
      return o2.some((o) => o.id === o1.id);
    }

    return o1.id === o2.id;
  }

}
