import { Component, Inject, LOCALE_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { catchError, map, Observable, of } from 'rxjs';
import { marked } from 'marked';
import { FullscreenImageViewerModal } from 'src/app/modals/fullscreen-image-viewer/fullscreen-image-viewer';
import { ReferenceDataModalPage } from 'src/app/modals/reference-data-modal/reference-data-modal';
import { GalleryService } from 'src/app/services/gallery.service';
import { MdContentService } from 'src/app/services/md-content.service';
import { UserSettingsService } from 'src/app/services/user-settings.service';
import { config } from "src/assets/config/config";


// @IonicPage({
//   name: 'media-collection',
//   segment: 'media-collection/:mediaCollectionId/:id/:type'
// })
@Component({
  selector: 'page-media-collection',
  templateUrl: 'media-collection.html',
  styleUrls: ['media-collection.scss']
})
export class MediaCollectionPage {

  mediaCollectionId?: string;
  mediaTitle?: string;
  mediaDescription?: string;
  mediaCollection = [] as any;
  public apiEndPoint: string;
  public projectMachineName: string;
  singleId?: string;
  type?: string;

  allTags = [];
  allLocations = [];
  allSubjects = [];
  allMediaCollection = [];
  galleryTags = [] as any;
  galleryLocations = [] as any;
  gallerySubjects = [] as any;
  locationModel = '';
  tagModel = '';
  subjectModel = '';
  prevTag = '';
  prevLoc = '';
  prevSub = '';
  mdContent$: Observable<SafeHtml>;
  showURNButton: boolean;

  constructor(
    private sanitizer: DomSanitizer,
    private galleryService: GalleryService,
    public userSettingsService: UserSettingsService,
    private modalController: ModalController,
    private mdContentService: MdContentService,
    private route: ActivatedRoute,
    @Inject(LOCALE_ID) public activeLocale: string
  ) {
    // this.mediaCollectionId = this.navParams.get('mediaCollectionId');
    // this.singleId = this.navParams.get('id');
    // this.type = this.navParams.get('type');
    // this.mediaTitle = this.navParams.get('mediaTitle');
    // this.tagModel = this.navParams.get('tag');
    // this.subjectModel = this.navParams.get('subject');
    // this.locationModel = this.navParams.get('location');
    this.apiEndPoint = config.app?.apiEndpoint ?? '';
    this.projectMachineName = config.app?.machineName ?? '';
    this.showURNButton = config.page?.mediaCollection?.showURNButton ?? true;
  }

  getMediaCollections(id?: any, type?: any) {
    if ( id === undefined && this.mediaCollectionId ) {
      this.galleryService.getGallery(this.mediaCollectionId, this.activeLocale).subscribe(gallery => {
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

  asThumb(url: any) {
    return url.replace('.jpg', '_thumb.jpg');
  }

  ngOnInit() {
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
  }

  initStuff() {
    let fileID = '11-' + this.mediaCollectionId;
    if (this.mediaCollectionId !== null && this.mediaCollectionId !== 'null') {
      if ( !String(fileID).startsWith(this.activeLocale) ) {
        fileID = this.activeLocale + '-' + fileID;
      }
      this.mdContent$ = this.getMdContent(fileID);
      this.getCollectionTags();
      this.getCollectionLocations();
      this.getCollectionSubjects();
      this.getMediaCollections();
    } else {
      this.mediaCollectionId = undefined;
      this.getMediaCollections(this.singleId, this.type);
    }
  }

  getImageUrl(filename: any, mediaCollectionId: any) {
    if (!filename) {
      return null;
    }
    return this.apiEndPoint + '/' + this.projectMachineName + '/gallery/get/' + mediaCollectionId +
           '/' + filename;
  }

  async openImage(index: any, mediaCollectionId: any) {
    const zoomedImages = this.mediaCollection.map((i: any) => this.getImageUrl(i.front, mediaCollectionId));
    const backsides = zoomedImages.map((i: any) => i.replace('.jpg', 'B.jpg'));
    const descriptions = this.mediaCollection.map((i: any) => i.description);
    const imageTitles = this.mediaCollection.map((i: any) => i.media_title_translation);

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
  }

  getCollectionTags(filter?: any) {
    (async () => {
      let tags = [] as any;
      tags = await this.galleryService.getGalleryTags(this.mediaCollectionId);
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
      locations = await this.galleryService.getGalleryLocations(this.mediaCollectionId);
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
      subjects = await this.galleryService.getGallerySubjects(this.mediaCollectionId);
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

  async showReference() {
    // Get URL of Page and then the URI
    const modal = await this.modalController.create({
      component: ReferenceDataModalPage,
      componentProps: {id: document.URL, type: 'reference', origin: 'media-collection'}
    });
    modal.present();
  }
}
