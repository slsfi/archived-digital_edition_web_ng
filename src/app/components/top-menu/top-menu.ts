import { Component, EventEmitter, Inject, Input, LOCALE_ID, Output } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { ModalController } from '@ionic/angular';
import { ReferenceDataModalPage } from 'src/app/modals/reference-data-modal/reference-data-modal';
import { config } from "src/assets/config/config";
import { isBrowser } from 'src/standalone/utility-functions';


@Component({
  selector: 'top-menu',
  templateUrl: 'top-menu.html',
  styleUrls: ['top-menu.scss']
})
export class TopMenuComponent {
  @Input() showSideMenu: boolean = false;
  @Input() currentRouterUrl: string = '';
  @Output() sideMenuClick = new EventEmitter();

  public showLanguageButton: boolean;
  public showTopURNButton: boolean;
  public showTopSearchButton: boolean;
  public showTopContentButton: boolean;
  public showTopAboutButton: boolean;
  public showSiteLogo: boolean;
  public siteLogoLinkUrl: string;
  public siteLogoDefaultImageUrl: string;
  public siteLogoMobileImageUrl: string;
  public currentLanguageLabel: string = '';
  public languages: {
    code: string;
    label: string
  }[]= [];
  public languageMenuOpen: boolean = false;
  languageMenuWidth: number | null;
  firstAboutPageId = '';
  handleLanguageMenuClosure: any = null;
  _window: Window;

  constructor(
    private modalController: ModalController,
    @Inject(LOCALE_ID) public activeLocale: string,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    this._window = <any>this.document.defaultView;
    this.showLanguageButton = config.component?.topMenu?.showLanguageButton ?? true;
    this.showTopURNButton = config.component?.topMenu?.showURNButton ?? true;
    this.showTopSearchButton = config.component?.topMenu?.showElasticSearchButton ?? true;
    this.showTopContentButton = config.component?.topMenu?.showContentButton ?? true;
    this.showTopAboutButton = config.component?.topMenu?.showAboutButton ?? true;
    this.showSiteLogo = config.component?.topMenu?.showSiteLogo ?? false;

    this.siteLogoLinkUrl = config.component?.topMenu?.siteLogoLinkUrl ?? 'https://www.sls.fi/';
    this.siteLogoDefaultImageUrl = config.component?.topMenu?.siteLogoDefaultImageUrl ?? 'assets/images/logo.svg';
    this.siteLogoMobileImageUrl = config.component?.topMenu?.siteLogoMobileImageUrl ?? 'assets/images/logo-mobile.svg';

    if (!this.siteLogoMobileImageUrl && this.siteLogoDefaultImageUrl) {
      this.siteLogoMobileImageUrl = this.siteLogoDefaultImageUrl;
    }

    const aboutPagesFolderNumber = config.page?.about?.markdownFolderNumber ?? '03';
    const initialAboutPageNode = config.page?.about?.initialPageNode ?? '01';
    this.firstAboutPageId = aboutPagesFolderNumber + "-" + initialAboutPageNode;

    this.languages = config.app?.i18n?.languages ?? [];
    this.languages.forEach((languageObj: any) => {
      if (languageObj.code === this.activeLocale) {
        this.currentLanguageLabel = languageObj.label;
      }
    });
    this.languageMenuWidth = null;
  }

  ngOnDestroy() {
    if (this.handleLanguageMenuClosure) {
      window.removeEventListener('click', this.handleLanguageMenuClosure, false);
      window.removeEventListener('focusin', this.handleLanguageMenuClosure, false);
    }
  }

  public toggleSideMenu(event: any) {
    event.preventDefault();
    this.sideMenuClick.emit();
  }

  public toggleLanguageMenu(event: any) {
    event.stopPropagation();

    if (!this.languageMenuOpen) {
      // Set width of the language menu to the width of the toggle button
      const languageToggleButtonElem = this.document.getElementById('language-menu-toggle-button');
      if (languageToggleButtonElem && languageToggleButtonElem.offsetWidth > 100) {
        this.languageMenuWidth = languageToggleButtonElem.offsetWidth;
      } else {
        this.languageMenuWidth = null;
      }

      // Open language menu
      this.languageMenuOpen = true;

      // Add event listeners so the language menu can be closed by clicking or moving focus outside it
      if (isBrowser() && !this.handleLanguageMenuClosure) {
        const languageMenuElem = this.document.getElementById('language-menu');
        if (languageMenuElem) {
          this.handleLanguageMenuClosure = (event: any) => !languageMenuElem.contains(event.target) && this.hideLanguageMenu();
          window.addEventListener('click', this.handleLanguageMenuClosure, { passive: true });
          window.addEventListener('focusin', this.handleLanguageMenuClosure, { passive: true });
        }
      }
    } else {
      // Close language menu
      this.languageMenuOpen = false;
    }
  }

  private hideLanguageMenu() {
    if (this.languageMenuOpen) {
      this.languageMenuOpen = false;
    }
  }

  public async showReference(event: any) {
    event.preventDefault();
    // Get URL of Page and then the URI
    const modal = await this.modalController.create({
      component: ReferenceDataModalPage,
      id: this.document.URL,
      componentProps: {
        type: 'reference',
        origin: 'top-menu',
      }
    });
    return await modal.present();
  }

}
