import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ModalController, PopoverController } from '@ionic/angular';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';

import { ViewOptionsPopover } from 'src/app/modals/view-options/view-options.popover';
import { ReferenceDataModal } from 'src/app/modals/reference-data/reference-data.modal';
import { ReadPopoverService } from 'src/app/services/read-popover.service';
import { UserSettingsService } from 'src/app/services/user-settings.service';
import { TextService } from 'src/app/services/text.service';
import { config } from 'src/assets/config/config';


@Component({
  selector: 'page-foreword',
  templateUrl: 'collection-foreword.html',
  styleUrls: ['collection-foreword.scss']
})

export class CollectionForewordPage implements OnInit {
  id: string = '';
  showURNButton: boolean = false;
  showViewOptionsButton: boolean = true;
  text$: Observable<SafeHtml>;

  constructor(
    private textService: TextService,
    private sanitizer: DomSanitizer,
    public userSettingsService: UserSettingsService,
    private popoverCtrl: PopoverController,
    public readPopoverService: ReadPopoverService,
    private modalController: ModalController,
    private route: ActivatedRoute,
    @Inject(LOCALE_ID) private activeLocale: string
  ) {
    this.showURNButton = config.page?.foreword?.showURNButton ?? false;
    this.showViewOptionsButton = config.page?.foreword?.showViewOptionsButton ?? true;
  }

  ngOnInit() {
    this.text$ = this.route.params.pipe(
      tap(({collectionID}) => {
        this.id = collectionID;
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
          return this.sanitizer.bypassSecurityTrustHtml(
            res.content.replace(/images\//g, 'assets/images/')
              .replace(/\.png/g, '.svg')
          );
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
      componentProps: { origin: 'page-foreword' },
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
