import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Params, PRIMARY_OUTLET, Router, UrlSegment, UrlTree } from "@angular/router";
import { filter } from "rxjs/operators";
import { Title } from "@angular/platform-browser";
import { CommonFunctionsService } from "./services/common-functions/common-functions.service";
import { UserSettingsService } from './services/settings/user-settings.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class DigitalEditionsApp implements OnInit {
  collectionID: string = '';
  collectionSideMenuInitialUrlSegments: UrlSegment[];
  collectionSideMenuInitialQueryParams: Params;
  currentRouterUrl: string = '';
  mountMainSideMenu: boolean = false;
  previousRouterUrl: string = '';
  showCollectionSideMenu: boolean = false;
  showSideNav: boolean = false;

  constructor(
    private router: Router,
    private title: Title,
    private commonFunctions: CommonFunctionsService,
    private userSettingsService: UserSettingsService
  ) {}

  ngOnInit() {
    this.title.setTitle($localize`:@@Site.Title:Webbplatsens titel`);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe({
      next: (event: any) => {
        this.previousRouterUrl = this.currentRouterUrl;
        this.currentRouterUrl = event.url;
        const currentUrlTree: UrlTree = this.router.parseUrl(event.url);
        const currentUrlSegments: UrlSegment[] = currentUrlTree?.root?.children[PRIMARY_OUTLET]?.segments;

        // Check if a collection-page in order to show collection side menu instead of
        // main side menu.
        if (currentUrlSegments && currentUrlSegments[0]?.path === 'collection') {
          this.collectionID = currentUrlSegments[1]?.path || '';
          this.collectionSideMenuInitialUrlSegments = currentUrlSegments;
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

        // Hide side menu after navigation event in mobile mode if navigating to a new url
        // (queryParams not taken into account).
        if (
          this.userSettingsService.isMobile() &&
          this.currentRouterUrl.split('?')[0] !== this.previousRouterUrl.split('?')[0]
        ) {
          this.showSideNav = false;
        }

        this.setTitleForDefaultPages(currentUrlSegments && currentUrlSegments[0]?.path || '');
      }
    });
  }

  toggleSideNav() {
    this.showSideNav = !this.showSideNav;
  }

  setTitleForDefaultPages(routeBasePath?: string) {
    switch (routeBasePath) {
      case 'content':
        this.commonFunctions.setTitle($localize`:@@TopMenu.Content:Innehåll`, 1);
        return;
      case 'keywords':
          this.commonFunctions.setTitle($localize`:@@TOC.TagSearch:Ämnesord`, 1);
          return;
      case 'persons':
        this.commonFunctions.setTitle($localize`:@@TOC.PersonSearch:Personregister`, 1);
        return;
      case 'places':
        this.commonFunctions.setTitle($localize`:@@TOC.PlaceSearch:Ortregister`, 1);
        return;
      case 'search':
          this.commonFunctions.setTitle($localize`:@@TopMenu.Search:Sök`, 1);
          return;
      case 'works':
        this.commonFunctions.setTitle($localize`:@@TOC.WorkSearch:Verkregister`, 1);
        return;
      default:
        !routeBasePath && this.commonFunctions.setTitle($localize`:@@TOC.Home:Hem`, 1);
        return;
    }
  }

}
