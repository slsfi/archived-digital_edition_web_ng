import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AlertButton, AlertController, AlertInput, IonicModule } from '@ionic/angular';

import { ScrollService } from '@services/scroll.service';
import { HtmlParserService } from '@services/html-parser.service';
import { ReadPopoverService } from '@services/read-popover.service';
import { TextService } from '@services/text.service';
import { config } from '@config';


@Component({
  standalone: true,
  selector: 'variants',
  templateUrl: 'variants.html',
  styleUrls: ['variants.scss'],
  imports: [CommonModule, IonicModule]
})
export class VariantsComponent implements OnInit {
  @Input() searchMatches: Array<string> = [];
  @Input() sortOrder: number | undefined = undefined;
  @Input() textItemID: string = '';
  @Input() varID: number | undefined = undefined;
  @Output() openNewLegendView: EventEmitter<any> = new EventEmitter();
  @Output() openNewVarView: EventEmitter<any> = new EventEmitter();
  @Output() selectedVarID = new EventEmitter<number>();
  @Output() selectedVarName = new EventEmitter<string>();
  @Output() selectedVarSortOrder = new EventEmitter<number>();

  intervalTimerId: number = 0;
  selectedVariant: any = undefined;
  showOpenLegendButton: boolean = false;
  text: SafeHtml = '';
  variants: any[] = [];

  constructor(
    private alertCtrl: AlertController,
    private commonFunctions: ScrollService,
    private elementRef: ElementRef,
    private parserService: HtmlParserService,
    public readPopoverService: ReadPopoverService,
    private sanitizer: DomSanitizer,
    private textService: TextService
  ) {
    this.showOpenLegendButton = config.component?.variants?.showOpenLegendButton ?? false;
  }

  ngOnInit() {
    if (this.textItemID) {
      this.loadVariantTexts();
    }
  }

  loadVariantTexts() {
    this.textService.getCollectionVariantTexts(this.textItemID).subscribe({
      next: (res) => {
        if (res?.variations?.length > 0) {
          this.variants = res.variations;
          this.setVariant();
          if (this.searchMatches.length) {
            this.commonFunctions.scrollToFirstSearchMatch(this.elementRef.nativeElement, this.intervalTimerId);
          }
        } else {
          this.text = $localize`:@@Read.Variants.NoVariations:Inga tryckta varianter tillgängliga.`;
        }
      },
      error: (e) => {
        console.error(e);
        this.text = $localize`:@@Read.Variants.Error:Ett fel har uppstått. Varianter kunde inte laddas.`
      }
    });
  }

  setVariant() {
    if (this.varID) {
      const inputVariant = this.variants.filter((item: any) => {
        return (item.id === this.varID);
      })[0];
      if (inputVariant) {
        this.selectedVariant = inputVariant;
      }
    } else if (this.sortOrder) {
      const inputVariant = this.variants.filter((item: any) => {
        return (item.sort_order === this.sortOrder);
      })[0];
      this.selectedVariant = inputVariant ? inputVariant : this.variants[0];
    } else {
      this.selectedVariant = this.variants[0];
    }
    this.emitOutputValues(this.selectedVariant);
    this.changeVariant();
  }

  changeVariant(variant?: any) {
    if (
      variant &&
      this.selectedVariant?.id !== variant.id
    ) {
      this.selectedVariant = variant;
      this.emitOutputValues(this.selectedVariant);
    }
    if (this.selectedVariant) {
      let text = this.postprocessVariantText(this.selectedVariant.content);
      text = this.parserService.insertSearchMatchTags(text, this.searchMatches);
      this.text = this.sanitizer.bypassSecurityTrustHtml(text);
    }
  }

  postprocessVariantText(text: string) {
    text = text.trim();
    // Replace png images with svg counterparts
    text = text.replace(/\.png/g, '.svg');
    // Fix image paths
    text = text.replace(/images\//g, 'assets/images/');
    // Add "tei" and "teiVariant" to all classlists
    text = text.replace(
      /class=\"([a-z A-Z _ 0-9]{1,140})\"/g,
      'class=\"teiVariant tei $1\"'
    );
    return text;
  }

  async selectVariant(event: any) {
    const inputs = [] as AlertInput[];
    const buttons = [] as AlertButton[];

    this.variants.forEach((variant: any, index: any) => {
      let checkedValue = false;

      if (this.selectedVariant.id === variant.id) {
        checkedValue = true;
      }

      inputs.push({
        type: 'radio',
        label: variant.name,
        value: index,
        checked: checkedValue
      });
    });

    buttons.push({ text: $localize`:@@BasicActions.Cancel:Avbryt` });
    buttons.push({
      text: $localize`:@@BasicActions.Ok:Ok`,
      handler: (index: any) => {
        this.changeVariant(this.variants[parseInt(index)]);
      }
    });

    const alert = await this.alertCtrl.create({
      header: $localize`:@@Read.Variants.SelectVariationDialogTitle:Välj variant`,
      subHeader:  $localize`:@@Read.Variants.SelectVariationDialogSubtitle:Varianten ersätter den variant som visas i kolumnen där du klickade.`,
      cssClass: 'custom-select-alert',
      buttons: buttons,
      inputs: inputs
    });    

    await alert.present();
  }

  async selectVariantForNewView() {
    const inputs = [] as AlertInput[];
    const buttons = [] as AlertButton[];

    this.variants.forEach((variant: any, index: any) => {
      inputs.push({
        type: 'radio',
        label: variant.name,
        value: index
      });
    });

    buttons.push({ text: $localize`:@@BasicActions.Cancel:Avbryt` });
    buttons.push({
      text: $localize`:@@BasicActions.Ok:Ok`,
      handler: (index: any) => {
        this.openVariationInNewView(this.variants[parseInt(index)]);
      }
    });

    const alert = await this.alertCtrl.create({
      header: $localize`:@@Read.Variants.OpenNewVariationDialogTitle:Välj variant`,
      subHeader:  $localize`:@@Read.Variants.OpenNewVariationDialogSubtitle:Varianten öppnas i en ny kolumn.`,
      cssClass: 'custom-select-alert',
      buttons: buttons,
      inputs: inputs
    });

    await alert.present();
  }

  emitOutputValues(variant: any) {
    // Emit the var id so the read page can update queryParams
    this.emitSelectedVariantId(variant.id);
    // Emit the var sort_order so the read page can update queryParams
    this.emitSelectedVariantSortOrder(variant.sort_order);
    // Emit the var name so the read page can display it in the column header
    this.emitSelectedVariantName(variant.name);
  }

  emitSelectedVariantId(id: number) {
    this.selectedVarID.emit(id);
  }

  emitSelectedVariantName(name: string) {
    this.selectedVarName.emit(name);
  }

  emitSelectedVariantSortOrder(order: number) {
    this.selectedVarSortOrder.emit(order);
  }

  openNewVar(event: Event, id: any) {
    event.preventDefault();
    event.stopPropagation();
    id.viewType = 'variants';
    this.openNewVarView.emit(id);
  }

  openVariationInNewView(variant?: any) {
    variant.viewType = 'variants';
    this.openNewVarView.emit(variant);
    this.commonFunctions.scrollLastViewIntoView();
  }

  /*
  openAllVariations() {
    this.variants.forEach((variant: any) => {
      if (this.selectedVariant.id !== variant.id) {
        variant.viewType = 'variants';
        this.openNewVarView.emit(variant);
      }
    });
  }
  */

  openNewLegend(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const id = {
      viewType: 'legend',
      id: 'var-legend'
    }
    this.openNewLegendView.emit(id);
    this.commonFunctions.scrollLastViewIntoView();
  }

}
