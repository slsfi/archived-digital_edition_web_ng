import { Component, Input, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { Title } from "@angular/platform-browser";
import { NavigationEnd, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { MdContentService } from "../../services/md/md-content.service";
import { UserSettingsService } from "../../services/settings/user-settings.service";
import { DigitalEditionListService } from "../../services/toc/digital-edition-list.service";
import { GalleryService } from "../../services/gallery/gallery.service";
import { config } from "src/app/services/config/config";
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.html',
  styleUrls: ['./side-menu.scss'],
})
export class SideMenu implements OnInit {
  @Input() showSideMenu: boolean = false;

  _config = config
  appName?: string;
  errorMessage?: string;
  collectionsList: any[] = [];
  collectionsListWithTOC?: any[];
  pdfCollections?: any[];
  apiEndPoint: string;
  projectMachineName: string;
  staticPagesMenusInTOC: any = [];
  collectionsWithoutTOC: Array<Number> = [];
  collectionDownloads: any;
  accordionTOC = false;
  aboutMenuMarkdownInfo: any;
  mediaCollectionOptions: any;
  aboutOptionsMarkdown: {
    title: string;
    [key: string]: any
  };
  showBooks = false;
  tocItems?: any;
  availableEpubs: any[];
  epubNames: any[];
  galleryInReadMenu = true;
  splitReadCollections: Number[][] = [];
  selectedMenu: string = '';

  constructor(
    public translate: TranslateService,
    public mdcontentService: MdContentService,
    private userSettingsService: UserSettingsService,
    public titleService: Title,
    public digitalEditionListService: DigitalEditionListService,
    private galleryService: GalleryService,
    private router: Router,
    @Inject(LOCALE_ID) public activeLocale: string
  ) {
    this.mediaCollectionOptions = {};

    this.collectionDownloads = this._config.collectionDownloads ?? undefined;
    try {
      this.showBooks = this._config.show?.TOC?.Books;
    } catch (e) {
      this.showBooks = false;
    }

    this.splitReadCollections = this._config.show?.TOC?.splitReadCollections || [];

    this.accordionTOC = this._config.AccordionTOC ?? false;
    this.galleryInReadMenu = this._config.ImageGallery?.ShowInReadMenu ?? true;
    this.availableEpubs = this._config.AvailableEpubs ?? undefined;
    if (this.availableEpubs !== undefined) {
      this.epubNames = Object.keys(this.availableEpubs);
    } else {
      this.availableEpubs = [];
      this.epubNames = [];
    }

    this.getCollectionsWithoutTOC();
    this.getCollectionList();
  }

  ngOnInit() {
    const menuArray = ['/about', '/epub', '/collection', '/media-collection', '/tags', '/works', '/person-search', '/places']
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(event => {
      this.selectedMenu = menuArray.find(item => (event as any).url.includes(item)) || '/';
      if (this.selectedMenu === '/collection') {
        let collectionId = (event as any).url.split('/')[2]
        let index = this._config.collections.order.findIndex((item: any[]) => item.includes(Number(collectionId)))
        this.selectedMenu += index;
      }
    })

    this.initializeApp();
    if (this._config.show?.TOC?.MediaCollections) {
      this.getMediaCollections().then((mediaCollectionMenu) => {
        if (mediaCollectionMenu && mediaCollectionMenu.length > 0) {
          mediaCollectionMenu.sort(function (a: any, b: any) {
            if (a['title'] < b['title']) {
              return -1;
            }
            if (a['title'] > b['title']) {
              return 1;
            }
            return 0;
          });

          let t_all = 'Alla';
          this.translate.get('TOC.All').subscribe(
            translation => {
              t_all = translation;
            }, () => {
            }
          );
          mediaCollectionMenu.unshift({'id': 'media-collections', 'title': t_all, 'highlight': true});
          mediaCollectionMenu.forEach((item: any) => {
            item['is_gallery'] = true;
          });
          this.mediaCollectionOptions.toc_exists = true;
          this.mediaCollectionOptions.expanded = false;
          this.mediaCollectionOptions.loading = false;
          this.mediaCollectionOptions.accordionToc = {
            toc: mediaCollectionMenu,
            children: mediaCollectionMenu,
            searchTocItem: true,
            searchTitle: '', // If toc item has to be searched by unique title also
            currentPublicationId: null
          };
          this.mediaCollectionOptions.has_children_pdfs = false;
          this.mediaCollectionOptions.isDownload = false;
          this.mediaCollectionOptions.highlight = false;
          this.mediaCollectionOptions.title = 'media';
          this.mediaCollectionOptions.id = 'mediaCollections';
          this.mediaCollectionOptions.collectionId = 'mediaCollections';
        } else {
          this.mediaCollectionOptions = {};
        }
        this.digitalEditionListService.getDigitalEditionsPromise().then((data) => {
          this.getCollectionsWithTOC(data, this.mediaCollectionOptions);
        })
      });
    } else {
      this.digitalEditionListService.getDigitalEditionsPromise().then((data) => {
        this.getCollectionsWithTOC(data);
      })
    }
  }

  getCollectionsWithoutTOC() {
    this.collectionsWithoutTOC = this._config.CollectionsWithoutTOC ?? [];
  }

