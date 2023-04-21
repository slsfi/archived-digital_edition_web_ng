import { Component, Input, Inject, EventEmitter, LOCALE_ID, Output, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ReferenceDataModalPage } from 'src/app/modals/reference-data-modal/reference-data-modal';
import { config } from "src/assets/config/config";
import { Router } from "@angular/router";
import { DOCUMENT } from "@angular/common";


@Component({
  selector: 'top-menu',
  templateUrl: 'top-menu.html',
  styleUrls: ['top-menu.scss']
})
export class TopMenuComponent implements OnInit{
  @Input() splitPaneMobile?: boolean;
  @Input() showSideMenu: boolean;
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
  firstAboutPageId = '';
  _window: Window;

  constructor(
    private modalController: ModalController,
    private router: Router,
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
  }

  public toggleSideMenu(event: any) {
    event.preventDefault();
    this.sideMenuClick.emit();
  }

  public toggleLanguageMenu(event: FocusEvent) {
    if(!event.relatedTarget || !(event.currentTarget as Node).contains(event.relatedTarget as Node))
      this.languageMenuOpen = !this.languageMenuOpen;
  }

  public async showReference(event: any) {
    event.preventDefault();
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
