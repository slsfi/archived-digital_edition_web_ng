import { Component, ChangeDetectorRef, Inject, LOCALE_ID } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { catchError, map, Observable, of } from 'rxjs';
import { marked } from 'marked';
import { GalleryService } from 'src/app/services/gallery/gallery.service';
import { MdContentService } from 'src/app/services/md/md-content.service';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';
import { config } from "src/assets/config/config";


@Component({
  selector: 'media-collections',
  templateUrl: 'media-collections.html',
  styleUrls: ['media-collections.scss']
})
export class MediaCollectionsPage {

  galleries = [] as any;
  allTags = [];
  allLocations = [];
  allSubjects = [];
  allGalleries = [];
  galleryTags = [] as any;
  galleryLocations = [] as any;
  gallerySubjects = [] as any;
  locationModel = '';
  tagModel = '';
  subjectModel = '';
  prevTag = '';
  prevLoc = '';
  prevSub = '';
  public apiEndPoint: string;
  public projectMachineName: string;
  mdContent$: Observable<SafeHtml>;

  constructor(
    private sanitizer: DomSanitizer,
    private galleryService: GalleryService,
    public userSettingsService: UserSettingsService,
    public cdRef: ChangeDetectorRef,
    private mdContentService: MdContentService,
    private router: Router,
    @Inject(LOCALE_ID) public activeLocale: string
  ) {
    this.apiEndPoint = config.app?.apiEndpoint ?? '';
    this.projectMachineName = config.app?.machineName ?? '';

    this.mdContent$ = this.getMdContent(activeLocale + '-11-all');
    this.getMediaCollections();
    this.getCollectionTags();
    this.getCollectionLocations();
    this.getCollectionSubjects();
  }

  getMediaCollections() {
    (async () => {
      this.galleries = await this.galleryService.getGalleries(this.activeLocale);
      this.allGalleries = this.galleries;
      this.allGalleries.sort(function(a: any, b: any) {
        const titleA = a.title.toLowerCase(); // ignore upper and lowercase
        const titleB = b.title.toLowerCase(); // ignore upper and lowercase
        if (titleA < titleB) {
          return -1;
        }
        if (titleA > titleB) {
          return 1;
        }
        return 0;
      });
      this.galleries = this.allGalleries;
      this.cdRef.detectChanges();
    }).bind(this)();
  }

