import { Component, Inject, LOCALE_ID } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController, PopoverController } from '@ionic/angular';
import { ReadPopoverPage } from 'src/app/modals/read-popover/read-popover';
import { ReferenceDataModalPage } from 'src/app/modals/reference-data-modal/reference-data-modal';
import { EventsService } from 'src/app/services/events/events.service';
import { ReadPopoverService } from 'src/app/services/settings/read-popover.service';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';
import { TextService } from 'src/app/services/texts/text.service';
import { TableOfContentsService } from 'src/app/services/toc/table-of-contents.service';
import { config } from "src/app/services/config/config";


@Component({
  selector: 'page-foreword',
  templateUrl: 'foreword.html',
  styleUrls: ['foreword.scss']
})
export class ForewordPage {

  protected id = '';
  protected text: any;
  protected collection: any;
  forewordSelected?: boolean;
  showURNButton: boolean;
  showViewOptionsButton: Boolean = true;
  textLoading: Boolean = true;

  constructor(
    public navCtrl: NavController,
    private textService: TextService,
    protected sanitizer: DomSanitizer,
    protected events: EventsService,
    public userSettingsService: UserSettingsService,
    protected tableOfContentsService: TableOfContentsService,
    protected popoverCtrl: PopoverController,
    public readPopoverService: ReadPopoverService,
    private modalController: ModalController,
    private route: ActivatedRoute,
    @Inject(LOCALE_ID) public activeLocale: string
  ) {
    this.showURNButton = config.page?.foreword?.showURNButton ?? false;
    this.showViewOptionsButton = config.page?.foreword?.showViewOptionsButton ?? true;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = params['collectionID'];
      this.loadForeword(this.activeLocale, this.id);
    });
  }

  loadForeword(lang: string, id: string) {
    this.textLoading = true;
    this.textService.getForewordPage(id, lang).subscribe({
      next: (res) => {
        if (res.content && res.content !== 'File not found') {
          this.text = this.sanitizer.bypassSecurityTrustHtml(
            res.content.replace(/images\//g, 'assets/images/')
              .replace(/\.png/g, '.svg')
          );
        } else {
          this.text = $localize`:@@Read.ForewordPage.NoForeword:Förordet kunde inte laddas.`;
        }
        this.textLoading = false;
      },
      error: (e) => {
        this.textLoading = false;
        this.text = $localize`:@@Read.ForewordPage.NoForeword:Förordet kunde inte laddas.`;
      }
    });
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
      'pageNumbering': false,
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
    });
    return await popover.present(event);
  }

  public async showReference() {
    // Get URL of Page and then the URI
    const modal = await this.modalController.create({
      component: ReferenceDataModalPage,
      componentProps: {id: document.URL, type: 'reference', origin: 'page-foreword'},
    });
    return await modal.present();
  }

  printMainContentClasses() {
    if (this.userSettingsService.isMobile()) {
      return 'mobile-mode-content';
    } else {
      return '';
    }
  }
}
