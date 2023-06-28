import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Params, PRIMARY_OUTLET, Router, UrlSegment, UrlTree } from "@angular/router";
import { filter } from "rxjs/operators";
import { CommonFunctionsService } from "./services/common-functions.service";
import { UserSettingsService } from './services/user-settings.service';
import { isBrowser } from 'src/standalone/utility-functions';
import { config } from 'src/assets/config/config';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class DigitalEditionsApp implements OnInit {
  appIsStarting: boolean = true;
  collectionID: string = '';
  collectionSideMenuInitialUrlSegments: UrlSegment[];
  collectionSideMenuInitialQueryParams: Params;
  currentRouterUrl: string = '';
  currentUrlSegments: UrlSegment[] = [];
  enableRouterLoadingBar: boolean = false;
  loadingBarHidden: boolean = false;
  mountMainSideMenu: boolean = false;
  previousRouterUrl: string = '';
  showCollectionSideMenu: boolean = false;
  showSideNav: boolean = false;

  constructor(
    private router: Router,
    private commonFunctions: CommonFunctionsService,
    private userSettingsService: UserSettingsService
  ) {
    // Side menu is shown by default in desktop mode but not in mobile mode.
    this.userSettingsService.isDesktop() ? this.showSideNav = true : this.showSideNav = false;

    this.enableRouterLoadingBar = config.app?.enableRouterLoadingBar ?? false;
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe({
      next: (event: any) => {
        this.previousRouterUrl = this.currentRouterUrl;
        this.currentRouterUrl = event.url;
        const currentUrlTree: UrlTree = this.router.parseUrl(event.url);
        this.currentUrlSegments = currentUrlTree?.root?.children[PRIMARY_OUTLET]?.segments;

        // Check if a collection-page in order to show collection side menu instead of main side menu.
        if (this.currentUrlSegments && this.currentUrlSegments[0]?.path === 'collection') {
          this.collectionID = this.currentUrlSegments[1]?.path || '';
          this.collectionSideMenuInitialUrlSegments = this.currentUrlSegments;
          this.collectionSideMenuInitialQueryParams = currentUrlTree?.queryParams;
          this.showCollectionSideMenu = true;
        } else {
          // If the app is started on a collection-page the main side menu is not immediately
          // created in order to increase performance. Once the user leaves the collection-pages
          // the side menu gets created and stays mounted. It is hidden with css if the user
          // visits a collection-page and the collection side menu is displayed.
          this.mountMainSideMenu = true;
          this.showCollectionSideMenu = false;
        }

        // Hide side menu:
        // 1. After navigation event in mobile mode if navigating to a new url (queryParams not taken into account).
        // 2. App is starting on the home page in desktop mode.
        if (
          (
            this.userSettingsService.isMobile() &&
            this.currentRouterUrl.split('?')[0] !== this.previousRouterUrl.split('?')[0]
          ) ||
          (
            this.appIsStarting &&
            !this.currentUrlSegments &&
            this.userSettingsService.isDesktop()
          )
        ) {
          this.showSideNav = false;
        }

        if (this.appIsStarting) {
          this.appIsStarting = false;
        }

        this.setTitleForTopMenuPages(this.currentUrlSegments && this.currentUrlSegments[0]?.path || '');
      }
    });
  }

  toggleSideNav() {
    this.showSideNav = !this.showSideNav;
  }

  private setTitleForTopMenuPages(routeBasePath?: string) {
    switch (routeBasePath) {
      case 'content':
        this.commonFunctions.setTitle([$localize`:@@TopMenu.Content:Innehåll`]);
        return;
      case 'search':
        this.commonFunctions.setTitle([$localize`:@@TopMenu.Search:Sök`]);
        return;
      default:
        !routeBasePath && this.commonFunctions.setTitle([$localize`:@@TOC.Home:Hem`]);
        return;
    }
  }

  hideLoadingBar(hide: boolean): void {
    if (hide && isBrowser()) {
      setTimeout(() => {
        this.loadingBarHidden = hide;
      }, 700);
    } else {
      this.loadingBarHidden = hide;
    }
  }

}