  getCollectionTags() {
    (async () => {
      let tags = [];
      tags = await this.galleryService.getGalleryTags();
      this.allTags = tags;
      const addedTags: Array<any> = [];
      tags.forEach((element: any) => {
        if (addedTags.indexOf(element['id']) === -1) {
          this.galleryTags.push({
            'name': String(element['name']),
            id: element['id'],
            'media_collection_id': element['media_collection_id'] });
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
      this.cdRef.detectChanges();
    }).bind(this)();
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

  getCollectionLocations() {
    (async () => {
      let locations = [];
      locations = await this.galleryService.getGalleryLocations();
      this.allLocations = locations;
      const addedLocations: Array<any> = [];
      locations.forEach((element: any) => {
        if (addedLocations.indexOf(element['id']) === -1) {
          this.galleryLocations.push({
            'name': String(element['name']),
            id: element['id'],
            'media_collection_id': element['media_collection_id'] });
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
      this.cdRef.detectChanges();
    }).bind(this)();
  }

  getCollectionSubjects() {
    (async () => {
      let subjects = [];
      subjects = await this.galleryService.getGallerySubjects();
      this.allSubjects = subjects;
      const addedSubjects: Array<any> = [];
      subjects.forEach((element: any) => {
        if (addedSubjects.indexOf(element['id']) === -1 && String(element['name']).trim() !== '') {
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
    }).bind(this)();
  }

  filterCollectionsByTag(name: any) {
    if (name === '') {
      this.galleries = this.allGalleries;
      if ( this.locationModel !== undefined && this.locationModel !== '') {
        this.filterCollectionsByLocation(this.locationModel);
      }
      if (this.subjectModel !== undefined && this.subjectModel !== '') {
        this.filterCollectionsBySubject(this.subjectModel);
      }
      return true;
    }
    if (name !== this.prevTag) {
      this.galleries = this.allGalleries;
      this.prevTag = name;
      if (this.locationModel !== undefined && this.locationModel !== '') {
        this.filterCollectionsByLocation(this.locationModel);
      }
      if (this.subjectModel !== undefined && this.subjectModel !== '') {
        this.filterCollectionsBySubject(this.subjectModel);
      }
    }
    const galleryIds: Array<any> = [];
    const filteredGalleries = [] as any;
    this.allTags.forEach(element => {
      if (String(element['name']).toLowerCase() === String(name).toLowerCase()) {
        galleryIds.push(element['media_collection_id']);
      }
    });
    this.galleries.forEach((element: any) => {
      if (galleryIds.indexOf(element['id']) !== -1) {
        filteredGalleries.push(element);
      }
    });
    this.galleries = filteredGalleries;
    return;
  }

  filterCollectionsByLocation(name: any) {
    if (name === '') {
      this.galleries = this.allGalleries;
      if ( this.tagModel !== undefined && this.tagModel !== '' ) {
        this.filterCollectionsByTag(this.tagModel);
      }
      if (this.subjectModel !== undefined && this.subjectModel !== '') {
        this.filterCollectionsBySubject(this.subjectModel);
      }
      return true;
    }
    if (name !== this.prevLoc) {
      this.galleries = this.allGalleries;
      this.prevLoc = name;
      if ( this.tagModel !== undefined && this.tagModel !== '') {
        this.filterCollectionsByTag(this.tagModel);
      }
      if (this.subjectModel !== undefined && this.subjectModel !== '') {
        this.filterCollectionsBySubject(this.subjectModel);
      }
    }
    const galleryIds: Array<any> = [];
    const filteredGalleries = [] as any;
    this.allLocations.forEach(element => {
      if (String(element['name']).toLowerCase() === String(name).toLowerCase()) {
        galleryIds.push(element['media_collection_id']);
      }
    });
    this.galleries.forEach((element: any) => {
      if (galleryIds.indexOf(element['id']) !== -1) {
        filteredGalleries.push(element);
      }
    });
    this.galleries = filteredGalleries;
    return;
  }

  filterCollectionsBySubject(name: any) {
    if (name === '') {
      this.galleries = this.allGalleries;
      if ( this.tagModel !== undefined && this.tagModel !== '') {
        this.filterCollectionsByTag(this.tagModel);
      }
      if (this.locationModel !== undefined && this.locationModel !== '') {
        this.filterCollectionsByLocation(this.locationModel);
      }
      return true;
    }
    if (name !== this.prevSub) {
      this.galleries = this.allGalleries;
      this.prevSub = name;
      if ( this.tagModel !== undefined && this.tagModel !== '') {
        this.filterCollectionsByTag(this.tagModel);
      }
      if (this.locationModel !== undefined && this.locationModel !== '') {
        this.filterCollectionsByLocation(this.locationModel);
      }
    }
    const filenames: Array<any> = [];
    const filteredGalleries = [] as any;
    this.allSubjects.forEach(element => {
      if (String(element['name']).toLowerCase() === String(name).toLowerCase()) {
        filenames.push(element['media_collection_id']);
      }
    });
    this.galleries.forEach((element: any) => {
      if (filenames.indexOf(element['id']) !== -1) {
        filteredGalleries.push(element);
      }
    });
    this.galleries = filteredGalleries;
    return;
  }

  asThumb(url: any) {
    return url.replace('.jpg', '_thumb.jpg');
  }

  openMediaCollection(gallery: any) {
    const params = {
      mediaTitle: gallery.title, fetch: false,
      tag: this.tagModel, subject: this.subjectModel, location: this.locationModel
    };
    this.router.navigate([`/media-collection/${gallery.id}/`], { queryParams: params });
  }

}
