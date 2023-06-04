import { Component } from '@angular/core';
import { NavController, ModalController, NavParams } from '@ionic/angular';
import { ReferenceDataService } from 'src/app/services/reference-data/reference-data.service';


@Component({
  selector: 'page-reference-data-modal',
  templateUrl: './reference-data-modal.html',
  styleUrls: ['reference-data-modal.scss']
})
export class ReferenceDataModalPage {

  public urnResolverUrl: string;
  public referenceData: any;
  public origin: string;
  public thisPageTranslation?: boolean;
  public permaLinkTranslation?: boolean;

  constructor(  public navCtrl: NavController,
                public viewCtrl: ModalController,
                params: NavParams,
                private referenceDataService: ReferenceDataService
  ) {
    // Get url to use for resolving URNs
    this.urnResolverUrl = this.referenceDataService.getUrnResolverUrl();

    // Check if params contain info about which page has initiated the reference modal
    try {
      this.origin = String(params.get('origin'));
    } catch (e) {
      this.origin = '';
    }

    // Check if these label translations exist
    if ($localize`:@@Reference.thisPage:Hänvisa till denna sida`) {
      this.thisPageTranslation = true;
    } else {
      this.thisPageTranslation = false;
    }

    if ($localize`:@@Reference.permaLink:Beständig webbadress`) {
      this.permaLinkTranslation = true;
    } else {
      this.permaLinkTranslation = false;
    }

    const id = decodeURIComponent(String(params.get('id')).split('#')[1]);
    const idParts = id.split('/');
    let relevantParts = '';
    if ( idParts[0] !== undefined ) {
      relevantParts += idParts[0] + ((idParts[1] === undefined) ? '/' : '');
    }
    if ( idParts[1] !== undefined ) {
      relevantParts += '/' + idParts[1];
    }
    if ( idParts[2] !== undefined ) {
      relevantParts += '/' + idParts[2];
    }
    if ( idParts[3] !== undefined ) {
      relevantParts += '/' + idParts[3];
    }
    if ( idParts[4] !== undefined ) {
      relevantParts += '/' + idParts[4];
    }
    if ( idParts[5] !== undefined && idParts[5] !== 'nochapter' && idParts[5] !== 'not') {
      relevantParts += '/' + idParts[5];
    }
    this.getReferenceData(relevantParts);
  }

  ionViewDidLoad() {
  }

  getReferenceData(id: string) {
    this.referenceData = 'Loading referenceData ..';
    this.referenceDataService.getReferenceData(id).subscribe({
      next: data => {
        this.referenceData = data;
        if ( String(data).length === 0 && id.includes('/') ) {
          let newId = '';
          if (id.slice(id.lastIndexOf('/')).includes(';')) {
            newId = id.slice(0, id.lastIndexOf(';'));
          } else {
            newId = id.slice(0, id.lastIndexOf('/'));
          }
          if ( newId.length > 0 ) {
            this.getReferenceData(newId);
          }
        } else {
          /*
          this.storage.get('currentTOCItemTitle').then((currentTOCItemTitle) => {
            if ( currentTOCItemTitle !== '' && currentTOCItemTitle !== undefined && this.referenceData['reference_text'] ) {
              this.referenceData['reference_text'] =
              String(this.referenceData['reference_text']).replace('[title]', currentTOCItemTitle)
            }
            if (this.referenceData['reference_text']) {
              this.referenceData['reference_text'] = String(this.referenceData['reference_text']).trim();
              if (this.referenceData['reference_text'].substring(this.referenceData['reference_text'].length - 1) !== ',') {
                this.referenceData['reference_text'] = this.referenceData['reference_text'] + ',';
              }
              this.referenceData['reference_text'] = this.referenceData['reference_text'] + ' ';
            }
          });
          */
        }
      },
      error: e => { this.referenceData = 'Unable to get referenceData'; }
    });
  }

   dismiss() {
     this.viewCtrl.dismiss();
   }
}
