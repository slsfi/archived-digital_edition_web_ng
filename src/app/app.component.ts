import { Component } from '@angular/core';
import { NavigationEnd, Params, PRIMARY_OUTLET, Router, UrlSegment, UrlTree } from "@angular/router";
import { filter } from "rxjs/operators";
import { Title } from "@angular/platform-browser";
import { CommonFunctionsService } from "./services/common-functions/common-functions.service";


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class DigitalEditionsApp {
  showSideMenu: boolean = false;
  showCollectionSideMenu: boolean = false;
  collectionID: string = '';
  initialUrlSegments: UrlSegment[];
  initialQueryParams: Params;
  currentRouterUrl: string = '';

  constructor(
    private router: Router,
    private title: Title,
    private commonFunctions: CommonFunctionsService
  ) {}

  ngOnInit() {
    this.title.setTitle($localize`:@@Site.Title:Webbplatsens titel`);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe({
      next: (event: any) => {
        this.currentRouterUrl = event.url;
        const collectionSegment = '/collection/';
        if (event.url.startsWith(collectionSegment)) {
          this.collectionID = event.url.slice(collectionSegment.length).split('/')[0] || '';

          // Parse the current url to get route params and queryParams
          // From params we need find out if we are on a cover, title,
          // foreword, introduction or read page (= has /text/ in the url after
          // collectionID). THis information has to be passed to <collection-side-menu>.
          // If we are on a read page we need to get the publicationID and
          // possible chapterID and position (position from queryParams)
          // and also pass this information to <collection-side-menu>.
          const currentUrlTree: UrlTree = this.router.parseUrl(event.url);
          this.initialQueryParams = currentUrlTree.queryParams;
          this.initialUrlSegments = currentUrlTree.root.children[PRIMARY_OUTLET].segments;
          this.showCollectionSideMenu = true;
        } else {
          this.showCollectionSideMenu = false;
        }
        this.setTitleForDefaultPages();
      }
    });
  }

  toggleSideMenu() {
    this.showSideMenu = !this.showSideMenu
  }
  setTitleForDefaultPages() {
    const pageTitle = this.router.url.split('/').slice(-1).join();
    switch (pageTitle) {
      case 'person-search':
        this.commonFunctions.setTitle($localize`:@@TOC.PersonSearch:Personregister`, 1);
        return;
      case 'places':
        this.commonFunctions.setTitle($localize`:@@TOC.PlaceSearch:Ortregister`, 1);
        return;
      case 'tags':
        this.commonFunctions.setTitle($localize`:@@TOC.TagSearch:Ämnesord`, 1);
        return;
      case 'works':
        this.commonFunctions.setTitle($localize`:@@TOC.WorkSearch:Verkregister`, 1);
        return;
      default:
        !pageTitle && this.commonFunctions.setTitle($localize`:@@TOC.Home:Hem`, 1);
        return;
    }
  }
}
