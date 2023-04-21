import { Component, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LoadingController, ModalController, Platform } from '@ionic/angular';
import { Occurrence, OccurrenceResult } from 'src/app/models/occurrence.model';
import { SingleOccurrence } from 'src/app/models/single-occurrence.model';
import { EventsService } from 'src/app/services/events/events.service';
import { OccurrenceService } from 'src/app/services/occurrence/occurence.service';
import { SemanticDataService } from 'src/app/services/semantic-data/semantic-data.service';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';
import { config } from "src/assets/config/config";


// @IonicPage({
//   name: 'occurrences-result',
//   segment: 'result/:objectType/:id'
// })
@Component({
  selector: 'page-occurrences-result',
  templateUrl: 'occurrences-result.html',
  styleUrls: ['occurrences-result.scss']
})
export class OccurrencesResultPage {
  segments = 'info';
  id: any = null;
  objectType: string | null = null;
  title: string | null = null;
  occurrencesToShow: SingleOccurrence[] = [];
  allOccurrences: SingleOccurrence[] = [];
  hasInfoDataToDisplay = false;
  hasInfoMediaDataOnlyToDisplay = false;
  loadingInfoData = false;
  loadingOccurrencesData = false;
  occurrenceResult?: OccurrenceResult;
  singleOccurrenceType: string | null = null;

  searchResult: any = null;

  occurrencesCount = 0;
  infiniteScrollNumber = 100;

  infoData = {
    longitude: null,
    latitude: null,
    city: null,
    region: null,
    occupation: null,
    place_of_birth: null,
    type: null as any,
    type_translation: null as any,
    source: null,
    description: null,
    country: null,
    date_born: null,
    date_deceased: null
  };

  mediaData = {
    imageUrl: null,
    description: null
  };

  articleData: Array<any> = [];

  params: any;

  showOccurrencesModalOnRead: any;
  showOccurrencesModalOnSong: any;

