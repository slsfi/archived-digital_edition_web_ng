import { Component, Input, Output, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation, OnInit } from '@angular/core';
import { Platform, Events, App, LoadingController } from 'ionic-angular';
import { MenuOptionModel } from '../../app/models/menu-option.model';
import { SideMenuSettings } from '../../app/models/side-menu-settings';
import { SideMenuRedirectEvent, SideMenuRedirectEventData } from '../../app/models/sidemenu-redirect-events';
import { Storage } from '@ionic/storage';
import { GeneralTocItem } from '../../app/models/table-of-contents.model';
import { TocAccordionMenuOptionModel } from '../../app/models/toc-accordion-menu-option.model';
import { InnerMenuOptionModel } from '../../app/models/inner-menu-option.model';
import { ConfigService,  } from '@ngx-config/core';
import { LanguageService } from '../../app/services/languages/language.service';
import { UserSettingsService } from '../../app/services/settings/user-settings.service';
import { ThrowStmt } from '@angular/compiler';
import { TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MetadataService } from '../../app/services/metadata/metadata.service';
import { TextService } from '../../app/services/texts/text.service';

@Component({
  selector: 'table-of-contents-accordion',
  templateUrl: 'table-of-contents-accordion.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class TableOfContentsAccordionComponent {
  // Main inputs
  public menuSettings: SideMenuSettings;
  public menuOptions: Array<TocAccordionMenuOptionModel>;
  public selectedOption: InnerMenuOptionModel;
  public collapsableItems: Array<InnerMenuOptionModel> = [];

  @Input('options')
  set options(value: {
    toc: Array<MenuOptionModel>,
    searchTocItem?: Boolean,
    searchPublicationId?: Number,
    searchItemId?: String,
    searchTitle?: String
  }) {
    // console.log('toc accordion options:', value);
    if (value && value.toc && value.toc.length > 0) {
      if (value.searchTocItem !== undefined && value.searchTocItem === true) {
        this.searchingForTocItem = true;
      }
      this.menuOptions = value.toc;
      this.collapsableItems = new Array<InnerMenuOptionModel>();

      let foundSelected = false;
      // Map the options to our internal models
      this.menuOptions.forEach(option => {
        const innerMenuOption = InnerMenuOptionModel.fromMenuOptionModel(option, null, false, value.searchTocItem);
        // console.log(innerMenuOption);
        if ( this.collapsableItems.indexOf(innerMenuOption) === -1 ) {
          this.collapsableItems.push(innerMenuOption);
        }

        // Check if there's any option marked as selected
        if (option.selected) {
          this.selectedOption = innerMenuOption;
          foundSelected = true;
        } else if (innerMenuOption.childrenCount) {
          innerMenuOption.subOptions.forEach(subItem => {
            if (subItem.selected) {
              this.selectedOption = subItem;
              foundSelected = true;
            }
          });
        }
      });

      if ( !foundSelected ) {
      } else {
        console.log('accordion toc options input: found menu item');
      }

      if (value.searchTocItem !== undefined && value.searchTocItem) {
        // Find toc item and open its parents
        if (value.searchItemId) {
          value.searchItemId = String(value.searchItemId).replace('_nochapter', '').replace(':chapterID', '');
          if ( String(value.searchItemId).indexOf(';pos') !== -1 ) {
            // Remove the position anchor from search if defined
            // value.searchItemId = String(value.searchItemId).split(';pos')[0];
          }
          // Try to find the correct position in the TOC. If not found, try to find the nearest.
          if ( this.findTocByPubOnly(this.collapsableItems, value.searchItemId) === false ) {
            value.searchItemId = String(value.searchItemId).split(';pos')[0];
            this.findTocByPubOnly(this.collapsableItems, value.searchItemId);
          }
          this.events.publish('typesAccordion:change', {
            expand: true
          });
        } else if (value.searchPublicationId && value.searchTitle) {
          this.findTocByPubAndTitle(this.collapsableItems, value.searchPublicationId, value.searchTitle);
          this.events.publish('typesAccordion:change', {
            expand: true
          });
        }

        /**
         * ! SK 18.5.2022 I'm disabling this emptying of children in other branches for now since
         * ! it causes several problems that I haven't found workarounds for yet. Rendering doesn't
         * ! seem to be slower, so I'm not sure this is even necessary.
         */

        if (this.foundTocItem) {
          // Empty children in all other branches in this toc tree for faster rendering
          // If collapsable item is important, it's only showing necessary parents and children for current toc item
          for (let i = 0; i < this.collapsableItems.length; i++) {
            if (!this.collapsableItems[i].important) {
              const innerMenuOptionWithoutChildren = InnerMenuOptionModel.fromMenuOptionModel(this.menuOptions[i], null, false, false);
              this.collapsableItems[i] = innerMenuOptionWithoutChildren;
            }
          }
          // console.log('collapsable items', this.collapsableItems);
        }

      }
      this.searchingForTocItem = false;
    }
    this.activeMenuTree = this.collapsableItems;
  }

  @Input('settings')
  set settings(value: SideMenuSettings) {
    if (value) {
      this.menuSettings = value;
      this.mergeSettings();
    }
  }

  @Input() collectionId: string;
  @Input() collectionName: string;
  @Input() showBackButton?: Boolean;
  @Input() isMarkdown?: Boolean;
  @Input() defaultSelectedItem?: String;
  @Input() isGallery?: Boolean;
  @Input() open: Boolean;
  @Output() selectOption = new EventEmitter<any>();

  // All children will be stored here in order to reduce lag
  // They will be used everytime a parent is toggled in toggleItemOptions
  childrenToc = {};
  searchChildrenToc = {};
  // childrenTocIdCounter = 1;

  currentItem: GeneralTocItem;
  currentOption: any;
  searchingForTocItem = false;
  searchTocItemInAccordionByTitle = false;
  tocItemSearchChildrenCounter = 0;
  foundTocItem = false;
  coverSelected: boolean;
  titleSelected: boolean;
  forewordSelected: boolean;
  introductionSelected: boolean;
  root: any;
  hasCover: boolean;
  hasTitle: boolean;
  hasForeword: boolean;
  hasIntro: boolean;
  playmanTraditionPageInMusicAccordion = false;
  playmanTraditionPageID = '03-03';

  chronologicalOrderActive: boolean;
  thematicOrderActive = true;
  alphabethicOrderActive: boolean;

  visibleactiveMenuTree = [];
  visibleTitleStack = [];

  chronologicalactiveMenuTree = [];
  chronologicalTitleStack = [];

  alphabeticalactiveMenuTree: any[];
  alphabeticalTitleStack: any[];

  activeMenuTree = [];

  sortableLetters = [];
  sortSelectOptions: Record<string, any> = {};

  constructor(
    public platform: Platform,
    public events: Events,
    public cdRef: ChangeDetectorRef,
    protected storage: Storage,
    public app: App,
    public loadingCtrl: LoadingController,
    public config: ConfigService,
    public languageService: LanguageService,
    public userSettingsService: UserSettingsService,
    public translate: TranslateService,
    public metadataService: MetadataService,
    protected textService: TextService
  ) {
  }

  constructAlphabeticalTOC(data) {
    this.alphabeticalactiveMenuTree = [];
    this.alphabeticalTitleStack = [];
    const list = this.flattenList(data.tocItems);

    for (const child of list) {
        if (child.type !== 'section_title' && child.type !== 'subtitle') {
            this.alphabeticalactiveMenuTree.push(child);
        }
    }

    this.alphabeticalactiveMenuTree.sort(
      (a, b) =>
        (a.text !== undefined && b.text !== undefined) ?
          ((String(a.text).toUpperCase() < String(b.text).toUpperCase()) ? -1 :
          (String(a.text).toUpperCase() > String(b.text).toUpperCase()) ? 1 : 0) : 0
      );
      this.storage.set('toc_alfabetical_' + data['collectionID'], this.alphabeticalactiveMenuTree);
  }

  constructChronologicalTOC(data) {
    this.chronologicalactiveMenuTree = [];
    this.chronologicalTitleStack = [];

    const list = this.flattenList(data.tocItems);

    for (const child of list) {
        if (child.date && child.type !== 'section_title' && child.type !== 'subtitle') {
            this.chronologicalactiveMenuTree.push(child);
        }
    }

    this.chronologicalactiveMenuTree.sort((a, b) => (a.date < b.date) ? -1 : (a.date > b.date) ? 1 : 0);
    let prevYear = '';

    const itemArray = [];
    let childItems = [];
    for ( let i = 0; i < this.chronologicalactiveMenuTree.length; i++) {
      const item = this.chronologicalactiveMenuTree[i];
      const currentYear = String(item['date']).slice(0, 4);
      if ( prevYear === '' ) {
        prevYear = currentYear;
        itemArray.push({type: 'section_title', text: prevYear, subOptions: []});
      }

      if ( prevYear !==  currentYear ) {
        itemArray[itemArray.length - 1].subOptions = childItems;
        itemArray[itemArray.length - 1].childrenCount = true;
        childItems = [];
        prevYear = currentYear;
        itemArray.push({type: 'section_title', text: prevYear});
      }
      childItems.push(this.chronologicalactiveMenuTree[i]);
    }
    if ( itemArray.length > 0 ) {
      itemArray[itemArray.length - 1].subOptions = childItems;
      itemArray[itemArray.length - 1].childrenCount = true;
    } else {
      itemArray[0] = {};
      itemArray[0].subOptions = childItems;
      itemArray[0].childrenCount = true;
    }
    this.chronologicalactiveMenuTree = itemArray;
    this.storage.set('toc_chronological_' + data['collectionID'], this.chronologicalactiveMenuTree);
  }

  flattenList(data) {
    data.childrenCount = 0;
    let list = [data];
    if (!data.children) {
      return list;
    }
    for (const child of data.children) {
      list = list.concat(this.flattenList(child));
    }
    return list;
  }

  setActiveSortingType(type) {
    if (type === 'thematic') {
        this.alphabethicOrderActive = false;
        this.chronologicalOrderActive = false;
        this.thematicOrderActive = true;
        this.activeMenuTree = this.collapsableItems;
    } else if (type === 'alphabetical') {
        this.alphabethicOrderActive = true;
        this.chronologicalOrderActive = false;
        this.thematicOrderActive = false;
        this.activeMenuTree = this.alphabeticalactiveMenuTree;
    } else if (type === 'chronological') {
        this.alphabethicOrderActive = false;
        this.chronologicalOrderActive = true;
        this.thematicOrderActive = false;
        this.activeMenuTree = this.chronologicalactiveMenuTree;
    }
  }

  ngOnChanges(about) {
    if ( Array.isArray(about) && (this.isMarkdown || this.isGallery) ) {
      // console.log('toc-accordion ngOnChanges initialized', about);
      this.menuOptions = about;
      this.collapsableItems = new Array<InnerMenuOptionModel>();
      this.activeMenuTree = [];

      // Map the options to our internal models
      this.menuOptions.forEach(option => {
        let innerMenuOption = InnerMenuOptionModel.fromMenuOptionModel(option, null, false, false);
        // Check if there's any option marked as selected
        if (option.selected !== undefined && option.selected === true) {
          this.selectedOption = innerMenuOption;
        } else if (innerMenuOption.childrenCount) {
          innerMenuOption.subOptions.forEach(subItem => {
            if (subItem.selected) {
              this.selectedOption = subItem;
            }
          });
        }
        // In some cases, like when opening a markdown page from the home page, the selected page is not
        // marked as selected and it's parents are collapsed since ngOnChanges refreshes the toc with
        // default values. That's why we have to run this recursive search for selected markdown menu options
        if (this.currentOption && this.currentOption.markdownID) {
          innerMenuOption = this.searchInnerMenuForSelectedMarkdownOption(innerMenuOption);
        }

        if ( this.collapsableItems.indexOf(innerMenuOption) === -1 ) {
          this.collapsableItems.push(innerMenuOption);
        }
      });

      /*
      if (this.alphabethicOrderActive) {
        this.activeMenuTree = this.alphabeticalactiveMenuTree;
      } else if (this.chronologicalOrderActive) {
        this.activeMenuTree = this.chronologicalactiveMenuTree;
      } else {
        this.activeMenuTree = this.collapsableItems;
      }
      */
      this.activeMenuTree = this.collapsableItems;
      this.cdRef.detectChanges();
    }

    if ( this.titleSelected === false && this.coverSelected === false
    && this.introductionSelected === false && this.forewordSelected === false ) {
      if ( this.hasCover && this.defaultSelectedItem === 'cover' ) {
        this.coverSelected = true;
      } else if ( this.hasTitle && this.defaultSelectedItem === 'title' ) {
        this.titleSelected = true;
      } else if ( this.hasForeword && this.defaultSelectedItem === 'foreword' ) {
        this.forewordSelected = true;
      } else if ( this.hasIntro && this.defaultSelectedItem === 'introduction' ) {
        this.introductionSelected = true;
      }
    }
    // console.log('ngOnChanges this.activeMenuTree', this.activeMenuTree);
  }

  ngOnInit() {
    // console.log('toc-accordion ngOnInit initialized');

    let language = 'sv';
    this.languageService.getLanguage().subscribe((lang: string) => {
      language = lang;
    });
    this.playmanTraditionPageID = `${language}-${this.playmanTraditionPageID}`;

    this.setConfigs();

    this.translate.get('TOC.SortOptions.SortTOC').subscribe(
      translation => {
        this.sortSelectOptions = {
          title: translation,
          cssClass: 'select-text-alert'
        };
      }, error => { }
    );

    this.coverSelected = false;
    this.titleSelected = false;
    this.forewordSelected = false;
    this.introductionSelected = false;

    const currentPage = String(window.location.href);
    if ( this.hasCover && currentPage.includes('/publication-cover/') ) {
      this.coverSelected = true;
    } else if ( this.hasTitle && currentPage.includes('/publication-title/') ) {
      this.titleSelected = true;
    } else if ( this.hasForeword && currentPage.includes('/publication-foreword/') ) {
      this.forewordSelected = true;
    } else if ( this.hasIntro && currentPage.includes('/publication-introduction/') ) {
      this.introductionSelected = true;
    }

    this.registerEventListeners();
    this.cdRef.detectChanges();
  }

  setConfigs() {
    try {
      this.searchTocItemInAccordionByTitle = this.config.getSettings('SearchTocItemInAccordionByTitle');
    } catch (e) {
      this.searchTocItemInAccordionByTitle = false;
    }

    try {
      this.playmanTraditionPageInMusicAccordion = this.config.getSettings('MusicAccordionShow.PlaymanTraditionPage');
    } catch (e) {
      this.playmanTraditionPageInMusicAccordion = false;
    }

    try {
      this.sortableLetters = this.config.getSettings('settings.sortableLetters');
    } catch (e) {
      this.sortableLetters = [];
    }

    try {
      this.hasCover = this.config.getSettings('HasCover');
    } catch (e) {
      this.hasCover = false;
    }

    try {
      this.hasTitle = this.config.getSettings('HasTitle');
    } catch (e) {
      this.hasTitle = false;
    }

    try {
      this.hasForeword = this.config.getSettings('HasForeword');
    } catch (e) {
      this.hasForeword = false;
    }

    try {
      this.hasIntro = this.config.getSettings('HasIntro');
    } catch (e) {
      this.hasIntro = false;
    }
  }

  registerEventListeners() {
    this.events.subscribe('tableOfContents:loaded', (data) => {
      this.storage.get('toc_alfabetical_' + data['collectionID']).then((toc) => {
        if ( toc === null || data['collectionID'] !== toc['collectionID'] ) {
          this.constructAlphabeticalTOC(data);
        } else {
          this.alphabeticalactiveMenuTree = toc;
        }
      });
      this.storage.get('toc_chronological_' + data['collectionID']).then((toc) => {
        if ( toc === null || data['collectionID'] !== toc['collectionID'] ) {
          this.constructChronologicalTOC(data);
        } else {
          this.chronologicalactiveMenuTree = toc;
        }
      });
    });

    this.events.subscribe(SideMenuRedirectEvent, (data: SideMenuRedirectEventData) => {
      // console.log('toc: updating selected option');
      this.updateSelectedOption(data);
    });

    this.events.subscribe('SelectedItemInMenu', (menu) => {
      // console.log('this.collectionId', this.collectionId);
      // console.log('menu.menuID', menu.menuID);
      if ( this.collectionId === undefined || this.collectionId === null ) {
        this.collectionId = menu.menuID;
      }
      // console.log('selectedItemInMenu', menu);
      // console.log('this.currentOption', this.currentOption);
      if (this.collectionId !== menu.menuID && this.currentOption && this.collectionId !== 'mediaCollections') {
        this.currentOption.selected = false;
        this.currentOption = null;
      } else {
        // console.log('event: SelectedItemInMenu; this.collectionId', this.collectionId);
        if (menu && menu.component) {
          if (menu.component === 'cover-page') {
            this.coverSelected = true;
            this.titleSelected = false;
            this.forewordSelected = false;
            this.introductionSelected = false;
          } else if (menu.component === 'title-page') {
            this.coverSelected = false;
            this.titleSelected = true;
            this.forewordSelected = false;
            this.introductionSelected = false;
          } else if (menu.component === 'foreword-page') {
            this.coverSelected = false;
            this.titleSelected = false;
            this.forewordSelected = true;
            this.introductionSelected = false;
          } else if (menu.component === 'introduction') {
            this.coverSelected = false;
            this.titleSelected = false;
            this.forewordSelected = false;
            this.introductionSelected = true;
          } else if (menu.component === 'media-collections' || menu.component === 'media-collection') {
            this.coverSelected = false;
            this.titleSelected = false;
            this.forewordSelected = false;
            this.introductionSelected = false;
            this.collapsableItems.forEach(element => {
              if (element.targetOption.id === menu.menuID) {
                element.targetOption.selected = true;
                element.selected = true;
              }
            });
          }
        }
      }
      this.cdRef.detectChanges();
    });

    this.events.subscribe('selectOneItem', (itemId) => {
      if (this.currentOption) {
        this.currentOption.selected = false;
      }

      this.coverSelected = false;
      this.titleSelected = false;
      this.forewordSelected = false;
      this.introductionSelected = false;
      if (this.alphabethicOrderActive) {
        this.unSelectAllItems(this.alphabeticalactiveMenuTree);
        this.selectOneItem(itemId, this.alphabeticalactiveMenuTree);
      } else if (this.chronologicalOrderActive) {
        this.unSelectAllItems(this.chronologicalactiveMenuTree);
        this.selectOneItem(itemId, this.chronologicalactiveMenuTree);
      } else {
        this.unSelectAllItems(this.collapsableItems);
        this.selectOneItem(itemId, this.collapsableItems);
      }
      this.cdRef.detectChanges();
    });

    this.events.subscribe('tableOfContents:findMarkdownTocItem', (data) => {
      if (data && data.markdownID) {
        if (this.collectionId !== 'songTypesMarkdown' && this.collectionId !== 'aboutMarkdown') {
          return;
        }

        if (this.collectionId === 'songTypesMarkdown') {
          this.findTocByMarkdownID(this.collapsableItems, data.markdownID);
          this.events.publish('typesAccordion:change', {
            expand: true
          });
        }

        let language = this.config.getSettings('i18n.locale');
        this.languageService.getLanguage().subscribe((lang: string) => {
          language = lang;
        });

        // checking for ${language}-03 prevents opening about accordion on refresh if another menu is active
        if (this.collectionId === 'aboutMarkdown' && data.markdownID.indexOf(`${language}-03`) !== -1) {
          this.findTocByMarkdownID(this.collapsableItems, data.markdownID);
          this.events.publish('aboutAccordion:change', {
            expand: true
          });
        }
      }
    });

    this.events.subscribe('tableOfContents:unSelectSelectedTocItem', (data) => {
      // console.log('subscribe to tableOfContents:unSelectSelectedTocItem activated', data);
      if (!data) {
        return;
      }
      this.unSelectAllItems(this.collapsableItems);
      this.cdRef.detectChanges();
    });
  }

  /**
   * Opens tocItem parents and saves children to childrenToc object
   * so that we only have to render current tocItem's parents in the view template.
   * @param tocItem
   */
  openTocItemParentAccordions(tocItem) {
    try {
      if (tocItem.parent) {
        tocItem.important = true;
        tocItem.parent.expanded = true;
        tocItem.parent.collapsed = false;

        for (const child of tocItem.parent.subOptions) {
          if (child.subOptions && child.subOptions.length && !child.important) {
            child['search_children_id'] = this.tocItemSearchChildrenCounter;
            this.searchChildrenToc[child.search_children_id] = child.subOptions;
            child.subOptions = [];
            this.tocItemSearchChildrenCounter++;
          }
        }
        tocItem.parent.important = true;
        tocItem.parent.selected = false;
        this.openTocItemParentAccordions(tocItem.parent);
      } else {
        tocItem.expanded = true;
        tocItem.collapsed = false;
        tocItem.important = true;

      }
    } catch (e) {console.log(e)}
  }

  openMarkdownTocItemParentAccordions(tocItem) {
    try {
      if (tocItem.parent) {
        tocItem.parent.expanded = true;
        tocItem.parent.collapsed = false;
        this.cdRef.detectChanges();
        this.openMarkdownTocItemParentAccordions(tocItem.parent);
      }
    } catch (e) {}
  }

  findTocByMarkdownID(list, markdownID) {
    for (const item of list) {
      if (item.subOptions && item.subOptions.length) {
        this.findTocByMarkdownID(item.subOptions, markdownID);
      } else if (
        item.markdownID &&
        (item.markdownID === markdownID || String(item.markdownID) === String(markdownID))
      ) {
        item.selected = true;
        this.currentOption = item;
        this.openMarkdownTocItemParentAccordions(item);
        this.cdRef.detectChanges();
        break;
      }
    }
  }

  findTocByPubAndTitle(list, publicationID, text) {
    for (const item of list) {
      if (item.subOptions && item.subOptions.length) {
        this.findTocByPubAndTitle(item.subOptions, publicationID, text);
      } else if (
        item.publication_id &&
        (item.publication_id === publicationID || Number(item.publication_id) === Number(publicationID))
        && item.text === text
      ) {
        item.selected = true;
        this.currentOption = item;
        this.openTocItemParentAccordions(item);
        this.foundTocItem = true;
        break;
      }
    }
  }

  findTocByPubOnly(list, publicationID) {
    for (const item of list) {
      if ((String(item.itemId) === String(publicationID) || Number(item.publication_id) === Number(publicationID))
      ) {
        item.selected = true;
        this.currentOption = item;
        this.openTocItemParentAccordions(item);
        this.foundTocItem = true;
        return this.foundTocItem;
      } else if (item.subOptions && item.subOptions.length) {
        this.findTocByPubOnly(item.subOptions, publicationID);
      }
    }
    return this.foundTocItem;
  }

  ngOnDestroy() {
    this.events.unsubscribe(SideMenuRedirectEvent);
    this.events.unsubscribe('SelectedItemInMenu');
    this.events.unsubscribe('tableOfContents:findMarkdownTocItem');
    this.events.unsubscribe('tableOfContents:loaded');
    this.events.unsubscribe('tableOfContents:unSelectSelectedTocItem');
  }

  /**
   * Send the selected option to the caller component
   */
  public select(item: InnerMenuOptionModel): void {
    // console.log('selecting toc item:', item);

    if (this.currentOption) {
      this.currentOption.selected = false;
    }

    item.selected = true;
    this.currentOption = item;

    this.unSelectOptions(this.collapsableItems);
    this.coverSelected = false;
    this.titleSelected = false;
    this.forewordSelected = false;
    this.introductionSelected = false;

    this.events.publish('SelectedItemInMenu', {
      menuID: this.collectionId,
      component: 'table-of-contents-accordion-component'
    });

    // Try to remove META-Tags
    this.metadataService.clearHead();
    // Add the new META-Tags
    this.metadataService.addDescription(this.collectionName + ' - ' + item.text);
    this.metadataService.addKeywords();

    if (this.isMarkdown) {
      this.coverSelected = false;
      this.titleSelected = false;
      this.forewordSelected = false;
      this.introductionSelected = false;
      this.selectMarkdown(item);
    } else if (item.is_gallery) {
      this.coverSelected = false;
      this.titleSelected = false;
      this.forewordSelected = false;
      this.introductionSelected = false;
      this.selectGallery(item);
    } else if ( item.itemId !== undefined ) {
      this.coverSelected = false;
      this.titleSelected = false;
      this.forewordSelected = false;
      this.introductionSelected = false;

      this.storage.set('currentTOCItem', item);

      const params = this.createReadPageParamsFromMenuItem(item);

      if (this.textService.readViewTextId && item.itemId.split('_').length > 1 && item.itemId.indexOf(';') > -1
      && item.itemId.split(';')[0] === this.textService.readViewTextId.split(';')[0]) {
        // The read page we are navigating to is just a different position in the text that is already open
        // --> no need to reload page-read, just scroll to correct position
        this.events.publish('UpdatePositionInPageRead', params);
        this.events.publish('UpdatePositionInPageRead:TextChanger', item.itemId);
      } else {
        if ( this.platform.is('core') ) {
          this.events.publish('title-logo:show', true);
        } else {
          this.events.publish('title-logo:show', false);
        }
        const nav = this.app.getActiveNavs();
        nav[0].setRoot('read', params);
      }
    } else {
      this.storage.set('currentTOCItem', item);
    }
  }

  createReadPageParamsFromMenuItem(item) {
    const params = {root: this.options, tocItem: item, collection: {title: item.text}};

    if (item.url) {
      params['url'] = item.url;
    }

    if (item.datafile) {
      params['song_datafile'] = item.datafile;
    }

    if (item.itemId) {
      params['tocLinkId'] = item.itemId;
      const parts = item.itemId.split('_');
      params['collectionID'] = parts[0];
      params['publicationID'] = parts[1];
      if ( parts.length > 2 ) {
        params['chapterID'] = parts[2];
      }
    }

    if (this.currentItem && this.currentItem['facsimilePage'] ) {
      params['facsimilePage'] = this.currentItem['facsimilePage'];
    }

    params['facs_id'] = 'not';
    params['facs_nr'] = 'infinite';
    params['song_id'] = 'nosong';

    params['selectedItemInAccordion'] = true;

    params['search_title'] = 'searchtitle';

    if (this.searchTocItemInAccordionByTitle && item.text) {
      params['search_title'] = item.text;
    }

    if (item.type && item.type === 'facsimile') {
      params['collectionID'] = this.collectionId;
      params['publicationID'] = item.publication_id;
      params['tocLinkId'] = `${this.collectionId}_${item.publication_id}`;

      params['facs_id'] = item.facsimile_id;
      params['facs_nr'] = item.facs_nr;
    }

    if (item.type && item.type === 'song-example') {
      params['collectionID'] = this.collectionId;
      params['publicationID'] = item.publication_id;
      params['tocLinkId'] = `${this.collectionId}_${item.publication_id}`;
      params['song_id'] = item.song_id;
      params['facs_id'] = item.facsimile_id;
      params['facs_nr'] = item.facs_nr;
    }
    return params;
  }

  selectMarkdown(item) {
    if (!item.markdownID) {
      return;
    }

    let language = '';
    this.languageService.getLanguage().subscribe((lang: string) => {
      language = lang;
    });

    if ( !String(item.markdownID).includes(language) ) {
      const tmpId = String(item.id).split('-')
      item.id = language + '-' + tmpId[1] + '-' + tmpId[2];
    }

    const params = {
      id: item.markdownID,
      selectedItemInAccordion: true
    };

    const nav = this.app.getActiveNavs();

    if ((this.platform.is('mobile') || this.userSettingsService.isMobile()) && !this.userSettingsService.isDesktop()) {
      nav[0].push('content', params);
      console.log('pushed mobile')
    } else {
      nav[0].setRoot('content', params);
    }
  }

  selectGallery(item) {
    const nav = this.app.getActiveNavs();
    if ( item.targetOption.id === 'all' ) {
      const params = {};
      nav[0].push('media-collections', params, { animate: false, direction: 'forward', animation: 'ios-transition' });
    } else {
      const params = {mediaCollectionId: item.targetOption.id , mediaTitle: item.targetOption.title, fetch: false};
      nav[0].push('media-collection', params, {animate: true, direction: 'forward', animation: 'ios-transition'});
    }
  }

  openIntroduction(id) {
    const params = {root: this.root, tocItem: null, collection: {title: 'Introduction'}};
    params['collectionID'] = id;
    this.coverSelected = false;
    this.titleSelected = false;
    this.forewordSelected = false;
    this.introductionSelected = true;
    const nav = this.app.getActiveNavs();
    if (this.platform.is('mobile')) {
      nav[0].push('introduction', params);
    } else {
      nav[0].setRoot('introduction', params);
    }
  }

  openForewordPage(id) {
    const params = {root: this.root, tocItem: null, collection: {title: 'Foreword Page'}};
    params['collectionID'] = id;
    params['firstItem'] = '1';
    this.coverSelected = false;
    this.titleSelected = false;
    this.forewordSelected = true;
    this.introductionSelected = false;
    const nav = this.app.getActiveNavs();
    if (this.platform.is('mobile')) {
      nav[0].push('foreword-page', params);
    } else {
      nav[0].setRoot('foreword-page', params);
    }
  }

  openTitlePage(id) {
    const params = {root: this.root, tocItem: null, collection: {title: 'Title Page'}};
    params['collectionID'] = id;
    params['firstItem'] = '1';
    this.coverSelected = false;
    this.titleSelected = true;
    this.forewordSelected = false;
    this.introductionSelected = false;
    const nav = this.app.getActiveNavs();
    if (this.platform.is('mobile')) {
      nav[0].push('title-page', params);
    } else {
      nav[0].setRoot('title-page', params);
    }
  }

  openCoverPage(id) {
    const params = {root: this.root, tocItem: null, collection: {title: 'Cover Page'}};
    params['collectionID'] = id;
    params['firstItem'] = '1';
    this.coverSelected = true;
    this.titleSelected = false;
    this.forewordSelected = false;
    this.introductionSelected = false;
    const nav = this.app.getActiveNavs();
    if (this.platform.is('mobile')) {
      nav[0].push('cover-page', params);
    } else {
      nav[0].setRoot('cover-page', params);
    }
  }

  unSelectOptions(list) {
    for (const item of list) {
      if (item.subOptions && item.subOptions.length) {
        this.unSelectOptions(item.subOptions);
      } else {
        if (item.publication_id && this.currentOption && item.publication_id !== this.currentOption.publication_id) {
          item.selected = false;
        }
      }
    }
  }

  /**
   * This function is used to find and select a toc-item when the text-changer has been used to
   * select a text. The function repopulates this.collapsableItems with subOptions which are normally
   * stripped for faster rendering.
   */
  selectOneItem(itemId, list, parent?) {
    list.forEach(option => {
      if (option.itemId === itemId) {
        option.selected = true;
        this.currentOption = option;
        this.openTocItemParentAccordions(option);
      } else if (option.childrenCount) {
        if (option.subOptions.length) {
          this.selectOneItem(itemId, option.subOptions, option.subOptions);
        } else {
          if (option.search_children_id > -1) {
            option.subOptions = this.searchChildrenToc[option.search_children_id];
          } else if (option.children_id > -1) {
            option.subOptions = this.childrenToc[option.children_id];
          }
          this.selectOneItem(itemId, option.subOptions, option.subOptions);
        }
      }
    });
  }

  unSelectAllItems(list) {
    for (const item of list) {
      if (item.subOptions && item.subOptions.length) {
        this.unSelectAllItems(item.subOptions);
      } else {
        item.selected = false;
      }
    }
  }

  exit() {
    this.alphabethicOrderActive = false;
    this.chronologicalOrderActive = false;
    this.thematicOrderActive = false;
    this.resetTocAccordionScroll();
    this.events.publish('exitActiveCollection');
    const params = {};
    const nav = this.app.getActiveNavs();
    nav[0].setRoot('HomePage', params, { animate: false });
  }

  resetTocAccordionScroll() {
    const tocElem = document.querySelector('#tableOfContentsMenu ion-content.toc-menu-content > .scroll-content');
    if (tocElem) {
      tocElem.scrollTo(0, 0);
    }
  }

  /**
   * Fetch suboptions from childrenToc.
   * Toggle the sub options of the selected item.
   */
  public toggleItemOptions(targetOption: InnerMenuOptionModel): void {
    if (!targetOption) { return; }

    // Fetch suboptions if item doesn't have them already
    if (!targetOption.subOptions.length) {
      if (targetOption.search_children_id > -1) {
        targetOption.subOptions = this.searchChildrenToc[targetOption.search_children_id];
      } else if (targetOption.children_id > -1) {
        targetOption.subOptions = this.childrenToc[targetOption.children_id];
      }
    }
    if ( targetOption.collapsed === undefined || String(targetOption.collapsed) === '' ) {
      // collapsed is inverted expanded
      targetOption.collapsed = targetOption.expanded;
      targetOption.expanded = !targetOption.collapsed;
    } else {
      // Toggle the selected option
      targetOption.expanded = targetOption.collapsed;
      targetOption.collapsed = !targetOption.expanded;
    }
    // console.log('targetOption.itemId', targetOption.itemId);
    if ( targetOption.itemId !== undefined ) {
      this.select(targetOption);
    }
    // console.log('toggleItemOptions, targetOption:', targetOption);
  }

  // Recursive function for finding selected markdown page in toc, marking it selected and expanding all collapsible parents
  private searchInnerMenuForSelectedMarkdownOption(innerMenuOption: InnerMenuOptionModel, parentInnerMenuOption?: InnerMenuOptionModel) {
    if (this.currentOption && this.currentOption.markdownID && innerMenuOption && innerMenuOption.markdownID
      && this.currentOption.markdownID === innerMenuOption.markdownID) {
        innerMenuOption.selected = true;
        this.selectedOption = innerMenuOption;
        this.currentOption = innerMenuOption;
        if (parentInnerMenuOption) {
          parentInnerMenuOption.collapsed = false;
          parentInnerMenuOption.expanded = true;
          innerMenuOption.parent = parentInnerMenuOption;
          let parentOption = parentInnerMenuOption;
          while (parentOption.parent) {
            parentOption.parent.collapsed = false;
            parentOption.parent.expanded = true;
            parentOption = parentOption.parent;
          }
        }
    }
    if (innerMenuOption.childrenCount) {
      innerMenuOption.subOptions.forEach(subItem => {
        subItem = this.searchInnerMenuForSelectedMarkdownOption(subItem, innerMenuOption);
      });
    }
    return innerMenuOption;
  }

  // Reset the entire menu
  public collapseAllOptions(): void {
    this.collapsableItems.forEach(option => {
      if (!option.selected) {
        option.expanded = false;
        option.collapsed = true;
      }

      if (option.childrenCount) {
        option.subOptions.forEach(subItem => {
          if (subItem.selected || subItem['collapsed'] === false) {
            // Expand the parent if any of
            // its childs is selected
            subItem.parent.expanded = true;
            subItem.parent.collapsed = false;
          }
        });
      }
    });

    // Update the view since there wasn't any user interaction with it
    this.cdRef.detectChanges();
  }

  // Get the proper indentation of each option
  public get subOptionIndentation(): string {
    if (this.platform.is('ios')) { return this.menuSettings.subOptionIndentation.ios; }
    if (this.platform.is('windows')) { return this.menuSettings.subOptionIndentation.wp; }
    return this.menuSettings.subOptionIndentation.md;
  }

  // Get the proper height of each option
  public get itemHeight(): number {
    if (this.platform.is('ios')) { return this.menuSettings.itemHeight.ios; }
    if (this.platform.is('windows')) { return this.menuSettings.itemHeight.wp; }
    return this.menuSettings.itemHeight.md;
  }

  // Method that set the selected option and its parent
  public setSelectedOption(option: InnerMenuOptionModel) {
    if (!option.targetOption.component) {
      console.log('Cannot set selected option');
      return;
    }

    // Clean the current selected option if any
    if (this.selectedOption) {
      this.selectedOption.selected = false;
      this.selectedOption.targetOption.selected = false;

      if (this.selectedOption.parent) {
        this.selectedOption.parent.selected = false;
        this.selectedOption.parent.expanded = false;
      }

      this.selectedOption = null;
    }

    // Set this option to be the selected
    option.selected = true;
    option.targetOption.selected = true;

    if (option.parent) {
      option.parent.selected = true;
      option.parent.expanded = true;
    }

    // Keep a reference to the selected option
    this.selectedOption = option;

    // Update the view if needed since we may have
    // expanded or collapsed some options
    this.cdRef.detectChanges();
  }

  // Update the selected option
  public updateSelectedOption(data: SideMenuRedirectEventData): void {
    // tslint:disable-next-line:no-debugger
    // debugger;

    if (!data.text) {
      return;
    }

    let targetOption;

    this.collapsableItems.forEach(option => {
      if (option.text.toLowerCase() === data.text.toLowerCase()) {
        targetOption = option;
      } else if (option.childrenCount) {
        option.subOptions.forEach(subOption => {
          if (subOption.text.toLowerCase() === data.text.toLowerCase()) {
            targetOption = subOption;
          }
        });
      }
    });

    if (targetOption) {
      this.setSelectedOption(targetOption);
    }
  }

  // Merge the settings received with the default settings
  public mergeSettings(): void {
    const defaultSettings: SideMenuSettings = {
      accordionMode: false,
      itemHeight: {
        ios: 50,
        md: 50,
        wp: 50
      },
      arrowIcon: 'ios-arrow-forward',
      showSelectedOption: false,
      selectedOptionClass: 'selected-option',
      indentSubOptionsWithoutIcons: false,
      subOptionIndentation: {
        ios: '16px',
        md: '16px',
        wp: '16px'
      }
    }

    if (!this.menuSettings) {
      // Use the default values
      this.menuSettings = defaultSettings;
      return;
    }

    if (!this.menuSettings.itemHeight) {
      this.menuSettings.itemHeight = defaultSettings.itemHeight;
    } else {
      // tslint:disable-next-line:max-line-length
      this.menuSettings.itemHeight.ios = this.isDefinedAndPositive(this.menuSettings.itemHeight.ios) ? this.menuSettings.itemHeight.ios : defaultSettings.itemHeight.ios;
      // tslint:disable-next-line:max-line-length
      this.menuSettings.itemHeight.md = this.isDefinedAndPositive(this.menuSettings.itemHeight.md) ? this.menuSettings.itemHeight.md : defaultSettings.itemHeight.md;
      // tslint:disable-next-line:max-line-length
      this.menuSettings.itemHeight.wp = this.isDefinedAndPositive(this.menuSettings.itemHeight.wp) ? this.menuSettings.itemHeight.wp : defaultSettings.itemHeight.wp;
    }
    // tslint:disable-next-line:max-line-length
    this.menuSettings.showSelectedOption = this.isDefined(this.menuSettings.showSelectedOption) ? this.menuSettings.showSelectedOption : defaultSettings.showSelectedOption;
    // tslint:disable-next-line:max-line-length
    this.menuSettings.accordionMode = this.isDefined(this.menuSettings.accordionMode) ? this.menuSettings.accordionMode : defaultSettings.accordionMode;
    this.menuSettings.arrowIcon = this.isDefined(this.menuSettings.arrowIcon) ? this.menuSettings.arrowIcon : defaultSettings.arrowIcon;
    // tslint:disable-next-line:max-line-length
    this.menuSettings.selectedOptionClass = this.isDefined(this.menuSettings.selectedOptionClass) ? this.menuSettings.selectedOptionClass : defaultSettings.selectedOptionClass;
    // tslint:disable-next-line:max-line-length
    this.menuSettings.subOptionIndentation = this.isDefined(this.menuSettings.subOptionIndentation) ? this.menuSettings.subOptionIndentation : defaultSettings.subOptionIndentation;
    // tslint:disable-next-line:max-line-length
    this.menuSettings.indentSubOptionsWithoutIcons = this.isDefined(this.menuSettings.indentSubOptionsWithoutIcons) ? this.menuSettings.indentSubOptionsWithoutIcons : defaultSettings.indentSubOptionsWithoutIcons;


    if (!this.menuSettings.subOptionIndentation) {
      this.menuSettings.subOptionIndentation = defaultSettings.subOptionIndentation;
    } else {
      // tslint:disable-next-line:max-line-length
      this.menuSettings.subOptionIndentation.ios = this.isDefined(this.menuSettings.subOptionIndentation.ios) ? this.menuSettings.subOptionIndentation.ios : defaultSettings.subOptionIndentation.ios;
      // tslint:disable-next-line:max-line-length
      this.menuSettings.subOptionIndentation.md = this.isDefined(this.menuSettings.subOptionIndentation.md) ? this.menuSettings.subOptionIndentation.md : defaultSettings.subOptionIndentation.md;
      // tslint:disable-next-line:max-line-length
      this.menuSettings.subOptionIndentation.wp = this.isDefined(this.menuSettings.subOptionIndentation.wp) ? this.menuSettings.subOptionIndentation.wp : defaultSettings.subOptionIndentation.wp;
    }
  }

  public isDefined(property: any): boolean {
    return property !== null && property !== undefined;
  }

  public isDefinedAndPositive(property: any): boolean {
    return this.isDefined(property) && !isNaN(property) && property > 0;
  }

}
