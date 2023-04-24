import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { Title } from "@angular/platform-browser";
import { NavigationEnd, PRIMARY_OUTLET, Router } from "@angular/router";
import { filter } from 'rxjs/operators';
import { CommonFunctionsService } from "src/app/services/common-functions/common-functions.service";
import { DigitalEditionListService } from "src/app/services/toc/digital-edition-list.service";
import { GalleryService } from "src/app/services/gallery/gallery.service";
import { MdContentService } from "src/app/services/md/md-content.service";
import { config } from "src/assets/config/config";


@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.html',
  styleUrls: ['./side-menu.scss'],
})
export class SideMenu implements OnInit {
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
  mediaCollectionsLoaded: boolean = false;
  mediaCollectionsList: any[] = [];
  selectedMenu: string[] = [];
  urlRootSegment: string;

  constructor(
    private commonFunctions: CommonFunctionsService,
    public mdcontentService: MdContentService,
    public titleService: Title,
    public digitalEditionListService: DigitalEditionListService,
    private galleryService: GalleryService,
    private router: Router,
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

    const menuArray = [
      '/about',
      '/collection',
      '/epub',
      '/media-collection',
      '/person-search',
      '/places',
      '/tags',
      '/works'
    ];

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const urlPrimaryOutlet = this.router.parseUrl(event.url).root.children[PRIMARY_OUTLET];
      this.urlRootSegment = urlPrimaryOutlet ? urlPrimaryOutlet.segments[0].path : ''
      let initialSelectedMenu = menuArray.find(item => event.url.includes(item)) || '/';
      if (initialSelectedMenu === '/collection') {
        const collectionId = (event as any).url.split('/')[2];
        const index = this._config.collections.order.findIndex((item: any[]) => item.includes(Number(collectionId)));
        initialSelectedMenu += index;
      }
      !this.selectedMenu.includes(initialSelectedMenu) && this.selectedMenu.push(initialSelectedMenu);
    });
  }

  getAboutPages() {
    if (this._config.show?.TOC?.About ?? false) {
      this.mdcontentService.getMarkdownMenu(this.activeLocale, this.aboutPagesRootNodeID).subscribe({
        next: (menu: any) => {
          this.aboutPagesMenu = menu;
          this.aboutPagesLoaded = true;
        },
        error: (e: any) => {
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

  toggleAccordion(value: string) {
    this.commonFunctions.addOrRemoveValueInArray(this.selectedMenu, value);
  }

}
