import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertButton, AlertController, AlertInput } from '@ionic/angular';
import { ReadPopoverService } from 'src/app/services/settings/read-popover.service';
import { TextService } from 'src/app/services/texts/text.service';
import { CommonFunctionsService } from 'src/app/services/common-functions/common-functions.service';
import { config } from "src/app/services/config/config";

/**
 * Generated class for the ManuscriptsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */

@Component({
  selector: 'variations',
  templateUrl: 'variations.html',
  styleUrls: ['variations.scss']
})
export class VariationsComponent {
  @Input() itemId?: string;
  @Input() linkID?: string;
  @Input() matches?: Array<string>;
  @Input() sortOrder?: number;
  @Output() openNewVarView: EventEmitter<any> = new EventEmitter();
  @Output() openNewLegendView: EventEmitter<any> = new EventEmitter();

  text: any;
  selection?: 0;
  variations: any;
  selectedVariation: any;
  selectedVariationName: string;
  errorMessage?: string;
  normalized = true;
  varID: string;
  textLoading: Boolean = true;
  showOpenLegendButton: Boolean = false;

  constructor(
    protected sanitizer: DomSanitizer,
    protected readPopoverService: ReadPopoverService,
    protected textService: TextService,
    private alertCtrl: AlertController,
    public commonFunctions: CommonFunctionsService
  ) {
    this.text = '';
    this.selectedVariationName = '';
    this.variations = [];
    this.varID = '';
    this.showOpenLegendButton = config.showOpenLegendButton?.variations ?? false;
  }

  ngOnInit() {
    this.varID = this.itemId?.split(';')[0] + '_var';
    this.setText();
  }

  openNewVar( event: Event, id: any ) {
    event.preventDefault();
    event.stopPropagation();
    id.viewType = 'variations';
    this.openNewVarView.emit(id);
  }

  setText() {
    this.getVariation();
  }

  getVariation() {
    if (!this.itemId) {
      return;
    }
    this.textService.getVariations(this.itemId).subscribe({
      next: (res) => {
        this.textLoading = false;
        this.variations = res.variations;
        if (this.variations.length > 0) {
          this.setVariation();
        } else {
          this.text = $localize`:@@Read.Variations.NoVariations:Inga tryckta varianter tillgängliga.`;
        }
      },
      error: (err) =>  {
        console.error('Error loading variants', err);
        // TODO: add translated error message
        this.text = 'Varianter kunde inte laddas.'
        this.textLoading = false;
      }
    });
  }

  setVariation() {
    const inputFilename = this.linkID + '.xml';

    const that = this;
    const inputVariation = this.variations.filter(function(item: any) {
      return (item.id + '' === that.linkID + '' || item.legacy_id + '' === that.linkID + '');
    }.bind(this))[0];

    if (this.linkID && this.linkID !== undefined && inputVariation !== undefined ) {
      this.selectedVariation = inputVariation;
      this.sortOrder = inputVariation.sort_order - 1;
    } else {
      if (this.sortOrder && this.variations[this.sortOrder] !== undefined) {
        this.selectedVariation = this.variations[this.sortOrder];
      } else {
        this.selectedVariation = this.variations[0];
        this.sortOrder = 0;
      }
    }
    this.changeVariation();
  }

