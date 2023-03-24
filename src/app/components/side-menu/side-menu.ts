import { ChangeDetectorRef, Component, Input, NgZone, OnInit } from '@angular/core';
import { Title } from "@angular/platform-browser";
import { NavigationEnd, Router } from "@angular/router";
import { AlertController, MenuController, Platform } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { DigitalEdition } from "../../models/digital-edition.model";
import { StorageService } from "../../services/storage/storage.service";
import { LanguageService } from "../../services/languages/language.service";
import { EventsService } from "../../services/events/events.service";
import { MdContentService } from "../../services/md/md-content.service";
import { UserSettingsService } from "../../services/settings/user-settings.service";
import { DigitalEditionListService } from "../../services/toc/digital-edition-list.service";
import { TableOfContentsService } from "../../services/toc/table-of-contents.service";
import { GalleryService } from "../../services/gallery/gallery.service";
import { MetadataService } from "../../services/metadata/metadata.service";
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
  searchTocItem = false;
  rootPage = 'HomePage';
  aboutPages: any[];
  language = 'sv';
  languages = [];
  appName?: string;
  errorMessage?: string;
  splitPane = false;
  collectionsList: any[] = [];
  collectionsListWithTOC?: any[];
  tocData: any;
  pdfCollections?: any[];
  currentContentName?: string;
  apiEndPoint: string;
  projectMachineName: string;
  staticPagesMenus = [] as any;
  staticPagesMenusInTOC: any = [];
  collectionsWithoutTOC: Array<Number> = [];
  tocLoaded = false;
  collectionDownloads: any;

  currentCollectionId: any = '';
  currentCollectionName = '';
  currentCollection: any;
  openCollectionFromToc = false;

  pageFirstLoad = true;

  accordionTOC = false;
  accordionMusic = false;

  defaultSelectedItem: String = 'title';

  songTypesMenuMarkdownInfo: any;
  aboutMenuMarkdownInfo: any;

  aboutMenuMarkdown = false;

  currentAccordionMenu: any = null;

  splitPaneOpen = false;
  pagesThatShallShow = {
    tocMenu: ['FeaturedFacsimilePage'],
    tableOfContentsMenu: ['SingleEditionPage', 'CoverPage', 'TitlePage', 'ForewordPage', 'IntroductionPage'],
    aboutMenu: ['AboutPage'],
    contentMenu: ['HomePage', 'EditionsPage', 'ContentPage', 'MusicPage', 'FeaturedFacsimilePage', 'ElasticSearchPage']
  }

  public options?: any;
  mediaCollectionOptions: any;

  aboutOptionsMarkdown: {
    title: string;
    [key: string]: any
  };

  simpleAccordionsExpanded = {
    musicAccordion: false,
    songTypesAccordion: false,
    galleryAccordion: false,
    collectionsAccordion: [false],
    aboutMenuAccordion: false,
    pdfAccordion: false,
    epubs: false
  }

  showBooks = false;
  tocItems?: any;

  availableEpubs: any[];
  epubNames: any[];

  galleryInReadMenu = true;
  splitReadCollections: Number[][] = [];

  tocPersonSearchSelected = false;
  tocPlaceSearchSelected = false;
  tocTagSearchSelected = false;
  tocWorkSearchSelected = false;
  tocHomeSelected = false;
  selectedMenu: string = '';

  constructor(
    public platform: Platform,
    public translate: TranslateService,
    public storage: StorageService,
    public languageService: LanguageService,
    private menu: MenuController,
    public events: EventsService,
    public mdcontentService: MdContentService,
    private userSettingsService: UserSettingsService,
    public titleService: Title,
    public digitalEditionListService: DigitalEditionListService,
    protected tableOfContentsService: TableOfContentsService,
    public cdRef: ChangeDetectorRef,
    private alertCtrl: AlertController,
    private galleryService: GalleryService,
    private metadataService: MetadataService,
    private ngZone: NgZone,
    private router: Router,
  ) {
    this.mediaCollectionOptions = {};

    this.aboutPages = [];
    this.apiEndPoint = this._config.app?.apiEndpoint ?? '';
    this.collectionDownloads = this._config.collectionDownloads ?? undefined;
    this.projectMachineName = this._config.app?.machineName ?? '';
    try {
      this.showBooks = this._config.show?.TOC?.Books;
    } catch (e) {
      this.showBooks = false;
    }

    this.splitReadCollections = this._config.show?.TOC?.splitReadCollections || [];

    this.aboutMenuMarkdownConfig();

    this.accordionTOC = this._config.AccordionTOC ?? false;
    this.openCollectionFromToc = this._config.OpenCollectionFromToc ?? false;
    this.galleryInReadMenu = this._config.ImageGallery?.ShowInReadMenu ?? true;
    this.availableEpubs = this._config.AvailableEpubs ?? undefined;
    if (this.availableEpubs !== undefined) {
      this.epubNames = Object.keys(this.availableEpubs);
    } else {
      this.availableEpubs = [];
      this.epubNames = [];
    }
    this.unSelectAllEpubsInToc();

    this.defaultSelectedItem = this._config.defaultSelectedItem ?? 'title';

    this.getCollectionsWithoutTOC();
    this.registerEventListeners();
    this.getCollectionList();
    // If we have MediaCollections we need to add these first

    this.setDefaultOpenAccordions();
  }

  ngOnInit() {
    const menuArray = ['/content', '/epub', '/publication', '/media-collection', '/tag-search', '/work-search', '/person-search', '/place-search']
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(event => {
      this.selectedMenu = menuArray.find(item => (event as any).url.includes(item)) || '/';
      if (this.selectedMenu === '/publication') {
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

  aboutMenuMarkdownConfig() {
    this.aboutMenuMarkdown = this._config.AboutMenuAccordion ?? false;
  }

  getCollectionsWithoutTOC() {
    this.collectionsWithoutTOC = this._config.CollectionsWithoutTOC ?? [];
  }

  showSplitPane() {
    this.splitPaneOpen = true;

    this.closeSplitPane();
  }

  closeSplitPane() {
    setTimeout(() => {
      const shadow = document.querySelector('.shadow');

      if (shadow !== null) {
        shadow.addEventListener('click', () => {
          if (this.splitPaneOpen) {
            this.splitPaneOpen = false;
          }
        });
      }
    }, 1);
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

    list.sort((a: any, b: any) => {
      if (typeof a['order'] === 'number') {
        return (a['order'] - b['order']);
      } else {
        return ((a['order'] < b['order']) ? -1 : ((a['order'] > b['order']) ? 1 : 0));
      }
    });

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

    list.sort((a: any, b: any) => {
      if (typeof a['order'] === 'number') {
        return (a['order'] - b['order']);
      } else {
        return ((a['order'] < b['order']) ? -1 : ((a['order'] > b['order']) ? 1 : 0));
      }
    });

    return list;
  }

  setDefaultOpenAccordions() {
    if (!this.accordionTOC || !this.accordionMusic) {
      return;
    }

    this.simpleAccordionsExpanded.songTypesAccordion = this._config.AccordionsExpandedDefault?.SongTypes ?? false;
    this.simpleAccordionsExpanded.musicAccordion = this._config.AccordionsExpandedDefault?.Music ?? false;
    for (let i = 0; i < this.splitReadCollections.length; i++) {
      this.simpleAccordionsExpanded.collectionsAccordion[i] = this._config.AccordionsExpandedDefault?.Collections ?? false;
    }
  }

  // getting side-menu structure
  async getAboutPages() {
    if (this.aboutMenuMarkdown) {
      this.aboutOptionsMarkdown = await this.mdcontentService.getMarkdownMenu(this.language, this.aboutMenuMarkdownInfo.idNumber);
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.languageService.getLanguage().subscribe((lang: string) => {
        this.language = lang;
        this.appName = this._config.app?.name?.[lang] ?? '';
        this.titleService.setTitle(this.appName as string);
        this.getStaticPagesMenus();
        this.setRootPage();
        this.getAboutPages();
      });
      this.events.publishPdfviewOpen({'isOpen': false});
    });

    // Try to remove META-Tags
    this.metadataService.clearHead();
    // Add the new META-Tags
    this.metadataService.addDescription();
    this.metadataService.addKeywords();
  }

  unSelectCollectionWithChildrenPdf() {
    if (this.collectionsListWithTOC !== undefined) {
      try {
        for (const collection of this.collectionsListWithTOC) {
          if (collection.has_children_pdfs && collection.highlight) {
            collection.highlight = false;
          }
        }
      } catch (e) {
        // handle error
      }
    }
  }

  registerEventListeners() {
    this.events.getDigitalEditionListOpen().subscribe((collection: any) => {
      console.log('listened to digital-edition-list:open');
      if (String(collection.id).endsWith('.epub')) {
        this.openPage('epub', null, collection.id);
      } else {
        this.openCollection(collection);
      }
    })
    this.events.getCollectionWithChildrenPdfsHighlight().subscribe((collectionID: any) => {
      if (this.collectionsListWithTOC !== undefined && this.collectionsListWithTOC) {
        for (const collection of this.collectionsListWithTOC) {
          if (String(collection.id) === String(collectionID)) {
            collection['highlight'] = true;
            const selectedMenu = 'collectionsWithChildrenPdfs';
            this.currentAccordionMenu = selectedMenu;
            this.events.publishSelectedItemInMenu({
              menuID: selectedMenu,
              component: 'app-component'
            });
            for (let i = 0; i < this.splitReadCollections.length; i++) {
              this.simpleAccordionsExpanded.collectionsAccordion[i] = true;
            }
          } else {
            collection['highlight'] = false;
          }
        }
      }
    });

    this.events.getExitActiveCollection().subscribe(() => {
      this.enableContentMenu();
      // Try to close all the expanded Collections
      try {
        // Check if we have many Read Collections, if so, minimize all
        if (this.splitReadCollections.length > 1) {
          for (let i = 0; i < this.splitReadCollections.length; i++) {
            this.simpleAccordionsExpanded.collectionsAccordion[i] = false;
          }
          this.cdRef.detectChanges();
        }
      } catch (e) {
      }
    });

    // Unselect accordion items that doesn't belong to current menu
    this.events.getSelectedItemInMenu().subscribe((menu: any) => {
      // console.log('subscription to selected toc item in app.component activated', menu);
      if (menu.component === 'table-of-contents-accordion-component' || this.currentAccordionMenu !== menu.menuID) {
        this.unSelectCollectionWithChildrenPdf();
        this.tocHomeSelected = false;
        this.tocPersonSearchSelected = false;
        this.tocPlaceSearchSelected = false;
        this.tocTagSearchSelected = false;
        this.tocWorkSearchSelected = false;
        this.unSelectAllMediaCollectionsInToc();
        this.unSelectAllEpubsInToc();
      }
      if (menu && menu.component && menu.menuID) {
        if (menu.component === 'home') {
          this.tocHomeSelected = true;
        } else if (menu.component === 'person-search') {
          this.tocPersonSearchSelected = true;
        } else if (menu.component === 'place-search') {
          this.tocPlaceSearchSelected = true;
        } else if (menu.component === 'tag-search') {
          this.tocTagSearchSelected = true;
        } else if (menu.component === 'work-search') {
          this.tocWorkSearchSelected = true;
        } else if (menu.component === 'media-collections') {
          this.selectMediaCollectionInToc('all');
          this.simpleAccordionsExpanded.galleryAccordion = true;
        } else if (menu.component === 'media-collection') {
          this.selectMediaCollectionInToc(menu.menuID);
          this.simpleAccordionsExpanded.galleryAccordion = true;
        } else if (menu.component === 'page-epub') {
          this.selectEpubInToc(menu.menuID);
          this.simpleAccordionsExpanded.epubs = true;
        }
      }
    });
    this.events.getCollectionsAccordionChange().subscribe((data: any) => {
      if (!data) {
        return;
      }

      const expand = data.expand;

      // Check if there is a need to expand
      // Otherwise we might change smth after user clicks on accordion
      for (let i = 0; i < this.splitReadCollections.length; i++) {
        if (expand && !this.simpleAccordionsExpanded.collectionsAccordion[i]) {
          this.simpleAccordionsExpanded.collectionsAccordion[i] = true;
        } else if (!expand && this.simpleAccordionsExpanded.collectionsAccordion) {
          this.simpleAccordionsExpanded.collectionsAccordion[i] = false;
        }
      }
      this.cdRef.detectChanges();
    });
    this.events.getTypesAccordionChange().subscribe((data: any) => {
      if (!data) {
        return;
      }

      const expand = data.expand;

      // Check if there is a need to expand
      // Otherwise we might change smth after user clicks on accordion
      if (expand && !this.simpleAccordionsExpanded.songTypesAccordion) {
        this.simpleAccordionsExpanded.songTypesAccordion = true;
      } else if (!expand && this.simpleAccordionsExpanded.songTypesAccordion) {
        this.simpleAccordionsExpanded.songTypesAccordion = false;
      }

      // If music accordion isn't open by default, we've to open it as well
      // since SongTypesAccordion is a child to MusicAccordion
      if (expand && !this.simpleAccordionsExpanded.musicAccordion) {
        this.simpleAccordionsExpanded.musicAccordion = true;
      }
    });
    this.events.getAboutAccordionChange().subscribe((data: any) => {
      if (!data) {
        return;
      }

      const expand = data.expand;

      if (expand && !this.simpleAccordionsExpanded.aboutMenuAccordion) {
        this.simpleAccordionsExpanded.aboutMenuAccordion = true;
      } else if (!expand && this.simpleAccordionsExpanded.aboutMenuAccordion) {
        this.simpleAccordionsExpanded.songTypesAccordion = false;
      }
    });
    const that = this;
    this.events.getTableOfContentsLoaded().subscribe((data: any) => {
      if (data === undefined || data.tocItems === undefined) {
        console.log('undefined toc-data listening to tableOfContents:loaded in app.component.ts', data);
      }
      this.tocData = data;
      this.tocLoaded = true;

      if (this.collectionsListWithTOC === undefined || this.collectionsListWithTOC.length < 1) {
        console.log('undefined or 0 length collectionsListWithTOC listening to tableOfContents:loaded in app.component.ts. ');
        // In the rare occasion that collections haven't had time to load we need to wait for them, otherwise the TOC will be empty
        this.ngZone.runOutsideAngular(() => {
          let iterationsLeft = 6;
          const intervalTimerId = window.setInterval(function () {
            if (iterationsLeft < 1) {
              that.ngZone.run(() => {
                that.setTocDataWhenSubscribingToTocLoadedEvent(data);
              });
              clearInterval(intervalTimerId);
            } else {
              iterationsLeft -= 1;
              if (that.collectionsListWithTOC !== undefined && that.collectionsListWithTOC.length > 0) {
                that.ngZone.run(() => {
                  that.setTocDataWhenSubscribingToTocLoadedEvent(data);
                });
                clearInterval(intervalTimerId);
              }
            }
          }.bind(this), 1000);
        });
      } else {
        this.setTocDataWhenSubscribingToTocLoadedEvent(data);
      }
    });

    this.events.getExitedTo().subscribe((page: any) => {
      this.setupPageSettings(page);
    });

    this.events.getIonViewWillEnter().subscribe((currentPage: any) => {
      this.tocLoaded = false;
      const homeUrl = document.URL.indexOf('/home');
      if (homeUrl >= 0) {
        this.setupPageSettings(currentPage);
      } else if (document.URL.indexOf('/') > 0) {
        if (!this.splitPaneOpen && this.pageFirstLoad) {
          this.showSplitPane();
          this.pageFirstLoad = false;
        }
      }
    });

    this.events.getIonViewWillLeaves();

    this.events.getIonViewDidLeave();

    this.events.getTopMenuContent().subscribe(() => {
      this.events.publishSelectedItemInMenu({
        menuID: 'topMenu',
        component: 'app-component'
      });
      this.currentContentName = 'Digital Publications';
      const params = {};
      this.enableContentMenu();
      this.router.navigate(['/publications'], {queryParams: params});
    });
    this.events.getTopMenuAbout().subscribe(() => {
      this.events.publishSelectedItemInMenu({
        menuID: 'topMenu',
        component: 'app-component'
      });
      this.enableAboutMenu();
      this.languageService.getLanguage().subscribe((lang: string) => {
        this.language = lang;

        if (this.aboutMenuMarkdown && this.aboutOptionsMarkdown.children && this.aboutOptionsMarkdown.children.length) {
          let firstAboutPageID = this.aboutOptionsMarkdown.children[0].id;
          if (
            this._config.page?.about?.markdownFolderNumber !== undefined &&
            this._config.page?.about?.initialPageNode !== undefined
          ) {
            firstAboutPageID = this.language + '-' + this._config.page.about.markdownFolderNumber + '-' + this._config.page.about.initialPageNode;
          } else {
            if (this.aboutOptionsMarkdown.children[0].type === 'folder') {
              firstAboutPageID = this.aboutOptionsMarkdown.children[0].children[0].id;
            }
          }
          this.openStaticPage(firstAboutPageID);
        } else {

          this.enableAboutMenu();
          if (
            this._config.page?.about?.markdownFolderNumber === undefined ||
            this._config.page?.about?.initialPageNode === undefined
          ) {
            this.staticPagesMenus['initialAboutPage'] = this.language + '-03-01';
          } else {
            this.staticPagesMenus['initialAboutPage'] = this.language + '-' + this._config.page.about.markdownFolderNumber + '-' + this._config.page.about.initialPageNode;
          }
          this.openStaticPage(this.staticPagesMenus['initialAboutPage']);
        }
      });
    });

    this.events.getTopMenuFront().subscribe(() => {
      this.events.publishSelectedItemInMenu({
        menuID: 'topMenu',
        component: 'app-component'
      });

      this.enableContentMenu();
      // Try to close all the expanded accordions in toc
      try {
        for (let i = 0; i < this.splitReadCollections.length; i++) {
          this.simpleAccordionsExpanded.collectionsAccordion[i] = false;
        }
        this.simpleAccordionsExpanded.aboutMenuAccordion = false;
        this.simpleAccordionsExpanded.epubs = false;
        this.simpleAccordionsExpanded.galleryAccordion = false;
        this.simpleAccordionsExpanded.musicAccordion = false;
        this.simpleAccordionsExpanded.pdfAccordion = false;
        this.simpleAccordionsExpanded.songTypesAccordion = false;
        this.cdRef.detectChanges();
      } catch (e) {
      }
      const params = {};
      this.router.navigate(['/home'], {queryParams: params});
    });

    this.events.getDigitalEditionListRecieveData().subscribe((data: any) => {
      this.categorizeCollections(data.digitalEditions);
      // if (this._config.SortCollectionsByRomanNumerals) {
      //   this.sortCollectionsRoman();
      // }
    });

    this.events.getPdfviewOpen().subscribe((params: any) => {
      this.storage.set('pdfIsOpen', Boolean(params['isOpen']));
    });

    this.events.getLanguageStaticChange().subscribe(() => {
      this.languageService.getLanguage().subscribe((lang: string) => {
        this.language = lang;
        this.getStaticPagesMenus();
        this.getAboutPages();
      });
    });

    this.events.getTopMenuElasticSearch().subscribe(() => {
      const params = {};
      this.router.navigate(['/elastic-search'], {queryParams: params});
      this.tocLoaded = true;
      this.enableContentMenu();
    });
  }

  setTocDataWhenSubscribingToTocLoadedEvent(data: any) {
    if (data.searchTocItem && this.collectionsListWithTOC !== undefined) {
      for (const collection of this.collectionsListWithTOC) {

        if ((data.collectionID !== undefined && String(collection.id) === String(data.collectionID.id))
          || (data.collectionID !== undefined && Number(collection.id) === Number(data.collectionID))) {
          collection.expanded = true;
          for (let i = 0; i < this.splitReadCollections.length; i++) {
            this.simpleAccordionsExpanded.collectionsAccordion[i] = true;
          }

          if (data.chapterID) {
            data.itemId = Number(data.collectionID) + '_' + Number(data.publicationID) + '_' + data.chapterID;
          }

          if (data.itemId === undefined && data.collectionID !== undefined && data.publicationID !== undefined) {
            data.itemId = String(data.collectionID) + '_' + String(data.publicationID);
          }

          let dataPublicationID = data.publicationID;
          if (dataPublicationID) {
            dataPublicationID = Number(dataPublicationID);
          }
          let dataCollectionID = data.collectionID;
          if (dataCollectionID) {
            dataCollectionID = Number(dataCollectionID);
          }

          collection.accordionToc = {
            toc: data.tocItems.children,
            searchTocItem: true,
            searchItemId: data.itemId,
            searchPublicationId: dataPublicationID,
            searchCollectionId: dataCollectionID,
            searchTitle: null
          }
          collection.accordionToc.toc = data.tocItems.children;
          this.currentCollection = collection;
          break;
        }
      }
    }
    if (data.tocItems.children !== undefined) {
      this.options = data.tocItems.children;
    } else {
      this.options = data.tocItems;
    }
    if (data.tocItems && data.tocItems.collectionId !== undefined) {
      this.currentCollectionId = data.tocItems.collectionId;
    } else if (data.collectionID !== undefined) {
      this.currentCollectionId = data.collectionID;
    }
    if (data.tocItems.text === undefined) {
      this.currentCollectionName = 'media';
      this.currentCollection.title = 'media';
    } else {
      this.currentCollectionName = data.tocItems.text;
    }

    this.enableTableOfContentsMenu();
  }

  doFor(needle: any, haystack: any, callback: any) {
    for (const straw of haystack) {
      if (straw === needle) {
        callback();
      }
    }
  }

  setupPageSettings(currentPage: any) {
    const p = currentPage;
    const pagesWith = this.pagesThatShallShow;

    this.doFor(p, pagesWith.tocMenu, () => {
      this.enableTableOfContentsMenu();
    });

    this.doFor(p, pagesWith.tableOfContentsMenu, () => {
      console.log('Enabling TOC Menu for', p, this.openCollectionFromToc);
      if (this.openCollectionFromToc) {
        this.enableTableOfContentsMenu();
      }
    });

    this.doFor(p, pagesWith.aboutMenu, () => {
      console.log('enabling about menu for ' + p);
      this.enableAboutMenu();

    });

    this.doFor(p, pagesWith.contentMenu, () => {
      console.log('enabling content menu for ' + p);
      this.enableContentMenu();
    });
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
    this.staticPagesMenus = this._config.StaticPagesMenus ?? [];
    this.staticPagesMenusInTOC = this._config.StaticPagesMenusInTOC ?? [];

    for (const menu of this.staticPagesMenusInTOC) {
      if (menu.menuID === 'songTypesMenu') {
        this.songTypesMenuMarkdownInfo = menu;
      } else if (menu.menuID === 'aboutMenu') {
        this.aboutMenuMarkdownInfo = menu;
      }
    }
  }

  setRootPage() {
    const homeUrl = document.URL.indexOf('/home');
    if (homeUrl >= 0 || document.URL.indexOf('#') < 0) {
      this.rootPage = 'HomePage';
    }
  }

  enableContentMenu() {
    this.menu.enable(true, 'contentMenu');
  }

  enableAboutMenu() {
    this.menu.enable(true, 'aboutMenu');
  }

  enableTableOfContentsMenu() {
    if (this.tocLoaded) {
      console.log('Toc is loaded');
      try {
        this.menu.enable(true, 'tableOfContentsMenu');
        if (this.platform.is('desktop')) {
          this.events.publishTitleLogoShow(true);
        } else {
          this.events.publishTitleLogoShow(false);
        }
      } catch (e) {
        console.log('error att App.enableTableOfContentsMenu');
      }
    } else {
      console.log('Toc is not loaded');
    }
    this.cdRef.detectChanges();
  }

  openStaticPage(id: string) {
    this.router.navigate([`/content/${id}`]);
  }

  openPage(page: any, selectedMenu?: any, selectedFile?: any) {
    if (selectedMenu) {
      this.unSelectCollectionWithChildrenPdf();
      // Notify other menus to unselect selected items
      this.currentAccordionMenu = selectedMenu;
      this.events.publishSelectedItemInMenu({
        menuID: selectedMenu,
        component: 'app-component'
      });
    }
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    /*if ( this.platform.is('mobile') ) {
      this.events.publish('splitPaneToggle:disable');
    }*/
    try {
      this.router.navigate([`/${page}/${selectedFile}`]);
    } catch (e) {
      console.error('Error opening page');
    }
  }

  openFirstPage(collection: DigitalEdition) {
    const params = {tocItem: null, fetch: false, collection: {title: collection.title}} as any;
    params['collectionID'] = collection.id;

    /*
    try {
      params['publicationID'] = String(this.tocItems['children'][0]['itemId']).split('_')[1];
    } catch (e) {
      params['publicationID'] = '1';
    }
    */

    // Search the toc for the first item with itemId. This method is not perfect:
    // it's depth first and changes the top level branch every time a sub branch reaches
    // its end without finding an itemId. But it should be sufficient in practice.
    let tocLength = 0;
    if (this.tocItems) {
      tocLength = this.tocItems['children'].length;
    }
    let currentTocTier = 0;
    let currentTocItem = this.tocItems['children'][0];
    let tocItemId = this.tocItems['children'][0]['itemId'];
    while (tocItemId === undefined) {
      if (currentTocItem['children'] !== undefined) {
        currentTocItem = currentTocItem['children'][0];
        if (currentTocItem !== undefined) {
          tocItemId = currentTocItem['itemId'];
        } else {
          tocItemId = undefined;
        }
      } else if ((currentTocItem['children'] === undefined && currentTocTier < tocLength - 1)
        || (currentTocItem === undefined && currentTocTier < tocLength - 1)) {
        currentTocTier = currentTocTier + 1;
        currentTocItem = this.tocItems['children'][currentTocTier];
        if (currentTocItem !== undefined) {
          tocItemId = currentTocItem['itemId'];
        } else {
          tocItemId = undefined;
        }
      } else if ((currentTocItem === undefined && currentTocTier >= tocLength)
        || (currentTocItem['children'] === undefined && currentTocTier >= tocLength)) {
        break;
      }
    }

    if (tocItemId !== undefined) {
      const itemIdparts = String(tocItemId).split('_');
      if (itemIdparts.length > 2) {
        params['publicationID'] = itemIdparts[1];
        params['chapterID'] = itemIdparts[2];
      } else if (itemIdparts.length > 1) {
        params['publicationID'] = itemIdparts[1];
        params['chapterID'] = 'nochapter';
      } else {
        params['publicationID'] = 'first';
      }
    } else {
      params['publicationID'] = 'first';
    }

    console.log('Opening read from App.openFirstPage()');
    // TODO Sami
    this.router.navigate(['/read'], {queryParams: params});
  }

  getTocRoot(collection: DigitalEdition) {
    this.tableOfContentsService.getTableOfContents(collection.id)
      .subscribe(
        tocItems => {
          this.tocItems = tocItems;
          this.openFirstPage(collection);
        },
        error => {
          this.errorMessage = <any>error
        });
  }

  openCollection(collection: any) {
    if (!this._config.HasCover && !this._config.HasTitle && !this._config.HasForeword && !this._config.HasIntro) {
      this.getTocRoot(collection);
    } else {
      const downloadOnly = this._config.collectionDownloads?.isDownloadOnly ?? false;
      if (collection.isDownload && downloadOnly) {
        if (collection.id in this.collectionDownloads['pdf']) {
          const dURL = this.apiEndPoint + '/' + this.projectMachineName + '/files/' + collection.id + '/pdf/' +
            this.collectionDownloads['pdf'][collection.id] + '/';
        } else if (collection.id in this.collectionDownloads['epub']) {
          const dURL = this.apiEndPoint + '/' + this.projectMachineName + '/files/' + collection.id + '/epub/' +
            this.collectionDownloads['epub'][collection.id] + '/';
        }
      } else {
        this.currentContentName = collection.title;
        this.collectionsListWithTOC?.forEach((coll) => {
          if (coll.id === collection.id) {
            collection = coll;
          }
        })
        if (!collection.id || collection.isDownloadOnly) {
          // Open collection in single-edition page
          const params = {collection: JSON.stringify(collection), fetch: 'false'};
          this.router.navigate([`publication-toc/${collection.id}`], {queryParams: params});
        }
      }
      this.cdRef.detectChanges();
    }
    if (this.openCollectionFromToc) {
      this.currentCollection = collection;
      try {
        // if (this.options) {
        this.enableTableOfContentsMenu();
        // }
      } catch (e) {
        console.log('Error enabling enableTableOfContentsMenu');
      }
    }
    this.currentCollectionId = collection.id;
    if (collection.id === 'mediaCollections') {
      collection.title = 'media';
    }
    this.cdRef.detectChanges();
  }

  async getMediaCollections(): Promise<any> {
    return await this.galleryService.getGalleries(this.language);
  }

  selectMediaCollectionInToc(id: string) {
    if (id && this.mediaCollectionOptions
      && this.mediaCollectionOptions['accordionToc'] && this.mediaCollectionOptions['accordionToc']['toc']) {
      this.mediaCollectionOptions['accordionToc']['toc'].forEach((element: any) => {
        element.highlight = id === element.id;
      });
    }
  }

  unSelectAllMediaCollectionsInToc() {
    if (this.mediaCollectionOptions
      && this.mediaCollectionOptions['accordionToc'] && this.mediaCollectionOptions['accordionToc']['toc']) {
      this.mediaCollectionOptions['accordionToc']['toc'].forEach((element: any) => {
        element.highlight = false;
      });
    }
  }

  selectEpubInToc(filename: string) {
    if (filename && this.epubNames.length) {
      this.epubNames.forEach(name => {
        this.availableEpubs[name]['highlight'] = this.availableEpubs[name]['filename'] === filename;
      });
    }
  }

  unSelectAllEpubsInToc() {
    if (this.epubNames.length) {
      this.epubNames.forEach(name => {
        this.availableEpubs[name]['highlight'] = false;
      });
    }
  }

  toggleAccordion(value: string) {
    this.selectedMenu = this.selectedMenu === value ? '' : value;
  }

  categorizeCollections(collections: any) {
    if (this._config.collections?.order) {
      this.collectionsList = this._config.collections.order.map((item: any, index: number) => ({
        id: `Read${index + 1}`,
        children: [],
        title: `TOC.Read${index + 1}`
      }))
      collections.forEach((collection: any) => {
        let index = this._config.collections.order.findIndex((item: number[]) => item.includes(collection.id));
        index > -1 && this.collectionsList[index].children.push(collection);
      })
    } else
      this.collectionsList = collections;
  }
}
