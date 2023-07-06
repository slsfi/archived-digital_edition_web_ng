import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

import { CommonFunctionsService } from 'src/app/services/common-functions.service';
import { UserSettingsService } from 'src/app/services/user-settings.service';
import { DraggableImageDirective } from 'src/directives/draggable-image.directive';
import { isBrowser } from 'src/standalone/utility-functions';


@Component({
  standalone: true,
  selector: 'fullscreen-image-viewer',
  templateUrl: 'fullscreen-image-viewer.html',
  styleUrls: ['fullscreen-image-viewer.scss'],
  imports: [CommonModule, FormsModule, IonicModule, DraggableImageDirective]
})
export class FullscreenImageViewerModal implements OnInit {
  @Input() activeImageIndex: number = 0;
  @Input() backsides: any[] = [];
  @Input() imageDescriptions: string[] = [];
  @Input() imageTitles: string[] = [];
  @Input() imageURLs: string[] = [];

  angle = 0;
  inputImageNumber = 1;
  prevX = 0;
  prevY = 0;
  showDescription = true;
  showBackside = false;
  toolbarHeight = 0;
  zoom = 1.0;

  constructor(
    private modalCtrl: ModalController,
    public commonFunctions: CommonFunctionsService,
    public userSettingsService: UserSettingsService
  ) {}

  @HostListener('document:keyup.arrowleft') onKeyArrowLeft() {
    this.previous();
  }

  @HostListener('document:keyup.arrowright') onKeyArrowRight() {
    this.next();
  }

  ngOnInit() {
    // Append dot to image titles
    if (this.imageTitles.length > 0) {
      for (let x = 0; x < this.imageTitles.length; x++) {
        if (
          this.imageTitles[x] &&
          this.imageTitles[x] !== 'null'
        ) {
          if (
            this.imageTitles[x].slice(-1) !== '.' &&
            this.imageTitles[x].slice(-1) !== '!' &&
            this.imageTitles[x].slice(-1) !== ':'
          ) {
            this.imageTitles[x] = this.imageTitles[x].trim() + '.';
          }
        }
      }
    }

    if (this.activeImageIndex < 0 || this.activeImageIndex > this.imageURLs.length - 1) {
      this.activeImageIndex = 0;
    }

    this.inputImageNumber = this.activeImageIndex + 1;

    // Loop through backsides array and check if backside image-files actually exist
    if (isBrowser() && this.backsides.length > 0) {
      for (let i = 0; i < this.backsides.length; i++) {
        this.commonFunctions.urlExists(this.backsides[i]).then((res) => {
          if (res < 1) {
            this.backsides[i] = null;
          }
        });
      }
    }
  }

  ionViewDidEnter() {
    if (isBrowser()) {
      this.toolbarHeight = this.getToolbarHeight();
    }
  }

  closeModal() {
    return this.modalCtrl.dismiss(this.inputImageNumber, 'imageNr');
  }

  previous() {
    this.activeImageIndex = this.activeImageIndex - 1;
    this.checkImageIndexValidity();
  }

  next() {
    this.activeImageIndex = this.activeImageIndex + 1;
    this.checkImageIndexValidity();
  }

  private checkImageIndexValidity() {
    if (this.activeImageIndex < 0) {
      this.activeImageIndex = this.imageURLs.length - 1;
      this.inputImageNumber = this.imageURLs.length;
    } else if (this.activeImageIndex > this.imageURLs.length - 1) {
      this.activeImageIndex = 0;
    }
    this.inputImageNumber = this.activeImageIndex + 1;
    
    if (isBrowser()) {
      setTimeout(() => {
        this.toolbarHeight = this.getToolbarHeight();
      }, 500);
    }
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
    if ( this.angle >= 360 ) {
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

  toggleImageDescription() {
    this.showDescription = !this.showDescription;
    if (isBrowser()) {
      setTimeout(() => {
        this.toolbarHeight = this.getToolbarHeight();
      }, 500);
    }
  }

  setImageNr(event: any) {
    if (this.inputImageNumber < 1) {
      this.inputImageNumber = 1;
    } else if (this.inputImageNumber > this.imageURLs.length) {
      this.inputImageNumber = this.imageURLs.length;
    }
    this.activeImageIndex = this.inputImageNumber - 1;
  }

  getBacksideUrl(frontsideUrl: any) {
    return frontsideUrl.replace('.jpg', 'B.jpg');
  }

  private getToolbarHeight() {
    const toolbarElem = document.querySelector('.facsimile-button-group');
    return Math.ceil(toolbarElem?.getBoundingClientRect().bottom || 137);
  }

}
