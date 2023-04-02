import { Component } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { CommonFunctionsService } from 'src/app/services/common-functions/common-functions.service';
import { EventsService } from 'src/app/services/events/events.service';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';

/**
 * Generated class for the FacsimileZoomPage page.
 *
 * Zoom facsimile.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-facsimile-zoom',
  templateUrl: 'facsimile-zoom.html',
  styleUrls: ['facsimile-zoom.scss']
})
export class FacsimileZoomModalPage {

  images: any[] = [];
  backsides: any;
  descriptions: any;
  imageTitles: any;
  activeImage: any;
  zoom = 1.0;
  angle = 0;
  latestDeltaX = 0;
  latestDeltaY = 0;
  prevX = 0;
  prevY = 0;
  toolbarHeight = 0;

  facsUrl = '';
  facsimilePagesInfinite = false;
  showBackside = false;
  facsSize?: number;
  facsPage: any;
  facsNumber = 0;
  manualPageNumber = 1;
  showAboutHelp = true;

  constructor(
    public viewCtrl: ModalController,
    public navParams: NavParams,
    private events: EventsService,
    public commonFunctions: CommonFunctionsService,
    public userSettingsService: UserSettingsService
  ) {
    this.manualPageNumber = 1;
    this.backsides = [];
  }

  rotate() {
    this.angle += 90;
    if ( this.angle >= 360 ) {
      this.angle = 0;
    }
  }

  cancel() {
    this.viewCtrl.dismiss(this.viewCtrl);
  }

  ionViewWillLeave() {
    this.events.publishIonViewWillLeave(this.constructor.name);
  }
  ionViewWillEnter() {
    this.events.publishIonViewWillEnter(this.constructor.name);
  }

  ionViewWillLoad() {
    this.facsSize = this.navParams.get('facsSize');

    if (this.navParams.get('facsimilePagesInfinite')) {
      this.facsimilePagesInfinite = true;
      this.facsUrl = this.navParams.get('facsUrl');
      this.facsNumber = this.navParams.get('facsNr');
    } else {
      this.images = this.navParams.get('images');

      try {
        this.descriptions = this.navParams.get('descriptions');
        if (this.descriptions === undefined) {
          this.descriptions = [];
        }
      } catch (e) {
        this.descriptions = [];
      }

      try {
        this.imageTitles = this.navParams.get('imageTitles');
        if (this.imageTitles === undefined) {
          this.imageTitles = [];
        }
      } catch (e) {
        this.imageTitles = [];
      }

      /* Append dot to title */
      if (this.imageTitles.length > 0) {
        for (let x = 0; x < this.imageTitles.length; x++) {
          if (this.imageTitles[x] !== '' && this.imageTitles[x] !== 'null'
          && this.imageTitles[x] !== undefined && this.imageTitles[x] !== null) {
            if (this.imageTitles[x].slice(-1) !== '.') {
              this.imageTitles[x] = this.imageTitles[x].trim() + '.';
            }
          }
        }
      }
      this.activeImage = this.navParams.get('activeImage');
      this.manualPageNumber = this.activeImage + 1;
    }

    try {
      this.backsides = this.navParams.get('backsides');
      if ( this.backsides === undefined ) {
        this.backsides = [];
      }
    } catch (e) {
      this.backsides = [];
    }
    // Loop through backsides array and check if backside image-files actually exist
    for (let i = 0; i < this.backsides.length; i++) {
      this.commonFunctions.urlExists(this.backsides[i]).then((res) => {
        if (res < 1) {
          this.backsides[i] = null;
        }
      });
    }
   }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FacsimileZoomPage');
  }

  ionViewDidEnter() {
    const toolbarElem = document.querySelector('.facsimile_button_group');
    this.toolbarHeight = Math.ceil(toolbarElem?.getBoundingClientRect().bottom || 0);
  }

  previous() {
    if (this.facsimilePagesInfinite) {
      console.log('Infinite, manualPageNumber = ', this.manualPageNumber);
      console.log('images.length: ', this.images.length);
      if (Number(this.manualPageNumber) > 1) {
        this.prevFacsimileUrl();
        this.manualPageNumber = Number(this.manualPageNumber) - 1;
      } else {
        this.facsNumber = this.images.length;
        this.manualPageNumber = this.images.length;
      }
      return;
    }

    this.activeImage = (this.activeImage - 1);
    this.manualPageNumber = Number(this.manualPageNumber) - 1;
    if (this.activeImage < 0) {
      this.activeImage = this.images.length - 1;
      this.manualPageNumber = this.images.length;
    }
    if ( this.manualPageNumber === 0 ) {
      this.manualPageNumber = 1;
    }
    const that = this;
    setTimeout(function () {
      const toolbarElem = document.querySelector('.facsimile_button_group');
      that.toolbarHeight = Math.ceil(toolbarElem?.getBoundingClientRect().bottom || 0);
    }.bind(this), 500);
  }

  next() {
    if (this.facsimilePagesInfinite) {
      if ( (Number(this.manualPageNumber) + 1) <= this.images.length ) {
        this.nextFacsimileUrl();
        this.manualPageNumber = Number(this.manualPageNumber) + 1;
      } else {
        this.facsNumber = 1;
        this.manualPageNumber = 1;
      }
      return;
    }

    this.activeImage = (this.activeImage + 1);
    this.manualPageNumber = Number(this.manualPageNumber) + 1;
    if (this.activeImage > this.images.length - 1) {
      this.activeImage = 0;
      this.manualPageNumber = 1;
    }
    const that = this;
    setTimeout(function () {
      const toolbarElem = document.querySelector('.facsimile_button_group');
      that.toolbarHeight = Math.ceil(toolbarElem?.getBoundingClientRect().bottom || 0);
    }.bind(this), 500);
  }

  nextFacsimileUrl() {
    this.facsNumber++;
  }

  prevFacsimileUrl() {
    if (this.facsNumber === 1) {
      return;
    }
    this.facsNumber--;
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

  resetFacsimile() {
    this.zoom = 1 + (Math.random() * (0.00001 - 0.00000001) + 0.00000001);
    this.angle = 0;
    this.prevX = 0;
    this.prevY = 0;
  }

  showAbout() {
    this.showAboutHelp = !this.showAboutHelp;
    const that = this;
    setTimeout(function () {
      const toolbarElem = document.querySelector('.facsimile_button_group');
      that.toolbarHeight = Math.ceil(toolbarElem?.getBoundingClientRect().bottom || 0);
    }.bind(this), 500);
  }

  setPage( e: any ) {
    if (this.manualPageNumber < 1) {
      this.manualPageNumber = 1;
    } else if (this.manualPageNumber > this.images.length) {
      this.manualPageNumber = this.images.length;
    }
    const pNumber: number = (this.manualPageNumber - 1);
    if (this.facsimilePagesInfinite) {
      this.facsNumber = this.manualPageNumber;
      return;
    }
    this.activeImage = pNumber;
    if (this.activeImage > this.images.length - 1) {
      this.activeImage = 0;
      this.manualPageNumber = 1;
    }
  }

  getBacksideUrl(frontsideUrl: any) {
    return frontsideUrl.replace('.jpg', 'B.jpg');
  }

  handlePanEvent(event: any) {
    const img = event.target;
    // Store latest zoom adjusted delta.
    // NOTE: img must have touch-action: none !important;
    // otherwise deltaX and deltaY will give wrong values on mobile.
    this.latestDeltaX = event.deltaX / this.zoom
    this.latestDeltaY = event.deltaY / this.zoom

    // Get current position from last position and delta.
    let x = this.prevX + this.latestDeltaX
    let y = this.prevY + this.latestDeltaY

    if (this.angle === 90) {
      const tmp = x;
      x = y;
      y = tmp;
      y = y * -1;
    } else if (this.angle === 180) {
      y = y * -1;
      x = x * -1;
    } else if (this.angle === 270) {
      const tmp = x;
      x = y;
      y = tmp;
      x = x * -1;
    }

    if (img !== null) {
      img.style.transform = 'rotate(' + this.angle + 'deg) scale(' + this.zoom + ') translate3d(' + x + 'px, ' + y + 'px, 0px)';
    }
  }

  onMouseUp(e: any) {
    // Update the previous position on desktop by adding the latest delta.
    this.prevX += this.latestDeltaX
    this.prevY += this.latestDeltaY
  }

  onMouseWheel(e: any) {
    const img = e.target;
    if (e.deltaY > 0) {
      this.zoomIn();
      img.style.transform = 'rotate(' + this.angle + 'deg) scale(' + this.zoom + ') translate3d(' + this.prevX + 'px, ' +
        this.prevY + 'px, 0px)';
    } else {
      this.zoomOut();
      img.style.transform = 'rotate(' + this.angle + 'deg) scale(' + this.zoom + ') translate3d(' + this.prevX + 'px, ' +
        this.prevY + 'px, 0px)';
    }
  }
}
