import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ReadPopoverPage } from 'src/app/modals/read-popover/read-popover';
import { DigitalEdition } from 'src/app/models/digital-edition.model';
import { GeneralTocItem, TableOfContentsCategory } from 'src/app/models/table-of-contents.model';
import { TableOfContentsService } from 'src/app/services/toc/table-of-contents.service';
import { TextService } from 'src/app/services/texts/text.service';
import { HtmlContentService } from 'src/app/services/html/html-content.service';
import { LanguageService } from 'src/app/services/languages/language.service';
import { EventsService } from 'src/app/services/events/events.service';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';
import { MdContentService } from 'src/app/services/md/md-content.service';
import { PdfService } from 'src/app/services/pdf/pdf.service';
import { config } from "src/app/services/config/config";
import { global } from '../../../app/global';


/**
 * Desktop version shows collection cover page.
 * Mobile version lists collection publications.
 * Also mobile version of collection cover page and introduction is accessed from this page.
 */

// @IonicPage({
//   name: 'single-edition',
//   segment: 'publication-toc/:id',
//   priority: 'high'
// })
@Component({
  selector: 'page-single-edition',
  templateUrl: 'single-edition.html',
  styleUrls: ['single-edition.scss']
})
export class SingleEditionPage {

  collection?: any;
  shallFetch?: boolean;
  errorMessage?: string;
  image?: string;

  subTitle?: string;
  tableOfContents?: TableOfContentsCategory[];
  tocItems?: any;
  parentItem?: GeneralTocItem;
  root?: TableOfContentsCategory[];
  items: any;
  collectionDescription: any;
  language = 'sv';
  defaultSelectedItem: string;
  description?: string;
  show?: string;
  hasCover: boolean;
  hasTitle: boolean;
  hasForeword: boolean;
  hasIntro: boolean;
  childrenPdfs = [];
  hasDigitalEditionListChildren = false;

  constructor(
    protected popoverCtrl: PopoverController,
    protected tableOfContentsService: TableOfContentsService,
    protected textService: TextService,
    protected htmlService: HtmlContentService,
    protected translate: TranslateService,
    protected langService: LanguageService,
    protected events: EventsService,
    protected sanitizer: DomSanitizer,
    protected platform: Platform,
    protected userSettingsService: UserSettingsService,
    protected mdcontentService: MdContentService,
    protected pdfService: PdfService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.collectionDescription = { content: null };
    this.language = config.i18n?.locale ?? 'sv';
    this.langService.getLanguage().subscribe((lang) => {
      this.show = config.defaults?.ReadModeView ?? 'established';
    });

    this.hasCover = config.HasCover ?? false;
    this.hasTitle = config.HasTitle ?? false;
    this.hasForeword = config.HasForeword ?? false;
    this.hasIntro = config.HasIntro ??= false;
    this.defaultSelectedItem = config.defaultSelectedItem ?? 'cover';
  }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.collection = { id: params['id'] };

      if (this.collection !== undefined && this.collection.id !== undefined && this.collection.id !== 'mediaCollections') {
        if (this.collection.title !== undefined) {
          global.setSubtitle(this.collection.title);
        }
        this.getCollectionDescription(this.collection.id);
      }
  
      if (this.collection) {
        this.collection.title = global.getSubtitle();
      }

      const collectionImages = config.editionImages;
      if ( this.collection?.id !== undefined  && this.collection.id !== 'mediaCollections' ) {
        this.image = collectionImages[this.collection.id];
        this.setCollectionTitle();
        this.events.publishTitleLogoCollectionTitle(this.subTitle);
        this.getDescriptions();
        this.childrenPdfs = this.pdfService.getCollectionChildrenPdfs(this.collection.id);
      }

      if ( this.childrenPdfs !== undefined && Array.isArray(this.childrenPdfs) && this.childrenPdfs.length) {
        this.hasDigitalEditionListChildren = true;
        this.events.publishCollectionWithChildrenPdfsHighlight(this.collection?.id);
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['collection']) {
        this.collection = JSON.parse(params['collection']);
      }

      this.parentItem = params['tocItem'];
      this.shallFetch = params['fetch'];

