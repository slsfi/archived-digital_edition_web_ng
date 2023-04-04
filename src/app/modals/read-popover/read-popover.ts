import { Component } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { Fontsize, ReadPopoverService } from 'src/app/services/settings/read-popover.service';
import { config } from "src/app/services/config/config";

/**
 * This is a popover accessed in ReadPage.
 * It lists different settings concerning reading publications in ReadPage.
 */

/*@IonicPage({
  name: 'read-popover-page'
})*/
@Component({
  selector: 'read-popover-page',
  templateUrl: 'read-popover.html',
  styleUrls: ['read-popover.scss']
})
export class ReadPopoverPage {
  readToggles: {
      'comments': boolean,
      'personInfo': boolean,
      'placeInfo': boolean,
      'workInfo': boolean,
      'changes': boolean,
      'normalisations': boolean,
      'abbreviations': boolean,
      'paragraphNumbering': boolean,
      'pageBreakOriginal': boolean,
      'pageBreakEdition': boolean
  };

  show = {
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

  fontsize: Fontsize | null = null;
  togglesCounter: number;

  constructor(
    public viewCtrl: PopoverController,
    public readPopoverService: ReadPopoverService,
    public params: NavParams
  ) {
    const toggles = this.params.get('toggles');
    this.readToggles = config.settings?.readToggles ?? undefined;

    if ( toggles !== undefined && toggles !== null && Object.keys(toggles).length !== 0 ) {
      this.readToggles = toggles;
    }

    this.togglesCounter = 0;
    for (const prop in this.readToggles) {
      if (this.readToggles.hasOwnProperty(prop)) {
        if (this.readToggles[prop as keyof typeof this.readToggles] === true) {
          this.togglesCounter++;
        }
      }
    }

    this.show = readPopoverService.show;
    this.fontsize = readPopoverService.fontsize;
  }

  close() {
    this.viewCtrl.dismiss();
  }

  toggleAll( e: any ) {
    console.log(e);
    if ( e.detail.checked === true ) {
      if (this.readToggles.comments) {
        this.show.comments = true;
      }
      if (this.readToggles.personInfo) {
        this.show.personInfo = true;
      }
      if (this.readToggles.placeInfo) {
        this.show.placeInfo = true;
      }
      if (this.readToggles.workInfo) {
        this.show.workInfo = true;
      }
      if (this.readToggles.changes) {
        this.show.changes = true;
      }
      if (this.readToggles.normalisations) {
        this.show.normalisations = true;
      }
      if (this.readToggles.abbreviations) {
        this.show.abbreviations = true;
      }
      if (this.readToggles.paragraphNumbering) {
        this.show.paragraphNumbering = true;
      }
      if (this.readToggles.pageBreakOriginal) {
        this.show.pageBreakOriginal = true;
      }
      if (this.readToggles.pageBreakEdition) {
        this.show.pageBreakEdition = true;
      }
    } else {
      this.show.comments = false;
      this.show.personInfo = false;
      this.show.placeInfo = false;
      this.show.workInfo = false;
      this.show.changes = false;
      this.show.normalisations = false;
      this.show.abbreviations = false;
      this.show.paragraphNumbering = false;
      this.show.pageBreakOriginal = false;
      this.show.pageBreakEdition = false;
    }
    this.toggleComments();
    this.togglePersonInfo();
    this.togglePlaceInfo();
    this.toggleWorkInfo();
    this.toggleChanges();
    this.toggleNormalisations();
    this.toggleAbbreviations();
    this.toggleParagraphNumbering();
    this.togglePageBreakOriginal();
    this.togglePageBreakEdition();
  }

  toggleComments() {
    this.readPopoverService.show.comments = this.show.comments;
  }

  togglePersonInfo() {
    this.readPopoverService.show.personInfo = this.show.personInfo;
  }

  togglePlaceInfo() {
    this.readPopoverService.show.placeInfo = this.show.placeInfo;
  }

  toggleWorkInfo() {
    this.readPopoverService.show.workInfo = this.show.workInfo;
  }

  toggleChanges() {
    this.readPopoverService.show.changes = this.show.changes;
  }

  toggleNormalisations() {
    this.readPopoverService.show.normalisations = this.show.normalisations;
  }

  toggleAbbreviations() {
    this.readPopoverService.show.abbreviations = this.show.abbreviations;
  }

  toggleParagraphNumbering() {
    this.readPopoverService.show.paragraphNumbering = this.show.paragraphNumbering;
  }

  togglePageBreakOriginal() {
    this.readPopoverService.show.pageBreakOriginal = this.show.pageBreakOriginal;
  }

  togglePageBreakEdition() {
    this.readPopoverService.show.pageBreakEdition = this.show.pageBreakEdition;
  }

  setFontSize(size: number) {
    if (size in Fontsize) {
      this.fontsize = size;
      this.readPopoverService.fontsize = this.fontsize;
      this.readPopoverService.sendFontsizeToSubscribers(this.fontsize);
    }
  }

}
