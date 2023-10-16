import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

import { FullscreenImageViewerModal } from '@modals/fullscreen-image-viewer/fullscreen-image-viewer.modal';
import { CommonFunctionsService } from '@services/common-functions.service';
import { ReadPopoverService } from '@services/read-popover.service';
import { TextService } from '@services/text.service';


@Component({
  standalone: true,
  selector: 'illustrations',
  templateUrl: 'illustrations.html',
  styleUrls: ['illustrations.scss'],
  imports: [CommonModule, IonicModule]
})
export class IllustrationsComponent implements OnChanges, OnInit {
  @Input() singleImage: Record<string, any> | undefined = undefined;
  @Input() textItemID: string = '';
  @Output() showAllImages: EventEmitter<any> = new EventEmitter();
  
  imageCountTotal: number = 0;
  images: Array<any> = [];
  imagesCache: Array<any> = [];
  selectedImage: Array<string> = [];
  imgLoading: boolean = true;
  viewAll: boolean = true;

  constructor(
    private commonFunctions: CommonFunctionsService,
    private modalCtrl: ModalController,
    public readPopoverService: ReadPopoverService,
    private textService: TextService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        if (propName === 'singleImage') {
          if (
            !changes.singleImage.firstChange &&
            typeof this.singleImage !== 'undefined' &&
            this.singleImage
          ) {
            this.images = [];
            this.images.push(this.singleImage);
            this.viewAll = false;
          }
        }
      }
    }
  }

  ngOnInit() {
    if (this.textItemID) {
      this.getIllustrationImages();
    }
  }

  private getIllustrationImages() {
    this.textService.getEstablishedTextIllustrations(this.textItemID).subscribe(
      (images: any[]) => {
        this.images = images;
        this.imageCountTotal = this.images.length;
        this.imagesCache = this.images;
        if (typeof this.singleImage !== 'undefined' && this.singleImage) {
          this.images = [];
          this.images.push(this.singleImage);
          this.viewAll = false;
        }
        this.imgLoading = false;
      }
    );
  }

  showSingleImage(image: any) {
    if (image) {
      this.viewAll = false;
      this.images = [image];
    } else {
      this.viewAllIllustrations();
    }
  }

  viewAllIllustrations() {
    this.viewAll = true;
    this.images = this.imagesCache;
    this.showAllImages.emit(null);
  }

  async zoomImage(imageSrc: string) {
    this.selectedImage = [imageSrc];

    const params = {
      activeImageIndex: 0,
      imageURLs: this.selectedImage
    };

    const illustrationZoomModal = await this.modalCtrl.create({
      component: FullscreenImageViewerModal,
      componentProps: params,
      cssClass: 'fullscreen-image-viewer-modal'
    });

    illustrationZoomModal.present();
  }

  scrollToPositionInText(image: any) {
    const imageSrc = image.src;
    let imageFilename = '';
    if (imageSrc) {
      imageFilename = imageSrc.substring(imageSrc.lastIndexOf('/') + 1);
      let target = null as HTMLElement | null;
      const readtextElem = document.querySelector(
        'page-text:not([ion-page-hidden]):not(.ion-page-hidden) read-text'
      );
      try {
        if (image.class === 'doodle') {
          // Get the image filename without format and prepend tag_ to it
          let imageDataId = 'tag_' + imageFilename.substring(0, imageFilename.lastIndexOf('.'));
          target = readtextElem?.querySelector(`img.doodle[data-id="${imageDataId}"]`) as HTMLElement;
          if (target === null) {
            // Try dropping the prefix 'tag_' from image data-id as unknown pictograms don't have this
            imageDataId = imageDataId.replace('tag_', '');
            target = readtextElem?.querySelector(`img.doodle[data-id="${imageDataId}"]`) as HTMLElement;
          }
          if (
            target?.previousElementSibling
          ) {
            if (target.previousElementSibling.previousElementSibling?.classList.contains('ttNormalisations')) {
              // Change the scroll target from the doodle icon itself to the preceding word which the icon represents.
              target = target.previousElementSibling.previousElementSibling as HTMLElement;
            }
          } else if (target?.parentElement?.classList.contains('ttNormalisations')) {
            target = target.parentElement as HTMLElement;
          }
        } else {
          // Get the image element with src-attribute value ending in image filename
          const imageSrcFilename = '/' + imageFilename;
          target = readtextElem?.querySelector(`[src$="${imageSrcFilename}"]`) as HTMLElement;
        }

        if (target?.parentElement) {
          if (image.class !== 'visible-illustration') {
            // Prepend arrow to the image/icon in the reading text and scroll into view
            const tmpImage: HTMLImageElement = new Image();
            tmpImage.src = 'assets/images/ms_arrow_right.svg';
            tmpImage.alt = 'ms arrow right image';
            tmpImage.classList.add('inl_ms_arrow');
            target.parentElement.insertBefore(tmpImage, target);
            this.commonFunctions.scrollElementIntoView(tmpImage);
            setTimeout(function() {
              target?.parentElement?.removeChild(tmpImage);
            }, 5000);
          } else {
            this.commonFunctions.scrollElementIntoView(target, 'top', 75);
          }
        } else {
          console.log('Unable to find target when scrolling to image position in text, imageSrc:', imageSrc);
        }
      } catch (e) {
        console.log('Error scrolling to image position in text.');
      }
    } else {
      console.log('Empty src-attribute for image, unable to scroll to position in text.');
    }
  }

}
