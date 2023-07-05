import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ModalController, PopoverController } from '@ionic/angular';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { marked } from 'marked';

import { ViewOptionsPopover } from 'src/app/modals/view-options/view-options.popover';
import { ReferenceDataModal } from 'src/app/modals/reference-data/reference-data.modal';
import { MdContentService } from 'src/app/services/md-content.service';
import { ReadPopoverService } from 'src/app/services/read-popover.service';
import { UserSettingsService } from 'src/app/services/user-settings.service';
import { TextService } from 'src/app/services/text.service';
import { config } from 'src/assets/config/config';


@Component({
  selector: 'page-title',
  templateUrl: 'collection-title.html',
  styleUrls: ['collection-title.scss'],
})

export class CollectionTitlePage implements OnInit {
  childrenPdfs: any[] = [];
  hasDigitalEditionListChildren: boolean = false;
  hasMDTitle: string = '';
  id: string = '';
  mdContent$: Observable<SafeHtml>;
  showURNButton: boolean = false;
  showViewOptionsButton: boolean = true;
  text$: Observable<SafeHtml>;

  constructor(
    private textService: TextService,
    private sanitizer: DomSanitizer,
    public userSettingsService: UserSettingsService,
    private mdContentService: MdContentService,
    private popoverCtrl: PopoverController,
    public readPopoverService: ReadPopoverService,
    private modalController: ModalController,
    private route: ActivatedRoute,
    @Inject(LOCALE_ID) private activeLocale: string
  ) {
    this.hasMDTitle = config.ProjectStaticMarkdownTitleFolder ?? '';
    this.showURNButton = config.page?.title?.showURNButton ?? false;
    this.showViewOptionsButton = config.page?.title?.showViewOptionsButton ?? true;
  }

  ngOnInit() {
    this.text$ = this.route.params.pipe(
      tap(({collectionID}) => {
        this.id = collectionID;
        this.checkIfCollectionHasChildrenPdfs(collectionID);
      }),
      switchMap(({collectionID}) => {
        return this.loadTitle(collectionID, this.activeLocale);
      })
    );
  }

  private checkIfCollectionHasChildrenPdfs(collectionID: string): void {
    const configChildrenPdfs = config.collectionChildrenPdfs?.[collectionID] ?? [];
    if (configChildrenPdfs.length) {
      this.childrenPdfs = configChildrenPdfs;
      this.hasDigitalEditionListChildren = true;
    }
  }

  private loadTitle(id: string, lang: string): Observable<SafeHtml> {
    const isIdText = isNaN(Number(id));

    if (this.hasMDTitle === '') {
      if (!isIdText) {
        return this.textService.getTitlePage(id, lang).pipe(
          map((res: any) => {
            if (res?.content) {
              return this.sanitizer.bypassSecurityTrustHtml(
                res.content.replace(/images\//g, 'assets/images/')
                  .replace(/\.png/g, '.svg')
              );
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
        return of(this.sanitizer.bypassSecurityTrustHtml(
          $localize`:@@Read.TitlePage.NoTitle:Titelbladet kunde inte laddas.`
        ));
      }
    } else {
      if (!isIdText) {
        return this.getMdContent(`${lang}-${this.hasMDTitle}-${id}`);
      } else {
        return this.getMdContent(`${lang}-gallery-intro`);
      }
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
    })
    popover.present(event);
  }

  async showReference() {
    const modal = await this.modalController.create({
      component: ReferenceDataModal,
      componentProps: { origin: 'page-title' }
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
