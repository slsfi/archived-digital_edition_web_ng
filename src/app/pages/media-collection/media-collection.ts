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
import { GalleryService } from 'src/app/services/gallery.service';
import { MdContentService } from 'src/app/services/md-content.service';
import { config } from 'src/assets/config/config';


@Component({
  selector: 'page-media-collection',
  templateUrl: 'media-collection.html',
  styleUrls: ['media-collection.scss']
})
export class MediaCollectionPage implements OnDestroy, OnInit {
  apiEndPoint: string = '';
  galleries: any[] = [];
  galleryData: any[] = [];
  mdContent$: Observable<SafeHtml | null>;
  mediaCollection: any[] = [];
  mediaCollectionID: string = '';
  mediaDescription: string = '';
  mediaTitle: string = '';
  projectMachineName: string = '';
  showURNButton: boolean = false;
  singleId: string = '';
  type: string = '';
  urlParametersSubscription: Subscription | null = null;
  zoomLoadingIndex?: number = undefined;




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
  }

  ngOnInit() {
    this.urlParametersSubscription = combineLatest(
      [this.route.params, this.route.queryParams]
    ).pipe(
      map(([params, queryParams]) => ({...params, ...queryParams}))
    ).subscribe(routeParams => {
      if (this.commonFunctions.isEmptyObject(routeParams)) {
        // Load all albums
        this.mediaCollectionID = '';
        this.mdContent$ = this.getMdContent(this.activeLocale + '-11-all');
        this.mediaTitle = $localize`:@@TOC.MediaCollections:Bildbank`;
        this.getGalleries();
      } else {
        // Load specific album or specific images
        if (routeParams.mediaCollectionID) {
          this.mediaCollectionID = routeParams.mediaCollectionID;
          this.mdContent$ = this.getMdContent(this.activeLocale + '-11-' + this.mediaCollectionID);
          this.getGallery(this.mediaCollectionID);
        } else if (routeParams.entityID && routeParams.entityType) {
          this.mediaCollectionID = '';
          this.singleId = routeParams.entityID;
          this.type = routeParams.entityType;
          this.getMediaCollections(this.singleId, this.type);
        }
      }
      
    });

/*
    this.route.params.subscribe(params => {
      this.mediaCollectionId = params['mediaCollectionId'];
      this.singleId = params['id'];
      this.type = params['type'];
      this.initStuff();
    })

    this.route.queryParams.subscribe(params => {
      this.mediaTitle = params['mediaTitle'];
      this.tagModel = params['tag'];
      this.subjectModel = params['subject'];
      this.locationModel = params['location'];
    });
    */
  }

  ngOnDestroy() {
    this.urlParametersSubscription?.unsubscribe();
  }

  initStuff() {
    let fileID = '11-' + this.mediaCollectionID;
    if (this.mediaCollectionID !== null && this.mediaCollectionID !== 'null') {
      if ( !String(fileID).startsWith(this.activeLocale) ) {
        fileID = this.activeLocale + '-' + fileID;
      }
      this.mdContent$ = this.getMdContent(fileID);
      this.getCollectionTags();
      this.getCollectionLocations();
      this.getCollectionSubjects();
      this.getMediaCollections();
    } else {
      
      this.getMediaCollections(this.singleId, this.type);
    }
  }

  private getGalleries() {
    this.galleryService.getGalleries(this.activeLocale).subscribe(
      (galleries: any[]) => {
        const galleriesList: GalleryItem[] = [];
        if (galleries?.length) {
          galleries.forEach((gallery: any) => {
            const galleryItem = new GalleryItem(gallery);
            galleryItem.imageURL = `${this.apiEndPoint}/${this.projectMachineName}/gallery/get/${galleryItem.id}/gallery_thumb.jpg`;
            galleryItem.imageURLThumb = galleryItem.imageURL;

            galleriesList.push(galleryItem);
          });
          this.commonFunctions.sortArrayOfObjectsAlphabetically(galleriesList, 'title');
          this.commonFunctions.sortArrayOfObjectsNumerically(galleriesList, 'sortOrder');
        }
        this.galleryData = galleriesList;
        this.galleries = galleriesList;
      }
    );
  }

  private getGallery(galleryID: string) {
    this.galleryService.getGallery(galleryID, this.activeLocale).subscribe(
      (galleryItems: any[]) => {
        if (this.galleries.length < 1) {
          this.galleryService.getGalleries(this.activeLocale).subscribe(
            (galleries: any[]) => {
              for (let i = 0; i < galleries.length; i++) {
                if (galleries[i].id === Number(galleryID)) {
                  this.mediaDescription = galleries[i].description || '';
                  break;
                }
              }
            }
          );
        } else {
          for (let i = 0; i < this.galleries.length; i++) {
            if (this.galleries[i].id === Number(galleryID)) {
              this.mediaDescription = this.galleries[i].description || '';
              break;
            }
          }
        }

        const galleryItemsList: GalleryItem[] = [];
        if (galleryItems?.length) {
          this.mediaTitle = galleryItems[0].title;
          galleryItems.forEach((item: any) => {
            const galleryItem = new GalleryItem(item);
            const lastIndex = galleryItem.imageURL?.lastIndexOf('.') ?? -1;
            if (lastIndex > -1) {
              galleryItem.imageURLThumb = galleryItem.imageURL.substring(0, lastIndex) + '_thumb' + galleryItem.imageURL.substring(lastIndex);
            }
            galleryItem.imageURL = `${this.apiEndPoint}/${this.projectMachineName}/gallery/get/${galleryItem.collectionID}/${galleryItem.imageURL}`;
            galleryItem.imageURLThumb = `${this.apiEndPoint}/${this.projectMachineName}/gallery/get/${galleryItem.collectionID}/${galleryItem.imageURLThumb}`;
            galleryItem.imageURLBack = galleryItem.imageURLBack ? `${this.apiEndPoint}/${this.projectMachineName}/gallery/get/${galleryItem.collectionID}/${galleryItem.imageURLBack}` : undefined;

            if (!galleryItem.imageAltText) {
              galleryItem.imageAltText = $localize`:@@MediaCollections.altText:Galleribild`;
            }

            galleryItemsList.push(galleryItem);
          });
          this.commonFunctions.sortArrayOfObjectsNumerically(galleryItemsList, 'sortOrder');
        }
        this.galleryData = galleryItemsList;
      }
    );
  }

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
      this.galleryService.getGalleryOccurrences(type, id).subscribe((occurrences: any) => {
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

  async openImage(index: number) {
    this.zoomLoadingIndex = index;
    const zoomedImages = this.galleryData.map((i: GalleryItem) => i.imageURL);
    const backsides = this.galleryData.map((i: GalleryItem) => i.imageURLBack);
    const descriptions = this.galleryData.map((i: GalleryItem) => i.description);
    const imageTitles = this.galleryData.map((i: GalleryItem) => i.title);

    const params = {
      activeImageIndex: index,
      backsides: backsides,
      imageDescriptions: descriptions,
      imageTitles: imageTitles,
      imageURLs: zoomedImages
    };

    const modal = await this.modalController.create({
      component: FullscreenImageViewerModal,
      componentProps: params,
      cssClass: 'fullscreen-image-viewer-modal',
    });
    
    modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role) {
      this.zoomLoadingIndex = undefined;
    }
  }

  getCollectionTags(filter?: any) {
    (async () => {
      let tags = [] as any;
      tags = await this.galleryService.getGalleryTags(this.mediaCollectionID);
      this.allTags = tags;
      const addedTags: Array<any> = [];
      tags.forEach((element: any) => {
        if (addedTags.indexOf(element['id']) === -1) {
          this.galleryTags.push({
            'name': String(element['name']),
            id: element['id'],
            'media_collection_id': element['media_collection_id']
          });
          addedTags.push(element['id']);
        }
      });
      this.galleryTags.sort(function(a: any, b: any) {
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
        this.filterCollectionsByTag(filter);
      }
    }).bind(this)();
  }

  getCollectionLocations(filter?: any) {
    (async () => {
      let locations = [];
      locations = await this.galleryService.getGalleryLocations(this.mediaCollectionID);
      this.allLocations = locations;
      const addedLocations: Array<any> = [];
      locations.forEach((element: any) => {
        if (addedLocations.indexOf(element['id']) === -1) {
          this.galleryLocations.push({
            'name': String(element['name']),
            id: element['id'],
            'media_collection_id': element['media_collection_id']
          });
          addedLocations.push(element['id']);
        }
      });
      this.galleryLocations.sort(function(a: any, b: any) {
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
        this.filterCollectionsByLocation(filter);
      }
    }).bind(this)();
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