  getCollectionsWithTOC(collections: any, media?: any) {
    if (this._config.show?.TOC?.MediaCollections && this.galleryInReadMenu) {
      collections.push(media);
    }
    if (!collections || !collections.length) {
      return;
    }

    if (!this._config.collections?.order) {
      collections = this.sortListRoman(collections);
    } else if (this._config.collections.order.length) {
      collections = this.sortListDefined(collections, this._config.collections.order);
    }

    const collectionsTmp = [] as any;
    const pdfCollections = [] as any;
    collections.forEach((collection: any) => {
      if (collection.id !== 'mediaCollections') {
        if (!(this.collectionsWithoutTOC.indexOf(collection.id) !== -1)) {
          collection['toc_exists'] = true;
          collection['expanded'] = false;
          collection['loading'] = false;
          collection['accordionToc'] = {
            toc: [],
            searchTocItem: false,
            searchTitle: '', // If toc item has to be searched by unique title also
            currentPublicationId: null
          };
        } else {
          collection['toc_exists'] = false;
        }

        collection['has_children_pdfs'] = this.collectionHasChildrenPdfs(collection.id);

        if (collection.id in this.collectionDownloads['pdf']) {
          collection['isDownload'] = true;
        } else collection['isDownload'] = collection.id in this.collectionDownloads['epub'];
        collection['highlight'] = false;
      }
      if (!collection['has_children_pdfs'] || !this.showBooks) {
        collectionsTmp.push(collection);
      } else {
        pdfCollections.push(collection);
      }
    });
    this.collectionsListWithTOC = collectionsTmp;

    if (this.showBooks) {
      this.pdfCollections = pdfCollections;
      this.pdfCollections?.sort(function (a, b) {
        if (a['title'] < b['title']) {
          return -1;
        }
        if (a['title'] > b['title']) {
          return 1;
        }
        return 0;
      });
    }
  }

  collectionHasChildrenPdfs(collectionID: any) {
    let hasChildrenPdfs = false;
    let childrenPdfs = this._config.collectionChildrenPdfs?.[collectionID] ?? [];

    if (childrenPdfs.length) {
      hasChildrenPdfs = true;
    }

    return hasChildrenPdfs;
  }

  sortListRoman(list: any) {
    for (const coll of list) {
      const romanNumeral = coll.title.split(' ')[0];
      coll['order'] = this.romanToInt(romanNumeral);
    }

    this.sortListByOrder(list)
    return list;
  }

  sortListDefined(list: any, sort: any[]) {
    for (const coll of list) {
      let order = sort.indexOf(coll.id);
      // If the sort order is not defined in the this._config, just set a high number
      // so that it will be at the end of the list.
      if (order === -1) {
        order = 9999;
      }
      coll['order'] = order;
    }

    this.sortListByOrder(list)
    return list;
  }

  sortListByOrder(list: any[]) {
    list.sort((a: any, b: any) => {
      if (typeof a['order'] === 'number') {
        return (a['order'] - b['order']);
      } else {
        return ((a['order'] < b['order']) ? -1 : ((a['order'] > b['order']) ? 1 : 0));
      }
    });
  }

  // getting side-menu structure
  async getAboutPages() {
    if (this._config.AboutMenuAccordion) {
      this.aboutOptionsMarkdown = await this.mdcontentService.getMarkdownMenu(this.activeLocale, this.aboutMenuMarkdownInfo.idNumber);
    }
  }

  initializeApp() {
    this.getStaticPagesMenus();
    this.getAboutPages();
  }

  romanToInt(str1: any) {
    if (str1 == null) {
      return -1;
    }

    let num = this.romanCharToInt(str1.charAt(0));
    let pre;
    let curr;

    for (let i = 1; i < str1.length; i++) {
      curr = this.romanCharToInt(str1.charAt(i));
      pre = this.romanCharToInt(str1.charAt(i - 1));
      if (curr <= pre) {
        num += curr;
      } else {
        num = num - pre * 2 + curr;
      }
    }

    return num;
  }

  romanCharToInt(c: any) {
    switch (c) {
      case 'I':
        return 1;
      case 'V':
        return 5;
      case 'X':
        return 10;
      case 'L':
        return 50;
      case 'C':
        return 100;
      case 'D':
        return 500;
      case 'M':
        return 1000;
      default:
        return -1;
    }
  }

  getCollectionList() {
    const loadCollectionsFromAssets = this._config.LoadCollectionsFromAssets ?? false;

    if (loadCollectionsFromAssets) {
      this.digitalEditionListService.getCollectionsFromAssets()
        .subscribe(digitalEditions => {
          this.categorizeCollections(digitalEditions);
        });
    } else {
      this.digitalEditionListService.getDigitalEditions()
        .subscribe(
          digitalEditions => {
            this.categorizeCollections(digitalEditions);
          },
          error => {
            this.errorMessage = <any>error
          }
        );
    }
  }

  getStaticPagesMenus() {
    this.staticPagesMenusInTOC = this._config.StaticPagesMenusInTOC ?? [];

    for (const menu of this.staticPagesMenusInTOC) {
      if (menu.menuID === 'aboutMenu') {
        this.aboutMenuMarkdownInfo = menu;
      }
    }
  }

  async getMediaCollections(): Promise<any> {
    return await this.galleryService.getGalleries(this.activeLocale);
  }

  toggleAccordion(value: string) {
    this.selectedMenu = this.selectedMenu === value ? '' : value;
  }

  categorizeCollections(collections: any) {
    if (this._config.collections?.order) {
      this.collectionsList = this._config.collections.order.map(() => [])

      this._config.collections.order.forEach((array: number[], index: number) => {
        array.forEach((item: number) => {
          const collectionIndex = collections.findIndex((collection: any) => collection.id === item);
          if (collectionIndex > -1) {
            this.collectionsList[index].push(collections[collectionIndex]);
            //reduce the size of collections for the next iteration
            collections.splice(collectionIndex, 1);
          }
        })
      })
    } else
      this.collectionsList = collections;
  }
}
