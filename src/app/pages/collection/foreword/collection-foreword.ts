import { Component, ElementRef, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ModalController, PopoverController } from '@ionic/angular';
import { catchError, combineLatest, map, Observable, of, switchMap, tap } from 'rxjs';

import { ReferenceDataModal } from '@modals/reference-data/reference-data.modal';
import { ViewOptionsPopover } from '@popovers/view-options/view-options.popover';
import { CommonFunctionsService } from '@services/common-functions.service';
import { ReadPopoverService } from '@services/read-popover.service';
import { TextService } from '@services/text.service';
import { UserSettingsService } from '@services/user-settings.service';
import { config } from 'src/assets/config/config';


@Component({
  selector: 'page-foreword',
  templateUrl: 'collection-foreword.html',
  styleUrls: ['collection-foreword.scss']
})
export class CollectionForewordPage implements OnInit {
  collectionID: string = '';
  intervalTimerId: number = 0;
  mobileMode: boolean = false;
  searchMatches: string[] = [];
  showURNButton: boolean = false;
  showViewOptionsButton: boolean = true;
  text$: Observable<SafeHtml>;

  constructor(
    private commonFunctions: CommonFunctionsService,
    private elementRef: ElementRef,
    private modalController: ModalController,
    private popoverCtrl: PopoverController,
    public readPopoverService: ReadPopoverService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private textService: TextService,
    private userSettingsService: UserSettingsService,
    @Inject(LOCALE_ID) private activeLocale: string
  ) {
    this.showURNButton = config.page?.foreword?.showURNButton ?? false;
    this.showViewOptionsButton = config.page?.foreword?.showViewOptionsButton ?? true;
  }

  ngOnInit() {
    this.mobileMode = this.userSettingsService.isMobile();

    this.text$ = combineLatest(
      [this.route.params, this.route.queryParams]
    ).pipe(
      map(([params, queryParams]) => ({...params, ...queryParams})),
      tap(({collectionID, q}) => {
        this.collectionID = collectionID;
        if (q) {
          this.searchMatches = this.commonFunctions.getSearchMatchesFromQueryParams(q);
          if (this.searchMatches.length) {
            this.commonFunctions.scrollToFirstSearchMatch(this.elementRef.nativeElement, this.intervalTimerId);
          }
        }
      }),
      switchMap(({collectionID}) => {
        return this.loadForeword(collectionID, this.activeLocale);
      })
    );
  }

  private loadForeword(id: string, lang: string): Observable<SafeHtml> {
    return this.textService.getForewordPage(id, lang).pipe(
      map((res: any) => {
        if (res?.content && res?.content !== 'File not found') {
          let text = res.content.replace(/images\//g, 'assets/images/').replace(/\.png/g, '.svg');
          text = this.commonFunctions.insertSearchMatchTags(text, this.searchMatches);
          return this.sanitizer.bypassSecurityTrustHtml(text);
        } else {
          return of(this.sanitizer.bypassSecurityTrustHtml(
            $localize`:@@Read.ForewordPage.NoForeword:Förordet kunde inte laddas.`
          ));
        }
      }),
      catchError((e: any) => {
        console.error(e);
        return of(this.sanitizer.bypassSecurityTrustHtml(
          $localize`:@@Read.ForewordPage.NoForeword:Förordet kunde inte laddas.`
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
      componentProps: { origin: 'page-foreword' }
    });

    modal.present();
  }

}
