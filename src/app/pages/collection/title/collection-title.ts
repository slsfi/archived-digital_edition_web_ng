import { Component, ElementRef, Inject, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ModalController, PopoverController } from '@ionic/angular';
import { catchError, combineLatest, map, Observable, of, Subscription, switchMap, tap } from 'rxjs';
import { marked } from 'marked';

import { config } from '@config';
import { ReferenceDataModal } from '@modals/reference-data/reference-data.modal';
import { Textsize } from '@models/textsize.model';
import { ViewOptionsPopover } from '@popovers/view-options/view-options.popover';
import { CollectionContentService } from '@services/collection-content.service';
import { HtmlParserService } from '@services/html-parser.service';
import { MarkdownContentService } from '@services/markdown-content.service';
import { ScrollService } from '@services/scroll.service';
import { UserSettingsService } from '@services/user-settings.service';
import { ViewOptionsService } from '@services/view-options.service';


@Component({
  selector: 'page-title',
  templateUrl: 'collection-title.html',
  styleUrls: ['collection-title.scss'],
})
export class CollectionTitlePage implements OnDestroy, OnInit {
  collectionID: string = '';
  intervalTimerId: number = 0;
  mobileMode: boolean = false;
  searchMatches: string[] = [];
  showURNButton: boolean = false;
  showViewOptionsButton: boolean = true;
  titleFromMarkdownFolderId: string = '';
  text$: Observable<SafeHtml>;
  textsize: Textsize = Textsize.Small;
  textsizeSubscription: Subscription | null = null;

  TextsizeEnum = Textsize;

  constructor(
    private collectionContentService: CollectionContentService,
    private elementRef: ElementRef,
    private mdContentService: MarkdownContentService,
    private modalController: ModalController,
    private parserService: HtmlParserService,
    private popoverCtrl: PopoverController,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private scrollService: ScrollService,
    private userSettingsService: UserSettingsService,
    private viewOptionsService: ViewOptionsService,
    @Inject(LOCALE_ID) private activeLocale: string
  ) {
    this.titleFromMarkdownFolderId = config.collections?.titlesMarkdownFolderNumber ?? '';
    this.showURNButton = config.page?.title?.showURNButton ?? false;
    this.showViewOptionsButton = config.page?.title?.showViewOptionsButton ?? true;
  }

  ngOnInit() {
    this.mobileMode = this.userSettingsService.isMobile();

    this.textsizeSubscription = this.viewOptionsService.getTextsize().subscribe(
      (textsize: Textsize) => {
        this.textsize = textsize;
      }
    );

    this.text$ = combineLatest(
      [this.route.params, this.route.queryParams]
    ).pipe(
      map(([params, queryParams]) => ({...params, ...queryParams})),
      tap(({collectionID, q}) => {
        this.collectionID = collectionID;
        if (q) {
          this.searchMatches = this.parserService.getSearchMatchesFromQueryParams(q);
          if (this.searchMatches.length) {
            this.scrollService.scrollToFirstSearchMatch(this.elementRef.nativeElement, this.intervalTimerId);
          }
        }
      }),
      switchMap(({collectionID}) => {
        return this.loadTitle(collectionID, this.activeLocale);
      })
    );
  }

  ngOnDestroy() {
    this.textsizeSubscription?.unsubscribe();
  }

  private loadTitle(id: string, lang: string): Observable<SafeHtml> {
    if (!this.titleFromMarkdownFolderId) {
      return this.collectionContentService.getTitle(id, lang).pipe(
        map((res: any) => {
          if (res?.content) {
            let text = res.content.replace(/images\//g, 'assets/images/').replace(/\.png/g, '.svg');
            text = this.parserService.insertSearchMatchTags(text, this.searchMatches);
            return this.sanitizer.bypassSecurityTrustHtml(text);
          } else {
            return of(this.sanitizer.bypassSecurityTrustHtml(
              $localize`:@@Read.TitlePage.NoTitle:Titelbladet kunde inte laddas.`
            ));
          }
        }),
        catchError((e: any) => {
          console.error(e);
          return of(this.sanitizer.bypassSecurityTrustHtml(
            $localize`:@@Read.TitlePage.NoTitle:Titelbladet kunde inte laddas.`
          ));
        })
      );
    } else {
      return this.getMdContent(`${lang}-${this.titleFromMarkdownFolderId}-${id}`);
    }
  }

  private getMdContent(fileID: string): Observable<SafeHtml> {
    return this.mdContentService.getMdContent(fileID).pipe(
      map((res: any) => {
        return this.sanitizer.bypassSecurityTrustHtml(marked(res.content));
      }),
      catchError((e: any) => {
        console.error(e);
        return of(this.sanitizer.bypassSecurityTrustHtml(
          $localize`:@@Read.TitlePage.NoTitle:Titelbladet kunde inte laddas.`
        ));
      })
    );
  }

  async showViewOptionsPopover(event: any) {
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
      component: ViewOptionsPopover,
      componentProps: { toggles },
      cssClass: 'view-options-popover',
      reference: 'trigger',
      side: 'bottom',
      alignment: 'end'
    });

    popover.present(event);
  }

  async showReference() {
    const modal = await this.modalController.create({
      component: ReferenceDataModal,
      componentProps: { origin: 'page-title' }
    });

    modal.present();
  }

}
