import { Component, EventEmitter, Input, OnInit, Output, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertButton, AlertController, AlertInput, ModalController } from '@ionic/angular';
import { FullscreenImageViewerModal } from 'src/app/modals/fullscreen-image-viewer/fullscreen-image-viewer';
import { Facsimile } from 'src/app/models/facsimile.model';
import { FacsimileService } from 'src/app/services/facsimile/facsimile.service';
import { ReadPopoverService } from 'src/app/services/settings/read-popover.service';
import { CommonFunctionsService } from 'src/app/services/common-functions/common-functions.service';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';
import { config } from "src/assets/config/config";


@Component({
  selector: 'facsimiles',
  templateUrl: 'facsimiles.html',
  styleUrls: ['facsimiles.scss']
})
export class FacsimilesComponent implements OnInit {
  @Input() textItemID: string = '';
  @Input() facsID: number | undefined = undefined;
  @Input() imageNr: number | undefined = undefined;
  @Output() selectedFacsID = new EventEmitter<number>();
  @Output() selectedImageNr = new EventEmitter<number | null>();
  
  angle: number = 0;
  externalFacsimiles: any[] = [];
  facsURLAlternate: string = '';
  facsNumber: number = 1;
  facsimiles: any[] = [];
  facsSize: number | null = 1;
  facsURLDefault: string = '';
  numberOfImages: number = 0;
  prevX: number = 0;
  prevY: number = 0;
  selectedFacsimile: any | null = null;
  selectedFacsimileIsExternal: boolean = false;
  showTitle: boolean = true;
  text: any = '';
  zoom: number = 1.0;

  constructor(
    private alertCtrl: AlertController,
    private commonFunctions: CommonFunctionsService,
    private facsimileService: FacsimileService,
    private modalCtrl: ModalController,
    public readPopoverService: ReadPopoverService,
    private sanitizer: DomSanitizer,
    public userSettingsService: UserSettingsService
  ) {
    this.facsSize = config.component?.facsimileColumn?.imageQuality ?? 1;
    this.facsURLAlternate = config.app?.facsimileBase ?? '';
    this.showTitle = config.component?.facsimileColumn?.showFacsimileTitle ?? true;
  }

  ngOnInit() {
    if (this.textItemID) {
      this.loadFacsimiles();
    }
  }

  loadFacsimiles() {
    this.facsimileService.getFacsimiles(this.textItemID).subscribe({
      next: (facs) => {
        if (facs && facs.length > 0) {
          const sectionId = this.textItemID.split('_')[2]?.split(';')[0]?.replace('ch', '') || '';
          for (const f of facs) {
            const facsimile = new Facsimile(f);
            facsimile.itemId = this.textItemID;
            facsimile.manuscript_id = f.publication_manuscript_id;
            if (!f['external_url']) {
              facsimile.title = this.sanitizer.sanitize(
                SecurityContext.HTML,
                this.sanitizer.bypassSecurityTrustHtml(f['title'])
              );
            }
            if (f['external_url'] && !f['folder_path']) {
              this.externalFacsimiles.push({'title': f['title'], 'url': f['external_url'], 'priority': f['priority']});
            } else {
              if (sectionId !== '') {
                if (String(f['section_id']) === sectionId) {
                  this.facsimiles.push(facsimile);
                }
              } else {
                this.facsimiles.push(facsimile);
              }
            }
          }
          if (this.facsimiles.length > 1) {
            this.commonFunctions.sortArrayOfObjectsNumerically(this.facsimiles, 'priority', 'asc');
          }
          if (this.externalFacsimiles.length > 1) {
            this.commonFunctions.sortArrayOfObjectsNumerically(this.externalFacsimiles, 'priority', 'asc');
          }
          this.setInitialFacsimile();
        } else {
          this.text = $localize`:@@Read.Facsimiles.NoFacsimiles:Inga faksimil tillgängliga.`;
        }
      },
      error: (e) => {
        console.log(e);
        this.text = $localize`:@@Read.Facsimiles.Error:Ett fel har uppstått. Faksimil kunde inte hämtas.`;
      }
    });
  }

  setInitialFacsimile() {
    if (this.facsimiles.length > 0) {
      if (this.facsID !== undefined && this.facsID > 0) {
        const inputFacsimile = this.facsimiles.filter((item: any) => {
          return (item.facsimile_id === this.facsID);
        })[0];
        if (inputFacsimile) {
          this.selectedFacsimile = inputFacsimile;
        } else {
          this.selectedFacsimile = this.facsimiles[0];
        }
      } else if (
        this.externalFacsimiles.length > 0 && 
        (
          (this.facsID !== undefined && this.facsID < 1) ||
          this.externalFacsimiles[0]['priority'] < this.facsimiles[0]['priority']
        )
      ) {
        this.selectedFacsimileIsExternal = true;
        this.emitSelectedFacsimileId(0);
      } else {
        this.selectedFacsimile = this.facsimiles[0];
      }
  
      if (this.selectedFacsimile) {
        this.initializeDisplayedFacsimile(this.selectedFacsimile, this.imageNr);
      }
    } else {
      this.selectedFacsimileIsExternal = true;
    }
  }

  changeFacsimile(facs?: any) {
    if (facs === 'external') {
      this.selectedFacsimileIsExternal = true;
      this.emitSelectedFacsimileId(0);
      this.emitImageNumber(null);
    } else if (facs) {
      this.initializeDisplayedFacsimile(facs);
      this.reset();
    }
  }

