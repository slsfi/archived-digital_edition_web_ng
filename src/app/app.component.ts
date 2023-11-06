import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Params, PRIMARY_OUTLET, Router, UrlSegment, UrlTree } from '@angular/router';
import { filter, Subscription } from 'rxjs';

import { config } from '@config';
import { DocumentHeadService } from '@services/document-head.service';
import { PlatformService } from '@services/platform.service';
import { isBrowser } from '@utility-functions';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class DigitalEditionsApp implements OnDestroy, OnInit {
  appIsStarting: boolean = true;
  collectionID: string = '';
  collectionSideMenuInitialUrlSegments: UrlSegment[];
  collectionSideMenuInitialQueryParams: Params;
  currentRouterUrl: string = '';
  currentUrlSegments: UrlSegment[] = [];
  enableRouterLoadingBar: boolean = false;
  loadingBarHidden: boolean = false;
  mobileMode: boolean = true;
  mountMainSideMenu: boolean = false;
  previousRouterUrl: string = '';
  routerEventsSubscription: Subscription;
  showCollectionSideMenu: boolean = false;
  showSideNav: boolean = false;

  constructor(
    private headService: DocumentHeadService,
    private platformService: PlatformService,
    private router: Router
  ) {
    this.enableRouterLoadingBar = config.app?.enableRouterLoadingBar ?? false;
  }

  ngOnInit(): void {
    this.mobileMode = this.platformService.isMobile() ? true : false;
    // Side menu is shown by default in desktop mode but not in mobile mode.
    this.showSideNav = !this.mobileMode;

    this.routerEventsSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.previousRouterUrl = this.currentRouterUrl;
      this.currentRouterUrl = event.url;
      const currentUrlTree: UrlTree = this.router.parseUrl(event.url);
      this.currentUrlSegments = currentUrlTree?.root?.children[PRIMARY_OUTLET]?.segments;

      // Check if a collection-page in order to show collection side menu instead of main side menu.
      if (this.currentUrlSegments?.[0]?.path === 'collection') {
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
          this.platformService.isMobile() &&
          this.currentRouterUrl.split('?')[0] !== this.previousRouterUrl.split('?')[0]
        ) ||
        (
          this.appIsStarting &&
          !this.currentUrlSegments &&
          this.platformService.isDesktop()
        )
      ) {
        this.showSideNav = false;
      }

      if (this.appIsStarting) {
        this.appIsStarting = false;
      }

      this.setTitleForTopMenuPages(this.currentUrlSegments?.[0]?.path || '');

      this.currentRouterUrl === '/' && this.headService.setMetaProperty('description', $localize`:@@Site.MetaDescription.Home:En generell beskrivning av webbplatsen för sökmotorer.`);
      this.currentRouterUrl !== '/' && this.headService.setMetaProperty('description', '');

      this.headService.setLinks(this.currentRouterUrl);
    });
  }

  ngOnDestroy(): void {
    this.routerEventsSubscription?.unsubscribe();
  }

  toggleSideNav() {
    this.showSideNav = !this.showSideNav;
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

  private setTitleForTopMenuPages(routeBasePath?: string) {
    switch (routeBasePath) {
      case 'content':
        this.headService.setTitle([$localize`:@@TopMenu.Content:Innehåll`]);
        return;
      case 'search':
        this.headService.setTitle([$localize`:@@TopMenu.Search:Sök`]);
        return;
      default:
        !routeBasePath && this.headService.setTitle();
        return;
    }
  }

}
