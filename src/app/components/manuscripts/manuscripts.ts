import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AlertButton, AlertController, AlertInput, IonicModule } from '@ionic/angular';

import { CommonFunctionsService } from 'src/app/services/common-functions.service';
import { ReadPopoverService } from 'src/app/services/read-popover.service';
import { TextService } from 'src/app/services/text.service';
import { config } from "src/assets/config/config";


@Component({
  standalone: true,
  selector: 'manuscripts',
  templateUrl: 'manuscripts.html',
  styleUrls: ['manuscripts.scss'],
  imports: [CommonModule, IonicModule]
})
export class ManuscriptsComponent implements OnInit {
  @Input() msID: number | undefined = undefined;
  @Input() searchMatches: Array<string> = [];
  @Input() textItemID: string = '';
  @Output() openNewLegendView = new EventEmitter<any>();
  @Output() openNewManView = new EventEmitter<any>();
  @Output() selectedMsID = new EventEmitter<number>();

  selectedManuscript: any = undefined;
  showNormalizedMs: boolean = false;
  showOpenLegendButton: boolean = false;
  text: SafeHtml = '';
  textLanguage: string = '';
  manuscripts: any[] = [];

  constructor(
    private alertCtrl: AlertController,
    private commonFunctions: CommonFunctionsService,
    public readPopoverService: ReadPopoverService,
    private sanitizer: DomSanitizer,
    private textService: TextService
  ) {
    this.showOpenLegendButton = config.showOpenLegendButton?.manuscripts ?? false;
  }

  ngOnInit() {
    if (this.textItemID) {
      this.loadManuscriptTexts();
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
          this.text = $localize`:@@Read.Manuscripts.NoManuscripts:Inga manuskript.`;
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
        return (item.id === this.msID);
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

      if (this.selectedManuscript.language) {
        this.textLanguage = this.selectedManuscript.language;
      } else {
        this.textLanguage = '';
      }
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
    const inputs = [] as AlertInput[];
    const buttons = [] as AlertButton[];

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

    buttons.push({ text: $localize`:@@BasicActions.Cancel:Avbryt` });
    buttons.push({
      text: $localize`:@@BasicActions.Ok:Ok`,
      handler: (index: any) => {
        this.changeManuscript(this.manuscripts[parseInt(index)]);
      }
    });

    const alert = await this.alertCtrl.create({
      header: $localize`:@@Read.Manuscripts.SelectMsDialogTitle:Välj manuskript`,
      subHeader: $localize`:@@Read.Manuscripts.SelectMsDialogSubtitle:Manuskriptet ersätter det manuskript som visas i kolumnen där du klickade.`,
      cssClass: 'custom-select-alert',
      buttons: buttons,
      inputs: inputs
    });

    await alert.present();
  }

  emitSelectedManuscriptId(id: number) {
    this.selectedMsID.emit(id);
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

}
