import { Component, Inject, LOCALE_ID } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';
import { config } from "src/app/services/config/config";


/**
 * Popover with list of available user settings.
 * Settings: view mode, language.
 */
@Component({
  selector: 'user-settings-popover-page',
  templateUrl: 'user-settings-popover.html',
  styleUrls: ['user-settings-popover.scss']
})
export class UserSettingsPopoverPage {

  enableLanguageChanges = true;
  locales: Array<string>;

  constructor(
    public viewCtrl: PopoverController,
    public userSettingsService: UserSettingsService,
    @Inject(LOCALE_ID) public activeLocale: string
  ) {
    this.enableLanguageChanges = config.app?.i18n?.enableLanguageChanges ?? true;

    const languages = config.app?.i18n?.languages ?? [];
    languages.forEach((languageObj: any) => {
      if (languageObj.code === LOCALE_ID) {
        this.locales.push(languageObj.label + ' (' + languageObj.code + ')');
      }
    });
  }

  close() {
    this.viewCtrl.dismiss();
  }

}
