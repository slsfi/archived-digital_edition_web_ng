import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ModalController, PopoverController } from '@ionic/angular';
import { catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { marked } from 'marked';
import { ReadPopoverPage } from 'src/app/modals/read-popover/read-popover';
import { ReferenceDataModalPage } from 'src/app/modals/reference-data-modal/reference-data-modal';
import { MdContentService } from 'src/app/services/md-content.service';
import { ReadPopoverService } from 'src/app/services/read-popover.service';
import { UserSettingsService } from 'src/app/services/user-settings.service';
import { TextService } from 'src/app/services/text.service';
import { TableOfContentsService } from 'src/app/services/table-of-contents.service';
import { config } from "src/assets/config/config";


@Component({
  selector: 'page-title',
  templateUrl: 'collection-title.html',
  styleUrls: ['collection-title.scss'],
})

export class CollectionTitlePage implements OnInit {
  mdContent$: Observable<SafeHtml>;
  hasMDTitle = '';
  hasDigitalEditionListChildren = false;
  childrenPdfs = [];
  protected id = '';

  protected text: SafeHtml = this.sanitizer.bypassSecurityTrustHtml('<h1>Text from non-Observable</h1>')

  public text$: Observable<SafeHtml>;

  protected collection: any;
  titleSelected: boolean;
  showURNButton: boolean;
  showViewOptionsButton: Boolean = true;
  textLoading: Boolean = false;

  constructor(
    private textService: TextService,
    protected sanitizer: DomSanitizer,
    public userSettingsService: UserSettingsService,
    protected tableOfContentsService: TableOfContentsService,
    public mdContentService: MdContentService,
    protected popoverCtrl: PopoverController,
    public readPopoverService: ReadPopoverService,
    private modalController: ModalController,
    private route: ActivatedRoute,
    @Inject(LOCALE_ID) public activeLocale: string,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.titleSelected = true;
    this.hasMDTitle = config.ProjectStaticMarkdownTitleFolder ?? '';
    this.showURNButton = config.showURNButton?.pageTitle ?? false;
    this.showViewOptionsButton = config.page?.title?.showViewOptionsButton ?? true;
  }

  ngOnInit() {
    this.text$ = this.route.params.pipe(

      // TODO: Ideally we wouldn't have any side-effects
      tap(({collectionID}) => {       // tap is analogous to "touch", do something, for side-effects
        this.id = collectionID;       // NOTE: If there are no subscriptions then the code is not used
        this.checkIfCollectionHasChildrenPdfs(collectionID);
      }),

      // "Let's wait something else instead"
      switchMap(({collectionID}) => {
          return this.getTitleContent(this.activeLocale, collectionID);
      })
    );
  }

  checkIfCollectionHasChildrenPdfs(collectionID: string) {
    let configChildrenPdfs = config.collectionChildrenPdfs?.[collectionID] ?? [];

    if (configChildrenPdfs.length) {
      this.childrenPdfs = configChildrenPdfs;
      this.hasDigitalEditionListChildren = true;
    }
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

  getTitleContent(lang: string, id: string): Observable<SafeHtml> {
    const isIdText = isNaN(Number(id));

    if (this.hasMDTitle === '') {
      if (!isIdText) {
        return this.textService.getTitlePage(id, lang).pipe(
          map((res: any) => {
            return this.sanitizer.bypassSecurityTrustHtml(
              res.content.replace(/images\//g, 'assets/images/')
                .replace(/\.png/g, '.svg')
            );
          }),
          catchError(e => {
            return throwError(() => new Error(e));
          })
        );
      } else {
        return of(this.sanitizer.bypassSecurityTrustHtml(''));
      }
    } else {
      if (!isIdText) {
        return this.getMdContent(`${lang}-${this.hasMDTitle}-${id}`);
      } else {
        return this.getMdContent(`${lang}-gallery-intro`);
      }
    }
  }

  async showReadSettingsPopover(event: any) {
    const toggles = {
      'comments': false,
      'personInfo': false,
      'placeInfo': false,
      'workInfo': false,
      'changes': false,
      'normalisations': false,
      'abbreviations': false,
      'paragraphNumbering': false,
      'pageBreakOriginal': false,
      'pageBreakEdition': false
    };
    const popover = await this.popoverCtrl.create({
      component: ReadPopoverPage,
      componentProps: { toggles },
      cssClass: 'read-popover',
      reference: 'trigger',
      side: 'bottom',
      alignment: 'end'
    })
    popover.present(event);
  }

  public async showReference() {
    // Get URL of Page and then the URI
    const modal = await this.modalController.create({
      component: ReferenceDataModalPage,
      componentProps: {id: this.document.URL, type: 'reference', origin: 'page-title'}
    });
    modal.present();
  }

  printMainContentClasses() {
    if (this.userSettingsService.isMobile()) {
      return 'mobile-mode-content';
    } else {
      return '';
    }
  }

}
