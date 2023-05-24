import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';


@Injectable()
export class UserSettingsService {
  private _mode: string = 'desktop'; // mode is either desktop or mobile

  constructor(
    private platform: Platform
  ) {
    this.detectPlatform();
  }

  detectPlatform() {
    try {
      if (this.platform.is('mobile') || this.platform.is('tablet')) {
        this._mode = 'mobile';
      } else {
        this._mode = 'desktop';
      }
    } catch (e) {
      this._mode = 'desktop';
    }
  }

  isMobile() {
    return this._mode === 'mobile';
  }

  isDesktop() {
    return this._mode === 'desktop';
  }

}