      if (!this.shallFetch && params['tocItem'] && params['tocItem'].items) {
        this.items = params['tocItem'].items;
        this.root = params['root'];
      }
    });
  }

  getDescriptions() {
    this.mdcontentService.getStaticPagesToc(this.language)
      .subscribe(
        staticToc => {
          let descriptions: any;
          try {
            if (staticToc.children[4].children !== undefined) {
              descriptions = staticToc.children[4].children;
            } else {
              descriptions = [];
            }
          } catch (e) {
            descriptions = [];
          }
          let mdFileStartingNumber = '';

          try {
            if (this.collection.id) {
              if (Number(this.collection.id) < 10) {
                mdFileStartingNumber = '0' + this.collection.id;
              } else {
                mdFileStartingNumber = this.collection.id;
              }
            }
          } catch (e) {
            mdFileStartingNumber = '01';
          }

          for (const d of descriptions) {
            if (d.basename.split('_desc')[0] === mdFileStartingNumber) {
              this.getSingleDescription(d.id);
            }
          }
        },
        err => console.error(err),
        () => console.log('get descriptions')
      );
  }

  getSingleDescription(fileId: any) {
    this.mdcontentService.getMdContent(fileId)
      .subscribe(
        description => {
          this.description = description.content;
        },
        err => console.error(err),
        () => console.log('get single description')
      );
  }

  async setCollectionTitle() {
    if ( this.collection.id !== 'mediaCollections' ) {
      await this.textService.getCollection(this.collection.id).subscribe(
        collection => {
          this.subTitle = collection[0].name;
          this.events.publishTitleLogoCollectionTitle(collection[0].name);
        },
        error => {
          console.log('could not get collection title');
        },
        () => console.log(this.subTitle)
      );
    }
  }

  ionViewWillLeave() {
    this.events.publishIonViewWillLeave(this.constructor.name);
  }
  ionViewWillEnter() {
    this.events.publishIonViewWillEnter(this.constructor.name);
    this.events.publishTableOfContentsUnSelectSelectedTocItem(true);
    if (this.collection.id && !this.collection.isDownloadOnly) {
      this.getTocRoot(this.collection.id);
      
    } else {
      console.log(this.collection.id, 'perhaps maybe');
    }
    console.log('single collection ion will enter...');
    // this.events.publishPageLoadedSingleEdition({ 'title': this.subTitle });
    // this.events.publish('pageLoaded:single-edition', { 'title': this.subTitle });
  }

  getTocRoot(id: string) {
    this.tableOfContentsService.getTableOfContents(id)
      .subscribe(
        tocItems => {
          this.tocItems = tocItems;
          this.maybeLoadIntroductionPage(this.collection.id);
        },
        error => { this.errorMessage = <any>error });
  }

  getTableOfContents(id: string) {
    this.tableOfContentsService.getTableOfContents(id)
      .subscribe(
        (tableOfContents: any) => {
          this.root = tableOfContents;
          this.tableOfContents = tableOfContents;
        },
        error => { this.errorMessage = <any>error });
  }

  getCollectionDescription(id: string) {
    this.htmlService.getHtmlContent(id + '_desc')
      .subscribe(
        collectionDescription => {
          this.collectionDescription = collectionDescription;
        },
        error => { this.errorMessage = <any>error });
  }

  async showPopover(myEvent: any) {
    const popover = await this.popoverCtrl.create({
      component: ReadPopoverPage,
    });
    return await popover.present(myEvent);
  }

  openFirstPage() {
    const params = { tocItem: null, fetch: false, collection: { title: this.subTitle } } as any;
    params['collectionID'] = this.collection.id
    try {
      const publicationId = String(this.tocItems['children'][0]['itemId']).split('_')[1];
      console.log('Opening read from SingleEdition.openFirstPage()');
      this.router.navigate([`/collection/${this.collection.id}/text/${publicationId}/`]);
    } catch (e) {
      this.maybeLoadIntroductionPage(params['collectionID']);
    }
  }

  maybeLoadIntroductionPage(collectionID: string) {
      const params = { collection: JSON.stringify(this.collection), fetch: true };
      if ( this.hasCover && this.defaultSelectedItem === 'cover' ) {
        this.router.navigate(['/collection', this.collection.id, 'cover']);
        // nav[0].setRoot('cover-page', params);
      } else if ( this.hasTitle && this.defaultSelectedItem === 'title' ) {
        this.router.navigate(['/collection', this.collection.id, 'title']);
        // nav[0].setRoot('title-page', params);
      } else if ( this.hasForeword && this.defaultSelectedItem === 'foreword' ) {
        this.router.navigate(['/collection', this.collection.id, 'foreword']);
        // nav[0].setRoot('foreword-page', params);
      } else if ( this.hasIntro && this.defaultSelectedItem === 'introduction' ) {
        this.router.navigate(['/collection', this.collection.id, 'introduction']);
        // nav[0].setRoot('introduction', params);
      } else if ( this.hasCover ) {
        this.router.navigate(['/collection', this.collection.id, 'cover']);
        // nav[0].setRoot('cover-page', params);
      } else if ( this.hasTitle ) {
        this.router.navigate(['/collection', this.collection.id, 'title']);
        // nav[0].setRoot('title-page', params);
      } else if ( this.hasForeword ) {
        this.router.navigate(['/collection', this.collection.id, 'foreword']);
        // nav[0].setRoot('foreword-page', params);
      } else if ( this.hasIntro ) {
        this.router.navigate(['/collection', this.collection.id, 'introduction']);
        // nav[0].setRoot('introduction', params);
      }
  }
}
