import { Component, Input, Inject, EventEmitter, LOCALE_ID, Output } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { ReferenceDataModalPage } from 'src/app/modals/reference-data-modal/reference-data-modal';
import { SearchAppPage } from 'src/app/modals/search-app/search-app';
import { UserSettingsPopoverPage } from 'src/app/modals/user-settings-popover/user-settings-popover';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';
import { config } from "src/app/services/config/config";


@Component({
  selector: 'top-menu',
  templateUrl: 'top-menu.html',
  styleUrls: ['top-menu.scss']
})
export class TopMenuComponent {
  @Input() splitPaneMobile?: boolean;
  @Input() showSideMenu: boolean;
  @Output() hamburgerMenuClick = new EventEmitter();

  public showViewToggle: boolean;
  public showTopURNButton: boolean;
  public showTopElasticButton: boolean;
  public showTopSimpleSearchButton: boolean;
  public showTopContentButton: boolean;
  public showTopAboutButton: boolean;
  firstAboutPageId = '';

  constructor(
    private popoverCtrl: PopoverController,
    public userSettingsService: UserSettingsService,
    private modalController: ModalController,
    @Inject(LOCALE_ID) public activeLocale: string
  ) {
    this.showViewToggle = config.component?.topMenu?.showLanguageButton ?? true;
    this.showTopURNButton = config.component?.topMenu?.showURNButton ?? true;
    this.showTopElasticButton = config.component?.topMenu?.showElasticSearchButton ?? true;
    this.showTopSimpleSearchButton = config.component?.topMenu?.showSimpleSearchButton ?? true;
    this.showTopContentButton = config.component?.topMenu?.showContentButton ?? true;
    this.showTopAboutButton = config.component?.topMenu?.showAboutButton ?? true;

    const aboutPagesFolderNumber = config.page?.about?.markdownFolderNumber ?? '03';
    const initialAboutPageNode = config.page?.about?.initialPageNode ?? '01';
    this.firstAboutPageId = aboutPagesFolderNumber + "-" + initialAboutPageNode;
  }

  async searchApp() {
    const modal = await this.modalController.create({
      component: SearchAppPage,
      cssClass: 'foo',
      componentProps: {
        'data': true,
      }
    });
    return await modal.present();
  }

  public toggleSplitPane() {
    this.hamburgerMenuClick.emit();
  }

  public async showUserSettingsPopover(event: any) {
    const popover = await this.popoverCtrl.create({
      component: UserSettingsPopoverPage,
    });
    return await popover.present(event);
  }

  public async showReference(event: any) {
    // Get URL of Page and then the URI
    const modal = await this.modalController.create({
      component: ReferenceDataModalPage,
      id: document.URL,
      componentProps: {
        type: 'reference',
        origin: 'top-menu',
      }
    });
    return await modal.present();
  }

}