  changeVariation( variation?: any ) {
    if (variation) {
      this.selectedVariation = variation;
    }
    this.selectedVariationName = this.selectedVariation.name;
    if (this.selectedVariation && this.selectedVariation.content !== undefined && this.matches) {
      this.text = this.commonFunctions.insertSearchMatchTags(this.selectedVariation.content, this.matches);
      this.text = this.sanitizer.bypassSecurityTrustHtml(
          this.text.replace(/images\//g, 'assets/images/')
            .replace(/\.png/g, '.svg').replace(/class=\"([a-z A-Z _ 0-9]{1,140})\"/g, 'class=\"teiVariant tei $1\"')
      );
    }
  }

  async selectVariation(event: any) {
    const inputs = [] as AlertInput[];
    const buttons = [] as AlertButton[];

    this.variations.forEach((variation: any, index: any) => {
      let checkedValue = false;

      if (this.selectedVariation.id === variation.id) {
        checkedValue = true;
      }

      inputs.push({
        type: 'radio',
        label: variation.name,
        value: index,
        checked: checkedValue
      });
    });

    buttons.push({ text: $localize`:@@BasicActions.Cancel:Avbryt` });
    buttons.push({
      text: $localize`:@@BasicActions.Ok:Ok`,
      handler: (index: any) => {
        this.changeVariation(this.variations[parseInt(index)]);
        this.sortOrder = parseInt(index);
        this.updateVariationSortOrderInService(event);
      }
    });

    const alert = await this.alertCtrl.create({
      header: $localize`:@@Read.Variations.SelectVariationDialogTitle:Välj variant`,
      subHeader:  $localize`:@@Read.Variations.SelectVariationDialogSubtitle:Varianten ersätter den variant som visas i kolumnen där du klickade.`,
      cssClass: 'custom-select-alert',
      buttons: buttons,
      inputs: inputs
    });    

    await alert.present();
  }

  async selectVariationForNewView() {
    const inputs = [] as AlertInput[];
    const buttons = [] as AlertButton[];

    this.variations.forEach((variation: any, index: any) => {
      inputs.push({
          type: 'radio',
          label: variation.name,
          value: index
      });
    });

    buttons.push({ text: $localize`:@@BasicActions.Cancel:Avbryt` });
    buttons.push({
      text: $localize`:@@BasicActions.Ok:Ok`,
      handler: (index: any) => {
        this.openVariationInNewView(this.variations[parseInt(index)]);
      }
    });

    const alert = await this.alertCtrl.create({
      header: $localize`:@@Read.Variations.OpenNewVariationDialogTitle:Välj variant`,
      subHeader:  $localize`:@@Read.Variations.OpenNewVariationDialogSubtitle:Varianten öppnas i en ny kolumn.`,
      cssClass: 'custom-select-alert',
      buttons: buttons,
      inputs: inputs
    });

    await alert.present();
  }

  openVariationInNewView(variation?: any) {
    variation.viewType = 'variations';
    this.textService.variationsOrder.push(variation.sort_order - 1);
    this.openNewVarView.emit(variation);
    this.commonFunctions.scrollLastViewIntoView();
  }

  openAllVariations() {
    this.variations.forEach((variation: any) => {
      if (this.selectedVariation.id !== variation.id) {
        variation.viewType = 'variations';
        this.openNewVarView.emit(variation);
      }
    });
  }

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

  /**
   * Store the sort order of the selected variation in this variations column to textService.
   * @param event Event triggered when pressing the change variation button in this variations column.
   * */
  updateVariationSortOrderInService(event: any) {
    if (event.target) {
      let currentVarElemContainer = event.target as HTMLElement;
      while (currentVarElemContainer !== null
        && !currentVarElemContainer.classList.contains('read-column')
        && currentVarElemContainer.parentElement !== null) {
          currentVarElemContainer = currentVarElemContainer.parentElement;
      }
      if (currentVarElemContainer !== null) {
        const varElemColumnIds = [] as any;
        const columnElems = Array.from(document.querySelectorAll('page-read:not([ion-page-hidden]):not(.ion-page-hidden) div.read-column'));
        if (columnElems) {
          columnElems.forEach(function(columnElem) {
            const varElem = columnElem.querySelector('variations');
            if (varElem && columnElem.id) {
              varElemColumnIds.push(columnElem.id);
            }
          });
          let currentVarElemIndex = undefined;
          for (let k = 0; k < varElemColumnIds.length; k++) {
            if (varElemColumnIds[k] === currentVarElemContainer.id) {
              currentVarElemIndex = k;
              break;
            }
          }
          if (currentVarElemIndex !== undefined && this.sortOrder) {
            this.textService.variationsOrder[currentVarElemIndex] = this.sortOrder;
          }
        }
      }
    }
  }

}
