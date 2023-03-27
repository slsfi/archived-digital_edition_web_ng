import { Component, Input, EventEmitter, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertButton, AlertController, AlertInput } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ReadPopoverService } from 'src/app/services/settings/read-popover.service';
import { TextService } from 'src/app/services/texts/text.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import { CommonFunctionsService } from 'src/app/services/common-functions/common-functions.service';
import { config } from "src/app/services/config/config";


@Component({
  selector: 'manuscripts',
  templateUrl: 'manuscripts.html',
  styleUrls: ['manuscripts.scss']
})
export class ManuscriptsComponent {

  @Input() textItemID: string = '';
  @Input() msID: string = '';
  @Input() searchMatches: Array<string> = [];
  @Output() openNewManView = new EventEmitter<any>();
  @Output() openNewLegendView = new EventEmitter<any>();
  @Output() selectedMsID = new EventEmitter<string>();

  public text: any = '';
  manuscripts: any = [];
  selectedManuscript: any = undefined;
  showNormalizedMs = false;
  showOpenLegendButton: boolean = false;

  constructor(
    protected sanitizer: DomSanitizer,
    protected readPopoverService: ReadPopoverService,
    protected textService: TextService,
    protected storage: StorageService,
    private alertCtrl: AlertController,
    public translate: TranslateService,
    private analyticsService: AnalyticsService,
    public commonFunctions: CommonFunctionsService
  ) {
    this.showOpenLegendButton = config.showOpenLegendButton?.manuscripts ?? false;
  }

  ngOnInit() {
    if (this.textItemID) {
      this.loadManuscriptTexts();
      this.doAnalytics();
    }
  }

  loadManuscriptTexts() {
    this.textService.getManuscripts(this.textItemID).subscribe({
      next: (res) => {
        if (
          res &&
          res.manuscripts.length > 0 &&
          res.manuscripts[0].manuscript_changes
        ) {
          this.manuscripts = res.manuscripts;
          this.setManuscript();
        } else {
          this.translate.get('Read.Manuscripts.NoManuscripts').subscribe({
            next: (translation) => {
              this.text = translation;
            },
            error: (e) => {
              this.text = 'Inga transkriptioner.';
            }
          });
        }
      },
      error: (e) => {
        // TODO: Add translated error message.
        this.text = 'Ett fel har uppstått. Transkriptioner kunde inte hämtas.';
      }
    });
  }

  setManuscript() {
    if (this.msID) {
      const inputManuscript = this.manuscripts.filter((item: any) => {
        return (String(item.id) === String(this.msID));
      })[0];
      if (inputManuscript) {
        this.selectedManuscript = inputManuscript;
      }
    } else {
      this.selectedManuscript = this.manuscripts[0];
    }
    // Emit the ms id so the read page can update queryParams
    this.emitSelectedManuscriptId(this.selectedManuscript.id);
    this.changeManuscript();
  }

  changeManuscript(manuscript?: any) {
    if (manuscript && this.selectedManuscript && this.selectedManuscript.id !== manuscript.id) {
      this.selectedManuscript = manuscript;
      // Emit the ms id so the read page can update queryParams
      this.emitSelectedManuscriptId(manuscript.id);
    }
    if (this.selectedManuscript) {
      let text = '';
      if (this.showNormalizedMs) {
        text = this.selectedManuscript.manuscript_normalized;
      } else {
        text = this.selectedManuscript.manuscript_changes;
      }
      text = this.postprocessManuscriptText(text);
      text = this.commonFunctions.insertSearchMatchTags(text, this.searchMatches);
      this.text = this.sanitizer.bypassSecurityTrustHtml(text);

    }
  }

  toggleNormalizedManuscript() {
    this.showNormalizedMs = !this.showNormalizedMs;
    this.changeManuscript();
  }

  postprocessManuscriptText(text: string) {
    text = text.trim();
    // Replace png images with svg counterparts
    text = text.replace(/\.png/g, '.svg');
    // Fix image paths
    text = text.replace(/images\//g, 'assets/images/');
    // Add "tei" and "teiManuscript" to all classlists
    text = text.replace(
      /class=\"([a-z A-Z _ 0-9]{1,140})\"/g,
      'class=\"teiManuscript tei $1\"'
    );
    return text;
  }

  async selectManuscript() {
    let msTranslations = null as any;
    const inputs = [] as AlertInput[];
    const buttons = [] as AlertButton[];
    this.translate.get('Read.Manuscripts').subscribe({
      next: (translation) => {
        // ! msTranslations is an object with several translations
        msTranslations = translation;
      }
    });

    let buttonTranslations = null as any;
    this.translate.get('BasicActions').subscribe({
      next: (translation) => {
        // ! buttonTranslations is an object with several translations
        buttonTranslations = translation;
      }
    });

    this.manuscripts.forEach((manuscript: any, index: any) => {
      let checkedValue = false;

      if (this.selectedManuscript.id === manuscript.id) {
        checkedValue = true;
      }

      inputs.push({
        type: 'radio',
        label: manuscript.name,
        value: index,
        checked: checkedValue
      });
    });

    buttons.push(buttonTranslations.Cancel);
    buttons.push({
      text: buttonTranslations.Ok,
      handler: (index: any) => {
        this.changeManuscript(this.manuscripts[parseInt(index)]);
      }
    });

    const alert = await this.alertCtrl.create({
      header: msTranslations.SelectMsDialogTitle,
      subHeader: msTranslations.SelectMsDialogSubtitle,
      cssClass: 'custom-select-alert',
      buttons: buttons,
      inputs: inputs
    });

    await alert.present();
  }

  emitSelectedManuscriptId(id: number) {
    this.selectedMsID.emit(String(id));
  }

  openNewMan(event: Event, id: any) {
    event.preventDefault();
    event.stopPropagation();
    id.viewType = 'manuscripts';
    this.openNewManView.emit(id);
  }

  openFacsimileMan(event: Event, id: any) {
    event.preventDefault();
    event.stopPropagation();
    id.viewType = 'manuscriptFacsimile';
    this.openNewManView.emit(id);
    this.commonFunctions.scrollLastViewIntoView();
  }

  openNewLegend(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const id = {
      viewType: 'legend',
      id: 'ms-legend'
    }
    this.openNewLegendView.emit(id);
    this.commonFunctions.scrollLastViewIntoView();
  }

  doAnalytics() {
    this.analyticsService.doAnalyticsEvent('Manuscripts', 'Manuscripts', this.textItemID);
  }

}
