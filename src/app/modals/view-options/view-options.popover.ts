import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, PopoverController } from '@ionic/angular';

import { Fontsize, ReadPopoverService } from 'src/app/services/read-popover.service';
import { config } from "src/assets/config/config";


@Component({
  standalone: true,
  selector: 'popover-view-options',
  templateUrl: 'view-options.popover.html',
  styleUrls: ['view-options.popover.scss'],
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ViewOptionsPopover implements OnInit {
  @Input() toggles: any = undefined;

  optionsToggles: {
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
    private popoverCtrl: PopoverController,
    public viewOptionsService: ReadPopoverService
  ) {
    this.optionsToggles = config.page?.text?.viewOptions ?? undefined;
  }

  ngOnInit(): void {
    if (
      this.toggles !== undefined &&
      this.toggles !== null &&
      Object.keys(this.toggles).length !== 0
    ) {
      this.optionsToggles = this.toggles;
    }

    this.togglesCounter = 0;
    for (const prop in this.optionsToggles) {
      if (this.optionsToggles.hasOwnProperty(prop)) {
        if (this.optionsToggles[prop as keyof typeof this.optionsToggles] === true) {
          this.togglesCounter++;
        }
      }
    }

    this.show = this.viewOptionsService.show;
    this.fontsize = this.viewOptionsService.fontsize;
  }

  close() {
    this.popoverCtrl.dismiss();
  }

  toggleAll(e: any) {
    if (e.detail.checked === true) {
      if (this.optionsToggles.comments) {
        this.show.comments = true;
      }
      if (this.optionsToggles.personInfo) {
        this.show.personInfo = true;
      }
      if (this.optionsToggles.placeInfo) {
        this.show.placeInfo = true;
      }
      if (this.optionsToggles.workInfo) {
        this.show.workInfo = true;
      }
      if (this.optionsToggles.changes) {
        this.show.changes = true;
      }
      if (this.optionsToggles.normalisations) {
        this.show.normalisations = true;
      }
      if (this.optionsToggles.abbreviations) {
        this.show.abbreviations = true;
      }
      if (this.optionsToggles.paragraphNumbering) {
        this.show.paragraphNumbering = true;
      }
      if (this.optionsToggles.pageBreakOriginal) {
        this.show.pageBreakOriginal = true;
      }
      if (this.optionsToggles.pageBreakEdition) {
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
    this.viewOptionsService.show.comments = this.show.comments;
  }

  togglePersonInfo() {
    this.viewOptionsService.show.personInfo = this.show.personInfo;
  }

  togglePlaceInfo() {
    this.viewOptionsService.show.placeInfo = this.show.placeInfo;
  }

  toggleWorkInfo() {
    this.viewOptionsService.show.workInfo = this.show.workInfo;
  }

  toggleChanges() {
    this.viewOptionsService.show.changes = this.show.changes;
  }

  toggleNormalisations() {
    this.viewOptionsService.show.normalisations = this.show.normalisations;
  }

  toggleAbbreviations() {
    this.viewOptionsService.show.abbreviations = this.show.abbreviations;
  }

  toggleParagraphNumbering() {
    this.viewOptionsService.show.paragraphNumbering = this.show.paragraphNumbering;
  }

  togglePageBreakOriginal() {
    this.viewOptionsService.show.pageBreakOriginal = this.show.pageBreakOriginal;
  }

  togglePageBreakEdition() {
    this.viewOptionsService.show.pageBreakEdition = this.show.pageBreakEdition;
  }

  setFontSize(size: number) {
    if (size in Fontsize) {
      this.fontsize = size;
      this.viewOptionsService.fontsize = this.fontsize;
      this.viewOptionsService.sendFontsizeToSubscribers(this.fontsize);
    }
  }

}