  private initializeDisplayedFacsimile(facs: any, extImageNr?: number) {
    this.selectedFacsimileIsExternal = false;
    this.selectedFacsimile = facs;
    this.numberOfImages = facs.number_of_pages;
    this.facsURLDefault = config.app.apiEndpoint + '/' + config.app.machineName +
    `/facsimiles/${facs.publication_facsimile_collection_id}/`;
    this.text = this.sanitizer.bypassSecurityTrustHtml(
      facs.content?.replace(/images\//g, 'assets/images/').replace(/\.png/g, '.svg')
    );

    if (extImageNr !== undefined) {
      this.facsNumber = extImageNr;
    } else {
      this.facsNumber = facs.page;
    }
    this.facsNumber < 1 ? this.facsNumber = 1 : (
      this.facsNumber > this.numberOfImages ? this.facsNumber = this.numberOfImages : this.facsNumber
    );

    if (this.facsimiles.length > 1 || this.externalFacsimiles.length > 0) {
      this.emitSelectedFacsimileId(facs.facsimile_id);
    }

    if (this.numberOfImages > 1) {
      this.emitImageNumber(this.facsNumber);
    } else {
      this.emitImageNumber(null);
    }
  }

  async presentSelectFacsimileAlert() {
    const inputs = [] as AlertInput[];
    const buttons = [] as AlertButton[];

    if (this.externalFacsimiles.length > 0) {
      inputs.push({
        type: 'radio',
        label: $localize`:@@Read.Facsimiles.ExternalHeading:Externa faksimil`,
        value: '-1',
        checked: this.selectedFacsimileIsExternal
      });
    }

    this.facsimiles.forEach((facsimile: any, index: any) => {
      let checkedValue = false;

      if (
        !this.selectedFacsimileIsExternal &&
        (
          this.selectedFacsimile.facsimile_id === facsimile.facsimile_id &&
          (
            this.selectedFacsimile.page === undefined &&
            this.selectedFacsimile.first_page === facsimile.page ||
            this.selectedFacsimile.page === facsimile.page
          )
        )
      ) {
        checkedValue = true;
      }

      // Tags are stripped from the title which is shown as the label
      inputs.push({
        type: 'radio',
        label: facsimile.title.replace(/(<([^>]+)>)/gi, ''),
        value: String(index),
        checked: checkedValue
      });
    });

    buttons.push({ text: $localize`:@@BasicActions.Cancel:Avbryt` });
    buttons.push({
      text: $localize`:@@BasicActions.Ok:Ok`,
      handler: (index: string) => {
        if (parseInt(index) < 0) {
          this.changeFacsimile('external');
        } else {
          this.changeFacsimile(this.facsimiles[parseInt(index)]);
        }
      }
    });

    const alert = await this.alertCtrl.create({
      header: $localize`:@@Read.Facsimiles.SelectFacsDialogTitle:Välj faksimil`,
      subHeader: $localize`:@@Read.Facsimiles.SelectFacsDialogSubtitle:Faksimilet ersätter det faksimil som visas i kolumnen där du klickade.`,
      cssClass: 'custom-select-alert',
      buttons: buttons,
      inputs: inputs
    });

    await alert.present();
  }

  emitSelectedFacsimileId(id: number) {
    this.selectedFacsID.emit(id);
  }

  emitImageNumber(nr: number | null) {
    this.selectedImageNr.emit(nr);
  }

  setImageNr(e?: any) {
    if (this.facsNumber < 1) {
      this.facsNumber = 1;
    } else if (this.facsNumber > this.numberOfImages) {
      this.facsNumber = this.numberOfImages;
    }
    this.emitImageNumber(this.facsNumber);
  }

  async openFullScreen() {
    const fullscreenImageSize = config.modal?.fullscreenImageViewer?.imageQuality || this.facsSize;
    const imageURLs = [];
    for (let i = 1; i < (this.numberOfImages || 0) + 1; i++) {
      const url = (
          this.facsURLAlternate ?
              this.facsURLAlternate+'/'+this.selectedFacsimile.publication_facsimile_collection_id+'/'+fullscreenImageSize+'/'+i+'.jpg' :
              this.facsURLDefault+i+(fullscreenImageSize ? '/'+fullscreenImageSize : '')
      )
      imageURLs.push(url);
    }

    const params = {
      activeImageIndex: this.facsNumber - 1,
      imageURLs: imageURLs
    };

    const modal = await this.modalCtrl.create({
      component: FullscreenImageViewerModal,
      componentProps: params,
      cssClass: 'fullscreen-image-viewer-modal',
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'imageNr' && data) {
      this.facsNumber = data;
      this.setImageNr();
    }
  }
  
  previous() {
    if (this.facsNumber > 1) {
      this.facsNumber--;
    } else {
      this.facsNumber = this.numberOfImages;
    }
    this.emitImageNumber(this.facsNumber);
  }

  next() {
    if (this.facsNumber < this.numberOfImages) {
      this.facsNumber++;
    } else {
      this.facsNumber = 1;
    }
    this.emitImageNumber(this.facsNumber);
  }

  zoomIn() {
    this.zoom = this.zoom + 0.1;
  }

  zoomOut() {
    this.zoom = this.zoom - 0.1;
    if (this.zoom < 0.5) {
      this.zoom = 0.5;
    }
  }

  rotate() {
    this.angle += 90;
    if (this.angle >= 360) {
      this.angle = 0;
    }
  }

  reset() {
    this.zoom = 1.0;
    this.angle = 0;
    this.prevX = 0;
    this.prevY = 0;
  }

  zoomWithMouseWheel(event: any) {
    if (event.target) {
      if (event.deltaY > 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
      event.target.style.transform = 'scale('+this.zoom+') translate3d('+this.prevX+'px, '+this.prevY+'px, 0px) rotate('+this.angle+'deg)';
    }
  }

  setImageCoordinates(coordinates: number[]) {
    this.prevX = coordinates[0];
    this.prevY = coordinates[1];
  }

}
