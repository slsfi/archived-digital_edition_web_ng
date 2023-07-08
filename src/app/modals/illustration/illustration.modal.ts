import { Component, Inject, Input, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';

import { FullscreenImageViewerModal } from 'src/app/modals/fullscreen-image-viewer/fullscreen-image-viewer.modal';
import { GalleryService } from 'src/app/services/gallery.service';
import { config } from "src/assets/config/config";


@Component({
  standalone: true,
  selector: 'modal-illustration',
  templateUrl: 'illustration.modal.html',
  styleUrls: ['illustration.modal.scss'],
  imports: [CommonModule, RouterModule, IonicModule, FullscreenImageViewerModal]
})
export class IllustrationModal {
  @Input() imageNumber: string = '';

  imgPath: string = '';
  imgMetadata: Record<string, any> | undefined | null = undefined;

  constructor(
    private modalCtrl: ModalController,
    private galleryService: GalleryService,
    @Inject(LOCALE_ID) private activeLocale: string
  ) {}

  ngOnInit() {
    this.getImageMetadata();
  }

  private getImageMetadata() {
    this.galleryService.getMediaMetadata(this.imageNumber, this.activeLocale).subscribe(
      (data: any) => {
        this.imgMetadata = data;
        if (data?.media_collection_id && data?.image_filename_front) {
          this.imgPath = config.app.apiEndpoint + '/'
          + config.app.machineName + '/gallery/get/'
          + data.media_collection_id + '/'
          + data.image_filename_front;
        }
      }
    );
  }

  async zoomImage() {
    const params = {
      activeImageIndex: 0,
      imageURLs: [this.imgPath]
    };

    const modal = await this.modalCtrl.create({
      component: FullscreenImageViewerModal,
      componentProps: params,
      cssClass: 'fullscreen-image-viewer-modal'
    });
    modal.present();
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

}
