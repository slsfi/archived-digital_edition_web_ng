import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, App, Events } from 'ionic-angular';
import { GalleryService } from '../../app/services/gallery/gallery.service';
import { UserSettingsService } from '../../app/services/settings/user-settings.service';
import { ConfigService } from '@ngx-config/core';
import { LanguageService } from '../../app/services/languages/language.service';
import { TranslateService } from '@ngx-translate/core/src/translate.service';

@IonicPage({
  name: 'media-collections',
  segment: 'media-collections'
})
@Component({
  selector: 'media-collections',
  templateUrl: 'media-collections.html',
})
export class MediaCollectionsPage {

  galleries = [];
  allTags = [];
  allLocations = [];
  allSubjects = [];
  allGalleries = [];
  galleryTags = [];
  galleryLocations = [];
  gallerySubjects = [];
  locationModel = '';
  tagModel = '';
  prevTag = '';
  prevLoc = '';
  private apiEndPoint: string;
  private projectMachineName: string;
  private removeScanDetails = false;
  language = 'sv';
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private app: App,
    private events: Events,
    private galleryService: GalleryService,
    private userSettingsService: UserSettingsService,
    private config: ConfigService,
    public languageService: LanguageService,
    public translate: TranslateService,
    public cdRef: ChangeDetectorRef
  ) {
    this.getMediaCollections();
    this.apiEndPoint = this.config.getSettings('app.apiEndpoint');
    this.projectMachineName = this.config.getSettings('app.machineName');
    try {
      this.removeScanDetails = this.config.getSettings('galleryImages.removeScanDetails');
    } catch (e) {
      this.removeScanDetails = false;
    }
    this.languageService.getLanguage().subscribe((lang: string) => {
      this.language = lang;
    });
    this.getCollectionTags();
    this.getCollectionLocations();
  }

  getMediaCollections() {
    (async () => {
      this.galleries = await this.galleryService.getGalleries(this.language);
      this.allGalleries = this.galleries;
      this.cdRef.detectChanges();
    }).bind(this)();
  }

  getCollectionTags() {
    (async () => {
      let tags = [];
      tags = await this.galleryService.getGalleryTags();
      this.allTags = tags;
      const addedTags: Array<any> = [];
      tags.forEach(element => {
        if (!addedTags.includes(element['id'])) {
          this.galleryTags.push({ 'name': String(element['name']).toLowerCase(), id: element['id'], 'media_collection_id': element['media_collection_id'] });
          addedTags.push(element['id']);
        }
      });
      this.galleryTags.sort((a, b) => (a.name > b.name) ? 1 : -1)
      this.cdRef.detectChanges();
    }).bind(this)();
  }

  getCollectionLocations() {
    (async () => {
      let locations = [];
      locations = await this.galleryService.getGalleryLocations();
      this.allLocations = locations;
      const addedLocations: Array<any> = [];
      locations.forEach(element => {
        if (!addedLocations.includes(element['id'])) {
          this.galleryLocations.push({ 'name': String(element['name']).toLowerCase(), id: element['id'], 'media_collection_id': element['media_collection_id'] });
          addedLocations.push(element['id']);
        }
      });
      this.galleryLocations.sort((a, b) => (a.name > b.name) ? 1 : -1)
      this.cdRef.detectChanges();
    }).bind(this)();
  }

  filterCollectionsByTag(name) {
    if (name === '') {
      this.galleries = this.allGalleries;
      if (this.locationModel !== '') {
        this.filterCollectionsByLocation(this.locationModel);
      }
      return true;
    }
    if (name !== this.prevTag) {
      this.galleries = this.allGalleries;
      this.prevTag = name;
      if (this.locationModel !== '') {
        this.filterCollectionsByLocation(this.locationModel);
      }
    }
    const galleryIds = [];
    const filteredGalleries = [];
    this.allTags.forEach(element => {
      if (String(element['name']).toLowerCase() === String(name).toLowerCase()) {
        galleryIds.push(element['media_collection_id']);
      }
    });
    this.galleries.forEach(element => {
      if (galleryIds.includes(element['id'])) {
        filteredGalleries.push(element);
      }
    });
    this.galleries = filteredGalleries;
  }

  filterCollectionsByLocation(name) {
    if (name === '') {
      this.galleries = this.allGalleries;
      if ( this.tagModel !== '' ) {
        this.filterCollectionsByTag(this.tagModel);
      }
      return true;
    }
    if (name !== this.prevLoc) {
      this.galleries = this.allGalleries;
      this.prevLoc = name;
      if (this.tagModel !== '') {
        this.filterCollectionsByLocation(this.tagModel);
      }
    }
    const galleryIds = [];
    const filteredGalleries = [];
    this.allLocations.forEach(element => {
      if (String(element['name']).toLowerCase() === String(name).toLowerCase()) {
        galleryIds.push(element['media_collection_id']);
      }
    });
    this.galleries.forEach(element => {
      if (galleryIds.includes(element['id'])) {
        filteredGalleries.push(element);
      }
    });
    this.galleries = filteredGalleries;
  }

  ionViewWillLeave() {
    this.events.publish('ionViewWillLeave', this.constructor.name);
  }
  ionViewWillEnter() {
    this.events.publish('ionViewWillEnter', this.constructor.name);
  }

  asThumb(url) {
    return url.replace('.jpg', '_thumb.jpg');
  }

  openMediaCollection(gallery) {
    const nav = this.app.getActiveNavs();
    const params = {mediaCollectionId: gallery.id , mediaTitle: gallery.title, fetch: false};
    nav[0].push('media-collection', params, {animate: true, direction: 'forward', animation: 'ios-transition'});
  }

}
