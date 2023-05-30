import { Component, Inject, Input, LOCALE_ID, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Title } from "@angular/platform-browser";
import { UrlSegment } from "@angular/router";
import { CommonFunctionsService } from "src/app/services/common-functions/common-functions.service";
import { DigitalEditionListService } from "src/app/services/toc/digital-edition-list.service";
import { GalleryService } from "src/app/services/gallery/gallery.service";
import { MdContentService } from "src/app/services/md/md-content.service";
import { config } from "src/assets/config/config";


@Component({
  selector: 'main-side-menu',
  templateUrl: './main-side-menu.html',
  styleUrls: ['./main-side-menu.scss'],
})
export class MainSideMenu implements OnInit, OnChanges {
  @Input() urlSegments: UrlSegment[] = [];

  _config = config;
  aboutPagesLoaded: boolean = false;
  aboutPagesMenu: {
    title: string;
    [key: string]: any
  };
  aboutPagesRootNodeID: string = '';
  collectionsLoaded: boolean = false;
  collectionsList: any[] = [];
  epubsList: any[] = [];
  menuItemsWithSubOptions: string[] = [
    'about',
    'collection',
    'ebook',
    'media-collection'
  ];
  mediaCollectionsLoaded: boolean = false;
  mediaCollectionsList: any[] = [];
  selectedMenu: string[] = [];
  urlRootSegment: string = '';

  constructor(
    private commonFunctions: CommonFunctionsService,
    public mdcontentService: MdContentService,
    public titleService: Title,
    public digitalEditionListService: DigitalEditionListService,
    private galleryService: GalleryService,
    @Inject(LOCALE_ID) public activeLocale: string
  ) {
    this.aboutPagesRootNodeID = this._config.page?.about?.markdownFolderNumber ?? '03';
    this.epubsList = this._config.AvailableEpubs ?? [];

    if (this.epubsList) {
      this.epubsList.forEach((epub: any) => {
        epub.id = epub.filename;
      });
    }
  }

  ngOnInit() {
    this.getAboutPages();
    this.getCollectionList();
    this.getMediaCollectionsList();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Check if url root segment has changed or if collection-page collection ID has changed
    // and update selected menu.
    if (
      changes.urlSegments.firstChange ||
      (
        changes.urlSegments.previousValue && !changes.urlSegments.currentValue
      ) ||
      (
        !changes.urlSegments.previousValue && changes.urlSegments.currentValue
      ) ||
      (
        changes.urlSegments.previousValue &&
        changes.urlSegments.currentValue &&
        (
          changes.urlSegments.previousValue[0]?.path !== changes.urlSegments.currentValue[0]?.path ||
          (
            changes.urlSegments.previousValue[0]?.path === 'collection' &&
            changes.urlSegments.previousValue[1]?.path !== changes.urlSegments.currentValue[1]?.path
          )
        )
      )
    ) {
      this.updateSelectedMenu();
    }
  }

  getAboutPages() {
    if (this._config.show?.TOC?.About ?? false) {
      this.mdcontentService.getMarkdownMenu(this.activeLocale, this.aboutPagesRootNodeID).subscribe({
        next: (menu: any) => {
          this.aboutPagesMenu = menu;
          this.aboutPagesLoaded = true;
        },
        error: (e: any) => {
          console.error(e);
          this.aboutPagesMenu = { title: '' };
          this.aboutPagesLoaded = true;
        }
      });
    } else {
      this.aboutPagesLoaded = true;
    }
  }

  getCollectionList() {
    this.digitalEditionListService.getDigitalEditions().subscribe({
      next: (digitalEditions: any) => {
        this.collectionsList = this.categorizeCollections(digitalEditions);
        this.collectionsLoaded = true;
      },
      error: (e: any) => {
        console.error(e);
        this.collectionsList = [];
        this.collectionsLoaded = true;
      }
    });
  }

  getMediaCollectionsList() {
    if (this._config.show?.TOC?.MediaCollections) {
      this.galleryService.getGalleries(this.activeLocale).subscribe({
        next: (mediaCollections: any) => {
          if (mediaCollections && mediaCollections.length > 0) {
            this.commonFunctions.sortArrayOfObjectsAlphabetically(mediaCollections, 'title');
            mediaCollections.unshift({'id': 'media-collections', 'title': $localize`:@@TOC.All:Alla`});
            this.mediaCollectionsList = mediaCollections;
          }
          this.mediaCollectionsLoaded = true;
        },
        error: (e: any) => {
          console.error(e);
          this.mediaCollectionsList = [];
          this.mediaCollectionsLoaded = true;
        }
      });
    } else {
      this.mediaCollectionsLoaded = true;
    }
  }

  categorizeCollections(collections: any) {
    if (this._config.collections?.order) {
      let collectionsList = this._config.collections.order.map(() => []);

      this._config.collections.order.forEach((array: number[], index: number) => {
        array.forEach((item: number) => {
          const collectionIndex = collections.findIndex((collection: any) => collection.id === item);
          if (collectionIndex > -1) {
            collectionsList[index].push(collections[collectionIndex]);
            //reduce the size of collections for the next iteration
            collections.splice(collectionIndex, 1);
          }
        });
      });
      return collectionsList;
    } else {
      return collections;
    }
  }

  private updateSelectedMenu() {
    this.urlRootSegment = this.urlSegments && this.urlSegments[0]?.path || '';
    let currentSelectedMenu = this.menuItemsWithSubOptions.find(item => item === this.urlRootSegment) || '';

    if (currentSelectedMenu === 'collection') {
      const collectionId = this.urlSegments[1]?.path || '';
      const index = this._config.collections.order.findIndex((collectionSet: number[]) => collectionSet.includes(Number(collectionId)));
      currentSelectedMenu += index;
    }

    currentSelectedMenu && !this.selectedMenu.includes(currentSelectedMenu) && this.selectedMenu.push(currentSelectedMenu);
  }

  toggleAccordion(value: string) {
    this.commonFunctions.addOrRemoveValueInArray(this.selectedMenu, value);
  }

}
