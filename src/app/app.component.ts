import { Component } from '@angular/core';
import { NavigationEnd, Params, PRIMARY_OUTLET, Router, UrlSegment, UrlTree } from "@angular/router";
import { filter } from "rxjs/operators";

@Component({
  selector: 'ion-app-v2',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class DigitalEditionsApp {

  showSideMenu: boolean = true;
  showCollectionSideMenu: boolean = false;
  collectionID: string = '';
  initialUrlSegments: UrlSegment[];
  initialQueryParams: Params;
  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe({
      next: (event: any) => {
        const collectionSegment = '/publication/';
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
      }
    });
  }

  toggleSideMenu() {
    this.showSideMenu = !this.showSideMenu
  }
}