  constructor(
    public semanticDataService: SemanticDataService,
    private platform: Platform,
    public occurrenceService: OccurrenceService,
    public loadingCtrl: LoadingController,
    public userSettingsService: UserSettingsService,
    public modalCtrl: ModalController,
    private events: EventsService,
    private cf: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.segments = 'info';
    this.singleOccurrenceType = config.SingleOccurrenceType ?? null;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.getParamsData(params);
      this.getMediaData();
      this.getArticleData();
      this.getOccurrencesData();
    })

    this.route.queryParams.subscribe(params => {
      if (params['searchResult'] !== undefined) {
        this.searchResult = params['searchResult'];
      }

      this.showOccurrencesModalOnRead = params['showOccurrencesModalOnRead'];
      this.showOccurrencesModalOnSong = params['showOccurrencesModalOnSong'];
    });
  }

  ionViewWillEnter() {
    this.segments = 'info';
  }

  getParamsData(params: Params) {
    try {
      this.id = params['id'];
      this.objectType = params['objectType'];
    } catch ( e ) {
      console.log('not done');
    }
  }

  setSegment(value: any) {
    this.segments = value;
  }

  onSegmentChanged(obj: any) {
    this.cf.detectChanges();
    console.log('segment changed')
  }

  getOccurrencesData() {
    if (this.objectType === 'tag') {
      this.getTag();
      this.getTagOccurrences();
    } else if (this.objectType === 'subject') {
      this.getSubjectOccurrences();
    } else if (this.objectType === 'location') {
      this.getLocationOccurrences();
    } else if (this.objectType === 'work') {
      this.getWork();
      this.getWorkOccurrences();
    }
  }

  setOccurrence(occurrence: Occurrence) {
    if (this.singleOccurrenceType === null) {
      if (
        occurrence.publication_id &&
        !occurrence.publication_manuscript_id &&
        !occurrence.publication_comment_id &&
        !occurrence.publication_facsimile_id &&
        !occurrence.publication_version_id
      ) {
        this.addToOccurrencesList(occurrence, 'est');
      } else {
        if (occurrence.publication_manuscript_id) {
          this.addToOccurrencesList(occurrence, 'ms');
        }
        if (occurrence.publication_version_id) {
          this.addToOccurrencesList(occurrence, 'var');
        }
        if (occurrence.publication_comment_id) {
          this.addToOccurrencesList(occurrence, 'com');
        }
        if (occurrence.publication_facsimile_id) {
          this.addToOccurrencesList(occurrence, 'facs');
        }
        if (occurrence.type === 'song') {
          this.addToOccurrencesList(occurrence, occurrence.type);
        }
      }
    } else if (this.singleOccurrenceType === occurrence.type) {
      this.addToOccurrencesList(occurrence, occurrence.type);
    }
  }

  addToOccurrencesList(occurrence: Occurrence, type: string) {
    const newOccurrence = new SingleOccurrence();
    let fileName = occurrence.original_filename;

    if (occurrence.original_filename === null) {
      fileName = occurrence.collection_id + '_' + occurrence['publication_id'] + '.xml';
    }

    if (occurrence.id) {
      newOccurrence.id = occurrence.id;
    }

    newOccurrence.description = occurrence.description || null;
    newOccurrence.publication_id = occurrence.publication_id || null;
    newOccurrence.collectionID = occurrence.collection_id || null;
    newOccurrence.description = occurrence.description || null;
    newOccurrence.publication_facsimile_id = occurrence.publication_facsimile_id || null;
    newOccurrence.publication_facsimile = occurrence.publication_facsimile || null;
    newOccurrence.publication_facsimile_page = occurrence.publication_facsimile_page || null;
    newOccurrence.linkID = newOccurrence.collectionID + '_' + newOccurrence.publication_id;
    newOccurrence.filename = fileName;
    newOccurrence.textType = type;
    newOccurrence.name = occurrence.song_name || null;
    newOccurrence.number = occurrence.song_number || null;
    newOccurrence.original_collection_location = occurrence.song_original_collection_location || null;
    newOccurrence.original_collection_signature = occurrence.song_original_collection_signature || null;
    newOccurrence.original_publication_date = occurrence.song_original_publication_date || null;
    newOccurrence.page_number = occurrence.song_page_number || null;
    newOccurrence.performer_born_name = occurrence.song_performer_born_name || null;
    newOccurrence.performer_firstname = occurrence.song_performer_firstname || null;
    newOccurrence.performer_lastname = occurrence.song_performer_lastname || null;
    newOccurrence.place = occurrence.song_place || null;
    newOccurrence.recorder_born_name = occurrence.song_recorder_born_name || null;
    newOccurrence.recorder_firstname = occurrence.song_recorder_firstname || null;
    newOccurrence.recorder_lastname = occurrence.song_recorder_lastname || null;
    newOccurrence.subtype = occurrence.song_subtype || null;
    newOccurrence.type = occurrence.song_type || null;
    newOccurrence.variant = occurrence.song_variant || null;
    newOccurrence.volume = occurrence.song_volume || null;
    newOccurrence.landscape = occurrence.song_landscape || null;
    newOccurrence.title = occurrence.name;
    newOccurrence.song_id = occurrence.song_id;
    newOccurrence.collectionName = occurrence.collection_name;
    newOccurrence.displayName = (occurrence.publication_name !== null) ? occurrence.publication_name : occurrence.collection_name;

    if ( newOccurrence.type !== null ) {
      newOccurrence.displayName = String(newOccurrence.type).charAt(0).toUpperCase() + String(newOccurrence.type).slice(1);
    }

    if ( newOccurrence.number !== null ) {
      newOccurrence.publication_facsimile_page = String(newOccurrence.number);
    }


    let exists = false;

    for (const oc of this.occurrencesToShow) {
      if (
        type === 'song' &&
        oc.textType === newOccurrence.textType &&
        oc.description === newOccurrence.description
      ) {
        exists = true;
        break;
      } else if (
        oc.id === newOccurrence.id &&
        oc.textType === newOccurrence.textType &&
        oc.publication_facsimile === newOccurrence.publication_facsimile &&
        oc.publication_facsimile_id === newOccurrence.publication_facsimile_id &&
        oc.publication_facsimile_page === newOccurrence.publication_facsimile_page &&
        oc.description === newOccurrence.description
      ) {
        exists = true;
        break;
      }
    }

    if (!exists) {
      this.allOccurrences.push(newOccurrence);

      if (this.occurrencesCount < this.infiniteScrollNumber) {
        this.occurrencesToShow.push(newOccurrence);
        this.occurrencesCount++;
      }

      this.allOccurrences.sort(function(a: any, b: any) {
        if (a.displayName < b.displayName) { return -1; }
        if (a.displayName > b.displayName) { return 1; }
        return 0;
      });
      this.occurrencesToShow.sort(function(a: any, b: any) {
        if (a.displayName < b.displayName) { return -1; }
        if (a.displayName > b.displayName) { return 1; }
        return 0;
      });
    }
  }

  getTagOccurrences() {
    if (this.id === null || this.objectType === null) {
      console.log('Navparams missing...');
      return;
    }

    this.loadingOccurrencesData = true;

    this.semanticDataService.getTagOccurrences(this.id).subscribe(
      tags => {

        for (const tag of tags) {
          tag.name = String(tag.name).toLocaleLowerCase();

          if (Number(tag.id) === Number(this.id)) {
            this.occurrenceResult = tag;
            const occurrences = this.occurrenceResult?.occurrences as Occurrence[];

            for (const occurence of occurrences) {
              this.setOccurrence(occurence);
            }

            this.loadingOccurrencesData = false;

            if (!this.hasInfoDataToDisplay && this.occurrencesToShow && this.occurrencesToShow.length) {
              this.segments = 'occurrences';
            }
            break;
          }
        }
      },
      err => {
        console.error(err);
        this.loadingOccurrencesData = false;
      },
      () => console.log('Fetched tags...')
    );
  }

  getSubjectOccurrences() {
    if (this.id === null || this.objectType === null) {
      console.log('Navparams missing...');
      return;
    }

    this.loadingInfoData = true;
    this.loadingOccurrencesData = true;

    const currentSubjectId = this.id;

    this.semanticDataService.getSubjectOccurrences(currentSubjectId).subscribe(
      subjects => {

        for (const subject of subjects) {
          if (Number(subject.id) === Number(currentSubjectId)) {
            this.setSubject(subject);
            this.checkHasAnyInfoDataToDisplay();

            this.occurrenceResult = subject;
            const occurrences = this.occurrenceResult?.occurrences as Occurrence[];

            for (const occurence of occurrences) {
              this.setOccurrence(occurence);
            }
            this.loadingInfoData = false;
            this.loadingOccurrencesData = false

            if (!this.hasInfoDataToDisplay && this.occurrencesToShow && this.occurrencesToShow.length) {
              this.segments = 'occurrences';
            }
            break;
          }
        }
      },
      err => {
        console.error(err);
        this.loadingInfoData = false;
        this.loadingOccurrencesData = false;
      },
      () => console.log('Fetched tags...')
    );
  }

  getLocationOccurrences() {
    if (this.id === null || this.objectType === null) {
      console.log('Navparams missing...');
      return;
    }

    this.loadingInfoData = true;
    this.loadingOccurrencesData = true;

    const currentLocationId = this.id;

    this.semanticDataService.getLocationOccurrences(currentLocationId).subscribe(
      locations => {

        for (const location of locations) {
          if (Number(location.id) === Number(currentLocationId)) {
            this.setLocation(location);
            this.checkHasAnyInfoDataToDisplay();

            this.occurrenceResult = location;
            const occurrences = this.occurrenceResult?.occurrences as Occurrence[];

            for (const occurence of occurrences) {
              this.setOccurrence(occurence);
            }
            this.loadingInfoData = false;
            this.loadingOccurrencesData = false

            if (!this.hasInfoDataToDisplay && this.occurrencesToShow && this.occurrencesToShow.length) {
              this.segments = 'occurrences';
            }
            break;
          }
        }
      },
      err => {
        console.error(err);
        this.loadingInfoData = false;
        this.loadingOccurrencesData = false;
      },
      () => console.log('Fetched tags...')
    );
  }

  getWorkOccurrences() {
    const currentLocationId = this.id;
    this.semanticDataService.getWorkOccurrencesById(currentLocationId).subscribe(
      occurrences => {
        for (const occurrence of occurrences) {
          this.setOccurrence(occurrence);
        }
        this.loadingInfoData = false;
        this.loadingOccurrencesData = false
        this.setWork(occurrences);
        /*for (const location of locations) {
          if (Number(location.id) === Number(currentLocationId)) {
             this.setLocation(location);
            this.checkHasAnyInfoDataToDisplay();

            this.occurrenceResult = location;
            const occurrences: Occurrence[] = this.occurrenceResult.occurrences;

            for (const occurence of occurrences) {
              this.setOccurrence(occurence);
            }
            this.loadingInfoData = false;
            this.loadingOccurrencesData = false

            if (!this.hasInfoDataToDisplay && this.occurrencesToShow && this.occurrencesToShow.length) {
              this.segments = 'occurrences';
            }
            break;
          }
        }*/
      },
      err => {
        console.error(err);
        this.loadingInfoData = false;
        this.loadingOccurrencesData = false;
      },
      () => console.log('Fetched tags...')
    );
  }

  getTag() {
    if (!this.id) {
      return;
    }
    this.loadingInfoData = true;
    this.semanticDataService.getTag(this.id).subscribe(
      tag => {
        if (tag.name) {
          let title = tag.name;
          title = title.charAt(0).toUpperCase() + title.slice(1);
          this.title = title;
        }
        // string.charAt(0).toUpperCase() + string.slice(1);
        this.loadingInfoData = false;
        this.checkHasAnyInfoDataToDisplay();
      },
      err => {
        console.error(err);
        this.loadingInfoData = false;
      },
      () => console.log('Fetched tags...')
    );
  }

  getWork() {
    if (this.id === undefined) {
      return;
    }

    this.loadingInfoData = true;
    this.semanticDataService.getWork(this.id).subscribe(
      work => {
        if (work.title) {
          let title = work.title;
          title = title.charAt(0).toUpperCase() + title.slice(1);
          this.title = title;
        }
        // string.charAt(0).toUpperCase() + string.slice(1);
        this.loadingInfoData = false;
        this.checkHasAnyInfoDataToDisplay();
      },
      err => {
        console.error(err);
        this.loadingInfoData = false;
      },
      () => console.log('Fetched tags...')
    );
  }

  setSubject(subject: any) {
    if (subject.name) {
      this.title = subject.name;
    }

    this.infoData.type = subject.object_type;
    this.infoData.description = subject.description;

    if (['playman', 'recorder'].indexOf(subject.object_type) !== -1) {
      this.infoData.type_translation = `Song.${subject.object_type}`;
    }
  }

  setLocation(location: any) {
    if (location.name) {
      this.title = location.name;
    }

    this.infoData.city = location.city;
    this.infoData.latitude = location.latitude;
    this.infoData.longitude = location.longitude;
    this.infoData.region = location.region;
  }

  setWork(work: any) {
    if (work.name) {
      this.title = work.name;
    }

    this.infoData.city = work.city;
    this.infoData.latitude = work.latitude;
    this.infoData.longitude = work.longitude;
    this.infoData.region = work.region;
  }

  /**
   * Media data: image and description about a subject, location or tag
   */
  getMediaData() {
    if (!this.objectType?.length || this.occurrenceResult?.id === undefined) {
      return;
    }

    this.occurrenceService.getMediaData(this.objectType, String(this.id)).subscribe(
      mediaData => {
        this.mediaData.imageUrl = mediaData.image_path;
        this.mediaData.description = mediaData.description;
      },
      error => console.log(error)
    );
  }

  getArticleData() {
    if (!this.objectType?.length || this.id === undefined) {
      return;
    }

    this.occurrenceService.getArticleData(this.objectType, this.id).subscribe(
      data => {
        this.articleData = data;
      },
      error => console.log(error)
    );
  }

  checkHasAnyInfoDataToDisplay() {
    let hasData = false;

    for (const key in this.infoData) {
      if (this.infoData[key as keyof typeof this.infoData] !== null) {
        hasData = true;
        break;
      }
    }

    if (!hasData) {
      for (const key in this.mediaData) {
        if (this.mediaData[key as keyof typeof this.mediaData] !== null) {
          hasData = true;
          break;
        }
      }

      if (hasData) {
        this.hasInfoMediaDataOnlyToDisplay = true;
      }
    }

    this.hasInfoDataToDisplay = hasData;
  }

  /**
   * Select occurrence
   */
  openText(text: any) {
    if (text.textType === 'song' && text.song_id) {
      this.selectSong(text.song_id);
      return;
    }

    const params = {} as any;
    const col_id = text.collectionID;
    const pub_id = text.publication_id;
    let text_type: string;

    if (text.textType === 'ms') {
      text_type = 'manuscripts';
    } else if (text.textType === 'var') {
      text_type = 'variations';
    } else if (text.textType === 'facs') {
      text_type = 'facsimiles'
    } else if (text.textType === 'est') {
      text_type = 'established'
    } else {
      text_type = 'comments';
    }

    params['search_title'] = 'searchtitle';
    let facs_id = 'not';
    let facs_nr = 'infinite';
    // params['song_id'] = 'nosong';
    // params['chapterID'] = 'nochapter';
// 
    if (text_type === 'facsimile') {
      if (text.publication_facsimile_id) {
        facs_id = text.publication_facsimile_id;
      }

      if (text.facs_nr) {
        facs_nr = text.facs_nr;
      }
    }

    params['tocLinkId'] = col_id + '_' + pub_id;
    // params['collectionID'] = col_id;
    // params['publicationID'] = pub_id;
    // params['legacyId'] = col_id + '_' + pub_id;
    if (text.facsimilePage) {
      params['facsimilePage'] = text.facsimilePage;
    } else {
      params['facsimilePage'] = null;
    }
    // params['urlviews'] = text_type;
    params['views'] = [
      {
        type: text_type,
        id: text.linkID
      }
    ];

    // params['occurrenceResult'] = this.occurrenceResult;

    if (this.showOccurrencesModalOnRead) {
      params['showOccurrencesModalOnRead'] = true;
    }

    if (this.objectType) {
      params['objectType'] = this.objectType;
    }
    params['selectedItemInAccordion'] = false;

    this.router.navigate([`/collection/${col_id}/text/${pub_id}/nochapter/${facs_id}/${facs_nr}/nosong/searchtitle/text_type`], { queryParams: params });
  }

  downloadArticle(url: any) {
    const ref = window.open(url, '_blank', 'location=no');
  }

  /**
   * If occurrence is a song, go to song page instead
   */
  selectSong(song_id: any) {
    let songsFilter = this.objectType;

    if (this.objectType === 'subject') {
      songsFilter = this.infoData.type;
    }

    const params = {
      // song_number: song_id,
      // filter_songs_by: songsFilter
    } as any;

    params['occurrenceResult'] = this.occurrenceResult;
    params['objectType'] = this.objectType;

    if (this.showOccurrencesModalOnSong) {
      params['showOccurrencesModalOnSong'] = true;
    }

    this.router.navigate([`/song/${song_id}/${songsFilter}`], { queryParams: params });
  }

  doInfinite(infiniteScroll: any) {
    if ( this.occurrencesToShow !== undefined && this.occurrencesCount < this.allOccurrences.length ) {
      for (let i = 0; i < this.infiniteScrollNumber; i++) {
        if (this.occurrencesCount < this.allOccurrences.length) {
          this.occurrencesToShow.push(this.allOccurrences[this.occurrencesCount]);
          this.occurrencesCount++;
        } else {
          break;
        }
      }
    }
    infiniteScroll.complete();
  }

}
